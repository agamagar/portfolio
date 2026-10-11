// Headless layout gate: node src/figures/board/lab/check.mjs
// Builds every preset and fails if text leaves the board or two text blocks overlap.
import { buildScene } from "../core/scene.js";
import { PRESETS } from "../presets.js";
import { SD_BOARDS } from "../boards.scheduledDelivery.js";

let bad = 0;
const rectsOverlap = (a, b) => {
  const w = Math.min(a.x + a.w, b.x + b.w) - Math.max(a.x, b.x), h = Math.min(a.y + a.h, b.y + b.h) - Math.max(a.y, b.y);
  return w > 0 && h > 0 ? w * h : 0;
};
// the boards placed in the Scheduled Delivery case study are checked like presets
const ALL = { ...PRESETS, ...Object.fromEntries(Object.entries(SD_BOARDS).map(([k, v]) => ["sd:" + k, { spec: () => v.board, input: "" }])) };
for (const [name, p] of Object.entries(ALL)) {
  let scene;
  try { scene = buildScene(p.spec(p.input)); } catch (e) { console.log(`FAIL ${name}: threw ${e.message}`); bad++; continue; }
  const texts = scene.items.filter((i) => i.kind === "text" && i.glyphs.length);
  const issues = [];
  for (const t of texts) {
    const b = t.ink;
    if (b.x < 4 || b.y < 4 || b.x + b.w > scene.w - 4 || b.y + b.h > scene.h - 4) issues.push(`off-board: "${t.text.slice(0, 30)}" at ${Math.round(b.x)},${Math.round(b.y)} ${Math.round(b.w)}x${Math.round(b.h)}`);
  }
  for (let i = 0; i < texts.length; i++) for (let j = i + 1; j < texts.length; j++) {
    const a = texts[i].ink, b = texts[j].ink;
    const ov = rectsOverlap(a, b);
    const small = Math.min(a.w * a.h, b.w * b.h);
    if (ov > 0.12 * small) issues.push(`overlap: "${texts[i].text.slice(0, 22)}" x "${texts[j].text.slice(0, 22)}" (${Math.round((100 * ov) / small)}%)`);
  }
  const marks = scene.items.reduce((n, i) => n + (i.strokes?.length ?? 0), 0);
  console.log(`${issues.length ? "FAIL" : "ok  "} ${name.padEnd(9)} ${String(texts.length).padStart(3)} texts, ${String(marks).padStart(3)} marks, ${scene.duration.toFixed(1)}s`);
  issues.forEach((s) => console.log("      " + s));
  bad += issues.length;
}
process.exit(bad ? 1 : 0);
