// Live prompt builder for the Zepto FMCG composition system (promptLibrary/image,
// spec pl-zepto-fmcg-composition-system). Five dropdowns drive one assembled prompt;
// the option text below mirrors that spec's "Camera angles" / "Color themes" /
// "Shadow types" / "Number of objects" / "Surface / material" lists, so keep both in
// sync if either changes. Surface/material was added after QA against real Zepto FMCG
// SKUs (glossy cans/tins, foil bags, glass bottles) that need per-material relighting.
import { useState } from "react";

const ANGLES = [
  { value: "hero-45", desc: "Three-quarter hero angle, camera 45 degrees above and to the side, looking slightly down. The classic premium product-shot angle." },
  { value: "eye-level", desc: "Straight-on eye-level, camera at the product's midpoint height, no tilt." },
  { value: "top-down", desc: "Flat lay, camera directly overhead, looking straight down." },
  { value: "low-angle", desc: "Low hero angle, camera slightly below the product looking up, makes it feel monumental." },
  { value: "three-quarter-side", desc: "Camera at product height, rotated about 30 degrees to reveal side and front faces." },
  { value: "macro-detail", desc: "Tight close-up, the whole product shown large and filling most of the frame, still complete and uncropped." },
];

const THEMES = [
  { value: "old-money", desc: "Muted warm neutrals, deep forest green, chestnut brown, cream and ivory, brushed brass accents, linen and wood textures, soft diffused daylight. Nothing saturated or loud." },
  { value: "poppy", desc: "High-saturation, punchy complementary colors, a bold single-color backdrop, playful and energetic, crisp contrast, graphic and modern." },
];

const SHADOWS = [
  { value: "soft", desc: "Diffused, gentle falloff, low contrast, large softbox feel." },
  { value: "hard", desc: "Crisp, high-contrast, directional, single strong point light." },
  { value: "long-dramatic", desc: "Long shadow stretching across the frame at a low raking angle, editorial and moody." },
  { value: "none-floating", desc: "No shadow. Product floats, clean cutout style." },
  { value: "color-gel", desc: "Soft shadow tinted with a subtle color matching the backdrop's accent, trendy editorial FMCG look." },
  { value: "reflection", desc: "No cast shadow. Soft glossy reflection beneath, as if on a polished surface." },
];

const OBJECTS = [
  { value: "single", desc: "Only the hero product as the subject, no extra objects or props, with the generated scene and background around it." },
  { value: "hero-plus-props", desc: "Hero product plus one or two generated supporting props or ingredients framing it, product still dominant." },
  { value: "grouped-skus", desc: "Two to three identical, unaltered copies of the same product PNG, arranged as a family shot." },
  { value: "scattered-ambient", desc: "Hero product surrounded by loosely scattered generated ambient elements (ingredients, droplets, petals) suggesting context without competing." },
];

const MATERIALS = [
  { value: "matte-paper", desc: "The product is matte paper or board (carton, box, tub, paper bag). Light the scene softly and evenly so the pack stays non-reflective and its print reads flat and true; add no glossy highlights to the product." },
  { value: "glossy-metal", desc: "The product is a glossy metal can or tin. Choose scene lighting suited to a reflective metal pack; keep its existing highlights and reflections exactly as in the PNG, adding none and removing none." },
  { value: "glass-transparent", desc: "The product is a transparent glass bottle. Let the generated background show through the clear areas of the PNG; keep the glass, liquid, cap and label exactly as provided, adding no new refraction or highlights onto the product." },
  { value: "foil-flexible", desc: "The product is a glossy flexible foil pouch or bag. Choose soft, even scene lighting that suits a crinkled foil pack; keep its existing crinkle highlights exactly as in the PNG, adding none and removing none." },
];

function buildPrompt({ angle, theme, shadow, objects, material }) {
  return `Build a complete, premium product photography scene around the attached image, which is a transparent-background PNG cutout of the product. This PNG is the only source image: generate the entire background, surface, setting, lighting and any surrounding elements from this description alone.

Camera: ${angle.desc}
Scene and palette: ${theme.desc}
Shadow: ${shadow.desc}
Composition: ${objects.desc}
Surface: ${material.desc}

Use the product from the PNG exactly as provided, with zero alterations: do not relight, recolour, redraw, re-letter, restyle, retexture, rotate, straighten, warp, crop or regenerate the product or its label in any way, and do not touch its existing highlights, reflections or shading. Every pixel of the product stays identical to the source; only position and scale within the frame may change. All variation between outputs comes purely from the generated scene, background, surface, props and shadow around it (handled by the Shadow and Surface settings above), never from the product itself. Build the scene's lighting to match the light direction and colour temperature already visible on the product, so it sits in the generated scene as one real photograph without altering the product. Output one flattened, high-resolution image, 1:1 square crop. No added text, letters or numbers anywhere in the image beyond what already exists on the product's own packaging. Strip all added branding: no extra logos, wordmarks or brand marks beyond what is already on the product itself.`;
}

function Field({ label, options, value, onChange }) {
  return (
    <label className="prd-builder__field">
      <span className="prd-field__label">{label}</span>
      <select className="prd-builder__select" value={value} onChange={(e) => onChange(e.target.value)}>
        {options.map((o) => (
          <option key={o.value} value={o.value}>{o.value}</option>
        ))}
      </select>
    </label>
  );
}

export default function CompositionPromptBuilder() {
  const [angle, setAngle] = useState(ANGLES[0].value);
  const [theme, setTheme] = useState(THEMES[0].value);
  const [shadow, setShadow] = useState(SHADOWS[0].value);
  const [objects, setObjects] = useState(OBJECTS[0].value);
  const [material, setMaterial] = useState(MATERIALS[0].value);
  const [copied, setCopied] = useState(false);

  const prompt = buildPrompt({
    angle: ANGLES.find((o) => o.value === angle),
    theme: THEMES.find((o) => o.value === theme),
    shadow: SHADOWS.find((o) => o.value === shadow),
    objects: OBJECTS.find((o) => o.value === objects),
    material: MATERIALS.find((o) => o.value === material),
  });

  const copy = () => {
    if (navigator.clipboard) navigator.clipboard.writeText(prompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="prd-builder">
      <div className="prd-builder__row">
        <Field label="Camera angle" options={ANGLES} value={angle} onChange={setAngle} />
        <Field label="Color theme" options={THEMES} value={theme} onChange={setTheme} />
        <Field label="Shadow type" options={SHADOWS} value={shadow} onChange={setShadow} />
        <Field label="Objects" options={OBJECTS} value={objects} onChange={setObjects} />
        <Field label="Surface / material" options={MATERIALS} value={material} onChange={setMaterial} />
      </div>
      <div className="prd-pre">
        <button type="button" className="prd-pre__copy" onClick={copy}>{copied ? "Copied" : "Copy"}</button>
        <pre>{prompt}</pre>
      </div>
    </div>
  );
}
