// Outside params: everything beyond the glass (outside.js and outside/*.js).
// Near things that belong to the house (the box grille, the blocked plane) are in
// W (params.dims.W); everything else is in metres, because the bamboo, the trees
// and the building do not scale with the window. Colours are display hex (sRGB).
// World frame: x right (east), y up (0 = the sill top), +z into the room, the
// glass of the left pair at z = 0; outside is -z (north). Bearings in degrees from
// north (0) toward east (90), measured from the world origin.

export const OUTSIDE_PARAMS = {
  // the brown flat-bar box grille beyond the glass (outside/grid.js has the fit):
  // ONE flat plane across the whole window, turned in plan, a near-square mesh of
  // 13 mm flats and one long brace. Positions are WORLD x and y in W (the plane
  // puts each at its own depth); depth is the plane's distance at x = pivot.
  grid: {
    enabled: false, // removed (Agam, 2026-09-27: "remove the cross-check metal rail outside the window")
    depth: 4.2, // W beyond the L glass at x = pivot (38 cm)
    pivot: 0.5, // W
    planDeg: 11.3, // deg: the plane's right end comes toward the house (fit: 2.0 px rms against 6.7 parallel)
    pitchX: 1.16, // W of world x between verticals (fit on L1, L2 and R1)
    firstX: 0.55, // W, the vertical seen in L1 (image x 900 to 908 at 17:41)
    pitchY: 1.1, // W between horizontals (fit on L1, L2 and R1)
    firstY: 3.474, // W, a horizontal (L1 and L2 row B, image y 463 to 469)
    // W, flat width. 0.125 W = 11 mm (loop round 2): in 5481, the sharpest look at the
    // bars (50 mm eq, 1.3 m away, lit tan by the room), a bar is 0.13 of the lattice's
    // pitch edge to edge (horizontals 21 px against a 163 px pitch at 1200 x 1600);
    // 0.148 W rendered 0.153 (26 against 170)
    bar: 0.125,
    thick: 0.05, // W
    // the frame and both returns sit outside the views through the L pair (checked
    // for the round-1 p = 0 framings, the phone's, the 17:41 reference and the closing
    // shot: through the L pair they reach x -3.4 to 12 W, y -3.3 to 12 W); the right
    // end falls between the 17:41 view through R1 (to x 6.31) and through R2 (from
    // 6.98), so Photo-true R2 keeps the photo's bare dark stipple. From the hero, which
    // looks through R1 and R2, the end shows through R2: a real box ends somewhere.
    bottom: -3.8, // W
    top: 13, // W
    leftStart: -4.0, // W
    rightEnd: 6.65, // W, world x
    // the one brace, [x0, y0, x1, y1] in W on the plane (extended both ways and
    // clipped to the frame): backprojected from L1 row B (813, 303) and L2 row C
    // (1075, 659) in ref_1600, one straight member
    diagonals: [[-0.535, 5.544, 2.462, 1.072]],
    // flat tan paint (loop round 2). In 5481 the bars' faces read 1.3x the sky through
    // the same glass (sRGB about 113 90 75 against 80 82 87), clean and flat, with a
    // dark line down each edge; the old #4b3527 enamel (albedo Y 0.04) read 0.5x. At
    // 17:41 they stand in the house's shade against the sky, so this barely lifts them
    // there (ref: L1's vertical 177 against a 211 sky in the photo). The stipple on
    // them in the photos is the glass dust in front, not the paint.
    color: "#6f5a49", // albedo Y 0.11
    edge: 0.45, // how much darker the flat's face runs along its two long edges (the paint's rolled edge, the flat's side in shadow)
    roughness: 0.6,
    // its room-facing side sees the house wall and a strip of sky, not the open sky:
    // at 17:41 the bars are near silhouettes with a thin sky-lit edge
    ambient: 0.25,
    dripSpan: [-2.2, 6.0], // W of world x where drips can form (the part any frame sees)
  },

  // the grey far-right column: a dark flat plane just past the grille; Dreamlike
  // opens it (locked brief, "blocked panes opened")
  // plane: false leaves it to the room's blocked plane (room/window.js, which the look
  // opens too): this one, 4.6 W behind R2, landed beside the pane and in front of the
  // grid's right end. depth stays defined so the room's `auto` rule keeps its own.
  blocked: { open: false, plane: false, depth: 4.6, color: "#1e201f", ambient: 0.5 }, // W beyond R2's glass; in the house's shade

  // the bamboo clump (outside/bamboo.js)
  bamboo: {
    enabled: true,
    center: { bearing: 42, dist: 2.35 }, // deg, m from the origin: seen through R1 and R2 from the chair
    spread: 0.5, // m, radius of the clump's base
    leanBias: [0.35, -0.3], // added to each cane's outward lean: to the right and away from the house
    window: [-1.2, 1.6], // m above the sill: the heights the chair sees through the panes
    minBearing: 25.5, // deg from north as seen from the chair: canes stay right of the left pair there
    canes: 15,
    height: [7.5, 10.5], // m from the ground
    radius: [0.022, 0.033], // m at the base
    leanDeg: [2, 10],
    arch: [0.2, 0.9], // how far the tops roll over
    internode: [0.2, 0.42], // m
    branchFrom: 0.34, // fraction of the cane's length where branches start
    branchLen: [0.3, 0.85], // m
    leafLen: [0.13, 0.22], // m (bamboo leaves 10 to 25 cm)
    leafWidth: [0.016, 0.026], // m
    leafDensity: 1.0,
    denseFrom: -0.3, // m above the sill where leaves start to thicken
    denseFull: 1.4, // m above the sill where the crown is full
    dryFraction: 0.05, // straw-yellow dead leaves
    maxLeaves: 4200,
    quality: { high: 1, mid: 0.75, low: 0.45 }, // share of maxLeaves per params.quality
    // culms that arch over toward the left pair: their hanging sprays are the
    // "faint strands" at the right edge of L2's top pane, and put bamboo in p = 0
    arching: [
      {
        root: [1.5, -1.95],
        tip: [0.2, 2.1, -1.55],
        bow: 1.5,
        leanDeg: 3,
        radius: 0.026,
        age: 0.2,
        // its upper part (past `from` of its length) throws long branchlets toward
        // `toward` (x, z) that hang `droop` of their length down
        hang: { from: 0.75, toward: [-0.7, 0.35], length: 1.1, droop: 1.35, density: 1.4, spray: true },
      },
      // loop round 2: the hero (p = 0) now focuses on the glass and the handle leaf, so
      // the clump 2.3 m out is soft there. A second culm arches over toward the house
      // and passes just above the view, 0.6 m out (behind the grille, inside the depth
      // of field's near-sharp band); its branchlets hang into the top panes of L2 and
      // R1, the band above the page's text, and flutter there (the photo's "faint
      // arching strands at the right edge of L2's row A"). Dreamlike only, with the spray
      {
        root: [0.95, -2.35],
        tip: [0.1, 0.8, -0.5],
        bow: 1.2,
        leanDeg: 2,
        radius: 0.018,
        age: 0.35,
        hang: { from: 0.72, toward: [-0.45, 0.55], length: 0.7, droop: 1.5, density: 2.4, spray: true },
      },
    ],
    sway: 1.0, // multiplier on the wind response
    ambient: 1.0,
    sun: 0.5, // share of the outdoor sun (unshadowed) on top of the scene's shadowed sun
    transGain: 0.4, // how much of the key light comes through a leaf seen against it
    cap: 0.95, // a leaf's lit radiance tops out softly at this x the horizon sky's luminance (common.js outdoorMaterial)
    shadows: true, // canes and branches cast into the key and lamp shadow maps
    leafShadows: false, // leaves too (the costliest part of the clump; measured)
    colors: {
      cane: "#56792f",
      caneOld: "#8a9444",
      wax: "#b8c4a0",
      sheath: "#8c7650",
      branch: "#6d7f3a",
      leaf: "#4a7a28",
      leafYoung: "#8cb03c",
      leafUnder: "#9db07a",
      leafDry: "#b8a468",
      trans: "#b8d84a",
    },
  },

  // the street trees across the road (the canopy in row C at 17:41)
  canopy: {
    count: 9,
    bearing: [-50, 21], // stops left of the building (R1 row B shows its face clear)
    distance: [9, 15], // m
    radius: [2.2, 3.6], // m, crown half-width
    squash: [0.6, 0.85], // crown half-height / half-width
    top: [0.7, 2.4], // m above the sill: the crown tops (6 to 10 deg from the chair)
    card: 0.9, // m, leaf clump card
    cardsPerM3: 11,
    maxCards: 380,
    quality: { high: 1, mid: 0.8, low: 0.55 }, // share of maxCards (street and horizon trees) per params.quality
    // "lambert" (loop round 2): diffuse only. At 9 to 37 m behind dusty glass a leaf's
    // specular is nothing a camera resolves, and the low sun's glints on the cards were
    // the hot yellow points the DOF's gather turned into ringed blobs (ref 17:41, L2
    // row C: 5.3 % hot yellow pixels against the photo's 0.8 %); cheaper too.
    // "standard" and "sss" are still accepted
    kind: "lambert",
    // a far leaf never outshines the horizon sky it stands against: a soft ceiling at
    // cap x the horizon sky's luminance (common.js outdoorMaterial cap)
    cap: 0.85,
    fill: 0.56, // cellular threshold in a clump's middle (0.18 at its rim): how solid a crown reads
    trunk: 0.14, // m, trunk radius
    colors: ["#5c9a38", "#4c8a34", "#68a63e", "#46802f"],
    light: "#86c04c",
    trans: "#b0d850",
    wood: "#3b3128",
    leafCells: 12,
    transGain: 0.2, // light through the canopy's leaves (small: a crown is many leaves deep)
    // loop 2 (gold dots): the crown's shaded inside, a lumpy ellipsoid at `core` of its
    // radii (the cards sit mostly outside 0.6 of it: they are drawn toward the skin),
    // its colour the crown's darkened to coreDark. A gap in the clumps now shows the
    // crown's inside, as a real crown many leaves deep does; the sky shows only at the
    // silhouette. 0 turns it off (outside/farTrees.js crownCore)
    core: 0.8,
    coreDark: 0.72,
    coreWarm: 0.8,
    coreAmbient: 0.75, // the sky a crown's inside sees, of what its skin sees
    coreSun: 1.3, // sunlight through the leaves around it: this x U.farSun (the sun's colour at the sky light's level) on its sun side
    stiff: 2.2,
    // loop 2: 0.25 -> 0.04. Every card fluttered as one rigid 0.9 m clump at 3 to 5 Hz
    // (the leaves' own oscillator), 2 px at the hero: with the gold holes, 21 to 30 %
    // of the tree box changed in every 0.2 s. A clump sways with its branch (about
    // 1 Hz, common.js windOffset's branch term); its leaves flicker below a pixel.
    flutter: 0.04,
    // of the bamboo's (their stiffness, stiff 2.2, already halves it): a storm gust
    // moves a crown's top about 20 cm, a 22 km/h one about 6 cm (it was 0.8: 2.5 px at
    // the hero in the partly preset, read as static)
    sway: 1.6,
    // the crowns' shimmer as a gust passes (leaves flipping): albedo +- this x gust x
    // strength, per leaf-clump card (loop 2: gust-only and 3 to 4.6 Hz; it was 0.12 x
    // (0.25 + gust x strength) at 5.5 Hz, a steady flicker)
    shimmer: 0.08,
    street: 1, // share of the white-LED street lights it takes (outside.city.street)
    coreStreet: 0.15, // of that, what reaches a crown's inside (its outer leaves shade it)
    ambient: 1.25,
    // NIGHT (loop round 2: "the street trees at night still read as white foam"). From
    // civil twilight on (U.night) the crowns take nightAmb of the plate's ambient,
    // nightDark of their albedo, leaning to nightTint (blue-black); the placed moon
    // stands behind them (they are backlit), so only a thin rim on their silhouettes
    // catches it: rim x (1 - |n.v|)^rimPow, on the crowns' own sphere normals
    nightAmb: 0.3,
    nightDark: 0.3,
    nightTint: "#44505f",
    rim: 0.25,
    rimPow: 5,
  },
  // the larger trees behind, on the horizon (hazed by the visibility)
  farTrees: {
    count: 26,
    bearing: [-78, 78],
    distance: [20, 37], // m
    radius: [3, 5.5],
    squash: [0.55, 0.8],
    top: [1.0, 3.2],
    card: 1.8,
    cardsPerM3: 1.8,
    maxCards: 120,
    trunk: 0.25,
    colors: ["#7c9650", "#718b49", "#88a05a"],
    light: "#a3b86a",
    trans: "#c8e060",
    stiff: 2.6,
    flutter: 0.03, // loop 2: 0.2 -> 0.03 (see canopy.flutter)
    core: 0.75,
    coreDark: 0.6,
    // loop 2 ("soften the far trees into haze"): the horizon trees take this x the
    // air's haze (20 to 37 m: 3 x 1 - exp(-d / 400 m) is 14 to 24 %), their clumps
    // flat (no leaf cells: they never resolve through the lens), no shimmer
    haze: 3,
  },
  // the sunlit cream building seen through R1 row B, with its red-orange patch
  building: {
    // its facade: 10 m from the chair at bearing 41, square to the chair, spanning
    // bearings 26 to 56 as seen from there (right of the left pair, so the L pair's
    // row B keeps its clouds); the box's centre sits half its depth further back
    bearing: 42.5, // deg from the origin to the box's centre
    dist: 13.3, // m
    faceBearing: 221, // the facade looks this way (at the window; the western sun lights it)
    width: 5.5,
    depth: 8,
    roofY: 4.3, // m above the sill: its parapet reads 19 deg up from the chair (three storeys)
    storey: 3.1,
    bay: 2.9,
    bayOffset: 0.6,
    window: [1.25, 1.35], // m
    sillH: 0.9,
    color: "#f0d8a2",
    chajja: "#d2c5a5",
    grille: "#2a2622",
    ambient: 1.2,
    // where the chair saw it: bearing and elevation of its centre (13-photo 9)
    patch: { bearing: 32.5, elevation: 14, size: [0.31, 0.75], color: "#cf5a2c" }, // measured on ref_1600: x 1300, y 390 to 470
    // loop 2, NIGHT: its windows lit, a share of them by the hour (outside.city.windows,
    // the same windows stay lit as the share falls). level: scene units at the window
    // (a lit room seen from 13 m is 10 to 50 cd/m2 against an urban night sky's 0.01 to
    // 0.1: it clips and blooms; the DOF makes it a soft bokeh); warm filament and CFL
    // white or the cool white of an LED tube light (coolShare of them)
    lit: { level: 0.09, warm: "#ffc58a", cool: "#eaf1ff", coolShare: 0.45, seed: 3.7 },
    // a look's repaint of the plaster and the chajjas (live; amount 0 = none)
    paint: { color: "#ffffff", amount: 0 },
    street: 1,
  },
  wall: { x: 0, z: -3.9, length: 16, height: 1.7, color: "#d8cdb4", ambient: 1.0, street: 1 }, // the compound wall
  ground: { y: -4.5, radius: 38, color: "#3d3a2c", color2: "#4b4a31", road: [5.0, 10.5], roadColor: "#3d3d3b", ambient: 1.0, street: 1 }, // m

  // THE FAR EDGE (loop 2, outside/horizon.js): what a gap between the street crowns
  // shows, instead of the bare plate the 17:41 grade paints gold. A band 38.5 m out
  // (inside the 40 m dome), bearings and elevations in degrees seen from the window:
  // a hazy treeline (treeTop, with single crowns crownDeg high) and here and there a
  // mid-rise block over it (blocks: the share of blockDeg-wide bearing segments that
  // carry one, its roof at blockTop), then a veil of the horizon's own haze above it
  // (veil at the line, e-folding over veilDeg; the pale band of a hazy city horizon).
  // At night: the city's glow in the low air (outside.city), lit windows in the blocks
  // and a few among the trees (windows: cells of cellDeg, level in scene units).
  horizon: {
    enabled: true,
    radius: 38.5, // m
    bearing: [-100, 115], // deg
    elev: [-8, 24], // deg (the city's glow reaches well up a hazy sky)
    treeTop: [2.2, 4.0], // deg, the treeline's stands (the horizon trees at 20 to 37 m top out at 2 to 5 deg from the chair)
    crownDeg: 0.9,
    blockDeg: 4.5,
    blocks: 0.3,
    blockTop: [4.2, 6.6], // deg: a 6 to 10 storey block 250 to 400 m away
    blockWide: 0, // added to each block's share of its segment (0.35 to 0.8; at most 0.98)
    storeyDeg: 0.55,
    treeColor: "#6f8752",
    blockColor: "#cfc7b6",
    ambient: 0.6, // a vertical surface sees about half the sky
    sun: 1.2, // the low sun on the side facing it, x the sky light's luminance (U.farSun)
    haze: 0.55, // the air between: most of a far treeline's colour is the haze's
    veil: 0.75,
    veilDeg: 3.5,
    veilGain: 1.0,
    veilTint: [1.04, 1.0, 0.92], // the low haze lit from the side by a low sun is warmer than the sky's mean
    // a city of 13 million under hazy air: its glow over the horizon is several times
    // the zenith's and still about twice it at 20 deg (a Bortle 8 to 9 sky)
    glowFrom: 2.0, // deg: the city's glow is full below this and thins above it
    glowDeg: 11,
    glowOnSolid: 0.35, // how much of it lies over the silhouette (the air in front of it)
    // size: a lit window's own size (deg: 1.2 x 1 m at 250 to 300 m); at the hero it
    // is drawn as the lens's bokeh disc (horizon.js), so cells leave room for it
    windows: { cellDeg: [0.6, 0.46], size: [0.2, 0.16], density: 1.0, amongTrees: 0.16, level: 0.08, warm: "#ffb46b", cool: "#e6efff", bloom: 1.5 },
    // neon trims (Cyberpunk): a tube along a share of the blocks' rooflines, inset deg
    // under the roof, and down a corner on some, in one of two colours, at night
    // (level x the light gain, like the windows; bloom x it into the bloom). level 0
    // = none (horizon.js: the term is exactly 0)
    trim: { level: 0, share: 0.5, inset: 0.3, colors: ["#ffffff", "#ffffff"], bloom: 0 },
    // the murk (Cyberpunk; absent here = none): the weather's cloud deck and rain lit
    // from below by the city (outside.js U.murk): cloud x the deck's cover (0.45 to
    // 0.95) plus rain x the wetness (x storm in a storm), at most 1; the towers fade
    // into it above base deg (over depth deg); glow x the city's glow in its colour
    murk: null,
  },

  // THE CITY AT NIGHT (loop 2, outside.js): the local hour of the sky shown drives it.
  //   windows  share of windows lit, [hour, share] knots over the day (0 to 24): the
  //            evening peak at 20:00, most dark by 01:00, a few again before dawn
  //   glow     the urban skyglow in the low air, [hour, x] knots, times glowRel x the
  //            night sky's own light (so a city under cloud, which the plate already
  //            draws brighter, glows more), in glowColor (the low air over a mostly
  //            white-LED city with some sodium left: warm grey)
  //   street   the white-LED street lights, dusk to dawn: level (scene units of
  //            illuminance x m^2), poles [bearing deg, distance m, head height m above
  //            the sill, output], heads drawn with headLevel x the level on their lit
  //            underside, arm m
  city: {
    enabled: true,
    windows: [[0, 0.2], [1, 0.12], [3, 0.06], [5, 0.08], [6, 0.18], [7, 0.1], [17, 0.12], [18.5, 0.45], [20, 0.62], [22, 0.52], [23, 0.35], [24, 0.2]],
    glow: [[0, 0.7], [1, 0.6], [3, 0.5], [5, 0.55], [6, 0.7], [18, 1], [21, 1], [22, 0.95], [23, 0.82], [24, 0.7]],
    glowRel: 3.0,
    glowColor: "#c49a82",
    street: {
      level: 0.8,
      color: "#e9efff",
      // off to the sides of the left pair's view (the hero sees bearings -18 to 21
      // through it), so the crowns there take a raking pool that falls off toward the
      // middle of the view instead of a flat wash; the second lights the building
      // and the bamboo from behind
      poles: [
        [-30, 11, 1.2, 1],
        [28, 10.5, 1.4, 1],
        [-62, 12, 1.4, 1],
      ],
      heads: true,
      arm: 1.2,
      headLevel: 8,
      headBloom: 2,
      poleColor: "#5c5b57",
    },
  },

  // the camera's lens, for what the post's depth of field cannot do: a point far
  // behind the focus plane blurs by aperture x |1/focus - 1/d| (rad), whatever the
  // focal length. The photos' lens: iPhone 17 Pro main, 6.9 mm at f/1.78, so 3.9 mm.
  // The far crowns take the part of that blur the post's DOF (one fixed radius for
  // every far point) leaves out, in quadrature (common.js outdoorLensBlur): the 66 mm
  // close-ups focused at 0.9 m blur a street tree about 3.9 mrad across, the DOF
  // about 1.2. The focus comes from the FrameState's lens ({ focus, bokeh }) when the
  // engine passes it, else the camera's distance to the glass (every keyframe but
  // the hero focuses there).
  lens: { enabled: true, aperture: 0.0039 },

  // how the outside is lit on top of the scene's lights (outside.js)
  light: {
    ownLights: true, // outdoor materials see only the key (sun or moon) and the lamp (outside.js bindLights)
    ambient: 0.85, // share of the sky plate's average light a sky-facing matte surface receives
    ground: 0.22, // ground bounce, relative to the sky
    groundTint: [0.9, 1.0, 0.75],
    // an extra unshadowed sun on far things, on top of the scene's key light. 0: the
    // light rig's key (lights.js, calibrated so the sunlit building reads 1.15x the
    // monitor's white under a 1.7 sky at 17:41) already lights them
    sun: 0,
    hazeK: 0.02, // haze e-folding distance = visibility (m) x this (20 km: 400 m; 3 km: 60 m)
    hazeMin: 10, // m
    hazeMax: 600, // m
    hazeTint: [1.0, 1.0, 1.03],
    rainHaze: 0.45, // haze distance multiplier while raining
    flash: 2.2, // lightning, added to the ambient
  },

  // rain between the bamboo and the glass (outside/rain.js)
  rain: {
    enabled: true,
    maxDrops: 7000,
    quality: { high: 1, mid: 0.7, low: 0.35 }, // share of maxDrops and drips per params.quality
    box: [-1.4, 3.4, -2.2, 3.4, -2.8, -0.42], // m: x0, x1, y0, y1, z0, z1 (from just past the grille out)
    fallSpeed: [6.0, 8.5], // m/s
    shutter: 0.022, // s: streak length = speed x this
    width: 0.0006, // m, at least; widened to about two pixels with distance
    pixelAngle: 0.0016, // rad, about two pixels at the reference framing (TRAA resolves it)
    // a drop is a lens that shows about the sky's average: normal blending at that
    // radiance and this coverage, so streaks lighten dark things and vanish on the sky
    // x the sky light a matte outdoor surface receives (U.skyAmb, from the plate's average
    // near the horizon): a drop's lens shows the sky above it, brighter than that
    // average under cloud (an overcast zenith is about 3x its horizon)
    // loop round 2 ("rain and storm show no rain"): 1.6 and 0.45. A drop's lens shows
    // the sky ABOVE it (an overcast zenith is 2 to 3x its horizon), so a streak is a
    // little brighter than the horizon sky behind it (+15 %) and clearly brighter than
    // the canes and leaves it crosses. At 1.3 and 0.24 the streaks in the hero's sharp
    // band (the bamboo, 2 to 2.6 m from the camera) were at most 0.1 of a level over
    // the canes; the rest of the box sits in the depth of field's blur either way
    radiance: 1.6,
    coverage: 0.45, // at a streak's core (round 1 had an additive 0.7 of the sky: it read as sleet)
    nearThin: [0.5, 1.4, 0.4], // m from the glass: drops nearer than the first keep 0.4 of their coverage, full past the second (the canes stand at 1.5 to 3 m)
    gustDensity: 0.25, // share of the drops that come and go with the gusts
    fullAt: 10, // mm/h for the full count
    windFactor: 0.85, // how much of the 10 m wind the drops take
    lampGlint: 0.02,
    drips: 90, // drops under the grille while it is wet
    bead: 0.0018, // m, radius of a hanging drop when it lets go
    // the neon signs caught by the streaks (outside/neon.js, Cyberpunk): this share of
    // the drops shows one sign colour each (never their average), at gain x the
    // signs' colour (0 = none: the term is exactly 0)
    neon: { share: 0, gain: 1 },
  },

  // NEON SIGNS (outside/neon.js; Cyberpunk only, off here): flat emissive cards far
  // beyond the bamboo, 18 to 26 m out and 8 to 11 deg up, so the street crowns hide
  // their lower edges. Built on the first frame `enabled` is true (nothing exists for
  // the other looks). Each sign: bearing (deg, 0 = north, + east), dist (m from the
  // window), elev (deg above the sill's horizon), w and h (m), kind (frame, blade,
  // strip, screen), color (a palette index) or colors [a, b],
  // flicker (true: it stutters, at most 2 changes a second, never under
  // prefers-reduced-motion). level: scene units x the light gain at night; dayLevel
  // by day, x the sky light the outdoor surfaces receive (per unit of lumCap: a
  // tube's flat colour is about 0.3 of it, the lens's blur spreading the rest);
  // bloom: x the colour into the bloom; air: x the signs' light
  // added to the outdoor haze and sky ambient and the window's fill (F8); tube: the
  // tube's half width (m); flicker 0 stops every flicker; debugFlat: whole cards in
  // flat colours (the placement sweep).
  neon: {
    enabled: false,
    level: 0.6,
    dayLevel: 1,
    bloom: 2.5,
    dayBloom: 2.5, // the bloom by day (eased to `bloom` by U.night)
    wetBloom: 1, // x the bloom while it rains (the wet air spreads each sign's light)
    wetNight: 0, // in rain by day, this share of the way to the signs' night level (x wetness)
    flicker: 1,
    air: 1,
    tube: 0.03,
    hot: 1, // a tube's near-white core, x its colour's peak
    panel: 0.4, // a lightbox's panel, x a tube's level
    boxTubes: 1, // x a lightbox's two side tubes (0: none, the box lit from its middle)
    boxHot: 0, // a lightbox's hot, near-white middle, x a tube's level (0 = none)
    dayHot: 1, // by day, this share of boxHot (eased to all of it with the switch-on)
    onAlt: null, // the signs' switch-on, [full day, full night] sun altitude (deg); null = U.night
    haze: 1, // x the distance haze's mix (a lit sign burns through the air)
    rim: 0, // the signs' colour on the bamboo's edges at night (palette[rimColor]), x the light gain
    rimColor: 0,
    lumCap: 0.3, // each palette colour's luminance held to at most this (linear)
    // sigma (deg) round the first two colours' signs within which a falling streak
    // ([0]) or a drop on the glass ([1]) catches them (outside/rain.js, materials.js)
    dropSpread: [12, 30],
    palette: ["#ff3c9c", "#30e8e8", "#ffb03c", "#8a4dff"],
    signs: [],
    // the towers the signs hang on (outside/neon.js buildSkyline; none here). spill:
    // the first 8 signs' light on the walls round them, level x the signs' radiance,
    // falling off over reach deg (0 = none), bloom x it into the bloom
    // windows.gap: the share of a lit floor's bays left dark (0 = an unbroken band)
    skyline: { towers: [], spill: { level: 0, reach: 0.8, bloom: 0 } },
    debugFlat: false,
  },

  // DREAMLIKE ONLY (looks.js turns sky.moon.mode to placed): the halo and the rim
  // (loop round 2: the disc is drawn here, crisp, over the plate's soft one; see moon.js)
  moon: {
    enabled: true,
    distance: 37, // m, the halo card; the disc sits 0.4 m nearer
    extentDeg: 16, // the halo card's half-size
    coreDeg: 0.7, // the corona: e-folding width OUTSIDE the limb
    corona: 0.35, // its brightness at the limb, x the fully lit disc's
    aureoleDeg: 5.5, // the wide faint halo, from the centre
    aureole: 0.14, // (0.3 when the halo also stood in for the disc: with the disc drawn it greyed the sky around it)
    halo: 0.55,
    cloudLift: 10, // the halo brighter where the plate has cloud
    silver: 6, // the moon-facing edges of clouds near it: gain on the plate's luminance step
    rimDeg: 6, // how far from the moon the silver edges reach (e-folding)
    rimStepDeg: 0.6, // the step toward the moon the edge is measured over
    bloom: 0.6,
    rim: 0.35, // its light on the outdoor edges (common.js outdoorMaterial rim)
    color: "#dfe6ff",
    disc: true,
    discScale: 1.0, // x the plate's disc radius (1 covers it exactly)
    discBright: 1.2, // the lit disc at albedo 1, scene units (the exposure takes it near white; the maria stay grey)
    mare: 0.4, // how much darker the maria are than the highlands (albedo 0.6 against 1)
    discBloom: 0.35,
    earthshine: 0.12, // the dark side: this much opacity, faintly lit
    clearAt: [0.15, 0.35], // the plate's linear luminance on the moon's lit side: below the first a cloud hides it
    // loop 2: its place by the hour (outside/moon.js placedMoonAt): params.sky.moon's
    // az at the real moonrise, drifting west (left) degPerHour per hour since, its alt
    // at the real transit and sag deg lower span hours from it. At the round-1 hero
    // (az -2, alt 18) that keeps it in L1's upper panes all night: about 1 deg left
    // and 2 deg lower at 21:00, 2.5 deg left at midnight. Applied only where the
    // engine hands state.moonPlaced to the modules (engine.js, the core lane)
    // 2026-09-27: by the CLOCK (placedMoonAt T.by), so it crosses the upper left pair
    // every night whether or not the real moon is up: rises at the right at dusk
    // (center - span), highest at `center`, drifting left degPerHour per hour.
    // At 0.5 deg/h on the real hour angle it barely moved, and parked on nights the
    // real moon was down (21:00 equalled 00:00)
    // Fitted 2026-09-27 on a 105-point sweep of the disc at the p = 0 hero (engine
    // moonCheck): no position is fully clear (the outside grid crosses it; best 0.86),
    // the open column is az -3 to -1.5 at alt 14 to 18. From params.sky.moon az 3.75 at
    // 17:00 it drifts 0.75 deg/h left: 19:00 az 2.25, 21:00 0.75, 00:00 -1.5 (alt 16,
    // its top), 03:00 -3.75
    // degPerHour 0.3 (was 0.75), sag 5 (was 4): the night's path spans 4.2 deg, inside
    // the one clear pane at the folio opening (az 14.2 to 10, alt 15 to 20)
    track: { enabled: true, by: "clock", center: 0, degPerHour: 0.3, sag: 5, span: 7 },
  },

  // DREAMLIKE ONLY: glowing motes (outside/motes.js)
  motes: {
    enabled: false,
    box: [0.2, 3.2, -1.5, 2.8, -3.2, -0.5], // m, around the bamboo
    // fewer, dimmer and slower (Agam, 2026-09-27: "less in density and quantity, and
    // slow them down ... a tasteful detail rather than overpowering the scene");
    // was 240, glow 2.5 / 0.6, wind 0.35, bloom 0.8, pace 1
    outdoor: 70,
    pace: 0.4, // x the wander, rise and blink rates
    size: [0.0035, 0.0075], // m, half-size of a glow
    fireflyColor: "#d9ff7a",
    fireflyGlow: 1.5,
    pollenColor: "#fff4d6",
    pollenGlow: 0.4,
    windFactor: 0.12,
    bloom: 0.5,
    beam: 140, // dust specks in the lamp's cone
    beamMode: "auto", // auto: only if the room has no motes of its own; true or false forces it
    beamRange: [0.09, 0.42], // m from the bulb
    beamSize: [0.0012, 0.0026], // m
    beamGlow: 30,
  },

  // per-look adjustments inside the outside (looks.js stays the engine's)
  // spray: the arching culm's hanging spray over the left pair (Dreamlike's licence:
  // it puts bamboo in the first frame, p = 0; the photos show only faint strands)
  looks: {
    photo: { sat: 1.0, ambient: 1.0, spray: false },
    heightened: { sat: 1.1, ambient: 1.05, spray: false },
    dreamlike: { sat: 1.12, ambient: 1.08, spray: true },
    cyberpunk: { sat: 1.1, ambient: 1.05, spray: true },
  },

  // wind response (common.js windOffset). The plants feel the reading's mean speed
  // rising to its gust speed as a gust front passes (a burst of about a second's
  // rise, advected along the wind at `advect` of the 10 m speed, so upwind plants
  // move first); the push grows as speed^1.4 (common.js GUST.push). lean: bend per
  // strength^1.4 (in any one second a storm gust moves the canes at window height
  // about 11 cm, a 12 km/h evening 2.5 cm, 8 km/h 1.5 cm); sway: the culms' own 0.5
  // to 0.9 Hz sway, per strength^1.4; flutter: scales
  // the leaves' flutter (4 deg calm, 25 to 30 deg at a storm gust's peak).
  // strengthAt: km/h that counts as strength 1. force: null, or { speed, gust, dirFrom }
  // (km/h, deg) to pin the outside's wind for tests (?set=outside.wind.force.speed:2)
  // loop round 2 ("no gust moves across the frame, the leaves barely flutter"):
  // advect 0.35 (a gust eddy in a built-up yard travels at about half the local mean
  // wind, itself about 0.6 of the 10 m reading; at 0.7 the front crossed the clump in
  // 0.2 s, now 0.4 s in the storm and 0.85 s per metre in the partly preset, and it
  // reaches the street trees seconds later); flutter 1.6 (a leaf's tip swings about
  // 2 to 3 cm at 12 km/h, 8 to 11 px at the hero; 40 deg at a storm gust's peak);
  // sway 0.004 (the tops of the canes swing about 17 cm in the storm, 5 cm at 12 km/h)
  wind: { lean: 0.012, sway: 0.004, flutter: 1.6, advect: 0.35, strengthAt: 20, force: null },
};
