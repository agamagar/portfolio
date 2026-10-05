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
import { PHONES } from "./helloData";
import FigmaPhone from "./FigmaPhone";

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
const ROW_ALT = "CaratLane Select invitation over the CaratLane app";

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
const ROW_SCREEN = "/mockups/figma/hello-row-screen.png";

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
  // the active category chip; non-matching screens dim (All shows everything)
  // Opens on Mobile rather than All (annotation msbw9pfk). The row is mostly
  // phone screens, so All and Mobile look near-identical on arrival and the
  // filter reads as doing nothing; starting on Mobile makes the Web tab an
  // actual change.
  const [cat, setCat] = useState("Mobile");
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

  const x = useRef(0);
  const speed = useRef(BASE_SPEED);
  const target = useRef(BASE_SPEED);
  const active = useRef(true);
  const dragging = useRef(false);

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
                  {/* THE DEVICE IS BACK (annotation msd1vfzk, "bring back the
                      phone mocks for all"). This reverses msb9q6yk / msb6ziza,
                      which had stripped the row down to a bare screenshot.
                      Mobile cells render the layered FigmaPhone — the exported
                      iPhone plate on top, its transparent cutout showing the
                      screenshot beneath — the same device the detail overlay
                      already uses, so the row and the opened card now agree.
                      WEB cells keep the bare image on purpose: they morph into a
                      browser window, and a phone bezel around a desktop screen
                      would undo that. */}
                  {cat !== "Web" && p.platform !== "Web" ? (
                    <FigmaPhone
                      className="hm__fp"
                      screen={p.screen || ROW_SCREEN}
                      alt={pass === 0 ? (p.screen ? [p.brand, p.caption].filter(Boolean).join(": ") : i === 0 ? ROW_ALT : "") : ""}
                    />
                  ) : (
                    <img
                      className="fig-screen hm__fig"
                      src={cat === "Web" ? WEB_SCREEN : p.src}
                      alt={pass === 0 ? [p.brand, p.caption].filter(Boolean).join(": ") : ""}
                      draggable="false"
                      loading="lazy"
                    />
                  )}
                </span>
              </button>
            )),
          )}
        </div>
      </div>

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
