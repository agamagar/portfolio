# The two flat layers the noir head sits between, cut from the tile at the site canvas size
# (802 x 862): noir-back.webp, the rainy dark with the head and hat painted out (diffused in
# from around them, then the tile's own rain streaks laid back over), and noir-coat.webp,
# the coat collar, shirt and tie with a soft alpha edge, drawn in front of the head.
import numpy as np
from PIL import Image, ImageFilter
from scipy import ndimage as nd
W, H = 802, 862
tile = Image.open("noir.png").convert("RGB")
P = np.load("ref_parts_tile.npy")
img = np.asarray(tile.resize((W, H), Image.LANCZOS)).astype(np.float32)
up = lambda m: np.asarray(Image.fromarray((m * 255).astype(np.uint8)).resize((W, H), Image.BILINEAR)).astype(np.float32) / 255
coat = up((P == 6).astype(np.float32))
head = up(((P >= 1) & (P <= 5)).astype(np.float32)) > 0.02
# coat: its own pixels, alpha from the soft mask (pulled in half a pixel)
a = np.clip((coat - 0.25) / 0.6, 0, 1)
Image.fromarray(np.dstack([img, a * 255]).round().astype(np.uint8), "RGBA").save("noir-coat.webp", quality=88, method=6)
# back: fill the head (grown a little) by diffusion from the known pixels, coarse to fine
hole = nd.binary_dilation(head, iterations=6) & (coat < 0.5)
# the tile's pale left border column is not background either
edge = np.zeros_like(hole); edge[:, :10] = True; edge[:, -6:] = True
hole |= edge & (coat < 0.5)
known = ~hole
out = img.copy()
out[hole] = img[known].mean(0)
for s in (64, 32, 16, 8, 4, 2):
    for _ in range(12):
        bl = np.stack([nd.gaussian_filter(out[..., c], s) for c in range(3)], -1)
        out[hole] = bl[hole]
# the rain: streak texture borrowed from the open background, tiled into the hole
bgm = known & (coat < 0.1)
hp = img - np.stack([nd.gaussian_filter(img[..., c], 6) for c in range(3)], -1)
ys, xs = np.where(hole)
sx = 712 + (xs * 7 // 10) % 78  # a clean strip of rain on the right, tiled
src = hp[ys, sx]
ok = bgm[ys, sx]
out[ys[ok], xs[ok]] += 0.8 * src[ok]
# the tile's own edge columns come back as they were (they were only kept out of the diffusion)
keep = edge & ~nd.binary_dilation(head, iterations=6)
out[keep] = img[keep]
Image.fromarray(np.clip(out, 0, 255).round().astype(np.uint8)).save("noir-back.webp", quality=86, method=6)
print("plates", a.mean(), hole.mean())
