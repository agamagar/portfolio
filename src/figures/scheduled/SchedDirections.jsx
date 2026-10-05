import { useReducedMotion, useFitScale } from "../ds/hooks";
import "./scheduled.css";

// Design Mode: two directions, and the sentence that decided them. A 2-up of the
// real screens — the KILLED tabbed/bottom-sheet-per-shipment flow (hides the
// other shipments' choices) vs the SHIPPED single-page listing (every shipment
// and its slot stay visible). Frames pulled via the Figma REST API.

const KILLED = "/figures/scheduled/sched-dir-tabbed.png";   // 3118:240195
const SHIPPED = "/figures/scheduled/sched-today-all.png";   // 40000019:68406

const IX = () => (<svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round"><path d="M6 6l12 12M18 6L6 18" /></svg>);
const ICheck = () => (<svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5" /></svg>);

export default function SchedDirections() {
  useReducedMotion();
  const { fitRef, frameRef } = useFitScale(660, 1.06);

  return (
    <div className="ds-fit" ref={fitRef}>
      <div className="ds-root ds-root--phone" ref={frameRef}>
        <div className="sd-stage sd-stage--cmp">
          <div className="sdcmp">
            <span className="sdcmp__tag" data-kind="killed"><IX /> Rejected</span>
            <div className="sdcmp__screen"><img src={KILLED} alt="The tabbed flow: a tab per shipment, so picking a slot in one hides the others." draggable={false} /></div>
            <div className="sdcmp__note"><b className="sdcmp__note-t">Tabbed per shipment</b><span className="sdcmp__note-s">Choosing one slot hides the rest, so trust leaks away.</span></div>
          </div>

          <div className="sdcmp">
            <span className="sdcmp__tag" data-kind="shipped"><ICheck /> Shipped</span>
            <div className="sdcmp__screen"><img src={SHIPPED} alt="The single-page listing: every shipment and its chosen slot stay visible at once." draggable={false} /></div>
            <div className="sdcmp__note"><b className="sdcmp__note-t">One page</b><span className="sdcmp__note-s">Every shipment and its slot stay on screen, so the order reads at a glance.</span></div>
          </div>
        </div>
      </div>
    </div>
  );
}
