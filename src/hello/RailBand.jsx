// THE RAIL, ROTATED TO HORIZONTAL — the vertical column's engine and every one
// of its interactions, remapped from the Y axis to X (Agam, 2026-08-13: "we
// could just rotate and preserve all the components and interactions we made in
// the vertical layout").
//
// This is a faithful port of RailColumn.jsx, NOT a rebuild. Everything that made
// the vertical rail good comes across whole:
//
//   - the GLASS SPINE MAGNIFIER: the same raised-cosine wave, driven by scroll,
//     lifting the ticks nearest the reading line (now the horizontal centre).
//   - the NEAREST-TO-THE-LINE SELECTION with hysteresis: the card under the
//     reading line is the open one, and a challenger has to be decisively nearer
//     before it takes over, so scrolling does not flicker.
//   - the YEAR WHEEL PICKER: the active year sits on the reading line and the
//     rest space evenly around it, sliding as you scroll — translateX here where
//     the column used translateY.
//   - the CARD OPEN/CLOSE: the same 0fr→1fr grid reveal, on COLUMNS here instead
//     of rows, so a card grows in WIDTH the way the column's grew in height.
//   - tap-to-select brings a card to the line and opens it on the way.
//
// WHAT ROTATES is which dimension carries which job: the page's vertical scroll
// becomes this strip's horizontal scroll, `top` becomes `left`, `rect.top`
// becomes `rect.left`, `innerHeight` becomes the scroller's width. The text
// stays upright — only the axis turns.
//
// The vertical column (RailColumn.jsx, `.tlv*`) is frozen as v1 in /lab and is
// untouched; this is a separate component with its own `.tlh*` classes.

import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { feedback, feedbackCoalesced } from "../ui/feedback";

// The reading line is the CENTRE of the scroller — the card there is the open
// one (the column's rule, unchanged; only the axis it measures on turns).
const READ_LINE = 0.5;
// How much nearer a challenger must be before it takes the selection, in px.
// Without it two cards near the line trade places on sub-pixel scrolls.
const HYSTERESIS = 28;
// The lens radius in PIXELS (a lens is a thing on screen, so it is counted in
// what the reader sees, not in months whose pitch is uneven).
const LENS = 96;
// The spine's month pitch and the wheel's year pitch, both along X now.
const PITCH = 12;
// 64px, up from the column's 52: a "2018" label is wider than it is tall, so a
// horizontal wheel needs more room between targets than a vertical one did.
const YEAR_PITCH = 64;
// Generous and clipped by the spine's own overflow — the strip is only as wide
// as the cards, and anything past it is simply not drawn.
const TICKS = 360;

export default function RailBand({ model, details }) {
  const rootRef = useRef(null);
  const scrollRef = useRef(null); // the horizontal scroller — the axis is here
  const stripRef = useRef(null); // the scrolling content
  const spineRef = useRef(null);
  const rowRefs = useRef(new Map());
  const yearRefs = useRef(new Map());
  const yearXRef = useRef(new Map()); // year i -> content X, for the jump

  // OLDEST FIRST, left to right — reading right IS reading forward, the same
  // order the column reads top to bottom. Identical to RailColumn's rows.
  const rows = useMemo(
    () =>
      model.cards
        .map((c) => ({
          ...c,
          detail: c.tid ? details.get(c.tid) : null,
          start: model.months[c.i0]?.label ?? "",
          end: model.months[c.i1]?.label ?? "",
        }))
        .sort((a, b) => a.i0 - b.i0),
    [model, details],
  );

  // Every January in the span, plus the record's first month when it does not
  // open in January — the no-holes axis, unchanged from the column.
  const years = useMemo(() => {
    const list = model.years;
    const firstYear = String(Math.floor(model.months[0].m / 12));
    return list[0]?.label === firstYear ? list : [{ label: firstYear, i: 0 }, ...list];
  }, [model.years, model.months]);

  const [lineYear, setLineYear] = useState(null);
  const [pinned, setPinned] = useState(null);
  const [near, setNear] = useState(0);
  const nearRef = useRef(null);
  const openKey = pinned ?? near;
  // THE OPEN STATE COMMITS AT REST (Agam, 2026-08-15: "remove any changes in
  // width during swipe"). `openKey` is the selection and it moves live with
  // the tape — but a card OPENING is a width animation, and any width
  // animation during motion is churn beside a decelerating scroll, even now
  // that it moves no geometry. So the RENDERED open card (`shownKey`) lags the
  // selection: it only syncs once the tape has been still for a beat with no
  // gesture or flight in progress. During a swipe nothing opens and nothing
  // closes; the handover happens on the settled frame, where it reads as the
  // landing's payoff instead of noise inside the motion.
  const [shownKey, setShownKey] = useState(null);
  const openKeyRef = useRef(openKey);
  openKeyRef.current = openKey;
  const selfScroll = useRef(false);
  // a finger or mouse button is down on the tape. Declared HERE, above every
  // effect that closes over it (the wave envelope reads it well before the
  // gesture handlers are set up below) — a `const` further down would sit in
  // the TDZ for any dep array evaluated during render, the exact trap that
  // once took out the timeline.
  const gestureRef = useRef(false);
  // true from the first rubber-band stretch until its spring-back lands. The
  // stretch is a scaleX on the strip, and every content-X in this file is
  // measured against the strip's rect — geometry read mid-stretch is distorted
  // by up to the give, so the watchers must not aim flights off it.
  const stretchedRef = useRef(false);
  const [ready, setReady] = useState(false);

  // the rest-detector for shownKey: every scroll event and every selection
  // change re-arms a short quiet timer; it only commits when the beat passes
  // with nothing owning the tape. Re-armed rather than fired while a gesture
  // or flight is live, so the commit always lands on a genuinely still frame.
  useEffect(() => {
    const sc = scrollRef.current;
    if (!sc) return undefined;
    let t = 0;
    const arm = () => {
      window.clearTimeout(t);
      t = window.setTimeout(() => {
        if (gestureRef.current || sc.dataset.flying) {
          arm();
          return;
        }
        setShownKey((prev) => (prev === openKeyRef.current ? prev : openKeyRef.current));
      }, 140);
    };
    arm();
    sc.addEventListener("scroll", arm, { passive: true });
    sc.addEventListener("touchend", arm, { passive: true });
    return () => {
      window.clearTimeout(t);
      sc.removeEventListener("scroll", arm);
      sc.removeEventListener("touchend", arm);
    };
  }, [openKey]);

  // ── CARD HEIGHT, HUGGED TO THE TALLEST RECORD (Agam, 2026-08-14: "the boxes
  // have internal scroll, please fix — set a height based on the tallest card
  // if the heights were to hug"). `--tlh-card-h` was a guessed 300px, so any
  // record taller than the guess had to scroll inside the card instead of the
  // card just being tall enough. The real height depends on the actual text —
  // org names wrap, summaries run long or short — so it is MEASURED, not
  // guessed: an offscreen copy of every row, rendered fully OPEN, gives each
  // one's true hugged height; the tallest becomes the one height every card
  // shares (cards still need one shared height, or a card would resize under
  // the reading line as the selection moves past it).
  const measureRefs = useRef(new Map());
  const [cardH, setCardH] = useState(null);
  const measureCardHeight = useCallback(() => {
    let max = 0;
    measureRefs.current.forEach((el) => {
      if (el) max = Math.max(max, el.offsetHeight);
    });
    if (max > 0) setCardH((prev) => (prev === max ? prev : max));
  }, []);

  // ── NEAREST CARD TO THE READING LINE, read on scroll ─────────────────────
  // The column's onScroll, with `top`→`left` and the window's height→the
  // scroller's width. Measures the HEAD (fixed size) not the card, so an opening
  // card's own growth cannot move the metric that chose it.
  useEffect(() => {
    const sc = scrollRef.current;
    if (!sc) return undefined;
    const onScroll = () => {
      // A HIDDEN SCROLLER MEASURES AS ZERO and its rects go stale (background
      // tab, pane restore) — committing a "nearest" off that is committing
      // garbage. Skip; a real scroll will follow when the pane is visible.
      if (!sc.clientWidth) return;
      const scRect = sc.getBoundingClientRect();
      const line = scRect.left + sc.clientWidth * READ_LINE;
      let best = null;
      let bestD = Infinity;
      let currentD = Infinity;
      rowRefs.current.forEach((el, key) => {
        if (!el) return;
        const head = el.querySelector(".tlh__head") || el;
        const b = head.getBoundingClientRect();
        const d = Math.abs(b.left + b.width / 2 - line);
        if (key === nearRef.current) currentD = d;
        if (d < bestD) {
          bestD = d;
          best = key;
        }
      });
      if (best == null) return;
      if (!selfScroll.current) setPinned(null);
      if (best === nearRef.current) return;
      if (bestD > currentD - HYSTERESIS) return;
      nearRef.current = best;
      feedbackCoalesced("navigate");
      setNear(best);
    };
    onScroll();
    sc.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      sc.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  // Bring a content-X to the reading line — BY DRIVING THE APPROACH OURSELVES
  // (Agam, 2026-08-15: "snapping to the centers is not perfect, see the header
  // slide for reference"). The header marquee never negotiates its landing:
  // centreOn() measures the cell and drives the track there with cine-settle,
  // so it is dead-centre every time. The scroller versions of this kept
  // missing, for stacked reasons: native smooth scrollTo aims at a FIXED
  // number while the open card's width transition moves the geometry under it,
  // Chromium cancels the smooth scroll at the first active snap point it
  // passes, and a hidden tab freezes it entirely. So the flight is now a rAF
  // tween on scrollLeft with the marquee's own arrival (easeOutQuint — firm,
  // no overshoot, the same call centreOn makes against the M3 expressive
  // curve) toward a LIVE target: `target` may be a function, re-measured every
  // frame, so a card still finishing its open animation is tracked to where it
  // WILL be, and the final frame writes the exact landing. Snap stays quiet
  // for the duration (data-flying); it returns to find nothing to correct.
  //
  // The pin is held until arrival (selfScroll), and the flight is
  // INTERRUPTIBLE — a finger or wheel on the tape releases it immediately,
  // because an animation the user cannot take over is the first thing the
  // physicality rules say not to build.
  const flight = useRef(0);
  // the CURRENT flight's release — bringX must retire the old flight fully
  // (listeners and all) before starting a new one. Cancelling only its rAF
  // left the old cancel-listeners armed: a later touch would run the OLD
  // release and strip selfScroll + data-flying out from under the NEW flight.
  const flightRelease = useRef(null);
  // and on unmount (HMR mid-flight), so no flight outlives its component
  useEffect(() => () => flightRelease.current?.(false), []);
  // `v0` (px/ms, optional) is the scroll's CURRENT velocity at handoff. With it,
  // the flight is a critically-damped spring seeded with that velocity — the
  // approach begins exactly as fast as the tape was already moving, so the
  // takeover is invisible (Agam, 2026-08-15: "snapping to center is still
  // slightly delayed and doesn't feel seamless" — a timed ease from a standing
  // start visibly RESTARTS motion that had not finished). Without it, the timed
  // quint below is the right shape: taps and year jumps DO start from rest.
  const bringX = useCallback((target, v0) => {
    const sc = scrollRef.current;
    if (sc == null || target == null) return;
    const getX = typeof target === "function" ? target : () => target;
    const FLY_MS = 500; // = --m3-dur-spatial-default, the marquee's MOVE
    const easeOutQuint = (p) => 1 - Math.pow(1 - p, 5);
    // retire the previous flight COMPLETELY — keepFlying, because this flight
    // raises the flag again on the next line and a delete/set pair in one tick
    // would let snap glimpse an armed state mid-handover
    flightRelease.current?.(true);
    // REDUCED MOTION: the flight is a JUMP — travel is the information, the
    // glide is the motion. The jump's own scroll event is owned for a beat so
    // a tap's pin survives it; if the card was still mid-open when we jumped,
    // the settle backstop trues the last few px with a second jump.
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) {
      const x = getX();
      if (x == null) return;
      selfScroll.current = true;
      sc.scrollLeft = x - sc.clientWidth * READ_LINE;
      window.setTimeout(() => {
        selfScroll.current = false;
      }, 80);
      return;
    }
    selfScroll.current = true;
    sc.dataset.flying = "true";
    const from = sc.scrollLeft;
    const t0 = performance.now();
    let done = false;
    const release = (keepFlying) => {
      if (done) return;
      done = true;
      window.cancelAnimationFrame(flight.current);
      selfScroll.current = false;
      if (!keepFlying) delete sc.dataset.flying;
      sc.removeEventListener("touchstart", onTouch);
      sc.removeEventListener("wheel", onWheel);
      sc.removeEventListener("pointerdown", onPointer);
      if (flightRelease.current === release) flightRelease.current = null;
    };
    flightRelease.current = release;
    const onTouch = () => release(false);
    // a WHEEL only cancels on a deliberate push. macOS inertial scrolling
    // keeps emitting small trailing ticks through the coast — the takeover
    // launches after a 120ms gap in them, and one more 3px straggler must not
    // kill the very flight it handed off to (that re-creates the dead-stop +
    // settle seam, intermittently, on every trackpad).
    const onWheel = (e) => {
      if (Math.abs(e.deltaX) + Math.abs(e.deltaY) > 12) release(false);
    };
    // a mouse takeover is the drag handler's — it has already raised its own
    // data-flying by the time this fires (its listener is older), so keep it
    const onPointer = (e) => {
      if (e.pointerType === "mouse") release(true);
    };
    sc.addEventListener("touchstart", onTouch, { passive: true });
    sc.addEventListener("wheel", onWheel, { passive: true });
    sc.addEventListener("pointerdown", onPointer);
    if (v0 != null) {
      // ── the spring: position and velocity integrated per frame ────────────
      // Critically damped (a = ω²·Δ − 2ω·v), so it arrives firmly with no
      // oscillation — the scroller's own momentum flows straight into the
      // detent. ω = 0.012/ms lands in ≈380ms, a touch quicker than the tap
      // flight because half the journey already happened as real momentum.
      const OMEGA = 0.012;
      let x = sc.scrollLeft;
      let v = v0;
      let last = t0;
      const stepSpring = (now) => {
        if (done) return;
        if (!sc.clientWidth) return release(false); // hidden — rects are garbage
        const gx = getX();
        if (gx == null) return release(false);
        const to = gx - sc.clientWidth * READ_LINE;
        // clamp dt: a dropped frame must not integrate a 200ms leap
        const dt = Math.min(32, now - last);
        last = now;
        v += (OMEGA * OMEGA * (to - x) - 2 * OMEGA * v) * dt;
        x += v * dt;
        if (Math.abs(to - x) < 0.5 && Math.abs(v) < 0.02) {
          sc.scrollLeft = to; // the exact landing
          release(false);
        } else {
          sc.scrollLeft = x;
          flight.current = window.requestAnimationFrame(stepSpring);
        }
      };
      flight.current = window.requestAnimationFrame(stepSpring);
      return;
    }
    const step = (now) => {
      if (done) return;
      if (!sc.clientWidth) return release(false); // hidden — rects are garbage
      const x = getX();
      if (x == null) return release(false);
      const to = x - sc.clientWidth * READ_LINE;
      const p = Math.min(1, (now - t0) / FLY_MS);
      sc.scrollLeft = from + (to - from) * easeOutQuint(p);
      if (p >= 1) {
        sc.scrollLeft = to; // the exact landing, against settled geometry
        release(false);
      } else {
        flight.current = window.requestAnimationFrame(step);
      }
    };
    flight.current = window.requestAnimationFrame(step);
  }, []);

  // Content-X of an element's centre — scroll-independent, measured against the
  // strip's own left edge (which moves with scroll, cancelling it out).
  const contentX = useCallback((el) => {
    const strip = stripRef.current;
    if (!strip || !el) return null;
    const b = el.getBoundingClientRect();
    const base = strip.getBoundingClientRect().left;
    return b.left - base + b.width / 2;
  }, []);

  // Nearest head to a CONTENT-X — shared by the year jump, settle watcher and
  // mouse glide, all of which need "which card does this position belong to".
  // The ELEMENT, not its x: callers hand it to bringX as a live target, so the
  // landing is measured at arrival time rather than frozen at decision time.
  // Declared HERE, above every hook that lists it in a dep array — dep arrays
  // evaluate during render, and a const below them is a TDZ crash.
  const nearestHead = useCallback(
    (x) => {
      let best = null;
      let bestD = Infinity;
      rowRefs.current.forEach((el) => {
        if (!el) return;
        const head = el.querySelector(".tlh__head") || el;
        const hx = contentX(head);
        if (hx == null) return;
        const d = Math.abs(hx - x);
        if (d < bestD) {
          bestD = d;
          best = head;
        }
      });
      return best;
    },
    [contentX],
  );

  const select = useCallback(
    (key) => {
      if (!rowRefs.current.get(key)) return;
      setPinned(key);
      // a LIVE target, not a number: the tween re-measures this every frame,
      // so the whole open/close width dance — this card growing, the outgoing
      // one shrinking — is tracked to its settled geometry in one flight. The
      // old second flight at 380ms ("re-centre once the width animation
      // settles") existed to paper over the fixed-target miss and is gone.
      bringX(() => {
        const el = rowRefs.current.get(key);
        const head = el?.querySelector(".tlh__head") || el;
        return head ? contentX(head) : null;
      });
      feedback("select");
    },
    [bringX, contentX],
  );

  const jumpToYear = useCallback(
    (i) => {
      const x = yearXRef.current.get(i);
      if (x == null) return;
      setPinned(null);
      // fly to the CARD nearest the year, not to the year's interpolated x —
      // the rule is "always a card on the line", and landing in the void
      // between cards just so the settle can drag us out of it 120ms later is
      // the two-act seam this rail keeps having to remove. A live target, so
      // the open/close width dance en route is tracked like every other flight.
      const head = nearestHead(x);
      if (!head) return;
      bringX(() => contentX(head));
      feedback("select");
    },
    [bringX, nearestHead, contentX],
  );

  // ── WHERE EVERY YEAR SITS, for the jump ──────────────────────────────────
  // The column's measure(), on X. Anchors are each card's centre; a year's X is
  // interpolated between the tenure starts either side of it. Monotonic by
  // construction. Written to a ref, never through React.
  const measure = useCallback(() => {
    const strip = stripRef.current;
    if (!strip) return;
    const base = strip.getBoundingClientRect().left;
    const anchors = [];
    for (const r of rows) {
      const el = rowRefs.current.get(r.key);
      if (!el) continue;
      // THE HEAD'S CENTRE, not the card's (mobile QA 2026-08-13: the lit year
      // read 2024 while Away, Jan 2026, was on the line). The selection and
      // bringX both measure heads, but these anchors measured the whole card —
      // and an open card is 300px wider than its head, so its centre sat far
      // right of the point the other two rules agree on. One measuring point
      // everywhere, the same fix the column made for its scroll rule.
      const head = el.querySelector(".tlh__head") || el;
      const b = head.getBoundingClientRect();
      anchors.push({ m: r.i0, x: b.left - base + b.width / 2 });
    }
    if (anchors.length < 2) return;
    const at = (m) => {
      let seg = 0;
      while (seg < anchors.length - 2 && m >= anchors[seg + 1].m) seg++;
      const a = anchors[seg];
      const b = anchors[seg + 1];
      const span = b.m - a.m || 1;
      return a.x + ((m - a.m) / span) * (b.x - a.x);
    };
    yearXRef.current.clear();
    for (const y of years) yearXRef.current.set(y.i, at(y.i));
    if (!ready) setReady(true);
  }, [rows, years, ready]);

  useLayoutEffect(() => {
    measure();
  }, [measure, openKey]);

  useEffect(() => {
    const strip = stripRef.current;
    if (!strip) return undefined;
    const ro = new ResizeObserver(measure);
    ro.observe(strip);
    return () => ro.disconnect();
  }, [measure]);

  // Re-measure the hugged card height whenever the rows change — a text edit
  // can change which row is tallest.
  useLayoutEffect(() => {
    measureCardHeight();
  }, [measureCardHeight, rows]);

  // ...and whenever the responsive open-width changes (rotation, resize):
  // every measurer shares that same width, so watching one is enough.
  useEffect(() => {
    const first = measureRefs.current.values().next().value;
    if (!first) return undefined;
    const ro = new ResizeObserver(measureCardHeight);
    ro.observe(first);
    return () => ro.disconnect();
  }, [measureCardHeight, rows]);

  // ── THE WAVE ─────────────────────────────────────────────────────────────
  // The column's raised-cosine wave, on X. `--r` per tick within the lens, the
  // rest written to zero, one paint per frame behind a rAF gate.
  //
  // GATED BY AN ACTIVITY ENVELOPE (Agam, 2026-08-15: "the glass vertical
  // dashes are always in hover state — bring the default state from desktop").
  // The desktop rail's wave is scaled by a STRENGTH that rests at 0 and swells
  // only while the pointer engages, so its default is a flat, quiet spine.
  // Parking this wave permanently at the reading line lost that: the crest
  // became furniture. `env` is the strength ported to the tape: 0 at rest,
  // swelling toward 1 while the tape is actually moving (scroll, touch,
  // flight), relaxing back once it has been still — the same swells-and-
  // relaxes character as the desktop's soft spring, as an exponential
  // approach with a ~120ms time constant. Under reduced motion the envelope
  // JUMPS instead of easing — the desktop's own call: the magnification is
  // information, the easing is the only motion.
  useEffect(() => {
    const sc = scrollRef.current;
    const spine = spineRef.current;
    if (!sc || !spine) return undefined;
    const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    let queued = 0;
    let env = 0;
    let lastMove = 0; // last time the tape actually travelled
    let lastSl = sc.scrollLeft;
    let lastT = 0;
    const paint = (now = performance.now()) => {
      queued = 0;
      if (!sc.clientWidth) return; // hidden pane — rects are garbage, skip
      // ── the envelope ─────────────────────────────────────────────────────
      if (sc.scrollLeft !== lastSl) {
        lastSl = sc.scrollLeft;
        lastMove = now;
      }
      const engaged = gestureRef.current || sc.dataset.flying || now - lastMove < 90;
      const target = engaged ? 1 : 0;
      const dt = lastT ? Math.min(64, now - lastT) : 16;
      lastT = now;
      env = reduce ? target : env + (target - env) * (1 - Math.exp(-dt / 120));
      if (Math.abs(env - target) < 0.005) env = target;
      const marks = spine.children;
      const scRect = sc.getBoundingClientRect();
      const lineVp = scRect.left + sc.clientWidth * READ_LINE;
      // the reading line, in the spine's own content coordinates (for the ticks)
      const line = lineVp - spine.getBoundingClientRect().left;
      const first = Math.max(0, Math.floor((line - LENS) / PITCH));
      const last = Math.min(marks.length - 1, Math.ceil((line + LENS) / PITCH));
      for (let i = 0; i < marks.length; i++) {
        if (i < first || i > last || env === 0) {
          if (marks[i].style.getPropertyValue("--r") !== "0") marks[i].style.setProperty("--r", "0");
          continue;
        }
        const d = Math.abs(i * PITCH - line);
        const r = d >= LENS ? 0 : 0.5 * (1 + Math.cos((Math.PI * d) / LENS)) * env;
        marks[i].style.setProperty("--r", r.toFixed(3));
      }
      // keep painting while the envelope is still travelling — the relax
      // happens AFTER the last scroll event, when nothing else will call us
      if (env !== target || engaged) {
        if (!queued) queued = requestAnimationFrame(paint);
      }
      // ── THE DEPTH PASS (Agam, 2026-08-14: directions 1+2) ────────────────
      // Cards live on a shallow z-stage: the one on the reading line is
      // NEAREST, neighbours recede. Driven here, in the same rAF as the spine
      // wave, so focus and crest always agree — they are one gesture read two
      // ways. `--dp` is 0 on the line and 1 a half-viewport away; the CSS
      // turns it into scale/opacity/shadow. Transform scales about the card's
      // centre, so every rect this file measures (head centres for selection,
      // anchors, bringX) keeps its centre — depth cannot shift the geometry
      // that drives it.
      rowRefs.current.forEach((el) => {
        if (!el) return;
        const head = el.querySelector(".tlh__head") || el;
        const b = head.getBoundingClientRect();
        const d = Math.min(1, Math.abs(b.left + b.width / 2 - lineVp) / (sc.clientWidth * 0.5));
        const v = d.toFixed(3);
        if (el.style.getPropertyValue("--dp") !== v) el.style.setProperty("--dp", v);
      });
      // THE LIT YEAR IS MEASURED IN THE STRIP'S COORDINATES, NOT THE SPINE'S
      // (mobile QA 2026-08-13: the lit year lagged the open card by ~a year).
      // `line` above is relative to the spine, which starts 50vw INTO the strip
      // — but yearXRef is measured against the strip's left edge in measure().
      // Reusing `line` for both compared two different coordinate spaces and the
      // 50vw offset landed the lookup a year early. One line per space.
      const strip = stripRef.current;
      const lineStrip = strip ? lineVp - strip.getBoundingClientRect().left : line;
      // the lit year is the last one the line has passed
      let best = null;
      let bestD = Infinity;
      yearXRef.current.forEach((x, i) => {
        const d = lineStrip - x;
        if (d >= -24 && d < bestD) {
          bestD = d;
          best = i;
        }
      });
      const label = best == null ? years[0]?.label : years.find((y) => y.i === best)?.label;
      if (label) setLineYear((prev) => (prev === label ? prev : label));
    };
    const onScroll = () => {
      if (queued) return;
      queued = requestAnimationFrame(paint);
    };
    paint();
    sc.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      if (queued) cancelAnimationFrame(queued);
      sc.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [years, ready]);

  // ── THE MOMENTUM HANDOFF (Agam, 2026-08-15: "snapping to center is still
  // slightly delayed and doesn't feel seamless"). The seam he felt was
  // structural: the tape came fully to REST, the settle watcher waited out its
  // debounce, and only then did a fresh animation start — three visible acts.
  // This watcher removes the seam by never letting the rest happen: it reads
  // the scroll's own velocity off scroll events, and once a free deceleration
  // (no finger down, no flight, no live trackpad pan) drops into the takeover
  // band, it projects where the momentum was going to die, picks the detent
  // nearest THAT point, and hands the motion to the spring flight seeded with
  // the current velocity — one continuous motion from flick to detent.
  useEffect(() => {
    const sc = scrollRef.current;
    if (!sc) return undefined;
    let lastSl = sc.scrollLeft;
    let lastT = performance.now();
    let v = 0; // px/ms, low-passed
    let lastWheel = 0;
    // WHOSE MOMENTUM IS THIS? (Agam, 2026-08-15: "single swipe left or right
    // is still glitchy"). On touch, the platform's own momentum + snap owns
    // the deceleration END TO END — iOS does not reliably cede a decelerating
    // scroller to programmatic writes, so a takeover there is two owners
    // fighting (the visible glitch). Now that opening a card no longer moves
    // any geometry, native snap lands touch flicks cleanly by itself; the
    // takeover exists for WHEEL/TRACKPAD momentum only, where snap coasts to
    // arbitrary stops and scrollLeft writes are honoured.
    let source = "wheel";
    const onTouchSrc = () => {
      source = "touch";
    };
    // a wheel event within this window means a trackpad pan is still LIVE —
    // taking over a motion the hand is still making is hijacking, not physics
    const onWheel = () => {
      lastWheel = performance.now();
      source = "wheel";
    };
    const onScroll = () => {
      const now = performance.now();
      const dt = now - lastT;
      if (dt <= 0) return;
      // WHILE SOMETHING ELSE OWNS THE TAPE, THE VELOCITY RESETS rather than
      // keeps integrating — a flight's own landing event otherwise arrived
      // carrying flight-era velocity with every guard already down, and could
      // launch a phantom spring off a completed landing.
      if (gestureRef.current || selfScroll.current || sc.dataset.flying) {
        v = 0;
        lastSl = sc.scrollLeft;
        lastT = now;
        return;
      }
      v = 0.7 * ((sc.scrollLeft - lastSl) / dt) + 0.3 * v;
      lastSl = sc.scrollLeft;
      lastT = now;
      if (stretchedRef.current) return; // geometry is distorted mid-stretch
      if (source === "touch") return; // native momentum + snap owns touch flicks
      // INSIDE THE iOS EDGE BOUNCE the native physics owns the tape: scrollLeft
      // runs past the bounds and springs back, and a takeover mid-bounce is two
      // owners writing at once (the tape visibly gets yanked at the end)
      if (sc.scrollLeft < 0 || sc.scrollLeft > sc.scrollWidth - sc.clientWidth) return;
      if (now - lastWheel < 120) return;
      const av = Math.abs(v);
      // the band: above it the flick is still genuinely travelling (grabbing
      // it early reads as hijack), below it the settle backstop owns the case
      if (av < 0.08 || av > 1.4) return;
      // where this deceleration was going to die, in content coordinates —
      // ~260ms of remaining exponential decay at the current rate
      const rest = sc.scrollLeft + sc.clientWidth * READ_LINE + v * 260;
      const head = nearestHead(rest);
      if (head) bringX(() => contentX(head), v);
    };
    sc.addEventListener("scroll", onScroll, { passive: true });
    sc.addEventListener("wheel", onWheel, { passive: true });
    sc.addEventListener("touchstart", onTouchSrc, { passive: true });
    return () => {
      sc.removeEventListener("scroll", onScroll);
      sc.removeEventListener("wheel", onWheel);
      sc.removeEventListener("touchstart", onTouchSrc);
    };
  }, [nearestHead, contentX, bringX]);

  // ── ALWAYS A CARD ON THE LINE (Agam, 2026-08-14: "always snap a card to the
  // center"). Proximity snap only acts when the rest position lands NEAR a
  // snap point — a long flick can still die between two cards and stay there.
  // The momentum handoff above catches almost everything mid-flight; this
  // watcher is the backstop for a tape that reached rest anyway (a stop dead
  // in the void, throttled events, a resize). When the scroll has been quiet
  // for a beat and no gesture or flight owns it, and no head sits on the line,
  // it flies the nearest one in.
  useEffect(() => {
    const sc = scrollRef.current;
    if (!sc) return undefined;
    let t = 0;
    const onScroll = () => {
      window.clearTimeout(t);
      t = window.setTimeout(() => {
        if (gestureRef.current || selfScroll.current || sc.dataset.flying) return;
        if (stretchedRef.current) return; // wait out the rubber spring-back
        if (!sc.clientWidth) return;
        // mid-bounce on iOS the native spring owns the tape — its own return
        // fires more scroll events, and the settle re-arms off those
        if (sc.scrollLeft < 0 || sc.scrollLeft > sc.scrollWidth - sc.clientWidth) return;
        const line = sc.scrollLeft + sc.clientWidth * READ_LINE;
        const head = nearestHead(line);
        const hx = head ? contentX(head) : null;
        if (hx != null && Math.abs(hx - line) > 1) bringX(() => contentX(head));
      }, 120);
    };
    sc.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.clearTimeout(t);
      sc.removeEventListener("scroll", onScroll);
    };
  }, [nearestHead, contentX, bringX]);

  // The settle watcher must stay silent while a finger is on the tape — this
  // tracks that, separately from the rubber band (which reduced-motion turns
  // off; knowing a gesture is live is not motion).
  useEffect(() => {
    const sc = scrollRef.current;
    if (!sc) return undefined;
    const down = () => {
      gestureRef.current = true;
    };
    const up = () => {
      gestureRef.current = false;
    };
    sc.addEventListener("touchstart", down, { passive: true });
    sc.addEventListener("touchend", up, { passive: true });
    sc.addEventListener("touchcancel", up, { passive: true });
    return () => {
      sc.removeEventListener("touchstart", down);
      sc.removeEventListener("touchend", up);
      sc.removeEventListener("touchcancel", up);
    };
  }, []);

  // ── MOUSE DRAG (Agam, 2026-08-14: "allow drag as well"). Touch pans the
  // scroller natively; a mouse does not — on desktop the tape was wheel-or-
  // click only. This is drag-to-scroll with a flick: pointer capture on the
  // scroller, 1:1 movement while down, and on release the velocity projects a
  // landing point which is then rounded to the nearest card centre and flown
  // to — so a mouse flick gets the same detent physics a touch flick gets from
  // native snap. data-flying goes up for the whole drag, because a direct
  // scrollLeft write under an active snap-type invites the browser to re-snap
  // against the drag (the same Chromium fight bringX had). */
  useEffect(() => {
    const sc = scrollRef.current;
    if (!sc) return undefined;
    let dragging = false;
    let moved = 0;
    let x0 = 0;
    let sl0 = 0;
    let lastX = 0;
    let lastT = 0;
    let vx = 0; // px/ms, smoothed
    const onDown = (e) => {
      if (e.pointerType !== "mouse" || e.button !== 0) return;
      dragging = true;
      moved = 0;
      x0 = lastX = e.clientX;
      sl0 = sc.scrollLeft;
      lastT = e.timeStamp;
      vx = 0;
      gestureRef.current = true;
      sc.dataset.flying = "true";
      sc.dataset.dragging = "true"; // cursor + selection block, drag only
      try {
        sc.setPointerCapture(e.pointerId);
      } catch {
        // a pointer that got released between down and here — the drag still
        // works, it just loses the outside-the-element grip
      }
    };
    const onMove = (e) => {
      if (!dragging) return;
      // capture can fail (see onDown's catch) and the release then happen
      // off-window — no pointerup ever arrives and the tape would follow a
      // bare cursor forever, snap off, envelope pinned. The button state is
      // on every move event; a move with no button IS the missed release.
      if (!(e.buttons & 1)) return onUp(e);
      const dx = e.clientX - x0;
      moved = Math.max(moved, Math.abs(dx));
      sc.scrollLeft = sl0 - dx;
      const dt = e.timeStamp - lastT;
      if (dt > 0) {
        // low-pass the velocity so one jittery frame cannot own the flick
        vx = 0.8 * ((e.clientX - lastX) / dt) + 0.2 * vx;
        lastX = e.clientX;
        lastT = e.timeStamp;
      }
    };
    const onUp = (e) => {
      if (!dragging) return;
      dragging = false;
      gestureRef.current = false;
      delete sc.dataset.flying;
      delete sc.dataset.dragging;
      if (sc.hasPointerCapture(e.pointerId)) sc.releasePointerCapture(e.pointerId);
      // a press that never travelled is a CLICK, not a drag — firing a flick
      // off it launched a pointless zero-distance flight that then raced the
      // click's own select() flight
      if (moved <= 5) return;
      // the flick: project ~160ms of travel at release velocity, then land on
      // the nearest detent to the projected point (not to where the mouse let
      // go — a flick means "further that way", and the detent honours it).
      // The release velocity SEEDS the spring (-vx: mouse right = scroll
      // left), so the glide continues the hand's motion instead of restarting.
      const line = sc.scrollLeft + sc.clientWidth * READ_LINE - vx * 160;
      const head = nearestHead(line);
      if (head) bringX(() => contentX(head), -vx);
    };
    // a drag must not also be a click — otherwise releasing over a card head
    // selects it and the tape immediately flies somewhere else
    const onClick = (e) => {
      // detail 0 = keyboard activation (Enter/Space on a head) — no drag can
      // have preceded it, and a stale `moved` from an earlier drag must not
      // swallow it
      if (e.detail === 0) return;
      if (moved > 5) {
        e.stopPropagation();
        e.preventDefault();
        moved = 0;
      }
    };
    sc.addEventListener("pointerdown", onDown);
    sc.addEventListener("pointermove", onMove);
    sc.addEventListener("pointerup", onUp);
    sc.addEventListener("pointercancel", onUp);
    sc.addEventListener("click", onClick, true);
    return () => {
      sc.removeEventListener("pointerdown", onDown);
      sc.removeEventListener("pointermove", onMove);
      sc.removeEventListener("pointerup", onUp);
      sc.removeEventListener("pointercancel", onUp);
      sc.removeEventListener("click", onClick, true);
    };
  }, [nearestHead, contentX, bringX]);

  // ── THE RUBBER BAND (direction 1: the rail is a physical tape) ───────────
  // A web scroller just STOPS at its ends; a tape being pulled past its spool
  // resists and stretches. When a touch drag continues past either edge, the
  // strip scales horizontally about that edge with square-root resistance —
  // the further you pull, the less it gives — and on release it springs back.
  // Scale rather than translate, because a stretch says "this is the end of
  // the material" where a slide would say "there is more this way".
  useEffect(() => {
    const sc = scrollRef.current;
    const strip = stripRef.current;
    if (!sc || !strip) return undefined;
    // the stretch is motion — under reduced motion the tape just stops at its
    // ends, the way the depth stage goes flat under the same preference
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return undefined;
    let x0 = null; // touch X at the moment we hit the edge, else null
    let edge = 0; // -1 = left end, 1 = right end
    const atEdge = () => {
      // scrollLeft BEYOND the bounds means the platform has its own edge
      // bounce (iOS) — stacking our stretch on the native one doubles the
      // physics. Only take the edge when the tape is exactly clamped there,
      // which is the platforms-without-bounce case this band exists for.
      if (sc.scrollLeft < 0 || sc.scrollLeft > sc.scrollWidth - sc.clientWidth) return 0;
      if (sc.scrollLeft <= 0) return -1;
      if (sc.scrollLeft >= sc.scrollWidth - sc.clientWidth - 1) return 1;
      return 0;
    };
    const onStart = (e) => {
      edge = atEdge();
      x0 = edge ? e.touches[0].clientX : null;
    };
    const onMove = (e) => {
      // the drag may REACH the edge mid-gesture — start the stretch there
      if (x0 == null) {
        edge = atEdge();
        if (!edge) return;
        x0 = e.touches[0].clientX;
        return;
      }
      // the platform started its own bounce under us (iOS moves scrollLeft
      // past the bounds once the pull begins) — abort ours, one physics only
      if (sc.scrollLeft < 0 || sc.scrollLeft > sc.scrollWidth - sc.clientWidth) {
        strip.style.transform = "";
        x0 = null;
        return;
      }
      const pull = (e.touches[0].clientX - x0) * -edge; // px pulled past the end
      if (pull <= 0) {
        // pulled back inside — hand the gesture back to the scroller
        strip.style.transform = "";
        x0 = null;
        return;
      }
      const give = Math.min(36, Math.sqrt(pull) * 2.2); // 100px of pull ≈ 22px of give, capped
      // normalised by the VIEWPORT, not the strip: origin is the pulled end, so
      // a card one viewport in moves by `give` exactly — the stretch happens
      // where the finger is, instead of being spent across 2000px of offscreen
      // tape where nobody can see it
      const s = 1 + give / Math.max(1, sc.clientWidth);
      stretchedRef.current = true;
      // a new stretch during the previous spring-back must also cancel that
      // release's pending gate-clear, or it un-gates us mid-pull
      window.clearTimeout(onEnd.t);
      strip.style.transformOrigin = edge === -1 ? "left center" : "right center";
      strip.style.transition = "none";
      strip.style.transform = `scaleX(${s.toFixed(5)})`;
    };
    const onEnd = () => {
      if (x0 == null) return;
      x0 = null;
      strip.style.transition = "transform 350ms cubic-bezier(0.2, 0.9, 0.3, 1.15)";
      strip.style.transform = "scaleX(1)";
      feedbackCoalesced("boundary");
      // hold the geometry gate until the spring-back has actually landed, then
      // poke the settle so a stretch that interrupted a correction still ends
      // with a card on the line. Timer rather than transitionend: the
      // transition can be replaced mid-flight by a new stretch, and a timer
      // cannot be orphaned by that.
      window.clearTimeout(onEnd.t);
      onEnd.t = window.setTimeout(() => {
        stretchedRef.current = false;
        sc.dispatchEvent(new Event("scroll"));
      }, 370);
    };
    sc.addEventListener("touchstart", onStart, { passive: true });
    sc.addEventListener("touchmove", onMove, { passive: true });
    sc.addEventListener("touchend", onEnd, { passive: true });
    sc.addEventListener("touchcancel", onEnd, { passive: true });
    return () => {
      sc.removeEventListener("touchstart", onStart);
      sc.removeEventListener("touchmove", onMove);
      sc.removeEventListener("touchend", onEnd);
      sc.removeEventListener("touchcancel", onEnd);
    };
  }, []);

  // Open on the LAST tenure — the present — and scroll it under the line once
  // the strip has laid out. The column opens on `near = 0` at the top; a
  // horizontal run reads more naturally from the present on the right.
  //
  // HARDENED (stress pass 2026-08-15). The old version ran on BOTH values of
  // `ready`, re-yanking near/scroll when ready flipped ~1s in — stomping any
  // scroll or tap the user had already made — and its 400ms re-centre timer
  // wrote scrollLeft with no ownership checks and no cleanup. It also gave up
  // silently on a zero-width mount (hidden pane/tab), leaving the tape parked
  // at the far LEFT (oldest card) forever. Now: placed exactly once, retried
  // by ResizeObserver until the scroller has real width, and both the
  // placement and its follow-up defer to any gesture/flight the user got in
  // first.
  const placedRef = useRef(false);
  useLayoutEffect(() => {
    const last = rows[rows.length - 1];
    const sc = scrollRef.current;
    if (!last || !sc || placedRef.current) return undefined;
    let t = 0;
    const place = () => {
      if (placedRef.current) return;
      if (!sc.clientWidth) return; // not laid out yet — the observer will retry
      const el = rowRefs.current.get(last.key);
      if (!el) return;
      placedRef.current = true;
      nearRef.current = last.key;
      setNear(last.key);
      const head = el.querySelector(".tlh__head") || el;
      const x = contentX(head);
      if (x != null) sc.scrollLeft = x - sc.clientWidth * READ_LINE;
      // once more after the open-width transition settles — but the user may
      // have taken the tape by then, and a correction never outranks a hand
      t = window.setTimeout(() => {
        if (gestureRef.current || selfScroll.current || sc.dataset.flying) return;
        const el2 = rowRefs.current.get(last.key);
        const head2 = el2?.querySelector(".tlh__head") || el2;
        const x2 = head2 ? contentX(head2) : null;
        if (x2 != null) sc.scrollLeft = x2 - sc.clientWidth * READ_LINE;
      }, 400);
    };
    place();
    const ro = new ResizeObserver(place);
    ro.observe(sc);
    return () => {
      ro.disconnect();
      window.clearTimeout(t);
    };
    // placement is a one-shot; rows identity churn must not re-run it
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready]);

  const activeYearIdx = Math.max(0, years.findIndex((y) => y.label === lineYear));

  return (
    <div
      className="tlh"
      ref={rootRef}
      data-ready={ready ? "true" : undefined}
      style={cardH != null ? { "--tlh-card-h": `${cardH}px` } : undefined}
    >
      {/* THE MEASURER — one fully-open, invisible copy of every row, stacked off
          the accessibility tree and off the layout (position: absolute inside a
          height:0 box), so each row lays out at its true hugged height with
          nothing to react to. measureCardHeight() reads offsetHeight off these,
          not the live cards, because a live row is only ever open one at a time
          — the rest are collapsed to 0fr and cannot be measured in place. */}
      <div className="tlh__measure" aria-hidden="true" inert="">
        {rows.map((r) => {
          const extra = (r.detail?.outs || []).filter((o) => o !== r.detail?.summary);
          return (
            <div
              className="tlh__card"
              key={r.key}
              data-open="true"
              data-kind={r.detail?.kind || undefined}
              ref={(el) => {
                if (el) measureRefs.current.set(r.key, el);
                else measureRefs.current.delete(r.key);
              }}
            >
              <div className="tlh__card-in">
                <div className="tlh__head">
                  <span className="tlh__org">{r.org}</span>
                  {r.role ? <span className="tlh__role">{r.role}</span> : null}
                  <span className="tlh__when">
                    {r.start}
                    {r.end && r.end !== r.start ? ` — ${r.end}` : ""}
                  </span>
                </div>
                <div className="tlh__body">
                  <div className="tlh__body-in">
                    {r.detail?.summary ? <p className="tlh__sum">{r.detail.summary}</p> : null}
                    {extra.length ? (
                      <ul className="tlh__outs">
                        {extra.map((o, k) => (
                          <li key={k}>{o}</li>
                        ))}
                      </ul>
                    ) : null}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* THE YEAR WHEEL — a picker over the scroller, the active year on the
          reading line and the rest spaced evenly around it. The column slid it
          on translateY; here it is translateX. Absolutely placed over the
          scroller centre, so it does not scroll with the strip. */}
      <nav className="tlh__years" aria-label="Jump to a year">
        <div
          className="tlh__wheel"
          style={{ "--tlh-active": activeYearIdx, "--tlh-pitch": `${YEAR_PITCH}px` }}
        >
          {years.map((y, i) => (
            <button
              type="button"
              key={y.label}
              className="tlh__year"
              style={{ left: `${i * YEAR_PITCH}px` }}
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

      <div className="tlh__scroll" ref={scrollRef}>
        <div className="tlh__strip" ref={stripRef}>
          {/* THE GLASS SPINE, one tick per month laid along X, aria-hidden
              texture. Positioned absolutely and clipped to the strip's width. */}
          <div className="tlh__spine" ref={spineRef} aria-hidden>
            {Array.from({ length: TICKS }, (unused, i) => (
              <span key={i} className="tlh__tick" style={{ left: `${i * PITCH}px` }} />
            ))}
          </div>

          <ol className="tlh__list">
            {rows.map((r) => {
              // shownKey is null until the first rest commit — fall back to the
              // live selection so the initial card is open on first paint
              const open = r.key === (shownKey ?? openKey);
              const extra = (r.detail?.outs || []).filter((o) => o !== r.detail?.summary);
              return (
                <li
                  className="tlh__card"
                  key={r.key}
                  data-open={open ? "true" : undefined}
                  data-kind={r.detail?.kind || undefined}
                  ref={(el) => {
                    if (el) rowRefs.current.set(r.key, el);
                    else rowRefs.current.delete(r.key);
                  }}
                >
                  {/* the OVERLAY FACE: the li is a fixed slot that never
                      resizes; this face grows centred over the neighbours, so
                      opening a card moves no geometry the scroll depends on */}
                  <div className="tlh__card-in">
                    <button
                      type="button"
                      className="tlh__head"
                      aria-current={open ? "true" : undefined}
                      onClick={() => select(r.key)}
                    >
                      <span className="tlh__org">{r.org}</span>
                      {r.role ? <span className="tlh__role">{r.role}</span> : null}
                      <span className="tlh__when">
                        {r.start}
                        {r.end && r.end !== r.start ? ` — ${r.end}` : ""}
                      </span>
                    </button>

                    {/* The 0fr→1fr reveal, on COLUMNS: the card grows in width
                        the way the column's grew in height. */}
                    <div className="tlh__body" aria-hidden={!open} inert={!open ? "" : undefined}>
                      <div className="tlh__body-in">
                        {r.detail?.summary ? <p className="tlh__sum">{r.detail.summary}</p> : null}
                        {extra.length ? (
                          <ul className="tlh__outs">
                            {extra.map((o, k) => (
                              <li key={k}>{o}</li>
                            ))}
                          </ul>
                        ) : null}
                      </div>
                    </div>
                  </div>
                </li>
              );
            })}
          </ol>
        </div>
      </div>
    </div>
  );
}
