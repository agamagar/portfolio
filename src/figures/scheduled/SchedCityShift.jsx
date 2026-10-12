// Winners and losers, by city (12 Oct 2026). A diverging dot-column chart: one
// column per month, one dot per city, stacked above the line when the city's
// delivered share of scheduled orders ROSE against the month before and below
// it when it FELL, coloured by the size of the change. Built to the reference
// Agam sent (a WSJ jobs chart), with real data only.
//
// Data: public/data/sd/city_month.json, the warehouse pull of 4 Sep 2026 (the
// verified report, sdReport.js, is the 23 Sep pull; this file has city x month
// and that one does not). Its monthly order counts run up to about 8% under the
// verified totals and August is cut off mid-month, so the chart stops at July.
// Metric: delivery_pct = delivered orders as a share of scheduled orders
// placed, so cancellations and returns count against it (the same basis as the
// cancellation figures in the report). Change = percentage points against the
// previous month. A city is drawn in a month only when it had at least MIN
// orders in that month AND the one before, so a ten-order city cannot swing the
// picture; the rest are left out, not estimated. 0.0 pp lands in the Unch. row.
import { useEffect, useMemo, useRef, useState } from "react";
import { feedbackCoalesced } from "../../ui/feedback";
import "./schedCityShift.css";

const MIN = 500;
const FIRST = "2025-12", LAST = "2026-07";
// colour bins on the change in points; lower edge inclusive. Diverging, red to blue, like the reference.
const BINS = [
  { lo: -Infinity, c: "#c8412b", t: "falls 6 pts or more" },
  { lo: -6, c: "#ee7d3a", t: "falls 3 to 6 pts" },
  { lo: -3, c: "#f4bd3d", t: "falls 1 to 3 pts" },
  { lo: -1, c: "#e2d8c0", t: "falls under 1 pt" },
  { lo: 0.05, c: "#b7dba3", t: "rises under 1 pt" },
  { lo: 1, c: "#6fbf6f", t: "rises 1 to 3 pts" },
  { lo: 3, c: "#2f9e5b", t: "rises 3 to 6 pts" },
  { lo: 6, c: "#1b8fd8", t: "rises 6 pts or more" },
];
const binOf = (d) => { let k = 0; BINS.forEach((b, i) => { if (d >= b.lo) k = i; }); return k; };
const signed = (d) => (d > 0 ? "+" : d < 0 ? "−" : "") + Math.abs(d).toFixed(1);
const mLabel = (m) => { const [y, mo] = m.split("-").map(Number); return ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"][mo - 1] + " " + String(y).slice(2); };

const W = 760, PL = 46, PR = 10, PT = 34, COLS = 4, PITCH = 13, R = 5.2, GAP_ROW = 30;

export default function SchedCityShift() {
  const [raw, setRaw] = useState(null);
  const [sel, setSel] = useState(null); // { mi, i } month index, index in that month's top-to-bottom list
  const [table, setTable] = useState(false);
  const wrap = useRef(null);

  useEffect(() => {
    let live = true;
    fetch("/data/sd/city_month.json").then((r) => r.json()).then((d) => { if (live) setRaw(d); }).catch(() => {});
    return () => { live = false; };
  }, []);

  const model = useMemo(() => {
    if (!raw) return null;
    const by = {};
    raw.forEach((r) => { (by[r.month] ||= {})[r.city_name] = r; });
    const all = Object.keys(by).sort();
    const months = all.filter((m) => m >= FIRST && m <= LAST);
    const cols = months.map((m) => {
      const prev = all[all.indexOf(m) - 1];
      const dots = [];
      Object.entries(by[m]).forEach(([city, r]) => {
        const p = by[prev]?.[city];
        if (!p || r.total_orders < MIN || p.total_orders < MIN) return;
        const d = Math.round((r.delivery_pct - p.delivery_pct) * 10) / 10;
        dots.push({ city, d, now: r.delivery_pct, was: p.delivery_pct, orders: r.total_orders, prev });
      });
      dots.sort((a, b) => b.d - a.d || a.city.localeCompare(b.city)); // top to bottom
      return { m, dots, up: dots.filter((x) => x.d > 0.05).reverse(), unch: dots.filter((x) => Math.abs(x.d) < 0.05), down: dots.filter((x) => x.d < -0.05) }; // smallest moves hug the line, the biggest sit furthest out
    });
    const rowsUp = Math.max(...cols.map((c) => Math.ceil(c.up.length / COLS)));
    const rowsDn = Math.max(...cols.map((c) => Math.ceil(c.down.length / COLS)));
    const cities = [...new Set(cols.flatMap((c) => c.dots.map((x) => x.city)))].sort();
    return { cols, rowsUp, rowsDn, cities };
  }, [raw]);

  if (!model) return <div className="csh csh--loading" aria-busy="true">Loading the city data</div>;

  const { cols, rowsUp, rowsDn } = model;
  const colW = (W - PL - PR) / cols.length;
  const yUp = rowsUp * PITCH, yDn = rowsDn * PITCH;
  const y0 = PT + yUp + 4; // the zero line
  const yUnch = y0 + 4 + yDn + GAP_ROW;
  const H = yUnch + 26;
  const cx = (mi) => PL + colW * (mi + 0.5);
  const dotPos = (mi, list, k, dir) => {
    const row = Math.floor(k / COLS), col = k % COLS;
    const n = Math.min(COLS, list.length - row * COLS); // centre a short row
    return [cx(mi) + (col - (n - 1) / 2) * PITCH, dir < 0 ? y0 - 8 - row * PITCH : y0 + 8 + row * PITCH];
  };
  const place = [];
  cols.forEach((c, mi) => {
    c.up.forEach((d, k) => place.push({ mi, d, pos: dotPos(mi, c.up, k, -1) }));
    c.down.forEach((d, k) => place.push({ mi, d, pos: dotPos(mi, c.down, k, 1) }));
    c.unch.forEach((d, k) => place.push({ mi, d, pos: [cx(mi) + (k - (c.unch.length - 1) / 2) * PITCH, yUnch] }));
  });
  const at = (mi, i) => place.find((p) => p.mi === mi && p.d === cols[mi].dots[i]);
  const cur = sel && at(sel.mi, sel.i);
  const say = cur ? `${cur.d.city}, ${mLabel(cols[sel.mi].m)}: delivered share ${signed(cur.d.d)} points, from ${cur.d.was}% to ${cur.d.now}%, ${cur.d.orders.toLocaleString("en-IN")} orders.` : "";

  const move = (e) => {
    const k = e.key;
    if (!["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", "Home", "End", "Escape"].includes(k)) return;
    e.preventDefault();
    if (k === "Escape") { setSel(null); return; }
    const s = sel || { mi: 0, i: 0 };
    const n = (m) => cols[m].dots.length;
    let { mi, i } = s;
    if (k === "ArrowUp") i = Math.max(0, i - 1);
    else if (k === "ArrowDown") i = Math.min(n(mi) - 1, i + 1);
    else if (k === "Home") i = 0;
    else if (k === "End") i = n(mi) - 1;
    else {
      const nm = Math.min(cols.length - 1, Math.max(0, mi + (k === "ArrowRight" ? 1 : -1)));
      i = Math.round((i / Math.max(1, n(mi) - 1)) * (n(nm) - 1)); mi = nm;
    }
    if (!sel) { mi = 0; i = 0; }
    setSel({ mi, i }); feedbackCoalesced("navigate", 120);
  };

  const may = cols.findIndex((c) => c.m === "2026-05");
  const tipLeft = cur ? Math.min(78, Math.max(2, (cur.pos[0] / W) * 100 - 9)) : 0;
  const tipTop = cur ? (cur.pos[1] / H) * 100 : 0;

  return (
    <div className="csh" ref={wrap}>
      <header className="csh__head">
        <p className="csh__title">Winners and losers: where scheduled orders got delivered, city by city</p>
        <p className="csh__sub">One column a month, one dot a city. A dot sits above the line if the share of its scheduled orders that were delivered rose on the month before, below it if it fell, shaded by the change. Cities with fewer than {MIN} orders in either month are left out.</p>
      </header>

      <div className="csh__legend" aria-label="Colour scale: change in the delivered share, in percentage points">
        {BINS.map((b, i) => (
          <span key={i} className="csh__chip" title={b.t}><i style={{ background: b.c }} /></span>
        ))}
        <span className="csh__lt">−6</span><span className="csh__lt csh__lt--m">0</span><span className="csh__lt csh__lt--r">+6 pts</span>
      </div>

      {table ? (
        <div className="csh__tablewrap">
          <table className="csh__table">
            <caption>Change in the delivered share of scheduled orders, in percentage points against the previous month. A dash means the city had under {MIN} orders in that month or the one before.</caption>
            <thead><tr><th scope="col">City</th>{cols.map((c) => <th scope="col" key={c.m}>{mLabel(c.m)}</th>)}</tr></thead>
            <tbody>
              {model.cities.map((city) => (
                <tr key={city}><th scope="row">{city}</th>{cols.map((c) => { const x = c.dots.find((q) => q.city === city); return <td key={c.m}>{x ? signed(x.d) : "–"}</td>; })}</tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="csh__plot">
          <svg
            viewBox={`0 0 ${W} ${H}`} className="csh__svg" tabIndex={0} role="application"
            aria-label="Winners and losers by city. Use the left and right arrow keys to change month and up and down to move between cities. Escape clears. A table version is below the chart."
            onKeyDown={move} onBlur={() => setSel(null)} onMouseLeave={() => setSel(null)}
          >
            {may >= 0 && (
              <g className="csh__band" aria-hidden="true">
                <rect x={PL + colW * may} y={PT - 12} width={colW} height={H - PT + 6} rx="4" />
                <text x={cx(may)} y={PT - 18} textAnchor="middle">6 AM CAPACITY RELEASE</text>
              </g>
            )}
            <line className="csh__zero" x1={PL} x2={W - PR} y1={y0} y2={y0} />
            <text className="csh__ax" x={PL - 8} y={y0 - 10} textAnchor="end">▲ rose</text>
            <text className="csh__ax" x={PL - 8} y={y0 + 18} textAnchor="end">▼ fell</text>
            <text className="csh__ax" x={PL - 8} y={yUnch + 3} textAnchor="end">Unch.</text>
            {cols.map((c, mi) => (
              <text key={c.m} className="csh__ax csh__ax--m" x={cx(mi)} y={H - 4} textAnchor="middle">{mLabel(c.m)}</text>
            ))}
            {place.map((p, k) => {
              const isSel = cur && cur === p;
              return (
                <circle
                  key={k} cx={p.pos[0]} cy={p.pos[1]} r={isSel ? R + 1.6 : R}
                  fill={Math.abs(p.d.d) < 0.05 ? "#8d8d8d" : BINS[binOf(p.d.d)].c} className={"csh__dot" + (isSel ? " is-sel" : "")}
                  onMouseEnter={() => setSel({ mi: p.mi, i: cols[p.mi].dots.indexOf(p.d) })}
                />
              );
            })}
          </svg>
          {cur && (
            <div className="csh__tip" style={{ left: tipLeft + "%", top: tipTop + "%" }} aria-hidden="true">
              <b>{cur.d.city}</b>
              <span>{signed(cur.d.d)} pts in {mLabel(cols[sel.mi].m)}</span>
              <small>{cur.d.was}% to {cur.d.now}% delivered, {cur.d.orders.toLocaleString("en-IN")} orders</small>
            </div>
          )}
        </div>
      )}
      <p className="csh__sr" aria-live="polite">{say}</p>

      <div className="csh__foot">
        <p>
          Delivered share = delivered orders over scheduled orders placed, so cancellations and returns count against a city. Source: the 4 Sep 2026 warehouse pull by city and month (its monthly totals run up to about 8% under the verified report, and August is cut off mid-month, so the chart stops at July). The 6 AM release is the report's April to May capacity change; the chart does not claim it caused any one city's move.
        </p>
        <button type="button" className="csh__toggle" onClick={() => { setTable((t) => !t); setSel(null); }} aria-pressed={table}>{table ? "Chart" : "Table"}</button>
      </div>
    </div>
  );
}
