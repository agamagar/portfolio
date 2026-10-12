# tilediff.py SKIN CANVAS.png OUT.png : a fitted skin's site layers (the backdrop plate, then our
# canvas) vs its tile (felt/feltdiff.py, generalised). Scored at the tile's own size (382 x 408) and at the canvas size
# (802 x 862); "head" = the tile's skin, hair, eyes and brows; "all" = every pixel.
import sys, json
import numpy as np
from PIL import Image
SKIN = sys.argv[1]
tile = Image.open(f"{SKIN}.png").convert("RGB")
im = Image.open(sys.argv[2]).convert("RGBA")
if im.size != (802, 862):
    im = im.resize((802, 862), Image.LANCZOS)
comp = Image.open(f"{SKIN}-back.webp").convert("RGBA")
comp.alpha_composite(im)
comp = comp.convert("RGB")
r = {}
for tag, size, parts in (("tile", tile.size, np.load("ref_parts_tile.npy")), ("canvas", (802, 862), np.load("ref_parts_full.npy"))):
    ref = np.asarray(tile.resize(size, Image.LANCZOS) if tile.size != size else tile).astype(int)
    ours = np.asarray(comp.resize(size, Image.LANCZOS) if comp.size != size else comp).astype(int)
    d = np.abs(ours - ref).mean(-1)
    hd = (parts >= 1) & (parts <= 4)
    r[tag] = {"mean_abs_head": round(float(d[hd].mean()), 2), "pct_head_under_4": round(float((d[hd] < 4).mean() * 100), 1),
              "pct_head_under_8": round(float((d[hd] < 8).mean() * 100), 1), "pct_head_under_16": round(float((d[hd] < 16).mean() * 100), 1),
              "mean_abs_all": round(float(d.mean()), 2)}
    if tag == "canvas":
        heat = (np.clip(d / 48, 0, 1) * 255).astype(np.uint8)
        Image.fromarray(np.concatenate([ref.astype(np.uint8), ours.astype(np.uint8), np.stack([heat] * 3, -1)], 1)).save(sys.argv[3])
print(json.dumps(r))
