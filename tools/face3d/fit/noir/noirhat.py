# The noir fedora, parametric, for fitting it to the noir tile and building it for the site.
# A crown (wall, rounded top, a crease front to back, a front pinch) with a brim (a thick
# ring that droops front and back and curls up at the sides) as one mesh "Hat", and a band
# "HatBand". The hair under it is pressed down and in by press_hair (the hatCompress idea in
# tools/face3d/build_head.py, redone in the fitted hat's own frame).
# Plain python + numpy for the geometry; the bpy helpers at the bottom.
import math
import numpy as np

HAT_DEFAULTS = dict(
    hz=0.5, hrx=1.02, hry=1.1, hh=0.78, htaper=0.07, hdent=0.09, hpinch=0.12, htop=0.08,
    bw=0.5, bcurl=0.09, bdip=0.05, bthick=0.04, bfront=0.0, bside=0.0, hbulge=0.0,
    hrx_deg=-7.0, hry_deg=-5.0, hrz_deg=0.0, hox=0.0, hoy=0.0, hoz=0.0, hs=1.0,
)


def smoothstep(e0, e1, x):
    t = np.clip((x - e0) / (e1 - e0), 0.0, 1.0)
    return t * t * (3 - 2 * t)


def hat_matrix(P):
    """local hat space -> head space (4x4): about the crown's base centre, rotate, scale, move"""
    rx, ry, rz = (math.radians(P[k]) for k in ("hrx_deg", "hry_deg", "hrz_deg"))
    cx, sx_ = math.cos(rx), math.sin(rx)
    cy, sy_ = math.cos(ry), math.sin(ry)
    cz, sz_ = math.cos(rz), math.sin(rz)
    Rx = np.array([[1, 0, 0], [0, cx, -sx_], [0, sx_, cx]])
    Ry = np.array([[cy, 0, sy_], [0, 1, 0], [-sy_, 0, cy]])
    Rz = np.array([[cz, -sz_, 0], [sz_, cz, 0], [0, 0, 1]])
    R = Rz @ Ry @ Rx * P["hs"]
    piv = np.array([0, 0, P["hz"]])
    M = np.eye(4)
    M[:3, :3] = R
    M[:3, 3] = piv - R @ piv + np.array([P["hox"], P["hoy"], P["hoz"]])
    return M


def crown_geo(P, U=64, V=24):
    verts, faces = [], []
    for j in range(V + 1):
        v = j / V
        if v < 0.75:
            t = v / 0.75
            k, z = 1 - P["htaper"] * t, P["hz"] + P["hh"] * t
        else:
            t = (v - 0.75) / 0.25
            k, z = (1 - P["htaper"]) * math.cos(t * math.pi / 2) ** 0.6, P["hz"] + P["hh"] + P["htop"] * math.sin(t * math.pi / 2)
        for i in range(U):
            a = 2 * math.pi * i / U
            x, y = P["hrx"] * k * math.cos(a), P["hry"] * k * math.sin(a)
            # the front of the crown swells forward toward the top (the tile's rounded front)
            fr = max(0.0, -math.sin(a)) ** 2 * math.sin(min(v / 0.85, 1.0) * math.pi) * P["hbulge"]
            x, y = x * (1 + 0.5 * fr), y * (1 + fr)
            zz = z
            if v > 0.6:
                s = float(smoothstep(0.6, 1.0, v))
                zz -= P["hdent"] * math.exp(-(x / 0.28) ** 2) * s
                if y < 0:
                    x *= 1 - P["hpinch"] * s * (-y / P["hry"])
            verts.append((x, y, zz))
    for j in range(V):
        for i in range(U):
            a, b = j * U + i, j * U + (i + 1) % U
            faces.append((a, b, b + U, a + U))
    top = len(verts); verts.append((0.0, 0.0, P["hz"] + P["hh"] + P["htop"] - P["hdent"]))
    for i in range(U):
        faces.append((V * U + i, V * U + (i + 1) % U, top))
    bot = len(verts); verts.append((0.0, 0.0, P["hz"]))
    for i in range(U):
        faces.append(((i + 1) % U, i, bot))
    return verts, faces


def brim_geo(P, U=96, R=10, base=0):
    verts, faces = [], []
    for i in range(U):
        a = 2 * math.pi * i / U
        ca, sa = math.cos(a), math.sin(a)
        # a little wider at the front (y < 0) when bfront > 0
        wide = P["bw"] * max(0.05, (1 + P["bfront"] * max(0.0, -sa)) * (1 + P["bside"] * max(0.0, ca)))
        for j in range(R):
            b = 2 * math.pi * j / R
            w = 0.5 * (0.5 + 0.5 * math.cos(b))  # 0..0.5 across the brim
            r = 0.96 + (w / 0.5) * wide / 1.05
            x, y = P["hrx"] * r * ca, P["hry"] * r * sa
            z = P["hz"] + P["bthick"] * math.sin(b) + (P["bcurl"] * ca * ca - P["bdip"] * sa * sa) * (w / 0.48) ** 1.5
            verts.append((x, y, z))
    for i in range(U):
        for j in range(R):
            i2, j2 = (i + 1) % U, (j + 1) % R
            faces.append((base + i * R + j, base + i * R + j2, base + i2 * R + j2, base + i2 * R + j))
    return verts, faces


def band_geo(P, U=64):
    verts, faces = [], []
    for j in range(3):
        z = P["hz"] + 0.02 + 0.08 * j
        k = 1 - P["htaper"] * (0.02 + 0.08 * j) / P["hh"] / 0.75
        for i in range(U):
            a = 2 * math.pi * i / U
            verts.append((P["hrx"] * k * 1.012 * math.cos(a), P["hry"] * k * 1.012 * math.sin(a), z))
    for j in range(2):
        for i in range(U):
            a, b = j * U + i, j * U + (i + 1) % U
            faces.append((a, b, b + U, a + U))
    return verts, faces


def hat_geo(P):
    cv, cf = crown_geo(P)
    bv, bf = brim_geo(P, base=len(cv))
    M = hat_matrix(P)
    X = lambda vs: (np.c_[np.array(vs), np.ones(len(vs))] @ M.T)[:, :3]
    hv = X(cv + bv)
    nv, nf = band_geo(P)
    return hv, cf + bf, X(nv), nf


def press_hair(co, P):
    """hair vertices (N x 3, head space) pressed under the fitted hat: in the hat's frame,
    everything above the hatline is squashed down into the crown and drawn in"""
    M = hat_matrix(P)
    Mi = np.linalg.inv(M)
    L = (np.c_[co, np.ones(len(co))] @ Mi.T)[:, :3]
    x, y, z = L[:, 0].copy(), L[:, 1].copy(), L[:, 2].copy()
    lo = P["hz"] - 0.05
    ztop = max(z.max(), lo + 1e-3)
    up = z > lo
    z2 = np.where(up, lo + (z - lo) * max(P["hh"] - 0.25, 0.1) / (ztop - lo), z)
    k = smoothstep(lo - 0.05, lo + 0.08, z)
    lim = np.hypot(x / (P["hrx"] * 0.92), y / (P["hry"] * 0.92))
    f = np.where(lim > 1, 1 + (lim - 1) * k, 1.0)
    out = np.stack([x / f, y / f, z2], 1)
    return (np.c_[out, np.ones(len(out))] @ M.T)[:, :3]


# ---- bpy helpers
def make_or_update(bpy, name, verts, faces):
    o = bpy.data.objects.get(name)
    if o is not None and len(o.data.vertices) == len(verts) and not o.data.shape_keys:
        o.data.vertices.foreach_set("co", np.asarray(verts, np.float32).ravel())
        o.data.update()
        return o
    if o is not None:
        me_old = o.data
        bpy.data.objects.remove(o, do_unlink=True)
        if me_old.users == 0:
            bpy.data.meshes.remove(me_old)
    me = bpy.data.meshes.new(name)
    me.from_pydata([tuple(v) for v in verts], [], faces)
    # consistent outward winding: the site culls back faces, the ray passes don't
    import bmesh
    bm = bmesh.new(); bm.from_mesh(me)
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
    bm.to_mesh(me); bm.free()
    me.update()
    me.shade_smooth()
    o = bpy.data.objects.new(name, me)
    bpy.context.scene.collection.objects.link(o)
    return o
