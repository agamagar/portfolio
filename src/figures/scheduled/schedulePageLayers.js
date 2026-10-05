// Layer map for the Zepto schedule-page plate (/figures/scheduled/schedule-page-ui.png,
// Figma frame Schedule Order Handoff 8450:71730). Feeds <LayerMap> so Agentation
// can annotate individual layers of the flat PNG instead of the whole screen.
//
// Boxes are [x, y, w, h] as percentages of the figure. First-passed from Figma
// node rects (tools/figma-layers/extract.mjs Dz5kNdC3bOc2I44wdZfC6N 8450:71730),
// then calibrated to the exported plate. Names read off the real screen.
//
// Ordered parent-first: equal z-index means later-in-DOM paints on top, so the
// small children (tabs, day chips, individual slots) sit above their parents —
// hover a slot to select the slot, hover a section's gaps/label to select the
// section. That is the drill-down.

const cols = [8, 37, 66]; // slot column left edges (%)
const slotW = 27;
const slotH = 3.6;
const slot = (name, col, top) => ({ name, box: [cols[col], top, slotW, slotH] });

const schedulePageLayers = [
  // --- header ---
  { name: "Status bar", box: [0, 1, 100, 5.5] },
  { name: "Back button", box: [3.5, 8, 8.5, 4.4] },
  { name: "Page title", box: [13, 7.6, 44, 3.4] },
  { name: "Shipment count", box: [13, 10.6, 24, 2.6] },

  // --- promo banner (the animated GTM region) ---
  { name: "Promo banner", box: [3.5, 14.8, 93, 14.2] },

  // --- shipment card header ---
  { name: "Shipment header", box: [6, 30.5, 88, 6.8] },

  // --- delivery-type toggle (parent + two tabs) ---
  { name: "Delivery-type toggle", box: [6.5, 39.2, 87, 6.6] },
  { name: "Instant delivery tab", box: [6.7, 39.4, 41, 6.2] },
  { name: "Schedule delivery tab", box: [50, 39.4, 43, 6.2] },

  // --- day selector (parent + two day chips) ---
  { name: "Day selector", box: [6.5, 47, 88, 6 ] },
  { name: "Today, 18 Aug tab", box: [7.5, 47.2, 42, 5.6] },
  { name: "Tomorrow, 19 Aug tab", box: [54, 47.2, 40, 5.2] },

  // --- slot grid: three time-of-day sections (mid level) ---
  { name: "Earliest section", box: [6.5, 54, 88, 14] },
  { name: "Afternoon section", box: [6.5, 69.5, 88, 13.5] },
  { name: "Evening section", box: [6.5, 85, 88, 13.5] },

  // --- individual slots (deepest level, painted on top) ---
  slot("7 - 8 AM slot", 0, 57.8),
  slot("8 - 9 AM slot", 1, 57.8),
  slot("9 - 10 AM slot", 2, 57.8),
  slot("10 - 11 AM slot", 0, 63.5),
  slot("11 - 12 PM slot", 1, 63.5),

  slot("12 - 1 PM slot", 0, 73),
  slot("1 - 2 PM slot", 1, 73),
  slot("2 - 3 PM slot", 2, 73),
  slot("3 - 4 PM slot", 0, 78.7),
  slot("4 - 5 PM slot", 1, 78.7),
  slot("5 - 6 PM slot", 2, 78.7),

  slot("6 - 7 PM slot", 0, 88.2),
  slot("7 - 8 PM slot", 1, 88.2),
  slot("8 - 9 PM slot", 2, 88.2),
  slot("9 - 10 PM slot", 0, 94),
  slot("10 - 11 PM slot", 1, 94),
];

export default schedulePageLayers;
