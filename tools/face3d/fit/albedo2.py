# Screen-space albedo-ratio textures (UVs projected from the fitted camera), one per part:
# texel (x, y) = reference pixel (x, y) / our light there, where that part is the visible
# surface; elsewhere the nearest visible value.
#   python3 albedo2.py PASSDIR LIGHT.json OUTDIR
import sys, json, os
import numpy as np
from PIL import Image
from scipy import ndimage as nd
PD, LJ, OUT = sys.argv[1], sys.argv[2], sys.argv[3]
os.makedirs(OUT, exist_ok=True)
# how far round each moving feature its margin reaches (pixels at 802 x 862); a style whose
# features cast wider soft shadows widens them (felt: FIT_GROW="eye:11,brow:14,mouth:14")
GROW = {"eye": 6, "brow": 10, "mouth": 14}
GROW.update({k: int(v) for k, v in (kv.split(":") for kv in os.environ.get("FIT_GROW", "").split(",") if kv)})
# how the clean skin under the movers is filled: "nearest" (the nearest clean texel, clay's) or
# "diffuse" (a smooth fill from clean skin a few pixels clear of the margin, plus the skin's own
# grain): the nearest texel drags a feature's shadow ring into radial streaks (felt's beads)
FILL = os.environ.get("FIT_CLEAN_FILL", "nearest")
L = json.load(open(LJ))
r8 = np.asarray(Image.open("ref.webp").convert("RGB")).astype(np.float32) / 255
ref = np.where(r8 <= 0.04045, r8 / 12.92, ((r8 + 0.055) / 1.055) ** 2.4)
nrm = np.load(f"{PD}/normal.npy"); R = np.load(f"{PD}/camrot.npy")
n = nrm @ R; n /= np.linalg.norm(n, axis=-1, keepdims=True) + 1e-8
ao = np.load(f"{PD}/ao.npy")[..., 0]
mesh = np.load(f"{PD}/mesh.npy"); names = json.load(open(f"{PD}/meshes.json"))


def sh9(n):
    x, y, z = n[..., 0], n[..., 1], n[..., 2]
    return np.stack([0.282095 * np.ones_like(x), 0.488603 * y, 0.488603 * z, 0.488603 * x,
                     1.092548 * x * y, 1.092548 * y * z, 0.315392 * (3 * z * z - 1), 1.092548 * x * z,
                     0.546274 * (x * x - y * y)], -1)


Y = sh9(n)
tile = np.load(f"{PD}/tile.npy")
rep = {}
means = {}
# the parts that move: the skin under them, and as far round them as their soft shading
# reaches in the reference, holds clean skin (no ghost brow, no second smile)
def movers_mask(mesh, names):
    m = np.zeros(mesh.shape, bool)
    for n, grow in (("EyeL", GROW["eye"]), ("EyeR", GROW["eye"]), ("BrowL", GROW["brow"]), ("BrowR", GROW["brow"]), ("Mouth", GROW["mouth"])):
        if n in names:
            m |= nd.binary_dilation(mesh == names.index(n), iterations=grow)
    return m
movers = movers_mask(mesh, names)

# the skin is made twice: clean (no features under the parts that move) and raw (exactly
# what the reference shows, features and all). The site shows raw at rest and cross-fades
# each feature's margin to clean while that feature moves (margins.png says where)
marg = np.zeros(mesh.shape + (3,), np.float32)
for ch, parts_, grow in ((0, ("EyeL", "EyeR"), GROW["eye"]), (1, ("BrowL", "BrowR"), GROW["brow"]), (2, ("Mouth",), GROW["mouth"])):
    m = np.zeros(mesh.shape, bool)
    for n_ in parts_:
        if n_ in names:
            m |= nd.binary_dilation(mesh == names.index(n_), iterations=grow)
    marg[..., ch] = nd.gaussian_filter(m.astype(np.float32), 2)
Image.fromarray((np.clip(marg, 0, 1) * 255).round().astype(np.uint8)).save(os.path.join(OUT, "margins.png"))
jobs = [("Skin", "skin", "clean"), ("Skin", "skin", "raw"), ("Hair", "hair", ""), ("EyeL", "eye", ""), ("EyeR", "eye", ""),
        ("BrowL", "brow", ""), ("BrowR", "brow", ""), ("Mouth", "skin", "")]
for name, key, variant in jobs:
    if name not in names or key not in L or "sh" not in L[key]:
        continue
    vis = mesh == names.index(name)
    Lm = np.array(L[key]["sh"]).T
    # must match the shader: max(max(SH, 0) * ao^k, FLOOR)
    shade = np.maximum(np.maximum(Y @ Lm, 0) * (ao ** L[key]["k"])[..., None], 0.03)
    layers = (0, 1) if name in ("Skin", "Hair") else (0,)
    tiles = []
    for t in layers:
        sel = vis & (tile == t) if len(layers) > 1 else vis
        if name == "Skin" and variant == "clean":
            sel &= ~movers
        # step one pixel in from the layer's edge: edge pixels blend with what is behind
        # erode only at the part's real edges, not along the seam between its two depth layers
        # one pixel in from the part's edges, two from the outer silhouette (those pixels blend
        # with the background and would stretch into pale streaks when the head turns)
        core = sel & nd.binary_erosion(vis, iterations=1) & nd.binary_erosion(mesh >= 0, iterations=2) if sel.sum() > 400 else sel
        if core.sum() == 0:
            core = sel if sel.sum() else vis
        ratio = np.ones_like(ref)
        ratio[core] = ref[core] / shade[core]
        if t == 0 and core.sum() and variant != "raw":
            # the part's typical colour (median over what the reference shows of it): what a
            # surface the reference never showed gets, seen from the back or the side
            means[name] = np.median(ratio[core], axis=0).tolist()
        dist, (iy, ix) = nd.distance_transform_edt(~core, return_indices=True)
        near = ratio[iy, ix]
        if name == "Skin" and variant == "clean" and FILL == "diffuse":
            # the movers' holes inside the skin: diffuse in (log ratio) from clean skin a few
            # pixels clear of them, coarse to fine, then lay the skin's own grain back over
            hole = movers & nd.binary_fill_holes(vis | movers) & (dist > 0)
            src = core & ~nd.binary_dilation(movers, iterations=3)
            lg = np.log(np.maximum(near, 1e-4))
            known = src.copy()
            fill = lg.copy()
            fill[~known] = lg[src].mean(0) if src.any() else 0
            for sg in (24, 12, 6, 3, 1.5):
                for _ in range(10):
                    bl = np.stack([nd.gaussian_filter(fill[..., c], sg) for c in range(3)], -1)
                    fill[~known] = bl[~known]
            hp = lg - np.stack([nd.gaussian_filter(lg[..., c], 3) for c in range(3)], -1)
            gy, gx = np.where(hole)
            sy, sx = np.clip(gy - 70, 0, hole.shape[0] - 1), gx  # grain from clean skin just above
            okg = src[sy, sx]
            fill[gy[okg], gx[okg]] += hp[sy[okg], sx[okg]]
            near = np.where(hole[..., None], np.exp(fill), near)
        # surface the reference never shows (revealed when the head turns): the nearest real
        # colour right at the edge, fading into a soft average of the part further out
        soft = np.stack([nd.gaussian_filter(near[..., c], 10) for c in range(3)], -1)
        wgt = np.clip((dist - 2) / 14, 0, 1)[..., None]
        tiles.append(near * (1 - wgt) + soft * wgt)
        rep[f"{name}{variant}{t}"] = int(core.sum())
    out = np.concatenate(tiles, 1)
    fname = f"{name}_ratio_raw.png" if variant == "raw" else f"{name}_ratio.png"
    Image.fromarray((np.clip(out / 4, 0, 1) * 255).round().astype(np.uint8)).save(os.path.join(OUT, fname))
# which part (and depth layer) the reference shows at each pixel: id = part * 2 + layer + 1
ids = np.where(mesh >= 0, mesh * 2 + tile + 1, 0).astype(np.uint8)
Image.fromarray(ids).save(os.path.join(OUT, "idmap.png"))
# the lids: a closed eye should read as flush skin, so each lid is lit with the normal of
# the face round its eye (camera space), measured here
lids = {}
for lid, eye in (("LidL", "EyeL"), ("LidR", "EyeR")):
    if eye in names:
        em = mesh == names.index(eye)
        ring = nd.binary_dilation(em, iterations=14) & ~nd.binary_dilation(em, iterations=7) & (mesh == names.index("Skin"))
        v = n[ring].mean(0); v /= np.linalg.norm(v)
        lids[lid] = v.tolist()
json.dump(lids, open(os.path.join(OUT, "lids.json"), "w"))
json.dump(means, open(os.path.join(OUT, "means.json"), "w"))
print(json.dumps(rep))
