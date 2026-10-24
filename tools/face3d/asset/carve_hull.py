# carve_hull.py : a visual hull of the whole head (hair + skin + ears) from the 12 turnaround silhouettes, using the fitted cameras (turn_fit.json).
# Per view: the fitted pose gives the rotation and scale; its offset is found by a small search maximising the fit model's IoU with the mask. Voxels are kept when
# they project inside the silhouette in all views but one (robust to pose error). Output: gen/hull_sdf.bin (float16, N^3, signed distance in model units,
# negative inside, Gaussian-smoothed for the clay look) and gen/hull_meta.json (grid bounds). Blender-frame axes (x right, y back, z up) as the fit.
import os, json, sys
import numpy as np
from scipy import ndimage as nd
HERE = os.path.dirname(os.path.abspath(__file__)); sys.path.insert(0, HERE)
import fit_turnaround as F
G = F.G; N = int(os.environ.get("N", 96)); LO = np.array([-2.0, -2.0, -1.5]); HI = np.array([2.0, 2.0, 2.6])
T = json.load(open(f"{HERE}/turn_fit.json"))
x = np.array([T["shape"][k] for k in ["width", "depth", "height", "boxiness", "jaw_taper", "jaw_sag", "ear_w", "ear_h", "ear_y", "ear_x", "ear_z", "hair_thick", "hair_zc", "hairline_y", "hairline_z"]] + list(np.array(T["swoosh"]).ravel()))
s = F.shape_unpack(x); head, hair = F.model(s); allp = np.concatenate([head, hair])
poses = []
for i, v in enumerate(T["views"]):
    R = F.rot(v["yaw"], v["pitch"], v["roll"]); sc = v["scale"]; cen = F.view_cen(allp, R, sc, i); best = (-1, (0, 0))
    for ox in range(-8, 9, 2):
        for oy in range(-8, 9, 2):
            m = F.raster(allp, R, sc, (ox, oy), cen); iou = (m & F.GF[i]).sum() / max(1, (m | F.GF[i]).sum())
            if iou > best[0]: best = (iou, (ox, oy))
    poses.append((R, sc, cen, best[1])); print(i, "pose iou", round(best[0], 3), "off", best[1])
ax = [np.linspace(LO[k], HI[k], N) for k in range(3)]
X, Y, Z = np.meshgrid(*ax, indexing="ij"); P = np.stack([X.ravel(), Y.ravel(), Z.ravel()], 1)
out = np.zeros(len(P), np.int16)
for i, (R, sc, cen, off) in enumerate(poses):
    q = P @ R.T; gx = (q[:, 0] * sc + cen[0] + off[0]).astype(int); gy = (-q[:, 2] * sc + cen[1] + off[1]).astype(int)
    ok = (gx >= 0) & (gx < G) & (gy >= 0) & (gy < G); inside = np.zeros(len(P), bool); inside[ok] = F.GF[i][gy[ok], gx[ok]]
    out += (~inside).astype(np.int16)
occ = (out <= 1).reshape(N, N, N)
lab, k = nd.label(occ); occ = lab == (1 + np.argmax(nd.sum(occ, lab, range(1, k + 1)))) if k else occ
vox = (HI - LO) / (N - 1); d_in = nd.distance_transform_edt(occ) * vox.mean(); d_out = nd.distance_transform_edt(~occ) * vox.mean(); sdf = d_out - d_in
sdf = nd.gaussian_filter(sdf, 1.6)
sdf.astype(np.float16).tofile(f"{HERE}/gen/hull_sdf.bin"); json.dump({"N": N, "lo": LO.tolist(), "hi": HI.tolist(), "frame": "blender (x right, y back, z up)"}, open(f"{HERE}/gen/hull_meta.json", "w"))
ii = np.argwhere(occ); print("occupied", int(occ.sum()), "bbox", (LO + ii.min(0) * vox).round(2), (LO + ii.max(0) * vox).round(2))
