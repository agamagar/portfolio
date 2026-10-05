// The Away library: the brand palette from the guidelines, the in-product palette from
// the app source, and the reconciliation between them and the Figma library. Every
// ratio and every ramp verdict is computed here from the data files.
import { PRINCIPLE, NEUTRALS, SKY, SECONDARIES } from "./brand.data.js";
import { RAMPS, DARK_NEUTRAL, FEEDBACK, SURFACES, CUSTOM } from "./product.data.js";
import { FIGMA } from "./figma.data.js";
import { ratio, fmt, passes, verdict, reversals, bestType, combinations, level } from "../contrast.js";

const FAMILY = "Away";
const WHITE = "#FFFFFF";
const BLACK = "#000000";
const INK = NEUTRALS.find((n) => n.key === "grey-800").hex; // the brand's own near-black

const sw = (c, on, note) => ({ label: c.label, hex: c.hex, on, note });

// ---- Brand ---------------------------------------------------------------------

const brandOverview = {
  id: "cs-away-brand",
  family: FAMILY,
  group: "Brand",
  eyebrow: "Away · Brand",
  title: "A neutral brand with one bright note",
  summary: PRINCIPLE[0],
  Principle: PRINCIPLE.slice(1),
  "The palette": {
    swatches: [
      ...NEUTRALS.map((c) => sw(c, bestType(c.hex, INK))),
      ...SKY.map((c) => sw(c, bestType(c.hex, INK), "primary accent")),
      ...SECONDARIES.map((c) => sw(c, bestType(c.hex, INK), "secondary")),
    ],
  },
  "How to read a swatch": [
    "The sample type on each tile is whichever of white or Grey 800 reads better on it; the badge is that pair's computed ratio.",
    "Body and UI text needs 4.5:1. Display type and graphical objects need 3:1.",
  ],
  Sources: [
    "Away Brand Guidelines, Color (Brand Book/Color/color_2.pdf, color_3.pdf). Hex from the PDF text layer, checked against the rendered page.",
  ],
};

const neutralsSpec = {
  id: "cs-away-neutrals",
  family: FAMILY,
  group: "Brand",
  eyebrow: "Away · Brand",
  title: "Neutrals · black, white, eight greys",
  summary: "The ground the brand stands on. Most of what Away puts on the page lives here.",
  "On white": { swatches: NEUTRALS.filter((c) => c.key !== "white").map((c) => ({ label: c.label, hex: WHITE, on: c.hex })) },
  "On black": { swatches: NEUTRALS.filter((c) => c.key !== "black").map((c) => ({ label: c.label, hex: BLACK, on: c.hex })) },
  "Computed audit": [
    ...NEUTRALS.filter((c) => c.key !== "white").map((c) => verdict(`${c.label} type on white`, c.hex, WHITE)),
    ...NEUTRALS.filter((c) => c.key !== "black").map((c) => verdict(`${c.label} type on black`, c.hex, BLACK)),
    (() => {
      const bad = reversals(Object.fromEntries(NEUTRALS.filter((c) => c.key.startsWith("grey")).map((c) => [c.key.split("-")[1], c.hex])));
      return bad.length ? `Grey ramp reverses at ${bad.join(", ")}` : "Grey 100 to 800 is strictly monotonic in luminance.";
    })(),
  ],
  "Print values": NEUTRALS.map((c) => `${c.label}: ${c.hex}, CMYK ${c.cmyk}`),
};

const skySpec = {
  id: "cs-away-sky",
  family: FAMILY,
  group: "Brand",
  eyebrow: "Away · Brand",
  title: "Sky · the primary accent",
  summary: "One clear modern note against the neutrals, used sparingly and always intentionally. Three depths.",
  Swatches: {
    swatches: SKY.flatMap((c) => [sw(c, WHITE), sw(c, INK)]),
  },
  "Computed audit": SKY.flatMap((c) => [
    verdict(`White type on ${c.label}`, WHITE, c.hex),
    verdict(`Grey 800 type on ${c.label}`, INK, c.hex),
    verdict(`${c.label} as a graphic on white`, c.hex, WHITE, "graphic"),
    verdict(`${c.label} as a graphic on black`, c.hex, BLACK, "graphic"),
  ]),
  "What the audit says": [
    `Sky (${SKY[1].hex}) carries Grey 800 type at ${fmt(ratio(INK, SKY[1].hex))} but not white (${fmt(ratio(WHITE, SKY[1].hex))}), and as a graphic it clears 3:1 on black, not on white. So it is the accent on dark ground with dark type, never white-on-Sky.`,
    `Dark Sky (${SKY[2].hex}) is the depth that carries white type, at ${fmt(ratio(WHITE, SKY[2].hex))}.`,
    `Light Sky (${SKY[0].hex}) is a surface: Grey 800 type on it reads at ${fmt(ratio(INK, SKY[0].hex))}.`,
  ],
  "Print values": SKY.map((c) => `${c.label}: ${c.hex}, CMYK ${c.cmyk}`),
};

const secondariesSpec = {
  id: "cs-away-secondaries",
  family: FAMILY,
  group: "Brand",
  eyebrow: "Away · Brand",
  title: "Secondaries · Midnight, Glow, Basil",
  summary: "For the moments the brand wants to widen its voice. Editorial, campaign and expressive contexts. Never as decoration.",
  Swatches: { swatches: SECONDARIES.flatMap((c) => [sw(c, WHITE), sw(c, INK)]) },
  "Computed audit": SECONDARIES.flatMap((c) => [
    verdict(`White type on ${c.label}`, WHITE, c.hex),
    verdict(`Grey 800 type on ${c.label}`, INK, c.hex),
    verdict(`${c.label} as a graphic on white`, c.hex, WHITE, "graphic"),
    verdict(`${c.label} as a graphic on black`, c.hex, BLACK, "graphic"),
  ]),
  "Print values": SECONDARIES.map((c) => `${c.label}: ${c.hex}, CMYK ${c.cmyk}`),
};

// ---- Product -------------------------------------------------------------------

const rampSwatches = (steps) =>
  Object.entries(steps).map(([k, hex]) => ({ label: k, hex, on: bestType(hex, "#161616") }));

const rampAudit = (label, steps) => {
  const bad = reversals(steps);
  const lines = [bad.length ? `${label} reverses in luminance at ${bad.join(", ")}.` : `${label} is strictly monotonic in luminance, 50 to 950.`];
  const holdsWhite = Object.entries(steps).filter(([, h]) => passes(ratio(WHITE, h), "body")).map(([k]) => k);
  const holdsInk = Object.entries(steps).filter(([, h]) => passes(ratio("#161616", h), "body")).map(([k]) => k);
  lines.push(`White body text holds on: ${holdsWhite.length ? holdsWhite.join(", ") : "none"}.`);
  lines.push(`Neutral 900 (#161616) body text holds on: ${holdsInk.length ? holdsInk.join(", ") : "none"}.`);
  return lines;
};

const productOverview = {
  id: "cs-away-product",
  family: FAMILY,
  group: "Product",
  eyebrow: "Away · Product",
  title: "The in-product palette · twelve ramps",
  summary:
    "The app's own palette, copied from src/core/theme/palettes.ts by a script. Eleven hue ramps and a neutral, each 50 to 950 in the light theme; the dark theme reverses every ramp except the neutral, which has hand-set dark steps. Feedback colours and surfaces are aliases into these ramps.",
  "The 500s": {
    swatches: RAMPS.filter((r) => r.key !== "neutralBw").map((r) => ({ label: r.label, hex: r.steps[500], on: bestType(r.steps[500], "#161616") })),
  },
  Feedback: {
    swatches: FEEDBACK.map((f) => {
      const r = RAMPS.find((x) => x.key === f.ramp);
      return { label: `${f.label} (light)`, hex: r.steps[f.light], on: WHITE, note: `${r.label} ${f.light}` };
    }),
  },
  "Computed audit": [
    ...FEEDBACK.map((f) => {
      const r = RAMPS.find((x) => x.key === f.ramp);
      return verdict(`White type on ${f.label} (${r.label} ${f.light})`, WHITE, r.steps[f.light]);
    }),
    ...RAMPS.map((r) => {
      const bad = reversals(r.steps);
      return bad.length ? `${r.label} reverses at ${bad.join(", ")}` : `${r.label}: monotonic`;
    }),
  ],
  "What the audit says": [
    `All four feedback 500s hold white type only at display size: ${FEEDBACK.map((f) => { const r = RAMPS.find((x) => x.key === f.ramp); return `${f.label} ${fmt(ratio(WHITE, r.steps[f.light]))}`; }).join(", ")}. Body-size white labels on a feedback fill need the 600 step.`,
    "Every ramp is strictly monotonic in luminance, so none trips the Zepto invariant.",
  ],
  "Surface aliases": [
    `Light: background Neutral ${SURFACES.light.background}, secondary ${SURFACES.light.backgroundSecondary}, text ${SURFACES.light.text}, secondary text ${SURFACES.light.textSecondary}, tertiary ${SURFACES.light.textTertiary}, border ${SURFACES.light.border}.`,
    `Dark: background Neutral ${SURFACES.dark.background}, secondary ${SURFACES.dark.backgroundSecondary}, text ${SURFACES.dark.text}, secondary text ${SURFACES.dark.textSecondary}, tertiary ${SURFACES.dark.textTertiary}, border ${SURFACES.dark.border}.`,
    `Three values sit outside the ramps as customColors: ${CUSTOM.map((c) => `${c.label} ${c.hex}`).join(", ")}.`,
  ],
  Sources: ["~/away/away-app/src/core/theme/palettes.ts and semantic.ts (read 2026-09-07)."],
};

const rampSpecs = RAMPS.map((r) => ({
  id: `cs-away-ramp-${r.key}`,
  family: FAMILY,
  group: "Product",
  eyebrow: "Away · Product",
  title: `${r.label} · ${r.steps[500]}`,
  summary: r.key === "neutralBw" ? "The neutral ramp. Surfaces, text and borders all alias into it; the dark theme has its own steps rather than a reversal." : `The ${r.label.toLowerCase()} ramp, 50 to 950. Sample type on each step is whichever of white or Neutral 900 reads better.`,
  "Light ramp": { swatches: rampSwatches(r.steps) },
  ...(r.key === "neutralBw" ? { "Dark ramp": { swatches: rampSwatches(DARK_NEUTRAL) } } : {}),
  "Computed audit": [
    ...rampAudit(r.label, r.steps),
    ...(r.key === "neutralBw" ? rampAudit("Dark neutral", DARK_NEUTRAL) : []),
  ],
}));

// ---- Reconciliation --------------------------------------------------------------

const tribal = RAMPS.find((r) => r.key === "tribalIndigo");
const reconciliationSpec = {
  id: "cs-away-reconciliation",
  family: FAMILY,
  group: "Reconciliation",
  eyebrow: "Away · Reconciliation",
  title: "Three sources, three accents",
  summary:
    "The brand book, the app source and the Figma library each carry an Away accent, and they do not agree. This section puts the three side by side so the drift is a fact on the page rather than a surprise in a review.",
  "The accents": {
    swatches: [
      { label: "Brand book: Sky", hex: SKY[1].hex, on: bestType(SKY[1].hex, INK), note: "Guidelines primary accent" },
      { label: "App: Tribal indigo 500", hex: tribal.steps[500], on: WHITE, note: "palettes.ts; no brand/accent alias in semantic.ts" },
      { label: "Figma: accent/default", hex: FIGMA.accent.default, on: WHITE, note: "Tribal Indigo per the 2026-06-20 reconciliation" },
      { label: "Figma: accent/strong", hex: FIGMA.accent.strong, on: WHITE },
      { label: "Figma: accent/muted", hex: FIGMA.accent.muted, on: WHITE },
    ],
  },
  "Computed audit": [
    verdict("White type on Sky", WHITE, SKY[1].hex),
    verdict("White type on app Tribal indigo 500", WHITE, tribal.steps[500]),
    verdict("White type on Figma accent/default", WHITE, FIGMA.accent.default),
    verdict("White type on Figma accent/strong", WHITE, FIGMA.accent.strong),
  ],
  "What disagrees": [
    `The brand book names Sky ${SKY[1].hex} as the one accent. The app palette has no sky ramp at all; its nearest hues are Glass cyan and Vivid cyan, and semantic.ts defines no brand or accent alias.`,
    `The Figma library's accent is indigo ${FIGMA.accent.default} (muted ${FIGMA.accent.muted}, strong ${FIGMA.accent.strong}), which is neither Sky nor the app's Tribal indigo 500 ${tribal.steps[500]}.`,
    `Feedback colours differ too. App light: success ${RAMPS.find((r) => r.key === "fuanaGreen").steps[500]}, warning ${RAMPS.find((r) => r.key === "earthyYellow").steps[500]}, error ${RAMPS.find((r) => r.key === "brightRed").steps[500]}, info ${RAMPS.find((r) => r.key === "vividCyan").steps[500]}. Figma light: success ${FIGMA.lightStatus.success}, warning ${FIGMA.lightStatus.warning}, error ${FIGMA.lightStatus.error}, info ${FIGMA.lightStatus.info}.`,
    `Figma dark surfaces are purple-tinted (${FIGMA.darkSurfaces.join(", ")}); the app's dark surfaces are pure neutral (${DARK_NEUTRAL[50]}, ${DARK_NEUTRAL[100]}); the visible app background and the orb are hardcoded ${FIGMA.hardcoded.appBg} and ${FIGMA.hardcoded.orb}.`,
  ],
  "Open decision": [
    "Which accent is Away's: Sky (brand), indigo (Figma), or a Tribal indigo step (app). Until that is decided, no CSS export from this library should name an accent token.",
  ],
  Sources: [
    "Brand Book/Color/color_3.pdf; ~/away/away-app/src/core/theme/{palettes,semantic}.ts; Active - Away/Claude/Figma & Tokens/2026-06-20_figma-token-reconciliation.md.",
  ],
};

// ---- Combinations ------------------------------------------------------------------

const combosSpec = (id, title, lead, palette) => {
  const m = combinations(palette);
  const pairs = palette.length * (palette.length - 1);
  const tally = { aa: 0, large: 0, fail: 0 };
  m.cells.flat().forEach((c) => c && (tally[level(c.r)] += 1));
  return {
    id,
    family: FAMILY,
    group: "Combinations",
    eyebrow: "Away · Combinations",
    title: `${title} · ${palette.length} colours, ${pairs} combinations`,
    summary: `${lead} ${tally.aa} pairs clear body text (4.5:1), ${tally.large} clear display type and graphics only (3:1), ${tally.fail} clear nothing and are dimmed. Rows are the type colour, columns the background. A ring marks a 3:1-only pair.`,
    "The matrix": { matrix: m },
    "What clears on each background": m.byBackground.map(
      ({ bg, aa, large }) => `${bg.label}: body text in ${aa.length ? aa.join(", ") : "nothing"}${large.length ? `; display only in ${large.join(", ")}` : ""}.`
    ),
  };
};

const brandCombos = combosSpec(
  "cs-away-brand-combinations",
  "Brand palette, every pair",
  "The sixteen guideline colours, each set as type on every other as background, computed at render time.",
  [...NEUTRALS, ...SKY, ...SECONDARIES].map((c) => ({ label: c.label, hex: c.hex }))
);

const productCombos = combosSpec(
  "cs-away-product-combinations",
  "Product 500s, every pair",
  "The eleven hue ramps at their 500 step, with white and Neutral 900, each set as type on every other as background.",
  [
    { label: "White", hex: WHITE },
    { label: "Neutral 900", hex: "#161616" },
    ...RAMPS.filter((r) => r.key !== "neutralBw").map((r) => ({ label: `${r.label} 500`, hex: r.steps[500] })),
  ]
);

export const awaySpecs = [brandOverview, neutralsSpec, skySpec, secondariesSpec, productOverview, ...rampSpecs, brandCombos, productCombos, reconciliationSpec];
