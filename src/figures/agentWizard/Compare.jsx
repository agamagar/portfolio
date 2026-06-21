import AgentWizardSimple from "./Simple";
import AgentWizardFocus from "./Focus";

// Temporary side-by-side of the two scaling approaches so we can pick one.
export default function AgentWizardCompare() {
  return (
    <div className="aw-compare">
      <div>
        <div className="aw-compare__label">Option 1 — Simplified &amp; enlarged (no side rail, full-width cards)</div>
        <AgentWizardSimple />
      </div>
      <div>
        <div className="aw-compare__label">Option 3 — Focused (compact stepper, one step shown large)</div>
        <AgentWizardFocus />
      </div>
    </div>
  );
}
