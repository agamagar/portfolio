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

// RAM: the warm room (renderer, ~50 textures, hundreds of geometry buffers, ~150-200 MB) used to
// stay alive for the whole tab, also while the reader sat on a case study. Hello3 schedules a drop
// when it unmounts and cancels it on mount; a return within the grace finds the room still warm
// (room-cache's instant path), a longer stay frees it and the next visit warms a fresh one.
// Lives here, not in sceneWarm.js, so the home page never imports the engine to arm it.
let dropper = null;
let dropTimer = 0;
export const setWarmDropper = (fn) => { dropper = fn; };
export function cancelWarmDrop() {
  clearTimeout(dropTimer);
  dropTimer = 0;
}
export function scheduleWarmDrop(ms = 45000) {
  cancelWarmDrop();
  if (!dropper) return; // the room was never warmed here
  dropTimer = setTimeout(() => { dropTimer = 0; dropper?.(); }, ms);
}
