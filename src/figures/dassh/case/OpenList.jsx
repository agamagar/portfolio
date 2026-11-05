// OpenList: what the system still gets wrong, each issue beside the one place it gets fixed.
//   spec { items: [{ home, t }], caption? }
import { CaseFigure } from "./CaseFigure";
import "./openList.css";

export function OpenList({ spec }) {
  return (
    <CaseFigure type="open" caption={spec.caption}>
      <ul className="dspec-open">
        {spec.items.map((it) => (
          <li key={it.t}>
            <span className="dspec-open__home">{it.home}</span>
            <span className="dspec-open__t">{it.t}</span>
          </li>
        ))}
      </ul>
    </CaseFigure>
  );
}
