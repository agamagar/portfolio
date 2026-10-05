import { useState } from "react";
import XsFull, { FullButton } from "./XsFull";
import "./crosssell.css";

// Figure 5: one rail, two scoreboards, drawn as the rail. Three completer slots
// and one labelled discovery slot, each half judged on its own board. The
// tenure slider walks the discovery slot through the three stages the case
// names, month one to month twelve. No number on it is internal.

const STAGES = [
  { from: 0, t: "Month one to three", s: "An adjacent category. The account hasn't earned a surprise yet." },
  { from: 4, t: "Month six", s: "A near-neighbour it hasn't tried, indexed on where the curve still climbs." },
  { from: 9, t: "Month twelve on", s: "Something genuinely new. By now the relationship can carry a miss." },
];

function Rail({ month, setMonth, side, setSide, full, onFull }) {
  const stage = [...STAGES].reverse().find((s) => month >= s.from);
  return (
    <div className="fc xl">
      <div className="fc__bar">
        <span className="fc__bar-t">One rail, two scoreboards</span>
        <FullButton full={full} onFull={onFull} />
      </div>

      <div className="xl__rail">
        {[1, 2, 3].map((n) => (
          <button type="button" className="xl__slot" key={n} data-kind="comp" aria-pressed={side === "comp"} onClick={() => setSide("comp")}>
            <span className="xl__tag">Completer</span>
            <span className="xl__ph" />
            <span className="xl__lbl">High confidence. Goes with what's already in the basket.</span>
          </button>
        ))}
        <button type="button" className="xl__slot" data-kind="disc" aria-pressed={side === "disc"} onClick={() => setSide("disc")}>
          <span className="xl__tag">New to you</span>
          <span className="xl__ph" />
          <span className="xl__lbl">{stage.s}</span>
        </button>
      </div>

      <div className="xl__boards">
        <div className="xl__board" data-kind="comp" data-on={side === "comp" ? "1" : "0"}>
          <div className="xl__board-h">Slots one to three are judged on</div>
          <div className="xl__board-t">Incremental gross profit per impression</div>
          <div className="xl__board-s">Against a persistent holdout. Relevance first, availability filtered, margin only as a tie-break. Paired with its regret metric: adds removed before checkout.</div>
        </div>
        <div className="xl__board" data-kind="disc" data-on={side === "disc" ? "1" : "0"}>
          <div className="xl__board-h">Slot four is judged on</div>
          <div className="xl__board-t">Thirty and ninety day category repeat</div>
          <div className="xl__board-s">Never on same-session add. Category, not SKU: category-level prediction is an order of magnitude more tractable, and a shopper's repeat categories outnumber their repeat items.</div>
        </div>
      </div>

      <div className="xl__tenure">
        <label className="xl__tenure-l" htmlFor="xl-month">
          Tenure <b>{stage.t}</b>
        </label>
        <input
          id="xl-month"
          className="xl__range"
          type="range"
          min="1"
          max="12"
          step="1"
          value={month}
          onChange={(e) => { setMonth(Number(e.target.value)); setSide("disc"); }}
          aria-valuetext={`Month ${month}: ${stage.t}`}
        />
        <div className="xl__ticks" aria-hidden="true"><span>Month 1</span><span>Month 6</span><span>Month 12</span></div>
      </div>

      <div className="xf__cap">A rail that's ninety percent reliable and ten percent curious reads as a good shop. A rail that's uniformly speculative reads as noise, and shoppers learn to skip it inside a week. The containment is the design.</div>
    </div>
  );
}

export default function XsRail() {
  const [month, setMonth] = useState(1);
  const [side, setSide] = useState("disc");
  return (
    <XsFull
      label="One rail, two scoreboards, full screen"
      render={({ full, onFull }) => <Rail month={month} setMonth={setMonth} side={side} setSide={setSide} full={full} onFull={onFull} />}
    />
  );
}
