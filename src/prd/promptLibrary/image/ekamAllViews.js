// One EKAM generator: every style the brand has explored, behind a single style dial
// plus one object dial, replacing the eleven separate catalog pages this group used to
// render. The prose that used to sit on those pages now lives in
// Claude/EKAM Art Direction/prompt-library-ekam.md and is deliberately not rendered.
//
// Four styles, three of which already existed as their own recipe:
//   soft-focus  - the adopted direction (ekamViews.js): blurred colour masses on warm white.
//   chalk-print - Experiment 02 (ekamExperiment2Views.js): hand-carved block-print grain.
//   icon-badge  - Experiment 01 (ekamExperimentViews.js): flat line icon in a circle badge.
//   figure      - Experiment 01: flat silhouette with a constellation overlay.
//
// Each style declares which dials it reads, so the picker can show only the dials that
// actually change that style's output rather than a fixed grid of mostly-inert controls.
import { defineRecipe } from "./recipe.js";
import {
  ASSETS,
  MOTIFS as SOFT_MOTIFS,
  COLOURWAYS as SOFT_COLOURWAYS,
  STYLES as SOFT_STYLES,
  EXTRA_RULE,
  EXTRA_RULE_COMPACT,
  TOKENS as SOFT_TOKENS,
} from "./ekamViews.js";
import {
  ICON_SUBJECTS,
  ICON_COLOURWAYS,
  EXPERIMENT_STYLES,
} from "./ekamExperimentViews.js";
import {
  MOTIFS as CHALK_MOTIFS,
  EXPERIMENT2_STYLES,
  TOKENS as CHALK_TOKENS,
} from "./ekamExperiment2Views.js";
import {
  FRAMINGS,
  MOMENTS,
  LIGHTS,
  REAL_OBJECTS,
  SURFACES,
  STILL_LIGHTS,
  REAL_STYLES,
  TOKENS as REAL_TOKENS,
} from "./ekamRealViews.js";

export const COMPACT_LIMIT = 1000;

const softFocus = SOFT_STYLES.find((s) => s.key === "soft-focus");
const iconBadge = EXPERIMENT_STYLES.find((s) => s.key === "icon-badge");
const figure = EXPERIMENT_STYLES.find((s) => s.key === "constellation-figure");
const chalkPrint = EXPERIMENT2_STYLES.find((s) => s.key === "chalk-print");
const realPortrait = REAL_STYLES.find((s) => s.key === "real-portrait");
const realStillLife = REAL_STYLES.find((s) => s.key === "real-still-life");

// Which dials each style actually reads, and what to offer in each. `objects` is the
// one dial that changes meaning per style (a Soft Focus motif, an icon subject, a chalk
// ornament), which is why the picker labels it from here rather than hardcoding "Motif".
export const STYLE_DIALS = {
  "soft-focus": {
    objectLabel: "Motif",
    objects: SOFT_MOTIFS,
    colourways: SOFT_COLOURWAYS,
    assets: ASSETS,
    objectKey: "motif",
  },
  "chalk-print": {
    objectLabel: "Ornament",
    objects: CHALK_MOTIFS,
    colourways: null,
    assets: null,
    objectKey: "motif",
  },
  "icon-badge": {
    objectLabel: "Subject",
    objects: ICON_SUBJECTS,
    colourways: ICON_COLOURWAYS,
    assets: null,
    objectKey: "subject",
  },
  "real-portrait": {
    objectLabel: "Moment",
    objects: MOMENTS,
    colourways: LIGHTS,
    colourwayLabel: "Light",
    assets: FRAMINGS,
    assetLabel: "Framing",
    objectKey: "motif",
  },
  "real-still-life": {
    objectLabel: "Object",
    objects: REAL_OBJECTS,
    colourways: STILL_LIGHTS,
    colourwayLabel: "Light",
    assets: SURFACES,
    assetLabel: "Surface",
    objectKey: "motif",
  },
  figure: {
    objectLabel: null,
    objects: null,
    colourways: null,
    assets: null,
    objectKey: null,
  },
};

export const STYLES = [
  {
    key: "soft-focus",
    label: "Soft Focus",
    blurb:
      "The adopted EKAM direction. Blurred colour masses on warm white, nothing sharp, softness carrying the discretion promise. Warm white #F7F2EF ground, four band accents.",
    parts: softFocus.parts,
  },
  {
    key: "chalk-print",
    label: "Chalk Print",
    blurb:
      "Experiment 02. Hand-carved folk block-print ornament with a chalky mottled fill, indigo #2E3A78 on warm oat #EDE5D6. Organic texture rather than optical blur.",
    parts: chalkPrint.parts,
  },
  {
    key: "real-portrait",
    label: "Real \u00b7 portrait",
    blurb: realPortrait.blurb,
    parts: realPortrait.parts,
  },
  {
    key: "real-still-life",
    label: "Real \u00b7 still life",
    blurb: realStillLife.blurb,
    parts: realStillLife.parts,
  },
  {
    key: "icon-badge",
    label: "Icon badge",
    blurb:
      "Experiment 01. A single flat line icon in a circle badge, one clinical subject per icon. The system says icons are a drawing job, not a generation job; this tests that.",
    parts: iconBadge.parts,
  },
  {
    key: "figure",
    label: "Constellation figure",
    blurb:
      "Experiment 01. A flat plum silhouette carrying a constellation overlay and a botanical sprig. Takes no dials: one fixed composition in two registers.",
    parts: figure.parts,
  },
];

export const STYLE_META = STYLES.map(({ key, label, blurb }) => ({ key, label, blurb }));

// Both palettes, since the style dial swaps which one is in play.
export const TOKENS = [...SOFT_TOKENS, ...CHALK_TOKENS, ...REAL_TOKENS];

export const ekamAllRecipe = defineRecipe({
  key: "ekam-all",
  label: "EKAM",
  dials: {
    style: { label: "Style", values: STYLE_META.map(({ key, label }) => ({ key, label })) },
  },
  styles: STYLES,
  extraRule: EXTRA_RULE,
  extraRuleCompact: EXTRA_RULE_COMPACT,
  tokens: TOKENS,
});
