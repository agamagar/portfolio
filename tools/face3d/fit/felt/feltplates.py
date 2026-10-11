# The flat layer behind the felt head, cut from the tile at the site canvas size (802 x 862):
# felt-back.webp, the red backdrop with the head painted out. The backdrop is a smooth
# gradient, so the hole is filled with a cubic surface fitted to the open backdrop (kept
# clear of the head's soft contact shadow), plus a grain matched to the backdrop's own; the
# tile's pale edge columns are backdrop too. Run in the fit folder (felt.png, ref_parts_full.npy).
import numpy as np
from PIL import Image
from scipy import ndimage as nd
W, H = 802, 862
img = np.asarray(Image.open("felt.png").convert("RGB").resize((W, H), Image.LANCZOS)).astype(np.float32)
P = np.load("ref_parts_full.npy")
yy, xx = np.mgrid[0:H, 0:W]
edge = (xx < 12) | (xx > W - 5)
near = nd.binary_dilation(P > 0, iterations=26)
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
out = img * (1 - w[..., None]) + (smooth + grain) * w[..., None]
Image.fromarray(np.clip(out, 0, 255).round().astype(np.uint8)).save("felt-back.webp", quality=90, method=6)
print("residual of the fit on open backdrop", np.abs(smooth - img)[fitm].mean(0).round(2), "grain sd", sd.round(2))
