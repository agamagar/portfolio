# 60 · Reality modes: Cyberpunk, Snow, Alien planet, Pixel art

Written 2026-10-06 (13:50 IST) as the record of the "more modes" pass. Agam asked twice: on
2026-10-05 ("just like dreamlike can we create more mode like, maybe one is cyber punk") and on
2026-10-06 ("create mroe distingct reality modes"). Branch `window-look-pass`, HEAD `79ba9dd`.
Nothing this pass built is committed. This file is the only commit it makes.

**Bottom line.** One of the four looks is in code: **Cyberpunk**. It sits uncommitted in the
working tree, appears in the header menu, and `node tools/window-light/lookkeys.mjs cyberpunk`
prints "every path is live". **Snow**, **Alien planet** and **Pixel art** each have judged
directions, synthesis probes and a full build spec in the archive, but none has code in the tree.
At 13:48 IST, `LOOK_NAMES` is `dreamlike, heightened, photo, cyberpunk`, and a grep of
`src/scene/window/` finds no snow, alien or pixel look. The workflow marked all four as kept with
"not committed", and returned **no critic scores, no critic issues and no lineup verdict** for
any of them. Every score below comes from the direction judging that chose each base, not from a
critic of a built look.

| Look | id | Menu label | Hint | Icon (iconoir-react 7.12.1) | In the tree | Committed | Build critic score | Spec |
|---|---|---|---|---|---|---|---|---|
| Cyberpunk | `cyberpunk` | Cyberpunk | Neon past the bamboo, a pink lamp in the dark | `City` | yes, uncommitted | no | none returned | `/Users/agamagarwal/window-light-runs-archive/cyberpunk/SPEC.md` |
| Snow | `snow` | Snow | Snow past the bamboo, frost on the glass | `SnowFlake` | no | no | none returned | `/Users/agamagarwal/window-light-runs-archive/modes/SPEC-snow.md` |
| Alien planet | `alien` | Alien planet | A ringed giant over red bamboo, two suns | `PlanetSat` | no | no | none returned | `/Users/agamagarwal/window-light-runs-archive/modes/SPEC-alien.md` |
| Pixel art | `pixel` | Pixel art | The window as a 16-bit game | `Gamepad` | no | no | none returned | `/Users/agamagarwal/window-light-runs-archive/modes/SPEC-pixel.md` |

All four specs share the same rules. `DEFAULT_LOOK` stays `dreamlike`. Every new key defaults
off, so the other looks stay pixel-identical. Every path in a look's patch must be live, because
`setLook()` rebuilds nothing; `lookkeys.mjs` enforces this, strictly for the new looks. No edit
to `engine.js` or any other forbidden file. No rebuild-on-setLook. The hand-off still lands on
`#0e0e11` / `#ffffff`. No text, glyphs, logos or HUD. No new npm dependency (three ^0.186.1). No
commit, push or branch switch unless a task says so. The three unbuilt looks all append to the
same lists (`LOOK_NAMES`, `lookStore.js` `LOOKS`, `LOOK_ICON`, the `lookkeys.mjs` STRICT set, the
brief). Append; never reorder.

## 1 · Cyberpunk

**What it is.** The Neon Noir direction, picked over Graphic Split and Bangalore 2077. Dark
towers rise past the bamboo, carrying neon lightboxes and tubes (no text, no logos). A teal sky
hangs over a violet city haze. The garden's greens turn teal. The room is cool and dark, and the
lamp throws pink onto the stile. At dusk there is pink cumulus on teal; by day, a cold teal smog.
It is look 4 in `30-locked-brief.md`; that edit is uncommitted, and the spec says to show Agam
the diff.

**Menu.** `lookStore.js`: `{ id: "cyberpunk", label: "Cyberpunk", hint: "Neon past the bamboo, a
pink lamp in the dark" }`. `SceneControls.jsx`: `City` imported, `LOOK_ICON.cyberpunk = City`.

**New features and their keys.** Each one defaults off in the base params. All are read per
frame.

| Feature | Key (base default) | Cyberpunk value | Files |
|---|---|---|---|
| F1 hue band: green foliage to teal (a Rodrigues turn about the grey axis) | `grade.hueBand` (amount 0) | amount 1, centre 128, half 22, feather 40, angle 50, satLo 0.12, satHi 0.3 | `light/grade.js`, `post.js`, `light/params.light.js` |
| F2 split tone: teal into the shadows | `grade.split` (shadowAmount 0, keepSat null) | shadow [0.1, 1.0, 1.25] at 0.7, keepSat [0.5, 0.8] | same |
| F3 horizon and building colours as uniforms; skyline blocks, lit floors, roofline trims, murk | `outside.horizon.*` (blockWide 0, trim level 0, murk null), `outside.building.paint` (amount 0) | blocks 0.85, blockTop [6, 14], blockColor #0e121c, trims #ff3c9c / #00d8ff; building lit pink/teal, paint #8e9aa4 | `outside/horizon.js`, `outside/farTrees.js`, `outside/common.js`, `params.outside.js` |
| F4 lamp spill held through the day | `lights.lamp.spill.dayGain` (1) | 12, with the lobe narrowed to 48 deg, penumbra 0.9 | `lights.js` |
| F5 cyan night key from a fixed direction, no disc | `lights.moon.keyDir` (null) | [13, 19] at intensity 0.15, #3fe6ff | `lights.js` |
| F6 neon signs on skyline towers: frame, blade, strip and screen lightboxes; one blade flickers (never under reduced motion) | `outside.neon` (enabled false) | 10 towers, 7 signs, palette #ff3c9c / #00d8f0 / #ffb03c / #8a4dff, level 0.03, dayLevel 3, bloom 10, rim 3 | new `outside/neon.js`, `outside.js` |
| F7 neon caught by the rain and the wet glass | `outside.rain.neon` (share 0), `room.window.glass.neon` (0) | rain share 0.1, gain 0.15; glass 0.25; dropSpread [10, 15] | `outside/rain.js`, `materials.js` (glass section) |
| F8 sign light into the air and the room (CPU only) | covered by the `outside.neon` air and level keys | air 1 | `lights.js` |
| Night room floor on the runway | `lights.bounce.runwayLift` (0) | 0.8, with lift 0.05 and cool dayTint | `light/params.light.js`, `lights.js` |

Other per-look values: `outside.looks.cyberpunk` `{ sat: 1.1, ambient: 1.05, spray: true }`;
`calm.looks.cyberpunk` `{ contrast: 0.25 }`. The spec started at 0.36, which had to pass the
text gate. Volume specks are off, motes off, AgX, exposure 1.0, vignette 0.35. The sky is
recoloured through nine altitude keys. A new check, `tools/window-light/lookkeys.mjs`, fails any
look whose patch names a build-time path.

**Committed or not, and why.** Not committed. The workflow's build step returned "not
committed" and gave no reason. Three things in the tree explain why the look cannot go in as it
stands:
1. The Cyberpunk edits share files with other sessions' uncommitted work: Dreamlike's
   `exposure.auto.duskBoost: 2` and `lights.bounce.lift: 0.015` in `looks.js`; the brass handle,
   blind and desk toys in `params.room.js`; the brass block in `materials.js`; the sceneWarm
   gate; the `hello3` files; `vite.config.js`; `NEXT.md`. A Cyberpunk-only commit therefore
   needs hunk-level staging.
2. The 2026-10-06 build round's `final/` and `guard-after/` folders are empty, so its closing
   regression and proof shots were never written.
3. The brief diff waits on Agam.

**Scores.** No build critic scored it. Direction stage: both judges picked Neon Noir (taste 7
and 7, portfolio fit 7 and 7).

**Open issues.**
- **Default-off regression, not closed.** These numbers were measured for this record. The
  `guard-mid` renders (11:45, after the last source edit at 11:03) were compared with
  `guard-before` (10:12):
  - Dreamlike 21:00 clear: identical (max 1/255).
  - Heightened 21:00 clear: mean 0.121, max 52; 0.11 % of pixels differ by more than 8.
  - Photo-true 21:00 clear: mean 0.247, max 77; 0.22 % of pixels.
  - Two `before` renders of those 21:00 shots matched at max 0 to 1, so these scattered
    differences are unexplained.
  - The 17:41 partly shots stay within their own run-to-run noise (mean 0.24 to 0.40).
  - `guard-mid/photo-ref1741.png` is a blank white failed capture, so the ref1741 composite is
    unproven.
- **Dreamlike's two uncommitted keys** (`duskBoost 2`, `bounce.lift 0.015`) are another
  session's work. The critics measured them as the whole Dreamlike brightening against the 5181
  baseline (mean 21.4/255; removing them brought it inside noise). Agam decides. They must never
  ship under this look.
- **Critic issues from `CRITIC-ISSUES.md` (rounds r to r2, 2026-10-05).** The 2026-10-06 code
  comments say these were addressed. No critic has re-judged them:
  - Signs read as UI icons: reshaped into lightboxes and plain tubes.
  - Signs float in an empty sky: they now hang on skyline towers.
  - Teal read as mint: the sign teal is now #00d8f0.
  - Rain read as confetti: rain share 0.1 and narrower drop spread. Glass neon is still 0.25,
    where the critic asked for about 0.08.
  - The hue band posterised creams: feather 40, weighted by chroma.
  - The R3 facade read ochre: repainted cool concrete.
  - The runway lost the room: `runwayLift` 0.8.
  - The cyan key made the canes read as tubes: 0.3 to 0.15.
  - Pink specks: off.
- **Critic issues no code comment names, so still open as far as this record knows:**
  - Day and dusk lack a cyberpunk identity (12:00 and 15:00 read as a teal filter on Dreamlike;
    17:41 is the switch-on).
  - The noon phone crop has no sign.
  - Noon rain collapses to grey.
  - The right 30 % of the 17:41 hero is a black void.
  - The low-tier "signs must not read as text" check.
  - The night sky hue was 306 against the 240 to 260 target.
- Frame cost of the neon pass, the live-switch proof, the hand-off at p 0.9 and 0.97, and the
  text-calm gate have not been re-proven on the current tree.
- A `lookkeys.mjs` gap: `post.volume.specks.count` is build-time but not on DENY. Cyberpunk no
  longer sets it, so it is harmless here. Ask Agam before adding it to DENY (the Alien spec
  raises it).

**Render folders.**
- `/Users/agamagarwal/window-light-runs-archive/cyberpunk/` (2026-10-05):
  - `direct-neon-noir`, `direct-graphic-split`, `direct-bangalore-2077`: the three directions.
  - `synth`: the spec probes. `SPEC.md`: the build spec.
  - `stage0`, `f12`, `f3`, `f45`, `f6` to `f6teal`, `f7` to `f7teal`: the feature stages.
  - `build`, `calm-dl`, `calm-tune`, `lift`, `glift`, `flare`, `sk`, `motion2`, `motion3`,
    `bezel`, `combo`, `tune1`, `exp`: tuning.
  - `before`, `before2`, `after-existing`, `after-existing-neutral`, `after-repeat`,
    `baseline-check`: regression.
  - `critic-r`, `critic-r1`, `critic-r2`, `critic-r3`, `CRITIC-ISSUES.md`: the critics.
  - `tools`.
- `/Users/agamagarwal/window-light-runs-archive/modes/build-cyberpunk/` (2026-10-06):
  - `guard-before`, `guard-before2`: the other looks, before.
  - `work`: iterations `it1` to `it8`, sweeps `sw1` to `sw13`, tower probes, row-B crops.
  - `work2`: `guard-mid`, the `lv` neon-level sweep, `s0`, `dbg21`.
  - `snapshot`: a src and tools copy.
  - `final`, `guard-after`: both empty.
  - Meters: `modes/tools/cp_*.py`.

## 2 · Snow

**What it is.** Storybook Winter as the base, with grafts from First Snow. Snow falls past the
bamboo and frost grows on the glass:
- By day, a snow deck covers the sky.
- In the blue hour the deck clears for the moon. In rain or storm it holds all night.
- The night room is cold, and the lamp is the one warm thing.
- Dusk is blue, and the greens turn a cold sage.
- The glass stays dry and frosts rather than running with drops.

**Menu (spec).** `{ id: "snow", label: "Snow", hint: "Snow past the bamboo, frost on the glass"
}`, icon `SnowFlake`. Not `Snow`: that is the weather glyph, and it would clash with the Outside
menu. The menu entry lands last, after F1, F2 and F3 pass. Until then only `?look=snow` reaches
it.

**New features and their keys (spec).** Build order: F4, F5, F1, F3, F2.

| Feature | Key (base default) | Spec value | Files |
|---|---|---|---|
| F4 the snow deck by day, cleared for the moon at night | `sky.uniforms.deck` (absent) | keys u_cover to u_cirrus, clearFrom -2, clearTo -8, holdWet 1 | `skyPlate.js` (`skyUniformsFrom`) |
| F5 a live moon corona (removes the phone's "eclipse" ring) | `outside.moon.corona` (0.35, now a uniform) | 0.15 | `outside/moon.js` |
| F1 falling snow: one merged quad mesh, built lazily; reduced motion slows the fall and stills the sway | `outside.snow` (enabled false; maxFlakes 2400, fall 0.35 to 0.9 m/s, density per weather) | enabled | new `outside/snow.js`, `outside.js`, `outside/rain.js` (export `driftAt`) |
| F3 rime frost from the pane edges, drifts on the bottom row of each leaf only, dry glass | `room.window.glass.rime` (amount 0, drift.height 0) | per section 3 of the spec | `materials.js` (glass section only), `room/window.js` (`aPane`) |
| F2 snow cover on every outdoor surface, set per material by `snowTake` | `outside.snowCover` (amount 0) | amount 1, color #f4f7fb, nightKeep 0.55 | `outside/common.js`, `outside.js`, `outside/bamboo.js`, `outside/farTrees.js` |

Other spec values:
- Moon: placed, nightAlways, az 4, alt 20, scale 1.4.
- Key: 0.15, #9cc4e8.
- Calm: `calm.looks.snow`.
- Outside row: `outside.looks.snow`.

**Committed or not, and why.** Not committed, and not in the tree. No snow code exists in
`src/scene/window/`. The workflow listed it as kept and returned no commit and no critic output.
The spec itself warns that the look depends on F1, F2 and F3 landing together: stage 0 alone
reads as fog by day (dE76 9.4 from Dreamlike at noon, measured).

**Scores.** No build critic. Direction stage: Storybook Winter scored taste 7 and 7, distinct 7
and 7, portfolio fit 7 and 7, feasibility 7 and 6. First Snow scored 6/6/6/5 from both judges.

**Open issues (from the spec's risks).**
- At the hero, calm `farBokeh` 2 melts everything past the glass, so frost quality carries the
  daytime snow read.
- The night wall's hue (283) sits near the violet edge of its 240 to 300 target, and AgX pushes
  blue toward violet. Measure it; never judge it by eye.
- F4's 18:15 to 18:45 deck break is a new transition. Check 18:30 for a seam.
- The moon at az 4 is lost at p 0.5, where Dreamlike's az 14.2 shows it.
- Whether `post.volume.specks.enabled` and `sky.moon` are live is unproven until a real switch.
- `materials.js` and `params.room.js` carry another session's brass and desk-toy work: edit only
  separate hunks. `aPane` changes every pane's geometry, so check the R2 frosted depth path.

**Render folders.** Under `/Users/agamagarwal/window-light-runs-archive/modes/`:
- `direct-snow-1` (First Snow) and `direct-snow-2` (Storybook Winter), each with its `mock/`.
- `synth-snow`:
  - `probes`, `tune`, `final`, `moon`, `ref`;
  - `sheet-synth.png`, `patch_live.json`, `patch_stage0_final.json`.
- `SPEC-snow.md`.
- Tools: `tools/snow2_*.py`, `tools/snow_moonring.py`, `tools/judge_snow.py`.

## 3 · Alien planet

**What it is.** Direction 1 (hard science fiction) as the base, with grafts from direction 2.
Agam's room is unchanged, moved onto a tidally locked moon of a ringed gas giant:
- The giant hangs low in the north window, lit from the scene's real sun.
- A cold companion star rakes the window after sunset and before sunrise. It is never in frame,
  so it has no disc.
- Planetshine owns the night key.
- The garden is oxblood and wine.
- The sky is violet over an ochre dust band.
- The Earth leftovers (lit city windows, white street heads, the Earth moon) are switched off by
  live keys.

**Menu (spec).** `{ id: "alien", label: "Alien planet", hint: "A ringed giant over red bamboo,
two suns" }`, icon `PlanetSat`.

**New features and their keys (spec).**

| Feature | Key (base default) | Files |
|---|---|---|
| F0 plumbing: the lists, STRICT gains "alien", the brief | none | `looks.js`, `lookStore.js`, `SceneControls.jsx`, `lookkeys.mjs`, `30-locked-brief.md` |
| F1 the giant, its rings and two small moons as far cards (premultiplied, named "Halo" so `moonCheck` sees through them; mobile placements) | `outside.planets` (enabled false) | new `outside/planets.js`, `outside.js` |
| F2 the foliage remap: a hue turn on the outdoor foliage only, so the code screen's green syntax stays green | `outside.foliage` (amount 0, `select` keeps the other looks bit-exact) | `outside/common.js`, `outside/bamboo.js`, `outside/farTrees.js`, `outside.js` |
| F3 the companion (CPU only): the existing key after sunset and before sunrise, the outdoor rim by day, a tint on the window fill | `lights.companion` (off) | `lights.js`, `outside.js`, `planets.js` `companionAt` |
| F4 planetshine: the giant drives the night key and rim | `lights.planetshine` (off) | `lights.js`, `outside.js` |
| F5 the window fill takes the graded sky (optional; ships only if M12b passes) | `lights.window.gradeMix` (0) | `lights.js`, `outside.js` |
| F6 local-tone pull beyond the glass only | `post.localTone.pullFar` (false) | `light/lens.js`, `post.js` |
| Shared reduced-motion switch | `U.motion` | `outside/common.js`, `outside.js` |

The patch was probed over `look=heightened` (patches `patch_s0` to `patch_s2`, `ov_pull9`). It
sets:
- `sky.skyglow 0.3`, `u_moonph 0`;
- `grade.sky.greyDesaturate 0.45`;
- city windows off, street level 0;
- `bounce.lift 0.025`, `localTone.lift 1.4`;
- specks by `share` 0.73, not `count`;
- the lamp aimed at "1741".

**Committed or not, and why.** Not committed, and not in the tree. No planets, foliage or
companion code exists. The workflow listed it as kept and returned no commit and no critic
output.

**Scores.** No build critic. Direction stage: direction 1 scored 27 and 27 (7.5 + 6.5 + 7 + 6;
7 + 7 + 7 + 6) against direction 2's 23 and 25, a total of 54 against 48.

**Open issues (from the spec's risks).**
- The giant exists only in 2D mocks, with mask artefacts. Build flat placement first.
- At night the giant shows mostly its dark side. A bright "dream phase" would be non-physical
  and needs Agam's say-so.
- The red foliage can read as autumn maple or sakura at noon (52/14/345). Next tries: angle -110
  or value 0.3.
- 17:41 reads murky (mean L* 33.8 against Dreamlike's 36.9). The first lever is
  `grade.sky.hazeBand` 0.7 to 0.5.
- The noon phone is 79 % violet. Lower `split.shadowAmount` 0.4 to 0.3 if Agam says it is not
  his room.
- The cream building and the compound wall remain as Earth leftovers. Their albedo is
  build-time.
- F2 is compiled into every look (about 25 ALU per foliage fragment). If the perf check (M18)
  fails, the fallbacks need Agam.
- Key arbitration turns the shadows over about 20 minutes at 19:30 to 19:53. Dawn is thin
  (about 30 minutes of companion key).
- Text calm near the giant is untested: the 12:00 mock's p95 is L* 96.
- Tooling findings to report, not fix: `engine.project` at p 0 may map x with a stale camera
  aspect, and the `specks.count` DENY gap noted under Cyberpunk.

**Render folders.** Under `/Users/agamagarwal/window-light-runs-archive/modes/`:
- `direct-alien-1`: `v1` to `v6`, `final`, `final2`, `final3`, `check`, `mock`, `tools`.
- `direct-alien-2`: `probes`, `mock`, `alien-look.js.txt`.
- `synth-alien`: 39 probes, `attr`, `fin`, `combo`, `ab`, `sheet.png`, the patch files.
- `judge-alien`: `warm`, plus `a1-1200p5` against `dl-1200p5` (direction 1 against Dreamlike,
  12:00, p 0.5).
- `SPEC-alien.md`.
- Tools: `tools/alien2_*.py`, `tools/alien_synth_meter.py`, `tools/planetmock.py`,
  `tools/remap.py`, `tools/judge_alien.py`.

## 4 · Pixel art

**What it is.** Direction 1 (a SNES screen) as the base, with grafts from direction 2. It draws
the window as a screen from a SNES-era adventure game, with the same room, bamboo and hour:
- One post stage after the display grade and before the page-on-screen composite, so the work
  is never pixelated.
- Art pixels of 4 CSS px (3 on a phone).
- Each hour has its own measured 32 to 48 colour palette, swapped like SNES CGRAM, with an
  ordered-dither dissolve over 30 minutes.
- A gated 4 x 4 Bayer dither, depth rims and sel-out outlines, and sparkle cells for motes and
  lit drops.
- The bamboo steps at 8 fps.
- The stage is off by p 0.72.

**Menu (spec).** `{ id: "pixel", label: "Pixel art", hint: "The window as a 16-bit game" }`, icon
`Gamepad`.

**New features and their keys (spec).**

| Feature | Key (base default) | Files |
|---|---|---|
| F1 the pixel stage: three RTTs (source, cells, quant), OKLab nearest-palette match, Bayer, outlines, sparkle; `?view=pixel` debug | `post.pixel` (enabled false; off returns `ldr` bit-exact) | new `light/pixel.js`, `post.js`, `light/params.light.js` |
| F2 seven palettes: morning 42, noon 42, golden 48, evening 42, midnight 32, wetDay 40, wetNight 40; generated, never hand-edited; shadow floor L 0.24 | data | new `light/pixelPalettes.js`, `tools/window-light/pixel/palette.py`; `lights.js` gains `bus.wet`, `bus.storm` |
| F3 grid anchor: the grid locks to the glass plane while the camera dollies | `post.pixel.anchor` (null = screen-fixed grid) | inside F1 |
| F4 plants-only stepped time (rain and motes stay continuous; reduced motion holds still) | `outside.wind.stepFps` (0) | `outside.js`, `outside/common.js` (`U.Ts`, `U.Tsp`), `outside/farTrees.js` |
| F5 rain streak width | `outside.rain.widthScale` (1) | `outside/rain.js` |
| F6 plumbing: STRICT gains "pixel"; ALLOW gains `outside.rain.widthScale`; the pixel tools move into the repo | none | `lookkeys.mjs`, `tools/window-light/pixel/` |

The patch: exposure 1.25, AgX, bloom 0.35, localTone lift 1.5, no DOF, no glare, no grain.

**Committed or not, and why.** Not committed, and not in the tree. `light/pixel.js` and
`light/pixelPalettes.js` do not exist. The workflow listed it as kept and returned no commit and
no critic output.

**Scores.** No build critic. Direction stage: direction 1 scored 27 and 27 (7 + 8 + 6 + 6)
against direction 2's 22 and 24, a total of 54 against 46. Judge 1 called 12:00 rain "the
strongest single image across both directions".

**Open issues (from the spec's risks).**
- **Runway crawl.** The anchor fixes only the glass plane. The fallback, a camera snap, is a
  `camera.js` change; ask first.
- **Outline shimmer under TRAA jitter.** Fallback: `edges.depth: false`.
- **Calm field.** It wraps the output after the stage, so blocks inside the text boxes tint off
  palette at p under 0.3.
- **Unprobed hours.** Dawn, 15:30, 18:39, storm and overcast have never been probed. The fixes
  are palette data.
- **Night hour.** It lives only in the palette swap: the 21:00 and 00:00 frames are identical.
- **Dither.** Refit `dither.spread` (0.04) in the scene; the mock ran on 8-bit captures.
- **The p 0.5 night room.** The wall measured L* 15.5 against Dreamlike's 22.1. It needs Agam's
  eye even after it passes M6.

**Render folders.** Under `/Users/agamagarwal/window-light-runs-archive/modes/`:
- `direct-pixel-1`: `probe`, `pal`, `mock`, `pixelPalettes.proposed.js`,
  `looks.pixel.proposed.js`.
- `direct-pixel-2`: `probes`, `buf`, `mock`.
- `judge-pixel`: region crops, `hours-cmp.png`, `opus-j`.
- `SPEC-pixel.md`.
- Tools: `tools/pixel_*.py`, `tools/pixel2/`, `tools/judge_pixel.py`.

## 5 · Lineup

The lineup critic returned nothing (null), so no judge has set the looks side by side for
distinctness. Only Cyberpunk can be rendered today next to Dreamlike, Heightened and Photo-true.
A lineup of all seven needs Snow, Alien planet and Pixel art in code first. It should render the
same shot set for every look (hero p 0 at 09:00, 12:00, 17:41 and 21:00; p 0.5 at 21:00; the
phone at 12:00 and 21:00; 21:00 rain), so each look is judged on the same frames.

## 6 · Next steps

1. **Agam:**
   - Decide on Dreamlike's `duskBoost 2` and `bounce.lift 0.015`.
   - Review the `30-locked-brief.md` diff.
   - Say whether the `specks.count` DENY gap gets fixed.
2. **Cyberpunk:**
   - Re-render the guard set (with a working ref1741).
   - Explain or remove the Heightened and Photo-true 21:00 differences.
   - Re-run the critic on the open day, dusk and phone issues.
   - Commit the Cyberpunk hunks alone, kept apart from the other sessions' work in the same
     files.
3. **Build the three specs**, in their stated build orders, one look per pass, appending to the
   shared lists.
4. **Run the lineup critic** once at least two new looks render.
