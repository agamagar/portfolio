import { useEffect, useRef } from "react";
import "./concepts.css";

// The occasion decision tree — how the engine's call gets made, drawn as a
// left-to-right mind map that builds one column at a time: signals -> occasion ->
// surface -> basket. Each stage reveals its options, lights the one(s) chosen (in
// the case study accent), and draws a flow line to the next column. The options
// not chosen, including "none", stay on screen, so the figure shows the reasoning,
// not just the result. Same imperative beat loop as the reviewed preview, gated to
// play on view. Storyline copy is illustrative.

const ROW_Y = [54, 120, 186, 252];
const COL_X = [24, 234, 444, 654];
const ITEM_W = 150;
const ITEM_H = 54;

const COLS = [
  { head: "Signals", items: [["Time", "11pm"], ["Location", "home"], ["Search", "“chips”"], ["Cart", "+ cola"]], sel: [0, 1, 2, 3] },
  { head: "Occasion", items: [["Movie night"], ["Dinner"], ["Restock"], ["Guests"]], sel: [0] },
  { head: "Surface", items: [["Paired card"], ["Occasion widget"], ["Post-cart tabs"], ["none"]], sel: [1] },
  { head: "Basket", items: [["Snacks"], ["Drinks"], ["Dessert"], ["Dips"]], sel: [0, 1, 2, 3] },
];

const LINES = [
  { bi: 0, d: "M174 81 C 204 81 204 81 234 81" },
  { bi: 0, d: "M174 147 C 204 147 204 81 234 81" },
  { bi: 0, d: "M174 213 C 204 213 204 81 234 81" },
  { bi: 0, d: "M174 279 C 204 279 204 81 234 81" },
  { bi: 1, d: "M384 81 C 414 81 414 147 444 147" },
  { bi: 2, d: "M594 147 C 624 147 624 81 654 81" },
  { bi: 2, d: "M594 147 C 624 147 624 147 654 147" },
  { bi: 2, d: "M594 147 C 624 147 624 213 654 213" },
  { bi: 2, d: "M594 147 C 624 147 624 279 654 279" },
];

const CAPS = ["", "read the signals the session already carries", "infer the occasion from them", "choose the surface, or none", "assemble the basket"];

const SEQ = [
  { s: 1, d: 1200 },
  { s: 2, d: 1500 },
  { s: 3, d: 1500 },
  { s: 4, d: 2600 },
  { s: 0, d: 850 },
];

export default function DecisionEngine() {
  const ref = useRef(null);

  useEffect(() => {
    const svg = ref.current;
    if (!svg) return;
    const cells = svg.querySelectorAll(".dt-item, .dt-head");
    const lines = svg.querySelectorAll(".dt-line");
    const capT = svg.querySelector(".dt-cap-t");
    const capDot = svg.querySelector(".dt-cap-dot");

    const apply = (stage) => {
      cells.forEach((el) => { el.dataset.on = Number(el.dataset.col) <= stage - 1; });
      lines.forEach((el) => { el.dataset.on = Number(el.dataset.bi) <= stage - 2; });
      capT.textContent = CAPS[stage] || "";
      capDot.dataset.on = stage >= 1;
    };

    if (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      apply(4);
      return;
    }

    let i = 0;
    let timer = null;
    const tick = () => {
      const step = SEQ[i];
      apply(step.s);
      i = (i + 1) % SEQ.length;
      timer = setTimeout(tick, step.d);
    };
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting && timer === null) tick();
        else if (!e.isIntersecting && timer !== null) { clearTimeout(timer); timer = null; }
      },
      { threshold: 0 }
    );
    io.observe(svg);
    return () => { if (timer !== null) clearTimeout(timer); io.disconnect(); };
  }, []);

  return (
    <div className="dt-wrap">
      <svg ref={ref} className="dt" viewBox="0 0 828 392" role="img"
        aria-label="The occasion decision as a mind map: signals to occasion to surface to basket, built one column at a time, with the options not chosen left visible.">

        {LINES.map((ln, i) => (
          <path key={i} className="dt-line" data-bi={ln.bi} d={ln.d} />
        ))}

        {COLS.map((col, c) => (
          <g key={c}>
            <text className="dt-head" data-col={c} x={COL_X[c] + 2} y="34">{col.head}</text>
            {col.items.map((it, r) => (
              <g key={r} className="dt-item" data-col={c} data-sel={col.sel.includes(r)}>
                <rect className="dt-box" x={COL_X[c]} y={ROW_Y[r]} width={ITEM_W} height={ITEM_H} rx="12" />
                <text className="dt-l" x={COL_X[c] + 16} y={it[1] ? ROW_Y[r] + 24 : ROW_Y[r] + 31}>{it[0]}</text>
                {it[1] && <text className="dt-v" x={COL_X[c] + 16} y={ROW_Y[r] + 41}>{it[1]}</text>}
              </g>
            ))}
          </g>
        ))}

        <circle className="dt-cap-dot" cx="30" cy="372" r="5" />
        <text className="dt-cap-t" x="44" y="376">read the signals the session already carries</text>
      </svg>
    </div>
  );
}
