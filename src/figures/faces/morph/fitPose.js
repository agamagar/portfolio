// Match first: find the 3D view (yaw, pitch) and the drawing's placement (scale, turn,
// offset) that put the drawing's silhouette, hair and features on the 3D head's. Scored on
// mask overlap (head, hair, ear) and feature centroids (eyes, brows, mouth), at half size.
// Used from the page as window.fitPose (see main.jsx ?fit); the result is written into
// handoff.json by hand.
import * as THREE from "three";
import { createFaceRig, PART_ID } from "./faceRig3D";
import { OUTER, FACE, STROKES, WIDTH, EYES, EYE_R, HAIR_CLIP, EAR_AREA } from "./drawing";

const FW = 802, FH = 862;

export async function makeFitter(scale = 0.5) {
  const w = Math.round(FW * scale), h = Math.round(FH * scale);
  const renderer = new THREE.WebGLRenderer({ antialias: false, alpha: true, preserveDrawingBuffer: true });
  renderer.setPixelRatio(1);
  renderer.setSize(FW, FH);
  const rig = createFaceRig({ W: FW, H: FH });
  await rig.ready;
  const rt = new THREE.WebGLRenderTarget(w, h, { minFilter: THREE.NearestFilter, magFilter: THREE.NearestFilter });
  const buf = new Uint8Array(w * h * 4);
  const ids3 = (p) => {
    rig.pose(p);
    rig.ids(renderer, rt);
    renderer.readRenderTargetPixels(rt, 0, 0, w, h, buf);
    renderer.setRenderTarget(null);
    // flip to image rows (top first)
    const out = new Uint8Array(w * h);
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) out[y * w + x] = buf[((h - 1 - y) * w + x) * 4];
    return out;
  };
  const cv = document.createElement("canvas");
  cv.width = w; cv.height = h;
  const g = cv.getContext("2d", { willReadFrequently: true });
  // draw the drawing's layers into channels: R head, G hair (ink above the hairline), B ear
  const P = (d) => new Path2D(d);
  const paths = { outer: P(OUTER), face: P(FACE), clip: P(HAIR_CLIP), ear: P(EAR_AREA) };
  const setT = (q) => {
    const c = Math.cos(q.th) * q.s * scale, s = Math.sin(q.th) * q.s * scale;
    g.setTransform(c, s, -s, c, q.tx * scale, q.ty * scale);
  };
  const layer = (fn) => {
    g.setTransform(1, 0, 0, 1, 0, 0);
    g.clearRect(0, 0, w, h);
    fn();
    const d = g.getImageData(0, 0, w, h).data;
    const m = new Uint8Array(w * h);
    for (let i = 0; i < m.length; i++) m[i] = d[i * 4 + 3] > 127 ? 1 : 0;
    return m;
  };
  const masks2 = (q) => {
    const head = layer(() => { setT(q); g.fillStyle = "#000"; g.fill(paths.outer); g.fill(paths.ear); });
    const hair = layer(() => { setT(q); g.fillStyle = "#000"; g.save(); g.clip(paths.clip); g.fill(new Path2D(OUTER + FACE), "evenodd"); g.restore(); });
    const ear = layer(() => { setT(q); g.fillStyle = "#000"; g.fill(paths.ear); g.globalCompositeOperation = "destination-out"; g.fill(paths.outer); g.globalCompositeOperation = "source-over"; });
    return { head, hair, ear };
  };
  const toImg = (q, x, y) => [(Math.cos(q.th) * x - Math.sin(q.th) * y) * q.s + q.tx, (Math.sin(q.th) * x + Math.cos(q.th) * y) * q.s + q.ty];
  const strokeMid = (d) => { const p = new Path2D(d); return p; };
  // the 2D features' centres (image px at full size)
  const STROKE_C = {
    browL: [94.9, 99.6], browR: [132.4, 91.9], mouth: [110.5, 151.2],
  };
  const cen = (ids, code) => {
    let sx = 0, sy = 0, n = 0;
    for (let i = 0; i < ids.length; i++) if (ids[i] === code) { sx += i % w; sy += (i / w) | 0; n++; }
    return n ? [sx / n / scale, sy / n / scale] : [NaN, NaN];
  };
  const iou = (a, b) => { let i = 0, u = 0; for (let k = 0; k < a.length; k++) { i += a[k] & b[k]; u += a[k] | b[k]; } return u ? i / u : 0; };
  const score = (p, q, detail = false) => {
    const ids = ids3(p);
    const m2 = masks2(q);
    const head3 = ids.map((v) => (v > 0 ? 1 : 0)), hair3 = ids.map((v) => (v === PART_ID.Hair ? 1 : 0)), ear3 = ids.map((v) => (v === PART_ID.Ear ? 1 : 0));
    const iH = iou(head3, m2.head), iHair = iou(hair3, m2.hair), iEar = iou(ear3, m2.ear);
    const feats = [["EyeL", EYES.eyeL, 3], ["EyeR", EYES.eyeR, 3], ["BrowL", STROKE_C.browL, 1], ["BrowR", STROKE_C.browR, 1], ["Mouth", STROKE_C.mouth, 2]];
    let fe = 0, fw = 0; const fd = {};
    for (const [n, c2, wt] of feats) {
      const c3 = cen(ids, PART_ID[n]);
      const ci = toImg(q, c2[0], c2[1]);
      const d = Math.hypot(c3[0] - ci[0], c3[1] - ci[1]);
      fd[n] = +d.toFixed(1);
      fe += wt * (Number.isFinite(d) ? d : 200); fw += wt;
    }
    fe /= fw; // px at full size
    const loss = (1 - iH) + 0.7 * (1 - iHair) + 0.3 * (1 - iEar) + fe / 60;
    return detail ? { loss, iH, iHair, iEar, fe, fd } : loss;
  };
  return { score, ids3, masks2, w, h, rig, renderer };
}

// Nelder-Mead
export function nelderMead(f, x0, step, iters = 300) {
  const n = x0.length;
  let S = [x0.slice()];
  for (let i = 0; i < n; i++) { const x = x0.slice(); x[i] += step[i]; S.push(x); }
  let F = S.map(f);
  for (let it = 0; it < iters; it++) {
    const o = S.map((_, i) => i).sort((a, b) => F[a] - F[b]);
    S = o.map((i) => S[i]); F = o.map((i) => F[i]);
    const c = Array(n).fill(0);
    for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) c[j] += S[i][j] / n;
    const along = (t) => c.map((v, j) => v + t * (S[n][j] - v));
    const xr = along(-1), fr = f(xr);
    if (fr < F[0]) { const xe = along(-2), fe = f(xe); if (fe < fr) { S[n] = xe; F[n] = fe; } else { S[n] = xr; F[n] = fr; } }
    else if (fr < F[n - 1]) { S[n] = xr; F[n] = fr; }
    else {
      const xc = along(0.5), fc = f(xc);
      if (fc < F[n]) { S[n] = xc; F[n] = fc; }
      else for (let i = 1; i <= n; i++) { S[i] = S[i].map((v, j) => S[0][j] + 0.5 * (v - S[0][j])); F[i] = f(S[i]); }
    }
  }
  const b = F.indexOf(Math.min(...F));
  return { x: S[b], f: F[b] };
}
