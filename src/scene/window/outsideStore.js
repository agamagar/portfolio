// What the window shows outside, chosen from the header (SceneControls.jsx, Agam
// 2026-09-30: "add a control at the top to change the scene outside"): the weather
// (live, or one of weatherBridge's presets) and the time (now, or a fixed hour).
// Not remembered across visits on purpose: a reload comes back to the live sky, so a
// visitor is never left looking at a storm they picked last week. A ?wx= or ?tod= in
// the URL pins the scene and wins over this.

const subs = new Set();
let current = { wx: "live", tod: null };

export const WEATHERS = [
  { id: "live", label: "Live", hint: "Today's sky, from the weather feed" },
  { id: "clear", label: "Clear", hint: "A clean blue sky" },
  { id: "partly", label: "Partly cloudy", hint: "Broken cloud, sun through it" },
  { id: "overcast", label: "Overcast", hint: "A flat, soft grey" },
  { id: "rain", label: "Rain", hint: "Monsoon rain, wet glass" },
  { id: "storm", label: "Storm", hint: "Thunder, heavy rain, gusts" },
];
export const TIMES = [
  { id: "now", label: "Now", tod: null },
  { id: "morning", label: "Morning", tod: 9 },
  { id: "golden", label: "Golden hour", tod: 17.3 },
  { id: "dusk", label: "Dusk", tod: 18.6 },
  { id: "night", label: "Night", tod: 22 },
];

export function getOutside() {
  return current;
}
export function setOutside(patch) {
  current = { ...current, ...patch };
  subs.forEach((fn) => fn(current));
  return current;
}
export function subscribeOutside(fn) {
  subs.add(fn);
  return () => subs.delete(fn);
}
