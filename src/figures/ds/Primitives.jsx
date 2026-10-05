// Dassh figure design-system primitives. Reusable, presentational building
// blocks styled to the Figma spec (uPhIrXFWQ1EXgQBSvPiuxQ). Figures compose these
// and own their own animation via the harness in hooks.js + Cursor.jsx.
import { useRef, useState } from "react";
import "./ds.css";

/* ── icons (compact line set) ──────────────────────────────────────────────*/
const ic = { fill: "none", stroke: "currentColor", strokeWidth: 2, strokeLinecap: "round", strokeLinejoin: "round" };
export const IconChevron = ({ className }) => (<svg className={className} viewBox="0 0 24 24" {...ic} aria-hidden><path d="M6 9l6 6 6-6" /></svg>);
export const IconCaret = () => (<svg viewBox="0 0 24 24" {...ic} aria-hidden><path d="M6 9l6 6 6-6" /></svg>);
export const IconEye = () => (<svg viewBox="0 0 24 24" {...ic} aria-hidden><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z" /><circle cx="12" cy="12" r="3" /></svg>);
export const IconPlus = () => (<svg viewBox="0 0 24 24" {...ic} aria-hidden><path d="M12 5v14M5 12h14" /></svg>);
export const IconMagic = () => (<svg viewBox="0 0 24 24" {...ic} aria-hidden><path d="M15 4V2M15 10V8M12.5 6.5h-2M19.5 6.5h-2M5 19l9-9 1.5 1.5-9 9z" /></svg>);
export const IconArrowR = () => (<svg viewBox="0 0 24 24" {...ic} aria-hidden><path d="M5 12h14M13 6l6 6-6 6" /></svg>);
export const IconDatabase = () => (<svg viewBox="0 0 24 24" {...ic} aria-hidden><ellipse cx="12" cy="5" rx="8" ry="3" /><path d="M4 5v14c0 1.7 3.6 3 8 3s8-1.3 8-3V5M4 12c0 1.7 3.6 3 8 3s8-1.3 8-3" /></svg>);
export const IconExpand = () => (<svg viewBox="0 0 24 24" {...ic} aria-hidden><path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7" /></svg>);
export const IconUpload = () => (<svg viewBox="0 0 24 24" {...ic} aria-hidden><path d="M12 16V4M8 8l4-4 4 4M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2" /></svg>);
export const IconLink = () => (<svg viewBox="0 0 24 24" {...ic} aria-hidden><path d="M10 13a5 5 0 007 0l2-2a5 5 0 00-7-7l-1 1M14 11a5 5 0 00-7 0l-2 2a5 5 0 007 7l1-1" /></svg>);
export const IconPhone = () => (<svg viewBox="0 0 24 24" {...ic} aria-hidden><path d="M22 16.9v3a2 2 0 01-2.2 2 19.8 19.8 0 01-8.6-3 19.5 19.5 0 01-6-6 19.8 19.8 0 01-3-8.6A2 2 0 014.1 2h3a2 2 0 012 1.7c.1.9.3 1.8.6 2.6a2 2 0 01-.5 2.1L8 9.6a16 16 0 006 6l1.2-1.2a2 2 0 012.1-.5c.8.3 1.7.5 2.6.6a2 2 0 011.7 2z" /></svg>);
export const IconCheck = () => (<svg viewBox="0 0 24 24" {...ic} aria-hidden><path d="M20 6L9 17l-5-5" /></svg>);
export const IconCal = () => (<svg viewBox="0 0 24 24" {...ic} aria-hidden><rect x="3" y="5" width="18" height="16" rx="2.5" /><path d="M3 9h18M8 3v4M16 3v4" /></svg>);
export const IconClock = () => (<svg viewBox="0 0 24 24" {...ic} aria-hidden><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></svg>);
export const IconAlert = () => (<svg viewBox="0 0 24 24" {...ic} aria-hidden><path d="M10.3 3.5L1.8 18a2 2 0 001.7 3h17a2 2 0 001.7-3L14.7 3.5a2 2 0 00-3.4 0z" /><path d="M12 9v4M12 17h.01" /></svg>);
export const IconPin = () => (<svg viewBox="0 0 24 24" {...ic} aria-hidden><path d="M12 22s7-6.3 7-12a7 7 0 10-14 0c0 5.7 7 12 7 12z" /><circle cx="12" cy="10" r="2.6" /></svg>);
export const IconUser = () => (<svg viewBox="0 0 24 24" {...ic} aria-hidden><circle cx="12" cy="8" r="4" /><path d="M4 21a8 8 0 0116 0" /></svg>);
export const IconCheckUser = () => (<svg viewBox="0 0 24 24" {...ic} aria-hidden><circle cx="9" cy="8" r="3.2" /><path d="M4 20a5 5 0 0110 0M15 12l2 2 4-4" /></svg>);
export const IconChat = () => (<svg viewBox="0 0 24 24" {...ic} aria-hidden><path d="M21 11.5a8 8 0 01-11.6 7.1L3 21l2.4-6.4A8 8 0 1121 11.5z" /></svg>);
export const IconGlobe = () => (<svg viewBox="0 0 24 24" {...ic} aria-hidden><circle cx="12" cy="12" r="9" /><path d="M3 12h18M12 3a14 14 0 010 18 14 14 0 010-18z" /></svg>);
export const IconShield = () => (<svg viewBox="0 0 24 24" {...ic} aria-hidden><path d="M12 3l8 3v6c0 4.5-3.2 7.8-8 9-4.8-1.2-8-4.5-8-9V6l8-3z" /></svg>);
export const IconHelp = () => (<svg viewBox="0 0 24 24" {...ic} aria-hidden><circle cx="12" cy="12" r="9" /><path d="M9.5 9.5a2.5 2.5 0 014.5 1.5c0 1.7-2 2-2 3.5M12 17.5h.01" /></svg>);
export const IconBell = () => (<svg viewBox="0 0 24 24" {...ic} aria-hidden><path d="M18 8a6 6 0 10-12 0c0 7-3 9-3 9h18s-3-2-3-9M13.7 21a2 2 0 01-3.4 0" /></svg>);

/* ── chrome ─────────────────────────────────────────────────────────────── */
export function TopBar({ title }) {
  return (
    <div className="ds-top">
      <span className="ds-dot ds-dot--r" /><span className="ds-dot ds-dot--y" /><span className="ds-dot ds-dot--g" />
      <span className="ds-top__title">{title}</span>
      <span className="ds-top__sp" />
      <span className="ds-top__icon"><IconHelp /></span>
      <span className="ds-top__icon"><IconBell /></span>
    </div>
  );
}

// Accordion step card. `cta` is the footer button label; `ctaRef` exposes the
// button node so a figure can target it with a demo cursor.
export function StepCard({ n, title, sub, active, done, press, cta, ctaRef, children }) {
  return (
    <div className="ds-card" data-active={active} data-done={done} data-press={active && press}>
      <div className="ds-card__head">
        <span className="ds-step">{done ? "✓" : n}</span>
        <div className="ds-head__txt">
          <div className="ds-head__title">{title}</div>
          <div className="ds-head__sub">{sub}</div>
        </div>
        <IconChevron className="ds-chev" />
      </div>
      <div className="ds-card__body">
        <div className="ds-card__inner">
          <div className="ds-card__content">{children}</div>
          <div className="ds-foot">
            <span className="ds-btn" ref={ctaRef}>{cta}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── form primitives ───────────────────────────────────────────────────────*/
export const Field = ({ label, children }) => (<div className="ds-field"><div className="ds-label">{label}</div>{children}</div>);
export const Input = ({ value, placeholder, caret }) => (
  <div className={`ds-input ${value ? "" : "ds-input--ph"}`}>
    <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{value || placeholder}</span>
    {caret && <IconCaret />}
  </div>
);
export const Textarea = ({ placeholder }) => (<div className="ds-input ds-input--ph ds-textarea">{placeholder}</div>);
export const Chip = ({ icon, children }) => (<span className="ds-chip">{icon}{children}</span>);

export const Segmented = ({ options, selected }) => (
  <div className="ds-seg">
    {options.map((o, i) => (<div key={o} className="ds-seg__opt" data-on={i === selected}><span>{o}</span></div>))}
  </div>
);
export const Toggle = ({ on }) => (<span className="ds-toggle" data-on={on}><span className="ds-toggle__knob" /></span>);
export const Slider = ({ label, hint, value, percent }) => (
  <div>
    <div className="ds-slider__label">{label}</div>
    <div className="ds-slider__hint">{hint}</div>
    <div className="ds-slider__ctl">
      <div className="ds-slider__rail"><div className="ds-slider__fill" style={{ width: `${percent}%` }} /><div className="ds-slider__knob" style={{ left: `${percent}%` }} /></div>
      <span className="ds-slider__val">{value}</span>
    </div>
  </div>
);

// PRESENTATIONAL ONLY. There was an `onSelect` branch that produced role="tablist" and
// role="tab" and nothing else: no aria-controls, no element anywhere carrying
// role="tabpanel", and no keyboard handling, so every tab was its own tab stop instead of
// the roving tabindex plus arrow keys the pattern requires. No caller ever passed it, so
// it was a dead branch that would have been wrong the first time someone reached for it.
// A promoted interactive primitive ships its complete keyboard model or it ships
// presentational only.
export const Tabs = ({ tabs, active }) => (
  <div className="ds-tabs">
    {tabs.map((t, i) => (
      <span key={t.key ?? t.label ?? i} className="ds-tab" data-on={i === active}>
        {t.icon}{t.label}
      </span>
    ))}
  </div>
);
// The button the system did not have.
//
// `.ds-btn` above is a non-interactive <span> inside StepCard, so every figure that needed
// a REAL control wrote its own. Stella alone carried fourteen: four heights (28/30/32/34),
// three different border tokens, and two byte-identical rule groups (.cand__back was a
// copy of .ats__back). That is not an untidiness, it is a correctness cost, and it had
// already been paid: the press-state rule in components.css was a hand-typed allowlist of
// figure-private class names, and four real <button>s were missing from it, so they had no
// press feedback at all. A second copy of that list lived in qaStella.
//
// Safe to promote by the rule stated above Tabs: a single <button> ships the complete
// native keyboard model, so there is no half-built interaction here to get wrong.
//
// What is shared is the CHASSIS, not the argument. A figure keeps its own class where the
// control makes a surface-specific point (Stella's .stl__choice reveals a failure tag on
// hover, .stl__mode carries a dashed aria-disabled state naming its reason). Those compose
// a thin local layer OVER this base rather than restating it.
//
// `variant` is the only prop that touches colour, and the tone variant reads the scale via
// [data-tone] rather than naming a hue, so a consumer cannot drift off-palette.
export function Button({
  variant = "outline", // quiet | outline | filled | tone | icon
  size = "md",         // sm 28 | md 30 | lg 34 | auto (content height)
  tone,                // only meaningful for variant="tone"
  block = false,       // full width, left aligned: suggestion chips and list rows
  type = "button",     // never submit by accident; a caller can still override
  className = "",
  children,
  ...rest
}) {
  return (
    <button
      type={type}
      className={`ds-button${className ? ` ${className}` : ""}`}
      data-variant={variant}
      data-size={size}
      data-tone={tone}
      data-block={block ? "true" : undefined}
      {...rest}
    >
      {children}
    </button>
  );
}

export const ChecklistRow = ({ text, selected }) => (
  <div className="ds-crow">
    <span className="ds-eye"><IconEye /></span>
    <div className="ds-crow__input">{text}</div>
    <Segmented options={["Essential", "Valuable", "Not Preferred"]} selected={selected} />
  </div>
);

/* ── composite blocks ──────────────────────────────────────────────────────*/
export function PromptBanner() {
  return (
    <div className="ds-prompt">
      <div className="ds-prompt__head"><IconMagic /> ADD PROMPT TO GENERATE CHECKLIST</div>
      <div className="ds-prompt__box">
        <span className="ds-prompt__ph">Describe the role to generate criteria…</span>
        <span className="ds-prompt__sp" />
        <span className="ds-generate">Generate <IconArrowR /></span>
      </div>
    </div>
  );
}
export function ImportBar() {
  return (
    <div className="ds-import">
      <div className="ds-import__head"><IconDatabase /> Import from database <span className="ds-import__sp" /><IconExpand /></div>
      <div className="ds-import__strip">42 Matching Candidates Found <span className="ds-import__sp" /><span className="ds-import__btn">Import &amp; Add</span></div>
    </div>
  );
}
export const DropZone = ({ variant }) => (
  <div className="ds-drop">
    {variant === "connect" ? <IconLink /> : <IconUpload />}
    <span className="ds-drop__title">{variant === "connect" ? "Connect Source" : "Drag and Drop CVs Here"}</span>
    <span className="ds-drop__sub">{variant === "connect" ? "Greenhouse, Lever, Workday" : "PDF, Doc, DocX, Zip File"}</span>
  </div>
);
export const RestrictionCard = ({ icon, name, on, children }) => (
  <div className="ds-restr__card">
    <div className="ds-restr__head">{icon}<span className="ds-restr__name">{name}</span><Toggle on={on} /></div>
    <div className="ds-restr__body">{children}</div>
  </div>
);

/* ── voice-agent set ───────────────────────────────────────────────────────
   Promoted out of the Stella call simulator (figures/stella) so any voice or
   conversational surface can reuse them. All four take a `tone` from the
   --ds-tone-* scale: register | numbers | repair | trust | neutral. */

export const IconSpeaker = ({ muted }) => (
  <svg viewBox="0 0 24 24" {...ic} aria-hidden>
    <path d="M11 5 6 9H3v6h3l5 4z" />
    {muted ? <path d="M17 9l4 6M21 9l-4 6" /> : (
      <><path d="M15.5 8.5a5 5 0 010 7" /><path d="M18.5 5.5a9 9 0 010 13" /></>
    )}
  </svg>
);

// A small labelled tag. Used for annotation categories, failure cases, statuses.
export const Pill = ({ tone = "neutral", soft, children }) => (
  <span className="ds-pill2" data-tone={tone} data-soft={soft ? "true" : undefined}>
    {children}
  </span>
);

// A state dot with a soft halo: live calls, fired listeners, agent health.
export const StatusDot = ({ tone = "numbers", off }) => (
  <span className="ds-statusdot" data-tone={tone} data-off={off ? "true" : undefined} aria-hidden />
);

// Three-bar speaking indicator for a turn that is currently being voiced.
// role="img" is required, not decoration: ARIA does not permit naming a generic span, so
// the aria-label on a bare <span> was being dropped. Capitalised because it is announced.
// `state="buffering"` renders a STATIC three-dot mark instead, so a wait never has the
// same shape as speech, and under prefers-reduced-motion the animation is replaced by a
// word rather than frozen: three still bars where a live state was is not an equivalent.
export const Waveform = ({ tone = "trust", state = "speaking", label }) => {
  const name = label || (state === "buffering" ? "Loading audio" : "Speaking");
  if (state === "buffering") {
    return (
      <span className="ds-buffer" role="img" aria-label={name}>
        <i /><i /><i />
      </span>
    );
  }
  return (
    <span className="ds-wave" data-tone={tone} role="img" aria-label={name}>
      <i /><i /><i />
      <span className="ds-wave__word">{name}</span>
    </span>
  );
};

// Mute control for any surface that speaks. Labelled, because an icon alone does
// not tell a first-time listener whether sound is currently on.
// `state="blocked"` is the browser's autoplay policy, which is a state the product is
// genuinely in and had no way to report: the control read "Sound on" while nothing was
// audible, because the first play() was rejected before any user gesture existed. Every
// DS surface that speaks meets the same policy, so this belongs here and not in a fork.
export function SoundToggle({ muted, onToggle, state = "idle", blockedLabel = "Turn on the voice" }) {
  const blocked = state === "blocked";
  // The label is STABLE. It used to be the state ("Sound on" / "Muted"), which is also
  // the accessible name, while aria-pressed repeated the state and `title` stated the
  // opposite ACTION, so a listener heard "Muted, pressed" and a pointer user read
  // "Unmute" on the same control. No `title` at all now, so a third wording cannot drift
  // in, and the visible text stays inside the accessible name (WCAG 2.5.3).
  const label = blocked ? blockedLabel : "Sound";
  return (
    <button
      type="button"
      className="ds-soundtoggle"
      data-state={blocked ? "blocked" : muted ? "off" : undefined}
      data-tone={blocked ? "trust" : undefined}
      onClick={onToggle}
      // pressed means AUDIBLE, so a muted or blocked surface is never reported as on.
      aria-pressed={!muted && !blocked}
    >
      <IconSpeaker muted={muted || blocked} />
      <span className="ds-soundtoggle__label">{label}</span>
    </button>
  );
}

// One row of a structured record an agent is filling. `state` drives the treatment:
//   empty     nothing heard yet
//   asked     the question was put, but no answer is recorded. Deliberately distinct
//             from `heard`: a record that fills in when a question is merely ASKED is
//             dishonest instrumentation.
//   heard     captured on one pass, not yet confirmed back to the person
//   confirmed read back to them and agreed, so it is safe to write down
//   na        asked and genuinely does not apply
//   offscript captured by a listener, with no field on the form to hold it
// How the value was got, in words. This used to live only in `data-state`, so the
// difference between a number read back and agreed and a number heard once over a bad
// line reached the eye as a hue and reached a screen reader not at all. Provenance IS
// the argument this component exists to make, so it is visible to everyone rather than
// hidden behind a visually-hidden class.
const PROV = {
  confirmed: "read back and agreed",
  heard: "heard once, not confirmed",
  asked: "asked, no answer",
  na: "does not apply",
  offscript: "no field for this",
};

export function FieldRow({ label, value, state = "empty", note, justChanged }) {
  return (
    <div className="ds-fieldrow" data-state={state} data-just={justChanged ? "true" : undefined}>
      <span className="ds-fieldrow__label">{label}</span>
      <span className="ds-fieldrow__value">
        {value || <span className="ds-fieldrow__empty">not yet</span>}
      </span>
      {PROV[state] && <span className="ds-fieldrow__prov">{PROV[state]}</span>}
      {/* Cleared on the NEXT turn, not on a timer: a mark that expires while the reader is
          still looking at the transcript they changed has told them nothing. */}
      {justChanged && <span className="ds-fieldrow__new">new</span>}
      {note && <span className="ds-fieldrow__note">{note}</span>}
    </div>
  );
}

// An agent's recommendation, put in front of the human who owns the decision.
// Deliberately shaped around the governing rule that the human owns the verdict: the
// recommendation never appears without its reasoning, what the agent could NOT
// establish is given equal billing, and the override sits at the same visual weight
// as the agreement. An agent recommendation with no visible way to disagree with it
// is not a recommendation, it is a decision wearing a softer word.
export function Verdict({ tone = "numbers", label, headline, because = [], unsure = [], children }) {
  return (
    <div className="ds-verdict" data-tone={tone}>
      {label && <span className="ds-verdict__label">{label}</span>}
      {headline && <p className="ds-verdict__headline">{headline}</p>}
      {!!because.length && (
        <div className="ds-verdict__block">
          <p className="ds-verdict__blockhead">Because</p>
          <ul className="ds-verdict__list">
            {because.map((b, i) => <li key={i}>{b}</li>)}
          </ul>
        </div>
      )}
      {!!unsure.length && (
        <div className="ds-verdict__block" data-unsure="true">
          <p className="ds-verdict__blockhead">Not established</p>
          <ul className="ds-verdict__list">
            {unsure.map((u, i) => <li key={i}>{u}</li>)}
          </ul>
        </div>
      )}
      {children}
    </div>
  );
}

// One conversation turn. `side` places it (start = the agent, end = the person,
// full = a system record). `active` outlines it in the tone; `as` lets a turn be a
// button when it is inspectable.
// `actions` renders as a SIBLING of the bubble inside a wrapping row, never inside it.
// With as="button" the whole turn is one button, and a button may not contain another
// button, so a per-turn control (replay, copy, flag) has nowhere legal to live inside.
// Passing `actions` wraps the turn in a row and puts them beside it.
export function Bubble({
  speaker, side = "start", tone, active, speaking, as: Tag = "div", className = "",
  actions, children, ...rest
}) {
  const bubble = (
    <Tag
      className={`ds-bubble ${className}`.trim()}
      data-side={side}
      data-tone={tone}
      data-active={active ? "true" : undefined}
      data-speaking={speaking ? "true" : undefined}
      {...rest}
    >
      {speaker && <span className="ds-bubble__speaker">{speaker}</span>}
      {children}
    </Tag>
  );
  if (!actions) return bubble;
  return (
    <div className="ds-bubblerow" data-side={side}>
      {bubble}
      <span className="ds-bubblerow__actions">{actions}</span>
    </div>
  );
}

export function RailStep({ n, name, meta, state, last }) {
  return (
    <div className="ds-rail__step" data-state={state}>
      <div className="ds-rail__col">
        <span className="ds-rail__dot">{state === "done" ? "✓" : n}</span>
        {!last && <span className="ds-rail__line" />}
      </div>
      <div className="ds-rail__detail">
        <div className="ds-rail__name">{name}</div>
        {meta && <div className="ds-rail__meta">{meta}</div>}
      </div>
    </div>
  );
}

/* ── agent-loop set ────────────────────────────────────────────────────────
   Promoted out of the Stella call kernel. These four exist because an agent that
   ACTS needs surfaces a chat agent does not: a plan it can revise, evidence of what
   it heard, an outcome it can be wrong about, and a standing note about what is
   real. All tone-driven from --ds-tone-* via [data-tone]. */

// The work an agent still intends to do, and what the running loop did to it.
// `struck` is the load-bearing status: a step removed because the agent LEARNED it
// does not apply. An open-loop script has no interesting plan state, because nothing
// it hears can change what it does next.
export function PlanQueue({ plan }) {
  return (
    <ol className="ds-plan">
      {plan.map((p) => (
        <li key={p.key} className="ds-plan__row" data-status={p.status}>
          <span className="ds-plan__mark" aria-hidden="true" />
          <span className="ds-plan__label">{p.label}</span>
          {p.why && <span className="ds-plan__why">{p.why}</span>}
        </li>
      ))}
    </ol>
  );
}

// What a background listener heard, attached to the thing it heard it in. A rail of
// lamps says a system is watching; this says what it caught, here, in this line.
export function Caught({ which, children }) {
  return (
    <span className="ds-caught" data-which={which}>
      <span className="ds-caught__who">{which} caught</span>
      <span className="ds-caught__what">{children}</span>
    </span>
  );
}

// How something closed, and whether the system's own label for it was true.
// `truthful={false}` is the point: it lets an interface show the label a system
// actually wrote beside the evidence that it was wrong, which argues harder than
// quietly correcting the label would.
export function Disposition({ tone = "numbers", label, truthful = true, detail, contradiction, children }) {
  return (
    <div className="ds-disposition" data-tone={tone} data-truthful={truthful}>
      <span className="ds-disposition__label">
        {label}
        {!truthful && <Pill tone="repair" soft>the system was wrong</Pill>}
      </span>
      {detail && <p className="ds-disposition__detail">{detail}</p>}
      {contradiction && <p className="ds-disposition__contra">{contradiction}</p>}
      {children}
    </div>
  );
}

// A standing statement of what is real in a demonstration.
//
// `collapsible` exists for dense surfaces, but the default is the flat, always-open
// form and that default is the point: a scope note you can close is a scope note that
// will be absent exactly when someone forms the wrong impression. Where the note is the
// thing keeping a demo honest about what shipped, leave it open. qaStella asserts that
// the Stella mounts specifically do not pass `collapsible`.
// `collapsible` folds the note to its tag until asked for. A scope note has to be
// findable and has to be honest, but it is the least urgent thing on any screen it
// appears on, so it should not hold open the most valuable band of the layout.
// Progressive disclosure. One of these per pane, for the evidence that supports the
// pane's claim rather than for anything a person needs in order to act. It is a real
// <details>, so it works with find-in-page and without JavaScript, and the summary
// stays on screen when closed: the label is a promise that something is under it.
// Pass `onToggle` for a CONTROLLED disclosure. Without it, `open` is an initial state
// only and React will not re-apply an unchanged prop, so an outside event can never
// reopen it once a person has folded it: the pane goes silent for the rest of the
// session while the thing that drives it keeps changing. Controlled mode makes `open`
// authoritative on every render. Existing consumers that pass no `onToggle` are
// unaffected.
export function Disclosure({ label, meta, children, open = false, onToggle }) {
  const controlled = typeof onToggle === "function";
  return (
    <details
      className="ds-disclosure"
      open={open}
      {...(controlled ? { onToggle: (e) => onToggle(e.currentTarget.open) } : {})}
    >
      <summary className="ds-disclosure__sum">
        {label}
        {meta && <span className="ds-disclosure__meta">{meta}</span>}
      </summary>
      <div className="ds-disclosure__body">{children}</div>
    </details>
  );
}

export function ScopeNote({ children, collapsible = false, label = "What this is" }) {
  if (collapsible) {
    return (
      <details className="ds-scopenote ds-scopenote--fold">
        <summary className="ds-scopenote__tag">{label}</summary>
        <span className="ds-scopenote__body">{children}</span>
      </details>
    );
  }
  return (
    <aside className="ds-scopenote" role="note">
      <span className="ds-scopenote__tag">{label}</span>
      <span className="ds-scopenote__body">{children}</span>
    </aside>
  );
}

// A composer that completes itself. The suggestion sits inline as ghost text and the
// RIGHT ARROW accepts it, which is the gesture people already know from a shell and
// from Claude's own input.
//
// Two rules that make it honest rather than annoying:
//   1. A suggestion is only offered if the text so far is a real prefix of it, so the
//      completion never contradicts what the person has already typed.
//   2. Whatever is suggested must be something the product can actually DO. Completing
//      someone into a request the agent will reject is a trap, so consumers pass
//      suggestions that route, and qaStella asserts it.
//
// Accept with ArrowRight (only at the end of the line, so the key still moves the
// caret when there is text to its right) or Tab. Escape dismisses for this keystroke.
export function GhostInput({
  value, onChange, onSubmit, suggestions = [], placeholder, ariaLabel, hint = "→ to accept",
}) {
  const [dismissed, setDismissed] = useState(false);
  const ref = useRef(null);

  const typed = value || "";
  const match =
    !dismissed && typed.trim()
      ? suggestions.find(
          (s) => s.toLowerCase().startsWith(typed.toLowerCase()) && s.length > typed.length
        )
      : null;
  const completion = match ? match.slice(typed.length) : "";

  const accept = () => {
    if (!match) return false;
    onChange(match);
    requestAnimationFrame(() => {
      const el = ref.current;
      if (el) el.setSelectionRange(match.length, match.length);
    });
    return true;
  };

  const onKeyDown = (e) => {
    const el = ref.current;
    const atEnd = el && el.selectionStart === typed.length && el.selectionEnd === typed.length;
    if (e.key === "ArrowRight" && atEnd && match) {
      // Only steal the key when there is nothing to its right to move over.
      e.preventDefault();
      accept();
      return;
    }
    if (e.key === "Tab" && !e.shiftKey && atEnd && match) {
      e.preventDefault();
      accept();
      return;
    }
    if (e.key === "Escape" && match) {
      e.preventDefault();
      setDismissed(true);
      return;
    }
    if (e.key === "Enter") {
      e.preventDefault();
      onSubmit?.(typed);
    }
  };

  return (
    <span className="ds-ghost">
      {/* The ghost is a mirror of the input, so it must carry identical type and
          padding or the completion will not sit flush against what was typed. */}
      <span className="ds-ghost__mirror" aria-hidden="true">
        <span className="ds-ghost__typed">{typed}</span>
        <span className="ds-ghost__rest">{completion}</span>
      </span>
      <input
        ref={ref}
        className="ds-ghost__input"
        value={typed}
        onChange={(e) => {
          setDismissed(false);
          onChange(e.target.value);
        }}
        onKeyDown={onKeyDown}
        placeholder={typed ? undefined : placeholder}
        aria-label={ariaLabel}
        aria-describedby={match ? "ds-ghost-hint" : undefined}
      />
      {match && (
        <button
          type="button"
          className="ds-ghost__accept"
          id="ds-ghost-hint"
          onClick={accept}
          tabIndex={-1}
        >
          {hint}
        </button>
      )}
    </span>
  );
}
