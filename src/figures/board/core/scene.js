// Spec -> scene. A spec is either a list of primitive `items` or a `layout` generator that emits them.
// The scene is plain data (strokes, glyph runs, fills, all with start times), which the SVG renderer and
// the player consume. Nothing here touches the DOM.

import { makeRng, hashSeed } from "./rng.js";
import * as S from "./shapes.js";
import { writeText, sizeOf, penWidth } from "./text.js";
import { clamp, unionBox, inflate, center, edgePoint, sampleBezier, add } from "./geom.js";
import { handStroke } from "./pen.js";
import { LAYOUTS } from "./layouts.js";

import { COLORS, BRANCH_COLORS, colorOf } from "./palette.js";
export { COLORS, BRANCH_COLORS, colorOf };

const DEFAULTS = { w: 1600, h: 1000, bg: "#ffffff", seed: "board", pen: 5.4, wobble: 1, pace: 1, surface: "used", color: "teal" };

/** Resolve a rect from {rect}, or {of: id, pad}, or {at,size}. */
function rectOf(p, reg) {
  if (p.rect) return p.rect;
  if (p.of != null) {
    const r = reg.get(p.of);
    if (!r) return null;
    const b = p.pad != null ? inflate(r.bbox, p.pad) : r.bbox;
    return b;
  }
  if (p.at && p.size) return { x: p.at[0] - p.size[0] / 2, y: p.at[1] - p.size[1] / 2, w: p.size[0], h: p.size[1] };
  return null;
}
const pointOf = (v, reg, toward) => {
  if (Array.isArray(v)) return v;
  const r = reg.get(v);
  if (!r) return [0, 0];
  return edgePoint(r.bbox, toward ?? center(r.bbox), (r.gap ?? 8));
};

/** Make one primitive into a scene item (or null). `c` is a drawing context. */
function realize(p, c, reg) {
  const w = p.w != null ? p.w : undefined;                 // explicit pen px
  const o = { w, op: p.op };
  const wrapInk = (res, extra = {}) => res && { kind: "ink", strokes: res.strokes, fills: res.fills, bbox: res.bbox, ...extra };
  switch (p.type) {
    case "text": {
      const it = writeText(p.text, c, { at: p.at, size: p.size, align: p.align, maxW: p.maxW, anchor: p.anchor, color: colorOf(p.color, "teal"), jitter: p.jitter, lineHeight: p.lineHeight });
      it.op = p.op;
      return it;
    }
    case "sticky": {
      const rect = rectOf(p, reg);
      const res = S.sticky(rect, c, { color: p.color, rot: p.rot });
      const it = { kind: "sticky", fills: res.fills, strokes: [], bbox: res.bbox };
      return it;
    }
    case "box": return wrapInk(S.box(rectOf(p, reg), c, { radius: p.radius, double: p.double, overshoot: p.overshoot, ...o }));
    case "ellipse": {
      if (p.of != null || p.rect) {
        const r = rectOf(p, reg), k = p.k ?? 0.62;
        return wrapInk(S.ellipse(r.x + r.w / 2, r.y + r.h / 2, r.w * k + (p.pad ?? 14), r.h * (p.ky ?? 0.78) + (p.pad ?? 14), c, o));
      }
      return wrapInk(S.ellipse(p.at[0], p.at[1], p.rx ?? p.r ?? 40, p.ry ?? p.r ?? 40, c, o));
    }
    case "cloud": return wrapInk(S.cloud(rectOf(p, reg), c, { bump: p.bump, ...o }));
    case "arrow": {
      const a0 = Array.isArray(p.from) ? p.from : null, b0 = Array.isArray(p.to) ? p.to : null;
      const ta = b0 ?? center(reg.get(p.to)?.bbox ?? { x: 0, y: 0, w: 0, h: 0 });
      const tb = a0 ?? center(reg.get(p.from)?.bbox ?? { x: 0, y: 0, w: 0, h: 0 });
      const a = a0 ?? pointOf(p.from, reg, ta), b = b0 ?? pointOf(p.to, reg, tb);
      return wrapInk(S.arrow(a, b, c, { curve: p.curve, head: p.head, headScale: p.headScale, ...o }));
    }
    case "curve": {                                    // smooth connector with horizontal tangents (mind maps)
      const a = p.from, b = p.to, bend = p.bend ?? 0.5;
      const dx = (b[0] - a[0]) * bend;
      const pts = sampleBezier(a, [a[0] + dx, a[1]], [b[0] - dx, b[1]], b, 28);
      return wrapInk({ strokes: [handStroke(pts, c, { amp: 0.6, w: p.w, op: p.op })], fills: [], bbox: { x: Math.min(a[0], b[0]), y: Math.min(a[1], b[1]), w: Math.abs(b[0] - a[0]), h: Math.abs(b[1] - a[1]) } });
    }
    case "line": return wrapInk(S.line(p.from, p.to, c, o));
    case "squiggle": return wrapInk(S.squiggle(p.from, p.to, c, { amp: p.amp, wavelength: p.wavelength, ...o }));
    case "underline": {
      let x0, x1, y;
      if (p.of != null) {
        const r = reg.get(p.of);
        if (!r) return null;
        const lb = r.item?.lineBoxes?.[p.line ?? r.item.lineBoxes.length - 1];
        const b = lb ?? r.bbox;
        x0 = b.x - 2; x1 = b.x + b.w + 4; y = (lb ? lb.base : b.y + b.h) + (p.gap ?? c.pen * 2.4);
      } else [x0, x1, y] = p.span;
      return wrapInk(S.underline(x0, x1, y, c, { style: p.style, ...o }));
    }
    case "highlight": return wrapInk(S.highlight(rectOf(p, reg), c, { ...o, w: p.thickness }));
    case "star": return wrapInk(S.star(p.at[0], p.at[1], p.r ?? 26, c, o));
    case "check": return wrapInk(S.check(p.at[0], p.at[1], p.s ?? 40, c, o));
    case "cross": return wrapInk(S.cross(p.at[0], p.at[1], p.s ?? 34, c, o));
    case "bulb": return wrapInk(S.bulb(p.at[0], p.at[1], p.s ?? 70, c, o));
    case "burst": return wrapInk(S.burst(p.at[0], p.at[1], p.r ?? 22, c, { n: p.n, span: p.span, start: p.start, len: p.len, ...o }));
    case "bracket": return wrapInk(S.bracket(p.x, p.y0, p.y1, c, { side: p.side, curly: p.curly, depth: p.depth, ...o }));
    case "scribble": return wrapInk(S.scribble(rectOf(p, reg), c, o));
    case "strike": {
      const r = reg.get(p.of);
      if (!r) return null;
      const lb = r.item?.lineBoxes?.[0] ?? r.bbox;
      return wrapInk(S.strike(lb.x, lb.x + lb.w, lb.base != null ? lb.base - (r.item.size ?? 40) * 0.28 : lb.y + lb.h / 2, c, o));
    }
    case "dot": return wrapInk(S.dot(p.at[0], p.at[1], p.r ?? 7, c, o));
    case "image": return { kind: "image", href: p.href, x: p.rect.x, y: p.rect.y, w: p.rect.w, h: p.rect.h, bbox: p.rect, strokes: [], fills: [], radius: p.radius ?? 6 };
    case "wait": return { kind: "wait", strokes: [], fills: [], bbox: { x: 0, y: 0, w: 0, h: 0 }, hold: p.s ?? 0.5 };
    default: return null;
  }
}

// ---------------------------------------------------------------- scheduling

const STROKE_PX_PER_S = 1500;                // how fast the pen moves across shapes
const TEXT_PX_PER_S_PER_SIZE = 16;          // handwriting speed scales with letter size

export function schedule(items, pace = 1) {
  let t = 0.2, prevStart = 0, end = 0;
  for (const it of items) {
    if (it.kind === "wait") {
      t += it.hold / pace;
      continue;
    }
    if (it.with) t = prevStart;
    else t += (it.pause ?? 0) / pace;
    const start = (it.at0 != null ? it.at0 : t);
    prevStart = start;
    let tt = start;
    if (it.kind === "text") {
      for (const g of it.glyphs) {
        if (g.sp) tt += 0.05 / pace;
        g.t0 = tt;
        // one time budget per letter, shared between its pen strokes by length
        const px = g.strokes.reduce((a, s) => a + s.len * g.sc, 0);
        const T = clamp(px / (it.size * TEXT_PX_PER_S_PER_SIZE), 0.06, 0.3) / pace;
        const total = g.strokes.reduce((a, s) => a + s.len, 0) || 1;
        for (const s of g.strokes) {
          s.t0 = tt;
          s.dur = Math.max(0.012, (T * s.len) / total);
          tt += s.dur + 0.003 / pace;
        }
        g.t1 = tt;
      }
      t = tt + 0.12 / pace;
    } else if (it.kind === "ink") {
      for (const s of it.strokes) {
        const speed = s.hl ? STROKE_PX_PER_S * 0.65 : STROKE_PX_PER_S;
        const dur = clamp(s.len / speed, s.hl ? 0.25 : 0.1, 1.0) / pace;
        s.t0 = tt;
        s.dur = dur;
        tt += dur + 0.03 / pace;
      }
      for (const f of it.fills) { f.t0 = tt; f.dur = 0.3 / pace; tt += f.dur; }
      t = tt + 0.06 / pace;
    } else if (it.kind === "sticky") {
      for (const f of it.fills) { f.t0 = tt; f.dur = 0.34 / pace; tt += f.dur; }
      t = tt + 0.12 / pace;
    } else if (it.kind === "image") {
      it.t0 = tt; it.dur = 0.5 / pace;
      t = tt + it.dur + 0.1 / pace;
    }
    it.t0 = start;
    it.t1 = tt;
    end = Math.max(end, tt);
  }
  return end;
}

// ---------------------------------------------------------------- build

/** spec -> { w, h, bg, items, duration, label } */
export function buildScene(input) {
  const spec = { ...DEFAULTS, ...input };
  const master = makeRng(typeof spec.seed === "string" ? hashSeed(spec.seed) : spec.seed);
  const reg = new Map();
  let prims = [];
  if (spec.layout) {
    const gen = LAYOUTS[spec.layout];
    if (!gen) throw new Error(`Unknown board layout "${spec.layout}". Try: ${Object.keys(LAYOUTS).join(", ")}`);
    prims = gen(spec);
  }
  if (spec.items) prims = prims.concat(spec.items);
  const items = [];
  prims.forEach((p, i) => {
    const color = colorOf(p.color, spec.color);
    const c = { rng: master.fork(i + 1), pen: p.w ?? spec.pen, color, wobble: p.wobble ?? spec.wobble };
    // pen width follows letter size for text so strokes and letters share one marker
    const it = realize(p, c, reg);
    if (!it) return;
    it.color = it.color ?? color;
    it.pause = p.pause;
    it.with = p.with;
    it.id = p.id;
    if (p.id != null) reg.set(p.id, { bbox: it.bbox, item: it, gap: p.gap });
    items.push(it);
  });
  let pace = spec.pace;
  let duration = schedule(items, pace);
  const cap = spec.maxDuration ?? 22;                      // a dense board time-lapses instead of dragging on
  if (spec.autoPace !== false && duration > cap) {
    pace = Math.min(4, pace * (duration / cap));
    duration = schedule(items, pace);
  }
  duration += 0.4;
  const label = spec.label ?? spec.title ?? items.filter((i) => i.kind === "text").map((i) => i.text).join(". ").slice(0, 300);
  return { w: spec.w, h: spec.h, bg: spec.bg, surface: spec.surface, seed: spec.seed, items, duration, pace, label, spec };
}
