import { useFitScale, useStepSequence } from "../ds/hooks";
import "./tradeOffDemo.css";

// System-Explainer · TRADE-OFF / PARETO archetype (from the §12 universe research).
// No option wins on every axis; the honest answer is the Pareto frontier. Scene =
// choosing a flight, cheap vs fast, as a 2D scatter: x = price (left cheaper),
// y = total time (down faster), so the lower-left corner is best. Seven flights
// plot in; three are non-dominated (cheapest, balanced, fastest) and form a
// lower-left staircase; the other four are beaten on both axes and dim out.
//
// Clock: step 1 = axes draw; steps 2..8 = dots plot in one by one; step 9 = the
// frontier line draws + the 4 dominated dots grey out; step 10 = resolve, the
// three frontier labels pop ("cheapest", "the balance", "fastest").

// Plot geometry (SVG user units). The viewBox matches the rendered stage aspect
// (≈ frame width minus padding × stage height), so the SVG fills the stage with
// no letterboxing - which is why axis labels + dot tags can live INSIDE the SVG
// and stay pixel-aligned with the dots at any --ds-scale.
const PW = 588, PH = 300;          // plot box ≈ stage box
const PADL = 40, PADR = 96;        // left room for y label; right room for dot tags
const PADT = 18, PADB = 30;        // top room for tags; bottom room for x label
const X0 = PADL, X1 = PW - PADR;   // drawable x range
const Y0 = PADT, Y1 = PH - PADB;   // drawable y range
const lerpX = (t) => X0 + t * (X1 - X0); // t 0..1, 0 = cheapest (left)
const lerpY = (t) => Y0 + t * (Y1 - Y0); // t 0..1, 0 = fastest (top)

// Flights in normalised (price, time) space - 0 = best on that axis. The three
// Pareto-optimal points (pareto) trace a clean lower-left staircase; the other
// four each sit up-and-right of a frontier point, so they're dominated on both.
// The three Pareto points are a (cheapest), c (balanced), g (fastest). Every
// other flight sits strictly up-and-right of one of them, so it is dominated on
// BOTH price and time: d1/d2 are beaten by a, d3/d4 are beaten by c.
const FLIGHTS = [
  { id: "a",  px: 0.06, ty: 0.86, price: "₹16,400", time: "11h 50m", pareto: "cheapest" },
  { id: "c",  px: 0.46, ty: 0.44, price: "₹21,200", time: "7h 05m",  pareto: "the balance" },
  { id: "g",  px: 0.90, ty: 0.10, price: "₹29,400", time: "4h 55m",  pareto: "fastest" },
  { id: "d1", px: 0.22, ty: 0.93, price: "₹18,700", time: "12h 30m" },
  { id: "d2", px: 0.34, ty: 0.88, price: "₹20,100", time: "12h 05m" },
  { id: "d3", px: 0.60, ty: 0.60, price: "₹24,300", time: "8h 40m" },
  { id: "d4", px: 0.74, ty: 0.52, price: "₹26,500", time: "7h 50m" },
];
// Order in which dots appear (a mild scatter so it doesn't read left-to-right).
const PLOT_ORDER = ["a", "d2", "c", "d4", "g", "d1", "d3"];

const N = 10;        // 1 axes + 7 dots + 1 frontier/dim + 1 labels
const W = 620, H = 300;

export default function TradeOffDemo() {
  const { ref: seqRef, step } = useStepSequence(N, { lead: 700, beat: 600, hold: 3200 });
  const { fitRef, frameRef } = useFitScale(W, 1);

  const axes = step >= 1;
  const dotIn = (id) => step >= 2 + PLOT_ORDER.indexOf(id); // dots plot at steps 2..8
  const frontier = step >= 9;     // line draws, dominated dots grey out
  const labeled = step >= N;      // step 10: labels pop
  const resolved = step >= N;

  // Frontier dots, lower-left staircase order (cheapest → balance → fastest).
  const front = FLIGHTS.filter((f) => f.pareto);
  const frontPts = front.map((f) => `${lerpX(f.px)},${lerpY(f.ty)}`).join(" ");

  return (
    <div className="ds-fit" ref={(n) => { fitRef.current = n; seqRef.current = n; }}>
      <div className="ds-root ds-root--away ss-trade" ref={frameRef} style={{ width: W }}>
        <div className="ss-trade__head">
          <span className="ss-trade__title">BLR → GOI · pick a flight</span>
          <span className="ss-trade__sub">cheap vs fast · no single best</span>
        </div>

        <div className="ss-trade__stage" style={{ height: H }}>
          <svg className="ss-trade__plot" viewBox={`0 0 ${PW} ${PH}`} aria-hidden>
            {/* axis frame */}
            <line
              className={`ss-trade__axis${axes ? " is-on" : ""}`}
              x1={X0} y1={Y1} x2={X1} y2={Y1} pathLength="1"
            />
            <line
              className={`ss-trade__axis${axes ? " is-on" : ""}`}
              x1={X0} y1={Y0} x2={X0} y2={Y1} pathLength="1"
              style={{ transitionDelay: "80ms" }}
            />
            {/* faint inner grid */}
            {[0.33, 0.66].map((g, i) => (
              <line
                key={`gv${i}`}
                className={`ss-trade__grid${axes ? " is-on" : ""}`}
                x1={lerpX(g)} y1={Y0} x2={lerpX(g)} y2={Y1} pathLength="1"
                style={{ transitionDelay: `${160 + i * 40}ms` }}
              />
            ))}
            {[0.33, 0.66].map((g, i) => (
              <line
                key={`gh${i}`}
                className={`ss-trade__grid${axes ? " is-on" : ""}`}
                x1={X0} y1={lerpY(g)} x2={X1} y2={lerpY(g)} pathLength="1"
                style={{ transitionDelay: `${240 + i * 40}ms` }}
              />
            ))}

            {/* frontier line - lower-left staircase, draws on step 9 */}
            <polyline
              className={`ss-trade__front${frontier ? " is-on" : ""}`}
              points={frontPts}
              pathLength="1"
            />

            {/* dots */}
            {FLIGHTS.map((f) => {
              const isPareto = !!f.pareto;
              const dim = frontier && !isPareto;
              return (
                <g
                  key={f.id}
                  className={
                    `ss-trade__pt${dotIn(f.id) ? " is-in" : ""}` +
                    `${isPareto ? " is-pareto" : ""}${dim ? " is-dim" : ""}`
                  }
                >
                  <circle className="ss-trade__halo" cx={lerpX(f.px)} cy={lerpY(f.ty)} r="11" />
                  <circle className="ss-trade__dot" cx={lerpX(f.px)} cy={lerpY(f.ty)} r="5.5" />
                </g>
              );
            })}

            {/* axis labels (inside the SVG, so they share the dot coordinate space) */}
            <text
              className={`ss-trade__xlab${axes ? " is-on" : ""}`}
              x={(X0 + X1) / 2} y={PH - 8} textAnchor="middle"
            >{"cheaper →"}</text>
            <text
              className={`ss-trade__ylab${axes ? " is-on" : ""}`}
              x={14} y={(Y0 + Y1) / 2} textAnchor="middle"
              transform={`rotate(-90 14 ${(Y0 + Y1) / 2})`}
            >{"faster ↓"}</text>

            {/* frontier dot tags - pop on the final step, up-and-right of the dot */}
            {front.map((f) => (
              <text
                key={f.id}
                className={`ss-trade__tag${labeled ? " is-on" : ""}`}
                x={lerpX(f.px) + 12} y={lerpY(f.ty) + 4}
              >{f.pareto}</text>
            ))}
          </svg>
        </div>

        <div className={`ss-trade__result${resolved ? " is-on" : ""}`}>
          <b>3</b> honest choices on the frontier &nbsp;·&nbsp;
          the other <b>4</b> are <span className="ss-trade__beat">beaten on both</span>
        </div>
      </div>
    </div>
  );
}
