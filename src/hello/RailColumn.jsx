// THE RAIL, TURNED NINETY DEGREES — the touch layout.
//
// The horizontal scrubber it replaces is not deleted. It is still in
// Timeline.jsx behind `RAIL_LAYOUT`, one word from being the default again,
// because the argument it was built on is still sound and only its AXIS was
// wrong. See Claude/2026-08-11_vertical-timeline-plan.md for the whole reading.
//
// The short version of why this exists:
//
//   the axis      A horizontal scroller nested in a vertical page fights the
//                 page. Measured on the device: getting back UP past the
//                 scrubber took about thirty drags and repeatedly travelled the
//                 wrong way. Here the timeline's axis IS the page's axis, so
//                 there is no gesture to teach and nothing to hijack.
//   one clock     The scrubber drew time twice - its own reading line, and a
//                 year row underneath that could not be aligned to it (`--x` is
//                 a share of a 1735px strip living inside a 335px window).
//                 Vertically the years are section headings ON the same run, so
//                 there is one clock and it is the one you are scrolling.
//   all of it     `timeline.css` hid nine of the ten cards and every leader on
//                 touch. Nothing is hidden here. Vertical space is free, which
//                 is exactly what the horizontal version did not have.
//
// THE MAGNIFIER SURVIVED AFTER ALL. This file used to say a displacement wave
// needs a pointer and a phone has none, so the desktop kept it. That was one
// wrong step short of the answer: THE READING LINE IS THE POINTER. It is already
// here, it already decides which row is open, and it moves by scroll instead of
// by cursor. So the glass spine comes across whole - same bump, same golden-ratio
// thickening, same rest and peak - and expands and relaxes as you scroll.
//
// ONE HONEST COMPROMISE, stated here because it is the kind of thing that gets
// quietly forgotten and then read as a bug. The desktop spine is LINEAR IN TIME:
// a hundred equal months across a fixed strip. Vertically the rows are sized by
// their content, so a linear-time spine would not line up with the rows beside
// it - and two clocks that disagree is the exact fault this whole rebuild exists
// to remove. So the spine ANCHORS each tenure's start tick to its own row and
// distributes the months between two anchors evenly in the space between them.
// It is a texture and an index, not a ruler. Exact time is in each row's date
// line, which is where a reader can actually use it.

import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { feedback, feedbackCoalesced } from "../ui/feedback";

// THE CENTRE OF THE VIEWPORT, and only the card there opens (Agam's rule).
//
// This was 0.4 on the argument that a card grows downward and a centred line
// would push its own content under the fold. That argument was worth less than
// the one it cost: a rule you can state in a sentence - "the card in the middle
// of the screen is the open one" - is a guardrail, and the animations need one
// far more than the layout needed 10% of the viewport. On an 812pt screen the
// centre still leaves ~400pt below it, and the card is about 260.
const READ_LINE = 0.5;

// How much closer a challenger has to be before it takes over, in pixels.
//
// WITHOUT THIS THE SELECTION FLICKERS. Two rows near the line trade places on
// sub-pixel changes, and every trade is an open, a close, an anchor correction
// and a 350ms animation - which is what "glitching out on scroll" looks like
// from the outside. A row now has to be decisively nearer, so crossing from one
// to the next happens once, cleanly, instead of several times on the way.
const HYSTERESIS = 28;

// ── THE GLASS SPINE, ROTATED ────────────────────────────────────────────────
// Straight from RailTick's constants, because it IS RailTick: 12px at rest,
// 38px at the crest, thickening by the golden ratio. What rotates is which
// dimension carries which job — horizontally the tick RISES from a baseline and
// thickens sideways; here it REACHES from the spine and thickens vertically.
// The rest, the peak and the golden-ratio thickening are NOT declared here.
// They live in the `.tlv__tick` rule, which is where they are actually applied,
// and duplicating them as JS constants would be the same number in two places
// with nothing keeping them equal. This file owns only the wave - where the
// lens is and how wide it is - and hands the result over as `--r`.
// The lens radius in PIXELS, not months, and that is a consequence of the
// compromise above: the spine's pitch is not uniform, so a radius counted in
// months would be a lens that changes size depending on where it is. A reader
// sees a lens on the SCREEN. Pixels are what they are actually looking at.
const LENS = 96;

// THE YEAR WHEEL'S PITCH. The years stopped being an axis pinned to the content
// and became a PICKER (Agam): the active year sits on the reading line and the
// rest are spaced evenly around it.
//
// Why they had to be decoupled: the selection reads a row's HEAD (a fixed-height
// element, so the measurement cannot be moved by its own result) while the years
// were anchored to a row's CENTRE. A head is ~79px tall and an open card is
// 268-324, so the active year was landing 95-122px BELOW the line that chose it,
// and drifting further the more a card had to say. Two rules, two different
// points, and the years looked like they were not responding.
//
// 52px: the labels are 44px tall targets, so this leaves 8px between them.
const YEAR_PITCH = 52;

// ONE PITCH, EVERYWHERE (Agam: "consistent timeline spacing between glass
// elements"). This replaces the row-anchored spacing, and the trade is worth
// naming because it reverses an earlier decision in this file.
//
// The ticks used to be one-per-month with each tenure's start pinned to its own
// row and the months between spread across the gap. It kept the spine and the
// rows in perfect agreement - and it made the spacing a function of how much
// text each row happened to carry, so the gaps measured 6.2px in one place and
// 82.8px in another. A ruler with a thirteenfold variation in its own graduations
// does not read as a ruler; it reads as a mistake.
//
// So the ticks are now a CONSTANT 12px apart and owe nothing to the rows. Two
// things fall out of that, both good:
//
//   nothing moves    A row opening changes the list's height, which used to
//                    restretch every tick on the spine. At a fixed pitch the
//                    spine is unaffected - the list simply reveals more of it.
//   no measuring     Tick y is `i * PITCH`. The lens does not need a layout
//                    read at all any more.
//
// What it costs: a tick is no longer a particular month. The spine becomes what
// it always looked like - texture, and a sense of travel - while the YEAR LABELS
// keep the actual time meaning and stay anchored to real content. That split is
// deliberate: the thing with even spacing is the thing with no meaning to
// distort, and the thing that points at content is the thing allowed to sit
// where the content is.
const PITCH = 12;
// Generous, and clipped by the spine's own box. The list runs about 1200px shut
// and grows by the height of one open card, so this covers the tallest state
// with room to spare; anything past the end is simply not drawn.
const TICKS = 180;

export default function RailColumn({ model, details }) {
  const rootRef = useRef(null);
  const rowRefs = useRef(new Map());

  // OLDEST FIRST, top to bottom. The desktop rail runs left to right from 2019,
  // and the prose above the section opens "I started in ad-tech in 2019" - so
  // reading down IS reading forward, and both views tell it in the same order.
  // A newest-first list would be a different story told by the same data.
  const rows = useMemo(
    () =>
      model.cards
        .map((c, i) => ({
          ...c,
          i,
          detail: c.tid ? details.get(c.tid) : null,
          start: model.months[c.i0]?.label ?? "",
          end: model.months[c.i1]?.label ?? "",
          year: model.months[c.i0] ? String(Math.floor(model.months[c.i0].m / 12)) : "",
          // the `ship` field that was derived here - the shipment inside this
          // run, mirroring the horizontal card's "Shipped:" line - is gone with
          // every other trace of ships (Agam, 2026-08-11)
        }))
        .sort((a, b) => a.i0 - b.i0),
    [model, details],
  );

  // Which years exist, in order, for the jump control. Derived from the ROWS and
  // not from `model.years`: model.years is one label per January of the whole
  // span, and a year with no tenure starting in it is a jump that goes nowhere
  // in particular. Here every year in the list is a year something began.
  // EVERY JANUARY IN THE RECORD, not only the years something began.
  //
  // This changed when the labels moved off the top bar and down the left of the
  // spine (Agam, 2026-08-11). As a horizontal bar they were a list of
  // destinations, so listing only years with a tenure in them was right - a
  // button that goes nowhere in particular is not worth a slot. Beside the
  // spine they are an AXIS, and an axis with 2023 missing because nothing
  // started that year is an axis with a hole in it. 2023 is a real year; the
  // CaratLane run is inside it.
  //
  // `model.years` already carries exactly this - one entry per January of the
  // span, each with its month index - so the label can sit on its own tick.
  //
  // Plus the record's FIRST month when the span does not open in January. The
  // run starts in May 2018, so `model.years` begins at 2019 and the first eight
  // months of the record sat under an axis that could not name them - nothing
  // lit, which reads as broken rather than as empty. Same principle that put
  // 2023 back: no holes. The label goes on month 0 rather than on an imaginary
  // January before it, so it still sits on a real tick.
  const years = useMemo(() => {
    const list = model.years;
    const firstYear = String(Math.floor(model.months[0].m / 12));
    return list[0]?.label === firstYear ? list : [{ label: firstYear, i: 0 }, ...list];
  }, [model.years, model.months]);

  // ── WHAT IS OPEN ────────────────────────────────────────────────────────
  // A ROW IS ALWAYS OPEN, and that single fact decides what a tap can mean.
  //
  // This started as a disclosure - tap to expand, tap to collapse, pinned beats
  // derived, the shape the desktop rail uses. It was wrong twice over:
  //
  //   1. It did not work. The "a pin does not survive scrolling away from it"
  //      rule cannot tell SCROLLED AWAY from JUST TAPPED A DIFFERENT ROW, so it
  //      cleared the pin in the same tick it was set and every tap was a no-op.
  //   2. Fixing that would still have left a lie in the markup. If something is
  //      always open, `aria-expanded` on a button that cannot collapse anything
  //      describes a control that does not exist.
  //
  // So a tap SELECTS: it brings that row to the reading line and opens it on the
  // way. `aria-current` rather than `aria-expanded`, because what the row is
  // saying is "this is the one being read", which is true, rather than "I am
  // expanded", which is only incidentally true.
  //
  // The pin is now a one-frame thing: it opens the row immediately so the tap
  // feels answered, and the scroll it starts hands over to `near` when it lands.
  // Any scroll the reader starts themselves clears it - which is not a special
  // case, because by then `near` is the same row anyway.
  // Declared up here, above `bringY` and the year jump, because both of them
  // read it - a `const` used before its declaration is a TDZ crash at render,
  // not a hoisting convenience.
  const spineRef = useRef(null);
  // The year the reading line is actually inside, which is NOT the open row's
  // year. Nothing starts in 2023, so a year derived from rows could never light
  // it - yet the reader spends a real stretch of the run there, inside the
  // CaratLane tenure. Read off the spine instead: the month nearest the line
  // has a year, and that is the answer for every year including the empty ones.
  const [lineYear, setLineYear] = useState(null);

  const [pinned, setPinned] = useState(null);
  const [near, setNear] = useState(0);
  // the nearest row RIGHT NOW, tracked every frame; `near` is the committed one
  const nearRef = useRef(null);
  // where the incoming open row sat just before the swap, so the layout effect
  // can put the page back and the swap costs no visible movement

  const openKey = pinned ?? near;
  // true while OUR smooth scroll is running, so the reader's own scroll can be
  // told apart from the one a tap started. Without it the pin is dropped
  // mid-flight and the open row races down the list behind the scroll.
  const selfScroll = useRef(false);

  // The row nearest the reading line, read on scroll. Cheap on purpose: this
  // runs at scroll rate, so it is one loop over ten boxes and no allocation
  // beyond the winner. No IntersectionObserver - "nearest to a line" is not a
  // threshold question, and expressing it as one would need a rootMargin band
  // per row and would still only tell us about crossings.
  useEffect(() => {
    // IMMEDIATE, AND STILL STABLE. Both halves of that matter and the first
    // attempt only got one.
    //
    // The reflow problem is real: opening a row changes its height, and the row
    // that CLOSES is above the reading line, so its collapse pulls everything
    // below it - including the row you are reading - up by its own height. That
    // is the jump. The first fix was to wait 140ms for the scroll to stop before
    // committing, which removed the jump by removing the response, and the
    // response is what a reading line is FOR.
    //
    // So the commit is immediate again and the JUMP is cancelled instead, by
    // anchoring: remember where the row that is about to open sits right now,
    // and after the DOM has changed put the page back so that row is still
    // there. Done in the layout effect below, before the browser paints, so
    // there is no frame in which it moved. This is what `overflow-anchor` would
    // do if Safari implemented it - and Safari is the browser this layout is
    // for, so it is done by hand.
    const onScroll = () => {
      // (the feedback loop that needed a guard here is gone with the scroll
      // correction that caused it - nothing in this handler moves the page any
      // more, so nothing it does can come back round as another scroll event)
      const line = window.innerHeight * READ_LINE;
      let best = null;
      let bestD = Infinity;
      let currentD = Infinity;
      rowRefs.current.forEach((el, key) => {
        if (!el) return;
        // THE HEAD, NOT THE ROW. This is the other half of the glitch. The row
        // box grows by a few hundred pixels when it opens, so a metric taken
        // from the row's own middle MOVED BECAUSE OF ITS OWN RESULT - open a
        // row, its centre jumps, and now a different row is nearest. The head
        // is a fixed-height element and an opening body grows BELOW it, so its
        // position does not depend on whether it is open. Measuring against it
        // makes the selection stable by construction rather than by damping.
        const head = el.querySelector(".tlv__head") || el;
        const b = head.getBoundingClientRect();
        const d = Math.abs(b.top + b.height / 2 - line);
        if (key === nearRef.current) currentD = d;
        if (d < bestD) {
          bestD = d;
          best = key;
        }
      });
      if (best == null) return;
      if (!selfScroll.current) setPinned(null);
      // the incumbent keeps it unless the challenger is decisively nearer
      if (best === nearRef.current) return;
      if (bestD > currentD - HYSTERESIS) return;
      // Outside the updater on purpose: React may call a state updater more than
      // once, and every line below is a side effect - a ref write, a queued
      // scroll correction and a haptic. Firing those twice is two corrections
      // and a double tap of feedback for one crossing.
      nearRef.current = best;
      // One per row crossed and COALESCED, for the same reason the scrubber
      // coalesced: a flick down the section crosses several, and §6 is explicit
      // that a drag over many snap points gets one feedback, not forty.
      feedbackCoalesced("navigate");
      setNear(best);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  // Bring a row to the reading line. Shared by the row taps and the year jump,
  // because they are the same move - "read this one" - differing only in how the
  // target is named.
  // `y` is measured from the rail's own top, which is the coordinate space the
  // spine already works in - so a year label can hand over its tick's position
  // untranslated.
  const bringY = useCallback((y) => {
    const root = rootRef.current;
    if (root == null || y == null) return;
    selfScroll.current = true;
    const top = root.getBoundingClientRect().top + window.scrollY + y - window.innerHeight * READ_LINE;
    window.scrollTo({ top, behavior: "smooth" });
    // No `scrollend` - Safari did not ship it until recently and this is a touch
    // layout, so the one browser that matters most is the one that would miss
    // it. A timer is the boring correct answer: long enough to cover a smooth
    // scroll across the section, and harmless if it lands early because by then
    // `near` already agrees with the pin.
    window.clearTimeout(bringY.t);
    bringY.t = window.setTimeout(() => {
      selfScroll.current = false;
    }, 700);
  }, []);

  const select = useCallback(
    (key) => {
      const el = rowRefs.current.get(key);
      const root = rootRef.current;
      if (!el || !root) return;
      setPinned(key);
      const head = el.querySelector(".tlv__head") || el;
      const hb = head.getBoundingClientRect();
      // THE HEAD'S CENTRE, matching what the scroll rule measures. Landing on
      // `top + 20` instead put a tapped row ~20px off the line the selection is
      // judged against, so the two disagreed about where a row belongs - and the
      // very next scroll event would be re-deciding a question the tap had just
      // answered.
      bringY(hb.top - root.getBoundingClientRect().top + hb.height / 2);
      feedback("select");
    },
    [bringY],
  );

  // ── THE YEAR JUMP, VERTICAL ─────────────────────────────────────────────
  // A YEAR IS A PLACE ON THE SPINE NOW, not a row. It used to resolve to "the
  // first tenure starting in that year" and hand off to `select`, which cannot
  // answer 2023 - nothing starts in it - and would have left one label on the
  // axis permanently dead. Scrolling to the JANUARY'S OWN TICK works for every
  // year including the empty ones, and the reading line then opens whichever row
  // it lands beside, which is the right answer without having to be told.
  const jumpToYear = useCallback(
    (i) => {
      const y = yearYRef.current.get(i);
      if (y == null) return;
      setPinned(null);
      bringY(y);
      feedback("select");
    },
    [bringY],
  );

  // ── WHERE EVERY MONTH SITS ──────────────────────────────────────────────
  // A month's y, measured rather than computed, because the thing it has to
  // agree with is the ROWS, and the rows are sized by their text. Anchors are
  // the tenure starts (each beside its own row's name); the months between two
  // anchors are spread evenly across the gap. Monotonic by construction, so the
  // spine can never run backwards.
  //
  // NOTHING HERE GOES THROUGH REACT, and that is a performance fix, not a
  // style. It used to be `useState`, and the cost was paid three times over
  // every time a row opened: a new hundred-element array, a hundred nodes
  // reconciled with new inline `top` values, and a fresh array identity that
  // tore down and re-subscribed the scroll listener below. Opening a row is a
  // reading action - it should not re-render the spine at all. The positions
  // live in a ref and are written straight onto the nodes.
  const yearYRef = useRef(new Map());
  const yearRefs = useRef(new Map());
  const [ready, setReady] = useState(false);

  // ── WHAT STILL NEEDS MEASURING ──────────────────────────────────────────
  // Only the year labels, and only because a year has to point at real content.
  // The ticks place themselves at `i * PITCH` and are not measured at all now.
  //
  // Each year sits at its own January, interpolated between the tenure starts
  // either side of it - anchors are the rows' own head lines, so a year label
  // lands beside the work that was happening in it. Monotonic by construction.
  //
  // Nine positions, not a hundred, and nothing here goes through React: the
  // values live in a ref and are written straight onto the nodes. Opening a row
  // is a reading action and should not re-render the axis.
  const measure = useCallback(() => {
    const root = rootRef.current;
    if (!root) return;
    const base = root.getBoundingClientRect().top;
    const anchors = [];
    for (const r of rows) {
      const el = rowRefs.current.get(r.key);
      if (!el) continue;
      // THE ROW'S VERTICAL CENTRE, not its head (Agam: the years should be
      // centred against the card).
      //
      // This used to anchor to the head - the argument being that a year
      // belongs beside the NAME rather than beside the middle of a long list of
      // outcomes. That argument only holds while a row is short. Beside an open
      // card 258px tall it put the year up against the card's top edge, which
      // is what "the years are not centred" was describing: the label and the
      // thing it labels did not share a middle.
      //
      // Anchoring to the centre means the year tracks the card as it grows, and
      // the two read as one horizontal unit. Closed rows are short enough that
      // their centre is near their name anyway, so nothing is lost there.
      const b = el.getBoundingClientRect();
      anchors.push({ m: r.i0, y: b.top - base + b.height / 2 });
    }
    if (anchors.length < 2) return;
    const at = (m) => {
      let seg = 0;
      while (seg < anchors.length - 2 && m >= anchors[seg + 1].m) seg++;
      const a = anchors[seg];
      const b = anchors[seg + 1];
      // outside the anchored range, keep the local pitch of the nearest segment
      // rather than clamping - a clamp would pile the early months onto one
      // pixel and read as a smudge
      const span = b.m - a.m || 1;
      return a.y + ((m - a.m) / span) * (b.y - a.y);
    };
    // POSITIONS FOR JUMPING ONLY. The wheel no longer draws years here - it
    // spaces them by YEAR_PITCH around whichever is active - but tapping a year
    // still has to scroll to where that January actually IS in the run, and this
    // is the only thing that knows.
    yearYRef.current.clear();
    for (const y of years) yearYRef.current.set(y.i, at(y.i));
    if (!ready) setReady(true);
  }, [rows, years, ready]);

  // MEASURE BEFORE THE BROWSER PAINTS, not after. This is the fix for the
  // tearing while scrolling.
  //
  // It was a `useEffect` plus a ResizeObserver, and both of those run AFTER
  // layout and paint. So the sequence on every row change was: the row opens and
  // everything below it moves -> the browser paints one frame with the rows in
  // their new places and the axis still in its old one -> the observer fires and
  // it catches up. One frame of the two halves disagreeing, every time.
  // `useLayoutEffect` runs between the DOM change and the paint, so there is no
  // such frame.
  //
  // The ResizeObserver stays as a safety net for what a render does not announce
  // - a late web font, a rotation, a resize - and observes the ROOT only. It used
  // to observe every row, so one row opening fired eleven callbacks for one
  // layout change.
  useLayoutEffect(() => {
    // NO SCROLL CORRECTION HERE ANY MORE, and its removal is the fix rather
    // than a regression.
    //
    // It used to record where the incoming row sat and `scrollBy` the
    // difference after the swap, so the row you were reading stayed put. It did
    // work - and it moved the page on every single expansion, which is worse
    // than the shift it was cancelling. A scroll the reader did not ask for is
    // felt; a few pixels of drift is not. It also fought iOS momentum, because
    // a programmatic scroll during a flick interrupts the flick.
    //
    // What replaces it is in the stylesheet: the outgoing row now collapses on
    // the SAME clock as the incoming one expands. One shrinks while the other
    // grows, the section's height barely changes at any instant, and there is
    // nothing left to compensate for. The residual is the difference between
    // two cards' heights spread over 350ms, instead of the full height of one
    // card in a single frame.
    measure();
  }, [measure, openKey]);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return undefined;
    const ro = new ResizeObserver(measure);
    ro.observe(root);
    return () => ro.disconnect();
  }, [measure]);

  // ── THE WAVE ────────────────────────────────────────────────────────────
  // Written imperatively onto CSS custom properties, for the reason the desktop
  // rail gives for doing the same to its labels: a hundred motion values would
  // be a hundred subscriptions and a hundred React-owned style objects to
  // reconcile at scroll rate. One loop writing one variable on a hundred nodes
  // is the cheap shape, and the CSS turns `--r` into reach, thickness and ink.
  //
  // No spring. The desktop springs the pointer because a cursor jumps; a scroll
  // position is already continuous and already inertial, so the wave inherits
  // the reader's own momentum. Adding a spring on top would be smoothing
  // something that is not jittery and would lag the finger.
  //
  // ONE PAINT PER FRAME. Scroll fires faster than the screen refreshes, so the
  // unthrottled version did the whole hundred-node pass several times for
  // frames that were only ever drawn once. The rAF gate is the difference
  // between doing the work and doing it three times.
  useEffect(() => {
    const spine = spineRef.current;
    if (!spine) return undefined;
    let queued = 0;
    const paint = () => {
      queued = 0;
      const marks = spine.children;
      const line = window.innerHeight * READ_LINE - spine.getBoundingClientRect().top;
      // ONE LAYOUT READ FOR THE WHOLE PASS. Tick y is `i * PITCH`, so the fixed
      // pitch bought this loop out of measurement entirely - it used to consult
      // a hundred stored positions and now it computes them.
      //
      // The window is bounded too: only ticks within LENS of the line can have
      // a non-zero rise, so the loop walks that band instead of the whole spine
      // and writes zero to the edges of the band on the way out. At 12px pitch
      // and a 96px lens that is seventeen nodes a frame, not a hundred and
      // seventeen.
      const first = Math.max(0, Math.floor((line - LENS) / PITCH));
      const last = Math.min(marks.length - 1, Math.ceil((line + LENS) / PITCH));
      for (let i = 0; i < marks.length; i++) {
        if (i < first || i > last) {
          // only clear what was actually dirty, so a spine at rest costs nothing
          if (marks[i].style.getPropertyValue("--r") !== "0") marks[i].style.setProperty("--r", "0");
          continue;
        }
        const d = Math.abs(i * PITCH - line);
        // the same raised cosine the desktop uses, in pixels
        const r = d >= LENS ? 0 : 0.5 * (1 + Math.cos((Math.PI * d) / LENS));
        marks[i].style.setProperty("--r", r.toFixed(3));
      }
      // THE LIT YEAR comes off the ROWS now, not off a tick. A tick is no longer
      // a particular month, so it cannot answer this - but the year label
      // nearest the reading line can, and that is the same thing the reader is
      // looking at.
      let best = null;
      let bestD = Infinity;
      yearYRef.current.forEach((y, i) => {
        const d = line - y;
        // the year you are INSIDE is the last one you passed, not the nearest -
        // in July 2022 you are in 2022, however close 2023 has become
        if (d >= -24 && d < bestD) {
          bestD = d;
          best = i;
        }
      });
      // Above every label - the moment the section comes into view - the answer
      // is the first year, not nothing. A blank axis while you are demonstrably
      // inside the run reads as broken, which is the same fault that put a label
      // on month 0 in the first place.
      const label = best == null ? years[0]?.label : years.find((y) => y.i === best)?.label;
      if (label) setLineYear((prev) => (prev === label ? prev : label));
    };
    const onScroll = () => {
      if (queued) return;
      queued = requestAnimationFrame(paint);
    };
    paint();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      if (queued) cancelAnimationFrame(queued);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [years, ready]);


  // Which year the wheel is showing, as an index into `years`. Falls back to 0
  // rather than -1 so the wheel is never translated off its own top before the
  // first paint has decided a year.
  const activeYearIdx = Math.max(0, years.findIndex((y) => y.label === lineYear));

  return (
    <div className="tlv" ref={rootRef} data-ready={ready ? "true" : undefined}>
      {/* THE YEARS, DOWN THE LEFT OF THE SPINE (Agam, 2026-08-11).

          They were a sticky bar across the top. Beside the spine they stop
          being a row of destinations and become the AXIS the spine is drawn
          against - which is what a year layer is for, and what the desktop rail
          has always used it as. Three things follow from the move and all three
          are improvements rather than costs:

            - every January gets a label, not only the years a tenure began, so
              2023 is no longer a hole in the axis
            - each label sits on its OWN TICK rather than at an even interval, so
              the spine's non-uniform pitch is visible instead of hidden. That is
              honest: this axis is anchored to the rows, not to linear time, and
              a reader can now SEE where it stretches and where it compresses
            - nothing is sticky any more, so nothing overlaps the rows it indexes

          Their `top` is written by `measure`, like the ticks': a year label is
          pinned to a tick, so it belongs to the same measurement pass and has
          no business being a React-owned style. `.tlv__year` starts at
          `opacity: 0` and the rule keyed on the rail's `data-ready` reveals
          them, so the first frame does not show nine labels stacked at zero
          before the axis exists. */}
      <nav className="tlv__years" aria-label="Jump to a year">
        {/* THE WHEEL. One transform on the container rather than nine `top`
            writes: the labels sit at a fixed `i * YEAR_PITCH` and the wheel
            slides so the ACTIVE one lands on the reading line. That is what
            makes it a picker - the selected item is always in the same place and
            the rest move past it - and it is one animatable property instead of
            nine, so the slide can ease without nine transitions fighting. */}
        <div
          className="tlv__wheel"
          style={{ "--tlv-active": activeYearIdx, "--tlv-pitch": `${YEAR_PITCH}px` }}
        >
          {years.map((y, i) => (
            <button
              type="button"
              key={y.label}
              className="tlv__year"
              style={{ top: `${i * YEAR_PITCH}px` }}
              ref={(el) => {
                if (el) yearRefs.current.set(y.i, el);
                else yearRefs.current.delete(y.i);
              }}
              aria-current={y.label === lineYear ? "true" : undefined}
              data-on={y.label === lineYear ? "true" : undefined}
              onClick={() => jumpToYear(y.i)}
            >
              {y.label}
            </button>
          ))}
        </div>
      </nav>

      {/* THE SPINE, one mark per month, the glass ticks from the desktop rail
          turned ninety degrees. Absolutely positioned in the gutter and
          `aria-hidden`: it is the same hundred months the rows already name,
          drawn as texture, and reading it aloud would be a hundred empty
          announcements between every two real ones. */}
      <div className="tlv__spine" ref={spineRef} aria-hidden>
        {/* RENDERED ONCE, POSITIONED BY CSS, NEVER TOUCHED AGAIN.
            `top` is `i * PITCH` and PITCH is a constant, so these can be plain
            static markup - no measurement, no state, no reconciliation for the
            life of the section. Only `--r` is ever written, and only to the
            seventeen nodes inside the lens.

            The COUNT is generous rather than exact, and the spine clips. A tick
            is texture now, not a month, so the honest thing is to fill whatever
            height the list happens to have - and letting `overflow: hidden` end
            the run means a row opening reveals more spine instead of restretching
            the spine that is already there. Nothing moves. */}
        {Array.from({ length: TICKS }, (unused, i) => (
          <span key={i} className="tlv__tick" style={{ top: `${i * PITCH}px` }} />
        ))}
      </div>

      <ol className="tlv__list">
        {rows.map((r) => {
          const open = r.key === openKey;
          const extra = (r.detail?.outs || []).filter((o) => o !== r.detail?.summary);
          return (
            <li
              className="tlv__row"
              key={r.key}
              data-open={open ? "true" : undefined}
              ref={(el) => {
                if (el) rowRefs.current.set(r.key, el);
                else rowRefs.current.delete(r.key);
              }}
            >
              {/* NO PER-ROW MARK. There used to be a dot here and a 1px rule
                  behind the list; both are gone, replaced by the glass spine.
                  The tenure starts are not marked on the spine either, and that
                  is the price of an even pitch: a tick is no longer a month, so
                  it cannot be THAT month. What names the run is the row itself,
                  right beside it, in words. */}
              {/* A BUTTON, not a div with a handler - keyboard support and an
                  announced state, for free. `aria-current`, NOT `aria-expanded`:
                  see the note on `select` above. One row is always open, so what
                  this control does is choose WHICH, and describing it as a
                  disclosure would promise a collapse that does not exist. */}
              <button
                type="button"
                className="tlv__head"
                aria-current={open ? "true" : undefined}
                onClick={() => select(r.key)}
              >
                <span className="tlv__org">{r.org}</span>
                {/* The role comes BACK on touch. It was removed from the
                    horizontal tiles (annotation msmtewu7) because ten of them
                    across 500px became a paragraph - the constraint was width,
                    and here there is a whole line for it. */}
                {r.role ? <span className="tlv__role">{r.role}</span> : null}
                <span className="tlv__when">
                  {r.start}
                  {r.end && r.end !== r.start ? ` — ${r.end}` : ""}
                </span>
              </button>

              {/* TWO ELEMENTS, and the outer one is the only reason this can
                  animate at all. `hidden` (display:none -> block) has no
                  midpoint, so the old body could only pop.

                  The outer is a grid whose single row goes 0fr -> 1fr, which IS
                  animatable and needs no measured pixel height - the thing the
                  desktop card's note warns against animating, because measuring
                  content that has not been laid out yet is how a height
                  transition ends up glitching on its first frame. The inner
                  clips. `min-height: 0` on it is not optional: a grid item's
                  automatic minimum is its content, and without it the row simply
                  refuses to go below its own text.

                  Still not in the accessibility tree when shut - `inert` and
                  `aria-hidden` do that job now that `hidden` cannot. */}
              <div className="tlv__body" aria-hidden={!open} inert={!open ? "" : undefined}>
                <div className="tlv__body-in">
                  {r.detail?.summary ? <p className="tlv__sum">{r.detail.summary}</p> : null}
                  {extra.length ? (
                    <ul className="tlv__outs">
                      {extra.map((o, k) => (
                        <li key={k}>{o}</li>
                      ))}
                    </ul>
                  ) : null}
                </div>
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
