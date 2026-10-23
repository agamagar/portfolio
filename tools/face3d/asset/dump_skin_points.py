# dump_skin_points.py : the fitted model's skin (face.glb's source: face.blend Skin, ears included) as a dense point cloud, so the procedural head can be
# fitted to its TRUE multi-angle silhouettes (the model was itself fitted to the same character as the reference, so it holds the depth the sheet lacks).
import bpy, numpy as np, sys
out = sys.argv[sys.argv.index("--") + 1]
o = bpy.data.objects["Skin"]; me = o.data
v = np.array([(o.matrix_world @ x.co)[:] for x in me.vertices], np.float32)
# densify: add face centres
c = np.array([(o.matrix_world @ p.center)[:] for p in me.polygons], np.float32)
np.save(out, np.concatenate([v, c]))
print("points", len(v) + len(c))
