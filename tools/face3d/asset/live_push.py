# live_push.py : mirror a headless sculpt into the LIVE Blender (run through the `blender` MCP: exec(open(PATH).read()) with SRC set).
# Replaces only the "ChefWIP" collection, hides the rest of the scene, frames the head, Material Preview, selection cleared.
import bpy
SRC = globals().get("SRC")
old = bpy.data.collections.get("ChefWIP")
if old:
    for o in list(old.objects): bpy.data.objects.remove(o, do_unlink=True)
    bpy.data.collections.remove(old)
col = bpy.data.collections.new("ChefWIP"); bpy.context.scene.collection.children.link(col)
with bpy.data.libraries.load(SRC, link=False) as (a, b):
    b.objects = list(a.objects); b.materials = list(a.materials)
for o in b.objects:
    if o: col.objects.link(o)
for c in bpy.context.scene.collection.children:
    if c.name != "ChefWIP": c.hide_viewport = True
for o in bpy.context.scene.objects:
    if o.name not in col.objects and o.type in ("MESH", "CURVE", "META", "EMPTY"): o.hide_set(True)
cam = next((o for o in col.objects if o.type == "CAMERA"), None)
if cam: bpy.context.scene.camera = cam
for o in col.objects:
    if o.type == "LIGHT": o.hide_viewport = True
for w in bpy.context.window_manager.windows:
    for area in w.screen.areas:
        if area.type == "VIEW_3D":
            sp = area.spaces[0]; sp.shading.type = "MATERIAL"; sp.overlay.show_overlays = False
            with bpy.context.temp_override(window=w, area=area, region=next(r for r in area.regions if r.type == "WINDOW")):
                bpy.ops.object.select_all(action="DESELECT")
                if cam: sp.region_3d.view_perspective = "CAMERA"
print("live updated", SRC)
