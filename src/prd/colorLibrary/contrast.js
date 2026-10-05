// Contrast, computed never eyeballed. WCAG 2.x relative luminance and ratio, plus
// the three thresholds the colour system is audited against. Every ratio shown on
// the colour-system page comes through here at render time, so a hex edited in a
// data file re-audits itself; nothing on the page types a ratio by hand.
const expand = (hex) => {
  const c = String(hex).replace("#", "").trim();
  return c.length === 3 ? c.split("").map((ch) => ch + ch).join("") : c;
};

export const luminance = (hex) => {
  const c = expand(hex);
  const [r, g, b] = [0, 2, 4]
    .map((i) => parseInt(c.substr(i, 2), 16) / 255)
    .map((v) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};

export const ratio = (a, b) => {
  const x = luminance(a);
  const y = luminance(b);
  return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05);
};

export const fmt = (r) => `${r.toFixed(2)}:1`;

// WCAG AA: body and UI text 4.5:1, display type 3:1, graphical objects 3:1.
export const THRESHOLDS = { body: 4.5, display: 3, graphic: 3 };
export const passes = (r, kind = "body") => r >= THRESHOLDS[kind];

// A one-line verdict for an audit list: "label: 6.85:1, passes body text".
export const verdict = (label, fg, bg, kind = "body") => {
  const r = ratio(fg, bg);
  const need = THRESHOLDS[kind];
  const name = kind === "body" ? "body text" : kind === "display" ? "display type" : "graphics";
  return `${label}: ${fmt(r)}, ${r >= need ? "passes" : "FAILS"} ${name} (${need}:1)`;
};

// A ramp must be strictly monotonic in luminance (Zepto invariant 2). Returns the
// step keys where it reverses, so an empty array means the ramp is clean.
export const reversals = (steps) => {
  const keys = Object.keys(steps).map(Number).sort((a, b) => a - b);
  const bad = [];
  for (let i = 1; i < keys.length; i++) {
    if (luminance(steps[keys[i]]) >= luminance(steps[keys[i - 1]])) bad.push(`${keys[i - 1]}→${keys[i]}`);
  }
  return bad;
};

// Whichever of white or the given ink reads better on a colour.
export const bestType = (hex, ink = "#111111", white = "#FFFFFF") =>
  ratio(white, hex) >= ratio(ink, hex) ? white : ink;

// Pass level for a pair: "aa" clears body text, "large" clears display type and
// graphics only, "fail" clears nothing.
export const level = (r) => (r >= THRESHOLDS.body ? "aa" : r >= THRESHOLDS.display ? "large" : "fail");

// Every ordered pair of a palette as text-on-background, computed. Returns the rows
// PrdRenderer's matrix renderer draws plus per-background lists of what clears.
export const combinations = (colors) => {
  const cells = colors.map((fg) => colors.map((bg) => (fg.hex === bg.hex ? null : { r: ratio(fg.hex, bg.hex) })));
  const byBackground = colors.map((bg, j) => {
    const aa = [];
    const large = [];
    colors.forEach((fg, i) => {
      const c = cells[i][j];
      if (!c) return;
      const lv = level(c.r);
      if (lv === "aa") aa.push(`${fg.label} ${fmt(c.r)}`);
      else if (lv === "large") large.push(`${fg.label} ${fmt(c.r)}`);
    });
    return { bg, aa, large };
  });
  return { colors, cells, byBackground };
};
