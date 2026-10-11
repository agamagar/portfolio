# overlay.py RENDER.png OUT.png : the reference at 30% over our render, fitted by silhouette box
import sys
import numpy as np
from PIL import Image
S = "/private/tmp/claude-501/-Users-agamagarwal-Library-CloudStorage-GoogleDrive-agamagar117-gmail-com-My-Drive-Active---Portfolio/42c75c5f-9f65-4503-916b-0bebf21487ad"
ref = Image.open(S + "/images/2.webp").convert("RGB")
r = np.asarray(ref).astype(int)
# reference silhouette: anything clearly off the pale grey background
bg = np.median(np.concatenate([r[:10].reshape(-1, 3), r[-10:].reshape(-1, 3)]), axis=0)
rm = np.abs(r - bg).sum(2) > 40
ys, xs = np.where(rm); rb = (xs.min(), ys.min(), xs.max(), ys.max())
ren = Image.open(sys.argv[1]).convert("RGBA")
a = np.asarray(ren)[..., 3] > 20
ys, xs = np.where(a); qb = (xs.min(), ys.min(), xs.max(), ys.max())
# fit: same height, same centre
sc = (qb[3] - qb[1]) / (rb[3] - rb[1])
ref2 = ref.resize((int(ref.width * sc), int(ref.height * sc)))
cx_r, cy_r = (rb[0] + rb[2]) / 2 * sc, (rb[1] + rb[3]) / 2 * sc
cx_q, cy_q = (qb[0] + qb[2]) / 2, (qb[1] + qb[3]) / 2
base = Image.new("RGBA", ren.size, (236, 233, 229, 255)); base.alpha_composite(ren)
lay = Image.new("RGBA", ren.size, (0, 0, 0, 0))
lay.paste(ref2.convert("RGBA"), (int(cx_q - cx_r), int(cy_q - cy_r)))
lay.putalpha(Image.eval(lay.getchannel("A"), lambda v: int(v * 0.3)))
base.alpha_composite(lay)
# silhouette outlines: reference in red, ours in blue, so the misfit is plain
out = base.convert("RGB")
ov = np.asarray(out).copy()
rm2 = np.zeros(a.shape, bool)
m = np.asarray(Image.fromarray((rm * 255).astype("uint8")).resize(ref2.size)) > 127
ox, oy = int(cx_q - cx_r), int(cy_q - cy_r)
H, W = a.shape
for y in range(m.shape[0]):
    yy = y + oy
    if 0 <= yy < H:
        x0, x1 = max(0, ox), min(W, ox + m.shape[1])
        rm2[yy, x0:x1] = m[y, x0 - ox:x1 - ox]
def edge(mk):
    e = np.zeros_like(mk)
    e[1:-1, 1:-1] = mk[1:-1, 1:-1] & ~(mk[:-2, 1:-1] & mk[2:, 1:-1] & mk[1:-1, :-2] & mk[1:-1, 2:])
    return e
ov[edge(rm2)] = (220, 30, 30); ov[edge(a)] = (30, 80, 230)
Image.fromarray(ov).save(sys.argv[2])
print("fit scale", round(sc, 3), "ref box", rb, "our box", qb)
