# NEXT · Where the window scene stands, and what to do next

Paused 2026-09-27 14:58 at Agam's request ("close this for now, with notes for when we have more
tokens"). Read this first, then `30-locked-brief.md` (it still wins), then `50-loop-ledger.md`.

## State at the pause (verified)

- **Code:** `Portfolio/src/scene/window/` at the end of loop 2's FIRST fix round. Loop 2 was stopped
  while its second fix round was starting; none of those round-2 edits reached the project (checked by
  file times: the last scene edit is 13:37, the stop came after 14:18). All leftover render servers
  and headless browsers from the loop were stopped; only Agam's dev server on 5173 is running.
- **Renders cleanly:** `/window` on 5173, 0 console errors and 0 warnings on WebGPU and on
  `?backend=webgl2`.
- **Photo-true vs the 17:41 photo:** composite **78.7** (loop 1 ended at 75.9, the foundation at 54.5),
  SSIM 0.842, edge IoU 0.605, grid luminance error 0.23 stops, grid CIEDE2000 2.6.
  Stop-state renders: `/Users/agamagarwal/window-light-runs-archive/loop2/stop-state/`.
- **Art scores** (loop 2 critics, 1 to 10, 8 = ships on the home page): Dreamlike 4 to 5.5,
  Heightened 4 to 4.5, Photo as art 4.5 to 6, Motion 5. Still below the bar.
- **What loop 2 round 1 fixed:** the orange neon lamp stripe is gone (one exposure chain, one wide soft
  spill that fades by day; all lamp gates pass); the gold dots in the canopy and their flicker are gone;
  the daytime hours now read apart (cool 09:00, bleached 12:00, warm 15:00); weathers separate; TAA was
  carrying the jitter in its velocity (a real r186 ordering bug, fixed), so 1:1 detail at DPR 2 now
  passes; R2's frost grain passes.

## DONE 2026-09-27: the calm-field blur band is fixed

The screen-space defocus is off (`params.calm.defocus` 0.9 -> 0). The far field under the text now softens
through the camera's own depth of field (`params.calm.farBokeh` 2, eased out by p 0.3), and the tone
compression acts only on what lies more than 0.3 m beyond the glass (`params.calm.gate`, a quarter-res,
blurred depth mask in `calm.js` so it cannot shimmer along the bars), shaped per text box (`shape: "boxes"`,
140 px feathers); the phone calms only the greeting. Verified: 0 errors on WebGPU and WebGL2; the frame,
bars and handle are crisp across the whole hero; the night keeps the moon; the phone shows one sharp
bamboo pane; Photo-true reference unchanged at 78.7 (named shots never use the calm field).
Before and after: `/Users/agamagarwal/window-light-runs-archive/calmfix/calmfix-before-after.png`.

**The trade, stated plainly:** the old text-zone gate (spans under 70 levels, edges under 1.2 %) is RETIRED.
It could only pass by blurring the in-focus frame. With the frame crisp the boxes measure spans 89 to 100
and edges 2.0 to 2.3 % at 17:41; text contrast over the bare scene is 1.3 to 1.4:1 for the light theme's
#111111 and 2.7 to 3.3:1 for the dark theme's #ededed. So the greeting and timeline need the page's own
scrim or card at integration, held to 4.5:1 in both themes (this was already required for the light theme).

## Agam's open requests (2026-09-27, from his screenshot mid-scroll; NOT started, the agent was stopped before editing)

All four are in the room lane (`room.js`, `params.room.js`, `materials.js`, `room/`). Do them solo, one at a time, no
agent fleet (Agam asked to stop burning tokens on agents). His screenshot: the session's `images/1.png`, p about 0.5.

1. **DONE 2026-09-27: the ledge is gone.** `params.room.sill.ledge` false: the bottom is a flush enamel rail at the
   casing face (`room/window.js`), no shelf; `ledge: true` restores it.
2. **DONE 2026-09-27: the car and the tile sit on the monitor's top edge** (`room/interior.js` parents them to the
   monitor; `params.room.car/tile.on = "monitor"`, `mx`, `mz`, `myawDeg` in the monitor's frame; the monitor's top
   edge deepened 1.8 to 2.6 cm). The car matches 5483's position (frame x 0.60 vs photo 0.63); the tile is small
   and dark at its spot, worth a look. 17:41 reference unchanged (78.7), 0 errors on both backends.
3. **DONE 2026-09-27: one window, not two pieces.** Causes: the right pair was a separate frame turned 23 deg and
   taller (a fourth row running down past the monitor), with its own blind, and the room-side iron grille broke at
   the joint. Now `params.room.window.right.flat` true (same glass line and rows as the left pair; R1 still ajar on
   its hinge), one blind across the head, the right wall run on to the side wall (it had left a slot of daylight),
   and `params.room.grille.enabled` false (Agam: no metal grille inside; the outside box grille stays). Trade: the
   17:41 reference composite falls 78.7 -> 67.2, because the photo has the inside grille and the right leaves
   swung out; do not tune back toward it.
4. **DONE 2026-09-27: the bead chain is one closed loop.** The strands run close to parallel (0.8 to 2.4 cm apart,
   `params.room.beadChain.spreadTop/Bottom`) into a U of beads under the last hinged segment (`chainLoop` in
   `room/interior.js`), so it swings with the wind as one piece.
5. **DONE 2026-09-27: the portrait monitor runs an AI code editor** in the Antigravity manner (Agam asked for
   Antigravity by Google): `room/codeScreen.js` draws it at load (no logo, no downloads): title, activity bar, tab,
   the calm field's own code with syntax colours, an agent panel with the moon exchange, a prompt box; the cursor is
   its own mesh and blinks (room.js). `params.room.portrait.screen` { enabled, intensity 0.35 }. Not yet dimmed at
   night by the main screen's rule.

Verify each from his viewpoint (p 0.35 to 0.65 at about 1989 px wide, and on `/portfolio?scene=window`) and keep
the 17:41 reference within 1.5 points of 78.7.

## Then, ranked (merged from both loop 2 critics; lane, what, gate)

1. **DONE 2026-09-27: gold back at 17:41.** Cause: Heightened and Dreamlike carried tighter cloud
   thresholds than Photo-true (cloudLo/Hi 0.8/1.2, litLo/Hi 1.0/1.8), so the lit cumulus was classed as sky
   and went neutral. Ruled out by override renders: glare, local tone, exposure, gold and saturation.
   `looks.js` now: Heightened 0.6/1.0, 0.8/1.4, litGain 1.6; Dreamlike 0.5/0.9, 0.7/1.25. glass_bright at the
   17:41 framing: Heightened C* 9.8 at hue 102 (was 0.3 at 257), Dreamlike 11.0 at hue 111 (was 3.0 at 149),
   photo 11.0 at 102; Photo-true unchanged (78.7). Other hours unchanged (mean diff 0.11/255 or less at 09,
   12, 21 and overcast). Left open: Dreamlike's hue sits 6 degrees yellow-green of the 85 to 105 band, and
   the gold lives in the upper-middle panes; moving the cumulus into the top-left row (the skyPlate view)
   would put more of it in the first frame. Sheet: `/Users/agamagarwal/window-light-runs-archive/gold/gold-before-after.png`.
2. **light** Night is one picture and the lamp is a flat salmon flood: real distance falloff from the
   bulb, the shade's cut-off as a crisp diagonal across the handle leaf (as in 5482), enamel hue 68 to 85.
   Gate: 18:39 vs 21:00 vs 00:00 differ by 12/255+ at p=0.
3. **DONE 2026-09-27: the Dreamlike moon moves with the hour.** `placedMoonAt` (outside/moon.js) gained a
   clock mode and is now wired: engine.js computes it once per frame for the plate's disc, the dome point, the
   halo and rim (`state.moonPlaced`) and lights.js's moon key. By the clock, not the real hour angle, because the
   hour angle parked the moon on every night the real moon was down. Track fitted on a 105-point sweep of the
   disc at the p=0 hero: no spot is fully clear (the outside 10 cm grid always crosses it; best 0.86), so the
   gate 'clears every bar' is not reachable at this framing. Result, 1440x900: 19:00 x 378 (clear 0.67),
   21:00 x 348 (0.48), 00:00 x 301 (0.71, its top), 03:00 x 253 (0.52); phone 189 -> 92 px (0.29 to 0.76).
   Sheet: `/Users/agamagarwal/window-light-runs-archive/moon/moon-by-hour.png`.
4. **room** The brass D-handle reads as pale salmon plastic and is the most legible object at p=0:
   oxidised brass (metalness 1, roughness about 0.3, anisotropy along the grip, patina in the bends),
   slotted screws.
5. **room** Lamp dome and cup still clay: coat reflecting the window as broad soft highlights, the
   bracket, screws and cable modelled. Gate: hero lamp region within 0.3 stops, C* under 1.5 (fails
   today at +1.15 st, C* 3.7; part of it is post glare, a light-lane lever).
6. **light** Dusk close-ups drown in an orange veil: no visible beam at 18:40, threshold the glare source
   above the clip point; apply each photo's as-shot white balance by Bradford adaptation instead of the
   7500 K ceiling hack (5480 4238 K tint +16, 5481 4118 K, 5482 3543 K, 5483 4169 K, 5484 3285 K).
7. **outside** The canopy reads as a procedural cell texture: leaf-cluster cards at two scales, two to
   three depth layers with aerial perspective, darker interiors, warm rims on the sun side.
8. **room** Glass grain: 1 px specks at the photo's contrast plus a 20 to 60 px haze with a per-pane
   gradient; no cellular mid-scale noise; the outside bars must not read as granite.
9. **room + light** Mid-runway: the monitor needs a 6 to 8 mm bezel, a chin and back thickness; the
   screen needs a roughness map so the lamp glint spreads; scale veiling glare by local darkness.
10. **light** Noon reads overcast grey: bleach only what is beyond the glass, keep room blacks; crisp
    short grille shadows on the sill at noon.
11. **outside** The storm has no storm: slate sky, wind-driven sheets that follow the gusts, a lightning
    key every 8 to 15 s.
12. **light** Soft shadow edges on the spill (real PCF kernel or PCSS), no razor terminators on the
    bookend walls; no white-hot streaks at grazing angles.
13. **room** Props: rebuild the car as the photographed hot-rod in front of L2 row C, pose the portrait
    monitor from 5480, add the bottle, cable holder and tile.
14. **core** Close-up camera solves are still loose (edge IoU 0.10 to 0.18 on 5480 to 5484); re-solve
    before tuning any material on a close-up.

## Performance: re-measure before deciding anything

Every tier missed its budget in loop 2, but the measurements are NOT trustworthy: the GPU was 65 to
83 percent busy from other agents while nothing of ours ran. Re-measure on an idle machine
(`perf.mjs` in the loop 1 archive, see `50-loop-ledger.md` section 9). Budgets at the 1440x900 p=0 hero
on WebGPU: high 10 ms, mid 6, low 4. Levers already in: static shadow maps, SSAO every other frame
at rest, no air on low, half-resolution DOF inside TAAU. Still to decide: a WebGL2 policy (it runs 50
to 100 percent slower; cap it at mid or low).

## Waiting on Agam

- **Three tape measurements:** one pane's clear-glass width, monitor screen to glass, sill depth. They
  go into `31-measurements.md`; geometry is in pane widths W, so three values change.
- Optional photos: the bamboo in daylight, a 10 second clip of it in wind, a midday and a night frame
  from the chair.

## Landing stills (Safari session's poster + loader, 2026-09-27)
- There are 48 stills in `public/window-scene/landing/` (screen shape x time of day x theme), picked by landingPoster.js.
- Re-render them after ANY change to the camera, room, window, outside or look. Run it from the Portfolio folder (Playwright is now a devDependency): `OUT=<dir> node tools/window-light/landing-posters.mjs`, then copy the jpgs over.
- The tool passes `&theme=`, because the site no longer reads localStorage 'theme'.
- The last render was after the slimmer meeting stile and with the grille off.

## Screens 1:1, theme by the clock, dense code (2026-09-27)
- The folio's screen shows the page 1:1 from the first frame: `handoff.page` runs from 0 to 0.001 via useWindowScene. Before this, the opening p of 0.5 sat where the page composite starts, so dark mode showed a washed-out black.
- The portrait editor is also composited 1:1. `post.js` has a second quad (the `prt*` uniforms), and `lights.js` puts `bus.rects.portrait` on the bus. Its ground measures #0e0e10 in dark and #ffffff in light, matching the main screen.
- `codeScreen.js` now draws the folio's own source (Hello.jsx, WorkGrid.jsx, helloData.js, hello3.css) in two 6 px columns, with dark and light palettes. `engine.js` keeps it on the page's theme through `setTheme`.
- The site-wide theme follows the clock (`src/lib/autoTheme.js`): light while the Bangalore sun is above -4 degrees, or by the visitor's clock when the sky is set to theirs. `?tod=` moves it too. A toggle pick wins until the next dusk or dawn (the `theme-manual` key stores the clock's verdict at the pick; it was 12 hours, which kept a 18:42 pick of light into the night). The page re-checks every minute.

## Meteor 350 miniature (2026-09-27)
- The souvenir tile on the monitor is gone (the tile code and its params are left in place). In its spot is a procedural 1:30 Royal Enfield Meteor 350 in Fireball red, built in `room/bike.js` and placed by `params.room.js` `bike`. It faces right and leans on its side stand. Checked in the bike3 render (archive).

## The speed ramp (2026-09-27, Agam: "a speed ramp connected to scroll, so I'm not stuck in the transition on a trackpad")
- `src/scene/window/scrollRamp.js`, installed by useWindowScene when `ramp: true` (the folio page); `?ramp=0` turns it off.
- The runway only rests at the room (raw 0) or the page's top (raw 1). When a scroll comes to rest in between (110 ms after the last wheel, or 160 ms after native movement), or a trackpad's momentum tails off (5 decaying wheel events of 8 px or less), the ramp takes over through Lenis `scrollTo` and finishes the move in the direction of travel.
- The profile is a cubic Hermite that starts at the scroll's own speed, then eases in over 350 to 900 ms.
- A move of under 5 % of the runway falls back where it came from. The commit is judged by Lenis's target, not the current position.
- A scroll in the other direction, a touch or a key lets go. After a ramp, that gesture's leftover momentum is absorbed until a 140 ms pause.
- Programmatic scrolls (anchors) are never hijacked.
- Fixed along the way: the live poster captured the fixed scroll pill, so the monitor showed a second one. `livePoster.js` SKIP now includes `wscene-nudge`.
- `scrollrec.mjs` gained `flick:PX`, a trackpad flick at a 16 ms cadence.
- Verified in ramp3 and ramp4 (archive).

## Folio flow v2 (2026-09-27, Agam): the portfolio starts INSIDE the monitor

The first frame is the pulled-back room (the scene path's p 0.5: `useWindowScene` pFrom 0.5) with the portfolio's
TOP on the monitor (`public/window-scene/posters/folio-top-light.jpg` / `-dark.jpg`, captured at 2560x1440 with the
sky band hidden; the old work-grid posters are kept). The hero is no longer over the scene: a 150svh spacer
(`.hello-scene-run`) sits ABOVE the page, p runs over its whole height (pOver "height"), and p = 1 as the hero's
top reaches the viewport top, so the page starts from its very top. Until then `html[data-wscene-landed=false]`
hides the page's content; the intro is skipped in scene mode; the hero fade and SkyTip follow. Verified headless
1440x900: 0 errors, landing on the real hero; plain /portfolio unchanged.

**Hand-off aligned (2026-09-27):** the monitor now shows a LIVE capture of the page's own first viewport
(`livePoster.js`, modern-screenshot `domToCanvas`, at this viewport's size and pixel ratio, recaptured on resize and
theme change) placed on the screen's texture where `engine.screenRectAt(1)` lands the screen; `handoff.toPage` keeps
it to the end (no fade to ground) and the post's page composite shows it untonemapped, so the canvas hides onto the
same pixels: p 0.995 vs landed differ by 1.75/255 on average (2.2 in the hero). The waiting content is held at
opacity 0 (not visibility) so the capture can restore it. Small residue: the capture clips the timeline's last
letters by a few px (foreignObject text metrics) and the face badge draws a touch differently.

## The bead chain swings; the scroll nudge (2026-09-27)

- The chain is shorter (bottom 0.2 -> 1.8 W) and has eight links (was four). It swings under the cursor: the page
  feeds the pointer (mouse and pen only) to `engine.setPointer`; `room.js` projects each link to the screen, a
  cursor within `physics.reachPx` pushes it along its motion, and the links integrate as damped pendulums (relative
  angles, a lagging whip from the link above, the draught as their rest). A grab cursor shows over it
  (`html.wscene-grab`). `params.room.beadChain.physics { reachPx 24, push 0.0022, stiffness 14, damping 1.1 }`.
  The recorder gained `swipe:x0:y0:x1:y1:steps` and `frames:N` steps to test it.
- The scroll nudge (`WindowSceneFolio.jsx`, `.wscene-nudge`): "scroll" and a down arrow in Google Sans Code on a
  pill of the page ground (78 %, blurred), bottom centre of the opening frame, fading over the first 8 % of the
  runway (`--wscene-run`) and gone at the landing; the arrow bobs 3 px unless motion is reduced. The arrow is
  Material Symbols `arrow_downward_alt` (Google's short arrow, inline SVG, path from fonts.gstatic.com), after the
  drawn one read too long. At 1989x1080 it
  overlaps the monitor's "I'm Agam" line (legible on its pill).

## Screen glow and the editor (2026-09-27)

- "Too much glow on the screen": override renders showed the screen's own bloom was most of the milky halo round
  the monitor, the Dreamlike glare the rest (the air none). `params.screen.bloom` 0.06 -> 0.012; Dreamlike glare core
  0.02 -> 0.014 and mid 0.03 -> 0.02 (the tail kept, it is the window's warm halo). Opening frame, 1989x1080 light:
  band above the screen 93 -> 85, beside it 56 -> 48 (mean luma).
- The code editor "zoomed out, not really legible, just a lot of code": `room/codeScreen.js` now sets the scene's own
  source (calm.js and livePoster.js, bundled with ?raw) at 11 px with syntax colours, about a hundred lines, a file
  tree, tabs, a minimap and a thin agent strip.
- "A glow on both screens, reduce it so the views are sharper": the editor's screen fed the Dreamlike bloom at full
  strength (now `params.room.portrait.screen.bloom` 0.04 via its mrtNode, like the main screen), and the path's depth
  of field focused past both screens. On the folio page the camera now focuses on the main monitor all the way in with
  half the blur (`params.camera.folio { focusScreen, bokeh: 0.5 }`, set by the hook). Opening frame, 1989x1080 light:
  editor sharpness (Laplacian variance) 109 -> 183, main screen 49 -> 64, the halo above the editor 38.6 -> 34.6; the
  window behind picks up a little more softness.
- "The previews are broken on the right side monitor": the live capture ran before the work grid's media were ready
  (its phone screens are lazy <img>s a runway below the fold, its clips <video>s with no decoded frame yet), so the
  monitor showed black phones. `livePoster.js mediaReady` now switches the band's lazy images to eager and decodes
  them, and waits for each clip's first frame, capped at 4 s, before capturing. Verified at 1989x1080: every card
  shows its preview (the clips differ from the page only by which frame they were on).

## Transitions fixed (2026-09-27, Agam: "transition in and out of the screen utterly broken")

Found with a new tool, `tools/window-light/scrollrec.mjs`: real WHEEL scrolling through Lenis in headless Chrome,
a frame plus the page state per step (`--plan`, `--dpr`, `--pre` for a theme switch). Pinned single frames could not
show it. Causes and fixes:
1. The theme MutationObserver fired on every <html> class change, and Lenis toggles `lenis-scrolling` on each scroll:
   the page was RE-CAPTURED on every scroll start/stop (main-thread stutter) and the monitor baked whatever state the
   page was in (a half-faded hero on the way out, grey cards on the way in). Now only a real theme change recaptures.
2. Captures reset the hero's scroll fade (`.hello-hero__inner`, `.hello-hero__table` opacity and rise) in the clone.
3. The work grid faded in over a white page at the landing (the sections' own opacity transitions): scene mode sets
   `transition-property: none` on the page's top-level sections, so they appear on the frame the canvas hides.
Verified (1440x900 DPR 1 dark, 1989x1080 DPR 2 light): in, out and back in are continuous; the last canvas frame and
the first page frame match (only the Away card's phone video differs: it plays on the page, the capture is black).
The recorder's own bug, for the record: a screenshot `clip` is in DOCUMENT coordinates, so clipping at y 0 captured
an off-screen region once scrolled; capture the viewport (`captureBeyondViewport: false`).

- The ending (pull-back into the monitor at the bottom) is OFF for now (Agam): `endRun: false` in
  WindowSceneFolio.jsx, the spacer rendered as a zero-height `.hello-scene-end--off`, the contact section's
  full-screen rule applies only with the ending on. Turn it back on by flipping both.
- Camera turn: `sweepDeg: -5` (negative = LEFT; +5 had turned it right): the code editor's monitor shows at the left,
  the main screen is cut on the right, and the window drifts left as the camera closes in (0 at the landing).
- Open: Agam's "Adding the construction of the window needs to take three minutes" was garbled by voice input;
  asked what he meant (three windows?). Nothing changed for it yet.

## Folio flow v3 (2026-09-27, Agam): the page ends INSIDE the monitor

- The old bookend (a wide room shot with the footer sliding over it) is gone. `.hello-scene-end`, a 150svh spacer
  AFTER the footer, is the ending: through it the camera runs the main path backwards from the screen to the
  opening framing (p 1 -> 0.5), the page content held back, and the monitor shows a live capture of the contact
  section (`captureEnd`). The footer fills the last screen in scene mode (min-height 100svh, content centred).
  Seam at the start of the ending: 0.5/255 (live contact vs first canvas frame).
- Captures now embed the page's fonts: the Google Fonts CSS is fetched (the capture cannot read that
  cross-origin sheet, and an SVG image cannot load external files), latin subsets only, every url() inlined as
  a data URL, once a visit (`livePoster.js pageFontCss`). This fixed the ending's re-wrapped heading (Georgia
  instead of Newsreader) and the clipped letters in the hero capture.
- `params.camera.sweep` (folio: 5 deg, eased out from p 0.5 to 1): Agam asked for "a little more movement of
  the window to the left". As built, the opening frame turns the camera so the window sits further left and it
  settles as the camera closes in; flip the sign (`sweepDeg` in WindowSceneFolio.jsx) if he meant the window
  should travel left during the scroll instead.

## Integration: DONE 2026-09-27, behind `?scene=window`

`/portfolio?scene=window` (and `/?scene=window`) runs the scene on the real folio page. Hello3 swaps the Living Sky
band for `WindowSceneFolio` (fixed canvas, z-index 0: the app's page wrapper paints the ground as an in-flow
background, so -1 was hidden under it). The hero plus one viewport of spacer is the main runway (p reaches 1 as the
work grid's top meets the viewport bottom, where the screen's light is the page ground); a bookend runway before the
footer pulls back into the room; the footer (z 1, page ground) rises over the closing shot. The sandbox and the
folio page share `src/scene/window/useWindowScene.js`. Without the flag nothing changes (verified: sky band present,
no scene, the runway wrapper is `display: contents`). Verified headless, 1440x900, 0 console errors: p 0, 0.5, 0.9,
1, past the hand-off (the real grid on the ground), bookend, footer. Sheet:
`/Users/agamagarwal/window-light-runs-archive/folio/folio-scroll.png`.

Rendering the folio page headlessly: the intro locks `body` overflow until its reveal stage (about 3 s or more), so
send Escape first, then scroll through the site's Lenis (`(await import('/src/ui/smoothScroll.js')).getLenis()
.scrollTo(y, { immediate: true, force: true })`); a plain `scrollTo` is undone by Lenis. The canvas carries
`data-p` and `data-p2` (the progress the page computed).

Follow-ups before flipping the flag's default:
- Text over the hero: the greeting and timeline need the page's own scrim or card, 4.5:1 in both themes.
- The hand-off: the monitor's poster shows the grid, the screen then goes to plain ground, then the real grid
  rises from below. Align the poster to where the grid actually lands after the hand-off, or let the grid rise
  earlier, so the same cards carry straight through.
- The footer's ground only covers its own box; the room shows around it (reads as a card over the room). Decide
  full-width ground or keep.
- DONE 2026-09-27: header controls beside the theme toggle (`SceneControls.jsx`, only while the scene is on):
  the sky toggle (house = my Bangalore sky, globe = yours; `lib/weather.js` setSkyMode, which the scene's bridge
  follows) and the look menu (Dreamlike default, Heightened, Photo-true; `lookStore.js`, remembered per visitor, a
  `?look=` in the URL still pins it). Verified headless: picking Photo-true switches the scene and persists; the sky
  toggle flips. The page's content is now held from the first paint and given back (runway collapsed) if the scene
  cannot start.
- The weather tooltip (SkyTip) still refers to the sky band.

## How to resume

- **Cheapest useful step:** item 3 (wire the moving moon) or item 2 (the night lamp), one lane at a
  time, then render the hero, night and phone frames and look.
- **Resume the stopped loop exactly:** `Workflow({ scriptPath: "<the loop-2 script>", resumeFromRunId:
  "wf_8d7687ab-131" })`. The script is saved under the session's workflows folder
  (`window-scene-tune-loop-2-wf_8d7687ab-131.js`); resume works only in the same Claude session. In a new
  session, start a fresh loop seeded from the ranked list above.
- **Cost guide from this session:** understanding 8 agents (about 1.9M tokens), foundation 8 agents
  (4.3M, 4.4 h), loop 1 15 agents (6.5M, 8.8 h). One fix round with four lanes plus two critics costs
  roughly 2 to 3M. To spend less: run one lane at a time, one fix round, one critic.
- **Tools:** `tools/window-light/README.md` (render.mjs with a fresh temp Chrome profile every run,
  compare.py, sheet.py). Renders go to `/Users/agamagarwal/window-light-runs-archive/` (outside Drive); only final
  sheets belong in `tools/window-light/runs/`.

## House notes learned here

- The capture-only posters live in `tools/window-light/ref/capture-posters/` (one is a crop of a real
  Claude conversation). Never move them back into `public/`.
- r186 gotchas: `vec3(aTHREE.Color)` compiles to black; per-material MRT blend modes do nothing;
  `renderer.info` resets every frame; vertex motion must feed `positionPrevious`; the TAA node must
  register its view-offset hook before the MRT materials compile or every material bakes the jitter
  into its velocity.
- The Living Sky's window uniforms sit behind `#define SKY_WINDOW`; even default-zero uniforms moved
  pixels by 1/255 on the M3, so existing pages compile the untouched program.
