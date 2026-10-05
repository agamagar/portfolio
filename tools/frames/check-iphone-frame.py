#!/usr/bin/env python3
"""Solid check for the site's iPhone frame (annotation mtmrb33g).

Measures the screen cutout of public/figures/frames/iphone-17-pro.png from its
alpha channel (the transparent run through the centre, out to the ring's fully
opaque edge) and compares it with every CSS block marked
`/* iphone-frame-screen */` that places a screen inside the frame.
Exit 1 on drift, so it can gate a build.

  python3 tools/frames/check-iphone-frame.py           # check
  python3 tools/frames/check-iphone-frame.py --print   # also print the box
"""
import re, sys
from PIL import Image

FRAME = "public/figures/frames/iphone-17-pro.png"
CSS = ["src/index.css"]
OPAQUE = 250   # alpha at which the ring counts as solid
TOL = 0.12     # percent points of drift allowed

im = Image.open(FRAME).convert("RGBA"); w, h = im.size; a = im.getchannel("A").load()
cx, cy = w // 2, h // 2
if a[cx, cy] >= OPAQUE:
    print("FAIL centre is opaque: not a frame with a cutout"); sys.exit(1)
x0 = cx
while x0 > 0 and a[x0 - 1, cy] < OPAQUE: x0 -= 1
x1 = cx
while x1 < w - 1 and a[x1 + 1, cy] < OPAQUE: x1 += 1
y0 = cy
while y0 > 0 and a[cx, y0 - 1] < OPAQUE: y0 -= 1
y1 = cy
while y1 < h - 1 and a[cx, y1 + 1] < OPAQUE: y1 += 1
box = {"left": 100 * x0 / w, "top": 100 * y0 / h, "width": 100 * (x1 - x0 + 1) / w, "height": 100 * (y1 - y0 + 1) / h}
if "--print" in sys.argv:
    print(f"frame {w}x{h}, screen cutout to the solid ring: left {box['left']:.2f}% top {box['top']:.2f}% width {box['width']:.2f}% height {box['height']:.2f}%")
fails = 0
pat = re.compile(r"/\* iphone-frame-screen \*/[\s\S]*?left:\s*([\d.]+)%;[\s\S]*?top:\s*([\d.]+)%;[\s\S]*?width:\s*([\d.]+)%;[\s\S]*?height:\s*([\d.]+)%;")
for f in CSS:
    css = open(f).read(); n = 0
    for m in pat.finditer(css):
        n += 1; got = dict(zip(("left", "top", "width", "height"), map(float, m.groups())))
        for k, v in box.items():
            d = abs(got[k] - v)
            if d > TOL:
                fails += 1; print(f"FAIL {f} block {n}: {k} is {got[k]:.2f}%, frame says {v:.2f}% (drift {d:.2f})")
    if n == 0:
        fails += 1; print(f"FAIL {f}: no /* iphone-frame-screen */ blocks found")
    else:
        print(f"ok    {f}: {n} screen block(s) within {TOL}% of the frame")
sys.exit(1 if fails else 0)
