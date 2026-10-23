# sculpt_head.py : the clay head built to the target sheet's proportions, fully procedural in Blender (headless).
#   blender -b --python tools/face3d/asset/sculpt_head.py -- OUT.png [LOOK=chef] [YAW=-32]  (also writes OUT.blend)
# A broad soft block (superellipsoid cranium + jaw), big ears with a modelled inner fold, a soft nose that bulges off the cheek, thick brow
# pills, glossy bead eyes, a carved smile, a swoosh quiff, and a chef hat. Front is -Y, up is +Z, head half-width 1.0.
import bpy, bmesh, math, sys, os
from math import radians, sin, cos, pi
from mathutils import Vector, Matrix
a = sys.argv[sys.argv.index("--") + 1:]
OUT = a[0]; LOOK = a[1] if len(a) > 1 else "chef"; YAW = float(a[2]) if len(a) > 2 else -32
bpy.ops.wm.read_factory_settings(use_empty=True)
sc = bpy.context.scene
def srgb(h):
    n = int(h[1:], 16); f = lambda c: ((c / 255 + 0.055) / 1.055) ** 2.4 if c / 255 > 0.04045 else c / 255 / 12.92
    return (f((n >> 16) & 255), f((n >> 8) & 255), f(n & 255), 1)
def mat(name, hexc, rough=0.8, sss=0.15, spec=0.18, sss_hex=None):
    m = bpy.data.materials.new(name); m.use_nodes = True; b = m.node_tree.nodes["Principled BSDF"]
    b.inputs["Base Color"].default_value = srgb(hexc); b.inputs["Roughness"].default_value = rough
    b.inputs["Subsurface Weight"].default_value = sss; b.inputs["Specular IOR Level"].default_value = spec
    if sss_hex: b.inputs["Subsurface Radius"].default_value = srgb(sss_hex)[:3]
    # the clay's fine surface: a very soft noise bump
    n = m.node_tree.nodes.new("ShaderNodeTexNoise"); n.inputs["Scale"].default_value = 90; n.inputs["Detail"].default_value = 6
    bump = m.node_tree.nodes.new("ShaderNodeBump"); bump.inputs["Strength"].default_value = 0.035; bump.inputs["Distance"].default_value = 0.02
    m.node_tree.links.new(n.outputs["Fac"], bump.inputs["Height"]); m.node_tree.links.new(bump.outputs["Normal"], b.inputs["Normal"])
    return m
SKIN = {"chef": "#f8dcc8"}.get(LOOK, "#f8dcc8")
M = {"skin": mat("skin", SKIN, sss=0.2), "hair": mat("hair", "#4a2616", rough=0.55, sss=0.0, spec=0.35), "hat": mat("hat", "#f1ece3", rough=0.85, sss=0.12),
     "brow": mat("brow", "#3a1e12", rough=0.6, sss=0, spec=0.3), "eye": mat("eye", "#050404", rough=0.12, sss=0, spec=1.0), "mouth": mat("mouth", "#c98b78", rough=0.75, sss=0.1),
     "ear": mat("ear", "#f3d0b8", rough=0.8, sss=0.2), "earin": mat("earin", "#d9a98c", rough=0.85, sss=0.12)}
def obj_from_bm(bm, name, material, smooth=True, subsurf=0):
    me = bpy.data.meshes.new(name); bm.to_mesh(me); bm.free(); o = bpy.data.objects.new(name, me); sc.collection.objects.link(o)
    me.materials.append(material)
    for p in me.polygons: p.use_smooth = smooth
    if subsurf:
        s = o.modifiers.new("s", "SUBSURF"); s.levels = subsurf; s.render_levels = subsurf
    return o
def sgn(x): return 1 if x >= 0 else -1
def ss(a_, b_, x): t = min(1, max(0, (x - a_) / (b_ - a_))); return t * t * (3 - 2 * t)
# ---- the head: a superellipsoid block, jaw narrowing to a soft chin, big cranium -----------------------------------
def head_point(u, v):
    # u in [0, 2pi) around, v in [-pi/2, pi/2] up; superellipsoid with exponent e (0.5 = boxy, 1 = ellipsoid)
    e = 0.62
    cu, su, cv, sv = cos(u), sin(u), cos(v), sin(v)
    x = sgn(cu) * abs(cu) ** e * abs(cv) ** e; y = sgn(su) * abs(su) ** e * abs(cv) ** e; z = sgn(sv) * abs(sv) ** e
    # y is depth: front is -y. width 1.0, depth 0.98, height 1.02
    X, Y, Z = x * 1.06, y * 0.96, z * 1.36
    low = ss(0.15, -1.25, Z)            # 0 at the cranium, 1 at the chin
    X *= 1 - 0.035 * low                   # the jaw narrows
    Y -= 0.0
    # the chin comes forward and rounds; the back of the skull stays full
    if Y < 0: Y *= 1 + 0.06 * low
    Z2 = Z - 0.06 * low * low             # soft jaw sag
    return (X, Y + 0.0, Z2)
bm = bmesh.new()
NU, NV = 96, 64
verts = []
for j in range(NV + 1):
    v = -pi / 2 + pi * j / NV
    row = []
    for i in range(NU):
        u = 2 * pi * i / NU; row.append(bm.verts.new(head_point(u, v)))
    verts.append(row)
for j in range(NV):
    for i in range(NU):
        a1, b1, c1, d1 = verts[j][i], verts[j][(i + 1) % NU], verts[j + 1][(i + 1) % NU], verts[j + 1][i]
        try: bm.faces.new((a1, b1, c1, d1))
        except ValueError: pass
bmesh.ops.remove_doubles(bm, verts=bm.verts, dist=1e-5); bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
head = obj_from_bm(bm, "Head", M["skin"], subsurf=1)
# ---- features ----------------------------------------------------------------------------------------------------
def blob(name, loc, scale, material, rot=(0, 0, 0), seg=40, sub=1):
    bpy.ops.mesh.primitive_uv_sphere_add(segments=seg, ring_count=seg // 2, radius=1, location=loc, rotation=rot); o = bpy.context.object; o.name = name; o.scale = scale
    o.data.materials.append(material); bpy.ops.object.shade_smooth()
    if sub: s = o.modifiers.new("s", "SUBSURF"); s.levels = sub
    return o
def meta(name, material, elems, res=0.025, thr=0.6):
    # smooth union of ellipsoid elements: (co, radius, size_xyz, stiffness)
    mb = bpy.data.metaballs.new(name); mb.resolution = res; mb.render_resolution = res; mb.threshold = thr
    for co, r, sz, st in elems:
        e = mb.elements.new(type="ELLIPSOID"); e.co = co; e.radius = r; e.size_x, e.size_y, e.size_z = sz; e.stiffness = st
    o = bpy.data.objects.new(name, mb); sc.collection.objects.link(o); mb.materials.append(material); return o
FY = -0.93   # the front plane
objs = [head]
# eyes: glossy beads sunk a little into the face
for sd in (-1, 1): objs.append(blob(f"Eye{sd}", (sd * 0.44, FY + 0.01, 0.26), (0.118, 0.09, 0.14), M["eye"], seg=32))
# brows: thick rounded pills, slightly arched, tilted
def pill(name, c, length, thick, tilt, arch, material):
    pts = []
    for k in range(13):
        t = k / 12 - 0.5; pts.append(Vector((t * length, 0, arch * (1 - 4 * t * t))))
    curve = bpy.data.curves.new(name, "CURVE"); curve.dimensions = "3D"; sp = curve.splines.new("POLY"); sp.points.add(len(pts) - 1)
    for p, q in zip(sp.points, pts): p.co = (q.x, q.y, q.z, 1)
    curve.bevel_depth = thick; curve.bevel_resolution = 8; curve.use_fill_caps = True
    o = bpy.data.objects.new(name, curve); sc.collection.objects.link(o); o.data.materials.append(material)
    o.location = c; o.rotation_euler = (0, tilt, 0); return o
for sd in (-1, 1):
    objs.append(pill(f"Brow{sd}", (sd * 0.44, FY + 0.03, 0.58), 0.34, 0.082, radians(-9) * sd * -1 if True else 0, 0.04, M["brow"]))
# nose: one soft form bulging off the cheek (bridge into a rounded tip), no seam
nose = meta("Nose", M["skin"], [((0.02, FY - 0.02, 0.16), 0.20, (0.55, 0.8, 1.0), 2.0), ((0.02, FY - 0.08, -0.06), 0.25, (0.75, 0.9, 1.15), 2.0), ((0.02, FY - 0.13, -0.26), 0.20, (1.0, 0.95, 0.85), 2.0)], res=0.02, thr=0.5)
objs += [nose]
# carved smile: a soft arc with lips, pressed in
def arc(name, c, r, ang0, ang1, thick, material):
    pts = [Vector((r * sin(a_), 0, -r * cos(a_) + r)) for a_ in [ang0 + (ang1 - ang0) * k / 16 for k in range(17)]]
    curve = bpy.data.curves.new(name, "CURVE"); curve.dimensions = "3D"; sp = curve.splines.new("POLY"); sp.points.add(len(pts) - 1)
    for p, q in zip(sp.points, pts): p.co = (q.x, q.y, q.z, 1)
    curve.bevel_depth = thick; curve.bevel_resolution = 6; curve.use_fill_caps = True
    o = bpy.data.objects.new(name, curve); sc.collection.objects.link(o); o.data.materials.append(material); o.location = c; return o
objs.append(arc("Smile", (0.0, FY + 0.0, -0.86), 0.62, radians(-36), radians(40), 0.04, M["mouth"]))
# ears: big and round, with a modelled inner fold (rim torus + concave bowl + small tragus)
for sd in (-1, 1):
    ex = sd * 1.10; ey = -0.18; rz = (0, 0, radians(-34) * sd)   # the ears toe in a little so they read from the front, as the sheet's do
    rim = blob(f"EarRim{sd}", (ex + sd * 0.04, ey, 0.02), (0.20, 0.60, 0.68), M["ear"], rot=rz, seg=48)
    bowl = blob(f"EarBowl{sd}", (ex + sd * 0.10, ey - 0.04, 0.02), (0.12, 0.40, 0.50), M["earin"], rot=rz, seg=40)
    fold = blob(f"EarFold{sd}", (ex + sd * 0.15, ey - 0.07, 0.10), (0.09, 0.19, 0.31), M["ear"], rot=rz, seg=32)
    lobe = blob(f"EarLobe{sd}", (ex + sd * 0.05, ey - 0.02, -0.40), (0.10, 0.23, 0.17), M["ear"], rot=rz, seg=32)
    objs += [rim, bowl, fold, lobe]
    objs.append(blob(f"Sideburn{sd}", (sd * 0.96, -0.40, 0.62), (0.12, 0.17, 0.50), M["hair"], seg=32))
# hair: the scalp cap hugging the head plus the swoosh quiff
def cap():
    bm2 = bmesh.new()
    rows = []
    for j in range(0, 40):
        v = 0.05 + (pi / 2 - 0.05) * j / 39
        row = []
        for i in range(NU):
            u = 2 * pi * i / NU; x, y, z = head_point(u, v)
            # hairline: low at the sides/back, high on the forehead
            front = max(0.0, -sin(u)) ; k = 1.045 + 0.02 * (1 - j / 39)
            row.append(bm2.verts.new((x * k, y * k + 0.0, z * k + 0.0)))
        rows.append(row)
    for j in range(len(rows) - 1):
        for i in range(NU):
            try: bm2.faces.new((rows[j][i], rows[j][(i + 1) % NU], rows[j + 1][(i + 1) % NU], rows[j + 1][i]))
            except ValueError: pass
    # drop faces over the forehead below the hairline (front, low): keep a clean forehead
    kill = [f for f in bm2.faces if (lambda c: c.y < -0.30 and c.z < 1.02)(f.calc_center_median())]
    bmesh.ops.delete(bm2, geom=kill, context="FACES")
    return obj_from_bm(bm2, "HairCap", M["hair"], subsurf=1)
objs.append(cap())
# the swoosh: three overlapping fat forms sweeping up and out to the right, with a fluted end
wing = meta("Swoosh", M["hair"], [((0.10, -0.34, 1.18), 0.95, (1.0, 1.0, 0.85), 2.0), ((0.46, -0.42, 1.42), 0.95, (1.0, 1.0, 0.85), 2.0), ((0.80, -0.42, 1.62), 0.92, (1.0, 1.0, 0.85), 2.0), ((1.08, -0.40, 1.74), 0.74, (1.0, 0.95, 0.85), 2.0), ((1.12, -0.38, 1.56), 0.52, (1.0, 0.95, 0.85), 2.0), ((0.84, -0.36, 1.40), 0.58, (1.0, 1.0, 0.85), 2.0), ((1.22, -0.42, 1.42), 0.40, (1.0, 1.0, 0.85), 2.0), ((1.0, -0.44, 1.14), 0.36, (1.0, 1.0, 0.85), 2.0)], res=0.03, thr=0.55)
objs.append(wing)
# the chef hat: a band and five fat puffs, sitting on the head
if LOOK == "chef":
    bpy.ops.mesh.primitive_cylinder_add(vertices=64, radius=0.96, depth=0.46, location=(-0.40, 0.24, 1.36)); band = bpy.context.object; band.name = "Band"
    bpy.ops.object.shade_smooth(); band.data.materials.append(M["hat"]); bev = band.modifiers.new("b", "BEVEL"); bev.width = 0.07; bev.segments = 6
    band.scale = (1.10, 1.0, 1.0); band.rotation_euler = (radians(-4), radians(-16), 0); objs.append(band)
    for i, (x, y, z, r, h) in enumerate([(-0.38, 0.24, 1.92, 0.78, 0.66), (-0.98, 0.16, 1.80, 0.60, 0.58), (0.18, 0.30, 1.80, 0.56, 0.58), (-0.70, 0.62, 1.80, 0.54, 0.58), (-0.78, -0.22, 1.82, 0.54, 0.58)]):
        objs.append(blob(f"Puff{i}", (x, y, z), (r, r, h), M["hat"], seg=48))
# ---- the whole head tilts like the sheet's (roll left, a touch of pitch) -----------------------------------------
root = bpy.data.objects.new("root", None); sc.collection.objects.link(root)
for o in objs: o.parent = root
root.rotation_euler = (radians(6), radians(-9), radians(-6))
# ---- light, camera, render ---------------------------------------------------------------------------------------
w = bpy.data.worlds.new("w"); w.use_nodes = True; w.node_tree.nodes["Background"].inputs[0].default_value = (0.9, 0.9, 0.91, 1); w.node_tree.nodes["Background"].inputs[1].default_value = 0.3; sc.world = w
def light(name, loc, e, size):
    l = bpy.data.lights.new(name, "AREA"); l.energy = e; l.size = size; o = bpy.data.objects.new(name, l); sc.collection.objects.link(o); o.location = loc
    o.rotation_euler = (-Vector(loc)).to_track_quat("-Z", "Y").to_euler()
light("key", (-6.5, -5.0, 6.0), 520, 5); light("fill", (5.0, -6.5, 0.5), 110, 9); light("front", (0.0, -9.0, 2.0), 60, 10); light("rim", (1.0, 5.0, 3.0), 110, 4)
cam = bpy.data.objects.new("c", bpy.data.cameras.new("c")); sc.collection.objects.link(cam); sc.camera = cam; cam.data.lens = 70; cam.data.sensor_width = 36
d = 9.2; a_ = radians(YAW); b_ = radians(8)
cam.location = Vector((sin(a_) * cos(b_) * d, -cos(a_) * cos(b_) * d, sin(b_) * d + 0.5)); cam.rotation_euler = (Vector((-0.25, 0, 0.75)) - cam.location).to_track_quat("-Z", "Y").to_euler()
sc.render.engine = "BLENDER_EEVEE"; sc.eevee.taa_render_samples = 96; sc.render.resolution_x = sc.render.resolution_y = 900; sc.render.film_transparent = True
sc.view_settings.view_transform = "Standard"; sc.view_settings.exposure = 0.45
sc.render.filepath = OUT; bpy.ops.render.render(write_still=True)
bpy.ops.wm.save_as_mainfile(filepath=OUT.rsplit(".", 1)[0] + ".blend")
print("sculpt done")
