// The window scene, warmed up behind the page (Agam, 2026-10-05: "always open the
// main portfolio screen, not the three.js version, then show a loader at the bottom
// and transition to the scene only when ready, optimised for scrolling").
//
// The folio page opens as the plain portfolio. Once the page is idle, warmScene()
// builds the engine on a TINY hidden canvas (64 x 40 CSS px, invisible, behind
// everything): the scene, its materials and every render pipeline are built and
// compiled exactly as for the real view (engine.ready: the warm frames, the first
// sky reading, the settle frames), but at a tiny size, so the GPU work of warming
// costs almost nothing and the page keeps scrolling smoothly. The engine's own warm-up
// is already spread over frames (WARM_BUDGET_MS in engine.js).
//
// When it is ready, the page hands over (Hello.jsx: a scroll out of the screen into
// the room): useWindowScene adopts the warm canvas and engine (takeWarmScene) instead
// of building its own and resizes it to the viewport. Nothing is compiled twice.

import { createWindowEngine, POSTERS } from "./engine.js";
import { landingPosterUrl } from "./landingPoster.js";
import { setWarmReady } from "./warmFlag.js";

let warm = null; // { host, canvas, engine, ready: Promise<boolean>, ok }

// A quiet moment: resolves once nobody has scrolled, wheeled, clicked, touched or typed
// for QUIET_MS. Every heavy step of the warm-up waits on it (the engine's build and
// each compile batch via opts.gate, the page capture below), so main-thread work never
// lands mid-scroll (2026-10-05: "page freezes / stutters" while setting up the room:
// a 0.8 s build, compile batches and a 0.7 s capture, measured with long-task timing)
const QUIET_MS = 700;
let lastInput = 0;
if (typeof window !== "undefined") {
  const mark = () => (lastInput = performance.now());
  for (const ev of ["scroll", "wheel", "pointerdown", "keydown", "touchstart"]) window.addEventListener(ev, mark, { passive: true, capture: true });
}
export function quietMoment() {
  return new Promise((resolve) => {
    const check = () => {
      const wait = QUIET_MS - (performance.now() - lastInput);
      if (wait <= 0) requestAnimationFrame(() => resolve());
      else setTimeout(check, Math.min(wait + 20, 400));
    };
    check();
  });
}

// THE WARM-UP'S HEARTBEAT (2026-10-13, the live site: "the room doesn't load on any
// device"): the page's watchdog (Hello.jsx) used to give a queued click a fixed 10 s
// (ready) or 45 s (loading) and then drop the warm room and start again. The click's
// poster refresh (refreshWarmPoster: the media in the band, the fonts, the page's DOM
// render) is instant on the dev server but fetches every image and clip from the CDN
// on the live site, so it ran past 10 s, the watchdog threw away the finished room the
// hand-over was about to enter, and the fresh warm-up then hit the 45 s limit too:
// "The room didn't load". Every step of the warm-up and of the poster refresh now beats
// here (each gated step, each compile batch, each asset the capture embeds), and the
// watchdog only steps in when nothing has moved for its whole window: slow is not stuck.
let beat = 0;
const pulse = () => (beat = performance.now());
export const warmBeat = () => beat;
const step = () => quietMoment().then(pulse);

// The room's service worker (public/sw.js): registered once the warm-up begins (the home page
// is idle by then), told which room files to store so the click finds them on disk. Production
// only (the dev server's files change under it). Never blocks, never throws.
function registerRoomCache(theme) {
  try {
    if (!import.meta.env.PROD || !("serviceWorker" in navigator)) return;
    const urls = [
      landingPosterUrl({ w: window.innerWidth, h: window.innerHeight, theme, search: window.location.search }),
      POSTERS.light,
      POSTERS.dark,
    ];
    navigator.serviceWorker
      .register("/sw.js")
      .then(() => navigator.serviceWorker.ready)
      .then((reg) => reg.active?.postMessage({ type: "precache", urls }))
      .catch(() => {});
  } catch {
    /* no service worker here */
  }
}

export function warmScene({ opts, theme }) {
  if (warm) return warm.ready;
  pulse();
  performance.mark("room:warm-start");
  registerRoomCache(theme);
  const host = document.createElement("div");
  host.className = "wscene__warm";
  host.setAttribute("aria-hidden", "true");
  // tiny, invisible, behind everything, never in the way of the page
  Object.assign(host.style, { position: "fixed", left: "0", top: "0", width: "64px", height: "40px", opacity: "0", pointerEvents: "none", zIndex: "-1", overflow: "hidden" });
  const canvas = document.createElement("canvas");
  canvas.className = "wscene__canvas";
  canvas.setAttribute("aria-hidden", "true");
  host.appendChild(canvas);
  document.body.appendChild(host);
  const engine = createWindowEngine({ canvas, opts: { ...opts, gate: step }, theme });
  const ready = Promise.resolve(engine.ready)
    .then((ok) => {
      pulse();
      if (warm) warm.ok = !!ok;
      engine.setActive(false); // warmed: nothing draws until the page takes it
      if (ok && warm) watchLoss(warm);
      return !!ok;
    })
    .catch(() => {
      if (warm) warm.ok = false;
      return false;
    });
  warm = { host, canvas, engine, ready, ok: null };
  return ready;
}

// THE GPU CAN TAKE THE ROOM BACK (Agam: "if I click View after a long time on the home page,
// the three.js view gets stuck on the load and never really comes into view"): after a long
// idle, a sleep, a GPU reset or the browser trimming a background tab, the WebGPU device (or
// the WebGL context) is lost. The warm room was kept in memory regardless, nothing noticed,
// and the hand-over went into a dead renderer: a blank screen with the "scroll" floater.
// A loss now drops the warm room at once and tells the page (the `wscene-warm-lost` event,
// Hello.jsx), which warms a fresh one; warmAlive() lets the click check before it trusts it.
function watchLoss(w) {
  const lose = () => {
    if (warm !== w || w.dead) return;
    w.dead = true;
    dropWarmScene();
    window.dispatchEvent(new Event("wscene-warm-lost"));
  };
  w.canvas.addEventListener("webglcontextlost", (e) => {
    e.preventDefault?.();
    lose();
  });
  try {
    w.engine.renderer?.backend?.device?.lost?.then(lose);
  } catch {
    /* no WebGPU device to watch */
  }
}
export const warmAlive = () => !!warm && warm.ok === true && !warm.dead;

// The warm canvas and engine, once, for useWindowScene to adopt (null if there is
// none, or it failed: then the page builds its own the old way). poster: the live
// capture of the page already on the monitor (prepareWarmScene), with the viewport
// size it was made for.
export function takeWarmScene() {
  const w = warm;
  if (!w || !w.ok) return null;
  warm = null;
  setWarmReady(false);
  w.host.remove(); // the canvas moves into the page's own host
  return { canvas: w.canvas, engine: w.engine, poster: w.poster || null, posterSize: w.posterSize || null, folio: w.folio || null };
}

// THE DEEP FIX (2026-10-05, "the transition is still breaking"): everything the
// hand-over needs is done HERE, while the reader is still on the plain page, so the
// hand-over itself has nothing left to wait for and nothing heavy to run. A recording
// showed the old order: the layout switched, then the monitor's live page capture (a
// DOM-to-image render of the whole page, seconds of main-thread work) started, and
// the page sat at the end of the runway until it finished, then scrolled while it was
// still being redone. Now: the warm engine's drawing buffer goes to the viewport's
// size (the canvas stays hidden), the screen's rect at p = 1 is measured, and the
// landing is captured from the plain page itself (its sky, its tooltip and the pill
// skipped) and set on the monitor. useWindowScene adopts the poster with the engine.
// The folio page's own settings (WindowSceneFolio: pFrom 0.5, sweepDeg -5), applied here
// so the capture's screen rect and the primed frames are exactly the page's, and
// useWindowScene can skip re-applying them at the hand-over (each one re-renders the sky)
export const FOLIO = { pFrom: 0.5, sweepDeg: -5 };
export function folioParams({ pFrom, sweepDeg }) {
  return [
    sweepDeg ? { camera: { sweep: { deg: sweepDeg, from: pFrom, to: 1 } } } : null,
    { camera: { folio: { focusScreen: true, bokeh: 0.5 } } },
    { post: { handoff: { toPage: true, page: { from: 0, to: 0.001 } } } },
  ].filter(Boolean);
}

// The landing capture itself: the warm engine at the viewport's size, the screen's rect
// at p = 1 measured, the plain page's top captured and set on the monitor. Used once at
// warm-up (prepareWarmScene) and again at the click (refreshWarmPoster).
async function capturePoster(w) {
  const { engine } = w;
  const vw = window.innerWidth, vh = window.innerHeight;
  await step();
  engine.resize(vw, vh);
  const rect = engine.screenRectAt(1);
  const root = document.querySelector(".hello");
  if (!rect || !root) return false;
  const dark = document.documentElement.classList.contains("dark");
  await step(); // the capture is ~0.7 s of main-thread work: never mid-scroll
  const { captureLanding } = await import("./livePoster.js");
  // the landing is the document's top on the plain page (no runway above it)
  const runway = { getBoundingClientRect: () => ({ bottom: -window.scrollY }) };
  const top = await captureLanding({
    root,
    runway,
    rect,
    bg: dark ? "#0e0e11" : "#ffffff",
    dpr: window.devicePixelRatio || 1,
    skip: ["hello-sky", "hello-sky__tip", "wscene-warm-pill", "sc"],
    onProgress: pulse,
  });
  if (!top || warm !== w) return false;
  engine.setPoster(top, dark ? "dark" : "light");
  w.poster = top;
  w.posterSize = `${vw}x${vh}`;
  return true;
}

export async function prepareWarmScene() {
  if (!warm || !warm.ok) return false;
  const w = warm;
  const { engine } = w;
  await step();
  engine.resize(window.innerWidth, window.innerHeight);
  for (const patch of folioParams(FOLIO)) {
    await step();
    await engine.setParams(patch);
  }
  if (warm !== w) return false;
  w.folio = { ...FOLIO };
  if (!(await capturePoster(w))) return false;
  // prime the full-size path, hidden: frames along the pull-out (inside the screen out
  // to the room) allocate every full-size target and draw what the camera will see, one
  // quiet moment at a time; it ends parked on the first frame of the hand-over (p = 1)
  for (const p of [0.5, 0.75, 0.9, 0.97, 1]) {
    await step();
    if (warm !== w) return false;
    engine.setScroll(p, 0);
    await engine.renderOnce();
  }
  pulse();
  performance.mark("room:prepared");
  setWarmReady(true); // a page that remounts later finds the room ready (warmFlag.js)
  return true;
}

// At the click (Hello.jsx): the monitor's copy of the page is retaken from the page as it
// is NOW. The one made at warm-up can be old (before a layout change, a resize, a return
// visit to the page, the cards' own animation), and the hand-over dissolves from the live
// page to that copy, so a stale one showed as the page "gliding back" to an older state
// (Agam, 2026-10-11). Resolves false (the old copy stays) if there is nothing to retake.
export async function refreshWarmPoster() {
  const w = warm;
  if (!w || !w.ok || !w.folio) return false;
  const ok = await capturePoster(w).catch(() => false);
  if (ok && warm === w) {
    w.engine.setScroll(1, 0); // parked on the hand-over's first frame again
    await w.engine.renderOnce();
  }
  return ok;
}

// Drop a warm engine that will never be used (the page left before the hand-over).
export function dropWarmScene() {
  if (!warm) return;
  try {
    warm.engine.dispose();
  } catch {
    /* already gone */
  }
  warm.host.remove();
  warm = null;
  setWarmReady(false);
}

// Give an adopted canvas and engine back to the warm slot instead of disposing them
// (useWindowScene's cleanup). React's StrictMode mounts every effect twice in
// development: without this the first mount adopted the warm engine, the dev-only
// remount disposed it, and the second built a fresh one, showing the static poster and
// a full compile in the middle of the hand-over. A real unmount is covered too: a
// returned engine nobody takes again within 3 s is disposed.
export function returnWarmScene({ canvas, engine, poster = null, posterSize = null, folio = null }) {
  if (warm) {
    // a slot already filled: this one is surplus
    try { engine.dispose(); } catch { /* gone */ }
    canvas.remove();
    return;
  }
  const host = document.createElement("div");
  host.className = "wscene__warm";
  host.setAttribute("aria-hidden", "true");
  Object.assign(host.style, { position: "fixed", inset: "0", opacity: "1", pointerEvents: "none", zIndex: "0" });
  host.appendChild(canvas); // keeps drawing where it was, so a remount takes it seamlessly
  document.body.appendChild(host);
  // the live page on its monitor comes back with it (lost here, the hand-over waited
  // for a capture that never came)
  const mine = { host, canvas, engine, ready: Promise.resolve(true), ok: true, poster, posterSize, folio };
  warm = mine;
  setTimeout(() => {
    if (warm === mine) dropWarmScene();
  }, 3000);
}
