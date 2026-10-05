import { useEffect, useMemo, useState } from "react";
import ShaderCanvas from "./ShaderCanvas";
import { fetchSky, sunUniforms } from "./lib/weather";
import { LIVING_SKY_DEFAULTS } from "./shaders/washes";

// The home header's sky: the Living Sky preset driven by the viewer's real local
// clock and their real current weather (see src/lib/weather.js for the two hops).
//
// It mounts with the neutral defaults and eases into the fetched conditions when
// they land — ShaderCanvas tweens numeric uniforms, so the arrival of the data is
// a change in the weather rather than a cut. If both hops fail nothing breaks:
// the sky simply runs on clock and season, which is what it did before.
//
// `caption` prints the place and conditions, so the effect is legible instead of
// mysterious ("that is my sky", not "nice gradient").
export default function WeatherSky({ caption = true, className = "" }) {
  const [sky, setSky] = useState(null);
  // Ticks once a minute purely to recompute where the sun is. The weather is
  // fetched every fifteen; the sun moves the whole time, and a sky whose light
  // is an hour stale is the kind of wrong nobody can name but everybody feels.
  const [minute, setMinute] = useState(0);

  useEffect(() => {
    let alive = true;
    const load = () => fetchSky().then((s) => alive && setSky(s)).catch(() => {});
    load();
    const id = setInterval(load, 15 * 60 * 1000); // cadence of the upstream data
    const tick = setInterval(() => alive && setMinute((m) => m + 1), 60 * 1000);
    return () => {
      alive = false;
      clearInterval(id);
      clearInterval(tick);
    };
  }, []);

  // Real solar geometry for the located place, which replaces the shader's own
  // time-of-day model of the sun (declination and the equation of time are worth
  // up to about forty minutes at the solstices - see solarPosition). Falls back to
  // the model, unchanged, until the location is known.
  const uniforms = useMemo(() => {
    if (!sky?.uniforms) return LIVING_SKY_DEFAULTS;
    if (!sky.place || !Number.isFinite(sky.place.lat)) return sky.uniforms;
    return { ...sky.uniforms, ...sunUniforms(sky.place) };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sky, minute]);

  // How far past sunset we are, 0 by day and 1 once it is properly dark. The band
  // holds the sky down with an opacity and a --bg scrim, both sized for the worst
  // case: a BRIGHT sky behind dark text. After dark that protection is aimed at a
  // threat that is not there - the sky is already darker than the page - and what
  // it actually erases is the only things that make a night sky legible as one,
  // the stars and the moon. So the treatment relaxes as the sun goes down.
  const night = (() => {
    const e = uniforms?.u_sunReal ? uniforms.u_sunElev : null;
    if (e === null || e === undefined) return 0;
    return Math.max(0, Math.min(1, (0.03 - e) / 0.22));
  })();

  return (
    <div
      className={`weather-sky ${className}`.trim()}
      style={{ "--sky-night": night.toFixed(3) }}
    >
      {/* the sky is held down (opacity, scrim, mask) in its own layer, so the
          caption is not dimmed by the treatment that keeps the type legible */}
      <div className="weather-sky__layer" aria-hidden="true">
        <ShaderCanvas
          preset="livingSky"
          className="weather-sky__canvas"
          clock
          clockOffsetSeconds={sky?.offset ?? null}
          uniforms={uniforms}
        />
      </div>
      {caption && sky?.live && (
        <p className="weather-sky__caption">
          {sky.place.city ? `${sky.place.city} · ` : ""}
          {sky.label}
          {sky.temp !== null ? ` · ${sky.temp}°` : ""}
        </p>
      )}
    </div>
  );
}
