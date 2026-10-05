import { useFitScale, useStepSequence } from "../ds/hooks";
import "./spineDemo.css";

// System-Explainer · SPINE / ROOT-CAUSE archetype (Ishikawa / fishbone).
// One EFFECT has many contributing causes that cluster into a few CATEGORIES.
// Scene = "Why do carts abandon?" (Zepto/Dassh). A horizontal spine arrow points
// RIGHT to the effect head; off the spine grow 4 angled category bones (2 up, 2
// down), each sprouting 2 short sub-cause ticks. The dominant cause then lights
// amber as the likely root. Resolve = "clusters first, then the one that matters."
//
// Clock (N steps): 1 = effect head appears; 2 = the spine draws to it; 3..6 = the
// four bones grow out one by one (each with its two sub-cause ticks); 7 = resolve,
// the dominant sub-cause (UX · "slow page") highlights amber as likely root cause.

// SVG user space matches the content box (frame W minus 2×16 padding) so absolute
// text/line coords stay pixel-aligned with the DOM at any --ds-scale, and nothing
// can overflow the frame edges.
const VW = 588, VH = 320;

// Spine geometry: a horizontal line from the left margin to the effect head.
const SPINE_Y = 160;
const SPINE_X0 = 28;     // tail (left)
const SPINE_X1 = 420;    // where the spine meets the effect head box
const HEAD_X = 420;      // left edge of the effect head box

// Each bone leaves the spine at `bx` and rises/falls at a fixed diagonal to its
// category label. Sub-cause ticks branch off the bone at two points along it.
// dir = -1 bone goes UP, +1 bone goes DOWN. The two top bones and two bottom
// bones are evenly spaced along the spine; the diagonal run keeps them tidy and
// inside the frame.
const BONE_DX = 70;      // horizontal run of the bone from spine to its tip
const BONE_DY = 104;     // vertical rise/fall of the bone tip from the spine

const BONES = [
  {
    cat: "Price", accent: "amber", bx: 120, dir: -1,
    subs: ["fees at checkout", "no coupon"],
  },
  {
    cat: "Trust", accent: "blue", bx: 290, dir: -1,
    subs: ["unknown seller", "refund doubts"],
  },
  {
    cat: "UX", accent: "blue", bx: 150, dir: 1, dominant: true,
    subs: ["slow page", "address friction"],
  },
  {
    cat: "Delivery", accent: "blue", bx: 320, dir: 1,
    subs: ["slot full", "high ETA"],
  },
];

// Resolve geometry for one bone: base point on the spine + tip point at the label.
function boneGeom(b) {
  const x1 = b.bx, y1 = SPINE_Y;
  const x2 = b.bx + BONE_DX, y2 = SPINE_Y + b.dir * BONE_DY;
  return { x1, y1, x2, y2 };
}
// A sub-cause tick sits at fraction `t` along the bone, sticking out horizontally
// to the right toward its label.
function subPoint(b, t) {
  const g = boneGeom(b);
  const px = g.x1 + (g.x2 - g.x1) * t;
  const py = g.y1 + (g.y2 - g.y1) * t;
  return { px, py };
}

const N = 7; // 1 head + 1 spine + 4 bones + 1 resolve
const W = 620;

export default function SpineDemo() {
  const { ref: seqRef, step } = useStepSequence(N, { lead: 700, beat: 600, hold: 3200 });
  const { fitRef, frameRef } = useFitScale(W, 1);

  const head = step >= 1;            // effect head appears
  const spine = step >= 2;           // spine draws to the head
  const boneOn = (i) => step >= 3 + i; // bones grow at steps 3..6
  const resolved = step >= N;        // step 7: dominant cause highlights

  return (
    <div className="ds-fit" ref={(n) => { fitRef.current = n; seqRef.current = n; }}>
      <div className="ds-root ds-root--away ss-spine" ref={frameRef} style={{ width: W }}>
        <div className="ss-spine__head-row">
          <span className="ss-spine__title">Why do carts abandon?</span>
          <span className="ss-spine__sub">root-cause · cluster the causes</span>
        </div>

        <div className="ss-spine__stage" style={{ height: VH }}>
          <svg className="ss-spine__bone" viewBox={`0 0 ${VW} ${VH}`} aria-hidden>
            {/* spine arrow: line + arrowhead, draws toward the effect head */}
            <line
              className={`ss-spine__spine${spine ? " is-on" : ""}`}
              x1={SPINE_X0} y1={SPINE_Y} x2={SPINE_X1} y2={SPINE_Y} pathLength="1"
            />
            <polyline
              className={`ss-spine__arrow${spine ? " is-on" : ""}`}
              points={`${SPINE_X1 - 11},${SPINE_Y - 6} ${SPINE_X1},${SPINE_Y} ${SPINE_X1 - 11},${SPINE_Y + 6}`}
            />

            {/* bones + sub-cause ticks */}
            {BONES.map((b, i) => {
              const g = boneGeom(b);
              const on = boneOn(i);
              const dim = resolved && !b.dominant;
              return (
                <g
                  key={b.cat}
                  className={
                    `ss-spine__group${on ? " is-on" : ""}` +
                    `${b.dominant && resolved ? " is-root" : ""}${dim ? " is-dim" : ""}`
                  }
                >
                  {/* the bone */}
                  <line
                    className="ss-spine__rib"
                    x1={g.x1} y1={g.y1} x2={g.x2} y2={g.y2} pathLength="1"
                  />
                  {/* two sub-cause ticks branching off the bone */}
                  {b.subs.map((s, j) => {
                    const t = j === 0 ? 0.42 : 0.82;
                    const p = subPoint(b, t);
                    const tx = p.px + 13;          // tick sticks out to the right
                    const ty = p.py;
                    const labelDom = b.dominant && j === 0; // "slow page" is the root
                    return (
                      <g
                        key={s}
                        className={`ss-spine__sub${labelDom && resolved ? " is-root" : ""}`}
                        style={{ transitionDelay: `${120 + j * 90}ms` }}
                      >
                        <line className="ss-spine__tick" x1={p.px} y1={p.py} x2={tx} y2={ty} pathLength="1" />
                        <text className="ss-spine__sub-text" x={tx + 6} y={ty + 3.5}>{s}</text>
                      </g>
                    );
                  })}
                  {/* the category label chip at the bone tip */}
                  <g className="ss-spine__cat" style={{ transitionDelay: "180ms" }}>
                    <rect
                      className={`ss-spine__cat-box accent-${b.accent}`}
                      x={g.x2 - 4} y={g.y2 - (b.dir < 0 ? 30 : 0)}
                      rx="8" width={catW(b.cat)} height="24"
                    />
                    <text
                      className="ss-spine__cat-text"
                      x={g.x2 - 4 + catW(b.cat) / 2}
                      y={g.y2 - (b.dir < 0 ? 30 : 0) + 16}
                      textAnchor="middle"
                    >{b.cat}</text>
                  </g>
                </g>
              );
            })}

            {/* effect head on the right */}
            <g className={`ss-spine__effect${head ? " is-on" : ""}`}>
              <rect className="ss-spine__effect-box" x={HEAD_X} y={SPINE_Y - 27} rx="12" width="150" height="54" />
              <text className="ss-spine__effect-label" x={HEAD_X + 16} y={SPINE_Y - 7}>EFFECT</text>
              <text className="ss-spine__effect-text" x={HEAD_X + 16} y={SPINE_Y + 13}>Cart abandons</text>
            </g>

            {/* root-cause callout — points to the dominant sub-cause on resolve */}
            <g className={`ss-spine__root-flag${resolved ? " is-on" : ""}`}>
              <text className="ss-spine__root-text" x={subPoint(BONES[2], 0.42).px + 22} y={subPoint(BONES[2], 0.42).py + 22}>
                likely root cause
              </text>
            </g>
          </svg>
        </div>

        <div className={`ss-spine__result${resolved ? " is-on" : ""}`}>
          <b>4</b> cause clusters &nbsp;·&nbsp; the one that moves the needle:{" "}
          <span className="ss-spine__root">UX · slow page</span>
        </div>
      </div>
    </div>
  );
}

// Rough chip width from label length so the rect hugs the category text.
function catW(label) {
  return Math.max(48, 18 + label.length * 8);
}
