# 40 · Foundation report: the window scene after the first build

Verified 2026-09-27 (01:36 to 02:07 IST) on Agam's `:5173` dev server, three r186, headless
Chrome 153 on the M3 Pro, both backends. Every render below was looked at before anything was
written about it. Outputs: `tools/window-light/runs/foundation/` (intermediate renders moved to
the scratchpad's `foundation/archive/` to keep Drive light).

**Bottom line.** The scene renders on WebGPU and WebGL2 with 0 console errors. It is deterministic
(repeat captures differ by 0 pixels), the hand-off lands on exactly `#ffffff` and `#0e0e11`
without a seam, the live loop gates correctly, and the site (/dj, /, /portfolio, /sky, the build)
has not regressed. Nothing blocked rendering, so **no source file was edited**. The geometry of
frames, rails, room bars, lamp and monitors sits on the photo. What reads fake is the surfaces and
the air: a milky veil over the whole window, a busy granite-looking outside grille, dust that
reads as TV static, and grey driftwood in place of glossy maroon enamel. The 17:41 sky also has
no gold. The Photo-true composite is 54.5.

## 1 · What exists

| Part | Files | State |
|---|---|---|
| Route and page | `src/scene/window/WindowScenePage.jsx`, `windowScene.css`, 6 wiring lines in `src/App.jsx` | `/window` sandbox: fixed canvas, runway (R = 1 viewport), stand-in page, bookend runway, `?gui=1` lil-gui panel with a look select (dreamlike, heightened, photo) |
| Engine | `engine.js`, `renderer.js`, `camera.js`, `capture.js`, `params*.js`, `looks.js`, `gui.js` | WebGPURenderer with WebGL2 fallback, capture contract `window-core-1`, pinned p and p2, `shot=ref1741`, seeded, TRAA or TAAU, posters |
| Room | `room.js`, `room/*.js`, `materials.js`, `params.room.js` | Photo-fitted casing, leaves, right section at 23 deg, room grille, lamp, BenQ, portrait monitor, blind, bead chain, car, tile, bottle, dock; procedural enamel, dust glass, rain on glass |
| Outside | `outside.js`, `outside/*.js`, `params.outside.js` | Bamboo clump (15 canes, about 4,200 leaves, TSL wind with motion vectors), street and horizon trees, building and red patch, box grille, rain streaks and drips, Dreamlike moon halo and motes |
| Light, air, lens | `lights.js`, `post.js`, `light/*.js` | 3000 K lamp with gobo, key light (sun or moon) with a room blocker, window fill, monitor glow, bounce, lightning; volumetric air, veiling glare, auto exposure, scene and display grades, AgX, DOF, SSAO, bloom |
| Sky and weather | `skyPlate.js`, `weatherBridge.js`, `src/lib/weather.js`, `src/lib/astro.js`, `living-sky.frag` (`#ifdef SKY_WINDOW`) | Living Sky plate on a 40 m dome segment, SceneWeather with presets, true sun and moon |
| Tooling | `tools/window-light/` | render.mjs, compare.py, sheet.py, regions, shot files |

Not built yet (expected at integration, listed so nobody assumes otherwise): the visitor-facing
look dropdown and the mine/yours sky toggle in the header (only `?gui=1` switches looks today), the
Open-Meteo credit in the UI (the string is exported, nothing renders it), the contrast contract,
Agentation hotspots, the View Transition redraw, the phone tier's lighter content, and
`?scene=window` on the folio page.

## 2 · Console, both backends (step 1)

| Load | WebGPU | WebGL2 |
|---|---|---|
| Capture shots (render.mjs, 41 shots incl. 3 on WebGL2) | 0 errors, 0 warnings, 0 exceptions | 0 errors; 1 warning per load: `WebGL: INVALID_OPERATION: beginQuery: a query is already active for target` (GPU timestamp queries; capture mode switches `stats` on). Harmless, noisy. |
| Live `/window` (no capture, weather fetched) | 0 errors | 0 errors |
| `/window?gui=1` | 0 errors, panel builds (154 lil-gui nodes) | 0 errors |
| Live scroll through both runways (flow.mjs) | 0 errors | not run |

The only other console line anywhere is `[Agentation] Failed to initialize session`, caused by the
capture scripts blocking `localhost:4747`; it is identical in the upgrade baseline.

**Fixes made: none.** Nothing stopped the scene from rendering.

## 3 · The reference shot (step 2a)

`/window?capture=1&shot=ref1741&look=photo&tod=17.68&wx=partly&theme=light&sky=mine&t=0` at
1600 x 1200, 32 frames, scored with `compare.py` against `ref/ref_1600.png` and
`ref/regions_1741.json`. Side by side: `runs/foundation/ref/ref-photo.vs-ref_1600.png`.

| Metric | Photo-true (WebGPU) | Photo-true (WebGL2) | Heightened | Dreamlike |
|---|---|---|---|---|
| composite | **54.5** | 54.2 | 43.2 | 48.3 |
| SSIM | 0.660 | 0.660 | 0.473 | 0.610 |
| edge IoU | 0.356 | 0.338 | 0.288 | 0.260 |
| edge precision / recall | 0.550 / 0.612 | 0.518 / 0.598 | 0.433 / 0.558 | 0.409 / 0.495 |
| grid log-lum RMSE | 0.89 stops | 0.89 | 1.41 | 1.02 |
| grid mean / max CIEDE2000 | 7.8 / 49.7 | 7.8 / 49.7 | 9.7 / 50.9 | 9.5 / 51.2 |
| L* histogram EMD | 6.9 | 6.9 | 5.6 | 6.0 |
| mean L*, ref 34.3 | 39.6 | 39.6 | 33.4 | 39.2 |

Heightened and Dreamlike are not meant to match the photo; their numbers are for tracking only.

**Regions (Photo-true, WebGPU).** Ratio is render/ref linear luminance; C* is chroma.

| Region | ref Y | render/ref (stops) | C* ref / render | d_ab | Heightened stops | Dreamlike stops |
|---|---|---|---|---|---|---|
| grille_room | 0.0493 | 2.34x (+1.23) | 1.1 / 1.5 | 2.4 | -0.30 | +0.87 |
| glass_clear | 0.5466 | 0.96x (-0.06) | 8.5 / 3.2 | 8.3 | -0.36 | -0.47 |
| glass_bright | 0.7384 | 0.77x (-0.39), clipped 21% vs 0% | 11.0 / 1.0 | 11.9 | -0.55 | -0.55 |
| frame_wood | 0.0548 | 1.44x (+0.52) | 0.8 / 1.6 | 2.3 | -0.94 | +0.07 |
| lamp | 0.0156 | 2.87x (+1.52) | 0.2 / 4.3 | 4.1 | +0.96 | +2.90 |
| monitor_screen | 0.3770 | 1.29x (+0.37) | 1.6 / 1.5 | 2.0 | +0.47 | +0.40 |
| monitor_bezel | 0.0123 | 1.10x (+0.14) | 0.9 / 1.0 | 1.9 | 0.00 | +2.59 |
| wall_left | 0.0163 | 0.91x (-0.14) | 1.5 / 1.1 | 1.5 | -2.04 | -0.60 |
| dark_object_bottom_left | 0.0032 | 0.86x (-0.21) | 0.5 / 0.1 | 0.6 | -1.68 | +0.27 |
| glass_right | 0.5446 | 0.79x (-0.34), clipped 8.5% vs 0% | 12.8 / 4.5 | 9.0 | -0.86 | -0.64 |
| glass_grey | 0.2305 | 1.47x (+0.55) | 2.8 / 3.6 | 5.5 | -0.41 | +0.56 |
| wood_lamp_glow | 0.0806 | 0.87x (-0.20) | 22.8 / 7.5 | 15.2 | -1.27 | +0.30 |

**8 x 6 grid, stops (render minus ref), rows top to bottom:**

```
+0.2 +0.1 +0.1 +0.8 +0.3 +0.2 +0.3 +0.5
+0.2 -0.1 -0.3 +0.0 -0.2 -0.3 -0.6 +0.3
+0.2 -0.2 -0.4 +0.1 -0.2 -0.2 -0.1 +0.8
+0.0 -0.3 -0.2 +0.3 -0.0 +0.1 +0.3 +1.1
-0.2 -0.4 +3.7 +1.0 -0.0 +0.1 +0.2 +0.4
-0.4 -0.5 +4.1 +0.6 -0.4 -0.3 +0.1 +0.3
```

The two cells at +3.7 and +4.1 stops are the monitor's left half: a white page in the render, the
dark Claude app in the photo. Nothing in the scene can fix those two cells except the poster.
Luminance is otherwise within about half a stop almost everywhere; what the numbers hide is in
the colour and texture columns (chroma 1 against 11 on the gold panes, 4.5 against 12.8 on R1).

## 4 · The 15 biggest visual gaps (the tuning loop's first work list)

Ranked by how much each one makes the frame read as CG, weighted toward the p=0 hero frame and
the Photo-true match. Evidence crops are in `runs/foundation/crops/` (photo left, render right).

1. **A milky veil over the whole window.** In every look and framing, the frame, the room bars and
   the lamp read mid-grey instead of near-black against the sky. The photo's defining trait is
   crisp black silhouettes against bright glass. Measured: grille_room +1.23 stops, lamp +1.52,
   frame_wood +0.52; the stops heatmap is red over the whole window column; mean L* 39.6 against
   34.3. In Photo-true daytime (tod-sweep 07:30 to 15:00) a blue-grey fog lifts the left third of
   the frame. Likely sources, all to be measured: the Photo-true glare bloom and veil (post.js,
   light/grade.js), the dust film's forward scatter (materials.js), and the window-fill
   RectAreaLight lighting glossy faces with no shadowing (lights.js). Owner: light, room.
   Crops: `window.png`, `photo_rowA.png`.
2. **The outside box grille is too busy and reads as pink granite.** Through L1 and L2 the render
   shows extra members the photo does not have: doubled horizontals in row A, a wide vertical
   band and an arched member in L2's top pane. The photo shows one cross per pane at 17:41 and
   thin flat tan bars in 5481. At close range (p=0, p=0.25, the phone frame, all of Heightened)
   the bars carry the dust stipple and read as speckled pink or brown granite. They dominate the
   hero frame. Owner: outside/grid.js, with the glass dust. Crops: `photo_rowA.png`,
   `heightened.png`.
3. **The glass dust reads as TV static.** The stipple is coarse, dense and high-contrast over
   everything dark or mid-toned: R1, R2, the lower L row at p=0, the bottom band of the phone
   frame, and the grille bars. In the photos the dust is fine, sparse specks; R1 at 17:41 is
   nearly clear, showing sky, green and the building. Measured: glass_right C* 4.5 against 12.8
   (-0.34 stops), glass_grey +0.55 stops. Owner: room materials.js (glass dust). Crops:
   `right.png`, `lower.png`.
4. **The enamel reads as grey weathered driftwood, with a colour cast by day.** At p=0: pale grain
   lines, white chip blobs, pale chamfer lines, and the corner post and casing reveal as bright
   pale boards (false edges). By day, Dreamlike casts wood and wall teal (hue 160 to 194, C* 4 to
   11 at 09:00 to 15:00); Photo-true casts cool blue-grey (hue 224 to 236). The 18:39 close-up
   5481 shows glossy maroon-brown enamel (L* 23, a* +9.6, b* +7.4, hue 38) with long specular
   streaks. Owner: room materials (albedo is measured, so check chip and grain contrast and
   roughness), light (fill and bounce colour). Crops: `window.png`, `handle.png`.
5. **No golden hour in the 17:41 sky.** The photo's row B cumulus is gold and clipped, in a pale
   blue sky. The render's is a cream-lilac haze with grey-white clouds. glass_bright C* 1.0
   against 11.0, 0% clipped against 21%; glass_clear C* 3.2 against 8.5. Heightened and Dreamlike
   are no better (-0.55 stops on glass_bright). Owner: light (sky grade and exposure), sky plate.
6. **The lamp glow is misplaced, and missing where the brief puts it.** At 17:41 the orange glow
   lands large and saturated on R2's frame and the right-section rails. In the photo it is a
   narrow gold streak down R1's left stile below rail B/C (wood_lamp_glow C* 7.5 against 22.8,
   d_ab 15.2). No lamp glow shows at p=0 at any hour, although the brief lists "lamp glow on the
   stile" in that frame. The 18:40 hotspot on L2's hinge stile appears in no look: room
   `lamp.aim` is `photo`, and the light rig was fitted to the 1840 aim with tiltDir1840 170, not
   the room's 192. Owner: room lamp plus light, reconciled together. Crops: `lamp.png`,
   `handle.png`.
7. **The p=0 hero frame does not match the brief's composition.** The brief's p=0 is "left pair,
   mullion, handle leaf, lamp glow on the stile, lamp head just out of frame". The render shows
   four panes of L1 and L2 plus L2's hinge stile with the keyhole. The handle leaf is out of
   frame and there is no lamp glow. The busiest part (the grille lattice) sits exactly where the
   greeting and timeline will sit in integration (Q07: greeting x 56 to 296, y 256 to 378;
   timeline x 720 to 1440, y 240 to 484). Owner: camera (`camera.window.region`), with 6.
8. **The Dreamlike moon is never in frame.** It is placed at az 12, alt 31. At p=0 (pitch 0,
   vertical FOV 40) the view tops out near +20 degrees, so the moon is out of frame at every
   hour. At 21:00 (real moon alt 33, 99% lit) it shows as a sliver clipped at the top edge at
   p=0.5 (partly and clear alike). At p=0.25 there is no disc, only a moonlit cloud patch in
   L2's top pane. The plate itself carries a clean disc
   (`checks/plate-tod21.png`). The brief wants it in the upper left pair of panes, shown at night
   always. Owner: looks.js or params (`sky.moon.alt`, likely nearer 12 to 15 degrees), engine.
9. **Clear, partly and overcast look the same in the scene.** Sky L* is 70 to 72 in all three;
   partly against overcast differs by a mean of 5.2/255 over the whole frame. The raw plate for
   overcast is correctly a grey deck (`checks/sheet-plate.png`). The cause is
   `gradeSky` (light/grade.js): everything below 0.85x the plate's mean luminance is pushed blue
   and the brighter part gold, and `blue` is reduced only when `rain.active`, never by cloud
   cover. So an overcast deck is repainted as blue sky with gold tops. Owner: light.
10. **The lamp dome is matte grey-brown clay.** +1.52 stops, C* 4.3 against 0.2 (Dreamlike +2.90).
    The photos show black gloss with a crisp curved specular rim. Owner: room lamp material,
    light (the window fill lights it). Crop: `lamp.png`.
11. **The brass handle is face-on, like a towel bar.** The render shows a bright D-handle with round
    rosettes, facing the camera on R1's stile. At 17:41 the photo shows the handle edge-on as a
    thin glint beside a lamp-lit gold stile. Owner: room/window.js (handle orientation, or which
    face it mounts on). Crop: `handle.png`.
12. **Rain reads as snow or sleet.** At p=0 the streaks are opaque white, dense and uniform, and
    the drops on the glass render as white dots over the dust, not clear lenses. The trees wash
    out behind them. Owner: outside/rain.js, room materials (rain lens). Frames: `main/wx-rain.png`,
    `main/wx-storm.png`.
13. **The night canopy turns into white blobs.** At 21:00 and 00:00 (and on the live night page)
    the street-tree leaf cards read as white blossom or snow under moonlight. Owner:
    outside/farTrees.js (moonlit translucency or card normals). Frame: `main/tod-21.png`.
14. **The monitor.** The poster is the portfolio home with a daytime sky header at every hour; at
    21:00 the screen still shows a blue daytime sky. The photo shows the Claude app and a page,
    which accounts for the grid's +3.7 and +4.1 stop cells. In the closing shots the BenQ seems to
    float (no stand or arm visible), and the portrait monitor stands on a flat, unlit-looking
    white card. At p=0.9 in the dark theme, a hard-edged lighter panel (a 10-level step at x
    about 915) splits the screen, probably the window fill's specular. Owner: engine (posters),
    room interior, light.
15. **The car and the tile are the wrong colours.** The woodie renders white with a navy roof. 5481
    and the 17:41 photo show a light blue or teal body with livery and a grey rear. The souvenir
    tile renders as a dark slab; the photos show a light, colourful tile. Owner: room/car.js,
    room/interior.js. Crop: `lamp.png` (car at left).

Other visual notes, below the cut:
- The dawn and dusk sky (06:00, 18:15, 18:40) is a flat salmon wash with blue-lilac clouds, which
  reads like a colour filter.
- Dreamlike at 17:41 puts a large lens-flare-like glow at the upper right (the beam's air plus
  glare). Its specks are pretty but crowd R1.
- p=0.9 in the light theme washes the page poster to near-invisible under a grey vignette before
  the hand-off. It is smooth, but the page content is gone about 10% of the runway early.

## 5 · Every image, real against fake (step 3)

| Image | Reads real | Reads fake |
|---|---|---|
| ref-photo (1600x1200) | Frame, rails, room bars, monitor and lamp silhouettes sit on the photo (edge recall 0.61); portrait monitor, bead chain and blind edge right | Veil (gap 1); grille busy (2); no gold (5); R1/R2 static (3); orange glow on R2 frame (6); clay lamp (10); towel-bar handle (11); white car (15); wrong poster (14) |
| ref-photo-webgl2 | Same frame as WebGPU (mean diff 0.88/255) | Same as above |
| ref-heightened | Darker, crisper room | Grille dark-brown granite and dominant; sky milky; clay lamp brighter; wall -2 stops |
| ref-dreamlike | R2 opened to grid and bamboo; beam motes | Glow blob upper right; lamp +2.9 stops; no moon (moon below horizon at 17:41 and sun up, which is correct) |
| run-p0 | Blurred street trees behind the glass; keyhole; depth of field on the glass | Granite grille; white chip blobs and pale grain on the frame; static in the lower row; no lamp glow; no moon; a stray bamboo spray at top centre only |
| run-p025 | Bead chain, blind edge, sill, R1 bamboo, window depth | Granite grille; static band at the bottom; towel-bar handle; white van car |
| run-p05 (16:10) | Room layout, monitor, lamp, beam | Veil; glow and motes crowd R1; grille busy |
| run-p075 | Monitor with poster, bezel, lamp looming, motes | Poster slightly milky |
| run-p09 | Smooth rise to white | Screen off-centre with chin and desk grey in the bottom 9%; grey vignette over white; page content gone |
| run-p1 / run-p1-dark | Exactly `#ffffff` / `#0e0e11` over all 1,296,000 pixels | nothing |
| run-p2-025 | Closing pull-out reads as a room | Monitor floats; portrait monitor base a flat white card |
| run-p2-05 | Room, wall, beam patch, window | Floating monitor; harsh lamp shadow edge on the right wall |
| run-p2-1 | Roman blind, room depth, bottle, bookend composition | Floating monitor; flat white card; wall plane empty |
| tod-6, tod-1865 | Warm frame at dawn and dusk | Flat salmon sky with blue clouds; rusty granite grille |
| tod-9, tod-12, tod-15 | Daylight exposure, trees | Teal cast on wood and wall; driftwood frame; 9, 12 and 15 nearly identical |
| tod-1768 | Warmth | Milky; grey frame |
| tod-21, tod-0 | Black frame; fireflies; grille dark at night | White-blob canopy; no moon disc; no lamp glow at p=0 |
| wx-clear, wx-partly, wx-overcast | Clouds move with the preset in the plate | The three read the same (gap 9) |
| wx-rain, wx-storm | Grey sky, wet darker frame | Snow-like streaks; white dots on the glass |
| phone-p0 (390x844 at DPR 3, engine caps 1.5) | Room bars read solid and dark | Framing cuts L1 hard at the left; bottom 15% is static; granite grille |
| phone-p0-webgl2 | Same as WebGPU (mean diff 0.42) | Same |
| checks/moon-p05-21 and moon-p05-21-clear (Dreamlike 21:00) | Beam, bamboo in R1, fireflies | Moon a sliver at the top edge in both; daytime poster at night |
| checks/moon-p025-21 | Bamboo spray over L1 and L2, fireflies, moonlit cloud in L2 | No moon disc; white-blob canopy; black room with no lamp glow on the L pair |
| checks/photo-p05-21 | Monitor-lit dark room | Lamp lights the R-section frames pale tan, not glossy maroon |
| checks/plate-tod21 | Plate moon and clouds | (debug view) |
| flow/* (live scroll) | Loop and hand-off behave (section 7) | Same visuals as the capture frames |

Contact sheets: `sheet-runway.png`, `sheet-tod.png`, `sheet-weather.png`, `sheet-tod-photo.png`
(Photo-true tod sweep from `shots/tod-sweep.json`), `sheet-flow.png` (live scroll),
`sheet-site.png` (regression), `checks/sheet-plate.png` (raw plates).

## 6 · Performance per backend

Uncapped (`--disable-gpu-vsync --disable-frame-rate-limit`), live loop with p pinned, wall-clock
ms per frame, median of three 3 s windows. Machine load average was 3.5 to 4.6 from other
agents, and single runs spread by up to 20%. There are still no trustworthy GPU timestamps on
this machine. Script: scratchpad `foundation/perf.mjs` (a parameterised copy of
`runs/light/scripts/fps.mjs`).

**1440 x 900**

| Framing | WebGPU DPR 1 | WebGL2 DPR 1 | WebGPU DPR 2 | WebGL2 DPR 2 |
|---|---|---|---|---|
| Dreamlike p=0 | 6.93 | 11.04 | 14.59 (rerun 15.18) | 18.10 |
| Dreamlike p=0.5 | 5.80 | 8.96 | 10.50 | 18.30 |
| Photo-true p=0.5 | 5.74 | 8.91 | 10.42 | 18.28 |
| Dreamlike p2=1 | 5.69 | 9.22 | 11.20 | 19.07 |

p=0 is the most expensive framing. The cause is not isolated: turning off DOF, air, motes or
glare one at a time at p=0 DPR 2 moved it only 0.5 to 1.0 ms each, within the noise. The
engine's `stats().frameMs` is a single-frame CPU sample that jumped between 1.4 and 14 ms, so it
is not usable for this either.

**Phone, 390 x 844 at DPR 3** (the engine caps DPR at 1.5, so 585 x 1266 px, on the M3 Pro, not
a phone)

| Framing | WebGPU | WebGL2 |
|---|---|---|
| p=0 | 5.95 | 7.49 |
| p=0.5 | 3.89 | 5.31 |

| Other numbers | WebGPU | WebGL2 |
|---|---|---|
| Draw calls, triangles (1440x900) | 168 to 198, 286k to 305k | same |
| Phone draw calls, triangles | 173 to 175, 290k (full geometry, no lighter tier) | same |
| Init plus compileAsync (ready minus hook found) | median 646 ms (577 to 1,282, n=64) | median 5,192 ms (4,970 to 5,414, n=2) |
| 32 capture frames | 0.53 s | 0.53 s |
| Live loop rate on the runway | 60 fps (display rate), stops at p=1 | not run live |

**Against the brief's 6 ms at 1440x900 DPR 2: missed on both backends** (WebGPU 10.4 to 15.2 ms,
WebGL2 18.1 to 19.1). At DPR 1, WebGPU is at or near 6 ms except p=0 (6.9). These numbers are
lower than the light builder's (18.9 ms at DPR 2) because the machine was less loaded this time,
so they are not a regression or an improvement.

## 7 · Behaviour checks

- **Determinism:** two identical shots differ by 0 pixels, and match the earlier batch's frame
  exactly.
- **Backends:** the reference shot differs by a mean of 0.88/255 (99th percentile 7, max 48,
  edge-only); the phone frame by 0.42.
- **Hand-off:** p=1 is exactly `#ffffff` (light) and `#0e0e11` (dark) on every pixel.
  Convergence has no seam:

  | p | light, centre / corner | dark, centre / corner |
  |---|---|---|
  | 0.95 | 237 / 190 | 29 / 18 |
  | 0.98 | 251 / 237 | 15 / 15 |
  | 0.995 | 255 / 254 | 14 / 14 |

  The bookend leaves just as smoothly: p2=0.005 is 254 to 255, and p2=0.05 is 240 at the centre.
- **Live loop** (flow.mjs, no capture):
  - 30 frames per 500 ms on the first runway.
  - At p=1: `running: false`, the canvas is `visibility: hidden`, and no frames are drawn through
    the stand-in page.
  - It restarts for the bookend (p2 0.5 and 1.0 reached).
  - It pauses in a hidden tab (0 frames) and resumes when visible.
- **Live look switch:** `setLook()` from Dreamlike to Photo-true (and back) matches a cold load
  except on edges: mean 0.72/255, 2.0 to 2.4% of pixels over 8/255, max 118, every one on an
  edge. That is a sharpness difference (DOF parameters or TRAA history not reset), not a
  structural one. Diff: `checks/switch-diff-d2p.png`.
- **Moon state** at 21:00 on 2026-09-27: alt 33.1, az 86.7, phase 0.53, 98.8% lit. At 17:41 it is
  at alt -13.7 with the sun at +6.9, so no Dreamlike moon at 17:41 is correct.

## 8 · Regression (step 4)

- **/dj** on `:5173`, 5 styles, seeded and fonts blocked with the upgrade's `djshot.mjs`: 0
  pixels differ from `runs/dj-after` in every style. Against the r169 `runs/dj-baseline`,
  Realistic differs by a mean of 1.60 and Cardboard by 1.62, and the other three by 0 or 0.001.
  That is exactly the upgrade's reported r186 shift. The scan variant was not re-rendered: its
  harness page exists only on the upgrade agent's `:5175` server, and it is not mounted on any
  route.
- **Pages:** /, /portfolio, /sky, /dj and live /window on both backends show 0 errors and 0
  exceptions (`runs/foundation/site/console.json`); all render (`sheet-site.png`).
- **Build:** `vite build --outDir scratchpad/build-check-2` succeeds in 8.81 s. The only warnings
  are the two that were already there (the ShaderCanvas dynamic-plus-static import, and chunks
  over 500 kB).
  - `WindowScenePage` is 1,142.42 kB (371.08 kB gzip), up from the core's 1,040 / 332.
  - three now sits in a shared lazy chunk `three.module` of 607 kB, used by both DjConsole (now
    45.6 kB) and the window scene.
  - The entry chunk references it only in Vite's lazy preload map, so three stays out of the
    first load.

## 9 · Open issues

**Performance and backends**
1. The DPR 2 budget is missed on both backends (section 6). The phone tier is only a DPR cap;
   there are no fewer leaves, no SMAA and no baked AO yet (Q16).
2. WebGL2 logs `beginQuery: a query is already active` on every capture load, because GPU
   timestamps are on under `capture=1`. Cosmetic, but it will trip `--strict` runs.
3. WebGL2 takes 5.2 s to init and compile against 0.65 s on WebGPU. The first frame on a
   non-WebGPU browser will need the poster for that long.

**Engine and looks**
4. A live look switch leaves edge-level differences from a cold load (section 7).

**Lamp**
5. The lamp aim is unreconciled: room `aim: photo` with tiltDir1840 192, against the light rig
   fitted at 170 for the 1840 aim. Nobody sees the 18:40 hotspot today.

**Sky and weather**
6. `gradeSky` ignores cloud cover, so overcast is repainted as partly cloudy (gap 9).
7. `sky.moon.alt` 31 puts the Dreamlike moon out of every runway frame (gap 8).
8. The posters are daytime-only, so night scenes show a daytime page on the monitor.

**Outside**
9. Both beam-mote systems are on in Dreamlike (outside motes, beamMode auto, plus
   post.volume.specks), carried over from the outside builder.
10. Both blocked planes exist (the room's, and the outside's narrower one); the room's is on,
    carried over.

**Leftovers from earlier jobs**
11. `params.core.js` still shows `sky.gain` 7 and `nightGain`, which the exposure curve now
    overrides.
12. `pnpm-lock.yaml` still pins three 0.169.0, carried over from the upgrade.

**Housekeeping and records**
13. `runs/foundation/` is 103 MB and syncs to Drive. Prune it once the tuning loop has its first
    baseline.
14. CLAUDE.md asks for a session note in `Claude/` and a CONTEXT.md update. This verifier did not
    write them (subagent rule), so the orchestrator should.

## 10 · Not verified

- Headed Chrome, Safari, Firefox, real phones, touch scroll or Lenis, and a device without
  WebGPU (WebGL2 was forced on a WebGPU-capable Mac).
- True GPU time: all performance numbers are wall clock under other agents' load.
- Motion: every judgement is on still frames.
  - Wind, bamboo sway, rain streak motion, and TRAA ghosting while scrolling were not watched.
  - Lightning was not seen: no strike happens at t=0.
- The live loop on the WebGL2 backend, and reduced motion (the core builder's flow-reduced run
  covers it; not repeated).
- Live weather in daylight: the live loads ran at about 02:00 IST, so night.
- The /dj scan variant after this session's changes.
- Whether the colour casts (gap 4) come from the fill, the bounce or the grade: attribution is
  by reading the code, not by isolating each light.
- The handle's true mounting (gap 11) beyond the 17:41 photo and the room builder's notes.
- `sky=yours` and `date=`: not exercised.

## 11 · Reproduce (cwd: the Portfolio folder)

```sh
node tools/window-light/render.mjs --batch tools/window-light/runs/foundation/batch-ref.json --outdir tools/window-light/runs/foundation/ref --console
python3 tools/window-light/compare.py tools/window-light/runs/foundation/ref/ref-photo.png tools/window-light/ref/ref_1600.png --regions tools/window-light/ref/regions_1741.json --draw-regions
node tools/window-light/render.mjs --batch tools/window-light/runs/foundation/batch-main.json --outdir tools/window-light/runs/foundation/main --console
node tools/window-light/render.mjs --batch tools/window-light/shots/tod-sweep.json --outdir tools/window-light/runs/foundation/tod-photo
node tools/window-light/runs/core/scripts/flow.mjs tools/window-light/runs/foundation/flow "tod=17.68&wx=partly&theme=light&look=dreamlike"
BASE=http://localhost:5173 DPR=2 Q="tod=17.68&wx=partly&theme=light&t=0" node <scratchpad>/foundation/perf.mjs '[["dream-p05-gpu","look=dreamlike&p=0.5"]]'
```

Batch files for the moon, hand-off and plate checks sit beside them (`batch-moon.json`,
`batch-handoff.json`, `batch-plate.json`).
