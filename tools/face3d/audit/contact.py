# contact.py OUT.png S FILE.png ... : the given renders side by side (4 per row) on a light ground
import sys
from PIL import Image, ImageDraw
out, S, files = sys.argv[1], int(sys.argv[2]), sys.argv[3:]
cols = min(4, len(files)); rows = (len(files) + cols - 1) // cols
g = Image.new("RGB", (S * cols, S * rows), (233, 233, 235)); d = ImageDraw.Draw(g)
for i, f in enumerate(files):
    im = Image.open(f).convert("RGBA"); bg = Image.new("RGBA", im.size, (233, 233, 235, 255)); bg.alpha_composite(im); im = bg.convert("RGB"); im.thumbnail((S, S))
    g.paste(im, ((i % cols) * S, (i // cols) * S)); d.text(((i % cols) * S + 4, (i // cols) * S + 4), f.split("/")[-1][:-4], fill=(60, 60, 60))
g.save(out)
