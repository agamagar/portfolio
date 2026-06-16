#!/usr/bin/env python3
"""Composite the exact Away landing screen into the exact iPhone 17 Pro bezel.

Bezel = Figma node 6353:335497 ("Bezel", iPhone 17 Pro / Silver), exported at
scale 4 (1036x2118). Screen = the exact landing render. Regenerates
public/figures/awayLanding-iphone.png. Re-run after either source changes:

    python3 tools/figma-fidelity/compose-iphone.py
"""
import os
import numpy as np
from PIL import Image, ImageDraw

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
bezel = os.path.join(ROOT, "src/figures/source/awayLanding/iphone17pro-bezel.png")
screen = os.path.join(ROOT, "public/figures/awayLanding-screen.png")
out_path = os.path.join(ROOT, "public/figures/awayLanding-iphone.png")

# Screen window inside the 1036x2118 bezel, measured from the export:
# ~41px bezel inset all round, ~120px screen-corner radius.
L, T, SW, SH = 42, 45, 953, 2033

bez = Image.open(bezel).convert("RGBA")
assert bez.size == (1036, 2118), f"bezel must be the scale-4 export (1036x2118), got {bez.size}"
scr = Image.open(screen).convert("RGBA").resize((SW, SH), Image.LANCZOS)
out = bez.copy()
out.alpha_composite(scr, (L, T))  # screen's own rounded-transparent corners blend into the bezel black

# Knock out the flat (16,16,16) rectangle the bezel was exported on so the phone
# floats on a transparent background. Border-seed a flood that lifts the uniform
# dark surround and stops at the metal frame (~42+). The frame has a few dim
# spots the flood can slip through into the dark screen, so paint a rounded-rect
# barrier over the screen window first (flood source only — output untouched);
# that guarantees the flood can only ever reach the true outside of the phone.
SENTINEL = (255, 0, 255)  # marks the flooded surround
BARRIER = (0, 255, 0)  # blocks the flood from leaking past the screen; kept opaque
rgb = out.convert("RGB")
pad = 18  # reach into the black inner bezel so corners can't leak around the screen
ImageDraw.Draw(rgb).rounded_rectangle(
    [L - pad, T - pad, L + SW - 1 + pad, T + SH - 1 + pad], radius=135, fill=BARRIER
)
ImageDraw.floodfill(rgb, (0, 0), SENTINEL, thresh=40)
bg = np.all(np.asarray(rgb) == SENTINEL, axis=-1)  # exactly the flooded surround
arr = np.asarray(out).copy()
arr[bg, 3] = 0  # clear alpha there; phone, frame and screen stay untouched
Image.fromarray(arr, "RGBA").save(out_path)
print("wrote", os.path.relpath(out_path, ROOT), out.size)
