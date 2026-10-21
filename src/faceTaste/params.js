// The face config's shape, as the taste layer needs it (pure data, no imports): every tunable param with its
// slider range, its default, and the narrower TASTE range constrain() clamps to. Mirrors
// src/figures/faces/features/modules/*.js and hairStyles/*.js. tools/face-taste-check.mjs fails if they drift.
export const HAIR_STYLES = {
  "shoulder-messy": { length: 0.92, fringe: 0.85, messiness: 0.6, volume: 1.0, sweep: 0.3 },
  bob: { length: 0.55, fringe: 0.9, messiness: 0.2, volume: 1.08, sweep: 0.0 },
  crop: { length: 0.0, fringe: 0.35, messiness: 0.35, volume: 0.96, sweep: 0.2 },
  "long-straight": { length: 1.0, fringe: 0.5, messiness: 0.05, volume: 1.0, sweep: -0.2 },
};
// [min, max, default, tasteLo, tasteHi]
const N = (min, max, def, lo = min, hi = max) => ({ min, max, def, lo, hi });
export const NUMERIC = {
  "skin.tone": N(0, 1, 0.4), "skin.blush": N(0, 1, 0.5),
  "material.grain": N(0, 1, 0.6), "material.warmth": N(0, 1, 0.6),
  "hair.length": N(0, 1, null), "hair.fringe": N(0, 1, null), "hair.messiness": N(0, 1, null),
  "hair.volume": N(0.85, 1.25, null, 0.9, 1.2), "hair.sweep": N(-1, 1, null), "hair.seed": N(1, 40, 7),
  "eyes.openness": N(-1, 1, 0, -0.8, 0.7), "eyes.smileSquint": N(0, 1, 0, 0, 0.7), "eyes.size": N(-1, 1, 0, -0.5, 0.7),
  "eyes.spacing": N(-1, 1, 0, -0.5, 0.6), "eyes.height": N(-1, 1, 0, -0.5, 0.5),
  "brows.height": N(-1, 1, 0, -0.6, 0.6), "brows.angle": N(-1, 1, 0, -0.7, 0.7), "brows.arch": N(-1, 1, 0, -0.6, 0.7),
  "nose.width": N(-1, 1, 0, -0.6, 0.6), "nose.tip": N(-1, 1, 0, -0.6, 0.6), "nose.length": N(-1, 1, 0, -0.5, 0.6),
  "mouth.width": N(-1, 1, 0, -0.6, 0.7), "mouth.smile": N(-1, 1, 0, -0.5, 0.8), "mouth.parted": N(0, 0.4, 0, 0, 0.25),
  "cheeks.fullness": N(-1, 1, 0, -0.6, 0.8), "cheeks.jaw": N(-1, 1, 0, -0.7, 0.7), "cheeks.chin": N(-1, 1, 0, -0.6, 0.7),
};
export const COLORS = { "hair.color": "#553626", "eyes.color": "#1b110d", "brows.color": "#2f1d14", "mouth.color": "#b9704f" };
export const SELECTS = { "hair.style": "shoulder-messy", "material.kind": "clay" };
export const BOOLS = { "hair.clip": true };
export const MATERIALS = ["clay", "hose", "cel", "claySun", "pixel", "felt", "stone", "riso", "print"];

const get = (o, path) => path.split(".").reduce((a, k) => (a == null ? a : a[k]), o);
const set = (o, path, v) => { const [a, b] = path.split("."); (o[a] ||= {})[b] = v; };
export { get, set };

// a config with every missing value filled (hair numbers from the style), as a fresh plain object
export function complete(cfg = {}) {
  const out = {};
  for (const [p, d] of Object.entries({ ...SELECTS, ...COLORS, ...BOOLS })) set(out, p, get(cfg, p) ?? d);
  const style = HAIR_STYLES[get(out, "hair.style")] || HAIR_STYLES["shoulder-messy"];
  for (const [p, s] of Object.entries(NUMERIC)) {
    const v = get(cfg, p);
    set(out, p, v ?? (s.def ?? style[p.split(".")[1]]));
  }
  return out;
}
export const clone = (f) => JSON.parse(JSON.stringify(f));
