# Landmark pairs between the line drawing (placed by the pose fit's similarity) and the
# head drawn in ink by the live renderer at the hand-off pose. Output: handoff.json
import sys, json, re, numpy as np
D = sys.argv[1]; sys.path.insert(0, D)
from svgpath import flatten, resample
from PIL import Image
from scipy import ndimage as ndi
from skimage import measure
q = json.load(open(D + '/pose.json'))
s, th, tx, ty = q['s'], q['th'], q['tx'], q['ty']
R = s * np.array([[np.cos(th), -np.sin(th)], [np.sin(th), np.cos(th)]])
T = lambda P: np.asarray(P, float) @ R.T + [tx, ty]
src = open(D + '/../morph/src/drawing.js').read()
paths = dict(re.findall(r'(\w+): "(M[^"]+)"', src))
OUTER = re.search(r'OUTER =\s*"([^"]+)"', src).group(1); FACE = re.search(r'FACE =\s*"([^"]+)"', src).group(1)
d1 = np.array(Image.open(D + '/A_d1.png').convert('RGB')) > 127
d2 = np.array(Image.open(D + '/A_d2.png').convert('RGB')) > 127
ids = np.array(Image.open(D + '/handoff_ids.png'))[:, :, 0]
mass, earL, lines = d1[..., 0], d1[..., 1], d1[..., 2]
eyes, brows, mouth = d2[..., 0], d2[..., 1], d2[..., 2]
H, W = mass.shape

def loop_of(mask, which='outer'):
    lab, n = ndi.label(mask); big = lab == (np.argmax(np.bincount(lab.ravel())[1:]) + 1)
    if which == 'outer':
        m = ndi.binary_fill_holes(big)
    else:  # the largest hole
        holes = ndi.binary_fill_holes(big) & np.logical_not(big)
        hl, hn = ndi.label(holes); m = hl == (np.argmax(np.bincount(hl.ravel())[1:]) + 1)
    c = max(measure.find_contours(np.pad(m, 1).astype(float), 0.5), key=len)[:, ::-1] - 1
    return c

def orient(P):  # counter-clockwise in image coords (y down) => positive shoelace
    a = np.sum(P[:, 0] * np.roll(P[:, 1], -1) - np.roll(P[:, 0], -1) * P[:, 1])
    return P if a > 0 else P[::-1]

def dtw_closed(A, B, n=240):
    A = resample(orient(A), n, True); B = resample(orient(B), n, True)
    # start B at the point nearest A[0], then a banded DTW
    k = np.argmin(np.linalg.norm(B - A[0], axis=1)); B = np.roll(B, -k, axis=0)
    return dtw(A, np.vstack([B, B[:1]]), A_closed=True)

def dtw(A, B, A_closed=False):
    Ae = np.vstack([A, A[:1]]) if A_closed else A
    C = np.linalg.norm(Ae[:, None] - B[None], axis=2)
    n, m = C.shape; acc = np.full((n, m), np.inf); acc[0, 0] = C[0, 0]
    for i in range(n):
        for j in range(m):
            if i == j == 0: continue
            best = min(acc[i-1, j] if i else np.inf, acc[i, j-1] if j else np.inf, acc[i-1, j-1] if i and j else np.inf)
            acc[i, j] = C[i, j] + best
    i, j = n - 1, m - 1; path = [(i, j)]
    while i or j:
        opts = []
        if i and j: opts.append((acc[i-1, j-1], i-1, j-1))
        if i: opts.append((acc[i-1, j], i-1, j))
        if j: opts.append((acc[i, j-1], i, j-1))
        _, i, j = min(opts); path.append((i, j))
    path = path[::-1]
    # one partner per A sample: the mean of its matches
    out = []
    for a in range(len(A)):
        js = [jj for ii, jj in path if ii == a]
        out.append((A[a], B[js].mean(0)))
    return out

pairs = []  # (src xy, dst xy, group)
def add(group, items, every=1):
    for k, (a, b) in enumerate(items):
        if k % every == 0: pairs.append((list(map(float, a)), list(map(float, b)), group))

# 1. the ink mass: outer silhouette and the face opening
outer2 = T(flatten(OUTER)[0][0]); face2 = T(flatten(FACE)[0][0])
outer3 = loop_of(mass, 'outer'); face3 = loop_of(mass, 'inner')
add('outer', dtw_closed(outer2, outer3, 160), 4)
add('face', dtw_closed(face2, face3, 160), 4)

# 2. features
cen = lambda m: np.argwhere(m)[:, ::-1].mean(0)
lab, n = ndi.label(eyes)
eyeC = sorted([cen(lab == i) for i in range(1, n + 1)], key=lambda p: p[0])[:2]
for (x, y), c3 in zip([(96.4317, 110.035), (136.002, 103.812)], eyeC):
    pairs.append((T([[x, y]])[0].tolist(), c3.tolist(), 'eye'))

def blob_axis(m, k=7):
    P = np.argwhere(m)[:, ::-1].astype(float); c = P.mean(0)
    _, _, vt = np.linalg.svd(P - c, full_matrices=False); ax = vt[0]
    if ax[0] < 0: ax = -ax
    t = (P - c) @ ax; lo, hi = np.percentile(t, 3), np.percentile(t, 97)
    pts = []
    for a in np.linspace(lo, hi, k):
        sel = np.abs(t - a) < (hi - lo) / k
        if sel.any(): pts.append(P[sel].mean(0))
    return np.array(pts)

def stroke(name): return T(flatten(paths[name])[0][0])
lab, n = ndi.label(brows)
browB = sorted([lab == i for i in range(1, n + 1)], key=lambda m: cen(m)[0])
for name, m in zip(['browL', 'browR'], browB):
    a = resample(stroke(name), 7); b = blob_axis(m)
    if np.linalg.norm(a[0] - b[0]) > np.linalg.norm(a[0] - b[-1]): b = b[::-1]
    add(name, zip(a, resample(b, 7)))
lab, n = ndi.label(mouth); mm = lab == (np.argmax(np.bincount(lab.ravel())[1:]) + 1)
a = resample(stroke('mouth'), 7); b = blob_axis(mm)
if np.linalg.norm(a[0] - b[0]) > np.linalg.norm(a[0] - b[-1]): b = b[::-1]
add('mouth', zip(a, resample(b, 7)))

# 3. the nose line and the ear: order each line's pixels along its skeleton
from skimage.morphology import skeletonize
def line_path(m):
    sk = skeletonize(m); P = np.argwhere(sk)[:, ::-1].astype(float)
    # greedy walk from one end (the point farthest from the centroid)
    c = P.mean(0); start = np.argmax(np.linalg.norm(P - c, axis=1))
    order = [start]; used = np.zeros(len(P), bool); used[start] = True
    for _ in range(len(P) - 1):
        d = np.linalg.norm(P - P[order[-1]], axis=1); d[used] = np.inf
        j = np.argmin(d)
        if d[j] > 6: break
        order.append(j); used[j] = True
    return P[order]
# the near ear: the ear pixels left of the face
nearEar = (ids == 8) & (np.arange(W)[None, :] < W * 0.4)
earL = earL & (np.arange(W)[None, :] < W * 0.4)
earBox = ndi.binary_dilation(ndi.binary_fill_holes(earL | nearEar), iterations=4)
noseM = lines & np.logical_not(earBox)
lab, n = ndi.label(noseM); noseM = lab == (np.argmax(np.bincount(lab.ravel())[1:]) + 1)
np3 = line_path(noseM); n2 = stroke('nose')
if np.linalg.norm(np3[0] - n2[0]) > np.linalg.norm(np3[-1] - n2[0]): np3 = np3[::-1]
add('nose', zip(resample(n2, 9), resample(np3, 9)))
# the ear's rim: the part of the ring away from the head (the ink mass)
ring = loop_of(earL | nearEar, 'outer')
far = ndi.distance_transform_edt(np.logical_not(mass))
keep = far[np.clip(ring[:, 1].round().astype(int), 0, H-1), np.clip(ring[:, 0].round().astype(int), 0, W-1)] > 18
rim = ring[keep]
# open arc: cut the ring where it jumps
gaps = np.where(np.linalg.norm(np.diff(rim, axis=0), axis=1) > 5)[0]
if len(gaps): rim = np.roll(rim, -(gaps[0] + 1), axis=0)
e2 = stroke('ear')
if np.linalg.norm(rim[0] - e2[0]) > np.linalg.norm(rim[-1] - e2[0]): rim = rim[::-1]
add('ear', zip(resample(e2, 9), resample(rim, 9)))
folds = lines & earBox
lab, n = ndi.label(folds)
if n:
    fm = lab == (np.argmax(np.bincount(lab.ravel())[1:]) + 1)
    fp = line_path(fm); c2 = stroke('earCurl')
    if np.linalg.norm(fp[0] - c2[0]) > np.linalg.norm(fp[-1] - c2[0]): fp = fp[::-1]
    add('earCurl', zip(resample(c2, 5), resample(fp, 5)))

res = np.array([np.linalg.norm(np.subtract(b, a)) for a, b, _ in pairs])
groups = sorted(set(g for _, _, g in pairs))
for g in groups:
    r = [np.linalg.norm(np.subtract(b, a)) for a, b, gg in pairs if gg == g]
    print(f'{g:8s} n={len(r):3d} mean move {np.mean(r):6.1f}px max {np.max(r):6.1f}')
json.dump({'pose': q, 'size': [W, H], 'pairs': [{'a': a, 'b': b, 'g': g} for a, b, g in pairs]}, open(D + '/handoff.json', 'w'))
# picture: arrows
im = Image.open(D + '/A_ink.png').convert('RGB'); from PIL import ImageDraw
im = Image.blend(im, Image.new('RGB', im.size, (255, 255, 255)), 0.6); dr = ImageDraw.Draw(im)
for P in [outer2, face2] + [stroke(k) for k in paths]:
    dr.line([tuple(p) for p in P], fill=(220, 0, 90), width=2)
for a, b, g in pairs:
    dr.line([tuple(a), tuple(b)], fill=(0, 120, 255), width=2); dr.ellipse([b[0]-3, b[1]-3, b[0]+3, b[1]+3], fill=(0, 120, 255))
im.save(D + '/landmarks.png')
dbg = Image.new('RGB', (W, H), (255, 255, 255)); dd = ImageDraw.Draw(dbg)
dd.line([tuple(p) for p in outer3[::3]], fill=(0, 160, 0), width=3); dd.line([tuple(p) for p in face3[::3]], fill=(200, 160, 0), width=3)
dd.line([tuple(p) for p in outer2], fill=(220, 0, 90), width=1); dd.line([tuple(p) for p in face2], fill=(220, 0, 90), width=1)
for k, P in enumerate([orient(outer3), orient(outer2)]):
    for j in range(0, len(P), max(1, len(P)//12)): dd.text(tuple(P[j]), str(j * 12 // len(P)), fill=(0, 0, 255) if k == 0 else (255, 0, 0))
dbg.save(D + '/loops.png')
