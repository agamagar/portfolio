# pixdiff.py RENDER.png OUT.png : our render (transparent bg -> reference bg) vs the reference
import sys, json
import numpy as np
from PIL import Image
ref = np.asarray(Image.open("ref.webp").convert("RGB")).astype(int)
im = Image.open(sys.argv[1]).convert("RGBA")
if im.size != (802, 862):
    im = im.resize((802, 862), Image.LANCZOS)
bgc = tuple(int(x) for x in np.median(ref[:20].reshape(-1, 3), 0))
base = Image.new("RGBA", im.size, bgc + (255,)); base.alpha_composite(im)
ours = np.asarray(base.convert("RGB")).astype(int)
parts = np.load("ref_parts_full.npy")
d = np.abs(ours - ref).mean(-1)
fg = parts > 0
r = {"mean_abs_fg": round(float(d[fg].mean()), 2), "pct_fg_under_4": round(float((d[fg] < 4).mean() * 100), 1),
     "pct_fg_under_8": round(float((d[fg] < 8).mean() * 100), 1), "pct_fg_under_16": round(float((d[fg] < 16).mean() * 100), 1),
     "mean_abs_all": round(float(d.mean()), 2)}
heat = (np.clip(d / 48, 0, 1) * 255).astype(np.uint8)
Image.fromarray(np.concatenate([ref.astype(np.uint8), ours.astype(np.uint8), np.stack([heat] * 3, -1)], 1)).save(sys.argv[2])
print(json.dumps(r))
