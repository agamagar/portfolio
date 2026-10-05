// The voice half of the library: four frameworks and the moments each one writes.
// Both spec kinds are DERIVED here from structured data plus buildPrompt, so the
// page shows exactly what the assembler produces and the two cannot drift.
import { FRAMEWORKS } from "./frameworks.data.js";
import { MOMENT_SETS } from "./moments.data.js";
import { buildPrompt, buildSystemPrompt } from "./buildPrompt.js";

const frameworkSpecs = FRAMEWORKS.map((fw) => ({
  id: fw.id,
  family: "Voice",
  group: "Frameworks",
  eyebrow: fw.eyebrow,
  title: fw.title,
  summary: fw.summary,
  Persona: fw.persona,
  Principles: fw.principles,
  "Reach for": fw.reachFor,
  Avoid: fw.avoid,
  Rules: fw.rules,
  "The test": fw.test,
  "Copy-paste system prompt": { pre: buildSystemPrompt(fw) },
}));

const momentSpecs = MOMENT_SETS.map((set) => {
  const fw = FRAMEWORKS.find((f) => f.id === set.framework);
  const spec = {
    id: set.id,
    family: "Voice",
    group: "Moments",
    eyebrow: set.eyebrow,
    title: set.title,
    summary: set.summary,
  };
  Object.entries(set.moments).forEach(([name, moment]) => {
    spec[name] = { pre: buildPrompt(fw, name, moment) };
  });
  return spec;
});

export const voiceSpecs = [...frameworkSpecs, ...momentSpecs];
export { FRAMEWORKS, MOMENT_SETS, buildPrompt, buildSystemPrompt };
