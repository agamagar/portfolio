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
import { MODES, skinById, partKey, VERT, FRAG, SHAPE_GLSL } from "../faceSkins";
import { buildPlastHair } from "./plastHair";
import { resolveFace, packHandles } from "../features/core";
import { makeSurface } from "../features/skinSurface";
import { buildPart } from "../features/parts";

// the ids pass: part codes (red channel / 255); the ear is the skin past the cheek on the side we see (the far ear stays skin:
// the drawing has none, so it is just part of the silhouette)
export const PART_ID = { Skin: 1, Hair: 2, EyeL: 3, EyeR: 4, BrowL: 5, BrowR: 6, Mouth: 7, Ear: 8 };
const EAR_X = -0.98; // object space: skin further out than this, on the near side, is ear

const ID_VERT = /* glsl */ `
#include <common>
#include <morphtarget_pars_vertex>
${SHAPE_GLSL}
varying vec3 vO; varying vec2 vUv;
void main(){
  vUv = uv;
  #include <begin_vertex>
  #include <morphtarget_vertex>
  if (uShape > 0.5) transformed = softShape(transformed);
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
// parts that do not follow the head-shape warp (they are not skin: hair and headwear sit over it)
const PART_SLOTS = ["Headwear", "Beard", "Glasses", "Bindi", "Tilak", "Earring", "NosePin"];
const NOWARP = ["Hair", "HatBand", "Headwear"];
export function createFaceRig({ W, H, src = "/faces/face.glb", fitSrc = "/faces/fit.json", idSrc = "/faces/idmap.png", rawSrc = "/faces/skin-raw.png", marginSrc = "/faces/margins-clay.png", cleanSrc = "/faces/skin-clean.png", skinId = "clay", hat = false, procedural = false, face = null, mode = null }) {
  const scene = new THREE.Scene();
  const cam = new THREE.PerspectiveCamera(27, W / H, 0.1, 50);
  const lightDir = new THREE.Vector3(-0.35, 0.75, 0.75).normalize();
  const lView = new THREE.Vector3();
  // uActs (shared, as FaceSV): how much the eyes, brows and mouth are moving, so their skin
  // margins fade to the clean skin while an emote moves them
  const shared = { uL: { value: lView }, uMode: { value: mode ? MODES[mode] : procedural ? MODES.plast : MODES.fit }, uDot: { value: 7 }, uActs: { value: new THREE.Vector3() }, uDefringe: { value: 0 },
    // the face system (features/): soft-warp handles, the clay's surface detail and warmth
    uW: { value: Array.from({ length: 48 }, () => new THREE.Vector4()) }, uWn: { value: 0 }, uBump: { value: 0.6 }, uSSS: { value: 0.6 } };
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

  const shadedMats = [], lidMats = [];
  let plate = null;
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
    // a drawn (procedural) skin wears no fitted texture and no GLB hair or props: its own hair is built in code
    if (procedural) {
      for (const n of ["Hair", "Hat", "HatBand", "Pin"]) { const m = root.getObjectByName(n); if (m) m.removeFromParent(); }
      for (const m of buildPlastHair((rig.face || (rig.face = resolveFace(face || {}))).hair)) root.add(m);
    }
    placeCam(cam, fit);
    root.updateMatrixWorld(true);
    const meshes = [];
    root.traverse((o) => { if (o.isMesh) meshes.push(o); });
    const skinMapTex = meshes.find((o) => o.name === "Skin")?.material?.map || null; // the skin's map (the lids share it)
    const adopt = (o) => {
      const key = partKey(o.name);
      if (key === "Pin" || (!hat && (key === "Hat" || key === "HatBand"))) { o.visible = false; return; }
      const map = procedural ? null : o.material?.map || null;
      if (map) { map.colorSpace = THREE.NoColorSpace; map.needsUpdate = true; }
      const L = fit.light;
      const crease = key === "Mouth" || key === "MouthInner";
      const lit = key === "Hair" ? L.hair : key === "Brow" ? L.brow || L.hair : key === "Eye" ? L.eye || L.skin
        : key === "Hat" || key === "HatBand" ? L.hat || L.hair : L.skin;
      const P = skin.parts[key] || skin.parts.Skin;
      const mat = new THREE.ShaderMaterial({
        vertexShader: VERT, fragmentShader: FRAG, side: procedural && key === "Hair" ? THREE.DoubleSide : THREE.FrontSide, vertexColors: !!o.geometry.attributes.color,
        uniforms: { ...shared, uBase: { value: new THREE.Color(P.base) }, uShade: { value: new THREE.Color(P.shade) }, uDeep: { value: new THREE.Color(P.deep) },
          uSpec: { value: P.spec || 0 }, uIsHair: { value: key === "Hair" || key === "Beard" || key === "Headwear" ? 1 : 0 }, uMisreg: { value: new THREE.Color() },
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
          uRestModel: { value: o.matrixWorld.clone() }, uRestV: { value: cam.matrixWorldInverse.clone() }, uRestP: { value: cam.projectionMatrix.clone() }, uMirror: { value: 0 }, uPlate: { value: blank }, uUsePlate: { value: 0 }, uDrawn: { value: !procedural && !mode ? (skin.mode === "fit" ? MODES.clay : MODES[skin.mode] ?? -1) : -1 },
          uSeenRad: { value: new THREE.Vector3().fromArray(fit.seen?.[o.name.startsWith("Lid") ? "Skin" : o.name]?.rad || [0, 0, 0]) },
          uSeenLum: { value: fit.seen?.[o.name.startsWith("Lid") ? "Skin" : o.name]?.lum || 0 },
          uTurn: { value: 0 }, uShape: { value: procedural && !NOWARP.includes(key) ? 1 : 0 },
          uMapRaw: { value: (o.name === "Skin" && skinRaw) || blank }, uMargin: { value: (o.name === "Skin" && margins) || blank },
          uHasRaw: { value: o.name === "Skin" && skinRaw && margins ? 1 : 0 },
          uMV: { value: (mv[o.name] && o.geometry.attributes._mvuv && mv[o.name]) || blank },
          uHasMV: { value: mv[o.name] && o.geometry.attributes._mvuv ? 1 : 0 } },
      });
      if (key === "Eye") mat.uniforms.uBase.value.setRGB(...fit.eye, THREE.LinearSRGBColorSpace);
      // THE SHARED LID MECHANISM: a lid (shown while an eye blinks or squints) is skin. Once the rig has painted its skin plate
      // (buildPlate: the skin alone at rest, in the fitted camera's view, features cleaned), a lid draws the plate at the spot it
      // covers, so a closed lid is the surrounding face in whatever skin is worn (clay, noir, felt, stone, claySun...). Before, lids read
      // texture at UVs that landed on the eye's hole: pale discs and grey patches.
      if (o.name.startsWith("Lid") && !procedural) lidMats.push(mat);
      // (the hat counts as hair: part of the head's silhouette, with the hair's flat colour)
      const idCode = PART_ID[o.name] ?? (key === "Skin" ? PART_ID.Skin : key === "Hat" || key === "HatBand" || key === "Headwear" || key === "Beard" ? PART_ID.Hair : key === "Glasses" ? PART_ID.BrowL : ["Bindi", "Tilak", "Earring", "NosePin"].includes(key) ? PART_ID.Skin : 0);
      const idMat = new THREE.ShaderMaterial({ vertexShader: ID_VERT, fragmentShader: ID_FRAG,
        uniforms: { uW: shared.uW, uWn: shared.uWn, uId: { value: idCode }, uEarSplit: { value: o.name === "Skin" ? 1 : 0 }, uShape: { value: procedural && !NOWARP.includes(key) ? 1 : 0 } } });
      mat.userData.key = key;
      o.material = mat;
      shadedMats.push(mat);
      o.userData.mats = { shaded: mat, id: idMat };
      o.userData.rest = { p: o.position.clone() };
      if (o.morphTargetDictionary) rig.morphs.push(o);
      rig.parts[o.name] = o;
    };
    for (const o of meshes) adopt(o);
    rig._adopt = adopt; rig._root = root;
    if (procedural) rig.setFace(rig.face);
    // at rest only the textured lip shows; lids and the mouth's inside wait for a pose that uses them
    for (const n of ["LidL", "LidR", "MouthInner"]) if (rig.parts[n]) rig.parts[n].visible = false;
    root.position.y = NECK;
    head.add(root);
    done(rig);
  }));

  // THE FACE SYSTEM: wear a resolved face (features/core.js resolveFace): the warp handles, the resting
  // face (baseKeys), the palette, the material, and the hair (rebuilt only when its params change).
  // Safe to call before the rig has loaded: it is applied as soon as the meshes exist.
  rig.face = rig.face || null;
  let hairKey = "", surface = null;
  const partKeys = {};
  rig.setFace = (f) => {
    rig.face = f;
    if (!procedural || !rig.parts.Hair) return;
    rig.baseKeys = f.keys;
    shared.uWn.value = packHandles(f.handles, shared.uW.value);
    shared.uMode.value = MODES[f.material.mode];
    shared.uBump.value = f.material.bump; shared.uSSS.value = f.material.sss;
    const base = skinById("plast").parts;
    for (const m of shadedMats) {
      const P = { ...(base[m.userData.key] || base.Skin), ...(f.palette[m.userData.key] || (m.userData.key === "Skin" || m.userData.key === "Mouth" ? {} : {})) };
      m.uniforms.uBase.value.set(P.base); m.uniforms.uShade.value.set(P.shade); m.uniforms.uDeep.value.set(P.deep); m.uniforms.uSpec.value = P.spec || 0;
    }
    const hk = JSON.stringify(f.hair);
    if (hk !== hairKey) {
      hairKey = hk;
      const [hair, clip] = buildPlastHair(f.hair);
      rig.parts.Hair.geometry.dispose(); rig.parts.Hair.geometry = hair.geometry;
      rig.parts.HatBand.geometry.dispose(); rig.parts.HatBand.geometry = clip.geometry;
    }
    rig.parts.HatBand.visible = !!f.hair.clip;
    // the pre-built parts (features/parts/*): headwear, beard, glasses, bindi, tilak, earrings, nose pin. A slot is rebuilt only when
    // its spec changes; the skin's surface is queried once (they sit ON the real geometry)
    const slots = Object.keys(f.parts || {});
    for (const slot of PART_SLOTS) {
      const spec = f.parts?.[slot] || null, k = JSON.stringify(spec);
      if (partKeys[slot] === k) continue;
      partKeys[slot] = k;
      rig.setPart(slot, spec ? buildPart(slot, spec, (surface ||= makeSurface(rig.parts.Skin))) : null);
    }
    // (the palette again: new parts have just taken their materials)
    for (const m of shadedMats) {
      const P = { ...(base[m.userData.key] || base.Skin), ...(f.palette[m.userData.key] || {}) };
      m.uniforms.uBase.value.set(P.base); m.uniforms.uShade.value.set(P.shade); m.uniforms.uDeep.value.set(P.deep); m.uniforms.uSpec.value = P.spec || 0;
    }
  };
  // swap one dynamic part (a mesh named by its slot) in or out of the head
  rig.setPart = (slot, mesh) => {
    const old = rig.parts[slot];
    if (old) {
      old.removeFromParent(); old.geometry.dispose();
      const i = shadedMats.indexOf(old.userData.mats?.shaded); if (i >= 0) shadedMats.splice(i, 1);
      old.userData.mats?.shaded.dispose(); old.userData.mats?.id.dispose();
      const j = rig.morphs.indexOf(old); if (j >= 0) rig.morphs.splice(j, 1);
      delete rig.parts[slot];
    }
    if (!mesh) return;
    mesh.name = slot;
    rig._root.add(mesh);
    rig._root.updateMatrixWorld(true);
    rig._adopt(mesh);
  };

  // free this rig's GPU side (geometry, textures, programs) once it is no longer worn
  rig.dispose = () => {
    const seen = new Set();
    scene.traverse((o) => { o.geometry?.dispose(); });
    for (const m of shadedMats) { for (const u of Object.values(m.uniforms)) { const t = u.value; if (t?.isTexture && !seen.has(t)) { seen.add(t); t.dispose(); } } m.dispose(); }
    for (const o of Object.values(rig.parts)) o.userData.mats?.id?.dispose();
    plate?.dispose();
  };

  // pose: { yaw, pitch (the viewer's turn), tilt, hpitch, hyaw (the head about the neck), keys: {arkitName: w} }
  rig.pose = (p = {}) => {
    turn.rotation.set(p.pitch || 0, p.yaw || 0, 0, "YXZ");
    // as FaceSV: once the view has turned away from the fitted pose the fitted look trusts its
    // camera-projected textures only where the surface faced the camera squarely (uTurn), and
    // the camera pulls back so no angle is cropped. This is what keeps a turned head from
    // smearing its far ear
    const away = Math.min(1, (Math.abs(Math.atan2(Math.sin(p.yaw || 0), Math.cos(p.yaw || 0))) + Math.abs(p.pitch || 0)) / 0.7);
    for (const m of shadedMats) m.uniforms.uTurn.value = away;
    const z = (1 - 0.22 * away * away * (3 - 2 * away)) * (procedural ? 0.78 : 1); // (the soft clay's hair is wider than the fitted head)
    if (Math.abs(cam.zoom - z) > 1e-4) { cam.zoom = z; cam.updateProjectionMatrix(); }
    head.rotation.set(p.hpitch || 0, p.hyaw || 0, p.tilt || 0);
    // LAYERING (features/core.js): the resting face (baseKeys) sits under the emote. A group of keys (eyes,
    // brows, mouth/jaw/cheeks) fades its resting weights out as the emote moves any key in that group,
    // so a blink closes from the resting squint, a grin replaces the resting curve, and the rest returns
    // when the emote lets go.
    let keys = p.keys || {};
    if (procedural && Object.keys(rig.baseKeys).length) {
      const grp = (n) => (n.startsWith("eye") ? "eye" : n.startsWith("brow") ? "brow" : "mouth");
      const act = { eye: 0, brow: 0, mouth: 0 };
      for (const [n, v] of Object.entries(keys)) act[grp(n)] = Math.max(act[grp(n)], v || 0);
      keys = { ...keys };
      for (const [n, v0] of Object.entries(rig.baseKeys)) keys[n] = Math.max(keys[n] || 0, v0 * (1 - Math.min(1, act[grp(n)] * 2.5)));
    }
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
  // the skin plate: the Skin mesh alone at rest (no head move, no shape keys, no turn), its features faded to the clean skin (uActs = 1),
  // drawn once through the fitted camera into a render target. Lids sample it by their rest projection (vProj).
  const buildPlate = (renderer) => {
    plate = new THREE.WebGLRenderTarget(W, H, { colorSpace: THREE.SRGBColorSpace });
    const vis = {}; for (const [n, o] of Object.entries(rig.parts)) { vis[n] = o.visible; o.visible = n === "Skin"; }
    const sv = { tr: turn.rotation.clone(), hr: head.rotation.clone(), hp: head.position.clone(), bs: body.scale.clone(), zoom: cam.zoom, acts: shared.uActs.value.clone(), turn: shadedMats[0]?.uniforms.uTurn.value || 0, infl: rig.parts.Skin.morphTargetInfluences ? [...rig.parts.Skin.morphTargetInfluences] : null };
    turn.rotation.set(0, 0, 0); head.rotation.set(0, 0, 0); head.position.set(0, -NECK, 0); body.scale.set(1, 1, 1);
    cam.zoom = 1; cam.updateProjectionMatrix(); shared.uActs.value.set(1, 1, 1);
    for (const m of shadedMats) m.uniforms.uTurn.value = 0;
    if (sv.infl) rig.parts.Skin.morphTargetInfluences.fill(0);
    use("shaded");
    lView.copy(lightDir).transformDirection(cam.matrixWorldInverse);
    const prev = renderer.getRenderTarget(); renderer.setRenderTarget(plate); renderer.setClearColor(0x000000, 0); renderer.clear(); renderer.render(scene, cam); renderer.setRenderTarget(prev);
    turn.rotation.copy(sv.tr); head.rotation.copy(sv.hr); head.position.copy(sv.hp); body.scale.copy(sv.bs); cam.zoom = sv.zoom; cam.updateProjectionMatrix(); shared.uActs.value.copy(sv.acts);
    for (const m of shadedMats) m.uniforms.uTurn.value = sv.turn;
    if (sv.infl) sv.infl.forEach((v, i) => (rig.parts.Skin.morphTargetInfluences[i] = v));
    for (const [n, o] of Object.entries(rig.parts)) o.visible = vis[n];
    for (const m of lidMats) { m.uniforms.uPlate.value = plate.texture; m.uniforms.uUsePlate.value = 1; }
  };
  rig.shaded = (renderer, target = null) => {
    if (!plate && lidMats.length) buildPlate(renderer);
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
