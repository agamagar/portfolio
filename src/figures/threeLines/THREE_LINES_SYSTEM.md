# Three Lines · system rules

The grammar of the `/three-lines` icon system. Read before adding or editing
icons. Distilled from building the set + the lessons in
benji.org/morphing-icons-with-claude (rotation groups; and the reminder that
an agent must LOOK at intermediate frames, endpoints alone prove nothing).

## 1. Render contract
- Every icon is EXACTLY three strokes. Nothing enters or leaves the DOM;
  three `<path>` elements, `stroke: currentColor`, width 2, round caps and
  joins, viewBox 24, content roughly 4..20.
- A stroke is a straight segment `[x1, y1, x2, y2]`, a closed ellipse
  `{ cx, cy, rx, ry, start }` (degrees), or a closed polygon
  `{ poly: [[x, y], ...] }`. Nothing else.
- All strokes resample to `SAMPLES` (48) points before morphing, so every
  pair of icons corresponds point-for-point by construction.

## 2. Slot law
The three strokes keep stable roles across the set: a = top, b = middle,
c = bottom of the hamburger skeleton. Morphs must read as the same three
lines rearranging, never as random segments swapping jobs.
- Icons needing only 2 visible strokes park the spare as an EXACT duplicate
  of another stroke (never hidden via opacity; the set's story is that
  nothing is ever added or removed).
- Dots are strokes too: a near-zero segment renders a stroke-width dot via
  its round caps ("more"); a circle with r = strokeWidth/2 renders a SOLID
  disc, hole closes to zero ("seed", diameter 4 at stroke 2).

## 3. Closed shapes
- Sample t from 0..1 INCLUSIVE so first point == last point; a sampled loop
  must have no notch.
- Choose `start` so the seam faces the adjacent stroke it belongs with
  (user's head opens toward the shoulders, shoulders toward the head), and
  so unrolls read toward the seam.
- 48 points is enough: max sagitta error at the 220px hero is about 0.16px.
  (The QA sheet renders at 86px where it is far below visible.)
- Polygons allocate samples per edge proportional to length and force EVERY
  vertex onto a sample, so corners stay sharp through morphs instead of
  eroding into wobble. The first vertex is the seam; order vertices so the
  seam faces the adjacent stroke.

## 4. Rotation groups (the benji.org rule)
- Icons that are the same glyph at different orientations carry
  `rot: { group, angle }` and MUST be exact rigid rotations of one base
  shape about (12,12). Current groups: `arrow` (right 0 / up -90 /
  left 180), `chevron` (down 0 / up 180), `cross` (plus 0 / close 45).
- Within a group the morph is a rigid `rotate()` of the whole `<g>` by the
  shortest signed delta; endpoint-lerping two orientations of one shape
  bends strokes that should just turn.
- Rotation runs only from a SETTLED glyph. Interrupt mid-flight and the
  engine bakes the partial rotation into the points and falls back to the
  point morph; continuity beats purity.
- On completion the engine parks the target's own slot assignment (an
  invisible swap, the union is identical). Consequence: group members do
  not need slot-aligned definitions, but they DO need identical unions.

## 5. Motion
- Springs only, via `spring("throw")` from `ds/hooks.js` (:root tokens,
  never inline stiffness/damping). Stroke stagger 0.045s (0.055 on the
  hero). Entrances: mount parked on Seed (`enterFrom`), bloom in with
  `enterDelay = 0.25 + index * 0.05`.
- Everything must survive overshoot: springs extrapolate past t=1, so the
  QA sheet renders t=1.15 and no pair may invert, cross, or collapse there.
- Reduced motion: no auto-cycle, no entrance, swaps are instant. Always.

## 6. Engine invariants (ThreeLinesIcon.jsx)
- Motion's SVG components DO NOT animate geometry attributes (x1/y1/x2/y2
  froze silently). All geometry is driven imperatively: standalone
  `animate(0, 1, { onUpdate })` writing `setAttribute('d')`.
- JSX renders the `<path>` elements with NO d prop, so a React re-render
  can never snap a morph back mid-flight. Mount state parks in
  `useLayoutEffect` (before first paint).
- Retargets start from the currently rendered points; morphs are always
  interruptible and continuous.

## 7. Export contract
`standaloneSvg()` emits real primitives (`<line>` / `<ellipse>`), literal
near-black ink, never the 48-point polylines.

## 8. QA loop (closed loop, run it every time the set changes)
1. `node tools/three-lines-qa.mjs` (Portfolio root) renders every
   cycle-order transition + representative cross-jumps at
   t = 0/.25/.5/.75/1/1.15 into `tools/three-lines-sheet.png` (pure data
   import, headless Chrome, no dev server, so no rAF throttling).
2. LOOK at every row. Endpoints are never the question; judge the
   intermediates: does the morph read as intentional (rearrange, turn,
   unroll) or as mush? Would a rotation group serve this pair better?
3. Fix data, re-render, repeat until no row is judged mush.
4. Verdicts stay written here:
   - Judged GOOD: all rotations; seed/menu/user/more/play family unrolls;
     shapes>seed (the shapes deflate into the dots, ideal cycle closer).
   - Judged ACCEPTABLE (watched pairs, busy mid-flight but resolve):
     arrow-right>check, menu>user, chevron-up>arrow-left, user>vee
     (knotty around t=0.4 since both are all-closed glyphs, resolves by
     0.75). vee>shapes IMPROVED when Vee became wedge polygons
     (closed-to-closed reads as reshaping, not sticks inflating).
   - Fixed by rule 4: close>plus (was an awkward lerp, now a 45deg spin).

## 9. Add-an-icon checklist
- [ ] Exactly 3 strokes, content within 4..20, slot roles respected
- [ ] Duplicate (not hide) any spare stroke
- [ ] Same glyph as an existing icon at another angle? Join/create a
      rotation group with EXACT rotated geometry instead of new freehand
      coordinates
- [ ] Closed curves: seam faces the adjacent stroke
- [ ] Append to ICONS (never index 0; Seed owns it), key + name
- [ ] Run the QA loop (rule 8); judge the new row against its cycle
      neighbours and the seed entrance
- [ ] Build + em-dash/tilde lint
