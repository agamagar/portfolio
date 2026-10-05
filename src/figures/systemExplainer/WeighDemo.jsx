import { useFitScale, useStepSequence } from "../ds/hooks";
import "./weighDemo.css";

// System-Explainer · WEIGH archetype (from the §12 universe research).
// Reasons for and against are weighed until one side tips the balance. Scene =
// the Away agent deciding "book this fare now, or wait?". A literal balance:
// a central fulcrum, a beam that ROTATES around its pivot, and two pans that
// hang from the beam ends — BOOK NOW on the left, WAIT on the right. Reason chips
// drop onto each pan one per step; after each, the beam tips toward the heavier
// side and the pans drop/rise with it. It ends tipped to BOOK NOW: 3 reasons vs
// 2, and the scarce ones weigh more.
//
// Clock (N steps): chips land staggered, alternating pans; the beam tips a bit
// more each beat; the final step delivers the verdict chip + one-line rationale.
//
// Animation is driven by two transforms keyed off `deg`, both of which CSS can
// transition smoothly: the beam <g> rotates, and each pan assembly translates
// vertically. The horizontal swing of the beam ends at ≤11° is ~4px and visually
// negligible, so the pans stay at a fixed x and only ride up/down — which keeps
// the trays level and the text upright (gravity), and avoids un-transitionable
// SVG endpoint-attribute animation.

const W = 620, H = 312;

// Balance geometry in the unscaled SVG coordinate space. The SVG fills the full
// stage width so the beam + pans stay pixel-aligned at any --ds-scale.
const PW = 588, PH = H;            // plot box ≈ frame content box (W - 2*16 padding)
const CX = PW / 2;                 // fulcrum x (centered)
const PIVOT_Y = 92;                // y of the beam pivot (top of the fulcrum)
const ARM = 188;                   // half-beam length (pan hang point from pivot)
const STRING = 52;                 // hang-string length (pivot-level beam end → tray top)
const PAN_W = 152;                 // pan tray width
const LX = CX - ARM, RX = CX + ARM; // fixed pan x-centers (left = book, right = wait)
const TRAY_Y = PIVOT_Y + STRING;    // tray-top y at level

// Each reason carries a weight; "scarce" reasons weigh more. The book side wins
// on both count (3 v 2) and total weight. Order = the beats they land in.
const REASONS = [
  { side: "book", text: "fare dropped 11%", weight: 1.0 },
  { side: "wait", text: "prices dip midweek", weight: 0.8 },
  { side: "book", text: "under 5 seats left", weight: 1.5, scarce: true },
  { side: "wait", text: "fare is refundable", weight: 0.7 },
  { side: "book", text: "your dates are fixed", weight: 1.3, scarce: true },
];

const N = REASONS.length + 1; // 5 chips land (steps 1..5) + 1 verdict (step 6)

// Cumulative net weight after step s (book minus wait, over landed reasons),
// mapped to a capped beam rotation. Positive => book (left) is heavier.
function tiltAt(s) {
  let net = 0;
  for (let i = 0; i < Math.min(s, REASONS.length); i++) {
    const r = REASONS[i];
    net += r.side === "book" ? r.weight : -r.weight;
  }
  return Math.max(-11, Math.min(11, net * 3.4)); // degrees, capped to stay in frame
}

export default function WeighDemo() {
  const { ref: seqRef, step } = useStepSequence(N, { lead: 700, beat: 600, hold: 3200 });
  const { fitRef, frameRef } = useFitScale(W, 1);

  const landed = (i) => step >= i + 1;     // reason i lands at step i+1 (1..5)
  const resolved = step >= N;              // step 6: verdict

  const deg = tiltAt(step);                // + => book (left) heavier
  const drop = ARM * Math.sin((deg * Math.PI) / 180); // vertical travel of a beam end
  // Left side sinks by +drop when book is heavier; right side rises by -drop.
  const bookDrop = drop;
  const waitDrop = -drop;

  const bookReasons = REASONS.filter((r) => r.side === "book");
  const waitReasons = REASONS.filter((r) => r.side === "wait");

  // Pan tray path at level (px = its x-center). Vertical motion is applied by the
  // wrapping group's translateY, so the path itself is static.
  const tray = (px) =>
    `M ${px - PAN_W / 2} ${TRAY_Y} L ${px + PAN_W / 2} ${TRAY_Y} ` +
    `L ${px + PAN_W / 2 - 14} ${TRAY_Y + 18} L ${px - PAN_W / 2 + 14} ${TRAY_Y + 18} Z`;

  return (
    <div className="ds-fit" ref={(n) => { fitRef.current = n; seqRef.current = n; }}>
      <div className="ds-root ds-root--away ss-weigh" ref={frameRef} style={{ width: W }}>
        <div className="ss-weigh__head">
          <span className="ss-weigh__head-label">Weighing the call</span>
          <span className="ss-weigh__head-q">Book this fare now, or wait?</span>
        </div>

        <div className="ss-weigh__stage" style={{ height: H }}>
          <svg className="ss-weigh__svg" viewBox={`0 0 ${PW} ${PH}`} aria-hidden>
            {/* fulcrum post + triangle + ground line */}
            <line className="ss-weigh__post" x1={CX} y1={PIVOT_Y} x2={CX} y2={PH - 28} />
            <polygon
              className="ss-weigh__fulcrum"
              points={`${CX},${PIVOT_Y - 1} ${CX - 24},${PH - 28} ${CX + 24},${PH - 28}`}
            />
            <line className="ss-weigh__ground" x1={CX - 92} y1={PH - 28} x2={CX + 92} y2={PH - 28} />

            {/* the beam — rotates about the pivot by `deg` */}
            <g
              className="ss-weigh__beamrot"
              style={{ transform: `rotate(${deg}deg)`, transformOrigin: `${CX}px ${PIVOT_Y}px` }}
            >
              <line className="ss-weigh__beam" x1={LX} y1={PIVOT_Y} x2={RX} y2={PIVOT_Y} />
              <circle className="ss-weigh__beam-cap" cx={LX} cy={PIVOT_Y} r="4" />
              <circle className="ss-weigh__beam-cap" cx={RX} cy={PIVOT_Y} r="4" />
            </g>
            <circle className="ss-weigh__pivot" cx={CX} cy={PIVOT_Y} r="6" />

            {/* left pan assembly (BOOK) — string + tray, ride down by bookDrop */}
            <g className="ss-weigh__panrot" style={{ transform: `translateY(${bookDrop}px)` }}>
              <line className="ss-weigh__string" x1={LX} y1={PIVOT_Y} x2={LX} y2={TRAY_Y} />
              <path className={`ss-weigh__tray is-book${resolved ? " is-win" : ""}`} d={tray(LX)} />
            </g>
            {/* right pan assembly (WAIT) — ride up by waitDrop */}
            <g className="ss-weigh__panrot" style={{ transform: `translateY(${waitDrop}px)` }}>
              <line className="ss-weigh__string" x1={RX} y1={PIVOT_Y} x2={RX} y2={TRAY_Y} />
              <path className="ss-weigh__tray is-wait" d={tray(RX)} />
            </g>
          </svg>

          {/* HTML overlay: pan labels, reason chips, verdict. Each side is wrapped in
              a group translated by the same drop so it rides with its tray. */}
          <div className="ss-weigh__pangroup" style={{ transform: `translateY(${bookDrop}px)` }}>
            <span className={`ss-weigh__panlabel is-book${resolved ? " is-win" : ""}`} style={{ left: LX, top: TRAY_Y + 28 }}>
              BOOK NOW
            </span>
            {bookReasons.map((r, k) => {
              const i = REASONS.indexOf(r);
              return (
                <span
                  key={r.text}
                  className={`ss-weigh__chip is-book${r.scarce ? " is-scarce" : ""}${landed(i) ? " is-in" : ""}`}
                  style={{ left: LX, top: TRAY_Y - 12 - k * 26 }}
                >
                  {r.text}
                  {r.scarce && <span className="ss-weigh__heavy" aria-hidden>weighs more</span>}
                </span>
              );
            })}
            <span
              className={`ss-weigh__verdict${resolved ? " is-on" : ""}`}
              style={{ left: LX, top: TRAY_Y - 12 - bookReasons.length * 26 - 8 }}
            >
              <span className="ss-weigh__verdict-dot" aria-hidden />
              Book now
            </span>
          </div>

          <div className="ss-weigh__pangroup" style={{ transform: `translateY(${waitDrop}px)` }}>
            <span className="ss-weigh__panlabel is-wait" style={{ left: RX, top: TRAY_Y + 28 }}>
              WAIT
            </span>
            {waitReasons.map((r, k) => {
              const i = REASONS.indexOf(r);
              return (
                <span
                  key={r.text}
                  className={`ss-weigh__chip is-wait${landed(i) ? " is-in" : ""}`}
                  style={{ left: RX, top: TRAY_Y - 12 - k * 26 }}
                >
                  {r.text}
                </span>
              );
            })}
          </div>
        </div>

        <div className={`ss-weigh__result${resolved ? " is-on" : ""}`}>
          Tips to <b>book now</b> &nbsp;·&nbsp; <b>3</b> reasons vs <b>2</b>,
          and the <span className="ss-weigh__scarce">scarce ones weigh more</span>
        </div>
      </div>
    </div>
  );
}
