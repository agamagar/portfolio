# Design Mode pipeline — Figma screen → animated mock

"Design Mode" puts the **exact Figma screen** on the page (pixel for pixel) and
animates **only the directed regions**. Use it when fidelity matters more than a
hand-coded figure (the `fig:` coded components are the other mode — "SVG mode" —
where every element is rebuilt so it can be animated).

Use Design Mode when: the screen is final in Figma, you want it 1:1, and only part
of it moves (a sky, a loader, a value count, a crossfade between two states).

---

## The pipeline (repeatable)

### 1. Identify the frame + the animated source
In Figma get the **frame node id**, its natural **w×h**, and the **layer(s) that
animate** (here: a `clouds-loop` video fill inside the `background` instance). A
read-only `use_figma` / `get_metadata` pass gives node ids and boxes.

### 2. Export the OPAQUE plate (animated source hidden)
The plate is the screen with the animated source **hidden**, so that area exports
as the flat device colour. The motion is re-added in code over it.

```js
// use_figma — hide the animated source, stash its visibility, LEAVE for export
const n = await figma.getNodeByIdAsync("<sourceLayerId>");
n.setSharedPluginData("ns","vis",String(n.visible));
n.visible = false;
```
```
// download_assets — nodeId=<frameId>, format=png, scale=3  →  export.url
curl -o public/figures/<case>/<name>/<screen>-ui.png "<export.url>"
```
```js
// use_figma — restore (hide is a temporary mutation; ALWAYS restore)
n.visible = (n.getSharedPluginData("ns","vis") !== "false");
```

**Hard-won gotchas:**
- **Do NOT clear the frame fill to get a transparent plate.** `download_assets`
  flattens true transparency to grey (`#444`). Keep the frame **opaque**; hide
  only the animated source so that region exports as the flat device colour, then
  **screen-blend** the live region over it in code.
- `figma.io.write` / `exportAsync`+`base64Encode` can't get bytes to disk here
  (inline image only / 20 KB result cap). `download_assets`' `export.url` → `curl`
  is the reliable path.
- Always restore the file after exporting.

### 3. Wire the section data
```js
design: {
  w: 360, h: 791, bg: "#0e0e12",          // frame size + device body colour
  mocks: [{
    base: "/figures/<case>/<name>/<screen>-ui.png",  // opaque pixel-perfect plate
    regions: [{
      box: [0, 0, 100, 30],               // % of the mock
      kind: "shader", preset: "clouds", dark: false,
      blend: "screen",                    // drops the dark plate, keeps bright UI
      maskFade: [52, 100],                // fades out before it reaches text
    }],
  }],
}
```
- `blend: "screen"` over the dark sky region shows the shader; white UI (status
  bar, greeting) is preserved by screen, so legibility is untouched.
- `maskFade` keeps the live region in the sky strip and off the text.

### 4. It renders via `DesignFigure`
`src/figures/design/DesignFigure.jsx` composites plate + directed regions. The
shader is in-view-gated and reduced-motion-safe (see `ShaderCanvas`).

---

## Region kinds (extensible)
- `shader` — a live WebGL sky (`preset`: `clouds` | `golden` | `iridescent`, `dark`).
- next: `crossfade` (between two plates), `lottie`, a coded micro-overlay.

## Files
- Component: `src/figures/design/DesignFigure.jsx`
- CSS: `src/figures/design/design.css`
- Shaders: `src/ShaderCanvas.jsx` + `src/shaders/washes.js`
- Plates: `public/figures/<case>/<name>/`

## First instance
`caseStudies["away-agent"]` → section **"A home that knows the hour"**: the Away
home at three times of day (morning / evening / night), the exact Figma screens
with only the sky animated.
