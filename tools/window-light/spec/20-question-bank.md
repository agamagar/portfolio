# 20 · Question bank for Agam (window-light scene)

Written 2026-09-26 by the final ranker. Understanding phase only: nothing in `src/` was changed.

Inputs: the 21-question bank, the just-build list, and two critics (evidence, materiality) over the four dossiers in this folder:
`10-r186.md`, `11-living-sky-weather.md`, `12-folio-page-scroll.md`, `13-photo-inventory.md`.

Tags: **VERIFIED** = read in source, measured, or checked on this machine. **INFERRED** = judgement.

---

## How the bank was cut

- **Rule applied.** A question died if either critic killed it with a real reason (evidence already answers it, or the answer does not change code or visuals). The one exception: a transcription ambiguity that changes what gets modelled always survives.
- **Result.** 8 of 21 survive, in two rounds of four. 13 are killed, and each one's answer is recorded below, so the build knows what to do without asking.
- **Order.** Round 1 holds the questions that fork the most code: the render loop and page architecture (Q06), the data source and clock (Q05), the whole look pipeline (Q04), and the foliage system (Q01). Round 2 holds geometry, scale and the two remaining voice-note words.
- **Survived by exception.** Q02 ("the ones") and Q03 ("37 degrees") were killed by the evidence critic but kept by the materiality critic as transcription ambiguities that change what gets built (an audio subsystem; the lamp cone). Both carry a default if Agam skips them.
- **Critic edits folded in:**
  - Q01: adds Badam (Indian almond, the strongest sound match for both "ballot tree" and "biometry's") and Neem; drops Bottle palm (the photo's small-leaved crown argues against it) and "Something else" (the question tool adds its own Other).
  - Q02: trimmed to the word itself; winds, rain and the moon phase get built from data whatever the answer.
  - Q03: "aim of the shade" and "half-angle 37" merged, because they render almost the same.
  - Q04: absorbs Q13's night licence (a moon moved into the window, a Milky Way) and Q20's "open the blocked panes" as concrete Dreamlike examples.
  - Q11: reframed. The evidence critic fitted the rails: the handle leaf (R1) and the grey far-right column (R2) share one straight rail line, about 31 deg out of line with the left pair (VERIFIED: R1 slopes -7.31 and -6.29 deg, R2 -6.86 deg, and R1's line predicts R2's rail at y 577 against 580 measured). A single ajar leaf cannot explain the photo.
  - Q18: trimmed. The monitor model is answered (BenQ MA270UP, VERIFIED with `system_profiler SPDisplaysDataType` on 2026-09-26: 5120 x 2880 backing, UI looks like 2560 x 1440). The compass is dropped (within +/-20 deg of north nothing visible changes). LiDAR is dropped (heavy for a small gain).

---

## Headline findings for Agam

1. **r186 is three 0.186.0 (2026-09-08), patched as 0.186.1 (2026-09-24).** The X post itself was unreadable (HTTP 402 and 451), so everything was read from the GitHub release notes, the migration guide and the 0.186.1 source. Pin `"three": "^0.186.1"`: the site's `^0.169.0` can never float up to it, and 0.186.1 fixes TRAA motion vectors. Use WebGPURenderer, which falls back to WebGL2 on its own. One install also serves the /dj console, which needs two small fixes (PCFSoftShadowMap was removed in r186; Clock becomes Timer). (VERIFIED)
2. **Your Living Sky shader is reused as-is.** WebGPURenderer cannot run the GLSL shader directly (no ShaderMaterial), but r186's WebGLRenderer compiled the vendored shader verbatim and rendered six distinct skies: noon, the 17:41 golden hour, 18:39 dusk, night, heavy rain and thunder. So the window shows the real shader as a texture, with no port and no fork of the 743-line source of truth. (VERIFIED, headless run)
3. **The live portfolio cannot be drawn inside the 3D monitor today.** HTMLTexture renders blank in stable Chrome (HTML-in-Canvas is still an origin trial), and r186's RenderPipeline tone-maps everything inside it, which would shift your brand colours. Hence the recommended hand-off: the screen's light becomes exactly the page background (#ffffff light, #0e0e11 dark), the canvas stops, and the page stays real DOM. By contrast, today's sky renders every frame for the whole visit. (VERIFIED)
4. **The site uses 6 of the roughly 40 fields Open-Meteo offers for free.** There is no wind direction and no gusts: today's gusts are two synthetic sine waves. Adding `wind_direction_10m` and `wind_gusts_10m` gives the tree real wind. Rain in mm, radiation, the moon phase and CAPE (storm instability) are also available. But the model missed the cumulus in your 17:41 photo (it reported code 2 with 0 percent low cloud), so the window gets an afternoon cumulus floor on top of the data. (VERIFIED, live fetch)
5. **Your window faces about north, so the sun and moon never appear in it.** At 12.9 N, the sun never gets closer than 67 deg to north and the moon never closer than 61.4 deg, while the window spans about -12 to +39 deg around north from the chair. Golden hour always lights the clouds from the left. A true night is city skyglow, a few stars, Polaris low in the north, and moonlight with no disc. (VERIFIED by calculation)
6. **The right-hand part of the window is out of line as one piece.** The handle leaf and the grey column beside it share one plane, about 31 deg off the left pair. So that section is either built at an angle, or both leaves were standing open. One ajar leaf cannot produce what the photo shows. (VERIFIED rail fit)
7. **The main monitor is a BenQ MA270UP: 27 inch, UI at 2560 x 1440.** It sits about 59 cm from the camera. The gap from its screen to the glass, though, solves to anywhere from 7 to 38 cm, because one pane's width is known only to plus or minus 20 percent. One tape measurement fixes the lamp position, the parallax and the camera path. (monitor VERIFIED, gap INFERRED)
8. **The lamp measures 3000 K, slightly yellow (#ffbe6c), and was re-aimed between your two sessions.** In r186 its beam needs VolumeNodeMaterial, because GodraysNode and SSSNode ignore spot lights. The thin iron bars need TRAA anti-aliasing, because WebGPU compatibility-mode devices get no MSAA. (VERIFIED)

---

## Round 1 · The forks that block the most code

### Q06 · Reading mode

- **header:** `Reading mode`
- **question:** Once the camera has flown into the monitor, what should the room do while people read your portfolio?
- **multiSelect:** false

| Option | Description |
|---|---|
| Hand-off (Recommended) | The screen's light becomes exactly the page background, the canvas fades and stops, and the page is real DOM at full sharpness with zero GPU cost, but the room is gone until the visitor scrolls back up. |
| Living frame | The page stays inside the monitor with a thin bezel and slivers of the room (lamp glow, a window edge) moving around it, which keeps the room present but squeezes every section into a screen-sized column and keeps the GPU running. |
| Dim room behind page | After the hand-off the room lingers as a soft tint behind the whole page, as the sky does today, which honours your earlier pin asking for the sky to stay visible but needs contrast work under every section and a loop running all visit. |
| Hand-off plus bookend | The hand-off, then at the footer the camera pulls back out of the monitor into the room at that hour, which gives the page a closing shot but needs a second scroll runway (it can come in a later pass). |

- **Forks:** whether the render loop stops at p >= 1 or runs all visit; whether every section is re-laid into a screen column; how much contrast work sits under each section; whether a second runway is built.
- **Evidence:** HTMLTexture is blank in Chrome 153 stable; RenderPipeline tone-maps the monitor mesh; CSS3D or any transform on the page wrapper re-parents the fixed sky, cinema overlay and tooltips (`hello.css:5307-5310`). Pin mtr8hc5e ("on scroll the sky will be visible across") conflicts with the hand-off, and only Agam can overrule his own pin. Both critics kept it.
- **Default if skipped:** Hand-off.

### Q05 · Whose sky

- **header:** `Whose sky`
- **question:** Whose sky and clock should the window show: your Bangalore sky for every visitor, or each visitor's own city and hour the way Living Sky works today?
- **multiSelect:** false

| Option | Description |
|---|---|
| Your Bangalore sky (Recommended) | Bangalore weather on IST for everyone, from the city-centre point and never your home's, which makes it truly your desk right now and drops the IP lookup, but a visitor in the US afternoon lands on your night. |
| Visitor's own sky | Today's Living Sky behaviour (their city's weather on their clock, found by IP), which feels personal but puts London rain outside a Bangalore window. |
| Your weather, their clock | Everyone sees their own hour of daylight with Bangalore's weather, which avoids night-heavy visits but lets the light and the weather disagree (a Bangalore midday storm drawn at their night). |
| Yours, with a toggle | Your sky by default plus a small control to switch to theirs, which offers both but adds a UI element and a second cache key. |

- **Forks:** fixed coordinates (12.97, 77.59) vs the ipapi.co then ipwho.is chain in `src/lib/weather.js:18-24`; the clock offset (`timezone=auto` today); the cache key; the SkyTip copy ("my sky" or "your sky"); how often the first frame is a night scene.
- **Evidence:** "the sky should also behave the same, just like the living sky shader" can mean keep today's IP behaviour; "a complete simulation" outside one real room reads as Bangalore. Nothing in code or photos settles it. Both critics kept it.
- **Default if skipped:** Your Bangalore sky.

### Q04 · Surreal

- **header:** `Surreal`
- **question:** The voice note says "make this feel really surreal" (it may have been "so real"): how far from your photos may the scene go?
- **multiSelect:** false

| Option | Description |
|---|---|
| Heightened realism (Recommended) | Materials and geometry true to your photos with light and air pushed (dust motes in the lamp beam, a richer golden hour, crisper clouds, slightly cleaner glass), still believable as a photo but not a pixel match. |
| Photo-true | Indistinguishable from your photos, heavy glass dust and true exposure included, and judged side by side against them, which leaves the least room for magic. |
| Dreamlike | Deliberately impossible touches such as the real moon moved into the window, a Milky Way over Bangalore, drifting glowing pollen and the blocked far-right panes opened to the tree, which is memorable but reads as a dream of the room rather than the room. |

- **Forks:** tone mapper and grade (AgX or Neutral, lut3D), bloom, haze, motes, grain, how clean the glass is, whether invented impossibilities are allowed (moon by licence, Milky Way, opening R2), and how the build loop scores itself (pixel comparison against the photos, or art direction).
- **Evidence:** the 17:41 iPhone photo compressed a real sky-to-screen ratio of 5 to 30x down to 1.7x; the glass carries a heavy dust film (13-photo 4.9, 10). Both critics kept it.
- **Default if skipped:** Heightened realism.

### Q01 · Tree

- **header:** `Tree`
- **question:** Which tree stands outside on the right (the voice note came through as "ballot tree" and "biometry's leaves"), and could you send one daylight photo of it?
- **multiSelect:** false

| Option | Description |
|---|---|
| Weeping bottlebrush (Recommended) | Callistemon viminalis, with long drooping narrow leaves and red brush flowers that fit the red-orange patch and small-leaved crown in the photo, giving the richest sway but needing thousands of thin leaf cards (the most expensive foliage). |
| Badam (Indian almond) | Terminalia catappa, the closest sound match for both phrases ("badam tree's"), with big leathery leaves on flat tiered branches and a few red leaves, so fewer and larger cards with a slow stiff sway, though the photo's crown looks smaller-leaved. |
| Bael | Aegle marmelos, with trifoliate leaves on a rounded grey-green crown, whose motion is stiffer and twitchier and which has no flowers most of the year. |
| Neem | Azadirachta indica, with fine feathery leaflets in soft clumps that match the photo's crown well, giving a fluttery shimmer in wind but no red patch (that would then be a painted wall or sign). |

- **Forks:** the foliage system (thousands of thin instanced cards, fewer large cards, or feathery compound clusters), the two-frequency sway in the TSL wind shader, flowers or not, the crown silhouette in the most visible moving thing of frame 1.
- **Evidence:** 13-photo 9: a soft grey-green, small-leaved, clumpy crown with thin dark branches, a vertical red-orange patch about 0.25 x 0.6 W, and faint drooping strands at L2 row A (low confidence, could be cobweb). Pixels do not settle the species; both critics kept it. r186 has no vegetation helper; TreeGenerator builds branches only (10-r186 2.7, VERIFIED). Phonetics (INFERRED): "badam tree's" carries the b + m + tr + z shape of "biometry's"; "bottle" is one letter swap from "ballot".
- **Default if skipped:** Weeping bottlebrush, kept deliberately generic in silhouette until a photo arrives.

---

## Round 2 · Geometry, scale, and the two remaining voice-note words

### Q11 · Right leaves

- **header:** `Right leaves`
- **question:** The two right-hand columns of glass (the handle leaf and the grey one beside it) sit together on one plane about 31 degrees off the left pair, so how should I build that part of the window?
- **multiSelect:** false

| Option | Description |
|---|---|
| Angled, handle leaf ajar (Recommended) | The section is built at an angle as photographed and the handle leaf stands slightly open, rocking in real gusts so the bead chain stirs and rain can reach the sill, which is the most alive option but invents one open leaf. |
| Angled, all shut | Exactly as photographed with every leaf closed, which is simplest and truest but lets no wind or rain into the room. |
| Both were open, build flat | The two right leaves were standing open when you shot them, so I build a flat four-leaf window, closed, which moves the right half's geometry and where the lamp light lands. |
| Both open, keep open | The two right leaves stand open as photographed, which lets wind and rain in through a wide gap and trades two panes of dusty glass for a clearer view past the outside grid. |

- **Forks:** right-half geometry (flat or angled), where the lamp hotspot lands, whether wind reaches indoors (bead chain, blind edge, the leaf itself), whether rain falls past the grille onto the sill (the Q12 answer depends on this), and what the far-right column faces.
- **Evidence:** rail fit above (VERIFIED coplanar R1 and R2). The sill, room grille and blind all run straight (13-photo 4.1). Two leaves opened to the same angle would sit in parallel planes, not on one rail line (INFERRED), so "built at an angle" is the likelier reading. Both critics kept it.
- **Default if skipped:** Angled, handle leaf ajar and rocking a degree or two in real gusts (the photo's geometry plus the cheapest believable way to show the weather indoors).

### Q18 · Real size

- **header:** `Real size`
- **question:** Could you take one to three tape measurements so the room is built at true scale, since the monitor-to-glass gap currently solves to anywhere from 7 to 38 cm?
- **multiSelect:** false

| Option | Description |
|---|---|
| Three numbers (Recommended) | One pane's clear glass width, the gap from the monitor screen to the glass, and the sill depth, which pins the lamp position, parallax and camera path for a two-minute tape job. |
| Pane width only | Just one pane's clear glass width, from which everything else scales off the photo proportions, which is quick but leaves the screen-to-glass gap inferred. |
| Use the estimates | A 9 cm pane known only to plus or minus 20 percent, which costs you nothing but may put the lamp and the glass at the wrong depth and send the camera move through the wrong space. |

- **Forks:** absolute scale drives the lamp's inverse-square falloff, shadow softness, the density of the light beam, the focus distances, the bar thickness and the camera path.
- **Evidence:** proportions are VERIFIED in pane widths (W); W = 9 cm is INFERRED from the Hot Wheels car and the handle (7.5 to 11 cm). With the monitor now a fixed 27 inch (active area about 597 x 336 mm), it sits about 59 cm from the camera; the glass at 8.8 W puts the screen-to-glass gap at about 7 cm (W = 7.5) or 38 cm (W = 11). Both critics kept it, trimmed.
- **Default if skipped:** photo estimates (pane 9 cm, frame about 80 x 75 cm, sill about 35 to 40 cm above the desk, screen about 20 cm from the glass).

### Q02 · The ones

- **header:** `The ones`
- **question:** In "let's add the ones and any detail that we may not be getting real time", what was the word that came through as "the ones"?
- **multiSelect:** false

| Option | Description |
|---|---|
| Winds (Recommended) | Real wind speed, direction and gusts moving the tree, far trees, clouds, rain slant and bead chain, which gets built from the weather data whatever you answer. |
| Sounds | Rain, birds, wind, distant traffic and thunder synthesised behind the site's sound toggle (off by default), which adds a separate audio build. |
| Birds | Crows and kites by day, parakeets at dawn, bats after dusk and moths at the lamp, scheduled by sun and weather, which your "any detail" already licenses so this only shifts emphasis. |

- **Forks:** only "Sounds" adds a subsystem (synthesised audio, behind the existing toggle). Winds and the moon phase are data and get built anyway; invented life and lights are licensed by the second half of the same sentence.
- **Evidence:** the sentences just before it are all about wind, and /wVnz/ is closest to /wIndz/ (INFERRED). Killed by the evidence critic (same build for every reading but one); kept by the transcription exception because the Sounds reading adds a whole subsystem.
- **Default if skipped:** Winds, plus invented life and lights. No sound in v1; ask a one-line yes or no later if ambient sound is wanted.

### Q03 · 37 degrees

- **header:** `37 degrees`
- **question:** The lamp "casts soft warm yellow light at, like, 37 degrees": what does the 37 describe?
- **multiSelect:** false

| Option | Description |
|---|---|
| Tilt of the shade (Recommended) | The shade's axis is tipped about 37 degrees off your line of sight (the photos measure 30 to 40), so I fit a wide soft cone of about 40 degrees half-angle to the glow your 18:40 photos show on the stile. |
| A tight 37 degree beam | A 37 degree full cone that throws one small bright pool on a single stile and leaves most of the frame dark, which is theatrical but much tighter than the glow in your photos. |
| Colour temperature | A misheard 2700 K or 3700 K bulb, which changes only the light's colour (the photos measure about 3000 K, a slightly yellow #ffbe6c). |

- **Forks:** `SpotLight.angle` is the half-angle (`SpotLight.js:35,80`): 0.70 rad fitted vs 0.323 rad for a tight 37 deg full cone. That moves the hotspot size and how much of the frame is lit; a colour answer changes only the Kelvin.
- **Evidence:** 13-photo 5: the 18:40 glow runs 3 to 4 W up L2's stile and onto R1's stile and handle, far larger than a 37 deg full cone from 6 to 12 cm away would light (INFERRED). Killed by the evidence critic (the build fits to the photographed hotspot whatever the number); kept by the transcription exception because the tight-beam reading changes the modelled cone.
- **Default if skipped:** Tilt of the shade, cone fitted to the 18:40 hotspot, 3000 K with duv +0.003.

---

## Killed, with the answer the build uses

| ID | Killed by | Reason | Answer (what gets built) |
|---|---|---|---|
| Q07 First screen | Evidence | The brief puts the scene "where we have the living sky shader today", which is the fixed `.hello-sky` slot under the greeting, links and timeline (z 0 under z 1); "only the window and the sky" describes the camera framing at p=0, not removing page text; the intro already plays unchanged over the p=0 frame. The vignette option has a known defect (dark wood fading into white reads as a smudge). | Full-bleed window at p=0, feathering into `--bg` only at the bottom. Greeting, Resume, LinkedIn and the five timeline rows sit over it as today. The p=0 framing keeps calm areas behind the text boxes (at 1440 x 900: greeting x 56 to 296, y 256 to 378; timeline x 720 to 1440, y 240 to 484), and the contrast contract checks them. |
| Q08 Runway length | Both | One constant R in `p = clamp((scrollY - runwayTop)/R)`, cheap to retune by feel; "No hold" is ruled out by its own consequence (cards cover the monitor as it arrives). | R = 1.0 viewport (100svh, about 900 px at 1440 x 900), retuned in the first build review. |
| Q09 Theme vs scene | Materiality | A contrast-engineering choice the 54-state colour gate should decide, not taste to pre-judge; "theme follows scene" would remove an approved control nobody asked to remove. | The scene shows the true hour in both themes; the toggle stays; the theme sets the hand-off colour (#ffffff or #0e0e11) and the page after it. Text over the scene: flip ink to the scene brightness first, then a local scrim; a dark-theme exposure offset only if the gate still fails. |
| Q10 Lamp schedule | Evidence | At 17:41 (sun +6.7 deg) the lamp was on in an otherwise dark room, and the proposed "sun below about 6 deg" rule would have switched it off in the reference frame itself; an always-on lamp exposed physically vanishes at noon anyway (R1 stile 0.09 lit vs 0.07 unlit even at 17:41); the 18:39 ceiling light reflects the room in the upper panes and hides the dusk sky (#393731), against "only the window and the sky". | Lamp always on, exposed physically: it reads from golden hour on and dominates at night. Ceiling light off at every hour, so night is lamp plus monitor glow, as at 17:41. One warm light rig, no switching logic. |
| Q12 Rain on glass | Both | The brief licenses maximum detail and rain comes from data; the only part Agam uniquely decides (is a leaf open) is Q11. | Drops and running streaks on the glass through the dust film; rain as a scene layer between the trees and the glass, slanted by `wind_direction_10m`; the window stays wet for about 60 min after rain from hourly precipitation with `past_hours=2` (drips off the grille and outside grid, darker wet leaves, a damp sill). Rain past the grille onto the sill only if Q11 leaves a leaf open. |
| Q13 Night sky and moon | Both | Geometry VERIFIED: at 12.9 N, for altitudes 5 to 39 deg, the sun stays at least 67.1 deg and the moon at least 61.4 deg from north; the window spans about -12 to +39 deg (59 deg at the worst compass error), so no disc can ever appear. What remains is register, now inside Q04. | True city night: a skyglow term (orange-grey, strongest under low cloud), few stars, Polaris about 12.9 deg up due north, and moonlight from the real phase and position lighting cloud and tree, with no disc. The moon by licence only if Q04 comes back Dreamlike. |
| Q14 Cloud floor | Both | The reference photo disproves data-true at the reference moment (17:00 code 2 with `cloud_cover_low` 0 percent, 18:00 code 0 at 11 percent, yet large sunlit cumulus in the 17:41 photo). | Afternoon cumulus floor on top of the data: towers build after about 14:00 IST and fade after dusk, scaled by CAPE, never below scattered when dry, suppressed when raining. Window scene only; the other Living Sky mounts are unchanged. |
| Q15 Time control | Both | The brief asks for real time; scroll-driven time contradicts the camera as a pure function of scroll and the direction doc's rule that scroll moves only the camera. | Real clock only. `?tod=` and `?u_*=` (`Hello.jsx:197-223`) stay for QA and demos. A scrub control can be pitched later as an add-on. |
| Q16 Phones | Both | Pre-rendering cannot follow the weather or the hour (breaks "a complete simulation"); "no room on phones" contradicts the direction doc (the phone is the screening surface); the portrait-monitor path needs hero modelling of a monitor that stays off, plus a second camera path. | Same scene, lighter tier: DPR capped at 1.5, baked AO, volumetrics at 0.25 scale, SMAA, a third to a quarter of the leaves, one camera path, weather and time live. If the tier misses 8 ms, fall back to the plain Living Sky band. Reduced motion gets the p=0 still. |
| Q17 HDR output | Both | Not a v1 decision: "high-def" reads as resolution and detail; HDR only works on the WebGPU backend (`WebGPUBackend.js:356-364`) and doubles the grade and colour-gate work; nothing depends on it. | SDR everywhere in v1 with one filmic grade (AgX, compared with Neutral). HDR highlights parked as a later WebGPU-only enhancement. When scoring renders, compare against the SDR decode of the 17:41 HEIC, not its HDR gain-map decode, or the render will always look flat. |
| Q19 Brown outside grid | Evidence | The photos settle it: it is behind the glass and close (it shifts between viewpoints, and the room lamp lights it tan in 5481 to 5484); it follows the pane columns (one vertical per column, horizontals every 0.72 W), which scaffolding at 1 to 2 m centres would not; the dusk sky between the bars is clean slate with no mesh veil. | An exterior box grille of brown flat bars with diagonal braces, modelled in 3D about 20 to 50 cm beyond the glass: parallax as the camera moves, lamp light on it at night, painted like the frame but weathered. |
| Q20 Far-right column | Both | The options render the same (a dark flat surface behind heavy dust stipple, in a column the lamp dome partly covers and that is out of frame at p=0); frosted glass is ruled out (5484 shows clear dusty glass with the lamp-lit grid behind it); "open it up" is licence, now inside Q04. | A flat dark plane just beyond the outside grid, lit by skylight and the lamp, with the dust stipple and the sliver of real view along its left edge. Opened to the tree and sky only if Q04 comes back Dreamlike; revisited if Q11's answer changes what that column faces. |
| Q21 Asset sourcing | Both | A blanket budget authorises nothing (every purchase needs its own explicit go); the default needs no answer; a purchase can only be asked with a named model and price after Q01 and after the code-built tree is judged; scans bake their light (GaussianSplat has no light handling). | Code and CC0 only for v1: window, grilles, lamp and monitor from the photo proportions; the tree from TreeGenerator branches plus instanced leaf cards textured to the Q01 species. If the tree fails the side-by-side, come back with one specific model, its price and licence, for an explicit go. |

Partial answers absorbed from surviving questions (no longer asked):

- **Monitor model (from Q18):** BenQ MA270UP, 27 inch 16:9, UI at 2560 x 1440 (VERIFIED, `system_profiler`). The portrait second monitor is not connected, which matches "off" in both photo sessions.
- **Compass (from Q18):** not needed. The window bearing stays 0 deg (north); within +/-20 deg neither the sun nor the moon enters the view and the golden-hour light stays on the left.
- **Lamp aim and colour (from Q03):** aim VERIFIED from the photos (shade axis about 30 to 40 deg off the chair's line; 18:40 hotspot on L2's hinge stile); colour 3000 K, duv +0.003, #ffbe6c.

---

## Just build (decided, not asked)

1. **three.js version and renderer.** Pin `"three": "^0.186.1"` and use `WebGPURenderer` from `three/webgpu` with its automatic WebGL2 fallback, in a lazy chunk behind a poster of the first frame; `await renderer.init()` and `renderer.compileAsync(scene, camera)` before the reveal. Why: the node stack (TRAANode, VolumeNodeMaterial, MRT selective bloom, DepthOfFieldNode, SSAONode, LightProbeGrid) only runs under WebGPURenderer; 0.186.1 fixes TRAA velocity; r187 changes PMREM.
2. **Living Sky reuse.** Keep `living-sky.frag` unchanged as the source of truth; render it in its own offscreen WebGL canvas at about 1024 x 512 (physical pixels) and upload it each frame as a CanvasTexture onto a view plane beyond the glass, drawing and uploading in the same rAF task (no `preserveDrawingBuffer`, `ShaderCanvas.jsx:80`). No TSL port in v1. Why: `WebGPUTextureUtils.js:985-1016` uploads canvases via `copyExternalImageToTexture` (inside a try/catch that swallows failures, so add a dev readback check); a port forks 743 lines; cost under 0.5 ms at about 0.5 MP.
3. **Living Sky source changes.** Edit `public/shader-viewer/presets/living-sky.frag` first, run `build-presets.mjs`, re-vendor into `washes.js`. Add `u_viewAz` and `u_fovH`, `u_windDir`, `u_flash` and `u_flashX`, `u_skyglow` plus a colour, and a switch that turns off in-plate rain and fog. Every default keeps today's pages pixel-identical.
4. **Window bearing.** 0 deg (north) as one constant, `u_viewAz`. No compass needed.
5. **Weather fields and one shared wind.** Extend `current=` in `src/lib/weather.js:231` with `wind_direction_10m, wind_gusts_10m, wind_speed_120m, cloud_cover_low, cloud_cover_mid, cloud_cover_high, precipitation, visibility, shortwave_radiation, direct_radiation, diffuse_radiation`, plus hourly `precipitation` with `past_hours=2` (now unconditional, from the Q12 answer). One JS wind state drives leaves, far trees, clouds and rain slant, using the sky's gust formula (`washes.js:801`) on the same `u_time`; `u_gust` comes from the real gust-to-mean ratio.
6. **Weather cache and offline fallback.** Cache failed fetches for 2 minutes, not 15 (`weather.js:268-270`); the offline fallback becomes a fair Bangalore afternoon with scattered cumulus instead of CODE[3] Overcast (as the comment at `weather.js:13-14` already intends).
7. **Location privacy.** Never ship or log the photos' GPS; any fixed location is the city centre 12.97, 77.59 (`weather.js:24`).
8. **Open-Meteo attribution.** A CC BY 4.0 "Weather: Open-Meteo" credit in the SkyTip tooltip and the colophon.
9. **Lamp colour.** 3000 K with duv +0.003: linear sRGB (1.00, 0.52, 0.15), #ffbe6c, via `ColorUtils.setKelvin` plus the measured tint.
10. **Lamp light rig and aim.** SpotLight (IESSpotLight later if a dome profile is authored), 2048 shadow map, `PCFShadowMap` with `shadow.radius`, a `spotLight.map` gobo for the shade rim's hard cut-off; aimed at the 18:40 hotspot (L2's hinge stile, low in row C, just left of a grille bar); angle and penumbra fitted to it (INFERRED half-angle about 40 deg, 0.70 rad) unless Q03 says tight beam. Beam and dust motes via `VolumeNodeMaterial` in their own pass at 0.25 to 0.5 resolution. The lamp is always on; the ceiling light is always off (Q10 answer).
11. **Other lights and bounce light.** Sun: DirectionalLight driven by `sunUniforms()` (`weather.js:314`) with a tight shadow camera. Window fill: RectAreaLight tinted from a downsampled average of the sky texture. Monitor glow: emissive plus a RectAreaLight. Bounce: LightProbeGrid re-baked one slice per frame as the hour moves. Reflections: `scene.environment` from PMREM of room plus sky, refreshed on time change.
12. **Camera path and scroll mechanics.** A sticky runway wrapper around the hero, `p = clamp((scrollY - runwayTop)/R)` with R = 1 viewport. p=0 is close on the window (left pair, mullion, handle leaf, lamp glow on the stile, lamp head just out of frame); the camera pulls back through the exact 17:41 framing near mid-runway (vertical FOV 56.8 deg, pitch +5.7, roll -0.7, yaw 8 deg right, 79 cm from the glass) and dollies into the screen. The camera is a pure function of p, read from `window.scrollY` in one rAF, with no extra easing on top of Lenis and no idle drift.
13. **What the monitor shows during the approach.** A pre-captured poster of the page's first screen per theme and breakpoint, captured at a 2560 x 1440 CSS viewport to match the BenQ MA270UP's UI scale, softened by depth of field; the menu-bar clock shows real IST. HTMLTexture only behind a feature check, off by default.
14. **Render loop gating and budget.** The loop runs only while the runway element is on screen (observe the runway, never the fixed canvas); it stops at p >= 1 via `setAnimationLoop(null)`, in hidden tabs, in Agentation annotate mode and under `.ap__cinema`. Ambient motion at 30 fps at rest, display rate while scrolling. Target at most 6 ms GPU per frame at 1440 x 900, DPR 2 on the M3 Pro, 8 ms on a mid-tier phone at DPR 1.5. The scene takes over the `.hello-sky` slot so the page stays at 2 GL contexts on the WebGPU path.
15. **Reduced motion and the low tier.** Reduced motion: no runway, the p=0 frame drawn once as a still that doubles as the OG image, then a plain cut to the page. No WebGL, a lost context or saveData: the poster stays and nothing else loads.
16. **Anti-aliasing and leaf motion vectors.** TRAA, or TAAU with the scene pass at 0.67 to 0.75 scale on DPR 2; SMAA on the low tier. Leaf wind lives in `positionNode`, and `positionPrevious` gets the previous frame's wind offset.
17. **Tone mapping and grade.** AgX, compared by eye with Neutral against the SDR decodes of the photos; selective bloom from MRT emissive, light film grain, a lut3D grade. Match the photos' rendered ratios, not physical ones (17:41: sky 1.7x monitor white, gold cloud 2.8 to 3.8x; dusk: lamp hotspot 1.5x monitor white, lamp-lit wood 4x the dusk sky).
18. **Contrast contract.** Every text box over the scene clears 4.5:1 (text) and 3:1 (non-text) against the worst scene brightness beneath it, tested across at least 54 rendered states (9 hours x clear, overcast, rain x 2 themes); fix in the order exposure, depth of field, local scrim; ratios go into code comments.
19. **Lightning and storms.** Strikes decided in JS and passed in as `u_flash`, so the room, frame and grille flash with them; only on WMO codes 95, 96, 99. Thunder only if Q02 comes back Sounds.
20. **Modelled as photographed.** Window casing profile per 13-photo 4.3; glossy dark-brown enamel (linear albedo about 0.085, 0.058, 0.040; roughness 0.2 to 0.3; vertical brush-streak normal map; dust and chips). Room-side grille: square black iron bars about 7 cm in front of the glass at a 0.93 W pitch with two tie bars. Outside: the brown box grille 20 to 50 cm beyond the glass (Q19 answer). Brass D-handle, torn keyhole slot on L2, clear glass whose dust shows as speckle only against dark backgrounds. Striped Roman blind with the two-strand ivory and brown bead chain, the Hot Wheels woodie and the souvenir tile on the sill, the cream wall.
21. **Main monitor.** BenQ MA270UP, 27 inch 16:9 (active area about 597 x 336 mm, INFERRED from the size class), glossy screen, thin top and side bezels, thicker chin, on a black pole arm.
22. **Portrait second monitor.** Off (black), as in both sessions.
23. **Outside, beyond the near tree.** Small-leaved yellow-green clumpy canopy billboards on the horizon with depth fog from `visibility` and `u_fog`; keep the sunlit cream building face and the red-orange patch in the handle leaf's panes.
24. **Agentation hotspots.** Scene hotspots on the existing LayerMap (window, sky, tree, lamp, monitor, sill, car), projected from bounding boxes each frame, shown only in annotate mode with `data-scene-p` and the time-of-day bucket; the loop freezes in annotate mode.
25. **Theme toggle transition.** Redraw the scene synchronously inside the View Transition callback, so the canvas does not pop after the 560 ms circular reveal (`App.jsx:10447-10470`).
26. **Intro.** `useStage.js` unchanged, playing over the p=0 frame; the scene fades in at "settle", as the sky does now.
27. **DJ console in the same bump.** `DjConsole.jsx:672` PCFSoftShadowMap becomes PCFShadowMap plus `shadow.radius`; lines 1379, 1385 and 1466 Clock becomes `THREE.Timer`; re-screenshot /dj in all four styles and the scan embed.

---

## Open photo requests

Each one settles or calibrates something specific. Phone resting on the desk or sill for anything that moves.

1. **The tree on the right, in daylight:** one wide shot and one close-up of a leaf cluster (and any flowers), taken through an open leaf or from the street. Settles Q01.
2. **A 10 second locked-off clip of that tree moving in a breeze**, ideally on a windy afternoon, phone resting still. Calibrates the sway amplitude, the two frequencies and the gust envelope in the wind shader.
3. **One photo from the right end of the desk looking along the window face**, showing the handle leaf and the grey far-right column edge-on. Settles Q11: built at an angle, or standing open.
4. **Leaning out of an open leaf (or from outside) toward the brown grid and whatever sits behind the grey far-right column.** Confirms the box grille's depth and bar size, and what blocks R2.
5. **A tape measure laid across one pane's clear glass, and one from the monitor screen to the glass**, photographed with the numbers readable. Answers Q18 without typing.
6. **A midday frame from the chair at the 17:41 framing** (same 1x lens, lamp on as usual). Calibrates the daylit exposure and how visible the always-on lamp is at noon.
7. **A night frame at the same framing with only the lamp and the monitor on** (ceiling light off). Calibrates the night state the build defaults to.
8. **If it rains: a 10 second clip of rain on the dusty glass.** Calibrates drop size, streak speed and how the dust film changes when wet.
