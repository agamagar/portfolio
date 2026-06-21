import { useState } from "react";
import { useReducedMotion, useFitScale, useInViewLoop } from "../ds/hooks";
import { PhoneWindow } from "../ds/Scaffold";
import { Rail } from "./Rail";
import { Flight, Badge } from "./chrome";
import { ICard, ICheck } from "./icons";
import "./awayAgent.css";

// "Gate the booking, not the agent." The whole concierge is free to use; only the
// act of booking sits behind an invite. Money is handled with maximum calm — a
// slow confirmation never reads as a failure, a declined card never reads as the
// user's fault, and the fare stays held throughout. The agent never auto-books;
// after the receipt it stays on, watching the price it just paid.

const STEPS = [
  { t: "Gate the booking", s: "The agent is free; booking isn't" },
  { t: "Money in flight, held", s: "Never reads slow as failed" },
  { t: "A declined card", s: "No blame, fare still held", tone: "amber" },
  { t: "Booked, still watching", s: "The relationship continues", tone: "green" },
];

export default function AwBook() {
  const reduce = useReducedMotion();
  const [beat, setBeat] = useState(reduce ? 3 : 0);
  const { fitRef, frameRef } = useFitScale(660, 1.06);

  const loopRef = useInViewLoop(!reduce, async ({ wait, alive }) => {
    while (alive()) {
      setBeat(0); await wait(2000); if (!alive()) break;
      setBeat(1); await wait(1500); if (!alive()) break;
      setBeat(2); await wait(1900); if (!alive()) break;
      setBeat(3); await wait(2400);
    }
  });

  const active = beat;
  const done = new Set([0, 1, 2].filter((i) => i < active));

  return (
    <div className="ds-fit" ref={(n) => { fitRef.current = n; loopRef.current = n; }}>
      <div className="ds-root ds-root--away" ref={frameRef}>
        <div className="aw-stage">
          <PhoneWindow title="Book">
            <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
              {beat === 0 && (
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  <div className="aw-flights">
                    <Flight air="6E" time="DEL → BOM · 07:25" meta="IndiGo · nonstop · 2h10m" now="₹4,210" />
                    <Flight air="AI" time="DEL → BOM · 09:40" meta="Air India · nonstop · 2h05m" now="₹4,680" />
                  </div>
                  <div className="aw-panel" data-tone="indigo">
                    <div className="aw-panel__head">
                      <Badge tone="indigo">Invite-only</Badge>
                      <span className="aw-panel__t" style={{ marginLeft: "auto" }}>3 more fares behind the invite</span>
                    </div>
                    <div className="aw-flights">
                      <Flight dim air="UK" time="DEL → BOM · 06:15" meta="Vistara · held for invite" now="₹3,940" />
                      <Flight dim air="6E" time="DEL → BOM · 11:30" meta="IndiGo · held for invite" now="₹3,860" />
                    </div>
                  </div>
                  <span className="aw-sub">the whole agent is free; only booking is gated</span>
                </div>
              )}

              {beat === 1 && (
                <div className="aw-pay">
                  <span className="aw-pay__spin" />
                  <span className="aw-pay__t">Confirming your payment</span>
                  <span className="aw-pay__s">this usually takes a few seconds. don't close the app</span>
                </div>
              )}

              {beat === 2 && (
                <div style={{ display: "flex", flexDirection: "column", gap: 12, paddingTop: 8 }}>
                  <div className="aw-panel" data-tone="red">
                    <div className="aw-panel__head">
                      <span className="aw-panel__ic" data-tone="red"><ICard /></span>
                      <span className="aw-panel__t">Card declined</span>
                    </div>
                    <span className="aw-panel__s">their end, not yours. your fare's still held.</span>
                  </div>
                  <div className="aw-btnrow">
                    <span className="aw-btn" data-kind="primary"><ICard />Try another card</span>
                  </div>
                </div>
              )}

              {beat === 3 && (
                <div style={{ display: "flex", flexDirection: "column", gap: 12, paddingTop: 8 }}>
                  <div className="aw-panel">
                    <div className="aw-panel__head">
                      <span className="aw-panel__ic" data-tone="green"><ICheck /></span>
                      <span className="aw-panel__t">Booked. BOM → GOI, 6E 2053.</span>
                    </div>
                    <span className="aw-panel__s">PNR sent to your email. seat 14A, window, as you like it.</span>
                  </div>
                  <div>
                    <Badge tone="green" icon={<ICheck />}>I'll watch this price for 90 days</Badge>
                  </div>
                </div>
              )}
            </div>
          </PhoneWindow>
          <Rail cap="Design states" steps={STEPS} active={active} done={done} />
        </div>
      </div>
    </div>
  );
}
