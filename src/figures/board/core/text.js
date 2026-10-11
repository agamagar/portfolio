// Handwriting layout: measure, wrap and place glyphs of the Marker Hand font, with the small wander a
// real hand has (baseline drift, letter tilt, size and spacing variance). Output is data, not DOM.

import { HAND } from "../data/markerHand.data.js";
import { EXTRA } from "../data/extraGlyphs.js";
import { makeNoise } from "./rng.js";
import { f1 } from "./geom.js";

export const UPM = HAND.upm;
export const SIZES = { xs: 30, s: 40, m: 54, l: 76, xl: 112 };
export const sizeOf = (s) => (typeof s === "number" ? s : SIZES[s] ?? SIZES.m);
export const penWidth = (size) => (HAND.pen * size) / UPM;

// ---------------------------------------------------------------- glyph access

const cache = new Map();
function pathBounds(d) {
  const nums = d.match(/-?\d*\.?\d+/g);
  if (!nums) return { x0: 0, x1: 0, y0: 0, y1: 0 };
  let x0 = Infinity, x1 = -Infinity, y0 = Infinity, y1 = -Infinity;
  for (let i = 0; i + 1 < nums.length; i += 2) {
    const x = +nums[i], y = +nums[i + 1];
    if (x < x0) x0 = x;
    if (x > x1) x1 = x;
    if (y < y0) y0 = y;
    if (y > y1) y1 = y;
  }
  return { x0, x1, y0, y1 };
}
const strokePath = (flat) => {
  let d = `M${flat[0]} ${flat[1]}`, len = 0;
  for (let i = 2; i < flat.length; i += 2) {
    d += `L${flat[i]} ${flat[i + 1]}`;
    len += Math.hypot(flat[i] - flat[i - 2], flat[i + 1] - flat[i - 1]);
  }
  return { d, len: Math.max(len, 1) };
};

/** A glyph ready to use: { w, d, pen, strokes:[{d,len}], bounds } or null for characters we cannot draw. */
export function glyph(ch) {
  if (cache.has(ch)) return cache.get(ch);
  const src = HAND.glyphs[ch] ?? EXTRA[ch];
  let g = null;
  if (src) {
    const strokes = src.s.map(strokePath);
    let bounds;
    if (src.pen) {
      const xs = src.s.flatMap((s) => s.filter((_, i) => i % 2 === 0)), ys = src.s.flatMap((s) => s.filter((_, i) => i % 2 === 1));
      const pw = HAND.pen / 2;
      bounds = { x0: Math.min(...xs) - pw, x1: Math.max(...xs) + pw, y0: Math.min(...ys) - pw, y1: Math.max(...ys) + pw };
    } else bounds = src.d ? pathBounds(src.d) : { x0: 0, x1: 0, y0: 0, y1: 0 };
    g = { ch, w: src.w, d: src.d ?? "", pen: !!src.pen, strokes, bounds };
  }
  cache.set(ch, g);
  return g;
}

export const advanceOf = (ch) => (glyph(ch)?.w ?? HAND.space * 0.9);

export function measureLine(str, size, track = 0.002) {
  let w = 0;
  const k = size / UPM;
  for (const ch of str) w += advanceOf(ch) * k + track * size;
  return w - (str.length ? track * size : 0);
}

/** Greedy word wrap. Returns an array of lines (explicit \n always breaks). */
export function wrapText(str, size, maxW, track = 0.002) {
  const out = [];
  for (const para of String(str).split("\n")) {
    if (!maxW || !isFinite(maxW)) {
      out.push(para);
      continue;
    }
    let line = "";
    for (const word of para.split(/\s+/).filter(Boolean)) {
      const t = line ? line + " " + word : word;
      if (line && measureLine(t, size, track) > maxW) {
        out.push(line);
        line = word;
      } else line = t;
    }
    out.push(line);
  }
  return out;
}

export const TRACK = 0.002;     // the font itself is spaced tight now; this is only a hair of air
export const blockSize = (str, size, { maxW, lineHeight = 1.22, track = TRACK } = {}) => {
  const lines = wrapText(str, size, maxW, track);
  return { lines, w: Math.max(0, ...lines.map((l) => measureLine(l, size, track))), h: lines.length * size * lineHeight };
};

// ---------------------------------------------------------------- placing glyphs

/**
 * Write `str` as handwriting. `at` is the left (or centre / right, per align) of the first line.
 * anchor: "top" (default): at.y is the top of the text block; "baseline": at.y is the first baseline;
 *         "middle": at.y is the vertical centre of the block.
 * Returns an item the renderer and scheduler understand.
 */
export function writeText(str, ctx, o = {}) {
  const size = sizeOf(o.size ?? "m");
  const rng = ctx.rng.fork(31);
  const lineHeight = o.lineHeight ?? 1.22;
  const track = o.track ?? TRACK;
  const jitter = (o.jitter ?? 1) * (ctx.wobble ?? 1);
  const align = o.align ?? "left";
  const lines = wrapText(str, size, o.maxW, track);
  const blockH = lines.length * size * lineHeight;
  const asc = size * 0.8;
  let y0 = o.at[1];                                        // baseline of the first line
  if ((o.anchor ?? "top") === "top") y0 += asc;
  else if (o.anchor === "middle") y0 += asc - blockH / 2 + size * 0.1;
  const k = size / UPM;
  const wy = makeNoise(rng, { octaves: 2, base: 1 / (size * 2.6) });
  const wr = makeNoise(rng, { octaves: 2, base: 1 / (size * 1.7) });
  const glyphs = [], lineBoxes = [];
  let bx0 = Infinity, by0 = Infinity, bx1 = -Infinity, by1 = -Infinity;
  lines.forEach((line, li) => {
    const lw = measureLine(line, size, track);
    let x = o.at[0] - (align === "center" ? lw / 2 : align === "right" ? lw : 0);
    const base = y0 + li * size * lineHeight;
    const slope = rng.sym(0.011) * jitter;                  // each line leans a touch, like it was written freehand
    const x00 = x;
    let lx0 = Infinity, lx1 = -Infinity, afterSpace = false;
    for (const ch of line) {
      if (ch === " ") afterSpace = true;
      const g = glyph(ch);
      const adv = advanceOf(ch) * k;
      if (g && (g.d || g.strokes.length) && ch !== " ") {
        const s = 1 + rng.sym(0.03) * jitter;
        const gx = x + rng.sym(size * 0.008) * jitter;
        const gy = base + wy(x - x00) * size * 0.022 * jitter + (x - x00) * slope;
        const rotDeg = wr(x - x00) * 2.1 * jitter + rng.sym(0.8) * jitter;
        const sc = k * s;
        glyphs.push({
          ch, d: g.d, pen: g.pen, strokes: g.strokes.map((s) => ({ d: s.d, len: s.len })),   // per-instance: the scheduler writes timings onto them
          x: gx, y: gy, rot: rotDeg, sc,
          line: li, sp: afterSpace,
        });
        afterSpace = false;
        const b = g.bounds;
        lx0 = Math.min(lx0, gx + b.x0 * sc);
        lx1 = Math.max(lx1, gx + b.x1 * sc);
        by0 = Math.min(by0, gy - b.y1 * sc);
        by1 = Math.max(by1, gy - b.y0 * sc);
      }
      x += adv + rng.sym(size * 0.006) * jitter;
    }
    if (isFinite(lx0)) {
      bx0 = Math.min(bx0, lx0);
      bx1 = Math.max(bx1, lx1);
      lineBoxes.push({ x: lx0, y: base - size * 0.78, w: lx1 - lx0, h: size * 1.0, base });
    } else lineBoxes.push({ x: x00, y: base - size * 0.78, w: 0, h: size, base });
  });
  if (!isFinite(bx0)) {
    bx0 = by0 = 0;
    bx1 = by1 = 0;
  }
  // the box used for layout is the inked area padded to the nominal line box (ignores deep descenders)
  const top = y0 - size * 0.8, bottom = y0 + (lines.length - 1) * size * lineHeight + size * 0.28;
  return {
    kind: "text", text: String(str), color: o.color ?? ctx.color, size, pen: penWidth(size), op: o.op,
    glyphs, lineBoxes, lines,
    bbox: { x: bx0, y: top, w: bx1 - bx0, h: bottom - top },
    ink: { x: bx0, y: by0, w: bx1 - bx0, h: by1 - by0 },
  };
}

export const glyphTransform = (g) => `translate(${f1(g.x)} ${f1(g.y)}) rotate(${f1(g.rot)}) scale(${+g.sc.toFixed(5)} ${-+g.sc.toFixed(5)})`;
