import { useState } from "react";
import { useReducedMotion, useFitScale, useInViewLoop } from "../ds/hooks";
import { PhoneWindow } from "../ds/Scaffold";
import { Rail } from "./Rail";
import { Verdict, Flight } from "./chrome";
import "./awayAgent.css";

// "Vetted, not dumped." A familiar scrollable list the agent has already sorted by
// what's worth your time, not by price. The cheapest fare is flagged as the trap it
// is; you pick which two to send into negotiation; the public fares come back struck,
// the new ones beside them in green. The list never changes shape — the same rows
// just earn flags, selection, and savings as the agent works.

const STEPS = [
  { t: "Vetted, not dumped", s: "Sorted by right, not cheapest" },
  { t: "The trap, flagged", s: "The cheap fare that costs you", tone: "amber" },
  { t: "You pick, it negotiates", s: "Scroll and pick, up to three" },
  { t: "The negotiated win", s: "Public fare struck, new beside", tone: "green" },
];

export default function AwVet() {
  const reduce = useReducedMotion();
  const [beat, setBeat] = useState(reduce ? 3 : 0);
  const { fitRef, frameRef } = useFitScale(660, 1.06);

  const loopRef = useInViewLoop(!reduce, async ({ wait, alive }) => {
    while (alive()) {
      setBeat(0); await wait(1300); if (!alive()) break;
      setBeat(1); await wait(1700); if (!alive()) break;
      setBeat(2); await wait(1500); if (!alive()) break;
      setBeat(3); await wait(2200);
    }
  });

  const active = beat;
  const done = new Set([0, 1, 2].filter((i) => i < active));

  // row #1 — the best pick; negotiated down on the final beat
  const f1 = {
    air: "6E",
    time: "06:10 -> 09:25",
    meta: "non-stop · 3h15",
    good: true,
    sel: beat >= 2,
    ...(beat >= 3
      ? { from: "₹38,400", now: "₹34,200", nowTone: "green", tag: { tone: "green", label: "₹4,200 under public" } }
      : { now: "₹38,400", tag: { tone: "good", label: "Best pick" } }),
  };
  // row #2 — also worth the time; also negotiated
  const f2 = {
    air: "UK",
    time: "08:40 -> 12:05",
    meta: "non-stop · 3h25",
    good: true,
    sel: beat >= 2,
    ...(beat >= 3
      ? { from: "₹39,100", now: "₹35,600", nowTone: "green", tag: { tone: "green", label: "₹3,500 under public" } }
      : { now: "₹39,100" }),
  };
  // row #3 — the cheap one; flagged as a trap, then dimmed out of the pick
  const f3 = {
    air: "QR",
    time: "21:30 -> 14:50 +1",
    meta: "1 stop · 30h",
    now: "₹28,900",
    dim: beat >= 2,
    flag: beat >= 1
      ? {
          tone: "amber",
          node: <>Cheapest on paper. A connection 1 in 4 people miss, and a self-transfer no airline covers.</>,
        }
      : undefined,
  };

  return (
    <div className="ds-fit" ref={(n) => { fitRef.current = n; loopRef.current = n; }}>
      <div className="ds-root ds-root--away" ref={frameRef}>
        <div className="aw-stage">
          <PhoneWindow title="Results">
            <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
              <Verdict><b>8 flights.</b>&nbsp;3 are worth your time.</Verdict>
              <div className="aw-flights">
                <Flight {...f1} />
                <Flight {...f2} />
                <Flight {...f3} />
              </div>
              {beat >= 2 && beat < 3 && (
                <div className="aw-btnrow" style={{ marginTop: 12 }}>
                  <span className="aw-btn" data-kind="primary">Negotiate 2 flights</span>
                </div>
              )}
              {beat >= 3 && (
                <div className="aw-sub" style={{ marginTop: 12, textAlign: "center" }}>
                  both struck below the public fare. holding for 20 minutes.
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
