# render_checker.py : headless Workbench renders of the head with a UV checker (texel density and seams at a glance).
#   blender -b IN.blend -P this -- OBJECT OUTDIR [checker|solid]
import bpy, sys, math, os
from mathutils import Vector
args = sys.argv[sys.argv.index("--") + 1:]
name, outdir = args[0], args[1]; mode = args[2] if len(args) > 2 else "checker"
os.makedirs(outdir, exist_ok=True)
o = bpy.data.objects[name]
for ob in bpy.data.objects:
    if ob is not o and ob.type in ("MESH",): ob.hide_render = True
img = None
if mode == "checker":
    import numpy as np
    N = 1024; a = np.zeros((N, N, 4), np.float32); yy, xx = np.mgrid[0:N, 0:N]
    cell = ((xx // 32 + yy // 32) % 2).astype(np.float32); a[..., 0] = 0.25 + 0.65 * cell; a[..., 1] = 0.35 + 0.55 * (1 - cell); a[..., 2] = 0.9 - 0.5 * cell; a[..., 3] = 1
    # a coloured u,v ramp on top so orientation and seams read
    a[..., 0] = np.clip(a[..., 0] * 0.6 + 0.4 * (xx / N), 0, 1); a[..., 1] = np.clip(a[..., 1] * 0.6 + 0.4 * (yy / N), 0, 1)
    img = bpy.data.images.new("chk", N, N, alpha=False); img.pixels.foreach_set(a.ravel())
mat = bpy.data.materials.new("m"); mat.use_nodes = True
if img:
    t = mat.node_tree.nodes.new("ShaderNodeTexImage"); t.image = img
    mat.node_tree.links.new(t.outputs[0], mat.node_tree.nodes["Principled BSDF"].inputs["Base Color"])
o.data.materials.clear(); o.data.materials.append(mat)
sc = bpy.context.scene; sc.render.engine = "BLENDER_WORKBENCH"
sc.display.shading.light = "STUDIO"; sc.display.shading.color_type = "TEXTURE" if img else "MATERIAL"
sc.render.resolution_x = sc.render.resolution_y = 700; sc.render.film_transparent = False
w = bpy.data.worlds.new("w"); w.color = (0.9, 0.9, 0.93); sc.world = w
cam = bpy.data.objects.new("c", bpy.data.cameras.new("c")); sc.collection.objects.link(cam); sc.camera = cam
cam.data.type = "ORTHO"; cam.data.ortho_scale = 3.2
for nm, loc in [("front", (0, -6, 0)), ("q3L", (-4.2, -4.2, 1.2)), ("q3R", (4.2, -4.2, 1.2)), ("profile", (6, 0, 0)), ("back", (0, 6, 0)), ("top", (0, -0.01, 6))]:
    cam.location = loc; d = Vector((0, -0.2, 0)) - Vector(loc); cam.rotation_euler = d.to_track_quat("-Z", "Y").to_euler()
    sc.render.filepath = os.path.join(outdir, f"{nm}.png"); bpy.ops.render.render(write_still=True)
print("done")
