// /faces: the face playground (unlisted, like /mascot). One 3D face (FaceSV, the Blender
// model in public/faces/face.glb) in every skin: click the face or a skin to switch (it
// hops, changes mid-air, then emotes), or let it cycle. Every emote has a button too.
// The SVG-filter and inflated-2D attempts (Face.jsx, skins.jsx, Face3D.jsx) are kept for
// reference only.

import { useRef, useState } from "react";
import FaceSV from "./FaceSV";
import { SKINS } from "./faceSkins";

const EMOTES = ["blink", "grin", "surprised", "wink", "lookAround", "laugh", "shy", "think", "nod", "sad", "angry", "puff"];
// moments: each emote held still at the point where it reads strongest (a toggle each);
// the emote buttons below still play them animated
const MOMENTS = [
  ["rest", null, 0], ["blink", "blink", 0.45], ["grin", "grin", 0.4], ["surprised", "surprised", 0.3],
  ["wink", "wink", 0.4], ["laugh", "laugh", 0.15], ["shy", "shy", 0.5], ["think", "think", 0.5],
  ["look", "lookAround", 0.3], ["nod", "nod", 0.25], ["sad", "sad", 0.5], ["angry", "angry", 0.25], ["puff", "puff", 0.5],
];
const btn = { font: "500 13px/1 Inter, system-ui, sans-serif", padding: "8px 12px", borderRadius: 999, border: "1px solid rgba(0,0,0,0.15)", background: "rgba(255,255,255,0.78)", color: "#222", cursor: "pointer" };

export default function FaceLab({ onBack }) {
  const face = useRef(null);
  const [skin, setSkin] = useState(SKINS[0]);
  const [cycle, setCycle] = useState(false); // skins change on click (the spin); Cycle turns auto-change on
  const [overlay, setOverlay] = useState(false);
  const [moment, setMoment] = useState("rest");
  return (
    <div style={{ minHeight: "100vh", background: skin.bg, transition: "background 380ms ease", display: "grid", placeItems: "center", padding: 24 }}>
      <div style={{ display: "grid", justifyItems: "center", gap: 20 }}>
        <div style={{ position: "relative" }}>
          <FaceSV ref={face} size={400} skin={SKINS[0].id} cycle={cycle && !overlay ? 6000 : 0} onSkin={setSkin} />
          {/* the clay reference at 30%, fitted to the model's silhouette (measured with
              tools/face3d: same height, same centre) so the form can be matched to it */}
          {overlay && (
            <img src="/faces/ref-clay.webp" alt="" style={{ position: "absolute", left: "7.4%", top: "6.3%", width: "92%", opacity: 0.3, pointerEvents: "none" }} />
          )}
        </div>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", justifyContent: "center", maxWidth: 640 }}>
          {SKINS.map((s) => (
            <button key={s.id} type="button" style={{ ...btn, fontWeight: s.id === skin.id ? 700 : 500, outline: s.id === skin.id ? "2px solid #222" : "none" }} onClick={() => face.current?.setSkin(s.id)}>{s.label}</button>
          ))}
          <button type="button" style={btn} onClick={() => setCycle((c) => !c)}>{cycle ? "Stop cycling" : "Cycle"}</button>
          <button type="button" style={{ ...btn, fontWeight: overlay ? 700 : 500 }} onClick={() => { setOverlay((o) => !o); face.current?.setSkin("clay"); }}>Reference 30%</button>
        </div>
        <div role="group" aria-label="Moment" style={{ display: "flex", gap: 6, flexWrap: "wrap", justifyContent: "center", maxWidth: 640 }}>
          {MOMENTS.map(([label, name, k]) => (
            <button key={label} type="button" aria-pressed={moment === label}
              style={{ ...btn, background: moment === label ? "#222" : btn.background, color: moment === label ? "#fff" : btn.color }}
              onClick={() => { setMoment(label); face.current?.pose(name, k); }}>{label}</button>
          ))}
        </div>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", justifyContent: "center", maxWidth: 640 }}>
          <button type="button" style={{ ...btn, fontWeight: 700 }} onClick={() => face.current?.bounce()}>bounce</button>
          {EMOTES.map((e) => (
            <button key={e} type="button" style={btn} onClick={() => { setMoment("rest"); face.current?.pose(null); face.current?.emote(e); }}>{e}</button>
          ))}
          {onBack && <button type="button" style={btn} onClick={onBack}>Back</button>}
        </div>
      </div>
    </div>
  );
}
