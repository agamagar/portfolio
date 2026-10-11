// Generates src/hello3/materialShapes.js: the Material 3 Expressive shape set as
// SVG paths in a 0..1 box, for clip-path (clipPathUnits="objectBoundingBox").
//
// SOURCE (Apache-2.0, The Android Open Source Project), ported line for line,
// not approximated:
//   shapes:  androidx/compose/material3/MaterialShapes.kt (androidx-main)
//   maths:   androidx/graphics/shapes/{RoundedPolygon,Shapes,Cubic,Utils}.kt
// Every shape is built exactly as MaterialShapes builds it (customPolygon with
// PointNRound + CornerRounding, doRepeat with mirroring, star/circle/rectangle,
// the same transforms), rounded by RoundedPolygon's own corner algorithm,
// then normalized() and centred the way RoundedPolygon.toShape() centres it.
//
// Run: node tools/material-shapes/generate.mjs   (writes the file; no deps)

import { writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const EPS = 1e-4; // DistanceEpsilon
const P = (x, y) => ({ x, y });
const add = (a, b) => P(a.x + b.x, a.y + b.y);
const sub = (a, b) => P(a.x - b.x, a.y - b.y);
const mul = (a, k) => P(a.x * k, a.y * k);
const div = (a, k) => P(a.x / k, a.y / k);
const dot = (a, b) => a.x * b.x + a.y * b.y;
const dist = (a) => Math.hypot(a.x, a.y);
const dir = (a) => div(a, dist(a));
const rot90 = (a) => P(-a.y, a.x);
const lerpP = (a, b, t) => P((1 - t) * a.x + t * b.x, (1 - t) * a.y + t * b.y);
const lerp = (a, b, t) => (1 - t) * a + t * b;
const R = (radius = 0, smoothing = 0) => ({ radius, smoothing });
const UNROUNDED = R();

// Cubic = [a0, c0, c1, a1]
const line = (p0, p1) => [p0, lerpP(p0, p1, 1 / 3), lerpP(p0, p1, 2 / 3), p1];
const reverse = (c) => [c[3], c[2], c[1], c[0]];
function circularArc(center, p0, p1) {
  const p0d = dir(sub(p0, center)), p1d = dir(sub(p1, center));
  const r0 = rot90(p0d), r1 = rot90(p1d);
  const clockwise = dot(r0, sub(p1, center)) >= 0;
  const cosa = dot(p0d, p1d);
  if (cosa > 0.999) return line(p0, p1);
  const k = (dist(sub(p0, center)) * 4) / 3 * (Math.sqrt(2 * (1 - cosa)) - Math.sqrt(1 - cosa * cosa)) / (1 - cosa) * (clockwise ? 1 : -1);
  return [p0, add(p0, mul(r0, k)), sub(p1, mul(r1, k)), p1];
}

// RoundedPolygon.kt: class RoundedCorner
function roundedCorner(p0, p1, p2, rounding) {
  const v01 = sub(p0, p1), v21 = sub(p2, p1);
  const d01 = dist(v01), d21 = dist(v21);
  const rc = { p0, p1, p2 };
  if (d01 > 0 && d21 > 0) {
    rc.d1 = div(v01, d01); rc.d2 = div(v21, d21);
    rc.cornerRadius = rounding?.radius ?? 0; rc.smoothing = rounding?.smoothing ?? 0;
    rc.cosAngle = dot(rc.d1, rc.d2); rc.sinAngle = Math.sqrt(1 - rc.cosAngle ** 2);
    rc.expectedRoundCut = rc.sinAngle > 1e-3 ? (rc.cornerRadius * (rc.cosAngle + 1)) / rc.sinAngle : 0;
  } else {
    Object.assign(rc, { d1: P(0, 0), d2: P(0, 0), cornerRadius: 0, smoothing: 0, cosAngle: 0, sinAngle: 0, expectedRoundCut: 0 });
  }
  rc.expectedCut = (1 + rc.smoothing) * rc.expectedRoundCut;
  return rc;
}
function lineIntersection(p0, d0, p1, d1) {
  const rd1 = rot90(d1);
  const den = dot(d0, rd1);
  if (Math.abs(den) < EPS) return null;
  const num = dot(sub(p1, p0), rd1);
  if (Math.abs(den) < EPS * Math.abs(num)) return null;
  return add(p0, mul(d0, num / den));
}
function flanking(actualRoundCut, s, corner, sideStart, ci, otherCi, circleCenter, actualR) {
  const sideDirection = dir(sub(sideStart, corner));
  const curveStart = add(corner, mul(sideDirection, actualRoundCut * (1 + s)));
  const p = lerpP(ci, div(add(ci, otherCi), 2), s);
  const curveEnd = add(circleCenter, mul(dir(sub(p, circleCenter)), actualR));
  const circleTangent = rot90(sub(curveEnd, circleCenter));
  const anchorEnd = lineIntersection(sideStart, sideDirection, curveEnd, circleTangent) ?? ci;
  const anchorStart = div(add(curveStart, mul(anchorEnd, 2)), 3);
  return [curveStart, anchorStart, anchorEnd, curveEnd];
}
function cornerCubics(rc, cut0, cut1) {
  const allowedCut = Math.min(cut0, cut1);
  if (rc.expectedRoundCut < EPS || allowedCut < EPS || rc.cornerRadius < EPS) return [line(rc.p1, rc.p1)];
  const smoothFor = (c) => c > rc.expectedCut ? rc.smoothing : c > rc.expectedRoundCut ? rc.smoothing * (c - rc.expectedRoundCut) / (rc.expectedCut - rc.expectedRoundCut) : 0;
  const actualRoundCut = Math.min(allowedCut, rc.expectedRoundCut);
  const s0 = smoothFor(cut0), s1 = smoothFor(cut1);
  const actualR = (rc.cornerRadius * actualRoundCut) / rc.expectedRoundCut;
  const centerDistance = Math.sqrt(actualR ** 2 + actualRoundCut ** 2);
  const center = add(rc.p1, mul(dir(div(add(rc.d1, rc.d2), 2)), centerDistance));
  const ci0 = add(rc.p1, mul(rc.d1, actualRoundCut));
  const ci2 = add(rc.p1, mul(rc.d2, actualRoundCut));
  const f0 = flanking(actualRoundCut, s0, rc.p1, rc.p0, ci0, ci2, center, actualR);
  const f2 = reverse(flanking(actualRoundCut, s1, rc.p1, rc.p2, ci2, ci0, center, actualR));
  return [f0, circularArc(center, f0[3], f2[0]), f2];
}
// RoundedPolygon(vertices, rounding, perVertexRounding, ...)
function roundedPolygon(verts, perVertex, rounding = UNROUNDED) {
  const n = verts.length;
  const rcs = verts.map((v, i) => roundedCorner(verts[(i + n - 1) % n], v, verts[(i + 1) % n], perVertex ? perVertex[i] : rounding));
  const cutAdjusts = verts.map((v, ix) => {
    const ert = rcs[ix].expectedRoundCut + rcs[(ix + 1) % n].expectedRoundCut;
    const ec = rcs[ix].expectedCut + rcs[(ix + 1) % n].expectedCut;
    const side = dist(sub(v, verts[(ix + 1) % n]));
    if (ert > side) return [side / ert, 0];
    if (ec > side) return [1, (side - ert) / (ec - ert)];
    return [1, 1];
  });
  const corners = rcs.map((rc, i) => {
    const cuts = [0, 1].map((delta) => {
      const [rr, cr] = cutAdjusts[(i + n - 1 + delta) % n];
      return rc.expectedRoundCut * rr + (rc.expectedCut - rc.expectedRoundCut) * cr;
    });
    return cornerCubics(rc, cuts[0], cuts[1]);
  });
  const cubics = [];
  for (let i = 0; i < n; i++) {
    cubics.push(...corners[i]);
    cubics.push(line(corners[i][corners[i].length - 1][3], corners[(i + 1) % n][0][0]));
  }
  return cubics.filter((c) => !(Math.abs(c[0].x - c[3].x) < EPS && Math.abs(c[0].y - c[3].y) < EPS));
}
const radial = (r, a) => P(r * Math.cos(a), r * Math.sin(a));
const polyN = (n, radius = 1) => Array.from({ length: n }, (_, i) => radial(radius, (Math.PI / n) * 2 * i));
const circle = (n = 8) => roundedPolygon(polyN(n, 1 / Math.cos(Math.PI / n)), null, R(1));
const rectangle = (w, h, rounding, perVertex) => roundedPolygon([P(w / 2, h / 2), P(-w / 2, h / 2), P(-w / 2, -h / 2), P(w / 2, -h / 2)], perVertex, rounding);
const star = (nv, inner, rounding) => {
  const v = [];
  for (let i = 0; i < nv; i++) { v.push(radial(1, (Math.PI / nv) * 2 * i)); v.push(radial(inner, (Math.PI / nv) * (2 * i + 1))); }
  return roundedPolygon(v, null, rounding);
};
const xf = (cubics, f) => cubics.map((c) => c.map(f));
const rotZ = (deg) => { const a = (deg * Math.PI) / 180, c = Math.cos(a), s = Math.sin(a); return (p) => P(p.x * c - p.y * s, p.x * s + p.y * c); };
const scale = (sx, sy) => (p) => P(p.x * sx, p.y * sy);

// MaterialShapes.kt: doRepeat + customPolygon
const toRad = (d) => (d / 360) * 2 * Math.PI;
function customPolygon(pnr, reps, mirroring = false, center = P(0.5, 0.5)) {
  const pts = [];
  if (mirroring) {
    const angles = pnr.map((p) => (Math.atan2(p.o.y - center.y, p.o.x - center.x) * 180) / Math.PI);
    const distances = pnr.map((p) => dist(sub(p.o, center)));
    const actualReps = reps * 2, sectionAngle = 360 / actualReps;
    for (let it = 0; it < actualReps; it++) {
      for (let index = 0; index < pnr.length; index++) {
        const i = it % 2 === 0 ? index : pnr.length - 1 - index;
        if (i > 0 || it % 2 === 0) {
          const a = toRad(sectionAngle * it + (it % 2 === 0 ? angles[i] : sectionAngle - angles[i] + 2 * angles[0]));
          pts.push({ o: add(mul(P(Math.cos(a), Math.sin(a)), distances[i]), center), r: pnr[i].r });
        }
      }
    }
  } else {
    const np = pnr.length;
    for (let it = 0; it < np * reps; it++) {
      const a = toRad((Math.floor(it / np) * 360) / reps);
      const off = sub(pnr[it % np].o, center);
      pts.push({ o: add(P(off.x * Math.cos(a) - off.y * Math.sin(a), off.x * Math.sin(a) + off.y * Math.cos(a)), center), r: pnr[it % np].r });
    }
  }
  return roundedPolygon(pts.map((p) => p.o), pts.map((p) => p.r));
}
const N = (x, y, r = UNROUNDED) => ({ o: P(x, y), r });
const c15 = R(0.15), c20 = R(0.2), c30 = R(0.3), c50 = R(0.5), c100 = R(1);

const SHAPES = {
  circle: () => circle(10),
  square: () => rectangle(1, 1, c30),
  slanted: () => customPolygon([N(0.926, 0.970, R(0.189, 0.811)), N(-0.021, 0.967, R(0.187, 0.057))], 2),
  arch: () => xf(roundedPolygon(polyN(4), [c100, c100, c20, c20]), rotZ(-135)),
  fan: () => customPolygon([N(1.004, 1.0, R(0.148, 0.417)), N(0, 1, R(0.151)), N(0, -0.003, R(0.148)), N(0.978, 0.020, R(0.803))], 1),
  arrow: () => customPolygon([N(0.5, 0.892, R(0.313)), N(-0.216, 1.050, R(0.207)), N(0.499, -0.160, R(0.215, 1)), N(1.225, 1.060, R(0.211))], 1),
  semiCircle: () => rectangle(1.6, 1, null, [c20, c20, c100, c100]),
  oval: () => xf(xf(circle(8), scale(1, 0.64)), rotZ(-45)),
  pill: () => customPolygon([N(0.961, 0.039, R(0.426)), N(1.001, 0.428), N(1.0, 0.609, R(1))], 2, true),
  triangle: () => xf(roundedPolygon(polyN(3), null, c20), rotZ(-90)),
  diamond: () => customPolygon([N(0.5, 1.096, R(0.151, 0.524)), N(0.040, 0.5, R(0.159))], 2),
  clamShell: () => customPolygon([N(0.171, 0.841, R(0.159)), N(-0.020, 0.5, R(0.140)), N(0.170, 0.159, R(0.159))], 2),
  pentagon: () => customPolygon([N(0.5, -0.009, R(0.172)), N(1.030, 0.365, R(0.164)), N(0.828, 0.970, R(0.169))], 1, true),
  gem: () => customPolygon([N(0.499, 1.023, R(0.241, 0.778)), N(-0.005, 0.792, R(0.208)), N(0.073, 0.258, R(0.228)), N(0.433, -0.000, R(0.491))], 1, true),
  sunny: () => star(8, 0.8, c15),
  verySunny: () => customPolygon([N(0.5, 1.080, R(0.085)), N(0.358, 0.843, R(0.085))], 8),
  cookie4: () => customPolygon([N(1.237, 1.236, R(0.258)), N(0.5, 0.918, R(0.233))], 4),
  cookie6: () => customPolygon([N(0.723, 0.884, R(0.394)), N(0.5, 1.099, R(0.398))], 6),
  cookie7: () => xf(star(7, 0.75, c50), rotZ(-90)),
  cookie9: () => xf(star(9, 0.8, c50), rotZ(-90)),
  cookie12: () => xf(star(12, 0.8, c50), rotZ(-90)),
  ghostish: () => customPolygon([N(0.5, 0, R(1)), N(1, 0, R(1)), N(1, 1.140, R(0.254, 0.106)), N(0.575, 0.906, R(0.253))], 1, true),
  clover4: () => customPolygon([N(0.5, 0.074), N(0.725, -0.099, R(0.476))], 4, true),
  clover8: () => customPolygon([N(0.5, 0.036), N(0.758, -0.101, R(0.209))], 8),
  burst: () => customPolygon([N(0.5, -0.006, R(0.006)), N(0.592, 0.158, R(0.006))], 12),
  softBurst: () => customPolygon([N(0.193, 0.277, R(0.053)), N(0.176, 0.055, R(0.053))], 10),
  boom: () => customPolygon([N(0.457, 0.296, R(0.007)), N(0.5, -0.051, R(0.007))], 15),
  softBoom: () => customPolygon([N(0.733, 0.454), N(0.839, 0.437, R(0.532)), N(0.949, 0.449, R(0.439, 1)), N(0.998, 0.478, R(0.174))], 16, true),
  flower: () => customPolygon([N(0.370, 0.187), N(0.416, 0.049, R(0.381)), N(0.479, 0.001, R(0.095))], 8, true),
  puffy: () => xf(customPolygon([N(0.5, 0.053), N(0.545, -0.040, R(0.405)), N(0.670, -0.035, R(0.426)), N(0.717, 0.066, R(0.574)), N(0.722, 0.128), N(0.777, 0.002, R(0.360)), N(0.914, 0.149, R(0.660)), N(0.926, 0.289, R(0.660)), N(0.881, 0.346), N(0.940, 0.344, R(0.126)), N(1.003, 0.437, R(0.255))], 2, true), scale(1, 0.742)),
  puffyDiamond: () => customPolygon([N(0.870, 0.130, R(0.146)), N(0.818, 0.357), N(1.0, 0.332, R(0.853))], 4, true),
  pixelCircle: () => customPolygon([N(0.5, 0), N(0.704, 0), N(0.704, 0.065), N(0.843, 0.065), N(0.843, 0.148), N(0.926, 0.148), N(0.926, 0.296), N(1, 0.296)], 2, true),
  pixelTriangle: () => customPolygon([N(0.110, 0.5), N(0.113, 0), N(0.287, 0), N(0.287, 0.087), N(0.421, 0.087), N(0.421, 0.170), N(0.560, 0.170), N(0.560, 0.265), N(0.674, 0.265), N(0.675, 0.344), N(0.789, 0.344), N(0.789, 0.439), N(0.888, 0.439)], 1, true),
  bun: () => customPolygon([N(0.796, 0.5), N(0.853, 0.518, R(1)), N(0.992, 0.631, R(1)), N(0.968, 1.0, R(1))], 2, true),
  heart: () => customPolygon([N(0.5, 0.268, R(0.016)), N(0.792, -0.066, R(0.958)), N(1.064, 0.276, R(1)), N(0.501, 0.946, R(0.129))], 1, true),
};

// normalized(): approximate bounds (anchors + controls), uniform scale to the
// longer side, centred; then toShape()'s centring of the path's own bounds
function normalize(cubics) {
  const pts = cubics.flat();
  const minX = Math.min(...pts.map((p) => p.x)), maxX = Math.max(...pts.map((p) => p.x));
  const minY = Math.min(...pts.map((p) => p.y)), maxY = Math.max(...pts.map((p) => p.y));
  const w = maxX - minX, h = maxY - minY, side = Math.max(w, h);
  const ox = (side - w) / 2 - minX, oy = (side - h) / 2 - minY;
  return xf(cubics, (p) => P((p.x + ox) / side, (p.y + oy) / side));
}
const f = (v) => +v.toFixed(4);
function toPath(cubics) {
  let d = `M${f(cubics[0][0].x)} ${f(cubics[0][0].y)}`;
  for (const c of cubics) d += `C${f(c[1].x)} ${f(c[1].y)} ${f(c[2].x)} ${f(c[2].y)} ${f(c[3].x)} ${f(c[3].y)}`;
  return d + "Z";
}

const out = {};
for (const [name, build] of Object.entries(SHAPES)) out[name] = toPath(normalize(build()));
const here = path.dirname(fileURLToPath(import.meta.url));
const dest = path.resolve(here, "../../src/hello3/materialShapes.js");
writeFileSync(dest, `// GENERATED by tools/material-shapes/generate.mjs. Do not edit by hand.
// The Material 3 Expressive shape set (35 shapes) as SVG paths in a 0..1 box,
// built with the AndroidX graphics-shapes rounding algorithm from the
// definitions in androidx/compose/material3/MaterialShapes.kt (Apache-2.0,
// The Android Open Source Project). Use with clipPathUnits="objectBoundingBox":
// like RoundedPolygon.toShape(), the shape stretches to the box it clips.
export const MATERIAL_SHAPES = ${JSON.stringify(out, null, 2)};
`);
console.log(Object.keys(out).length, "shapes ->", dest);
