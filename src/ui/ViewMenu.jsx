// The eye bubble at the bottom-left: "View options". It holds every top-right control except
// theme and sound (the Aa font switcher, the view-mode control, the room's Look/Outside), mounted
// only while the panel is open. Rendered inside App's .top-controls so their glass styles apply;
// .view-menu itself is fixed to the viewport corner (viewMenu.css).
import { useEffect, useRef, useState } from "react";
import { Eye } from "iconoir-react";
import "./viewMenu.css";

export default function ViewMenu({ feedback, children }) {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef(null);
  const btnRef = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    const onDown = (e) => { if (!wrapRef.current?.contains(e.target)) setOpen(false); };
    const onKey = (e) => {
      if (e.key !== "Escape") return;
      // a control's own dropdown is open: its Escape closes just that one
      if (wrapRef.current?.querySelector('.view-menu__panel [aria-expanded="true"]')) return;
      setOpen(false);
      btnRef.current?.focus();
    };
    document.addEventListener("pointerdown", onDown);
    document.addEventListener("keydown", onKey);
    return () => { document.removeEventListener("pointerdown", onDown); document.removeEventListener("keydown", onKey); };
  }, [open]);

  useEffect(() => { // focus moves to the first control on open
    if (open) wrapRef.current?.querySelector(".view-menu__panel button")?.focus();
  }, [open]);

  return (
    <span className="view-menu" ref={wrapRef} data-dev={import.meta.env.DEV ? "" : undefined}>
      <button
        ref={btnRef}
        type="button"
        className="theme-toggle view-menu__btn"
        data-tip={open ? undefined : true}
        aria-label="View options"
        aria-haspopup="true"
        aria-expanded={open}
        aria-controls="view-menu-panel"
        onClick={() => { feedback?.("toggle"); setOpen((o) => !o); }}
      >
        <Eye width={15} height={15} strokeWidth={2} aria-hidden />
      </button>
      {open && <div className="view-menu__panel" id="view-menu-panel" role="group" aria-label="View options">{children}</div>}
    </span>
  );
}
