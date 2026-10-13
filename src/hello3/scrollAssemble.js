// Fallback for browsers without CSS scroll-driven animations (older Safari / Firefox):
// sets --sap (0..1) on each scroll-assemble root; scrollAssemble.css turns it into the
// same settle with calc(). A no-op where animation-timeline: view() is supported, and
// under reduced motion. One passive scroll listener, rAF-throttled, visible roots only.
const ROOTS = '.hello[data-page="3"] .wg__card, .hello[data-page="3"] .ap, .hello[data-page="3"] .hello-foot, .hello[data-page="3"] .sq, .hello[data-page="3"] .wg__cap';

export function scrollAssemble() {
  if (typeof window === "undefined" || !window.CSS || CSS.supports("animation-timeline: view()")) return () => {};
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return () => {};
  const vis = new Set();
  let raf = 0;
  const run = () => {
    raf = 0;
    const vh = window.innerHeight;
    vis.forEach((el) => {
      // 0 when the root's top meets the viewport bottom, 1 when it is 40% in
      const p = Math.min(1, Math.max(0, (vh - el.getBoundingClientRect().top) / (0.4 * vh)));
      el.style.setProperty("--sap", p.toFixed(3));
    });
  };
  const tick = () => { if (!raf) raf = requestAnimationFrame(run); };
  const io = new IntersectionObserver((es) => {
    es.forEach((e) => (e.isIntersecting ? vis.add(e.target) : (vis.delete(e.target), e.target.style.setProperty("--sap", e.boundingClientRect.top < 0 ? "1" : "0"))));
    tick();
  }, { rootMargin: "0px 0px 0px 0px" });
  const seen = new WeakSet();
  const scan = () => document.querySelectorAll(ROOTS).forEach((el) => { if (!seen.has(el)) { seen.add(el); el.style.setProperty("--sap", "0"); io.observe(el); } });
  scan();
  const mo = new MutationObserver(scan);
  mo.observe(document.body, { childList: true, subtree: true });
  window.addEventListener("scroll", tick, { passive: true });
  window.addEventListener("resize", tick);
  return () => { mo.disconnect(); io.disconnect(); window.removeEventListener("scroll", tick); window.removeEventListener("resize", tick); cancelAnimationFrame(raf); };
}
if (typeof document !== "undefined") scrollAssemble();
