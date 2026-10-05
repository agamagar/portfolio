// Phone-mockup angle presets · the 5 camera poses for the coded <PhoneMock>.
//
// Each preset is one "camera": a perspective distance, a vanishing point
// (origin), rotations on X/Y/Z, a scale, and a ground-shadow tuning. The values
// were matched by eye to a reference photo (public/mockups/refs/<id>.jpg); tune
// them freely, the component reads them as CSS custom properties so every edit
// is live.
//
// Sign guide (CSS 3D space):
//   rx  +  tips the TOP edge away from the viewer  (we look down onto the glass)
//   rx  -  tips the top toward us / bottom away     (we look up from below)
//   ry  +  turns the RIGHT edge away               (screen faces left)
//   ry  -  turns the LEFT edge away                (screen faces right)
//   rz  +  rotates clockwise in-plane              (diagonal, editorial tilt)
//   persp  smaller = stronger foreshortening; larger = flatter product shot
//   originY  lower value = higher vanishing point; higher = shot-from-below feel
//
// shadow: a soft contact shadow cast by the whole silhouette (drop-shadow).

export const MOCK_PRESETS = [
  {
    id: "reach",
    name: "Reach",
    tag: "Editorial 3/4",
    note: "Phone thrust toward camera on the diagonal, screen turned up to the viewer. The dramatic hero.",
    ref: "/mockups/refs/reach.jpg",
    refCredit: "Wamathis · WIDE ANGLE",
    persp: 1150, originX: 50, originY: 40,
    rx: 36, ry: -15, rz: 22, scale: 1.0,
    shadow: { x: -22, y: 40, blur: 62, color: "rgba(14,13,20,.42)" },
  },
  {
    id: "two-hand",
    name: "Two-hand read",
    tag: "Over the shoulder",
    note: "Held upright in two hands, seen from just behind and above, the top tipping gently away. Calm, considered.",
    ref: "/mockups/refs/two-hand.jpg",
    refCredit: "DBS · continuous improvement",
    persp: 1500, originX: 50, originY: 44,
    rx: 15, ry: -4, rz: 3, scale: 1.0,
    shadow: { x: 0, y: 36, blur: 52, color: "rgba(14,13,20,.34)" },
  },
  {
    id: "hero",
    name: "Hero float",
    tag: "Skyward",
    note: "One hand, near-upright, a small turn to the light. The clean marketing hero against open sky.",
    ref: "/mockups/refs/hero.jpg",
    refCredit: "tou.visuals · Heluf",
    persp: 1700, originX: 50, originY: 45,
    rx: 6, ry: 13, rz: -5, scale: 1.02,
    shadow: { x: 22, y: 34, blur: 56, color: "rgba(14,13,20,.32)" },
  },
  {
    id: "front",
    name: "In-hand front",
    tag: "Straight on",
    note: "Almost flat to the camera, a single degree of life. The honest product shot where the screen does the talking.",
    ref: "/mockups/refs/front.jpg",
    refCredit: "A.Samuel · Leaderboard",
    persp: 2200, originX: 50, originY: 50,
    rx: 2, ry: -3, rz: 1, scale: 1.0,
    shadow: { x: 0, y: 30, blur: 44, color: "rgba(14,13,20,.28)" },
  },
  {
    id: "low-angle",
    name: "Low angle",
    tag: "Looking up",
    note: "Camera below the phone, the base close and large, the body receding upward. Cinematic, imposing.",
    ref: "/mockups/refs/low-angle.jpg",
    refCredit: "Health in your pocket",
    persp: 900, originX: 50, originY: 80,
    rx: 24, ry: 8, rz: -4, scale: 1.05,
    shadow: { x: 6, y: 26, blur: 60, color: "rgba(14,13,20,.36)" },
  },
];

export const MOCK_PRESET_MAP = Object.fromEntries(
  MOCK_PRESETS.map((p) => [p.id, p]),
);

// Sample screens available to drop into the mock (real case-study plates).
export const MOCK_SCREENS = [
  { id: "zepto", label: "Zepto · Scheduled", src: "/figures/scheduled/sched-cart-confirmed.png" },
  { id: "away", label: "Away · Agent", src: "/figures/away-agent/greeting/evening-ui.jpg" },
  { id: "dassh", label: "Dassh · Stella", src: "/figures/dassh/stella-chat.jpg" },
];

// Rail finishes for the coded frame. Physical object colours, theme-independent.
export const MOCK_TONES = [
  { id: "graphite", label: "Graphite" },
  { id: "natural", label: "Natural Ti" },
  { id: "black", label: "Black Ti" },
];
