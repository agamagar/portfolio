// FaceMatrix: one component, three faces. Read across a row for one component, down a column for one person's whole app.
//   spec { cols: [..], rows: [{ k, cells: [string | { t, off }] }], caption? }   off marks a cell the face doesn't get
import { CaseFigure } from "./CaseFigure";
import "./specTable.css";

export function FaceMatrix({ spec }) {
  return (
    <CaseFigure type="faces" caption={spec.caption}>
      <div className="dspec-table dspec-table--faces">
        <table>
          <thead>
            <tr>
              <th scope="col"><span className="sr-only">Component</span></th>
              {spec.cols.map((c) => <th scope="col" key={c}>{c}</th>)}
            </tr>
          </thead>
          <tbody>
            {spec.rows.map((r) => (
              <tr key={r.k}>
                <th scope="row">{r.k}</th>
                {r.cells.map((c, j) => {
                  const off = typeof c === "object" && c.off;
                  return <td key={j} data-k={spec.cols[j]} className={off ? "is-off" : undefined}>{typeof c === "object" ? c.t : c}</td>;
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </CaseFigure>
  );
}
