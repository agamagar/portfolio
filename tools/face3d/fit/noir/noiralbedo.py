# Screen-space albedo-ratio textures for the noir head (UVs projected from the fitted camera),
# one per part: texel = reference pixel / our light there. Noir is mostly near-black, where a
# 9-term SH light dips to zero or below and the ratio runs far past the clay pipeline's 2x
# cap, so each light gets three more numbers, written back into LIGHT.json for the site:
#   floor  the light (SH x AO^k) never drops below this (0.3 x the part's median light)
#   scale  the largest ratio kept (99.8th percentile, at least 2)
#   gamma  the texture stores (ratio / scale) ^ (1 / gamma): dark ratios keep their steps
#   python3 noiralbedo.py PASSDIR LIGHT.json OUTDIR
import sys, json, os
import numpy as np
from PIL import Image
from scipy import ndimage as nd
PD, LJ, OUT = sys.argv[1], sys.argv[2], sys.argv[3]
os.makedirs(OUT, exist_ok=True)
L = json.load(open(LJ))
r8 = np.asarray(Image.open("ref.webp").convert("RGB")).astype(np.float32) / 255
ref = np.where(r8 <= 0.04045, r8 / 12.92, ((r8 + 0.055) / 1.055) ** 2.4)
nrm = np.load(f"{PD}/normal.npy"); R = np.load(f"{PD}/camrot.npy")
n = nrm @ R; n /= np.linalg.norm(n, axis=-1, keepdims=True) + 1e-8
ao = np.load(f"{PD}/ao.npy")[..., 0]
mesh = np.load(f"{PD}/mesh.npy"); names = json.load(open(f"{PD}/meshes.json"))
tile = np.load(f"{PD}/tile.npy")
NEARS = [dict(np.load(f)) for f in sorted(__import__("glob").glob(f"{PD}/near*.npz"))]
GAMMA = 2.2


def sh9(n):
    x, y, z = n[..., 0], n[..., 1], n[..., 2]
    return np.stack([0.282095 * np.ones_like(x), 0.488603 * y, 0.488603 * z, 0.488603 * x,
                     1.092548 * x * y, 1.092548 * y * z, 0.315392 * (3 * z * z - 1), 1.092548 * x * z,
                     0.546274 * (x * x - y * y)], -1)


Y = sh9(n)
PARTS = (("Skin", "skin"), ("Hair", "hair"), ("EyeL", "eye"), ("EyeR", "eye"), ("BrowL", "brow"), ("BrowR", "brow"), ("Hat", "hat"), ("HatBand", "hat"))
raw = lambda key: (Y @ np.array(L[key]["sh"]).T)
# pass 1: each light's floor and scale, over every part that uses it
for key in sorted({k for _, k in PARTS}):
    if key not in L or "sh" not in L[key]:
        continue
    vis = np.isin(mesh, [names.index(nm) for nm, k in PARTS if k == key and nm in names])
    s = np.maximum(raw(key)[vis], 0) * (ao[vis] ** L[key]["k"])[:, None]
    pos = s[s > 0]
    floor = float(0.3 * np.median(pos)) if pos.size else 1e-3
    shade = np.maximum(s, floor)
    ratio = ref[vis] / np.maximum(shade, 1e-6)
    L[key].update(floor=round(floor, 6), scale=round(float(max(2.0, np.percentile(ratio, 99.8))), 3), gamma=GAMMA)
json.dump(L, open(LJ, "w"), indent=1)
rep = {}
for name, key in PARTS:
    if name not in names or key not in L or "sh" not in L[key]:
        continue
    vis = mesh == names.index(name)
    shade = np.maximum(np.maximum(raw(key), 0) * (ao ** L[key]["k"])[..., None], L[key]["floor"])
    layers = (0, 1) if name in ("Skin", "Hair", "Hat") else (0,)
    tiles = []
    for t in layers:
        sel = vis & (tile == t) if len(layers) > 1 else vis
        # one pixel in from the part's edge (edge pixels blend with what is behind), but not
        # from the seam between its two layers: that is one continuous surface in the image,
        # and thin slivers of a layer there would otherwise be filled from far away
        core = sel & nd.binary_erosion(vis, iterations=1) if sel.sum() > 400 else sel
        if core.sum() == 0:
            core = sel if sel.sum() else vis
        ratio = np.ones_like(ref)
        ratio[core] = ref[core] / shade[core]
        # where this layer lies just behind the visible one (nearly touching it), it takes
        # the visible colour over its own light, not the nearest of its own pixels
        for nr in NEARS:
            m = (nr["mesh"] == names.index(name)) & (nr["tile"] == t if len(layers) > 1 else True) & ~core & ~(vis & (tile == t) if len(layers) > 1 else vis)
            if m.any():
                ns = sh9(nr["normal"] @ R)
                ns_shade = np.maximum(np.maximum(ns @ np.array(L[key]["sh"]).T, 0) * (nr["ao"] ** L[key]["k"])[..., None], L[key]["floor"])
                ratio[m] = ref[m] / ns_shade[m]
                core = core | m
        _, (iy, ix) = nd.distance_transform_edt(~core, return_indices=True)
        tiles.append(ratio[iy, ix])
        rep[f"{name}{t}"] = int(core.sum())
    out = np.concatenate(tiles, 1)
    enc = np.clip(out / L[key]["scale"], 0, 1) ** (1 / GAMMA)
    Image.fromarray((enc * 255).round().astype(np.uint8)).save(os.path.join(OUT, f"{name}_ratio.png"))
print(json.dumps(rep), {k: (L[k].get("floor"), L[k].get("scale")) for k in L if isinstance(L[k], dict) and "floor" in L[k]})
