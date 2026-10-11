// Whiteboard engine: write anything on a whiteboard in the Marker Hand font, with a handful of hand-drawn
// shapes, the way a brainstorm actually looks.
//
//   import { mountBoard } from "./figures/board";
//   mountBoard(el, { layout: "mindmap", outline: "Topic\n  Branch\n    leaf" });
//   mountBoard(el, { items: [{ type: "text", at: [100, 100], text: "Hello", size: "xl" }] });
//
// Layouts: mindmap, flow, columns, matrix, timeline, stickies, annotate. Or pass `items` (primitives) directly.
// Primitives: text, box, ellipse, cloud, arrow, curve, line, squiggle, underline, highlight, star, check, cross,
//             bulb, burst, bracket, scribble, strike, dot, sticky, image, wait.

export { mountBoard } from "./core/mount.js";
export { buildScene, schedule, COLORS, BRANCH_COLORS, colorOf } from "./core/scene.js";
export { sceneToSVG } from "./core/svg.js";
export { createPlayer } from "./core/player.js";
export { LAYOUTS, parseOutline } from "./core/layouts.js";
export { writeText, measureLine, wrapText, SIZES } from "./core/text.js";
export { annotateElement } from "./core/annotateElement.js";
export { PRESETS } from "./presets.js";
