import { useEffect, useState } from "react";
import { useReducedMotion, useFitScale, useInViewLoop } from "../ds/hooks";
import "./scheduled.css";

// "Before converging: the explorations." The directions explored on each factor,
// resolving to the shipped path. Verdicts: shipped, killed, didn't-scale,
// considered. Tells the experimentation story (explore wide, then converge).

// mukuyuyb (28 Sep): the board follows the SITE theme. The figure design
// system has a dark theme (.ds-root[data-theme="dark"], ds/tokens.css); this
// opts in whenever the page is dark and follows the toggle live.
function useSiteDark() {
  const read = () => typeof document !== "undefined" && document.documentElement.classList.contains("dark");
  const [dark, setDark] = useState(read);
  useEffect(() => {
    const mo = new MutationObserver(() => setDark(read()));
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    return () => mo.disconnect();
  }, []);
  return dark;
}

const TAG = { shipped: "Shipped", killed: "Killed", scale: "Didn't scale", considered: "Considered" };

const ROWS = [
  { label: "Placement", chips: [
    { t: "On the PDP", v: "killed" },
    { t: "Home prompt", v: "shipped" },
    { t: "Cart, per shipment", v: "shipped" },
  ] },
  { label: "Cart structure", chips: [
    { t: "Tabbed, one per shipment", v: "killed" },
    { t: "Bottom sheet", v: "scale" },
    { t: "One combined cart", v: "killed" },
    { t: "Single-page listing", v: "shipped" },
  ] },
  { label: "Slot picker", chips: [
    { t: "Calendar", v: "considered" },
    { t: "Bottom-sheet picker", v: "considered" },
    { t: "Inline slot list", v: "shipped" },
  ] },
];

function ExplorationsBoard({ view }) {
  const dark = useSiteDark();
  const reduce = useReducedMotion();
  const animated = view === "board";
  const [beat0, setBeat] = useState(reduce ? ROWS.length + 1 : 0);
  const beat = animated ? beat0 : ROWS.length + 1; // the other views show every verdict at once
  // mtmrkaos: scales up to the full article column (816 / 660 = 1.24)
  const { fitRef, frameRef } = useFitScale(660, 1.3);

  const loopRef = useInViewLoop(!reduce && animated, async ({ wait, alive }) => {
    while (alive()) {
      setBeat(0); await wait(900); if (!alive()) break;
      for (let i = 0; i < ROWS.length && alive(); i++) { setBeat(i + 1); await wait(1050); }
      if (!alive()) break;
      setBeat(ROWS.length + 1); await wait(2400);
    }
  });

  return (
    <div className="ds-fit" ref={(n) => { fitRef.current = n; loopRef.current = n; }}>
      <div className="ds-root ds-root--phone ds-root--explore" ref={frameRef} data-theme={dark ? "dark" : undefined}>
        {/* mtmlp0i6 / mtmrkaos: the board IS the frame; no stage wrapper, no card
            chrome, edge to edge of the column */}
          <div className="sd-board sd-board--flat">
            <div className="sd-board__head">
              <span className="sd-board__title">What we explored, before converging</span>
              <span className="sd-board__count">{ROWS.length} factors</span>
            </div>
            {view === "verdict" ? (
              // mvds282z: the same chips regrouped by how each direction ended
              Object.keys(TAG).map((v) => (
                <div className="expl-row" key={v}>
                  <span className="expl-label">{TAG[v]}</span>
                  <div className="expl-chips">
                    {ROWS.flatMap((row) => row.chips.filter((c) => c.v === v).map((c) => (
                      <span className="expl-chip" key={row.label + c.t} data-on="true" data-v={c.v}>{row.label}: {c.t}</span>
                    )))}
                  </div>
                </div>
              ))
            ) : ROWS.map((row, i) => (
              <div className="expl-row" key={row.label}>
                <span className="expl-label">{row.label}</span>
                <div className="expl-chips">
                  {row.chips.map((c) => (
                    <span className="expl-chip" key={c.t} data-on={beat >= i + 1} data-v={c.v}>
                      {c.t}<span className="expl-chip__tag">{TAG[c.v]}</span>
                    </span>
                  ))}
                </div>
              </div>
            ))}
            <div className="expl-converged" data-on={beat >= ROWS.length + 1}>
              <span className="expl-converged__l">Converged</span>
              <span className="expl-converged__t">Schedule on the cart, per shipment, one single page, slots inline.</span>
            </div>
          </div>
      </div>
    </div>
  );
}

// mvds282z (18 Oct, "bring all variations of this in toggle"): the board has had one design (the animated board, which
// builds row by row and loops); there is no earlier version in the history. The toggle adds two more views of the same
// data: the board standing still with every verdict shown, and the chips regrouped by verdict. Dev / preview only; the
// animated board is the default and what the public page shows.
const VIEWS = [["board", "Board"], ["still", "Still"], ["verdict", "By verdict"]];
export default function SchedExplorations() {
  const [view, setView] = useState("board");
  return (
    <div className="expl-views">
      {!import.meta.env.PROD && (
        <div className="fig-toggle expl-views__toggle" role="group" aria-label="Explorations layout">
          {VIEWS.map(([k, label]) => (
            <button key={k} type="button" className={"fig-toggle__btn" + (view === k ? " is-active" : "")} aria-pressed={view === k} onClick={() => setView(k)}>{label}</button>
          ))}
        </div>
      )}
      <ExplorationsBoard key={view === "board" ? "board" : "static"} view={view} />
    </div>
  );
}
