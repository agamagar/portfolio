// PathMarquee — items that travel along an arbitrary SVG path.
//
// HOW IT WORKS (the whole mechanism, in two CSS properties):
//   offset-path: path('M...')   puts an element ON a curve
//   offset-distance: 0%..100%   positions it ALONG that curve
// Animate offset-distance and the element follows the curve, rotating with it
// for free. N items spaced evenly is just item i sitting at (base + i/N) % 100.
// Everything else here — hover, drag, depth, scale — is decoration on top of
// that one idea.
//
// WHY THIS IS NOT THE SAMPLE COMPONENT. The reference implementation called
// useTransform, useMotionValue and useEffect INSIDE items.map(), and again
// inside an Object.fromEntries(map()) for its CSS variables. That is a Rules of
// Hooks violation: it survives only while the item count never changes, and
// React will throw the moment `repeat` or the children do change. It also
// pulled in framer-motion to animate a property the browser can animate on its
// own, and re-rendered React on every frame to do it.
//
// So: zero hooks per item, one rAF that writes style.offsetDistance straight to
// refs, and no animation dependency at all. React renders the items once and
// then gets out of the way.
//
// EVERY knob is a prop, because the ask was a version that is fully
// customisable rather than one shape with one speed.

import { useCallback, useEffect, useMemo, useRef } from "react";
import { PATH_PRESETS } from "./pathPresets";

const wrap = (v) => ((v % 100) + 100) % 100;
// Snap to a step. Used on every depth property so the DOM is only touched when
// the value crosses a step, instead of on every frame for a sub-pixel change.
const quant = (v, step) => Math.round(v / step) * step;
// cubic-bezier(x1, y1, x2, y2) as a function of x in 0..1 (bisection on x)
const bezier = (x1, y1, x2, y2) => {
  const cx = 3 * x1, bx = 3 * (x2 - x1) - cx, ax = 1 - cx - bx;
  const cy = 3 * y1, by = 3 * (y2 - y1) - cy, ay = 1 - cy - by;
  const X = (t) => ((ax * t + bx) * t + cx) * t;
  const Y = (t) => ((ay * t + by) * t + cy) * t;
  return (x) => {
    if (x <= 0) return 0;
    if (x >= 1) return 1;
    let lo = 0, hi = 1, t = x;
    for (let i = 0; i < 24; i++) { if (X(t) > x) hi = t; else lo = t; t = (lo + hi) / 2; }
    return Y(t);
  };
};
// The auto-drag runs once per page load, not once per mount: coming back to the
// homepage from a case study should not replay a demo the visitor has seen.
let demoPlayed = false;

export default function PathMarquee({
  children,
  className = "",

  // ---- the path itself -------------------------------------------------
  /** a preset name from pathPresets.js, or pass `d` + `viewBox` directly */
  preset = "ribbon",
  d: dProp,
  viewBox: viewBoxProp,
  /** draw the path itself, which is what you want while you are tuning one */
  showPath = false,
  pathStroke = "var(--line)",
  pathDash = "",

  // ---- travel ----------------------------------------------------------
  /** percent of the path travelled per second */
  speed = 6,
  /** carousel: instead of running continuously, rest with one card at the
   *  centre of the path, then travel to the next one (mu9trf5q) */
  carousel = false,
  /** carousel only: is it advancing, or held on the current card */
  playing = true,
  /** carousel only: how long a card is held at the centre, ms */
  dwell = 1500,
  /** per-card dwell (ms), asked as a card comes to rest; falls back to `dwell`.
   *  11 Oct 2026, Agam: "make each card play through completely" */
  dwellFor,
  /** the hop between two cards is a damped spring on the run's shared position:
   *  { zeta, omega (rad/s) }. zeta < 1 gives a small floaty overshoot. */
  spring = { zeta: 0.7, omega: 2 * Math.PI, lead: 0.12 },
  /** carousel only: an AUTO-DRAG the first time the run scrolls into view
   *  (mv847jvw), showing that the cards can be dragged. { cards, ms, ease,
   *  threshold }: travel about `cards` cards, the target swept over `ms` on the
   *  `ease` cubic-bezier and chased by `spring`, starting once `threshold` of the
   *  run is on screen and the page has stopped scrolling. Off when unset. */
  demo,
  /** carousel clock, for a progress ring (mv3pitov): called as ("rest", { dwell, step }),
   *  ("travel", { step }), ("hold") when the clock stops and ("resume") when it restarts */
  onCycle,
  direction = "normal",
  /** remap 0..1 -> 0..1 to bunch items up or spread them out along the run */
  easing,

  // ---- the items -------------------------------------------------------
  /** how many times the children repeat around the path */
  repeat = 2,
  itemWidth = 64,
  /** rotate each item to face along the path */
  rotate = false,

  // ---- interaction -----------------------------------------------------
  /** "slow" eases down to slowFactor, "pause" stops dead, "none" ignores hover */
  hoverMode = "slow",
  slowOnHover = true,
  slowFactor = 0.25,
  draggable = true,
  dragSensitivity = 0.1, // percent of the path per pointer px: the cards follow the finger at about 1.3x (was 0.35, ~4.5x)
  dragDecay = 0.9,

  // ---- depth -----------------------------------------------------------
  rollingZIndex = true,
  zBase = 1,
  zRange = 20,
  /** scale items as they travel, so the run reads as depth: [near, far] */
  scaleRange,
  /** step the scale is snapped to. Bigger = fewer re-rasters, still smooth. */
  scaleStep = 0.02,
  /** fade with distance, [near, far] opacity — aerial perspective, cheaply */
  depthFade,
  /** max blur in px at the far end. A filter, so it repaints: use sparingly. */
  depthBlur = 0,
  /** Fraction of the lap spent fading in at the start and out at the end. The
   *  loop's seam is a teleport from the end of the path back to the start; this
   *  makes each item invisible while that happens, so an item leaves by fading
   *  out rather than by reappearing at the other end. 0 disables. */
  fadeEdges = 0.07,

  /** "length" spaces items evenly along the curve; "x" spaces them evenly
   *  across its width, which reads better on a wide run that doubles back */
  spacing = "length",
  /** Fraction of the path the run occupies, 0..1. At 1 the items are spread over
   *  the whole curve, which is the LOOSEST they can be for a given count — the
   *  path is already full, so wanting more air between cards means fewer cards
   *  (see `repeat`), not a bigger number here. Below 1 they bunch into a shorter
   *  stretch and overlap more, which is the direction this knob actually adds. */
  spread = 1,

  reduce = false,
}) {
  const wrapRef = useRef(null);
  const itemRefs = useRef([]);
  const svgPathRef = useRef(null);
  // Length->distance lookup for spacing="x". Built by sampling the path once.
  const xTable = useRef(null);
  // One mutable bag for the interaction state. It is a ref, not state, because
  // every field is read inside the rAF loop and none of them should re-render.
  const ui = useRef({ hovering: false, dragging: false, dragV: 0, factor: 1 });
  const hoverModeRef = useRef(hoverMode);
  hoverModeRef.current = hoverMode;
  const onCycleRef = useRef(onCycle);
  onCycleRef.current = onCycle;
  const cycle = (phase, info) => onCycleRef.current?.(phase, info);
  const dwellForRef = useRef(dwellFor);
  dwellForRef.current = dwellFor;
  const springRef = useRef(spring);
  springRef.current = spring;
  const demoRef = useRef(demo);
  demoRef.current = demo;
  // the rest's clock, kept across the carousel effect's re-runs so that Pause
  // and Play carry on where the rest left off instead of restarting it
  const dwellState = useRef(null); // { item, total, remaining }

  const spec = PATH_PRESETS[preset] || PATH_PRESETS.ribbon;
  const d = dProp || spec.d;
  const viewBox = viewBoxProp || spec.viewBox;
  const [, , vbW, vbH] = viewBox.split(/\s+/).map(Number);

  // THE ALIGNMENT PROBLEM, and why this layer exists.
  // The <svg> scales its path to whatever width the container is. The ITEMS do
  // not: offset-path resolves in the element's own CSS pixel space, so a path
  // authored at 996 units wide lays items out across 996 CSS PIXELS regardless
  // of how wide the svg was drawn. The two only agree when the container
  // happens to be exactly viewBox-width, and drift further apart at every other
  // size — which is how the run ended up 122px above its own box.
  // Fix: give the items their own layer sized in viewBox units and scale it by
  // the same factor the svg is being scaled by. Then both are in the same space.
  const layerRef = useRef(null);
  useEffect(() => {
    const wrap_ = wrapRef.current;
    const layer = layerRef.current;
    if (!wrap_ || !layer || !vbW) return undefined;
    let retry = 0;
    let raf = 0;
    const fit = () => {
      // Scale the item layer by exactly the factor the svg is being scaled by,
      // and nothing else. I briefly reserved half an item of overhang at each
      // end to "centre" the run; that was wrong. Measuring the DRAWN path shows
      // it already sits 1px from each edge, so the reservation only pushed the
      // right margin further out (107px -> 149px). The asymmetry people see is
      // not the path's placement, it is where the ITEMS sit on it — see the
      // note on `spacing` below.
      const k = wrap_.clientWidth / vbW;
      // A zero-width wrapper is a MEASUREMENT, not a layout: it happens while an
      // ancestor is display:none, before first layout, or inside a collapsed
      // container. Writing scale(0) from it collapses the whole run to nothing.
      //
      // But SKIPPING alone is not enough, and that was a second bug: if the very
      // first fit is skipped the layer is never sized at all, and the
      // ResizeObserver cannot be relied on to rescue it — observed on a route
      // that mounted at 0x0 and stayed unsized after the viewport came back.
      // So a skipped fit RETRIES, and a window resize re-runs it too. Bounded,
      // because a run that is never going to be measurable should not spin.
      if (!k) {
        if (retry++ < 180) raf = requestAnimationFrame(fit);
        return;
      }
      retry = 0;
      layer.style.width = `${vbW}px`;
      layer.style.height = `${vbH}px`;
      layer.style.transform = `scale(${k})`;
      // published so content inside the run can opt out of the fit (the
      // side-quests caption, hello3.css), which at phone width is about 0.33
      layer.style.setProperty("--pm-fit", String(k));
    };
    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(wrap_);
    window.addEventListener("resize", fit);
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      window.removeEventListener("resize", fit);
    };
  }, [vbW, vbH]);

  const items = useMemo(() => {
    const kids = Array.isArray(children) ? children : [children];
    const flat = kids.filter(Boolean);
    const out = [];
    for (let r = 0; r < repeat; r++) {
      flat.forEach((child, i) => out.push({ child, key: `${r}-${i}`, decorative: r > 0 }));
    }
    return out;
  }, [children, repeat]);

  const count = items.length;

  // MORE AIR THAN "EVEN" (annotation msbobfpm). Above spread 1 the run would
  // need more path than exists, so the extra space has to come from somewhere:
  // it comes from showing FEWER cards. At spread 1.35 the gap between cards is
  // 35% wider and the trailing items that would have wrapped past the end of the
  // path are dropped instead of doubling up on the ones at the start.
  // This is why the knob could not simply take a bigger number before.
  const shown = spread > 1 ? Math.max(2, Math.floor(count / spread)) : count;

  // Last written value per item, so a frame only touches the DOM for the
  // properties that actually CHANGED. offset-distance genuinely changes every
  // frame; the depth properties do not, and writing them anyway was most of the
  // cost. See the note on QUANTISE below for why they change so rarely.
  const prev = useRef([]);

  // Position writer. Called from the loop AND once on mount, so a parked
  // (reduced-motion) marquee still lays its items out along the path.
  const place = useCallback(
    (base) => {
      const els = itemRefs.current;
      for (let i = 0; i < els.length; i++) {
        const el = els[i];
        if (!el) continue;
        // trimmed by `spread`: out of the run entirely, not just parked
        el.style.display = i >= shown ? "none" : "";
        if (i >= shown) continue;
        const was = prev.current[i] || (prev.current[i] = {});
        let raw = wrap(base + (i * 100 * spread) / count);
        // Spacing by ARC LENGTH bunches items wherever a curve doubles back on
        // itself: the ribbon spends most of its length in the middle loop, so
        // the long tail out to the right edge ends up nearly empty and the run
        // reads as stopping short. spacing="x" remaps each item's position so
        // they are evenly spread across the path's WIDTH instead, which is what
        // the eye is actually judging on a wide horizontal run.
        if (spacing === "x" && xTable.current) raw = xTable.current(raw);
        const t = easing ? Math.min(1, Math.max(0, easing(raw / 100))) * 100 : raw;
        el.style.offsetDistance = `${t}%`;

        if (rollingZIndex) {
          const z = Math.round(zBase + (t / 100) * zRange);
          if (z !== was.z) {
            was.z = z;
            el.style.zIndex = String(z);
          }
        }

        if (scaleRange || depthFade || depthBlur) {
          // a triangle wave: nearest at the middle of the run, far at both ends
          const k = 1 - Math.abs(t / 50 - 1);

          if (scaleRange) {
            // QUANTISED, and this is the real optimisation. The artwork here is
            // photographic and arrives far larger than it is drawn, so every
            // DISTINCT scale is a fresh rasterisation of the image. Left
            // continuous, that is 24 re-rasters per frame for a difference no
            // one can see. Snapped to `scaleStep`, each item re-rasters only
            // when it crosses a step — a handful of times per lap — and the
            // motion is unaffected because the change is below a pixel.
            const s = quant(scaleRange[0] + (scaleRange[1] - scaleRange[0]) * k, scaleStep);
            if (s !== was.s) {
              was.s = s;
              el.style.scale = String(s);
            }
          }

          // Depth by ATMOSPHERE rather than size: things further away are paler
          // and less distinct. Same quantisation reasoning, and opacity is the
          // cheap one of the two — blur is a filter and repaints, so it is off
          // unless asked for.
          if (depthFade) {
            const o = quant(depthFade[0] + (depthFade[1] - depthFade[0]) * k, 0.04);
            if (o !== was.o) {
              was.o = o;
              el.style.opacity = String(o);
            }
          }
          if (depthBlur) {
            const b = quant(depthBlur * (1 - k), 0.5);
            if (b !== was.b) {
              was.b = b;
              el.style.filter = b > 0 ? `blur(${b}px)` : "";
            }
          }
        }
      }
    },
    [count, shown, easing, rollingZIndex, zBase, zRange, scaleRange, scaleStep, depthFade, depthBlur, spacing, spread],
  );

  // Sample the path once per shape to build the percent-of-width -> percent-of-
  // length map that spacing="x" needs. 240 samples is far finer than the eye can
  // read at this size and costs well under a millisecond.
  useEffect(() => {
    const el = svgPathRef.current;
    if (!el || spacing !== "x") {
      xTable.current = null;
      return;
    }
    const total = el.getTotalLength();
    const N = 240;
    const xs = [];
    for (let i = 0; i <= N; i++) xs.push(el.getPointAtLength((i / N) * total).x);
    const minX = Math.min(...xs);
    const maxX = Math.max(...xs);
    const span = maxX - minX || 1;
    // MONOTONIC, and it has to stay that way. A previous version shifted this by
    // half a gap and wrapped it with `% 1`, to even up the left/right margins
    // (msboxiok). That put a DISCONTINUITY IN THE MIDDLE of the mapping — and
    // since the keyframe list is built straight off this function and WAAPI
    // interpolates between keyframes, the step where x jumped from max back to
    // min became an animated slide: the card flew the whole way back across the
    // run in one keyframe interval (measured: 99.6% -> 0.8% at offset 0.942).
    // That is the "flying back" in msbw7ciu.
    //
    // The margin symmetry it bought was never real anyway: margins only exist in
    // a frozen snapshot, and this run is always moving. Kept monotonic, the only
    // discontinuity is the iteration boundary, which is a true teleport rather
    // than something the browser tweens — and `fadeEdges` below hides even that.
    xTable.current = (pct) => {
      const targetX = minX + (pct / 100) * span;
      // first sample at or past the target x, walking forward so a path that
      // doubles back resolves to its FIRST crossing rather than oscillating
      let lo = 0;
      for (let i = 1; i <= N; i++) {
        if ((xs[i] >= targetX && xs[i - 1] < targetX) || (xs[i] <= targetX && xs[i - 1] > targetX)) {
          lo = i;
          break;
        }
      }
      return (lo / N) * 100;
    };
  }, [d, spacing, count]);

  // Lay the items out ONCE, synchronously, before anything animates. Without
  // this they all sit at offset-distance 0% — stacked on top of each other at
  // the path's start — until the first rAF lands, which is visible on load and
  // never resolves at all if the section mounts off-screen (the loop skips work
  // while the IntersectionObserver says it is not visible) or if rAF is being
  // throttled. The layout is not the animation's job.
  useEffect(() => {
    // Drop the change-gate cache first. It is keyed by index, so if the item
    // count or the depth settings changed, index i is now a DIFFERENT element
    // and the remembered value would suppress a write that is genuinely needed.
    prev.current = [];
    // Clear what the previous settings wrote. Turning a depth mode OFF means the
    // loop stops writing that property, which is not the same as unsetting it —
    // without this, switching to a flat mode leaves the last scale, opacity and
    // blur frozen on the items and "flat" is not flat.
    for (const el of itemRefs.current) {
      if (!el) continue;
      el.style.scale = "";
      el.style.opacity = "";
      el.style.filter = "";
    }
    place(0);
  }, [place]);

  // THE ENGINE — a keyframe list, not a loop.
  //
  // Reduced motion is not "no marquee": the items still belong on the path, they
  // just do not travel, and the effect above has already parked them there.
  //
  // The previous version ran one rAF that wrote offset-distance to every item on
  // every frame. Trimming that loop took it from 1.45ms to 0.76ms a frame and it
  // was STILL reported as laggy (annotation msbng401), so the loop itself had to
  // go rather than get cheaper. Everything it used to compute is now baked into
  // a keyframe list once and handed to the browser, which runs it without waking
  // JavaScript at all — and can run it off the main thread, which no amount of
  // trimming a rAF can achieve.
  //
  // The two things that looked un-bakeable both are:
  //   spacing="x"  a non-linear remap of position, which is just a non-linear
  //                sequence of keyframe VALUES over linear time
  //   depth        scale / opacity / blur are functions of position, so likewise
  // Phase is a NEGATIVE DELAY, so all N items share one keyframe list instead of
  // needing one per item.
  const animsRef = useRef([]);
  useEffect(() => {
    if (reduce) return undefined;
    const els = itemRefs.current.filter(Boolean).slice(0, shown);
    if (!els.length || !speed) return undefined;

    const STEPS = 120; // ~0.8% of the path per keyframe, finer than the eye reads
    const duration = (100 / speed) * 1000;
    const frames = [];
    for (let st = 0; st <= STEPS; st++) {
      const raw = (st / STEPS) * 100;
      const mapped = spacing === "x" && xTable.current ? xTable.current(raw) : raw;
      const t = easing ? Math.min(1, Math.max(0, easing(mapped / 100))) * 100 : mapped;
      const f = { offset: st / STEPS, offsetDistance: `${t}%` };
      if (rollingZIndex) f.zIndex = Math.round(zBase + (t / 100) * zRange);
      const k = 1 - Math.abs(t / 50 - 1); // triangle wave: near at mid-run
      if (scaleRange) f.scale = String(scaleRange[0] + (scaleRange[1] - scaleRange[0]) * k);
      // Depth fade and edge fade MULTIPLY rather than one overriding the other:
      // an item near the far end of the run should still be pale AND still
      // vanish at the seam. With no depth fade the depth term is simply 1.
      const u = st / STEPS;
      const edge = fadeEdges > 0 ? Math.min(1, Math.min(u, 1 - u) / fadeEdges) : 1;
      const depthOp = depthFade ? depthFade[0] + (depthFade[1] - depthFade[0]) * k : 1;
      if (fadeEdges > 0 || depthFade) f.opacity = (depthOp * edge).toFixed(3);
      if (depthBlur) f.filter = `blur(${(depthBlur * (1 - k)).toFixed(2)}px)`;
      frames.push(f);
    }

    const anims = els.map((el, i) =>
      el.animate(frames, {
        duration,
        iterations: Infinity,
        easing: "linear",
        // negative delay starts this item already part-way round the path
        delay: -((i * spread) / count) * duration,
        fill: "none",
      }),
    );
    const dir = direction === "reverse" ? -1 : 1;
    anims.forEach((a) => {
      a.playbackRate = dir;
    });
    animsRef.current = anims;
    // a run being held (a carousel rest, or the Pause button) stays held when
    // its animations are rebuilt
    if (ui.current.held) anims.forEach((a) => a.pause());

    // A marquee nobody is looking at should not advance. The old loop checked a
    // flag and returned early, which still cost a wake-up per frame; pausing the
    // animations costs nothing at all while off-screen.
    const io = new IntersectionObserver(
      // 11 Oct 2026: coming back on screen used to play() unconditionally,
      // which overrode both the carousel's rest and the Pause button: pause,
      // scroll away, scroll back, and the run was moving under a Play icon.
      // It resumes now only if nothing is holding it.
      ([e]) => anims.forEach((a) => (!e.isIntersecting ? a.pause() : ui.current.held ? undefined : a.play())),
      { threshold: 0 },
    );
    if (wrapRef.current) io.observe(wrapRef.current);

    return () => {
      io.disconnect();
      anims.forEach((a) => a.cancel());
      animsRef.current = [];
    };
  }, [
    reduce, speed, direction, spacing, spread, count, shown, easing,
    rollingZIndex, zBase, zRange, scaleRange, depthFade, depthBlur, fadeEdges, d,
  ]);

  // THE CAROUSEL (mu9trf5q: "this wave animation sort of plays like an
  // automated scroll carousel where one card is its focus and the center, then
  // it will play out and move to the next one").
  //
  // Nothing about the wave changes - the path, the spacing and the depth are
  // the same run. What changes is that it STOPS. The frame list already peaks
  // its scale and opacity at `t = 50%` (the triangle wave `k`), so "focused at
  // the centre" is not a new idea to build, it is a position that already
  // means something: the card at 50% is the biggest, nearest and sharpest.
  //
  // So the carousel is a cadence laid over the same animations: run for exactly
  // the phase gap between two cards, `(spread / count) x duration`, which is
  // how long one card takes to reach the place the previous one just left, then
  // hold for `dwell`. Starting every animation at `duration / 2` puts the first
  // card exactly at the centre, so the very first rest is aligned rather than
  // wherever the clock happened to be.
  useEffect(() => {
    if (!carousel || reduce) return undefined;
    // READ THE ANIMATIONS OFF THE ELEMENTS, not from animsRef. The ref is
    // filled by the effect above, but that effect returns early while the item
    // refs are still empty and re-runs later on deps this one does not share -
    // so a snapshot taken here can be, and was, permanently empty: the cadence
    // never fired and the run never rested. Asking the elements each time can
    // only ever see what is actually playing.
    const live = () =>
      itemRefs.current.filter(Boolean).slice(0, shown).flatMap((el) => el.getAnimations());
    const duration = (100 / speed) * 1000;
    const stepMs = Math.max(120, (spread / count) * duration);
    let timer = 0;
    let raf = 0;
    let stopped = false;
    // THE CADENCE SLEEPS OFF-SCREEN. The rest clock, the hop spring and the watch loop used to keep
    // going while the run was far below the fold: a rAF per frame writing currentTime on every
    // card (a style recalc each), a getBoundingClientRect per card per frame in the watch, and the
    // card videos restarted as each took the centre. Now each parks when the run leaves the
    // screen and picks up where it stopped when it returns (the dwell clock only counts time
    // on screen, so a card still gets its full rest).
    let inView = true;
    let parked = null; // the loop to restart when the run is back on screen
    const park = (fn) => { parked = fn; };
    const wrapIo = new IntersectionObserver(([e]) => {
      inView = e.isIntersecting;
      if (inView && parked) { const f = parked; parked = null; f(); }
    }, { threshold: 0 });
    if (wrapRef.current) wrapIo.observe(wrapRef.current);

    // STOP ON THE CENTRE, NOT ON A CLOCK. A fixed `stepMs` was the obvious
    // implementation and it drifted: measured, three successive rests landed
    // 196px, 151px then 107px from the middle, creeping ~45px each time.
    // `spacing="x"` remaps the path so that equal TIME is not equal DISTANCE,
    // so the interval between two cards reaching the centre is not a constant
    // and no single number can be the right one.
    //
    // So travel watches instead of counting: each frame it measures how far the
    // nearest card is from the middle of the run, and the moment that distance
    // starts GROWING again the card has just passed its closest approach, so it
    // stops there. That is exact whatever the path does, and it keeps working
    // if the shape, the spacing or the easing ever change. stepMs survives only
    // as a safety net, in case a frame budget or a hidden tab means the minimum
    // is never observed.
    const nearestGap = () => {
      const wrap = wrapRef.current;
      if (!wrap) return Infinity;
      const box = wrap.getBoundingClientRect();
      const mid = box.left + box.width / 2;
      let best = Infinity;
      for (const el of itemRefs.current.filter(Boolean).slice(0, shown)) {
        const r = el.getBoundingClientRect();
        if (!r.width) continue;
        best = Math.min(best, Math.abs(r.left + r.width / 2 - mid));
      }
      return best;
    };

    // the card resting on the centre carries data-focus (muksv25q: "when each video
    // reaches the center, it grows 20% and a caption with a metric or two shows
    // below"); the page styles it, travel clears it
    const setFocus = (on, only) => {
      const wrap = wrapRef.current;
      const els = itemRefs.current.filter(Boolean).slice(0, shown);
      els.forEach((el) => delete el.dataset.focus);
      if (!on || !wrap) return;
      if (only) { only.dataset.focus = "true"; return; }
      const box = wrap.getBoundingClientRect();
      const mid = box.left + box.width / 2;
      let best = Infinity, pick = null;
      for (const el of els) {
        const r = el.getBoundingClientRect();
        if (!r.width) continue;
        const g = Math.abs(r.left + r.width / 2 - mid);
        if (g < best) { best = g; pick = el; }
      }
      if (pick) pick.dataset.focus = "true";
    };
    const restItem = () => itemRefs.current.filter(Boolean).find((el) => el.dataset.focus) || null;
    // THE REST'S CLOCK. A card rests for ITS OWN dwell (a video: its length, so
    // it plays through once from the start; a still: the default). The clock
    // only runs while nothing holds the run: a "Stop" hover or keyboard focus
    // inside it freezes the clock (and, through "hold", the video and the ring),
    // and it carries on from where it was when released. Pause keeps the same
    // state across the effect's re-run (dwellState), so Play resumes the rest.
    const runDwell = () => {
      let last = performance.now();
      let frozen = false;
      const tick = () => {
        if (stopped) return;
        const st = dwellState.current;
        if (!st) return;
        const now = performance.now();
        const wrap = wrapRef.current;
        const kbd = wrap && wrap.contains(document.activeElement) && document.activeElement.matches(":focus-visible");
        // the browser's own :hover as well as the item events (one run missed a freeze with events alone)
        const hov = ui.current.hovering || !!wrap?.matches(":hover");
        const f = (hov && hoverModeRef.current === "pause") || kbd || document.hidden || !inView;
        if (f !== frozen) { frozen = f; cycle(f ? "hold" : "resume"); }
        if (!f) st.remaining -= now - last;
        last = now;
        if (st.remaining <= 0) { dwellState.current = null; travel(); return; }
        timer = setTimeout(tick, inView ? 50 : 250);
      };
      // a rest reached under a "Stop" hover is held from its first frame
      if ((ui.current.hovering || wrapRef.current?.matches(":hover")) && hoverModeRef.current === "pause") { frozen = true; cycle("hold"); }
      tick();
    };
    const hold = (resumeSame, only) => {
      if (stopped) return;
      ui.current.held = true;
      live().forEach((a) => a.pause());
      setFocus(true, only);
      const item = restItem();
      const rp = item?.getAnimations()[0]?.effect?.getComputedTiming().progress;
      if (typeof rp === "number") ui.current.restP = rp; // where a resting card sits (the drag's snap target)
      const prev = dwellState.current;
      if (resumeSame && prev && prev.item === item && prev.remaining > 0) {
        cycle("rest", { dwell: prev.total, remaining: prev.remaining, step: stepMs, item, resumed: true });
      } else {
        const ms = Math.max(300, (dwellForRef.current ? dwellForRef.current(item) : dwell) || dwell);
        dwellState.current = { item, total: ms, remaining: ms };
        cycle("rest", { dwell: ms, remaining: ms, step: stepMs, item, resumed: false });
      }
      runDwell();
    };
    // THE HOP IS A SPRING (11 Oct 2026, Agam: "on the wave transitions there is
    // a break at the end ... a jerk ... make it feel whimsical and free").
    // Before, the run played at full speed the instant it left a rest and was
    // paused dead at the centre when it arrived: a velocity step at both ends.
    // Now each hop is driven here, frame by frame, by the step response of a
    // damped spring on the run's ONE shared position (every item's animation
    // time moves by the same eased amount), so x, y (the wave), depth and the
    // parting all follow one value. It starts from zero speed, accelerates,
    // overshoots the centre a little (zeta 0.7: ~4.6% of a card step) and
    // settles back, with continuous velocity throughout. The distance L is the
    // resting card's progress minus the next card's (mod 1), exact for any
    // spacing, and the settled position IS the next card at the old rest, so
    // no centre-finding or wind-back is needed. A drag takes over (the legacy
    // watch below finishes the hop); a "Stop" hover freezes the spring.
    const travel = () => {
      if (stopped) return;
      const rest = restItem();
      const items = itemRefs.current.filter(Boolean).slice(0, shown);
      const as = items.map((el) => el.getAnimations()[0]);
      const idx = rest ? items.indexOf(rest) : -1;
      const prog = (a) => a?.effect?.getComputedTiming().progress;
      if (idx < 0 || as.some((a) => !a) || typeof prog(as[idx]) !== "number") return travelLegacy();
      const dir = direction === "reverse" ? -1 : 1;
      const pr = prog(as[idx]);
      let L = 1;
      as.forEach((a, i) => {
        if (i === idx) return;
        const dl = ((((pr - prog(a)) * dir) % 1) + 1) % 1;
        if (dl > 1e-4 && dl < L) L = dl;
      });
      const dur = as[0].effect.getTiming().duration;
      if (!(L < 1) || !(dur > 0)) return travelLegacy();
      setFocus(false);
      ui.current.held = true; // the animations stay paused; this loop owns their time
      cycle("travel", { step: stepMs });
      as.forEach((a) => a.pause());
      const t0 = as.map((a) => Number(a.currentTime) || 0);
      const { zeta, omega, lead = 0.12 } = springRef.current;
      // A spring fed a target that EASES IN (time constant `lead`, seconds): a
      // plain step response kicks at t = 0 (acceleration jumps from 0 to
      // omega^2); this one starts with zero speed AND zero acceleration, then
      // overshoots and settles like a spring. Integrated in 4 ms substeps, so
      // it follows real elapsed time however irregular the frames are.
      let u = 0, xs = 0, vs = 0;
      const sim = (ms) => {
        let r = ms / 1000;
        while (r > 1e-9) {
          const h = Math.min(0.004, r);
          u += (1 - u) * (1 - Math.exp(-h / lead));
          vs += (omega * omega * (u - xs) - 2 * zeta * omega * vs) * h;
          xs += vs * h;
          r -= h;
        }
      };
      const put = (s01) => {
        const delta = L * s01 * dir * dur;
        as.forEach((a, i) => {
          let ct = t0[i] + delta;
          if (ct < 0) ct += dur * Math.ceil(-ct / dur);
          a.currentTime = ct;
        });
      };
      let tms = 0;
      let last = performance.now();
      const step = (now) => {
        if (stopped) return;
        if (ui.current.dragging) { ui.current.held = false; return travelLegacy(); }
        if (!inView) { park(() => { last = performance.now(); raf = requestAnimationFrame(step); }); return; }
        const dt = Math.min(250, now - last); // real elapsed time (a stalled tab must not warp the hop)
        last = now;
        const frozen = (ui.current.hovering || wrapRef.current?.matches(":hover")) && hoverModeRef.current === "pause";
        if (!frozen) { tms += dt; sim(dt); }
        const settled = tms > 300 && Math.abs(1 - xs) < 0.0015 && Math.abs(vs) < 0.02;
        if (settled || tms > 4000) { put(1); hold(); return; }
        put(xs);
        raf = requestAnimationFrame(step);
      };
      raf = requestAnimationFrame(step);
    };
    const travelLegacy = () => {
      if (stopped) return;
      setFocus(false);
      ui.current.held = false;
      cycle("travel", { step: stepMs });
      if (inView) live().forEach((a) => a.play()); // off-screen the marquee's own observer plays them on return
      // start from the resting card's own gap: from Infinity the very first frame
      // read as "closing in", phase 1 began at once, and the run stopped one frame
      // after it started, so the wave sat still (annotation muju7nci)
      let prev = nearestGap();
      // THREE PHASES, because the nearest gap is a V, not a slope. Leaving the
      // rest, the card at the centre moves away and the gap GROWS; at some
      // point the next card becomes the nearest one and the gap SHRINKS again;
      // its closest approach is the bottom of that V and that is where to stop.
      // Watching only for "the gap grew" stopped on the first frame of the way
      // out - rests measured 45px, then 85px, and drifting.
      let phase = 0; // 0 = still leaving, 1 = the next card is approaching
      let lastT = performance.now();
      const watch = () => {
        if (stopped) return;
        if (!inView) {
          clearTimeout(timer);
          park(() => { lastT = performance.now(); prev = nearestGap(); raf = requestAnimationFrame(watch); timer = setTimeout(hold, duration); });
          return;
        }
        const now = performance.now();
        const frame = now - lastT;
        lastT = now;
        const gap = nearestGap();
        // ignore the first frames, while the card that was resting is still
        // the nearest one and is on its way OUT
        if (phase === 0 && gap < prev - 0.5) phase = 1;
        else if (phase === 1 && gap > prev + 0.5) {
          clearTimeout(timer);
          // The minimum is only visible one frame AFTER it happened, so the run
          // is a frame past centre by the time we know. Winding back that exact
          // frame is the difference between resting on the middle and creeping
          // past it: without this the rests walked out 6, 9, 13, 17px and kept
          // going.
          live().forEach((a) => {
            const t = a.currentTime;
            if (typeof t === "number") a.currentTime = Math.max(0, t - frame * Math.abs(a.playbackRate || 1));
          });
          hold();
          return;
        }
        prev = gap;
        raf = requestAnimationFrame(watch);
      };
      raf = requestAnimationFrame(watch);
      // SAFETY NET, and it has to be generous. At stepMs * 2 it was firing
      // before the centre was reached and pausing the run mid-travel: the rests
      // went 4, 6, 6 and then jumped to 115 and stayed out there, because every
      // later cycle started from the wrong place. A full lap is long enough
      // that only a genuinely stuck run (a hidden tab, a starved frame budget)
      // can trip it, which is the only thing it is for.
      timer = setTimeout(hold, duration);
    };

    // wait for the run to exist, then land the first card ON the centre rather
    // than starting wherever the clock happened to be
    let tries = 0;
    const start = () => {
      if (stopped) return;
      const anims = live();
      if (!anims.length) {
        if (tries++ < 180) raf = requestAnimationFrame(start);
        return;
      }
      // ALIGN ONCE PER SET OF ANIMATIONS, not on every run of this effect: it
      // also re-runs when `playing` flips, and re-aligning there snapped every
      // card to a new place the moment Pause or Play was pressed (11 Oct 2026).
      if (anims.some((a) => !a.apAligned)) anims.forEach((a) => { a.currentTime = duration / 2; a.apAligned = true; });
      // resuming from a Pause pressed mid-travel carries on to the next centre
      // instead of resting off-centre
      if (playing) (nearestGap() < 4 ? hold(true) : travel());
      else { ui.current.held = true; anims.forEach((a) => a.pause()); cycle("hold"); }
    };
    start();

    // THE AUTO-DRAG (mv847jvw, Agam: "when I reach this section on scroll this
    // section should do an auto drag so we show the flow of the widget, and speed
    // ramp it"). It is a hop, like travel() below, over SEVERAL cards: the same
    // spring on the same shared position, but chasing a target that is swept over
    // `ms` on a speed-ramped curve (slow take-off, a fast middle, a long landing)
    // instead of the hop's quick eased step. The spring's lag rounds the ramp's
    // corners and lands with a small overshoot onto the card that was `cards`
    // steps away, which then rests exactly as after a hop (dwell, ring, video,
    // sound gates all unchanged). The distance is measured like the hop's, card
    // progress to the rest position, so it is exact for any spacing, and it is
    // measured from wherever the run is, so a demo that starts mid-hop still
    // lands on a card. Returns a cancel that leaves the run where it is.
    ui.current.demo = (onDone) => {
      if (stopped) return null;
      const cfg = demoRef.current;
      const items = itemRefs.current.filter(Boolean).slice(0, shown);
      const as = items.map((el) => el.getAnimations()[0]);
      const prog = (a) => a?.effect?.getComputedTiming().progress;
      const home = ui.current.restP;
      const dur = as[0]?.effect?.getTiming().duration;
      if (!cfg || !(dur > 0) || typeof home !== "number" || as.some((a) => typeof prog(a) !== "number")) return null;
      const dir = direction === "reverse" ? -1 : 1;
      // forward distance from each card to the rest position, nearest first
      const ds = as.map((a) => ((((home - prog(a)) * dir) % 1) + 1) % 1).filter((x) => x > 1e-4).sort((a, b) => a - b);
      const gap = (spread / count) % 1 || ds[0];
      // the first card at least `cards` card-gaps away (a demo that starts mid-hop
      // does not end up shorter than asked)
      const L = ds.find((x) => x >= (cfg.cards - 0.5) * gap) ?? ds[ds.length - 1];
      if (!(L > 0 && L < 1)) return null;
      parked = null;
      clearTimeout(timer);
      cancelAnimationFrame(raf);
      dwellState.current = null;
      setFocus(false);
      ui.current.held = true;
      cycle("travel", { step: stepMs });
      as.forEach((a) => a.pause());
      const t0 = as.map((a) => Number(a.currentTime) || 0);
      const ramp = bezier(...cfg.ease);
      const { zeta, omega } = springRef.current;
      let xs = 0, vs = 0, tms = 0;
      const sim = (ms) => {
        let r = ms / 1000;
        while (r > 1e-9) {
          const h = Math.min(0.004, r);
          tms += h * 1000;
          vs += (omega * omega * (ramp(tms / cfg.ms) - xs) - 2 * zeta * omega * vs) * h;
          xs += vs * h;
          r -= h;
        }
      };
      const put = (s01) => {
        const delta = L * s01 * dir * dur;
        as.forEach((a, i) => { a.currentTime = (((t0[i] + delta) % dur) + dur) % dur; });
      };
      let live_ = true;
      let last = performance.now();
      const step = (now) => {
        if (stopped) { if (live_) { live_ = false; onDone?.(); } return; }
        if (!live_) return;
        if (ui.current.dragging) { live_ = false; onDone?.(); return; } // a drag took it (dragStart cleared the clocks)
        sim(Math.min(250, now - last)); // real elapsed time, as in the hop
        last = now;
        const settled = tms > cfg.ms && Math.abs(1 - xs) < 0.0015 && Math.abs(vs) < 0.02;
        if (settled || tms > cfg.ms + 3000) { live_ = false; put(1); hold(); onDone?.(); return; }
        put(xs);
        raf = requestAnimationFrame(step);
      };
      raf = requestAnimationFrame(step);
      return () => {
        if (!live_) return false;
        live_ = false;
        cancelAnimationFrame(raf);
        return true;
      };
    };

    // A DRAG TAKES THE RUN, AND HANDS IT BACK SNAPPED. dragStart stops the
    // carousel's own clocks (rest timer, hop spring, watch loop) so nothing
    // fights the pointer; dragEnd glides every card to the nearest card-at-
    // centre position (a short ease with a little overshoot, like the hop) and
    // then rests there exactly as after a hop, so the auto-run carries on.
    ui.current.dragStart = () => {
      parked = null;
      clearTimeout(timer);
      cancelAnimationFrame(raf);
      dwellState.current = null;
      setFocus(false);
      ui.current.held = true;
      cycle("travel", { step: stepMs });
    };
    ui.current.dragEnd = () => {
      if (stopped) return;
      const items = itemRefs.current.filter(Boolean).slice(0, shown);
      const as = items.map((el) => el.getAnimations()[0]);
      const prog = (a) => a?.effect?.getComputedTiming().progress;
      const dur = as[0]?.effect?.getTiming().duration;
      const home = ui.current.restP;
      let pick = null;
      const settle = () => { if (playing) hold(false, pick); else { setFocus(true, pick); cycle("hold"); } };
      if (!dur || typeof home !== "number" || as.some((a) => typeof prog(a) !== "number")) { settle(); return; }
      // the card to land on is named here, not re-found from the screen once
      // it arrives: the page's layout re-centres on whichever card rests, so a
      // geometric pick could choose the neighbour and shift the whole row a card
      let delta = Infinity;
      as.forEach((a, i) => {
        const dl = ((((home - prog(a)) % 1) + 1.5) % 1) - 0.5;
        if (Math.abs(dl) < Math.abs(delta)) { delta = dl; pick = items[i]; }
      });
      const t0 = as.map((a) => Number(a.currentTime) || 0);
      const MS = 520, c1 = 1.0, c3 = c1 + 1;
      const t_start = performance.now();
      const step = (now) => {
        if (stopped) return;
        if (ui.current.dragging) return; // grabbed again mid-snap
        const t = Math.min(1, (now - t_start) / MS);
        const e = 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2); // ease-out with a slight overshoot
        as.forEach((a, i) => {
          let ct = t0[i] + delta * e * dur;
          ct = ((ct % dur) + dur) % dur;
          a.currentTime = ct;
        });
        if (t < 1) raf = requestAnimationFrame(step);
        else settle();
      };
      raf = requestAnimationFrame(step);
    };

    return () => {
      ui.current.dragStart = null;
      ui.current.dragEnd = null;
      ui.current.demo = null;
      stopped = true;
      wrapIo.disconnect();
      clearTimeout(timer);
      cancelAnimationFrame(raf);
      setFocus(false);
      ui.current.held = false;
    };
  }, [carousel, playing, dwell, reduce, speed, spread, count, shown, d]);

  // WHEN THE AUTO-DRAG PLAYS: once per page load, the first time `threshold` of
  // the run is on screen AND the page has stopped scrolling. Waiting for the
  // scroll to settle matters twice over: a demo that runs while the page is still
  // moving is half missed, and the wheel or touch that is still scrolling the page
  // would cancel it on its first frame. Any real press, wheel, touch or key during
  // the demo cancels it where it is and hands the run to the drag's own snap, so
  // nothing jumps and a press that turns into a drag simply carries on from there.
  // Synthetic events (the site cursor's tour) are not the visitor and are ignored.
  const playingRef = useRef(playing);
  playingRef.current = playing;
  useEffect(() => {
    if (!demo || !carousel || reduce || demoPlayed) return undefined;
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return undefined;
    const wrap_ = wrapRef.current;
    if (!wrap_) return undefined;
    const threshold = demo.threshold ?? 0.4;
    const IDLE_MS = 300; // quiet time after the last scroll, wheel or touch move
    let seen = false, idle = 0, retry = 0, cancel = null;
    const INPUTS = ["pointerdown", "wheel", "touchstart", "keydown"];
    const SCROLLS = ["scroll", "wheel", "touchmove"];
    const unlisten = () => INPUTS.forEach((t) => window.removeEventListener(t, onInput, true));
    function onInput(e) {
      if (!e.isTrusted) return;
      unlisten();
      if (cancel?.()) { wrap_.dataset.demo = "cancelled"; ui.current.dragEnd?.(); }
      cancel = null;
    }
    const fire = () => {
      idle = 0;
      if (demoPlayed || !seen || document.hidden || !playingRef.current || ui.current.dragging) return;
      // data-demo is for the QA scripts: running, then done or cancelled
      cancel = ui.current.demo?.(() => { unlisten(); cancel = null; if (wrap_.dataset.demo === "running") wrap_.dataset.demo = "done"; }) || null;
      if (!cancel) { if (retry++ < 20) idle = setTimeout(fire, 250); return; }
      wrap_.dataset.demo = "running";
      demoPlayed = true;
      io.disconnect();
      SCROLLS.forEach((t) => window.removeEventListener(t, arm, true));
      INPUTS.forEach((t) => window.addEventListener(t, onInput, { capture: true, passive: true }));
    };
    function arm() {
      clearTimeout(idle);
      if (seen) idle = setTimeout(fire, IDLE_MS);
    }
    const io = new IntersectionObserver(([e]) => {
      seen = e.isIntersecting && e.intersectionRatio >= threshold - 0.001;
      arm();
    }, { threshold: [0, threshold] });
    io.observe(wrap_);
    // a wheel or touch move counts as scrolling even before the page moves (Lenis
    // eases the window after the wheel, and a notch can land between frames)
    SCROLLS.forEach((t) => window.addEventListener(t, arm, { capture: true, passive: true }));
    return () => {
      io.disconnect();
      clearTimeout(idle);
      SCROLLS.forEach((t) => window.removeEventListener(t, arm, true));
      unlisten();
      cancel?.();
    };
  }, [demo, carousel, reduce]);

  // Hover changes SPEED, and playbackRate is the whole mechanism. It is eased
  // rather than set, because a run that changes pace instantly reads as a
  // glitch. This ease is the only per-frame JS left in the component and it runs
  // for about a quarter second on enter and on leave — not forever.
  useEffect(() => {
    if (reduce || hoverMode === "none" || !slowOnHover) return undefined;
    const el = wrapRef.current;
    if (!el) return undefined;
    const dir = direction === "reverse" ? -1 : 1;
    let raf = 0;
    let cur = 1;
    // mttxa6up (09 Sep 2026): "base to hover should have a smooth ease in and
    // ease out, and the return to base should follow the same ramp". Both
    // directions are now one TIMED tween on the same ease-in-out curve, from
    // wherever the pace is to where it is going, so neither end is a snap:
    // slowing takes SLOW_MS, and speeding back up takes RAMP_MS on the same
    // curve, which keeps the "starts very slowly, so I can come back and
    // catch it" quality of the old exponential ramp (mttirtb7) without the
    // jump to 0.03 it used to begin with. A new target mid-tween restarts
    // from the current pace, so a quick in-and-out never stutters.
    const SLOW_MS = 900;
    const RAMP_MS = 2600;
    const easeInOut = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
    let tw = null; // { from, to, t0, dur }
    const target = () => (ui.current.hovering ? (hoverMode === "pause" ? 0 : slowFactor) : 1);
    const step = (now) => {
      const want = target();
      if (!tw || tw.to !== want) tw = { from: cur, to: want, t0: now, dur: want < cur ? SLOW_MS : RAMP_MS };
      const t = Math.min(1, (now - tw.t0) / tw.dur);
      cur = tw.from + (tw.to - tw.from) * easeInOut(t);
      const settled = t >= 1;
      if (settled) { cur = want; tw = null; }
      for (const a of animsRef.current) a.playbackRate = dir * cur;
      raf = settled ? 0 : requestAnimationFrame(step);
    };
    const kick = () => {
      if (!raf) raf = requestAnimationFrame(step);
    };
    // mttiqwmf ("pause on hover is not working"): the hover used to be the
    // ITEMS', so the run resumed in the gaps between cards. The whole run is
    // the hover region now: enter anywhere over it and it slows or stops;
    // leave it and the ramp above begins from wherever the pace is.
    // the ring's clock stops with the run under a "Stop" hover, and goes on after
    const onEnter = () => { ui.current.hovering = true; kick(); if (hoverMode === "pause") cycle("hold"); };
    const onLeave = () => { ui.current.hovering = false; kick(); if (hoverMode === "pause") cycle("resume"); };
    el.addEventListener("pointerenter", onEnter);
    el.addEventListener("pointerleave", onLeave);
    return () => {
      cancelAnimationFrame(raf);
      el.removeEventListener("pointerenter", onEnter);
      el.removeEventListener("pointerleave", onLeave);
    };
  }, [reduce, hoverMode, slowOnHover, slowFactor, direction]);

  const pointer = useRef({ x: 0, y: 0 });
  // A press only becomes a drag after it moves DRAG_PX, so a plain click on a
  // card still opens its link (and never stops the run); a drag swallows the
  // click that follows it.
  const DRAG_PX = 6;
  const down = useRef(null);
  const onDown = (e) => {
    if (!draggable || reduce) return;
    if (e.pointerType === "mouse" && e.button !== 0) return;
    down.current = { x: e.clientX, y: e.clientY, id: e.pointerId, el: e.currentTarget };
  };
  // Drag moves TIME, not position. Shifting currentTime slides every item along
  // the shared keyframe list at once — the same thing the old loop did by adding
  // to `base`, except it touches no styles and needs no frame of its own.
  const nudge = (pathPercent) => {
    const anims = animsRef.current;
    if (!anims.length) return;
    const dur = anims[0].effect.getTiming().duration;
    const shift = (pathPercent / 100) * dur;
    for (const a of anims) a.currentTime = (((Number(a.currentTime ?? 0) + shift) % dur) + dur) % dur;
  };
  const beginDrag = (e) => {
    try { down.current.el.setPointerCapture?.(e.pointerId); } catch { /* a pointer that is already gone */ }
    ui.current.dragging = true;
    ui.current.dragV = 0;
    cancelAnimationFrame(ui.current.glide || 0);
    // hold the run still under the finger; the hover ease does not own this
    for (const a of animsRef.current) a.playbackRate = 0;
    ui.current.dragStart?.();
    pointer.current = { x: down.current.x, y: down.current.y };
  };
  const onMove = (e) => {
    if (!draggable) return;
    if (!ui.current.dragging) {
      const d = down.current;
      if (!d || d.id !== e.pointerId || Math.hypot(e.clientX - d.x, e.clientY - d.y) < DRAG_PX) return;
      beginDrag(e);
    }
    const dx = e.clientX - pointer.current.x;
    const dy = e.clientY - pointer.current.y;
    // project onto the dominant axis: a path can double back, so raw magnitude
    // alone would make a drag left feel like a drag right on the return leg
    const delta = Math.abs(dx) >= Math.abs(dy) ? dx : dy;
    ui.current.dragV = delta * dragSensitivity;
    nudge(ui.current.dragV);
    pointer.current = { x: e.clientX, y: e.clientY };
  };
  const onUp = (e) => {
    if (!draggable) return;
    const wasDragging = ui.current.dragging;
    down.current = null;
    if (!wasDragging) return;
    ui.current.justDragged = true;
    setTimeout(() => { ui.current.justDragged = false; }, 0);
    try { e.currentTarget.releasePointerCapture?.(e.pointerId); } catch { /* already released */ }
    ui.current.dragging = false;
    // A flick keeps going and decays. This is the one place a short-lived rAF is
    // still right: it is a transient gesture, not a permanent engine, and it
    // stops the moment the throw runs out.
    const dir = direction === "reverse" ? -1 : 1;
    const resume = () => {
      const want = ui.current.hovering && hoverMode !== "none" && slowOnHover
        ? (hoverMode === "pause" ? 0 : slowFactor)
        : 1;
      for (const a of animsRef.current) a.playbackRate = dir * want;
      ui.current.dragEnd?.();
    };
    if (reduce || Math.abs(ui.current.dragV) < 0.04) {
      resume();
      return;
    }
    const glide = () => {
      ui.current.dragV *= dragDecay;
      if (Math.abs(ui.current.dragV) < 0.04) {
        ui.current.dragV = 0;
        resume();
        return;
      }
      nudge(ui.current.dragV);
      ui.current.glide = requestAnimationFrame(glide);
    };
    ui.current.glide = requestAnimationFrame(glide);
  };

  return (
    <div
      ref={wrapRef}
      className={`pm ${className}`}
      data-grab={draggable && !reduce ? "true" : undefined}
      onPointerDown={onDown}
      onPointerMove={onMove}
      onPointerUp={onUp}
      onPointerCancel={onUp}
      onClickCapture={(e) => { if (ui.current.justDragged) { e.preventDefault(); e.stopPropagation(); } }}
      // the depth ladder's top, for content that has to hold a real on-screen
      // size at the centre (the side-quests caption button, 11 Oct 2026).
      // Deliberately not --pm-smax: hello.css's hover maths reads that name
      // together with a live per-item scale this engine does not publish.
      style={{ "--pm-depth-max": scaleRange ? scaleRange[1] : 1 }}
    >
      {/* The svg is the SIZER: it establishes the aspect ratio so the absolutely
          positioned items resolve against the same box the path was drawn in.
          It also draws the path when showPath is on, which is how you tune one. */}
      <svg className="pm__svg" viewBox={viewBox} preserveAspectRatio="xMidYMid meet" aria-hidden>
        <path ref={svgPathRef} d={d} fill="none" stroke={showPath ? pathStroke : "none"} strokeDasharray={pathDash} />
      </svg>

      <div className="pm__layer" ref={layerRef} aria-hidden={false}>
      {items.map((it, i) => (
        <div
          key={it.key}
          ref={(el) => (itemRefs.current[i] = el)}
          className="pm__item"
          /* Hover lives on the ITEM, not the wrapper (annotation msd3i685:
             "hover over the screens and the moment stops"). On the wrapper it
             also fired over the empty space between cards, which made the run
             stall for no visible reason. pointerenter/leave rather than
             mouseenter/leave so a stylus or touch drag reports the same way. */
          onPointerEnter={() => {
            ui.current.hovering = true;
          }}
          onPointerLeave={(e) => {
            // only when the pointer leaves the RUN, not just this card (mttiqwmf)
            if (!e.currentTarget.closest(".pm")?.contains(e.relatedTarget)) ui.current.hovering = false;
          }}
          style={{
            offsetPath: `path('${d}')`,
            offsetRotate: rotate ? "auto" : "0deg",
            width: itemWidth,
            // the path was authored in viewBox units, so the items have to be
            // scaled by the same factor the svg is being scaled by
            "--pm-w": `${itemWidth}px`,
          }}
          aria-hidden={it.decorative ? "true" : undefined}
        >
          {it.child}
        </div>
      ))}
      </div>
    </div>
  );
}
