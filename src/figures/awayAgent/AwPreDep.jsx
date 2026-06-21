import { useState } from "react";
import { useReducedMotion, useFitScale, useInViewLoop } from "../ds/hooks";
import { PhoneWindow } from "../ds/Scaffold";
import { Rail } from "./Rail";
import { Badge } from "./chrome";
import { ICheck, IClock, IPlane, IAlert, IArrow } from "./icons";
import "./awayAgent.css";

// "The surface sharpens." Phase 3: as departure nears, the one trip surface
// transforms instead of multiplying. At T-72 the hub hero becomes a single
// check-in action; day-of it reads like a boarding pass, already handled; then a
// close-in cancellation breaks through with the fix already found. One surface,
// three states — it gets more specific the closer you get.

const STEPS = [
  { t: "It sharpens as you near", s: "Check in now, at T-72" },
  { t: "Handled before you asked", s: "Checked in, leave-by, gate", tone: "green" },
  { t: "A cancellation, fix ready", s: "Breaks through, calm", tone: "red" },
];

export default function AwPreDep() {
  const reduce = useReducedMotion();
  const [beat, setBeat] = useState(reduce ? 2 : 0);
  const { fitRef, frameRef } = useFitScale(660, 1.06);

  const loopRef = useInViewLoop(!reduce, async ({ wait, alive }) => {
    while (alive()) {
      setBeat(0); await wait(1200); if (!alive()) break;
      setBeat(1); await wait(1900); if (!alive()) break;
      setBeat(2); await wait(2200);
    }
  });

  const active = beat;
  const done = new Set([0, 1].filter((i) => i < active));

  return (
    <div className="ds-fit" ref={(n) => { fitRef.current = n; loopRef.current = n; }}>
      <div className="ds-root ds-root--away" ref={frameRef}>
        <div className="aw-stage">
          <PhoneWindow title="Your trip">
            <div style={{ display: "flex", flexDirection: "column", height: "100%", gap: 11 }}>

              {/* the eyebrow tracks the surface sharpening as departure nears */}
              <div>
                <div className="aw-eyebrow">
                  {beat === 0 ? "T-72h · check-in opens" : beat === 1 ? "Day of · 6E 2053" : "2h to gate · heads up"}
                </div>
                <div className="aw-greet" style={{ marginTop: 4 }}>
                  {beat === 0 ? "Goa, almost time" : beat === 1 ? "BOM → GOI today" : "Plans just changed"}
                </div>
              </div>

              {/* beat 0 — the hub hero becomes a single check-in action */}
              {beat === 0 && (
                <div className="aw-panel aw-bubble--enter" data-tone="indigo">
                  <div className="aw-panel__head">
                    <span className="aw-panel__ic" data-tone="indigo"><ICheck /></span>
                    <span className="aw-panel__t">Check in now</span>
                  </div>
                  <span className="aw-panel__s">
                    I can do it for you at T-72. seat 14C, your usual.
                  </span>
                  <div className="aw-btnrow">
                    <span className="aw-btn" data-kind="primary"><ICheck />Let me check you in</span>
                  </div>
                </div>
              )}

              {/* beat 1 — boarding-pass feel, already handled before you noticed */}
              {beat === 1 && (
                <div className="aw-panel aw-bubble--enter">
                  <div className="aw-panel__head">
                    <span className="aw-panel__ic" data-tone="indigo"><IPlane /></span>
                    <span className="aw-panel__t">6E 2053 · BOM → GOI</span>
                  </div>
                  <div className="aw-delta">
                    <IClock />
                    <span>Gate 22 · boards 17:40</span>
                  </div>
                  <Badge tone="green" icon={<ICheck />}>
                    Checked in · leave by 16:10, traffic's bad to T2
                  </Badge>
                </div>
              )}

              {/* beat 2 — a close-in cancellation breaks through, fix already found */}
              {beat === 2 && (
                <div className="aw-panel aw-bubble--enter" data-tone="red">
                  <div className="aw-panel__head">
                    <span className="aw-panel__ic" data-tone="red"><IAlert /></span>
                    <span className="aw-panel__t">Your 18:10 is off</span>
                    <Badge tone="red" icon={<IAlert />}>Cancelled</Badge>
                  </div>
                  <span className="aw-panel__s">
                    I've already found the smart move — the 19:30, protected.
                    breaking through to tell you.
                  </span>
                  <div className="aw-btnrow">
                    <span className="aw-btn" data-kind="primary"><IArrow />See the fix</span>
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
