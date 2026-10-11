import sys, os
from PIL import Image, ImageChops
import numpy as np
a, b = sys.argv[1], sys.argv[2]
bad = 0
for f in sorted(os.listdir(a)):
    if not os.path.exists(os.path.join(b, f)): print("missing", f); continue
    x = Image.open(os.path.join(a, f)).convert("RGB"); y = Image.open(os.path.join(b, f)).convert("RGB")
    if x.size != y.size: print(f, "size differs"); bad += 1; continue
    d = np.asarray(ImageChops.difference(x, y)).max(axis=2)
    frac = (d > 24).mean() * 100
    if frac > 0.05: print(f"{f}: {frac:.2f}% pixels differ"); bad += 1
print("compared", len(os.listdir(a)), "shots,", bad, "differ")
