// A 3D favicon that morphs through every regular solid, the round ones, two
// one-sided surfaces (the Möbius strip and the Klein bottle), and then into
// four-dimensional shapes (the 5-cell, 16-cell, tesseract and 24-cell, and a
// moving 3D slice through a tesseract).
//
// HOW IT DRAWS. Each shape is a signed distance field (SDF): a function giving,
// for any point, its distance to the shape's surface. A WebGL2 fragment shader
// ray-marches that field per pixel and lights the hit. Morphing is blending the
// two fields, mix(dA, dB, p), so the surface itself flows from one form into the
// next. That works for any pair, a cube into a torus, a sphere into a wireframe
// tesseract, which the earlier one-mesh morph (vertices sliding between surfaces
// along rays from the centre) could not: a torus has a hole, and arbitrary
// polyhedra came out with sawtooth creases. Polyhedra here are intersections of
// face planes, so their edges are exactly sharp.
//
// SMOOTH MORPHS. Three things keep the hand-over from tearing or snapping:
// smootherstep easing (zero speed and zero acceleration at both ends), a swell
// at mid-morph that rounds every edge and corner while the form is in flight
// (much larger when a wireframe is involved, so thin struts fuse instead of
// leaving scraps), and a shorter march step while two fields are blended, since
// a blend is not an exact distance.
//
// THE 4D SHAPES are real 4D geometry, and the animation is there to show it:
//  - they turn in a double rotation (the xw and yz planes together, plus slow
//    drifts in zw and yw), the motion that makes a tesseract's inner cube roll
//    out through the outer one and turn the whole thing inside out;
//  - the 3D tumble eases down to a third while they are on screen, so the 4D
//    turning is what you watch, not the camera;
//  - depth in w is drawn: vertices are perspective-projected from a viewpoint on
//    the w axis, and each strut and joint is sized and tinted by that same
//    projection, so the near side in w is fat and bright and the far side thin
//    and cool;
//  - between two 4D shapes the morph is a sweep along w: the new polytope
//    materialises from one side of the fourth dimension as the old one
//    dissolves from the other;
//  - the slice is a 4D box turning in 4D while our 3D space also slides along
//    w through it, so its cross-section grows, shrinks and changes shape.
//  - each polytope is filled with a particle cloud: points scattered through
//    its 4D interior, rotated and projected with it, so the inside of the shape
//    has depth in w too (near points larger and brighter). The struts are thin
//    so the cloud reads; they thicken a little at favicon size so they survive.
// Edges go to the shader in a float texture: the 24-cell's 96 are more than
// uniforms can hold.
//
// THE KLEIN BOTTLE is the familiar 3D immersion: a tube that swells into the
// bulb, narrows to a neck, loops over and passes back in through the side. It is
// drawn solid (a chain of round cones along that loop), so from outside you see
// the neck enter the body, which is exactly the picture people know.
//
// The favicon renders at 128px, is scaled to 64, encoded off the main thread and
// pushed into <link rel="icon"> as a PNG blob URL. Ticks come from a Blob worker, not rAF or
// a page setInterval: the favicon is most visible when the user is on ANOTHER
// tab, and that is exactly when rAF stops and page timers drop to 1 Hz.
//
// Falls back to the pre-rendered first frame (public/favicon-sphere.svg, favicon-32.png) under prefers-reduced-motion
// or without WebGL2, and Safari ignores runtime favicon swaps, so it keeps that first frame.

const SIZE = 64;
const SS = 2; // supersample: draw at 128px, downscale for soft edges
const FPS = 24;
const HOLD = 2.0; // seconds each shape tumbles as itself
const MORPH = 1.7; // seconds for the surface to flow into the next shape
const WANDER = 0.03; // the centre of mass never strays more than 3% of the frame
// mid-morph swell, in world units: a little for solids (edges round off in
// flight, then sharpen), a lot when a wireframe or the thin Möbius band is
// involved (thin parts fuse instead of tearing into scraps)
const SWELL_SOLID = 0.07;
const SWELL_WIRE = 0.32;

// ---------------------------------------------------------------- shapes
// `f` is the shape's field in the shader; "WIRE" marks a 4D polytope whose
// projected edges JS computes each frame. The shader's dispatch is generated
// from this list, so the order here is the only order there is.

const S5 = Math.sqrt(5);
const SHAPES = [
  { name: "pyramid", group: "solid", f: "sdPyramid(p)", color: [228, 52, 44] },
  { name: "tetrahedron", group: "solid", f: "sdTetra(p)", color: [245, 124, 32] },
  { name: "cube", group: "solid", f: "sdBox(p, vec3(0.74))", color: [36, 98, 226] },
  { name: "octahedron", group: "solid", f: "sdOcta(p)", color: [46, 170, 90] },
  { name: "dodecahedron", group: "solid", f: "sdDodeca(p)", color: [20, 160, 170] },
  { name: "icosahedron", group: "solid", f: "sdIcosa(p)", color: [124, 72, 214] },
  { name: "sphere", group: "round", f: "length(p) - 1.12", color: [250, 196, 30] },
  { name: "cylinder", group: "round", f: "sdCylinder(p)", color: [40, 170, 230] },
  { name: "cone", group: "round", f: "sdCone(p)", color: [214, 52, 150] },
  { name: "triangular prism", group: "round", f: "sdTriPrism(p)", color: [140, 200, 40] },
  { name: "hexagonal prism", group: "round", f: "sdHexPrism(p)", color: [70, 80, 210] },
  { name: "torus", group: "round", f: "sdTorus(p)", color: [240, 110, 170] },
  { name: "Möbius strip", group: "one-sided", f: "sdMobius(p)", thin: true, color: [255, 150, 30] },
  { name: "Klein bottle", group: "one-sided", f: "sdKlein(p)", color: [230, 60, 90] },
  { name: "5-cell", group: "4d", f: "WIRE", strut: 0.05, color: [60, 220, 170], ...simplex4() },
  { name: "16-cell", group: "4d", f: "WIRE", strut: 0.045, color: [170, 90, 255], ...cross4() },
  { name: "tesseract", group: "4d", f: "WIRE", strut: 0.045, color: [80, 190, 255], ...cube4() },
  { name: "24-cell", group: "4d", f: "WIRE", strut: 0.032, color: [255, 185, 30], ...icositetra4() },
  { name: "tesseract slice", group: "4d", f: "sdSlice(p)", color: [255, 70, 140] },
  // the favicon's last stop (12 Oct): a clay-skin head-shaped blob the cube melts into, under the
  // still of the three.js face (src/lib/faceStill.js), which fades in over it as the blob fades out
  { name: "head", group: "face", face: true, f: "sdHead(p)", color: [242, 205, 170] },
];
const MAX_EDGES = 96; // the 24-cell's count: the edge texture is this wide
// how fast the 3D tumble runs while each shape is on screen: slow for the 4D
// ones, so their own rotation through w is what reads
const TUMBLE = SHAPES.map((s) => (s.face ? 0.2 : s.f === "WIRE" ? 0.3 : s.group === "4d" ? 0.45 : 1));

// Particle clouds for the 4D polytopes: points inside each one's 4D hull, as
// random weightings of its vertices. Dirichlet weights with alpha 0.5 (squared
// normals) push the points out toward the cells and faces instead of piling
// them in the middle. Seeded, so every load fills the shapes the same way.
const MAX_PARTICLES = 1400;
function mulberry32(a) {
  return () => {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
function cloud(verts, seed) {
  const rnd = mulberry32(seed);
  const normal = () => Math.sqrt(-2 * Math.log(1 - rnd())) * Math.cos(2 * Math.PI * rnd());
  const out = new Float32Array(MAX_PARTICLES * 4);
  for (let n = 0; n < MAX_PARTICLES; n++) {
    let sum = 0;
    const acc = [0, 0, 0, 0];
    for (const v of verts) {
      const w = normal() ** 2;
      sum += w;
      for (let k = 0; k < 4; k++) acc[k] += w * v[k];
    }
    out.set(acc.map((c) => c / sum), n * 4);
  }
  return out;
}
SHAPES.forEach((s, i) => s.f === "WIRE" && (s.cloud = cloud(s.verts, 1000 + i)));

// 4D polytopes, scaled so their projections fill about the same frame as the solids
function scale4(verts, r) {
  const n = Math.hypot(...verts[0]);
  return verts.map((v) => v.map((c) => (c * r) / n));
}
function withEdges(verts) {
  // every polytope here is regular: its edges are exactly the closest pairs
  let len = Infinity;
  for (let i = 1; i < verts.length; i++) len = Math.min(len, Math.hypot(...verts[0].map((c, k) => c - verts[i][k])));
  const edges = [];
  for (let i = 0; i < verts.length; i++)
    for (let j = i + 1; j < verts.length; j++) {
      const d = Math.hypot(...verts[i].map((c, k) => c - verts[j][k]));
      if (Math.abs(d - len) < 1e-6) edges.push([i, j]);
    }
  return { verts, edges };
}
function simplex4() {
  const w = -1 / S5; // 5 vertices, 10 edges
  return withEdges(scale4([[1, 1, 1, w], [1, -1, -1, w], [-1, 1, -1, w], [-1, -1, 1, w], [0, 0, 0, 4 / S5]], 1.25));
}
function cross4() {
  const verts = []; // 8 vertices, 24 edges
  for (let k = 0; k < 4; k++) for (const s of [1, -1]) verts.push([0, 0, 0, 0].map((_, i) => (i === k ? s : 0)));
  return withEdges(scale4(verts, 1.25));
}
function cube4() {
  const verts = []; // 16 vertices, 32 edges
  for (let i = 0; i < 16; i++) verts.push([0, 1, 2, 3].map((b) => ((i >> b) & 1 ? 1 : -1)));
  return withEdges(scale4(verts, 1.16));
}
function icositetra4() {
  const verts = []; // 24 vertices, 96 edges: every permutation of (±1, ±1, 0, 0)
  for (let i = 0; i < 4; i++)
    for (let j = i + 1; j < 4; j++)
      for (const a of [1, -1])
        for (const b of [1, -1]) verts.push([0, 1, 2, 3].map((k) => (k === i ? a : k === j ? b : 0)));
  return withEdges(scale4(verts, 1.2));
}

// The Klein bottle's centre line, in the xy plane, as [x, y, radius]: up through
// the bulb, narrowing to the neck, over the top, down the outside, and back in
// through the side of the bulb. Smoothed with Catmull-Rom and baked into the
// shader as a chain of round cones.
const KLEIN_PATH = [
  [0.15, -0.85, 0.3], [0.25, -0.45, 0.55], [0.25, 0.05, 0.42], [0.2, 0.45, 0.16], [0.02, 0.84, 0.13],
  [-0.45, 0.92, 0.12], [-0.76, 0.48, 0.12], [-0.78, -0.12, 0.12], [-0.52, -0.46, 0.12], [-0.12, -0.42, 0.12],
];
function kleinChain(steps = 3) {
  const P = KLEIN_PATH, out = [];
  const at = (i) => P[Math.max(0, Math.min(P.length - 1, i))];
  for (let i = 0; i < P.length - 1; i++)
    for (let s = 0; s < steps; s++) {
      const t = s / steps, t2 = t * t, t3 = t2 * t;
      const [a, b, c, d] = [at(i - 1), at(i), at(i + 1), at(i + 2)];
      out.push([0, 1, 2].map((k) => 0.5 * (2 * b[k] + (-a[k] + c[k]) * t + (2 * a[k] - 5 * b[k] + 4 * c[k] - d[k]) * t2 + (-a[k] + 3 * b[k] - 3 * c[k] + d[k]) * t3)));
    }
  out.push(P[P.length - 1]);
  // centre the whole thing in its bounding box so it spins in place
  const lo = [Infinity, Infinity], hi = [-Infinity, -Infinity];
  for (const [x, y, r] of out) {
    lo[0] = Math.min(lo[0], x - r); hi[0] = Math.max(hi[0], x + r);
    lo[1] = Math.min(lo[1], y - r); hi[1] = Math.max(hi[1], y + r);
  }
  const cx = (lo[0] + hi[0]) / 2, cy = (lo[1] + hi[1]) / 2;
  // scaled so its longest side spans 2.5 units, like the other shapes
  const k = 2.5 / Math.max(hi[0] - lo[0], hi[1] - lo[1]);
  return out.map(([x, y, r]) => [(x - cx) * k, (y - cy) * k, r * k]);
}
const KLEIN = kleinChain();
const f3 = (n) => n.toFixed(4);

// ---------------------------------------------------------------- motion
// Each rotation axis is a steady drift plus three sines at irrational ratios, so
// the tumble never repeats and never settles into an obvious loop. Phases are
// seeded per page load. The 4D shapes get three more angles, in the planes that
// include w. The centre wanders by unit offsets that paint() scales.

const PHI = 1.618033988749895;

function makeMotion(seed = Math.random) {
  const ph = () => seed() * Math.PI * 2;
  const axis = (drift, amp) => {
    const p = [ph(), ph(), ph()];
    const f = [0.37, 0.37 * PHI, 0.37 * Math.SQRT2 * PHI];
    return (t) => drift * t + amp * (Math.sin(f[0] * t + p[0]) + 0.6 * Math.sin(f[1] * t + p[1]) + 0.35 * Math.sin(f[2] * t + p[2]));
  };
  // three different drifts (and one reversed) so no axis dominates
  const rx = axis(0.55, 0.9), ry = axis(0.9, 1.1), rz = axis(-0.4, 0.8);
  // 4D: one angle drives the xw and yz planes together (the double rotation),
  // two slower ones drift zw and yw so it never settles into a loop
  const dbl = axis(0.62, 0.35), zw = axis(0.19, 0.5), yw = axis(-0.13, 0.4);
  const wander = () => {
    const p = [ph(), ph()];
    // the two terms sum to at most 1
    return (t) => 0.65 * Math.sin(0.53 * t + p[0]) + 0.35 * Math.sin(0.53 * PHI * Math.SQRT2 * t + p[1]);
  };
  const ox = wander(), oy = wander();
  // tau: "tumble time", which runs slow during the 4D shapes (see tumbleTime)
  return (t, tau = t) => ({ rx: rx(tau), ry: ry(tau), rz: rz(tau), dbl: dbl(t), zw: zw(t), yw: yw(t), ox: ox(t), oy: oy(t) });
}

// The 3D tumble's clock: real time weighted by TUMBLE for whichever shape is on
// screen, eased between shapes the same way the morph is. Closed form (the
// smootherstep's integral is x^6 - 3x^5 + 2.5x^4), so scrubbing or jumping to
// any time gives the same pose as playing up to it: no drift, no jump.
const smoothInt = (x) => x ** 6 - 3 * x ** 5 + 2.5 * x ** 4;
function tumbleTime(t, hold, morph, seq) {
  const N = seq.length, cycle = hold + morph;
  const tm = (i) => TUMBLE[seq[i % N]];
  const seg = (i) => hold * tm(i) + morph * (tm(i) + tm(i + 1)) / 2;
  let perLoop = 0;
  for (let i = 0; i < N; i++) perLoop += seg(i);
  const loops = Math.floor(t / (cycle * N));
  let rest = t - loops * cycle * N, tau = loops * perLoop;
  for (let i = 0; i < N && rest > 0; i++) {
    if (rest >= cycle) { tau += seg(i); rest -= cycle; continue; }
    const a = tm(i), b = tm(i + 1);
    if (rest <= hold) return tau + rest * a;
    const x = (rest - hold) / morph;
    return tau + hold * a + morph * (a * x + (b - a) * smoothInt(x));
  }
  return tau;
}

// Rx * Ry * Rz, column-major for WebGL
function rot3({ rx, ry, rz }) {
  const [ca, sa, cb, sb, cc, sc] = [Math.cos(rx), Math.sin(rx), Math.cos(ry), Math.sin(ry), Math.cos(rz), Math.sin(rz)];
  const r = [
    [cb * cc, -cb * sc, sb],
    [sa * sb * cc + ca * sc, -sa * sb * sc + ca * cc, -sa * cb],
    [-ca * sb * cc + sa * sc, ca * sb * sc + sa * cc, ca * cb],
  ];
  return [r[0][0], r[1][0], r[2][0], r[0][1], r[1][1], r[2][1], r[0][2], r[1][2], r[2][2]];
}

// the double rotation (xw and yz by the same angle) then zw and yw drifts, as a
// row-major 4x4 for JS use
function rot4({ dbl, zw, yw }) {
  const plane = (i, a) => { // i: the pair of axes the plane spans
    const m = [[1, 0, 0, 0], [0, 1, 0, 0], [0, 0, 1, 0], [0, 0, 0, 1]];
    const c = Math.cos(a), s = Math.sin(a);
    m[i[0]][i[0]] = c; m[i[0]][i[1]] = -s; m[i[1]][i[0]] = s; m[i[1]][i[1]] = c;
    return m;
  };
  const mul = (A, B) => A.map((row) => B[0].map((_, j) => row.reduce((s, v, k) => s + v * B[k][j], 0)));
  return [plane([1, 2], dbl), plane([2, 3], zw), plane([1, 3], yw)].reduce(mul, plane([0, 3], dbl));
}

// 4D -> 3D: rotate, then perspective along w from a viewpoint at w = 3. Writes
// each edge's endpoints into the edge texture's backing array: rows `row` and
// `row + 1` hold xyz plus the strut radius there, rows `row + 4` and `row + 5`
// hold the projection factor k (bigger = nearer in w) for the tint.
// `fade(w)` scales the strut along w, which is how the 4D sweep morph works.
const W_EYE = 3;
const W_MAX = 1.25; // the polytopes' 4D radius: w runs -W_MAX..W_MAX
function projectEdges(shape, R, data, row, fade, scale = 1) {
  const P = shape.verts.map((v) => {
    const q = R.map((r) => r[0] * v[0] + r[1] * v[1] + r[2] * v[2] + r[3] * v[3]);
    const k = W_EYE / (W_EYE - q[3]);
    return [q[0] * k, q[1] * k, q[2] * k, shape.strut * scale * k * fade(q[3]), k];
  });
  const put = (r, e, v) => data.set(v, (r * MAX_EDGES + e) * 4);
  shape.edges.forEach(([i, j], e) => {
    put(row, e, P[i].slice(0, 4));
    put(row + 1, e, P[j].slice(0, 4));
    put(row + 4, e, [P[i][4], 0, 0, 0]);
    put(row + 5, e, [P[j][4], 0, 0, 0]);
  });
  return shape.edges.length;
}

// The sweep along w: 0 before the front reaches this w, 1 after, with the front
// travelling from w = +W_MAX to -W_MAX as p goes 0 -> 1.
function sweep(p, w) {
  const x = Math.min(1, Math.max(0, p * 1.8 - 0.4 + 0.4 * (w / W_MAX)));
  return x * x * (3 - 2 * x);
}

// ---------------------------------------------------------------- colour
// Colour blends through hue so the morph never passes through a muddy grey.

function rgbToHsl([r, g, b]) {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b), l = (max + min) / 2, d = max - min;
  if (!d) return [0, 0, l];
  const s = d / (1 - Math.abs(2 * l - 1));
  const h = max === r ? ((g - b) / d) % 6 : max === g ? (b - r) / d + 2 : (r - g) / d + 4;
  return [(h * 60 + 360) % 360, s, l];
}
function hslToRgb([h, s, l]) {
  const c = (1 - Math.abs(2 * l - 1)) * s, x = c * (1 - Math.abs(((h / 60) % 2) - 1)), m = l - c / 2;
  const [r, g, b] = h < 60 ? [c, x, 0] : h < 120 ? [x, c, 0] : h < 180 ? [0, c, x] : h < 240 ? [0, x, c] : h < 300 ? [x, 0, c] : [c, 0, x];
  return [(r + m) * 255, (g + m) * 255, (b + m) * 255];
}
function mixColor(HSL, i, j, p) {
  const [a, b] = [HSL[i], HSL[j]];
  let dh = b[0] - a[0];
  if (dh > 180) dh -= 360;
  if (dh < -180) dh += 360;
  return hslToRgb([(a[0] + dh * p + 360) % 360, a[1] + (b[1] - a[1]) * p, a[2] + (b[2] - a[2]) * p]);
}

// ---------------------------------------------------------------- shader

const VERT = `#version 300 es
in vec2 aPos; void main(){ gl_Position = vec4(aPos, 0.0, 1.0); }`;

// Sizes are tuned so every shape's far corner sits about 1.1 to 1.35 units out,
// which fills the frame (half-width 1.5625 units at z = 0).
const FRAG = `#version 300 es
precision highp float;
uniform vec2 uRes;
uniform mat3 uRot;
uniform vec2 uOff;
uniform float uIdA, uIdB, uMix, uSwell, uStep, uBlob;
uniform vec3 uColor;
uniform mat4 uR4;               // 4D rotation, for the slice
uniform highp sampler2D uEdges; // rows 0-3: A start, A end, B start, B end (xyz, radius); rows 4-7: their k
uniform int uNA, uNB;
uniform float uSliceW;          // where our 3D space cuts the 4D box, along w
uniform float uTintA, uTintB;   // how much of the w-depth tint each side carries
out vec4 outColor;

const float PHI = 1.618033988749895;
// normalize(-0.5, 0.8, 0.9), and its Blinn half-vector with a viewer down -z
const vec3 LIGHT = vec3(-0.3835, 0.6136, 0.6903);
const vec3 HALF = vec3(-0.2086, 0.3337, 0.9192);

// a head-sized ovoid: a touch taller than wide, the face's proportions
float sdHead(vec3 p){ return (length(p / vec3(0.9, 1.04, 0.95)) - 1.0) * 0.9; }
float sdBox(vec3 p, vec3 b){ vec3 q = abs(p) - b; return length(max(q, 0.0)) + min(max(q.x, max(q.y, q.z)), 0.0); }

// square pyramid, base 1.8 wide, 1.71 tall, centred on its solid centroid (a
// quarter of the way up); after Inigo Quilez's exact pyramid
float sdPyramid(vec3 p){
  const float S = 1.8; const float H = 0.95;
  p.y += 0.4275; p /= S;
  float m2 = H * H + 0.25;
  p.xz = abs(p.xz);
  p.xz = (p.z > p.x) ? p.zx : p.xz;
  p.xz -= 0.5;
  vec3 q = vec3(p.z, H * p.y - 0.5 * p.x, H * p.x + 0.5 * p.y);
  float s = max(-q.x, 0.0);
  float t = clamp((q.y - 0.5 * p.z) / (m2 + 0.25), 0.0, 1.0);
  float a = m2 * (q.x + s) * (q.x + s) + q.y * q.y;
  float b = m2 * (q.x + 0.5 * t) * (q.x + 0.5 * t) + (q.y - m2 * t) * (q.y - m2 * t);
  float d2 = min(q.y, -q.x * m2 - q.y * 0.5) > 0.0 ? 0.0 : min(a, b);
  return sqrt((d2 + q.z * q.z) / m2) * sign(max(q.z, -p.y)) * S;
}

// convex polyhedra as the max over their face planes (a safe lower bound)
float sdTetra(vec3 p){
  float d = max(max(dot(p, vec3(1,1,1)), dot(p, vec3(-1,-1,1))), max(dot(p, vec3(-1,1,-1)), dot(p, vec3(1,-1,-1))));
  return d * 0.57735 - 0.45;
}
float sdOcta(vec3 p){ p = abs(p); return (p.x + p.y + p.z) * 0.57735 - 0.72; }
float sdDodeca(vec3 p){
  p = abs(p);
  vec3 n1 = normalize(vec3(0.0, 1.0, PHI)), n2 = normalize(vec3(1.0, PHI, 0.0)), n3 = normalize(vec3(PHI, 0.0, 1.0));
  return max(max(dot(p, n1), dot(p, n2)), dot(p, n3)) - 0.92;
}
float sdIcosa(vec3 p){
  p = abs(p);
  float g = 1.0 / PHI;
  float d = max(max(dot(p, vec3(1.0)), dot(p, vec3(0.0, g, PHI))), max(dot(p, vec3(g, PHI, 0.0)), dot(p, vec3(PHI, 0.0, g))));
  return d * 0.57735 - 0.95;
}
float sdCylinder(vec3 p){
  vec2 d = abs(vec2(length(p.xz), p.y)) - vec2(0.85, 0.75);
  return min(max(d.x, d.y), 0.0) + length(max(d, 0.0));
}
// cone: base radius 1, height 1.6, centred on its centroid (a quarter up)
float sdCone(vec3 p){
  const float h = 0.8; const float r1 = 1.0;
  p.y -= h * 0.5;
  vec2 q = vec2(length(p.xz), p.y);
  vec2 k1 = vec2(0.0, h), k2 = vec2(-r1, 2.0 * h);
  vec2 ca = vec2(q.x - min(q.x, (q.y < 0.0) ? r1 : 0.0), abs(q.y) - h);
  vec2 cb = q - k1 + k2 * clamp(dot(k1 - q, k2) / dot(k2, k2), 0.0, 1.0);
  float s = (cb.x < 0.0 && ca.y < 0.0) ? -1.0 : 1.0;
  return s * sqrt(min(dot(ca, ca), dot(cb, cb)));
}
float sdTriPrism(vec3 p){
  vec3 q = abs(p);
  return max(q.z - 0.72, max(q.x * 0.866025 + p.y * 0.5, -p.y) - 0.56);
}
float sdHexPrism(vec3 p){
  const vec3 k = vec3(-0.8660254, 0.5, 0.57735);
  vec2 h = vec2(0.8, 0.7);
  p = abs(p);
  p.xy -= 2.0 * min(dot(k.xy, p.xy), 0.0) * k.xy;
  vec2 d = vec2(length(p.xy - vec2(clamp(p.x, -k.z * h.x, k.z * h.x), h.x)) * sign(p.y - h.x), p.z - h.y);
  return min(max(d.x, d.y), 0.0) + length(max(d, 0.0));
}
float sdTorus(vec3 p){ return length(vec2(length(p.xz) - 0.82, p.y)) - 0.36; }

// Möbius strip: a flat band whose cross-section turns half a revolution on the
// way round. At the seam (angle ±pi) the two ends meet turned 180 degrees apart,
// and a rectangle is the same shape turned 180, so the band closes on itself
// with the twist in it. The twist stretches space, so the field is scaled down.
float sdMobius(vec3 p){
  float a = atan(p.z, p.x);
  vec2 q = vec2(length(p.xz) - 0.86, p.y);
  float c = cos(a * 0.5), s = sin(a * 0.5);
  q = mat2(c, -s, s, c) * q;
  vec2 d = abs(q) - vec2(0.38, 0.075);
  return (length(max(d, 0.0)) + min(max(d.x, d.y), 0.0)) * 0.7;
}

// round cone between spheres (a, r1) and (b, r2); Inigo Quilez's exact form
float sdRoundCone(vec3 p, vec3 a, vec3 b, float r1, float r2){
  vec3 ba = b - a; float l2 = dot(ba, ba); float rr = r1 - r2; float a2 = l2 - rr * rr; float il2 = 1.0 / l2;
  vec3 pa = p - a; float y = dot(pa, ba); float z = y - l2;
  vec3 xv = pa * l2 - ba * y; float x2 = dot(xv, xv);
  float y2 = y * y * l2; float z2 = z * z * l2;
  float k = sign(rr) * rr * rr * x2;
  if (sign(z) * a2 * z2 > k) return sqrt(x2 + z2) * il2 - r2;
  if (sign(y) * a2 * y2 < k) return sqrt(x2 + y2) * il2 - r1;
  return (sqrt(x2 * a2 * il2) + y * rr) * il2 - r1;
}
const int KN = ${KLEIN.length};
const vec3 KLEIN[KN] = vec3[KN](${KLEIN.map(([x, y, r]) => `vec3(${f3(x)}, ${f3(y)}, ${f3(r)})`).join(", ")});
float sdKlein(vec3 p){
  float d = 1e3;
  for (int i = 0; i < KN - 1; i++) {
    vec3 a = KLEIN[i], b = KLEIN[i + 1];
    d = min(d, sdRoundCone(p, vec3(a.xy, 0.0), vec3(b.xy, 0.0), a.z, b.z));
  }
  return d;
}

// a 4D box rotating in 4D, cut by the 3D space w = uSliceW
float sdSlice(vec3 p){
  vec4 q = uR4 * vec4(p, uSliceW);
  vec4 d = abs(q) - vec4(0.66);
  return length(max(d, 0.0)) + min(max(max(d.x, d.y), max(d.z, d.w)), 0.0);
}

// struts are round cones whose radius follows the w-projection at each end, and
// each vertex gets a joint half again as thick
float wire(vec3 p, int row, int n){
  // cheap reject: nothing in any of these lies beyond 1.75 units out
  float far = length(p) - 1.75;
  if (far > 0.3) return far;
  float d = 1e3;
  for (int i = 0; i < ${MAX_EDGES}; i++) {
    if (i >= n) break;
    vec4 a = texelFetch(uEdges, ivec2(i, row), 0), b = texelFetch(uEdges, ivec2(i, row + 1), 0);
    if (a.w + b.w < 0.02) continue; // all but swept away: draw nothing, not a hairline
    // cheap bound first: a capsule as fat as the strut's fattest joint. Most
    // struts are further away than the nearest one found so far, and skipping
    // the exact round cone for those is what keeps the 24-cell's 96 affordable.
    vec3 pa = p - a.xyz, ba = b.xyz - a.xyz;
    float rMax = max(a.w, b.w) * 1.5;
    if (length(pa - ba * clamp(dot(pa, ba) / dot(ba, ba), 0.0, 1.0)) - rMax >= d) continue;
    d = min(d, sdRoundCone(p, a.xyz, b.xyz, a.w, b.w));
    d = min(d, min(length(pa) - a.w * 1.5, length(p - b.xyz) - b.w * 1.5));
  }
  return d;
}
// the w-projection factor k at the strut nearest p, for the depth tint
float wireK(vec3 p, int row, int n){
  float best = 1e3, k = 1.0;
  for (int i = 0; i < ${MAX_EDGES}; i++) {
    if (i >= n) break;
    vec4 a = texelFetch(uEdges, ivec2(i, row), 0), b = texelFetch(uEdges, ivec2(i, row + 1), 0);
    if (a.w + b.w < 0.02) continue;
    vec3 pa = p - a.xyz, ba = b.xyz - a.xyz;
    float h = clamp(dot(pa, ba) / dot(ba, ba), 0.0, 1.0);
    float d = length(pa - ba * h) - mix(a.w, b.w, h);
    if (d < best) { best = d; k = mix(texelFetch(uEdges, ivec2(i, row + 4), 0).x, texelFetch(uEdges, ivec2(i, row + 5), 0).x, h); }
  }
  return k;
}

float shape(float id, vec3 p, bool a){
${SHAPES.map((s, i) => `  if (id < ${i}.5) return ${s.f === "WIRE" ? "a ? wire(p, 0, uNA) : wire(p, 2, uNB)" : s.f};`).join("\n")}
  return 1e3;
}

float map(vec3 w){
  vec3 p = (w - vec3(uOff, 0.0)) * uRot; // world -> object (uRot is orthonormal)
  float da = shape(uIdA, p, true);
  if (uMix <= 0.0) return da;
  float db = shape(uIdB, p, false);
  // two wireframes: union them; the w-sweep has already shrunk one set of
  // struts and grown the other, so nothing needs blending
  if (uNA > 0 && uNB > 0) return min(da, db);
  return mix(da, db, uMix) - uSwell;
}

vec3 normalAt(vec3 p, float e){
  const vec2 k = vec2(1.0, -1.0);
  return normalize(k.xyy * map(p + k.xyy * e) + k.yyx * map(p + k.yyx * e) + k.yxy * map(p + k.yxy * e) + k.xxx * map(p + k.xxx * e));
}

void main(){
  vec2 uv = (gl_FragCoord.xy * 2.0 - uRes) / uRes.y;
  const float TAN = 0.372;
  vec3 ro = vec3(0.0, 0.0, 4.2);
  vec3 rd = normalize(vec3(uv * TAN, -1.0));
  float pix = 2.0 * TAN / uRes.y;   // one pixel, as an angle

  // skip rays that miss the bounding sphere (radius 1.7: the largest shape,
  // the mid-morph swell and the 3% wander)
  float b = dot(ro, rd), c = dot(ro, ro) - 2.9;
  float disc = b * b - c;
  if (disc < 0.0) { outColor = vec4(0.0); return; }
  float t = max(0.0, -b - sqrt(disc));
  float tEnd = -b + sqrt(disc);

  // march; remember the closest approach for a one-pixel anti-aliased edge
  float best = 1e3, tBest = t;
  bool hit = false;
  for (int i = 0; i < 128; i++) {
    float d = map(ro + rd * t);
    float r = d / t;
    if (r < best) { best = r; tBest = t; }
    if (d < 0.0005 * t) { hit = true; break; }
    t += d * uStep;
    if (t > tEnd) break;
  }
  float alpha = hit ? 1.0 : clamp(1.0 - best / pix, 0.0, 1.0);
  if (alpha <= 0.0) { outColor = vec4(0.0); return; }
  vec3 p = ro + rd * (hit ? t : tBest);
  // normal sampled about half a pixel wide: no shimmer on fine detail
  vec3 n = normalAt(p, max(0.0012, pix * t * 0.5));

  // key light (Lambert), a rim that lifts faces turning away so the silhouette
  // separates from a dark tab, and a white Blinn glint
  float rim = pow(1.0 - max(n.z, 0.0), 3.0) * 0.35;
  float lum = min(1.0, 0.15 + 0.85 * max(dot(n, LIGHT), 0.0) + rim);
  float glint = pow(max(dot(n, HALF), 0.0), 48.0) * 0.55;
  vec3 col = uColor / 255.0;
  // depth in w: near struts (k > 1) lift toward white, far ones (k < 1) dim
  // (a touch cooler, not enough to turn yellow olive)
  float tintW = (uNA > 0 ? uTintA : 0.0) + (uNB > 0 ? uTintB : 0.0);
  if (tintW > 0.0) {
    vec3 q = (p - vec3(uOff, 0.0)) * uRot;
    float kA = uNA > 0 ? wireK(q, 0, uNA) : 1.0, kB = uNB > 0 ? wireK(q, 2, uNB) : 1.0;
    float k = uNA > 0 && uNB > 0 ? mix(kA, kB, uMix) : (uNA > 0 ? kA : kB);
    float near = smoothstep(0.72, 1.55, k);
    vec3 tinted = mix(col * vec3(0.5, 0.52, 0.62), col + (1.0 - col) * 0.35, near);
    col = mix(col, tinted, clamp(tintW, 0.0, 1.0));
  }
  vec3 base = col * 0.4 + (col + (1.0 - col) * 0.25 - col * 0.4) * lum;
  base += (1.0 - base) * glint;
  outColor = vec4(base * alpha, alpha) * uBlob;
}
`;

// The particle pass: each point is a 4D position, rotated by R4 (uploaded
// row-major, so aP * uR4 is R4 times aP), projected along w, then placed by the
// same 3D rotation, offset and camera as the ray march.
const PVERT = `#version 300 es
in vec4 aP;
uniform mat4 uR4;
uniform mat3 uRot;
uniform vec2 uOff;
uniform float uRes, uSize, uSweepP, uAlpha;
uniform int uMode; // 0 whole cloud, 1 dissolving (1 - sweep), 2 materialising (sweep)
out float vNear, vA;
const float TAN = 0.372;
float sweep(float p, float w){ float x = clamp(p * 1.8 - 0.4 + 0.4 * (w / ${W_MAX.toFixed(2)}), 0.0, 1.0); return x * x * (3.0 - 2.0 * x); }
void main(){
  vec4 q = aP * uR4;
  float k = ${W_EYE.toFixed(1)} / (${W_EYE.toFixed(1)} - q.w);
  vec3 w = uRot * (q.xyz * k) + vec3(uOff, 0.0);
  float z = 4.2 - w.z;
  gl_Position = vec4(w.xy / (z * TAN), 0.0, 1.0);
  float fade = uMode == 1 ? 1.0 - sweep(uSweepP, q.w) : (uMode == 2 ? sweep(uSweepP, q.w) : 1.0);
  vNear = smoothstep(0.72, 1.55, k);
  vA = uAlpha * fade;
  gl_PointSize = max(1.0, uSize * k * uRes / (z * TAN * 2.0));
}`;
const PFRAG = `#version 300 es
precision highp float;
in float vNear, vA;
uniform vec3 uColor;
out vec4 outColor;
void main(){
  float a = smoothstep(0.5, 0.12, length(gl_PointCoord - 0.5)) * vA;
  vec3 c = uColor / 255.0;
  vec3 col = mix(c * 0.7, c + (1.0 - c) * 0.55, vNear);
  outColor = vec4(col * a, a);
}`;

// The face still: the three.js render of the head, laid over the frame, premultiplied.
const FFRAG = `#version 300 es
precision highp float;
uniform sampler2D uFace;
uniform vec2 uRes;
uniform float uA;
out vec4 outColor;
void main(){ outColor = texture(uFace, gl_FragCoord.xy / uRes) * uA; }`;

function compile(gl) {
  const sh = (type, src) => {
    const s = gl.createShader(type);
    gl.shaderSource(s, src);
    gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s));
    return s;
  };
  const link = (vs, fs) => {
    const pr = gl.createProgram();
    gl.attachShader(pr, sh(gl.VERTEX_SHADER, vs));
    gl.attachShader(pr, sh(gl.FRAGMENT_SHADER, fs));
    gl.linkProgram(pr);
    if (!gl.getProgramParameter(pr, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(pr));
    return pr;
  };
  const prog = link(VERT, FRAG);
  const pts = link(PVERT, PFRAG);
  const face = link(VERT, FFRAG);
  gl.useProgram(prog);
  const quad = gl.createVertexArray();
  gl.bindVertexArray(quad);
  const buf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
  const loc = gl.getAttribLocation(prog, "aPos");
  gl.enableVertexAttribArray(loc);
  gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
  // edge texture: MAX_EDGES wide, 8 rows (see projectEdges)
  const tex = gl.createTexture();
  gl.activeTexture(gl.TEXTURE0);
  gl.bindTexture(gl.TEXTURE_2D, tex);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA32F, MAX_EDGES, 8, 0, gl.RGBA, gl.FLOAT, null);
  const u = {};
  for (const n of ["uRes", "uRot", "uOff", "uIdA", "uIdB", "uMix", "uSwell", "uStep", "uColor", "uR4", "uEdges", "uNA", "uNB", "uSliceW", "uTintA", "uTintB", "uBlob"])
    u[n] = gl.getUniformLocation(prog, n);
  gl.uniform1i(u.uEdges, 0);
  // one vertex array per 4D cloud, uploaded once
  const clouds = SHAPES.map((s) => {
    if (!s.cloud) return null;
    const vao = gl.createVertexArray();
    gl.bindVertexArray(vao);
    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
    gl.bufferData(gl.ARRAY_BUFFER, s.cloud, gl.STATIC_DRAW);
    const at = gl.getAttribLocation(pts, "aP");
    gl.enableVertexAttribArray(at);
    gl.vertexAttribPointer(at, 4, gl.FLOAT, false, 0, 0);
    return vao;
  });
  const pu = {};
  for (const n of ["uR4", "uRot", "uOff", "uRes", "uSize", "uSweepP", "uAlpha", "uMode", "uColor"]) pu[n] = gl.getUniformLocation(pts, n);
  const fu = { uFace: gl.getUniformLocation(face, "uFace"), uRes: gl.getUniformLocation(face, "uRes"), uA: gl.getUniformLocation(face, "uA") };
  return { u, prog, pts, pu, quad, clouds, face, fu };
}

// ---------------------------------------------------------------- painter

const smooth = (t) => t * t * t * (t * (t * 6 - 15) + 10); // smootherstep

// the bench lists the real solids and polytopes; the head belongs to the favicon
export const SHAPE_NAMES = SHAPES.filter((s) => !s.face).map((s) => s.name);
export const SHAPE_GROUPS = SHAPES.filter((s) => !s.face).map((s) => s.group);

// The tab icon's own run (12 Oct, Agam: "only between 3 shapes, sphere, pyramid and the cube with
// the 3 primary colours, and the final image added to the morph is the three.js face"): three
// solids in red, yellow and blue, then the face, then round again.
const FAVICON_SEQUENCE = [
  { name: "sphere", color: [228, 52, 44] },
  { name: "pyramid", color: [250, 196, 30] },
  { name: "cube", color: [36, 98, 226] },
  { name: "head" },
];
export const DEFAULTS = { hold: HOLD, morph: MORPH, wander: WANDER, spinX: 0, spinY: 0 };

/**
 * Paints the scene at time `t` (seconds) onto a 2D `ctx`, any size. The favicon
 * and the /lab bench both draw through this, so the big view is the real thing.
 * Returns a painter bound to its own motion seed, or null without WebGL2.
 * `paint(t, opts)` takes live overrides of DEFAULTS; `paint.state(t, opts)`
 * reports which shapes and how far through the morph a time lands.
 */
export function createFaviconPainter(ctx, { supersample = 1, particles, noBlit = false, sequence } = {}) {
  const glCanvas = document.createElement("canvas");
  glCanvas.width = glCanvas.height = ctx.canvas.width * supersample;
  const gl = glCanvas.getContext("webgl2", { premultipliedAlpha: true, antialias: false, preserveDrawingBuffer: true });
  if (!gl) return null;
  // If the GPU drops the context (a driver reset, too many contexts), stop
  // drawing; startFavicon3d sees paint.lost and puts the static face back.
  glCanvas.addEventListener("webglcontextlost", () => (paint.lost = true));
  let u, P;
  try {
    P = compile(gl);
    u = P.u;
  } catch (err) {
    console.warn("favicon3d: shader failed", err);
    return null;
  }
  const motion = makeMotion();
  const edges = new Float32Array(MAX_EDGES * 8 * 4);
  ctx.imageSmoothingQuality = "high";
  // which shapes, in what order and colour: the whole list (the bench) unless a sequence is given
  const seq = sequence ? sequence.map((e) => SHAPES.findIndex((x) => x.name === e.name)) : SHAPES.filter((x) => !x.face).map((_, i) => i);
  const HSL = seq.map((si, k) => rgbToHsl((sequence && sequence[k].color) || SHAPES[si].color));
  const N = seq.length;
  const W0 = glCanvas.width;
  // a small render (the favicon) gets fewer, slightly fatter points and struts
  const small = W0 <= 160;
  const nPts = Math.min(MAX_PARTICLES, particles ?? (small ? 300 : MAX_PARTICLES));
  const strutScale = Math.min(1.6, Math.max(1, 200 / W0));

  const state = (t, o = DEFAULTS) => {
    const cycle = o.hold + o.morph;
    const idx = ((Math.floor(t / cycle) % N) + N) % N;
    const local = ((t % cycle) + cycle) % cycle;
    const p = local <= o.hold ? 0 : smooth((local - o.hold) / o.morph);
    return { idx, next: (idx + 1) % N, p };
  };

  // the face still, uploaded once it has rendered (setFace): texture unit 1, unit 0 is the edges
  let faceTex = null;
  const setFace = (canvas) => {
    if (!canvas || paint.lost) return;
    faceTex = faceTex || gl.createTexture();
    gl.activeTexture(gl.TEXTURE1);
    gl.bindTexture(gl.TEXTURE_2D, faceTex);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, canvas);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
    gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false);
    gl.generateMipmap(gl.TEXTURE_2D);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.activeTexture(gl.TEXTURE0);
  };

  function paint(t, opts) {
    if (paint.lost) return;
    const o = opts ? { ...DEFAULTS, ...opts } : DEFAULTS;
    const { idx, next, p } = state(t, o);
    const [A, B] = [SHAPES[seq[idx]], SHAPES[seq[next]]];
    const m = motion(t, tumbleTime(t, o.hold, o.morph, seq));
    const R4 = rot4(m);
    const W = glCanvas.width;
    gl.useProgram(P.prog);
    gl.bindVertexArray(P.quad);
    gl.viewport(0, 0, W, W);
    gl.uniform2f(u.uRes, W, W);
    const rot = rot3({ rx: m.rx + o.spinX, ry: m.ry + o.spinY, rz: m.rz });
    // the wander, as a fraction of the frame, in world units at the object's depth
    const off = [(m.ox * o.wander) / 0.32, -(m.oy * o.wander) / 0.32];
    gl.uniformMatrix3fv(u.uRot, false, rot);
    gl.uniform2f(u.uOff, off[0], off[1]);
    gl.uniform1f(u.uIdA, seq[idx]);
    gl.uniform1f(u.uIdB, seq[next]);
    // how much of the head the face has taken over: 1 on the face, 0 anywhere else
    const presence = (A.face ? 1 - p : 0) + (B.face ? p : 0);
    const sm = (a, b, x) => { const k = Math.min(1, Math.max(0, (x - a) / (b - a))); return k * k * (3 - 2 * k); };
    const faceA = faceTex ? sm(0.45, 0.95, presence) : 0;
    gl.uniform1f(u.uBlob, 1 - (faceTex ? sm(0.75, 1, presence) : 0));
    gl.uniform1f(u.uMix, p);
    const wired = A.f === "WIRE" || B.f === "WIRE" || A.thin || B.thin;
    gl.uniform1f(u.uSwell, (wired ? SWELL_WIRE : SWELL_SOLID) * Math.sin(Math.PI * p));
    // a blended field is not an exact distance (and the Möbius twist stretches
    // space), so march in shorter steps then
    gl.uniform1f(u.uStep, p > 0 ? 0.7 : 0.85);
    const color = mixColor(HSL, idx, next, p);
    gl.uniform3fv(u.uColor, color);
    // R4 is row-major, so WebGL reads its transpose: the inverse rotation, which
    // turns the slice just as well
    gl.uniformMatrix4fv(u.uR4, false, R4.flat());
    // wireframe to wireframe: sweep along w (old dissolves as new materialises);
    // otherwise struts keep full size and the field blend does the morph
    const both = A.f === "WIRE" && B.f === "WIRE" && p > 0;
    const nA = A.f === "WIRE" ? projectEdges(A, R4, edges, 0, both ? (w) => 1 - sweep(p, w) : () => 1, strutScale) : 0;
    const nB = p > 0 && B.f === "WIRE" ? projectEdges(B, R4, edges, 2, both ? (w) => sweep(p, w) : () => 1, strutScale) : 0;
    if (nA || nB) gl.texSubImage2D(gl.TEXTURE_2D, 0, 0, 0, MAX_EDGES, 8, gl.RGBA, gl.FLOAT, edges);
    gl.uniform1i(u.uNA, nA);
    gl.uniform1i(u.uNB, nB);
    // the tint belongs to a wireframe; it fades out with it in a solid morph
    gl.uniform1f(u.uTintA, both ? 1 : 1 - p);
    gl.uniform1f(u.uTintB, both ? 1 : p);
    // our 3D space slides along w through the turning 4D box
    gl.uniform1f(u.uSliceW, 0.42 * Math.sin(0.55 * t) + 0.12 * Math.sin(0.55 * PHI * t));
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.drawArrays(gl.TRIANGLES, 0, 3);

    // particle clouds on top, blended (premultiplied over). In a morph with a
    // solid they fade with the wireframe; between two polytopes they sweep along w
    // exactly like the struts.
    if (nA || nB) {
      gl.useProgram(P.pts);
      gl.enable(gl.BLEND);
      gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
      const pu = P.pu;
      gl.uniformMatrix4fv(pu.uR4, false, R4.flat());
      gl.uniformMatrix3fv(pu.uRot, false, rot);
      gl.uniform2f(pu.uOff, off[0], off[1]);
      gl.uniform1f(pu.uRes, W);
      gl.uniform1f(pu.uSize, 0.022 * strutScale);
      gl.uniform1f(pu.uSweepP, p);
      gl.uniform3fv(pu.uColor, color);
      const draw = (i, mode, alpha) => {
        if (alpha <= 0.01) return;
        gl.bindVertexArray(P.clouds[i]);
        gl.uniform1i(pu.uMode, mode);
        gl.uniform1f(pu.uAlpha, alpha);
        gl.drawArrays(gl.POINTS, 0, nPts);
      };
      if (nA) draw(seq[idx], both ? 1 : 0, 0.85 * (both ? 1 : 1 - p));
      if (nB) draw(seq[next], both ? 2 : 0, 0.85 * (both ? 1 : p));
      gl.disable(gl.BLEND);
    }

    if (faceA > 0.002) {
      gl.useProgram(P.face);
      gl.bindVertexArray(P.quad);
      gl.activeTexture(gl.TEXTURE1);
      gl.bindTexture(gl.TEXTURE_2D, faceTex);
      gl.uniform1i(P.fu.uFace, 1);
      gl.uniform2f(P.fu.uRes, W, W);
      gl.uniform1f(P.fu.uA, faceA);
      gl.enable(gl.BLEND);
      gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
      gl.disable(gl.BLEND);
      gl.activeTexture(gl.TEXTURE0);
    }

    // noBlit: the favicon reads the pixels back itself, asynchronously (startFavicon3d)
    if (noBlit) return;
    const out = ctx.canvas.width;
    ctx.clearRect(0, 0, out, out);
    ctx.drawImage(glCanvas, 0, 0, out, out);
  }
  paint.glCanvas = glCanvas;
  paint.state = state;
  paint.setFace = setFace;
  paint.lost = false;
  return paint;
}

// ---------------------------------------------------------------- start

// perf (11 Oct): the favicon is the last thing to start, never part of the load. It waits for the
// window load, then any case-study load reveal ([data-load-reveal="wait"] -> "in"), then an idle
// callback, and at least QUIET_MS after load, so shader compilation and the first frames never
// land in the first ~3 s. It is NOT paused with the tab hidden: that is when the icon is seen.
const QUIET_MS = 3000;
export function startFavicon3d() {
  if (typeof window === "undefined") return;
  const begin = () => {
    const waitingOnReveal = () => !!document.querySelector('[data-load-reveal="wait"]');
    const go = () => (waitingOnReveal() ? setTimeout(go, 250) : (window.requestIdleCallback || ((f) => setTimeout(f, 50)))(startNow, { timeout: 2000 }));
    setTimeout(go, QUIET_MS);
  };
  if (document.readyState === "complete") begin();
  else window.addEventListener("load", begin, { once: true });
}

function startNow() {
  if (typeof window === "undefined" || !document.createElement("canvas").getContext) return;
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
  if (reduce.matches) return;
  // automation (headless QA, screenshots) has no GPU: a ray-marcher on software GL starves the
  // compositor and hangs page.screenshot on the home page (A/B, 12 Oct: 4/4 hangs on, 0/4 off).
  // The static first-frame sphere (index.html) stays; real browsers are unaffected.
  if (navigator.webdriver) return;

  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = SIZE;
  const paint = createFaviconPainter(canvas.getContext("2d"), { supersample: SS, noBlit: true, sequence: FAVICON_SEQUENCE });
  if (!paint) return; // no WebGL2: keep the static face
  // the three.js face, rendered once (a dynamic import: three and the GLB stay out of the bundle's
  // first load); until it arrives the head stays the clay blob
  import("./faceStill").then((m) => m.renderFaceStill(SIZE * SS)).then((c) => c && paint.setFace(c)).catch(() => {});

  // one icon link only, so a browser cannot pick a static one over the animated one (the page's
  // pre-rendered sphere files stay as the first-frame fallback for when this never starts)
  const links = document.querySelectorAll('link[rel="icon"]');
  let link = links[0];
  links.forEach((l, i) => i && l.remove());
  if (!link) {
    link = document.createElement("link");
    link.rel = "icon";
    document.head.appendChild(link);
  }
  link.removeAttribute("sizes");
  const t0 = performance.now();

  // perf (11 Oct): the frame never touches the page's main thread for readback. The old
  // canvas.toBlob on the drawn canvas waited for the GPU queue: 25.7 ms per call, 2.3 s of
  // every 5 s of main thread (and a PBO + fence read-back still stalled in getBufferSubData
  // while the GPU was busy with the section's videos). Now the GL frame is snapshotted with
  // createImageBitmap (a GPU-side copy, async) and handed to a worker, which downscales it
  // 2:1 (high-quality, as drawImage did) and encodes the PNG on OffscreenCanvas. Any waiting
  // on the GPU happens in the worker. A frame still in flight means the next tick skips.
  let busy = false, shown = null, stopped = false;
  const encSrc = `const c=new OffscreenCanvas(${SIZE},${SIZE}),x=c.getContext("2d");x.imageSmoothingQuality="high";
onmessage=async(e)=>{try{x.clearRect(0,0,${SIZE},${SIZE});x.drawImage(e.data,0,0,${SIZE},${SIZE});e.data.close();postMessage(await c.convertToBlob({type:"image/png"}))}catch(err){postMessage(null)}}`;
  const encUrl = URL.createObjectURL(new Blob([encSrc], { type: "text/javascript" }));
  const enc = new Worker(encUrl);
  enc.onmessage = (e) => {
    busy = false;
    const blob = e.data;
    if (!blob || stopped) return;
    const next = URL.createObjectURL(blob);
    link.type = "image/png";
    link.href = next;
    if (shown) URL.revokeObjectURL(shown);
    shown = next;
  };
  function frame() {
    if (paint.lost) return stop();
    if (busy || stopped) return;
    busy = true;
    paint((performance.now() - t0) / 1000);
    createImageBitmap(paint.glCanvas).then((bmp) => enc.postMessage(bmp, [bmp]), () => { busy = false; });
  }

  const src = `let id;onmessage=(e)=>{clearInterval(id);if(e.data>0)id=setInterval(()=>postMessage(0),e.data)}`;
  const url = URL.createObjectURL(new Blob([src], { type: "text/javascript" }));
  const worker = new Worker(url);
  worker.onmessage = frame;
  worker.postMessage(1000 / FPS);

  // stopping holds the current frame: the icon is never put back to anything older (the old face
  // used to return here), so `shown` is left alone and its blob URL stays alive
  const stop = () => {
    if (stopped) return;
    stopped = true;
    worker.postMessage(0);
    worker.terminate();
    enc.terminate();
    URL.revokeObjectURL(encUrl);
    URL.revokeObjectURL(url);
  };
  reduce.addEventListener?.("change", (e) => e.matches && stop(), { once: true });
  frame();
  return stop;
}
