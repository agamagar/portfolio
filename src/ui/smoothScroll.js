// SMOOTH SCROLL for the whole site (Agam, 2026-08-15: "add a smooth scroll to
// the website"). Lenis, the usual inertial wheel-scroll layer: the wheel drives
// a target and the page eases toward it each frame, so scrolling reads as one
// continuous motion instead of stepped wheel notches.
//
// What it does NOT touch, on purpose:
//   - the CSS `scroll-behavior: smooth` on <html> already handles anchor jumps;
//     Lenis's own class turns that off while it runs (see index.css) so the two
//     never fight over the same scroll.
//   - prefers-reduced-motion: Lenis is simply not started. Native scroll stays.
//   - coarse pointers: touch scrolling stays native (syncTouch off) - the phone
//     already has the platform's own inertia and the RailBand's tape physics
//     reads native scroll events; a synthetic touch scroll would fight both.
//   - nested scrollers (the timeline band, the horizontal rails, sheets): Lenis
//     drives the WINDOW only; anything with its own overflow keeps native
//     scrolling, and `data-lenis-prevent` is available for any that turn out to
//     need it.
//
// One instance for the app's lifetime; the rAF loop is the only thing it costs.

import Lenis from "lenis";

let lenis = null;

export function startSmoothScroll() {
  if (lenis || typeof window === "undefined") return lenis;
  if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return null;
  lenis = new Lenis({
    // 1.1s ease-out-expo: long enough to feel inertial, short enough that a
    // stop feels like a stop. Lenis's own default curve.
    duration: 1.1,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    smoothWheel: true,
    syncTouch: false,
    wheelMultiplier: 1,
    // native anchor / programmatic scrolls (scrollIntoView, scrollTo) are picked
    // up and eased rather than fought - Lenis's default behaviour, stated.
    autoResize: true,
  });
  const raf = (t) => {
    lenis.raf(t);
    requestAnimationFrame(raf);
  };
  requestAnimationFrame(raf);
  return lenis;
}

export function getLenis() {
  return lenis;
}

// BACKGROUND SCROLL LOCK for overlays (Agam, 2026-08-15: "when the bottom
// drawer is active please disable scroll of the background ... the bottom tray
// itself will be scrollable"). Two things have to happen together, because
// `body { overflow: hidden }` alone no longer stops the page once Lenis is
// driving it - Lenis scrolls the window from wheel input regardless of body
// overflow. So: Lenis is STOPPED (its wheel handler swallows the event and
// moves nothing) AND the body overflow is hidden for the native path (touch,
// keyboard, reduced motion where Lenis is not running). The tray keeps its own
// scroll by carrying `data-lenis-prevent`, which Lenis checks BEFORE the
// stopped-swallow, so a wheel over the tray reaches the tray natively.
// Reference-counted so two overlays cannot unlock each other.
let locks = 0;
let prevOverflow = "";
export function lockBackgroundScroll() {
  if (typeof document === "undefined") return () => {};
  if (locks++ === 0) {
    prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    lenis?.stop();
  }
  let released = false;
  return () => {
    if (released) return;
    released = true;
    if (--locks === 0) {
      document.body.style.overflow = prevOverflow;
      lenis?.start();
    }
  };
}
