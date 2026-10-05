#!/usr/bin/env node
// Push the portfolio motion tokens (tools/figma-motion/motion-tokens.json,
// mirrored from src/index.css) into the Figma file that is the ACTIVE tab of
// the Figma desktop app, via its local MCP server (see desktop-mcp.mjs).
//
// STATUS 2026-09-15: Figma desktop 126.8 no longer runs a local server (nothing
// on 3845; its MCP panel hands out https://mcp.figma.com/mcp). The four code
// blocks below were executed verbatim through the connected cloud Figma MCP
// (use_figma) instead, signed in as the file owner, and built collection
// "Motion" (VariableCollectionId:827:5309) plus section "Motion tokens"
// (827:32790) on page All Case Studies. Keep the blocks as the source of what
// is in the file; rerun them through whichever server has edit access.
//
// Facts learned building it (already applied below):
//   - figma.createAutoLayout() frames default to a WHITE fill: clear `fills`
//     on every container or the dark sheet hides its own light text.
//   - A FLOAT variable cannot be bound to text `characters` (API throws
//     "resolved type 'FLOAT' cannot be bound to 'characters'"); only the
//     STRING easing values are live-bound, the number rows are static text.
//   - Draw the bezier previews with createNodeFromSvg; setting vectorPaths and
//     then moving the vector skews the path.
//
//   node tools/figma-motion/push-motion-tokens.mjs            # variables + token sheet
//   node tools/figma-motion/push-motion-tokens.mjs --vars     # variables only
//   node tools/figma-motion/push-motion-tokens.mjs --sheet    # sheet only
//   node tools/figma-motion/push-motion-tokens.mjs --replace  # rebuild the sheet section
//   node tools/figma-motion/push-motion-tokens.mjs --tools    # list the server's tools
//
// What it builds
//   1. A local variable collection "Motion" (one mode, "Value"): STRING
//      variables for easing curves (the CSS cubic-bezier string, since Figma has
//      no bezier value type) and FLOAT variables for durations (ms), staggers,
//      holds, scalars and spring configs. Every variable's description carries
//      its role and the CSS custom property it mirrors. Re-runs update in place.
//   2. A "Motion tokens" section on the target page: one dark 1512-wide sheet,
//      grouped like the JSON, every value text bound to its variable, and a
//      drawn curve preview beside each easing.

import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { connect } from "./desktop-mcp.mjs";

const here = dirname(fileURLToPath(import.meta.url));
const spec = JSON.parse(readFileSync(join(here, "motion-tokens.json"), "utf8"));
const args = new Set(process.argv.slice(2));
const PAGE_ID = process.env.FIGMA_PAGE_ID || "173:34508"; // Portfolio 2026 > All Case Studies
const SHEET_X = Number(process.env.SHEET_X ?? -8544);
const SHEET_Y = Number(process.env.SHEET_Y ?? 800);
const TOOL = process.env.FIGMA_EXEC_TOOL || "use_figma";

const mcp = await connect();

if (args.has("--tools")) {
  for (const t of await mcp.listTools()) console.log(`- ${t.name}`);
  process.exit(0);
}

async function run(description, code) {
  const res = await mcp.call(TOOL, { code, description, skillNames: "figma-use" });
  const text = (res.content || []).map((c) => c.text || "").join("\n");
  if (res.isError) throw new Error(`${description}: ${text}`);
  let parsed;
  try {
    parsed = JSON.parse(text);
  } catch {
    parsed = text;
  }
  // the server wraps the script's return value; unwrap the common shapes
  if (parsed && typeof parsed === "object" && "result" in parsed) parsed = parsed.result;
  console.error(`ok  ${description}`);
  return parsed;
}

const doVars = !args.has("--sheet");
const doSheet = !args.has("--vars");

// ---------------------------------------------------------------- variables
if (doVars) {
  const out = await run(
    "Create or update the Motion variable collection",
    `
const spec = ${JSON.stringify(spec)};
const cols = await figma.variables.getLocalVariableCollectionsAsync();
let col = cols.find(c => c.name === spec.collection);
if (!col) col = figma.variables.createVariableCollection(spec.collection);
const modeId = col.modes[0].modeId;
if (col.modes[0].name !== "Value") col.renameMode(modeId, "Value");
const existing = {};
for (const id of col.variableIds) { const v = await figma.variables.getVariableByIdAsync(id); if (v) existing[v.name] = v; }
const byName = {};
const created = [], updated = [], errors = [];
const setScopes = (v, list) => { try { v.scopes = list; } catch (e) { try { v.scopes = []; } catch (e2) { errors.push(v.name + ": " + e2.message); } } };
// pass 1: concrete values
for (const g of spec.groups) for (const t of g.tokens) {
  let v = existing[t.name];
  if (!v) { v = figma.variables.createVariable(t.name, col, g.kind); created.push(t.name); } else updated.push(t.name);
  byName[t.name] = v;
  v.description = t.role + (g.unit ? " Unit: " + g.unit + "." : "") + " CSS: " + t.css;
  setScopes(v, ["TEXT_CONTENT"]);
  if (!t.alias) v.setValueForMode(modeId, t.value);
}
// pass 2: aliases
for (const g of spec.groups) for (const t of g.tokens) if (t.alias) {
  const target = byName[t.alias];
  if (target) byName[t.name].setValueForMode(modeId, figma.variables.createVariableAlias(target));
}
return { collectionId: col.id, created, updated, errors, total: col.variableIds.length };
`,
  );
  console.log(JSON.stringify(out));
}

// -------------------------------------------------------------------- sheet
if (doSheet) {
  const replace = args.has("--replace");
  const shell = await run(
    "Create the Motion tokens section and sheet shell on the target page",
    `
const page = await figma.getNodeByIdAsync(${JSON.stringify(PAGE_ID)});
if (!page || page.type !== "PAGE") throw new Error("page not found: " + ${JSON.stringify(PAGE_ID)});
await figma.setCurrentPageAsync(page);
const old = page.children.filter(n => n.type === "SECTION" && n.name === "Motion tokens");
if (old.length && !${replace}) return { existing: old.map(n => n.id), note: "section exists; rerun with --replace" };
for (const n of old) n.remove();
await figma.loadFontAsync({ family: "Inter", style: "Regular" });
await figma.loadFontAsync({ family: "Inter", style: "Medium" });
await figma.loadFontAsync({ family: "Inter", style: "Semi Bold" });
const section = figma.createSection();
section.name = "Motion tokens";
section.x = ${SHEET_X}; section.y = ${SHEET_Y};
section.fills = [{ type: "SOLID", color: { r: 0.04, g: 0.04, b: 0.05 } }];
page.appendChild(section);
const sheet = figma.createAutoLayout("VERTICAL", { name: "Motion tokens sheet", itemSpacing: 56 });
sheet.paddingTop = 96; sheet.paddingBottom = 96; sheet.paddingLeft = 96; sheet.paddingRight = 96;
sheet.fills = [{ type: "SOLID", color: { r: 0.039, g: 0.043, b: 0.055 } }];
sheet.cornerRadius = 0;
section.appendChild(sheet);
sheet.x = 0; sheet.y = 0;
sheet.resize(1512, sheet.height);
sheet.layoutSizingHorizontal = "FIXED";
sheet.layoutSizingVertical = "HUG";
const head = figma.createAutoLayout("VERTICAL", { name: "Header", itemSpacing: 16 });
sheet.appendChild(head); head.layoutSizingHorizontal = "FILL"; head.fills = [];
const eyebrow = figma.createText(); eyebrow.characters = "PORTFOLIO 2026 · MOTION SYSTEM"; eyebrow.fontName = { family: "Inter", style: "Medium" }; eyebrow.fontSize = 13; eyebrow.letterSpacing = { unit: "PERCENT", value: 8 }; eyebrow.fills = [{ type: "SOLID", color: { r: 0.6, g: 0.62, b: 0.68 } }];
const title = figma.createText(); title.characters = "Motion tokens"; title.fontName = { family: "Inter", style: "Medium" }; title.fontSize = 56; title.letterSpacing = { unit: "PERCENT", value: -2 }; title.fills = [{ type: "SOLID", color: { r: 0.97, g: 0.97, b: 0.98 } }];
const sub = figma.createText(); sub.characters = "Two clocks, routed by scope. The M3 interaction clock (spatial curves overshoot, effects curves stay flat, 150 to 750 ms) governs every working surface. The consumer reveal clock (cine curves never overshoot, 600 to 1800 ms, real holds) governs named hero beats only. Never mix the two inside one element. Mirrors src/index.css :root; the CSS is the source of truth."; sub.fontName = { family: "Inter", style: "Regular" }; sub.fontSize = 18; sub.lineHeight = { unit: "PERCENT", value: 150 }; sub.fills = [{ type: "SOLID", color: { r: 0.66, g: 0.68, b: 0.73 } }];
for (const t of [eyebrow, title, sub]) { head.appendChild(t); t.layoutSizingHorizontal = "FILL"; t.textAutoResize = "HEIGHT"; }
sub.resize(1000, sub.height); sub.layoutSizingHorizontal = "FIXED";
return { sectionId: section.id, sheetId: sheet.id };
`,
  );
  console.log(JSON.stringify(shell));
  if (!shell || !shell.sheetId) process.exit(0);

  for (const g of spec.groups) {
    const out = await run(
      `Add the "${g.name}" group to the sheet`,
      `
const g = ${JSON.stringify(g)};
const sheet = await figma.getNodeByIdAsync(${JSON.stringify(shell.sheetId)});
const page = sheet.parent.parent; await figma.setCurrentPageAsync(page);
await figma.loadFontAsync({ family: "Inter", style: "Regular" });
await figma.loadFontAsync({ family: "Inter", style: "Medium" });
await figma.loadFontAsync({ family: "Inter", style: "Semi Bold" });
const cols = await figma.variables.getLocalVariableCollectionsAsync();
const col = cols.find(c => c.name === ${JSON.stringify(spec.collection)});
const vars = {};
if (col) for (const id of col.variableIds) { const v = await figma.variables.getVariableByIdAsync(id); if (v) vars[v.name] = v; }
const ink = { r: 0.97, g: 0.97, b: 0.98 }, mute = { r: 0.62, g: 0.64, b: 0.7 }, line = { r: 0.16, g: 0.17, b: 0.2 };
const accent = { r: 0.71, g: 0.55, b: 1 };
const text = (chars, style, size, color, opts = {}) => { const t = figma.createText(); t.fontName = { family: "Inter", style }; t.fontSize = size; t.characters = chars; t.fills = [{ type: "SOLID", color }]; if (opts.ls) t.letterSpacing = { unit: "PERCENT", value: opts.ls }; if (opts.lh) t.lineHeight = { unit: "PERCENT", value: opts.lh }; return t; };
const group = figma.createAutoLayout("VERTICAL", { name: "Group / " + g.name, itemSpacing: 0 });
sheet.appendChild(group); group.layoutSizingHorizontal = "FILL"; group.fills = [];
const gh = figma.createAutoLayout("VERTICAL", { name: "Group header", itemSpacing: 8 });
gh.paddingBottom = 20; group.appendChild(gh); gh.layoutSizingHorizontal = "FILL"; gh.fills = [];
const labels = { ease: "Easing", duration: "Duration", stagger: "Stagger", hold: "Hold", scalar: "Scalar", spring: "Spring" };
const gt = text(labels[g.name] || g.name, "Medium", 28, ink, { ls: -1 }); gh.appendChild(gt); gt.layoutSizingHorizontal = "FILL";
if (g.note) { const gn = text(g.note + (g.unit ? "  ·  unit " + g.unit : ""), "Regular", 15, mute, { lh: 150 }); gh.appendChild(gn); gn.textAutoResize = "HEIGHT"; gn.layoutSizingHorizontal = "FILL"; }
const ids = [];
const curvePreview = (value) => {
  const m = value.match(/cubic-bezier\\(([^)]*)\\)/); if (!m) return null;
  const [x1, y1, x2, y2] = m[1].split(",").map(Number);
  const S = 40, f = n => (Math.round(n * 1000) / 1000).toString();
  const svg = '<svg xmlns="http://www.w3.org/2000/svg" width="' + S + '" height="' + S + '" viewBox="0 0 ' + S + ' ' + S + '" overflow="visible">'
    + '<path d="M0 ' + S + ' L' + S + ' 0" stroke="#292B33" stroke-width="1" fill="none"/>'
    + '<path d="M0 ' + S + ' C ' + f(x1 * S) + ' ' + f(S - y1 * S) + ' ' + f(x2 * S) + ' ' + f(S - y2 * S) + ' ' + S + ' 0" stroke="#B58CFF" stroke-width="2" stroke-linecap="round" fill="none"/></svg>';
  const box = figma.createNodeFromSvg(svg); box.name = "curve"; box.clipsContent = false; box.fills = []; box.resize(S, S);
  return box;
};
for (const t of g.tokens) {
  const row = figma.createAutoLayout("HORIZONTAL", { name: t.name, itemSpacing: 32 });
  row.paddingTop = 18; row.paddingBottom = 18; row.counterAxisAlignItems = "CENTER";
  row.strokes = [{ type: "SOLID", color: line }]; row.strokeWeight = 1; row.strokeAlign = "INSIDE"; row.strokeTopWeight = 1; row.strokeBottomWeight = 0; row.strokeLeftWeight = 0; row.strokeRightWeight = 0;
  group.appendChild(row); row.layoutSizingHorizontal = "FILL"; row.fills = [];
  if (g.kind === "STRING") { const cp = curvePreview(t.value); if (cp) row.appendChild(cp); }
  else { const sp = figma.createFrame(); sp.name = "spacer"; sp.resize(40, 40); sp.fills = []; row.appendChild(sp); }
  const name = text(t.name, "Medium", 17, ink); row.appendChild(name); name.resize(360, name.height); name.layoutSizingHorizontal = "FIXED"; name.textAutoResize = "HEIGHT";
  const valWrap = figma.createAutoLayout("HORIZONTAL", { name: "value", itemSpacing: 6 }); valWrap.counterAxisAlignItems = "BASELINE"; row.appendChild(valWrap); valWrap.fills = []; valWrap.resize(340, 24); valWrap.layoutSizingHorizontal = "FIXED"; valWrap.layoutSizingVertical = "HUG";
  const val = text(String(t.value), "Regular", 17, accent); valWrap.appendChild(val);
  if (g.kind === "STRING" && vars[t.name]) val.setBoundVariable("characters", vars[t.name]); // FLOAT cannot bind to characters
  if (g.unit) valWrap.appendChild(text(g.unit, "Regular", 15, mute));
  const role = text(t.role + "   " + t.css, "Regular", 15, mute, { lh: 145 }); row.appendChild(role); role.layoutSizingHorizontal = "FILL"; role.textAutoResize = "HEIGHT";
  ids.push(row.id);
}
return { groupId: group.id, rows: ids.length };
`,
    );
    console.log(JSON.stringify(out));
  }
  const fin = await run(
    "Fit the section to the sheet and report",
    `
const sheet = await figma.getNodeByIdAsync(${JSON.stringify(shell.sheetId)});
await figma.setCurrentPageAsync(sheet.parent.parent);
const section = sheet.parent;
section.resizeWithoutConstraints(sheet.width, sheet.height);
return { sectionId: section.id, width: sheet.width, height: sheet.height };
`,
  );
  console.log(JSON.stringify(fin));
}
