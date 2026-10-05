// ---------------------------------------------------------------------------
// Perfect overlap — the full set of five, done right.
// Real brick screens don't get their pattern from rotating bricks into
// diamonds with air between them. The bricks are laid in ONE uniform,
// perfectly touching grid (running bond, zero gap, every seam shared exactly
// with its neighbour), and the pattern is sculpted afterwards by pushing
// individual bricks forward or back along the wall's own depth axis. The
// raking key light — the camera — is what turns that depth map into a
// visible pattern. Flatten the camera and the pattern disappears, because it
// was never anything but a perfectly uniform, gapless wall.
//
// All five patterns below share the SAME grid and the SAME rules — the only
// thing that changes is the depth field t(x, y) that decides how far each
// brick is pushed. No rotation, no spacing, no missing bricks. Ever.
// ---------------------------------------------------------------------------

// continuous triangle wave, period 1, 0 at integers, 1 at half-integers
function triCont(n) {
  const m = ((n % 1) + 1) % 1;
  return 1 - Math.abs(m - 0.5) * 2;
}

// fractional part in [0,1) that behaves for negatives too
function sawFrac(n) {
  return ((n % 1) + 1) % 1;
}

// integer parity that behaves for negatives
function parity(n) {
  return (((n % 2) + 2) % 2) === 0;
}

function reliefTone(t, i, j) {
  const dark = [104, 54, 40];
  const light = [226, 180, 124];
  const jitter = (hash(i, j) - 0.5) * 14;
  return [
    dark[0] + (light[0] - dark[0]) * t + jitter,
    dark[1] + (light[1] - dark[1]) * t + jitter * 0.8,
    dark[2] + (light[2] - dark[2]) * t + jitter * 0.6,
  ];
}

// The relief grid uses a smaller unit than the hero bonds — SAME 4:2:1 ratio,
// just scaled down so the depth field has enough bricks to actually resolve a
// diamond or a chevron instead of aliasing into streaks. This is still a real
// brick (length : width : height = 4 : 2 : 1), just a smaller module.
const U = { L: BRICK.L * 0.8, H: BRICK.H * 0.8, W: BRICK.W * 0.8 };

// The one grid everything is built on: a uniform running bond — every brick
// the same size and orientation, stepped by exactly its own footprint so
// edges coincide with zero gap. Alternate rows offset by half a brick, same
// as a real coursed wall.
function uniformRunningBond(w, h) {
  const stepX = U.L, stepY = U.H; // no gap term — bricks touch exactly
  const cols = Math.ceil(w / stepX / 2) + 2;
  const rows = Math.ceil(h / stepY / 2) + 2;
  const cells = [];
  for (let j = -rows; j <= rows; j++) {
    for (let i = -cols; i <= cols; i++) {
      const rowOffset = Math.abs(j % 2) === 1 ? stepX / 2 : 0;
      const x = i * stepX + rowOffset;
      const y = j * stepY;
      if (Math.abs(x) > w / 2 + stepX || Math.abs(y) > h / 2 + stepY) continue;
      cells.push({ i, j, x, y });
    }
  }
  return cells;
}

// Turn a depth field t(x, y) ∈ [0,1] into a full brick set on the shared grid.
function reliefFrom(w, h, maxPop, field) {
  return uniformRunningBond(w, h).map(({ i, j, x, y }) => {
    const t = Math.max(0, Math.min(1, field(x, y, i, j)));
    return { x, y, z: (t - 0.5) * maxPop, dims: [U.L, U.H, U.W], color: reliefTone(t, i, j) };
  });
}

// ---------------------------------------------------------------------------
// The five depth fields — one per pattern in the reference plate.
// ---------------------------------------------------------------------------

// 1 — Diamond trellis: concentric diamonds. Manhattan distance to the nearest
// node of a diagonal lattice, wrapped into two rings → diamond-within-diamond.
function genDiamondTrellisRelief(w, h) {
  const cell = U.L * 5;
  return reliefFrom(w, h, U.W * 0.7, (x, y) => {
    const du = (x + y) / cell, dv = (x - y) / cell;
    const fu = du - Math.round(du), fv = dv - Math.round(dv);
    const r = Math.abs(fu) + Math.abs(fv); // 0 at node .. ~1 at cell edge
    return triCont(r * 2);                  // two nested diamond rings per cell
  });
}

// 2 — Herringbone: horizontal bands whose diagonal ridge direction flips
// every band, so the ridges meet in a continuous zigzag chevron.
function genHerringboneRelief(w, h) {
  const period = U.L * 3;
  const bandH = U.H * 13;
  return reliefFrom(w, h, U.W * 0.65, (x, y) => {
    const band = Math.floor(y / bandH);
    const dir = parity(band) ? 1 : -1;
    return triCont((x + dir * y) / period);
  });
}

// 3 — Basket weave: blocks of bricks pushed forward or back together in a
// checkerboard — the weave read purely as stepped depth, no rotation.
function genBasketRelief(w, h) {
  const bc = 4, br = 16; // block ≈ square: 4·U.L wide × 16·U.H tall
  return reliefFrom(w, h, U.W * 0.7, (x, y, i, j) => {
    const bi = Math.floor(i / bc), bj = Math.floor(j / br);
    return parity(bi + bj) ? 0.82 : 0.18;
  });
}

// 4 — Diagonal weave: crossed diagonals → a field of small diamond pyramids,
// matching the tight diagonal weave in the plate.
function genDiagonalWeaveRelief(w, h) {
  const p = U.L * 2.6;
  return reliefFrom(w, h, U.W * 0.55, (x, y) =>
    Math.min(triCont((x + y) / p), triCont((x - y) / p))
  );
}

// 5 — Cube studs: raised squares on a grid — the tumbling-block / 3D cube
// motif read as gently corbelled brick studs.
function genCubeStudRelief(w, h) {
  const cell = U.L * 3.5;
  return reliefFrom(w, h, U.W * 0.85, (x, y) => {
    const xl = Math.abs(sawFrac(x / cell) - 0.5) * 2;
    const yl = Math.abs(sawFrac(y / cell) - 0.5) * 2;
    const r = Math.max(xl, yl);
    return r < 0.62 ? 0.85 : 0.15; // flat-topped studs, gentle step
  });
}

// ---------------------------------------------------------------------------
// View builders — this file loads last, so every generator (rotated bonds in
// brick-jali.js, relief fields here) and both factories (makeBrickSketch,
// makeHoverTessellation) are defined. Each builder creates its view's p5
// sketches and returns the instances so the page can .remove() them when the
// tab is left — keeping only one view's WebGL contexts alive at a time.
// ---------------------------------------------------------------------------

window.buildBonds = () => [
  makeBrickSketch('p1', 880, 300, genDiamondTrellis, { baseRotX: -14, baseRotY: 6 }),
  makeBrickSketch('p2', 424, 300, genHerringbone, { baseRotX: -16, baseRotY: 8 }),
  makeBrickSketch('p3', 424, 300, genBasketWeave, { baseRotX: -16, baseRotY: -8 }),
  makeBrickSketch('p4', 424, 300, genDiagonalCoursing, { baseRotX: -14, baseRotY: 6 }),
  makeBrickSketch('p5', 424, 300, genPerforatedJali, { baseRotX: -20, baseRotY: 10 }),
];

// line versions of the Five bonds — rotated-brick construction
window.buildHover = () => [
  makeHoverTessellation('h1', 880, 300, genDiamondTrellis, { baseRotX: -14, baseRotY: 6 }),
  makeHoverTessellation('h2', 424, 300, genHerringbone, { baseRotX: -16, baseRotY: 8 }),
  makeHoverTessellation('h3', 424, 300, genBasketWeave, { baseRotX: -16, baseRotY: -8 }),
  makeHoverTessellation('h4', 424, 300, genDiagonalCoursing, { baseRotX: -14, baseRotY: 6 }),
  makeHoverTessellation('h5', 424, 300, genPerforatedJali, { baseRotX: -20, baseRotY: 10 }),
];

// line versions of the Perfect overlap reliefs — uniform grid, depth only
window.buildLines = () => [
  makeHoverTessellation('hr1', 880, 320, genDiamondTrellisRelief, { baseRotX: -14, baseRotY: 6 }),
  makeHoverTessellation('hr2', 424, 300, genHerringboneRelief, { baseRotX: -14, baseRotY: 6 }),
  makeHoverTessellation('hr3', 424, 300, genBasketRelief, { baseRotX: -14, baseRotY: -6 }),
  makeHoverTessellation('hr4', 424, 300, genDiagonalWeaveRelief, { baseRotX: -14, baseRotY: 6 }),
  makeHoverTessellation('hr5', 424, 300, genCubeStudRelief, { baseRotX: -16, baseRotY: 7 }),
];

window.buildRelief = () => [
  makeBrickSketch('r1', 880, 340, genDiamondTrellisRelief, { baseRotX: -11, baseRotY: 6 }),
  makeBrickSketch('r2', 424, 300, genHerringboneRelief, { baseRotX: -11, baseRotY: 6 }),
  makeBrickSketch('r3', 424, 300, genBasketRelief, { baseRotX: -11, baseRotY: -6 }),
  makeBrickSketch('r4', 424, 300, genDiagonalWeaveRelief, { baseRotX: -11, baseRotY: 6 }),
  makeBrickSketch('r5', 424, 300, genCubeStudRelief, { baseRotX: -13, baseRotY: 7 }),
];
