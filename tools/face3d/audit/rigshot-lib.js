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
import { rigConfig } from "/src/figures/faces/morph/rigConfigs.js";
const cfg = new Proxy({}, { get: (_, id) => (id === "plast" ? { ...rigConfig("plast", W, H), face: resolveFace(PRESETS["agam-clay"]) } : rigConfig(String(id), W, H)) });
// wear a face config on a rig: a preset name, or a JSON object of feature blocks
export function useFace(id, spec) { rigs[id].setFace(resolveFace(typeof spec === "string" ? PRESETS[spec] : spec)); }
export const R = rigs;
export { PRESETS };
