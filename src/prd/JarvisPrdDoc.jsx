// The Edge (codename JARVIS) problem-framing PRD, rendered as native portfolio DOM
// from jarvisPrdData via the shared PrdRenderer (same renderer as Away and Dassh).
// Lazy-loaded so its data module only loads on the /work/jarvis-prd route.
// IDEO steps 1 to 4. WIP / Draft v0.1.
import { jarvisPrdData } from "./jarvisPrdData";
import { jarvisNarration } from "./jarvisNarration";
import PrdRenderer from "./PrdRenderer";

export default function JarvisPrdDoc() {
  return (
    <PrdRenderer
      data={jarvisPrdData}
      kick="Product Requirements · Edge (JARVIS) · problem framing · IDEO 1 to 4 · WIP draft"
      title="The Edge PRD"
      narration={jarvisNarration}
    />
  );
}
