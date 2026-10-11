# Whiteboard engine

Writes anything on a whiteboard in your handwriting (the **Marker Hand** font) with a handful of hand-drawn
shapes, the way a real brainstorm looks. Boards are generated from content, written out stroke by stroke,
and can annotate any image or live DOM element.

Framework-free core (runs in the browser and in Node); React is a thin wrapper.

## Use it

```js
import { mountBoard } from "./figures/board";

mountBoard(el, { layout: "mindmap", outline: "Topic\n  Branch\n    leaf\n    * starred leaf" });
mountBoard(el, { layout: "flow", title: "Checkout", steps: ["Pick slot", "Pay", { text: "Delivered", mark: "star" }] });
mountBoard(el, { items: [{ type: "text", at: [100, 100], text: "Hello", size: "xl" }] }, { animate: "inview" });
```

```jsx
import Board from "./figures/board/Board";            // <Board spec={...} animate="inview" />
import Annotated from "./figures/board/Annotated";    // <Annotated notes={[{ selector: ".price", text: "..." }]}>…</Annotated>
import Whiteboard from "./figures/Whiteboard";        // on the easel: <Whiteboard board={spec} alt caption />
```

In `App.jsx` a section can set `whiteboard: { board: <spec>, alt, caption }`; the easel shows the finished board and
the lightbox writes it out live (with Replay and Skip). Image mode (`whiteboard: "/path.png"`) is unchanged.

Annotate a live element:

```js
import { annotateElement } from "./figures/board";
annotateElement(cardEl, [
  { selector: ".price", text: "Price up front", kind: "circle", color: "red", side: "right" },
  { rect: [0, 0.85, 1, 0.15], text: "One loud action", kind: "box" },       // fractions of the element's box
], { margin: [110, 320], animate: "inview" });                              // [vertical, horizontal] room for labels
```

## Layouts (`spec.layout`)

| layout | input |
| --- | --- |
| `mindmap` | `outline` (indented text; a leading `*` star, `!` idea, `+` tick, `x` cross, `?` marks a line), or `tree` / `root`+`branches` |
| `flow` | `title`, `steps: [string \| { text, note, mark, color }]` (snaking boxes with numbered badges and arrows) |
| `columns` | `title`, `columns: [{ title, items, mark: check\|cross\|dot\|star\|num }]` (pros / cons headers pick ticks and crosses) |
| `matrix` | `title`, `x`, `y` axis labels, `quadrants`, `items: [{ text, x: 0..1, y: 0..1 }]` as sticky notes |
| `timeline` | `title`, `events: [{ when, text }]` |
| `stickies` | `title`, `groups: [{ title, notes }]` (affinity clusters) |
| `annotate` | `image: { href, w, h }`, `notes: [{ text, at \| rect (fractions), kind, color, side }]` |

Or skip layouts and pass `items` (primitives) directly; they can be combined with a layout (extra `items` are appended).

## Primitives (`items[].type`)

`text` `box` `ellipse` `cloud` `arrow` `curve` `line` `squiggle` `underline` `highlight` `star` `check` `cross`
`bulb` `burst` `bracket` `scribble` `strike` `dot` `sticky` `image` `wait`.
Give an item an `id`, then other items can point at it: `{ type: "arrow", from: "a", to: "b" }`,
`{ type: "underline", of: "title" }`, `{ type: "highlight", of: "q" }`. Common fields: `color` (teal, black, blue,
red, orange, purple, green, pink, grey or any CSS colour), `w` (pen px), `op`, `pause` (seconds before), `with`
(start together with the previous item).

Spec options: `w`/`h` (board size, default 1600x1000), `seed` (same seed = same hand), `pace`, `maxDuration`
(dense boards time-lapse to about 22 s; `autoPace: false` to turn off), `bg` (`"none"` for a transparent overlay),
`surface` (`"used"` = faint ghosts of erased marker, or `"clean"`).

## How it works

- `core/pen.js`, `shapes.js`: ideal paths become marker strokes (smooth sideways wander, a crooked closing corner,
  bowed arrows, overshoot). A seeded RNG makes every board repeatable.
- `core/text.js`: handwriting layout from the font's advances, with per-letter drift, tilt and size variance.
- `data/markerHand.data.js`: **generated** by `Claude/2026-10-09_handwriting-font/src/step4_build.py`: each glyph's
  outline plus its centre-line pen strokes. Letters are drawn as outline paths (no font file needed, exports are
  one self-contained SVG) and revealed through a mask that follows the pen strokes, so text is *written*, not wiped.
- `data/extraGlyphs.js`: stand-in numerals and a few symbols drawn as pen strokes (the handwriting photo had no digits).
- `core/layouts.js`: the generators. `core/scene.js` schedules every mark (one clock, letter-level pacing).
- `core/player.js`: play / pause / seek / speed / replay; finished boards are plain static paths.
- Reduced motion shows the finished board. Export with `ctl.exportSVG()` / `await ctl.toPNG(2)`.

## Try and check

- Lab (dev server): `/src/figures/board/lab/lab.html` (every layout, scrubber, SVG/PNG export, click-to-annotate on your own image)
- `/src/figures/board/lab/easel.html` (boards on the easel), `/src/figures/board/lab/live.html` (annotate a live element)
- `/src/figures/board/lab/qa-glyphs.html` — every glyph's outline with its pen strokes drawn over it (check the font data after a rebuild)
- `node src/figures/board/lab/check.mjs` — headless gate: every preset builds, no text off the board, no text overlaps
- `node src/figures/board/lab/export-samples.mjs <dir>` — finished SVG of every preset

## Boards in the Scheduled Delivery case study

`boards.scheduledDelivery.js` holds the three boards placed in `caseStudies["scheduled-delivery"]` (src/App.jsx): "The go-to-market"
(three options), "Different ways we explored..." (tabbed or single page), "Reflection" (what held / would revisit / drop 10-minute?).
They use only the case study's own wording; if a section's copy changes, change its board. They are plain data because the trim
and present cuts are JSON clones of the base case study.

A section gets one with `whiteboardNext: SD_BOARDS.<key>`. That is a new slot in the article section renderer, painted right after
the main figure (like `figNext`), because `SectionFigure` renders a `whiteboard` *before* a `fig` or `scene` and would replace it.
Use plain `whiteboard:` only on sections with no other main figure. Captions are omitted on purpose (the case sets `hideCaptions`).
Preview one on its own: `/src/figures/board/lab/lab.html?sd=goToMarket|directions|reflection` (add `&static=1&bare=1` for the finished board).

## Known limits

- Digits and `+ = * < > [ ] { } | ~ % # ^ \` are stand-in pen glyphs; `$ @ &` are not drawn yet (skipped).
- Capitals other than H are derived from the lowercase; improve by adding a real A-Z to the font and re-running the build.
- The hand's wander is cosmetic: changing `seed` changes it, nothing else about the layout.
