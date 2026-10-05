import { useFitScale, useStepSequence } from "../ds/hooks";
import "./fanOutDemo.css";

// System-Explainer · FAN-OUT / GATHER archetype (from the §12 universe research).
// One query dispatches to N sources in parallel, each returns a value, and the
// field reconciles to a winner. The portfolio's signature "deep search / negotiate
// across consolidators" moment, drawn as a hub-and-spoke instead of a timeline.
//
// Clock: step 1 = dispatch (all wires draw, sources scanning); steps 2..6 = fares
// return one by one; step 7 = resolve (cheapest wins, savings revealed).

const SOURCES = [
  { name: "Akbar", fare: "₹17,900", y: 10 },
  { name: "Riya", fare: "₹18,200", y: 68 },
  { name: "Cleartrip", fare: "₹19,100", y: 126 },
  { name: "TBO", fare: "₹17,400", y: 184, win: true },
  { name: "Tripjack", fare: "₹18,600", y: 242 },
];
const N = SOURCES.length + 2; // 1 dispatch + 5 returns + 1 resolve
const W = 620, H = 300, OX = 172, OY = 150; // spoke origin (hub right-mid)

export default function FanOutDemo() {
  const { ref: seqRef, step } = useStepSequence(N, { lead: 700, beat: 600, hold: 3200 });
  const { fitRef, frameRef } = useFitScale(620, 1);
  const dispatched = step >= 1;
  const back = (i) => step >= i + 2;       // fare i returns at steps 2..6
  const resolved = step >= N;              // step 7

  return (
    <div className="ds-fit" ref={(n) => { fitRef.current = n; seqRef.current = n; }}>
      <div className="ds-root ds-root--away ss-fan" ref={frameRef} style={{ width: 620 }}>
        <div className="ss-fan__stage" style={{ height: H }}>
          <svg className="ss-fan__wires" viewBox={`0 0 ${W} ${H}`} aria-hidden>
            {SOURCES.map((s, i) => (
              <line
                key={s.name}
                x1={OX} y1={OY} x2={420} y2={s.y + 19} pathLength="1"
                className={`ss-fan__wire${dispatched ? " is-on" : ""}${resolved && s.win ? " is-win" : ""}`}
                style={{ transitionDelay: `${i * 55}ms` }}
              />
            ))}
          </svg>

          <div className="ss-fan__hub" style={{ left: 16, top: 121 }}>
            <span className="ss-fan__hub-label">Deep search</span>
            <span className="ss-fan__hub-trip">BLR → GOI · 2 adults</span>
            <span className={`ss-fan__hub-pulse${dispatched && !resolved ? " is-on" : ""}`} aria-hidden />
          </div>

          {SOURCES.map((s, i) => (
            <div
              key={s.name}
              className={`ss-fan__src${dispatched ? " is-in" : ""}${back(i) ? " is-back" : ""}${resolved && s.win ? " is-win" : ""}`}
              style={{ left: 420, top: s.y }}
            >
              <span className="ss-fan__src-name">{s.name}</span>
              <span className="ss-fan__src-fare">
                {back(i) ? s.fare : <span className="ss-fan__scan">scanning</span>}
              </span>
              {resolved && s.win && <span className="ss-fan__src-tag">negotiated</span>}
            </div>
          ))}
        </div>

        <div className={`ss-fan__result${resolved ? " is-on" : ""}`}>
          Best of <b>5</b> consolidators: <b>₹17,400</b> &nbsp;·&nbsp; public ₹19,400 &nbsp;·&nbsp;
          <span className="ss-fan__save">you save ₹2,000</span>
        </div>
      </div>
    </div>
  );
}
