// /hello3 — a fork of /hello (see hello3.css for how the two diverge).
// Every component under src/hello3/ is a copy: changes here cannot reach /hello.
//
// The whole page hangs off one idea: the face is the anchor and never moves.
// It thinks, it notices you, it waves, and the page arrives around it. There is
// no intro overlay that lifts away, because a lifting overlay is a scene change
// and this should read as one continuous shot.

import { windowSceneOn } from "../lib/sceneFlag";
import { Suspense, lazy, useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import MorphFace from "../MorphFace";
// the line drawing turns into the 3D clay head after the reveal (2026-10-11), and the
// room's page capture waits for it (heroMorphGate.js)
import HeroMorph from "./HeroMorph";
import { heroMorphSettledOrTimeout } from "./heroMorphGate";
import { FLOOD_RGB } from "../figures/faces/morph/flood";
import { warmIsReady } from "../scene/window/warmFlag";
import { Check, Copy, Lock, Mail, Phone } from "iconoir-react";
import { useReducedMotion } from "../figures/ds/hooks";
import { fetchSky, sunUniforms } from "../lib/weather";
import { markIntroDone, useIntroStage } from "./useStage";
import { useFlight } from "./useFlight";
import { getLenis } from "../ui/smoothScroll";
import { ALSO, BRAND_SHINE, CREDENTIALS, GREETING, ROLES } from "./helloData";
import RoleTooltip from "./RoleTooltip";
import GreetingMark from "./GreetingMark";
import { HelloFlipControl, HelloFlipLayer, HelloFlipSr, useHelloFlipStore } from "./HelloFlip";
import HelloLink from "./HelloLink";
import { LINKS } from "../hello/helloData";
import HeroChips from "./HeroChips"; // eslint-disable-line no-unused-vars -- hero row parked (mtr6evtb), see the comment in the hero
import PhoneMarquee from "./PhoneMarquee"; // eslint-disable-line no-unused-vars -- replaced by WorkGrid (pin mtqremeh), kept for the swap back
import WorkGrid from "./WorkGrid";
import LockedLink from "./LockedLink";
import { LOCKED, newestFirst } from "./workMeta";
import SiteCursor from "./SiteCursor";
import { Guard, lazyRetry } from "../ui/Guard"; // blank-page guards: a failing piece hides itself, never the page
// The REBUILT timeline, shared with /hello rather than forked (2026-08-07).
// hello3 had its own copy of the old axis AND its own TIMELINE/GAP data, whose
// gap label still read "Masters, research, and the move into VR" — a claim the
// 2026-08-06 interview retired. Pointing at the one component means it reads the
// one attested record, and a fix here can no longer land on only one page.
import Timeline from "../hello/Timeline";
import FootIllus from "../hello/FootIllus";
// The weather went from the top-right status bar back to the cursor tooltip
// over the bare sky (07 Sep 2026, "go back to the weather on hover, remove
// from nav"). Shared with /hello, not forked. StatusBar.jsx stays on disk,
// unmounted.
import AlongPath from "./AlongPath";
import DjBooth from "./DjBooth";
// WebGL, so it is lazy and never blocks first paint. The CSS band underneath is
// the fallback when WebGL is unavailable or the chunk has not landed yet.
const ShaderCanvas = lazyRetry(() => import("../ShaderCanvas"));
import { LIVING_SKY_DEFAULTS } from "../shaders/washes";
import HelloNote from "../hello/HelloNote"; // the footnote on the sign-off (mv4fzaqd-ys0o8w)
import BubbleShape from "./BubbleShape"; // each footer bubble as one continuous SVG shape (mv4zdmlv-88gvx4)
import "../hello/hello.css";
// NOT importing ../figures/ds/tokens.css here (mttji8hf): it carries an
// @import of the Anek Gujarati variable font for the DS figures, which the
// landing has no use for. The top pill is written against the DS tokens with
// each token's literal as its fallback, so it renders the system's values
// (popup #1f1f22, popup text #f3f3f3, focus ring, state duration) unchanged.
import "./hello3.css";
import "./scrollAssemble.css"; // scroll-driven assemble of the sections below the hero
import "./scrollAssemble"; // fallback driver (no-op where view() timelines exist)
// The window scene (three r186), behind ?scene=window until approved: see
// src/scene/window/WindowSceneFolio.jsx and tools/window-light/spec/30-locked-brief.md.
const WindowSceneFolio = lazyRetry(() => import("../scene/window/WindowSceneFolio"));

// the hand-over's page fade (windowScene.css, html.wscene-handover): 360 ms plus a frame
const HANDOVER_FADE_MS = 380;

// An empty copy of the timeline section's shell (heading + horizontal axis),
// left blank as a template to fill later. Rendered N times below the timeline.
// SectionTemplate is gone (annotations msb8uvq4 + msb8v8k7): its empty axis was
// removed and its one heading, "A firm and cheery hello", moved into the footer
// where it now reads as the page's sign-off.

// Footer contact lines (annotation msbbqx15). Both are real links, not text: the
// recruiter's exit action has to be one tap on the phone, which is the screening
// surface (portfolio-direction-2026.md, section 1).
//
// Both supplied by Agam (msbbqx15, msbcgo7e). PHONE is the display form; the href
// is the same number stripped to digits and a leading +, which is what `tel:`
// wants — keep them in step if the number ever changes.
const EMAIL = "agamagar117@gmail.com";
const PHONE = "+91 8392867575";
const PHONE_HREF = "+918392867575";

// mttjl6kj (09 Sep 2026): a copy button beside each bubble, shown on hover:
// a black circle with the white copy glyph, which writes the value to the
// clipboard and says so for two seconds. It sits outside the <a>, because a
// button inside a link is invalid and would fight the mailto/tel.
function CopyButton({ value, label, side }) {
  const [done, setDone] = useState(false);
  const ref = useRef(null);
  const copy = async () => {
    try { await navigator.clipboard.writeText(value); setDone(true); setTimeout(() => setDone(false), 2000); } catch { /* clipboard blocked: the link still works */ }
  };
  // mttkkkeq: on success the tooltip itself says Copied. The delegated bubble
  // only reads a label on pointerover, so once the attribute has flipped the
  // button asks it to re-read (tip:show), and closes it when the state resets.
  useEffect(() => {
    if (!ref.current) return;
    ref.current.dispatchEvent(new CustomEvent(done ? "tip:show" : "tip:hide", { bubbles: true }));
  }, [done]);
  return (
    <button ref={ref} type="button" className={`hello-foot__copy hello-foot__copy--${side}`} aria-label={done ? "Copied" : label} data-tip={done ? "Copied" : label} data-done={done ? "true" : undefined} onClick={copy}>
      {/* mttx8kuj: the copy glyph turns into a check on success; both are
          always in the DOM and CSS swaps them (copy shrinks out, check springs in) */}
      <span className="hello-foot__copy-glyphs" aria-hidden>
        <Copy className="hello-foot__copy-ic" width={14} height={14} strokeWidth={2} />
        <Check className="hello-foot__copy-ok" width={15} height={15} strokeWidth={2.4} />
      </span>
    </button>
  );
}

// eslint-disable-next-line no-unused-vars -- rows replaced by the chat bubbles (mtr6hqln), kept for the swap back
function ContactLines() {
  return (
    <ul className="hello-foot__contact">
      <li>
        <a href={`mailto:${EMAIL}`}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
            <rect
              x="2.5"
              y="4.5"
              width="19"
              height="15"
              rx="2.5"
              stroke="currentColor"
              strokeWidth="2"
            />
            <path
              d="M3 7l8.15 5.6a1.5 1.5 0 0 0 1.7 0L21 7"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
          {EMAIL}
        </a>
      </li>
      {PHONE && (
        <li>
          <a href={`tel:${PHONE_HREF}`}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
              <path
                d="M6.5 3.5h3l1.5 4-2 1.4a12 12 0 0 0 6.1 6.1l1.4-2 4 1.5v3a2 2 0 0 1-2.2 2A17.5 17.5 0 0 1 4.5 5.7 2 2 0 0 1 6.5 3.5z"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinejoin="round"
              />
            </svg>
            {PHONE}
          </a>
        </li>
      )}
    </ul>
  );
}

// No `detail` prop: /hello3 is always the card arrangement, so the branches
// /hello0 needed are resolved here rather than carried as a flag.
// mtqs5nvx: the five rows follow the five project cards below, in the same
// order: year and organisation from the projects list, the line is each case's
// own title (helloData / App.jsx). CaratLane has no case page, so its line is
// the role's headline and it links to the list.
const TIMELINE_ROWS = [
  { year: "2025", org: "Zepto", line: "Scheduling on a 10-minute platform", href: "/work/scheduled-delivery" },
  { year: "2026", org: "Away", line: "An agent that never takes the wheel", href: "/work/away-agent" },
  { year: "2026", org: "Zepto", line: "The half of cross-sell nobody solved", href: "/work/cross-sell" },
  { year: "2023", org: "CaratLane", line: "E-commerce for a jewelry brand" /* mtqs7lcx: shorter */, href: "/list" },
  { year: "2019", org: "Toppr", line: "Joyful learning experiences for students", href: "/work/toppr" },
];
// mv58rul2: the whole list newest first (the order App.jsx's project list uses),
// by year, then the project's date (workMeta.js); the cards below follow it
const TIMELINE = newestFirst(TIMELINE_ROWS);

// see the sky note in the markup: a phone gets a wider canvas, sampled lower
const SKY_NARROW = typeof window !== "undefined" && window.matchMedia("(max-width: 720px)").matches;

export default function Hello3({ onNavigate, theme, onToggleTheme, sound, onToggleSound }) {
  const rootRef = useRef(null);
  const flyerRef = useRef(null);
  // THE WINDOW SCENE (2026-09-27): with ?scene=window the Living Sky band gives way
  // to the three.js scene of the desk window. The hero plus one viewport of spacer
  // becomes its runway (the camera flies into the monitor and hands off to the work
  // grid on the page ground), and a bookend runway before the footer pulls it back
  // out into the room. Off by default: without the flag nothing here changes.
  // the default since 2026-09-30; ?scene=off shows the classic hero (lib/sceneFlag.js)
  // OPEN ON THE PORTFOLIO, THEN THE ROOM (2026-10-05, Agam: "always open the main
  // portfolio screen, not the three.js version, then show a loader at the bottom and
  // transition to the scene only when ready, optimised for scrolling"). Where the scene
  // is allowed (desktop; phones get the classic page, lib/sceneFlag.js), the page
  // opens as the plain portfolio and the engine warms on a tiny hidden canvas once
  // the page is idle and not being scrolled (scene/window/sceneWarm.js). When it is
  // ready AND the reader is at the top, not mid-scroll, the page fades and the scene
  // takes over with that same warmed engine. ?scene=window and capture runs still go
  // straight into the scene, as before (the QA tools rely on it).
  // THE ROOM IS OPT-IN (2026-10-11, Agam: "setting up the room should not be
  // automatic", then "room should be set up on every run, ready to be gone to"): the
  // room still warms on every load, in the background, once the page has loaded, the
  // hero's morph has settled and the browser is idle; but it is never entered on its
  // own (no countdown, no auto hand-over). A glass button at the top reads "Setting up
  // the room" while it warms and "Enter the room" once it is ready; a click enters
  // straight away, or, before it is ready, shows the setting-up state with a Cancel and
  // enters as soon as it is. Hover or focus also starts the warm-up if it has not yet.
  const sceneAllowed = useMemo(() => typeof window !== "undefined" && windowSceneOn(), []);
  const sceneDirect = useMemo(() => {
    if (typeof window === "undefined") return false;
    const q = new URLSearchParams(window.location.search);
    return q.get("scene") === "window" || q.has("capture");
  }, []);
  const [sceneLive, setSceneLive] = useState(sceneDirect);
  const sceneWindow = sceneAllowed && sceneLive;
  // the warm-up: idle | loading | ready | failed; drives the button
  // a visitor coming back to this page in the same visit finds the room still warmed in
  // memory (sceneWarm.js keeps it), so it starts ready: no loader (warmFlag.js)
  const [warmState, setWarmState] = useState(() => (sceneAllowed && !sceneDirect && warmIsReady() ? "ready" : "idle"));
  // asked for: by hovering or focusing the button (warm only) or clicking it (warm, then enter)
  const [warmWanted, setWarmWanted] = useState(false);
  const [enterWanted, setEnterWanted] = useState(false);
  // the room button morphs between two widths (glass loader -> white "Enter the room"),
  // and CSS cannot animate to `auto`: measure both labels and publish their widths
  const roomBtnRef = useRef(null);
  // A WARM ROOM THE GPU TOOK BACK (see sceneWarm.js watchLoss) or an entry that hangs: warm a
  // fresh one (warmEpoch re-runs the warm-up effect); after a second failure, say so with a
  // Retry (`stalled`) rather than leaving the loader up for ever
  const [warmEpoch, setWarmEpoch] = useState(0);
  const [stalled, setStalled] = useState(false);
  const entryAttempts = useRef(0);
  const rewarm = useCallback(async () => {
    try {
      (await import("../scene/window/sceneWarm.js")).dropWarmScene();
    } catch {
      /* nothing warm to drop */
    }
    setWarmState("idle");
    setWarmEpoch((e) => e + 1);
  }, []);
  useEffect(() => {
    const onLost = () => {
      setWarmState("idle");
      setWarmEpoch((e) => e + 1);
    };
    window.addEventListener("wscene-warm-lost", onLost);
    return () => window.removeEventListener("wscene-warm-lost", onLost);
  }, []);
  // the background warm-up on every load: after the load event, the hero's morph
  // (heroMorphGate.js, which also has its own time limit) and an idle moment, so it
  // never competes with the first paint, the morph or the reveal
  useEffect(() => {
    if (!sceneAllowed || sceneLive) return undefined;
    let alive = true, idleId = 0, timer = 0;
    // a few seconds of grace after the morph, so the first moments of the page (and a
    // first look or screenshot of it) are not competing with the engine's build; a click
    // or hover on the button starts it sooner
    const WARM_GRACE_MS = 4000;
    const start = () => {
      if (!alive) return;
      timer = setTimeout(() => {
        if (!alive) return;
        if (window.requestIdleCallback) idleId = window.requestIdleCallback(() => alive && setWarmWanted(true), { timeout: 3000 });
        else setWarmWanted(true);
      }, WARM_GRACE_MS);
    };
    const afterLoad = () => heroMorphSettledOrTimeout().then(start);
    if (document.readyState === "complete") afterLoad();
    else window.addEventListener("load", afterLoad, { once: true });
    return () => {
      alive = false;
      clearTimeout(timer);
      if (idleId && window.cancelIdleCallback) window.cancelIdleCallback(idleId);
      window.removeEventListener("load", afterLoad);
    };
  }, [sceneAllowed, sceneLive]);
  useEffect(() => {
    if (!sceneAllowed || sceneLive || !warmWanted) return undefined;
    // already warmed and prepared in this tab (a return visit to this page): nothing to do
    if (warmIsReady()) {
      setWarmState("ready");
      return undefined;
    }
    let alive = true;
    setWarmState("loading");
    Promise.all([import("../scene/window/sceneWarm.js"), import("../scene/window/capture.js"), import("../scene/window/WindowSceneFolio")])
      .then(async ([{ warmScene, prepareWarmScene }, { parseCaptureParams }]) => {
        if (!alive) return false;
        const opts = parseCaptureParams(window.location.search);
        const ok = await warmScene({ opts, theme: document.documentElement.classList.contains("dark") ? "dark" : "light" });
        // the room is only "ready" once the monitor carries the live page too, so the
        // hand-over has nothing left to wait for (sceneWarm.js prepareWarmScene); a
        // failed capture still hands over (the page captures it the old way)
        // the capture waits for the hero's morph, so the monitor shows the clay head too
        if (ok && alive) await heroMorphSettledOrTimeout();
        if (ok && alive) await prepareWarmScene().catch(() => false);
        return ok;
      })
      .then((ok) => alive && setWarmState(ok ? "ready" : "failed"))
      .catch(() => alive && setWarmState("failed"));
    return () => {
      alive = false;
    };
  }, [sceneAllowed, sceneLive, warmWanted, warmEpoch]);
  const [entering, setEntering] = useState(false);
  // THE JOURNEY (annotation, Agam: "after clicking View ... use the load to transition into
  // the scroll button that lives in the three.js view"): ONE fixed pill is kept alive from
  // the click to the room. idle -> (click) loader in a small pill, text slid out -> (the
  // hand-over runs) -> landing: it flies to the room's "scroll" floater's spot and turns
  // into it -> handoff: the real floater (.wscene-nudge) fades in under it and it fades
  // out -> done. The page layers swap under it, so it never blinks (windowScene.css
  // exempts it from the page-hiding rules)
  const [journey, setJourney] = useState("idle");
  const going = journey === "idle" && (entering || (enterWanted && warmState === "ready"));
  const uiReady = warmState === "ready" || stalled; // a stalled room shows the ready look, with "Retry"
  const roomBtnShown = sceneAllowed && warmState !== "failed" && journey !== "done" && (!sceneLive || entering);
  useLayoutEffect(() => {
    const b = roomBtnRef.current;
    if (!b) return undefined;
    const [busy, ready, scroll] = b.querySelectorAll(".wscene-warm-pill__label");
    const btn = b.querySelector(".wscene-warm-pill__btn-label");
    const dots = b.querySelector(".wscene-warm-pill__btn-dots");
    const measure = () => {
      b.style.setProperty("--lw-busy", `${busy.offsetWidth}px`);
      b.style.setProperty("--lw-ready", `${ready.offsetWidth}px`);
      b.style.setProperty("--lw-scroll", `${scroll.offsetWidth}px`);
      b.style.setProperty("--lw-btn", `${btn.offsetWidth}px`);
      b.style.setProperty("--lw-dots", `${dots.offsetWidth}px`);
    };
    measure();
    document.fonts?.ready.then(measure); // the labels' fonts may land after the first measure
    const ro = new ResizeObserver(measure);
    ro.observe(busy);
    ro.observe(ready);
    ro.observe(btn);
    ro.observe(scroll);
    ro.observe(dots);
    return () => ro.disconnect();
  }, [roomBtnShown]);
  // the pill's landing: fly to where the room's "scroll" floater sits (a translate, FLIP-like:
  // the pill is fixed, so only the distance is measured), then hand over to the real floater
  useLayoutEffect(() => {
    const b = roomBtnRef.current;
    const still = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    if (journey === "landing") {
      if (!b || still) {
        setJourney("handoff"); // reduced motion: no flight, a crossfade
        return undefined;
      }
      const nudge = document.querySelector(".wscene-nudge");
      const here = b.getBoundingClientRect();
      const target = nudge ? nudge.getBoundingClientRect().top : window.innerHeight - 20 - here.height;
      b.style.setProperty("--fly-y", `${Math.round(target - here.top)}px`);
      const t = setTimeout(() => setJourney("handoff"), 680);
      return () => clearTimeout(t);
    }
    if (journey === "handoff") {
      document.documentElement.classList.remove("wscene-pill-flying"); // the real floater fades in under the pill
      const t = setTimeout(() => setJourney("done"), still ? 220 : 260);
      return () => clearTimeout(t);
    }
    return undefined;
  }, [journey]);
  useEffect(() => () => document.documentElement.classList.remove("wscene-pill-flying"), []);
  // THE HAND-OVER IS A SCROLL (2026-10-05, Agam: "the transition should be a scroll
  // once the room is ready"). In the room's layout the plain portfolio is exactly what
  // the screen shows at the END of the runway (p = 1, the camera inside the monitor).
  // So the layout switches with the page already scrolled to that end (nothing on
  // screen changes) and the page scrolls itself back up: the camera pulls out of the
  // screen into the room.
  //
  // Round 3 ("the scroll transition is still breaking"), every step guarded:
  //  - it starts only at a quiet moment at the top (no scroll, wheel, touch or key for
  //    0.7 s), never mid-gesture;
  //  - Lenis is STOPPED for the whole hand-over: stray wheel input and a trackpad's
  //    momentum are swallowed, and the speed ramp (scrollRamp.js) cannot arm. Before,
  //    a wheel within 1.2 s let the ramp take the move over, and its cancel reset Lenis
  //    mid-animation: the pull-out stopped halfway down the runway, or went back;
  //  - Lenis re-measures before the jump (it clamps jumps to a page height cached
  //    before the runway was inserted);
  //  - the room takes the screen WITHOUT moving first (2 px off the page's top: the
  //    canvas shows the page's own pixels) and the pull-out waits for a run of steady
  //    frames, so the first full-size frames' cost (an 83 ms hitch measured at the very
  //    start of the motion) lands while nothing moves;
  //  - the pull-out is locked, with a safety net, and every exit restarts Lenis.
  // Reduced motion: a cut to the room.
  const enteringRef = useRef(false);
  const enterPending = useRef(false);
  const enterScene = useCallback(async () => {
    if (enteringRef.current || enterPending.current) return;
    enterPending.current = true;
    try {
      const { quietMoment } = await import("../scene/window/sceneWarm.js");
      await quietMoment();
    } finally {
      enterPending.current = false;
    }
    // scrolled away while it waited: it waits until they are back at the top
    if (enteringRef.current || window.scrollY >= 8) return;
    // the warm room must still be alive: a lost GPU device would hand over into a blank screen
    try {
      if (!(await import("../scene/window/sceneWarm.js")).warmAlive()) return rewarm();
    } catch {
      /* the page builds its own the old way */
    }
    entryAttempts.current = 0;
    enteringRef.current = true;
    setEntering(true);
    const reduceNow = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    document.documentElement.classList.add("wscene-sky-out", "wscene-handover", "wscene-pill-flying"); // the room's own floater waits for the pill to land (windowScene.css)
    getLenis()?.stop(); // from here to the room, wheel input is swallowed
    setTimeout(() => setSceneLive(true), reduceNow ? 0 : 460);
  }, [rewarm]);
  useLayoutEffect(() => {
    if (!sceneLive || !enteringRef.current) return undefined;
    const root = document.documentElement;
    const run = sceneRun1.current;
    if (!run) return undefined;
    // the runway's bottom is where the page starts: be there before this frame paints
    const lenis = getLenis();
    lenis?.resize?.();
    const y = run.getBoundingClientRect().bottom + window.scrollY;
    if (lenis) lenis.scrollTo(y, { immediate: true, force: true });
    else window.scrollTo(0, y);
    root.classList.remove("wscene-sky-out");
    let alive = true, finished = false;
    const reduceNow = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    const finish = () => {
      if (finished) return;
      finished = true;
      enteringRef.current = false; // a later re-run (a hot reload) must not replay it
      root.classList.remove("wscene-handover");
      getLenis()?.start();
      setJourney((j) => (j === "idle" ? "landing" : j)); // the pill flies to the floater's spot
    };
    const nextFrame = () => new Promise((r) => requestAnimationFrame(() => r()));
    // a run of steady frames (or the time limit): the moment the motion may start
    const steady = async (maxMs) => {
      const t0 = performance.now();
      let last = t0, good = 0;
      while (alive && performance.now() - t0 < maxMs) {
        await nextFrame();
        const t = performance.now();
        good = t - last < 40 ? good + 1 : 0;
        last = t;
        if (good >= 6) return;
      }
    };
    (async () => {
      // 1. the room is adopted, its monitor carries the live page, and its canvas has
      //    drawn a frame in its new place (data-wscene-drawn, useWindowScene): revealed
      //    before that, it was blank for a few frames after the page had gone (rec21)
      const t0 = performance.now();
      while (alive && !(root.dataset.wsceneReady && root.dataset.wscenePoster && root.dataset.wsceneDrawn) && performance.now() - t0 < 6000) await nextFrame();
      if (!alive) return;
      const L = getLenis();
      if (reduceNow || !L) {
        window.scrollTo(0, 0);
        finish();
        return;
      }
      // 2. the room takes the screen without moving: the page's own pixels, now drawn
      //    by the canvas; its first full-size frames are paid for here
      L.scrollTo(y - 2, { immediate: true, force: true });
      // the live page fades out over the canvas's copy of it (windowScene.css, the
      // hand-over transition): the motion waits for the fade as well as the steady frames
      const tFade = performance.now();
      await steady(1500);
      const fadeLeft = HANDOVER_FADE_MS - (performance.now() - tFade);
      if (alive && fadeLeft > 0) await new Promise((r) => setTimeout(r, fadeLeft));
      if (!alive) return;
      // 3. the pull-out, locked against stray input, with a safety net
      const ease = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
      const DUR = 1.9;
      L.scrollTo(0, { duration: DUR, easing: ease, force: true, lock: true, onComplete: finish });
      setTimeout(finish, DUR * 1000 + 1500);
    })();
    return () => {
      alive = false;
      if (!finished) finish(); // never leave Lenis stopped or the header pinned
    };
  }, [sceneLive]);
  // the click asked for the room: hand over once it is ready, from the top of the page
  // (a click further down scrolls up first; the hand-over starts from the page's top).
  // At the top, the monitor's copy of the page is RETAKEN from the page as it is now
  // (refreshWarmPoster: the warm-up's copy can be stale), then the hand-over starts
  useEffect(() => {
    if (!enterWanted || warmState !== "ready" || entering || sceneLive) return undefined;
    let alive = true, t = 0;
    if (window.scrollY >= 8) {
      const still = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
      const L = getLenis();
      if (L) L.scrollTo(0, still ? { immediate: true } : { duration: 0.9 });
      else window.scrollTo({ top: 0, behavior: still ? "auto" : "smooth" });
    }
    const go = async () => {
      if (!alive) return;
      if (window.scrollY >= 8) {
        t = setTimeout(go, 150);
        return;
      }
      try {
        const { refreshWarmPoster, warmAlive } = await import("../scene/window/sceneWarm.js");
        if (!warmAlive()) return rewarm(); // taken back by the GPU while it idled: warm a new one, the click stays queued
        await refreshWarmPoster();
      } catch {
        /* the warm-up's own copy stands */
      }
      if (!alive) return;
      if (window.scrollY >= 8) return go();
      enterScene();
    };
    go();
    return () => {
      alive = false;
      clearTimeout(t);
    };
  }, [enterWanted, warmState, entering, sceneLive, enterScene, rewarm]);
  // the watchdog: a click on a room that is "ready" but has not begun entering within 10 s,
  // or on one still loading after 45 s, is retried once with a fresh warm-up, then given
  // up with a Retry button (never the loader for ever)
  useEffect(() => {
    if (!enterWanted || entering || sceneLive || (warmState !== "ready" && warmState !== "loading")) return undefined;
    const t = setTimeout(() => {
      if (entryAttempts.current < 1) {
        entryAttempts.current += 1;
        rewarm();
      } else {
        entryAttempts.current = 0;
        setEnterWanted(false);
        setStalled(true);
      }
    }, warmState === "ready" ? 10000 : 45000);
    return () => clearTimeout(t);
  }, [enterWanted, entering, sceneLive, warmState, rewarm]);
  // a page that leaves before the hand-over KEEPS its warm engine (a module singleton in
  // sceneWarm.js): coming back finds it ready, with no loader and no rebuild
  // (annotation mv3v3k00-o9in87)
  const sceneRun1 = useRef(null);
  const sceneRun2 = useRef(null);
  const heroRef = useRef(null);
  const reduce = useReducedMotion();
  const helloFlip = useHelloFlipStore(); // the stretchy "Hello" (HelloFlip.jsx)
  const { stage, skip } = useIntroStage(rootRef, { off: sceneWindow });
  // BACK TO THE ROOM (Agam: "give me a floater for scrolling up once I've already visited the
  // three.js view and am on the main landing page"): in the room's layout the plain page is
  // what the camera has landed on (html[data-wscene-landed], useWindowScene), with the room
  // above it as the runway. Once there, a glass floater at the top (where the room pill was)
  // scrolls back up the runway: the same pull-out as the hand-over, in reverse, no loader (the
  // room is live). It shows only while landed and the hero has revealed; the Inspect overlay
  // hides it by CSS (html:has([data-inspect-ui]))
  const [landed, setLanded] = useState(false);
  useEffect(() => {
    if (!sceneWindow) {
      setLanded(false);
      return undefined;
    }
    const root = document.documentElement;
    const read = () => setLanded(root.dataset.wsceneLanded === "true");
    read();
    const mo = new MutationObserver(read);
    mo.observe(root, { attributes: true, attributeFilter: ["data-wscene-landed"] });
    return () => mo.disconnect();
  }, [sceneWindow]);
  const backShown = sceneWindow && landed && stage === "reveal" && !entering;
  const backToRoom = useCallback(() => {
    const still = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    const L = getLenis();
    if (still) {
      if (L) L.scrollTo(0, { immediate: true, force: true });
      else window.scrollTo(0, 0);
      return;
    }
    const ease = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
    if (L) L.scrollTo(0, { duration: 2.2, easing: ease, force: true });
    else window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);
  // THE PAGE REVEALS ON THE MORPH'S CLOCK (Agam, 11 Oct: "delay the reveal of all the elements so that
  // when the wave animation is finished, the face morph to 3D is in sync with the elements appearing
  // one after the other"). The face waves alone; the moment the wave ends the morph starts and
  // HeroMorph reports its timeline t (0..1, speed ramp included) as "heromorph:t". Each element gets
  // data-in when t passes its mark, so a slower morph slows the page with it and the last card lands
  // as the clay settles. data-seq on the root is the gate (hello3.css); it lifts when all are in.
  // No morph (phones, no WebGL, reduced motion, a repeat visit) falls back to a plain clock.
  const armRef = useRef(null);
  const [seq, setSeq] = useState(() => stage === "center");
  // the glow-in (the face's flood, driven from the effect below): a flag, or ?glow=0 for the plain rise
  const GLOW_IN = typeof window === "undefined" || new URLSearchParams(window.location.search).get("glow") !== "0";
  // and the skeleton outlines the glow resolves out of: a flag, or ?skel=0
  const SKELETON = typeof window === "undefined" || new URLSearchParams(window.location.search).get("skel") !== "0";
  useEffect(() => {
    if (!seq) return undefined;
    const root = rootRef.current;
    const q = (sel) => [...root.querySelectorAll(sel)];
    const marks = [];
    // [mark, element, glow width in t]: at the mark the element's content starts to resolve out of its light
    const add = (els, from, step, w = 0) => els.forEach((el, i) => marks.push([from + i * step, el, w]));
    add(q(".hello-hero__mark-art"), 0.0001, 0, 0.3);
    add(q(".hello-hero__link"), 0.0001, 0, 0.25);
    add(q(".hello-hero__table .work__item"), 0.0001, 0, 0.25);
    const cards = q(".wg__card");
    // the last card's light has to finish by t = 1 (its window ends at m + 0.7 D, D = w + 0.08)
    add(cards, 0.0001, 0, 0.18);
    add(q(".ap, .tlx, .hello-foot"), 0.9, 0);
    const glow = root.hasAttribute("data-glow");
    const still = reduce; // reduced motion: static blocks, no sweep, no bloom; each block cross-fades to its content
    // ONE LIGHT PER ELEMENT (shimmer-glow, 11 Oct; Agam: "can we make the glow and shimmer work together").
    // One SVG overlay holds a square skeleton block at each element's final box (measured from the real
    // hidden layout, so no shift). Each block has its OWN gradient: a highlight band (centre cx, half
    // width hw, colour) over a base colour. While the face waves, every band follows one diagonal sweep
    // across the page on a wall clock (never reset, so it never jumps). On the morph's t, an element's
    // window p (0..1) runs: the band leaves the sweep and settles on the block's centre, widens past its
    // edges and warms to the face's pale flood (p 0-0.4), so the grey block BECOMES the bloom; the content
    // starts at the peak (p 0.3, = its mark) and resolves out of it (opacity up by 0.6, brightness, blur
    // and desaturation down by 1); the bloom fades under it (p 0.45-0.95). The skeleton and the content
    // are never both at strength: the hand-off happens inside the bright peak. Removed at the end.
    let svg = null, front = null, frontStops = null, frontRect = null, hazes = [], unprint = null, skg = null, catchG = null, nShape = 0;
    // the print's edge (see content()): content alpha along six stops from e1 (opaque) to e0 (transparent)
    const ssP = (k) => k * k * (3 - 2 * k);
    const PRINT = [0, 0.2, 0.4, 0.6, 0.8, 1].map((k) => [k, 1 - ssP(k)]);
    const lines = [];
    const dark = document.documentElement.classList.contains("dark");
    // rgba as arrays so the shimmer colours can run continuously into the bloom
    // the waiting skeleton whispers (Agam: "make the shimmer lighter, they are taking a lot of attention"):
    // half the block contrast, a dimmer, wider, slower band; the face and the glow draw the eye
    // DARK IS ITS OWN GRADE (Agam: "the glow transition works smoothly in light mode, but dark mode is not so
    // clean"). Against near-black a pale tone reads as a grey slab, so the dark skeleton is fainter still
    const BASE = dark ? [255, 255, 255, 0.022] : [0, 0, 0, 0.032];
    const LIT = dark ? [255, 255, 255, 0.05] : [255, 255, 255, 0.5];
    const mix = (c0, c1, k) => c0.map((v, i) => v + (c1[i] - v) * k);
    const rgba = (c) => `rgba(${c[0] | 0},${c[1] | 0},${c[2] | 0},${c[3].toFixed(3)})`;
    const ss = (e0, e1, x) => { const u = Math.min(1, Math.max(0, (x - e0) / (e1 - e0))); return u * u * (3 - 2 * u); };
    const TAN = Math.tan((20 * Math.PI) / 180);
    // THE LIGHT IS THE CLAY'S (refine, 11 Oct; Agam: "the glow reveal can be more refined", "the glow reveal
    // and the glow of the 3D morph face should be synced"). The face glows in its flat skin (#f2dcc6, flood.js)
    // before the shading lands; the wave is that same light leaving the face, never pure white: its core is the
    // skin lifted about halfway to white, its trailing falloff the skin itself, so it cools nowhere and warms as it
    // lingers. The band's profile, in px from the core (d > 0 ahead of it, d < 0 behind):
    //   core     a gaussian (sigma 28 px), low: it gives the band its centre without ever drawing a line
    //   lead     a wide gaussian (sigma 59 px): the soft edge that arrives first, gone by ~155 px ahead
    //   trail    a smoothstep falloff over 2.8 S (392 px): the light lingers on what it has printed
    // ("make the glow reveal more seamless and merge more": no visible ring boundary, light that overlaps
    // the content resolving under it)
    // All three have zero slope at the core and at their ends, and the ring is drawn with ~20 stops sampled
    // from it, so the piecewise-linear gradient has no knees: the old four-stop ring's slope breaks were what
    // read as bands (Mach bands). Skia dithers SVG gradients (measured: alternating 8-bit values row to row),
    // which takes care of the quantisation on a pale ramp over a pale page.
    const S = 140; // px: the band's unit (the old soft edge)
    const WHITE = [255, 255, 255];
    // dark: the light is ADDED (the overlay screens onto the page, below), so it is lower and a touch cooler
    // (the skin 60% to white, a warm ivory rather than a beige that muddies over black)
    const CORE_RGB = mix(FLOOD_RGB, WHITE, dark ? 0.6 : 0.5), TAIL_RGB = dark ? mix(FLOOD_RGB, WHITE, 0.3) : FLOOD_RGB;
    const CORE_A = dark ? 0.012 : 0.26, SIDE_A = dark ? 0.032 : 0.34;
    const gauss = (d, sg) => Math.exp(-((d / sg) ** 2));
    // dark: a softer falloff all round (a wider core and lead, a longer trail), so no edge reads on black
    const LEAD = (dark ? 1.45 : 1.1) * S, TRAIL = (dark ? 3.4 : 2.8) * S;
    const side = (d) => (d >= 0 ? gauss(d, (dark ? 0.55 : 0.42) * S) : 1 - ss(0, TRAIL, -d));
    const band = (d) => CORE_A * gauss(d, (dark ? 0.3 : 0.2) * S) + SIDE_A * side(d); // alpha, peak CORE_A + SIDE_A
    const bandRGB = (d) => (d >= 0 ? CORE_RGB : mix(CORE_RGB, TAIL_RGB, ss(0, 0.8 * S, -d)));
    // denser at the core, where the profile turns
    const BAND_D = [-2.8, -2.35, -1.95, -1.6, -1.3, -1.03, -0.8, -0.6, -0.43, -0.29, -0.17, -0.07, 0, 0.08, 0.18, 0.3, 0.45, 0.62, 0.84, 1.1].map((k) => (k < 0 ? (k / 2.8) * TRAIL : (k / 1.1) * LEAD));
    if (glow && SKELETON) {
      const NS = "http://www.w3.org/2000/svg";
      svg = document.createElementNS(NS, "svg");
      svg.setAttribute("aria-hidden", "true");
      svg.style.cssText = "position:absolute;left:0;top:0;width:1px;height:1px;overflow:visible;pointer-events:none;z-index:0";
      // dark: the overlay SCREENS onto the page: light only adds, so a pale tone can never lay a grey film over black
      if (dark) svg.style.mixBlendMode = "screen";
      const defs = document.createElementNS(NS, "defs");
      svg.appendChild(defs);
      // THE SKELETONS UNPRINT WHERE THE CONTENT PRINTS: every block sits in one group under one mask, the
      // exact complement of the content's print mask (same centre, same smoothstep, same px), so along the
      // band each block becomes its content pixel for pixel, with no gap and no double exposure between them
      const VW = Math.max(document.documentElement.clientWidth, 600);
      unprint = document.createElementNS(NS, "radialGradient");
      unprint.setAttribute("id", "hello-unprint"); unprint.setAttribute("gradientUnits", "userSpaceOnUse"); unprint.setAttribute("r", "2");
      unprint.innerHTML = PRINT.map(() => `<stop offset="0" stop-color="#fff"/>`).join("");
      defs.appendChild(unprint);
      const um = document.createElementNS(NS, "mask");
      um.setAttribute("id", "hello-unprint-m"); um.setAttribute("maskUnits", "userSpaceOnUse"); um.style.maskType = "alpha";
      um.setAttribute("x", "0"); um.setAttribute("y", "0"); um.setAttribute("width", String(VW)); um.setAttribute("height", "2600");
      um.innerHTML = `<rect x="0" y="0" width="${VW}" height="2600" fill="url(#hello-unprint)"/>`;
      defs.appendChild(um);
      skg = document.createElementNS(NS, "g");
      skg.setAttribute("mask", "url(#hello-unprint-m)");
      svg.appendChild(skg);
      // THE LIGHT ONLY SHOWS ON THE ELEMENTS (Agam: "the glow reveal for the page should not have its edges
      // visible, only when it interacts with the elements on the page"): the travelling band is masked to the
      // union of the element shapes (the same bars and card boxes as the skeletons, by <use>, so every
      // re-measure carries over). The wave itself is invisible on blank page; each element catches the light
      // as it passes. The face still blooms on its own.
      const cm = document.createElementNS(NS, "mask");
      cm.setAttribute("id", "hello-catch"); cm.setAttribute("maskUnits", "userSpaceOnUse"); cm.style.maskType = "alpha";
      cm.setAttribute("x", "0"); cm.setAttribute("y", "0"); cm.setAttribute("width", String(VW)); cm.setAttribute("height", "2600");
      catchG = document.createElementNS(NS, "g");
      catchG.setAttribute("fill", "#fff");
      cm.appendChild(catchG);
      defs.appendChild(cm);
      const mk = (el, part, m, w) => {
        const id = `hello-shim-${lines.length}`;
        const g = document.createElementNS(NS, "linearGradient");
        g.setAttribute("id", id); g.setAttribute("gradientUnits", "userSpaceOnUse");
        g.innerHTML = `<stop offset="0"/><stop offset="0.5"/><stop offset="1"/>`;
        defs.appendChild(g);
        // one group per element: its shapes (one bar per real text line, or the card's own rounded box)
        // share the element's gradient, so its light is one light
        const r = document.createElementNS(NS, "g");
        r.setAttribute("fill", `url(#${id})`); r.style.opacity = "0";
        skg.appendChild(r);
        const D = w + 0.08;
        lines.push({ r, rects: [], g, s: [...g.children], el, part, m, D, p0: m - 0.3 * D, box: [0, 0, 0, 0], big: false, ax: "x" });
      };
      marks.forEach(([m, el, w]) => {
        if (!w) return;
        mk(el, 0, m, w);
        if (el.matches(".hello-hero__mark-art")) mk(el, 1, m, w);
      });
      // the front's light: ONE radial gradient ring on ONE rect over the hero's area (dev and prod), centred on the face
      front = document.createElementNS(NS, "radialGradient");
      front.setAttribute("id", "hello-front"); front.setAttribute("gradientUnits", "userSpaceOnUse"); front.setAttribute("r", "2");
      // the centre stop, then one per sample of the band's profile (the light, above)
      front.innerHTML = `<stop offset="0"/>` + BAND_D.map(() => `<stop offset="0"/>`).join("");
      frontStops = [...front.children];
      defs.appendChild(front);
      frontRect = document.createElementNS(NS, "rect");
      frontRect.setAttribute("x", "0"); frontRect.setAttribute("y", "0"); frontRect.setAttribute("width", String(Math.max(document.documentElement.clientWidth, 600))); frontRect.setAttribute("height", "2600");
      frontRect.setAttribute("fill", "url(#hello-front)"); frontRect.setAttribute("mask", "url(#hello-catch)"); frontRect.style.opacity = "0";
      // dark: NO BAND AT ALL (Agam: "the boundary of the glow sweep should not be visible in dark mode ... only in
      // the areas where this boundary touches these elements should it glow, and it should glow a little
      // intensely, like the face"). The ring stays purely mathematical: not one pixel of light is drawn on the page
      // in dark; the contact glow is the elements' own (content(), below). Light mode keeps the masked band
      if (!dark) svg.appendChild(frontRect);
      // THE HAZE (Agam: "the glow reveal should be slightly distorted in the area where the elements are
      // appearing"): a few displacement filters, lent to the elements the band's core is crossing. Low-frequency
      // noise stretched across the line (a heat shimmer, not a wobble), one octave, sRGB so the noise's mean
      // stays 0.5 (no net shift); mostly vertical (the x channel pulled to a third), since sideways shifts
      // that change line to line read as tearing. Its scale follows the core (a gaussian of the element's
      // distance to it), so the content settles out of the ripple into crisp rest and the filter is dropped
      // once it is flat. Skia samples the displacement nearest-pixel, which steps glyph edges; a sub-pixel
      // softening (at most 0.3 px, on the same curve, so 0 at rest) takes the steps out.
      for (let i = 0; i < 6; i++) {
        const f = document.createElementNS(NS, "filter");
        f.setAttribute("id", `hello-haze-${i}`); f.setAttribute("x", "-6%"); f.setAttribute("y", "-30%"); f.setAttribute("width", "112%"); f.setAttribute("height", "160%");
        f.setAttribute("color-interpolation-filters", "sRGB");
        f.innerHTML = `<feTurbulence type="fractalNoise" baseFrequency="0.007 0.026" numOctaves="1" seed="${7 + i * 13}"/><feColorMatrix values="0.35 0 0 0 0.325  0 1 0 0 0  0 0 1 0 0  0 0 0 1 0" result="n"/><feDisplacementMap in="SourceGraphic" in2="n" scale="0" xChannelSelector="R" yChannelSelector="G"/><feGaussianBlur stdDeviation="0"/>`;
        defs.appendChild(f);
        hazes.push({ id: f.id, map: f.children[2], aa: f.children[3], L: null });
      }
      document.body.appendChild(svg);
    }
    // TWO CLOCKS, ONE AFTER THE OTHER (Agam: "complete the entire cycle of the face waving and morphing to 3D, and
    // THEN start the page reveal, so it feels like the glow is going outwards from the face"). M is the morph's t
    // ("heromorph:t", 0 while the face waves); the page waits under its quiet skeletons until M reaches 1. Then the
    // finished clay blooms (BLOOM_IN) and at the bloom's peak the light leaves it: T, the reveal's clock, runs 0..1
    // over WAVE_MS through the wave's own speed ramp. Nothing prints before T = 0.
    let M = 0, T = -1;
    const BLOOM_IN = 320, BLOOM_OUT = 760, WAVE_MS = 2000;
    // SKELETONS SHAPED LIKE THE CONTENT (idea 3): text gets one bar per real line fragment, at its real
    // length (year, name and line of a work row are three bars; a wrapped line is two), measured with a
    // Range over the hidden but laid-out text; cards get their own corner radius. Each block becomes
    // exactly the thing it stood for. Re-measured when the wave ends (fonts have landed) and on resize.
    const range = document.createRange();
    const textShapes = (el, ox, oy) => {
      const frags = [];
      const tw = document.createTreeWalker(el, NodeFilter.SHOW_TEXT, { acceptNode: (n) => (/\S/.test(n.data) ? 1 : 3) });
      for (let n = tw.nextNode(); n; n = tw.nextNode()) {
        range.selectNodeContents(n);
        for (const r of range.getClientRects()) if (r.width > 1 && r.height > 1) frags.push([r.left, r.top, r.right, r.height]);
      }
      frags.sort((a, b) => a[1] - b[1] || a[0] - b[0]);
      const out = [];
      for (const f of frags) {
        const c = out[out.length - 1];
        if (c && Math.abs(f[1] - c[1]) < 4 && f[0] - c[2] < 10) { c[2] = Math.max(c[2], f[2]); c[3] = Math.max(c[3], f[3]); }
        else out.push([...f]);
      }
      // a bar is the line's x-height band, not its full line box
      return out.map(([l, t, r, h]) => { const bh = Math.max(6, Math.round(h * 0.56)); return [l + ox, t + oy + (h - bh) / 2, r - l, bh, 2]; });
    };
    const place = () => {
      const ox = window.scrollX, oy = window.scrollY;
      for (const L of lines) {
        const b = L.el.getBoundingClientRect();
        let shapes = null;
        if (L.el.matches(".hello-hero__mark-art")) {
          // the glyph groups' own boxes ("Hello!" and "I'm Agam"), not the lockup's, which also spans the badge
          // where the face and its hand sit: the "Hello!" block starts 8px right of the face, never under it
          const gb = L.el.querySelector(L.part ? ".gm__name" : ".gm__hello")?.getBoundingClientRect();
          if (gb && gb.width) {
            const fr = root.querySelector(".hello-hero__flyer")?.getBoundingClientRect();
            const left = Math.max(gb.left + 6, !L.part && fr ? fr.right + 8 : 0);
            shapes = [[left + ox, gb.top + oy + gb.height * 0.14, Math.max(0, gb.right - left), gb.height * 0.72, 4]];
          }
          else shapes = [[b.left + ox, b.top + oy + (L.part ? b.height * 0.56 : b.height * 0.1), L.part ? b.width : b.width * 0.62, b.height * 0.36, 4]];
        }
        else if (L.el.matches(".wg__card")) shapes = [[b.left + ox, b.top + oy, b.width, b.height, parseFloat(getComputedStyle(L.el).borderTopLeftRadius) || 0]];
        else {
          shapes = textShapes(L.el, ox, oy);
          if (!shapes.length) shapes = [[b.left + ox, b.top + oy + b.height / 2 - 7, b.width, 14, 2]];
        }
        // measured at the element's REST place: its own entrance transform (a few px, easing out) is taken out
        { const cs = getComputedStyle(L.el); const m = cs.transform && cs.transform !== "none" ? new DOMMatrix(cs.transform) : null;
          const tr = (cs.translate && cs.translate !== "none" ? cs.translate.split(" ").map(parseFloat) : [0, 0]);
          const tx = (m ? m.e : 0) + (tr[0] || 0), ty = (m ? m.f : 0) + (tr[1] || 0);
          if (tx || ty) shapes = shapes.map(([sx, sy, sw, sh, rx]) => [sx - tx, sy - ty, sw, sh, rx]); }
        // the shapes' union is the element's box for the light, the wavefront and the wipe
        const x = Math.min(...shapes.map((q) => q[0])), y = Math.min(...shapes.map((q) => q[1]));
        const w = Math.max(...shapes.map((q) => q[0] + q[2])) - x, h = Math.max(...shapes.map((q) => q[1] + q[3])) - y;
        L.big = h > 60;
        L.box = [x, y, Math.max(0, w), Math.max(0, h)];
        const yc = (y + h / 2).toFixed(1);
        L.g.setAttribute("gradientTransform", `translate(0 ${yc}) skewX(-20) translate(0 ${-yc})`);
        while (L.rects.length < shapes.length) {
          const NSv = "http://www.w3.org/2000/svg", r = document.createElementNS(NSv, "rect"), u = document.createElementNS(NSv, "use");
          r.id = `hello-sk-${nShape++}`; u.setAttribute("href", `#${r.id}`); catchG?.appendChild(u); r.u = u;
          L.r.appendChild(r); L.rects.push(r);
        }
        while (L.rects.length > shapes.length) { const r = L.rects.pop(); r.u?.remove(); r.remove(); }
        shapes.forEach(([sx, sy, sw, sh, rx], i) => {
          const r = L.rects[i];
          r.setAttribute("x", sx.toFixed(1)); r.setAttribute("y", sy.toFixed(1)); r.setAttribute("width", Math.max(0, sw).toFixed(1)); r.setAttribute("height", Math.max(0, sh).toFixed(1)); r.setAttribute("rx", rx);
        });
      }
      wavefront();
    };
    // ONE WAVE FROM THE FACE (Agam, 11 Oct: "a single wave revealing all elements"): a single circular front
    // expands from the face's centre on the morph's clock. For each element this stores where the front
    // first touches it (dmin, its nearest point) and where it has fully passed (dmax, its farthest point),
    // in page pixels; the element is revealed through a soft-edged circular mask as the front crosses it,
    // so big elements print in progressively across their area. Static geometry, recomputed with the layout.
    let fx = 0, fy = 0, RMAX = 1, RTOT = 1, CEND = 1, rFace = 0;
    function wavefront() {
      if (!lines.length) return;
      const fr = root.querySelector(".hello-hero__flyer")?.getBoundingClientRect();
      if (!fr || !fr.width) return;
      fx = fr.left + fr.width / 2 + window.scrollX; fy = fr.top + fr.height / 2 + window.scrollY;
      const per = new Map();
      for (const L of lines) {
        const [x, y, w, h] = L.box;
        const dx = Math.max(x - fx, 0, fx - (x + w)), dy = Math.max(y - fy, 0, fy - (y + h));
        const fxm = Math.max(Math.abs(x - fx), Math.abs(x + w - fx)), fym = Math.max(Math.abs(y - fy), Math.abs(y + h - fy));
        const o = per.get(L.el) || { dmin: Infinity, dmax: 0 };
        o.dmin = Math.min(o.dmin, Math.hypot(dx, dy)); o.dmax = Math.max(o.dmax, Math.hypot(fxm, fym));
        per.set(L.el, o);
      }
      RMAX = 1;
      for (const L of lines) { const o = per.get(L.el); L.dmin = o.dmin; L.dmax = o.dmax; RMAX = Math.max(RMAX, o.dmax); const b = L.el.getBoundingClientRect(); L.ex = b.left + window.scrollX; L.ey = b.top + window.scrollY; }
      // the front runs on past the farthest element to the viewport's farthest corner, so the ring sweeps
      // fully off the page (Agam: "it should go all the way through"), at any width
      const vx0 = window.scrollX, vy0 = window.scrollY, vx1 = vx0 + document.documentElement.clientWidth, vy1 = vy0 + window.innerHeight;
      const RCORN = Math.max(Math.hypot(fx - vx0, fy - vy0), Math.hypot(vx1 - fx, fy - vy0), Math.hypot(fx - vx0, vy1 - fy), Math.hypot(vx1 - fx, vy1 - fy));
      RTOT = Math.max(RMAX, RCORN) + 40;
      CEND = RTOT + TRAIL * 0.5;
      // the clay's rim, where the light leaves it (the clay ends 1.21x the drawing, grown from its right edge)
      rFace = (Math.max(fr.width, fr.height) / 2) * 1.2;
      waveRamp = buildRamp(Math.min(1, RMAX / RTOT));
      if (front) { front.setAttribute("cx", fx.toFixed(1)); front.setAttribute("cy", fy.toFixed(1)); }
      if (unprint) { unprint.setAttribute("cx", fx.toFixed(1)); unprint.setAttribute("cy", fy.toFixed(1)); }
    }
    // THE WAVE'S OWN SPEED RAMP (Agam: "also add a speed ramp to it"; "the wave keeps its ramp"): a monotone cubic
    // (Fritsch-Carlson, the same construction as the morph's RAMP: never backwards, no overshoot; its slope is the
    // speed), keys = [share of the wave's time, share of its travel]: a quick launch out of the face, a
    // slow-motion stretch as the light crosses the heading and the links, a fast sweep through the list and the
    // cards, easing to a stop. Built for k = (farthest element) / (total travel), so the first keys stay where
    // they are in px and the run out to the viewport's far corner happens at speed.
    const buildRamp = (k) => {
      // ONE SWEEP, ONE EASING (Agam: "one single sweep with no break"): the earlier keys held the front back
      // across the heading and links (slope ~0.5) and then sped it up again, which read as a step. These
      // keys only ever slow down: out of the face at full speed, easing continuously to the far corner
      // (slope 0 only at the very end). k is no longer needed; kept so the call sites stay as they are.
      void k;
      const K = [[0, 0], [0.18, 0.3], [0.55, 0.8], [1, 1]];
      const x = K.map((q) => q[0]), y = K.map((q) => q[1]);
      const d = x.slice(1).map((xi, i) => (y[i + 1] - y[i]) / (xi - x[i]));
      const m = [d[0], ...d.slice(1).map((di, i) => (di * d[i] <= 0 ? 0 : (2 * di * d[i]) / (di + d[i]))), 0];
      return (u) => {
        if (u <= 0) return 0;
        if (u >= 1) return 1;
        let i = 0;
        while (u > x[i + 1]) i++;
        const h = x[i + 1] - x[i], t = (u - x[i]) / h, t2 = t * t, t3 = t2 * t;
        return (2 * t3 - 3 * t2 + 1) * y[i] + (t3 - 2 * t2 + t) * h * m[i] + (-2 * t3 + 3 * t2) * y[i + 1] + (t3 - t2) * h * m[i + 1];
      };
    };
    let waveRamp = buildRamp(1);
    place();
    if (import.meta.env.DEV) window.__skel = lines; // dev only: the load QA diffs each block against its element
    window.addEventListener("resize", place);
    let born = performance.now();
    // NO DRIFT (Agam: "the shimmer for the project list is shifting"): the blocks were measured at mount,
    // before the web fonts landed, so the real rows then moved under them (up to 13px) and the blocks
    // snapped at the reveal. Now the overlay stays hidden until the fonts are in and the layout has held
    // for two frames, is measured then, and is re-measured whenever the layout changes (ResizeObserver on
    // the page, a late font). Absolute document coordinates, so scroll carries it with the rows.
    let placeQueued = 0;
    const replace = () => { if (placeQueued || over) return; placeQueued = requestAnimationFrame(() => { placeQueued = 0; if (!over) place(); }); };
    if (svg) {
      svg.style.visibility = "hidden";
      Promise.race([document.fonts?.ready, new Promise((r) => setTimeout(r, 2500))]).then(() =>
        requestAnimationFrame(() => requestAnimationFrame(() => {
          if (over) return;
          place(); svg.style.visibility = ""; born = performance.now();
          setTimeout(replace, 1600); // after the entrance transforms (a 10px settle on the rows) have run out
        })));
    }
    const ro = new ResizeObserver(replace);
    ro.observe(root);
    document.fonts?.addEventListener?.("loadingdone", replace);
    // the sweep: one diagonal band crossing the page every 3.6 s on the wall clock
    const sweepX = (yc) => { const W = document.documentElement.clientWidth; return (((performance.now() - born) / 3600) % 1 * 1.8 - 0.45) * W + yc * TAN; };
    // THE CARD'S OWN COLOUR (idea 4): a card blooms in a pale version of its own image, so it resolves
    // into its colour instead of passing through the same beige as the text. Sampled once from the first
    // loaded <img> or <video> frame (same-origin), averaged on an 8x8 canvas, mixed 40% toward white.
    let cvs = null;
    const tint = (L) => {
      if (L.tint !== undefined) return L.tint;
      const src = [...L.el.querySelectorAll("img, video")].find((m) => (m.tagName === "IMG" ? m.complete && m.naturalWidth : m.readyState >= 2));
      if (!src) return null; // not loaded yet: try again next frame
      try {
        cvs ||= Object.assign(document.createElement("canvas"), { width: 8, height: 8 });
        const c = cvs.getContext("2d", { willReadFrequently: true });
        c.clearRect(0, 0, 8, 8); c.drawImage(src, 0, 0, 8, 8);
        const d = c.getImageData(0, 0, 8, 8).data;
        let r = 0, g = 0, b = 0, n = 0;
        for (let i = 0; i < d.length; i += 4) if (d[i + 3] > 128) { r += d[i]; g += d[i + 1]; b += d[i + 2]; n++; }
        L.tint = n ? [r / n, g / n, b / n].map((v) => v + (255 - v) * 0.4) : false;
      } catch { L.tint = false; }
      return L.tint;
    };
    // THE SHIMMER BREATHES WITH THE WAVE (idea 5): while the face waves, the band's brightness and width
    // follow the hand's own rotation (read from its running animation, so it is the real beat at any
    // speed): each flick of the wrist sends a brighter, wider pulse through every block. No hand, or once
    // it rests: the plain sweep.
    const hand = () => root.querySelector('.hello-hero__flyer .header__wave[data-kind="wave"]') || root.querySelector('.header__wave[data-kind="wave"]');
    let handEl = null;
    const beat = () => {
      if (M > 0) return -1;
      if (!handEl?.isConnected) handEl = hand();
      if (!handEl) return -1;
      const an = handEl.getAnimations?.()[0];
      if (!an || an.playState === "finished") return -1; // the wave is over: back to the plain sweep
      const m = getComputedStyle(handEl).transform;
      if (!m || m === "none") return 0;
      const v = m.slice(m.indexOf("(") + 1, -1).split(",").map(Number);
      const deg = (Math.atan2(v[1], v[0]) * 180) / Math.PI;
      return Math.min(1, Math.max(0, deg / 30));
    };
    // the band's core: a radius about the face's centre, from the clay's rim at T = 0 (the bloom's peak) to the
    // viewport's far corner (plus half its trail) at T = 1, through the wave's speed ramp; before T = 0 it is
    // nowhere (nothing lit, nothing printed)
    const frontC = () => (T < 0 ? -1e5 : rFace + (CEND - rFace) * waveRamp(T));
    // the light's strength: the bloom's own curve carried outward, strongest as it leaves the face and settling
    // to a little under half as it spreads, thinning out past the farthest element
    const glowOf = (C) => (0.45 + 0.55 * (1 - ss(0, 0.7, Math.max(0, T)))) * (1 - ss(RMAX + 0.5 * S, CEND, C));
    // ONE MATERIAL CHANGE: shimmer, light, content. While the face waves the skeletons shimmer; as the face
    // starts to flood their sweep quiets (to a third by the peak: the page holds its breath for the face). As
    // the light comes, each block takes on its colour (the grey tone warms into the light's own, its sweep
    // fades) and then dissolves into the band's soft leading edge, just as the content starts printing in
    // under the same light: the block becomes the light and the light becomes the content, overlapping.
    const light = () => {
      const W = document.documentElement.clientWidth, fadeIn = ss(0, 900, performance.now() - born);
      const bt = still ? -1 : beat();
      const hush = 1 - 0.65 * ss(0.1, 1, M); // the shimmer quiets while the face morphs
      const pulse = (bt < 0 ? 1 : 0.6 + 0.8 * bt) * hush, widen = bt < 0 ? 1 : 1 + 0.35 * bt;
      const C = still ? 0 : frontC();
      for (const L of lines) {
        if (L.dead) continue;
        const [x, y, w, h] = L.box, yc = y + h / 2;
        let cx, hw, cBase, cLit, op;
        if (still) {
          // reduced motion: a still block that cross-fades to the content
          const p = (T - L.p0) / L.D;
          if (p >= 1) { L.r.style.opacity = "0"; L.dead = true; continue; }
          cx = x + w / 2; hw = W; cBase = cLit = BASE; op = fadeIn * (1 - ss(0.25, 0.6, p));
        } else {
          // lead: the band's leading edge (LEAD ahead of the core). The block warms as it nears; the unprint
          // mask (above) takes it away exactly where its content prints in; hidden once fully printed over
          const lead = C + LEAD;
          if (C - 0.95 * S >= L.dmax) { L.r.style.opacity = "0"; L.dead = true; continue; } // hidden, kept: its shape still catches the light
          const warm = ss(L.dmin - 2 * S, L.dmin, lead), sh = 1;
          cx = sweepX(yc); hw = W * 0.36 * widen;
          cBase = [...mix(BASE.slice(0, 3), CORE_RGB, warm), (BASE[3] + ((dark ? BASE[3] : SIDE_A * 0.45) - BASE[3]) * warm) * sh]; // dark: tinted, never brighter (a lit block on black is a slab)
          cLit = [...mix(LIT.slice(0, 3), CORE_RGB, warm), Math.min(1, LIT[3] * pulse) * (1 - warm) * sh + cBase[3] * warm];
          op = sh > 0.004 ? fadeIn : 0;
        }
        L.g.setAttribute("x1", (cx - hw).toFixed(1)); L.g.setAttribute("x2", (cx + hw).toFixed(1));
        L.s[0].setAttribute("stop-color", rgba(cBase)); L.s[1].setAttribute("stop-color", rgba(cLit)); L.s[2].setAttribute("stop-color", rgba(cBase));
        L.r.style.opacity = op.toFixed(3);
      }
      if (unprint && !still) {
        const e0 = C + 0.35 * S, e1 = C - 0.95 * S, r = Math.max(2, e0);
        unprint.setAttribute("r", r.toFixed(1));
        PRINT.forEach(([k, a], i) => { const st = unprint.children[i]; st.setAttribute("offset", Math.min(1, Math.max(0, (e1 + (e0 - e1) * k) / r)).toFixed(4)); st.setAttribute("stop-opacity", (1 - a).toFixed(3)); });
      }
      // the one band of light: the profile laid out about the core; inside the face's centre it holds the
      // profile's value there. Its strength is the rect's opacity (one compositor property)
      if (front && !still) {
        const r = Math.max(2, C + LEAD);
        const at = (d) => Math.max(d, -C); // a stop behind the centre takes the centre's value
        const st = (el, d) => { const dd = at(d); el.setAttribute("offset", Math.min(1, Math.max(0, (C + dd) / r)).toFixed(4)); el.setAttribute("stop-color", rgba([...bandRGB(dd), band(dd)])); };
        st(frontStops[0], -C);
        BAND_D.forEach((d, i) => st(frontStops[i + 1], d));
        front.setAttribute("r", r.toFixed(1));
        frontRect.style.opacity = glowOf(C).toFixed(3);
      }
    };
    // the content is PRINTED by the band: a circular mask centred on the face, transparent just ahead of the
    // core and opaque 0.95 S behind it, along a smoothstep (six stops, no knee at either end, so no mask edge or
    // seam shows; every element shares the one centre, so neighbours print as one surface; the print spans
    // 1.3 S, so it resolves inside the band's trailing glow, not after it). On top, the light
    // on it: brighter, a little desaturated and warmed toward the clay (sepia), a touch lower in contrast, by
    // the band's strength where the element is (1 while the core is on it, then the trailing falloff over
    // 1.6 S), the same px for a 14px link and a 300px card. Then the haze, then nothing.
    const MASK_PROPS = ["mask-image", "mask-size", "mask-position", "mask-repeat", "-webkit-mask-image", "-webkit-mask-size", "-webkit-mask-position", "-webkit-mask-repeat"];
    const unmask = (el) => { for (const k of MASK_PROPS) el.style.removeProperty(k); };
    const setMask = (el, img) => { el.style.setProperty("mask-image", img); el.style.setProperty("-webkit-mask-image", img); };
    const lend = (L) => { const z = hazes.find((q) => !q.L); if (z) { z.L = L; L.hz = z; } return z; };
    const free = (L) => { if (L.hz) { L.hz.map.setAttribute("scale", "0"); L.hz.aa.setAttribute("stdDeviation", "0"); L.hz.L = null; L.hz = null; } };
    const content = () => {
      const C = still ? 0 : frontC(), g = still ? 0 : glowOf(C);
      for (const L of lines) {
        if (L.part || L.done) continue; // one write per element (the "Hello!" and "I'm Agam" blocks share one)
        const el = L.el;
        if (still) { const p = (T - L.p0) / L.D; if (p >= 0.3) el.style.opacity = ss(0.3, 0.6, p).toFixed(3); if (p >= 1) { el.style.removeProperty("opacity"); L.done = true; } continue; }
        if (C >= L.dmax + 1.65 * S) { free(L); el.style.removeProperty("filter"); unmask(el); L.done = true; continue; }
        const e0 = C + 0.35 * S, e1 = C - 0.95 * S; // the print: transparent at e0, opaque at e1 (the unprint's complement)
        if (e0 < L.dmin) { if (!L.masked) { setMask(el, "linear-gradient(transparent, transparent)"); L.masked = true; } continue; } // not reached: fully hidden
        const at = `circle at ${(fx - L.ex).toFixed(1)}px ${(fy - L.ey).toFixed(1)}px`;
        setMask(el, `radial-gradient(${at}, ${PRINT.map(([k, a]) => `rgba(0,0,0,${a.toFixed(3)}) ${Math.max(0, e1 + (e0 - e1) * k).toFixed(1)}px`).join(", ")})`);
        L.masked = true;
        // the core's distance to the element (0 while it is on it; < 0 once it has passed)
        const d = C < L.dmin ? L.dmin - C : C > L.dmax ? L.dmax - C : 0;
        // (dark: the contact glow holds its strength all the way out to the cards, as the face's own flood does)
        const I = (dark ? Math.min(1, 0.85 + 0.15 * g) : g) * (d >= 0 ? gauss(d, 0.36 * S) : 1 - ss(0, 1.6 * S, -d));
        const hz = g * gauss(d, 0.3 * S); // the haze: the core's own gaussian, a little wider
        const B = L.big ? (dark ? 0.18 : 0.4) : 1.1; // a light image would wash to white (and grey out on dark)
        let f = "";
        if (hz > 0.02 && (L.hz || lend(L))) { L.hz.map.setAttribute("scale", ((L.big ? 6 : 5) * hz).toFixed(2)); L.hz.aa.setAttribute("stdDeviation", (0.3 * hz).toFixed(3)); f = `url(#${L.hz.id}) `; }
        else free(L);
        // DARK: THE CONTACT GLOW IS THE CLAY'S FLOOD. Where the front touches an element, the element itself
        // floods the way the face does: bright, warm and desaturated at contact (the clay's pale skin, #f2dcc6:
        // sepia over a lifted, greyed colour), with a warm bloom on its own glyphs (a drop-shadow, which follows
        // the glyphs' alpha and is clipped to the element's box by its print mask, so nothing spills onto the
        // page), resolving to its true colour as the front moves on
        if (I > 0.01 && dark) {
          const big = L.big, r = big ? 0 : 7 * I;
          f += `brightness(${(1 + (big ? 0.3 : 0.9) * I).toFixed(3)}) saturate(${(1 - (big ? 0.45 : 0.75) * I).toFixed(3)}) sepia(${((big ? 0.3 : 0.5) * I).toFixed(3)})` + (r > 0.3 ? ` drop-shadow(0 0 ${r.toFixed(1)}px rgba(${CORE_RGB.map((v) => v | 0).join(",")},${(0.8 * I).toFixed(3)}))` : "");
        } else if (I > 0.01) f += `brightness(${(1 + B * I).toFixed(3)}) saturate(${(1 - 0.6 * I).toFixed(3)}) sepia(${(0.14 * I).toFixed(3)}) contrast(${(1 - 0.08 * I).toFixed(3)})`;
        el.style.filter = f;
      }
    };
    let next = 0, over = false, tm = 0, raf = 0, fb = 0;
    const done = () => {
      if (over) return;
      over = true;
      marks.forEach(([, el]) => { el.setAttribute("data-in", ""); el.style.removeProperty("filter"); el.style.removeProperty("opacity"); unmask(el); });
      window.removeEventListener("heromorph:t", onT);
      window.removeEventListener("resize", place);
      ro.disconnect(); document.fonts?.removeEventListener?.("loadingdone", replace); cancelAnimationFrame(placeQueued);
      svg?.remove();
      clearTimeout(fb); clearTimeout(tm); cancelAnimationFrame(raf);
      tm = setTimeout(() => { setSeq(false); markIntroDone(); }, 800);
    };
    // the reveal's clock, every frame once the light has left: marks (data-in), the light, the print
    const step = () => {
      if (over) return;
      T = Math.min(1, (performance.now() - waveAt) / (still ? 2600 : WAVE_MS));
      if (import.meta.env.DEV) (window.__fr ||= []).push([Math.round(performance.now()), T < 0 ? null : Math.round(frontC()), +M.toFixed(3)]); // dev only: the load QA plots the front
      while (next < marks.length && marks[next][0] <= T) marks[next++][1].setAttribute("data-in", "");
      if (glow && T >= 0) { light(); content(); }
      if (T >= 1 && (!glow || lines.every((L) => L.dead && (L.part || L.done)))) { done(); return; }
      if (T >= 1 && performance.now() - waveAt > (still ? 2600 : WAVE_MS) + 600) { done(); return; } // a last element's tail, then stop
      raf = requestAnimationFrame(step);
    };
    // THE BLOOM: the finished face swells with warm light (brighter, a little paler, a soft halo in the clay's
    // own skin) and the wave leaves it at the peak. A Web Animation on the face's frame, fill none: nothing left.
    let waveAt = Infinity;
    const launch = () => {
      if (waveAt !== Infinity || over) return;
      clearTimeout(fb);
      // no hold between the morph landing and the light leaving (it used to wait BLOOM_IN = 320 ms with nothing
      // moving): the front starts at the clay's rim on the same frame, and the bloom swells under it
      waveAt = performance.now();
      const face = !still && glow ? root.querySelector(".hello-hero__flyer .header__avatar-wrap") : null;
      if (face?.animate) {
        const halo = `rgba(${FLOOD_RGB.join(",")},${dark ? 0.55 : 0.9})`;
        face.animate([
          { filter: "brightness(1) saturate(1) drop-shadow(0 0 0px rgba(0,0,0,0))" },
          { filter: `brightness(${dark ? 1.22 : 1.12}) saturate(0.86) drop-shadow(0 0 16px ${halo})`, offset: BLOOM_IN / (BLOOM_IN + BLOOM_OUT), easing: "cubic-bezier(0.33, 0, 0.2, 1)" },
          { filter: "brightness(1) saturate(1) drop-shadow(0 0 0px rgba(0,0,0,0))" },
        ], { duration: BLOOM_IN + BLOOM_OUT, easing: "cubic-bezier(0.4, 0, 0.6, 1)" });
      }
      raf = requestAnimationFrame(step);
    };
    // the morph's clock: the skeletons quiet as it runs; the light leaves when it lands (t = 1)
    const onT = (e) => {
      clearTimeout(fb);
      M = e.detail;
      if (M >= 1) launch();
    };
    window.addEventListener("heromorph:t", onT);
    // the skeletons' shimmer runs every frame from the first one, on the wall clock
    let pre = 0, cap = 0;
    const frame = () => { if (over) return; if (T < 0) light(); pre = requestAnimationFrame(frame); };
    if (svg) pre = requestAnimationFrame(frame);
    // no morph started within a beat of the wave's end (phones, no WebGL, reduced motion, a repeat visit):
    // the face blooms as it is and the light leaves now
    armRef.current = () => {
      place();
      cap = setTimeout(done, 12000);
      fb = setTimeout(() => { if (M === 0) launch(); }, 1500);
    };
    return () => { over = true; armRef.current = null; cancelAnimationFrame(pre); ro.disconnect(); document.fonts?.removeEventListener?.("loadingdone", replace); cancelAnimationFrame(placeQueued); window.removeEventListener("resize", place); svg?.remove(); window.removeEventListener("heromorph:t", onT); clearTimeout(fb); clearTimeout(cap); clearTimeout(tm); cancelAnimationFrame(raf); };
  }, [seq]);
  // the wave has ended: the safety timers and the plain-clock fallback start now
  useEffect(() => { if (stage === "reveal") armRef.current?.(); }, [stage]);
  // the intro plays over a hero nobody sees yet (it is inside the monitor): skip it
  useEffect(() => {
    if (sceneWindow) skip();
  }, [sceneWindow, skip]);
  const measure = useFlight(flyerRef, rootRef, !reduce);
  // Hovering the face replays the turn/wave, exactly as it does on the index
  // page: bumping this remounts MorphFace (and the wave) so the sequence runs
  // again from t=0. Per annotation ms8up04s.
  const [replayId, setReplayId] = useState(0);
  // mtr81k5b ("the hello text is not moving when the wave animation plays"):
  // a replay marks the root data-waving for the wave's whole run (header-wave
  // is 2.6s after a 0.5s delay, index.css), and hello3.css steps "Hello!"
  // right for that window exactly as it does while the intro plays.
  const [waving, setWaving] = useState(false);
  // mttigolc: the footer bubbles latch open after the first hover
  const [footRevealed, setFootRevealed] = useState(false);
  // THE SKY IS THE REAL SKY (pin mttiuint, 09 Sep 2026: "make the shader a
  // little more dramatic... it's 8:40 now but I see the same visuals as last
  // night"). This page had been rendering the living sky from its DEFAULTS
  // plus the wall clock: no weather, no real sun, so cloud, haze and the sun's
  // height never changed with the day. Same wiring as the index page's
  // WeatherSky now: the Open-Meteo reading behind the tooltip becomes the
  // shader's uniforms (cover, precipitation, fog, storm, wind, haze, season,
  // latitude), the sun and moon come from the place's real solar position
  // (re-derived every minute), and the clock runs on the place's UTC offset.
  // ShaderCanvas tweens numeric uniforms, so a reading arriving after first
  // paint eases in rather than snapping. `?tod=0.36` pins the time of day
  // for checking a dawn or a night without waiting for one.
  const [sky, setSky] = useState(null);
  const [minute, setMinute] = useState(0);
  useEffect(() => {
    let alive = true;
    const load = () => fetchSky().then((s) => alive && setSky(s)).catch(() => {});
    load();
    const id = setInterval(load, 15 * 60 * 1000);
    const tick = setInterval(() => alive && setMinute((m) => m + 1), 60 * 1000);
    return () => { alive = false; clearInterval(id); clearInterval(tick); };
  }, []);
  const pinnedTod = useMemo(() => {
    if (typeof window === "undefined") return null;
    const v = parseFloat(new URLSearchParams(window.location.search).get("tod"));
    return Number.isFinite(v) ? v : null;
  }, []);
  // mu2sz0p2: any living-sky uniform can be pinned from the query string, the
  // same way `?tod=` pins the hour. Weather cannot be waited for - checking
  // that rain draws meant waiting for rain, which is why nobody had checked -
  // so `?u_precip=0.8&u_cover=0.34` puts the page in a downpour on demand.
  const pinnedU = useMemo(() => {
    if (typeof window === "undefined") return null;
    const q = new URLSearchParams(window.location.search);
    const out = {};
    for (const [k, v] of q) {
      if (!k.startsWith("u_")) continue;
      const n = parseFloat(v);
      if (Number.isFinite(n)) out[k] = n;
    }
    return Object.keys(out).length ? out : null;
  }, []);
  const skyUniforms = useMemo(() => {
    let u = LIVING_SKY_DEFAULTS;
    if (sky?.uniforms) u = sky.place && Number.isFinite(sky.place.lat) ? { ...sky.uniforms, ...sunUniforms(sky.place) } : sky.uniforms;
    // a pinned time of day has to drive the sun too, or the real elevation
    // (u_sunReal) would hold the sky at whatever hour it actually is
    if (pinnedTod !== null) u = { ...u, u_sunReal: 0 };
    return pinnedU ? { ...u, ...pinnedU } : u;
  }, [sky, minute, pinnedTod, pinnedU]); // eslint-disable-line react-hooks/exhaustive-deps -- `minute` re-derives the sun

  // mttihrw2 ("as I scroll, the elements at the very top of the page should
  // go to nil"): the hero's greeting and timeline fade out over the first
  // half-viewport of scroll and come back the same way. One rAF-throttled
  // scroll listener writes --hero-fade (1 at the top, 0 by half a viewport)
  // onto the root; hello3.css reads it. Written as a variable rather than a
  // scroll-driven animation so it works in every current browser and never
  // fights the intro gate's own opacity rules.
  useEffect(() => {
    const el = rootRef.current;
    if (!el) return undefined;
    let raf = 0;
    const write = () => {
      raf = 0;
      // with the window scene the page starts below its runway
      const off = sceneRun1.current ? sceneRun1.current.offsetHeight : 0;
      const f = Math.max(0, Math.min(1, 1 - Math.max(0, window.scrollY - off) / (window.innerHeight * 0.5)));
      el.style.setProperty("--hero-fade", f.toFixed(3));
    };
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(write); };
    write();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => { window.removeEventListener("scroll", onScroll); window.removeEventListener("resize", onScroll); cancelAnimationFrame(raf); };
  }, []);
  const waveTimer = useRef(0);
  const replayGreeting = useCallback(() => {
    if (reduce) return;
    setReplayId((r) => r + 1);
    setWaving(true);
    window.clearTimeout(waveTimer.current);
    waveTimer.current = window.setTimeout(() => setWaving(false), 3100);
  }, [reduce]);
  useEffect(() => () => window.clearTimeout(waveTimer.current), []);
  // Before the first paint, so the face is never seen at rest for a frame and
  // then thrown to the centre.
  useLayoutEffect(() => {
    if (!reduce) measure();
  }, [reduce, measure]);

  return (
    <div className="hello" ref={rootRef} data-page="3" data-stage={stage} data-seq={seq ? "" : undefined} data-glow={seq && GLOW_IN ? "" : undefined} data-reduce={reduce ? "true" : undefined} data-waving={waving ? "true" : undefined} data-scene={sceneWindow ? "window" : undefined}>
      {/* Figma node 1:4: a full-bleed sky across the top, dissolved into the page
          by a very large blurred white ellipse. Reproduced as the LIVE shader
          rather than the pasted screenshot, and the dissolve as a mask rather
          than a white ellipse — a white shape would be a white blob on a dark
          page, while a mask fades to whatever the page actually is. */}
      {/* "on mobile the sky is not so visible". The shader is aspect-corrected
          (`uv.x *= aspect`), so the WIDTH OF SKY it draws is the canvas aspect:
          measured 2.176 on a 1349px window against 0.746 on a phone, which is
          a third of the sky, with clouds three times their intended size on
          screen. That is what reads as a flat wash rather than a sky.

          The canvas therefore gets its own box, wider than the band, and the
          band goes on clipping it, so a phone sees a landscape slice while the
          ellipse mask stays exactly as drawn. ShaderCanvas measures its
          PARENT, which is why this needs an element rather than a width on the
          canvas.

          It costs less than before, not more: superSample buys the pixels
          back, and at 0.55 the buffer is smaller than it was while showing
          more than twice the sky. A soft wash is the one thing that can afford
          to be rendered at a lower resolution. */}
      {sceneWindow && (
        <Guard name="room-scene"><Suspense fallback={null}>
          <WindowSceneFolio run1Ref={sceneRun1} run2Ref={sceneRun2} heroRef={heroRef} />
        </Suspense></Guard>
      )}
      {!sceneWindow && (
      <div className="hello-sky" aria-hidden>
        <div className="hello-sky__lens">
          <Guard name="sky-shader"><Suspense fallback={null}>
            <ShaderCanvas
              preset="livingSky"
              className="hello-sky__canvas"
              uniforms={skyUniforms}
              clock
              clockOffsetSeconds={sky?.offset ?? null}
              tod={pinnedTod}
              superSample={SKY_NARROW ? 0.55 : 1}
            />
          </Suspense></Guard>
        </div>
      </div>
      )}

      {/* the weather tooltip over the bare sky, as on /hello (was the
          mtqt7wsl/mtqtcc6f status bar in the top controls until 07 Sep 2026) */}
      {/* weather tooltip over the sky removed (Agam 2026-10-11) */}
      {/* the way into the room (2026-10-11, opt-in): ONE glass container at the top
          centre, fading in a moment after load. While the room warms in the background it
          holds "Setting up the room" with the loader (a click anywhere on it queues the
          entry); once ready the text turns to "The room is ready" and a solid white
          "Enter the room" button grows in on its right (annotations mv3sf3jm-qb2htt,
          mv3u3h6m-4trwcm, mv3unisi-raj9d1). The status text is the polite live region.
          Both texts and the button's width are measured (roomBtnRef) so the morph tweens.
          Hidden if the warm-up fails. The container's class is also what the monitor's
          page capture skips (sceneWarm.js) */}
      {roomBtnShown && (
        <Guard name="room-button">
        <div
          ref={roomBtnRef}
          className="wscene-warm-pill"
          data-state={journey === "landing" || journey === "handoff" ? journey : going ? "entering" : uiReady ? "ready" : enterWanted ? "queued" : "warming"}
          aria-busy={!uiReady || going}
          onPointerEnter={() => setWarmWanted(true)}
          onClick={uiReady ? undefined : () => { setWarmWanted(true); setEnterWanted(true); }}
        >
          <span className="wscene-warm-pill__status" role="status" aria-live="polite">
            <span className="wscene-warm-pill__label" data-on={!uiReady || undefined} aria-hidden={uiReady}>
              Setting up workspace
              <span className="wscene-nudge__dots" aria-hidden="true"><i /><i /><i /></span>
            </span>
            <span className="wscene-warm-pill__label" data-on={(uiReady && !going && journey === "idle") || undefined} aria-hidden={!(uiReady && !going && journey === "idle")}>
              {stalled ? "The room didn't load" : "The room is ready"}
            </span>
            {/* the landing: the room's "scroll" floater's own label and arrow (WindowSceneFolio.jsx) */}
            <span className="wscene-warm-pill__label" data-on={journey === "landing" || journey === "handoff" || undefined} aria-hidden="true">
              scroll
              <svg className="wscene-nudge__arrow" width="20" height="20" viewBox="0 -960 960 960" fill="currentColor">
                <path d="M480-240 240-480l56-56 144 144v-368h80v368l144-144 56 56-240 240Z" />
              </svg>
            </span>
          </span>
          <button
            type="button"
            className="wscene-warm-pill__btn"
            tabIndex={uiReady && !going && journey === "idle" ? 0 : -1}
            aria-hidden={!(uiReady && !going && journey === "idle")}
            onFocus={() => setWarmWanted(true)}
            onClick={() => {
              setWarmWanted(true);
              if (stalled) {
                setStalled(false);
                entryAttempts.current = 0;
                rewarm();
              }
              setEnterWanted(true);
            }}
          >
            <span className="wscene-warm-pill__btn-label">{stalled ? "Retry" : "View"}</span>
            {/* the loading state inside the white button once it is clicked */}
            <span className="wscene-warm-pill__btn-dots wscene-nudge__dots" aria-hidden="true"><i /><i /><i /></span>
          </button>
        </div>
        </Guard>
      )}

      {/* "Back to the room": see backShown above. Mounted while in the room's layout so it can
          fade; hidden (visibility) when not shown, so it is neither seen nor tabbable */}
      {sceneWindow && (
        <button
          type="button"
          className="wscene-back-pill"
          data-on={backShown || undefined}
          tabIndex={backShown ? 0 : -1}
          aria-hidden={!backShown}
          onClick={backToRoom}
        >
          <svg className="wscene-back-pill__arrow" width="20" height="20" viewBox="0 -960 960 960" fill="currentColor" aria-hidden="true">
            <path d="M440-240v-368L296-464l-56-56 240-240 240 240-56 56-144-144v368h-80Z" />
          </svg>
          Back to the room
        </button>
      )}

      {/* the scene's main runway (2026-09-27, Agam): a spacer ABOVE the page. The
          first frame is the room with the portfolio's top on the monitor; scrolling
          dollies into the screen, and p = 1 exactly as the hero's top reaches the
          viewport's top, so the page starts from its very top. The content is held
          back until then (html[data-wscene-landed], windowScene.css) */}
      {sceneWindow && <div className="hello-scene-run" ref={sceneRun1} aria-hidden />}
      <section className="hello-hero" ref={heroRef}>
        <div className="hello-hero__inner">
          {/* Figma: Portfolio 2026, node 9:1955. The greeting is two RIGHT-ranged
              lines with the face badge pinned to the left of line one. Line two
              is the wider line and therefore sets the block's width; line one
              gets the slack, which is what puts the badge and "Hello!" at
              opposite ends of it. The badge holds its final position from the
              first painted frame, so the intro is the words arriving around it
              rather than the face travelling. */}
          <h1 className="hello-hero__greet" onClick={stage === "reveal" ? undefined : skip} data-calm aria-labelledby="hello-hero-title">
            {/* The words, for anything that reads rather than looks. The mark
                below is outlines and carries no text at all, so this is the only
                place the greeting exists as language. */}
            <HelloFlipSr store={helloFlip} rest={GREETING[1]} />

            {/* not aria-hidden: the face is a button once it is clay (HeroMorph); everything else in
                it (the drawing, the wave, the canvas) hides itself */}
            <span className="hello-hero__badge">
              {/* The index page's avatar markup, verbatim: the same MorphFace
                  component and the same `.header__wave` hand on the same
                  `.header__avatar-wrap` frame, so the sequence and its geometry
                  are the page's own rather than a reconstruction of it.
                  This element is the traveller — it starts in the middle of the
                  viewport and ends here, and there is only ever one of it. */}
              <span className="hello-hero__flyer" ref={flyerRef}>
                <span className="header__avatar-wrap" onMouseEnter={replayGreeting}>
                  {/* still: no 2D turn before the morph, nor on hover (2026-10-11) */}
                  <MorphFace key={`face-${replayId}`} still />
                  <Guard name="hero-morph"><HeroMorph ready={stage === "reveal"} /></Guard>
                  {!reduce && (
                    <span
                      className="header__wave"
                      data-kind="wave"
                      aria-hidden
                      key={`wave-${replayId}`}
                    >
                      <img
                        className="header__wave-img"
                        src="/wave.svg"
                        alt=""
                        width="26"
                        height="26"
                      />
                    </span>
                  )}
                </span>
              </span>
            </span>

            <Guard name="greeting-mark"><GreetingMark className="hello-hero__mark-art" helloLayer={<Guard name="hello-flip"><HelloFlipLayer store={helloFlip} ready={stage === "reveal"} reduce={reduce} /></Guard>} /></Guard>
          </h1>
          {/* the stretchy Hello's keyboard slider and its polite announcer: outside the h1 so the heading stays words */}
          <Guard name="hello-flip-control"><HelloFlipControl store={helloFlip} /></Guard>

          {/* Figma node 643:88426, frame "107" (07 Sep 2026, pin mtqremeh): the
              credentials paragraph is gone; the greeting keeps the two links
              under it and a five-row timeline sits in the right column. The rows
              carry the frame's copy verbatim, which is still placeholder text. */}
          {/* mtr4oc96: the two text links became four round chips (Figma
              664:107083): Resume, LinkedIn, then the theme and sound controls.
              Icon only at rest, label slides open on hover. See HeroChips.jsx. */}
          {/* mtr6evtb: the four chips moved to the top-right controls (App.jsx,
              placement="top"). mtu561mm brings the first two back here, in the
              shape they had before the chips: blue text with a north-east
              arrow, which says "this leaves the page" without a box. */}
          <div className="hello-hero__links">
            {LINKS.map((l, i) => (
              <HelloLink key={l.href} to={l.href} blank onNavigate={onNavigate} className="hello-hero__link hello-hero__link--out" style={{ "--i": i }}>
                <span>{l.label}</span>
                <svg className="hello-hero__link-ne" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                  <path d="M7 17 17 7" /><path d="M8 7h9v9" />
                </svg>
              </HelloLink>
            ))}
          </div>
        </div>
        {/* mtqrrd8r: the timeline uses the design system's list rows (the same
            .work / .work__item markup as the index's read mode) rather than a
            custom table. Static rows for now: no href on the frame. */}
        {/* mtqrtgd3: the rows are real links with the list's hover configs (arrow
            slides in, siblings dim); hrefs by organisation until the frame has its own */}
        <div className="hello-hero__table work work--timeline" role="list" aria-label="Timeline" data-calm>
          {TIMELINE.map((r, i) => {
            const Row = LOCKED.has(r.href) ? LockedLink : HelloLink; // mv58rul2: awaiting NDA approval, shown but not openable
            const rowProps = LOCKED.has(r.href) ? { badge: false } : { to: r.href, onNavigate };
            return (
            <Row {...rowProps} className="work__item" key={r.href} style={{ "--i": i }} data-project={r.href /* mv3mbvr7: shares one spotlight with the WorkGrid cards (useLinkedSpotlight.js) */}>
              <span className="work__main">
                <span className="work__year">{r.year}</span>
                <span className="work__title">
                  {r.org}
                  <svg className="work__arrow" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                    <path d="M7 17 17 7" />
                    <path d="M8 7h9v9" />
                  </svg>
                  {LOCKED.has(r.href) && <span className="lock__badge" aria-hidden><Lock width={14} height={14} strokeWidth={2} /></span>}
                </span>
              </span>
              <span className="work__meta">{r.line}</span>
            </Row>
            );
          })}
        </div>
      </section>

      {/* pin mtqremeh: the card grid from Figma 643:88426 replaces the phone marquee */}
      <Guard name="work-grid"><WorkGrid onNavigate={onNavigate} /></Guard>
      {/* mtqrs7rg: the path section moved above the timeline; mtqsskme: the
          timeline now lives INSIDE it as mode 2 */}
      <Guard name="along-path"><AlongPath reduce={reduce} modeTwo={<Timeline />} /></Guard>

      {/* New section (msbhsexa follow-up): work travelling a customisable path.
          /hello only for now, so /hello0 is unchanged. */}

      {/* Side quests: a Google Labs-style card carousel (annotation msb6bc99). */}
      {/* Side Quests is dropped from /hello (annotation msbwb4eq). The path
          marquee above now carries that title (msbnj2oh), so the page was
          running two sections under one name. /hello0 keeps it — it has no
          marquee section to take the job over. */}
      

      {/* The booth is no longer a section of its own: it IS the footer
          (annotation msb81jhs), and the room wrapper is gone too (msb8uck3), so
          the heading, the floor and the meta line are siblings here. */}
      {/* The WHOLE footer is the DJ console's hover target (annotation
          mscuenbz), not just its canvas. DjConsole looks for this attribute on
          an ancestor and listens there; without it, it falls back to its own
          canvas, so /dj and any other embed keep the tighter target. */}
      <footer className="hello-foot" data-revealed={footRevealed ? "true" : undefined} onPointerEnter={() => setFootRevealed(true)} data-dj-hover-root>
        {/* Two columns (annotation msb97rk4): the words on the left, the booth on
            the right. They stack on narrow screens. */}
        {/* mtqsrngi (QA): the footer had kept the OLD two-column markup
            (.hello-foot__inner > .hello-foot__text + booth) after /hello moved on
            to the single centred sign-off (.hello-foot__sign, msnxf3io) whose
            rules live in hello.css: illustration at the head, 48px gaps, centred
            title and contact rows. The illustration is the outline drawing
            (FootIllus, msd7x0nd), one asset for both themes, so the PNG pair and
            their theme swap are gone. */}
        <div className="hello-foot__sign" data-region="sign-off">
          {/* mu8n2vzn "move this up" - the SECOND pin on this heading with those
              exact words. The first (mtr7bs6s) I read as spacing and answered
              by halving the sign-off gap, 48 -> 24, which moves the line 24px
              and evidently was not it. Read as order instead, "up" is literal:
              the heading was under the figure and is now over it, which lifts
              it by the figure's height plus the gap, about 79px.

              It also reads better in that order. The line is an invitation, so
              it belongs before the thing that carries it out, and the bubbles
              end up next to the colophon, which groups how to reach me with
              where I am. */}
          <h2 className="hello-foot__title">
            You&rsquo;re welcome to say
            <br />
            {/* RESTORED (12 Oct 2026, Agam: "'hello' used to have an underline and a
                tooltip that opened up and showed the references"). This is the /hello
                page's own sign-off, never ported when this page became the root: the
                whole phrase is the hover / focus trigger (Escape closes, bottom sheet
                on phones), the dotted underline sits on "firm and cheery" (annotation
                msg4imvc narrowed it to the marked words), and the note says where the
                phrase comes from. COPY AS IT SHIPPED THERE, with its standing flag:
                the 1878 New Haven directory and the Edison / Bell dispute are well
                documented, but the exact wording is repeated more often than it is
                sourced, so Agam should check it before it goes further. */}
            <HelloNote
              title="Where the phrase comes from"
              body="The first telephone directory, New Haven 1878, told subscribers how to open a call, and what it recommended was a firm and cheery “hulloa”. Edison had pushed for “hello”; Bell wanted “ahoy”. Hello won."
            >
              a <span className="hnote__mark">firm and cheery</span>{" "}
              &lsquo;hello&rsquo;
            </HelloNote>
          </h2>
          {/* mtr6hqln (07 Sep 2026): the email and phone are two chat bubbles on
              the figure, either side of the head, above the heading. They are
              the same mailto/tel links the contact rows carried; the rows
              (ContactLines) are unmounted, not deleted. The figure's own
              thought bubble went in mtr6hepa, so these are the only bubbles. */}
          {/* mtr7bbw2: iMessage-shaped. Icon only at rest; the values slide
              open once the cursor reaches the sign-off block (or a bubble
              takes focus). Coarse pointers see them open. */}
          <div className="hello-foot__figure">
            {/* each message is a row: the bubble and, past its outer end, the
                copy button (mttjl6kj). The ROW carries the position the bubble
                used to, so the button lands beyond the bubble whatever its
                width, without knowing it. */}
            {/* mttkfbfm: the copy button lives INSIDE the bubble, as its last
                cell. A button cannot sit inside a link, so the bubble is a
                span; the link wraps icon, dots and text with display:
                contents, which keeps those three as cells of the bubble's
                own grid. */}
            <span className="hello-foot__msg hello-foot__msg--left">
              {/* mtu4yc5q: the bubble carries its own tooltip. The copy button inside
                  it has one too, and the delegated bubble reads the NEAREST
                  [data-tip] ancestor, so the button still says its own thing. */}
              <span className="hello-foot__bubble hello-foot__bubble--left" data-tip="Click to copy">
                <BubbleShape side="left" />
                <a className="hello-foot__bubble-link" href={`mailto:${EMAIL}`} aria-label={`Email ${EMAIL}`}>
                  <span className="hello-foot__bubble-icon"><Mail width={16} height={16} strokeWidth={1.7} aria-hidden /></span>
                  {/* mtry27ut: the typing indicator that plays before the text lands */}
                  <span className="hello-foot__bubble-dots" aria-hidden><i /><i /><i /></span>
                  <span className="hello-foot__bubble-text">{EMAIL}</span>
                </a>
                <CopyButton value={EMAIL} label="Copy email" side="left" />
              </span>
            </span>
            <Guard name="foot-illus"><FootIllus className="hello-foot__illus" /></Guard>
            <span className="hello-foot__msg hello-foot__msg--right">
              <span className="hello-foot__bubble hello-foot__bubble--right" data-tip="Click to copy">
                <BubbleShape side="right" />
                <a className="hello-foot__bubble-link" href={`tel:${PHONE_HREF}`} aria-label={`Call ${PHONE}`}>
                  <span className="hello-foot__bubble-icon"><Phone width={16} height={16} strokeWidth={1.7} aria-hidden /></span>
                  <span className="hello-foot__bubble-dots" aria-hidden><i /><i /><i /></span>
                  <span className="hello-foot__bubble-text">{PHONE}</span>
                </a>
                <CopyButton value={PHONE} label="Copy number" side="right" />
              </span>
            </span>
          </div>
        </div>
        {/* The location/role line is the last thing on the page (annotation
            msbcohp3): it sits below both columns rather than inside the text one,
            so it reads as the page's colophon rather than part of the sign-off. */}
        <div className="hello-foot__meta">
          <span>Bangalore, India</span>
          <span className="hello-foot__sep" aria-hidden>
            ·
          </span>
          <span>Interaction Designer</span>
          <span className="hello-foot__sep" aria-hidden>
            ·
          </span>
          {/* the year is a real fact, so it comes from the clock rather than
              being typed in and going stale next January */}
          <span>&copy; {new Date().getFullYear()}</span>
        </div>
      </footer>
      {/* the scene's ending (2026-09-27, Agam): past the contact section the camera
          pulls back out of the monitor to the opening framing, the contact section
          left on the screen (useWindowScene endRun) */}
      {/* endRun is off for now: a zero-height marker keeps the hook's second runway
          ref (restore the class hello-scene-end with the ending) */}
      {sceneWindow && <div className="hello-scene-end hello-scene-end--off" ref={sceneRun2} aria-hidden />}
      {!sceneWindow && <Guard name="site-cursor"><SiteCursor /></Guard>}
    </div>
  );
}
