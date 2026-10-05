#!/usr/bin/env node
// Prompt library QA harness. Pure node, no browser, no test runner.
//
//   npm run qa:prompts
//
// The library was one 1415-line file holding two unrelated kinds of prompt with the
// same rule restated 176 times in three wordings. It is now one module per group,
// with the voice prompts composed by a real assembler and the image rules declared
// once. These checks exist so it cannot quietly slide back.
//
// House lesson, learned the hard way on the Stella harness: every check asserts its
// own extractor found something BEFORE it asserts the something is correct. A check
// that reports "0 violations" because its regex matched nothing is a check that lies.
//
// Check tags:
//   [S] script assertion, run here
//   [C] code invariant, a structural read, also run here

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const LIB = path.join(ROOT, "src/prd/promptLibrary");

const results = [];
const check = (tag, name, fn) => {
  try {
    results.push({ tag, name, ok: true, detail: fn() || "" });
  } catch (e) {
    results.push({ tag, name, ok: false, detail: e.message });
  }
};
const assert = (cond, msg) => {
  if (!cond) throw new Error(msg);
  return msg;
};
const walk = (dir, out = []) => {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p, out);
    else if (e.name.endsWith(".js")) out.push(p);
  }
  return out;
};
const rel = (p) => p.slice(LIB.length + 1);

const { promptLibraryData: data } = await import(pathToFileURL(path.join(LIB, "index.js")));
const { LIBRARY_RULES, LIBRARY_RULES_COMPACT } = await import(pathToFileURL(path.join(LIB, "rules.js")));
const { FRAMEWORKS, MOMENT_SETS, buildPrompt } = await import(
  pathToFileURL(path.join(LIB, "voice/index.js"))
);
const { TEAMS, TASK_SETS, buildTeamPrompt, buildTeamSystemPrompt, teamSpecs } = await import(
  pathToFileURL(path.join(LIB, "teams/index.js"))
);
const { teamPromptsData } = await import(pathToFileURL(path.join(LIB, "teams/page.js")));
const TEAM_ILLO = await import(pathToFileURL(path.join(LIB, "image/teamViews.js")));
const teamBlocks = [];
const collectTeam = (node, id) => {
  if (Array.isArray(node)) node.forEach((n) => collectTeam(n, id));
  else if (node && typeof node === "object") {
    if (typeof node.pre === "string") teamBlocks.push({ id, pre: node.pre });
    else Object.values(node).forEach((v) => collectTeam(v, id));
  }
};
teamSpecs.forEach((s) => collectTeam(s, s.id));
const { AIRCRAFT, GROUPS: FLEET_GROUPS } = await import(
  pathToFileURL(path.join(LIB, "image/airplaneViews.js"))
);
const FACES = await import(pathToFileURL(path.join(LIB, "image/faces3dViews.js")));
const CAMPAIGN = await import(pathToFileURL(path.join(LIB, "image/zeptoCampaignViews.js")));
const SCHEDULE = await import(pathToFileURL(path.join(LIB, "image/scheduleImagesViews.js")));
const POV = await import(pathToFileURL(path.join(LIB, "image/schedulePovViews.js")));

const files = walk(LIB);
const specs = data.specs;

// every { pre } in the assembled library, with the spec it came from
const blocks = [];
const collect = (node, id) => {
  if (Array.isArray(node)) node.forEach((n) => collect(n, id));
  else if (node && typeof node === "object") {
    if (typeof node.pre === "string") blocks.push({ id, pre: node.pre });
    else Object.values(node).forEach((v) => collect(v, id));
  }
};
specs.forEach((s) => collect(s, s.id));

// ---------------------------------------------------------------- structure
check("[S]", "the library assembles", () => {
  assert(specs.length > 0, "no specs at all");
  // Canary counts. Bump BOTH deliberately when a group is added, and say why:
  // 30/236 at the reorganisation, 35/261 once "3D faces" landed (5 specs, 25 blocks),
  // 37/274 after the 2026-08-15 faces retune (expressions spec, plaster + grotesque
  // styles) which shipped without a bump, 39/280 once "Zepto campaign tiles" landed
  // (2 specs: system + tile catalog; 6 blocks: 5 composed tiles + the template),
  // 39/281 once the sixth campaign tile (phone in hand) landed on 2026-08-16,
  // 40/288 once its seven lifestyle scenarios got a written-out block the same day,
  // 41/289 when those scenarios moved out into their own "Schedule images" system
  // (campaign back to 6 tile blocks; schedule = system + scene catalog, 7 scene
  // blocks + the template), 41/294 when Schedule images grew to 12 scenes, 41/297 at 15,
  // 40/281 once Schedule images hid everything but its picker (HIDE_PROSE).
  // 86/691 after Zepto catalogue (37 specs) and Camera views (6) landed without a
  // bump (this check sat red for a fortnight; noticed 2026-09-04), 90/713 once
  // "Team illustrations" landed the same day, then grew into a recipe with a
  // character mode: system + (objects + characters) x 4 styles = 9 specs; 28 object
  // prompts + 84 character prompts + the template = 113 blocks, so 95/804; then a fifth
  // look, Zepto flat, read off the Zepto illustration library: 97/832; then a sixth,
  // Dreamy glow, from two Apofiss references: 99/860; then scene mode, one scenes catalog
  // per style with five settings each: 105/890; then the brick-built look: 108/923. The Teams
  // TEXT family was built into the library that day and then moved to its own page
  // (/work/team-prompts); its 15 specs / 51 blocks are counted by the teams checks
  // below, not here.
  // 108/927 on 2026-09-05 when Away product icons grew a tenth group, Group trip search
  // (four icons: flying from, flying to, departure date, return date).
  // 109/927 on 2026-09-15 when "Schedule POV" landed: one spec, the picker, because the
  // group ships with HIDE_PROSE on like Schedule images, so its moment catalog and
  // template are composed but not rendered and the block count does not move.
  assert(specs.length === 109, `expected 109 specs, got ${specs.length}`);
  assert(blocks.length === 927, `expected 927 prompt blocks, got ${blocks.length}`);
  return `${specs.length} specs, ${blocks.length} prompt blocks`;
});

check("[C]", "every spec is filed under a family and a group", () => {
  assert(specs.length > 0, "extractor found no specs");
  const loose = specs.filter((s) => !s.family || !s.group);
  assert(!loose.length, `unfiled: ${loose.map((s) => s.id).join(", ")}`);
  const fams = [...new Set(specs.map((s) => s.family))];
  const groups = [...new Set(specs.map((s) => s.group))];
  assert(fams.length === 2, `expected 2 families (Voice, Image), got ${fams.join(", ")}`);
  return `${fams.join(" / ")} across ${groups.length} groups`;
});

check("[C]", "no group is interleaved with another in the rail", () => {
  // PrdRenderer collapses CONSECUTIVE same-group sections, so a group that appears
  // twice silently renders as two identical rail blocks.
  const seq = specs.map((s) => `${s.family}/${s.group}`);
  assert(seq.length > 0, "extractor found no sections");
  const seen = new Set();
  let last = null;
  for (const k of seq) {
    if (k === last) continue;
    assert(!seen.has(k), `group "${k}" appears in two runs`);
    seen.add(k);
    last = k;
  }
  return `${seen.size} contiguous group blocks`;
});

check("[C]", "each group that has a system spec opens with it", () => {
  const first = new Map();
  specs.forEach((s) => { if (!first.has(s.group)) first.set(s.group, s); });
  assert(first.size > 0, "extractor found no groups");
  const systems = specs.filter((s) => /-system$/.test(s.id));
  assert(systems.length >= 4, `expected several system specs, found ${systems.length}`);
  const buried = systems.filter((s) => first.get(s.group).id !== s.id);
  assert(!buried.length, `system spec not first in its group: ${buried.map((s) => s.id).join(", ")}`);
  return `${systems.length} system specs, all leading their group`;
});

// ---------------------------------------------------------------- voice
check("[S]", "no frozen voice prompt survives in the data files", () => {
  const voiceData = files.filter((f) => /voice\/.*\.data\.js$/.test(f));
  assert(voiceData.length === 2, `expected 2 voice data files, found ${voiceData.length}`);
  const TAIL = "One per line, ship-ready, no preamble";
  for (const f of voiceData) {
    const t = fs.readFileSync(f, "utf8");
    assert(t.length > 1000, `${rel(f)} is suspiciously empty`);
    assert(!t.includes(TAIL), `${rel(f)} still contains a frozen assembled prompt`);
    assert(!t.includes("Voice principles:"), `${rel(f)} still contains a frozen prompt body`);
  }
  return "frameworks + moments hold structured data only";
});

check("[S]", "every voice prompt on the page is composed by buildPrompt", () => {
  assert(FRAMEWORKS.length === 4, `expected 4 frameworks, got ${FRAMEWORKS.length}`);
  const total = MOMENT_SETS.reduce((n, s) => n + Object.keys(s.moments).length, 0);
  assert(total === 52, `expected 52 moments, got ${total}`);
  let n = 0;
  for (const set of MOMENT_SETS) {
    const fw = FRAMEWORKS.find((f) => f.id === set.framework);
    assert(fw, `moment set ${set.id} has no framework`);
    const spec = specs.find((s) => s.id === set.id);
    for (const [name, m] of Object.entries(set.moments)) {
      assert(spec[name] && spec[name].pre, `${set.id} is missing the rendered "${name}"`);
      assert(spec[name].pre === buildPrompt(fw, name, m), `${set.id} / ${name} does not match the assembler`);
      n++;
    }
  }
  return `${n} prompts composed from ${FRAMEWORKS.length} frameworks`;
});

check("[C]", "editing one principle still reaches every prompt that uses it", () => {
  // The whole point of the assembler. Take a real principle and count its reach.
  const fw = FRAMEWORKS.find((f) => f.id === "pl-away-voice");
  assert(fw && fw.principles.length, "Away framework or its principles went missing");
  const p = fw.principles[0];
  const reach = blocks.filter((b) => b.pre.includes(p)).length;
  assert(reach >= 20, `an Away principle reaches only ${reach} prompts, expected 20+`);
  return `one Away principle appears in ${reach} rendered prompts, edited in 1 place`;
});

// ---------------------------------------------------------------- teams
check("[S]", "no frozen team prompt survives in the data files", () => {
  const teamData = files.filter((f) => /teams\/.*\.data\.js$/.test(f));
  assert(teamData.length === 2, `expected 2 teams data files, found ${teamData.length}`);
  const TAIL = "in the shape under <output>";
  for (const f of teamData) {
    const t = fs.readFileSync(f, "utf8");
    assert(t.length > 2000, `${rel(f)} is suspiciously short`);
    assert(!t.includes(TAIL) && !t.includes("<role>"), `${rel(f)} holds a rendered prompt`);
  }
  return `${teamData.length} data files hold structure only`;
});

check("[S]", "every team prompt on the page is composed by buildTeamPrompt", () => {
  assert(TEAMS.length === 7, `expected 7 teams, got ${TEAMS.length}`);
  assert(teamPromptsData.specs === teamSpecs && teamSpecs.length === 15, "the Team prompts page does not carry the 15 derived specs");
  assert(!specs.some((s) => /^pl-team-/.test(s.id) && !/illustrations/.test(s.id)), "a Teams text spec leaked back into the library");
  let n = 0;
  for (const set of TASK_SETS) {
    const team = TEAMS.find((t) => t.id === set.team);
    assert(team, `task set ${set.id} has no team`);
    const spec = teamSpecs.find((s) => s.id === set.id);
    assert(spec, `task set ${set.id} is not on the page`);
    for (const [name, task] of Object.entries(set.tasks)) {
      assert(spec[name] && spec[name].pre, `${set.id} is missing the rendered "${name}"`);
      assert(spec[name].pre === buildTeamPrompt(team, name, task), `${set.id} / ${name} does not match the assembler`);
      n++;
    }
    const role = teamSpecs.find((s) => s.id === team.id);
    assert(role && role["Copy-paste system prompt"].pre === buildTeamSystemPrompt(team), `${team.id} system prompt does not match the assembler`);
  }
  assert(n === 44, `expected 44 task prompts, got ${n}`);
  return `${n} task prompts and ${TEAMS.length} system prompts composed from 7 roles`;
});

check("[C]", "editing one team principle still reaches every task prompt for that role", () => {
  const team = TEAMS.find((t) => t.id === "pl-team-last-mile");
  assert(team && team.principles.length, "last-mile role or its principles went missing");
  const p = team.principles[0].replace(/\s*\[\d+\](?:\[\d+\])*/g, "");
  const reach = teamBlocks.filter((b) => b.pre.includes(p)).length;
  const set = TASK_SETS.find((s) => s.team === team.id);
  const expected = Object.keys(set.tasks).length + 1;
  assert(reach === expected, `a last-mile principle reaches ${reach} prompts, expected ${expected}`);
  return `one last-mile principle appears in ${reach} rendered prompts, edited in 1 place`;
});

check("[C]", "no citation number leaks into a team prompt", () => {
  assert(teamBlocks.length === 51, `expected 51 team blocks, got ${teamBlocks.length}`);
  const leaks = teamBlocks.filter((b) => /\[\d+\]/.test(b.pre));
  assert(!leaks.length, `citations leak in ${leaks.map((b) => b.id).join(", ")}`);
  return `${teamBlocks.length} team blocks, none carrying a "[n]" marker`;
});

check("[C]", "every team illustration is composed by the recipe from its source icon system, none stored", () => {
  const TI = specs.filter((s) => s.group === "Team illustrations");
  assert(TI.length === 22, `expected 22 team-illustration specs, got ${TI.length}`);
  const line = specs.find((s) => s.id === "pl-portfolio-line-icons-system")["Copy-paste template"].pre.split("\n")[0];
  const glass = specs.find((s) => s.id === "pl-zepto-premium-glass-icons")["Growth"].pre;
  const glassTail = glass.slice(glass.indexOf(" Model the hero object"), glass.indexOf(" Model the hero object") + 120);
  const by = (id) => Object.values(TI.find((s) => s.id === id)).filter((v) => v && v.pre).map((v) => v.pre);
  let n = 0;
  for (const style of ["line", "flat", "glass", "toy", "zepto", "dreamy", "lego"]) {
    const objects = by(`pl-team-illustrations-${style}-objects`);
    const chars = by(`pl-team-illustrations-${style}-characters`);
    const scenes = by(`pl-team-illustrations-${style}-scenes`);
    assert(objects.length === 7 && chars.length === 21 && scenes.length === 5, `${style}: expected 7 objects, 21 characters and 5 scenes, got ${objects.length}/${chars.length}/${scenes.length}`);
    for (const p of [...objects, ...chars, ...scenes]) {
      n++;
      // the catalogs ship the FULL register (post-mortem 2026-09-04): the proven Away
      // prompts run about 2,000 characters and the target models have no 1,000 cap
      assert(p.includes(LIBRARY_RULES), `${style}: a catalog prompt is missing the full rules`);
      assert(!p.includes(LIBRARY_RULES_COMPACT), `${style}: the compact register leaked back onto the page`);
    }
    if (style === "line" || style === "flat") assert(objects.every((p) => p.startsWith(line)), `${style}: a prompt does not open on the line-icon constant`);
  }
  // the FULL register still carries the source constants verbatim
  const { teamRecipe } = TEAM_ILLO;
  const fullGlass = teamRecipe.compose({ team: "last-mile", mode: "object", style: "glass", length: "full" });
  assert(fullGlass.includes(glassTail), "the full glass prompt does not carry the Zepto glass constant");
  const toyTemplate = specs.find((s) => s.id === "pl-away-icons-system")["Copy-paste template"].pre;
  const toyCore = toyTemplate.slice(toyTemplate.indexOf("Rendered as a clean"), toyTemplate.indexOf("Plain off-white"));
  assert(toyCore.length > 800, "the Away toy template moved; the extractor found nothing to compare");
  const fullToy = teamRecipe.compose({ team: "last-mile", mode: "object", style: "toy", length: "full" });
  assert(fullToy.includes(toyCore), "the full toy prompt does not carry the Away toy constant verbatim");
  // character prompts carry ONE figure clause and never the set-level variety note
  const charGlass = teamRecipe.compose({ team: "last-mile", mode: "character", character: "rider", style: "glass", length: "full" });
  assert(TEAM_ILLO.FIGURE_CLAUSE.glass && charGlass.includes(TEAM_ILLO.FIGURE_CLAUSE.glass), "a character prompt lacks its figure clause");
  assert(TEAM_ILLO.VARIETY && !charGlass.includes(TEAM_ILLO.VARIETY), "a single-image prompt carries the set-level variety clause");
  return `${n} catalog prompts (objects, characters and scenes) composed from one recipe over 7 looks, full register, one subject definition each`;
});

// ---------------------------------------------------------------- image rules
check("[S]", "the image rules are declared exactly once", () => {
  const NEEDLE = "Strip all branding";
  const offenders = [];
  let inRules = 0;
  for (const f of files) {
    const t = fs.readFileSync(f, "utf8");
    const n = t.split(NEEDLE).length - 1;
    if (!n) continue;
    if (path.basename(f) === "rules.js") inRules = n;
    else offenders.push(`${rel(f)} (${n})`);
  }
  assert(inRules === 1, `rules.js declares it ${inRules} times, expected 1`);
  assert(!offenders.length, `restated outside rules.js: ${offenders.join(", ")}`);
  return "one constant, in rules.js";
});

check("[S]", "and it still reaches every image prompt", () => {
  const carrying = blocks.filter((b) => b.pre.includes(LIBRARY_RULES));
  assert(carrying.length >= 176, `only ${carrying.length} rendered blocks carry the rules, expected 176+`);
  return `${carrying.length} rendered blocks carry the rules`;
});

check("[C]", "no older wording of the rules leaked back in", () => {
  const OLD = [
    "No text, letters, numbers or labels of any kind; strip all branding",
    "No text, letters or numbers anywhere in the image. Strip all branding: no logos, wordmarks or brand marks.",
    "No text, letters or numbers of any kind anywhere in the image;",
  ];
  assert(blocks.length > 0, "extractor found no blocks");
  const bad = blocks.filter((b) => OLD.some((o) => b.pre.includes(o)));
  assert(!bad.length, `stale rule wording in: ${[...new Set(bad.map((b) => b.id))].join(", ")}`);
  return `${blocks.length} blocks on one wording`;
});

// ---------------------------------------------------------------- recipe
check("[C]", "the fleet roster is derived from the recipe, not stored", () => {
  assert(AIRCRAFT.length > 0, "the aircraft roster is empty");
  const fleet = specs.find((s) => s.id === "pl-airplane-views-fleet");
  assert(fleet, "the fleet spec went missing");
  const listed = FLEET_GROUPS.reduce((n, g) => n + (fleet[g] || []).length, 0);
  assert(
    listed === AIRCRAFT.length,
    `the page lists ${listed} aircraft, the recipe has ${AIRCRAFT.length}`
  );
  return `${listed} families, in step with airplaneViews.js`;
});

check("[C]", "every 3D faces prompt is composed by the recipe, none stored", () => {
  const { faces3dRecipe: r, ANGLES, EXPRESSIONS, BACKDROPS, STYLES } = FACES;
  // the whole combination space, so a block that drifted by one clause cannot match.
  // Both registers: the written-out catalogs ship compact, the picker offers full too.
  const space = new Set();
  for (const st of STYLES)
    for (const a of ANGLES)
      for (const e of EXPRESSIONS)
        for (const b of BACKDROPS)
          for (const subject of ["photo", "text"])
            for (const length of ["full", "compact"])
              space.add(
                r.compose({ style: st.key, angle: a.key, expression: e.key, backdrop: b.key, subject, length })
              );
  const mine = blocks.filter((b) => /^pl-3d-faces-/.test(b.id) && b.id !== "pl-3d-faces-system");
  // 30 = 5 materials x 6 angles, plus the 7 written-out expressions (2026-08-15).
  assert(mine.length === 37, `expected 37 composed blocks, found ${mine.length}`);
  const stray = mine.filter((b) => !space.has(b.pre));
  assert(!stray.length, `not composable from the recipe: ${[...new Set(stray.map((b) => b.id))].join(", ")}`);
  // and the prose file must hold no prompt text of its own
  const proseData = fs.readFileSync(path.join(LIB, "image/faces3d.data.js"), "utf8");
  assert(!/"?pre"?\s*:/.test(proseData), "faces3d.data.js has grown a frozen prompt block");
  return `${mine.length} blocks, all from a ${space.size}-combination recipe`;
});

check("[C]", "the 3D faces group carries the rules plus its own prohibition", () => {
  const mine = blocks.filter((b) => /^pl-3d-faces-/.test(b.id));
  assert(mine.length === 38, `expected 38 blocks in the group, found ${mine.length}`);
  // Full register carries the canonical rules plus the full prohibition; compact
  // carries the one-sentence rules plus the compact prohibition. Either counts.
  const bad = mine.filter(
    (b) =>
      !(b.pre.includes(FACES.EXTRA_RULE) && b.pre.includes("Strip all branding")) &&
      !(b.pre.includes(FACES.EXTRA_RULE_COMPACT) && b.pre.includes(LIBRARY_RULES_COMPACT))
  );
  assert(!bad.length, `missing the rules foot: ${[...new Set(bad.map((b) => b.id))].join(", ")}`);
  return `${mine.length} blocks end on the rules and the no-plinth rule`;
});

check("[C]", "every Zepto campaign tile is composed by the recipe, none stored", () => {
  const { zeptoCampaignRecipe: r, STYLES, SUBJECTS, COLORWAYS, REFERENCES, COMPACT_LIMIT } = CAMPAIGN;
  const space = new Set();
  let overBudget = 0;
  for (const st of STYLES)
    for (const s of SUBJECTS)
      for (const c of COLORWAYS)
        for (const ref of REFERENCES)
          for (const length of ["full", "compact"]) {
            const p = r.compose({ style: st.key, subject: s.key, colorway: c.key, reference: ref.key, length });
            space.add(p);
            if (length === "compact" && p.length > COMPACT_LIMIT) overBudget++;
          }
  assert(space.size > 300, `combination space suspiciously small: ${space.size}`);
  // the compact register's whole point is fitting Figma's observed prompt cap
  assert(overBudget === 0, `${overBudget} compact combinations exceed ${COMPACT_LIMIT} characters`);
  const mine = blocks.filter((b) => /^pl-zepto-campaign-/.test(b.id) && b.id !== "pl-zepto-campaign-system");
  assert(mine.length === 6, `expected 6 composed tile blocks, found ${mine.length}`);
  const stray = mine.filter((b) => !space.has(b.pre));
  assert(!stray.length, `not composable from the recipe: ${[...new Set(stray.map((b) => b.id))].join(", ")}`);
  const badRules = mine.filter(
    (b) => !b.pre.includes(LIBRARY_RULES_COMPACT) || !b.pre.includes(CAMPAIGN.EXTRA_RULE_COMPACT)
  );
  assert(!badRules.length, `missing the rules foot: ${[...new Set(badRules.map((b) => b.id))].join(", ")}`);
  // and the prose file must hold no prompt text of its own
  const proseData = fs.readFileSync(path.join(LIB, "image/zeptoCampaign.data.js"), "utf8");
  assert(!/"?pre"?\s*:/.test(proseData), "zeptoCampaign.data.js has grown a frozen prompt block");
  return `${mine.length} tiles, all from a ${space.size}-combination recipe, every compact under ${COMPACT_LIMIT}`;
});

check("[C]", "every Schedule images still is composed by the recipe, none stored", () => {
  const { scheduleImagesRecipe: r, SCENES, ANGLES, PEOPLE, OBJECT_SCENES, COLORWAYS, REFERENCES, OBJECTS, OBJECT_GROUPS, COMPACT_LIMIT } = SCHEDULE;
  // every object group names real objects, three of them, no repeats
  for (const g of OBJECT_GROUPS) {
    assert(g.objects.length === 3, `group ${g.key} is not a trio`);
    assert(new Set(g.objects).size === 3, `group ${g.key} repeats an object`);
    for (const k of g.objects) assert(OBJECTS.some((o) => o.key === k), `group ${g.key} names unknown object ${k}`);
  }
  const space = new Set();
  let overBudget = 0;
  // objects: none, and the MAX_OBJECTS longest compact words (the worst case for the cap)
  const longest3 = [...OBJECTS].sort((x, y) => y.short.length - x.short.length).slice(0, SCHEDULE.MAX_OBJECTS).map((o) => o.key);
  for (const sc of SCENES)
    for (const a of ANGLES)
      for (const pp of PEOPLE)
      for (const os of pp.key === "none" ? OBJECT_SCENES : [OBJECT_SCENES[0]])
      for (const c of COLORWAYS)
        for (const ref of REFERENCES)
          for (const objects of [[], longest3])
          for (const length of ["full", "compact"]) {
            const p = r.compose({ scene: sc.key, objectScene: os.key, angle: a.key, people: pp.key, colorway: c.key, reference: ref.key, objects, length });
            space.add(p);
            if (length === "compact" && p.length > COMPACT_LIMIT) overBudget++;
            // the system's one hard rule: no face
            assert(/No face in|Nobody in (the )?frame/.test(p), `a still lost the no-face clause: ${sc.key}/${a.key}/${pp.key}`);
          }
  assert(overBudget === 0, `${overBudget} compact combinations exceed ${COMPACT_LIMIT} characters`);
  const mine = blocks.filter((b) => /^pl-schedule-images-/.test(b.id) && b.id !== "pl-schedule-images-system");
  // the page renders the picker alone (HIDE_PROSE in scheduleImages.js); the
  // catalog and template are hidden, so no composed blocks are expected on the page
  assert(mine.length === 0, `expected 0 rendered scene blocks while HIDE_PROSE is on, found ${mine.length}`);
  const stray = mine.filter((b) => !space.has(b.pre));
  assert(!stray.length, `not composable from the recipe: ${[...new Set(stray.map((b) => b.id))].join(", ")}`);
  const proseData = fs.readFileSync(path.join(LIB, "image/scheduleImages.data.js"), "utf8");
  assert(!/"?pre"?\s*:/.test(proseData), "scheduleImages.data.js has grown a frozen prompt block");
  return `${SCENES.length} scenes composed from a ${space.size}-combination recipe, every compact under ${COMPACT_LIMIT}, every still faceless, picker-only on the page`;
});

check("[C]", "every Schedule POV still is composed by the recipe and follows a reference", () => {
  const { schedulePovRecipe: r, MOMENTS, REFERENCES, COMPACT_LIMIT, USE: USE_LINE } = POV;
  assert(MOMENTS.length === 6, `expected the six moments, got ${MOMENTS.length}`);
  // v2 rule: each moment follows one of Agam's reference images. Moments MAY share
  // a reference (v2.1: forcing all six to be used put a second person in the gift
  // frame and a styled set in the meeting frame).
  const refs = MOMENTS.map((m) => m.ref);
  assert(refs.every((x) => /^[A-F]$/.test(x)), `a moment names no reference: ${refs.join(",")}`);
  let n = 0;
  for (const m of MOMENTS)
    for (const ref of REFERENCES) {
      const p = r.compose({ moment: m.key, reference: ref.key, length: "compact" });
      n++;
      assert(p.length <= COMPACT_LIMIT, `${m.key}/${ref.key} is ${p.length} characters, over ${COMPACT_LIMIT}`);
      assert(p.includes(m.camera) && p.includes(m.setting), `${m.key} lost its camera or setting clause`);
      // guard against v1's carry-over coming back
      assert(!/no face|black screen|electric violet|golden-bazaar|each source its own colour/i.test(p), `${m.key} carries a Schedule images clause again`);
      // v2.1 guards: candid, not a set; no second person Agam did not ask for
      assert(!/stylised|symmetrical|solid red|parallel to the frame|squared neatly/i.test(p), `${m.key} reads as a styled set again`);
      assert(!/\bfriend\b|companion/i.test(p), `${m.key} puts a second person in frame`);
      // v2.2 guard: the person is about to order groceries, so no frame shows
      // groceries or a shopping bag already in hand (the use line's "grocery
      // delivery app" is the only allowed mention).
      const body = p.replace(USE_LINE, "");
      assert(!/cloth bag|shopping bag|tote|grocer|carrier bag|kirana bag/i.test(body), `${m.key} shows shopping already done`);
    }
  const mine = blocks.filter((b) => /^pl-schedule-pov-/.test(b.id) && b.id !== "pl-schedule-pov-system");
  assert(mine.length === 0, `expected 0 rendered moment blocks while HIDE_PROSE is on, found ${mine.length}`);
  const proseData = fs.readFileSync(path.join(LIB, "image/schedulePov.data.js"), "utf8");
  assert(!/"?pre"?\s*:/.test(proseData), "schedulePov.data.js has grown a frozen prompt block");
  return `${MOMENTS.length} moments on references ${refs.join("")}, ${n} prompts composed, every one under ${COMPACT_LIMIT}, candid and with no added person`;
});

check("[C]", "the old import path still resolves", () => {
  const shim = fs.readFileSync(path.join(ROOT, "src/prd/promptLibraryData.js"), "utf8");
  assert(shim.includes("promptLibrary/index.js"), "the shim no longer points at the library");
  assert(shim.length < 1200, "the shim has grown data again; it should only re-export");
  return "parallel sessions importing the old path keep working";
});

check("[C]", "no em-dash or tilde in the pages own framing copy", () => {
  // Scoped to what this refactor authored. The ported prompt text deliberately keeps
  // the source's punctuation, one Away voice rule is literally about em-dashes.
  const mine = [
    "index.js", "rules.js", "voice/index.js", "voice/buildPrompt.js",
    "image/index.js", "image/recipe.js", "image/airplanes.js",
    "image/zeptoCampaignViews.js", "image/zeptoCampaign.js", "image/zeptoCampaign.data.js",
    "image/scheduleImagesViews.js", "image/scheduleImages.js", "image/scheduleImages.data.js",
    "teams/index.js", "teams/buildPrompt.js", "teams/teams.data.js", "teams/tasks.data.js",
  ];
  let scanned = 0;
  for (const f of mine) {
    const p = path.join(LIB, f);
    assert(fs.existsSync(p), `${f} is missing`);
    const t = fs.readFileSync(p, "utf8");
    scanned += t.length;
    assert(!/[—~]/.test(t), `${f} contains an em-dash or tilde`);
  }
  assert(scanned > 5000, "scanned suspiciously little text");
  return `${mine.length} authored files clean`;
});

// ---------------------------------------------------------------- report
const pass = results.filter((r) => r.ok);
const fail = results.filter((r) => !r.ok);
for (const r of results) {
  console.log(`${r.ok ? "PASS" : "FAIL"} ${r.tag} ${r.name}${r.detail ? `\n       ${r.detail}` : ""}`);
}
console.log(`\n${pass.length} passed, ${fail.length} failed`);
process.exit(fail.length ? 1 : 0);
