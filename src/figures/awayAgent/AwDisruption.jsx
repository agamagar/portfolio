import { useState } from "react";
import { useReducedMotion, useFitScale, useInViewLoop } from "../ds/hooks";
import { PhoneWindow } from "../ds/Scaffold";
import { Rail } from "./Rail";
import { Badge } from "./chrome";
import { IAlert, IShield, IClock, ICheck, ICard, IDoc } from "./icons";
import "./awayAgent.css";

// "The rescue surface." A cancellation handled calm and operational: what changed,
// what you're owed (the rights engine — the moat), the one smart move already
// worked out, and a clean hand-off. The agent never rebooks for you; it preps,
// you commit. Panels stack top-down so each design state lands one concept at a time.

const STEPS = [
  { t: "What changed", s: "Calm, specific, no edge", tone: "red" },
  { t: "What you're owed", s: "The rights engine, encoded", tone: "green" },
  { t: "The one smart move", s: "The fix, already worked out" },
  { t: "Hands off, you act", s: "It preps; you commit" },
];

export default function AwDisruption() {
  const reduce = useReducedMotion();
  const [beat, setBeat] = useState(reduce ? 3 : 0);
  const { fitRef, frameRef } = useFitScale(660, 1.06);

  const loopRef = useInViewLoop(!reduce, async ({ wait, alive }) => {
    while (alive()) {
      setBeat(0); await wait(1300); if (!alive()) break;
      setBeat(1); await wait(1500); if (!alive()) break;
      setBeat(2); await wait(1500); if (!alive()) break;
      setBeat(3); await wait(2300);
    }
  });

  const active = beat;
  const done = new Set([0, 1, 2].filter((i) => i < active));

  return (
    <div className="ds-fit" ref={(n) => { fitRef.current = n; loopRef.current = n; }}>
      <div className="ds-root ds-root--away" ref={frameRef}>
        <div className="aw-stage">
          <PhoneWindow title="Schedule change">
            <div style={{ display: "flex", flexDirection: "column", height: "100%", gap: 9 }}>

              {/* beat 0 — provenance + delta: what changed, no edge */}
              <div className="aw-panel" data-tone="red">
                <div className="aw-panel__head">
                  <span className="aw-panel__ic" data-tone="red"><IAlert /></span>
                  <span className="aw-panel__t">IndiGo cancelled 6E 2014</span>
                  <Badge tone="red" icon={<IAlert />}>Cancelled</Badge>
                </div>
                <div className="aw-delta">
                  <IClock />
                  <span>was 08:45 · now nothing on this route till 14:20</span>
                </div>
              </div>

              {/* beat 1 — the rights line: the rights engine, the moat */}
              {beat >= 1 && (
                <div className="aw-rights aw-bubble--enter">
                  <IShield />
                  <span>
                    <b>What you're owed.</b> EU261: this is the airline's fault and
                    over 3 hours, so you're due care now and up to €600. I'll draft
                    the claim.
                  </span>
                </div>
              )}

              {/* beat 2 — the one smart move: the fix, already worked out */}
              {beat >= 2 && (
                <div className="aw-panel aw-bubble--enter" data-tone="indigo">
                  <div className="aw-panel__head">
                    <span className="aw-panel__ic" data-tone="indigo"><ICheck /></span>
                    <span className="aw-panel__t">The smart move</span>
                  </div>
                  <span className="aw-panel__s">
                    take the 14:20 Vistara UK 996 — protected, lands in time for your
                    meeting. fare difference is covered.
                  </span>
                </div>
              )}

              {/* beat 3 — hands off: it preps, you commit */}
              {beat >= 3 && (
                <div className="aw-bubble--enter" style={{ marginTop: "auto", display: "flex", flexDirection: "column", gap: 8 }}>
                  <div className="aw-btnrow">
                    <span className="aw-btn" data-kind="primary"><ICard />Open IndiGo desk</span>
                    <span className="aw-btn"><IDoc />Copy what to say</span>
                  </div>
                  <span className="aw-sub">I've teed it up. you take it from there.</span>
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
