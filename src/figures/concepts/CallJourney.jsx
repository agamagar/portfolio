import { useState } from "react";
import { useReducedMotion, useFitScale, useInViewLoop } from "../ds/hooks";
import { Caption } from "../ds/Scaffold";
import "./concepts.css";
import "./callJourney.css";

// Designing the call: the candidate journey with the cliff at "engage".
// From the 43-call field study: one outbound attempt is a five-step journey,
// and the dominant drop-off is inside our own system, right after the candidate
// answers. Beats: stages appear -> pilot stats fill -> the Engage cliff turns
// red -> the fix (recover out loud, not dead air) lands green. Stats are the
// study's own journey-map figures; candidates anonymized.

const STAGES = [
  { key: "ring", name: "Ring", stat: "43", sub: "dials placed" },
  { key: "screen", name: "Screen", stat: "2+", sub: "silently blocked" },
  { key: "pickup", name: "Pick up", stat: "4 in 10", sub: "dials reach a human" },
  { key: "engage", name: "Engage", stat: "10 of 43", sub: "die before question one" },
  { key: "outcome", name: "Outcome", stat: "4 of 43", sub: "come out interested" },
];

export default function CallJourney() {
  const reduce = useReducedMotion();
  const [inCount, setInCount] = useState(reduce ? STAGES.length : 0);
  const [statsOn, setStatsOn] = useState(reduce);
  const [hot, setHot] = useState(reduce);
  const [fix, setFix] = useState(reduce);
  const [cap, setCap] = useState(
    reduce
      ? { label: "Everything shipped: 71% of screens complete", mode: "green" }
      : { label: "One call is a five-step journey", mode: "blue" }
  );

  const { fitRef, frameRef } = useFitScale(660, 1.06);

  const loopRef = useInViewLoop(!reduce, async ({ wait, alive }) => {
    while (alive()) {
      setInCount(0); setStatsOn(false); setHot(false); setFix(false);
      setCap({ label: "One call is a five-step journey", mode: "blue" });
      await wait(350); if (!alive()) break;
      for (let i = 1; i <= STAGES.length; i++) { setInCount(i); await wait(210); }
      if (!alive()) break;
      await wait(500); if (!alive()) break;
      setStatsOn(true);
      setCap({ label: "43 real calls, coded one by one", mode: "amber" });
      await wait(1900); if (!alive()) break;
      setHot(true);
      setCap({ label: "Dead air after hello, before question one", mode: "red" });
      await wait(2100); if (!alive()) break;
      setFix(true);
      setCap({ label: "Everything shipped: 71% of screens complete", mode: "green" });
      await wait(2600);
    }
  });

  return (
    <div className="ds-fit" ref={(n) => { fitRef.current = n; loopRef.current = n; }}>
      <div className="ds-root ds-root--scaf cj" ref={frameRef}>
        <div className="cj-row">
          {STAGES.map((s, i) => (
            <div className="cj-cell" key={s.key}>
              <div
                className="cj-stage"
                data-in={i < inCount}
                data-hot={hot && s.key === "engage" && !fix}
                data-dim={hot && s.key !== "engage" && !fix}
                data-win={fix && s.key === "outcome"}
              >
                <span className="cj-name">{s.name}</span>
                <span className="cj-stat" data-on={statsOn}>{fix && s.key === "outcome" ? "71%" : s.stat}</span>
                <span className="cj-sub" data-on={statsOn}>{fix && s.key === "outcome" ? "of connected calls complete" : s.sub}</span>
                {s.key === "engage" && (
                  <span className="cj-fix" data-on={fix}>“Are you still there?”</span>
                )}
              </div>
              {i < STAGES.length - 1 && (
                <span className="cj-arrow" data-in={i < inCount - 1} data-cut={hot && !fix && i >= 3} aria-hidden="true" />
              )}
            </div>
          ))}
        </div>
        <p className="cj-verdict" data-on={hot}>
          The failure is us, not them: the journey breaks right after the candidate does the hard part, answering.
        </p>
        <Caption mode={cap.mode} label={cap.label} style={{ left: "50%", bottom: 12, transform: "translateX(-50%)" }} />
      </div>
    </div>
  );
}
