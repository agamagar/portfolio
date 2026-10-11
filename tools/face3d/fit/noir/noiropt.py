# CMA-ES fit of the noir camera and fedora to the noir tile's part masks (the head's form is
# the fitted clay one, fixed). N Blender workers (noirworker.py).
#   python3 noiropt.py RUN_NAME [GENERATIONS] [START_JSON]
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
SIGMA0 = float(os.environ.get("FIT_SIGMA", "0.8"))
NW = int(os.environ.get("FIT_NW", "8"))
CLAYP = os.path.join(HERE, "base", "fit_params.json")
CLAY = json.load(open(CLAYP))
sys.path.insert(0, HERE)
from noirhat import HAT_DEFAULTS

ref = np.load(os.path.join(HERE, "ref_parts.npy"))
Hh, Ww = ref.shape
IGN = ref == 6  # the coat covers these: no score either way
REFM = {k: (ref == v) for k, v in (("skin", 1), ("hair", 2), ("eye", 3), ("brow", 4), ("hat", 5))}
REFM["fg"] = (ref > 0) & (ref < 6)
# landmarks in the tile (382 x 408), normalised
RW, RH = 382, 408
LM = {"EyeL": (184 / RW, 207 / RH), "EyeR": (273 / RW, 190 / RH), "nose": (262 / RW, 243 / RH),
      "mL": (208 / RW, 281 / RH), "mR": (250 / RW, 299 / RH), "ear": (72 / RW, 232 / RH)}

STEP = dict(
    cam_yaw=4, cam_pitch=4, cam_roll=4, cam_dist=0.5, cam_tz=0.15, cam_tx=0.1, cam_sx=0.04, cam_sy=0.04,
    hz=0.08, hrx=0.1, hry=0.1, hh=0.12, htaper=0.05, hdent=0.04, hpinch=0.05, htop=0.04,
    bw=0.12, bcurl=0.05, bdip=0.05, bfront=0.2, bside=0.25, hbulge=0.1,
    hrx_deg=6, hry_deg=6, hrz_deg=6, hox=0.1, hoy=0.1, hoz=0.1, hs=0.08,
)
KEYS = list(STEP)
D = dict(CLAY); D.update(HAT_DEFAULTS); D.update(START)
X0 = np.array([D[k] for k in KEYS], float)
SIG = np.array([STEP[k] for k in KEYS], float)


def params(z):
    return {k: float(v) for k, v in zip(KEYS, X0 + SIG * z)}


class Worker:
    def __init__(self, i):
        self.i = i
        self.p = subprocess.Popen([BLENDER, "-b", os.path.join(HERE, "base", "face.blend"), "-P", os.path.join(HERE, "noirworker.py"), "--",
                                   OUT, str(i), str(Ww), str(Hh), CLAYP],
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
    a, b = a & ~IGN, b & ~IGN
    u = (a | b).sum()
    return (a & b).sum() / u if u else 1.0


def score(res):
    if "error" in res:
        return 9.0, {}
    A = np.asarray(Image.open(res["png"]).convert("RGBA")).astype(int)
    fg = A[..., 3] > 128
    r, g, b = A[..., 0] > 128, A[..., 1] > 128, A[..., 2] > 128
    M = {"fg": fg, "skin": fg & r & ~g & ~b, "hair": fg & g & ~r & ~b, "eye": fg & b & ~r & ~g, "brow": fg & r & g & ~b,
         "hat": fg & r & b & ~g}
    I = {k: iou(M[k], REFM[k]) for k in M}
    lm = 0.0
    for k, (x, y) in LM.items():
        if k in res["marks"]:
            mx, my = res["marks"][k]
            lm += (mx - x) ** 2 + (my - y) ** 2
    I["photo"] = 0.0
    loss = 3 * (1 - I["fg"]) + 2.5 * (1 - I["hat"]) + 1 * (1 - I["hair"]) + 1.5 * (1 - I["skin"]) + 1.5 * (1 - I["eye"]) + 1 * (1 - I["brow"]) + 40 * lm
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
    msg = f"gen {gen} best {best[0]:.4f} fg {I['fg']:.3f} hair {I['hair']:.3f} skin {I['skin']:.3f} eye {I['eye']:.3f} brow {I['brow']:.3f} hat {I['hat']:.3f} lm {I['lm']:.4f} photo {I['photo']:.4f} sigma {sigma:.3f} t {time.time()-t0:.0f}s"
    print(msg, flush=True); log.write(msg + "\n"); log.flush()
for w in ws:
    w.p.stdin.close()
