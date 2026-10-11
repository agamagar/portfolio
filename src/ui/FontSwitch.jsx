// The "Aa" bubble in the top controls: opens a small glass menu to switch the site-wide
// serif (lib/serifFont.js). Same menu pattern as SceneControls' Look menu: role="menu",
// menuitemradio, Esc and an outside press close it, focus returns to the bubble.
import { useEffect, useRef, useState } from "react";
import { SERIFS, getSerif, setSerif, subscribeSerif, getHero, setHero, subscribeHero } from "../lib/serifFont";

const HERO_OPTS = [{ id: "default", label: "Default", stack: null }, ...SERIFS];
const ROWS = [...SERIFS.map((s) => ({ ...s, group: "serif" })), ...HERO_OPTS.map((s) => ({ ...s, group: "hero" }))];
import "./fontSwitch.css";

export default function FontSwitch({ i = 0, feedback }) {
  const [open, setOpen] = useState(false);
  const [cur, setCur] = useState(getSerif);
  const [hero, setHeroState] = useState(getHero);
  const wrapRef = useRef(null);
  const btnRef = useRef(null);
  const itemRefs = useRef([]);

  useEffect(() => subscribeSerif(setCur), []);
  useEffect(() => subscribeHero(setHeroState), []);
  useEffect(() => {
    if (!open) return undefined;
    const onDown = (e) => { if (!wrapRef.current?.contains(e.target)) setOpen(false); };
    const onKey = (e) => {
      if (e.key === "Escape") { setOpen(false); btnRef.current?.focus(); }
    };
    document.addEventListener("pointerdown", onDown);
    document.addEventListener("keydown", onKey);
    return () => { document.removeEventListener("pointerdown", onDown); document.removeEventListener("keydown", onKey); };
  }, [open]);
  useEffect(() => { // focus the checked item on open
    if (open) itemRefs.current[Math.max(0, ROWS.findIndex((s) => s.group === "serif" && s.id === cur))]?.focus();
  }, [open]); // eslint-disable-line react-hooks/exhaustive-deps

  const onMenuKey = (e) => {
    const k = e.key;
    if (!["ArrowDown", "ArrowUp", "Home", "End", "Tab"].includes(k)) return;
    if (k === "Tab") { setOpen(false); return; }
    e.preventDefault();
    const at = itemRefs.current.indexOf(document.activeElement);
    const n = ROWS.length;
    const to = k === "Home" ? 0 : k === "End" ? n - 1 : (at + (k === "ArrowDown" ? 1 : -1) + n) % n;
    itemRefs.current[to]?.focus();
  };

  return (
    <span className="font-ctl__wrap" ref={wrapRef} style={{ "--i": i }}>
      <button
        ref={btnRef}
        type="button"
        className="theme-toggle font-ctl"
        data-tip={open ? undefined : true}
        aria-label="Serif font"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => { feedback?.("toggle"); setOpen((o) => !o); }}
        onKeyDown={(e) => { if (e.key === "ArrowDown" && !open) { e.preventDefault(); setOpen(true); } }}
      >
        <span className="font-ctl__aa" aria-hidden="true">Aa</span>
      </button>
      {open && (
        <span className="font-ctl__menu" role="menu" aria-label="Serif font" onKeyDown={onMenuKey}>
          {["serif", "hero"].map((g) => (
            <span key={g} role="group" aria-label={g === "serif" ? "Site serif" : "Heading"} className="font-ctl__group">
              <span className="font-ctl__glabel" aria-hidden="true">{g === "serif" ? "Site serif" : "Heading"}</span>
              {ROWS.map((s, n) => {
                if (s.group !== g) return null;
                const on = g === "serif" ? s.id === cur : s.id === hero;
                return (
                  <button
                    key={g + s.id}
                    ref={(el) => (itemRefs.current[n] = el)}
                    type="button"
                    role="menuitemradio"
                    aria-checked={on}
                    className="font-ctl__item"
                    style={s.stack ? { fontFamily: s.stack } : undefined}
                    tabIndex={g === "serif" && on ? 0 : -1}
                    onClick={() => { feedback?.("select"); (g === "serif" ? setSerif : setHero)(s.id); setOpen(false); btnRef.current?.focus(); }}
                  >
                    <span>{s.label}</span>
                    {on && <span className="font-ctl__check" aria-hidden="true">{"\u2713"}</span>}
                  </button>
                );
              })}
            </span>
          ))}
        </span>
      )}
    </span>
  );
}
