// The ZepIris (codename OdinEye) PRD, rendered as native portfolio DOM from
// zepirisPrdData via the shared PrdRenderer (same renderer as Away/Dassh/Jarvis).
// Lazy-loaded so its data module only loads on the /work/zepiris-prd route.
// Retroactive v1 record + researched v2 adaptive-capture layer. WIP v0.2.
import { zepirisPrdData } from "./zepirisPrdData";
import { zepirisNarration } from "./zepirisNarration";
import PrdRenderer from "./PrdRenderer";

export default function ZepirisPrdDoc() {
  return (
    <PrdRenderer
      data={zepirisPrdData}
      kick="Product Requirements · ZepIris (codename OdinEye) · face authentication · v1 record + v2 adaptive layer · WIP v0.2"
      title="The ZepIris PRD"
      narration={zepirisNarration}
    />
  );
}
