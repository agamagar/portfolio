# The shader, run on the ray passes: what the site should draw at rest, given the textures.
#   python3 simulate.py RUN   -> RUN/sim.png and how far it is from the tile and from the site render
import sys, json
import numpy as np
from PIL import Image
D = sys.argv[1]; PD = f"{D}/passes"
L = json.load(open(f"{D}/light.json"))
mesh = np.load(f"{PD}/mesh.npy"); names = json.load(open(f"{PD}/meshes.json")); uv = np.load(f"{PD}/uv.npy")
n = np.load(f"{PD}/normal.npy") @ np.load(f"{PD}/camrot.npy"); n /= np.linalg.norm(n, axis=-1, keepdims=True) + 1e-8
ao = np.load(f"{PD}/ao.npy")[..., 0]
x, y, z = n[..., 0], n[..., 1], n[..., 2]
Y = np.stack([0.282095 * np.ones_like(x), 0.488603 * y, 0.488603 * z, 0.488603 * x, 1.092548 * x * y, 1.092548 * y * z, 0.315392 * (3 * z * z - 1), 1.092548 * x * z, 0.546274 * (x * x - y * y)], -1)
KEY = {"Skin": "skin", "Hair": "hair", "EyeL": "eye", "EyeR": "eye", "BrowL": "brow", "BrowR": "brow", "Hat": "hat", "HatBand": "hat"}
out = np.zeros(mesh.shape + (3,))
for k, nm in enumerate(names):
    m = mesh == k
    if nm not in KEY or not m.any():
        continue
    Lk = L[KEY[nm]]
    tex = np.asarray(Image.open(f"{D}/tex/{nm}_ratio.png").convert("RGB")).astype(float) / 255
    th, tw = tex.shape[:2]
    u, v = uv[m, 0], uv[m, 1]
    px = np.clip((u * tw).astype(int), 0, tw - 1); py = np.clip(((1 - v) * th).astype(int), 0, th - 1)
    ratio = tex[py, px] ** Lk.get("gamma", 1) * Lk.get("scale", 2)
    light = np.maximum(np.maximum(Y[m] @ np.array(Lk["sh"]).T, 0) * (ao[m] ** Lk["k"])[:, None], Lk.get("floor", 0))
    out[m] = light * ratio
srgb = lambda c: np.where(c <= 0.0031308, c * 12.92, 1.055 * np.clip(c, 0, None) ** (1 / 2.4) - 0.055)
sim = (np.clip(srgb(out), 0, 1) * 255).round()
ref = np.asarray(Image.open("ref.webp").convert("RGB")).astype(float)
site = np.asarray(Image.open(f"{D}/site_diff.png").convert("RGB")).astype(float)[:, 802:1604]
P = np.load("ref_parts_full.npy"); hd = (P >= 1) & (P <= 5) & (mesh >= 0)
for k, nm in enumerate(names):
    m = hd & (mesh == k)
    if m.sum() > 50:
        print(nm, "sim-vs-tile", round(float(np.abs(sim - ref).mean(-1)[m].mean()), 2), "site-vs-sim", round(float(np.abs(site - sim).mean(-1)[m].mean()), 2), "site-vs-tile", round(float(np.abs(site - ref).mean(-1)[m].mean()), 2))
Image.fromarray(sim.astype(np.uint8)).save(f"{D}/sim.png")
