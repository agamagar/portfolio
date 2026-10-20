// Phone / tablet section index (< 1100px, where the rail is hidden): a glass pill
// "Section · n/N" fixed top-centre that opens a bottom sheet of sections.
// Picking closes the sheet and scrolls (instant under prefers-reduced-motion).
import { useEffect, useRef, useState } from "react";
import "./caseIndexSheet.css";

const reduced = () =>
  typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

export function jumpToSection(i) {
  const el = document.getElementById(`sec-${i}`);
  if (el) el.scrollIntoView({ behavior: reduced() ? "auto" : "smooth", block: "start" });
}

export default function CaseIndexSheet({ entries, active }) {
  const [open, setOpen] = useState(false);
  const [shown, setShown] = useState(false);
  const btn = useRef(null);
  const sheet = useRef(null);

  // the pill appears once the reader is past the hero
  useEffect(() => {
    const on = () => setShown(window.scrollY > Math.min(420, window.innerHeight * 0.5));
    on();
    window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, []);

  useEffect(() => {
    if (!open) return;
    const prev = document.documentElement.style.overflow;
    document.documentElement.style.overflow = "hidden";
    const cur = sheet.current?.querySelector("[aria-current]") || sheet.current?.querySelector("button");
    cur?.focus();
    cur?.scrollIntoView({ block: "center" });
    const key = (e) => {
      if (e.key === "Escape") { setOpen(false); btn.current?.focus(); return; }
      if (e.key !== "Tab") return;
      const f = [...sheet.current.querySelectorAll("button")];
      if (!f.length) return;
      const first = f[0], last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    };
    document.addEventListener("keydown", key);
    return () => {
      document.documentElement.style.overflow = prev;
      document.removeEventListener("keydown", key);
    };
  }, [open]);

  if (!entries.length) return null;
  const pos = Math.max(0, entries.findIndex((e) => e.i === active));
  const cur = entries[pos];
  const pick = (i) => {
    setOpen(false);
    // let the scroll lock release first, then move
    requestAnimationFrame(() => { jumpToSection(i); btn.current?.focus({ preventScroll: true }); });
  };
  let lastGroup = null;
  return (
    <div className="cis">
      <button
        ref={btn}
        type="button"
        className={"cis__pill" + (shown || open ? " is-shown" : "")}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-label={`Sections: ${cur.label}, ${pos + 1} of ${entries.length}. Open index`}
        tabIndex={shown || open ? 0 : -1}
        onClick={() => setOpen(true)}
      >
        <span className="cis__name">{cur.label}</span>
        <span className="cis__count">{pos + 1}/{entries.length}</span>
      </button>
      {open && (
        <div className="cis__layer">
          <div className="cis__scrim" onClick={() => { setOpen(false); btn.current?.focus(); }} />
          <div ref={sheet} className="cis__sheet" role="dialog" aria-modal="true" aria-label="Sections">
            <div className="cis__grab" aria-hidden="true" />
            <ul>
              {entries.map((e) => {
                const head = e.group && e.group !== lastGroup ? e.group : null;
                lastGroup = e.group || lastGroup;
                return (
                  <li key={e.i}>
                    {head && <span className="cis__group">{head}</span>}
                    <button
                      type="button"
                      className={e.i === active ? "is-active" : undefined}
                      aria-current={e.i === active ? "location" : undefined}
                      onClick={() => pick(e.i)}
                    >
                      {e.label}
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
