# beforeafter.py BEFORE_DIR AFTER_DIR OUT.jpg : a row per skin: its tile, the page before, the page
# after (both as /faces draws them at rest, plates and all), then after: grin, blink, turned.
import sys, os
from PIL import Image, ImageDraw
b, a, out = sys.argv[1:4]
REF = "tools/face-styles/ref"
TILE = {"clay": "clay.png", "noir": "noir.png", "hose": "rubberhose.png", "cel": "cel.png", "claySun": "clay-yellow.png", "pixel": "pixel.png",
        "felt": "knit.png", "stone": "stone.png", "riso": "riso.png", "print": None}
cols = ["tile", "before", "after", "grin", "blink", "turned"]
S = 180
g = Image.new("RGB", (80 + S * len(cols), 22 + S * len(TILE)), "white")
d = ImageDraw.Draw(g)
for j, c in enumerate(cols): d.text((80 + j * S + 4, 5), c, fill="black")
def shot(p):
    if not p or not os.path.exists(p): return None
    im = Image.open(p).convert("RGBA"); bg = Image.new("RGBA", im.size, (128, 128, 128, 255)); bg.alpha_composite(im)
    return bg.convert("RGB")
for i, (s, t) in enumerate(TILE.items()):
    d.text((4, 22 + i * S + S // 2), s, fill="black")
    ims = [Image.open(f"{REF}/{t}").convert("RGB") if t else None, shot(f"{b}/{s}_page.png"), shot(f"{a}/{s}_page.png"),
           shot(f"{a}/{s}_grin.png"), shot(f"{a}/{s}_blink.png"), shot(f"{a}/{s}_turnL.png")]
    for j, im in enumerate(ims):
        if im is None:
            d.text((80 + j * S + 40, 22 + i * S + S // 2), "(no tile)", fill="gray"); continue
        im.thumbnail((S - 4, S - 4)); g.paste(im, (80 + j * S + 2, 22 + i * S + 2))
g.save(out, quality=86)
