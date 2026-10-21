// page-side half of rigshot.mjs: the hero's own rig (faceRig3D: what the homepage draws for clay and
// noir), posed by the hero's emotes, shaded pass only, on a transparent ground.
import * as THREE from "three";
import { createFaceRig } from "/src/figures/faces/morph/faceRig3D.js";
import { resolveFace, PRESETS } from "/src/figures/faces/features/core.js";
import { SKINS, skinById } from "/src/figures/faces/faceSkins.js";
import { EMOTES, sample, toPose } from "/src/figures/faces/morph/emotes.js";
const W = 802, H = 862;
const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, premultipliedAlpha: true, preserveDrawingBuffer: true });
renderer.setPixelRatio(1); renderer.setSize(W, H, false); renderer.outputColorSpace = THREE.SRGBColorSpace;
const cfg = {
  clay: { W, H },
  noir: { W, H, src: "/faces/face-noir.glb", fitSrc: "/faces/fit-noir.json", idSrc: null, rawSrc: "/faces/skin-raw-noir.png", marginSrc: "/faces/margins-noir.png", cleanSrc: "/faces/skin-clean-noir.png", skinId: "noir", hat: true },
};
// every other skin, as morphRenderer.loadSkin builds it (a fitted rig of its own; print drawn on the head)
for (const sk of SKINS) if (!cfg[sk.id]) cfg[sk.id] = sk.rig
  ? { W, H, src: sk.rig.src, fitSrc: sk.rig.fit, idSrc: sk.rig.idmap || null, rawSrc: sk.rig.raw || null, marginSrc: sk.rig.margins || null, cleanSrc: null, skinId: sk.id }
  : { W, H, idSrc: null, rawSrc: null, marginSrc: null, cleanSrc: null, skinId: sk.id, mode: sk.mode };
const rigs = {};
export async function load(id) { rigs[id] ||= createFaceRig(cfg[id]); await rigs[id].ready; }
// emote: EMOTES key or null; t: 0..1 through it; yaw/pitch: the viewer's turn
export function shot(id, emote, t, yaw = 0, pitch = 0) {
  const rig = rigs[id];
  const s = emote ? sample(EMOTES[emote][1], t) : sample(EMOTES.blink[1], 0);
  rig.pose({ ...toPose(s), yaw, pitch });
  rig.shaded(renderer, null);
  return renderer.domElement.toDataURL("image/png");
}
export const names = Object.keys(EMOTES);
export const peak = Object.fromEntries(Object.entries(EMOTES).map(([k, [, fr]]) => [k, fr[1][0]]));
// a hand-made pose: shotPose("clay", { tilt, hyaw, keys: { mouthPucker: 1 } })
export function shotPose(id, p) {
  const rig = rigs[id];
  rig.pose(p); rig.shaded(renderer, null);
  return renderer.domElement.toDataURL("image/png");
}
cfg.plast = { face: resolveFace(PRESETS["agam-clay"]), W, H, idSrc: null, rawSrc: null, marginSrc: null, cleanSrc: null, skinId: "plast", hat: true, procedural: true };
// wear a face config on a rig: a preset name, or a JSON object of feature blocks
export function useFace(id, spec) { rigs[id].setFace(resolveFace(typeof spec === "string" ? PRESETS[spec] : spec)); }
export const R = rigs;
