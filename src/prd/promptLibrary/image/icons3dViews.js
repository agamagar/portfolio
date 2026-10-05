// Recipe for the "3D icons" prompt system: take any flat 2D icon and re-render it
// as a soft, rounded, matte 3D icon in the register of the reference (a deep violet
// squircle calendar with two binder rings and a raised lavender heart, front-on, on
// white). The flat icon carries the metaphor, the silhouette and the colour; the
// prompt carries volume, material, light and what must not change.
//
// Built on the shared recipe contract in ./recipe.js (defineRecipe). Dials:
//   1. Source    - the attached flat icon, or a text description of one.
//   2. Sample    - whether a second image showing the target look is attached.
//   3. Route     - which model or field the prompt goes to. The vendors document
//                  different handles for "which image is which" (research/
//                  icons-3d-model-levers.md): Gemini says "the first image / the
//                  second image", OpenAI says "Image 1 / Image 2", Figma's Edit with
//                  prompt makes the selected layer the subject and the attachment
//                  "a reference", so the opener is written per route.
//   4. View      - front elevation (the reference; Apple's "front-facing perspective,
//                  level position"), the raised three-quarter, or the isometric: the
//                  three fixed cameras the 3dicons library rendered (dossier [9]).
//   5. Colour    - the icon's own hue graded by light (the default), or a named hue.
//   6. Ground    - pure white, or real alpha on the GPT Image 2 edits endpoint only.
//   7. Set       - one icon, or one of a set (adds the shared-rig clause).
// plus the STYLE slot: soft matte clay (the reference) or the glossy emoji finish.
//
// Every craft term is followed by a short gloss of what it looks like, per the
// pipeline rule: a model that does not know "fillet" still gets "a smooth rounded
// bevel". Sources by number refer to research/icons-3d.md unless marked M (model
// levers, research/icons-3d-model-levers.md).
import { defineRecipe } from "./recipe.js";

export const EXTRA_RULE = undefined;

// The Figma prompt-field working ceiling, rules included. UNSOURCED as a Figma
// figure (see research/models.md, rule 12); kept as the library's compact register.
export const COMPACT_LIMIT = 1000;

// ---------- dial 3: route (which model or field the prompt is for) ----------
export const ROUTES = [
  {
    key: "figma",
    label: "Figma · Edit with prompt",
    blurb: "Select the flat icon on the canvas, attach the 3D sample as the reference. Vendor-neutral wording, because Figma does not document which image it sends first.",
  },
  {
    key: "gemini",
    label: "Gemini · Nano Banana",
    blurb: "Attach the flat icon first and the sample second. Google's own handles: 'the first image', 'the second image'.",
  },
  {
    key: "gpt",
    label: "GPT Image 2 · edits",
    blurb: "Images by index: Image 1 the icon, Image 2 the style reference. The only route with real alpha (background: transparent, png).",
  },
];

// ---------- the opener: what the reference images are and what the job is ----------
// The subject is named independently of the image because an image with no stated
// subject gets interpreted rather than obeyed (research/base-mesh-restyling.md), and
// Google's single-image handle is "Using the provided image of [subject]" (M1).
const nameOf = (what) => (what && what.trim()) || "";

export const openFor = ({ source = "image", sample = "yes", route = "figma", what = "" } = {}, S) => {
  const w = nameOf(what);
  const of = w ? ` of ${w}` : "";
  const look = S.lookName; // "a soft matte 3D icon" / "a glossy 3D icon"
  if (source === "text") {
    return `${w || "[ICON]"}, drawn as a flat icon and rendered as ${look}: an app-icon render, not a photograph of a real object.`;
  }
  if (sample === "yes") {
    if (route === "gemini")
      return `Take the flat icon${of} from the first image and re-render it as ${look} in the style of the second image. An app-icon render, not a photograph of a real object.`;
    if (route === "gpt")
      return `Image 1: the flat 2D icon${of} to re-render. Image 2: style reference only. Apply Image 2's style to Image 1: render the icon from Image 1 as ${look}. An app-icon render, not a photograph of a real object.`;
    return `Re-render this flat icon${of} as ${look} in the style of the attached reference image. An app-icon render, not a photograph of a real object.`;
  }
  const handle = route === "gpt" ? "the input image" : "the provided image";
  return `Using ${handle}${of ? of : " of a flat icon"}, re-render it as ${look}: an app-icon render, not a photograph of a real object.`;
};

export const openShortFor = ({ source = "image", sample = "yes", route = "figma", what = "" } = {}, S) => {
  const w = nameOf(what);
  const of = w ? ` of ${w}` : "";
  const look = S.lookNameShort;
  if (source === "text") return `${w || "[ICON]"}, a flat icon rendered as ${look}.`;
  if (sample === "yes") {
    if (route === "gemini") return `Re-render the flat icon${of} in the first image as ${look} in the style of the second image.`;
    if (route === "gpt") return `Image 1: the flat icon${of}. Image 2: style reference only. Render Image 1 as ${look} in Image 2's style.`;
    return `Re-render this flat icon${of} as ${look} in the style of the attached reference.`;
  }
  return `Re-render the flat icon${of} in ${route === "gpt" ? "the input image" : "the provided image"} as ${look}.`;
};

// ---------- dial 4: view ----------
// Front is the reference and the rule: Apple's "front-facing perspective, level
// position" ([1]); the 3dicons library kept Front, ISO and Dynamic as three fixed
// cameras with their own light sets ([9]). Depth in the front view is read from three
// cues only (rolled edge, raised parts, shadows), which is why the clause says so:
// most 3D captions are three-quarter views and the model drifts there otherwise.
export const VIEWS = [
  {
    key: "front",
    label: "Front elevation",
    blurb: "The reference. Camera level and square to the icon, no perspective; depth from the rounded edges, the raised parts and their shadows.",
    view: "Front elevation: the camera level with the icon and square to it, no perspective tilt, so depth reads only from the rounded edges, the raised parts and their shadows.",
    // a solo skeleton has no rounded edges or raised slabs, so the depth cue is swapped
    viewWire: "Front elevation: the camera level with the icon and square to it, no perspective tilt, so depth reads only from the struts' foreshortening, the spheres' overlap and their shadows.",
    viewShort: "Front elevation, level and square, no perspective; depth only from edges, raised parts and shadows.",
  },
  {
    key: "dynamic",
    label: "Raised three-quarter",
    blurb: "The 'dynamic' camera of the icon packs: raised and turned so the top and one side show, the front still dominant.",
    view: "A raised three-quarter view: the camera lifted above the icon and turned about 30 degrees around it, so the top face and one side face show as thin bands while the front stays dominant, mild perspective.",
    viewShort: "Raised three-quarter, lifted and turned about 30 degrees, top and one side showing as thin bands.",
  },
  {
    key: "iso",
    label: "Isometric",
    blurb: "Orthographic, turned 45 degrees and raised 35: top and two sides in near-equal weight, parallel edges staying parallel.",
    view: "Isometric: orthographic projection with no perspective, the icon turned 45 degrees around and the line of sight dropping about 35 degrees, so the top and two side faces share the frame and every parallel edge stays parallel.",
    viewShort: "Isometric, orthographic, turned 45 and raised 35 degrees: top and two sides, parallel edges parallel.",
  },
];

// ---------- the form: slabs, fillets, the squircle ----------
// Two roundings, named separately: in plan the corner is Apple's squircle ([3]); in
// section the edge is a fillet, a rounded bevel of several segments, never a chamfer
// ([10][15]). "A twentieth of the body width" is the vendor macro-bevel range of 2 to
// 5 percent ([16], secondary). Each shape of the flat icon becomes its own slab, the
// body lowest and the rest raised in front of it: Apple's float-above rule ([1]) and
// Google's "elevate a key element" pattern ([22]). "Puffy" and "inflated" are not
// written anywhere: undocumented for this look and they change the form ([29]).
export const FORM =
  "Each shape of the flat icon becomes its own slab of even thickness: the body lowest, the smaller shapes raised in front of it, every edge filleted with a smooth rounded bevel about a twentieth of the body width, no chamfers and no sharp edges; a rounded-square body keeps a squircle outline with full, continuous corners.";
export const FORM_SHORT =
  "Each shape its own slab, body lowest, others raised in front, every edge a smooth rounded fillet.";

// ---------- the shadows: exactly three, all soft ----------
// Google's product-icon shadow spec: a contact shadow around raised elements, a
// shadow "heavier below and to the right", 20 percent opacity, 4dp offset and blur
// ([22]); Apple's "uniform drop shadow" ([1]). The count is the point: the generic
// render has a black pool under the icon and a hard cast shadow across the body.
export const SHADOWS =
  "Three shadows only, all soft and low opacity: a contact shadow in the seams where parts meet, a slightly heavier shadow just below and to the right of each raised part, and one diffuse drop shadow under the whole icon.";
export const SHADOWS_SHORT =
  "Soft low-opacity shadows only: contact in the seams, one diffuse drop shadow.";
// On a transparent ground there is no ground to receive a shadow, and one would be
// baked into the alpha (M5), so the count drops to two and both stay on the icon.
export const SHADOWS_NO_GROUND =
  "Two shadows only, both soft, low opacity and on the icon itself: a contact shadow in the seams where parts meet and a slightly heavier shadow just below and to the right of each raised part; nothing falls on the ground.";
export const SHADOWS_NO_GROUND_SHORT =
  "Soft low-opacity shadows on the icon only: contact in the seams, a little heavier below-right of raised parts; nothing on the ground.";

// ---------- dial 5: colour ----------
// "own" is the rule from the reference and Google's spec: one hue, tinted on the lit
// edge, shaded on the low edge, a faint "finish" gradient from upper-left to lower-
// right ([22]). Named hues exist for recolouring a set; each is one hue graded the
// same way, so the ramp is made by light and never by a second colour. The violet is
// the reference, measured off the image: lit body #8459cb, shaded body #4d2a97,
// heart tint #cbb6ef (Claude/3D Icons/reference-calendar-heart.png). `hue` and
// `contrast` feed the wire treatments: the complement is the sourced rule for a
// contrasting overlay hue ("opposite sides of the color wheel", W13; Material's
// on-colour, W25).
export const COLOURS = [
  {
    key: "own",
    label: "The icon's own colours",
    hue: "the icon's own hue",
    contrast: "the complement of the icon's own hue, the colour opposite it on the colour wheel",
    blurb: "One hue from the flat icon, graded by light. The default and the reason the metaphor survives.",
    keepsSource: true,
    colour: "One hue from the flat icon, graded by light: the body at the icon's own colour, sunk parts a shade darker, raised parts a tint lighter, and a faint finish gradient from upper left to lower right across the body; no new hues.",
    colourShort: "One hue from the icon graded by light: sunk parts darker, raised parts lighter, no new hues.",
  },
  {
    key: "violet",
    label: "Reference violet",
    hue: "the deep violet",
    contrast: "a warm amber yellow, the complement of the violet",
    blurb: "The reference's deep violet: body #8459cb lit to #4d2a97 in shade, raised parts a pale lavender tint.",
    colour: "One deep violet hue graded by light: the body a deep violet around #8459cb where lit and #4d2a97 in shade, sunk parts a shade darker, raised parts a pale lavender tint around #cbb6ef, and a faint finish gradient from upper left to lower right across the body; no new hues.",
    colourShort: "One deep violet hue graded by light: #8459cb lit, #4d2a97 shaded, raised parts lavender #cbb6ef.",
  },
  {
    key: "coral",
    label: "Coral",
    hue: "the soft coral",
    contrast: "a deep teal blue, the complement of the coral",
    blurb: "One warm coral hue graded by light.",
    colour: "One warm coral hue graded by light: the body a soft coral red, sunk parts a shade darker, raised parts a pale peach tint, and a faint finish gradient from upper left to lower right across the body; no new hues.",
    colourShort: "One warm coral hue graded by light: sunk parts darker, raised parts a pale peach tint, no new hues.",
  },
  {
    key: "teal",
    label: "Teal",
    hue: "the deep teal",
    contrast: "a warm coral orange, the complement of the teal",
    blurb: "One deep teal hue graded by light.",
    colour: "One deep teal hue graded by light: the body a deep blue-green teal, sunk parts a shade darker, raised parts a pale mint tint, and a faint finish gradient from upper left to lower right across the body; no new hues.",
    colourShort: "One deep teal hue graded by light: sunk parts darker, raised parts a pale mint tint, no new hues.",
  },
  {
    key: "graphite",
    label: "Graphite",
    hue: "the charcoal",
    // light metal on a dark body is inference (W dossier, section 7): the sources give
    // the complement rule and Material's on-colour, not a rule for near-black bodies
    contrast: "bright polished chrome, a light metal that reads on top of the dark body",
    blurb: "One near-black graphite hue graded by light. The one colour that asks for a rim light.",
    colour: "One graphite hue graded by light: the body a deep charcoal grey, sunk parts a shade darker, raised parts a pale silver tint, a faint finish gradient from upper left to lower right across the body, and a thin soft rim light so the dark edges separate from the ground; no new hues.",
    colourShort: "One charcoal hue graded by light: sunk parts darker, raised parts silver, a thin soft rim light.",
  },
];

// ---------- dial 6: ground ----------
// White in words on every route: it is the only lever on Gemini, whose docs give no
// alpha at all, and OpenAI's own style-transfer example asks for white in words even
// though the model can do alpha (M1, M7). Real alpha exists on GPT Image 2 only,
// through background: "transparent" plus png, and the prompt still has to say it,
// because "A drawn checkerboard is not transparency" (M5). The word "transparent" is
// therefore never written for any other route: a model that cannot emit alpha has
// nothing to do with the word except paint it (research/icons.md source 18).
export const GROUNDS = [
  {
    key: "white",
    label: "Pure white",
    blurb: "A flat white field with the drop shadow on it. Every route. Cut out downstream.",
    ground: "On a pure white ground, nothing else in frame, the icon centred with even margin on every side.",
    groundShort: "Pure white ground, icon centred with even margin.",
  },
  {
    key: "alpha",
    label: "Transparent (GPT Image 2 only)",
    blurb: "Real alpha through background: transparent and output_format: png, an API parameter, so the prompt is the full register (the API has no cap). Drops the ground shadow so it is not baked into the alpha. Other routes fall back to white.",
    gptOnly: true,
    fullOnly: true,
    ground: "Isolate the icon on a fully transparent background, centred with even margin. Do not add a solid backdrop, checkerboard, scenery, or a shadow on the ground.",
    groundShort: "Fully transparent background: no backdrop, checkerboard, scenery or ground shadow.",
  },
];

// ---------- the preserve clause: hold the icon, change the rendering ----------
// Google: "Preserve the original composition" and "Keep everything else in the image
// exactly the same" (M1); OpenAI: "change only X" plus "keep everything else the
// same", restated every iteration, and "Do not change anything else." (M5, M7). The
// sentence about the sample's colours is ours and load-bearing: both vendors' style
// templates invite a new palette, so the prompt says the sample lends material, light
// and depth and nothing else. The real-world-detail negation targets the documented
// failure (the icon becoming a product shot) and is the only negation kept.
export const preserveFor = ({ sample = "yes", route = "figma" } = {}, keepsColour) => {
  const kept = keepsColour ? "the same silhouette, the same shapes in the same positions and the same colours as the flat icon" : "the same silhouette and the same shapes in the same positions as the flat icon";
  const lend = sample === "yes" ? ` ${route === "gpt" ? "Image 2" : route === "gemini" ? "The second image" : "The reference image"} lends only its material, light and depth; its colours and its subject do not carry over.` : "";
  return `Preserve the original composition: ${kept}.${lend} Change only the rendering: add volume, material and light and nothing else, no scene, no props, no real-world detail such as paper pages or hinges. Do not change anything else.`;
};
export const preserveShortFor = ({ sample = "yes", route = "figma" } = {}, keepsColour) => {
  const kept = keepsColour ? "silhouette, shapes, positions and colours" : "silhouette, shapes and positions";
  const lend = sample === "yes" ? `; ${route === "gpt" ? "Image 2" : route === "gemini" ? "the second image" : "the reference"} lends only material, light and depth` : "";
  return `Keep the icon's ${kept}${lend}; add nothing else: no scene, props or real-world detail.`;
};

// Text source: nothing to preserve, but the same restraint against props and scene.
export const RESTRAINT =
  "A single focus, built from simple shapes: no scene, no props, no real-world detail such as paper pages or hinges, the metaphor readable at a glance.";
export const RESTRAINT_SHORT = "One focus from simple shapes: no scene, props or real-world detail.";

// ---------- dial 7: set ----------
// Consistency across a set is a grid and a light rig, not taste: keyline shapes for
// "consistent visual proportion" ([22]), Apple's icon grid ([1]), the 3dicons library
// reusing "three sets of the same lights" ([9]). Margin: nothing solid found as a
// number, so it stays "the same margin".
export const SET_CLAUSE =
  "One of a set: every icon in the set uses the same camera, the same light rig, the same edge radius and the same ground shadow, and sits on the same keyline grid with the same margin inside the frame.";
export const SET_CLAUSE_SHORT =
  "One of a set: same camera, light, edge radius, shadow and margin.";

// ---------- the styles (material and light) ----------
// Soft matte is the reference and a decision, not a default, because the nearest
// famous reference (Fluent 3D emoji) is "glossy, gradient-heavy" ([8]). Roughness 1.0
// "gives a diffuse reflection" ([11]), "high is chalk, rubber" ([17]); a little
// subsurface ("skin, milk and wax") and sheen ("soft velvet like reflection near
// edges") are the two Principled terms that turn hard plastic into clay ([11][28]).
// The light is one large softbox from the upper left with a strong fill: area lights
// "produce shadows with soft borders" and larger ones softer highlights ([12][26]);
// fill lessens chiaroscuro so the shadow side keeps its colour ([24]); upper-left is
// Google's 45 degree top-left light and the reference itself ([22]).
const parts = (S) => (pick) => {
  const text = pick.source === "text";
  const V = VIEWS.find((v) => v.key === pick.view) || VIEWS[0];
  const C = COLOURS.find((c) => c.key === pick.colour) || COLOURS[0];
  let G = GROUNDS.find((g) => g.key === pick.ground) || GROUNDS[0];
  if (G.gptOnly && pick.route !== "gpt") G = GROUNDS[0];
  // the transparent ground is an API parameter and the API has no cap, so that pick
  // always composes the full register (the picker says so; the checker prunes it)
  // a style that carries more system than the cap holds (the wire treatments) is
  // full-register only, like a team-illustration scene; the picker says so
  const compact = pick.length === "compact" && !G.fullOnly && !S.fullOnly;
  const keepsColour = Boolean(C.keepsSource);
  // in the compact register the preserve clause already holds the icon's own colours,
  // so the grading sentence is spent only when a named hue replaces them
  const colour = compact ? (keepsColour && !text ? "" : C.colourShort) : C.colour;
  const tail = text
    ? compact ? RESTRAINT_SHORT : RESTRAINT
    : compact ? preserveShortFor(pick, keepsColour) : preserveFor(pick, keepsColour);
  const set = pick.set === "set" ? (compact ? SET_CLAUSE_SHORT : SET_CLAUSE) : "";
  // A style MAY override the form and the shadow constants by declaring same-named
  // fields (the wire treatments replace slabs with struts); absent, the constant holds.
  const form = compact ? S.formShort ?? FORM_SHORT : S.form ?? FORM;
  const shadows =
    G.key === "alpha"
      ? compact ? S.shadowsNoGroundShort ?? SHADOWS_NO_GROUND_SHORT : S.shadowsNoGround ?? SHADOWS_NO_GROUND
      : compact ? S.shadowsShort ?? SHADOWS_SHORT : S.shadows ?? SHADOWS;
  // A wire style adds the contrasting wire colour from the colour dial; a solo wire
  // style has no body, so the body's grading sentence is dropped and only the wire
  // colour composes.
  const wire = S.wireFor ? S.wireFor(C) : "";
  // the overlay adds one contrasting hue after the body clause, so the body clause
  // must not close with "no new hues" (the wire clause carries the restriction)
  const bodyColour = S.wire === "solo" ? "" : S.wire ? colour.replace(/[;,] no new hues\.$/, ".") : colour;
  return [
    compact ? openShortFor(pick, S) : openFor(pick, S),
    compact ? V.viewShort : (S.wire === "solo" && V.viewWire) || V.view,
    form,
    compact ? S.materialShort : S.material,
    compact ? S.lightShort : S.light,
    shadows,
    bodyColour,
    wire,
    compact ? G.groundShort : G.ground,
    tail,
    set,
  ];
};

export const STYLES = [
  {
    key: "matte",
    label: "Soft matte clay",
    blurb: "The reference: matte soft-touch plastic like clay, one large softbox from the upper left, broad dim highlights. Not glossy.",
    lookName: "a soft matte 3D icon",
    lookNameShort: "a soft matte 3D icon",
    material:
      "Matte soft-touch plastic like modelling clay: high roughness with no mirror reflections, a faint velvety sheen near the edges and a little subsurface softness so light sinks into the edge instead of stopping at it; not glossy, not the shiny gradient emoji finish.",
    materialShort:
      "Matte soft-touch plastic like clay: high roughness, no mirror reflections, faint sheen, slight subsurface, not glossy.",
    light:
      "One large softbox from the upper left, high and in front of the icon, with a strong fill so the shadow side keeps the icon's colour; highlights broad and dim, never a hot point.",
    lightShort: "One large softbox upper left with strong fill; broad dim highlights.",
  },
  {
    key: "gloss",
    label: "Glossy emoji",
    blurb: "The Fluent 3D emoji finish: glossy hard plastic, soft gradients, a bright but soft-edged highlight. Same light rig.",
    lookName: "a glossy 3D icon",
    lookNameShort: "a glossy 3D icon",
    material:
      "Glossy hard plastic in the 3D emoji finish: a smooth polished surface with low roughness, soft linear and radial gradients across each slab, a bright but soft-edged specular highlight on every rounded edge, no mirror-sharp reflections of the room.",
    materialShort:
      "Glossy hard plastic, 3D emoji finish: polished, soft gradients, a bright soft-edged highlight on each rounded edge.",
    light:
      "One large softbox from the upper left, high and in front of the icon, with a strong fill so the shadow side keeps the icon's colour; highlights bright but broad, from the size of the light rather than a point.",
    lightShort: "One large softbox upper left with strong fill; bright but broad highlights.",
  },
  // ---------- the wire treatments (research/icons-3d-wire.md, cited W#) ----------
  // Named by its two real referents, never "wireframe" alone, which pulls monochrome
  // fine-line drawings (W24): a ball-and-stick skeleton (bead-on-rod proportion, W10,
  // W18) of struts and nodes (the truss words, W11, W17). Both proportion relations are
  // stated because equal sphere and rod radius is the plain-wireframe look (W14) and
  // the practitioner recipe runs the rod far thinner than the bead (W19). Straight
  // capped cylinders come from a circle profile with end caps (W6, W15); the spiky and
  // blobby wire is the Wireframe modifier's documented failure (W1). Sparse line set:
  // silhouette, crease and border edges only (W8), no triangulated surface mesh, which
  // is the tools' default (W9, W16). Bead shine is a tight low-roughness highlight plus
  // a Fresnel rim (W21); the glossy-bead, satin-strut split is inference (W19 documents
  // separate materials per part, not this pairing). Both treatments carry more system
  // than the compact cap holds, so they compose the full register only.
  {
    key: "wire",
    label: "Ball-and-stick wire",
    blurb: "The icon as a sparse skeleton: thin straight struts, a very small glossy sphere at every vertex, spheres in a contrasting colour. Full register only.",
    fullOnly: true,
    wire: "solo",
    lookName: "a ball-and-stick wire icon",
    lookNameShort: "a ball-and-stick wire icon",
    form:
      "The icon becomes a ball-and-stick skeleton, like a chemistry model kit or a filigree space-frame truss: only its silhouette and its main construction edges, drawn as thin straight struts of one constant diameter with flat capped ends, hard-surface and CAD-clean, no taper, no sag, no blobs at the joints; one very small glossy sphere at every vertex where struts meet and nowhere else, no corner missing its sphere, each sphere a few times the strut's diameter yet a small fraction of the strut's length; no solid faces, no triangulated surface mesh, no filler edges on flat regions.",
    formShort: "",
    material:
      "Two materials: the spheres glossy, low roughness, each with one tight specular highlight and a bright rim where the light grazes it; the struts satin, no highlight competing with the spheres. Not a monochrome line drawing.",
    materialShort: "",
    light:
      "One large softbox from the upper left, high and in front of the icon, with a strong fill so the far struts keep their colour; the spheres each catch the same small highlight.",
    lightShort: "",
    shadows:
      "One diffuse drop shadow of the whole skeleton on the ground, soft and low opacity, the struts' shadows as fine lines; no contact shadows.",
    shadowsShort: "",
    shadowsNoGround: "No shadow on the ground; only the shading on the struts and spheres themselves.",
    shadowsNoGroundShort: "",
    wireFor: (C) =>
      `The struts in ${C.hue}, one simple flat colour; every sphere in ${C.contrast}, so the beads read as a contrasting accent on the skeleton; no other hues.`,
  },
  {
    key: "wireover",
    label: "Wire over matte",
    blurb: "The soft matte body with the ball-and-stick skeleton traced over it in a complementary colour, floating a hair above the surface. Full register only.",
    fullOnly: true,
    wire: "over",
    lookName: "a soft matte 3D icon with a ball-and-stick wire overlay",
    lookNameShort: "a soft matte 3D icon with a ball-and-stick wire overlay",
    form: `${FORM} Over the body, a ball-and-stick skeleton traces the silhouette and the main construction edges as edges drawn on top of the shading, floating a hair above the surface and never sinking into it: thin straight struts of one constant diameter with flat capped ends, hard-surface and CAD-clean, no taper and no blobs at the joints; one very small glossy sphere at every vertex where struts meet and nowhere else, no corner missing its sphere, each sphere a few times the strut's diameter yet a small fraction of the strut's length; no triangulated mesh, no filler edges on flat regions.`,
    formShort: "",
    material:
      "The body in matte soft-touch plastic like modelling clay: high roughness with no mirror reflections, a faint velvety sheen near the edges and a little subsurface softness; not glossy. The skeleton in two materials: the spheres glossy, low roughness, each with one tight specular highlight and a bright rim; the struts satin.",
    materialShort: "",
    light:
      "One large softbox from the upper left, high and in front of the icon, with a strong fill so the shadow side keeps the icon's colour; highlights on the body broad and dim, on the spheres small and tight.",
    lightShort: "",
    wireFor: (C) =>
      `The skeleton, struts and spheres alike, in ${C.contrast}: one complementary colour read as an on-colour sitting on top of the body; no other new hues.`,
  },
].map((s) => ({ ...s, parts: parts(s) }));

export const STYLE_META = STYLES.map(({ key, label, blurb, fullOnly }) => ({ key, label, blurb, fullOnly: Boolean(fullOnly) }));

export const icons3dRecipe = defineRecipe({
  key: "icons-3d",
  label: "3D icons",
  dials: {
    source: ["image", "text"],
    sample: ["yes", "no"],
    route: ROUTES.map((r) => r.key),
    view: VIEWS.map((v) => v.key),
    colour: COLOURS.map((c) => c.key),
    ground: GROUNDS.map((g) => g.key),
    set: ["single", "set"],
  },
  styles: STYLES,
  extraRule: EXTRA_RULE,
  // "Converging on the look": what to change when a render drifts, one clause each
  tokens: [
    "The icon came back as a real object (paper pages, a hinge, a scene): the conservation clause lost. Put the icon's name in the field ('a calendar glyph with a heart'), switch to the full register, and attach the flat icon again beside the best render so far.",
    "The camera drifted to a three-quarter view on the front pick: most 3D captions are three-quarter. The full register's front clause says depth reads only from the edges, the raised parts and the shadows; if it still tilts, add 'like an app icon on a home screen' to the description.",
    "It came back glossy: the famous reference (Fluent 3D emoji) is glossy and the model reaches for it. The matte style already says 'not glossy'; if it persists, add 'roughness 1.0' to the description, which is the render-tool number for a fully diffuse surface.",
    "The heart or the rings look printed on rather than raised: the stacking clause lost. Name the raised part in the description ('the heart is a separate slab standing proud of the body') so the contact shadow has something to sit under.",
    "A new colour appeared, usually from the sample: the style templates on both vendors invite a palette. The preserve clause says the sample lends only material, light and depth; if a hue still leaks, pick the icon's own colours and remove the sample.",
    "The edges are a hard 45 degree chamfer with a highlight line: 'bevel' alone does that. The form clause says 'filleted, a smooth rounded bevel'; add 'several segments, a rolled edge' if it persists.",
    "A black pool under the icon or a hard cast shadow across the body: a small light. Say 'large softbox, shadows with soft borders' in the description, and keep the shadow clause's count at three.",
    "On GPT Image 2 with the transparent ground, check the decoded alpha channel: a painted checkerboard is not transparency, and a ground shadow will be baked into the alpha unless the prompt says no shadow on the ground, which the alpha clause does.",
  ],
});
