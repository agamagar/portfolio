import { useState } from "react";
import { useReducedMotion, useFitScale, useInViewLoop } from "../ds/hooks";
import { AppWindow, Shimmer, Caption, CountUp } from "../ds/Scaffold";
import "./concepts.css";

// Context & problem — "the execution flood". A role goes live and CVs pour in:
// the count rockets, the inbox overflows, hiring drowns. Concept: execution
// overload (the reason Stella exists). Storyline/numbers are placeholder.

const ROWS = 12;
const W = ["62%", "48%", "66%", "40%", "58%", "44%", "63%", "50%", "55%", "42%", "60%", "47%"];

export default function ExecutionFlood() {
  const reduce = useReducedMotion();
  const [beat, setBeat] = useState(reduce ? 2 : 0);
  const [inCount, setInCount] = useState(reduce ? ROWS : 2);
  const [count, setCount] = useState(reduce ? 3000 : 0);
  const [mode, setMode] = useState(reduce ? "red" : "");
  const [overwhelm, setOverwhelm] = useState(reduce);
  const [cap, setCap] = useState(reduce ? { label: "Execution buries hiring", mode: "red" } : { label: "A role goes live", mode: "blue" });

  const { fitRef, frameRef } = useFitScale(660, 1.06);

  const loopRef = useInViewLoop(!reduce, async ({ wait, alive }) => {
    while (alive()) {
      setBeat(0); setInCount(2); setCount(0); setMode(""); setOverwhelm(false); setCap({ label: "A role goes live", mode: "blue" });
      await wait(1000); if (!alive()) break;
      setBeat(1); setInCount(ROWS); setCount(3000); setMode("amber"); setCap({ label: "3,000 CVs in a week", mode: "amber" });
      await wait(2000); if (!alive()) break;
      setBeat(2); setOverwhelm(true); setMode("red"); setCap({ label: "Execution buries hiring", mode: "red" });
      await wait(1700);
    }
  });

  return (
    <div className="ds-fit" ref={(n) => { fitRef.current = n; loopRef.current = n; }}>
      <div className="ds-root ds-root--scaf" ref={frameRef}>
        <AppWindow url="localhost:3000/inbox" rail>
          <div className="cx-head">
            <div className="cx-title"><Shimmer w="140px" h={11} r={5} /><Shimmer w="84px" h={8} r={4} /></div>
            <div className="cx-numwrap"><CountUp className="cx-num" value={count} dur={1200} data-mode={mode} /><span className="cx-numlabel">CVs</span></div>
          </div>
          <div className="cf-list">
            {Array.from({ length: ROWS }).map((_, i) => (
              <div className="cf-row" key={i} data-in={i < inCount} data-overwhelm={overwhelm} style={{ transitionDelay: beat === 1 ? `${i * 45}ms` : "0ms" }}>
                <span className="cf-av" />
                <span className="cf-bars"><Shimmer w={W[i]} h={7} r={4} /><Shimmer w="30%" h={5} r={3} /></span>
              </div>
            ))}
          </div>
          <Caption mode={cap.mode} label={cap.label} style={{ left: "50%", bottom: 16, transform: "translateX(-50%)" }} />
        </AppWindow>
      </div>
    </div>
  );
}
