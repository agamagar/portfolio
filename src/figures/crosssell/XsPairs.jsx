import { useState, useRef } from "react";
import D from "./xsPairsData.json";
import "./crosssell.css";

// Figure: the best cross-sell partner for the fourteen largest categories,
// ranked two ways. Computed in-session on 4 September 2026 from the co-purchase
// export "overall data cross buy zepto - result.csv" (base_l3, cross_sell_l3,
// cross_sell_orders): 847,911 unique directed pairs over 1,496 base categories
// and 53,869,570 orders. The export carries DUPLICATE rows for the same pair -
// 15.2% of rows, up to 25 for one pair, with no column explaining the split - so
// they are summed. The first cut of this figure read a single row per pair and
// understated 9 of the 14 headline counts; fixed 8 September 2026.
// lift(A->B) = P(B|A) / P(B), with a 200-order support floor,
// because a rare pair with a huge lift is noise until it has support. That floor
// is the one the second pull could not apply - the L3 table ships no support
// column, this export does.
//
// !! Internal Zepto numbers, and named categories. Covered by the exception Agam
// extended on 2026-09-04; see the entry's todo. Not public until that is settled.
//
// Form: the job is a change of IDENTITY (which partner wins), not magnitude on a
// common scale, so there is no shared axis - volume and lift are different units
// and putting them on one would be the dual-axis mistake. Names are the data;
// the only bar is the lift column, which is a single measure on its own scale.
// Repetition carries the argument: the left column keeps returning the same few
// universal items, so those are tinted with the negative tone and counted.
// Tones inherited from .xn (validated pair) - no new hues.

const fmt = (n) => n.toLocaleString("en-US");

export default function XsPairs() {
  const [sort, setSort] = useState("size");
  const [tip, setTip] = useState(null);
  const box = useRef(null);
  const rows = [...D.rows].sort((a, b) =>
    sort === "size" ? b.total - a.total : b.lift_lift - a.lift_lift);
  const maxLift = Math.max(...rows.map((r) => r.lift_lift));
  const show = (e, text) => {
    const r = box.current?.getBoundingClientRect();
    if (r) setTip({ x: e.clientX - r.left, y: e.clientY - r.top, text });
  };
  const hide = () => setTip(null);

  return (
    <figure className="xn xq" ref={box}>
      <div className="xq__top">
        <p className="xq__claim">
          Rank each category&rsquo;s partners by orders and <b>five</b> items win all fourteen.
          Rank them by lift and you get <b>thirteen different answers</b>. Thirteen of the fourteen
          categories change their mind.
        </p>
        <div className="xn__tabs" role="tablist" aria-label="Sort order">
          <button role="tab" aria-selected={sort === "size"} className="xn__tab"
            onClick={() => setSort("size")}>By category size</button>
          <button role="tab" aria-selected={sort === "lift"} className="xn__tab"
            onClick={() => setSort("lift")}>By lift</button>
        </div>
      </div>

      <div className="xq__legend">
        <span className="xq__key"><i data-tone="neg" />appears as the top partner for 4 categories</span>
        <span className="xq__key"><i data-tone="pos" />lift, against how often the partner appears anywhere</span>
      </div>

      <div className="xq__grid" role="table"
        aria-label={`Best cross-sell partner per category, by orders and by lift. ${rows.map((r) => `${r.cat}: by orders ${r.vol_partner}, by lift ${r.lift_partner} at ${r.lift_lift} times`).join(". ")}`}>
        <div className="xq__head" role="row">
          <span role="columnheader">Category</span>
          <span role="columnheader">Best partner by orders</span>
          <span role="columnheader">Best partner by lift</span>
        </div>
        {rows.map((r) => (
          <div className="xq__row" role="row" key={r.cat}>
            <span className="xq__cat" role="cell">
              {r.cat}
              <em>{fmt(r.total)} orders</em>
            </span>

            <span className="xq__cell xq__cell--vol" role="cell"
              onMouseMove={(e) => show(e, `${r.cat} → ${r.vol_partner}: ${fmt(r.vol_orders)} orders, but only ${r.vol_lift}× lift`)}
              onMouseLeave={hide}>
              <b className={r.vol_repeat > 1 ? "xq__universal" : ""}>
                {r.vol_partner}
                {r.vol_repeat > 1 && (
                  <i className="xq__badge" data-tone="neg"
                     title={`top partner for ${r.vol_repeat} of the fourteen categories`}>{r.vol_repeat}</i>
                )}
              </b>
              <em>{fmt(r.vol_orders)} orders · {r.vol_lift}×</em>
            </span>

            <span className="xq__cell" role="cell"
              onMouseMove={(e) => show(e, `${r.cat} → ${r.lift_partner}: ${r.lift_lift}× more likely than chance, on ${fmt(r.lift_orders)} orders`)}
              onMouseLeave={hide}>
              <b>{r.lift_partner}</b>
              <span className="xq__bar">
                <i data-tone={r.same ? "g2" : "pos"} style={{ width: `${(r.lift_lift / maxLift) * 100}%` }} />
                <em>{r.lift_lift}×</em>
              </span>
              {r.same && <span className="xq__same">unchanged</span>}
            </span>
          </div>
        ))}
      </div>

      <p className="xq__foot">
        {fmt(D.pairs)} directed pairs across {fmt(D.cats)} base categories and {fmt(D.total)} orders.
        Lift is how much more often a pair appears together than the partner&rsquo;s overall rate predicts,
        with a {D.floor}-order support floor — a rare pair with a spectacular lift is noise until it has
        support. The two columns are deliberately not on a shared scale: orders and lift are different
        units, and the argument here is which name wins, not by how much.
      </p>

      <details className="xv__table">
        <summary>Table view</summary>
        <table>
          <caption className="xv__sr">Best cross-sell partner per category, ranked by orders and by lift</caption>
          <thead>
            <tr><th scope="col">Category</th><th scope="col">By orders</th><th scope="col">Orders</th>
              <th scope="col">Its lift</th><th scope="col">By lift</th><th scope="col">Lift</th></tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.cat}>
                <th scope="row">{r.cat}</th>
                <td>{r.vol_partner}</td><td>{fmt(r.vol_orders)}</td><td>{r.vol_lift}×</td>
                <td>{r.lift_partner}</td><td>{r.lift_lift}×</td>
              </tr>
            ))}
          </tbody>
        </table>
      </details>

      {tip && <div className="xn__tip" style={{ left: tip.x, top: tip.y }} role="status">{tip.text}</div>}
    </figure>
  );
}
