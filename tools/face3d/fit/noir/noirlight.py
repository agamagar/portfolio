# Recover the reference's lighting from its pixels, given our fitted geometry's passes.
#   python3 lightfit.py PASSDIR OUT.json
# Per material (skin, hair, brow, mouth): radiance = (9 SH terms of the camera-space normal)
# x AO^k, fitted by least squares in linear light, k picked by a small scan. Eyes: a dark
# base plus a fitted highlight. Writes the coefficients, a relit render beside the
# reference, and a per-pixel error map.
import sys, json
import numpy as np
from PIL import Image
from scipy import ndimage as nd

PD, OUTJ = sys.argv[1], sys.argv[2]
ref8 = np.asarray(Image.open("ref.webp").convert("RGB")).astype(np.float32) / 255
H, W, _ = ref8.shape
lin = lambda c: np.where(c <= 0.04045, c / 12.92, ((c + 0.055) / 1.055) ** 2.4)
srgb = lambda c: np.where(c <= 0.0031308, c * 12.92, 1.055 * np.clip(c, 0, None) ** (1 / 2.4) - 0.055)
ref = lin(ref8)
refparts = np.load("ref_parts_full.npy")

nrm = np.load(f"{PD}/normal.npy")[..., :3]
ao = np.load(f"{PD}/ao.npy")[..., 0]
idx = np.round(np.load(f"{PD}/indexob.npy")[..., 0]).astype(int)
alpha = np.load(f"{PD}/alpha.npy")[..., 0]
R = np.load(f"{PD}/camrot.npy")
n = nrm @ R  # world -> camera space (R maps camera to world)
n /= np.linalg.norm(n, axis=-1, keepdims=True) + 1e-8


def sh9(n):
    x, y, z = n[..., 0], n[..., 1], n[..., 2]
    return np.stack([0.282095 * np.ones_like(x), 0.488603 * y, 0.488603 * z, 0.488603 * x,
                     1.092548 * x * y, 1.092548 * y * z, 0.315392 * (3 * z * z - 1), 1.092548 * x * z,
                     0.546274 * (x * x - y * y)], -1)


Y = sh9(n)
mats = {"skin": (1, 1), "hair": (2, 2), "eye": (3, 3), "brow": (4, 4), "mouth": (5, 1), "inner": (6, 1), "hat": (7, 5)}
fit = {}
relit = np.zeros_like(ref)
cover = np.zeros((H, W), bool)
for name, (ours, theirs) in mats.items():
    m = (idx == ours) & (alpha > 0.99)
    # train only where both images agree on the part, away from its edges
    train = nd.binary_erosion(m & (refparts == theirs), iterations=3)
    if train.sum() < 200:
        continue
    best = None
    for k in (0.0, 0.5, 1.0, 1.5, 2.0, 3.0):
        A = Y[train] * (ao[train] ** k)[:, None]
        L, *_ = np.linalg.lstsq(A, ref[train], rcond=None)
        err = np.abs(A @ L - ref[train]).mean()
        if best is None or err < best[0]:
            best = (err, k, L)
    err, k, L = best
    fit[name] = {"k": k, "sh": L.T.tolist(), "train_px": int(train.sum())}
    relit[m] = np.clip((Y[m] * (ao[m] ** k)[:, None]) @ L, 0, 1)
    cover |= m
# eyes: flat dark plus whatever the reference has (the highlight is fitted as a disc later)
eye_col = np.median(ref[(refparts == 3)], axis=0)
fit.setdefault("eye", {})["base"] = eye_col.tolist()
bg = np.median(ref[(refparts == 0) | (refparts == 6)], axis=0)
relit[~cover] = bg
fit["bg"] = bg.tolist()

out8 = (np.clip(srgb(relit), 0, 1) * 255).astype(np.uint8)
diff = np.abs(out8.astype(int) - (ref8 * 255).astype(int)).mean(-1)
fg = (refparts > 0) & (refparts < 6)
fit["error"] = {"mean_abs_8bit_fg": float(diff[fg].mean()), "pct_under_8": float((diff[fg] < 8).mean() * 100),
                "pct_under_16": float((diff[fg] < 16).mean() * 100)}
json.dump(fit, open(OUTJ, "w"), indent=1)
heat = (np.clip(diff / 48, 0, 1) * 255).astype(np.uint8)
side = np.concatenate([(ref8 * 255).astype(np.uint8), out8, np.stack([heat] * 3, -1)], 1)
Image.fromarray(side).save(OUTJ.replace(".json", ".png"))
print(json.dumps({k: v for k, v in fit.items() if k in ("error",)}), {k: v.get("k") for k, v in fit.items() if isinstance(v, dict) and "k" in v})
