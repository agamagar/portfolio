# remove_highlights.py FILE.png [...] : the photo's specular highlights baked into a skin texture (the bright white-blue streak down the
# nose bridge, the pale rim lights along the nose, the sockets and the ear), removed. They are light, not albedo: the rig lights the
# surface itself, so a baked highlight shows as a permanent pale line that never moves with the light or the turn.
# A texel is a highlight when it is more than THR levels brighter than its 25 px neighbourhood mean AND the local tone is not a legitimate
# bright region (the mean itself is not in the top decile of the head). Flagged texels (+3 px halo) are refilled by push-pull from the
# unflagged ones; everything else is byte-identical. Run on skin-raw*.png and skin-clean*.png (front layer: left half) alike.
import sys, os
import numpy as np
from PIL import Image
from scipy import ndimage as nd
THR = float(os.environ.get("THR", 26))
def pushpull(img, w):
    levels = [(img * w[..., None], w)]
    while min(levels[-1][1].shape) > 8:
        c, ww = levels[-1]
        h2, w2 = (c.shape[0] + 1) // 2, (c.shape[1] + 1) // 2
        pad = lambda a: np.pad(a, [(0, h2 * 2 - a.shape[0]), (0, w2 * 2 - a.shape[1])] + [(0, 0)] * (a.ndim - 2), mode="edge")
        cc, w_ = pad(c), pad(ww)
        levels.append((cc.reshape(h2, 2, w2, 2, -1).sum((1, 3)), w_.reshape(h2, 2, w2, 2).sum((1, 3))))
    fill = None
    for c, ww in reversed(levels):
        avg = c / np.maximum(ww, 1e-6)[..., None]
        if fill is None: fill = avg
        else:
            up = np.repeat(np.repeat(fill, 2, 0), 2, 1)[:c.shape[0], :c.shape[1]]
            a = np.clip(ww, 0, 1)[..., None]
            fill = avg * a + up * (1 - a)
    return fill
for f in sys.argv[1:]:
    a = np.asarray(Image.open(f).convert("RGB")).astype(np.float32)
    L = a.mean(2)
    mean = nd.uniform_filter(L, 25)
    hl = (L - mean) > THR
    hl = nd.binary_opening(hl, iterations=1) | ((L - mean) > THR * 1.6)
    sel = nd.binary_dilation(hl, iterations=3)
    # leave alone: the near-black surround (hair, backdrop) where the "mean" is tiny and any light texel passes the test
    sel &= mean > np.percentile(L, 20)
    fill = pushpull(a, (~sel).astype(np.float32))
    out = np.where(sel[..., None], fill, a)
    soft = nd.gaussian_filter(out, (1.2, 1.2, 0)); rim = nd.binary_dilation(sel, iterations=2) & ~nd.binary_erosion(sel, iterations=1)
    out = np.where(rim[..., None], soft, out)
    print(f, "texels", int(sel.sum()), f"({100 * sel.mean():.3f}%)")
    Image.fromarray(np.clip(out + 0.5, 0, 255).astype(np.uint8)).save(f, optimize=True)
