// The site's theme follows the time of day (Agam, 2026-09-27: "set the light and dark
// mode according to the time of the day"): light while the sun is up over the sky
// the window scene shows (Bangalore by default; the visitor's own clock when they
// switched the sky to theirs), dark from civil dusk. A theme the visitor picks with
// the toggle wins until the clock's own
// verdict next changes (the next dusk or dawn), then the clock takes over again. ?tod= (the scene's
// time override) moves the clock too, so a pinned scene and the page agree.

import { sunPosition } from "./astro.js";
import { getSkyMode, MINE_PLACE } from "./weather.js";

const MANUAL_KEY = "theme-manual";
const DUSK_ALT = -4; // degrees: between sunset (-0.8) and the end of civil dusk (-6)

export function themeForTime(date = new Date()) {
  const tod = new URLSearchParams(window.location.search).get("tod");
  if (tod != null && tod !== "" && Number.isFinite(+tod)) return +tod >= 6.3 && +tod < 18.4 ? "light" : "dark";
  if (getSkyMode() === "mine") return sunPosition(date, MINE_PLACE.lat, MINE_PLACE.lon).alt > DUSK_ALT ? "light" : "dark";
  const h = date.getHours() + date.getMinutes() / 60;
  return h >= 6.3 && h < 18.4 ? "light" : "dark";
}

export function manualTheme() {
  try {
    const m = JSON.parse(window.localStorage.getItem(MANUAL_KEY) || "null");
    // valid while the clock still says what it said at the pick
    if (m && (m.theme === "light" || m.theme === "dark") && m.clock === themeForTime()) return m.theme;
  } catch {
    /* storage unavailable */
  }
  return null;
}

export function setManualTheme(theme) {
  try {
    window.localStorage.setItem(MANUAL_KEY, JSON.stringify({ theme, at: Date.now(), clock: themeForTime() }));
  } catch {
    /* storage unavailable */
  }
}
