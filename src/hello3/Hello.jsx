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
import { Check, Copy, Mail, Phone } from "iconoir-react";
import { useReducedMotion } from "../figures/ds/hooks";
import { fetchSky, sunUniforms } from "../lib/weather";
import { useIntroStage } from "./useStage";
import { useFlight } from "./useFlight";
import { getLenis } from "../ui/smoothScroll";
import { ALSO, BRAND_SHINE, CREDENTIALS, GREETING, ROLES } from "./helloData";
import RoleTooltip from "./RoleTooltip";
import GreetingMark from "./GreetingMark";
import HelloLink from "./HelloLink";
import { LINKS } from "../hello/helloData";
import HeroChips from "./HeroChips"; // eslint-disable-line no-unused-vars -- hero row parked (mtr6evtb), see the comment in the hero
import PhoneMarquee from "./PhoneMarquee"; // eslint-disable-line no-unused-vars -- replaced by WorkGrid (pin mtqremeh), kept for the swap back
import WorkGrid from "./WorkGrid";
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
import SkyTip from "../hello/SkyTip";
import AlongPath from "./AlongPath";
import DjBooth from "./DjBooth";
// WebGL, so it is lazy and never blocks first paint. The CSS band underneath is
// the fallback when WebGL is unavailable or the chunk has not landed yet.
const ShaderCanvas = lazy(() => import("../ShaderCanvas"));
import { LIVING_SKY_DEFAULTS } from "../shaders/washes";
import "../hello/hello.css";
// NOT importing ../figures/ds/tokens.css here (mttji8hf): it carries an
// @import of the Anek Gujarati variable font for the DS figures, which the
// landing has no use for. The top pill is written against the DS tokens with
// each token's literal as its fallback, so it renders the system's values
// (popup #1f1f22, popup text #f3f3f3, focus ring, state duration) unchanged.
import "./hello3.css";
// The window scene (three r186), behind ?scene=window until approved: see
// src/scene/window/WindowSceneFolio.jsx and tools/window-light/spec/30-locked-brief.md.
const WindowSceneFolio = lazy(() => import("../scene/window/WindowSceneFolio"));

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
const TIMELINE = [
  { year: "2025", org: "Zepto", line: "Scheduling on a 10-minute platform", href: "/work/scheduled-delivery" },
  { year: "2026", org: "Away", line: "An agent that never takes the wheel", href: "/work/away-agent" },
  { year: "2026", org: "Zepto", line: "The half of cross-sell nobody solved", href: "/work/cross-sell" },
  { year: "2023", org: "CaratLane", line: "E-commerce for a jewelry brand" /* mtqs7lcx: shorter */, href: "/list" },
  { year: "2019", org: "Toppr", line: "Joyful learning experiences for students", href: "/work/toppr" },
];

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
  const sceneAllowed = useMemo(() => typeof window !== "undefined" && windowSceneOn(), []);
  const sceneDirect = useMemo(() => {
    if (typeof window === "undefined") return false;
    const q = new URLSearchParams(window.location.search);
    return q.get("scene") === "window" || q.has("capture");
  }, []);
  const [sceneLive, setSceneLive] = useState(sceneDirect);
  const sceneWindow = sceneAllowed && sceneLive;
  // the warm-up: idle | loading | ready | failed; drives the loader pill
  const [warmState, setWarmState] = useState("idle");
  const [atTop, setAtTop] = useState(true);
  useEffect(() => {
    if (!sceneAllowed || sceneLive) return undefined;
    let alive = true, lastScroll = 0, idleId = 0, timer = 0;
    const onScroll = () => {
      lastScroll = performance.now();
      setAtTop(window.scrollY < 8);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    // start only when the page has settled and nobody is scrolling it
    const startWhenStill = () => {
      if (!alive) return;
      if (performance.now() - lastScroll < 500) {
        timer = setTimeout(startWhenStill, 400);
        return;
      }
      setWarmState("loading");
      Promise.all([import("../scene/window/sceneWarm.js"), import("../scene/window/capture.js"), import("../scene/window/WindowSceneFolio")])
        .then(async ([{ warmScene, prepareWarmScene }, { parseCaptureParams }]) => {
          if (!alive) return false;
          const opts = parseCaptureParams(window.location.search);
          const ok = await warmScene({ opts, theme: document.documentElement.classList.contains("dark") ? "dark" : "light" });
          // the room is only "ready" once the monitor carries the live page too, so the
          // hand-over has nothing left to wait for (sceneWarm.js prepareWarmScene); a
          // failed capture still hands over (the page captures it the old way)
          if (ok && alive) await prepareWarmScene().catch(() => false);
          return ok;
        })
        .then((ok) => alive && setWarmState(ok ? "ready" : "failed"))
        .catch(() => alive && setWarmState("failed"));
    };
    const kick = () => (timer = setTimeout(startWhenStill, 600));
    if (document.readyState === "complete") idleId = window.requestIdleCallback ? window.requestIdleCallback(kick, { timeout: 2000 }) : setTimeout(kick, 800);
    else window.addEventListener("load", kick, { once: true });
    return () => {
      alive = false;
      clearTimeout(timer);
      if (idleId && window.cancelIdleCallback) window.cancelIdleCallback(idleId);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("load", kick);
    };
  }, [sceneAllowed, sceneLive]);
  // The pill comes up 3 s after the page has loaded (Agam, 2026-10-07: "setting up the
  // pill should appear 3 seconds after page has loaded"), not with the first paint. On
  // a visit to another page first, it counts from when this page appears
  const [pillDue, setPillDue] = useState(false);
  useEffect(() => {
    if (!sceneAllowed || sceneLive) return undefined;
    let timer = 0;
    const arm = () => {
      // from the load event itself (this page can mount a little after it), or from now
      // when the load was long before
      const nav = performance.getEntriesByType?.("navigation")?.[0];
      const now = performance.now();
      const loadedAt = nav?.loadEventEnd > 0 ? nav.loadEventEnd : now;
      const wait = now - loadedAt > 3000 ? 3000 : loadedAt + 3000 - now;
      timer = setTimeout(() => setPillDue(true), Math.max(0, wait));
    };
    if (document.readyState === "complete") arm();
    else window.addEventListener("load", arm, { once: true });
    return () => {
      clearTimeout(timer);
      window.removeEventListener("load", arm);
    };
  }, [sceneAllowed, sceneLive]);
  // THE CUE (2026-10-05, Agam: "when the room is set up give a cue that the page will
  // transition in 5 sec, with an option to cancel, and do a seamless transition"): once
  // the room is ready the pill counts down from 5 with a Cancel button. The count only
  // runs while the reader is at the top (it holds if they scroll away, and resumes when
  // they come back). Cancel leaves the page as it is, with an "Enter the room" button.
  // It waits for the pill to be up, so the room never takes over unannounced.
  const [countdown, setCountdown] = useState(null);
  const [cancelled, setCancelled] = useState(false);
  const [entering, setEntering] = useState(false);
  useEffect(() => {
    if (!sceneAllowed || sceneLive || cancelled || !pillDue || warmState !== "ready") return undefined;
    setCountdown((c) => (c == null ? 5 : c));
    const t = setInterval(() => {
      if (window.scrollY >= 8) return; // hold while they are reading further down
      setCountdown((c) => (c == null ? 5 : Math.max(0, c - 1)));
    }, 1000);
    return () => clearInterval(t);
  }, [sceneAllowed, sceneLive, cancelled, pillDue, warmState]);
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
    // scrolled away while it waited: the count holds until they are back at the top
    if (enteringRef.current || window.scrollY >= 8) return;
    enteringRef.current = true;
    setEntering(true);
    const reduceNow = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    document.documentElement.classList.add("wscene-sky-out", "wscene-handover");
    getLenis()?.stop(); // from here to the room, wheel input is swallowed
    setTimeout(() => setSceneLive(true), reduceNow ? 0 : 460);
  }, []);
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
  useEffect(() => {
    if (countdown === 0 && atTop && !entering && !sceneLive && !cancelled) enterScene();
  }, [countdown, atTop, entering, sceneLive, cancelled, enterScene]);
  // a page that leaves before the hand-over drops its warm engine
  useEffect(
    () => () => {
      if (!sceneLiveRef.current) import("../scene/window/sceneWarm.js").then(({ dropWarmScene }) => dropWarmScene());
    },
    []
  );
  const sceneLiveRef = useRef(sceneLive);
  sceneLiveRef.current = sceneLive;
  const sceneRun1 = useRef(null);
  const sceneRun2 = useRef(null);
  const heroRef = useRef(null);
  const reduce = useReducedMotion();
  const { stage, skip } = useIntroStage(rootRef, { off: sceneWindow });
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
    <div className="hello" ref={rootRef} data-page="3" data-stage={stage} data-reduce={reduce ? "true" : undefined} data-waving={waving ? "true" : undefined} data-scene={sceneWindow ? "window" : undefined}>
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
        <Suspense fallback={null}>
          <WindowSceneFolio run1Ref={sceneRun1} run2Ref={sceneRun2} heroRef={heroRef} />
        </Suspense>
      )}
      {!sceneWindow && (
      <div className="hello-sky" aria-hidden>
        <div className="hello-sky__lens">
          <Suspense fallback={null}>
            <ShaderCanvas
              preset="livingSky"
              className="hello-sky__canvas"
              uniforms={skyUniforms}
              clock
              clockOffsetSeconds={sky?.offset ?? null}
              tod={pinnedTod}
              superSample={SKY_NARROW ? 0.55 : 1}
            />
          </Suspense>
        </div>
      </div>
      )}

      {/* the weather tooltip over the bare sky, as on /hello (was the
          mtqt7wsl/mtqtcc6f status bar in the top controls until 07 Sep 2026) */}
      {!sceneWindow && <SkyTip />}
      {/* the room's loader (2026-10-05): a quiet pill at the bottom while the scene warms
          behind the page; once it is ready, if the reader is further down, it offers the
          way back up (at the top the hand-over is automatic) */}
      {/* shown 3 s after the page has loaded (pillDue; was from the load itself, 2026-10-05);
          the warm-up itself still waits for an idle page */}
      {sceneAllowed && pillDue && !sceneLive && !entering && warmState !== "failed" && (
        <div className="wscene-warm-pill" role="status" aria-live="polite">
          {warmState === "idle" || warmState === "loading" ? (
            <>
              Setting up the room
              <span className="wscene-nudge__dots" aria-hidden="true"><i /><i /><i /></span>
            </>
          ) : cancelled ? (
            <button type="button" onClick={() => { window.scrollTo({ top: 0, behavior: "smooth" }); setCancelled(false); setCountdown(0); }}>
              Enter the room
            </button>
          ) : !atTop ? (
            <button type="button" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>
              The room is ready, back to the top
            </button>
          ) : (
            <>
              <span>Entering the room in {countdown ?? 5}</span>
              <button type="button" className="wscene-warm-pill__cancel" onClick={() => { setCancelled(true); setCountdown(null); }}>
                Cancel
              </button>
            </>
          )}
        </div>
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
          <h1 className="hello-hero__greet" onClick={stage === "reveal" ? undefined : skip} data-calm>
            {/* The words, for anything that reads rather than looks. The mark
                below is outlines and carries no text at all, so this is the only
                place the greeting exists as language. */}
            <span className="hello-hero__sr">{GREETING.join(" ")}</span>

            <span className="hello-hero__badge" aria-hidden>
              {/* The index page's avatar markup, verbatim: the same MorphFace
                  component and the same `.header__wave` hand on the same
                  `.header__avatar-wrap` frame, so the sequence and its geometry
                  are the page's own rather than a reconstruction of it.
                  This element is the traveller — it starts in the middle of the
                  viewport and ends here, and there is only ever one of it. */}
              <span className="hello-hero__flyer" ref={flyerRef}>
                <span className="header__avatar-wrap" onMouseEnter={replayGreeting}>
                  <MorphFace key={`face-${replayId}`} />
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

            <GreetingMark className="hello-hero__mark-art" />
          </h1>

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
          {TIMELINE.map((r, i) => (
            <HelloLink to={r.href} onNavigate={onNavigate} className="work__item" key={i} style={{ "--i": i }}>
              <span className="work__main">
                <span className="work__year">{r.year}</span>
                <span className="work__title">
                  {r.org}
                  <svg className="work__arrow" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                    <path d="M7 17 17 7" />
                    <path d="M8 7h9v9" />
                  </svg>
                </span>
              </span>
              <span className="work__meta">{r.line}</span>
            </HelloLink>
          ))}
        </div>
      </section>

      {/* pin mtqremeh: the card grid from Figma 643:88426 replaces the phone marquee */}
      <WorkGrid onNavigate={onNavigate} />
      {/* mtqrs7rg: the path section moved above the timeline; mtqsskme: the
          timeline now lives INSIDE it as mode 2 */}
      <AlongPath reduce={reduce} modeTwo={<Timeline />} />

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
            a firm and cheery &lsquo;hello&rsquo;
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
                <a className="hello-foot__bubble-link" href={`mailto:${EMAIL}`} aria-label={`Email ${EMAIL}`}>
                  <span className="hello-foot__bubble-icon"><Mail width={16} height={16} strokeWidth={1.7} aria-hidden /></span>
                  {/* mtry27ut: the typing indicator that plays before the text lands */}
                  <span className="hello-foot__bubble-dots" aria-hidden><i /><i /><i /></span>
                  <span className="hello-foot__bubble-text">{EMAIL}</span>
                </a>
                <CopyButton value={EMAIL} label="Copy email" side="left" />
              </span>
            </span>
            <FootIllus className="hello-foot__illus" />
            <span className="hello-foot__msg hello-foot__msg--right">
              <span className="hello-foot__bubble hello-foot__bubble--right" data-tip="Click to copy">
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
    </div>
  );
}
