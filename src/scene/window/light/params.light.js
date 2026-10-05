// Light, air and lens params for the window scene: the light rig (lights.js), the
// post pipeline (post.js), the exposure model (light/exposure.js) and the grade
// (light/grade.js). params.core.js imports these sections, so this file is their
// single source of truth; looks.js patches them per look.
//
// SCENE UNITS. The monitor's white page is 1.0 (params.screen.white scales it), so
// every luminance below is "times the monitor's white". The targets are the photos'
// RENDERED ratios (20-question-bank "Just build" 17, 13-photo-inventory 10), not
// physical ones: at 17:41 the sky is about 1.7x the monitor's white and a gold
// cloud 2.8 to 3.8x; at 18:39 the dusk sky is 1/28 of it, the lamp hotspot 1.5x,
// and the lamp-lit wood about 4x the dusk sky.
//
// Lengths in W (params.dims.W, the clear glass width of one pane) unless marked m.

export const LIGHTS_PARAMS = {
  // The desk lamp (13-photo 5, locked brief Q03). Always on, the ceiling light
  // always off (20-question Q10).
  lamp: {
    enabled: true,
    color: "#ffbe6c", // 3000 K, duv +0.003 (13-photo 5: linear sRGB 1.00, 0.52, 0.15)
    // candela in scene units at the core's peak. ONE lamp pose for every look
    // and shot (orchestrator, round 1): the shade as photographed (room
    // lamp.aim "photo", tilted 37 deg toward 40 deg in the chair's image plane).
    // Its core lands on R2's frame and the wall right of the window; trimmed from
    // 0.6 (the critic: R2's frame read flat saturated tan at 17:41)
    // (loop 2: one lamp, physical light. Under the photos' own exposure 0.45 burnt
    // R2's frame and the dome's surround 2.5 stops over in 5484. The photographed
    // pose puts the core where no photo shows a hotspot, so the fit leaves it
    // weak: 0.025, 6 cd, against the spill's 85)
    intensity: 0.025,
    // the core's cone is a little wider than the shade's rim; the gobo (below)
    // makes the rim's hard cut-off, the cone edge only has to be dark beyond it
    angle: 0.8, // rad, half-angle of the SpotLight cone
    penumbra: 0.05,
    decay: 2,
    distance: 0, // m, 0 = no cut-off
    bulb: 8, // emissive of the bulb mesh (room.js reads it; the bloom source)
    // where the core points. "anchor" follows the room's lampHead (-z of the
    // shade, the photographed pose; every look). "target" aims it at a world point
    // (W), kept for fitting experiments only; blend mixes the two
    aim: { mode: "anchor", target: [1.55, 1.6, 0.25], blend: 1 },
    // the core's gobo (spotLight.map): the shade's rim as a hard circular cut-off
    // with a bright reflector centre and a soft falloff toward the rim
    gobo: {
      enabled: true,
      rimDeg: 40, // deg, half-angle where the rim cuts the light (locked brief: about 40)
      rimSoftDeg: 1.2, // deg, width of the cut-off (bulb size over rim distance)
      hot: 1.3, // centre gain over the rim
      hotDeg: 25, // deg, half width of the reflector's hot core
      spill: 0.1, // light past the rim off the dome's lip, a share of the rim's value
      size: 256, // px
    },
    // The spill (lights.js lampSpill): the dome's white reflector throws a wide
    // lobe toward the window's stiles, the 18:40 glow on L2's hinge stile (80 deg
    // off the shade's axis, the hotspot low in row C at 84, R1's free stile at
    // 60). Its direction is fixed in the head's frame (offAxisDeg from the axis,
    // azDeg round it: 0 = the core map's +u, 90 = +v; 166 points at L2's hinge
    // stile, verified in a render), so it moves with the head. angleDeg is the
    // lobe's half-angle; its map: a soft disc (edge), brighter low (hotV) than
    // high (midV, midRatio), and the rim's hard straight cut (cutAz: the direction
    // of the dark side in the spill's own map, cutAt: where, cutSoft: how hard).
    // Fitted on ?shot=ref5482 (fix-core's solved 18:40 pose) with its regions.
    spill: {
      enabled: true,
      // (loop 2) ONE lamp for every look and shot, in physical units: fitted
      // under the photos' own exposure (light/exposure.js) against the 17:41
      // photo's R1 stile glow and 5482's lit stile at once; see intensity below
      intensity: 0.28,
      offAxisDeg: 77,
      azDeg: 166,
      // (loop 2) a WIDE SMOOTH lobe, the reflector's broad throw, not a column:
      // 68 deg half-angle with a 0.65 penumbra (full inside 24 deg, gone at 68),
      // the gobo's disc barely shaping it and no painted ramp (the stile's foot is
      // brighter than its top by distance and incidence alone, about 2 stops over
      // 3 W); the old xScale 1.5 made a stile-wide column with dark edges and a
      // white core (the art critic's "orange neon"). The two straight cuts of the
      // rim's shadow are kept, rescaled to the wider map (map units are
      // tan(theta) / tan(cone)): 0.05 and 0.27 at 32 deg are 0.0126 and 0.068 at 70
      angleDeg: 68,
      penumbra: 0.65,
      shadow: true,
      shadowMapSize: 1024, // build-time
      // how much of the spill's flux stays in the room for its bounce (lights.js
      // flux balance): it lands on the window, dark enamel (albedo under 0.1) and
      // glass that passes most of it outside; at 1 the room's return rose 5x at
      // dusk and lifted every dark frame member (5482: grid RMSE 1.33 stops)
      roomShare: 0.15,
      // the lateral ramp (rampAz 180: the lobe falls toward L2): in this map L2's
      // hinge stile spans u -0.046 to 0.033 and R1's free stile sits at u 0.13
      // (projected from the room's geometry, checked with half-map probes). The
      // photos ask for about 0.3x on L2 against R1: at 17:41 R1's stile glows
      // (wood_lamp_glow) while L2's is dark (C* 2); at 18:40 L2's stile is lit at
      // the camera's 60x exposure (5482 lit_stile_mid)
      gobo: { size: 256, edge: 0.9, xScale: 1, rampAz: 180, hotV: -0.16, midV: 0.06, midRatio: 0.2, cutAz: 185, cutAt: 0.0126, cutSoft: 0.025, cut2Az: 212, cut2At: 0.068, cut2Soft: 0.02 },
    },
    shadow: { enabled: true, mapSize: 2048, radius: 2, bias: -0.0004, normalBias: 0.004, near: 0.015, far: 1.5 }, // far: past the outside grid and the nearest canes
    // the glow the lit wood throws back (a warm point light at the hotspot: the
    // cheap stand-in for the lamp's one-bounce GI)
    bounce: { enabled: true, gain: 0.35, offset: 0.06 }, // gain of the lit patch's flux; m out from the surface
    // how much of the lamp's core lights the air (the specks)
    volume: 1,
  },

  // The key light of the sky bodies: the sun by day (a north window only sees
  // direct sun from May to July), the moon by night (Dreamlike places it in the
  // upper left panes, the others use its true direction, behind the house).
  sun: {
    enabled: true,
    // sun illuminance / pi relative to the sky's scene luminance at that hour:
    // low sun through haze is weak (17:41: the sunlit building is 1.15x monitor
    // white under a 1.7 sky, so about 2.2), a high sun about 4
    ratioLow: 2.2,
    ratioHigh: 4,
    kelvinLow: 3000, // K at the horizon (about 4000 K at 7 deg, the 17:41 sun)
    kelvinHigh: 5800, // K at 25 deg and above
    shadow: { enabled: true, mapSize: 2048, radius: 2, bias: -0.0004, normalBias: 0.01, extent: 3.5 },
  },
  moon: {
    enabled: true,
    // scene illuminance at full moon, high in the sky (Photo-true: tiny). Physical
    // light (x G at night): 0.02 at the old night exposure is 0.003 at the camera's
    intensity: 0.003,
    color: "#b7c6e6", // moonlight reads cool to a dark-adapted eye
  },

  // Skylight through the window: a RectAreaLight over the opening, facing into the
  // room, emitting the sky's scene luminance times this transmission (dusty glass
  // about 0.8, frames and bars block about a third of the opening)
  window: { enabled: true, intensity: 0.55 },
  // the monitor's glow onto the frame, the sill and the desk: a RectAreaLight on the
  // screen emitting what the screen shows. It is the main light on the frame's room
  // faces at 17:41 (the screen is 20 cm from the glass and fills their hemisphere)
  monitor: { enabled: true, intensity: 1 },
  // Room bounce: a hemisphere light standing in for the light the room returns
  // (13-photo 10: wall 0.012, i.e. about 1 percent of the window's light comes
  // back): (window + screen + lamp flux) x albedo / (pi x room area x (1 - albedo)),
  // in lights.js; lift is a look's extra ambient. A LightProbeGrid was measured
  // on this scene instead (120 probes, 8 px cubes): 189 ms per full bake, about
  // 1.7 ms per probe re-baked, on a frame that is already over budget; this
  // balance costs nothing and the room's return is small beside the lamp's own
  // bounce (lampGlow) and the monitor
  // day: the daylight room fill's gain (lights.js; 0 = the dark-room balance
  // only, Photo-true), dayTint its colour by the hour and the altitudes it rises
  // between
  bounce: { enabled: true, albedo: 0.5, roomArea: 50, lift: 0, ground: "#221a18", sky: "#d8cebf", day: 0, dayTint: { from: 8, full: 30, morning: "#c4d4ec", noon: "#e8e6e0", afternoon: "#f2d6b0" } },
  // The room's ceiling light: ON in every dusk photo (5480 to 5484), OFF for the
  // visitor (20-question Q10). lights.js builds it only for a shot whose params
  // say ceilingLight (or `always`, for experiments). pos and target in W: just
  // under the room's ceiling (18.3 W; above it the ceiling's own shadow ate all
  // of it) above and behind-left of the chair, near the line the screen glint was
  // traced along (params.screen.glint.source), aimed at the wall left of the
  // casing. kelvin is the colour AS THE PHONE RENDERED IT: the dusk photos'
  // as-shot white balance (4100 to 4240 K on 5480, 5481, 5483) was set by this
  // light, so it reads neutral to slightly cool there (7500 K here puts the cream
  // wall at the photo's chroma instead of a yellow C* 15). intensity: candela in
  // scene units on its axis, fitted on ?shot=ref5480's wall_cream (round 2:
  // -5.74 stops without it). roomShare: how much of its flux the bounce sees.
  // shotGain: the 66 mm close-ups were shot from the chair with the photographer
  // between this light and the window. Their EXIF exposes them 2.5x more than
  // 5480 (EV100 3.7 against 5.0), yet the unlit frame reads 0.009 to 0.012 in
  // 5482: at the full 5480 fit it rendered 0.04. Their body's shadow, measured.
  // (loop 2: physical light under the photos' EV100, so the old fit divided by
  // each shot's G: 9.5 / 7.7 on 5480; the chair shots' gains are the old ones
  // divided the same way, then trimmed by their old residuals on the casing and
  // rails: the photographer's body between this light and the window)
  ceiling: { enabled: true, always: false, pos: [-17, 17.6, 26], target: [-7, 0, 0], kelvin: 7500, intensity: 1.25, angleDeg: 72, penumbra: 0.75, shadow: true, roomShare: 0.5, shotGain: { ref5481: 0.9, ref5482: 0.052, ref5483: 0.116, ref5484: 0.48 } },
  // (loop 2, perf) when the shadow maps re-render (lights.js scheduleShadows): on
  // any change of their light; every *Moving-th frame while a caster's matrix
  // moves; every *Refresh-th frame anyway (what moves only in a vertex shader: the
  // bamboo in the sun, the nearest canes in the lamp's reach). enabled false =
  // every frame, as before
  // (live: the handle leaf and the bead chain rock in every gust, so the moving
  // path is the common one; a degree of rock is sub-texel over three frames)
  shadowSchedule: { enabled: true, lampRefresh: 8, lampMoving: 3, sunRefresh: 4, sunMoving: 4 },
  // lightning (20-question "Just build" 19): strikes decided in JS
  // (skyPlate.lightningAt, the sky's own u_flash clock) flash the room, frame and
  // grille through the window, bluish white
  flash: { enabled: true, window: 3, ambient: 0.1, color: "#dfe6ff" },
};

// The camera: how the scene is exposed at each hour and camera position.
export const EXPOSURE_PARAMS = {
  // THE CAMERA (loop 2, light/exposure.js "the two exposures"). One exposure chain:
  // E_true = 2^(evCal - EV100). A capture shot with a photo takes the photo's own
  // EV100 from its EXIF (13-photo 1): EV100 = log2(N^2 / t) - log2(ISO / 100);
  // 5482 adds its ProRAW BaselineExposure (+1.83) to its EXIF 1.93, which puts it
  // beside 5483 (3.66), the same framing seconds later, as its pixels show.
  // evCal: the 17:41 photo, where the model's exposure was fitted (E = 1).
  // unitCd: what one scene unit (the monitor's white page) is in cd/m2, from the
  // model's metered key at that framing (0.402) at EV100 9.615 with K = 12.5:
  // 2^9.615 x 0.125 / 0.402 = 243 (a desk monitor's white: plausible). Reported
  // in stats, not used. Live, the camera meters (adaptDay: partial, so noon reads
  // brighter than 17:41; adaptNight: nearly full below keyNight, so the camera
  // opens up at dusk as the 18:40 photos did, EV100 3.6 to 5.0).
  camera: {
    evCal: 9.615,
    unitCd: 243,
    shots: { ref1741: 9.615, ref5480: 4.986, ref5481: 4.308, ref5482: 3.757, ref5483: 3.664, ref5484: 3.571 },
    adaptDay: 0.45,
    adaptNight: 0.95,
    keyNight: 0.02,
    maxTrue: 256,
  },
  // Sky luminance in scene units by sun altitude (deg), for the reference sky
  // (partly cloudy), averaged over the plate from the horizon up. Knots measured
  // against the photos: +7 deg (17:41) = 1.7; -7.2 deg (18:39) = 0.036. Checked in
  // a clean 18:39 Photo-true render (runs/light/ratios): the panes read 1/20 of
  // the monitor's white (photos 1/28) and the lamp-lit wood 3.5x to 5.7x the sky
  // (photos about 4x); halving this knot gives 1/35 and 6x to 10x. Between and beyond,
  // twilight falls about a decade per 4.5 deg of depression; the night floor is
  // Bangalore's skyglow on a partly cloudy night. A weather preset changes the
  // plate, and the plate's ratio to its own reference at that altitude carries
  // through (overcast nights come out brighter: city light on the deck).
  // With this on, params.sky.gain and params.sky.nightGain (params.core.js) are
  // not used: the gain is this curve over the plate's own reference brightness.
  sky: {
    enabled: true,
    // (round 2: the high sun's knots up, 2.8 and 3.0 -> 3.1 and 3.6: a north sky
    // under a noon sun is several times a golden hour's, and with the old flat top
    // 09:00, 12:00 and 15:00 exposed to the same frame)
    // (loop 2, one exposure chain: the knots below the horizon are PHYSICAL now.
    // Under the photos' own EV100 the 18:39 shots put the dusk sky at 0.0014 to
    // 0.0028 (5480 to 5484 against their panes; 0.0017 = 0.4 cd/m2 at 243 cd/m2 a
    // unit); twilight rises about 0.4 decades a degree above it, which lands on
    // the old -1.3 knot; the night floor is a city sky, 0.00023 = 0.06 cd/m2
    // (Bortle 8), the old displayed night at the camera's night exposure. The day
    // knots are unchanged: there the camera is the old one)
    alt: [-30, -18, -12, -7.2, -5, -1.3, 2.4, 7, 17, 30, 55],
    lum: [0.00023, 0.00026, 0.00064, 0.0017, 0.013, 0.45, 1.0, 1.7, 2.3, 3.1, 3.6],
    nightLift: 1, // Heightened and Dreamlike lift the night sky so the bars read against it
  },
  // Auto exposure, analytic and deterministic: a key luminance estimated from what
  // the camera sees (the window opening, the monitor and the room, projected every
  // frame), then E = bias x (key0 / key)^adapt, clamped. Partial adaptation: at
  // dusk the monitor is the brightest thing and the phone exposed it near white
  // (18:40 photos), at noon the sky takes the top.
  auto: {
    enabled: true,
    bias: 1.0, // the look's exposure trim sits in renderer.exposure; this is the model's own
    key0: 0.42, // the key at the 17:41 reference framing (E = bias there)
    adapt: 0.45, // 0 = fixed exposure, 1 = full adaptation
    min: 0.55,
    max: 3.2, // the 18:40 photos: the lamp-lit stile displays at about 3x its 17:41 exposure
    hi: 1.6, // the mean of the brightest large area in frame stays under this after exposure
    screenKey: 0.75, // the screen counts as at least this share of its white (the light page's mean)
    roomLum: 0.02, // what the dark room returns, scene units
    frameCover: 0.35, // share of the opening that is frame and bars
    // the dusk boost: the exposure multiplied by up to this as the sun sinks from
    // duskFrom to duskTo deg (the phone opening up; the screen's floor above
    // otherwise pins a dusk frame near its 17:41 exposure)
    duskBoost: 1,
    duskFrom: 1,
    duskTo: -6,
  },
  // a uniform veil: a fraction of the frame's mean light (the key) added to every
  // pixel before exposure, the lifted blacks of a phone's lens and processing (the
  // photo's darks all sit at 0.012 to 0.016 of display white). The halo around
  // the window is post.glare
  flare: { amount: 0.0, color: [1, 0.98, 0.95] },
  // the exposure's trim in weather (stops): the camera does not expose a storm
  // back to a bright day, so the room reads about a stop down and the lamp leads
  weather: { rain: -0.3, storm: -0.8 },
};

export const POST_PARAMS = {
  // scene pass resolution as a fraction of the drawing buffer when no quality
  // tier is set; the HiDPI value applies at DPR 1.75 and above (DPR 2 at 0.7
  // renders 1.4x the CSS size)
  resolutionScale: 1,
  resolutionScaleHiDpi: 0.7,
  // the HiDPI tier (DPR 1.75 and up): cheaper settings where the eye cannot tell
  hiDpi: {
    volumeScale: 0.25, // the air's pass, of the drawing buffer (not of the scene pass)
    volumeSteps: 10,
    aoSamples: 8,
  },
  // screen-space AO from the scene pass depth and normals
  ao: {
    enabled: true,
    radius: 0.05, // m, sample radius in view space
    intensity: 1.4, // SSAO occlusion gain
    strength: 0.75, // 0..1, how much of the AO reaches the image
    resolutionScale: 0.5, // fraction of the drawing buffer
    samples: 16,
  },
  // The quality tiers (params.quality: high | mid | low, chosen at start from the
  // GPU and the viewport). density = scene-pass pixels per CSS pixel (the pass
  // renders at density / DPR of the drawing buffer, TAAU upscales below 1), the
  // air's pass as a fraction of CSS pixels, its ray-march steps, the AO's samples
  // (0 = off), and which optional stages run. Without params.quality the DPR rule
  // above applies (resolutionScale / resolutionScaleHiDpi).
  tiers: {
    high: { density: 1.4, volumeScale: 0.5, volumeSteps: 12, aoSamples: 12, bloom: true, dof: true, spillShadow: true },
    mid: { density: 1.0, volumeScale: 0.35, volumeSteps: 10, aoSamples: 8, bloom: true, dof: true, spillShadow: true },
    low: { density: 0.75, volumeScale: 0.25, volumeSteps: 6, aoSamples: 0, bloom: false, dof: false, spillShadow: false },
  },
  // selective bloom: only what materials write into the MRT emissive target (the
  // sky, the screen, the bulb, glints, motes). height: its source's height in
  // texels (fixed, so its reach is the same share of the frame at any DPR)
  bloom: { enabled: true, strength: 0.35, radius: 0.45, threshold: 0.05, height: 450 },
  // veiling glare (light/lens.js): a linear PSF. core, mid and tail
  // are the shares of every pixel's light scattered into a tight core (about 0.7%
  // of the frame height), a mid halo and a long faint tail; midSigma and
  // tailSigma (whole numbers, a rebuild) size them: (3 + 2 x sigma) / 3 texels of a
  // 216 and a 54 texel high image (3: 1.4%, 5: 8%, 18: 24% of the frame height),
  // midSpread and tailSpread stretch them live; tint is the scattered light's colour. threshold (exposed scene
  // units, soft over x1.5): only light above it scatters, 0 = all of it. All
  // lobes 0 = not built
  glare: { enabled: true, core: 0, mid: 0, tail: 0, midSigma: 3, tailSigma: 5, midSpread: 1, tailSpread: 1, threshold: 0, tint: [1, 1, 1] },
  // the local tone map (light/lens.js): an edge-aware lift of the shadows, up to
  // `lift` stops where the base layer is below `lo`, none above `hi` (exposed
  // scene units), fading out below `floor` (blacks stay black); and a pull of
  // up to `pull` stops on a bright base (none below pullLo, all above pullHi):
  // the phone holding its sky. eps (stops^2) is how much local contrast counts
  // as texture (kept as detail) rather than an edge; spread widens the
  // neighbourhood (5% of the frame height at 1). lift and pull 0 = not built
  localTone: { enabled: true, lift: 0, lo: 0.012, hi: 0.08, floor: 0.001, pull: 0, pullLo: 1, pullHi: 2, eps: 0.25, spread: 1 },
  // the tone curve: "renderer" (params.renderer.toneMapping, AgX) or "phone" (per
  // channel, linear to knee x clip, a hard shoulder to display white at clip in
  // exposed scene units, clipped above: a phone camera's rendering)
  tone: { curve: "renderer", clip: 2.0, knee: 0.5 },
  // depth of field. focus comes from the camera path (camera.js), focusOffset
  // nudges it; focalLength is how far from the focal plane (m) a surface goes
  // fully soft; bokehScale is the blur size (unitless)
  dof: { enabled: true, focusOffset: 0, focalLength: 0.9, bokehScale: 2.5 },
  traa: { enabled: true },
  // (loop 2, perf) passes that skip frames: the AO every other frame while the
  // camera rests; the air not drawn on the low tier at the hero (p under 0.08)
  skip: { aoAtRest: true, airLowHero: true },
  // the air: the lamp's beam and the dust in the room, ray-marched with
  // VolumeNodeMaterial in its own low-resolution pass, blurred, added before AA
  volume: {
    enabled: true,
    resolutionScale: 0.5, // of the scene pass (0.25 on the light tier)
    steps: 14,
    density: 1.0, // overall air density (scattering)
    dust: 0.55, // 0..1 how clumpy the dust is (3D noise contrast)
    drift: 0.004, // m/s the dust drifts on its own (plus the wind through the ajar leaf)
    strength: 1.0, // how much of the volume reaches the image
    windowLight: 0.15, // how much the window's skylight lights the air (the lamp is 1)
    blur: 1.5, // gaussian sigma of the denoise, in volume texels
    // the air that can be marched (W): from the glass into the room; each frame
    // the march is fitted to the lamp's cone out to beamReach (m) inside it
    box: [-7, 8, -3.5, 8.5, -0.3, 7.0], // x0, x1, y0, y1, z0, z1
    fitBeam: true,
    beamReach: 0.4,
    // floating specks lit by the beam (instanced; brightness from the lamp on the CPU)
    specks: { enabled: true, count: 220, size: 0.0009, gain: 1.0 },
  },
  // display-space grain after tone mapping; 0..1 of a code value step
  grain: { enabled: true, amount: 0.03 },
  // the hand-off to the page ground (#ffffff light, #0e0e11 dark)
  handoff: {
    screenStart: 0.82, // p where the screen's light starts rising to the page ground
    screenEnd: 0.985, // p where it has reached it
    finalStart: 0.94, // p where the last display-space mix to the exact ground starts (reaches 1 at p = 1)
    bookendEnd: 0.16, // p2 by which the bookend has left the ground again
    // the page on the screen (post.js): from `from` to `to` along the runway the
    // monitor's own pixels leave the look (veil, lift, grain, vignette, the tone
    // curve) and show the page 1:1, up to `max`; on the bookend the reverse, from
    // bookendFrom to bookendTo. So at p = 0.75 the screen already reads as the
    // page ground (light 245 and up, dark under 30 of 255: the art critic's
    // round-2 gate) and the hand-off is the room falling away, not a fade
    page: { enabled: true, from: 0.5, to: 0.8, max: 1, bookendFrom: 0.16, bookendTo: 0.45 },
  },
};

// The grade, per look (light/grade.js). Scene-linear stages run before the tone
// mapper (renderer.toneMapping), display stages after it.
export const GRADE_PARAMS = {
  // scene-linear
  whiteBalance: [1, 1, 1], // rgb gains (a warm camera white point is > 1 red, < 1 blue)
  saturation: 1, // around the pixel's luminance
  contrast: 1, // around mid grey, in log2 (1 = none)
  mid: 0.18, // the contrast pivot, scene units
  // The sky's colour (light/grade.js updateSkyGrade): the Living Sky plate keeps
  // its luminance and takes the hour's colours from `keys` (display hex, only the
  // hue and chroma are used), by the sun's altitude: the sky's zenith and
  // horizon, sunlit cloud tops and cloud bases. Lab hues are in the comments
  // (measured, sRGB D65): day zenith 248 to 255, blue hour 264 to 276, night 264
  // to 266, the golden tops 84 to 87. A north window never sees the sunset
  // itself, so its dusk is blue, never salmon (18:39 photo: slate blue #354453).
  //   recolor  0 = the plate as drawn, 1 = the table's colours
  //   chroma   the table's chroma (a look pushes it; AgX greys bright colours)
  //   gold     the sunlit tops' chroma; litGain their brightness in the golden
  //            hour (above 1 they clip, as 21% of the photo's gold panes do)
  //   dawn     what the morning bends toward at the same altitudes (pinker,
  //            paler); haze the afternoon's pale warm haze (15:00 against 09:00)
  //   greyDesaturate  how far a full deck or rain greys the colours
  //   weather  the whole sky's brightness under a deck, in rain, in a storm
  sky: {
    recolor: 0,
    chroma: 1,
    gold: 1,
    litGain: 1,
    saturation: 1,
    contrast: 1,
    horizonTop: 0.35, // plate v (elevation / 75 deg) where the horizon colour gives way
    cloudLo: 0.95,
    cloudHi: 1.4,
    litLo: 1.25,
    litHi: 2.1,
    greyDesaturate: 0.9,
    // grey plate pixels count as cloud too (light/grade.js): the undersides take
    // cloudBase, not the sky's blue
    satCloud: 1,
    // (loop 2) the cloud mask from the plate's own cover (the window build's
    // alpha), not from luminance ratios: soft cloud edges instead of cut-outs
    plateCloud: 1,
    // (loop 2) the horizon band as haze: below hazeTop (plate v; 0.08 = 6 deg)
    // sky and cloud fade toward the horizon colour, hazeBand of the way (not
    // `haze`, which is the afternoon's colours below)
    hazeBand: 0.45,
    hazeTop: 0.08,
    keys: [
      // night and twilight keys sit about 25 deg cyan of their targets: AgX with a
      // look's chroma push turns deep blues toward violet (measured: key 253 came
      // out 283 in Heightened at 21:00)
      { alt: -30, zenith: "#0a2a34", horizon: "#0e3040", cloudLit: "#34404e", cloudBase: "#16222e" }, // night: navy (232 to 246)
      { alt: -12, zenith: "#0c2c38", horizon: "#123a48", cloudLit: "#3e4c5e", cloudBase: "#1a2838" }, // astronomical dusk
      { alt: -6, zenith: "#1a4a5e", horizon: "#1c4a64", cloudLit: "#4a5a70", cloudBase: "#243448" }, // blue hour (242 to 252): the 18:39 photo's slate #354453 is 261
      { alt: -2, zenith: "#30587a", horizon: "#5a86a8", cloudLit: "#7a8aa0", cloudBase: "#44546a" }, // civil twilight
      { alt: 1, zenith: "#4a7898", horizon: "#a8b8c8", cloudLit: "#e0c0b0", cloudBase: "#687890" }, // the sun on the horizon
      // golden hour: gold tops (84) in a pale blue (249) over grey-lilac bases
      // (the 17:41 photo's cumulus: shaded grey-violet under the gold, round 2)
      { alt: 5, zenith: "#7cc4f0", horizon: "#cfe0ee", cloudLit: "#ffd890", cloudBase: "#a09cb4" },
      { alt: 12, zenith: "#7cc4f0", horizon: "#cfe0ee", cloudLit: "#fff0d0", cloudBase: "#a8acc0" },
      { alt: 30, zenith: "#7cc4f0", horizon: "#b4d4ec", cloudLit: "#f8f4ec", cloudBase: "#a8b8c8" }, // day (249)
      // noon: the high sun's haze pales the north sky toward white (round 2)
      { alt: 70, zenith: "#88c2ec", horizon: "#d2e0ea", cloudLit: "#fbf9f4", cloudBase: "#b0bccb" },
    ],
    // the clear morning (before about 10:30, sun 15 to 50 deg): a deeper, cleaner
    // blue than the hazy afternoon at the same altitude
    morning: { mix: 0.55, zenith: "#4c9ee6", horizon: "#b8d4ee" },
    // the morning, at the same altitudes as the evening: pinker, paler
    // (round 2: a pink wash with pink blobs read as no dawn at all; the low sun
    // gilds the cloud bases peach-gold and warms the horizon)
    dawn: { mix: 0.6, desaturate: 0.15, horizon: "#e8c4a8", cloudLit: "#f6c49c", cloudBase: "#b49ca8", zenith: "#6a90b0" },
    // the afternoon haze: paler and warmer than the morning (15:00 against 09:00)
    haze: { mix: 0.6, horizon: "#e6d6c8", zenith: "#a0b8d0" },
    // the whole sky's brightness under a full deck, in rain, in a storm (the
    // storm: the sky at L* 40 to 55, the lamp the warm key of the room)
    weather: { overcast: 0.4, rain: 0.45, storm: 0.2 },
  },
  // the hour's white point (post.js; amount 0 = none, Photo-true): rgb gains in
  // the clear morning and in the afternoon, eased by the hour and the sun
  hourWB: { amount: 0, morning: [0.96, 1.0, 1.05], afternoon: [1.05, 1.0, 0.94] },
  // the hour's light (post.js; null = none, Photo-true): noonEV stops brighter,
  // noonDesat and noonFlat paler and flatter as the sun climbs from noonFrom to
  // noonTo deg; amSat and amContrast the clear morning's crispness
  hour: null,
  // display space
  displaySaturation: 1, // after the tone mapper (AgX greys bright colours)
  lift: 0, // added to the blacks, 0..0.05
  gamma: 1,
  vignette: 0, // 0..1 corner darkening
  vignetteRound: 0.65, // 0 = rectangular .. 1 = round
};
