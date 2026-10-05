// The role card behind an emphasised company name in the credentials line.
//
// A button, not a hover-only tooltip. Hover is the primary way in on a pointer,
// but hover does not exist on touch, and half the people who read a portfolio
// read it on a phone. So the trigger is a real button: hover opens it, focus
// opens it, tap toggles it, Escape and an outside click close it.
//
// There is a grace period on close because the panel has content in it and the
// pointer has to be able to travel from the word into the card without the card
// vanishing out from under it.

import { useCallback, useEffect, useId, useRef, useState } from "react";
import AnimatedShinyText from "@/components/ui/animated-text-01";
import { readMs } from "./useStage";

// LinkedIn counts the starting month as month one, so Dec 2024 to Jul 2026
// reads as 1 yr 8 mos rather than 1 yr 7. Matching that keeps the card
// consistent with the profile it was copied from.
function tenure(start, end) {
  const [sy, sm] = start.split("-").map(Number);
  const now = end ? end.split("-").map(Number) : null;
  const d = new Date();
  const ey = now ? now[0] : d.getFullYear();
  const em = now ? now[1] : d.getMonth() + 1;
  const months = Math.max(1, (ey - sy) * 12 + (em - sm) + 1);
  const y = Math.floor(months / 12);
  const m = months % 12;
  const parts = [];
  if (y) parts.push(`${y} yr${y > 1 ? "s" : ""}`);
  if (m) parts.push(`${m} mo${m > 1 ? "s" : ""}`);
  return parts.join(" ") || "1 mo";
}

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const label = (ym) => {
  const [y, m] = ym.split("-").map(Number);
  return `${MONTHS[m - 1]} ${y}`;
};

export default function RoleTooltip({ role, children, shineIndex = 0, shine }) {
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
    const delay = readMs(wrapRef.current, "--hello-tip-in", 300);
    timers.current.open = setTimeout(() => setOpen(true), delay);
  }, []);

  const hide = useCallback(() => {
    clear();
    const delay = readMs(wrapRef.current, "--hello-tip-out", 160);
    timers.current.close = setTimeout(() => setOpen(false), delay);
  }, []);

  useEffect(() => clear, []);

  // Keep the card on screen, horizontally and vertically. Both are measured and
  // corrected rather than guessed at with media queries. The vertical one
  // matters more than it looks: dropping downward puts the card straight over
  // Resume and LinkedIn, the only two calls to action on the page.
  const place = useCallback(() => {
    const panel = panelRef.current;
    if (!panel) return;
    panel.style.setProperty("--nudge", "0px");
    panel.removeAttribute("data-flip");
    const margin = 12;
    let r = panel.getBoundingClientRect();
    let dx = 0;
    if (r.left < margin) dx = margin - r.left;
    else if (r.right > window.innerWidth - margin) dx = window.innerWidth - margin - r.right;
    if (dx) panel.style.setProperty("--nudge", `${Math.round(dx)}px`);
    // re-read after the horizontal nudge, then flip up if the bottom overflows
    // and there is more room above than below
    r = panel.getBoundingClientRect();
    const below = window.innerHeight - margin - r.bottom;
    if (below < 0) {
      const trigger = wrapRef.current?.getBoundingClientRect();
      const roomAbove = trigger ? trigger.top - margin : 0;
      if (roomAbove > r.height || roomAbove > window.innerHeight - trigger.bottom) {
        panel.setAttribute("data-flip", "true");
      }
    }
  }, []);

  useEffect(() => {
    if (open) place();
  }, [open, place]);

  // Escape closes, and so does anything happening elsewhere on the page.
  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => {
      if (e.key === "Escape") {
        clear();
        setOpen(false);
      }
    };
    const onDown = (e) => {
      if (!wrapRef.current?.contains(e.target)) {
        clear();
        setOpen(false);
      }
    };
    window.addEventListener("keydown", onKey);
    window.addEventListener("pointerdown", onDown);
    window.addEventListener("scroll", place, { passive: true });
    window.addEventListener("resize", place);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("pointerdown", onDown);
      window.removeEventListener("scroll", place);
      window.removeEventListener("resize", place);
    };
  }, [open, place]);


  const span = (a, b) => `${label(a)} - ${b ? label(b) : "Present"} · ${tenure(a, b)}`;
  const period = span(role.start, role.end);
  // A grouped entry (one company, several positions) leads with the company and
  // the full span, then lists the positions. A single-role entry leads with the
  // job title. That is how LinkedIn holds both shapes, and it is the honest
  // reading either way.
  const grouped = Array.isArray(role.positions) && role.positions.length > 0;

  return (
    <span
      className="role"
      ref={wrapRef}
      onPointerEnter={(e) => e.pointerType !== "touch" && show()}
      onPointerLeave={(e) => e.pointerType !== "touch" && hide()}
    >
      <button
        type="button"
        className="role__trigger"
        aria-expanded={open}
        onClick={() => {
          clear();
          setOpen((v) => !v);
        }}
        onFocus={show}
        onBlur={hide}
      >
        {/* --shine-i staggers the sweep start per name (annotation msbgc21j),
            so the three shimmers read as ONE band crossing the line left to
            right instead of three independent glints. */}
        {/* --shiny-band is what hello.css paints the travelling band with; the
            pair is set as two vars and the dark-theme rule picks the other one,
            so one element carries both and no JS reads the theme. */}
        <AnimatedShinyText
          shimmerWidth={32}
          style={{
            "--shine-i": shineIndex,
            ...(shine ? { "--brand-shine": shine.light, "--brand-shine-dark": shine.dark } : {}),
          }}
        >
          {children}
        </AnimatedShinyText>
      </button>

      {/* A disclosure, not a dialog. role="dialog" tells assistive tech this is a
          window that owns focus; nothing here moves focus into it, there is no
          close control and no focus return, and aria-controls is only honoured
          by JAWS. What this actually is — a button with aria-expanded and the
          panel as the next node — is exactly a disclosure, and saying so is
          both truthful and less work for the reader. */}
      <span className="role__panel" id={id} data-open={open ? "true" : undefined} ref={panelRef}>
        <span className="role__head">
          <span className="role__logo" style={{ background: role.logoBg }} aria-hidden>
            {role.logoWordmark}
          </span>
          <span className="role__id">
            <strong className="role__title">{grouped ? role.company : role.title}</strong>
            <span className="role__org">
              {grouped ? role.type : `${role.company} · ${role.type}`}
            </span>
            <span className="role__meta">{period}</span>
            <span className="role__meta">
              {[role.location, role.arrangement].filter(Boolean).join(" · ")}
            </span>
          </span>
        </span>

        {grouped && (
          <ol className="role__positions">
            {role.positions.map((p, i) => (
              <li key={i}>
                <span className="role__pos-title">{p.title}</span>
                <span className="role__meta">{span(p.start, p.end)}</span>
              </li>
            ))}
          </ol>
        )}

        <span className="role__headline">{role.headline}</span>

        <ul className="role__bullets">
          {role.bullets.map((b, i) => (
            <li key={i}>{b}</li>
          ))}
        </ul>

        {role.media?.length > 0 && (
          <span className="role__media">
            {role.media.map((m, i) =>
              m.src ? (
                <img key={i} src={m.src} alt={m.alt || m.title || ""} loading="lazy" />
              ) : (
                // the thumbnail is missing but the title is the information
                <span className="role__media-title" key={i}>
                  {m.title}
                </span>
              ),
            )}
            {role.mediaMore ? (
              <span className="role__media-more">{`+${role.mediaMore} more`}</span>
            ) : null}
          </span>
        )}
      </span>
    </span>
  );
}
