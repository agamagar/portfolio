// Recipe for the "Zepto campaign tiles" prompt system: sun-drenched editorial
// grocery photography in one brand-purple world, generated as the PHOTOGRAPHIC
// LAYER of a campaign tile, with the headline, price and interface chips set over
// it in Figma afterwards.
//
// Derived by reading a 2025 US grocery rebrand campaign board (Amazon Fresh, by
// Koto): eight tiles, two greens and an off-white, chunky type doing the talking,
// hard-sun grocery photography doing the proving. The type there is flat graphic
// design over photography, so this system generates ONLY the photography and the
// blank brand surfaces, and leaves every word to Figma, where type renders at
// perfect fidelity instead of as the models' single best-documented failure mode
// (research/models.md, failure table row 1).
//
// Built on the shared recipe contract (./recipe.js), like 3D faces. Four dials plus
// a register:
//   1. Subject   - the Zepto-themed object, from a seeded list or [SUBJECT] free text.
//                  Cues describe SHAPE only, so a subject survives a tile change.
//   2. Tile      - the style: colour-field packshot, crate macro, edge-to-edge
//                  produce, corner peek, or street sign. Look and staging only.
//   3. Colorway  - which brand colour carries the manufactured surfaces (field,
//                  crate, board). The produce always keeps its own ripe colour.
//   4. Reference - words only, or an anchor tile attached as a named style
//                  reference (anchor first, then re-anchor, never chain deep:
//                  research/models.md rules 4 and 20).
//   Length      - compact (under COMPACT_LIMIT, for Figma's GPT Image 2 prompt
//                  field) or full.
//
// The clause order never varies between tiles (research/models.md rule 2, the
// OpenAI spine): intended use, reference role, scene and ground, subject, key
// details (light, shadow, palette), then the library rules via compose().
import { defineRecipe } from "./recipe.js";

// The one prohibition this group adds to the library's global rules. The reference
// board is full of boards, screens and price chips; ours must arrive empty so the
// type can be set over them in Figma.
export const EXTRA_RULE =
  "Every signboard, screen, price tag, sticker and pack face in the scene stays completely blank, one clean field of colour with nothing printed on it.";
export const EXTRA_RULE_COMPACT = "Signs, screens, tags and pack faces stay blank.";

// Figma's image-generation prompt field has an observed character ceiling.
// UNSOURCED: no Figma document states a limit, and the 1,000 figure that circulates
// traces back to Adobe Firefly, not Figma. Both candidate models have far more
// headroom (32,000 characters on GPT image; a 131,072-token context on Nano Banana
// 2), so any real cap is Figma's client. Treat 1000 as a defensive working number.
// See research/models.md rule 12.
export const COMPACT_LIMIT = 1000;

// ---------- the constant: the brand world every tile lives in ----------

// Intended use first: naming the use sets the model's mode and level of polish
// (research/models.md rule 3).
export const USE =
  "A brand campaign tile for a quick-commerce grocery delivery app, shot as art-directed editorial retail photography for an out-of-home and in-app campaign.";
export const USE_SHORT =
  "Campaign tile for a quick-commerce grocery app: editorial retail photography.";

// The three campaign colours. STAND-INS sampled from this portfolio's own Zepto
// tokens (#7C3AED is the hello-page Zepto accent, #2A1430 the site's Zepto wash);
// swap in the real brand values when they land and every prompt follows.
export const COLORWAYS = [
  { key: "violet", label: "Electric violet", color: "#7C3AED", desc: "electric violet" },
  { key: "aubergine", label: "Deep aubergine", color: "#2A1430", desc: "deep aubergine" },
  { key: "offwhite", label: "Off-white", color: "#F4F1FA", desc: "soft lilac-tinted off-white" },
];

// Light stated as its physical cause, never an adjective: a hard shadow comes from
// a small undiffused source far from the set, which is why the sun is the
// reference; shadows carry the scene's ambient colour because neutral grey is the
// documented giveaway of a composite (research/composition.md).
export const LIGHT =
  "Lit by one hard direct sun, a small undiffused source far from the set, from the upper left: crisp-edged cast shadows with a defined core falling long to the right, every shadow tinted toward the scene's violet ambient rather than neutral grey, and a tight dark contact shadow wherever an object meets a surface.";
export const LIGHT_SHORT =
  "Hard sun upper left, crisp shadows falling right, tinted violet never grey, tight contact shadows.";

// Saturation contrast is the campaign's engine: brand surfaces stay flat and
// manufactured, the produce alone carries ripeness.
export const PALETTE =
  "Everything manufactured in the scene sits in the campaign's three colours, electric violet #7C3AED, deep aubergine #2A1430 and soft off-white #F4F1FA, as flat clean surfaces; only the fresh produce and food keep their own ripe saturated colour, so they pop against the brand field by saturation contrast.";
export const PALETTE_SHORT =
  "Surfaces only in violet #7C3AED, aubergine #2A1430, off-white #F4F1FA; produce keeps its ripe colour.";

// Long lens and parallel verticals are what separate a trade packshot from a phone
// snap (research/composition.md, vocabulary table).
export const RENDER =
  "Shot on a long lens, about 100mm, at working distance: verticals kept parallel with no keystone, crisp focus front to back, high resolution, clean edges on every object, no film grain, no bokeh, no bloom and no vignette beyond the faintest corner falloff.";
export const RENDER_SHORT =
  "100mm look, parallel verticals, crisp throughout, clean edges, no grain, no bokeh.";
// With a real photo attached for quality (reference "moodboard") the photo carries
// the lens feel, so the compact render clause is dropped to make room.
const renderShortFor = (r) => (r.key === "moodboard" ? "" : RENDER_SHORT);

// ---------- reference: the anchor tile, role named ----------
// Both vendors converge on this: name every reference's role, restate the
// invariants every generation, and re-anchor to the original rather than chaining
// generations deep (research/models.md rules 4, 5 and 20).
export const REFERENCES = [
  { key: "none", label: "Words only", full: "", short: "" },
  {
    key: "anchor",
    label: "Anchor tile attached",
    full:
      "The attached image is Image 1, a style reference: match its palette, its light direction and softness, its shadow tint and its level of polish exactly, and take nothing else from it, not its objects, not its composition, not any mark on it.",
    short:
      "Image 1: style reference, match its palette, light and shadow tint, take nothing else.",
  },
  {
    key: "moodboard",
    label: "Moodboard frame attached",
    full:
      "The attached image is Image 1, a real photograph from the campaign moodboard, attached for its photographic quality only: match its skin texture, grain, colour grade, contrast, lens feel, framing style and level of polish exactly, so the result reads as a frame from the same shoot; take none of its people, clothes, objects, setting or screen content.",
    short:
      "Image 1: real photo, match its quality (skin, grain, grade, contrast, framing), take none of its content.",
  },
];

// ---------- subjects: Zepto-themed objects, cues describe shape only ----------
export const SUBJECTS = [
  {
    key: "mangoes",
    label: "Mangoes",
    cue: "ripe Alphonso mangoes, plump ovals, golden skin blushing red at the shoulder",
  },
  {
    key: "bananas",
    label: "Bananas",
    cue: "a hand of bananas, five to seven curved fingers joined at one crown",
  },
  {
    key: "tomatoes",
    label: "Tomatoes",
    cue: "vine tomatoes, taut round red globes each with a small green star calyx",
  },
  {
    key: "strawberries",
    label: "Strawberries",
    cue: "strawberries, plump seed-studded hearts with green frill caps",
  },
  {
    key: "cucumbers",
    label: "Cucumbers",
    cue: "slim ridged cucumbers, long gently tapering cylinders with matte green skin",
  },
  {
    key: "coriander",
    label: "Coriander",
    cue: "fresh coriander bunches, loose feathery leaves splaying from tied stems",
  },
  {
    key: "eggs",
    label: "Eggs",
    cue: "a tray of brown eggs, smooth matte ovals seated in a moulded-fibre grid",
  },
  {
    key: "meal-bowl",
    label: "Meal bowl",
    cue: "a ready meal in a moulded-fibre tray: grains, greens, a seared fillet in neat sections",
  },
  {
    key: "chai",
    label: "Cutting chai",
    cue: "two glasses of cutting chai, small ribbed tumblers of milky tea, steam rising",
  },
  {
    key: "grocery-bag",
    label: "Grocery bag",
    cue: "a flat-bottomed kraft grocery bag with its top edge rolled, leafy greens poking out",
  },
  {
    key: "custom",
    label: "[SUBJECT]",
    cue: "[SUBJECT], described by its shape alone",
  },
];

const subjectFor = (key) => SUBJECTS.find((s) => s.key === key) || SUBJECTS[0];
const colorwayFor = (key) => COLORWAYS.find((c) => c.key === key) || COLORWAYS[0];
const referenceFor = (key) => REFERENCES.find((r) => r.key === key) || REFERENCES[0];

const fieldFor = (c) =>
  `The set is one seamless sweep of ${c.desc} (${c.color}), a flat brand-colour studio ground curving up with no visible corner and no horizon line, holding about a stop of gentle falloff away from the subject and the faintest darkening at the frame corners, with no texture and no props.`;
const fieldShortFor = (c) =>
  `One seamless ${c.desc} (${c.color}) sweep, about a stop of falloff, no horizon, no props.`;

// The lifestyle scenarios that once lived on this tile moved to their own system,
// "Schedule images" (./scheduleImagesViews.js), on 2026-08-16. This tile keeps
// the studio campaign register only.
// The phone tile puts the colorway on the SCREEN (it is the manufactured surface
// there), so the ground has to be the contrasting brand colour or the phone
// vanishes into it. Off-white grounds the two dark colorways; violet grounds
// off-white.
const GROUND_PAIR = { violet: "offwhite", aubergine: "offwhite", offwhite: "violet" };
const groundFor = (c) => colorwayFor(GROUND_PAIR[c.key] || "offwhite");

// ---------- the six tiles ----------
export const STYLES = [
  {
    key: "field",
    label: "Colour-field packshot",
    blurb: "The hero tile: one subject on a seamless brand-colour sweep, hard sun, clear space above for the headline.",
    parts: (pick) => {
      const s = subjectFor(pick.subject);
      const c = colorwayFor(pick.colorway);
      const r = referenceFor(pick.reference);
      if (pick.length === "compact")
        return [
          USE_SHORT,
          r.short,
          fieldShortFor(c),
          `Subject: ${s.cue}, alone, low in frame at 0.55 of frame height, centred, the upper third left clean and empty for a headline set later in Figma.`,
          LIGHT_SHORT,
          PALETTE_SHORT,
          renderShortFor(r),
        ];
      return [
        USE,
        r.full,
        fieldFor(c),
        `The subject is ${s.cue}, alone on the sweep with no supporting props, sitting low in the frame at about 0.55 of frame height, centred, so the upper third of the tile stays one clean empty field of the ground colour where a headline will be set later in Figma.`,
        LIGHT,
        PALETTE,
        RENDER,
      ];
    },
  },
  {
    key: "crate-macro",
    label: "Crate macro",
    blurb: "Tight into a brand-colour delivery crate packed with produce, sun dropping shadows through the perforations.",
    parts: (pick) => {
      const s = subjectFor(pick.subject);
      const c = colorwayFor(pick.colorway);
      const r = referenceFor(pick.reference);
      if (pick.length === "compact")
        return [
          USE_SHORT,
          r.short,
          `A plastic delivery crate in ${c.desc} (${c.color}), perforated walls, packed over the brim with ${s.cue}, shot so close crate and produce fill the frame edge to edge, the rim cutting a slight diagonal.`,
          "Hard sun rakes from upper left, crisp shadows drop through the perforations, tinted violet, tight contact shadows between pieces.",
          PALETTE_SHORT,
          renderShortFor(r),
        ];
      return [
        USE,
        r.full,
        `The scene is a stackable plastic delivery crate in ${c.desc} (${c.color}), moulded with perforated walls and a thick rounded rim, packed above the brim with ${s.cue}. The camera is in close, a tight macro framing where the crate and its produce fill the frame edge to edge with no ground and no horizon visible, the crate rim cutting across the frame on a slight diagonal.`,
        "Hard direct sun rakes in from the upper left, dropping crisp-edged shadows through the crate perforations onto the produce inside, the shadow pattern reading like a gobo; the shadows are tinted toward violet rather than neutral grey, with tight dark contact shadows in every crevice between the pieces.",
        PALETTE,
        RENDER,
      ];
    },
  },
  {
    key: "texture",
    label: "Edge-to-edge produce",
    blurb: "One subject repeated as a dense market wall filling the whole frame, built to sit behind a UI chip in Figma.",
    parts: (pick) => {
      const s = subjectFor(pick.subject);
      const r = referenceFor(pick.reference);
      if (pick.length === "compact")
        return [
          USE_SHORT,
          r.short,
          `${s.cue}, repeated as one dense market wall filling the frame edge to edge, no ground, no horizon, no container, pieces packed tight at varied angles, all crisply in focus.`,
          "Top-lit by hard sun, small violet-tinted shadows pooling between the pieces so the wall reads deep, not flat.",
          "Even density, no hero piece: built so a small interface chip can sit over it in Figma.",
          PALETTE_SHORT,
          renderShortFor(r),
        ];
      return [
        USE,
        r.full,
        `The subject is ${s.cue}, repeated many times over as one dense market wall that fills the frame edge to edge: no ground plane, no horizon, no container and no gap of background anywhere, the pieces packed tight against each other at naturally varied angles, every piece crisply in focus.`,
        "Top-lit by hard direct sun so small crisp shadows pool in the gaps between the pieces, tinted toward violet rather than neutral grey, giving the wall real depth instead of a flat print.",
        "The image is built as a background layer: even density across the whole frame with no single hero piece and no focal arrangement, so a small floating interface chip can be set over any part of it in Figma.",
        PALETTE,
        RENDER,
      ];
    },
  },
  {
    key: "corner-peek",
    label: "Corner peek",
    blurb: "A flat brand-colour field with the subject pushing in from the corners, the centre left empty for a big price or word.",
    parts: (pick) => {
      const s = subjectFor(pick.subject);
      const c = colorwayFor(pick.colorway);
      const r = referenceFor(pick.reference);
      if (pick.length === "compact")
        return [
          USE_SHORT,
          r.short,
          `One flat unbroken field of ${c.desc} (${c.color}). Two or three of ${s.cue} push into the frame from its corners and edges, cropped mid-object, sharply lit.`,
          "The centre 60 percent stays one clean empty field for a big price or word set later in Figma.",
          LIGHT_SHORT,
          PALETTE_SHORT,
          renderShortFor(r),
        ];
      return [
        USE,
        r.full,
        `The ground is one flat unbroken field of ${c.desc} (${c.color}), a pure graphic colour with no gradient, no texture and no horizon. Two or three of ${s.cue} push into the frame from its corners and edges, each cropped mid-object by the frame so they read as intruders from outside the tile, sharply lit and fully in focus.`,
        "The centre 60 percent of the frame stays one completely clean, empty field of the ground colour, holding nothing at all, because a large price or a single word will be set there later in Figma.",
        LIGHT,
        PALETTE,
        RENDER,
      ];
    },
  },
  {
    key: "street-sign",
    label: "Street sign",
    blurb: "A blank brand-colour signboard on a sun-baked wall, crates below, for compositing the campaign line in Figma.",
    parts: (pick) => {
      const s = subjectFor(pick.subject);
      const c = colorwayFor(pick.colorway);
      const r = referenceFor(pick.reference);
      if (pick.length === "compact")
        return [
          USE_SHORT,
          r.short,
          `A blank signboard painted ${c.desc} (${c.color}), crisp fresh edges, on a sun-baked brick or plaster wall, shot straight on. The board stays one clean empty field for a campaign line set later in Figma.`,
          `Below it, a stack of delivery crates in the same colour holding ${s.cue}.`,
          "Hard afternoon sun rakes the wall, unseen foliage shadowing one corner; shadows warm on brick, deep violet in the board's shade.",
          PALETTE_SHORT,
          renderShortFor(r),
        ];
      return [
        USE,
        r.full,
        `The scene is a blank rectangular signboard painted ${c.desc} (${c.color}), freshly painted and completely empty, with crisp clean edges and a thin simple frame, mounted on a sun-baked exterior wall of warm brick or painted plaster with honest weathering. The camera faces it straight on, verticals kept parallel, the board large in the frame: it is one clean unbroken field of colour because the campaign line will be set onto it later in Figma.`,
        `On the pavement below the board sits a short stack of delivery crates in the same brand colour, the top crate holding ${s.cue}, casually real rather than styled.`,
        "Hard afternoon sun rakes across the wall from one side, throwing the crisp shadow of unseen foliage across one corner of the scene the way a gobo shapes a studio shadow; the shadows sit warm on the brick and deep violet in the board's own shade, never neutral grey.",
        PALETTE,
        RENDER,
      ];
    },
  },
  {
    key: "phone-in-hand",
    label: "Phone in hand",
    blurb: "One hand holding a generic slab phone square to camera on the contrasting brand sweep, its screen one flat brand field for the app UI set later in Figma. Lifestyle moments live in the Schedule images system.",
    // Screen-replacement plate (research/zepto-campaign.md): the phone is a
    // generic slab held square to the lens with no keystone; the grip is the
    // hand-model brief (firm yet delicate, fingers relaxed and curved, thumb on
    // the side rail, fingertips behind, clean short nails, no rings, plain sleeve
    // cropped at the wrist); the screen is described POSITIVELY as what it is (one
    // flat field, one soft highlight) plus the one bounded constraint (no icons, no
    // text), because unbounded briefs fail silently and the models fill screens
    // with UI. The pro plate is a switched-off black glass; ours is the colorway
    // because the group's stance is blank brand surfaces for a Figma overlay.
    parts: (pick) => {
      const s = subjectFor(pick.subject);
      const c = colorwayFor(pick.colorway);
      const g = groundFor(c);
      const r = referenceFor(pick.reference);
      const screenShort = `Screen: one flat field of ${c.desc} (${c.color}), one soft glass highlight, no icons, no text; UI set over it in Figma.`;
      const screenFull = `The screen is one flat unbroken field of ${c.desc} (${c.color}), a switched-on splash colour with no icons, no text, no status bar and no glow beyond the field itself, the glass carrying a single soft highlight sliding across it so it still reads as glass; the app interface will be set over that field later in Figma.`;
      if (pick.length === "compact")
        return [
          USE_SHORT,
          r.short,
          `On a seamless ${g.desc} (${g.color}) sweep, one hand from lower right holds a generic slab phone square to camera, no keystone: relaxed curved fingers, thumb on the side rail, clean short nails, no rings.`,
          screenShort,
          `At the base, ${s.cue}.`,
          LIGHT_SHORT,
          PALETTE_SHORT,
          renderShortFor(r),
        ];
      return [
        USE,
        r.full,
        `${fieldFor(g)} One hand enters from the lower right and holds a generic slab smartphone upright in the upper centre of the frame, its face square to the camera, straight on or barely elevated, with no keystone on the screen rectangle. The grip is firm yet delicate: fingers relaxed and slightly curved around the back, thumb resting on the side rail and never over the display, fingertips behind; clean short unpolished nails, moisturised skin, no rings, no watch, a plain neutral sleeve cropped at the wrist. The phone carries no maker's cues, no logo, no distinctive camera bump.`,
        screenFull,
        `At the base of the frame, on the ground beside the hand, sits ${s.cue}, the delivered goods, casually real rather than styled.`,
        LIGHT,
        PALETTE,
        RENDER,
      ];
    },
  },
];

// ---------- the recipe ----------
export const zeptoCampaignRecipe = defineRecipe({
  key: "zepto-campaign",
  label: "Zepto campaign tiles",
  dials: {
    subject: SUBJECTS,
    colorway: COLORWAYS,
    reference: REFERENCES,
    length: ["compact", "full"],
  },
  extraRule: EXTRA_RULE,
  extraRuleCompact: EXTRA_RULE_COMPACT,
  styles: STYLES,
  tokens: [
    "Sun: how hard the shadow edge reads, from crisp noon sun to a slightly hazed afternoon",
    "Shadow tint: how far the shadows lean violet before they read as a colour effect",
    "Falloff: how much the brand field darkens away from the subject, from dead flat to a clear stop",
    "Ripeness: how saturated the produce runs against the flat brand surfaces",
    "Clear space: how much of the tile stays empty for the type Figma will set over it",
    "Crop: how hard the subject is cut by the frame edge in the macro and corner tiles",
    "Wear: how weathered the street wall reads, from clean render to honest grit",
    "Lens: how compressed the perspective feels, 85mm calm to 135mm flat",
  ],
});

export const { compose, styleMeta: STYLE_META } = zeptoCampaignRecipe;
