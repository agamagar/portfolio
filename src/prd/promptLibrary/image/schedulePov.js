// Schedule POV: the group's specs, COMPOSED from the recipe rather than stored.
import { SPECS } from "./schedulePov.data.js";
import { schedulePovRecipe, MOMENTS } from "./schedulePovViews.js";

const { Sources, ...system } = SPECS.find((s) => s.id === "pl-schedule-pov-system");
const { compose } = schedulePovRecipe;

// One written-out block per moment, words only.
const momentSpec = {
  id: "pl-schedule-pov-moments",
  group: "Schedule POV",
  eyebrow: "Zepto",
  title: "The moments · written out",
  summary: "One ready block per moment, words only, each shot like its reference image.",
  ...Object.fromEntries(
    MOMENTS.map((m) => [m.label, { pre: compose({ moment: m.key, reference: "none", length: "compact" }) }])
  ),
};

// The page renders the picker alone, like Schedule images. The prose and the
// moment catalog stay authored here as the record. Flip HIDE_PROSE to show them.
const HIDE_PROSE = true;

const { summary, group, eyebrow, id, title } = system;

export const schedulePovSpecs = HIDE_PROSE
  ? [{ id, group, eyebrow, title, summary, "Pick a combination": { builder: "schedule-pov" } }]
  : [{ ...system, "Pick a combination": { builder: "schedule-pov" }, Sources }, momentSpec];
