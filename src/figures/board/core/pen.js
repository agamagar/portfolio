// The "hand": turns an ideal polyline into a marker stroke that looks drawn, not plotted.
// A stroke is the engine's atom: { d, len, w, color, op, blend }. Everything on a board is strokes or glyphs.

import { resample, polylineLength, smoothPath, sub, norm, perp } from "./geom.js";
import { makeNoise } from "./rng.js";

/**
 * Perturb a polyline the way a hand does: slow sideways drift (low-frequency noise along the path)
 * plus a little faster tremor. Amplitude scales with the pen width, so thick pens wander more in
 * absolute terms but the same in proportion, and short strokes stay nearly straight.
 */
export function wobblePoints(pts, rng, { amp = 1, step = 12, pen = 6 } = {}) {
  const p = resample(pts, step);
  if (p.length < 3) return p;
  const total = polylineLength(p);
  const slow = makeNoise(rng, { octaves: 2, base: (Math.PI * 2) / Math.max(140, total * 0.9) });
  const fast = makeNoise(rng, { octaves: 2, base: (Math.PI * 2) / 38 });
  // taper the wander to nothing at the very ends so strokes start and finish where the hand aimed
  const out = [];
  let s = 0;
  for (let i = 0; i < p.length; i++) {
    if (i) s += Math.hypot(p[i][0] - p[i - 1][0], p[i][1] - p[i - 1][1]);
    const a = p[Math.max(0, i - 1)], b = p[Math.min(p.length - 1, i + 1)];
    const nrm = perp(norm(sub(b, a)));
    const edge = Math.min(1, s / 18, (total - s) / 18);
    const off = (slow(s) * pen * 0.55 + fast(s) * pen * 0.12) * amp * Math.max(0.15, edge);
    out.push([p[i][0] + nrm[0] * off, p[i][1] + nrm[1] * off]);
  }
  return out;
}

/** Build a stroke object from points. `smooth:false` keeps the segments straight (used for sharp tips). */
export function makeStroke(pts, { w = 6, color = "#0b7a5f", op = 1, blend, smooth = true, cap = "round", closed = false } = {}) {
  const d = smooth ? smoothPath(pts, { closed }) : "M" + pts.map((q) => `${Math.round(q[0] * 10) / 10} ${Math.round(q[1] * 10) / 10}`).join("L");
  return { d, len: Math.max(1, polylineLength(pts) + (closed ? 1 : 0)), w, color, op, blend, cap };
}

/**
 * Hand-drawn polyline with real corners (stars, ticks, arrowheads, zig-zags): each segment wanders on its
 * own and is pinned at both ends, so the vertices stay sharp where the pen changed direction.
 */
export function handPolyline(verts, ctx, { amp = 0.6, step = 12, ...rest } = {}) {
  const w = rest.w ?? ctx.pen;
  const pts = [];
  for (let i = 0; i < verts.length - 1; i++) {
    const seg = wobblePoints([verts[i], verts[i + 1]], ctx.rng, { amp: amp * (ctx.wobble ?? 1), step, pen: w });
    pts.push(...(i ? seg.slice(1) : seg));
  }
  return makeStroke(pts, { color: ctx.color, smooth: false, ...rest, w });
}

/** A hand-drawn stroke through the given ideal points. */
export function handStroke(pts, ctx, { amp = 1, step = 12, ...rest } = {}) {
  const w = rest.w ?? ctx.pen;
  const wobbled = wobblePoints(pts, ctx.rng, { amp: amp * (ctx.wobble ?? 1), step, pen: w });
  return makeStroke(wobbled, { color: ctx.color, ...rest, w });
}
