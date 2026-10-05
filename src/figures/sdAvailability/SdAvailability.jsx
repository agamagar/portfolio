// /sd-availability : Scheduled Delivery slot availability, Jan 1 to Sep 3 2026,
// replayed as a live tape through `liveline` (canvas, real-time chart lib).
// The chart wants a streaming feed, so we replay the daily series: one day per
// tick, ~10 days a second, and the tape scrolls like a market feed. The two
// outages (Mar 4-26 and Apr 6-15) then read as what they were: cliffs.
// Data: public/data/sd_slot_availability_daily_2026.csv (Databricks pull, 2026-09-03).
import { useEffect, useMemo, useRef, useState } from "react";
import { Liveline } from "liveline";

// liveline pins the right edge of its window to the real clock (Date.now()),
// so the replay runs on real seconds: one day of data = 1/SPEED seconds of tape.
const SPEED_DAYS_PER_SEC = 10;
const DAY = 1 / SPEED_DAYS_PER_SEC; // seconds of tape per day

function parseCsv(text) {
  const [head, ...rows] = text.replace(/\r/g, "").trim().split("\n");
  const cols = head.split(",");
  return rows.map((r) => {
    const v = r.split(",");
    const o = {};
    cols.forEach((c, i) => (o[c] = v[i]));
    return {
      date: o.date,
      unix: Math.floor(Date.parse(o.date + "T00:00:00Z") / 1000),
      carts: +o.carts_with_products,
      sd: +o.carts_with_sd_slots,
      pct: +o.sd_slot_availability_pct,
      dod: o.dod_availability_pp === "" ? null : +o.dod_availability_pp,
    };
  });
}

const fmtUnix = (u) =>
  new Date(u * 1000).toLocaleDateString("en-GB", { day: "numeric", month: "short", timeZone: "UTC" });
const fmtM = (v) => (v / 1e6).toFixed(1) + "M";

function useTheme() {
  const get = () => (document.documentElement.classList.contains("dark") ? "dark" : "light");
  const [t, setT] = useState(get);
  useEffect(() => {
    const mo = new MutationObserver(() => setT(get()));
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    return () => mo.disconnect();
  }, []);
  return t;
}

export default function SdAvailability({ onBack, hero = false }) {
  const theme = useTheme();
  const [rows, setRows] = useState(null);
  const [n, setN] = useState(0); // how many days have been "played"
  const [playing, setPlaying] = useState(true);
  const [windowDays, setWindowDays] = useState(260); // mtmh7d45: default to All
  const [mode, setMode] = useState("pct"); // pct | carts
  const raf = useRef(0);
  const hold = useRef(0);
  const t0 = useRef(Date.now() / 1000); // tape time of day 0
  const tapeTime = (i) => t0.current + i * DAY;
  const fmtTape = (t) => {
    if (!rows) return "";
    const i = Math.max(0, Math.min(rows.length - 1, Math.round((t - t0.current) / DAY)));
    return fmtUnix(rows[i].unix);
  };

  useEffect(() => {
    // 5 Oct (going live): the public build reads a percentages-only copy (date,
    // %, day-on-day); the raw cart counts stay local and out of git
    fetch(import.meta.env.VITE_PUBLIC_SITE === "1" ? "/data/sd_slot_availability_pct_2026.csv" : "/data/sd_slot_availability_daily_2026.csv")
      .then((r) => r.text())
      .then((t) => setRows(parseCsv(t)));
  }, []);

  // Replay clock. One tick per frame, fractional days accumulate so the pace
  // is independent of frame rate.
  useEffect(() => {
    if (!rows || !playing) return;
    // Re-anchor so the last played day sits at "now", then advance in real time.
    t0.current = Date.now() / 1000 - n * DAY;
    const step = () => {
      const next = Math.min(rows.length, Math.floor((Date.now() / 1000 - t0.current) / DAY));
      setN(next);
      if (next < rows.length) raf.current = requestAnimationFrame(step);
      // End of tape: hold, then loop. liveline's pause drifts over dropped
      // frames (dt is clamped), so a frozen end state scrolls off within a
      // minute; a loop keeps the clock honest.
      else hold.current = setTimeout(() => { setN(0); t0.current = Date.now() / 1000; raf.current = requestAnimationFrame(step); }, 2500);
    };
    raf.current = requestAnimationFrame(step);
    return () => { cancelAnimationFrame(raf.current); clearTimeout(hold.current); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rows, playing]);

  const played = useMemo(() => (rows ? rows.slice(0, Math.max(n, 1)) : []), [rows, n]);
  const cur = played[played.length - 1];

  const pctData = useMemo(() => played.map((r, i) => ({ time: tapeTime(i), value: r.pct })), [played]); // eslint-disable-line react-hooks/exhaustive-deps
  const cartsSeries = useMemo(
    () => [
      { id: "carts", label: "Carts with products", color: "#8a8a8a", data: played.map((r, i) => ({ time: tapeTime(i), value: r.carts })), value: cur?.carts ?? 0 },
      { id: "sd", label: "Carts with an SD slot", color: theme === "dark" ? "#7ab8ff" : "#1f5fbf", data: played.map((r, i) => ({ time: tapeTime(i), value: r.sd })), value: cur?.sd ?? 0 },
    ],
    [played, cur, theme],
  );

  // Contrast-checked pair (4.5:1 text on both grounds): #1f5fbf on white 6.3:1, #7ab8ff on #111 9.4:1.
  const accent = theme === "dark" ? "#7ab8ff" : "#1f5fbf";
  const ink = theme === "dark" ? "#e8e2d6" : "#111";
  const mute = theme === "dark" ? "#9a958c" : "#6b6b6b";

  const replay = () => {
    setN(0);
    setPlaying(true);
  };

  const windows = [
    { label: "30d", secs: 30 * DAY },
    { label: "90d", secs: 90 * DAY },
    { label: "All", secs: 260 * DAY },
  ];

  const worst = useMemo(() => (rows ? rows.reduce((a, b) => (b.pct < a.pct ? b : a)) : null), [rows]);

  // Both charts stay mounted and swap by visibility: a liveline that mounts
  // while already paused never captures a "now" and draws nothing.
  // Annotation mtmgg8vx ("x axis not visible"): liveline sizes its canvas to
  // the container's contentRect but stacks the window-toggle row ABOVE it, so
  // the canvas ran 26px past the box and the frame's overflow:hidden ate the
  // time axis. Reserve the toggle row's height so canvas + toggle fit the box.
  const TOGGLE_H = 26;
  const layer = (on) => ({ position: "absolute", inset: `0 0 ${TOGGLE_H}px`, visibility: on ? "visible" : "hidden" });
  const chart = rows ? (
    <div style={{ position: "relative", height: "100%" }}>
      <div style={layer(mode === "pct")}>
        <Liveline
          data={pctData}
          value={cur?.pct ?? 0}
          color={accent}
          theme={theme}
          window={windowDays * DAY}
          windows={windows}
          onWindowChange={(s) => setWindowDays(s / DAY)}
          windowStyle="text"
          referenceLine={{ value: 85, label: "85% floor" }}
          formatValue={(v) => v.toFixed(1) + "%"}
          formatTime={fmtTape}
          scrub
          pulse
          momentum
          lerpSpeed={0.2}
          paused={!playing}
        />
      </div>
      <div style={layer(mode === "carts")}>
        <Liveline
          data={[]}
          value={0}
          series={cartsSeries}
          theme={theme}
          window={windowDays * DAY}
          windows={windows}
          onWindowChange={(s) => setWindowDays(s / DAY)}
          windowStyle="text"
          formatValue={fmtM}
          formatTime={fmtTape}
          scrub
          pulse
          lerpSpeed={0.2}
          paused={!playing}
        />
      </div>
    </div>
  ) : (
    <div style={{ padding: 24, color: mute }}>Loading the tape…</div>
  );

  if (hero) {
    // Inside the case-study header frame: the tape plus a one-line readout.
    return (
      // Annotation mtmgyd3l: taller, and the plot runs edge to edge of the card.
      // mukx9cdw (28 Sep): controls and tape read as ONE block, no side padding
      <div style={{ display: "flex", flexDirection: "column", width: "100%", height: "min(64vh, 560px)", fontFamily: "Inter, system-ui, sans-serif" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, padding: "0 0 8px", fontSize: 12, color: mute, flexWrap: "wrap" }}>
          <span>
            Slot availability, 2026, replayed live ·{" "}
            <b style={{ color: ink, fontVariantNumeric: "tabular-nums" }}>
              {cur ? new Date(cur.unix * 1000).toLocaleDateString("en-GB", { day: "numeric", month: "short", timeZone: "UTC" }) + " · " + cur.pct.toFixed(1) + "%" : "…"}
            </b>
          </span>
          <span style={{ display: "flex", gap: 6 }}>
            {rows && Number.isFinite(rows[0].carts) && <Seg options={[["pct", "Availability"], ["carts", "Carts"]]} value={mode} onChange={setMode} ink={ink} mute={mute} small />}
            <button onClick={() => setPlaying((p) => !p)} style={btn(ink, true)}>
              {playing ? "Pause" : "Play"}
            </button>
            <button onClick={replay} style={btn(ink, true)}>Replay</button>
          </span>
        </div>
        <div style={{ flex: 1, minHeight: 0 }}>{chart}</div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)", color: "var(--fg)", padding: "32px clamp(16px, 4vw, 48px)", fontFamily: "Inter, system-ui, sans-serif" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 16, flexWrap: "wrap" }}>
        <div>
          <button onClick={onBack} style={{ background: "none", border: 0, color: mute, padding: 0, cursor: "pointer", fontSize: 13 }}>
            ← Back
          </button>
          <h1 style={{ margin: "8px 0 4px", fontSize: 22, fontWeight: 600, letterSpacing: "-0.01em" }}>Scheduled Delivery slot availability, 2026</h1>
          <p style={{ margin: 0, color: mute, fontSize: 14, maxWidth: 640 }}>
            Share of carts that were offered at least one scheduled slot, per day, replayed as a live tape. Two cliffs: 4 to 26 March, and 6 to 15 April.
          </p>
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center", fontSize: 13 }}>
          <Seg options={[["pct", "Availability %"], ["carts", "Cart volumes"]]} value={mode} onChange={setMode} ink={ink} mute={mute} />
          <button onClick={() => setPlaying((p) => !p)} style={btn(ink)}>
            {playing ? "Pause" : "Play"}
          </button>
          <button onClick={replay} style={btn(ink)}>Replay</button>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 12, margin: "20px 0 12px" }}>
        <Stat label="Date" value={cur ? new Date(cur.unix * 1000).toLocaleDateString("en-GB", { day: "numeric", month: "long", timeZone: "UTC" }) : "…"} mute={mute} />
        <Stat label="Availability" value={cur ? cur.pct.toFixed(1) + "%" : "…"} mute={mute} />
        <Stat label="Day on day" value={cur?.dod == null ? "…" : (cur.dod > 0 ? "+" : "") + cur.dod.toFixed(2) + " pp"} mute={mute} tone={cur?.dod > 0 ? "up" : cur?.dod < 0 ? "down" : ""} />
        <Stat label="Carts with a slot" value={cur ? fmtM(cur.sd) + " of " + fmtM(cur.carts) : "…"} mute={mute} />
        <Stat label="Worst day" value={worst ? worst.pct.toFixed(1) + "% on " + fmtUnix(worst.unix) : "…"} mute={mute} />
      </div>

      <div style={{ height: "min(56vh, 520px)", borderRadius: 16, overflow: "hidden", border: `1px solid color-mix(in srgb, ${ink} 12%, transparent)` }}>
        {chart}
      </div>
      <p style={{ color: mute, fontSize: 12, marginTop: 10 }}>
        Source: Databricks pull, 1 Jan to 3 Sep 2026 (3 Sep is a partial day). Replays at {SPEED_DAYS_PER_SEC} days a second; hover to scrub. Internal data, unlisted page.
      </p>
    </div>
  );
}

const btn = (ink, small) => ({
  background: "none",
  border: `1px solid color-mix(in srgb, ${ink} 24%, transparent)`,
  color: ink,
  borderRadius: 999,
  padding: small ? "3px 10px" : "6px 14px",
  cursor: "pointer",
  font: "inherit",
});

function Seg({ options, value, onChange, ink, mute, small }) {
  return (
    <div style={{ display: "inline-flex", border: `1px solid color-mix(in srgb, ${ink} 24%, transparent)`, borderRadius: 999, padding: 2 }}>
      {options.map(([k, l]) => (
        <button
          key={k}
          onClick={() => onChange(k)}
          style={{ background: value === k ? ink : "none", color: value === k ? "var(--bg)" : mute, border: 0, borderRadius: 999, padding: small ? "2px 9px" : "5px 12px", cursor: "pointer", font: "inherit" }}
        >
          {l}
        </button>
      ))}
    </div>
  );
}

function Stat({ label, value, mute, tone }) {
  const c = tone === "up" ? "#1a8f4a" : tone === "down" ? "#c43d2f" : "inherit";
  return (
    <div>
      <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.08em", color: mute }}>{label}</div>
      <div style={{ fontSize: 18, fontWeight: 600, color: c, fontVariantNumeric: "tabular-nums" }}>{value}</div>
    </div>
  );
}
