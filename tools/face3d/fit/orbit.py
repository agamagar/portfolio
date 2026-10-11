# orbit.py: solid renders of a .blend from four sides (props hidden, keys at rest)
#   Blender -b IN.blend -P orbit.py -- OUTPREFIX
import bpy, sys, math
from mathutils import Vector
out = sys.argv[sys.argv.index("--") + 1]
sc = bpy.context.scene
for o in sc.objects:
    if o.type == "MESH":
        o.hide_render = o.name in ("Hat", "HatBand", "Pin", "LidL", "LidR", "MouthInner")
sc.render.engine = "BLENDER_WORKBENCH"
sc.display.shading.light = "STUDIO"
sc.display.shading.color_type = "MATERIAL"
sc.render.resolution_x, sc.render.resolution_y = 500, 540
sc.render.film_transparent = False
cam = bpy.data.objects.new("orb", bpy.data.cameras.new("orb")); sc.collection.objects.link(cam); sc.camera = cam
cam.data.lens = 50
for k, a in enumerate((0, 90, 180, 270)):
    r = math.radians(a)
    cam.location = Vector((-math.sin(r) * 7.5, -math.cos(r) * 7.5, 0.8))
    cam.rotation_euler = (Vector((0, 0, 0.35)) - cam.location).to_track_quat("-Z", "Y").to_euler()
    sc.render.filepath = f"{out}_{a}.png"
    bpy.ops.render.render(write_still=True)
