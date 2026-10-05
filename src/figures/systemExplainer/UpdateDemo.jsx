import { useFitScale, useStepSequence } from "../ds/hooks";
import "./updateDemo.css";

// System-Explainer · UPDATE (Bayesian) archetype (from the §12 universe research).
// A belief's CONFIDENCE number moves as each piece of evidence arrives — and the
// ORDER matters, because the running posterior is what each new delta acts on.
// Scene = Zepto face-authentication (the ZepIris / OdinEye system deciding "is
// this the right person?"): evidence chips accumulate on the left, a big
// confidence readout + a probability bar on the right tween to each new value.
//
// Clock: step 0 = prior (50%); steps 1..5 = one evidence chip lands and the
// posterior moves; step 5 held = resolve at ~92% with a "Verified" verdict.

// prior + signed deltas; running posterior is derived (order matters).
const PRIOR = 50;
const EVIDENCE = [
  { label: "Face match 0.94", delta: 18, dir: "up" },
  { label: "Liveness passed", delta: 13, dir: "up" },
  { label: "Same device as usual", delta: 9, dir: "up" },
  { label: "Location 40km off", delta: -6, dir: "down" },
  { label: "Gait/pose consistent", delta: 8, dir: "up" },
];
// posterior after each step: [50, 68, 81, 90, 84, 92]
const POSTERIOR = EVIDENCE.reduce(
  (acc, e) => [...acc, acc[acc.length - 1] + e.delta],
  [PRIOR]
);

const N = EVIDENCE.length; // 5 evidence beats
const W = 620;
const VERIFY_AT = 85; // bar turns green past this

export default function UpdateDemo() {
  const { ref: seqRef, step } = useStepSequence(N, { lead: 700, beat: 600, hold: 3200 });
  const { fitRef, frameRef } = useFitScale(W, 1);

  const conf = POSTERIOR[step];          // current posterior for the readout/bar
  const lastDelta = step >= 1 ? EVIDENCE[step - 1].delta : null;
  const verified = step >= N;            // resolved at the final value
  const past = conf >= VERIFY_AT;        // bar tips into green

  return (
    <div className="ds-fit" ref={(n) => { fitRef.current = n; seqRef.current = n; }}>
      <div className="ds-root ds-root--away ss-upd" ref={frameRef} style={{ width: W }}>
        <div className="ss-upd__stage">
          {/* LEFT — evidence accumulating one chip per step */}
          <div className="ss-upd__evidence">
            <span className="ss-upd__col-label">Evidence</span>
            <div className="ss-upd__prior">
              <span className="ss-upd__prior-k">Prior belief</span>
              <span className="ss-upd__prior-v">{PRIOR}%</span>
            </div>
            <ul className="ss-upd__chips">
              {EVIDENCE.map((e, i) => {
                const shown = step >= i + 1;
                const down = e.dir === "down";
                return (
                  <li
                    key={e.label}
                    className={`ss-upd__chip${shown ? " is-in" : ""}${down ? " is-down" : ""}`}
                  >
                    <span className="ss-upd__chip-dot" aria-hidden />
                    <span className="ss-upd__chip-label">{e.label}</span>
                    <span className="ss-upd__chip-delta">
                      {e.delta > 0 ? `+${e.delta}` : e.delta}
                    </span>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* RIGHT — the belief: big readout + probability bar */}
          <div className="ss-upd__belief">
            <span className="ss-upd__col-label">Confidence · right person?</span>

            <div className="ss-upd__readout">
              <span className="ss-upd__pct" key={conf}>{conf}</span>
              <span className="ss-upd__pct-sign">%</span>
              {lastDelta !== null && (
                <span
                  className={`ss-upd__badge${lastDelta < 0 ? " is-down" : ""}`}
                  key={`b${step}`}
                >
                  {lastDelta > 0 ? `+${lastDelta}` : lastDelta}
                </span>
              )}
            </div>

            <div className="ss-upd__bar">
              <span
                className={`ss-upd__bar-fill${past ? " is-past" : ""}`}
                style={{ width: `${conf}%` }}
              />
              <span className="ss-upd__bar-thresh" style={{ left: `${VERIFY_AT}%` }} aria-hidden>
                <span className="ss-upd__bar-thresh-tick" />
                <span className="ss-upd__bar-thresh-label">verify {VERIFY_AT}</span>
              </span>
            </div>

            <div className={`ss-upd__verdict${verified ? " is-on" : ""}`}>
              <span className="ss-upd__verdict-tick" aria-hidden>✓</span>
              <span className="ss-upd__verdict-text">Verified</span>
              <span className="ss-upd__verdict-sub">5 signals · order-aware</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
