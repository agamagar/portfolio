# carve_wing.py: the same carve at 2x mask resolution over the hair-wing box only (x -0.9..1.9, y(back) -1.3..0.9, z 0.7..2.7) at N=150, so the swoosh sweeps instead of horns. Writes gen/wing_sdf.bin + wing_meta.json.
# (derived from) carve_hull.py : a visual hull of the whole head (hair + skin + ears) from the 12 turnaround silhouettes, using the fitted cameras (turn_fit.json).
# Per view: the fitted pose gives the rotation and scale; its offset is found by a small search maximising the fit model's IoU with the mask. Voxels are kept when
# they project inside the silhouette in all views but one (robust to pose error). Output: gen/wing_sdf.bin (float16, N^3, signed distance in model units,
# negative inside, Gaussian-smoothed for the clay look) and gen/wing_meta.json (grid bounds). Blender-frame axes (x right, y back, z up) as the fit.
import os, json, sys
import numpy as np
from scipy import ndimage as nd
HERE = os.path.dirname(os.path.abspath(__file__)); sys.path.insert(0, HERE)
import fit_turnaround as F
G = F.G; N = int(os.environ.get("N", 150)); LO = np.array([-0.9, -1.3, 0.7]); HI = np.array([1.9, 0.9, 2.1]); UP = 2
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
from PIL import Image
HR = []
for i in range(12):
    m = np.asarray(Image.open(f"{HERE}/turn/full_{i:02d}.png").convert("L")) > 127; sH = G * UP / max(m.shape)
    im = Image.fromarray((m * 255).astype(np.uint8)).resize((int(m.shape[1] * sH), int(m.shape[0] * sH)), Image.BILINEAR); out_ = np.zeros((G * UP, G * UP), bool); a = np.asarray(im) > 127; out_[:a.shape[0], :a.shape[1]] = a; HR.append(out_)
ax = [np.linspace(LO[k], HI[k], N) for k in range(3)]
X, Y, Z = np.meshgrid(*ax, indexing="ij"); P = np.stack([X.ravel(), Y.ravel(), Z.ravel()], 1)
out = np.zeros(len(P), np.int16)
for i, (R, sc, cen, off) in enumerate(poses):
    q = P @ R.T; gx = ((q[:, 0] * sc + cen[0] + off[0]) * UP).astype(int); gy = ((-q[:, 2] * sc + cen[1] + off[1]) * UP).astype(int)
    ok = (gx >= 0) & (gx < G * UP) & (gy >= 0) & (gy < G * UP); inside = np.zeros(len(P), bool); inside[ok] = HR[i][gy[ok], gx[ok]]
    out += (~inside).astype(np.int16)
occ = (out <= 1).reshape(N, N, N)

vox = (HI - LO) / (N - 1); d_in = nd.distance_transform_edt(occ) * vox.mean(); d_out = nd.distance_transform_edt(~occ) * vox.mean(); sdf = d_out - d_in
sdf = nd.gaussian_filter(sdf, 2.2)
sdf.astype(np.float16).tofile(f"{HERE}/gen/wing_sdf.bin"); json.dump({"N": N, "lo": LO.tolist(), "hi": HI.tolist(), "frame": "blender (x right, y back, z up)"}, open(f"{HERE}/gen/wing_meta.json", "w"))
ii = np.argwhere(occ); print("occupied", int(occ.sum()), "bbox", (LO + ii.min(0) * vox).round(2), (LO + ii.max(0) * vox).round(2))
