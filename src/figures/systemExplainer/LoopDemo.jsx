import { useFitScale, useStepSequence } from "../ds/hooks";
import "./loopDemo.css";

// System-Explainer · SENSE-PLAN-ACT archetype (from the §12 universe research).
// The agent core is a closed perceive-decide-act CYCLE, not a line. Scene = the
// Away agent steering a live trip: it SENSES (polls flight/price/docs), PLANS
// (decides the next move), ACTS (rebook / notify / hold), then loops back to
// SENSE. Three nodes sit on a ring with curved arrowed edges forming a closed
// cycle; a single glowing TOKEN orbits the ring, and a world-state chip updates
// each lap as the situation changes under the agent.
//
// Clock (N steps): 0 lead-in (token resting at SENSE). LAP 1 — 1 SENSE
// ("polled: on time"), 2 arc to PLAN ("decide: hold"), 3 arc to ACT
// ("act: notify you"). LAP 2, the world has changed — 4 back to SENSE
// ("polled: delayed 40m"), 5 PLAN ("decide: reroute"), 6 ACT ("act: rebooked").
// 7 = resolve: the loop keeps running, calm — "perceive, decide, act, on repeat."

const W = 600, H = 320;

// Ring geometry. The three nodes sit on a triangle centred in the stage; the
// token orbits clockwise SENSE -> PLAN -> ACT -> SENSE. Coords are in the
// unscaled frame space (the SVG viewBox is the full W so arcs and node anchors
// share one coordinate system).
const CX = 300, CY = 168;          // ring centre
const NODES = {
  sense: { x: CX,       y: CY - 96 }, // top
  plan:  { x: CX + 132, y: CY + 70 }, // bottom-right
  act:   { x: CX - 132, y: CY + 70 }, // bottom-left
};
const ORDER = ["sense", "plan", "act"]; // clockwise

// Per-lap content. Lap 1 = calm steady state; lap 2 = the world shifted, the
// agent re-senses and re-plans. Each entry is what that node "says" on its beat.
const LAPS = [
  { cycle: 1, world: "on time", sense: "polled: on time",     plan: "decide: hold",    act: "act: notify you" },
  { cycle: 2, world: "delayed 40m", sense: "polled: delayed 40m", plan: "decide: reroute", act: "act: rebooked" },
];

const N = 7; // lead-in + 6 beats (two full laps) + resolve

// Quadratic arc from node a to node b, bowed outward from the ring centre so the
// three edges read as a rounded triangle, not straight chords. Returns the path
// plus the arrowhead anchor (a point near b, angled along the incoming tangent).
const NR = 52; // node radius used to clip arc endpoints just outside the discs
function arc(a, b) {
  const mx = (a.x + b.x) / 2, my = (a.y + b.y) / 2;
  // push the control point away from the centre to bow the arc outward
  const dx = mx - CX, dy = my - CY;
  const dlen = Math.hypot(dx, dy) || 1;
  const bow = 46;
  const cxp = mx + (dx / dlen) * bow, cyp = my + (dy / dlen) * bow;
  // clip endpoints to the node rims so arcs start/end outside the discs
  const clip = (p, ctrl) => {
    const vx = ctrl.x - p.x, vy = ctrl.y - p.y;
    const l = Math.hypot(vx, vy) || 1;
    return { x: p.x + (vx / l) * NR, y: p.y + (vy / l) * NR };
  };
  const s = clip(a, { x: cxp, y: cyp });
  const e = clip(b, { x: cxp, y: cyp });
  return { d: `M ${s.x} ${s.y} Q ${cxp} ${cyp} ${e.x} ${e.y}`, end: e, ctrl: { x: cxp, y: cyp } };
}

const EDGES = ORDER.map((k, i) => {
  const a = NODES[k], b = NODES[ORDER[(i + 1) % ORDER.length]];
  return { from: k, to: ORDER[(i + 1) % ORDER.length], ...arc(a, b) };
});

export default function LoopDemo() {
  const { ref: seqRef, step } = useStepSequence(N, { lead: 700, beat: 600, hold: 3200 });
  const { fitRef, frameRef } = useFitScale(W, 1);

  const running = step >= 1;
  const resolved = step >= N; // step 7

  // Which lap and which node is live on this beat. Beats 1..6 map to two laps of
  // sense/plan/act; on resolve we settle back onto SENSE.
  const beat = Math.min(Math.max(step, 1), 6);  // 1..6
  const lapIndex = step >= 4 ? 1 : 0;            // lap 2 begins at beat 4
  const lap = LAPS[lapIndex];
  const active = resolved ? "sense" : ORDER[(beat - 1) % 3]; // node lit this beat

  // Token position: park it on the active node. It slides along the ring between
  // beats (CSS transition on left/top), so the motion reads as an orbit.
  const tokPos = NODES[active];

  // Edge that is currently "travelling" — the one leaving the just-finished node
  // toward the active node. Light the arc the token is riding.
  const liveEdge = running && !resolved ? (beat - 1) % 3 : -1;

  // Per-node state: a node is "lit" on its beat, "done" once its action fired
  // this lap. We keep them readable at all times; the live one glows.
  const nodeState = (k) => {
    if (resolved) return k === "sense" ? "active" : "done";
    if (!running) return "idle";
    return k === active ? "active" : "done";
  };

  return (
    <div className="ds-fit" ref={(n) => { fitRef.current = n; seqRef.current = n; }}>
      <div className="ds-root ds-root--away ss-loop" ref={frameRef} style={{ width: W }}>
        <div className="ss-loop__head">
          <span className="ss-loop__head-label">Sense · Plan · Act</span>
          <span className="ss-loop__head-trip">Away · steering BLR → GOI live</span>
          <span className={`ss-loop__cycle${running ? " is-on" : ""}`}>
            cycle <b>{running ? lap.cycle : 1}</b>
            <span className="ss-loop__world">flight {running ? lap.world : "on time"}</span>
          </span>
        </div>

        <div className="ss-loop__stage" style={{ height: H }}>
          <svg className="ss-loop__ring" viewBox={`0 0 ${W} ${H}`} aria-hidden>
            <defs>
              <marker id="ssLoopArrow" markerWidth="9" markerHeight="9" refX="6" refY="4.5"
                orient="auto-start-reverse" markerUnits="userSpaceOnUse">
                <path d="M1 1 L7 4.5 L1 8 Z" className="ss-loop__arrowhead" />
              </marker>
              <marker id="ssLoopArrowLive" markerWidth="9" markerHeight="9" refX="6" refY="4.5"
                orient="auto-start-reverse" markerUnits="userSpaceOnUse">
                <path d="M1 1 L7 4.5 L1 8 Z" className="ss-loop__arrowhead is-live" />
              </marker>
            </defs>

            {/* the closed cycle: three bowed arcs, each with an arrowhead. The arc
                the token is currently riding lights blue. */}
            {EDGES.map((e, i) => (
              <path
                key={`${e.from}-${e.to}`}
                d={e.d}
                pathLength="1"
                className={`ss-loop__edge${running ? " is-drawn" : ""}${liveEdge === i ? " is-live" : ""}`}
                markerEnd={`url(#${liveEdge === i ? "ssLoopArrowLive" : "ssLoopArrow"})`}
                style={{ transitionDelay: `${i * 70}ms` }}
              />
            ))}
          </svg>

          {/* nodes */}
          {ORDER.map((k) => {
            const c = NODES[k];
            const st = nodeState(k);
            const labels = { sense: "SENSE", plan: "PLAN", act: "ACT" };
            const subs = {
              sense: running ? lap.sense : "poll flight · price · docs",
              plan: running ? lap.plan : "decide next move",
              act: running ? lap.act : "rebook · notify · hold",
            };
            return (
              <div
                key={k}
                className={`ss-loop__node ss-loop__node--${k} is-${st}`}
                style={{ left: c.x, top: c.y }}
              >
                <span className="ss-loop__node-kicker">{labels[k]}</span>
                <span className="ss-loop__node-sub">{subs[k]}</span>
                <span className="ss-loop__node-glow" aria-hidden />
              </div>
            );
          })}

          {/* the orbiting token: a glowing dot that slides between node centres,
              tracing the ring as the clock advances */}
          <span
            className={`ss-loop__token${running ? " is-on" : ""}${resolved ? " is-calm" : ""}`}
            style={{ left: tokPos.x, top: tokPos.y }}
            aria-hidden
          />
        </div>

        <div className={`ss-loop__result${resolved ? " is-on" : ""}`}>
          The loop never stops &nbsp;·&nbsp;{" "}
          <span className="ss-loop__mantra">perceive, decide, act</span>, on repeat
        </div>
      </div>
    </div>
  );
}
