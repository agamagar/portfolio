// Recipe for EKAM's "Experiment" page: testing whether GPT Image 2 can generate the
// icon-badge and figure-illustration objects the reference brochure uses, which the
// Soft Focus system deliberately does NOT generate (see ekam.js systemSpec, "What the
// model does NOT make": icons are called out there as a drawing job, not a generation
// job). This page is a sandbox, not an adopted direction: nothing here is wired into the
// five-slot grammar, and nothing here retires Soft Focus.
//
// Two asset kinds:
//   1. Icon badge          - a single flat line icon inside a circle badge, one EKAM
//                             subject per icon (hormones, metabolism, insulin resistance,
//                             emotional wellbeing, muscle & movement, nutrition).
//   2. Constellation figure - a botanical-and-light figure illustration: a solid-colour
//                             silhouette carrying a constellation overlay and a sparse
//                             botanical spray, the illustration equivalent of the brochure's
//                             front-cover figure, kept non-anatomical per EXTRA_RULE.
import { defineRecipe } from "./recipe.js";
import { EXTRA_RULE, EXTRA_RULE_COMPACT, TOKENS } from "./ekamViews.js";

export const COMPACT_LIMIT = 1000;

// Icon-badge craft vocabulary sourced 2026-08-21 (research/ekam.md, "Experiment" section):
// wellness/medical icon sets on stock libraries converge on a pixel-perfect outline icon
// with a 2px editable stroke inside a fixed grid, badge-mounted in a circle, the same
// "even-weight stroke on a fixed grid" discipline EKAM's own hand-authored detail chips
// use at 1.6px on 24px, just asked for as a generation target instead of a drawing one.
export const ICON_GROUND =
  "The whole image sits on one warm white ground, #F7F2EF, an unbroken flat field with no vignette, no paper texture and no border.";
export const ICON_GROUND_SHORT = "One flat warm white #F7F2EF ground, no vignette, no border.";

export const ICON_RENDER =
  "A clean flat vector-style illustration, not a photograph: pixel-perfect outline icon construction, one continuous even-weight stroke throughout with no line-weight variation, rounded stroke caps and joins, centred inside a plain circular badge outline. No shading, no gradient, no drop shadow, no texture, no 3D bevel.";
export const ICON_RENDER_SHORT =
  "Flat vector line icon, one even-weight stroke, rounded caps and joins, centred in a plain circle badge, no shading, no gradient, no 3D.";

export const ICON_SUBJECTS = [
  {
    key: "hormones",
    label: "Hormones",
    shape:
      "Three small connected circles in a loose triangular cluster, joined by short straight lines, reading as a simple molecule diagram rather than any specific chemical structure.",
    shapeShort: "Three small circles in a loose triangle, joined by short lines, a simple molecule mark.",
  },
  {
    key: "metabolism",
    label: "Metabolism",
    shape:
      "A single open outward spiral of even line weight, its turns evenly spaced, echoing motion and cycling without depicting any organ or body part.",
    shapeShort: "One open outward spiral, even turns, no organ or body part.",
  },
  {
    key: "insulin-resistance",
    label: "Insulin resistance",
    shape:
      "A single rounded droplet outline with three short parallel lines radiating from one side, reading as a simple droplet-and-flow mark rather than a syringe or medical instrument.",
    shapeShort: "One rounded droplet outline with three short radiating lines, no syringe or instrument.",
  },
  {
    key: "emotional-wellbeing",
    label: "Emotional wellbeing",
    shape:
      "A simple rounded heart outline enclosing a smaller open lotus-petal mark, the two shapes concentric and both left as pure line, no face and no figure.",
    shapeShort: "A rounded heart outline enclosing a small open lotus-petal mark, both pure line, no face.",
  },
  {
    key: "muscle-movement",
    label: "Muscle & movement",
    shape:
      "A single figure caught mid-stride in profile, reduced to one continuous unbroken contour line with no interior detail, no facial features and no musculature, closer to a pictogram than a drawing of a body.",
    shapeShort: "One continuous-contour running pictogram in profile, no interior detail, no face, no musculature.",
  },
  {
    key: "nutrition",
    label: "Nutrition",
    shape:
      "A single simple leaf outline resting inside a shallow open bowl outline, both pure line with no interior shading.",
    shapeShort: "One simple leaf outline resting in a shallow open bowl outline, pure line, no shading.",
  },
];

// EKAM's four band accents, each usable as the one flat accent fill inside an otherwise
// line-only badge, per the colourway dial already established in ekamViews.js.
export const ICON_COLOURWAYS = [
  { key: "periwinkle", label: "Periwinkle", fill: "periwinkle #AEB9E8" },
  { key: "blush", label: "Blush", fill: "blush #E9B9C6" },
  { key: "yellow", label: "Soft yellow", fill: "soft yellow #F0DE86" },
  { key: "plum", label: "Plum", fill: "deep plum #6B2350" },
];

const iconStyle = {
  key: "icon-badge",
  label: "Icon badge",
  blurb: "A single flat line icon in a circle badge, one EKAM subject per icon, testing generation against the system's hand-drawn icon rule.",
  parts: (pick = {}) => {
    const compact = pick.length === "compact";
    const subject = ICON_SUBJECTS.find((s) => s.key === pick.subject) || ICON_SUBJECTS[0];
    const colourway = ICON_COLOURWAYS.find((c) => c.key === pick.colourway) || ICON_COLOURWAYS[0];
    return [
      compact
        ? "A single flat line icon inside a circle badge, ink #5A2340."
        : "A single flat line icon inside a plain circle badge outline, drawn in deep plum ink #5A2340.",
      compact ? subject.shapeShort : subject.shape,
      `One small area of the icon is filled solid in ${colourway.fill} as the only accent colour; everything else stays pure line.`,
      compact ? ICON_GROUND_SHORT : ICON_GROUND,
      compact ? ICON_RENDER_SHORT : ICON_RENDER,
    ];
  },
};

// Constellation-figure craft vocabulary sourced 2026-08-21 (research/ekam.md, "Experiment"
// section): "constellation overlay on a human silhouette" is an established stock/branding
// trope (glowing points and connecting lines traced across a solid silhouette), which is
// what the brochure's front-cover figure is doing under a botanical spray. Kept
// non-anatomical per EXTRA_RULE by staying a flat silhouette with no skin rendering, no
// facial detail and no exposed-body framing.
export const FIGURE_RENDER =
  "A flat solid-colour silhouette of a woman's head, neck and upper shoulders in gentle three-quarter profile, modestly cropped above the collarbone, eyes closed, no facial detail beyond the closed eyes and the line of the profile, no skin texture and no rendering of the body beneath the shoulder line. The silhouette is filled in one flat deep plum #5A2340, no gradient inside the fill.";
export const FIGURE_RENDER_SHORT =
  "Flat plum #5A2340 silhouette, head and shoulders, three-quarter profile, closed eyes, cropped above the collarbone, no skin rendering below the shoulder.";

export const FIGURE_OVERLAY =
  "Small glowing points of light are scattered across the silhouette and just beyond its edge, each pair or cluster of points joined by a thin straight line, reading as a constellation traced over the figure rather than any nerve, vein or anatomical pathway. The points sit in periwinkle #AEB9E8 and soft yellow #F0DE86, softly luminous against the plum fill.";
export const FIGURE_OVERLAY_SHORT =
  "Small glowing points in periwinkle #AEB9E8 and soft yellow #F0DE86, joined by thin lines into a constellation over the silhouette, not a nerve or vein diagram.";

export const FIGURE_BOTANICAL =
  "A few simple botanical line sprigs, one or two slender stems with rounded leaves, drawn in pure line and woven loosely through the hair and along the shoulder, the same broad rounded leaf language as the Soft Focus botanical motif.";
export const FIGURE_BOTANICAL_SHORT =
  "A few slender-stem, rounded-leaf sprigs in pure line, woven through the hair and shoulder.";

const figureStyle = {
  key: "constellation-figure",
  label: "Constellation figure",
  blurb: "A flat silhouette figure carrying a constellation overlay and a botanical sprig, the illustration counterpart to the brochure's front-cover figure.",
  parts: (pick = {}) => {
    const compact = pick.length === "compact";
    return [
      compact
        ? "A flat vector-style figure illustration, not a photograph and not a soft-focus field."
        : "A flat vector-style figure illustration: clean geometric silhouette work, not a photograph, not the Soft Focus defocused-photograph look used elsewhere in this system.",
      compact ? FIGURE_RENDER_SHORT : FIGURE_RENDER,
      compact ? FIGURE_OVERLAY_SHORT : FIGURE_OVERLAY,
      compact ? FIGURE_BOTANICAL_SHORT : FIGURE_BOTANICAL,
      compact ? ICON_GROUND_SHORT : ICON_GROUND,
      "Clean flat render, no photographic lighting, no grain, no drop shadow, no frame, nothing else in the frame.",
    ];
  },
};

export const EXPERIMENT_STYLES = [iconStyle, figureStyle];

export const ekamExperimentRecipe = defineRecipe({
  key: "ekam-experiment",
  label: "EKAM Experiment",
  dials: {
    subject: { label: "Icon subject", values: ICON_SUBJECTS.map(({ key, label }) => ({ key, label })) },
    colourway: { label: "Accent", values: ICON_COLOURWAYS.map(({ key, label }) => ({ key, label })) },
  },
  styles: EXPERIMENT_STYLES,
  extraRule: EXTRA_RULE,
  extraRuleCompact: EXTRA_RULE_COMPACT,
  tokens: TOKENS,
});
