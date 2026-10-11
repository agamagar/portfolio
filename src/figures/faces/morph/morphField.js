// The drawing-to-ink morph's fields (2026-10-10). Two inputs:
//   - the drawing, placed in the canvas by the pose fit (pose.s, th, tx, ty)
//   - the head drawn in ink by the renderer at the hand-off pose
// and landmark pairs between them (tools: handoff.json, from geo/landmarks.py).
// Built once in the page:
//   SDF2, SDF3   signed distance (px, + outside) to the drawing's ink and to the 3D ink
//   D, Di        thin-plate-spline displacement, drawing -> ink and ink -> drawing, on a grid
// Per frame the shader warps both fields toward each other and blends them, so every stroke
// slides along one smooth warp (features keep their places relative to each other) and the
// last few pixels are closed by the distance blend (no double lines, no pop).
import * as THREE from "three";
import { OUTER, FACE, STROKES, WIDTH, EYES, EYE_R } from "./drawing";

// ---- thin-plate spline -------------------------------------------------------
const U = (r2) => (r2 < 1e-12 ? 0 : r2 * Math.log(r2) * 0.5); // r^2 log r
function solve(A, b) {
  // Gaussian elimination with partial pivoting (n about 150)
  const n = b.length, M = A.map((r, i) => [...r, b[i]]);
  for (let c = 0; c < n; c++) {
    let p = c;
    for (let r = c + 1; r < n; r++) if (Math.abs(M[r][c]) > Math.abs(M[p][c])) p = r;
    [M[c], M[p]] = [M[p], M[c]];
    for (let r = c + 1; r < n; r++) {
      const f = M[r][c] / M[c][c];
      if (f) for (let k = c; k <= n; k++) M[r][k] -= f * M[c][k];
    }
  }
  const x = new Array(n).fill(0);
  for (let r = n - 1; r >= 0; r--) {
    let s = M[r][n];
    for (let k = r + 1; k < n; k++) s -= M[r][k] * x[k];
    x[r] = s / M[r][r];
  }
  return x;
}
// fit f: a -> b - a (a displacement), with smoothing lambda (px^2 units, scaled)
export function tps(a, b, lambda = 0) {
  const n = a.length, N = n + 3;
  const A = Array.from({ length: N }, () => new Array(N).fill(0));
  const sc = 100; // work in units of 100 px
  const P = a.map(([x, y]) => [x / sc, y / sc]);
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) A[i][j] = U((P[i][0] - P[j][0]) ** 2 + (P[i][1] - P[j][1]) ** 2);
    A[i][i] += lambda;
    A[i][n] = A[n][i] = 1; A[i][n + 1] = A[n + 1][i] = P[i][0]; A[i][n + 2] = A[n + 2][i] = P[i][1];
  }
  const wx = solve(A, [...a.map((p, i) => b[i][0] - p[0]), 0, 0, 0]);
  const wy = solve(A, [...a.map((p, i) => b[i][1] - p[1]), 0, 0, 0]);
  return (x, y) => {
    const X = x / sc, Y = y / sc;
    let dx = wx[n] + wx[n + 1] * X + wx[n + 2] * Y, dy = wy[n] + wy[n + 1] * X + wy[n + 2] * Y;
    for (let i = 0; i < n; i++) { const u = U((X - P[i][0]) ** 2 + (Y - P[i][1]) ** 2); dx += wx[i] * u; dy += wy[i] * u; }
    return [dx, dy];
  };
}

// ---- distance transform (Felzenszwalb and Huttenlocher) ------------------------
function edt1(f, n, d, v, z) {
  let k = 0; v[0] = 0; z[0] = -Infinity; z[1] = Infinity;
  for (let q = 1; q < n; q++) {
    let s = ((f[q] + q * q) - (f[v[k]] + v[k] * v[k])) / (2 * q - 2 * v[k]);
    while (s <= z[k]) { k--; s = ((f[q] + q * q) - (f[v[k]] + v[k] * v[k])) / (2 * q - 2 * v[k]); }
    k++; v[k] = q; z[k] = s; z[k + 1] = Infinity;
  }
  k = 0;
  for (let q = 0; q < n; q++) { while (z[k + 1] < q) k++; d[q] = (q - v[k]) ** 2 + f[v[k]]; }
}
function edt(mask, w, h, inside) {
  // squared distance to the nearest pixel whose mask != inside
  const INF = 1e20, g = new Float64Array(w * h);
  for (let i = 0; i < w * h; i++) g[i] = (mask[i] > 0) === inside ? INF : 0;
  const n = Math.max(w, h), f = new Float64Array(n), d = new Float64Array(n), v = new Int32Array(n), z = new Float64Array(n + 1);
  for (let x = 0; x < w; x++) { for (let y = 0; y < h; y++) f[y] = g[y * w + x]; edt1(f, h, d, v, z); for (let y = 0; y < h; y++) g[y * w + x] = d[y]; }
  for (let y = 0; y < h; y++) { for (let x = 0; x < w; x++) f[x] = g[y * w + x]; edt1(f, w, d, v, z); for (let x = 0; x < w; x++) g[y * w + x] = d[x]; }
  return g;
}
// signed distance from coverage (0..1, one byte per pixel), + outside, in px. The edge sits
// where coverage crosses one half; the anti-aliased coverage moves it by its sub-pixel part.
export function sdf(cov, w, h) {
  const m = new Uint8Array(w * h);
  for (let i = 0; i < m.length; i++) m[i] = cov[i] >= 128 ? 1 : 0;
  const out = edt(m, w, h, false), inn = edt(m, w, h, true);
  const s = new Float32Array(w * h);
  for (let i = 0; i < s.length; i++) {
    const c = cov[i] / 255;
    s[i] = m[i] ? -(Math.sqrt(inn[i]) - 0.5) : Math.sqrt(out[i]) - 0.5;
    // the anti-aliased boundary pixels: put the edge where the coverage says
    if (c > 0.02 && c < 0.98) s[i] = 0.5 - c;
  }
  return s;
}

// ---- the drawing's ink, rasterised where the pose fit put it --------------------
export function drawingCoverage(pose, W, H) {
  const c = document.createElement("canvas");
  c.width = W; c.height = H;
  const g = c.getContext("2d", { willReadFrequently: true });
  const co = Math.cos(pose.th) * pose.s, si = Math.sin(pose.th) * pose.s;
  g.setTransform(co, si, -si, co, pose.tx, pose.ty);
  g.fillStyle = g.strokeStyle = "#000";
  g.fill(new Path2D(OUTER + FACE), "evenodd");
  g.lineCap = "round";
  for (const k in STROKES) { g.lineWidth = WIDTH[k]; g.stroke(new Path2D(STROKES[k])); }
  for (const k in EYES) { g.beginPath(); g.arc(EYES[k][0], EYES[k][1], EYE_R, 0, Math.PI * 2); g.fill(); }
  const d = g.getImageData(0, 0, W, H).data, cov = new Uint8Array(W * H);
  for (let i = 0; i < cov.length; i++) cov[i] = d[i * 4 + 3];
  return cov;
}

// ---- textures ------------------------------------------------------------------
// The data (half floats, rows in GL's bottom-up order) is built apart from the textures, so a
// worker can build it off the main thread (morphWorker.js) and the page only wraps it.
const toHalf = THREE.DataUtils.toHalfFloat;
export function fieldHalf(f, w, h) {
  const a = new Uint16Array(w * h);
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) a[(h - 1 - y) * w + x] = toHalf(Math.max(-60000, Math.min(60000, f[y * w + x])));
  return a;
}
export function fieldTexture(f, w, h) {
  return halfFieldTexture(fieldHalf(f, w, h), w, h);
}
export function halfFieldTexture(a, w, h) {
  const t = new THREE.DataTexture(a, w, h, THREE.RedFormat, THREE.HalfFloatType);
  t.minFilter = t.magFilter = THREE.LinearFilter; t.needsUpdate = true;
  return t;
}
// the displacement on a grid (every `step` px), RG in px
export function warpHalf(fn, W, H, step = 4) {
  const gw = Math.ceil(W / step) + 1, gh = Math.ceil(H / step) + 1;
  const a = new Uint16Array(gw * gh * 2);
  for (let j = 0; j < gh; j++) for (let i = 0; i < gw; i++) {
    const [dx, dy] = fn(i * step, j * step);
    const k = ((gh - 1 - j) * gw + i) * 2;
    a[k] = toHalf(dx); a[k + 1] = toHalf(dy);
  }
  return { a, gw, gh, step };
}
export function warpTexture(fn, W, H, step = 4) {
  return halfWarpTexture(warpHalf(fn, W, H, step));
}
export function halfWarpTexture({ a, gw, gh, step }) {
  const t = new THREE.DataTexture(a, gw, gh, THREE.RGFormat, THREE.HalfFloatType);
  t.minFilter = t.magFilter = THREE.LinearFilter; t.needsUpdate = true;
  t.userData = { gw, gh, step };
  return t;
}

// everything the morph field needs from the two coverages and the landmark pairs, as data:
// the signed distance fields and both warps (about 0.5 s of arithmetic, so run in a worker)
export function buildFields(cov2, cov3, pairs, W, H) {
  const a = pairs.map((p) => p.a), b = pairs.map((p) => p.b);
  return {
    F2: fieldHalf(sdf(cov2, W, H), W, H), F3: fieldHalf(sdf(cov3, W, H), W, H),
    D: warpHalf(tps(a, b, 0.02), W, H), Di: warpHalf(tps(b, a, 0.02), W, H),
  };
}

// the hero's morph only needs the drawing's own field (the lines fade, they no longer warp)
export function drawingField(cov2, W, H) {
  return fieldHalf(sdf(cov2, W, H), W, H);
}
