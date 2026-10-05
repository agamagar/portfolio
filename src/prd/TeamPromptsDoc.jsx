// Team prompts, rendered as a PRD-style page through the shared PrdRenderer, the
// same way the prompt library is. Data is assembled in ./promptLibrary/teams/page.js.
import { teamPromptsData } from "./promptLibrary/teams/page.js";
import PrdRenderer from "./PrdRenderer";

export default function TeamPromptsDoc() {
  return (
    <PrdRenderer
      data={teamPromptsData}
      kick="Team prompts · Seven functions, one assembler"
      title="Team prompts"
    />
  );
}
