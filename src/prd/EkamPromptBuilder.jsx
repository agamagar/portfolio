// Live prompt generator for every EKAM style (promptLibrary/image, group "Ekam").
// Replaces the eleven written-out catalog pages this group used to render: style and
// object are dials now, not pages. Every word comes from ekamAllRecipe.compose(), which
// delegates to the same per-style parts() the original recipes use, so this cannot drift
// from ekamViews.js / ekamExperimentViews.js / ekamExperiment2Views.js.
import { useState } from "react";
import {
  ekamAllRecipe,
  STYLE_META,
  STYLE_DIALS,
  COMPACT_LIMIT,
} from "./promptLibrary/image/ekamAllViews.js";

const SEP = " · ";

export default function EkamPromptBuilder() {
  const [style, setStyle] = useState(STYLE_META[0].key);
  const [object, setObject] = useState({});
  const [colourway, setColourway] = useState({});
  const [asset, setAsset] = useState({});
  const [length, setLength] = useState("compact");
  const [copied, setCopied] = useState(false);

  const styleMeta = STYLE_META.find((s) => s.key === style) || STYLE_META[0];
  const dials = STYLE_DIALS[style] || {};

  // Each style remembers its own dial positions, so switching style and back does not
  // silently reset a pick the user already made.
  const objVal = object[style] ?? dials.objects?.[0]?.key;
  const cwVal = colourway[style] ?? dials.colourways?.[0]?.key;
  const assetVal = asset[style] ?? dials.assets?.[0]?.key;

  const pick = { style, length };
  if (dials.objectKey && objVal) pick[dials.objectKey] = objVal;
  if (dials.colourways && cwVal) pick.colourway = cwVal;
  if (dials.assets && assetVal) pick.asset = assetVal;

  const prompt = ekamAllRecipe.compose(pick);
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

  const perStyle = (setter) => (key) => setter((prev) => ({ ...prev, [style]: key }));

  const picked = [styleMeta.label];
  if (dials.assets && assetVal)
    picked.push((dials.assets.find((a) => a.key === assetVal) || dials.assets[0]).label);
  if (dials.objects && objVal)
    picked.push((dials.objects.find((o) => o.key === objVal) || dials.objects[0]).label);
  if (dials.colourways && cwVal)
    picked.push((dials.colourways.find((c) => c.key === cwVal) || dials.colourways[0]).label);

  return (
    <div className="prd-builder">
      {chips("Style", STYLE_META, style, setStyle)}
      <p className="prd-amx__campaign-blurb">{styleMeta.blurb}</p>

      {dials.assets &&
        chips(dials.assetLabel || "Asset", dials.assets, assetVal, perStyle(setAsset))}
      {dials.objects &&
        chips(dials.objectLabel, dials.objects, objVal, perStyle(setObject))}
      {dials.colourways &&
        chips(
          dials.colourwayLabel || "Colourway",
          dials.colourways,
          cwVal,
          perStyle(setColourway)
        )}

      {!dials.objects && (
        <p className="prd-amx__campaign-blurb">
          This style is one fixed composition. Only the length register applies.
        </p>
      )}

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
          ? "The same system in the fewest words, written for Figma's image-generation prompt field, which caps prompt length. Non-negotiables come first."
          : "The full register: every clause spelled out. For fields with no character cap, or when a compact result drifts and you need the explanatory sub-clauses back."}
      </p>

      <p className="prd-amx__picked">
        {picked.join(SEP)}
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
    </div>
  );
}
