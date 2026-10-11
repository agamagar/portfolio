import sys, re
from PIL import Image, ImageDraw
d = sys.argv[1]; out = sys.argv[2]
ids = ["clay","noir","hose","cel","claySun","pixel","felt","stone","riso","print"]
tiles = []
for i in ids:
    im = Image.open(f"{d}/{i}.png").convert("RGBA")
    bg = tuple(int(x) for x in re.findall(r"\d+", open(f"{d}/{i}.bg").read())[:3])
    if im.width < 300: im = im.resize((460, int(460 * im.height / im.width)), Image.NEAREST)
    im = im.resize((360, int(360 * im.height / im.width)), Image.LANCZOS if im.width > 360 else Image.NEAREST)
    t = Image.new("RGBA", im.size, bg + (255,)); t.alpha_composite(im); tiles.append((i, t.convert("RGB")))
h = tiles[0][1].height
W = Image.new("RGB", (360 * 5, (h + 20) * 2), "white"); dr = ImageDraw.Draw(W)
for k, (i, t) in enumerate(tiles):
    x, y = (k % 5) * 360, (k // 5) * (h + 20)
    W.paste(t, (x, y)); dr.text((x + 160, y + h + 4), i, fill="black")
W.save(out)
