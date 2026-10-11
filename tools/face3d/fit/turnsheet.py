import sys
from PIL import Image, ImageDraw
d = sys.argv[1]
names = ["rest", "turn-left", "turn-right", "nod-down", "look-up", "shy"]
ims = [Image.open(f"{d}/{n}.png").convert("RGBA") for n in names]
w, h = ims[0].size
W = Image.new("RGB", (w * 3, (h + 16) * 2), (235, 235, 235)); dr = ImageDraw.Draw(W)
for i, (n, im) in enumerate(zip(names, ims)):
    bg = Image.new("RGBA", im.size, (235, 235, 235, 255)); bg.alpha_composite(im)
    x, y = (i % 3) * w, (i // 3) * (h + 16); W.paste(bg.convert("RGB"), (x, y + 16)); dr.text((x + 5, y + 2), n, fill="black")
W.save(f"{d}/sheet.png")
