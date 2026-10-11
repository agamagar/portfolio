import sys, glob
from PIL import Image, ImageDraw
d = sys.argv[1]
views = [(0, 0), (45, 0), (90, 0), (135, 0), (180, 0), (225, 0), (270, 0), (315, 0), (0, 45), (0, -45)]
ims = []
for y, p in views:
    im = Image.open(f"{d}/y{y}_p{p}.png").convert("RGBA")
    bg = Image.new("RGBA", im.size, (235, 235, 235, 255)); bg.alpha_composite(im)
    ims.append((f"yaw {y}  pitch {p}", bg.convert("RGB").resize((im.width * 2 // 3, im.height * 2 // 3))))
w, h = ims[0][1].size
S = Image.new("RGB", (w * 5, (h + 16) * 2), (235, 235, 235)); dr = ImageDraw.Draw(S)
for i, (lab, im) in enumerate(ims):
    x, yy = (i % 5) * w, (i // 5) * (h + 16)
    S.paste(im, (x, yy + 16)); dr.text((x + 4, yy + 2), lab, fill="black")
S.save(f"{d}/sheet.png")
