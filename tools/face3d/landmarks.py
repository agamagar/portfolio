# landmarks.py IMG [alpha] : eye centres, eye-line angle, silhouette box, hair top, ear left
import sys, math
import numpy as np
from PIL import Image
from scipy import ndimage as nd
im = Image.open(sys.argv[1]).convert("RGBA")
A = np.asarray(im).astype(int)
rgb = A[..., :3]
if len(sys.argv) > 2 and sys.argv[2] == "alpha":
    sil = A[..., 3] > 20
else:
    bg = np.median(np.concatenate([rgb[:8].reshape(-1, 3), rgb[-8:].reshape(-1, 3)]), axis=0)
    sil = nd.binary_fill_holes(nd.binary_opening(np.abs(rgb - bg).sum(2) > 45, iterations=2))
lum = rgb @ [0.299, 0.587, 0.114]
sat = rgb.max(2) - rgb.min(2)
# eyes: near-black, low saturation, roundish blobs inside the silhouette
dark = (lum < 45) & (sat < 30) & sil
lab, n = nd.label(dark)
blobs = []
for i in range(1, n + 1):
    ys, xs = np.where(lab == i)
    if len(ys) < 30: continue
    h, w = ys.ptp() + 1, xs.ptp() + 1
    fill = len(ys) / (h * w)
    if 0.5 < h / w < 2 and fill > 0.55:
        blobs.append((len(ys), xs.mean(), ys.mean()))
blobs = sorted(blobs, reverse=True)[:2]
ys, xs = np.where(sil)
box = (xs.min(), ys.min(), xs.max(), ys.max())
H = box[3] - box[1]
out = {"box": box}
if len(blobs) == 2:
    (_, x1, y1), (_, x2, y2) = sorted(blobs, key=lambda b: b[1])
    out["eyeL"] = ((x1 - box[0]) / H, (y1 - box[1]) / H)
    out["eyeR"] = ((x2 - box[0]) / H, (y2 - box[1]) / H)
    out["eyeAngle"] = math.degrees(math.atan2(y2 - y1, x2 - x1))
    out["eyeGap"] = math.hypot(x2 - x1, y2 - y1) / H
out["width/height"] = (box[2] - box[0]) / H
for k, v in out.items():
    print(k, tuple(round(float(x), 3) for x in v) if isinstance(v, tuple) else round(float(v), 3))
