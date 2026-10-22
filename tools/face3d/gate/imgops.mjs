// small image helpers for the gate checks (RGBA in 0..255, masks as Uint8Array 0/1)
import fs from "node:fs"; import { decode, encode } from "./png.mjs";
export const W = 802, H = 862;
export function loadCase(dir, name) {
  const p = `${dir}/${name}.png`; if (!fs.existsSync(p)) return null;
  const img = decode(fs.readFileSync(p)); const out = { w: img.w, h: img.h, rgba: img.data, id: null };
  const ip = `${dir}/${name}.ids.png`;
  if (fs.existsSync(ip)) { const d = decode(fs.readFileSync(ip)).data, id = new Uint8Array(img.w * img.h); for (let i = 0; i < id.length; i++) id[i] = Math.round(d[i * 4]); out.id = id; }
  return out;
}
export const luma = (r, g, b) => 0.2126 * r + 0.7152 * g + 0.0722 * b;
export const lumaMap = (img) => { const n = img.w * img.h, L = new Float32Array(n), d = img.rgba; for (let i = 0; i < n; i++) L[i] = luma(d[i * 4], d[i * 4 + 1], d[i * 4 + 2]); return L; };
const lin = (v) => { v /= 255; return v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; };
export function lab(r, g, b) {
  const R = lin(r), G = lin(g), B = lin(b);
  let x = (0.4124 * R + 0.3576 * G + 0.1805 * B) / 0.95047, y = 0.2126 * R + 0.7152 * G + 0.0722 * B, z = (0.0193 * R + 0.1192 * G + 0.9505 * B) / 1.08883;
  const f = (t) => (t > 0.008856 ? Math.cbrt(t) : 7.787 * t + 16 / 116);
  x = f(x); y = f(y); z = f(z); return [116 * y - 16, 500 * (x - y), 200 * (y - z)];
}
export const dE = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);
// separable box dilation of a 0/1 mask by radius r
export function dilate(m, w, h, r) {
  if (r <= 0) return m.slice();
  const t = new Uint8Array(m.length), o = new Uint8Array(m.length);
  for (let y = 0; y < h; y++) { let c = 0; const row = y * w; for (let x = 0; x < Math.min(r, w); x++) c += m[row + x];
    for (let x = 0; x < w; x++) { if (x + r < w) c += m[row + x + r]; if (x - r - 1 >= 0) c -= m[row + x - r - 1]; t[row + x] = c > 0 ? 1 : 0; } }
  for (let x = 0; x < w; x++) { let c = 0; for (let y = 0; y < Math.min(r, h); y++) c += t[y * w + x];
    for (let y = 0; y < h; y++) { if (y + r < h) c += t[(y + r) * w + x]; if (y - r - 1 >= 0) c -= t[(y - r - 1) * w + x]; o[y * w + x] = c > 0 ? 1 : 0; } }
  return o;
}
export const invert = (m) => { const o = new Uint8Array(m.length); for (let i = 0; i < m.length; i++) o[i] = m[i] ? 0 : 1; return o; };
export const erode = (m, w, h, r) => invert(dilate(invert(m), w, h, r));
export const and = (a, b) => { const o = new Uint8Array(a.length); for (let i = 0; i < a.length; i++) o[i] = a[i] & b[i]; return o; };
export const andNot = (a, b) => { const o = new Uint8Array(a.length); for (let i = 0; i < a.length; i++) o[i] = a[i] & (b[i] ? 0 : 1); return o; };
export const or = (a, b) => { const o = new Uint8Array(a.length); for (let i = 0; i < a.length; i++) o[i] = a[i] | b[i]; return o; };
export const count = (m) => { let c = 0; for (let i = 0; i < m.length; i++) c += m[i]; return c; };
export const maskOf = (n, f) => { const m = new Uint8Array(n); for (let i = 0; i < n; i++) m[i] = f(i) ? 1 : 0; return m; };
export function bbox(m, w, h) {
  let x0 = w, y0 = h, x1 = -1, y1 = -1;
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) if (m[y * w + x]) { if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y; }
  return x1 < 0 ? null : { x0, y0, x1, y1, cx: (x0 + x1) / 2, cy: (y0 + y1) / 2, w: x1 - x0 + 1, h: y1 - y0 + 1 };
}
// background-connected flood fill: marks pixels of `free` (1 = passable) reachable from the frame border
export function floodBorder(free, w, h) {
  const seen = new Uint8Array(free.length), st = [];
  const push = (i) => { if (free[i] && !seen[i]) { seen[i] = 1; st.push(i); } };
  for (let x = 0; x < w; x++) { push(x); push((h - 1) * w + x); } for (let y = 0; y < h; y++) { push(y * w); push(y * w + w - 1); }
  while (st.length) { const i = st.pop(), x = i % w; if (x > 0) push(i - 1); if (x < w - 1) push(i + 1); if (i >= w) push(i - w); if (i < free.length - w) push(i + w); }
  return seen;
}
// connected components (4-conn) of a mask, returns label array and sizes
export function components(m, w, h) {
  const lab = new Int32Array(m.length), sizes = [0]; let n = 0; const st = [];
  for (let s = 0; s < m.length; s++) { if (!m[s] || lab[s]) continue; n++; let sz = 0; lab[s] = n; st.push(s);
    while (st.length) { const i = st.pop(); sz++; const x = i % w;
      if (x > 0 && m[i - 1] && !lab[i - 1]) { lab[i - 1] = n; st.push(i - 1); } if (x < w - 1 && m[i + 1] && !lab[i + 1]) { lab[i + 1] = n; st.push(i + 1); }
      if (i >= w && m[i - w] && !lab[i - w]) { lab[i - w] = n; st.push(i - w); } if (i < m.length - w && m[i + w] && !lab[i + w]) { lab[i + w] = n; st.push(i + w); } }
    sizes.push(sz); }
  return { lab, sizes, n };
}
export function boxDown(img, nw) {
  const nh = Math.round(img.h * nw / img.w), out = new Uint8ClampedArray(nw * nh * 4), sx = img.w / nw, sy = img.h / nh, d = img.rgba;
  for (let y = 0; y < nh; y++) for (let x = 0; x < nw; x++) {
    const x0 = Math.floor(x * sx), x1 = Math.max(x0 + 1, Math.floor((x + 1) * sx)), y0 = Math.floor(y * sy), y1 = Math.max(y0 + 1, Math.floor((y + 1) * sy));
    let r = 0, g = 0, b = 0, a = 0, c = 0;
    for (let yy = y0; yy < y1; yy++) for (let xx = x0; xx < x1; xx++) { const i = (yy * img.w + xx) * 4, al = d[i + 3]; r += d[i] * al; g += d[i + 1] * al; b += d[i + 2] * al; a += al; c++; }
    const o = (y * nw + x) * 4; out[o + 3] = a / c; if (a > 0) { out[o] = r / a; out[o + 1] = g / a; out[o + 2] = b / a; }
  }
  return { w: nw, h: nh, rgba: out, id: null };
}
export function composite(img, bg) {
  const o = new Uint8ClampedArray(img.rgba.length), d = img.rgba;
  for (let i = 0; i < d.length; i += 4) { const a = d[i + 3] / 255; for (let k = 0; k < 3; k++) o[i + k] = d[i + k] * a + bg[k] * (1 - a); o[i + 3] = 255; }
  return { w: img.w, h: img.h, rgba: o };
}
// crop with an overlay of flagged pixels, composited on a light ground, scaled to at most maxW wide
export function writeCrop(file, img, mask, box, maxW = 360) {
  const pad = 28; const x0 = Math.max(0, box.x0 - pad), y0 = Math.max(0, box.y0 - pad), x1 = Math.min(img.w - 1, box.x1 + pad), y1 = Math.min(img.h - 1, box.y1 + pad);
  let cw = x1 - x0 + 1, ch = y1 - y0 + 1; if (cw < 160) { const e = Math.ceil((160 - cw) / 2); cw += 2 * e; }
  const cx0 = Math.max(0, Math.min(img.w - cw, x0 - Math.floor((cw - (x1 - x0 + 1)) / 2))); cw = Math.min(cw, img.w - cx0);
  const sc = Math.min(1, maxW / cw), ow = Math.round(cw * sc), oh = Math.round(ch * sc), out = new Uint8ClampedArray(ow * oh * 4);
  for (let y = 0; y < oh; y++) for (let x = 0; x < ow; x++) {
    const sx = cx0 + Math.floor(x / sc), sy = y0 + Math.floor(y / sc), i = (sy * img.w + sx) * 4, a = img.rgba[i + 3] / 255, o = (y * ow + x) * 4;
    for (let k = 0; k < 3; k++) out[o + k] = img.rgba[i + k] * a + 238 * (1 - a);
    if (mask && mask[sy * img.w + sx]) { out[o] = out[o] * 0.35 + 255 * 0.65; out[o + 1] *= 0.35; out[o + 2] = out[o + 2] * 0.35 + 255 * 0.65; } out[o + 3] = 255;
  }
  fs.mkdirSync(file.replace(/\/[^/]*$/, ""), { recursive: true }); fs.writeFileSync(file, encode(out, ow, oh));
}
export { encode };
