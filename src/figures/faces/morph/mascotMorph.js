// The mascot morph (2026-10-10): the landing page's line drawing becomes the fitted 3D head.
// One timeline, t from 0 to 1, every frame a pure function of t (so it scrubs and records).
// NO TURN (2026-10-11, Agam: "during the face morph from 2D to 3D the face does not need to
// turn"): the head holds the fitted pose (yaw 0, pitch 0) throughout, and the drawing is
// placed onto it by a 2D fit at that pose (handoff.json).
// NO INK ON THE CLAY (same day, Agam: "remove the ink from the face animations"): the 3D ink
// head is gone. The drawing stays exactly as drawn (no warp, no reshaping: the lines only
// fade) and the clay floods in under it, so it reads as the drawing becoming the head:
//   draw    0.00 - 0.06  the drawing, exactly as on the site
//   develop 0.08 - 0.78  colour arrives from deep inside out (flat, then the clay's shading)
//   fade    0.10 - 0.62  the drawing's lines fade out, fully gone before the clay reaches the
//                        outline
//   settle  0.85 - 1.00  the clay head, still: no ink layer at all (the held head and its
//                        emotes draw the clay and nothing else)
import { createMorphRenderer, FW, FH } from "./morphRenderer";
import * as THREE from "three";
import { drawingCoverage, drawingField, halfFieldTexture, halfWarpTexture } from "./morphField";
import handoff from "./handoff.json";

export const WIDTHS = { uBand: 25, uEarW: 23, uNoseW: 20, uMouthW: 23 };
export const PHASES = [["draw", 0, 0.06], ["develop", 0.08, 0.78], ["fade", 0.1, 0.62], ["settle", 0.85, 1]];
const clamp01 = (x) => Math.min(1, Math.max(0, x));
const span = (t, a, b) => clamp01((t - a) / (b - a));
const inOut = (x) => (x < 0.5 ? 4 * x * x * x : 1 - (-2 * x + 2) ** 3 / 2);
const inOutQ = (x) => (x < 0.5 ? 2 * x * x : 1 - (-2 * x + 2) ** 2 / 2);
const lerp = (a, b, k) => a + (b - a) * k;

export function timeline(t, pose = handoff.pose) {
  const head = { yaw: pose.yaw, pitch: pose.pitch, keys: {} }; // held: no turn
  const u = { ...WIDTHS };
  // the drawing as drawn: no warp, no live ink; its lines fade
  u.uWarp = 0; u.uBlend = 0; u.uLive3 = 0;
  const fade = 1 - inOutQ(span(t, 0.1, 0.62));
  u.uInkA = fade;
  u.uField = fade > 0 ? 1 : 0;
  // the colour: the front from 360 px deep (past the head's deepest point, so the first colour
  // grows from nothing rather than appearing as a patch) out to the outline; the shading a
  // little behind
  const d = inOutQ(span(t, 0.08, 0.78));
  u.uDev = t < 0.08 ? 1e4 : lerp(360, -2, d);
  const ds = inOutQ(span(t, 0.12, 0.84));
  u.uDevS = t < 0.12 ? 1e4 : lerp(350, -2, ds);
  return { pose: head, u };
}

// the field in a worker; where workers fail, the same function here
function fieldsOffThread(cov2) {
  const local = () => ({ F2: drawingField(cov2, FW, FH) });
  return new Promise((done) => {
    let w;
    try { w = new Worker(new URL("./morphWorker.js", import.meta.url), { type: "module" }); } catch { done(local()); return; }
    w.onmessage = (e) => { w.terminate(); done(e.data); };
    w.onerror = (e) => { e.preventDefault?.(); w.terminate(); done(local()); };
    w.postMessage({ cov2, W: FW, H: FH });
  });
}

export async function createMascotMorph(canvas, { clear = false, ink, still = false } = {}) {
  const MR = createMorphRenderer({ canvas, clear, ink });
  await MR.ready;
  const pose = handoff.pose;
  const render = (t) => { const f = timeline(t, pose); MR.frame(f.pose, f.u); };
  // the timeline's frame at t with an extra head pose on top (the clay's emotes: shape keys,
  // head moves about the neck, gaze; faceRig3D's pose)
  const renderAt = (t, extra = {}) => { const f = timeline(t, pose); MR.frame({ ...f.pose, ...extra }, f.u); };
  if (still) { render(1); return { render, renderAt, MR, pose }; }
  // the drawing's own field: the lines fade, so there is no 3D ink to read back and no warp
  const cov2 = drawingCoverage(pose, FW, FH);
  const f = await fieldsOffThread(cov2);
  const U = MR.comp.uniforms;
  U.tF2.value = halfFieldTexture(f.F2, FW, FH);
  // the shader still samples the target field and the two warps (weighted to nothing): 1 px stand-ins
  U.tF3.value = halfFieldTexture(new Uint16Array([THREE.DataUtils.toHalfFloat(1e4)]), 1, 1);
  const blankWarp = halfWarpTexture({ a: new Uint16Array(2), gw: 1, gh: 1, step: 4 });
  U.tD.value = blankWarp; U.tDi.value = blankWarp;
  U.uGrid.value.set(1, 1);
  U.uGridStep.value = 4;
  render(0);
  return { render, renderAt, MR, pose, cov2 };
}
