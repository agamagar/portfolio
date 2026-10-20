import { useState } from "react";
import { spread, fmtPct0 } from "./shared";

// Slope chart: ranking and direction across a few checkpoints, direct-labelled both ends (styles: .sdc__slope in index.css)
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

