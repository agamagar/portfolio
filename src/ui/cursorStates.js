// THE CURSOR STATE REGISTRY (Agam, 19 Oct 2026: "build all other states of the cursor; we'll standardise later").
// One place to tune every silhouette and every trigger. Pure data, no DOM.
//
// A state is up to TWO closed parts (path strings, px, relative to the hotspot = the pointer position).
// ContextCursor.jsx samples each part ONCE into NPT points by angle around its centroid (so every shape
// corresponds point to point with every other and any blend of them is a smooth weighted sum, no shards)
// and animates one spring weight per state. A part that is missing collapses to a point at the centroid of
// the first, so a second blob can grow out of nothing (arrow -> scroll). Parts are filled evenodd, so a
// second part INSIDE the first is a hole (ring, no-entry, phone notch).
//
//   fig   : paths in the 360 x 360 Figma frames (Agam's 3 scenarios), with the hotspot and scale to bring them to px
//   parts : the paths, px, hotspot (0,0) at the centre unless the shape is a pointer
//   glyph : an optional polyline glyph from G (ContextCursor.jsx) drawn in the contrast ink inside the shape
//   spin  : the shape turns continuously (CSS, compositor only), for busy states
//   note  : where it shows up (for the ?cursors=1 review sheet)

// ---- path helpers --------------------------------------------------------------------------------------
const f = (n) => +n.toFixed(2);
export const rot = (pts, deg) => { const a = (deg * Math.PI) / 180, c = Math.cos(a), s = Math.sin(a); return pts.map(([x, y]) => [x * c - y * s, x * s + y * c]); };
// closed polygon with every corner rounded by r (quadratic corners)
export function rpoly(pts, r) {
  const n = pts.length; let d = "";
  for (let i = 0; i < n; i++) {
    const p0 = pts[(i + n - 1) % n], p1 = pts[i], p2 = pts[(i + 1) % n];
    const l1 = Math.hypot(p0[0] - p1[0], p0[1] - p1[1]), l2 = Math.hypot(p2[0] - p1[0], p2[1] - p1[1]);
    const rr = Math.min(r, l1 / 2, l2 / 2);
    const a = [p1[0] + ((p0[0] - p1[0]) / l1) * rr, p1[1] + ((p0[1] - p1[1]) / l1) * rr];
    const b = [p1[0] + ((p2[0] - p1[0]) / l2) * rr, p1[1] + ((p2[1] - p1[1]) / l2) * rr];
    d += (i ? "L" : "M") + f(a[0]) + " " + f(a[1]) + "Q" + f(p1[0]) + " " + f(p1[1]) + " " + f(b[0]) + " " + f(b[1]);
  }
  return d + "Z";
}
export const rrect = (cx, cy, w, h, r) => rpoly([[cx - w / 2, cy - h / 2], [cx + w / 2, cy - h / 2], [cx + w / 2, cy + h / 2], [cx - w / 2, cy + h / 2]], r);
export const circle = (cx, cy, r) => `M${f(cx - r)} ${f(cy)}A${r} ${r} 0 1 0 ${f(cx + r)} ${f(cy)}A${r} ${r} 0 1 0 ${f(cx - r)} ${f(cy)}Z`;
export function ellipse(cx, cy, rx, ry, deg) {
  const a = (deg * Math.PI) / 180, c = Math.cos(a), s = Math.sin(a); let d = "";
  for (let i = 0; i < 40; i++) { const t = (i / 40) * Math.PI * 2, x = rx * Math.cos(t), y = ry * Math.sin(t); d += (i ? "L" : "M") + f(cx + x * c - y * s) + " " + f(cy + x * s + y * c); }
  return d + "Z";
}

// ---- Agam's Figma scenarios (Portfolio-2026, section 1647:5325) -----------------------------------------
const FIG = {
  arrow: "M153.852 295.071L56.2051 73.7915C51.755 63.707 62.1147 53.4612 72.1494 58.0224L292.058 157.981C302.471 162.714 300.987 177.948 289.857 180.583L201.5 201.5L176.406 293.388C173.43 304.287 158.413 305.408 153.852 295.071Z",
  hover: "M152.321 264.257L88.4511 88.6154C84.9417 78.9648 94.3869 69.6512 103.987 73.2956L276.28 138.699C287.068 142.795 286.423 158.268 275.332 161.452L254.132 167.539C223.556 176.316 198.981 199.118 187.941 228.952L174.853 264.321C170.975 274.8 156.139 274.758 152.321 264.257Z",
  top: "M129.673 156.103L171.224 44.3109C173.171 39.074 180.491 38.8391 182.769 43.9406L231.643 153.383C233.695 157.976 228.687 162.52 224.314 160.033C197.756 144.927 165.067 145.538 139.093 161.627L137.571 162.57C133.202 165.276 127.882 160.921 129.673 156.103Z",
  bot: "M231.162 215.447L185.914 316.491C183.696 321.444 176.649 321.399 174.494 316.419L130.382 214.471C128.379 209.843 133.528 205.39 137.82 208.038C163.556 223.921 195.913 224.474 222.176 209.478L223.651 208.636C228.131 206.078 233.271 210.738 231.162 215.447Z",
};
export const FS = 0.075;

// ---- reusable outlines ---------------------------------------------------------------------------------
const DBL = [[-14, 0], [-6, -7], [-6, -3.2], [6, -3.2], [6, -7], [14, 0], [6, 7], [6, 3.2], [-6, 3.2], [-6, 7]];
const NE = rot([[-11, -3.6], [1, -3.6], [1, -9], [12, 0], [1, 9], [1, 3.6], [-11, 3.6]], -45);
const UP = [[0, -12], [10, -1], [4, -1], [4, 11], [-4, 11], [-4, -1], [-10, -1]];
const FOUR = [[0, -13], [5, -7], [2, -7], [2, -2], [7, -2], [7, -5], [13, 0], [7, 5], [7, 2], [2, 2], [2, 7], [5, 7], [0, 13], [-5, 7], [-2, 7], [-2, 2], [-7, 2], [-7, 5], [-13, 0], [-7, -5], [-7, -2], [-2, -2], [-2, -7], [-5, -7]];
const PLUS = [[-1.8, -13], [1.8, -13], [1.8, -1.8], [13, -1.8], [13, 1.8], [1.8, 1.8], [1.8, 13], [-1.8, 13], [-1.8, 1.8], [-13, 1.8], [-13, -1.8], [-1.8, -1.8]];

// ---- the states ----------------------------------------------------------------------------------------
export const STATES = {
  // Agam's three Figma scenarios
  arrow: { fig: { parts: [FIG.arrow], hot: [62, 62] }, note: "default: the chunky pointer" },
  hover: { fig: { parts: [FIG.hover], hot: [92, 75] }, note: "links, buttons: the tail sweeps into one curve" },
  scroll: { fig: { parts: [FIG.top, FIG.bot], hot: [180, 180] }, note: "while the page scrolls: two opposed spikes" },
  // new
  text: { parts: [rrect(0, 0, 3.6, 26, 1.8)], note: "inputs, textareas: a caret capsule" },
  ext: { parts: [rpoly(NE, 1.6)], note: "external links: a solid north-east arrow" },
  view: { parts: [circle(0, 0, 12.5)], glyph: "view", note: "project cards and rows: a bubble with an open arrow" },
  lock: { parts: [rrect(0, 3, 22, 16, 4), "M-6 -6.5A6 6 0 0 1 6 -6.5Z"], note: "locked / NDA projects: a padlock body with its dome" },
  drag: { parts: [rpoly(DBL, 1.6)], note: "side quests, the ! : ready to drag, a double arrow" },
  grab: { parts: [rrect(0, 0, 18, 13, 6.5)], note: "while dragging: the arrow closes into a fist-sized pill" },
  play: { parts: [rpoly([[-7, -10], [10, 0], [-7, 10]], 3)], note: "paused video: a rounded play triangle" },
  pause: { parts: [rrect(-5.2, 0, 6, 20, 2.5), rrect(5.2, 0, 6, 20, 2.5)], note: "playing video: two bars (play -> pause is a morph)" },
  rotate: { parts: [ellipse(0, 0, 14, 8, -25), ellipse(0, 0, 8.5, 3.2, -25)], note: "the 3D face: an orbit ring" },
  rotategrab: { parts: [ellipse(0, 0, 11, 6.5, -25)], note: "dragging the face: the orbit closes up" },
  up: { parts: [rpoly(UP, 2.2)], note: "the room pill: an up arrow" },
  phone: { parts: [rrect(0, 0, 15, 26, 4.5), circle(0, -9, 1.6)], note: "phone frame controls: a phone silhouette with its island" },
  expand: { parts: [rpoly(FOUR, 1.2)], note: "expand / open full page: four-way arrows" },
  busy: { parts: [circle(0, 0, 12), circle(2.5, -2.5, 7.5)], spin: true, note: "loading, the room warming: a thick spinning crescent" },
  disabled: { parts: [circle(0, 0, 11.5), rpoly(rot([[-1.8, -8.5], [1.8, -8.5], [1.8, 8.5], [-1.8, 8.5]], 45), 1.8)], note: "disabled, not allowed: a no-entry disc" },
  inspect: { parts: [rpoly(PLUS, 1.2)], note: "Inspect mode: a crosshair" },
  "resize-h": { parts: [rpoly(DBL, 1.6)], note: "resize handles, horizontal" },
  "resize-v": { parts: [rpoly(rot(DBL, 90), 1.6)], note: "resize handles, vertical" },
  "resize-d": { parts: [rpoly(rot(DBL, 45), 1.6)], note: "resize handles, diagonal" },
};
export const STATE_NAMES = Object.keys(STATES);

// ---- triggers --------------------------------------------------------------------------------------------
// data-cursor="<name>" on any element wins; these aliases keep the earlier names working
export const ALIAS = { link: "hover", dot: "arrow", ext: "ext", "": "arrow" };
// The first matching rule wins. sel: closest() selector; rect: also match by bounding box (for elements that
// take no pointer events); s: a state name or (ctx, el) => name. ctx = { down }.
export const RULES = [
  { sel: "video", s: (c, el) => (el.paused ? "play" : "pause") },
  { sel: '[aria-busy="true"]', s: () => "busy" },
  { sel: ":disabled, [aria-disabled='true']:not(.is-locked)", s: () => "disabled" },
  { sel: "input:not([type=button]):not([type=submit]):not([type=checkbox]):not([type=radio]), textarea, [contenteditable=true]", s: () => "text" },
  { sel: ".is-locked", s: () => "lock" },
  { sel: ".hf__bang, .hv2__bang", s: (c) => (c.down ? "grab" : "drag") },
  { sel: ".hero-morph__btn, .hero-morph__cv", rect: ".hero-morph__cv", s: (c) => (c.down ? "rotategrab" : "rotate") },
  { sel: ".wscene-warm-pill__btn", rect: ".wscene-warm-pill__btn", s: () => "up" },
  { sel: ".sq__track", s: (c) => (c.down ? "grab" : "drag") },
  { sel: "[data-resize]", s: (c, el) => "resize-" + (el.getAttribute("data-resize") || "d") },
  { sel: ".exp__btn, .pc__btn--expand", s: () => "expand" },
  { sel: ".pc", s: () => "phone" },
  { sel: "[data-project], .wg__card, .work__item", s: () => "view" },
  { sel: "a[href]", s: (c, el) => (el.target === "_blank" || (el.host && el.host !== location.host) ? "ext" : "hover") },
  { sel: "button, [role=button], [role=link], summary, label, select", s: () => "hover" },
];
// Inspect mode (InspectMode.jsx) sets this on <html>; the crosshair then wins everywhere
export const INSPECT_SEL = "html[data-inspect-el]";
