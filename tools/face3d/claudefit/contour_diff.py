# contour_diff.py RENDER_DIR OUT.png [CELLS]: where does our silhouette bulge (+) or recede (-) against each reference cell? Both are aligned by their
# silhouette box (as turn_compare.py), then compared along 24 rays from the reference's centroid: signed gap in % of the reference's size.
# Prints per view the 4 worst sectors with a compass name (as seen in the image: N = top, E = right) and writes an overlay sheet
# (green = both, red = ours only (bulge), blue = reference only (recede)).
import sys, os, math
import numpy as np
from PIL import Image, ImageDraw
HERE = os.path.dirname(os.path.abspath(__file__)); T = os.path.join(HERE, "../asset/turn")
d, out = sys.argv[1], sys.argv[2]; cells = [int(c) for c in sys.argv[3].split(",")] if len(sys.argv) > 3 else [1, 2, 3, 7, 8, 9]
S = 360; NAMES = ["E", "ENE", "NE", "NNE", "N", "NNW", "NW", "WNW", "W", "WSW", "SW", "SSW", "S", "SSE", "SE", "ESE"]
def frame(mask):
    ys, xs = np.where(mask); y0, y1, x0, x1 = ys.min(), ys.max() + 1, xs.min(), xs.max() + 1; s = (S - 20) / max(y1 - y0, x1 - x0)
    nh, nw = max(1, int((y1 - y0) * s)), max(1, int((x1 - x0) * s)); mi = np.asarray(Image.fromarray((mask[y0:y1, x0:x1] * 255).astype(np.uint8)).resize((nw, nh), Image.BILINEAR)) > 127
    om = np.zeros((S, S), bool); oy, ox = (S - nh) // 2, (S - nw) // 2; om[oy:oy + nh, ox:ox + nw] = mi; return om
def radial(mask, c, n=24):
    r = []
    for k in range(n):
        a = 2 * math.pi * k / n; rr = 0
        for t in np.arange(0, S, 1.0):
            x, y = int(c[0] + math.cos(a) * t), int(c[1] - math.sin(a) * t)
            if 0 <= x < S and 0 <= y < S and mask[y, x]: rr = t
        r.append(rr)
    return np.array(r)
tiles = []
for i in cells:
    p = f"{d}/v_{i:02d}.png"
    if not os.path.exists(p): continue
    tm = frame(np.asarray(Image.open(f"{T}/full_{i:02d}.png").convert("L")) > 127); rm = frame(np.asarray(Image.open(p).convert("RGBA"))[..., 3] > 128)
    ys, xs = np.where(tm); c = (xs.mean(), ys.mean()); rt, ro = radial(tm, c), radial(rm, c); diff = (ro - rt) / (S * 0.5) * 100
    worst = sorted(range(24), key=lambda k: -abs(diff[k]))[:4]
    names = [NAMES[int(round(k / 24 * 16)) % 16] for k in range(24)]
    print(f"view {i:02d}: " + ", ".join(f"{names[k]} {diff[k]:+.0f}%" for k in worst))
    rgb = np.zeros((S, S, 3), np.uint8); rgb[tm & rm] = (60, 170, 90); rgb[rm & ~tm] = (220, 60, 60); rgb[tm & ~rm] = (60, 90, 220); tiles.append(rgb)
if tiles:
    cols = 3; rows = [np.concatenate(tiles[k:k + cols] + [np.zeros_like(tiles[0])] * (cols - len(tiles[k:k + cols])), 1) for k in range(0, len(tiles), cols)]
    Image.fromarray(np.concatenate(rows, 0)).save(out)
