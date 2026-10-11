# Export a hand-edited face.blend to the site (keeps the part names the rig needs).
#   /Applications/Blender.app/Contents/MacOS/Blender -b tools/face3d/face.blend -P tools/face3d/export_glb.py -- public/faces/face.glb
import bpy, sys

out = sys.argv[sys.argv.index("--") + 1]
need = {"Skin", "Hair", "EyeL", "EyeR", "BrowL", "BrowR", "Mouth"}
have = {o.name for o in bpy.data.objects if o.type == "MESH"}
missing = need - have
if missing:
    print("MISSING PARTS:", ", ".join(sorted(missing)))
bpy.ops.object.select_all(action="DESELECT")
for o in bpy.data.objects:
    if o.type == "MESH":
        o.select_set(True)
bpy.ops.export_scene.gltf(filepath=out, export_format="GLB", use_selection=True, export_apply=True)
print("WROTE", out)
