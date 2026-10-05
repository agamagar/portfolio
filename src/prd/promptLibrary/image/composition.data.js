// Image-generation prompts: Composition prompts.
// { pre } blocks carrying rules:true get the library rules appended at assembly.
// Part of the prompt library (src/prd/promptLibrary). See index.js for the map.

export const SPECS = [
  {
    "id": "pl-zepto-fmcg-composition-system",
    "group": "Composition prompts",
    "eyebrow": "Zepto",
    "title": "Zepto FMCG · composition system",
    "summary": "A toggle-built recipe for staging a Zepto FMCG product shot: pick a camera angle, a colour theme, a shadow type, an object count and a surface/material, then drop in one transparent product PNG. The whole scene is generated from the prompt. Built for Nano Banana 2 in Figma.",
    "What this is": [
      "A parametric prompt system for premium FMCG product photography scenes.",
      "Takes one image: a transparent-background PNG cutout of the product. Everything else, background, surface, lighting and any props, is generated from the prompt, not a second image.",
      "Build the scene light to match the light ALREADY on the supplied cutout, never the other way round: read its key direction, its colour temperature and its shadow softness first, then light the set to agree with them. Mismatched light direction, discordant colour temperature, an edge halo and a neutral-grey contact shadow are the four things that make a composite read as fake.",
      "Five independent toggles, camera angle, colour theme, shadow type, object count and surface/material, plug into one shared template, so any combination renders consistently.",
      "The surface/material toggle was added after QA against real Zepto SKUs: it builds the surface and environment to suit each pack, e.g. a reflective surface under a glossy can, a matte surface under a carton, so the reflection lives in the scene and the product itself is never altered.",
      "The shared template uses the product PNG exactly, with zero alterations to its pixels; every logo, label and line of text stays identical, and all variation comes from the generated scene, so the packaging is never redrawn or garbled.",
      "Colour themes are the two seeded here (Old Money, Poppy). More can be added the same way, as their own list entry."
    ],
    "Camera angles": [
      "hero-45: Three-quarter hero angle, camera 45 degrees above and to the side, looking slightly down. The classic premium product-shot angle.",
      "eye-level: Straight-on eye-level, camera at the product's midpoint height, no tilt.",
      "top-down: Flat lay, camera directly overhead, looking straight down.",
      "low-angle: Low hero angle, camera slightly below the product looking up, makes it feel monumental.",
      "three-quarter-side: Camera at product height, rotated about 30 degrees to reveal side and front faces.",
      "macro-detail: Tight close-up, the whole product shown large and filling most of the frame, still complete and uncropped."
    ],
    "Color themes": [
      "old-money: Muted warm neutrals, deep forest green, chestnut brown, cream and ivory, brushed brass accents, linen and wood textures, soft diffused daylight. Nothing saturated or loud.",
      "poppy: High-saturation, punchy complementary colors, a bold single-color backdrop, playful and energetic, crisp contrast, graphic and modern."
    ],
    "Shadow types": [
      "soft: A large diffused source close above and slightly to one side, soft-edged cast shadow falling away from it, plus a tight dark contact shadow where the pack meets the surface. Softness comes from a big source held close, not from blur.",
      "hard: A single small undiffused source placed far from the set, crisp-edged cast shadow with a defined core and high contrast. Distance is what hardens the edge, which is why the sun is the reference.",
      "long-dramatic: A hard source raking in low from the side, throwing a long cast shadow across the frame, editorial and moody. Optionally shaped by a gobo (a cucoloris, the palm-frond cutter) for a patterned shadow.",
      "none-floating: The product suspended just above the surface with no support visible, and a detached soft shadow pooled directly beneath it. The float only reads if that shadow is still there, and if the camera sits at or below product height.",
      "color-gel: Soft shadow carrying the colour of the scene's ambient light rather than neutral grey or black, tinted toward the backdrop accent. Grey shadow is the instant giveaway of a composite, so every shadow type here is tinted.",
      "reflection: No cast shadow. On a gloss ground the surface returns a mirror image of the pack with falloff, not a matte shadow, because gloss shows a picture of the light source rather than absorbing it."
    ],
    "Number of objects": [
      "single: Only the hero product as the subject, no extra objects or props, with the generated scene and background around it.",
      "hero-plus-props: Hero product plus one or two generated supporting props or ingredients framing it, product still dominant.",
      "grouped-skus: Two to three identical, unaltered copies of the same product PNG, arranged as a family shot.",
      "scattered-ambient: Hero product surrounded by loosely scattered generated ambient elements (ingredients, droplets, petals) suggesting context without competing."
    ],
    "Surface / material": [
      "matte-paper: Matte paper or board packaging (carton, box, tub, paper bag). Scene lit softly and evenly so the pack stays non-reflective and its print reads flat, no glossy highlights added. Use for cartons, cookie boxes, ice-cream tubs.",
      "glossy-metal: Glossy metal can or tin. Scene lighting suited to a reflective metal pack, keeping its existing highlights and reflections exactly as in the PNG. Use for cans and metallic tins.",
      "glass-transparent: Transparent glass bottle. The generated background shows through the clear areas of the PNG, glass, liquid, cap and label kept exactly as provided. Use for glass bottles.",
      "foil-flexible: Glossy flexible foil pouch or bag. Soft even scene lighting that suits a crinkled foil pack, keeping its existing crinkle highlights exactly as in the PNG. Use for chip and snack bags."
    ],
    "How a prompt is assembled": [
      "Attach the transparent product PNG as the only image.",
      "Format anchor: build a full premium scene around the product PNG, generating the background, surface and lighting from text alone.",
      "Then the five toggles: camera angle, color theme, shadow type, object count, surface/material.",
      "Then the shared no-alteration rule (use the product's exact pixels, only position and scale it; build the scene light to match the product), the output rules, plus the house no-added-text, no-added-branding rule.",
      "Only the five toggle lines change between variants, everything else is constant."
    ],
    "Pick a combination": {
      "builder": "zepto-fmcg-composition"
    },
    "Sources": [
      "Retuned 2026-08-15 against research/composition.md: each shadow option now states its physical cause rather than an adjective (source size, diffusion and distance), gobo and cucoloris are the trade names for the shaped shadow, gloss grounds return a mirror image rather than a matte shadow, and shadows carry the scene's ambient colour because neutral grey is the documented giveaway of a composite. The workflow inversion matters most: light the generated set to agree with the light already on the supplied cutout, not the reverse.",
      "Seeded from this session's chat-only compositing prompt, generalised into a toggle system.",
      "Style tuned for Nano Banana 2 in Figma."
    ]
  }
];
