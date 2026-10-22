import { PRIVATE_SITE } from "../../lib/site";

// Screens delivered from the Zepto Figma files (~/portfolio-inbox/sd-missing-screens/MANIFEST.json). The Figma links
// point into Zepto-internal files, so they exist only in the private build: PRIVATE_SITE is a compile-time constant,
// the public bundle folds the object to {} and the strings never ship.
// `proto` is an embed id from sdStory/embedCatalog.json (a live playground prototype of the same flow).
// TODO 3x re-export (images are 1x, 360px wide): see the node per key.
const SHEET_FLOW = "flow-schedule-delivery-options-bottomsheet";
const FULL = {
  pdp: { src: "/figures/scheduled/figma/pdp.png", status: "killed", node: "668:98011", link: "https://www.figma.com/design/qLTBra8WNokdtGqojZJbTv/Scheduled-Delivery-working?node-id=668-98011" },
  sheet: { src: "/figures/scheduled/figma/sheet.png", status: "explored", sheet: true, proto: SHEET_FLOW, node: "2925:95694", link: "https://www.figma.com/design/71cZSn6pTNf4zFzO07O2uv/Zepto-handoff?node-id=2925-95694" },
  "sheet-picker": { src: "/figures/scheduled/figma/sheet-picker.png", status: "explored", sheet: true, proto: SHEET_FLOW, node: "2925:95794", link: "https://www.figma.com/design/71cZSn6pTNf4zFzO07O2uv/Zepto-handoff?node-id=2925-95794" },
  "dir-sheet": { src: "/figures/scheduled/figma/dir-sheet.png", status: "explored", proto: SHEET_FLOW, node: "2925:96215 + 2925:95694", link: "https://www.figma.com/design/71cZSn6pTNf4zFzO07O2uv/Zepto-handoff?node-id=2925-96215" },
  "cart-hubs": { src: "/figures/scheduled/figma/cart-hubs.png", status: "explored", node: "182:126352", link: "https://www.figma.com/design/qLTBra8WNokdtGqojZJbTv/Scheduled-Delivery-working?node-id=182-126352" },
  "toggle-demo": { src: "/figures/scheduled/figma/toggle-demo.png", status: "explored", proto: "flow-schedule-ut-prototypes", node: "3970:157008 + 3400:332975 + 3509:157627", link: "https://www.figma.com/design/71cZSn6pTNf4zFzO07O2uv/Zepto-handoff?node-id=3970-154017" },
  "interview-stats": { src: "/figures/scheduled/figma/interview-stats.png", status: "shipped", node: "3661:238255", link: "https://www.figma.com/design/71cZSn6pTNf4zFzO07O2uv/Zepto-handoff?node-id=3661-238255" },
};
// the image paths are not secret; only the links are withheld on the public site
export const FIGMA_SCREENS = PRIVATE_SITE ? FULL : Object.fromEntries(Object.entries(FULL).map(([k, v]) => [k, { src: v.src, status: v.status, sheet: v.sheet }]));
