// A WEATHER TOOLTIP OVER THE SKY (annotation msubv16w, "if I hover in this
// area show me a tooltip with the data from our weather API"). The /hello sky
// band is decoration - pointer-events: none - so this lays a hit surface over
// it, UNDER the hero's own content (which stays on top and keeps its own
// hovers), and while the pointer is on bare sky a small glass pill follows it
// with what the sky is drawing: place, condition, temperature, humidity, wind
// and the air. The data is fetchSky() - the same call the index page's
// WeatherSky makes, cached in sessionStorage for 15 minutes - fetched on the
// first hover rather than on load, so a visitor who never points at the sky
// never pays for the two requests.

import { useEffect, useRef, useState } from "react";
import { FireFlame, SnowFlake, SunLight, TemperatureLow } from "iconoir-react";
import { fetchSky } from "../lib/weather";

// A temperature icon before the reading (07 Sep 2026, "add a dynamic icon that
// changes based on temperature"). It follows the TEMPERATURE, not the sky code
// (the label already says what the sky is doing). Four celsius bands, cut
// where the word people reach for changes: cold, cool, warm, hot.
function tempIcon(t) {
  const p = { width: 14, height: 14, strokeWidth: 1.7, "aria-hidden": true, className: "hello-sky__tip-icon" };
  if (t == null) return null;
  if (t <= 8) return <SnowFlake {...p} />;
  if (t <= 17) return <TemperatureLow {...p} />;
  if (t <= 32) return <SunLight {...p} />;
  return <FireFlame {...p} />;
}

export default function SkyTip() {
  const [sky, setSky] = useState(null);
  const [on, setOn] = useState(false);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const asked = useRef(false);

  const load = () => {
    if (asked.current) return;
    asked.current = true;
    fetchSky()
      .then(setSky)
      .catch(() => setSky({ live: false }));
  };

  useEffect(() => {
    if (!on) return undefined;
    const onKey = (e) => e.key === "Escape" && setOn(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [on]);

  const place = sky?.place;
  const where = place ? [place.city, place.region].filter(Boolean).join(", ") : null;
  const c = sky?.current;
  const air = sky?.air;

  // BARE SKY IS DECIDED BY WHAT IS UNDER THE POINTER, not by a layer of its
  // own: the hero section (z 1) covers the sky band edge to edge, so a hit
  // layer beneath it would never see the pointer, and one above it would
  // steal the greeting's own hovers. So this listens at the document, and the
  // tooltip is on while the pointer is inside the sky band AND the element
  // under it is structural - the section, its inner column, the sky itself -
  // rather than a word, a link, the badge or a phone.
  useEffect(() => {
    const BARE = new Set(["hello", "hello-hero", "hello-hero__inner", "hello-sky", "hello-sky__hit", "hello-sky__canvas"]);
    const onMove = (e) => {
      if (e.pointerType === "touch") return;
      const band = document.querySelector(".hello-sky");
      if (!band) return;
      const r = band.getBoundingClientRect();
      const inBand = e.clientY >= r.top && e.clientY <= r.bottom;
      const el = document.elementFromPoint(e.clientX, e.clientY);
      const cls = el?.classList;
      const bare = !!cls && [...cls].some((c) => BARE.has(c));
      const want = inBand && bare;
      if (want) {
        load();
        setPos({ x: e.clientX, y: e.clientY });
      }
      setOn(want);
    };
    const off = () => setOn(false);
    document.addEventListener("pointermove", onMove, { passive: true });
    document.addEventListener("pointerleave", off);
    return () => {
      document.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerleave", off);
    };
  }, []);

  return (
    <>
      <div
        className="hello-sky__tip"
        data-on={on ? "true" : undefined}
        style={{ "--x": `${pos.x}px`, "--y": `${pos.y}px` }}
        role="status"
        aria-live="polite"
        aria-hidden={!on}
      >
        {!sky ? (
          <span className="hello-sky__tip-dim">Reading the sky…</span>
        ) : !sky.live ? (
          <span className="hello-sky__tip-dim">No live reading right now; the sky runs on clock and season.</span>
        ) : (
          <>
            <span className="hello-sky__tip-line">
              {tempIcon(sky.temp)}
              <strong>{sky.label}</strong>
              {sky.temp != null ? ` · ${sky.temp}°` : ""}
              {where ? <span className="hello-sky__tip-dim"> · {where}</span> : null}
            </span>
            <span className="hello-sky__tip-dim hello-sky__tip-line">
              {[
                c?.humidity != null ? `humidity ${Math.round(c.humidity)}%` : null,
                c?.wind != null ? `wind ${Math.round(c.wind)} km/h` : null,
                c?.cloud != null ? `cloud ${Math.round(c.cloud)}%` : null,
                air?.pm25 != null ? `PM2.5 ${Math.round(air.pm25)}` : null,
              ]
                .filter(Boolean)
                .join(" · ")}
            </span>
          </>
        )}
      </div>
    </>
  );
}
