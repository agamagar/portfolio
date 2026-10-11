# The 2.5D warp: render our part IDs from the fitted camera, find where each feature sits in
# the reference (optical flow between the two part maps), and slide every vertex in the
# camera plane to match. Iterates; each pass re-renders.
#   Blender -b face.blend -P warp.py -- PARAMS.json REF_PARTS_FULL.npy OUT.blend ITERATIONS
import bpy, sys, os, math, json, subprocess
import numpy as np
from mathutils import Vector
from bpy_extras.object_utils import world_to_camera_view

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
sys.path.insert(0, os.path.join(HERE, '..', 'fit'))
sys.path.insert(0, os.path.join(HERE, '..'))  # (in the repo, fit/noir sits inside fit/)
from fitcam import fitted_camera

argv = sys.argv[sys.argv.index("--") + 1:]
P = json.load(open(argv[0]))
REF = np.load(argv[1])
OUTB = argv[2]
ITERS = int(argv[3]) if len(argv) > 3 else 3
H, W = REF.shape
sc = bpy.context.scene
cam = fitted_camera(bpy, P)

IDS = {"Hair": 2, "EyeL": 3, "EyeR": 3, "BrowL": 4, "BrowR": 4, "Hat": 5, "HatBand": 5}
HIDE = ("Pin", "Mouth", "MouthInner")
COL = {1: (1, 0, 0, 1), 2: (0, 1, 0, 1), 3: (0, 0, 1, 1), 4: (1, 1, 0, 1), 5: (1, 0, 1, 1)}
meshes = [o for o in sc.objects if o.type == "MESH" and o.name not in ("Pin",)]
for o in sc.objects:
    if o.type == "MESH":
        o.hide_render = o.name in HIDE
        o.color = COL[IDS.get(o.name, 1)]
for o in meshes:
    if o.data.shape_keys:
        for kb in o.data.shape_keys.key_blocks[1:]:
            kb.value = 0.0

sc.render.engine = "BLENDER_WORKBENCH"
sc.display.shading.light = "FLAT"
sc.display.shading.color_type = "OBJECT"
sc.display.render_aa = "OFF"
sc.view_settings.view_transform = "Standard"
sc.render.film_transparent = True
sc.render.resolution_x, sc.render.resolution_y = W, H
sc.render.resolution_percentage = 100
sc.render.image_settings.file_format = "PNG"
sc.render.image_settings.color_mode = "RGBA"


def render_ids(path):
    sc.render.filepath = path
    bpy.ops.render.render(write_still=True)
    img = bpy.data.images.load(path)
    A = np.array(img.pixels[:], dtype=np.float32).reshape(H, W, 4)[::-1]
    bpy.data.images.remove(img)
    fg = A[..., 3] > 0.5
    r, g, b = A[..., 0] > 0.5, A[..., 1] > 0.5, A[..., 2] > 0.5
    ids = np.zeros((H, W), np.uint8)
    ids[fg] = 1
    ids[fg & g & ~r] = 2
    ids[fg & b & ~r & ~g] = 3
    ids[fg & r & b & ~g] = 5
    ids[fg & r & g] = 4
    return ids


def iou(a, b):
    return (a & b).sum() / max(1, (a | b).sum())


COAT = REF == 6


def report(ids, tag):
    R = REF.copy(); R[COAT] = ids[COAT]
    r = {k: round(float(iou(ids == v, R == v)), 4) for k, v in (("skin", 1), ("hair", 2), ("eye", 3), ("brow", 4), ("hat", 5))}
    r["fg"] = round(float(iou(ids > 0, R > 0)), 4)
    r["pixels_wrong_pct"] = round(float((ids != R).mean() * 100), 3)
    print("WARP", tag, json.dumps(r), flush=True)
    return r


# flow is computed outside Blender's python (scikit-image lives in the system python)
FLOW = os.path.join(HERE, "noirflow.py")
for it in range(ITERS + 1):
    ids = render_ids(os.path.join(HERE, f"warp_ids_{it}.png"))
    np.save(os.path.join(HERE, "ours_ids.npy"), ids)
    report(ids, f"iter{it}")
    if it == ITERS:
        break
    # coarse to fine: smooth fields first (no tearing), then finer ones for the last pixels
    sm = 4.0 if it < 3 else 2.5 if it < 5 else 1.5
    subprocess.run(["/opt/anaconda3/bin/python3", FLOW, os.path.join(HERE, "ours_ids.npy"), os.path.abspath(argv[1]), os.path.join(HERE, "flow.npy"), str(sm)], check=True)
    flow = np.load(os.path.join(HERE, "flow.npy"))  # (2, H, W): where a feature at (y, x) in ours sits in the reference
    # world size of one pixel at unit distance, for turning a pixel shift into a world shift
    fov = cam.data.angle_y
    px_world = 2 * math.tan(fov / 2) / H
    right = cam.matrix_world.to_3x3() @ Vector((1, 0, 0))
    up = cam.matrix_world.to_3x3() @ Vector((0, 1, 0))
    fwd = cam.matrix_world.to_3x3() @ Vector((0, 0, -1))
    for o in meshes:
        mw = o.matrix_world
        mwi = mw.inverted()
        blocks = [kb.data for kb in o.data.shape_keys.key_blocks] if o.data.shape_keys else [o.data.vertices]
        base = [v.co.copy() for v in (o.data.shape_keys.key_blocks[0].data if o.data.shape_keys else o.data.vertices)]
        shifts = []
        for co in base:
            wpos = mw @ co
            c = world_to_camera_view(sc, cam, wpos)
            x, y = c.x * W, (1 - c.y) * H
            xi, yi = int(min(W - 1, max(0, x))), int(min(H - 1, max(0, y)))
            dy, dx = flow[0, yi, xi], flow[1, yi, xi]
            depth = (wpos - cam.matrix_world.translation).dot(fwd)
            s = px_world * depth
            shifts.append(mwi.to_3x3() @ (right * dx * s - up * dy * s))
        for data in blocks:
            for d, sh in zip(data, shifts):
                d.co = d.co + sh
        if o.data.shape_keys:  # keep the mesh's own coords in step with the basis
            for v, d in zip(o.data.vertices, o.data.shape_keys.key_blocks[0].data):
                v.co = d.co
        o.data.update()
    bpy.context.view_layer.update()
bpy.ops.wm.save_as_mainfile(filepath=OUTB)
print("WARP SAVED", OUTB)
