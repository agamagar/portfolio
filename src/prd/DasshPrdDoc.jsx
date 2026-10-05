// The Dassh PRD, rendered as native portfolio DOM from dasshPrdData via the shared
// PrdRenderer (same renderer as the Away PRD). Lazy-loaded so its data module only
// loads on the /work/dassh-prd route. WIP / Draft v0.1.
import { dasshPrdData } from "./dasshPrdData";
import { dasshNarration } from "./dasshNarration";
import { dasshWireframes } from "./dasshWireframes";
import PrdRenderer from "./PrdRenderer";

export default function DasshPrdDoc() {
  return (
    <PrdRenderer
      data={dasshPrdData}
      kick="Product Requirements · Dassh · global · WIP draft"
      title="The Dassh PRD"
      narration={dasshNarration}
      builders={dasshWireframes}
    />
  );
}
