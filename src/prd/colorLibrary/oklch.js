// OKLab / OKLCH for deriving ramps from a primary. Björn Ottosson's matrices.
// Used ONLY where a generated ramp is not in the repo yet; a ramp derived here is
// labelled derived on the page, and asserted monotonic with contrast.reversals().
const clamp01 = (v) => Math.min(1, Math.max(0, v));
const toLin = (c) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
const toSrgb = (c) => (c <= 0.0031308 ? 12.92 * c : 1.055 * c ** (1 / 2.4) - 0.055);

export const hexToRgb = (hex) => {
  const c = hex.replace("#", "");
  const h = c.length === 3 ? c.split("").map((x) => x + x).join("") : c;
  return [0, 2, 4].map((i) => parseInt(h.substr(i, 2), 16) / 255);
};
export const rgbToHex = ([r, g, b]) =>
  "#" + [r, g, b].map((v) => Math.round(clamp01(v) * 255).toString(16).padStart(2, "0")).join("").toUpperCase();

export const rgbToOklab = ([r, g, b]) => {
  const [lr, lg, lb] = [r, g, b].map(toLin);
  const l = Math.cbrt(0.4122214708 * lr + 0.5363325363 * lg + 0.0514459929 * lb);
  const m = Math.cbrt(0.2119034982 * lr + 0.6806995451 * lg + 0.1073969566 * lb);
  const s = Math.cbrt(0.0883024619 * lr + 0.2817188376 * lg + 0.6299787005 * lb);
  return [
    0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s,
    1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s,
    0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s,
  ];
};

export const oklabToRgb = ([L, a, b]) => {
  const l = (L + 0.3963377774 * a + 0.2158037573 * b) ** 3;
  const m = (L - 0.1055613458 * a - 0.0638541728 * b) ** 3;
  const s = (L - 0.0894841775 * a - 1.291485548 * b) ** 3;
  return [
    4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
    -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
    -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s,
  ].map(toSrgb);
};

export const hexToOklch = (hex) => {
  const [L, a, b] = rgbToOklab(hexToRgb(hex));
  return { L, C: Math.hypot(a, b), h: (Math.atan2(b, a) * 180) / Math.PI };
};

const inGamut = (rgb) => rgb.every((v) => v >= -0.0005 && v <= 1.0005);

// OKLCH → hex, pulling chroma in until the colour fits sRGB (hue and lightness kept).
export const oklchToHex = ({ L, C, h }) => {
  const rad = (h * Math.PI) / 180;
  let lo = 0;
  let hi = C;
  let rgb = oklabToRgb([L, C * Math.cos(rad), C * Math.sin(rad)]);
  if (inGamut(rgb)) return rgbToHex(rgb);
  for (let i = 0; i < 24; i++) {
    const mid = (lo + hi) / 2;
    rgb = oklabToRgb([L, mid * Math.cos(rad), mid * Math.sin(rad)]);
    if (inGamut(rgb)) lo = mid; else hi = mid;
  }
  return rgbToHex(oklabToRgb([L, lo * Math.cos(rad), lo * Math.sin(rad)]));
};

const lerp = (a, b, t) => a + (b - a) * t;

// A 50-900 ramp around a primary held at 500: the light half interpolates from a
// near-white of the same hue down to the primary, the dark half from the primary
// down to a deep of the same hue. Lightness falls at every step, so luminance does.
export const deriveRamp = (primary) => {
  const p = hexToOklch(primary);
  const light = { L: 0.975, C: Math.min(p.C, 0.03) };
  const dark = { L: 0.24, C: Math.min(p.C, 0.09) };
  const up = { 50: 0.06, 100: 0.16, 200: 0.34, 300: 0.55, 400: 0.78 };
  const down = { 600: 0.28, 700: 0.52, 800: 0.76, 900: 1 };
  const steps = {};
  Object.entries(up).forEach(([k, t]) => {
    steps[k] = oklchToHex({ L: lerp(light.L, p.L, t), C: lerp(light.C, p.C, t), h: p.h });
  });
  steps[500] = primary.toUpperCase();
  Object.entries(down).forEach(([k, t]) => {
    steps[k] = oklchToHex({ L: lerp(p.L, dark.L, t), C: lerp(p.C, dark.C, t), h: p.h });
  });
  return steps;
};
