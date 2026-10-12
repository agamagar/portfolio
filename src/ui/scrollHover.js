// NO HOVER WHILE SCROLLING (Agam, 12 Oct: "disable the hover while the page is scrolling").
// Content sliding under a still pointer fires hover effects and handlers all the way
// down the page. While the page scrolls, <html> carries .is-scrolling:
//   - CSS: every :hover rule is guarded by :where(html:not(.is-scrolling)) at build time
//     (tools/postcss-scroll-hover.mjs, zero specificity), so nothing hover-styled lights up
//     and a hover left on when scrolling began drops. Chosen over pointer-events:none on the
//     content, which would swallow a click made in the 150 ms tail (the pointerdown would hit
//     <html> and the click would land on <html> too) and could cut a side quests drag.
//   - JS: pointerover/pointerenter/mouseover/mouseenter are stopped in the capture phase on
//     window while scrolling, so React and native hover handlers never see them; a hover
//     already active is told it ended (pointerout/leave dispatched down the :hover chain),
//     and the real events resume on the first pointer move after the class drops.
// One rAF-throttled flag, one timer. Synthetic events (the scripted Agam cursor) pass.
const CLASS = "is-scrolling";
const QUIET_MS = 150;
const HOVER_EVENTS = ["pointerover", "pointerenter", "mouseover", "mouseenter"];

export function startScrollHoverGuard() {
  if (typeof window === "undefined") return;
  const root = document.documentElement;
  let on = false, queued = false, timer = 0;

  const endHover = () => {
    // tell whatever is hovered that the hover ended (CSS :hover clears by itself)
    const chain = [...document.querySelectorAll(":hover")].reverse(); // deepest first
    for (const el of chain) {
      el.dispatchEvent(new PointerEvent("pointerout", { bubbles: true, relatedTarget: null, pointerType: "mouse" }));
      el.dispatchEvent(new PointerEvent("pointerleave", { bubbles: false, relatedTarget: null, pointerType: "mouse" }));
      el.dispatchEvent(new MouseEvent("mouseout", { bubbles: true, relatedTarget: null }));
      el.dispatchEvent(new MouseEvent("mouseleave", { bubbles: false, relatedTarget: null }));
    }
  };
  const off = () => { on = false; root.classList.remove(CLASS); };
  const onScroll = () => {
    clearTimeout(timer);
    timer = setTimeout(off, QUIET_MS);
    if (on || queued) return;
    queued = true;
    requestAnimationFrame(() => {
      queued = false;
      if (on) return;
      on = true;
      root.classList.add(CLASS);
      endHover();
    });
  };
  window.addEventListener("scroll", onScroll, { passive: true });
  const block = (e) => { if (on && e.isTrusted) e.stopImmediatePropagation(); };
  for (const t of HOVER_EVENTS) window.addEventListener(t, block, true);
}
