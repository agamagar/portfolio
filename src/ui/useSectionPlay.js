import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { watchSection, subscribeSections, sectionCount, markSections, refreshSections } from "./sectionPlay";

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

// useBlockReveal(): the one reveal for a long article. Every top-level block of `ref` (heading, paragraph, list, figure,
// plates row, section) that has no entrance of its own gets the same fade-up (data-sp-block: sectionPlay.css), on the
// same section controller. A block that mounts a phone or another entrance later (lazy figures) loses the tag, so
// nothing reveals twice. Reduced motion: the controller never arms, so everything shows at once.
const OWN = "[data-play],[data-sp-rise],[data-rise],.sscene,.pf";
export function useBlockReveal() {
  const [root, setRoot] = useState(null); // a callback ref: the body may mount after the first render
  useEffect(() => {
    if (!root) return undefined;
    let raf = 0;
    const sync = () => {
      raf = 0;
      [...root.children].forEach((c) => {
        if (c.classList.contains("sr-only") || !c.firstChild || c.matches("p.article__divider,span:empty")) return;
        const own = c.matches(OWN) || !!c.querySelector(OWN);
        if (own && c.hasAttribute("data-sp-block")) { c.removeAttribute("data-sp-block"); }
        else if (!own && !c.hasAttribute("data-sp-block")) c.setAttribute("data-sp-block", "");
      });
      refreshSections();
    };
    const queue = () => { if (!raf) raf = requestAnimationFrame(sync); };
    sync();
    markSections("[data-sp-block]");
    const mo = new MutationObserver(queue);
    mo.observe(root, { childList: true, subtree: true });
    return () => { mo.disconnect(); if (raf) cancelAnimationFrame(raf); };
  }, [root]);
  return setRoot;
}
