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

// A live media query. Needed because a control whose panel a media query has hidden
// must be able to say so, and CSS cannot set aria-disabled.
export function useMediaQuery(query) {
  const [matches, setMatches] = useState(
    () => typeof window !== "undefined" && window.matchMedia
      ? window.matchMedia(query).matches : false
  );
  useEffect(() => {
    if (!window.matchMedia) return;
    const mq = window.matchMedia(query);
    const on = () => setMatches(mq.matches);
    on();
    mq.addEventListener("change", on);
    return () => mq.removeEventListener("change", on);
  }, [query]);
  return matches;
}

// Which theme a DS surface should be in. The site already resolves light versus dark
// and records the answer as a `dark` class on documentElement (App.jsx), but nothing in
// the DS ever read it, so every ds-root asserted its own theme and the authored light
// tokens were unreachable. This bridges the two: the class first, because the site's
// stored preference and its own toggle both live there, and the media query as the
// fallback for a DS surface mounted outside the site shell.
//
// There is deliberately no in-app appearance toggle anywhere in this system. A surface
// follows the person's stated preference or it follows the system, and nothing else.
export function useDsTheme() {
  const read = () => {
    if (typeof document === "undefined") return "dark";
    if (document.documentElement.classList.contains("dark")) return "dark";
    if (document.documentElement.classList.contains("light")) return "light";
    return typeof window !== "undefined" && window.matchMedia
      && window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  };
  const [theme, setTheme] = useState(read);
  useEffect(() => {
    const sync = () => setTheme(read());
    sync();
    const obs = new MutationObserver(sync);
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    const mq = window.matchMedia?.("(prefers-color-scheme: dark)");
    mq?.addEventListener("change", sync);
    return () => { obs.disconnect(); mq?.removeEventListener("change", sync); };
  }, []);
  return theme;
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
      // the frame's own width wins over the parameter, so a stylesheet may
      // re-author a narrower frame for phones (2026-09-06) and the scale
      // follows it; offsetWidth ignores the transform, so it is the design width
      const dw = frame.offsetWidth || designWidth;
      const s = Math.min(maxScale, fit.clientWidth / dw);
      frame.style.setProperty("--ds-scale", s.toFixed(4));
      fit.style.height = `${frame.offsetHeight * s}px`;
    };
    const ro = new ResizeObserver(apply);
    ro.observe(fit);
    ro.observe(frame); // a column re-layout changes the frame's height
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

// The System-Explainer clock (base-layer §12a). Drives a stepped index 0..n that
// walks a reasoning beat in order: a `lead` pause, then `n` reveals `beat` ms
// apart, then a `hold` on the finished state, then loop. Built on useInViewLoop
// so it only runs on screen. Returns { ref, step }; attach `ref` to the figure's
// outermost element (or merge with a fit ref). Under reduced motion the step is
// seeded at `n` (the finished, fully-reasoned state) and never ticks.
//   step 0      -> nothing revealed yet (lead-in)
//   step i (1..n) -> cause i and effect i light together
//   step n held -> the conclusion, as proof nothing was dropped
export function useStepSequence(n, { lead = 850, beat = 600, hold = 3000 } = {}) {
  const reduce = useReducedMotion();
  const [step, setStep] = useState(reduce ? n : 0);
  const ref = useInViewLoop(!reduce, async ({ wait, alive }) => {
    while (alive()) {
      setStep(0); await wait(lead); if (!alive()) break;
      for (let i = 1; i <= n; i++) { setStep(i); await wait(beat); if (!alive()) break; }
      await wait(hold);
    }
  });
  return { ref, step };
}

// Named spring presets for the `motion` library (base-layer §14b, "Physicality &
// interruptibility"). Momentum and true interruptibility cannot be expressed by a
// fixed duration + easing curve, so gesture-driven / interruptible / momentum-
// carrying motion uses a spring. The stiffness/damping values live once in :root
// (index.css, the consumer-framework install block) so they are never inlined here;
// we read them at call time and hand `motion` a ready transition object.
//
//   spring("throw")  fling / dismiss, keeps momentum with a gentle overshoot
//                    (pass { velocity } from the release to carry it through)
//   spring("bloom")  scale-from-0 pop, small elastic settle (icon / marker appear)
//   spring("scrub")  scroll or drag catch-up (use with useSpring on a motion value)
//
// Usage:  <motion.div transition={spring("throw")} .../>
//         controls.start({ x: 0, transition: spring("throw", { velocity }) })
const SPRING_ROLE = {
  throw: ["--ds-spring-momentum-stiffness", "--ds-spring-momentum-damping"],
  bloom: ["--ds-spring-bloom-stiffness",    "--ds-spring-bloom-damping"],
  scrub: ["--ds-spring-scrub-stiffness",    "--ds-spring-scrub-damping"],
};
const SPRING_FALLBACK = { throw: [220, 26], bloom: [480, 18], scrub: [120, 30] };

export function spring(role = "throw", extra = {}) {
  const keys = SPRING_ROLE[role] || SPRING_ROLE.throw;
  let [stiffness, damping] = SPRING_FALLBACK[role] || SPRING_FALLBACK.throw;
  if (typeof window !== "undefined" && typeof getComputedStyle === "function") {
    const cs = getComputedStyle(document.documentElement);
    stiffness = parseFloat(cs.getPropertyValue(keys[0])) || stiffness;
    damping   = parseFloat(cs.getPropertyValue(keys[1])) || damping;
  }
  return { type: "spring", stiffness, damping, ...extra };
}

// Center of `el` within `frame`, in the frame's unscaled coordinate space
// (walks offsetParent, so it's independent of the `--ds-scale` transform).
// `frame` must be `position: relative` and the only positioned ancestor.
export function centerInFrame(el, frame) {
  let x = 0, y = 0, node = el;
  while (node && node !== frame) { x += node.offsetLeft; y += node.offsetTop; node = node.offsetParent; }
  return { x: x + el.offsetWidth / 2, y: y + el.offsetHeight / 2 };
}
