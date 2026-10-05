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
import ScrollBand from "./ScrollBand";
import ClipVideo from "./ClipVideo";
import InviteReveal from "./InviteReveal";
import AwayZeroState from "./AwayZeroState";
import { PHONES } from "./helloData";
import ScanText from "./ScanText";

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

const DEVICE_W = 269;
const DEVICE_W_NARROW = 188;

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
export default function PhoneMarquee({ reduce, onNavigate, detail }) {
  const Detail = detail === "card" ? PhoneDetail2 : PhoneDetail;
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
  // one breakpoint, matching hello.css's own
  const [width, setWidth] = useState(
    typeof window !== "undefined" && window.innerWidth <= 720 ? DEVICE_W_NARROW : DEVICE_W,
  );
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 720px)");
    const sync = () => setWidth(mq.matches ? DEVICE_W_NARROW : DEVICE_W);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  // THE HEADING THAT NAMES WHAT IS IN FRONT OF YOU (annotation msq2f0z8, "add a
  // heading component above this which changes from screen to screen").
  //
  // WHICH screen it names has to be MEASURED, not tracked. The row is a
  // transform-driven marquee: no scroll position, no index, no event when one
  // cell takes over from the next - the cells simply move, and duplicate passes
  // mean the same screen exists two or three times over. So the only honest
  // answer to "which one is in front" is the one nearest the middle of the
  // view, read off the boxes.
  //
  // POLLED, on the animation's own clock and at a sixth of its rate. Every frame
  // would be a React render per frame for a line of text that changes maybe
  // twice a second; a MutationObserver has nothing to watch (the transform is
  // written to a ref-held node); and an IntersectionObserver answers "is it
  // visible", which every cell in the row is.
  const [front, setFront] = useState(null);
  const x = useRef(0);
  const speed = useRef(BASE_SPEED);
  const target = useRef(BASE_SPEED);
  const active = useRef(true);
  const dragging = useRef(false);

  useEffect(() => {
    const track = trackRef.current;
    const view = track?.parentElement;
    if (!track || !view) return undefined;
    let raf = 0;
    let n = 0;
    let last = null;
    const read = () => {
      const box = view.getBoundingClientRect();
      const mid = box.left + box.width / 2;
      let best = null;
      let bestD = Infinity;
      for (const cell of track.children) {
        const r = cell.getBoundingClientRect();
        // OFF-SCREEN CELLS ARE STILL IN THE DOM - that is what the extra passes
        // are - so a cell parked a full row away must not win by being nearest
        // to nothing.
        if (r.right < box.left || r.left > box.right) continue;
        const d = Math.abs(r.left + r.width / 2 - mid);
        if (d < bestD) {
          bestD = d;
          best = cell;
        }
      }
      // THE PHONES INDEX, not the finished label (msrq817u). The heading used
      // to read a pre-joined string off `data-head`, which was fine while it
      // was always plain text - but the two-tone explainer is JSX (a dim run
      // either side of a lifted span), and JSX cannot ride in a DOM attribute.
      // The index is a stable primitive that CAN, so it goes in the attribute
      // and the lookup happens at render instead.
      const idx = best?.dataset.head ?? null;
      // Only when it CHANGES: setState with the same value still re-renders on
      // the first call, and this runs ten times a second.
      if (idx !== last) {
        last = idx;
        setFront(idx);
      }
    };
    const tick = () => {
      if (++n % 6 === 0) read();
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [cat, expanded]);

  const setTarget = useCallback((v) => {
    target.current = v;
  }, []);

  // The prev/next arrows nudge the row by one device. This USED to add the step
  // straight onto x.current, which teleported the whole row a cell-width in a
  // single frame and read as a glitch (annotation msbf7r0s). It now banks the
  // distance here and the tick eases it out over several frames, on top of the
  // constant drift rather than fighting it.
  const nudgeLeft = useRef(0);
  const nudge = useCallback((dir) => {
    const track = trackRef.current;
    if (!track || !track.children[0]) return;
    const gap = parseFloat(getComputedStyle(track).gap) || 40;
    // measure a cell nearer the middle of the strip: with mixed phone and web
    // frames the first child is not a representative step.
    const cells = [...track.children].filter((c) => !c.hasAttribute("data-out"));
    const mid = cells[Math.min(2, cells.length - 1)] || track.children[0];
    const step = mid.offsetWidth + gap;
    nudgeLeft.current += dir * step; // +1 = previous (row slides right), -1 = next
  }, []);

  useEffect(() => {
    if (reduce) return undefined;
    const track = trackRef.current;
    const view = viewRef.current;
    if (!track || !view) return undefined;

    let raf = 0;
    let last = performance.now();
    let half = 0;
    const measure = () => {
      // The wrap distance is one SET PLUS ONE GAP, measured off the DOM.
      // scrollWidth / PASSES is not that: 18 cells carry 17 gaps while three
      // repeats need 18, so it came up short by exactly gap/PASSES — 13.33px at
      // the desktop gap of 40. That is not drift, it is a hard sideways jump
      // every time the row wraps, about once a minute. Measuring the offset of
      // the first cell of the second pass is exact and survives any change to
      // the gap or the number of cells.
      const cells = track.children;
      half =
        cells.length > PHONES.length
          ? cells[PHONES.length].offsetLeft - cells[0].offsetLeft
          : track.scrollWidth / PASSES;
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(track);

    // A row nobody is looking at should not be burning a frame budget.
    const io = new IntersectionObserver(
      ([e]) => {
        active.current = e.isIntersecting;
      },
      { threshold: 0 },
    );
    io.observe(view);

    const onVisibility = () => {
      if (!document.hidden) last = performance.now();
    };
    document.addEventListener("visibilitychange", onVisibility);

    // Drag the row by hand, the same grab-and-shove as the timeline (msajklle).
    // Dragging offsets the marquee position directly and holds the auto-advance;
    // the tick keeps wrapping and painting so it stays seamless, and lets go back
    // into the drift on release. The row element is .hm__view (track's parent) —
    // viewRef is the outer section, so the cursor + data-drag live on the row.
    const rowEl = track.parentElement;
    let down = false;
    let sx = 0;
    let sX = 0;
    const onDown = (e) => {
      if (e.button != null && e.button !== 0) return;
      down = true;
      sx = e.clientX;
      sX = x.current;
      draggedRef.current = false;
      dragging.current = true;
      rowEl.setAttribute("data-drag", "true");
    };
    const onMove = (e) => {
      if (!down) return;
      if (Math.abs(e.clientX - sx) > 4) draggedRef.current = true;
      x.current = sX + (e.clientX - sx);
    };
    const onUp = () => {
      if (!down) return;
      down = false;
      dragging.current = false;
      rowEl.removeAttribute("data-drag");
      last = performance.now(); // don't let the paused interval teleport the drift
    };
    rowEl.addEventListener("pointerdown", onDown);
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);

    // Trackpad: a two-finger horizontal swipe moves the row (annotation
    // msd8erns). The row is transform-driven and has no scrollport, so there is
    // nothing for the browser to scroll natively — deltaX has to be applied to
    // the same `x` the drag and the drift share, which is also what makes the
    // wrapping below apply to it for free.
    //
    // ONLY when the gesture is actually horizontal, and preventDefault ONLY then:
    // a vertical wheel over the row still has to scroll the page, and swallowing
    // it would trap the reader inside the section. The horizontal case does need
    // preventing, because otherwise macOS reads a horizontal swipe at the edge of
    // the page as a back-navigation.
    //
    // No need to hold the drift off while this runs: the row already pauses on
    // hover, and the pointer is by definition over it.
    const onWheel = (e) => {
      if (Math.abs(e.deltaX) <= Math.abs(e.deltaY)) return;
      e.preventDefault();
      // same sign convention as scrollLeft += deltaX: x decreases to move the
      // content left, so a swipe that pushes content left subtracts.
      x.current -= e.deltaX;
    };
    // passive: false — a passive listener is forbidden from calling
    // preventDefault, and Chrome makes wheel listeners passive by default.
    rowEl.addEventListener("wheel", onWheel, { passive: false });

    const tick = (now) => {
      raf = requestAnimationFrame(tick);
      const dt = Math.min(64, now - last); // a backgrounded tab must not teleport
      last = now;
      if (!active.current || document.hidden || half <= 0) return;

      // While the row is being dragged, the pointer owns the position; the drift
      // resumes the moment it is let go. It also freezes while the detail is open
      // (annotation msanaigi — the animation behind the morph stops).
      // pay out any banked arrow nudge, eased, before the drift is applied
      if (nudgeLeft.current !== 0) {
        const kn = 1 - Math.pow(1 - 0.14, dt / 16.667);
        const move = nudgeLeft.current * kn;
        x.current += move;
        nudgeLeft.current -= move;
        if (Math.abs(nudgeLeft.current) < 0.5) {
          x.current += nudgeLeft.current;
          nudgeLeft.current = 0;
        }
      }
      if (!dragging.current && !detailOpenRef.current) {
        // EASE is a per-frame constant while the position step below is scaled by
        // dt, so it has to be normalised to the frame budget or the hover slowdown
        // settles twice as fast on a 120Hz display and slower under load.
        const k = dt / 16.667;
        const want = pausedRef.current ? 0 : target.current;
        speed.current += (want - speed.current) * (1 - Math.pow(1 - EASE, k));
        x.current -= (speed.current * dt) / 1000;
      }
      // Wrap in both directions: cheap, and it keeps the position bounded no
      // matter what nudges x.
      while (x.current <= -half) x.current += half;
      while (x.current > 0) x.current -= half;
      track.style.transform = `translate3d(${x.current.toFixed(2)}px, 0, 0)`;
    };
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
      rowEl.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      rowEl.removeEventListener("wheel", onWheel);
    };
  }, [reduce]);

  // Non-matching cells COLLAPSE out of the row on the single-platform tabs
  // (annotation msbftaje) — they used to dim in place, which read as disabled
  // screens nobody asked for. Guarded so a tab that matches nothing collapses
  // nothing, rather than emptying the whole row.
  const hasMatch = cat !== "All" && PHONES.some((p) => p.platform === cat);

  // Repeated passes of the same set. Only the first is real to a screen reader;
  // the rest are decorative duplicates of it.
  const passes = reduce ? [PHONES] : Array.from({ length: PASSES }, () => PHONES);

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
      style={{ "--hm-w": `${width}px` }}
    >
      {!reduce && (
        <button
          type="button"
          className="hm__pause"
          onClick={() => setPaused((v) => !v)}
          aria-pressed={paused}
        >
          {paused ? "Play the row" : "Pause the row"}
        </button>
      )}
      <div
        className="hm__view"
        data-expanded={expanded ? "true" : undefined}
        onPointerEnter={() => setTarget(HOVER_SPEED)}
        onPointerLeave={() => setTarget(BASE_SPEED)}
      >
        <div className="hm__track" ref={trackRef}>
          {passes.map((set, pass) =>
            set.map((p, i) => (
              <button
                type="button"
                key={`${pass}-${i}`}
                className="hm__cell"
                data-phone={i}
                data-platform={p.platform}
                /* what the heading above the filter bar reads (msq2f0z8), as the
                   PHONES INDEX rather than a finished string (msrq817u - the
                   heading became two-tone JSX, which cannot live in a DOM
                   attribute). `i` is unambiguous despite the repeated passes:
                   `passes[pass]` is the SAME PHONES array every time, so every
                   cell sharing an `i` names the identical phone and PHONES[i]
                   is always the right lookup, whichever pass's cell won the
                   measurement. */
                data-head={i}
                data-out={hasMatch && p.platform !== cat ? "true" : undefined}
                aria-hidden={pass > 0 ? "true" : undefined}
                tabIndex={pass > 0 ? -1 : undefined}
                aria-label={[p.brand, p.caption].filter(Boolean).join(": ")}
                onClick={(e) => {
                  // a drag that ends over a cell must not open the detail view
                  if (draggedRef.current) return;
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
                  {/* THE SCREEN SCROLLS ITSELF (annotation msjywvoj). The Figma
                      frame this cell was exported from builds its animation the
                      way Figma makes you build a scroll: a short clipped
                      viewport over a very tall content frame, with the content
                      repeated below so a continuous upward travel never shows a
                      seam. Rebuilt here as the same construction rather than as
                      a video — it is two divs and a transform, it stays crisp at
                      any cell size, and it costs no decode.

                      OVERLAID ON THE STATIC SCREENSHOT, not replacing it: only
                      the middle band moves. The status bar above and the sticky
                      offer bar below are pinned in the source frame too, and the
                      existing export already carries both, so the band covers
                      exactly the part that scrolls and nothing else has to be
                      re-cut. The percentages are the frame's own numbers —
                      115 / 783 and 513 / 783 — so the band lands on the pixels
                      it is hiding.

                      Only `pass === 0` copies are labelled, same as the img
                      above; this is decoration either way and carries no alt. */}
                  {/* v1 HAS NO CENTRE, so it can only honour half of the rule
                      Agam set for the step carousel (play at centre, with the
                      clock running): this row drifts continuously and never
                      holds a tile anywhere, so `i === idx` has no meaning here.
                      What it does have is the same pause control, and the same
                      principle applies to it — a screen scrolling inside a row
                      the reader has explicitly stopped is motion with nothing
                      driving it. */}
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
                  {cat !== "Web" && p.clip && !reduce && (
                    <ClipVideo
                      clip={p.clip}
                      playing={!paused}
                    />
                  )}
                  {cat !== "Web" && p.reveal === "awayZeroState" && (
                    <AwayZeroState playing={!paused} reduce={reduce} />
                  )}
                  {cat !== "Web" && p.reveal === "caratlaneInvite" && (
                    <InviteReveal playing={!paused} />
                  )}
                  {cat !== "Web" && p.scroll && (
                    <ScrollBand scroll={p.scroll} reduce={reduce} playing={!paused} />
                  )}
                </span>
              </button>
            )),
          )}
        </div>
      </div>

      {/* THE BAR IS TWO THINGS NOW (annotation msq2f0z8, "add this component to a
          div and add a heading component above this which changes from screen to
          screen"): a line naming what is currently in front of you, and the
          controls under it. Wrapped rather than the heading being dropped in as
          a sibling of the section, so the two stay one object - the heading is
          about the bar's row, not about the section. */}
      <div className="hm-bar">
        <p className="hm-bar__head" aria-live="polite">
          {/* A SPACE, not an empty string, on the frame before the first
              measurement lands: an empty <p> collapses to zero height and the
              controls under it jump up by a line. */}
          {/* KEYED BY THE INDEX so it re-enters on every change (msqxhtcx) - the
              drift marquee has no step count, so `front` (the measured PHONES
              index) IS the key. Same enter animation as the step carousel.

              A SMALL EXPLAINER, not the brand · caption label (msrq817u):
              looked up from `front` now that it is an index rather than a
              finished string. Falls back to the old label for a phone with no
              blurb. */}
          {(() => {
            const p = front != null ? PHONES[front] : null;
            return (
              <span key={front ?? " "} className="hm-bar__head-text">
                {p?.blurb ? (
                  <ScanText text={p.blurb} scan={p.scan} />
                ) : p ? (
                  [p.brand, p.caption].filter(Boolean).join(" · ")
                ) : (
                  " "
                )}
              </span>
            );
          })()}
        </p>
      {/* filter bar: prev/next arrows over category chips (annotation: recent.design
          reference), built with the site's tokens */}
      <div className="hm-filter">
        <div className="hm-filter__nav">
          <button type="button" className="hm-filter__arrow" onClick={() => nudge(1)} data-tip aria-label="Previous screens">
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden>
              <path d="M11 4l-5 5 5 5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          <button type="button" className="hm-filter__arrow" onClick={() => nudge(-1)} data-tip aria-label="Next screens">
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
              onClick={() => setCat(c)}
            >
              {c}
            </button>
          ))}
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
            onClick={() => setExpanded((v) => !v)}
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
