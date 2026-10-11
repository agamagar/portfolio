# CMA-ES fit of the parametric head to the reference masks, with N Blender workers.
#   python3 optimize.py RUN_NAME [GENERATIONS] [START_JSON]
import json, math, os, subprocess, sys, time
import numpy as np
from PIL import Image

HERE = os.path.dirname(os.path.abspath(__file__))
RUN = sys.argv[1]
GENS = int(sys.argv[2]) if len(sys.argv) > 2 else 200
START = json.load(open(sys.argv[3])) if len(sys.argv) > 3 else {}
OUT = os.path.join(HERE, RUN)
os.makedirs(OUT, exist_ok=True)
BLENDER = "/Applications/Blender.app/Contents/MacOS/Blender"
# photometric term: the reference in linear light at fit size, and the fitted lighting
LIGHT = os.environ.get("FIT_LIGHT")
PHOTO_W = float(os.environ.get("FIT_PHOTO", "15"))
SIGMA0 = float(os.environ.get("FIT_SIGMA", "0.6"))
NW = int(os.environ.get("FIT_NW", "10"))

ref = np.load(os.path.join(HERE, "ref_parts.npy"))
Hh, Ww = ref.shape
REFM = {k: ref == v for k, v in (("skin", 1), ("hair", 2), ("eye", 3), ("brow", 4))}
REFM["fg"] = ref > 0
_r8 = np.asarray(Image.open(os.path.join(HERE, "ref.webp")).convert("RGB")).astype(np.float32) / 255
_lin = np.where(_r8 <= 0.04045, _r8 / 12.92, ((_r8 + 0.055) / 1.055) ** 2.4)
REFLIN = np.stack([np.asarray(Image.fromarray(_lin[..., c]).resize((Ww, Hh), Image.BOX)) for c in range(3)], -1)
SH = None
if LIGHT:
    _L = json.load(open(LIGHT))
    SH = {1: np.array(_L["skin"]["sh"]).T, 2: np.array(_L["hair"]["sh"]).T, 4: np.array(_L["brow"]["sh"]).T}
    EYE = np.array(_L["eye"]["base"])


def sh9(n):
    x, y, z = n[..., 0], n[..., 1], n[..., 2]
    return np.stack([0.282095 * np.ones_like(x), 0.488603 * y, 0.488603 * z, 0.488603 * x,
                     1.092548 * x * y, 1.092548 * y * z, 0.315392 * (3 * z * z - 1), 1.092548 * x * z,
                     0.546274 * (x * x - y * y)], -1)
# landmarks in the full reference (802 x 862), normalised
RW, RH = 802, 862
LM = {"nose": (540 / RW, 525 / RH), "mL": (428 / RW, 632 / RH), "mR": (518 / RW, 660 / RH), "ear": (130 / RW, 515 / RH),
      "EyeL": (357 / RW, 460 / RH), "EyeR": (561 / RW, 408 / RH)}
# another style's tile: FIT_LM=landmarks.json, {"nose": [x, y], ...} in pixels of 802 x 862 (felt/landmarks.json)
if os.environ.get("FIT_LM"):
    LM = {k: (x / RW, y / RH) for k, (x, y) in json.load(open(os.environ["FIT_LM"])).items()}

# the parameters and their search step (sigma); the rest stay at the worker defaults
STEP = dict(
    cam_yaw=6, cam_pitch=5, cam_roll=5, cam_dist=0.6, cam_fov=3, cam_tz=0.15, cam_tx=0.1, cam_sx=0.05, cam_sy=0.05,
    sx=0.05, sy=0.05, sz=0.05, se_n=0.4, jaw=0.04, chin=0.06, lowz=0.06, crown=0.05,
    ear_yc=0.06, ear_zc=0.06, ear_ry=0.04, ear_rz=0.05, ear_flare=0.15, ear_x=0.05, ear_r=0.02, ear_bowl=0.03,
    nose_rz=0.06, nose_tz=0.06, nose_ty=0.06, nose_r0=0.02, nose_r1=0.03, nose_x=0.04,
    eye_xl=0.05, eye_xr=0.05, eye_z=0.05, eye_r=0.02,
    brow_z=0.05, brow_arch=0.02, brow_x0=0.05, brow_x1=0.05, brow_r=0.012, brow_dx=0.04,
    mouth_x0=0.05, mouth_x1=0.05, mouth_z=0.05,
    cap=0.03, hl0=0.06, hlf=0.06, hlb=0.15, sideburn=0.1,
    t0x=0.1, t0y=0.1, t0z=0.1, t1x=0.1, t1y=0.1, t1z=0.1, t2x=0.1, t2y=0.1, t2z=0.1,
    t3x=0.1, t3y=0.1, t3z=0.1, t4x=0.1, t4y=0.1, t4z=0.1, t5x=0.1, t5y=0.1, t5z=0.1,
    top_r0=0.05, top_r1=0.05, top_flat=0.08,
    l0x=0.08, l0y=0.08, l0z=0.08, l3x=0.08, l3y=0.08, l3z=0.08, low_r=0.04,
    near_dz=0.08, far_dz=0.08, side_r=0.04, back_r=0.05,
)
KEYS = list(STEP)
# felt: FIT_KEYS=cam fits the camera only; FIT_KEYS=all (default) every number above
if os.environ.get("FIT_KEYS", "all") == "cam":
    KEYS = [k for k in KEYS if k.startswith("cam_")]
SIG_K = float(os.environ.get("FIT_STEPK", "1"))
# defaults, as the worker has them (read from the worker source)
src = open(os.path.join(HERE, "fitworker.py")).read()
ns = {}
exec(src[src.index("DEFAULTS = dict("):src.index("\n)\n", src.index("DEFAULTS = dict(")) + 3], ns)
D = dict(ns["DEFAULTS"]); D.update(START)
X0 = np.array([D[k] for k in KEYS], float)
SIG = np.array([STEP[k] for k in KEYS], float) * SIG_K


def params(z):
    p = {k: float(v) for k, v in START.items()}
    p.update({k: float(v) for k, v in zip(KEYS, X0 + SIG * z)})
    return p


class Worker:
    def __init__(self, i):
        self.i = i
        self.p = subprocess.Popen([BLENDER, "-b", "-P", os.path.join(HERE, "fitworker.py"), "--", OUT, str(i), str(Ww), str(Hh)],
                                  stdin=subprocess.PIPE, stdout=subprocess.PIPE, stderr=subprocess.DEVNULL, text=True, bufsize=1)

    def send(self, P):
        self.p.stdin.write(json.dumps(P) + "\n"); self.p.stdin.flush()

    def recv(self):
        while True:
            line = self.p.stdout.readline()
            if not line:
                raise RuntimeError("worker died")
            if line.startswith("RES "):
                return json.loads(line[4:])


def iou(a, b):
    u = (a | b).sum()
    return (a & b).sum() / u if u else 1.0


def score(res):
    if "error" in res:
        return 9.0, {}
    A = np.asarray(Image.open(res["png"]).convert("RGBA")).astype(int)
    fg = A[..., 3] > 128
    r, g, b = A[..., 0] > 128, A[..., 1] > 128, A[..., 2] > 128
    M = {"fg": fg, "skin": fg & r & ~g & ~b, "hair": fg & g & ~r & ~b, "eye": fg & b & ~r & ~g, "brow": fg & r & g & ~b}
    I = {k: iou(M[k], REFM[k]) for k in M}
    lm = 0.0
    for k, (x, y) in LM.items():
        if k in res["marks"]:
            mx, my = res["marks"][k]
            lm += (mx - x) ** 2 + (my - y) ** 2
    photo = 0.0
    if SH is not None and res.get("npng"):
        N = np.asarray(Image.open(res["npng"]).convert("RGB")).astype(np.float32) / 255 * 2 - 1
        N /= np.linalg.norm(N, axis=-1, keepdims=True) + 1e-6
        ours = np.where(~fg, 0, np.where(g & ~r, 2, np.where(b, 3, np.where(r & g, 4, 1))))
        pred = np.zeros(N.shape, np.float32)
        Y = sh9(N)
        for k, L in SH.items():
            mk = ours == k
            pred[mk] = Y[mk] @ L
        pred[ours == 3] = EYE
        both = fg & REFM["fg"]
        photo = float(np.abs(np.clip(pred, 0, 1)[both] - REFLIN[both]).mean())
    I["photo"] = photo
    loss = PHOTO_W * photo + 3 * (1 - I["fg"]) + 2 * (1 - I["hair"]) + 1.5 * (1 - I["skin"]) + 1.5 * (1 - I["eye"]) + 1 * (1 - I["brow"]) + 40 * lm
    I["lm"] = lm
    return loss, I


def evaluate(ws, zs):
    out = [None] * len(zs)
    queue = list(range(len(zs)))
    busy = {}
    for w in ws:
        if queue:
            j = queue.pop(0); w.send(params(zs[j])); busy[w.i] = j
    while busy:
        for w in ws:
            if w.i in busy:
                res = w.recv()
                j = busy.pop(w.i)
                L, I = score(res)
                out[j] = (L + 0.003 * float(zs[j] @ zs[j]), I)
                # copy this render aside so the best one can be kept
                if "png" in res:
                    os.replace(res["png"], os.path.join(OUT, f"c{j}.png"))
                if queue:
                    k = queue.pop(0); w.send(params(zs[k])); busy[w.i] = k
    return out


# ---- CMA-ES (Hansen's standard update, in the normalised space)
n = len(KEYS)
lam = 20
mu = lam // 2
wts = np.log(mu + 0.5) - np.log(np.arange(1, mu + 1)); wts /= wts.sum()
mueff = 1 / (wts ** 2).sum()
cc = (4 + mueff / n) / (n + 4 + 2 * mueff / n)
cs = (mueff + 2) / (n + mueff + 5)
c1 = 2 / ((n + 1.3) ** 2 + mueff)
cmu = min(1 - c1, 2 * (mueff - 2 + 1 / mueff) / ((n + 2) ** 2 + mueff))
damps = 1 + 2 * max(0, math.sqrt((mueff - 1) / (n + 1)) - 1) + cs
chiN = math.sqrt(n) * (1 - 1 / (4 * n) + 1 / (21 * n * n))
m = np.zeros(n); sigma = SIGMA0
pc = np.zeros(n); ps = np.zeros(n); C = np.eye(n); B = np.eye(n); Dd = np.ones(n)
ws = [Worker(i) for i in range(NW)]
best = (1e9, None, None)
log = open(os.path.join(OUT, "log.txt"), "a")
t0 = time.time()
for gen in range(GENS):
    zs = [m + sigma * (B @ (Dd * np.random.randn(n))) for _ in range(lam)]
    res = evaluate(ws, zs)
    order = np.argsort([r[0] for r in res])
    if res[order[0]][0] < best[0]:
        best = (res[order[0]][0], zs[order[0]].copy(), res[order[0]][1])
        os.replace(os.path.join(OUT, f"c{order[0]}.png"), os.path.join(OUT, "best.png"))
        json.dump(params(best[1]), open(os.path.join(OUT, "best.json"), "w"), indent=1)
    old = m.copy()
    m = sum(wts[i] * zs[order[i]] for i in range(mu))
    y = (m - old) / sigma
    Cinvsqrt = B @ np.diag(1 / Dd) @ B.T
    ps = (1 - cs) * ps + math.sqrt(cs * (2 - cs) * mueff) * (Cinvsqrt @ y)
    hsig = np.linalg.norm(ps) / math.sqrt(1 - (1 - cs) ** (2 * (gen + 1))) / chiN < 1.4 + 2 / (n + 1)
    pc = (1 - cc) * pc + hsig * math.sqrt(cc * (2 - cc) * mueff) * y
    artmp = np.array([(zs[order[i]] - old) / sigma for i in range(mu)])
    C = (1 - c1 - cmu) * C + c1 * (np.outer(pc, pc) + (1 - hsig) * cc * (2 - cc) * C) + cmu * (artmp.T @ np.diag(wts) @ artmp)
    sigma *= math.exp((cs / damps) * (np.linalg.norm(ps) / chiN - 1))
    C = np.triu(C) + np.triu(C, 1).T
    Dd2, B = np.linalg.eigh(C)
    Dd = np.sqrt(np.maximum(Dd2, 1e-12))
    I = best[2]
    msg = f"gen {gen} best {best[0]:.4f} fg {I['fg']:.3f} hair {I['hair']:.3f} skin {I['skin']:.3f} eye {I['eye']:.3f} brow {I['brow']:.3f} lm {I['lm']:.4f} photo {I['photo']:.4f} sigma {sigma:.3f} t {time.time()-t0:.0f}s"
    print(msg, flush=True); log.write(msg + "\n"); log.flush()
for w in ws:
    w.p.stdin.close()
