import { ICheck } from "./icons";

// The states-rail beside the phone: names every design state of a screen and
// lights the current one (active = tone-coloured), marking earlier ones done.
// `steps`: [{ t, s, tone }]. `active`: index of the live beat. `done`: Set of
// indices already resolved.
export function Rail({ cap, steps, active, done }) {
  return (
    <div className="sd-rail">
      {cap && <div className="sd-rail__cap">{cap}</div>}
      {steps.map((s, i) => (
        <div
          className="sd-step"
          key={s.t}
          data-on={i <= active || done.has(i)}
          data-active={i === active}
          data-done={done.has(i)}
          data-tone={s.tone || "purple"}
        >
          <span className="sd-step__dot"><ICheck /></span>
          <span className="sd-step__txt">
            <span className="sd-step__t">{s.t}</span>
            <span className="sd-step__s">{s.s}</span>
          </span>
        </div>
      ))}
    </div>
  );
}
