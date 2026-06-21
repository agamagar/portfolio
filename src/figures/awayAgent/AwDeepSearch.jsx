import { useState } from "react";
import { useReducedMotion, useFitScale, useInViewLoop } from "../ds/hooks";
import { PhoneWindow } from "../ds/Scaffold";
import { Rail } from "./Rail";
import { Think, Timeline, Savings } from "./chrome";
import "./awayAgent.css";

// "Showing the work." A two-minute negotiation narrated as a live timeline, not a
// spinner. The steps are built from your own flights — your airlines, your routes —
// so the wait reads as labour, not lag. It runs through scanning, negotiating bulk
// rates, and ranking, then lands on the savings: the public fare struck through,
// the negotiated one beside it.

const STEPS = [
  { t: "Shows the work", s: "A live timeline, not a spinner" },
  { t: "Built from your flights", s: "Your airlines, your routes" },
  { t: "Negotiating bulk rates", s: "The category of work, honestly" },
  { t: "The negotiated win", s: "Public fare struck, new beside" },
];

// the four lines of the negotiation, each carrying its own state per beat
const TL = [
  { label: "Scanning airline inventory", pills: ["6E", "UK", "AI"] },
  { label: "Pulling your route history" },
  { label: "Negotiating bulk rates with suppliers" },
  { label: "Scoring and ranking your options" },
];

export default function AwDeepSearch() {
  const reduce = useReducedMotion();
  const [beat, setBeat] = useState(reduce ? 3 : 0);
  const { fitRef, frameRef } = useFitScale(660, 1.06);

  const loopRef = useInViewLoop(!reduce, async ({ wait, alive }) => {
    while (alive()) {
      setBeat(0); await wait(1200); if (!alive()) break;
      setBeat(1); await wait(1300); if (!alive()) break;
      setBeat(2); await wait(1300); if (!alive()) break;
      setBeat(3); await wait(2200);
    }
  });

  const active = beat;
  const done = new Set([0, 1, 2, 3].filter((i) => i < active));

  // map the timeline's per-step state to the current beat. beat 0: first step
  // active. beat 1: two done, the negotiation active. beat 2: mostly done, ranking
  // active. beat 3: the timeline gives way to the savings reveal.
  const ACTIVE_AT = [0, 2, 3];
  const tl = TL.map((s, i) => {
    const a = ACTIVE_AT[beat];
    return { ...s, state: i < a ? "done" : i === a ? "active" : "pending" };
  });

  return (
    <div className="ds-fit" ref={(n) => { fitRef.current = n; loopRef.current = n; }}>
      <div className="ds-root ds-root--away" ref={frameRef}>
        <div className="aw-stage">
          <PhoneWindow title="Negotiating">
            <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
              {beat < 3 ? (
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  {beat === 0 && <Think>scanning the supplier network…</Think>}
                  <Timeline steps={tl} />
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  <span className="aw-eyebrow">Negotiated for you</span>
                  <Savings
                    from="₹38,400"
                    now="₹34,200"
                    delta="₹4,200 under the public fare"
                  />
                  <span className="aw-sub">checked everywhere it could hide</span>
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
