// ===========================================================================
// Brick jali — pattern studio
// A fully-parametric editor built on the "perfect overlap" rule set: one
// uniform running-bond grid of a single brick module (zero gap, every brick
// the same size and orientation), where the pattern is carried ONLY by how
// far each brick sits along the wall's depth. Every property below is live;
// export the current frame as a PNG.
// ===========================================================================

// ---- parameter state (defaults) ------------------------------------------
const P = {
  layout: 'diamond',      // diamond | herringbone | basket | diagonal | cube
  render: 'solid',        // solid | wireframe

  ratioL: 4,              // brick length : width : height ratio
  ratioW: 2,
  ratioH: 1,
  unit: 20,               // module height in world px (drives overall scale)

  bond: 0.5,              // running-bond row offset (fraction of brick length)
  scale: 5,               // pattern cell size, in brick-lengths
  detail: 2,              // secondary pattern knob (rings / bands / studs)

  depth: 24,              // max forward/back displacement (relief strength)
  contrast: 0.4,          // pushes the depth field toward crisp terraces

  camX: -14,              // camera tilt (deg)
  camY: 7,
  zoom: 1,                // orthographic zoom (crop in / out of the wall)
  drift: 'off',           // off | on — slow idle auto-rotation (a living wall)

  lightAngle: 125,        // solid-mode key-light azimuth (deg) — relights the relief
  jitter: 16,             // per-brick colour variance (surface roughness)

  strokeMode: 'flat',     // flat | depth — wireframe stroke: one color/weight, or tinted+weighted by each brick's depth
  strokeW: 1,             // wireframe line weight (the *base* weight when strokeMode is 'depth')
  light: 1,               // solid-mode key-light strength

  hoverLift: 3,           // % of brick length each brick rises under the cursor
  hoverReach: 3,          // influence radius as a multiple of brick length (soft falloff → many bricks move together)

  bg: '#000000',
  colDark: '#000000',     // brick base (recessed / low) — black
  colLight: '#e8ddc8',    // brick highlight (raised / high) — lifts the relief + hover out of the black
  stroke: '#ffffff',

  exportScale: 2,
};

// ---- control schema (grouped) --------------------------------------------
const SCHEMA = [
  { title: 'Layout', items: [
    { key: 'layout', type: 'seg', options: [
      ['diamond', 'Diamond'], ['herringbone', 'Herring'], ['basket', 'Basket'],
      ['diagonal', 'Diagonal'], ['cube', 'Cube'] ] },
    { key: 'render', type: 'seg', options: [['solid', 'Solid'], ['wireframe', 'Wireframe']] },
  ]},
  { title: 'Brick module', items: [
    { key: 'ratioL', label: 'Length', min: 1, max: 8, step: 0.5 },
    { key: 'ratioW', label: 'Width', min: 1, max: 8, step: 0.5 },
    { key: 'ratioH', label: 'Height', min: 1, max: 8, step: 0.5 },
    { key: 'unit', label: 'Module size', min: 10, max: 60, step: 1 },
  ]},
  { title: 'Grid & pattern', items: [
    { key: 'bond', label: 'Bond offset', min: 0, max: 0.5, step: 0.01 },
    { key: 'scale', label: 'Pattern scale', min: 1, max: 10, step: 0.1 },
    { key: 'detail', label: 'Detail', min: 1, max: 8, step: 0.1 },
    { key: 'contrast', label: 'Contrast', min: 0, max: 1, step: 0.01 },
  ]},
  { title: 'Depth & camera', items: [
    { key: 'depth', label: 'Relief depth', min: 0, max: 90, step: 1 },
    { key: 'camX', label: 'Tilt (X)', min: -70, max: 30, step: 1 },
    { key: 'camY', label: 'Turn (Y)', min: -45, max: 45, step: 1 },
    { key: 'zoom', label: 'Zoom', min: 0.4, max: 2.6, step: 0.02 },
  ]},
  { title: 'Render', items: [
    { key: 'strokeMode', type: 'seg', options: [['flat', 'Flat'], ['depth', 'By depth']] },
    { key: 'strokeW', label: 'Line weight', min: 0.25, max: 3, step: 0.05 },
    { key: 'light', label: 'Light', min: 0, max: 1.6, step: 0.02 },
    { key: 'lightAngle', label: 'Light angle', min: 0, max: 360, step: 1 },
    { key: 'jitter', label: 'Surface texture', min: 0, max: 40, step: 1 },
  ]},
  { title: 'Hover', items: [
    { key: 'hoverLift', label: 'Lift %', min: 0, max: 20, step: 0.5 },
    { key: 'hoverReach', label: 'Reach ×brick', min: 1, max: 8, step: 0.5 },
  ]},
  { title: 'Motion', items: [
    { key: 'drift', type: 'seg', options: [['off', 'Static'], ['on', 'Drift']] },
  ]},
  { title: 'Colours', items: [
    { key: 'bg', type: 'color', label: 'Background' },
    { key: 'colDark', type: 'color', label: 'Brick — low' },
    { key: 'colLight', type: 'color', label: 'Brick — high' },
    { key: 'stroke', type: 'color', label: 'Line' },
  ]},
];

// ---- glyphs, keyed by layout (reused across presets) ----------------------
const GLYPH = {
  diamond: '<svg viewBox="0 0 44 28" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linejoin="round"><path d="M2 14 L12 5 22 14 32 5 42 14 M2 14 L12 23 22 14 32 23 42 14"/></svg>',
  herringbone: '<svg viewBox="0 0 44 28" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"><path d="M3 8 l7 6 l7 -6 M3 18 l7 6 l7 -6 M24 8 l7 6 l7 -6 M24 18 l7 6 l7 -6"/></svg>',
  basket: '<svg viewBox="0 0 44 28" fill="none" stroke="currentColor" stroke-width="1.2"><rect x="4" y="7" width="15" height="5" rx="1"/><rect x="4" y="15" width="15" height="5" rx="1"/><rect x="23" y="6" width="5" height="15" rx="1"/><rect x="30" y="6" width="5" height="15" rx="1"/></svg>',
  diagonal: '<svg viewBox="0 0 44 28" fill="none" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"><path d="M2 6 L14 18 M14 6 L26 18 M26 6 L38 18 M14 6 L2 18 M26 6 L14 18 M38 6 L26 18"/></svg>',
  cube: '<svg viewBox="0 0 44 28" fill="none" stroke="currentColor" stroke-width="1.2"><rect x="5" y="5" width="9" height="9" rx="1"/><rect x="18" y="5" width="9" height="9" rx="1"/><rect x="31" y="5" width="9" height="9" rx="1"/><rect x="11" y="16" width="9" height="9" rx="1"/><rect x="24" y="16" width="9" height="9" rx="1"/></svg>',
};

// ---- preset "looks" -------------------------------------------------------
// Each is a full art direction — layout, render, palette, camera, relief.
// Clicking one loads the whole look (defaults + these overrides). The card
// previews itself in its own colours, so the row reads as a swatch gallery.
const PRESETS = [
  { id: 'clay', label: 'Clay', params: { layout: 'diamond', render: 'solid', bg: '#140d09', colDark: '#3a1d12', colLight: '#e6b784', scale: 5, detail: 2, depth: 26, contrast: 0.4, camX: -16, camY: 8, light: 1.1, lightAngle: 125 } },
  { id: 'onyx', label: 'Onyx', params: { layout: 'cube', render: 'solid', bg: '#060606', colDark: '#0a0a0a', colLight: '#d0cabe', scale: 3.5, detail: 4, depth: 34, contrast: 0.55, camX: -20, camY: 9, light: 1.0, lightAngle: 120 } },
  { id: 'blueprint', label: 'Blueprint', params: { layout: 'diagonal', render: 'wireframe', strokeMode: 'flat', bg: '#0a1526', stroke: '#6ea8ff', scale: 2.6, detail: 2, depth: 20, contrast: 0.3, camX: -14, camY: 7, strokeW: 1 } },
  { id: 'paper', label: 'Paper', params: { layout: 'herringbone', render: 'wireframe', strokeMode: 'flat', bg: '#efe7d6', stroke: '#1c1a17', scale: 3.4, detail: 2, depth: 22, contrast: 0.35, camX: -15, camY: 8, strokeW: 1 } },
  { id: 'weave', label: 'Weave', params: { layout: 'basket', render: 'solid', bg: '#170f0a', colDark: '#42230f', colLight: '#d99a63', scale: 4, detail: 2, depth: 24, contrast: 0.5, camX: -16, camY: -8, light: 1.1, lightAngle: 130 } },
  { id: 'gold', label: 'Gold', params: { layout: 'cube', render: 'solid', bg: '#0b0805', colDark: '#1a1206', colLight: '#e8c46a', scale: 3.5, detail: 4, depth: 30, contrast: 0.55, camX: -18, camY: 9, light: 1.2, lightAngle: 115 } },
  { id: 'neon', label: 'Neon', params: { layout: 'diagonal', render: 'wireframe', strokeMode: 'depth', bg: '#05010a', colDark: '#2a0a3a', colLight: '#ff4fd8', scale: 2.6, detail: 2, depth: 30, contrast: 0.35, camX: -16, camY: 8, strokeW: 1.1 } },
  { id: 'graphite', label: 'Graphite', params: { layout: 'herringbone', render: 'solid', bg: '#0a0a0a', colDark: '#111111', colLight: '#b8b8b8', scale: 3.4, detail: 2, depth: 22, contrast: 0.4, camX: -16, camY: 8, light: 1.0, lightAngle: 135 } },
  { id: 'stone', label: 'Stone', params: { layout: 'diamond', render: 'solid', bg: '#1b140d', colDark: '#4a3524', colLight: '#dcc7a2', scale: 5, detail: 2, depth: 22, contrast: 0.35, camX: -14, camY: 7, light: 1.05, lightAngle: 125 } },
  { id: 'wire', label: 'Wire', params: { layout: 'cube', render: 'wireframe', strokeMode: 'depth', bg: '#0c0806', colDark: '#1a0f0a', colLight: '#f0d9b0', scale: 3.5, detail: 4, depth: 32, contrast: 0.5, camX: -18, camY: 9, strokeW: 1 } },
].map((p) => ({ ...p, glyph: GLYPH[p.params.layout] }));

// the colours a preset card should preview itself in
function presetChip(params) {
  const bg = params.bg || DEFAULTS.bg;
  const line = params.render === 'wireframe'
    ? (params.strokeMode === 'depth' ? params.colLight : params.stroke)
    : params.colLight;
  return { bg, line: line || DEFAULTS.colLight };
}

// ---- math helpers ---------------------------------------------------------
function hash(i, j) { const x = Math.sin(i * 127.1 + j * 311.7) * 43758.5453; return x - Math.floor(x); }
function triCont(n) { const m = ((n % 1) + 1) % 1; return 1 - Math.abs(m - 0.5) * 2; }
function sawFrac(n) { return ((n % 1) + 1) % 1; }
function isEven(n) { return (((n % 2) + 2) % 2) === 0; }
function clamp01(t) { return Math.max(0, Math.min(1, t)); }
function hexToRgb(h) {
  const n = parseInt(h.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}
function applyContrast(t, c) {
  if (c <= 0) return t;
  const k = 1 + c * 3;
  return clamp01(0.5 + Math.sign(t - 0.5) * Math.pow(Math.abs(t - 0.5) * 2, 1 / k) / 2);
}

// ---- brick module dims from ratio ----------------------------------------
function brickDims() {
  const h = P.unit;
  return {
    L: h * (P.ratioL / P.ratioH),
    W: h * (P.ratioW / P.ratioH),
    H: h,
  };
}

// ---- the depth field per layout: returns t in [0,1] for a world point -----
function fieldValue(x, y, U) {
  const cell = U.L * P.scale;
  switch (P.layout) {
    case 'diamond': {
      const du = (x + y) / cell, dv = (x - y) / cell;
      const fu = du - Math.round(du), fv = dv - Math.round(dv);
      const r = Math.abs(fu) + Math.abs(fv);
      return triCont(r * Math.max(1, Math.round(P.detail)));
    }
    case 'herringbone': {
      const bandH = U.H * (P.detail * 6);
      const band = Math.floor(y / bandH);
      const dir = isEven(band) ? 1 : -1;
      return triCont((x + dir * y) / cell);
    }
    case 'basket': {
      const bw = cell, bh = cell * (P.detail / 2);
      return isEven(Math.floor(x / bw) + Math.floor(y / bh)) ? 0.9 : 0.1;
    }
    case 'diagonal':
      return Math.min(triCont((x + y) / cell), triCont((x - y) / cell));
    case 'cube': {
      const xl = Math.abs(sawFrac(x / cell) - 0.5) * 2;
      const yl = Math.abs(sawFrac(y / cell) - 0.5) * 2;
      const thresh = clamp01(0.3 + (P.detail / 8) * 0.55);
      return Math.max(xl, yl) < thresh ? 0.9 : 0.1;
    }
    default:
      return 0.5;
  }
}

// ---- build the brick instances for the current params --------------------
let instances = [];
function rebuild(w, h) {
  const U = brickDims();
  const stepX = U.L, stepY = U.H;
  const cols = Math.ceil(w / stepX / 2) + 2;
  const rows = Math.ceil(h / stepY / 2) + 2;
  const out = [];
  for (let j = -rows; j <= rows; j++) {
    for (let i = -cols; i <= cols; i++) {
      const rowOffset = Math.abs(j % 2) === 1 ? stepX * P.bond : 0;
      const x = i * stepX + rowOffset;
      const y = j * stepY;
      if (Math.abs(x) > w / 2 + stepX || Math.abs(y) > h / 2 + stepY) continue;
      const t = applyContrast(clamp01(fieldValue(x, y, U)), P.contrast);
      out.push({ x, y, t, i, j, lift: 0 }); // lift = eased hover displacement 0..1
    }
  }
  instances = out;
  instances._dims = [U.L, U.H, U.W];
}

// ===========================================================================
// p5 sketch
// ===========================================================================
let sketch;
function startSketch() {
  sketch = new p5((p) => {
    let rotX = P.camX, rotY = P.camY;
    let phase = 0, driftAmt = 0;     // idle-drift: a gentle bounded sway (eased in/out)
    let dragging = false, lastX = 0, lastY = 0;
    let cnv;

    function sizeToStage() {
      const stage = document.getElementById('stage');
      const w = stage.clientWidth, h = stage.clientHeight;
      p.resizeCanvas(w, h);
      rebuild(w, h);
    }

    p.setup = () => {
      const stage = document.getElementById('stage');
      cnv = p.createCanvas(stage.clientWidth, stage.clientHeight, p.WEBGL);
      cnv.parent(stage);
      cnv.style('cursor', 'grab');
      p.pixelDensity(2);
      p.angleMode(p.DEGREES);
      rebuild(p.width, p.height);

      cnv.mousePressed(() => { dragging = true; lastX = p.mouseX; lastY = p.mouseY; cnv.style('cursor', 'grabbing'); });
      cnv.mouseReleased(() => { dragging = false; cnv.style('cursor', 'grab'); });
      window.addEventListener('resize', sizeToStage);
    };

    p.mouseDragged = () => {
      if (!dragging) return;
      rotY += (p.mouseX - lastX) * 0.35;
      rotX -= (p.mouseY - lastY) * 0.35;
      rotX = p.constrain(rotX, -85, 85);
      lastX = p.mouseX; lastY = p.mouseY;
      // reflect orbit back into the sliders so state stays truthful
      P.camX = Math.round(rotX); P.camY = Math.round(rotY);
      syncControl('camX'); syncControl('camY');
    };

    // allow the sliders / presets to drive the camera too (and reset drift)
    p._setCam = () => { rotX = P.camX; rotY = P.camY; phase = 0; driftAmt = 0; };

    p.draw = () => {
      // idle drift — a gentle, bounded sway (never a full spin, so it never
      // turns edge-on). Eased in/out; dt is capped so a throttled frame can't
      // jolt the angle.
      const wantDrift = P.drift === 'on' && !dragging;
      driftAmt += ((wantDrift ? 1 : 0) - driftAmt) * 0.04;
      if (wantDrift) phase += Math.min(p.deltaTime, 100);
      const swayY = Math.sin(phase * 0.00042) * 11 * driftAmt;
      const swayX = Math.sin(phase * 0.00031 + 1) * 5 * driftAmt;
      const rotXe = rotX + swayX;
      const rotYe = rotY + swayY;

      const [dr, dg, db] = hexToRgb(P.bg);
      p.background(dr, dg, db);
      const zc = P.zoom || 1;
      p.ortho(-p.width / 2 / zc, p.width / 2 / zc, -p.height / 2 / zc, p.height / 2 / zc, -4000, 4000);
      p.push();
      p.rotateX(rotXe);
      p.rotateY(rotYe);

      const [L, H, W] = instances._dims || [1, 1, 1];
      const wire = P.render === 'wireframe';

      const depthStroke = wire && P.strokeMode === 'depth';
      const hoverOn = P.hoverLift > 0;
      if (wire) {
        p.noFill();
        if (!depthStroke) {
          // flat: one colour for every line; weight is set once here when hover
          // is off, or per-brick below (so the hovered wave draws heavier)
          const [sr, sg, sb] = hexToRgb(P.stroke);
          p.stroke(sr, sg, sb);
          if (!hoverOn) p.strokeWeight(P.strokeW);
        }
        // depth mode sets stroke() + strokeWeight() per-brick below, the same
        // way solid mode's ambientMaterial() already varies per-brick by t —
        // this is the wireframe read of the exact same depth signal.
      } else {
        p.noStroke();
        const amb = 40 * P.light;
        p.ambientLight(amb, amb * 0.82, amb * 0.7);
        // key light — azimuth is user-controlled so the relief can be relit
        const la = P.lightAngle * Math.PI / 180;
        p.directionalLight(255 * P.light, 224 * P.light, 188 * P.light, Math.cos(la), Math.sin(la), -0.4);
        p.directionalLight(70, 55, 80, -0.35, -0.5, 0.6); // cool fill (fixed)
        // recessed backing plane so any depth reads as shadowed relief
        p.push();
        p.translate(0, 0, -Math.max(60, P.depth + 40));
        p.ambientMaterial(dr * 0.6, dg * 0.6, db * 0.6);
        p.plane(p.width * 2, p.height * 2);
        p.pop();
      }

      // ---- hover: inverse-project the cursor onto the brick plane (z = 0)
      // under the live camera, so a soft region of bricks near it can rise.
      // The falloff radius is hoverReach × brick length, giving a smooth bump
      // that lifts several bricks at once rather than a single hard pick.
      let mwx = null, mwy = null;
      const overCanvas = !dragging && hoverOn &&
        p.mouseX >= 0 && p.mouseX <= p.width && p.mouseY >= 0 && p.mouseY <= p.height;
      if (overCanvas) {
        const rx = rotXe * Math.PI / 180, ry = rotYe * Math.PI / 180;
        // undo the ortho zoom, then invert the camera rotation, to land the
        // cursor on the brick plane in world units
        const sx = (p.mouseX - p.width / 2) / zc, sy = (p.mouseY - p.height / 2) / zc;
        const cx = Math.cos(rx) || 1e-3, cyy = Math.cos(ry) || 1e-3;
        mwy = sy / cx;
        mwx = (sx - mwy * Math.sin(rx) * Math.sin(ry)) / cyy;
      }
      const R = L * P.hoverReach;                 // influence radius (world units)
      const pop = L * (P.hoverLift / 100);         // max rise = hoverLift % of brick length

      const dark = hexToRgb(P.colDark), light = hexToRgb(P.colLight);
      for (const b of instances) {
        // target lift from a cosine bump: 1 under the cursor → 0 at radius R
        let target = 0;
        if (overCanvas) {
          const dx = b.x - mwx, dy = b.y - mwy;
          const d = Math.sqrt(dx * dx + dy * dy);
          if (d < R) target = 0.5 + 0.5 * Math.cos(Math.PI * d / R);
        }
        b.lift += (target - b.lift) * 0.18;        // ease → fluid, trailing motion

        const v = clamp01(b.t + b.lift * 0.85);    // brightness: hover glows past the base relief
        const z = (b.t - 0.5) * P.depth + b.lift * pop;

        p.push();
        p.translate(b.x, b.y, z);
        if (!wire) {
          const jit = (hash(b.i, b.j) - 0.5) * P.jitter;
          p.ambientMaterial(
            dark[0] + (light[0] - dark[0]) * v + jit,
            dark[1] + (light[1] - dark[1]) * v + jit * 0.8,
            dark[2] + (light[2] - dark[2]) * v + jit * 0.6,
          );
        } else if (depthStroke) {
          // same dark->light lerp solid mode uses for fill, applied to the
          // line instead — raised/hovered bricks draw brighter AND thicker.
          p.stroke(
            dark[0] + (light[0] - dark[0]) * v,
            dark[1] + (light[1] - dark[1]) * v,
            dark[2] + (light[2] - dark[2]) * v,
          );
          p.strokeWeight(P.strokeW * (0.4 + v * 1.2));
        } else if (hoverOn) {
          // flat stroke: keep the colour uniform, but thicken under the hover
          p.strokeWeight(P.strokeW * (1 + b.lift * 1.2));
        }
        p.box(L, H, W);
        p.pop();
      }
      p.pop();
    };

    // ---- PNG export: bump density, render one frame, save, restore --------
    p._exportPNG = () => {
      const scale = P.exportScale;
      p.pixelDensity(scale);
      p.redraw();
      window.requestAnimationFrame(() => {
        p.saveCanvas(cnv, `brick-${P.layout}`, 'png');
        p.pixelDensity(2);
      });
    };
  });
}

// ===========================================================================
// control panel (schema-driven)
// ===========================================================================
const fmt = (v) => (Number.isInteger(v) ? v : (Math.round(v * 100) / 100));
const refs = {};
let activePiece = null;

// snap the whole canvas to a preset piece (defaults + its overrides), then
// rebuild the panel + sketch so every control reflects the reset state.
function applyPiece(id) {
  const piece = PRESETS.find((p) => p.id === id);
  if (!piece) return;
  Object.assign(P, JSON.parse(JSON.stringify(DEFAULTS)), piece.params);
  activePiece = id;
  refreshAllControls();
}

// the curated looks, pinned above everything else — each card previews itself
// in its own palette so the row reads as a swatch gallery
function buildPieces(root) {
  const g = document.createElement('div');
  g.className = 'group pieces-group';
  g.innerHTML = '<h3>Looks</h3>';
  const grid = document.createElement('div');
  grid.className = 'pieces';
  for (const piece of PRESETS) {
    const chip = presetChip(piece.params);
    const b = document.createElement('button');
    b.className = 'piece' + (activePiece === piece.id ? ' active' : '');
    b.title = piece.label;
    b.innerHTML =
      '<span class="piece-swatch" style="background:' + chip.bg + ';color:' + chip.line + '">' + piece.glyph + '</span>' +
      '<span class="piece-name">' + piece.label + '</span>';
    b.addEventListener('click', () => applyPiece(piece.id));
    grid.appendChild(b);
  }
  g.appendChild(grid);
  root.appendChild(g);
}

function syncControl(key) {
  const r = refs[key];
  if (!r) return;
  if (r.input) r.input.value = P[key];
  if (r.val) r.val.textContent = fmt(P[key]);
}

function onChange(key, geometry) {
  // a manual tweak means we're no longer on a pristine preset — drop the
  // active-piece highlight (but don't rebuild the whole panel)
  if (activePiece) {
    activePiece = null;
    document.querySelectorAll('.piece.active').forEach((el) => el.classList.remove('active'));
  }
  // geometry params require a rebuild; camera/colour/render are draw-time only
  if (geometry && sketch) rebuild(sketch.width, sketch.height);
  if ((key === 'camX' || key === 'camY') && sketch && sketch._setCam) sketch._setCam();
}

function buildControls() {
  const root = document.getElementById('controls');
  buildPieces(root); // five preset pieces pinned at the very top
  // geometry keys trigger a rebuild of the brick field
  const GEO = new Set(['layout', 'ratioL', 'ratioW', 'ratioH', 'unit', 'bond', 'scale', 'detail', 'contrast']);

  for (const group of SCHEMA) {
    const g = document.createElement('div');
    g.className = 'group';
    const h = document.createElement('h3');
    h.textContent = group.title;
    g.appendChild(h);

    for (const item of group.items) {
      if (item.type === 'seg') {
        const wrap = document.createElement('div');
        wrap.className = 'ctrl';
        const seg = document.createElement('div');
        seg.className = 'seg';
        const btns = [];
        for (const [val, lbl] of item.options) {
          const b = document.createElement('button');
          b.textContent = lbl;
          if (P[item.key] === val) b.classList.add('active');
          b.addEventListener('click', () => {
            P[item.key] = val;
            btns.forEach((x) => x.classList.toggle('active', x === b));
            onChange(item.key, GEO.has(item.key));
          });
          btns.push(b);
          seg.appendChild(b);
        }
        wrap.appendChild(seg);
        g.appendChild(wrap);
      } else if (item.type === 'color') {
        const row = document.createElement('div');
        row.className = 'color-row';
        const span = document.createElement('span');
        span.textContent = item.label;
        const inp = document.createElement('input');
        inp.type = 'color';
        inp.autocomplete = 'off';
        inp.value = P[item.key];
        inp.addEventListener('input', () => { P[item.key] = inp.value; onChange(item.key, false); });
        refs[item.key] = { input: inp };
        row.appendChild(span);
        row.appendChild(inp);
        g.appendChild(row);
      } else {
        const wrap = document.createElement('div');
        wrap.className = 'ctrl';
        const row = document.createElement('div');
        row.className = 'row';
        const label = document.createElement('label');
        label.textContent = item.label;
        const val = document.createElement('span');
        val.className = 'val';
        val.textContent = fmt(P[item.key]);
        row.appendChild(label);
        row.appendChild(val);
        const inp = document.createElement('input');
        inp.type = 'range';
        inp.autocomplete = 'off';
        inp.min = item.min; inp.max = item.max; inp.step = item.step;
        inp.value = P[item.key];
        inp.addEventListener('input', () => {
          P[item.key] = parseFloat(inp.value);
          val.textContent = fmt(P[item.key]);
          onChange(item.key, GEO.has(item.key));
        });
        refs[item.key] = { input: inp, val };
        wrap.appendChild(row);
        wrap.appendChild(inp);
        g.appendChild(wrap);
      }
    }
    root.appendChild(g);
  }

  // ---- export / actions group ----
  const g = document.createElement('div');
  g.className = 'group';
  g.innerHTML = '<h3>Export</h3>';
  const scaleWrap = document.createElement('div');
  scaleWrap.className = 'ctrl';
  const scaleSeg = document.createElement('div');
  scaleSeg.className = 'seg';
  [['1', '1×'], ['2', '2×'], ['4', '4×']].forEach(([v, l]) => {
    const b = document.createElement('button');
    b.textContent = l;
    if (P.exportScale === parseInt(v)) b.classList.add('active');
    b.addEventListener('click', () => {
      P.exportScale = parseInt(v);
      [...scaleSeg.children].forEach((x) => x.classList.toggle('active', x === b));
    });
    scaleSeg.appendChild(b);
  });
  scaleWrap.appendChild(scaleSeg);
  g.appendChild(scaleWrap);

  const actions = document.createElement('div');
  actions.className = 'actions';
  const exportBtn = document.createElement('button');
  exportBtn.className = 'btn primary';
  exportBtn.textContent = 'Export PNG';
  exportBtn.addEventListener('click', () => sketch && sketch._exportPNG());
  const linkBtn = document.createElement('button');
  linkBtn.className = 'btn';
  linkBtn.textContent = 'Copy link';
  linkBtn.addEventListener('click', () => copyLink(linkBtn));
  const codeBtn = document.createElement('button');
  codeBtn.className = 'btn';
  codeBtn.textContent = 'Copy config';
  codeBtn.addEventListener('click', () => copyConfig(codeBtn));
  const randBtn = document.createElement('button');
  randBtn.className = 'btn';
  randBtn.textContent = 'Randomise';
  randBtn.addEventListener('click', randomise);
  const resetBtn = document.createElement('button');
  resetBtn.className = 'btn ghost';
  resetBtn.textContent = 'Reset';
  resetBtn.addEventListener('click', reset);
  actions.appendChild(exportBtn);
  actions.appendChild(linkBtn);
  actions.appendChild(codeBtn);
  actions.appendChild(randBtn);
  actions.appendChild(resetBtn);
  g.appendChild(actions);
  root.appendChild(g);
}

const DEFAULTS = JSON.parse(JSON.stringify(P));

function refreshAllControls() {
  // rebuild the panel to reflect P (used by randomise/reset)
  document.getElementById('controls').innerHTML = '';
  buildControls();
  if (sketch) { rebuild(sketch.width, sketch.height); if (sketch._setCam) sketch._setCam(); }
}

function reset() {
  Object.assign(P, JSON.parse(JSON.stringify(DEFAULTS)));
  refreshAllControls();
}

function randomise() {
  // start from a curated look so randomisation always lands on a good palette,
  // then jitter the geometry for variety
  const base = PRESETS[Math.floor(Math.random() * PRESETS.length)];
  Object.assign(P, JSON.parse(JSON.stringify(DEFAULTS)), base.params);
  const layouts = ['diamond', 'herringbone', 'basket', 'diagonal', 'cube'];
  P.layout = layouts[Math.floor(Math.random() * layouts.length)];
  P.scale = 2 + Math.random() * 6;
  P.detail = 1 + Math.random() * 6;
  P.depth = 12 + Math.random() * 45;
  P.contrast = 0.2 + Math.random() * 0.6;
  P.camX = -26 + Math.random() * 22;
  P.camY = -18 + Math.random() * 36;
  P.bond = Math.random() * 0.5;
  activePiece = null;
  refreshAllControls();
}

// ---- shareable permalink --------------------------------------------------
// Encode the full state into ?p=<base64> so any look can be sent as a link.
function copyLink(btn) {
  const raw = encodeURIComponent(btoa(JSON.stringify(P)));
  const url = location.origin + location.pathname + '?p=' + raw;
  const label = btn.textContent;
  const done = () => { btn.textContent = 'Link copied'; setTimeout(() => { btn.textContent = label; }, 1200); };
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(url).then(done, () => window.prompt('Copy this link', url));
  } else {
    window.prompt('Copy this link', url);
  }
}

function loadFromURL() {
  try {
    const raw = new URLSearchParams(location.search).get('p');
    if (!raw) return;
    const obj = JSON.parse(atob(raw));
    if (obj && typeof obj === 'object') Object.assign(P, obj);
  } catch (e) { /* malformed link — ignore, keep defaults */ }
}

// copy the current look as a ready-to-paste JS object — drop it straight into
// BrickBackground.jsx (the site-background component) or anywhere in code
function copyConfig(btn) {
  const snippet = 'const brickLook = ' + JSON.stringify(P, null, 2) + ';';
  const label = btn.textContent;
  const done = () => { btn.textContent = 'Config copied'; setTimeout(() => { btn.textContent = label; }, 1200); };
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(snippet).then(done, () => window.prompt('Copy this config', snippet));
  } else {
    window.prompt('Copy this config', snippet);
  }
}

// ---- boot -----------------------------------------------------------------
// When embedded in the portfolio (inside an <iframe>), the host renders its own
// client-side "← Portfolio" button, so hide this standalone one to avoid a
// duplicate. It stays visible when the editor is opened directly.
if (window.self !== window.top) {
  const back = document.getElementById('back');
  if (back) back.style.display = 'none';
}
loadFromURL();   // restore a shared look from ?p= before building anything
buildControls();
startSketch();
