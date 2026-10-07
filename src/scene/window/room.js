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
// the blind's drop (0 raised, 1 lowered), where the chain is taking it, and the chain's
// give under the hand (m) from its resting height
const blind = { drop: 0, target: 0, give: 0, chainY0: 0 };
// the monitor's top edge half-length (screen 0.597 + 2 x 7.5 mm bezel), a toy's
// half-length (7 cm models) and the closest two toys may sit, centre to centre (m)
const MON_HALF = 0.597 / 2 + 0.0075, TOY_HALF = 0.036, TOY_GAP = 0.074;
// the pick-up (Agam, 2026-10-05: "when you click on the bike and car, it should
// be a pick up animation"): a held toy rises LIFT metres on a spring, leans into
// the way it is moving, and on release drops back with a small settle bounce.
// Each toy keeps its own spring (lift, its speed, the lean) in userData.pick
const LIFT = 0.018, K = 340, C = 15; // stiffness and damping: a little overshoot (the landing)
// 2026-10-05 ("make the grab natural, not at a fixed height from the monitor"):
// while held, the toy's height follows the cursor one to one from where it was
// grabbed (MIN_LIFT keeps it just off the surface, MAX_LIFT is the reach), and the
// spring is critically damped, so it trails the hand a touch instead of bobbing
const MIN_LIFT = 0.005, MAX_LIFT = 0.16, C_HELD = 2 * Math.sqrt(340);
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
  // held: the pick-up lift plus however high the cursor has carried it (a drag
  // upward lifts it clear of the other toy, 2026-10-05); released: back to the edge
  const target = held ? (u.liftTarget ?? MIN_LIFT) : 0;
  if (reduceMotion) {
    pk.y = target;
    pk.v = 0;
    pk.lean = 0;
    toy.position.x = u.tx;
    toy.position.z = u.tz;
    u.yOff = 0;
    toy.rotation.set(0, u.yaw0 + (u.flipped ? Math.PI : 0), 0);
  } else if (dt > 0) {
    // semi-implicit spring, sub-stepped so a slow frame cannot blow it up
    const n = Math.ceil(dt / 0.008), h = dt / n;
    for (let i = 0; i < n; i++) {
      pk.v += (K * (target - pk.y) - (held ? C_HELD : C) * pk.v) * h;
      pk.y += pk.v * h;
    }
    if (!held && pk.y < 0) { pk.y = 0; pk.v = -pk.v * 0.35; } // it lands on the edge, not through it
    const leanTo = held ? Math.max(-LEAN_MAX, Math.min(LEAN_MAX, -vx * LEAN)) : 0;
    pk.lean += (leanTo - pk.lean) * Math.min(1, dt * 12);
    // the glide toward where the drag says it should be
    // on its own edge the toy sticks to the cursor; only a hop between the
    // monitors glides, until it has arrived
    const g = u.hopping ? ease(dt, GLIDE) : 1;
    toy.position.x += (u.tx - toy.position.x) * g;
    toy.position.z += (u.tz - toy.position.z) * g;
    u.yOff *= u.hopping ? 1 - g : 0;
    if (u.hopping && Math.abs(u.tx - toy.position.x) < 0.002 && Math.abs(u.tz - toy.position.z) < 0.002 && Math.abs(u.yOff) < 0.002) u.hopping = false;
    // turn into the edge's yaw, and shed any tip the hop carried over
    // its yaw on this edge: half a turn more on the left monitor; it turns the
    // short way round, eased, so a carry across spins it smoothly
    const yawTo = u.yaw0 + (u.flipped ? Math.PI : 0);
    let dy = (yawTo - toy.rotation.y) % (Math.PI * 2);
    if (dy > Math.PI) dy -= Math.PI * 2;
    if (dy < -Math.PI) dy += Math.PI * 2;
    toy.rotation.y += dy * ease(dt, 9);
    toy.rotation.x *= 1 - ease(dt, 12);
  }
  toy.position.y = u.baseY + pk.y + u.yOff + (reduceMotion || !u.hopping ? 0 : arcFor(u, toy));
  toy.rotation.z = pk.lean;
}
// the two top edges a toy can stand on, each in its own monitor's frame: y of the
// top, z of the edge's centre line, and the half-length a toy's centre may use.
// The BenQ: 0.336 m panel + 7.5 mm bezel; the portrait: a 0.495 m tall, 0.285 m
// wide panel whose 32 mm housing runs from z 0 back to -0.032 (params.room.portrait)
function edges(inside) {
  const out = [];
  if (inside.monitor) out.push({ mon: inside.monitor, y: 0.336 / 2 + 0.0075, z: -0.013, half: MON_HALF });
  // flip (Agam, 2026-10-05: "anything that goes to the left monitor should be flipped"):
  // a toy on the portrait (the left monitor) turns round half a turn
  if (inside.portrait) out.push({ mon: inside.portrait, y: 0.495, z: -0.016, half: 0.285 / 2, flip: true });
  return out;
}
// a toy's half-length along x in its own frame (m), measured once from its meshes,
// so a 6 cm scooter and an 18 cm headset each stop where their own ends meet
const _tb = new THREE.Box3(), _tm = new THREE.Matrix4();
function halfOf(toy) {
  const u = toy.userData;
  if (u.half !== undefined) return u.half;
  toy.updateMatrixWorld(true);
  const inv = new THREE.Matrix4().copy(toy.matrixWorld).invert();
  const box = new THREE.Box3();
  toy.traverse((o) => {
    if (!o.isMesh || !o.geometry) return;
    if (!o.geometry.boundingBox) o.geometry.computeBoundingBox();
    _tb.copy(o.geometry.boundingBox).applyMatrix4(_tm.multiplyMatrices(inv, o.matrixWorld));
    box.union(_tb);
  });
  u.half = box.isEmpty() ? TOY_HALF : Math.max(Math.abs(box.min.x), Math.abs(box.max.x));
  u.tall = box.isEmpty() ? 0.03 : box.max.y - box.min.y;
  return u.half;
}
// where the cursor's ray meets an edge's VERTICAL plane (z = the edge's centre line,
// in that monitor's frame), as { x, y }. 2026-10-05 ("draggability of the objects
// is not perfect"): the first version used the edge's horizontal top plane, which
// the camera sees almost edge-on, so a small cursor move threw the toy a long way
// and the hit went wild as the ray ran parallel to it. The monitor's face plane
// faces the camera, so x follows the cursor one to one
function edgeHit(e) {
  e.mon.updateMatrixWorld();
  _inv.copy(e.mon.matrixWorld).invert();
  _o.copy(_ray.ray.origin).applyMatrix4(_inv);
  _d.copy(_ray.ray.direction).transformDirection(_inv);
  if (Math.abs(_d.z) < 1e-6) return null;
  const t = (e.z - _o.z) / _d.z;
  return t > 0 ? { x: _o.x + _d.x * t, y: _o.y + _d.y * t } : null;
}
// the edge under the cursor: the one whose hit lands nearest its own centre line
// (a little past either end still counts, so a toy can be dragged right to the end)
function edgeUnder(inside) {
  let best = null, bestD = Infinity;
  for (const e of edges(inside)) {
    const h = edgeHit(e);
    if (!h) continue;
    // a held toy rides above the edge, so the cursor counts from a little below
    // the top to well above it; past either end counts too, up to a toy's length
    const dy = h.y - e.y;
    if (dy < -0.12 || dy > 0.2) continue;
    const over = Math.max(0, Math.abs(h.x) - (e.half + 0.05));
    if (over > 0.12) continue;
    const d = Math.abs(dy - 0.02) + over * 2;
    if (d < bestD) { bestD = d; best = { e, h }; }
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
    u.hopping = true;
    u.flipped = !!e.flip;
    u.baseY = e.y;
    u.tz = e.z;
    u.tx = x;
    // whatever height it is at now becomes an offset that the glide eases away
    u.yOff = toy.position.y - (u.baseY + (u.pick?.y ?? 0) + arcFor(u, toy));
    // attach folded the lean into the new frame; keep the euler's z for the lean
    u.pick && (u.pick.lean = toy.rotation.z);
    // no lean or bobble spike from the change of frame
    u.lastX = u.lastY = u.lastVx = u.lastVy = undefined;
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
  // a fresh room starts with the blind raised and the chain at rest
  // its starting drop is params.room.blind.defaultDrop (0 raised .. 1 lowered)
  {
    const d0 = Math.max(0, Math.min(1, P.room.blind?.defaultDrop ?? 0));
    Object.assign(blind, { drop: d0, target: d0, give: 0, chainY0: inside.beadChain?.position.y ?? 0 });
    if (d0 > 0) inside.setBlindDrop?.(d0);
  }
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
    const onChain = !!state.chainHover; // the cursor is on the bead chain itself
    const toys = inside.toys || [];
    if (ptr?.active && state.camera && state.view?.w) {
      _ndc.set((ptr.x / state.view.w) * 2 - 1, -(ptr.y / state.view.h) * 2 + 1);
      _ray.setFromCamera(_ndc, state.camera);
      if (!state.chainHover) {
        // the nearest thing under the cursor wins (a toy in front of the lamp, say)
        let bestT = Infinity;
        for (const toy of [...toys, lamp.shade]) {
          if (!toy) continue;
          _box.setFromObject(toy).expandByScalar(0.006);
          const hit = _ray.ray.intersectBox(_box, _o);
          if (hit) {
            const t = hit.distanceTo(_ray.ray.origin);
            if (t < bestT) { bestT = t; overToy = toy; }
          }
        }
      }
    }
    // the gap two toys keep between their ends, and whether two overlap along an edge
    const GAP = 0.003;
    const minSep = (a, b) => halfOf(a) + halfOf(b) + GAP;
    if (!ptr?.down || !ptr?.active) {
      // let go: a toy dropped onto another slides off to the nearest free spot on
      // that edge (where it fits between the others), gliding there
      if (drag && !drag.lamp && !drag.blind) {
        const t = drag.toy, tu = t.userData;
        tu.liftTarget = 0;
        const e = edges(inside).find((ed) => ed.mon === t.parent);
        if (e) {
          const others = toys.filter((o) => o !== t && o.parent === t.parent);
          const lim = e.half - halfOf(t);
          const free = (x) => Math.abs(x) <= lim + 1e-6 && others.every((o) => Math.abs(x - o.position.x) >= minSep(t, o) - 1e-6);
          if (!free(tu.tx)) {
            const cands = [Math.max(-lim, Math.min(lim, tu.tx))];
            for (const o of others) cands.push(o.position.x - minSep(t, o), o.position.x + minSep(t, o));
            const ok = cands.filter(free).sort((p, q) => Math.abs(p - tu.tx) - Math.abs(q - tu.tx));
            if (ok.length) { tu.tx = ok[0]; tu.hopping = true; }
          }
        }
      }
      drag = null;
    } else if (!drag && onChain && !wasDown && inside.setBlindDrop) {
      // a press on the bead chain works the blind (2026-10-05): pull down to lower
      // it, push up to raise it, from wherever it is now
      drag = { blind: true, y0: ptr.y, d0: blind.target };
    } else if (!drag && overToy && !wasDown) {
      if (overToy === lamp.shade) {
        // the lamp re-aims from where it points now, by how far the cursor moves
        drag = { toy: overToy, lamp: true, x0: ptr.x, y0: ptr.y, ...lamp.getAim() };
      } else {
        const own = edges(inside).find((e) => e.mon === overToy.parent);
        const h = own && edgeHit(own);
        // grabAbove: the grab point's height over the edge's top, minus the toy's
        // own lift then, so the cursor's height carries the toy from exactly there
        if (h) drag = { toy: overToy, off: overToy.position.x - h.x, grabAbove: h.y - own.y - (overToy.userData.pick?.y ?? 0) };
        if (drag) drag.toy.userData.liftTarget = Math.max(MIN_LIFT, overToy.userData.pick?.y ?? 0); // it leaves the surface the moment it is pressed
      }
    }
    wasDown = !!ptr?.down;
    if (drag?.blind) {
      // the whole drop is about 55% of the view's height of pull; the chain itself
      // gives a couple of centimetres under the hand and springs back on release
      const pull = ptr.y - drag.y0;
      blind.target = Math.max(0, Math.min(1, drag.d0 + pull / Math.max(200, state.view.h * 0.55)));
      blind.give = Math.max(-0.03, Math.min(0.03, pull * 0.00012));
    } else if (drag?.lamp) {
      // sideways swings the head around (0.5 deg a px), up and down tips it
      // (0.15 deg a px, dragging down tips the beam further from the chair)
      lamp.aim(drag.dir + (ptr.x - drag.x0) * 0.5, drag.tilt + (ptr.y - drag.y0) * 0.15);
    } else if (drag) {
      // the toy goes to whichever top edge is under the cursor and slides along it
      // ("move to the other monitor"); the cursor's height lifts it one to one from
      // the grab point ("natural, not at a fixed height"); high enough, it passes
      // over the others ("drag objects across each other by moving up"); low, they
      // stop it, each by its own length
      const un = edgeUnder(inside);
      if (un) {
        const { e, h } = un;
        const t = drag.toy, tu = t.userData;
        const same = e.mon === t.parent;
        const lim = e.half - halfOf(t);
        let nx = Math.max(-lim, Math.min(lim, h.x + (same ? drag.off : 0)));
        if (!same) drag.off = 0; // the grab point resets on the new edge
        tu.liftTarget = Math.max(MIN_LIFT, Math.min(MAX_LIFT, h.y - e.y - (drag.grabAbove ?? 0)));
        const lifted = (tu.pick?.y ?? 0) + (tu.yOff ?? 0);
        let blocked = false;
        for (const o of toys) {
          if (o === t || o.parent !== e.mon) continue;
          halfOf(o);
          const tall = o.userData.tall;
          const sep = minSep(t, o);
          // already over it: it cannot be pushed down into it, so it hovers just
          // above until the cursor carries it past
          if (same && Math.abs(t.position.x - o.position.x) < sep && (tu.pick?.y ?? 0) > tall * 0.5) {
            tu.liftTarget = Math.max(tu.liftTarget, tall + 0.006);
            continue;
          }
          if (lifted > tall + 0.004) continue; // clear of it: passes over
          const left = same ? t.position.x <= o.position.x : nx <= o.position.x;
          nx = left ? Math.min(nx, o.position.x - sep) : Math.max(nx, o.position.x + sep);
          if (Math.abs(nx) > lim) blocked = true;
        }
        // squeezed off the end by a neighbour: it stays where it is (or, arriving
        // from the other monitor, does not land here yet)
        if (blocked) nx = same ? t.position.x : null;
        if (nx !== null) placeOn(t, e, nx);
      }
    }
    // the pick-up spring for every toy (the lamp only re-aims): the slide speed in
    // the monitor's frame tips the held one into its motion, and the bobblehead's
    // head is driven by its base's acceleration
    {
      const dt = Math.min(0.05, Math.max(0, state.dt || 0));
      for (const toy of toys) {
        const u = toy.userData;
        if (u.yaw0 === undefined) {
          // a toy that starts on the left monitor is already in its flipped pose (the
          // headset was turned round there on request): its main-monitor yaw is the
          // other way round
          u.flipped = toy.parent === inside.portrait;
          u.yaw0 = toy.rotation.y - (u.flipped ? Math.PI : 0);
        }
        const vx = dt > 0 && u.lastX !== undefined ? (toy.position.x - u.lastX) / dt : 0;
        const vy = dt > 0 && u.lastY !== undefined ? (toy.position.y - u.lastY) / dt : 0;
        pickStep(toy, drag?.toy === toy, dt, vx);
        if (u.bobble) {
          if (dt > 0 && u.lastVx !== undefined) u.bobble.jiggle((vx - u.lastVx) / dt, (vy - u.lastVy) / dt, dt);
          u.bobble.update(dt);
          u.lastVx = vx;
          u.lastVy = vy;
        }
        u.lastX = toy.position.x;
        u.lastY = toy.position.y;
      }
    }
    // dev only: window.__toyPositions() returns every toy's spot in the params.room
    // format, so an arrangement made by hand can be pasted in as the default
    // dev only: window.__setBlind(d) sets the blind's drop (0 raised to 1 lowered) at once
    if (import.meta.env?.DEV && typeof window !== "undefined") {
      window.__setBlind = (d) => {
        blind.drop = blind.target = Math.max(0, Math.min(1, d));
        inside.setBlindDrop?.(blind.drop);
        return blind.drop;
      };
      // ...and window.__blindDrop() reads it, to paste in as params.room.blind.defaultDrop
      window.__blindDrop = () => +blind.drop.toFixed(3);
    }
    if (import.meta.env?.DEV && typeof window !== "undefined" && !window.__toyPositions) {
      window.__toyPositions = () => {
        const out = {};
        for (const t of inside.toys || []) {
          const on = t.parent === inside.portrait ? "portrait" : t.parent === inside.monitor ? "monitor" : "other";
          const deg = ((((t.rotation.y * 180) / Math.PI) % 360) + 540) % 360 - 180;
          out[t.name] = { on, mx: +t.position.x.toFixed(4), mz: +t.position.z.toFixed(4), myawDeg: +deg.toFixed(1) };
        }
        console.table(out);
        return out;
      };
    }
    // the blind follows the chain with a little weight, and the chain's give eases out
    {
      const dt = Math.min(0.05, Math.max(0, state.dt || 0));
      if (!drag?.blind) blind.give *= 1 - ease(dt, 10);
      if (inside.setBlindDrop && Math.abs(blind.target - blind.drop) > 1e-4) {
        blind.drop += (blind.target - blind.drop) * (reduceMotion ? 1 : ease(dt, 7));
        inside.setBlindDrop(blind.drop);
      }
      if (inside.beadChain) inside.beadChain.position.y = blind.chainY0 - blind.give;
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
