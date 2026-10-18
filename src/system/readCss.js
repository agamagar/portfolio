// Reads the design system straight out of the loaded stylesheets, so /system can't drift from the code.
// Nothing here is a copy of a value: tokens come from the :root / html.dark rules, the scales are
// histograms of what the CSS actually declares.

const LIGHT = new Set([":root", "html", ":root:not(.dark)", "html:not(.dark)"]);
const DARK = new Set([":root.dark", "html.dark", ":root.dark:root", ":root[data-theme=\"dark\"]"]);

function* rules(list) {
  for (const r of list) {
    yield r;
    if (r.cssRules && !(r instanceof CSSStyleRule)) yield* rules(r.cssRules);
  }
}

function sheets() {
  const out = [];
  for (const s of document.styleSheets) {
    try { out.push(s.cssRules); } catch { /* cross-origin (fonts) */ }
  }
  return out;
}

/** { light: {--name: raw}, dark: {--name: raw}, source: {--name: file} } for global tokens. */
export function readTokens() {
  const light = {}, dark = {};
  for (const list of sheets()) {
    for (const r of rules(list)) {
      if (!(r instanceof CSSStyleRule)) continue;
      const sels = r.selectorText.split(",").map((s) => s.trim());
      const isL = sels.some((s) => LIGHT.has(s));
      const isD = sels.some((s) => DARK.has(s));
      if (!isL && !isD) continue;
      for (let i = 0; i < r.style.length; i++) {
        const n = r.style[i];
        if (!n.startsWith("--")) continue;
        (isD ? dark : light)[n] = r.style.getPropertyValue(n).trim();
      }
    }
  }
  return { light, dark: { ...light, ...dark }, darkOnly: dark };
}

/** Resolve every token for one theme by setting them on a probe and reading computed style. */
export function resolveAll(map, prop) {
  const probe = document.createElement("div");
  probe.style.cssText = "position:absolute;visibility:hidden;pointer-events:none";
  for (const [k, v] of Object.entries(map)) probe.style.setProperty(k, v);
  const leaf = document.createElement("i");
  probe.appendChild(leaf);
  document.body.appendChild(probe);
  const out = {};
  for (const k of Object.keys(map)) {
    leaf.style[prop] = "";
    leaf.style[prop] = `var(${k})`;
    out[k] = getComputedStyle(leaf)[prop];
  }
  probe.remove();
  return out;
}

export const isColourValue = (v) => /^(#|rgb|hsl|oklch|oklab|color\(|color-mix|var\(--[a-z0-9-]*(bg|fg|ink|line|color|film|green|link|muted|accent|text)|transparent)/i.test(v) && !/gradient|inset|px\s/i.test(v);

/** Histogram of a declaration across all stylesheets: prop regexp -> value -> count. */
export function histogram(prop, pick = (v) => v) {
  const h = new Map();
  for (const list of sheets()) {
    for (const r of rules(list)) {
      if (!(r instanceof CSSStyleRule)) continue;
      const v = r.style.getPropertyValue(prop);
      if (!v) continue;
      const k = pick(v.trim());
      if (k) h.set(k, (h.get(k) || 0) + 1);
    }
  }
  return h;
}

/** Counts of @media width conditions. */
export function breakpoints() {
  const h = new Map();
  for (const list of sheets()) {
    for (const r of rules(list)) {
      if (!(r instanceof CSSMediaRule)) continue;
      for (const m of r.conditionText.matchAll(/\((min|max)-width:\s*(\d+)px\)/g)) {
        const k = `${m[1]}-width: ${m[2]}px`;
        h.set(k, (h.get(k) || 0) + 1);
      }
    }
  }
  return h;
}

// ---- colour maths -------------------------------------------------------------------------
export function parseRgb(s) {
  const m = s.match(/rgba?\(\s*([\d.]+)[ ,]+([\d.]+)[ ,]+([\d.]+)(?:[ ,/]+([\d.]+%?))?/);
  if (m) return { r: +m[1], g: +m[2], b: +m[3], a: m[4] == null ? 1 : m[4].endsWith("%") ? parseFloat(m[4]) / 100 : +m[4] };
  // browsers keep oklch/color() in computed style; paint it to a canvas to get sRGB
  const c = document.createElement("canvas").getContext("2d", { willReadFrequently: true });
  c.clearRect(0, 0, 1, 1); c.fillStyle = "#000"; c.fillStyle = s; c.fillRect(0, 0, 1, 1);
  const d = c.getImageData(0, 0, 1, 1).data;
  return { r: d[0], g: d[1], b: d[2], a: d[3] / 255 };
}
export const over = (fg, bg) => ({ r: fg.r * fg.a + bg.r * (1 - fg.a), g: fg.g * fg.a + bg.g * (1 - fg.a), b: fg.b * fg.a + bg.b * (1 - fg.a), a: 1 });
export const hex = ({ r, g, b, a }) => "#" + [r, g, b].map((x) => Math.round(x).toString(16).padStart(2, "0")).join("") + (a < 1 ? Math.round(a * 255).toString(16).padStart(2, "0") : "");
const lin = (x) => { x /= 255; return x <= 0.04045 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4; };
export const lum = ({ r, g, b }) => 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
export const contrast = (a, b) => { const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p); return (x + 0.05) / (y + 0.05); };
export function oklch({ r, g, b }) {
  const [R, G, B] = [r, g, b].map(lin);
  const l = Math.cbrt(0.4122214708 * R + 0.5363325363 * G + 0.0514459929 * B);
  const m = Math.cbrt(0.2119034982 * R + 0.6806995451 * G + 0.1073969566 * B);
  const s = Math.cbrt(0.0883024619 * R + 0.2817188376 * G + 0.6299787005 * B);
  const L = 0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s;
  const A = 1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s;
  const Bb = 0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s;
  const C = Math.hypot(A, Bb);
  const H = C < 0.002 ? 0 : ((Math.atan2(Bb, A) * 180) / Math.PI + 360) % 360;
  return `oklch(${(L * 100).toFixed(1)}% ${C.toFixed(3)} ${H.toFixed(0)})`;
}
