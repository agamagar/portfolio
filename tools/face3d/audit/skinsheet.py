# skinsheet.py DIR SKIN OUT.png [S] : one skin's rigshot views (rest, turns, every emote) as a sheet, on mid grey
import sys, glob, os
from PIL import Image, ImageDraw
d, skin, out = sys.argv[1:4]; S = int(sys.argv[4]) if len(sys.argv) > 4 else 300
order = ["rest", "turnL", "turnR", "blink", "grin", "surprised", "wink", "laugh", "shy", "think", "lookAround", "nod", "sad", "angry", "puff"]
views = [v for v in order if os.path.exists(f"{d}/{skin}_{v}.png")]
cols = 5; rows = (len(views) + cols - 1) // cols
g = Image.new("RGB", (S * cols, S * rows), (140, 140, 140)); dr = ImageDraw.Draw(g)
for i, v in enumerate(views):
    im = Image.open(f"{d}/{skin}_{v}.png").convert("RGBA"); bg = Image.new("RGBA", im.size, (140, 140, 140, 255)); bg.alpha_composite(im); im = bg.convert("RGB"); im.thumbnail((S, S))
    g.paste(im, ((i % cols) * S, (i // cols) * S)); dr.text(((i % cols) * S + 4, (i // cols) * S + 4), v, fill=(255, 255, 255))
g.save(out)
