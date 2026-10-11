// The room's procedural textures (paint, dust, rain beads, plaster, the blind's weave,
// the desk's wood, the car's livery, the souvenir tile), generated from seeded noise
// into plain pixel arrays. Pure: no three.js, no DOM, so it runs in a Web Worker
// (roomTextures.worker.js) while the page keeps scrolling, or on the main thread as a
// fallback (materials.js). About 0.5 s of CPU on the high tier (measured 2026-10-05
// as the biggest block in the room's warm-up); identical on every load.
//
// Tiles are physical sizes (every room geometry carries UVs in metres, room/geom.js).

// --- seeded noise ------------------------------------------------------------------------
function rng(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
function h2(ix, iy, s) {
  let h = Math.imul(ix, 374761393) ^ Math.imul(iy, 668265263) ^ Math.imul(s, 1442695041);
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
}
const fade = (t) => t * t * (3 - 2 * t);
// tileable value noise: periods px, py in cells
function vnoise(x, y, px, py, s) {
  const ix = Math.floor(x), iy = Math.floor(y);
  const fx = fade(x - ix), fy = fade(y - iy);
  const m = (v, p) => ((v % p) + p) % p;
  const a = h2(m(ix, px), m(iy, py), s), b = h2(m(ix + 1, px), m(iy, py), s);
  const c = h2(m(ix, px), m(iy + 1, py), s), d = h2(m(ix + 1, px), m(iy + 1, py), s);
  return a + (b - a) * fx + (c - a) * fy + (a - b - c + d) * fx * fy;
}
// fbm over [0,1)^2 with base periods (kx, ky) cells
function fbm(u, v, kx, ky, oct, s, gain = 0.5) {
  let sum = 0, amp = 1, norm = 0;
  for (let o = 0; o < oct; o++) {
    sum += amp * vnoise(u * kx, v * ky, kx, ky, s + o * 97);
    norm += amp;
    amp *= gain;
    kx *= 2;
    ky *= 2;
  }
  return sum / norm;
}

// a texture as plain data: { data, w, h, srgb }; materials.js wraps it in a DataTexture
// (wrapS/T repeat, linear + mipmaps, anisotropy 8). Plain so it crosses a worker boundary
function raw(data, w, h, { srgb = false } = {}) {
  return { raw: true, data, w, h, srgb };
}

// height field (Float32, w x h, tileable) -> RGBA8 tangent-space normal map
function heightToNormal(H, w, h, strength) {
  const out = new Uint8Array(w * h * 4);
  for (let y = 0; y < h; y++)
    for (let x = 0; x < w; x++) {
      const xl = (x - 1 + w) % w, xr = (x + 1) % w, yu = (y - 1 + h) % h, yd = (y + 1) % h;
      const dx = (H[y * w + xr] - H[y * w + xl]) * strength;
      const dy = (H[yd * w + x] - H[yu * w + x]) * strength;
      const l = Math.hypot(dx, dy, 1);
      const i = (y * w + x) * 4;
      out[i] = Math.round((-dx / l * 0.5 + 0.5) * 255);
      out[i + 1] = Math.round((-dy / l * 0.5 + 0.5) * 255);
      out[i + 2] = Math.round((1 / l * 0.5 + 0.5) * 255);
      out[i + 3] = 255;
    }
  return out;
}
const b8 = (v) => Math.max(0, Math.min(255, Math.round(v * 255)));

// --- textures ------------------------------------------------------------------------------
// Enamel paint: brush streaks along v, paint nibs, chips, dust. Tile 0.25 m (N texels
// across; the low tier builds it at half size, same tile).
// The streaks come in two scales: the brush's own ridges (1.7 and 0.8 mm across) and
// the paint's long flow waves (7 mm across, 10 cm along), which are what paint the
// window's and the lamp's reflections into long vertical streaks in the gloss (5482:
// "vertical brush-stroke ridges in the specular"). The dust channel has no
// single-texel specks: at the hero distance a texel is under a pixel, so they only
// sparkled under the TAA jitter (round 1, hd/crop-bars.png).
// Loop 2: `coat` is the gloss's own normal (both lobes use it): straight fine
// ridges (1.7 and 0.8 mm across, NOT meandering) and the nibs, the flow waves at a
// sixth. Mirrored in a gloss, the meandering ridges and the 7 mm waves of `normal`
// bent the ceiling light into wide wavy bands down the casing (a wrinkled plastic
// sheet, 5481); the photos' streaks are straight and fine.
function paintTextures(seed = 11, N = 512) {
  const H = new Float32Array(N * N);
  const Hc = new Float32Array(N * N);
  const D = new Uint8Array(N * N * 4);
  const r = rng(seed);
  const px = N / 512; // texel scale against the 512 design size
  // nibs and chips: sparse points
  const nibs = Array.from({ length: 140 }, () => [r() * N, r() * N, (0.6 + r() * 1.8) * px, 0.15 + r() * 0.35]);
  const chips = Array.from({ length: 16 }, () => [r() * N, r() * N, (1.5 + r() * 4.5) * px, r()]);
  for (let y = 0; y < N; y++)
    for (let x = 0; x < N; x++) {
      const u = x / N, v = y / N;
      // meandering streaks: across-frequency high, along-frequency low
      const warp = (fbm(u, v, 3, 2, 2, seed + 5) - 0.5) * 0.06;
      const sL = vnoise((u + warp) * 36, v * 2.5, 36, 2.5, seed + 4); // flow waves
      const s1 = vnoise((u + warp) * 150, v * 5, 150, 5, seed + 1);
      const s2 = vnoise((u + warp) * 300, v * 9, 300, 9, seed + 2);
      const s3 = fbm(u, v, 24, 3, 2, seed + 3);
      let h = 0.9 * sL + 0.3 * s1 + 0.12 * s2 + 0.1 * s3;
      H[y * N + x] = h;
      const t1 = vnoise(u * 150, v * 4, 150, 4, seed + 11), t2 = vnoise(u * 300, v * 7, 300, 7, seed + 12);
      Hc[y * N + x] = 0.15 * sL + 0.36 * t1 + 0.2 * t2 + 0.03 * s3;
      const dust = Math.pow(fbm(u, v, 8, 8, 4, seed + 7), 2.2) * 0.8;
      const rough = fbm(u, v, 6, 6, 3, seed + 8);
      const i = (y * N + x) * 4;
      D[i] = b8(Math.min(1, dust));
      D[i + 1] = b8(rough);
      D[i + 2] = 0;
      D[i + 3] = 255;
    }
  const wrapD = (a, b) => {
    let d = a - b;
    if (d > N / 2) d -= N;
    if (d < -N / 2) d += N;
    return d;
  };
  for (const [cx, cy, rad, amp] of nibs)
    for (let dy = -4; dy <= 4; dy++)
      for (let dx = -4; dx <= 4; dx++) {
        const x = (Math.floor(cx) + dx + N) % N, y = (Math.floor(cy) + dy + N) % N;
        const d2 = (wrapD(x, cx) ** 2 + wrapD(y, cy) ** 2) / (rad * rad);
        H[y * N + x] += amp * Math.exp(-d2);
        Hc[y * N + x] += amp * Math.exp(-d2);
      }
  for (const [cx, cy, rad, sh] of chips) {
    const R = Math.ceil(rad * 2);
    for (let dy = -R; dy <= R; dy++)
      for (let dx = -R; dx <= R; dx++) {
        const x = (Math.floor(cx) + dx + N) % N, y = (Math.floor(cy) + dy + N) % N;
        const ang = Math.atan2(dy, dx);
        const rr = rad * (0.7 + 0.5 * vnoise(ang * 2 + sh * 10, 0, 64, 1, seed + 21));
        const d = Math.hypot(dx, dy);
        if (d < rr) {
          const i = (y * N + x) * 4;
          D[i + 2] = 255;
          H[y * N + x] -= 0.3; // a shallow flake: a deep rim outlined every chip in the gloss
          Hc[y * N + x] -= 0.3;
        }
      }
  }
  return { normal: raw(heightToNormal(H, N, N, 1.4 * px), N, N), coat: raw(heightToNormal(Hc, N, N, 1.4 * px), N, N), data: raw(D, N, N) };
}

// Glass dust (13-photo 4.9): R = fine specks, G = low-frequency haze, B = spots and
// dried drip tracks. Tile DUST_TILE m.
// Grain: fine, crisp specks: discs of 0.14 to 0.38 mm radius at 0.55 to 1 of full
// strength over about a third of the glass, a hard (half-texel) edge. At the hero
// (2.4 px per mm) a speck is 1 to 2 px, the crisp high-contrast speckle
// the photos show on R2 and over the outside bars (round 2: pixel noise 4.06 L*
// in the photo against round 1's 1.42, whose dense half-strength grains, blurred
// by a half-mip bias, read as a soft mottle). Same mean coverage as round 1 (0.155),
// so the calibrated dust amounts hold; the glass shader normalises to it on every
// tier and fades the grain to that mean as the pixel footprint nears the speck
// size (a band limit: nothing sub-pixel, nothing sparkles under the TAA jitter).
// Haze: two octaves at 10 and 5 cm, the soft gradient the photo shows on R2.
export const DUST_TILE = 0.2; // m
export const SPECK_MEAN = 0.155; // the grain's design mean coverage (R channel)
function dustTexture(seed = 23, N = 1024) {
  const out = new Uint8Array(N * N * 4);
  const acc = new Float32Array(N * N);
  const r = rng(seed);
  const tpm = N / (DUST_TILE * 1000); // texels per mm
  const nSpecks = Math.round(50000 * (N / 1024) ** 2);
  for (let g = 0; g < nSpecks; g++) {
    const cx = r() * N, cy = r() * N;
    const dens = fbm(cx / N, cy / N, 3, 3, 2, seed + 1);
    if (r() > 0.75 + 0.5 * dens) continue; // a mild drift, never bare patches
    const rad = Math.max(0.8, (0.14 + Math.pow(r(), 1.8) * 0.24) * tpm);
    const amp = 0.55 + 0.45 * r();
    const R = Math.ceil(rad + 1);
    const ix = Math.floor(cx), iy = Math.floor(cy);
    for (let dy = -R; dy <= R; dy++)
      for (let dx = -R; dx <= R; dx++) {
        const d = Math.hypot(ix + dx + 0.5 - cx, iy + dy + 0.5 - cy);
        const cov = Math.min(1, rad + 0.5 - d); // a half-texel anti-aliased edge
        if (cov <= 0) continue;
        const x = (ix + dx + N) % N, y = (iy + dy + N) % N;
        acc[y * N + x] = Math.max(acc[y * N + x], amp * cov);
      }
  }
  let sum = 0;
  for (let y = 0; y < N; y++)
    for (let x = 0; x < N; x++) {
      const i = (y * N + x) * 4;
      const s = Math.min(1, acc[y * N + x]);
      sum += s;
      out[i] = b8(s);
      out[i + 1] = b8(fbm(x / N, y / N, 2, 2, 2, seed + 3));
      out[i + 2] = 0;
      out[i + 3] = 255;
    }
  dustTexture.speckMean = sum / (N * N);
  // water spots (2 to 6 mm, a faint ring) and dried drip tracks
  const spots = Array.from({ length: 12 }, () => [r() * N, r() * N, (1 + r() * 2) * tpm, 0.3 + r() * 0.4]);
  const tracks = Array.from({ length: 4 }, () => [r() * N, r() * N, (10 + r() * 30) * tpm, (0.2 + r() * 0.3) * tpm]);
  for (const [cx, cy, rad, a] of spots) {
    const R = Math.ceil(rad * 1.6);
    for (let dy = -R; dy <= R; dy++)
      for (let dx = -R; dx <= R; dx++) {
        const d = Math.hypot(dx, dy) / rad;
        if (d > 1.6) continue;
        const x = (Math.floor(cx) + dx + N) % N, y = (Math.floor(cy) + dy + N) % N;
        const ring = Math.exp(-((d - 0.9) ** 2) / 0.02) * 0.7 + (d < 0.9 ? 0.15 : 0);
        const i = (y * N + x) * 4;
        out[i + 2] = Math.max(out[i + 2], b8(ring * a));
      }
  }
  // dried drip tracks: thin wavy lines running down (v increases downward here)
  for (const [cx, cy, len, w] of tracks)
    for (let t = 0; t < len; t++) {
      const x0 = cx + 0.6 * tpm * Math.sin((t / tpm) * 0.25 + cx), y0 = cy + t;
      const Rw = Math.ceil(w * 2);
      for (let dx = -Rw; dx <= Rw; dx++) {
        const x = (Math.floor(x0) + dx + N) % N, y = (Math.floor(y0) + N) % N;
        const a = Math.exp(-(dx * dx) / (w * w)) * (1 - t / len) * 0.3;
        const i = (y * N + x) * 4;
        out[i + 2] = Math.max(out[i + 2], b8(a));
      }
    }
  return raw(out, N, N);
}

// Static rain beads: R = bead coverage, G/B = dome normal xy (0.5 = flat). Tile 0.1 m.
function beadTexture(seed = 31) {
  const N = 512;
  const out = new Uint8Array(N * N * 4);
  for (let i = 0; i < N * N; i++) {
    out[i * 4 + 1] = 128;
    out[i * 4 + 2] = 128;
    out[i * 4 + 3] = 255;
  }
  const r = rng(seed);
  const beads = [];
  for (let k = 0; k < 420; k++) {
    const rad = 1.5 + Math.pow(r(), 3) * 9; // px (0.3 to 2 mm)
    beads.push([r() * N, r() * N, rad]);
  }
  for (const [cx, cy, rad] of beads) {
    const R = Math.ceil(rad) + 1;
    for (let dy = -R; dy <= R; dy++)
      for (let dx = -R; dx <= R; dx++) {
        const d = Math.hypot(dx, dy) / rad;
        if (d >= 1) continue;
        const x = (Math.floor(cx) + dx + N) % N, y = (Math.floor(cy) + dy + N) % N;
        const i = (y * N + x) * 4;
        const cov = Math.min(1, (1 - d) * 4);
        if (cov * 255 > out[i]) {
          out[i] = b8(cov);
          out[i + 1] = b8(0.5 + 0.5 * (dx / rad));
          out[i + 2] = b8(0.5 + 0.5 * (dy / rad)); // v grows upward: n.y > 0 on the drop's upper side
        }
      }
  }
  return raw(out, N, N);
}

// Plaster (tile 0.6 m): `normal` is the painted wall's, a fine orange peel only
// (the finest octaves; the room's emulsion is smooth at 1 to 2 m). Round 1's trowel
// waves (12 cm) under the lamp's raking light read as crumpled paper or hammered
// leather: 2.7 percent of L* of mid-frequency texture at p = 0 against 0.4 on the
// photographed wall in 5480 (round 2, the photo critic). `coarse` keeps them for
// the grey cement sill. data R: faint low-frequency stains, G: a finer drift.
function plasterTextures(seed = 41) {
  const N = 512;
  const H = new Float32Array(N * N);
  const Hc = new Float32Array(N * N);
  const D = new Uint8Array(N * N * 4);
  for (let y = 0; y < N; y++)
    for (let x = 0; x < N; x++) {
      const u = x / N, v = y / N;
      const peel = fbm(u, v, 96, 96, 2, seed + 5);
      const grain = h2(x, y, seed + 2);
      H[y * N + x] = 0.6 * peel + 0.4 * grain;
      Hc[y * N + x] = 0.7 * fbm(u, v, 48, 48, 3, seed) + 0.5 * fbm(u, v, 5, 7, 3, seed + 1) + 0.25 * grain;
      const i = (y * N + x) * 4;
      D[i] = b8(fbm(u, v, 3, 3, 4, seed + 3));
      D[i + 1] = b8(fbm(u, v, 20, 20, 2, seed + 4));
      D[i + 2] = 0;
      D[i + 3] = 255;
    }
  return { normal: raw(heightToNormal(H, N, N, 0.5), N, N), coarse: raw(heightToNormal(Hc, N, N, 0.9), N, N), data: raw(D, N, N) };
}

// The Roman blind's woven stripe: taupe, beige and charcoal vertical bands with a fine
// horizontal weave (13-photo 7, overall #585042). Tile 0.4 m across, 0.1 m down.
function blindTextures(seed = 53) {
  const W = 512, Hh = 128;
  const C = new Uint8Array(W * Hh * 4);
  const Hf = new Float32Array(W * Hh);
  // band layout across the 0.4 m repeat, [width fraction, sRGB]
  const bands = [
    [0.2, [118, 104, 86]],
    [0.06, [58, 54, 50]],
    [0.12, [158, 146, 122]],
    [0.03, [44, 42, 40]],
    [0.16, [104, 92, 76]],
    [0.09, [150, 138, 114]],
    [0.05, [52, 49, 46]],
    [0.18, [112, 99, 82]],
    [0.11, [138, 126, 104]],
  ];
  const tot = bands.reduce((s, b) => s + b[0], 0);
  const colAt = (u) => {
    let acc = 0;
    for (const [w, c] of bands) {
      acc += w / tot;
      if (u < acc) return c;
    }
    return bands[bands.length - 1][1];
  };
  for (let y = 0; y < Hh; y++)
    for (let x = 0; x < W; x++) {
      const u = x / W, v = y / Hh;
      const c = colAt(u);
      const weft = 0.5 + 0.5 * Math.sin(v * Math.PI * 2 * 64); // about 1.5 mm rows
      const thread = h2(x, y, seed) * 0.12 + fbm(u, v, 64, 8, 2, seed + 1) * 0.15;
      const k = 0.86 + 0.1 * weft + thread - 0.08;
      const i = (y * W + x) * 4;
      C[i] = b8((c[0] / 255) * k);
      C[i + 1] = b8((c[1] / 255) * k);
      C[i + 2] = b8((c[2] / 255) * k);
      C[i + 3] = 255;
      Hf[y * W + x] = weft * 0.6 + thread;
    }
  return { color: raw(C, W, Hh, { srgb: true }), normal: raw(heightToNormal(Hf, W, Hh, 1.2), W, Hh) };
}

// Desk: dark wood-look grain (R = grain, G = pores). Tile 0.6 m along the grain.
function woodTexture(seed = 67) {
  const W = 256, Hh = 512;
  const D = new Uint8Array(W * Hh * 4);
  for (let y = 0; y < Hh; y++)
    for (let x = 0; x < W; x++) {
      const u = x / W, v = y / Hh;
      const warp = fbm(u, v, 2, 3, 3, seed) * 3;
      const g = 0.5 + 0.5 * Math.sin((u * 26 + warp) * Math.PI * 2);
      const i = (y * W + x) * 4;
      D[i] = b8(0.6 * g + 0.4 * fbm(u, v, 40, 4, 2, seed + 1));
      D[i + 1] = b8(h2(x, y, seed + 2));
      D[i + 2] = 0;
      D[i + 3] = 255;
    }
  return raw(D, W, Hh);
}

// The Hot Wheels woodie's livery (13-photo 8; 5483), in the car's loft UVs (car.js:
// u along the car, 0 at the tail, 1 at the nose; v up, 0 at the rocker, 1 at the
// roof). Pearl silver-grey (L* about 72); blue and teal surf over the lower rear
// two thirds with white foam at the crests; the white logo on the rear quarter; an
// orange cartoon on the door; dark wheel arches. Row 0 is v = 0 (round 1 wrote the
// rows top down, so its waves wrapped the roof: a navy van).
function carLivery() {
  const W = 512, Hh = 128;
  const C = new Uint8Array(W * Hh * 4);
  const L = 0.07, Y0 = 0.004, YS = 0.022, WR = 0.0062; // car.js CAR
  const arches = [0.0215, -0.0225].map((wx) => [(wx + L / 2) / L, (WR - Y0) / YS]);
  const ru = (WR + 0.0012) / L, rv = (WR + 0.0012) / YS;
  for (let y = 0; y < Hh; y++)
    for (let x = 0; x < W; x++) {
      const u = (x + 0.5) / W, v = (y + 0.5) / Hh;
      let c = [166, 174, 182]; // pearl silver-grey, a cool cast (it reads neutral under the room's warm light)
      // the surf: waves over the rear two thirds, tapering off at the front door
      const taper = Math.max(0, (u - 0.6) / 0.12);
      const top = 0.5 + 0.05 * Math.sin(u * 38) + 0.025 * Math.sin(u * 97 + 1) - 0.55 * taper;
      if (v < top) {
        const d = (top - v) / Math.max(0.05, top);
        const deep = [26, 84, 182], mid = [62, 160, 214];
        const k = Math.min(1, d * 1.6);
        c = mid.map((m, i) => Math.round(m + (deep[i] - m) * k));
        // curling streaks inside the wave
        if (Math.sin(u * 60 + v * 22 + Math.sin(u * 13) * 2) > 0.82) c = [24, 70, 160];
        // foam along the crest
        if (top - v < 0.035) c = [226, 240, 248];
      }
      // the white logo swoosh on the rear quarter
      if (u > 0.1 && u < 0.33 && Math.abs(v - (0.4 + 0.22 * (u - 0.1))) < 0.035) c = [240, 244, 248];
      // the orange cartoon on the door, outlined dark blue
      const fx = (u - 0.47) / 0.06, fy = (v - 0.33) / 0.16, f = fx * fx + fy * fy;
      if (f < 1.25) c = [26, 60, 130];
      if (f < 1) c = [236, 112, 42];
      // the wheel arches
      for (const [uc, vc] of arches) {
        const a = ((u - uc) / ru) ** 2 + ((v - vc) / rv) ** 2;
        if (a < 1) c = [28, 28, 30];
      }
      if (v < 0.03) c = [60, 62, 64]; // the rocker's underside
      const i = (y * W + x) * 4;
      C[i] = c[0];
      C[i + 1] = c[1];
      C[i + 2] = c[2];
      C[i + 3] = 255;
    }
  return raw(C, W, Hh, { srgb: true });
}

// The souvenir tile's printed face (13-photo 8): blue sky, trees, an airplane, lettering.
function tilePrint() {
  const W = 128, Hh = 80;
  const C = new Uint8Array(W * Hh * 4);
  for (let y = 0; y < Hh; y++)
    for (let x = 0; x < W; x++) {
      const u = x / W, v = 1 - y / Hh;
      let c = [Math.round(120 + 60 * v), Math.round(170 + 40 * v), 225];
      const hill = 0.32 + 0.1 * Math.sin(u * 17) + 0.05 * Math.sin(u * 41);
      if (v < hill) c = v < hill - 0.12 ? [110, 78, 44] : [70, 130, 60];
      const px = (u - 0.62) / 0.12, py = (v - 0.72) / 0.03;
      if (Math.abs(py) < 1 && Math.abs(px) < 1) c = [30, 34, 40];
      if (Math.abs(u - 0.6) < 0.015 && Math.abs(v - 0.72) < 0.1) c = [30, 34, 40];
      if (u > 0.84 && v > 0.2 && v < 0.8 && (x + y) % 3 === 0) c = [200, 60, 40];
      const i = (y * W + x) * 4;
      C[i] = c[0];
      C[i + 1] = c[1];
      C[i + 2] = c[2];
      C[i + 3] = 255;
    }
  return raw(C, W, Hh, { srgb: true });
}

// Everything createRoomMaterials needs, as plain data, for one quality tier (the low
// tier builds the two big ones at half size over the same tiles). speckMean: the dust
// grain's measured coverage (dustTexture sets it as a side channel).
export function generateRoomTextures(quality = "high") {
  const low = quality === "low";
  const tree = {
    paint: paintTextures(11, low ? 256 : 512),
    dust: dustTexture(23, low ? 512 : 1024),
    beads: beadTexture(),
    plaster: plasterTextures(),
    blind: blindTextures(),
    wood: woodTexture(),
    livery: carLivery(),
    tile: tilePrint(),
  };
  return { quality, tree, speckMean: dustTexture.speckMean ?? SPECK_MEAN };
}

// the pixel buffers in a tree, for postMessage's transfer list
export function textureBuffers(tree, out = []) {
  for (const v of Object.values(tree)) {
    if (!v || typeof v !== "object") continue;
    if (v.raw) out.push(v.data.buffer);
    else textureBuffers(v, out);
  }
  return out;
}
