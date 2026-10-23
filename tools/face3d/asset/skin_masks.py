# skin_masks.py : the SKIN-only mask (face, ears, neck: no hair, hat, beard, glasses) of target heads, for fitting the canonical head's shape.
# Seeds a flood fill from a cheek point per head (colour distance in Lab to the seed's neighbourhood median, limited), keeps the connected
# component, fills holes. Writes gen/mask_<look>.png and gen/maskview_<look>.png (mask edge over the crop).
import os, sys
import numpy as np
from PIL import Image
from scipy import ndimage as nd
HERE = os.path.dirname(os.path.abspath(__file__))
SEEDS = {"chef": (265, 230), "quiff_ci": (265, 215), "quiff_scar": (250, 235), "curly": (265, 235), "vitiligo_fade": (300, 215), "silver_nasal": (310, 230)}
def lab(a):
    a = a / 255.0; a = np.where(a > 0.04045, ((a + 0.055) / 1.055) ** 2.4, a / 12.92)
    M = np.array([[0.4124, 0.3576, 0.1805], [0.2126, 0.7152, 0.0722], [0.0193, 0.1192, 0.9505]]); xyz = a @ M.T / np.array([0.95047, 1, 1.08883])
    f = np.where(xyz > 0.008856, np.cbrt(xyz), 7.787 * xyz + 16 / 116); return np.stack([116 * f[..., 1] - 16, 500 * (f[..., 0] - f[..., 1]), 200 * (f[..., 1] - f[..., 2])], -1)
for name, (sx, sy) in SEEDS.items():
    im = np.asarray(Image.open(f"{HERE}/gen/target_{name}.png").convert("RGB").resize((440, 472))).astype(np.float32)
    L = lab(im); seed = np.median(L[sy - 4:sy + 5, sx - 4:sx + 5].reshape(-1, 3), 0)
    # the face has a soft light gradient: allow lightness drift, be strict on chroma
    d = np.sqrt(((L[..., 1:] - seed[1:]) ** 2).sum(-1) * 1.0 + ((L[..., 0] - seed[0]) * 0.45) ** 2)
    m = d < 17; m = nd.binary_opening(m, iterations=2)
    lab_, n = nd.label(m); m = lab_ == lab_[sy, sx]; m = nd.binary_fill_holes(nd.binary_closing(m, iterations=3))
    Image.fromarray((m * 255).astype(np.uint8)).save(f"{HERE}/gen/mask_{name}.png")
    edge = m ^ nd.binary_erosion(m, iterations=2); v = im.copy(); v[edge] = (255, 0, 255); Image.fromarray(v.astype(np.uint8)).save(f"{HERE}/gen/maskview_{name}.png")
    print(name, int(m.sum()))
