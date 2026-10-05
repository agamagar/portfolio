#!/usr/bin/env python3
"""compare.py: score a render against a reference photo for the window-light tuning loop.

    python3 tools/window-light/compare.py RENDER.png REF.png [--regions R.json] [--fit auto|stretch|crop]
                                          [--out PREFIX] [--draw-regions] [--quiet]

Writes PREFIX.json (metrics) and PREFIX.png (reference | render | signed luminance difference |
edge overlay, labelled, with a metrics footer). PREFIX defaults to RENDER minus .png plus
".vs-<ref stem>". Prints one summary line. Dependencies: numpy, PIL, skimage (nothing else).

Both images are treated as sRGB (8 bit). The render is resized to the reference size with
Lanczos. If the aspect ratios differ by more than 1 percent, --fit auto centre-crops the render
to the reference aspect first (right when the render keeps the reference's vertical FOV on a
wider page); --fit stretch resizes regardless.

Metrics (all computed on the reference-sized pair):
  ssim            SSIM of CIE L*/100 at 400 px wide (Gaussian window, sigma 1.5). 1 = identical.
  edges           Canny on L*/100 at 800 px wide (sigma 2, hysteresis at the 85th/95th gradient
                  percentiles so exposure does not move the edge set), each map dilated 2 px.
                  iou = |A ∩ B| / |A ∪ B| of the dilated maps; precision = render edges that land
                  on a dilated reference edge; recall = reference edges covered by a dilated
                  render edge. Scores geometry: bars, rails, stiles, the monitor.
  grid            8 x 6 cells. Per cell mean LINEAR RGB. log_lum_rmse_stops = RMSE of
                  log2(Y_render / Y_ref) over cells (Y floor 1e-3). mean_de2000 = mean CIEDE2000
                  between the cell means. Both per-cell tables are in the JSON (rows top to bottom).
  histogram       Earth mover's distance between the L* histograms (200 bins over 0..100), in L*.
  regions         per named polygon region: mean linear luminance of each image, ratio
                  render/ref and the same in stops, Lab chroma C* and hue h of the region means,
                  dC, dh (degrees, render minus ref; unreliable when both C* < 5), the chromatic
                  distance d_ab = sqrt(da^2 + db^2), CIEDE2000 of the means, and the fraction of
                  clipped pixels (max channel >= 250) in each.

Composite score (0..100, higher is better; weights sum to 1):
  0.25 * ssim                        (clamped to 0..1)
  0.20 * edges.iou                   (raw IoU; a perfect-geometry render still differs in texture,
                                      so the practical ceiling is well under 1)
  0.20 * 0.5 ** grid.log_lum_rmse_stops        (1 stop RMSE halves it)
  0.10 * 0.5 ** (grid.mean_de2000 / 10)        (10 dE halves it)
  0.10 * 0.5 ** (histogram.emd_lstar / 10)     (10 L* halves it)
  0.15 * mean over regions of 0.5 ** |stops| * 0.5 ** (d_ab / 10)
Compare composites between renders of the same shot; do not read them as absolute grades.
If no regions file is found the region weight is spread over the other terms pro rata.
"""
import argparse
import json
import math
import os
import sys
import time

import numpy as np
from PIL import Image, ImageDraw
from skimage.color import deltaE_ciede2000, rgb2lab
from skimage.feature import canny
from skimage.metrics import structural_similarity
from skimage.morphology import binary_dilation, disk

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
from regions import draw_regions, find_regions_for, font, load_regions, rasterize  # noqa: E402

WEIGHTS = {"ssim": 0.25, "edges": 0.20, "grid_lum": 0.20, "grid_color": 0.10, "histogram": 0.10, "regions": 0.15}
GRID = (8, 6)  # columns, rows
Y_FLOOR = 1e-3

# RdBu diverging anchors (ColorBrewer, 11 class), blue = render darker, red = render brighter.
RDBU = np.array([
    (5, 48, 97), (33, 102, 172), (67, 147, 195), (146, 197, 222), (209, 229, 240), (247, 247, 247),
    (253, 219, 199), (244, 165, 130), (214, 96, 77), (178, 24, 43), (103, 0, 31)], np.float32) / 255.0


def srgb_to_linear(c):
    return np.where(c <= 0.04045, c / 12.92, ((c + 0.055) / 1.055) ** 2.4)


def linear_to_srgb(c):
    c = np.clip(c, 0, 1)
    return np.where(c <= 0.0031308, c * 12.92, 1.055 * np.power(c, 1 / 2.4) - 0.055)


def lum(lin):
    return 0.2126 * lin[..., 0] + 0.7152 * lin[..., 1] + 0.0722 * lin[..., 2]


def to_float(img):
    return np.asarray(img.convert("RGB")).astype(np.float32) / 255.0


def resized(img, w):
    h = max(1, round(w * img.height / img.width))
    return img.resize((w, h), Image.LANCZOS)


def fit_render(render, ref, mode):
    notes = []
    ra, fa = render.width / render.height, ref.width / ref.height
    if mode == "crop" or (mode == "auto" and abs(ra / fa - 1) > 0.01):
        if ra > fa:  # render wider: crop sides
            nw = round(render.height * fa)
            x0 = (render.width - nw) // 2
            render = render.crop((x0, 0, x0 + nw, render.height))
        elif ra < fa:  # render taller: crop top and bottom
            nh = round(render.width / fa)
            y0 = (render.height - nh) // 2
            render = render.crop((0, y0, render.width, y0 + nh))
        notes.append(f"render aspect {ra:.4f} != reference {fa:.4f}: centre-cropped to {render.width}x{render.height}")
    elif abs(ra / fa - 1) > 0.01:
        notes.append(f"render aspect {ra:.4f} != reference {fa:.4f}: stretched (--fit stretch)")
    if render.size != ref.size:
        render = render.resize(ref.size, Image.LANCZOS)
    return render, notes


def lstar(img_float):
    return rgb2lab(img_float)[..., 0] / 100.0


def metric_ssim(ren, ref):
    a, b = lstar(to_float(resized(ref, 400))), lstar(to_float(resized(ren, 400)))
    return float(structural_similarity(a, b, data_range=1.0, gaussian_weights=True, sigma=1.5,
                                       use_sample_covariance=False))


def edge_map(img):
    l = lstar(to_float(resized(img, 800)))
    return canny(l, sigma=2.0, low_threshold=0.85, high_threshold=0.95, use_quantiles=True)


def metric_edges(ren, ref):
    ea, eb = edge_map(ref), edge_map(ren)
    fp = disk(2)
    da, db = binary_dilation(ea, fp), binary_dilation(eb, fp)
    inter, union = np.logical_and(da, db).sum(), np.logical_or(da, db).sum()
    iou = float(inter / union) if union else 0.0
    precision = float((eb & da).sum() / eb.sum()) if eb.sum() else 0.0
    recall = float((ea & db).sum() / ea.sum()) if ea.sum() else 0.0
    f1 = 2 * precision * recall / (precision + recall) if precision + recall else 0.0
    return {"iou": iou, "precision": precision, "recall": recall, "f1": f1,
            "ref_edge_px": int(ea.sum()), "render_edge_px": int(eb.sum())}, ea, eb


def cell_means(lin, cols, rows):
    h, w, _ = lin.shape
    out = np.zeros((rows, cols, 3), np.float64)
    for r in range(rows):
        for c in range(cols):
            y0, y1 = r * h // rows, (r + 1) * h // rows
            x0, x1 = c * w // cols, (c + 1) * w // cols
            out[r, c] = lin[y0:y1, x0:x1].reshape(-1, 3).mean(0)
    return out


def lab_of_linear(rgb_lin):
    arr = np.asarray(rgb_lin, np.float64).reshape(-1, 1, 3)
    return rgb2lab(linear_to_srgb(arr)).reshape(np.shape(rgb_lin))


def metric_grid(lin_ren, lin_ref):
    cols, rows = GRID
    mr, mf = cell_means(lin_ren, cols, rows), cell_means(lin_ref, cols, rows)
    yr, yf = lum(mr), lum(mf)
    stops = np.log2(np.maximum(yr, Y_FLOOR)) - np.log2(np.maximum(yf, Y_FLOOR))
    de = deltaE_ciede2000(lab_of_linear(mf), lab_of_linear(mr))
    return {
        "cols": cols, "rows": rows,
        "log_lum_rmse_stops": float(np.sqrt(np.mean(stops ** 2))),
        "mean_de2000": float(de.mean()),
        "max_de2000": float(de.max()),
        "cell_stops": np.round(stops, 3).tolist(),
        "cell_de2000": np.round(de, 2).tolist(),
    }


def metric_hist(ren, ref):
    a, b = lstar(to_float(resized(ref, 400))) * 100, lstar(to_float(resized(ren, 400))) * 100
    bins = np.linspace(0, 100, 201)
    ha, _ = np.histogram(np.clip(a, 0, 100), bins=bins)
    hb, _ = np.histogram(np.clip(b, 0, 100), bins=bins)
    ca, cb = np.cumsum(ha) / ha.sum(), np.cumsum(hb) / hb.sum()
    return {"emd_lstar": float(np.sum(np.abs(ca - cb)) * (bins[1] - bins[0])),
            "ref_mean_lstar": float(a.mean()), "render_mean_lstar": float(b.mean())}


def metric_regions(lin_ren, lin_ref, u8_ren, u8_ref, rdata):
    h, w, _ = lin_ref.shape
    masks = rasterize(rdata, w, h)
    out = {}
    for name, m in masks.items():
        n = int(m.sum())
        if n == 0:
            out[name] = {"pixels": 0}
            continue
        mr, mf = lin_ren[m].mean(0), lin_ref[m].mean(0)
        yr, yf = float(lum(mr)), float(lum(mf))
        labr, labf = lab_of_linear(mr), lab_of_linear(mf)
        cr, cf = float(math.hypot(labr[1], labr[2])), float(math.hypot(labf[1], labf[2]))
        hr, hf = math.degrees(math.atan2(labr[2], labr[1])) % 360, math.degrees(math.atan2(labf[2], labf[1])) % 360
        dh = (hr - hf + 180) % 360 - 180
        ratio = yr / max(yf, 1e-9)
        stops = math.log2(max(yr, Y_FLOOR) / max(yf, Y_FLOOR))
        d_ab = float(math.hypot(labr[1] - labf[1], labr[2] - labf[2]))
        de = float(deltaE_ciede2000(labf.reshape(1, 3), labr.reshape(1, 3))[0])
        out[name] = {
            "pixels": n,
            "ref_Y": round(yf, 5), "render_Y": round(yr, 5),
            "lum_ratio": round(ratio, 4), "stops": round(stops, 3),
            "ref_L": round(float(labf[0]), 2), "render_L": round(float(labr[0]), 2),
            "ref_C": round(cf, 2), "render_C": round(cr, 2), "dC": round(cr - cf, 2),
            "ref_h": round(hf, 1), "render_h": round(hr, 1), "dh_deg": round(dh, 1),
            "hue_reliable": bool(max(cr, cf) >= 5),
            "d_ab": round(d_ab, 2), "de2000": round(de, 2),
            "ref_clip_frac": round(float((u8_ref[m].max(1) >= 250).mean()), 4),
            "render_clip_frac": round(float((u8_ren[m].max(1) >= 250).mean()), 4),
            "score": round(0.5 ** abs(stops) * 0.5 ** (d_ab / 10), 4),
        }
    return out


def composite(m):
    parts = {
        "ssim": max(0.0, min(1.0, m["ssim"])),
        "edges": m["edges"]["iou"],
        "grid_lum": 0.5 ** m["grid"]["log_lum_rmse_stops"],
        "grid_color": 0.5 ** (m["grid"]["mean_de2000"] / 10),
        "histogram": 0.5 ** (m["histogram"]["emd_lstar"] / 10),
    }
    regs = [r["score"] for r in (m.get("regions") or {}).values() if r.get("pixels")]
    weights = dict(WEIGHTS)
    if regs:
        parts["regions"] = float(np.mean(regs))
    else:
        rest = sum(v for k, v in weights.items() if k != "regions")
        weights = {k: v / rest for k, v in weights.items() if k != "regions"}
    score = 100 * sum(weights[k] * parts[k] for k in weights)
    return round(score, 2), {k: round(v, 4) for k, v in parts.items()}, weights


# ---------------------------------------------------------------- side-by-side image

def diverging(t):
    """t in [-1, 1] -> RGB via RdBu anchors."""
    x = (np.clip(t, -1, 1) + 1) / 2 * (len(RDBU) - 1)
    i = np.clip(np.floor(x).astype(int), 0, len(RDBU) - 2)
    f = (x - i)[..., None]
    return RDBU[i] * (1 - f) + RDBU[i + 1] * f


def panel_diff(ren, ref, pw, ph, span=3.0):
    a = lum(srgb_to_linear(to_float(ref.resize((pw, ph), Image.BOX))))
    b = lum(srgb_to_linear(to_float(ren.resize((pw, ph), Image.BOX))))
    stops = np.log2(np.maximum(b, Y_FLOOR)) - np.log2(np.maximum(a, Y_FLOOR))
    return Image.fromarray((diverging(stops / span) * 255).astype(np.uint8))


def panel_edges(ref, ea, eb, pw, ph):
    # Base: the reference's luminance at 25 percent. Brightest possible base is #404040
    # (relative luminance 0.051); against it magenta #ff00ff measures 3.3:1, green #00ff00
    # 7.6:1, white 10.4:1, so every edge colour clears the 3:1 non-text floor.
    base = np.asarray(ref.convert("L").resize((pw, ph), Image.BOX)).astype(np.float32) * 0.25
    rgb = np.repeat(base[..., None], 3, axis=2)

    def down(e):
        im = Image.fromarray((e * 255).astype(np.uint8)).resize((pw, ph), Image.BOX)
        return np.asarray(im) > 40

    a, b = down(ea), down(eb)
    rgb[a & np.logical_not(b)] = (255, 0, 255)
    rgb[b & np.logical_not(a)] = (0, 255, 0)
    rgb[a & b] = (255, 255, 255)
    return Image.fromarray(rgb.astype(np.uint8))


def side_by_side(ren, ref, ea, eb, metrics, out_png, rdata=None, draw_regs=False, title=""):
    pw = 480
    ph = round(pw * ref.height / ref.width)
    ref_p = ref.resize((pw, ph), Image.LANCZOS)
    ren_p = ren.resize((pw, ph), Image.LANCZOS)
    if draw_regs and rdata:
        ref_p = draw_regions(ref_p, rdata, alpha=0.0, outline=1, labels=False)
        ren_p = draw_regions(ren_p, rdata, alpha=0.0, outline=1, labels=False)
    panels = [
        ("reference", ref_p),
        ("render", ren_p),
        ("luminance, render vs ref (stops)", panel_diff(ren, ref, pw, ph)),
        ("edges: ref magenta, render green, both white", panel_edges(ref, ea, eb, pw, ph)),
    ]
    gap, head = 6, 26
    regs = metrics.get("regions") or {}
    reg_lines = [f"{k}: {v['lum_ratio']:.2f}x ({v['stops']:+.2f} st)  d_ab {v['d_ab']:.1f}  dE {v['de2000']:.1f}"
                 for k, v in regs.items() if v.get("pixels")]
    ncol = 3
    reg_rows = (len(reg_lines) + ncol - 1) // ncol
    foot = 30 + 18 + 16 * reg_rows + 22
    W = 4 * pw + 5 * gap
    H = head + ph + gap + foot
    # Background #111111; all label text is #ffffff (18.9:1) or #b8b8b8 (9.5:1).
    canvas = Image.new("RGB", (W, H), (17, 17, 17))
    d = ImageDraw.Draw(canvas)
    f, fs = font(14), font(12)
    for i, (label, im) in enumerate(panels):
        x = gap + i * (pw + gap)
        canvas.paste(im, (x, head))
        d.text((x, 6), label, fill=(255, 255, 255), font=f)
    # legend bar for the diff panel
    lx, ly = gap + 2 * (pw + gap), head + ph + 4
    bar = diverging(np.linspace(-1, 1, pw)[None, :].repeat(8, 0))
    canvas.paste(Image.fromarray((bar * 255).astype(np.uint8)), (lx, ly))
    for t, s in ((0, "-3 darker"), (pw // 2, "0"), (pw, "+3 brighter")):
        anchor = "la" if t == 0 else ("ma" if t == pw // 2 else "ra")
        d.text((lx + t, ly + 10), s, fill=(184, 184, 184), font=fs, anchor=anchor)
    y = head + ph + gap + 30
    e, g, hst = metrics["edges"], metrics["grid"], metrics["histogram"]
    line = (f"{title}  composite {metrics['composite']:.1f}   SSIM {metrics['ssim']:.3f}   edge IoU {e['iou']:.3f} "
            f"(P {e['precision']:.2f} R {e['recall']:.2f})   grid log-lum RMSE {g['log_lum_rmse_stops']:.2f} st   "
            f"grid dE2000 {g['mean_de2000']:.1f}   hist EMD {hst['emd_lstar']:.1f} L*")
    d.text((gap, y), line.strip(), fill=(255, 255, 255), font=f)
    y += 22
    cw = (W - 2 * gap) // ncol
    for i, s in enumerate(reg_lines):
        d.text((gap + (i // reg_rows) * cw if reg_rows else gap, y + (i % reg_rows) * 16), s,
               fill=(184, 184, 184), font=fs)
    canvas.save(out_png)


def main():
    ap = argparse.ArgumentParser(description="Score a render against a reference photo.")
    ap.add_argument("render")
    ap.add_argument("ref")
    ap.add_argument("--regions", help="regions JSON (default: the regions_*.json beside REF that lists it)")
    ap.add_argument("--no-regions", action="store_true", help="skip region stats")
    ap.add_argument("--fit", choices=["auto", "stretch", "crop"], default="auto")
    ap.add_argument("--out", help="output prefix (writes PREFIX.json and PREFIX.png)")
    ap.add_argument("--draw-regions", action="store_true", help="outline the regions on both photo panels")
    ap.add_argument("--no-png", action="store_true", help="metrics only, no side-by-side image")
    ap.add_argument("--quiet", action="store_true")
    a = ap.parse_args()

    t0 = time.time()
    ref = Image.open(a.ref).convert("RGB")
    ren0 = Image.open(a.render)
    notes = []
    if ren0.mode not in ("RGB", "RGBA"):
        notes.append(f"render mode {ren0.mode} converted to RGB")
    if ren0.mode == "RGBA" and np.asarray(ren0)[..., 3].min() < 255:
        notes.append("render has transparent pixels; alpha dropped (composited over black would differ)")
    ren_raw_size = ren0.size
    ren, fit_notes = fit_render(ren0.convert("RGB"), ref, a.fit)
    notes += fit_notes

    u8_ref, u8_ren = np.asarray(ref), np.asarray(ren)
    lin_ref, lin_ren = srgb_to_linear(u8_ref / 255.0), srgb_to_linear(u8_ren / 255.0)

    m = {"render": os.path.abspath(a.render), "ref": os.path.abspath(a.ref),
         "render_size": list(ren_raw_size), "compared_at": list(ref.size), "fit": a.fit, "notes": notes}
    m["ssim"] = metric_ssim(ren, ref)
    m["edges"], ea, eb = metric_edges(ren, ref)
    m["grid"] = metric_grid(lin_ren, lin_ref)
    m["histogram"] = metric_hist(ren, ref)

    rpath, rdata = None, None
    if not a.no_regions:
        rpath = a.regions or find_regions_for(a.ref)
        if rpath:
            rdata = load_regions(rpath)
            m["regions"] = metric_regions(lin_ren, lin_ref, u8_ren, u8_ref, rdata)
    m["regions_file"] = os.path.abspath(rpath) if rpath else None
    m["composite"], m["subscores"], m["weights"] = composite(m)
    m["seconds"] = round(time.time() - t0, 2)

    prefix = a.out or (os.path.splitext(a.render)[0] + ".vs-" + os.path.splitext(os.path.basename(a.ref))[0])
    os.makedirs(os.path.dirname(os.path.abspath(prefix)), exist_ok=True)
    with open(prefix + ".json", "w") as f:
        json.dump(m, f, indent=1)
    if not a.no_png:
        title = os.path.basename(a.render)
        side_by_side(ren, ref, ea, eb, m, prefix + ".png", rdata, a.draw_regions, title)
    if not a.quiet:
        e, g = m["edges"], m["grid"]
        print(f"composite {m['composite']:.1f}  ssim {m['ssim']:.3f}  edgeIoU {e['iou']:.3f}  "
              f"gridRMSE {g['log_lum_rmse_stops']:.2f}st  gridDE {g['mean_de2000']:.1f}  "
              f"emd {m['histogram']['emd_lstar']:.1f}  regions {len(m.get('regions') or {})}  -> {prefix}.json"
              + ("" if a.no_png else f", {prefix}.png"))
        for n in notes:
            print("note:", n)


if __name__ == "__main__":
    main()
