// The Socials library: one palette for social posts, every ratio computed from
// palette.data.js at render time.
import { PRINCIPLE, CORE, SUPPORTS, SERIES } from "./palette.data.js";
import { ratio, fmt, verdict, bestType, combinations } from "../contrast.js";
import { deriveRamp } from "../oklch.js";

const FAMILY = "Socials";
const [PAPER, INK, PLUM] = CORE.map((c) => c.hex);
const ALL = [...CORE, ...SUPPORTS];

const overview = {
  id: "cs-socials-palette",
  family: FAMILY,
  group: "Palette",
  eyebrow: "Socials · Palette",
  title: "Warm paper, dark ink, one plum voice",
  summary: PRINCIPLE[0],
  Principle: PRINCIPLE.slice(1),
  "The palette": {
    swatches: ALL.map((c) => ({ label: c.label, hex: c.hex, on: bestType(c.hex, INK, PAPER), note: c.role })),
  },
  "Computed audit": [
    verdict("Ink type on Paper", INK, PAPER),
    verdict("Paper type on Ink", PAPER, INK),
    verdict("Plum type on Paper", PLUM, PAPER),
    verdict("Paper type on Plum", PAPER, PLUM),
    verdict("Plum as a graphic on Ink", PLUM, INK, "graphic"),
    ...SUPPORTS.flatMap((c) => [
      verdict(`${bestType(c.hex, INK, PAPER) === INK ? "Ink" : "Paper"} type on ${c.label}`, bestType(c.hex, INK, PAPER), c.hex),
      verdict(`${c.label} as a graphic on Paper`, c.hex, PAPER, "graphic"),
    ]),
  ],
  "Why Plum, not the page accent": [
    `The socials page accent #B5487E reads ${fmt(ratio("#B5487E", PAPER))} on Paper, under 4.5:1. Plum ${PLUM} is the same hue darkened, at ${fmt(ratio(PLUM, PAPER))}.`,
    "Marigold and Coral are too light for Paper type, so they only ever carry Ink.",
  ],
  Sources: ["Seeded from src/socials.local.jsx (.soc__accent #b5487e). All other values chosen by measured contrast, 2026-09-16."],
};

const combos = {
  id: "cs-socials-combinations",
  family: FAMILY,
  group: "Palette",
  eyebrow: "Socials · Palette",
  title: "Every pair, computed",
  summary: "Every colour as type on every other. Use a pair that clears 4.5:1 for captions, 3:1 for headlines over 24px.",
  Matrix: { matrix: combinations(ALL) },
};

const series = {
  id: "cs-socials-series",
  family: FAMILY,
  group: "Palette",
  eyebrow: "Socials · Palette",
  title: "Series colours · one per content pillar",
  summary: "A grid of posts should sort itself by colour. Each pillar gets a ground and the type that clears on it.",
  Swatches: { swatches: SERIES.map((s) => ({ label: s.label, hex: s.bg, on: s.fg })) },
  "Computed audit": SERIES.map((s) => verdict(`${s.label}: type on ground`, s.fg, s.bg)),
};

const plumRamp = deriveRamp(PLUM);
const ramp = {
  id: "cs-socials-plum-ramp",
  family: FAMILY,
  group: "Palette",
  eyebrow: "Socials · Palette",
  title: "Plum ramp · tints for backgrounds and charts",
  summary: "Derived in OKLCH around Plum at 500, for soft backgrounds, chart steps and hover tints.",
  Ramp: { swatches: Object.entries(plumRamp).map(([k, hex]) => ({ label: `Plum ${k}`, hex, on: bestType(hex, INK, PAPER) })) },
};

export const socialsSpecs = [overview, combos, series, ramp];
