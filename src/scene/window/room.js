/**
 * room.js: the room at photo fidelity: the window (casing, the left French pair, the
 * corner post, the right section built at an angle with R1 ajar), glass with dust and
 * rain, the room-side iron grille, the sill and its objects, the brown exterior box
 * grille, the cream walls, the Roman blind and its bead chain, the desk, the BenQ
 * MA270UP and the portrait monitor, the black dome lamp. Parts live in room/*.js,
 * materials in materials.js, numbers in params.room.js.
 *
 * World frame (30-locked-brief.md): metres; x right, y up, +z from the window into
 * the room. Origin on the glass plane of the LEFT French pair, at the top surface of
 * the sill, centred on the pair's meeting stiles. Outside is -z (north).
 * Lengths come from params.dims.W (pane width) plus params.dims.gap and
 * params.dims.sillDepth; nothing else is absolute except object sizes (the BenQ
 * MA270UP's active area, the lamp dome, the car).
 *
 * @typedef {Object} RoomAnchors
 * @property {THREE.Object3D} lampHead    world position = the bulb; its local -z axis
 *                                        is the beam direction (lights.js aims the
 *                                        SpotLight down it)
 * @property {THREE.Mesh} monitorScreen   the screen's active area, UVs 0..1 across it
 *                                        with v up, facing the chair (+z of the mesh).
 *                                        The ENGINE replaces its material.
 * @property {THREE.Mesh[]} glassPanes    every pane of glass (merged per leaf)
 * @property {{center: THREE.Vector3, normal: THREE.Vector3, width: number, height: number}} opening
 *                                        the whole window opening; normal points INTO
 *                                        the room (+z); metres
 * @property {THREE.Object3D} handleLeaf  pivot of R1, the ajar handle leaf (hinge axis)
 * @property {THREE.Object3D} beadChain   the blind's bead chain (pivot at its top)
 * Extras:
 * @property {THREE.Object3D} rightSection the angled right section; its local frame
 *                                        has the glass plane at z = 0, x along it
 * @property {{x0:number,x1:number,y0:number,y1:number}} r2Pane R2's glass in
 *                                        rightSection's local frame (m)
 * @property {THREE.Mesh} blockedPlane    the dark plane behind R2 (hidden in Dreamlike)
 *
 * @typedef {Object} FrameState  (passed to update() every frame)
 * @property {number} time   ambient seconds (frozen in capture mode)
 * @property {number} dt     seconds since the last frame
 * @property {number} p      main runway progress 0..1
 * @property {number} p2     bookend progress 0..1
 * @property {string} look   dreamlike | heightened | photo
 * @property {Object} weather SceneWeather (weatherBridge.js)
 * @property {{vecX:number, vecZ:number, speed:number, gust:number, gustEnvelope:number}} wind
 *                           vecX/vecZ: unit vector the wind blows TOWARD (world);
 *                           speed and gust in km/h; gustEnvelope = the shared gust
 *                           pulse (skyPlate.windPulse), about 1 +/- gustAmp
 *
 * ctx (from the engine): { renderer, random (seeded 0..1), chair: { position,
 * forward }, uniforms: { skyAvg, sunColor } (TSL uniform nodes) }
 *
 * @param {Object} P    the live params (params.js); reads params.room and params.dims
 * @param {Object} ctx
 * @returns {{ group: THREE.Group, anchors: RoomAnchors, update(state: FrameState): void,
 *             setLook(look: string): void, dispose(): void }}
 */

import * as THREE from "three/webgpu";
// scratch for the toy hover test (no per-frame allocation)
const _ray = new THREE.Raycaster(), _ndc = new THREE.Vector2(), _box = new THREE.Box3();
import { createRoomMaterials } from "./materials.js";
import { buildWindow } from "./room/window.js";
import { buildInterior } from "./room/interior.js";
import { buildLamp } from "./room/lamp.js";

const D2R = Math.PI / 180;

export function buildRoom(P, ctx) {
  const group = new THREE.Group();
  group.name = "room";
  const mats = createRoomMaterials(P, ctx);
  let look = ctx.look || "dreamlike";

  const win = buildWindow(P, ctx, mats, group);
  const inside = buildInterior(P, ctx, mats, group, win);
  const lamp = buildLamp(P, ctx, mats, group, look);

  // --- motes (Dreamlike): glowing specks drifting in the lamp beam ---------------------
  const rnd = ctx.random || Math.random;
  const nMotes = P.room.motes.count;
  const moteMat = new THREE.MeshBasicNodeMaterial({ color: 0x000000 });
  const motes = new THREE.InstancedMesh(new THREE.IcosahedronGeometry(0.0012, 0), moteMat, nMotes);
  motes.name = "motes";
  motes.frustumCulled = false;
  motes.castShadow = false;
  motes.receiveShadow = false;
  const moteSeeds = [];
  for (let i = 0; i < nMotes; i++) {
    const d = 0.03 + 0.27 * Math.sqrt(rnd());
    moteSeeds.push({ d, a: rnd() * Math.PI * 2, r: Math.tan(0.55) * d * Math.sqrt(rnd()), ph: rnd() * 6.28, sp: 0.4 + rnd() * 0.8, b: 0.4 + rnd() * 0.6 });
  }
  group.add(motes);
  const moteGlow = new THREE.Color();
  const lampCol = new THREE.Color();
  const tmpM = new THREE.Matrix4();
  const qx = new THREE.Vector3(), qy = new THREE.Vector3(), beam = new THREE.Vector3(), pos = new THREE.Vector3();

  function applyLook(lk) {
    look = lk || look;
    // Dreamlike opens the blocked far-right column (locked brief); the far plane goes
    win.blocked.visible = win.blocked.userData.enabled && look !== "dreamlike" && !P.outside?.blocked?.open;
    // R2 is frosted while the dark plane stands behind it (materials.js setFrost)
    mats.setFrost(win.blocked.visible);
    mats.apply(P);
    lamp.setLook(look);
    motes.visible = !!P.room.motes.enabled;
  }
  applyLook(look);

  let lastKey = "";
  function update(state) {
    const tS = state.time;
    if (state.look && state.look !== look) applyLook(state.look);
    // anything the materials read from params (the paint, the glass and its per-leaf
    // dust, the lamp's colour) re-applies them when a look, the GUI or setParams moves it
    const G = P.room.window.glass, Pp = P.room.paint, Ir = P.room.iron, Lp = P.room.lamp;
    const key = [G.dust, G.haze, G.speck, G.grainFrom, G.grainTo, G.frost?.R2, G.panes?.L, G.panes?.R1, G.panes?.R2, G.veil?.L, G.veil?.R1, G.veil?.R2, P.room.window.rebateSky, P.lights.lamp.bulb, P.lights.lamp.color, Pp.brush, Pp.chips, Pp.dust, Pp.roughness, Pp.baseSpec, Pp.coat, Pp.coatRoughness, Pp.coatBrush, Pp.albedo?.join(","), Ir.dust, Ir.roughness, Ir.baseSpec, Ir.coat, Ir.coatRoughness, Lp.roughness, Lp.coat, Lp.coatRoughness, Lp.dust, Lp.scuff, P.outside?.blocked?.open].join("|");
    if (key !== lastKey) {
      lastKey = key;
      applyLook(look);
    }
    mats.update(state);
    // the code editor's cursor on the portrait monitor blinks (about 1 Hz)
    if (inside.portraitCursor) inside.portraitCursor.visible = Math.floor((state.time || 0) * 1.9) % 2 === 0;

    const w = state.wind || { speed: 8, gustEnvelope: 1, vecX: 0, vecZ: -1 };
    const wk = Math.min(1, (w.speed || 0) / 20);
    const gustN = ((w.gustEnvelope || 1) - 1) / 0.5;
    // R1 rocks a degree or two in real gusts about its ajar angle (outward = -y rotation)
    const Rp = P.room.window.right;
    const rock = Rp.rockDeg * wk * (0.6 * gustN + 0.4 * Math.sin(tS * 1.3 + 0.7));
    win.handleLeaf.rotation.y = -Math.max(0, Rp.ajarDeg + rock) * D2R;
    // the bead chain: a rope simulated bead by bead (room/beadChain.js). The draught
    // through the ajar leaf sways it; the cursor sweeps it (Agam, 2026-09-27: "hover
    // physics... wave it around like a real beaded rope")
    const draught = wk * (0.35 + 0.65 * Math.max(0, gustN)) * Math.min(1, (Rp.ajarDeg + 1) / 4);
    state.chainHover = inside.chain.update(state, { draught, sign: w.vecX >= 0 ? 1 : -1 });
    // the cursor over the bike or the car on the monitor (Agam, 2026-10-05: "change
    // the cursor when I hover over the bike, car or the beaded rope"): a ray from the
    // cursor against each toy's world box, slightly padded so a 7 cm model is not a
    // pixel hunt. It rides the chain's flag, so all three show the same grab hand
    if (!state.chainHover && state.pointer?.active && state.camera && state.view?.w) {
      _ndc.set((state.pointer.x / state.view.w) * 2 - 1, -(state.pointer.y / state.view.h) * 2 + 1);
      _ray.setFromCamera(_ndc, state.camera);
      for (const toy of [inside.car, inside.bike]) {
        if (!toy) continue;
        _box.setFromObject(toy).expandByScalar(0.006);
        if (_ray.ray.intersectsBox(_box)) { state.chainHover = true; break; }
      }
    }

    motes.visible = !!P.room.motes.enabled;
    if (motes.visible) {
      const sunAlt = state.weather?.sun?.alt ?? 10;
      const night = Math.max(0, Math.min(1, (6 - sunAlt) / 12));
      lampCol.set(P.lights.lamp.color);
      moteGlow.copy(lampCol).multiplyScalar(P.room.motes.glow * (0.25 + 0.75 * night));
      moteMat.color.copy(moteGlow);
      const q = lamp.lampHead.quaternion;
      qx.set(1, 0, 0).applyQuaternion(q);
      qy.set(0, 1, 0).applyQuaternion(q);
      beam.set(0, 0, -1).applyQuaternion(q);
      for (let i = 0; i < nMotes; i++) {
        const s = moteSeeds[i];
        const a = s.a + tS * 0.05 * s.sp;
        const drift = 0.01 * Math.sin(tS * 0.3 * s.sp + s.ph);
        pos.copy(lamp.pos)
          .addScaledVector(beam, s.d + drift)
          .addScaledVector(qx, Math.cos(a) * s.r)
          .addScaledVector(qy, Math.sin(a) * s.r + 0.006 * Math.sin(tS * 0.21 * s.sp + s.ph));
        pos.x += 0.004 * (w.vecX || 0) * (w.gustEnvelope || 1) * Math.sin(tS * 0.4 + s.ph);
        tmpM.makeScale(s.b, s.b, s.b).setPosition(pos);
        motes.setMatrixAt(i, tmpM);
      }
      motes.instanceMatrix.needsUpdate = true;
    }
  }

  group.updateMatrixWorld(true);

  return {
    group,
    anchors: {
      lampHead: lamp.lampHead,
      monitorScreen: inside.monitorScreen,
      glassPanes: win.glassPanes,
      opening: win.opening,
      handleLeaf: win.handleLeaf,
      beadChain: inside.beadChain,
      rightSection: win.right,
      r2Pane: win.r2Pane,
      blockedPlane: win.blocked,
    },
    update,
    setLook(lk) {
      applyLook(lk);
    },
    dispose() {
      lamp.dispose();
      group.traverse((o) => {
        if (o.geometry) o.geometry.dispose();
      });
      moteMat.dispose();
      mats.dispose();
      group.removeFromParent();
    },
  };
}
