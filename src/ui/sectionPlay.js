// Section play: the one controller behind every scroll entrance on the site.
//
// A section "enters" when its TOP crosses the viewport's vertical centre (scrolling down) or its
// BOTTOM crosses it (scrolling up): that is simply "the element spans the centre line", so one
// zero-height observer (rootMargin -50% / -50%) covers both. The entrance then plays from start to
// end on its own clock (time-based, never scrubbed by scroll), with its own duration, easing and
// stagger. When the section leaves the viewport completely it snaps back to the start state, so
// it plays again next time. A second observer (plain viewport) owns that reset; leaving the
// centre line alone never resets, which is the hysteresis: hovering on the line cannot flicker.
// The global Replay button calls replayAll(): every section currently in view resets and plays again.
//
// Two ways in:
//   - markup: data-play on an element. The controller sets data-sp="in" while it plays (and "done"
//     for a section already above the centre at load, shown at its end state with no motion).
//     sectionPlay.css / the owner's CSS keys the start state off  html.sp-on [data-play]:not([data-sp]).
//   - code: watchSection(el, { play, reset }) (or useSectionPlay in useSectionPlay.js) for
//     JS-driven entrances (charts, motion animations).
//   markSections(selector) tags existing markup that cannot take the attribute itself.
//
// Reduced motion (or no IntersectionObserver): the html.sp-on class is never added, so CSS shows
// end states, callbacks are never called, and the replay button hides (count stays 0).
import "./sectionPlay.css";

const doc = typeof document !== "undefined" ? document : null;
const canRun = !!doc && typeof IntersectionObserver !== "undefined" && !!window.matchMedia
  && !window.matchMedia("(prefers-reduced-motion: reduce)").matches;

export const sectionPlayActive = canRun;
const entries = new Map(); // el -> { el, play, reset, on, seen, inView, snap }
const listeners = new Set();
const markers = new Set();
let ioCentre = null;
let ioView = null;
let mo = null;
let moRaf = 0;
// The load sequence moves things around for the first seconds (the hero reserves its space late), and a
// section that happened to span the centre line mid-shuffle would play off screen. So the observers arm on
// the first real scroll gesture, or ARM_MS after the page loaded, whichever comes first. Until then
// sections wait in their start state.
const ARM_MS = 2000;
let armed = false;
function arm() {
  if (armed) return;
  armed = true;
  ["wheel", "touchmove", "keydown", "scroll"].forEach((t) => window.removeEventListener(t, arm));
  entries.forEach((s, el) => { ioCentre.observe(el); ioView.observe(el); });
}

const emit = () => listeners.forEach((f) => f());
export const subscribeSections = (f) => { listeners.add(f); return () => listeners.delete(f); };
export const sectionCount = () => (canRun ? entries.size : 0);

function snapFor(s) { // kill transitions for the frames around a reset
  s.el.setAttribute("data-sp-snap", "");
}
function unsnap(s) {
  requestAnimationFrame(() => requestAnimationFrame(() => { s.el.removeAttribute("data-sp-snap"); }));
}

function start(s, instant) {
  if (s.on) return;
  s.on = true;
  if (s.play) s.play(instant); else s.el.setAttribute("data-sp", instant ? "done" : "in");
}
function reset(s) {
  if (!s.on) return;
  s.on = false;
  snapFor(s);
  if (s.reset) s.reset(); else s.el.removeAttribute("data-sp");
  unsnap(s);
}

function onCentre(list) {
  for (const e of list) {
    const s = entries.get(e.target);
    if (s && e.isIntersecting) start(s, false);
  }
}

function onView(list) {
  const vh = window.innerHeight;
  const maxScroll = doc.documentElement.scrollHeight - vh;
  for (const e of list) {
    const s = entries.get(e.target);
    if (!s) continue;
    s.inView = e.isIntersecting;
    if (!e.isIntersecting) { if (s.seen) reset(s); s.seen = true; continue; }
    if (!s.on) {
      const r = e.boundingClientRect;
      // first sighting already above the centre (restored scroll): show it finished, no motion
      if (!s.seen && r.bottom <= vh / 2) start(s, true);
      // too close to the end of the page for its top to ever reach the centre: play on entering
      else if (window.scrollY + r.top - vh / 2 > maxScroll) start(s, false);
    }
    s.seen = true;
  }
}

function boot() {
  if (ioCentre || !canRun) return;
  ioCentre = new IntersectionObserver(onCentre, { rootMargin: "-50% 0px -50% 0px", threshold: 0 });
  ioView = new IntersectionObserver(onView, { threshold: 0 });
  doc.documentElement.classList.add("sp-on");
  ["wheel", "touchmove", "keydown", "scroll"].forEach((t) => window.addEventListener(t, arm, { passive: true, once: true }));
  const later = () => setTimeout(arm, ARM_MS);
  if (doc.readyState === "complete") later(); else window.addEventListener("load", later, { once: true });
  scan();
  // sections mount and unmount with routes: tag + register new ones, drop removed ones (rAF-batched)
  mo = new MutationObserver(() => { if (!moRaf) moRaf = requestAnimationFrame(() => { moRaf = 0; scan(); }); });
  mo.observe(doc.body, { childList: true, subtree: true });
}

function add(el, handlers) {
  if (!canRun || entries.has(el)) return;
  boot();
  entries.set(el, { el, play: handlers?.play, reset: handlers?.reset, on: false, seen: false, inView: false });
  if (armed) { ioCentre.observe(el); ioView.observe(el); }
  emit();
}
function drop(el) {
  const s = entries.get(el);
  if (!s) return;
  entries.delete(el);
  ioCentre?.unobserve(el); ioView?.unobserve(el);
  el.removeAttribute("data-sp"); el.removeAttribute("data-sp-snap");
  emit();
}

function scan() {
  markers.forEach((sel) => doc.querySelectorAll(sel).forEach((el) => { if (!el.hasAttribute("data-play")) el.setAttribute("data-play", ""); }));
  doc.querySelectorAll("[data-play]").forEach((el) => { if (!entries.has(el)) add(el); });
  // markup-driven entries that left the document (JS-driven ones unregister themselves)
  entries.forEach((s, el) => { if (!s.play && !el.isConnected) drop(el); });
}

// Register a JS-driven entrance. play(instant) runs it start -> end (instant: just set the end
// state); reset() snaps back to the start state. Returns the unregister function.
export function watchSection(el, { play, reset: rs }) {
  if (!el || !canRun) return () => {};
  add(el, { play, reset: rs });
  return () => drop(el);
}

// Tag every element matching `selector` with data-play (now and as the DOM changes).
export function markSections(selector) {
  if (!canRun) return;
  markers.add(selector);
  boot();
  scan();
}

// The global Replay: everything currently in view resets and plays again from its start.
export function replayAll() {
  if (!canRun) return;
  const live = [...entries.values()].filter((s) => s.inView && s.on);
  live.forEach(reset);
  doc.documentElement.getBoundingClientRect(); // one layout flush so the start state is committed
  requestAnimationFrame(() => requestAnimationFrame(() => live.forEach((s) => start(s, false))));
}

// Pick up data-play attributes added after the last DOM change (hooks set them in effects).
export function refreshSections() { if (canRun) { boot(); scan(); } }
