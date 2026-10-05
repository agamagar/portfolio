// The phone row: real shipped screens, drifting right to left forever.
//
// Driven by requestAnimationFrame rather than a CSS keyframe, for one reason:
// the speed has to be able to change without the row jumping. Retargeting an
// animation-duration mid-flight moves the playhead and the whole strip snaps;
// a velocity that eases toward a target does not. That is what hover-to-slow and
// the pause control need.
//
// The row's speed is otherwise CONSTANT. It used to inherit page-scroll velocity
// so the phones would read as objects being carried past; that was an invention
// nobody asked for, and in use it just read as the row lurching every time you
// scrolled. Removed. Scrolling now does nothing to it.

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { flushSync } from "react-dom";
import PhoneDetail from "./PhoneDetail";
import PhoneDetail2 from "./PhoneDetail2";
import PhoneDetail3 from "./PhoneDetail3";
import ScrollBand from "./ScrollBand";
import ClipVideo from "./ClipVideo";
import InviteReveal from "./InviteReveal";
import AwayZeroState from "./AwayZeroState";
import { PHONES } from "./helloData";
import { feedback, feedbackCoalesced } from "../ui/feedback";
import ScanText from "./ScanText";
import { PHONE_FRAME_SRC } from "./FigmaPhone";

// Split a headline into plain runs and MARKED runs (the reference's purple
// phrases). ScanText lifts one substring; the 163:1325 headline has two, so
// this walks the marks in order and wraps each in `.hm__card-mark`.
function markRuns(text, marks = []) {
  // Returns [{word, mark}] - one entry per whitespace-separated word, flagged
  // when it falls inside a marked phrase. Words rather than runs because the
  // headline animates LINE BY LINE (Agam: "each line should animate
  // independently") and a line is a set of words that measure to the same
  // top; a run can span two lines and could not be split at render time.
  const spans = [];
  let rest = text;
  let cursor = 0;
  for (const m of marks) {
    const i = rest.indexOf(m);
    if (i < 0) continue;
    spans.push([cursor + i, cursor + i + m.length]);
    cursor += i + m.length;
    rest = rest.slice(i + m.length);
  }
  const out = [];
  const re = /\S+/g;
  let mt;
  while ((mt = re.exec(text))) {
    const a = mt.index;
    const mark = spans.some(([s0, s1]) => a >= s0 && a < s1);
    out.push({ word: mt[0], mark });
  }
  return out;
}

// THE HEADLINE, ONE LINE AT A TIME. Words are inline-block spans; after layout
// (and on any resize) each word is stamped with the index of the line it
// landed on, read off its offsetTop, and the CSS staggers the enter by that
// index. Words on one line share a delay, so a line rises as one piece; the
// next line follows a beat later. Measured after paint, so it is correct for
// whatever the wrap actually was rather than a guess at it.
function CardHead({ text, marks }) {
  const ref = useRef(null);
  const words = markRuns(text, marks);
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return undefined;
    const stamp = () => {
      const tops = [];
      for (const w of el.querySelectorAll(".hm__card-word")) {
        const t = w.offsetTop;
        let i = tops.findIndex((x) => Math.abs(x - t) < 2);
        if (i < 0) {
          tops.push(t);
          i = tops.length - 1;
        }
        w.style.setProperty("--line", i);
      }
    };
    stamp();
    const ro = new ResizeObserver(stamp);
    ro.observe(el);
    return () => ro.disconnect();
  }, [text, marks]);
  return (
    <span className="hm__card-head" ref={ref}>
      {words.map((w, i) => (
        // a REAL space between the spans: inline-blocks with nothing between
        // them cannot break, so the line would never wrap
        <span key={i}>
          {i > 0 ? " " : null}
          <span className={w.mark ? "hm__card-word hm__card-mark" : "hm__card-word"}>{w.word}</span>
        </span>
      ))}
    </span>
  );
}

// The shared element that morphs between the tile in the row and the enlarged
// phone in the detail view (View Transitions API).
const VT_NAME = "phone-hero";
const supportsVT = () => typeof document !== "undefined" && typeof document.startViewTransition === "function";

// Every cell currently renders the SAME complete Figma export, because that is
// what the drawn row contains: five instances of one composition. So the cells
// are not links right now — five identical phones each pointing somewhere
// different would be a lie about what the reader is looking at. They go back to
// being links (and back to per-project screens) the moment the instances in the
// file carry their own screens.
//
// Sizes, from the drawing: the device plate is 268.7 wide and the row's
// itemSpacing is 40. Narrow screens step the plate down; the gap steps with it
// in hello.css.
// What the row actually shows right now: one Figma composition, repeated.

// The plate width is no longer a constant here — it is a clamp in hello.css
// (`--hm-w`), for the reason recorded at its old home in the component below.

const BASE_SPEED = 26; // px per second at rest. Slow enough to read, never still.
// Zero, by Agam's call (annotation msbirffn). This used to be 7 on the reasoning
// that a fully stopped marquee reads as broken rather than paused. That holds
// for a row nobody asked to stop; it does not hold here, where stopping is the
// direct answer to a pointer being put on a screen to look at it. The easing in
// the tick still ramps it down rather than cutting, so it reads as settling.
const HOVER_SPEED = 0;
const EASE = 0.055; // per-frame approach to the target speed (the momentum feel)
// Three passes of the set, not two. Six phones at 240 is about 1700px, which is
// narrower than a wide desktop; with only two passes the wrap point becomes
// visible as a gap on a 1920 screen. Three always covers it.
const PASSES = 3;

// Category chips filter by PLATFORM, not by client (annotation msb7rom9): what
// separates these screens for a reader is where they run, not whose logo is on
// them. Fixed list rather than derived, so the set of tabs stays stable while
// the row's contents change.
const CATS = ["All", "Mobile", "Web"];

// The row uses the detail case-study FRAME (the layered black-bezel device) with
// ONE screen across all phones, exported from Figma (Portfolio 2026, node 6:536)
// — per annotation msb5qtg4: update the frame, keep the screenshot uniform.

// The Web TAB is uniform the same way the mobile row is (annotation msbevbyo):
// one desktop screen across every cell, rather than a mix of cropped phone plates
// and per-project shots. The All tab still shows each cell its own, which is what
// makes the mixed row read as a real mix.
const WEB_SCREEN = "/figures/dassh/onboarding.jpg";

// `detail` picks the overlay: "card" is the Evidence Card redesign used by
// /hello, anything else keeps the original. One marquee, two detail views, so
// the two pages can be compared with the row itself held constant.
// `ready` defaults TRUE so the other caller of this component (and any future
// one) behaves exactly as before: only /hello's Hello.jsx knows about the intro
// stage, and a row mounted anywhere else has no loading animation to wait for.
export default function PhoneMarquee({ reduce, onNavigate, detail, ready = true }) {
  // "drawer" is the scan-page bottom drawer (v2); "card" is the v1 Evidence
  // Card full page, preserved live on /hello and archived at /lab.
  const Detail =
    detail === "drawer" ? PhoneDetail3 : detail === "card" ? PhoneDetail2 : PhoneDetail;
  const trackRef = useRef(null);
  const viewRef = useRef(null);
  // OPENS ON "All" — and this reverses annotation msbw9pfk, because the reason
  // it gave has since stopped being true.
  //
  // That annotation started the row on Mobile so the Web tab would be an actual
  // change rather than a no-op. Then annotation mshucj5o HID the chips
  // (`display: none` in hello.css), and nobody noticed what that did to the
  // default: `cat` is stuck on "Mobile" forever, non-matching cells collapse to
  // zero width, and the two Web-platform screens — both Dassh — were silently
  // dropped from the row with no control left that could bring them back. Four
  // of six items, and the QA that found it (annotation mskcbuyh, "items are
  // breaking") is exactly right.
  //
  // A filter nobody can operate should not be filtering. If the chips are ever
  // un-hidden, "Mobile" as the opening state is worth reconsidering on its
  // original merits — but not while it is the only state there is.
  const [cat, setCat] = useState("All");
  // Expanded turns the travelling row into a static wrapped grid: the same cells,
  // all visible at once, for when scanning beats watching (annotation msbo7kgk).
  const [expanded, setExpanded] = useState(false);

  // AUTO-SCROLL ON TOGGLE (annotation mscsfuxw). Expanding turns one row into
  // three, and the grid is taller than the viewport — so without this the page
  // stays put and most of what just appeared is below the fold, which is why the
  // change did not read as a change.
  //
  // Scroll-anchoring the CLICKED CONTROL instead was the other option and is
  // worse here: the filter bar sits under the row, so pinning it would push the
  // top of the new grid off-screen upward. Whichever end is pinned, the other
  // leaves the viewport, and starting from the first row is the one that lets you
  // read the thing you just asked to see.
  //
  // useLayoutEffect, not useEffect: it runs after the reflow but BEFORE paint, so
  // the target position is the post-toggle one and the scroll never chases a
  // stale layout. Skipped on mount, or the page would jump to the row on load.
  const didToggle = useRef(false);
  useLayoutEffect(() => {
    if (!didToggle.current) {
      didToggle.current = true;
      return;
    }
    // "instant", not "auto": `auto` defers to CSS scroll-behavior, and index.css
    // sets that to smooth globally — so the reduced-motion path would have
    // animated anyway unless the media query happened to win.
    viewRef.current?.scrollIntoView({ block: "start", behavior: reduce ? "instant" : "smooth" });
  }, [expanded, reduce]);
  // which screen is expanded (index into PHONES), and a guard so the end of a
  // drag never counts as a click that opens the detail view.
  const [openIdx, setOpenIdx] = useState(null);
  const openIdxRef = useRef(null);
  openIdxRef.current = openIdx;
  // the row (and anything else behind the detail) freezes while it is open
  const detailOpenRef = useRef(false);
  detailOpenRef.current = openIdx != null;
  const draggedRef = useRef(false);
  // The exact <img> that was clicked, kept so the CLOSE morph can fly back to
  // that instance. Neither a selector nor the index is enough here: the marquee
  // renders PASSES copies of every cell, all carrying the same data-phone, so a
  // query would return whichever copy happens to be first in the DOM rather than
  // the one under the pointer (annotation msbeu52s).
  const originRef = useRef(null);

  // When the browser can do View Transitions, they own the open/close motion, so
  // the CSS entrance animations are turned off (they would otherwise be captured
  // at their faded first frame by the transition). Fallback keeps the CSS ones.
  useEffect(() => {
    document.documentElement.classList.toggle("hello-has-vt", supportsVT());
  }, []);

  // Open the detail with a shared-element morph: the clicked tile expands into
  // the enlarged phone. The name lives on the tile for the old snapshot, then on
  // the detail phone for the new one, so the browser tweens size + position.
  const openDetail = useCallback(
    (i, cellEl) => {
      const src = cellEl?.querySelector(".fig-screen");
      originRef.current = src || null;
      if (reduce || !supportsVT() || !src) {
        setOpenIdx(i);
        return;
      }
      src.style.viewTransitionName = VT_NAME;
      const vt = document.startViewTransition(() => {
        flushSync(() => setOpenIdx(i));
        src.style.viewTransitionName = "";
        const dest = document.querySelector(".pd__phone");
        if (dest) dest.style.viewTransitionName = VT_NAME;
      });
      vt.finished.finally(() => {
        const dest = document.querySelector(".pd__phone");
        if (dest) dest.style.viewTransitionName = "";
      });
    },
    [reduce],
  );

  // Close with the reverse morph: the enlarged phone collapses back to its tile.
  const closeDetail = useCallback(() => {
    const origin = originRef.current;
    if (reduce || !supportsVT()) {
      setOpenIdx(null);
      return;
    }
    const dest = document.querySelector(".pd__phone");
    if (dest) dest.style.viewTransitionName = VT_NAME;
    document.startViewTransition(() => {
      flushSync(() => setOpenIdx(null));
      // fly back to the SAME element that was clicked. This used to query
      // `.hm__cell[data-phone=N] .fp`, and the marquee renders no `.fp` at all
      // (its cells are `.fig-screen`), so the target was always null and the
      // return flight silently did nothing (annotation msbeu52s).
      if (origin && origin.isConnected) origin.style.viewTransitionName = VT_NAME;
    }).finished.finally(() => {
      if (origin) origin.style.viewTransitionName = "";
      if (dest) dest.style.viewTransitionName = "";
      originRef.current = null;
    });
  }, [reduce]);
  // WCAG 2.2.2 is Level A and asks for a MECHANISM to pause anything that moves
  // by itself for more than five seconds alongside other content. The hover
  // slowdown is not that: it never reaches zero (deliberately), and it does not
  // exist for keyboard or touch at all. prefers-reduced-motion is an OS setting,
  // which is a different criterion. So: a real control.
  const [paused, setPaused] = useState(false);
  const pausedRef = useRef(false);
  pausedRef.current = paused;
  // THE PLATE WIDTH IS NOT MEASURED HERE ANY MORE (annotation mskez8ax, "the
  // responsive spacing is not smooth"). It used to be a matchMedia listener on
  // the same 720px breakpoint hello.css uses, flipping the plate between 269px
  // and 188px — an 81px step change across a single pixel of resize, sitting
  // next to a gap that had already been made fluid. `--hm-w` is now a clamp in
  // hello.css with those same two numbers as its endpoints, so both of the row's
  // dimensions respond the same way and neither one jumps.

  // ── THE STEP CAROUSEL ───────────────────────────────────────────────────────
  //
  // This replaces the continuous drift wholesale (annotation msd8yh8c). The
  // previous engine — rAF velocity, hover slowdown, grab-to-drag, wheel, eased
  // arrow nudges — is kept intact in PhoneMarquee.jsx, which is "v1" and is what
  // /hello0 still renders. Nothing here is a modification of it.
  //
  // The sequence Agam specified is FOUR phases, and the order matters: the tile
  // must be back at its resting size BEFORE the row moves, and only grow once the
  // next one has arrived. So the scale and the travel never overlap — that is the
  // whole character of it, and it is why this is a state machine rather than one
  // transition doing both.
  //
  //   hold    3s, centred tile sitting at 1.15
  //   shrink  it returns to 1.0. Nothing travels yet.
  //   move    the row slides so the next tile reaches centre, everything at 1.0
  //   grow    the arrived tile goes to 1.15
  //
  // Durations MIRROR the M3 tokens the CSS transitions actually use — the CSS is
  // the source of truth and these only sequence the phases, so they must be read
  // off the tokens rather than chosen. --m3-dur-spatial-default is 500ms.
  const HOLD = 3000;
  const SHRINK = 500;
  const MOVE = 500;
  const GROW = 500;

  // Hoisted above the engine, which needs it — it used to sit just above the
  // render. Non-matching cells COLLAPSE out of the row on the single-platform
  // tabs (annotation msbftaje), guarded so a tab matching nothing collapses
  // nothing. The carousel needs it too: centring on a collapsed cell would park
  // the run on a gap.
  const hasMatch = cat !== "All" && PHONES.some((p) => p.platform === cat);
  const isOn = (i) => !(hasMatch && PHONES[i].platform !== cat);

  const [idx, setIdx] = useState(0);
  // "hold" | "shrink" | "move" | "grow" — drives both the timers and the scale
  const [phase, setPhase] = useState("hold");
  // True while a drag or trackpad gesture is live, which HOLDS the phase clock.
  // Declared here rather than beside the gesture code below, and that placement
  // is load-bearing: the clock effect lists `gesture` in its dependency ARRAY,
  // and a dep array is evaluated during render — so a `const` declared further
  // down the component throws a temporal-dead-zone ReferenceError and takes the
  // whole marquee out. (It did.)
  const [gesture, setGesture] = useState(false);
  // NOT BIG UNTIL THE PAGE HAS ARRIVED (annotation mso8at13). The row mounts in
  // `hold`, which is the settled phase, so the first cell was already at full
  // size in the first painted frame - it never appeared to expand, it was simply
  // there, growing behind the greeting while the greeting was still animating.
  // Gating `big` on `ready` means the cell sits at its resting width through the
  // intro and then performs the grow it was always meant to, once there is
  // nothing else on screen competing for the eye.
  const big = ready && (phase === "hold" || phase === "grow");

  // Centre a cell by MEASURING it rather than multiplying a step width: the row
  // mixes phone and browser frames, so the cells are not all the same width and
  // there is no single step to multiply.
  const centreOn = useCallback((i, animate) => {
    const track = trackRef.current;
    const view = track?.parentElement;
    const cell = track?.children[i];
    if (!track || !view || !cell) return;
    const to = view.clientWidth / 2 - (cell.offsetLeft + cell.offsetWidth / 2);
    // NOT the expressive curve. --m3-spatial-expressive-default is
    // cubic-bezier(0.38, 1.21, 0.22, 1) and that 1.21 OVERSHOOTS — it sails past
    // the target and settles back, which on a row that must land on a centre
    // reads as a wobble. (The same overshoot caused the marquee's one-way bounce
    // in msbwilc8.) cine-settle is easeOutQuint: a firm arrival, no return trip.
    track.style.transition = animate
      ? `transform ${MOVE}ms var(--m3-ease-cine-settle)`
      : "none";
    track.style.transform = `translate3d(${to}px, 0, 0)`;
  }, []);

  // THE ROW TELEPORTED INSTEAD OF SLIDING, and this split is the fix (annotation
  // msdf3z60, "animtion is not smooth").
  //
  // These used to be ONE layout effect with `idx` in its deps, calling
  // centreOn(idx, false) — transition NONE. useLayoutEffect runs BEFORE
  // useEffect, so on every step the sequence was: snap instantly to the new
  // position, then the animating effect sets a transition and writes the SAME
  // transform. Nothing left to travel, so the slide never happened at all. The
  // scale phases still animated, which is exactly what makes it read as "not
  // smooth" rather than "broken".
  //
  // So the two reasons to re-centre are now separated by INTENT:
  //   layout changed (mount, resize, filter, expand) -> snap, no animation
  //   the index changed                              -> animate
  // and the layout one reads the index from a ref so it cannot fire on a step.
  const idxRef = useRef(idx);
  idxRef.current = idx;
  const mounted = useRef(false);

  useLayoutEffect(() => {
    const snap = () => centreOn(idxRef.current, false);
    snap();
    const ro = new ResizeObserver(snap);
    if (trackRef.current) ro.observe(trackRef.current);
    // named, so it can actually be removed — the inline arrow this replaced was
    // added on every run and never taken off again
    window.addEventListener("resize", snap);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", snap);
    };
  }, [centreOn, cat, expanded]);

  // The travel. Every index change animates, including the arrows — which the
  // old phase-gated version did not: nudge() batches its way to "grow" without
  // ever passing through "move", so a manual step jumped.
  useEffect(() => {
    if (!mounted.current) {
      mounted.current = true;
      return;
    }
    centreOn(idx, true);
  }, [idx, centreOn]);

  const advance = useCallback(
    (dir) => {
      setIdx((cur) => {
        const order = PHONES.map((_, i) => i).filter(isOn);
        if (!order.length) return cur;
        const at = order.indexOf(cur);
        // indexOf is -1 when the filter just hid the current cell; -1 + 1 lands
        // on order[0], which is the right recovery rather than a crash.
        return order[(at + dir + order.length) % order.length];
      });
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [cat, hasMatch],
  );

  // The clock. One timer per phase, cleared on every change, so a pause or a
  // manual arrow press cannot leave a stale timeout to fire later and skip a step.
  // ONE definition of "the clock is running", because two things now depend on
  // it: the timer below, and whether a cell's own screen animation may play
  // (see ScrollBand at the cell). Stated once and read twice rather than
  // written out in both places, so a future condition added here cannot leave
  // a screen scrolling inside a carousel that has stopped.
  // `ready` is the newest term and the one the whole row now starts from: the
  // page's loading animation owns the screen until it is done, and a carousel
  // growing a cell and playing a video underneath it is two entrances competing
  // (annotation mso8at13). Because this expression ALSO gates every cell's
  // `playing` prop, one term here holds the dwell, the growth and the media
  // together - which is exactly why it was written once and read twice.
  const clockRunning = ready && !(reduce || paused || expanded || gesture || openIdx != null);

  // THE HOLD STRETCHES FOR A CELL THAT HAS A TOUR TO PLAY (annotation msk2fz7o,
  // "the animation length does not match the figma motion length").
  //
  // The screen animation was already the right LENGTH — 5s, straight off
  // `get_motion_context`. What did not match was how much of it you could ever
  // see: it plays only while its tile is centred, it resets when it stops, and
  // the hold was 3s. So the last two seconds — the deepest scroll and the run
  // back to the top — were unreachable. The clock was truncating a timeline that
  // was itself exact, which is a worse bug than a wrong duration because
  // everything you CAN see is correct.
  //
  // The max, not a replacement: a cell with no tour still gets the 3s beat the
  // row was tuned to, and only the one with something to play holds longer. The
  // row's rhythm becoming uneven is the honest outcome — a tile that has more to
  // show is worth more time, and forcing every cell to 5s would slow the whole
  // row for the four that have nothing to fill it with.
  // EVERY KIND OF CLOCK THIS TILE MIGHT CARRY, not just the scroll one
  // (annotation mskex8cl, "set the end time for schedule based on the video that
  // is playing inside the frame"). The first version only knew about
  // `scroll.duration`, so the Toppr tour got its 5s while the Zepto banner clip
  // — also 5s — was still cut off at the base 3s hold, purely because it arrives
  // by a different field.
  //
  // Taking the max across all of them holds a tile for as long as its longest
  // piece of content needs, and leaves a tile with nothing to play on the 3s beat
  // the row was tuned to. A third kind of media later is one more line here
  // rather than the same bug found a third time.
  // A clip cell's hold ends ON ITS LOOP BOUNDARY (annotation msl4a2rp, "loop
  // this as well so the transition is not abrupt"). Clips start at the top of
  // GROW (the msl441rp arrival fix), so the tile's total play window is
  // GROW + hold - and a hold of exactly one loop left the video 500ms into
  // its SECOND loop when the fade began, cutting the entrance mid-motion.
  // The window is now the smallest whole number of loops that clears the 3s
  // beat: the fade always lands on the composition reset. seconds is the
  // SOURCE length; a slowed clip (rate < 1) runs longer than its file says.
  const clipLoopMs =
    ((PHONES[idx]?.clip?.seconds || 0) / (PHONES[idx]?.clip?.rate || 1)) * 1000;
  // A small TAIL past the loop boundary (annotation msl5vhx8, "length should
  // be slightly longer to cover the looping video"): the boundary math is
  // exact but the playback is not - play() spins up a beat after the phase
  // clock starts and the fade-in spends 200ms - so a hold that ends ON the
  // boundary clips the loop's last moment. 350ms absorbs the startup drift;
  // the fade-out then leaves from the loop's quiet restart rather than its
  // final beat being cut.
  const CLIP_TAIL = 350;
  const holdMs = Math.max(
    HOLD,
    (PHONES[idx]?.scroll?.duration || 0) * 1000,
    clipLoopMs ? Math.ceil((HOLD + GROW) / clipLoopMs) * clipLoopMs - GROW + CLIP_TAIL : 0,
  );

  useEffect(() => {
    // ONLY THE DWELL WAITS ON THE CLOCK (annotation msneyi42). `clockRunning` is
    // false while hovering, dragging, paused or with a detail open - and it used
    // to freeze EVERY phase, which was fine while the clock was the only thing
    // that ever started a step. The arrows start one too, so a press with the
    // row paused would set "shrink" and stall there forever, half-collapsed.
    //
    // Pausing should stop the row STARTING new steps, not abandon one in the
    // middle. So "hold" - the dwell, the only phase that is a wait rather than a
    // movement - is the one that respects the pause; shrink, move and grow
    // always run to completion.
    if (!clockRunning && phase === "hold") return undefined;
    const next = {
      hold: [holdMs, () => setPhase("shrink")],
      shrink: [SHRINK, () => setPhase("move")],
      move: [MOVE, () => setPhase("grow")],
      grow: [GROW, () => setPhase("hold")],
    }[phase];
    const t = setTimeout(next[1], next[0]);
    return () => clearTimeout(t);
  }, [phase, clockRunning, holdMs]);

  // The travel itself happens on entry to "move", after the shrink has finished.
  useEffect(() => {
    if (phase !== "move") return;
    advance(dirRef.current);
    dirRef.current = 1; // back to forward for the clock's next step
  }, [phase, advance]);

  // ── DRAG AND TRACKPAD (annotation mse8qgw7) ─────────────────────────────────
  //
  // v1 had both and the rewrite dropped them. Adding them back to a STEP machine
  // is not the same job as adding them to a drift, because a carousel has to end
  // up centred on a tile: free movement has to RESOLVE. So the gesture moves the
  // row freely, and on release it settles onto whichever cell is nearest the
  // middle — the same centreOn() the auto-advance uses, so there is one landing
  // path rather than two.
  //
  // While a gesture is live the phase clock is HELD (`gesture`), or a hold timer
  // that started before the drag could fire mid-gesture and yank the row away
  // under the finger.
  const dragX = useRef(0);

  // Which cell is nearest the centre of the viewport right now. Measured, not
  // derived from the drag distance: the cells are not one width (phone vs
  // browser frames) so there is no step size to divide by.
  const nearestCell = useCallback(() => {
    const track = trackRef.current;
    const view = track?.parentElement;
    if (!track || !view) return idxRef.current;
    const mid = view.getBoundingClientRect().left + view.clientWidth / 2;
    let best = idxRef.current;
    let bestD = Infinity;
    [...track.children].forEach((cell, i) => {
      const r = cell.getBoundingClientRect();
      if (!r.width) return; // collapsed by the filter — never settle on a gap
      const d = Math.abs(r.left + r.width / 2 - mid);
      if (d < bestD) {
        bestD = d;
        best = i;
      }
    });
    return best;
  }, []);

  useEffect(() => {
    if (reduce) return undefined;
    const track = trackRef.current;
    const view = track?.parentElement;
    if (!track || !view) return undefined;

    const currentX = () => {
      const m = /translate3d\((-?[\d.]+)px/.exec(track.style.transform || "");
      return m ? parseFloat(m[1]) : 0;
    };

    // ── SCALE FOLLOWS THE DRAG (annotation mseesx1r) ─────────────────────────
    //
    // Settled, exactly one cell is big and CSS does it from `data-big`. That is
    // a STATE, and a state cannot describe a drag: hold the row halfway between
    // two frames and neither is centred. So while a gesture is live the scale
    // becomes a FUNCTION OF POSITION instead — each cell reads its own distance
    // from the middle of the viewport and sizes itself accordingly.
    //
    // The three choices Agam made:
    //   both neighbours part-scale at once, so the growth visibly passes from one
    //     frame to the next rather than swapping at the midpoint
    //   falloff is ONE PITCH — a cell is full size at centre and back to normal
    //     exactly as its neighbour arrives, so only ever two are involved
    //   the peak is the same 1.15 it settles at, so releasing never jumps
    //
    // Pitch is measured per cell from its nearest neighbour rather than assumed:
    // the row mixes phone and browser frames, so there is no single step width.
    // Smoothstep rather than linear — a linear ramp has a visible corner at the
    // moment a cell reaches centre, which reads as a click in the motion.
    const PEAK = 0.15;
    const paintScales = () => {
      const mid = view.getBoundingClientRect().left + view.clientWidth / 2;
      const cells = [...track.children];
      const centres = cells.map((c) => {
        const r = c.getBoundingClientRect();
        return r.width ? r.left + r.width / 2 : null;
      });
      cells.forEach((c, i) => {
        const cx = centres[i];
        if (cx == null) {
          c.style.removeProperty("--hm-grow");
          return;
        }
        let pitch = Infinity;
        centres.forEach((o, j) => {
          if (j === i || o == null) return;
          pitch = Math.min(pitch, Math.abs(o - cx));
        });
        if (!Number.isFinite(pitch) || pitch <= 0) pitch = view.clientWidth || 1;
        const t = Math.max(0, 1 - Math.abs(cx - mid) / pitch);
        const eased = t * t * (3 - 2 * t);
        // WRITE THE AMOUNT, NOT THE SCALE (annotation mskcti2v). CSS derives
        // both the scale and the neighbour-spacing margin from this one number,
        // so the gap opens as the tile grows instead of being eaten by it.
        c.style.setProperty("--hm-grow", String(eased));
      });
    };
    // Handing back to CSS: clearing the inline value lets the `data-big` rule and
    // its transition take over, so the settle eases from wherever the drag left
    // each cell rather than snapping.
    const releaseScales = () => {
      [...track.children].forEach((c) => {
        c.style.removeProperty("--hm-grow");
        c.style.removeProperty("--hm-frozen-m");
      });
    };
    // Written ONCE at grab, and BEFORE [data-drag] lands: that attribute
    // kills the transitions, and killing a mid-flight transition jumps every
    // property to its end value - grabbing during a step visibly popped both
    // tiles. So the grab first pins each cell's CURRENT visuals as inline
    // custom properties (margin share into --hm-frozen-m, scale share into
    // --hm-grow), each read from its own property because mid-step the two
    // disagree. The calc rules then resolve to exactly what is already on
    // screen, and the transitions die with nothing left to jump.
    // offsetWidth is the layout width --hm-w resolves to, unaffected by the
    // scale transform.
    const freezeGesture = () => {
      [...track.children].forEach((c) => {
        const cs = getComputedStyle(c);
        const m = parseFloat(cs.marginLeft) || 0;
        const full = (PEAK * c.offsetWidth) / 2;
        const frozen = full > 0 ? Math.max(0, Math.min(1, m / full)) : 0;
        const sc = cs.scale;
        const grow =
          sc && sc !== "none"
            ? Math.max(0, Math.min(1, (parseFloat(sc) - 1) / PEAK))
            : 0;
        c.style.setProperty("--hm-frozen-m", String(frozen));
        c.style.setProperty("--hm-grow", String(grow));
      });
    };

    let down = false;
    let startX = 0;
    let startT = 0;
    let moved = false;

    // ONE LAYOUT PASS PER FRAME (annotation mskg2a9o, "the drag is broken,
    // takes too long to see the transitions"). Since mskcti2v the drag writes
    // margin-inline on every cell per pointer event, and margins are LAYOUT -
    // a 120Hz pointer was forcing several full reflows of the track between
    // paints, and the drag chugged exactly where it used to glide. The pointer
    // events now only record the position; a single rAF applies the transform
    // and repaints the scales once per frame, which is the most any of it can
    // be seen anyway.
    // ── EASE IN, EASE OUT (Agam, 2026-08-15: "add ease in and out to the
    // phone drag so it's smooth overall"). Two halves:
    //   IN  the drawn position no longer equals the pointer position. The
    //       pointer sets a TARGET and the track follows it with a per-frame
    //       exponential chase (FOLLOW of the remaining distance each frame),
    //       so a grab starts the row moving softly and a sudden wiggle is
    //       rounded off instead of copied. ~30% per frame at 60Hz is a lag of
    //       a few frames - present as feel, absent as delay.
    //   OUT release measures the last velocity (an EMA of pointer speed) and
    //       PROJECTS where the row would coast to (v * COAST ms); the nearest
    //       cell to THAT point is chosen, and centreOn's own settle curve then
    //       carries the row there from wherever the finger let go. A flick
    //       therefore lands one further than a slow release from the same
    //       spot, and the deceleration is the settle ease rather than a stop.
    // Wheel keeps its own path below (it is already discrete deltas).
    // Still ONE LAYOUT PASS PER FRAME (mskg2a9o): the pointer only records,
    // the rAF paints.
    const FOLLOW = 0.3;
    const COAST = 160; // ms of virtual coasting for the projection
    let targetX = 0;
    let vel = 0; // px/ms, EMA
    let lastX = 0;
    let lastT = 0;
    let raf = 0;
    const paint = () => {
      // written straight, with no transition: the chase owns the position
      // while the pointer is down, and a CSS transition here would stack a
      // second lag on top of it.
      track.style.transition = "none";
      track.style.transform = `translate3d(${dragX.current}px, 0, 0)`;
      paintScales();
    };
    const chase = () => {
      raf = 0;
      const gap = targetX - dragX.current;
      if (Math.abs(gap) < 0.25) dragX.current = targetX;
      else dragX.current += gap * FOLLOW;
      paint();
      if (down && dragX.current !== targetX) raf = requestAnimationFrame(chase);
    };
    const schedule = () => {
      if (!raf) raf = requestAnimationFrame(chase);
    };
    // release paths measure the DOM, so a queued frame is flushed first -
    // settling against a position one frame stale picks the wrong cell at
    // speed
    const flushPaint = () => {
      if (raf) cancelAnimationFrame(raf);
      raf = 0;
      paint();
    };

    const onDown = (e) => {
      if (e.button != null && e.button !== 0) return;
      down = true;
      moved = false;
      startX = e.clientX;
      startT = currentX();
      dragX.current = startT;
      targetX = startT;
      vel = 0;
      lastX = e.clientX;
      lastT = e.timeStamp;
      setGesture(true);
      freezeGesture();
      view.setAttribute("data-drag", "true");
    };
    const onMove = (e) => {
      if (!down) return;
      if (Math.abs(e.clientX - startX) > 4) moved = true;
      targetX = startT + (e.clientX - startX);
      const dt = Math.max(1, e.timeStamp - lastT);
      vel = vel * 0.6 + ((e.clientX - lastX) / dt) * 0.4;
      lastX = e.clientX;
      lastT = e.timeStamp;
      schedule();
    };
    const settle = (e) => {
      if (!down) return;
      down = false;
      // a hold before release means no throw: a pause longer than a couple of
      // frames zeroes the velocity, so a slow drag lands where it stops
      const idle = e?.timeStamp ? e.timeStamp - lastT : 0;
      const v = idle > 80 ? 0 : vel;
      flushPaint();
      view.removeAttribute("data-drag");
      releaseScales();
      const next = nearestCell(v * COAST);
      setGesture(false);
      if (next !== idxRef.current) feedbackCoalesced("navigate");
      if (next === idxRef.current) centreOn(next, true);
      else setIdx(next);
      draggedRef.current = moved;
    };

    // Trackpad. Same resolve-on-idle shape as the drag: deltaX accumulates, and
    // 140ms after the last event the row settles onto the nearest cell. Only
    // horizontal intent is consumed — a vertical wheel has to keep scrolling the
    // page, and swallowing it would trap the reader in the section.
    let wheelIdle = 0;
    const onWheel = (e) => {
      if (Math.abs(e.deltaX) <= Math.abs(e.deltaY)) return;
      e.preventDefault();
      if (!wheelIdle) {
        dragX.current = currentX();
        down = false;
        setGesture(true);
        freezeGesture();
        view.setAttribute("data-drag", "true");
      }
      dragX.current -= e.deltaX;
      targetX = dragX.current; // the wheel path writes the position directly
      schedule();
      clearTimeout(wheelIdle);
      wheelIdle = setTimeout(() => {
        wheelIdle = 0;
        flushPaint();
        view.removeAttribute("data-drag");
        releaseScales();
        const next = nearestCell();
        setGesture(false);
        // same rule as the drag above: the trackpad is the same gesture with a
        // different input device, so it resolves the same way
        if (next !== idxRef.current) feedbackCoalesced("navigate");
        if (next === idxRef.current) centreOn(next, true);
        else setIdx(next);
      }, 140);
    };

    view.addEventListener("pointerdown", onDown);
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", settle);
    window.addEventListener("pointercancel", settle);
    // passive: false — Chrome makes wheel listeners passive by default, and a
    // passive listener is forbidden from calling preventDefault.
    view.addEventListener("wheel", onWheel, { passive: false });
    return () => {
      clearTimeout(wheelIdle);
      if (raf) cancelAnimationFrame(raf);
      releaseScales();
      view.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", settle);
      window.removeEventListener("pointercancel", settle);
      view.removeEventListener("wheel", onWheel);
    };
  }, [reduce, centreOn, nearestCell]);

  // Arrows drive the same machine rather than a second path through it: they set
  // the index and re-enter at "grow", so a manual step still lands on a tile that
  // is scaled up and still hands back to the 3s hold.
  //
  // SIGN CONVENTION, and it is the OPPOSITE of v1's (annotation mse8nxf9, "the
  // action is reversed for these buttons"). v1's nudge moved the ROW: +1 slid it
  // right, which brings the PREVIOUS screen into view. This one moves the INDEX:
  // +1 is the NEXT screen. The call sites were carried over from v1 unchanged
  // when the engine was rewritten, so both buttons did the opposite of their
  // label. Previous is -1 here and Next is +1; do not "fix" these back to match
  // v1's, they are correct for a machine that steps an index.
  // Which way the next "move" should travel. +1 is the clock's own direction;
  // an arrow sets it for one step only.
  const dirRef = useRef(1);
  const nudge = useCallback(
    (dir) => {
      // `navigate` — position changes within a sequence. The spec calls this the
      // lightest event, "or none", and it is deliberately NOT `boundary`: this
      // carousel WRAPS, so an arrow press can never hit an end. Firing boundary
      // here would be inventing a limit the interaction does not have.
      feedback("navigate");
      // ENTER THE SEQUENCE, DO NOT PERFORM IT (annotation msneyi42, "on click of
      // arrow the transition is not smooth").
      //
      // This used to be `setPhase("shrink"); advance(dir); setPhase("grow")` in
      // one handler. React batches state set in the same tick, so the shrink was
      // never rendered and the move never eased: the row simply jumped and
      // landed in "grow". The auto clock does the same journey properly -
      // shrink, then move, then grow - and the fix is to let the arrow start
      // that machine rather than reimplement it badly.
      //
      // The direction rides a ref because the "move" effect is what performs the
      // travel and it has no argument to receive one; it resets to +1 after use
      // so the clock's own steps keep going forward.
      dirRef.current = dir;
      setPhase("shrink");
    },
    [],
  );


  // ONE pass, unlike v1's three. The drift needed repeats so the wrap point was
  // never visible on a wide screen; this centres a SPECIFIC cell by index, and
  // duplicate copies would mean several cells answering to the same index.
  const passes = [PHONES];

  return (
    <section
      className="hm"
      ref={viewRef}
      aria-label="Screens from shipped work"
      data-reduce={reduce ? "true" : undefined}
      /* Web is not just a filter, it is a different device: the frames morph
         from phone to browser window (annotation msb897my). In "all" each cell
         takes its OWN platform's size, so the row shows both together
         (msbcmun7); the single-platform tabs force one size for every cell. */
      data-mode={cat === "All" ? "all" : cat === "Web" ? "web" : "mobile"}
      /* scopes the step carousel's CSS so v1, which shares every class name
         in here, cannot pick up the centred-tile scale */
      data-engine="step"
      /* the centred cell carries its own headline card (163:1325), so the bar's
         blurb stands down rather than saying the same thing twice underneath */
      data-card-active={PHONES[idx]?.active && cat !== "Web" && big ? "true" : undefined}
      /* --hm-hold is published from the JS constant rather than typed again in
         the CSS: the ring's job is to be TRUE about the dwell, and a duration
         written twice is a duration that will disagree after the first edit. */
      // no --hm-w: an inline custom property beats the stylesheet, so setting it
      // here is what would stop the clamp from applying at all
      /* holdMs, NOT the HOLD constant (annotation msl4ayr5, "match this to
         each frame's length"): holds are per-cell now - a tour or clip cell
         dwells for its media's whole-loop window - and a ring that always
         swept 3s was full and parked for the last seconds of every longer
         hold. The ring remounts on each step (key={idx}), so each cell's own
         length takes effect exactly when its dwell begins. */
      style={{ "--hm-hold": `${holdMs}ms` }}
    >
      {!reduce && (
        <button
          type="button"
          className="hm__pause"
          onClick={() => {
            feedback("toggle");
            setPaused((v) => !v);
          }}
          aria-pressed={paused}
        >
          {paused ? "Play the row" : "Pause the row"}
        </button>
      )}
      <div
        className="hm__view"
        data-expanded={expanded ? "true" : undefined}
        /* the row's own horizontal-wheel path (onWheel below) must see the
           trackpad before Lenis does - Lenis preventDefaults wheel it handles */
        data-lenis-prevent-wheel
      >
        <div className="hm__track" ref={trackRef}>
          {passes.map((set, pass) =>
            set.map((p, i) => (
              <button
                type="button"
                key={`${pass}-${i}`}
                className="hm__cell"
                data-phone={i}
                data-big={i === idx && big ? "true" : undefined}
                data-card={p.active && cat !== "Web" ? "true" : undefined}
                data-platform={p.platform}
                data-out={hasMatch && p.platform !== cat ? "true" : undefined}
                aria-hidden={pass > 0 ? "true" : undefined}
                tabIndex={pass > 0 ? -1 : undefined}
                aria-label={[p.brand, p.caption].filter(Boolean).join(": ")}
                onClick={(e) => {
                  // a drag that ends over a cell must not open the detail view
                  if (draggedRef.current) return;
                  // A CLICK SCROLLS THE SLIDER TO THAT SCREEN (annotation
                  // msugwd5i, then Agam: "no, clicking the frame is expanding
                  // the view - I want to stay in the slider view and scroll to
                  // the clicked screen"). So: point at a neighbour and the row
                  // brings it to centre; click the one already at centre and
                  // it opens, which is where the detail drawer now lives. In
                  // the GRID every frame is equally centred, so a click there
                  // opens the drawer directly.
                  const phone = i % PHONES.length;
                  if (!expanded && phone !== idx) {
                    feedback("navigate");
                    setIdx(phone);
                    return;
                  }
                  feedback("reveal");
                  openDetail(i, e.currentTarget);
                }}
              >
                <span className="hm__phone">
                  {/* No browser chrome: removed from web mode per annotation
                      msb9q6yk. The frame is now nothing but the screenshot. */}
                  {/* Simple iPhone layout (annotation msb6ziza): the screen PNG as
                      a rounded phone mockup with a drop-shadow (the site's
                      .fig-screen / SimpleIphoneLayout), no device bezel. */}
                  {/* A cell shows ITS OWN screen when it has one, falling back to
                      the shared row composition otherwise. msb5qtg4 kept every
                      cell uniform, which was right while they were all the same
                      device; a row that mixes phones and desktops cannot be, and
                      that is the point of msbepkpl. */}
                  {/* BARE SCREENS AGAIN (annotation msd8udjf, "revert back to the
                      old frames without the phone mocks"). This undoes msd1vfzk,
                      which had wrapped mobile cells in the layered FigmaPhone
                      device. Every cell is now the screenshot and nothing else,
                      which is where msb9q6yk / msb6ziza had it.
                      `p.screen || p.src` rather than plain `p.src`: the device
                      wrapper was reading `screen`, and several cells have a newer
                      screen there than in `src` (schedule delivery is the one that
                      actually differs). Dropping to `src` alone would have quietly
                      reverted those screens too, which is not what was asked. */}
                  <img
                    className="fig-screen hm__fig"
                    src={cat === "Web" ? WEB_SCREEN : p.scroll?.base || p.screen || p.src}
                    alt={pass === 0 ? [p.brand, p.caption].filter(Boolean).join(": ") : ""}
                    draggable="false"
                    loading="lazy"
                  />
                  {/* THE SCREEN SCROLLS ITSELF (annotation msjywvoj). Rebuilt
                      from how the source Figma frame draws its animation: a
                      short clipped viewport over a very tall content frame, the
                      content repeated below so a continuous upward travel never
                      shows a seam.

                      OVER the static screenshot, covering only the part that
                      moves — the status bar above and the sticky offer bar below
                      are pinned in the source frame too and the existing export
                      already carries both. Percentages come from the frame's own
                      numbers (see `scroll` in helloData), so the band lands on
                      the pixels it hides at any cell size.

                      BOTH MARQUEES CARRY THIS. /hello mounts the step carousel
                      and /hello0 the continuous drift, and the standing rule for
                      the pair is that only the motion ENGINE differs — same row,
                      same cells. A screen that scrolled in one and not the other
                      would break the comparison the two exist for. */}
                  {/* IT ONLY PLAYS AT CENTRE, WITH THE CLOCK RUNNING (Agam).
                      Two conditions, and both were already state this component
                      keeps — nothing new is observed or measured:

                        i === idx           this is the tile the carousel centres
                        phase === "hold"    and it has ARRIVED there
                        clockRunning        and the phase timer is ticking: not
                                            paused, not expanded into the grid,
                                            not mid-gesture, no detail open, not
                                            reduced motion

                      `phase === "hold"` is the one that makes this mean what was
                      asked. `idx` changes at the START of a step, so gating on
                      it alone starts the incoming tile scrolling while it is
                      still travelling and stops the outgoing one before it has
                      left — the screen would be animating at every position
                      except the centre. "hold" is the phase where the tile is
                      sitting still at centre at 1.15, which is exactly "in view
                      at the center".

                      `clockRunning` is the same expression the phase clock
                      itself guards on, read from one place rather than restated,
                      so the tour can never run while the row it belongs to is
                      frozen. A screen quietly scrolling inside a stopped
                      carousel is motion with nothing driving it. */}
                  {/* The CaratLane screen is rebuilt from its Figma motion
                      cohort rather than shown as a still (annotation msk5ybfa).
                      OVER the static export rather than instead of it: the
                      detail morph flies from `.fig-screen`, so removing that img
                      would take the open animation with it. */}
                  {/* A CLIP OVER ONE BAND of the still (annotation mskdb3xr).
                      Not a whole-screen rebuild like the two reveals — only the
                      banner moved in the real product, so only the banner is a
                      video here. muted + playsInline keep autoplay legal on iOS;
                      `reduce` falls back to the still underneath by simply not
                      rendering the clip, which is the one case where doing
                      nothing is the correct reduced-motion behaviour. */}
                  {/* "grow" is included for CLIPS, unlike the coded tours
                        below (msl441rp motion QA): a clip's first frame is the
                        EMPTY start of its composition while the still under it
                        is the ARRIVED state, so swapping at the hold boundary
                        flashed a finished screen back to empty on a tile that
                        had just landed - worst on the two full-screen video
                        cells, the exact "3rd and 4th frame" called out. Started
                        during the grow instead, the entrance builds while the
                        tile is still arriving and the swap hides inside the
                        motion. The tours keep hold-only gating: their reveal
                        IS the arrived state, so they have no such flash. */}
                  {cat !== "Web" && p.clip && !reduce && (
                    <ClipVideo
                      clip={p.clip}
                      playing={i === idx && (phase === "hold" || phase === "grow") && clockRunning}
                    />
                  )}
                  {cat !== "Web" && p.reveal === "awayZeroState" && (
                    <AwayZeroState playing={i === idx && phase === "hold" && clockRunning} reduce={reduce} />
                  )}
                  {cat !== "Web" && p.reveal === "caratlaneInvite" && (
                    <InviteReveal playing={i === idx && phase === "hold" && clockRunning} />
                  )}
                  {cat !== "Web" && p.scroll && (
                    <ScrollBand
                      scroll={p.scroll}
                      reduce={reduce}
                      playing={i === idx && phase === "hold" && clockRunning}
                    />
                  )}
                  {/* THE DEVICE BEZEL, ACTIVE ONLY (Portfolio 2026 node 163:1325,
                      Agam 2026-08-15). The bare screenshot is the row's resting
                      form (msd8udjf); the reference draws the centred CaratLane
                      screen INSIDE the iPhone plate, so the plate fades in over
                      the still when the cell is big and out again when it steps
                      away. Same PNG FigmaPhone layers, same geometry: plate
                      268.7x549.3 around a 240x522 screen. */}
                  {cat !== "Web" && p.active?.bezel && (
                    <img className="hm__bezel" src={PHONE_FRAME_SRC} alt="" aria-hidden draggable="false" loading="lazy" />
                  )}
                </span>
                {/* THE ACTIVE CARD (node 163:1325 "Frame 48096636"): a rounded
                    plate BEHIND the phone with the headline UNDER it. Sized off
                    the phone (fractions of --hm-w / phone height in CSS) so it
                    grows with the cell's 1.15 scale and the card's headline
                    stands in for the bar's blurb while this cell is centred. */}
                {cat !== "Web" && p.active && (
                  <span
                    className="hm__card"
                    style={{ "--card-bg": p.active.card, "--card-ink": p.active.ink, "--card-mark": p.active.mark }}
                    aria-hidden
                  >
                    {/* a card without its own headline carries the cell's blurb
                        and scan (msu558a9 put a card on every phone; only
                        CaratLane's node wrote a headline) */}
                    <CardHead
                      text={p.active.headline || p.blurb || ""}
                      marks={p.active.marks || (p.scan ? [p.scan] : [])}
                    />
                  </span>
                )}
                {/* The dwell rings USED to hang under each cell (annotation
                    msht9pbm); annotation mshtlsdk moved them into the toolbar,
                    where they read as one progress strip instead of five marks
                    scattered across the imagery. See .hm-filter__dwell below. */}
              </button>
            )),
          )}
        </div>
      </div>

      {/* THE BAR IS TWO THINGS NOW (annotation msq2f0z8, "add this component to a
          div and add a heading component above this which changes from screen to
          screen"). Wrapped rather than dropped in as a sibling of the section so
          the heading travels with the controls it belongs to.

          NO MEASURING HERE, unlike the drift engine's version of this in
          PhoneMarquee.jsx: the step carousel already knows which screen it is
          on - `idx` IS the answer - so the heading reads the same state the
          carousel steps. That is also why it can never disagree with what is on
          screen, which a measured answer can for a frame or two. */}
      <div className="hm-bar">
        {/* COMMENTED OUT (annotation msu8fxr4, "comment this out"): the
            centred cell's own headline card carries the blurb now (msu558a9
            put one on every phone), so the bar's line said it twice. Kept in
            place rather than deleted - it is the aria-live announcement of the
            current screen and the ScanText usage, and it comes back by
            uncommenting.
        <p className="hm-bar__head" aria-live="polite">
          {/* KEYED BY THE SLIDE (annotation msqxhtcx, "with every slide the text
              should also animate"). The <p> holds the aria-live region and stays
              mounted so the swap is announced once; the inner span is keyed by
              `idx`, so React tears it down and builds a new one on every step -
              which restarts its enter animation. Keying the <p> itself would
              re-announce, and a plain text swap has no element to animate. * /}
          {/* A SMALL EXPLAINER, not the brand · caption label (annotation
              msrq817u, "instead of works, write a small explainer for each,
              with all text as 50% grey and scannable text as 90% white"). The
              blurb already existed in the data for the case-study detail; this
              is its first use as the row's own heading. Falls back to the old
              label on a phone with no blurb, so nothing goes blank. * /}
          <span key={idx} className="hm-bar__head-text">
            {PHONES[idx]?.blurb ? (
              <ScanText text={PHONES[idx].blurb} scan={PHONES[idx].scan} />
            ) : (
              [PHONES[idx]?.brand, PHONES[idx]?.caption].filter(Boolean).join(" · ") || " "
            )}
          </span>
        </p>
        */}
      <div className="hm-filter">
        <div className="hm-filter__nav">
          <button type="button" className="hm-filter__arrow" onClick={() => nudge(-1)} data-tip aria-label="Previous screens">
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden>
              <path d="M11 4l-5 5 5 5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          <button type="button" className="hm-filter__arrow" onClick={() => nudge(1)} data-tip aria-label="Next screens">
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden>
              <path d="M7 4l5 5-5 5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>
        <div className="hm-filter__chips" role="tablist" aria-label="Filter screens by project">
          {CATS.map((c) => (
            <button
              key={c}
              type="button"
              role="tab"
              aria-selected={cat === c}
              className="hm-filter__chip"
              data-active={cat === c ? "true" : undefined}
              onClick={() => {
                // a choice commits — `select`, the lightest of the discrete events
                if (c !== cat) feedback("select");
                setCat(c);
              }}
            >
              {c}
            </button>
          ))}
        </div>

        {/* THE DWELL STRIP (annotations msht9pbm, then mshtlsdk moved it here).
            One ring per screen, the active one filling grey -> ink over the
            3000ms hold, then the row steps.

            IN THE TOOLBAR RATHER THAN ON THE CELLS, which is what mshtlsdk asked
            for and is the better place regardless: five rings scattered under
            five screenshots are five marks competing with the work; gathered
            into the control bar they become one progress strip that reads left
            to right and says both "which of five" and "how long left" at once.
            It sits with the controls because it describes the row's clock, and
            everything else that governs that clock is already here.

            aria-hidden: the pause button and the arrows are the accessible
            controls for this behaviour, and a screen reader being told a ring is
            62% full every three seconds is noise, not information.

            It is tied to the `hold` phase and nothing else, which is the only
            honest thing it can measure: hold is the dwell, and the
            shrink/move/grow that follow are the handover, already legible
            because the tile is visibly shrinking and travelling. A ring that
            kept sweeping through those would claim the wait is 4500ms when the
            wait a reader experiences is 3000.

            NO JS PER FRAME. `data-run` toggles the animation on and off, and
            removing then re-adding an animation is what restarts it, so each
            ring re-arms itself on its turn for free. PAUSING IS A SEPARATE
            ATTRIBUTE: clearing data-run was the first attempt and it removed the
            animation outright, snapping the ring back to empty, so pausing
            mid-dwell erased the progress the ring exists to report. */}
        <div className="hm-filter__dwell" aria-hidden>
          {/* ONE ring, not one per screen (annotation mshtxt3a, "a single loader
              will do the job"). The per-screen strip was answering a question
              nobody had: which screen you are on is already unmissable — that
              tile is the big one — so five extra rings were spending width to
              repeat it, and only the sixth mark carried anything new. The
              question the row actually leaves open is WHEN it moves, and one
              ring answers that completely.

              `key={idx}` remounts the ring on every step, which restarts the
              animation. With six rings the restart came free (each one's
              data-run toggled on its own turn); with one ring that stays
              mounted across steps, CSS would keep the old animation running and
              the sweep would drift out of phase with the row. */}
          <span
            key={idx}
            className="hm__ring"
            data-run={phase === "hold" ? "true" : undefined}
            data-held={
              reduce || paused || expanded || gesture || openIdx != null
                ? "true"
                : undefined
            }
            data-active="true"
          >
            <svg viewBox="0 0 24 24">
              <circle className="hm__ring-track" cx="12" cy="12" r="10" />
              <circle className="hm__ring-fill" cx="12" cy="12" r="10" />
            </svg>
          </span>
        </div>

        {/* A THIRD section, matching the arrows and the tabs (annotation
            msbo7kgk). It gets the same short centred tick as a divider, mirrored
            to sit on its left, so the bar reads as three groups rather than two
            plus a stray button. */}
        <div className="hm-filter__tools">
          <button
            type="button"
            className="hm-filter__expand"
            aria-pressed={expanded}
            data-tip aria-label={expanded ? "Collapse to a single row" : "Expand to see every screen"}
            onClick={() => {
              // expanding turns one row into a grid: content arrives that was not
              // there, which is `reveal`. Collapsing is the same transition back,
              // so it takes the same event rather than inventing a "hide".
              feedback("reveal");
              setExpanded((v) => !v);
            }}
          >
            {expanded ? (
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden>
                <path d="M8 3v5H3M10 15v-5h5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            ) : (
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden>
                <path d="M3 8V3h5M15 10v5h-5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            )}
          </button>
        </div>
      </div>
      </div>

      <Detail
        phones={PHONES}
        index={openIdx}
        onIndex={setOpenIdx}
        onClose={closeDetail}
        onNavigate={onNavigate}
      />
    </section>
  );
}
