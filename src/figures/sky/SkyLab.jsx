// SkyLab (/sky) · every state the Living Sky can be in, on one surface.
//
// The shader now carries the whole weather vocabulary plus a 24-hour clock, four
// seasons and a latitude, which is far more combinations than a shader gallery
// tile can show. This is the surface for judging them: a full-bleed sky with a
// dock of toggles under it, and a contact-sheet mode that puts every condition on
// screen at once under one fixed time so they can be compared rather than
// remembered.
//
// Unlisted, like /shaders and /lab. It reads the SAME mapping the live home page
// reads (src/lib/weather.js), so it is a preview of the real thing rather than a
// second set of numbers that can drift.

import { useEffect, useRef, useState } from "react";
import ShaderCanvas from "../../ShaderCanvas";
import { CONDITIONS, conditionUniforms, solarPosition } from "../../lib/weather";
import { LIVING_SKY_DEFAULTS } from "../../shaders/washes";
import "./skyLab.css";

// Hours worth stopping at, not an even sweep: the sky changes fastest around the
// two crossings, so dawn and dusk get more stops than the middle of the day.
const TIMES = [
  { id: "night", label: "Night", tod: 0.02 },
  { id: "predawn", label: "Pre-dawn", tod: 0.21 },
  { id: "dawn", label: "Dawn", tod: 0.27 },
  { id: "morning", label: "Morning", tod: 0.36 },
  { id: "noon", label: "Noon", tod: 0.5 },
  { id: "afternoon", label: "Afternoon", tod: 0.64 },
  // 0.745, not 0.72: at tropical latitude in summer the sun is still ~14 degrees
  // up at 0.72, which the shader correctly renders as ordinary afternoon. Golden
  // hour is the sun under ~6 degrees, and that is here.
  { id: "golden", label: "Golden", tod: 0.745 },
  { id: "dusk", label: "Dusk", tod: 0.775 },
  { id: "live", label: "Live", tod: null }, // null = run on the wall clock
];

// u_season is a phase, not a scale: 0/1 is deep winter and 0.5 is midsummer, so
// spring and autumn are the two quarter points and they are NOT interchangeable
// (the shader also reads day length and palette warmth off it).
const SEASONS = [
  { id: "winter", label: "Winter", season: 0.0 },
  { id: "spring", label: "Spring", season: 0.25 },
  { id: "summer", label: "Summer", season: 0.5 },
  { id: "autumn", label: "Autumn", season: 0.75 },
];

// Longitudes matter once the REAL sun is switched on: solar noon is a function of
// where you are in your time zone, not of the hour alone.
const PLACES = [
  { id: "tropic", label: "Tropics", lat: 12.9, lon: 77.6 },    // Bangalore
  { id: "temperate", label: "Temperate", lat: 45, lon: 9.2 },  // Milan
  { id: "north", label: "Far north", lat: 60, lon: 10.8 },     // Oslo
  { id: "polar", label: "Polar", lat: 69, lon: 18.9 },         // Tromso, aurora country
];

// The look parameters: constants that were baked into the shader and are now
// dials. Weather chooses the CONDITION; these choose how that condition is drawn,
// which is a different axis and deserves separate controls.
const LOOK = [
  { key: "u_scale",  label: "Cloud scale", min: 1, max: 7, step: 0.1,
    hint: "bigger number, smaller clouds" },
  { key: "u_persp",  label: "Perspective", min: 0, max: 1, step: 0.01,
    hint: "0 flat field · 1 deck seen from below" },
  { key: "u_cirrus", label: "High cloud", min: 0, max: 2, step: 0.05,
    hint: "cirrus on top of what cover implies" },
  { key: "u_gust",   label: "Gustiness", min: 0, max: 0.6, step: 0.01,
    hint: "0 steady · 0.3 breezy · 0.6 squally" },
  { key: "u_evolve", label: "Evolution", min: 0, max: 4, step: 0.05,
    hint: "how fast shapes form and dissipate" },
  { key: "u_glare",  label: "Sun glare", min: 0, max: 2, step: 0.05,
    hint: "aureole strength" },
  { key: "u_moonph", label: "Moon phase", min: 0, max: 1, step: 0.01,
    hint: "0 new · 0.5 full · 1 new" },
  { key: "u_sat",    label: "Saturation", min: 0, max: 1.6, step: 0.05, hint: "" },
  { key: "u_exposure", label: "Exposure", min: 0.5, max: 1.6, step: 0.01, hint: "" },
];
const LOOK_DEFAULTS = Object.fromEntries(LOOK.map((l) => [l.key, LIVING_SKY_DEFAULTS[l.key]]));

const WINDS = [
  { id: "still", label: "Still", wind: 2 },
  { id: "breeze", label: "Breeze", wind: 14 },
  { id: "gale", label: "Gale", wind: 40 },
];

function Toggle({ label, options, value, onChange, idKey = "id" }) {
  const segRef = useRef(null);
  // The rows scroll sideways on a phone, so the selected chip can end up off its
  // own track — and a toggle you cannot see the state of is not a toggle. Pull it
  // back into view whenever it changes (block: nearest, or this would also scroll
  // the dock itself).
  useEffect(() => {
    const on = segRef.current?.querySelector("[data-on]");
    on?.scrollIntoView({ inline: "center", block: "nearest", behavior: "smooth" });
  }, [value]);
  return (
    <div className="skylab__group">
      <span className="skylab__grouplabel">{label}</span>
      <div className="skylab__seg" role="group" aria-label={label} ref={segRef}>
        {options.map((o) => (
          <button
            key={o[idKey]}
            type="button"
            className="skylab__chip"
            data-on={o[idKey] === value || undefined}
            aria-pressed={o[idKey] === value}
            onClick={() => onChange(o[idKey])}
          >
            {o.label}
          </button>
        ))}
      </div>
    </div>
  );
}

export default function SkyLab({ onBack }) {
  const [conditionCode, setConditionCode] = useState(0);
  const [timeId, setTimeId] = useState("noon");
  const [seasonId, setSeasonId] = useState("summer");
  const [placeId, setPlaceId] = useState("tropic");
  const [windId, setWindId] = useState("breeze");
  const [grid, setGrid] = useState(false);
  // The home page drives the sun from real solar geometry (u_sunReal); the lab drove
  // it from the shader's own time-of-day model. That meant the preview stopped
  // covering the path that actually ships - so it is a toggle now, and the readout
  // prints the resulting altitude so the two can be compared directly.
  const [realSun, setRealSun] = useState(false);
  const [look, setLook] = useState(LOOK_DEFAULTS);
  const [showLook, setShowLook] = useState(false);
  const lookDirty = LOOK.some((l) => look[l.key] !== LOOK_DEFAULTS[l.key]);

  const time = TIMES.find((t) => t.id === timeId);
  const season = SEASONS.find((s) => s.id === seasonId);
  const place = PLACES.find((p) => p.id === placeId);
  const wind = WINDS.find((w) => w.id === windId);
  const opts = { lat: place.lat, season: season.season, wind: wind.wind };

  const condition = CONDITIONS.find((c) => c.code === conditionCode);
  const base = conditionUniforms(conditionCode, opts);
  // Real solar geometry for the chosen place at the chosen hour, today. `time.tod`
  // is a fraction of the local day, so it is turned back into a local Date before
  // the sun is computed from it.
  const sun = (() => {
    if (!realSun) return null;
    const now = new Date();
    const tod = time.tod ?? (now.getHours() * 3600 + now.getMinutes() * 60) / 86400;
    // The time chips mean LOCAL time at the place being previewed, not the viewer's.
    // Using the viewer's clock made "Far north at Noon" render Oslo at 08:30 CEST
    // (21.6 degrees up) because the machine is on IST - correct arithmetic, wrong
    // question. Local mean solar time is the hour minus the longitude offset.
    const utcHours = tod * 24 - place.lon / 15;
    const d = new Date(Date.UTC(
      now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(),
      0, Math.round(utcHours * 60), 0
    ));
    return solarPosition(place.lat, place.lon, d);
  })();
  const withLook = { ...base, ...look };
  const uniforms = sun
    ? { ...withLook, u_sunReal: 1, u_sunElev: sun.sinAlt, u_sunAz: Math.max(-0.25, Math.min(1.25, sun.frameX)) }
    : withLook;

  return (
    <div className="skylab" data-grid={grid || undefined}>
      {grid ? (
        // Contact sheet: one canvas per condition, every other parameter held
        // equal. Fifteen live GL contexts is close to the browser's limit (~16),
        // which is exactly why the single view exists and is the default.
        <div className="skylab__grid">
          {CONDITIONS.map((c) => (
            <figure className="skylab__cell" key={c.code}>
              <div className="skylab__cellstage">
                <ShaderCanvas
                  preset="livingSky"
                  className="skylab__canvas"
                  clock
                  tod={time.tod}
                  uniforms={conditionUniforms(c.code, opts)}
                />
              </div>
              <figcaption className="skylab__cap">
                <span>{c.label}</span>
                <span className="skylab__code">{c.code}</span>
              </figcaption>
            </figure>
          ))}
        </div>
      ) : (
        <div className="skylab__stage">
          <ShaderCanvas
            preset="livingSky"
            className="skylab__canvas"
            clock
            tod={time.tod}
            uniforms={uniforms}
          />
          <div className="skylab__readout">
            <p className="skylab__title">{condition.label}</p>
            <p className="skylab__sub">
              {time.label} · {season.label} · {place.label} · {wind.label} wind
              {sun ? ` · real sun ${sun.altDeg.toFixed(1)}°` : " · model sun"}
            </p>
            {/* the actual numbers going into the shader, so a look that seems
                wrong can be traced to the mapping rather than guessed at */}
            <dl className="skylab__vals">
              {["u_cover", "u_precip", "u_kind", "u_fog", "u_storm", "u_haze", "u_wind"].map((k) => (
                <div key={k}>
                  <dt>{k.replace("u_", "")}</dt>
                  <dd>{uniforms[k].toFixed(2)}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      )}

      <div className="skylab__dock">
        <div className="skylab__dockhead">
          <button type="button" className="skylab__back" onClick={onBack}>
            ← Back
          </button>
          <span className="skylab__name">The living sky · every state</span>
          <button
            type="button"
            className="skylab__chip skylab__chip--mode"
            data-on={showLook || undefined}
            aria-pressed={showLook}
            onClick={() => setShowLook((v) => !v)}
          >
            Parameters{lookDirty ? " •" : ""}
          </button>
          <button
            type="button"
            className="skylab__chip skylab__chip--mode"
            data-on={grid || undefined}
            aria-pressed={grid}
            onClick={() => setGrid((g) => !g)}
          >
            {grid ? "Single" : "All conditions"}
          </button>
        </div>

        {showLook && (
          <div className="skylab__look">
            {LOOK.map((l) => (
              <label className="skylab__slider" key={l.key} title={l.hint}>
                <span className="skylab__slabel">{l.label}</span>
                <input
                  type="range"
                  min={l.min}
                  max={l.max}
                  step={l.step}
                  value={look[l.key]}
                  onChange={(e) =>
                    setLook((v) => ({ ...v, [l.key]: parseFloat(e.target.value) }))
                  }
                />
                <span className="skylab__sval">{look[l.key].toFixed(2)}</span>
              </label>
            ))}
            <button
              type="button"
              className="skylab__chip"
              disabled={!lookDirty}
              onClick={() => setLook(LOOK_DEFAULTS)}
            >
              Reset
            </button>
          </div>
        )}

        {!grid && (
          <Toggle
            label="Weather"
            options={CONDITIONS.map((c) => ({ ...c, id: c.code }))}
            value={conditionCode}
            onChange={setConditionCode}
          />
        )}
        <Toggle label="Time" options={TIMES} value={timeId} onChange={setTimeId} />
        <Toggle
          label="Sun"
          options={[
            { id: false, label: "Model" },
            { id: true, label: "Real (as shipped)" },
          ]}
          value={realSun}
          onChange={setRealSun}
        />
        <Toggle label="Season" options={SEASONS} value={seasonId} onChange={setSeasonId} />
        <Toggle label="Latitude" options={PLACES} value={placeId} onChange={setPlaceId} />
        <Toggle label="Wind" options={WINDS} value={windId} onChange={setWindId} />
      </div>
    </div>
  );
}
