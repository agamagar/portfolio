# noirdiff.py CANVAS.png OUT.png : the site's noir layers (rain plate, our canvas, coat) vs the
# noir tile. Scored at the tile's own size (382 x 408) and at the canvas size (802 x 862);
# "head" = the tile's skin, hair, eyes, brows and hat; "all" = every pixel.
import sys, json
import numpy as np
from PIL import Image
tile = Image.open("noir.png").convert("RGB")
im = Image.open(sys.argv[1]).convert("RGBA")
if im.size != (802, 862):
    im = im.resize((802, 862), Image.LANCZOS)
comp = Image.open("noir-back.webp").convert("RGBA")
comp.alpha_composite(im)
comp.alpha_composite(Image.open("noir-coat.webp").convert("RGBA"))
comp = comp.convert("RGB")
r = {}
for tag, size, parts in (("tile", (382, 408), np.load("ref_parts_tile.npy")), ("canvas", (802, 862), np.load("ref_parts_full.npy"))):
    ref = np.asarray(tile.resize(size, Image.LANCZOS) if tile.size != size else tile).astype(int)
    ours = np.asarray(comp.resize(size, Image.LANCZOS) if comp.size != size else comp).astype(int)
    d = np.abs(ours - ref).mean(-1)
    hd = (parts >= 1) & (parts <= 5)
    r[tag] = {"mean_abs_head": round(float(d[hd].mean()), 2), "pct_head_under_4": round(float((d[hd] < 4).mean() * 100), 1),
              "pct_head_under_8": round(float((d[hd] < 8).mean() * 100), 1), "pct_head_under_16": round(float((d[hd] < 16).mean() * 100), 1),
              "mean_abs_all": round(float(d.mean()), 2)}
    if tag == "canvas":
        heat = (np.clip(d / 48, 0, 1) * 255).astype(np.uint8)
        Image.fromarray(np.concatenate([ref.astype(np.uint8), ours.astype(np.uint8), np.stack([heat] * 3, -1)], 1)).save(sys.argv[2])
print(json.dumps(r))
