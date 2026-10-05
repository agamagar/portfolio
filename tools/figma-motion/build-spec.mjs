#!/usr/bin/env node
// Turn a Figma motion cohort + the node tree into a layer spec a component can
// render without anyone doing arithmetic by hand.
//
//   node tools/figma-motion/build-spec.mjs motion.json nodes.json 80:2601 > spec.json
//
// WHY THIS EXISTS. Percentages in CSS resolve against the PARENT, and a nested
// timeline has as many coordinate spaces as it has levels. Figma reports every
// box in absolute page coordinates and every positional keyframe in the ROOT
// FRAME's pixels. Converting between those by hand put every layer of the first
// build in the wrong place — the card's contents were being sized against the
// frame instead of against the card.
//
// So: this reads both files, walks the tree once, and emits each animated node
// with
//   box   its rect as a percentage of its PARENT's rect
//   anim  its keyframes, with x/y turned into percentages of its OWN box
// which is exactly what `left/top/width/height` and motion's `x`/`y` mean.
//
// It deliberately does no rendering and picks no component library. The output
// is data; what consumes it is a separate decision.

import { readFileSync } from "node:fs";

const [motionPath, nodesPath, rootId] = process.argv.slice(2);
if (!motionPath || !nodesPath || !rootId) {
  console.error("usage: build-spec.mjs <motion.json> <nodes.json> <rootNodeId>");
  process.exit(1);
}

const motion = JSON.parse(readFileSync(motionPath, "utf8"));
const nodes = JSON.parse(readFileSync(nodesPath, "utf8"));

const root = nodes.nodes?.[rootId]?.document || nodes.nodes?.[rootId.replace("-", ":")]?.document;
if (!root) {
  console.error(`root ${rootId} not found in ${nodesPath}`);
  process.exit(1);
}

// Index every node by id, remembering its parent — the parent is the whole
// point — and whether anything ABOVE it is hidden.
//
// The visibility flag is not decoration. `get_motion_context` returns
// animations for hidden nodes, and the images API will export them on request,
// so a layer can arrive with keyframes, a box and a PNG and still not exist in
// the design. That is exactly how the Away build ended up rendering a greeting
// the reference video does not contain: the two text nodes were visible, their
// parent was not, and nothing in the motion data said so.
const byId = new Map();
(function walk(n, parent, hidden) {
  const h = hidden || n.visible === false;
  byId.set(n.id, { node: n, parent, hidden: h });
  for (const c of n.children || []) walk(c, n, h);
})(root, null, false);

const rect = (n) => n.absoluteBoundingBox || { x: 0, y: 0, width: 0, height: 0 };
const pct = (v, total) => (total ? +((v / total) * 100).toFixed(4) : 0);

// Figma hands motion back as a `motionDev` JSX STRING rather than data, so the
// numbers have to be lifted out of it. Parsing generated source is not lovely,
// but it is the only form the API offers and the shape is stable.
function parseMotionDev(src) {
  const grab = (re) => {
    const m = src.match(re);
    return m ? m[1] : null;
  };
  const initial = grab(/initial=\{\{([\s\S]*?)\}\}/);
  const animate = grab(/animate=\{\{([\s\S]*?)\}\}/);
  const transition = grab(/transition=\{\{([\s\S]*?)\}\}\s*\/>/);
  return { initial, animate, transition };
}

// Which properties are positional, and therefore need rescaling from the root
// frame's pixels to the element's own box.
const AXIS = { x: "width", y: "height" };

const layers = [];
for (const entry of motion.nodes || []) {
  const found = byId.get(entry.nodeId);
  if (!found) {
    layers.push({ id: entry.nodeId, warning: "not found in node tree" });
    continue;
  }
  const { node, parent, hidden } = found;
  const r = rect(node);
  const pr = parent ? rect(parent) : rect(root);

  const raw = entry.codeSnippets?.motionDev || "";
  const { initial, animate, transition } = parseMotionDev(raw);

  // Pull the positional keyframe arrays so the caller gets them already
  // converted. Everything else (opacity, filter, rotate) is unit-free or has its
  // own units and passes straight through.
  const rescaled = {};
  for (const [prop, dim] of Object.entries(AXIS)) {
    const arr = animate?.match(new RegExp(`\\b${prop}:\\s*\\[([^\\]]*)\\]`));
    if (!arr) continue;
    const nums = arr[1].split(",").map((s) => parseFloat(s.trim())).filter((n) => !Number.isNaN(n));
    if (!nums.length) continue;
    rescaled[prop] = nums.map((v) => `${pct(v, r[dim])}%`);
  }

  layers.push({
    id: node.id,
    name: node.name,
    type: node.type,
    parent: parent?.id ?? null,
    // TRUE means: do not build this. It animates, it exports, and it is not on
    // screen. Checked against every ancestor, not just the node itself.
    hidden,
    // the box, against the PARENT — drop these straight into left/top/width/height
    box: {
      left: pct(r.x - pr.x, pr.width),
      top: pct(r.y - pr.y, pr.height),
      width: pct(r.width, pr.width),
      height: pct(r.height, pr.height),
    },
    // the node's own size, for anything that needs to rescale against it later
    size: { w: r.width, h: r.height },
    // positional keyframes, already a share of this element's own box
    rescaled,
    // the untouched source, so nothing is lost in translation
    motionDev: raw,
    initial,
    animate,
    transition,
  });
}

const cohort = (motion.timelineCohorts || [])[0] || {};
process.stdout.write(
  JSON.stringify(
    {
      root: { id: root.id, name: root.name, w: rect(root).width, h: rect(root).height },
      durationMs: cohort.durationMs ?? null,
      loopMode: cohort.loopMode ?? null,
      count: layers.length,
      hiddenCount: layers.filter((l) => l.hidden).length,
      layers,
    },
    null,
    2,
  ) + "\n",
);
