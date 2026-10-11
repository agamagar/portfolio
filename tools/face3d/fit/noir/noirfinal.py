# Finish the fitted face for the site:
#   Blender -b face_ao.blend -P finalize.py -- PARAMS.json LIGHT.json TEXDIR OUT.glb OUT_FIT.json
# - Skin and Hair get their albedo-ratio textures (as the base colour image, so the GLB
#   carries them); every part exports its baked AO as COLOR_0
# - writes the fitted camera in three.js axes and the fitted lighting for the shader
import bpy, sys, os, json, math
from mathutils import Matrix

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
sys.path.insert(0, os.path.join(HERE, '..', 'fit'))
sys.path.insert(0, os.path.join(HERE, '..'))  # (in the repo, fit/noir sits inside fit/)
from fitcam import fitted_camera

argv = sys.argv[sys.argv.index("--") + 1:]
P = json.load(open(argv[0])); LIGHT = json.load(open(argv[1]))
TEX, OUTG, OUTJ = argv[2], argv[3], argv[4]
sc = bpy.context.scene

for name in ("Skin", "Hair", "EyeL", "EyeR", "BrowL", "BrowR", "Hat", "HatBand"):
    if not os.path.exists(os.path.join(TEX, f"{name}_ratio.png")):
        continue
    o = bpy.data.objects[name]
    img = bpy.data.images.load(os.path.join(TEX, f"{name}_ratio.png"))
    img.colorspace_settings.name = "Non-Color"
    m = bpy.data.materials.new(f"{name}_fit")
    m.use_nodes = True
    nt = m.node_tree
    bsdf = nt.nodes.get("Principled BSDF")
    tex = nt.nodes.new("ShaderNodeTexImage")
    tex.image = img
    nt.links.new(tex.outputs["Color"], bsdf.inputs["Base Color"])
    o.data.materials.clear()
    o.data.materials.append(m)

for o in sc.objects:
    if o.type == "MESH":
        o.hide_render = False
        o.hide_set(False)
        if o.data.shape_keys:
            for kb in o.data.shape_keys.key_blocks[1:]:
                kb.value = 0.0
        if "AO" in o.data.color_attributes:
            o.data.color_attributes.active_color = o.data.color_attributes["AO"]

bpy.ops.object.select_all(action="DESELECT")
for o in sc.objects:
    if o.type == "MESH":
        o.select_set(True)
bpy.ops.export_scene.gltf(filepath=OUTG, export_format="GLB", use_selection=True, export_apply=True,
                          export_vertex_color="NAME", export_vertex_color_name="AO", export_all_vertex_colors=False)

# the camera, Blender (z up, front -y) -> three.js (y up, front +z): (x, y, z) -> (x, z, -y)
cam = fitted_camera(bpy, P)
C = Matrix(((1, 0, 0), (0, 0, 1), (0, -1, 0)))
R3 = C @ cam.matrix_world.to_3x3()
pos = C @ cam.matrix_world.translation
q = R3.to_quaternion()
fit = {
    "camera": {"position": list(pos), "quaternion": [q.x, q.y, q.z, q.w], "fov": P["cam_fov"],
               "shift": [P.get("cam_sx", 0.0), P.get("cam_sy", 0.0)], "aspect": 802 / 862},
    "light": {k: LIGHT[k] for k in ("skin", "hair", "eye", "brow", "mouth", "hat") if k in LIGHT and "sh" in LIGHT[k]},
    "eye": LIGHT["eye"]["base"], "bg": LIGHT["bg"], "mono": True,
    "note": "fitted to tools/face-styles/ref/noir.png by tools/face3d/fit/noir (camera, fedora, SH light per part in view space, AO^k)",
}
json.dump(fit, open(OUTJ, "w"), indent=1)
print("FINAL", OUTG, OUTJ)
