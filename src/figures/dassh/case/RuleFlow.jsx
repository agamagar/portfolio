// RuleFlow: how a rule travels, from a line said aloud to a checked commit. Four numbered nodes on one track.
//   spec { steps: [{ k, t, ex? }], caption? }   k the step, t what happens, ex the real example in mono
import { CaseFigure } from "./CaseFigure";
import "./ruleFlow.css";

export function RuleFlow({ spec }) {
  return (
    <CaseFigure type="flow" caption={spec.caption}>
      <ol className="dspec-flow">
        {spec.steps.map((s, i) => (
          <li className="dspec-flow__step" key={s.k}>
            <span className="dspec-flow__n" aria-hidden="true">{i + 1}</span>
            <span className="dspec-flow__k">{s.k}</span>
            <span className="dspec-flow__t">{s.t}</span>
            {s.ex && <code className="dspec-flow__ex">{s.ex}</code>}
          </li>
        ))}
      </ol>
    </CaseFigure>
  );
}
