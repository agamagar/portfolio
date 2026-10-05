import { useFitScale, useStepSequence } from "../ds/hooks";
import "./backtrackDemo.css";

// System-Explainer · BACKTRACK archetype (from the §12 universe research).
// Reasoning advances, hits a dead end, REWINDS to an earlier fork, and takes the
// other branch. Scene = an agent debugging: "assume race condition -> no -> assume
// stale cache -> yes". A small SVG tree (root + two hypotheses, each with a leaf);
// a single glowing WALKER token traces edges between precomputed node coords.
//
// Clock (N steps): 0 lead-in (token at root); 1 walk down LEFT edge to the
// "Race condition?" hypothesis; 2 walk to its leaf, which turns RED with an x
// (dead end) and the left subtree greys to a ghost; 3 RETRACE back up to root
// (edges re-light in reverse); 4 walk down the RIGHT edge to "Stale cache?";
// 5 = resolve: walk to the right leaf, which turns GREEN ("found by elimination").

const W = 600, H = 300;

// Precomputed node centers in the unscaled frame coordinate space. The walker is
// an absolutely-positioned dot that transitions between these by `step`.
const NODES = {
  root:  { x: 300, y: 40 },
  hL:    { x: 150, y: 138 }, // left hypothesis
  hR:    { x: 450, y: 138 }, // right hypothesis
  leafL: { x: 150, y: 236 }, // left leaf  (dead end, red)
  leafR: { x: 450, y: 236 }, // right leaf (found it, green)
};

// Walker position per step: it advances down-left, dead-ends, retraces, then
// advances down-right to the answer.
const WALK = ["root", "hL", "leafL", "root", "hR", "leafR"];
const N = WALK.length - 1; // 5 reasoning beats after the lead-in

// rounded-rect node geometry, drawn centered on each coord
const NW = 132, NH = 36;
const rect = (c) => ({ x: c.x - NW / 2, y: c.y - NH / 2, w: NW, h: NH });
// edge endpoints clipped to the node boxes (top/bottom mid-points)
const edge = (a, b) => ({ x1: a.x, y1: a.y + NH / 2, x2: b.x, y2: b.y - NH / 2 });

export default function BacktrackDemo() {
  const { ref: seqRef, step } = useStepSequence(N, { lead: 700, beat: 600, hold: 3200 });
  const { fitRef, frameRef } = useFitScale(W, 1);

  const resolved = step >= N;                 // step 5: green leaf found
  const deadEnd = step >= 2;                   // left leaf failed
  const ghostLeft = step >= 3;                 // left subtree greyed after retrace
  const onRight = step >= 4;                   // exploring the right branch

  // edge "lit" states. The left edges light on the way down (1,2), then the
  // retrace re-lights them in reverse (3) before they settle into the ghost.
  const eRootL = step === 1 || step === 2;     // root -> hL active going down
  const eHL    = step === 2;                    // hL -> leafL active
  const retrace = step === 3;                   // edges re-light in reverse, dimmer
  const eRootR = step >= 4;                      // root -> hR
  const eHR    = step >= 5;                      // hR -> leafR

  const pos = NODES[WALK[step]] || NODES.root;

  return (
    <div className="ds-fit" ref={(n) => { fitRef.current = n; seqRef.current = n; }}>
      <div className="ds-root ds-root--away ss-bt" ref={frameRef} style={{ width: W }}>
        <div className="ss-bt__head">
          <span className="ss-bt__head-label">Backtracking search</span>
          <span className="ss-bt__head-bug">Bug: dashboard shows stale data</span>
        </div>

        <div className="ss-bt__stage" style={{ height: H }}>
          <svg className="ss-bt__edges" viewBox={`0 0 ${W} ${H}`} aria-hidden>
            {/* root -> left hypothesis */}
            {(() => { const e = edge(NODES.root, NODES.hL); return (
              <line x1={e.x1} y1={e.y1} x2={e.x2} y2={e.y2} pathLength="1"
                className={`ss-bt__edge${eRootL ? " is-on" : ""}${retrace ? " is-retrace" : ""}${ghostLeft ? " is-ghost" : ""}`} />
            ); })()}
            {/* left hypothesis -> left leaf */}
            {(() => { const e = edge(NODES.hL, NODES.leafL); return (
              <line x1={e.x1} y1={e.y1} x2={e.x2} y2={e.y2} pathLength="1"
                className={`ss-bt__edge${eHL ? " is-on is-fail" : ""}${ghostLeft ? " is-ghost" : ""}`} />
            ); })()}
            {/* root -> right hypothesis */}
            {(() => { const e = edge(NODES.root, NODES.hR); return (
              <line x1={e.x1} y1={e.y1} x2={e.x2} y2={e.y2} pathLength="1"
                className={`ss-bt__edge${eRootR ? " is-on" : ""}`} />
            ); })()}
            {/* right hypothesis -> right leaf */}
            {(() => { const e = edge(NODES.hR, NODES.leafR); return (
              <line x1={e.x1} y1={e.y1} x2={e.x2} y2={e.y2} pathLength="1"
                className={`ss-bt__edge${eHR ? " is-on is-win" : ""}`} />
            ); })()}
          </svg>

          {/* root */}
          {(() => { const r = rect(NODES.root); return (
            <div className="ss-bt__node is-root" style={{ left: r.x, top: r.y, width: r.w, height: r.h }}>
              <span className="ss-bt__node-text">Why is data stale?</span>
            </div>
          ); })()}

          {/* left hypothesis */}
          {(() => { const r = rect(NODES.hL); return (
            <div className={`ss-bt__node${ghostLeft ? " is-ghost" : ""}${step === 1 ? " is-active" : ""}`}
              style={{ left: r.x, top: r.y, width: r.w, height: r.h }}>
              <span className="ss-bt__node-text">Race condition?</span>
            </div>
          ); })()}

          {/* left leaf — dead end */}
          {(() => { const r = rect(NODES.leafL); return (
            <div className={`ss-bt__node is-leaf${deadEnd ? " is-fail" : ""}${ghostLeft ? " is-ghost-leaf" : ""}`}
              style={{ left: r.x, top: r.y, width: r.w, height: r.h }}>
              <span className="ss-bt__node-text">Locks are fine</span>
              <span className={`ss-bt__mark is-x${deadEnd ? " is-on" : ""}`} aria-hidden>✕</span>
            </div>
          ); })()}

          {/* right hypothesis */}
          {(() => { const r = rect(NODES.hR); return (
            <div className={`ss-bt__node${onRight ? "" : " is-dim"}${step === 4 ? " is-active" : ""}`}
              style={{ left: r.x, top: r.y, width: r.w, height: r.h }}>
              <span className="ss-bt__node-text">Stale cache?</span>
            </div>
          ); })()}

          {/* right leaf — found it */}
          {(() => { const r = rect(NODES.leafR); return (
            <div className={`ss-bt__node is-leaf${onRight ? "" : " is-dim"}${resolved ? " is-win" : ""}`}
              style={{ left: r.x, top: r.y, width: r.w, height: r.h }}>
              <span className="ss-bt__node-text">TTL never expires</span>
              <span className={`ss-bt__mark is-check${resolved ? " is-on" : ""}`} aria-hidden>✓</span>
            </div>
          ); })()}

          {/* the walker token: an absolutely-positioned glowing dot that slides
              between precomputed node coords keyed off step */}
          <span
            className={`ss-bt__walker${retrace ? " is-retrace" : ""}${resolved ? " is-win" : ""}${deadEnd && step < 3 ? " is-fail" : ""}`}
            style={{ left: pos.x, top: pos.y }}
            aria-hidden
          />
        </div>

        <div className={`ss-bt__result${resolved ? " is-on" : ""}`}>
          Race condition <b>ruled out</b> &nbsp;·&nbsp; root cause:{" "}
          <span className="ss-bt__found">cache TTL never expires</span> &nbsp;·&nbsp; found by elimination
        </div>
      </div>
    </div>
  );
}
