# sculpt_fit.py : the clay head built from the turnaround fit (turn_fit.json) and rendered at each view's fitted pose.
#   blender -b --python sculpt_fit.py -- OUTDIR [VIEWS=all|1,2,7]   -> OUTDIR/v_NN.png + OUTDIR/head.blend
# Same builders as sculpt_head.py (soft clay shading, bead eyes, brow pills, carved smile, ears with fold, metaball nose and swoosh), but the head's
# dimensions, ear placement, hair cap and swoosh come from the multi-view fit. Features sit ON the fitted surface (surf_y solves the superellipsoid).
import bpy, bmesh, math, sys, os, json
from math import radians, sin, cos, pi, sqrt
from mathutils import Vector, Matrix
HERE = "/Users/agamagarwal/portfolio/.claude/worktrees/sleepy-bohr-ab34c2/tools/face3d/asset"
a = sys.argv[sys.argv.index("--") + 1:]; OUT = a[0]; VIEWS = None if len(a) < 2 or a[1] == "all" else [int(v) for v in a[1].split(",")]
os.makedirs(OUT, exist_ok=True)
F = json.load(open(f"{HERE}/turn_fit.json")); S = F["shape"]
w, d, h, e, taper, sag = S["width"], S["depth"], S["height"], S["boxiness"], S["jaw_taper"], S["jaw_sag"]
bpy.ops.wm.read_factory_settings(use_empty=True); sc = bpy.context.scene
def srgb(hx):
    n = int(hx[1:], 16); f = lambda c: ((c / 255 + 0.055) / 1.055) ** 2.4 if c / 255 > 0.04045 else c / 255 / 12.92
    return (f((n >> 16) & 255), f((n >> 8) & 255), f(n & 255), 1)
def mat(name, hx, rough=0.8, sss=0.15, spec=0.18):
    m = bpy.data.materials.new(name); m.use_nodes = True; b = m.node_tree.nodes["Principled BSDF"]
    b.inputs["Base Color"].default_value = srgb(hx); b.inputs["Roughness"].default_value = rough; b.inputs["Subsurface Weight"].default_value = sss; b.inputs["Specular IOR Level"].default_value = spec
    n = m.node_tree.nodes.new("ShaderNodeTexNoise"); n.inputs["Scale"].default_value = 90; n.inputs["Detail"].default_value = 6
    bump = m.node_tree.nodes.new("ShaderNodeBump"); bump.inputs["Strength"].default_value = 0.03; bump.inputs["Distance"].default_value = 0.02
    m.node_tree.links.new(n.outputs["Fac"], bump.inputs["Height"]); m.node_tree.links.new(bump.outputs["Normal"], b.inputs["Normal"]); return m
M = {"skin": mat("skin", "#f8dcc8", sss=0.2), "hair": mat("hair", "#4a2616", rough=0.55, sss=0.0, spec=0.35), "brow": mat("brow", "#3a1e12", rough=0.6, sss=0, spec=0.3),
     "eye": mat("eye", "#050404", rough=0.12, sss=0, spec=1.0), "mouth": mat("mouth", "#c98b78", rough=0.75, sss=0.1), "ear": mat("ear", "#f3d0b8", rough=0.8, sss=0.2), "earin": mat("earin", "#d9a98c", rough=0.85, sss=0.12)}
sgn = lambda x: 1 if x >= 0 else -1
ss = lambda a_, b_, x: (lambda t: t * t * (3 - 2 * t))(min(1, max(0, (x - a_) / (b_ - a_))))
def head_point(u, v):
    cu, su, cv, sv = cos(u), sin(u), cos(v), sin(v)
    x = sgn(cu) * abs(cu) ** e * abs(cv) ** e; y = sgn(su) * abs(su) ** e * abs(cv) ** e; z = sgn(sv) * abs(sv) ** e
    X, Y, Z = x * w, y * d, z * h; low = min(1, max(0, (0.15 - Z / h) / 1.4)); X *= 1 - taper * low; Z -= sag * low * low
    return (X, Y, Z)
def surf_y(x, z):
    # front surface y at (x, z) of the superellipsoid (taper and sag ignored: fine in the face's middle)
    zt = min(0.999, abs(z / h) ** (1 / e)); cv = sqrt(max(1e-6, 1 - zt ** 2)); cu = min(0.999, (abs(x) / w) ** (1 / e) / cv); su = sqrt(1 - cu ** 2)
    return -d * (su * cv) ** e
def obj_from_bm(bm, name, material, subsurf=0):
    me = bpy.data.meshes.new(name); bm.to_mesh(me); bm.free(); o = bpy.data.objects.new(name, me); sc.collection.objects.link(o); me.materials.append(material)
    for p in me.polygons: p.use_smooth = True
    if subsurf: s = o.modifiers.new("s", "SUBSURF"); s.levels = subsurf; s.render_levels = subsurf
    return o
def blob(name, loc, scale, material, rot=(0, 0, 0), seg=40, sub=1):
    bpy.ops.mesh.primitive_uv_sphere_add(segments=seg, ring_count=seg // 2, radius=1, location=loc, rotation=rot); o = bpy.context.object; o.name = name; o.scale = scale
    o.data.materials.append(material); bpy.ops.object.shade_smooth()
    if sub: s = o.modifiers.new("s", "SUBSURF"); s.levels = sub
    return o
def meta(name, material, elems, res=0.03, thr=0.55):
    mb = bpy.data.metaballs.new(name); mb.resolution = res; mb.render_resolution = res; mb.threshold = thr
    for co, r, sz, st in elems:
        el = mb.elements.new(type="ELLIPSOID"); el.co = co; el.radius = r; el.size_x, el.size_y, el.size_z = sz; el.stiffness = st
    o = bpy.data.objects.new(name, mb); sc.collection.objects.link(o); mb.materials.append(material); return o
objs = []
def union(name, parts, material, voxel=0.035, smooth=14):
    for o in parts: o.modifiers.clear()
    bpy.ops.object.select_all(action="DESELECT")
    for o in parts: o.select_set(True)
    bpy.context.view_layer.objects.active = parts[0]; bpy.ops.object.join(); o = bpy.context.object; o.name = name
    r = o.modifiers.new("r", "REMESH"); r.mode = "VOXEL"; r.voxel_size = voxel
    sm = o.modifiers.new("sm", "SMOOTH"); sm.iterations = smooth; sm.factor = 0.8
    o.data.materials.clear(); o.data.materials.append(material); bpy.ops.object.shade_smooth(); return o
# head
bm = bmesh.new(); NU, NV = 96, 64; rows = []
for j in range(NV + 1):
    v = -pi / 2 + pi * j / NV; rows.append([bm.verts.new(head_point(2 * pi * i / NU, v)) for i in range(NU)])
for j in range(NV):
    for i in range(NU):
        try: bm.faces.new((rows[j][i], rows[j][(i + 1) % NU], rows[j + 1][(i + 1) % NU], rows[j + 1][i]))
        except ValueError: pass
bmesh.ops.remove_doubles(bm, verts=bm.verts, dist=1e-5); bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
objs.append(obj_from_bm(bm, "Head", M["skin"], 1))
# features on the surface
ex_ = 0.44 * w / 1.06; ez_ = 0.26 * h / 1.36
for sd in (-1, 1): objs.append(blob(f"Eye{sd}", (sd * ex_, surf_y(ex_, ez_) + 0.02, ez_), (0.118, 0.09, 0.14), M["eye"], seg=32))
def pill(name, c, length, thick, tilt, arch, material):
    pts = [Vector(((k / 12 - 0.5) * length, 0, arch * (1 - 4 * (k / 12 - 0.5) ** 2))) for k in range(13)]
    cv_ = bpy.data.curves.new(name, "CURVE"); cv_.dimensions = "3D"; sp = cv_.splines.new("POLY"); sp.points.add(len(pts) - 1)
    for p, q in zip(sp.points, pts): p.co = (q.x, q.y, q.z, 1)
    cv_.bevel_depth = thick; cv_.bevel_resolution = 8; cv_.use_fill_caps = True
    o = bpy.data.objects.new(name, cv_); sc.collection.objects.link(o); o.data.materials.append(material); o.location = c; o.rotation_euler = (0, tilt, 0); return o
bz = 0.58 * h / 1.36
for sd in (-1, 1): objs.append(pill(f"Brow{sd}", (sd * ex_, surf_y(ex_, bz) + 0.03, bz), 0.34, 0.082, radians(9) * sd, 0.04, M["brow"]))
ny = surf_y(0, 0)
objs.append(union("Nose", [blob("n0", (0.02, ny - 0.0, 0.18), (0.10, 0.12, 0.2), M["skin"], seg=32, sub=0), blob("n1", (0.02, ny - 0.08, -0.04), (0.13, 0.15, 0.26), M["skin"], seg=32, sub=0), blob("n2", (0.02, ny - 0.14, -0.26), (0.15, 0.13, 0.13), M["skin"], seg=32, sub=0)], M["skin"], voxel=0.02, smooth=12))
sz_ = -0.86 * h / 1.36
cv_ = bpy.data.curves.new("Smile", "CURVE"); cv_.dimensions = "3D"; sp = cv_.splines.new("POLY"); r_ = 0.62; angs = [radians(-36) + (radians(40) - radians(-36)) * k / 16 for k in range(17)]; sp.points.add(16)
for p, a_ in zip(sp.points, angs): p.co = (r_ * sin(a_), 0.0, -r_ * cos(a_) + r_, 1)
cv_.bevel_depth = 0.04; cv_.bevel_resolution = 6; cv_.use_fill_caps = True
smile = bpy.data.objects.new("Smile", cv_); sc.collection.objects.link(smile); smile.data.materials.append(M["mouth"]); smile.location = (0, surf_y(0, sz_) + 0.0, sz_); objs.append(smile)
# ears from the fit
for sd in (-1, 1):
    cx = sd * (w * 0.97 + S["ear_x"] * 0.8); cy = 0.06; cz = -0.02; rz = (0, 0, radians(-20) * sd); EW, EH = 0.27, 0.43
    objs += [blob(f"EarRim{sd}", (cx, cy, cz), (0.10, EW, EH), M["ear"], rot=rz, seg=48),
             blob(f"EarBowl{sd}", (cx + sd * 0.06, cy - 0.03, cz), (0.08, EW * 0.66, EH * 0.7), M["earin"], rot=rz, seg=40),
             blob(f"EarFold{sd}", (cx + sd * 0.1, cy - 0.05, cz + 0.05), (0.07, EW * 0.34, EH * 0.46), M["ear"], rot=rz, seg=32),
             blob(f"EarLobe{sd}", (cx + sd * 0.03, cy - 0.02, cz - EH * 0.82), (0.09, EW * 0.4, EH * 0.3), M["ear"], rot=rz, seg=32)]
# hair: a cap that follows the head (upper and back, minus the forehead window) and the fitted swoosh
bm2 = bmesh.new(); rows = []
for j in range(0, 40):
    v = 0.05 + (pi / 2 - 0.05) * j / 39; rows.append([bm2.verts.new(tuple(c * (1.04 + 0.02 * (1 - j / 39)) for c in head_point(2 * pi * i / NU, v))) for i in range(NU)])
for j in range(len(rows) - 1):
    for i in range(NU):
        try: bm2.faces.new((rows[j][i], rows[j][(i + 1) % NU], rows[j + 1][(i + 1) % NU], rows[j + 1][i]))
        except ValueError: pass
bmesh.ops.delete(bm2, geom=[f for f in bm2.faces if (lambda c: c.y < -0.25 and c.z < 0.62 * h)(f.calc_center_median())], context="FACES")
objs.append(obj_from_bm(bm2, "HairCap", M["hair"], 1))
sw = [blob(f"sw{i}", (c[0], c[1], c[2]), (max(0.18, abs(c[3])), max(0.18, abs(c[4])), max(0.18, abs(c[5]))), M["hair"], seg=32, sub=0) for i, c in enumerate(F["swoosh"])]
sw.append(blob("sw_root", (0.05, -0.2, 0.9 * h * 0.8), (0.75, 0.62, 0.5), M["hair"], seg=32, sub=0))
objs.append(union("Swoosh", sw, M["hair"]))
root = bpy.data.objects.new("root", None); sc.collection.objects.link(root)
for o in objs: o.parent = root
# light, camera (orthographic, fixed at the front; each view rotates the head by its fitted pose), render
w_ = bpy.data.worlds.new("w"); w_.use_nodes = True; w_.node_tree.nodes["Background"].inputs[0].default_value = (0.9, 0.9, 0.91, 1); w_.node_tree.nodes["Background"].inputs[1].default_value = 0.3; sc.world = w_
def light(name, loc, en, size):
    l = bpy.data.lights.new(name, "AREA"); l.energy = en; l.size = size; o = bpy.data.objects.new(name, l); sc.collection.objects.link(o); o.location = loc; o.rotation_euler = (-Vector(loc)).to_track_quat("-Z", "Y").to_euler()
light("key", (-6.5, -5.0, 6.0), 520, 5); light("fill", (5.0, -6.5, 0.5), 110, 9); light("front", (0.0, -9.0, 2.0), 60, 10)
cam = bpy.data.objects.new("c", bpy.data.cameras.new("c")); sc.collection.objects.link(cam); sc.camera = cam; cam.data.type = "ORTHO"; cam.data.ortho_scale = 4.4
cam.location = (0, -12, 0.0); cam.rotation_euler = (radians(90), 0, 0)
sc.render.engine = "BLENDER_EEVEE"; sc.eevee.taa_render_samples = 64; sc.render.resolution_x = sc.render.resolution_y = 700; sc.render.film_transparent = True; sc.view_settings.view_transform = "Standard"; sc.view_settings.exposure = 0.45
def R(yaw, pitch, rollv):
    y, p, r = radians(yaw), radians(pitch), radians(rollv); cy, sy, cp, sp, cr, sr = cos(y), sin(y), cos(p), sin(p), cos(r), sin(r)
    Rz = Matrix([[cy, -sy, 0], [sy, cy, 0], [0, 0, 1]]); Rx = Matrix([[1, 0, 0], [0, cp, -sp], [0, sp, cp]]); Ry = Matrix([[cr, 0, sr], [0, 1, 0], [-sr, 0, cr]]); return Ry @ Rx @ Rz
for i, vw in enumerate(F["views"]):
    if VIEWS is not None and i not in VIEWS: continue
    root.matrix_world = R(vw["yaw"], vw["pitch"], vw["roll"]).to_4x4()
    sc.render.filepath = f"{OUT}/v_{i:02d}.png"; bpy.ops.render.render(write_still=True)
root.matrix_world = R(*[F["views"][1][k] for k in ("yaw", "pitch", "roll")]).to_4x4(); bpy.ops.wm.save_as_mainfile(filepath=f"{OUT}/head.blend"); print("sculpt_fit done")
