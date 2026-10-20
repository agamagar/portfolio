// Legend: a quiet wrapping row of swatch + label. `swatch` "box" (bars) or "line".
export default function Legend({ items, swatch = "box", className = "" }) {
  return (
    <ul className={"ch-legend " + className}>
      {items.map((it) => (
        <li key={it.label}>
          <span className={"ch-sw ch-sw--" + (it.swatch || swatch)} style={{ "--sw": it.color }} aria-hidden="true" />
          {it.label}
        </li>
      ))}
    </ul>
  );
}
