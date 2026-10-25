#!/usr/bin/env python3
"""Figure images: their sizes, and WebP copies with no visible loss (stack-audit pick 2, 25 Oct 2026).

  python3 tools/figure-images.py dims public/figures/scheduled public/figures/frames ...
      Writes src/ui/imgDims.json: {"/figures/...": [width, height]} for every raster image under the folders.
      src/ui/Img.jsx sets them as width / height, so the page reserves each image's space before it loads.

  python3 tools/figure-images.py webp sizes.json [--jobs 3] [--report out.json]
      sizes.json: {"/figures/...png": {"1280": css px wide, "375": css px wide}, ...}, the widths the page shows each
      image at. For each PNG / JPG, tries lossless WebP, then lossy at quality 92 and 96, and keeps the smallest copy
      that passes the fidelity check at every shown size (in device pixels: 2x at 1280, 3x at 375) and at full size
      (the lightbox). A copy that isn't 10% smaller than the original isn't written. Writes x.webp beside x.png and the
      converted list to src/ui/imgWebp.json, which Img.jsx reads. The report also sizes an AVIF copy (4:4:4) for each,
      for reference only: the site serves WebP alone (no <picture>).

Needs Pillow (with WebP, and AVIF for the report) and numpy.
"""
import io, json, os, sys
from multiprocessing import Pool

import numpy as np
from PIL import Image

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PUBLIC = os.path.join(ROOT, "public")
UI = os.path.join(ROOT, "src", "ui")
RASTER = (".png", ".jpg", ".jpeg", ".webp", ".gif")

# "no visible difference": at the sizes the page shows (mean and 99.9th-percentile channel error out of 255, PSNR),
# and a little looser at full size, where only the lightbox shows it
SHOWN = dict(mean=0.6, p999=8, psnr=44)
FULL = dict(mean=1.0, p999=12, psnr=40)
DPR = {"1280": 2, "375": 3}


def write_manifest(path, data):
    """One entry per line, so a diff shows exactly which images changed."""
    with open(path, "w") as fh:
        fh.write("{\n" + ",\n".join(f"{json.dumps(k)}:{json.dumps(v, separators=(',', ':'))}" for k, v in sorted(data.items())) + "\n}\n")


def dims(folders):
    out = {}
    for folder in folders:
        for dp, _, files in os.walk(os.path.join(ROOT, folder)):
            for f in sorted(files):
                if not f.lower().endswith(RASTER):
                    continue
                p = os.path.join(dp, f)
                try:
                    with Image.open(p) as im:
                        out["/" + os.path.relpath(p, PUBLIC)] = list(im.size)
                except OSError:
                    print("  not an image, skipped:", os.path.relpath(p, ROOT))
    write_manifest(os.path.join(UI, "imgDims.json"), out)
    print(f"imgDims.json: {len(out)} images")


def rgba(im):
    if im.mode in ("RGBA", "LA") or (im.mode == "P" and "transparency" in im.info):
        return im.convert("RGBA")
    return im.convert("RGB")


def planes(im):
    """The image over white and over black, as float arrays, so alpha differences count too."""
    a = np.asarray(im.convert("RGBA"), dtype=np.float32)
    al = a[..., 3:4] / 255.0
    return a[..., :3] * al + 255.0 * (1 - al), a[..., :3] * al


def metrics(a, b, width):
    w, h = a.size
    if width < w:
        size = (int(width), max(1, round(h * width / w)))
        a, b = a.resize(size, Image.LANCZOS), b.resize(size, Image.LANCZOS)
    worst = dict(mean=0.0, p999=0.0, psnr=99.0)
    for pa, pb in zip(planes(a), planes(b)):
        d = np.abs(pa - pb)
        mse = float((d ** 2).mean())
        worst["mean"] = max(worst["mean"], float(d.mean()))
        worst["p999"] = max(worst["p999"], float(np.percentile(d, 99.9)))
        worst["psnr"] = min(worst["psnr"], 99.0 if mse == 0 else 10 * np.log10(255 ** 2 / mse))
    return worst


def passes(m, t):
    return m["mean"] <= t["mean"] and m["p999"] <= t["p999"] and m["psnr"] >= t["psnr"]


def encode(im, fmt, **kw):
    buf = io.BytesIO()
    im.save(buf, fmt, **kw)
    return buf.getvalue()


def convert(job):
    path, shown = job
    src = os.path.join(PUBLIC, path.lstrip("/"))
    size0 = os.path.getsize(src)
    with Image.open(src) as im0:
        im = rgba(im0)
    widths = [(k, min(im.size[0], round(v * DPR.get(k, 2)))) for k, v in shown.items() if v]
    alpha = im.mode == "RGBA"
    cands = [("lossless", dict(lossless=True, quality=90, method=6))]
    for q in (92, 96):
        cands.append((f"q{q}", dict(quality=q, method=6, **({"alpha_quality": 100} if alpha else {}))))
    rep = dict(path=path, bytes=size0, size=list(im.size), tried=[])
    best = None
    for name, kw in cands:
        data = encode(im, "WEBP", **kw)
        with Image.open(io.BytesIO(data)) as d:
            dec = rgba(d)
        ms = {k: metrics(im, dec, w) for k, w in widths}
        ms["full"] = metrics(im, dec, im.size[0])
        ok = all(passes(m, SHOWN) for k, m in ms.items() if k != "full") and passes(ms["full"], FULL)
        rep["tried"].append(dict(name=name, bytes=len(data), ok=ok, m={k: {a: round(b, 2) for a, b in m.items()} for k, m in ms.items()}))
        if ok and (best is None or len(data) < best[1]):
            best = (name, len(data), data)
    if best and best[1] <= 0.9 * size0:
        out = os.path.splitext(src)[0] + ".webp"
        if os.path.exists(out):
            rep["skipped"] = "a .webp of that name already exists"
        else:
            with open(out, "wb") as fh:
                fh.write(best[2])
            rep["webp"] = dict(name=best[0], bytes=best[1])
    else:
        rep["kept"] = "no copy passed and saved 10%" if not best else f"best copy saves under 10% ({best[1]} bytes)"
    try:
        av = encode(im, "AVIF", quality=80, subsampling="4:4:4", speed=6)
        with Image.open(io.BytesIO(av)) as d:
            dec = rgba(d)
        ok = all(passes(metrics(im, dec, w), SHOWN) for _, w in widths)
        rep["avif"] = dict(bytes=len(av), ok_shown=ok)
    except Exception as e:  # noqa: BLE001 (report only)
        rep["avif"] = dict(error=str(e))
    return rep


def webp(sizes_file, jobs=3, report=None):
    sizes = json.load(open(sizes_file))
    todo = [(p, v) for p, v in sorted(sizes.items()) if p.lower().endswith((".png", ".jpg", ".jpeg"))]
    with Pool(jobs) as pool:
        reps = pool.map(convert, todo)
    done = {r["path"]: 1 for r in reps if "webp" in r}
    man = os.path.join(UI, "imgWebp.json")
    old = json.load(open(man)) if os.path.exists(man) else {}
    old.update(done)
    write_manifest(man, old)
    before = sum(r["bytes"] for r in reps)
    after = sum(r["webp"]["bytes"] if "webp" in r else r["bytes"] for r in reps)
    avif = sum(r["avif"]["bytes"] if r.get("avif", {}).get("ok_shown") else (r["webp"]["bytes"] if "webp" in r else r["bytes"]) for r in reps)
    print(f"{len(done)} of {len(reps)} converted: {before / 1e6:.2f} MB to {after / 1e6:.2f} MB (AVIF where it passes: {avif / 1e6:.2f} MB)")
    for r in reps:
        if "webp" not in r:
            print("  kept", r["path"], r.get("kept") or r.get("skipped"))
    if report:
        json.dump(reps, open(report, "w"), indent=1)


if __name__ == "__main__":
    cmd, *args = sys.argv[1:]
    if cmd == "dims":
        dims(args)
    elif cmd == "webp":
        opts = dict(jobs=3, report=None)
        rest = []
        it = iter(args)
        for a in it:
            if a == "--jobs":
                opts["jobs"] = int(next(it))
            elif a == "--report":
                opts["report"] = next(it)
            else:
                rest.append(a)
        webp(rest[0], **opts)
    else:
        sys.exit(__doc__)
