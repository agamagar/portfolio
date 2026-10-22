import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "../ds/hooks";
import { useSectionPlay } from "../../ui/useSectionPlay";
import FigmaShot from "./FigmaShot";
import PhoneFrame from "../ds/IphoneFrame";
import "./schedExplorationsDetour.css";

// Agentation mvg8xj51-ht1eue: a copy of "The explorations" illustrated after Pentagram's "In Defense of the
// Detour" (a hand-drawn visual essay: thick marker-brush arrows that loop back on themselves, black waypoint dots,
// a bold condensed serif headline with an italic serif caption, flat bright colour). Same rows, same verdicts, same
// story; here every direction is a stretch of one marker line. Shipped runs straight on to an arrowhead, the killed
// ones loop back on themselves, didn't-scale wobbles and breaks off, considered makes one small loop and carries on.

const TAG = { shipped: "Shipped", killed: "Rejected", scale: "Didn't scale", considered: "Considered" };

const ROWS = [
  { label: "Placement", ink: "#2fb5a6", chips: [
    { t: "On the PDP", v: "killed", figma: "pdp" },
    { t: "Home prompt", v: "shipped", screen: "/figures/scheduled/sched-home-strip.png" },
    { t: "Cart, per shipment", v: "shipped", screen: "/figures/scheduled/sched-cart-prompted.png" },
  ] },
  { label: "Cart structure", ink: "#e26fcf", chips: [
    { t: "Tabbed, one per shipment", v: "killed", screen: "/figures/scheduled/sched-dir-tabbed.png" },
    { t: "Bottom sheet", v: "scale", figma: "sheet" },
    { t: "One combined cart", v: "killed", screen: "/figures/scheduled/sched-cart-both.png" },
    { t: "Single-page listing", v: "shipped", screen: "/figures/scheduled/sched-pg-default.png" },
  ] },
  { label: "Slot picker", ink: "#6c76f0", chips: [
    { t: "Calendar", v: "considered", note: "Considered, never drawn as a screen." },
    { t: "Bottom-sheet picker", v: "considered", figma: "sheet-picker" },
    { t: "Inline slot list", v: "shipped", screen: "/figures/scheduled/sched-pg-crossday.png" },
  ] },
];

// each direction carries its own small screen: the closest existing asset in public/figures/scheduled; a direction that
// was never built as a screen (no `screen`) shows a labelled placeholder frame
// one stretch of marker line per verdict, drawn in a 100 x 44 cell that joins its neighbours at (0,22) and (100,22)
const STROKE = {
  killed: { c: "#f0634f", d: "M0 22 C22 22 44 3 66 10 C88 17 70 42 50 33 C34 25 52 12 64 21", tail: "M64 21 L100 22" },
  scale: { c: "#6c76f0", d: "M0 22 C10 6 22 38 34 22 S58 6 70 22 S84 30 88 24", tail: "M88 24 L100 22" },
  considered: { c: "#ecc53c", d: "M0 22 L26 22 C40 2 62 4 56 22 C51 38 32 34 40 21 C44 15 56 22 70 22", tail: "M70 22 L100 22" },
  shipped: { c: "#9674db", d: "M0 22 C18 6 38 38 60 20 S84 22 92 22", tail: "M92 22 L100 22", head: "M80 9 L96 22 L80 35" },
};

// rows view: the same paths in true pixels (a 232 x 54 cell) so the marker has one even width everywhere; scaling the
// 100 x 44 drawing unevenly made horizontal runs thin and vertical ones fat
const CW = 232, CH = 54;
const px = (d) => { let i = 0; return d.replace(/-?\d+(\.\d+)?/g, (n) => String((i++ % 2 === 0 ? +n * CW / 100 : +n * CH / 44).toFixed(1))); };
const PX = Object.fromEntries(Object.entries(STROKE).map(([k, s]) => [k, { ...s, d: px(s.d), tail: s.tail && px(s.tail), head: s.head && px(s.head) }]));

PX.shipped.head = `M204 14 L224 ${CH / 2} L204 ${CH - 14}`; // an arrowhead drawn in pixels, so it keeps its shape

function Mark({ v, on, last }) {
  const s = PX[v];
  const mid = CH / 2;
  return (
    <svg className="dtr-mark" viewBox={`0 0 ${CW} ${CH}`} width={CW} height={CH} aria-hidden="true" data-on={on} data-v={v}>
      <path className="dtr-mark__rule" d={`M0 ${mid} L${CW} ${mid}`} />
      {s.tail && <path className="dtr-mark__tail" d={s.tail} />}
      <g filter="url(#dtr-marker-h)" stroke={s.c}>
        <path className="dtr-mark__ink" d={s.d} pathLength="1" />
        {s.head && last && <path className="dtr-mark__ink dtr-mark__head" d={s.head} pathLength="1" />}
      </g>
    </svg>
  );
}

// a horizontally scrolling row: scroll-snap, an edge fade on whichever side has more to show
function Scroller({ children }) {
  const ref = useRef(null);
  const [edge, setEdge] = useState({ l: false, r: false });
  const measure = () => {
    const el = ref.current; if (!el) return;
    setEdge({ l: el.scrollLeft > 4, r: el.scrollLeft + el.clientWidth < el.scrollWidth - 4 });
  };
  useEffect(() => {
    measure();
    const el = ref.current; if (!el || typeof ResizeObserver === "undefined") return undefined;
    const ro = new ResizeObserver(measure); ro.observe(el);
    return () => ro.disconnect();
  }, []);
  return (
    <div className="dtr-scroll" ref={ref} onScroll={measure} data-l={edge.l} data-r={edge.r} tabIndex={0} role="group" aria-label="Directions, scroll sideways">
      {children}
    </div>
  );
}

// the same stretch of marker line turned to run top to bottom (lanes view): rotated 90deg into a 44 x 100 cell
function VMark({ v, on, last }) {
  const s = STROKE[v];
  return (
    <svg className="dtr-mark dtr-mark--v" viewBox="0 0 44 100" preserveAspectRatio="none" aria-hidden="true" data-on={on} data-v={v}>
      <g transform="translate(44 0) rotate(90)">
        <path className="dtr-mark__rule" d="M0 22 L100 22" />
        {s.tail && <path className="dtr-mark__tail" d={s.tail} />}
        <g filter="url(#dtr-marker)" stroke={s.c}>
          <path className="dtr-mark__ink" d={s.d} pathLength="1" />
          {s.head && last && <path className="dtr-mark__ink dtr-mark__head" d={s.head} pathLength="1" />}
        </g>
      </g>
    </svg>
  );
}

const MODES = [["rows", "Rows"], ["lanes", "Lanes"]];
const SHOW_DTR_END = false; // mvggfli3 (Agam, "hide this"): set true to bring back the Converged line under the lanes
const SHOW_DTR_TOGGLE = false; // mvggc7xf (Agam, "make lanes default and hide it"): set true to bring the Rows / Lanes toggle back

export default function SchedExplorationsDetour() {
  const [mode, setMode] = useState("rows"); // mvgj4xlm: three stacked sections, each question's marker path running left to right. "lanes" (the vertical view) stays in the code, reachable with SHOW_DTR_TOGGLE
  const [peak, setPeak] = useState(0); // rows and lanes draw once, as they scroll in, and stay drawn
  const [seen, setSeen] = useState(false); // lanes draw once, as they scroll in, and stay drawn
  const reduce = useReducedMotion();
  const [beat, setBeat] = useState(reduce ? ROWS.length + 1 : 0);

  // the section controller (ui/sectionPlay) plays the rows once, row by row, when the figure's top reaches the
  // viewport centre; leaving the viewport resets them, and the Replay button runs them again
  const loopRef = useRef(null);
  const timers = useRef([]);
  const clear = () => { timers.current.forEach(clearTimeout); timers.current = []; };
  useSectionPlay(loopRef, {
    play: (instant) => {
      clear();
      if (instant) { setBeat(ROWS.length + 1); return; }
      setBeat(0);
      for (let i = 0; i <= ROWS.length; i++) timers.current.push(setTimeout(() => setBeat(i + 1), 900 + i * 1700));
    },
    reset: () => { clear(); setBeat(0); },
  });
  useEffect(() => clear, []);

  useEffect(() => { if (beat >= 1) setSeen(true); else setSeen(false); setPeak(beat); }, [beat]);
  const lanesOn = seen || beat >= 1;

  return (
    <div className="dtr" ref={loopRef}>
      <svg width="0" height="0" className="dtr-defs" aria-hidden="true" focusable="false">
        <defs>
          {/* a hair of wobble so the strokes read as felt-tip, not vector */}
          <filter id="dtr-marker-h" filterUnits="userSpaceOnUse" x="-20" y="-20" width="272" height="94">
            <feTurbulence type="fractalNoise" baseFrequency="0.045" numOctaves="2" seed="4" result="n" />
            <feDisplacementMap in="SourceGraphic" in2="n" scale="3.2" />
          </filter>
          <filter id="dtr-marker" x="-5%" y="-30%" width="110%" height="160%">
            <feTurbulence type="fractalNoise" baseFrequency="0.045" numOctaves="2" seed="4" result="n" />
            <feDisplacementMap in="SourceGraphic" in2="n" scale="3.2" />
          </filter>
        </defs>
      </svg>

      {/* mvggcv40: no heading of its own; the section's standard h2 + TL;DR above carry it */}

      {SHOW_DTR_TOGGLE && <div className="dtr__toggle fig-toggle" role="group" aria-label="Explorations layout">
        {MODES.map(([k, label]) => (
          <button key={k} type="button" className={"fig-toggle__btn" + (mode === k ? " is-active" : "")} aria-pressed={mode === k} onClick={() => setMode(k)}>{label}</button>
        ))}
      </div>}

      {mode === "lanes" ? (
        <div className="dtr-lanes">
          {ROWS.map((row) => (
            <div className="dtr-lane" key={row.label} style={{ "--ink": row.ink }}>
              <div className="dtr-row__label"><span>{row.label}</span></div>
              <div className="dtr-lane__line">
                {row.chips.map((c, k) => {
                  const on = lanesOn;
                  return (
                    <div className="dtr-vcell dtr-cell" key={c.t} data-on={on} data-v={c.v} style={{ "--k": k }}>
                      <VMark v={c.v} on={on} last={k === row.chips.length - 1} />
                      <span className="dtr-dot" aria-hidden="true" />
                      <div className="dtr-vcell__txt">
                        <span className="dtr-cell__t">{c.t}</span>
                        <span className="dtr-cell__tag">{TAG[c.v]}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      ) : ROWS.map((row, i) => (
        <div className="dtr-row" key={row.label} style={{ "--ink": row.ink }}>
          <div className="dtr-row__label" role="heading" aria-level={3}><span>{row.label}</span></div>
          <Scroller><div className="dtr-row__line" style={{ "--n": row.chips.length }}>
            {row.chips.map((c, k) => {
              const on = peak >= i + 1 || beat >= i + 1;
              return (
                <div className="dtr-cell" key={c.t} data-on={on} data-v={c.v} style={{ "--k": k }}>
                  <Mark v={c.v} on={on} last={k === row.chips.length - 1} />
                  <span className="dtr-dot" aria-hidden="true" />
                  <span className="dtr-cell__t">{c.t}</span>
                  <span className="dtr-cell__tag">{TAG[c.v]}</span>
                  {c.figma
                    ? <FigmaShot k={c.figma} size="md" tag={false} alt={c.t} className="dtr-fshot" />
                    : c.screen
                    ? <PhoneFrame screen={c.screen} alt={c.t} size="md" interactive={false} enter={false} className="dtr-fshot" />
                    : <p className="dtr-cell__note">{c.note}</p>}
                </div>
              );
            })}
          </div></Scroller>
        </div>
      ))}

      {SHOW_DTR_END && <div className="dtr-end" data-on={mode === "lanes" ? lanesOn : peak >= ROWS.length + 1}>
        <span className="dtr-end__l">Converged</span>
        <p className="dtr-end__t">Schedule on the cart, per shipment, one single page, slots inline.</p>
      </div>}
    </div>
  );
}
