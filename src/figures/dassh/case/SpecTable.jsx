// SpecTable: a token or value table. Hairline rows, no boxes, and stacked label by label on a phone.
//   spec { k?, cols: [..], rows: [[..]], mono?: [i], caption? }   the first cell of a row is its header, mono names the mono columns
import { CaseFigure } from "./CaseFigure";
import "./specTable.css";

export function SpecTable({ spec }) {
  const mono = new Set(spec.mono || []);
  return (
    <CaseFigure type="table" caption={spec.caption}>
      <div className="dspec-table">
        <table>
          {spec.k && <caption>{spec.k}</caption>}
          <thead>
            <tr>{spec.cols.map((c) => <th scope="col" key={c}>{c}</th>)}</tr>
          </thead>
          <tbody>
            {spec.rows.map((r) => (
              <tr key={r[0]}>
                {r.map((cell, j) => (j === 0
                  ? <th scope="row" key={j}>{cell}</th>
                  : <td key={j} data-k={spec.cols[j]} className={mono.has(j) ? "is-mono" : undefined}>{cell}</td>))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </CaseFigure>
  );
}
