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
import { MeshoptDecoder } from "three/examples/jsm/libs/meshopt_decoder.module.js";
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

// skinId: whose parts and shape keys it wears ("clay", or "noir": the fedora's hatCompress key);
// cleanSrc: the skin's CLEAN texture (tools/face3d/morph/clean_skin.py, 12 Oct): the GLB's own map
// still carried the eyes, brows and the mouth's crease, so on every emote the painted copy stayed
// behind (two mouths, a shadow where an eye was). With it, wherever a rig uses the skin texture it
// reads this instead; a missing file falls back to the GLB's map.
// hat: show the hat parts (the clay rig hides them); a rig without an id map, raw skin or margins
// (noir has none) passes null for them and draws what its own maps carry
export function createFaceRig({ W, H, src = "/faces/face.glb", fitSrc = "/faces/fit.json", idSrc = "/faces/idmap.png", rawSrc = "/faces/skin-raw.png", marginSrc = "/faces/margins-clay.png", cleanSrc = "/faces/skin-clean.png", skinId = "clay", hat = false }) {
  const scene = new THREE.Scene();
  const cam = new THREE.PerspectiveCamera(27, W / H, 0.1, 50);
  const lightDir = new THREE.Vector3(-0.35, 0.75, 0.75).normalize();
  const lView = new THREE.Vector3();
  // uActs (shared, as FaceSV): how much the eyes, brows and mouth are moving, so their skin
  // margins fade to the clean skin while an emote moves them
  const shared = { uL: { value: lView }, uMode: { value: MODES.fit }, uDot: { value: 7 }, uActs: { value: new THREE.Vector3() } };
  const skin = skinById(skinId);

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

  const shadedMats = [];
  const rig = { scene, cam, parts: {}, morphs: [], skinned: [], baseKeys: skin.keys || {} };
  const fitP = fetch(fitSrc).then((x) => x.json());
  // every sampler gets a texture (an unbound one reads unit 0, whatever type is there)
  const blank = new THREE.DataTexture(new Uint8Array(4), 1, 1);
  blank.needsUpdate = true;
  const idMap = idSrc ? new THREE.TextureLoader().load(idSrc, (t) => { t.flipY = false; t.colorSpace = THREE.NoColorSpace; t.needsUpdate = true; }) : null;
  if (idMap) { idMap.flipY = false; idMap.magFilter = idMap.minFilter = THREE.NearestFilter; idMap.generateMipmaps = false; }
  // as FaceSV (2026-10-11): the skin as the reference shows it (features baked in) and the
  // feature margins; at rest the skin shows raw. Waited for, so no frame draws without them
  const data = (file) => !file ? Promise.resolve(null) : new Promise((ok) => {
    const t = new THREE.TextureLoader().load(file, () => { t.needsUpdate = true; ok(t); }, undefined, () => ok(null));
    t.flipY = false; t.colorSpace = THREE.NoColorSpace; t.magFilter = t.minFilter = THREE.LinearFilter;
  });
  const rawP = Promise.all([data(rawSrc), data(marginSrc)]);
  // the clean skin keeps its mip chain: the shader reads a blurred level of the map for surface the
  // reference never saw (a bias on the lookup), as it does of the GLB's own
  const cleanP = !cleanSrc ? Promise.resolve(null) : new Promise((ok) => {
    const t = new THREE.TextureLoader().load(cleanSrc, () => { t.needsUpdate = true; ok(t); }, undefined, () => ok(null));
    t.flipY = false; t.colorSpace = THREE.NoColorSpace; t.generateMipmaps = true;
    t.magFilter = THREE.LinearFilter; t.minFilter = THREE.LinearMipmapLinearFilter; t.anisotropy = 4;
  });

  // (a rig may ship meshopt-compressed: FaceSV loads the same files)
  rig.ready = new Promise((done) => new GLTFLoader().setMeshoptDecoder(MeshoptDecoder).load(src, async (gltf) => {
    const fit = (rig.fit = await fitP);
    const [skinRaw, margins] = await rawP;
    const cleanSkin = await cleanP;
    // the turnaround atlas (fit.json "mv", 11 Oct, as FaceSV): each part's colour from every
    // side, for the surface the reference never saw. Its sampler MUST be bound: left unbound
    // it read a texture of another type and every clay draw failed (an empty, flat head)
    const mv = Object.fromEntries(await Promise.all(Object.entries(fit.mv?.maps || {}).map(async ([part, file]) => [part, await data(fitSrc.replace(/[^/]*$/, file))])));
    const root = gltf.scene;
    placeCam(cam, fit);
    root.updateMatrixWorld(true);
    const meshes = [];
    root.traverse((o) => { if (o.isMesh) meshes.push(o); });
    const skinMapTex = meshes.find((o) => o.name === "Skin")?.material?.map || null; // the skin's map (the lids share it)
    for (const o of meshes) {
      const key = partKey(o.name);
      if (key === "Pin" || (!hat && (key === "Hat" || key === "HatBand"))) { o.visible = false; continue; }
      const map = o.material?.map || null;
      if (map) { map.colorSpace = THREE.NoColorSpace; map.needsUpdate = true; }
      const L = fit.light;
      const crease = key === "Mouth" || key === "MouthInner";
      const lit = key === "Hair" ? L.hair : key === "Brow" ? L.brow || L.hair : key === "Eye" ? L.eye || L.skin
        : key === "Hat" || key === "HatBand" ? L.hat || L.hair : L.skin;
      const P = skin.parts[key] || skin.parts.Skin;
      const mat = new THREE.ShaderMaterial({
        vertexShader: VERT, fragmentShader: FRAG, vertexColors: !!o.geometry.attributes.color,
        uniforms: { ...shared, uBase: { value: new THREE.Color(P.base) }, uShade: { value: new THREE.Color(P.shade) }, uDeep: { value: new THREE.Color(P.deep) },
          uSpec: { value: P.spec || 0 }, uIsHair: { value: key === "Hair" ? 1 : 0 }, uMisreg: { value: new THREE.Color() },
          uSH: { value: SHv(lit) }, uK: { value: lit.k },
          uUseMap: { value: map ? 1 : 0 }, uMap: { value: (cleanSkin && map && map === skinMapTex && cleanSkin) || map || blank }, uIsEye: { value: key === "Eye" ? 1 : 0 },
          uFloor: { value: lit.floor ?? 0.03 }, uTexScale: { value: lit.scale ?? 4 }, uTexGamma: { value: lit.gamma ?? 1 },
          uTint: { value: key === "MouthInner" ? (fit.mono ? new THREE.Vector3().setScalar(0.2) : new THREE.Vector3(0.32, 0.16, 0.14)) : new THREE.Vector3().setScalar(crease && !map ? 0.8 : 1) },
          uRestNM: { value: new THREE.Matrix3().setFromMatrix4(cam.matrixWorldInverse.clone().multiply(o.matrixWorld)) },
          uIdMap: { value: idMap || blank }, uIdRes: { value: new THREE.Vector2(802, 862) }, uTurnOnly: { value: 0 },
          uPartId: { value: fit.ids && idMap ? fit.ids.indexOf(o.name.startsWith("Lid") ? "Skin" : o.name) : -1 },
          uLayered: { value: ["Skin", "Hair", "LidL", "LidR"].includes(o.name) ? 1 : 0 },
          uFlatN: { value: new THREE.Vector3().fromArray(fit.lids?.[o.name] || [0, 0, 1]) }, uFlat: { value: fit.lids?.[o.name] ? 0.85 : 0 },
          uRatioMean: { value: new THREE.Vector3().fromArray(fit.ratioMean?.[o.name.startsWith("Lid") ? "Skin" : o.name] || [0, 0, 0]) },
          // (no depth test in the hero: it shows the fitted pose; bound, as every sampler must be)
          uDepth: { value: blank }, uHasDepth: { value: 0 }, uRestMV: { value: new THREE.Matrix4() },
          uRecess: { value: o.name === "Mouth" && map ? 0.025 : 0 }, // (as FaceSV: the lip sinks while the mouth moves)
          uRestModel: { value: new THREE.Matrix4() }, uRestV: { value: new THREE.Matrix4() }, uRestP: { value: new THREE.Matrix4() }, uMirror: { value: 0 },
          uSeenRad: { value: new THREE.Vector3().fromArray(fit.seen?.[o.name.startsWith("Lid") ? "Skin" : o.name]?.rad || [0, 0, 0]) },
          uSeenLum: { value: fit.seen?.[o.name.startsWith("Lid") ? "Skin" : o.name]?.lum || 0 },
          uTurn: { value: 0 },
          uMapRaw: { value: (o.name === "Skin" && skinRaw) || blank }, uMargin: { value: (o.name === "Skin" && margins) || blank },
          uHasRaw: { value: o.name === "Skin" && skinRaw && margins ? 1 : 0 },
          uMV: { value: (mv[o.name] && o.geometry.attributes._mvuv && mv[o.name]) || blank },
          uHasMV: { value: mv[o.name] && o.geometry.attributes._mvuv ? 1 : 0 } },
      });
      if (key === "Eye") mat.uniforms.uBase.value.setRGB(...fit.eye, THREE.LinearSRGBColorSpace);
      // (the hat counts as hair: part of the head's silhouette, with the hair's flat colour)
      const idCode = PART_ID[o.name] ?? (key === "Skin" ? PART_ID.Skin : key === "Hat" || key === "HatBand" ? PART_ID.Hair : 0);
      const idMat = new THREE.ShaderMaterial({ vertexShader: ID_VERT, fragmentShader: ID_FRAG,
        uniforms: { uId: { value: idCode }, uEarSplit: { value: o.name === "Skin" ? 1 : 0 } } });
      o.material = mat;
      shadedMats.push(mat);
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
    // as FaceSV: once the view has turned away from the fitted pose the fitted look trusts its
    // camera-projected textures only where the surface faced the camera squarely (uTurn), and
    // the camera pulls back so no angle is cropped. This is what keeps a turned head from
    // smearing its far ear
    const away = Math.min(1, (Math.abs(Math.atan2(Math.sin(p.yaw || 0), Math.cos(p.yaw || 0))) + Math.abs(p.pitch || 0)) / 0.7);
    for (const m of shadedMats) m.uniforms.uTurn.value = away;
    const z = 1 - 0.22 * away * away * (3 - 2 * away);
    if (Math.abs(cam.zoom - z) > 1e-4) { cam.zoom = z; cam.updateProjectionMatrix(); }
    head.rotation.set(p.hpitch || 0, p.hyaw || 0, p.tilt || 0);
    const keys = p.keys || {};
    // as FaceSV's fitted look: the lids only while a blink or squint uses them (wide eyes pull
    // them out of sight), the lip's inside only while the mouth moves. (The lip itself stays:
    // the morph's ink head draws its mouth line from it.)
    const k = (n) => keys[n] || 0;
    const eyeOn = ["eyeBlinkLeft", "eyeBlinkRight", "eyeSquintLeft", "eyeSquintRight"].some((n) => k(n) > 0.02);
    const mouthOn = ["jawOpen", "mouthSmileLeft", "mouthSmileRight", "mouthFrownLeft", "mouthFrownRight", "mouthPucker"].some((n) => k(n) > 0.02);
    for (const n of ["LidL", "LidR"]) if (rig.parts[n]) rig.parts[n].visible = eyeOn;
    if (rig.parts.MouthInner) rig.parts.MouthInner.visible = mouthOn;
    // the head's lift and sideways shift about the neck, the body's squash and stretch (about the
    // chin, as FaceSV's bounce), and the gaze (the bead and its lids slide together)
    head.position.y = -NECK + (p.hy || 0);
    head.position.x = p.hx || 0;
    const sx = p.sx ?? 1, sy = p.sy ?? 1;
    body.scale.set(sx, sy, (sx + sy) / 2);
    for (const n of ["EyeL", "EyeR", "LidL", "LidR"]) {
      const o = rig.parts[n];
      if (o) o.position.set(o.userData.rest.p.x + (p.eyeX || 0), o.userData.rest.p.y + (p.eyeY || 0), o.userData.rest.p.z);
    }
    const on = (v) => Math.min(1, Math.max(0, v / 0.12));
    shared.uActs.value.set(
      on(Math.max(k("eyeBlinkLeft"), k("eyeBlinkRight"), k("eyeSquintLeft"), k("eyeSquintRight"), k("eyeWideLeft"), k("eyeWideRight"), Math.abs(p.eyeX || 0) * 8, Math.abs(p.eyeY || 0) * 8)),
      on(Math.max(k("browInnerUp"), k("browOuterUpLeft"), k("browOuterUpRight"), k("browDownLeft"), k("browDownRight"))),
      on(Math.max(k("jawOpen"), k("mouthSmileLeft"), k("mouthSmileRight"), k("mouthFrownLeft"), k("mouthFrownRight"), k("mouthPucker"), k("cheekPuff"))));
    for (const m of rig.morphs) {
      const d = m.morphTargetDictionary, w = m.morphTargetInfluences;
      if (w) for (const k in d) w[d[k]] = keys[k] ?? rig.baseKeys[k] ?? 0;
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
