# grid.py DIR OUT.png [VIEWS] : the audit's shots, a row per skin (page shot first)
import sys, os, glob
from PIL import Image, ImageDraw
d, out = sys.argv[1], sys.argv[2]
views = (sys.argv[3] if len(sys.argv) > 3 else "page,rest,grin,blink,turnL,turnR,back").split(",")
skins = []
for f in sorted(glob.glob(f"{d}/*_rest.png"), key=os.path.getmtime):
    skins.append(os.path.basename(f)[:-9])
S = 200
g = Image.new("RGB", (90 + S * len(views), 20 + S * len(skins)), "white")
dr = ImageDraw.Draw(g)
for j, v in enumerate(views): dr.text((90 + j * S + 4, 4), v, fill="black")
for i, s in enumerate(skins):
    dr.text((4, 20 + i * S + S // 2), s, fill="black")
    for j, v in enumerate(views):
        p = f"{d}/{s}_{v}.png"
        if not os.path.exists(p): continue
        im = Image.open(p).convert("RGBA")
        bg = Image.new("RGBA", im.size, (128, 128, 128, 255) if v != "page" else (255, 255, 255, 255))
        bg.alpha_composite(im); im = bg.convert("RGB"); im.thumbnail((S, S))
        g.paste(im, (90 + j * S, 20 + i * S))
g.save(out)
