// node tools/face-taste-check.mjs : scores the presets, the hand-tuned skin faces and a few deliberately bad faces,
// checks suggest/constrain/randomize behave, and that the taste data has not drifted from the face system.
import fs from "node:fs";
import { score, suggest, constrain, randomize, applyEdit, nearestPreset } from "../src/faceTaste/index.js";
import { REFERENCES, SKIN_COLOURS, TONE_ANCHORS } from "../src/faceTaste/data.js";
import { NUMERIC, HAIR_STYLES, MATERIALS } from "../src/faceTaste/params.js";
import { SKINS } from "../src/figures/faces/faceSkins.js";

let fail = 0;
const ok = (c, m) => { if (!c) { fail++; console.log("  FAIL", m); } };
const show = (name, f) => { const s = score(f); console.log(String(s.total).padStart(3), name.padEnd(22), s.rules.map((r) => `${r.id.slice(0, 4)}:${Math.round(r.score * 100)}`).join(" ")); return s; };

console.log("== positive examples (presets + hand-tuned skins)");
const pos = {};
for (const [id, cfg] of Object.entries(REFERENCES)) pos[id] = show(id, cfg).total;
for (const [id, v] of Object.entries(pos)) if (id !== "neutral") ok(v >= 85, `${id} should score >= 85, got ${v}`);

{ const M = Object.entries(REFERENCES).map(([id]) => id); console.log("  nearest preset distances:", M.map((id) => { const n = nearestPreset(REFERENCES[id]); return `${id}->${n.id} ${n.d.toFixed(2)}`; }).join(", ")); }
console.log("== deliberately bad faces");
const bad = {
  "angry squint": { brows: { angle: 0.8, height: -0.5 }, eyes: { openness: -0.7, size: -0.3 }, mouth: { smile: -0.2 } },
  "clone of agam-clay": { ...REFERENCES["agam-clay"], hair: { ...REFERENCES["agam-clay"].hair, seed: 9 } },
  "eyes too wide, tiny mouth": { eyes: { spacing: 0.9, size: -0.6 }, mouth: { width: -0.8 }, cheeks: { jaw: -0.7 } },
  "hair = skin, bald-ish": { hair: { color: "#e8bf9a" }, skin: { tone: 0.2 }, eyes: { size: -0.7, openness: -0.9 } },
  "grin + stern + frown": { brows: { angle: 0.9 }, mouth: { smile: 0.8 }, eyes: { smileSquint: 0.8 } },
  "neon hair on felt": { material: { kind: "felt" }, hair: { color: "#00ff44", style: "long-straight" }, cheeks: { jaw: 0.8, fullness: -0.7 } },
  "stone, messy, open": { material: { kind: "stone" }, hair: { messiness: 1 }, mouth: { parted: 0.35 }, cheeks: { jaw: -0.8 } },
};
for (const [n, f] of Object.entries(bad)) { const s = show(n, f); ok(s.total <= 70, `${n} should be flagged (<= 70), got ${s.total}`); }
const worst = Math.max(...Object.keys(bad).map((n) => score(bad[n]).total)), best = Math.min(...Object.entries(pos).filter(([k]) => k !== "neutral").map(([, v]) => v));
ok(best > worst + 15, `presets (${best}) should clear the bad faces (${worst}) with room`);

console.log("== suggest on the bad faces");
for (const n of ["angry squint", "eyes too wide, tiny mouth", "neon hair on felt"]) {
  const base = score(bad[n]).total, sg = suggest(bad[n]);
  console.log(" ", n, base, "->", sg.map((s) => `${s.label} (+${s.gain})`).join("; "));
  ok(sg.length >= 1 && sg.length <= 3, `${n}: 1-3 suggestions`);
  for (const s of sg) { const after = score(s.apply(bad[n])).total; ok(after > base, `${n}: "${s.label}" raises the score (${base} -> ${after})`); ok(s.explain.length > 10, "has an explanation"); }
}

console.log("== constrain");
const c = constrain({ eyes: { size: 1, spacing: 1, openness: -1 }, mouth: { width: -1, parted: 0.4 }, hair: { color: "#00ff00" }, cheeks: { jaw: 1, chin: -1 } });
for (const [p, s] of Object.entries(NUMERIC)) { const [a, b] = p.split("."); ok(c[a][b] >= s.lo - 1e-9 && c[a][b] <= s.hi + 1e-9, `constrain keeps ${p} in range`); }
console.log("  constrained extreme:", score(c).total, "hair", c.hair.color);

console.log("== randomize (threshold 78): 40 seeds x styles");
for (const style of ["balanced", "cute", "bold", "calm", "character"]) {
  const t = [], seen = new Set(); let minS = 100;
  for (let i = 1; i <= 40; i++) { const f = randomize(i, { style }), s = score(f).total; t.push(s); minS = Math.min(minS, s); seen.add(JSON.stringify(f)); }
  ok(JSON.stringify(randomize(5, { style })) === JSON.stringify(randomize(5, { style })), "same seed, same face");
  console.log(`  ${style.padEnd(10)} min ${minS} mean ${(t.reduce((a, b) => a + b) / t.length).toFixed(1)} distinct ${seen.size}/40`);
  ok(minS >= 70, `${style}: randomize stays >= 70 (got ${minS})`); ok(seen.size >= 36, `${style}: faces differ`);
}
const nn = nearestPreset(randomize(3)); console.log("  nearest preset to seed 3:", nn.id, nn.d.toFixed(2));

console.log("== data drift vs the face system");
const preset = JSON.parse(fs.readFileSync(new URL("../src/figures/faces/features/presets/agam-clay.json", import.meta.url)));
delete preset._note; ok(JSON.stringify(preset.eyes) === JSON.stringify({ openness: -0.5, smileSquint: 0.35, size: 0.05, spacing: 0 }), "agam-clay copy matches presets/agam-clay.json");
for (const [k, v] of Object.entries(SKIN_COLOURS)) { const s = SKINS.find((x) => x.id === k); ok(s && s.parts.Skin.base.toLowerCase() === v.skin && s.parts.Mouth.base.toLowerCase() === v.mouth, `skin colours of ${k} match faceSkins.js`); }
const matIds = SKINS.filter((s) => s.mode !== "fit" && s.mode !== "noir").map((s) => s.id);
ok(MATERIALS.filter((m) => m !== "clay").every((m) => matIds.includes(m)), "materials exist as skins");
const src = (f) => fs.readFileSync(new URL(`../src/figures/faces/features/modules/${f}.js`, import.meta.url), "utf8");
for (const [p, s] of Object.entries(NUMERIC)) { const [m, k] = p.split("."); if (m === "hair") continue; const re = new RegExp(`${k}: \\{ type: "number"[^}]*min: (-?[\\d.]+), max: (-?[\\d.]+)`); const mm = src(m).match(re); ok(mm && +mm[1] === s.min && +mm[2] === s.max, `${p} range matches module`); }
ok(TONE_ANCHORS.every((a) => src("skin").includes(a)), "tone anchors match skin.js");
for (const [id, d] of Object.entries(HAIR_STYLES)) { const t = fs.readFileSync(new URL(`../src/figures/faces/features/hairStyles/${id}.js`, import.meta.url), "utf8"); ok(+t.match(/length: ([\d.]+)/)[1] === d.length && +t.match(/fringe: ([\d.]+)/)[1] === d.fringe, `hair style ${id} defaults match`); }
void applyEdit;
console.log(fail ? `\n${fail} FAILED` : "\nface-taste checks OK"); process.exit(fail ? 1 : 0);
