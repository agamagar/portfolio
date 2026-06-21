import { useState } from "react";
import { useReducedMotion, useFitScale, useInViewLoop } from "../ds/hooks";
import { PhoneWindow, Shimmer, Caption } from "../ds/Scaffold";
import { Rail } from "./Rail";
import { IBox, IAlert, IStore } from "./icons";
import "./scheduled.css";

// "Designing for the cart that stays stuck." The hardest state: a shipment that
// stays unserviceable even with a schedule, because of a live supply gap. The
// instinct is to hide it; the design does the opposite — flag it in place, state
// the consequence up front (removed on save), and where a store is simply
// closed, offer to schedule for when it reopens.

const STEPS = [
  { t: "Flagged in place", s: "The broken shipment, never hidden", tone: "red" },
  { t: "Consequence, up front", s: "These items will be removed on save", tone: "amber" },
  { t: "Closed store? Reopen", s: "Schedule it for when the store is back", tone: "amber" },
];
const CAPS = ["", "Shown in place", "Removed on save", "Schedule for reopen"];
const MODES = ["purple", "red", "amber", "amber"];

const Ship = ({ tone, pill, pillTone, open, children }) => (
  <div className="sd-ship" data-tone={tone} data-open={open}>
    <div className="sd-ship__head">
      <span className="sd-ship__ic"><IBox /></span>
      <span className="sd-ship__meta">
        <Shimmer w="56%" h={7} r={4} />
        <div className="sd-ship__cv"><span className="sd-ava" /><Shimmer w="38%" h={6} r={3} /></div>
      </span>
      <span className="sd-pill" data-tone={pillTone}>{pillTone && <span className="sd-pill__dot" />}{pill}</span>
    </div>
    {children}
  </div>
);

export default function SchedStuckCart() {
  const reduce = useReducedMotion();
  const [beat, setBeat] = useState(reduce ? 3 : 0);
  const { fitRef, frameRef } = useFitScale(660, 1.06);

  const loopRef = useInViewLoop(!reduce, async ({ wait, alive }) => {
    while (alive()) {
      setBeat(0); await wait(1200); if (!alive()) break;
      setBeat(1); await wait(1500); if (!alive()) break;
      setBeat(2); await wait(1600); if (!alive()) break;
      setBeat(3); await wait(2200);
    }
  });

  const flagged = beat >= 1;
  const noteOpen = beat >= 2;
  const reopen = beat >= 3;
  const active = beat - 1;
  const done = new Set([0, 1, 2].filter((i) => i < active));

  return (
    <div className="ds-fit" ref={(n) => { fitRef.current = n; loopRef.current = n; }}>
      <div className="ds-root ds-root--phone" ref={frameRef}>
        <div className="sd-stage sd-stage--rail">
          <PhoneWindow title="Schedule order">
            <div className="sd-summary"><span className="sd-summary__t">3 shipments</span><span className="sd-summary__c">1 from a closed store</span></div>
            <div className="sd-list">
              <Ship tone="green" pill="6–7 PM" pillTone="green" />
              <Ship tone={flagged ? "red" : undefined} pill={flagged ? "Unavailable" : "Instant"} pillTone={flagged ? "red" : undefined} open={noteOpen}>
                <div className="sd-ship__body"><div className="sd-ship__inner"><div className="sd-ship__pad">
                  <div className="sd-note"><IAlert /><span><b>Unavailable for this slot.</b> These items will be removed when you save your order.</span></div>
                  <div className="sd-reopen" style={{ opacity: reopen ? 1 : 0, transform: reopen ? "none" : "translateY(4px)" }}><IStore /> Schedule for when we reopen</div>
                </div></div></div>
              </Ship>
              <Ship pill="Instant" />
            </div>
            {beat >= 1 && <Caption mode={MODES[beat]} label={CAPS[beat]} style={{ left: "50%", bottom: 12, transform: "translateX(-50%)" }} />}
          </PhoneWindow>
          <Rail cap="The states nobody screenshots" steps={STEPS} active={active} done={done} />
        </div>
      </div>
    </div>
  );
}
