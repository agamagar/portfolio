#!/usr/bin/env node
// Compile a fetched motion cohort + the REST node tree into a CHECK SPEC: a
// JSON the /motion-check page can evaluate at runtime against the LIVE build.
//
//   node check-spec.mjs specs/caratlane-motion.json specs/nodes-all.json 80:2601 \
//     > ../../src/hello/motion-checks/caratlane.check.json
//
// This is the other half of build-spec.mjs. That script turns Figma data into
// numbers a component can RENDER; this one turns the same data into curves a
// checker can EVALUATE - per animated property: keyframe values, times, and
// each segment's easing as data (keyword, bezier points, or spring constants),
// so the page can compute the exact expected value at any normalised time and
// hold the DOM to it.
//
// Eases become data, never code. The motionDev snippet carries Figma's spring
// as an arrow function; shipping that to the page as a string and eval()ing it
// would work and is not happening. The three constants are lifted instead.

import { readFileSync } from "node:fs";

const [motionPath, nodesPath, rootId] = process.argv.slice(2);
if (!motionPath || !nodesPath || !rootId) {
  console.error("usage: check-spec.mjs <motion.json> <nodes.json> <rootNodeId>");
  process.exit(1);
}

const motion = JSON.parse(readFileSync(motionPath, "utf8"));
const nodes = JSON.parse(readFileSync(nodesPath, "utf8"));

const rootDoc =
  nodes.nodes?.[rootId]?.document || nodes.nodes?.[rootId.replace("-", ":")]?.document;
if (!rootDoc) {
  console.error(`root ${rootId} not found in ${nodesPath}`);
  process.exit(1);
}

const byId = new Map();
(function walk(n, parent, hidden) {
  const h = hidden || n.visible === false;
  byId.set(n.id, { node: n, parent, hidden: h });
  for (const c of n.children || []) walk(c, n, h);
})(rootDoc, null, false);

const rect = (n) => n.absoluteBoundingBox || { x: 0, y: 0, width: 0, height: 0 };
const rootR = rect(rootDoc);
const pct = (v, total) => (total ? +((v / total) * 100).toFixed(4) : 0);

// ---- parsing the motionDev string --------------------------------------------

// Split a bracketed list on TOP-LEVEL commas only. boxShadow values carry
// commas and parens inside quoted strings; a naive split shreds them.
function splitTop(s) {
  const out = [];
  let depth = 0;
  let q = null;
  let cur = "";
  for (const ch of s) {
    if (q) {
      cur += ch;
      if (ch === q) q = null;
      continue;
    }
    if (ch === '"' || ch === "'") {
      q = ch;
      cur += ch;
      continue;
    }
    if (ch === "[" || ch === "(" || ch === "{") depth++;
    if (ch === "]" || ch === ")" || ch === "}") depth--;
    if (ch === "," && depth === 0) {
      out.push(cur.trim());
      cur = "";
      continue;
    }
    cur += ch;
  }
  if (cur.trim()) out.push(cur.trim());
  return out;
}

// Find `prop: [ ... ]` in src and return the bracketed body, bracket-matched.
function grabArray(src, prop) {
  const re = new RegExp(`(?:^|[,{\\s])${prop}:\\s*\\[`);
  const m = re.exec(src);
  if (!m) return null;
  let i = m.index + m[0].length;
  let depth = 1;
  let body = "";
  while (i < src.length && depth > 0) {
    const ch = src[i];
    if (ch === "[") depth++;
    if (ch === "]") depth--;
    if (depth > 0) body += ch;
    i++;
  }
  return body;
}

// Find `prop: { ... }` in src and return the braced body, brace-matched.
function grabObject(src, prop) {
  const re = new RegExp(`(?:^|[,{\\s])${prop}:\\s*\\{`);
  const m = re.exec(src);
  if (!m) return null;
  let i = m.index + m[0].length;
  let depth = 1;
  let body = "";
  while (i < src.length && depth > 0) {
    const ch = src[i];
    if (ch === "{") depth++;
    if (ch === "}") depth--;
    if (depth > 0) body += ch;
    i++;
  }
  return body;
}

function parseValue(raw) {
  const t = raw.trim();
  if (/^-?[\d.]+$/.test(t)) return +t;
  const q = t.match(/^"([\s\S]*)"$/) || t.match(/^'([\s\S]*)'$/);
  return q ? q[1] : t;
}

// One easing entry -> data. Handles keywords, bezier arrays, and the spring
// closed form 1 - e^(-at)(cos bt + c sin bt).
function parseEase(raw) {
  const t = raw.trim();
  const kw = t.match(/^"(linear|easeOut|easeIn|easeInOut)"$/);
  if (kw) return { type: kw[1] };
  if (t.startsWith("[")) {
    const nums = t
      .slice(1, -1)
      .split(",")
      .map((s) => parseFloat(s.trim()));
    if (nums.length === 4 && nums.every((n) => !Number.isNaN(n)))
      return { type: "bezier", pts: nums };
  }
  const spring = t.match(
    /Math\.exp\(-t \* ([\d.]+)\) \* \(Math\.cos\(t \* ([\d.]+)\) \+ ([\d.]+) \* Math\.sin/,
  );
  if (spring)
    return { type: "spring", a: +spring[1], b: +spring[2], c: +spring[3] };
  return { type: "unknown", src: t };
}

// The whole `ease:` value for a property: a single keyword applying to every
// segment, or a list with one entry per segment.
function parseEases(transBody, segments) {
  const single = transBody.match(/ease:\s*"(\w+)"/);
  const listBody = grabArray(transBody, "ease");
  let eases;
  if (listBody != null) eases = splitTop(listBody).map(parseEase);
  else if (single) eases = [{ type: single[1] }];
  else eases = [{ type: "linear" }];
  // one keyword for N segments means: that keyword, N times
  while (eases.length < segments) eases.push(eases[eases.length - 1]);
  return eases.slice(0, segments);
}

// Top-level motionDev attributes are JSX (`animate={{ ... }}`), not object
// entries - a different grab than the `opacity: { ... }` form inside them.
function grabAttr(src, name) {
  const m = new RegExp(`${name}=\\{\\{`).exec(src);
  if (!m) return null;
  let i = m.index + m[0].length;
  let depth = 2;
  let body = "";
  while (i < src.length && depth > 1) {
    const ch = src[i];
    if (ch === "{") depth++;
    if (ch === "}") depth--;
    if (depth > 1) body += ch;
    i++;
  }
  return body;
}

function parseTracks(motionDev) {
  const animate = grabAttr(motionDev, "animate") || "";
  const transition = grabAttr(motionDev, "transition") || "";
  const tracks = [];
  // every `prop: [` in animate is a keyframed property
  const props = [...animate.matchAll(/(?:^|[,{\s])(\w+):\s*\[/g)].map((m) => m[1]);
  for (const prop of props) {
    const valuesBody = grabArray(animate, prop);
    if (valuesBody == null) continue;
    const values = splitTop(valuesBody).map(parseValue);
    const trans = grabObject(transition, prop);
    if (!trans) continue;
    const timesBody = grabArray(trans, "times");
    const times = timesBody
      ? splitTop(timesBody).map((s) => +s)
      : values.map((_, i) => i / (values.length - 1));
    const duration = +(trans.match(/duration:\s*([\d.]+)/)?.[1] ?? 2);
    tracks.push({
      prop,
      duration,
      times,
      values,
      eases: parseEases(trans, times.length - 1),
    });
  }
  return tracks;
}

// ---- join with geometry ------------------------------------------------------

const layers = [];
for (const entry of motion.nodes || []) {
  const motionDev = entry.codeSnippets?.motionDev || "";
  const found = byId.get(entry.nodeId);
  const base = {
    id: entry.nodeId,
    name: entry.nodeName,
    type: entry.nodeType,
    // "identical to <node>, reuse the same component" arrives with no keyframes
    alias: /reuse the same component/.test(motionDev) || undefined,
  };
  if (!found) {
    layers.push({ ...base, found: false });
    continue;
  }
  const { node, parent, hidden } = found;
  const r = rect(node);
  const pr = parent ? rect(parent) : rootR;
  layers.push({
    ...base,
    found: true,
    hidden,
    // both frames of reference: root-relative is what a flattened DOM measures,
    // parent-relative is what the nesting in the file says
    box: {
      left: pct(r.x - rootR.x, rootR.width),
      top: pct(r.y - rootR.y, rootR.height),
      width: pct(r.width, rootR.width),
      height: pct(r.height, rootR.height),
    },
    parentBox: {
      left: pct(r.x - pr.x, pr.width),
      top: pct(r.y - pr.y, pr.height),
      width: pct(r.width, pr.width),
      height: pct(r.height, pr.height),
    },
    size: { w: r.width, h: r.height },
    tracks: parseTracks(motionDev),
  });
}

const cohort = (motion.timelineCohorts || [])[0] || {};
// a single-node timeline (the Toppr strip) has no cohort; its duration lives
// in the one track
const durationMs =
  cohort.durationMs ?? (layers[0]?.tracks?.[0]?.duration ?? 2) * 1000;

process.stdout.write(
  JSON.stringify(
    {
      root: { id: rootDoc.id, name: rootDoc.name, w: rootR.width, h: rootR.height },
      durationMs,
      loopMode: cohort.loopMode ?? "loop",
      notFound: layers.filter((l) => !l.found).map((l) => l.id),
      hiddenCount: layers.filter((l) => l.hidden).length,
      layers,
    },
    null,
    2,
  ) + "\n",
);
