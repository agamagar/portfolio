// The Team prompts page: the seven roles and their tasks, on their own route rather
// than inside the prompt library (Agam: "move to a new tab", 2026-09-04). The specs
// are the same derived objects teams/index.js has always produced; only the page
// around them is new. PrdRenderer consumes this the way it consumes the library.
import { teamSpecs, TEAMS } from "./index.js";

export const teamPromptsData = {
  synthesis: {
    oneLiner:
      "Text prompts that do each function's working documents: seven roles, forty-four tasks, one assembler.",
    "What this is": [
      "Seven roles: data science, product, last mile operations, backend engineering, frontend engineering, design leads, company leadership. Each is a persona plus the function's own principles, vocabulary, rules and test, with the tasks it hands to a model.",
      "Every clause is sourced from the function's practitioners and the model vendors' own guidance; the role cards number their sources, and the composed prompt strips those numbers out.",
      "Nothing is typed twice: every copy-paste block is composed from the data beside it, so editing a principle rewrites every prompt for that role.",
      "Sibling of the prompt library at /work/prompt-library, which holds the voice frameworks and the image systems.",
    ],
    "How a team prompt is assembled": [
      "Role, one sentence, stated as a perspective.",
      "Task with its reason, so the model can generalise from it.",
      "Inputs in tagged blocks, above the ask.",
      "An examples slot for one to three of your own past artefacts.",
      "Output shape, stated positively.",
      "The function's principles, vocabulary, swaps, and a short rule list with reasons.",
      "A self-check rubric, and [missing] instead of an invented fact.",
      "The ask restated last.",
    ],
    Sources: [
      "research/teams.md in the prompt library folder indexes five dossiers under research/teams/: the text-prompt levers, data science and product, last mile, engineering, design leads and leadership. 159 fetched sources.",
    ],
  },
  specs: teamSpecs,
};

export { TEAMS };
export default teamPromptsData;
