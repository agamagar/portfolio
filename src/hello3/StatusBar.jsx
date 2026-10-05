import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { FireFlame, SnowFlake, SunLight, TemperatureLow } from "iconoir-react";
import { fetchSky } from "../lib/weather";

// The icon follows the TEMPERATURE, not the sky code (the label already says
// what the sky is doing). Four bands in celsius; the cut points are where the
// word people reach for changes: cold, cool, warm, hot.
function tempIcon(t) {
  const p = { width: 14, height: 14, strokeWidth: 1.7, "aria-hidden": true };
  if (t == null) return null;
  if (t <= 8) return <SnowFlake {...p} />;
  if (t <= 17) return <TemperatureLow {...p} />;
  if (t <= 32) return <SunLight {...p} />;
  return <FireFlame {...p} />;
}

// mtqt7wsl: the live weather line as a STATUS BAR at the top of the hero, not
// the cursor-following tooltip /hello shows over the bare sky. Same source
// (src/lib/weather fetchSky: the Open-Meteo reading behind the living sky) and
// the same two lines, loaded once on mount. The bar hugs its content, so the
// tooltip's 320px cap does not apply here.
export default function StatusBar() {
  const [sky, setSky] = useState(null);
  // mtqtcc6f: the bar lives in the top-right controls row, parallel to the
  // sound and theme toggles. That row is App's fixed `.top-controls`, so the
  // bar portals into it as its first child rather than sitting in the hero.
  const [host, setHost] = useState(null);
  useEffect(() => { setHost(document.querySelector(".top-controls")); }, []);
  useEffect(() => {
    let alive = true;
    fetchSky().then((s) => alive && setSky(s)).catch(() => alive && setSky({ live: false }));
    return () => { alive = false; };
  }, []);
  const place = sky?.place;
  const where = place ? [place.city, place.region].filter(Boolean).join(", ") : null;
  const c = sky?.current;
  const air = sky?.air;
  if (!host) return null;
  return createPortal(
    <div className="hello-status" role="status" aria-live="polite" data-more={sky?.live ? "hover" : undefined}>
      {!sky ? (
        <span className="hello-status__dim">Reading the sky…</span>
      ) : !sky.live ? (
        <span className="hello-status__dim">No live reading right now; the sky runs on clock and season.</span>
      ) : (
        <>
          {/* the simple view: icon, subject, temperature. Everything else sits
              in __more and slides open on hover (request of 07 Sep 2026). */}
          <span className="hello-status__icon">{tempIcon(sky.temp)}</span>
          <span className="hello-status__main">
            <strong>{sky.label}</strong>
            {sky.temp != null ? ` · ${sky.temp}°` : ""}
          </span>
          <span className="hello-status__more">
            <span className="hello-status__more-in hello-status__dim">
              {[
                where,
                c?.humidity != null ? `humidity ${Math.round(c.humidity)}%` : null,
                c?.wind != null ? `wind ${Math.round(c.wind)} km/h` : null,
                c?.cloud != null ? `cloud ${Math.round(c.cloud)}%` : null,
                air?.pm25 != null ? `PM2.5 ${Math.round(air.pm25)}` : null,
              ].filter(Boolean).map((t) => ` · ${t}`).join("")}
            </span>
          </span>
        </>
      )}
    </div>,
    host,
  );
}
