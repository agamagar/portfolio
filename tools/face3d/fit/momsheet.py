# momsheet.py DIR : the 12 held moments on one sheet, face crops enlarged
import sys
from PIL import Image, ImageDraw
d = sys.argv[1]
names = ["rest", "blink", "grin", "surprised", "wink", "laugh", "shy", "think", "look", "sad", "angry", "puff"]
tiles = []
for n in names:
    im = Image.open(f"{d}/{n}.png").convert("RGBA")
    bg = Image.new("RGBA", im.size, (235, 235, 235, 255)); bg.alpha_composite(im)
    W, H = im.size
    tiles.append((n, bg.convert("RGB").crop((int(W * 0.18), int(H * 0.3), int(W * 0.86), int(H * 0.92))).resize((300, 300))))
S = Image.new("RGB", (300 * 4, 318 * 3), "white"); dr = ImageDraw.Draw(S)
for i, (n, t) in enumerate(tiles):
    x, y = (i % 4) * 300, (i // 4) * 318
    S.paste(t, (x, y + 18)); dr.text((x + 4, y + 3), n, fill="black")
S.save(f"{d}/sheet_face.png")
