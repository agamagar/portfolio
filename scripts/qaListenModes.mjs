// QA harness for every Listen mode: validates timing-map integrity, the player's
// sentence-sync algorithm, content rules, and (for audio narrations) that the
// timing lines up 1:1 with the sentence split. Run: node scripts/qaListenModes.mjs
import { pathToFileURL } from "node:url";
import { readFileSync, existsSync } from "node:fs";
import path from "node:path";

const root = process.cwd();
// slug -> narration module export. Case-study one (scheduledCase) is speech-only.
const NARR = [
  { slug: "away", file: "src/prd/awayNarration.js", export: "awayNarration", audio: true },
  { slug: "dassh", file: "src/prd/dasshNarration.js", export: "dasshNarration", audio: true },
  { slug: "jarvis", file: "src/prd/jarvisNarration.js", export: "jarvisNarration", audio: true },
  { slug: "zepiris", file: "src/prd/zepirisNarration.js", export: "zepirisNarration", audio: true },
  { slug: "scheduled", file: "src/prd/scheduledNarration.js", export: "scheduledNarration", audio: true },
  { slug: "scheduled-case", file: "src/prd/scheduledNarration.js", export: "scheduledCaseNarration", audio: false },
];

// EXACT copies of the player's logic.
function splitSentences(text) {
  const parts = text.match(/[^.!?]+[.!?]+["')\]]*\s*|\S[^.!?]*$/g) || [text];
  return parts.map((s) => s.trim()).filter(Boolean);
}
function tokenize(sentence) {
  const t = []; const re = /\S+/g; let m;
  while ((m = re.exec(sentence))) t.push({ word: m[0] });
  return t;
}
function findSentence(segs, t) { // player's onAudioTime finder
  let idx = -1;
  for (let i = 0; i < segs.length; i++) {
    if (t < segs[i].start) break;
    if (t < segs[i].end) { idx = i; break; }
    idx = i;
  }
  return idx;
}
function wordAtFraction(tokens, frac) {
  if (!tokens.length) return -1;
  const total = tokens.reduce((s, tk) => s + tk.word.length + 1, 0);
  const target = Math.max(0, Math.min(1, frac)) * total;
  let acc = 0;
  for (let i = 0; i < tokens.length; i++) { acc += tokens[i].word.length + 1; if (target <= acc) return i; }
  return tokens.length - 1;
}

let fail = 0, warn = 0;
const bad = (slug, msg) => { console.log(`  ✗ [${slug}] ${msg}`); fail++; };
const wrn = (slug, msg) => { console.log(`  ! [${slug}] ${msg}`); warn++; };

for (const n of NARR) {
  const mod = await import(pathToFileURL(path.join(root, n.file)).href);
  const narr = mod[n.export];
  if (!narr) { bad(n.slug, `export ${n.export} missing`); continue; }
  const sentences = (narr.paragraphs || []).flatMap(splitSentences);
  console.log(`\n${n.slug}  (${narr.paragraphs.length} paras, ${sentences.length} sentences, ${n.audio ? "AUDIO" : "speech"})`);

  // --- content rules (global: no em/en dash or tilde) ---
  const joined = (narr.paragraphs || []).join(" ");
  const dashHits = joined.match(/[—–~]/g);
  if (dashHits) bad(n.slug, `forbidden chars: ${[...new Set(dashHits)].join(" ")}`);
  const abbr = joined.match(/\b(e\.g\.|i\.e\.|vs\.|etc\.)/gi);
  if (abbr) bad(n.slug, `sentence-breaking abbreviations: ${[...new Set(abbr)].join(" ")}`);
  if (n.audio) {
    const digits = joined.match(/\d/g);
    if (digits) wrn(n.slug, `${digits.length} bare digit(s) in an AUDIO script (TTS may misread) `);
  }
  // every sentence must have tokens + split cleanly
  sentences.forEach((s, i) => { if (!tokenize(s).length) bad(n.slug, `sentence ${i} has no word tokens`); });

  if (!n.audio) {
    if (narr.audio) bad(n.slug, "speech narration should NOT have an audio field");
    else console.log(`  ✓ speech-mode narration, ${sentences.length} sentences split clean`);
    continue;
  }

  // --- audio narration: timing map must exist + align ---
  if (narr.audio !== `/narration/${n.slug}`) bad(n.slug, `audio field is ${JSON.stringify(narr.audio)}, expected "/narration/${n.slug}"`);
  const jf = path.join(root, "public/narration", `${n.slug}.json`);
  if (!existsSync(jf)) { bad(n.slug, "timing json missing"); continue; }
  const timing = JSON.parse(readFileSync(jf, "utf8"));
  const segs = timing.sentences;
  if (segs.length !== sentences.length) { bad(n.slug, `timing count ${segs.length} != sentence count ${sentences.length} (audio mode WON'T activate)`); continue; }

  // --- monotonic, non-overlapping, in-bounds ---
  let ok = true;
  for (let i = 0; i < segs.length; i++) {
    const s = segs[i];
    if (!(s.start >= 0 && s.end > s.start)) { bad(n.slug, `sentence ${i} bad interval ${JSON.stringify(s)}`); ok = false; break; }
    if (s.end > timing.duration + 0.05) { bad(n.slug, `sentence ${i} end ${s.end} > duration ${timing.duration}`); ok = false; break; }
    if (i > 0 && s.start < segs[i - 1].end - 0.001) { bad(n.slug, `sentence ${i} overlaps previous`); ok = false; break; }
  }
  if (!ok) continue;

  // --- sync algorithm: dense grid must map every instant to a valid, monotonic idx ---
  let prev = -1, gridOk = true;
  for (let t = 0; t < timing.duration; t += 0.25) {
    const idx = findSentence(segs, t);
    if (idx < -1 || idx >= segs.length) { bad(n.slug, `t=${t.toFixed(2)} -> invalid idx ${idx}`); gridOk = false; break; }
    if (idx < prev) { bad(n.slug, `t=${t.toFixed(2)} idx ${idx} went backwards from ${prev}`); gridOk = false; break; }
    prev = Math.max(prev, idx);
  }
  // midpoint of each sentence must resolve to that exact sentence
  for (let i = 0; i < segs.length; i++) {
    const mid = (segs[i].start + segs[i].end) / 2;
    if (findSentence(segs, mid) !== i) { bad(n.slug, `midpoint of sentence ${i} resolves to ${findSentence(segs, mid)}`); gridOk = false; break; }
  }
  // word interpolation returns valid indices at sentence extremes
  const tk = tokenize(sentences[0]);
  if (wordAtFraction(tk, 0) !== 0 || wordAtFraction(tk, 0.999) !== tk.length - 1) wrn(n.slug, "word interpolation edge case");

  const gaps = segs.slice(1).map((s, i) => s.start - segs[i].end);
  const avgGap = gaps.reduce((a, b) => a + b, 0) / (gaps.length || 1);
  if (gridOk) console.log(`  ✓ timing sound: ${segs.length} sentences, dur ${timing.duration}s, voice ${timing.voice}, avg gap ${avgGap.toFixed(2)}s, sync grid + midpoints OK`);
}

console.log(`\n${fail === 0 ? "✓ PASS" : "✗ FAIL"} — ${fail} error(s), ${warn} warning(s)`);
process.exit(fail === 0 ? 0 : 1);
