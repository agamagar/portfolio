# segtile.py SKIN : cut a style tile (SKIN.png, copied in from tools/face-styles/ref) into part
# labels, as felt/segfelt.py does for felt: 0 bg, 1 skin, 2 hair, 3 eye, 4 brow. One file for
# the six tiles fitted on 2026-10-12 (claySun, stone, cel, hose, pixel, riso); what differs
# per tile is in CFG. Run in the fit folder. Writes ref.webp (the tile at 802 x 862, lossless),
# ref_parts_full.npy, ref_parts.npy (fit size, 200 wide), ref_parts_tile.npy, trim_keep.npy
# and parts_check.png.
#
# The steps:
#   - the backdrop: pixels near the backdrop's colour (the border's median), flooded in from
#     the border. Ink outlines (hose, cel, pixel) and riso's torn paper rim stop the flood, so
#     they stay with the head
#   - dark, thick blobs (a morphological opening drops ink lines a few px wide): the hair is
#     the biggest (or the tile's hair colour), an eye the blob on an eye landmark, a brow an
#     elongated blob above one; a stone head is one colour, so its hair is a traced polygon
#     and its carved eyes and brows ellipses on the landmarks
#   - whatever is left unassigned inside the head (ink lines, the rim) takes the nearest part
#     among skin and hair, so a silhouette's outline belongs to what it outlines
import sys, json
import numpy as np
from PIL import Image, ImageDraw
from scipy import ndimage as nd
from skimage import color

SKIN = sys.argv[1]
LM = json.load(open(f"tile/landmarks/{SKIN}.json"))
CFG = {
    # dark: what counts as a dark blob (CIE L*); open: the opening radius that drops ink lines
    "claySun": dict(bgtol=16, dark=45, open=1, hair=dict(L=(0, 75), hue=(15, 53), chroma=8)),
    "stone": dict(bgtol=22, dark=None),
    "cel": dict(bgtol=14, dark=40, open=4, hair=dict(L=(0, 70), hue=(30, 59), chroma=12)),
    "hose": dict(bgtol=7, dark=30, open=5, hair=dict(L=(0, 45), hue=(20, 75), chroma=18)),
    "pixel": dict(bgtol=14, dark=32, open=3, hair=dict(L=(0, 58), hue=(25, 80), chroma=14)),
    # riso: the torn white rim (L* > 82) walls the head off from the paper
    "riso": dict(bgtol=7, dark=30, open=3, blur=2.5, rim=82, hair=dict(pink=True, L=(0, 38))),
}[SKIN]
W = 200
tile = Image.open(f"{SKIN}.png").convert("RGB")
im = tile.resize((802, 862), Image.LANCZOS)
im.save("ref.webp", lossless=True)
full = np.asarray(im).astype(float) / 255
src = nd.gaussian_filter(full, (CFG["blur"], CFG["blur"], 0)) if CFG.get("blur") else full
lab = color.rgb2lab(src)
L, a, b = lab[..., 0], lab[..., 1], lab[..., 2]
hue = np.degrees(np.arctan2(b, a)) % 360
chroma = np.hypot(a, b)
H, Wf = L.shape
yy, xx = np.mgrid[0:H, 0:Wf]

def disk(r):
    y, x = np.mgrid[-r:r + 1, -r:r + 1]
    return x * x + y * y <= r * r

def ellipse(cx, cy, rx, ry, rot=0.0):
    c, s = np.cos(rot), np.sin(rot)
    u, v = (xx - cx) * c + (yy - cy) * s, -(xx - cx) * s + (yy - cy) * c
    return (u / rx) ** 2 + (v / ry) ** 2 <= 1

def poly(pts):
    m = Image.new("L", (Wf, H), 0)
    ImageDraw.Draw(m).polygon([tuple(p) for p in pts], fill=1)
    return np.asarray(m).astype(bool)

# ---- the backdrop
ring = np.concatenate([lab[:6].reshape(-1, 3), lab[-6:].reshape(-1, 3), lab[:, :6].reshape(-1, 3), lab[:, -6:].reshape(-1, 3)])
bgc = np.median(ring, 0)
near = np.linalg.norm(lab - bgc, axis=-1) < CFG["bgtol"]
near |= (xx < 6) | (xx > Wf - 4)  # the tiles' pale edge columns
if CFG.get("rim"):
    L1 = color.rgb2lab(nd.gaussian_filter(full, (1, 1, 0)))[..., 0]
    near &= ~nd.binary_dilation(L1 > CFG["rim"], iterations=2)
near = nd.binary_opening(near, iterations=1)
lb, n = nd.label(near)
border = set(np.unique(np.concatenate([lb[0], lb[-1], lb[:, 0], lb[:, -1]]))) - {0}
bg = np.isin(lb, list(border))
fg = nd.binary_fill_holes(~bg) & (xx >= 8) & (xx < Wf - 6)
fg = nd.binary_opening(fg, iterations=2)
# riso's safety pin pokes out past the ear: its tip stays in the backdrop plate (as the tile has
# it), so the head is not stretched to cover it
PIN = [(0, 535), (62, 540), (80, 572), (66, 622), (0, 628)]
if SKIN == "riso":
    fg &= ~poly(PIN)
lb, n = nd.label(fg)
fg = lb == (np.argmax(nd.sum(fg, lb, range(1, n + 1))) + 1)

parts = np.zeros(L.shape, np.uint8)
UN = 255  # unassigned, inside the head
parts[fg] = 1

eyes = [LM["EyeL"], LM["EyeR"]]
if CFG["dark"] is None:
    # STONE: one material. The hair is the mass above the forehead's line and down the
    # sideburn by the ear (traced on the tile at 802 x 862); the eyes and brows are carved
    # bulges, ellipses on the landmarks
    hair = poly([(95, 420), (105, 330), (150, 250), (200, 180), (250, 140), (310, 122), (350, 150), (400, 100), (470, 58),
                 (560, 22), (625, 28), (660, 70), (658, 130), (632, 182), (650, 212), (642, 262), (604, 300), (560, 290),
                 (500, 280), (420, 280), (340, 290), (290, 302), (262, 332), (250, 385), (254, 450), (256, 528), (236, 524),
                 (222, 440), (150, 405)]) & fg
    parts[hair] = 2
    parts[ellipse(380, 440, 32, 22, -0.1) & fg] = 3
    parts[ellipse(577, 413, 22, 24) & fg] = 3
    parts[ellipse(368, 388, 50, 11, -0.25) & fg] = 4
    parts[ellipse(566, 350, 34, 9, 0.12) & fg] = 4
else:
    dark = fg & (L < CFG["dark"])
    thick = nd.binary_opening(dark, structure=disk(CFG["open"])) if CFG.get("open", 0) > 1 else dark
    # the hair: by its own colour where it has one (cel, hose, pixel, riso), else the biggest dark blob
    hc = CFG.get("hair")
    if hc:
        hm = fg & (L >= hc["L"][0]) & (L < hc["L"][1])
        if hc.get("pink"):
            hm |= fg & (a > 25) & (hue > 300)  # riso's pink ink
        else:
            hm &= chroma > hc["chroma"]
            if "hue" in hc:
                hm &= (hue > hc["hue"][0]) & (hue < hc["hue"][1])
        hm = nd.binary_opening(hm, structure=disk(3))
        lh, nh = nd.label(hm)
        sz = nd.sum(hm, lh, range(1, nh + 1))
        hair = np.zeros_like(hm)
        for i in range(1, nh + 1):
            if sz[i - 1] > 0.15 * sz.max():
                hair |= lh == i
    else:
        lt, nt = nd.label(thick)
        sz = nd.sum(thick, lt, range(1, nt + 1))
        hair = lt == (np.argmax(sz) + 1)
    hair = nd.binary_fill_holes(nd.binary_closing(hair, structure=disk(4))) & fg
    # eyes and brows: thick dark blobs off the hair, placed by the landmarks
    feat = thick & ~nd.binary_dilation(hair, iterations=2)
    lt, nt = nd.label(feat)
    for i in range(1, nt + 1):
        m = lt == i
        ys, xs = np.where(m)
        if len(ys) < 60:
            continue
        cy, cx = ys.mean(), xs.mean()
        h, w = np.ptp(ys) + 1, np.ptp(xs) + 1
        kind = "?"
        for ex, ey in eyes:
            if m[ey, ex] or (abs(cx - ex) < 30 and abs(cy - ey) < 30 and len(ys) < 9000):
                kind = "eye"
            elif abs(cx - ex) < 110 and 25 < ey - cy < 150 and w > 0.9 * h and w < 140 and 400 < len(ys) < 6000:
                kind = "brow" if kind == "?" else kind
        if kind != "?" or len(ys) > 400:
            print(i, len(ys), "c", int(cx), int(cy), "hw", h, w, kind)
        if kind == "eye":
            parts[nd.binary_fill_holes(nd.binary_closing(m, structure=disk(3)))] = 3
        elif kind == "brow":
            parts[nd.binary_closing(m, iterations=2) & fg] = 4
    parts[hair & (parts == 1)] = 2
    # ink lines and rims (and the silhouette's anti-aliased edge, half backdrop in colour):
    # neither skin nor hair by colour; they take the nearest of the two
    thin = fg & (L < CFG["dark"]) & (parts <= 2) & ~nd.binary_dilation(hair, iterations=1) if CFG.get("open", 0) > 1 else np.zeros_like(fg)
    rim = fg & nd.binary_dilation(bg, iterations=9) & (parts <= 2)
    if True:
        un = (thin | rim) & ~hair
        body = (parts > 0) & ~un
        idx = nd.distance_transform_edt(~body, return_distances=False, return_indices=True)
        fill = parts[idx[0], idx[1]]
        parts[un] = np.where(fill[un] >= 1, np.minimum(fill[un], 2), 1)

# skin islands cut off from the face (a highlight on a lock of hair, lighter than the hair
# colour test allows) are hair
if CFG["dark"] is not None:
    ls, ns = nd.label(parts == 1)
    if ns > 1:
        sz = nd.sum(parts == 1, ls, range(1, ns + 1))
        near_hair = nd.binary_dilation(parts == 2, iterations=2)
        for i in range(1, ns + 1):
            m = ls == i
            if sz[i - 1] < 0.2 * sz.max() and (m & near_hair).any():
                parts[m] = 2
np.save("ref_parts_full.npy", parts)
np.save("trim_keep.npy", nd.binary_dilation(parts > 0, iterations=3))
small = np.asarray(Image.fromarray(parts).resize((W, round(862 * W / 802)), Image.NEAREST))
np.save("ref_parts.npy", small)
np.save("ref_parts_tile.npy", np.asarray(Image.fromarray(parts).resize(tile.size, Image.NEAREST)))
pal = np.array([[40, 40, 60], [246, 214, 190], [90, 50, 30], [0, 0, 255], [60, 200, 60]], np.uint8)
rgb = (full * 255).astype(float)
ov = (0.55 * rgb + 0.45 * pal[parts]).astype(np.uint8)
Image.fromarray(np.concatenate([ov, pal[parts]], 1)).save("parts_check.png")
print("size", parts.shape, "fit", small.shape, "counts", np.bincount(small.ravel(), minlength=5))
