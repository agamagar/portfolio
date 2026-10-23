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
export function ear(P, sd) {
  const E = P.ear, a = (sd * E.toeIn * Math.PI) / 180;
  return (x, y, z) => {
    const [px, py, pz] = rotY(x, y, z, -a, sd * E.x, E.z), cx = sd * E.x;
    let d = ellipsoid(px, py, pz, cx, E.y, E.z, E.rx, E.ry, E.rz);
    // the bowl: a smaller ellipsoid pressed into the outer face, leaving a rim
    const bowl = ellipsoid(px, py, pz, cx + sd * E.rx * 0.9, E.y - 0.02, E.z - 0.02, E.rx * 0.9, E.ry * 0.68, E.rz * 0.66);
    d = ssub(d, bowl, 0.06 * E.bowl);
    // the helix fold: a ridge arcing inside the bowl, and the tragus and lobe
    const fold = capsule(px, py, pz, cx + sd * 0.02, E.y + E.ry * 0.3, E.z - E.rz * 0.15, cx + sd * 0.02, E.y - E.ry * 0.1, E.z + E.rz * 0.2, 0.045 * E.fold);
    d = smin(d, fold, 0.05);
    d = smin(d, ellipsoid(px, py, pz, cx, E.y - E.ry * 0.85, E.z + E.rz * 0.1, E.rx * 0.9, E.ry * 0.28 * E.lobe, E.rz * 0.4), 0.1);
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
  const groove = (x, y, z) => { if (Math.abs(y - M.y) > 0.5 || Math.abs(x) > M.width + 0.2) return 1; let d = 1e9; for (const s of segs) d = Math.min(d, capsule(x, y, z, s[0], s[1], s[2], s[3], s[4], s[5], M.depth)); return d; };
  const f = (x, y, z) => { let d = smin(base(x, y, z), nose(x, y, z), 0.14); return ssub(d, groove(x, y, z), 0.03); };
  f.groove = groove; f.mouthDepth = M.depth; return f;
}
export function hairSdf(P) {
  const Hh = P.hair, t = Hh.cap.thick, core = headCore(P), sw = Hh.swoosh, R = Hh.cap.region;
  return (x, y, z) => {
    // the cap: the head inflated by `thick`, kept inside a region (ellipsoids reaching down the back and sides, stopping at the forehead's hairline); the hair is
    // UNIONED with the skin into one surface (see ClayHead), so there is no shell, no z-fight and no slab
    // (the p-norm core is not a true distance: divide by its gradient's length so `thick` and the shell's depth are in real units)
    const e = 0.015, f0 = core(x, y, z), gx = (core(x + e, y, z) - core(x - e, y, z)) / (2 * e), gy = (core(x, y + e, z) - core(x, y - e, z)) / (2 * e), gz = (core(x, y, z + e) - core(x, y, z - e)) / (2 * e), c0 = f0 / Math.max(0.2, Math.hypot(gx, gy, gz));
    const reg = R.reduce((m, e) => smin(m, ellipsoid(x, y, z, e.c[0], e.c[1], e.c[2], e.r[0], e.r[1], e.r[2]), 0.15), 1e9);
    let d = smax(c0 - t, reg, 0.12);
    for (const s of sw) d = smin(d, ellipsoid(x, y, z, s[0], s[1], s[2], s[3], s[4], s[5]), Hh.swooshBlend);
    return d;
  };
}
