// The bobblehead pets' shapes and markings (bobblehead.js), as distance fields and
// paint functions for petSculpt.js. Model frame in metres before the toy's SIZE:
// x along the monitor edge, y up, z toward the camera (the pet faces +z); the
// bodies stand on a base 8 mm tall; the heads are in their neck pivot's frame.
// Plain JavaScript: tools/pets/bake.mjs imports this in Node to bake
// public/room/pets.glb, and bobblehead.js imports the eye positions. After an edit
// here, re-run the bake: node tools/pets/bake.mjs

import { ell, cone, chain, smin, ssub, sstep, wobble, lin, mixInto } from "./petSculpt.js";

// ellipsoid rotated about z by `a` (radians) round its centre
function ellZ(x, y, z, cx, cy, cz, rx, ry, rz, a) {
  const c = Math.cos(a), s = Math.sin(a);
  const px = x - cx, py = y - cy;
  return ell(c * px + s * py, -s * px + c * py, z - cz, 0, 0, 0, rx, ry, rz);
}

// ---------------------------------------------------------------------------
// The golden retriever
// ---------------------------------------------------------------------------

const DOG_TAIL = [[0.006, 0.016, -0.019], [0.016, 0.0125, -0.0165], [0.0215, 0.0108, -0.0065], [0.021, 0.0105, 0.0035], [0.0172, 0.0108, 0.0105]];
const DOG_TAIL_R = [0.0046, 0.005, 0.0046, 0.0038, 0.0022];
const DOG_LEG = [[0.0066, 0.04, 0.0078], [0.0068, 0.0125, 0.0128]];

function dogCore(x, y, z) {
  const ax = Math.abs(x);
  let d = ell(x, y, z, 0, 0.024, -0.0075, 0.0155, 0.0155, 0.0155); // the back and pelvis
  d = smin(d, ell(ax, y, z, 0.0105, 0.0192, -0.0025, 0.0096, 0.0118, 0.0146), 0.005); // the thighs
  d = smin(d, ell(x, y, z, 0, 0.041, 0.004, 0.0145, 0.0185, 0.0135), 0.008); // the deep chest
  d = smin(d, ell(x, y, z, 0, 0.044, 0.0115, 0.0098, 0.0125, 0.0055), 0.005); // the ruff stands proud
  d = smin(d, cone(x, y, z, [0, 0.047, 0.002], [0, 0.061, 0.005], 0.0098, 0.0088), 0.005); // the neck
  d = smin(d, cone(ax, y, z, DOG_LEG[0], DOG_LEG[1], 0.0048, 0.0038), 0.003); // front legs
  d = smin(d, ell(ax, y, z, 0.0068, 0.0103, 0.0152, 0.0047, 0.0031, 0.0062), 0.0022); // front paws
  d = smin(d, ell(ax, y, z, 0.0136, 0.0102, 0.006, 0.0046, 0.003, 0.0076), 0.003); // hind paws
  d = smin(d, chain(x, y, z, DOG_TAIL, DOG_TAIL_R), 0.003); // the plume, swept round onto the base
  d = smin(d, ell(x, y, z, 0.0185, 0.0088, -0.0035, 0.0045, 0.0042, 0.0125), 0.003); // its feathered underside
  d = smin(d, ell(x, y, z, 0, 0.0325, 0.0125, 0.0068, 0.0058, 0.0042), 0.004); // the chest feathering
  // toes: two grooves across the top and front of each paw
  for (const o of [-0.0016, 0.0016]) {
    d = ssub(d, cone(ax, y, z, [0.0068 + o, 0.0136, 0.0168], [0.0068 + o, 0.0118, 0.0222], 0.00065, 0.0006), 0.0007);
    d = ssub(d, cone(ax, y, z, [0.0136 + o, 0.0134, 0.0092], [0.0136 + o, 0.0116, 0.0142], 0.00065, 0.0006), 0.0007);
  }
  return d;
}

function dogEar(ax, y, z) {
  const flap = smin(ellZ(ax, y, z, 0.0188, 0.0125, 0.0012, 0.0042, 0.0135, 0.0098, 0.2), ell(ax, y, z, 0.0198, 0.0042, 0.0012, 0.0036, 0.0058, 0.0092), 0.003);
  const root = cone(ax, y, z, [0.015, 0.0248, 0.0005], [0.0192, 0.0195, 0.0015], 0.0044, 0.004);
  return smin(flap, root, 0.003);
}
export const DOG_EYE = [0.0082, 0.0236, 0.0146];
const DOG_LIP = [[0.0078, 0.0108, 0.0148], [0.0068, 0.0101, 0.0205], [0.0038, 0.0097, 0.0250], [0, 0.0098, 0.0266]];
const LIP_R = [0.0005, 0.0005, 0.0005, 0.0004];

function dogHead(x, y, z) {
  const ax = Math.abs(x);
  let d = ell(x, y, z, 0, 0.021, -0.001, 0.0182, 0.0168, 0.0172); // the broad skull
  d = smin(d, ell(ax, y, z, 0.0062, 0.0258, 0.0116, 0.0062, 0.0036, 0.005), 0.005); // soft brows over the stop
  d = smin(d, ell(ax, y, z, 0.0088, 0.0138, 0.0115, 0.0068, 0.0062, 0.007), 0.005); // cheeks
  d = smin(d, ell(x, y, z, 0, 0.0138, 0.0188, 0.0108, 0.0082, 0.0105), 0.006); // the medium, broad muzzle
  d = smin(d, cone(x, y, z, [0, 0.0195, 0.011], [0, 0.0168, 0.0282], 0.0068, 0.0058), 0.005); // its bridge, a gentle slope
  d = smin(d, ell(x, y, z, 0, 0.0074, 0.0175, 0.0075, 0.0042, 0.0078), 0.004); // the lower jaw
  d = smin(d, dogEar(ax, y, z), 0.0022);
  d = ssub(d, chain(ax, y, z, DOG_LIP, LIP_R), 0.0006); // the mouth line
  d = ssub(d, ell(ax, y, z, DOG_EYE[0], DOG_EYE[1], DOG_EYE[2], 0.0032, 0.0033, 0.0025), 0.0012); // eye sockets
  return d;
}

const C_DOG = {
  gold: lin(0xdba75a), deep: lin(0xb87a36), cream: lin(0xf6dfb4), lip: lin(0x4a3020), pad: lin(0x3a2a22),
};

function dogBodyPaint(x, y, z, o, n) {
  const ax = Math.abs(x);
  o[0] = C_DOG.gold[0]; o[1] = C_DOG.gold[1]; o[2] = C_DOG.gold[2];
  // a richer gold along the back, paler toward the belly
  mixInto(o, C_DOG.deep, sstep(0.3, 0.9, -n[2]) * sstep(0.02, 0.04, y) * 0.55);
  // the cream ruff on the chest
  const ruff = 1 - sstep(-0.5, 0.4, ell(x, y, z, 0, 0.0425, 0.014, 0.0082, 0.0145, 0.0075) / 0.004);
  mixInto(o, C_DOG.cream, ruff * 0.8);
  // feathering: the backs of the front legs, the trousers, the plume's underside
  const legBack = sstep(0.0035, 0.0012, cone(ax, y, z, DOG_LEG[0], DOG_LEG[1], 0.0042, 0.0033)) * sstep(0.1, -0.5, n[2]);
  mixInto(o, C_DOG.cream, legBack * 0.85);
  const tail = chain(x, y, z, DOG_TAIL, DOG_TAIL_R);
  mixInto(o, C_DOG.cream, sstep(0.0012, 0, tail) * (0.35 + 0.5 * sstep(0.2, -0.6, n[1])));
  mixInto(o, C_DOG.cream, sstep(0.0128, 0.0105, y) * 0.75); // the paws
  mixInto(o, C_DOG.cream, sstep(0.3, 0.8, -n[2]) * sstep(0.02, 0.012, y) * 0.5); // the trousers
  const w = wobble(x, y, z) * 0.06;
  o[0] *= 1 + w; o[1] *= 1 + w; o[2] *= 1 + w * 0.8;
}

function dogHeadPaint(x, y, z, o, n) {
  const ax = Math.abs(x);
  o[0] = C_DOG.gold[0]; o[1] = C_DOG.gold[1]; o[2] = C_DOG.gold[2];
  mixInto(o, C_DOG.deep, sstep(0.016, 0.034, y) * sstep(0.3, 0.9, n[1]) * 0.4); // a darker crown
  // the ears: a deeper gold, feathered pale at their ends
  const ear = sstep(0.0009, 0, dogEar(ax, y, z) - 0.0002) * sstep(0.0128, 0.0145, ax);
  mixInto(o, C_DOG.deep, ear * 0.8);
  mixInto(o, C_DOG.cream, ear * sstep(0.008, 0.002, y) * 0.75);
  // the muzzle: pale underneath and round the lips, golden on top
  mixInto(o, C_DOG.cream, sstep(0.0135, 0.0095, y) * sstep(0.012, 0.02, z) * 0.9);
  mixInto(o, C_DOG.cream, sstep(0.012, 0.02, z) * 0.28); // the whole muzzle a shade paler
  mixInto(o, C_DOG.cream, sstep(0.006, 0.002, ell(x, y, z, 0, 0.0074, 0.0175, 0.0075, 0.0042, 0.0078) + 0.004) * 0.6);
  // the dark lip line and the whisker spots on the muzzle
  mixInto(o, C_DOG.lip, sstep(0.0011, 0.0005, chain(ax, y, z, DOG_LIP, LIP_R)) * 0.55);
  for (const [sx, sy, sz] of [[0.0056, 0.0128, 0.0232], [0.0066, 0.0138, 0.0204], [0.0052, 0.0145, 0.0242], [0.0064, 0.0119, 0.0214]]) {
    const dd = Math.hypot(ax - sx, y - sy, z - sz);
    mixInto(o, C_DOG.pad, sstep(0.00085, 0.0004, dd) * 0.6);
  }
  // a little dark rim round each eye, as on a retriever
  const rim = Math.hypot((ax - DOG_EYE[0]) / 0.0036, (y - DOG_EYE[1]) / 0.0037, (z - DOG_EYE[2]) / 0.003);
  mixInto(o, C_DOG.lip, sstep(1.28, 1.05, rim) * 0.7);
  const w = wobble(x, y, z) * 0.06;
  o[0] *= 1 + w; o[1] *= 1 + w; o[2] *= 1 + w * 0.8;
}

// ---------------------------------------------------------------------------
// The grey tabby
// ---------------------------------------------------------------------------

const CAT_TAIL = [[0, 0.0125, -0.016], [0.011, 0.0108, -0.0135], [0.0168, 0.0104, -0.0025], [0.0152, 0.0104, 0.009], [0.0085, 0.0106, 0.0172], [-0.0015, 0.0109, 0.0204], [-0.0085, 0.0128, 0.019], [-0.0118, 0.0158, 0.0158]];
const CAT_TAIL_R = [0.0034, 0.0033, 0.0031, 0.0029, 0.0027, 0.0025, 0.0022, 0.0018];
const CAT_LEG = [[0.0048, 0.034, 0.0072], [0.005, 0.0115, 0.0105]];

function catCore(x, y, z) {
  const ax = Math.abs(x);
  let d = ell(x, y, z, 0, 0.021, -0.006, 0.0118, 0.0125, 0.0118); // the pelvis
  d = smin(d, ell(ax, y, z, 0.0085, 0.0175, -0.0025, 0.0082, 0.0105, 0.0125), 0.005); // haunches
  d = smin(d, ell(x, y, z, 0, 0.0355, 0.0025, 0.0102, 0.0158, 0.0102), 0.007); // the narrow chest
  d = smin(d, cone(x, y, z, [0, 0.043, 0.002], [0, 0.0505, 0.0035], 0.0076, 0.0072), 0.004); // the neck
  d = smin(d, cone(ax, y, z, CAT_LEG[0], CAT_LEG[1], 0.0032, 0.0026), 0.0025); // front legs
  d = smin(d, ell(ax, y, z, 0.005, 0.0098, 0.0122, 0.0035, 0.0024, 0.0044), 0.0018); // front paws
  d = smin(d, ell(ax, y, z, 0.0103, 0.0097, 0.0048, 0.0034, 0.0023, 0.0058), 0.0025); // hind paws
  d = smin(d, chain(x, y, z, CAT_TAIL, CAT_TAIL_R, 0.001), 0.0025); // the tail round the paws
  for (const o of [-0.0012, 0.0012]) d = ssub(d, cone(ax, y, z, [0.005 + o, 0.0122, 0.0128], [0.005 + o, 0.0106, 0.0168], 0.0005, 0.00045), 0.0006);
  return d;
}

// the ears: a cone flattened to a thick triangle, cupped on the front
const EAR_ROOT = [0.0102, 0.0292, -0.0012], EAR_TIP = [0.0142, 0.0405, -0.0032];
const EAR_N = (() => { const l = Math.hypot(0.32, 0.1, 1); return [0.32 / l, 0.1 / l, 1 / l]; })();
const EAR_T = 0.0021;
function catEarParts(ax, y, z) {
  const along = (ax - EAR_ROOT[0]) * EAR_N[0] + (y - EAR_ROOT[1]) * EAR_N[1] + (z - EAR_ROOT[2]) * EAR_N[2];
  const shell = Math.max(cone(ax, y, z, EAR_ROOT, EAR_TIP, 0.0068, 0.0011), Math.abs(along) - EAR_T);
  const s = EAR_T * 1.05;
  const inner = cone(ax - EAR_N[0] * s, y - EAR_N[1] * s + 0.0006, z - EAR_N[2] * s, EAR_ROOT, EAR_TIP, 0.0051, 0.0004);
  return { shell, inner, along };
}
function catEar(ax, y, z) {
  const { shell, inner } = catEarParts(ax, y, z);
  return ssub(shell, inner, 0.0006);
}
export const CAT_EYE = [0.0071, 0.0198, 0.0138];

function catHead(x, y, z) {
  const ax = Math.abs(x);
  let d = ell(x, y, z, 0, 0.0185, -0.0005, 0.0178, 0.0152, 0.0162); // the round skull
  d = smin(d, ell(ax, y, z, 0.0085, 0.0118, 0.0068, 0.0088, 0.0072, 0.0078), 0.005); // wide cheeks
  d = smin(d, ell(ax, y, z, 0.0031, 0.0112, 0.0152, 0.004, 0.0033, 0.0034), 0.0025); // whisker pads
  d = smin(d, ell(x, y, z, 0, 0.0078, 0.0132, 0.0034, 0.0027, 0.0032), 0.002); // the chin
  d = smin(d, cone(x, y, z, [0, 0.0205, 0.0145], [0, 0.0152, 0.0182], 0.0032, 0.0024), 0.003); // the nose bridge
  d = smin(d, ell(ax, y, z, 0.0068, 0.0245, 0.0118, 0.005, 0.0028, 0.004), 0.003); // brows
  d = smin(d, catEar(ax, y, z), 0.0025);
  d = ssub(d, ell(ax, y, z, CAT_EYE[0], CAT_EYE[1], CAT_EYE[2] + 0.0006, 0.0038, 0.0031, 0.0022), 0.0016); // shallow eye sockets (no dark rim, 2026-10-11)
  return d;
}

const C_CAT = {
  grey: lin(0x8c8781), stripe: lin(0x45403c), white: lin(0xf1eee8), pink: lin(0xe3a2a2), line: lin(0x3a3532),
};

function catBodyPaint(x, y, z, o, n) {
  const ax = Math.abs(x);
  o[0] = C_CAT.grey[0]; o[1] = C_CAT.grey[1]; o[2] = C_CAT.grey[2];
  const tail = chain(x, y, z, CAT_TAIL, CAT_TAIL_R, 0.001);
  const onTail = sstep(0.001, 0.0002, tail);
  // mackerel stripes: bands round the body, strongest down the back, broken by a
  // little drift so they read as painted, not machined
  const band = Math.sin((y + 0.0009 * wobble(x * 2, y, z)) * (Math.PI * 2 / 0.0056));
  const back = sstep(-0.1, 0.6, -n[2] + Math.abs(n[0]) * 0.45);
  let st = sstep(0.35, 0.7, band) * back * (1 - onTail) * sstep(0.0105, 0.014, y);
  // a dark line down the spine
  st = Math.max(st, sstep(0.003, 0.0012, ax) * sstep(-0.2, -0.7, n[2]) * sstep(0.014, 0.02, y));
  // rings on the front legs (outer side) and round the tail, its tip dark
  const leg = sstep(0.0012, 0.0003, cone(ax, y, z, CAT_LEG[0], CAT_LEG[1], 0.0032, 0.0026));
  st = Math.max(st, leg * sstep(0.4, 0.8, Math.sin(y * (Math.PI * 2 / 0.0045))) * sstep(0.1, 0.5, Math.abs(n[0])) * sstep(0.014, 0.017, y));
  const ang = Math.atan2(x, z);
  st = Math.max(st, onTail * sstep(0.3, 0.7, Math.sin(ang * 9 + 0.6)));
  st = Math.max(st, onTail * sstep(-0.003, -0.009, x) * sstep(0.017, 0.0165, z) * sstep(0.0115, 0.0135, y));
  mixInto(o, C_CAT.stripe, st * 0.9);
  // the white bib, belly and socks
  const bib = 1 - sstep(-0.3, 0.3, ell(x, y, z, 0, 0.033, 0.0105, 0.0072, 0.0165, 0.0075) / 0.003);
  mixInto(o, C_CAT.white, bib * (1 - onTail));
  mixInto(o, C_CAT.white, sstep(0.0128, 0.0112, y) * sstep(0.008, 0.011, z + ax * 0.2) * (1 - onTail)); // front socks
  mixInto(o, C_CAT.white, sstep(0.0122, 0.0108, y) * sstep(0.0085, 0.01, ax) * (1 - onTail)); // hind socks
  const w = wobble(x, y, z) * 0.05;
  o[0] *= 1 + w; o[1] *= 1 + w; o[2] *= 1 + w;
}

function catHeadPaint(x, y, z, o, n) {
  const ax = Math.abs(x);
  o[0] = C_CAT.grey[0]; o[1] = C_CAT.grey[1]; o[2] = C_CAT.grey[2];
  const { inner, along } = catEarParts(ax, y, z);
  const earInside = sstep(0.0009, 0.0002, inner) * sstep(-0.0004, 0.0008, along);
  let st = 0;
  // the M on the brow: three short strokes and the two outer arms
  if (z > 0.006 && y > 0.023) {
    for (const [cx, w0] of [[0, 0.0008], [0.0034, 0.0007]]) st = Math.max(st, sstep(w0, w0 * 0.4, Math.abs(ax - cx - (y - 0.026) * 0.25)) * sstep(0.0238, 0.0255, y) * sstep(0.0345, 0.031, y));
  }
  // stripes back over the crown
  st = Math.max(st, sstep(0.45, 0.8, Math.sin(x * (Math.PI * 2 / 0.0052) + Math.PI / 2)) * sstep(0.029, 0.033, y) * sstep(0.008, -0.004, z) * (1 - earInside));
  // cheek lines from the outer corner of each eye
  for (const [y0, k] of [[0.0185, 0.35], [0.0145, 0.25]]) {
    const dl = Math.abs(y - (y0 - (CAT_EYE[2] - z) * k));
    st = Math.max(st, sstep(0.0009, 0.0004, dl) * sstep(0.0105, 0.0135, ax) * sstep(0.013, 0.004, z) * sstep(-0.004, 0, z));
  }
  mixInto(o, C_CAT.stripe, st * 0.9);
  // the backs of the ears darker, their insides pink
  mixInto(o, C_CAT.stripe, sstep(0.03, 0.034, y) * sstep(0.2, -0.3, along / EAR_T) * sstep(0.0085, 0.0105, ax) * 0.5);
  mixInto(o, C_CAT.pink, earInside);
  // white muzzle, chin and a pale throat
  const muzzle = Math.min(ell(ax, y, z, 0.0031, 0.0112, 0.0152, 0.0048, 0.004, 0.0042), ell(x, y, z, 0, 0.0078, 0.0132, 0.0042, 0.0034, 0.004));
  mixInto(o, C_CAT.white, sstep(0.0012, 0, muzzle));
  mixInto(o, C_CAT.white, sstep(0.008, 0.004, y) * sstep(0, 0.006, z) * 0.85);
  // the mouth: a short line down from the nose, then the two curves
  const phil = sstep(0.00055, 0.0003, ax) * sstep(0.0106, 0.0109, y) * sstep(0.0139, 0.0136, y);
  const curve = sstep(0.0006, 0.0003, Math.abs(y - (0.0106 + (ax * ax) / 0.012 * 1.8))) * sstep(0.0048, 0.0042, ax) * sstep(0.013, 0.0145, z);
  mixInto(o, C_CAT.line, Math.max(phil, curve) * 0.85);
  // whisker dots on the pads
  for (const [sx, sy] of [[0.0034, 0.0118], [0.0046, 0.0112], [0.004, 0.0105], [0.0028, 0.0109]]) {
    if (z > 0.014) mixInto(o, C_CAT.line, sstep(0.0006, 0.0003, Math.hypot(ax - sx, y - sy)) * 0.6);
  }
  const w = wobble(x, y, z) * 0.05;
  o[0] *= 1 + w; o[1] *= 1 + w; o[2] *= 1 + w;
}

const dogBody = dogCore;
const catBody = catCore;

// the parts to bake: distance field, paint, bounds and grid cell (m)
export const PET_PARTS = {
  dogBody: { sdf: dogBody, paint: dogBodyPaint, bounds: [-0.026, 0.006, -0.027, 0.029, 0.067, 0.026] },
  dogHead: { sdf: dogHead, paint: dogHeadPaint, bounds: [-0.027, -0.003, -0.021, 0.027, 0.042, 0.037] },
  catBody: { sdf: catBody, paint: catBodyPaint, bounds: [-0.026, 0.006, -0.024, 0.026, 0.06, 0.027] },
  catHead: { sdf: catHead, paint: catHeadPaint, bounds: [-0.022, -0.002, -0.02, 0.022, 0.045, 0.025] },
};
