// The fitted clay head (public/faces/face.glb + fit.json) as a renderer-agnostic rig for the
// mascot morph (2026-10-10). The same materials FaceSV builds for the "fit" mode, set up the
// same way, but with no clock of its own: the caller poses it and asks for a frame, so a
// morph can be scrubbed and recorded frame by frame. Two passes:
//   shaded(target): the clay look, exactly what FaceSV draws at rest
//   ids(target):    each part in a flat code colour (for the morph's flat fills and masks)
// Head moves use FaceSV's own stack: body > turn (the viewer's turn about the head's centre,
// yaw then pitch) > head (tilt about the neck) > the model.

import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { MODES, skinById, partKey, VERT, FRAG } from "../faceSkins";

// the ids pass: part codes (red channel / 255); the ear is the skin past the cheek on the side we see (the far ear stays skin:
// the drawing has none, so it is just part of the silhouette)
export const PART_ID = { Skin: 1, Hair: 2, EyeL: 3, EyeR: 4, BrowL: 5, BrowR: 6, Mouth: 7, Ear: 8 };
const EAR_X = -0.98; // object space: skin further out than this, on the near side, is ear

const ID_VERT = /* glsl */ `
#include <common>
#include <morphtarget_pars_vertex>
varying vec3 vO; varying vec2 vUv;
void main(){
  vUv = uv;
  #include <begin_vertex>
  #include <morphtarget_vertex>
  vO = transformed;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(transformed, 1.0);
}`;
const ID_FRAG = /* glsl */ `
uniform float uId, uEarSplit; varying vec3 vO; varying vec2 vUv;
void main(){
  float id = uId;
  if (uEarSplit > 0.5 && vO.x < ${EAR_X.toFixed(3)} && vO.y > -0.75 && vO.y < 0.55) id = ${PART_ID.Ear.toFixed(1)};
  gl_FragColor = vec4(id / 255.0, 0.0, 0.0, 1.0);
}`;

export function createFaceRig({ W, H, src = "/faces/face.glb", fitSrc = "/faces/fit.json", idSrc = "/faces/idmap.png" }) {
  const scene = new THREE.Scene();
  const cam = new THREE.PerspectiveCamera(27, W / H, 0.1, 50);
  const lightDir = new THREE.Vector3(-0.35, 0.75, 0.75).normalize();
  const lView = new THREE.Vector3();
  const shared = { uL: { value: lView }, uMode: { value: MODES.fit }, uDot: { value: 7 } };
  const skin = skinById("clay");

  const body = new THREE.Group();
  body.position.y = -1.0;
  scene.add(body);
  const turn = new THREE.Group();
  turn.position.y = 1.0;
  body.add(turn);
  const head = new THREE.Group();
  const NECK = 0.85;
  head.position.y = -NECK;
  turn.add(head);

  const placeCam = (c, f) => {
    c.fov = f.camera.fov;
    c.position.fromArray(f.camera.position);
    c.quaternion.fromArray(f.camera.quaternion);
    const big = Math.max(W, H);
    c.setViewOffset(W, H, f.camera.shift[0] * big, -f.camera.shift[1] * big, W, H);
    c.updateProjectionMatrix();
    c.updateMatrixWorld();
  };
  const SHv = (L) => Array.from({ length: 9 }, (_, j) => new THREE.Vector3(L.sh[0][j], L.sh[1][j], L.sh[2][j]));

  const rig = { scene, cam, parts: {}, morphs: [], skinned: [] };
  const fitP = fetch(fitSrc).then((x) => x.json());
  const idMap = new THREE.TextureLoader().load(idSrc, (t) => { t.flipY = false; t.colorSpace = THREE.NoColorSpace; t.needsUpdate = true; });
  idMap.flipY = false; idMap.magFilter = idMap.minFilter = THREE.NearestFilter; idMap.generateMipmaps = false;

  rig.ready = new Promise((done) => new GLTFLoader().load(src, async (gltf) => {
    const fit = (rig.fit = await fitP);
    const root = gltf.scene;
    placeCam(cam, fit);
    root.updateMatrixWorld(true);
    const meshes = [];
    root.traverse((o) => { if (o.isMesh) meshes.push(o); });
    for (const o of meshes) {
      const key = partKey(o.name);
      if (["Hat", "HatBand", "Pin"].includes(key)) { o.visible = false; continue; }
      const map = o.material?.map || null;
      if (map) { map.colorSpace = THREE.NoColorSpace; map.needsUpdate = true; }
      const L = fit.light;
      const crease = key === "Mouth" || key === "MouthInner";
      const lit = key === "Hair" ? L.hair : key === "Brow" ? L.brow || L.hair : key === "Eye" ? L.eye || L.skin : L.skin;
      const P = skin.parts[key] || skin.parts.Skin;
      const mat = new THREE.ShaderMaterial({
        vertexShader: VERT, fragmentShader: FRAG, vertexColors: !!o.geometry.attributes.color,
        uniforms: { ...shared, uBase: { value: new THREE.Color(P.base) }, uShade: { value: new THREE.Color(P.shade) }, uDeep: { value: new THREE.Color(P.deep) },
          uSpec: { value: P.spec || 0 }, uIsHair: { value: key === "Hair" ? 1 : 0 }, uMisreg: { value: new THREE.Color() },
          uSH: { value: SHv(lit) }, uK: { value: lit.k },
          uUseMap: { value: map ? 1 : 0 }, uMap: { value: map }, uIsEye: { value: key === "Eye" ? 1 : 0 },
          uFloor: { value: lit.floor ?? 0.03 }, uTexScale: { value: lit.scale ?? 4 }, uTexGamma: { value: lit.gamma ?? 1 },
          uTint: { value: key === "MouthInner" ? new THREE.Vector3(0.32, 0.16, 0.14) : new THREE.Vector3().setScalar(crease && !map ? 0.8 : 1) },
          uRestNM: { value: new THREE.Matrix3().setFromMatrix4(cam.matrixWorldInverse.clone().multiply(o.matrixWorld)) },
          uIdMap: { value: idMap }, uIdRes: { value: new THREE.Vector2(802, 862) },
          uPartId: { value: fit.ids ? fit.ids.indexOf(o.name.startsWith("Lid") ? "Skin" : o.name) : -1 },
          uLayered: { value: ["Skin", "Hair", "LidL", "LidR"].includes(o.name) ? 1 : 0 },
          uFlatN: { value: new THREE.Vector3().fromArray(fit.lids?.[o.name] || [0, 0, 1]) }, uFlat: { value: fit.lids?.[o.name] ? 0.85 : 0 } },
      });
      if (key === "Eye") mat.uniforms.uBase.value.setRGB(...fit.eye, THREE.LinearSRGBColorSpace);
      const idCode = PART_ID[o.name] ?? (key === "Skin" ? PART_ID.Skin : 0);
      const idMat = new THREE.ShaderMaterial({ vertexShader: ID_VERT, fragmentShader: ID_FRAG,
        uniforms: { uId: { value: idCode }, uEarSplit: { value: o.name === "Skin" ? 1 : 0 } } });
      o.material = mat;
      o.userData.mats = { shaded: mat, id: idMat };
      o.userData.rest = { p: o.position.clone() };
      if (o.morphTargetDictionary) rig.morphs.push(o);
      rig.parts[o.name] = o;
    }
    // at rest only the textured lip shows; lids and the mouth's inside wait for a pose that uses them
    for (const n of ["LidL", "LidR", "MouthInner"]) if (rig.parts[n]) rig.parts[n].visible = false;
    root.position.y = NECK;
    head.add(root);
    done(rig);
  }));

  // pose: { yaw, pitch (the viewer's turn), tilt, hpitch, hyaw (the head about the neck), keys: {arkitName: w} }
  rig.pose = (p = {}) => {
    turn.rotation.set(p.pitch || 0, p.yaw || 0, 0, "YXZ");
    head.rotation.set(p.hpitch || 0, p.hyaw || 0, p.tilt || 0);
    const keys = p.keys || {};
    const eyeOn = Object.keys(keys).some((k) => /^eye(Blink|Squint|Wide)/.test(k) && keys[k] > 0.02);
    const mouthOn = Object.keys(keys).some((k) => /^(jawOpen|mouthSmile|mouthFrown|mouthPucker)/.test(k) && keys[k] > 0.02);
    for (const n of ["LidL", "LidR"]) if (rig.parts[n]) rig.parts[n].visible = eyeOn;
    if (rig.parts.MouthInner) rig.parts.MouthInner.visible = mouthOn;
    for (const m of rig.morphs) {
      const d = m.morphTargetDictionary, w = m.morphTargetInfluences;
      if (w) for (const k in d) w[d[k]] = keys[k] ?? 0;
    }
  };
  const use = (which) => { for (const o of Object.values(rig.parts)) o.material = o.userData.mats[which]; };
  rig.shaded = (renderer, target = null) => {
    use("shaded");
    lView.copy(lightDir).transformDirection(cam.matrixWorldInverse);
    renderer.setRenderTarget(target);
    renderer.setClearColor(0x000000, 0);
    renderer.clear();
    renderer.render(scene, cam);
  };
  rig.ids = (renderer, target = null) => {
    use("id");
    const lids = ["LidL", "LidR"].map((n) => rig.parts[n]?.visible);
    renderer.setRenderTarget(target);
    renderer.setClearColor(0x000000, 1);
    renderer.clear();
    renderer.render(scene, cam);
    ["LidL", "LidR"].forEach((n, i) => { if (rig.parts[n]) rig.parts[n].visible = lids[i]; });
    use("shaded");
  };
  return rig;
}
