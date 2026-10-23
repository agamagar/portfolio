# score_vs_target.py RENDER.png [CELL=0] : silhouette IoU and SSIM of a render against one head of the target sheet (cells 0-11, row-major),
# both aligned by their silhouette bounding box to a common 512 px frame (aspect kept, centred), composited on the sheet's light grey.
import sys, os
import numpy as np
from PIL import Image
from scipy import ndimage as nd
try: from skimage.metrics import structural_similarity as ssim
except Exception: ssim = None
HERE = os.path.dirname(os.path.abspath(__file__))
render, cell = sys.argv[1], int(sys.argv[2]) if len(sys.argv) > 2 else 0
sheet = Image.open(os.path.join(HERE, "goldens/target-fidelity-sheet.png")).convert("RGB")
W, H = sheet.size; cw, ch = 440, 472; xs = [0, 520, 1040, 1560]; ys = [0, 552, 1104]
c = sheet.crop((xs[cell % 4], ys[cell // 4], xs[cell % 4] + cw, ys[cell // 4] + ch))
a = np.asarray(c).astype(np.float32)
bg = np.median(np.concatenate([a[:6].reshape(-1, 3), a[-6:].reshape(-1, 3)]), 0)
tmask = (np.abs(a - bg).max(2) > 14); tmask = nd.binary_opening(tmask, iterations=2); tmask = nd.binary_fill_holes(tmask)
lab, n = nd.label(tmask); 
if n > 1: tmask = lab == (1 + np.argmax(nd.sum(tmask, lab, range(1, n + 1))))
r = Image.open(render).convert("RGBA"); ra = np.asarray(r); rmask = ra[..., 3] > 128
def frame(img, mask, S=512):
    ys_, xs_ = np.where(mask); y0, y1, x0, x1 = ys_.min(), ys_.max() + 1, xs_.min(), xs_.max() + 1
    s = (S - 24) / max(y1 - y0, x1 - x0); crop = img[y0:y1, x0:x1]; m = mask[y0:y1, x0:x1]
    nh, nw = max(1, int((y1 - y0) * s)), max(1, int((x1 - x0) * s))
    ci = np.asarray(Image.fromarray(crop.astype(np.uint8)).resize((nw, nh), Image.LANCZOS)); mi = np.asarray(Image.fromarray((m * 255).astype(np.uint8)).resize((nw, nh), Image.BILINEAR)) > 127
    out = np.full((S, S, 3), (233, 233, 235), np.uint8); om = np.zeros((S, S), bool); oy, ox = (S - nh) // 2, (S - nw) // 2
    out[oy:oy + nh, ox:ox + nw] = ci; om[oy:oy + nh, ox:ox + nw] = mi; return out, om
tg, tm = frame(a, tmask)
rr = np.asarray(Image.alpha_composite(Image.new("RGBA", r.size, (233, 233, 235, 255)), r).convert("RGB")).astype(np.float32)
rg, rm = frame(rr, rmask)
iou = (tm & rm).sum() / max(1, (tm | rm).sum())
s_ = ssim(np.asarray(Image.fromarray(tg).convert("L")), np.asarray(Image.fromarray(rg).convert("L")), data_range=255) if ssim else float("nan")
lp = float("nan")
try:
    import torch, lpips
    net = lpips.LPIPS(net="alex", verbose=False)
    tt = lambda im: torch.from_numpy(np.asarray(im).astype(np.float32) / 127.5 - 1).permute(2, 0, 1)[None]
    lp = float(net(tt(tg), tt(rg)))
except Exception as ex: print("lpips unavailable:", str(ex)[:80])
print(f"silhouette IoU {iou:.3f}   SSIM {s_:.3f}   LPIPS {lp:.3f} (lower is closer)")
Image.fromarray(np.concatenate([tg, rg], 1)).save(render.rsplit(".", 1)[0] + "_aligned.png")
