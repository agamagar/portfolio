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

import { createWindowEngine } from "./engine.js";

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

export function warmScene({ opts, theme }) {
  if (warm) return warm.ready;
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
  const engine = createWindowEngine({ canvas, opts: { ...opts, gate: quietMoment }, theme });
  const ready = Promise.resolve(engine.ready)
    .then((ok) => {
      if (warm) warm.ok = !!ok;
      engine.setActive(false); // warmed: nothing draws until the page takes it
      return !!ok;
    })
    .catch(() => {
      if (warm) warm.ok = false;
      return false;
    });
  warm = { host, canvas, engine, ready, ok: null };
  return ready;
}

// The warm canvas and engine, once, for useWindowScene to adopt (null if there is
// none, or it failed: then the page builds its own the old way). poster: the live
// capture of the page already on the monitor (prepareWarmScene), with the viewport
// size it was made for.
export function takeWarmScene() {
  const w = warm;
  if (!w || !w.ok) return null;
  warm = null;
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

export async function prepareWarmScene() {
  if (!warm || !warm.ok) return false;
  const w = warm;
  const { engine } = w;
  const vw = window.innerWidth, vh = window.innerHeight;
  await quietMoment();
  engine.resize(vw, vh);
  for (const patch of folioParams(FOLIO)) {
    await quietMoment();
    await engine.setParams(patch);
  }
  if (warm !== w) return false;
  w.folio = { ...FOLIO };
  const rect = engine.screenRectAt(1);
  const root = document.querySelector(".hello");
  if (!rect || !root) return false;
  const dark = document.documentElement.classList.contains("dark");
  await quietMoment(); // the capture is ~0.7 s of main-thread work: never mid-scroll
  const { captureLanding } = await import("./livePoster.js");
  // the landing is the document's top on the plain page (no runway above it)
  const runway = { getBoundingClientRect: () => ({ bottom: -window.scrollY }) };
  const top = await captureLanding({
    root,
    runway,
    rect,
    bg: dark ? "#0e0e11" : "#ffffff",
    dpr: window.devicePixelRatio || 1,
    skip: ["hello-sky", "hello-sky__tip", "wscene-warm-pill"],
  });
  if (!top || warm !== w) return false;
  engine.setPoster(top, dark ? "dark" : "light");
  w.poster = top;
  w.posterSize = `${vw}x${vh}`;
  // prime the full-size path, hidden: frames along the pull-out (inside the screen out
  // to the room) allocate every full-size target and draw what the camera will see, one
  // quiet moment at a time; it ends parked on the first frame of the hand-over (p = 1)
  for (const p of [0.5, 0.75, 0.9, 0.97, 1]) {
    await quietMoment();
    if (warm !== w) return false;
    engine.setScroll(p, 0);
    await engine.renderOnce();
  }
  return true;
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
