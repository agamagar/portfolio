// THE TASTE LAYER (pure JS, no UI, no three). Reads a face config (the face system's JSON: hair, brows, eyes,
// nose, mouth, cheeks, skin, material) and judges it:
//   score(face)            -> { total 0-100, rules: [{ id, label, score 0-1, weight, notes: [..] }], face }
//   suggest(face)          -> up to 3 small edits that raise the score, each explained
//   constrain(face)        -> the face with out-of-taste extremes clamped
//   randomize(seed, opts)  -> a face scoring above a threshold, repeatable from the seed
//   pairings               -> curated "goes well with" tables
// All numbers live in data.js; RULES.md says why. A "face" may be partial (anything missing is the module default).
import { complete, clone, get, set, NUMERIC, COLORS, HAIR_STYLES, MATERIALS } from "./params.js";
import * as D from "./data.js";
import { hsl, fromHsl, lstar, hueGap, rgb, hex, mix } from "./color.js";

const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
// 0 inside [lo, hi], rising to 1 at `soft` beyond either end
const pen = (v, lo, hi, soft) => (v < lo ? clamp((lo - v) / soft) : v > hi ? clamp((v - hi) / soft) : 0);
const OPS = { ">": (a, b) => a > b, "<": (a, b) => a < b, ">=": (a, b) => a >= b, "<=": (a, b) => a <= b };
const fmt = (n) => (Math.round(n * 100) / 100).toString();

// ---- derived measures ----
export function skinColour(f) {
  if (f.material.kind !== "clay" && D.SKIN_COLOURS[f.material.kind]) return D.SKIN_COLOURS[f.material.kind].skin;
  const A = D.TONE_ANCHORS.map(rgb), x = Math.min(0.9999, f.skin.tone) * (A.length - 1), i = Math.floor(x);
  return hex(mix(A[i], A[i + 1], x - i));
}
const lipColour = (f) => (f.material.kind !== "clay" && D.SKIN_COLOURS[f.material.kind] ? D.SKIN_COLOURS[f.material.kind].mouth : f.mouth.color);
const accents = (f) => [f.hair.clip ? D.COLOUR.accent.clip : null, f.material.kind === "riso" ? D.COLOUR.accent.riso : null].filter(Boolean);
export const hairMass = (f) => clamp(0.35 * f.hair.length + 0.25 * ((f.hair.volume - 0.85) / 0.4) + 0.25 * f.hair.fringe + 0.15 * f.hair.messiness);
const faceWidth = (f) => 0.6 * f.cheeks.jaw + 0.4 * f.cheeks.fullness;

// ---- the rules: each returns { score 0-1, notes } ----
const avg = (items) => { const w = items.reduce((s, i) => s + i.w, 0) || 1; return items.reduce((s, i) => s + i.v * i.w, 0) / w; };

function proportion(f) {
  const P = D.PROPORTION, notes = [], items = [];
  const add = (p, w, bad, good) => { items.push({ v: 1 - p, w }); if (p > 0.25) notes.push(bad); else if (good && p === 0) notes.push(good); };
  { const c = P.eyeSpacing, ideal = c.faceWidthGain * faceWidth(f), d = f.eyes.spacing - ideal, p = pen(d, -c.band, c.band, c.soft);
    add(p, c.weight, d > 0 ? "Eyes sit too wide for this face width" : "Eyes sit too close for this face width", "Eye spacing suits the face width"); }
  { const c = P.eyeMouth, d = f.mouth.width - c.mouthPerEye * f.eyes.size, p = pen(d, -c.band, c.band, c.soft);
    add(p, c.weight, d > 0 ? "The mouth is too wide next to the eyes" : "The mouth is too small next to the eyes", "Eyes and mouth are in scale"); }
  { const c = P.noseMouth, d = f.nose.width - c.mouthPerNose * f.mouth.width, p = pen(d, -c.band, c.band, c.soft);
    add(p, c.weight, d > 0 ? "The nose is heavy next to the mouth" : "The nose is slight next to the mouth"); }
  { const c = P.hairMass, m = hairMass(f), p = pen(m, c.lo, c.hi, c.soft);
    add(p, c.weight, m > c.hi ? "The hair is too heavy for the head" : "The hair is too slight for the head", "Hair mass balances the head"); }
  { const c = P.browClearance, gap = f.brows.height - f.eyes.height, p = clamp((c.minGap - gap) / c.soft);
    add(p, c.weight, "The brows crowd the eyes"); }
  return { score: avg(items), notes };
}

function compatibility(f) {
  const notes = [], hit = [];
  for (const c of D.CLASHES) if (c.when.every(([p, op, v]) => OPS[op](get(f, p), v))) hit.push(c);
  for (const c of hit) notes.push(c.because);
  return { score: 1 - clamp(hit.reduce((s, c) => s + c.penalty, 0)), notes, hits: hit };
}

function silhouette(f) {
  const S = D.SILHOUETTE, notes = [], items = [];
  const hairGap = Math.abs(lstar(f.hair.color) - lstar(skinColour(f)));
  const hp = clamp((S.hairSkinL - hairGap) / S.hairSkinL);
  items.push({ v: 1 - hp, w: S.weights.hair }); if (hp > 0.3) notes.push("Hair and skin are too close in value to read at favicon size");
  const eyeV = clamp(0.5 + 0.5 * f.eyes.size + 0.35 * f.eyes.openness + 0.2 * f.eyes.smileSquint * 0), ep = clamp((S.eyeLegible - eyeV) / S.eyeLegible);
  items.push({ v: 1 - ep, w: S.weights.eyes }); if (ep > 0.3) notes.push("The eyes are too small or narrowed to read at avatar size");
  const mouthV = Math.abs(f.mouth.smile) * 0.6 + Math.max(0, f.mouth.width) * 0.2 + f.mouth.parted * 1.5, mGap = Math.abs(lstar(lipColour(f)) - lstar(skinColour(f)));
  const mp = clamp((S.mouthLegible - mouthV) / S.mouthLegible) * 0.7 + clamp((S.mouthSkinL - mGap) / S.mouthSkinL) * 0.3;
  items.push({ v: 1 - mp, w: S.weights.mouth }); if (mp > 0.5) notes.push("The mouth disappears at small sizes");
  if (!notes.length) notes.push("Reads clearly down to favicon size");
  return { score: avg(items), notes };
}

function colour(f) {
  const C = D.COLOUR, notes = [], items = [];
  const hair = hsl(f.hair.color), satMax = C.hairSatMax[f.material.kind] ?? C.hairSatMax.default;
  { const p = clamp((hair.s * clamp((hair.l - 0.08) * 6) - satMax) / 0.4); items.push({ v: 1 - p, w: 1.2 }); if (p > 0.15) notes.push("The hair colour is too saturated for this material"); }
  { let worst = 0; for (const a of accents(f)) { const ah = hsl(a), gap = hueGap(hair.h, ah.h);
      if (hair.s > 0.25 && ah.s > 0.25 && gap > C.accentNearMiss[0] && gap < C.accentNearMiss[1]) worst = Math.max(worst, 1 - Math.abs(gap - (C.accentNearMiss[0] + C.accentNearMiss[1]) / 2) / 15 * 0.5); }
    items.push({ v: 1 - clamp(worst), w: 1 }); if (worst > 0.3) notes.push("The hair is a near-miss of the accent hue; pick a clear contrast or match"); }
  { const L = lstar(f.eyes.color) / 100, p = clamp((L - C.eyeLMax) / 0.3); items.push({ v: 1 - p, w: 0.8 }); if (p > 0.3) notes.push("The eyes are too light to hold the face"); }
  { const d = lstar(f.brows.color) - lstar(f.hair.color), p = pen(d, C.browHairL[0], C.browHairL[1], 30); items.push({ v: 1 - p, w: 0.8 }); if (p > 0.3) notes.push(d > 0 ? "The brows are lighter than the hair" : "The brows are much darker than the hair"); }
  { const s = hsl(skinColour(f)), l = hsl(lipColour(f)), g = hueGap(s.h, l.h), dl = Math.abs(lstar(lipColour(f)) - lstar(skinColour(f)));
    const p = s.s < 0.08 || l.s < 0.08 ? 0 : clamp((g - C.lipHueMax) / 40); items.push({ v: 1 - p, w: 0.6 }); if (p > 0.3 && dl >= 0) notes.push("The lip colour fights the skin tone"); }
  if (!notes.length) notes.push("Skin, hair, features and accent sit together");
  return { score: avg(items), notes };
}

// a channel per feature in -1..1 (warm positive); big disagreement reads as a mixed signal
function expressionChannels(f) {
  return { mouth: clamp(f.mouth.smile * 1.1 + f.mouth.parted, -1, 1), eyes: clamp(f.eyes.smileSquint * 1.2 + (f.eyes.openness > 0 ? 0.2 * f.eyes.openness : 0.1 * f.eyes.openness) - (f.eyes.openness < -0.4 && f.eyes.smileSquint < 0.15 ? 0.3 : 0), -1, 1),
    brows: clamp(f.brows.height * 0.5 - Math.abs(f.brows.angle) * 0.9 + (f.brows.angle < 0 ? 0.25 : 0) + f.brows.arch * 0.2, -1, 1) };
}
function expression(f) {
  const E = D.EXPRESSION, ch = expressionChannels(f), w = E.weights, notes = [];
  const wsum = w.mouth + w.eyes + w.brows, mean = (ch.mouth * w.mouth + ch.eyes * w.eyes + ch.brows * w.brows) / wsum;
  const spread = Math.sqrt((w.mouth * (ch.mouth - mean) ** 2 + w.eyes * (ch.eyes - mean) ** 2 + w.brows * (ch.brows - mean) ** 2) / wsum);
  const p = clamp((spread - E.disagree * 0.5) / E.soft);
  if (p > 0.25) { const off = Object.entries(ch).sort((a, b) => Math.abs(b[1] - mean) - Math.abs(a[1] - mean))[0][0]; notes.push(`The ${off} disagree with the rest of the expression`); }
  else notes.push(mean > 0.2 ? "Brow, eyes and mouth agree on a warm expression" : mean < -0.2 ? "Brow, eyes and mouth agree on a serious expression" : "A calm, coherent expression");
  return { score: 1 - p, notes };
}

function material(f) {
  const rules = D.MATERIAL_FIT[f.material.kind] || [], notes = [], items = [];
  for (const [path, lo, hi, w, why] of rules) { const v = get(f, path), p = pen(v, lo, hi, 0.5); items.push({ v: 1 - p, w }); if (p > 0.2) notes.push(`${f.material.kind}: ${why}`); }
  if (!notes.length) notes.push(rules.length ? "Suits the material" : "Soft clay takes any face");
  return { score: items.length ? avg(items) : 1, notes };
}

const NUM_PATHS = Object.keys(NUMERIC);
// mean normalised distance between two completed faces (numbers by range, hair colour by hue/lightness, selects by mismatch)
export function distance(a, b) {
  let s = 0, n = 0;
  for (const p of NUM_PATHS) { if (p === "hair.seed" || p.startsWith("material.") || p === "skin.blush") continue; const r = NUMERIC[p].hi - NUMERIC[p].lo; s += ((get(a, p) - get(b, p)) / r) ** 2; n++; }
  for (const p of ["hair.style", "material.kind"]) { s += get(a, p) === get(b, p) ? 0 : D.DISTINCT.categorical ** 2; n++; }
  s += (Math.min(1, Math.abs(lstar(a.hair.color) - lstar(b.hair.color)) / 60) * 0.5) ** 2; n++;
  return Math.sqrt(s / n);
}
let REFS = null;
const refs = () => (REFS ||= Object.entries(D.REFERENCES).map(([id, cfg]) => [id, complete(cfg)]));
export function nearestPreset(face) {
  const f = complete(face);
  let best = null;
  const key = JSON.stringify(f);
  for (const [id, r] of refs()) { if (JSON.stringify(r) === key) continue; const d = distance(f, r); if (!best || d < best.d) best = { id, d }; } // an exact preset is a preset, not a copy
  return best;
}
function distinct(f) {
  const n = nearestPreset(f), { near, far } = D.DISTINCT;
  if (!n) return { score: 1, notes: ["Nothing to compare"] };
  const s = clamp((n.d - near) / (far - near));
  return { score: s, notes: [s < 0.5 ? `Near-duplicate of the ${n.id} preset (${fmt(n.d)} apart)` : s < 0.9 ? `Fairly close to the ${n.id} preset` : `Distinct from the presets (closest: ${n.id})`] };
}

export const RULES = [
  ["proportion", "Proportion harmony", proportion], ["compatibility", "Feature compatibility", compatibility], ["silhouette", "Small-size readability", silhouette],
  ["colour", "Colour harmony", colour], ["expression", "Expression coherence", expression], ["material", "Material fit", material], ["distinct", "Distinctiveness", distinct],
];

// weighted geometric mean (sharpened): one badly failed rule drags the whole score, a few small blemishes barely do
const wsum = Object.values(D.WEIGHTS).reduce((a, b) => a + b, 0);
const aggregate = (rules) => Math.round(100 * Math.exp(D.AGGREGATE.sharpness * rules.reduce((a, r) => a + (r.weight / wsum) * Math.log(Math.max(0.03, r.score)), 0)));
export function score(face) {
  const f = complete(face), rules = RULES.map(([id, label, fn]) => { const r = fn(f); return { id, label, score: clamp(r.score), weight: D.WEIGHTS[id], notes: r.notes }; });
  return { total: aggregate(rules), rules, face: f };
}
export const total = (face) => score(face).total;

// ---- constrain: clamp every param to its taste range, tame the colours ----
export function constrain(face) {
  const f = complete(face);
  for (const [p, s] of Object.entries(NUMERIC)) set(f, p, clamp(get(f, p), s.lo, s.hi));
  if (!HAIR_STYLES[f.hair.style]) f.hair.style = "shoulder-messy";
  if (!MATERIALS.includes(f.material.kind)) f.material.kind = "clay";
  const satMax = D.COLOUR.hairSatMax[f.material.kind] ?? D.COLOUR.hairSatMax.default;
  for (const p of Object.keys(COLORS)) { if (!/^#[0-9a-f]{6}$/i.test(get(f, p))) set(f, p, COLORS[p]); }
  { const h = hsl(f.hair.color); if (h.s > satMax) f.hair.color = fromHsl(h.h, satMax, h.l); }
  { const h = hsl(f.eyes.color); if (lstar(f.eyes.color) / 100 > D.COLOUR.eyeLMax) f.eyes.color = fromHsl(h.h, h.s, 0.1); }
  { const d = lstar(f.brows.color) - lstar(f.hair.color); if (d > D.COLOUR.browHairL[1] || d < D.COLOUR.browHairL[0]) { const h = hsl(f.hair.color); f.brows.color = fromHsl(h.h, h.s, clamp(h.l * 0.8, 0.05, 0.5)); } }
  // never leave a hard clash standing: apply the first fix of each
  for (let i = 0; i < 3; i++) for (const c of D.CLASHES) if (c.penalty >= 0.5 && c.when.every(([p, op, v]) => OPS[op](get(f, p), v))) for (const x of c.fix) set(f, x.path, x.to);
  return f;
}

// ---- suggest: the smallest single edits that raise the score ----
export function applyEdit(face, edit) { const f = complete(face); set(f, edit.path, edit.to); return f; }
const STEPS = [0.08, 0.16, 0.3];
function candidates(f) {
  const out = [];
  for (const [p, s] of Object.entries(NUMERIC)) {
    if (p === "hair.seed" || p.startsWith("material.") || p.startsWith("skin.")) continue;
    const r = s.max - s.min, v = get(f, p);
    for (const st of STEPS) for (const sg of [-1, 1]) {
      const to = clamp(v + sg * st * r, s.lo, s.hi);
      // a bipolar slider keeps its side (a smile stays a smile): crossing zero changes the face's meaning, not its polish
      if (s.min < 0 && Math.abs(v) > 0.08 && Math.sign(to) !== Math.sign(v)) continue;
      if (Math.abs(to - v) > 1e-6) out.push({ path: p, to: Math.round(to * 100) / 100 });
    }
  }
  for (const c of D.CLASHES) if (c.when.every(([p, op, v]) => OPS[op](get(f, p), v))) for (const x of c.fix) out.push({ path: x.path, to: x.to });
  for (const st of Object.keys(HAIR_STYLES)) if (st !== f.hair.style) out.push({ path: "hair.style", to: st, big: true });
  for (const col of D.PAIRINGS.hairBySkinBand[band(f)]) out.push({ path: "hair.color", to: col, big: true });
  out.push({ path: "hair.clip", to: !f.hair.clip, big: true });
  return out;
}
export const band = (f) => (f.skin.tone < 0.34 ? "light" : f.skin.tone < 0.67 ? "mid" : "deep");
const LABELS = { "hair.style": "hair style", "hair.color": "hair colour", "hair.clip": "the clip", "hair.length": "hair length", "hair.fringe": "the fringe", "hair.messiness": "hair messiness", "hair.volume": "hair volume", "hair.sweep": "the fringe sweep",
  "eyes.openness": "eye openness", "eyes.smileSquint": "the smile squint", "eyes.size": "eye size", "eyes.spacing": "eye spacing", "eyes.height": "eye height", "brows.height": "brow height", "brows.angle": "brow angle", "brows.arch": "brow arch",
  "nose.width": "nose width", "nose.tip": "nose tip", "nose.length": "nose length", "mouth.width": "mouth width", "mouth.smile": "the smile", "mouth.parted": "lip part", "cheeks.fullness": "cheek fullness", "cheeks.jaw": "jaw width", "cheeks.chin": "chin" };
export const labelOf = (p) => LABELS[p] || p;

const GOOD = /^(Eye spacing suits|Eyes and mouth are in scale|Hair mass balances|Reads clearly|Skin, hair, features|Brow, eyes and mouth agree|A calm|Suits the material|Soft clay takes|Distinct from|Nothing)/;
function explainEdit(was, now, c, from, gain) {
  const problem = was.notes.find((n) => !GOOD.test(n)), what = labelOf(c.path);
  const act = typeof from === "number" ? (c.to > from ? `Raising ${what}` : `Lowering ${what}`) : c.path === "hair.clip" ? (c.to ? "Adding the clip" : "Dropping the clip") : `Changing ${what}`;
  return problem ? `${problem}. ${act} fixes it (+${gain}).` : `${act} improves ${now.label.toLowerCase()} (+${gain}).`;
}
export function suggest(face, { max = 3, minGain = 3 } = {}) {
  const f = complete(face), base = score(f), byPath = new Map();
  for (const c of candidates(f)) {
    const g = score(applyEdit(f, c)), gain = g.total - base.total;
    // fractional gain from rule scores so equal-integer ties still order sensibly
    // distinctiveness only counts as a reason to edit when the face is a near-duplicate; otherwise nudging a slider
    // away from a preset is noise (and costs the other rules)
    const dup = base.rules.find((r) => r.id === "distinct").score < 0.5;
    const wsum2 = (x) => x.rules.reduce((s, r) => s + (r.id === "distinct" && !dup ? 0 : r.score * r.weight), 0);
    const exact = wsum2(g) - wsum2(base);
    if (exact * 100 < minGain * 0.5 || gain < 0) continue;
    const size = c.big ? 0.35 : Math.abs(c.to - get(f, c.path)) / (NUMERIC[c.path].max - NUMERIC[c.path].min);
    const cur = byPath.get(c.path);
    // per param: keep the smallest edit that gets within 85% of that param's best gain
    if (!cur || exact > cur.best) byPath.set(c.path, { ...(cur || {}), best: exact, list: [...(cur?.list || []), { c, exact, size, g }] });
    else cur.list.push({ c, exact, size, g });
  }
  const picks = [];
  for (const [, v] of byPath) {
    const ok = v.list.filter((x) => x.exact >= v.best * 0.85).sort((a, b) => a.size - b.size)[0];
    picks.push(ok);
  }
  picks.sort((a, b) => (b.exact - b.size * 0.04) - (a.exact - a.size * 0.04));
  const out = [];
  for (const x of picks) {
    if (out.length >= max) break;
    const rule = x.g.rules.map((r, i) => ({ r, d: (r.id === "distinct" && base.rules[i].score >= 0.5 ? 0 : r.score - base.rules[i].score) * r.weight })).sort((a, b) => b.d - a.d)[0];
    const from = get(f, x.c.path), gain = x.g.total - base.total;
    if (gain < 1 && out.length) continue;
    const dir = typeof from === "number" ? (x.c.to > from ? "Raise" : "Lower") : "Change";
    const was = base.rules.find((r) => r.id === rule.r.id);
    out.push({ path: x.c.path, from, to: x.c.to, gain: Math.max(1, gain), rule: rule.r.id,
      label: typeof from === "number" ? `${dir} ${labelOf(x.c.path)}` : x.c.path === "hair.clip" ? (x.c.to ? "Add the clip" : "Drop the clip") : `Change ${labelOf(x.c.path)}`,
      explain: explainEdit(was, rule.r, x.c, from, Math.max(1, gain)),
      apply: (face2) => applyEdit(face2, x.c) });
  }
  return out;
}

// ---- randomize: a seeded face that scores above a threshold ----
export function mulberry32(a) { return () => { a |= 0; a = (a + 0x6d2b79f5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
// per style: spread (0..1 of the taste range), per-param centre overrides, the materials it draws from
export const STYLES = {
  balanced: { spread: 0.8, centre: {}, materials: ["clay", "clay", "claySun", "felt", "cel", "print"] },
  cute: { spread: 0.45, centre: { "eyes.size": 0.35, "cheeks.fullness": 0.45, "cheeks.chin": 0.35, "mouth.smile": 0.4, "brows.height": 0.1 }, materials: ["clay", "felt", "hose", "claySun"] },
  bold: { spread: 0.8, centre: { "brows.arch": 0.25, "cheeks.jaw": 0.2, "eyes.size": 0.15 }, materials: ["print", "cel", "riso", "stone", "pixel"] },
  calm: { spread: 0.35, centre: { "mouth.smile": 0.15, "eyes.openness": -0.15, "brows.angle": -0.05 }, materials: ["clay", "stone", "claySun"] },
  character: { spread: 0.9, centre: { "hair.messiness": 0.5 }, materials: MATERIALS },
};
const pick = (r, a) => a[Math.floor(r() * a.length) % a.length];
function sample(r, style) {
  const S = STYLES[style] || STYLES.balanced, f = complete({});
  f.material.kind = pick(r, S.materials); f.hair.style = pick(r, D.PAIRINGS.hairByMaterial[f.material.kind]);
  f.skin.tone = Math.round(r() * 100) / 100; f.skin.blush = Math.round((0.3 + r() * 0.6) * 100) / 100;
  const sty = HAIR_STYLES[f.hair.style];
  for (const [p, s] of Object.entries(NUMERIC)) {
    if (["skin.tone", "skin.blush", "hair.seed", "material.grain", "material.warmth"].includes(p)) continue;
    const key = p.split(".")[1], isHair = p.startsWith("hair."), mid = S.centre[p] ?? (isHair ? sty[key] : s.def), half = (s.hi - s.lo) / 2 * S.spread;
    const u = (r() + r() + r()) / 3 * 2 - 1; // bell-shaped around the centre
    set(f, p, Math.round(clamp(mid + u * half, s.lo, s.hi) * 100) / 100);
  }
  f.hair.seed = 1 + Math.floor(r() * 40); f.hair.clip = r() < 0.5;
  const colours = D.PAIRINGS.hairBySkinBand[band(f)], hc = pick(r, colours);
  f.hair.color = hc; const h = hsl(hc); f.brows.color = fromHsl(h.h, h.s, clamp(h.l * 0.85, 0.05, 0.4));
  return f;
}
export function randomize(seed = 1, { style = "balanced", threshold = 78, tries = 40 } = {}) {
  const r = mulberry32(typeof seed === "number" ? seed : [...String(seed)].reduce((a, c) => (a * 31 + c.charCodeAt(0)) | 0, 7));
  let best = null;
  for (let i = 0; i < tries; i++) {
    const f = constrain(sample(r, style)), s = score(f);
    if (!best || s.total > best.s.total) best = { f, s };
    if (s.total >= threshold) return f;
  }
  // none made it: nudge the best with its own suggestions
  let f = best.f;
  for (let i = 0; i < 4 && score(f).total < threshold; i++) { const sg = suggest(f, { max: 1 })[0]; if (!sg) break; f = constrain(sg.apply(f)); }
  return f;
}

// ---- pairings: curated "goes well with" ----
export const pairings = {
  table: D.PAIRINGS,
  hairColours: (face) => D.PAIRINGS.hairBySkinBand[band(complete(face))],
  hairStyles: (kind) => D.PAIRINGS.hairByMaterial[kind] || D.PAIRINGS.hairByMaterial.clay,
  materialsFor: (emote) => D.PAIRINGS.emoteMaterials[emote] || [],
  forHairStyle: (style) => D.PAIRINGS.byHairStyle[style] || {},
};
export { complete, clone, NUMERIC, HAIR_STYLES, MATERIALS };
// brow colour that sits with a hair colour (a little darker, same hue)
export const browFor = (hairColor) => { const h = hsl(hairColor); return fromHsl(h.h, h.s, clamp(h.l * 0.85, 0.05, 0.4)); };
