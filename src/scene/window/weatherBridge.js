// Weather, time and sky for the window scene: one object the engine reads.
//
// createWeatherBridge() turns the site's weather reading (src/lib/weather.js) and
// the real sun and moon (src/lib/astro.js) into a SceneWeather: everything the
// scene needs about the world outside, in the scene's own units and world frame,
// plus the Living Sky uniforms for the plate (src/scene/window/skyPlate.js).
//
// It honours the capture contract (tools/window-light/spec/30-locked-brief.md):
//   tod   decimal hours in the mode's local time (IST for "mine"): freezes the clock
//   wx    live | clear | partly | overcast | rain | storm; anything but live is a
//         preset reading and then NOTHING touches the network
//   sky   mine | yours: whose sky (pins the mode)
//   date  YYYY-MM-DD (an addition for deterministic captures: without it a frozen
//         tod lands on today's date, so the moon and the season move day to day)
//
// World frame: x right, y up, +z from the window into the room; the window faces
// north, so outside (-z) is north and +x is east.

import {
  fetchSky,
  getSkyMode,
  subscribeSkyMode,
  skyUniforms,
  weatherCodeInfo,
  FALLBACK_READING,
  MINE_PLACE,
  MINE_TZ,
  MINE_OFFSET,
  SKY_MODES,
  WEATHER_ATTRIBUTION,
} from "../../lib/weather.js";
import { sunPosition, moonPosition, worldDir } from "../../lib/astro.js";
import { skyUniformsFrom, WINDOW_VIEW } from "./skyPlate.js";

export { lightningAt, windPulse, windTravel } from "./skyPlate.js";

const clamp01 = (v) => Math.max(0, Math.min(1, v));
const num = (v, d = null) => (Number.isFinite(v) ? v : d);

// --- capture presets: whole readings, in Open-Meteo's own shape -----------------
// Bangalore-plausible values (SW monsoon westerlies, afternoon CAPE). `past` is
// the rain in each of the last three hours (oldest first), so a rain capture has
// wet glass; `aod` is the aerosol load for the haze.
export const WX_PRESETS = Object.freeze({
  clear: {
    reading: { weather_code: 0, cloud_cover: 6, cloud_cover_low: 3, cloud_cover_mid: 2, cloud_cover_high: 4, temperature_2m: 29, relative_humidity_2m: 50, wind_speed_10m: 8, wind_direction_10m: 260, wind_gusts_10m: 15, wind_speed_120m: 14, precipitation: 0, visibility: 25000, cape: 150 },
    past: [0, 0, 0], aod: 0.25,
  },
  partly: {
    reading: { weather_code: 2, cloud_cover: 45, cloud_cover_low: 35, cloud_cover_mid: 12, cloud_cover_high: 25, temperature_2m: 28, relative_humidity_2m: 58, wind_speed_10m: 12, wind_direction_10m: 255, wind_gusts_10m: 22, wind_speed_120m: 20, precipitation: 0, visibility: 20000, cape: 700 },
    past: [0, 0, 0], aod: 0.3,
  },
  overcast: {
    reading: { weather_code: 3, cloud_cover: 96, cloud_cover_low: 85, cloud_cover_mid: 70, cloud_cover_high: 40, temperature_2m: 24, relative_humidity_2m: 78, wind_speed_10m: 10, wind_direction_10m: 250, wind_gusts_10m: 18, wind_speed_120m: 17, precipitation: 0, visibility: 12000, cape: 250 },
    past: [0, 0, 0], aod: 0.35,
  },
  rain: {
    reading: { weather_code: 63, cloud_cover: 100, cloud_cover_low: 95, cloud_cover_mid: 85, cloud_cover_high: 60, temperature_2m: 22, relative_humidity_2m: 92, wind_speed_10m: 18, wind_direction_10m: 240, wind_gusts_10m: 34, wind_speed_120m: 30, precipitation: 0.9, visibility: 6000, cape: 600 },
    past: [1.2, 2.5, 3.1], aod: 0.2,
  },
  storm: {
    reading: { weather_code: 95, cloud_cover: 100, cloud_cover_low: 90, cloud_cover_mid: 90, cloud_cover_high: 80, temperature_2m: 21, relative_humidity_2m: 95, wind_speed_10m: 26, wind_direction_10m: 230, wind_gusts_10m: 58, wind_speed_120m: 44, precipitation: 2.5, visibility: 3000, cape: 2200 },
    past: [0.5, 4.0, 9.0], aod: 0.2,
  },
});
export const WX_KEYS = ["live", ...Object.keys(WX_PRESETS)];

// Reads the contract's parameters from a query string ("?tod=17.68&wx=rain").
export function overridesFromSearch(search = typeof location !== "undefined" ? location.search : "") {
  const q = new URLSearchParams(search);
  const o = {};
  const tod = parseFloat(q.get("tod"));
  if (Number.isFinite(tod)) o.tod = ((tod % 24) + 24) % 24;
  const wx = q.get("wx");
  if (WX_KEYS.includes(wx)) o.wx = wx;
  const sky = q.get("sky");
  if (SKY_MODES.includes(sky)) o.sky = sky;
  const date = q.get("date");
  if (date && /^\d{4}-\d{2}-\d{2}$/.test(date)) o.date = date;
  return o;
}

// --- derived quantities -------------------------------------------------------------
// How wet the outside is, 0..1: 1 while it rains, then fading over about an hour
// from the end of the last hour that had rain (Open-Meteo stamps each hourly total
// at the END of its hour, so that is the latest the rain can have stopped).
function wetnessFrom(nowMs, mmh, past) {
  if (mmh >= 0.1) return 1;
  let w = 0;
  for (const h of past || []) {
    if (!(h.mm > 0.05) || !Number.isFinite(h.t) || h.t > nowMs + 60000) continue;
    const ageMin = Math.max(0, (nowMs - h.t) / 60000);
    w = Math.max(w, clamp01(1 - ageMin / 60) * clamp01(0.45 + h.mm / 2));
  }
  return w;
}

// Clear-sky irradiance (Haurwitz 1945) dimmed by cloud (Kasten and Czeplak 1980),
// for readings that do not carry radiation (the presets, the offline fallback).
function modelRadiation(sinAlt, cloud) {
  if (sinAlt <= 0.01) return { shortwave: 0, direct: 0, diffuse: 0 };
  const ghiClear = 1098 * sinAlt * Math.exp(-0.057 / sinAlt);
  const ghi = ghiClear * (1 - 0.75 * Math.pow(clamp01(cloud), 3.4));
  const diffuseFrac = 0.15 + 0.85 * clamp01(cloud);
  return { shortwave: ghi, direct: ghi * (1 - diffuseFrac), diffuse: ghi * diffuseFrac };
}

// Today's date in a zone given by its UTC offset, as [y, m, d].
function localYMD(nowMs, offsetSec) {
  const d = new Date(nowMs + offsetSec * 1000);
  return [d.getUTCFullYear(), d.getUTCMonth() + 1, d.getUTCDate()];
}

// A reading the bridge made itself (a capture preset): same shape as fetchSky's.
function presetData(mode, wx, nowMs) {
  const p = WX_PRESETS[wx];
  const mine = mode === "mine";
  let offset = MINE_OFFSET, tzName = MINE_TZ, place = { ...MINE_PLACE };
  if (!mine) {
    // no network, so no IP lookup: the visitor's own clock, with the sun worked
    // out on the meridian their time zone keeps (and Bangalore's latitude)
    offset = -new Date(nowMs).getTimezoneOffset() * 60;
    try {
      tzName = Intl.DateTimeFormat().resolvedOptions().timeZone || null;
    } catch {
      tzName = null;
    }
    place = { lat: MINE_PLACE.lat, lon: (offset / 3600) * 15, city: null, region: null };
  }
  const reading = { ...p.reading, interval: 900 };
  return {
    uniforms: skyUniforms(place, reading, { aerosol_optical_depth: p.aod }),
    place,
    offset,
    tzName,
    label: weatherCodeInfo(reading.weather_code).label,
    temp: Math.round(reading.temperature_2m),
    live: false,
    synthetic: true,
    preset: wx,
    reading,
    // hours back from whatever instant the state describes (a frozen tod is not
    // now), turned into times in buildSceneWeather
    pastRel: p.past,
    past: null,
    daily: null,
    mode,
  };
}

// What the bridge shows before the first reading lands: the offline fallback for
// the mode, so the scene can draw its first frame immediately.
function provisionalData(mode) {
  const place = { ...MINE_PLACE }; // "yours" has no place until its lookup lands
  return {
    uniforms: skyUniforms(place, FALLBACK_READING, null),
    place,
    offset: mode === "mine" ? MINE_OFFSET : -new Date().getTimezoneOffset() * 60,
    tzName: mode === "mine" ? MINE_TZ : null,
    label: weatherCodeInfo(FALLBACK_READING.weather_code).label,
    temp: null,
    live: false,
    synthetic: true,
    reading: { ...FALLBACK_READING },
    past: null,
    daily: null,
    mode,
  };
}

// --- SceneWeather ------------------------------------------------------------------
function buildSceneWeather(data, { mode, ready, nowMs, frozenTod, date: dateStr, bearing, view }) {
  const offset = num(data.offset, mode === "mine" ? MINE_OFFSET : 0);
  // the instant this state describes
  let instant = nowMs;
  if (frozenTod !== null) {
    const [y, m, d] = dateStr ? dateStr.split("-").map(Number) : localYMD(nowMs, offset);
    instant = Date.UTC(y, m - 1, d) + frozenTod * 3600000 - offset * 1000;
  } else if (dateStr) {
    // a pinned date with a live clock: today's local time of day on that date
    const [y, m, d] = dateStr.split("-").map(Number);
    const tNow = (((nowMs + offset * 1000) % 86400000) + 86400000) % 86400000;
    instant = Date.UTC(y, m - 1, d) + tNow - offset * 1000;
  }
  const date = new Date(instant);
  const tod = ((((instant + offset * 1000) / 3600000) % 24) + 24) % 24;
  const { lat, lon } = data.place;

  const past = data.pastRel
    ? data.pastRel.map((mm, i, a) => ({ t: Math.floor(instant / 3600000) * 3600000 - (a.length - 1 - i) * 3600000, mm }))
    : data.past;
  const s = sunPosition(date, lat, lon);
  const mo = moonPosition(date, lat, lon);
  const r = data.reading || FALLBACK_READING;
  const code = r.weather_code ?? 3;
  const info = weatherCodeInfo(code);

  // wind (km/h); dirFromDeg is meteorological (where it comes FROM)
  const speed = num(r.wind_speed_10m, 8);
  const gust = num(r.wind_gusts_10m, speed * 1.5);
  const dirFromDeg = num(r.wind_direction_10m, 250);
  const toward = worldDir(dirFromDeg + 180, 0, bearing);
  // the real gust factor as the shader's gust amplitude (INFERRED mapping, to tune:
  // 1.5x gusts give 0.15, the 2.6x of a light evening breeze gives 0.48)
  const gustAmp = Math.max(0.12, Math.min(0.55, (gust / Math.max(speed, 3) - 1) * 0.3));

  // cloud, as fractions
  const total = num(r.cloud_cover, null);
  const cloud = {
    total: total === null ? null : total / 100,
    low: Number.isFinite(r.cloud_cover_low) ? r.cloud_cover_low / 100 : null,
    mid: Number.isFinite(r.cloud_cover_mid) ? r.cloud_cover_mid / 100 : null,
    high: Number.isFinite(r.cloud_cover_high) ? r.cloud_cover_high / 100 : null,
  };

  // rain: Open-Meteo's current precipitation is the total over the reading's
  // interval (15 minutes), so scale it to an hourly rate
  const interval = num(r.interval, 900);
  const mmh = Math.max(0, num(r.precipitation, 0)) * (3600 / interval);
  const precipCode = info.precip > 0;
  const active = precipCode || mmh >= 0.1;
  const rain = {
    mmh,
    wetness: active ? 1 : wetnessFrom(instant, mmh, past),
    active,
    intensity: precipCode ? info.precip : clamp01(mmh / 8),
    kind: info.kind ?? 0,
  };
  const stormActive = code === 95 || code === 96 || code === 99;
  const storm = { active: stormActive, cape: num(r.cape, null), intensity: stormActive ? info.storm ?? 0.75 : 0 };

  const cloudForLight = cloud.total ?? (1 - (info.cover - 0.3) / 0.55);
  const radiation = Number.isFinite(r.shortwave_radiation)
    ? { shortwave: r.shortwave_radiation, direct: num(r.direct_radiation, 0), diffuse: num(r.diffuse_radiation, 0), modelled: false }
    : { ...modelRadiation(s.sinAlt, cloudForLight), modelled: true };

  const sw = {
    ready,
    mode,
    tzName: data.tzName ?? null,
    offset,
    place: { ...data.place },
    live: !!data.live,
    synthetic: !!data.synthetic,
    preset: data.preset ?? null,
    label: data.label,
    temp: data.temp ?? null,
    tod,
    date,
    frozen: frozenTod !== null,
    sun: { alt: s.alt, az: s.az, sinAlt: s.sinAlt, hourAngle: s.hourAngle, dir: worldDir(s.az, s.alt, bearing) },
    moon: {
      alt: mo.alt,
      az: mo.az,
      phase: mo.phase,
      illum: mo.illum,
      limbAngle: mo.limbAngle,
      dir: worldDir(mo.az, mo.alt, bearing),
    },
    wind: {
      speed,
      gust,
      dirFromDeg,
      vecX: toward[0],
      vecZ: toward[2],
      speed120: num(r.wind_speed_120m, speed * 1.6),
      gustAmp,
      u: data.uniforms?.u_wind ?? clamp01(speed / 45),
    },
    cloud,
    rain,
    storm,
    visibility: num(r.visibility, null),
    radiation,
    code,
    daily: data.daily ?? null,
    attribution: WEATHER_ATTRIBUTION,
    // the home band's own uniforms for this reading (src/lib/weather.js)
    base: data.uniforms,
  };
  sw.skyUniforms = skyUniformsFrom(sw, { ...view, t: 0 });
  return sw;
}

// createWeatherBridge() -> { get(), subscribe(fn), setMode(mode), dispose(), ready }
//   mode         "mine" (Agam's Bangalore sky, the default) or "yours"
//   overrides    { tod, wx, sky, date }: the capture contract (see the header)
//   followGlobal true: follow the header toggle (getSkyMode / subscribeSkyMode)
//                unless overrides.sky pins the mode
//   view         the plate's { viewAz, fovH, aspect } for sw.skyUniforms
//   bearing      the window's compass bearing (0 = north)
export function createWeatherBridge({
  mode = "mine",
  overrides = {},
  followGlobal = false,
  view = {},
  bearing = WINDOW_VIEW.bearing,
} = {}) {
  const pinned = SKY_MODES.includes(overrides.sky) ? overrides.sky : null;
  let current = pinned ?? (followGlobal ? getSkyMode() : SKY_MODES.includes(mode) ? mode : "mine");
  let frozenTod = Number.isFinite(overrides.tod) ? ((overrides.tod % 24) + 24) % 24 : null;
  let wx = overrides.wx && overrides.wx !== "live" && WX_PRESETS[overrides.wx] ? overrides.wx : null;
  const dateStr = typeof overrides.date === "string" && /^\d{4}-\d{2}-\d{2}$/.test(overrides.date) ? overrides.date : null;
  const viewOpts = { ...WINDOW_VIEW, ...view };

  let data = provisionalData(current);
  let ready = false;
  let state = null;
  let stateAt = -Infinity;
  let loadSeq = 0;
  let disposed = false;
  const subs = new Set();
  let resolveReady;
  const readyPromise = new Promise((r) => (resolveReady = r));

  const compute = (nowMs = Date.now()) => {
    state = buildSceneWeather(data, { mode: current, ready, nowMs, frozenTod, date: dateStr, bearing, view: viewOpts });
    stateAt = nowMs;
    return state;
  };
  const notify = () => {
    const sw = compute();
    for (const fn of [...subs]) {
      try {
        fn(sw);
      } catch (e) {
        console.warn("[weatherBridge] subscriber:", e);
      }
    }
  };

  const load = async () => {
    const seq = ++loadSeq;
    const m = current;
    let next;
    if (wx) next = presetData(m, wx, Date.now());
    else {
      try {
        next = await fetchSky({ mode: m });
      } catch {
        next = provisionalData(m); // fetchSky does not throw, but nothing here may
      }
    }
    if (disposed || seq !== loadSeq) return; // a newer load (mode switch) won
    const changed = forced || !ready || next.fetchedAt !== data.fetchedAt || next.mode !== data.mode || m !== data.mode;
    forced = false;
    data = { ...next, mode: m };
    if (!ready) {
      ready = true;
      notify();
      resolveReady(state);
    } else if (changed) notify();
  };

  // The weather cache decides freshness (15 minutes live, 2 after a failure), so
  // asking every 2 minutes costs a sessionStorage read and retries a failure on
  // time. The clock tick moves the sun and moon for anything that listens.
  // (both run always and check the overrides, which setOverrides can now change)
  let forced = false;
  const pollTimer = setInterval(() => !wx && load(), 2 * 60 * 1000);
  const tickTimer = setInterval(() => frozenTod === null && subs.size && notify(), 60 * 1000);
  const unfollow = followGlobal && !pinned ? subscribeSkyMode((m) => bridge.setMode(m)) : null;
  load();

  const bridge = {
    // Promise of the first real SceneWeather (live reading, cached one, or preset)
    ready: readyPromise,
    // The current SceneWeather. Cheap: recomputed at most once a second (never,
    // with a frozen clock, until the data changes).
    get() {
      const now = Date.now();
      if (!state || (frozenTod === null && now - stateAt >= 1000)) compute(now);
      return state;
    },
    subscribe(fn) {
      subs.add(fn);
      return () => subs.delete(fn);
    },
    // Switch whose sky it is. Keeps showing the old sky until the new one lands,
    // so the window never blinks to the fallback on a toggle.
    setMode(m) {
      if (!SKY_MODES.includes(m) || m === current) return current;
      current = m;
      load();
      return current;
    },
    get mode() {
      return current;
    },
    // Change the weather preset ("live" or a WX_PRESETS key) and the frozen hour
    // (null = the real clock) while running: the header's Outside menu
    // (outsideStore.js). The old sky stays until the new reading lands.
    setOverrides({ wx: w, tod } = {}) {
      if (w !== undefined) wx = w && w !== "live" && WX_PRESETS[w] ? w : null;
      if (tod !== undefined) frozenTod = Number.isFinite(tod) ? ((tod % 24) + 24) % 24 : null;
      forced = true;
      if (w !== undefined) load();
      else {
        forced = false;
        notify();
      }
    },
    dispose() {
      disposed = true;
      if (pollTimer) clearInterval(pollTimer);
      if (tickTimer) clearInterval(tickTimer);
      if (unfollow) unfollow();
      subs.clear();
    },
  };
  return bridge;
}
