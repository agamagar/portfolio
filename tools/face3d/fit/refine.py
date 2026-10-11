# Close the loop: compare the browser's render with the reference pixel by pixel and fold
# the ratio back into each part's texture where that part (and depth layer) is visible.
#   python3 refine.py NAME : reads NAME/site.png, NAME/passes, NAME/tex; rewrites NAME/tex
import sys, json, os
import numpy as np
from PIL import Image
from scipy import ndimage as nd
N = sys.argv[1]
# how far round each moving feature its margin reaches (pixels at 802 x 862); a style whose
# features cast wider soft shadows widens them (felt: FIT_GROW="eye:11,brow:14,mouth:14")
GROW = {"eye": 6, "brow": 10, "mouth": 14}
GROW.update({k: int(v) for k, v in (kv.split(":") for kv in os.environ.get("FIT_GROW", "").split(",") if kv)})

lin = lambda c: np.where(c <= 0.04045, c / 12.92, ((c + 0.055) / 1.055) ** 2.4)
ref = lin(np.asarray(Image.open("ref.webp").convert("RGB")).astype(np.float32) / 255)
site = lin(np.asarray(Image.open(f"{N}/site.png").convert("RGB")).astype(np.float32) / 255)
alpha = np.asarray(Image.open(f"{N}/site.png").convert("RGBA"))[..., 3] > 250
mesh = np.load(f"{N}/passes/mesh.npy"); tile = np.load(f"{N}/passes/tile.npy")
names = json.load(open(f"{N}/passes/meshes.json"))
corr = np.clip((ref + 2e-3) / (site + 2e-3), 0.5, 2.0)
rep = {}
# the parts that move: the skin under them, and as far round them as their soft shading
# reaches in the reference, holds clean skin (no ghost brow, no second smile)
def movers_mask(mesh, names):
    m = np.zeros(mesh.shape, bool)
    for n, grow in (("EyeL", GROW["eye"]), ("EyeR", GROW["eye"]), ("BrowL", GROW["brow"]), ("BrowR", GROW["brow"]), ("Mouth", GROW["mouth"])):
        if n in names:
            m |= nd.binary_dilation(mesh == names.index(n), iterations=grow)
    return m
movers = movers_mask(mesh, names)
for name in ("Skin_raw", "Skin", "Hair", "EyeL", "EyeR", "BrowL", "BrowR", "Mouth"):
    part = name.replace("_raw", "")
    if part not in names:
        continue
    path = f"{N}/tex/{part}_ratio_raw.png" if name.endswith("_raw") else f"{N}/tex/{name}_ratio.png"
    tex = np.asarray(Image.open(path).convert("RGB")).astype(np.float32) / 255 * 4
    W = 802
    layers = tex.shape[1] // W
    vis = (mesh == names.index(part)) & alpha
    for t in range(layers):
        sel = vis & (tile == t) if layers > 1 else vis
        # skip only the outer silhouette (where the pixel blends with the background);
        # inside the head every pixel is corrected, layer seams included
        core = sel & nd.binary_erosion(alpha, iterations=2)
        if name == "Skin":  # clean: only outside the feature margins (raw takes everything)
            core &= ~movers
        block = tex[:, t * W:(t + 1) * W]
        block[core] *= corr[core]
        # carry the corrected values a few pixels past the edge so the rim matches too
        ring = nd.binary_dilation(core, iterations=3) & ~core
        _, (iy, ix) = nd.distance_transform_edt(~core, return_indices=True)
        block[ring] = block[iy[ring], ix[ring]]
        tex[:, t * W:(t + 1) * W] = block
        rep[f"{name}{t}"] = round(float(np.abs(np.log(corr[core])).mean()), 4) if core.any() else 0
    Image.fromarray((np.clip(tex / 4, 0, 1) * 255).round().astype(np.uint8)).save(path)
print("mean |log correction| by part:", json.dumps(rep))
