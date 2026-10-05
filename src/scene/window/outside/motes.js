// DREAMLIKE ONLY: glowing motes (30-locked-brief.md, "Dreamlike touches").
//
// Two populations, one merged mesh each, positions worked out in the vertex shader
// from a seed and the ambient time (deterministic at a frozen ?t, nothing uploaded
// per frame):
//   outdoor  pollen by day, firefly specks by night, drifting around the bamboo on
//            the real wind (they travel with it and wander), sparse at noon and
//            bright after dark; the ones that stray into the lamp's beam catch its
//            warm light
//   beam     dust in the desk lamp's cone, inside the room: they follow the lamp
//            head (ctx.anchors.lampHead: its world position is the bulb, its local
//            -z the beam) and its cone angle (params.lights.lamp.angle), turn
//            slowly, sparkle as they tumble, and fade at the cone's edge
// The room placeholder had its own beam motes; if the room still exposes an object
// named "motes", the beam population here stands down ("auto") so the two never
// double up. Force it with params.outside.motes.beam = true or false.

import * as THREE from "three/webgpu";
import { Fn, attribute, vec3, float, fract, sin, cos, normalize, cross, length, smoothstep, max, positionPrevious, cameraPosition, uniform, dot, pow, exp } from "three/tsl";
import { GeoBuilder, glowMaterial, lin, smooth } from "./common.js";

function specks(n, rnd) {
  const gb = new GeoBuilder({ aS: 4, aC: 2 });
  for (let i = 0; i < n; i++) {
    const s = [rnd(), rnd(), rnd(), rnd()];
    const ids = [];
    for (const [cx, cy] of [
      [-1, -1],
      [1, -1],
      [-1, 1],
      [1, 1],
    ])
      ids.push(gb.vert({ p: [0, 0, 0], n: [0, 0, 1], uv: [cx * 0.5 + 0.5, cy * 0.5 + 0.5], aS: s, aC: [cx, cy] }));
    gb.quad(ids[0], ids[1], ids[2], ids[3]);
  }
  return gb.build();
}

// a camera-facing quad of half-size `size` around centre c
function billboard(c, aC, size) {
  const view = normalize(c.sub(cameraPosition));
  const right = normalize(cross(view, vec3(0, 1, 0)));
  const up = cross(right, view);
  return c.add(right.mul(aC.x.mul(size))).add(up.mul(aC.y.mul(size)));
}

export function buildMotes(P, U, rnd, { lampHead = null, roomHasMotes = false } = {}) {
  const Mo = P.outside.motes;
  const group = new THREE.Group();
  group.name = "motes";
  const u = {
    outRate: uniform(0),
    outGlow: uniform(new THREE.Color(0, 0, 0)),
    pollen: uniform(new THREE.Color(0, 0, 0)),
    night: uniform(0),
    // how far the air has carried them since t = 0 (m), now and one frame ago
    travel: uniform(new THREE.Vector3()),
    travelP: uniform(new THREE.Vector3()),
    lampPos: uniform(new THREE.Vector3()),
    lampX: uniform(new THREE.Vector3(1, 0, 0)),
    lampY: uniform(new THREE.Vector3(0, 1, 0)),
    lampZ: uniform(new THREE.Vector3(0, 0, -1)), // the beam
    lampTan: uniform(0.84),
    lampCos: uniform(0.76),
    lampCol: uniform(new THREE.Color(0, 0, 0)),
    beamGlow: uniform(0),
  };
  const aS = attribute("aS", "vec4");
  const aC = attribute("aC", "vec2");
  const r2 = dot(aC, aC);
  const soft = exp(r2.mul(-4.5)).mul(float(1).sub(smoothstep(0.8, 1.0, r2)));

  // --- outdoor ------------------------------------------------------------------------------
  const [bx0, bx1, by0, by1, bz0, bz1] = Mo.box;
  const PACE = float(Mo.pace ?? 1); // params.outside.motes.pace
  const sx = bx1 - bx0, sy = by1 - by0, sz = bz1 - bz0;
  // travel: how far the air has carried them (the wind's integral, update() below):
  // loop 2, they had drifted by drift x t with a drift that carries the gust
  // envelope, so every change of the gust moved them by t x the change (after ten
  // minutes live, several metres a second: they raced and reversed). Now they ride
  // the integrated wind, smooth at any t, deterministic at a frozen ?t
  const outAt = (t, travel) => {
    const ph = aS.w.mul(6.283);
    const wander = vec3(sin(t.mul(0.31).add(ph)), sin(t.mul(0.23).add(ph.mul(1.7))).mul(0.6), cos(t.mul(0.27).add(ph.mul(2.3)))).mul(0.18);
    const x = float(bx0).add(fract(aS.x.add(travel.x.div(sx))).mul(sx));
    const y = float(by0).add(fract(aS.y.add(travel.y.div(sy)).add(sin(t.mul(0.11).add(ph)).mul(0.03))).mul(sy));
    const z = float(bz0).add(fract(aS.z.add(travel.z.div(sz))).mul(sz));
    return vec3(x, y, z).add(wander);
  };
  const outSize = float(Mo.size[0]).add(aS.y.mul(Mo.size[1] - Mo.size[0]));
  const outPos = Fn((builder) => {
    if (builder.needsPreviousData && builder.needsPreviousData()) positionPrevious.assign(billboard(outAt(U.Tp.mul(PACE), u.travelP), aC, outSize));
    return billboard(outAt(U.T.mul(PACE), u.travel), aC, outSize);
  })();
  const cNow = outAt(U.T.mul(PACE), u.travel);
  // fireflies blink at night; pollen glints by day
  const blink = pow(max(sin(U.T.mul(PACE).mul(float(1.3).add(aS.x.mul(1.7))).add(aS.z.mul(40))), 0), 5);
  const steady = float(0.25);
  const nightGlow = vec3(u.outGlow).mul(steady.add(blink.mul(1.6)));
  const dayGlow = vec3(u.pollen).mul(sin(U.T.mul(PACE).mul(2.1).add(aS.w.mul(30))).mul(0.5).add(0.5));
  const toMote = cNow.sub(u.lampPos);
  const lampOn = vec3(u.lampCol)
    .mul(smoothstep(u.lampCos, u.lampCos.add(0.1), dot(normalize(toMote), u.lampZ)))
    .div(dot(toMote, toMote).add(0.02))
    .mul(0.02);
  const outCol = nightGlow.mul(u.night).add(dayGlow.mul(float(1).sub(u.night))).add(lampOn);
  const outMat = glowMaterial({ colorNode: outCol, opacityNode: soft, positionNode: outPos, bloomNode: outCol.mul(Mo.bloom), name: "motesOutdoor" });
  const outGeo = specks(Mo.outdoor, rnd);
  const outMesh = new THREE.Mesh(outGeo, outMat);
  outMesh.name = "motesOutdoor";
  outMesh.frustumCulled = false;
  outMesh.renderOrder = 3;
  group.add(outMesh);

  // --- in the lamp's beam ----------------------------------------------------------------------
  const beamAt = (t) => {
    const d = float(Mo.beamRange[0]).add(fract(aS.x.add(t.mul(0.004).mul(aS.w.add(0.5)))).mul(Mo.beamRange[1] - Mo.beamRange[0]));
    const th = aS.z.mul(6.283).add(t.mul(0.05).mul(aS.w.sub(0.5)));
    const rr = u.lampTan.mul(0.85).mul(d).mul(aS.y.sqrt());
    const bob = sin(t.mul(0.37).add(aS.w.mul(20))).mul(0.006);
    return u.lampPos.add(u.lampZ.mul(d)).add(u.lampX.mul(cos(th).mul(rr))).add(u.lampY.mul(sin(th).mul(rr).add(bob)));
  };
  const beamSize = float(Mo.beamSize[0]).add(aS.y.mul(Mo.beamSize[1] - Mo.beamSize[0]));
  const beamPos = Fn((builder) => {
    if (builder.needsPreviousData && builder.needsPreviousData()) positionPrevious.assign(billboard(beamAt(U.Tp), aC, beamSize));
    return billboard(beamAt(U.T), aC, beamSize);
  })();
  const bNow = beamAt(U.T);
  const toB = bNow.sub(u.lampPos);
  const bd = length(toB);
  const cosA = dot(toB.div(max(bd, 1e-4)), u.lampZ);
  const edge = smoothstep(u.lampCos, u.lampCos.add(0.12), cosA);
  const sparkle = sin(U.T.mul(float(2.5).add(aS.x.mul(4))).add(aS.z.mul(50))).mul(0.5).add(0.5).pow(3).mul(1.5).add(0.3);
  const beamCol = vec3(u.lampCol).mul(u.beamGlow).mul(edge).mul(sparkle).div(bd.mul(bd).mul(40).add(1));
  const beamMat = glowMaterial({ colorNode: beamCol, opacityNode: soft, positionNode: beamPos, bloomNode: beamCol.mul(Mo.bloom), name: "motesBeam" });
  const beamGeo = specks(Mo.beam, rnd);
  const beamMesh = new THREE.Mesh(beamGeo, beamMat);
  beamMesh.name = "motesBeam";
  beamMesh.frustumCulled = false;
  beamMesh.renderOrder = 3;
  group.add(beamMesh);

  const tmp = new THREE.Vector3();
  const lampC = new THREE.Color();
  let lastTravel = null;
  // the gust envelope's integral from 0 to t (skyPlate.js windPulse: 1 + a (cos 0.085 t
  // + 0.55 cos (0.23 t + 1.7))), so a mote's path is the wind's own
  const carried = (t, a) => t + a * (Math.sin(t * 0.085) / 0.085 + (0.55 * (Math.sin(t * 0.23 + 1.7) - Math.sin(1.7))) / 0.23);

  function update(state, { wind } = {}) {
    const on = !!P.outside.motes.enabled;
    const sw = state.weather;
    const sunAlt = sw?.sun?.alt ?? 10;
    const night = 1 - smooth(-6, 4, sunAlt);
    const noon = smooth(20, 60, sunAlt);
    const wet = sw?.rain?.active ? 1 : 0;
    // outdoor: sparse at noon, full after dark, few in the rain
    const rate = on ? (0.15 + 0.85 * (1 - noon)) * (wet ? 0.25 : 1) : 0;
    u.outRate.value = rate;
    outGeo.setDrawRange(0, Math.round(Mo.outdoor * rate) * 6);
    outMesh.visible = rate > 0.001;
    u.night.value = night;
    u.outGlow.value.copy(lin(Mo.fireflyColor)).multiplyScalar(Mo.fireflyGlow);
    u.pollen.value.copy(lin(Mo.pollenColor)).multiplyScalar(Mo.pollenGlow * (0.3 + 0.7 * smooth(-2, 8, sunAlt)));
    // they ride the wind (m/s, its mean slowed by the drag of the clump, swelling and
    // easing with the gust envelope), rising a little
    const ms = ((wind?.speed ?? 0) / 3.6) * Mo.windFactor;
    const d = carried(state.time ?? 0, sw?.wind?.gustAmp ?? 0) * ms;
    const tx = (wind?.vecX ?? 0) * d, tz = (wind?.vecZ ?? 0) * d, ty = 0.02 * (Mo.pace ?? 1) * (state.time ?? 0);
    if (!lastTravel) lastTravel = new THREE.Vector3(tx, ty, tz);
    u.travelP.value.copy(lastTravel);
    u.travel.value.set(tx, ty, tz);
    lastTravel.set(tx, ty, tz);
    // the lamp
    if (lampHead) {
      lampHead.updateWorldMatrix(true, false);
      lampHead.getWorldPosition(u.lampPos.value);
      u.lampX.value.copy(tmp.set(1, 0, 0).transformDirection(lampHead.matrixWorld));
      u.lampY.value.copy(tmp.set(0, 1, 0).transformDirection(lampHead.matrixWorld));
      u.lampZ.value.copy(tmp.set(0, 0, -1).transformDirection(lampHead.matrixWorld));
      const ang = P.lights.lamp.angle;
      u.lampTan.value = Math.tan(ang);
      u.lampCos.value = Math.cos(ang);
      lampC.set(P.lights.lamp.color).multiplyScalar(P.lights.lamp.enabled ? P.lights.lamp.intensity : 0);
      u.lampCol.value.copy(lampC);
    }
    const beamOn = on && lampHead && (Mo.beam > 0) && (Mo.beamMode === true || (Mo.beamMode === "auto" && !roomHasMotes));
    beamMesh.visible = !!beamOn;
    // brighter at night: by day the room is lit and the beam's dust hardly shows
    u.beamGlow.value = Mo.beamGlow * (0.3 + 0.7 * night);
  }

  return {
    group,
    update,
    dispose() {
      outGeo.dispose();
      beamGeo.dispose();
      outMat.dispose();
      beamMat.dispose();
      group.removeFromParent();
    },
  };
}
