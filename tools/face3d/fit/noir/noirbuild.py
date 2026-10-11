# The noir head: the fitted clay build with the fitted fedora in place of the stock one and
# the hair pressed under it for good (the noir rig always wears the hat).
#   Blender -b base/face.blend -P noirbuild.py -- FIT.json OUT.blend OUT_PARAMS.json
import bpy, sys, os, json
import numpy as np
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
from noirhat import HAT_DEFAULTS, hat_geo, press_hair, make_or_update
argv = sys.argv[sys.argv.index("--") + 1:]
P = json.load(open(os.path.join(HERE, "base", "fit_params.json")))
P.update(HAT_DEFAULTS); P.update(json.load(open(argv[0])))
for n in ("Hat", "HatBand", "Pin"):
    o = bpy.data.objects.get(n)
    if o:
        bpy.data.objects.remove(o, do_unlink=True)
hair = bpy.data.objects["Hair"]
hair.shape_key_clear()
co = np.zeros(len(hair.data.vertices) * 3, np.float32); hair.data.vertices.foreach_get("co", co)
mw = np.array(hair.matrix_world)
w = (np.c_[co.reshape(-1, 3), np.ones(len(co) // 3)] @ mw.T)[:, :3]
pc = press_hair(w, P)
pc = (np.c_[pc, np.ones(len(pc))] @ np.linalg.inv(mw).T)[:, :3]
hair.data.vertices.foreach_set("co", pc.astype(np.float32).ravel()); hair.data.update()
hv, hf, bv, bf = hat_geo(P)
hat = make_or_update(bpy, "Hat", hv, hf)
band = make_or_update(bpy, "HatBand", bv, bf)
# the band as a thin solid
mod = band.modifiers.new("solid", "SOLIDIFY"); mod.thickness = 0.02; mod.offset = 1
bpy.context.view_layer.objects.active = band; bpy.ops.object.modifier_apply(modifier="solid")
for o, mn, col in ((hat, "hat", (0.02, 0.02, 0.02, 1)), (band, "hatband", (0.006, 0.006, 0.006, 1))):
    m = bpy.data.materials.new(mn); m.use_nodes = True
    m.node_tree.nodes["Principled BSDF"].inputs["Base Color"].default_value = col
    o.data.materials.append(m)
    for p in o.data.polygons:
        p.use_smooth = True
json.dump(P, open(argv[2], "w"), indent=1)
bpy.ops.wm.save_as_mainfile(filepath=argv[1])
print("NOIRBUILD", argv[1])
