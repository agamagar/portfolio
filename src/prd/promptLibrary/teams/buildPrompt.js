// The assembler for the teams half. Every team prompt on the page, and the one the
// picker composes, comes from these two functions, so a principle is edited once in
// teams.data.js and every task prompt for that role changes with it.
//
// The skeleton follows what the model vendors' own guidance converges on
// (research/teams.md, "Text-prompt levers"): a one-sentence role stated as a
// perspective, the task with its reason, the pasted material in tagged blocks, the
// output shape stated positively, a short rule list where each rule carries its
// reason, a self-check rubric, and the ask restated last. Things the same research
// retired are deliberately absent: capitals for emphasis, "think step by step",
// long prohibition lists, and any request to print reasoning.

export const TOPIC_TOKEN = "[what this is about]";

// The data carries its citations ("[6]") so the PAGE can say where a line came
// from; the prompt a reader pastes into a model must not, so every string passes
// through here on its way in.
export const uncite = (s) => String(s).replace(/\s*\[\d+\](?:\[\d+\])*/g, "");
const bullets = (arr) => arr.map((x) => `- ${uncite(x)}`);

// The role, stated as a perspective rather than a costume, then what it makes.
const role = (team) => [
  "<role>",
  `You are ${uncite(team.persona)}.`,
  `Your team's working documents are: ${team.produces.map(uncite).join("; ")}.`,
  "</role>",
];

// The craft the model writes from: principles, vocabulary, the swaps, the rules.
function craft(team) {
  return [
    "<craft>",
    "Good work in this function looks like this:",
    ...bullets(team.principles),
    `Use the function's own words where they fit: ${team.reachFor.map(uncite).join(", ")}.`,
    "Swap these as you write:",
    ...bullets(team.avoid),
    "</craft>",
    "",
    "<rules>",
    ...bullets(team.rules),
    "</rules>",
  ];
}

// The self-check the draft is held against before it is returned.
const check = (team, extra = []) => [
  "<check>",
  "Before answering, check the draft against these and fix what fails:",
  ...bullets([...extra, team.test]),
  "Where a fact, number or name is not in the inputs, write [missing] and say what would fill it, rather than guessing.",
  "</check>",
];

// The role on its own: paste once at the top of a session, then ask for the work.
export function buildTeamSystemPrompt(team) {
  return [
    ...role(team),
    "",
    ...craft(team),
    "",
    "<inputs>",
    "Before any task, ask for whatever is missing from this list, then wait:",
    ...bullets(team.inputs),
    "</inputs>",
    "",
    ...check(team),
    "",
    "Reply directly, without preamble.",
  ].join("\n");
}

// Role + task + topic -> the exact prompt to run.
export function buildTeamPrompt(team, name, task, opts = {}) {
  const topic = opts.topic || TOPIC_TOKEN;
  const p = [
    ...role(team),
    "",
    "<task>",
    `${name} for: ${topic}.`,
    uncite(task.job),
    `Why it matters: ${uncite(task.why)}`,
    "</task>",
    "",
    "<inputs>",
    "Everything to work from is pasted here, one block each. Where one is missing, ask for it and stop:",
    ...bullets(task.inputs),
    "</inputs>",
    "",
    "<examples>",
    `Paste one to three of your own strongest past ${task.artefact} here. The model copies their details closely, so only the ones you would want copied.`,
    "</examples>",
    "",
    "<output>",
    ...bullets(task.output),
    "</output>",
    "",
    ...craft(team),
    "",
    ...check(team, task.check || []),
    "",
    `Now write the ${name.toLowerCase()} for ${topic}, in the shape under <output>, using only what is under <inputs>.`,
  ];
  return p.join("\n");
}

// What the system card prints: the assembly order, one line per part, each with
// the reason the research gave for it.
export const SKELETON = [
  "Role, one sentence, stated as a perspective: a single-sentence role is documented to focus behaviour; heavy role play is not.",
  "Task with its reason: a rule with a why generalises, a bare one does not.",
  "Inputs in tagged blocks, above the ask: on long material every vendor puts the documents first and the question last.",
  "Examples slot: one to three of your own past artefacts; examples are the most reliable lever and are copied closely, so best only.",
  "Output shape, stated positively: what to write, in the style you want back.",
  "Craft and rules: the function's principles, its vocabulary, its swaps, and a short rule list with reasons; no capitals, no long prohibitions.",
  "Check: a rubric the draft is held against, and [missing] instead of an invented fact.",
  "The ask restated last: the later instruction wins.",
];
