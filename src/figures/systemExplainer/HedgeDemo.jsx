import { useFitScale, useStepSequence } from "../ds/hooks";
import "./hedgeDemo.css";

// System-Explainer · HEDGE archetype (from the §12 universe research).
// A conclusion held provisionally: the agent's arrival-time estimate "lands ~16:05"
// is carried as a SPREAD of uncertainty, not collapsed to a false point. As evidence
// arrives the confidence band NARROWS — but never to zero. Scene = the Away agent
// tracking a flight; each fact (gate assigned, boarding, airborne, on approach)
// tightens the band and nudges the centre, ending tight-but-honest.
//
// Clock: step 1 = the wide opening estimate fades in (±35 min, faint); steps 2..5 =
// an evidence chip lands on the left and the band narrows + the centre nudges; step 6
// = resolve, the band settles tight-but-nonzero (±7 min, high confidence).

// Time axis: a strip from 15:30 to 16:45 (75 minutes) mapped across the plot box.
// All geometry is in SVG user units; the viewBox matches the stage box so the band,
// tick marks, and axis labels share one coordinate space and stay pixel-aligned at
// any --ds-scale.
const PW = 588, PH = 196;          // plot box (band strip) ≈ stage box
const PADL = 14, PADR = 14;        // side room inside the SVG
const AX = PH - 40;                // y of the value axis line
const BAND_TOP = 30, BAND_BOT = AX - 8; // vertical extent of the bell band

const T_MIN = 15 * 60 + 30;        // 15:30 in minutes
const T_MAX = 16 * 60 + 45;        // 16:45 in minutes
const X0 = PADL, X1 = PW - PADR;
const tToX = (mins) => X0 + ((mins - T_MIN) / (T_MAX - T_MIN)) * (X1 - X0);
const fmt = (mins) => {
  const h = Math.floor(mins / 60), m = Math.round(mins % 60);
  return `${h}:${String(m).padStart(2, "0")}`;
};

// Evidence beats. Each tightens the half-width (spread, in minutes) of the band and
// nudges the centre estimate. The band narrows monotonically but stops at ±7, never 0.
const STATES = [
  { center: 16 * 60 + 5, spread: 35, chip: null,             conf: "low" },     // step 1: opening
  { center: 16 * 60 + 6, spread: 24, chip: "gate assigned",  conf: "low" },     // step 2
  { center: 16 * 60 + 4, spread: 17, chip: "boarding on time", conf: "fair" },  // step 3
  { center: 16 * 60 + 5, spread: 11, chip: "airborne",       conf: "fair" },    // step 4
  { center: 16 * 60 + 5, spread: 7,  chip: "on approach",    conf: "high" },    // step 5
];
// Chips, in landing order (the opening estimate has none, so chips start at step 2).
const CHIPS = STATES.slice(1).map((s) => s.chip);

const N = STATES.length + 1; // 1 opening + 4 evidence beats + 1 resolve
const W = 620, H = 196;

// Half-bell path: a smooth symmetric hump centred on `cx`, half-width `hw`, drawn as
// a filled area from the axis up to a peak and back down. Cubic curves give the soft
// bell shoulders; the area closes along the axis so it reads as a shaded band.
function bellPath(cx, hw) {
  const l = cx - hw, r = cx + hw, peak = BAND_TOP, base = BAND_BOT;
  const sh = hw * 0.42; // shoulder control offset
  return [
    `M ${l.toFixed(2)} ${base}`,
    `C ${(l + sh).toFixed(2)} ${base} ${(cx - sh).toFixed(2)} ${peak} ${cx.toFixed(2)} ${peak}`,
    `C ${(cx + sh).toFixed(2)} ${peak} ${(r - sh).toFixed(2)} ${base} ${r.toFixed(2)} ${base}`,
    "Z",
  ].join(" ");
}

export default function HedgeDemo() {
  const { ref: seqRef, step } = useStepSequence(N, { lead: 700, beat: 600, hold: 3200 });
  const { fitRef, frameRef } = useFitScale(W, 1);

  // Clamp the active evidence index to the last real state once we hit resolve.
  const sIdx = Math.min(Math.max(step - 1, 0), STATES.length - 1);
  const cur = STATES[sIdx];
  const opened = step >= 1;                 // the band is visible from step 1
  const chipIn = (i) => step >= i + 2;      // chip i lands at steps 2..5
  const resolved = step >= N;               // step 6

  const cx = tToX(cur.center);
  const hwMin = cur.spread;
  const hw = (hwMin / (T_MAX - T_MIN)) * (X1 - X0); // half-width in SVG units
  const lo = cur.center - hwMin, hi = cur.center + hwMin;

  // Hour gridlines at 15:30, 16:00, 16:30 for orientation.
  const ticks = [15 * 60 + 30, 16 * 60, 16 * 60 + 30, 16 * 60 + 45];

  return (
    <div className="ds-fit" ref={(n) => { fitRef.current = n; seqRef.current = n; }}>
      <div className="ds-root ds-root--away ss-hedge" ref={frameRef} style={{ width: W }}>
        <div className="ss-hedge__head">
          <span className="ss-hedge__title">Arrival · AI 2984 → BOM</span>
          <span className={`ss-hedge__conf ss-hedge__conf--${cur.conf}${opened ? " is-on" : ""}`}>
            {cur.conf === "high" ? "high confidence" : cur.conf === "fair" ? "tightening" : "early estimate"}
          </span>
        </div>

        <div className="ss-hedge__stage" style={{ height: H }}>
          <svg className="ss-hedge__plot" viewBox={`0 0 ${PW} ${PH}`} aria-hidden>
            <defs>
              <linearGradient id="ssHedgeBand" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.04" />
                <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.30" />
              </linearGradient>
              <linearGradient id="ssHedgeBandHi" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#22c55e" stopOpacity="0.05" />
                <stop offset="100%" stopColor="#22c55e" stopOpacity="0.34" />
              </linearGradient>
            </defs>

            {/* axis line */}
            <line
              className={`ss-hedge__axis${opened ? " is-on" : ""}`}
              x1={X0} y1={AX} x2={X1} y2={AX} pathLength="1"
            />
            {/* hour ticks + labels along the strip */}
            {ticks.map((t, i) => (
              <g key={t} className={`ss-hedge__tickgrp${opened ? " is-on" : ""}`} style={{ transitionDelay: `${i * 50}ms` }}>
                <line className="ss-hedge__tick" x1={tToX(t)} y1={AX - 4} x2={tToX(t)} y2={AX + 4} />
                <text className="ss-hedge__ticklab" x={tToX(t)} y={AX + 18} textAnchor="middle">{fmt(t)}</text>
              </g>
            ))}

            {/* the confidence band — a soft bell that narrows as evidence lands */}
            <path
              className={`ss-hedge__band${opened ? " is-on" : ""}${resolved ? " is-tight" : ""}`}
              d={bellPath(cx, hw)}
              fill={resolved ? "url(#ssHedgeBandHi)" : "url(#ssHedgeBand)"}
            />
            {/* band edges as faint guides */}
            <line
              className={`ss-hedge__edge${opened ? " is-on" : ""}${resolved ? " is-tight" : ""}`}
              x1={cx - hw} y1={BAND_BOT} x2={cx - hw} y2={BAND_TOP + 4}
            />
            <line
              className={`ss-hedge__edge${opened ? " is-on" : ""}${resolved ? " is-tight" : ""}`}
              x1={cx + hw} y1={BAND_BOT} x2={cx + hw} y2={BAND_TOP + 4}
            />

            {/* centre tick — the point estimate, held provisionally */}
            <line
              className={`ss-hedge__center${opened ? " is-on" : ""}${resolved ? " is-tight" : ""}`}
              x1={cx} y1={BAND_TOP - 2} x2={cx} y2={AX}
            />
            <text
              className={`ss-hedge__estimate${opened ? " is-on" : ""}${resolved ? " is-tight" : ""}`}
              x={cx} y={BAND_TOP - 8} textAnchor="middle"
            >{fmt(cur.center)}</text>

            {/* the spread readout, riding just under the axis at band centre */}
            <text
              className={`ss-hedge__spread${opened ? " is-on" : ""}`}
              x={cx} y={AX + 34} textAnchor="middle"
            >{`±${hwMin} min · ${fmt(lo)}–${fmt(hi)}`}</text>
          </svg>
        </div>

        <div className="ss-hedge__feed">
          {CHIPS.map((c, i) => (
            <span key={c} className={`ss-hedge__chip${chipIn(i) ? " is-in" : ""}${resolved && i === CHIPS.length - 1 ? " is-last" : ""}`}>
              <span className="ss-hedge__chip-dot" aria-hidden />
              {c}
            </span>
          ))}
        </div>

        <div className={`ss-hedge__result${resolved ? " is-on" : ""}`}>
          Lands <b>around 16:05</b>, now <span className="ss-hedge__tightspan">±7 min</span> &nbsp;·&nbsp;
          I narrow it as I learn, <b>I never fake a single number</b>.
        </div>
      </div>
    </div>
  );
}
