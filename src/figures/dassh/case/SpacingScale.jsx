// SpacingScale: spacing and sizes drawn at true size, each beside its token and its use.
//   spec { k?, rows: [{ v, token, use }], caption? }
import { CaseFigure } from "./CaseFigure";
import "./spacingScale.css";

export function SpacingScale({ spec }) {
  return (
    <CaseFigure type="scale" caption={spec.caption}>
      <div className="dspec-scale">
        {spec.k && <p className="dspec-scale__k">{spec.k}</p>}
        <ul>
          {spec.rows.map((r) => (
            <li key={r.v + r.use}>
              <span className="dspec-scale__bar" style={{ width: r.v }} aria-hidden="true" />
              <span className="dspec-scale__v">{r.v}</span>
              <span className="dspec-scale__use">{r.use}{r.token && <code>{r.token}</code>}</span>
            </li>
          ))}
        </ul>
      </div>
    </CaseFigure>
  );
}
