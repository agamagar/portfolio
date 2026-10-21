import { useEffect, useRef, useSyncExternalStore } from "react";
import { watchSection, subscribeSections, sectionCount } from "./sectionPlay";

// JS-driven entrance on the section controller. play(instant) runs start -> end (instant: just
// set the end state); reset() snaps to the start state. Both are read through refs, so inline
// closures are fine. Under reduced motion neither is ever called (the element shows its end state).
export function useSectionPlay(ref, { play, reset }, deps = []) {
  const fns = useRef({ play, reset });
  fns.current = { play, reset };
  useEffect(() => {
    const el = ref.current;
    if (!el) return undefined;
    return watchSection(el, { play: (i) => fns.current.play(i), reset: () => fns.current.reset() });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}

// rise(): "fade up, staggered" for a block's children: the block is a section, each child that matches
// `pick(el)` (default [data-rise]) rises in order. Replaces the per-block IntersectionObserver +
// motion code. lead = ms before the first, step = ms between.
export function rise(el, items, { lead = 100, step = 120, onPlay } = {}) {
  items.forEach((n, k) => { n.setAttribute("data-sp-rise", ""); n.style.setProperty("--sp-i", k); n.style.setProperty("--sp-lead", lead + "ms"); n.style.setProperty("--sp-step", step + "ms"); });
  const off = watchSection(el, {
    play: (instant) => { el.setAttribute("data-sp", instant ? "done" : "in"); onPlay?.(instant); },
    reset: () => el.removeAttribute("data-sp"),
  });
  return () => { off(); el.removeAttribute("data-sp"); items.forEach((n) => { n.removeAttribute("data-sp-rise"); n.style.removeProperty("--sp-i"); }); };
}

export function useRise(ref, { pick, lead, step, onPlay } = {}, deps = []) {
  useEffect(() => {
    const el = ref.current;
    if (!el) return undefined;
    return rise(el, pick ? pick(el) : [...el.querySelectorAll("[data-rise]")], { lead, step, onPlay });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}

// number of registered sections (0 under reduced motion): the Replay button shows only when > 0
export function useSectionCount() {
  return useSyncExternalStore(subscribeSections, sectionCount, () => 0);
}
