// Full-page view for the Scheduled Delivery figures (mv54coar, mv56ku8l, 12 Oct
// 2026). Two kinds of item share one overlay:
//   "phone": a ScrollPhone card. The phone lifts out of the card to centre stage
//            (FLIP) inside the card's own lavender plate, grown to the viewport,
//            and the screen inside scrolls on its own.
//   "clone": any other image / diagram figure (ExpandableFigure). A copy of the
//            figure's DOM, laid out at its own width inside copies of its
//            ancestors (so the article's descendant selectors still style it) and
//            enlarged with CSS zoom, which re-rasterises rather than stretches:
//            images are shown up to their natural resolution, vector diagrams
//            stay crisp. Tall figures scroll inside the overlay.
// Both fly from their place in the page and back (FLIP, one curve, one clock),
// next / previous (buttons, arrow keys) steps across every item on the page.
//
// Accessibility: role="dialog" aria-modal, focus moves in and is trapped on
// Tab / Shift+Tab, Esc / backdrop / close dismiss and focus returns to the
// opener, the page behind is locked (Lenis stopped, body overflow hidden, via
// lockBackgroundScroll), scrollers carry data-lenis-prevent. Reduced motion: a
// plain fade, no movement.
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { lockBackgroundScroll } from "./smoothScroll";
import { feedback } from "./feedback";
import "./phoneLightbox.css";

const EASE = "cubic-bezier(0.2, 0.8, 0.2, 1)";
const reduced = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const cardBox = (r) => ({ left: r.left + "px", top: r.top + "px", right: window.innerWidth - r.right + "px", bottom: window.innerHeight - r.bottom + "px", borderRadius: "12px" });
const FULL = { left: 12, top: 12, right: 0, bottom: 0 };

// every expandable thing on the page, in document order
export function collectExpandables() {
  const nodes = [...document.querySelectorAll(".sp[data-expand], figure[data-exp]")];
  return nodes.map((el) => el.classList.contains("sp")
    ? { kind: "phone", el, src: el.querySelector(".sp__screen img")?.getAttribute("src"), caption: el.closest("figure")?.querySelector("figcaption")?.textContent?.trim() || "", label: "Phone screen" }
    : { kind: "clone", el, label: el.querySelector("figcaption")?.textContent?.trim() || "Figure" });
}

// the copy of a figure, wrapped in copies of its ancestors
function buildClone(el) {
  const fig = el.cloneNode(true);
  fig.querySelectorAll(".exp__btn, script, iframe, canvas, video:not([data-exp-ok])").forEach((n) => n.remove());
  fig.querySelectorAll("[id]").forEach((n) => n.removeAttribute("id"));
  fig.querySelectorAll("img").forEach((n) => { n.removeAttribute("loading"); n.loading = "eager"; n.removeAttribute("srcset"); });
  // scroll-driven scenes (.sscene) keep their layers in whatever scroll state the page was last in
  // (shifted, half faded): the copy shows them at rest, as the plate was drawn
  fig.querySelectorAll(".sscene *").forEach((n) => { if (n.style.transform) n.style.transform = "none"; if (n.style.opacity) n.style.opacity = "1"; });
  fig.querySelectorAll("video[data-exp-ok]").forEach((v) => { v.muted = true; v.loop = true; v.play().catch(() => {}); });
  fig.removeAttribute("data-exp"); fig.setAttribute("inert", ""); fig.style.margin = "0";
  let node = fig;
  for (let a = el.parentElement, d = 0; a && a !== document.body && d < 10; a = a.parentElement, d++) {
    const w = document.createElement(a.tagName.toLowerCase() === "article" ? "article" : "div");
    w.className = a.className;
    for (const at of a.attributes) if (at.name.startsWith("data-") && at.name !== "data-lenis-prevent") w.setAttribute(at.name, at.value);
    // neutral boxes: the ancestors lend their classes (for selectors), not their layout
    w.style.cssText = "display:block;position:static;width:auto;max-width:none;min-width:0;margin:0;padding:0;border:0;background:none;box-shadow:none;transform:none;opacity:1;overflow:visible;grid-template-columns:none;aspect-ratio:auto;height:auto;min-height:0;filter:none;backdrop-filter:none";
    w.appendChild(node); node = w;
  }
  return { root: node, fig };
}

function CloneBody({ item, onReady }) {
  const host = useRef(null);
  useLayoutEffect(() => {
    const el = host.current; if (!el) return;
    const src = item.el.getBoundingClientRect();
    const { root, fig } = buildClone(item.el);
    el.replaceChildren(root);
    el.style.width = Math.round(src.width) + "px";
    // the zoom: fit the viewport, never past the pictures' natural size, never past 3x
    const vw = window.innerWidth, vh = window.innerHeight;
    const availW = vw - 56, availH = vh - 56;
    let k = availW / src.width;
    const tall = src.height / src.width > 1.3;
    if (!tall) k = Math.min(k, availH / src.height);
    for (const im of item.el.querySelectorAll("img")) {
      const r = im.getBoundingClientRect();
      if (r.width > 100 && im.naturalWidth) k = Math.min(k, Math.max(1, im.naturalWidth / r.width));
    }
    k = Math.max(0.5, Math.min(3, k));
    el.style.zoom = k;
    onReady(fig, k);
  }, [item]); // eslint-disable-line react-hooks/exhaustive-deps
  return <div className="pl__clonein" ref={host} />;
}

export default function PhoneLightbox({ items, start, frame, onClose }) {
  const [i, setI] = useState(start);
  const root = useRef(null);
  const dim = useRef(null);
  const frameEl = useRef(null);
  const capEl = useRef(null);
  const phone = useRef(null);
  const screen = useRef(null);
  const figRef = useRef(null);
  const closing = useRef(false);
  const item = items[i];
  const clone = item.kind === "clone";

  useEffect(() => lockBackgroundScroll(), []);

  // the rect an item flies from / to: only if it is on screen and not taller than the screen
  const srcRect = useCallback((idx) => {
    const it = items[idx];
    const el = it?.kind === "phone" ? it.el.querySelector(".sp__phone") : it?.el;
    if (!el) return null;
    const r = el.getBoundingClientRect(), vh = window.innerHeight;
    return r.width && r.bottom > 0 && r.top < vh && r.height < vh * 1.15 ? r : null;
  }, [items]);
  // the moving element's own target rect (the figure inside the clone box, or the phone)
  const dstRect = () => (clone ? figRef.current?.getBoundingClientRect() : phone.current?.getBoundingClientRect());
  const flip = (from, to, k, dur, reverse) => {
    const ph = phone.current;
    if (clone) { const b = ph.getBoundingClientRect(), f = figRef.current.getBoundingClientRect(); ph.style.transformOrigin = `${f.left - b.left}px ${f.top - b.top}px`; }
    const origin = clone ? ph.style.transformOrigin : "0 0";
    const a = { transformOrigin: origin, transform: "none" };
    const b = { transformOrigin: origin, transform: `translate(${from.left - to.left}px, ${from.top - to.top}px) scale(${k})` };
    return ph.animate(reverse ? [a, b] : [b, a], { duration: dur, easing: EASE, fill: reverse ? "forwards" : "backwards" });
  };

  // open
  const [ready, setReady] = useState(!clone);
  const opened = useRef(false);
  useLayoutEffect(() => {
    if (!ready || opened.current) return;
    opened.current = true;
    const ph = phone.current, bg = dim.current, fr = frameEl.current;
    if (!ph || !bg) return;
    const from = srcRect(start);
    bg.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 260, easing: "ease-out", fill: "backwards" });
    if (reduced() || !from) {
      ph.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 220, easing: "ease-out", fill: "backwards" });
      fr.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 220, easing: "ease-out", fill: "backwards" });
      return;
    }
    const to = dstRect();
    fr.animate([cardBox(items[start].el.getBoundingClientRect()), { left: "12px", top: "12px", right: "12px", bottom: "12px", borderRadius: "20px" }], { duration: 460, easing: EASE, fill: "backwards" });
    flip(from, to, from.width / to.width, 460, false);
    capEl.current?.animate([{ opacity: 0 }, { opacity: 0, offset: 0.6 }, { opacity: 1 }], { duration: 460, easing: "linear", fill: "backwards" });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready]);

  const close = useCallback(() => {
    if (closing.current) return;
    closing.current = true;
    const ph = phone.current, bg = dim.current, fr = frameEl.current;
    const to = i === start ? srcRect(i) : null; // a different item may be far off screen: fade, then bring it into view
    const done = () => onClose(i);
    const fade = bg.animate([{ opacity: 1 }, { opacity: 0 }], { duration: reduced() || !to ? 220 : 380, easing: "ease-in", fill: "forwards" });
    if (reduced() || !to) {
      (ph || fr).animate([{ opacity: 1 }, { opacity: 0 }], { duration: 200, fill: "forwards" });
      fr.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 200, fill: "forwards" });
      fade.onfinish = done;
      return;
    }
    fr.animate([{ ...cardBox({ left: 12, top: 12, right: window.innerWidth - 12, bottom: window.innerHeight - 12 }), borderRadius: "20px" }, cardBox(items[i].el.getBoundingClientRect())], { duration: 380, easing: EASE, fill: "forwards" });
    capEl.current?.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 160, fill: "forwards" });
    const from = dstRect();
    flip(to, from, to.width / from.width, 380, true).onfinish = done;
  }, [i, start, onClose, srcRect, items]); // eslint-disable-line react-hooks/exhaustive-deps

  const go = useCallback((d) => {
    if (items.length < 2) return;
    feedback("navigate");
    setReady(items[(i + d + items.length) % items.length].kind === "phone");
    setI((n) => (n + d + items.length) % items.length);
  }, [items, i]);

  // keys + focus trap
  useEffect(() => {
    const opener = document.activeElement;
    const focusables = () => [...root.current.querySelectorAll("button, [tabindex='0']")].filter((e) => !e.disabled && e.getClientRects().length > 0);
    root.current.querySelector(".pl__close")?.focus();
    const onKey = (e) => {
      const inScroller = e.target.closest?.(".pl__screen, .pl__scroller");
      if (e.key === "Escape") { e.preventDefault(); close(); }
      else if (e.key === "ArrowRight" && !inScroller) go(1);
      else if (e.key === "ArrowLeft" && !inScroller) go(-1);
      else if (e.key === "Tab") {
        const f = focusables(); if (!f.length) return;
        const first = f[0], last = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
        else if (!root.current.contains(document.activeElement)) { e.preventDefault(); first.focus(); }
      }
    };
    document.addEventListener("keydown", onKey);
    return () => { document.removeEventListener("keydown", onKey); opener?.focus?.({ preventScroll: true }); };
  }, [close, go]);

  // switching items: the new one starts at its top
  useEffect(() => { if (screen.current) screen.current.scrollTop = 0; root.current?.querySelector(".pl__scroller")?.scrollTo(0, 0); }, [i]);

  const showCap = !clone && item.caption;
  return createPortal(
    <div className="pl" ref={root} role="dialog" aria-modal="true" aria-label={item.label || "Expanded view"} onClick={close}>
      <div className="pl__dim" ref={dim} aria-hidden="true" />
      <div className={"pl__frame" + (clone ? " pl__frame--plain" : "")} ref={frameEl} aria-hidden="true" />
      <button type="button" className="pl__close" onClick={(e) => { e.stopPropagation(); close(); }} aria-label="Close">
        <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M6 6l12 12M18 6L6 18" /></svg>
      </button>
      {items.length > 1 && (
        <>
          <button type="button" className="pl__nav pl__nav--prev" onClick={(e) => { e.stopPropagation(); go(-1); }} aria-label="Previous">
            <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 5l-7 7 7 7" /></svg>
          </button>
          <button type="button" className="pl__nav pl__nav--next" onClick={(e) => { e.stopPropagation(); go(1); }} aria-label="Next">
            <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 5l7 7-7 7" /></svg>
          </button>
          <p className="pl__count" aria-live="polite">{i + 1} / {items.length}</p>
        </>
      )}
      {clone ? (
        <div className="pl__scroller" data-lenis-prevent tabIndex={0} role="group" aria-label="Figure, scrolls" onClick={close}>
          <div className="pl__box" ref={phone} key={i} onClick={(e) => e.stopPropagation()}>
            <CloneBody item={item} onReady={(fig) => { figRef.current = fig; setReady(true); }} />
          </div>
        </div>
      ) : (
        <>
          {showCap && <p className="pl__caption" ref={capEl}>{item.caption}</p>}
          <div className="pl__phone" ref={phone} data-cap={showCap ? "" : undefined} onClick={(e) => e.stopPropagation()}>
            <div className="pl__screen" ref={screen} data-lenis-prevent tabIndex={0} role="group" aria-label="Screen, scrolls">
              <img key={item.src} src={item.src} alt={item.alt || ""} draggable="false" />
            </div>
            <img className="pl__bezel" src={frame} alt="" draggable="false" />
          </div>
        </>
      )}
    </div>,
    document.body,
  );
}
