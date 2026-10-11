# gapcrops.py SITE_DIFF.png OUT.png : the named gap boxes, reference over ours, enlarged x3
import sys
from PIL import Image, ImageDraw
im = Image.open(sys.argv[1]).convert("RGB"); w = im.width // 3
boxes = {"hair-top": (290, 50, 500, 220), "back-edge": (95, 220, 185, 435), "eyes": (320, 370, 600, 495),
         "under-ear": (150, 530, 230, 610), "sideburn": (210, 355, 255, 435), "nose": (420, 300, 600, 580)}
tiles = []
for name, (x0, y0, x1, y1) in boxes.items():
    a = im.crop((x0, y0, x1, y1)); b = im.crop((w + x0, y0, w + x1, y1))
    s = 3 if (x1 - x0) < 120 else 2
    a = a.resize((a.width * s, a.height * s), Image.LANCZOS); b = b.resize((b.width * s, b.height * s), Image.LANCZOS)
    t = Image.new("RGB", (a.width * 2 + 10, a.height + 18), "white"); t.paste(a, (0, 18)); t.paste(b, (a.width + 10, 18))
    ImageDraw.Draw(t).text((4, 2), name + "  (reference | ours)", fill="black"); tiles.append(t)
W = max(t.width for t in tiles); H = sum(t.height + 8 for t in tiles)
out = Image.new("RGB", (W, H), "white"); y = 0
for t in tiles: out.paste(t, (0, y)); y += t.height + 8
out.save(sys.argv[2])
