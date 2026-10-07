// The light rig, driven by the weather bridge's hour and the camera's key.
//
//   lamp     SpotLight at the room's lampHead anchor, 3000 K duv +0.003 (#ffbe6c),
//            aimed down the shade's axis (or at a fitted target), a gobo
//            (light/gobo.js) for the rim's hard cut-off, a 2048 shadow map, PCF
//            softened by shadow.radius. Always on (20-question Q10). It also lights
//            the air (light/volume.js, layer VOLUME_LAYER).
//   lampGlow a warm point light where the beam lands: the lit wood's own glow onto
//            the bars and stiles beside it (the one bounce that shows)
//   key      the sky bodies: a DirectionalLight that is the sun by day (from the
//            weather bridge; it never enters a north window's view, but it lights
//            the bamboo, the far trees and the building, and from May to July it
//            reaches the room) and the moon by night (Dreamlike: the placed moon in
//            the upper left panes, lighting the bamboo edges; otherwise its true
//            direction, behind the house)
//   window   RectAreaLight over the opening, facing into the room, emitting the
//            sky's scene luminance through the dusty glass; lightning adds to it
//   monitor  RectAreaLight on the screen, emitting what the screen shows
//   bounce   a hemisphere turned to face the room: the light the room returns,
//            from a flux balance (window + screen + lamp in, room albedo, area)
//
// What the post needs (the exposure's key, the flash, the air's lights, the golden
// hour) goes on the light bus (light/bus.js). No light is ever added or removed
// after the build (that would recompile every material); "off" is intensity 0.

import * as THREE from "three/webgpu";
import { RectAreaLightTexturesLib } from "three/addons/lights/RectAreaLightTexturesLib.js";
import { lightningAt } from "./skyPlate.js";
import { worldDir } from "../../lib/astro.js";
import { lightBus, publishDebug, VOLUME_LAYER } from "./light/bus.js";

const WHITE = new THREE.Color(1, 1, 1);
const SUN_BLOCKER_LAYER = 12; // drawn only into the key light's shadow map
const SHADOW_ONLY_LAYER = 13; // nothing lives here; it pins the lamp shadow camera's mask
import { makeGobo, goboKey, goboProfile, makeSpillGobo, spillKey } from "./light/gobo.js";
import { skyGain, goldenFactor, sunColor, sunIlluminance, weatherDim, lightGain } from "./light/exposure.js";
import { skyGradeUniforms, updateSkyGrade } from "./light/grade.js";
import { setKelvin } from "three/addons/utils/ColorUtils.js";
import { NEON } from "./outside/common.js";

let ltcReady = false;
const smooth = (a, b, x) => {
  const t = Math.max(0, Math.min(1, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
};
const lumOf = (c) => 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];

// extra: { uniforms } the engine's uniform bag (the sky dome's grade reads it)
export function createLights(scene, anchors, P, extra = {}) {
  if (!ltcReady) {
    THREE.RectAreaLightNode.setLTC(RectAreaLightTexturesLib.init());
    ltcReady = true;
  }
  const bus = lightBus(scene);
  const group = new THREE.Group();
  group.name = "lights";
  scene.add(group);
  const L = P.lights;
  const W = P.dims.W;

  // --- lamp ----------------------------------------------------------------------------
  const lamp = new THREE.SpotLight(L.lamp.color, L.lamp.intensity, L.lamp.distance, L.lamp.angle, L.lamp.penumbra, L.lamp.decay);
  lamp.name = "lamp";
  const lampTarget = new THREE.Object3D();
  lampTarget.name = "lampTarget";
  lamp.target = lampTarget;
  lamp.castShadow = L.lamp.shadow.enabled;
  lamp.shadow.mapSize.set(L.lamp.shadow.mapSize, L.lamp.shadow.mapSize);
  lamp.shadow.camera.near = L.lamp.shadow.near;
  lamp.shadow.camera.far = L.lamp.shadow.far;
  lamp.layers.enable(VOLUME_LAYER); // the air sees the lamp's core (its beam)
  // a fixed layer mask on the shadow camera: with only layer 0 three borrows the
  // rendering camera's mask, and the air's pass (layer VOLUME_LAYER only) would
  // then draw an empty shadow map for the frame
  lamp.shadow.camera.layers.enable(SHADOW_ONLY_LAYER);
  let gobo = null, goboSig = "";
  const flatGobo = new THREE.DataTexture(new Uint8Array([255, 255, 255, 255]), 1, 1);
  flatGobo.needsUpdate = true;
  lamp.map = flatGobo; // always a map, so turning the gobo off never recompiles
  group.add(lamp, lampTarget);

  // The lamp's spill: the same bulb, the same head pose, a second lobe of its
  // emission. The dome's white reflector throws light wide toward the window's
  // stiles: the 18:40 glow on L2's hinge stile lies 80 deg off the photographed
  // shade axis (low in row C, 84 deg), with the rim's hard diagonal cut at its
  // lower left. One projected map cannot reach 85 deg (its projection degenerates
  // past about 70), so the lobe is its own SpotLight whose direction is fixed in
  // the head's frame (params.lights.lamp.spill: off-axis and azimuth angles):
  // move the head and the lobe moves with it. Scene only (not the air: lighting
  // the air with the spill filled the view with an orange haze at night). Its
  // shadow (the bars on the stile) is a smaller map, off on the low tier.
  const spill = new THREE.SpotLight(L.lamp.color, 0, 0, 0.5, 0.02, 2);
  spill.name = "lampSpill";
  const spillTarget = new THREE.Object3D();
  spillTarget.name = "lampSpillTarget";
  spill.target = spillTarget;
  spill.shadow.camera.layers.enable(SHADOW_ONLY_LAYER);
  spill.shadow.camera.near = L.lamp.shadow.near;
  spill.shadow.camera.far = L.lamp.shadow.far;
  const ssz = L.lamp.spill?.shadowMapSize ?? 1024; // build-time
  spill.shadow.mapSize.set(ssz, ssz);
  let spillGobo = null, spillSig = "";
  spill.map = flatGobo;
  group.add(spill, spillTarget);
  const spillDir = new THREE.Vector3();
  const _xc = new THREE.Vector3(), _yc = new THREE.Vector3(), _up = new THREE.Vector3(0, 1, 0);

  // the lit wood's glow (placed where the beam's axis lands)
  const lampGlow = new THREE.PointLight(L.lamp.color, 0, 0.6, 2);
  lampGlow.name = "lampGlow";
  group.add(lampGlow);
  const ray = new THREE.Raycaster();
  let glowSig = "";
  const glowHit = { point: new THREE.Vector3(), normal: new THREE.Vector3(0, 0, 1), dist: 0.1, ok: false };

  // --- key: sun by day, moon by night ---------------------------------------------------
  const key = new THREE.DirectionalLight(0xffffff, 0);
  key.name = "sun";
  const keyTarget = new THREE.Object3D();
  keyTarget.position.set(0.3, 0, -0.6);
  key.target = keyTarget;
  key.castShadow = L.sun.shadow.enabled;
  key.shadow.mapSize.set(L.sun.shadow.mapSize, L.sun.shadow.mapSize);
  const e = L.sun.shadow.extent;
  Object.assign(key.shadow.camera, { left: -e, right: e, top: e, bottom: -e, near: 0.1, far: 16 });
  key.shadow.camera.updateProjectionMatrix();
  key.shadow.camera.layers.enable(SUN_BLOCKER_LAYER);
  group.add(key, keyTarget);

  // The house, for the sun only: a wall slab behind the glass with the opening cut
  // out, and the room's shell. Drawn into the key light's shadow map and nowhere
  // else (its own layer), so whatever the room builder models, the sun never leaks
  // into the room except through the window, and the house shades the bamboo when
  // the sun is behind it. At 17:41 the sun is 3 deg south of west: grazing the
  // north wall from behind, it must light nothing inside.
  const blocker = new THREE.Group();
  blocker.name = "sunBlocker";
  const blockMat = new THREE.MeshBasicNodeMaterial({ colorWrite: false, depthWrite: false });
  const blockBox = (x0, x1, y0, y1, z0, z1) => {
    const m = new THREE.Mesh(new THREE.BoxGeometry(x1 - x0, y1 - y0, z1 - z0), blockMat);
    m.position.set((x0 + x1) / 2, (y0 + y1) / 2, (z0 + z1) / 2);
    m.castShadow = true;
    m.receiveShadow = false;
    m.layers.set(SUN_BLOCKER_LAYER);
    m.frustumCulled = false;
    blocker.add(m);
  };
  {
    const o = anchors.opening;
    const hx0 = o.center.x - o.width / 2, hx1 = o.center.x + o.width / 2;
    const hy0 = o.center.y - o.height / 2, hy1 = o.center.y + o.height / 2;
    const zw0 = -0.25, zw1 = -0.03; // the wall, outside the glass plane
    blockBox(-6, hx0, -3.5, 4.5, zw0, zw1);
    blockBox(hx1, 6, -3.5, 4.5, zw0, zw1);
    blockBox(hx0, hx1, -3.5, hy0, zw0, zw1);
    blockBox(hx0, hx1, hy1, 4.5, zw0, zw1);
    // the room: floor, ceiling, side walls, back wall
    blockBox(-2.6, 2.6, -1.3, -1.2, zw1, 4.6);
    blockBox(-2.6, 2.6, 1.9, 2.0, zw1, 4.6);
    blockBox(-2.7, -2.6, -1.3, 2.0, zw1, 4.6);
    blockBox(2.6, 2.7, -1.3, 2.0, zw1, 4.6);
    blockBox(-2.7, 2.7, -1.3, 2.0, 4.6, 4.7);
  }
  group.add(blocker);

  // --- window fill ---------------------------------------------------------------------
  const op = anchors.opening;
  const fill = new THREE.RectAreaLight(0xffffff, 0, op.width, op.height);
  fill.name = "windowFill";
  fill.position.copy(op.center).addScaledVector(op.normal, 0.01);
  fill.lookAt(op.center.clone().addScaledVector(op.normal, 1));
  group.add(fill);

  // --- monitor glow ----------------------------------------------------------------------
  const scr = anchors.monitorScreen;
  scr.updateWorldMatrix(true, false);
  const scrBox = new THREE.Box3().setFromObject(scr);
  const scrSize = scrBox.getSize(new THREE.Vector3());
  const scrCenter = scrBox.getCenter(new THREE.Vector3());
  const scrNormal = new THREE.Vector3(0, 0, 1).transformDirection(scr.matrixWorld);
  const mon = new THREE.RectAreaLight(0xffffff, 0, Math.max(scrSize.x, 0.01), Math.max(scrSize.y, 0.01));
  mon.name = "monitorGlow";
  mon.position.copy(scrCenter).addScaledVector(scrNormal, 0.004);
  mon.lookAt(scrCenter.clone().addScaledVector(scrNormal, 1));
  group.add(mon);

  // --- the room's ceiling light, for the dusk photo shots only -------------------------
  // Every 18:39 to 18:40 photo (5480 to 5484) was taken with the room's ceiling
  // light on (5480's lit cream wall, the glint streak in the glossy screen); the
  // visitor's scene never has it (20-question Q10). So it exists only when this
  // page renders a shot whose params say ceilingLight (or lights.ceiling.always):
  // the shot is fixed per page load, so no other page ever compiles it. A wide
  // warm-white spot from the ceiling above and behind-left of the chair (on the
  // line the screen glint was traced along), shadowed, aimed at the window wall.
  const shotName = extra.shot ?? (typeof location !== "undefined" ? new URLSearchParams(location.search).get("shot") : null);
  const shotCfg = shotName && shotName !== "ref1741" ? P.camera.shots?.[shotName] : null;
  const Cc = L.ceiling || {};
  let ceil = null, ceilTarget = null;
  if (Cc.enabled !== false && (Cc.always || shotCfg?.ceilingLight)) {
    ceil = new THREE.SpotLight(0xffffff, 0, 0, ((Cc.angleDeg ?? 70) * Math.PI) / 180, Cc.penumbra ?? 0.7, 2);
    ceil.name = "ceilingLight";
    ceilTarget = new THREE.Object3D();
    ceilTarget.name = "ceilingLightTarget";
    ceil.target = ceilTarget;
    ceil.castShadow = !!Cc.shadow;
    ceil.shadow.mapSize.set(1024, 1024);
    ceil.shadow.camera.near = 0.1;
    ceil.shadow.camera.far = 6;
    ceil.shadow.camera.layers.enable(SHADOW_ONLY_LAYER);
    ceil.shadow.bias = -0.0005;
    ceil.shadow.normalBias = 0.01;
    ceil.shadow.radius = 4;
    group.add(ceil, ceilTarget);
  }

  // --- bounce: the room's returned light, a hemisphere whose "sky" faces the room --------
  const hemi = new THREE.HemisphereLight(0xffffff, 0x000000, 0);
  hemi.name = "roomBounce";
  hemi.position.set(0, 0.6, 1); // the bright side faces up and into the room
  group.add(hemi);

  // --- the rectangles the camera's key is estimated from (light/exposure.js) -----------
  const rectOf = (c, n, w, h) => {
    const up0 = Math.abs(n.y) > 0.9 ? new THREE.Vector3(0, 0, 1) : new THREE.Vector3(0, 1, 0);
    const right = new THREE.Vector3().crossVectors(up0, n).normalize();
    const up = new THREE.Vector3().crossVectors(n, right).normalize();
    return [
      c.clone().addScaledVector(right, -w / 2).addScaledVector(up, -h / 2),
      c.clone().addScaledVector(right, w / 2).addScaledVector(up, -h / 2),
      c.clone().addScaledVector(right, w / 2).addScaledVector(up, h / 2),
      c.clone().addScaledVector(right, -w / 2).addScaledVector(up, h / 2),
    ];
  };
  const gp = scr.geometry?.parameters || {};
  const sx = new THREE.Vector3().setFromMatrixColumn(scr.matrixWorld, 0).length();
  const sy = new THREE.Vector3().setFromMatrixColumn(scr.matrixWorld, 1).length();
  const scrCenterExact = new THREE.Vector3().setFromMatrixPosition(scr.matrixWorld);
  bus.rects = {
    opening: rectOf(op.center, op.normal, op.width, op.height),
    screen: rectOf(scrCenterExact, scrNormal, (gp.width ?? scrSize.x) * sx, (gp.height ?? scrSize.y) * sy),
  };
  bus.opening = { center: op.center.clone(), width: op.width, height: op.height };
  // the portrait monitor's code editor: post.js shows it 1:1 like the main screen
  const prt = scene.getObjectByName("portraitScreen");
  if (prt) {
    prt.updateWorldMatrix(true, false);
    const { width: pw, height: ph } = prt.geometry.parameters;
    bus.rects.portrait = [[-pw / 2, -ph / 2], [pw / 2, -ph / 2], [pw / 2, ph / 2], [-pw / 2, ph / 2]].map(([x, y]) => new THREE.Vector3(x, y, 0).applyMatrix4(prt.matrixWorld));
    bus.portraitIntensity = prt.material.emissiveIntensity;
  }

  const tmp = new THREE.Vector3();
  const tmp2 = new THREE.Vector3();
  const dirV = new THREE.Vector3();
  const rightV = new THREE.Vector3();
  const upV = new THREE.Vector3();
  const tmpC = new THREE.Color();
  const dayC = new THREE.Color();
  const dayC2 = new THREE.Color();
  const tmpC2 = new THREE.Color();
  const lampLin = new THREE.Color();
  const flashLin = new THREE.Color();
  const sunCol = [1, 1, 1];
  const lampHead = anchors.lampHead;
  const skyGradeU = extra.uniforms ? skyGradeUniforms(extra.uniforms) : null;

  function aimLamp(Lp) {
    lampHead.updateWorldMatrix(true, false);
    lampHead.getWorldPosition(lamp.position);
    dirV.set(0, 0, -1).transformDirection(lampHead.matrixWorld);
    const A = Lp.lamp.aim;
    if (A && A.mode === "target" && Array.isArray(A.target)) {
      tmp.set(A.target[0] * W, A.target[1] * W, A.target[2] * W).sub(lamp.position).normalize();
      dirV.lerp(tmp, Math.max(0, Math.min(1, A.blend ?? 1))).normalize();
    }
    lampTarget.position.copy(lamp.position).add(dirV);
    lampTarget.updateMatrixWorld();
    // a frame across the beam (for the specks)
    rightV.crossVectors(dirV, Math.abs(dirV.y) > 0.95 ? tmp2.set(1, 0, 0) : tmp2.set(0, 1, 0)).normalize();
    upV.crossVectors(rightV, dirV).normalize();
  }

  // where the beam's axis lands: raycast only when the lamp moves
  function placeGlow(Lp) {
    const sig = [lamp.position.x, lamp.position.y, lamp.position.z, dirV.x, dirV.y, dirV.z].map((v) => v.toFixed(4)).join("|");
    if (sig === glowSig) return;
    glowSig = sig;
    ray.set(lamp.position, dirV);
    ray.near = 0.05; // past the shade, the cup and the arm
    ray.far = 2;
    ray.layers.set(0);
    const hits = ray.intersectObjects(scene.children, true);
    glowHit.ok = false;
    for (const h of hits) {
      const o = h.object;
      if (!o.isMesh || o.isInstancedMesh || !o.visible) continue;
      if (/sky|air|speck|mote|bulb|glass/i.test(o.name || "")) continue;
      const m = Array.isArray(o.material) ? o.material[0] : o.material;
      if (!m || (m.transparent && (m.opacity ?? 1) < 0.6) || m.isMeshBasicNodeMaterial) continue;
      if (lampHead && isDescendant(o, lampHead)) continue;
      glowHit.point.copy(h.point);
      if (h.face) glowHit.normal.copy(h.face.normal).transformDirection(o.matrixWorld);
      else glowHit.normal.copy(dirV).negate();
      if (glowHit.normal.dot(dirV) > 0) glowHit.normal.negate();
      glowHit.dist = h.distance;
      glowHit.ok = true;
      break;
    }
    bus.debug.glowHit = glowHit.ok ? glowHit.point.toArray().map((v) => +(v / W).toFixed(3)) : null;
  }

  // --- shadow maps only when what they see changes (loop 2, perf) ----------------------
  // Every shadow map used to re-render every frame (94 of the p = 0 hero's 198 draw
  // calls were shadow passes, about 0.9 ms). Now a map re-renders when its light
  // changed (moved, turned, its cone, on or off), else when a shadow caster's world
  // matrix moved (the handle leaf rocking, the bead chain: every `moving`-th frame,
  // a frame or two late at most), else every `refresh`-th frame for what moves only
  // in its vertex shader (the bamboo and its leaves, the nearest canes in the lamp's
  // reach). params.lights.shadowSchedule; enabled false = every frame, as before.
  const SH = { frame: 0, casters: [], castersAt: -1e9, casterSig: 0, casterMoved: false, last: new Map(), sig: new Map() };
  function casterSignature() {
    if (SH.frame - SH.castersAt > 120) {
      SH.casters = [];
      scene.traverse((o) => {
        if (o.castShadow && o.isMesh) SH.casters.push(o);
      });
      SH.castersAt = SH.frame;
    }
    let h = SH.casters.length;
    for (let i = 0; i < SH.casters.length; i++) {
      const o = SH.casters[i];
      const k = 1 + (i % 11) * 0.137;
      if (!o.visible) {
        h += k * 0.31;
        continue;
      }
      const e = o.matrixWorld.elements;
      h += k * (e[12] * 1.31 + e[13] * 1.73 + e[14] * 2.11 + e[0] * 0.71 + e[2] * 0.93 + e[8] * 1.17 + e[5] * 0.53);
      if (o.isInstancedMesh) h += k * (o.count * 0.001 + (o.instanceMatrix?.version ?? 0) * 0.0123);
    }
    return h;
  }
  function lightSig(l) {
    const t = l.target?.position;
    return [l.intensity > 1e-6 ? 1 : 0, l.castShadow ? 1 : 0, l.position.x, l.position.y, l.position.z, t?.x ?? 0, t?.y ?? 0, t?.z ?? 0, l.angle ?? 0, l.shadow.mapSize.x]
      .map((v) => (typeof v === "number" ? v.toFixed(4) : v))
      .join("|");
  }
  function scheduleShadows() {
    const SS = P.lights.shadowSchedule || {};
    SH.frame++;
    const on = SS.enabled !== false;
    const hs = casterSignature();
    SH.casterMoved = Math.abs(hs - SH.casterSig) > 1e-7;
    SH.casterSig = hs;
    let n = 0;
    for (const [l, refresh, moving] of [
      [lamp, SS.lampRefresh ?? 8, SS.lampMoving ?? 2],
      [spill, SS.lampRefresh ?? 8, SS.lampMoving ?? 2],
      [key, SS.sunRefresh ?? 4, SS.sunMoving ?? 2],
      [ceil, 8, 1],
    ]) {
      if (!l) continue;
      l.shadow.autoUpdate = false;
      if (!l.castShadow || l.intensity <= 1e-6) {
        l.shadow.needsUpdate = false;
        continue;
      }
      const sg = lightSig(l);
      const since = SH.frame - (SH.last.get(l) ?? -1e9);
      const due = !on || sg !== SH.sig.get(l) || since >= refresh || (SH.casterMoved && since >= moving);
      l.shadow.needsUpdate = due;
      if (due) {
        SH.last.set(l, SH.frame);
        SH.sig.set(l, sg);
        n++;
      }
    }
    bus.debug.shadowUpdates = n;
  }

  // sky = { linear: [r, g, b] } mean sky light in scene units; screenLight = mean
  // linear light of what the screen shows (0..1 of its white)
  function update(state, { sky, screenLight = 0.5 } = {}) {
    const Lp = P.lights;
    const sw = state.weather;
    const alt = sw?.sun?.alt ?? 10;
    bus.sunAlt = alt;
    // where the camera is on the runways (the post's page-on-screen reads them)
    bus.p = state.p ?? 0;
    bus.p2 = state.p2 ?? 0;
    bus.tod = sw?.tod ?? 12;
    // the camera's shot (a capture shot with a photo takes the photo's EV100)
    bus.shot = state.shot ?? null;
    // G: every physical light below is shown at the camera's true exposure,
    // the image at the display exposure (light/exposure.js "the two exposures");
    // the sky already carries it (skyGain), so the window's light does too
    const gL = lightGain(P);
    bus.lightGainUsed = gL;

    // --- lamp
    aimLamp(Lp);
    const G = Lp.lamp.gobo;
    const sig = G.enabled ? goboKey(G, Lp.lamp.angle) : "off";
    if (sig !== goboSig) {
      goboSig = sig;
      gobo?.dispose();
      gobo = G.enabled ? makeGobo(G, Lp.lamp.angle) : null;
      lamp.map = gobo || flatGobo;
    }
    lamp.color.set(Lp.lamp.color);
    lamp.intensity = Lp.lamp.enabled ? Lp.lamp.intensity * gL : 0;
    lamp.angle = Lp.lamp.angle;
    lamp.penumbra = Lp.lamp.penumbra;
    lamp.decay = Lp.lamp.decay;
    lamp.distance = Lp.lamp.distance;
    lamp.shadow.radius = Lp.lamp.shadow.radius;
    lamp.shadow.bias = Lp.lamp.shadow.bias;
    lamp.shadow.normalBias = Lp.lamp.shadow.normalBias;
    lampLin.set(Lp.lamp.color);

    // the spill lobe: its direction in the head's frame (the frame the core's map
    // is projected in: x = cross(up, -axis), y = cross(-axis, x)), its own map
    const S = Lp.lamp.spill || {};
    if (S.enabled !== false && Lp.lamp.enabled) {
      _xc.crossVectors(_up, tmp.copy(dirV).negate()).normalize();
      _yc.crossVectors(tmp, _xc).normalize();
      const th = ((S.offAxisDeg ?? 80) * Math.PI) / 180, ph = ((S.azDeg ?? 172) * Math.PI) / 180;
      spillDir.copy(dirV).multiplyScalar(Math.cos(th)).addScaledVector(_xc, Math.sin(th) * Math.cos(ph)).addScaledVector(_yc, Math.sin(th) * Math.sin(ph)).normalize();
      spill.position.copy(lamp.position);
      spillTarget.position.copy(lamp.position).add(spillDir);
      spillTarget.updateMatrixWorld();
      // the cone: angleDeg is the lobe's half-angle (its map reaches 2 deg past it);
      // three's projected map degenerates past about 72 deg
      const sAngle = ((Math.min(72, (S.angleDeg ?? 30) + 2)) * Math.PI) / 180;
      const SG = { size: 256, edge: 0.55, hotV: -0.45, midV: 0.9, midRatio: 0.35, cutAz: 225, cutAt: 0.35, cutSoft: 0.03, ...(S.gobo || {}) };
      const ksig = spillKey(SG, sAngle);
      if (ksig !== spillSig) {
        spillSig = ksig;
        spillGobo?.dispose();
        spillGobo = makeSpillGobo(SG);
        spill.map = spillGobo;
      }
      spill.angle = sAngle;
      spill.penumbra = S.penumbra ?? 0.02;
      // dayGain (a look's; 1 = none): the spill held up through the day, eased in
      // from the sun at -4 deg to full at 10 deg (Cyberpunk keeps its pink stile at
      // noon). The spill only: the core lights the wall
      spill.intensity = (S.intensity ?? 1) * gL * (1 + ((S.dayGain ?? 1) - 1) * smooth(-4, 10, alt));
      spill.color.set(Lp.lamp.color);
    } else spill.intensity = 0;
    const tier = P.quality && P.post.tiers?.[P.quality];
    const spillShadow = spill.intensity > 0 && Lp.lamp.shadow.enabled && (S.shadow ?? true) && (!tier || tier.spillShadow !== false);
    if (spill.castShadow !== spillShadow) spill.castShadow = spillShadow; // one recompile, on a tier change
    spill.shadow.radius = Lp.lamp.shadow.radius;
    spill.shadow.bias = Lp.lamp.shadow.bias;
    spill.shadow.normalBias = Lp.lamp.shadow.normalBias;

    // the lit wood's glow
    const B = Lp.lamp.bounce;
    if (B.enabled && Lp.lamp.enabled) {
      placeGlow(Lp);
      if (glowHit.ok) {
        lampGlow.position.copy(glowHit.point).addScaledVector(glowHit.normal, B.offset);
        const cos = Math.max(0.05, -glowHit.normal.dot(dirV));
        // what the gobo lets through on the axis
        const onAxis = G.enabled ? goboProfile(G, 0) : 1;
        const Ehit = (lamp.intensity * onAxis * cos) / Math.max(glowHit.dist * glowHit.dist, 1e-4);
        // flux of the lit patch (paint albedo about 0.09, a patch of radius
        // 0.47 d) as a point source's intensity
        lampGlow.intensity = B.gain * 0.09 * Ehit * Math.PI * Math.pow(0.47 * glowHit.dist, 2);
        lampGlow.color.copy(lampLin);
      } else lampGlow.intensity = 0;
    } else lampGlow.intensity = 0;

    // --- the key light: sun by day, moon by night
    sunColor(P, alt, sunCol);
    bus.sunColor = sunCol.slice();
    const Esun = Lp.sun.enabled ? sunIlluminance(P, sw) : 0;
    const moonOn = Lp.moon.enabled ? 1 - smooth(-6, 0, alt) : 0;
    let Emoon = 0;
    const M = P.sky.moon;
    let mdir = null;
    if (moonOn > 0) {
      if (M.mode === "placed") {
        // where the engine placed it this hour (state.moonPlaced), so the key light
        // comes from the disc the window shows
        const mp = state?.moonPlaced || M;
        mdir = worldDir(mp.az, mp.alt, 0);
        const illum = sw?.moon?.illum ?? 0.5;
        Emoon = Lp.moon.intensity * (0.25 + 0.75 * illum);
      } else if (Array.isArray(Lp.moon.keyDir) && Lp.moon.keyDir.length >= 2) {
        // a night key from a fixed direction [az, alt] (deg), no disc and no phase
        // (Cyberpunk's cyan key; null in the other looks)
        mdir = worldDir(Lp.moon.keyDir[0], Lp.moon.keyDir[1], 0);
        Emoon = Lp.moon.intensity;
      } else if (sw?.moon && sw.moon.alt > -1) {
        mdir = sw.moon.dir;
        Emoon = Lp.moon.intensity * (sw.moon.illum ?? 0.5) * smooth(-1, 10, sw.moon.alt);
      }
    }
    if (Esun > 0 && sw?.sun?.dir) {
      key.intensity = Esun * gL;
      key.color.setRGB(sunCol[0], sunCol[1], sunCol[2]);
      key.position.copy(keyTarget.position).addScaledVector(tmp.fromArray(sw.sun.dir), 8);
    } else if (Emoon > 0 && mdir) {
      key.intensity = Emoon * moonOn * gL;
      key.color.set(Lp.moon.color);
      key.position.copy(keyTarget.position).addScaledVector(tmp.fromArray(mdir), 8);
    } else key.intensity = 0;
    // no light, no shadow map: skip its render (the moon at night in Photo-true
    // and Heightened, the sun behind the house): scheduleShadows, at the end
    key.shadow.radius = Lp.sun.shadow.radius;
    key.shadow.bias = Lp.sun.shadow.bias;
    key.shadow.normalBias = Lp.sun.shadow.normalBias;

    // --- the sky's colour (the dome's grade), then the skylight through the
    // window, plus lightning. The weather's darkness is already in the sky's
    // gain (light/exposure.js weatherDim), so the engine's sky average carries it
    const lin = sky?.linear || [0.6, 0.75, 1.0];
    if (skyGradeU) {
      const g = skyGain(P, sw) * Math.max(1e-4, lumOf(P.sky.tint));
      updateSkyGrade(skyGradeU, P.grade.sky, sw, { mean: Math.max(1e-4, lumOf(lin) / g) });
    }
    const lum = lumOf(lin);
    const mx = Math.max(lin[0], lin[1], lin[2], 1e-6);
    tmpC.setRGB(lin[0] / mx, lin[1] / mx, lin[2] / mx);
    const F = Lp.flash;
    const flash = F.enabled && sw?.storm?.active ? lightningAt(state.time, sw.storm).flash : 0;
    bus.flash = flash;
    flashLin.set(F.color);
    fill.color.copy(tmpC).lerp(flashLin, Math.min(1, flash * 2));
    const winLum = Lp.window.enabled ? lum * Lp.window.intensity : 0;
    fill.intensity = winLum + flash * F.window * gL;
    // (Cyberpunk) the neon signs' light through the glass (outside/neon.js NEON.mean,
    // x outside.neon.air): the only light they give the room; 0 in the other looks
    const nm = NEON.mean;
    const nAir = Lp.window.enabled && P.outside.neon?.enabled ? P.outside.neon.air ?? 1 : 0;
    if (nAir > 0 && nm.r + nm.g + nm.b > 0) {
      const T = Lp.window.intensity * nAir;
      const r = fill.color.r * fill.intensity + nm.r * T;
      const g2 = fill.color.g * fill.intensity + nm.g * T;
      const b = fill.color.b * fill.intensity + nm.b * T;
      const m = Math.max(r, g2, b, 1e-9);
      fill.color.setRGB(r / m, g2 / m, b / m);
      fill.intensity = m;
    }

    // --- the ceiling light (dusk photo shots only)
    let phiCeil = 0;
    if (ceil) {
      const C = Lp.ceiling || {};
      ceil.position.set(C.pos[0] * W, C.pos[1] * W, C.pos[2] * W);
      ceilTarget.position.set(C.target[0] * W, C.target[1] * W, C.target[2] * W);
      ceilTarget.updateMatrixWorld();
      setKelvin(tmpC2, C.kelvin ?? 3800);
      const m = Math.max(tmpC2.r, tmpC2.g, tmpC2.b);
      ceil.color.setRGB(tmpC2.r / m, tmpC2.g / m, tmpC2.b / m);
      ceil.intensity = C.enabled === false ? 0 : C.intensity * (C.shotGain?.[shotName] ?? 1) * gL;
      ceil.angle = ((C.angleDeg ?? 70) * Math.PI) / 180;
      ceil.penumbra = C.penumbra ?? 0.7;
      // most of a ceiling fixture's light lands in the room and comes back
      phiCeil = ceil.intensity * 2 * Math.PI * (1 - Math.cos(ceil.angle)) * 0.75 * (C.roomShare ?? 1);
    }

    // --- monitor
    const white = P.screen.white;
    const scrLum = white * screenLight;
    mon.intensity = Lp.monitor.enabled ? Lp.monitor.intensity * scrLum : 0;

    // --- the room's returned light (flux balance, see params)
    bus.time = state.time;
    const Bn = Lp.bounce;
    if (Bn.enabled) {
      const aOpen = op.width * op.height;
      const aScr = scrSize.x * scrSize.y;
      const phiWin = Math.PI * aOpen * winLum;
      const phiScr = Lp.monitor.enabled ? Math.PI * aScr * scrLum * Lp.monitor.intensity : 0;
      const rimRad = (Lp.lamp.gobo.rimDeg * Math.PI) / 180;
      // the lamp's flux: the core's peak times its gobo's integral over the sphere,
      // plus the spill's (its peak over its cone, times the lit share of its map)
      const phiCore = lamp.intensity * (gobo?.userData.flux ?? 2 * Math.PI * (1 - Math.cos(rimRad)) * 0.6);
      const phiSpill = spill.intensity * 2 * Math.PI * (1 - Math.cos(spill.angle)) * (spillGobo?.userData.fill ?? 0.4) * (Lp.lamp.spill?.roomShare ?? 1);
      const phiLamp = phiCore + phiSpill;
      const phiFlash = Math.PI * aOpen * flash * F.window * gL;
      const Lroom = ((phiWin + phiScr + phiLamp + phiFlash + phiCeil) * Bn.albedo) / (Math.PI * Bn.roomArea * (1 - Bn.albedo));
      // the room's colour: its cream walls lit by what came in
      hemi.color.set(Bn.sky).multiply(tmpC2.copy(tmpC).lerp(WHITE, 0.5));
      hemi.groundColor.set(Bn.ground);
      // DAYLIGHT IN THE ROOM (a look's `day`, 0 in Photo-true, whose 17:41 fit
      // this would move): the flux balance above is a dark room's; by day a real
      // room is filled by the sky and by sunlit ground and walls outside, and that
      // fill is what tells 09:00 from 12:00 from 15:00 (round 2: the three were the
      // same frame, the wall lamp-gold at noon). It rises with the sun (none
      // below dayFrom deg, so the golden hour and dusk keep their silhouettes),
      // peaks at noon, and takes the hour's colour: cool in the morning (the sun
      // is behind the house, the room sees blue sky), neutral at noon, warm in
      // the afternoon (sunlit walls and ground to the west throw it in).
      // a look's room floor on the runways after dark (runwayLift, eased in as the
      // camera leaves the hero, and out as the sun rises past -4 to 6 deg: the eye on
      // the dark room as it nears the desk; 0 = none). Like `lift`, authored (not x G):
      // the runway's camera exposes for the screen, which leaves the room's physical
      // lights 10x under the hero's
      const lift = Bn.lift + ((Bn.runwayLift ?? 0) > 0 ? Bn.runwayLift * smooth(Bn.runwayFrom ?? 0.04, Bn.runwayTo ?? 0.3, Math.max(bus.p ?? 0, bus.p2 ?? 0)) * (1 - smooth(-4, 6, alt)) : 0);
      let Lday = 0;
      if ((Bn.day ?? 0) > 0) {
        const D = Bn.dayTint || {};
        const up = smooth(D.from ?? 8, D.full ?? 30, alt) * (0.65 + 0.35 * smooth(40, 72, alt));
        const wet = sw?.rain?.active ? 0.5 : 1;
        Lday = Bn.day * lum * up * wet;
        const tod = sw?.tod ?? 12;
        const pm = smooth(12.3, 14.5, tod), am = 1 - smooth(10.5, 12.3, tod);
        const noonK = 1 - Math.max(am, pm);
        dayC.set(D.noon ?? "#e8e4dc").multiplyScalar(noonK);
        if (am > 0) dayC.add(dayC2.set(D.morning ?? "#c8d6ea").multiplyScalar(am));
        if (pm > 0) dayC.add(dayC2.set(D.afternoon ?? "#f0d8b4").multiplyScalar(pm));
        // weight the two fills by their light
        const wR = Lroom + lift, wD = Lday, wt = Math.max(1e-6, wR + wD);
        hemi.color.multiplyScalar(wR / wt).add(dayC.multiplyScalar(wD / wt));
      }
      hemi.intensity = Math.PI * (Lroom + lift + Lday) + flash * F.ambient * gL;
      bus.debug.roomLum = +Lroom.toFixed(5);
      bus.debug.dayLum = +Lday.toFixed(5);
    } else hemi.intensity = 0;

    // --- what the post and the air need
    bus.lum.sky = lum;
    bus.lum.skyPhys = lum / Math.max(gL, 1e-6); // the camera meters the sky without G
    bus.lum.window = winLum;
    bus.lum.screen = scrLum;
    bus.lamp = {
      pos: lamp.position,
      dir: dirV,
      right: rightV,
      up: upV,
      intensity: lamp.intensity * (Lp.lamp.volume ?? 1),
      color: [lampLin.r, lampLin.g, lampLin.b],
      rimDeg: Lp.lamp.gobo.enabled ? Lp.lamp.gobo.rimDeg : (Lp.lamp.angle * 180) / Math.PI,
    };
    bus.window = { lum: winLum, color: [tmpC.r, tmpC.g, tmpC.b] };
    bus.flashColor = [flashLin.r, flashLin.g, flashLin.b];

    bus.golden = goldenFactor(sw);
    bus.debug.skyDim = +weatherDim(P, sw).toFixed(3);
    // the camera's exposure trim in rain and storms (stops, light/exposure.js)
    const XW = P.exposure.weather || {};
    bus.weatherBias = Math.pow(2, sw?.storm?.active ? XW.storm ?? 0 : sw?.rain?.active ? XW.rain ?? 0 : 0);

    bus.debug.lamp = { pos: lamp.position.toArray().map((v) => +(v / W).toFixed(3)), dir: dirV.toArray().map((v) => +v.toFixed(4)), intensity: lamp.intensity, spillDir: spillDir.toArray().map((v) => +v.toFixed(4)), spill: spill.intensity };
    bus.debug.keyE = +key.intensity.toFixed(4);
    bus.debug.fill = +fill.intensity.toFixed(4);
    bus.debug.monitor = +mon.intensity.toFixed(4);
    bus.debug.hemi = +hemi.intensity.toFixed(4);
    bus.debug.glow = +lampGlow.intensity.toFixed(6);
    bus.debug.ceiling = ceil ? +ceil.intensity.toFixed(4) : null;
    scheduleShadows();
  }

  return {
    group,
    lamp,
    spill,
    sun: key,
    fill,
    monitor: mon,
    hemi,
    lampGlow,
    ceiling: ceil,
    update,
    publish() {
      publishDebug(bus);
    },
    dispose() {
      lamp.shadow.dispose?.();
      key.shadow.dispose?.();
      gobo?.dispose();
      spillGobo?.dispose();
      spill.shadow.dispose?.();
      ceil?.shadow.dispose?.();
      flatGobo.dispose();
      blocker.traverse((o) => o.geometry?.dispose());
      blockMat.dispose();
      group.removeFromParent();
    },
  };
}

function isDescendant(o, root) {
  for (let p = o; p; p = p.parent) if (p === root) return true;
  return false;
}
