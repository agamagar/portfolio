// Recipe for the "Zepto catalogue" prompt system: every category and subcategory
// Zepto actually sells, written so the SUBJECT survives a change of style.
//
// The point of this group is the split. A catalogue entry says what the thing IS
// (form, material, finish, scale, the one or two props that read as its aisle) and
// says nothing about how it is lit, coloured or rendered. A style says how anything
// is lit, coloured and rendered and knows nothing about groceries. Restyling the
// whole catalogue tomorrow is therefore one new entry in STYLES, not 338 rewrites.
//
// Between those two sits the third layer, the MATERIAL CLASS. A pack of atta and a
// pack of detergent powder are different products and the same photographic problem:
// matte laminate, no useful reflection, texture only under a raking source. There
// are 338 subcategories and 17 material classes, so the staging knowledge is written
// 17 times rather than 338 times, and it is written from the sourced dossier
// (research/composition.md) rather than from memory.
//
// Layers, because a catalogue entry is used two ways here:
//   generate - the prompt makes the product itself, unbranded archetype.
//   stage    - the prompt makes only the set, and a real transparent product PNG
//              drops into it. This is the existing Zepto FMCG composition path
//              (composition.data.js), reached per subcategory instead of by hand.
//
// Built on the shared recipe contract (./recipe.js), like 3D faces, Zepto campaign
// tiles and Schedule images.
import { defineRecipe } from "./recipe.js";
import { CATEGORIES, SUBCATEGORIES } from "./zeptoCatalogue.taxonomy.js";

export { CATEGORIES, SUBCATEGORIES };

// Figma's image-generation prompt field has an observed character ceiling. The
// 1000 figure is defensive, not documented; see research/models.md rule 12 and the
// same constant in zeptoCampaignViews.js.
export const COMPACT_LIMIT = 1000;

// This group adds no prohibition of its own to the GENERATE layer beyond the
// library's two global rules. It does not need one: every pack face in a generated
// catalogue shot must already arrive blank under the global no-text rule, which is
// also what makes these usable as archetypes rather than as copies of a real brand's
// packaging.
export const EXTRA_RULE = undefined;

// The STAGE layer cannot take the global rules as written, and this is the one place
// in the library where that is true. A staged prompt promises that the supplied
// cutout keeps its own pixels, logo and printing exactly as provided; the global rule
// says no text or branding anywhere in the image. Both cannot hold at once. The rule
// is therefore SCOPED to the half of the image the model is actually generating,
// which is the set, and the supplied pack is explicitly carved out. Same two
// prohibitions, applied to the generated scene only.
export const STAGE_RULES =
  "Add no text, letters, numbers or labels of your own anywhere in the generated scene, and no logos, wordmarks or brand marks of any kind on any surface, prop or signage you create. The supplied product cutout is the only exception and its own printing stays exactly as provided, untouched and unaltered.";
export const STAGE_RULES_COMPACT =
  "No text, letters, logos or branding anywhere in the generated scene. The supplied cutout keeps its own printing untouched.";

// ---------- layer: what the prompt is being asked to produce ----------

export const LAYERS = [
  {
    key: "generate",
    label: "Generate the product",
    blurb: "The prompt makes the item itself, as an unbranded archetype of its subcategory.",
    use: "A catalogue product image for a quick-commerce grocery delivery app, shot as commercial packshot photography for a product listing.",
    useShort: "Catalogue packshot for a quick-commerce grocery app.",
  },
  {
    key: "stage",
    label: "Stage a supplied pack",
    blurb:
      "The prompt makes only the set. A transparent-background PNG of the real product drops in, and its own pixels are never altered.",
    use: "A catalogue product scene for a quick-commerce grocery delivery app. The supplied transparent-background product cutout is used exactly as provided, with zero alterations to its pixels: every logo, label and line of text on it stays identical, and the whole scene around it is generated. Build the set light to agree with the light already on the cutout, reading its key direction, colour temperature and shadow softness first.",
    useShort:
      "Catalogue scene for a quick-commerce grocery app. Use the supplied cutout exactly as given, generate only the set, and match its existing key direction and colour temperature.",
  },
];

// ---------- material classes: the staging knowledge, written once per material ----------
//
// Every clause here is the trade behaviour recorded in research/composition.md:
// gloss returns a picture of the light source so you light the surface rather than
// the object; matte scatters, so side light is what reveals its texture; glass wants
// backlighting or edge lighting; metal behaves like a mirror and needs precise
// placement; a contact shadow is the cue whose absence makes a cutout float.

export const CLASSES = [
  {
    key: "produce",
    label: "Loose fresh produce",
    ground: "a shallow open crate of pale untreated wood on a broad matte surface",
    light:
      "One large diffused source close above and slightly to one side for a soft wrapping falloff, plus a single raking source low from the opposite side to pick out skin texture, peel pitting and leaf veining.",
    shadow:
      "Soft-edged cast shadow falling away from the key, a tight almost-black contact shadow where each piece meets the surface, and the shadow tinted toward the ambient of the set rather than neutral grey.",
    lightShort: "Big soft source above, one low raking source for skin texture.",
    shadowShort: "Soft cast shadow, tight dark contact shadow, tinted never grey.",
  },
  {
    key: "glass",
    label: "Glass bottle or jar",
    ground: "a polished surface with a visible falloff reflection under the base",
    light:
      "Backlit through a large scrim so the body reads as transparent, with the edges drawn by two narrow strip sources raked down the left and right shoulders, the classic edge-lighting setup for glass.",
    shadow:
      "On this gloss ground the base returns a mirror reflection with falloff rather than a matte cast shadow, and a tight dark contact shadow still sits exactly where the glass meets the surface.",
    lightShort: "Backlit through a scrim, two strip highlights down the shoulders.",
    shadowShort: "Mirror reflection under the base with falloff, tight contact shadow.",
  },
  {
    key: "pet",
    label: "Clear plastic bottle",
    ground: "a smooth semi-gloss surface",
    light:
      "Backlit through a scrim so the liquid glows through the wall, a strip source raked down one side to draw the bottle edge, and the label panel kept out of direct specular so it stays readable.",
    shadow:
      "Soft cast shadow carrying the colour of the liquid where the light passes through it, and a tight dark contact shadow at the base.",
    lightShort: "Backlit so the liquid glows, one strip highlight down the side.",
    shadowShort: "Soft shadow tinted by the liquid, tight contact shadow.",
  },
  {
    key: "can",
    label: "Aluminium can or tin",
    ground: "a smooth surface with a shallow reflection",
    light:
      "Lit as a mirror rather than as an object: a large soft gradient built in front of the source for the metal to reflect, giving one long soft-edged highlight down the body and a crisp bright line along the rolled rim, with black flags either side as negative fill so the cylinder keeps its round.",
    shadow:
      "Short soft cast shadow, a tight dark contact shadow at the base, and a bright reflected bounce returning onto the lower body from the surface.",
    lightShort: "Lit as a mirror: one long soft highlight, crisp rim line, black flags either side.",
    shadowShort: "Short soft shadow, tight contact shadow, bounce onto the lower body.",
  },
  {
    key: "carton",
    label: "Matte paperboard carton",
    ground: "a broad matte surface",
    light:
      "Even diffused light across the front face so the print stays flat and legible, plus one raking source across the top and side faces to reveal the board texture and the crease of every folded edge, because a matte surface scatters and only side light shows it.",
    shadow:
      "Soft-edged cast shadow falling away from the key, a form shadow across the face turned away so the box reads as a solid volume, and a tight dark contact shadow along the bottom edge.",
    lightShort: "Even diffused front, one raking source for board texture and creases.",
    shadowShort: "Soft cast shadow, form shadow on the turned face, tight contact shadow.",
  },
  {
    key: "pouch",
    label: "Flexible laminate pouch or sachet",
    ground: "a matte surface",
    light:
      "A large close source so the metallised laminate returns broad soft speculars rather than hard glints, raked slightly so the crinkles, the crimped seal at the top and bottom, and the pillow of trapped air all read as shape.",
    shadow:
      "Soft cast shadow, and a contact shadow that follows the uneven bottom edge of a pack that does not sit perfectly flat.",
    lightShort: "Large close source, broad soft speculars on the crinkles and crimped seals.",
    shadowShort: "Soft cast shadow, contact shadow following the uneven base.",
  },
  {
    key: "tub",
    label: "Rigid plastic tub or jar",
    ground: "a clean matte surface",
    light:
      "A large soft source above and slightly forward, giving one broad even highlight across the curved lid and a second along the shoulder, with a bounce card opposite lifting the shadow side so the wall keeps its curve.",
    shadow:
      "Soft cast shadow to one side, and a tight dark contact shadow all the way round the base of the tub.",
    lightShort: "Large soft source above, broad highlight on the lid, bounce card opposite.",
    shadowShort: "Soft cast shadow, tight contact shadow round the base.",
  },
  {
    key: "hdpe",
    label: "Opaque moulded plastic bottle",
    ground: "a clean matte surface",
    light:
      "A large soft source high and to one side for a broad wrapping highlight down the shoulder, one narrow strip source drawing the far edge so the bottle separates from the ground, and a soft gradient built for the semi-gloss wall to reflect rather than a bare source.",
    shadow:
      "Soft-edged cast shadow falling away from the key, a form shadow down the far side, and a tight dark contact shadow at the base.",
    lightShort: "Soft high source, one strip drawing the far edge, gradient built for the wall.",
    shadowShort: "Soft cast shadow, form shadow down the far side, tight contact shadow.",
  },
  {
    key: "frozen",
    label: "Frozen or chilled pack",
    ground: "a chilled matte surface with a faint bloom of frost around the base",
    light:
      "A cool large soft source above with a slight blue cast, and one hard raking source low across the front so the condensation beads and the frost crystals catch and read individually.",
    shadow:
      "Soft cast shadow tinted cool, a tight dark contact shadow, and a faint ring of melt darkening the surface where the pack has been standing.",
    lightShort: "Cool soft source above, one hard low rake so frost and beads catch.",
    shadowShort: "Cool soft shadow, tight contact shadow, faint melt ring at the base.",
  },
  {
    key: "blister",
    label: "Pharma strip or blister pack",
    ground: "a clean bright matte surface",
    light:
      "Even, almost shadowless diffused light of the kind a light tent gives, so the foil backing reads flat and clinical, plus one weak raking source to give the domed blisters their form.",
    shadow:
      "A very short soft cast shadow only, and a tight contact shadow along the edge of the strip, because this class is about clarity rather than drama.",
    lightShort: "Near shadowless light-tent diffusion, one weak rake for the domed blisters.",
    shadowShort: "Very short soft shadow, tight contact shadow along the strip edge.",
  },
  {
    key: "loose",
    label: "Loose grain, powder or spice",
    ground: "a matte surface with a low open bowl and a small scatter beside it",
    light:
      "One hard source raking low across the heap so every grain casts its own micro shadow and the pile reads as texture rather than as a flat colour field, with a bounce opposite keeping the shadow side open.",
    shadow:
      "A long soft cast shadow from the bowl, micro shadows through the heap itself, and a tight dark contact shadow under the rim.",
    lightShort: "One hard low rake so each grain casts its own micro shadow, bounce opposite.",
    shadowShort: "Long soft shadow from the bowl, micro shadows through the heap.",
  },
  {
    key: "wrapper",
    label: "Wrapped confection or bar",
    ground: "a small clean matte surface",
    light:
      "A large close source so the foil or metallised film returns soft broad speculars along the folds and the twisted or crimped ends, never a hard glint that blows out to white.",
    shadow:
      "Short soft cast shadow, and a contact shadow that follows the irregular bottom edge of a wrapped item.",
    lightShort: "Large close source, soft broad speculars along the folds and crimped ends.",
    shadowShort: "Short soft shadow, contact shadow following the irregular edge.",
  },
  {
    key: "textile",
    label: "Apparel and soft goods",
    ground: "a broad matte surface, the garment laid flat or filled by an invisible form",
    light:
      "A large soft source above and one bounce opposite for an even wrapping field, plus a single raking source low across the fabric so the weave, the pile and every seam and stitch line read as texture.",
    shadow:
      "Soft cast shadow, form shadows in every fold, and a tight contact shadow under the hems where the fabric meets the surface.",
    lightShort: "Large soft source plus one low rake so weave, pile and seams read.",
    shadowShort: "Soft cast shadow, form shadows in the folds, contact shadow under the hems.",
  },
  {
    key: "hardgood",
    label: "Hard goods and electronics",
    ground: "a clean matte surface",
    light:
      "A large soft gradient built for the polished and brushed faces to reflect, one crisp strip highlight along each machined edge and chamfer, and black flags either side as negative fill so the body does not flatten out into an even grey.",
    shadow:
      "Soft cast shadow to one side, a tight dark contact shadow, and a shallow reflection on any gloss face of the object itself.",
    lightShort: "Soft gradient for the polished faces, crisp strip along each chamfer, black flags.",
    shadowShort: "Soft cast shadow, tight contact shadow, shallow reflection on gloss faces.",
  },
  {
    key: "cosmetic",
    label: "Small premium cosmetic",
    ground: "a small raised plinth or a clear polished acrylic styling block",
    light:
      "A narrow strip source laid down one side of the body for a single long controlled highlight, a soft gradient behind for the glass or lacquer to reflect, and everything else flagged off, which is what makes a small object read as expensive rather than merely lit.",
    shadow:
      "One clean soft cast shadow, a tight dark contact shadow at the base of the plinth, and a mirror return on the acrylic if the block is used.",
    lightShort: "One narrow strip down the side, soft gradient behind, everything else flagged off.",
    shadowShort: "One clean soft shadow, tight contact shadow, mirror return on the acrylic.",
  },
  {
    key: "prepared",
    label: "Prepared food and drink",
    ground: "a matte tabletop with plain undecorated tableware",
    light:
      "A large soft source from behind and slightly above, the standard food-photography position, so steam, glaze and sauce catch a highlight and the food is not flattened by frontal light, with a bounce card in front lifting the near side.",
    shadow:
      "Soft cast shadow falling toward the camera, a tight contact shadow under the plate or cup, and every shadow warm rather than neutral grey.",
    lightShort: "Large soft source from behind and above, bounce card lifting the near side.",
    shadowShort: "Soft shadow falling toward camera, tight contact shadow, warm never grey.",
  },
  {
    key: "paper",
    label: "Paper goods and stationery",
    ground: "a clean matte surface",
    light:
      "Even diffused light so the printed and coated faces stay flat and legible, plus one low raking source across the stack so the cut edges, the page block and any emboss or spine crease read as depth.",
    shadow:
      "Soft cast shadow, a form shadow down the side of the stack, and a tight dark contact shadow under the bottom sheet.",
    lightShort: "Even diffusion for legibility, one low rake so cut edges and creases read.",
    shadowShort: "Soft cast shadow, form shadow down the stack, tight contact shadow.",
  },
];

const CLASS_BY_KEY = new Map(CLASSES.map((c) => [c.key, c]));
export const classOf = (key) => CLASS_BY_KEY.get(key) || CLASSES[0];

// ---------- styles: the whole look, and the only thing that changes on a restyle ----------
//
// A style may override any material-class clause by declaring a same-named field.
// The toy style does exactly that: it is not photography at all, so it replaces the
// light and shadow of every class rather than inheriting them.

const groundClause = (cls, style) =>
  style.ground === "" ? "" : `Standing on ${style.ground || cls.ground}, against ${style.backdrop}.`;

const lightClause = (cls, style, short) =>
  short
    ? style.lightShort || cls.lightShort
    : style.light || cls.light;

const shadowClause = (cls, style, short) =>
  short ? style.shadowShort || cls.shadowShort : style.shadow || cls.shadow;

export const STYLES = [
  {
    key: "studio",
    label: "Studio packshot",
    blurb:
      "The premium FMCG set: seamless sweep, three-light grammar, parallel verticals, front-to-back sharpness. The default, and the one the composition system already describes.",
    backdrop: "a seamless paper sweep curving from wall to table with no visible corner",
    palette:
      "Natural true-to-product colour, clean and just slightly muted, with the ground a soft neutral one stop darker than the product so the two separate.",
    paletteShort: "True-to-product colour, ground one stop darker than the product.",
    render:
      "Shot on a 100mm macro at f/8 on a perspective-control lens so verticals stay parallel with no keystone, focus-stacked for front-to-back sharpness with no soft edges anywhere on the product.",
    renderShort: "100mm macro at f/8, verticals parallel, focus-stacked, sharp front to back.",
    parts: ({ layer, cls, subject, props, compact }) => {
      const L = LAYERS.find((l) => l.key === layer) || LAYERS[0];
      const s = STYLES[0];
      return compact
        ? [L.useShort, subject, props, groundClause(cls, s), lightClause(cls, s, true), shadowClause(cls, s, true), s.paletteShort, s.renderShort]
        : [L.use, subject, props, groundClause(cls, s), lightClause(cls, s, false), shadowClause(cls, s, false), s.palette, s.render];
    },
  },
  {
    key: "grid",
    label: "App grid asset",
    blurb:
      "The listing tile: one item, dead centre, flat bright ground, near shadowless. What actually ships into the app's category grid.",
    ground: "",
    backdrop: "a plain flat off-white #F7F7F5 field",
    palette:
      "Natural true-to-product colour at full clarity, the ground a single flat unbroken off-white #F7F7F5 with no gradient and no vignette.",
    paletteShort: "True colour, flat unbroken off-white #F7F7F5 ground, no gradient.",
    light:
      "Even near-shadowless diffusion of the kind a light tent gives, from the front and slightly above, so the whole product is legible at thumbnail size and nothing is lost to a dark side.",
    lightShort: "Even near-shadowless light-tent diffusion, front and slightly above.",
    shadow:
      "One small soft contact shadow directly beneath the item and nothing else, no cast shadow reaching across the frame.",
    shadowShort: "One small soft contact shadow beneath, no cast shadow.",
    render:
      "Straight-on eye-level view, the item centred with generous even padding on all four sides, the complete product in frame and never cropped, everything in crisp focus.",
    renderShort: "Eye-level, centred, generous even padding, complete and uncropped, crisp.",
    parts: ({ layer, cls, subject, props, compact }) => {
      const L = LAYERS.find((l) => l.key === layer) || LAYERS[0];
      const s = STYLES[1];
      // the grid asset carries no props: one item, nothing else in the frame
      return compact
        ? [L.useShort, subject, groundClause(cls, s), lightClause(cls, s, true), shadowClause(cls, s, true), s.paletteShort, s.renderShort]
        : [L.use, subject, groundClause(cls, s), lightClause(cls, s, false), shadowClause(cls, s, false), s.palette, s.render];
    },
  },
  {
    key: "campaign",
    label: "Campaign world",
    blurb:
      "The same catalogue item dropped into the brand's sun-drenched violet world: hard sun, flat brand surfaces, produce alone keeping its ripe colour. Shares its constants with the campaign tiles group.",
    backdrop: "a flat unbroken field of electric violet #7C3AED",
    ground: "a plain block of flat deep aubergine #2A1430",
    palette:
      "Everything manufactured in the scene sits in the campaign's three colours, electric violet #7C3AED, deep aubergine #2A1430 and soft off-white #F4F1FA, as flat clean surfaces; only fresh produce and food keep their own ripe saturated colour, so they pop against the brand field by saturation contrast.",
    paletteShort:
      "Surfaces only in violet #7C3AED, aubergine #2A1430, off-white #F4F1FA; food keeps its ripe colour.",
    light:
      "Lit by one hard direct sun, a small undiffused source far from the set, from the upper left: crisp-edged cast shadows with a defined core falling long to the right, every shadow tinted toward the scene's violet ambient rather than neutral grey.",
    lightShort: "Hard sun upper left, crisp long shadows falling right, tinted violet never grey.",
    shadow:
      "A long crisp-edged cast shadow raking to the right, tinted violet, with a tight dark contact shadow wherever an object meets a surface.",
    shadowShort: "Long crisp violet-tinted shadow to the right, tight contact shadow.",
    render:
      "Shot as art-directed editorial retail photography, everything in crisp focus, no depth-of-field blur.",
    renderShort: "Editorial retail photography, crisp focus throughout.",
    parts: ({ layer, cls, subject, props, compact }) => {
      const L = LAYERS.find((l) => l.key === layer) || LAYERS[0];
      const s = STYLES[2];
      return compact
        ? [L.useShort, subject, props, groundClause(cls, s), lightClause(cls, s, true), shadowClause(cls, s, true), s.paletteShort, s.renderShort]
        : [L.use, subject, props, groundClause(cls, s), lightClause(cls, s, false), shadowClause(cls, s, false), s.palette, s.render];
    },
  },
  {
    key: "toy",
    label: "Soft toy model",
    blurb:
      "Not photography at all: the smoothly stylised 3D toy-model render the Away icon sets use. Here to prove the split works, since it overrides every photographic clause in every material class and the catalogue entries still hold.",
    backdrop: "a plain off-white #F7F7F5 background",
    ground: "",
    palette:
      "Colours natural and true to each object, clean and just slightly muted, surfaces smooth simple and uniform with a soft matte finish and gently rounded simplified forms.",
    paletteShort: "Natural slightly muted colour, smooth uniform matte surfaces, rounded forms.",
    light:
      "Soft, even, gently flat shading with minimal soft shadows and smooth light ambient occlusion, everything in crisp focus, no harsh highlights or reflections.",
    lightShort: "Soft even flat shading, light ambient occlusion, no harsh highlights.",
    shadow: "Minimal soft shadow pooled directly beneath the object and nothing more.",
    shadowShort: "Minimal soft shadow beneath the object.",
    render:
      "Rendered as a clean, smoothly stylised 3D illustration with a soft toy-model look, clearly computer-rendered, NOT a photograph. Keep each object recognisable by its colour and basic material but render it as a clean stylised surface, with no grain, no fabric weave or stitching, no wood-grain or leather texture and no fine micro-detail or surface noise. Subject centred with generous padding.",
    renderShort:
      "Clean stylised 3D toy-model render, NOT a photograph, no micro-detail or surface noise, subject centred with padding.",
    parts: ({ layer, cls, subject, props, compact }) => {
      const L = LAYERS.find((l) => l.key === layer) || LAYERS[0];
      const s = STYLES[3];
      // the toy style states the render first: naming the medium up front is what
      // stops the model defaulting to photography (research/models.md rule 3).
      return compact
        ? [s.renderShort, subject, s.paletteShort, s.lightShort, s.shadowShort, `Against ${s.backdrop}.`]
        : [s.render, subject, props, s.palette, s.light, s.shadow, `Against ${s.backdrop}.`];
    },
  },
];

// ---------- the recipe ----------

export const zeptoCatalogueRecipe = defineRecipe({
  key: "zepto-catalogue",
  label: "Zepto catalogue",
  dials: {
    subcategory: "Which of the 338 subcategories to render.",
    style: "The whole look. The only dial that has to change to restyle the catalogue.",
    layer: "Generate the product, or stage a supplied transparent PNG of the real pack.",
    length: "Full, or compact for a prompt field under a character cap.",
  },
  styles: STYLES,
  extraRule: EXTRA_RULE,
  tokens: [
    "contact shadow",
    "form shadow",
    "raking light",
    "negative fill",
    "seamless sweep",
    "perspective-control lens",
    "focus stacking",
    "light the surface, not the object",
  ],
});

// compose one subcategory. `sub` is a taxonomy entry, not a string, so a caller
// cannot compose a subject that has no material class attached to it.
//
// The generate layer routes through the recipe, which closes every prompt with the
// library's global rules. The stage layer assembles the same parts() output and
// closes with STAGE_RULES instead, for the reason given where those are declared:
// the global rule and a promise to preserve a real pack's printing contradict each
// other, so the stage layer scopes the prohibition to the generated scene.
export function composeSub(sub, { style = "studio", layer = "generate", length = "full" } = {}) {
  const S = STYLES.find((s) => s.key === style) || STYLES[0];
  const cls = classOf(sub.klass);
  const compact = length === "compact";
  const subject = layer === "stage" ? sub.stage : sub.hero;
  // props are dropped in the compact register, where one clean item is the whole job
  const props = compact ? "" : sub.props || "";
  const pick = { style: S.key, length, cls, subject, props, layer, compact };
  if (layer !== "stage") return zeptoCatalogueRecipe.compose(pick);
  const body = S.parts(pick)
    .filter(Boolean)
    .map((s) => String(s).trim())
    .join(" ");
  return `${body} ${compact ? STAGE_RULES_COMPACT : STAGE_RULES}`;
}
