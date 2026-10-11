import sys, glob
from PIL import Image, ImageDraw
d, out, cols = sys.argv[1], sys.argv[2], int(sys.argv[3]); labels = sys.argv[4].split(',') if len(sys.argv) > 4 else None
fs = sorted(glob.glob(d + '/f*.png')); ims = [Image.open(f).convert('RGB') for f in fs]
w, h = 300, int(300 * 862 / 802); rows = (len(ims) + cols - 1) // cols
S = Image.new('RGB', (cols * w, rows * (h + 22)), (255, 255, 255)); dr = ImageDraw.Draw(S)
for i, im in enumerate(ims):
    x, y = (i % cols) * w, (i // cols) * (h + 22); S.paste(im.resize((w, h), Image.LANCZOS), (x, y))
    if labels: dr.text((x + 8, y + h + 5), 't = ' + labels[i], fill=(40, 40, 40))
S.save(out)
