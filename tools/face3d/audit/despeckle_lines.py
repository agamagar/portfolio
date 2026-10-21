# despeckle_lines.py FILE.png [...] : like despeckle_tex.py, but only long thin bright runs (the dotted edge lines a projected skin
# texture carries along every occluding edge: the nose's left edge, the sockets, the ear rim), so a skin whose style IS grain
# (stone, felt, claySun, pixel, riso) keeps its speckle. Bright = more than THR levels above a 5x5 grey opening; dots within
# 3 px join into one run; a run is a defect when it is >= 24 px long and thin (area / length < 9). Defects (plus 1 px) are
# refilled from their unflagged neighbours (normalised 9x9 box blur). Reports the fraction of texels changed. In place.
import sys
import numpy as np
from PIL import Image
from scipy import ndimage as nd
THR, MINLEN, THICK = 11, 24, 9
for f in sys.argv[1:]:
    a = np.asarray(Image.open(f).convert("RGB")).astype(np.float32)
    L = a.mean(2)
    bright = (L - nd.grey_opening(L, size=(5, 5))) > THR
    lab, n = nd.label(nd.binary_dilation(bright, iterations=3), structure=np.ones((3, 3)))
    sel = np.zeros_like(bright)
    if n:
        sl = nd.find_objects(lab)
        for i, s in enumerate(sl, 1):
            h, w = s[0].stop - s[0].start, s[1].stop - s[1].start
            m = (lab[s] == i) & bright[s]
            length = np.hypot(h, w)
            if length >= MINLEN and m.sum() / length < THICK and max(h, w) >= 0.5 * length:
                sel[s] |= m
    sel = nd.binary_dilation(sel, iterations=1)
    w = (~sel).astype(np.float32)
    num = np.stack([nd.uniform_filter(a[..., c] * w, size=9) for c in range(3)], 2)
    den = nd.uniform_filter(w, size=9)[..., None]
    fill = np.where(den > 0.05, num / np.maximum(den, 1e-6), a)
    out = a.copy(); out[sel] = fill[sel]
    print(f, "texels", int(sel.sum()), f"({100 * sel.mean():.3f}%)")
    Image.fromarray(np.clip(out + 0.5, 0, 255).astype(np.uint8)).save(f, optimize=True)
