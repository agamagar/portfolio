# After the warp: drop the fedora's faces that the fitted camera sees over open background
# (the far brim the tile doesn't show). Thin geometry there can't be warped in, and from the
# fitted view it would draw a sliver of hat over the rain.
#   Blender -b IN.blend -P noirtrim.py -- PARAMS.json KEEP.npy OUT.blend
# KEEP.npy: anything but open background, grown 3 px (segnoir.py writes it)
import bpy, bmesh, sys, os, json
import numpy as np
from bpy_extras.object_utils import world_to_camera_view
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(HERE, "..", "fit"))
sys.path.insert(0, os.path.join(HERE, ".."))  # (in the repo, fit/noir sits inside fit/)
from fitcam import fitted_camera
argv = sys.argv[sys.argv.index("--") + 1:]
P = json.load(open(argv[0])); keep = np.load(argv[1]); H, W = keep.shape
sc = bpy.context.scene
sc.render.resolution_x, sc.render.resolution_y, sc.render.resolution_percentage = W, H, 100
cam = fitted_camera(bpy, P)
for name in ("Hat", "HatBand"):
    o = bpy.data.objects[name]
    bm = bmesh.new(); bm.from_mesh(o.data)
    mw = o.matrix_world
    dead = []
    for f in bm.faces:
        c = world_to_camera_view(sc, cam, mw @ f.calc_center_median())
        x, y = int(c.x * W), int((1 - c.y) * H)
        if 0 <= x < W and 0 <= y < H and not keep[y, x] and c.z > 0:
            dead.append(f)
    bmesh.ops.delete(bm, geom=dead, context="FACES")
    bm.to_mesh(o.data); bm.free(); o.data.update()
    print("TRIM", name, len(dead), "faces dropped")
bpy.ops.wm.save_as_mainfile(filepath=argv[2])
