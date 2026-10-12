// Whether the room is already warmed and prepared in this tab (sceneWarm.js sets it),
// readable WITHOUT importing the engine: Hello3 reads it on mount, so a visitor who goes
// to another page and comes back (same visit) gets "The room is ready" at once, with no
// loader (annotation mv3v3k00-o9in87).
// The theme it was captured in is kept too: a page captured in the other theme is not
// ready (the monitor would show the wrong page), so a remount warms it again.
let readyTheme = null;
const themeNow = () => (typeof document !== "undefined" && document.documentElement.classList.contains("dark") ? "dark" : "light");
export const warmIsReady = () => readyTheme !== null && readyTheme === themeNow();
export const setWarmReady = (v) => {
  readyTheme = v ? themeNow() : null;
};

// ---- the warm-up's progress, for the pill's countdown (Agam: "take away the text and change it
// to a countdown", from REAL progress, not a fake timer). sceneWarm.js reports the stages it
// actually runs; each stage's typical duration is learned (a moving average kept in
// localStorage, so a cached or fast visit counts down from a smaller number) and the seconds
// left are the unfinished stages' typical time, less what the running stage has already
// used. The shown number only ever goes down and holds at 1 if a stage runs long, never negative
// or back up.
const STAGES = ["load", "build", "params", "capture", "prime"];
const DEFAULT_MS = { load: 1500, build: 3500, params: 600, capture: 1500, prime: 1200 };
const STORE_KEY = "wscene-warm-stage-ms";
let typical = { ...DEFAULT_MS };
try {
  const saved = JSON.parse(localStorage.getItem(STORE_KEY) || "null");
  if (saved) for (const k of STAGES) if (Number.isFinite(saved[k])) typical[k] = Math.min(30000, Math.max(200, saved[k]));
} catch {
  /* storage blocked: the defaults */
}
let started = {}; // stage -> performance.now() when it began
let finished = {}; // stage -> true
let shown = null; // the last number shown (monotone)
export function resetWarmStages() {
  started = {};
  finished = {};
  shown = null;
}
export function warmStageStart(name) {
  started[name] = performance.now();
}
export function warmStageEnd(name) {
  if (started[name] == null || finished[name]) return;
  finished[name] = true;
  const took = performance.now() - started[name];
  typical[name] = Math.min(30000, Math.max(200, typical[name] * 0.5 + took * 0.5));
  try {
    localStorage.setItem(STORE_KEY, JSON.stringify(typical));
  } catch {
    /* storage blocked */
  }
}
// whole seconds left, 1 or more
export function warmSecondsLeft() {
  const now = performance.now();
  let ms = 0;
  for (const s of STAGES) {
    if (finished[s]) continue;
    ms += started[s] != null ? Math.max(0, typical[s] - (now - started[s])) : typical[s];
  }
  const n = Math.max(1, Math.ceil(ms / 1000));
  shown = shown == null ? n : Math.min(shown, n);
  return shown;
}
