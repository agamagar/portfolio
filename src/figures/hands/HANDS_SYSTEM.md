# Doodle hands: SVG construction system

The rules every hand in `handsData.js` obeys, so the set reads as one family and
new hands can be added without drifting. Derived by building the 25-pose set
against the reference sheet in a render → compare → fix closed loop.

## 1. Render contract

- **Canvas**: `viewBox="0 0 120 120"`, one hand per plate, roughly centred.
- Each hand is `{ cell, name, paths: [{ d, fill }] }`.
- `fill: true` → the path is filled with **paper** (`#FFFFFF`) and stroked.
- `fill: false` → stroke-only detail line (`fill="none"`).
- The renderer applies the stroke to every path; `d` carries only geometry.

## 2. Palette and stroke (never varies)

| Token | Value |
| --- | --- |
| Ink | `#1A1A1A` |
| Paper | `#FFFFFF` |
| `stroke-width` | `3` |
| `stroke-linecap` | `round` |
| `stroke-linejoin` | `round` |

Plates stay literal ink-on-paper in **both** light and dark themes (like the dark
figure vitrines keep their own palette). No colour, no shading, no gradient, no
hatching, no texture.

## 3. The four-finger law

Exactly **four digits total: three fingers + one thumb**. Never five. This is the
single hardest rule to keep, and every new pose gets counted before it ships.

## 4. Construction grammar

A hand is assembled from filled shapes stacked back-to-front. **Draw order is
load-bearing**: a later path's white fill knocks out the strokes beneath it, and
that knock-out seam *is* the finger-over-palm overlap line. You never draw the
overlap by hand; you get it for free by layering.

Draw in this order:

1. **Base blob** (fill): palm + arm as one silhouette. Folded or curled digits
   live *inside* this silhouette; only extended digits become separate shapes.
2. **Extended fingers** (fill): one "sausage" per finger, a long rounded shape,
   drawn on top of the palm so its white fill cuts the palm edge behind it.
3. **Thumb** (fill): a shorter, fatter sausage or bump, off one side of the palm.
4. **Detail lines** (stroke-only): knuckle humps and creases, last, on top.

### 4a. Open wrist

The wrist is **never closed with a stump or cuff**. Run the base blob's two
contour lines off the canvas edge (or let them stop short and trail); the fill's
closing chord then sits off-plate or hidden. The arm reads as cut off by the
frame, matching the reference sheet.

### 4b. Curled fist / knuckles

For a fist facing the viewer, the curled fingers are a **row of small filled
humps** on the leading face (see `R4C4 Knock fist`, `R2C1 Punch fist`). One
crease line under the knuckles finishes it.

### 4c. Creases

Stroke-only, `fill:false`, **0 to 2 per hand**. A crease is one short single
stroke, never a cluster. Palm creases and finger-fold hints only.

## 5. Proportion tokens (approximate, in viewBox units)

| Part | Size (approx.) |
| --- | --- |
| Palm width | 44 |
| Palm height | 46 |
| Finger width | 11–13 (chubby, bulbous, rounded tip) |
| Extended finger length | 30–40 |
| Thumb | shorter + fatter than a finger |
| Knuckle hump | 5–6 radius |

Shapes are **springy and slightly asymmetric**, hand-drawn energy, not geometric
precision. Bulbous over tapered. If it looks like a clean vector icon, it is wrong.

## 6. Props

Anything held (pencil, token, mug) is drawn in the **same single outline + white
fill**, at the same stroke weight, and layered by the same knock-out rule so the
fingers overlap it correctly.

## 7. Adding a new hand

1. Pick the pose; find the closest existing hand and copy its path structure.
2. Lay the base blob first, wrist running off an edge.
3. Add extended fingers as sausages, on top, **counting to exactly four digits**.
4. Add the thumb, then 0–2 creases / knuckle humps.
5. Render and compare (Section 8). Fix the silhouette before the details.

## 8. The QA loop (how this set was tuned)

Closed loop, no dev server, no browser tab touched:

1. `node scratchpad/render-hands.mjs` renders `handsData.js` to a 5×5 PNG via
   headless Chrome from a standalone HTML sheet.
2. Read the PNG, compare each cell to the reference held in context.
3. Fix the divergent cells (silhouette first, then digit count, then detail).
4. Re-render and repeat until the set converges.

A literal pixel overlay needs the reference as a file; when it lives only in chat,
this visual convergence loop is the substitute and reaches the same place.

## 9. Alignment with the prompt-library style

This vector system is the code twin of the **Doodle hands** group in the prompt
library (`src/prd/promptLibraryData.js`): same thin `#1A1A1A` line, puffy
four-finger anatomy, flat white fill, open wrists. The prompts drive raster
image-gen (Nano Banana 2); this file drives crisp inline SVG. Keep the two in step
when either changes.
