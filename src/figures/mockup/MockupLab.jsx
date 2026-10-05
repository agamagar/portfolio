// MockupLab · the showcase / control room for the phone-mockup system (/mockups).
// Renders all 5 angle presets from a single sample screen, with live controls
// (screen, rail finish, size, toggles) and a side-by-side reference photo per
// preset so the coded pose can be tuned against its north-star.

import { useState } from "react";
import PhoneMock from "./PhoneMock";
import { MOCK_PRESETS, MOCK_SCREENS, MOCK_TONES } from "./mockPresets";
import "./mockupLab.css";

export default function MockupLab() {
  const [screenId, setScreenId] = useState(MOCK_SCREENS[0].id);
  const [tone, setTone] = useState("graphite");
  const [width, setWidth] = useState(248);
  const [island, setIsland] = useState(true);
  const [gloss, setGloss] = useState(true);
  const [showRef, setShowRef] = useState(true);

  const screen = MOCK_SCREENS.find((s) => s.id === screenId) || MOCK_SCREENS[0];

  return (
    <div className="mocklab">
      <header className="mocklab__head">
        <p className="mocklab__eyebrow">Mockup system · 01</p>
        <h1 className="mocklab__title">The phone mock</h1>
        <p className="mocklab__lede">
          One coded iPhone, five camera angles. Drop any screen in and it renders
          at each preset pose, fully swappable and on-brand. The reference photo
          beside each preset is the north-star it was tuned against.
        </p>
      </header>

      {/* ── control bench ─────────────────────────────────────────────── */}
      <div className="mocklab__bench" data-feedback-toolbar="true">
        <label className="mocklab__ctrl">
          <span>Screen</span>
          <select value={screenId} onChange={(e) => setScreenId(e.target.value)}>
            {MOCK_SCREENS.map((s) => (
              <option key={s.id} value={s.id}>{s.label}</option>
            ))}
          </select>
        </label>

        <label className="mocklab__ctrl">
          <span>Finish</span>
          <select value={tone} onChange={(e) => setTone(e.target.value)}>
            {MOCK_TONES.map((t) => (
              <option key={t.id} value={t.id}>{t.label}</option>
            ))}
          </select>
        </label>

        <label className="mocklab__ctrl">
          <span>Size {width}px</span>
          <input
            type="range" min="180" max="340" step="4"
            value={width} onChange={(e) => setWidth(+e.target.value)}
          />
        </label>

        <div className="mocklab__toggles">
          <button className={`mocklab__pill ${island ? "is-on" : ""}`} onClick={() => setIsland(!island)}>Island</button>
          <button className={`mocklab__pill ${gloss ? "is-on" : ""}`} onClick={() => setGloss(!gloss)}>Gloss</button>
          <button className={`mocklab__pill ${showRef ? "is-on" : ""}`} onClick={() => setShowRef(!showRef)}>Reference</button>
        </div>
      </div>

      {/* ── the 5 presets ─────────────────────────────────────────────── */}
      <div className="mocklab__grid">
        {MOCK_PRESETS.map((p) => (
          <figure className="mocklab__card" key={p.id}>
            <div className={`mocklab__stage ${showRef ? "has-ref" : ""}`}>
              <div className="mocklab__mock">
                <PhoneMock
                  angle={p.id}
                  screen={screen.src}
                  width={width}
                  tone={tone}
                  island={island}
                  gloss={gloss}
                />
              </div>
              {showRef && <RefImage src={p.ref} credit={p.refCredit} />}
            </div>

            <figcaption className="mocklab__meta">
              <div className="mocklab__metatop">
                <h2 className="mocklab__name">{p.name}</h2>
                <span className="mocklab__tag">{p.tag}</span>
              </div>
              <p className="mocklab__note">{p.note}</p>
              <code className="mocklab__params">
                persp {p.persp} · rx {p.rx}° · ry {p.ry}° · rz {p.rz}° · scale {p.scale}
              </code>
            </figcaption>
          </figure>
        ))}
      </div>

      <p className="mocklab__foot">
        Reusable anywhere: <code>{`<PhoneMock angle="reach" screen="/path.png" />`}</code>.
        Angles live in <code>mockPresets.js</code>; tune the numbers and every mock updates.
      </p>
    </div>
  );
}

// A reference photo that quietly removes itself if the file has not been dropped
// in yet (so the showcase never shows a broken image).
function RefImage({ src, credit }) {
  const [ok, setOk] = useState(true);
  if (!ok) {
    return (
      <div className="mocklab__ref mocklab__ref--empty">
        <span>Drop reference at<br /><code>{src.replace("/mockups", "public/mockups")}</code></span>
      </div>
    );
  }
  return (
    <figure className="mocklab__ref">
      <img src={src} alt={`Reference: ${credit}`} onError={() => setOk(false)} draggable="false" />
      <figcaption>{credit}</figcaption>
    </figure>
  );
}
