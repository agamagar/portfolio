import { useState, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";

// Shared full-screen shell for the cross-sell interactive figures. `render`
// gets ({ full, onFull }) and returns the figure; the same tree renders inline
// and, when open, inside the fc-full portal. Escape closes; the body scroll
// lock is cleared rather than restored (see the note in CrossSellTree).

export const IExpand = () => (
  <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7" />
  </svg>
);
export const ICollapse = () => (
  <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M4 14h6v6M20 10h-6V4M14 10l7-7M3 21l7-7" />
  </svg>
);

export function FullButton({ full, onFull }) {
  return (
    <button
      type="button"
      className="fc__btn fc__btn--icon"
      onClick={onFull}
      aria-label={full ? "Exit full screen" : "View full screen"}
      title={full ? "Exit full screen (Esc)" : "View full screen"}
    >
      {full ? <ICollapse /> : <IExpand />}
      <span>{full ? "Exit" : "Full screen"}</span>
    </button>
  );
}

export default function XsFull({ label, render }) {
  const [full, setFull] = useState(false);
  const close = useCallback(() => setFull(false), []);
  useEffect(() => {
    if (!full) return;
    const onKey = (e) => { if (e.key === "Escape") close(); };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.removeProperty("overflow");
      window.removeEventListener("keydown", onKey);
    };
  }, [full, close]);
  return (
    <>
      {render({ full: false, onFull: () => setFull(true) })}
      {full && createPortal(
        <div className="fc-full" role="dialog" aria-modal="true" aria-label={label}>
          <div className="fc-full__inner">{render({ full: true, onFull: close })}</div>
        </div>,
        document.body
      )}
    </>
  );
}
