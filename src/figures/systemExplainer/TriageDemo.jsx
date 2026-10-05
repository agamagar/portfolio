import { useFitScale, useStepSequence } from "../ds/hooks";
import "./triageDemo.css";

// System-Explainer · TRIAGE archetype (from the §12 universe research).
// Many items are already sorted into a priority ORDER; a sliding cut-line fences
// the top-N that actually need action today. Scene = the Dassh "daily report":
// a generated briefing in urgency order (broken -> needs-you -> happened).
//
// Clock: step 1 = the report header lands; steps 2..7 = the six rows fade in
// top-to-bottom and each urgency bar grows to its score; step 8 = the cut-line
// slides down to sit between row 3 and row 4 ("needs you today") — the top 3
// keep their band colour, the bottom 3 dim to grey ("happened, FYI").

const ROWS = [
  { label: "Sales-eng agent stalled", score: 0.95, band: "red" },
  { label: "Shortlist needs your approval", score: 0.82, band: "amber" },
  { label: "3 candidates went cold", score: 0.70, band: "amber" },
  { label: "Pipeline velocity up 12%", score: 0.42, band: "green" },
  { label: "Weekly report sent", score: 0.26, band: "green" },
  { label: "2 interviews scheduled", score: 0.16, band: "green" },
];
const CUT = 3;                 // fence after the 3rd row
const N = ROWS.length + 2;     // 1 header + 6 rows + 1 cut = 8
const W = 620;

export default function TriageDemo() {
  const { ref: seqRef, step } = useStepSequence(N, { lead: 700, beat: 600, hold: 3200 });
  const { fitRef, frameRef } = useFitScale(W, 1);
  const headed = step >= 1;
  const rowIn = (i) => step >= i + 2;   // row i lands at steps 2..7
  const resolved = step >= N;           // step 8 — cut-line dropped

  return (
    <div className="ds-fit" ref={(n) => { fitRef.current = n; seqRef.current = n; }}>
      <div className="ds-root ds-root--away ss-tri" ref={frameRef} style={{ width: W }}>
        <div className={`ss-tri__head${headed ? " is-in" : ""}`}>
          <span className="ss-tri__head-label">Daily report</span>
          <span className="ss-tri__head-sub">12 things happened · sorted by urgency</span>
        </div>

        <div className="ss-tri__list" data-cut={CUT}>
          {ROWS.map((r, i) => {
            const dim = resolved && i >= CUT;     // bottom 3 fade to grey FYI
            return (
              <div
                key={r.label}
                className={`ss-tri__row${rowIn(i) ? " is-in" : ""} ss-tri__row--${r.band}${dim ? " is-dim" : ""}`}
              >
                <span className="ss-tri__rank">{i + 1}</span>
                <span className="ss-tri__label">{r.label}</span>
                <span className="ss-tri__track" aria-hidden>
                  <span
                    className="ss-tri__bar"
                    style={{ transform: `scaleX(${rowIn(i) ? r.score : 0})` }}
                  />
                </span>
              </div>
            );
          })}

          {/* the sliding cut-line — parks above the list until it drops to the fence */}
          <div className={`ss-tri__cut${resolved ? " is-down" : ""}`} aria-hidden>
            <span className="ss-tri__cut-line" />
            <span className="ss-tri__cut-tag">needs you today</span>
          </div>
        </div>

        <div className={`ss-tri__foot${resolved ? " is-on" : ""}`}>
          <b>3</b> need action today · <span className="ss-tri__fyi">9 handled, for the record</span>
        </div>
      </div>
    </div>
  );
}
