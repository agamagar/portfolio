import { useState } from "react";
import { useReducedMotion, useFitScale, useInViewLoop } from "../ds/hooks";
import { PhoneWindow } from "../ds/Scaffold";
import { Rail } from "./Rail";
import { Flag } from "./chrome";
import { IPlane, IAlert, IShield } from "./icons";
import "./awayAgent.css";

// "Doing the anxious math." Phase 4: the agent watches the connection so you
// don't have to. It counts the layover down to the minute, narrows as the
// inbound slips, and the moment the connection is gone it already knows whose
// problem it is — one ticket means the airline owes you the next flight. The
// crisis state stays calm; all warmth, no blame.

const STEPS = [
  { t: "Doing the anxious math", s: "47 min, the gate's a walk" },
  { t: "It gets tight", s: "18 min, head straight there", tone: "amber" },
  { t: "Missed it: who's on hook", s: "Protected: the airline rebooks", tone: "red" },
];

const LASTBEAT = 2;

export default function AwTransit() {
  const reduce = useReducedMotion();
  const [beat, setBeat] = useState(reduce ? LASTBEAT : 0);
  const { fitRef, frameRef } = useFitScale(660, 1.06);

  const loopRef = useInViewLoop(!reduce, async ({ wait, alive }) => {
    while (alive()) {
      setBeat(0); await wait(1300); if (!alive()) break;
      setBeat(1); await wait(1500); if (!alive()) break;
      setBeat(2); await wait(2200);
    }
  });

  const active = beat;
  const done = new Set([0, 1].filter((i) => i < active));

  return (
    <div className="ds-fit" ref={(n) => { fitRef.current = n; loopRef.current = n; }}>
      <div className="ds-root ds-root--away" ref={frameRef}>
        <div className="aw-stage">
          <PhoneWindow title="In transit">
            <div style={{ display: "flex", flexDirection: "column", height: "100%", gap: 9 }}>
              {beat < 2 && (
                <div className="aw-conn" key={beat === 0 ? "calm" : "tight"}>
                  <div className="aw-conn__route">
                    <span className="aw-conn__plane"><IPlane /></span>DXB → BOM
                  </div>
                  <div className="aw-conn__big">{beat === 0 ? "47 min" : "18 min"}</div>
                  {beat === 0 ? (
                    <div className="aw-conn__line">
                      your gate is a 12-minute walk. <span className="aw-conn__ok">you're fine.</span>
                    </div>
                  ) : (
                    <div className="aw-conn__line">
                      inbound's late. it's tight — head straight to B22, don't stop.
                    </div>
                  )}
                </div>
              )}

              {beat === 1 && (
                <Flag tone="amber">cutting it close. i'm watching the gate, not your phone.</Flag>
              )}

              {beat >= 2 && (
                <>
                  <div className="aw-panel" data-tone="red">
                    <div className="aw-panel__head">
                      <span className="aw-panel__ic" data-tone="red"><IAlert /></span>
                      <span className="aw-panel__t">You missed BM 6E 204</span>
                    </div>
                    <span className="aw-panel__s">the inbound delay caused it.</span>
                  </div>
                  <div className="aw-rights">
                    <IShield />
                    one ticket: the airline owes you the next flight. here's the desk and what to say.
                  </div>
                </>
              )}
            </div>
          </PhoneWindow>
          <Rail cap="Design states" steps={STEPS} active={active} done={done} />
        </div>
      </div>
    </div>
  );
}
