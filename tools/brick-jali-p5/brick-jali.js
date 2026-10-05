// ---------------------------------------------------------------------------
// One brick, five jali bonds.
// The cuboid keeps a fixed 4:2:1 ratio (length:width:height, close to a
// standard modular brick). Every pattern below is just that same box(),
// re-rotated, re-spaced, and occasionally shown a different face.
// ---------------------------------------------------------------------------

const BRICK = { L: 84, W: 42, H: 21 }; // length : width : height = 4 : 2 : 1

// deterministic pseudo-random per grid cell (no Math.random flicker per frame)
function hash(i, j) {
  const x = Math.sin(i * 127.1 + j * 311.7) * 43758.5453;
  return x - Math.floor(x);
}

// warm fired-clay palette sampled from the reference plate
const PALETTE = [
  [156, 74, 48],   // deep terracotta
  [193, 104, 60],  // burnt orange
  [122, 64, 48],   // clay brown
  [217, 161, 92],  // warm tan
  [232, 192, 136], // highlight tan
];

function tone(i, j, biasToHighlight = 0) {
  const t = hash(i, j);
  const idx = Math.min(PALETTE.length - 1, Math.floor((t + biasToHighlight) * PALETTE.length));
  const base = PALETTE[idx];
  const jitter = (hash(j, i) - 0.5) * 18;
  return [base[0] + jitter, base[1] + jitter * 0.8, base[2] + jitter * 0.6];
}

// ---------------------------------------------------------------------------
// Pattern generators — each returns an array of brick instances:
// { x, y, z, rz, rx, ry, dims:[w,h,d], color:[r,g,b] }
// ---------------------------------------------------------------------------

// Shared construction for the two diamond-bond patterns: two interleaved
// families of bricks, one rotated +45° and one -45°, offset by a half cell
// so they cross like a woven trellis instead of just parallel diagonal bars.
// gapFactor controls how open the diamond apertures between crossings are —
// wide for an airy perforated trellis, tight for solid diagonal coursing.
function genDiamondWeave(w, h, { scale = 1, gapFactor = 1.3, pop = 0 } = {}) {
  const L = BRICK.L * scale, H = BRICK.H * scale, W = BRICK.W;
  const cell = ((L + H) / Math.SQRT2) * gapFactor;
  const cols = Math.ceil(w / cell / 2) + 2;
  const rows = Math.ceil(h / cell / 2) + 2;
  const out = [];
  const place = (i, j, offX, offY, rz, famSeed) => {
    const x = i * cell + offX;
    const y = j * cell + offY;
    if (Math.abs(x) > w / 2 + cell || Math.abs(y) > h / 2 + cell) return;
    const z = pop ? (hash(i + famSeed, j) > 0.72 ? pop : hash(i + famSeed, j) < 0.18 ? -pop * 0.6 : 0) : 0;
    out.push({ x, y, z, rz, dims: [L, H, W], color: tone(i + famSeed, j, z > 0 ? 0.4 : 0) });
  };
  for (let j = -rows; j <= rows; j++) {
    for (let i = -cols; i <= cols; i++) {
      place(i, j, 0, 0, 45, 0);            // family A — one diagonal
      place(i, j, cell / 2, cell / 2, -45, 500); // family B — crossing diagonal
    }
  }
  return out;
}

// 1 — Diamond trellis: open weave, a few crossings popped forward in Z for
// the raking-light relief seen in the plate.
function genDiamondTrellis(w, h) {
  return genDiamondWeave(w, h, { scale: 0.62, gapFactor: 1.55, pop: 10 });
}

// 2 — Herringbone: 2:1 face, checkerboard ±45° rotation, tight spacing so
// neighbours interlock edge-to-edge into continuous zigzag chevrons.
function genHerringbone(w, h) {
  const L = BRICK.L * 0.62, W = BRICK.W * 0.62, H = BRICK.H;
  const cell = ((L + W) / Math.SQRT2) * 1.0; // no gap — bricks touch
  const cols = Math.ceil(w / cell / 2) + 2;
  const rows = Math.ceil(h / cell / 2) + 2;
  const out = [];
  for (let j = -rows; j <= rows; j++) {
    for (let i = -cols; i <= cols; i++) {
      const x = i * cell + (Math.abs(j % 2) === 1 ? cell / 2 : 0);
      const y = j * cell;
      if (Math.abs(x) > w / 2 + cell || Math.abs(y) > h / 2 + cell) continue;
      const parity = ((i % 2) + (j % 2) + 2) % 2;
      const rz = parity === 0 ? 45 : -45;
      out.push({ x, y, z: 0, rz, dims: [L, W, H], color: tone(i, j) });
    }
  }
  return out;
}

// 3 — Basket weave: 2x2 blocks alternate a horizontal pair of stretchers
// against a vertical pair, all flush in-plane (rotateZ 0/90 only).
function genBasketWeave(w, h) {
  const Lfull = BRICK.L * 0.7, Wfull = BRICK.W * 0.7, H = BRICK.H;
  const gap = 5; // grout reveal so neighbouring bricks read as separate units
  const L = Lfull - gap, W = Wfull - gap;
  const block = Lfull; // block pitch — unshrunk, so the grid still tiles exactly
  const cols = Math.ceil(w / block / 2) + 2;
  const rows = Math.ceil(h / block / 2) + 2;
  const out = [];
  for (let bj = -rows; bj <= rows; bj++) {
    for (let bi = -cols; bi <= cols; bi++) {
      const cx = bi * block, cy = bj * block;
      if (Math.abs(cx) > w / 2 + block || Math.abs(cy) > h / 2 + block) continue;
      const horizontal = ((bi + bj) % 2 + 2) % 2 === 0;
      // bias the two orientations to distinct tone bands so the weave reads
      // even where the raking light gives both faces similar shading.
      const c = tone(bi, bj, horizontal ? 0.05 : 0.6);
      if (horizontal) {
        out.push({ x: cx, y: cy - block / 4, z: 0, rz: 0, dims: [L, W, H], color: c });
        out.push({ x: cx, y: cy + block / 4, z: 0, rz: 0, dims: [L, W, H], color: c });
      } else {
        out.push({ x: cx - block / 4, y: cy, z: 0, rz: 90, dims: [L, W, H], color: c });
        out.push({ x: cx + block / 4, y: cy, z: 0, rz: 90, dims: [L, W, H], color: c });
      }
    }
  }
  return out;
}

// 4 — Diagonal coursing: same woven construction as pattern 1, but smaller
// and nested tight — solid diagonal brick coursing with only thin mortar
// seams instead of an open perforated lattice.
function genDiagonalCoursing(w, h) {
  return genDiamondWeave(w, h, { scale: 0.4, gapFactor: 0.88, pop: 0 });
}

// 5 — Perforated jali: the squarish header face (width x height), on a
// wide diagonal grid so real gaps show the recessed backing plane, each
// unit additionally tilted out of plane (rotateX) to catch the key light
// the way a true perforated terracotta screen does.
function genPerforatedJali(w, h) {
  const W = BRICK.W * 0.9, H = BRICK.H * 0.9, L = BRICK.L;
  const cell = ((W + H) / Math.SQRT2) * 1.7; // wide gaps — real perforation
  const cols = Math.ceil(w / cell / 2) + 2;
  const rows = Math.ceil(h / cell / 2) + 2;
  const out = [];
  for (let j = -rows; j <= rows; j++) {
    for (let i = -cols; i <= cols; i++) {
      const x = i * cell + (Math.abs(j % 2) === 1 ? cell / 2 : 0);
      const y = j * cell * 0.9;
      if (Math.abs(x) > w / 2 + cell || Math.abs(y) > h / 2 + cell) continue;
      const tilt = (hash(i, j) > 0.5 ? 1 : -1) * (24 + hash(j, i) * 14);
      out.push({ x, y, z: 0, rz: 45, rx: tilt, dims: [W, H, L], color: tone(i, j, 0.15) });
    }
  }
  return out;
}

// ---------------------------------------------------------------------------
// Shared sketch factory
// ---------------------------------------------------------------------------

function makeBrickSketch(containerId, canvasW, canvasH, genFn, opts = {}) {
  return new p5((p) => {
    let instances = [];
    let dragging = false;
    let rotY = opts.baseRotY ?? 8;
    let rotX = opts.baseRotX ?? -16;
    let lastMX = 0, lastMY = 0;

    p.setup = () => {
      const c = p.createCanvas(canvasW, canvasH, p.WEBGL);
      c.parent(containerId);
      c.style('cursor', 'grab');
      p.angleMode(p.DEGREES);
      instances = genFn(canvasW, canvasH);

      c.mousePressed(() => { dragging = true; lastMX = p.mouseX; lastMY = p.mouseY; c.style('cursor', 'grabbing'); });
      c.mouseReleased(() => { dragging = false; c.style('cursor', 'grab'); });
    };

    p.mouseDragged = () => {
      if (!dragging) return;
      rotY += (p.mouseX - lastMX) * 0.35;
      rotX -= (p.mouseY - lastMY) * 0.35;
      rotX = p.constrain(rotX, -60, 30);
      lastMX = p.mouseX; lastMY = p.mouseY;
    };

    p.draw = () => {
      p.background(12, 9, 6);
      p.ortho(-canvasW / 1.7, canvasW / 1.7, -canvasH / 1.7, canvasH / 1.7, -2000, 2000);

      p.push();
      p.rotateX(rotX);
      p.rotateY(rotY);

      // key + fill light — warm raking light like the plate's photography
      p.ambientLight(46, 36, 30);
      p.directionalLight(255, 224, 188, 0.55, 0.78, -0.35);
      p.directionalLight(70, 55, 80, -0.35, -0.5, 0.6);

      // recessed backing plane so gaps read as shadowed depth, not void
      p.push();
      p.translate(0, 0, -46);
      p.noStroke();
      p.ambientMaterial(24, 16, 12);
      p.plane(canvasW * 1.6, canvasH * 1.6);
      p.pop();

      p.noStroke();
      for (const b of instances) {
        p.push();
        p.translate(b.x, b.y, b.z || 0);
        if (b.rz) p.rotateZ(b.rz);
        if (b.rx) p.rotateX(b.rx);
        if (b.ry) p.rotateY(b.ry);
        p.ambientMaterial(b.color[0], b.color[1], b.color[2]);
        p.box(b.dims[0], b.dims[1], b.dims[2]);
        p.pop();
      }
      p.pop();
    };
  });
}

// Sketches are no longer auto-created here — they're built lazily per view by
// the builder functions at the bottom of brick-relief.js (the last file to
// load, where every generator is defined), so only the active tab's canvases
// hold a live WebGL context at a time.
