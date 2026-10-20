import { useReducedMotion, useFitScale } from "../ds/hooks";
import "./scheduled.css";

// Design Mode: two directions, and the sentence that decided them. A 2-up of the
// real screens — the KILLED tabbed/bottom-sheet-per-shipment flow (hides the
// other shipments' choices) vs the SHIPPED single-page listing (every shipment
// and its slot stay visible). Frames pulled via the Figma REST API.

const KILLED = "/figures/scheduled/sched-dir-tabbed.png";   // 3118:240195
const SHIPPED = "/figures/scheduled/sched-today-all.png";   // 40000019:68406
// mvgnctlf + mvgm4020 (Agam, asked twice, "add a third variant for bottom sheet"): the bottom-sheet direction, coded from the slot
// picker's own UI (sheet over a dimmed cart screen) until Agam's screen arrives. Set SHEET to its path to swap the mock for the image.
const SHEET = null;
const SHEET_BEHIND = "/figures/scheduled/sched-pg-noslot.png";

const IX = () => (<svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round"><path d="M6 6l12 12M18 6L6 18" /></svg>);
const ICheck = () => (<svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5" /></svg>);

const SLOTS = [["6 - 7 PM", "off"], ["7 - 8 PM"], ["8 - 9 PM"], ["9 - 10 PM"], ["10 - 11 PM"], ["11 - 12 PM"]];

// the coded stand-in: the cart behind a scrim, a sheet rising from the bottom with the slot picker's day tabs and slot chips
function SheetMock() {
  return (
    <div className="sdsheet" aria-hidden="true">
      <img src={SHEET_BEHIND} alt="" draggable={false} />
      <span className="sdsheet__scrim" />
      <div className="sdsheet__panel">
        <span className="sdsheet__grab" />
        <b className="sdsheet__title">Pick a slot</b>
        <div className="sdsheet__days"><span data-on="true">Today, 18 Aug</span><span>Tomorrow, 19 Aug</span></div>
        <div className="sdsheet__slots">{SLOTS.map(([t, off]) => <span key={t} data-off={off ? "true" : undefined}>{t}</span>)}</div>
        <span className="sdsheet__cta">Confirm</span>
      </div>
    </div>
  );
}

export default function SchedDirections() {
  useReducedMotion();
  const { fitRef, frameRef } = useFitScale(760, 1.06);

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
            <span className="sdcmp__tag" data-kind="explored"><IX /> Explored</span>
            <div className="sdcmp__screen">
              {SHEET ? <img src={SHEET} alt="The bottom-sheet direction: the slot picker opens as a sheet over the cart." draggable={false} /> : <SheetMock />}
            </div>
            <div className="sdcmp__note"><b className="sdcmp__note-t">Bottom sheet</b><span className="sdcmp__note-s">The slot picker rises over the cart, so the other shipments&rsquo; choices sit behind it.</span></div>
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
