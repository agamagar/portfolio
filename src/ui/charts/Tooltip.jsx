// Tooltip: the glass readout that glides beside the hovered category.
// Positioned in the chart's own pixel space (the parent is position:relative).
export default function Tooltip({ x, y = 0, title, rows, below = false }) {
  return (
    <div className={"ch-tip" + (below ? " is-below" : "")} style={{ left: x, top: y }} role="presentation">
      {title != null && <strong>{title}</strong>}
      {rows.map((r) => (
        <span key={r.label}>
          <i className={"ch-sw ch-sw--" + (r.swatch || "box")} style={{ "--sw": r.color }} />
          {r.label}
          <b>{r.value}</b>
        </span>
      ))}
    </div>
  );
}
