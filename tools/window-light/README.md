# window-light: the loop tooling

Tools that let every builder of the window scene, and the tuning loop, **see** and **score**
renders. The spec is in `spec/` (`30-locked-brief.md` wins over everything else). Nothing here
touches the site's source; the tools only read pages from a dev server.

The built-in browser pane cannot show WebGL. Use `render.mjs`, then look at the PNG.

## Files

| Path | What it is |
|---|---|
| `render.mjs` | Headless GPU renders over CDP (system Chrome, Node's built-in WebSocket, no dependencies). One shot or a batch in one browser session. Writes PNG + sidecar JSON (+ console log). |
| `compare.py` | Scores a render against a reference photo: SSIM, edge IoU, 8 x 6 grid log-luminance and CIEDE2000, histogram EMD, per-region stats, one composite. Writes metrics JSON + a labelled side-by-side PNG. |
| `sheet.py` | Tiles N renders into a labelled contact sheet (sweeps). |
| `lookkeys.mjs` | Fails (exit 1) when a look's patch in `looks.js` names a build-time params path, one a live menu switch (`setLook`) would ignore: the bamboo, canopy and far-tree palettes, the street heads, the horizon band's and the building's shape keys, the rain's counts. Strict for `cyberpunk`; `node tools/window-light/lookkeys.mjs [look]` checks any look. |
| `regions.py` | Shared: load, rasterise and draw region polygons. |
| `derive_regions_1741.py` | Rebuilds `ref/regions_1741.json` and `ref/regions_1741_overlay.png` from measurements on `ref_1600.png`. |
| `ref/regions_1741.json` | Named region polygons for the 17:41 reference (normalised coordinates; serves `ref_1600.png` and `ref_800.png`). |
| `ref/regions_1741_overlay.png` | The regions drawn over the reference. Look at it after any change. |
| `shots/*.json` | Batch files: `tooling-test.json` (the test below), `ref1741-looks.json`, `tod-sweep.json`, `weather-sweep.json` (these three target `/window`, which does not exist yet). |
| `selftest/scene-stub.html`, `scene-stub.js` | A tiny three r186 `WebGPURenderer` page that implements the `window.__windowScene` contract. Reference implementation for the scene builder, and the test fixture for `render.mjs`. |
| `selftest/compare_sanity.py` | Proves `compare.py` measures what it claims on synthetic edits of the reference (10 assertions). |
| `vite.fallback.config.mjs` | The project's Vite config with its own dependency cache, used only when `render.mjs` has to start a server. |
| `runs/` | Outputs. `runs/tooling-test/` holds the test run described at the end. Prune old runs: this folder syncs to Google Drive. |

## Quick start

```sh
cd "/Users/agamagarwal/My Drive/Active - Portfolio/Portfolio"

# 1. one render at the solved 17:41 framing (once /window exists)
node tools/window-light/render.mjs --url "/window?shot=ref1741&tod=17.699&wx=partly&look=photo&theme=light&capture=1&t=0" \
  --w 1600 --h 1200 --out tools/window-light/runs/today/ref1741.png --console

# 2. score it against the photo (regions are found automatically)
python3 tools/window-light/compare.py tools/window-light/runs/today/ref1741.png tools/window-light/ref/ref_1600.png --draw-regions

# 3. a time-of-day sweep and its contact sheet
node tools/window-light/render.mjs --batch tools/window-light/shots/tod-sweep.json --outdir tools/window-light/runs/today/tod
python3 tools/window-light/sheet.py tools/window-light/runs/today/tod/sheet.png tools/window-light/runs/today/tod/tod-*.png --title "tod sweep, photo look"
```

Then open the PNGs with the Read tool before saying anything about how they look.

## render.mjs

```
node tools/window-light/render.mjs --url PATH [options]
node tools/window-light/render.mjs --batch shots.json [--outdir DIR] [options]
node tools/window-light/render.mjs --probe
node tools/window-light/render.mjs --help
```

| Option | Default | Meaning |
|---|---|---|
| `--base URL` | `http://localhost:5173` | Server to render from. If unreachable (and local): reuse `:5175` only if it is a Vite dev server (`/@vite/client` answers), else start `node_modules/.bin/vite --strictPort` on `:5175`, or on a free port when something else holds 5175 (another agent had a plain `python3 -m http.server` there during testing). The spawned server uses `vite.fallback.config.mjs` (own cache in `node_modules/.vite-window-light`, so Agam's server's `node_modules/.vite` is never rewritten) and is stopped afterwards. |
| `--static` | off | Serve the project root as plain files on a free `127.0.0.1` port instead (for HTML fixtures such as the stub; not for app routes, which need Vite). |
| `--url PATH` | required | Path plus query, or a full `http` URL. |
| `--w --h --dpr` | `1440 900 1` | CSS viewport and device pixel ratio. The PNG is exactly `w*dpr` x `h*dpr` (checked; a mismatch is a warning). |
| `--out FILE.png` | `runs/adhoc/<slug>-<w>x<h>@<dpr>-<time>.png` | Output PNG; `.json` and `.log` go beside it. |
| `--outdir DIR` | `runs/<batch file name>` | Batch output folder; files are `<name>.png/.json/.log`. |
| `--frames N` | `24` | After `__windowScene.ready`: `renderFrames(N)` (TRAA convergence), then two animation frames, then capture. |
| `--settle MS` | `1500` | Pages without `__windowScene`: wait for load, `document.fonts.ready` (10 s cap), then this long. |
| `--wait-for SEL` | none | Pages without `__windowScene`: first wait until an element matching `SEL` is visible, for example `canvas`. |
| `--scene MODE` | `auto` | `auto` looks for `window.__windowScene`; `require` fails the shot without it; `skip` never looks. |
| `--scene-wait MS` | 15000 on `/window...` or `scene=window`, else 2500 | How long to look for `window.__windowScene` after load. |
| `--scheme S` | none | Emulate `prefers-color-scheme: light` or `dark`. (The scene's own `theme=` URL param is separate.) |
| `--reduced-motion` | off | Emulate `prefers-reduced-motion: reduce` (batch key `reducedMotion: true`). |
| `--expect "P=V;Q"` | none | After the shot, assert each params path `P` is in the sidecar's `params` (and equals `V`, JSON or a bare string, when given); a miss fails the shot and the run exits 1. Batch key `expect` (a string or an array). Guards against a silent HMR reload dropping a look's patch mid-batch. |
| `--eval JS` | none | Expression evaluated and awaited after `ready` (or after settle), before the frames. Example: `--eval "window.__windowScene.setParams({lamp:{intensity:20}})"`. Its result, when JSON-serialisable and under 50 KB, is kept in the sidecar as `evalResult` (for example a `setLook` timing, or `window.__windowOutside.debug()`). |
| `--timeout MS` | `90000` | Per shot. On timeout or error the page is still captured and the shot is marked. |
| `--console` | off | Write console errors, warnings and uncaught exceptions to `NAME.log`. (They are always counted in the sidecar.) |
| `--strict` | off | Exit 1 if any shot logged a console error. |
| `--flags "..."` | none | Extra Chrome flags. |
| `--quiet` | off | Skip the server and Chrome lines (per-shot lines still print). |
| `--probe` | | Print Chrome's version, flags and the WebGL2 and WebGPU adapters, then exit. |

**Batch file**: an array of shots, or `{ "defaults": {...}, "shots": [...] }`. A shot takes `name`
(letters, digits, `.`, `-`, `_`; unique), `url`, `w`, `h`, `dpr`, `frames`, `settle`, `scheme`,
`eval`, `timeout`, `scene`, `sceneWait`, `waitFor`, `out`. Precedence for each key: the shot,
then the command line, then the file's `defaults`, then the built-in default (so `--frames 64`
re-runs a sweep with more frames). Every shot runs in the same browser session, each after a
full navigation through `about:blank`.

**Per shot it writes**

* `NAME.png`: `Page.captureScreenshot` (`fromSurface`, viewport only) at the exact viewport and DPR.
* `NAME.json`: `url`, `base` and where it came from, the requested settings, `httpStatus` of the
  page, `png` (size, `sizeOk`), `image` (mean and std of luma, black and white fractions, `blank`
  when std < 3), `canvas` (every canvas's size, rect, on-screen fraction; stats of the captured
  pixels inside the largest on-screen canvas, DOM drawn over it included), `timing` (load, scene
  found, ready, frames, capture, total), `scene` (`present`, `version`, `framesRendered`,
  `stats()`, a `params` snapshot when under 200 KB), `console` (error, warning and exception
  counts, the first five errors, the log path), `gpu` (WebGL2 renderer string, WebGPU adapter),
  `chrome` (version, flags), `status` (`ok`, `timeout`, `error`), `error`, `warnings`.
* `NAME.log` with `--console`: one line per error or warning: time since start, level, source, text, location.

Stdout gets one line per shot: status, name, PNG size, scene backend, console counts, the largest
canvas's on-screen size and luma std (near 0 means a black or blank canvas), time, path; then
any error and warnings. **Exit codes**: 0 all shots ok; 1 a shot failed (or console errors under
`--strict`); 2 a usage error; 130 interrupted (Chrome and its profile are cleaned up first).

**Chrome profile**: every run makes a fresh `--user-data-dir` in
`/private/tmp/claude-501/-Users-agamagarwal-My-Drive-Active---Portfolio/f6eb71b2-3a66-4ec7-b85d-ffd026e2b335/scratchpad/chrome-profiles/`
(override with `WL_PROFILES`) and deletes it afterwards, including on Ctrl-C. It never uses the
default profile. `--password-store=basic --use-mock-keychain` keep it off the macOS keychain.

### GPU in headless Chrome on this Mac (measured 2026-09-26)

Chrome 153.0.8010.53, `--headless=new`, Apple M3 Pro, macOS 26.2 (Darwin 25.2):

| Flags | WebGL2 renderer | WebGPU |
|---|---|---|
| none | ANGLE Metal Renderer: Apple M3 Pro | adapter `apple` / `metal-3`, not a fallback adapter, device OK (localhost pages; WebGPU needs a secure context) |
| `--use-angle=metal` | same | same |
| `--use-angle=metal --enable-unsafe-webgpu --ignore-gpu-blocklist` (what `render.mjs` passes) | same | same, 25 features |
| `--use-angle=gl` | none (no WebGL2 context) | |
| `--use-angle=swiftshader --enable-unsafe-swiftshader` | SwiftShader (CPU). Never use it for look development. | |

So **headless WebGPU on macOS needs no special flag in Chrome 153**; `--use-angle=metal` pins
WebGL2 to the real GPU explicitly; the other two flags are insurance for older builds or a
blocklisted GPU and change nothing here. Verified in captures, not just in the API: a raw WebGPU
canvas, a raw WebGL2 canvas, an offscreen WebGL2 canvas copied into a WebGPU texture with
`copyExternalImageToTexture` on the same page (the planned Living Sky path), and three r186
`WebGPURenderer` on both backends all show up in `Page.captureScreenshot`.

`--hide-scrollbars` matters: a 15 px scrollbar re-wraps a layout. (It fooled the first capture
test into looking like a WebGPU failure.)

### What the scene must provide (for the scene builder)

The contract is in `spec/30-locked-brief.md`. What `render.mjs` relies on in practice:

* `window.__windowScene` exists soon after load. `render.mjs` polls for it for up to 15 s on
  `/window` URLs, so defining it before the lazy chunk finishes is not required, but it must
  appear within that window.
* `ready` is a Promise (a function returning one also works) that resolves after
  `renderer.init()`, `compileAsync` and a first settled frame.
* `renderFrames(n)` resolves after the nth frame has been drawn to the visible canvas. With
  `capture=1` the scene must not keep changing after it (static camera, frozen `t`), so the
  captured frame is the converged one. Identical shots of the stub are pixel-identical (max
  difference 0), which is the bar for the real scene.
* `stats()` must return the **last rendered frame's** counters, snapshotted right after
  `renderer.render`: r186's internal animation loop calls `renderer.info.reset()` on every
  animation frame (`node_modules/three/src/renderers/common/Animation.js:81`), so reading
  `renderer.info.render` later always gives 0. (Found with the stub; `selftest/scene-stub.js`
  shows the fix.)
* `params` is JSON-serialisable (it is copied into the sidecar).

`selftest/scene-stub.js` is a complete, small reference implementation.

### Timing and pitfalls

* **On battery** (2026-10-06, 19 %): Chrome's energy saver held the headless page to about one
  frame a second and its first scripts to 20 to 30 s, so every `/window` shot timed out at the
  scene check (`renderFrames(24)` on the stub took 21 s). Pass
  `--flags "--disable-features=BatterySaverModeAvailable,HighEfficiencyModeAvailable --disable-background-timer-throttling --disable-backgrounding-occluded-windows"`
  with `--scene-wait 90000`; the scene check now keeps looking while the page is busy (a
  5 s evaluate that times out is not a failure until `--scene-wait` runs out). Renders match
  the plugged-in ones within the usual noise.
* The stub renders in about 0.5 to 1 s per shot; `/sky` and `/dj` in 5 to 9 s (mostly the settle).
* **Cold Vite loads**: the first `/dj` after the three r186 upgrade was still compiling when a
  3 s settle ended and came back blank white. The blank check flagged it. Use `--wait-for canvas`
  for pages without `__windowScene`, and read the warnings.
* `document.fonts.ready` hung for 10 s once on a first `/dj` load; `render.mjs` caps it and warns.
* A `/window` URL without `capture=1` gets a warning (DOM chrome, random seeds and live time
  would stay on).
* A base URL can be "reachable" and still wrong: something else was listening on `:5199` during
  testing and served a 404 page. The sidecar records `httpStatus` and warns at 400 and above.

## compare.py

```
python3 tools/window-light/compare.py RENDER.png REF.png [--regions R.json] [--no-regions]
        [--fit auto|stretch|crop] [--out PREFIX] [--draw-regions] [--no-png] [--quiet]
```

Writes `PREFIX.json` and `PREFIX.png` (default `PREFIX` = the render path minus `.png` plus
`.vs-<ref stem>`), prints one summary line. numpy, PIL and skimage only; about 1 s per compare.

**Fit**: both images are read as 8 bit sRGB; the render is resized to the reference size with
Lanczos. If the aspect ratios differ by more than 1 percent, `--fit auto` (default) centre-crops
the render to the reference's aspect first: right when the scene keeps the reference's vertical
FOV on a wider page. `--fit stretch` resizes regardless; `--fit crop` always crops.

**Regions**: without `--regions`, the `regions_*.json` beside the reference that lists it in
`image` or `images` is used (so `ref_1600.png` and `ref_800.png` both find `regions_1741.json`).

**Metrics**

| Key | Definition |
|---|---|
| `ssim` | SSIM of CIE L*/100 at 400 px wide (Gaussian window, sigma 1.5). |
| `edges.iou` | Canny on L*/100 at 800 px wide (sigma 2, hysteresis at the 85th and 95th gradient percentiles so exposure does not move the edge set), both maps dilated 2 px, intersection over union. Also `precision` (render edges landing on a reference edge), `recall` (reference edges covered), `f1`. Scores the geometry of bars, rails, stiles and the monitor. |
| `grid.log_lum_rmse_stops` | 8 x 6 cells, per-cell mean linear RGB, RMSE of log2(Y render / Y ref) over the cells (Y floor 1e-3). |
| `grid.mean_de2000` | Mean CIEDE2000 between the cell means (also `max_de2000`; both per-cell tables, rows top to bottom, are in the JSON). |
| `histogram.emd_lstar` | Earth mover's distance between the two L* histograms (200 bins over 0 to 100), in L* units. |
| `regions.<name>` | `ref_Y`, `render_Y` (mean linear luminance), `lum_ratio` render/ref and `stops`; `ref_L`, `render_L`; chroma `ref_C`, `render_C`, `dC`; hue `ref_h`, `render_h`, `dh_deg` (render minus ref; `hue_reliable` is false when both C* < 5); `d_ab` = sqrt(da^2 + db^2) of the region means (colour without lightness); `de2000` of the means; `ref_clip_frac`, `render_clip_frac` (max channel >= 250); `score`. |

**Composite** (0 to 100, higher is better; weights sum to 1):

| Weight | Term |
|---|---|
| 0.25 | `ssim`, clamped to 0..1 |
| 0.20 | `edges.iou` (raw; a perfect-geometry render still differs in texture, so the practical ceiling is well under 1) |
| 0.20 | 0.5 ^ `grid.log_lum_rmse_stops` (1 stop RMSE halves it) |
| 0.10 | 0.5 ^ (`grid.mean_de2000` / 10) |
| 0.10 | 0.5 ^ (`histogram.emd_lstar` / 10) |
| 0.15 | mean over regions of 0.5 ^ abs(`stops`) x 0.5 ^ (`d_ab` / 10) |

Without a regions file the region weight is spread over the other terms pro rata. Compare
composites between renders of the same shot; they are not absolute grades. For tuning, read the
region table: it says which part is how many stops off and which way its colour leans.

**Side-by-side PNG**: reference | render | signed luminance difference in stops (render minus
reference, ColorBrewer RdBu, blue darker, red brighter, clamped at 3 stops, with a scale bar) |
edges (reference magenta, render green, both white, over the reference at 25 percent). Footer:
the headline metrics and every region's ratio, stops, d_ab and dE. `--draw-regions` outlines the
regions on both photo panels. Measured contrast: label text `#ffffff` on `#111111` 18.9:1,
captions `#b8b8b8` 9.5:1; edge colours against the brightest possible base `#404040`: magenta
3.3:1, green 7.6:1, white 10.4:1.

**Sanity** (`python3 tools/window-light/selftest/compare_sanity.py`, 10 of 10 pass):

| Synthetic render | composite | SSIM | edge IoU | grid RMSE (stops) | grid dE2000 |
|---|---|---|---|---|---|
| the reference itself | 100.0 | 1.000 | 1.000 | 0.00 | 0.0 |
| the reference at half size | 99.8 | 0.998 | 0.999 | 0.00 | 0.0 |
| minus 1 stop (linear x 0.5) | 69.3 | 0.887 | 0.993 | 1.00 | 9.3 |
| plus 1 stop (clips the glass) | 68.9 | 0.892 | 0.942 | 0.89 | 9.0 |
| shifted 20 px sideways | 62.7 | 0.685 | 0.263 | 0.60 | 2.0 |
| Gaussian blur 6 px | 83.7 | 0.863 | 0.598 | 0.10 | 0.8 |
| all black | 3.4 | 0.014 | 0.000 | 6.58 | 30.3 |
| 16:10 frame with the photo padded in the middle | 100.0 (auto crop) | 1.000 | 1.000 | 0.00 | 0.0 |

At minus 1 stop every region reads 0.50x; at plus 1 stop the unclipped ones read 2.0x and the
clipped glass less, with the clip fractions reported. Exposure leaves edge IoU above 0.94;
geometry moves it.

**Target values from the reference** (`ref_1600.png`, sRGB decoded to linear; `monitor_screen`
mixes the dark Claude app and the white page, so it is not "monitor white"). Q17: score against
SDR renditions like this one, never an HDR gain-map decode.

| Region | Pixels (1600 x 1200) | Mean linear Y | Y / monitor_screen | L* | C* | hue deg | clipped |
|---|---|---|---|---|---|---|---|
| grille_room | 16815 | 0.0493 | 0.13 | 26.5 | 1.1 | 138 | 0.0% |
| glass_clear | 72321 | 0.5466 | 1.45 | 78.8 | 8.5 | 172 | 0.0% |
| glass_bright | 54860 | 0.7384 | 1.96 | 88.8 | 11.0 | 102 | 21.3% |
| frame_wood | 162151 | 0.0548 | 0.15 | 28.1 | 0.8 | 177 | 0.0% |
| lamp | 48370 | 0.0156 | 0.04 | 13.0 | 0.2 | 86 | 0.0% |
| monitor_screen | 438953 | 0.3770 | 1.00 | 67.8 | 1.6 | 359 | 0.0% |
| monitor_bezel | 12112 | 0.0123 | 0.03 | 10.8 | 0.9 | 226 | 0.0% |
| wall_left | 404920 | 0.0163 | 0.04 | 13.4 | 1.5 | 104 | 0.0% |
| dark_object_bottom_left | 173286 | 0.0032 | 0.01 | 2.9 | 0.5 | 289 | 0.0% |
| glass_right (optional) | 49337 | 0.5446 | 1.44 | 78.7 | 12.8 | 103 | 8.5% |
| glass_grey (optional) | 46275 | 0.2305 | 0.61 | 55.1 | 2.8 | 170 | 0.0% |
| wood_lamp_glow (optional) | 1848 | 0.0806 | 0.21 | 34.1 | 22.8 | 65 | 0.5% |

## Regions for the 17:41 reference

`ref/regions_1741.json`: `{ version, image, images, size, coords: "normalized", source, regions: { name: { desc, polygons: [[[x, y], ...], ...], subtract?: [other region names] } } }`.
x and y run 0 to 1 from the top-left corner, so one file serves every resolution of the framing.
`subtract` cuts another region out (the glass and wood regions subtract `grille_room`).

| Region | What it covers |
|---|---|
| `glass_clear` | Sky (row A) and trees (row C) through the left French pair L1 and L2. |
| `glass_bright` | The blown golden panes: row B of L1 and L2, sunlit cumulus, 16 to 25 percent of pixels clipped. |
| `frame_wood` | Casing left of L1, L1's outer stile, L2's hinge stile and the mullion zone, rails A/B and B/C under L1 and L2. |
| `grille_room` | The room-side iron bars: the bar over L1, the bar across R1, the bar at R1/R2, the upper tie bar. |
| `lamp` | Dome shade, socket cup and arm stub. |
| `monitor_screen` | The main monitor's screen, menu bar included (kept 14 px inside the unmeasurable left edge). |
| `monitor_bezel` | Top bezel strip, right strip, upper part of the left strip. |
| `wall_left` | The cream wall left of the casing (near black at 17:41, glare gradient toward the window). |
| `dark_object_bottom_left` | The portrait monitor, switched off. |
| `glass_right` (optional) | R1 rows A and B: grey-green crown, sunlit cream building, the red-orange patch. |
| `glass_grey` (optional) | R2: grey dust stipple over something dark. |
| `wood_lamp_glow` (optional) | R1's left stile in the lamp's glow below rail B/C, the one lamp cue at 17:41. |

How they were derived (details in `derive_regions_1741.py`): anchors from
`spec/13-photo-inventory.md` section 3 scaled to 1600 px, then measured on the image. Glass is
thresholded per pane, holes filled, eroded 3 px and traced. Each grille bar's centre was tracked
down the frame and fitted to a line (residual about 1 px); all bars agree on one vertical
vanishing point near (686, -8322) px, consistent with the photo's pitch +5.7 and roll -0.7
degrees, so bars and stiles are slanted quads. The monitor screen's right edge leans right going
down (1553 px at y 860, 1576 at y 1180): the panel is tilted back. Every region is inset 3 to 5
px from its edges so a 1 to 2 px misalignment never mixes neighbours.

Rebuild with `python3 tools/window-light/derive_regions_1741.py`, then **look at**
`ref/regions_1741_overlay.png`.

## sheet.py

```
python3 tools/window-light/sheet.py OUT.png IMG [IMG ...] [--cols N] [--tile 480]
        [--labels "a|b|c"] [--title TEXT] [--caption url|name|none]
```

Tiles are `--tile` px wide, letterboxed per row, `--cols` defaults to ceil(sqrt(N)). Under each
tile: the label (file name unless `--labels`), and a caption from the render's sidecar JSON (the
URL's path and query, the scene backend, console errors, a non-ok status) plus the composite
score if a `NAME.vs-*.json` from `compare.py` sits beside it.

## Tooling test, 2026-09-26 (`runs/tooling-test/`)

| Output | What it proved |
|---|---|
| `sky-1440x900.png`, `sky-1600x1200.png`, `dj-1440x900.png`, `dj-1600x1200.png` | `node tools/window-light/render.mjs --batch tools/window-light/shots/tooling-test.json --outdir tools/window-light/runs/tooling-test --console`: four shots in one Chrome session from Agam's `:5173`, WebGL visible in all four (Living Sky clouds; the three.js DJ console), exact PNG sizes, 0 console errors. |
| `fallback-sky.png` | With the base unreachable, `render.mjs` started its own Vite (first on `:5175`; in the final run 5175 was held by another agent's Python server, so it detected that and used a free port), rendered `/sky` identically, stopped it; `:5173` answered 200 throughout. |
| `stub-webgpu.png` (800 x 600 at DPR 2 = 1600 x 1200), `stub-webgl2.png` | The `__windowScene` path end to end on three r186 `WebGPURenderer`, WebGPU and forced WebGL2 backends: `ready`, `renderFrames`, `stats()` (9 draw calls), `params` in the sidecar, `--strict` clean. |
| `sky-1600x1200.vs-ref_1600.png/.json`, `stub-webgpu.vs-ref_1600.png/.json`, `dj-1440x900.vs-ref_1600.json` | `compare.py` end to end against `ref_1600.png` with all 12 regions (unrelated renders, so low scores: 12.5, 21.1, 14.0; the 16:10 `/dj` shot went through the auto crop). |
| `sheet-4up.png` | `sheet.py` 2 x 2 sheet of the four site renders with URL and score captions. |

Also checked (outputs in the scratchpad, not kept): `--scene require` on a page without a scene
captures anyway and exits 1; duplicate batch names and bad `--scheme` exit 2; Ctrl-C mid-render
exits 130 with no Chrome process or profile left; `--eval` with `setParams` changes the frame and
the sidecar's `params`; two identical stub shots are pixel-identical; a 720 x 450 DPR 2 capture
is 1440 x 900.
