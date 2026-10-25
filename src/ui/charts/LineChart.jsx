import { useState } from "react";
import { useChart, niceTicks, clamp, spread, CAT, useChartName, nameChart, describeSeries } from "./shared";
import Axis from "./Axis";
import Tooltip from "./Tooltip";
import Legend from "./Legend";
import "./charts.css";

// Line / Area. One y-scale, up to four series, each direct-labelled at its last
// real point (identity never rests on colour alone). Nulls break the line. The
// line draws on once when scrolled into view; `area` adds a soft fade beneath.
// annotations: [{ i, label, anchor: "start" | "middle" | "end", below }] mark points on the first series with a dot
// and a short label, for milestones that belong to the line but not on its scale (no second axis).
export default function LineChart({
  data, series, xKey = "label", colors = CAT, height = 220, yFormat = (v) => String(v),
  domainMin = 0, domainMax, area = false, legend, ariaLabel, caption, className = "", xLabelEvery, annotations = [],
}) {
  const { ref, w: W, on } = useChart();
  const [hi, setHi] = useState(null);
  const n = data.length;
  const col = (s, i) => s.color || colors[i % colors.length];
  const multi = series.length > 1;
  const P = { l: 40, r: multi || series[0].short ? 74 : 26, t: 14, b: 26 };
  const H = height;
  const plot = { ...P, W, H };
  const all = series.flatMap((s) => data.map((r) => r[s.key])).filter((v) => v != null);
  const hiV = domainMax ?? niceTicks(Math.max(...all) * 1.04).slice(-1)[0];
  const loV = domainMin ?? Math.min(...all);
  const x = (i) => P.l + (i / Math.max(1, n - 1)) * (W - P.l - P.r);
  const y = (v) => P.t + (1 - (v - loV) / Math.max(1e-9, hiV - loV)) * (H - P.t - P.b);
  const ticks = niceTicks(hiV - loV, 3).map((t) => t + loV).filter((t) => t <= hiV + 1e-9);
  const every = xLabelEvery || Math.max(1, Math.ceil(n / Math.max(1, Math.floor((W - P.l - P.r) / 52))));
  const xt = data.map((r, i) => ({ pos: x(i), label: r[xKey], i })).filter((t) => t.i % every === 0 || t.i === n - 1 && n - 1 - (Math.floor((n - 1) / every) * every) >= every * 0.6);

  const segs = (s) => {
    const out = []; let cur = [];
    data.forEach((r, i) => { if (r[s.key] == null) { if (cur.length) out.push(cur); cur = []; } else cur.push([x(i), y(r[s.key])]); });
    if (cur.length) out.push(cur);
    return out;
  };
  const d = (pts) => pts.map((p, i) => (i ? "L" : "M") + p[0].toFixed(1) + " " + p[1].toFixed(1)).join(" ");
  const lastOf = (s) => { for (let i = n - 1; i >= 0; i--) if (data[i][s.key] != null) return i; return -1; };
  const labelY = spread(series.map((s) => { const i = lastOf(s); return i < 0 ? 0 : y(data[i][s.key]); }), 13, P.t + 4, H - P.b);

  const onMove = (e) => {
    const r = e.currentTarget.getBoundingClientRect();
    const px = e.clientX - r.left;
    setHi(clamp(Math.round(((px - P.l) / (W - P.l - P.r)) * (n - 1)), 0, n - 1));
  };
  const onKey = (e) => {
    if (e.key === "ArrowRight") { e.preventDefault(); setHi((h) => clamp((h ?? -1) + 1, 0, n - 1)); }
    if (e.key === "ArrowLeft") { e.preventDefault(); setHi((h) => clamp((h ?? n) - 1, 0, n - 1)); }
    if (e.key === "Escape") setHi(null);
  };
  const host = useChartName();
  const lab = ariaLabel || nameChart(host, series.map((s) => describeSeries(data, s.key, xKey, yFormat, s.label)).filter(Boolean).join("; ")); // 28.3
  const showLegend = legend ?? multi;

  return (
    <figure className={"ch " + className} data-in={on}>
      <div className="ch__plot" ref={ref}>
        <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} role="img" aria-label={lab} className="ch__svg" tabIndex={0}
          onPointerMove={onMove} onPointerLeave={() => setHi(null)} onKeyDown={onKey} onBlur={() => setHi(null)}>
          <title>{lab}</title>
          <defs>
            {series.map((s, si) => (
              <linearGradient key={s.key} id={`ch-a-${s.key}-${si}`} x1="0" x2="0" y1="0" y2="1">
                <stop offset="0" stopColor={col(s, si)} stopOpacity="0.32" />
                <stop offset="1" stopColor={col(s, si)} stopOpacity="0" />
              </linearGradient>
            ))}
          </defs>
          <Axis side="left" ticks={ticks.map((t) => ({ pos: y(t), label: yFormat(t) }))} plot={plot} />
          <Axis side="bottom" ticks={xt} plot={plot} />
          {series.map((s, si) => segs(s).map((pts, j) => (
            <g key={s.key + j}>
              {area && pts.length > 1 && (
                <path className="ch-area" d={`${d(pts)} L${pts[pts.length - 1][0]} ${y(loV)} L${pts[0][0]} ${y(loV)} Z`} fill={`url(#ch-a-${s.key}-${si})`} />
              )}
              <path className="ch-line" d={d(pts)} pathLength="1" stroke={col(s, si)} />
              {pts.length === 1 && <circle cx={pts[0][0]} cy={pts[0][1]} r={3} fill={col(s, si)} />}
            </g>
          )))}
          {(multi || series[0].short) && series.map((s, si) => lastOf(s) < 0 ? null : (
            <text key={s.key} x={x(lastOf(s)) + 9} y={labelY[si] + 3.5} className="ch-end" fill={col(s, si)}>{s.short || s.label}</text>
          ))}
          {annotations.map((a, k) => {
            const v = data[a.i]?.[series[0].key];
            if (v == null) return null;
            const ax = x(a.i), ay = y(v), anchor = a.anchor || "middle";
            return (
              <g key={k} className="ch-ann">
                <circle cx={ax} cy={ay} r={3.5} className="ch-dot" fill={col(series[0], 0)} />
                <text x={ax + (anchor === "start" ? 6 : anchor === "end" ? -6 : 0)} y={a.below ? ay + 17 : ay - 10} textAnchor={anchor} className="ch-ann__t">{a.label}</text>
              </g>
            );
          })}
          {hi != null && <line x1={x(hi)} x2={x(hi)} y1={P.t} y2={H - P.b} className="ch-cross" />}
          {hi != null && series.map((s, si) => data[hi][s.key] == null ? null : (
            <circle key={s.key} cx={x(hi)} cy={y(data[hi][s.key])} r={4.5} className="ch-dot" fill={col(s, si)} />
          ))}
        </svg>
        {hi != null && (
          <Tooltip x={clamp(x(hi), 90, W - 90)} y={P.t} title={data[hi][xKey]}
            rows={series.map((s, si) => ({ label: s.label, color: col(s, si), swatch: "line", value: data[hi][s.key] == null ? "no data" : yFormat(data[hi][s.key]) }))} />
        )}
      </div>
      {showLegend && <Legend swatch="line" items={series.map((s, si) => ({ label: s.label, color: col(s, si) }))} />}
      <table className="ch-sr">
        <caption>{caption || lab}</caption>
        <thead><tr><th>{xKey}</th>{series.map((s) => <th key={s.key}>{s.label}</th>)}</tr></thead>
        <tbody>{data.map((r, i) => <tr key={i}><th>{r[xKey]}</th>{series.map((s) => <td key={s.key}>{r[s.key] == null ? "no data" : yFormat(r[s.key])}</td>)}</tr>)}</tbody>
      </table>
    </figure>
  );
}
