// Live prompt picker for the 3D icons system (promptLibrary/image, group "3D icons",
// spec pl-icons-3d-system). Drop the flat icon, drop the 3D sample beside it, name
// the icon, then pick the route, the camera, the material, the colour and the ground.
// One assembled prompt re-renders the flat icon as a soft 3D icon.
//
// Every word it emits comes from icons3dRecipe.compose() in
// promptLibrary/image/icons3dViews.js, the same recipe the written-out ladders below
// it are composed from, so the picker and the catalogs cannot drift.
//
// Neither image leaves the browser: each is previewed with an object URL so the
// picker can show it beside the prompt. Attach the same files beside the prompt in
// Figma or the model's own UI, in the order the route names them.
import { useEffect, useRef, useState } from "react";
import {
  icons3dRecipe,
  ROUTES,
  VIEWS,
  COLOURS,
  GROUNDS,
  STYLE_META,
  COMPACT_LIMIT,
} from "./promptLibrary/image/icons3dViews.js";

const SEP = " · ";
const find = (items, key) => items.find((x) => x.key === key) || items[0];

// One drop zone. The object URL is revoked when the file is replaced or removed.
function Drop({ label, hint, file, onFile, onClear }) {
  const [over, setOver] = useState(false);
  const inputRef = useRef(null);
  const url = file ? file.url : null;
  return (
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
        onFile(e.dataTransfer.files && e.dataTransfer.files[0]);
      }}
    >
      {url ? (
        <>
          <img src={url} alt={label} className="prd-cam__img" />
          <div className="prd-cam__imgmeta">
            <span>{label}</span>
            <button type="button" className="prd-pre__copy prd-cam__remove" onClick={onClear}>
              Remove
            </button>
          </div>
        </>
      ) : (
        <button type="button" className="prd-cam__dropbtn" onClick={() => inputRef.current?.click()}>
          <span className="prd-cam__dropbig">{label}</span>
          <span className="prd-cam__dropsmall">{hint}</span>
        </button>
      )}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        hidden
        onChange={(e) => onFile(e.target.files && e.target.files[0])}
      />
    </div>
  );
}

export default function Icons3dPromptBuilder() {
  const [style, setStyle] = useState(STYLE_META[0].key);
  const [route, setRoute] = useState(ROUTES[0].key);
  const [view, setView] = useState(VIEWS[0].key);
  const [colour, setColour] = useState(COLOURS[0].key);
  const [ground, setGround] = useState(GROUNDS[0].key);
  const [set, setSet] = useState("single");
  const [source, setSource] = useState("image");
  const [sample, setSample] = useState("yes");
  const [what, setWhat] = useState("");
  const [length, setLength] = useState("compact");
  const [copied, setCopied] = useState(false);

  const [icon, setIcon] = useState(null);
  const [ref, setRef] = useState(null);
  useEffect(() => () => icon && URL.revokeObjectURL(icon.url), [icon]);
  useEffect(() => () => ref && URL.revokeObjectURL(ref.url), [ref]);

  const take = (setter, after) => (f) => {
    if (!f || !f.type.startsWith("image/")) return;
    setter({ url: URL.createObjectURL(f), name: f.name });
    if (after) after();
  };

  const groundMeta = find(GROUNDS, ground);
  // the transparent ground is a GPT Image 2 API parameter: it composes the full
  // register whatever the length pick says, and falls back to white on other routes
  const alphaOff = groundMeta.gptOnly && route !== "gpt";
  const styleMeta = find(STYLE_META, style);
  const forcedFull = (groundMeta.fullOnly && !alphaOff) || Boolean(styleMeta.fullOnly);

  const pick = { style, route, view, colour, ground, set, source, sample, what: what.trim(), length };
  const prompt = icons3dRecipe.compose(pick);
  const effectiveLength = forcedFull ? "full" : length;
  const tooLong = effectiveLength === "compact" && prompt.length > COMPACT_LIMIT;

  const copy = () => {
    if (navigator.clipboard) navigator.clipboard.writeText(prompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const chips = (label, items, value, setter, hint) => (
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
            onClick={() => setter(it.key)}
          >
            {it.label}
          </button>
        ))}
      </div>
    </div>
  );

  const routeMeta = find(ROUTES, route);
  const first = route === "gpt" ? "Image 1" : route === "gemini" ? "First image" : "Selected layer";
  const second = route === "gpt" ? "Image 2" : route === "gemini" ? "Second image" : "Attached reference";

  const picked = [
    find(STYLE_META, style).label,
    routeMeta.label,
    find(VIEWS, view).label,
    find(COLOURS, colour).label,
    alphaOff ? GROUNDS[0].label : groundMeta.label,
    set === "set" ? "One of a set" : "Single icon",
  ];

  return (
    <div className="prd-builder prd-cam">
      <div className="prd-cam__top prd-cam__top--pair">
        <Drop
          label={source === "image" ? `${first} · the flat icon` : "The flat icon (not used in text mode)"}
          hint="Drop the 2D icon here, or click to choose. It stays in your browser; attach the same file beside the prompt."
          file={icon}
          onFile={take(setIcon, () => setSource("image"))}
          onClear={() => setIcon(null)}
        />
        <Drop
          label={sample === "yes" ? `${second} · the 3D sample` : "The 3D sample (off)"}
          hint="Drop an image of the look you want, such as the violet calendar. Optional: the words carry the look without it."
          file={ref}
          onFile={take(setRef, () => setSample("yes"))}
          onClear={() => setRef(null)}
        />
      </div>

      <div className="prd-faces__dial prd-cam__what">
        <label className="prd-faces__label" htmlFor="prd-i3d-what">
          What the icon is <span className="prd-cam__hint">optional, but it stops the model reinterpreting the image</span>
        </label>
        <input
          id="prd-i3d-what"
          className="prd-builder__select prd-cam__input"
          type="text"
          value={what}
          placeholder="a calendar glyph with a heart on it"
          onChange={(e) => setWhat(e.target.value)}
        />
      </div>

      {chips("Route", ROUTES, route, setRoute, "where the prompt goes; it changes only how the images are named")}
      <p className="prd-amx__campaign-blurb">{routeMeta.blurb}</p>

      {chips("Material", STYLE_META, style, setStyle)}
      <p className="prd-amx__campaign-blurb">{find(STYLE_META, style).blurb}</p>

      {chips("Camera", VIEWS, view, setView, "front is the reference")}
      <p className="prd-amx__campaign-blurb">{find(VIEWS, view).blurb}</p>

      {chips("Colour", COLOURS, colour, setColour, "one hue, graded by light")}
      <p className="prd-amx__campaign-blurb">{find(COLOURS, colour).blurb}</p>

      {chips("Ground", GROUNDS, ground, setGround)}
      <p className="prd-amx__campaign-blurb">
        {alphaOff
          ? "Transparent is a GPT Image 2 API parameter; on this route the prompt falls back to pure white. Cut out downstream."
          : groundMeta.blurb}
      </p>

      {chips(
        "Set",
        [
          { key: "single", label: "Single icon" },
          { key: "set", label: "One of a set", blurb: "Adds the shared-rig clause: same camera, light, edge radius, shadow and margin for every icon." },
        ],
        set,
        setSet
      )}

      {chips(
        "Subject source",
        [
          { key: "image", label: "Attached flat icon" },
          { key: "text", label: "Text only" },
        ],
        source,
        setSource
      )}
      <p className="prd-amx__campaign-blurb">
        {source === "image"
          ? "The attached flat icon carries the subject: its silhouette, its shapes and its colours. The prompt changes only the rendering and states what must not change."
          : "No flat icon. The subject comes from the description above (or [ICON] if it is empty) and the preserve clause is replaced by a restraint clause. Expect the model to invent the glyph; use this for a first sketch, then re-run with the sketch attached."}
      </p>

      {source === "image"
        ? chips(
            "3D sample",
            [
              { key: "yes", label: "Attached" },
              { key: "no", label: "None, words only" },
            ],
            sample,
            setSample
          )
        : null}

      {chips(
        "Length",
        [
          { key: "compact", label: `Compact · Figma prompt field (under ${COMPACT_LIMIT})` },
          { key: "full", label: "Full" },
        ],
        forcedFull ? "full" : length,
        setLength
      )}
      <p className="prd-amx__campaign-blurb">
        {forcedFull
          ? styleMeta.fullOnly
            ? "The wire treatments always compose the full register: the skeleton's proportion rules, sparse-line negation and two materials do not fit beside the rest of the system under the cap."
            : "The transparent ground always composes the full register: it is an API parameter and the API has no cap."
          : effectiveLength === "compact"
            ? "The same system in the fewest words, written for Figma's image-generation prompt field. In this register the icon's own colours ride on the preserve clause and the chamfer and squircle glosses are dropped."
            : "The full register: every clause spelled out, with the glosses. For fields with no character cap, or when a compact result drifts and you need the explanatory sub-clauses back."}
      </p>

      <p className="prd-amx__picked">
        {picked.join(SEP)}
        <span
          className="prd-amx__stylechip"
          style={tooLong ? { color: "var(--danger, #c0392b)" } : undefined}
          aria-live="polite"
        >
          {prompt.length.toLocaleString()} chars
          {effectiveLength === "compact" ? ` / ${COMPACT_LIMIT}` : ""}
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
