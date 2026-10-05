import { useFitScale, useStepSequence } from "../ds/hooks";
import "./watchDemo.css";

// System-Explainer · WATCH archetype (from the §12 universe research).
// State held quietly over a long stretch: mostly nothing visible, earning
// attention only at the rare right moment. Scene = the Away agent as a silent
// steward — it watches your trip for weeks, mostly does nothing, then catches
// ONE thing early. A long calm sparkline spans the frame with faint week ticks;
// dim check-dots mark routine checks ("checked fare", "checked docs"). Near the
// end, ONE spike rises sharply, an amber alert chip pops ("Passport expires
// before your return"), and the agent acts ("flagged you, 6 weeks early").
// The whole point is the contrast: long calm, one spike.
//
// Clock (N steps): the sparkline draws left-to-right across the first beats,
// passing dim check-dots as it goes (calm, nothing happening); then THE SPIKE
// rises; then the ALERT chip pops with an amber flag; then the agent's callback
// chip appears. Resolve = a quiet footer "Watched 3 weeks. Spoke once."

const W = 620;
// SVG content box = frame width minus the 16px side padding on each side.
const PW = W - 32;          // 588
const PH = 300;
const PADL = 8, PADR = 8;   // tiny breathing room so the line never kisses an edge
const X0 = PADL, X1 = PW - PADR;
const BASE = 196;           // the calm baseline (low in the stage)
const lerpX = (t) => X0 + t * (X1 - X0); // t 0..1 across the timeline

// The sparkline as a flat, faintly-undulating calm line that lives near BASE,
// then erupts in ONE spike near ~75% across before settling back down. Points
// are in SVG user units; `t` is the fraction across so check-dots/ticks align.
const SPIKE_T = 0.76;                 // where the one spike happens
const SPIKE_X = lerpX(SPIKE_T);
const SPIKE_PEAK = 80;                // y of the spike apex (high = small y); leaves
                                      // room above for the alert chip to clear the top
// Calm undulation: micro wobble around BASE so it reads "alive but quiet".
const calm = (t, amp = 4) => BASE - amp * Math.sin(t * Math.PI * 7);
// The full path: calm line up to the spike, the sharp spike, then calm tail.
function buildPath() {
  const pre = [];
  for (let i = 0; i <= 30; i++) {
    const t = (SPIKE_T - 0.02) * (i / 30);
    pre.push(`${lerpX(t).toFixed(1)},${calm(t).toFixed(1)}`);
  }
  // sharp spike up then back down (a narrow triangle)
  const spike = [
    `${(SPIKE_X - 16).toFixed(1)},${calm(SPIKE_T - 0.03).toFixed(1)}`,
    `${SPIKE_X.toFixed(1)},${SPIKE_PEAK}`,
    `${(SPIKE_X + 16).toFixed(1)},${calm(SPIKE_T + 0.03).toFixed(1)}`,
  ];
  const post = [];
  for (let i = 0; i <= 14; i++) {
    const t = (SPIKE_T + 0.05) + (1 - (SPIKE_T + 0.05)) * (i / 14);
    post.push(`${lerpX(t).toFixed(1)},${calm(t).toFixed(1)}`);
  }
  return [...pre, ...spike, ...post].join(" ");
}
const LINE_PTS = buildPath();

// Week ticks across the span — the long stretch being watched.
const WEEKS = [
  { t: 0.04, label: "Wk 1" },
  { t: 0.37, label: "Wk 2" },
  { t: 0.70, label: "Wk 3" },
];

// Routine check-dots: dim markers of the agent quietly doing its job. Each is
// tied to a step so they appear as the line draws past them. The last one (docs)
// is the check that turns up the problem, so it gets a faint amber tint later.
const CHECKS = [
  { t: 0.13, label: "checked fare" },
  { t: 0.30, label: "checked fare" },
  { t: 0.48, label: "checked docs" },
  { t: 0.63, label: "checked fare" },
];

// Steps: 1..4 = the line draws past the check-dots (calm); 5 = the spike rises;
// 6 = the alert chip pops; 7 = the agent's callback chip. Resolve at N.
const N = 7;
const DRAW_STEPS = 4; // the line is fully drawn (incl. spike approach) by step 4

export default function WatchDemo() {
  const { ref: seqRef, step } = useStepSequence(N, { lead: 700, beat: 600, hold: 3200 });
  const { fitRef, frameRef } = useFitScale(W, 1);

  // The line draws in across the calm beats; we map step→fraction so the
  // stroke-dashoffset retreats as the watch advances. By step 5 the spike has
  // risen, so the line is essentially fully drawn well before then.
  const drawFrac = Math.min(1, step / (DRAW_STEPS + 1));
  const spiked = step >= 5;       // the one spike rises
  const alerted = step >= 6;      // the amber alert chip pops
  const acted = step >= 7;        // the agent flags you
  const resolved = step >= N;

  // A check-dot is "lit" once the line has drawn at least to its position.
  const checkLit = (t) => drawFrac >= t - 0.02;

  return (
    <div className="ds-fit" ref={(n) => { fitRef.current = n; seqRef.current = n; }}>
      <div className="ds-root ds-root--away ss-watch" ref={frameRef} style={{ width: W }}>
        <div className="ss-watch__head">
          <span className="ss-watch__title">Watching your trip · BLR → GOI</span>
          <span className={`ss-watch__status${alerted ? " is-alert" : ""}`}>
            <span className="ss-watch__status-dot" aria-hidden />
            {alerted ? "needs you" : "all quiet"}
          </span>
        </div>

        <div className="ss-watch__stage" style={{ height: PH }}>
          <svg className="ss-watch__svg" viewBox={`0 0 ${PW} ${PH}`} aria-hidden>
            {/* faint baseline rail the calm line rides on */}
            <line className="ss-watch__rail" x1={X0} y1={BASE} x2={X1} y2={BASE} />

            {/* week tick guides */}
            {WEEKS.map((w) => (
              <line
                key={w.label}
                className="ss-watch__tick"
                x1={lerpX(w.t)} y1={40} x2={lerpX(w.t)} y2={BASE + 18}
              />
            ))}

            {/* the calm→spike sparkline, drawn left-to-right via dashoffset */}
            <polyline
              className={`ss-watch__line${spiked ? " is-spiked" : ""}`}
              points={LINE_PTS}
              pathLength="1"
              style={{ strokeDashoffset: 1 - drawFrac }}
            />

            {/* a soft glow at the spike apex once it rises */}
            <circle
              className={`ss-watch__apex${spiked ? " is-on" : ""}`}
              cx={SPIKE_X} cy={SPIKE_PEAK} r="5"
            />

            {/* week labels (inside the SVG, sharing the line's coordinate space) */}
            {WEEKS.map((w) => (
              <text
                key={w.label}
                className="ss-watch__wk"
                x={lerpX(w.t) + 6} y={BASE + 30}
              >{w.label}</text>
            ))}
          </svg>

          {/* routine check-dots — dim markers of quiet, uneventful work */}
          {CHECKS.map((c, i) => (
            <span
              key={i}
              className={`ss-watch__check${checkLit(c.t) ? " is-lit" : ""}`}
              style={{ left: lerpX(c.t), top: calm(c.t) }}
            >
              <span className="ss-watch__check-dot" aria-hidden />
              <span className="ss-watch__check-label">{c.label}</span>
            </span>
          ))}

          {/* the alert chip — pops above the spike with an amber flag */}
          <div
            className={`ss-watch__alert${alerted ? " is-on" : ""}`}
            style={{ left: SPIKE_X, top: SPIKE_PEAK }}
          >
            <span className="ss-watch__flag" aria-hidden>⚑</span>
            <span className="ss-watch__alert-body">
              <span className="ss-watch__alert-title">Passport expires before your return</span>
              <span className="ss-watch__alert-sub">valid to 12 Aug · you fly home 19 Aug</span>
            </span>
          </div>
        </div>

        {/* the agent's callback — it speaks, once, six weeks early */}
        <div className={`ss-watch__act${acted ? " is-on" : ""}`}>
          <span className="ss-watch__avatar" aria-hidden>◆</span>
          <span className="ss-watch__act-text">
            Flagged you <b>6 weeks early</b>, renew now and nothing slips.
          </span>
        </div>

        <div className={`ss-watch__result${resolved ? " is-on" : ""}`}>
          Watched <b>3 weeks</b> &nbsp;·&nbsp; <b>214</b> quiet checks &nbsp;·&nbsp;
          <span className="ss-watch__once">spoke once</span>
        </div>
      </div>
    </div>
  );
}
