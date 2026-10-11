# feltcompare.py BEFORE.png AFTER.png OUT.png : the felt tile, the felt skin before the fit
# (the procedural felt mode on the clay rig) and after (the fitted felt rig), each with the
# page's backdrop plate behind it, and the per-pixel error of each (white = 48 levels off).
import sys, json
import numpy as np
from PIL import Image, ImageDraw
ref = Image.open("felt.png").convert("RGB").resize((802, 862), Image.LANCZOS)
R = np.asarray(ref).astype(int)
P = np.load("ref_parts_full.npy") > 0
def comp(p):
    c = Image.open("felt-back.webp").convert("RGBA"); c.alpha_composite(Image.open(p).convert("RGBA").resize((802, 862), Image.LANCZOS)); return c.convert("RGB")
cols, errs = [ref], []
for p in sys.argv[1:3]:
    c = comp(p); d = np.abs(np.asarray(c).astype(int) - R).mean(-1)
    errs.append(round(float(d[P].mean()), 2))
    cols += [c, Image.fromarray((np.clip(d / 48, 0, 1) * 255).astype(np.uint8)).convert("RGB")]
labels = ["felt tile (knit.png)", f"before: procedural felt, head err {errs[0]}/255", "before error", f"after: fitted felt rig, head err {errs[1]}/255", "after error"]
s = Image.new("RGB", (5 * 401, 431 + 28), "white"); dr = ImageDraw.Draw(s)
for i, (im, t) in enumerate(zip(cols, labels)):
    s.paste(im.resize((401, 431), Image.LANCZOS), (i * 401, 28)); dr.text((i * 401 + 8, 8), t, fill="black")
s.save(sys.argv[3]); print(json.dumps({"before_head": errs[0], "after_head": errs[1]}))
