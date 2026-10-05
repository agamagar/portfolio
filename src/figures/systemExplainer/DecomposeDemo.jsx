import { useFitScale, useStepSequence } from "../ds/hooks";
import "./decomposeDemo.css";

// System-Explainer · DECOMPOSE archetype (from the §12 universe research).
// One unanswerable question is cleaved into non-overlapping, fully-covering parts
// (MECE) before any of it can be answered. Coverage and no-overlap are the point.
// Scene = an agent triaging "Why did checkout conversion drop?". A top-down tree:
// ROOT cleaves into 4 mutually-exclusive, collectively-exhaustive tier-1 stages; a
// bracket sweeps the tier to signal the partition is clean; then the Payment branch
// unfolds into 3 answerable leaf checks.
//
// Clock (N steps): 1 root appears + pulses; 2 cleaves into the 4 tier-1 children,
// which slide apart so none overlap; 3 the MECE bracket sweeps across the tier;
// 4 Payment unfolds its 3 leaves; 5 = resolve — every leaf is a runnable check.

// Content coordinate space = the padded box (W - 2*16). Stage SVG/abs children all
// share this 588-wide space, so nothing overflows the 16px frame padding.
const W = 620;
const CW = W - 32;       // 588 usable content width
const H = 320;

const ROOT = { x: CW / 2, y: 26, w: 212, h: 40 };

// 4 tier-1 stages, centers evenly spread across the usable width (each ±64 stays in
// bounds). Payment is the branch that unfolds.
const T1W = 124, T1H = 38, T1Y = 132;
const TIER1 = [
  { key: "traffic", label: "Traffic",     cx: 73 },
  { key: "atc",     label: "Add-to-cart", cx: 219 },
  { key: "payment", label: "Payment",     cx: 367, branch: true },
  { key: "confirm", label: "Confirm",     cx: 513 },
];

// the bracket spans across the tier-1 centers
const BRACKET = { x1: TIER1[0].cx, x2: TIER1[TIER1.length - 1].cx, y: 90 };

// tier-2 leaves under Payment (cx 367). 3 answerable checks, centered on the branch.
const L2W = 122, L2H = 46, L2Y = 250;
const PAY_CX = 367;
const LEAVES = [
  { key: "latency",  label: "p95 latency",   q: "is checkout slow?",   cx: PAY_CX - 132 },
  { key: "errors",   label: "5xx errors",    q: "are calls failing?",  cx: PAY_CX },
  { key: "declines", label: "card declines", q: "are cards bouncing?", cx: PAY_CX + 132 },
];

const N = 5;

// node geometry helpers (centered on a coord)
const box = (cx, cy, w, h) => ({ left: cx - w / 2, top: cy - h / 2, width: w, height: h });
// edge from a node bottom-mid to a node top-mid, in SVG space
const edge = (ax, ay, bx, by) => ({ x1: ax, y1: ay, x2: bx, y2: by });

export default function DecomposeDemo() {
  const { ref: seqRef, step } = useStepSequence(N, { lead: 700, beat: 600, hold: 3200 });
  const { fitRef, frameRef } = useFitScale(W, 1);

  const rootShown = step >= 1;                 // 1: root appears + pulses
  const cleaved = step >= 2;                    // 2: tier-1 children appear, slid apart
  const bracketSwept = step >= 3;               // 3: MECE bracket sweeps the tier
  const unfolded = step >= 4;                   // 4: Payment unfolds its leaves
  const resolved = step >= N;                    // 5: every leaf is a runnable check

  const rootBottom = ROOT.y + ROOT.h / 2;
  const t1Top = T1Y - T1H / 2, t1Bottom = T1Y + T1H / 2;
  const leafTop = L2Y - L2H / 2;

  return (
    <div className="ds-fit" ref={(n) => { fitRef.current = n; seqRef.current = n; }}>
      <div className="ds-root ds-root--away ss-dec" ref={frameRef} style={{ width: W }}>
        <div className="ss-dec__head">
          <span className="ss-dec__head-label">Decompose · MECE</span>
          <span className="ss-dec__head-q">Why did checkout conversion drop?</span>
        </div>

        <div className="ss-dec__stage" style={{ height: H }}>
          <svg className="ss-dec__edges" viewBox={`0 0 ${CW} ${H}`} aria-hidden>
            {/* root → each tier-1 stage: light as the question cleaves */}
            {TIER1.map((t, i) => {
              const e = edge(ROOT.x, rootBottom, t.cx, t1Top);
              return (
                <path
                  key={t.key}
                  d={`M${e.x1},${e.y1} C${e.x1},${(e.y1 + e.y2) / 2} ${e.x2},${(e.y1 + e.y2) / 2} ${e.x2},${e.y2}`}
                  pathLength="1"
                  className={`ss-dec__edge${cleaved ? " is-on" : ""}${resolved ? " is-done" : ""}`}
                  style={{ transitionDelay: `${i * 60}ms` }}
                />
              );
            })}

            {/* Payment → each tier-2 leaf: light on unfold */}
            {LEAVES.map((l, i) => {
              const e = edge(PAY_CX, t1Bottom, l.cx, leafTop);
              return (
                <path
                  key={l.key}
                  d={`M${e.x1},${e.y1} C${e.x1},${(e.y1 + e.y2) / 2} ${e.x2},${(e.y1 + e.y2) / 2} ${e.x2},${e.y2}`}
                  pathLength="1"
                  className={`ss-dec__edge is-branch${unfolded ? " is-on" : ""}${resolved ? " is-done" : ""}`}
                  style={{ transitionDelay: `${i * 70}ms` }}
                />
              );
            })}

            {/* MECE bracket: a thin rail with down-ticks at each tier-1 center, drawn
                across the partition to assert it's clean (no gaps, no overlap). */}
            {(() => {
              const ticks = TIER1.map((t) => `M${t.cx},${BRACKET.y} L${t.cx},${BRACKET.y + 6}`).join(" ");
              return (
                <path
                  d={`M${BRACKET.x1},${BRACKET.y} L${BRACKET.x2},${BRACKET.y} ${ticks}`}
                  pathLength="1"
                  className={`ss-dec__bracket${bracketSwept ? " is-on" : ""}`}
                />
              );
            })()}
          </svg>

          {/* ROOT — the unanswerable question */}
          {(() => { const b = box(ROOT.x, ROOT.y, ROOT.w, ROOT.h); return (
            <div className={`ss-dec__node is-root${rootShown ? " is-in" : ""}${rootShown && !cleaved ? " is-pulsing" : ""}${cleaved ? " is-split" : ""}`}
              style={b}>
              <span className="ss-dec__node-text">Why did conversion drop?</span>
            </div>
          ); })()}

          {/* MECE chip riding above the bracket */}
          <div className={`ss-dec__mece${bracketSwept ? " is-in" : ""}`}
            style={box((BRACKET.x1 + BRACKET.x2) / 2, BRACKET.y - 4, 230, 20)}>
            mutually exclusive · collectively exhaustive
          </div>

          {/* TIER-1 — the 4 non-overlapping, fully-covering stages */}
          {TIER1.map((t, i) => {
            const b = box(t.cx, T1Y, T1W, T1H);
            return (
              <div
                key={t.key}
                className={`ss-dec__node is-t1${cleaved ? " is-in" : ""}${t.branch && unfolded ? " is-branch" : ""}`}
                style={{ ...b, transitionDelay: `${i * 55}ms` }}
              >
                <span className="ss-dec__node-text">{t.label}</span>
                {t.branch && unfolded && <span className="ss-dec__opened" aria-hidden />}
              </div>
            );
          })}

          {/* TIER-2 — Payment's leaves, each an answerable / runnable check */}
          {LEAVES.map((l, i) => {
            const b = box(l.cx, L2Y, L2W, L2H);
            return (
              <div
                key={l.key}
                className={`ss-dec__leaf${unfolded ? " is-in" : ""}${resolved ? " is-runnable" : ""}`}
                style={{ ...b, transitionDelay: `${i * 60}ms` }}
              >
                <span className="ss-dec__leaf-q" aria-hidden>?</span>
                <span className="ss-dec__leaf-name">{l.label}</span>
                <span className="ss-dec__leaf-sub">{resolved ? "check ✓" : l.q}</span>
              </div>
            );
          })}
        </div>

        <div className={`ss-dec__result${resolved ? " is-on" : ""}`}>
          One question, cleaved <b>MECE</b> &nbsp;·&nbsp; nothing double-counted, nothing missed &nbsp;·&nbsp;{" "}
          <span className="ss-dec__runnable">every leaf is now a runnable check</span>
        </div>
      </div>
    </div>
  );
}
