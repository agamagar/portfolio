// The face rig: ONE skeleton for every face style (Agam, 2026-10-08: "build all the
// illustration on the same global component, then bounce and emote when switching").
//
// The geometry is the landing-page illustration (Figma "Portfolio Landing Page" node
// 1724-23069, the same paths as pixelMascot/IllustratedMascot.jsx), split into named,
// fillable parts in one coordinate space. A style (skins.jsx) only decides how each
// part is painted; the emotes (Face.jsx) only move parts. So every emote works in
// every style, and every style can be added without touching the motion.

export const VIEWBOX = "34 18 148 168"; // the drawing plus room for the bounce and the hat

// The ink outline as drawn: outer silhouette (hair + head) and the face opening
const OUTER =
  "M125.426 42.7851C135.636 33.8373 145.219 29.2627 155.624 39.6821C163.949 48.0178 155.75 59.536 150.61 64.253C159.933 73.9221 148.516 82.2995 141.641 85.28C150.965 94.9491 157.996 126.803 160.346 141.521C163.601 153.394 160.572 177.258 122.42 177.732C84.2672 178.206 78.8193 160.954 74.6535 141.039L72.2808 102.102L68.3271 98.5594L59.5808 97.304C69.3867 70.446 69.8054 67.5308 85.0162 54.8377C96.8093 44.9967 101.678 52.7655 103.756 59.0145C107.576 56.5872 117.258 49.9434 125.426 42.7851Z";
const FACE_HOLE =
  "M140.089 90.9303C130.102 77.5953 94.1593 72.0804 76.6537 90.395C78.0322 104.974 77.3627 134.399 79.322 145.217C82.4 162.21 92.174 170.102 110.781 172.773C126.266 174.996 141.905 171.81 148.396 167.636C161.939 158.926 154.81 135.19 154.81 135.19C151.623 120.683 148.079 101.598 140.089 90.9303Z";

export const PATHS = {
  // the whole head, hair included (for the base fill and the material's silhouette)
  silhouette: OUTER,
  // skin: the face opening (the drawing's hole) plus the ear, closed
  face: FACE_HOLE,
  ear: "M74.249 101.967C72.0171 98.7623 53.4737 92.1789 53.7708 110.278C54.0417 126.786 65.3549 132.68 75.7351 131.203L77.5 101Z",
  // hair: the silhouette minus the face, kept above the hairline (HAIR_CLIP)
  hair: `${OUTER} ${FACE_HOLE}`,
  // the drawn lines
  earLine: "M74.249 101.967C72.0171 98.7623 53.4737 92.1789 53.7708 110.278C54.0417 126.786 65.3549 132.68 75.7351 131.203",
  earCurl: "M62.4194 108.047C64.9468 109.687 69.505 114.6 67.5193 121.135",
  nose: "M123.042 104.704C129.701 113.594 137.032 123.597 127.865 129.422",
  browL: "M91.6487 101.911C92.3438 100.523 94.6086 97.8729 98.1069 98.375",
  browR: "M128.722 92.3541C130.32 91.5916 134.013 90.7333 136.011 93.4003",
  mouth: "M106.128 144.009C106.056 147.966 108.661 155.381 119.659 153.389",
  // the surprised mouth (an O) and the wink's lopsided smile, same place
  mouthO: "M112.5 146.5m-5.2 0a5.2 6.2 0 1 0 10.4 0a5.2 6.2 0 1 0 -10.4 0",
};

// the hair stops at the hairline: everything of the outline below this is the chin's
// contour, drawn as a line in the styles that have one
export const HAIR_CLIP = "M30 18H186V96L150 91L120 82L95 83L78 92L74 104L30 104Z";

export const EYES = [
  { id: "eyeL", cx: 96.4317, cy: 110.035, r: 4.41774 },
  { id: "eyeR", cx: 136.002, cy: 103.812, r: 4.41774 },
];

// stroke widths of the drawing (the illustration's own)
export const STROKE = { main: 4.17786, fine: 3.18046 };

// where the head sits on the ground, for squash and stretch
export const BASE = { x: 112, y: 178 };
