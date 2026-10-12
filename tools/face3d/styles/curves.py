# curves.py CURVES.json OUT.png : small multiples, one panel per skin: the head's pitch through
# the same "nod", as each skin's motion profile performs it (curves.mjs). One series a panel,
# one ink, shared axes, so the steps, the timing and the size can be compared down the grid.
import sys, json
from PIL import Image, ImageDraw, ImageFont
D = json.load(open(sys.argv[1]))
ORDER = ["clay", "claySun", "felt", "stone", "noir", "pixel", "cel", "hose", "riso", "print"]
COLS, PW, PH, PAD = 2, 520, 150, 46
W, H = COLS * PW + 24, 64 + ((len(ORDER) + 1) // 2) * PH + 30
img = Image.new("RGB", (W, H), (252, 252, 250))
d = ImageDraw.Draw(img)
try:
    F = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf", 13); FB = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", 15)
except Exception:
    F = FB = ImageFont.load_default()
INK, MUTED, GRID, LINE = (28, 28, 30), (110, 110, 116), (226, 226, 230), (40, 92, 160)
d.text((14, 12), "The same nod, performed by each skin: head pitch over 1.7 s", font=FB, fill=INK)
d.text((14, 34), "Steps = poses held (twos, threes); width = duration; height = amplitude. From styleMotion.js.", font=F, fill=MUTED)
ymin, ymax, tmax = -0.04, 0.13, 1700
for i, id in enumerate(ORDER):
    x0 = 12 + (i % COLS) * PW + PAD; y0 = 64 + (i // COLS) * PH + 10; w = PW - PAD - 20; h = PH - 44
    sx = lambda t: x0 + t / tmax * w
    sy = lambda v: y0 + h - (v - ymin) / (ymax - ymin) * h
    for v in (0.0, 0.1):
        d.line([(x0, sy(v)), (x0 + w, sy(v))], fill=GRID, width=1)
        d.text((x0 - 34, sy(v) - 7), f"{v:.1f}", font=F, fill=MUTED)
    for t in (0, 500, 1000, 1500):
        d.text((sx(t) - 10, y0 + h + 4), f"{t / 1000:g}s", font=F, fill=MUTED)
    p = D[id]["prof"]
    d.text((x0, y0 - 6), id, font=FB, fill=INK)
    d.text((x0 + 80, y0 - 4), f"{p['stepMs'] or 'smooth'}{' ms' if p['stepMs'] else ''} · {p['ease']} · ×{p['durationScale']} time · ×{p['amplitude']} size", font=F, fill=MUTED)
    pts = [(sx(t), sy(v)) for t, v, _ in D[id]["rows"]]
    d.line(pts, fill=LINE, width=2, joint="curve")
img.save(sys.argv[2])
print("wrote", sys.argv[2])
