import { useState } from "react";
import { useReducedMotion, useFitScale, useInViewLoop } from "../ds/hooks";
import { PhoneWindow } from "../ds/Scaffold";
import { Rail } from "./Rail";
import { Badge } from "./chrome";
import { IShield, ICheck, ISend } from "./icons";
import "./awayAgent.css";

// "Claiming what you're owed." The peak-end delight: the trip plays back as a
// four-param recap (time, money, comfort, flex), then the single best move — the
// agent surfaces money you never knew you were owed (an EU261 claim it already
// drafted) and a flash of Outlaw at the airline that bets most people never claim.

const STEPS = [
  { t: "The trip, played back", s: "Time, money, comfort, flex" },
  { t: "The full recap", s: "Competence, made visible" },
  { t: "You're owed this", s: "Money you'd never have claimed", tone: "green" },
];
const CELLS = [
  { k: "Time saved", v: "14 hrs" },
  { k: "Money saved", v: "₹11,200" },
  { k: "Comfort", v: "lie-flat x2" },
  { k: "Flex", v: "1 free change" },
];

export default function AwRecap() {
  const reduce = useReducedMotion();
  const [beat, setBeat] = useState(reduce ? 2 : 0);
  const { fitRef, frameRef } = useFitScale(660, 1.06);

  const loopRef = useInViewLoop(!reduce, async ({ wait, alive }) => {
    while (alive()) {
      setBeat(0); await wait(1200); if (!alive()) break;
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
          <PhoneWindow title="Trip recap">
            <div style={{ display: "flex", flexDirection: "column", height: "100%", gap: 12 }}>
              <div className="aw-recap">
                <div className="aw-recap__hd">Bali, done.</div>
                <div className="aw-recap__grid">
                  {CELLS.map((c, i) => (
                    <div className="aw-recap__cell" key={c.k} data-on={beat >= 1 || (beat === 0 && i === 0)}>
                      <span className="aw-recap__k">{c.k}</span>
                      <span className="aw-recap__v">{c.v}</span>
                    </div>
                  ))}
                </div>
              </div>
              {beat >= 2 && (
                <div className="aw-panel" data-tone="green" style={{ animation: reduce ? "none" : "awRise 360ms var(--ds-ease-out) both" }}>
                  <div className="aw-panel__head">
                    <span className="aw-panel__ic" data-tone="green"><IShield /></span>
                    <div style={{ minWidth: 0 }}>
                      <div className="aw-panel__t">You're owed about €600</div>
                      <Badge tone="green" icon={<ICheck />}>EU261 drafted</Badge>
                    </div>
                  </div>
                  <div className="aw-panel__s">
                    your Frankfurt flight was delayed six hours. most people never claim it.
                    I've drafted the EU261 claim.
                  </div>
                  <div className="aw-btnrow">
                    <span className="aw-btn" data-kind="primary"><ISend />File the claim</span>
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
