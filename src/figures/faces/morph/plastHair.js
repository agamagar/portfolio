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
function cap(r) {
  const C = new THREE.Vector3(0, 0.05, -0.02), R = new THREE.Vector3(1.07, 1.3, 1.02);
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
      const bump = 0.05 * lump(x, y, z, 1.0) + 0.03 * lump(x * 1.7, y * 1.7, z * 1.7, 2.1);
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

export function buildPlastHair(seed = 7) {
  const r = rng(seed), parts = [cap(r)];
  const rr = (a, b) => a + (b - a) * r();
  // locks round the back and sides: rooted on the scalp, falling past the jaw to the shoulders
  const NB = 34;
  for (let i = 0; i < NB; i++) {
    const a = THREE.MathUtils.lerp(1.1, Math.PI * 2 - 1.1, (i + rr(-0.35, 0.35)) / (NB - 1)); // skip the face
    const sx = Math.sin(a), cz = Math.cos(a);
    const side = Math.abs(sx);
    const yRoot = rr(0.35, 0.8) - 0.6 * Math.max(0, -cz) * 0.0;
    const rad0 = 1.0; // the lock leaves the skull here
    const len = rr(1.75, 2.3); // tips at about y -1.2 .. -1.7: past the chin (-1.49), shoulder length
    const pts = [];
    const steps = 6, drift = rr(-0.16, 0.16), flick = rr(0.1, 0.34) * (r() < 0.5 ? -1 : 1);
    for (let s = 0; s <= steps; s++) {
      const t = s / steps, y = yRoot - len * t;
      // radial distance from the head's axis: hugs the skull, then the neck, then flares at the shoulder
      const radial = (rad0 + 0.34 * side * side * smooth(0.05, 0.3, t)) * (1.0 + 0.1 * Math.sin(t * 2.4)) * (y > -0.4 ? 1 : 0.94 + 0.14 * smooth(0.55, 1.0, t)) + 0.08;
      const aa = a + drift * t * t + flick * smooth(0.65, 1.0, t) * 0.35;
      pts.push([radial * Math.sin(aa) * 1.04, y, radial * Math.cos(aa) * 0.98 - 0.05 - 0.12 * smooth(0.3, 1, t)]);
    }
    parts.push(lock(pts, rr(0.2, 0.3), { tip: rr(0.12, 0.3), belly: rr(0.3, 0.6) }));
  }
  // the fringe: loose tufts that fall from the crown across the forehead, swept a little to one side
  const NF = 8;
  for (let i = 0; i < NF; i++) {
    const u = i / (NF - 1), x = THREE.MathUtils.lerp(-0.78, 0.78, u) + rr(-0.05, 0.05);
    const sweep = 0.16 + 0.22 * (u - 0.5) + rr(-0.05, 0.05);
    const yEnd = 0.7 + 0.1 * Math.abs(u - 0.5) * 2 + rr(-0.07, 0.07);
    const pts = [
      [x * 0.55, 1.18, 0.12],
      [x * 0.85, 1.1, 0.5],
      [x * 0.98 + sweep * 0.3, 0.98, 0.84],
      [x + sweep * 0.7, (1.0 + yEnd) / 2, 1.0],
      [x + sweep, yEnd, 1.02],
    ];
    parts.push(lock(pts, rr(0.21, 0.27), { seg: 14, rad: 9, tip: 0.35, belly: 0.5 }));
  }
  // a few clay lumps on the crown for the messy outline
  for (let i = 0; i < 7; i++) {
    const a = rr(0, Math.PI * 2), el = rr(0.35, 0.95), rs = rr(0.2, 0.34);
    const d = new THREE.Vector3(Math.sin(a) * Math.cos(el), Math.sin(el), Math.cos(a) * Math.cos(el) * 0.9 - 0.1);
    const sp = new THREE.SphereGeometry(rs, 14, 10).scale(1, rr(0.7, 1.0), rr(0.9, 1.3)).translate(d.x * 1.0, 0.05 + d.y * 1.28 + 0.02, d.z * 0.98);
    parts.push(sp);
  }
  const hair = new THREE.Mesh(mergeGeometries(parts.map((g) => (g.index ? g.toNonIndexed() : g)), false));
  hair.name = "Hair";
  // the lavender clip: a small rounded bar pinning the fringe on the left, in front of the locks
  const clip = new THREE.Mesh(new THREE.CapsuleGeometry(0.07, 0.3, 6, 14).rotateZ(Math.PI * 0.5 + 0.55).rotateY(-0.25).translate(-0.66, 0.9, 1.1));
  clip.name = "HatBand";
  return [hair, clip];
}
