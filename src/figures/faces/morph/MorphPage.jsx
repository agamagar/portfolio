// Test page for the mascot morph: the canvas, a scrubber, play. Every frame is a pure
// function of t, so the scrubber shows exactly what playback shows.
import { useEffect, useRef, useState } from "react";
import { createMascotMorph, PHASES } from "./mascotMorph";

const DURATION = 4200; // ms for t 0..1

const btn = { font: "600 13px/1 Inter, system-ui, sans-serif", padding: "9px 14px", borderRadius: 999, border: "1px solid rgba(23,23,26,0.2)", background: "#fff", color: "#17171a", cursor: "pointer" };

export default function MorphPage() {
  const canvas = useRef(null);
  const morph = useRef(null);
  const [t, setT] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [ready, setReady] = useState(false);
  const raf = useRef(0);

  useEffect(() => {
    let alive = true;
    createMascotMorph(canvas.current).then((m) => {
      if (!alive) return;
      morph.current = m;
      window.morph = m; // for the recorder: window.morph.render(t)
      setReady(true);
      const q = new URLSearchParams(location.search);
      if (q.has("t")) setT(+q.get("t"));
    });
    return () => { alive = false; };
  }, []);
  useEffect(() => { if (ready) morph.current.render(t); }, [t, ready]);
  useEffect(() => {
    if (!playing) return;
    const t0 = performance.now() - t * DURATION;
    const step = (now) => {
      const k = (now - t0) / DURATION;
      if (k >= 1) { setT(1); setPlaying(false); return; }
      setT(k);
      raf.current = requestAnimationFrame(step);
    };
    raf.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf.current);
  }, [playing]);

  const phase = PHASES.filter(([, a, b]) => t >= a && t <= b).map(([n]) => n).join(" + ");
  return (
    <main style={{ display: "grid", justifyItems: "center", gap: 16, padding: "24px 16px", width: "100%", maxWidth: 520, boxSizing: "border-box" }}>
      <canvas ref={canvas} aria-label="The mascot drawing becoming the 3D head" style={{ width: "100%", maxWidth: 401, aspectRatio: "802 / 862", height: "auto" }} />
      <div style={{ display: "flex", alignItems: "center", gap: 12, width: "100%", maxWidth: 401 }}>
        <button type="button" style={btn} disabled={!ready}
          onClick={() => { if (t >= 1) setT(0); setPlaying((p) => !p); }}>{playing ? "Pause" : t >= 1 ? "Replay" : "Play"}</button>
        <input type="range" min={0} max={1000} value={Math.round(t * 1000)} disabled={!ready} aria-label="Morph progress"
          onChange={(e) => { setPlaying(false); setT(+e.target.value / 1000); }} style={{ flex: 1 }} />
        <span style={{ font: "500 12px/1 ui-monospace, monospace", minWidth: 40, textAlign: "right" }}>{t.toFixed(3)}</span>
      </div>
      <p style={{ margin: 0, opacity: 0.7 }}>{ready ? phase : "Loading the head"}</p>
    </main>
  );
}
