// The folio page's landing poster (2026-09-27, Agam): a still of the scene's opening
// frame shown at once, while the engine starts; the live canvas crossfades over it on
// ready. One still per screen shape x time of day x theme, rendered from the real page
// (public/window-scene/landing/, the scratchpad posters.mjs renderer: WebKit, page
// chrome hidden, ?tod= pinned, wx=clear).

import { getSkyMode, MINE_OFFSET } from "../../lib/weather.js";

// [name, width / height] of each rendered viewport
const SHAPES = [
  ["21x9", 2520 / 1080],
  ["16x9", 1920 / 1080],
  ["16x10", 1728 / 1080],
  ["4x3", 1440 / 1080],
  ["3x4", 810 / 1080],
  ["phone", 390 / 844],
];

// the renders were pinned at day 10.5, golden 17.3, dusk 18.5, night 21 (hours)
function todBucket(h) {
  if (h >= 5.5 && h < 16.5) return "day";
  if (h >= 16.5 && h < 18.1) return "golden";
  if (h >= 18.1 && h < 19.25) return "dusk";
  return "night";
}

// the hour the scene's sky will use: ?tod= wins, then the sky mode (mine = Agam's
// Bangalore, yours = the visitor's clock)
function skyHour(search) {
  const tod = parseFloat(new URLSearchParams(search).get("tod"));
  if (Number.isFinite(tod)) return ((tod % 24) + 24) % 24;
  const now = new Date();
  const sky = new URLSearchParams(search).get("sky") || getSkyMode();
  if (sky === "yours") return now.getHours() + now.getMinutes() / 60;
  const utcH = now.getUTCHours() + now.getUTCMinutes() / 60;
  return (((utcH + MINE_OFFSET / 3600) % 24) + 24) % 24;
}

export function landingPosterUrl({ w, h, theme, search = "" }) {
  const aspect = w / Math.max(1, h);
  let best = SHAPES[0][0], bestD = Infinity;
  for (const [name, a] of SHAPES) {
    const d = Math.abs(Math.log(aspect / a));
    if (d < bestD) (bestD = d), (best = name);
  }
  return `/window-scene/landing/${best}-${todBucket(skyHour(search))}-${theme === "dark" ? "dark" : "light"}.jpg`;
}
