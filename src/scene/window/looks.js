// The three looks (30-locked-brief.md, "The three looks"): one scene, one
// geometry, three deep patches on the base params. Switching is live: the engine
// rebuilds the params from base + look + URL ?set= + setParams() patches, in place,
// then calls every module's setLook(look).
//
// The patches only name what differs from the base. The grade and exposure parts
// (renderer, post, exposure, grade, lights, screen) are the light builder's and
// are fitted against the photos with tools/window-light/compare.py; the rest (the
// moon, the motes, the blocked panes, the glass) is what each look is.

import { baseParams, deepMerge, assignInPlace } from "./params.js";

export const LOOK_NAMES = ["dreamlike", "heightened", "photo"];
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
    exposure: { sky: { nightLift: 1.6 }, flare: { amount: 0.006 }, auto: { max: 2.2 } },
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
    lights: { moon: { intensity: 0.027 }, bounce: { day: 0.13 } },
    // sky bloom 0.2 -> 0.12: the blue hour's sky and the moon's glow bloomed into a
    // milky veil (round 2)
    sky: { tint: [1.03, 0.99, 0.97], bloom: 0.12, moon: { mode: "placed", nightAlways: true } },
    room: { window: { glass: { dust: 0.3 } }, motes: { enabled: true } },
    outside: { blocked: { open: true }, motes: { enabled: true } },
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
