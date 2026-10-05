// Extract narration sentences for the offline TTS render.
// Splits each narration's paragraphs into sentences with the EXACT same logic as
// NarrationPlayer.splitSentences, so the rendered timing map lines up 1:1 with the
// sentences the player highlights. Writes a JSON the Python renderer consumes.
//
//   node scripts/extractNarration.mjs [slug] [outPath]
//   (no slug = all PRDs)
//
// Output: [{ slug, title, sentences: [...] }, ...]

import { pathToFileURL } from "node:url";
import { writeFileSync } from "node:fs";
import path from "node:path";

// export is REQUIRED and selected by name: scheduledNarration.js ships two
// narrations (PRD + case study), so Object.values().find() would grab the wrong
// one (alphabetically-first). Always target the exact export.
const PRDS = [
  { slug: "away", file: "src/prd/awayNarration.js", export: "awayNarration" },
  { slug: "dassh", file: "src/prd/dasshNarration.js", export: "dasshNarration" },
  { slug: "jarvis", file: "src/prd/jarvisNarration.js", export: "jarvisNarration" },
  { slug: "zepiris", file: "src/prd/zepirisNarration.js", export: "zepirisNarration" },
  { slug: "scheduled", file: "src/prd/scheduledNarration.js", export: "scheduledNarration" },
  // case-study Listen (separate, longer script). Render on request.
  { slug: "scheduled-case", file: "src/prd/scheduledNarration.js", export: "scheduledCaseNarration" },
  { slug: "dassh-v2", file: "src/prd/dasshCaseNarration.js", export: "dasshCaseNarration" },
];

// MUST match NarrationPlayer.splitSentences exactly.
function splitSentences(text) {
  const parts = text.match(/[^.!?]+[.!?]+["')\]]*\s*|\S[^.!?]*$/g) || [text];
  return parts.map((s) => s.trim()).filter(Boolean);
}

const root = process.cwd();
const only = process.argv[2] && !process.argv[2].endsWith(".json") ? process.argv[2] : null;
const dest = process.argv.find((a, i) => i >= 2 && a.endsWith(".json")) || path.join(root, "scripts/.narration-input.json");

const out = [];
for (const prd of PRDS) {
  if (only && prd.slug !== only) continue;
  const mod = await import(pathToFileURL(path.join(root, prd.file)).href);
  const narr = mod[prd.export];
  if (!narr || !Array.isArray(narr.paragraphs)) { console.error("no export", prd.export, "in", prd.file); continue; }
  const sentences = narr.paragraphs.flatMap(splitSentences);
  out.push({ slug: prd.slug, title: narr.title, sentences });
}

writeFileSync(dest, JSON.stringify(out, null, 2));
console.log("wrote", dest, "::", out.map((o) => `${o.slug}=${o.sentences.length}`).join("  "));
