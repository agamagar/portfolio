# Noir fitting worker: the fitted clay head (FACE.blend, as build_head.py made it) with the
# parametric fedora (noirhat.py) in place of the stock one, the hair pressed under it, seen
# from a candidate camera; rendered as flat part ids with Workbench.
#   Blender -b FACE.blend -P noirworker.py -- OUTDIR WORKER_ID W H CLAY_PARAMS.json
# then one JSON params object per line on stdin (camera + hat keys); prints "RES {json}".
import bpy, sys, os, json
import numpy as np
from mathutils import Vector
from bpy_extras.object_utils import world_to_camera_view

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
sys.path.insert(0, os.path.join(HERE, "..", "fit"))
sys.path.insert(0, os.path.join(HERE, ".."))  # (in the repo, fit/noir sits inside fit/)
from fitcam import fitted_camera
from noirhat import HAT_DEFAULTS, hat_geo, press_hair, make_or_update

argv = sys.argv[sys.argv.index("--") + 1:]
OUT, WID, W, H = argv[0], argv[1], int(argv[2]), int(argv[3])
CLAY = json.load(open(argv[4]))
sc = bpy.context.scene

# the mouth corners (the ends of the smile), before the mouth mesh goes
_m = bpy.data.objects["Mouth"]
_mv = [_m.matrix_world @ v.co for v in _m.data.vertices]
MOUTH = {"mL": min(_mv, key=lambda v: v.x).copy(), "mR": max(_mv, key=lambda v: v.x).copy()}
for n in ("Pin", "Mouth", "MouthInner", "Hat", "HatBand"):
    o = bpy.data.objects.get(n)
    if o:
        bpy.data.objects.remove(o, do_unlink=True)
hair = bpy.data.objects["Hair"]
hair.shape_key_clear()
HB = np.zeros(len(hair.data.vertices) * 3, np.float32)
hair.data.vertices.foreach_get("co", HB)
HB = HB.reshape(-1, 3).astype(float)
mw_h = np.array(hair.matrix_world)

COL = {"Hair": (0, 1, 0, 1), "EyeL": (0, 0, 1, 1), "EyeR": (0, 0, 1, 1), "BrowL": (1, 1, 0, 1), "BrowR": (1, 1, 0, 1),
       "Hat": (1, 0, 1, 1), "HatBand": (1, 0, 1, 1)}
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

mouth_x = None


def marks(P):
    m = {}
    for n in ("EyeL", "EyeR"):
        m[n] = bpy.data.objects[n].matrix_world.translation.copy()
    m["nose"] = Vector((P["nose_x"], P["nose_ty"] - P["nose_r1"] * 0.6, P["nose_tz"] + 0.04))
    m["ear"] = Vector((-(P["ear_x"] + P["ear_flare"] * 0.2), P["ear_yc"] + 0.06, P["ear_zc"]))
    m.update(MOUTH)
    return m



for line in sys.stdin:
    line = line.strip()
    if not line:
        continue
    try:
        Q = json.loads(line)
        P = dict(CLAY); P.update(HAT_DEFAULTS); P.update(Q)
        hv, hf, bv, bf = hat_geo(P)
        hat = make_or_update(bpy, "Hat", hv, hf)
        band = make_or_update(bpy, "HatBand", bv, bf)
        # hair pressed under this hat (hair space = head space: Hair sits at the origin)
        hc = press_hair((np.c_[HB, np.ones(len(HB))] @ mw_h.T)[:, :3], P)
        hc = (np.c_[hc, np.ones(len(hc))] @ np.linalg.inv(mw_h).T)[:, :3]
        hair.data.vertices.foreach_set("co", hc.astype(np.float32).ravel())
        hair.data.update()
        for o in sc.objects:
            if o.type == "MESH":
                o.color = COL.get(o.name, (1, 0, 0, 1))
        cam = fitted_camera(bpy, P)
        bpy.context.view_layer.update()
        out = os.path.join(OUT, f"w{WID}.png")
        sc.render.filepath = out
        bpy.ops.render.render(write_still=True)
        proj = {}
        for k, v in marks(P).items():
            c = world_to_camera_view(sc, cam, v)
            proj[k] = (c.x, 1 - c.y)
        print("RES " + json.dumps({"png": out, "marks": proj}), flush=True)
    except Exception as e:
        import traceback
        traceback.print_exc()
        print("RES " + json.dumps({"error": repr(e)}), flush=True)
