// System-Explainer kit (base-layer §12c). The data-viz vocabulary every reasoning
// figure assembles from, so archetypes are composed, not hand-rolled. Each piece
// reads off the same `step` clock (see useStepSequence in hooks.js) and is
// reduced-motion-safe. Themed by the surrounding .ds-root; see systemExplainer.css.
//
// Pieces, mapped to the §12b archetypes:
//   Mark        — inline in-flow highlight (extract: the source phrase)
//   Connector   — the streaming flow line between panels (extract / fan-out)
//   Panel       — a titled box ("What the user asked" / "…understood")
//   FactRow     — a key/value row that reveals on its step (extract: the lifted fact)
//   Track/Step  — a timeline/stepper (sequence)
//   Bar         — a weighted bar that grows to a value (score / accumulate)
//   ScoreMeter  — labelled Bar + numeric readout (score / rank)
import "./systemExplainer.css";

// --- extract archetype -------------------------------------------------------

// Inline highlight that flows with the running paragraph and wraps across lines
// (box-decoration-break clones the box onto each line fragment) — never an
// inline-block unit that can't break and rags the paragraph. `on` ties to a step.
export function Mark({ on, children }) {
  return <span className={`se-mark${on ? " is-on" : ""}`}>{children}</span>;
}

// A titled container. `tone="raw"` for the messy input side, `tone="built"` for
// the structured side — purely a heading-colour cue; both stay fully legible.
export function Panel({ title, tone = "built", width, grow, children, style }) {
  return (
    <div
      className={`se-panel se-panel--${tone}`}
      style={{ width, flex: grow ? "1 1 0" : width ? "0 0 auto" : undefined, minWidth: 0, ...style }}
    >
      {title && <p className="se-panel__head">{title}</p>}
      {children}
    </div>
  );
}

// One lifted fact on the structured side. Reveals (fade + 4px rise) once `shown`.
// Named FactRow, not Field. `Field` is already a DIFFERENT component in Primitives.jsx
// (a label wrapping a form control), and both live in ds/, so an import from the design
// system could reasonably have picked up either one and rendered something plausible.
export function FactRow({ k, v, shown }) {
  return (
    <div className={`se-field${shown ? " is-shown" : ""}`}>
      <span className="se-field__k">{k}</span>
      <span className="se-field__v">{v}</span>
    </div>
  );
}

// The flow line bridging two panels. `vertical` for stacked layouts. Always
// flush in the gap — do not wrap both panels in one box, so it reads as flow.
export function Connector({ vertical = false, length = 64 }) {
  return (
    <span
      className={`se-connector${vertical ? " se-connector--v" : ""}`}
      style={vertical ? { height: length } : { width: length }}
    />
  );
}

// --- sequence archetype ------------------------------------------------------

// A vertical timeline/stepper. `steps` = [{ label, sub }]; `step` is the clock.
// A step is "done" once passed, "active" on its own beat, dim before. The active
// node pulses; the rail fills to the active node.
export function Track({ steps, step }) {
  return (
    <ol
      className="se-track"
      // A unitless 0..1 fraction, because the fill is a scaleY now rather than a height:
      // a transform is composited, an animated height forces layout every frame.
      style={{ "--se-fill-n": Math.max(0, Math.min(step, steps.length)) / steps.length }}
    >
      {steps.map((s, i) => {
        const state = step > i + 1 ? "done" : step === i + 1 ? "active" : "todo";
        return (
          <li key={i} className={`se-step is-${state}`}>
            <span className="se-step__node" />
            <span className="se-step__body">
              <span className="se-step__label">{s.label}</span>
              {s.sub && <span className="se-step__sub">{s.sub}</span>}
            </span>
          </li>
        );
      })}
    </ol>
  );
}

// --- score / accumulate archetype --------------------------------------------

// A weighted bar that grows to `value` (0..1) once `shown`. `tone` picks the
// fill colour: accent (default) | good | warn | bad.
export function Bar({ value, shown, tone = "accent" }) {
  return (
    <span className={`se-bar se-bar--${tone}`}>
      <span className="se-bar__fill" style={{ transform: `scaleX(${shown ? value : 0})` }} />
    </span>
  );
}

// A labelled score row: criterion label, a Bar, and a numeric readout that
// appears with the bar. `value` is 0..1; `display` overrides the readout text.
export function ScoreMeter({ label, value, shown, tone, display }) {
  return (
    <div className={`se-meter${shown ? " is-shown" : ""}`}>
      <span className="se-meter__label">{label}</span>
      <Bar value={value} shown={shown} tone={tone} />
      <span className="se-meter__val">{display ?? Math.round(value * 100)}</span>
    </div>
  );
}
