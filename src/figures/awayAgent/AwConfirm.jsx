import { useState } from "react";
import { useReducedMotion, useFitScale, useInViewLoop } from "../ds/hooks";
import { PhoneWindow } from "../ds/Scaffold";
import { Rail } from "./Rail";
import { Badge } from "./chrome";
import { ICheck, IShield } from "./icons";
import "./awayAgent.css";

// "Holding the paid-but-not-ticketed gap." After the booking lands the agent
// stops being a search tool and starts being a custodian: it hands over the
// emotional payoff, makes the PNR and its protection legible, then names the
// one moment everyone else hides — money's gone, ticket isn't issued yet — and
// holds it steady instead of showing a void.

const STEPS = [
  { t: "You're going", s: "The emotional payoff" },
  { t: "The PNR, made legible", s: "Protected vs self-transfer", tone: "green" },
  { t: "Paid, not yet ticketed", s: "Held steady, not a void" },
];

export default function AwConfirm() {
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
              <div className="aw-conf">
                <span className="aw-conf__badge"><ICheck /></span>
                <span className="aw-conf__city">You're going to Goa</span>
                <span className="aw-conf__meta">14 Dec · 2 travellers · 6E 2053</span>
              </div>

              {beat >= 1 && (
                <div className="aw-panel" data-tone="indigo">
                  <div className="aw-panel__head">
                    <span className="aw-panel__ic" data-tone="green"><IShield /></span>
                    <div style={{ minWidth: 0 }}>
                      <div className="aw-panel__t">DEL → GOI, one ticket</div>
                      <div className="aw-panel__s">PNR JK7QW2 · operated by 6E</div>
                    </div>
                  </div>
                  <div className="aw-delta">
                    <span style={{ color: "var(--ds-text-2)" }}>DEL → BOM</span>
                    <span style={{ color: "var(--ds-text-3)" }}>·</span>
                    <span style={{ color: "var(--ds-text-2)" }}>BOM → GOI</span>
                    <Badge tone="green" icon={<ICheck />}>Protected connection</Badge>
                  </div>
                </div>
              )}

              <div style={{ marginTop: "auto" }}>
                {beat >= 2 && (
                  <div className="aw-toast">
                    <span className="aw-toast__ic"><span className="aw-pay__spin" style={{ width: 16, height: 16, borderWidth: 2 }} /></span>
                    <div style={{ minWidth: 0 }}>
                      <div className="aw-toast__t">Issuing your ticket</div>
                      <div className="aw-toast__s">this is normal, takes a minute. I'll ping you the second it's done.</div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </PhoneWindow>
          <Rail cap="Design states" steps={STEPS} active={active} done={done} />
        </div>
      </div>
    </div>
  );
}
