// Real weather -> Living Sky uniforms.
//
// The point of the home-page sky is that it is the viewer's own sky: whatever is
// happening outside their window right now is what moves behind the header. Two
// hops get there, both keyless and both CORS-open:
//
//   1. city-level location from the IP (no permission prompt — a geolocation
//      dialog on a portfolio is denied by almost everyone, and city precision is
//      already finer than weather resolution)
//   2. current conditions from Open-Meteo for that lat/lon
//
// Everything then collapses onto the shader's parameter set. Nothing here can
// throw into the page: every failure falls back to FALLBACK (a fair Bangalore
// day) so the sky always renders.

import { LIVING_SKY_DEFAULTS } from "../shaders/washes.js";

const GEO_ENDPOINTS = [
  { url: "https://ipapi.co/json/", read: (j) => ({ lat: j.latitude, lon: j.longitude, city: j.city, region: j.country_name }) },
  { url: "https://ipwho.is/", read: (j) => ({ lat: j.latitude, lon: j.longitude, city: j.city, region: j.country }) },
];

// Bangalore, so a failed lookup still lands somewhere true to the site's author
const FALLBACK = { lat: 12.97, lon: 77.59, city: "Bangalore", region: "India" };

// IP GEOLOCATION IS NOT A LOCATION (pin mu2sz0p2, 16 Sep 2026: "make the
// background shader more strongly represent real life, for eg it's raining
// outside right now"). The shader was innocent: it was drawing precip 0 because
// the reading said Clear 26C, and the reading said that because ipapi resolved
// the author's ISP egress to HOSUR - a town 40km away across the Tamil Nadu
// border. In monsoon, 40km is the difference between pouring and dry, so the
// sky was faithfully rendering somebody else's weather.
//
// The honest correction is narrow: an IP hit that lands inside a metro's commuter
// radius is snapped to that metro's own centre, because that is what the hit
// actually MEANS. A visitor in Berlin still gets Berlin - only a coordinate that
// is already essentially this city is rewritten, and the reading carries the name
// it settled on so the tooltip can never claim a sky it is not drawing.
const METROS = [
  { lat: 12.97, lon: 77.59, city: "Bangalore", region: "India", km: 75 },
];

const haversineKm = (a, b) => {
  const R = 6371, rad = (d) => (d * Math.PI) / 180;
  const dLat = rad(b.lat - a.lat), dLon = rad(b.lon - a.lon);
  const h = Math.sin(dLat / 2) ** 2 +
    Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
};

function snapToMetro(place) {
  for (const m of METROS) {
    const d = haversineKm(place, m);
    if (d <= m.km) {
      // keep the raw hit for the record; the sky uses the metro
      return { lat: m.lat, lon: m.lon, city: m.city, region: m.region, snappedFrom: place.city || null, snappedKm: Math.round(d) };
    }
  }
  return place;
}

// v3: the reading carries the window scene's extra fields, and each sky MODE has
// its own entry, so switching whose sky it is never serves the other one's cache
const CACHE_PREFIX = "sky-weather-v3:";
const CACHE_MS = 15 * 60 * 1000; // Open-Meteo updates every 15min; asking faster is noise
// A FAILED fetch is cached too (so a dead network is not hammered), but only
// briefly: at 15 minutes one transient Open-Meteo blip pinned the fallback sky
// for a quarter of an hour.
const CACHE_FAIL_MS = 2 * 60 * 1000;

// --- whose sky -----------------------------------------------------------------
// "mine"  = Agam's sky: Bangalore city centre, on IST, for every visitor. The
//           city centre and nothing finer: never the photos' location.
// "yours" = the visitor's: today's IP chain above and their local clock.
// The window scene defaults to "mine" with a toggle beside the theme toggle;
// fetchSky() with no argument keeps doing exactly what it always did (the IP
// chain), so every page that calls it today is unchanged.
export const SKY_MODES = ["mine", "yours"];
export const DEFAULT_SKY_MODE = "mine";
export const MINE_PLACE = Object.freeze({ lat: 12.97, lon: 77.59, city: "Bangalore", region: "India" });
export const MINE_TZ = "Asia/Kolkata";
export const MINE_OFFSET = 19800; // IST, UTC+5:30, no daylight saving

const MODE_KEY = "sky-mode";
let skyMode = null;
const modeListeners = new Set();
let storageHooked = false;
const readStoredMode = () => {
  try {
    const v = window.localStorage.getItem(MODE_KEY);
    return SKY_MODES.includes(v) ? v : null;
  } catch {
    return null; // private mode, blocked storage, or no window at all
  }
};
const emitMode = (m) => {
  for (const fn of [...modeListeners]) {
    try {
      fn(m);
    } catch {
      /* one bad listener must not stop the others */
    }
  }
};

export function getSkyMode() {
  if (skyMode === null) skyMode = readStoredMode() ?? DEFAULT_SKY_MODE;
  return skyMode;
}

// Returns the mode now in force. Anything that is not a mode is ignored.
export function setSkyMode(mode) {
  if (!SKY_MODES.includes(mode)) return getSkyMode();
  if (mode === getSkyMode()) return mode;
  skyMode = mode;
  try {
    window.localStorage.setItem(MODE_KEY, mode);
  } catch {
    /* it still switches for this page, it just will not be remembered */
  }
  emitMode(mode);
  return mode;
}

// fn(mode) on every change, from this tab or another one. Returns unsubscribe.
export function subscribeSkyMode(fn) {
  modeListeners.add(fn);
  if (!storageHooked && typeof window !== "undefined" && window.addEventListener) {
    storageHooked = true;
    window.addEventListener("storage", (e) => {
      if (e.key !== MODE_KEY) return;
      const next = readStoredMode() ?? DEFAULT_SKY_MODE;
      if (next === skyMode) return;
      skyMode = next;
      emitMode(next);
    });
  }
  return () => modeListeners.delete(fn);
}

// Open-Meteo's data is CC BY 4.0: wherever the page says or shows the weather, it
// owes this credit (the licence text lives at the second link).
export const WEATHER_ATTRIBUTION = "Weather: Open-Meteo (CC BY 4.0)";
export const WEATHER_ATTRIBUTION_LINKS = Object.freeze({
  source: "https://open-meteo.com/",
  license: "https://creativecommons.org/licenses/by/4.0/",
});

const withTimeout = (url, ms = 4000) => {
  const ctl = new AbortController();
  const id = setTimeout(() => ctl.abort(), ms);
  return fetch(url, { signal: ctl.signal })
    .then((r) => (r.ok ? r.json() : Promise.reject(new Error(String(r.status)))))
    .finally(() => clearTimeout(id));
};

async function locate() {
  for (const ep of GEO_ENDPOINTS) {
    try {
      const place = ep.read(await withTimeout(ep.url));
      if (Number.isFinite(place.lat) && Number.isFinite(place.lon)) return snapToMetro(place);
    } catch {
      /* try the next provider */
    }
  }
  return FALLBACK;
}

// --- WMO weather code -> what the sky is doing -------------------------------
// Open-Meteo reports a single WMO code. Every one of them is covered here; the
// shape of each entry is the vocabulary the shader speaks.
//   cover  cloud amount        precip  0..1 intensity
//   kind   0 rain · .5 sleet · 1 snow  fog/storm  0..1
const CODE = {
  0:  { label: "Clear",              cover: 0.80, precip: 0 },
  1:  { label: "Mainly clear",       cover: 0.72, precip: 0 },
  2:  { label: "Partly cloudy",      cover: 0.55, precip: 0 },
  3:  { label: "Overcast",           cover: 0.34, precip: 0, soft: 0.7 },
  45: { label: "Fog",                cover: 0.45, precip: 0, fog: 0.85, haze: 0.9 },
  48: { label: "Freezing fog",       cover: 0.45, precip: 0, fog: 0.95, haze: 0.9 },
  51: { label: "Light drizzle",      cover: 0.42, precip: 0.18, soft: 0.8 },
  53: { label: "Drizzle",            cover: 0.40, precip: 0.28, soft: 0.8 },
  55: { label: "Heavy drizzle",      cover: 0.37, precip: 0.40, soft: 0.8 },
  56: { label: "Freezing drizzle",   cover: 0.40, precip: 0.28, kind: 0.5 },
  57: { label: "Freezing drizzle",   cover: 0.37, precip: 0.42, kind: 0.5 },
  61: { label: "Light rain",         cover: 0.40, precip: 0.35 },
  63: { label: "Rain",               cover: 0.36, precip: 0.60 },
  65: { label: "Heavy rain",         cover: 0.32, precip: 0.90, storm: 0.15 },
  66: { label: "Freezing rain",      cover: 0.36, precip: 0.55, kind: 0.5 },
  67: { label: "Freezing rain",      cover: 0.32, precip: 0.85, kind: 0.5 },
  71: { label: "Light snow",         cover: 0.42, precip: 0.30, kind: 1 },
  73: { label: "Snow",               cover: 0.38, precip: 0.60, kind: 1 },
  75: { label: "Heavy snow",         cover: 0.32, precip: 0.95, kind: 1 },
  77: { label: "Snow grains",        cover: 0.40, precip: 0.35, kind: 1 },
  80: { label: "Rain showers",       cover: 0.44, precip: 0.40 },
  81: { label: "Rain showers",       cover: 0.38, precip: 0.65 },
  82: { label: "Violent showers",    cover: 0.32, precip: 1.00, storm: 0.25 },
  85: { label: "Snow showers",       cover: 0.42, precip: 0.45, kind: 1 },
  86: { label: "Heavy snow showers", cover: 0.34, precip: 0.85, kind: 1 },
  95: { label: "Thunderstorm",       cover: 0.32, precip: 0.70, storm: 0.75 },
  96: { label: "Thunderstorm, hail", cover: 0.30, precip: 0.85, storm: 0.90, kind: 0.5 },
  99: { label: "Thunderstorm, hail", cover: 0.28, precip: 1.00, storm: 1.00, kind: 0.5 },
};

// u_cover is a THRESHOLD on the cloud noise, so it runs backwards: a low value is
// more cloud. Everything in CODE is written in that (shader) sense already.
const clamp01 = (v) => Math.max(0, Math.min(1, v));

// What one WMO code means, in the vocabulary above ({ label, cover, precip, ...}).
// Unknown codes read as Overcast, as they always have.
export function weatherCodeInfo(code) {
  return CODE[code] ?? CODE[3];
}

// THE OFFLINE SKY. When Open-Meteo cannot be reached the sky still has to be
// something, and it used to be CODE[3], Overcast: a grey lid that read as
// "broken" more than as weather, and not what the comment at the top of this
// file promised. Now it is a fair Bangalore afternoon with scattered cumulus,
// in the same shape as a live reading so every consumer can treat it as one
// (fetchSky still reports live: false, so nothing ever SAYS this weather).
export const FALLBACK_READING = Object.freeze({
  weather_code: 2,
  cloud_cover: 40,
  cloud_cover_low: 32,
  cloud_cover_mid: 10,
  cloud_cover_high: 15,
  temperature_2m: 28,
  relative_humidity_2m: 55,
  is_day: 1,
  wind_speed_10m: 10,
  wind_direction_10m: 250,
  wind_gusts_10m: 19,
  wind_speed_120m: 17,
  precipitation: 0,
  visibility: 20000,
  cape: 450,
  shortwave_radiation: null,
  direct_radiation: null,
  diffuse_radiation: null,
  interval: 900,
});

// Every distinct condition the mapping can produce, in the order a person would
// walk through them (clear -> wet -> frozen -> violent). One entry per LOOK, not
// per code: 51/53/55 are three intensities of the same drizzle, so the list keeps
// the ones that look different. /sky renders this; it is the coverage checklist.
export const CONDITIONS = [
  { code: 0, label: "Clear" },
  { code: 2, label: "Partly cloudy" },
  { code: 3, label: "Overcast" },
  { code: 45, label: "Fog" },
  { code: 51, label: "Light drizzle" },
  { code: 61, label: "Light rain" },
  { code: 63, label: "Rain" },
  { code: 65, label: "Heavy rain" },
  { code: 66, label: "Freezing rain" },
  { code: 80, label: "Showers" },
  { code: 71, label: "Light snow" },
  { code: 73, label: "Snow" },
  { code: 75, label: "Heavy snow" },
  { code: 95, label: "Thunderstorm" },
  { code: 99, label: "Thunderstorm, hail" },
];

// The uniforms one condition produces, with the atmosphere held at a fixed,
// average reading so two conditions can be compared side by side without wind or
// humidity drifting underneath them. This is the preview's entry point; the live
// page goes through skyUniforms() with the real numbers instead.
export function conditionUniforms(code, { lat = 12.97, season = 0.5, wind = 12, humidity = 70 } = {}) {
  const u = skyUniforms(
    { lat, lon: 0 },
    { weather_code: code, wind_speed_10m: wind, relative_humidity_2m: humidity }
  );
  return { ...u, u_season: season, u_latitude: clamp01(Math.abs(lat) / 66) };
}

// Season as the shader wants it: 0/1 = deep winter, 0.5 = midsummer, flipped
// below the equator so a January sky in Sydney is a summer sky.
export function seasonFor(lat, date) {
  const start = Date.UTC(date.getUTCFullYear(), 0, 0);
  const doy = (Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()) - start) / 86400000;
  let s = ((doy - 355) / 365) % 1;
  if (s < 0) s += 1;
  return lat < 0 ? (s + 0.5) % 1 : s;
}

// Aerosol optical depth is the physically correct driver of haze: it IS how much
// the air scatters, which is what haze is. Humidity was a proxy for it and a poor
// one - a humid clean coastal morning is clear, a dry dusty city afternoon is not.
// Open-Meteo publishes AOD per location, keyless like the rest.
export function hazeFromAerosol(aod, humidity) {
  if (!Number.isFinite(aod)) return clamp01(0.12 + (humidity ?? 55) / 100 * 0.45);
  // 0.05 is a scrubbed-clean sky, 0.6+ is the sort of day you can look at the sun
  return clamp01(0.08 + aod * 1.25);
}

export function skyUniforms(place, current, air) {
  const code = CODE[current?.weather_code] ?? CODE[3];
  const cloudPct = Number.isFinite(current?.cloud_cover) ? current.cloud_cover / 100 : null;
  // the measured cloud fraction is finer than the code's bucket, so when it is
  // present it wins for CLEAR-ish codes; under precipitation the code's deck is
  // the truer picture (a raining sky is overcast whatever the percentage says)
  const cover =
    cloudPct !== null && code.precip === 0
      ? clamp01(0.84 - cloudPct * 0.52)
      : code.cover;
  const wind = clamp01((current?.wind_speed_10m ?? 8) / 45); // km/h -> 0..1, 45 is a gale
  const humid = (current?.relative_humidity_2m ?? 55) / 100;

  return {
    ...LIVING_SKY_DEFAULTS,
    u_season: seasonFor(place.lat, new Date()),
    u_latitude: clamp01(Math.abs(place.lat) / 66),
    u_cover: cover,
    u_softness: code.soft ?? (code.precip > 0 ? 0.65 : 0.4),
    u_wind: Math.max(wind, code.storm ? 0.5 : 0.12),
    // fog codes state their own haze; otherwise it comes from the real aerosol load
    u_haze: code.haze ?? hazeFromAerosol(air?.aerosol_optical_depth, current?.relative_humidity_2m),
    u_stars: 0.85,
    // aurora only where one could actually be seen, and only on a clear night
    u_aurora: Math.abs(place.lat) > 58 && (code.precip === 0) ? 0.35 : 0,
    u_precip: code.precip,
    u_kind: code.kind ?? 0,
    u_fog: code.fog ?? 0,
    u_storm: code.storm ?? 0,
    u_exposure: 1.0,
  };
}

// The six fields the home sky has always read, then the ones the window scene
// needs: real wind direction and gusts (the tree and the clouds), wind aloft,
// the three cloud layers (low + mid to the deck, high to the cirrus), rain in mm,
// visibility (depth fog), radiation (how bright outside really is, and how hard
// the shadows) and CAPE (how much the afternoon cumulus is building).
const CURRENT_BASE = ["temperature_2m", "relative_humidity_2m", "is_day", "weather_code", "cloud_cover", "wind_speed_10m"];
const CURRENT_EXTRA = [
  "wind_direction_10m", "wind_gusts_10m", "wind_speed_120m",
  "cloud_cover_low", "cloud_cover_mid", "cloud_cover_high",
  "precipitation", "visibility",
  "shortwave_radiation", "direct_radiation", "diffuse_radiation",
  "cape",
];
// hourly precipitation for the last two hours (is the glass still wet?) and the
// day's moon (Open-Meteo publishes rise, set and phase; the POSITION comes from
// src/lib/astro.js, which it does not publish)
const EXTENDED_QUERY =
  "&hourly=precipitation&past_hours=2&forecast_hours=1" +
  "&daily=moonrise,moonset,moon_phase,sunrise,sunset&forecast_days=1";

const forecastUrl = (place, tz, extended) =>
  `https://api.open-meteo.com/v1/forecast?latitude=${place.lat.toFixed(3)}` +
  `&longitude=${place.lon.toFixed(3)}&timezone=${encodeURIComponent(tz)}` +
  `&current=${(extended ? CURRENT_BASE.concat(CURRENT_EXTRA) : CURRENT_BASE).join(",")}` +
  (extended ? EXTENDED_QUERY : "");

// Open-Meteo stamps hourly and daily times in the requested zone with no offset
// ("2026-09-26T19:00"); this turns one back into an instant.
function localIsoToMs(s, offsetSec) {
  const m = typeof s === "string" && s.match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/);
  if (!m) return null;
  return Date.UTC(+m[1], +m[2] - 1, +m[3], +m[4], +m[5]) - offsetSec * 1000;
}

async function readForecast(place, tz) {
  try {
    return { j: await withTimeout(forecastUrl(place, tz, true), 5000), extended: true };
  } catch (e) {
    // If the service ever refuses one of the extra fields (a 4xx), the home sky
    // must not lose its weather over it: ask again for the original six. A
    // timeout or a dead network is not retried (that would only double the wait).
    if (!/^4\d\d$/.test(e?.message || "")) throw e;
    return { j: await withTimeout(forecastUrl(place, tz, false), 5000), extended: false };
  }
}

async function loadSky(mode) {
  const mine = mode === "mine";
  const place = mine ? { ...MINE_PLACE } : await locate();
  let reading = null;
  let air = null;
  let past = null;
  let daily = null;
  let tzName = mine ? MINE_TZ : null;
  let offset = mine ? MINE_OFFSET : -new Date().getTimezoneOffset() * 60;
  try {
    const { j } = await readForecast(place, mine ? MINE_TZ : "auto");
    reading = j.current || null;
    if (Number.isFinite(j.utc_offset_seconds)) offset = j.utc_offset_seconds;
    if (typeof j.timezone === "string") tzName = j.timezone;
    if (j.hourly?.time && j.hourly?.precipitation) {
      past = j.hourly.time.map((t, i) => ({ t: localIsoToMs(t, offset), mm: j.hourly.precipitation[i] ?? 0 }))
        .filter((h) => h.t !== null);
    }
    if (j.daily?.time?.length) {
      const d = j.daily;
      daily = {
        moonrise: localIsoToMs(d.moonrise?.[0], offset),
        moonset: localIsoToMs(d.moonset?.[0], offset),
        moonPhase: d.moon_phase?.[0] ?? null,
        sunrise: localIsoToMs(d.sunrise?.[0], offset),
        sunset: localIsoToMs(d.sunset?.[0], offset),
      };
    }
  } catch {
    /* no reading: the sky still runs, on the fair fallback, the clock and the season */
  }
  if (!tzName) {
    try {
      tzName = Intl.DateTimeFormat().resolvedOptions().timeZone || null;
    } catch {
      tzName = null;
    }
  }
  // Air quality is a SEPARATE service and a separate failure: if it is down the sky
  // falls back to the humidity proxy rather than losing the weather along with it.
  try {
    const aq =
      `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${place.lat.toFixed(3)}` +
      `&longitude=${place.lon.toFixed(3)}&current=aerosol_optical_depth,pm2_5&timezone=auto`;
    air = (await withTimeout(aq, 5000)).current;
  } catch {
    /* haze falls back to humidity */
  }

  const current = reading;
  const effective = reading ?? FALLBACK_READING;
  return {
    uniforms: skyUniforms(place, effective, air),
    air: air ? { aod: air.aerosol_optical_depth, pm25: air.pm2_5 } : null,
    place,
    offset,
    label: (CODE[effective.weather_code] ?? CODE[3]).label,
    temp: Number.isFinite(current?.temperature_2m) ? Math.round(current.temperature_2m) : null,
    // the raw readings too, for anything that wants to SAY the weather rather
    // than draw it (the /hello sky tooltip, annotation msubv16w)
    current: current
      ? {
          humidity: current.relative_humidity_2m ?? null,
          wind: current.wind_speed_10m ?? null,
          cloud: current.cloud_cover ?? null,
          isDay: current.is_day ?? null,
        }
      : null,
    live: !!current,
    // --- added for the window scene (older callers never read these) ---
    mode,
    tzName,
    // every field Open-Meteo returned, or FALLBACK_READING when it returned
    // nothing (then `live` is false and `synthetic` true)
    reading: { ...effective },
    synthetic: !current,
    past, // [{ t: end of the hour (ms), mm: rain in that hour }], oldest first
    daily, // { moonrise, moonset, sunrise, sunset (ms), moonPhase (0..1) }
    fetchedAt: Date.now(),
    attribution: WEATHER_ATTRIBUTION,
  };
}

const inflight = {};

// The one call the page makes. Returns { uniforms, place, label, temp, offset,
// current, air, live }, where `offset` is the location's UTC offset in seconds so
// the sky runs on the local clock of the place it was read for.
//
// fetchSky()                 the visitor's sky from the IP chain: every existing
//                            caller, behaving exactly as before
// fetchSky({ mode: "mine" }) Agam's sky: Bangalore city centre on IST, no IP
//                            lookup at all
// Concurrent calls for the same mode share one request (the home page asks from
// four components at once on load).
export async function fetchSky(opts = {}) {
  const mode = opts && opts.mode === "mine" ? "mine" : "yours";
  const key = CACHE_PREFIX + mode;
  try {
    const cached = JSON.parse(sessionStorage.getItem(key) || "null");
    if (cached && Date.now() - cached.at < (cached.ttl ?? CACHE_MS)) return cached.data;
  } catch {
    /* no cache, no problem */
  }
  if (!inflight[mode]) {
    inflight[mode] = loadSky(mode)
      .then((data) => {
        try {
          sessionStorage.setItem(key, JSON.stringify({ at: Date.now(), ttl: data.live ? CACHE_MS : CACHE_FAIL_MS, data }));
        } catch {
          /* private mode */
        }
        return data;
      })
      .finally(() => {
        delete inflight[mode];
      });
  }
  return inflight[mode];
}

// --- where the sun actually is -----------------------------------------------
// The shader carries a time-of-day model of the sun: a sine of the hour, tilted by
// latitude and nudged by season. It is a good sine, and the real sun is not a sine.
// Declination swings with the date, the equation of time slides solar noon by up to
// ~16 minutes either way, and the two together move sunrise by the better part of an
// hour across a year. When the page knows where the viewer is, it can just compute
// the real thing - the standard declination + hour-angle solution, good to a small
// fraction of a degree, which is far past what a background needs.
export function solarPosition(lat, lon, date = new Date()) {
  const RAD = Math.PI / 180;
  const jd = date.getTime() / 86400000 + 2440587.5;
  const n = jd - 2451545.0;                              // days since J2000.0
  const L = (280.460 + 0.9856474 * n) % 360;             // mean longitude
  const g = ((357.528 + 0.9856003 * n) % 360) * RAD;     // mean anomaly
  const lambda = (L + 1.915 * Math.sin(g) + 0.020 * Math.sin(2 * g)) * RAD;
  const eps = (23.439 - 0.0000004 * n) * RAD;            // obliquity of the ecliptic
  const decl = Math.asin(Math.sin(eps) * Math.sin(lambda));
  const ra = Math.atan2(Math.cos(eps) * Math.sin(lambda), Math.cos(lambda)) / RAD;
  const gmst = (280.46061837 + 360.98564736629 * n) % 360;
  let H = (gmst + lon - ra) % 360;                       // hour angle, degrees
  if (H > 180) H -= 360;
  if (H < -180) H += 360;
  const latR = lat * RAD;
  const sinAlt =
    Math.sin(latR) * Math.sin(decl) + Math.cos(latR) * Math.cos(decl) * Math.cos(H * RAD);
  return {
    sinAlt,                                   // what the shader wants for u_sunElev
    altDeg: Math.asin(Math.max(-1, Math.min(1, sinAlt))) / RAD,
    hourAngle: H,
    // 0..1 across the frame with 0.5 at solar noon. Hour angle rather than compass
    // azimuth on purpose: it runs east-to-west in BOTH hemispheres, which compass
    // azimuth does not (below the equator the sun crosses the northern sky).
    frameX: 0.5 + H / 180,
  };
}

// The uniforms that hand the shader the real sun. u_sunReal is the switch: without
// it every existing caller (the lab, the gallery) keeps the model, unchanged.
export function sunUniforms(place, date = new Date()) {
  const s = solarPosition(place.lat, place.lon, date);
  return {
    u_sunReal: 1,
    u_sunElev: s.sinAlt,
    u_sunAz: Math.max(-0.25, Math.min(1.25, s.frameX)),
    // The moon's phase is a shader PARAMETER now, so the date arithmetic lives
    // here instead of inside the fragment. ~29.53 days a lunation, counted from a
    // known new moon (2000-01-06 18:14 UTC), which is a real epoch rather than the
    // season-derived approximation it replaces.
    u_moonph: moonPhase(date),
  };
}

const LUNATION_MS = 29.530588853 * 86400000;
const KNOWN_NEW_MOON = Date.UTC(2000, 0, 6, 18, 14);
export function moonPhase(date = new Date()) {
  const age = (date.getTime() - KNOWN_NEW_MOON) % LUNATION_MS;
  return ((age < 0 ? age + LUNATION_MS : age) / LUNATION_MS);
}
