#!/usr/bin/env node
// lookkeys.mjs: a look must work on a live menu switch. The engine's setLook()
// recomposes the params and calls every module's setLook(), but it rebuilds nothing:
// a key a module reads only while it BUILDS (a palette baked into a material, a
// geometry count) is honoured by a ?look= load and silently ignored by a switch, so
// the two would show different scenes. This check fails when a look's patch names a
// build-time path.
//
//   node tools/window-light/lookkeys.mjs            check every look
//   node tools/window-light/lookkeys.mjs cyberpunk  check one
//
// Exit 0 clean, 1 a look names a build-time path, 2 a usage error.
//
// The deny list is per look: the original three looks were tuned on ?look= loads
// before the live-switch rule existed and are listed here only when they are fixed.
// Cyberpunk (2026-10-05) must stay clean.

import { LOOKS, LOOK_NAMES } from "../../src/scene/window/looks.js";

// Paths read only at build time. A prefix denies everything under it; ALLOW lists
// the live exceptions inside a denied prefix.
const DENY = [
  "outside.bamboo", // bamboo.js bakes its palette into vertex colours and materials
  "outside.canopy", // farTrees.js canopy cards: palette, nightTint baked
  "outside.farTrees", // farTrees.js horizon trees: palette baked
  "outside.city.street.headLevel", // horizon.js street heads: baked into the head material
  "outside.city.street.headBloom",
  "outside.city.street.heads",
  "outside.city.street.poles", // the luminaires' positions are live (U.poles) but the poles' geometry is not
  "outside.city.street.arm",
  "outside.city.street.poleColor",
  // the horizon band (horizon.js): its geometry and its shape constants are built
  // once; the colours, the blocks, the haze, the glow and the windows are live
  // uniforms since F3 (horizon.js setUniforms)
  "outside.horizon",
  // the building (farTrees.js): only its lit windows' colours and level are live
  "outside.building",
  // rain (rain.js): the drop count, the box, the speeds and widths are baked
  "outside.rain",
];
const ALLOW = [
  "outside.horizon.blocks",
  "outside.horizon.blockTop",
  "outside.horizon.blockWide",
  "outside.horizon.blockColor",
  "outside.horizon.treeColor",
  "outside.horizon.glowFrom",
  "outside.horizon.glowDeg",
  "outside.horizon.glowOnSolid",
  "outside.horizon.haze",
  "outside.horizon.veilTint",
  "outside.horizon.windows.warm",
  "outside.horizon.windows.cool",
  "outside.horizon.windows.level",
  "outside.horizon.windows.bloom",
  "outside.horizon.windows.density",
  "outside.horizon.windows.amongTrees",
  "outside.horizon.windows.cellDeg",
  "outside.horizon.windows.size",
  "outside.building.lit.warm",
  "outside.building.lit.cool",
  "outside.building.lit.level",
  "outside.building.lit.coolShare",
  // (2026-10-06) the trims on the blocks (horizon.js setUniforms) and the building's
  // repaint (farTrees.js setPaint) are uniforms set every frame
  "outside.horizon.trim",
  "outside.horizon.murk", // outside.js sets U.murk from it every frame
  "outside.building.paint",
  "outside.rain.enabled",
  "outside.rain.radiance",
  "outside.rain.coverage",
  "outside.rain.lampGlint",
  "outside.rain.neon.share",
  "outside.rain.neon.gain",
];
// looks checked against the list (the others predate the rule)
const STRICT = new Set(["cyberpunk"]);

const isObj = (v) => v !== null && typeof v === "object" && !Array.isArray(v);
function leaves(o, pre = "", out = []) {
  for (const [k, v] of Object.entries(o)) {
    const p = pre ? `${pre}.${k}` : k;
    if (isObj(v)) leaves(v, p, out);
    else out.push(p);
  }
  return out;
}
const under = (p, root) => p === root || p.startsWith(root + ".");

const want = process.argv.slice(2);
for (const w of want) {
  if (!LOOK_NAMES.includes(w)) {
    console.error(`lookkeys: no look "${w}" (looks: ${LOOK_NAMES.join(", ")})`);
    process.exit(2);
  }
}
const names = want.length ? want : LOOK_NAMES.filter((n) => STRICT.has(n));
let bad = 0;
for (const name of names) {
  const hits = leaves(LOOKS[name] || {}).filter((p) => DENY.some((d) => under(p, d)) && !ALLOW.some((a) => under(p, a)));
  if (hits.length) {
    bad += hits.length;
    console.log(`FAIL ${name}: ${hits.length} build-time path(s) a live switch would ignore:`);
    for (const h of hits) console.log(`  ${h}`);
  } else console.log(`ok   ${name}: every path is live`);
}
process.exit(bad ? 1 : 0);
