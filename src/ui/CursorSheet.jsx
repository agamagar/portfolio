// DEV ONLY review sheet for the cursor states: /?cursors=1. Every state of cursorStates.js side by side, drawn
// from the same sampled outlines the live cursor blends. Each cell also carries data-cursor, so hovering a
// cell shows the real cursor morphing into that state. Not shipped (main.jsx only imports it in dev).
import { useEffect, useRef, useState } from "react";
import { STATES, STATE_NAMES, RULES } from "./cursorStates";
import { buildShapes, NPT } from "./ContextCursor";

function pathOf(P) {
  let d = "";
  for (let sub = 0; sub < 2; sub++) { for (let i = 0; i < NPT * 2; i += 2) d += (i ? "L" : "M") + P[sub][i].toFixed(2) + " " + P[sub][i + 1].toFixed(2); d += "Z"; }
  return d;
}

export default function CursorSheet() {
  const probe = useRef(null);
  const [shapes, setShapes] = useState(null);
  useEffect(() => { if (probe.current) setShapes(buildShapes(probe.current)); }, []);
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 1000, overflow: "auto", background: "#0f0f12", color: "#fff", font: "13px/1.35 'Google Sans Flex', Inter, sans-serif", padding: 24 }}>
      <svg ref={probe} width="0" height="0" style={{ position: "absolute" }} aria-hidden />
      <h1 style={{ font: "600 20px 'Google Sans Flex', Inter, sans-serif", margin: "0 0 4px" }}>Cursor states</h1>
      <p style={{ margin: "0 0 16px", opacity: 0.6 }}>{STATE_NAMES.length} states, from src/ui/cursorStates.js. Hover a cell to see the live cursor morph into it. Triggers: {RULES.length} rules plus data-cursor.</p>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(190px, 1fr))", gap: 12 }}>
        {STATE_NAMES.map((n) => (
          <div key={n} data-cursor={n} style={{ background: "#1a1a1f", borderRadius: 14, padding: 12, border: "1px solid rgba(255,255,255,0.08)" }}>
            <svg viewBox="-20 -20 40 40" width="100%" height="110" style={{ display: "block", background: "#26262c", borderRadius: 10 }}>
              {shapes && <path d={pathOf(shapes[n])} fill="#fff" fillRule="evenodd" />}
            </svg>
            <div style={{ font: "600 13px 'Google Sans Code', ui-monospace, monospace", marginTop: 8 }}>{n}</div>
            <div style={{ opacity: 0.6, fontSize: 12 }}>{STATES[n].note}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
