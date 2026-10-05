// Engine params for the window scene: renderer, post, camera, lights, time, sky,
// screen, debug, plus the three absolute inputs every dimension derives from.
//
// Units are in the comments. "W" is the clear glass width of one pane; every
// window dimension is a multiple of it (tools/window-light/spec/13-photo-inventory.md
// section 4.2). World frame (30-locked-brief.md): metres, x right, y up, +z from
// the window into the room, origin on the glass plane of the LEFT French pair at
// the top surface of the sill, centred on the pair's meeting stiles.
//
// This file is plain data. params.js deep-clones it, so nothing here is ever
// mutated at runtime.

import { LIGHTS_PARAMS, POST_PARAMS, EXPOSURE_PARAMS, GRADE_PARAMS } from "./light/params.light.js";

export const CORE_PARAMS = {
  // THE ONLY ABSOLUTE INPUTS (metres). Photo estimates until
  // tools/window-light/spec/31-measurements.md lands; then these three change and
  // nothing else does.
  dims: {
    W: 0.09, // m, clear glass width of one pane (13-photo 0: 9 cm, range 7.5 to 11)
    gap: 0.2, // m, main monitor screen to the glass of the left pair (13-photo 0: about 20 cm)
    sillDepth: 0.1, // m, how far the sill ledge projects in front of the glass (13-photo 4.6: at least 10 cm)
  },

  // THE QUALITY TIER (quality.js): high | mid | low, picked once at start from the
  // backend, the GPU and the viewport (capture mode: high unless ?quality= names
  // one); ?quality= or ?set=quality: pins it. Every lane reads params.quality for
  // its own cost; qualityTiers is the engine's own share, applied as a params
  // layer (under ?set= and setParams): the drawing buffer's DPR cap and the plate.
  quality: "high",
  qualityTiers: {
    // DPR 2 buffer; the scene pass renders below it and TAAU reconstructs the full
    // size. Loop 2: resting supersampling (taau.js) now makes a still frame converge
    // to 2 px per CSS px whatever the pass density, so the pass drops from 1.15 to
    // 1.0 px per CSS px (0.5 of the DPR 2 buffer): the ref1741 capture scores the
    // same (composite 76.1, round-trip detail 1.08 against 1.06) and the p = 0 hero's
    // GPU tail falls about 1.1 ms (serial 12.8 to 12.9 against 14.5 to 14.8 ms,
    // paired runs). The air at 0.3 of CSS px, the AO at 0.35 of the buffer (round 2).
    // These override POST_PARAMS.tiers.high for this tier only; fold them into
    // params.light.js when the light lane next tunes the tiers.
    high: { renderer: { dprMax: 2, dprMaxMobile: 1.5 }, post: { tiers: { high: { density: 1.0, volumeScale: 0.3 } }, ao: { resolutionScale: 0.35 } } },
    // DPR 1. Round 2 (mid 9.0 ms against 6): no SSAO and the air at a quarter of
    // CSS px (was 8 samples, 0.35); the geometry cut (bamboo leaves and far-tree
    // cards) is the outside lane's. Loop 2: the pass at 0.85 of the buffer through
    // the resting TAAU instead of TRAA at full size (ref1741 at DPR 1: composite
    // 75.5 against 75.2, round-trip detail 1.48 both)
    mid: { renderer: { dprMax: 1, dprMaxMobile: 1 }, post: { tiers: { mid: { density: 0.85, aoSamples: 0, volumeScale: 0.25 } } } },
    // the phone tier: DPR 1.5 on phones (20-question Q16), 1 on a desktop; a
    // smaller sky plate, redrawn every third frame
    low: { renderer: { dprMax: 1, dprMaxMobile: 1.5 }, sky: { plate: { width: 768, height: 480 }, updateEvery: 3 } },
  },


  // Resting supersampling (taau.js, the core lane): on the scaled path (the high
  // tier at DPR 2), a pixel at rest accumulates every jittered sample by its
  // distance to the pixel's centre in OUTPUT px, so a still hero converges to 2 px
  // per CSS px instead of the pass's 1.15; moving pixels are three's TAAU as shipped.
  supersample: {
    enabled: true,
    sigma: 0.45, // output px, the resting reconstruction's Gaussian
    maxWeight: 16, // live: accumulated weight cap (about 40 frames of memory, as responsive as three's 0.025 blend)
    maxWeightCapture: 4096, // capture: a true mean of every frame
    seed: 2, // weight the history carries when a pixel comes to rest (sharpens over about 0.1 s, no pop)
    still: 0.02, // output px of motion under which a pixel is at rest
    clip: true, // live: clip the resting history to the neighbourhood's min / max (a flash lands at once)
    clipCapture: false, // capture: the scene is frozen; the box would clip real sub-pixel detail
    // output-only unsharp amount (never fed back into the history), 0 = none. It is
    // clamped to each pixel's neighbourhood range, so it cannot ring and saturates
    // near 0.5 (round-trip detail at 3200 px: 0.90 at 0, 0.99 at 0.25, 1.14 at 0.5,
    // 1.13 at 0.8; composite 76.0 throughout)
    sharpen: 0.5,
    // capture: frames after a start or a change during which resting pixels keep
    // no history (the image is still settling), so a capture averages settled frames
    settleFrames: 8,
  },

  // The calm field (calm.js, the core lane; loop 2 gap C1): where the page's text
  // sits over the scene, near the top of the runway, the frame is defocused and
  // its light compressed toward its own mean, feathered, so the greeting and the
  // timeline read over a quiet field. The old gate (under each text box, grey p5 to
  // p95 under 70 levels and Canny edges under 1.2 %) is RETIRED as of 2026-09-27: it
  // can only be met by blurring the in-focus frame, which read as a blur band. With
  // the frame crisp the boxes measure spans 89 to 100 and edges 2.0 to 2.3 % at
  // 17:41 (zones2.py), so the text's legibility belongs to the page: a scrim or card
  // under the greeting and the timeline, held to 4.5:1 at integration.
  calm: {
    enabled: true,
    strength: 1,
    nightStrength: 0.5, // x strength once the sun is well down (the night frame is already quiet; keep it crisp)
    from: 0.12, // p: full strength up to here (the hero text is on screen)
    to: 0.3, // p: gone by here (the hero text has faded, --hero-fade)
    // Tuned at 1440 x 900, Dreamlike, 09:00 / 12:00 / 17:41 partly (loop 2 round 1,
    // fix-core calm1): contrast 0.5, meanPx 220, defocusPx 16 put both boxes at
    // p5 to p95 spans of 53 to 58 levels and 0.0 % edges (before: 141 to 153
    // levels, 2.5 to 3.3 %); contrast 0.45 / meanPx 110 spanned 52 to 66
    // 2026-09-27: the screen-space defocus is OFF. At 0.9 it drew a full-width blur
    // band over 44 % of the hero (93 % on the phone) that smeared the in-focus frame
    // and hid the golden-hour cumulus (both loop 2 critics, severity 5). The far
    // field now softens through the camera's own depth of field (farBokeh) and the
    // tone compression acts only beyond the glass (gate), so the frame stays crisp.
    defocus: 0, // share of the blurred copy inside the field (was 0.9)
    farBokeh: 2, // x the path's bokeh at full calm strength (p under `from`), eased out by `to`
    gate: { enabled: true, z: 0.3, soft: 0.15, softPx: 6 }, // m beyond the glass where the field starts, m to full, CSS px of edge softening
    defocusPx: 16, // CSS px, the defocus blur's sigma
    // CSS px, the local mean's sigma: wide, so the mean itself stays nearly flat
    // across the 720 px timeline box (220 left Heightened and Photo-true at 76 to 79
    // on the shared tree once the light lane's new exposure landed; 450 gives 62 and
    // 67 at 17:41)
    meanPx: 450,
    contrast: 0.4, // exponent on (L / L_mean) inside the field: 1 none, 0.5 halves the stops
    // per look (the default Dreamlike keeps the base). Photo-true's noon window is
    // the hardest case (timeline 76 to 87 at 0.36 to 0.42)
    looks: {
      heightened: { contrast: 0.36 },
      photo: { contrast: 0.25 }, // 0.3 left the light theme at 71 and 72 at 09:00 and 12:00
    },
    lift: 0, // display-space pull of the field's mean toward `level` (0 = the scene's own)
    level: 0.5,
    // per page theme (one-sided: `dir` down only darkens, up only lightens). The
    // site's text is --fg #111111 (light) and #ededed (dark); WCAG worst case under
    // the boxes with the field alone (17:41): light text 3.5 to 3.6:1 on the dark
    // theme, dark text 2.0 to 2.1:1 on the light theme. Dark: lift 0.5 toward 0.26
    // (display) reads as a dusk veil and takes the light text to 4.7 to 5.1:1 at
    // 17:41, 4.4:1 at 12:00 (fix-core calm2). Light: lifting toward a pale level
    // read as a fog block over the casing (calm2, lift 0.5 and 0.85: 3.0 to 4.8:1
    // but spans past 70), so it stays off; the integration's paper scrim carries the
    // light theme's small text (12-folio-page-scroll 9)
    themes: {
      dark: { lift: 0.5, level: 0.26, dir: "down" },
      light: { lift: 0, level: 0.66, dir: "up" },
    },
    grain: 1, // x post.grain.amount put back into the defocused field
    // band: the rows the text occupies, full width (a shallow focal plane: the
    // handle and the keyhole below and the sky's top row above stay sharp); boxes:
    // a feathered rectangle per text box (read as two frosted patches, round 1)
    // 2026-09-27: boxes. With the defocus off and the depth gate on, the field is a
    // light-only compression of the view behind each text box; a full-width band
    // flattened whole rows of sky that no text sits on
    shape: "boxes",
    // (140 / 200 px feathers softened about 70 % of the 900 px frame; these keep
    // the sky row and the lower third, the handle and the keyhole, crisp. The gate
    // reads only full-strength pixels, so it does not move with them)
    pad: 16, // CSS px of full strength around the text
    feather: 140, // CSS px of fall-off beyond that (boxes; the band's default; 80 before the boxes shape, which needs a wider fade to leave no edge)
    featherTop: 80, // CSS px, the band's fall-off toward the top of the frame
    featherBottom: 110, // CSS px, the band's fall-off toward the handle
    portraitBelow: 0.8, // aspect under which the portrait boxes apply
    // the sizes above are CSS px at sizeRef wide, scaled by (width / sizeRef) ^
    // sizeExp: a 390 px phone gets 0.52 of them (its whole hero went to murk at 1)
    sizeRef: 1440,
    sizeExp: 0.5,
    // the folio page's text boxes as fractions of the viewport (12-folio-page-scroll
    // 2: greeting x 56 to 296, y 256 to 378 and timeline x 720 to 1440, y 240 to 484
    // at 1440 x 900; phone 390 x 844: greeting y 120 to 250, timeline y 324 to 783);
    // the integration passes the live DOM rects instead (engine.setCalmBoxes)
    boxes: {
      landscape: [
        [0.0389, 0.2844, 0.2056, 0.42],
        [0.5, 0.2667, 1.0, 0.5378],
      ],
      // phone: the greeting only (the timeline column, y 324 to 783, gets the page's
      // own scrim card at integration; calming it too left 93 % of the frame soft)
      portrait: [[0.041, 0.1422, 0.959, 0.2962]],
    },
  },

  renderer: {
    toneMapping: "agx", // agx | neutral | aces | none
    exposure: 1.0, // linear multiplier before tone mapping
    dprMax: 2, // device pixel ratio cap, desktop
    dprMaxMobile: 1.5, // device pixel ratio cap, coarse pointer or narrow screen
    // startup precompile. "none": the warm frame compiles what is drawn (the MRT
    // scene pass's pipelines) and nothing else. "canvas" (loop 1): compileAsync of
    // the scene for the canvas target, variants the scene never draws, then the same
    // warm-frame compile; measured (loop 2, 1440 x 900 at DPR 2, warm cache) engine
    // ready 1.13 to 1.42 s with none against 1.97 to 2.16 s with canvas on WebGPU,
    // 1.57 to 2.43 against 2.41 to 2.65 on WebGL2. "pass" (PassNode.compileAsync
    // before the first render) produced invalid WGSL on WebGPU in r186 (the pass's
    // MRT outputs are not set up yet): not used
    compile: "none",
  },

  // light, air and lens: the post pipeline (light/params.light.js owns it)
  post: POST_PARAMS,

  camera: {
    near: 0.01, // m
    far: 120, // m
    // p = 0: the hero (camera.js windowKey). A rectangle of the scene, `region`
    // (x0, x1, y0, y1 in W: its size and centre on the glass plane; z its depth),
    // faces the camera and is cover-fitted to the viewport; the camera looks at its
    // centre along yaw and pitch.
    // Round 2 (the art critic: "half the hero is a gold wall that never changes, and
    // nothing is in focus"): the window IS the frame now. Left to right at 16:10: L1's
    // edge and L2, L2's hinge stile with the keyhole and the lamp's glow, the corner
    // post, R1 (the handle leaf, its brass D-handle low in the centre), R2 with the
    // bamboo, then R2's outer stile and the dark casing with a sliver of wall at the
    // right edge. Row A's sky across the top (the moon lands in R1's top pane at
    // night), the room grille's tie bars nearly level at the top edge (yaw 16, was
    // 34.5), the lamp head just below the frame. What leaves through the glass is
    // 0.37 of the frame (the most any framing reaches with the stiles, rails and room
    // bars in front: coverage sweep, fix-core round 2); the wall 0.04 (was 0.31).
    // The focus is ON the handle leaf and the keyhole stile (0.54 m at 16:10; focusIn
    // keeps it there at any aspect): the enamel, the putty lines, the keyhole, the
    // brass and the room bars are tack sharp, the bamboo and the trees melt. With the
    // focus on the bamboo (2.3 m, round 1) the outside grid (0.9 m) and the frame fell
    // in the near field, and the near field's blur covered every pane: the canes were
    // soft at their own focus distance (Laplacian variance 10 against 264 with the DOF
    // off). Measured on the keyhole stile and handle at 1440 x 900: 262 (was 13 to 16
    // at focus 2.3).
    // The text boxes (Q07: greeting x 56 to 296, y 256 to 378; timeline x 720 to
    // 1440, y 240 to 484 at 1440 x 900) now sit over glass and frame, not over a calm
    // wall: the integration's scrim carries them (round 1's calm-wall numbers were
    // traded for the composition on purpose; zones.py numbers in the fix-core notes).
    window: {
      region: [-1.75, 7.75, 0.731, 6.669], // W: x0, x1, y0, y1 (9.5 W wide at 16:10; the lamp head stays just below the frame)
      z: 0, // W, depth of the region's centre
      fovV: 46, // deg, vertical
      pitch: 0, // deg, + looks up
      // Loop 2 (C1, the text): yaw 20 (was 16) turns the frame 4 deg right, so the
      // flat casing takes more of the timeline's box (its span with the calm field
      // 64 against 75 at yaw 16, 17:41); the composition otherwise holds
      yaw: 20, // deg, + looks right (toward the angled right section); 15 to 20 keeps the room's tie bars nearly level
      focus: null, // m (null: focusIn)
      focusIn: 0.085, // m in front of the region's centre: the handle leaf and the keyhole stile
      bokeh: 1.2, // x the look's post.dof.bokehScale at p = 0 (the near frame is in focus, so only the far field melts)
      // where the cover-fit's crop sits on screens of another shape (camera.js): wider
      // than 16:10 keeps the lower part (the handle, the keyhole, the lamp's glow), a
      // taller one the centre
      anchorY: 0.3,
      anchorX: 0.5,
      // portrait viewports (aspect below mobileBelow): the lamp-lit hinge stile with
      // the keyhole, the corner post and the handle leaf low in the frame, pitched up
      // so R1's and L2's upper panes (the sky, the moon at night) fill the top third
      // (round 2: the art critic, "the phone hero has no sky": at yaw 30 R1's upper
      // panes framed the cream building, so neither the hour nor the weather read).
      // L2's row A and B panes (sky, the gold cumulus, the moon at night) fill the top
      // third on the left, the keyhole and the handle sit in the lower third
      // Loop 2 (C1): one tall pane column (was two thirds dark stile): L2's pane with
      // the meeting stile at the left edge and its hinge stile at the right, row A's
      // sky across the top (the phone's greeting), the rail, row B's bamboo under
      // the timeline; the calm field covers both
      mobileBelow: 0.8,
      regionMobile: [-0.25, 1.55, 1.2, 6.6], // W
      mobile: { yaw: 12, pitch: 8, fovV: 46, anchorY: 0.5 },
    },
    // the solved 17:41 reference framing (13-photo 3)
    ref: {
      pos: [-2.6, 0.5, 8.8], // W
      yaw: 8, // deg, right of the wall normal
      pitch: 5.7, // deg, up
      roll: -0.7, // deg (three.js rotation.z; the verticals lean left in the photo)
      fovV: 56.8, // deg, vertical at aspect 4:3 (24 mm eq)
      aspect: 4 / 3,
      focus: 8.8, // W, focused on the glass
      // the photo's own screen (round 2; round 1's flat grey bars read as a wireframe):
      // the 17:41 photo's screen rectified by a homography whose corners are the
      // active area projected through this camera, so it lands back on the same
      // pixels; pixels only, no metadata (the dark app's text blurred past reading).
      // The dusk shots' poster is DRAWN: the photographed navy, the app's bars and a
      // column of real text in our own words where the photos put it. Builder:
      // loop archive round-2/fix-core/tools/posters.py. The runway shows the folio
      // posters.
      // Dev-only: the capture posters live outside public/ (shot-1741 is a crop of a
      // real conversation), so Vite dev serves them and no build ever ships them.
      poster: "/tools/window-light/ref/capture-posters/shot-1741.jpg",
      at: 0.5, // p where the path passes through it
    },
    // the dusk close-ups (?shot=ref5480 to ref5484; render them 3:4 upright, 1200 x
    // 1600 like tools/window-light/ref/ref_548x.png). Solved by PnP (fixed vertical
    // FOV, principal point at the centre) from the putty lines of the L pair's panes,
    // the room grille's bars (as lines, for depth), the keyhole slot, the casing's
    // wall edge and, in 5484, the right section and the monitor's top-right corner;
    // fix-core round 1, scripts and correspondences in the loop archive
    // (round-1/fix-core/poses). All five come out at the same chair, about 10 W
    // (0.9 m) from the glass, which checks them against each other. rms: residual px
    // at 1200 x 1600. L2's right edge was left out of 5481 and 5483: the model's L2
    // pane (0.973 W) reads 5 to 8 % narrower than these photos show.
    // Loop 2 (C4) re-measured 5482 and 5484 against the MODEL's own edges: Canny on
    // ?view=normal and ?view=depth captures at each pose, scored by the distance to
    // the photo's nearest edge (loop2 round-1 fix-core c4/rsolve.py). 5482: median
    // 4 px, 38 % of model edge px within 3 px, inlier RMS 4.8 px; 5484: median 2 px,
    // 58 % within 3 px, inlier RMS 4.0 px. A render-in-the-loop pattern search moved
    // 5482 by 0.075 W and 0.3 deg and 5484 by 0.03 W and 0.15 deg and scored no better
    // against the photos (5482 composite 41.3 against 41.7), so these poses stand.
    // The rms figures below measured round 1's hand clicks: they put every pane
    // corner on the glass (z 0) while the clicks sat on the chamfers' outer edges
    // about 0.06 W beyond it, and the photos' pane edges are 15 to 20 px bands
    // (reveal, chamfer, putty). What still disagrees is the model: L2's pane reads
    // about 7 % narrower than 5482 shows, and the room bars 0.095 W against about
    // 0.14 W in the photo.
    // The photos were taken 26 Sep 2026 18:39:52 to 18:40:12 IST (?tod=18.66) with
    // the room's ceiling light ON (5480 shows the lit cream wall); the scene has no
    // ceiling light, so their room fill is missing from any render of these shots.
    shots: {
      ref5480: { pos: [-1.205, 1.044, 10.096], yaw: -14.74, pitch: -0.63, roll: -0.93, fovV: 71.6, aspect: 0.75, focus: 10.1, tod: 18.664, ceilingLight: true, poster: "/tools/window-light/ref/capture-posters/shot-1840.png", rms: 4.8 }, // 24 mm eq: the desk, the portrait monitor, the window at the right
      ref5481: { pos: [-1.545, 0.427, 10.194], yaw: 4.75, pitch: 13.46, roll: 0.88, fovV: 38.2, aspect: 0.75, focus: 10.2, tod: 18.666, ceilingLight: true, poster: "/tools/window-light/ref/capture-posters/shot-1840.png", rms: 5.3 }, // 50 mm eq: the L pair, the sill, the car
      ref5482: { pos: [-1.246, 0.496, 10.088], yaw: 8.69, pitch: 0.76, roll: 1.14, fovV: 29.4, aspect: 0.75, focus: 10.1, tod: 18.667, ceilingLight: true, poster: "/tools/window-light/ref/capture-posters/shot-1840.png", rms: 9.2 }, // 66 mm eq: L2's lamp-lit hinge stile (the 18:40 hotspot), the handle
      ref5483: { pos: [-1.548, 0.624, 10.058], yaw: 10.38, pitch: 0.47, roll: 0.45, fovV: 29.4, aspect: 0.75, focus: 10.1, tod: 18.669, ceilingLight: true, poster: "/tools/window-light/ref/capture-posters/shot-1840.png", rms: 5.7 }, // 66 mm eq: the same, the car close, the screen's lamp streak
      ref5484: { pos: [-0.106, -0.364, 10.034], yaw: 20.9, pitch: 1.73, roll: -0.49, fovV: 29.4, aspect: 0.75, focus: 9.3, tod: 18.67, ceilingLight: true, poster: "/tools/window-light/ref/capture-posters/shot-1840.png", rms: 18.1 }, // 66 mm eq: the lamp head, the right section (its geometry fits worst)
    },
    // on the way in: in front of the screen, `back` times the final distance
    approach: { at: 0.8, back: 1.3 },
    // the bookend: out of the screen to a closing room shot at that hour
    bookend: { backAt: 0.3, back: 2.4 },
    closing: {
      pos: [-4.5, 2.6, 17.5], // W
      yaw: 9, // deg
      pitch: -5, // deg
      roll: 0,
      fovV: 50, // deg
      focus: 17.5, // W
    },
  },

  // the light rig, the exposure model and the grade (light/params.light.js owns them)
  lights: LIGHTS_PARAMS,
  exposure: EXPOSURE_PARAMS,
  grade: GRADE_PARAMS,

  time: {
    rate: 1, // ambient time speed (wind, clouds, motes); 1 = real time at display rate
  },

  // the Living Sky plate outside the window (skyPlate.js)
  sky: {
    plate: { width: 1024, height: 640 }, // px; aspect sets the elevation span (fovH / aspect)
    view: { viewAz: 8, fovH: 120 }, // deg: plate centre bearing and width (the window sits right of the chair)
    radius: 40, // m, the dome the plate hangs on
    gain: 7.0, // plate (display-referred) to scene units (17:41 sweep against ref_1600: glass about 1.45x monitor white)
    nightGain: 0.35, // extra multiplier once the sun is well down (the plate is display-referred, a real night is far darker)
    tint: [1, 1, 1], // linear multiplier
    bloom: 0.12, // fraction of the sky that reaches the bloom
    horizonGround: [0.3, 0.36, 0.22], // below the horizon: the sky average times this (distant ground and haze)
    cumulusFloor: true,
    skyglow: "auto",
    // true = the real moon (a north window never frames it); placed = moved into
    // the upper left panes with its real phase and lit limb (Dreamlike)
    // placed (round 2, for the reframed hero): az -2, alt 18 puts the disc in L2's top
    // pane at p = 0 (the upper left pair, the brief's place for it), above the
    // greeting box. moonCheck([0, 0.25, 0.5]) at 1440 x 900: in frame at all three,
    // 0.67 / 0.48 / 0 of the disc clear (at the 17:41 framing, p = 0.5, the casing
    // hides it). Round 1's az 22, alt 17 sat behind R1's top rail in the new hero
    // (0.33 clear).
    // mobile (loop 2): the phone's one-pane-column framing put the disc at y 147 of
    // 844, inside the greeting box and so under the calm field; alt 29 lifts it
    // into row A's sky above the text
    moon: { mode: "true", az: 14.2, alt: 20, // 2026-09-27: was az 3.75, alt 16, fitted before the -5 deg sweep and the folio opening at p 0.5, where its whole path sat behind the frame (moonCheck clear 0); az 10 to 14 is the open glass there
       scale: 1.8, nightAlways: true, mobile: { az: 13.25, alt: 29 } }, // placed (mobile: az 13.25 puts midnight at the portrait open-sky spot 8, 29): deg bearing at its rise (17:00) and altitude at its top (00:00) on the plate; outside.moon.track moves it by the hour (was az -2, alt 18, static)
    updateEvery: 2, // frames between plate redraws and uploads in the live loop (1 in capture mode and in storms)
    averageEvery: 30, // frames between readings of the sky's mean light for the lights (engine.js createSkyMeter: a GPU mean read back asynchronously, never a stall)
    averageSecondsWebGL2: 120, // s between readings on the WebGL2 fallback (live), whose readback still blocks in Chrome; it also reads at start and on any change
    uniforms: {}, // raw u_* overrides, applied last
  },

  // the monitor screen (the engine owns its material)
  screen: {
    white: 1.0, // emissive of the page's white (the photometry unit)
    // the monitor's own brightness at night (sun below -8 deg; eased from -2): a
    // white page would bloom over the dark room, the dark page barely changes
    night: { light: 0.45, dark: 0.85 },
    // the glint in the glossy panel (5480, 5481, 5483: a hot point at the top edge
    // with a long thin streak down the panel). Traced from the solved dusk poses,
    // the panel mirrors a point up and behind-left of the chair (110 to 128 deg
    // away from the lamp, which sits 0.73 W BEHIND the panel's plane and can never
    // be seen in it): the room's ceiling light, on in every dusk photo. So it is on
    // only in the ceilingLight shots (or `always`); source: [x, y, z] W or "lamp";
    // tiltDeg: the panel's back tilt (regions_1741: its edge leans)
    glint: { enabled: true, always: false, source: [-18, 18, 27], color: "#fff4e0", strength: 14, tiltDeg: 12, coreDeg: 0.7, streak: 0.3, streakWidthDeg: 0.12, streakLengthDeg: 9, angleDeg: -15, bloom: 0.4 }, // tuned on ?shot=ref5483 against the photo
    handoffLight: 4.0, // emissive the light theme's white rises to (AgX clips it to #fff)
    roughness: 0.12,
    // F0 scale of the panel's reflection (1 = bare glass, 0.04): the BenQ's
    // anti-glare coat reflects about half that (round 2; no change measured on the
    // photo shots' screen regions at 0.15 to 1, it only tames the window fill's
    // specular on the runway)
    specular: 0.5,
    bloom: 0.012, // fraction of the screen's light that reaches the bloom (0.06 until 2026-09-27: Agam, "too much glow on the screen"; it was most of the milky halo round the monitor)
  },

  debug: {
    view: "beauty", // beauty | normal | ao | emissive | velocity | depth
  },
};
