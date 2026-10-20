import { useState } from "react";
import Legend from "./Legend";

// Dashboard furniture for chart grids: Card (with a table view), SectionHead, Kpis, SmallMultiples (styles: .sdc__* in index.css)
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

