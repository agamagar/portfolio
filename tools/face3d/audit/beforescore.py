# beforescore.py AUDIT_DIR WORK : each skin's rest shot from an audit (audit.mjs, e.g. of the site
# before a change) scored against its tile the way the fit scorers do (the canvas over the skin's
# backdrop colour, the head labels of WORK/SKIN/fit), at the canvas size. Prints skin, mean |err|.
import sys, json, os
import numpy as np
from PIL import Image
d, W = sys.argv[1], sys.argv[2]
TILE = {"clay": None, "noir": "noir.png", "felt": "felt.png", "claySun": "claySun.png", "stone": "stone.png", "cel": "cel.png",
        "hose": "hose.png", "pixel": "pixel.png", "riso": "riso.png"}
for s, t in TILE.items():
    f = f"{d}/{s}_rest.png"
    fit = f"{W}/{s}/fit"
    if not os.path.exists(f) or not os.path.exists(fit):
        continue
    ref = Image.open(f"{fit}/ref.webp" if t is None else f"{fit}/{t}").convert("RGB").resize((802, 862), Image.LANCZOS)
    parts = np.load(f"{fit}/score_parts_full.npy" if os.path.exists(f"{fit}/score_parts_full.npy") else f"{fit}/ref_parts_full.npy")
    im = Image.open(f).convert("RGBA").resize((802, 862), Image.LANCZOS)
    bgc = tuple(int(x) for x in np.median(np.asarray(ref)[:20].reshape(-1, 3), 0))
    base = Image.new("RGBA", im.size, bgc + (255,)); base.alpha_composite(im)
    dd = np.abs(np.asarray(base.convert("RGB")).astype(int) - np.asarray(ref).astype(int)).mean(-1)
    hd = (parts >= 1) & (parts <= (5 if s == "noir" else 4))
    print(s, round(float(dd[hd].mean()), 2))
