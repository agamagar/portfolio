# gaps.py SKIN CANVAS.png WORK OUT.png : where a skin's render leaves the head open. Two kinds:
#   holes: transparent pixels enclosed by the render's own silhouette (a crack, a missing face)
#   misses: pixels the tile shows as head (its labels) that the render leaves transparent
# Prints the counts and the biggest clusters (centre, size); OUT.png marks them (holes red,
# misses yellow) over the render.
import sys, json
import numpy as np
from PIL import Image
from scipy import ndimage as nd
s, png, W, out = sys.argv[1:5]
im = Image.open(png).convert("RGBA")
if im.size != (802, 862): im = im.resize((802, 862), Image.LANCZOS)
a = np.asarray(im)[..., 3] / 255.0
fit = f"{W}/{s}/fit"
import os
lab = np.load(f"{fit}/score_parts_full.npy" if os.path.exists(f"{fit}/score_parts_full.npy") else f"{fit}/ref_parts_full.npy")
solid = a > 0.5
holes = nd.binary_fill_holes(solid) & ~solid
# misses: well inside the tile's head (2 px in: its own edge is anti-aliased) yet open in ours
inner = nd.binary_erosion(lab > 0, iterations=2)
misses = inner & (a < 0.5) & ~holes
def clusters(m):
    l, n = nd.label(m)
    if n == 0: return []
    sz = nd.sum(m, l, range(1, n + 1)); cs = nd.center_of_mass(m, l, range(1, n + 1))
    o = sorted(zip(sz, cs), key=lambda t: -t[0])[:6]
    return [(int(z), int(c[1]), int(c[0])) for z, c in o if z >= 3]
r = {"skin": s, "holes_px": int(holes.sum()), "misses_px": int(misses.sum()), "holes": clusters(holes), "misses": clusters(misses)}
print(json.dumps(r))
rgb = np.asarray(Image.new("RGBA", im.size, (128, 128, 128, 255)).copy())
bg = Image.new("RGBA", im.size, (128, 128, 128, 255)); bg.alpha_composite(im)
v = np.asarray(bg.convert("RGB")).copy()
v[nd.binary_dilation(holes, iterations=2)] = [255, 0, 0]
v[nd.binary_dilation(misses, iterations=1)] = [255, 230, 0]
Image.fromarray(v).save(out)
