// The soft clay skin's hair (2026-10-20): shoulder-length, messy, built from clay chunks in code on
// the same head as every other skin (public/faces/face.glb: x right, y up, z to the viewer, the skull
// about 1.0 wide, the top at y 1.28, the chin at -1.49, the brow line at 0.64). A scalp cap that
// stops at a hairline, a loose fringe over the forehead, and tapered sausage locks that fall past
// the jaw to shoulder height. One merged mesh (named "Hair": the rig's part id, id pass and
// flat colours all key on that name) and a small lavender clip (named "HatBand", the prop slot).
// Seeded, so every load builds the same hair.
import * as THREE from "three";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";

const rng = (seed) => () => { seed |= 0; seed = (seed + 0x6d2b79f5) | 0; let t = Math.imul(seed ^ (seed >>> 15), 1 | seed); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
const smooth = (a, b, x) => { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t); };

// smooth value noise from a few sines: a lump field over the scalp (no texture, no lookup)
const lump = (x, y, z, s) => Math.sin(x * 3.1 * s + 1.3) * Math.sin(y * 2.7 * s + 0.4) * 0.5 + Math.sin(z * 3.7 * s + x * 1.9 * s) * Math.sin(y * 4.3 * s + z * 2.2 * s + 2.0) * 0.5;

// the scalp: an ellipsoid over the skull, open at a hairline that sits high on the forehead, level
// with the top of the ear at the sides, and low at the nape
function cap(P) {
  const C = new THREE.Vector3(0, 0.05, -0.02), R = new THREE.Vector3(1.07 * P.volume, 1.3 * (0.97 + 0.03 * P.volume), 1.02 * P.volume);
  const NA = 72, NV = 26, pos = [], uv = [], idx = [];
  const hairline = (a) => { // a: azimuth from the front (+z), 0..2pi
    const side = Math.abs(Math.sin(a)), back = Math.max(0, -Math.cos(a));
    return 0.86 - 1.2 * smooth(0.25, 0.95, side) - 0.55 * smooth(0.0, 1.0, back); // front 0.86, sides -0.34, nape -0.9
  };
  for (let i = 0; i <= NA; i++) {
    const a = (i / NA) * Math.PI * 2, yh = hairline(a);
    for (let j = 0; j <= NV; j++) {
      const v = j / NV, y = THREE.MathUtils.lerp(C.y + R.y * 0.999, yh, Math.pow(v, 0.9));
      const k = Math.sqrt(Math.max(0, 1 - ((y - C.y) / R.y) ** 2));
      let x = C.x + R.x * k * Math.sin(a), z = C.z + R.z * k * Math.cos(a);
      // clay lumps: the surface heaves a little, more toward the crown
      const bump = (0.012 + 0.05 * P.messiness) * lump(x, y, z, 1.0) + (0.008 + 0.03 * P.messiness) * lump(x * 1.7, y * 1.7, z * 1.7, 2.1);
      const len = Math.hypot(x - C.x, (y - C.y) * 0.8, z - C.z) || 1;
      x += ((x - C.x) / len) * bump; z += ((z - C.z) / len) * bump; const yy = y + bump * 0.6;
      pos.push(x, yy, z); uv.push(i / NA, v);
    }
  }
  for (let i = 0; i < NA; i++) for (let j = 0; j < NV; j++) {
    const a = i * (NV + 1) + j, b = a + NV + 1;
    idx.push(a, a + 1, b, b, a + 1, b + 1);
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute("uv", new THREE.Float32BufferAttribute(uv, 2));
  if (P.cap === "ring") { // balding: no hair over the crown
    const keep = [];
    for (let t = 0; t < idx.length; t += 3) { const ys = [0, 1, 2].map((k) => pos[idx[t + k] * 3 + 1]), xs = [0, 1, 2].map((k) => pos[idx[t + k] * 3]); const my = (ys[0] + ys[1] + ys[2]) / 3, mx = (xs[0] + xs[1] + xs[2]) / 3; if (!(my > 0.55 && Math.abs(mx) < 0.9)) keep.push(idx[t], idx[t + 1], idx[t + 2]); }
    idx.length = 0; idx.push(...keep);
  }
  g.setIndex(idx);
  g.computeVertexNormals();
  // winding: the mean triangle normal must point away from the head's centre (flip the whole cap if not)
  let dot = 0;
  const ix0 = g.index.array, P0 = g.attributes.position, a0 = new THREE.Vector3(), b0 = new THREE.Vector3(), c0 = new THREE.Vector3();
  for (let t = 0; t < ix0.length; t += 3) {
    a0.fromBufferAttribute(P0, ix0[t]); b0.fromBufferAttribute(P0, ix0[t + 1]); c0.fromBufferAttribute(P0, ix0[t + 2]);
    const nrm = b0.clone().sub(a0).cross(c0.clone().sub(a0)), mid = a0.clone().add(b0).add(c0).divideScalar(3).sub(C);
    dot += Math.sign(nrm.dot(mid));
  }
  if (dot < 0) { for (let t = 0; t < ix0.length; t += 3) { const q = ix0[t + 1]; ix0[t + 1] = ix0[t + 2]; ix0[t + 2] = q; } }
  g.computeVertexNormals();
  return g;
}

// a tapered, rounded lock along a curve: radius swells a little then narrows to a soft tip
function lock(points, radius, { seg = 22, rad = 10, tip = 0.18, belly = 0.45 } = {}) {
  const curve = new THREE.CatmullRomCurve3(points.map((p) => new THREE.Vector3(...p)), false, "catmullrom", 0.5);
  const frames = curve.computeFrenetFrames(seg, false);
  const pos = [], uv = [], idx = [];
  for (let i = 0; i <= seg + 2; i++) {
    const t = Math.min(1, i / seg), P = curve.getPointAt(t);
    const N = frames.normals[Math.min(i, seg)], B = frames.binormals[Math.min(i, seg)];
    let rr = radius * (1 - (1 - tip) * smooth(belly, 1.0, t)) * (0.9 + 0.1 * Math.sin(t * 9.0));
    if (i > seg) rr *= i === seg + 1 ? 0.55 : 0.0; // the rounded end
    const P2 = i > seg ? P.clone().addScaledVector(curve.getTangentAt(1), radius * tip * (i === seg + 1 ? 0.5 : 0.8)) : P;
    for (let k = 0; k <= rad; k++) {
      const a = (k / rad) * Math.PI * 2;
      pos.push(P2.x + (N.x * Math.cos(a) + B.x * Math.sin(a)) * rr, P2.y + (N.y * Math.cos(a) + B.y * Math.sin(a)) * rr, P2.z + (N.z * Math.cos(a) + B.z * Math.sin(a)) * rr);
      uv.push(k / rad, t);
    }
  }
  for (let i = 0; i < seg + 2; i++) for (let k = 0; k < rad; k++) {
    const a = i * (rad + 1) + k, b = a + rad + 1;
    idx.push(a, b, a + 1, a + 1, b, b + 1);
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute("uv", new THREE.Float32BufferAttribute(uv, 2));
  g.setIndex(idx);
  g.computeVertexNormals();
  return g;
}

// params: length 0 (cropped) .. 1 (shoulders), fringe 0..1, messiness 0..1, volume ~1, sweep -1..1, clip, seed
export function buildPlastHair(params = {}) {
  const P = { length: 0.92, fringe: 0.85, messiness: 0.6, volume: 1, sweep: 0.3, clip: true, seed: 7, cap: "full", bun: false, braid: "none", curly: 0, quiff: 0, ...params };
  const r = rng(P.seed | 0), parts = P.cap === "none" || P.cap === "crest" || P.cap === "curly" ? [] : [cap(P)];
  const rr = (a, b) => a + (b - a) * r();
  const M = P.messiness, V = P.volume;
  // locks round the back and sides: rooted on the scalp, falling past the jaw to the shoulders
  const NB = P.length < 0.04 ? 0 : Math.round(34 * (0.45 + 0.55 * Math.min(1, P.length * 1.6)));
  for (let i = 0; i < NB; i++) {
    const a = THREE.MathUtils.lerp(1.1, Math.PI * 2 - 1.1, (i + rr(-0.35, 0.35)) / (NB - 1)); // skip the face
    const sx = Math.sin(a), cz = Math.cos(a);
    const side = Math.abs(sx);
    const yRoot = rr(0.35, 0.8);
    const len = THREE.MathUtils.lerp(0.5, 2.05, P.length) * rr(0.86, 1.12) + (P.length > 0.85 ? rr(0, 0.25) : 0); // length 1: tips at about y -1.2 .. -1.7, past the chin (-1.49)
    const pts = [];
    const steps = 6, drift = rr(-0.16, 0.16) * (0.3 + 1.4 * M), flick = rr(0.1, 0.34) * (0.3 + 1.2 * M) * (r() < 0.5 ? -1 : 1);
    for (let s = 0; s <= steps; s++) {
      const t = s / steps, y = yRoot - len * t;
      // radial distance from the head's axis: hugs the skull, then the neck, then flares at the shoulder
      const radial = (1.0 + 0.34 * side * side * smooth(0.05, 0.3, t)) * V * (1.0 + 0.1 * Math.sin(t * 2.4)) * (y > -0.4 ? 1 : 0.94 + 0.14 * smooth(0.55, 1.0, t)) + 0.08;
      const aa = a + drift * t * t + flick * smooth(0.65, 1.0, t) * 0.35;
      pts.push([radial * Math.sin(aa) * 1.04, y, radial * Math.cos(aa) * 0.98 - 0.05 - 0.12 * smooth(0.3, 1, t)]);
    }
    parts.push(lock(pts, rr(0.2, 0.3), { tip: rr(0.12, 0.3), belly: rr(0.3, 0.6) }));
  }
  // the fringe: loose tufts that fall from the crown across the forehead, swept to one side
  const NF = Math.round(P.fringe * 9);
  for (let i = 0; i < NF; i++) {
    const u = NF > 1 ? i / (NF - 1) : 0.5, x = THREE.MathUtils.lerp(-0.78, 0.78, u) + rr(-0.05, 0.05);
    const sweep = P.sweep * 0.5 + 0.22 * (u - 0.5) + rr(-0.05, 0.05);
    const yEnd = THREE.MathUtils.lerp(1.0, 0.64, Math.min(1, P.fringe)) + 0.1 * Math.abs(u - 0.5) * 2 + rr(-0.07, 0.07);
    const pts = [
      [x * 0.55, 1.18, 0.12],
      [x * 0.85, 1.1, 0.5],
      [x * 0.98 + sweep * 0.3, 0.98, 0.84],
      [x + sweep * 0.7, (1.0 + yEnd) / 2, 1.0],
      [x + sweep, yEnd, 1.02],
    ];
    parts.push(lock(pts, rr(0.21, 0.27), { seg: 14, rad: 9, tip: 0.35, belly: 0.5 }));
  }
  // clay lumps on the crown for the messy outline
  const NL = P.cap === "ring" || P.cap === "none" || P.cap === "curly" || P.cap === "crest" ? 0 : Math.round(M * 9);
  for (let i = 0; i < NL; i++) {
    const a = rr(0, Math.PI * 2), el = rr(0.95, 1.3), rs = rr(0.15, 0.25); // (up on the crown: lower lumps sat on the forehead as dark discs)
    const d = new THREE.Vector3(Math.sin(a) * Math.cos(el), Math.sin(el), Math.cos(a) * Math.cos(el) * 0.9 - 0.1);
    parts.push(new THREE.SphereGeometry(rs, 14, 10).scale(1, rr(0.7, 1.0), rr(0.9, 1.3)).translate(d.x * V, 0.05 + d.y * 1.28 + 0.02, d.z * 0.98 * V));
  }
  // ---- the styles beyond the quiff-and-locks recipe ------------------------------------------------
  const sph = (c, rs, sc = [1, 1, 1]) => new THREE.SphereGeometry(rs, 14, 10).scale(sc[0], sc[1], sc[2]).translate(c[0], c[1], c[2]);
  const onSkull = (a, el, k = 1) => [Math.sin(a) * Math.cos(el) * 1.04 * V * k, 0.05 + Math.sin(el) * 1.3 * k, Math.cos(a) * Math.cos(el) * 0.98 * V * k - 0.04];
  if (P.cap === "curly") {
    // tight curls: a field of small clay spheres over the scalp, from the hairline up and round to the nape
    const rows = 13;
    for (let rI = 0; rI < rows; rI++) {
      const el = THREE.MathUtils.lerp(1.3, -0.15, rI / (rows - 1)), nA = Math.max(5, Math.round(Math.cos(el) * 28));
      for (let q = 0; q < nA; q++) {
        const a = (q / nA) * Math.PI * 2 + rr(-0.12, 0.12), front = Math.cos(a);
        if (front > 0.1 && el < 1.0) continue;     // keep the forehead clear below the hairline
        if (Math.abs(Math.sin(a)) > 0.7 && el < 0.15 && Math.cos(a) > -0.3) continue; // and the ears
        const c = onSkull(a, el, 1.06 + 0.04 * M);
        parts.push(sph(c, rr(0.13, 0.19) * (1 + 0.2 * M), [1, rr(0.85, 1.05), 1]));
      }
    }
  }
  if (P.cap === "crest") {
    // a mohawk / undercut crest: a ridge of upright clay lumps along the midline, front to nape; the sides stay short
    const nR = 14;
    for (let q = 0; q < nR; q++) {
      const t = q / (nR - 1), el = THREE.MathUtils.lerp(1.25, 0.05, t), a = t < 0.5 ? 0 : Math.PI;
      const c = onSkull(a, t < 0.5 ? THREE.MathUtils.lerp(0.55, 1.5, t * 2) : THREE.MathUtils.lerp(1.5, 0.3, (t - 0.5) * 2), 1.0);
      parts.push(sph([0, c[1] + 0.06, c[2]], 0.2, [0.5, 1.1 + 0.3 * P.quiff, 0.9]));
    }
    // a close shave on the sides: a thin shell darker than the crest comes from the palette's Hair tone, so only a low cap
  }
  if (P.quiff > 0 && P.cap !== "crest") {
    // swept-up front: a few locks rising off the hairline and combed back
    for (let q = 0; q < 6; q++) {
      const x = THREE.MathUtils.lerp(-0.5, 0.5, q / 5) + rr(-0.05, 0.05);
      parts.push(lock([[x * 0.8, 0.95, 0.75], [x * 0.9, 1.22 + 0.1 * P.quiff, 0.98 + 0.08 * P.quiff], [x * 0.7 + 0.1 * P.sweep, 1.42 + 0.1 * P.quiff, 0.72], [x * 0.5 + 0.2 * P.sweep, 1.46 + 0.1 * P.quiff, 0.25]], rr(0.17, 0.22), { seg: 12, rad: 8, tip: 0.3 }));
    }
  }
  if (P.bun) {
    // a knot high at the back, tied with a ring
    parts.push(sph([0, 0.95, -1.0], 0.36, [1, 0.9, 1]));
    parts.push(new THREE.TorusGeometry(0.31, 0.07, 8, 24).rotateX(Math.PI / 2).translate(0, 0.72, -0.98));
  }
  if (P.braid && P.braid !== "none") {
    // a plait over one shoulder: a chain of overlapping clay ovals with a tie at the end
    const sd = P.braid === "left" ? -1 : 1, n = 12;
    for (let q = 0; q < n; q++) {
      const t = q / (n - 1), y = THREE.MathUtils.lerp(-0.1, -2.05, t), x = sd * (1.12 + 0.06 * Math.sin(t * 3)), z = THREE.MathUtils.lerp(0.0, 0.48, Math.min(1, t * 1.4));
      parts.push(sph([x, y, z], 0.17 * (1 - 0.3 * t), [1.05, 0.95, 0.9]).rotateZ(0));
      parts.push(sph([x + sd * 0.05 * (q % 2 ? 1 : -1), y - 0.08, z + 0.04 * (q % 2 ? 1 : -1)], 0.13 * (1 - 0.3 * t), [1, 1, 1]));
    }
    parts.push(new THREE.TorusGeometry(0.1, 0.035, 8, 16).translate(sd * 1.15, -2.1, 0.5));
  }
  if (!parts.length) parts.push(new THREE.SphereGeometry(0.001, 3, 2).translate(0, -9, 0)); // bald: nothing to draw (the mesh stays, empty)
  const hair = new THREE.Mesh(mergeGeometries(parts.map((g) => (g.index ? g.toNonIndexed() : g)), false));
  hair.name = "Hair";
  // the lavender clip: a small rounded bar pinning the fringe on the left, in front of the locks
  const clip = new THREE.Mesh(new THREE.CapsuleGeometry(0.07, 0.3, 6, 14).rotateZ(Math.PI * 0.5 + 0.55).rotateY(-0.25).translate(-0.66, 0.9, 1.1));
  clip.name = "HatBand";
  return [hair, clip];
}
