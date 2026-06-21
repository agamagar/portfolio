import { useState } from "react";
import { useReducedMotion, useFitScale, useInViewLoop } from "../ds/hooks";
import { PhoneWindow, Shimmer } from "../ds/Scaffold";
import { Rail } from "./Rail";
import { Badge } from "./chrome";
import { IShield, IDoc, ITrend, IArrow } from "./icons";
import "./awayAgent.css";

// "The silent steward." Phase 2: the agent lives in the trip for weeks without
// nagging — a quiet watch diary, no pings. Then it earns the notification budget
// twice: one proactive doc-check caught while it's still fixable, and weeks later
// a price-drop callback that's worth more than the change fee. Presence, not noise.

const STEPS = [
  { t: "Present, not nagging", s: "A silent watch diary" },
  { t: "Caught early", s: "Your passport, while fixable", tone: "amber" },
  { t: "The price-drop callback", s: "Weeks later, a real win" },
];

export default function AwHub() {
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
              {/* countdown — always present, the trip at rest */}
              <div>
                <div className="aw-eyebrow">38 days out</div>
                <div className="aw-greet" style={{ marginTop: 4 }}>Goa in 38 days</div>
                <div className="aw-sub">DEL → GOI · 6E flight booked · I'm keeping an eye on it</div>
              </div>

              {/* the silent watch diary */}
              <div className="aw-panel">
                <div className="aw-panel__t" style={{ fontSize: 11, fontWeight: 600, color: "var(--ds-text-2)" }}>
                  What I've been watching
                </div>
                <div className="aw-tline">
                  <span />
                  <Shimmer w="58%" h={9} r={5} soft />
                </div>
                <div className="aw-tline">
                  <span />
                  <Shimmer w="44%" h={9} r={5} soft />
                </div>
                <Badge tone="indigo" icon={<IShield />}>Watching · quiet so far</Badge>
              </div>

              {/* beat 1 — the proactive doc-check (caught early, while fixable) */}
              {beat >= 1 && (
                <div className="aw-panel" data-tone="red" style={{ borderColor: "rgba(251, 191, 36, 0.32)" }}>
                  <div className="aw-bubble--enter" style={{ display: "flex", gap: 10 }}>
                    <span className="aw-panel__ic" data-tone="indigo" style={{ background: "var(--aw-amber-soft)", color: "var(--aw-amber)" }}>
                      <IDoc />
                    </span>
                    <div className="aw-panel__s">
                      <b style={{ color: "var(--ds-text)", fontWeight: 700 }}>Passport check. </b>
                      yours is inside the six-month window for Thailand. here's the fix, while there's still time.
                    </div>
                  </div>
                </div>
              )}

              {/* beat 2 — the price-drop callback (weeks later, a real win) */}
              <div style={{ marginTop: "auto" }}>
                {beat >= 2 && (
                  <div className="aw-toast aw-bubble--enter" style={{ flexDirection: "column", gap: 10 }}>
                    <div style={{ display: "flex", alignItems: "flex-start", gap: 9 }}>
                      <span className="aw-toast__ic"><ITrend /></span>
                      <div>
                        <div className="aw-toast__t">Fare dropped ₹3,400</div>
                        <div className="aw-toast__s">on your Goa flight. worth more than the change fee. want me to rebook?</div>
                      </div>
                    </div>
                    <span className="aw-btn" data-kind="primary"><IArrow />See the move</span>
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
