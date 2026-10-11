# Cut the felt tile (tools/face-styles/ref/knit.png, copied in as felt.png) into part
# labels: 0 bg, 1 skin, 2 hair, 3 eye, 4 brow. Felt is easy to cut by colour: the backdrop
# is saturated red, the hair dark brown, the skin pale beige, the beads near-black. The
# stitched smile is dark brown too but stays skin (the skin texture carries it, as clay's
# carved smile does). Run in the fit folder (ref.webp = the tile at 802 x 862).
# Writes ref_parts_full.npy, ref_parts.npy (fit size, 200 wide), ref_parts_tile.npy,
# trim_keep.npy and parts_check.png.
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
hue = np.degrees(np.arctan2(b, a)) % 360
chroma = np.hypot(a, b)
# the backdrop: strongly red (a* high), or the tile's pale left edge strip
bg = ((a > 38) & (chroma > 45) & ((hue < 48) | (hue > 345))) | (np.arange(L.shape[1])[None, :] < 8)
bg = nd.binary_opening(bg, iterations=2)
lb, n = nd.label(bg)
border = set(np.unique(np.concatenate([lb[0], lb[-1], lb[:, 0], lb[:, -1]]))) - {0}
bg = np.isin(lb, list(border))
fg = nd.binary_fill_holes(~bg)
fg = nd.binary_opening(fg, iterations=2)
lb, n = nd.label(fg)
fg = lb == (np.argmax(nd.sum(fg, lb, range(1, n + 1))) + 1)
parts = np.zeros(L.shape, np.uint8)
parts[fg] = 1
dark = fg & (L < 45)
lbl, n = nd.label(dark)
sizes = nd.sum(dark, lbl, range(1, n + 1))
big = np.argmax(sizes) + 1
hair = lbl == big
for i in range(1, n + 1):
    if i == big or sizes[i - 1] < 120:
        continue
    ys, xs = np.where(lbl == i)
    h, w = np.ptp(ys) + 1, np.ptp(xs) + 1
    fill = len(ys) / (h * w)
    cy, cx = ys.mean(), xs.mean()
    kind = "?"
    if 0.7 < h / w < 1.4 and fill > 0.55 and L[lbl == i].mean() < 30:
        kind = "eye"
    elif w > 1.15 * h and cy < 440 and cx > 250:
        kind = "brow"
    elif cy > 560 and cx < 300:
        kind = "hair"
    print(i, int(sizes[i - 1]), "c", int(cx), int(cy), "hw", h, w, round(fill, 2), round(float(L[lbl == i].mean()), 1), kind)
    if kind == "eye":
        parts[nd.binary_fill_holes(lbl == i)] = 3
    elif kind == "brow":
        parts[nd.binary_closing(lbl == i, iterations=2)] = 4
    elif kind == "hair":
        hair |= lbl == i
hair = nd.binary_fill_holes(nd.binary_closing(hair, iterations=3)) & fg
parts[hair & (parts == 1)] = 2
np.save("ref_parts_full.npy", parts)
np.save("trim_keep.npy", nd.binary_dilation(parts > 0, iterations=3))
small = np.asarray(Image.fromarray(parts).resize((W, H), Image.NEAREST))
np.save("ref_parts.npy", small)
np.save("ref_parts_tile.npy", np.asarray(Image.fromarray(parts).resize((382, 408), Image.NEAREST)))
pal = np.array([[40, 40, 60], [246, 214, 190], [90, 50, 30], [0, 0, 255], [60, 200, 60]], np.uint8)
Image.fromarray(pal[parts]).save("ref_parts.png")
rgb = (full * 255).astype(float)
ov = (0.55 * rgb + 0.45 * pal[parts]).astype(np.uint8)
Image.fromarray(np.concatenate([ov, pal[parts]], 1)).save("parts_check.png")
print("size", parts.shape, "fit", small.shape, "counts", np.bincount(small.ravel(), minlength=5))
