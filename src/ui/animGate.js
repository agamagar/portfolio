// Endless CSS animations run only while their element is near the viewport.
// Skeleton shimmers, the bubbles' float / breathe / swirl, marquee strips, dev-tool pulses: each is a
// forever loop that keeps the main thread restyling, repainting and re-layerizing every frame (measured
// ~290 ms of main thread per second on /work/scheduled-delivery at rest) even when it is thousands of
// pixels off screen. Every few seconds this finds the elements that have an infinite animation, watches
// them with one IntersectionObserver, and pauses (animation-play-state, see .ag-off in index.css) the ones
// that are more than 150 px outside the viewport. Resuming continues from the same point, so nothing
// visible changes. Elements merely clipped by an ancestor while inside the viewport keep running.
// Opt out with data-keep-animating.
export function startAnimGate() {
  if (typeof window === "undefined" || !("IntersectionObserver" in window) || window.__animGate) return;
  window.__animGate = true;
  const M = 150;
  const tracked = new WeakSet();
  const io = new IntersectionObserver((list) => {
    for (const e of list) {
      const r = e.boundingClientRect;
      const outside = !e.isIntersecting && (r.bottom < -M || r.top > window.innerHeight + M || r.right < -M || r.left > window.innerWidth + M);
      e.target.classList.toggle("ag-off", outside);
    }
  }, { rootMargin: `${M}px` });
  const scan = () => {
    if (document.visibilityState !== "visible" || !document.getAnimations) return;
    for (const a of document.getAnimations()) {
      const t = a.effect && a.effect.target;
      if (!t || !t.classList || tracked.has(t)) continue;
      if (a.effect.getTiming().iterations !== Infinity) continue;
      if (t.closest("[data-keep-animating]")) continue;
      tracked.add(t);
      io.observe(t);
    }
  };
  const idle = window.requestIdleCallback ? (f) => window.requestIdleCallback(f, { timeout: 1500 }) : (f) => setTimeout(f, 200);
  setInterval(() => idle(scan), 2000);
  document.addEventListener("visibilitychange", () => idle(scan));
  idle(scan);
}
