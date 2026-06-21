// Shared animation harness for Dassh design-system figures. These hooks are
// figure-agnostic: any animated figure composes them so behavior (reduced
// motion, fit-to-container scaling, play-on-view sequencing) stays consistent.
// See Claude/animation-base-layer.md.
import { useEffect, useLayoutEffect, useRef, useState } from "react";

// Reactive `prefers-reduced-motion: reduce`.
export function useReducedMotion() {
  const [reduce, setReduce] = useState(
    () => typeof window !== "undefined" && window.matchMedia
      ? window.matchMedia("(prefers-reduced-motion: reduce)").matches
      : false
  );
  useEffect(() => {
    if (!window.matchMedia) return;
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const on = () => setReduce(mq.matches);
    mq.addEventListener("change", on);
    return () => mq.removeEventListener("change", on);
  }, []);
  return reduce;
}

// Scale a fixed `designWidth` frame down to fit its container. Returns refs for
// the outer fit wrapper and the inner frame; sets `--ds-scale` on the frame and
// reserves the scaled height on the wrapper so layout stays correct.
export function useFitScale(designWidth = 600, maxScale = 1) {
  const fitRef = useRef(null);
  const frameRef = useRef(null);
  useLayoutEffect(() => {
    const fit = fitRef.current, frame = frameRef.current;
    if (!fit || !frame) return;
    const apply = () => {
      // skip zero-width measurements (e.g. mounted in a collapsed/hidden parent);
      // leave --ds-scale unset so the CSS fallback of 1 applies until a real
      // width arrives, rather than scaling the figure to nothing.
      if (!fit.clientWidth) return;
      // scale to fill the container, up to maxScale (so a narrow design can grow
      // to fill a wider box for legibility, not just shrink to fit).
      const s = Math.min(maxScale, fit.clientWidth / designWidth);
      frame.style.setProperty("--ds-scale", s.toFixed(4));
      fit.style.height = `${frame.offsetHeight * s}px`;
    };
    const ro = new ResizeObserver(apply);
    ro.observe(fit);
    apply();
    return () => ro.disconnect();
  }, [designWidth, maxScale]);
  return { fitRef, frameRef };
}

// Run an async sequence while the element is on screen; abort + restart on
// enter/leave. `run` receives `{ wait, alive }`:
//   wait(ms) -> Promise that resolves after ms (cancelled on leave)
//   alive()  -> false once the figure scrolls away or unmounts (check after each await)
// `run` should loop until `!alive()`. Pass `enabled: false` (e.g. reduced motion)
// to skip entirely. `run` is read from a ref, so it need not be memoized.
export function useInViewLoop(enabled, run, { threshold = 0.35 } = {}) {
  const ref = useRef(null);
  const runRef = useRef(run);
  runRef.current = run;
  useEffect(() => {
    const el = ref.current;
    if (!enabled || !el) return;
    let timers = [];
    let running = false;
    let alive = false;
    const wait = (ms) => new Promise((r) => timers.push(setTimeout(r, ms)));
    const clearAll = () => { timers.forEach(clearTimeout); timers = []; };
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting && !running) {
          running = true; alive = true;
          Promise.resolve(runRef.current({ wait, alive: () => alive }));
        } else if (!e.isIntersecting && running) {
          running = false; alive = false; clearAll();
        }
      },
      { threshold }
    );
    io.observe(el);
    return () => { alive = false; running = false; clearAll(); io.disconnect(); };
  }, [enabled, threshold]);
  return ref;
}

// Center of `el` within `frame`, in the frame's unscaled coordinate space
// (walks offsetParent, so it's independent of the `--ds-scale` transform).
// `frame` must be `position: relative` and the only positioned ancestor.
export function centerInFrame(el, frame) {
  let x = 0, y = 0, node = el;
  while (node && node !== frame) { x += node.offsetLeft; y += node.offsetTop; node = node.offsetParent; }
  return { x: x + el.offsetWidth / 2, y: y + el.offsetHeight / 2 };
}
