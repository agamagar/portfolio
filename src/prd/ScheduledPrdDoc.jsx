// The Zepto Scheduled Delivery PRD, rendered as native portfolio DOM from
// scheduledPrdData via the shared PrdRenderer (same renderer as the Away / Dassh
// PRDs). Lazy-loaded so its data module only loads on the /work/scheduled-prd
// route. WIP / Draft v0.1.
import { scheduledPrdData } from "./scheduledPrdData";
import { scheduledNarration } from "./scheduledNarration";
import PrdRenderer from "./PrdRenderer";

export default function ScheduledPrdDoc() {
  return (
    <PrdRenderer
      data={scheduledPrdData}
      kick="Product Requirements · Zepto · Scheduled Delivery · WIP draft"
      title="The Scheduled Delivery PRD"
      narration={scheduledNarration}
    />
  );
}
