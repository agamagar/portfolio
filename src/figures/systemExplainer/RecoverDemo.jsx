import { useFitScale, useStepSequence } from "../ds/hooks";
import "./recoverDemo.css";

// System-Explainer · RECOVER archetype (from the §12 universe research).
// A confident plan hits a wall and is repaired without losing the goal. The
// Away agent's disruption rescue: a booked itinerary runs left-to-right, the
// connecting flight is cancelled mid-trip, and the agent reroutes onto a new
// protected flight that still makes the arrival. The break stays on screen,
// honestly greyed; the repair grows green from the last good node.
//
// Clock: step 1 = depart lights; step 2 = the playhead reaches the booked
// flight and it turns RED (cancelled); step 3 = the forward path greys to a
// dead stub (held beat of failure); step 4 = a recovery branch grows down +
// forward from the last good node; step 5 = the new flight lights green;
// step 6 = resolve (rebooked, fare covered, you still make the wedding).

const W = 620, H = 300;

// Booked itinerary, left-to-right. y is the top-edge of each node box.
const NODES = [
  { id: "depart", title: "Depart BLR", sub: "09:10",      x: 8,   y: 96 },
  { id: "flight", title: "6E 2014",    sub: "cancelled",  x: 168, y: 96 },
  { id: "connect", title: "Connect",   sub: "Mumbai",     x: 318, y: 96 },
  { id: "arrive", title: "Arrive GOI", sub: "11:30",      x: 468, y: 96 },
];
const NODE_W = 144, NODE_H = 56;
// Recovery resolution node, dropped down-and-forward from the last good node.
const REC = { x: 360, y: 210 };
const REC_W = 232, REC_H = 60;

const N = 6;

export default function RecoverDemo() {
  const { ref: seqRef, step } = useStepSequence(N, { lead: 700, beat: 600, hold: 3200 });
  const { fitRef, frameRef } = useFitScale(W, 1);

  // booked-path progress: how many booked nodes the confident playhead has lit
  const lit = (i) => step >= i + 1;          // node 0 at step1, node 1 at step2
  const cancelled = step >= 2;               // booked flight turns red
  const dead = step >= 3;                    // forward path greys to a dead stub
  const rerouting = step >= 4;               // recovery branch grows
  const recLit = step >= 5;                  // new flight node lights green
  const resolved = step >= N;                // result strip

  // connector centres (frame coordinates)
  const cy = NODES[0].y + NODE_H / 2;        // booked row centre-y
  const edgeX = (i) => NODES[i].x + NODE_W;  // right edge of node i
  const startX = (i) => NODES[i].x;          // left edge of node i

  // last good node = node 0 (depart). Branch starts at its bottom edge.
  const branchX = NODES[0].x + NODE_W / 2;
  const branchY = NODES[0].y + NODE_H;
  const recCx = REC.x;                        // recovery node left edge for entry
  const recCy = REC.y + REC_H / 2;

  return (
    <div className="ds-fit" ref={(n) => { fitRef.current = n; seqRef.current = n; }}>
      <div className="ds-root ds-root--away ss-rec" ref={frameRef} style={{ width: W }}>
        <div className="ss-rec__head">
          <span className="ss-rec__head-label">Disruption rescue</span>
          <span className="ss-rec__head-trip">BLR → GOI · goal: land before the wedding</span>
        </div>

        <div className="ss-rec__stage" style={{ height: H }}>
          <svg className="ss-rec__wires" viewBox={`0 0 ${W} ${H}`} aria-hidden>
            {/* booked connectors between the 4 nodes */}
            {[0, 1, 2].map((i) => {
              // segment after the cancelled flight (i>=1) goes dead grey
              const isDeadSeg = i >= 1;
              return (
                <line
                  key={`seg${i}`}
                  x1={edgeX(i)} y1={cy} x2={startX(i + 1)} y2={cy}
                  pathLength="1"
                  className={
                    "ss-rec__seg" +
                    (lit(i + 1) || (isDeadSeg && dead) ? " is-drawn" : "") +
                    (isDeadSeg && dead ? " is-dead" : "")
                  }
                  style={{ transitionDelay: `${i * 40}ms` }}
                />
              );
            })}

            {/* recovery branch: down from last good node, then forward to new flight */}
            <path
              d={`M ${branchX} ${branchY}
                  L ${branchX} ${recCy - 22}
                  Q ${branchX} ${recCy} ${branchX + 22} ${recCy}
                  L ${recCx} ${recCy}`}
              pathLength="1"
              className={"ss-rec__branch" + (rerouting ? " is-drawn" : "")}
            />
          </svg>

          {/* booked itinerary nodes */}
          {NODES.map((nd, i) => {
            const isCancel = nd.id === "flight";
            return (
              <div
                key={nd.id}
                className={
                  "ss-rec__node" +
                  (lit(i) ? " is-lit" : "") +
                  (isCancel && cancelled ? " is-cancel" : "") +
                  (i >= 2 && dead ? " is-dead" : "")
                }
                style={{ left: nd.x, top: nd.y, width: NODE_W }}
              >
                <span className="ss-rec__node-title">{nd.title}</span>
                <span className="ss-rec__node-sub">
                  {isCancel && cancelled ? "cancelled" : nd.sub}
                </span>
                {isCancel && cancelled && <span className="ss-rec__badge ss-rec__badge--red">×</span>}
              </div>
            );
          })}

          {/* playhead riding the booked path until the wall */}
          <span
            className={"ss-rec__play" + (step >= 1 && !cancelled ? " is-on" : "")}
            style={{
              left: (step >= 1 ? NODES[Math.min(step - 1, 1)].x + NODE_W / 2 : NODES[0].x) - 4,
              top: cy - 4,
            }}
            aria-hidden
          />

          {/* recovery resolution node */}
          <div
            className={"ss-rec__rec" + (rerouting ? " is-in" : "") + (recLit ? " is-lit" : "")}
            style={{ left: REC.x, top: REC.y, width: REC_W }}
          >
            <span className="ss-rec__rec-tag">rerouted</span>
            <div className="ss-rec__rec-body">
              <span className="ss-rec__rec-title">Vistara · 14:20</span>
              <span className="ss-rec__rec-sub">protected · lands 16:05</span>
            </div>
          </div>
        </div>

        <div className={"ss-rec__result" + (resolved ? " is-on" : "")}>
          <b>Rebooked in 40s.</b> Fare difference covered &nbsp;·&nbsp;
          <span className="ss-rec__keep">you still make the wedding.</span>
        </div>
      </div>
    </div>
  );
}
