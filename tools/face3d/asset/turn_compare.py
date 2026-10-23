# turn_compare.py RENDER_DIR OUT.png [CELLS=all] : turnaround cell | our render (aligned by silhouette box) per view, with IoU / SSIM / LPIPS per view.
import sys, os
import numpy as np
from PIL import Image
from scipy import ndimage as nd
from skimage.metrics import structural_similarity as ssim
HERE = os.path.dirname(os.path.abspath(__file__)); T = f"{HERE}/turn"
d, out = sys.argv[1], sys.argv[2]; cells = [int(c) for c in sys.argv[3].split(",")] if len(sys.argv) > 3 else list(range(12))
try:
    import torch, lpips; net = lpips.LPIPS(net="alex", verbose=False)
except Exception: net = None
def frame(img, mask, S=360):
    ys, xs = np.where(mask); y0, y1, x0, x1 = ys.min(), ys.max() + 1, xs.min(), xs.max() + 1; s = (S - 20) / max(y1 - y0, x1 - x0)
    nh, nw = max(1, int((y1 - y0) * s)), max(1, int((x1 - x0) * s)); ci = np.asarray(Image.fromarray(img[y0:y1, x0:x1].astype(np.uint8)).resize((nw, nh), Image.LANCZOS)); mi = np.asarray(Image.fromarray((mask[y0:y1, x0:x1] * 255).astype(np.uint8)).resize((nw, nh), Image.BILINEAR)) > 127
    o = np.full((S, S, 3), (233, 233, 235), np.uint8); om = np.zeros((S, S), bool); oy, ox = (S - nh) // 2, (S - nw) // 2; o[oy:oy + nh, ox:ox + nw] = ci; om[oy:oy + nh, ox:ox + nw] = mi; return o, om
rows = []; sc = []
for i in cells:
    cell = np.asarray(Image.open(f"{T}/cell_{i:02d}.png").convert("RGB")); fm = np.asarray(Image.open(f"{T}/full_{i:02d}.png").convert("L")) > 127
    p = f"{d}/v_{i:02d}.png"
    if not os.path.exists(p): continue
    r = Image.open(p).convert("RGBA"); ra = np.asarray(r); rm = ra[..., 3] > 128
    rr = np.asarray(Image.alpha_composite(Image.new("RGBA", r.size, (233, 233, 235, 255)), r).convert("RGB"))
    tg, tm = frame(cell, fm); rg, rmm = frame(rr, rm); iou = (tm & rmm).sum() / max(1, (tm | rmm).sum())
    s_ = ssim(np.asarray(Image.fromarray(tg).convert("L")), np.asarray(Image.fromarray(rg).convert("L")), data_range=255)
    lp = float("nan")
    if net is not None:
        tt = lambda im: torch.from_numpy(im.astype(np.float32) / 127.5 - 1).permute(2, 0, 1)[None]; lp = float(net(tt(tg), tt(rg)))
    sc.append((i, iou, s_, lp)); rows.append(np.concatenate([tg, rg], 1))
    print(f"view {i:02d}: IoU {iou:.3f} SSIM {s_:.3f} LPIPS {lp:.3f}")
if sc: print(f"mean: IoU {np.mean([s[1] for s in sc]):.3f} SSIM {np.mean([s[2] for s in sc]):.3f} LPIPS {np.nanmean([s[3] for s in sc]):.3f}")
per = 2; sheet = []
for k in range(0, len(rows), per):
    chunk = rows[k:k + per]
    while len(chunk) < per: chunk.append(np.full_like(rows[0], 233))
    sheet.append(np.concatenate(chunk, 1))
Image.fromarray(np.concatenate(sheet, 0)).save(out)
