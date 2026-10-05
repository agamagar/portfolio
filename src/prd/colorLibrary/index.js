// THE COLOUR SYSTEM - map of this folder.
//
//   contrast.js           WCAG luminance, ratio, thresholds, verdict lines; shared
//   zepto/
//     themes.data.js      6 themes: primary, register, the lavender 100/700/900
//     status.data.js      5 unavailability states (500 + 700) and the CVD figures
//     invariants.data.js  the 10 rules
//     index.js            derives the specs; every ratio computed, never typed
//   away/
//     brand.data.js       the guidelines palette: black, white, 8 greys, Sky x3, 3 secondaries
//     product.data.js     the app's 12 ramps, copied from palettes.ts by script
//     figma.data.js       what the Figma library carries (2026-06-20 reconciliation)
//     index.js            Brand / Product / Reconciliation specs
//
// Same shape as the prompt library: one LIBRARY per subfolder, each exporting its
// specs tagged with a `family`, and this file spreading them into the object
// PrdRenderer consumes. The family becomes the top level of the rail, so a second
// library (Away, Ekam, the portfolio's own tokens) is one more subfolder and one more
// spread below. Groups within a family are the second rail level.
import { zeptoSpecs } from "./zepto/index.js";
import { awaySpecs } from "./away/index.js";
import { socialsSpecs } from "./socials/index.js";

export const colorSystemData = {
  synthesis: {
    oneLiner:
      "Colour systems kept in one place, each a set of themes, a status palette and the invariants that keep them honest. Every contrast ratio on this page is computed from the hex beside it.",
    "What this is": [
      "Zepto: six themes (green, purple, orange, blue, yellow, lavender), five unavailability states with hue for domain and depth for severity, and ten invariants each learned by breaking it.",
      "Away: the brand palette from the guidelines (black, white, eight greys, Sky as the one accent, three secondaries), the app's twelve in-product ramps copied from source, and a reconciliation of the three accents the brand book, the app and the Figma library each carry.",
      "A library is a folder. Its data files hold the attested values, its index derives the page, and the family label puts it on the rail beside the others.",
      "Nothing on this page types a ratio. Swatches carry the hex, the sample text colour and a badge computed at render time against the WCAG thresholds.",
    ],
    "How a swatch is audited": [
      "Relative luminance from the sRGB hex, per WCAG 2.x.",
      "Ratio = (lighter + 0.05) / (darker + 0.05), symmetric, so the pair is what is judged, not the colour.",
      "Body and UI text: 4.5:1. Display type: 3:1. Graphical objects and icons: 3:1.",
      "A swatch that fails is shown failing. The page never hides a miss, because a hidden miss is how a 9.4:1 claim ships at 6.85:1.",
    ],
    "How a library is added": [
      "Make src/prd/colorLibrary/<name>/ with the data files and an index.js that exports <name>Specs, each spec tagged family: '<Name>' and a group.",
      "Spread it into specs below. The rail grows a family head, groups collapse under it.",
      "Values must be attested: sampled from an asset, a brand file or a generator's output, and their source named in a Sources field.",
    ],
    Sources: [
      "Zepto colour system, handoff to Claude Code (Google Doc).",
      "Away Brand Guidelines, Color; ~/away/away-app/src/core/theme; the 2026-06-20 Figma token reconciliation note.",
      "The generators (scripts/, tokens.json, gradients.json) are the source of truth for the ramps and gradients; this page renders the values they attest.",
    ],
  },
  specs: [...zeptoSpecs, ...awaySpecs, ...socialsSpecs],
};

export default colorSystemData;
