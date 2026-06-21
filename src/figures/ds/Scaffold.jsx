// "Information-sensitive scaffold" preset primitives. Compose these for figures
// where the real data is sensitive or beside the point: render the bulk as
// static shimmer and keep only the focal element + its annotation real/animated.
// See Claude/animation-base-layer.md (preset: information-sensitive scaffold + §11 FFF).
import { useState, useEffect, useRef } from "react";
import { useReducedMotion } from "./hooks";
import "./scaffold.css";

// FFF count: the one real number of a beat, tweened on value change (the load-
// bearing figure — e.g. 480 -> 42). Reduced motion jumps to the value.
export function CountUp({ value, className, dur = 700, ...rest }) {
  const reduce = useReducedMotion();
  const [disp, setDisp] = useState(value);
  const prev = useRef(value);
  useEffect(() => {
    if (reduce || prev.current === value) { setDisp(value); prev.current = value; return; }
    const from = prev.current, to = value, start = performance.now();
    let raf;
    const tick = (t) => {
      const p = Math.min(1, (t - start) / dur);
      const eased = 1 - Math.pow(1 - p, 3); // easeOutCubic, no overshoot
      setDisp(Math.round(from + (to - from) * eased));
      if (p < 1) raf = requestAnimationFrame(tick);
      else prev.current = to;
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [value, reduce, dur]);
  return <span className={className} {...rest}>{disp.toLocaleString()}</span>;
}

const ic = { fill: "none", stroke: "currentColor", strokeWidth: 2, strokeLinecap: "round", strokeLinejoin: "round" };
const IPlus = () => (<svg viewBox="0 0 24 24" {...ic}><path d="M12 5v14M5 12h14" /></svg>);
const IPause = () => (<svg viewBox="0 0 24 24" fill="currentColor"><rect x="7" y="5" width="3.4" height="14" rx="1" /><rect x="13.6" y="5" width="3.4" height="14" rx="1" /></svg>);
const IEye = () => (<svg viewBox="0 0 24 24" {...ic}><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z" /><circle cx="12" cy="12" r="3" /></svg>);
const ICopy = () => (<svg viewBox="0 0 24 24" {...ic}><rect x="9" y="9" width="11" height="11" rx="2" /><path d="M5 15V5a2 2 0 012-2h10" /></svg>);
const ITrash = () => (<svg viewBox="0 0 24 24" {...ic}><path d="M4 7h16M9 7V5a1 1 0 011-1h4a1 1 0 011 1v2m-9 0l1 13a1 1 0 001 1h6a1 1 0 001-1l1-13" /></svg>);
const IGear = () => (<svg viewBox="0 0 24 24" {...ic}><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.6 1.6 0 00.3 1.8l.1.1a2 2 0 11-2.8 2.8l-.1-.1a1.6 1.6 0 00-2.7 1.1V21a2 2 0 11-4 0v-.1A1.6 1.6 0 005 19.4l-.1.1a2 2 0 11-2.8-2.8l.1-.1a1.6 1.6 0 00-1.1-2.7H1a2 2 0 110-4h.1A1.6 1.6 0 002.6 5l-.1-.1a2 2 0 112.8-2.8l.1.1a1.6 1.6 0 002.7-1.1V1a2 2 0 114 0v.1A1.6 1.6 0 0019 2.6l.1-.1a2 2 0 112.8 2.8l-.1.1a1.6 1.6 0 001.1 2.7H23a2 2 0 110 4h-.1a1.6 1.6 0 00-1.5 1z" /></svg>);
const IClose = () => (<svg viewBox="0 0 24 24" {...ic}><path d="M6 6l12 12M18 6L6 18" /></svg>);

// a single skeleton block
export const Shimmer = ({ w, h = 12, r, soft, style }) => (
  <span className={`ds-shim${soft ? " ds-shim--soft" : ""}`} style={{ width: w, height: h, borderRadius: r, ...style }} />
);

// faux browser window: traffic dots + url bar, optional left rail, a titled main area
export function AppWindow({ url = "localhost:3000", title, rail = true, children }) {
  return (
    <div className="ds-win">
      <div className="ds-win__bar">
        <span className="ds-dot ds-dot--r" /><span className="ds-dot ds-dot--y" /><span className="ds-dot ds-dot--g" />
        <span className="ds-win__url">{url}</span>
      </div>
      <div className="ds-win__body">
        {rail && (
          <div className="ds-win__rail">
            <Shimmer w={26} h={26} r={7} /><Shimmer w={26} h={26} r={7} /><Shimmer w={26} h={26} r={7} /><Shimmer w={26} h={26} r={7} />
            <span className="ds-win__rail-foot"><Shimmer w={26} h={26} r={999} /></span>
          </div>
        )}
        <div className="ds-win__main">
          {title && (
            <div className="ds-win__head">
              <Shimmer w={22} h={22} r={6} />
              <span className="ds-win__title">{title}</span>
              <span className="ds-win__sp" />
              <span className="ds-win__add"><IPlus /></span>
            </div>
          )}
          {children}
        </div>
      </div>
    </div>
  );
}

// Phone device frame: the mobile counterpart of AppWindow. A status bar (time +
// glyphs), an optional app header (back + title), the screen, and a home
// indicator. `.ds-phone__screen` is the positioned ancestor — render FocalOutline
// / Caption inside `children` and offset them against it (like AppWindow's main).
export function PhoneWindow({ time = "9:41", title, back = true, screenRef, className, children }) {
  return (
    <div className={`ds-phone${className ? ` ${className}` : ""}`}>
      <div className="ds-phone__status">
        <span className="ds-phone__time">{time}</span>
        <span className="ds-phone__glyphs"><i /><i /><span className="ds-phone__batt" /></span>
      </div>
      {title && (
        <div className="ds-phone__appbar">
          {back && <span className="ds-phone__back" aria-hidden>‹</span>}
          <span className="ds-phone__apptitle">{title}</span>
        </div>
      )}
      <div className="ds-phone__screen" ref={screenRef}>{children}</div>
      <span className="ds-phone__home" />
    </div>
  );
}

// a skeleton card of shimmer lines
export const SkeletonCard = ({ style }) => (
  <div className="ds-skcard" style={style}>
    <Shimmer w="55%" h={10} /><Shimmer w="80%" h={16} r={8} />
  </div>
);
export const SkeletonRow = () => (
  <div className="ds-skrow">
    <Shimmer w="22%" h={10} /><Shimmer w="20%" h={10} /><Shimmer w="16%" h={10} /><Shimmer w={70} h={20} r={999} style={{ marginLeft: "auto" }} />
  </div>
);

// numbered annotation pin (parent positions it via style left/top)
export const AnnotationPin = ({ n, pop, style }) => (
  <span className={`ds-pin${pop ? " ds-pin--pop" : ""}`} style={style}>{n}</span>
);

// FFF focal outline: the one lit element of a beat. Parent positions it with
// style {left,top,width,height}. variant: undefined (blue) | green | amber | red | area.
export const FocalOutline = ({ variant, style }) => (
  <span className={`ds-focal${variant ? ` ds-focal--${variant}` : ""}`} style={style} />
);

// FFF caption chip: names the concept of the current beat. mode: "blue" | "green".
export const Caption = ({ mode = "blue", label, style }) => (
  <span className="ds-caption" data-mode={mode} style={style}><span className="ds-caption__dot" />{label}</span>
);

// dark annotation popup with a typed instruction + Cancel/Add
export function AnnotationPopup({ selector, text, caret, press, addRef, style }) {
  return (
    <div className="ds-popup" data-press={press} style={style}>
      <div className="ds-popup__sel">{selector}</div>
      <div className="ds-popup__field">{text}{caret && <span className="ds-popup__caret" />}</div>
      <div className="ds-popup__row">
        <span className="ds-popup__cancel">Cancel</span>
        <span className="ds-popup__add" ref={addRef}>Add</span>
      </div>
    </div>
  );
}

// the floating control toolbar
export function ControlBar() {
  return (
    <div className="ds-controls">
      <span className="ds-controls__btn"><IPause /></span>
      <span className="ds-controls__btn"><IEye /></span>
      <span className="ds-controls__btn"><ICopy /></span>
      <span className="ds-controls__btn"><ITrash /></span>
      <span className="ds-controls__btn"><IGear /></span>
      <span className="ds-controls__sep" />
      <span className="ds-controls__btn"><IClose /></span>
    </div>
  );
}
