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
  // a calm wave: reads as a horizon rather than a trick
  wave: {
    label: "Wave",
    viewBox: "0 0 1000 300",
    d: "M0 150C125 60 250 60 375 150C500 240 625 240 750 150C875 60 950 90 1000 130",
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
