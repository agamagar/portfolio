// ShaderGallery (/shaders) · a live contact sheet of the whole shader library.
// Every preset in WASHES renders in its own framed box via the same ShaderCanvas
// the case studies use, grouped by family, with a Follow/Light/Dark theme toggle
// so each wash can be judged in both themes. Unlisted route (like /lab, /mockups);
// the surface to write, see, and annotate new shaders before wiring them into a case.

import { useState } from "react";
import ShaderCanvas from "../../ShaderCanvas";
import { SHADER_LIST, LIVING_SKY_DEFAULTS } from "../../shaders/washes";
import "./shaderGallery.css";

// theme modes: follow the site theme, or pin every tile light / dark for compare
const THEME_MODES = [
  { id: "follow", label: "Follow site" },
  { id: "light", label: "Light" },
  { id: "dark", label: "Dark" },
];
const forcedDark = (mode) => (mode === "light" ? false : mode === "dark" ? true : undefined);

// SHADER_LIST is authored in family order; preserve it while bucketing.
const GROUPS = SHADER_LIST.reduce((acc, s) => {
  const g = acc.find((x) => x.group === s.group);
  if (g) g.items.push(s);
  else acc.push({ group: s.group, items: [s] });
  return acc;
}, []);

function ShaderTile({ shader, dark }) {
  const [copied, setCopied] = useState(false);
  const copyKey = () => {
    const snippet = `preset="${shader.key}"`;
    navigator.clipboard?.writeText(snippet).then(
      () => {
        setCopied(true);
        setTimeout(() => setCopied(false), 1200);
      },
      () => {},
    );
  };
  return (
    <figure className="shadertile">
      <div className="shadertile__stage">
        {/* key forces a fresh ShaderCanvas (new GL context) when the theme is
            re-pinned, so u_dark reflects the new forced value cleanly */}
        {/* Living Sky is the one preset with its own parameter set, and an unset
            uniform reads as 0 in GL — which for it means midnight with zero
            exposure, i.e. a black tile. Give it the defaults and the real clock. */}
        <ShaderCanvas
          key={String(dark)}
          preset={shader.key}
          dark={dark}
          className="shadertile__canvas"
          clock={shader.key === "livingSky"}
          uniforms={shader.key === "livingSky" ? LIVING_SKY_DEFAULTS : undefined}
        />
      </div>
      <figcaption className="shadertile__cap">
        <span className="shadertile__name">{shader.name}</span>
        <button
          type="button"
          className="shadertile__key"
          onClick={copyKey}
          title="Copy the preset prop"
        >
          {copied ? "copied" : `preset="${shader.key}"`}
        </button>
      </figcaption>
    </figure>
  );
}

export default function ShaderGallery({ onBack }) {
  const [themeMode, setThemeMode] = useState("follow");
  const dark = forcedDark(themeMode);

  return (
    <div className="shaderlab" data-theme-pin={themeMode}>
      <header className="shaderlab__head">
        {onBack && (
          <button type="button" className="shaderlab__back" onClick={onBack}>
            &larr; Back
          </button>
        )}
        <p className="shaderlab__eyebrow">Shader library · {SHADER_LIST.length} washes</p>
        <h1 className="shaderlab__title">The washes</h1>
        <p className="shaderlab__lede">
          Every living background shader on the site, rendered here in its own
          framed box by the same WebGL canvas the case studies use. Each one reads
          in both themes, freezes for reduced motion, and falls back to a flat
          fill where WebGL is unavailable. Pin the theme to compare, or drop one
          into a section as <code>&lt;ShaderBox shader="…" /&gt;</code>.
        </p>
      </header>

      <div className="shaderlab__bench" data-feedback-toolbar="true">
        <span className="shaderlab__bench-label">Theme</span>
        <div className="shaderlab__seg" role="group" aria-label="Preview theme">
          {THEME_MODES.map((m) => (
            <button
              key={m.id}
              type="button"
              className={`shaderlab__segbtn${themeMode === m.id ? " is-active" : ""}`}
              onClick={() => setThemeMode(m.id)}
              aria-pressed={themeMode === m.id}
            >
              {m.label}
            </button>
          ))}
        </div>
      </div>

      {GROUPS.map(({ group, items }) => (
        <section key={group} className="shaderlab__group">
          <h2 className="shaderlab__grouphead">{group}</h2>
          <div className="shaderlab__grid">
            {items.map((s) => (
              <ShaderTile key={s.key} shader={s} dark={dark} />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
