# Figma fidelity check

A permanent, repeatable check that every rebuilt case-study screen actually
matches its Figma source. It rasterizes each figure's SVG and compares it,
pixel for pixel, against the Figma reference render, then writes a side-by-side
composite to look at. Fully headless: **no browser, no dev server, no touching
anyone's open tab.**

Why it exists: the raw Figma SVG export is unusable as a live figure (multi-MB,
text flattened to outlines), so each screen is hand-rebuilt as a compact,
animatable SVG. Hand-rebuilding drifts from the design unless it's measured.
This is the measurement.

## Run

```bash
node tools/figma-fidelity/check.mjs            # all figures
node tools/figma-fidelity/check.mjs awayLanding # one figure
# or: npm run check:figma
```

Each figure prints a verdict, and a composite is written to
`out/<name>.compare.png` laid out as **FIGMA (reference) | REBUILD | diff
heatmap**. Open that image to see exactly where the rebuild diverges (bright red
= biggest difference).

## Reading the result

- **fidelity %** — `100 * (1 - mean-abs-pixel-error / 255)`. Runs high even with
  visible mismatches, because a phone screen is mostly one background colour.
  Don't trust it alone.
- **diff % px** — share of pixels differing beyond a perceptual threshold. The
  honest number.
- **verdict** — PASS (<=6% px), WARN (<=18%), FAIL (>18%).

Text-heavy screens floor around **8-12% px** even when correct, because resvg
and Figma rasterize Inter with slightly different anti-aliasing and baselines.
So: **the heatmap is the arbiter** (is the red just text edges, or whole
mislaid elements?), and the numbers are the regression guardrail (did a change
make it worse?).

## Add a screen

1. Export the frame from Figma (`download_assets` or `get_screenshot` on the
   node) and save the PNG to `refs/<name>.png` at the frame's pixel size.
2. Rebuild the screen as `src/figures/<name>.svg` — real `<text>`/`<rect>`
   nodes, with `class` hooks (`fig-greeting`, `fig-card`, ...) for animation.
3. Add an entry to `figures.json` (`name`, `svg`, `ref`, `renderWidth`, and the
   Figma `fileKey`/`nodeId` for re-export later).
4. Run the check, open the composite, and iterate the SVG until the heatmap is
   just text anti-aliasing.

The same `.svg` is inlined by the React figure component (Vite `?raw` import),
so **what ships is exactly what's checked** — one source of truth.

## Requires

- `tools/figma-fidelity/node_modules` — `@resvg/resvg-js`, installed here and
  isolated from the app's dependencies (the app's `better-sqlite3` dep can't
  build on Node 23 + a spaced path, so the app's own `npm install` is avoided).
- `python3` with Pillow + numpy (`compare.py`).
- **Inter** installed system-wide (`~/Library/Fonts/inter.ttc`) — resvg loads
  system fonts, so text renders with the real typeface.
