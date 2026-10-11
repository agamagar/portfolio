# Cut the reference into part masks: 0 bg, 1 skin, 2 hair, 3 eye, 4 brow. Saves ref_parts.npy
# (at fit resolution) and a colour preview.
import numpy as np
from PIL import Image
from scipy import ndimage as nd
from skimage import color
W = 200
im = Image.open("ref.webp").convert("RGB")
H = round(im.height * W / im.width)
full = np.asarray(im).astype(float) / 255
lab = color.rgb2lab(full)
L, a, b = lab[..., 0], lab[..., 1], lab[..., 2]
bg = (L > 86) & (np.abs(a) < 4) & (np.abs(b) < 5)
bg = nd.binary_opening(bg, iterations=2)
lb, n = nd.label(bg)
border = set(np.unique(np.concatenate([lb[0], lb[-1], lb[:, 0], lb[:, -1]]))) - {0}
bg = np.isin(lb, list(border))
fg = ~bg
dark = fg & (L < 42)
eye = fg & (L < 22) & (np.hypot(a, b) < 12)
parts = np.zeros(L.shape, np.uint8)
parts[fg] = 1
lbl, n = nd.label(dark)
sizes = nd.sum(dark, lbl, range(1, n + 1))
big = np.argmax(sizes) + 1
hair = lbl == big
# the rest: eyes are round, brows are long and sit above the eyes; anything else dark
# (the nape under the ear, the ear's inner crease) is hair or shadow
for i in range(1, n + 1):
    if i == big or sizes[i - 1] < 300:
        continue
    ys, xs = np.where(lbl == i)
    h, w = ys.ptp() + 1, xs.ptp() + 1
    fill = len(ys) / (h * w)
    cy, cx = ys.mean(), xs.mean()
    kind = "?"
    if 0.7 < h / w < 1.4 and fill > 0.6 and 330 < cy < 480:
        kind = "eye"
    elif w > 1.2 * h and 300 < cy < 430 and cx > 280:
        kind = "brow"
    elif cy > 560:
        kind = "hair"
    print(i, int(sizes[i-1]), "c", int(cx), int(cy), "hw", h, w, round(fill, 2), kind)
    if kind == "eye":
        parts[nd.binary_fill_holes(lbl == i)] = 3
    elif kind == "brow":
        parts[lbl == i] = 4
    elif kind == "hair":
        hair |= lbl == i
hair = nd.binary_fill_holes(nd.binary_closing(hair, iterations=3)) & fg
parts[hair & (parts == 1)] = 2
np.save("ref_parts_full.npy", parts)
small = np.asarray(Image.fromarray(parts).resize((W, H), Image.NEAREST))
np.save("ref_parts.npy", small)
pal = np.array([[235, 235, 235], [246, 214, 190], [90, 50, 30], [0, 0, 0], [200, 60, 60]], np.uint8)
Image.fromarray(pal[parts]).save("ref_parts.png")
print("size", parts.shape, "fit", small.shape, "counts", np.bincount(small.ravel(), minlength=5))
