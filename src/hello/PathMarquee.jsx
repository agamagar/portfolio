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

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { PATH_PRESETS } from "./pathPresets";

const wrap = (v) => ((v % 100) + 100) % 100;
// Snap to a step. Used on every depth property so the DOM is only touched when
// the value crosses a step, instead of on every frame for a sub-pixel change.
const quant = (v, step) => Math.round(v / step) * step;
// The Z axis the depth ordering rides, in px. With no `perspective` this only
// sets stacking order (continuous), never size — the fx scale owns sizing. WITH
// a perspective (the "Perspective" depth), this same translateZ foreshortens, so
// the magnitude now also sets how strong the zoom is. Sized for that; the flat
// modes are unaffected because orthographic translateZ has no visual effect.
const Z_DEPTH = 180;

// NEARNESS: 1 at the centre of the run, 0 at both ends, and SMOOTH at all three
// (Agam, 2026-08-13: "need smoother"). It used to be the triangle 1-|t/50-1|,
// whose sharp corner at the centre made a card snap from growing to shrinking the
// instant it reached the middle — a velocity kink you could see. A raised cosine
// (sin² of the position) has zero slope at the peak and the ends, so a card eases
// up to full size/front, lingers, and eases back down. Drives the depth scale,
// the z-depth ordering, the fade and the blur, so the whole depth effect breathes
// on one smooth curve.
const nearness = (t) => 0.5 - 0.5 * Math.cos((t / 100) * 2 * Math.PI);

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
  dragSensitivity = 0.35,
  dragDecay = 0.94,

  // ---- depth -----------------------------------------------------------
  rollingZIndex = true,
  zBase = 1,
  zRange = 20,
  /** scale items as they travel, so the run reads as depth: [near, far] */
  scaleRange,
  /** step the scale is snapped to. Bigger = fewer re-rasters, still smooth. */
  scaleStep = 0.02,
  /** SHAPE of the growth along the run, as an exponent on the 0..1 nearness
   *  factor. 1 is the linear triangle this always had: an item is already half
   *  grown a quarter of the way in, which reads as "the cards are all roughly
   *  one size" (Agam, 2026-08-11). Above 1 holds them small for longer and
   *  concentrates the growth around the centre, so a card blooms as it arrives
   *  and folds away as it leaves. Applied to the fade and the blur too, so the
   *  whole depth effect keeps one curve rather than a size on one and an
   *  atmosphere on another. */
  scaleCurve = 1,
  /** Nearness above which an item counts as the one being LOOKED AT. Written to
   *  the element as `data-front`, for anything that should only appear at the
   *  peak - the AlongPath caption uses it. Set 0 to never mark one. */
  frontAt = 0,
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

  /** px of viewing distance for a real 3D perspective; 0 = orthographic (the
   *  translateZ then only orders the cards). Non-zero makes nearer cards zoom. */
  perspective = 0,

  reduce = false,
  /** OPTIONAL CONTROLS HANDLE (annotation msu925a2, "add this to the side quest
      section as well" - the phone row's toolbar). Set to a ref and it is filled
      with { nudge(steps), pause(), play(), isPaused() } so a bar outside can
      step and hold the run without owning any of its state. */
  apiRef,
  /** OPTIONAL PER-CHILD PITCH (Agam, 2026-08-15: four stills that "flow
      together as one entity ... still 4 separate containers"). 1 = a normal
      slot; a smaller number pulls a child in tight behind the one before it,
      so a run of children with pitch 0.35 rides the path as a TRAIN - four
      separate cards, one gap between them, moving as one. Positions and the
      animation delays are laid out from the cumulative pitches, normalised
      to the same total, so everything else keeps its spacing. */
  pitches,
}) {
  const wrapRef = useRef(null);
  const itemRefs = useRef([]);
  // The DEPTH SCALE lives on an inner wrapper, NOT on .pm__item. offset-path and
  // `scale` on the same element compose: the browser scales the motion-path
  // translation by the item's own scale, so a card at scale 0.3 gets only 30% of
  // its path displacement and collapses back toward the layer origin. Invisible
  // at "Size" depth (0.82..1.14) and catastrophic at "Golden" (0.24..1), which is
  // the default. Splitting the two onto nested elements is the fix: the item
  // carries offset-path and travels the full curve; the fx wrapper scales about
  // its own centre and never touches the path.
  const fxRefs = useRef([]);
  const svgPathRef = useRef(null);
  // Length->distance lookup for spacing="x". Built by sampling the path once.
  const xTable = useRef(null);
  // One mutable bag for the interaction state. It is a ref, not state, because
  // every field is read inside the rAF loop and none of them should re-render.
  const ui = useRef({ hovering: false, dragging: false, dragV: 0, factor: 1, paused: false });

  const spec = PATH_PRESETS[preset] || PATH_PRESETS.ribbon;
  const d = dProp || spec.d;
  // PRESET STOPS (Wave 2, Agam 2026-08-15: "not matching exactly"). Even
  // x-spacing puts item i at i/n of the width; a freeze frame drawn by hand
  // does not - Wave 2's nine cards cluster left, breathe around the hero and
  // bunch again top-right. A preset may carry `xs`: the x FRACTIONS its items
  // should sit at, in order, when the run is at a whole-item phase. warpX maps
  // even progress onto them piecewise-linearly (with a final knot at 1 so the
  // last card still runs off the right edge before it teleports), and sits in
  // front of the x-table, so the path stays monotone and the wrap stays a
  // single teleport. Between knots a card glides at that segment's pace.
  const warpX = useMemo(() => {
    const xs = spec.xs;
    if (!xs || xs.length < 2) return null;
    const knots = xs.map((x, i) => [i / xs.length, x]).concat([[1, 1]]);
    return (pct) => {
      const r = Math.min(1, Math.max(0, pct / 100));
      let i = 0;
      while (i < knots.length - 2 && r > knots[i + 1][0]) i++;
      const [r0, x0] = knots[i];
      const [r1, x1] = knots[i + 1];
      const f = r1 > r0 ? (r - r0) / (r1 - r0) : 0;
      return (x0 + (x1 - x0) * f) * 100;
    };
  }, [spec]);
  // PRESET SIZES (Wave 2, "exactly like the reference"): beside `xs` a preset
  // may carry `ss`, the card SCALE at each stop (hero = 1), read off the same
  // frame. When present it replaces the depth ladder's nearness curve as the
  // size at any progress - piecewise-linear between the stops, wrapping from
  // the last back to the first - so the freeze frame's size rhythm is the
  // run's, not a symmetric bell that merely resembles it.
  const scaleAt = useMemo(() => {
    const ss = spec.ss;
    if (!ss || ss.length < 2) return null;
    const n = ss.length;
    return (pct) => {
      const r = Math.min(1, Math.max(0, pct / 100)) * n; // 0..n
      const i = Math.min(n - 1, Math.floor(r));
      const f = r - i;
      const a = ss[i];
      const b = ss[(i + 1) % n];
      return a + (b - a) * f;
    };
  }, [spec]);
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
      // THE SAME TRANSFORM THE <svg> APPLIES, not an approximation of it, and
      // this is the fix for "the cards are not following the path".
      //
      // The svg is `preserveAspectRatio="xMidYMid meet"`, which means two things
      // this used to ignore. It scales by min(w/vbW, h/vbH) - the SMALLER of the
      // two - and then CENTRES the result in the leftover space. Scaling the
      // item layer by w/vbW alone matches only when the box happens to be
      // exactly the viewBox's aspect ratio, and matches the vertical placement
      // never.
      //
      // Measured on the live run: box 781x234 against a 1000x300 viewBox. The
      // svg scaled by 0.780 (height was the limit), the layer by 0.781, and the
      // svg then pushed its drawing down by the leftover half-pixel while the
      // layer stayed at the top. The tiles sat up to 103px above the curve and
      // drifted further along it the further they travelled - following a path
      // with the right shape in the wrong place.
      //
      // `meet` reproduced exactly: min() for the scale, half the slack for each
      // offset. Order matters - translate THEN scale, because the offsets are in
      // container pixels, not viewBox units.
      const cw = wrap_.clientWidth;
      const ch = wrap_.clientHeight;
      const k = vbH ? Math.min(cw / vbW, ch / vbH) : cw / vbW;
      const tx = (cw - vbW * k) / 2;
      const ty = (ch - vbH * k) / 2;
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
      layer.style.transform = `translate(${tx}px, ${ty}px) scale(${k})`;
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

  // Perspective on the layer, so the items' translateZ foreshortens (the
  // "Perspective" depth). perspective-origin left at the layer centre, which is
  // the middle of the run. Cleared to none when off, so every other depth stays
  // orthographic and the translateZ only orders the cards.
  useEffect(() => {
    const layer = layerRef.current;
    if (!layer) return;
    layer.style.perspective = perspective ? `${perspective}px` : "";
  }, [perspective]);

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
  // TRAINS (Agam, 2026-08-15, the four AIIMS stills: "4 separate containers
  // that flow together"). A child with pitch < 1 is COUPLED to the child
  // before it: it shares that leader's phase on the path and sits a fixed
  // distance AHEAD of it in path percent - `trainOff` - so the pace easing
  // (which stretches and squeezes gaps between independent items) cannot pull
  // the train apart: the coupling is applied AFTER the easing, per item, in
  // its own keyframes. `slotOf(i)` is the phase slot (leader's for a coupled
  // child), `trainOff(i)` the offset in %. Independent children are one slot
  // apart as before.
  const trainModel = useMemo(() => {
    const kids = Array.isArray(children) ? children : [children];
    const n = kids.filter(Boolean).length;
    const slots = [];
    const offs = [];
    if (!n) return { slotOf: (i) => i, trainOff: () => 0 };
    let slot = 0;
    let lastLead = 0;
    let off = 0;
    for (let j = 0; j < n; j++) {
      const p = pitches && Number.isFinite(pitches[j]) ? pitches[j] : 1;
      if (j > 0 && p < 1) {
        // coupled: same phase as the leader, offset accumulates
        off += p;
        slots.push(lastLead);
        offs.push(off);
      } else {
        // an independent child takes the next whole slot after everything
        // before it (including a preceding train's reach)
        slot = j === 0 ? 0 : slot + 1 + off;
        lastLead = slot;
        off = 0;
        slots.push(slot);
        offs.push(0);
      }
    }
    // normalise so one lap of the children spans n slots, as before
    const span = slot + 1 + off; // slots the lap actually used
    const k = n / span;
    return {
      slotOf: (i) => Math.floor(i / n) * n + slots[i % n] * k,
      trainOff: (i) => offs[i % n] * k,
    };
  }, [children, pitches]);
  const slotOf = trainModel.slotOf;
  const trainOff = trainModel.trainOff;

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
        // HANDS OFF WHILE SPACED OUT (msqrx3mm). This loop writes `scale` and
        // `offsetDistance` straight to the element, so with the row laid out it
        // was putting the depth ladder back on every frame - the tiles lined up
        // and evenly spaced, but still 24px to 78px wide. Cancelling the WAAPI
        // animations was not enough because this is a second writer.
        if (spacedRef.current) continue;
        const was = prev.current[i] || (prev.current[i] = {});
        let raw = wrap(base + (slotOf(i) * 100 * spread) / count);
        const phase = raw; // progress BEFORE the x-warp - what the stops index
        // Spacing by ARC LENGTH bunches items wherever a curve doubles back on
        // itself: the ribbon spends most of its length in the middle loop, so
        // the long tail out to the right edge ends up nearly empty and the run
        // reads as stopping short. spacing="x" remaps each item's position so
        // they are evenly spread across the path's WIDTH instead, which is what
        // the eye is actually judging on a wide horizontal run.
        if (spacing === "x" && xTable.current) raw = xTable.current(warpX ? warpX(raw) : raw);
        let t = easing ? Math.min(1, Math.max(0, easing(raw / 100))) * 100 : raw;
        // coupled children ride a fixed % ahead of their leader, post-easing
        const to = (trainOff(i) * 100 * spread) / count;
        if (to) t = (t + to) % 100;
        el.style.offsetDistance = `${t}%`;

        // nearness: 1 at the centre of the run, 0 at both ends, smooth at each.
        // Drives the z-depth here and the depth scale/fade below.
        const kLin = nearness(t);

        if (rollingZIndex) {
          // DEPTH ON A CONTINUOUS Z AXIS, peaking at the centre. The centre card
          // (nearest, biggest) rides highest on Z and is painted on top; the
          // browser sorts by this instead of a stepped z-index, so the reorder is
          // smooth (Agam, 2026-08-13). The WAAPI track below animates the same
          // translate, so during travel this interpolates frame to frame.
          const z = quant(kLin * Z_DEPTH, 0.5);
          if (z !== was.z) {
            was.z = z;
            el.style.translate = `0px 0px ${z}px`;
          }
        }

        if (scaleRange || scaleAt || depthFade || depthBlur || frontAt) {
          // ...then shaped, so the growth can be concentrated at the centre
          // rather than spread evenly across the whole lap. `** 1` is the
          // identity, so a run that does not ask for a curve pays nothing.
          const k = scaleCurve === 1 ? kLin : Math.pow(kLin, scaleCurve);

          if (scaleRange || scaleAt) {
            const fx = fxRefs.current[i];
            // QUANTISED, and this is the real optimisation. The artwork here is
            // photographic and arrives far larger than it is drawn, so every
            // DISTINCT scale is a fresh rasterisation of the image. Left
            // continuous, that is 24 re-rasters per frame for a difference no
            // one can see. Snapped to `scaleStep`, each item re-rasters only
            // when it crosses a step — a handful of times per lap — and the
            // motion is unaffected because the change is below a pixel.
            const s = quant(
              scaleAt ? scaleAt(phase) : scaleRange[0] + (scaleRange[1] - scaleRange[0]) * k,
              scaleStep,
            );
            if (s !== was.s) {
              was.s = s;
              // scale on the fx wrapper, --pm-s published on the item so the
              // caption (which lives inside fx) can still read and counter it.
              if (fx) fx.style.scale = String(s);
              // PUBLISHED, so a child can opt OUT of the scale. Everything in a
              // card is artwork and should grow with it; a caption is language
              // and should not - at the bloom's 1.8x it was rendering 1065px
              // wide and running off the window. Written only when the scale
              // itself changes, which is already quantised.
              el.style.setProperty("--pm-s", String(s));
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
          // THE PEAK, AS AN ATTRIBUTE. Only written when it changes, for the
          // same reason the z-index is: this runs every frame on every item,
          // and an attribute write that is not a change is a style
          // invalidation for nothing.
          if (frontAt) {
            const front = k >= frontAt;
            if (front !== was.f) {
              was.f = front;
              if (front) el.setAttribute("data-front", "true");
              else el.removeAttribute("data-front");
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
    [count, shown, easing, rollingZIndex, zBase, zRange, scaleRange, scaleStep, scaleCurve, frontAt, depthFade, depthBlur, spacing, spread, warpX, scaleAt, slotOf, trainOff],
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
      el.style.opacity = "";
      el.style.filter = "";
    }
    for (const fx of fxRefs.current) {
      if (fx) fx.style.scale = "";
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
  // The depth-scale animations, one per fx wrapper, index-aligned with animsRef.
  // Split out because scale must NOT ride the offset-path element (see fxRefs).
  const scaleAnimsRef = useRef([]);
  // Every place that pauses, resumes, drags or cancels the run has to move both
  // tracks together, or the scale desyncs from the position it belongs to.
  const allAnims = () => [...animsRef.current, ...scaleAnimsRef.current];
  useEffect(() => {
    if (reduce) return undefined;
    const els = itemRefs.current.filter(Boolean).slice(0, shown);
    if (!els.length || !speed) return undefined;
    // Same slice, aligned by index, for the depth-scale track.
    const fxEls = fxRefs.current.slice(0, shown);

    const STEPS = 120; // ~0.8% of the path per keyframe, finer than the eye reads
    const duration = (100 / speed) * 1000;
    const frames = [];
    // SCALE IS ITS OWN TRACK, on the fx wrapper — never on the item that carries
    // offset-path (see the fxRefs note). Same STEPS/timing/delay so the two stay
    // locked frame-for-frame; both bake to WAAPI and run off the main thread.
    const scaleFrames = [];
    for (let st = 0; st <= STEPS; st++) {
      const raw = (st / STEPS) * 100;
      const mapped = spacing === "x" && xTable.current ? xTable.current(warpX ? warpX(raw) : raw) : raw;
      const t = easing ? Math.min(1, Math.max(0, easing(mapped / 100))) * 100 : mapped;
      const f = { offset: st / STEPS, offsetDistance: `${t}%` };
      const k = nearness(t); // smooth raised cosine: near at mid-run, eased peak
      // CONTINUOUS 3D DEPTH, interpolated by WAAPI, so the stacking reorders
      // smoothly instead of stepping like a z-index (Agam, 2026-08-13). Peaks at
      // the centre; composes with the item's offset-path (position) since one is
      // `translate` and the other `offset-*`.
      if (rollingZIndex) f.translate = `0px 0px ${(k * Z_DEPTH).toFixed(2)}px`;
      if (scaleRange || scaleAt) {
        scaleFrames.push({
          offset: st / STEPS,
          scale: String(scaleAt ? scaleAt(raw) : scaleRange[0] + (scaleRange[1] - scaleRange[0]) * k),
        });
      }
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

    const dir = direction === "reverse" ? -1 : 1;
    const opts = (i) => ({
      duration,
      iterations: Infinity,
      easing: "linear",
      // negative delay starts this item already part-way round the path
      delay: -((slotOf(i) * spread) / count) * duration,
      fill: "none",
    });
    // COUPLED CHILDREN GET THEIR OWN FRAMES: the shared list shifted by their
    // train offset, with an explicit TELEPORT (two keyframes at one offset,
    // 100% then 0%) where the shifted position wraps - so WAAPI never tweens a
    // follower back across the whole run at its seam.
    const framesFor = (i) => {
      const to = (trainOff(i) * 100 * spread) / count;
      if (!to) return frames;
      const out = [];
      let prev = null;
      frames.forEach((f, idx) => {
        const base = parseFloat(f.offsetDistance);
        const t = (base + to) % 100;
        if (prev !== null && t < prev - 50) {
          const at = (idx - 0.5) / STEPS;
          out.push({ ...f, offset: at, offsetDistance: "100%" });
          out.push({ ...f, offset: at, offsetDistance: "0%" });
        }
        prev = t;
        out.push({ ...f, offsetDistance: `${t}%` });
      });
      return out;
    };
    const anims = els.map((el, i) => el.animate(framesFor(i), opts(i)));
    // The scale track runs on the fx wrappers, kept in animsRef too so the drag,
    // hover-ease and spaced-out effects pause/cancel it alongside the item track.
    const scaleAnims = scaleRange || scaleAt
      ? fxEls.map((fx, i) => (fx ? fx.animate(scaleFrames, opts(i)) : null)).filter(Boolean)
      : [];
    [...anims, ...scaleAnims].forEach((a) => {
      a.playbackRate = dir;
    });
    // Only the item animations drive position/time, so playbackRate eases and
    // drag nudges read from animsRef[0]; the scale track follows the same rates.
    animsRef.current = anims;
    scaleAnimsRef.current = scaleAnims;

    // A marquee nobody is looking at should not advance. The old loop checked a
    // flag and returned early, which still cost a wake-up per frame; pausing the
    // animations costs nothing at all while off-screen.
    const io = new IntersectionObserver(
      ([e]) => [...anims, ...scaleAnims].forEach((a) => (e.isIntersecting ? a.play() : a.pause())),
      { threshold: 0 },
    );
    if (wrapRef.current) io.observe(wrapRef.current);

    return () => {
      io.disconnect();
      [...anims, ...scaleAnims].forEach((a) => a.cancel());
      animsRef.current = [];
      scaleAnimsRef.current = [];
    };
  }, [
    reduce, speed, direction, spacing, spread, count, shown, easing,
    rollingZIndex, zBase, zRange, scaleRange, depthFade, depthBlur, fadeEdges, d, warpX, scaleAt, slotOf, trainOff,
  ]);

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
    const step = () => {
      // "space" is not a SPEED behaviour - it stops the run and rearranges it,
      // handled entirely by the spaced effect below (msqrx3mm). If this loop also
      // treated a hover as "slow", it would keep nudging playbackRate on
      // animations the spaced effect has cancelled, and worse, on the way OUT it
      // could resume them behind the rearrange. So here a hover means full speed;
      // the stop is the other effect's job.
      const slowing = ui.current.hovering && hoverMode !== "space";
      // a bar-driven pause (apiRef) is a hard 0 whatever the hover says
      const want = ui.current.paused ? 0 : slowing ? (hoverMode === "pause" ? 0 : slowFactor) : 1;
      // STOPPING IS INSTANT, resuming is eased (annotation msecmfwo: "the motion
      // should also completely stop on hover"). It DID stop before — playbackRate
      // reached 0 — but it eased there at 0.14 per frame, which is about 40 frames
      // or two thirds of a second of visible drift after the pointer arrives. That
      // reads as "it slowed down", not "it stopped".
      // Asymmetry is deliberate: a stop that lags feels unresponsive, while a
      // restart that snaps feels like a jolt, so only the stop is immediate.
      const stopping = want === 0 && cur > want;
      cur = stopping ? 0 : cur + (want - cur) * 0.14;
      const settled = Math.abs(want - cur) < 0.002;
      if (settled) cur = want;
      for (const a of allAnims()) a.playbackRate = dir * cur;
      raf = settled ? 0 : requestAnimationFrame(step);
    };
    const kick = () => {
      if (!raf) raf = requestAnimationFrame(step);
    };
    // DRIVE `hovering` FROM THE ELEMENT UNDER THE POINTER, at the wrapper, and
    // re-kick the ease on every boundary crossing (Agam, 2026-08-13: "on hover
    // stop is not working"). The previous version read a `hovering` flag that the
    // .pm__item set from its own onPointerEnter and kicked only on the WRAPPER's
    // pointerenter/leave. Two things broke Stop:
    //   1. .pm__item inherits `pointer-events: none` from .pm__layer (only the
    //      card is `auto`), so the item's own enter was unreliable; and
    //   2. even when `hovering` did flip, moving gap -> card INSIDE the wrapper
    //      fired no new wrapper pointerenter, so the ease had already settled at
    //      full speed and never re-ran.
    // `pointerover` bubbles from the card (which IS pointer-events:auto) to here
    // on every crossing, so it always lands; `closest('.ap__card')` says whether
    // the pointer is on a card right now. This is the one signal that is always
    // correct and always fires.
    const onOver = () => {
      // ANY pointerover within the run means the pointer is over the section, so
      // Stop stops (Agam, 2026-08-13: "on hover stop is not working"). The prior
      // version only counted a hover when the target was inside `.ap__card` - but
      // the gaps between cards are `pointer-events: none`, so over a gap the
      // target is the wrapper, `closest('.ap__card')` is null, and the run
      // resumed. `pointerover` only fires here while the pointer is inside the
      // run, which is exactly the condition Stop wants.
      ui.current.hovering = true;
      kick();
    };
    const onLeave = () => {
      ui.current.hovering = false;
      kick();
    };
    // pointerout is the robust leave: a grown/parted card overflows this wrapper,
    // so pointerleave can fire early and the run would stay stopped after the
    // pointer finally moves off (the "doesn't resume" half of the stuck-state
    // bug). pointerout bubbles from the overflowing card and its relatedTarget
    // says where the pointer went — outside the wrapper means truly gone, so
    // resume. Internal moves keep relatedTarget inside and are left to onOver.
    const onOut = (e) => {
      const to = e.relatedTarget;
      if (!to || !el.contains(to)) {
        ui.current.hovering = false;
        kick();
      }
    };
    el.addEventListener("pointerover", onOver);
    el.addEventListener("pointerleave", onLeave);
    el.addEventListener("pointerout", onOut);
    return () => {
      cancelAnimationFrame(raf);
      el.removeEventListener("pointerover", onOver);
      el.removeEventListener("pointerleave", onLeave);
      el.removeEventListener("pointerout", onOut);
    };
  }, [reduce, hoverMode, slowOnHover, slowFactor, direction]);

  // ── STOP AND SPACE OUT (msqrx3mm, Figma 138-2778) ────────────────────────
  // A second hover behaviour beside slow/pause: the run halts AND rearranges
  // into the straight, evenly-spaced row the frame draws, with the pointed tile
  // at phi^2.
  //
  // POSITIONED BY `left`, NOT BY offset-distance, and that is the whole trick.
  // You cannot tween between two different `offset-path` values - the property
  // is not interpolable - so "transition to something like this" is impossible
  // while the items are on a path at all. Dropping to `offset-path: none` hands
  // the layout back to `left`/`top`, which ARE interpolable, so the same
  // elements slide from wherever they were on the curve to their row without a
  // cut. The CSS for it lives in hello.css under `.pm[data-spaced]`.
  //
  // The items keep their animations - paused, not cancelled - so leaving the
  // section resumes the run from where it stopped rather than from the start.
  const [spaced, setSpaced] = useState(false);
  const spacedRef = useRef(false);
  spacedRef.current = spaced;
  // where each animation was when it was cancelled, so the run can pick up
  // mid-lap rather than restarting
  const resumeAt = useRef([]);
  useEffect(() => {
    if (hoverMode !== "space" || reduce) return undefined;
    const el = wrapRef.current;
    if (!el) return undefined;
    const enter = () => setSpaced(true);
    const leave = () => setSpaced(false);
    el.addEventListener("pointerenter", enter);
    el.addEventListener("pointerleave", leave);
    return () => {
      el.removeEventListener("pointerenter", enter);
      el.removeEventListener("pointerleave", leave);
      setSpaced(false);
    };
  }, [hoverMode, reduce]);

  useEffect(() => {
    if (hoverMode !== "space") return undefined;
    const els = itemRefs.current.filter(Boolean).slice(0, shown);
    if (!els.length) return undefined;
    // CANCELLED, NOT PAUSED, and the difference is the whole reason the first
    // attempt half-worked. A paused animation still APPLIES its current value,
    // and these keyframes carry `scale` - so the row came out straight and
    // evenly spaced with every tile frozen at whatever depth scale it happened
    // to hold (measured 24px to 92px across the nine). A WAAPI value beats both
    // the stylesheet and an inline style, so nothing in CSS could take it back.
    //
    // Cancelling drops the animation's contribution entirely and lets
    // `scale: var(--sk)` through. The cost is that cancel() forgets where the
    // run was, so the time is saved first and restored on the way out - the
    // marquee resumes mid-lap instead of snapping back to the start.
    if (!spaced) {
      // resume BOTH tracks to the same saved time so scale and position land
      // back in step when the run picks up mid-lap.
      animsRef.current.forEach((a, i) => {
        a.play();
        const t = resumeAt.current[i];
        if (t != null) a.currentTime = t;
      });
      scaleAnimsRef.current.forEach((a, i) => {
        a.play();
        const t = resumeAt.current[i];
        if (t != null) a.currentTime = t;
      });
      resumeAt.current = [];
      els.forEach((el) => {
        el.style.removeProperty("--sx");
        el.style.removeProperty("--sk");
      });
      // the fx wrapper's animated scale is gone with the cancel below on the way
      // IN; on the way OUT the resumed animation reapplies it, so nothing to clear
      return undefined;
    }
    resumeAt.current = animsRef.current.map((a) => a.currentTime);
    for (const a of allAnims()) a.cancel();
    // EVEN CENTRES ACROSS THE VIEWBOX, in the layer's own units, so the row
    // lands in the same coordinate space the path used and nothing has to know
    // about the container's pixel width.
    // `--sx` ONLY. An earlier version also wrote `--sk: 1` here to reset the
    // scale, and it fought the per-item hover: entering a tile set 2.618, this
    // effect then ran on the same state change and put it straight back to 1.
    // The scale belongs to whichever tile the pointer is on, so only the tile's
    // own handlers touch it, and the cleanup branch above clears it.
    els.forEach((el, i) => {
      el.style.setProperty("--sx", `${((i + 0.5) / els.length) * vbW}px`);
      // the depth scale lives on the fx wrapper now; clear it so the spaced row
      // is uniform and only the hovered tile's --sk (on the item) lifts it.
      const fx = fxRefs.current[itemRefs.current.indexOf(el)];
      if (fx) fx.style.scale = "";
      // CLEAR WHAT THE RUN LEFT BEHIND. Stopping the two writers is not the same
      // as undoing them: the rAF loop writes `scale`, `opacity` and `filter`
      // straight to the element, so whatever it wrote on its last frame stays
      // there forever once it stops. The row came out evenly spaced with the
      // tiles still 24-78px wide for exactly this reason - a stale inline value,
      // not a live one. Cleared so `scale: var(--sk)` in the stylesheet applies.
      el.style.scale = "";
      el.style.opacity = "";
      el.style.filter = "";
    });
    return undefined;
  }, [spaced, hoverMode, shown, vbW]);

  const pointer = useRef({ x: 0, y: 0 });
  const onDown = (e) => {
    if (!draggable || reduce) return;
    // try/catch, not just `?.`: setPointerCapture THROWS (not returns null) if the
    // pointer id is not active, which happens on touch when a gesture is already
    // being retargeted. A throw here would abort the drag setup entirely.
    try { e.currentTarget.setPointerCapture?.(e.pointerId); } catch { /* not capturable */ }
    // DRAG REVERTS HOVER TO DEFAULT (Agam, 2026-08-13: "if the cards are being
    // dragged the hover should revert to default automatically"). The flag lets
    // CSS drop the hover-grow while grabbing; the parted cards are cleared by
    // AlongPath on the same pointerdown (it bubbles up to the stage), and the
    // tilt self-resets because the captured pointer's target is the wrapper, not
    // a card. Clearing `hovering` keeps the ease from treating the held run as a
    // hover-stop.
    e.currentTarget.dataset.grabbing = "true";
    ui.current.hovering = false;
    ui.current.dragging = true;
    ui.current.dragV = 0;
    ui.current.downAt = { x: e.clientX, y: e.clientY, target: e.target };
    cancelAnimationFrame(ui.current.glide || 0);
    // hold the run still under the finger; the hover ease does not own this
    for (const a of allAnims()) a.playbackRate = 0;
    pointer.current = { x: e.clientX, y: e.clientY };
  };
  // Drag moves TIME, not position. Shifting currentTime slides every item along
  // the shared keyframe list at once — the same thing the old loop did by adding
  // to `base`, except it touches no styles and needs no frame of its own.
  const nudge = (pathPercent) => {
    const anims = animsRef.current;
    if (!anims.length) return;
    const dur = anims[0].effect.getTiming().duration;
    const shift = (pathPercent / 100) * dur;
    // both tracks, so scale slides with the position it belongs to
    for (const a of allAnims()) a.currentTime = Number(a.currentTime ?? 0) + shift;
  };
  // the outside handle (see the apiRef prop). Steps are ONE ITEM SPACING each,
  // read off the live animation count so a denser run steps by less.
  if (apiRef) {
    apiRef.current = {
      nudge: (steps) => {
        const n = animsRef.current.length || 1;
        nudge((steps * 100) / n);
      },
      pause: () => {
        ui.current.paused = true;
        for (const a of allAnims()) a.playbackRate = 0;
      },
      play: () => {
        ui.current.paused = false;
        const dir = direction === "reverse" ? -1 : 1;
        // hover state still applies; the hover loop re-evaluates on the next
        // crossing, this just gets it moving again now
        if (!ui.current.hovering) for (const a of allAnims()) a.playbackRate = dir;
      },
      isPaused: () => ui.current.paused,
    };
  }
  // EASE IN (annotation msuaxsrh, "drag is not smooth"): pointer moves no
  // longer nudge the run directly. They add to a PENDING amount that a
  // per-frame chase pays out at 30% of what is left, so a grab starts the run
  // softly and jitter in the hand is rounded off - the same chase the phone
  // row's drag got the same day. dragV keeps an EMA of the pace for the glide.
  const chase = () => {
    ui.current.chase = 0;
    const pending = ui.current.pending || 0;
    if (Math.abs(pending) < 0.02) {
      ui.current.pending = 0;
      return;
    }
    const step = pending * 0.3;
    ui.current.pending = pending - step;
    nudge(step);
    if (ui.current.dragging || Math.abs(ui.current.pending) >= 0.02) {
      ui.current.chase = requestAnimationFrame(chase);
    }
  };
  const onMove = (e) => {
    if (!draggable || !ui.current.dragging) return;
    const dx = e.clientX - pointer.current.x;
    const dy = e.clientY - pointer.current.y;
    // project onto the dominant axis: a path can double back, so raw magnitude
    // alone would make a drag left feel like a drag right on the return leg
    const delta = Math.abs(dx) >= Math.abs(dy) ? dx : dy;
    const v = delta * dragSensitivity;
    ui.current.dragV = (ui.current.dragV || 0) * 0.6 + v * 0.4;
    ui.current.pending = (ui.current.pending || 0) + v;
    if (!ui.current.chase) ui.current.chase = requestAnimationFrame(chase);
    pointer.current = { x: e.clientX, y: e.clientY };
  };
  // TRACKPAD SLIDE (annotation msuaxsrh, "not able to slide with trackpad"): a
  // horizontal wheel over the run nudges it through the same chase, so a
  // two-finger swipe reads exactly like a drag. Vertical wheel is left alone
  // for the page. The wrapper carries data-lenis-prevent-wheel so the site's
  // smooth-scroll layer does not swallow the horizontal deltas first.
  // Attached NATIVELY with passive:false - React registers wheel as passive,
  // so a preventDefault from an onWheel prop would be ignored and the page
  // would still scroll sideways under the swipe.
  const wheelRef = useRef(null);
  wheelRef.current = (e) => {
    if (!draggable || reduce) return;
    if (Math.abs(e.deltaX) <= Math.abs(e.deltaY)) return;
    e.preventDefault();
    const v = -e.deltaX * dragSensitivity;
    ui.current.dragV = v;
    ui.current.pending = (ui.current.pending || 0) + v;
    if (!ui.current.chase) ui.current.chase = requestAnimationFrame(chase);
  };
  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return undefined;
    const h = (e) => wheelRef.current?.(e);
    el.addEventListener("wheel", h, { passive: false });
    return () => el.removeEventListener("wheel", h);
  }, []);
  const onUp = (e) => {
    if (!draggable) return;
    // releasePointerCapture THROWS if the id is not an active captured pointer —
    // routine on mobile when a pointercancel ends the gesture. Guard it so the
    // cleanup below (grabbing flag, resume) always runs.
    try { e.currentTarget.releasePointerCapture?.(e.pointerId); } catch { /* already released */ }
    delete e.currentTarget.dataset.grabbing;
    ui.current.dragging = false;
    // (click-to-centre lived here for an hour on 2026-08-15 - annotation
    // msudr0pi - and was reverted the same day at Agam's request)
    // A flick keeps going and decays. This is the one place a short-lived rAF is
    // still right: it is a transient gesture, not a permanent engine, and it
    // stops the moment the throw runs out.
    const dir = direction === "reverse" ? -1 : 1;
    const resume = () => {
      const want = ui.current.paused
        ? 0
        : ui.current.hovering && hoverMode !== "none" && slowOnHover
          ? (hoverMode === "pause" ? 0 : slowFactor)
          : 1;
      for (const a of allAnims()) a.playbackRate = dir * want;
    };
    if (reduce || Math.abs(ui.current.dragV) < 0.05) {
      resume();
      return;
    }
    const glide = () => {
      ui.current.dragV *= dragDecay;
      if (Math.abs(ui.current.dragV) < 0.05) {
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
      /* the stylesheet swaps the whole layout off this one attribute - see
         `.pm[data-spaced]` in hello.css (msqrx3mm) */
      data-spaced={spaced ? "true" : undefined}
      onPointerDown={onDown}
      onPointerMove={onMove}
      onPointerUp={onUp}
      data-lenis-prevent-wheel
      /* THE LARGEST DEFAULT SIZE IN THE RUN, published for the hover (annotation
         msud22f1: "expand size should be 30% [over] the maximum default, the
         same for all cards, calculated on the maximum size of the card in the
         whole sequence in default state"). scaleRange[1] is exactly that - the
         top of the depth ladder - or 1 when a depth has no range. */
      style={{ "--pm-smax": spec.ss ? Math.max(...spec.ss) : scaleRange ? scaleRange[1] : 1 }}
      onPointerCancel={onUp}

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
          onPointerEnter={(e) => {
            ui.current.hovering = true;
            // The pointed tile's growth now lives ENTIRELY on the card hover
            // (--ap-hover, 1.3) so it is a clean "30% more" in every mode (Agam,
            // 2026-08-13). The old spaced-out pop wrote phi^2 (2.618) here, which
            // COMPOUNDED with the card scale to ~3.9x — the "expand is too much".
            // Held at 1 so the item adds nothing and the card scale is the whole
            // of it. Still written per-crossing rather than via state, for the
            // same reason as before: it is one number only CSS reads.
            if (spacedRef.current) e.currentTarget.style.setProperty("--sk", "1");
          }}
          onPointerLeave={(e) => {
            ui.current.hovering = false;
            if (spacedRef.current) e.currentTarget.style.setProperty("--sk", "1");
          }}
          style={{
            /* `none` while spaced out (msqrx3mm), and it has to be set HERE
               rather than in the stylesheet: this is an inline style, so a
               `.pm[data-spaced] .pm__item { offset-path: none }` rule loses to
               it every time. Measured that exact failure - the attribute flipped,
               the animations paused, and the items stayed on the curve. */
            offsetPath: spaced ? "none" : `path('${d}')`,
            offsetRotate: rotate ? "auto" : "0deg",
            width: itemWidth,
            // the path was authored in viewBox units, so the items have to be
            // scaled by the same factor the svg is being scaled by
            "--pm-w": `${itemWidth}px`,
          }}
          aria-hidden={it.decorative ? "true" : undefined}
        >
          {/* The depth scale goes HERE, not on .pm__item — see the note by
              fxRefs. This wrapper scales about its own centre, so the artwork
              grows and shrinks in place while the item above travels the path. */}
          <div className="pm__fx" ref={(el) => (fxRefs.current[i] = el)}>
            {it.child}
          </div>
        </div>
      ))}
      </div>
    </div>
  );
}
