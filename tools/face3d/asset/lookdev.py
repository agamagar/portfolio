# lookdev.py : Eevee lookdev turntable of the canonical head in a skin look. blender -b CANON.blend --python this -- SKIN OUTDIR
# Appends the source head's other parts (brows, eyes, lids, mouth, hair) from face.blend onto the canonical Skin, gives every part a look
# (clay: matte plasticine), and renders front, 3/4 left/right, both profiles, mid-blink and each expression peak with the shape keys.
import bpy, sys, os, math, json
from mathutils import Vector
_a = sys.argv[sys.argv.index("--") + 1:]
skin, outdir = _a[:2]
HAT = len(_a) > 2 and _a[2] == "chef"
VIEWS = _a[3].split(",") if len(_a) > 3 else None
os.makedirs(outdir, exist_ok=True)
SRC = os.path.join(os.path.dirname(bpy.data.filepath) if False else "/Users/agamagarwal/portfolio/.claude/worktrees/sleepy-bohr-ab34c2/tools/face3d", "face.blend")
with bpy.data.libraries.load(SRC, link=False) as (src, dst):
    dst.objects = [n for n in src.objects if n in ("BrowL", "BrowR", "EyeL", "EyeR", "LidL", "LidR", "Mouth", "MouthInner", "Hair")]
for ob in dst.objects:
    if ob: bpy.context.scene.collection.objects.link(ob)
canon = bpy.data.objects["SkinCanon"]
for n in ("Skin", "Hat", "HatBand", "Pin"):
    if n in bpy.data.objects: bpy.data.objects[n].hide_render = True; bpy.data.objects[n].hide_viewport = True
def mat(name, rgb, rough=0.78, sss=0.12, sss_col=None, spec=0.2):
    m = bpy.data.materials.new(name); m.use_nodes = True; b = m.node_tree.nodes["Principled BSDF"]
    b.inputs["Base Color"].default_value = (*rgb, 1); b.inputs["Roughness"].default_value = rough
    for k, v in (("Subsurface Weight", sss), ("Specular IOR Level", spec)):
        if k in b.inputs: b.inputs[k].default_value = v
    if sss_col and "Subsurface Radius" in b.inputs: b.inputs["Subsurface Radius"].default_value = sss_col
    return m
def srgb(h): 
    n = int(h[1:], 16); lin = lambda c: ((c / 255 + 0.055) / 1.055) ** 2.4 if c / 255 > 0.04045 else c / 255 / 12.92
    return (lin((n >> 16) & 255), lin((n >> 8) & 255), lin(n & 255))
LOOK = {"clay": {"Skin": srgb("#efd2ba"), "Hair": srgb("#4c2a1c"), "Brow": srgb("#3b2016"), "Eye": srgb("#171111"), "Mouth": srgb("#dcae92"), "Lid": srgb("#efd2ba")}}[skin]
parts = {"SkinCanon": "Skin", "Hair": "Hair", "BrowL": "Brow", "BrowR": "Brow", "EyeL": "Eye", "EyeR": "Eye", "Mouth": "Mouth", "MouthInner": "Mouth", "LidL": "Lid", "LidR": "Lid"}
for n, k in parts.items():
    o = bpy.data.objects[n]; o.data.materials.clear()
    m = mat(f"{skin}_{k}", LOOK[k], rough=0.35 if k == "Eye" else 0.8, sss=0.0 if k in ("Eye", "Hair", "Brow") else 0.12, spec=0.6 if k == "Eye" else 0.15)
    o.data.materials.append(m)
    if n.startswith("Lid") or n == "MouthInner": o.hide_render = True
    for p in o.modifiers: pass
    bpy.ops.object.shade_smooth() if False else None
    for pl in o.data.polygons: pl.use_smooth = True
def clay_mat(name, rgb, rough=0.82): return mat(name, rgb, rough=rough, sss=0.1, spec=0.1)
if HAT:
    import bmesh
    from math import radians
    hm = clay_mat("hat", srgb("#efe9df"))
    bandz = 0.62
    bpy.ops.mesh.primitive_cylinder_add(vertices=64, radius=1.07, depth=0.5, location=(0, 0.02, bandz)); band = bpy.context.object; band.name = "ChefBand"
    bpy.ops.object.shade_smooth(); band.data.materials.append(hm)
    bev = band.modifiers.new("b", "BEVEL"); bev.width = 0.07; bev.segments = 4
    puffs = [(0, 0.05, 1.25, 0.82, 0.92), (-0.55, 0.15, 1.22, 0.55, 0.62), (0.5, 0.0, 1.2, 0.58, 0.64), (-0.15, 0.55, 1.2, 0.5, 0.58), (0.1, -0.45, 1.22, 0.5, 0.58), (-0.7, -0.3, 1.1, 0.42, 0.5), (0.7, 0.35, 1.05, 0.42, 0.5)]
    for i, (x, y, z, r, h) in enumerate(puffs):
        bpy.ops.mesh.primitive_uv_sphere_add(segments=48, ring_count=24, radius=r, location=(x, y, z)); o2 = bpy.context.object; o2.scale.z = h / r * 0.85; bpy.ops.object.shade_smooth(); o2.data.materials.append(hm)
        sub = o2.modifiers.new("s", "SUBSURF"); sub.levels = 1
        o2.name = f"ChefPuff{i}"
    # the hat leans like the sheet's: a small roll and pitch of the whole assembly about the head's top
    pivot = bpy.data.objects.new("hatpivot", None); sc0 = bpy.context.scene; sc0.collection.objects.link(pivot); pivot.location = (0, 0, 0.6)
    for ob in [band] + [bpy.data.objects[f"ChefPuff{i}"] for i in range(len(puffs))]: ob.parent = pivot; ob.matrix_parent_inverse = pivot.matrix_world.inverted()
    pivot.rotation_euler = (radians(-4), radians(8), radians(0)); pivot.location = (-0.18, -0.12, 0.62)
sc = bpy.context.scene
sc.render.engine = "BLENDER_EEVEE"
sc.render.resolution_x, sc.render.resolution_y = 802, 862
sc.render.film_transparent = True   # (composited on the sheet's light grey in contact.py / compare)
sc.eevee.taa_render_samples = 64
sc.view_settings.view_transform = "Standard"; sc.view_settings.exposure = -0.3
w = bpy.data.worlds.new("w"); w.use_nodes = True; w.node_tree.nodes["Background"].inputs[0].default_value = (0.91, 0.91, 0.915, 1); w.node_tree.nodes["Background"].inputs[1].default_value = 0.3; sc.world = w
def light(name, loc, energy, size=2.5):
    l = bpy.data.lights.new(name, "AREA"); l.energy = energy; l.size = size; o = bpy.data.objects.new(name, l); sc.collection.objects.link(o); o.location = loc
    o.rotation_euler = (Vector((0, 0, 0)) - Vector(loc)).to_track_quat("-Z", "Y").to_euler(); return o
light("key", (-3.2, -4.2, 3.4), 110, 4.0); light("fill", (4.0, -3.0, 0.6), 45, 4.5); light("rim", (0.5, 4.5, 2.8), 50)
cam = bpy.data.objects.new("c", bpy.data.cameras.new("c")); sc.collection.objects.link(cam); sc.camera = cam
cam.data.lens = 85; cam.data.sensor_width = 36
def shoot(name, yaw=0.0, pitch=0.0, d=12.5):
    cx, cy, cz = 0.0, 0.0, 0.0
    a = math.radians(yaw); b = math.radians(pitch)
    loc = Vector((cx + math.sin(a) * math.cos(b) * d, cy - math.cos(a) * math.cos(b) * d, cz + math.sin(b) * d))
    cam.location = loc; cam.rotation_euler = (Vector((0, 0, 0.35 if HAT else 0.0)) - loc).to_track_quat("-Z", "Y").to_euler()
    sc.render.filepath = os.path.join(outdir, name + ".png"); bpy.ops.render.render(write_still=True)
# shape key helpers (the parts carry the source keys by name; the canonical Skin carries its own)
def setkeys(w):
    for o in bpy.data.objects:
        if o.type == "MESH" and o.data.shape_keys:
            for kb in o.data.shape_keys.key_blocks:
                if kb.name in w: kb.value = w[kb.name]
def clearkeys():
    for o in bpy.data.objects:
        if o.type == "MESH" and o.data.shape_keys:
            for kb in o.data.shape_keys.key_blocks: 
                if kb != o.data.shape_keys.reference_key: kb.value = 0
clearkeys()
for n, yaw in [("target34", -32), ("front", 0), ("q3L", -38), ("q3R", 38), ("profileL", -90), ("profileR", 90)]:
    if VIEWS is None or n in VIEWS: shoot(n, yaw)
EMO = {"blink": {"eyeBlinkLeft": 1, "eyeBlinkRight": 1}, "grin": {"mouthSmileLeft": 1, "mouthSmileRight": 1, "eyeSquintLeft": .7, "eyeSquintRight": .7, "jawOpen": .3},
       "surprised": {"jawOpen": .85, "mouthPucker": .5, "eyeWideLeft": 1, "eyeWideRight": 1, "browInnerUp": 1}, "sad": {"mouthFrownLeft": 1, "mouthFrownRight": 1, "browInnerUp": 1, "eyeSquintLeft": .45, "eyeSquintRight": .45},
       "angry": {"browDownLeft": 1, "browDownRight": 1, "mouthFrownLeft": 1, "mouthFrownRight": 1, "eyeSquintLeft": .75, "eyeSquintRight": .75}, "puff": {"cheekPuff": 1, "mouthPucker": .7}}
for n, w in EMO.items():
    if VIEWS is not None and n not in VIEWS: continue
    clearkeys(); setkeys(w)
    for lid in ("LidL", "LidR"): bpy.data.objects[lid].hide_render = not any(k.startswith("eye") and k != "eyeWide" for k in w)
    shoot(n, 0)
clearkeys()
print("lookdev done", skin)
