// Recipe for the "3D faces" prompt system: turn one photograph of a person into a
// floating, matte-clay, stylised 3D character head, and turn that head through a set
// of angles without losing the likeness.
//
// This is the FIRST group built on the shared recipe contract in ./recipe.js
// (defineRecipe). Airplane views predates the contract and still composes by hand;
// everything here routes through defineRecipe, so a new style is one entry in STYLES
// and a new angle is one entry in ANGLES, with no new branch at any call site.
//
// Four dials:
//   1. Subject    - the attached reference photograph (default), or a text description.
//   2. Angle      - front / three-quarter left / three-quarter right / profile /
//                   low hero / high tilt (see ANGLES). Shape only.
//   3. Expression - what the mouth and brow do (see EXPRESSIONS). Shape only.
//   4. Backdrop   - one flat muted colour field (see BACKDROPS). Look only.
//   5. Style      - pastel toy (the reference look), matte clay, soft vinyl, plaster
//                   bust, or grotesque oil paint (a painted caricature, not a sculpt).
// The angle `proj` and the expression `face` describe shape only, so they hold in any
// style; a style swaps the material and the light, and MAY override the shared
// subject / crop / accessories / render / ground clauses when it is not a 3D sculpt.
//
// Derived by reading four reference frames of one sculpted head: same character, four
// backdrops, four angles, accessories (a soft cap, gem-set eyewear) carried across.
import { defineRecipe } from "./recipe.js";
import { withRules } from "../rules.js";

// The one prohibition this group adds to the library's global rules. The reference
// heads FLOAT: no neck, no plinth, no bust base, and nothing cast onto the flat backdrop.
export const EXTRA_RULE =
  "No neck, plinth, stand, base or pedestal beneath the head, and no shadow cast onto the backdrop.";
export const EXTRA_RULE_COMPACT = "No neck, no stand, no cast shadow.";

// ---------- the constant: what makes every prompt in this group the same system ----------

// Subject and crop. Written to sit at the head of the prompt.
export const SUBJECT_PHOTO =
  "A product render of a collectible designer-toy head, a rotocast soft-vinyl (sofubi) figure photographed like a product shot: a solid manufactured object, NOT a photograph of a person, NOT photorealistic skin, NOT a digital avatar, made from the attached reference photograph of a person. Use the photo only for identity: carry over the brow line, the nose shape and width, the lip shape, the jaw and chin, the hairline and the set and size of the ears, plus the skin tone as a paint colour, so the person stays unmistakable. Copy nothing else from the photo: not its lighting, not its skin, not its hair strands, not its camera.";

export const SUBJECT_TEXT =
  "A product render of a collectible designer-toy head of [SUBJECT], a rotocast soft-vinyl (sofubi) figure photographed like a product shot: a solid manufactured object, NOT a photograph, NOT photorealistic skin, NOT a digital avatar.";

// The BASE FORM: one shared toy-head sculpt that every subject is mapped onto and every
// material is applied to, the way a Lego minifigure or a Funko has one head that only
// the printed face and the paint change. Style-independent, subject-independent. The
// identity clause above says WHO; this says the SHAPE they are cast into; a style says
// only what the surface is made of and how it is lit. Fixed proportions are stated as
// ratios so the same head comes back across a set, a material swap or a new person.
export const BASE_FORM =
  "Sculpt that identity onto one fixed toy-head base with these exact dimensions, the same for every character and every material, stated as fractions of total head height H (crown of the skull to the underside of the chin, hair excluded): the skull is a smooth ovoid 0.80 H wide at its widest, the widest point at 0.35 H below the crown; the cranium above the brow is 0.45 H tall and the face below the brow is 0.55 H; the eye line sits at exactly 0.50 H, each eye 0.16 H wide and 0.09 H tall, one full eye-width apart, in shallow smooth sockets under a single brow ridge at 0.42 H; the nose is a small soft button 0.14 H long from bridge to tip with its base at 0.68 H; the mouth is 0.22 H wide with the lip line at 0.80 H; the chin is small and softly squared, 0.30 H wide; the ears are simple rounded shells 0.18 H tall spanning from the eye line to the nose base, set at the full skull width; the cheeks are two broad smooth planes with no cheekbone edge; there is NO neck: the head ends cleanly at the underside of the jaw and chin, a closed smooth form with nothing below it. In frame the head is 0.70 of the image height, centred, camera at eye level at a distance that gives only mild perspective. No pores, wrinkles, stubble, veins or fine detail anywhere; every plane flows into the next like a moulded toy. Likeness lives only in the brow, nose, lip and jaw shapes and the skin tone carried onto this base; the dimensions above never change.";

// The crop is the signature of the set: the head alone, no neck, floating, nothing else.
export const CROP =
  "The head only, ending cleanly at the underside of the jaw and chin, with no neck, no shoulders, no collar and no body, floating weightless in the centre of the frame with generous headroom and even padding on both sides.";

// Accessories are carried from the photograph as their own materials, which is what
// stops the whole image collapsing into one uniform putty surface.
export const ACCESSORIES =
  "Any headwear, eyewear and jewellery in the reference are carried over and modelled as their own distinct materials, deliberately contrasted against the soft skin, and re-coloured into the pastel palette (a powder blue, a blush pink, a butter yellow, a mint, a lavender) rather than kept in their photographed colours: a plush, fuzzy, short-pile fleece or faux-fur for a winter hat, its fur reading as one soft velvety mass with a fine fluffy edge, not individual hairs; soft-woven fabric with visible crown seams and a stitched brim edge for a cap; faceted gem-set rims with thin polished metal temples and flat near-black lenses for eyewear; small hard metal studs for earrings. Between them, they are the only detailed, higher-frequency elements in the picture.";

// Render hygiene. Deliberately the OPPOSITE of the Specimen group, which wants grain.
export const RENDER =
  "A clean, high-resolution, production-quality 3D render, the finish of a feature-animation character turnaround or a collectible-figure product shot: flawless smooth even surfaces with perfect topology, subtle subsurface scattering in the thin parts, clear readable form shading, no film grain, no noise, no depth-of-field blur, no bloom, no lens distortion, no environment reflections, no visible polygon edges, no painterly or sketchy quality, no compression artefacts. Crisp focus throughout, the whole head sharp, accessories rendered in fine physically accurate detail.";

// The BASE FORM as an IMAGE. When a base skeleton render exists (Agam's fixed 3D head,
// 2026-08-15), the form stops being described in words and becomes Image 1 of a two-image
// edit; the words only assign roles. This follows the model vendor's own guidance for
// multi-image edits: reference every input by index and role, and restate on every
// generation what must not change (research/models.md, OpenAI cookbook; research/faces3d.md
// [11][12]). GPT Image 2 has no fidelity slider, so role language IS the fidelity control.
export const SUBJECT_BASE =
  "A single human head. Two input images. The first image is the BASE FORM: keep the exact head shape, skull proportions, facial feature placement, scale and camera angle of the first image, and preserve that geometry precisely, without enlarging, shrinking, tilting or redesigning any part of it. Take the likeness from the second image: its brow line, nose shape and width, lip shape, jaw and chin, any moustache or beard as a shape, its hairline, the set of its ears and its skin tone. The first image supplies FORM ONLY: it is not a photograph, and its grey surface, its material and its lighting must not appear in the result. The second image supplies IDENTITY ONLY: its photographic skin texture, its lighting, its background and its camera must not appear either. Everything below is the material, finish and light to render that form in.";

export const SUBJECT_BASE_SHORT =
  "A single human head. First image = BASE FORM: keep its exact head shape, proportions, feature placement, scale and camera angle. Second image = IDENTITY: take its brow, nose, lips, jaw, hairline, ears, skin tone. The first supplies form only, its grey material and lighting must not appear; the second supplies identity only, its photographic skin and lighting must not appear.";

// Alternate phrasing of the same two-image role assignment, WITHOUT ordinal "first
// image / second image" labels. research/base-mesh-restyling.md flags the ordinal
// convention as documented for Gemini's typed reference slots but UNVERIFIED
// folklore on GPT Image 2, whose own docs never index images individually and
// instead describe the desired composite. This is the A/B partner to SUBJECT_BASE:
// same preserve/negate content, described rather than indexed, to test whether
// likeness holds better on GPT Image 2 when the model is not asked to track which
// numbered slot is which.
export const SUBJECT_BASE_ALT =
  "A single human head, composed from two attached reference images: a form reference, a plain grey clay head that fixes the exact head shape, skull proportions, facial feature placement, scale and camera angle, and a likeness reference, a photograph of a person. Keep the grey clay head's geometry precisely, without enlarging, shrinking, tilting or redesigning any part of it, and take the likeness from the photograph: its brow line, nose shape and width, lip shape, jaw and chin, any moustache or beard as a shape, its hairline, the set of its ears and its skin tone. Preserve the clay head's form only: it is not a photograph, and its grey surface, its material and its lighting must not appear in the result. Preserve the photograph's identity only: its photographic skin texture, its lighting, its background and its camera must not appear either. Everything below is the material, finish and light to render that form in.";

export const SUBJECT_BASE_ALT_SHORT =
  "A single human head from two references: a grey clay head fixing the exact shape, proportions, feature placement, scale and angle, and a photograph supplying likeness only (brow, nose, lips, jaw, hairline, ears, skin tone). Keep the clay head's geometry exactly; its grey material and lighting must not appear. Keep the photo's identity only; its skin texture and lighting must not appear.";

// ---------- the slate: the empty base form, generated once ----------
// The identity-free base head every character is built on. Per research/base-mesh-restyling.md
// the base render must be a flat-lit, shadowless, untextured mid-grey clay render on white, with
// one camera orbited per angle: NOT a matcap and NOT an ambient-occlusion pass, since both bake a
// lighting model into the one thing that has to stay material-free. It is bald and expressionless
// on purpose; hair and identity arrive at the next hop and are locked into the depth plate there.
// This is the ONLY place the dimensional base form has to be stated, because from here on the
// geometry travels as an image rather than as prose.
export const SLATE_PARTS = [
  "A neutral head form: a sculptor's mannequin head, a generic human head with no identity, no likeness, no character and no expression, perfectly symmetrical about its centreline, completely bald with no hair, no eyebrows, no eyelashes and no facial hair.",
  "Its dimensions are exactly these, stated as fractions of total head height H (crown of the skull to the underside of the chin): the skull is a smooth ovoid 0.80 H wide at its widest, the widest point at 0.35 H below the crown; the cranium above the brow is 0.45 H tall and the face below the brow is 0.55 H; the eye line sits at exactly 0.50 H, each eye 0.16 H wide and 0.09 H tall, one full eye-width apart, in shallow smooth sockets under a single brow ridge at 0.42 H; the nose is a small soft button 0.14 H long from bridge to tip with its base at 0.68 H; the mouth is 0.22 H wide with the lip line at 0.80 H; the chin is small and softly squared, 0.30 H wide; the ears are simple rounded shells 0.18 H tall spanning from the eye line to the nose base, set at the full skull width; the cheeks are two broad smooth planes with no cheekbone edge; there is NO neck: the head ends cleanly at the underside of the jaw and chin, a closed smooth form with nothing below it. In frame the head is 0.70 of the image height, centred, camera at eye level at a distance that gives only mild perspective.",
  "The eyes are simple smooth sculpted almond forms with closed-looking lids, blank and irisless: no pupils, no iris colour, no glassiness, sculpted rather than rendered.",
  "The entire form is one uniform matte mid-grey modelling clay: a single flat neutral grey with no colour variation anywhere, completely untextured, with no pores, no wrinkles, no veins, no surface markings and no paint.",
  "Lit by completely flat, even, frontal, shadowless illumination: no cast shadow, no rim light, no coloured light and no strong specular highlight anywhere, only the faintest tonal falloff needed to read the forms.",
  "The background is pure white: one solid unbroken field with no gradient, no texture, no floor, no horizon line and no props.",
  "A clean, sharp, high-resolution render, crisp focus throughout, with no film grain, no noise, no blur, no depth of field, no bloom and no vignette.",
];

// One camera orbited per angle: the angle clause is spliced in after the dimensions, so every
// slate in the set is the same head seen from a different side rather than a different head.
export function slateFor(angleKey = "front") {
  const a = ANGLES.find((x) => x.key === angleKey) || ANGLES[0];
  const parts = SLATE_PARTS.slice();
  parts.splice(2, 0, `${a.proj}.`);
  return withRules(parts.join(" "), SLATE_EXTRA_RULE);
}

export const SLATE_EXTRA_RULE =
  "No neck, plinth, stand or base beneath the head, and no shadow cast onto the backdrop.";

// ---------- compact register: the same system under a character budget ----------
// Figma's image generation has a prompt field with an observed character ceiling.
// UNSOURCED: no Figma document states a limit, and the "1,000 characters" figure that
// circulates traces back to Adobe Firefly, not Figma. Both candidate models have far
// more headroom (32,000 characters on GPT image; a 131,072-token context on Nano
// Banana 2), so any real cap is Figma's client. Treat 1000 as a defensive working
// number and re-measure by pasting a known-length string into the field. See
// research/models.md. The full register runs to roughly 4,000 characters.
// COMPACT_LIMIT is the budget the compact clauses are written to fit, rules included;
// change it here and
// the picker's counter follows. GPT Image 2 follows dense prose faithfully and only
// lightly rewrites, so the compact register front-loads the non-negotiables (likeness,
// material, crop, pastel palette) and drops the explanatory sub-clauses, not the rules.
export const COMPACT_LIMIT = 1000;

export const SUBJECT_PHOTO_SHORT =
  "Rotocast soft-vinyl designer-toy head, not a photo, of the person in the attached photo (identity only), cast onto";
export const SUBJECT_TEXT_SHORT =
  "Rotocast soft-vinyl designer-toy head of [SUBJECT], not a photo, cast onto";
export const BASE_FORM_SHORT =
  "one fixed toy-head base, dimensions in head heights H: ovoid skull 0.80H wide; eye line at 0.50H, eyes 0.16H wide, an eye-width apart; button nose 0.14H long, base at 0.68H; mouth 0.22H wide at 0.80H; round ears 0.18H tall; no neck, the head ends at the jaw; head 0.70 of frame height; dimensions never change.";
export const CROP_SHORT =
  "Head only, no neck, floating.";
export const ACCESSORIES_SHORT =
  "Accessories kept, re-coloured pastel, the only sharp detail.";
export const RENDER_SHORT =
  "Clean production render, flawless surfaces.";

// ---------- angles: shape only, so they hold in any style ----------
export const ANGLES = [
  {
    key: "front",
    label: "Front",
    projShort: "Front view, dead-on at eye level, head upright",
    proj:
      "Seen dead-on from the front at eye level, the head perfectly upright and symmetrical about its centreline, both ears equally visible, the camera lens level with the eyes",
  },
  {
    key: "three-quarter-left",
    label: "Three-quarter left",
    projShort: "Three-quarter view, head turned 35 degrees left",
    proj:
      "Seen from a three-quarter angle with the head turned about 35 degrees to its own left, the far cheek and the far eye partly foreshortened, the near ear fully visible and the far ear just clearing the cheek, the camera level with the eyes",
  },
  {
    key: "three-quarter-right",
    label: "Three-quarter right",
    projShort: "Three-quarter view, head turned 35 degrees right",
    proj:
      "Seen from a three-quarter angle with the head turned about 35 degrees to its own right, the far cheek and the far eye partly foreshortened, the near ear fully visible and the far ear just clearing the cheek, the camera level with the eyes",
  },
  {
    key: "profile",
    label: "Profile",
    projShort: "Strict side profile at eye level",
    proj:
      "Seen in strict profile from the side at eye level, the full silhouette of the brow, nose, lips and chin reading as one clean contour against the backdrop, one ear centred in the frame, the far side of the face fully hidden",
  },
  {
    key: "low-hero",
    label: "Low hero",
    projShort: "From slightly below looking up, calm hero angle",
    proj:
      "Seen from slightly below, the camera a little under the chin looking gently up, the jaw and the underside of the chin reading as the nearest forms, the crown of the head foreshortened, a calm, monumental hero angle with only mild perspective",
  },
  {
    key: "high-tilt",
    label: "High tilt",
    projShort: "From slightly above, head tipped forward",
    proj:
      "Seen from slightly above with the head tipped a little forward and down, the crown and forehead reading as the nearest forms, the eyes lifted toward the camera under the brow, an intimate, slightly wistful angle with only mild perspective",
  },
];

// ---------- expressions: mouth and brow, so they survive the dark lenses ----------
export const EXPRESSIONS = [
  {
    key: "neutral",
    label: "Neutral",
    faceShort: "Neutral, lips relaxed, gaze ahead",
    face:
      "Expression calm and neutral: lips together and relaxed with no smile, the brow level, the gaze steady and straight ahead",
  },
  {
    key: "side-glance",
    label: "Side glance",
    faceShort: "Sidelong glance, eyes swung aside, flat pout",
    face:
      "Expression a sidelong glance: the head stays where it is but both eyes swing hard to one side, the irises pushed to the corners of the almond-shaped lids, the brow level or a touch lowered, the lips together and set in a small flat pout, cool and unimpressed, quietly checking something out of frame",
  },
  {
    key: "slight-smile",
    label: "Slight smile",
    faceShort: "Slight closed-lip smile, corners barely lifted",
    face:
      "Expression a slight closed-lip smile: the corners of the mouth lifted just a little and held, the cheeks barely rounding, the brow level, quietly pleased rather than cheerful",
  },
  {
    key: "warm-smile",
    label: "Warm smile",
    faceShort: "Warm asymmetric smile, a sliver of teeth",
    face:
      "Expression a warm asymmetric smile: one corner of the mouth lifted higher than the other, the lips parted just enough to show a sliver of the front teeth, one cheek rounding, the eyes softening with it",
  },
  {
    key: "brow-raise",
    label: "Brow raise",
    faceShort: "One eyebrow raised, mouth flat with a wry corner",
    face:
      "Expression a single raised brow: one eyebrow lifted and the other level, the mouth closed and flat with the faintest wry tension at one corner, amused and sceptical",
  },
  {
    key: "eyes-closed",
    label: "Eyes closed",
    faceShort: "Serene, eyes closed, lips relaxed",
    face:
      "Expression serene with the eyes closed: the lids smooth and shut in soft curves, the lashes reading as a fine line, the lips together and relaxed, the brow untroubled, listening rather than sleeping",
  },
  {
    key: "surprise",
    label: "Surprise",
    faceShort: "Surprise, brows high, eyes wide, lips a soft O",
    face:
      "Expression open surprise: both brows lifted high, the eyes wide, the lips parted into a soft rounded O, the jaw dropped a little, caught mid-delight",
  },
];

// ---------- backdrops: one flat pastel field, no gradient, no floor, no horizon ----------
// Cream sampled off the reference frame (a floating head under a powder-blue fur hat);
// the rest are the same pale, chalky, low-saturation register.
export const BACKDROPS = [
  { key: "cream", label: "Cream", color: "#F0EBD8", desc: "a pale warm cream" },
  { key: "powder", label: "Powder blue", color: "#C9D8EA", desc: "a powder blue" },
  { key: "blush", label: "Blush", color: "#F1D3CF", desc: "a pale blush pink" },
  { key: "mint", label: "Mint", color: "#CFE3D6", desc: "a chalky pale mint" },
  { key: "butter", label: "Butter", color: "#F3E6B8", desc: "a soft butter" },
  { key: "lavender", label: "Lavender", color: "#DDD5EC", desc: "a pale lavender" },
];

const groundFor = (b) =>
  `The background is one single flat field of ${b.desc} (${b.color}): a solid unbroken colour with no gradient, no texture, no floor, no horizon line, no wall, no props and no environment, only the faintest darkening toward the corners of the frame.`;

const groundShortFor = (b) =>
  `Flat background, ${b.desc} (${b.color}).`;

// ---------- styles: material and light only ----------
export const STYLES = [
  {
    key: "pastel",
    label: "Pastel toy",
    blurb: "The reference look: soft-satin toy skin, plush pastel accessories, cream-light studio.",
    materialShort:
      "Rotocast vinyl, satin 30% sheen, clean terminator; skin as paint, no pores; hair one moulded shell, no strands; dome eyes, pad-printed catchlight.",
    lightShort:
      "Soft key upper front-left, visible terminator, pale fill, thin rim light on the silhouette.",
    material:
      "The whole head is one hollow rotocast soft-vinyl shell with a satin finish, roughly 30 percent sheen: one broad soft specular highlight rolling across the forehead, the bridge of the nose and the cheek, a clean readable terminator where each form turns from light to shadow, and a faint warm subsurface glow only in the thin geometry of the ears and the nose. No pores, no skin texture, no wrinkles, no stubble: the surface is uniform vinyl in the person's skin tone applied as paint. The manufactured tells are present and subtle: a faint mould parting line running down the side of the head and behind each ear, cleanly trimmed, and colour laid on through spray masks so every colour region (skin, hair, brows, lips) meets its neighbour at a crisp hard edge with no soft airbrushed blend. Hair is one moulded shell of hard glossy clumps, sculpted in a few large swept forms with a defined edge against the forehead, no individual strands. Eyebrows are two raised painted ridges. Eyes are large inset glossy domes: bright whites, a flat painted iris disc, and a single small perfectly clean pad-printed catchlight identical in both eyes, the only wet-looking thing on the head. Lips are the same satin vinyl in a deeper painted tone. Everything the head wears is re-coloured pastel: powder blue, blush, butter, mint or lavender, soft and chalky, never saturated.",
    light:
      "Studio product lighting that reads the object as solid: one large soft key from the upper front-left laying a smooth gradient across the face with a soft but visible terminator on the shadow side, a weaker fill from the right so the shadow side stays pale rather than dark, and one thin continuous rim light tracing the entire silhouette of the head and hair so the object separates cleanly from the backdrop. Soft contact occlusion under the brow, the nose, the lower lip, inside the ears and along the underside of the jaw. No hard cast shadows, no coloured light, no bloom. Overall bright, airy and pastel-sweet, but unmistakably a lit three-dimensional object, not a flat illustration.",
  },
  {
    key: "clay",
    label: "Matte clay",
    blurb: "Fully matte modelling clay, no sheen at all, almost shadowless light.",
    materialShort:
      "Dead matte clay, under 10% sheen, no specular at all, faint warm subsurface; hair one mass; glossy eyes.",
    lightShort:
      "One huge soft key, almost shadowless.",
    material:
      "Every surface of the head is soft matte modelling clay: completely non-reflective, no pores, no fine skin texture, no wrinkles, no stubble and no specular highlight anywhere on the skin, only broad smooth tonal falloff across the forms with a faint warm subsurface glow just under the surface. Hair is a single smooth carved mass with no individual strands, its edge meeting the forehead as one clean sculpted line; eyebrows are two smooth raised ridges. Eyes are simple glossy spheres, the only wet-looking thing on the face. Lips are the same matte clay in a slightly deeper tone.",
    light:
      "Lit by one very large soft frontal key placed a little above the head, almost shadowless: no hard edge anywhere, no rim light, no kicker, no coloured light. Shadow appears only as gentle contact occlusion in the places it must, under the brow, under the nose, under the lower lip, inside the ears and along the underside of the jaw.",
  },
  {
    key: "vinyl",
    label: "Soft vinyl",
    blurb: "Collectible-figure register: sealed satin vinyl with one soft sheen.",
    materialShort:
      "Rotocast hollow vinyl, satin sheen, faint mould parting line behind the ear, hard spray-mask paint edges.",
    lightShort:
      "Large soft key upper front, weak side fill, no hard shadow.",
    material:
      "Every surface of the head is moulded soft vinyl, like a premium collectible designer figure: a sealed satin finish with one broad soft sheen rolling across the forehead, the cheekbones and the bridge of the nose, and a faint hint of the mould seam behind each ear. No pores and no skin texture. Hair is a single smooth moulded mass with no strands. Eyes are glossy inset spheres, wetter and darker than the surrounding vinyl. The whole head reads as one solid painted object rather than as flesh.",
    light:
      "Lit by a large soft key from the upper front with a second much weaker fill to the side, enough to lay a gentle gradient down one cheek. Soft occlusion under the brow, nose, lip and jaw. No hard shadow, no rim light, no coloured light.",
  },
  {
    key: "plaster",
    label: "Plaster bust",
    blurb: "Unpainted monochrome sculpt: one tone, form carries everything.",
    materialShort:
      "Whole head and accessories one unpainted chalky plaster, dead matte under 10% sheen; eyes sculpted, not glossy.",
    lightShort:
      "Large soft key from upper front plus ambient fill.",
    material:
      "The entire head, hair, brows and accessories included, is one single unpainted material: fine chalky white plaster with a matte tooth, all colour removed, so form and light carry the whole image. No skin tone, no eye colour, no lens tint, no material contrast between the face and what it wears, only a barely deeper tone where a surface turns away. Eyes are sculpted lids and irises in the same plaster, not glossy. Surfaces stay smooth with a very faint powdery grain, no chips and no cracks.",
    light:
      "Lit by one large soft key from the upper front and a soft ambient fill, the way a museum lights a study cast: broad, clean, almost shadowless, with just enough gentle occlusion under the brow, nose, lip and jaw to read every plane. No rim light, no hard shadow, no coloured light.",
  },
  {
    // The odd one out: a PAINTED caricature, not a 3D sculpt. Derived 2026-08-15 from
    // three digital-oil references (a scowling shaved head on cobalt with "WE" scrawled
    // on the forehead; a red-bobbed woman with smeared lipstick on white; a boy in
    // gold aviators and braces on pale grey). It overrides the group's subject, crop,
    // accessories and render clauses because those insist on smooth CGI; angle,
    // expression and backdrop still come from the shared dials.
    key: "grotesque",
    label: "Grotesque oil paint",
    // 2026-08-15 (Agam): ONE measured form for every style, so the caricature no longer
    // opts out of the base form; its exaggeration lives in the paint (colour, stroke,
    // deviation in feature shape), never in the head's dimensions.
    // Under the base-image mode the caricature keeps Image 1's volume too: the
    // exaggeration lives in the paint (colour, stroke, deviation in the features), not
    // in the head's proportions, so the whole set shares one form.
    subjectBase:
      "Two input images. Image 1 is the BASE FORM: a fixed 3D head skeleton, the exact form and volume every character in this set is built on. Keep its head shape, proportions, volumes, eye line, feature placement, camera distance and framing exactly. Image 2 is the IDENTITY reference photograph: take from it the brow, nose, lips, moustache or beard, hairline, ears and skin tone, and find the two or three features where this face most deviates from an average and push those in the PAINT, not in the volume. The result is a painted caricature portrait of Image 2's person on Image 1's form: a digital oil painting, NOT a photograph, NOT a 3D render, NOT smooth or cute.",
    subjectBaseShort:
      "Image 1 = BASE FORM, fixed 3D head skeleton: keep its shape, volume, proportions and framing exactly. Image 2 = IDENTITY photo: exaggerate its most deviant features in the PAINT, not the volume. Painted caricature of Image 2's person on Image 1's form, digital oil, not a photo, not 3D, not cute.",
    // Non-ordinal A/B partner, same content as subjectBase without "Image 1 / Image 2" indexing.
    subjectBaseAlt:
      "Two attached reference images: a base-form reference, a fixed 3D head skeleton that is the exact form and volume every character in this set is built on, and an identity reference, a photograph of a person. Keep the base-form reference's head shape, proportions, volumes, eye line, feature placement, camera distance and framing exactly. Take from the identity photograph its brow, nose, lips, moustache or beard, hairline, ears and skin tone, and find the two or three features where this face most deviates from an average and push those in the PAINT, not in the volume. The result is a painted caricature portrait of the photographed person on the base-form reference's shape: a digital oil painting, NOT a photograph, NOT a 3D render, NOT smooth or cute.",
    subjectBaseAltShort:
      "Two references: a base-form skeleton fixing shape, volume, proportions and framing exactly, and an identity photo to exaggerate in the PAINT only (its most deviant features, not the volume). Painted caricature of the photographed person on the base-form's shape, digital oil, not a photo, not 3D, not cute.",
    blurb:
      "Digital oil caricature: ugly-beautiful, chunky knife strokes, scribbled ink over paint, hot pinks on nose and cheeks.",
    subjectPhoto:
      "A painted caricature portrait, a digital oil painting in the manner of a modern editorial caricaturist, NOT a photograph, NOT a 3D render and NOT smooth or cute, made from the attached reference photograph of a person. Use the photo for identity, carrying over the brow, the nose, the lips, the jaw, the hairline, the ears and the skin tone, and find the two or three features where this face most deviates from an average and push those in the PAINT, in colour, stroke and drawn shape, deadpan and unflattering, still unmistakably this person; the head's dimensions themselves come from the base below and are never distorted.",
    subjectText:
      "A painted caricature portrait of [SUBJECT], a digital oil painting in the manner of a modern editorial caricaturist, NOT a photograph, NOT a 3D render and NOT cute. Push the two or three most deviant features in the PAINT, in colour, stroke and drawn shape, deadpan and unflattering; the head's dimensions come from the base below and are never distorted.",
    crop:
      "The head only, ending at the underside of the jaw and chin with no neck and no shoulders, floating on the brushed ground, the head filling most of the height, seen straight on and close.",
    accessories:
      "Anything the person wears on the head or face is kept in its real colours and painted with the same broken strokes: gold-rimmed aviator glasses as a few confident metallic strokes with the lenses left mostly clear so the eyes read through, chunky earrings and studs as thick single dabs of saturated colour, hair as a fast scratchy mass of dry-brush strokes and scribbled pen lines rather than a smooth shape.",
    render:
      "The finish is a digital oil painting at full resolution: visible chunky palette-knife and flat-brush strokes that follow the planes of the face, hard-edged patches of colour laid side by side rather than blended, colour breaking through where strokes do not meet, thin scribbled ink line and hatching over the paint for stubble, wrinkles, lashes and hair, edges left rough and unfinished, a few drips and smears allowed. No smooth airbrushed blending, no photographic detail, no 3D CGI look, no soft focus, no film grain, no bloom.",
    subjectPhotoShort:
      "Painted caricature, digital oil, not a photo, not 3D, not cute, of the person in the attached photo, exaggeration in the PAINT only, cast onto",
    subjectTextShort:
      "Painted caricature of [SUBJECT], digital oil, not a photo, not 3D, not cute, deviance pushed in the PAINT not the dimensions, cast onto",
    cropShort: "",
    accessoriesShort:
      "Glasses, earrings in real colours; hair scratchy dry-brush.",
    renderShort:
      "Chunky knife strokes, unblended patches, ink hatching, no CGI.",
    materialShort:
      "Alla prima impasto skin, knife-thick slabs casting their own shadow, hot pink on nose, cheeks, lips, ochre shadows, wet eyes.",
    lightShort:
      "One hard top light, flat shadow patches, high contrast.",
    material:
      "The skin is oil paint, not flesh: laid down in broken slabs of colour that follow the bone, with heavy saturated hot pinks and reds pushed onto the nose, the cheeks, the ears and the lips, ochre and mauve in the shadow planes, cold grey-green and violet in the half-tones, and paler chalky strokes across the forehead and the bridge of the nose. Stubble and brows are scribbled hatching in a dry darker line, lashes and lip lines are a few thick strokes. Eyes are the only wet-looking thing, small and dark with a single hard highlight. Teeth are painted flat, slightly yellowed, one or two strokes each. Nothing is smoothed.",
    light:
      "Lit by one hard directional light from above and slightly to one side, so the planes of the face split cleanly into lit and shadow patches painted as flat areas of colour with hard edges between them, strong overall contrast, deep colour in the shadows rather than grey. No soft falloff, no rim light, no bloom, no coloured gel; the light is there to carve the planes for the brush.",
    ground:
      (b) =>
        `The background is one flat brushed field of ${b.desc} (${b.color}): a single colour laid in with broad flat strokes, faint brush texture allowed, no gradient, no floor, no horizon, no props, the head cut out against it.`,
    groundShort:
      (b) => `Flat brushed background, ${b.desc} (${b.color}).`,
  },
];

// ---------- the recipe ----------
export const faces3dRecipe = defineRecipe({
  key: "faces-3d",
  label: "3D faces",
  dials: {
    subject: ["base", "base-alt", "photo", "text"],
    angle: ANGLES,
    expression: EXPRESSIONS,
    backdrop: BACKDROPS,
    length: ["full", "compact"],
  },
  extraRule: EXTRA_RULE,
  extraRuleCompact: EXTRA_RULE_COMPACT,
  styles: STYLES.map((s) => ({
    key: s.key,
    label: s.label,
    blurb: s.blurb,
    parts: ({ angle, expression, backdrop, subject, length } = {}) => {
      const a = ANGLES.find((x) => x.key === angle) || ANGLES[0];
      const e = EXPRESSIONS.find((x) => x.key === expression) || EXPRESSIONS[0];
      const b = BACKDROPS.find((x) => x.key === backdrop) || BACKDROPS[0];
      // A style may override the shared clauses (subject, crop, accessories, render,
      // ground) when it is not a 3D sculpt at all, e.g. Grotesque oil paint.
      if (length === "compact") {
        // Front-loaded for GPT Image 2: likeness, material, angle, expression, crop,
        // accessories, light, ground, render. Same order as full, every clause terse.
        // With the base form supplied as Image 1, the written base-form clause is
        // redundant and is dropped; the role clause carries the constraint instead.
        const isBaseMode = subject === "base" || subject === "base-alt";
        return [
          subject === "base"
            ? s.subjectBaseShort || SUBJECT_BASE_SHORT
            : subject === "base-alt"
              ? s.subjectBaseAltShort || SUBJECT_BASE_ALT_SHORT
              : subject === "text"
                ? s.subjectTextShort || SUBJECT_TEXT_SHORT
                : s.subjectPhotoShort || SUBJECT_PHOTO_SHORT,
          isBaseMode ? "" : s.baseFormShort === undefined ? BASE_FORM_SHORT : s.baseFormShort,
          s.materialShort,
          `${a.projShort}.`,
          `${e.faceShort}.`,
          // The dimensional base carries the crop (no neck, head 0.70 of frame);
          // the base-form reference image carries it in base mode. Compact never
          // spends characters on it.
          s.cropShort === undefined ? "" : isBaseMode ? "" : s.cropShort,
          s.accessoriesShort || ACCESSORIES_SHORT,
          s.lightShort,
          (s.groundShort || groundShortFor)(b),
          s.renderShort || RENDER_SHORT,
        ];
      }
      const isBaseMode = subject === "base" || subject === "base-alt";
      return [
        subject === "base"
          ? s.subjectBase || SUBJECT_BASE
          : subject === "base-alt"
            ? s.subjectBaseAlt || SUBJECT_BASE_ALT
            : subject === "text"
              ? s.subjectText || SUBJECT_TEXT
              : s.subjectPhoto || SUBJECT_PHOTO,
        isBaseMode ? "" : s.baseForm === undefined ? BASE_FORM : s.baseForm,
        `${a.proj}.`,
        `${e.face}.`,
        isBaseMode ? "" : s.crop || CROP,
        s.material,
        s.accessories || ACCESSORIES,
        s.light,
        (s.ground || groundFor)(b),
        s.render || RENDER,
      ];
    },
  })),
  tokens: [
    "Base form: how far the fixed toy head dominates the photo, from a near-literal sculpt to the full ovoid-cranium base (default: the base wins, likeness rides on it)",
    "Skin: soft-satin pastel toy (default) vs fully matte clay vs satin vinyl vs unpainted plaster",
    "Palette: how chalky and pale the pastels run on the accessories and the backdrop, from near-white to a clear pastel",
    "Fur: how fluffy a plush hat reads, from a smooth velvet mass to a visibly fuzzy edge",
    "Sheen: whether any specular highlight is allowed on the skin at all",
    "Occlusion: how deep the soft shadow sits under the brow, nose, lip and jaw",
    "Hair: one carved mass (default) vs a few sculpted planes vs visible strands",
    "Lenses: flat near-black vs dark but translucent enough to show the eyes behind",
    "Backdrop: which flat colour, and how strong the corner vignette reads",
    "Crop: how much headroom and side padding sits around the floating head",
  ],
});

export const { compose, styleMeta: STYLE_META } = faces3dRecipe;
