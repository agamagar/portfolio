#!/usr/bin/env python3
"""Bake the screen's 56px-at-360 corner radius into the Away landing figure.

Takes the flat Figma screen export (square corners) and masks it to a rounded
rectangle whose radius equals 56px when the frame is 360px wide, writing the
corners out as transparent. The portfolio `.fig-screen` img then carries its own
rounded shape, so its drop-shadow follows the corners instead of a hard box.
Re-run after the screen export changes:

    python3 tools/figma-fidelity/round-screen.py
"""
import os
from PIL import Image, ImageDraw

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
src_path = os.path.join(ROOT, "public/figures/awayLanding-screen.png")
out_path = os.path.join(ROOT, "public/figures/awayLanding-rounded.png")

src = Image.open(src_path).convert("RGBA")
w, h = src.size
radius = round(56 * w / 360)  # 56px corner at the 360px design width

mask = Image.new("L", (w, h), 0)
ImageDraw.Draw(mask).rounded_rectangle([0, 0, w - 1, h - 1], radius=radius, fill=255)
out = Image.new("RGBA", (w, h), (0, 0, 0, 0))
out.paste(src, (0, 0), mask)  # keep the screen inside the rounded rect; corners go transparent
out.save(out_path)
print("wrote", os.path.relpath(out_path, ROOT), out.size, "radius", radius)
