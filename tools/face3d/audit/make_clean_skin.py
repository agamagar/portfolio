# make_clean_skin.py GLBSKIN.png RAW.png MARGINS.png OUT_CLEAN.png OUT_MARGINS.png : a fitted skin's CLEAN skin texture, features removed,
# and margins that really cover them.
# The rig shows the RAW skin (the reference's pixels, features painted in) at rest and fades to the CLEAN skin while a feature moves, by
# dot(margins, how much the eyes / brows / mouth move). Two things went wrong on the stylised skins: the margins (made from the 3D parts'
# footprints) were smaller than the features painted in the reference (hose's big black eyes, pixel's blocks), so painted remnants stayed
# on every emote; and the GLB's own map (the clean one) still carried faint feature rings. This:
#   1. grows the holes: from the margins (dilated 8 px) outward over pixels where the raw skin differs strongly from a first fill (region
#      growing, at most 44 px), so the hole matches what is really painted;
#   2. refills them from the skin around (push-pull: coarse averages pushed back in) plus matched grain (noise with the surrounding
#      high-pass statistics, not a copied patch);
#   3. writes margins over the grown holes (each hole pixel takes the channel of its nearest original margin: eyes / brows / mouth).
# Everything outside the holes is byte-identical to the GLB map. Work on the front layer (left 802 columns), mirrored to both layers.
import sys
import numpy as np
from PIL import Image
from scipy import ndimage as nd
glb, raw, margins, out_clean, out_margins = sys.argv[1:6]
im = np.asarray(Image.open(glb).convert("RGB")).astype(np.float32)
rw = np.asarray(Image.open(raw).convert("RGB")).astype(np.float32)
m = np.asarray(Image.open(margins).convert("RGB")).astype(np.float32) / 255
H, W = im.shape[:2]; HW = m.shape[1]
rng = np.random.default_rng(7)

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

front = (slice(None), slice(0, HW))
mf = m.max(2)
hole0 = nd.binary_dilation(mf > 0.04, iterations=8)
f0 = pushpull(rw[front], (~hole0).astype(np.float32))
diff = np.abs(rw[front] - f0).mean(2)
cand = (diff > 16) & nd.binary_dilation(hole0, iterations=44)
hole = nd.binary_propagation(hole0, mask=cand | hole0)
hole = nd.binary_closing(hole, iterations=3) | hole0
hole = nd.binary_dilation(hole, iterations=3)
# the clean map (front layer): the GLB map with the grown holes refilled, grain matched
g = im[front]
fill = pushpull(g, (~hole).astype(np.float32))
low = nd.gaussian_filter(g, (3, 3, 0)); hp = g - low
std = np.array([hp[(~hole) & (nd.binary_dilation(hole, iterations=60))][:, c].std() for c in range(3)])
noise = nd.gaussian_filter(rng.standard_normal(g.shape).astype(np.float32), (0.8, 0.8, 0)) * std * 1.6
res = np.where(hole[..., None], fill + noise, g)
rim = nd.binary_dilation(hole, iterations=2) & ~nd.binary_erosion(hole, iterations=2)
res = np.where(rim[..., None], nd.gaussian_filter(res, (1.5, 1.5, 0)), res)
clean = im.copy(); clean[front] = res
# the back layer (right half): the same holes (the margins fold onto both layers)
back = (slice(None), slice(HW, W))
gb = im[back]; fb = pushpull(gb, (~hole).astype(np.float32))
clean[back] = np.where(hole[..., None], fb, gb)
Image.fromarray(np.clip(clean + 0.5, 0, 255).astype(np.uint8)).save(out_clean, optimize=True)
# margins: each hole pixel takes the nearest original margin's channel, edge softened
idx = nd.distance_transform_edt(~(mf > 0.04), return_indices=True)[1]
near = m[idx[0], idx[1]]
mn = np.where(hole[..., None], np.maximum(near, 0.0), 0.0)
mn = np.maximum(mn, m)
mn = nd.gaussian_filter(mn, (2, 2, 0))
Image.fromarray(np.clip(mn * 255 + 0.5, 0, 255).astype(np.uint8)).save(out_margins, optimize=True)
print(glb.split("/")[-1], f"hole {100 * hole.mean():.2f}% (was {100 * hole0.mean():.2f}%)")
