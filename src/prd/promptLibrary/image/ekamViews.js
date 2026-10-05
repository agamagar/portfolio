// Recipe for the EKAM prompt system: generate the brand's imagery inside Figma with
// GPT Image 2, on the Soft Focus direction.
//
// Soft Focus is EKAM's final direction (decided 2026-08-21, Claude/EKAM Art Direction/
// design-system.md): warm white ground #F7F2EF, deep plum ink #5A2340, Instrument Serif
// headline, lowercase wide-tracked kicker, and a blurred colour-orb band flush to the
// top edge. Type, layout and the five-slot grammar are NOT generated here. The model
// makes the imagery only; the grammar is built in Buzz or Figma and set in real type.
//
// Three dials:
//   1. Asset     - what surface is being made (band, full frame, motif card, tile). Shape only.
//   2. Motif     - what the softness is made OF (orbs, botanical, celestial, cycle...). Shape only.
//   3. Colourway - which of the band accents leads. Look only.
//   4. Style     - Soft Focus is the base and currently the only one. A second style is
//                  one entry in STYLES; nothing else changes.
import { defineRecipe } from "./recipe.js";

// Figma's image-gen prompt field is worked under a 1000-character ceiling across this
// library (research/models.md: the API itself allows 32,000, so this is a client limit).
export const COMPACT_LIMIT = 1000;

// ---------- tokens (from design-system.md, direction B) ----------
export const TOKENS = [
  ["Ground", "#F7F2EF", "warm white"],
  ["Ink", "#5A2340", "deep plum"],
  ["Body ink", "#6E6470", "muted mauve grey"],
  ["Kicker", "#8A7F92", "mauve, lowercase and wide-tracked"],
  ["Band periwinkle", "#AEB9E8", "band accent"],
  ["Band soft yellow", "#F0DE86", "band accent"],
  ["Band blush", "#E9B9C6", "band accent"],
  ["Band plum", "#6B2350", "band accent"],
];

// The one prohibition this group adds to the library's global rules, and it is a brand
// decision rather than a craft one. art-direction.md's judgment call: the strongest
// reference contains explicit vulva motifs and nude figures, and the primary patient is
// a young woman under family scrutiny for whom discretion is the top-ranked promise.
// The resolution taken was to keep the LANGUAGE of the reference (symmetry, folk
// ornament, the female figure rendered with dignity) and choose motifs that read as
// botanical and celestial for public channels.
export const EXTRA_RULE =
  "Nothing anatomical, clinical or explicit: no anatomical diagrams, no organs, no nudity, no medical instruments, no blood, and no body part shown in a way that would be uncomfortable on a phone screen in a shared room.";
export const EXTRA_RULE_COMPACT = "Nothing anatomical, clinical, medical or nude.";

// ---------- the constant: what makes every prompt in this group the same system ----------

export const GROUND =
  "The whole image sits on one warm white ground, #F7F2EF, an unbroken flat field with no vignette, no paper texture and no border.";
export const GROUND_SHORT = "One flat warm white #F7F2EF ground, no vignette, no border.";

// Softness is the discretion promise made visual, so the defocus is the subject, not an
// effect laid over one. Stated as optics (aperture, focal plane, bokeh shape) rather than
// as a filter, because a named mechanism renders and an adjective does not.
// Sourced 2026-08-21, research/ekam.md: "bokeh" bare is avoided because the word's training
// data defaults to a DARK ground with specular point highlights, the opposite of this warm
// pale field, so the ground and the absence of specular points are stated explicitly rather
// than left to the word. Circular bokeh, no polygonal faceting and no cat's-eye clipping name
// the real failure modes of aperture-blade shape and edge-of-frame lens-barrel vignetting.
// Gaussian blur is explicitly named OUT: it is a flat post-process convolution, a different
// look from real lens defocus (research/ekam.md source 5).
export const SOFTNESS =
  "Everything is photographed in heavy lens defocus, as if through a wide aperture around f/1.2 with the focal plane well in front of the subject: shapes survive only as soft circular bokeh discs of colour, evenly rounded with no polygonal faceting and no cat's-eye clipping at the frame edges, no specular point highlights and no dark background anywhere behind them, edges dissolving gradually into the pale ground over a wide falloff. Not gaussian blur: true optical defocus character, no hard edge anywhere. No shape is legible as an object. No sharp element is left anywhere in the frame as a focal point.";
export const SOFTNESS_SHORT =
  "Heavy lens defocus, wide aperture near f/1.2: soft circular bokeh discs, no faceting, no cat's-eye clipping, no specular highlights, not gaussian blur, nothing sharp.";

export const PALETTE_RULE =
  "Colours are drawn only from the palette named above, kept pale, chalky and desaturated, closer to a wash than to a saturated light. Colours meet by blending softly into one another and into the ground rather than by overlapping as separate layers.";
export const PALETTE_RULE_SHORT =
  "Palette only, pale and chalky, colours blending softly into each other and the ground.";

// "Gradient banding" is the correct technical term for the visible tonal steps in a large
// smooth 8-bit colour transition, sourced 2026-08-21 (research/ekam.md source 3). Whether
// naming it here actually suppresses it, versus banding being inherent to the model's output
// encoding, is UNTESTED; the standard downstream fix (error-diffusion dithering) is a raster
// post-process, not a prompt lever, and is not something this library can ask for in text.
export const RENDER =
  "A clean photographic render, evenly and gently lit, no film grain, no noise, no glow or bloom, no lens flare, no visible gradient banding, no drop shadow, no frame, no mockup, no device, no hand, nothing else in the frame.";
export const RENDER_SHORT =
  "Clean photographic render, gently lit, no grain, no bloom, no flare, no banding, no shadow, no frame, nothing else in frame.";

// ---------- dial 1: the asset ----------
// Shape and framing only. The band is the direction's signature: full width, flush to the
// top edge of the post. Note the aspect trap in the prose: GPT Image 2 accepts a ratio of
// at most 3:1 (research/models.md), and the band's finished aspect is about 5:1, so a band
// is generated at 2048x1152 and cropped down to the band height in Figma.
export const ASSETS = [
  {
    key: "band",
    label: "Band",
    frame:
      "A wide horizontal composition to be cropped down into a full-width band across the top edge of a post: hold every element inside the middle horizontal third of the frame, with the colour masses running edge to edge left and right and dissolving into the ground before the top and bottom edges.",
    frameShort:
      "Wide horizontal, everything inside the middle third, colour running edge to edge and dissolving before the top and bottom.",
  },
  {
    key: "frame",
    label: "Full frame",
    frame:
      "A full-frame field filling the whole image, the colour masses spread across the frame with the largest mass off centre and generous empty ground left in the lower half, so headline and body type can be set over the quiet area later.",
    frameShort:
      "Full frame, masses off centre, generous empty ground in the lower half for type.",
  },
  {
    key: "card",
    label: "Motif card",
    frame:
      "A single centred motif in a square frame, occupying the middle 60 percent with even margin, the ground clean and empty around it.",
    frameShort: "One centred motif in a square, middle 60 percent, clean empty margin.",
  },
  {
    key: "tile",
    label: "Seamless tile",
    frame:
      "An evenly distributed field with no single focal point and no edge emphasis, the elements spaced regularly enough to repeat as a background tile behind a card.",
    frameShort: "Even field, no focal point, no edge emphasis, repeatable as a background tile.",
  },
];

// ---------- dial 2: the motif ----------
// What the softness is made of. Shape only, so any of these survives a change of style.
// Every one is botanical, celestial or geometric, per EXTRA_RULE.
export const MOTIFS = [
  {
    key: "orbs",
    label: "Colour orbs",
    shape:
      "Six to nine overlapping circular orbs of different sizes, the largest about a third of the frame height and the smallest a tenth, scattered unevenly with the clusters loose rather than in a row.",
    shapeShort: "Six to nine overlapping circles of varied size, scattered unevenly.",
  },
  {
    key: "pairs",
    label: "Out-of-focus pairs",
    shape:
      "Loose pairs of round dots, two or three pairs, each pair one larger and one smaller dot sitting close together with clear empty ground between the pairs.",
    shapeShort: "Two or three loose pairs of round dots, one large and one small, well spaced.",
  },
  {
    key: "botanical",
    label: "Botanical",
    shape:
      "A few simple leaf and stem silhouettes, broad rounded leaves on slender stems, arranged as a loose sparse spray rather than a bouquet.",
    shapeShort: "A few broad rounded leaves on slender stems, a loose sparse spray.",
  },
  {
    key: "celestial",
    label: "Celestial",
    shape:
      "A single large soft disc low in the composition with a scatter of small round points above it, like a moon and a thin field of stars.",
    shapeShort: "One large soft disc low in frame with small round points scattered above it.",
  },
  {
    key: "cycle",
    label: "Cycle",
    shape:
      "One open spiral turning outward from the centre, its stroke thickening as it uncoils, the turns evenly spaced and the spiral left open rather than closing on itself.",
    shapeShort: "One open outward spiral, stroke thickening as it uncoils, turns evenly spaced.",
  },
  {
    key: "arc",
    label: "Arc",
    shape:
      "One wide shallow arc sweeping across the composition, thicker at its centre and tapering at both ends, with two or three small round dots resting near it.",
    shapeShort: "One wide shallow arc, thicker at the centre, with two or three small dots near it.",
  },
];

// ---------- dial 3: the colourway ----------
// Look only. Each names which band accent leads and which two support it, so a set can be
// varied without any two posts reading as different brands.
export const COLOURWAYS = [
  {
    key: "periwinkle",
    label: "Periwinkle",
    palette:
      "Periwinkle #AEB9E8 leads, supported by blush #E9B9C6 and a small amount of soft yellow #F0DE86.",
  },
  {
    key: "blush",
    label: "Blush",
    palette:
      "Blush #E9B9C6 leads, supported by periwinkle #AEB9E8 and a small amount of deep plum #6B2350.",
  },
  {
    key: "yellow",
    label: "Soft yellow",
    palette:
      "Soft yellow #F0DE86 leads, supported by blush #E9B9C6 and a small amount of periwinkle #AEB9E8.",
  },
  {
    key: "plum",
    label: "Plum",
    palette:
      "Deep plum #6B2350 leads as the darkest mass, supported by periwinkle #AEB9E8 and blush #E9B9C6, and it stays a soft mass rather than a solid block.",
  },
];

const dial = (list, key) => (k) => (list.find((x) => x.key === k) || list[0])[key];

// ---------- styles ----------
// Soft Focus is the base and, for now, the only one. A style MAY override any constant by
// declaring a same-named field; parts() falls back to the constant when it is absent.
export const STYLES = [
  {
    key: "soft-focus",
    label: "Soft Focus",
    blurb:
      "The final EKAM direction: blurred colour masses on warm white, nothing sharp, softness carrying the discretion promise.",
    parts: (pick = {}) => {
      const compact = pick.length === "compact";
      const asset = ASSETS.find((a) => a.key === pick.asset) || ASSETS[0];
      const motif = MOTIFS.find((m) => m.key === pick.motif) || MOTIFS[0];
      const colourway = COLOURWAYS.find((c) => c.key === pick.colourway) || COLOURWAYS[0];
      return [
        compact
          ? "A soft-focus abstract colour field, an out-of-focus photograph, not an illustration and not a vector graphic."
          : "A soft-focus abstract colour field: an out-of-focus photograph of coloured light, not an illustration, not a vector graphic, not a digital gradient mesh and not a painting.",
        compact ? motif.shapeShort : motif.shape,
        compact ? asset.frameShort : asset.frame,
        colourway.palette,
        compact ? SOFTNESS_SHORT : SOFTNESS,
        compact ? PALETTE_RULE_SHORT : PALETTE_RULE,
        compact ? GROUND_SHORT : GROUND,
        compact ? RENDER_SHORT : RENDER,
      ];
    },
  },
];

export const ekamRecipe = defineRecipe({
  key: "ekam",
  label: "EKAM",
  dials: {
    asset: { label: "Asset", values: ASSETS.map(({ key, label }) => ({ key, label })) },
    motif: { label: "Motif", values: MOTIFS.map(({ key, label }) => ({ key, label })) },
    colourway: { label: "Colourway", values: COLOURWAYS.map(({ key, label }) => ({ key, label })) },
  },
  styles: STYLES,
  extraRule: EXTRA_RULE,
  extraRuleCompact: EXTRA_RULE_COMPACT,
  tokens: TOKENS,
});

export const composeEkam = ekamRecipe.compose;
export { dial };
