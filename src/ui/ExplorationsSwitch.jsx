// "Explorations" variant picker in the eye menu (shown on the Scheduled Delivery case study). Clone of HeroSwitch.
// Original = the chip board alone; Detour = the hand-drawn copy mounted after it (ui/explorationsVariant.js).
import { useEffect, useRef, useState } from "react";
import { EXPLORATION_VARIANTS, setExplorationsVariant, useExplorationsVariant } from "./explorationsVariant";
import "./fontSwitch.css";

export default function ExplorationsSwitch({ i = 0, feedback }) {
  const [open, setOpen] = useState(false);
  const cur = useExplorationsVariant();
  const wrapRef = useRef(null);
  const btnRef = useRef(null);
  const itemRefs = useRef([]);

  useEffect(() => {
    if (!open) return undefined;
    const onDown = (e) => { if (!wrapRef.current?.contains(e.target)) setOpen(false); };
    const onKey = (e) => { if (e.key === "Escape") { setOpen(false); btnRef.current?.focus(); } };
    document.addEventListener("pointerdown", onDown);
    document.addEventListener("keydown", onKey);
    return () => { document.removeEventListener("pointerdown", onDown); document.removeEventListener("keydown", onKey); };
  }, [open]);
  useEffect(() => {
    if (open) itemRefs.current[Math.max(0, EXPLORATION_VARIANTS.findIndex((v) => v.id === cur))]?.focus();
  }, [open]); // eslint-disable-line react-hooks/exhaustive-deps

  const onMenuKey = (e) => {
    if (e.key === "Tab") { setOpen(false); return; }
    if (!["ArrowDown", "ArrowUp", "Home", "End"].includes(e.key)) return;
    e.preventDefault();
    const n = EXPLORATION_VARIANTS.length, at = itemRefs.current.indexOf(document.activeElement);
    const to = e.key === "Home" ? 0 : e.key === "End" ? n - 1 : (at + (e.key === "ArrowDown" ? 1 : -1) + n) % n;
    itemRefs.current[to]?.focus();
  };

  return (
    <span className="font-ctl__wrap" ref={wrapRef} style={{ "--i": i }}>
      <button
        ref={btnRef}
        type="button"
        className="theme-toggle font-ctl"
        data-tip={open ? undefined : true}
        aria-label={`Explorations: ${cur}`}
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => { feedback?.("toggle"); setOpen((o) => !o); }}
        onKeyDown={(e) => { if (e.key === "ArrowDown" && !open) { e.preventDefault(); setOpen(true); } }}
      >
        <span className="font-ctl__aa" aria-hidden="true">{cur === "detour" ? "D" : "O"}</span>
      </button>
      {open && (
        <span className="font-ctl__menu" role="menu" aria-label="Explorations" onKeyDown={onMenuKey}>
          <span role="group" aria-label="Explorations" className="font-ctl__group">
            <span className="font-ctl__glabel" aria-hidden="true">Explorations</span>
            {EXPLORATION_VARIANTS.map((v, n) => {
              const on = v.id === cur;
              return (
                <button
                  key={v.id}
                  ref={(el) => (itemRefs.current[n] = el)}
                  type="button"
                  role="menuitemradio"
                  aria-checked={on}
                  className="font-ctl__item"
                  tabIndex={on ? 0 : -1}
                  onClick={() => { feedback?.("select"); setExplorationsVariant(v.id); setOpen(false); btnRef.current?.focus(); }}
                >
                  <span style={{ whiteSpace: "nowrap" }}>{v.label} <span style={{ opacity: 0.55 }}>· {v.note}</span></span>
                  {on && <span className="font-ctl__check" aria-hidden="true">{"✓"}</span>}
                </button>
              );
            })}
          </span>
        </span>
      )}
    </span>
  );
}
