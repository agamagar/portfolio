# 11 Living Sky and weather API map

Understanding phase only: nothing here is built. This maps what the site already has (the Living Sky shader and the weather API behind it) so the window scene can reuse it "just like the living sky shader that we created", and lists every real-time signal the outside of the window could be driven by.

- Written 2026-09-26, about 19:00 IST.
- Marks: VERIFIED = read in code, run, or fetched live today. INFERRED = my reading, not proven.
- Line numbers are as of 2026-09-26 19:00. `src/App.jsx` and `src/index.css` were being edited while I read them (mtimes 18:59 and 19:00), so for those two files the quoted string is the reliable anchor, not the line.
- Scratch evidence (not in the project): `/private/tmp/claude-501/-Users-agamagarwal-My-Drive-Active---Portfolio/f6eb71b2-3a66-4ec7-b85d-ffd026e2b335/scratchpad/rtt/` (r186 render test page and `sheet.png`), `.../scratchpad/om_current_ext.json` (the full Open-Meteo probe), `.../scratchpad/conds.mjs` (the condition table generator).

---

## 0. The short version

1. There is ONE weather module, `src/lib/weather.js` (333 lines). It has three keyless, CORS-open hops: IP to city (ipapi.co, then ipwho.is), Open-Meteo forecast `current=`, Open-Meteo air quality `current=`. Location is never asked for. The browser Geolocation API is used nowhere in `src/` (VERIFIED, grep count 0). (VERIFIED)
2. The site asks for 6 weather fields plus 2 air fields. Open-Meteo returned about 40 more today for the same point, including wind direction, gusts, cloud layers, visibility, precipitation in mm, radiation, and daily sunrise, sunset, moonrise, moonset and moon phase. None of those are used. (VERIFIED, live fetch)
3. The Living Sky exists three times, byte-identical: the source of truth `public/shader-viewer/presets/living-sky.frag` (743 lines), the vendored string `LIVING_SKY` in `src/shaders/washes.js:514-1257`, and the viewer bundle `presets.bundled.js`. (VERIFIED with `cmp` and a string compare)
4. The shader has 28 uniforms: 5 from the canvas, 23 declared params. It also takes 3 "real sun" uniforms that the page sets, and one colour. An unset uniform reads 0, and 0 exposure is a black frame, so `LIVING_SKY_DEFAULTS` (`washes.js:1289-1317`) is required. (VERIFIED)
5. The folio page is the root `/` (and `/portfolio`). It renders `Hello3` (`src/hello3/Hello.jsx`), not the old `Home`. The live sky is the `.hello-sky` band there: `position: fixed`, masked, and faded by scroll. (VERIFIED)
6. **Proven today:** three r186 `WebGLRenderer` compiles the vendored `LIVING_SKY` string VERBATIM in a `ShaderMaterial` and renders it into a `WebGLRenderTarget`. The run gave 1 program, GL error 0, and six distinct skies (noon, the photo's 17:41 golden hour, 18:39 dusk, night, heavy rain, thunder). So reusing the sky as a texture for the window costs no port. (VERIFIED, headless Chrome with a throwaway profile, `scratchpad/rtt/sheet.png`)
7. WebGPURenderer cannot run it as is. r186's `StandardNodeLibrary` maps no `ShaderMaterial`, and `glslFn` only works on the WebGL2 fallback backend. A WebGPU path means a full TSL (or WGSL) rewrite of 743 lines, which forks the source of truth. (VERIFIED in the r186 package source)
8. Four things the window scene needs cannot come from the sky plate as it is:
   - window bearing (the sun's frame position assumes you face the equator);
   - a real moon position (the moon is modelled even when the sun is real);
   - wind direction (clouds always drift left to right);
   - JS-visible lightning (strikes are decided by a hash inside the fragment).
   Rain and fog are also drawn INTO the plate, so they would sit behind the trees. (VERIFIED in code)

---

## a) The weather API

### a1. Location: IP geolocation, no permission prompt

| step | what | where |
|---|---|---|
| 1 | `GET https://ipapi.co/json/` reads `latitude, longitude, city, country_name` | `weather.js:18-21` |
| 2 | if step 1 fails or is non-finite: `GET https://ipwho.is/` reads `latitude, longitude, city, country` | `weather.js:20` |
| 3 | if both fail: `FALLBACK = { lat: 12.97, lon: 77.59, city: "Bangalore", region: "India" }` | `weather.js:24`, `locate()` at `:73-83` |
| snap | any hit within 75 km of Bangalore centre is rewritten to `12.97, 77.59` and keeps `snappedFrom` and `snappedKm` (haversine). This is the fix for pin mu2sz0p2: ipapi put Agam's ISP egress in Hosur, 40 km away, and the sky drew Hosur's dry weather while Bangalore rained. | `weather.js:26-60` |

- Each geo call has a 4000 ms timeout through `AbortController` (`withTimeout`, `weather.js:65-71`). (VERIFIED)
- Both geo endpoints answer today with `latitude` and `longitude` present. ipwho.is sends `access-control-allow-origin: *`. ipapi.co echoes the request Origin. (VERIFIED with curl; values not recorded here on purpose)
- INFERRED: ipapi.co's free tier is rate-limited per IP per day. The fallback chain hides a 429 as "use ipwho.is".

### a2. Weather: Open-Meteo forecast, `current=` only

Exact request (`weather.js:228-231`), with lat and lon to 3 decimals:

```
https://api.open-meteo.com/v1/forecast?latitude={lat}&longitude={lon}&timezone=auto
  &current=temperature_2m,relative_humidity_2m,is_day,weather_code,cloud_cover,wind_speed_10m
```

- Timeout 5000 ms. Reads `j.current` and `j.utc_offset_seconds` (`:232-234`). (VERIFIED)
- `timezone=auto` is what makes the offset the LOCATION's, so the sky runs on local time at the place, not the browser's zone (`ShaderCanvas` `clockOffsetSeconds`). (VERIFIED)
- Live answer for Bangalore at 18:45 IST today: `weather_code 0, cloud_cover 7, wind_speed_10m 5.7 km/h, relative_humidity_2m 63, temperature_2m 25.3, is_day 0, utc_offset_seconds 19800, elevation 914 m`. `current.interval` is 900 s. (VERIFIED)

### a3. Air: Open-Meteo air quality (a separate failure domain)

```
https://air-quality-api.open-meteo.com/v1/air-quality?latitude={lat}&longitude={lon}
  &current=aerosol_optical_depth,pm2_5&timezone=auto
```

- Timeout 5000 ms (`weather.js:240-247`). Live today: `aerosol_optical_depth 0.21`, `pm2_5 20.0`, hourly interval 3600 s. (VERIFIED)
- AOD drives haze: `u_haze = clamp01(0.08 + aod * 1.25)`. Without AOD, a humidity proxy is used instead: `0.12 + RH/100 * 0.45` (`hazeFromAerosol`, `:173-177`). (VERIFIED)

### a4. What `fetchSky()` returns (`weather.js:215-274`)

`{ uniforms, air: {aod, pm25} | null, place, offset, label, temp, current: {humidity, wind, cloud, isDay} | null, live }`

- `live` is `!!current`.
- `current.isDay` is carried but read by nothing. (VERIFIED, grep)

### a5. Caching and refresh cadence

- Cache: `sessionStorage["sky-weather-v2"]`, TTL `15 * 60 * 1000` ms (`:62-63`, `:216-220`, `:268-272`). The cache is per tab session and is shared by every consumer in the tab (Hello3, SkyTip, WeatherSky, StatusBar). (VERIFIED)
- **The cache also stores failures.** The `setItem` runs whether or not `live` is true, so a transient Open-Meteo failure pins the fallback look for 15 minutes. (VERIFIED, `:268-270`)
- Refetch: `setInterval(load, 15 min)` in `WeatherSky.jsx:27` and in `hello3/Hello.jsx:193`. (VERIFIED)
- Sun recompute: a 1-minute React tick (`WeatherSky.jsx:28`, `hello3/Hello.jsx:194`) re-runs `sunUniforms(place)`. (VERIFIED)
- Clock: `ShaderCanvas` re-reads the time of day once a second inside its rAF (`ShaderCanvas.jsx:199-238`). (VERIFIED)
- Easing: numeric uniforms ease exponentially with time constant 0.55 s (`1 - exp(-dt/0.55)`, `ShaderCanvas.jsx:254`), about 2 s to settle, so a new reading reads as weather changing. `u_tint` (array) is not eased. Reduced motion snaps and draws only on change. (VERIFIED)

### a6. Fallbacks (what the visitor sees)

| failure | result | where |
|---|---|---|
| both IP lookups fail | Bangalore 12.97, 77.59 | `:82` |
| forecast fails | `current = null`, so `CODE[3]`: an **Overcast** sky (cover 0.34, softness 0.7). No caption, `live: false`, offset from the browser | `:180`, `:226`, `:235-237` |
| air quality fails | haze from the humidity proxy (0.368 at the RH-55 default) | `:174` |
| WebGL missing or context lost | CSS gradient behind the canvas (`hello.css:152` light `#8fb8e0 > #cfe0ee > #eef3f7`, dark `:185`) | `ShaderCanvas.jsx:81` |
| reduced motion | frozen frame, uniforms snap, no rAF redraw unless something changed | `ShaderCanvas.jsx:242-250` |

- The comment at `weather.js:13-14` says "falls back to FALLBACK (a fair Bangalore day)". That is true of the PLACE only. The weather fallback is Overcast. (VERIFIED: offline uniforms computed = cover 0.34, softness 0.7, wind 0.178, haze 0.368)

### a7. Terms (compliance, not code)

- Open-Meteo free tier: non-commercial use only, 600 calls a minute, 5,000 an hour, 10,000 a day, 300,000 a month, and data under CC BY 4.0, which requires attribution. (VERIFIED, open-meteo.com/en/terms)
- The site shows no Open-Meteo attribution anywhere. It is mentioned only in code comments (`hello3/Hello.jsx:180`, `hello3/StatusBar.jsx:20`). (VERIFIED, grep)
- A credit line is owed wherever the scene says what the weather is.

---

## b) The Living Sky shader

### b1. Where it lives

- **Source of truth:** `public/shader-viewer/presets/living-sky.frag`. Edit here, then run `node public/shader-viewer/build-presets.mjs` to regenerate `presets.bundled.js` (39 presets), then re-vendor into `washes.js`. (VERIFIED, and memory `shader-library.md`)
- **Vendored:** `src/shaders/washes.js:514` `export const LIVING_SKY = ...` through `:1257`, registered as `WASHES.livingSky` (`:1261`), listed in `SHADER_LIST` (`:1272`), defaults at `:1289-1317`. Byte-identical to the preset today (`cmp` returns no difference). (VERIFIED)
- It is a GLSL ES 1.0 fragment shader: `precision highp float`, `varying vec2 v_uv`, writes `gl_FragColor`. Its vertex partner is ShaderCanvas's full-screen triangle, `attribute vec2 a_pos; v_uv = a_pos*0.5+0.5` (`ShaderCanvas.jsx:11-18`). (VERIFIED)

### b2. The full uniform list

**Canvas uniforms**, set by `ShaderCanvas` every draw:

| uniform | value today | note |
|---|---|---|
| `u_time` | seconds of VISIBLE time, accumulated with `dt` capped at 0.1 s | pauses offscreen (IntersectionObserver) and in hidden tabs; drives drift, gusts, lightning, rain |
| `u_mouse` | fixed `[0.5, 0.5]` | never updated (`ShaderCanvas.jsx:169`), so the shader's mouse parallax `(u_mouse - 0.5) * 0.6` is dormant |
| `u_resolution` | backing-buffer px | DPR capped at 2, times `superSample`; rain drop sizes are in pixels of this |
| `u_dark` | `<html>.dark` class | declared but UNUSED by Living Sky |
| `u_tod` | `(local seconds at the place) / 86400`, or a pinned `tod` prop | only pushed when `clock` is set |

**Declared params** (the `// param` header, `washes.js:516-539`, plus `LIVING_SKY_DEFAULTS`):

| uniform | range | default | live value source | what it does |
|---|---|---|---|---|
| `u_tod` | 0 to 1 | 0.35 (header) | ShaderCanvas clock | 0 midnight, 0.25 dawn, 0.5 noon, 0.75 dusk |
| `u_cycle` | 0 to 1 | 0 | fixed | fast-forward: `tod = fract(u_tod + u_time * u_cycle * 0.02)` |
| `u_season` | 0 to 1 | 0.5 | `seasonFor(lat, now)` | 0 and 1 = Dec 21, 0.5 = Jun 21, flipped in the south. Today (Sep 26) = 0.764 |
| `u_latitude` | 0 to 1 | 0.5 | `abs(lat)/66` | Bangalore = 0.197. Flattens the sun arc (`mix(1, 0.45, lat)`) and widens the seasonal swing |
| `u_cover` | 0.30 to 0.85 | 0.52 | code table, or `0.84 - cloud% * 0.52` for dry codes | a THRESHOLD, so it runs backwards: low = more cloud. Below 0.46 it becomes a stratus sheet |
| `u_softness` | 0 to 1 | 0.4 | code `soft`, else 0.65 wet / 0.4 dry | cloud edge width, cumulus crispness |
| `u_wind` | 0 to 1 | 0.4 | `clamp01(wind_km_h / 45)`, floor 0.12, floor 0.5 when storm | deck drift `mix(0.01, 0.09, u_wind)` deck units a second; rain slant |
| `u_haze` | 0 to 1 | 0.35 | code `haze`, else AOD, else humidity | horizon lift, desaturation, the size of the sun's aureole skirt |
| `u_stars` | 0 to 1 | 0.8 | 0.85 | star and Milky Way density |
| `u_aurora` | 0 to 1 | 0 | 0.35 only if `abs(lat) > 58` and dry | curtains at night |
| `u_precip` | 0 to 1 | 0 | code `precip` | how many drops (fill), not how bright |
| `u_kind` | 0 to 1 | 0 | code `kind` | 0 rain, 0.5 sleet or freezing, 1 snow |
| `u_fog` | 0 to 1 | 0 | code `fog` (45, 48) | a bank rising from the bottom edge, past the top at 1 |
| `u_storm` | 0 to 1 | 0 | code `storm` | gloom, plus the probability that each lightning slot fires |
| `u_scale` | 1 to 7 | 3.0 | fixed | deck sampling scale: bigger = smaller clouds |
| `u_persp` | 0 to 1 | 1.0 | fixed | 1 = a deck seen from below in perspective, 0 = flat field |
| `u_cirrus` | 0 to 2 | 1.0 | fixed | multiplies the high deck, whose amount is otherwise derived from `u_cover` |
| `u_gust` | 0 to 0.6 | 0.30 | fixed | SYNTHETIC gusts: two sines, periods 73.9 s and 27.3 s; speed 0.54x to 1.46x of mean |
| `u_evolve` | 0 to 4 | 1.0 | fixed | how fast cloud shapes form and dissipate |
| `u_glare` | 0 to 2 | 1.0 | fixed | strength of the Mie aureole |
| `u_moonph` | 0 to 1 | 0.5 | `moonPhase(now)` | 0 new, 0.5 full. Today 0.498 (Open-Meteo says 0.485) |
| `u_sat` | 0 to 1.6 | 1.0 | fixed | final saturation |
| `u_exposure` | 0.5 to 1.6 | 1.0 | 1.0 | final multiply before the highlight rolloff |
| `u_tint` | colour | `[1,1,1]` | fixed | final multiply, not eased |

**Real-sun uniforms** (`washes.js:585-587`, set by `sunUniforms()`, `weather.js:314-326`):

- `u_sunReal`: 0 = the shader's own model, 1 = real.
- `u_sunElev`: `sin(true altitude)`.
- `u_sunAz`: `0.5 + hourAngle/180`, clamped to -0.25 to 1.25.

`sunUniforms` also sets `u_moonph`.

**The trap:** `LIVING_SKY_DEFAULTS` omits `u_tod` on purpose. Any consumer without `clock` gets `u_tod = 0`, which is midnight. (VERIFIED) `src/art/ArtMode.jsx:89-92` passes `clock` but no `uniforms`, which is a black frame, but that file is no longer mounted (`App.jsx` comment "Art mode ... is no longer mounted"). (VERIFIED)

### b3. How time of day becomes a sky (`washes.js:709-751`)

**Model sun** (used when `u_sunReal = 0`, the lab default):

- `ang = (tod - 0.25) * 2pi`
- `elev = sin(ang) * mix(1, 0.45, u_latitude) + mix(-0.10, 0.10, summer) * (0.5 + u_latitude)`
- `summer = 0.5 - 0.5 cos(2pi u_season)`
- `sunX = (tod - 0.25) * 2`

**Real sun** (Hello3 and WeatherSky):

- `elev = mix(elev, u_sunElev, u_sunReal)` and `sunX = mix(model, u_sunAz, u_sunReal)`.
- `solarPosition()` (`weather.js:284-310`) is the standard declination plus hour-angle solution.
- I cross-checked it independently for Bangalore today:

| IST | altitude | azimuth | frameX |
|---|---|---|---|
| 12:00 | 75.5 | 168.9 | 0.485 |
| 17:41 | 7.0 | 267.0 | 0.958 |
| 18:13 | -0.8 | 268.8 | 1.003 |
| 18:39 | -7.2 | 270.2 | 1.039 |

(sunset 18:13, matching Open-Meteo's daily `sunset` of 18:13.) (VERIFIED)

**Frame convention:** `frameX` is built from the HOUR ANGLE, "east to west in both hemispheres". The frame is therefore a view toward the equator with the sun crossing it left to right every day. No compass azimuth is computed anywhere. (VERIFIED) This is the first thing the window scene has to change (see d4).

**Light states:**

- `dayAmt = smoothstep(-0.05, 0.35, elev)`
- `nightAmt = 1 - smoothstep(-0.25, 0.05, elev)`
- `golden = 1 - smoothstep(0, gwidth, abs(elev))`, where `gwidth = mix(0.46, 0.32, summer)`

Note: at the photo's 17:41 (sin altitude 0.122) `dayAmt` is only 0.39, so the plate is already a dim mauve (mean sRGB 100, 99, 121 in my render). The phone photo shows a bright pale sky there. (VERIFIED render; the photo is a tone-mapped iPhone HDR at EV100 9.6, so it is not a radiometric reference)

**Sunlight colour:**

- `airPath = clamp(1 / max(elev*0.92 + 0.15, 0.06), 1, 9)`
- `sunColor = exp(-(0.20, 0.46, 1.00) * (airPath - 1) * 0.155)`

This colours the clouds, the halo, the horizon and the cirrus alike.

**Sky model:**

- horizon-to-zenith as `pow(y, 0.62)` air mass;
- Rayleigh `(1 + cos^2)` phase;
- Mie aureole (core `exp(-9 theta)` plus skirt `1/(1 + 12 theta^2)`, skirt scaled by `u_haze`);
- a directional sunset (`sunSide`);
- Earth shadow plus the Belt of Venus opposite the sun, for elevations between about +0.03 and -0.30.

**No sun disc**, by design. **There is a moon disc**, with the phase, an elliptical terminator and earthshine.

**MOON POSITION IS MODELLED EVEN WITH THE REAL SUN:**

- `mTod = fract(tod + moonPhase)`
- `mElev` uses the model formula.
- `moonPos.x = (mTod - 0.25) * 2`

(`washes.js:743-750`) (VERIFIED) Open-Meteo offers `moonrise`, `moonset` and `moon_phase` daily (today: rise 17:56, set 05:35, phase 0.485). (VERIFIED)

### b4. Clouds, stars, weather (in draw order)

**Low deck:**

- Perspective deck `deck = (uv.x/yv, 1/yv)`, `yv` floor `1 - 0.45 u_persp`.
- Drift `t * wMean + gust` along +x only. Gust is integrated so it never reverses.
- The warp evolves slowly (`u_evolve`).
- Cumulus shape: an asymmetric edge (crisp base, soft top), a stratus sheet below cover 0.46, and edge wisps.
- Lighting: tops lit by day, flipping to undersides lit at low sun (`fromBelow`), forward scattering near the sun, Beer's-law transmission, and a silver or gold rim.

**High cirrus deck:** `cirAmt = smoothstep(0.86, 0.46, u_cover) * (1 - gloom) * (1 - wet) * u_cirrus`. It is steadier and crosses at an angle. It is NOT tied to real high-cloud data.

**Stars:** two star layers with air-mass scintillation, a Milky Way band with dust rifts, and stars washed out by the moon.

**Twilight and gloom:**

- `gloom = clamp(wet*0.55 + u_storm*0.55 + max(0.55 - u_cover, 0)*0.8)` darkens and desaturates.
- Golden hour is cut by 85% of gloom.

**Lightning:**

- one candidate every `1/0.11 = 9.1 s`, offset 0.4 so frame 0 is never a flash;
- fires if `hash(slot, 3.7) > 1 - u_storm`;
- a main flash plus an echo, from a random top position.

This lives entirely in the fragment, so JS cannot know when it fires (`washes.js:1161-1176`). (VERIFIED)

**Rain and snow:** three screen-space sheets.

- Rain: 22 by 1.6 px, 15 by 1.3 px and 10 by 1.0 px drops; slant `mix(0.10, 0.55, u_wind) * gust`; fill `mix(0.10, 0.85, u_precip)`; colour taken from the backdrop.
- Snow: sways sideways.

Both are in the PLATE (`:1178-1225`).

**Fog:** a bank from the bottom edge, height `mix(0.45, 1.6, u_fog)` (`:1227-1237`).

**Grade:**

- exposure;
- saturation against luminance;
- a highlight rolloff above 0.80 (`hi / (1 + 1.35 hi)`);
- tint;
- a +/-0.5/255 dither.

The output is display-referred 0 to 1, not linear HDR. (VERIFIED)

**Cost**, measured by earlier sessions on Agam's Mac (`Claude/Shader Viewer/2026-08-11_living-sky-all-weather.md`, lines 587-601 and 770-777): 0.77 to 0.86 ms at 2.36 MP (the home band at 2x), 1.82 ms at 5.23 MP, and 2.06 ms at 7.46 MP. About 5% of a 60 fps frame at band size. (VERIFIED as a recorded measurement, not re-measured)

### b5. Season and latitude

- `seasonFor(lat, date)` (`weather.js:161-167`): `s = ((dayOfYear - 355) / 365) mod 1`, then `+0.5` in the south.
- It is a TEMPERATE model (winter and summer). Bangalore's seasons are dry, pre-monsoon, SW monsoon (Jun to Sep) and NE monsoon (Oct to Nov). The shader has no monsoon notion; monsoon only arrives through the weather code. (VERIFIED, INFERRED about Bangalore climate)
- Latitude flattens the arc and scales the seasonal day-length swing. Aurora is gated to `abs(lat) > 58`.

### b6. The fifteen conditions on the /sky contact sheet

`CONDITIONS` is at `weather.js:129-145`. `/sky` renders them with `conditionUniforms(code, opts)`, which holds wind at 12 km/h and humidity at 70% so cells compare fairly. At lat 12.97 and season 0.5 these are the uniforms (VERIFIED by running the site's own functions, `scratchpad/conds.mjs`):

| code | label | cover | soft | wind | haze | precip | kind | fog | storm |
|---|---|---|---|---|---|---|---|---|---|
| 0 | Clear | 0.800 | 0.40 | 0.267 | 0.435 | 0 | 0 | 0 | 0 |
| 2 | Partly cloudy | 0.550 | 0.40 | 0.267 | 0.435 | 0 | 0 | 0 | 0 |
| 3 | Overcast | 0.340 | 0.70 | 0.267 | 0.435 | 0 | 0 | 0 | 0 |
| 45 | Fog | 0.450 | 0.40 | 0.267 | 0.900 | 0 | 0 | 0.85 | 0 |
| 51 | Light drizzle | 0.420 | 0.80 | 0.267 | 0.435 | 0.18 | 0 | 0 | 0 |
| 61 | Light rain | 0.400 | 0.65 | 0.267 | 0.435 | 0.35 | 0 | 0 | 0 |
| 63 | Rain | 0.360 | 0.65 | 0.267 | 0.435 | 0.60 | 0 | 0 | 0 |
| 65 | Heavy rain | 0.320 | 0.65 | 0.500 | 0.435 | 0.90 | 0 | 0 | 0.15 |
| 66 | Freezing rain | 0.360 | 0.65 | 0.267 | 0.435 | 0.55 | 0.5 | 0 | 0 |
| 80 | Showers | 0.440 | 0.65 | 0.267 | 0.435 | 0.40 | 0 | 0 | 0 |
| 71 | Light snow | 0.420 | 0.65 | 0.267 | 0.435 | 0.30 | 1 | 0 | 0 |
| 73 | Snow | 0.380 | 0.65 | 0.267 | 0.435 | 0.60 | 1 | 0 | 0 |
| 75 | Heavy snow | 0.320 | 0.65 | 0.267 | 0.435 | 0.95 | 1 | 0 | 0 |
| 95 | Thunderstorm | 0.320 | 0.65 | 0.500 | 0.435 | 0.70 | 0 | 0 | 0.75 |
| 99 | Thunderstorm, hail | 0.280 | 0.65 | 0.500 | 0.435 | 1.00 | 0.5 | 0 | 1.00 |

- The full WMO table maps all 28 codes (`CODE`, `weather.js:90-119`): 0-3, 45, 48, 51-57, 61-67, 71-77, 80-86, 95-99. Unknown codes fall back to 3.
- The contact sheet opens 15 live WebGL contexts, close to the browser's limit of about 16 (`SkyLab.jsx:166-168` comment).
- `/sky` also has a Model or Real sun toggle, 9 time stops, 4 seasons, 4 latitudes, 3 winds and a Parameters panel of 9 sliders (`SkyLab.jsx:22-83`). (VERIFIED)

**Today's live mapping** (Bangalore 18:45, code 0, cloud 7%, 5.7 km/h, RH 63, AOD 0.21):

- `u_cover 0.804, u_wind 0.127, u_haze 0.343, u_season 0.764, u_latitude 0.197`, all precip terms 0;
- sun at 17:41 gives `u_sunElev 0.122, u_sunAz 0.958`. (VERIFIED)

---

## c) What the API offers that the site does not use

All fields below were fetched live today for 12.97, 77.59 (`scratchpad/om_current_ext.json`). "Native" means Open-Meteo's docs say 15-minute data is native only for HRRR (North America), ICON-D2 and AROME (Central Europe); elsewhere, including India, it is **interpolated from hourly** (VERIFIED, open-meteo.com/en/docs). So in Bangalore, `current` is really an hourly model value interpolated to 15 minutes.

| signal | Open-Meteo field (units) | today, 18:45 | used now? | what it could drive in the window scene |
|---|---|---|---|---|
| wind direction | `wind_direction_10m` (deg, from) | 242 | NO | which way leaves lean and clouds drift; the sign of rain slant; which sash the rain hits |
| gusts | `wind_gusts_10m` (km/h) | 14.8 (2.6x mean) | NO (the shader fakes gusts, `u_gust` 0.30) | gust factor to `u_gust`; burst timing for leaf flurries |
| wind aloft | `wind_speed_80m/120m/180m`, `wind_direction_80m` | 14.7, 15.3, 18.6 km/h; 259 deg | NO | canopy sway of the tall background trees versus the near tree |
| cloud-level wind | `wind_speed_850hPa`, `wind_direction_850hPa`; `300hPa` | 16.3 at 293 deg; 26.2 at 164 deg | NO | low-deck drift direction; cirrus crossing angle (the shader already fakes a veer) |
| cloud layers | `cloud_cover_low` (below 3 km), `_mid` (3 to 8 km), `_high` (above 8 km) (%) | 2, 3, 1 | NO | low+mid to `u_cover`, high to `u_cirrus` (today cirrus is only implied by cover) |
| precipitation amount | `precipitation`, `rain`, `showers` (mm per interval), `snowfall` (cm) | 0, 0, 0, 0 | NO (intensity is a code bucket) | a continuous `u_precip`; the density of drops on the glass |
| recent rain | `hourly=precipitation&past_hours=N` (mm) | 0 for the last 3 h | NO | "it rained 40 minutes ago": wet glass, drips off the grille and chajja, wet-leaf sheen, sill puddle |
| rain chance | `hourly=precipitation_probability`, `daily=precipitation_probability_max` (%) | 6; 16 | NO | a darkening sky before rain (optional) |
| visibility | `visibility` (m) | 27,100 | NO | depth fog on the far trees; mist; haze distance |
| humidity, dew point | `relative_humidity_2m` (used), `dew_point_2m` (C) | 63; 17.7 | humidity only as a haze fallback | condensation or misting on the glass when the dew point is near the glass temperature (INFERRED, needs a room-temperature assumption) |
| radiation | `shortwave_radiation`, `direct_radiation`, `diffuse_radiation`, `direct_normal_irradiance` (W/m2) | 0 (after sunset) | NO | the true brightness outside; hard versus soft shadows (direct/diffuse ratio); how bright the sun patches in the room are; automatic lamp on and off |
| sunshine | `sunshine_duration` (s per interval) | 0 | NO | whether the sun is actually out right now, for sun beams |
| day flag | `is_day` | 0 | fetched, never read | (redundant with the solar altitude) |
| instability | `cape` (J/kg) | 180 | NO | towering cumulus build-up before a storm code appears |
| lightning | `lightning_potential` (J/kg) | **null** in India, all 6 slots | n/a | NOT available here (HRRR, ICON-D2, AROME only). In Bangalore, lightning can only come from codes 95, 96, 99 |
| moon | `daily=moonrise,moonset,moon_phase` | 17:56, 05:35, 0.485 | NO (the phase is computed locally, the position is modelled) | a real moon in the window, only when the bearing allows it |
| sun times | `daily=sunrise,sunset,daylight_duration` | 06:08, 18:13, 43,471 s | NO (computed locally) | a cross-check only |
| UV | `uv_index`, `daily=uv_index_max` | 0; 8.95 | NO | nothing visual |
| pressure | `pressure_msl`, `surface_pressure` (hPa) | 1011.1; 911.6 | NO | nothing visual |
| freezing level | `freezing_level_height` (m) | 4920 | NO | nothing in Bangalore |
| soil moisture | `soil_moisture_0_to_1cm` (m3/m3) | 0.253 | NO | wet ground (not visible from the desk; INFERRED) |
| aerosols | `aerosol_optical_depth` (used), `pm2_5` (tooltip only), `pm10`, `dust` (ug/m3), `us_aqi` | 0.21, 20, 26.3, 12.0, 47 | AOD only | haze colour (dust makes it warmer), a redder sun on smoggy evenings |
| temperature | `temperature_2m` (tooltip), `apparent_temperature` | 25.3; 27.2 | tooltip only | heat shimmer over the far roofs (surreal option) |

**Not available from any keyless API** (INFERRED; these must be synthesised from sun altitude, date and weather):

- birds (crows and black kites by day, parakeets at dawn, flocks at dusk);
- bats after dusk;
- moths at the lamp at night;
- street lights switching on (civil twilight, sun at -6 degrees);
- city skyglow on low cloud at night;
- aircraft lights;
- seasonal flowering or leaf fall of the tree.

The current shader has NO city skyglow term: a Bangalore night is drawn as a dark-sky site with a Milky Way. (VERIFIED in code)

**The data is a bucket, not a photograph.** At 17:00 today the model said code 2, cloud 57% (low 0%, mid 9%, high 53%). At 18:00 it said code 0, 11%. The 17:41 reference photo shows large sunlit LOW cumulus. (VERIFIED: hourly fetch with `past_hours=6` against `ref_1600.png`) The grid (about 9 to 13 km, INFERRED) misses local convective towers, so a strictly data-true clear sky will often be emptier than the real view.

---

## d) Where the Living Sky is mounted today, and how to reuse it

### d1. Mounts

| route | component | sky | weather? |
|---|---|---|---|
| `/` in scan mode (the default, `useState("scan")`, App.jsx near line 10355) | `Hello3` (`src/hello3/Hello.jsx`) | `.hello-sky > .hello-sky__lens > ShaderCanvas preset="livingSky"`, at `Hello.jsx:286-300` | YES: `fetchSky` plus `sunUniforms` every minute (`:187-224`) |
| `/portfolio` | `Hello3` (App.jsx `isPortfolio ? (` near 10696) | same | YES |
| `/list` | `Home mode="read"` (App.jsx `<WeatherSky />` near 8018) | `WeatherSky.jsx`, the `.weather-sky` band (`index.css` selector `.weather-sky {`) | YES |
| `/hello`, `/hello2` | `src/hello/Hello.jsx:146-155` | `LIVING_SKY_DEFAULTS` plus the clock only | NO (no weather, model sun) |
| `/sky` | `SkyLab.jsx` | single view plus a 15-cell contact sheet | preview mapping |
| `/shaders` | `ShaderGallery.jsx:47-54` | defaults plus clock | NO |

**Hello3 props** (`Hello.jsx:289-297`):

- `uniforms={skyUniforms}`, `clock`, `clockOffsetSeconds={sky?.offset ?? null}`, `tod={pinnedTod}`
- `superSample={SKY_NARROW ? 0.55 : 1}`, where `SKY_NARROW` is `(max-width: 720px)`.

**Query overrides** (`:197-223`):

- `?tod=0.36` pins the hour and forces `u_sunReal: 0`;
- any `?u_name=value` pins that uniform, for example `?u_precip=0.8&u_cover=0.34`.

These are the existing QA hooks. (VERIFIED)

**DOM and CSS of the root sky:**

- `.hello-sky` is `position: fixed` on this page (`hello3.css:759`). Height is `clamp(420px, 62vh, 760px)` and it has `overflow: hidden` (`hello.css:86-96`).
- It carries an eased elliptical radial mask plus a bottom linear mask (`hello.css:97-145`).
- The fallback gradient is `hello.css:152` (dark `:185`).
- It is hidden until the intro stage reaches `settle` or `reveal` (`hello.css:157-171`).

**Opacity** (`hello3.css:1748-1753`):

- `--sky-op` is 1 in light theme and 0.42 in dark (`hello.css:179-185`).
- `opacity = --sky-op * (floor + (1 - floor) * --hero-fade)`, with floor 0.18 in light and 0.75 in dark.
- `--hero-fade` runs 1 to 0 over the first half viewport of scroll, written by a rAF-throttled scroll listener (`Hello.jsx:233-247`).

**Parallax:** the canvas translates -88 px to 0 across the first 760 px of scroll, using `animation-timeline: scroll(root block)` with longhands (`hello.css:209-240`).

**Phone:** the lens is `left/right: -60%` (220% wide), so the shader gets a landscape aspect of about 1.6 (`hello3.css:764-767`).

**Hover:** `SkyTip` (`src/hello/SkyTip.jsx`) lazily calls `fetchSky` on first hover over bare sky and shows the condition, temperature, place, humidity, wind, cloud and PM2.5. (VERIFIED)

**Three.js on the root today:** `hello3/Hello.jsx:37` imports `DjBooth` (which lazy-loads `DjConsole`, three 0.169), but `<DjBooth` is not rendered anywhere in the file. So the root currently loads no three.js. (VERIFIED, grep) The project pins `"three": "^0.169.0"` (`package.json:38`, installed 0.169.0). Only `src/figures/dj/DjConsole.jsx` imports three, including `three/examples/jsm/geometries/RoundedBoxGeometry.js`. That path still exists in r186's export map (`"./examples/jsm/*"`). (VERIFIED) Moving to r186 is a single project-wide bump, and /dj would need a regression check.

### d2. Reuse options

| option | how | cost | fidelity to "just like the living sky" | problems |
|---|---|---|---|---|
| **A. WebGLRenderer + ShaderMaterial into a WebGLRenderTarget** (RECOMMENDED) | the `LIVING_SKY` string verbatim as `fragmentShader`; vertex `v_uv = uv; gl_Position = vec4(position.xy, 0, 1)` on a 2x2 plane with an ortho camera; same uniform names; render to an RT and sample it on the sky plane beyond the trees | lowest. PROVEN today in r186: 1 program, GL error 0, 6 correct skies. r186 `WebGLProgram.js:804-826` injects `#define gl_FragColor pc_fragColor` and `varying`/`attribute` defines for non-raw ShaderMaterial | exact: same source, same mapping, same `fetchSky`/`sunUniforms`; viewer edits re-vendor as today | output is LDR display-referred (see d3); rain and fog are baked into the plate (d4) |
| B. Keep the DOM `ShaderCanvas` behind a transparent three canvas | `alpha: true` renderer, window openings left transparent | none | exact | no parallax as the camera moves; glass, dust, droplets and refraction cannot see the sky; bloom and light wrap cannot spill from the window onto the frame; room light cannot be derived from the sky; two contexts to keep in sync (stage and scroll) |
| C. `ShaderCanvas` DOM canvas to `CanvasTexture` | `needsUpdate` every frame | a cross-context canvas upload per frame, plus an extra WebGL context | exact | the upload cost and the second context buy nothing over A (INFERRED) |
| D. Port to TSL for WebGPURenderer | rewrite hash, noise, fbm (`Loop`), star, rain, snow and main as `Fn` nodes | high: 743 lines, 30+ tuned constants, the realism history | at risk: forks the source of truth (the viewer is WebGL GLSL only), and every future viewer edit needs a hand re-port | `WebGPURenderer` has no ShaderMaterial path (r186 `StandardNodeLibrary.js:64-76` maps only the Mesh*, Line*, Points, Sprite and Shadow materials); `glslFn` exists (`src/nodes/code/FunctionNode.js:177`) but only builds on the GLSL (WebGL2) backend, so the WGSL backend needs `wgslFn` or TSL |
| E. Replace with three's own `Sky` / `SkyMesh` | r186 "Sky, SkyMesh: More realistic clouds (#33942)"; uniforms `turbidity, rayleigh, mieCoefficient, mieDirectionalG, sunPosition, cloudScale, cloudSpeed, cloudCoverage, cloudDensity, cloudElevation, showSunDisc`; the `up` uniform was removed (#34354) | low | NOT the Living Sky: no rain, fog, storm, lightning, moon phase, stars, Milky Way, Belt of Venus, cirrus deck or WMO mapping | useful only as a spherical environment for PMREM or IBL, not as the view |

**r186 facts that matter here** (VERIFIED in the package, `npm pack three@0.186.1`):

- `REVISION = '186'`.
- `examples/jsm/lights/SunLight.js` is new: parallel sun rays with cascaded shadow maps, position-defined with no target (release note "Add SunLight with cascaded shadow maps. #34221"). It is the natural carrier for direct sun through the window.
- `examples/jsm/tsl/WebGLNodesHandler.js` lets TSL node materials run inside `WebGLRenderer`. Its stated limits: no MRT, no transmission, no WebGPU post stack, no storage textures, and fog and environment do not auto-update. So option A still allows TSL for new materials (leaves, glass).
- Render-target viewports are no longer scaled by the pixel ratio (#34333).

### d3. Recommended shape for option A (specifics the build will need)

1. **One renderer, one context.** Render the sky to a `WebGLRenderTarget`, for example 1024x512 or 1536x768.
   - Recorded cost is about 0.8 ms at 2.36 MP, so a 0.8 MP plate is well under 0.5 ms (INFERRED from the recorded measurement).
   - It could also run at 30 Hz: the sky moves slowly, but rain in the plate would stutter, which is one more reason to take rain out (item 5).
2. **Keep the data path untouched.** Call `fetchSky()` and `sunUniforms()` as Hello3 does. Port ShaderCanvas's 0.55 s exponential ease to the uniform objects. Drive `u_tod` from the location offset exactly as `ShaderCanvas.timeOfDay()` does (`ShaderCanvas.jsx:179-188`).
   - Set `u_resolution` to the RT size, not the canvas size, because rain pixel sizes key off it.
   - Feed `u_time` from the scene clock, so leaves can share the gust phase (item 6).
3. **Treat it as an emissive HDR plate.** The shader writes display-referred 0 to 1 with its own highlight rolloff and dither. Tag the RT texture `SRGBColorSpace` so three decodes it to linear. Put it on a `MeshBasicMaterial` (or a node material) with `toneMapped: false`, or with a deliberate multiplier.
   - In the 17:41 photo the window sky sits at sRGB 145 to 180 and the cream wall at about 28. Through iPhone HDR tone mapping that is roughly 3 to 4 stops of scene contrast (INFERRED).
   - The window has to be the brightest thing in the frame without double-grading the shader's own rolloff.
4. **Window light from the plate.** Generate mipmaps on the RT, or read back a 1x1 average every few seconds, to colour and scale the window's area light (for example `RectAreaLight`) and the room's ambient. The room then goes gold at golden hour and blue-grey under rain with no separate table (INFERRED approach).
5. **Split what must be in front of the trees.** Rain, fog and lightning are drawn in the plate today, which puts them BEHIND the trees. The window needs three things:
   - rain as a scene layer between the trees and the glass (plus drops on the glass);
   - depth fog on the trees from `visibility` and `u_fog`;
   - a lightning flash that also lights the room and the frame.
   That means the plate should run with its in-plate rain OFF (pass `u_precip` only to cloud and gloom logic) or with a new switch. Lightning should be decided in JS and passed in (item 7).
6. **One wind for everything.** The plate's gust is `gustNow = 1 + u_gust * (cos(0.085 t) + 0.55 cos(0.23 t + 1.7))` (`washes.js:801`). Replicate it in JS with the same `t`, so the leaves, the clouds and the rain slant pulse together. Set `u_gust` from the real gust factor, for example `clamp((wind_gusts_10m / wind_speed_10m - 1) * 0.3, 0, 0.6)` (INFERRED mapping, to tune).
7. **Changes to make in the SOURCE preset first** (the house rule: edit `living-sky.frag`, rebuild, re-vendor; never edit `washes.js` directly). Each needs a default that keeps today's pages pixel-identical:
   - `u_viewAz`, `u_fovH`: the window bearing and the plate's horizontal field. Frame x becomes `(sunAzimuth - u_viewAz) / u_fovH + 0.5`, so the sun (and its glow) is in frame only when it really is outside that window. Requires adding a compass azimuth to `solarPosition()` (today it returns the hour angle only).
   - `u_moonReal`, `u_moonElev`, `u_moonAz`: the real moon position. Compute it in JS: a low-precision lunar ephemeris is about 30 lines (INFERRED), or approximate it from Open-Meteo's `moonrise`/`moonset`.
   - `u_windDir`: the drift direction of both decks and the rain slant sign, from `wind_direction_850hPa` for clouds and `wind_direction_10m` for rain.
   - `u_flash` (0 to 1) and `u_flashX`: JS-driven lightning, so the room can flash with it. Keep the internal strike cycle when `u_flash` is unused.
   - `u_skyglow` plus a colour: an orange-grey city glow at night, stronger under low cloud (Bangalore is not a dark-sky site).
   - An option to suppress in-plate precipitation and fog (item 5).
8. **Scroll and theme continuity.** Today's page fades the sky to an 18% floor below the hero in light theme (75% in dark), because a bright fixed sky washed over the cards (`hello3.css:1735-1753`, Agam 16 Sep "light mode broken"). The window scene has the same legibility job. Its equivalent is exposure and scrim control on the 3D frame, not CSS opacity on the sky alone.

### d4. Gaps between the current sky and a window view (summary)

| gap | today | window needs |
|---|---|---|
| view direction | the frame faces the equator; the sun crosses it left to right daily | the real window bearing; the sun in view only at the right azimuths |
| moon position | modelled from `tod + phase` | real rise, set and azimuth (tonight is full moon, rising 17:56) |
| wind direction | always +x | real direction for clouds, rain and leaves |
| gusts | synthetic 74 s and 27 s sines | real gust factor for amplitude; shared phase with the leaves |
| rain, fog, lightning | inside the plate | scene layers in front of the trees, plus glass effects and a room flash |
| night sky | dark-sky Milky Way, `u_stars` 0.85 | a city sky decision (question Q4) |
| high cloud | derived from cover | `cloud_cover_high` |
| fallback look | Overcast | a decision (probably clear-ish with some cumulus) |
| attribution | none | CC BY 4.0 credit for Open-Meteo |

---

## e) Candidate questions for Agam (only ones whose answers change code or visuals)

1. Whose sky is outside the window: the visitor's (today's behaviour, IP-located) or Agam's real Bangalore sky and clock?
2. Which compass direction does the window face? (INFERRED from the 17:41 photo: the clouds are lit gold on their LEFT while the sun was at azimuth 267 and 7 degrees up, so the window most likely faces north to north-west and the sun is never in view.)
3. What was "add the ones": winds, rains, moons, birds, sounds?
4. The night sky: true Bangalore city sky (skyglow, few stars) or a dreamlike dark sky with the Milky Way?
5. When it rains: closed glass with drops and streaks, the open sash with rain falling past the grille, or both? And should it stay wet after the rain stops?
6. When is the desk lamp on?
7. How does the site's dark and light theme toggle interact with a time-true scene?
8. Strictly data-true clouds, or a floor of Bangalore-style cumulus so "Clear" is never an empty sky?
9. Is time only real, or can a visitor move it?

(The structured result carries each with options, a recommendation and why it changes the build.)
