// The mascot morph (2026-10-10): the landing page's line drawing becomes the fitted 3D head.
// One timeline, t from 0 to 1, every frame a pure function of t (so it scrubs and records):
//   draw   0.00 - 0.06  the drawing, exactly as on the site
//   morph  0.06 - 0.40  the drawing slides onto the 3D head drawn in ink at the drawing's own
//                       pose (the pose fit): one smooth warp carries every stroke, a distance
//                       blend closes the last pixels. At 0.40 the field IS the 3D ink render.
//   turn   0.40 - 0.62  now live from the mesh, the ink head turns from the drawing's pose to
//                       the fitted one: the drawing shows it has depth
//   develop 0.58 - 0.93 colour arrives from deep inside out (flat, then the clay's shading);
//                       the ink leaves the same way, the outline last; the lines thin away
//   settle 0.93 - 1.00  the clay head, still
import { createMorphRenderer, FW, FH } from "./morphRenderer";
import { tps, sdf, drawingCoverage, fieldTexture, warpTexture } from "./morphField";
import handoff from "./handoff.json";

export const WIDTHS = { uBand: 25, uEarW: 23, uNoseW: 20, uMouthW: 23 };
export const PHASES = [
  ["draw", 0, 0.06], ["morph", 0.06, 0.4], ["turn", 0.4, 0.62], ["develop", 0.58, 0.93], ["settle", 0.93, 1],
];
const clamp01 = (x) => Math.min(1, Math.max(0, x));
const span = (t, a, b) => clamp01((t - a) / (b - a));
const inOut = (x) => (x < 0.5 ? 4 * x * x * x : 1 - (-2 * x + 2) ** 3 / 2);
const inOutQ = (x) => (x < 0.5 ? 2 * x * x : 1 - (-2 * x + 2) ** 2 / 2);
const lerp = (a, b, k) => a + (b - a) * k;

export function timeline(t, pose = handoff.pose) {
  const A = { yaw: pose.yaw, pitch: pose.pitch };
  const u = { ...WIDTHS };
  // morph
  const m = inOut(span(t, 0.06, 0.4));
  u.uWarp = m;
  u.uBlend = m;
  u.uField = t < 0.4 ? 1 : 0;
  // turn
  const k = inOut(span(t, 0.4, 0.62));
  const head = { yaw: lerp(A.yaw, 0, k), pitch: lerp(A.pitch, 0, k), keys: {} };
  // develop: the front from 300 px deep out to the outline (the colour washes in just ahead of it); the shading a little behind it
  const d = inOutQ(span(t, 0.58, 0.88));
  u.uDev = t < 0.58 ? 1e4 : lerp(300, -2, d);
  const ds = inOutQ(span(t, 0.61, 0.91));
  u.uDevS = t < 0.61 ? 1e4 : lerp(300, -2, ds);
  const thin = 1 - inOutQ(span(t, 0.74, 0.92));
  u.uEarW = WIDTHS.uEarW * thin; u.uNoseW = WIDTHS.uNoseW * thin; u.uMouthW = WIDTHS.uMouthW * thin;
  return { pose: head, u };
}

export async function createMascotMorph(canvas) {
  const MR = createMorphRenderer({ canvas });
  await MR.ready;
  const pose = handoff.pose;
  const A = { yaw: pose.yaw, pitch: pose.pitch };
  // the 3D ink at the hand-off pose: the morph's target, read back from the canvas
  MR.frame(A, { ...WIDTHS, uField: 0, uDev: 1e4, uDevS: 1e4 });
  const c2 = document.createElement("canvas");
  c2.width = FW; c2.height = FH;
  const g = c2.getContext("2d", { willReadFrequently: true });
  g.drawImage(MR.renderer.domElement, 0, 0);
  const px = g.getImageData(0, 0, FW, FH).data;
  const paper = 235, ink = 23;
  const cov3 = new Uint8Array(FW * FH);
  for (let i = 0; i < cov3.length; i++) cov3[i] = Math.round(255 * clamp01((paper - px[i * 4]) / (paper - ink)));
  const cov2 = drawingCoverage(pose, FW, FH);
  const F2 = sdf(cov2, FW, FH), F3 = sdf(cov3, FW, FH);
  const a = handoff.pairs.map((p) => p.a), b = handoff.pairs.map((p) => p.b);
  const D = warpTexture(tps(a, b, 0.02), FW, FH), Di = warpTexture(tps(b, a, 0.02), FW, FH);
  const U = MR.comp.uniforms;
  U.tF2.value = fieldTexture(F2, FW, FH);
  U.tF3.value = fieldTexture(F3, FW, FH);
  U.tD.value = D; U.tDi.value = Di;
  U.uGrid.value.set(D.userData.gw, D.userData.gh);
  U.uGridStep.value = D.userData.step;
  const render = (t) => { const f = timeline(t, pose); MR.frame(f.pose, f.u); };
  render(0);
  return { render, MR, cov2, cov3 };
}
