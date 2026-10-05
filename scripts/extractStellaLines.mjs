// Extract Stella's spoken lines from the conversation graph for the offline
// Indic-TTS render. One file per node, because the sim is a BRANCHING call: the
// viewer can reach any node in any order, so a single concatenated track (the way
// the case-study narration works) does not apply here.
//
//   node scripts/extractStellaLines.mjs [outPath]
//
// Output: [{ id, text, gloss }]  ->  scripts/.stella-lines.json
// The renderer writes public/stella/<id>.mp3 plus a manifest.

import { pathToFileURL } from "node:url";
import { writeFileSync } from "node:fs";
import path from "node:path";

const root = process.cwd();
const dest =
  process.argv.find((a, i) => i >= 2 && a.endsWith(".json")) ||
  path.join(root, "scripts/.stella-lines.json");

const mod = await import(
  pathToFileURL(path.join(root, "src/figures/stella/stellaGraph.js")).href
);
const { stellaGraph: graph, DEMO_NAME } = mod;

const out = [];
for (const [id, node] of Object.entries(graph.nodes)) {
  if (node.speaker !== "stella") continue;
  // The Gujarati line is what she actually says. Skip any node that carries only
  // an English gloss, rather than voicing a translation as if it were the call.
  const guj = (node.guj || "").trim();
  if (!guj) continue;
  out.push({
    id,
    text: guj.replace(/\{name\}/g, DEMO_NAME),
    gloss: (node.gloss || "").replace(/\{name\}/g, "Mahesh"),
  });
}

writeFileSync(dest, JSON.stringify(out, null, 2));
console.log("wrote", dest, "::", out.length, "Stella lines");
