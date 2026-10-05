import { useState } from "react";
import { useReducedMotion, useFitScale, useInViewLoop } from "../ds/hooks";
import "./scheduled.css";

// Design Mode: the real "cart that stays stuck" — when items can't make the
// chosen slot, the cart pauses with a "Schedule needs review" sheet before pay
// (Schedule Order Handoff, node 9387:418810 "Cart: Full View"). The rail walks
// the handling beat by beat; the screen is the real design.

const SCREEN = "/figures/scheduled/sched-stuck-cart.png";

const NOTES = [
  { t: "Some items can't make the slot", s: "Flagged the moment they go unserviceable" },
  { t: "Schedule needs review", s: "We pause and ask before you pay, never silently drop" },
  { t: "Fix or drop", s: "Review the scheduled order, or clear the unavailable items" },
];

export default function SchedStuckCart() {
  const reduce = useReducedMotion();
  const [active, setActive] = useState(0);
  const { fitRef, frameRef } = useFitScale(660, 1.06);

  const loopRef = useInViewLoop(!reduce, async ({ wait, alive }) => {
    while (alive()) {
      for (let i = 0; i < NOTES.length; i++) {
        setActive(i);
        await wait(1700); if (!alive()) return;
      }
    }
  });

  return (
    <div className="ds-fit" ref={(n) => { fitRef.current = n; loopRef.current = n; }}>
      <div className="ds-root ds-root--phone" ref={frameRef}>
        <div className="sd-stage sd-stage--rail sd-stage--slotreal">
          <div className="slotreal-device slotreal-device--tall">
            <div className="slotreal-screen">
              <img className="slotreal-img" src={SCREEN} alt="The cart with a Schedule needs review sheet: some items may not be available for the chosen slot, with a Review Schedule action." draggable={false} data-on="true" />
            </div>
          </div>

          <div className="sd-rail">
            <div className="sd-rail__cap">The cart that stays stuck</div>
            {NOTES.map((nt, i) => (
              <div className="sd-step" key={nt.t} data-on="true" data-active={i === active} data-tone="amber">
                <span className="sd-step__dot"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5" /></svg></span>
                <span className="sd-step__txt"><span className="sd-step__t">{nt.t}</span><span className="sd-step__s">{nt.s}</span></span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
