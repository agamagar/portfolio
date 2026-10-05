// The expanded view for a phone in the row, modelled on recent.design: a fixed,
// opaque, full-height sidebar of detail on the left, and a scrollable column of
// slides on the right. The first slide is always the phone that was clicked (for
// consistency); the rest are the other screens from the same project, so the
// column reads like a little presentation. Escape closes, arrows move between
// screens in the row.

import { useCallback, useEffect, useMemo } from "react";
import { lockBackgroundScroll } from "../ui/smoothScroll";
import { createPortal } from "react-dom";
import FigmaPhone from "./FigmaPhone";
import HelloLink from "./HelloLink";

function Row({ label, children }) {
  return (
    <div className="pd__row">
      <span className="pd__row-label">{label}</span>
      <span className="pd__row-value">{children}</span>
    </div>
  );
}

export default function PhoneDetail({ phones, index, onIndex, onClose, onNavigate }) {
  const open = index != null;
  const p = open ? phones[index] : null;

  // slides: the clicked screen first, then the rest of that project's screens.
  const slides = useMemo(() => {
    if (!p) return [];
    const same = phones.filter((q) => q.href === p.href && q.src !== p.src);
    return [p, ...same];
  }, [p, phones]);

  const go = useCallback(
    (delta) => {
      if (index == null) return;
      onIndex((index + delta + phones.length) % phones.length);
    },
    [index, phones.length, onIndex],
  );

  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
      else if (e.key === "ArrowRight") go(1);
      else if (e.key === "ArrowLeft") go(-1);
    };
    window.addEventListener("keydown", onKey);
    // body overflow AND Lenis, together (see lockBackgroundScroll)
    const unlock = lockBackgroundScroll();
    return () => {
      window.removeEventListener("keydown", onKey);
      unlock();
    };
  }, [open, go, onClose]);

  if (!open) return null;

  // Portal to body so the fixed full-height layer is never trapped by a
  // transformed ancestor (the marquee track transforms its own subtree).
  return createPortal(
    <div className="pd" role="dialog" aria-modal="true" aria-label={`${p.brand}: ${p.caption}`}>
      <button className="pd__scrim" aria-label="Close" onClick={onClose} />

      <aside className="pd__aside" data-lenis-prevent style={{ "--accent": p.accent }}>
        <div className="pd__top">
          <button className="pd__close" onClick={onClose} data-tip aria-label="Close">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
              <path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </button>
          <div className="pd__nav">
            <button className="pd__arrow" onClick={() => go(-1)} data-tip aria-label="Previous">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
                <path d="M10 3l-5 5 5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            <button className="pd__arrow" onClick={() => go(1)} data-tip aria-label="Next">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
                <path d="M6 3l5 5-5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>
        </div>

        <p className="pd__eyebrow">{p.brand}</p>
        <h3 className="pd__title">{p.caption}</h3>
        <p className="pd__blurb">{p.blurb}</p>

        <HelloLink to={p.href} onNavigate={onNavigate} className="pd__link">
          View the case study
          <span aria-hidden> →</span>
        </HelloLink>

        <div className="pd__meta">
          <Row label="Project">{p.brand}</Row>
          <Row label="Screen">{p.caption}</Row>
          <Row label="Palette">
            <span className="pd__swatch" style={{ background: p.accent }} aria-hidden />
            {p.accent.toUpperCase()}
          </Row>
          <Row label="Position">
            {index + 1} of {phones.length}
          </Row>
        </div>
      </aside>

      {/* Clicking the empty space around the phones closes too (annotation
          msbcnqho). The .pd__scrim behind this was already a close button, but
          the stage covers most of the viewport, so in practice almost every
          "click outside the phone" landed here and did nothing. Guarded on
          currentTarget so a click on a phone or a slide is not a close. */}
      <div
        className="pd__stage"
        onClick={(e) => {
          if (e.target === e.currentTarget) onClose();
        }}
      >
        {slides.map((s, i) => (
          <div className="pd__slide" key={s.src} onClick={(e) => e.target === e.currentTarget && onClose()}>
            <FigmaPhone
              screen={s.src}
              alt={`${s.brand}: ${s.caption}`}
              width={300}
              className={i === 0 ? "pd__phone" : "pd__phone pd__phone--rest"}
            />
          </div>
        ))}
      </div>
    </div>,
    document.body,
  );
}
