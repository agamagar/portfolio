import { useState } from "react";
import { useReducedMotion, useInViewLoop } from "../ds/hooks";
import "./schedExplorationsDetour.css";

// Agentation mvg8xj51-ht1eue: a copy of "The explorations" illustrated after Pentagram's "In Defense of the
// Detour" (a hand-drawn visual essay: thick marker-brush arrows that loop back on themselves, black waypoint dots,
// a bold condensed serif headline with an italic serif caption, flat bright colour). Same rows, same verdicts, same
// story; here every direction is a stretch of one marker line. Shipped runs straight on to an arrowhead, the killed
// ones loop back on themselves, didn't-scale wobbles and breaks off, considered makes one small loop and carries on.

const TAG = { shipped: "Shipped", killed: "Killed", scale: "Didn't scale", considered: "Considered" };

const ROWS = [
  { label: "Placement", ink: "#2fb5a6", chips: [
    { t: "On the PDP", v: "killed" },
    { t: "Home prompt", v: "shipped" },
    { t: "Cart, per shipment", v: "shipped" },
  ] },
  { label: "Cart structure", ink: "#e26fcf", chips: [
    { t: "Tabbed, one per shipment", v: "killed" },
    { t: "Bottom sheet", v: "scale" },
    { t: "One combined cart", v: "killed" },
    { t: "Single-page listing", v: "shipped" },
  ] },
  { label: "Slot picker", ink: "#6c76f0", chips: [
    { t: "Calendar", v: "considered" },
    { t: "Bottom-sheet picker", v: "considered" },
    { t: "Inline slot list", v: "shipped" },
  ] },
];

// one stretch of marker line per verdict, drawn in a 100 x 44 cell that joins its neighbours at (0,22) and (100,22)
const STROKE = {
  killed: { c: "#f0634f", d: "M0 22 C22 22 44 3 66 10 C88 17 70 42 50 33 C34 25 52 12 64 21", tail: "M64 21 L100 22" },
  scale: { c: "#6c76f0", d: "M0 22 C10 6 22 38 34 22 S58 6 70 22 S84 30 88 24", tail: "M88 24 L100 22" },
  considered: { c: "#ecc53c", d: "M0 22 L26 22 C40 2 62 4 56 22 C51 38 32 34 40 21 C44 15 56 22 70 22", tail: "M70 22 L100 22" },
  shipped: { c: "#9674db", d: "M0 22 C18 6 38 38 60 20 S84 22 92 22", tail: "M92 22 L100 22", head: "M80 9 L96 22 L80 35" },
};

function Mark({ v, on, last }) {
  const s = STROKE[v];
  return (
    <svg className="dtr-mark" viewBox="0 0 100 44" preserveAspectRatio="none" aria-hidden="true" data-on={on} data-v={v}>
      <path className="dtr-mark__rule" d="M0 22 L100 22" />
      {s.tail && <path className="dtr-mark__tail" d={s.tail} />}
      <g filter="url(#dtr-marker)" stroke={s.c}>
        <path className="dtr-mark__ink" d={s.d} pathLength="1" />
        {s.head && last && <path className="dtr-mark__ink dtr-mark__head" d={s.head} pathLength="1" />}
      </g>
    </svg>
  );
}

export default function SchedExplorationsDetour() {
  const reduce = useReducedMotion();
  const [beat, setBeat] = useState(reduce ? ROWS.length + 1 : 0);

  const loopRef = useInViewLoop(!reduce, async ({ wait, alive }) => {
    while (alive()) {
      setBeat(0); await wait(900); if (!alive()) break;
      for (let i = 0; i < ROWS.length && alive(); i++) { setBeat(i + 1); await wait(1700); }
      if (!alive()) break;
      setBeat(ROWS.length + 1); await wait(3200);
    }
  });

  return (
    <div className="dtr" ref={loopRef}>
      <svg width="0" height="0" className="dtr-defs" aria-hidden="true" focusable="false">
        <defs>
          {/* a hair of wobble so the strokes read as felt-tip, not vector */}
          <filter id="dtr-marker" x="-5%" y="-30%" width="110%" height="160%">
            <feTurbulence type="fractalNoise" baseFrequency="0.045" numOctaves="2" seed="4" result="n" />
            <feDisplacementMap in="SourceGraphic" in2="n" scale="3.2" />
          </filter>
        </defs>
      </svg>

      <div className="dtr__head">
        <div className="dtr__title" role="heading" aria-level={3}>What we explored, before converging</div>
        <p className="dtr__cap">{ROWS.length} questions, and the slow part before each answer.</p>
      </div>

      {ROWS.map((row, i) => (
        <div className="dtr-row" key={row.label} style={{ "--ink": row.ink }}>
          <div className="dtr-row__label"><span>{row.label}</span><i aria-hidden="true" /></div>
          <div className="dtr-row__line" style={{ "--n": row.chips.length }}>
            {row.chips.map((c, k) => {
              const on = beat >= i + 1;
              return (
                <div className="dtr-cell" key={c.t} data-on={on} data-v={c.v} style={{ "--k": k }}>
                  <Mark v={c.v} on={on} last={k === row.chips.length - 1} />
                  <span className="dtr-dot" aria-hidden="true" />
                  <span className="dtr-cell__t">{c.t}</span>
                  <span className="dtr-cell__tag">{TAG[c.v]}</span>
                </div>
              );
            })}
          </div>
        </div>
      ))}

      <div className="dtr-end" data-on={beat >= ROWS.length + 1}>
        <span className="dtr-end__l">Converged</span>
        <p className="dtr-end__t">Schedule on the cart, per shipment, one single page, slots inline.</p>
      </div>
    </div>
  );
}
