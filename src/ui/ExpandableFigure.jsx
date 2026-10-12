// A <figure> that can open full page (mv56ku8l, 12 Oct 2026). Drop-in for
// <figure className="article__figure">: renders the same element, and once its
// content has settled adds the site's glass expand button (the one the replay and
// Open-in-Figma controls use) in the bottom right corner. One mechanism for every
// image / diagram figure: the overlay (ui/PhoneLightbox) shows a zoomed copy.
//
// Eligible: holds a picture or a vector diagram at least 140 x 80, and nothing
// that has to stay live: no iframe, canvas, video, form control, the reach
// explorer, the whiteboard (it has its own lightbox) or a ScrollPhone (it opens
// itself). A copy has no event handlers, so those are skipped on purpose.
// Add data-exp-skip to any element to keep its figure out.
import { useEffect, useRef, useState } from "react";
import { Expand as IconExpand } from "iconoir-react";
import PhoneLightbox, { collectExpandables } from "./PhoneLightbox";
import { feedback } from "./feedback";
import { IPHONE_FRAME_SRC } from "../figures/ds/IphoneFrame";

const LIVE = "iframe, canvas, video:not([data-exp-ok]), input, select, textarea, .rex, .wb, .sp, [data-exp-skip], figure[data-exp]";

export default function ExpandableFigure({ children, ...rest }) {
  const ref = useRef(null);
  const [ok, setOk] = useState(false);
  const [lb, setLb] = useState(null);
  useEffect(() => {
    const el = ref.current; if (!el) return undefined;
    let t = 0;
    const check = () => {
      t = 0;
      const r = el.getBoundingClientRect();
      const pic = [...el.querySelectorAll("img, svg, video[data-exp-ok]")].some((n) => { if (n.closest(".exp__btn")) return false; const b = n.getBoundingClientRect(); return b.width >= 140 && b.height >= 80; });
      setOk(r.width >= 200 && r.height >= 100 && pic && !el.querySelector(LIVE));
    };
    const later = () => { if (!t) t = window.setTimeout(check, 250); };
    check();
    const mo = new MutationObserver(later);
    mo.observe(el, { childList: true, subtree: true, attributes: true, attributeFilter: ["data-exp", "src"] });
    window.addEventListener("load", later);
    return () => { mo.disconnect(); window.removeEventListener("load", later); clearTimeout(t); };
  }, []);
  const open = (e) => {
    e.stopPropagation();
    feedback("select");
    const items = collectExpandables();
    setLb({ items, start: Math.max(0, items.findIndex((it) => it.el === ref.current)) });
  };
  return (
    <figure ref={ref} data-exp={ok ? "1" : undefined} {...rest}>
      {children}
      {ok && (
        <button type="button" className="article__hero-replay exp__btn" onClick={open} aria-label="Open this figure full page" title="Click to expand" aria-haspopup="dialog">
          <IconExpand width={16} height={16} strokeWidth={1.6} aria-hidden="true" />
        </button>
      )}
      {lb && (
        <PhoneLightbox items={lb.items} start={lb.start} frame={IPHONE_FRAME_SRC}
          onClose={(idx) => { const el = lb.items[idx].el; setLb(null); if (idx !== lb.start) el?.scrollIntoView({ block: "center" }); }} />
      )}
    </figure>
  );
}
