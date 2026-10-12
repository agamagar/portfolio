# tileplates.py SKIN : the flat layer behind a fitted head, cut from its tile at the site canvas size
# (802 x 862): SKIN-back.webp, the backdrop with the head painted out (felt/feltplates.py, generalised).
# The backdrops are smooth (a flat or graded colour with a paper or clay grain), so the hole is filled
# with a cubic surface fitted to the open backdrop (kept clear of the head), plus a grain matched to
# the backdrop's own. The tiles' pale edge columns are backdrop too. Run in the fit folder.
import sys
import numpy as np
from PIL import Image
from scipy import ndimage as nd
W, H = 802, 862
SKIN = sys.argv[1]
img = np.asarray(Image.open(f"{SKIN}.png").convert("RGB").resize((W, H), Image.LANCZOS)).astype(np.float32)
P = np.load("ref_parts_full.npy")
yy, xx = np.mgrid[0:H, 0:W]
edge = (xx < 12) | (xx > W - 5)
near = nd.binary_dilation(P > 0, iterations=26)
# riso: the safety pin's tip, past the ear, is kept from the tile (segtile leaves it out of the head)
if SKIN == "riso":
    from PIL import ImageDraw
    pin = Image.new("L", (W, H), 0); ImageDraw.Draw(pin).polygon([(0, 530), (66, 535), (86, 572), (70, 628), (0, 634)], fill=1)
    keep = np.asarray(pin).astype(bool)
else:
    keep = np.zeros((H, W), bool)
fitm = ~near & ~edge
x, y = xx / W - 0.5, yy / H - 0.5
A = np.stack([x ** i * y ** j for i in range(4) for j in range(4 - i)], -1)
smooth = np.zeros_like(img)
for c in range(3):
    coef, *_ = np.linalg.lstsq(A[fitm], img[..., c][fitm], rcond=None)
    smooth[..., c] = A @ coef
# grain: the backdrop's own fine texture level
hp = img - np.stack([nd.gaussian_filter(img[..., c], 3) for c in range(3)], -1)
sd = hp[fitm].std(0)
rng = np.random.default_rng(7)
g = nd.gaussian_filter(rng.standard_normal((H, W)), 0.7)
g /= g.std()
grain = g[..., None] * sd[None, None] * 0.9
# keep the tile's own pixels away from the head; the model inside, blended over 12 px
w = nd.gaussian_filter((near | edge).astype(np.float32), 6)
w = np.clip(np.maximum(w * 1.6, (nd.binary_dilation(P > 0, iterations=12) | edge)), 0, 1)
w[keep] = 0
out = img * (1 - w[..., None]) + (smooth + grain) * w[..., None]
Image.fromarray(np.clip(out, 0, 255).round().astype(np.uint8)).save(f"{SKIN}-back.webp", quality=90, method=6)
print("residual of the fit on open backdrop", np.abs(smooth - img)[fitm].mean(0).round(2), "grain sd", sd.round(2))
