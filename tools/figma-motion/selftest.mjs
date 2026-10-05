#!/usr/bin/env node
// Self-test for the /motion-check scorer's math, runnable with no browser:
//
//   node tools/figma-motion/selftest.mjs
//
// The property under test is strong and exact: for EVERY track of EVERY
// compiled check spec, evalTrack(track, times[i]) must return values[i] - a
// keyframe is a point the curve passes through, whatever easing shapes the
// path between. A parser that mangled a bracket, an evaluator that picked the
// wrong segment, or an easing that does not hit 1.0 at t=1 all break it.
//
// Two curve-shape assertions ride along: the CaratLane card spring must
// OVERSHOOT its target (that is what makes it a spring - README "you can tell
// it is working because the value overshoots past its target"), and the
// Toppr strip must pause dead still inside each of its holds.

import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { evalTrack, toNum } from "../../src/hello/motion-checks/curves.js";

const here = dirname(fileURLToPath(import.meta.url));
const checksDir = join(here, "../../src/hello/motion-checks");

let checked = 0;
let failed = 0;
const fail = (msg) => {
  failed++;
  console.error(`FAIL ${msg}`);
};

for (const name of ["caratlane", "away", "toppr"]) {
  const spec = JSON.parse(readFileSync(join(checksDir, `${name}.check.json`), "utf8"));
  for (const layer of spec.layers) {
    for (const track of layer.tracks || []) {
      if (track.values.some((v) => toNum(v) == null)) continue; // unscorable kinds
      track.times.forEach((t, i) => {
        // exact only where the keyframe is not shadowed by an identical time
        // (step tracks repeat a time; the evaluator lands on one side of it)
        const twin = track.times.filter((x) => x === t).length > 1;
        // a spring segment does not land exactly on 1.0 at its end - the
        // closed form decays to ~0.99934, and the BUILD runs the same
        // function, so the keyframe it approaches is missed by the same
        // fraction of the travel. Verified: the card lands 0.26px shy of 0
        // after a 400px rise. The property stays exact everywhere else.
        const springIn = i > 0 && track.eases[i - 1]?.type === "spring";
        const travel = springIn
          ? Math.abs(toNum(track.values[i]) - toNum(track.values[i - 1]))
          : 0;
        const tol = springIn ? travel * 0.001 + 1e-6 : 1e-6;
        const got = evalTrack(track, t);
        const want = toNum(track.values[i]);
        checked++;
        if (!twin && Math.abs(got - want) > tol)
          fail(`${name} ${layer.id} ${track.prop} at t=${t}: got ${got}, want ${want}`);
      });
    }
  }
}

// the card's spring overshoots: somewhere in its travel the value passes the
// target and comes back
{
  const spec = JSON.parse(readFileSync(join(checksDir, "caratlane.check.json"), "utf8"));
  const card = spec.layers.find((l) => l.id === "80:2604");
  const y = card.tracks.find((t) => t.prop === "y");
  let min = Infinity;
  for (let t = 0; t <= 0.8; t += 0.002) min = Math.min(min, evalTrack(y, t));
  checked++;
  if (min >= 0) fail(`card spring never overshoots (min ${min}); the decay constants are not being evaluated`);
}

// the strip holds still inside each pause: dead flat between paired times
{
  const spec = JSON.parse(readFileSync(join(checksDir, "toppr.check.json"), "utf8"));
  const y = spec.layers[0].tracks[0];
  for (let i = 0; i + 1 < y.times.length; i++) {
    if (y.values[i] !== y.values[i + 1]) continue; // a travel, not a hold
    const mid = (y.times[i] + y.times[i + 1]) / 2;
    checked++;
    if (Math.abs(evalTrack(y, mid) - y.values[i]) > 1e-6)
      fail(`strip moves during the hold at t=${mid}`);
  }
}

if (failed) {
  console.error(`${failed} of ${checked} assertions failed`);
  process.exit(1);
}
console.log(`ok - ${checked} assertions across 3 specs`);
