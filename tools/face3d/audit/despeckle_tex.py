# despeckle_tex.py FILE.png [...] : remove the thin bright speckle lines a camera-projected skin texture
# carries along every occluding edge (the nose's left edge, the sockets, the ear rim). The reference's
# texels beside an edge hold the edge's rim; once a head move or an emote shifts the light, that dotted
# line shows as a pale crack. A grey opening (5x5) finds them (it keeps everything broader than 4 px (the nose's
# highlight, lips, ears) and drops what is thinner); only texels more than THR (11) levels above it, plus a
# 1 px halo, are refilled from their unflagged neighbours, so the rest of the file is byte-identical in value.
#   python3 tools/face3d/audit/despeckle_tex.py public/faces/skin-raw.png public/faces/skin-clean.png
import sys
import numpy as np
from PIL import Image
from scipy import ndimage as nd
import os
THR = int(os.environ.get("THR", 11))
SZ = 5
for f in sys.argv[1:]:
    im = Image.open(f); mode = im.mode
    a = np.asarray(im.convert("RGB")).astype(np.float32)
    L = a.mean(2)
    th = L - nd.grey_opening(L, size=(SZ, SZ))
    sel = nd.binary_dilation(th > THR, iterations=1)
    # fill from the unflagged texels around (normalised box blur), not from the opening: on the
    # nose ridge the opening would pull the highlight down into a grey streak
    w = (~sel).astype(np.float32)
    num = np.stack([nd.uniform_filter(a[..., c] * w, size=9) for c in range(3)], 2)
    den = nd.uniform_filter(w, size=9)[..., None]
    fill = np.where(den > 0.05, num / np.maximum(den, 1e-6), a)
    out = a.copy(); out[sel] = fill[sel]
    print(f, "texels", int(sel.sum()), f"({100 * sel.mean():.3f}%)")
    Image.fromarray(np.clip(out + 0.5, 0, 255).astype(np.uint8)).save(f, optimize=True)
