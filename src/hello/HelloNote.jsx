// A word with a footnote behind it (annotation msefea0i).
//
// The dotted underline is not decoration: it is the long-standing typographic
// cue that a word carries extra information — the same convention an abbreviation
// or a defined term uses. Anything else (a colour, a superscript) would either
// look like a link or read as a citation the reader is expected to chase.
//
// WHY NOT RoleTooltip or the global Tooltips: RoleTooltip is bound to the `role`
// data shape (dates, positions, tenure maths), and the delegated `.tip` is a
// single line sized for icon buttons. This is a sentence or two of prose, so it
// needs its own box — but it borrows both of their manners: a delay before
// opening so sweeping past stays quiet, Escape to dismiss, and edge-clamping so
// the panel never leaves the viewport.
//
// Keyboard reaches it: the trigger is focusable and `:focus-visible` opens it,
// because a footnote only a mouse can read is a footnote most people cannot.

import { useCallback, useEffect, useId, useRef, useState } from "react";
import { useSheetMode } from "./useSheet";

const OPEN_DELAY = 280;
const CLOSE_DELAY = 140;

export default function HelloNote({ children, title, body }) {
  const id = useId();
  const [open, setOpen] = useState(false);
  const wrapRef = useRef(null);
  const panelRef = useRef(null);
  const timers = useRef({ open: 0, close: 0 });

  const clear = () => {
    clearTimeout(timers.current.open);
    clearTimeout(timers.current.close);
  };
  const show = useCallback(() => {
    clear();
    timers.current.open = setTimeout(() => setOpen(true), OPEN_DELAY);
  }, []);
  const hide = useCallback(() => {
    clear();
    timers.current.close = setTimeout(() => setOpen(false), CLOSE_DELAY);
  }, []);
  useEffect(() => clear, []);

  // ON PHONES THIS IS A BOTTOM SHEET, NOT A TOOLTIP (Agam, 2026-08-11). The
  // reasoning, and the single breakpoint the role cards share, live in
  // useSheet.js.
  const sheet = useSheetMode();

  // Measured and corrected rather than guessed with breakpoints: the trigger sits
  // in a centred heading, so which edge it runs past depends on the viewport.
  // Skipped entirely in sheet mode — the sheet spans the viewport, so there is
  // no edge to run past and a stale `--nudge` would only shove it sideways.
  const place = useCallback(() => {
    const panel = panelRef.current;
    if (!panel || sheet) return;
    panel.style.setProperty("--nudge", "0px");
    const margin = 12;
    const r = panel.getBoundingClientRect();
    let dx = 0;
    if (r.left < margin) dx = margin - r.left;
    else if (r.right > window.innerWidth - margin) dx = window.innerWidth - margin - r.right;
    if (dx) panel.style.setProperty("--nudge", `${Math.round(dx)}px`);
  }, [sheet]);

  useEffect(() => {
    if (open) place();
  }, [open, place]);

  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => {
      if (e.key === "Escape") {
        clear();
        setOpen(false);
      }
    };
    window.addEventListener("keydown", onKey);
    window.addEventListener("scroll", place, { passive: true });
    window.addEventListener("resize", place);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("scroll", place);
      window.removeEventListener("resize", place);
    };
  }, [open, place]);

  return (
    <span
      className="hnote"
      ref={wrapRef}
      onPointerEnter={(e) => e.pointerType !== "touch" && show()}
      onPointerLeave={(e) => e.pointerType !== "touch" && hide()}
    >
      <span
        className="hnote__word"
        tabIndex={0}
        role="button"
        aria-expanded={open}
        aria-describedby={open ? id : undefined}
        onFocus={show}
        onBlur={hide}
        onClick={() => setOpen((v) => !v)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            setOpen((v) => !v);
          }
        }}
      >
        {children}
      </span>
      {/* HIDDEN FROM THE ACCESSIBILITY TREE WHILE CLOSED, and that is not cosmetic:
          this note lives inside an <h2>, so a descendant that is always exposed
          becomes part of the HEADING'S OWN NAME. Measured — the heading read as
          "You're welcome to say a firm and cheery 'hello'Where the phrase comes
          fromThe first telephone directory..." in one breath, which is what a
          screen-reader user would hear when navigating by heading.
          Closed is the resting state, so the heading is clean by default; opened,
          the reader has asked for it and `aria-describedby` points here. */}
      {/* The scrim exists ONLY in sheet mode, and only while open. A sheet
          without one has no dismiss affordance for a thumb: the trigger is a
          few words of a heading now sitting behind the sheet, and tapping it
          again is a target the reader has to find. It is aria-hidden because it
          is a dismissal surface, not content; Escape still does the same job. */}
      {sheet && open && (
        <span
          className="hnote__scrim"
          aria-hidden="true"
          onClick={() => {
            clear();
            setOpen(false);
          }}
        />
      )}
      <span
        className="hnote__panel"
        id={id}
        ref={panelRef}
        role="note"
        aria-hidden={open ? undefined : "true"}
        data-open={open ? "true" : undefined}
        data-sheet={sheet ? "true" : undefined}
      >
        {sheet && <span className="hnote__grip" aria-hidden="true" />}
        <span className="hnote__title">{title}</span>
        <span className="hnote__body">{body}</span>
      </span>
    </span>
  );
}
