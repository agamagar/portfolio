// THE section index. Every page with section navigation uses it: case studies, the PRD
// pages, the lab, /system. Desktop (>= 1100px): a fixed rail with ONE continuous grey
// line, grouped labels and a 12px frosted glass pill (a purple line inside, violet light
// dispersing) that slides to the active entry. Phone / tablet: a "Section · n/N" glass
// pill that opens a bottom sheet of the same entries.
//
//   <SectionIndex entries={[{ key, label, group? }]} active={key} onPick={(key) => ...} />
//
// Pages with a custom rail body (the PRD's collapsible groups) use the pieces:
//   useIndexPill(ref, deps), <IndexSlider />, <IndexSheet />.
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import "./sectionIndex.css";

const reduced = () =>
  typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

// default pick: smooth-scroll to the element with this id (instant under reduced motion)
export function scrollToId(id) {
  const el = document.getElementById(id);
  if (el) el.scrollIntoView({ behavior: reduced() ? "auto" : "smooth", block: "start" });
}

// consecutive entries sharing a `group` collapse into one block
export function groupEntries(entries) {
  return entries.reduce((acc, e) => {
    const last = acc[acc.length - 1];
    if (e.group && last && last.group === e.group) last.items.push(e);
    else acc.push({ group: e.group || null, items: [e] });
    return acc;
  }, []);
}

// Positions the glass pill behind the rail's `a.is-active` and keeps that entry in view.
export function useIndexPill(ref, deps) {
  const place = () => {
    const nav = ref.current;
    // the entries live in the rail's own list; the case's Design / PRD tabs sit in the rail's top block and carry
    // is-active too, and the pill followed them on the Away case (found with mvnr1knd, 25 Oct)
    const a = nav?.querySelector(":scope > ul a.is-active");
    if (!nav || !a) return;
    const n = nav.getBoundingClientRect(), r = a.getBoundingClientRect();
    nav.style.setProperty("--pill-y", `${(r.top - n.top + nav.scrollTop).toFixed(1)}px`);
    nav.style.setProperty("--pill-h", `${r.height.toFixed(1)}px`);
    nav.dataset.pill = "on";
    if (nav.scrollHeight > nav.clientHeight) {
      if (r.top < n.top + 24) nav.scrollTop -= n.top + 24 - r.top;
      else if (r.bottom > n.bottom - 24) nav.scrollTop += r.bottom - (n.bottom - 24);
    }
  };
  useLayoutEffect(() => {
    place();
    window.addEventListener("resize", place);
    return () => window.removeEventListener("resize", place);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
  useClearOfControls(ref);
}

// 76.1 (25 Oct): the bottom-left controls (the eye and Replay, the case's Design / PRD tabs, and in dev Inspect, the
// palette, QA and Agentation) stack in a column under the fixed rail's lower entries and covered their first letters.
// The rail ends above the highest of them instead, and scrolls inside, as it already does when it runs out of room.
// Only while the rail is fixed (>= 1100px); controls mount late or grow (Replay), so it re-fits on their resize.
const LEFT_CONTROLS = ".view-menu, .article__index-tabs, .cs-tabs--circles, .pal__btn, button[aria-label^='Inspect'], .qa-circle, [data-agentation-toolbar]";
const CLEAR_GAP = 12;
function useClearOfControls(ref) {
  useEffect(() => {
    const nav = ref.current;
    if (!nav) return undefined;
    let raf = 0;
    const ro = new ResizeObserver(() => { if (!raf) raf = requestAnimationFrame(fit); });
    function fit() {
      raf = 0;
      nav.style.maxHeight = "";
      if (getComputedStyle(nav).position !== "fixed") return;
      const n = nav.getBoundingClientRect();
      let top = Infinity;
      for (const el of document.querySelectorAll(LEFT_CONTROLS)) {
        ro.observe(el);
        const r = el.getBoundingClientRect();
        if (r.width < 2 || r.height < 2 || r.right <= n.left || r.left >= n.right || r.top <= n.top) continue;
        top = Math.min(top, r.top);
      }
      const css = parseFloat(getComputedStyle(nav).maxHeight);
      const room = Math.floor(top - CLEAR_GAP - n.top);
      if (room < (Number.isNaN(css) ? Infinity : css)) nav.style.maxHeight = `${Math.max(120, room)}px`;
    }
    const later = [0, 600, 2000, 5000].map((ms) => setTimeout(fit, ms));
    // dev tools (Agentation) portal into <body> whenever their lazy chunk lands
    const mo = new MutationObserver(() => { if (!raf) raf = requestAnimationFrame(fit); });
    mo.observe(document.body, { childList: true });
    window.addEventListener("resize", fit);
    return () => {
      later.forEach(clearTimeout);
      cancelAnimationFrame(raf);
      ro.disconnect();
      mo.disconnect();
      window.removeEventListener("resize", fit);
      nav.style.maxHeight = "";
    };
  }, [ref]);
}

export function IndexSlider() {
  return (
    <span className="article__index-slider" aria-hidden="true">
      <i className="article__index-glow" />
      <i className="article__index-glass" />
    </span>
  );
}

export default function SectionIndex({
  entries,
  active,
  onPick,
  label = "Sections",
  top = null, // a block above the list (Back link, tabs)
  className = "",
  sheet = true,
}) {
  const ref = useRef(null);
  const pick = onPick || ((k) => scrollToId(String(k)));
  useIndexPill(ref, [active, entries]);
  return (
    <>
      <nav className={`article__index article__index--spy ${className}`.trim()} aria-label={label} ref={ref}>
        <IndexSlider />
        {top}
        <ul>
          {groupEntries(entries).map((g, gi) => {
            const link = (e) => (
              <li key={e.key}>
                <a
                  href={`#${e.key}`}
                  className={e.key === active ? "is-active" : undefined}
                  aria-current={e.key === active ? "location" : undefined}
                  onClick={(ev) => { ev.preventDefault(); pick(e.key); }}
                >
                  {e.label}
                </a>
              </li>
            );
            return g.group ? (
              <li className="article__index-group" key={`g-${gi}`}>
                <span className="article__index-group-head">{g.group}</span>
                <ul className="article__index-group-list">{g.items.map(link)}</ul>
              </li>
            ) : (
              link(g.items[0])
            );
          })}
        </ul>
      </nav>
      {sheet && <IndexSheet entries={entries} active={active} onPick={pick} />}
    </>
  );
}

// Phone / tablet: a glass pill (top-centre, after the hero) that opens a bottom sheet.
export function IndexSheet({ entries, active, onPick }) {
  const [open, setOpen] = useState(false);
  const [shown, setShown] = useState(false);
  const btn = useRef(null);
  const sheet = useRef(null);

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
  const pos = Math.max(0, entries.findIndex((e) => e.key === active));
  const cur = entries[pos];
  const choose = (k) => {
    setOpen(false);
    // let the scroll lock release first, then move
    requestAnimationFrame(() => { onPick(k); btn.current?.focus({ preventScroll: true }); });
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
                  <li key={e.key}>
                    {head && <span className="cis__group">{head}</span>}
                    <button
                      type="button"
                      className={e.key === active ? "is-active" : undefined}
                      aria-current={e.key === active ? "location" : undefined}
                      onClick={() => choose(e.key)}
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

// Scroll-spy for pages whose sections are plain element ids: which id is in view.
export function useScrollSpyIds(ids, rootMargin = "-12% 0px -75% 0px") {
  const [active, setActive] = useState(ids[0]);
  const key = ids.join("|");
  useEffect(() => {
    const els = ids.map((id) => document.getElementById(id)).filter(Boolean);
    if (!els.length) return;
    const io = new IntersectionObserver(
      (es) => { es.forEach((e) => { if (e.isIntersecting) setActive(e.target.id); }); },
      { rootMargin }
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, rootMargin]);
  return active;
}
