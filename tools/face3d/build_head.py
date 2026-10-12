# Build Agam's face mascot as a real 3D model (2026-10-08). Run headless:
#   /Applications/Blender.app/Contents/MacOS/Blender -b -P tools/face3d/build_head.py -- OUT_DIR
# Writes OUT_DIR/face.glb (named parts for the site's three.js rig) and OUT_DIR/preview.png
# (a 3/4 EEVEE render to judge the shape). The reference tiles (tools/face-styles/ref/) are
# for proportion only: an egg head with a big rounded jaw, a long bulbous nose, a C-shaped
# ear, bead eyes set close and high, little worm brows, a low smile, and a tall quiff that
# sweeps up and forward. Front = -Y, up = +Z (Blender); glTF export turns it Y-up.
#
# Parts (names the site relies on): Skin (head + nose + ears, one remeshed surface),
# Hair, EyeL, EyeR, BrowL, BrowR, Mouth. The moving parts are separate objects so the
# site's emotes can transform them; Skin and Hair are smooth, UV-unwrapped meshes.

import bpy, bmesh, math, sys, os, json
from mathutils import Vector, Matrix

OUT = sys.argv[sys.argv.index("--") + 1] if "--" in sys.argv else "/tmp/face3d"

# The form's numbers. Defaults are the hand-tuned head; tools/face3d/fit_params.json (written
# by the fitting run, tools/face3d/fit/) overrides them with the values that match the
# reference image. The fitting worker (fit/fitworker.py) builds the same forms from the
# same names, so a fitted value means the same thing here.
DEFAULTS = dict(
    # camera (Blender coords: front -y, up z)
    cam_yaw=19.0, cam_pitch=3.0, cam_sx=0.0, cam_sy=0.0, cam_roll=-13.0, cam_dist=7.6, cam_fov=27.0, cam_tz=0.38, cam_tx=0.0,
    # head
    sx=0.83, sy=0.86, sz=1.04, se_n=3.5, jaw=0.07, chin=0.18, lowz=1.13, crown=0.08,
    # ears
    ear_yc=0.12, ear_zc=-0.15, ear_ry=0.26, ear_rz=0.32, ear_flare=0.7, ear_x=0.82, ear_r=0.085, ear_bowl=0.1,
    # nose
    nose_rz=0.38, nose_tz=-0.27, nose_ty=-1.17, nose_r0=0.075, nose_r1=0.14, nose_x=0.02,
    # eyes, brows, mouth
    eye_xl=-0.29, eye_xr=0.45, eye_z=0.28, eye_r=0.11,
    brow_z=0.46, brow_arch=0.06, brow_x0=0.2, brow_x1=0.5, brow_r=0.055, brow_dx=0.0,
    mouth_x0=-0.26, mouth_x1=0.14, mouth_z=-0.56, mouth_sag=0.07,
    # hair cap
    cap=1.075, hl0=0.42, hlf=0.2, hlb=0.95, sideburn=0.45,
    # hair locks: the big quiff (6 control points), the low lobe (4), side and back masses
    t0x=-0.3, t0y=0.45, t0z=0.66, t1x=-0.18, t1y=0.05, t1z=0.9, t2x=0.0, t2y=-0.4, t2z=1.1,
    t3x=0.18, t3y=-0.85, t3z=1.24, t4x=0.36, t4y=-1.18, t4z=1.26, t5x=0.48, t5y=-1.36, t5z=1.14,
    top_r0=0.44, top_r1=0.38, top_flat=0.85,
    l0x=-0.05, l0y=-0.6, l0z=0.9, l3x=0.38, l3y=-1.28, l3z=0.9, low_r=0.24,
    near_dz=0.0, far_dz=0.0, side_r=0.28, back_r=0.42,
)
P = dict(DEFAULTS)
_fit = os.path.join(os.path.dirname(os.path.abspath(__file__)), "fit_params.json")
if os.path.exists(_fit):
    P.update(json.load(open(_fit)))
os.makedirs(OUT, exist_ok=True)

bpy.ops.wm.read_factory_settings(use_empty=True)
scene = bpy.context.scene


def obj_active(o):
    bpy.ops.object.select_all(action="DESELECT")
    o.select_set(True)
    bpy.context.view_layer.objects.active = o


def apply_all(o):
    obj_active(o)
    for m in list(o.modifiers):
        bpy.ops.object.modifier_apply(modifier=m.name)


def quad_sphere(name, levels=4):
    bpy.ops.mesh.primitive_cube_add(size=2)
    o = bpy.context.object
    o.name = name
    sub = o.modifiers.new("sub", "SUBSURF")
    sub.levels = levels
    sub.subdivision_type = "CATMULL_CLARK"
    cast = o.modifiers.new("cast", "CAST")
    cast.factor = 1.0
    apply_all(o)
    return o


def deform(o, fn):
    for v in o.data.vertices:
        v.co = fn(v.co.copy())


def ellipsoid(name, loc, scale, rot=(0, 0, 0), levels=3):
    o = quad_sphere(name, levels)
    o.scale = scale
    o.rotation_euler = [math.radians(a) for a in rot]
    o.location = loc
    obj_active(o)
    bpy.ops.object.transform_apply(location=True, rotation=True, scale=True)
    return o


# ---------------------------------------------------------------- helpers for swept shapes
def smoothstep(e0, e1, x):
    t = max(0.0, min(1.0, (x - e0) / (e1 - e0)))
    return t * t * (3 - 2 * t)


def catmull(pts, n):
    """n points along a Catmull-Rom curve through pts (ends clamped)"""
    P = [Vector(p) for p in pts]
    P = [P[0] * 2 - P[1]] + P + [P[-1] * 2 - P[-2]]
    out = []
    segs = len(P) - 3
    for i in range(n):
        u = i / (n - 1) * segs
        k = min(int(u), segs - 1)
        t = u - k
        p0, p1, p2, p3 = P[k], P[k + 1], P[k + 2], P[k + 3]
        out.append(0.5 * ((2 * p1) + (-p0 + p2) * t + (2 * p0 - 5 * p1 + 4 * p2 - p3) * t * t + (-p0 + 3 * p1 - 3 * p2 + p3) * t ** 3))
    return out


def lock(name, pts, r0, r1, flat=0.85, n=64, ring=20, strands=0, twist=0.0, point=0.0):
    """a tube along pts: radius r0 at the root easing to r1, a rounded tip; slightly
    flattened (flat) so it reads as a lock lying on the head, not a hose. strands > 0
    runs that many ridges along it (hair clumping), twisting by `twist` turns; point
    0..1 sharpens the tip from a round end to a flick"""
    path = catmull(pts, n)
    tang = [(path[min(i + 1, n - 1)] - path[max(i - 1, 0)]).normalized() for i in range(n)]
    # parallel-transport frame, seeded so the flat side faces out from the skull
    nrm = (path[0] - Vector((0, 0, 0.3))).normalized()
    nrm = (nrm - tang[0] * nrm.dot(tang[0])).normalized()
    bm = bmesh.new()
    rings = []
    tip_len = 0.22  # the last part of the length closes as a hemisphere
    for i, p in enumerate(path):
        t = i / (n - 1)
        if i:
            nrm = (nrm - tang[i] * nrm.dot(tang[i])).normalized()
        bi = tang[i].cross(nrm)
        r = r0 + (r1 - r0) * smoothstep(0.0, 1.0, t)
        if t > 1 - tip_len:
            s = (t - (1 - tip_len)) / tip_len
            r *= (1 - point) * math.sqrt(max(0.0, 1 - s * s)) + point * (1 - s) ** 1.3
        r = max(r, 0.004)
        ring_pts = []
        for j in range(ring):
            a = 2 * math.pi * j / ring
            rr = r
            if strands:
                # ridges along the lock: rounded crests, narrow grooves between
                rr *= 1 - 0.09 * (1 - abs(math.cos(strands * a / 2 + twist * 2 * math.pi * t))) ** 2.5 * smoothstep(0.0, 0.15, t) * (1 - smoothstep(0.62, 0.85, t))
            ring_pts.append(bm.verts.new(p + (nrm * math.cos(a) * flat + bi * math.sin(a) * 1.2) * rr))
        rings.append(ring_pts)
    for i in range(n - 1):
        for j in range(ring):
            bm.faces.new((rings[i][j], rings[i][(j + 1) % ring], rings[i + 1][(j + 1) % ring], rings[i + 1][j]))
    bm.faces.new(list(reversed(rings[0])))
    bm.faces.new(rings[-1])
    me = bpy.data.meshes.new(name)
    bm.to_mesh(me)
    bm.free()
    o = bpy.data.objects.new(name, me)
    bpy.context.collection.objects.link(o)
    return o



# ---------------------------------------------------------------- skin: the head
# Read off all nine reference tiles (one character): a rounded box of a head, not an egg.
# A broad, fairly flat face plane, full cheeks and a square jaw with a round chin; the
# crown is mostly under the hair. About as wide as it is tall below the hairline.
head = quad_sphere("Skin", 5)


def head_shape(p):
    # a superellipsoid: push the unit sphere toward a cube (n=3: soft box corners)
    n = P["se_n"]
    k = (abs(p.x) ** n + abs(p.y) ** n + abs(p.z) ** n) ** (1 / n)
    # the underside of the jaw and chin stays round (a soft U, not a box bottom)
    k = k + (1.0 - k) * smoothstep(-0.2, -0.9, p.z) * 0.7
    x, y, z = p.x / k, p.y / k, p.z / k
    x, y, z = x * P["sx"], y * P["sy"], z * P["sz"]
    # the lower face: wider at the cheeks and jaw, fuller in front
    if z < 0.2:
        w = smoothstep(0.2, -0.6, z)
        x *= 1 + P["jaw"] * w
        if y < 0:
            y *= 1 + 0.08 * w
    # the chin rounds off underneath; the jaw corners stay square-ish
    if z < -0.7:
        x *= 1 - P["chin"] * smoothstep(-0.7, -1.05, z)
    # the crown narrows a little toward the top and the back of the skull rounds
    if z > 0.3:
        x *= 1 - P["crown"] * smoothstep(0.3, 1.0, z)
    if y > 0.2:
        y *= 1 - 0.05 * smoothstep(0.2, 0.9, z)
    # a long lower face (the reference: eyes to chin is nearly half the whole height)
    if z < 0:
        z *= P["lowz"]
    return Vector((x, y, z))


deform(head, head_shape)

# the nose: a straight wedge from the brow down and out, a rounded tip that points a
# touch down (the 3/4 view shows it breaking the cheek line, not a long sausage)
_nx = P["nose_x"]
nose = lock("Nose", [(_nx, -0.82, P["nose_rz"]), (_nx, -0.98, (P["nose_rz"] + P["nose_tz"]) * 0.45 + 0.02),
                     (_nx, P["nose_ty"] + 0.02, P["nose_tz"] + 0.12), (_nx, P["nose_ty"], P["nose_tz"])],
            P["nose_r0"], P["nose_r1"], flat=1.0)
alae = []  # the reference nose is one clean wedge: no wings
# the ears: big C ears set back on the sides, between eye and mouth height. Each is a
# rim (a tube round a C open toward the face) around a shallow bowl, flared out at the back.
ears = []
for sx in (-1, 1):
    yc, zc = P["ear_yc"], P["ear_zc"]

    def ear_pt(a, ry=P["ear_ry"], rz=P["ear_rz"]):
        y = yc + ry * math.cos(a)
        z = zc + rz * math.sin(a)
        return (sx * (P["ear_x"] + P["ear_flare"] * max(0.0, y - yc + 0.14)), y, z)
    rim = lock(f"EarRim{sx}", [ear_pt(math.radians(a)) for a in (118, 75, 30, -15, -60, -100)], P["ear_r"], P["ear_r"] * 1.1, flat=1.0)
    bowl = ellipsoid(f"EarBowl{sx}", (sx * (P["ear_x"] + P["ear_flare"] * 0.2), yc + 0.07, zc),
                     (P["ear_bowl"], P["ear_ry"] * 0.95, P["ear_rz"] * 0.93), rot=(0, 0, sx * math.degrees(math.atan(P["ear_flare"]))))

    def inner_pt(a):
        y = yc + 0.03 + 0.12 * math.cos(a)
        z = zc + 0.03 + 0.19 * math.sin(a)
        return (sx * (0.96 + 0.45 * max(0.0, y - yc + 0.05)), y, z)
    anti = lock(f"EarAnti{sx}", [inner_pt(math.radians(a)) for a in (95, 55, 15, -25, -60)], 0.035, 0.03, flat=1.0)
    tragus = ellipsoid(f"Tragus{sx}", (sx * 0.95, yc - 0.13, zc - 0.06), (0.045, 0.04, 0.06))
    lobe = ellipsoid(f"Lobe{sx}", (sx * (P["ear_x"] + 0.16), yc + 0.05, zc - P["ear_rz"] * 0.84), (0.06, 0.09, 0.08))
    for o in (anti, tragus):
        bpy.data.objects.remove(o, do_unlink=True)
    # the root: where the ear joins the head along its front edge (no gap to see through)
    root = ellipsoid(f"EarRoot{sx}", (sx * (P["ear_x"] + 0.05), yc - 0.03, zc - P["ear_rz"] * 0.15), (0.12, 0.17, P["ear_rz"] * 0.95))
    ears += [rim, bowl, lobe, root]

# fuse: one surface, softened where the pieces meet (a sculptor's blend)
obj_active(head)
for o in [nose, *alae, *ears]:
    o.select_set(True)
bpy.ops.object.join()
rem = head.modifiers.new("remesh", "REMESH")
rem.mode = "VOXEL"
rem.voxel_size = 0.011  # fine enough to keep the ear folds and the sculpt layer below
rem.use_smooth_shade = True
apply_all(head)
sm = head.modifiers.new("smooth", "CORRECTIVE_SMOOTH")
sm.factor = 0.5
sm.iterations = 5
sm.use_only_smooth = True
apply_all(head)

# the ear's hollow: press the middle of each bowl in, inside the rim
bm = bmesh.new()
bm.from_mesh(head.data)
for v in bm.verts:
    for sx in (-1, 1):
        c = Vector((sx * (P["ear_x"] + 0.19), P["ear_yc"] + 0.07, P["ear_zc"]))
        d = Vector((0, (v.co.y - c.y) / (P["ear_ry"] * 0.65), (v.co.z - c.z) / (P["ear_rz"] * 0.72))).length
        if d < 1.0 and v.co.x * sx > P["ear_x"] + 0.1:
            v.co.x -= sx * 0.045 * (1 - d * d)
bm.to_mesh(head.data)
bm.free()


# ---------------------------------------------------------------- the sculpt layer
# A sculptor's second pass: the planes and landmarks that stop a head reading as a blob.
# Each is a soft bump (+) or dent (-) pushed along the surface normal, on the face only.
def g2(x, z, cx, cz, sx, sz):
    return math.exp(-((x - cx) / sx) ** 2 - ((z - cz) / sz) ** 2)


def seg_dist(px, pz, ax, az, bx, bz):
    vx, vz = bx - ax, bz - az
    t = max(0.0, min(1.0, ((px - ax) * vx + (pz - az) * vz) / (vx * vx + vz * vz)))
    return math.hypot(px - ax - vx * t, pz - az - vz * t), t


def sculpt(p):
    # (2026-10-09) the reference face is a smooth clay plane: no sockets, cheekbones,
    # lips or philtrum. Only the soft fullness of the cheeks and the chin stay.
    x, y, z = p
    front = smoothstep(-0.35, -0.7, y)
    d = 0.0
    for sx in (-1, 1):
        d += 0.025 * g2(x, z, sx * 0.4, -0.3, 0.22, 0.2)
    d += 0.02 * g2(x, z, 0.0, -0.82, 0.25, 0.12)
    return d * front


def sculpt_anatomy(p):  # the detailed pass, kept for styles that want it (not used)
    x, y, z = p
    front = smoothstep(-0.35, -0.7, y)
    d = 0.0
    for sx in (-1, 1):
        d += 0.032 * g2(x, z, sx * 0.3, 0.34, 0.2, 0.055)        # brow ridge over each eye
        d -= 0.04 * g2(x, z, sx * 0.3, 0.15, 0.13, 0.1)          # eye sockets
        d += 0.034 * g2(x, z, sx * 0.47, -0.02, 0.15, 0.09)      # cheekbones
        d += 0.022 * g2(x, z, sx * 0.4, -0.36, 0.18, 0.14)       # the cheek's fullness
        dist, t = seg_dist(x, z, sx * 0.17, -0.17, sx * 0.31, -0.5)  # the smile line, nose wing to mouth
        d -= 0.007 * math.exp(-(dist / 0.025) ** 2) * math.sin(math.pi * t) ** 0.5
    d += 0.012 * g2(x, z, 0.0, 0.3, 0.07, 0.05)                 # between the brows
    d -= 0.011 * g2(x, z, 0.0, -0.36, 0.03, 0.05)               # philtrum groove
    for sx in (-1, 1):
        d += 0.006 * g2(x, z, sx * 0.045, -0.36, 0.02, 0.05)     # its two ridges
    d += 0.016 * g2(x, z, 0.0, -0.44, 0.19, 0.03)               # upper lip
    d += 0.024 * g2(x, z, 0.0, -0.54, 0.16, 0.04)               # lower lip
    d -= 0.022 * g2(x, z, 0.0, -0.64, 0.2, 0.035)               # the dip under the lip
    d += 0.045 * g2(x, z, 0.0, -0.8, 0.2, 0.11)                 # chin
    d = d * front
    for sx in (-1, 1):                                          # temples, on the sides
        d -= 0.025 * math.exp(-((x - sx * 0.8) / 0.1) ** 2 - ((z - 0.38) / 0.13) ** 2 - ((y + 0.35) / 0.25) ** 2)
        d += 0.02 * math.exp(-((x - sx * 0.82) / 0.12) ** 2 - ((z + 0.62) / 0.12) ** 2 - ((y - 0.1) / 0.25) ** 2)  # jaw corner
    return d


bm = bmesh.new()
bm.from_mesh(head.data)
bm.normal_update()
for v in bm.verts:
    v.co += v.normal * sculpt(v.co)
bm.to_mesh(head.data)
bm.free()

# ---------------------------------------------------------------- hair: cap + locks
# Built the way character hair is sculpted (and the way Apple's Memoji styles are: one
# solid mesh per style): a cap that hugs the skull down to a curved hairline, then fat
# swept locks laid on top. Each lock is a tube along a curve, round in section, tapering
# to a rounded tip; the front lock curls over at the end. Separate pieces keep the curl's
# overhang (a deformed shell folds into itself and the remesh fills the fold), and one
# remesh at the end fuses the lock roots into the cap.
hair = quad_sphere("Hair", 5)


def cap_shape(p0):
    p = head_shape(p0) * P["cap"]
    x, y, z = p
    # the hairline: high at the forehead, dipping at the temples, low at the nape
    hl = P["hl0"] + P["hlf"] * smoothstep(0.0, -0.8, y) - P["hlb"] * smoothstep(0.08, 0.5, y)  # the back covers down past the ear
    # the sideburn: a panel of hair running down in front of the ear to below its middle
    hl -= P["sideburn"] * smoothstep(0.7, 0.88, abs(x)) * smoothstep(-0.36, -0.24, y) * smoothstep(0.0, -0.12, y)
    hl += 0.1 * smoothstep(0.5, 0.85, abs(x)) * smoothstep(-0.2, -0.6, y)  # temples recede
    # the nape: a soft U, lowest in the middle of the back, not a straight cut
    hl -= 0.16 * smoothstep(0.3, 0.8, y) * (1 - smoothstep(0.0, 0.75, abs(x)))
    cover = smoothstep(hl - 0.06, hl + 0.1, z)
    # below the line the shell sinks inside the skull, so the edge reads as a hairline
    p = p * (0.8 + 0.2 * cover)  # sunk well inside the skull, so a warped skin never lets it show through
    x, y, z = p
    # a little crown volume and fullness over the ears, so the cap isn't a swim cap
    p = p + p.normalized() * (0.04 * smoothstep(0.4, 1.0, z) * cover)
    # the back is a full rounded mass of hair (only the front was fitted to the drawing; this
    # is what a turn shows), tapering in toward the nape
    p = p + p.normalized() * (0.16 * smoothstep(-0.1, 0.5, p.y) * smoothstep(-0.6, 0.2, p.z) * cover)
    side = smoothstep(0.55, 0.85, abs(x)) * math.exp(-(((z - 0.6) / 0.3) ** 2)) * smoothstep(0.9, 0.0, abs(y))
    p = Vector((p.x * (1 + 0.06 * side), p.y, p.z))
    # combed grooves: on top they run front to back, on the sides they sweep back and down
    top = smoothstep(0.45, 0.85, p.z)
    comb = (math.sin(p.x * 21.0 + 1.7 * math.sin(p.y * 5.0)) * top
            + math.sin((p.z + 0.4 * p.y) * 19.0 + 1.3 * math.sin(p.x * 4.0)) * (1 - top))
    return p  # smooth clay: no combed grooves (the reference hair has none)


deform(hair, cap_shape)


# Front = -y, the sweep goes up and toward +x (the side the 3/4 camera sees), like the
# reference: three fat locks stacked from the back of the crown over to the front.
# The pompadour: the sides stay short; the top is a fat mass that rises from the back of
# the crown toward the face, ending over the forehead in rounded lobes that stack (the
# middle one tallest and furthest forward, curling up at the tip).


def bundle(name, pts, r0, r1, n=3, spread=0.55, flat=0.9):
    """a lock as a bundle of clumps side by side: narrower tubes fanned across the lock's
    width, each ending at its own length in a flicked tip, with strand ridges on each"""
    out = []
    P = [Vector(p) for p in pts]
    for k in range(n):
        f = (k - (n - 1) / 2) / max(1, (n - 1) / 2)  # -1..1 across the lock
        shift = []
        for i, p in enumerate(P):
            tg = (P[min(i + 1, len(P) - 1)] - P[max(i - 1, 0)]).normalized()
            out_dir = (p - Vector((0, 0, 0.2))).normalized()
            side = tg.cross(out_dir).normalized()
            fan = 0.5 + 0.5 * i / (len(P) - 1)  # clumps part more toward the ends
            shift.append(p + side * f * r0 * spread * fan * 1.2 - out_dir * abs(f) * r0 * 0.25)
        cut = 1.0 - 0.07 * abs(f)  # the outer clumps a little shorter
        m = max(3, int(round(len(shift) * cut)))
        out.append(lock(f"{name}{k}", shift[:m], r0 * (0.62 if n > 1 else 1), r1 * 0.7, flat=flat,
                        strands=3, twist=0.15 * f, point=0.92))
    return out


locks = [
    # the reference quiff: ONE big smooth mass rising from the back of the crown to a
    # rounded front lobe, a smaller lobe tucked under it with a crease between them, and
    # side masses so it spans the head. No strands: clay hair is shape, not texture.
    # it sweeps on a diagonal: from the back of his right side up to the front of his
    # left, so in the 3/4 view the wave runs off toward the face side
    lock("LockTop", [(P[f"t{i}x"], P[f"t{i}y"], P[f"t{i}z"]) for i in range(6)], P["top_r0"], P["top_r1"], flat=P["top_flat"]),
    lock("LockLow", [Vector((P["l0x"], P["l0y"], P["l0z"])),
                     Vector((P["l0x"], P["l0y"], P["l0z"])).lerp(Vector((P["l3x"], P["l3y"], P["l3z"])), 0.4) + Vector((0, 0, 0.06)),
                     Vector((P["l0x"], P["l0y"], P["l0z"])).lerp(Vector((P["l3x"], P["l3y"], P["l3z"])), 0.75) + Vector((0, 0, 0.08)),
                     Vector((P["l3x"], P["l3y"], P["l3z"]))], P["low_r"], P["low_r"] * 0.88, flat=0.85),
    lock("LockNear", [(-0.5, 0.5, 0.56 + P["near_dz"]), (-0.52, 0.05, 0.82 + P["near_dz"]), (-0.46, -0.4, 0.96 + P["near_dz"]),
                      (-0.4, -0.75, 0.98 + P["near_dz"])], P["side_r"], P["side_r"] * 0.8, flat=0.8),
    lock("LockFar", [(0.5, 0.5, 0.62 + P["far_dz"]), (0.52, 0.05, 0.9 + P["far_dz"]), (0.46, -0.4, 1.04 + P["far_dz"]),
                     (0.4, -0.72, 1.04 + P["far_dz"])], P["side_r"], P["side_r"] * 0.8, flat=0.8),
    # (no separate back lock: as a tube it read as a slab from behind; the cap carries the back)
]
obj_active(hair)
for o in locks:
    o.select_set(True)
bpy.ops.object.join()
rem = hair.modifiers.new("remesh", "REMESH")
rem.mode = "VOXEL"
rem.voxel_size = 0.012
rem.use_smooth_shade = True
sm = hair.modifiers.new("smooth", "CORRECTIVE_SMOOTH")
sm.factor = 0.6
sm.iterations = 10
sm.use_only_smooth = True
apply_all(hair)

# ---------------------------------------------------------------- weight for the web
# the voxel remesh leaves far more triangles than the silhouette needs; collapse them so
# the GLB stays small (the cel shader and outline don't need the density)
for o, ratio in ((head, 0.16), (hair, 0.12)):
    d = o.modifiers.new("decimate", "DECIMATE")
    d.ratio = ratio
    apply_all(o)

# ---------------------------------------------------------------- surface helper
depsgraph = bpy.context.evaluated_depsgraph_get()


def on_face(x, z, lift=0.0):
    """the point on the skin's front at (x, z), pushed out by `lift`"""
    origin = Vector((x, -3.0, z))
    ok, loc, normal, _ = head.ray_cast(origin, Vector((0, 1, 0)))
    if not ok:
        return Vector((x, -1.0, z)), Vector((0, -1, 0))
    return loc + normal * lift, normal


# ---------------------------------------------------------------- shape keys
# Expressions are shape keys named as ARKit names them (eyeBlinkLeft, jawOpen,
# mouthSmileRight...), so emotes are mixes of named weights 0..1 and could later be driven
# by live face tracking with no remapping. A name can sit on several parts (mouthSmileLeft
# lifts the mouth corner AND bulges the cheek); the site sets every mesh that has it.
# Left/Right are the CHARACTER's own sides: Left = +x. (The object names EyeL/EyeR,
# BrowL/BrowR are older and viewer-side: EyeL is at -x, so it carries the *Right keys.)
# Each moving part is made by a builder; a key is the same builder run with other
# parameters, so the topology always matches.
def recentre(o):
    """origin to the middle of the basis shape (the site's rig pivots parts about it)"""
    vs = [v.co for v in o.data.vertices]
    c = Vector(((min(v.x for v in vs) + max(v.x for v in vs)) / 2, (min(v.y for v in vs) + max(v.y for v in vs)) / 2,
                (min(v.z for v in vs) + max(v.z for v in vs)) / 2))
    for v in o.data.vertices:
        v.co -= c
    if o.data.shape_keys:
        for kb in o.data.shape_keys.key_blocks:
            for d in kb.data:
                d.co -= c
    o.location = c


def add_key(o, name, coords):
    if o.data.shape_keys is None:
        o.shape_key_add(name="Basis", from_mix=False)
    kb = o.shape_key_add(name=name, from_mix=False)
    kb.value = 0.0  # new keys come in at 1 (Blender 5), which the GLB keeps as the default weight
    for d, co in zip(kb.data, coords):
        d.co = co


def keyed(name, build, base, keys):
    """build(**params) makes a mesh in world space; base is the rest pose, keys maps a
    key name to the params that differ from it"""
    o = build(name, **base)
    for k, params in keys.items():
        t = build(name + "_tmp", **{**base, **params})
        assert len(t.data.vertices) == len(o.data.vertices), (name, k)
        add_key(o, k, [v.co.copy() for v in t.data.vertices])
        bpy.data.objects.remove(t, do_unlink=True)
    recentre(o)
    return o


def finish(name, bm, subdiv=1):
    me = bpy.data.meshes.new(name)
    bm.to_mesh(me)
    bm.free()
    o = bpy.data.objects.new(name, me)
    scene.collection.objects.link(o)
    if subdiv:
        sub = o.modifiers.new("sub", "SUBSURF")
        sub.levels = subdiv
        apply_all(o)
    return o


def sweep(bm, path, radius, cyclic=False, ring=10, ref=Vector((0, -1, 0))):
    """a tube along path; radius(t) gives the section size. The section is framed on
    `ref` (the face's outward direction), so every variant twists the same way"""
    n = len(path)
    rings = []
    for i, p in enumerate(path):
        if cyclic:
            tg = (path[(i + 1) % n] - path[i - 1]).normalized()
        else:
            tg = (path[min(i + 1, n - 1)] - path[max(i - 1, 0)]).normalized()
        nv = (ref - tg * ref.dot(tg)).normalized()
        bv = tg.cross(nv)
        r = max(radius(i / (n - 1)), 0.003)
        rings.append([bm.verts.new(p + (nv * math.cos(a) + bv * math.sin(a)) * r)
                      for a in (2 * math.pi * j / ring for j in range(ring))])
    for i in range(n if cyclic else n - 1):
        A, B = rings[i], rings[(i + 1) % n]
        for j in range(ring):
            bm.faces.new((A[j], A[(j + 1) % ring], B[(j + 1) % ring], B[j]))
    if not cyclic:
        bm.faces.new(list(reversed(rings[0])))
        bm.faces.new(rings[-1])


def rounded_ends(r, cap=0.12):
    """radius r along the middle, closing like a hemisphere at both ends (a worm)"""
    def f(t):
        e = min(t, 1 - t)
        return r * (math.sqrt(1 - ((cap - e) / cap) ** 2) if e < cap else 1.0)
    return f


# ---------------------------------------------------------------- eyes and lids
EYE_R = P["eye_r"]
EYES = {}
for name, x in (("EyeL", P["eye_xl"]), ("EyeR", P["eye_xr"])):
    p, n = on_face(x, P["eye_z"], EYE_R * 0.35)
    e = ellipsoid(name, p, (EYE_R, EYE_R * 0.7, EYE_R))
    # keep the pivot at the eye's centre
    obj_active(e)
    bpy.ops.object.origin_set(type="ORIGIN_GEOMETRY", center="BOUNDS")
    EYES[name] = p.copy()


# A lid is a thick shell around the bead, hinged on the eye's horizontal axis. Angles
# are measured round that axis from straight ahead (0) up (+90) or down (-90); `up` is
# where the upper lid's edge sits, `low` the lower lid's. Open, the upper lid only caps
# the top of the bead (most of it sinks into the skin); a blink brings it down to meet
# the lower lid, which rises a little.
def build_lids(name, c, up=64.0, low=-72.0):
    R = EYE_R
    bm = bmesh.new()

    def shell(a0, a1, NP=14, NT=10):
        outer, inner = (1.1 * R, 0.84 * R, 1.1 * R), (1.02 * R, 0.74 * R, 1.02 * R)  # hugging the bead

        def pt(rad, phi, th):
            return c + Vector((rad[0] * math.sin(phi), -rad[1] * math.cos(phi) * math.cos(th), rad[2] * math.cos(phi) * math.sin(th)))
        grids = []
        for rad in (outer, inner):
            g = []
            for i in range(NP + 1):
                phi = math.radians(-82 + 164 * i / NP)
                g.append([bm.verts.new(pt(rad, phi, math.radians(a0 + (a1 - a0) * j / NT))) for j in range(NT + 1)])
            grids.append(g)
        O, I = grids
        for i in range(NP):
            for j in range(NT):
                bm.faces.new((O[i][j], O[i + 1][j], O[i + 1][j + 1], O[i][j + 1]))
                bm.faces.new((I[i][j + 1], I[i + 1][j + 1], I[i + 1][j], I[i][j]))
        for i in range(NP):  # the two edges along the lid (the lash line and the hidden one)
            for j in (0, NT):
                bm.faces.new((O[i][j], I[i][j], I[i + 1][j], O[i + 1][j]))
        for i in (0, NP):  # the two ends at the corners of the eye
            for j in range(NT):
                bm.faces.new((O[i][j], O[i][j + 1], I[i][j + 1], I[i][j]))
    shell(up, up + 150)
    shell(low - 105, low, NT=8)
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
    return finish(name, bm)


for lid, eye, side in (("LidL", "EyeL", "Right"), ("LidR", "EyeR", "Left")):
    keyed(lid, lambda nm, **k: build_lids(nm, EYES[eye], **k), {"up": 96.0, "low": -100.0}, {
        f"eyeBlink{side}": {"up": -42.0, "low": -50.0},
        f"eyeSquint{side}": {"up": 42.0, "low": -28.0},
        f"eyeWide{side}": {"up": 88.0, "low": -84.0},
    })


# ---------------------------------------------------------------- brows (worms on the skin)
def build_brow(name, x0, x1, inner_end, inner_up=0.0, outer_up=0.0, down=0.0):
    """x0..x1 across the face at the brow line; inner_end is 0 or 1 (which end is nearer
    the nose). inner_up raises the inner end (worry), outer_up the outer (a questioning
    arch), down lowers and knits it (anger)"""
    pts = []
    for i in range(14):
        t = i / 13
        wi = t if inner_end == 1 else 1 - t
        z = P["brow_z"] - P["brow_arch"] * (4 * (t - 0.5) ** 2 - 1)
        z += inner_up * 0.09 * wi + outer_up * 0.08 * (1 - wi) - down * (0.025 + 0.05 * wi)
        x = x0 + (x1 - x0) * t
        x += (down * 0.03 - inner_up * 0.01) * wi * (1 if inner_end == 1 else -1)  # knit toward the nose
        p, _ = on_face(x, z, 0.02)
        pts.append(p)
    bm = bmesh.new()
    sweep(bm, pts, rounded_ends(P["brow_r"], 0.25))
    return finish(name, bm)


keyed("BrowL", lambda nm, **k: build_brow(nm, -P["brow_x1"] + P["brow_dx"], -P["brow_x0"] + P["brow_dx"], 1, **k), {}, {
    "browInnerUp": {"inner_up": 1.0}, "browOuterUpRight": {"outer_up": 1.0}, "browDownRight": {"down": 1.0}})
keyed("BrowR", lambda nm, **k: build_brow(nm, P["brow_x0"] + P["brow_dx"], P["brow_x1"] + P["brow_dx"], 0, **k), {}, {
    "browInnerUp": {"inner_up": 1.0}, "browOuterUpLeft": {"outer_up": 1.0}, "browDownLeft": {"down": 1.0}})


# ---------------------------------------------------------------- mouth: a closed loop of lip
# At rest the upper and lower lip lie almost together, so the loop reads as one smile
# line; jawOpen drops the lower lip and MouthInner (a dark sheet between the lips) fills
# the opening. Corners lift for a smile, drop for a frown; pucker narrows and rounds it.
MOUTH = dict(x0=P["mouth_x0"], x1=P["mouth_x1"], zc=P["mouth_z"], sag=P["mouth_sag"])


def lips(smileL=0.0, smileR=0.0, frownL=0.0, frownR=0.0, open=0.0, pucker=0.0, n=20):
    cx = (MOUTH["x0"] + MOUTH["x1"]) / 2
    half = (MOUTH["x1"] - MOUTH["x0"]) / 2 * (1 - 0.5 * pucker) * (1 + 0.08 * (smileL + smileR))
    U, L = [], []
    for i in range(n):
        t = i / (n - 1)
        x = cx + half * (2 * t - 1)
        z = MOUTH["zc"] + MOUTH["sag"] * (1 - pucker) * (1 - 0.6 * open) * (4 * (t - 0.5) ** 2 - 1)
        z += (0.07 * smileL - 0.06 * frownL) * t * t + (0.07 * smileR - 0.06 * frownR) * (1 - t) ** 2
        bump = math.sin(math.pi * t)
        U.append((x, z + (0.03 * open + 0.03 * pucker) * bump))
        L.append((x, z - 0.012 * bump - (0.2 * open + 0.05 * pucker) * bump ** 0.6))
    return U, L


def build_mouth(name, **k):
    U, L = lips(**k)
    loop = U + list(reversed(L[1:-1]))
    pts = [on_face(x, z, 0.008)[0] for x, z in loop]  # half sunk: reads as a groove pressed into the clay
    bm = bmesh.new()
    sweep(bm, pts, lambda t: 0.016, cyclic=True)
    return finish(name, bm)


def build_inner(name, rows=5, **k):
    U, L = lips(**k)
    bm = bmesh.new()
    g = [[bm.verts.new(on_face(u[0], u[1] + (l[1] - u[1]) * r / rows, 0.012)[0]) for r in range(rows + 1)] for u, l in zip(U, L)]
    for i in range(len(g) - 1):
        for r in range(rows):
            bm.faces.new((g[i][r], g[i][r + 1], g[i + 1][r + 1], g[i + 1][r]))
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
    return finish(name, bm, subdiv=0)


MOUTH_KEYS = {
    "jawOpen": {"open": 1.0}, "mouthSmileLeft": {"smileL": 1.0}, "mouthSmileRight": {"smileR": 1.0},
    "mouthFrownLeft": {"frownL": 1.0}, "mouthFrownRight": {"frownR": 1.0}, "mouthPucker": {"pucker": 1.0},
}
keyed("Mouth", build_mouth, {}, MOUTH_KEYS)
keyed("MouthInner", build_inner, {}, MOUTH_KEYS)

# ---------------------------------------------------------------- the skin's own keys
# (after the decimate, so the keys match the exported topology)
def skin_key(name, fn):
    cos = [v.co.copy() for v in head.data.vertices]
    nos = [v.normal.copy() for v in head.data.vertices]
    add_key(head, name, [fn(c, n) for c, n in zip(cos, nos)])


def falloff(p, c, r):
    return math.exp(-((p - c).length_squared) / (r * r))


cheekL, _ = on_face(0.28, -0.45)
cheekR, _ = on_face(-0.4, -0.45)
puffL, _ = on_face(0.44, -0.64)
puffR, _ = on_face(-0.44, -0.64)
# jawOpen: the face below the mouth drops and tucks back a touch
skin_key("jawOpen", lambda p, n: p + Vector((0, 0.025, -0.12)) * smoothstep(-0.7, -1.12, p.z) * smoothstep(0.6, -0.3, p.y))
# a smile pushes the cheek up and out on that side
skin_key("mouthSmileLeft", lambda p, n: p + Vector((0.01, -0.035, 0.04)) * falloff(p, cheekL, 0.2))
skin_key("mouthSmileRight", lambda p, n: p + Vector((-0.01, -0.035, 0.04)) * falloff(p, cheekR, 0.2))
skin_key("cheekPuff", lambda p, n: p + n * 0.07 * (falloff(p, puffL, 0.26) + falloff(p, puffR, 0.26)))

# ---------------------------------------------------------------- props (shown per skin)
# The site hides these unless the skin asks for them (noir wears the fedora, riso the pin).
#
# THE FEDORA. As in Apple's Memoji patent, a hat doesn't sit on top of the hair: the hair
# is squashed under it. Hair carries a "hatCompress" key that presses everything above
# the hatline down and in, inside the crown; the skin that shows the hat sets it to 1.
HAT_Z = 0.5        # where the crown meets the brim, over the forehead
HAT_R = (1.02, 1.1)  # crown radii (x, y) at the base
HAT_H = 0.78       # crown height


def build_hat():
    bm = bmesh.new()
    U, V = 40, 14
    rings = []
    for j in range(V + 1):
        v = j / V
        if v < 0.75:  # the wall, tapering a touch
            t = v / 0.75
            k, z = 1 - 0.07 * t, HAT_Z + HAT_H * t
        else:  # the rounded top
            t = (v - 0.75) / 0.25
            k, z = (1 - 0.07) * math.cos(t * math.pi / 2) ** 0.6, HAT_Z + HAT_H + 0.08 * math.sin(t * math.pi / 2)
        ring = []
        for i in range(U):
            a = 2 * math.pi * i / U
            x, y = HAT_R[0] * k * math.cos(a), HAT_R[1] * k * math.sin(a)
            zz = z
            if v > 0.6:  # the crease down the middle, front to back, and the front pinch
                zz -= 0.09 * math.exp(-(x / 0.28) ** 2) * smoothstep(0.6, 1.0, v)
                if y < 0:
                    x *= 1 - 0.12 * smoothstep(0.6, 1.0, v) * (-y / HAT_R[1])
            ring.append(bm.verts.new((x, y, zz)))
        rings.append(ring)
    for j in range(V):
        for i in range(U):
            bm.faces.new((rings[j][i], rings[j][(i + 1) % U], rings[j + 1][(i + 1) % U], rings[j + 1][i]))
    bm.faces.new(rings[-1])
    bm.faces.new(list(reversed(rings[0])))
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
    crown = finish("Hat", bm)
    # the brim: a thick ring, dipping at front and back, curling up at the sides
    bm = bmesh.new()
    U, R = 48, 6
    grid = []
    for i in range(U):
        a = 2 * math.pi * i / U
        ca, sa = math.cos(a), math.sin(a)
        row = []
        for j in range(R):
            b = 2 * math.pi * j / R
            w = 0.25 + 0.25 * math.cos(b)  # across the brim, 0..0.5 out from the crown
            r = 0.96 + w / 1.05
            x, y = HAT_R[0] * r * ca, HAT_R[1] * r * sa
            z = HAT_Z + 0.04 * math.sin(b) + (0.09 * ca * ca - 0.05 * sa * sa) * (w / 0.48) ** 1.5
            row.append(bm.verts.new((x, y, z)))
        grid.append(row)
    for i in range(U):
        for j in range(R):
            bm.faces.new((grid[i][j], grid[i][(j + 1) % R], grid[(i + 1) % U][(j + 1) % R], grid[(i + 1) % U][j]))
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
    brim = finish("HatBrim", bm)
    # the band: a short ribbon round the base of the crown
    bm = bmesh.new()
    rows = []
    for j in range(3):
        z = HAT_Z + 0.02 + 0.08 * j
        rows.append([bm.verts.new((HAT_R[0] * 1.012 * math.cos(2 * math.pi * i / 40), HAT_R[1] * 1.012 * math.sin(2 * math.pi * i / 40), z)) for i in range(40)])
    for j in range(2):
        for i in range(40):
            bm.faces.new((rows[j][i], rows[j][(i + 1) % 40], rows[j + 1][(i + 1) % 40], rows[j + 1][i]))
    bmesh.ops.solidify(bm, geom=bm.faces[:], thickness=0.02)
    band = finish("HatBand", bm, subdiv=0)
    obj_active(crown)
    brim.select_set(True)
    bpy.ops.object.join()
    # worn tipped forward and a little to his left, like the noir tile
    for o in (crown, band):
        o.rotation_euler = (math.radians(-7), math.radians(-5), 0)
        obj_active(o)
        bpy.ops.object.transform_apply(rotation=True)
    return crown, band


hat, hat_band = build_hat()

# the hair under the hat: above the hatline everything is pressed down (the quiff folds
# flat) and drawn in to sit inside the crown
hz = [v.co.z for v in hair.data.vertices]
ztop = max(hz)


def compress(p):
    x, y, z = p
    lo = HAT_Z - 0.05
    if z > lo:
        z = lo + (z - lo) * (HAT_H - 0.32) / (ztop - lo)
        k = smoothstep(lo - 0.05, lo + 0.08, p.z)
        lim = Vector((x / (HAT_R[0] * 0.9), y / (HAT_R[1] * 0.9), 0)).length
        if lim > 1:
            x, y = x / (1 + (lim - 1) * k), y / (1 + (lim - 1) * k)
    return Vector((x, y, z))


add_key(hair, "hatCompress", [compress(v.co.copy()) for v in hair.data.vertices])

# THE SAFETY PIN through the lower rim of his right ear (the riso tile)
def build_pin():
    bm = bmesh.new()
    base = Vector((-1.06, 0.3, -0.45))
    axis = Vector((0.0, 0.5, -0.87)).normalized()  # hangs down and back
    side = Vector((0.15, 0.0, 0.0)).normalized()
    L, gap = 0.44, 0.075
    for off in (0.0, gap):
        sweep(bm, [base + side * off + axis * (L * t / 7) for t in range(8)], rounded_ends(0.018, 0.04), ring=8)
    coil = [base + axis * (L + 0.03) + (side * math.cos(a) * 0.05 + axis * math.sin(a) * 0.045) + side * gap / 2
            for a in (2 * math.pi * i / 12 for i in range(13))]
    sweep(bm, coil, lambda t: 0.016, ring=8)
    head = [base + axis * (-0.02) + side * (gap * t / 5 - 0.012) for t in range(6)]
    sweep(bm, head, rounded_ends(0.034, 0.2), ring=10)
    return finish("Pin", bm)


pin = build_pin()

# ---------------------------------------------------------------- materials and UVs
def mat(name, color, rough=0.55):
    m = bpy.data.materials.new(name)
    m.use_nodes = True
    b = m.node_tree.nodes.get("Principled BSDF")
    b.inputs["Base Color"].default_value = (*color, 1)
    b.inputs["Roughness"].default_value = rough
    return m


def srgb(h):
    h = h.lstrip("#")
    c = [int(h[i:i + 2], 16) / 255 for i in (0, 2, 4)]
    return tuple(((x + 0.055) / 1.055) ** 2.4 if x > 0.04045 else x / 12.92 for x in c)


MATS = {
    "Skin": mat("skin", srgb("f4c7aa"), 0.6),
    "Hair": mat("hair", srgb("5a2f1f"), 0.35),
    "EyeL": mat("eye", srgb("21140f"), 0.2),
    "Brow": mat("brow", srgb("4a2618"), 0.4),
    "Mouth": mat("mouth", srgb("7a3527"), 0.45),
    "MouthInner": mat("mouthInner", srgb("3b100c"), 0.6),
    "Hat": mat("hat", srgb("2a2724"), 0.7),
    "HatBand": mat("hatband", srgb("121110"), 0.5),
    "Pin": mat("pin", srgb("b8b8b8"), 0.2),
}
for o in bpy.data.objects:
    if o.type != "MESH":
        continue
    key = "EyeL" if o.name.startswith("Eye") else "Brow" if o.name.startswith("Brow") else o.name
    o.data.materials.clear()
    o.data.materials.append(MATS.get(key, MATS["Skin"]))
    obj_active(o)
    bpy.ops.object.shade_smooth()
    bpy.ops.object.mode_set(mode="EDIT")
    bpy.ops.mesh.select_all(action="SELECT")
    bpy.ops.uv.smart_project(angle_limit=math.radians(66), island_margin=0.02)
    bpy.ops.object.mode_set(mode="OBJECT")

# ---------------------------------------------------------------- export
bpy.ops.object.select_all(action="SELECT")
bpy.ops.export_scene.gltf(filepath=os.path.join(OUT, "face.glb"), export_format="GLB", use_selection=True, export_apply=True)

# ---------------------------------------------------------------- preview render (3/4 view)
for o in (hat, hat_band, pin):
    o.hide_render = True  # the plain previews show him bare-headed

cam_data = bpy.data.cameras.new("cam")
cam_data.lens = 58
cam = bpy.data.objects.new("cam", cam_data)
scene.collection.objects.link(cam)
cam.location = (-3.0, -5.9, 0.9)
target = Vector((0, 0, 0.55))
cam.rotation_euler = (target - cam.location).to_track_quat("-Z", "Y").to_euler()
scene.camera = cam
key = bpy.data.objects.new("key", bpy.data.lights.new("key", "AREA"))
key.data.energy = 900
key.data.size = 3
key.location = (-3, -4, 4)
key.rotation_euler = (Vector((0, 0, 0.3)) - key.location).to_track_quat("-Z", "Y").to_euler()
scene.collection.objects.link(key)
fill = bpy.data.objects.new("fill", bpy.data.lights.new("fill", "AREA"))
fill.data.energy = 300
fill.data.size = 4
fill.location = (4, -3, 1)
fill.rotation_euler = (Vector((0, 0, 0.3)) - fill.location).to_track_quat("-Z", "Y").to_euler()
scene.collection.objects.link(fill)
world = bpy.data.worlds.new("w")
world.use_nodes = True
world.node_tree.nodes["Background"].inputs[0].default_value = (0.82, 0.81, 0.8, 1)
world.node_tree.nodes["Background"].inputs[1].default_value = 0.6
scene.world = world
for eng in ("BLENDER_EEVEE_NEXT", "BLENDER_EEVEE"):
    try:
        scene.render.engine = eng
        break
    except TypeError:
        continue
scene.render.resolution_x = 900
scene.render.resolution_y = 1000
# (FACE3D_NO_PREVIEW=1: skip the preview and pose renders; the fit pipelines only need the
# model, and on a machine without a GPU each EEVEE render takes a minute)
PREVIEW = not os.environ.get("FACE3D_NO_PREVIEW")
scene.render.filepath = os.path.join(OUT, "preview.png")
if PREVIEW: bpy.ops.render.render(write_still=True)
cam.location = (-6.8, -0.4, 0.9)
cam.rotation_euler = (target - cam.location).to_track_quat("-Z", "Y").to_euler()
scene.render.filepath = os.path.join(OUT, "preview-side.png")
if PREVIEW: bpy.ops.render.render(write_still=True)

# a sheet of expressions (front-ish 3/4), to judge the keys
POSES = {
    "blink": {"eyeBlinkLeft": 1, "eyeBlinkRight": 1},
    "grin": {"mouthSmileLeft": 1, "mouthSmileRight": 1, "eyeSquintLeft": 0.7, "eyeSquintRight": 0.7, "jawOpen": 0.3},
    "surprised": {"jawOpen": 0.8, "mouthPucker": 0.5, "eyeWideLeft": 1, "eyeWideRight": 1, "browInnerUp": 1, "browOuterUpLeft": 0.8, "browOuterUpRight": 0.8},
    "angry": {"browDownLeft": 1, "browDownRight": 1, "mouthFrownLeft": 0.8, "mouthFrownRight": 0.8, "eyeSquintLeft": 0.4, "eyeSquintRight": 0.4},
    "wink": {"eyeBlinkLeft": 1, "mouthSmileLeft": 0.9, "mouthSmileRight": 0.2, "browDownLeft": 0.4, "browOuterUpRight": 0.5},
    "puff": {"cheekPuff": 1, "mouthPucker": 0.7},
    "hat": {"hatCompress": 1},
}
cam.location = (-1.6, -6.6, 0.7)
cam.rotation_euler = (Vector((0, 0, 0.3)) - cam.location).to_track_quat("-Z", "Y").to_euler()
scene.render.resolution_x = 600
scene.render.resolution_y = 700
for pose, w in POSES.items():
    for o in (hat, hat_band):
        o.hide_render = pose != "hat"
    for o in bpy.data.objects:
        if o.type == "MESH" and o.data.shape_keys:
            for kb in o.data.shape_keys.key_blocks[1:]:
                kb.value = w.get(kb.name, 0.0)
    scene.render.filepath = os.path.join(OUT, f"pose-{pose}.png")
    if PREVIEW: bpy.ops.render.render(write_still=True)
for o in bpy.data.objects:
    if o.type == "MESH" and o.data.shape_keys:
        for kb in o.data.shape_keys.key_blocks[1:]:
            kb.value = 0.0

# counts, for the log
for o in bpy.data.objects:
    if o.type == "MESH":
        print(f"PART {o.name}: {len(o.data.vertices)} verts, {len(o.data.polygons)} faces")
bpy.ops.wm.save_as_mainfile(filepath=os.path.join(OUT, "face.blend"))
print("WROTE", os.path.join(OUT, "face.glb"))
