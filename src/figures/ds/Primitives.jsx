// Dassh figure design-system primitives. Reusable, presentational building
// blocks styled to the Figma spec (uPhIrXFWQ1EXgQBSvPiuxQ). Figures compose these
// and own their own animation via the harness in hooks.js + Cursor.jsx.
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

export const Tabs = ({ tabs, active }) => (
  <div className="ds-tabs">
    {tabs.map((t, i) => (<span key={t.label} className="ds-tab" data-on={i === active}>{t.icon}{t.label}</span>))}
  </div>
);
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
