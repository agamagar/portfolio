// The six ramps, DERIVED here from each attested primary (see ../oklch.js) because
// the generated tokens.json is not in the repo yet. Every ramp is asserted strictly
// monotonic in luminance at import (Zepto invariant 2). When tokens.json lands,
// replace deriveRamp() with its values and nothing downstream changes.
import { THEMES } from "./themes.data.js";
import { deriveRamp } from "../oklch.js";
import { reversals } from "../contrast.js";

export const RAMPS = THEMES.map((t) => {
  const steps = deriveRamp(t.primary);
  // lavender's attested 100 / 700 / 900 override the derived steps
  if (t.surface100) steps[100] = t.surface100;
  if (t.type700) steps[700] = t.type700;
  if (t.deep900) steps[900] = t.deep900;
  const bad = reversals(steps);
  if (bad.length) throw new Error(`colour system: ${t.key} ramp reverses at ${bad.join(", ")}`);
  return { key: t.key, label: t.label, steps, derived: true };
});

export const rampOf = (key) => RAMPS.find((r) => r.key === key);
