#!/usr/bin/env python3
"""derive_regions_1741.py: rebuild ref/regions_1741.json and ref/regions_1741_overlay.png.

How the polygons were derived (all coordinates below are pixels of ref_1600.png, 1600 x 1200;
the JSON stores them normalised). Anchors come from spec/13-photo-inventory.md section 3
(full-res 5712 px coordinates, scaled by 1600/5712) and were then measured on the image:

* Glass panes: thresholded inside a box per pane (luma above a floor), small holes filled,
  eroded by 3 px so a 1 to 2 px misalignment of the render never mixes frame into glass,
  then traced and simplified to a polygon. The room-side grille bars fall out automatically
  because they are dark.
* Room-side grille bars: each bar's centre was tracked down the frame in 20 px bands and a
  line fitted (residual about 1 px). All bars agree on one vertical vanishing point near
  (686, -8322), which is the photo's pitch of +5.7 deg and roll of -0.7 deg, so they are
  slanted quads, not boxes. Each quad is the bar's inner half width.
* Frame wood, rails, casing: edges from luminance profiles, inset 4 px, leaning with the
  same vertical vanishing point.
* Monitor: the screen's right edge was measured on 4 rows (it leans right going down, the
  panel is tilted back); the left edge is not measurable against the dark sidebar, so the
  polygon stays 14 px inside it. Bezel strips from the top-edge and right-edge profiles.
* Lamp: dark pixels (luma under 60) in the lamp's box, largest component, eroded 3 px.

Run:  python3 tools/window-light/derive_regions_1741.py
Then LOOK at ref/regions_1741_overlay.png before trusting a change.
"""
import json
import os
import sys

import numpy as np
from PIL import Image
from skimage.measure import approximate_polygon, find_contours, label
from skimage.morphology import binary_dilation, binary_erosion, binary_opening, disk, remove_small_holes

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
from regions import draw_regions, legend  # noqa: E402

REF = os.path.join(HERE, "ref", "ref_1600.png")
OUT_JSON = os.path.join(HERE, "ref", "regions_1741.json")
OUT_PNG = os.path.join(HERE, "ref", "regions_1741_overlay.png")

img = Image.open(REF).convert("RGB")
W, H = img.size
assert (W, H) == (1600, 1200), "measurements below are in ref_1600 pixels"
rgb = np.asarray(img).astype(np.float32)
luma = 0.2126 * rgb[..., 0] + 0.7152 * rgb[..., 1] + 0.0722 * rgb[..., 2]

# Vertical vanishing point (fitted from the bar tracks, see docstring).
VX, VY = 686.0, -8322.0


def lean_x(x_at, y_at, y):
    """x of the vertical through (x_at, y_at), evaluated at row y."""
    return VX + (x_at - VX) * (y - VY) / (y_at - VY)


def vquad(x_left, x_right, y_ref, y0, y1):
    """A quad between two verticals given by their x at y_ref, from row y0 to row y1."""
    return [
        (lean_x(x_left, y_ref, y0), y0), (lean_x(x_right, y_ref, y0), y0),
        (lean_x(x_right, y_ref, y1), y1), (lean_x(x_left, y_ref, y1), y1),
    ]


def bar(a, b, half, y0, y1):
    """A slanted bar whose centre follows x = a + b * y (fitted line), inner half width `half`."""
    return [(a + b * y0 - half, y0), (a + b * y0 + half, y0), (a + b * y1 + half, y1), (a + b * y1 - half, y1)]


def hrail(x0, x1, top_at, bot_at, x_ref, slope):
    """A quad between two sloped horizontals (rails), y = top/bot + slope * (x - x_ref)."""
    return [
        (x0, top_at + slope * (x0 - x_ref)), (x1, top_at + slope * (x1 - x_ref)),
        (x1, bot_at + slope * (x1 - x_ref)), (x0, bot_at + slope * (x0 - x_ref)),
    ]


def traced(box, test, erode=3, min_area=250, tol=1.2, largest_only=False):
    """Threshold inside box, fill holes, erode, trace each component to a simplified polygon."""
    x0, y0, x1, y1 = box
    sub = test(rgb[y0:y1, x0:x1], luma[y0:y1, x0:x1])
    sub = remove_small_holes(sub, area_threshold=400)
    if erode:
        sub = binary_erosion(sub, disk(erode))
    lab = label(sub)
    comps = []
    for k in range(1, lab.max() + 1):
        m = lab == k
        if m.sum() >= min_area:
            comps.append(m)
    if largest_only and comps:
        comps = [max(comps, key=lambda m: m.sum())]
    polys = []
    for m in comps:
        padded = np.pad(m, 1)
        cs = find_contours(padded.astype(float), 0.5)
        c = max(cs, key=len)
        c = approximate_polygon(c, tolerance=tol)
        polys.append([(x0 + p[1] - 1, y0 + p[0] - 1) for p in c[:-1]])
    return polys


bright = lambda thr: (lambda c, l: l > thr)  # noqa: E731
dark = lambda thr: (lambda c, l: l < thr)  # noqa: E731

regions = {}

# Room-side grille (black iron bars in front of the leaves). Fitted lines, inner half widths.
grille = [
    bar(836.3, 0.0181, 3.5, 2, 772),    # bar over L1 row A to C (13 px wide)
    bar(1316.0, 0.0754, 5.0, 28, 525),  # bar across R1 (18 to 19 px wide), lamp hides it below
    bar(1441.3, 0.0908, 4.0, 28, 500),  # bar at the R1 / R2 boundary (14 px wide)
    # upper tie bar across the L pair: centre y 37 at x 885, 29 at x 1022; about 18 px tall
    hrail(806, 1078, 37 - 5, 37 + 5, 885, -0.0584),
]
regions["grille_room"] = {
    "desc": "black iron bars on the room side: the bar over L1, the bar across R1, the bar at "
            "R1/R2 and the upper tie bar. Inner half width of each bar.",
    "polygons": grille,
}

# Left pair, rows A and C: sky above, foliage below (not clipped).
clear = []
for box, thr in [((800, 42, 934, 206), 120), ((968, 36, 1082, 216), 120),
                 ((800, 564, 944, 778), 110), ((972, 566, 1096, 778), 110)]:
    clear += traced(box, bright(thr))
regions["glass_clear"] = {
    "desc": "sky (row A) and trees (row C) through the left French pair L1 and L2",
    "polygons": clear,
    "subtract": ["grille_room"],
}

# Left pair, row B: gold-lit cumulus, 16 to 25 percent of pixels clipped (max channel >= 250).
brightp = []
for box in [(800, 244, 942, 530), (968, 246, 1094, 532)]:
    brightp += traced(box, bright(120))
regions["glass_bright"] = {
    "desc": "the blown golden panes: row B of L1 and L2 (sunlit cumulus, 16 to 25 percent clipped)",
    "polygons": brightp,
    "subtract": ["grille_room"],
}

# Frame wood: casing, L1 outer stile, L2 hinge stile and mullion zone, rails A/B and B/C.
wood = [
    vquad(632, 710, 400, 50, 760),          # fixed casing left of L1 (backlit, glare-veiled)
    vquad(736, 799, 400, 50, 760),          # L1 outer (hinge-side) stile
    vquad(1120, 1225, 400, 50, 520),        # L2 hinge stile + mullion zone (dark, unlit at 17:41)
    hrail(851, 927, 208, 245, 890, 0.048),  # rail A/B under L1
    hrail(977, 1078, 214, 251, 1025, 0.048),  # rail A/B under L2
    hrail(851, 935, 530, 566, 890, 0.0),    # rail B/C under L1
    hrail(979, 1085, 531, 567, 1025, 0.0),  # rail B/C under L2
]
regions["frame_wood"] = {
    "desc": "dark brown enamel frame: casing, L1 outer stile, L2 hinge stile and mullion zone, "
            "rails between rows (lamp-lit R1 stile is separate: wood_lamp_glow)",
    "polygons": wood,
    "subtract": ["grille_room"],
}

def lamp_mask(c, l):
    """Dark core (luma < 60), opened with a 9 px disk so the thin bar and stile above the dome
    fall away, then grown 7 px into pixels under luma 115 to take back the sky-lit rim."""
    core = binary_opening(l < 60, disk(9))
    lab = label(core)
    if lab.max() == 0:
        return core
    sizes = np.bincount(lab.ravel())
    sizes[0] = 0
    core = lab == sizes.argmax()
    return core | (binary_dilation(core, disk(7)) & (l < 115))


regions["lamp"] = {
    "desc": "black dome shade, socket cup and the arm stub (dark silhouette against the glass)",
    "polygons": traced((1285, 553, 1600, 772), lamp_mask, erode=3, min_area=2000, tol=1.5,
                       largest_only=True),
}

# Monitor. Right screen edge measured: x = 1553 + 0.072 * (y - 860).
edge = lambda y: 1553 + 0.072 * (y - 860)  # noqa: E731
regions["monitor_screen"] = {
    "desc": "the main monitor's screen: Claude app (dark, left) and the portfolio page (white, right), "
            "menu bar included",
    "polygons": [[(450, 800), (edge(800) - 5, 800), (edge(1196) - 5, 1196), (450, 1196)]],
}
regions["monitor_bezel"] = {
    "desc": "thin black bezel: top strip, right strip, upper part of the left strip",
    "polygons": [
        [(430, 785), (1560, 785), (1560, 793), (430, 793)],
        [(edge(830) + 5, 830), (edge(830) + 14, 830), (edge(1196) + 14, 1196), (edge(1196) + 5, 1196)],
        [(423, 800), (432, 800), (432, 900), (423, 900)],
    ],
}

regions["wall_left"] = {
    "desc": "cream wall left of the casing, near black at 17:41 with a glare gradient toward the window",
    "polygons": [[(0, 0), (600, 0), (600, 760), (360, 760), (360, 615), (0, 615)]],
}
regions["dark_object_bottom_left"] = {
    "desc": "the portrait monitor, switched off (black glossy face)",
    "polygons": [[(0, 648), (318, 650), (314, 1196), (0, 1196)]],
}

# Optional regions (not in the original list, useful for tuning).
right = []
for box in [(1228, 18, 1394, 198), (1238, 220, 1422, 524)]:
    right += traced(box, bright(100))
regions["glass_right"] = {
    "desc": "OPTIONAL. The handle leaf R1, rows A and B: grey-green crown, sunlit cream building, red-orange patch",
    "polygons": right,
    "subtract": ["grille_room"],
}
grey = []
for box in [(1462, 12, 1582, 168), (1488, 208, 1598, 498)]:
    grey += traced(box, bright(80))
regions["glass_grey"] = {
    "desc": "OPTIONAL. R2, the far-right column: grey dust stipple over something dark behind the glass",
    "polygons": grey,
}
regions["wood_lamp_glow"] = {
    "desc": "OPTIONAL. R1's left stile in the lamp's glow below rail B/C (the one lamp cue at 17:41, about 3050 K)",
    "polygons": [[(1245, 590), (1257, 590), (1261, 745), (1249, 745)]],
}


def norm(poly):
    return [[round(x / W, 5), round(y / H, 5)] for x, y in poly]


data = {
    "version": 1,
    "image": "ref_1600.png",
    "images": ["ref_1600.png", "ref_800.png"],
    "size": [W, H],
    "coords": "normalized",
    "source": "derive_regions_1741.py (measured on ref_1600.png; anchors from spec/13-photo-inventory.md section 3)",
    "regions": {},
}
for name, reg in regions.items():
    out = {"desc": reg["desc"], "polygons": [norm(p) for p in reg["polygons"]]}
    if reg.get("subtract"):
        out["subtract"] = reg["subtract"]
    data["regions"][name] = out

with open(OUT_JSON, "w") as f:
    json.dump(data, f, indent=1)

ov = draw_regions(img, data)
leg = legend(data, W)
canvas = Image.new("RGB", (W, H + leg.height), (17, 17, 17))
canvas.paste(ov, (0, 0))
canvas.paste(leg, (0, H))
canvas.save(OUT_PNG)

from regions import rasterize  # noqa: E402
masks = rasterize(data, W, H)
for name, m in masks.items():
    px = rgb[m]
    print(f"{name:24s} polys {len(data['regions'][name]['polygons']):2d}  px {int(m.sum()):7d}  "
          f"mean sRGB {px.mean(0).round(0) if len(px) else '-'}")
print("wrote", OUT_JSON)
print("wrote", OUT_PNG)
