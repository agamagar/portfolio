// Chart primitives for the Scheduled Delivery report grid.
//
// Built to the dataviz method: the form is picked from the data's job, colour is
// assigned by job and validated (see index.css, the --sdc-* tokens: the
// four-hue categorical theme, the blue sequential ramps and the reserved
// on-time status trio all pass the six checks in both themes, all pairs), marks
// are thin with a 2px surface gap between stacked segments, every plot carries a
// hover readout, every multi-series plot carries a legend, and every card can
// flip to a table. No chart here uses two y-scales: where two measures of
// different scale belong together they are drawn as two plots side by side.
import { useMemo, useRef, useState } from "react";

// ---- tokens ---------------------------------------------------------------
export const CAT = ["var(--sdc-c1)", "var(--sdc-c2)", "var(--sdc-c3)", "var(--sdc-c4)"];
export const SEQ5 = [1, 2, 3, 4, 5].map((i) => `var(--sdc-s5-${i})`);
export const SEQ7 = [1, 2, 3, 4, 5, 6, 7].map((i) => `var(--sdc-s7-${i})`);
export const OK3 = ["var(--sdc-ok-within)", "var(--sdc-ok-early)", "var(--sdc-ok-late)"];

// ---- formatters -----------------------------------------------------------
export const fmtK = (n) => (n >= 1e6 ? (n / 1e6).toFixed(2) + "M" : n >= 1e3 ? Math.round(n / 1e3) + "k" : String(Math.round(n)));
export const fmtInt = (n) => Math.round(n).toLocaleString("en-IN");
export const fmtPct1 = (n) => n.toFixed(1) + "%";
export const fmtPct0 = (n) => Math.round(n) + "%";
export const fmtInr = (n) => "₹" + Math.round(n).toLocaleString("en-IN");

// ---- label de-collision ---------------------------------------------------
// End-of-line and slope labels land wherever their series lands, which for
// eight cities inside three percentage points means a pile. This pushes them
// apart to a minimum gap and then pulls the stack back inside the plot, so a
// label never sits on top of another one.
function spread(ys, minGap, lo, hi) {
  const idx = ys.map((y, i) => ({ y, i })).sort((a, b) => a.y - b.y);
  for (let k = 1; k < idx.length; k++) {
    if (idx[k].y - idx[k - 1].y < minGap) idx[k].y = idx[k - 1].y + minGap;
  }
  const over = idx.length ? idx[idx.length - 1].y - hi : 0;
  if (over > 0) for (const it of idx) it.y -= over;
  if (idx.length && idx[0].y < lo) {
    const under = lo - idx[0].y;
    for (const it of idx) it.y += under;
  }
  const out = [];
  for (const it of idx) out[it.i] = it.y;
  return out;
}

// ---- legend ---------------------------------------------------------------
export function Legend({ items, swatch = "box" }) {
  return (
    <ul className="sdc__legend">
      {items.map((it) => (
        <li key={it.label}>
          <span
            className={"sdc__sw sdc__sw--" + swatch + (it.dash ? " is-dash" : "")}
            style={{ "--sw": it.color }}
            aria-hidden="true"
          />
          {it.label}
        </li>
      ))}
    </ul>
  );
}

// ---- 100% stacked columns -------------------------------------------------
// For a mix that always sums to 100: the slot-of-day split, the lead-time
// distribution, the within / early / late split. 2px surface gap between
// segments so the boundaries read without an outline.
export function StackedColumns({ rows, series, colors, height = 230, labelSeries, hoverFmt = fmtPct1, xLabelEvery = 1 }) {
  const W = 620, H = height, P = { l: 34, r: 10, t: 14, b: 26 };
  const [hi, setHi] = useState(null);
  const slot = (W - P.l - P.r) / rows.length;
  const bw = Math.min(34, slot * 0.66);
  const plotH = H - P.t - P.b;
  const y = (v) => P.t + (1 - v / 100) * plotH;
  return (
    <div className="sdc__plot">
      <svg viewBox={`0 0 ${W} ${H}`} className="sdc__svg" role="img" aria-label="Stacked share by month">
        {[0, 25, 50, 75, 100].map((t) => (
          <g key={t}>
            <line x1={P.l} x2={W - P.r} y1={y(t)} y2={y(t)} className="sdc__grid" />
            <text x={P.l - 6} y={y(t) + 3.5} className="sdc__tick" textAnchor="end">{t}</text>
          </g>
        ))}
        {rows.map((r, i) => {
          const cx = P.l + slot * i + slot / 2;
          let acc = 0;
          return (
            <g
              key={r.m || r.label}
              onPointerEnter={() => setHi(i)}
              onPointerLeave={() => setHi(null)}
              onFocus={() => setHi(i)}
              onBlur={() => setHi(null)}
              tabIndex={0}
              aria-label={`${r.label}: ${series.map((s) => `${s.label} ${hoverFmt(r[s.key])}`).join(", ")}`}
            >
              <rect x={cx - slot / 2} y={P.t} width={slot} height={plotH} fill="transparent" />
              {series.map((s, si) => {
                const v = r[s.key];
                const top = y(acc + v);
                const h = Math.max(0, y(acc) - top - 2); // 2px surface gap
                acc += v;
                return (
                  <rect
                    key={s.key}
                    x={cx - bw / 2}
                    y={top}
                    width={bw}
                    height={h}
                    rx={1.5}
                    fill={colors[si % colors.length]}
                    className={"sdc__seg" + (hi != null && hi !== i ? " is-off" : "")}
                  />
                );
              })}
              {labelSeries && (
                <text x={cx} y={y(r[labelSeries]) - 5} className="sdc__label sdc__label--onbar" textAnchor="middle">
                  {Math.round(r[labelSeries])}
                </text>
              )}
              {(i % xLabelEvery === 0 || i === rows.length - 1) && (
                <text x={cx} y={H - 8} className="sdc__tick" textAnchor="middle">{r.label}</text>
              )}
            </g>
          );
        })}
      </svg>
      {hi != null && (
        <div className="sdc__tip sdc__tip--list" style={{ left: `${((P.l + slot * hi + slot / 2) / W) * 100}%` }}>
          <strong>{rows[hi].label}</strong>
          {series.map((s, si) => (
            <span key={s.key}>
              <i className="sdc__sw sdc__sw--box" style={{ "--sw": colors[si % colors.length] }} />
              {s.label}
              <b>{hoverFmt(rows[hi][s.key])}</b>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

// ---- multi-series line ----------------------------------------------------
// One y-scale, up to four series, each direct-labelled at its last real point
// so identity never rests on colour alone. Nulls break the line rather than
// interpolating across a month the report does not cover.
export function MultiLine({ rows, series, colors, yFmt = fmtPct1, height = 230, domainMin = 0, domainMax, markLabel }) {
  const W = 620, H = height, P = { l: 38, r: 62, t: 16, b: 26 };
  const [hi, setHi] = useState(null);
  const svg = useRef(null);
  const all = series.flatMap((s) => rows.map((r) => r[s.key])).filter((v) => v != null);
  const yMax = domainMax ?? Math.max(...all) * 1.08;
  const yMin = domainMin ?? Math.min(...all);
  const x = (i) => P.l + (i / Math.max(1, rows.length - 1)) * (W - P.l - P.r);
  const y = (v) => P.t + (1 - (v - yMin) / Math.max(1e-9, yMax - yMin)) * (H - P.t - P.b);
  const ticks = [yMin, yMin + (yMax - yMin) / 2, yMax];
  const onMove = (e) => {
    const r = svg.current.getBoundingClientRect();
    const px = ((e.clientX - r.left) / r.width) * W;
    const i = Math.round(((px - P.l) / (W - P.l - P.r)) * (rows.length - 1));
    setHi(Math.max(0, Math.min(rows.length - 1, i)));
  };
  const lines = series
    .map((ss, si) => {
      const pts = rows.map((r, i) => ({ i, v: r[ss.key] })).filter((pt) => pt.v != null);
      if (!pts.length) return null;
      return {
        s: ss,
        si,
        d: pts.map((pt, k) => `${k ? "L" : "M"}${x(pt.i).toFixed(1)},${y(pt.v).toFixed(1)}`).join(" "),
        last: pts[pts.length - 1],
      };
    })
    .filter(Boolean);
  const labelYs = spread(lines.map((l) => y(l.last.v) + 3.5), 11, P.t + 8, H - P.b);
  const drawn = lines.map((l, k) => ({ ...l, labelY: labelYs[k] }));
  return (
    <div className="sdc__plot">
      <svg ref={svg} viewBox={`0 0 ${W} ${H}`} className="sdc__svg" onPointerMove={onMove} onPointerLeave={() => setHi(null)} role="img" aria-label="Series by month">
        {ticks.map((t, i) => (
          <g key={i}>
            <line x1={P.l} x2={W - P.r} y1={y(t)} y2={y(t)} className="sdc__grid" />
            <text x={P.l - 6} y={y(t) + 3.5} className="sdc__tick" textAnchor="end">{yFmt(t)}</text>
          </g>
        ))}
        {rows.map((r, i) =>
          (i % 2 === 0 && i < rows.length - 2) || i === rows.length - 1 ? (
            <text key={r.label} x={x(i)} y={H - 8} className="sdc__tick" textAnchor={i === 0 ? "start" : i === rows.length - 1 ? "end" : "middle"}>{r.label}</text>
          ) : null
        )}
        {markLabel != null && (
          <g>
            <line x1={x(markLabel)} x2={x(markLabel)} y1={P.t} y2={H - P.b} className="sdc__mark" />
          </g>
        )}
        {drawn.map(({ s: ss, si, d, last, labelY }) => (
          <g key={ss.key}>
            <path d={d} className="sdc__mline" style={{ stroke: colors[si % colors.length] }} />
            <circle cx={x(last.i)} cy={y(last.v)} r={4} className="sdc__dot" style={{ fill: colors[si % colors.length] }} />
            {Math.abs(labelY - (y(last.v) + 3.5)) > 3 && (
              <path d={`M${(x(last.i) + 5).toFixed(1)},${y(last.v).toFixed(1)} L${(x(last.i) + 8).toFixed(1)},${(labelY - 3.5).toFixed(1)}`} className="sdc__leader" style={{ stroke: colors[si % colors.length] }} />
            )}
            <text x={x(last.i) + 9} y={labelY} className="sdc__label">{ss.short || ss.label}</text>
          </g>
        ))}
        {hi != null && <line x1={x(hi)} x2={x(hi)} y1={P.t} y2={H - P.b} className="sdc__cross" />}
        {hi != null &&
          series.map((s, si) =>
            rows[hi][s.key] == null ? null : (
              <circle key={s.key} cx={x(hi)} cy={y(rows[hi][s.key])} r={5} className="sdc__dot" style={{ fill: colors[si % colors.length] }} />
            )
          )}
      </svg>
      {hi != null && (
        <div className="sdc__tip sdc__tip--list" style={{ left: `${(x(hi) / W) * 100}%` }}>
          <strong>{rows[hi].label}</strong>
          {series.map((s, si) => (
            <span key={s.key}>
              <i className="sdc__sw sdc__sw--line" style={{ "--sw": colors[si % colors.length] }} />
              {s.label}
              <b>{rows[hi][s.key] == null ? "no data" : yFmt(rows[hi][s.key])}</b>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

// ---- columns that can carry a range --------------------------------------
// The capacity snapshot gives exact numbers for the peak hours and a range for
// the midday and late-afternoon blocks. A range is drawn as an open band with
// its own legend entry, never flattened to a midpoint.
export function RangeColumns({ rows, valueKey, yFmt = fmtPct1, height = 230, emphasis, color = "var(--sdc-c1)" }) {
  const W = 620, H = height, P = { l: 38, r: 10, t: 18, b: 30 };
  const [hi, setHi] = useState(null);
  const vals = rows.flatMap((r) => { const v = r[valueKey]; return typeof v === "object" ? [v.lo, v.hi] : [v]; });
  const yMax = Math.max(...vals) * 1.12;
  const slot = (W - P.l - P.r) / rows.length;
  const bw = Math.min(30, slot * 0.62);
  const y = (v) => P.t + (1 - v / yMax) * (H - P.t - P.b);
  const base = H - P.b;
  return (
    <div className="sdc__plot">
      <svg viewBox={`0 0 ${W} ${H}`} className="sdc__svg" role="img">
        {[0, yMax / 2, yMax].map((t, i) => (
          <g key={i}>
            <line x1={P.l} x2={W - P.r} y1={y(t)} y2={y(t)} className="sdc__grid" />
            <text x={P.l - 6} y={y(t) + 3.5} className="sdc__tick" textAnchor="end">{yFmt(t)}</text>
          </g>
        ))}
        {rows.map((r, i) => {
          const v = r[valueKey];
          const cx = P.l + slot * i + slot / 2;
          const isRange = typeof v === "object" && v !== null;
          const em = emphasis ? emphasis(r) : false;
          const top = isRange ? y(v.hi) : y(v);
          const bot = isRange ? y(v.lo) : base;
          return (
            <g key={r.label} onPointerEnter={() => setHi(i)} onPointerLeave={() => setHi(null)} onFocus={() => setHi(i)} onBlur={() => setHi(null)} tabIndex={0}
              aria-label={`${r.span || r.label}: ${isRange ? yFmt(v.lo) + " to " + yFmt(v.hi) : yFmt(v)}`}>
              <rect x={cx - slot / 2} y={P.t} width={slot} height={H - P.t - P.b} fill="transparent" />
              {isRange ? (
                <>
                  <rect x={cx - bw / 2} y={top} width={bw} height={Math.max(2, bot - top)} rx={3} fill={color} className="sdc__rangeband" />
                  <line x1={cx - bw / 2} x2={cx + bw / 2} y1={top} y2={top} className="sdc__rangecap" style={{ stroke: color }} />
                  <line x1={cx - bw / 2} x2={cx + bw / 2} y1={bot} y2={bot} className="sdc__rangecap" style={{ stroke: color }} />
                </>
              ) : (
                <path
                  d={`M${cx - bw / 2},${base} V${top + 4} a4,4 0 0 1 4,-4 h${bw - 8} a4,4 0 0 1 4,4 V${base} Z`}
                  fill={color}
                  className={"sdc__seg" + (em ? " is-em" : emphasis ? " is-dim" : "") + (hi === i ? " is-hi" : "")}
                />
              )}
              {em && !isRange && <text x={cx} y={top - 6} className="sdc__label" textAnchor="middle">{yFmt(v)}</text>}
              <text x={cx} y={H - 9} className="sdc__tick" textAnchor="middle">{r.label}</text>
            </g>
          );
        })}
      </svg>
      {hi != null && (
        <div className="sdc__tip" style={{ left: `${((P.l + slot * hi + slot / 2) / W) * 100}%` }}>
          <strong>
            {typeof rows[hi][valueKey] === "object"
              ? `${yFmt(rows[hi][valueKey].lo)} to ${yFmt(rows[hi][valueKey].hi)}`
              : yFmt(rows[hi][valueKey])}
          </strong>
          <span>{rows[hi].span || rows[hi].label}</span>
        </div>
      )}
    </div>
  );
}

// ---- paired comparison rows ----------------------------------------------
// Eight measures on eight different scales, so no shared axis exists. Each row
// is its own 100%-of-the-larger bar pair with both values printed: the honest
// form for a table of unlike measures.
export function CompareRows({ rows, aLabel, bLabel, colors = [CAT[0], CAT[1]], format }) {
  return (
    <div className="sdc__cmp">
      <Legend items={[{ label: aLabel, color: colors[0] }, { label: bLabel, color: colors[1] }]} />
      <div className="sdc__cmp-rows">
        {rows.map((r) => {
          const max = Math.max(r.a, r.b);
          return (
            <div className="sdc__cmp-row" key={r.label} tabIndex={0} aria-label={`${r.label}: ${aLabel} ${format(r.a, r)}, ${bLabel} ${format(r.b, r)}`}>
              <span className="sdc__cmp-label">{r.label}</span>
              <span className="sdc__cmp-bars">
                <span className="sdc__cmp-bar">
                  <span style={{ width: `${(r.a / max) * 100}%`, background: colors[0] }} />
                  <em>{format(r.a, r)}</em>
                </span>
                <span className="sdc__cmp-bar">
                  <span style={{ width: `${(r.b / max) * 100}%`, background: colors[1] }} />
                  <em>{format(r.b, r)}{r.approxB ? "*" : ""}</em>
                </span>
              </span>
              {r.delta && <span className="sdc__cmp-delta">{r.delta}</span>}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ---- slope chart ----------------------------------------------------------
// Eight cities, four checkpoint months, one measure. Ranking and direction are
// the job, so lines between labelled columns beat eight separate bars.
export function SlopeChart({ rows, months, yFmt = fmtPct0, height = 300, emphasise = [] }) {
  const W = 620, H = height, P = { l: 76, r: 52, t: 18, b: 26 };
  const [hi, setHi] = useState(null);
  const all = rows.flatMap((r) => r.values);
  const yMax = Math.max(...all) + 3, yMin = Math.min(...all) - 3;
  const x = (i) => P.l + (i / (months.length - 1)) * (W - P.l - P.r);
  const y = (v) => P.t + (1 - (v - yMin) / (yMax - yMin)) * (H - P.t - P.b);
  const last = months.length - 1;
  const leftY = spread(rows.map((r) => y(r.values[0]) + 3.5), 11, P.t + 8, H - P.b);
  const rightY = spread(rows.map((r) => y(r.values[last]) + 3.5), 11, P.t + 8, H - P.b);
  return (
    <div className="sdc__plot">
      <svg viewBox={`0 0 ${W} ${H}`} className="sdc__svg" role="img" aria-label="Within-slot share by city">
        {months.map((mo, i) => (
          <g key={mo}>
            <line x1={x(i)} x2={x(i)} y1={P.t} y2={H - P.b} className="sdc__grid" />
            <text x={x(i)} y={H - 8} className="sdc__tick" textAnchor="middle">{mo}</text>
          </g>
        ))}
        {rows.map((r, ri) => {
          const on = hi == null ? null : hi === r.key;
          const em = emphasise.includes(r.key);
          const d = r.values.map((v, i) => `${i ? "L" : "M"}${x(i).toFixed(1)},${y(v).toFixed(1)}`).join(" ");
          return (
            <g
              key={r.key}
              onPointerEnter={() => setHi(r.key)}
              onPointerLeave={() => setHi(null)}
              onFocus={() => setHi(r.key)}
              onBlur={() => setHi(null)}
              tabIndex={0}
              aria-label={`${r.key}: ${months.map((mo, i) => `${mo} ${yFmt(r.values[i])}`).join(", ")}`}
              className={"sdc__slope" + (on === false ? " is-off" : "") + (on ? " is-on" : "") + (em ? " is-em" : "")}
            >
              {/* a fat transparent copy so the line is hoverable, not just its 2px stroke */}
              <path d={d} className="sdc__slope-hit" />
              <path d={d} className="sdc__sline" style={{ stroke: r.color }} />
              {r.values.map((v, i) => <circle key={i} cx={x(i)} cy={y(v)} r={3} style={{ fill: r.color }} className="sdc__sdot" />)}
              <path d={`M${(x(0) - 5).toFixed(1)},${y(r.values[0]).toFixed(1)} L${(x(0) - 8).toFixed(1)},${(leftY[ri] - 3.5).toFixed(1)}`} className="sdc__leader" style={{ stroke: r.color }} />
              <path d={`M${(x(last) + 5).toFixed(1)},${y(r.values[last]).toFixed(1)} L${(x(last) + 8).toFixed(1)},${(rightY[ri] - 3.5).toFixed(1)}`} className="sdc__leader" style={{ stroke: r.color }} />
              <text x={x(0) - 10} y={leftY[ri]} className="sdc__slabel" textAnchor="end">{r.key}</text>
              <text x={x(last) + 10} y={rightY[ri]} className="sdc__slabel" textAnchor="start">{yFmt(r.values[last])}</text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

// ---- horizontal bars, with an optional second measure --------------------
export function HBars({ rows, fmt, color = "var(--sdc-c1)", max: maxIn, sub }) {
  const max = maxIn ?? Math.max(...rows.map((r) => r.v));
  return (
    <div className="sdc__hbars">
      {rows.map((r) => (
        <div className="sdc__hrow sdc__hrow--wide" key={r.k} tabIndex={0} aria-label={`${r.k}: ${fmt(r.v)}${r.sub ? ", " + r.sub : ""}`}>
          <span className="sdc__hkey">
            {r.k}
            {r.sub && <em>{r.sub}</em>}
          </span>
          <span className="sdc__htrack"><span className="sdc__hfill" style={{ width: `${(r.v / max) * 100}%`, background: r.color || color }} /></span>
          <span className="sdc__hval">{fmt(r.v)}</span>
        </div>
      ))}
      {sub && <p className="sdc__hsub">{sub}</p>}
    </div>
  );
}

// ---- small multiples ------------------------------------------------------
export function SmallMultiples({ panels, min = 240 }) {
  return (
    <div className="sdc__sm" style={{ gridTemplateColumns: `repeat(auto-fit, minmax(${min}px, 1fr))` }}>
      {panels.map((p) => (
        <div className="sdc__sm-cell" key={p.title}>
          <p className="sdc__sm-title">{p.title}</p>
          {p.children}
        </div>
      ))}
    </div>
  );
}

// ---- a card wrapper with a table view ------------------------------------
export function Card({ title, kicker, children, shows, reads, needs, wide, tall, table, legend, footnote }) {
  const [showTable, setShowTable] = useState(false);
  return (
    <section className={"sdc__card" + (wide ? " sdc__card--wide" : "") + (tall ? " sdc__card--tall" : "") + (needs ? " sdc__card--spec" : "")}>
      <header className="sdc__head">
        <p className="sdc__title">{title}</p>
        {kicker && <p className="sdc__kicker">{kicker}</p>}
      </header>
      {needs ? (
        <div className="sdc__empty" aria-hidden="true"><span /><span /><span /></div>
      ) : showTable && table ? (
        <div className="sdc__table-wrap">
          <table className="sdc__table">
            <thead><tr>{table.head.map((h) => <th key={h}>{h}</th>)}</tr></thead>
            <tbody>{table.rows.map((r, i) => <tr key={i}>{r.map((c, j) => <td key={j}>{c}</td>)}</tr>)}</tbody>
          </table>
        </div>
      ) : (
        <>
          {children}
          {legend && <Legend items={legend} />}
        </>
      )}
      <div className="sdc__note">
        <p className="sdc__note-h">{needs ? "Needs" : "What it shows"}</p>
        <p>{shows}</p>
        {needs ? (
          <ul>{needs.map((n) => <li key={n}>{n}</li>)}</ul>
        ) : (
          reads && <p className="sdc__reads"><b>Reads:</b> {reads}</p>
        )}
        {footnote && <p className="sdc__foot">{footnote}</p>}
        {!needs && table && (
          <button type="button" className="sdc__toggle" onClick={() => setShowTable((t) => !t)} aria-pressed={showTable}>
            {showTable ? "Chart" : "Table"}
          </button>
        )}
      </div>
    </section>
  );
}

export function SectionHead({ n, title, blurb }) {
  return (
    <header className="sdc__sect">
      <p className="sdc__sect-n">{n}</p>
      <h4 className="sdc__sect-t">{title}</h4>
      <p className="sdc__sect-b">{blurb}</p>
    </header>
  );
}

export function Kpis({ items, cols }) {
  return (
    <div className="sdc__kpis" style={cols ? { gridTemplateColumns: `repeat(${cols}, 1fr)` } : undefined}>
      {items.map((k) => (
        <div className="sdc__kpi" key={k.label}>
          <span className="sdc__kpi-value">{k.value}</span>
          <span className="sdc__kpi-label">{k.label}</span>
          {k.note && <span className="sdc__kpi-note">{k.note}</span>}
        </div>
      ))}
    </div>
  );
}

export const useMemoRows = useMemo;
