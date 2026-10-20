import { useState } from "react";
import { useChart, niceTicks, clamp, CAT } from "./shared";
import Axis from "./Axis";
import Tooltip from "./Tooltip";
import Legend from "./Legend";
import "./charts.css";

// Bars, grouped or stacked, vertical or horizontal. The chart language is Bencho's
// stacked bars: pill-soft segments (radius 3), a 2px surface gap between stacked
// segments, bars narrower than their slot, a faint baseline and ticks instead of
// a heavy grid, the hovered category lifts while the rest dim, a tooltip beside
// it, and bars growing from the baseline once on scroll.
//
// data    rows, one per category: { [xKey]: label, [series.key]: number, sub?: string }
// series  [{ key, label, color? }]
// xKey    the category field (default "label")

const SEG_GAP = 2;
const RADIUS = 3;

function Core({
  data, series, xKey = "label", mode, horizontal = false, percent = false, colors = CAT,
  height = 220, rowHeight, yFormat = (v) => String(v), valueFormat, max: maxIn, showValues, legend = true,
  ariaLabel, caption, note, labelSeries, perRow = false, maxBar = 30, gap = 0.34, emphasis, className = "", xLabelEvery,
}) {
  const { ref, w: W, on } = useChart();
  const [hi, setHi] = useState(null);
  const fmt0 = valueFormat || yFormat;
  // a value may be a range { lo, hi }: drawn as an open band, never flattened to a midpoint
  const num = (v) => (v && typeof v === "object" ? v.hi : v || 0);
  const fmt = (v, r, key) => (v && typeof v === "object" ? `${fmt0(v.lo, r, key)} to ${fmt0(v.hi, r, key)}` : fmt0(v, r, key));
  const col = (s, i) => s.color || colors[i % colors.length];
  const n = data.length;
  const k = series.length;
  const stacked = mode === "stack";
  const total = (r) => series.reduce((a, s) => a + num(r[s.key]), 0);
  const val = (r, s) => (percent && stacked ? (num(r[s.key]) / (total(r) || 1)) * 100 : num(r[s.key]));
  const rowMax = (r) => Math.max(...series.map((s) => num(r[s.key]))) || 1;
  const dataMax = Math.max(...data.map((r) => (stacked ? total(r) : Math.max(...series.map((s) => num(r[s.key]))))));
  const domMax = perRow ? 100 : maxIn ?? (percent && stacked ? 100 : niceTicks(dataMax).slice(-1)[0]);
  const ticks = niceTicks(domMax, horizontal ? 4 : 3).filter((t) => t <= domMax + 1e-9);
  const wantValues = showValues ?? (horizontal && !stacked);

  // long labels or captions sit above their bar instead of squeezing a left column
  const top = horizontal && data.some((r) => r.sub || r.delta || String(r[xKey]).length > 20);
  const labelW = horizontal ? (top ? 16 : clamp(Math.round(W * 0.3), 80, 150)) : 0;
  const rowH = rowHeight ?? (top ? (k > 1 && !stacked ? 18 * k + 36 : 52) : k > 1 && !stacked ? 18 * k + 16 : 32);
  const P = horizontal ? { l: labelW, r: wantValues ? 56 : 10, t: 6, b: perRow ? 6 : 22 } : { l: 40, r: 8, t: 12, b: 26 };
  const H = horizontal ? P.t + n * rowH + P.b : height;
  const plot = { ...P, W, H };
  const pw = W - P.l - P.r;
  const ph = H - P.t - P.b;
  const vy = (v) => P.t + ph - (v / domMax) * ph;
  const vx = (v) => P.l + (v / domMax) * pw;
  const slot = horizontal ? rowH : pw / n;
  const bw = horizontal ? (top ? Math.min(16, (rowH - 30 - (k - 1) * 3) / (stacked ? 1 : k) ) : Math.min(maxBar, rowH * (1 - gap))) : Math.min(maxBar, slot * (1 - gap));
  const cat = (i) => (horizontal ? P.t : P.l) + slot * i + slot / 2;
  const barC = (i) => (top ? cat(i) + 12 : cat(i)); // centre line the bars sit on

  const bars = [];
  const labels = [];
  data.forEach((r, i) => {
    const c = barC(i);
    if (stacked) {
      let acc = 0;
      series.forEach((s, si) => {
        const v = val(r, s);
        const a = horizontal ? vx(acc) : vy(acc);
        const b = horizontal ? vx(acc + v) : vy(acc + v);
        acc += v;
        if (labelSeries === s.key) labels.push({ i, x: horizontal ? b : c, y: horizontal ? c + 4 : b - 6, t: Math.round(r[s.key]) });
        const len = Math.max(0, Math.abs(b - a) - SEG_GAP);
        if (len <= 0.3) return;
        bars.push(horizontal
          ? { i, x: a, y: c - bw / 2, w: len, h: bw, c: col(s, si) }
          : { i, x: c - bw / 2, y: b, w: bw, h: len, c: col(s, si) });
      });
    } else {
      const sub = (bw - (k - 1) * 3) / k;
      series.forEach((s, si) => {
        const raw = r[s.key];
        const isRange = raw && typeof raw === "object";
        const v = perRow ? (num(raw) / rowMax(r)) * 100 : val(r, s);
        const off = -bw / 2 + si * (sub + 3);
        const dim = emphasis != null && !(typeof emphasis === "function" ? emphasis(r, i) : emphasis === i);
        const colr = k === 1 && r.color ? r.color : col(s, si);
        if (isRange && !horizontal) {
          bars.push({ i, si, x: c + off, y: vy(raw.hi), w: sub, h: Math.max(2, vy(raw.lo) - vy(raw.hi)), c: colr, range: true, dim });
          return;
        }
        bars.push(horizontal
          ? { i, si, x: P.l, y: c + off, w: Math.max(2, vx(v) - P.l), h: sub, c: colr, v, dim }
          : { i, si, x: c + off, y: vy(v), w: sub, h: Math.max(2, vy(0) - vy(v)), c: colr, v, dim });
      });
    }
  });

  const every = xLabelEvery || Math.max(1, Math.ceil(n / Math.max(1, Math.floor(pw / 46))));
  const xt = !horizontal ? data.map((r, i) => ({ pos: cat(i), label: r[xKey], i })).filter((t) => t.i % every === 0) : [];
  const yt = ticks.map((t) => ({ pos: horizontal ? vx(t) : vy(t), label: yFormat(t) }));

  const lab = ariaLabel || `${series.map((s) => s.label).filter(Boolean).join(", ") || "Values"} by ${xKey}`;
  const tipRows = (r) => series.map((s, si) => ({ label: s.label, color: col(s, si), value: fmt(percent && stacked ? val(r, s) : r[s.key] || 0, r, s.key) }));
  const tipX = hi == null ? 0 : horizontal ? clamp(P.l + pw * 0.45, 90, W - 90) : clamp(cat(hi), 90, W - 90);
  const tipY = hi == null ? 0 : horizontal ? cat(hi) : P.t;

  return (
    <figure className={"ch " + className} data-in={on}>
      <div className="ch__plot" ref={ref}>
        <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} role="img" aria-label={lab} className="ch__svg">
          <title>{lab}</title>
          {horizontal ? (!perRow && <Axis side="x" ticks={yt.filter((_, i) => i % (yt.length > 5 ? 2 : 1) === 0)} plot={plot} />) : <Axis side="left" ticks={yt} plot={plot} />}
          {!horizontal && <Axis side="bottom" ticks={xt} plot={plot} />}
          {horizontal && data.map((r, i) => (
            <text key={i} x={top ? P.l : P.l - 12} y={top ? cat(i) - 15 : cat(i) + 4} textAnchor={top ? "start" : "end"} className="ch-cat">
              {r[xKey]}
              {r.sub && <tspan dx="8" className="ch-sub">{r.sub}</tspan>}
              {top && r.delta && <tspan x={W - 4} textAnchor="end" className="ch-sub">{r.delta}</tspan>}
            </text>
          ))}
          {bars.map((b, j) => (
            <rect key={j} x={b.x} y={b.y} width={b.w} height={b.h}
              rx={Math.min(RADIUS, b.w / 2, b.h / 2)} fill={b.c} fillOpacity={b.range ? 0.35 : undefined} stroke={b.range ? b.c : undefined} strokeWidth={b.range ? 1.5 : undefined}
              className={"ch-seg ch-seg--" + (horizontal ? "h" : "v") + (hi != null && hi !== b.i ? " is-off" : "") + (b.dim ? " is-dim" : "")}
              style={{ "--i": b.i }} />
          ))}
          {labels.map((l, j) => (
            <text key={"l" + j} x={l.x} y={l.y} textAnchor="middle" className="ch-val" style={{ "--i": l.i }}>{l.t}</text>
          ))}
          {wantValues && bars.map((b, j) => (b.v == null ? null : (
            <text key={"v" + j} x={horizontal ? b.x + b.w + 7 : b.x + b.w / 2} y={horizontal ? b.y + b.h / 2 + 3.5 : b.y - 6}
              textAnchor={horizontal ? "start" : "middle"} className="ch-val" style={{ "--i": b.i }}>{fmt(perRow ? data[b.i][series[b.si].key] : b.v, data[b.i], series[b.si].key)}</text>
          )))}
          {data.map((r, i) => (
            <rect key={"h" + i}
              x={horizontal ? 0 : cat(i) - slot / 2} y={horizontal ? cat(i) - slot / 2 : P.t}
              width={horizontal ? W : slot} height={horizontal ? slot : ph}
              fill="transparent" tabIndex={0}
              aria-label={`${r.span || r[xKey]}: ${series.map((s) => `${s.label} ${fmt(r[s.key] || 0, r, s.key)}`).join(", ")}`}
              onPointerEnter={() => setHi(i)} onPointerLeave={() => setHi(null)} onFocus={() => setHi(i)} onBlur={() => setHi(null)} />
          ))}
        </svg>
        {hi != null && <Tooltip x={tipX} y={tipY} below={horizontal} title={data[hi].span || data[hi][xKey]} rows={tipRows(data[hi])} />}
      </div>
      {note && <p className="ch-note">{note}</p>}
      {legend && k > 1 && <Legend items={series.map((s, si) => ({ label: s.label, color: col(s, si) }))} />}
      <table className="ch-sr">
        <caption>{caption || lab}</caption>
        <thead><tr><th>{xKey}</th>{series.map((s) => <th key={s.key}>{s.label}</th>)}</tr></thead>
        <tbody>{data.map((r, i) => <tr key={i}><th>{r[xKey]}</th>{series.map((s) => <td key={s.key}>{fmt(r[s.key] || 0, r, s.key)}</td>)}</tr>)}</tbody>
      </table>
    </figure>
  );
}

// StackedBars: segments stacked per category. `percent` normalises each row to 100.
export function StackedBars(props) { return <Core {...props} mode="stack" />; }

// Bars: one series (valueKey) or several grouped side by side (series).
// variant="block": big-number rows, each a filled block whose width is normalised (38% + value x 0.62,
// so the order of the lengths is the order of the values, not their ratio); data rows { label, [valueKey] }
function BlockBars({ data, valueKey, valueFormat = (v) => v + "%", ariaLabel, className = "" }) {
  const { ref, on } = useChart();
  return (
    <figure className={"ch ch-blocks " + className} data-in={on} ref={ref} role="img" aria-label={ariaLabel || data.map((r) => `${valueFormat(r[valueKey])} ${r.label}`).join("; ")}>
      {data.map((r, i) => (
        <div className="ch-block" key={r.label} style={{ "--w": `${(38 + r[valueKey] * 0.62).toFixed(1)}%`, "--i": i }} aria-hidden="true">
          <span className="ch-block__num">{valueFormat(r[valueKey])}</span>
          <span className="ch-block__desc">{r.label}</span>
        </div>
      ))}
    </figure>
  );
}

export function Bars({ valueKey = "value", label = "", series, color, variant, ...rest }) {
  if (variant === "block") return <BlockBars valueKey={valueKey} {...rest} />;
  return <Core {...rest} series={series || [{ key: valueKey, label, color }]} mode="group" />;
}
