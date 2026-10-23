# turn_prep.py : cut Agam's 11-view turnaround sheet into cells and masks.
#   turn/cell_NN.png   the cell
#   turn/full_NN.png   head silhouette (hair + skin): chroma or darkness against the light grey, floor shadow removed (neutral grey = shadow)
#   turn/skin_NN.png   skin only (face, ears, neck): flood from a seed in the skin colour family (warm, light), hair excluded
#   turn/prep_sheet.png  masks over cells for checking
import os
import numpy as np
from PIL import Image
from scipy import ndimage as nd
HERE = os.path.dirname(os.path.abspath(__file__)); T = f"{HERE}/turn"
sheet = Image.open(f"{T}/agam-turnaround-sheet.webp").convert("RGB"); W, H = sheet.size
XS = [(0, 408), (480, 896), (968, 1376)]; YS = [(0, 432), (512, 952), (1032, 1472), (1552, 2000)]
def lab(a):
    a = a / 255.0; a = np.where(a > 0.04045, ((a + 0.055) / 1.055) ** 2.4, a / 12.92)
    M = np.array([[0.4124, 0.3576, 0.1805], [0.2126, 0.7152, 0.0722], [0.0193, 0.1192, 0.9505]]); xyz = a @ M.T / np.array([0.95047, 1, 1.08883])
    f = np.where(xyz > 0.008856, np.cbrt(xyz), 7.787 * xyz + 16 / 116); return np.stack([116 * f[..., 1] - 16, 500 * (f[..., 0] - f[..., 1]), 200 * (f[..., 1] - f[..., 2])], -1)
tiles = []
n = 0
for (y0, y1) in YS:
    for (x0, x1) in XS:
        c = sheet.crop((x0, y0, x1, y1)); c.save(f"{T}/cell_{n:02d}.png"); a = np.asarray(c).astype(np.float32); L = lab(a)
        chroma = np.hypot(L[..., 1], L[..., 2]); bgL = np.median(L[:8, :, 0])
        full = (chroma > 9) | (L[..., 0] < 55)
        full = nd.binary_opening(full, iterations=2); lb, k = nd.label(full)
        if k: full = lb == (1 + np.argmax(nd.sum(full, lb, range(1, k + 1))))
        full = nd.binary_fill_holes(nd.binary_closing(full, iterations=3))
        hairdark = (L[..., 0] < 38) | ((L[..., 0] < 50) & (L[..., 1] < 14))     # dark brown hair
        skin = full & ~nd.binary_dilation(hairdark, iterations=1) & (L[..., 0] > 52) & (L[..., 1] > 2) & (L[..., 1] < 26) & (L[..., 2] > 6)
        skin = nd.binary_opening(skin, iterations=2); lb, k = nd.label(skin)
        if k: skin = lb == (1 + np.argmax(nd.sum(skin, lb, range(1, k + 1))))
        skin = nd.binary_fill_holes(nd.binary_closing(skin, iterations=2))
        Image.fromarray((full * 255).astype(np.uint8)).save(f"{T}/full_{n:02d}.png"); Image.fromarray((skin * 255).astype(np.uint8)).save(f"{T}/skin_{n:02d}.png")
        v = a.copy(); e = full ^ nd.binary_erosion(full, iterations=2); v[e] = (255, 0, 255); e2 = skin ^ nd.binary_erosion(skin, iterations=2); v[e2] = (0, 200, 255); tiles.append(Image.fromarray(v.astype(np.uint8)).resize((204, 216)))
        print(n, "full", int(full.sum()), "skin", int(skin.sum())); n += 1
g = Image.new("RGB", (204 * 3, 216 * 4))
for i, t in enumerate(tiles): g.paste(t, ((i % 3) * 204, (i // 3) * 216))
g.save(f"{T}/prep_sheet.png")
