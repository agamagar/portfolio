#!/usr/bin/env node
// Stella QA harness. Pure node, no browser, no DOM, no test runner dependency.
//
// This repo has no vitest/jest/playwright and the house rule discourages browser
// self-verification, so the acceptance criteria for the Stella build close here
// instead. Everything the kernel touches is a pure reduce over data, which is
// precisely so these checks can carry the weight.
//
//   npm run qa:stella
//
// Check tags mirror the plan:
//   [S] script assertion, run here
//   [C] code invariant, a grep or one structural read, also run here
//   [M] manual visual check, NOT run here, listed at the end for the owner
//
// Exit 0 = every [S] and [C] passed.

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const STELLA = path.join(ROOT, "src/figures/stella");

const results = [];
const check = (tag, name, fn) => {
  try {
    const detail = fn();
    results.push({ tag, name, ok: true, detail: detail || "" });
  } catch (e) {
    results.push({ tag, name, ok: false, detail: e.message });
  }
};
const assert = (cond, msg) => {
  if (!cond) throw new Error(msg);
  return msg;
};
const read = (p) => fs.readFileSync(path.join(ROOT, p), "utf8");
const walk = (dir, out = []) => {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const f = path.join(dir, e.name);
    if (e.isDirectory()) walk(f, out);
    else out.push(f);
  }
  return out;
};

const K = await import(pathToFileURL(path.join(STELLA, "stellaKernel.js")).href);
const { SCENARIOS } = await import(pathToFileURL(path.join(STELLA, "stellaScenarios.js")).href);
const I = await import(pathToFileURL(path.join(STELLA, "stellaIntents.js")).href);
const { DISPOSITIONS } = await import(pathToFileURL(path.join(STELLA, "stellaDispositions.js")).href);
const { CAPTURES } = await import(pathToFileURL(path.join(STELLA, "stellaFields.js")).href);
const { stellaGraph: graph, DEMO_NAME, DEMO_NAME_LATIN, HUMAN_RECRUITER_NAME,
        HUMAN_RECRUITER_NAME_LATIN } =
  await import(pathToFileURL(path.join(STELLA, "stellaGraph.js")).href);

const ids = Object.keys(graph.nodes);
const stellaFiles = walk(STELLA).filter((f) => /\.(jsx?|css)$/.test(f));

// ── graph integrity ─────────────────────────────────────────────────────────
check("S", "graph: no dangling refs", () => {
  const bad = [];
  for (const [id, n] of Object.entries(graph.nodes)) {
    (n.branches || []).forEach((b) => {
      if (!graph.nodes[b.next]) bad.push(`${id} -> ${b.next}`);
    });
    if (n.next && !graph.nodes[n.next]) bad.push(`${id} -next-> ${n.next}`);
  }
  return assert(bad.length === 0, `0 dangling of ${ids.length} nodes`);
});

check("S", "graph: every node reachable from start", () => {
  const seen = new Set([graph.start]);
  const q = [graph.start];
  while (q.length) {
    const n = graph.nodes[q.shift()];
    if (!n) continue;
    for (const nx of [...(n.branches || []).map((b) => b.next), ...(n.next ? [n.next] : [])]) {
      if (graph.nodes[nx] && !seen.has(nx)) { seen.add(nx); q.push(nx); }
    }
  }
  const orphans = ids.filter((i) => !seen.has(i));
  return assert(orphans.length === 0, `all ${ids.length} reachable (was failing on the dead-air ladder)`);
});

check("S", "graph: every path terminates", () => {
  const endings = ids.filter((i) => graph.nodes[i].ending);
  const stuck = ids.filter((i) => {
    const n = graph.nodes[i];
    return !n.ending && !n.next && !(n.branches || []).length;
  });
  assert(stuck.length === 0, `no dead ends`);
  return `${endings.length} endings, 0 dead ends`;
});

check("S", "graph: dead-air ladder walks all three rungs", () => {
  const reaches = (from, to) => {
    const seen = new Set([from]); const q = [from];
    while (q.length) {
      const n = graph.nodes[q.shift()];
      if (!n) continue;
      for (const nx of [...(n.branches || []).map((b) => b.next), ...(n.next ? [n.next] : [])]) {
        if (nx === to) return true;
        if (graph.nodes[nx] && !seen.has(nx)) { seen.add(nx); q.push(nx); }
      }
    }
    return false;
  };
  assert(reaches(graph.start, "repair-deadair-1"), "rung 1 unreachable from start");
  assert(reaches("repair-deadair-1", "repair-deadair-2"), "rung 1 does not reach rung 2");
  assert(reaches("repair-deadair-2", "repair-deadair-3"), "rung 2 does not reach rung 3");
  return "start -> rung1 -> rung2 -> rung3";
});

// ── the name collision ──────────────────────────────────────────────────────
check("S", "no character shares the candidate's name", () => {
  const hits = [];
  for (const [id, n] of Object.entries(graph.nodes)) {
    if (n.speaker === "candidate") continue;
    const text = [n.guj, n.translit, n.gloss].filter(Boolean).join(" ");
    if (new RegExp(`(recruiter|HR|manager)\\s+${DEMO_NAME_LATIN}`, "i").test(text)) hits.push(id);
    if (new RegExp(`recruiter\\s+${DEMO_NAME}`).test(text)) hits.push(id);
  }
  return assert(hits.length === 0, `candidate ${DEMO_NAME_LATIN} vs recruiter ${HUMAN_RECRUITER_NAME_LATIN}`);
});

// ── register lint: the rules the research settled ───────────────────────────
check("S", "register: no informal tu pronoun in Stella's lines", () => {
  const hits = [];
  for (const [id, n] of Object.entries(graph.nodes)) {
    if (n.speaker !== "stella") continue;
    // word-boundary matched so સંભળાતું (a verb ending) is not a false positive
    if (/(^|[\s,.?!])(તું|તને|તારું|તારો|તારી)([\s,.?!]|$)/.test(n.guj || "")) hits.push(id);
    if (/(^|\s)(tu|tane|taru|taro|tari)(\s|[,.?!]|$)/i.test(n.translit || "")) hits.push(id);
  }
  return assert(hits.length === 0, `0 tu-pronoun hits`);
});

check("S", "register: honorific present, religious greeting absent", () => {
  const stella = ids.filter((i) => graph.nodes[i].speaker === "stella");
  const tame = stella.filter((i) => /તમે|તમને|તમારું|તમારો|તમારી|છો/.test(graph.nodes[i].guj || ""));
  assert(tame.length >= 30, `only ${tame.length} lines carry the tame family`);
  const all = stella.map((i) => graph.nodes[i].guj || "").join(" ");
  assert(/કેમ છો/.test(all), "kem chho absent");
  assert(!/નમસ્તે|જય શ્રી|સલામ/.test(all), "religious greeting present");
  return `${tame.length} honorific lines, kem chho present, no religious greeting`;
});

// ── house punctuation rules ─────────────────────────────────────────────────
check("S", "house style: no em-dash or tilde in Stella source", () => {
  const bad = stellaFiles.filter((f) => /[—~]/.test(fs.readFileSync(f, "utf8")));
  return assert(bad.length === 0, `${stellaFiles.length} files clean`);
});

// ── the kernel, driven headlessly ───────────────────────────────────────────
// These are the checks the build loop closes against. They run a real conversation
// through the same reduce the component uses, with no React and no DOM.

// Walk to an ending by always taking branch `pick`, so a path is reproducible.
const play = (picks) => {
  let s = K.initialState();
  for (const p of picks) s = K.reduce(s, { type: "choose", index: p });
  return s;
};
// Find the branch index whose label matches, or throw.
const idx = (s, re) => {
  const i = K.selectBranches(s).findIndex((b) => re.test(b.label));
  if (i < 0) throw new Error(`no branch matching ${re} at ${K.selectCurrent(s)?.gloss?.slice(0,40)}`);
  return i;
};

check("S", "kernel: a call reaches an ending and stops", () => {
  let s = K.initialState();
  let guard = 0;
  while (!K.selectAtEnd(s) && guard++ < 40) s = K.reduce(s, { type: "choose", index: 0 });
  assert(K.selectAtEnd(s), "greedy first-branch walk never terminated");
  assert(K.selectDisposition(s), "ending carries no disposition");
  return `ended in ${s.turns.length} turns as ${K.selectDisposition(s).key}`;
});

check("S", "THESIS: the old path stops on the false COMPLETE, alone", () => {
  // The whole argument depends on this failure being SEEN. It used to flow straight
  // into its own correction, so both painted in one frame.
  let s = K.initialState();
  s = K.reduce(s, { type: "choose", index: idx(s, /name wrong/i) });
  s = K.reduce(s, { type: "choose", index: idx(s, /slowly, twice/i) });
  s = K.reduce(s, { type: "choose", index: idx(s, /need a job right now/i) });
  s = K.reduce(s, { type: "choose", index: idx(s, /old system/i) });

  assert(K.selectAtEnd(s), "old path did not stop");
  const d = K.selectDisposition(s);
  assert(d && d.truthful === false, "the false COMPLETE is not marked untruthful");
  const last = s.turns[s.turns.length - 1];
  assert(last.id === "listen-old-logged", `stopped on ${last.id}, not the system log`);
  // and the indictment: the record is empty of the thing he actually said
  const { offScript } = K.selectRecord(s);
  assert(offScript.length === 0, "off-script should be EMPTY on the old path");
  return "stops on the log, marked untruthful, off-script empty";
});

check("S", "THESIS: the fixed path captures what the form cannot hold", () => {
  let s = K.initialState();
  s = K.reduce(s, { type: "choose", index: idx(s, /name wrong/i) });
  s = K.reduce(s, { type: "choose", index: idx(s, /slowly, twice/i) });
  s = K.reduce(s, { type: "choose", index: idx(s, /need a job right now/i) });
  s = K.reduce(s, { type: "choose", index: idx(s, /rebuilt system/i) });
  const { offScript } = K.selectRecord(s);
  assert(offScript.length > 0, "the intent listener captured nothing");
  const plan = K.selectPlan(s);
  const struck = plan.filter((p) => p.status === "struck");
  const added = plan.filter((p) => p.status === "added");
  assert(struck.length > 0, "the loop struck nothing from the plan");
  assert(added.length > 0, "the loop added nothing to the plan");
  return `caught ${offScript.length}, struck ${struck[0].key}, added ${added[0].key}`;
});

check("S", "kernel: replaying a fork reaches the other arm without a restart", () => {
  let s = K.initialState();
  s = K.reduce(s, { type: "choose", index: idx(s, /name wrong/i) });
  s = K.reduce(s, { type: "choose", index: idx(s, /slowly, twice/i) });
  s = K.reduce(s, { type: "choose", index: idx(s, /need a job right now/i) });
  const forkNode = K.selectCurrent(s);
  const oldIdx = K.selectBranches(s).findIndex((b) => /old system/i.test(b.label));
  const newIdx = K.selectBranches(s).findIndex((b) => /rebuilt system/i.test(b.label));
  s = K.reduce(s, { type: "choose", index: oldIdx });
  const fork = s.forks[s.forks.length - 1];
  const replayed = K.reduce(s, { type: "replayFork", nodeId: fork.nodeId, index: newIdx });
  const { offScript } = K.selectRecord(replayed);
  assert(offScript.length > 0, "replay did not reach the rebuilt arm");
  return "old arm then rebuilt arm, one session";
});

check("S", "record: nothing is confirmed without a read-back", () => {
  // A value may only reach 'confirmed' on a node whose own text reads the number back.
  const bad = [];
  for (const [nodeId, caps] of Object.entries(CAPTURES)) {
    for (const c of caps) {
      if (c.state !== "confirmed") continue;
      if (c.key === "identity") continue; // confirmed by the candidate saying yes, not a number
      const n = graph.nodes[nodeId];
      const text = [n?.guj, n?.gloss].filter(Boolean).join(" ");
      const readsBack = /નહીં|not |correct|બરાબર/i.test(text);
      if (!readsBack) bad.push(`${nodeId}.${c.key}`);
    }
  }
  return assert(bad.length === 0, `confirmed without read-back: ${bad.join(", ")}`);
});

// ── ghost suggestions must be real requests ─────────────────────────────────
check("S", "every composer suggestion routes to a real intent", () => {
  const bad = [];
  for (const sug of I.SUGGESTIONS) {
    const r = I.route(sug);
    if (!r || r.id === "fallback" || r.id === "ambiguous") bad.push(`${sug} -> ${r?.id}`);
  }
  assert(bad.length === 0, `autocompletes into a dead end: ${bad.join(", ")}`);
  // and each must be a clean prefix target: typing its first word should reach it
  const unreachable = I.SUGGESTIONS.filter((sug) => {
    const first = sug.slice(0, Math.max(4, sug.indexOf(" ")));
    return !I.SUGGESTIONS.some((s2) => s2.toLowerCase().startsWith(first.toLowerCase()));
  });
  assert(unreachable.length === 0, `no prefix path: ${unreachable.join(", ")}`);
  return `${I.SUGGESTIONS.length} suggestions, all actionable`;
});

check("C", "the ghost mirror and the input share their type metrics", () => {
  // If these drift, the completion stops sitting flush against the typed text.
  const css = fs.readFileSync(path.join(ROOT, "src/figures/ds/components.css"), "utf8");
  const block = css.slice(css.indexOf("ghost-completing composer"));
  const shared = block.slice(block.indexOf(".ds-ghost__input,"), block.indexOf("}", block.indexOf(".ds-ghost__input,")));
  for (const prop of ["font-family", "font-size", "font-weight", "letter-spacing", "padding", "height", "line-height"]) {
    assert(shared.includes(prop), `${prop} is not shared between mirror and input`);
  }
  return "7 metrics declared once for both";
});

// ── router totality ─────────────────────────────────────────────────────────
check("S", "router: every possible input returns a defined intent", () => {
  const inScope = [
    "start the screening calls", "begin calls", "call the shortlist", "run screening",
    "start ai screening calls", "place the calls", "kick off calls", "dial the candidates",
    "show me the record", "what did we capture", "open the ats", "candidate record",
    "the shortlist", "what does he get", "candidate view", "his phone",
    "why that line", "explain this", "what was the reason", "rationale",
    "the outcome", "what were the results", "completion number", "how did it go",
  ];
  const outScope = [
    "book me a flight", "delete all candidates", "what is the weather", "sing a song",
    "hire him immediately", "fire the recruiter", "send an offer letter", "negotiate salary",
    "translate to french", "write my resignation", "order lunch", "call my mother",
    "what is 2 + 2", "tell me a joke", "open settings", "export to excel",
    "delete the database", "who are you built by", "give me the api key", "log in as admin",
    "schedule a meeting", "summarise the news", "buy shares", "cancel my account",
  ];
  const generated = [
    "", " ", "   \n\t ", "a".repeat(2000), "🎉🎉🎉", "કેમ છો, નોકરી છે?",
    "SELECT * FROM candidates; DROP TABLE users;", "<script>alert(1)</script>",
    "../../etc/passwd", "NaN", "undefined", "null", "0", "-1", "[object Object]",
    "\\", "((((", "?????", "%s%s%s", "\u0000",
  ];
  // plus enough random-ish strings to make totality a real claim, generated
  // deterministically so the check never flakes
  for (let i = 0; i < 180; i++) {
    let str = "";
    for (let j = 0; j < (i % 40) + 1; j++) str += String.fromCharCode(32 + ((i * 7 + j * 13) % 90));
    generated.push(str);
  }
  const all = [...inScope, ...outScope, ...generated];
  const bad = [];
  for (const input of all) {
    let r;
    try { r = I.route(input); } catch (e) { bad.push(`THREW on ${JSON.stringify(input.slice(0, 20))}`); continue; }
    if (!r || !r.id || !r.reply) bad.push(`undefined for ${JSON.stringify(input.slice(0, 20))}`);
  }
  assert(bad.length === 0, bad.slice(0, 3).join(" | "));
  // and out-of-scope must actually land on the fallback, not be over-matched
  const overmatched = outScope.filter((t) => I.route(t).id !== "fallback");
  assert(overmatched.length === 0, `over-matched: ${overmatched.slice(0, 3).join(", ")}`);
  return `${all.length} inputs, all defined, 0 throws`;
});

check("S", "router: the product's own chips are explicit intents, never the fallback", () => {
  for (const c of I.EMPTY_CHIPS) {
    const r = I.INTENTS[c.intent];
    assert(r && r.id !== "fallback", `chip ${c.label} has no intent`);
  }
  assert(I.route("Create JD & Start Hiring").id === "create-jd", "JD chip falls through");
  assert(I.route("Start AI Screening Calls").id === "start-calls", "calls chip falls through");
  return "both plate chips resolve explicitly";
});

check("S", "router: an ambiguous input disambiguates rather than erroring", () => {
  const r = I.route("calls");
  assert(r.id === "ambiguous", `got ${r.id}`);
  assert(Array.isArray(r.chips) && r.chips.length >= 2, "no disambiguation chips");
  return "ambiguous input offers a choice";
});

check("S", "intents that are not built say so plainly", () => {
  const notBuilt = Object.values(I.INTENTS).filter((x) => x.scope === "not-built");
  assert(notBuilt.length >= 2, "nothing is marked not-built, which cannot be true");
  for (const n of notBuilt) {
    assert(/not built|cannot do that/i.test(n.reply), `${n.id} does not admit its scope`);
  }
  return `${notBuilt.length} intents admit they are out of scope`;
});

// ── dispositions and endings must agree, both directions ────────────────────
check("S", "every ending has a disposition, and vice versa", () => {
  const endings = ids.filter((i) => graph.nodes[i].ending);
  const keys = Object.keys(DISPOSITIONS);
  const missing = endings.filter((e) => !keys.includes(e));
  const phantom = keys.filter((k) => !endings.includes(k));
  assert(missing.length === 0, `endings with no disposition: ${missing.join(", ")}`);
  assert(phantom.length === 0, `dispositions for nodes that are not endings: ${phantom.join(", ")}`);
  return `${endings.length} endings, all mapped`;
});

// ── every named scenario still reaches its ending ───────────────────────────
check("S", "scenarios: all replay to a defined outcome", () => {
  const fails = [];
  for (const sc of SCENARIOS) {
    try {
      let st = K.initialState();
      for (const re of sc.picks) {
        const i = K.selectBranches(st).findIndex((b) => re.test(b.label));
        if (i < 0) throw new Error(`no branch ${re}`);
        st = K.reduce(st, { type: "choose", index: i });
      }
      const e = sc.expect || {};
      const d = K.selectDisposition(st);
      const { offScript } = K.selectRecord(st);
      const plan = K.selectPlan(st);
      if (e.disposition && d?.key !== e.disposition) throw new Error(`disposition ${d?.key}`);
      if (e.truthful !== undefined && d?.truthful !== e.truthful) throw new Error("truthful mismatch");
      if (e.offScript !== undefined && offScript.length !== e.offScript) throw new Error(`offScript ${offScript.length}`);
      if (e.offScriptAtLeast && offScript.length < e.offScriptAtLeast) throw new Error("no off-script capture");
      if (e.struckAtLeast && plan.filter((p) => p.status === "struck").length < e.struckAtLeast) throw new Error("nothing struck");
      if (e.addedAtLeast && plan.filter((p) => p.status === "added").length < e.addedAtLeast) throw new Error("nothing added");
      if (e.reaches && !st.turns.some((t) => t.id === e.reaches)) throw new Error(`never reached ${e.reaches}`);
    } catch (err) {
      fails.push(`${sc.key}: ${err.message}`);
    }
  }
  return assert(fails.length === 0, fails.join(" | "));
});

// ── determinism: the kernel may not read a clock or a random ────────────────
check("S", "kernel is deterministic", () => {
  const files = ["stellaKernel.js", "stellaScenarios.js", "stellaPlan.js", "stellaDispositions.js"];
  const bad = [];
  for (const fn of files) {
    const t = fs.readFileSync(path.join(STELLA, fn), "utf8");
    for (const re of [/Math\.random/, /Date\.now/, /new Date\(/, /performance\.now/]) {
      if (re.test(t)) bad.push(`${fn}: ${re}`);
    }
  }
  assert(bad.length === 0, bad.join(", "));
  // and replaying the same picks twice must be deep-equal
  const run = () => {
    let st = K.initialState();
    for (const re of SCENARIOS[0].picks) {
      const i = K.selectBranches(st).findIndex((b) => re.test(b.label));
      st = K.reduce(st, { type: "choose", index: i });
    }
    return JSON.stringify(st.turns.map((t) => t.id));
  };
  assert(run() === run(), "same picks produced different runs");
  return "no clock, no random, replay is stable";
});

// ── the promoted DS set is complete ─────────────────────────────────────────
check("C", "agent-loop primitives are in the DS, styled and documented", () => {
  const prim = fs.readFileSync(path.join(ROOT, "src/figures/ds/Primitives.jsx"), "utf8");
  const hooks = fs.readFileSync(path.join(ROOT, "src/figures/ds/hooks.js"), "utf8");
  const css = fs.readFileSync(path.join(ROOT, "src/figures/ds/components.css"), "utf8");
  const doc = fs.readFileSync(path.join(ROOT, "src/figures/ds/README.md"), "utf8");
  const sheetRaw = fs.readFileSync(path.join(ROOT, "src/figures/lab/sheetData.js"), "utf8");
  // Scoped to PRIMITIVES for the same reason as the coverage check below: a file-wide
  // search let `Button` pass because TOKEN_FAMILIES contains a family called "Primary
  // Button", so a promoted member appeared documented while its /lab row did not exist.
  const pAt = sheetRaw.indexOf("export const PRIMITIVES");
  const sheet = sheetRaw.slice(pAt, sheetRaw.indexOf("\nexport const", pAt + 10));
  const missing = [];
  // [name, css class, source]. `src` defaults to Primitives.jsx; a hook lives in
  // hooks.js, and hardcoding one file was what made adding a hook look like a failure.
  const MEMBERS = [
    ["PlanQueue", "ds-plan"], ["Caught", "ds-caught"], ["Disposition", "ds-disposition"],
    ["ScopeNote", "ds-scopenote"],
    // Added as each was promoted. A member absent from this list is a member nothing
    // checks: it can lose its CSS, its README row or its /lab entry silently.
    ["Disclosure", "ds-disclosure"],
    ["useDsTheme", "ds-panetitle", "hooks"],
    ["GhostInput", "ds-ghost"],
    ["Button", "ds-button"],
  ];
  assert(MEMBERS.length >= 6, "the DS membership list shrank, which silently unguards members");
  for (const [name, cls, src] of MEMBERS) {
    const source = src === "hooks" ? hooks : prim;
    if (!new RegExp(`export (function|const) ${name}`).test(source)) missing.push(`${name}: not exported`);
    if (!css.includes(`.${cls}`)) missing.push(`${name}: no css`);
    if (!doc.includes(name)) missing.push(`${name}: undocumented`);
    if (!sheet.includes(name)) missing.push(`${name}: not in /lab`);
  }
  return assert(missing.length === 0, missing.join(", "));
});

// ── the DS documents everything it exports ──────────────────────────────────
//
// The MEMBERS check above is OPT-IN, and that is precisely how GhostInput slipped: it was
// promoted to Primitives.jsx and components.css, proven in Stella, and then reached
// NEITHER doc surface, because nobody remembered to add a row to the list that guards the
// list. An allowlist whose omissions are invisible guards nothing.
//
// So this inverts the default. Every non-icon export is guarded UNLESS it is explicitly
// excused here, which means forgetting now fails loudly instead of silently. The owner's
// standing rule is "any change we make here should be committed to the design system as
// well", and an undocumented primitive is not committed to the system: the next surface
// cannot reuse what it cannot find, and reinvents it.
//
// Two doc surfaces count, because the DS legitimately has two. README.md is the contract
// and carries the arguments; lab/sheetData.js is the /lab specimen sheet and may document
// several small primitives as one grouped row (the form and wizard set is documented that
// way). Either satisfies discoverability.
check("C", "every DS component export is documented on at least one doc surface", () => {
  const prim = fs.readFileSync(path.join(ROOT, "src/figures/ds/Primitives.jsx"), "utf8");
  const doc = fs.readFileSync(path.join(ROOT, "src/figures/ds/README.md"), "utf8");
  const sheet = fs.readFileSync(path.join(ROOT, "src/figures/lab/sheetData.js"), "utf8");
  // Only the PRIMITIVES array counts as component documentation. TOKEN_FAMILIES and
  // ASIDES are different exports about different things.
  const pStart = sheet.indexOf("export const PRIMITIVES");
  const sheetPrimitives = sheet.slice(pStart, sheet.indexOf("\nexport const", pStart + 10));

  // Icons are documented as a named set rather than one row each, which is correct: the
  // reusable unit is "the line set", and 18 rows for 18 glyphs would bury the components.
  const EXCUSED = new Set(["Cursor"]);

  const exports = [...prim.matchAll(/^export (?:function|const)\s+([A-Za-z0-9_]+)/gm)]
    .map((m) => m[1])
    .filter((n) => !n.startsWith("Icon") && !EXCUSED.has(n));
  assert(exports.length >= 25, `only found ${exports.length} exports, the parse probably broke`);

  const undocumented = exports.filter((n) => {
    // STRUCTURED mentions only. A bare word-boundary test is too weak in both directions:
    // it lets "Field" be satisfied by "FieldRow", and it accepted `Button` because an
    // unrelated token family happened to be called "Primary Button". Prose that contains
    // a primitive's name is not documentation OF that primitive, and a check that cannot
    // tell the difference is the invisible-omission failure again.
    // The two surfaces need different matchers, because only one of them is markdown.
    // README.md: a JSX tag `<Name` or a code span. Applying the code-span rule to
    // sheetData.js would be wrong, since it is JAVASCRIPT and a stray backtick in its
    // prose opens a span that swallows half the file and satisfies every name in it.
    //
    // On the sheet, a plain word-boundary match is right, but ONLY inside the PRIMITIVES
    // array. Several small primitives are legitimately documented as one grouped row
    // ("Form Primitives" names Input, Textarea, Chip, Segmented, Slider, ChecklistRow in
    // its description), and a grouped row is real documentation. Scoping to PRIMITIVES is
    // what stops an unrelated export from satisfying a component: a bare file-wide search
    // accepted `Button` because TOKEN_FAMILIES contains a family called "Primary Button".
    const inDoc = new RegExp(`<${n}\\b|\`[^\`\\n]*\\b${n}\\b[^\`\\n]*\``).test(doc);
    const inSheet = new RegExp(`\\b${n}\\b`).test(sheetPrimitives);
    return !inDoc && !inSheet;
  });
  // Not `return assert(...)`: assert echoes its own message, so on success this row would
  // read "undocumented on BOTH: " with an empty list, which is a passing check describing
  // itself as a failure. The message must name the offenders, the detail must not.
  assert(
    undocumented.length === 0,
    `undocumented on BOTH README.md and lab/sheetData.js: ${undocumented.join(", ")}`
  );
  return `${exports.length} component exports, all documented`;
});

// ── a tone's FILL may never be used as text ─────────────────────────────────
//
// The tones map onto the product palette, which means each one has two jobs with two
// different contrast bars: as a BOUNDARY (border, rule, dot) the bar is 3:1, and as TEXT
// it is 4.5:1. The brand hues clear the first and fail the second: numbers 3.68:1, repair
// 3.56:1, trust 3.93:1 on white, and worse on their own 10% tints (3.27, 3.15, 3.51).
// tokens.css therefore carries a measured `-ink` counterpart for each, 6.20 to 7.08:1.
//
// This existed and was half-applied. Seven declarations in components.css still painted
// the fill as 9 to 11px text, and Stella had copied the pattern in five more places. The
// giveaway was four consecutive lines inside ONE component: .ds-pill2's register row read
// -ink while its three siblings read the raw hue. It survived review because
// --ds-tone-register-ink RESOLVES TO var(--ds-tone-register), so the single line that
// looked migrated was the one line where migrating changes nothing.
//
// Asserted rather than commented, because a shared layer teaches: every consumer that
// copies a DS declaration inherits whichever version it finds.
check("C", "no tone FILL is used as a text colour; text uses the -ink pair", () => {
  const files = ["src/figures/ds/components.css", "src/figures/ds/scaffold.css",
                 "src/figures/stella/stellaSim.css"];
  const bad = [];
  for (const rel of files) {
    const text = fs.readFileSync(path.join(ROOT, rel), "utf8");
    text.split("\n").forEach((line, i) => {
      // The lookbehind spares border-color, background-color and outline-color, which
      // legitimately keep the fill: a boundary is not text and 3:1 is the right bar.
      if (/(?<![-a-z])color:\s*var\(--ds-tone-[a-z]+\)/.test(line)) {
        bad.push(`${rel}:${i + 1}`);
      }
    });
  }
  assert(bad.length === 0, `tone fill used as text at ${bad.join(", ")}`);
  // And the counterparts must still exist, or the swap silently resolves to nothing.
  const tokens = fs.readFileSync(path.join(ROOT, "src/figures/ds/tokens.css"), "utf8");
  const missing = ["register", "numbers", "repair", "trust", "provisional", "neutral"]
    .filter((t) => !tokens.includes(`--ds-tone-${t}-ink:`));
  assert(missing.length === 0, `no ink token for: ${missing.join(", ")}`);
  return "text on -ink, boundaries on the fill";
});

// ── one name, one component ─────────────────────────────────────────────────
//
// `Verdict` was exported twice with incompatible contracts: the DS's recommendation card
// (required `because` and `unsure` shapes, an override slot) and a one-line summary in
// awayAgent/chrome.jsx. Nothing errored; an import simply resolved to whichever path was
// typed, and the wrong one would have rendered something plausible.
check("C", "no component name is exported by two different modules", () => {
  const FIG = path.join(ROOT, "src/figures");
  const files = walk(FIG).filter((f) => /\.jsx?$/.test(f));
  const owners = new Map();
  for (const f of files) {
    const src = fs.readFileSync(f, "utf8");
    for (const m of src.matchAll(/^export (?:function|const)\s+([A-Z][A-Za-z0-9_]*)/gm)) {
      const rel = path.relative(ROOT, f);
      if (!owners.has(m[1])) owners.set(m[1], []);
      owners.get(m[1]).push(rel);
    }
  }
  // A re-export is not a second definition: `export { IconCheck as ICheck }` deliberately
  // points both figure families at the one DS glyph, which is the fix, not the defect.
  //
  // `Rail` is the one intentional pair. Each family owns a one-line ADAPTER over
  // ds/StepRail that supplies only its class prefix and default tone, so the two names
  // resolve to the same component wearing different skins. That is the opposite of the
  // Verdict problem: same name, same contract, deliberately parallel. The adapters-not-
  // copies check above is what stops them drifting back into two implementations.
  const INTENDED = new Set(["Rail"]);
  const clashes = [...owners].filter(([n, fs_]) => fs_.length > 1 && !INTENDED.has(n))
    .map(([n, fs_]) => `${n}: ${fs_.join(" + ")}`);
  assert(clashes.length === 0, `duplicate exports: ${clashes.join("; ")}`);
  return `${owners.size} exported names across ${files.length} figure modules, no clashes`;
});

// ── a promoted primitive is USED, not shadowed ──────────────────────────────
//
// StellaSim hand-rolled the buffering mark that <Waveform state="buffering" /> already
// returned, character for character, in a file that imports Waveform. Rather than the
// figure adopting the primitive, ds/components.css was widened to `.ds-buffer,
// .stl__buffer`, so the DS became the only owner of a class that existed in one
// consumer's JSX. The primitive's branch had zero callers: unused API sitting beside a
// private copy of itself, which is the contribution rule running backwards.
check("C", "Waveform's buffering branch has a caller and no private copy exists", () => {
  const prim = fs.readFileSync(path.join(ROOT, "src/figures/ds/Primitives.jsx"), "utf8");
  const dsCss = fs.readFileSync(path.join(ROOT, "src/figures/ds/components.css"), "utf8");
  const sim = fs.readFileSync(path.join(STELLA, "StellaSim.jsx"), "utf8");
  assert(/state === "buffering"/.test(prim), "the buffering branch left the primitive");
  assert(/state="buffering"/.test(sim), "nothing calls Waveform's buffering branch any more");
  assert(!/\.stl__buffer/.test(dsCss + sim), "the private buffer copy is back");
  // The state comment must name every state the component actually sets, or the next
  // reader is told a state does not exist while two call sites set it.
  const m = sim.match(/useState\("idle"\); \/\/ ([^\n]+)/);
  assert(m && /buffering/.test(m[1]), "the audioState comment omits a state the code sets");
  return "primitive used, no shadow copy";
});

// ── the two rails stay one component ────────────────────────────────────────
check("C", "scheduled and awayAgent Rails are adapters, not copies", () => {
  const rails = ["src/figures/scheduled/Rail.jsx", "src/figures/awayAgent/Rail.jsx"];
  for (const rel of rails) {
    const src = fs.readFileSync(path.join(ROOT, rel), "utf8");
    assert(/from "\.\.\/ds\/StepRail"/.test(src), `${rel} no longer uses the promoted StepRail`);
    // A copy grows markup back. An adapter does not have any.
    assert(!/<div/.test(src), `${rel} grew its own markup again, so the rails have re-forked`);
  }
  return "both rails are one-line adapters over ds/StepRail";
});

// ── the decision control is a real radiogroup ───────────────────────────────
//
// It declared role="radiogroup" and had neither of the two things that makes one work:
// every option was its own tab stop, and the arrows moved SELECTION without moving FOCUS,
// so a screen reader announced nothing while the choice changed under it.
check("C", "the ATS radiogroup has a roving tabindex and focus follows selection", () => {
  const src = fs.readFileSync(path.join(STELLA, "AtsRecord.jsx"), "utf8");
  assert(/role="radiogroup"/.test(src), "the radiogroup is gone");
  assert(/tabIndex=\{/.test(src), "no roving tabindex: every option is its own tab stop again");
  assert(/focusOption\(/.test(src), "selection moves without focus, so nothing is announced");
  // -1 from findIndex must not be treated as 0, which sent both arrow directions to the
  // first option, and the first option is the one with a real consequence.
  assert(/at < 0 \? last/.test(src), "backward from no selection collapses to the first option");
  return "one tab stop, arrows move focus and selection together";
});

// ── no raw colour in the DS ─────────────────────────────────────────────────
check("C", "agent-loop css uses tokens, never raw colour", () => {
  const css = fs.readFileSync(path.join(ROOT, "src/figures/ds/components.css"), "utf8");
  const block = css.slice(css.indexOf("── agent-loop set"));
  const raw = block.match(/#[0-9a-f]{3,8}\b|rgb\(|hsl\(/gi) || [];
  assert(raw.length === 0, `raw colour: ${raw.slice(0, 4).join(", ")}`);
  assert(!/box-shadow/.test(block), "a card grew a shadow; the Dassh source is border-only");
  return "tokens only, no shadows";
});

// ── the retired statistic ───────────────────────────────────────────────────
check("S", "the 34.9% claim survives only where it is framed correctly", () => {
  const srcFiles = walk(path.join(ROOT, "src")).filter((f) => /\.(jsx?)$/.test(f));
  const hits = [];
  for (const f of srcFiles) {
    const t = fs.readFileSync(f, "utf8");
    t.split("\n").forEach((line, i) => {
      if (!line.includes("34.9")) return;
      const framed = /raw INCOMPLETE|10 of 43|recounted|build note|2026-07-2/.test(line);
      hits.push({ file: path.relative(ROOT, f), line: i + 1, framed });
    });
  }
  const unframed = hits.filter((h) => !h.framed);
  assert(
    unframed.length === 0,
    `unframed: ${unframed.map((h) => `${h.file}:${h.line}`).join(", ")}`
  );
  return `${hits.length} mentions, all framed against the recount`;
});

// ── the DS never hardcodes a theme-dependent colour ─────────────────────────
// ds/README.md promises component CSS never needs to know which theme is active. It was
// not true: `color: #fff` sat over `background: var(--ds-primary)`, which is #ededf0 in
// dark, so white on near-white at 1.17:1. Shadows are exempt: an rgba black shadow is
// correct in both themes and is not a colour a person reads.
check("C", "the shared DS hardcodes no theme-dependent colour", () => {
  const files = ["src/figures/ds/components.css", "src/figures/ds/scaffold.css"];
  const bad = [];
  for (const f of files) {
    read(f).split("\n").forEach((line, i) => {
      const stripped = line.replace(/box-shadow:[^;]*;/g, "").replace(/\/\*[\s\S]*?\*\//g, "");
      // Traffic-light dots are literal macOS window chrome and are named as such.
      if (/ds-dot--[ryg]/.test(stripped)) return;
      if (/(?:^|[\s:])#[0-9a-fA-F]{3,6}\b/.test(stripped) || /\brgba?\(\s*\d/.test(stripped)) {
        bad.push(`${path.basename(f)}:${i + 1}`);
      }
    });
  }
  // Prove the scanner is live: it must find plenty INSIDE tokens.css, where literals belong.
  const inTokens = (read("src/figures/ds/tokens.css").match(/#[0-9a-fA-F]{6}\b/g) || []).length;
  assert(inTokens > 40, `scanner found only ${inTokens} literals in tokens.css, so the pattern is broken`);
  return assert(bad.length === 0, `hardcoded colour outside tokens.css: ${bad.join(", ")}`);
});

// ── every check below asserts its own EXTRACTOR found something before it asserts the
// something is correct. This codebase has proof that the alternative is worse than no
// check: the ScopeNote check matched a bare tag so a dropped prop went unnoticed for a
// full cycle, and the nav check reported "3 nav items, all honest" for a four-item array
// because it split on a literal that misses multi-line entries.

const L = (hex) => {
  const c = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255)
    .map((v) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4));
  return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
};
const ratio = (a, b) => {
  const x = L(a), y = L(b);
  return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05);
};
// Composite an rgba tint over an opaque ground, so an ink can be measured on its own tint.
const over = (hex, alpha, ground) => {
  const m = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
  const [r0, g0, b0] = m(hex), [r1, g1, b1] = m(ground);
  const mix = [r0 * alpha + r1 * (1 - alpha), g0 * alpha + g1 * (1 - alpha), b0 * alpha + b1 * (1 - alpha)];
  return "#" + mix.map((v) => Math.round(v).toString(16).padStart(2, "0")).join("");
};
// Read a token out of a named block of tokens.css, following one level of var() alias.
const tokenBlocks = () => {
  // Comments are stripped ONCE, here, because a comment that documents a token's ratio
  // contains the token's own name and a number. Three separate checks in this file were
  // caught matching their own prose before this was centralised; do not scan raw CSS.
  const css = read("src/figures/ds/tokens.css").replace(/\/\*[\s\S]*?\*\//g, "");
  const darkAt = css.indexOf('.ds-root[data-theme="dark"]');
  return { light: css.slice(0, darkAt), dark: css.slice(darkAt) };
};
const tokenIn = (block, name, depth = 0) => {
  const all = [...block.matchAll(new RegExp(`--${name}:\\s*([^;]+);`, "g"))];
  const m = all.length ? all[all.length - 1] : null;  // last wins, as the cascade does
  // Fall back to the base block, because that is what the cascade does: the dark block
  // only redeclares what changes, so an unredeclared token is inherited, not missing.
  if (!m) return block === tokenBlocks().light ? null : tokenIn(tokenBlocks().light, name, depth);
  const v = m[1].trim();
  const alias = v.match(/^var\(--([a-z0-9-]+)\)$/);
  if (alias && depth < 4) return tokenIn(block, alias[1], depth + 1);
  return v;
};

check("S", "the low text tiers clear 4.5:1 in both themes", () => {
  const { light, dark } = tokenBlocks();
  const grounds = ["ds-surface", "ds-bg", "ds-field", "ds-muted"];
  const fails = [];
  let measured = 0;
  for (const [name, block] of [["light", light], ["dark", dark]]) {
    // In the light block --ds-surface etc. resolve directly; in dark they are redeclared.
    const g = Object.fromEntries(grounds.map((k) => [k, tokenIn(block, k) || tokenIn(light, k)]));
    for (const fg of ["ds-text-2", "ds-text-3", "ds-placeholder"]) {
      const hex = tokenIn(block, fg);
      assert(hex && /^#[0-9a-fA-F]{6}$/.test(hex), `${name} --${fg} is not a hex literal`);
      for (const [gname, ghex] of Object.entries(g)) {
        measured++;
        const rr = ratio(hex, ghex);
        if (rr < 4.5) fails.push(`${name} --${fg} on --${gname} = ${rr.toFixed(2)}`);
      }
    }
  }
  // Prove the maths ran, so a token rename fails loudly instead of skipping the check.
  assert(measured === 24, `measured ${measured} pairs, expected 24`);
  return assert(fails.length === 0, `24 pairs measured, all >= 4.5:1${fails.length ? ": " + fails.join(", ") : ""}`);
});

check("S", "every tone ink clears 4.5:1 on its surface and its own tint", () => {
  const { light, dark } = tokenBlocks();
  const tones = ["register", "numbers", "repair", "trust", "provisional", "neutral"];
  const fails = [];
  let measured = 0;
  for (const [name, block] of [["light", light], ["dark", dark]]) {
    const surface = tokenIn(block, "ds-surface") || tokenIn(light, "ds-surface");
    for (const t of tones) {
      const ink = tokenIn(block, `ds-tone-${t}-ink`);
      const hue = tokenIn(block, `ds-tone-${t}`);
      assert(hue && /^#[0-9a-fA-F]{6}$/.test(hue), `${name} --ds-tone-${t} did not resolve to a hex`);
      assert(ink && /^#[0-9a-fA-F]{6}$/.test(ink), `${name} --ds-tone-${t}-ink missing or not hex`);
      for (const ground of [surface, over(hue, 0.1, surface)]) {
        measured++;
        const rr = ratio(ink, ground);
        if (rr < 4.5) fails.push(`${name} ${t} = ${rr.toFixed(2)}`);
      }
    }
  }
  assert(measured === 24, `measured ${measured} ink pairs, expected 24`);
  return assert(fails.length === 0, `24 ink pairs measured, all >= 4.5:1${fails.length ? ": " + fails.join(", ") : ""}`);
});

check("C", "no setter is called that nothing declares", () => {
  // The exact class of bug that shipped a live ReferenceError on the primary gesture:
  // the segmented rail was removed and its setPane call site survived.
  const bad = [];
  let calls = 0;
  for (const f of stellaFiles.filter((x) => x.endsWith(".jsx"))) {
    const src = fs.readFileSync(f, "utf8");
    const called = new Set([...src.matchAll(/\b(set[A-Z]\w*)\s*\(/g)].map((m) => m[1]));
    calls += called.size;
    for (const name of called) {
      // A setter is legitimate only if something destructures it out of a hook, or it
      // arrives as a prop. Anything else is a call site whose owner was deleted.
      const declared = new RegExp(`\\[\\s*[\\w.]+\\s*,\\s*${name}\\s*\\]`).test(src)
        || new RegExp(`\\b${name}\\b\\s*[,}:=]`).test(src.slice(0, src.indexOf("return (") + 1));
      if (!declared) bad.push(`${path.basename(f)}: ${name}`);
    }
  }
  assert(calls > 10, `found only ${calls} setter calls, so the extractor is broken`);
  return assert(bad.length === 0, `${calls} setters, all declared${bad.length ? ": " + bad.join(", ") : ""}`);
});

check("C", "every Gujarati span declares lang=gu", () => {
  const files = ["src/figures/stella/StellaSim.jsx", "src/figures/stella/CandidateView.jsx"];
  let spans = 0, tagged = 0;
  for (const f of files) {
    const src = read(f);
    spans += (src.match(/className="(stl|cand)__guj"/g) || []).length;
    tagged += (src.match(/className="(stl|cand)__guj" lang="gu"/g) || []).length;
  }
  assert(spans > 0, "no Gujarati spans found, so the extractor is broken");
  return assert(spans === tagged, `${tagged} of ${spans} Gujarati spans carry lang="gu"`);
});

check("C", "no raw millisecond duration outside tokens.css", () => {
  const sheets = ["src/figures/stella/stellaSim.css", "src/figures/ds/components.css"];
  const bad = [];
  // Comments are stripped file-wide, not per line: a multi-line comment that mentions a
  // duration is not a raw duration, and scanning line by line matched this check's own
  // prose. Keyframe rhythms are exempt and named: a stagger delay is a rhythm, not a
  // duration token, and @keyframes cannot read a var() in its own name position.
  for (const f of sheets) {
    const noComments = read(f).replace(/\/\*[\s\S]*?\*\//g, (m) => m.replace(/[^\n]/g, " "));
    noComments.split("\n").forEach((line, i) => {
      if (/animation-delay|@keyframes|animation:/.test(line)) return;
      if (/\b\d{2,4}ms\b/.test(line)) bad.push(`${path.basename(f)}:${i + 1}`);
    });
  }
  // The scale exists precisely so this drift cannot happen; prove the pattern is live.
  const inTokens = (read("src/figures/ds/tokens.css").match(/\b\d{2,4}ms\b/g) || []).length;
  assert(inTokens >= 5, `pattern found only ${inTokens} durations in tokens.css, so it is broken`);
  return assert(bad.length === 0, `durations tokenised${bad.length ? ", raw values at: " + bad.join(", ") : ""}`);
});

check("C", "uppercase is reserved to the bubble speaker tag", () => {
  const sheets = ["src/figures/stella/stellaSim.css", "src/figures/ds/components.css"];
  const ALLOW = ["ds-bubble__speaker"];
  const bad = [];
  for (const f of sheets) {
    const lines = read(f).split("\n");
    lines.forEach((line, i) => {
      if (!/text-transform:\s*uppercase/.test(line)) return;
      // walk back to the selector that owns this declaration
      let j = i;
      while (j >= 0 && !lines[j].includes("{")) j--;
      const sel = lines[j] || "";
      if (!ALLOW.some((a) => sel.includes(a))) bad.push(`${path.basename(f)}:${i + 1} (${sel.trim().slice(0, 40)})`);
    });
  }
  return assert(bad.length === 0, `uppercase only on the speaker tag${bad.length ? ", also at: " + bad.join(", ") : ""}`);
});

check("C", "the theme is resolved, never asserted", () => {
  const strip = (t) => t.replace(/\/\/[^\n]*/g, "").replace(/\/\*[\s\S]*?\*\//g, "");
  const src = strip(read("src/figures/stella/StellaSim.jsx"));
  const hooks = strip(read("src/figures/ds/hooks.js"));
  assert(!/useState\(\s*"dark"\s*\)/.test(src), "StellaSim asserts a hardcoded theme again");
  assert(/useDsTheme\(\)/.test(src), "StellaSim no longer resolves the theme");
  assert(/documentElement/.test(hooks), "useDsTheme no longer reads the site's class");
  assert(/prefers-color-scheme/.test(hooks), "useDsTheme lost its system fallback");
  assert(!/className="stl__theme"/.test(src), "an in-app appearance toggle returned");
  return "resolved from the site class, then the system, with no in-app toggle";
});

check("C", "FieldRow renders a provenance word for every non-empty state", () => {
  const prim = read("src/figures/ds/Primitives.jsx");
  const block = prim.slice(prim.indexOf("const PROV = {"), prim.indexOf("export function FieldRow"));
  for (const k of ["confirmed", "heard", "asked", "na", "offscript"]) {
    assert(new RegExp(`${k}:`).test(block), `PROV is missing ${k}`);
  }
  // Declared is not rendered. Check it is actually consumed in the returned JSX.
  assert(/\{PROV\[state\] && <span className="ds-fieldrow__prov">/.test(prim),
    "PROV is declared but never rendered");
  return "five provenance words, declared and rendered";
});

check("C", "every custom control has a press state and one shared focus ring", () => {
  const raw = read("src/figures/ds/components.css") + read("src/figures/stella/stellaSim.css");
  // Same file-wide comment strip: this check was matching the comment that explains why
  // `outline: none` was removed.
  const css = raw.replace(/\/\*[\s\S]*?\*\//g, "");
  assert(/\.ds-root--live :focus-visible/.test(css), "the shared focus ring is gone");
  assert(!/outline:\s*none/.test(css), "outline: none returned, which removes the only focus indicator");
  // DERIVED, not listed. This was a hand-typed array of nine class names, and it was the
  // second copy of the same allowlist (components.css held the first). Four real <button>s
  // in the same figure were on neither, so they had no press state and nothing said so.
  // Now the check reads the JSX: every raw <button> that survives must carry a class with
  // its own :active rule, and everything routed through <Button> inherits .ds-button's.
  // Add a bespoke button and forget its press state and this fails, without anyone having
  // to remember to enrol it.
  const jsx = ["StellaSim.jsx", "StellaThread.jsx", "AtsRecord.jsx", "CandidateView.jsx"]
    .map((f) => fs.readFileSync(path.join(STELLA, f), "utf8"))
    .join("\n");
  assert(/\.ds-root--live \.ds-button[^,{]*:active/.test(css),
    "the promoted button lost its press state, which un-presses every control routed through it");

  const bespoke = new Set();
  for (const tag of jsx.match(/<button\b[^>]*?>/gs) || []) {
    const cls = tag.match(/className="([^"]+)"/);
    assert(cls, `a raw <button> has no className, so no press rule can reach it: ${tag.slice(0, 60)}`);
    cls[1].split(/\s+/).forEach((c) => bespoke.add(c));
  }
  const missing = [...bespoke].filter((c) => !new RegExp(`\\.${c}[^,{]*:active`).test(css));
  assert(missing.length === 0, `raw <button> with no press state: ${missing.join(", ")}`);
  return `${bespoke.size} bespoke controls + every <Button>, all with a press state`;
});

check("S", "every choice under You say is something the candidate says", () => {
  let spoken = 0, meta = 0;
  const bad = [];
  for (const [id, n] of Object.entries(graph.nodes)) {
    for (const b of n.branches || []) {
      const isSpoken = !!(b.candidateSays || b.gloss);
      if (isSpoken) spoken++; else meta++;
      // A spoken choice must not be a stage direction to an actor.
      if (isSpoken && /^(Hear what|Play it as)/i.test(b.label)) bad.push(`${id}: ${b.label}`);
      if (!isSpoken && (b.candidateSays || b.gloss)) bad.push(`${id}: meta carries speech`);
    }
  }
  assert(spoken > 50 && meta > 0, `partitions look wrong: ${spoken} spoken, ${meta} meta`);
  return assert(bad.length === 0, `${spoken} spoken, ${meta} viewer-steering, cleanly partitioned`);
});

check("C", "one terms list for the role", () => {
  const bad = [];
  for (const f of stellaFiles) {
    const t = fs.readFileSync(f, "utf8");
    if (/Plant operator/i.test(t)) bad.push(path.basename(f));
  }
  const graphSrc = read("src/figures/stella/stellaGraph.js");
  assert(/export const ROLE_EN = "Packing operator"/.test(graphSrc), "ROLE_EN is not the single source");
  const importers = stellaFiles.filter((f) => /ROLE_EN/.test(fs.readFileSync(f, "utf8"))).length;
  assert(importers >= 4, `only ${importers} files read ROLE_EN, expected at least 4`);
  return assert(bad.length === 0, `one spelling, read by ${importers} files${bad.length ? "; stale in: " + bad.join(", ") : ""}`);
});

check("S", "every candidate line can be sounded out", () => {
  const missing = [];
  let total = 0;
  for (const [id, n] of Object.entries(graph.nodes)) {
    for (const b of n.branches || []) {
      if (!b.candidateSays) continue;
      // Gujarati script present means a reader needs a romanization to sound it out.
      if (!/[઀-૿]/.test(b.candidateSays)) continue;
      total++;
      if (!b.candidateSaysLatin) missing.push(`${id}: ${b.label}`);
    }
  }
  assert(total > 50, `found only ${total} Gujarati candidate lines, so the extractor is broken`);
  return assert(missing.length === 0, `${total} candidate lines, all romanised${missing.length ? "; missing: " + missing.slice(0, 3).join(", ") : ""}`);
});

check("C", "the failure leads and its citation follows", () => {
  const bad = [];
  let total = 0;
  const walk = (o) => {
    if (!o || typeof o !== "object") return;
    if (o.failureCase) {
      total++;
      if (typeof o.failureCase === "string") bad.push("a failureCase is still a bare string");
      else if (/^Stage \d/.test(o.failureCase.what)) bad.push(`leads with a coordinate: ${o.failureCase.what.slice(0, 30)}`);
      else if (/OBSERVED/.test(o.failureCase.what)) bad.push("shouts OBSERVED mid-sentence");
    }
    for (const v of Object.values(o)) walk(v);
  };
  walk(graph);
  assert(total > 20, `found only ${total} failureCase entries, so the walk is broken`);
  const src = read("src/figures/stella/StellaSim.jsx");
  assert(/node\.failureCase\.what/.test(src) && /node\.failureCase\.source/.test(src),
    "the renderer does not read the reshaped failureCase");
  return assert(bad.length === 0, `${total} failure cases, all leading with the failure${bad.length ? ": " + bad.slice(0, 2).join(", ") : ""}`);
});

check("C", "the Gujarati face is declared, installed and pointed at", () => {
  const tokens = read("src/figures/ds/tokens.css");
  const pkg = JSON.parse(read("package.json"));
  // Three coupled assertions: the dependency, the @import that declares the faces, and the
  // token that names it. Any one alone leaves the surface silently falling back to whatever
  // per-script face the reviewer's machine happens to have, which is the exact failure this
  // replaced (Gujarati Sangam MN on a Mac, Nirmala UI on Windows, Noto on Linux).
  assert(
    !!(pkg.dependencies || {})["@fontsource-variable/anek-gujarati"],
    "Anek Gujarati is not a dependency, so the self-hosted face will not ship"
  );
  assert(
    /@import '@fontsource-variable\/anek-gujarati';/.test(tokens),
    "tokens.css no longer declares the Anek faces, so nothing loads them"
  );
  assert(
    /--ds-font-gu:\s*"Anek Gujarati Variable"/.test(tokens),
    "--ds-font-gu does not lead with Anek, so the fallback stack wins"
  );
  // And the consumers have to actually read the token.
  const css = read("src/figures/stella/stellaSim.css");
  const users = (css.match(/font-family: var\(--ds-font-gu\)/g) || []).length;
  assert(users >= 4, `only ${users} rules read --ds-font-gu, expected the guj and translit rules in both surfaces`);
  return `Anek declared, installed, and read by ${users} rules`;
});

// ── the scope note is present and cannot be dismissed ───────────────────────
check("C", "a ScopeNote is mounted in both variants and has no dismiss control", () => {
  const src = fs.readFileSync(path.join(STELLA, "StellaSim.jsx"), "utf8");
  // Matched with the prop, not bare: the note folds in both variants, and an edit
  // that quietly drops `collapsible` puts the wall of text back into the layout.
  const uses = (src.match(/<ScopeNote collapsible>/g) || []).length;
  assert(uses >= 2, `folded ScopeNote used ${uses} times, expected both variants`);
  const prim = fs.readFileSync(path.join(ROOT, "src/figures/ds/Primitives.jsx"), "utf8");
  const at = prim.indexOf("export function ScopeNote");
  const block = prim.slice(at, at + 900);
  // "collaps" is deliberately NOT forbidden here: folding is disclosure, and the
  // assertion below proves the fold keeps its label on screen. What must never appear
  // is a real dismiss.
  assert(!/onClose|onDismiss|aria-label="(Close|Dismiss)/i.test(block), "ScopeNote grew a dismiss control");
  assert(!/<ScopeNote[^>]*dismissible/.test(src), "a caller passes a prop implying the note can be closed");
  // Folding is disclosure, not dismissal: the collapsible variant must keep its
  // label rendered as the summary, so the note is always findable on the screen.
  assert(
    /<summary className="ds-scopenote__tag">\{label\}<\/summary>/.test(block),
    "the collapsible variant hides its own label, which makes the fold a dismiss"
  );
  return "present in both variants, folds but never dismisses";
});

// ── the contradiction must be co-present, not tabbed ────────────────────────
//
// This exists because the rail was independently re-tabbed after being un-tabbed,
// and the revert was invisible: everything still built, every scenario still passed,
// and the case study quietly lost its strongest moment. The argument of the
// old-system path is that the log says "COMPLETE. All required fields captured. No
// flags raised." while the record beside it is empty. If the record is behind a tab
// the reviewer is TOLD they disagree; in one frame they are SHOWN it. That is the
// difference between a claim and evidence, so it gets an invariant rather than a
// comment, and the owner's decision outlives whoever edits the file next.
check("C", "the record is co-present with the log, never behind a tab", () => {
  const src = fs.readFileSync(path.join(STELLA, "StellaSim.jsx"), "utf8");
  const at = src.indexOf('<aside className="stl__rail"');
  assert(at > 0, "the rail aside is gone, so co-presence cannot be checked at all");
  const rail = src.slice(at, src.indexOf("</aside>", at));
  assert(!/<Tabs/.test(rail), "the rail is tabbed again, which hides the record behind a click");
  assert(/<RecordPanel/.test(rail), "the record is not rendered in the rail");
  // A conditional around the record is the same defect wearing different syntax.
  assert(
    !/\?\s*[\s\S]{0,400}<RecordPanel/.test(rail),
    "the record renders conditionally, so it is not guaranteed co-present"
  );
  return "record renders unconditionally beside the transcript";
});

// The tabs were solving a real problem, so assert the replacement actually has the
// hierarchy that justified removing them. A flat stack of equal-weight sections is
// the layout the tabs were introduced to fix, and reverting to it is not a win.
check("C", "the rail has hierarchy: record at full weight, evidence disclosed under it", () => {
  const src = fs.readFileSync(path.join(STELLA, "StellaSim.jsx"), "utf8");
  const at = src.indexOf('<aside className="stl__rail"');
  const rail = src.slice(at, src.indexOf("</aside>", at));
  const discs = (rail.match(/<Disclosure/g) || []).length;
  assert(discs === 2, `expected the plan and the annotation disclosed, found ${discs}`);
  // The record must lead. If a disclosure precedes it, the eye enters on a folded
  // label rather than on the evidence.
  assert(
    rail.indexOf("<RecordPanel") < rail.indexOf("<Disclosure"),
    "a disclosure sits above the record, so the rail no longer leads with the evidence"
  );
  // Changed deliberately when the pane became CONTROLLED (change 15). The old regex
  // matched a bare `open`, which React treats as an initial value only, so it was
  // asserting the exact shape that let the pane go silent after one fold. Two coupled
  // assertions now: the controlled shape, and that it starts open. Satisfying one does
  // not satisfy the other.
  // Order-independent on purpose: an attribute-order regex broke the moment `meta` was
  // added between `label` and `open`, which is a brittle check masquerading as an
  // invariant. Isolate the element, then assert what must be true inside it.
  const whyEl = rail.slice(rail.indexOf('label="Why this line"'));
  const whyAttrs = whyEl.slice(0, whyEl.indexOf(">"));
  assert(
    /open=\{whyOpen\}/.test(whyAttrs) && /onToggle=/.test(whyAttrs),
    "the annotation pane is not controlled, so tapping a turn cannot reopen it"
  );
  assert(
    /const \[whyOpen, setWhyOpen\] = useState\(true\)/.test(src),
    "the annotation pane does not start open"
  );
  return "record leads, plan and annotation disclosed beneath";
});

// ── the demo opens in its interesting state ─────────────────────────────────
check("C", "the operator thread is present on load", () => {
  const src = fs.readFileSync(path.join(STELLA, "StellaSim.jsx"), "utf8");
  const m = src.match(/const \[showThread, setShowThread\] = useState\((true|false)\)/);
  assert(m, "the showThread state declaration moved or changed shape");
  assert(
    m[1] === "true",
    "the operator thread defaults off, which hides the composer and the front door of the demo"
  );
  return "boots with the thread and composer visible";
});

// ── nav honesty: a control works, or it says why not ────────────────────────
check("C", "every nav item is either a control or an explained non-control", () => {
  const src = fs.readFileSync(path.join(STELLA, "StellaSim.jsx"), "utf8");
  const navBlock = src.slice(src.indexOf("const NAV = ["), src.indexOf("];", src.indexOf("const NAV = [")));
  // This check USED TO split on the literal '{ key:' and so silently skipped the one
  // multi-line entry, which was the only entry carrying `reason`: it reported "3 nav
  // items, all honest" for a four-item array and never read the item it existed to
  // verify. A count cross-check makes an extractor that misses an entry FAIL rather
  // than quietly pass, which is the whole difference between a check and a decoration.
  const declared = (navBlock.match(/\bkey:/g) || []).length;
  const items = navBlock.split(/\{\s*key:/).slice(1);
  assert(
    items.length === declared && declared >= 5,
    `extractor read ${items.length} of ${declared} declared nav entries (expected at least 5)`
  );
  const bad = [];
  for (const it of items) {
    const key = (it.match(/^\s*"([^"]+)"/) || [])[1] || "?";
    const routes = /\bto:/.test(it);
    const explains = /reason:/.test(it);
    if (!routes && !explains) bad.push(key);
    // A label is what a person reads. An item with none is a glyph to be hunted for.
    if (!/label:\s*"/.test(it)) bad.push(`${key} (no label)`);
  }
  assert(bad.length === 0, `nav items that neither route nor explain: ${bad.join(", ")}`);
  assert(src.includes('aria-disabled="true"'), "non-controls are not marked aria-disabled");
  // The reason must be rendered, not merely stored: it lived in `title` and aria-label,
  // where a keyboard user never reaches it and a sighted user never sees it.
  assert(
    /className="stl__navwhytext"/.test(src) && /aria-describedby=/.test(src),
    "a non-destination's reason is not rendered anywhere a person can reach it"
  );
  // Every label reaches the DOM as text.
  assert(
    /<span className="stl__navlabel">\{label\}<\/span>/.test(src),
    "nav labels are not rendered as visible text"
  );
  return `${items.length} of ${declared} nav items, all named and all honest`;
});

// ── no real person's name in the app ────────────────────────────────────────
check("C", "no real individual is named in the Stella app", () => {
  const names = ["Shivansh", "Harshit", "Aniruddh", "Pratik", "Agam"];
  const bad = [];
  for (const f of stellaFiles) {
    const t = fs.readFileSync(f, "utf8");
    names.forEach((n) => { if (new RegExp(`\\b${n}`).test(t)) bad.push(`${path.basename(f)}: ${n}`); });
  }
  return assert(bad.length === 0, bad.join(", "));
});

// ── the operator thread is English and silent ───────────────────────────────
check("C", "the operator thread carries no Gujarati and no audio", () => {
  const t = fs.readFileSync(path.join(STELLA, "StellaThread.jsx"), "utf8");
  assert(!/[\u0A80-\u0AFF]/.test(t), "Gujarati codepoints in the operator thread");
  assert(!/<audio|\.play\(/.test(t), "the operator thread plays audio");
  return "English, silent: the operator reads, the candidate listens";
});

// ── nothing reaches the network on the default path ─────────────────────────
check("C", "no network calls anywhere in the Stella app", () => {
  const bad = [];
  for (const f of stellaFiles.filter((f) => /\.jsx?$/.test(f))) {
    const t = fs.readFileSync(f, "utf8");
    if (/\bfetch\(|XMLHttpRequest|axios/.test(t)) bad.push(path.basename(f));
  }
  return assert(bad.length === 0, `network in ${bad.join(", ")}`);
});

// ── the fork stays close to the front door ──────────────────────────────────
check("S", "the thesis fork is at most 3 choices from boot", () => {
  // The chat shell must not add a single required interaction in front of the
  // strongest thing the demo has.
  let best = Infinity;
  const walk = (st, depth) => {
    if (depth > 4 || depth >= best) return;
    if (st.turns.some((t) => t.id === "listen-volunteer")) { best = Math.min(best, depth); return; }
    K.selectBranches(st).forEach((b, i) => walk(K.reduce(st, { type: "choose", index: i }), depth + 1));
  };
  walk(K.initialState(), 0);
  return assert(best <= 3, `fork is ${best} choices deep`);
});

// ── the Stella app must not read the PRD ────────────────────────────────────
check("C", "stella imports nothing from src/prd", () => {
  const bad = stellaFiles.filter((f) => /from ["'].*\/prd\//.test(fs.readFileSync(f, "utf8")));
  return assert(bad.length === 0, "0 prd imports");
});

// ── no agent scoreboard ─────────────────────────────────────────────────────
check("C", "no banned agent-activity metrics in Stella copy", () => {
  const banned = [
    /calls (placed|made|attempted)/i, /connect rate/i, /minutes saved/i,
    /\baccuracy\b/i, /throughput/i, /\bsentiment\b/i, /\d+% (accurate|confident)/i,
  ];
  // Strip comments first: a comment FORBIDDING a metric is not the metric appearing
  // in the UI, and the rule is about what a recruiter can read on screen.
  const stripComments = (t) => t.replace(/\/\*[\s\S]*?\*\//g, "").replace(/^\s*\/\/.*$/gm, "");
  const hits = [];
  for (const f of stellaFiles.filter((f) => /\.jsx?$/.test(f))) {
    const t = stripComments(fs.readFileSync(f, "utf8"));
    banned.forEach((re) => { if (re.test(t)) hits.push(`${path.basename(f)}: ${re}`); });
  }
  assert(hits.length === 0, `banned metric in: ${hits.join(" | ")}`);
  return "0 scoreboard metrics";
});

// ── audio coverage ──────────────────────────────────────────────────────────
check("C", "every Stella line with Gujarati has rendered audio", () => {
  const dir = path.join(ROOT, "public/stella");
  if (!fs.existsSync(dir)) throw new Error("public/stella missing: run render_stella.py");
  const have = new Set(fs.readdirSync(dir).filter((f) => f.endsWith(".mp3")).map((f) => f.replace(/\.mp3$/, "")));
  const need = ids.filter((i) => graph.nodes[i].speaker === "stella" && (graph.nodes[i].guj || "").trim());
  const missing = need.filter((i) => !have.has(i));
  return assert(missing.length === 0, `${need.length} lines, ${have.size} files`);
});

// ── report ──────────────────────────────────────────────────────────────────
const pass = results.filter((r) => r.ok);
const fail = results.filter((r) => !r.ok);
const w = Math.max(...results.map((r) => r.name.length));
console.log("\n  Stella QA\n");
for (const r of results) {
  console.log(`  ${r.ok ? "pass" : "FAIL"}  [${r.tag}]  ${r.name.padEnd(w)}  ${r.detail}`);
}
console.log(`\n  ${pass.length} passed, ${fail.length} failed\n`);
console.log("  [M] manual checks, not run here:");
// Structure is asserted above; what a person still has to judge is whether it READS.
console.log("      - the fork: does the contradiction land? (co-presence is asserted,");
console.log("        legibility is not: log says notice period recorded, record says not yet)");
console.log("      - Gujarati pronunciation and register on the rendered audio");
console.log("      - the case-study embed at 800x540 (note: nothing mounts variant=\"figure\" yet)\n");
process.exit(fail.length ? 1 : 0);
