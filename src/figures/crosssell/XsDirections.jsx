import { useState } from "react";
import XsFull, { FullButton } from "./XsFull";
import "./crosssell.css";

// Figure 4: the five directions placed where they sit on the search results
// page. Read as strategy, five markers on one wireframe. Read honestly, one
// bracket over the whole page: one mechanism on one surface, differing only by
// trigger and position. The two ruled-out positions are drawn struck through.

const DIRS = [
  { n: 1, name: "Product combo", trig: "no trigger", pos: "In the grid as a bundled SKU card, with a bottom-sheet breakdown of its two constituents." },
  { n: 2, name: "Buy Again", trig: "user taps see best pairs", pos: "Expands inline under that buy-again row. The only variant in the set with an explicit trigger." },
  { n: 3, name: "Post ATC", trig: "add to cart", pos: "Auto-injects under the added row, plus a full-screen expanded variant." },
  { n: 4, name: "ShopX feedback", trig: "no trigger", pos: "Hoisted near the top of the results page." },
  { n: 5, name: "More to explore", trig: "no trigger", pos: "End of page, after the out-of-stock block." },
];

const OUT = [
  { n: "A", name: "Pinned top-of-grid strip", s: "A combined add-two. It displaced the searched result, and one button adding two items is the construct under scrutiny." },
  { n: "B", name: "Mid-grid build-your-regime module", s: "Worth knowing which reason applied, because it decides whether Product Combo is still alive." },
];

function Marker({ n, sel, setSel, out }) {
  const on = sel === String(n);
  return (
    <button
      type="button"
      className={"xm__mk" + (out ? " xm__mk--out" : "")}
      aria-pressed={on}
      aria-label={out ? `Ruled out ${n}` : `Direction ${n}`}
      onClick={() => setSel(on ? null : String(n))}
    >
      {n}
    </button>
  );
}

function Map({ honest, setHonest, sel, setSel, full, onFull }) {
  const mk = (n, out) => <Marker n={n} sel={sel} setSel={setSel} out={out} />;
  const cur = DIRS.find((d) => String(d.n) === sel) || OUT.find((o) => o.n === sel);
  return (
    <div className="fc xm">
      <div className="fc__bar">
        <span className="fc__bar-t">Five directions on the search results page</span>
        <div className="xd__switch" role="tablist" aria-label="How to read the board">
          <button type="button" role="tab" aria-selected={!honest} className={!honest ? "is-on" : ""} onClick={() => setHonest(false)}>Read as strategy</button>
          <button type="button" role="tab" aria-selected={honest} className={honest ? "is-on" : ""} onClick={() => setHonest(true)}>Read honestly</button>
        </div>
        <FullButton full={full} onFull={onFull} />
      </div>

      <div className="xm__grid">
        <div className="xm__phone" data-honest={honest ? "1" : "0"}>
          <div className="xm__screen">
            <div className="xm__search">shampoo</div>
            <div className="xm__strip xm__ghost">{mk("A", true)}<span>pinned add-two strip</span></div>
            <div className="xm__hoist">{mk(4)}<span>feedback module, hoisted</span></div>
            <div className="xm__row xm__row--again"><span>Buy again</span>{mk(2)}<span className="xm__row-s">see best pairs</span></div>
            <div className="xm__cells">
              <div className="xm__cell" data-added="1"><span className="xm__cell-l">added</span></div>
              <div className="xm__cell xm__cell--combo">{mk(1)}<span className="xm__cell-l">combo card</span></div>
              <div className="xm__inject">{mk(3)}<span>under the added row, on add to cart</span></div>
              <div className="xm__cell" /><div className="xm__cell" />
              <div className="xm__regime xm__ghost">{mk("B", true)}<span>build-your-regime module</span></div>
              <div className="xm__cell" /><div className="xm__cell" />
            </div>
            <div className="xm__oos">out of stock</div>
            <div className="xm__end">{mk(5)}<span>more to explore, end of page</span></div>
          </div>
          {honest && (
            <div className="xm__bracket" aria-hidden="true">
              <span>One mechanism on one surface</span>
            </div>
          )}
        </div>

        <div className="xm__side">
          {!honest ? (
            <>
              <div className="xm__list">
                {DIRS.map((d) => (
                  <button type="button" className="xm__li" key={d.n} aria-pressed={sel === String(d.n)} onClick={() => setSel(sel === String(d.n) ? null : String(d.n))}>
                    <span className="xm__li-n">{d.n}</span>
                    <span className="xm__li-t">{d.name}</span>
                    <span className="xm__li-s">{d.trig}</span>
                  </button>
                ))}
                {OUT.map((o) => (
                  <button type="button" className="xm__li xm__li--out" key={o.n} aria-pressed={sel === o.n} onClick={() => setSel(sel === o.n ? null : o.n)}>
                    <span className="xm__li-n">{o.n}</span>
                    <span className="xm__li-t">{o.name}</span>
                    <span className="xm__li-s">ruled out</span>
                  </button>
                ))}
              </div>
              <div className="xm__panel">
                {cur ? <p>{cur.pos || cur.s}</p> : <p className="xo__hint">Click a marker on the page, or a row here.</p>}
              </div>
            </>
          ) : (
            <div className="xd__one">
              <div className="xd__one-t">One mechanism on one surface</div>
              <div className="xd__one-s">Pair-completers on the search results page, differing only by trigger and by position.</div>
              <p className="xd__verdict">All five are category completion. Shampoo to conditioner, mask, serum. That's basket-deepening inside a category the shopper has already accepted. It works, it'll show lift, and it's the right v1. It also never touches a category they've never bought, which was the entire premise.</p>
            </div>
          )}
        </div>
      </div>

      <div className="xf__cap">Two things had also drifted, and naming drift is most of the job. Nearly every card in the final frames carried an ad label, against a framework rule that v1 stays organic. And the surface the framework scored joint-highest, the post-order wait, was never designed at all.</div>
    </div>
  );
}

export default function XsDirections() {
  const [honest, setHonest] = useState(false);
  const [sel, setSel] = useState(null);
  return (
    <XsFull
      label="Five directions on the page, full screen"
      render={({ full, onFull }) => <Map honest={honest} setHonest={setHonest} sel={sel} setSel={setSel} full={full} onFull={onFull} />}
    />
  );
}
