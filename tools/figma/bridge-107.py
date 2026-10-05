#!/usr/bin/env python3
"""Bridge Figma frame 315:29335 ("107", the Before-we-start slide) into the site.

Agam drafts this slide's copy straight in Figma, and the site renders it as PNG
exports of the frame's text layers (it is set in Stack Sans Headline, which the
site does not load). Every rewrite therefore needs the exports re-pulled AND
re-placed, because the line count changes each block's height and bounds - and
sometimes the layer COUNT changes too (14 Sep: a third line appeared).

So nothing here is hardcoded to two layers. It:
  1. reads the frame and finds every TEXT layer, in reading order
  2. exports each at 2x into public/figures/scheduled/dup/, named by node id
  3. places each as a % of the frame from its RENDER bounds (not the bounding
     box - the scene's coordinates are render bounds)
  4. stacks the same layers for the phone, sizing the box so the margins and
     the gaps hold whatever the line count is
  5. rewrites both layer arrays in src/App.jsx, between the <bridge-107> markers

Run: python3 tools/figma/bridge-107.py [--dry]
"""
import json, os, re, subprocess, sys, urllib.request

# REPOINTED 16 Sep 2026. This slide used to be bridged out of Portfolio 2026
# (dUwMRorsFMXh9G6wlHOh5B, frame 315:29335), but Agam has moved his drafting to
# the rebuild file and left a Dev Mode note on ITS copy of the frame reading
# "update this on dev". The two had already diverged - the old file still says
# "Users abandon checkout because they didn't want instant delivery" while the
# new one asks "When did you last order something, you didn't need delivered in
# 10 mins?" - so the new file is the owner now. Node ids are discovered, not
# listed, so nothing else here had to change.
FILE = "HBBgHT1u7e5jsz7BEEZ3fT"
FRAME = "3:2703"
HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.normpath(os.path.join(HERE, "..", ".."))
DUP = os.path.join(ROOT, "public", "figures", "scheduled", "dup")
APP = os.path.join(ROOT, "src", "App.jsx")
DRY = "--dry" in sys.argv

# the phone scene's rules. The label (the left column) reads at 42% of the
# width, every other line at 84%; the box holds these margins and this gap
# between lines whatever the line count turns out to be.
PHONE_W, LABEL_PCT, LINE_PCT = 375, 42.0, 84.0
TOP_PCT, BOTTOM_PCT, GAP_PX = 12.8, 13.2, 12.5

PAT = subprocess.run(["security", "find-generic-password", "-s", "figma-pat-zep", "-w"],
                     capture_output=True, text=True).stdout.strip()


def api(url):
    req = urllib.request.Request(url, headers={"X-Figma-Token": PAT})
    with urllib.request.urlopen(req, timeout=150) as r:
        return json.load(r)


d = api(f"https://api.figma.com/v1/files/{FILE}/nodes?ids={FRAME}")
root = d["nodes"][FRAME]["document"]
fb = root["absoluteBoundingBox"]

layers = []


def walk(n):
    if n.get("type") == "TEXT" and n.get("visible", True):
        rb = n.get("absoluteRenderBounds") or n["absoluteBoundingBox"]
        if rb and rb["width"] > 0:
            layers.append({
                "id": n["id"],
                "chars": n.get("characters", ""),
                "x": (rb["x"] - fb["x"]) / fb["width"] * 100,
                "y": (rb["y"] - fb["y"]) / fb["height"] * 100,
                "w": rb["width"] / fb["width"] * 100,
                "ar": rb["width"] / rb["height"],
            })
    for c in n.get("children", []):
        walk(c)


walk(root)
if not layers:
    sys.exit(f"no visible text layers in {FRAME}")
# reading order: down the page, then across
layers.sort(key=lambda l: (round(l["y"], 1), l["x"]))
for l in layers:
    l["file"] = l["id"].replace(":", "-") + ".png"
    print(f'{l["id"]:>14}  x {l["x"]:6.2f} y {l["y"]:6.2f} w {l["w"]:6.2f}  "{l["chars"]}"')

# The phone stack. Order is NOT the desktop reading order: the two columns are
# centred independently, so the label sits LOWER than the first line of the
# right column and a plain y-sort would stack it into the middle. The label
# leads on a phone, then the column in its own order.
# WHAT MAKES A LAYER THE LABEL. This used to be `x < 50`, i.e. "it is in the
# left column", and that broke the moment the slide stopped being two columns:
# on the current frame the label sits at x 8.86 and the question at x 36.91, so
# BOTH read as labels, both got the 42% width, and the phone version rendered
# the full question at label size - a 61px strip of unreadable type (mu9rigci,
# "this is not scaling in mobile view"). The order test had the same bug, so the
# question stacked above the label too.
#
# Width is the signal that actually distinguishes them, and it says what the
# label IS rather than where it happens to sit: a label is a short word or two
# (17.53% of the frame here), a line is a sentence (53.19%). 30% is the gap
# between those two populations, not a tuned number.
LABEL_MAX_W = 30.0
def is_label(l):
    return l["w"] < LABEL_MAX_W

for l in layers:
    l["phone_pct"] = LABEL_PCT if is_label(l) else LINE_PCT
    l["phone_h"] = (PHONE_W * l["phone_pct"] / 100) / l["ar"]
phone_order = ([l for l in layers if is_label(l)] +
               [l for l in layers if not is_label(l)])
stack = sum(l["phone_h"] for l in layers) + GAP_PX * (len(layers) - 1)
H = stack / (1 - TOP_PCT / 100 - BOTTOM_PCT / 100)
cursor = H * TOP_PCT / 100
for l in phone_order:
    l["phone_y"] = cursor / H * 100
    cursor += l["phone_h"] + GAP_PX
print(f"phone box {PHONE_W}x{round(H)} for {len(layers)} layers")

if DRY:
    sys.exit(0)

ids = ",".join(l["id"] for l in layers)
imgs = api(f"https://api.figma.com/v1/images/{FILE}?ids={ids}&format=png&scale=2")["images"]
for l in layers:
    url = imgs.get(l["id"])
    if not url:
        sys.exit(f"no render URL for {l['id']}")
    urllib.request.urlretrieve(url, os.path.join(DUP, l["file"]))
    print(f'exported {l["file"]}')

P = "/figures/scheduled/dup/"
# `tint: true` on every layer: these exports are flat-colour type off a white
# Figma ground, so the page paints them in its own ink instead of showing the
# picture - without it they sit at 1.4:1 in dark mode (pin mu3jl3kt).
desktop = "          layers: [\n" + "".join(
    f'            {{ src: "{P}{l["file"]}", x: {l["x"]:.2f}, y: {l["y"]:.2f}, w: {l["w"]:.2f}, fx: "reveal", tint: true }},\n'
    for l in layers) + "          ],"
mobile = ("          mobile: {\n"
          f"            aspect: [{PHONE_W}, {round(H)}],\n"
          "            layers: [\n" + "".join(
              f'              {{ src: "{P}{l["file"]}", x: 8, y: {l["phone_y"]:.1f}, w: {l["phone_pct"]:.0f}, fx: "reveal", tint: true }},\n'
              for l in phone_order) +
          "            ],\n          },")

src = open(APP).read()
for tag, block in (("desktop", desktop), ("mobile", mobile)):
    pat = re.compile(r"(// <bridge-107 " + tag + r">\n).*?(\n\s*// </bridge-107 " + tag + r">)", re.S)
    if not pat.search(src):
        sys.exit(f"marker <bridge-107 {tag}> not found in App.jsx")
    src = pat.sub(lambda m: m.group(1) + block + m.group(2), src, count=1)
open(APP, "w").write(src)
print("App.jsx rewritten between the markers")

stale = [f for f in os.listdir(DUP)
         if f.endswith(".png") and f not in {l["file"] for l in layers}]
if stale:
    print("unreferenced in dup/ (left in place):", ", ".join(sorted(stale)))
