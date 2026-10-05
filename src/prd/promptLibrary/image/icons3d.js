// 3D icons: the group's specs, COMPOSED from the recipe rather than stored.
//
// Every copy-paste block on the page, the picker's live output and the master
// template are produced by icons3dRecipe.compose(), so a change to one clause in
// icons3dViews.js rewrites all of them at once.
import { RULES_TOKEN } from "../rules.js";
import { SPECS } from "./icons3d.data.js";
import {
  icons3dRecipe,
  ROUTES,
  VIEWS,
  COLOURS,
  GROUNDS,
  STYLES,
  COMPACT_LIMIT,
  FORM,
  SHADOWS,
  SET_CLAUSE,
  preserveFor,
} from "./icons3dViews.js";

const { Sources, ...system } = SPECS.find((s) => s.id === "pl-icons-3d-system");
const { compose } = icons3dRecipe;

// The reference pick: the flat icon selected in Figma, the 3D sample attached, front
// elevation, soft matte, the icon's own colours, white ground, one icon, compact.
const BASE = { style: "matte", source: "image", sample: "yes", route: "figma", view: "front", colour: "own", ground: "white", set: "single", what: "", length: "compact" };
const ladder = (items, dial, fixed = {}) =>
  Object.fromEntries(items.map((it) => [it.label, { pre: compose({ ...BASE, ...fixed, [dial]: it.key }) }]));

const routeSpec = {
  id: "pl-icons-3d-routes",
  group: "3D icons",
  eyebrow: "3D icons",
  title: "The three routes · one prompt per model",
  summary: `The base pick (front elevation, soft matte clay, the icon's own colours, white ground, the 3D sample attached) written for each place the prompt can go, compact register, each under ${COMPACT_LIMIT} characters. The only thing that changes between them is how the two images are named, which is the one thing the vendors document differently.`,
  ...ladder(ROUTES, "route"),
};

const viewSpec = {
  id: "pl-icons-3d-views",
  group: "3D icons",
  eyebrow: "3D icons",
  title: "The three cameras · front, raised three-quarter, isometric",
  summary:
    "The three fixed cameras the icon packs render (the 3dicons library kept Front, Dynamic and ISO as separate light sets), each at the base pick in the compact register. Front is the reference and the default; the other two are for a pack that wants to show its edges.",
  ...ladder(VIEWS, "view"),
};

const colourSpec = {
  id: "pl-icons-3d-colours",
  group: "3D icons",
  eyebrow: "3D icons",
  title: "Colour · the icon's own hue, or one named hue graded by light",
  summary:
    "Each colour at the base pick, compact register. 'The icon's own colours' is the default and is carried by the preserve clause; a named hue swaps the icon's colour for one hue and grades it the same way (sunk parts a shade darker, raised parts a tint lighter), so the ramp is made by light and never by a second colour. The violet is the reference, measured off the image.",
  ...ladder(COLOURS, "colour"),
};

const styleSpec = {
  id: "pl-icons-3d-styles",
  group: "3D icons",
  eyebrow: "3D icons",
  title: "Material · soft matte clay, or the glossy emoji finish",
  summary:
    "The two materials at the base pick, compact register, plus each in the full register, which is where the material clause carries its glosses (what subsurface softness looks like, why the highlight is broad). Soft matte is the reference. Glossy is the Fluent 3D emoji finish, kept as a named alternative because it is where the model drifts when 'matte' is not said.",
  ...Object.fromEntries(
    STYLES.filter((s) => !s.fullOnly).flatMap((s) => [
      [`${s.label} · compact`, { pre: compose({ ...BASE, style: s.key }) }],
      [`${s.label} · full`, { pre: compose({ ...BASE, style: s.key, length: "full" }) }],
    ])
  ),
};

const wireSpec = {
  id: "pl-icons-3d-wire",
  group: "3D icons",
  eyebrow: "3D icons",
  title: "Wire treatments · ball-and-stick, alone or over the matte body",
  summary:
    "Agam's second ask (2026-09-20): thin strokes, a very small shiny sphere at every vertex, sharp straight edges connecting them, in a contrasting colour. Two treatments, both full register only because they carry more system than the compact cap holds. Ball-and-stick wire replaces the body with a sparse skeleton (struts in the icon's hue, spheres in its complement). Wire over matte keeps the soft matte body and traces the skeleton over it, floating a hair above the surface, the whole skeleton in the complementary colour. Written out here at the reference violet and at the icon's own colours; the picker composes every other combination.",
  ...Object.fromEntries(
    STYLES.filter((s) => s.fullOnly).flatMap((s) =>
      COLOURS.filter((c) => c.key === "own" || c.key === "violet").map((c) => [
        `${s.label} · ${c.label}`,
        { pre: compose({ ...BASE, style: s.key, colour: c.key, length: "full" }) },
      ])
    )
  ),
};

const alphaSpec = {
  id: "pl-icons-3d-alpha",
  group: "3D icons",
  eyebrow: "3D icons",
  title: "Transparent ground · GPT Image 2 edits only",
  summary:
    "Real alpha exists on one route: the GPT Image 2 edits endpoint with background set to transparent and output_format png (in preview per OpenAI's reference). The prompt still has to say it, because a drawn checkerboard is not transparency, and it has to drop the ground shadow or the shadow is baked into the alpha. It is an API parameter, so the prompt is the full register; the API has no character cap. No other route gets the word 'transparent': Gemini documents no alpha and a model that cannot emit it paints the checkerboard instead.",
  "GPT Image 2 · transparent ground · full": {
    pre: compose({ ...BASE, route: "gpt", ground: "alpha", length: "full" }),
  },
  "The call beside it": {
    pre: [
      "POST /v1/images/edits",
      "model: gpt-image-2",
      "image[]: <the flat icon>   (Image 1)",
      "image[]: <the 3D sample>   (Image 2)",
      "background: transparent",
      "output_format: png",
      "prompt: <the prompt above>",
      "",
      "Do not send input_fidelity: on gpt-image-2 every image input is processed at high fidelity and the parameter is documented as not applying to this model.",
    ].join("\n"),
  },
};

// The master template: the constants with the dials left as bracketed slots.
const options = (items, get) => items.map(get).join(" | ");
const template = [
  "[OPENER]",
  "[VIEW].",
  FORM,
  "[MATERIAL]",
  "[LIGHT]",
  SHADOWS,
  "[COLOUR]",
  "[GROUND]",
  preserveFor({ sample: "yes", route: "figma" }, true),
  "[SET]",
  RULES_TOKEN,
].join(" ");

const templateBlock = {
  pre: [
    template,
    "",
    "[OPENER] by route, with the 3D sample attached:",
    `Figma, Edit with prompt (flat icon selected, sample attached): Re-render this flat icon of [ICON] as a soft matte 3D icon in the style of the attached reference image. An app-icon render, not a photograph of a real object.`,
    `Gemini (flat icon first, sample second): Take the flat icon of [ICON] from the first image and re-render it as a soft matte 3D icon in the style of the second image. An app-icon render, not a photograph of a real object.`,
    `GPT Image 2 edits (Image 1 the icon, Image 2 the sample): Image 1: the flat 2D icon of [ICON] to re-render. Image 2: style reference only. Apply Image 2's style to Image 1: render the icon from Image 1 as a soft matte 3D icon. An app-icon render, not a photograph of a real object.`,
    `Without a sample, any route: Using the provided image of [ICON], re-render it as a soft matte 3D icon: an app-icon render, not a photograph of a real object. (Then drop the sentence about the reference lending its material from the preserve clause.)`,
    `Without an image at all: [ICON], drawn as a flat icon and rendered as a soft matte 3D icon: an app-icon render, not a photograph of a real object. (Then replace the preserve clause with: A single focus, built from simple shapes: no scene, no props, no real-world detail such as paper pages or hinges, the metaphor readable at a glance.)`,
    "",
    `[VIEW] options: ${options(VIEWS, (v) => v.view)}`,
    "",
    `[MATERIAL] and [LIGHT] options: ${STYLES.filter((s) => !s.fullOnly).map((s) => `${s.label}: ${s.material} ${s.light}`).join("\n\n")}`,
    "",
    "The wire treatments replace the form clause and add a wire-colour clause; see the Wire treatments page below for them written out in full.",
    "",
    `[COLOUR] options: ${options(COLOURS, (c) => c.colour)}`,
    "",
    `[GROUND] options: ${options(GROUNDS, (g) => `${g.label}: ${g.ground}`)}`,
    "",
    `[SET] when the icon is one of a set, otherwise omit: ${SET_CLAUSE}`,
  ].join("\n"),
};

export const icons3dSpecs = [
  {
    ...system,
    "Pick a look": { builder: "icons-3d" },
    "Copy-paste template": templateBlock,
    "Converging on the look": icons3dRecipe.tokens,
    Sources,
  },
  routeSpec,
  viewSpec,
  styleSpec,
  wireSpec,
  colourSpec,
  alphaSpec,
];
