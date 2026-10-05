// Live prompt picker for the 3D faces system (promptLibrary/image, group "3D faces",
// spec pl-3d-faces-system). Five dials drive one assembled prompt: subject source,
// material, angle, expression and backdrop.
//
// Every word it emits comes from faces3dRecipe.compose() in
// promptLibrary/image/faces3dViews.js, the same recipe the written-out blocks below it
// are composed from, so the picker and the catalogs cannot drift.
import { useState } from "react";
import {
  faces3dRecipe,
  ANGLES,
  EXPRESSIONS,
  BACKDROPS,
  STYLE_META,
  COMPACT_LIMIT,
} from "./promptLibrary/image/faces3dViews.js";

const SEP = " · ";

export default function Faces3dPromptBuilder() {
  const [style, setStyle] = useState(STYLE_META[0].key);
  const [angle, setAngle] = useState(ANGLES[0].key);
  const [expression, setExpression] = useState(EXPRESSIONS[0].key);
  const [backdrop, setBackdrop] = useState(BACKDROPS[0].key);
  const [subject, setSubject] = useState("photo");
  const [length, setLength] = useState("compact");
  const [copied, setCopied] = useState(false);

  const styleMeta = STYLE_META.find((s) => s.key === style) || STYLE_META[0];
  const bd = BACKDROPS.find((b) => b.key === backdrop) || BACKDROPS[0];
  const prompt = faces3dRecipe.compose({ style, angle, expression, backdrop, subject, length });
  const over = length === "compact" && prompt.length > COMPACT_LIMIT;

  const copy = () => {
    if (navigator.clipboard) navigator.clipboard.writeText(prompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const chips = (label, items, value, set) => (
    <div className="prd-faces__dial">
      <span className="prd-faces__label">{label}</span>
      <div className="prd-amx__styles" role="group" aria-label={label}>
        {items.map((it) => (
          <button
            key={it.key}
            type="button"
            className={"prd-amx__style" + (value === it.key ? " is-on" : "")}
            aria-pressed={value === it.key}
            onClick={() => set(it.key)}
          >
            {it.label}
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <div className="prd-builder">
      {chips("Material", STYLE_META, style, setStyle)}
      <p className="prd-amx__campaign-blurb">{styleMeta.blurb}</p>

      {chips("Angle", ANGLES, angle, setAngle)}
      {chips("Expression", EXPRESSIONS, expression, setExpression)}

      <div className="prd-faces__dial">
        <span className="prd-faces__label">Backdrop</span>
        <div className="prd-faces__swatches" role="group" aria-label="Backdrop">
          {BACKDROPS.map((b) => (
            <button
              key={b.key}
              type="button"
              className={"prd-faces__sw" + (backdrop === b.key ? " is-on" : "")}
              aria-pressed={backdrop === b.key}
              aria-label={`${b.label} ${b.color}`}
              title={`${b.label} ${b.color}`}
              onClick={() => setBackdrop(b.key)}
            >
              <span className="prd-faces__chip" style={{ background: b.color }} aria-hidden="true" />
              <span className="prd-faces__swname">{b.label}</span>
            </button>
          ))}
        </div>
      </div>

      {chips(
        "Subject",
        [
          { key: "base", label: "Base skeleton + photo" },
          { key: "base-alt", label: "Base skeleton + photo (no ordinals)" },
          { key: "photo", label: "Attached photo" },
          { key: "text", label: "Text description" },
        ],
        subject,
        setSubject
      )}
      <p className="prd-amx__campaign-blurb">
        {subject === "base"
          ? "Attach TWO images, in this order: Image 1 the base skeleton render (the fixed head form every character shares), Image 2 the person's photograph. The prompt assigns the roles by ORDINAL ('the first image', 'the second image'), a convention documented for Gemini's typed reference slots but UNVERIFIED folklore on GPT Image 2. If likeness is slipping, A/B against 'no ordinals' below."
          : subject === "base-alt"
          ? "Same two images and the same preserve/negate content as 'Base skeleton + photo', but the roles are DESCRIBED rather than indexed ('a form reference' / 'a likeness reference'), matching how OpenAI's own multi-image examples talk about references. Use this as the A/B partner when the ordinal version drops likeness."
          : subject === "photo"
          ? "Attach the reference photograph as the only image. The photo carries the likeness, this text carries the sculpt, the material, the light and the crop."
          : "No photo. Replace [SUBJECT] with a description of the head you want. Expect much less control over the likeness."}
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
      <p className="prd-amx__campaign-blurb">
        {length === "compact"
          ? "The same system in the fewest words: written for Figma's image-generation prompt field, which caps the prompt length. Non-negotiables come first, since GPT Image 2 follows dense prose faithfully and only lightly rewrites."
          : "The full register: every clause spelled out. For models and fields with no character cap, or when a compact result drifts and you need the explanatory sub-clauses back."}
      </p>

      <p className="prd-amx__picked">
        {styleMeta.label}
        {SEP}
        {(ANGLES.find((a) => a.key === angle) || ANGLES[0]).label}
        {SEP}
        {(EXPRESSIONS.find((e) => e.key === expression) || EXPRESSIONS[0]).label}
        <span className="prd-amx__stylechip">
          {bd.label} {bd.color}
        </span>
        <span
          className="prd-amx__stylechip"
          style={over ? { color: "var(--danger, #c0392b)" } : undefined}
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
        <p className="prd-amx__loop-title">Dial the sculpt in</p>
        <p className="prd-amx__loop-note">
          Generate the front angle first, then attach both the photograph and that render as
          references for the rest. If a result is close but not right, nudge one token below and
          regenerate rather than rewriting the prompt.
        </p>
        <ul className="prd-amx__loop-list">
          {faces3dRecipe.tokens.map((t) => (
            <li key={t}>{t}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}
