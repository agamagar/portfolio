# Cut the noir tile into part labels: 0 bg, 1 skin, 2 hair, 3 eye, 4 brow, 5 hat, 6 coat.
# Polygons traced on the 382 x 408 tile (the dark parts can't be told apart by tone), the
# skin, eyes and brows by tone inside them. Saves ref_parts_full.npy (802 x 862, the site
# canvas), ref_parts.npy (fit size 200 wide) and a preview.
import numpy as np
from PIL import Image, ImageDraw
from scipy import ndimage as nd
TW, TH = 382, 408
g = np.asarray(Image.open("noir.png").convert("L")).astype(float)


def poly(pts):
    im = Image.new("L", (TW, TH), 0)
    ImageDraw.Draw(im).polygon(pts, fill=1)
    return np.asarray(im).astype(bool)


HAT = [(4, 182), (28, 150), (50, 132), (51, 96), (60, 74), (80, 58), (100, 45), (130, 30), (152, 21), (170, 14), (188, 20),
       (205, 36), (222, 32), (240, 24), (262, 16), (282, 13), (300, 17), (315, 28), (322, 45), (320, 62), (311, 76), (303, 85),
       (311, 94), (316, 108), (312, 124), (300, 136), (290, 144), (280, 147), (258, 142), (230, 137), (200, 137), (172, 139),
       (148, 146), (130, 158), (118, 168), (100, 180), (80, 189), (60, 192), (42, 205), (30, 226), (14, 232), (4, 226)]
HAIR_L = [(96, 182), (118, 168), (130, 158), (128, 190), (124, 225), (120, 244), (113, 246), (108, 230), (104, 205)]
HAIR_R = [(280, 147), (290, 144), (296, 158), (301, 178), (304, 200), (302, 212), (296, 205), (290, 182), (284, 160)]
HEAD = [(30, 226), (42, 205), (60, 192), (80, 189), (100, 180), (118, 168), (130, 158), (148, 146), (172, 139), (200, 137),
        (230, 137), (258, 142), (280, 147), (290, 160), (298, 195), (306, 205), (312, 230), (318, 270), (318, 300), (312, 320),
        (300, 334), (285, 345), (262, 352), (235, 354), (210, 350), (195, 320), (150, 300), (100, 284), (60, 274), (40, 262), (28, 240)]
COAT = [(0, 345), (48, 330), (54, 272), (100, 282), (150, 298), (192, 313), (200, 322), (207, 343), (225, 352), (250, 356), (275, 352),
        (295, 340), (306, 322), (315, 296), (345, 306), (382, 322), (382, 408), (0, 408)]
hat, hairL, hairR, head, coat = map(poly, (HAT, HAIR_L, HAIR_R, HEAD, COAT))
P = np.zeros((TH, TW), np.uint8)
P[hat] = 5
skin = head & ~hat & ~coat & (g > 42)
skin = nd.binary_fill_holes(nd.binary_opening(skin, iterations=1))
lb, n = nd.label(skin); sz = nd.sum(skin, lb, range(1, n + 1))
skin = np.isin(lb, 1 + np.where(sz > 200)[0])
# the ear: its inner crease is dark but still skin
EAR = [(30, 228), (42, 205), (60, 194), (82, 192), (100, 200), (106, 225), (106, 250), (96, 268), (70, 274), (45, 266), (32, 248)]
skin |= poly(EAR) & ~hat & (g > 12)
P[skin] = 1
P[(hairL | hairR) & ~skin & ~hat] = 2
# the eyes and brows: dark blobs inside the face
face = nd.binary_fill_holes(skin) & ~hairL & ~hairR
dark = face & (g < 60) & ~skin | (face & (g < 45))
lb, n = nd.label(dark)
for i in range(1, n + 1):
    ys, xs = np.where(lb == i)
    if len(ys) < 15 or xs.mean() < 140:
        continue
    h, w = np.ptp(ys) + 1, np.ptp(xs) + 1
    cy, cx = ys.mean(), xs.mean()
    kind = "brow" if w > 1.3 * h and 150 < cy < 195 else "eye" if 0.6 < h / w < 1.6 and 180 < cy < 230 else "?"
    print(i, len(ys), "c", int(cx), int(cy), "hw", h, w, kind)
    if kind == "eye":
        P[nd.binary_fill_holes(lb == i)] = 3
    elif kind == "brow":
        P[lb == i] = 4
# the rest of the head that is dark: hair and the shadow under the ear
yy = np.arange(TH)[:, None] + np.zeros((1, TW), int)
P[head & (P == 0) & ~coat & (yy < 300)] = 2
P[coat & (P != 1)] = 6
np.save("ref_parts_tile.npy", P)
full = np.asarray(Image.fromarray(P).resize((802, 862), Image.NEAREST))
np.save("ref_parts_full.npy", full)
# for noirtrim.py: anything but open background, grown 3 px
np.save("trim_keep.npy", nd.binary_dilation(full > 0, iterations=3))
small = np.asarray(Image.fromarray(full).resize((200, 215), Image.NEAREST))
np.save("ref_parts.npy", small)
pal = np.array([[40, 40, 60], [246, 214, 190], [90, 50, 30], [0, 0, 255], [200, 60, 60], [60, 160, 60], [120, 90, 160]], np.uint8)
rgb = np.asarray(Image.open("noir.png").convert("RGB")).astype(float)
ov = (0.5 * rgb + 0.5 * pal[P]).astype(np.uint8)
Image.fromarray(np.concatenate([ov, pal[P]], 1)).resize((382 * 4, 408 * 2), Image.NEAREST).save("parts_check.png")
print("counts", np.bincount(P.ravel(), minlength=7))
