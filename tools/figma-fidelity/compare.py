#!/usr/bin/env python3
"""Compare a rebuilt figure render against its Figma reference.

Usage: compare.py <ref.png> <mine.png> <out_compare.png> <name>
Prints a one-line JSON report and writes a side-by-side composite
(reference | rebuild | difference heatmap).
"""
import sys
import json
from PIL import Image, ImageDraw
import numpy as np

ref_path, mine_path, out_path, name = sys.argv[1:5]

ref = Image.open(ref_path).convert("RGB")
mine = Image.open(mine_path).convert("RGB")
if mine.size != ref.size:
    mine = mine.resize(ref.size, Image.LANCZOS)

W, H = ref.size
a = np.asarray(ref, dtype=np.float32)
b = np.asarray(mine, dtype=np.float32)
diff = np.abs(a - b)
per_pixel = diff.mean(axis=2)  # 0..255 mean abs diff per pixel

mae = float(diff.mean())
rmse = float(np.sqrt((diff ** 2).mean()))
THR = 18.0  # per-pixel intensity delta that counts as a real visual difference
pct_diff = float((per_pixel > THR).mean() * 100.0)
fidelity = round(max(0.0, 100.0 * (1.0 - mae / 255.0)), 2)

if pct_diff <= 6:
    verdict = "PASS"
elif pct_diff <= 18:
    verdict = "WARN"
else:
    verdict = "FAIL"

# difference heatmap: bright red where the rebuild diverges from Figma
norm = np.clip(per_pixel / max(THR * 2.0, per_pixel.max() or 1.0), 0, 1)
heat = np.zeros((H, W, 3), dtype=np.uint8)
heat[..., 0] = (norm * 255).astype(np.uint8)        # red
heat[..., 2] = ((1 - norm) * 40).astype(np.uint8)   # faint blue floor
heat_img = Image.fromarray(heat, "RGB")

gap = 16
label_h = 22
comp = Image.new("RGB", (W * 3 + gap * 2, H + label_h), "#101015")
comp.paste(ref, (0, label_h))
comp.paste(mine, (W + gap, label_h))
comp.paste(heat_img, (W * 2 + gap * 2, label_h))
draw = ImageDraw.Draw(comp)
for i, t in enumerate(["FIGMA (reference)", "REBUILD", "DIFF heatmap"]):
    draw.text((i * (W + gap) + 4, 6), t, fill="#C9CDD6")
comp.save(out_path)

print(json.dumps({
    "name": name,
    "verdict": verdict,
    "fidelity": fidelity,
    "pct_pixels_diff": round(pct_diff, 2),
    "mae": round(mae, 2),
    "rmse": round(rmse, 2),
    "size": [W, H],
    "compare_png": out_path,
}))
