// The hero's mascot morph and the room hand-over take turns (2026-10-11): the room's
// warm-up captures the landing page for its monitor, and a capture taken mid-morph
// would put the line drawing on the monitor while the page shows the clay head. So
// the capture waits for the morph to settle: played, shown still, or given up on.
// Tiny and not lazy, so Hello3 can wait on it without loading the morph.
let settle;
export const heroMorphSettled = new Promise((r) => (settle = r));
export const settleHeroMorph = () => settle();
// never let the room wait on it for long (a stalled GLB, a tab in the background)
export const heroMorphSettledOrTimeout = (ms = 12000) =>
  Promise.race([heroMorphSettled, new Promise((r) => setTimeout(r, ms))]);
