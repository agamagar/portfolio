import { IconCheck } from "./Primitives";

// The states-rail beside a phone: names every design state of a screen, lights the
// current one, and marks earlier ones done.
//
// This existed TWICE, as scheduled/Rail.jsx and awayAgent/Rail.jsx. After normalising
// the class prefix the two files differed in exactly one substantive line (the default
// tone), and each family shipped its own byte-identical check glyph. Ten figures import
// one or the other, so a change to the rail's STRUCTURE (say, making `done` legible
// without relying on hue) had to be made in two places and would reliably be made in one.
//
// What is shared is the structure. What is NOT shared is the skin: these are two case
// studies with deliberately different visual languages (Scheduled runs light on purple,
// Away runs dark on indigo, with different radii, resting opacities and tone sets). So
// this emits the CALLER'S class prefix rather than pulling both onto one appearance.
// A prefix prop is not something a design system should normally take; it is right here
// because the duplication was structural and the divergence is intentional.
export function StepRail({ prefix, cap, steps, active, done, defaultTone }) {
  return (
    <div className={`${prefix}-rail`}>
      {cap && <div className={`${prefix}-rail__cap`}>{cap}</div>}
      {steps.map((s, i) => (
        <div
          className={`${prefix}-step`}
          key={s.t}
          data-on={i <= active || done.has(i)}
          data-active={i === active}
          data-done={done.has(i)}
          data-tone={s.tone || defaultTone}
        >
          <span className={`${prefix}-step__dot`}><IconCheck /></span>
          <span className={`${prefix}-step__txt`}>
            <span className={`${prefix}-step__t`}>{s.t}</span>
            <span className={`${prefix}-step__s`}>{s.s}</span>
          </span>
        </div>
      ))}
    </div>
  );
}
