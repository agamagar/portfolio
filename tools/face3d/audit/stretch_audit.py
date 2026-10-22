# stretch_audit.py DIR [DIR2] : flags stretched / smeared texture in rigshot renders (front, 3/4, profile of every skin).
# A texture projected from the front and seen from the side stretches into long single-direction streaks. For every render
# (DIR/<skin>_<view>.png, alpha = head) it measures the share of head pixels where the local structure is a strong, coherent edge
# field running one way (structure-tensor coherence > 0.85 over gradient energy above the head's median) and compares it with the
# same skin's front view: a view is FLAGGED when its streak share is more than 1.8x the front's and above 1.5% of the head.
# NOTE (honest limit): the share counts coherent edge runs, so it also rises for clean drawn skins with long outlines; it is a
# screening number to compare the SAME skin before and after a change, not a verdict. Judge on the sheets (skinsheet.py).
# Output: a table, and exit code 1 if anything is flagged. With DIR2, prints DIR then DIR2 side by side (before / after).
import sys, glob, os
import numpy as np
from PIL import Image
from scipy import ndimage as nd

def streak_share(path):
    im = Image.open(path).convert("RGBA"); a = np.asarray(im).astype(np.float32)
    head = a[..., 3] > 200
    if head.sum() < 500: return None
    g = a[..., :3].mean(2)
    head_in = nd.binary_erosion(head, iterations=6)
    gx, gy = nd.sobel(g, 1), nd.sobel(g, 0)
    jxx, jyy, jxy = (nd.gaussian_filter(v, 5) for v in (gx * gx, gy * gy, gx * gy))
    tr = jxx + jyy + 1e-6
    coh = np.sqrt((jxx - jyy) ** 2 + 4 * jxy ** 2) / tr
    energy = tr
    thr = np.median(energy[head_in]) * 1.0
    s = head_in & (coh > 0.85) & (energy > thr)
    return float(s.sum() / head_in.sum())

def table(d):
    out = {}
    for f in sorted(glob.glob(f"{d}/*_*.png")):
        skin, view = os.path.basename(f)[:-4].rsplit("_", 1)
        if view not in ("rest", "turnL", "turnR", "yawL", "yawR", "profile"): continue
        v = streak_share(f)
        if v is not None: out.setdefault(skin, {})[view] = v
    return out

A = table(sys.argv[1]); B = table(sys.argv[2]) if len(sys.argv) > 2 else None
bad = 0
views = ["rest", "yawL", "yawR", "profile"]
print("skin".ljust(9), *[v.ljust(9) for v in views], "(streak share of the head, %)")
for skin in sorted(A):
    for tag, T in (("", A), ("after", B)):
        if T is None or skin not in T: continue
        row = T[skin]; front = row.get("rest", row.get("turnL", 0.0)) or 0.0
        cells = []
        for v in views:
            x = row.get(v)
            if x is None: cells.append("-".ljust(9)); continue
            flag = x > 0.015 and x > 1.8 * max(front, 0.004)
            bad += flag
            cells.append((f"{100 * x:.1f}" + ("!" if flag else "")).ljust(9))
        print((skin + " " + tag).ljust(9), *cells)
sys.exit(1 if bad else 0)
