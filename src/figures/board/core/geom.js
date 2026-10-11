// Small 2-D geometry kit. Points are [x, y] arrays; board space is SVG user units (y down).

export const add = (a, b) => [a[0] + b[0], a[1] + b[1]];
export const sub = (a, b) => [a[0] - b[0], a[1] - b[1]];
export const mul = (a, k) => [a[0] * k, a[1] * k];
export const lerp = (a, b, t) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];
export const len = (a) => Math.hypot(a[0], a[1]);
export const dist = (a, b) => Math.hypot(b[0] - a[0], b[1] - a[1]);
export const norm = (a) => {
  const l = len(a) || 1;
  return [a[0] / l, a[1] / l];
};
export const perp = (a) => [-a[1], a[0]];
export const rot = (a, rad, origin = [0, 0]) => {
  const c = Math.cos(rad), s = Math.sin(rad);
  const x = a[0] - origin[0], y = a[1] - origin[1];
  return [origin[0] + x * c - y * s, origin[1] + x * s + y * c];
};
export const deg = (d) => (d * Math.PI) / 180;
export const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));

export function polylineLength(pts) {
  let l = 0;
  for (let i = 1; i < pts.length; i++) l += dist(pts[i - 1], pts[i]);
  return l;
}

/** Evenly resample a polyline so consecutive points are ~`step` apart (keeps both ends). */
export function resample(pts, step) {
  if (pts.length < 2) return pts.slice();
  const total = polylineLength(pts);
  const n = Math.max(2, Math.round(total / step) + 1);
  const out = [pts[0]];
  let seg = 1, acc = 0;
  for (let k = 1; k < n - 1; k++) {
    const target = (total * k) / (n - 1);
    while (seg < pts.length - 1 && acc + dist(pts[seg - 1], pts[seg]) < target) {
      acc += dist(pts[seg - 1], pts[seg]);
      seg++;
    }
    const d = dist(pts[seg - 1], pts[seg]) || 1;
    out.push(lerp(pts[seg - 1], pts[seg], (target - acc) / d));
  }
  out.push(pts[pts.length - 1]);
  return out;
}

export function bezier(p0, c1, c2, p3, t) {
  const u = 1 - t;
  const a = u * u * u, b = 3 * u * u * t, c = 3 * u * t * t, d = t * t * t;
  return [a * p0[0] + b * c1[0] + c * c2[0] + d * p3[0], a * p0[1] + b * c1[1] + c * c2[1] + d * p3[1]];
}
export function bezierTangent(p0, c1, c2, p3, t) {
  const u = 1 - t;
  return [
    3 * u * u * (c1[0] - p0[0]) + 6 * u * t * (c2[0] - c1[0]) + 3 * t * t * (p3[0] - c2[0]),
    3 * u * u * (c1[1] - p0[1]) + 6 * u * t * (c2[1] - c1[1]) + 3 * t * t * (p3[1] - c2[1]),
  ];
}
export function sampleBezier(p0, c1, c2, p3, n = 24) {
  const out = [];
  for (let i = 0; i <= n; i++) out.push(bezier(p0, c1, c2, p3, i / n));
  return out;
}

export function bboxOf(pts) {
  let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
  for (const p of pts) {
    if (p[0] < x0) x0 = p[0];
    if (p[0] > x1) x1 = p[0];
    if (p[1] < y0) y0 = p[1];
    if (p[1] > y1) y1 = p[1];
  }
  return { x: x0, y: y0, w: x1 - x0, h: y1 - y0 };
}
export function unionBox(a, b) {
  if (!a) return b;
  if (!b) return a;
  const x0 = Math.min(a.x, b.x), y0 = Math.min(a.y, b.y);
  const x1 = Math.max(a.x + a.w, b.x + b.w), y1 = Math.max(a.y + a.h, b.y + b.h);
  return { x: x0, y: y0, w: x1 - x0, h: y1 - y0 };
}
export const inflate = (b, m) => ({ x: b.x - m, y: b.y - m, w: b.w + 2 * m, h: b.h + 2 * m });
export const center = (b) => [b.x + b.w / 2, b.y + b.h / 2];
export const overlaps = (a, b, pad = 0) =>
  a.x < b.x + b.w + pad && a.x + a.w + pad > b.x && a.y < b.y + b.h + pad && a.y + a.h + pad > b.y;

/** Where a ray from the box centre toward `target` leaves the (inflated) box. Used to start arrows at an edge. */
export function edgePoint(box, target, pad = 0) {
  const c = center(box);
  const dx = target[0] - c[0], dy = target[1] - c[1];
  if (!dx && !dy) return c;
  const hw = box.w / 2 + pad, hh = box.h / 2 + pad;
  const t = Math.min(dx ? hw / Math.abs(dx) : Infinity, dy ? hh / Math.abs(dy) : Infinity);
  return [c[0] + dx * t, c[1] + dy * t];
}

const f1 = (v) => {
  const r = Math.round(v * 10) / 10;
  return Object.is(r, -0) ? "0" : String(r);
};

/** A smooth SVG path through the points (Catmull-Rom converted to cubic Béziers). */
export function smoothPath(pts, { closed = false, tension = 0.5 } = {}) {
  const n = pts.length;
  if (n === 0) return "";
  if (n === 1) return `M${f1(pts[0][0])} ${f1(pts[0][1])}`;
  if (n === 2) return `M${f1(pts[0][0])} ${f1(pts[0][1])}L${f1(pts[1][0])} ${f1(pts[1][1])}`;
  const P = (i) => (closed ? pts[(i + n) % n] : pts[Math.max(0, Math.min(n - 1, i))]);
  let d = `M${f1(pts[0][0])} ${f1(pts[0][1])}`;
  const segs = closed ? n : n - 1;
  const k = tension / 3;
  for (let i = 0; i < segs; i++) {
    const p0 = P(i - 1), p1 = P(i), p2 = P(i + 1), p3 = P(i + 2);
    const c1 = [p1[0] + (p2[0] - p0[0]) * k, p1[1] + (p2[1] - p0[1]) * k];
    const c2 = [p2[0] - (p3[0] - p1[0]) * k, p2[1] - (p3[1] - p1[1]) * k];
    d += `C${f1(c1[0])} ${f1(c1[1])} ${f1(c2[0])} ${f1(c2[1])} ${f1(p2[0])} ${f1(p2[1])}`;
  }
  return closed ? d + "Z" : d;
}
export const polyPath = (pts) =>
  pts.length ? "M" + pts.map((p) => `${f1(p[0])} ${f1(p[1])}`).join("L") : "";
export { f1 };
