// BoxCount: one reply drawn twice at true size, before and after the first rule. Each box is pinned, and the pins match the
// key under the panel, so the count reads off the drawing.
//   spec { line, date, kind, status, note, before, after, caption? }
//     before / after: { k, count, keys: [..] }
import { CaseFigure } from "./CaseFigure";
import "./boxCount.css";

const Pin = ({ n }) => <span className="dspec-pin" aria-hidden="true">{n}</span>;
const Bar = ({ w }) => <span className="dspec-box__bar" style={{ width: w }} aria-hidden="true" />;

function Reply({ spec, after }) {
  const side = after ? spec.after : spec.before;
  return (
    <div className={"dspec-box__panel" + (after ? " is-after" : "")}>
      <p className="dspec-box__head">
        <span>{side.k}</span>
        <span className="dspec-box__count">{side.count}</span>
      </p>
      <div className="dspec-box__reply" aria-hidden="true">
        <p className="dspec-box__line">
          {spec.line}{" "}
          {after ? <b>{spec.date}</b> : <span className="dspec-box__chip">{spec.date}<Pin n={1} /></span>}
        </p>
        <div className={"dspec-box__card" + (after ? " is-after" : "")}>
          <Pin n={after ? 1 : 2} />
          <span className="dspec-box__cardhead">
            <span className="dspec-box__kind">{spec.kind}</span>
            {after
              ? <span className="dspec-box__dot">{spec.status}</span>
              : <span className="dspec-box__chip dspec-box__chip--status">{spec.status}<Pin n={3} /></span>}
          </span>
          <Bar w="64%" />
          <Bar w="42%" />
        </div>
        {after
          ? <p className="dspec-box__note"><span className="dspec-box__spark" />{spec.note}</p>
          : <p className="dspec-box__note"><span className="dspec-box__pill">{spec.note}<Pin n={4} /></span></p>}
      </div>
      <ol className="dspec-box__keys">
        {side.keys.map((k, i) => (
          <li key={k}>
            {after && i > 0 ? <span className="dspec-box__keyn dspec-box__keyn--off" aria-hidden="true" /> : <span className="dspec-box__keyn" aria-hidden="true">{i + 1}</span>}
            {k}
          </li>
        ))}
      </ol>
    </div>
  );
}

export function BoxCount({ spec }) {
  return (
    <CaseFigure type="boxes" caption={spec.caption}>
      <div className="dspec-box">
        <Reply spec={spec} />
        <Reply spec={spec} after />
      </div>
    </CaseFigure>
  );
}
