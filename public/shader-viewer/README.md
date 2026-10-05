# Shader Viewer

A local GLSL fragment-shader playground, in the spirit of [shadergpt.14islands.com](https://shadergpt.14islands.com). Full-screen WebGL render with a floating control that collapses to a pill at the bottom of the screen and expands on click. Edit the shader live, and save named presets straight into this project folder.

Styled to match the portfolio design system (Inter + Newsreader, the `--fg / --muted / --line / --link` tokens, Material 3 motion easings, and global squircle corners).

## Two ways to run

The viewer auto-detects which mode it's in and adapts the Save behavior.

### 1. Local, with the Node server (saves real files to the repo)

```bash
cd "Independent/Personal Tools/shader-viewer"
node server.mjs          # → http://localhost:5173
# or pick a port:  PORT=4000 node server.mjs
```

No dependencies, no build step — just Node (v18+). In this mode **Save** writes `presets/<name>.frag` into the project folder, and the static bundle (`presets.bundled.js`) is regenerated automatically so a web deploy stays in sync.

### 2. Static web (no server, e.g. GitHub Pages / Netlify / your portfolio)

Just host the folder's files. Open `index.html` and everything renders. Because there's no API, the page falls into **browser mode**:

- seed presets load from `presets.bundled.js` (committed, generated from `presets/*.frag`)
- **Save** stores the preset in `localStorage` *and* downloads a `<name>.frag` you can drop into `presets/` if you want it in the repo
- bundled presets are read-only; your own saved presets can be deleted

Opening `index.html` directly via `file://` works too (renders + browser-mode saves), though some browsers restrict `localStorage` on `file://` — running either server above avoids that.

To regenerate the static bundle by hand after editing presets:

```bash
node build-presets.mjs
```

## Using it

- The **floater** sits collapsed at the bottom center. Click it (or the chevron) to expand.
- **Presets** appear as chips. Click one to load it; hover a chip and click the ✕ to delete it.
- The **code box** holds the full fragment shader. It recompiles live as you type; the dot turns red and the status line shows the GLSL error if compilation fails (the last good shader keeps rendering).
- Type a name and hit **Save preset** to write it to `presets/<name>.frag`.
- **New** loads a blank starter shader.

## Shader contract

Every shader is a complete fragment shader and receives:

| Uniform / varying | Type    | Meaning                                   |
|-------------------|---------|-------------------------------------------|
| `u_time`          | `float` | seconds since load                        |
| `u_mouse`         | `vec2`  | pointer position, normalized `0..1`, y up |
| `u_resolution`    | `vec2`  | canvas size in device pixels              |
| `v_uv`            | `vec2`  | fragment UV, `0..1` (from a fullscreen tri)|

Output to `gl_FragColor`. Start your file with `precision mediump float;`.

## How presets persist

`server.mjs` exposes a tiny JSON API the page calls:

- `GET /api/presets` — list every `presets/*.frag` with its code
- `POST /api/presets` `{ name, code }` — write/overwrite `presets/<slug>.frag`
- `DELETE /api/presets/<id>` — remove one

The human name is stamped as a `// name: …` comment on the first line, so the `.frag` files are self-describing and editable by hand.

## Files

```
shader-viewer/
├── index.html          ← viewer + floater UI (single file, vanilla JS)
├── server.mjs          ← zero-dep static server + preset API (local mode)
├── build-presets.mjs   ← generates presets.bundled.js from presets/*.frag
├── presets.bundled.js  ← auto-generated seed presets for static/web mode
├── presets/            ← saved shaders (.frag), written by Save in local mode
│   ├── clouds.frag
│   └── sun.frag
└── README.md
```
