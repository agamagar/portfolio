// The teams half of the library: seven functions and the tasks each one hands to a
// model. Same architecture as the voice half: a role card (who the model becomes,
// what the function produces, how good work looks) plus a task set, both DERIVED
// here from structured data plus buildPrompt, so the page shows exactly what the
// assembler produces and the two cannot drift.
//
//   teams.data.js   the seven roles as structured data, each with its sources
//   tasks.data.js   the tasks per role: a job, the inputs to paste, the output shape
//   buildPrompt.js  the assembler; every team prompt on the page is composed by it
import { TEAMS } from "./teams.data.js";
import { TASK_SETS } from "./tasks.data.js";
import { buildTeamPrompt, buildTeamSystemPrompt, SKELETON, uncite } from "./buildPrompt.js";

const FAMILY = "Teams";

// The family opens with its own system card: how a team prompt is assembled, and
// the live picker that composes one from any role and task.
const systemSpec = {
  id: "pl-team-prompts-system",
  family: FAMILY,
  group: "Team prompts",
  eyebrow: "System",
  title: "Team prompts, one assembler for seven functions",
  summary:
    "Pick a team, pick the job, paste what the model needs, and one prompt assembles. Every clause below is sourced from the function's own practitioners and the model vendors' own guidance, not from memory.",
  "Build one": { builder: "team-prompts" },
  "How a team prompt is assembled": SKELETON,
  "Who this is for": TEAMS.map((t) => `${t.eyebrow}: ${t.summary}`),
};

const roleSpecs = TEAMS.flatMap((team) => {
  const set = TASK_SETS.find((s) => s.team === team.id);
  if (!set) throw new Error(`prompt library: team "${team.id}" has no task set`);
  const role = {
    id: team.id,
    family: FAMILY,
    group: team.eyebrow,
    eyebrow: team.eyebrow,
    title: team.title,
    summary: team.summary,
    Persona: team.persona,
    "What the team produces": team.produces,
    Principles: team.principles,
    "Reach for": team.reachFor,
    Avoid: team.avoid,
    Rules: team.rules,
    "The test": team.test,
    "Paste before you ask": team.inputs,
    Sources: team.sources,
    "Copy-paste system prompt": { pre: buildTeamSystemPrompt(team) },
  };
  const tasks = {
    id: set.id,
    family: FAMILY,
    group: team.eyebrow,
    eyebrow: team.eyebrow,
    title: set.title,
    summary: set.summary,
  };
  Object.entries(set.tasks).forEach(([name, task]) => {
    tasks[name] = { pre: buildTeamPrompt(team, name, task) };
  });
  return [role, tasks];
});

export const teamSpecs = [systemSpec, ...roleSpecs];
export { TEAMS, TASK_SETS, buildTeamPrompt, buildTeamSystemPrompt, uncite };
