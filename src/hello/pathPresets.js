// Named paths for <PathMarquee>. A path is just an SVG `d` string plus the
// viewBox it was drawn in, so anything you can draw in Figma can be pasted in
// here and used by name. That is the point: the path is data, not code.
//
// Rules for adding one:
//  - keep it a SINGLE open subpath (one M, then curves). offset-path follows the
//    whole `d`, so a second M teleports items across the gap.
//  - draw it inside the viewBox you ship with it; the component scales the pair
//    together, so the numbers only have to agree with each other.
//  - leave headroom at the edges for the item size, or items clip at the bounds.

export const PATH_PRESETS = {
  // the reference shape: a long S that loops back on itself
  ribbon: {
    label: "Ribbon",
    viewBox: "0 0 996 330",
    d: "M1 209.434C58.5872 255.935 387.926 325.938 482.583 209.434C600.905 63.8051 525.516 -43.2211 427.332 19.9613C329.149 83.1436 352.902 242.723 515.041 267.302C644.752 286.966 943.56 181.94 995 156.5",
  },
  // IN FROM THE LEFT, OUT TO THE RIGHT (annotation msq2cguw: "animation is
  // flowing nicely but needs flow from left and flow out to the right").
  //
  // Every other preset here starts and ends ON the stage, so a tile appears out
  // of nothing at one edge and vanishes at the other - the wrap is visible, and
  // what you notice is the seam rather than the drift. This one starts at -320
  // and ends at 1320 in a 1000-wide box, so both ends of the run are off the
  // drawing: a tile is already moving before you can see it and keeps going
  // after it leaves. Nothing about the engine changed - the wrap still happens,
  // it just happens where there is no one watching.
  //
  // 320 EITHER SIDE WAS TOO MUCH, and this is the correction. Sized first to
  // clear the widest tile (~340) completely before its position recycles - but
  // that put 640 of the path's 1640 units off the drawing, so 40% of the run
  // was always somewhere you could not see it. Nine tiles became five or six on
  // stage, bunched, with holes where the rest were parked outside.
  //
  // 140 is a small tile's width. The seam sits just off the frame, and the
  // `fadeEdges` the marquee already applies (AlongPath passes 0.14) takes a
  // tile's opacity to zero before it gets there - so what would have been a pop
  // is a fade, and the extra 360 units of path stay on stage where the tiles
  // can be seen. Fading is the cheaper way to hide a seam than hiding it behind
  // the bezel: it costs no stage width at all.
  //
  // Shallow curve on purpose. The blueprint's frames sit at nine different
  // heights across a 1000x300 field - a drift, not a wave - so the y range here
  // is ~90px rather than the 180 the wave uses.
  flow: {
    label: "Flow",
    viewBox: "0 0 1000 300",
    d: "M-140 185C60 140 240 115 440 132C640 149 800 185 980 162C1060 152 1120 145 1140 140",
  },
  // WAVE, COPIED AND STRAIGHTENED (Agam, 2026-08-12: "create a copy of wave and
  // bring the simple version we built that went from left to right evenly with
  // no overlap").
  //
  // Same shape as `wave` below - one calm swell, drawn in the same 1000x300 box
  // - with two edits, and only two:
  //
  //  1. MONOTONIC IN X, and it matters more than it looks. `wave` ends with a
  //     rise back to (1000,130) after dipping to 150 at 750, which reads as the
  //     curve turning back on itself at the right-hand edge. Even spacing is
  //     computed across the path's WIDTH (see xTable in PathMarquee), so a
  //     stretch that doubles back gets two positions for one x and the run
  //     bunches exactly where it should be thinning out.
  //  2. INSIDE THE VIEWBOX, 0 to 1000, and this is a correction of a correction.
  //
  //     To hide the wrap I first ran the ends off-frame (-60/1060, then
  //     -170/1170). It does hide the seam - and it breaks something worse. The
  //     <svg> draws this path scaled to its own viewBox with `xMidYMid meet`,
  //     so ONLY 0..1000 is ever on the drawing; a path running -170..1170 spends
  //     25% of every lap outside it. The tiles were still following the path
  //     exactly - they were following it somewhere you cannot see, which reads
  //     as tiles that stop short of the curve at both ends.
  //
  //     So the path stays inside the box and `fadeEdges` alone hides the wrap.
  //     That is the right division of labour: geometry decides WHERE a tile
  //     goes, opacity decides whether you watch it arrive. Only opacity can hide
  //     a seam without also spending the curve.
  //
  // NO-OVERLAP IS NOT IN THIS PATH, and cannot be. Whether two tiles touch is
  // set by how many are on the run and how big they are - see the `spread` note
  // in AlongPath, which is where the arithmetic lives.
  even: {
    label: "Even",
    viewBox: "0 0 1000 300",
    d: "M0 168C160 112 320 108 500 150C680 192 840 196 1000 150",
  },
  // a calm wave: reads as a horizon rather than a trick
  wave: {
    label: "Wave",
    viewBox: "0 0 1000 300",
    d: "M0 150C125 60 250 60 375 150C500 240 625 240 750 150C875 60 950 90 1000 130",
  },
  // WAVE 2 (Agam, 2026-08-15, from a freeze-frame he drew): nine cards read
  // as a rising run on the left (small at bottom-left, climbing to a high
  // shelf), the hero card at dead centre, a dip to a low shelf on the right,
  // and a steep climb back to the top-right corner. Card centres measured off
  // his 2000x690 frame and mapped into this 1000x300 box:
  //   (35,204) (92,148) (150,78) (280,78) | (492,150) | (707,222) (832,200)
  //   (882,128) (925,70)
  // The path threads those: start low-left, plateau ~y78 across x150-280,
  // through the centre at (500,150), trough ~y226 around x720, then up to
  // (930,60) and out at the top-right. Monotonic in x, like `flow`.
  wave2: {
    label: "Wave 2",
    viewBox: "0 0 1000 300",
    // re-fitted against the measured centres (max miss 14px at x150; the
    // rest within 6): 
    d: "M0 232C50 226 108 88 200 70C300 72 400 150 500 150C600 150 680 236 780 228C845 222 862 150 888 112C912 76 960 46 1000 46",
    // WHERE THE NINE SIT, as fractions of the width (PathMarquee's warpX
    // reads this): the frame's own uneven rhythm - four bunched on the left
    // climb, the hero alone at the centre, four bunched on the right climb.
    xs: [0.035, 0.09, 0.15, 0.28, 0.492, 0.707, 0.832, 0.882, 0.925],
    // AND HOW BIG (Agam: "exactly like the reference"): card widths off the
    // same frame, hero = 1: 130/170/205/250 | 530 | 250/205/170/130 px. The
    // depth ladder is bypassed for this preset (PathMarquee.scaleAt), so the
    // hero is the one large card and the two wings step down identically.
    ss: [0.245, 0.32, 0.39, 0.47, 1, 0.47, 0.39, 0.32, 0.245],
  },
  // a closed loop, so the run never visibly restarts
  loop: {
    label: "Loop",
    viewBox: "0 0 1000 340",
    d: "M500 40C750 40 940 105 940 170C940 235 750 300 500 300C250 300 60 235 60 170C60 105 250 40 500 40Z",
  },
  // a lazy figure eight: two crossings, so items pass in front of each other
  eight: {
    label: "Figure eight",
    viewBox: "0 0 1000 340",
    d: "M500 170C620 60 900 60 900 170C900 280 620 280 500 170C380 60 100 60 100 170C100 280 380 280 500 170Z",
  },
  // straight, for when the path should get out of the way entirely
  line: {
    label: "Straight",
    viewBox: "0 0 1000 200",
    d: "M0 100L1000 100",
  },
  // a gentle arc, like something resting on a shelf
  arc: {
    label: "Arc",
    viewBox: "0 0 1000 300",
    d: "M20 250C220 60 780 60 980 250",
  },
};

export const PATH_KEYS = Object.keys(PATH_PRESETS);
