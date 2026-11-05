// ScaleStats: the scale of the work in four numbers, on one hairline.
//   spec { items: [{ v, k, pre? }], caption? }   v the number, k what it counts, pre a word that hangs above the number
import { CaseFigure } from "./CaseFigure";
import "./scaleStats.css";

export function ScaleStats({ spec }) {
  return (
    <CaseFigure type="stats" caption={spec.caption}>
      <dl className="dspec-stats">
        {spec.items.map((it) => (
          <div className="dspec-stats__item" key={it.k}>
            <dt className="dspec-stats__k">{it.k}</dt>
            <dd className="dspec-stats__v">
              {it.pre && <span className="dspec-stats__pre">{it.pre}</span>}
              {it.v}
            </dd>
          </div>
        ))}
      </dl>
    </CaseFigure>
  );
}
