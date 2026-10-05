// Pixel mascot: the portfolio's doodle-face avatar (MorphFace) translated into an
// 8-bit sprite system, adapted from the "Animated Pixel Mascot" pipeline but fully
// hand-coded (no image gen, no chroma key: transparency and theme-awareness are free
// because every pixel is authored).
//
// The system: ONE master grid (the character at rest) plus small overlay sprites and
// row-level edits generate every animation frame. Frames are arrays of strings, one
// char per pixel cell:
//   "." transparent   "#" ink (theme-aware, currentColor)   "o" accent
// All motion is 12fps STEPPED (frame flips, no tweening) so it reads as a game
// sprite; the guide's "hard pixel grid, no motion blur, camera static" rules map to
// shape-rendering: crispEdges + integer cell offsets + a fixed viewBox.

export const GRID_W = 20;
export const GRID_H = 18;

// Master still, pixelated from the Figma base slate (Portfolio Landing Page,
// node 1724-23069): the full doodle avatar. Solid swoosh of hair peaking up to
// the right, left ear, two dot eyes with the right brow raised, a small nose,
// the smile, jaw tapering to the chin. 20x18 so hands and z's have air.
const BASE = [
  "..........####......",
  "......##########....",
  "....#############...",
  "...##############...",
  "...##############...",
  "..###.........####..",
  "...#........##..#...",
  "...#..##........#...",
  ".#.#..##....##..#...",
  ".#.#..##....##..#...",
  "..##............#...",
  "...#.....#......#...",
  "...#.....##.....#...",
  "....#...####...#....",
  ".....#........#.....",
  "......########......",
  "....................",
  "....................",
];

/* ---------- grid helpers (the whole authoring system) ---------- */

const toRows = (g) => g.map((r) => r.split(""));
const toGrid = (rows) => rows.map((r) => r.join(""));

// Stamp a sprite (array of strings, "." = skip) onto a grid at cell x,y.
export function blit(grid, sprite, x, y) {
  const rows = toRows(grid);
  sprite.forEach((sr, dy) => {
    for (let dx = 0; dx < sr.length; dx += 1) {
      const ch = sr[dx];
      if (ch === ".") continue;
      const gy = y + dy;
      const gx = x + dx;
      if (gy < 0 || gy >= GRID_H || gx < 0 || gx >= GRID_W) continue;
      rows[gy][gx] = ch;
    }
  });
  return toGrid(rows);
}

// Clear a rectangle back to transparent.
export function clearRect(grid, x, y, w, h) {
  const rows = toRows(grid);
  for (let gy = y; gy < y + h; gy += 1) {
    for (let gx = x; gx < x + w; gx += 1) {
      if (gy < 0 || gy >= GRID_H || gx < 0 || gx >= GRID_W) continue;
      rows[gy][gx] = ".";
    }
  }
  return toGrid(rows);
}

// Shift the whole grid down by dy cells (positive = down), padding with air.
export function shiftDown(grid, dy) {
  const air = ".".repeat(GRID_W);
  if (dy <= 0) return grid;
  return [...Array(dy).fill(air), ...grid.slice(0, GRID_H - dy)];
}

// Shift the whole grid up (launch); the top dy rows fall off, air pads the bottom.
export function shiftUp(grid, dy) {
  const air = ".".repeat(GRID_W);
  if (dy <= 0) return grid;
  return [...grid.slice(dy), ...Array(dy).fill(air)];
}

// Mirror horizontally (the far side of a coin spin).
export function mirror(grid) {
  return grid.map((r) => r.split("").reverse().join(""));
}

// Every ink pixel becomes accent (a ghost of the character).
const toGhost = (g) => g.map((r) => r.replace(/#/g, "o"));

// Overlay a on b: a's pixels win, b shows through a's air (the echo trail).
const over = (a, b) =>
  a.map((row, y) =>
    row
      .split("")
      .map((ch, x) => (ch !== "." ? ch : b[y][x]))
      .join(""),
  );

// Shift the whole grid horizontally (the head-shake move).
export function shiftX(grid, dx) {
  const air = ".".repeat(GRID_W);
  return grid.map((row) => {
    if (dx > 0) return (air.slice(0, dx) + row).slice(0, GRID_W);
    if (dx < 0) return (row + air.slice(0, -dx)).slice(-GRID_W);
    return row;
  });
}

// Shift a band of rows horizontally (the glitch move).
export function shiftRows(grid, from, to, dx) {
  const air = ".".repeat(GRID_W);
  return grid.map((row, y) => {
    if (y < from || y > to) return row;
    if (dx > 0) return (air.slice(0, dx) + row).slice(0, GRID_W);
    return (row + air.slice(0, -dx)).slice(-GRID_W);
  });
}

/* ---------- feature edits ---------- */

// Eyes live at cols 6-7 and 12-13, rows 8-9 (2x2 blocks).
const eyesClosed = (g) => {
  let out = clearRect(g, 6, 8, 2, 1);
  out = clearRect(out, 12, 8, 2, 1);
  return out;
};
const eyesShut = (g) => {
  let out = clearRect(g, 6, 8, 2, 2);
  out = clearRect(out, 12, 8, 2, 2);
  out = blit(out, ["##"], 6, 9);
  return blit(out, ["##"], 12, 9);
};
// Mouth at cols 8-11 row 13.
const mouthSmall = (g) => blit(clearRect(g, 8, 13, 4, 1), ["##"], 9, 13);
const mouthOpen = (g) => blit(clearRect(g, 8, 13, 4, 1), ["####", ".##."], 8, 13);
// Move both eyes by a cell offset (think looks up, dizzy orbits).
const eyesAt = (g, dx, dy) => {
  let out = clearRect(g, 6, 8, 2, 2);
  out = clearRect(out, 12, 8, 2, 2);
  out = blit(out, ["##", "##"], 6 + dx, 8 + dy);
  return blit(out, ["##", "##"], 12 + dx, 8 + dy);
};
// Wide-open eureka eyes (3 wide).
const eyesWide = (g) => {
  let out = clearRect(g, 6, 8, 2, 2);
  out = clearRect(out, 12, 8, 2, 2);
  out = blit(out, ["###", "###"], 5, 8);
  return blit(out, ["###", "###"], 11, 8);
};

/* ---------- overlay sprites ---------- */

// A chubby 4-finger-family pixel hand (open palm), two wave positions.
const HAND_UP = ["#.#.#", "#####", ".###.", "..#.."];
const HAND_TILT = ["..#.#", ".####", "####.", ".#..."];

// Sleep z's, three sizes.
const Z1 = ["oo", ".o", "oo"];
const Z2 = ["ooo", "..o", ".o.", "ooo"];

// Thought dots, the eureka spark, and a music note (all accent).
const DOT = ["o"];
const DOT2 = ["oo", "oo"];
const SPARK_S = [".o.", "ooo", ".o."];
const SPARK_L = ["..o..", "..o..", "ooooo", "..o..", "..o.."];
const NOTE = [".o", ".o", ".o", "oo"];

/* ---------- actions ---------- */

const idleA = BASE;
const idleB = shiftDown(BASE, 1); // the float bob
const blinkA = eyesClosed(BASE);
const blinkB = eyesShut(BASE);

const waveBase = mouthOpen(BASE);
const wave1 = blit(waveBase, HAND_UP, 15, 9);
const wave2 = blit(shiftDown(waveBase, 1), HAND_TILT, 15, 11);

const sleepBase = mouthSmall(eyesShut(BASE));
const sleep1 = blit(sleepBase, Z1, 18, 1);
const sleep2 = blit(blit(shiftDown(sleepBase, 1), Z1, 18, 2), Z2, 17, 0);
const sleep3 = blit(shiftDown(sleepBase, 1), Z2, 17, 0);

// Think: eyes drift up-left, thought dots build toward a bubble.
const thinkBase = eyesAt(mouthSmall(BASE), -1, -1);
const think1 = thinkBase;
const think2 = blit(thinkBase, DOT, 18, 4);
const think3 = blit(think2, DOT, 18, 2);
const think4 = blit(think3, DOT2, 17, 0);

// Eureka: the spark pops above the swoosh, eyes go wide.
const eurekaCalm = mouthSmall(BASE);
const eureka1 = blit(eyesWide(mouthOpen(BASE)), SPARK_S, 16, 0);
const eureka2 = blit(eyesWide(mouthOpen(BASE)), SPARK_L, 15, 0);

// Vibe: eyes shut happy, notes float, the head keeps the beat.
const vibeBase = mouthOpen(eyesShut(BASE));
const vibe1 = blit(vibeBase, NOTE, 16, 1);
const vibe2 = blit(shiftDown(vibeBase, 1), NOTE, 17, 3);
const vibe3 = blit(vibeBase, NOTE, 17, 0);
const vibe4 = blit(shiftDown(vibeBase, 1), NOTE, 16, 2);

// Spin: a coin flip. Face, edge-on slab, mirrored face, edge-on again.
const EDGE = [
  "....................",
  "........####........",
  "........####........",
  "........####........",
  "........####........",
  "........####........",
  "........####........",
  "........####........",
  "........####........",
  "........####........",
  "........####........",
  "........####........",
  "........####........",
  "........####........",
  ".........##.........",
  "....................",
  "....................",
  "....................",
];
const spinMirror = mirror(BASE);

// Melt: the head sinks into a widening pool, ends as a puddle with eyes, recovers.
const PUDDLE = [
  ...Array(13).fill(".".repeat(GRID_W)),
  "....................",
  "......##....##......",
  "....##########......",
  "..################..",
  "....##########......",
];
const melt1 = shiftDown(BASE, 1);
const melt2 = blit(shiftDown(BASE, 3), ["############"], 4, 17);
const melt3 = blit(blit(shiftDown(BASE, 6), ["##############"], 3, 17), ["##########"], 5, 16);

// Launch: flame under the chin, up and out the top, a beat of empty sky,
// then back down with a squash landing.
const AIR_FRAME = Array(GRID_H).fill(".".repeat(GRID_W));
const flameA = blit(BASE, ["o..o", ".oo.", ".o.."], 8, 15);
const flameB = blit(BASE, [".oo.", "o..o", "..o."], 8, 15);
const up2 = blit(shiftUp(BASE, 2), ["o..o", ".oo."], 8, 14);
const up5 = blit(shiftUp(BASE, 5), ["o..o", ".oo."], 8, 11);
const up10 = shiftUp(BASE, 10);
const down6 = shiftUp(BASE, 6);
const down3 = shiftUp(BASE, 3);
const land = shiftDown(BASE, 1);

// Echo: an accent ghost trails the head, swapping sides.
const echo1 = over(BASE, toGhost(shiftX(shiftDown(BASE, 1), 2)));
const echo2 = over(BASE, toGhost(shiftX(shiftDown(BASE, 1), -2)));

// Wink: the left eye drops for a beat.
const wink1 = clearRect(BASE, 6, 8, 2, 1);

// Sketch: eyes down at the work, an accent line draws itself under the chin.
const sketchBase = eyesAt(mouthSmall(BASE), 0, 1);
const sketch1 = blit(sketchBase, ["ooo"], 5, 16);
const sketch2 = blit(sketchBase, ["oooooo"], 5, 16);
const sketch3 = blit(sketchBase, ["ooooooooo"], 5, 16);
const sketch4 = blit(sketchBase, ["oooooooooooo"], 5, 16);

// Love: hearts where the eyes were, one drifting off.
const loveBase = (g) => {
  let out = clearRect(g, 6, 8, 2, 2);
  out = clearRect(out, 12, 8, 2, 2);
  return out;
};
const love1 = blit(blit(loveBase(mouthOpen(BASE)), ["oo", "oo"], 6, 8), ["oo", "oo"], 12, 8);
const love2 = blit(blit(loveBase(mouthOpen(BASE)), ["o"], 7, 8), ["o"], 13, 8);
const love3 = blit(love1, ["o"], 17, 2);
const love4 = blit(love2, ["oo", "oo"], 17, 0);

// Gasp: the head pops up, eyes and mouth blow open, surprise ticks fly.
const gaspCalm = shiftDown(mouthSmall(BASE), 1);
const gaspOn = blit(
  blit(
    blit(eyesWide(clearRect(BASE, 8, 13, 4, 1)), ["####", "####"], 8, 13),
    ["o"],
    5,
    0,
  ),
  ["o", ".o"],
  2,
  1,
);
const gasp1 = blit(gaspOn, ["o"], 16, 1);

// Nope: a quick side-to-side head shake, then rest.
const nopeL = shiftX(BASE, -1);
const nopeR = shiftX(BASE, 1);

// Dizzy: the head shears while the eyes orbit.
const shearA = shiftRows(shiftRows(BASE, 2, 6, 1), 10, 14, -1);
const shearB = shiftRows(shiftRows(BASE, 2, 6, -1), 10, 14, 1);
const dizzy1 = eyesAt(shearA, 0, -1);
const dizzy2 = eyesAt(BASE, 1, 0);
const dizzy3 = eyesAt(shearB, 0, 1);
const dizzy4 = eyesAt(BASE, -1, 0);

const glitch1 = shiftRows(shiftRows(BASE, 7, 9, 2), 12, 14, -1);
const glitch2 = blit(shiftRows(shiftRows(BASE, 1, 4, -2), 10, 11, 1), ["oooo"], 4, 7);
const glitch3 = blit(shiftRows(BASE, 8, 13, 1), ["oo", "oo"], 15, 14);

// Each action: frames + fps. Idle blinks every couple of seconds and bobs; the
// others are the guide's classic loop set. Frames repeat to hold poses (stepped
// timing is authored by repetition, not by per-frame durations).
export const ACTIONS = {
  idle: {
    label: "Idle",
    fps: 12,
    frames: [
      ...Array(10).fill(idleA),
      ...Array(10).fill(idleB),
      ...Array(8).fill(idleA),
      blinkA,
      blinkB,
      blinkB,
      blinkA,
      ...Array(4).fill(idleA),
      ...Array(10).fill(idleB),
    ],
  },
  wave: {
    label: "Wave",
    fps: 12,
    frames: [
      ...Array(3).fill(wave1),
      ...Array(3).fill(wave2),
      ...Array(3).fill(wave1),
      ...Array(3).fill(wave2),
      ...Array(3).fill(wave1),
      ...Array(4).fill(mouthOpen(idleB)),
    ],
  },
  wink: {
    label: "Wink",
    fps: 12,
    frames: [
      ...Array(12).fill(BASE),
      ...Array(5).fill(wink1),
      ...Array(9).fill(BASE),
    ],
  },
  think: {
    label: "Think",
    fps: 12,
    frames: [
      ...Array(8).fill(think1),
      ...Array(5).fill(think2),
      ...Array(5).fill(think3),
      ...Array(14).fill(think4),
      ...Array(4).fill(think1),
    ],
  },
  sketch: {
    label: "Sketch",
    fps: 12,
    frames: [
      ...Array(6).fill(sketchBase),
      ...Array(4).fill(sketch1),
      ...Array(4).fill(sketch2),
      ...Array(4).fill(sketch3),
      ...Array(12).fill(sketch4),
      ...Array(4).fill(sketchBase),
    ],
  },
  eureka: {
    label: "Eureka",
    fps: 12,
    frames: [
      ...Array(8).fill(eurekaCalm),
      ...Array(3).fill(eureka1),
      ...Array(10).fill(eureka2),
      ...Array(3).fill(eureka1),
      ...Array(4).fill(eurekaCalm),
    ],
  },
  vibe: {
    label: "Vibe",
    fps: 12,
    frames: [
      ...Array(4).fill(vibe1),
      ...Array(4).fill(vibe2),
      ...Array(4).fill(vibe3),
      ...Array(4).fill(vibe4),
    ],
  },
  love: {
    label: "Love",
    fps: 12,
    frames: [
      ...Array(6).fill(love1),
      ...Array(6).fill(love2),
      ...Array(6).fill(love3),
      ...Array(6).fill(love4),
    ],
  },
  gasp: {
    label: "Gasp",
    fps: 12,
    frames: [
      ...Array(10).fill(gaspCalm),
      ...Array(3).fill(gaspOn),
      ...Array(10).fill(gasp1),
      ...Array(5).fill(gaspCalm),
    ],
  },
  sleep: {
    label: "Sleep",
    fps: 12,
    frames: [
      ...Array(8).fill(sleep1),
      ...Array(8).fill(sleep2),
      ...Array(8).fill(sleep3),
      ...Array(8).fill(blit(sleepBase, Z2, 17, 2)),
    ],
  },
  nope: {
    label: "Nope",
    fps: 12,
    frames: [
      ...Array(10).fill(BASE),
      ...Array(2).fill(nopeL),
      ...Array(2).fill(nopeR),
      ...Array(2).fill(nopeL),
      ...Array(2).fill(nopeR),
      ...Array(10).fill(BASE),
    ],
  },
  dizzy: {
    label: "Dizzy",
    fps: 12,
    frames: [
      ...Array(3).fill(dizzy1),
      ...Array(3).fill(dizzy2),
      ...Array(3).fill(dizzy3),
      ...Array(3).fill(dizzy4),
    ],
  },
  spin: {
    label: "Spin",
    fps: 12,
    frames: [
      ...Array(6).fill(BASE),
      ...Array(2).fill(EDGE),
      ...Array(4).fill(spinMirror),
      ...Array(2).fill(EDGE),
      ...Array(4).fill(BASE),
      ...Array(2).fill(EDGE),
      ...Array(4).fill(spinMirror),
      ...Array(2).fill(EDGE),
    ],
  },
  melt: {
    label: "Melt",
    fps: 12,
    frames: [
      ...Array(8).fill(BASE),
      ...Array(3).fill(melt1),
      ...Array(3).fill(melt2),
      ...Array(3).fill(melt3),
      ...Array(10).fill(PUDDLE),
      ...Array(2).fill(melt3),
      ...Array(2).fill(melt2),
      ...Array(2).fill(melt1),
    ],
  },
  launch: {
    label: "Launch",
    fps: 12,
    frames: [
      ...Array(8).fill(BASE),
      flameA,
      flameB,
      flameA,
      flameB,
      up2,
      up5,
      up10,
      ...Array(5).fill(AIR_FRAME),
      up10,
      down6,
      down3,
      ...Array(2).fill(land),
      ...Array(6).fill(BASE),
    ],
  },
  echo: {
    label: "Echo",
    fps: 12,
    frames: [
      ...Array(6).fill(BASE),
      ...Array(3).fill(echo1),
      ...Array(3).fill(echo2),
      ...Array(2).fill(echo1),
      ...Array(2).fill(echo2),
      ...Array(6).fill(BASE),
    ],
  },
  glitch: {
    label: "Glitch",
    fps: 12,
    frames: [
      ...Array(6).fill(idleA),
      glitch1,
      glitch2,
      idleA,
      glitch3,
      glitch1,
      ...Array(8).fill(idleA),
      glitch2,
      idleA,
    ],
  },
};

export const ACTION_KEYS = Object.keys(ACTIONS);

// Sequences: chained actions that give the mascot an inner life (a question,
// then an answer) instead of a single loop. Durations align with each action's
// natural cycle so a step always hands over at a clean beat.
export const SEQUENCES = {
  ponder: {
    label: "Ponder",
    steps: [
      { action: "think", ms: 3400 },
      { action: "eureka", ms: 2600 },
      { action: "idle", ms: 4200 },
    ],
  },
  studio: {
    label: "Studio day",
    steps: [
      { action: "idle", ms: 4200 },
      { action: "think", ms: 3400 },
      { action: "eureka", ms: 2600 },
      { action: "vibe", ms: 3720 },
      { action: "dizzy", ms: 2800 },
      { action: "sleep", ms: 5400 },
    ],
  },
};

SEQUENCES.making = {
  label: "Making of",
  steps: [
    { action: "idle", ms: 4200 },
    { action: "think", ms: 3400 },
    { action: "sketch", ms: 3600 },
    { action: "eureka", ms: 2600 },
    { action: "vibe", ms: 3720 },
  ],
};
SEQUENCES.charm = {
  label: "Charm",
  steps: [
    { action: "wave", ms: 3600 },
    { action: "wink", ms: 2600 },
    { action: "idle", ms: 4200 },
  ],
};

SEQUENCES.chaos = {
  label: "Chaos",
  steps: [
    { action: "gasp", ms: 3200 },
    { action: "spin", ms: 2160 },
    { action: "dizzy", ms: 2800 },
    { action: "melt", ms: 2760 },
    { action: "glitch", ms: 2500 },
    { action: "idle", ms: 4200 },
  ],
};

export const SEQUENCE_KEYS = Object.keys(SEQUENCES);

/* ---------- export ---------- */

// Standalone SVG of one frame (for copy-paste into Figma or anywhere): ink is
// baked to a hex so the asset works outside the site's theme.
export function standaloneSvg(grid, { ink = "#1A1A1A", accent = "#D96B3F", cell = 8 } = {}) {
  const rects = [];
  grid.forEach((row, y) => {
    for (let x = 0; x < row.length; x += 1) {
      const ch = row[x];
      if (ch === ".") continue;
      const fill = ch === "o" ? accent : ink;
      rects.push(`<rect x="${x * cell}" y="${y * cell}" width="${cell}" height="${cell}" fill="${fill}"/>`);
    }
  });
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${GRID_W * cell} ${GRID_H * cell}" shape-rendering="crispEdges">${rects.join("")}</svg>`;
}

export const MASTER = BASE;
