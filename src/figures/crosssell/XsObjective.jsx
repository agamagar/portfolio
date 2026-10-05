import { useState } from "react";
import XsFull, { FullButton } from "./XsFull";
import "./crosssell.css";

// Figure 3: the objective function with its one dial. Click a term for what it
// protects, or a struck-out term for why it was ruled out. The margin-tilt
// slider carries no number, and its threshold is unlabelled on purpose: the
// starting value and the trigger level are both omitted from this case. What
// the slider shows is the written rule: past the threshold, the answer is a
// different objective, not a bigger number in this one.

const TERMS = [
  { k: "rel", label: "relevance", sub: "lift from pair-purchase data", t: "Relevance leads", s: "The lift estimate from pair-purchase data, ranked by lift rather than by raw co-order volume. Bought-together is not belongs-together." },
  { k: "av", label: "availability", sub: "in stock at your store, or zero", t: "Availability is a filter, not a signal", s: "A hard zero-or-one against the shopper's own dark store. Suggesting something out of stock breaks the speed promise even when the cart goes through." },
  { k: "mg", label: "margin_tilt × margin_z", sub: "a gentle tie-break, with a trigger", t: "Margin only breaks ties", s: "A tunable bias with a written escalation trigger. Past a threshold, the answer is a different objective, not a bigger number in this one. The starting value stays out of this case on purpose." },
];

const REFUSED = [
  { k: "ctr", label: "click-through", sub: "noticed is not helped", t: "Click-through? Ruled out.", s: "A rail can post a beautiful click rate and cause nothing, because the item would've been added anyway, or the cart abandoned under the load. Click-through measures whether the widget was noticed, not whether it helped." },
  { k: "mgl", label: "margin-led", sub: "collapses the catalogue to staples", t: "Margin-led ranking? Ruled out too.", s: "Lead with margin and the catalogue collapses to detergent and house brands within a quarter. Relevance goes, and the rail becomes furniture people learn to scroll past." },
];

const THRESHOLD = 68; // unlabelled on the control; the real value is not in this case

function Expr({ sel, setSel, tilt, setTilt, avail, setAvail, full, onFull }) {
  const pick = (k) => setSel(sel === k ? null : k);
  const over = tilt > THRESHOLD;
  const active = over && sel === "mg"
    ? { k: "mg", t: "Escalation trigger", s: "The dial is past the line. Cross-sell has started to feel margin-led to users, and the answer is a different objective, not a bigger number in this one. Nobody notices a dial moving. They notice the quarter it stops working." }
    : [...TERMS, ...REFUSED].find((x) => x.k === sel);
  const Term = ({ x, refused }) => (
    <button type="button" className={"xo__term" + (refused ? " xo__term--no" : "")} data-t={x.k} aria-pressed={sel === x.k} onClick={() => pick(x.k)}>
      <span className="xo__term-l">{x.label}</span>
      <span className="xo__term-sub">{x.sub}</span>
    </button>
  );
  return (
    <div className="fc xo" data-over={over ? "1" : "0"}>
      <div className="fc__bar">
        <span className="fc__bar-t">The v1 ranker, and what each term is there to protect</span>
        <FullButton full={full} onFull={onFull} />
      </div>

      <div className="xo__expr">
        <span className="xo__op">score =</span>
        <Term x={TERMS[0]} />
        <span className="xo__op">×</span>
        <Term x={TERMS[1]} />
        <span className="xo__op">×</span>
        <span className="xo__op">(1 +</span>
        <Term x={TERMS[2]} />
        <span className="xo__op">)</span>
      </div>
      <div className="xo__refused">
        <span className="xo__op">and never</span>
        <Term x={REFUSED[0]} refused />
        <span className="xo__op">or</span>
        <Term x={REFUSED[1]} refused />
      </div>

      <div className="xo__bars" aria-hidden="true">
        <div className="xo__bar" data-t="rel"><i style={{ width: "62%" }} /><span>relevance leads</span></div>
        <div className="xo__bar" data-t="av"><i style={{ width: avail ? "100%" : "0%" }} /><span>{avail ? "in stock at your store: passes" : "out of stock: the whole score is zero"}</span></div>
        <div className="xo__bar" data-t="mg"><i style={{ width: `${8 + tilt * 0.5}%` }} /><span>{over ? "past the line: margin-led" : "a gentle tie-break"}</span><em className="xo__line" style={{ left: `${8 + THRESHOLD * 0.5}%` }} /></div>
      </div>

      <div className="xo__controls">
        <label className="xo__ctl">
          <span>Margin tilt</span>
          <input type="range" min="0" max="100" step="1" value={tilt} onChange={(e) => { setTilt(Number(e.target.value)); setSel("mg"); }} aria-valuetext={over ? "past the escalation threshold" : "a gentle tie-break"} />
          <b>{over ? "escalate" : "tie-break"}</b>
        </label>
        <button type="button" className="xo__ctl xo__toggle" aria-pressed={avail} onClick={() => { setAvail(!avail); setSel("av"); }}>
          <span>Availability at the shopper's dark store</span>
          <b>{avail ? "in stock" : "out of stock"}</b>
        </button>
      </div>

      <div className="xo__panel" data-t={active ? active.k : ""} data-over={over && sel === "mg" ? "1" : "0"}>
        {active ? (
          <>
            <div className="xo__panel-t">{active.t}</div>
            <p>{active.s}</p>
          </>
        ) : (
          <p className="xo__hint">Click a term for what it protects, a struck-out one for why it didn't survive, or move the dial past the line.</p>
        )}
      </div>

      <div className="xf__cap">The tilt lives in a named cell in the model, not in someone's head, and its escalation trigger was written into the document on day one.</div>
    </div>
  );
}

export default function XsObjective() {
  const [sel, setSel] = useState("rel");
  const [tilt, setTilt] = useState(18);
  const [avail, setAvail] = useState(true);
  return (
    <XsFull
      label="The objective function, full screen"
      render={({ full, onFull }) => (
        <Expr sel={sel} setSel={setSel} tilt={tilt} setTilt={setTilt} avail={avail} setAvail={setAvail} full={full} onFull={onFull} />
      )}
    />
  );
}
