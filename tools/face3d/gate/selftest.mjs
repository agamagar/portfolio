// self test of the pure fix routines and the checks' sanity on synthetic data: node tools/face3d/gate/selftest.mjs
import { inpaintSmallHoles, mirrorFillTexels, holeMask } from "../../../src/figures/faces/morph/safeFixes.js";
let ok = true; const t = (n, c) => { console.log((c ? "ok   " : "FAIL ") + n); ok &&= c; };
{ const w = 16, h = 16, d = new Uint8ClampedArray(w * h * 4).fill(200); for (let i = 0; i < w * h; i++) d[i * 4 + 3] = 255;
  for (const [x, y] of [[5, 5], [6, 5], [5, 6]]) { const i = y * w + x; d[i * 4] = 0; d[i * 4 + 3] = 0; }
  const n = inpaintSmallHoles(d, w, h, holeMask(d, w, h)); t("inpaint fills a 3-texel hole", n === 3 && d[(5 * w + 5) * 4] === 200 && d[(5 * w + 5) * 4 + 3] === 255);
  const big = new Uint8ClampedArray(w * h * 4).fill(200); for (let i = 0; i < w * h; i++) big[i * 4 + 3] = i < 100 ? 0 : 255; t("inpaint leaves big holes alone", inpaintSmallHoles(big, w, h, holeMask(big, w, h), 50) === 0); }
{ const w = 8, h = 8, d = new Uint8ClampedArray(w * h * 4); for (let i = 0; i < w * h; i++) { d[i * 4 + 3] = 255; d[i * 4] = i % w < 4 ? 50 : 0; }
  for (let y = 0; y < h; y++) for (let x = 4; x < w; x++) d[(y * w + x) * 4 + 3] = 100; const mask = holeMask(d, w, h);
  // the right half is "missing"; its triangle (UV 0.5..1) mirrors the left half (UV 0.5..0, reversed)
  const n = mirrorFillTexels(d, w, h, mask, [[[0.5, 0, 1, 0, 0.5, 1], [0.5, 0, 0, 0, 0.5, 1]], [[1, 0, 1, 1, 0.5, 1], [0, 0, 0, 1, 0.5, 1]]]);
  t("mirror fill copies from the mirror half", n > 10 && d[(2 * w + 5) * 4] === 50 && d[(2 * w + 5) * 4 + 3] === 255); }
process.exit(ok ? 0 : 1);
