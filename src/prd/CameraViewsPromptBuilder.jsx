// Live prompt picker for the Camera views system (promptLibrary/image, group
// "Camera views", spec pl-camera-views-system). Drop the reference image, name the
// subject, then pick where the camera stands: height, orbit, distance, lens, roll and
// the treatment. One assembled prompt re-shoots the subject from there.
//
// Every word it emits comes from cameraRecipe.compose() in
// promptLibrary/image/cameraViews.js, the same recipe the written-out ladders below
// it are composed from, so the picker and the catalogs cannot drift.
//
// The image never leaves the browser: it is previewed with an object URL so the
// picker can show it beside the prompt, and the prompt refers to it as "the attached
// image". Attach the same file next to the prompt in Figma or the model's own UI.
import { useEffect, useRef, useState } from "react";
import {
  cameraRecipe,
  HEIGHTS,
  ORBITS,
  DISTANCES,
  LENSES,
  ROLLS,
  STYLE_META,
  PRESETS,
  COMPACT_LIMIT,
} from "./promptLibrary/image/cameraViews.js";

const SEP = " · ";
const find = (items, key) => items.find((x) => x.key === key) || items[0];
const rad = (d) => (d * Math.PI) / 180;

// Side elevation: the subject as a block on a ground line, the camera on an arc
// around its centre at the picked elevation. Plan: the same subject from above, the
// camera on a ring at the picked orbit. Both are diagrams of the PICK, not renders.
function CameraDiagram({ height, orbit }) {
  const deg = height.deg;
  const cx = 120;
  const cy = 92;
  const r = 62;
  const camX = cx - r * Math.cos(rad(deg));
  const camY = cy - r * Math.sin(rad(deg));
  const arc = (from, to) => {
    const p = (d) => `${cx - r * Math.cos(rad(d))} ${cy - r * Math.sin(rad(d))}`;
    return `M ${p(from)} A ${r} ${r} 0 0 1 ${p(to)}`;
  };
  const az = orbit.az;
  const pcx = 75;
  const pcy = 75;
  const pr = 52;
  const pcamX = pcx + pr * Math.sin(rad(az));
  const pcamY = pcy + pr * Math.cos(rad(az));

  return (
    <div className="prd-cam__diagrams" aria-hidden="true">
      <svg className="prd-cam__svg" viewBox="0 0 240 150">
        <line x1="14" y1="122" x2="226" y2="122" className="prd-cam__ground" />
        <path d={arc(-24, 90)} className="prd-cam__arc" />
        <rect x={cx - 22} y={cy - 30} width="44" height="60" rx="6" className="prd-cam__subject" />
        <line x1={camX} y1={camY} x2={cx} y2={cy} className="prd-cam__sight" />
        <g transform={`translate(${camX} ${camY})`}>
          <circle r="7" className="prd-cam__cam" />
          <circle r="2.4" className="prd-cam__lens" />
        </g>
        <text x={cx} y={cy - 36} textAnchor="middle" className="prd-cam__tag">
          {deg > 0 ? `${deg}° above` : deg < 0 ? `${Math.abs(deg)}° below` : "level"}
        </text>
        <text x="14" y="140" className="prd-cam__tag">
          height
        </text>
      </svg>
      <svg className="prd-cam__svg prd-cam__svg--plan" viewBox="0 0 150 150">
        <circle cx={pcx} cy={pcy} r={pr} className="prd-cam__arc" />
        <rect x={pcx - 16} y={pcy - 16} width="32" height="32" rx="5" className="prd-cam__subject" />
        <path d={`M ${pcx - 6} ${pcy + 16} L ${pcx + 6} ${pcy + 16} L ${pcx} ${pcy + 23} Z`} className="prd-cam__front" />
        <line x1={pcamX} y1={pcamY} x2={pcx} y2={pcy} className="prd-cam__sight" />
        <g transform={`translate(${pcamX} ${pcamY})`}>
          <circle r="7" className="prd-cam__cam" />
          <circle r="2.4" className="prd-cam__lens" />
        </g>
        <text x="8" y="140" className="prd-cam__tag">
          orbit
        </text>
      </svg>
    </div>
  );
}

export default function CameraViewsPromptBuilder() {
  const [height, setHeight] = useState(HEIGHTS.find((h) => h.deg === 0)?.key || HEIGHTS[0].key);
  const [orbit, setOrbit] = useState(ORBITS[0].key);
  const [distance, setDistance] = useState(DISTANCES.find((d) => d.default)?.key || DISTANCES[0].key);
  const [lens, setLens] = useState(LENSES.find((l) => l.default)?.key || LENSES[0].key);
  const [roll, setRoll] = useState(ROLLS[0].key);
  const [style, setStyle] = useState(STYLE_META[0].key);
  const [subject, setSubject] = useState("image");
  const [what, setWhat] = useState("");
  const [length, setLength] = useState("compact");
  const [copied, setCopied] = useState(false);
  const [preset, setPreset] = useState(null);

  // the dropped reference, kept as an object URL for the preview only
  const [file, setFile] = useState(null);
  const [dims, setDims] = useState(null);
  const [over, setOver] = useState(false);
  const inputRef = useRef(null);
  const url = file ? file.url : null;
  useEffect(() => () => url && URL.revokeObjectURL(url), [url]);

  const takeFile = (f) => {
    if (!f || !f.type.startsWith("image/")) return;
    if (file) URL.revokeObjectURL(file.url);
    setFile({ url: URL.createObjectURL(f), name: f.name });
    setDims(null);
    setSubject("image");
  };

  const h = find(HEIGHTS, height);
  const o = find(ORBITS, orbit);
  const d = find(DISTANCES, distance);
  const l = find(LENSES, lens);
  const rl = find(ROLLS, roll);
  const styleMeta = find(STYLE_META, style);

  const pick = { style, height, orbit, distance, lens, roll, subject, what: what.trim(), length };
  const prompt = cameraRecipe.compose(pick);
  const tooLong = length === "compact" && prompt.length > COMPACT_LIMIT;

  const applyPreset = (p) => {
    setPreset(p.key);
    Object.entries(p.pick).forEach(([k, v]) => {
      if (k === "height") setHeight(v);
      if (k === "orbit") setOrbit(v);
      if (k === "distance") setDistance(v);
      if (k === "lens") setLens(v);
      if (k === "roll") setRoll(v);
    });
  };
  const setAndClear = (set) => (v) => {
    setPreset(null);
    set(v);
  };

  const copy = () => {
    if (navigator.clipboard) navigator.clipboard.writeText(prompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const chips = (label, items, value, set, hint) => (
    <div className="prd-faces__dial">
      <span className="prd-faces__label">
        {label}
        {hint ? <span className="prd-cam__hint"> {hint}</span> : null}
      </span>
      <div className="prd-amx__styles" role="group" aria-label={label}>
        {items.map((it) => (
          <button
            key={it.key}
            type="button"
            className={"prd-amx__style" + (value === it.key ? " is-on" : "")}
            aria-pressed={value === it.key}
            title={it.blurb || undefined}
            onClick={() => set(it.key)}
          >
            {it.label}
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <div className="prd-builder prd-cam">
      <div className="prd-cam__top">
        <div
          className={"prd-cam__drop" + (over ? " is-over" : "") + (url ? " has-image" : "")}
          onDragOver={(e) => {
            e.preventDefault();
            setOver(true);
          }}
          onDragLeave={() => setOver(false)}
          onDrop={(e) => {
            e.preventDefault();
            setOver(false);
            takeFile(e.dataTransfer.files && e.dataTransfer.files[0]);
          }}
        >
          {url ? (
            <>
              <img
                src={url}
                alt="Your reference image"
                className="prd-cam__img"
                onLoad={(e) => setDims({ w: e.currentTarget.naturalWidth, h: e.currentTarget.naturalHeight })}
              />
              <div className="prd-cam__imgmeta">
                <span>
                  Image 1{dims ? ` · ${dims.w} × ${dims.h}` : ""}
                </span>
                <button
                  type="button"
                  className="prd-pre__copy prd-cam__remove"
                  onClick={() => {
                    URL.revokeObjectURL(url);
                    setFile(null);
                    setDims(null);
                  }}
                >
                  Remove
                </button>
              </div>
            </>
          ) : (
            <button type="button" className="prd-cam__dropbtn" onClick={() => inputRef.current?.click()}>
              <span className="prd-cam__dropbig">Drop the reference image here</span>
              <span className="prd-cam__dropsmall">
                or click to choose. It stays in your browser; the prompt calls it "the attached image", so attach
                the same file beside the prompt in Figma or the model's UI.
              </span>
            </button>
          )}
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            hidden
            onChange={(e) => takeFile(e.target.files && e.target.files[0])}
          />
        </div>
        <CameraDiagram height={h} orbit={o} />
      </div>

      <div className="prd-faces__dial prd-cam__what">
        <label className="prd-faces__label" htmlFor="prd-cam-what">
          What the subject is <span className="prd-cam__hint">optional, but it stops the model reinterpreting the image</span>
        </label>
        <input
          id="prd-cam-what"
          className="prd-builder__select prd-cam__input"
          type="text"
          value={what}
          placeholder="a matte black ceramic mug on a wooden table"
          onChange={(e) => setWhat(e.target.value)}
        />
      </div>

      <div className="prd-faces__dial">
        <span className="prd-faces__label">
          Presets <span className="prd-cam__hint">the trade's standard set-ups, one click each</span>
        </span>
        <div className="prd-amx__styles" role="group" aria-label="Presets">
          {PRESETS.map((p) => (
            <button
              key={p.key}
              type="button"
              className={"prd-amx__style" + (preset === p.key ? " is-on" : "")}
              aria-pressed={preset === p.key}
              title={p.blurb}
              onClick={() => applyPreset(p)}
            >
              {p.label}
            </button>
          ))}
        </div>
        {preset ? <p className="prd-amx__campaign-blurb">{find(PRESETS, preset).blurb}</p> : null}
      </div>

      {chips("Height", HEIGHTS, height, setAndClear(setHeight), "how far above or below the subject the camera sits")}
      <p className="prd-amx__campaign-blurb">{h.blurb}</p>
      {chips("Orbit", ORBITS, orbit, setAndClear(setOrbit), "which side of the subject faces the camera")}
      {chips("Distance", DISTANCES, distance, setAndClear(setDistance), "how much of the subject fills the frame")}
      {chips("Lens", LENSES, lens, setAndClear(setLens), "the same spot, drawn wide or compressed")}
      <p className="prd-amx__campaign-blurb">{l.blurb}</p>
      {chips("Roll", ROLLS, roll, setAndClear(setRoll))}

      {chips("Treatment", STYLE_META, style, setStyle)}
      <p className="prd-amx__campaign-blurb">{styleMeta.blurb}</p>

      {chips(
        "Subject source",
        [
          { key: "image", label: "Attached image" },
          { key: "text", label: "Text only" },
        ],
        subject,
        setSubject
      )}
      <p className="prd-amx__campaign-blurb">
        {subject === "image"
          ? "The attached image carries the subject: its shape, materials, colours and details. The prompt only moves the camera and states what must not change."
          : "No image. The subject comes from the description above (or [SUBJECT] if it is empty). Expect the model to invent the subject; use this for a first sketch, then re-run with the sketch attached."}
      </p>

      {chips(
        "Length",
        [
          { key: "compact", label: `Compact · Figma GPT Image 2 (under ${COMPACT_LIMIT})` },
          { key: "full", label: "Full" },
        ],
        length,
        setLength
      )}

      <p className="prd-amx__picked">
        {h.label}
        {SEP}
        {o.label}
        {SEP}
        {d.label}
        {SEP}
        {l.label}
        {rl.key !== ROLLS[0].key ? SEP + rl.label : ""}
        <span className="prd-amx__stylechip">{styleMeta.label}</span>
        <span
          className="prd-amx__stylechip"
          style={tooLong ? { color: "var(--danger, #c0392b)" } : undefined}
          aria-live="polite"
        >
          {prompt.length.toLocaleString()} chars
          {length === "compact" ? ` / ${COMPACT_LIMIT}` : ""}
        </span>
      </p>

      <div className="prd-pre">
        <button type="button" className="prd-pre__copy" onClick={copy}>
          {copied ? "Copied" : "Copy"}
        </button>
        <pre>{prompt}</pre>
      </div>

      <div className="prd-amx__loop">
        <p className="prd-amx__loop-title">Shooting a set</p>
        <p className="prd-amx__loop-note">
          Move ONE dial per generation and keep the rest fixed, so the set reads as one subject seen from
          different places rather than different subjects. If a view drifts, attach the best render so far
          beside the original and regenerate with the same prompt.
        </p>
        <ul className="prd-amx__loop-list">
          {cameraRecipe.tokens.map((t) => (
            <li key={t}>{t}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}
