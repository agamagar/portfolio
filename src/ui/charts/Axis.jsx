// Axis: SVG group for one axis. side "left" (value labels + faint grid across the
// plot) or "bottom" (category labels). `ticks` = [{ pos, label }] in pixels.
export default function Axis({ side, ticks, plot, grid = true, anchor }) {
  const { l, r, t, b, W, H } = plot;
  if (side === "left") {
    return (
      <g className="ch-axis">
        {ticks.map((k, i) => (
          <g key={i}>
            {grid && <line x1={l} x2={W - r} y1={k.pos} y2={k.pos} className={"ch-grid" + (i === 0 ? " is-base" : "")} />}
            <text x={l - 8} y={k.pos + 3.5} textAnchor="end" className="ch-tick">{k.label}</text>
          </g>
        ))}
      </g>
    );
  }
  if (side === "x") {
    return (
      <g className="ch-axis">
        {ticks.map((k, i) => (
          <g key={i}>
            {grid && <line y1={t} y2={H - b} x1={k.pos} x2={k.pos} className={"ch-grid" + (i === 0 ? " is-base" : "")} />}
            <text x={k.pos} y={H - b + 15} textAnchor={anchor || "middle"} className="ch-tick">{k.label}</text>
          </g>
        ))}
      </g>
    );
  }
  return (
    <g className="ch-axis">
      {ticks.map((k, i) => (
        <text key={i} x={k.pos} y={H - 7} textAnchor={k.anchor || "middle"} className="ch-tick">{k.label}</text>
      ))}
    </g>
  );
}
