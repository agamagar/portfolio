// Seeded randomness for the whiteboard engine. Every wobble, overshoot and letter-wander comes from here,
// so the same spec + seed always draws the same board (and a replay writes the same marks).

export function hashSeed(str) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

// mulberry32: tiny, fast, good enough for jitter.
export function makeRng(seed = 1) {
  let a = (typeof seed === "string" ? hashSeed(seed) : seed) >>> 0;
  const next = () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  const rng = {
    next,
    /** uniform in [a, b) */
    range: (lo, hi) => lo + (hi - lo) * next(),
    /** symmetric: [-m, m) */
    sym: (m) => (next() * 2 - 1) * m,
    /** roughly gaussian, mean 0, sd ~ s (sum of three uniforms) */
    gauss: (s = 1) => ((next() + next() + next()) / 3 - 0.5) * 3.46 * s,
    pick: (arr) => arr[Math.floor(next() * arr.length)],
    chance: (p) => next() < p,
    /** an independent child stream, so adding an item never shifts the marks of the ones after it */
    fork: (salt = 0) => makeRng(Math.floor(next() * 4294967296) ^ (salt * 2654435761)),
  };
  return rng;
}

// Smooth 1-D noise in [-1, 1]: a few sines with random phase, evaluated at arc-length-like t.
// Cheap, continuous, and no lattice artefacts, which is what a drifting hand looks like.
export function makeNoise(rng, { octaves = 3, base = 1 } = {}) {
  const parts = [];
  for (let i = 0; i < octaves; i++) {
    parts.push({
      f: base * Math.pow(2.03, i) * rng.range(0.85, 1.2),
      p: rng.range(0, Math.PI * 2),
      a: 1 / Math.pow(1.9, i),
    });
  }
  const norm = parts.reduce((s, p) => s + p.a, 0);
  return (t) => parts.reduce((s, p) => s + p.a * Math.sin(t * p.f + p.p), 0) / norm;
}
