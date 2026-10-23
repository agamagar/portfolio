# fit_head_3d.py : fit the procedural head's shape to the fitted model's skin silhouettes from 8 KNOWN angles (front, +-40, +-90, +-35 pitch, back).
# Poses are fixed (no per-view nuisance), orthographic in model space, so depth is constrained. Loss = mean (1 - IoU) over the angles.
import os, json, sys
import numpy as np
from scipy import ndimage as nd
from scipy.optimize import differential_evolution, minimize
HERE = os.path.dirname(os.path.abspath(__file__)); G = 112; R = 1.9   # grid covers [-R, R] model units
sys.path.insert(0, HERE)
P = np.load(f"{HERE}/gen/skin_points.npy")
ANG = {"front": (0, 0), "q3L": (-40, 0), "q3R": (40, 0), "profL": (-90, 0), "profR": (90, 0), "up": (0, 35), "down": (0, -35), "back": (180, 0)}
def rot(yaw, pitch):
    y, p = np.radians(yaw), np.radians(pitch); cy, sy, cp, sp = np.cos(y), np.sin(y), np.cos(p), np.sin(p)
    Rz = np.array([[cy, -sy, 0], [sy, cy, 0], [0, 0, 1]]); Rx = np.array([[1, 0, 0], [0, cp, -sp], [0, sp, cp]]); return Rx @ Rz
def sil(pts, yaw, pitch):
    q = pts @ rot(yaw, pitch).T; gx = ((q[:, 0] + R) / (2 * R) * G).astype(int); gy = ((-q[:, 2] + R) / (2 * R) * G).astype(int)
    m = np.zeros((G, G), bool); ok = (gx >= 0) & (gx < G) & (gy >= 0) & (gy < G); m[gy[ok], gx[ok]] = True
    return nd.binary_fill_holes(nd.binary_closing(nd.binary_dilation(m, iterations=1), iterations=2))
TARGET = {k: sil(P, *v) for k, v in ANG.items()}
U = np.linspace(0, 2 * np.pi, 140, endpoint=False); V = np.linspace(-np.pi / 2, np.pi / 2, 80); UU, VV = np.meshgrid(U, V)
sgn = np.sign
def surface(p):
    w, d, h, e, taper, sag, earW, earH, earY, earX, oy, oz = p
    cu, su, cv, sv = np.cos(UU), np.sin(UU), np.cos(VV), np.sin(VV)
    x = sgn(cu) * abs(cu) ** e * abs(cv) ** e; y = sgn(su) * abs(su) ** e * abs(cv) ** e; z = sgn(sv) * abs(sv) ** e
    X, Y, Z = x * w, y * d, z * h
    low = np.clip((0.15 - Z / h) / 1.4, 0, 1); X = X * (1 - taper * low); Z = Z - sag * low * low
    pts = np.stack([X, Y + oy, Z + oz], -1).reshape(-1, 3)
    uu, vv = np.meshgrid(np.linspace(0, 2 * np.pi, 40), np.linspace(-np.pi / 2, np.pi / 2, 20))
    ex = np.cos(vv) * np.cos(uu) * earW * 0.4; ey = np.cos(vv) * np.sin(uu) * earW; ez = np.sin(vv) * earH
    for sd in (-1, 1): pts = np.concatenate([pts, np.stack([sd * (w * 0.99 + earX + ex.ravel()), earY + ey.ravel() + oy, ez.ravel() + oz], -1)])
    return pts
def ious(p):
    pts = surface(p); return {k: (sil(pts, *ANG[k]) & TARGET[k]).sum() / max(1, (sil(pts, *ANG[k]) | TARGET[k]).sum()) for k in ANG}
def loss(p): return 1 - float(np.mean(list(ious(p).values())))
names = ["width", "depth", "height", "boxiness", "jaw_taper", "jaw_sag", "ear_w", "ear_h", "ear_y", "ear_x", "off_y", "off_z"]
bounds = [(0.7, 1.4), (0.7, 1.4), (0.8, 1.6), (0.45, 1.0), (-0.1, 0.5), (-0.1, 0.4), (0.15, 0.8), (0.2, 0.9), (-0.4, 0.4), (0.0, 0.4), (-0.35, 0.35), (-0.35, 0.35)]
if __name__ == "__main__":
    res = differential_evolution(loss, bounds, maxiter=60, popsize=12, seed=5, tol=1e-4, polish=False, disp=False)
    r2 = minimize(loss, res.x, method="Powell", options={"maxiter": 4000, "xtol": 1e-3, "ftol": 1e-6}); x = r2.x if r2.fun < res.fun else res.x
    io = ious(x); out = {"params": dict(zip(names, map(float, x))), "iou": {k: round(float(v), 3) for k, v in io.items()}, "iou_mean": round(float(np.mean(list(io.values()))), 3)}
    json.dump(out, open(f"{HERE}/fit_params_3d.json", "w"), indent=1); print(json.dumps(out, indent=1))
    from PIL import Image
    pts = surface(x); tiles = []
    for k in ANG:
        s = sil(pts, *ANG[k]); t = TARGET[k]; rgb = np.zeros((G, G, 3), np.uint8); rgb[t] = (60, 120, 255); rgb[s & ~t] = (255, 120, 0); rgb[s & t] = (170, 170, 170); tiles.append(rgb)
    Image.fromarray(np.concatenate([np.concatenate(tiles[:4], 1), np.concatenate(tiles[4:], 1)], 0)).resize((G * 4 * 3, G * 2 * 3), Image.NEAREST).save(f"{HERE}/fit_3d_views.png")
