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
const _inv = new THREE.Matrix4(), _o = new THREE.Vector3(), _d = new THREE.Vector3();
// the drag: which toy, and where on it the cursor took hold (x in the monitor's frame)
let drag = null, wasDown = false;
// the monitor's top edge half-length (screen 0.597 + 2 x 7.5 mm bezel), a toy's
// half-length (7 cm models) and the closest two toys may sit, centre to centre (m)
const MON_HALF = 0.597 / 2 + 0.0075, TOY_HALF = 0.036, TOY_GAP = 0.074;
// the pick-up (Agam, 2026-10-05: "when you click on the bike and car, it should
// be a pick up animation"): a held toy rises LIFT metres on a spring, leans into
// the way it is moving, and on release drops back with a small settle bounce.
// Each toy keeps its own spring (lift, its speed, the lean) in userData.pick
const LIFT = 0.018, K = 340, C = 15; // stiffness and damping: a little overshoot
const LEAN = 0.35, LEAN_MAX = 0.22; // rad of lean per m/s of slide, and its cap
const reduceMotion = typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
// SEAMLESS between the monitors (Agam, 2026-10-05: "seamless transition between the
// 2 monitors"): a drag only sets where the toy is GOING (u.tx, u.tz on its edge);
// the toy itself glides there. A hop to the other monitor keeps its world pose
// (attach, see placeOn), so nothing jumps: it eases across from where it was, rises
// in a small arc while it travels (ARC per metre still to go, capped), and turns
// into its yaw on the new edge
const GLIDE = 22; // 1/s: how fast x, z and any height offset close in
const ARC = 0.35, ARC_MAX = 0.05; // m of extra lift per m still to travel, and its cap
const ease = (dt, rate) => 1 - Math.exp(-dt * rate);
function arcFor(u, toy) {
  const d = Math.hypot((u.tx ?? toy.position.x) - toy.position.x, (u.tz ?? toy.position.z) - toy.position.z);
  return Math.min(ARC_MAX, d * ARC);
}
function pickStep(toy, held, dt, vx) {
  const u = toy.userData;
  if (u.baseY === undefined) u.baseY = toy.position.y;
  if (u.yaw0 === undefined) u.yaw0 = toy.rotation.y; // its yaw on any edge
  if (u.tx === undefined) { u.tx = toy.position.x; u.tz = toy.position.z; }
  u.yOff ??= 0;
  const pk = (u.pick ??= { y: 0, v: 0, lean: 0 });
  const target = held ? LIFT : 0;
  if (reduceMotion) {
    pk.y = target;
    pk.v = 0;
    pk.lean = 0;
    toy.position.x = u.tx;
    toy.position.z = u.tz;
    u.yOff = 0;
    toy.rotation.set(0, u.yaw0, 0);
  } else if (dt > 0) {
    // semi-implicit spring, sub-stepped so a slow frame cannot blow it up
    const n = Math.ceil(dt / 0.008), h = dt / n;
    for (let i = 0; i < n; i++) {
      pk.v += (K * (target - pk.y) - C * pk.v) * h;
      pk.y += pk.v * h;
    }
    if (!held && pk.y < 0) { pk.y = 0; pk.v = -pk.v * 0.35; } // it lands on the edge, not through it
    const leanTo = held ? Math.max(-LEAN_MAX, Math.min(LEAN_MAX, -vx * LEAN)) : 0;
    pk.lean += (leanTo - pk.lean) * Math.min(1, dt * 12);
    // the glide toward where the drag says it should be
    const g = ease(dt, GLIDE);
    toy.position.x += (u.tx - toy.position.x) * g;
    toy.position.z += (u.tz - toy.position.z) * g;
    u.yOff *= 1 - g;
    // turn into the edge's yaw, and shed any tip the hop carried over
    toy.rotation.y += (u.yaw0 - toy.rotation.y) * ease(dt, 12);
    toy.rotation.x *= 1 - ease(dt, 12);
  }
  toy.position.y = u.baseY + pk.y + u.yOff + (reduceMotion ? 0 : arcFor(u, toy));
  toy.rotation.z = pk.lean;
}
// the two top edges a toy can stand on, each in its own monitor's frame: y of the
// top, z of the edge's centre line, and the half-length a toy's centre may use.
// The BenQ: 0.336 m panel + 7.5 mm bezel; the portrait: a 0.495 m tall, 0.285 m
// wide panel whose 32 mm housing runs from z 0 back to -0.032 (params.room.portrait)
function edges(inside) {
  const out = [];
  if (inside.monitor) out.push({ mon: inside.monitor, y: 0.336 / 2 + 0.0075, z: -0.013, half: MON_HALF - TOY_HALF });
  if (inside.portrait) out.push({ mon: inside.portrait, y: 0.495, z: -0.016, half: 0.285 / 2 - TOY_HALF });
  return out;
}
// where the cursor's ray meets an edge's top plane, in that monitor's frame
// ({ x, z }, or null when the ray runs parallel or points away)
function edgeHit(e) {
  e.mon.updateMatrixWorld();
  _inv.copy(e.mon.matrixWorld).invert();
  _o.copy(_ray.ray.origin).applyMatrix4(_inv);
  _d.copy(_ray.ray.direction).transformDirection(_inv);
  if (Math.abs(_d.y) < 1e-6) return null;
  const t = (e.y - _o.y) / _d.y;
  return t > 0 ? { x: _o.x + _d.x * t, z: _o.z + _d.z * t } : null;
}
// the edge under the cursor: the one whose hit lands nearest its own centre line
// (a little past either end still counts, so a toy can be dragged right to the end)
function edgeUnder(inside) {
  let best = null, bestD = Infinity;
  for (const e of edges(inside)) {
    const h = edgeHit(e);
    if (!h) continue;
    const over = Math.max(0, Math.abs(h.x) - (e.half + TOY_HALF + 0.05));
    const d = Math.abs(h.z - e.z) + over * 4;
    if (d < bestD && Math.abs(h.z - e.z) < 0.25) { bestD = d; best = { e, h }; }
  }
  return best;
}
// put a toy on an edge at x (its own frame), keeping its yaw on the edge and any
// pick-up lift it is carrying
function placeOn(toy, e, x) {
  const u = toy.userData;
  if (toy.parent !== e.mon) {
    // reparent KEEPING its world pose: the glide (pickStep) then carries it across,
    // so the handover between the monitors has no jump in place, height or angle
    e.mon.attach(toy);
    u.baseY = e.y;
    u.tz = e.z;
    u.tx = x;
    // whatever height it is at now becomes an offset that the glide eases away
    u.yOff = toy.position.y - (u.baseY + (u.pick?.y ?? 0) + arcFor(u, toy));
    // attach folded the lean into the new frame; keep the euler's z for the lean
    u.pick && (u.pick.lean = toy.rotation.z);
    u.lastX = undefined; // no lean spike from the change of frame
    return;
  }
  u.tx = x;
}
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
    // pixel hunt. It rides the chain's flag, so all three show the same grab hand.
    // "make the bike movable", "make the car also movable": press on one and it slides
    // along the monitor's top edge under the cursor, clamped to the edge and stopped
    // by the other toy, like pushing a die-cast model along a shelf
    let overToy = null;
    const ptr = state.pointer;
    if (ptr?.active && state.camera && state.view?.w) {
      _ndc.set((ptr.x / state.view.w) * 2 - 1, -(ptr.y / state.view.h) * 2 + 1);
      _ray.setFromCamera(_ndc, state.camera);
      if (!state.chainHover) {
        for (const toy of [inside.car, inside.bike, lamp.shade]) {
          if (!toy) continue;
          _box.setFromObject(toy).expandByScalar(0.006);
          if (_ray.ray.intersectsBox(_box)) { overToy = toy; break; }
        }
      }
    }
    if (!ptr?.down || !ptr?.active) drag = null;
    else if (!drag && overToy && !wasDown) {
      if (overToy === lamp.shade) {
        // the lamp re-aims from where it points now, by how far the cursor moves
        drag = { toy: overToy, lamp: true, x0: ptr.x, y0: ptr.y, ...lamp.getAim() };
      } else {
        const own = edges(inside).find((e) => e.mon === overToy.parent);
        const h = own && edgeHit(own);
        if (h) drag = { toy: overToy, off: overToy.position.x - h.x };
      }
    }
    wasDown = !!ptr?.down;
    if (drag?.lamp) {
      // sideways swings the head around (0.5 deg a px), up and down tips it
      // (0.15 deg a px, dragging down tips the beam further from the chair)
      lamp.aim(drag.dir + (ptr.x - drag.x0) * 0.5, drag.tilt + (ptr.y - drag.y0) * 0.15);
    } else if (drag) {
      // "I should also have the option to move to the other monitor": the toy goes
      // to whichever top edge is under the cursor, and slides along it there
      const u = edgeUnder(inside);
      if (u) {
        const { e, h } = u;
        const same = e.mon === drag.toy.parent;
        let nx = Math.max(-e.half, Math.min(e.half, h.x + (same ? drag.off : 0)));
        if (!same) drag.off = 0; // the grab point resets on the new edge
        // stop against the other toy on the same edge instead of passing through it
        const other = drag.toy === inside.car ? inside.bike : inside.car;
        if (other && other.parent === e.mon) {
          const ox = other.position.x;
          const left = same ? drag.toy.position.x <= ox : nx <= ox;
          nx = left ? Math.min(nx, ox - TOY_GAP) : Math.max(nx, ox + TOY_GAP);
          // the portrait is narrow: if the gap pushes it off the end, it stays put
          if (Math.abs(nx) > e.half) nx = same ? drag.toy.position.x : null;
        }
        if (nx !== null) placeOn(drag.toy, e, nx);
      }
    }
    // the pick-up spring for both toys (the lamp only re-aims): the slide speed
    // in the monitor's frame tips the held one into its motion
    {
      const dt = Math.min(0.05, Math.max(0, state.dt || 0));
      for (const toy of [inside.car, inside.bike]) {
        if (!toy) continue;
        const u = toy.userData;
        const vx = dt > 0 && u.lastX !== undefined ? (toy.position.x - u.lastX) / dt : 0;
        u.lastX = toy.position.x;
        pickStep(toy, drag?.toy === toy, dt, vx);
      }
    }
    state.toyDrag = !!drag;
    if (overToy || drag) state.chainHover = true;

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
