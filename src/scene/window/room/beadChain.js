// The Roman blind's bead chain as a hanging rope that bends at every bead.
//
// A closed loop of two ivory strands hangs from the pulley at the blind's left end.
// The physics runs on the loop's centre line: a chain of point masses (one per
// `beadsPerNode` beads, the top one pinned at the pulley) held at fixed spacing, under
// gravity, air drag, the draught through the ajar leaf and the cursor. Every bead is
// then laid on a smooth curve through those points, and the two strands and the U at
// the bottom are placed around it, so the loop swings as one piece and curves through
// every bead, never at a joint. Until 2026-09-27 it was 8 rigid links on hinges,
// which folded at a few joints and barely answered the cursor (Agam: "it is only
// bending in two places, ideally it should bend at every bead, just like the real
// object").
//
// Solver: position-based dynamics in small steps (Macklin et al. 2019, "Small Steps
// in Physics Simulation"): many substeps, one pass over the links each, alternating
// direction. It keeps the pendulum's energy, so a flick swings for seconds and dies
// out through `drag`. (A follow-the-leader solver was tried first: exact lengths, but
// it ate the swing in about a second whatever the drag.) Why not a node per bead: with
// 133 links this solver lets the top stretch up to 2 mm per 4 mm link; with one node
// per 4 beads it holds to a fraction of a millimetre.
//
// Capture mode passes dt 0 and no pointer: nothing steps, and the chain hangs straight
// down, the same layout the hinged chain had at rest.

import * as THREE from "three/webgpu";

const G = 9.81;
const D2R = Math.PI / 180;

/**
 * @param {Object} P       live params (reads room.beadChain and dims.W)
 * @param {THREE.Material} mat
 * @param {THREE.Object3D} parent
 * @param {THREE.Vector3} origin  the pulley, in parent's frame (m)
 * @param {{ zMin: number }} opts zMin: the wall plane in the chain's frame (m)
 */
export function buildBeadChain(P, mat, parent, origin, opts) {
  const BC = P.room.beadChain;
  const CH0 = BC.physics || {};
  const W = P.dims.W;
  const group = new THREE.Group();
  group.name = "beadChain";
  group.position.copy(origin);
  parent.add(group);

  const len = (BC.top - BC.bottom) * W;
  const nb = Math.max(8, Math.round(len / BC.pitch)); // beads per strand
  const ns = Math.max(4, Math.round(nb / (CH0.beadsPerNode ?? 4))); // links; nodes 0..ns, node 0 pinned
  const L = len / ns;
  const N = ns + 1;
  const x = new Float32Array(N * 3); // positions (the chain's frame, m)
  const v = new Float32Array(N * 3); // velocities (m/s)
  const pr = new Float32Array(N * 3); // predicted positions
  for (let i = 0; i < N; i++) x[i * 3 + 1] = -i * L;
  const zMin = opts?.zMin ?? -Infinity;

  // half the strands' spacing: opening linearly from the pulley to the bottom (the
  // 17:41 photo: close at the top, a narrow V near the sill)
  const spread = new Float32Array(nb);
  for (let i = 0; i < nb; i++) spread[i] = Math.max(0.0015, BC.spreadTop + (BC.spreadBottom - BC.spreadTop) * (i / nb));
  // the loop's bottom (2026-09-27, Agam: "it should be at the bottom in a loop, like
  // connected together"): a U of beads joining the two strands under the last node
  const r = Math.max(0.004, BC.spreadBottom);
  const nArc = Math.max(4, Math.ceil((Math.PI * r) / BC.pitch));
  // inverse mass per node: the pulley's node is fixed; the last carries the U's beads
  // as well as its own, so the loop's end is heavy and lags a flick instead of curling
  const im = new Float32Array(N).fill(1);
  im[0] = 0;
  im[ns] = 1 / (1 + nArc / (2 * (nb / ns)));

  const beads = new THREE.InstancedMesh(new THREE.SphereGeometry(BC.bead, 6, 4), mat, 2 * nb + nArc);
  beads.name = "chainBeads";
  beads.castShadow = false;
  beads.receiveShadow = true; // the house must shade it from the sun (lights.js blocker)
  beads.frustumCulled = false;
  group.add(beads);

  // the curve through the nodes (uniform Catmull-Rom; the ends extrapolated) at node
  // parameter f in 0..ns, into pos
  const pos = new THREE.Vector3(), tan = new THREE.Vector3(), side = new THREE.Vector3();
  const c0 = [0, 0, 0];
  function sample(f) {
    const i1 = Math.min(ns - 1, Math.max(0, Math.floor(f)));
    const t = f - i1, t2 = t * t, t3 = t2 * t;
    const j1 = i1 * 3, j2 = j1 + 3;
    for (let a = 0; a < 3; a++) {
      const p1 = x[j1 + a], p2 = x[j2 + a];
      const p0 = i1 > 0 ? x[j1 - 3 + a] : 2 * p1 - p2;
      const p3 = i1 + 2 <= ns ? x[j2 + 3 + a] : 2 * p2 - p1;
      c0[a] = 0.5 * (2 * p1 + (p2 - p0) * t + (2 * p0 - 5 * p1 + 4 * p2 - p3) * t2 + (3 * p1 - p0 - 3 * p2 + p3) * t3);
    }
    pos.set(c0[0], c0[1], c0[2]);
  }
  // per node, the direction the strands open along and the loop's heading, both taken
  // over four links: the strands stay parallel copies of the centre line through a
  // tight whip instead of pinching, and the U turns with the chain's end, not its tip
  const nTan = new Float32Array(N * 3), nSide = new Float32Array(N * 3);
  function frames() {
    for (let i = 0; i < N; i++) {
      const a = Math.max(0, i - 2) * 3, b = Math.min(ns, i + 2) * 3;
      tan.set(x[b] - x[a], x[b + 1] - x[a + 1], x[b + 2] - x[a + 2]).normalize();
      side.set(1 - tan.x * tan.x, -tan.x * tan.y, -tan.x * tan.z);
      if (side.lengthSq() < 1e-8) side.set(0, 0, 1);
      else side.normalize();
      tan.toArray(nTan, i * 3);
      side.toArray(nSide, i * 3);
    }
  }
  // side (and tan) at node parameter f, blended between its two nodes
  function frameAt(f) {
    const i = Math.min(ns - 1, Math.floor(f)), u = f - i, j = i * 3;
    side.set(nSide[j] + (nSide[j + 3] - nSide[j]) * u, nSide[j + 1] + (nSide[j + 4] - nSide[j + 1]) * u, nSide[j + 2] + (nSide[j + 5] - nSide[j + 2]) * u).normalize();
    tan.set(nTan[j] + (nTan[j + 3] - nTan[j]) * u, nTan[j + 1] + (nTan[j + 4] - nTan[j + 1]) * u, nTan[j + 2] + (nTan[j + 5] - nTan[j + 2]) * u).normalize();
  }
  const mt = new THREE.Matrix4();
  function layout() {
    frames();
    for (let i = 0; i < nb; i++) {
      // up to and including the loop's start (i / nb stopped a bead short, and with the
      // arc's half-step that left a gap where each strand meets the loop, 2026-09-28)
      const f = ((i + 1) / nb) * ns;
      sample(f);
      frameAt(f);
      const o = spread[i];
      mt.makeTranslation(pos.x - o * side.x, pos.y - o * side.y, pos.z - o * side.z);
      beads.setMatrixAt(i, mt);
      mt.makeTranslation(pos.x + o * side.x, pos.y + o * side.y, pos.z + o * side.z);
      beads.setMatrixAt(nb + i, mt);
    }
    sample(ns);
    frameAt(ns);
    for (let b = 0; b < nArc; b++) {
      const th = ((b + 1) / (nArc + 1)) * Math.PI; // from one strand, under, to the other: its ends are the strands' last beads
      const c = -r * Math.cos(th), dn = r * Math.sin(th);
      mt.makeTranslation(pos.x + c * side.x + dn * tan.x, pos.y + c * side.y + dn * tan.y, pos.z + c * side.z + dn * tan.z);
      beads.setMatrixAt(2 * nb + b, mt);
    }
    beads.instanceMatrix.needsUpdate = true;
  }
  layout();

  // the cursor: its last position (CSS px), the nodes on screen, per-node push weights
  let lastX = null, lastY = null;
  const sx = new Float32Array(N), sy = new Float32Array(N), wgt = new Float32Array(N);
  const wp = new THREE.Vector3(), inv = new THREE.Matrix4();
  const camR = new THREE.Vector3(), camU = new THREE.Vector3(), cv = new THREE.Vector3();

  // the cursor sweeps through the chain like a finger: where its path this frame
  // passes within reach of a link, both ends of the link are carried along the
  // cursor's velocity (up to `carry` of it, never faster), so a slow pass nudges and a
  // flick sends a wave down the loop
  function brush(state, CH) {
    const pt = state.pointer;
    if (!pt?.active || !state.camera || !state.view) {
      lastX = lastY = null;
      return false;
    }
    const cam = state.camera, vw = state.view.w, vh = state.view.h;
    const reach = CH.reachPx ?? 28;
    const x0 = lastX ?? pt.x, y0 = lastY ?? pt.y;
    lastX = pt.x;
    lastY = pt.y;
    group.updateMatrixWorld(true);
    const m = group.matrixWorld;
    for (let i = 0; i < N; i++) {
      wp.set(x[i * 3], x[i * 3 + 1], x[i * 3 + 2]).applyMatrix4(m).project(cam);
      sx[i] = ((wp.x + 1) / 2) * vw;
      sy[i] = ((1 - wp.y) / 2) * vh;
      wgt[i] = 0;
    }
    // the cursor's path this frame, sampled at half-reach steps (a flick can jump past
    // the chain between two frames)
    const px = pt.x - x0, py = pt.y - y0;
    const steps = Math.min(16, Math.max(1, Math.ceil(Math.hypot(px, py) / (reach * 0.5))));
    let hover = false;
    for (let i = 1; i < N; i++) {
      const ax = sx[i - 1], ay = sy[i - 1], dx = sx[i] - ax, dy = sy[i] - ay;
      const l2 = dx * dx + dy * dy || 1;
      let best = reach, bu = 0;
      for (let k = 1; k <= steps; k++) {
        const qx = x0 + (px * k) / steps, qy = y0 + (py * k) / steps;
        const u = Math.max(0, Math.min(1, ((qx - ax) * dx + (qy - ay) * dy) / l2));
        const d = Math.hypot(qx - (ax + u * dx), qy - (ay + u * dy));
        if (d < best) {
          best = d;
          bu = u;
        }
      }
      if (best >= reach) continue;
      hover = true;
      const f = 1 - best / reach;
      const fall = f * f * (3 - 2 * f);
      wgt[i] = Math.max(wgt[i], fall * (0.5 + 0.5 * bu));
      wgt[i - 1] = Math.max(wgt[i - 1], fall * (1 - 0.5 * bu));
    }
    if (!hover) return false;
    // only a cursor that is moving now pushes (Agam, 2026-09-28: "it should not move in
    // the default state, only when the mouse interacts"). The pointer's velocity is set
    // by pointer events and went stale when the mouse stopped, so a resting cursor near
    // the chain, or the chain scrolling past a still cursor, kept shoving it
    const fresh = performance.now() - (pt.t ?? 0) < 60 && Math.hypot(pt.x - x0, pt.y - y0) > 0.5;
    if (!fresh) return true; // still over it (the grab hand), no push
    // the cursor's velocity in metres per second at the chain's depth, in its frame
    const mid = (ns >> 1) * 3;
    wp.set(x[mid], x[mid + 1], x[mid + 2]).applyMatrix4(m).applyMatrix4(cam.matrixWorldInverse);
    const perPx = cam.isPerspectiveCamera
      ? (2 * Math.max(0.05, -wp.z) * Math.tan((cam.fov * D2R) / 2)) / (cam.zoom || 1) / vh
      : (cam.top - cam.bottom) / (cam.zoom || 1) / vh;
    inv.copy(m).invert();
    camR.setFromMatrixColumn(cam.matrixWorld, 0).transformDirection(inv);
    camU.setFromMatrixColumn(cam.matrixWorld, 1).transformDirection(inv);
    cv.copy(camR).multiplyScalar(pt.vx * perPx).addScaledVector(camU, -pt.vy * perPx);
    // a finger pushes a hanging chain sideways, never lifts it: drop the vertical part
    // (with it, an up or down stroke jerked the whole loop up and down)
    cv.y = 0;
    const speed = cv.length();
    if (speed < 1e-4) return true;
    const want = speed * (CH.carry ?? 0.85);
    for (let i = 1; i < N; i++) {
      if (wgt[i] <= 0) continue;
      const j = i * 3;
      // raise the node's speed along the cursor's direction toward carry x the cursor's
      const along = (v[j] * cv.x + v[j + 1] * cv.y + v[j + 2] * cv.z) / speed;
      if (along >= want) continue;
      const add = ((want - along) * wgt[i]) / speed;
      v[j] += cv.x * add;
      v[j + 1] += cv.y * add;
      v[j + 2] += cv.z * add;
    }
    pushed = true;
    return true;
  }
  let pushed = false;

  function step(dt, t1, CH, wind) {
    const subs = Math.min(64, Math.max(1, Math.ceil(dt * (CH.rate ?? 1200))));
    const h = dt / subs;
    const keep = Math.exp(-(CH.drag ?? 0.6) * h); // air drag
    const vMax = CH.maxSpeed ?? 4;
    const gain = G * (CH.wind ?? 0.2) * wind.draught;
    const bend = CH.bend ?? 0.004;
    const still = CH.still ?? 0.015;
    const restKeep = Math.exp(-(CH.restDrag ?? 12) * h);
    for (let s = 0; s < subs; s++) {
      const t = t1 - dt + (s + 1) * h;
      // predict: gravity, and the draught through the ajar leaf as a sideways push that
      // grows down the chain and travels down it (so the loop sways, not just tilts)
      for (let i = 1; i < N; i++) {
        const j = i * 3, u = i / ns;
        const ax = gain * (0.3 + 0.7 * u) * Math.sin(t * 1.1 - u * 2.2) * wind.sign;
        const az = gain * 0.35 * Math.sin(t * 0.7 - u * 1.8 + 1.3);
        v[j] = (v[j] + h * ax) * keep;
        v[j + 1] = (v[j + 1] - h * G) * keep;
        v[j + 2] = (v[j + 2] + h * az) * keep;
        pr[j] = x[j] + h * v[j];
        pr[j + 1] = x[j + 1] + h * v[j + 1];
        pr[j + 2] = x[j + 2] + h * v[j + 2];
      }
      pr[0] = x[0];
      pr[1] = x[1];
      pr[2] = x[2];
      // one pass over the links, alternating direction each substep so neither end
      // leads; the pulley's node does not move
      // several passes (2026-09-28): one let gravity stretch the links, which opened
      // gaps between the beads at the bottom and bobbed the loop up and down at rest
      for (let it = 0; it < (CH.iters ?? 4); it++) {
      const up = (s + it) & 1;
      for (let c = 0; c < ns; c++) {
        const i = up ? ns - c : c + 1;
        const j = i * 3, q = j - 3;
        const wq = im[i - 1], wj = im[i];
        const dx = pr[j] - pr[q], dy = pr[j + 1] - pr[q + 1], dz = pr[j + 2] - pr[q + 2];
        const l = Math.hypot(dx, dy, dz) || 1e-9;
        const k = (l - L) / l / (wq + wj);
        pr[q] += wq * k * dx;
        pr[q + 1] += wq * k * dy;
        pr[q + 2] += wq * k * dz;
        pr[j] -= wj * k * dx;
        pr[j + 1] -= wj * k * dy;
        pr[j + 2] -= wj * k * dz;
      }
      }
      // a soft brake on folding: nodes two apart are eased back toward 2 links apart
      // when a bend brings them closer (bead chains roll at every bead but do not kink)
      if (bend > 0) {
        for (let i = 1; i < ns; i++) {
          const a = (i - 1) * 3, b = (i + 1) * 3;
          const wa = im[i - 1], wb = im[i + 1];
          const dx = pr[b] - pr[a], dy = pr[b + 1] - pr[a + 1], dz = pr[b + 2] - pr[a + 2];
          const l = Math.hypot(dx, dy, dz) || 1e-9;
          if (l >= 2 * L) continue;
          const k = (bend * (l - 2 * L)) / l / (wa + wb);
          pr[a] += wa * k * dx;
          pr[a + 1] += wa * k * dy;
          pr[a + 2] += wa * k * dz;
          pr[b] -= wb * k * dx;
          pr[b + 1] -= wb * k * dy;
          pr[b + 2] -= wb * k * dz;
        }
      }
      for (let i = 1; i < N; i++) {
        const j = i * 3;
        if (pr[j + 2] < zMin) pr[j + 2] = zMin; // the wall behind
        const vx = (pr[j] - x[j]) / h, vy = (pr[j + 1] - x[j + 1]) / h, vz = (pr[j + 2] - x[j + 2]) / h;
        const sp = Math.hypot(vx, vy, vz);
        // at rest it rests: below `still` m/s the node is braked hard, so solver noise
        // and the last of a swing die out instead of drifting (it read as random motion)
        const cl = sp > vMax ? vMax / sp : sp < still ? restKeep : 1;
        v[j] = vx * cl;
        v[j + 1] = vy * cl;
        v[j + 2] = vz * cl;
        x[j] = pr[j];
        x[j + 1] = pr[j + 1];
        x[j + 2] = pr[j + 2];
      }
    }
  }

  /**
   * @param {Object} state  the room's FrameState (time, dt, pointer, camera, view)
   * @param {{ draught: number, sign: number }} wind  draught 0..1 through the ajar leaf;
   *        sign: which way it blows along x
   * @returns {boolean} whether the cursor is over the chain
   */
  // asleep: nothing has pushed it for a while and it has settled, so it is not stepped
  // at all and hangs exactly still (Agam: "in its default state it should not move")
  let lastPush = -1e9, asleep = false;
  function update(state, wind) {
    const CH = BC.physics || {};
    const hover = brush(state, CH);
    const now = performance.now();
    if (pushed) {
      lastPush = now;
      asleep = false;
      pushed = false;
    }
    if (!asleep && now - lastPush > (CH.sleepMs ?? 1500)) {
      let vm = 0;
      for (let i = 0; i < v.length; i++) vm = Math.max(vm, Math.abs(v[i]));
      if (vm < (CH.sleepSpeed ?? 0.02)) asleep = true;
    }
    const dt = Math.min(0.05, Math.max(0, state.dt || 0));
    if (dt > 0 && !asleep) {
      step(dt, state.time || 0, CH, wind);
      layout();
    }
    return hover;
  }

  return { group, update };
}
