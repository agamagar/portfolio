// Live prompt picker for the Schedule POV system (promptLibrary/image, group
// "Schedule POV"). Pick a moment, optionally say a reference image is attached,
// copy the block. Every word comes from schedulePovRecipe.compose() in
// promptLibrary/image/schedulePovViews.js.
//
// v2 (2026-09-15): deliberately two controls. v1 carried ten dials over from
// Schedule images and Agam's verdict was "too much context has been carried over".
import { useState } from "react";
import {
  schedulePovRecipe,
  MOMENTS,
  REFERENCES,
  COMPACT_LIMIT,
} from "./promptLibrary/image/schedulePovViews.js";

export default function SchedulePovPromptBuilder() {
  const [moment, setMoment] = useState(MOMENTS[0].key);
  const [reference, setReference] = useState(REFERENCES[0].key);
  const [copied, setCopied] = useState(false);

  const m = MOMENTS.find((x) => x.key === moment) || MOMENTS[0];
  const prompt = schedulePovRecipe.compose({ moment, reference, length: "compact" });
  const over = prompt.length > COMPACT_LIMIT;

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
    <div className="prd-builder prd-builder--simple">
      {chips("Moment", MOMENTS, moment, setMoment)}
      <p className="prd-amx__campaign-blurb">
        "{m.quote}" Follows reference {m.ref}: {m.refLabel}.
      </p>

      {chips("Reference image", REFERENCES, reference, setReference)}
      <p className="prd-amx__campaign-blurb">
        {reference === "attached"
          ? `Attach reference ${m.ref} in the same Figma chat. The block takes its camera angle, framing, hands, lens and light, and none of its people or setting.`
          : `Words only. For the keeper, attach reference ${m.ref} and switch this on.`}
      </p>

      <p className="prd-amx__picked">
        {m.label}
        <span
          className="prd-amx__stylechip"
          style={over ? { color: "var(--danger, #c0392b)" } : undefined}
          aria-live="polite"
        >
          {prompt.length.toLocaleString()} / {COMPACT_LIMIT}
        </span>
      </p>

      <div className="prd-pre">
        <button type="button" className="prd-pre__copy" onClick={copy}>
          {copied ? "Copied" : "Copy"}
        </button>
        <pre>{prompt}</pre>
      </div>
      <p className="prd-amx__campaign-blurb">
        Paste the whole block into a fresh Figma chat every time; nothing carries over.
      </p>
    </div>
  );
}
