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
