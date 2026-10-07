// Room params. Lengths are in W (params.dims.W, the clear glass width of one pane)
// unless the comment says m (a datasheet or object size that does not scale with the
// window). World frame: x right, y up, +z from the window into the room; the origin
// is on the glass plane of the left French pair, at the sill top, centred on the
// meeting stiles.
//
// Sources: tools/window-light/spec/13-photo-inventory.md (proportions) and a fit of
// every edge below to the 17:41 wide photo (ref_1600.png) through the solved
// reference camera (camera.js ref: -2.6, 0.5, 8.8 W, yaw 8, pitch 5.7, roll -0.7,
// vertical FOV 56.8). "fit" means backprojected from measured image edges; the fit
// scripts live in the scratchpad (room/fit_*.py). Where the fit and the inventory
// disagree the fit wins for the hero framing and the comment says so.

export const ROOM_PARAMS = {
  window: {
    // --- left French pair (glass plane z = 0) ---
    // fit, corrected for occlusion: seen from the chair (left of and below the
    // panes) a pane's left and bottom edges are the chamfered edges of the members in
    // front of the glass, its right and top edges lie on the glass. So L1's clear
    // glass is 1.089 W and L2's 0.973 W (the wide photo's raw 1.07 and 0.93 read the
    // occluding edges); W stays the mean.
    paneL1: 1.186, // was 1.089; +0.097 from the slimmer meeting stile (2026-09-27)
    paneL2: 1.007, // was 0.973; +0.034, the same
    hingeStile: 0.57, // outer (hinge-side) stile, 13-photo 4.2 (0.55 to 0.58)
    // L1 side, gap, L2 side. Was [0.205, 0.03, 0.112] (fit; 5481: 0.19, 0.03, 0.14),
    // which read as a thick bar with a dark slit down the pair's middle (Agam,
    // 2026-09-27); the leaves now meet near flush, the panes took the width
    meetingStile: [0.12, 0.006, 0.09],
    // rows, bottom to top. Fit: pane tops at 1.623 and 4.343 W read directly; pane
    // bottoms at 2.010 and 4.767 are the rails' front edges, so the rails sit at 1.988
    // and 4.704 (the 0.365 W rail matches 5481's frontal 0.37)
    rows: {
      belowSill: 0.12, // glass continues below the sill top, hidden by the ledge
      C: 1.623,
      railBC: 0.365,
      B: 2.355,
      railAB: 0.361,
      A: 2.14, // 5480: A/B = 0.92
      topRail: 0.5,
      bottomRail: 0.45,
    },
    // leaf z from -0.1 to +0.25 W. The room face (zf 0.25) is what the photo fit
    // placed; the glass sits 0.1 W (9 mm) in from the leaf's back, in its rebate:
    // round 1's 0.2 W showed 18 mm of rebate through the glass at the hero's
    // obliquity, a dark rim inside every pane
    leaf: { depth: 0.35, glassFromBack: 0.1 },
    jointDepth: 0.012, // W, how far the meeting and hinge joints sit below the faces
    // the pane reveal (room side, between the glass and the chamfer) and the putty
    // at the glass (13-photo 4.3; 5481: the reveals read dark like the wood, with a
    // thin pinkish weathered putty edge showing at some edges and corners only).
    // Round 1 lined every pane with a 0.03 W pale putty strip and a glossy reveal:
    // a pale outline round every pane
    reveal: { shade: 0.7, roughness: 0.75, windowShare: 0.35 }, // x paint albedo, -, share of the fill
    // the putty fillet on the glass at every pane edge: its width on the glass and
    // height up the reveal (W; 1.4 mm, 3 to 4 px in 5481 as in the photo; round 1
    // had a 2.7 mm flat strip), the share of the edges where it shows unpainted,
    // its colour (display hex, 5481's pinkish line)
    putty: { width: 0.016, height: 0.014, share: 0.75, color: "#bba398" },
    // W, the chamfer on every pane edge's room side (5481, 5484). A glossy chamfer
    // facing its pane mirrors the sky at grazing, so its width is the width of the
    // bright line along every pane edge: the 17:41 photo shows 1 to 3 px lines there
    // (a 0.1 W chamfer drew 5 to 10 px pale bands that moved the pane edges)
    sticking: 0.05,
    // fixed frame (casing), 13-photo 4.3 profile from the wall inward
    casing: {
      width: 0.78, // visible face (fit: its inner edge at -2.032 W, its wall edge at -2.81 on its own plane)
      face: 0.62, // z of the casing's room face (the grille's tie bar is fixed onto it)
      back: -0.35, // z of its back
      band: 0.21, // flat band next to the wall
      groove: 0.05, // V-groove (quirk)
      flat: 0.37,
      beadW: 0.1, // rounded bead (astragal)
      // the quirk is a shallow V under thick enamel: at 0.03 its faces turned 50 deg
      // toward the glass and caught the window as a bright line the 17:41 photo does
      // not have (it shows one hairline, at the edge nearest the glass)
      grooveDepth: 0.012,
    },
    rebate: 0.153, // shadow band between casing and leaf (13-photo: 0.13; fit 0.153)
    rebateSky: 0.3, // the glazing rebate behind the glass: its share of the sky's light
    // depth of the rebate's floor below the leaf's room face (W): the leaf sits in the
    // rebate nearly flush, so its outer edge shows no side face (round 1 had 0.15 W of
    // it, which the unshadowed window fill lit as a pale line down the casing)
    rebateStep: 0.0,
    head: { gapAboveLeaf: 0.05 }, // head casing sits this far above the leaves' top rail
    // --- the corner post and the right section (locked brief Q11: built at an
    // angle, the handle leaf ajar). Fit: R1 and R2 are coplanar; their rails put
    // the section at 22 to 29 deg (A and B rails 22.3 and 22.6, the less
    // conditioned C rail 28.5), not the 31 of the inventory. The section's glass
    // passes through `origin` (x, z) at R1's outer stile edge.
    right: {
      flat: true, // 2026-09-27 (Agam: "two broken pieces"): one flat frame, same rows as the left pair; R1 stays ajar
      angleDeg: 23,
      origin: [2.18, 0.393], // W (x, z) of R1's free-stile outer edge on the glass line (fit)
      freeStile: 0.216, // R1's handle stile (its free edge), fit
      paneR1: 1.06, // fit
      hingeStileR1: 0.2, // R1's hinge stile (fit: the two stiles and the bead line total 0.418)
      gapR: 0.018,
      stileR2: 0.2,
      paneR2: 0.95, // fit
      stileR2out: 0.5,
      // rows below the left pair's (fit on the section's plane at the photo's right
      // edge: row C glass 1.655 down to -0.716, a 0.35 rail, a fourth row below it
      // past -2.8 W; the rails above match the left pair's)
      rows: { D0: -3.05, D1: -1.07, C0: -0.716, C1: 1.655, B0: 2.05 },
      ajarDeg: 2.5, // deg; R1 stands open, outward (brief: slightly open)
      rockDeg: 1.5, // deg; how far real gusts rock it
    },
    // brass D-handle on R1's free stile, centred on the B/C rail (the wide photo's
    // glints and 5482; the inventory's A/B is not what the photos show)
    handle: { enabled: false, length: 0.075, bar: 0.0036, standoff: 0.02 }, // m (a 3 inch bow of about 7 mm bar)
    // two old screw holes on L2's hinge stile (13-photo 4.4; 5481, 5482): the upper
    // one in a small torn slot, the lower one plain. Fit: (1.429, 2.137) W on the
    // stile face. W: height, fraction across the stile, the lower hole's drop; the
    // slot's width and height (4 x 10 mm, 5482), the holes' radii (about 1.1 mm)
    keyhole: { y: 2.137, x: 0.58, screwBelow: 0.66, slot: [0.042, 0.11], hole: 0.013, hole2: 0.012 },
    glass: {
      // dust 0..1: the looks set it (Photo-true heavy, Heightened and Dreamlike lighter)
      dust: 1.0,
      // how dusty each leaf is against that: R1, the handle leaf that gets opened, is
      // a little cleaner (its crown, building and red patch read through it at 17:41,
      // glass_right C* 12.8); R2's stipple over its dark plane reads 0.42 of the
      // clear glass (glass_grey)
      // (fit at 17:41 against ref_1600: L 1.3 puts glass_clear's chroma at the photo's
      // 8.5 and veils the outside grid toward the photo's low contrast; R1 0.85 puts
      // glass_right at C* 12.7 against 12.8; R2 1.0 put glass_grey within 0.05 stops
      // while the depth of field blurred R2 with its bright neighbours; loop 2 gives
      // the frosted R2 its own depth (crisp, -0.30 st at 1.0), refit to 1.25)
      panes: { L: 1.3, R1: 0.85, R2: 1.25 },
      // an even forward-scatter share per leaf, over the grain (materials.js):
      // lifts what is dark behind the film (the outside bars, the trees) toward the
      // sky. Fit at 17:41 against ref_1600: L 0.15 puts the outside bars through L1
      // at -0.52 st against the sky beside them (photo -0.50; round 1 read -1.0 to
      // -1.35) and glass_clear's chroma at 8.4 (photo 8.5); R1 and R2 were already
      // on the photo (glass_right d_ab 0.8, glass_grey 1.3)
      veil: { L: 0.15, R1: 0.0, R2: 0.0 },
      haze: 0.2, // the film's soft low-frequency veil (coverage at its brightest)
      speck: 0.62, // the fine grain's weight (mean film coverage at dust 1 about 0.2)
      // how much sky light the dust film scatters toward the room (R2's stipple
      // over a dark plane reads 0.38 of monitor white against a 1.7 sky)
      scatter: 0.9,
      tint: "#d0d4d2", // dust colour (display hex): the photo's R2 stipple is a cool grey (#888e8b)
      // the neon signs (outside/neon.js) in the lower half of each drop on the wet glass
      // (materials.js lensSky); 0 = none (the term is exactly 0)
      neon: 0,
      rain: { dropScale: 1.0, streaks: 1.0 },
      // loop 2: the speck grain fades out below heavy dust, from grainFrom to grainTo
      // (Photo-true 1.0 keeps all of it; Heightened 0.4 and Dreamlike 0.3 none), and
      // R2 keeps frost.R2 of the full grain while the dark plane stands behind it
      grainFrom: 0.35,
      grainTo: 0.85,
      frost: { R2: 0.8 },
    },
  },
  // room-side black iron grille (13-photo 4.7). Bars are square, their edges filleted
  // (loop 2, room/geom.js roundBarGeo). The left panel is
  // one plane, skewed planDeg in plan (right end forward) so the upper tie bar, whose
  // image slope needs a tilt and a small plan angle, touches every bar. Bar centres
  // fit to the wide photo on that plane: pitch 0.9525 W (5481 reads 0.93).
  grille: {
    enabled: false, // 2026-09-27 (Agam): no metal grille inside the window; the outside box grille stays
    bar: 0.1,
    fillet: 0.3, // loop 2: the bars' edge radius as a share of their width (a highlight line down each)
    zRef: 0.8, // bar-centre plane at x = -1 W
    planDeg: 3.125,
    barsL: [-1.1236, -0.1711, 0.7814, 1.7338],
    // the upper tie bar: a flat bar across row A (fit rms 1.35 px): its lower edge is
    // at yRef at x = -1, it rises tiltDeg to the right, its face is thick tall
    tieTop: { yRef: 5.553, thick: 0.1676, depth: 0.05, tiltDeg: 6.0, x0: -2.2, x1: 2.0 },
    // the right section's own panel, parallel to it, offset in front of its glass;
    // bars along the section from R1's outer edge (fit)
    right: { offset: 0.5, bars: [-0.11, 0.785, 1.679, 2.573], tieLowY: -2.2, tieTopY: 5.72 }, // tieLowY: fit (edge at -2.16 on the glass plane; 5484's lower tie bar)
  },
  // the brown exterior box grille beyond the glass (Q19 answer; 13-photo 4.8). Fit
  // at 3.9 W beyond the glass: horizontals every 1.09 W from 0.194, verticals every
  // 1.184 W through 0.418 (0.72 W and about 1 W as seen on the glass plane), and one
  // long brace from the node (-0.766, 5.644) through both measured diagonals.
  // enabled: auto builds it only when the outside module's params define no grid of
  // their own (outside/grid.js builds it today; two grilles must never render)
  exterior: {
    enabled: "auto",
    depth: 3.9, // W beyond the L glass (35 cm at W = 9 cm; the inventory allows 20 to 50 cm)
    bar: 0.14, // W, flat bar face width
    barDepth: 0.35, // W, flat bar depth
    pitchY: 1.09,
    yStart: -0.896,
    xs: [-3.134, -1.95, -0.766, 0.418, 1.602, 2.786, 3.97, 5.154, 6.338],
    y0: -1.5,
    y1: 9.6,
    x0: -4.2,
    x1: 7.5,
    diagonals: [[-0.766, 5.644, 3.17, 0.194]], // [x0, y0, x1, y1] in W on the grille's plane
    color: "#6d4a31",
  },
  // the far-right column's dark plane beyond the grid (Q20 answer), in the right
  // section's frame (x along it from R1's outer edge, depth behind its glass);
  // Dreamlike opens it
  // enabled: true. outside.js also places a plane from r2Pane, 4.6 W behind R2 at
  // R2's width; the chair looks through R2 about 18 deg off its normal, so that
  // plane lands about 1.5 W to the side and never covers the pane. This one is sized
  // for the parallax: its left edge leaves the photo's sliver of view along R2's
  // left edge (the view through R2 at 5270 to 5300 px reaches x 3.61 to 3.71 here)
  blocked: { enabled: true, x: 3.7, width: 3.2, depth: 5.8, top: 13, color: "#181918" }, // top: W (the view up through R2 reaches about 12 W at that depth)
  // ledge false (2026-09-27, Agam): no shelf, a flush enamel rail at the casing face
  sill: { ledge: false, thickness: 0.32, lip: 0.18, nose: 0.06, x0: -2.75, color: "#77726a" }, // W; the top is y = 0; with a ledge its front is at dims.sillDepth + lip
  wall: {
    color: "#e2d8c6", // cream emulsion (13-photo 7: #c0b9af to #e1d8c8 under room light)
    face: 0.62, // z of the window wall's room face (flush with the casing)
    left: 30,
    right: 14,
    floor: 12.2, // the sill is about 1.1 m above the floor
    ceiling: 18.3,
    back: 40,
    thickness: 2.6, // the house wall (about 23 cm)
    peel: 0.08, // normal-map scale of the emulsion's fine orange peel (round 1: 0.5 with trowel waves)
  },
  // enamel paint on the frame (13-photo 4.4). Albedo: Lab (28, 9, 6.5), hue 36, the
  // maroon-brown of 5480 and 5481 under the room light (#4b3937, #513f3c, #59403c,
  // hue 30 to 33); round 1's (0.085, 0.058, 0.040) was hue 67, olive. High gloss
  // (5482's hotspot shows the brush ridges in the specular): roughness 0.14. Chips and
  // dust stay light (0.15 and 0.5): at 1.0 they read as pale blobs and grey driftwood
  // Round 2: albedo Lab (27.5, 10.5, 7.5), C* 12.9 at hue 36: with the ceiling light
  // of the dusk shots the frames of 5481 read C* 10 to 12.5 at hue 30 to 37 (photo
  // 10.2 to 10.7 at 31 to 39; round 1's C* 11 albedo gave 7.5 on the casing). More
  // chroma turns the lamp-lit stile red (the photo's is 68 to 90). Roughness 0.1:
  // long narrow streaks in the gloss, not a sheen over the face.
  // windowShare: the share of the window fill the frame really sees (materials.js)
  // Loop 2 (gloss): two lobes. roughness is now the pigmented base's broad sheen
  // (0.28, at baseSpec 0.25 of a dielectric's F0: the pigment under the top is
  // nearly all diffuse), under a clear coat (coat 1, coatRoughness 0.06) that carries the brush
  // ridges (coatBrush, the normal map's scale in the coat; brush stays the base's).
  // specShare: the share of the window fill the coat sees (the diffuse keeps
  // windowShare). For the frame it stays at windowShare: at 0.6 the coat mirrored
  // the whole opening at grazing down every stile side, groove and chamfer (pale
  // CG outlines at p = 0), where the real view across is mostly frame; the
  // lamp, its glow and the ceiling light draw the frame's gloss
  paint: { albedo: [0.0895, 0.0435, 0.0368], roughness: 0.28, baseSpec: 0.25, coat: 1, coatRoughness: 0.06, coatBrush: 0.25, brush: 0.3, chips: 0.15, dust: 0.5, windowShare: 0.3, specShare: 0.3 },
  // black gloss paint on iron (loop 2: a clear coat over a 0.3 base; the dust a
  // sparse grey on the tops that mattes the coat)
  iron: { albedo: [0.012, 0.0105, 0.009], roughness: 0.3, baseSpec: 0.5, coat: 1, coatRoughness: 0.08, dust: 1.0, windowShare: 0.6, specShare: 0.9 },
  // oxidised brass: the D-handle and the hinges (materials.js, BrassMaterial; 2026-10-05,
  // NEXT.md item 4). Fitted on handle-on probes (build-01-brass-handle in the archive):
  // the hero at p = 0, 17:41, and 5482 with bloom and glare off, against the photo's grip.
  // f0: linear F0 of the worn grip (each channel 0.12 to 0.45; brass's ratios, desaturated:
  //   the photographed #a77960 is a lamp-lit colour, redder than copper). Y 0.171. Scaled
  //   by 1.2 (Y 0.205) the hero's brass rose to +2.0 to +2.3 L* over the enamel ring round
  //   it in Photo-true and Heightened (gate: +2 or less); at 1.0 it sits at -0.1 to +0.6.
  // tarnish: linear F0 of the patina in the bends (0.02 to 0.12), scaled with f0. roughness:
  //   the grip (0.2 to 0.45); patinaRoughness: the patina (0.4 to 0.8).
  // anisotropy: along the grip (0 to 0.8), high tier only. isoGain: the F0's scale on the
  //   tiers without it (0.5 to 1). Round 1: at 1 the mid and low heroes' brass sat +3.8 and
  //   +4.9 L* over the ring (Dreamlike; Photo-true +4.3, +4.8); 0.75 puts it at +0.8 and
  //   +1.8 (+1.3, +1.9), beside the high tier's +1.1 (+1.5). Low still draws no lamp
  //   shadow under the bar (no spill shadow on that tier), so its whole handle mask, bar
  //   and shadow, stays at +1.6: that is the tier's shadow, not the brass.
  // bend: m off the leaf's face where the patina fades out (0.004 to 0.024); bendWeight,
  //   innerWeight: how dark the bends and the bow's door side go (0 to 1). Round 1: in the
  //   photos the bolsters read in the grip's own tone (5482 and 5484, the lower bolster's
  //   median L* +2.4 and +1.4 over the grip's; the upper box, crevice and cast shadow in,
  //   -15.7 and -8.1), where bendWeight 0.85 with a tarnish of 0.26 of f0 put the ends'
  //   median 3.6 L* under the grip's at 17:41 and 11.6 under at 18:40. 0.4 with a tarnish
  //   of 0.53 of f0: -0.6 and -9.3 (the dusk gap is the lamp: the glint sits on the grip).
  //   innerWeight changes no probe by more than 0.5 L* (the bow's door side is out of view).
  // grain: the patina's speck (0 to 0.5); grainSize m (0.0002 to 0.002); grainFade: m of
  //   pixel footprint (length of fwidth of the position, about 1.4 pixels) to fade it over.
  // windowShare: of the window fill, as the paint's (0 to 1).
  // surround: the mirrored door face (0 to 1.5; it stands in for an environment map and
  //   switches itself off when the material has one: BrassMaterial); surroundSat: how much of the paint's chroma it keeps (0 to 1); roomShare: what
  //   it keeps where the reflection points into the room (0 to 0.3). Swept surround 0.5 to
  //   1.1 and surroundSat 0 to 0.4: 1.0 and 0.2 put 5482's brass at dE76 4.8 from the
  //   photo's grip (d_ab 4.4, dL -1.7, hue +0.4 deg); 0.8 and 0.4 gave 5.5 (L* 3.3 low,
  //   hue -1.6), 0.5 and 0.4 gave the lowest d_ab (1.1) but 6.9 L* too dark
  // slot: the screw caps' slots, width a share of the cap's diameter (0.08 to 0.3), depth m
  //   (0 to 0.0006), angleDeg, fade m of pixel footprint (a 0.7 mm slot fades out as it
  //   nears a pixel). A room change (setParams, the GUI) rebuilds the scene; a look switch
  //   re-applies the uniforms (materials.js apply)
  brass: {
    f0: [0.19, 0.17, 0.12],
    tarnish: [0.1, 0.09, 0.066],
    roughness: 0.3,
    patinaRoughness: 0.6,
    anisotropy: 0.5,
    isoGain: 0.75,
    bend: [0.008, 0.017],
    bendWeight: 0.4,
    innerWeight: 0.55,
    grain: 0.3,
    grainSize: 0.0004,
    grainFade: [0.0002, 0.0005],
    windowShare: 0.3,
    surround: 1.0,
    surroundSat: 0.2,
    roomShare: 0.12,
    slot: { width: 0.16, depth: 0.0003, angleDeg: 15, fade: [0.0005, 0.001] },
  },
  // fabric Roman blind raised into soft folds, sagging lower on the left (13-photo 7)
  // lowBottom: the hem when fully lowered (W); -0.12 tucks it past the sill top (y 0) to
  // where the glass ends, so no bright strip shows under it (2026-10-05: "all the way down")
  blind: { bottom: 7.55, top: 9.6, left: -3.6, folds: 5, sag: 0.35, depth: 0.9, lowBottom: -0.12, defaultDrop: 0 }, // defaultDrop: where the blind starts, 0 raised .. 1 lowered (in dev, __blindDrop() reads the live one)
  // spreadTop / spreadBottom: half the two strands' spacing at the top and the
  // bottom (m; fit to the 17:41 photo: 1.3 cm apart at 5 W, 4.7 cm at 0.6 W).
  // x: the pair's centre, moved 0.1 W left in round 2 (the render's pair sat 11 to
  // 26 px right of the photo's at 1600 px)
  // 2026-09-27: the strands run close to parallel (0.8 to 2.4 cm apart) into a U at the bottom (room/beadChain.js), one continuous loop
  // 2026-09-27: shorter (bottom 0.2 -> 1.8 W, about 14 cm up; Agam) and it swings when the cursor passes it
  // (room/beadChain.js: physics, a hanging rope that bends at every bead. beadsPerNode beads per simulated point; rate
  // substeps per second (under about 1000 the top stretches); drag air damping 1/s (0.9: a flick swings about 4 s);
  // reachPx the cursor's reach in CSS px; carry the share of the cursor's speed a swept link picks up; wind the
  // draught's sideways push as a share of g; maxSpeed m/s)
  beadChain: { x: -3.54, top: 8.0, bottom: 1.8, pitch: 0.0042, bead: 0.0019, spreadTop: 0.004, spreadBottom: 0.012, physics: { beadsPerNode: 2, rate: 2400, drag: 2.6, still: 0.03, restDrag: 16, bend: 0, reachPx: 28, carry: 0.5, wind: 0, maxSpeed: 4 } }, // W, W, W, m, m, m (half-spacing), m (half-spacing and the loop's radius)
  // the desk lamp (13-photo 5). Position: the bulb, fit to the dome's silhouette at
  // 7.87 W from the chair. The shade axis starts on the chair's line of sight to the
  // lamp and tilts tiltDeg (Agam: 37) toward a direction in the chair's image plane
  // (0 right, 90 up, 180 left, 270 down).
  // aim "photo" (every look): the photographed pose, tilted toward 40 deg (up and
  // right): at 17:41 the cup sits lower left of the dome, and the 18:40 photos show
  // the same pose (5484: cup lower left; 5482: its vent holes face the camera). The
  // 18:40 hotspot on L2's hinge stile then lies about 55 deg off the shade's axis:
  // placing that glow is the light rig's job (lights.lamp.aim target), not the head's.
  // aim "1840" turns the head toward that hotspot instead (tilt direction 192).
  lamp: {
    pos: [2.1, 0.55, 2.522],
    tiltDeg: 37,
    aim: "photo",
    tiltDir1741: 40,
    tiltDir1840: 192,
    // sizes fit to the 17:41 silhouette (260 x 233 px at 0.71 m): a 12.6 cm dome
    // (the inventory's 15 cm came from assuming the distance; a 15 cm dome would
    // have to sit 0.84 m away, through the glass)
    domeRadius: 0.063, // m
    domeDepth: 0.074, // m
    cupRadius: 0.0245, // m
    cupLength: 0.056, // m
    // the black enamel (materials.js lampBlack): linear albedo, gloss, the share of
    // the window fill it sees (it sits in front of R2's dark plane), and the one vent
    // hole's faint glint of the lit socket (x the bulb)
    albedo: 0.012, // (loop 2 tried 0.009, L* 8: no change at 17:41, 0.0339 to 0.0338 Y, and darker in 5484)
    // loop 2: semi-matte black enamel (13-photo 5): a satin base (roughness 0.45:
    // the ceiling light's broad soft highlight in 5484) under a thin smooth top
    // (coat 0.3, coatRoughness 0.08) whose Fresnel draws the window as a thin crisp
    // rim only where the dome turns away. A full coat (0.8 at 0.8 of the fill)
    // mirrored the L pair as a crescent a fifth of the dome wide, which the 17:41
    // photo does not have (its dome is black to a hairline rim). The diffuse and
    // the base see windowShare of the fill, the coat specShare; dust: sparse specks
    roughness: 0.45,
    coat: 0.3,
    coatRoughness: 0.08,
    windowShare: 0.4,
    specShare: 0.5,
    dust: 1,
    scuff: 0.5, // a few dull worn patches (roughness up, coat off; 5484)
    ventGlow: 0.0015,
  },
  // BenQ MA270UP (VERIFIED model): the active area is a datasheet size in metres.
  // Pose fit to the screen's top and side edges: centre (x, y) in W, z = dims.gap +
  // dz (m), yawed toward the chair (its right end forward).
  monitor: {
    width: 0.597, // m
    height: 0.336, // m
    bezel: 0.0075, // m, all four sides, and the portrait monitor's too (2026-10-05)
    bezelRadius: 0.006, // m, the frame's outer corner radius (both monitors)
    bezelInnerRadius: 0.002, // m, the screen hole's corner radius
    bezelChamfer: 0.0012, // m, the chamfer on the frame's edges
    chin: 0.021, // m, NO LONGER DRAWN (the bezel is equal all round since 2026-10-05)
    depth: 0.026, // m, the panel's thin edge (0.018 before the car and the tile moved onto its top, 2026-09-27)
    back: 0.045, // m, the rear bulge
    x: -0.842,
    y: -1.9,
    dz: -0.0105, // m (fit: the centre is 0.19 m from the glass at W = 9 cm)
    yawDeg: -22.1,
  },
  // the portrait second monitor, off (22 inch 16:9 on its side), standing on the desk
  // against the wall; its top-right corner fit to the wide photo
  // base: its low dark steel stand (m). The desk sits 5 cm lower than round 1 had it
  // (5480: the BenQ's chin clears the desk by about a hand, and its pole and clamp
  // show under it), and the stand keeps the portrait's fitted top where it was
  // the framed napkin sketch on the wall above the portrait monitor (2026-10-05):
  // x, y its centre in W (y 0 is the sill top), size the frame's outer width in m
  tissueFrame: { x: -6.2, y: 5.2, size: 0.22, tiltDeg: -0.6 }, // 22 cm (2026-10-05: "make the frame smaller", was 30)
  portrait: { width: 0.285, height: 0.495, right: -4.53, z: 1.2, yawDeg: 8, base: 0.05, screen: { enabled: true, intensity: 0.35, bloom: 0.04 } }, // m, m, W, W, deg, m; screen: the AI code editor (room/codeScreen.js), emissive x
  // albedo: a dark walnut (5480 photographs it #21150a to #221a18 under the room
  // light); the grain in materials.js swings it 0.55x to 1.45x
  desk: { y: -5.0, zFar: 0.95, x0: -16, x1: 10, albedo: [0.028, 0.015, 0.0075] }, // W, m, W, W
  // the car and the tile ride ON THE MONITOR's top edge (2026-09-27, Agam; 5481 and
  // 5483 show them there): on "monitor", mx / mz are m in the monitor's own frame
  // (x along the screen from its centre, z from its front face, negative is back)
  // and myawDeg turns them on the edge; x, z, yawDeg (W, on the sill) apply only
  // when on is "sill"
  car: { on: "monitor", mx: 0.095, mz: -0.013, myawDeg: 2, x: 1.09, z: 1.05, yawDeg: -4 },
  // the Meteor 350 miniature took the souvenir tile's place (2026-09-27)
  bike: { on: "monitor", mx: -0.02, mz: -0.013, myawDeg: -6 },
  // 2026-10-05 (Agam: "build the zepto scooter and a bobble head of a golden
  // retriever, a vr headset"): the scooter (1:30, like the Meteor) left of the bike,
  // the bobblehead at the BenQ's right end, the headset parked on the portrait.
  // on "portrait": mx is m along its top from the centre, mz from its front face
  scooter: { hidden: true, on: "monitor", mx: -0.279, mz: -0.013, myawDeg: 5 }, // hidden: true parks it (Agam, 2026-10-05: "hide the scooter for now")
  bobblehead: { on: "portrait", mx: 0.063, mz: -0.016, myawDeg: 0 }, // moved to the left monitor (2026-10-05)
  vr: { on: "portrait", mx: -0.013, mz: -0.016, myawDeg: 0 },
  // the grey tabby bobblehead, beside the dog on the portrait (2026-10-05)
  // DEFAULTS (2026-10-05, Agam: "make these the default positions", from his
  // arranged screenshot): headset, dog, cat on the portrait; the scooter at the
  // BenQ's left end stop. In dev, window.__toyPositions() prints the exact values
  cat: { on: "portrait", mx: 0.097, mz: -0.016, myawDeg: 0 },
  tile: { on: "monitor", mx: 0.0, mz: -0.012, myawDeg: -3, x: -0.44, z: 0.95, length: 0.038, width: 0.024, yawDeg: 3 },
  // desk things that enter the closing shot (13-photo 6): x, z in W
  bottle: { x: -9.2, z: 5.2, height: 0.26, radius: 0.036 },
  dock: { x: -3.2, z: 4.2, yawDeg: -12 },
  motes: { enabled: false, count: 90, glow: 3.0 }, // Dreamlike: glowing specks in the lamp beam
};
