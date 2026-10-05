#!/usr/bin/env python3
"""sheet.py: tile renders into one labelled contact sheet (time-of-day and weather sweeps).

    python3 tools/window-light/sheet.py OUT.png IMG [IMG ...] [--cols N] [--tile W]
                                        [--labels "a|b|c"] [--title TEXT] [--caption url|name|none]

Each tile is resized to W px wide (default 480) and letterboxed to the tallest tile in its row.
Under each tile: line 1 is the label (from --labels, else the file name); line 2 is a caption
taken from the render's sidecar .json written by render.mjs: the url's query string (the default,
so a sweep shows its tod/wx/look) plus the scene backend and console error count when present.
A compare.py result JSON beside the PNG (NAME.vs-*.json) adds its composite score to line 2.
Dependencies: PIL only.
"""
import argparse
import glob
import json
import math
import os
from urllib.parse import urlparse

from PIL import Image, ImageDraw, ImageFont

# Background #111111. Label text #ffffff measures 18.9:1 against it, caption text #b8b8b8
# measures 9.5:1, the title #ffffff 18.9:1 (WCAG relative luminance, sRGB).
BG, INK, SUB = (17, 17, 17), (255, 255, 255), (184, 184, 184)


def font(size):
    try:
        return ImageFont.load_default(size=size)
    except TypeError:
        return ImageFont.load_default()


def sidecar_caption(path, mode):
    if mode == "none":
        return ""
    stem = os.path.splitext(path)[0]
    parts = []
    side = stem + ".json"
    if mode == "url" and os.path.exists(side):
        try:
            d = json.load(open(side))
            u = urlparse(d.get("url", ""))
            parts.append((u.path + ("?" + u.query if u.query else "")) or d.get("url", ""))
            sc = d.get("scene") or {}
            if sc.get("present"):
                parts.append(f"{(sc.get('stats') or {}).get('backend', '?')}")
            errs = (d.get("console") or {}).get("errors")
            if errs:
                parts.append(f"{errs} console errors")
            if d.get("status") and d["status"] != "ok":
                parts.append(d["status"].upper())
        except Exception:
            pass
    elif mode == "name":
        parts.append(os.path.basename(path))
    for cj in sorted(glob.glob(stem + ".vs-*.json")):
        try:
            parts.append(f"score {json.load(open(cj))['composite']:.1f}")
            break
        except Exception:
            pass
    return "  ".join(parts)


def fit_text(d, text, f, width):
    if d.textlength(text, font=f) <= width:
        return text
    while text and d.textlength(text + "...", font=f) > width:
        text = text[:-1]
    return text + "..."


def main():
    ap = argparse.ArgumentParser(description="Tile renders into a labelled contact sheet.")
    ap.add_argument("out")
    ap.add_argument("images", nargs="+")
    ap.add_argument("--cols", type=int, default=0, help="columns (default: ceil(sqrt(N)))")
    ap.add_argument("--tile", type=int, default=480, help="tile width in px")
    ap.add_argument("--labels", help="labels separated by |, one per image")
    ap.add_argument("--title", default="")
    ap.add_argument("--caption", choices=["url", "name", "none"], default="url")
    a = ap.parse_args()

    paths = a.images
    labels = a.labels.split("|") if a.labels else [os.path.splitext(os.path.basename(p))[0] for p in paths]
    if len(labels) != len(paths):
        ap.error(f"{len(labels)} labels for {len(paths)} images")
    n = len(paths)
    cols = a.cols or math.ceil(math.sqrt(n))
    rows = math.ceil(n / cols)
    tw, gap, lab_h = a.tile, 8, 40
    tiles = []
    for p in paths:
        im = Image.open(p).convert("RGB")
        th = max(1, round(tw * im.height / im.width))
        tiles.append(im.resize((tw, th), Image.LANCZOS))
    row_h = [max(t.height for t in tiles[r * cols:(r + 1) * cols]) for r in range(rows)]
    title_h = 34 if a.title else 0
    W = cols * tw + (cols + 1) * gap
    H = title_h + sum(row_h) + rows * (lab_h + gap) + gap
    sheet = Image.new("RGB", (W, H), BG)
    d = ImageDraw.Draw(sheet)
    fl, fc, ft = font(14), font(11), font(18)
    if a.title:
        d.text((gap, 8), a.title, fill=INK, font=ft)
    y = title_h + gap
    for r in range(rows):
        for c in range(cols):
            i = r * cols + c
            if i >= n:
                break
            x = gap + c * (tw + gap)
            t = tiles[i]
            sheet.paste(t, (x, y + (row_h[r] - t.height) // 2))
            ly = y + row_h[r] + 4
            d.text((x, ly), fit_text(d, labels[i], fl, tw), fill=INK, font=fl)
            cap = sidecar_caption(paths[i], a.caption)
            if cap:
                d.text((x, ly + 19), fit_text(d, cap, fc, tw), fill=SUB, font=fc)
        y += row_h[r] + lab_h + gap
    os.makedirs(os.path.dirname(os.path.abspath(a.out)), exist_ok=True)
    sheet.save(a.out)
    print(f"{n} tiles, {cols}x{rows}, {W}x{H} -> {a.out}")


if __name__ == "__main__":
    main()
