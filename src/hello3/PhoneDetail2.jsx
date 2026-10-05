// The "Evidence Card" detail view — the /hello candidate.
//
// Same skeleton as PhoneDetail (scrim, floating aside, slide column, the
// phone-hero View Transitions morph), different CONTENTS. The old aside was an
// art-gallery placard: it spent its most expensive line naming a screenshot
// ("Slot picker") and filled the rest with Palette #6B21D9 and Position 4 of 7.
// This one answers the only three questions a screener has — what was it, what
// did it do, what was his part — and hands them one exit.
//
// Every fact here already exists in the repo. The claim line, outcome, role and
// year come from the TIMELINE entry joined on href; nothing is invented, and no
// baseline or timeframe is fabricated to dress the outcome up.
//
// Chosen over three other directions by a 3-judge panel (75/90 vs 70.5, 66.5,
// 55) on strategy fidelity, craft and buildability. Two judge grafts are folded
// in: the fixed label column so Outcome and Role share one x-axis, and the claim
// line set in the SANS, because the type rule reserves the serif for authored
// first-person prose and the blurb is the one serif moment on the card.

import { useCallback, useEffect, useMemo, useRef } from "react";
import { createPortal } from "react-dom";
import FigmaPhone from "./FigmaPhone";
import HelloLink from "./HelloLink";
import { TIMELINE } from "./helloData";

function Fact({ label, children }) {
  return (
    <div className="pd2__fact">
      <span className="pd2__fact-label">{label}</span>
      <span className="pd2__fact-value">{children}</span>
    </div>
  );
}

export default function PhoneDetail2({ phones, index, onIndex, onClose, onNavigate }) {
  const open = index != null;
  const p = open ? phones[index] : null;
  const closeRef = useRef(null);
  const returnRef = useRef(null);

  // The evidence join. A phone with no matching TIMELINE row still renders —
  // it just shows no facts rather than empty shells.
  const t = useMemo(() => (p ? TIMELINE.find((x) => x.href === p.href) : null), [p]);
  useEffect(() => {
    if (p && p.href && !t && import.meta.env?.DEV) {
      console.warn(`[PhoneDetail2] no TIMELINE entry for ${p.href}; outcome and role rows hidden.`);
    }
  }, [p, t]);

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
    returnRef.current = document.activeElement;
    closeRef.current?.focus();
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
      else if (e.key === "ArrowRight") go(1);
      else if (e.key === "ArrowLeft") go(-1);
    };
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
      // best effort: the marquee cell that opened this should get focus back
      const back = returnRef.current;
      if (back && back.isConnected) back.focus?.();
    };
  }, [open, go, onClose]);

  if (!open) return null;

  return createPortal(
    <div
      className="pd pd2"
      role="dialog"
      aria-modal="true"
      aria-label={[p.brand, t ? t.title : p.caption].filter(Boolean).join(": ")}
    >
      <button className="pd__scrim" aria-label="Close" onClick={onClose} />

      <aside className="pd__aside pd2__aside" style={{ "--accent": p.accent }}>
        <div className="pd__top">
          <button className="pd__close" ref={closeRef} onClick={onClose} data-tip aria-label="Close">
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

        {/* Keyed on the screen so arrowing between projects cross-fades the
            evidence instead of hard-popping it. The key sits INSIDE the aside,
            never on the element carrying view-transition-name, so the morph's
            group is never torn down mid-flight. */}
        <div className="pd2__swap" key={p.src}>
          <p className="pd2__eyebrow">
            {[p.brand, t?.year, p.platform].filter(Boolean).join(" / ")}
          </p>
          <h3 className="pd2__title">{t ? t.title : p.caption}</h3>
          <p className="pd2__blurb">{p.blurb}</p>

          {t && (
            <div className="pd2__facts">
              <Fact label="Outcome">
                <strong>{t.outcome}</strong>
              </Fact>
              <Fact label="Role">{t.role}</Fact>
            </div>
          )}

          {/* Only when there IS a case to read. A cell may be real shipped work
              with no case page behind it (CaratLane), and a CTA pointing at a
              route that does not exist is worse than no CTA. */}
          {p.href && (
            <HelloLink to={p.href} onNavigate={onNavigate} className="pd2__cta">
              Read the case study
              <span aria-hidden>→</span>
            </HelloLink>
          )}
        </div>
      </aside>

      <div
        className="pd__stage"
        onClick={(e) => {
          if (e.target === e.currentTarget) onClose();
        }}
      >
        {slides.map((s, i) => {
          // A background slide promotes itself rather than closing, so the
          // reader can re-anchor without hunting the arrows. The first slide is
          // already the subject and stays inert.
          const promote = i === 0 ? undefined : () => onIndex(phones.indexOf(s));
          return (
            <figure
              className="pd__slide pd2__slide"
              key={s.src}
              onClick={(e) => {
                if (e.target !== e.currentTarget) return;
                onClose();
              }}
            >
              <div className="pd2__slide-hit" onClick={promote} role={promote ? "button" : undefined} tabIndex={promote ? 0 : undefined}
                onKeyDown={promote ? (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); promote(); } } : undefined}
                aria-label={promote ? `Show ${s.caption}` : undefined}>
                <FigmaPhone
                  screen={s.src}
                  alt={[s.brand, s.caption].filter(Boolean).join(": ")}
                  width={300}
                  className={i === 0 ? "pd__phone" : "pd__phone pd__phone--rest"}
                />
              </div>
              {/* the screen name lives on the artifact, not in the sidebar */}
              <figcaption className="pd2__slide-cap">{s.caption}</figcaption>
            </figure>
          );
        })}
      </div>
    </div>,
    document.body,
  );
}
