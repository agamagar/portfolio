// The four looks (30-locked-brief.md, "The looks"): one scene, one geometry,
// four deep patches on the base params. Switching is live: the engine
// rebuilds the params from base + look + URL ?set= + setParams() patches, in place,
// then calls every module's setLook(look).
//
// The patches only name what differs from the base. The grade and exposure parts
// (renderer, post, exposure, grade, lights, screen) are the light builder's and
// are fitted against the photos with tools/window-light/compare.py; the rest (the
// moon, the motes, the blocked panes, the glass) is what each look is.

import { baseParams, deepMerge, assignInPlace } from "./params.js";

export const LOOK_NAMES = ["dreamlike", "heightened", "photo", "cyberpunk"];
export const DEFAULT_LOOK = "dreamlike";

export const LOOKS = {
  // Photo-true: indistinguishable from the photos, heavy glass dust and true
  // exposure included (judged side by side with tools/window-light/compare.py
  // against ref_1600.png, the SDR decode of the 17:41 HEIC)
  photo: {
    renderer: { exposure: 1.0, toneMapping: "agx" },
    post: {
      // no selective bloom: in a photo the lens's glare is the only halo (bloom 0
      // measured no different from bloom on, so the pass is not built)
      bloom: { enabled: false },
      // the phone's veiling glare: what the sky scatters (above 0.9 exposed), a
      // faint tight core and mid halo (the bars stay crisp and dark against the
      // glass) and a long tail of about a quarter of the frame height (the wall
      // grades from 0.009 at the far left to 0.07 beside the casing; the photo
      // 0.006 to 0.07). Fitted with compare.py on ref_1600: composite 66.2,
      // grille_room +0.01 st, frame_wood -0.03, wall_left -0.08
      // (round 2: tail 0.25 -> 0.32. The window plate's upper sky is now clear
      // (skyPlate.js CUMULUS), its mean 11% lower, glass_clear from +0.30 to +0.20
      // stops; the tail had been fitted against the brighter sky, and the room's
      // darks fell 0.25 stops with it)
      // (loop 2: tint 0.96/1/1.05 -> 0.9/1/1.12: with the one gold cumulus in row B
      // its scatter warmed L2's hinge stile beside it to C* 5.9; the photo's is
      // neutral there, C* 2.0)
      glare: { core: 0.01, mid: 0.01, tail: 0.32, tailSigma: 14, threshold: 0.9, tint: [0.9, 1, 1.12] },
      // the iPhone's local tone mapping: the frame and the bars lifted up to 0.8
      // stop, their edges kept, the blacks (the switched-off monitor) left
      // black; the sky's base held down about a stop so the cumulus tops, riding
      // on it, are what clips
      localTone: { lift: 0.8, lo: 0.03, hi: 0.09, floor: 0.005, pull: 0.9, pullLo: 1.0, pullHi: 2.0, eps: 0.6 },
      // the phone's tone curve: linear, a hard shoulder, the gold panes clip
      tone: { curve: "phone", clip: 2.0, knee: 0.5 },
      // a denoised phone sensor: the photo's wall and dome read 0.36 L* of pixel
      // noise (the critic's measure.py), the old 0.035 hash read 1.2
      grain: { amount: 0.0095 },
      // the real optics: 24 mm eq (6.765 mm) at f/1.78 focused on the glass at
      // 0.79 m blurs the far trees about 5 px across a 1600 px frame and the
      // monitor under 2 px (13-photo 3); DOF's CoC is linear in distance, so
      // this is the compromise that keeps the frame and the bars sharp
      dof: { bokehScale: 1.3, focalLength: 0.9 },
      // the lamp's beam is barely there in a photo: only dust close to the bulb
      volume: { density: 0.25, specks: { enabled: false } },
    },
    // and the phone's lifted blacks: a little of the frame's mean light everywhere
    // (the photo's darks sit at 0.012 to 0.016 of display white, the off monitor
    // at 0.003; fitted with compare.py, 8 x 6 grid log-luminance 1.07 -> 0.89 st)
    // the phone opens up about 2x at dusk (smooth(1, -6) of the sun's altitude)
    exposure: { flare: { amount: 0.01 }, auto: { duskBoost: 2.0 } },
    grade: {
      whiteBalance: [1.0, 1.0, 0.97], // the phone rendered the screen's D65 white a touch warm (#c1bdb6)
      // the photo's pale blue sky and gold cumulus, through the dusty glass: the
      // hour's colours (light/params.light.js sky.keys), the gold tops clipping
      // (loop 2: the cloud mask is the plate's own cover now; the one cumulus mass
      // lit gold-cream, its tops clipping as 19% of the pixels do (photo 21%):
      // glass_bright C* 11.9 at hue 98 against the photo's 11.0 at 102)
      sky: { recolor: 0.92, chroma: 0.7, gold: 2.4, litGain: 1.45, saturation: 1.0, cloudLo: 0.7, cloudHi: 1.1, litLo: 0.9, litHi: 1.6 },
    },
    sky: { moon: { mode: "true" } },
    screen: { white: 0.8 }, // the phone exposed for the window: its monitor white reads 0.8 of ours
    room: { window: { glass: { dust: 1.0 } }, motes: { enabled: false } },
    outside: { blocked: { open: false }, motes: { enabled: false } },
  },
  // Heightened realism: true geometry and materials, light and air pushed: a
  // richer golden hour, crisper clouds, slightly cleaner glass, dust in the beam
  heightened: {
    renderer: { exposure: 1.15, toneMapping: "agx" },
    post: {
      bloom: { strength: 0.4, threshold: 0.05 },
      glare: { core: 0.015, mid: 0.015, tail: 0.02, tint: [0.95, 1, 1.06] }, // a little of the window's halo
      localTone: { lift: 1.0, lo: 0.006, hi: 0.05, eps: 0.25 },
      grain: { amount: 0.025 },
      dof: { bokehScale: 2.0, focalLength: 1.2 },
      volume: { density: 0.6, specks: { enabled: true, gain: 0.25, count: 140 } },
    },
    // at night the camera stops adapting at 2x (the sky navy at L* 8 to 18, the
    // lamp-lit stile the brightest thing, the room not flooded)
    // (loop 2: nightLift 2.5 -> 4: the 21:00 glass read L* 12.8 with little structure;
    // the night sky's clouds and the city's glow on them now show)
    exposure: { sky: { nightLift: 4 }, flare: { amount: 0.004 }, auto: { max: 2.0 } },
    grade: {
      whiteBalance: [1.02, 1.0, 0.97],
      // (loop 2) the hours told apart: a cooler clearer morning, a bleached noon,
      // a warm afternoon (09, 12 and 15 were 5 to 6/255 apart)
      hourWB: { amount: 0.8, morning: [0.92, 0.99, 1.1], afternoon: [1.1, 1.0, 0.88] },
      hour: { noonEV: 0.25, noonDesat: 0.15, noonFlat: 0.08, amSat: 0.05, amContrast: 0.06 },
      saturation: 1.08,
      contrast: 1.04,
      vignette: 0.14,
      // a richer golden hour and crisper clouds than the phone saw
      // (round 2: chroma 2.3 and saturation 1.8 read as illustration, cyan sky
      // and yellow shapes; a richer golden hour than the phone, not a poster)
      // 2026-09-27: the gold back at 17:41. Its tighter cloud thresholds (0.8 / 1.2,
      // lit 1.0 / 1.8) left the lit cumulus classed as sky, so glass_bright came out
      // neutral (C* 0.3 at hue 257 against the photo's 11.0 at 102). Looser: C* 9.9 at
      // hue 102, 16 % of the gold panes clipping (photo 21 %). Glare, local tone,
      // exposure and gold/saturation were ruled out by override renders.
      sky: { recolor: 0.95, chroma: 1.7, gold: 1.6, litGain: 1.6, saturation: 1.35, contrast: 1.1, cloudLo: 0.6, cloudHi: 1.0, litLo: 0.8, litHi: 1.4 },
    },
    // day: the daylight room fill (lights.js), so the hours read (round 2)
    lights: { moon: { intensity: 0.0048 }, bounce: { day: 0.11 } },
    sky: { moon: { mode: "true" } },
    room: { window: { glass: { dust: 0.4 } }, motes: { enabled: false } },
    outside: { blocked: { open: false }, motes: { enabled: false } },
  },
  // Dreamlike (the default): Heightened plus the moon in the window, glowing
  // motes, and the blocked far-right column opened; the air is thick with light
  dreamlike: {
    renderer: { exposure: 1.2, toneMapping: "agx" },
    post: {
      bloom: { strength: 0.55, threshold: 0.02, radius: 0.55 },
      glare: { core: 0.014, mid: 0.02, tail: 0.035, tailSpread: 1.3, tint: [1.05, 1, 0.92] }, // a warm halo off the window (core and mid trimmed 2026-09-27: less haze round the lit screen; the tail keeps the window's halo)
      localTone: { lift: 1.2, lo: 0.006, hi: 0.05, eps: 0.25 },
      grain: { amount: 0.02 },
      dof: { bokehScale: 2.2, focalLength: 1.1 },
      // the beam's motes: sparse near the bulb (round 2: a glitter curtain at
      // p = 0.25 and 0.75 at 21:00), a few bright among many faint
      volume: { density: 1.3, dust: 0.65, specks: { enabled: true, gain: 0.8, share: 0.42 } },
    },
    // the night room (Agam, 2026-10-05: "the room is super dark"): a stop more
    // exposure after sunset (duskBoost, eased in from the sun at 1 to -6 deg) and a
    // warm room fill (lights.bounce.lift below). At 23:30 the left half of the frame
    // rose from 6.5 to 43 of 255; 14:30 is unchanged (mean 140.3 -> 140.0)
    exposure: { sky: { nightLift: 1.6 }, flare: { amount: 0.006 }, auto: { max: 2.2, duskBoost: 2 } },
    grade: {
      whiteBalance: [1.02, 1.0, 0.98],
      hourWB: { amount: 1, morning: [0.92, 0.99, 1.1], afternoon: [1.1, 1.0, 0.88] },
      hour: { noonEV: 0.35, noonDesat: 0.24, noonFlat: 0.1, amSat: 0.06, amContrast: 0.08 },
      saturation: 1.1,
      contrast: 0.98,
      lift: 0.012,
      vignette: 0.22,
      // 2026-09-27: the gold back at 17:41 (glass_bright C* 3.0 at hue 149 -> 11.0 at
      // hue 111 against the photo's 11.0 at 102): the same threshold cause as
      // Heightened, one step looser because the dream is allowed more gold
      sky: { recolor: 0.95, chroma: 1.8, gold: 1.65, litGain: 1.4, saturation: 1.4, contrast: 1.05, cloudLo: 0.5, cloudHi: 0.9, litLo: 0.7, litHi: 1.25 },
    },
    // bounce.lift: the night room's fill (a lit room returns more than the dark-room
    // balance gives; by day it is lost under the daylight fill)
    lights: { moon: { intensity: 0.027 }, bounce: { day: 0.13, lift: 0.015 } },
    // sky bloom 0.2 -> 0.12: the blue hour's sky and the moon's glow bloomed into a
    // milky veil (round 2)
    sky: { tint: [1.03, 0.99, 0.97], bloom: 0.12, moon: { mode: "placed", nightAlways: true } },
    room: { window: { glass: { dust: 0.3 } }, motes: { enabled: true } },
    outside: { blocked: { open: true }, motes: { enabled: true } },
  },
  // Cyberpunk (Agam, 2026-10-05: "more modes, maybe one is cyberpunk"; built from
  // the Neon Noir direction, tools/window-light/spec/30-locked-brief.md "4. Cyberpunk"):
  // a skyline of dark towers past the bamboo, neon lightboxes and tubes on them, a
  // teal sky over a violet city haze, a cool dark room with the pink lamp on the
  // stile. Every key here is LIVE (read per frame), so a menu switch shows the whole
  // look without a module rebuild; tools/window-light/lookkeys.mjs fails if a
  // build-time path (the bamboo, canopy and far-tree palettes, the street heads) is
  // added. The new features (grade.hueBand, grade.split, lights.lamp.spill.dayGain,
  // lights.moon.keyDir, outside.horizon / building colours and trims, outside.neon,
  // outside.rain.neon, room.window.glass.neon) all default off in the base params.
  cyberpunk: {
    renderer: { exposure: 1.0, toneMapping: "agx" },
    post: {
      bloom: { strength: 0.3, threshold: 0.06, radius: 0.5 },
      // threshold stays 0: 0.5 measured the 17:41 stile L* 6 -> 4, L*<8 40 -> 43 %
      glare: { core: 0.008, mid: 0.012, tail: 0.02, tailSpread: 1.2, tint: [1.0, 0.9, 1.12] },
      localTone: { lift: 1.6, lo: 0.004, hi: 0.03, floor: 0.0005, eps: 0.25 },
      grain: { amount: 0.03 },
      dof: { bokehScale: 2.6, focalLength: 1.0 },
      // no specks: pink dust across the dark right half read as dead pixels (critics,
      // 2026-10-05); the beam keeps its air
      volume: { density: 0.5, dust: 0.7, specks: { enabled: false } },
    },
    exposure: { sky: { nightLift: 6 }, flare: { amount: 0.002 }, auto: { max: 1.1 } },
    grade: {
      whiteBalance: [0.9, 1.0, 1.04],
      hour: { noonEV: 0.1, noonDesat: 0.1, noonFlat: 0.0, amSat: 0.0, amContrast: 0.0 },
      saturation: 1.15,
      contrast: 1.1,
      lift: 0,
      vignette: 0.35,
      // (r3) the hours told apart a little: a cooler morning, a pinker afternoon (09, 12
      // and 15 were 3 L* apart, one teal filter)
      hourWB: { amount: 0.6, morning: [0.92, 1.0, 1.1], afternoon: [1.06, 0.97, 1.0] },
      // the garden's greens turned teal (grey-axis hue 128 -> about 178). Refit in
      // the scene from the mock's 55: at 55 the noon garden (L_rowB) read CIE hue 186
      // against the 160 to 185 target; 50 reads 180, and 176 at 17:41. (2026-10-06)
      // feather 20 -> 40 and weighted by chroma: the 06:00 creams split into teal
      // blotches at the band's edge
      hueBand: { amount: 1, centre: 128, half: 22, feather: 40, angle: 50, satLo: 0.12, satHi: 0.3 },
      // teal into the shadows: the dark room leans teal-blue, not pink (0.6 left the
      // 21:00 wall at C* 10 against the 9 target and magenta at 39 %; 0.7: 9 and 36 %)
      // (2026-10-06) held off saturated colours (keepSat): the tint had greyed every
      // dim neon sign to a pastel
      // (r3) keepSat 0.5/0.8 -> 0.75/0.95: the lamp-lit door frame (display saturation
      // about 0.6) kept its maroon; now only the signs and the lit stile keep their own
      // colour (the frame 4/11/350 -> 2/1/257 at 21:00); 0.7 -> 0.55 with the cooler room
      split: { shadow: [0.1, 1.0, 1.25], shadowAmount: 0.55, lo: 0.02, loTo: 0.2, high: [1, 1, 1], highAmount: 0, hi: 0.45, hiTo: 0.9, keepSat: [0.75, 0.95] },
      // a teal zenith over a violet city haze by night, pink cumulus on teal at
      // dusk, a cold teal smog by day (Neon Noir's sky block, unchanged)
      sky: {
        recolor: 1.0,
        chroma: 1.8,
        gold: 1.2,
        litGain: 1.2,
        saturation: 1.3,
        contrast: 1.1,
        cloudLo: 0.5,
        cloudHi: 0.9,
        litLo: 0.7,
        litHi: 1.25,
        keys: [
          { alt: -30, zenith: "#003a40", horizon: "#2a2060", cloudLit: "#5a2260", cloudBase: "#0c3038" },
          { alt: -12, zenith: "#003e46", horizon: "#30245e", cloudLit: "#682a6c", cloudBase: "#10343c" },
          { alt: -6, zenith: "#0e4656", horizon: "#5a2a6a", cloudLit: "#8a4a8a", cloudBase: "#203848" },
          { alt: -2, zenith: "#1e5a70", horizon: "#8a4a88", cloudLit: "#c070a8", cloudBase: "#3a4a68" },
          { alt: 1, zenith: "#3a7890", horizon: "#d08aa8", cloudLit: "#ffa0b8", cloudBase: "#5a6080" },
          { alt: 5, zenith: "#5ab8c8", horizon: "#d8b8cc", cloudLit: "#ffb0c8", cloudBase: "#8a8cb0" },
          { alt: 12, zenith: "#6ab8cc", horizon: "#c0d8dc", cloudLit: "#ffd8e4", cloudBase: "#98a4b8" },
          { alt: 30, zenith: "#7ab8c8", horizon: "#b8d0d4", cloudLit: "#f0f0f2", cloudBase: "#a0b0b8" },
          { alt: 70, zenith: "#88bcc8", horizon: "#d0dcdc", cloudLit: "#f4f6f6", cloudBase: "#acb8c0" },
        ],
        morning: { mix: 0.3, zenith: "#4aa8c0", horizon: "#b0d4dc" },
        dawn: { mix: 0.5, desaturate: 0.1, horizon: "#d8a0c0", cloudLit: "#f0a8c8", cloudBase: "#a090b0", zenith: "#5a90a8" },
        haze: { mix: 0.4, horizon: "#c8d4d4", zenith: "#98b4bc" },
        horizonTop: 0.25,
        greyDesaturate: 0.5,
      },
    },
    lights: {
      // the core lights R2's frame and the right wall, the spill the stile. (2026-10-06)
      // core 0.005 -> 0.002: it washed the frame and the wall maroon; the spill keeps
      // the pink on the stile, and the room's fill (bounce, below) is cool
      // the spill x12 by day keeps the stile's neon at noon (dayGain)
      // (2026-10-06) the spill's lobe narrowed from the base's 68 deg to 48 with a soft
      // edge: the wide lobe washed the whole right pair's frame maroon; now the pink
      // pools on the stile and fades before R1's frame
      // (r3) core 0.002 -> 0.0012: with keepSat it leaves the frame a cool dark shape
      lamp: { color: "#ff9cc8", intensity: 0.0012, spill: { intensity: 0.05, dayGain: 12, angleDeg: 48, penumbra: 0.9 }, bounce: { gain: 0.04 } },
      // a cyan night key from the placed moon's 21:00 direction, with no disc: it
      // rims the canes and the hanging spray (0.3 -> 0.15: the canes read as tubes)
      // (r3) 0.15 -> 0.2 with the pink rim gone: R2's clump 31/11/209 -> back toward the
      // street's teal (the 172 to 200 target)
      moon: { intensity: 0.2, color: "#3fe6ff", keyDir: [13, 19] },
      // the daylight room fill stays cold all day (the base tint is warm after noon:
      // the 15:00 wall read amber, hue 81 at C* 12, off the look's palette); by night
      // a cool floor under the room (lift, in the room's sky colour) so the walls,
      // the frame and the desk hold as shapes on the runway
      // (runwayLift: on the runways the camera exposes for the screen and the room
      // went black, 71 % of the frame under L* 3 at p 0.5; 0.8 keeps the walls, the
      // frame and the desk as cool shapes, the window's neon still the brightest)
      // (r3) runwayLift 0.8 -> 1.0: p 0.5 still had 18 % of the frame under L* 3; lift
      // 0.05 -> 0.07: with the cooler lamp the hero's door frame fell to L* 2 (L*<8 40 %)
      bounce: { day: 0.08, lift: 0.07, runwayLift: 1.0, sky: "#9ec2e0", ground: "#141a24", dayTint: { morning: "#c4d4ec", noon: "#dde6e8", afternoon: "#d4e2e8" } },
    },
    // (u_skyglowColor dropped: an A/B measured no change)
    sky: { tint: [1, 1, 1], bloom: 0.15, moon: { mode: "true" } },
    // the wet glass's drops catch the signs in their lower halves (glass.neon), only
    // the drops that look toward them (outside.neon.dropSpread)
    // (r3) 0.25 -> 0.03 with the signs 6.7x brighter: every drop in the L pair's
    // lower panes wore a magenta dot, confetti over the garden
    room: { window: { glass: { dust: 0.2, neon: 0.03 } }, motes: { enabled: false } },
    outside: {
      blocked: { open: true },
      motes: { enabled: false },
      city: {
        // (r3) #5040b0 x 4 -> #5a3c8c x 3: the sky between the towers read as an electric
        // blue (14/28/286), a violet haze now
        glowColor: "#5a3c8c",
        glowRel: 3.0,
        // the city never sleeps
        windows: [[0, 0.5], [3, 0.4], [6, 0.35], [7, 0.2], [17, 0.25], [18.5, 0.6], [20, 0.8], [24, 0.6]],
        glow: [[0, 1], [6, 1], [18, 1], [24, 1]],
        // live via U.streetCol; headLevel and headBloom stay at the base (build-time)
        street: { color: "#6ff6ff", level: 3.0 },
      },
      // the skyline: dark towers rising into the top panes (blockTop 9 to 24 deg: the
      // L pair's top panes see 10.5 to 22 deg at the hero), a few lit windows, neon
      // trims on their rooflines; the city's glow held low (outside/horizon.js uniforms)
      horizon: {
        blocks: 0.85,
        blockTop: [6, 14],
        blockWide: 0.15,
        blockColor: "#0e121c",
        haze: 0.35,
        // the glow reaches up behind the towers (their silhouettes need a lit sky) and
        // lies thin over them
        glowDeg: 12,
        glowFrom: 1.0,
        glowOnSolid: 0.12,
        // lit floors, not dots: each lit cell a short horizontal dash nearly its cell's
        // width, so neighbours run into lit bands (round bokeh discs read as confetti)
        windows: { warm: "#ffc0dc", cool: "#bff4ff", level: 0.03, density: 0.12, bloom: 1.5, amongTrees: 0.5, cellDeg: [0.42, 0.34], size: [0.38, 0.07] },
        trim: { level: 0.06, share: 0.45, inset: 0.25, colors: ["#ff3c9c", "#00d8ff"], bloom: 4 },
        // the weathers apart: a cloud deck and rain lit violet from below, the towers'
        // tops and lights fading into it above 17 deg; clear nights stay crisp
        // (r3) base 17 -> 12, depth 4 -> 6, glow 0.15 -> 1.5: the nights looked alike
        // across the weathers (the murk sat above the top panes, in the haze's own dark
        // colour); now a rain or overcast night's top panes are a lit violet deck the
        // towers fade into (21:00 rain L1top 23/13/311 -> 27/19/305), a clear one crisp
        murk: { cloud: 0.7, rain: 1.0, storm: 1.2, base: 12, depth: 6, glow: 1.5 },
      },
      // the building's lit windows, pink and teal (outside/farTrees.js live uniforms),
      // its cream plaster repainted a cool concrete (it read ochre at dusk)
      building: { lit: { warm: "#ff4aa8", cool: "#3ae0e0", level: 1.5, coolShare: 0.5 }, paint: { color: "#8e9aa4", amount: 1 } },
      // neon on the towers (outside/neon.js): lightboxes and long tubes, no glyphs,
      // no text, no logos; one blade stutters (never under reduced motion). The towers
      // they hang on are the skyline's cards (the horizon band cannot rise past 16
      // deg, where the sky dome stands in front of it): the hero's L pair sees
      // bearings -15 to 5 at 10.5 to 22 deg, R1 13 to 21, the phone's top pane 5 to
      // 17 at 20 to 33, the runway's L pair (p 0.5) 8 to 23
      neon: {
        enabled: true,
        // (r3) level 0.03 -> 0.3 with each lightbox lit from its middle (boxHot) and no
        // side tubes (boxTubes 0): the two bars read as a pause glyph, and at 0.03 the
        // signs were as dim as the towers' floors, dull panels, not lights
        level: 0.3,
        // by day a lit panel in its own colour (r3: dayLevel 3 -> 1 and no hot middle,
        // dayHot 0: brighter only whitened it under AgX, sign C* 4 at noon; at 1 it holds
        // C* 13, a pink panel against the smog, never brighter than it)
        dayLevel: 1,
        dayHot: 0,
        // lit from the sun at 12 deg, full by 0 (r3: U.night's +5 left 17:41 unlit)
        onAlt: [12, 0],
        bloom: 16,
        dayBloom: 1,
        wetBloom: 3, // (r3) 1.6 -> 3: the wet air's halo round each sign tells rain apart
        flicker: 1,
        air: 1,
        tube: 0.05,
        hot: 0.5,
        panel: 0.5,
        boxTubes: 0,
        boxHot: 1,
        haze: 0.45,
        // the signs stand behind the bamboo: its edges catch their magenta at night
        // (the outdoor rim term Dreamlike's moon drives), against the cyan key
        // (r3) 3 -> 0.08: at 3 every cane read as a pink neon tube (moonRim 48 against a
        // sky of 0.02), R2_rowB 48/21/342; at 0.08 the canes keep a faint edge, R2 30/14/205
        rim: 0.08,
        dropSpread: [10, 15],
        palette: ["#ff3c9c", "#00d8f0", "#ffb03c", "#8a4dff"],
        skyline: {
          color: "#161c2a",
          haze: [0.45, 0.12],
          // lit floors: lines along a share of the storeys (2026-10-06: single windows
          // drew round bokeh, confetti over the towers)
          // (r3) dimmer (0.05 -> 0.03) and broken into bays (gap 0.55): unbroken bands on
          // every lit floor read as a shelf of books
          windows: { level: 0.03, share: 0.3, gap: 0.55, warm: "#ffc8e0", cool: "#c8f4ff", cell: [1.1, 0.36], size: [0.95, 0.06] },
          trim: { level: 0.05, share: 0.6, colors: ["#ff3c9c", "#00d8f0"], bloom: 4 },
          // each sign's light on its tower's wall: what mounts it on the facade
          spill: { level: 0.1, reach: 0.6 },
          towers: [
            { bearing: -22, dist: 30, w: 4.5, top: 19, bottom: 1 },
            { bearing: -13.5, dist: 29, w: 4.6, top: 25, bottom: 1 },
            { bearing: -7, dist: 31, w: 3.4, top: 17.5, bottom: 1 },
            { bearing: -1.5, dist: 30, w: 5, top: 20, bottom: 1, crown: 0 },
            { bearing: 4.5, dist: 28, w: 3.2, top: 15, bottom: 1 },
            { bearing: 10.5, dist: 30, w: 5, top: 30, bottom: 1 },
            { bearing: 15.5, dist: 29, w: 4, top: 23, bottom: 1, crown: 0 },
            { bearing: 20.5, dist: 31, w: 3.2, top: 18, bottom: 1 },
            { bearing: 25.5, dist: 30, w: 4.5, top: 21, bottom: 1 },
            { bearing: 32, dist: 29, w: 4, top: 26, bottom: 1 },
          ],
        },
        signs: [
          { bearing: -12.5, dist: 28.4, elev: 16, w: 0.9, h: 4.0, kind: "blade", colors: [0, 1] },
          { bearing: -1.5, dist: 29.4, elev: 21.6, w: 2.4, h: 1.0, kind: "frame", colors: [1, 3] },
          { bearing: -6.2, dist: 30.4, elev: 13.5, w: 0.45, h: 2.2, kind: "blade", colors: [1, 0] },
          { bearing: 15.5, dist: 28.4, elev: 17, w: 2.2, h: 1.4, kind: "screen", colors: [0, 3] },
          { bearing: 20.2, dist: 30.4, elev: 14.5, w: 0.7, h: 3.0, kind: "blade", colors: [2, 0], flicker: true },
          { bearing: 10.5, dist: 29.4, elev: 24, w: 2.6, h: 1.3, kind: "frame", colors: [0, 1] },
          { bearing: 26.5, dist: 29.4, elev: 18.5, w: 0.12, h: 2.6, kind: "strip", color: 1 },
        ],
      },
      // the rain's streaks catch the signs (one colour per drop), only in front of them
      // (r3) gain 0.15 -> 0.03 with the signs' level 0.03 -> 0.2 (the same light per streak)
      rain: { neon: { share: 0.1, gain: 0.03 } },
    },
  },
};

export function normalizeLook(name) {
  return LOOK_NAMES.includes(name) ? name : DEFAULT_LOOK;
}

// Rebuild the live params object in place: base -> look -> each extra layer.
export function composeParams(live, look, ...layers) {
  const next = baseParams();
  deepMerge(next, LOOKS[normalizeLook(look)]);
  for (const l of layers) if (l) deepMerge(next, l);
  return assignInPlace(live, next);
}
