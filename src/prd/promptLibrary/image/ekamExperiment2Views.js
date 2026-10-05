// Recipe for EKAM "Experiment 02": chalk-and-organic block-print ornament, as a second
// sandbox alongside Experiment 01 (icon badges, constellation figure). Same reference
// brochure family as Experiment 01, but drawing from EKAM's own Direction A "Block Print"
// moodboard instead: an indigo-on-oat block-print grid (starburst, fern, seated figure
// with flower), documented in Claude/EKAM Art Direction/art-direction.md and
// design-system.md. Block Print was explored and retired in favour of Soft Focus
// (ekamViews.js), so this page is explicitly NOT a revival of that direction; it is a
// second sandbox testing the chalk/organic render register the same way Experiment 01
// tested icons and figures.
//
// The discretion call already made for this exact source (art-direction.md, "The
// judgment call worth flagging"): the strongest reference contains explicit vulva motifs
// and nude figures, which conflicts with the brand's discretion promise for its primary
// patient. The resolution taken there, and carried forward here, is to keep the
// LANGUAGE (symmetry, indigo-on-oat, folk ornament, hand-carved warmth) and drop the
// nude/genital figures entirely, same as EXTRA_RULE already enforces for Soft Focus. So
// this experiment's motifs are non-figurative: starburst, fern and a vase-and-bud shape
// (the reference's seated-figure silhouette read as an abstract vessel rather than a body).
import { defineRecipe } from "./recipe.js";
import { EXTRA_RULE, EXTRA_RULE_COMPACT } from "./ekamViews.js";

export const COMPACT_LIMIT = 1000;

// Direction A "Block Print" tokens, sourced 2026-08-21 from
// Claude/EKAM Art Direction/design-system.md (the brand's own retired-but-documented
// direction, built from the same reference board this experiment draws on).
export const TOKENS = [
  ["Ground", "#EDE5D6", "warm oat, aged paper"],
  ["Ink", "#2E3A78", "block-print indigo"],
  ["Body ink", "#4C5480", "muted indigo"],
  ["Accent", "#7A2E52", "plum, used sparingly"],
];

export const GROUND =
  "The whole image sits on one warm oat ground, #EDE5D6, an even flat field reading like aged paper, with a faint uneven grain across it but no visible border, vignette or torn edge.";
export const GROUND_SHORT = "Flat warm oat #EDE5D6 ground, faint even grain, no border or vignette.";

// Chalk-and-block-print render vocabulary, sourced 2026-08-21 (research/ekam.md,
// "Experiment 02" section): a hand-carved relief block prints unevenly because ink sits
// higher on some parts of the raised surface than others, which is the real physical
// cause of the mottled, speckled fill a block print shows [9]; digital "chalk texture"
// vocabulary independently converges on the same descriptive words, grainy, gritty,
// dusty, mottled, for a soft particulate surface [10]. Naming both origins in one clause
// means the fill is asked for as a real physical texture, not as a vague "textured" filter.
export const CHALK_FILL =
  "Every shape is filled with a single flat colour but the fill is not perfectly even: it carries a soft chalky grain, a fine dusty mottling of slightly lighter and darker patches within the same colour, the texture a hand-carved block leaves when ink sits unevenly across a raised surface. No gradient, no smooth digital fill, no photographic texture, no paper-scan artefacts, no visible dust particles as distinct objects, just the grain within the colour itself.";
export const CHALK_FILL_SHORT =
  "Flat colour with soft chalky grain, uneven dusty mottling within the fill, block-print ink texture, no smooth digital fill, no gradient.";

export const LINE_QUALITY =
  "Every outline is a single confident hand-carved line, slightly irregular in width along its length the way a carved block edge is, never a perfectly even vector stroke, and every shape sits in flat two-tone silhouette, ink against ground, with no interior linework and no shading beyond the chalky grain.";
export const LINE_QUALITY_SHORT =
  "Hand-carved irregular line width, flat two-tone silhouette, no interior linework, no shading beyond the chalky grain.";

export const RENDER =
  "A clean scan-quality illustration, evenly lit with no directional shadow, no gloss, no 3D bevel, no drop shadow, no frame, no mockup, no hand, nothing else in the frame.";
export const RENDER_SHORT =
  "Clean scan-quality illustration, no directional shadow, no gloss, no 3D, no frame, nothing else in frame.";

// ---------- dial: motif ----------
// Two families, one dial. The first three are pure decoration carried from the reference
// board, non-figurative per the discretion note above: the reference's seated-figure
// motif is read here as an abstract vase-and-bud shape rather than a body. The eight
// after them are lived-detail objects, the day to day of PCOS carried by an object
// rather than by a drawing of a body. See the block comment above that group.
export const MOTIFS = [
  {
    key: "starburst",
    label: "Starburst",
    shape:
      "One symmetric eight-point starburst, each point a soft elongated petal-like wedge tapering to a rounded tip, radiating evenly from a small circular centre.",
    shapeShort: "One symmetric eight-point starburst, soft tapering petal wedges, small round centre.",
  },
  {
    key: "fern",
    label: "Fern",
    shape:
      "One upright fern frond, a central stem with paired rounded leaflets stepping up its length in a loose herringbone, the whole shape narrower at the top.",
    shapeShort: "One upright fern frond, paired rounded leaflets in a loose herringbone up a central stem.",
  },
  {
    key: "vase-bud",
    label: "Vase & bud",
    shape:
      "One rounded vase-like vessel, wider at the base and narrowing gently toward the neck, with a single simple flower bud of three or four rounded petals resting at its mouth, the whole shape symmetric and abstract, not a figure.",
    shapeShort: "One rounded vessel narrowing to a neck, a simple rounded-petal bud at its mouth, abstract, not a figure.",
  },

  // ---------- the lived-detail ornaments ----------
  // The three above are pure decoration, carried from the reference board. These eight
  // come from a list of the things PCOS actually looks like day to day (a calendar that
  // skips, hair in the comb, the aunt's comment about weight, the "shaadi ke baad theek
  // ho jaayega" line). They are written as OBJECTS on purpose. The brand's own principle
  // is ornament, not diagram (art-direction.md), and EXTRA_RULE bars anatomy, clinical
  // imagery and anything uncomfortable on a phone in a shared room, so a lived experience
  // that lives ON a woman's body (chin hair, jaw acne, a scan report) is carried here by
  // the object beside her rather than by drawing the body itself. That is the same
  // resolution the art direction already took for the block-print reference, applied to a
  // harder set of subjects.
  //
  // Block-print grounding, sourced 2026-08-21 (research/ekam.md, Experiment 02 objects):
  // "buti" is the attested term for exactly this, a small single isolated motif [11], and
  // "jaal" for a net or trellis grid [11][12], which is what the gapped calendar is. The
  // marigold has its own named motif, "genda buti" [11]. The mirror, comb, balance and
  // pod are NOT attested traditional block-print motifs; they are new objects drawn in
  // the block-print language, and are marked as such rather than dressed up as heritage.
  {
    key: "gapped-grid",
    label: "Gapped grid",
    shape:
      "An even trellis grid of small rounded squares, five across and five down, with four or five squares simply absent from the grid in an irregular scatter and one square doubled up as a pair sitting in a single cell, the gaps left as bare ground rather than outlined.",
    shapeShort:
      "A five by five grid of small rounded squares, four or five squares missing in an irregular scatter, one cell holding a doubled pair, gaps left as bare ground.",
  },
  {
    key: "hand-mirror",
    label: "Hand mirror",
    shape:
      "One small oval hand mirror with a short straight handle, standing upright, its face left as empty ground inside the oval, with a single fine curved stray line resting across the lower part of the oval.",
    shapeShort:
      "One upright oval hand mirror with a short handle, face left empty, one fine curved stray line across its lower part.",
  },
  {
    key: "comb",
    label: "Comb",
    shape:
      "One wide comb seen face on, its teeth an even row of short parallel prongs along the lower edge, with three or four long loose strands curling away from the teeth in slow open curves.",
    shapeShort:
      "One wide comb face on, even row of short parallel teeth, three or four long strands curling loose from it.",
  },
  {
    key: "crescent",
    label: "Crescent",
    shape:
      "One clean crescent moon, thick at its belly and tapering to fine points at both horns, with three small round dots of varying size resting in a loose line along the inside of its curve.",
    shapeShort:
      "One crescent moon tapering to fine horns, three small round dots of varied size along the inside of its curve.",
  },
  {
    key: "low-sun",
    label: "Low sun",
    shape:
      "One half disc sitting on a single straight horizon line, a sun already half set, with short straight rays radiating from it, the rays clearly longer on one side and shortening to stubs on the other.",
    shapeShort:
      "One half disc on a straight horizon line, a half set sun, straight rays longer on one side and shortening to stubs on the other.",
  },
  {
    key: "balance",
    label: "Balance",
    shape:
      "One traditional two pan balance hanging from a straight horizontal beam on a central post, both shallow pans level with each other and both left completely empty, the suspension lines fine and straight.",
    shapeShort:
      "One two pan balance on a central post, beam straight, both shallow pans level and empty, fine straight suspension lines.",
  },
  {
    key: "seed-pod",
    label: "Seed pod",
    shape:
      "One rounded seed pod shown cut open, a plump symmetric fruit form with a small stem and two small leaves at the top, its interior holding a close cluster of eight or nine small round seeds. This is a pomegranate style folk fruit motif and nothing else: not an ovary, not a cross section of a body, not a scan or a diagram.",
    shapeShort:
      "One rounded pomegranate style seed pod cut open, small stem and two leaves on top, a cluster of eight or nine small round seeds inside, a fruit motif and not an ovary or a diagram.",
  },
  {
    key: "garland",
    label: "Marigold garland",
    shape:
      "One marigold garland hung as a shallow open loop, a fine string threaded through a close row of round many petalled marigold heads of even size, the loop dipping gently at its centre and the two ends left hanging free.",
    shapeShort:
      "One marigold garland as a shallow hanging loop, round many petalled heads of even size threaded on a fine string, ends left free.",
  },
];

const chalkPrintStyle = {
  key: "chalk-print",
  label: "Chalk Print",
  blurb: "Organic, hand-carved block-print ornament with a chalky mottled fill, indigo on oat, testing a texture register against Experiment 01's soft-focus blur.",
  parts: (pick = {}) => {
    const compact = pick.length === "compact";
    const motif = MOTIFS.find((m) => m.key === pick.motif) || MOTIFS[0];
    return [
      compact
        ? "A folk block-print ornament, flat two-tone illustration, not a photograph and not a soft-focus blur."
        : "A folk block-print ornament: a flat two-tone illustration in the language of a hand-carved relief print, not a photograph, not a soft-focus blur, not a smooth vector graphic.",
      compact ? motif.shapeShort : motif.shape,
      "Drawn in one flat block-print indigo, #2E3A78.",
      compact ? LINE_QUALITY_SHORT : LINE_QUALITY,
      compact ? CHALK_FILL_SHORT : CHALK_FILL,
      compact ? GROUND_SHORT : GROUND,
      compact ? RENDER_SHORT : RENDER,
    ];
  },
};

export const EXPERIMENT2_STYLES = [chalkPrintStyle];

export const ekamExperiment2Recipe = defineRecipe({
  key: "ekam-experiment-2",
  label: "EKAM Experiment 02",
  dials: {
    motif: { label: "Motif", values: MOTIFS.map(({ key, label }) => ({ key, label })) },
  },
  styles: EXPERIMENT2_STYLES,
  extraRule: EXTRA_RULE,
  extraRuleCompact: EXTRA_RULE_COMPACT,
  tokens: TOKENS,
});
