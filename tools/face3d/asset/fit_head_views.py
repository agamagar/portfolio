# fit_head_views.py : multi-view silhouette fit of the head's SHAPE parameters to the target sheet's skin masks (face + ears, no hair/hat).
# Shared shape (width/depth/height, boxiness, jaw taper and sag, ear size/position) + per-view pose (yaw, pitch, roll, scale, shift), orthographic.
# Loss = mean (1 - IoU) over the views, symmetric by construction. Writes fit_params.json and fit_views.png (target mask vs fitted silhouette).
import os, json, sys
import numpy as np
from PIL import Image
from scipy import ndimage as nd
from scipy.optimize import differential_evolution, minimize
HERE = os.path.dirname(os.path.abspath(__file__)); G = 96
VIEWS = ["quiff_ci", "curly", "vitiligo_fade", "silver_nasal"]
masks = []
for v in VIEWS:
    m = np.asarray(Image.open(f"{HERE}/gen/mask_{v}.png").resize((440, 472)).convert("L")) > 127
    ys, xs = np.where(m); crop = m[ys.min():ys.max() + 1, xs.min():xs.max() + 1]
    # normalise: scale so the larger side is G*0.84, centre
    s = G * 0.84 / max(crop.shape); im = Image.fromarray((crop * 255).astype(np.uint8)).resize((max(1, int(crop.shape[1] * s)), max(1, int(crop.shape[0] * s))), Image.BILINEAR)
    out = np.zeros((G, G), bool); a = np.asarray(im) > 127; oy, ox = (G - a.shape[0]) // 2, (G - a.shape[1]) // 2; out[oy:oy + a.shape[0], ox:ox + a.shape[1]] = a; masks.append(out)
U = np.linspace(0, 2 * np.pi, 120, endpoint=False); V = np.linspace(-np.pi / 2, np.pi / 2, 70); UU, VV = np.meshgrid(U, V)
def sgn(x): return np.sign(x)
def surface(p):
    w, d, h, e, taper, sag, earW, earH, earY, earX = p
    cu, su, cv, sv = np.cos(UU), np.sin(UU), np.cos(VV), np.sin(VV)
    x = sgn(cu) * abs(cu) ** e * abs(cv) ** e; y = sgn(su) * abs(su) ** e * abs(cv) ** e; z = sgn(sv) * abs(sv) ** e
    X, Y, Z = x * w, y * d, z * h
    low = np.clip((0.15 - Z / h) / 1.4, 0, 1); X = X * (1 - taper * low); Z = Z - sag * low * low
    pts = np.stack([X, Y, Z], -1).reshape(-1, 3)
    # ears: ellipsoid shells, mirrored
    uu, vv = np.meshgrid(np.linspace(0, 2 * np.pi, 36), np.linspace(-np.pi / 2, np.pi / 2, 18))
    ex = np.cos(vv) * np.cos(uu) * earW * 0.4; ey = np.cos(vv) * np.sin(uu) * earW; ez = np.sin(vv) * earH
    for sd in (-1, 1): pts = np.concatenate([pts, np.stack([sd * (w * 0.99 + earX + ex.ravel() * sd * sd), earY + ey.ravel(), ez.ravel() + 0.0], -1)])
    return pts
def rot(yaw, pitch, roll):
    cy, sy, cp, sp, cr, sr = np.cos(yaw), np.sin(yaw), np.cos(pitch), np.sin(pitch), np.cos(roll), np.sin(roll)
    Rz = np.array([[cy, -sy, 0], [sy, cy, 0], [0, 0, 1]]); Rx = np.array([[1, 0, 0], [0, cp, -sp], [0, sp, cp]]); Ry = np.array([[cr, 0, sr], [0, 1, 0], [-sr, 0, cr]])
    return Ry @ Rx @ Rz
def silhouette(pts, yaw, pitch, roll):
    q = pts @ rot(yaw, pitch, roll).T
    # camera looks along +y (front of the head is -y): screen x = X, screen y = -Z
    sx, sy = q[:, 0], -q[:, 2]
    # normalise into the G grid like the masks: fit the bbox to 0.84 G, centre
    x0, x1, y0, y1 = sx.min(), sx.max(), sy.min(), sy.max(); s = G * 0.84 / max(x1 - x0, y1 - y0)
    gx = ((sx - (x0 + x1) / 2) * s + G / 2).astype(int); gy = ((sy - (y0 + y1) / 2) * s + G / 2).astype(int)
    m = np.zeros((G, G), bool); ok = (gx >= 0) & (gx < G) & (gy >= 0) & (gy < G); m[gy[ok], gx[ok]] = True
    m = nd.binary_closing(nd.binary_dilation(m, iterations=1), iterations=2); return nd.binary_fill_holes(m)
def loss(vec, detail=False):
    shape = vec[:10]; poses = vec[10:].reshape(len(VIEWS), 3); pts = surface(shape); ious = []
    for i, m in enumerate(masks):
        s = silhouette(pts, *poses[i]); ious.append((s & m).sum() / max(1, (s | m).sum()))
    return ious if detail else 1 - float(np.mean(ious))
lo = [0.85, 0.8, 0.95, 0.5, 0.0, 0.0, 0.25, 0.3, -0.25, 0.0]; hi = [1.3, 1.15, 1.45, 1.0, 0.35, 0.25, 0.65, 0.7, 0.25, 0.25]
plo = [radians for radians in []]
import math
pl = [(-0.9, -0.1), (-0.35, 0.45), (-0.5, 0.5)]   # yaw (rad, face to the right = negative about +Z), pitch, roll bounds per view below
bounds = list(zip(lo, hi)) + [(-1.0, -0.2), (-0.2, 0.5), (-0.5, 0.3)] * len(VIEWS)
if __name__ == "__main__":
    res = differential_evolution(loss, bounds, maxiter=40, popsize=10, seed=3, tol=1e-4, polish=False, workers=1, disp=False)
    res2 = minimize(loss, res.x, method="Powell", options={"maxiter": 3000, "xtol": 1e-3, "ftol": 1e-5})
    x = res2.x if res2.fun < res.fun else res.x
    names = ["width", "depth", "height", "boxiness", "jaw_taper", "jaw_sag", "ear_w", "ear_h", "ear_y", "ear_x"]
    out = {"shape": dict(zip(names, map(float, x[:10]))), "views": {v: dict(zip(["yaw", "pitch", "roll"], map(float, x[10 + 3 * i:13 + 3 * i]))) for i, v in enumerate(VIEWS)}, "iou_per_view": [round(float(i), 3) for i in loss(x, True)], "iou_mean": round(1 - float(loss(x)), 3)}
    json.dump(out, open(f"{HERE}/fit_params.json", "w"), indent=1); print(json.dumps(out, indent=1))
    pts = surface(x[:10]); poses = x[10:].reshape(len(VIEWS), 3); tiles = []
    for i, m in enumerate(masks):
        s = silhouette(pts, *poses[i]); rgb = np.zeros((G, G, 3), np.uint8); rgb[m] = (60, 120, 255); rgb[s] = rgb[s] + np.array([200, 80, 0], np.uint8) if False else rgb[s]; rgb[s & ~m] = (255, 120, 0); rgb[s & m] = (170, 170, 170); tiles.append(rgb)
    Image.fromarray(np.concatenate(tiles, 1)).resize((G * 4 * 3, G * 3), Image.NEAREST).save(f"{HERE}/fit_views.png")
