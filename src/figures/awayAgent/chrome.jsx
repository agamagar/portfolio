// Shared Away agent chat-UI primitives. Compose these inside a PhoneWindow screen
// to build each figure's beats. Styling lives in awayAgent.css (.aw-*). Atoms are
// presentational; figures drive state by toggling props per beat.
import { IPlane, ISend, ICal, ICheck, IShield, IAlert, IClock } from "./icons";

// agent avatar (the concierge)
export const Ava = () => (<span className="aw-ava"><IPlane /></span>);

// a chat message row. who: "agent" | "user". `enter` plays the rise-in.
export function Msg({ who = "agent", enter, children }) {
  return (
    <div className={`aw-msg aw-msg--${who}`}>
      {who === "agent" && <Ava />}
      <div className={`aw-bubble${enter ? " aw-bubble--enter" : ""}`}>{children}</div>
    </div>
  );
}

// the three thinking dots, in an agent bubble
export const Typing = () => (
  <div className="aw-msg aw-msg--agent"><Ava /><span className="aw-typing"><i /><i /><i /></span></div>
);

// a cycling "thinking" line with a shimmer (the agent working on a short wait)
export const Think = ({ children }) => (
  <div className="aw-msg aw-msg--agent"><Ava /><span className="aw-bubble"><span className="aw-think"><span className="aw-think__sh">{children}</span></span></span></div>
);

// the composer / input bar (resting). `ph` = placeholder text; pass `ready` for the dot.
export function Composer({ ph = "Tell me where, I'll handle which flight", ready = true }) {
  return (
    <div className="aw-composer">
      <span className="aw-composer__ph">{ph}</span>
      {ready ? <span className="aw-dot" /> : <span className="aw-composer__send"><ISend /></span>}
    </div>
  );
}

// the composer morphed into a clarifying-question card. `chips`: [{label, on, kind}].
export function QuestionCard({ q, step, chips }) {
  return (
    <div className="aw-card">
      <div className="aw-card__top">
        <span className="aw-card__q">{q}</span>
        {step && <span className="aw-card__step">{step}</span>}
      </div>
      <div className="aw-chips">
        {chips.map((c) => (
          <span className="aw-chip" key={c.label} data-on={c.on} data-kind={c.kind}>
            {c.kind === "date" && <ICal />}{c.label}
          </span>
        ))}
      </div>
    </div>
  );
}

// a suggestion-pill row (FIND on-ramp). `label` = the field tag ("When?").
export function PillRow({ label, pills }) {
  return (
    <div className="aw-pills">
      {label && <span className="aw-pill__lbl">{label}</span>}
      {pills.map((p) => (<span className="aw-pill" key={p.label} data-on={p.on}>{p.label}</span>))}
    </div>
  );
}

// a vetted flight row. tag: {tone:"good"|"green", label}. flag: {tone, node}.
export function Flight({ air, time, meta, from, now, nowTone, good, sel, dim, tag, flag }) {
  return (
    <div className="aw-flight" data-good={good} data-sel={sel} data-dim={dim}>
      <div className="aw-flight__top">
        <span className="aw-flight__air">{air}</span>
        <span className="aw-flight__rt">
          <span className="aw-flight__time">{time}</span>
          <span className="aw-flight__meta">{meta}</span>
        </span>
        <span className="aw-flight__price">
          {from && <span className="aw-flight__from">{from}</span>}
          <span className="aw-flight__now" data-tone={nowTone}>{now}</span>
        </span>
      </div>
      {tag && <span className="aw-tag" data-tone={tag.tone}>{tag.tone === "good" ? <IShield /> : <ICheck />}{tag.label}</span>}
      {flag && <span className="aw-flag" data-tone={flag.tone}><IAlert />{flag.node}</span>}
    </div>
  );
}

// The one-line summary above the listing ("8 flights. 3 are worth your time").
//
// This was called `Verdict`, colliding with the DS's <Verdict>, which is a completely
// different thing: a recommendation card with required `because` and `unsure` shapes and
// an override slot. Two exports, one name, incompatible contracts, and an import would
// resolve to whichever path was typed. Renamed to what it actually is: a summary line,
// not a verdict.
export const SummaryLine = ({ children }) => (
  <div className="aw-summary"><span className="aw-summary__star"><IShield /></span>{children}</div>
);

// the trap flag / warning, standalone
export const Flag = ({ tone = "amber", children }) => (
  <span className="aw-flag" data-tone={tone}><IAlert />{children}</span>
);

// the savings reveal
export const Savings = ({ from, now, delta }) => (
  <div className="aw-save">
    <div className="aw-save__row">
      <span className="aw-save__from">{from}</span>
      <span className="aw-save__now">{now}</span>
    </div>
    <span className="aw-save__delta"><ICheck />{delta}</span>
  </div>
);

// a status badge
export const Badge = ({ tone = "indigo", icon, children }) => (
  <span className="aw-badge" data-tone={tone}>{icon}{children}</span>
);

// a deep-search timeline. steps: [{label, state:"done"|"active"|"pending", pills?}].
export function Timeline({ steps }) {
  return (
    <div className="aw-tl">
      {steps.map((s, i) => (
        <div className="aw-tl__step" key={s.label} data-state={s.state}>
          <span className="aw-tl__rail">
            <span className="aw-tl__dot"><ICheck /></span>
            <span className="aw-tl__line" />
          </span>
          <span className="aw-tl__body">
            <span className="aw-tl__lbl">{s.label}</span>
            {s.state === "active" && s.pills && (
              <span className="aw-tlpills">{s.pills.map((p) => <span className="aw-tlpill" key={p}>{p}</span>)}</span>
            )}
          </span>
        </div>
      ))}
    </div>
  );
}
