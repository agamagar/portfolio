// The Zepto library: six themes, five status states, ten invariants, one handoff.
// Every spec is DERIVED here from the data files plus contrast.js, so every ratio the
// page shows is computed from the hex beside it and cannot drift from the value.
import { THEMES, INK_PROBE, WHITE } from "./themes.data.js";
import { STATUS, CVD } from "./status.data.js";
import { INVARIANTS } from "./invariants.data.js";
import { RAMPS } from "./ramps.js";
import { BANNERS, TREATMENTS } from "./banners.js";
import { ratio, fmt, passes, verdict, THRESHOLDS, combinations, level } from "../contrast.js";

const FAMILY = "Zepto";
const LAVENDER = THEMES.find((t) => t.key === "lavender");

// ---- Themes -------------------------------------------------------------------

const themeAudit = (t) => {
  const lines = [
    verdict("White type on primary", WHITE, t.primary, "body"),
    verdict("White display type on primary", WHITE, t.primary, "display"),
    verdict(`Ink ${INK_PROBE} type on primary`, INK_PROBE, t.primary, "body"),
    verdict("Primary as a graphic on white", t.primary, WHITE, "graphic"),
  ];
  if (t.type700 && t.surface100)
    lines.push(verdict("700 type on the 100 surface", t.type700, t.surface100, "body"));
  if (t.deep900 && t.surface100)
    lines.push(verdict("900 as a graphic on the 100 surface", t.deep900, t.surface100, "graphic"));
  return lines;
};

const themeSwatches = (t) => {
  const sw = [
    { label: `${t.label} 500`, hex: t.primary, on: WHITE },
    { label: `${t.label} 500`, hex: t.primary, on: INK_PROBE },
  ];
  if (t.surface100) sw.push({ label: `${t.label} 100 surface`, hex: t.surface100, on: t.type700 });
  if (t.type700) sw.push({ label: `${t.label} 700 type`, hex: t.type700, on: WHITE });
  if (t.deep900) sw.push({ label: `${t.label} 900`, hex: t.deep900, on: WHITE });
  return sw;
};

const overviewSpec = {
  id: "cs-zepto-themes",
  family: FAMILY,
  group: "Themes",
  eyebrow: "Zepto · Themes",
  title: "Six themes, one audit",
  summary:
    "A six-theme colour system built from brand references: the Amazon Fresh board, the Zepto Schedule Delivery assets and the Zepto unavailability-state icons. Everything is generated, not hand-maintained. The Python scripts are the source of truth; the HTML boards and JSON tokens are outputs. On this page the primaries are the attested values and every ratio beside them is computed at render time.",
  "The six primaries": {
    swatches: THEMES.map((t) => ({ label: t.label, hex: t.primary, on: WHITE, note: t.register })),
  },
  "How to read a swatch": [
    "The tile is the colour. The sample letters are the type colour tested on it, and the badge is the computed contrast ratio.",
    `Body and UI text needs ${THRESHOLDS.body}:1. Display type and graphical objects need ${THRESHOLDS.display}:1.`,
    `Ink on this page is a probe value, ${INK_PROBE}, not a system token. Each theme's own ink lives in tokens.json.`,
  ],
  "Where the rest lives": [
    "tokens.json: 6 themes x (50-900 + ink, canvas, hot, hotdeep, warm, cool), 12 banner recipes x 6 themes, 5 unavailability states.",
    "gradients.json: 79 gradients, each with CSS and a verified text recipe.",
    "status-tokens.json: the status palette standalone.",
    "scripts/: the generators. Edit these, never the outputs. gen_tokens.py merges the others' output, so it runs last; build.sh handles the order.",
    "out/: rendered boards. Two are hand-authored, layer-lavender.html and palette-board.html; everything else is overwritten on every build.",
  ],
};

const themeSpecs = THEMES.map((t) => ({
  id: `cs-zepto-${t.key}`,
  family: FAMILY,
  group: "Themes",
  eyebrow: `Zepto · ${t.label}`,
  title: `${t.label} · ${t.primary}`,
  summary: t.register,
  Swatches: { swatches: themeSwatches(t) },
  "Computed audit": themeAudit(t),
  Caveat: t.caveat,
  Provenance: t.provenance,
}));

// ---- Status --------------------------------------------------------------------

const statusOnWhite = STATUS.map((s) => ({ label: `${s.label} 500`, hex: s.s500, on: WHITE, note: s.hue }));
const statusOnTint = STATUS.map((s) => ({
  label: `${s.label} 700`,
  hex: LAVENDER.surface100,
  on: s.s700,
  note: `${s.hue} on lavender 100`,
}));
const status500OnTint = STATUS.map((s) => ({
  label: `${s.label} 500`,
  hex: LAVENDER.surface100,
  on: s.s500,
  note: `${s.hue} on lavender 100`,
}));

const failing500 = STATUS.filter((s) => !passes(ratio(s.s500, LAVENDER.surface100), "graphic"));

const statusSpec = {
  id: "cs-zepto-status",
  family: FAMILY,
  group: "Status",
  eyebrow: "Zepto · Status",
  title: "The five unavailability states",
  summary:
    "Hue encodes domain, depth encodes severity. 500 is the icon on white. 700 is the label plus icon on a tinted surface. Colour is the third signal: every state also has a distinct icon and an explicit label.",
  "500 · icon on white": { swatches: statusOnWhite },
  "700 · label and icon on tint": { swatches: statusOnTint },
  "Computed audit": [
    ...STATUS.map((s) => verdict(`${s.label} 500 on white`, s.s500, WHITE, "graphic")),
    ...STATUS.map((s) => verdict(`${s.label} 700 on lavender 100`, s.s700, LAVENDER.surface100, "body")),
  ],
  "Surface dependence": [
    `Status 500 works on white. On the lavender card (${LAVENDER.surface100}) ${failing500.length} of the five cannot hold 3:1: ${failing500.map((s) => `${s.label} at ${fmt(ratio(s.s500, LAVENDER.surface100))}`).join(", ")}. Tinted surfaces use 700.`,
    "Knockout shapes take the surface colour, not hard-coded white, or the exclamation mark inside the Disruptions hexagon vanishes on a solid badge.",
  ],
  "500 on the tint, for the record": { swatches: status500OnTint },
  "Dichromatic vision": [
    `Worst-case pair after optimisation: dE ${CVD.worstPairDeltaE} (CIE76 after Viénot LMS projection for protanopia, deuteranopia and tritanopia). Anything under about ${CVD.confusableBelow} is confusable.`,
    `The first hand-picked set scored ${CVD.firstHandPickedSet}. ${CVD.note}`,
    "Five hue-coded categories is the ceiling. Do not add a sixth status hue; extend by severity tier instead. Adding or changing a status colour means re-running optimise2.py.",
  ],
};

// ---- Invariants ----------------------------------------------------------------

const invariantsSpec = {
  id: "cs-zepto-invariants",
  family: FAMILY,
  group: "Invariants",
  eyebrow: "Zepto · Invariants",
  title: "Ten rules, each learned by breaking it",
  summary:
    "The scripts assert most of these. Keep the asserts. The build prints a contrast audit and build.sh aborts on any non-zero failure count; never ship outputs from a run that reported failures. The build is deterministic: two consecutive runs produce byte-identical JSON.",
  ...Object.fromEntries(INVARIANTS.map((inv, i) => [`${i + 1}. ${inv.rule}`, inv.why])),
};

// ---- Ramps and the banner matrix (the board) -------------------------------------

const rampsSpec = {
  id: "cs-zepto-ramps",
  family: FAMILY,
  group: "Banners",
  eyebrow: "Zepto · Ramps",
  title: "Six ramps · 50 to 900",
  summary:
    "Each theme as a ten-step ramp with the attested primary held at 500. DERIVED on this page in OKLCH from the primary (a same-hue near-white down to the primary, the primary down to a same-hue deep), not the generated tokens.json ramps, which are not in the repo yet. Lavender's attested 100, 700 and 900 override the derived steps. Every ramp is asserted strictly monotonic in luminance at load; a reversal throws.",
  ...Object.fromEntries(
    RAMPS.map((r) => [
      `${r.label} · derived`,
      { compact: true, swatches: Object.entries(r.steps).map(([k, hex]) => ({ label: k, hex, on: ratio(WHITE, hex) >= ratio(INK_PROBE, hex) ? WHITE : INK_PROBE })) },
    ])
  ),
  "Computed audit": RAMPS.map((r) => {
    const holdsWhite = Object.entries(r.steps).filter(([, h]) => passes(ratio(WHITE, h), "body")).map(([k]) => k);
    const holdsInk = Object.entries(r.steps).filter(([, h]) => passes(ratio(INK_PROBE, h), "body")).map(([k]) => k);
    return `${r.label}: monotonic. White body text holds on ${holdsWhite.join(", ") || "none"}; ink on ${holdsInk.join(", ") || "none"}.`;
  }),
};

const tallyB = { H: 0, K: 0, C: 0 };
BANNERS.forEach((row) => row.cells.forEach((c) => { if (!passes(c.H, "display")) tallyB.H++; if (!passes(c.K, "body")) tallyB.K++; if (!passes(c.C, "body")) tallyB.C++; }));

const bannersSpec = {
  id: "cs-zepto-banners",
  family: FAMILY,
  group: "Banners",
  eyebrow: "Zepto · Banner matrix",
  title: `Banner matrix · ${TREATMENTS.length} treatments x ${RAMPS.length} themes`,
  summary: `Each treatment is a recipe over the ramp (which step is the field, which the type, which the CTA), and each type colour is solved by contrast rather than picked, so a mid-tone theme steps to a lighter or deeper neighbour on its own chain instead of collapsing to black or white. Under every banner: field and type hex, then H (headline on field, display type, 3:1), K (kicker on field, body, 4.5:1) and C (CTA label on its fill, body, 4.5:1). Failures this render: H ${tallyB.H}, K ${tallyB.K}, C ${tallyB.C}. ${TREATMENTS.length} of the generator's 12 treatments are here, the ones legible in the rendered board; the other seven arrive with tokens.json.`,
  "The matrix": { banners: BANNERS },
  "The recipes": TREATMENTS.map((t) => `${t.label}: ${t.blurb}`),
  "How a cell is solved": [
    "Signature: field 500. Headline is whichever of the ramp's 900 or white clears more on it. CTA is the 900 with the lightest step that clears on it.",
    "Inverted: field 900. Headline is the 500, or the first lighter step (400, 300) that clears display type on the 900; a mid-tone purple cannot hold on its own deep. CTA takes the 500 as fill if a label clears body text there, else the 100.",
    "Light field: field 200, headline 900, kicker 700. CTA prefers the 500 fill, else the 900.",
    "Deep fill: field 800, headline 50, kicker 200, CTA a light 100 button with 900 label (the hot accent this treatment uses in the generator lives in tokens.json).",
    "Tint: field 50, headline 900, kicker 600. CTA as Light field.",
    "A kicker that cannot clear body text on its field falls back to the headline colour, and the K ratio shows that fallback.",
  ],
};

// ---- Combinations: every pair of the attested palette -------------------------

const PALETTE = [
  { label: "White", hex: WHITE },
  { label: `Ink ${INK_PROBE}`, hex: INK_PROBE },
  ...THEMES.map((t) => ({ label: `${t.label} 500`, hex: t.primary })),
  { label: "Lavender 100", hex: LAVENDER.surface100 },
  { label: "Lavender 700", hex: LAVENDER.type700 },
  { label: "Lavender 900", hex: LAVENDER.deep900 },
  ...STATUS.map((s) => ({ label: `${s.label} 500`, hex: s.s500 })),
  ...STATUS.map((s) => ({ label: `${s.label} 700`, hex: s.s700 })),
];
const COMBOS = combinations(PALETTE);
const pairCount = PALETTE.length * (PALETTE.length - 1);
const tally = { aa: 0, large: 0, fail: 0 };
COMBOS.cells.flat().forEach((c) => c && (tally[level(c.r)] += 1));

const combinationsSpec = {
  id: "cs-zepto-combinations",
  family: FAMILY,
  group: "Combinations",
  eyebrow: "Zepto · Combinations",
  title: `Every pair · ${PALETTE.length} colours, ${pairCount} combinations`,
  summary: `Each colour on this page set as type on every other colour as background, painted as the pair with its contrast ratio computed at render time. ${tally.aa} pairs clear body text (4.5:1), ${tally.large} clear display type and graphics only (3:1), ${tally.fail} clear nothing and are dimmed. Rows are the type colour, columns the background. A ring marks a 3:1-only pair.`,
  "The matrix": { matrix: COMBOS },
  "What clears on each background": COMBOS.byBackground.map(
    ({ bg, aa, large }) => `${bg.label}: body text in ${aa.length ? aa.join(", ") : "nothing"}${large.length ? `; display only in ${large.join(", ")}` : ""}.`
  ),
  "How to use it": [
    "Pick the background first, then read down its column for the type colours that clear. Reading a row tells you where a type colour can go.",
    "The invariants still apply on top: mid-tone 500s step deeper along their own chain for buttons, tinted surfaces take status 700, and colour stays the third signal after icon and label.",
    "This is the attested palette only. Once tokens.json is in the repo the matrix grows to the full ramps and the banner recipes.",
  ],
};

// ---- Handoff: tokens as code, next steps, gaps ---------------------------------

// CSS custom properties emitted from the data above. Generated, like tokens.json,
// so the block cannot disagree with the swatches.
const cssTokens = [
  ":root {",
  ...THEMES.map((t) => `  --zepto-${t.key}-500: ${t.primary};`),
  `  --zepto-lavender-100: ${LAVENDER.surface100};`,
  `  --zepto-lavender-700: ${LAVENDER.type700};`,
  `  --zepto-lavender-900: ${LAVENDER.deep900};`,
  ...STATUS.flatMap((s) => [
    `  --status-${s.key}-500: ${s.s500}; /* icon on white */`,
    `  --status-${s.key}-700: ${s.s700}; /* label + icon on tint */`,
  ]),
  "}",
].join("\n");

const handoffSpec = {
  id: "cs-zepto-handoff",
  family: FAMILY,
  group: "Handoff",
  eyebrow: "Zepto · Handoff",
  title: "Ship it: code, Figma, dark mode, prompts",
  summary:
    "What the system still needs, from the handoff note. The token block below is composed from the data on this page, the same way tokens.json is generated from the scripts, so it is a preview of the code export, not a substitute for it.",
  "Copy-paste CSS tokens (attested values only)": { pre: cssTokens },
  "Next steps": [
    "Ship to code. Emit CSS custom properties and/or a Tailwind theme from tokens.json, with the six themes as data-theme modes and the status group as semantic classes. Keep tokens.json generated, not hand-edited.",
    "Ship to Figma. Convert tokens.json into a Figma Variables collection with a six-way mode switch. Blocked so far: the Figma MCP was authenticated as the Zepto account, which has no edit access to the Portfolio Landing Page file. Share it with that account as editor, or reconnect the connector to the personal account.",
    "Dark mode. No theme has a verified dark variant yet. The 900s and inks exist but the surface and elevation scale does not.",
    "GPT Image 2 prompt system. Never started. The intent was a section that generates Zepto-themed 3D objects matching the Schedule Delivery icon style; the four-value shading recipe is in out/layer-lavender.html section C and in tokens.json under primitive.lavender._icon3d.",
  ],
  "Known gaps": [
    "No dark-mode surface scale.",
    "The status palette has not been applied to real screens, only specimens.",
    "The hot, warm and cool accents for the lavender theme are extensions, not sampled from any asset. Every other lavender value is sampled.",
    "The Amazon Fresh green ramp is sampled by eye from a JPEG-ish board, not from brand files. Treat those hexes as close, not authoritative.",
    "This page carries only the values the handoff doc states. The 50-900 ramps, the per-theme ink/canvas/hot/hotdeep/warm/cool accents, the 12 banner recipes and the 79 gradients need tokens.json and gradients.json dropped into src/prd/colorLibrary/zepto/ to render.",
  ],
  Sources: [
    "Zepto colour system, handoff to Claude Code (Google Doc 1QsMZEyWNuWLb8RpgxjRa7PsfR5C-RaVLPSNxxrg5yzk).",
    "Brand references: Amazon Fresh board, Zepto Schedule Delivery assets, Zepto unavailability-state icons.",
  ],
};

export const zeptoSpecs = [overviewSpec, ...themeSpecs, statusSpec, invariantsSpec, rampsSpec, bannersSpec, combinationsSpec, handoffSpec];
export { THEMES, STATUS, INVARIANTS };
