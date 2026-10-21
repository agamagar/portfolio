# reinpaint_eyes.py CLEAN.png MARGINS.png [CHANNEL=0] : refill the eye holes of a clean skin texture from the skin around them.
# The lids (shown while an eye blinks or squints) read the clean skin at the eye's UV, and noir's inpainted eye holes were a
# flat mid-grey blob the lids then wore. The margins map (R eyes, G brows, B mouth, 802 wide: one per depth layer) gives
# the holes; they are refilled by a push-pull fill (coarse averages of the unmasked texels, pushed back into the hole),
# so the lid takes the skin's own tone and gradient. In place.
import sys
import numpy as np
from PIL import Image
from scipy import ndimage as nd
clean, margins = sys.argv[1:3]; ch = int(sys.argv[3]) if len(sys.argv) > 3 else 0
im = np.asarray(Image.open(clean).convert("RGB")).astype(np.float32)
m = np.asarray(Image.open(margins).convert("RGB"))[..., ch].astype(np.float32) / 255
H, W = im.shape[:2]
if m.shape[1] * 2 == W: m = np.concatenate([m, m], 1)
hole = nd.binary_dilation(m > 0.04, iterations=7)
w = (~hole).astype(np.float32)
# push: weighted averages at halving scales; pull: fill each level's hole from the next coarser one
levels = [(im * w[..., None], w)]
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
out = np.where(hole[..., None], fill, im)
out = np.where(hole[..., None], nd.gaussian_filter(out, (1.5, 1.5, 0)), out)  # soften the seam of the fill
print(clean, "refilled", int(hole.sum()), "texels")
Image.fromarray(np.clip(out + 0.5, 0, 255).astype(np.uint8)).save(clean, optimize=True)
