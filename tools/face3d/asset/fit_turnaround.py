# fit_turnaround.py : fit the head (skin: superellipsoid + ears) and the hair mass (cap + swoosh ellipsoids) to Agam's 11-view turnaround, all views at once.
# Per view: yaw, pitch, roll, scale, 2 offsets (free near their nominal values). Shared: head, ears, hair. Orthographic, symmetric head by construction.
# Loss per view = (1 - IoU(head+hair, full silhouette)) + 0.5 (1 - recall(head, skin mask)) + 0.3 (1 - precision(head in full)).
# Run: python fit_turnaround.py [ITERS]. Writes turn_fit.json (params), turn_fit_sheet.png (target vs fit per view), prints per-view scores.
import os, sys, json, time
import numpy as np
from PIL import Image
from scipy import ndimage as nd
import cma
HERE = os.path.dirname(os.path.abspath(__file__)); T = f"{HERE}/turn"; G = 96
NOMINAL = [(35, 8), (0, 0), (35, 0), (110, 0), (145, 0), (180, 0), (-140, 0), (-90, 0), (-40, 0), (28, -12), (30, 12), (0, 0)]
WEIGHT = [1, 1.5, 1, 1, 1, 1.2, 1, 1.5, 1, 0.8, 0.8, 0.5]
def load(prefix):
    out = []
    for i in range(12):
        m = np.asarray(Image.open(f"{T}/{prefix}_{i:02d}.png").convert("L")) > 127
        ys, xs = np.where(m)
        out.append(m)
    return out
FULL, SKIN = load("full"), load("skin")
def to_grid(m):
    s = G / max(m.shape); im = Image.fromarray((m * 255).astype(np.uint8)).resize((int(m.shape[1] * s), int(m.shape[0] * s)), Image.BILINEAR)
    out = np.zeros((G, G), bool); a = np.asarray(im) > 127; out[:a.shape[0], :a.shape[1]] = a; return out, s
GF, SC, GS = [], [], []
for i in range(12):
    f, s = to_grid(FULL[i]); GF.append(f); SC.append(s); GS.append(to_grid(SKIN[i])[0])
    # mask centroid and extent in the grid
CEN = [np.array(np.where(f)).mean(1)[::-1] for f in GF]; EXT = [max(np.ptp(np.where(f)[0]), np.ptp(np.where(f)[1])) for f in GF]
U = np.linspace(0, 2 * np.pi, 90, endpoint=False); V = np.linspace(-np.pi / 2, np.pi / 2, 50); UU, VV = np.meshgrid(U, V); sgn = np.sign
def head_pts(w, d, h, e, taper, sag):
    cu, su, cv, sv = np.cos(UU), np.sin(UU), np.cos(VV), np.sin(VV)
    x = sgn(cu) * abs(cu) ** e * abs(cv) ** e; y = sgn(su) * abs(su) ** e * abs(cv) ** e; z = sgn(sv) * abs(sv) ** e
    X, Y, Z = x * w, y * d, z * h; low = np.clip((0.15 - Z / h) / 1.4, 0, 1); X = X * (1 - taper * low); Z = Z - sag * low * low
    return np.stack([X, Y, Z], -1).reshape(-1, 3)
def ellipsoid(c, r, n=26):
    u, v = np.meshgrid(np.linspace(0, 2 * np.pi, n), np.linspace(-np.pi / 2, np.pi / 2, n // 2))
    return np.stack([c[0] + r[0] * np.cos(v) * np.cos(u), c[1] + r[1] * np.cos(v) * np.sin(u), c[2] + r[2] * np.sin(v)], -1).reshape(-1, 3)
NS = 4
def shape_unpack(p):
    w, d, h, e, taper, sag, earW, earH, earY, earX, earZ, ct, czc, hl_y, hl_z = p[:15]
    sw = p[15:15 + NS * 6].reshape(NS, 6)
    return dict(w=w, d=d, h=h, e=e, taper=taper, sag=sag, earW=earW, earH=earH, earY=earY, earX=earX, earZ=earZ, ct=ct, czc=czc, hl_y=hl_y, hl_z=hl_z, sw=sw)
def model(s):
    H = head_pts(s["w"], s["d"], s["h"], s["e"], s["taper"], s["sag"])
    ears = []
    for sd in (-1, 1):
        ears.append(ellipsoid((sd * (s["w"] * 0.97 + s["earX"]), s["earY"], s["earZ"]), (0.09 + 0.5 * s["earW"] * 0.4, s["earW"], s["earH"])))
    head = np.concatenate([H] + ears)
    # hair cap: upper and back surface of the head, pushed out, minus the forehead window
    mask = (H[:, 2] > s["czc"]) | (H[:, 1] > 0.15)
    mask &= ~((H[:, 1] < s["hl_y"]) & (H[:, 2] < s["hl_z"]))
    cap = H[mask] * (1 + s["ct"]) if mask.any() else H[:0]
    hair = np.concatenate([cap] + [ellipsoid(c[:3], np.abs(c[3:]) + 0.02) for c in s["sw"]])
    return head, hair
def rot(yaw, pitch, roll):
    y, p, r = np.radians([yaw, pitch, roll]); cy, sy, cp, sp, cr, sr = np.cos(y), np.sin(y), np.cos(p), np.sin(p), np.cos(r), np.sin(r)
    Rz = np.array([[cy, -sy, 0], [sy, cy, 0], [0, 0, 1]]); Rx = np.array([[1, 0, 0], [0, cp, -sp], [0, sp, cp]]); Ry = np.array([[cr, 0, sr], [0, 1, 0], [-sr, 0, cr]]); return Ry @ Rx @ Rz
def raster(pts, R, scale, off, cen):
    q = pts @ R.T; sx, sy = q[:, 0], -q[:, 2]
    gx = (sx * scale + cen[0] + off[0]).astype(int); gy = (sy * scale + cen[1] + off[1]).astype(int)
    m = np.zeros((G, G), bool); ok = (gx >= 0) & (gx < G) & (gy >= 0) & (gy < G); m[gy[ok], gx[ok]] = True
    return nd.binary_fill_holes(nd.binary_closing(nd.binary_dilation(m, iterations=1), iterations=2))
def pose_unpack(q, i):
    yaw, pitch, roll, sc, ox, oy = q[6 * i:6 * i + 6]; return yaw, pitch, roll, sc, (ox, oy)
def view_cen(pts_all, R, scale, i):
    # put the projected centroid of the (head+hair) points on the mask centroid, so only the offsets above are fine tuning
    q = pts_all @ R.T; return CEN[i] - np.array([q[:, 0].mean() * scale, (-q[:, 2]).mean() * scale])
def evaluate(x, detail=False):
    s = shape_unpack(x[:15 + NS * 6]); q = x[15 + NS * 6:]; head, hair = model(s); allp = np.concatenate([head, hair]); tot = 0; per = []
    for i in range(12):
        yaw, pitch, roll, sc, off = pose_unpack(q, i); R = rot(yaw, pitch, roll); cen = view_cen(allp, R, sc, i)
        mh = raster(head, R, sc, off, cen); ma = raster(allp, R, sc, off, cen)
        iou = (ma & GF[i]).sum() / max(1, (ma | GF[i]).sum()); rec = (mh & GS[i]).sum() / max(1, GS[i].sum()); prec = (mh & GF[i]).sum() / max(1, mh.sum())
        l = (1 - iou) + 0.5 * (1 - rec) + 0.3 * (1 - prec); tot += WEIGHT[i] * l; per.append((iou, rec, prec, ma, mh))
    pen = 6 * max(0, 0.06 - s['ct']) + 6 * max(0, s['h'] - 1.18) + 4 * max(0, 0.95 - s['h']) + 4 * max(0, s['w'] - 1.05) + 3 * np.maximum(0, 0.12 - np.abs(s['sw'][:, 3:])).sum()
    return per if detail else tot / sum(WEIGHT) + pen
def init():
    # head from the sculpt (head_point scale), ears, hair cap and a swoosh from the chef sculpt; poses from the nominal sheet layout
    shape = [1.06, 0.96, 1.30, 0.62, 0.04, 0.06, 0.45, 0.50, -0.10, 0.12, 0.05, 0.07, 0.35, -0.2, 0.9]
    sw = [0.30, -0.3, 1.2, 0.8, 0.7, 0.55, 0.7, -0.3, 1.45, 0.8, 0.7, 0.55, 1.05, -0.3, 1.65, 0.6, 0.55, 0.45, 1.1, -0.3, 1.35, 0.45, 0.5, 0.4]
    poses = []
    for i in range(12):
        sc = 0.9 * G * 0.5 / max(EXT[i], 1) * 2 / 2.8 * 1.0
        poses += [NOMINAL[i][0], NOMINAL[i][1], 0.0, G * 0.62 / 3.2 * 1.35 * (EXT[i] / (G * 0.8)), 0.0, 0.0]
    return np.array(shape + sw + poses, float)
if __name__ == "__main__":
    iters = int(sys.argv[1]) if len(sys.argv) > 1 else 120
    x0 = init(); n = len(x0)
    if os.environ.get('WARM') and os.path.exists(f'{HERE}/turn_fit_v1.json'):
        v = json.load(open(f'{HERE}/turn_fit_v1.json')); x0[:15] = list(v['shape'].values()); x0[15:15 + NS * 6] = np.array(v['swoosh']).ravel(); x0[15 + NS * 6:] = np.array([[w['yaw'], w['pitch'], w['roll'], w['scale'], 0, 0] for w in v['views']]).ravel(); x0[11] = max(x0[11], 0.08); x0[2] = min(x0[2], 1.15)
    sig = np.array([0.08] * 4 + [0.04] * 2 + [0.05] * 5 + [0.04, 0.1, 0.1, 0.15] + [0.12] * (NS * 6) + sum(([6, 5, 3, 1.2, 1.0, 1.0] for _ in range(12)), []))
    es = cma.CMAEvolutionStrategy(x0 / sig, 1.0, {"CMA_stds": sig / sig, "popsize": 28, "seed": 4, "verbose": -9, "maxiter": iters})
    f = lambda z: evaluate(np.asarray(z) * sig)
    t0 = time.time(); k = 0
    while not es.stop():
        zs = es.ask(); es.tell(zs, [f(z) for z in zs]); k += 1
        if k % 10 == 0: print(k, round(es.result.fbest, 4), f"{time.time() - t0:.0f}s", flush=True)
    xb = es.result.xbest * sig; per = evaluate(xb, True)
    names = ["width", "depth", "height", "boxiness", "jaw_taper", "jaw_sag", "ear_w", "ear_h", "ear_y", "ear_x", "ear_z", "hair_thick", "hair_zc", "hairline_y", "hairline_z"]
    s = shape_unpack(xb[:15 + NS * 6]); q = xb[15 + NS * 6:]
    out = {"shape": dict(zip(names, map(float, xb[:15]))), "swoosh": np.asarray(s["sw"]).tolist(), "views": [{"yaw": float(q[6 * i]), "pitch": float(q[6 * i + 1]), "roll": float(q[6 * i + 2]), "scale": float(q[6 * i + 3])} for i in range(12)],
           "iou": [round(float(p[0]), 3) for p in per], "skin_recall": [round(float(p[1]), 3) for p in per], "head_precision": [round(float(p[2]), 3) for p in per], "loss": float(es.result.fbest)}
    json.dump(out, open(f"{HERE}/turn_fit.json", "w"), indent=1); print(json.dumps({k: out[k] for k in ("iou", "skin_recall", "head_precision", "loss")}))
    tiles = []
    for i, (iou, rec, prec, ma, mh) in enumerate(per):
        rgb = np.zeros((G, G, 3), np.uint8); rgb[GF[i]] = (60, 100, 220); rgb[GS[i]] = (60, 200, 220); rgb[ma & ~GF[i]] = (255, 120, 0); rgb[mh & GF[i]] = rgb[mh & GF[i]] // 2 + 100; tiles.append(rgb)
    rows = [np.concatenate(tiles[r * 3:r * 3 + 3], 1) for r in range(4)]
    Image.fromarray(np.concatenate(rows, 0)).resize((G * 3 * 3, G * 4 * 3), Image.NEAREST).save(f"{HERE}/turn_fit_sheet.png")
