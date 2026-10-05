import { useState } from "react";
import { useReducedMotion, useFitScale, useInViewLoop } from "../ds/hooks";
import "./scheduled.css";

// Design Mode: the cart conundrum — one order, many hubs. The real split cart
// (Schedule Order Handoff, node 9381:17371): "Order split in 2 shipments" with
// the "Expect multiple deliveries for this order" banner. The rail walks the
// hub topology that forces the split. Pulled via the Figma REST API.

const SCREEN = "/figures/scheduled/sched-split-2.png";

const NOTES = [
  { t: "One Mother Hub", s: "The largest warehouse stocks almost everything" },
  { t: "Superstores + dark stores", s: "Smaller sites hold deliberate subsets, near you" },
  { t: "So the cart splits", s: "A mixed order ships in up to four shipments, by hub" },
];

export default function SchedSplit() {
  const reduce = useReducedMotion();
  const [active, setActive] = useState(0);
  const { fitRef, frameRef } = useFitScale(660, 1.06);

  const loopRef = useInViewLoop(!reduce, async ({ wait, alive }) => {
    while (alive()) {
      for (let i = 0; i < NOTES.length; i++) {
        setActive(i);
        await wait(1900); if (!alive()) return;
      }
    }
  });

  return (
    <div className="ds-fit" ref={(n) => { fitRef.current = n; loopRef.current = n; }}>
      <div className="ds-root ds-root--phone" ref={frameRef}>
        <div className="sd-stage sd-stage--rail sd-stage--slotreal">
          <div className="slotreal-device">
            <div className="slotreal-screen">
              <img className="slotreal-img" src={SCREEN} alt="The cart with an Expect multiple deliveries banner and an Order split in 2 shipments header." draggable={false} data-on="true" />
            </div>
          </div>

          <div className="sd-rail">
            <div className="sd-rail__cap">One order, many hubs</div>
            {NOTES.map((nt, i) => (
              <div className="sd-step" key={nt.t} data-on="true" data-active={i === active} data-tone="purple">
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
