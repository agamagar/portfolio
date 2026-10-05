# Reading Figma motion into code — the pipeline

Written after building two of these by hand (the Toppr scroll and the CaratLane
invite) and getting something wrong at nearly every step. Annotation msk7hjl1:
"not accurate with the figma motion proto, build a solid pipeline to use every
time you read figma motion frames."

Every rule below is here because it cost a debugging round, not because it
sounded sensible. Follow it in order.

---

## 0. Which MCP server

**REST carries no motion data at all.** `/v1/files/.../nodes` has zero hits for
`animation`, `keyframe`, `timeline`. Do not go looking; it is not there.

Motion comes only from `get_motion_context`, and **only from a server with edit
access to the file**. There are two Figma MCP servers connected here and they do
not have the same access — one returns *"you don't have edit access"* for
`Portfolio 2026` and the other returns the full cohort. If the first one refuses,
try the other before concluding anything.

Use REST for **geometry** (`absoluteBoundingBox`, `fills`, the node tree) and the
MCP for **motion**. Neither is a substitute for the other.

## 1. Pull the three things, in this order

```
1. get_motion_context   nodeId, recursive: true   -> keyframes, times, easings
2. REST /v1/files/:key/nodes?ids=&depth=4         -> the tree + every box
3. export_video         rootNodeId from the cohort -> the ground truth MP4
```

`export_video` wants **the top-level frame that owns the timeline** — the
`timelineCohorts[].rootNodeId` from step 1, not the layer you animated.

Step 3 is not optional. It is the only thing that can tell you the build is
wrong, and it is cheap.

## 2. Build the spec, do not hand-write the numbers

```
node tools/figma-motion/build-spec.mjs motion.json nodes.json <rootNodeId> > spec.json
```

This exists because **percentages resolve against the parent**, and a nested
timeline has as many coordinate spaces as it has levels. Hand-converting them
put every layer of the CaratLane card in the wrong place on the first pass. The
script does the division; you do not.

It also converts Figma's positional keyframes (which are in the **frame's**
pixels) into percentages of **each element's own box**, which is what `x`/`y`
mean in CSS and motion.

## 3. The gotchas, all of them

Each of these produced a build that looked plausible and was wrong.

**Motion / React**

- `initial={false}` against a **keyframe array** makes motion skip the sequence
  and render the last keyframe as a static style. Use `initial={keyframes[0]}`.
- `animate={undefined}` to "stop" reverts to `initial` — for a reveal that is
  opacity 0 and off-screen, so a paused cell renders *nothing*. Animate to the
  **end** of the timeline with `{duration: 0}` instead. The still frame of a
  reveal should be the thing revealed.
- Motion will not interpolate a keyframe array of **percentage strings** for
  `x`/`y` in every case. Numbers always work. If a percentage array sits still,
  that is why.

**CSS**

- A `transition` on the same property a re-rendering parent touches will
  **restart before it can advance**, and the computed value stays pinned at its
  start value forever. This looked exactly like "the rule is not applying" for
  three separate fixes. If a value reads back correctly off `.style` but
  `getComputedStyle` disagrees, suspect the transition first.
- A CSS **animation** beats an inline style in the cascade. A transition
  effectively does too, while it is running.

**Visibility — check it before you build anything**

- `get_motion_context` returns keyframes for nodes that are **hidden**, and the
  images API exports them happily when asked by id. A layer can arrive with
  animation, geometry and a PNG and still not be in the design.
- Visibility is **inherited**. On the Away frame the two greeting texts were
  `visible: true` inside a parent that was `visible: false` — I built both, and
  the phone rendered a greeting the reference video does not contain. The real
  greeting was elsewhere and revealed by an animated **height**, not a fade.
- `build-spec.mjs` now marks every layer `hidden: true/false` against its whole
  ancestry, and reports a `hiddenCount`. **If that count is not zero, read it
  before exporting a single asset.**
- The same flag explains export failures: a node that returns no image is
  usually hidden, not broken.

**Assets**

- `loading="lazy"` on the element that is the animation's **coordinate system**
  gives you `naturalWidth: 0`, a zero-height box, and every percentage resolving
  to nothing. Lazy is for pictures, not for geometry.
- Give that element an `aspect-ratio` so its box is correct on the **first**
  layout pass rather than when the bytes land.
- **Exported nodes are often transparent.** The fill you see in Figma frequently
  lives on an ancestor — check `fills` on the node *and* its parents, and paint
  the background yourself. The CaratLane strip composited as a double exposure
  until this was found.
- Figma **cannot export a group without its children**. If you need the parent
  and the children animated separately, you must export the siblings
  individually and reassemble, or edit the file.
- Make sure the **static base is the same frame variant** as the animation. Two
  exports can be the same size and different screens; ours differed in the
  bottom fifth and the seam showed.

**Springs**

- Figma returns a spring as a **closed-form decay function**, not a bezier:
  `1 - e^(-at)(cos bt + c·sin bt)`. motion takes an easing function directly —
  pass it through. Do not fit a cubic to it. You can tell it is working because
  the value **overshoots past its target** and settles back.

**Verifying**

- `document.hidden` **pauses everything**. A working animation and a dead one
  both measure zero in a hidden tab. Two full rounds of "fixes" were aimed at
  this. Check `document.hidden` before believing any measurement.
- A dispatched `pointerover` fires React handlers but does **not** set CSS
  `:hover`. Dispatched `pointerenter`/`pointerleave` fire neither.
- Setting `input.value` directly does not notify React. Use the native
  `HTMLInputElement` value setter.

## 4. Check it against the video

```
node tools/figma-motion/frames.mjs proto.mp4 frames/ 9
```

Writes `frames/t0.000.png … t1.000.png`, named by **normalised** time rather
than seconds — the only comparison that means anything is at the same fraction
of the loop, because the build and the export never share a clock. Screenshot the
running build at the same fractions and put them side by side.

**A build is not done until this has been run.** Every failure listed above was
invisible from the code and obvious from a frame.

## 5. What is currently NOT exact

Known and unfixed on the CaratLane reveal (`src/hello/InviteReveal.jsx`):

- **22 of the 27 animated nodes are individual stars**, each rotating in from
  its own large negative angle on its own stagger. They are children of the two
  cluster groups, so exporting them separately means 22 more assets or a file
  edit. The clusters travel exactly as specified; the stars arrive already spun.

That is the gap between "faithful" and "exact", and it is the first thing to
close if the reveal is ever judged not to match.

---

## 6. The harness: /motion-check verifies the build against the file

Added 2026-08-08 ("figma motion gives you exact key frames, so we need to
build a harness that check the exact motion and component specs"). Section 4's
frame-by-frame comparison stays useful for eyeballing; this is the part that
does not need eyes.

```
node tools/figma-motion/fetch-motion.mjs 80:2601 > specs/caratlane-motion.json
   # motion, straight from the DESKTOP app's MCP over localhost HTTP -
   # the app must be running with the file as the ACTIVE tab
   # (open "figma://file/<key>" first). No agent needed.

curl -H "X-Figma-Token: $(security find-generic-password -s figma-pat -w)" \
  "https://api.figma.com/v1/files/<key>/nodes?ids=<roots>&depth=10" \
  > specs/nodes-all.json                        # geometry, via REST

node tools/figma-motion/check-spec.mjs specs/caratlane-motion.json \
  specs/nodes-all.json 80:2601 > ../../src/hello/motion-checks/caratlane.check.json
   # compiles both into an evaluable spec: per animated node, its box and
   # per-property keyframes with each segment's easing AS DATA
   # (keyword / bezier points / spring constants - never code)

node tools/figma-motion/selftest.mjs
   # holds the evaluator to every keyframe of every compiled spec (~560
   # exact assertions) with no browser involved

open http://localhost:5173/motion-check
   # mounts the three built components at source-frame size and measures:
   # GEOMETRY  every [data-node] layer's box vs the spec, plus every <img>'s
   #           placed ratio vs its own pixels (catches the stretch class of
   #           bug) and its resolution for the size it renders
   # MOTION    one sampled loop per component, scored against the exact
   #           curves, with phase search and step-segment slop
```

Layers carry `data-node="<figma node id>"` so DOM and spec meet; add the
attribute when building a new layer, and `data-check="motion"` when the
element carries a track but not the node's box (a wrapper).

**Two gotchas the harness itself surfaced, day one:**

- **REST geometry is a snapshot of the file's CURRENT canvas state.** With the
  motion plugin's timeline sitting at its start, every animated node's
  `absoluteBoundingBox` is its INITIAL keyframe position, and every derived
  box is wrong by exactly the entrance travel. Fetch nodes with the file at
  its rest state, and if the check page reports one systematic offset per
  animated ancestor that matches the entrance distances, this is why.
- **A hidden tab cannot even SETTLE.** motion's zero-duration "animate to the
  end" still needs one tick, so in a hidden tab a paused component sits at
  `initial` forever - geometry measures the entrance offsets as failures
  (the card read +51.2% of frame: its 400px rise). /motion-check therefore
  refuses to measure anything while `document.hidden` and re-arms on
  visibilitychange. Do not "fix" the numbers; front the tab.

The spring lands 0.999x of its travel at segment end - the closed form never
reaches exactly 1 - and the build runs the same function, so the selftest
allows the same fraction. Every other keyframe is exact to 1e-6.
