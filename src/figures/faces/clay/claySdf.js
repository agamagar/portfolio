// The head's signed-distance fields from a params object: skin (head, ears, nose, with the smile groove carved), and hair (cap and swoosh).
import { smin, smax, ssub, sphere, ellipsoid, capsule, cone, rotY } from "./sdf.js";
// a super-ellipsoid by p-norm (m = 2 is an ellipsoid, large m a box): soft blocks without the sharp edges of a box; scaled so the field is ~ distance
const pnorm = (x, y, z, c, r, m) => { const a = Math.abs((x - c[0]) / r[0]), b = Math.abs((y - c[1]) / r[1]), d = Math.abs((z - c[2]) / r[2]); return (Math.pow(Math.pow(a, m) + Math.pow(b, m) + Math.pow(d, m), 1 / m) - 1) * Math.min(r[0], r[1], r[2]); };
export function headCore(P) {
  const H = P.head;
  return (x, y, z) => {
    // the jaw narrows toward the chin: squeeze x with height below the cranium's centre
    const u = Math.min(1, Math.max(0, (H.cranium.c[1] - y) / 1.2)), t = u * u * (3 - 2 * u), xs = x / (1 - H.taper * t);
    const cr = pnorm(xs, y, z, H.cranium.c, H.cranium.r, H.cranium.m), jw = pnorm(xs, y, z, H.jaw.c, H.jaw.r, H.jaw.m);
    let d = smin(cr, jw, H.blend);
    const ck = Math.min(sphere(Math.abs(xs), y, z, H.cheek.x, H.cheek.y, H.cheek.z, H.cheek.r), 9);
    return smin(d, ck, H.cheekBlend);
  };
}
// front surface z at (x, y) of a field, by bisection (used to place the eyes, brows and groove ON the face)
export function surfZ(f, x, y, zHi = 2.2, zLo = 0) { let a = zLo, b = zHi; for (let i = 0; i < 28; i++) { const m = (a + b) / 2; if (f(x, y, m) < 0) a = m; else b = m; } return (a + b) / 2; }
// a torus whose axis is x (the ear lies in the y-z plane), elliptical: radii (ry, rz), tube radius t; `open` removes an arc (angle range in radians about the front-bottom)
function earTorus(py, pz, cy, cz, ry, rz, t, gapA = 0, gapW = 0) {
  const u = (py - cy) / ry, v = (pz - cz) / rz, a = Math.atan2(v, u), q = Math.hypot(u, v) - 1, r = Math.min(ry, rz);
  return { q: q * r, a };
}
export function ear(P, sd) {
  const E = P.ear, a = (sd * E.toeIn * Math.PI) / 180;
  return (x, y, z) => {
    const [px, py, pz] = rotY(x, y, z, -a, sd * E.x, E.z), cx = sd * E.x, ox = (px - cx) * sd;   // ox: depth out from the head (+ outward)
    // the auricle: a thin dish (flattened ellipsoid), its centre bulging out a little
    let d = ellipsoid(px, py, pz, cx, E.y, E.z, E.rx * 0.55, E.ry, E.rz);
    // the helix: a rolled rim all round the dish, standing proud of it
    const t0 = earTorus(py, pz, E.y, E.z, E.ry * 0.92, E.rz * 0.92), helix = Math.hypot(t0.q, ox - E.rx * 0.45) - 0.055 * (0.8 + 0.4 * E.fold);
    d = smin(d, helix, 0.05);
    // the bowl (concha): pressed into the dish inside the rim, leaving the rim and the antihelix standing
    const bowl = ellipsoid(px, py, pz, cx + sd * E.rx * 0.75, E.y - 0.02, E.z + 0.01, E.rx * 0.7, E.ry * 0.6, E.rz * 0.58);
    d = ssub(d, bowl, 0.05 * E.bowl);
    // the antihelix: a Y-shaped ridge inside the bowl: a capsule up and back from the tragus, forking
    const f = E.fold, yf = E.y, zf = E.z, ax = cx + sd * E.rx * 0.5;
    const anti = Math.min(capsule(px, py, pz, ax, yf - E.ry * 0.25, zf + E.rz * 0.3, ax, yf + E.ry * 0.25, zf + E.rz * 0.18, 0.04 * f), capsule(px, py, pz, ax, yf + E.ry * 0.25, zf + E.rz * 0.18, ax, yf + E.ry * 0.5, zf - E.rz * 0.05, 0.035 * f));
    d = smin(d, anti, 0.04);
    // the tragus (a small bump at the front of the canal) and the lobe (soft drop at the bottom)
    d = smin(d, sphere(px, py, pz, ax, yf - E.ry * 0.05, zf + E.rz * 0.45, 0.06 * f), 0.05);
    d = smin(d, ellipsoid(px, py, pz, cx + sd * E.rx * 0.1, E.y - E.ry * 0.9, E.z + E.rz * 0.05, E.rx * 0.7, E.ry * 0.26 * E.lobe, E.rz * 0.42), 0.09);
    return d;
  };
}
export function skinSdf(P) {
  const core = headCore(P), earL = ear(P, -1), earR = ear(P, 1), N = P.nose, base = (x, y, z) => smin(core(x, y, z), smin(earL(x, y, z), earR(x, y, z), 0.0), 0.1);
  const fz = (x, y) => surfZ(core, x, y);
  const zb = fz(0, N.bridgeY), zt = fz(0, N.tipY) + N.tipZ;
  const nose = (x, y, z) => cone(x / N.width, y, z, 0, N.bridgeY, zb - 0.05, 0, N.tipY, zt - N.r1 * 0.5, N.r0, N.r1);
  const M = P.mouth, segs = [];
  // the smile groove: an arc y = M.y + curve * t^2 (a smile); its capsule chain is laid on the face ONCE, here
  { const n = 16; for (let i = 0; i < n; i++) { const pts = [i, i + 1].map((k) => { const t = k / n * 2 - 1, x = t * M.width, sm = x < 0 ? M.smileL : M.smileR, y = M.y + M.curve * t * t * M.width * 0.5 + sm * Math.abs(t) * 0.1; return [x, y, fz(x, y) + M.depth * 0.25]; }); segs.push([...pts[0], ...pts[1]]); } }
  const cornerPts = [-1, 1].map((sd) => { const x = sd * M.width, y = M.y + M.curve * M.width * 0.5 + (sd < 0 ? M.smileL : M.smileR) * 0.1 + M.tuck; return [x, y, fz(x, y) + M.depth * 0.2]; });
  const groove = (x, y, z) => { if (Math.abs(y - M.y) > 0.5 || Math.abs(x) > M.width + 0.2) return 1; let d = 1e9; for (const s of segs) d = Math.min(d, capsule(x, y, z, s[0], s[1], s[2], s[3], s[4], s[5], M.depth)); return d; };
  const earHull = (x, y, z) => (grids.hull && P.ear.useHull && Math.abs(x) > 0.95 && y > -0.75 && y < 0.65 && z > -0.7 && z < 0.55 ? gridAt(grids.hull, x, y, z) + P.ear.hullGrow : 1);
  const f = (x, y, z) => { let d = smin(base(x, y, z), nose(x, y, z), 0.14); d = smin(d, earHull(x, y, z), 0.04); return ssub(d, groove(x, y, z), 0.03); };
  f.groove = groove; f.mouthDepth = M.depth; return f;
}
// a tapered tube swept along a spine of [x, y, z, r] control points (Catmull-Rom resampled): smooth-unioned capsules with varying radius
export function sweepTube(spine, samples = 10) {
  const pts = [], P = spine, n = P.length;
  for (let i = 0; i < n - 1; i++) for (let k = 0; k < samples; k++) { const t = k / samples, p0 = P[Math.max(0, i - 1)], p1 = P[i], p2 = P[i + 1], p3 = P[Math.min(n - 1, i + 2)], c = (a, b, c_, d) => 0.5 * ((2 * b) + (-a + c_) * t + (2 * a - 5 * b + 4 * c_ - d) * t * t + (-a + 3 * b - 3 * c_ + d) * t * t * t); pts.push([0, 1, 2, 3].map((q) => c(p0[q], p1[q], p2[q], p3[q]))); }
  pts.push(P[n - 1].slice());
  return (x, y, z, blend = 0.12) => { let d = 1e9; for (let i = 0; i < pts.length - 1; i++) { const a = pts[i], b = pts[i + 1]; d = smin(d, cone(x, y, z, a[0], a[1], a[2], b[0], b[1], b[2], a[3], b[3]), i === 0 ? 0 : blend * 0.35); } return d; };
}
// ---- the visual hull of the turnaround's silhouettes (tools/face3d/asset/carve_hull.py -> public/faces/clay-hull.bin): a smoothed signed-distance grid in the
// fit's Blender frame (x right, y back, z up). Set once with setHull(arrayBuffer, meta); sampled trilinearly in three.js axes via a fixed alignment to the head.
const grids = {};
const half = (h) => { const e = (h >> 10) & 31, m = h & 1023, sg = h & 0x8000 ? -1 : 1; return e === 0 ? sg * m * 5.960464477539063e-8 : e === 31 ? (m ? NaN : sg * Infinity) : sg * Math.pow(2, e - 15) * (1 + m / 1024); };
export function setHull(buf, meta, name = "hull") { const u = new Uint16Array(buf), f = new Float32Array(u.length); for (let i = 0; i < u.length; i++) f[i] = half(u[i]); grids[name] = { f, N: meta.N, lo: meta.lo, hi: meta.hi }; }
export const hasHull = () => !!grids.hull;
// three.js (x right, y up, z to the viewer) -> hull grid; `A` aligns the hull to the head (registered against the lower face and ears, tools/face3d/asset): scale, then shift
const A = { s: 1.03, tx: 0, ty: 0.2, tz: 0.12 };
function gridAt(H, x, y, z) {
  const xb = x / A.s - A.tx, yb = -(z - A.tz) / A.s, zb = (y - A.ty) / A.s, N = H.N, vx = (H.hi[0] - H.lo[0]) / (N - 1);
  const gx = (xb - H.lo[0]) / vx, gy = (yb - H.lo[1]) / vx, gz = (zb - H.lo[2]) / vx;
  if (gx < 0 || gy < 0 || gz < 0 || gx > N - 1 || gy > N - 1 || gz > N - 1) { const dx = Math.max(-gx, 0, gx - (N - 1)), dy = Math.max(-gy, 0, gy - (N - 1)), dz = Math.max(-gz, 0, gz - (N - 1)); return 0.2 + Math.hypot(dx, dy, dz) * vx; }
  const i0 = Math.floor(gx), j0 = Math.floor(gy), k0 = Math.floor(gz), i1 = Math.min(N - 1, i0 + 1), j1 = Math.min(N - 1, j0 + 1), k1 = Math.min(N - 1, k0 + 1), fx = gx - i0, fy = gy - j0, fz = gz - k0, f = H.f, id = (i, j, k) => f[(i * N + j) * N + k];
  const c00 = id(i0, j0, k0) * (1 - fx) + id(i1, j0, k0) * fx, c10 = id(i0, j1, k0) * (1 - fx) + id(i1, j1, k0) * fx, c01 = id(i0, j0, k1) * (1 - fx) + id(i1, j0, k1) * fx, c11 = id(i0, j1, k1) * (1 - fx) + id(i1, j1, k1) * fx;
  return (c00 * (1 - fy) + c10 * fy) * (1 - fz) + (c01 * (1 - fy) + c11 * fy) * fz;
}
const hullAt = (x, y, z) => gridAt(grids.hull, x, y, z);
export function hairSdf(P) {
  if (grids.hull && P.hair.useHull) {
    const Hh = P.hair, R = Hh.cap.region, earL = ear(P, -1), earR = ear(P, 1), flutes = Hh.hullFlutes ? (Hh.wing.flutes || []).map((f) => sweepTube(f)) : [];
    return (x, y, z) => {
      const reg = R.reduce((m, q) => smin(m, ellipsoid(x, y, z, q.c[0], q.c[1], q.c[2], q.r[0], q.r[1], q.r[2]), 0.15), 1e9);
      let d = smax(hullAt(x, y, z) + Hh.hullGrow, reg, Hh.napeBlend ?? 0.3);
      // the wing, carved at 2x resolution over its own box: unioned with a small blend so the sweep keeps its tip
      if (grids.wing && Hh.useWing) d = smin(d, smax(gridAt(grids.wing, x, y, z) + Hh.hullGrow, reg, 0.1), Hh.wingBlend ?? 0.04);
      for (const fl of flutes) d = smin(d, fl(x, y, z), Hh.fluteBlend ?? 0.07);
      if (Math.abs(x) > 0.7) d = smax(d, -(Math.min(earL(x, y, z), earR(x, y, z)) - 0.05), 0.03);
      return d;
    };
  }
  return hairSdfTubes(P);
}
function hairSdfTubes(P) {
  const Hh = P.hair, t = Hh.cap.thick, core = headCore(P), R = Hh.cap.region, W = Hh.wing;
  // the wing: a main spine sweeping up from the forehead and out to the viewer's right, plus flutes (shorter tubes fanning off its end)
  const earL = ear(P, -1), earR = ear(P, 1);
  const main = sweepTube(W.spine), flutes = (W.flutes || []).map((f) => sweepTube(f));
  return (x, y, z) => {
    const e = 0.015, f0 = core(x, y, z), gx = (core(x + e, y, z) - core(x - e, y, z)) / (2 * e), gy = (core(x, y + e, z) - core(x, y - e, z)) / (2 * e), gz = (core(x, y, z + e) - core(x, y, z - e)) / (2 * e), c0 = f0 / Math.max(0.2, Math.hypot(gx, gy, gz));
    const reg = R.reduce((m, q) => smin(m, ellipsoid(x, y, z, q.c[0], q.c[1], q.c[2], q.r[0], q.r[1], q.r[2]), 0.15), 1e9);
    let d = smax(c0 - t, reg, Hh.napeBlend ?? 0.3);
    d = smin(d, main(x, y, z), Hh.swooshBlend);
    for (const fl of flutes) d = smin(d, fl(x, y, z), Hh.fluteBlend ?? 0.07);
    // keep the hair off the ears: carve the ears (plus a margin) out of it, so the ear's root is skin
    if (Math.abs(x) > 0.7) d = smax(d, -(Math.min(earL(x, y, z), earR(x, y, z)) - 0.05), 0.03);
    return d;
  };
}
