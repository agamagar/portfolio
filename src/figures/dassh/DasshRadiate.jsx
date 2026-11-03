// Live port of the Dassh radiate shader (design-playground/docs/dassh/shader/radiate):
// rings of dots radiate from a cut-out subject, over the photo, and never sit on the person.
// The canvas shares the photo's box and object-fit, so it adds no layout and the photo stays the fallback:
// if the mask fails to load, nothing is drawn. It pauses offscreen and in a hidden tab, and under
// prefers-reduced-motion it draws one still frame.
import { useEffect, useRef } from "react";

const W = 756, H = 982;          // canvas px, the photo's box in Figma px
const FRAME = { x: 60, y: 60, w: 636, h: 862, r: 60 };   // the visible photo inside the 756 x 982 box
const FS = 3;                    // canvas px per field px (mask is 252 x 328)
const RINGS = 9, FIRST = 1.5, GAP = 5, PITCH = 6;
const BISCUIT = "252,230,192", VIOLET = "231,218,255";   // --dassh-biscuit-500, --dassh-violet-100
const TAU = Math.PI * 2;

function hash(i) { i = Math.imul(i ^ 0x9e3779b9, 0x85ebca6b); i ^= i >>> 13; i = Math.imul(i, 0xc2b2ae35); return ((i ^ (i >>> 16)) >>> 0) / 4294967296; }

// Distance outside the subject (0 inside), two-pass chamfer, then one box blur to soften the rings.
function distanceField(inside, w, h) {
  const D = new Float32Array(w * h), BIG = 1e6;
  for (let i = 0; i < D.length; i++) D[i] = inside[i] ? 0 : BIG;
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    const i = y * w + x; let v = D[i];
    if (x) v = Math.min(v, D[i - 1] + 1);
    if (y) { v = Math.min(v, D[i - w] + 1); if (x) v = Math.min(v, D[i - w - 1] + 1.414); if (x < w - 1) v = Math.min(v, D[i - w + 1] + 1.414); }
    D[i] = v;
  }
  for (let y = h - 1; y >= 0; y--) for (let x = w - 1; x >= 0; x--) {
    const i = y * w + x; let v = D[i];
    if (x < w - 1) v = Math.min(v, D[i + 1] + 1);
    if (y < h - 1) { v = Math.min(v, D[i + w] + 1); if (x < w - 1) v = Math.min(v, D[i + w + 1] + 1.414); if (x) v = Math.min(v, D[i + w - 1] + 1.414); }
    D[i] = v;
  }
  const B = new Float32Array(D);
  for (let y = 1; y < h - 1; y++) for (let x = 1; x < w - 1; x++) {
    const i = y * w + x; let s = 0;
    for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) s += D[i + dy * w + dx];
    B[i] = s / 9;
  }
  return B;
}

// Marching squares at one level, joined into polylines. Edge ids: 2i is the top edge of cell i, 2i+1 its left edge.
function contours(D, w, h, level) {
  const adj = new Map();
  const link = (a, b) => { (adj.get(a) ?? adj.set(a, []).get(a)).push(b); (adj.get(b) ?? adj.set(b, []).get(b)).push(a); };
  for (let y = 0; y < h - 1; y++) for (let x = 0; x < w - 1; x++) {
    const i = y * w + x;
    const code = (D[i] < level ? 8 : 0) | (D[i + 1] < level ? 4 : 0) | (D[i + w + 1] < level ? 2 : 0) | (D[i + w] < level ? 1 : 0);
    if (code === 0 || code === 15) continue;
    const T = 2 * i, R = 2 * (i + 1) + 1, Bt = 2 * (i + w), L = 2 * i + 1;
    switch (code) {
      case 1: case 14: link(L, Bt); break;
      case 2: case 13: link(Bt, R); break;
      case 3: case 12: link(L, R); break;
      case 4: case 11: link(T, R); break;
      case 6: case 9: link(T, Bt); break;
      case 7: case 8: link(T, L); break;
      case 5: link(T, R); link(L, Bt); break;
      case 10: link(T, L); link(Bt, R); break;
    }
  }
  const pt = (id) => {
    const i = id >> 1, x = i % w, y = (i / w) | 0;
    const v0 = D[i] - level, v1 = (id & 1 ? D[i + w] : D[i + 1]) - level;
    const t = v0 / (v0 - v1 || 1e-6);
    return id & 1 ? [x, y + t] : [x + t, y];
  };
  const seen = new Set(), lines = [];
  const walk = (start, closed) => {
    const ids = [start]; seen.add(start); let prev = -1, cur = start;
    for (;;) {
      let next = -1;
      for (const nb of adj.get(cur)) if (nb !== prev && !seen.has(nb)) { next = nb; break; }
      if (next < 0) break;
      seen.add(next); ids.push(next); prev = cur; cur = next;
    }
    lines.push({ pts: ids.map(pt), closed });
  };
  for (const [id, nb] of adj) if (nb.length === 1 && !seen.has(id)) walk(id, false);
  for (const id of adj.keys()) if (!seen.has(id)) walk(id, true);
  return lines;
}

function sample(D, w, h, x, y) {
  const xi = Math.max(0, Math.min(w - 2, x | 0)), yi = Math.max(0, Math.min(h - 2, y | 0));
  const fx = x - xi, fy = y - yi, i = yi * w + xi;
  return (D[i] * (1 - fx) + D[i + 1] * fx) * (1 - fy) + (D[i + w] * (1 - fx) + D[i + w + 1] * fx) * fy;
}

// Dots spaced evenly along each ring, each with its outward normal, ring index and a seed.
function buildDots(D, w, h) {
  const dots = [];
  for (let r = 0; r < RINGS; r++) {
    const level = FIRST + r * GAP;
    for (const line of contours(D, w, h, level)) {
      const P = line.closed ? [...line.pts, line.pts[0]] : line.pts;
      let len = 0;
      for (let k = 1; k < P.length; k++) len += Math.hypot(P[k][0] - P[k - 1][0], P[k][1] - P[k - 1][1]);
      if (len < PITCH * 3) continue;
      const n = Math.max(1, Math.round(len / PITCH)), step = len / n;
      let target = (r % 2) * step * 0.5, acc = 0;
      for (let k = 1; k < P.length; k++) {
        const [x0, y0] = P[k - 1], [x1, y1] = P[k];
        const seg = Math.hypot(x1 - x0, y1 - y0);
        while (target <= acc + seg && seg > 0) {
          const u = (target - acc) / seg, x = x0 + (x1 - x0) * u, y = y0 + (y1 - y0) * u;
          let nx = sample(D, w, h, x + 1, y) - sample(D, w, h, x - 1, y), ny = sample(D, w, h, x, y + 1) - sample(D, w, h, x, y - 1);
          const nl = Math.hypot(nx, ny) || 1; nx /= nl; ny /= nl;
          const X = x * FS, Y = y * FS;
          if (X > -20 && X < W + 20 && Y > -20 && Y < H + 20) {
            const s = dots.length * 5;
            dots.push({ x: X, y: Y, nx, ny, ring: r, theta: Math.atan2(Y - H * 0.55, X - W * 0.7), s: [hash(s), hash(s + 1), hash(s + 2), hash(s + 3)] });
          }
          target += step;
        }
        acc += seg;
      }
    }
  }
  return dots;
}

// One frame at time t (seconds): a slow wave travels outward through the rings, each dot wanders a little.
function paint(g, dots, t) {
  g.clearRect(0, 0, W, H);
  for (const d of dots) {
    const z = 1 - d.ring / RINGS, fall = Math.pow(1 - d.ring / (RINGS + 1), 0.8);
    const wave = Math.sin(TAU * (0.12 * d.ring - t / 6));
    const wob = 4 * (0.3 + d.ring / RINGS) * Math.sin(d.theta * 3 + d.ring * 0.7 - TAU * t / 6);
    const off = 9 * fall * wave + wob;
    const f = (0.5 + d.s[1]) / 6, ph = d.s[2];
    const jx = 3 * z * Math.sin(TAU * (f * t + ph)), jy = 3 * z * Math.cos(TAU * (f * t + ph + d.s[3]));
    const r = Math.max(1, 3.4 * (0.55 + 0.7 * z) * (1 + 0.25 * wave * fall));
    const a = 0.45 + 0.55 * (1 - (1 - z) ** 2);
    g.fillStyle = `rgba(${d.ring % 2 ? VIOLET : BISCUIT},${a.toFixed(3)})`;
    g.beginPath();
    g.arc(d.x + d.nx * off + jx, d.y + d.ny * off + jy, r, 0, TAU);
    g.fill();
  }
}

export function DasshRadiate({ mask, className = "dsh__radiate" }) {
  const ref = useRef(null);
  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return undefined;
    const g = canvas.getContext("2d");
    // Dots are clipped to the photo's own frame: the webp is inset 60 Figma px with 60 px corners.
    g.beginPath(); g.roundRect(FRAME.x, FRAME.y, FRAME.w, FRAME.h, FRAME.r); g.clip();
    const still = window.matchMedia("(prefers-reduced-motion: reduce)");
    let dots = null, raf = 0, onScreen = false, t0 = 0, dead = false;

    const frame = (now) => {
      raf = 0;
      if (!dots || !onScreen || document.hidden) return;
      if (!t0) t0 = now;
      paint(g, dots, (now - t0) / 1000);
      raf = requestAnimationFrame(frame);
    };
    const sync = () => {
      if (!dots) return;
      if (still.matches) { cancelAnimationFrame(raf); raf = 0; paint(g, dots, 1.5); return; }
      if (onScreen && !document.hidden && !raf) raf = requestAnimationFrame(frame);
    };

    const io = new IntersectionObserver(([e]) => { onScreen = e.isIntersecting; sync(); }, { threshold: 0.05 });
    io.observe(canvas);
    document.addEventListener("visibilitychange", sync);
    still.addEventListener("change", sync);

    const img = new Image();
    img.onload = () => {
      if (dead) return;
      const m = document.createElement("canvas");
      m.width = img.width; m.height = img.height;
      const mg = m.getContext("2d", { willReadFrequently: true });
      mg.drawImage(img, 0, 0);
      const px = mg.getImageData(0, 0, m.width, m.height).data;
      const inside = new Uint8Array(m.width * m.height);
      for (let i = 0; i < inside.length; i++) inside[i] = px[i * 4] > 128 ? 1 : 0;
      dots = buildDots(distanceField(inside, m.width, m.height), m.width, m.height);
      sync();
    };
    img.src = mask;

    return () => {
      dead = true; cancelAnimationFrame(raf);
      io.disconnect(); document.removeEventListener("visibilitychange", sync); still.removeEventListener("change", sync);
    };
  }, [mask]);

  return <canvas ref={ref} className={className} width={W} height={H} aria-hidden="true" />;
}
