# seen.py FIT.json IDMAP.png REF.png [--write] : what the reference shows of each part, for the
# surface a turn reveals. Writes fit.json "seen": {part: {"rad": the median of the reference's own
# pixels on that part (linear RGB), "lum": the luminance of the part's fitted light averaged over
# the normals a camera-facing surface shows (cosine-weighted)}}. The shader paints revealed
# surface in that colour, shaded by the view light's brightness over that mean: the fitted
# light's hue swings with direction (a backdrop's bounce; the hair's own colour folded into its
# light), so ratio x light read off at a new normal tinted a turned head orange (claySun) or red
# (felt). REF.png is the tile at 802 x 862 (ref.webp in a fit folder).
import sys, json
import numpy as np
from PIL import Image
fitp, idp, refp = sys.argv[1:4]
fit = json.load(open(fitp))
ids = np.asarray(Image.open(idp))
ids = ids[..., 0] if ids.ndim == 3 else ids
ref = np.asarray(Image.open(refp).convert("RGB").resize((ids.shape[1], ids.shape[0]), Image.LANCZOS)).astype(np.float64) / 255
lin = np.where(ref <= 0.04045, ref / 12.92, ((ref + 0.055) / 1.055) ** 2.4)

def sh9(n):
    x, y, z = n[..., 0], n[..., 1], n[..., 2]
    return np.stack([0.282095 * np.ones_like(x), 0.488603 * y, 0.488603 * z, 0.488603 * x, 1.092548 * x * y, 1.092548 * y * z,
                     0.315392 * (3 * z * z - 1), 1.092548 * x * z, 0.546274 * (x * x - y * y)], -1)
rng = np.random.default_rng(1)
u1, u2 = rng.random(4000), rng.random(4000)
hemi = np.stack([np.sqrt(u1) * np.cos(2 * np.pi * u2), np.sqrt(u1) * np.sin(2 * np.pi * u2), np.sqrt(1 - u1)], -1)
PART = lambda n: "hair" if n == "Hair" else "brow" if n.startswith("Brow") else "eye" if n.startswith("Eye") else "mouth" if n == "Mouth" else "skin"
seen = {}
for i, name in enumerate(fit["ids"]):
    m = (ids == 2 * i + 1) | (ids == 2 * i + 2)
    if m.sum() < 50:
        continue
    L = fit["light"].get(PART(name)) or fit["light"]["skin"]
    hem = np.maximum(np.maximum(sh9(hemi) @ np.array(L["sh"]).T, 0).mean(0), L.get("floor", 0.03))
    seen[name] = {"rad": [float(v) for v in np.median(lin[m], 0)], "lum": float(hem @ [0.2126, 0.7152, 0.0722])}
    print(name, int(m.sum()), "px, seen sRGB", (ref[m].mean(0) * 255).round().astype(int).tolist(), "lum", round(seen[name]["lum"], 4))
if "--write" in sys.argv:
    fit["seen"] = seen
    json.dump(fit, open(fitp, "w"), indent=1)
    print("WROTE", fitp)
