// Live prompt picker for the Zepto campaign tiles system (promptLibrary/image,
// group "Zepto campaign tiles", spec pl-zepto-campaign-system). Four dials plus a
// register drive one assembled prompt: tile, subject, colorway and reference mode.
//
// Every word it emits comes from zeptoCampaignRecipe.compose() in
// promptLibrary/image/zeptoCampaignViews.js, the same recipe the written-out tile
// catalog below it is composed from, so the picker and the catalog cannot drift.
import { useState } from "react";
import {
  zeptoCampaignRecipe,
  SUBJECTS,
  COLORWAYS,
  REFERENCES,
  STYLE_META,
  COMPACT_LIMIT,
} from "./promptLibrary/image/zeptoCampaignViews.js";

const SEP = " · ";

export default function ZeptoCampaignPromptBuilder() {
  const [style, setStyle] = useState(STYLE_META[0].key);
  const [subject, setSubject] = useState(SUBJECTS[0].key);
  const [colorway, setColorway] = useState(COLORWAYS[0].key);
  const [reference, setReference] = useState(REFERENCES[0].key);
  const [length, setLength] = useState("compact");
  const [copied, setCopied] = useState(false);

  const styleMeta = STYLE_META.find((s) => s.key === style) || STYLE_META[0];
  const cw = COLORWAYS.find((c) => c.key === colorway) || COLORWAYS[0];
  const prompt = zeptoCampaignRecipe.compose({ style, subject, colorway, reference, length });
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
      {chips("Tile", STYLE_META, style, setStyle)}
      <p className="prd-amx__campaign-blurb">{styleMeta.blurb}</p>

      {chips("Subject", SUBJECTS, subject, setSubject)}


      <div className="prd-faces__dial">
        <span className="prd-faces__label">Colorway</span>
        <div className="prd-faces__swatches" role="group" aria-label="Colorway">
          {COLORWAYS.map((c) => (
            <button
              key={c.key}
              type="button"
              className={"prd-faces__sw" + (colorway === c.key ? " is-on" : "")}
              aria-pressed={colorway === c.key}
              aria-label={`${c.label} ${c.color}`}
              title={`${c.label} ${c.color}`}
              onClick={() => setColorway(c.key)}
            >
              <span className="prd-faces__chip" style={{ background: c.color }} aria-hidden="true" />
              <span className="prd-faces__swname">{c.label}</span>
            </button>
          ))}
        </div>
      </div>

      {chips("Reference", REFERENCES, reference, setReference)}
      <p className="prd-amx__campaign-blurb">
        {reference === "moodboard"
          ? "Attach ONE real photograph as the only image, for its photographic quality only (skin texture, grain, grade, contrast, framing); the prompt says to take none of its content. The compact render clause drops because the photo carries the lens feel."
          : reference === "anchor"
          ? "Attach the set's anchor tile (generate the colour-field packshot first) as the only image. The prompt names its role out loud: match its palette, sun and shadow tint exactly, take nothing else from it. Re-anchor to that same tile for every generation rather than chaining outputs."
          : "No image attached: the brand world is carried entirely by the words (the three hexes, the sun, the shadow tint). Use this for the first tile of a set, then switch to anchor mode for the rest."}
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
          ? "The tile in the fewest words: written for Figma's image-generation prompt field, which caps the prompt length. Non-negotiables come first, since GPT Image 2 follows dense prose faithfully and only lightly rewrites."
          : "The full register: every clause with its reasoning restored. For models and fields with no character cap, or when a compact result drifts."}
      </p>

      <p className="prd-amx__picked">
        {styleMeta.label}
        {SEP}
        {(SUBJECTS.find((s) => s.key === subject) || SUBJECTS[0]).label}
        <span className="prd-amx__stylechip">
          {cw.label} {cw.color}
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
        <p className="prd-amx__loop-title">Dial the campaign in</p>
        <p className="prd-amx__loop-note">
          Generate the colour-field packshot first to lock the world, then anchor the
          other tiles to it. If a result is close but not right, nudge one token below
          and regenerate rather than rewriting the prompt. The type layer is never
          generated: set headlines, prices and chips over the image in Figma.
        </p>
        <ul className="prd-amx__loop-list">
          {zeptoCampaignRecipe.tokens.map((t) => (
            <li key={t}>{t}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}
