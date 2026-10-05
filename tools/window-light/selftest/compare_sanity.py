#!/usr/bin/env python3
"""compare_sanity.py: prove compare.py measures what it claims, on synthetic edits of the reference.

    python3 tools/window-light/selftest/compare_sanity.py [--keep DIR]

Builds degraded copies of ref_1600.png whose right answers are known, runs compare.py on each
and asserts the result. Exits 1 on any failure. Needs only numpy, PIL, skimage.
"""
import json
import os
import subprocess
import sys
import tempfile

import numpy as np
from PIL import Image, ImageFilter

HERE = os.path.dirname(os.path.abspath(__file__))
TOOL = os.path.dirname(HERE)
REF = os.path.join(TOOL, "ref", "ref_1600.png")
COMPARE = os.path.join(TOOL, "compare.py")


def enc(lin):
    lin = np.clip(lin, 0, 1)
    return (np.where(lin <= 0.0031308, lin * 12.92, 1.055 * lin ** (1 / 2.4) - 0.055) * 255 + 0.5).astype(np.uint8)


def main():
    keep = sys.argv[2] if len(sys.argv) > 2 and sys.argv[1] == "--keep" else None
    out = keep or tempfile.mkdtemp(prefix="wl-compare-sanity-")
    os.makedirs(out, exist_ok=True)
    ref = Image.open(REF).convert("RGB")
    a = np.asarray(ref).astype(np.float32) / 255
    lin = np.where(a <= 0.04045, a / 12.92, ((a + 0.055) / 1.055) ** 2.4)
    cases = {
        "identity": ref,
        "half-size": ref.resize((800, 600), Image.LANCZOS),
        "minus1stop": Image.fromarray(enc(lin * 0.5)),
        "plus1stop": Image.fromarray(enc(lin * 2.0)),
        "shift20": Image.fromarray(np.roll(np.asarray(ref), 20, axis=1)),
        "blur6": ref.filter(ImageFilter.GaussianBlur(6)),
        "black": Image.new("RGB", ref.size, (0, 0, 0)),
    }
    wide = Image.new("RGB", (1920, 1200), (0, 0, 0))
    wide.paste(ref, (160, 0))
    cases["wide-padded"] = wide

    res = {}
    for name, im in cases.items():
        p = os.path.join(out, f"{name}.png")
        im.save(p)
        subprocess.run([sys.executable, COMPARE, p, REF, "--out", os.path.join(out, name), "--no-png", "--quiet"], check=True)
        res[name] = json.load(open(os.path.join(out, name + ".json")))

    checks = [
        ("identity scores 100", res["identity"]["composite"] == 100.0),
        ("half-size render scores at least 99", res["half-size"]["composite"] >= 99.0),
        ("-1 stop: grid log-lum RMSE is 1.00 +/- 0.03 stops", abs(res["minus1stop"]["grid"]["log_lum_rmse_stops"] - 1.0) < 0.03),
        ("-1 stop: every region ratio is 0.50 +/- 0.03 (dark_object +/- 0.05, near the Y floor)",
         all(abs(v["lum_ratio"] - 0.5) < (0.05 if k == "dark_object_bottom_left" else 0.03)
             for k, v in res["minus1stop"]["regions"].items())),
        ("+1 stop: unclipped regions read 2.0x, clipped glass reads less",
         abs(res["plus1stop"]["regions"]["frame_wood"]["lum_ratio"] - 2.0) < 0.05
         and res["plus1stop"]["regions"]["glass_bright"]["lum_ratio"] < 1.6),
        ("exposure changes keep edge IoU above 0.9", min(res["minus1stop"]["edges"]["iou"], res["plus1stop"]["edges"]["iou"]) > 0.9),
        ("a 20 px shift drops edge IoU below 0.4", res["shift20"]["edges"]["iou"] < 0.4),
        ("blur drops edge IoU but keeps grid luminance within 0.2 stops",
         res["blur6"]["edges"]["iou"] < 0.8 and res["blur6"]["grid"]["log_lum_rmse_stops"] < 0.2),
        ("a black frame scores under 10", res["black"]["composite"] < 10),
        ("a 16:10 render padded around the 4:3 frame is centre-cropped back to 100", res["wide-padded"]["composite"] == 100.0),
    ]
    ok = True
    for label, passed in checks:
        ok &= bool(passed)
        print(("PASS " if passed else "FAIL ") + label)
    print("\n".join(f"  {k:12s} composite {v['composite']:6.1f}  ssim {v['ssim']:.3f}  edgeIoU {v['edges']['iou']:.3f}  "
                    f"gridRMSE {v['grid']['log_lum_rmse_stops']:.2f}  gridDE {v['grid']['mean_de2000']:.1f}"
                    for k, v in res.items()))
    print("outputs in", out)
    sys.exit(0 if ok else 1)


if __name__ == "__main__":
    main()
