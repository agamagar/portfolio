#!/usr/bin/env node
// Figma -> layer map helper.
//
// Pulls a frame's node tree from the Figma REST API and emits a flat list of
// named layers as frame-relative percentage boxes, ready to drop into a
// LayerMap (the annotation hotspot overlay for flat Figma-export figures).
//
// Why: a flat PNG plate (DesignFigure / SchedGtmReal / image:) has no inner DOM,
// so Agentation can only select the whole screen. This script reconstructs the
// real layer geometry from Figma so we can lay invisible, *named* hotspots over
// the plate and annotate sub-parts precisely.
//
// Usage:
//   node tools/figma-layers/extract.mjs <fileKey> <nodeId> [--depth N]
//        [--min-pct P] [--max-depth D] [--leaves] [--service NAME]
//
//   <fileKey>   Figma file key (e.g. Dz5kNdC3bOc2I44wdZfC6N)
//   <nodeId>    frame/node id, ':' or '-' form (e.g. 8450:71730 or 8450-71730)
//   --depth     how deep to fetch from the API          (default 4)
//   --max-depth only emit layers at/above this tree depth (default = --depth)
//   --min-pct   drop layers whose area < P% of the frame (default 0.6)
//   --leaves    only emit leaf nodes (no children)       (default off)
//   --service   keychain service for the PAT             (default: try
//               figma-pat-zep then figma-pat)
//
// The PAT is read from the macOS keychain via `security find-generic-password`.
// Output (stdout) is a JSON array: [{ name, type, depth, box: [x,y,w,h] }, ...]
// where box values are percentages of the root frame (0-100).

import { execFileSync } from "node:child_process";

function arg(flag, def) {
  const i = process.argv.indexOf(flag);
  if (i === -1) return def;
  // boolean flags (no following value) vs valued flags
  const next = process.argv[i + 1];
  if (next === undefined || next.startsWith("--")) return true;
  return next;
}

const [, , fileKey, nodeIdRaw] = process.argv;
if (!fileKey || !nodeIdRaw || fileKey.startsWith("--")) {
  console.error("usage: extract.mjs <fileKey> <nodeId> [--depth N] [--min-pct P] [--max-depth D] [--leaves] [--service NAME]");
  process.exit(1);
}
const nodeId = nodeIdRaw.replace("-", ":");
const fetchDepth = Number(arg("--depth", 4));
const maxDepth = Number(arg("--max-depth", fetchDepth));
const minPct = Number(arg("--min-pct", 0.6));
const leavesOnly = arg("--leaves", false) === true;
const service = arg("--service", null);

function readPat() {
  const services = service ? [service] : ["figma-pat-zep", "figma-pat"];
  for (const s of services) {
    try {
      const pat = execFileSync("security", ["find-generic-password", "-s", s, "-w"], {
        encoding: "utf8",
      }).trim();
      if (pat) return pat;
    } catch {
      /* try next */
    }
  }
  console.error("No Figma PAT found in keychain (tried: " + services.join(", ") + ")");
  process.exit(1);
}

const pat = readPat();
const url = `https://api.figma.com/v1/files/${fileKey}/nodes?ids=${encodeURIComponent(nodeId)}&depth=${fetchDepth}`;
const res = await fetch(url, { headers: { "X-Figma-Token": pat } });
if (!res.ok) {
  console.error(`Figma API ${res.status}: ${await res.text()}`);
  process.exit(1);
}
const data = await res.json();
const entry = data.nodes?.[nodeId];
if (!entry) {
  console.error(`node ${nodeId} not in response (keys: ${Object.keys(data.nodes || {}).join(", ")})`);
  process.exit(1);
}

const root = entry.document;
const frame = root.absoluteBoundingBox;
if (!frame) {
  console.error("root node has no absoluteBoundingBox");
  process.exit(1);
}

const round = (n) => Math.round(n * 100) / 100;
const out = [];

function walk(node, depth) {
  const bb = node.absoluteBoundingBox;
  const hasChildren = Array.isArray(node.children) && node.children.length > 0;
  if (bb && depth > 0 && node.visible !== false) {
    const box = [
      round(((bb.x - frame.x) / frame.width) * 100),
      round(((bb.y - frame.y) / frame.height) * 100),
      round((bb.width / frame.width) * 100),
      round((bb.height / frame.height) * 100),
    ];
    const areaPct = (box[2] * box[3]) / 100; // % of frame area
    const wantDepth = depth <= maxDepth;
    const wantLeaf = !leavesOnly || !hasChildren;
    if (wantDepth && wantLeaf && areaPct >= minPct) {
      out.push({ name: node.name, type: node.type, depth, box });
    }
  }
  if (hasChildren) for (const c of node.children) walk(c, depth + 1);
}

// children of the root are depth 1 (root itself is the frame, skipped)
for (const c of root.children || []) walk(c, 1);

console.log(JSON.stringify(out, null, 2));
