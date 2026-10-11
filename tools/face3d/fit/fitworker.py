# Fitting worker: a fast parametric copy of tools/face3d/build_head.py (no remesh, no keys),
# rendered as flat part IDs with Workbench. Run:
#   Blender -b -P fitworker.py -- OUTDIR WORKER_ID
# then write one JSON params object per line to stdin; for each it renders OUTDIR/w{ID}.png
# and prints "RES {json}" with the projected landmarks.
import bpy, bmesh, math, sys, os, json
from mathutils import Vector
from bpy_extras.object_utils import world_to_camera_view

argv = sys.argv[sys.argv.index("--") + 1:]
OUT, WID = argv[0], argv[1]
W, H = int(argv[2]) if len(argv) > 2 else 200, int(argv[3]) if len(argv) > 3 else 215

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


def smoothstep(e0, e1, x):
    t = max(0.0, min(1.0, (x - e0) / (e1 - e0)))
    return t * t * (3 - 2 * t)


def catmull(pts, n):
    P = [Vector(p) for p in pts]
    P = [P[0] * 2 - P[1]] + P + [P[-1] * 2 - P[-2]]
    out, segs = [], len(P) - 3
    for i in range(n):
        u = i / (n - 1) * segs
        k = min(int(u), segs - 1)
        t = u - k
        p0, p1, p2, p3 = P[k], P[k + 1], P[k + 2], P[k + 3]
        out.append(0.5 * ((2 * p1) + (-p0 + p2) * t + (2 * p0 - 5 * p1 + 4 * p2 - p3) * t * t + (-p0 + 3 * p1 - 3 * p2 + p3) * t ** 3))
    return out


def mesh_obj(name, bm, col):
    me = bpy.data.meshes.new(name)
    bm.to_mesh(me)
    bm.free()
    me.shade_smooth()
    o = bpy.data.objects.new(name, me)
    bpy.context.scene.collection.objects.link(o)
    o.color = col
    return o


def tube(bm, path, radius, flat=1.0, wide=1.0, ring=14, closed=True, ref=None):
    n = len(path)
    tang = [(path[min(i + 1, n - 1)] - path[max(i - 1, 0)]).normalized() for i in range(n)]
    nrm = ref if ref is not None else (path[0] - Vector((0, 0, 0.3))).normalized()
    rings = []
    for i, p in enumerate(path):
        nrm = (nrm - tang[i] * nrm.dot(tang[i])).normalized()
        bi = tang[i].cross(nrm)
        r = max(radius(i / (n - 1)), 0.003)
        rings.append([bm.verts.new(p + (nrm * math.cos(a) * flat + bi * math.sin(a) * wide) * r)
                      for a in (2 * math.pi * j / ring for j in range(ring))])
    for i in range(n - 1):
        for j in range(ring):
            bm.faces.new((rings[i][j], rings[i][(j + 1) % ring], rings[i + 1][(j + 1) % ring], rings[i + 1][j]))
    if closed:
        bm.faces.new(list(reversed(rings[0])))
        bm.faces.new(rings[-1])


def lock_r(r0, r1, tip=0.22):
    def f(t):
        r = r0 + (r1 - r0) * smoothstep(0, 1, t)
        if t > 1 - tip:
            s = (t - (1 - tip)) / tip
            r *= math.sqrt(max(0.0, 1 - s * s))
        return r
    return f


def ends(r, cap=0.2):
    def f(t):
        e = min(t, 1 - t)
        return r * (math.sqrt(max(0.0, 1 - ((cap - e) / cap) ** 2)) if e < cap else 1.0)
    return f


def sphere_grid(bm, fn, nu=40, nv=24):
    """a UV sphere through fn(unit direction) -> point"""
    rows = []
    for j in range(1, nv):
        th = math.pi * j / nv
        rows.append([bm.verts.new(fn(Vector((math.sin(th) * math.cos(2 * math.pi * i / nu), math.sin(th) * math.sin(2 * math.pi * i / nu), math.cos(th))))) for i in range(nu)])
    top = bm.verts.new(fn(Vector((0, 0, 1))))
    bot = bm.verts.new(fn(Vector((0, 0, -1))))
    for j in range(len(rows) - 1):
        for i in range(nu):
            bm.faces.new((rows[j][i], rows[j][(i + 1) % nu], rows[j + 1][(i + 1) % nu], rows[j + 1][i]))
    for i in range(nu):
        bm.faces.new((top, rows[0][(i + 1) % nu], rows[0][i]))
        bm.faces.new((bot, rows[-1][i], rows[-1][(i + 1) % nu]))


SKIN, HAIR, EYE, BROW = (1, 0, 0, 1), (0, 1, 0, 1), (0, 0, 1, 1), (1, 1, 0, 1)


def build(P):
    for o in list(bpy.data.objects):
        if o.type == "MESH":
            bpy.data.objects.remove(o, do_unlink=True)
    for m in list(bpy.data.meshes):
        bpy.data.meshes.remove(m)

    def head_shape(p):
        n = P["se_n"]
        k = (abs(p.x) ** n + abs(p.y) ** n + abs(p.z) ** n) ** (1 / n)
        k = k + (1.0 - k) * smoothstep(-0.2, -0.9, p.z) * 0.7
        x, y, z = p.x / k, p.y / k, p.z / k
        x, y, z = x * P["sx"], y * P["sy"], z * P["sz"]
        if z < 0.2:
            w = smoothstep(0.2, -0.6, z)
            x *= 1 + P["jaw"] * w
            if y < 0:
                y *= 1 + 0.08 * w
        if z < -0.7:
            x *= 1 - P["chin"] * smoothstep(-0.7, -1.05, z)
        if z > 0.3:
            x *= 1 - P["crown"] * smoothstep(0.3, 1.0, z)
        if y > 0.2:
            y *= 1 - 0.05 * smoothstep(0.2, 0.9, z)
        if z < 0:
            z *= P["lowz"]
        return Vector((x, y, z))

    bm = bmesh.new()
    sphere_grid(bm, head_shape)
    head = mesh_obj("Skin", bm, SKIN)

    # nose
    bm = bmesh.new()
    nx = P["nose_x"]
    tube(bm, catmull([(nx, -0.82, P["nose_rz"]), (nx, -0.98, (P["nose_rz"] + P["nose_tz"]) * 0.45 + 0.02),
                      (nx, P["nose_ty"] + 0.02, P["nose_tz"] + 0.12), (nx, P["nose_ty"], P["nose_tz"])], 20),
         lock_r(P["nose_r0"], P["nose_r1"]))
    mesh_obj("Nose", bm, SKIN)

    # ears: rim + bowl + root
    for sx in (-1, 1):
        yc, zc = P["ear_yc"], P["ear_zc"]

        def ear_pt(a):
            y = yc + P["ear_ry"] * math.cos(a)
            z = zc + P["ear_rz"] * math.sin(a)
            return (sx * (P["ear_x"] + P["ear_flare"] * max(0.0, y - yc + 0.14)), y, z)
        bm = bmesh.new()
        tube(bm, catmull([ear_pt(math.radians(a)) for a in (118, 75, 30, -15, -60, -100)], 24), lock_r(P["ear_r"], P["ear_r"] * 1.1))
        # the bowl: a disc in the plane of the rim
        cx = sx * (P["ear_x"] + P["ear_flare"] * 0.2)

        def disc(d):
            return Vector((cx + sx * d.x * P["ear_bowl"] + sx * P["ear_flare"] * (d.y * P["ear_ry"] * 0.85), yc + 0.06 + d.y * P["ear_ry"] * 0.85, zc + d.z * P["ear_rz"] * 0.85))
        sphere_grid(bm, disc, 20, 10)
        mesh_obj(f"Ear{sx}", bm, SKIN)

    # hair cap
    def cap_shape(p0):
        p = head_shape(p0) * P["cap"]
        x, y, z = p
        hl = P["hl0"] + P["hlf"] * smoothstep(0.0, -0.8, y) - P["hlb"] * smoothstep(0.08, 0.5, y)
        hl -= P["sideburn"] * smoothstep(0.7, 0.88, abs(x)) * smoothstep(-0.36, -0.24, y) * smoothstep(0.0, -0.12, y)
        hl += 0.1 * smoothstep(0.5, 0.85, abs(x)) * smoothstep(-0.2, -0.6, y)
        cover = smoothstep(hl - 0.06, hl + 0.1, z)
        p = p * (0.9 + 0.1 * cover)
        p = p + p.normalized() * (0.04 * smoothstep(0.4, 1.0, p.z) * cover)
        return p
    bm = bmesh.new()
    sphere_grid(bm, cap_shape, 48, 30)
    mesh_obj("Cap", bm, HAIR)

    # locks
    bm = bmesh.new()
    top = [(P[f"t{i}x"], P[f"t{i}y"], P[f"t{i}z"]) for i in range(6)]
    tube(bm, catmull(top, 40), lock_r(P["top_r0"], P["top_r1"]), flat=P["top_flat"], wide=1.2, ring=18)
    l0, l3 = Vector((P["l0x"], P["l0y"], P["l0z"])), Vector((P["l3x"], P["l3y"], P["l3z"]))
    low = [l0, l0.lerp(l3, 0.4) + Vector((0, 0, 0.06)), l0.lerp(l3, 0.75) + Vector((0, 0, 0.08)), l3]
    tube(bm, catmull(low, 24), lock_r(P["low_r"], P["low_r"] * 0.88), flat=0.85, wide=1.2, ring=16)
    nd, fd = P["near_dz"], P["far_dz"]
    tube(bm, catmull([(-0.5, 0.5, 0.56 + nd), (-0.52, 0.05, 0.82 + nd), (-0.46, -0.4, 0.96 + nd), (-0.4, -0.75, 0.98 + nd)], 24),
         lock_r(P["side_r"], P["side_r"] * 0.8), flat=0.8, wide=1.2, ring=16)
    tube(bm, catmull([(0.5, 0.5, 0.62 + fd), (0.52, 0.05, 0.9 + fd), (0.46, -0.4, 1.04 + fd), (0.4, -0.72, 1.04 + fd)], 24),
         lock_r(P["side_r"], P["side_r"] * 0.8), flat=0.8, wide=1.2, ring=16)
    tube(bm, catmull([(0.0, 0.75, 0.3), (0.0, 0.7, 0.62), (0.0, 0.45, 0.86), (0.0, 0.15, 0.98)], 24),
         lock_r(P["back_r"], P["back_r"] * 0.95), flat=0.9, wide=1.2, ring=16)
    mesh_obj("Locks", bm, HAIR)

    # face features, placed on the skin by ray cast from the front
    bpy.context.view_layer.update()

    def on_face(x, z, lift=0.0):
        ok, loc, nrm, _ = head.ray_cast(Vector((x, -3.0, z)), Vector((0, 1, 0)))
        if not ok:
            return Vector((x, -1.0, z))
        return loc + nrm * lift

    marks = {}
    for nm, x in (("EyeL", P["eye_xl"]), ("EyeR", P["eye_xr"])):
        c = on_face(x, P["eye_z"], P["eye_r"] * 0.35)
        bm = bmesh.new()
        r = P["eye_r"]
        sphere_grid(bm, lambda d, c=c, r=r: c + Vector((d.x * r, d.y * r * 0.7, d.z * r)), 16, 10)
        mesh_obj(nm, bm, EYE)
        marks[nm] = c
    for nm, a, b, inner in (("BrowL", -P["brow_x1"] + P["brow_dx"], -P["brow_x0"] + P["brow_dx"], 1), ("BrowR", P["brow_x0"] + P["brow_dx"], P["brow_x1"] + P["brow_dx"], 0)):
        pts = []
        for i in range(12):
            t = i / 11
            z = P["brow_z"] - P["brow_arch"] * (4 * (t - 0.5) ** 2 - 1)
            pts.append(on_face(a + (b - a) * t, z, 0.02))
        bm = bmesh.new()
        tube(bm, pts, ends(P["brow_r"], 0.25), ring=10, ref=Vector((0, -1, 0)))
        mesh_obj(nm, bm, BROW)
    # landmarks that the masks can't see
    marks["nose"] = Vector((nx, P["nose_ty"] - P["nose_r1"] * 0.6, P["nose_tz"] + 0.04))
    mz = P["mouth_z"]
    marks["mL"] = on_face(P["mouth_x0"], mz, 0.01)
    marks["mR"] = on_face(P["mouth_x1"], mz, 0.01)
    marks["ear"] = Vector((-(P["ear_x"] + P["ear_flare"] * 0.2), P["ear_yc"] + 0.06, P["ear_zc"]))
    return marks


def place_camera(P):
    cam = bpy.data.objects.get("cam")
    if cam is None:
        cd = bpy.data.cameras.new("cam")
        cam = bpy.data.objects.new("cam", cd)
        bpy.context.scene.collection.objects.link(cam)
        bpy.context.scene.camera = cam
    cd = cam.data
    cd.sensor_fit = "VERTICAL"
    cd.angle_y = math.radians(P["cam_fov"])
    cd.shift_x, cd.shift_y = P["cam_sx"], P["cam_sy"]
    yaw, pitch = math.radians(P["cam_yaw"]), math.radians(P["cam_pitch"])
    d = P["cam_dist"]
    target = Vector((P["cam_tx"], 0, P["cam_tz"]))
    # yaw swings the camera from the front (-y) round toward his right side (-x)
    cam.location = target + Vector((-math.sin(yaw) * math.cos(pitch), -math.cos(yaw) * math.cos(pitch), math.sin(pitch))) * d
    from mathutils import Matrix
    loc = cam.location.copy()
    view = (target - loc).normalized()
    R = Matrix.Rotation(math.radians(P["cam_roll"]), 4, view) @ view.to_track_quat("-Z", "Y").to_matrix().to_4x4()
    R.translation = loc
    cam.matrix_world = R
    return cam


bpy.ops.wm.read_factory_settings(use_empty=True)
sc = bpy.context.scene
sc.render.engine = "BLENDER_WORKBENCH"
sc.display.shading.light = "FLAT"
sc.display.shading.color_type = "OBJECT"
sc.display.render_aa = "OFF"
sc.view_settings.view_transform = "Raw"
sc.render.film_transparent = True
sc.render.resolution_x, sc.render.resolution_y = W, H
sc.render.resolution_percentage = 100
sc.render.image_settings.file_format = "PNG"
sc.render.image_settings.color_mode = "RGBA"

def normal_material():
    m = bpy.data.materials.get("NRM")
    if m:
        return m
    m = bpy.data.materials.new("NRM")
    m.use_nodes = True
    nt = m.node_tree
    for n in list(nt.nodes):
        nt.nodes.remove(n)
    geo = nt.nodes.new("ShaderNodeNewGeometry")
    vt = nt.nodes.new("ShaderNodeVectorTransform")
    vt.vector_type, vt.convert_from, vt.convert_to = "NORMAL", "WORLD", "CAMERA"
    mul = nt.nodes.new("ShaderNodeVectorMath"); mul.operation = "MULTIPLY_ADD"
    mul.inputs[1].default_value = (0.5, 0.5, -0.5)  # camera space looks down -z: flip so facing = +z
    mul.inputs[2].default_value = (0.5, 0.5, 0.5)
    em = nt.nodes.new("ShaderNodeEmission")
    out = nt.nodes.new("ShaderNodeOutputMaterial")
    nt.links.new(geo.outputs["Normal"], vt.inputs["Vector"])
    nt.links.new(vt.outputs["Vector"], mul.inputs[0])
    nt.links.new(mul.outputs["Vector"], em.inputs["Color"])
    nt.links.new(em.outputs["Emission"], out.inputs["Surface"])
    return m


SHADE = os.environ.get("FIT_SHADE") == "1"
for line in sys.stdin:
    line = line.strip()
    if not line:
        continue
    try:
        P = dict(DEFAULTS)
        P.update(json.loads(line))
        marks = build(P)
        cam = place_camera(P)
        bpy.context.view_layer.update()
        out = os.path.join(OUT, f"w{WID}.png")
        sc.render.filepath = out
        bpy.ops.render.render(write_still=True)
        if SHADE:
            mat = normal_material()
            for o in sc.objects:
                if o.type == "MESH":
                    o.data.materials.clear(); o.data.materials.append(mat)
            sc.render.engine = "CYCLES"
            sc.cycles.samples = 1
            sc.cycles.use_denoising = False
            sc.cycles.device = "CPU"
            sc.render.threads_mode, sc.render.threads = "FIXED", 1
            sc.render.filepath = os.path.join(OUT, f"n{WID}.png")
            bpy.ops.render.render(write_still=True)
            sc.render.engine = "BLENDER_WORKBENCH"
        proj = {}
        for k, v in marks.items():
            c = world_to_camera_view(sc, cam, v)
            proj[k] = (c.x, 1 - c.y)  # image coords 0..1, y down
        print("RES " + json.dumps({"png": out, "npng": os.path.join(OUT, f"n{WID}.png") if SHADE else None, "marks": proj}), flush=True)
    except Exception as e:  # keep the worker alive
        print("RES " + json.dumps({"error": repr(e)}), flush=True)
