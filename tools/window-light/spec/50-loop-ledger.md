# 50 · Loop ledger: the window scene after three rounds

Written 2026-09-27 (10:45 to 11:10 IST) by the final judge of the tuning loop. Every image named
below was rendered in this pass on Agam's `:5173` dev server (three r186, headless Chrome 153,
M3 Pro) and looked at before anything was written about it. No source file was edited in this
pass. The last source edit in `src/scene/window/` was at 10:02 (`skyPlate.js`), before the round-3
critics ran, so the final state IS the round-3 state: the final Photo-true reference shot
reproduces round 3's numbers exactly (composite 75.9, SSIM 0.831, edge IoU 0.567).

Final renders: `/Users/agamagarwal/window-light-runs-archive/loop/final/` (batch files in
`batches/`, perf in `perf/`). The small set kept in the project is
`tools/window-light/runs/loop-final/` (9 files, 8.7 MB; heroes as JPEG quality 88).

**Bottom line.** Three rounds took the Photo-true reference shot from 54.5 to 75.9. The milky veil
is gone, the frame, rails, room grille, lamp and both monitors sit on the photo (edge precision
0.81, recall 0.80), every 8 x 6 grid cell is within 0.7 stops, and WebGPU and WebGL2 render the
same frame. What still gives it away as CG, at a glance: the lamp's glow is an orange neon column
on the stiles at every hour, the 17:41 sky is hard yellow cut-out cloud, the far trees carry
painted gold dots, and the enamel and lamp dome are matte clay rather than gloss. The p=0 hero is
also busiest exactly where the greeting and the timeline will sit. The Dreamlike night (21:00) is
the one frame worth sharing today. No quality tier meets its budget at the p=0 hero.

## 1 · Scores per round

Composites are `compare.py` against `ref/ref_1600.png` at the solved `shot=ref1741` framing
(1600 x 1200, tod 17.68, wx partly, t 0, 32 frames, WebGPU). Art scores are out of 10 and are
each critic's own judgement. "Photo critic" is the realism critic; it did not score motion in
rounds 1 and 2.

| Round | Photo-true | Heightened | Dreamlike | Art critic: Dream / Height / Photo / Motion | Photo critic: Photo / Height / Dream / Motion | Close-ups 5480 / 5481 / 5482 / 5483 / 5484 |
|---|---|---|---|---|---|---|
| 1 (foundation) | 54.5 | 43.2 | 48.3 | 3 / 2.5 / 2.5 / 2.5 | 4 / 4 / 3 / not scored | no close-up shots existed (faked framings scored 8.3 to 19.4) |
| 2 | 65.9 | 52.9 | 54.5 | 5 / 5 / 5.5 / 4 | 5 / 4 / 4 / not scored | 15.1 / 21.4 / 39.9 / 32.1 / 27.1 |
| 3 | 75.9 | 57.0 | 60.3 | 6 / 5 / 5 / 5 | 5.5 / 4 / 3.5 / 4 | 45.2 / 43.5 / 42.0 / 36.8 / 34.5 |
| Final (judge, same code as round 3) | **75.9** | 57.0 | 60.3 | judge: **5 / 4 / 5 / 4** | | not re-rendered (code unchanged since round 3) |

Photo-true headline metrics by round:

| Round | SSIM | Edge IoU (P / R) | Grid RMSE (stops) | Grid dE2000 | EMD L* | WebGPU vs WebGL2 (mean / p99 per 255) |
|---|---|---|---|---|---|---|
| 1 | 0.660 | 0.356 (0.55 / 0.61) | 0.89 | 7.8 | 6.9 | 0.82 / 5 |
| 2 | 0.712 | 0.309 (0.52 / 0.52) | 0.29 | 4.4 | 2.1 | 0.99 / 8 |
| 3 and final | 0.831 | 0.567 (0.81 / 0.80) | 0.25 | 3.1 | 2.0 | 0.17 / 2 |

Why the judge scores sit at or under the critics': the judge weighs the frame a visitor actually
sees first (the Dreamlike p=0 hero by day) more than the best frame in the set. That frame is
busy, carries the neon stripe and the cut-out sky, and reads as a game render at 1:1. The night
hero alone would score a 7.

## 2 · What each round fixed

Round 3 was a critique only: the loop stopped after it, so none of round 3's 24 gaps was worked.

**Round 1 fixes** (four lanes in parallel, against the foundation critique):

- Light: a real lens stage (`light/lens.js`): a three-part veiling-glare spread sized by frame
  height (DPR independent), an edge-aware local tone map, and Photo-true's phone curve with a hard
  shoulder so gold tops clip. Sky colour driven by sun altitude (`light/grade.js`): dusk became
  blue hour instead of salmon, night navy instead of violet. Weather darkness moved into the sky
  gain so the dome, window light and glass all follow it. The lamp kept its photographed pose and
  gained a spill lobe (77 degrees off axis) with its own map and shadow. Result: grille_room
  +1.23 to +0.01 stops, frame_wood +0.52 to -0.06, L pair contrast 8.6 to 21.6, DPR 2 region
  drift 1.04 to 0.07 stops.
- Outside: the outside grille rebuilt as one flat mesh backprojected from the photo (horizontals
  6.7 to 2.0 px rms, one vertical per pane as in the photo), flat enamel bars, a wind model with
  travelling gusts and leaf flutter, rain streaks that only lighten dark things, tier trims.
- Room: glass dust rebuilt as a band-limited fine grain plus haze, per leaf; lamp dome to black
  enamel; enamel albedo moved to hue 36; the car remodelled; props given stands and materials.
- Core: the p=0 hero reframed; the Dreamlike moon placed in frame with a `moonCheck` helper;
  `quality.js` (high, mid, low picked from GPU and viewport, `?quality=` override, capture fixed
  to high); the folio posters rebuilt as the work grid on `#ffffff` and `#0e0e11` with no sky
  band (the orchestrator decision); five solved close-up shots `ref5480` to `ref5484` with region
  files.

**Round 2 fixes:**

- Core: the sky-plate average moved to an async GPU read, which removed a 0.6 to 1.5 s freeze
  every 0.8 to 3.9 s on every tier. The hero refocused on the glass and handle leaf (yaw 16,
  focus 0.54 m, bokeh 1.2) so something is sharp; the phone framing got sky; capture-shot posters
  built from the photo's own screen.
- Light: a ceiling light for the close-up shots only (the photos had it on; close-up composites
  roughly doubled), display grain matched to the photo's noise, the page itself on the screen over
  the last half of the runway, calmer motes, a two-cut spill map, and a window-only cumulus band in
  the Living Sky shader (inside `SKY_WINDOW`, proven pixel-identical elsewhere).
- Room: pane edges rebuilt (the pale outlines and meeting-stile lines are gone), the window fill
  scaled per material, crisper dust grain, a near-black dome, the crumpled wall normal removed,
  the car and bead chain finished.
- Outside: canopy made diffuse with a brightness cap and a night mode (no more white foam), a
  moon disc with maria and true phase, grille bars flat tan, stronger rain streaks, gust fronts.

Process lessons from the rounds: lanes edited the same scene at once, so the only fair evidence
was per-lane A/B on isolated Vite copies (the room and light lanes both did this); one lane
overwrote another lane's A/B copy in round 2 and restored it. Scratch folders need owner names.

## 3 · The final reference shot

`shot=ref1741&look=photo&tod=17.68&wx=partly&t=0`, 1600 x 1200, 32 frames. Side by side:
`runs/loop-final/00-reference-side-by-side-photo-true.png`.

| Metric | Foundation | Final |
|---|---|---|
| Composite | 54.5 | 75.9 (WebGL2 75.9) |
| SSIM | 0.660 | 0.831 |
| Edge IoU (precision / recall) | 0.356 (0.55 / 0.61) | 0.567 (0.81 / 0.80) |
| Grid log-luminance RMSE | 0.89 stops | 0.25 stops |
| Grid dE2000 (mean) | 7.8 | 3.1 |
| Histogram EMD | 6.9 L* | 2.0 L* |

Regions (render minus reference):

| Region | Stops | C* ref / render | Hue ref / render | d_ab | Clipped ref / render | Foundation stops |
|---|---|---|---|---|---|---|
| grille_room | -0.09 | 1.1 / 0.6 | 138 / 93 | 0.8 | 0 / 0 % | +1.23 |
| glass_clear | +0.19 | 8.5 / 6.7 | 172 / 178 | 2.0 | 0 / 0.1 % | -0.06 |
| glass_bright | -0.05 | 11.0 / 3.6 | 102 / 146 | 8.8 | 21.3 / 15.3 % | -0.39 (0 % clipped) |
| frame_wood | -0.02 | 0.8 / 1.6 | 177 / 79 | 1.9 | 0 / 0 % | +0.52 |
| lamp | **+1.15** | 0.2 / 5.3 | 86 / 71 | 5.1 | 0 / 0.4 % | +1.52 |
| monitor_screen | -0.08 | 1.6 / 0.1 | 359 / 21 | 1.5 | 0 / 0 % | +0.37 |
| monitor_bezel | +0.57 | 0.9 / 3.4 | 226 / 84 | 4.1 | 0 / 0 % | +0.14 |
| wall_left | -0.06 | 1.5 / 1.5 | 104 / 92 | 0.3 | 0 / 0 % | -0.14 |
| dark_object_bottom_left | -0.13 | 0.5 / 0.2 | 289 / 96 | 0.7 | 0 / 0 % | -0.21 |
| glass_right | -0.30 | 12.8 / 10.9 | 103 / 102 | 1.8 | 8.5 / 11.3 % | -0.34 |
| glass_grey | -0.11 | 2.8 / 1.6 | 170 / 194 | 1.5 | 0 / 0 % | +0.55 |
| wood_lamp_glow | **+1.08** | 22.8 / 41.3 | 65 / 53 | **19.5** | 0.5 / 0.4 % | -0.20 |

Read with the eye (crop `final/crops/ref-window-pair.png`): tone and silhouettes match; what
differs is the gold cloud (one soft cream-gold mass in the photo, fragmented hard yellow blobs in
the render), an orange column down L2's hinge stile and R1's stile with a white-hot core near the
sill (the photo's stiles are dark), a bright D-handle the photo does not show, crisp stock bamboo
in R1 where the photo has a hazy grey-green crown and a cream building, and a grey-brown dome with
a soft edge where the photo's is black gloss with a razor edge. Round 3's ablation: switching the
lamp OFF raises the composite to 76.0, so today's lamp adds about 3 times the light the 17:41
stile needs.

Caveat: `monitor_screen` scores well because the capture-only poster `shot-1741.jpg` is a
rectified crop of the photo's own screen. See gap 8.

## 4 · The other final renders

All at `/Users/agamagarwal/window-light-runs-archive/loop/final/`, WebGPU, `capture=1`, light
theme, 32 frames, 0 console errors in every capture (WebGL2 logs the known beginQuery warning
once).

- **Heroes, p=0, 17:41 partly, 1440 x 900 at DPR 2** (`hero/`): Dreamlike, Heightened and
  Photo-true share one frame: L1 and L2 on the left, the corner post, the keyhole stile, the
  handle leaf, R1 and R2 with bamboo, the flat right casing. Heightened is nearly Dreamlike minus
  motes; it does not read as "believable as a photograph". Photo-true is darker and dustier, with
  the gold cloud as flat yellow splats. At 1:1 the frame is soft (the high tier renders at 0.575
  of the DPR 2 buffer), the escutcheon is a flat decal and the lamp stripe is a flat capsule
  (`crops/hero-dpr2-handle-1to1.png`, `crops/hero-dpr2-sky-1to1.png`). WebGPU vs WebGL2 at DPR 2:
  mean 0.22/255, p99 3.
- **Dreamlike night, 21:00, DPR 2** (`hero/hero-night-dreamlike-2100.png`): the best frame.
  The moon sits in L1's top pane, the glass is navy, fireflies drift in R1, the room splits cool
  outside and warm inside. Still wrong: the orange stripe on the stile, an orange haze over the
  right third, the outside is dead (no city light), and the moon is cut by a muntin.
- **Runway** (`runway/sheet-runway.png`): p=0.25 is the most photographic frame (dark room,
  crisp silhouettes). p=0.5 and 0.75 read well into the work-grid poster. p2=1 (the bookend) reads
  as a lived room: roman blind, lamp wedge on the wall, portrait monitor, bottle, dock. The dome
  is the largest object from p=0.25 to 0.75 and reads as matte clay.
- **Phone, 390 x 844 at DPR 3** (`runway/phone-p0.png`): two thirds dark stile, slivers of sky
  and bamboo, the orange stripe down the middle and a blown hotspot at the bottom.
- **Time of day** (`tod/sheet-tod.png`): mean frame difference between neighbours: 06 to 09
  33.4, 09 to 12 **5.4**, 12 to 15 **5.8**, 15 to 17:41 12.6, 17:41 to 18:39 42.5, 18:39 to 21
  10.1, 21 to 00 **0.21** (per 255). Dawn, golden hour and blue hour read; midday and late night
  do not change. The lamp stripe is the same at noon as at night.
- **Weather** (`weather/sheet-weather.png`, 17:41 and 12:00): against partly, clear differs by
  **1.9 and 2.2**, overcast 14.3 and 12.2, rain 16.0 and 17.4, storm 31.3 and 34.6 (per 255).
  Clear still shows the same cumulus. Overcast, rain and storm separate; storm is the darkest.
- **Storm motion strip** (`motion/strip-storm.png`, t 0 to 1.4 s, step 0.2): 8.4 to 11.7 % of
  pixels change by more than 8/255 per step, concentrated in the L pair's lower panes and R1 and
  R2. Bamboo leaves sweep in and out of R1's lower pane and the rain slant is consistent; no TRAA
  smear on the frame. Judged from stills only.
- **Text zones at p=0** (the Q07 boxes): greeting p5 to p95 luminance 50 to 191 with 3.2 %
  edges by day, timeline 55 to 208 with 2.8 %. Only 21:00 is calm (greeting 2 to 46).

## 5 · Final performance per tier and backend

Measured in this pass: live loop, uncapped (`--disable-gpu-vsync --disable-frame-rate-limit`),
1440 x 900 on a DPR 2 display, Dreamlike 17:41 partly, `?quality=` forced, wall-clock ms per frame,
median of three 3 s windows. Machine load average was **7.3 at the start and 10.9 at the end**
(other agents), so treat every number as plus or minus 1 ms. Raw: `final/perf/perf-final.txt`.

| Tier (buffer) | Target | WebGPU p=0 | WebGPU p=0.5 | WebGL2 p=0 | WebGL2 p=0.5 | Draw calls / triangles at p=0 |
|---|---|---|---|---|---|---|
| high (DPR 2, pass 1.15 px per CSS px, TAAU) | 10 ms | **12.97** (miss) | 9.11 (pass) | **19.89** (miss) | 16.50 (miss, p95 32.8) | 198 / 373k |
| mid (DPR 1) | 6 ms | **7.86** (miss) | 5.36 (pass, 3 frames over 50 ms) | **12.05** (miss) | 9.80 (miss) | 195 / 356k |
| low (DPR 1) | 4 ms | **4.17** (miss by 0.2) | 3.77 (pass) | **6.27** (miss) | 4.89 (miss) | 148 / 267k |

Trend at the worst framing (WebGPU, p=0): foundation (untiered) 14.6 ms at DPR 2 and 7.6 at DPR 1;
round 2 high 18.3, mid 9.0, low 4.4 (plus 0.6 to 1.5 s stalls as shipped); round 3 high 12.7 to
14.8, mid 8.1 to 8.5, low 4.4 to 4.6; final 13.0, 7.9, 4.2. WebGL2 high p=0 went 22.9 to 19.9.

Round 3's high-tier ablation at p=0 (same code): DOF off saves 1.3 to 1.8 ms, SSAO 1.3, bloom
0.5 to 1, the lamp and sun shadow maps 0.9 (and 94 of 198 draw calls are shadow passes). No single
culprit. Startup (round 3, same code): WebGPU 2.0 s warm and 3.25 s cold, WebGL2 2.65 s warm and
5.0 s cold, WebGL2 capture 9.7 s; WebGPU hook-to-ready is 1.8 s against the foundation's 0.65 s.
`engine.measureGpu()` still returns nonsense (177 ms against 13.7 ms wall clock). Every one of the
12 live perf loads had 0 console errors.

## 6 · What still reads as CG, ranked

1. **The lamp glow is an orange neon column.** A narrow flat saturated stripe with a straight
   edge and a capsule top on L2's hinge stile and R1's stile, the same at noon (L* 52, C* 35) as at
   night. At 17:41 wood_lamp_glow is +1.08 stops at C* 41 against 23 and the photo's L2 stile is
   dark (C* 2); at 18:40 the photos show the whole stile washed gold on gloss with a crisp shade
   shadow, the render a narrow band with a white core (16 to 25 % clipped against 3 to 6 %). It is
   the first thing the eye lands on in every hero.
2. **The sky and far trees read as illustration.** The 17:41 cumulus is hard yellow cut-outs with
   bright rims (glass_bright C* 3.6 against 11.0, hue 146 against 102); the far canopy is painted
   green with gold disc dots that jump in motion (21 to 31 % of the tree box changes per 0.2 s in
   round 3). The cause is `gradeSky`'s luminance-ratio masks plus sky gaps between tree cards
   graded as lit cloud.
3. **Surfaces read as CAD.** The enamel is matte pink-brown with no long window streaks, the room
   bars have no highlight line, the lamp dome is matte grey-brown with a fuzzy edge (+1.15 stops,
   C* 5.3 against 0.2; still +1.02 with the lamp off), the escutcheon is a flat keyhole icon, the
   frosted R2 is 10 px mottle instead of 1 to 2 px speck grain, and the outside grille bars still
   carry dust stipple.
4. **The hero is not high definition.** DPR 2 frames carry about a third of the photo's fine
   detail (0.83 against 2.68 on round 3's round-trip metric); DPR 2 scores the same as DPR 1. Slanted
   stiles stair-step before TAAU converges, so they will crawl while the visitor scrolls.
5. **The p=0 layout fights the page.** Both text boxes straddle bright glass and dark wood by day
   (spans of 140 to 150 levels), and the phone frame is two thirds dark stile.
6. **Hour and weather are hard to read from the window.** 09, 12 and 15 differ by 5 to 6/255, 21:00
   and 00:00 are identical, clear equals partly, and the night outside has no city light at all.
   Clouds morph and race at time-lapse speed (round 3), and the room motes ignore the wind.
7. **Dusk close-ups** (18:40, with the ceiling light): panes too blue with lit cloud wisps where the
   photos are flat slate, the screen's lamp reflection is a 1 to 2 px laser line, an orange haze
   floods the frame edge beside the lamp, and props are wrong or missing (car livery and position,
   a blank tile, an empty desk, a tan portrait bezel).

## 7 · Recommended next round

In priority order. Each item names its lane and a gate.

1. **Light: one exposure chain, then one lamp.** Give every capture shot the photo's EV100 (17:41
   9.6; 5480 5.0; 5481 4.3; 5482 3.7; 5483 3.7; 5484 3.6) as a physical exposure reported in
   `stats()`; drop Photo-true's `spill.intensity` 2.0 doubling in `looks.js`; fit ONE lamp
   intensity in physical units against both hours; reshape the spill as a wide smooth falloff (65
   to 70 degree half-angle, at most about 1 stop across the stile, no white core, penumbra 0.6 or
   more) and let the lamp go through the same auto exposure as daylight so it fades to a tint at
   noon. Gate: wood_lamp_glow within 0.3 stops and d_ab under 8; L2 hinge stile at 17:41 C* 5 or
   less; 5482 lit_stile_mid within 0.4 stops; noon stripe L* under 35.
2. **Light and outside: sky and canopy.** Key the recolour on the Living Sky shader's own cloud
   density and lit terms (plate alpha or a second target), bias 17:41 partly to one large low
   cumulus in row B with soft edges that clip to cream, grade the horizon band as haze, and densify
   the street canopy so no sky gaps become gold dots. Slow cloud advection to its real angular
   speed. Gate: glass_bright C* 9 or more at hue 90 to 110; no row-C pixel with b* over 30 and L
   over 65; tree-box change under 10 % per 0.2 s.
3. **Core: the p=0 frame and a calm field.** Pull p=0 3 to 5 degrees of yaw right so dark stiles
   sit under the greeting and the flat casing under the timeline; add a feathered calm field
   (extra defocus plus 0.5 to 1 stop of local compression) for p under 0.15; reframe the phone
   onto one tall pane column. Gate: both boxes p5 to p95 under 70 levels and edges under 1.2 % at
   09:00, 12:00 and 17:41, light and dark theme.
4. **Room: gloss.** Enamel roughness 0.2 to 0.3 with a clearcoat and a brush-stroke normal so the
   window paints long streaks; rounded black-gloss room bars; dome and cup at albedo 0.03 or less
   with a crisp window rim, no hammered noise; two screw holes instead of the keyhole icon; R2's
   frost as speck scatter, not value noise. Gate: hero lamp region within 0.3 stops and C* under
   1.5; 5480 casing hue 35 to 45; R2 fine-grain sigma 3 or more.
5. **Core: resting supersampling.** When the camera has been still for N frames, keep jittering
   into a full-resolution history so a resting hero converges at 1.5 to 2 px per CSS px; add
   specular anti-aliasing on thin glints. Gate: DPR 2 detail at or above 1.4 on the window crop.
6. **Core and light: performance.** Static shadow maps (re-render only when the lamp, the sun or a
   caster moves; bamboo every 4th frame), half-resolution DOF inside TAAU, SSAO every other frame
   at rest, no air on low at p=0, lazy per-look pipeline warm-up, and fix `measureGpu`. Re-measure
   on an idle machine. Gate: high 10, mid 6, low 4 ms at the p=0 hero on WebGPU, and a stated
   WebGL2 policy (WebGL2 misses every tier by 50 to 100 %; either cap WebGL2 at mid or low, or
   give it its own targets).
7. **Outside and light: hour, weather, night.** `wx=clear` sets cloud cover near 0; key the window
   to sun altitude and azimuth (raking morning light, bleached noon, warm afternoon); move the
   dream moon along the real hour angle; add a night layer outside (a few lit windows as bokeh,
   white-LED street spill, urban skyglow). Gate: every adjacent pair in the hour sweep differs by
   12/255 or more; Heightened 21:00 glass L* 12 to 25 with visible structure.
8. **Core: ship hygiene before integration.** Move the capture-only posters (`shot-1741.jpg`,
   `shot-1840.png`) out of `public/` to a dev-only path: `shot-1741.jpg` is a crop of Agam's real
   Claude conversation and ships with every build. Re-solve 5482 and 5484 to 5 px RMS or better
   (today 4.8 to 18.1 px) before any material is tuned on a close-up.

## 8 · Verified and not verified

Verified in this pass (renders looked at): the Photo-true, Heightened and Dreamlike reference
shots and their scores; the three p=0 heroes and the night hero at DPR 2; WebGL2 parity at the
reference and at the DPR 2 hero; the runway, phone, hour, weather and storm-motion sets; text-zone
measurements; per-tier frame times on both backends; 0 console errors in 41 captures (2 known WebGL2 beginQuery warnings) and 12 live
loads.

Not verified: real-time playback and scroll feel (motion judged from still strips), a headed
browser on a 120 Hz display, real phones, true GPU time, frame times on an idle machine, the
close-up shots (not re-rendered; cited from round 3 on identical code), and the folio-page
integration, which has not started.

## 9 · Reproduce

```sh
cd "/Users/agamagarwal/My Drive/Active - Portfolio/Portfolio"
F=/Users/agamagarwal/window-light-runs-archive/loop/final
for b in ref hero runway tod weather motion; do
  node tools/window-light/render.mjs --batch $F/batches/$b.json --outdir $F/$b --console --quiet
done
python3 tools/window-light/compare.py $F/ref/ref-photo.png tools/window-light/ref/ref_1600.png --draw-regions
cd $F/perf && DPR=2 RUNS=3 node perf.mjs "$(cat variants.json)"
```

## 10 · Look pass, build-01: the brass D-handle (2026-10-05)

Branch `window-look-pass`, not committed. Renders and tools:
`/Users/agamagarwal/window-light-runs-archive/close/build-01-brass-handle/` (before, after, iter/sweep,
tools/bmeas.py, masks/, before-after.png). The tree also held another session's uncommitted prop edits
(bobblehead, scooter, VR headset, tissue frame); before and after were rendered on that same tree
(checksums in before/tree-start.md5), so they differ only by the brass.

Fit (handle-on probes; hero p=0 17:41 in three looks, 5482 with bloom and glare off; brass-only masks):

| f0 and tarnish scale | surround | surroundSat | hero brass dL D / H / P | 5482 brass d_ab | dL | dE76 |
|---|---|---|---|---|---|---|
| 0.8 | 0.5 to 1.1 | 0.4 | -2.4 to -1.3 | 1.0 to 5.5 | -10.4 to -4.0 | 6.8 to 10.4 |
| 1.0 | 0.5 | 0.4 | -0.4 / 0.0 / +0.2 | 1.11 | -6.90 | 6.99 |
| 1.0 | 0.8 | 0.4 | -0.2 / +0.2 / +0.4 | 4.41 | -3.31 | 5.51 |
| 1.0 | 1.0 | 0.2 (chosen) | -0.1 / +0.2 / +0.6 | 4.45 | -1.69 | 4.76 |
| 1.0 | 1.1 | 0.0 | 0.0 / +0.4 / +0.5 | 4.41 | -0.75 | 4.47 |
| 1.2 | 0.5 to 1.1 | 0.4 | +1.4 to +2.3 | 2.4 to 7.9 | -4.0 to +2.7 | 4.7 to 8.3 |

Scale 1.2 breaks the hero gate (+2 or less) in Photo-true and Heightened and drops the room pixels brighter
than the handle's p95 under 0.01. The plan's objective (lowest 5482 d_ab) would pick surround 0.5, but that
handle is 6.9 L* darker than the photo's grip, so the choice was made on dE76 (d_ab and L* together) among
the feasible rows. The chosen row keeps a fifth of the paint's chroma in the mirrored face; surroundSat 0
(a grey face) scores within 0.3 of it.

Result (before -> after, this tree): measure.py brass_handle dreamlike dL +6.95 -> -3.12, room pixels
brighter than its p95 0.0034 -> 0.011; photo dL +5.92 -> -2.01; 5482 dh -11.2 -> -6.7, dC +8.81 -> +8.10,
d_ab 12.86 -> 9.86. New measure.py key brass_only (brass masks): hero +11.3 / +12.5 / +9.5 -> -0.3 / +0.2 /
+0.5; night 21:00 -6.5 -> -8.1, dusk 18:40 -6.6 -> -8.5, noon +10.2 -> -2.4; 5482 veil-free dh -10.0 -> -0.4,
dE76 13.7 -> 4.9; through the veil dh -7.9 -> -1.0 but dE76 13.1 -> 14.2 (the veil adds about +20 L*).
ref1741 composite 48.95 -> 48.98 (WebGPU), 48.84 -> 48.83 (WebGL2); the 18 standard shots are pixel-identical
(the handle is off; the hinges share the material and show nowhere). Frame time at the 1440x900 DPR 2 hero,
WebGPU high: handle off 18.0 / 17.9 ms, on 17.95 / 18.0 (delta under 0.1 ms; load average 4.5 to 5.7).
0 console errors and 0 warnings in 34 captures, both backends, all three tiers.
