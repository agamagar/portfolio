"""regions.py: load, rasterise and draw the named region polygons used by compare.py.

A regions file is JSON:

    {
      "version": 1,
      "image": "ref_1600.png",            # the reference it was drawn on
      "images": ["ref_1600.png", "ref_800.png"],  # every reference with the same framing
      "size": [1600, 1200],               # pixel size it was drawn at (informational)
      "coords": "normalized",             # x in [0,1] left to right, y in [0,1] top to bottom
      "regions": {
        "glass_clear": {
          "desc": "...",
          "polygons": [[[x, y], [x, y], ...], ...],
          "subtract": ["grille_room"]      # optional: other regions cut out of this one
        },
        ...
      }
    }

Coordinates are normalised so one file serves every resolution of the same framing.
Only numpy, PIL and skimage are used (the loop's dependency budget).
"""
import json
import os

import numpy as np
from PIL import Image, ImageDraw, ImageFont
from skimage.draw import polygon as _fill_polygon

# Okabe-Ito categorical colours (colour-blind safe) plus three Tableau extras for the
# optional regions. Used only as translucent fills and outlines on the overlay; the labels
# never rely on them for contrast (white text with a black stroke, 21:1 either way).
PALETTE = [
    (230, 159, 0),    # orange
    (86, 180, 233),   # sky blue
    (0, 158, 115),    # bluish green
    (240, 228, 66),   # yellow
    (0, 114, 178),    # blue
    (213, 94, 0),     # vermillion
    (204, 121, 167),  # reddish purple
    (255, 105, 97),   # salmon
    (148, 103, 189),  # purple
    (140, 86, 75),    # brown
    (188, 189, 34),   # olive
    (23, 190, 207),   # cyan
]


def load_regions(path):
    with open(path) as f:
        data = json.load(f)
    if data.get("coords", "normalized") != "normalized":
        raise ValueError(f"{path}: only normalized coords are supported")
    return data


def find_regions_for(ref_path):
    """Return the regions JSON in the reference's folder that declares this reference, or None."""
    folder = os.path.dirname(os.path.abspath(ref_path))
    base = os.path.basename(ref_path)
    for name in sorted(os.listdir(folder)):
        if not (name.startswith("regions_") and name.endswith(".json")):
            continue
        p = os.path.join(folder, name)
        try:
            d = load_regions(p)
        except Exception:
            continue
        if base == d.get("image") or base in d.get("images", []):
            return p
    return None


def rasterize(data, width, height):
    """Return {name: bool mask of shape (height, width)} with `subtract` applied."""
    raw = {}
    for name, reg in data["regions"].items():
        m = np.zeros((height, width), bool)
        for poly in reg["polygons"]:
            pts = np.asarray(poly, float)
            rr, cc = _fill_polygon(pts[:, 1] * height, pts[:, 0] * width, shape=(height, width))
            m[rr, cc] = True
        raw[name] = m
    out = {}
    for name, reg in data["regions"].items():
        m = raw[name].copy()
        for other in reg.get("subtract", []):
            if other in raw:
                m &= np.logical_not(raw[other])
        out[name] = m
    return out


def font(size):
    try:
        return ImageFont.load_default(size=size)
    except TypeError:  # Pillow < 10.1 has no sized default font
        return ImageFont.load_default()


def draw_regions(img, data, alpha=0.38, outline=2, labels=True, names=None):
    """Draw translucent region fills, outlines and labels over a PIL image. Returns a new RGB image."""
    base = img.convert("RGB")
    w, h = base.size
    masks = rasterize(data, w, h)
    arr = np.asarray(base).astype(np.float32)
    order = [n for n in data["regions"] if names is None or n in names]
    for i, name in enumerate(order):
        col = np.array(PALETTE[i % len(PALETTE)], np.float32)
        m = masks[name]
        arr[m] = arr[m] * (1 - alpha) + col * alpha
    out = Image.fromarray(np.clip(arr, 0, 255).astype(np.uint8))
    d = ImageDraw.Draw(out)
    f = font(max(11, int(round(h / 70))))
    for i, name in enumerate(order):
        col = tuple(PALETTE[i % len(PALETTE)])
        reg = data["regions"][name]
        best, best_area = None, -1.0
        for poly in reg["polygons"]:
            pts = [(x * w, y * h) for x, y in poly]
            d.line(pts + [pts[0]], fill=col, width=outline)
            xs, ys = [p[0] for p in pts], [p[1] for p in pts]
            area = 0.5 * abs(sum(xs[k] * ys[k - 1] - xs[k - 1] * ys[k] for k in range(len(pts))))
            if area > best_area:
                best, best_area = pts, area
        if labels and best:
            # label at the centre of the largest polygon, in white with a black stroke (21:1)
            cx = sum(p[0] for p in best) / len(best)
            cy = sum(p[1] for p in best) / len(best)
            half = d.textlength(name, font=f) / 2 + 3
            cx = min(max(cx, half), w - half)  # keep the label inside the image
            d.text((cx, cy), name, fill=(255, 255, 255), font=f, anchor="mm",
                   stroke_width=2, stroke_fill=(0, 0, 0))
    return out


def legend(data, width, names=None, row_h=18):
    """A small legend strip listing each region's colour, for the overlay image."""
    order = [n for n in data["regions"] if names is None or n in names]
    cols = 3
    rows = (len(order) + cols - 1) // cols
    img = Image.new("RGB", (width, rows * row_h + 8), (17, 17, 17))
    d = ImageDraw.Draw(img)
    f = font(12)
    cw = width // cols
    for i, name in enumerate(order):
        x = (i % cols) * cw + 8
        y = (i // cols) * row_h + 4
        d.rectangle([x, y + 3, x + 12, y + 15], fill=PALETTE[i % len(PALETTE)])
        # #ffffff on #111111 measures 18.9:1.
        d.text((x + 18, y + 2), name, fill=(255, 255, 255), font=f)
    return img
