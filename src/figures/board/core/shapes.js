// Fundamental whiteboard shapes, drawn like a person draws them: one pen stroke, a slightly crooked
// closing corner, an arrow that bows. Every function takes a context { rng, pen, color, wobble } and
// returns { strokes, fills, bbox, anchors }. Coordinates are board units, y down.

import {
  add, sub, mul, lerp, dist, norm, perp, rot, deg, clamp, bezierTangent, sampleBezier,
  bboxOf, polylineLength, center,
} from "./geom.js";
import { handStroke, handPolyline, makeStroke } from "./pen.js";

const TAU = Math.PI * 2;
const result = (strokes, pts, extra = {}) => ({ strokes, fills: [], bbox: bboxOf(pts), anchors: {}, ...extra });
const arcPts = (cx, cy, r, a0, a1, n = 5) => {
  const out = [];
  for (let i = 0; i <= n; i++) {
    const a = a0 + ((a1 - a0) * i) / n;
    out.push([cx + Math.cos(a) * r, cy + Math.sin(a) * r]);
  }
  return out;
};

// ---------------------------------------------------------------- lines & arrows

export function line(a, b, ctx, o = {}) {
  const r = ctx.rng.fork(1), L = dist(a, b);
  const bow = (o.bow ?? r.sym(0.025)) * L;
  const c = add(lerp(a, b, 0.5), mul(perp(norm(sub(b, a))), bow));
  const c1 = add(a, mul(sub(c, a), 2 / 3)), c2 = add(b, mul(sub(c, b), 2 / 3));
  const pts = sampleBezier(a, c1, c2, b, Math.max(8, Math.round(L / 14)));
  const st = handStroke(pts, { ...ctx, rng: r }, { amp: 0.7, w: o.w, op: o.op });
  return result([st], [a, b], { anchors: { a, b } });
}

/** An arrow: a bowed shaft, then the head as a second quick V (how a hand actually does it). */
export function arrow(a, b, ctx, o = {}) {
  const r = ctx.rng.fork(2), L = dist(a, b);
  const w = o.w ?? ctx.pen;
  const curve = o.curve ?? r.sym(0.07);
  const dir = norm(sub(b, a));
  const c = add(lerp(a, b, 0.5), mul(perp(dir), curve * L));
  const c1 = add(a, mul(sub(c, a), 2 / 3)), c2 = add(b, mul(sub(c, b), 2 / 3));
  const shaft = sampleBezier(a, c1, c2, b, Math.max(10, Math.round(L / 12)));
  const strokes = [handStroke(shaft, { ...ctx, rng: r }, { amp: 0.6, w, op: o.op })];
  const heads = o.head === "none" ? [] : o.head === "both" ? ["end", "start"] : ["end"];
  const pts = [a, b];
  for (const which of heads) {
    const tip = which === "end" ? b : a;
    const t = norm(which === "end" ? bezierTangent(a, c1, c2, b, 1) : mul(bezierTangent(a, c1, c2, b, 0), -1));
    const hl = clamp(L * 0.2, 14 + w * 1.6, 30 + w * 2.4) * (o.headScale ?? 1);
    const ang = deg(r.range(24, 33));
    const w1 = sub(tip, mul(rot(t, +ang), hl * r.range(0.88, 1.12)));
    const w2 = sub(tip, mul(rot(t, -ang), hl * r.range(0.88, 1.12)));
    strokes.push(handPolyline([w1, tip, w2], { ...ctx, rng: r }, { amp: 0.25, w, op: o.op }));
    pts.push(w1, w2);
  }
  return result(strokes, pts, { anchors: { a, b } });
}

/** Squiggly wavy line. */
export function squiggle(a, b, ctx, o = {}) {
  const r = ctx.rng.fork(3), L = dist(a, b);
  const amp = o.amp ?? ctx.pen * 1.1, wl = o.wavelength ?? ctx.pen * 5.5;
  const dir = norm(sub(b, a)), n = perp(dir);
  const pts = [];
  const steps = Math.max(8, Math.round(L / 5));
  const ph = r.range(0, TAU);
  for (let i = 0; i <= steps; i++) {
    const s = (i / steps) * L;
    const k = Math.min(1, s / 12, (L - s) / 12);
    pts.push(add(add(a, mul(dir, s)), mul(n, Math.sin((s / wl) * TAU + ph) * amp * k)));
  }
  return result([handStroke(pts, { ...ctx, rng: r }, { amp: 0.25, step: 6, w: o.w })], [a, b]);
}

// ---------------------------------------------------------------- closed shapes

function ringStroke(ring, ctx, { overshoot = 14, startBias = [0.55, 0.25, 0.2], w, op, tilt = 0.5 } = {}) {
  const r = ctx.rng;
  const n = ring.length;
  // rotate the ring so the pen starts at a plausible corner (index 0 = top-left)
  const q = r.next();
  const startIdx = q < startBias[0] ? 0 : q < startBias[0] + startBias[1] ? Math.floor(n * 0.25) : Math.floor(n * 0.75);
  const seq = [];
  for (let i = 0; i < n; i++) seq.push(ring[(startIdx + i) % n]);
  seq.push(ring[startIdx]);
  // overshoot: keep going past the start, sliding a little off the first line
  let extra = overshoot, i = 1, prev = ring[startIdx];
  const drift = r.sym(3.5);
  while (extra > 0) {
    const nx = ring[(startIdx + i) % n];
    const d = dist(prev, nx);
    const take = Math.min(d, extra);
    const p = lerp(prev, nx, take / (d || 1));
    seq.push([p[0] + drift * (1 - extra / overshoot), p[1] + drift * 0.6]);
    extra -= take;
    prev = p;
    i++;
    if (i > n) break;
  }
  return handStroke(seq, ctx, { amp: 0.9, w, op });
}

export function box(rect, ctx, o = {}) {
  const r = ctx.rng.fork(4);
  const { x, y, w, h } = rect;
  const rad = clamp(o.radius ?? Math.min(12, Math.min(w, h) * 0.2), 0, Math.min(w, h) / 2);
  const ring = [
    ...arcPts(x + w - rad, y + rad, rad, -Math.PI / 2, 0, rad > 2 ? 4 : 1),
    ...arcPts(x + w - rad, y + h - rad, rad, 0, Math.PI / 2, rad > 2 ? 4 : 1),
    ...arcPts(x + rad, y + h - rad, rad, Math.PI / 2, Math.PI, rad > 2 ? 4 : 1),
    ...arcPts(x + rad, y + rad, rad, Math.PI, Math.PI * 1.5, rad > 2 ? 4 : 1),
  ];
  const c = [x + w / 2, y + h / 2];
  const tilt = deg(r.sym(0.55));
  const jig = ring.map((p) => rot([p[0] + r.sym(1.6), p[1] + r.sym(1.6)], tilt, c));
  // ring starts at top-right; reorder so index 0 is top-left (for the start bias)
  const k = Math.floor(jig.length * 0.75);
  const ordered = [...jig.slice(k), ...jig.slice(0, k)];
  const strokes = [ringStroke(ordered, { ...ctx, rng: r }, { overshoot: o.overshoot ?? r.range(10, 26), w: o.w, op: o.op })];
  if (o.double) {
    const inset = ctx.pen * 1.6;
    strokes.push(
      ringStroke(
        ordered.map((p) => lerp(p, c, inset / Math.max(w, h))),
        { ...ctx, rng: r.fork(9) },
        { overshoot: 8, w: (o.w ?? ctx.pen) * 0.8, op: o.op },
      ),
    );
  }
  return result(strokes, [[x, y], [x + w, y + h]], { anchors: { rect } });
}

export function ellipse(cx, cy, rx, ry, ctx, o = {}) {
  const r = ctx.rng.fork(5);
  const turns = o.turns ?? r.range(1.07, 1.16);
  const dirn = o.ccw ?? r.chance(0.7) ? -1 : 1;
  const a0 = o.start ?? deg(r.range(-125, -70));
  const grow = r.range(0.025, 0.06) * (r.chance(0.5) ? 1 : -1);
  const squash = r.range(0.97, 1.03);
  const per = Math.PI * (3 * (rx + ry) - Math.sqrt((3 * rx + ry) * (rx + 3 * ry)));
  const n = Math.max(18, Math.round((per * turns) / 9));
  const tilt = deg(r.sym(2.5));
  const pts = [];
  for (let i = 0; i <= n; i++) {
    const t = i / n;
    const a = a0 + dirn * TAU * turns * t;
    const k = 1 + grow * t;
    pts.push(rot([cx + Math.cos(a) * rx * k * squash, cy + Math.sin(a) * ry * k], tilt, [cx, cy]));
  }
  const st = handStroke(pts, { ...ctx, rng: r }, { amp: 0.8, step: 10, w: o.w, op: o.op });
  return result([st], [[cx - rx * 1.06, cy - ry * 1.06], [cx + rx * 1.06, cy + ry * 1.06]], {
    anchors: { c: [cx, cy], rx, ry },
  });
}

/** Scalloped thought-cloud around a rect, for the centre topic of a mind map. */
export function cloud(rect, ctx, o = {}) {
  const r = ctx.rng.fork(6);
  const { x, y, w, h } = rect;
  const cx = x + w / 2, cy = y + h / 2, rx = w / 2, ry = h / 2;
  const per = Math.PI * (3 * (rx + ry) - Math.sqrt((3 * rx + ry) * (rx + 3 * ry)));
  const bumps = Math.max(8, Math.round(per / (o.bump ?? 74)));
  const n = bumps * 8, pts = [];
  const a0 = r.range(0, TAU), phase = r.range(0, 0.3);
  for (let i = 0; i <= n + 6; i++) {
    const a = a0 + (i / n) * TAU;
    const bulge = 1 + 0.085 * Math.abs(Math.sin(((i / n) * bumps + phase) * Math.PI));
    pts.push([cx + Math.cos(a) * rx * bulge, cy + Math.sin(a) * ry * bulge]);
  }
  const st = handStroke(pts, { ...ctx, rng: r }, { amp: 0.5, step: 10, w: o.w, op: o.op });
  return result([st], [[x - 8, y - 8], [x + w + 8, y + h + 8]], { anchors: { rect } });
}

// ---------------------------------------------------------------- emphasis marks

export function underline(x0, x1, y, ctx, o = {}) {
  const r = ctx.rng.fork(7), L = x1 - x0;
  const slope = r.sym(0.012) * L;
  const a = [x0, y + r.sym(2)], b = [x1 + r.range(2, 10), y + slope];
  const style = o.style ?? "single";
  if (style === "wavy") return squiggle(a, b, ctx, o);
  const mid = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2 + r.sym(L * 0.01)];
  const pts = sampleBezier(a, lerp(a, mid, 0.7), lerp(b, mid, 0.7), b, Math.max(6, Math.round(L / 14)));
  const strokes = [handStroke(pts, { ...ctx, rng: r }, { amp: 0.6, w: o.w, op: o.op })];
  if (style === "double") {
    const gap = ctx.pen * 2.1;
    const a2 = [x0 + L * r.range(0.06, 0.14), y + gap + r.sym(2)];
    const b2 = [x1 - L * r.range(0.02, 0.08), y + gap + slope * 0.8];
    strokes.push(handStroke(sampleBezier(a2, lerp(a2, b2, 0.33), lerp(a2, b2, 0.66), b2, 10), { ...ctx, rng: r.fork(3) }, { amp: 0.6, w: o.w, op: o.op }));
  }
  return result(strokes, [a, b, [x0, y + ctx.pen * 3]]);
}

/** Highlighter swipe over a rect (translucent, multiplies with what's under it). */
export function highlight(rect, ctx, o = {}) {
  const r = ctx.rng.fork(8);
  const { x, y, w, h } = rect;
  const sw = clamp(o.w ?? Math.min(h, 46), 14, 60);
  const rows = Math.max(1, Math.round(h / (sw * 0.9)));
  const pts = [];
  for (let i = 0; i < rows; i++) {
    const yy = y + (rows === 1 ? h / 2 : sw / 2 + ((h - sw) * i) / (rows - 1));
    const x0 = x - r.range(2, 8), x1 = x + w + r.range(2, 8);
    const jitter = r.sym(2);
    pts.push(i % 2 === 0 ? [x0, yy + jitter] : [x1, yy + jitter], i % 2 === 0 ? [x1, yy - jitter] : [x0, yy - jitter]);
  }
  const st = handStroke(pts.length > 2 ? pts : [pts[0], pts[1]], { ...ctx, rng: r }, { amp: 0.5, w: sw, op: o.op ?? 0.34, blend: "multiply" });
  st.hl = true;
  return result([st], [[x, y], [x + w, y + h]]);
}

export function star(cx, cy, rad, ctx, o = {}) {
  const r = ctx.rng.fork(9);
  const a0 = -Math.PI / 2 + r.sym(0.18);
  const v = [0, 2, 4, 1, 3, 0].map((k) => {
    const a = a0 + (k / 5) * TAU, rr = rad * r.range(0.94, 1.06);
    return [cx + Math.cos(a) * rr, cy + Math.sin(a) * rr];
  });
  v.push(lerp(v[5], v[1], 0.08));
  return result([handPolyline(v, ctx, { amp: 0.35, w: o.w, op: o.op })], [[cx - rad, cy - rad], [cx + rad, cy + rad]]);
}

export function check(cx, cy, s, ctx, o = {}) {
  const r = ctx.rng.fork(10);
  const v = [
    [cx - s * 0.5, cy + s * r.range(0.0, 0.08)],
    [cx - s * 0.16, cy + s * 0.42],
    [cx + s * 0.56, cy - s * 0.5],
  ];
  return result([handPolyline(v, ctx, { amp: 0.3, w: o.w, op: o.op })], v);
}

export function cross(cx, cy, s, ctx, o = {}) {
  const r = ctx.rng.fork(11);
  const j = () => r.sym(s * 0.06);
  const a = [cx - s / 2 + j(), cy - s / 2 + j()], b = [cx + s / 2 + j(), cy + s / 2 + j()];
  const c = [cx + s / 2 + j(), cy - s / 2 + j()], d = [cx - s / 2 + j(), cy + s / 2 + j()];
  return result(
    [handPolyline([a, b], ctx, { amp: 0.3, w: o.w, op: o.op }), handPolyline([c, d], { ...ctx, rng: r.fork(2) }, { amp: 0.3, w: o.w, op: o.op })],
    [a, b, c, d],
  );
}

/** A square bracket or curly brace spanning y0..y1 at x. side 'left' opens right: "[" / "{". */
export function bracket(x, y0, y1, ctx, o = {}) {
  const r = ctx.rng.fork(12);
  const side = o.side ?? "left", dir = side === "left" ? 1 : -1;
  const d = o.depth ?? 20, mid = (y0 + y1) / 2;
  const pts = [];
  if (o.curly) {
    const rad = Math.min(d, (y1 - y0) / 4);
    const P = [
      [x + dir * d, y0], [x + dir * d * 0.2, y0 + rad * 0.5], [x, y0 + rad * 1.8],
      [x, mid - rad * 1.2], [x - dir * d * 0.9, mid], [x, mid + rad * 1.2],
      [x, y1 - rad * 1.8], [x + dir * d * 0.2, y1 - rad * 0.5], [x + dir * d, y1],
    ];
    pts.push(...P);
  } else {
    pts.push([x + dir * d, y0 + r.sym(2)], [x, y0 + r.sym(1)], [x, y1 + r.sym(1)], [x + dir * d, y1 + r.sym(2)]);
  }
  const st = o.curly ? handStroke(pts, ctx, { amp: 0.4, step: 14, w: o.w, op: o.op }) : handPolyline(pts, ctx, { amp: 0.4, w: o.w, op: o.op });
  return result([st], pts);
}

/** Radiating tick marks around a point (emphasis / "aha"). */
export function burst(cx, cy, r0, ctx, o = {}) {
  const r = ctx.rng.fork(13);
  const n = o.n ?? 5, span = o.span ?? Math.PI * 2, a0 = o.start ?? -Math.PI / 2 - span / 2 + (span < TAU ? span / (n * 2) : 0);
  const len = o.len ?? r0 * 0.7;
  const strokes = [], pts = [];
  for (let i = 0; i < n; i++) {
    const a = a0 + (span / (span < TAU ? n : n)) * (i + 0.5) + r.sym(0.1);
    const l = len * r.range(0.8, 1.2);
    const p = [cx + Math.cos(a) * r0, cy + Math.sin(a) * r0], q = [cx + Math.cos(a) * (r0 + l), cy + Math.sin(a) * (r0 + l)];
    strokes.push(handPolyline([p, q], { ...ctx, rng: r.fork(i) }, { amp: 0.2, w: o.w, op: o.op }));
    pts.push(p, q);
  }
  return result(strokes, pts);
}

/** A little light bulb: the universal "idea". */
export function bulb(cx, cy, s, ctx, o = {}) {
  const r = ctx.rng.fork(14);
  const rad = s * 0.36;
  const bulbPts = [];
  for (let i = 0; i <= 34; i++) {
    const a = deg(130) - (deg(260) * i) / 34;               // open at the bottom
    bulbPts.push([cx + Math.cos(a) * rad, cy - s * 0.12 + Math.sin(a) * rad * 1.06]);
  }
  const l = bulbPts[bulbPts.length - 1], rr = bulbPts[0];
  const neckL = [l[0] + s * 0.03, cy + s * 0.3], neckR = [rr[0] - s * 0.03, cy + s * 0.3];
  const body = handStroke([...bulbPts, neckL], ctx, { amp: 0.4, w: o.w, op: o.op });
  const strokes = [
    body,
    handPolyline([rr, neckR], { ...ctx, rng: r.fork(1) }, { amp: 0.2, w: o.w, op: o.op }),
    handPolyline([[cx - s * 0.17, cy + s * 0.42], [cx + s * 0.17, cy + s * 0.42]], { ...ctx, rng: r.fork(2) }, { amp: 0.2, w: o.w, op: o.op }),
    handPolyline([[cx - s * 0.1, cy + s * 0.54], [cx + s * 0.1, cy + s * 0.54]], { ...ctx, rng: r.fork(3) }, { amp: 0.2, w: o.w, op: o.op }),
  ];
  const rays = burst(cx, cy - s * 0.12, rad * 1.22, { ...ctx, rng: r.fork(4) }, { n: 5, span: deg(240), start: deg(150), len: s * 0.2, w: o.w, op: o.op });
  return result([...strokes, ...rays.strokes], [[cx - s * 0.7, cy - s * 0.8], [cx + s * 0.7, cy + s * 0.6]]);
}

/** Zig-zag scribble fill (shading, or a strike-through when the rect is flat). */
export function scribble(rect, ctx, o = {}) {
  const r = ctx.rng.fork(15);
  const { x, y, w, h } = rect;
  const flat = h < ctx.pen * 5;
  const step = flat ? Math.max(18, ctx.pen * 3.2) : Math.max(10, ctx.pen * 1.9);
  const pts = [];
  let up = true;
  for (let xx = x; xx <= x + w + step * 0.5; xx += step) {
    const jx = xx + r.sym(2);
    pts.push([jx, up ? y + r.sym(flat ? 2 : 3) : y + h + r.sym(flat ? 2 : 3)]);
    up = !up;
  }
  const st = flat
    ? handPolyline([[x - 4, y + h * 0.5], [x + w + 6, y + h * 0.3]], ctx, { amp: 0.5, w: o.w, op: o.op })
    : handPolyline(pts, ctx, { amp: 0.2, w: (o.w ?? ctx.pen) * 0.85, op: o.op ?? 0.8 });
  return result([st], [[x, y], [x + w, y + h]]);
}

export function strike(x0, x1, y, ctx, o = {}) {
  const r = ctx.rng.fork(16);
  return result(
    [handPolyline([[x0 - 6, y + r.sym(2)], [x1 + 8, y - r.range(2, 6)]], ctx, { amp: 0.5, w: o.w, op: o.op })],
    [[x0, y - 4], [x1, y + 4]],
  );
}

/** A filled dot (bullet). */
export function dot(cx, cy, rad, ctx, o = {}) {
  const r = ctx.rng.fork(17);
  const st = makeStroke([[cx - rad * 0.35 + r.sym(1), cy + r.sym(1)], [cx + rad * 0.35, cy + r.sym(1)]], { w: rad * 2, color: ctx.color, op: o.op });
  return result([st], [[cx - rad, cy - rad], [cx + rad, cy + rad]]);
}

// ---------------------------------------------------------------- stickies

export const STICKY = {
  yellow: { fill: "#ffe66d", edge: "#e8c93a", ink: "#3a3320" },
  pink: { fill: "#ffb3c7", edge: "#e68aa5", ink: "#4a2430" },
  blue: { fill: "#a9d8ff", edge: "#7bb5e6", ink: "#1f3550" },
  green: { fill: "#b7ecb0", edge: "#8ccf84", ink: "#1f4020" },
  orange: { fill: "#ffcf9a", edge: "#e6a964", ink: "#4a2f12" },
};

/** A sticky note (a filled paper, not a stroke). It pops onto the board rather than being drawn. */
export function sticky(rect, ctx, o = {}) {
  const r = ctx.rng.fork(18);
  const pal = STICKY[o.color] ?? STICKY.yellow;
  const rotDeg = o.rot ?? r.sym(2.6);
  const { x, y, w, h } = rect;
  const c = [x + w / 2, y + h / 2];
  const corners = [[x, y], [x + w, y], [x + w, y + h], [x, y + h]].map((p) => rot(p, deg(rotDeg), c));
  return {
    strokes: [],
    fills: [{ kind: "sticky", x, y, w, h, rot: rotDeg, c, fill: pal.fill, edge: pal.edge, ink: pal.ink, curl: r.range(0.9, 1.1) }],
    bbox: bboxOf(corners),
    anchors: { rect, palette: pal },
  };
}

export const SHAPES = {
  line, arrow, squiggle, box, ellipse, cloud, underline, highlight, star, check, cross, bracket, burst, bulb, scribble, strike, dot, sticky,
};
