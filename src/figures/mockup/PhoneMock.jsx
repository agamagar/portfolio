// PhoneMock · a coded iPhone frame you drop any screen into and pose at a
// preset 3D angle. Pure CSS/HTML: titanium rail, thin black bezel, Dynamic
// Island, side buttons, squircle screen. The screen is swappable (image src or
// any React node), and the pose is driven entirely by CSS custom properties
// read from a preset in ./mockPresets.js, so tuning is live and reusable across
// every case study.
//
// Usage:
//   <PhoneMock angle="reach" screen="/figures/scheduled/sched-cart-confirmed.png" />
//   <PhoneMock angle="front" width={300}><LiveComponent /></PhoneMock>

import { MOCK_PRESET_MAP, MOCK_PRESETS } from "./mockPresets";
import "./phoneMock.css";

export default function PhoneMock({
  angle = "front",
  screen,          // string (image src) OR a React node rendered inside the screen
  children,        // alternative to `screen` for live content
  width = 260,     // outer frame width in px · the single knob the whole phone scales from
  tone = "graphite",
  island = true,
  gloss = true,
  status = false,  // overlay a status bar (leave off if your screenshot already has one)
  time = "9:41",
  interactive = true, // hover eases the phone toward front-on for inspection
  className = "",
  style,
  ...rest
}) {
  const p = MOCK_PRESET_MAP[angle] || MOCK_PRESETS[3];
  const sh = p.shadow || {};

  // Everything the pose needs, set once on the scene and inherited downward.
  const vars = {
    "--pm-w": `${width}px`,
    "--pm-persp": `${p.persp}px`,
    "--pm-ox": `${p.originX}%`,
    "--pm-oy": `${p.originY}%`,
    "--pm-rx": `${p.rx}deg`,
    "--pm-ry": `${p.ry}deg`,
    "--pm-rz": `${p.rz}deg`,
    "--pm-scale": p.scale ?? 1,
    "--pm-sh-x": `${sh.x ?? 0}px`,
    "--pm-sh-y": `${sh.y ?? 30}px`,
    "--pm-sh-blur": `${sh.blur ?? 48}px`,
    "--pm-sh-color": sh.color || "rgba(14,13,20,.34)",
    ...style,
  };

  const isImg = typeof screen === "string";

  return (
    <div
      className={`pm-scene ${interactive ? "pm-scene--interactive" : ""} ${className}`.trim()}
      style={vars}
      data-angle={p.id}
      {...rest}
    >
      <div className={`pm-phone pm-phone--${tone}`}>
        {/* side buttons · thin rail-coloured bars on the edges */}
        <span className="pm-btn pm-btn--action" aria-hidden="true" />
        <span className="pm-btn pm-btn--vol-up" aria-hidden="true" />
        <span className="pm-btn pm-btn--vol-dn" aria-hidden="true" />
        <span className="pm-btn pm-btn--power" aria-hidden="true" />

        {/* titanium rail */}
        <div className="pm-body">
          {/* black bezel */}
          <div className="pm-bezel">
            {/* the screen */}
            <div className="pm-screen">
              {isImg ? (
                <img className="pm-screen__media" src={screen} alt="" draggable="false" />
              ) : (
                <div className="pm-screen__media">{screen || children}</div>
              )}

              {status && (
                <div className="pm-status" aria-hidden="true">
                  <span className="pm-status__time">{time}</span>
                  <span className="pm-status__glyphs">
                    <i className="pm-status__signal" />
                    <i className="pm-status__wifi" />
                    <i className="pm-status__batt" />
                  </span>
                </div>
              )}

              {island && (
                <div className="pm-island" aria-hidden="true">
                  <span className="pm-island__cam" />
                </div>
              )}

              {gloss && <div className="pm-gloss" aria-hidden="true" />}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
