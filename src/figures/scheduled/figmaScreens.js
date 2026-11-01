import { PRIVATE_SITE } from "../../lib/site";

// Screens delivered from the Zepto Figma files (~/portfolio-inbox/sd-missing-screens/MANIFEST.json). The live prototypes (`proto`)
// exist only in the private build: PRIVATE_SITE is a compile-time constant,
// the public bundle folds the object to {} and the strings never ship.
// `proto` is an embed id from sdStory/embedCatalog.json (a live playground prototype of the same flow).
// `node`: the same screen's frame in the organised Figma file Claude: Schedule (R04cmbzFPQk2Q4IockGwqZ, ids from
// ~/design-playground/docs/figma-names/NAMES.csv). With one, the phone shows the frame live from Figma (FigmaEmbed)
// and `src` is its still. None set yet: these screens are explorations from the older working and handoff files, and
// the 23 Oct render diff found no 1:1 frame in Claude: Schedule (C-048, S-091, S-095, C-005, C-015, C-025 all differ).
// 96.3 (26 Oct): pdp, sheet, sheet-picker, dir-sheet and cart-hubs are 3x now (1080px wide), re-exported through the Figma
// MCP's download_assets at scale 3 (read-only); dir-sheet is rebuilt the same way at 3x (cart, 45% scrim, sheet at the foot),
// cart-hubs is the same crop (the top 2616px). interview-stats and toggle-demo were already wider than 360px.
const SHEET_FLOW = "flow-schedule-delivery-options-bottomsheet";
const FULL = {
  pdp: { src: "/figures/scheduled/figma/pdp.png", status: "killed" },
  sheet: { src: "/figures/scheduled/figma/sheet.png", status: "explored", sheet: true, proto: SHEET_FLOW },
  "sheet-picker": { src: "/figures/scheduled/figma/sheet-picker.png", status: "explored", sheet: true, proto: SHEET_FLOW },
  "dir-sheet": { src: "/figures/scheduled/figma/dir-sheet.png", status: "explored", proto: SHEET_FLOW },
  "cart-hubs": { src: "/figures/scheduled/figma/cart-hubs.png", status: "explored" },
  "toggle-demo": { src: "/figures/scheduled/figma/toggle-demo.png", status: "explored", proto: "flow-schedule-ut-prototypes" },
  "interview-stats": { src: "/figures/scheduled/figma/interview-stats.png", status: "shipped" },
};
// the image paths are not secret; only the prototypes are withheld on the public site
export const FIGMA_SCREENS = PRIVATE_SITE ? FULL : Object.fromEntries(Object.entries(FULL).map(([k, v]) => [k, { src: v.src, status: v.status, sheet: v.sheet, node: v.node }]));
