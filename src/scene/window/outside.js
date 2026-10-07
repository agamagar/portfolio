/**
 * outside.js: everything beyond the glass except the sky plate itself.
 *
 *   outside/grid.js      the brown box grille 38 cm out: one flat plane, turned in plan (fit to the photo)
 *   outside/bamboo.js    the bamboo clump on the right: canes, branches, leaves
 *   outside/farTrees.js  the street trees, the horizon trees, the cream building
 *                        with its red-orange patch, the compound wall, road, ground
 *   outside/rain.js      rain between the bamboo and the glass, drips off the grille
 *   outside/moon.js      Dreamlike: the moon's own crisp disc (maria, true phase and limb)
 *                        over the plate's, its corona and halo, silver cloud rims, its light on the edges
 *   outside/motes.js     Dreamlike: pollen and fireflies outside, dust in the lamp beam
 *   outside/neon.js      Cyberpunk: neon signs 18 to 26 m out, flat emissive cards over
 *                        the street crowns (built on the first frame a look enables them)
 *   outside/horizon.js   the far edge: a hazy treeline with a few blocks over it, the
 *                        haze above it, and at night the city (skyglow, lit windows,
 *                        the white-LED street lights' heads); what a gap in the
 *                        street canopy shows
 *   outside/common.js    the wind (TSL, with motion vectors), the outdoor material (night,
 *                        highlight cap, the lens pre-blur for far layers, the street
 *                        lights, a lit window's glow)
 * plus, only with outside.blocked.plane, a dark plane behind R2 (the room builds
 * the one that is used; Dreamlike opens it).
 *
 * World frame: metres; x right (east), y up, +z into the room; outside is -z
 * (north). The glass of the left pair is the plane z = 0.
 *
 * THE SKY. The engine owns the sky dome (a 40 m sphere segment carrying the Living
 * Sky plate, engine.js buildSkyDome) and places it by params.sky.view: every dome
 * vertex hangs along the direction its plate texel shows (skyPlate.plateUV), so the
 * sky is at infinity for every camera on the path (no parallax, which is right for
 * cloud kilometres away) and the window at bearing 0 sees the part of the sky that
 * is really there (the golden side toward the western sun on the left). What
 * gives the view its depth is the layering in front of it, each at its own
 * distance: grille 0.38 m, rain 0.1 to 2.8 m, bamboo 1.5 to 3 m, building 12 m,
 * street trees 9 to 15 m, horizon trees 20 to 37 m (all inside the dome), each
 * hazed by the real visibility.
 *
 * @param {Object} P    the live params; reads params.outside, params.dims, and
 *                      (read only) params.room.wall, params.sky, params.lights.lamp,
 *                      params.camera.ref
 * @param {Object} ctx  { renderer, skyTexture: THREE.CanvasTexture, skyDome: THREE.Mesh,
 *                        anchors (the room's RoomAnchors, see room.js),
 *                        random (seeded 0..1),
 *                        uniforms: { skyAvg, sunColor } (TSL uniform nodes, linear) }
 * @returns {{ group: THREE.Group, update(state): void, setLook(look: string): void, dispose(): void, stats }}
 *   update(state) gets the FrameState: { time, dt, p, p2, look, weather (SceneWeather),
 *   wind: { vecX, vecZ, speed, gust, gustEnvelope } }. One wind for everything.
 */

import * as THREE from "three/webgpu";
import { lights as lightsNode } from "three/tsl";
import { createOutsideUniforms, outdoorMaterial, linv, smooth, D2R, NEON } from "./outside/common.js";
import { setKelvin } from "three/addons/utils/ColorUtils.js";
import { buildGrid } from "./outside/grid.js";
import { buildBamboo } from "./outside/bamboo.js";
import { buildFarTrees } from "./outside/farTrees.js";
import { buildRain } from "./outside/rain.js";
import { buildMoon } from "./outside/moon.js";
import { buildMotes } from "./outside/motes.js";
import { buildHorizon } from "./outside/horizon.js";
import { buildNeon } from "./outside/neon.js";
import { lightningAt } from "./skyPlate.js";
// read only, and as a namespace: light/exposure.js lightGain (loop 2, the light
// lane's "two exposures") may not exist in every build; without it G is 1
import * as exposureModule from "./light/exposure.js";

// A curve over the day's hours: knots [[hour, value], ...] from 0 to 24, linear
// between them (the city's lit windows and its glow, outside.city)
export function hourCurve(knots, h) {
  if (!Array.isArray(knots) || !knots.length) return 0;
  const x = ((h % 24) + 24) % 24;
  for (let i = 0; i < knots.length - 1; i++) {
    const [x0, y0] = knots[i], [x1, y1] = knots[i + 1];
    if (x >= x0 && x <= x1) return y0 + ((y1 - y0) * (x - x0)) / Math.max(1e-6, x1 - x0);
  }
  return knots[knots.length - 1][1];
}
const LUM = (c) => 0.2126 * c.r + 0.7152 * c.g + 0.0722 * c.b;

export function buildOutside(P, ctx) {
  const W = P.dims.W;
  const O = P.outside;
  const group = new THREE.Group();
  group.name = "outside";
  const rnd = ctx.random || Math.random;
  const anchors = ctx.anchors || {};
  const U = createOutsideUniforms();
  const parts = [];
  const owned = [];

  // --- the brown box grille -------------------------------------------------------------
  const grid = buildGrid(P, U, anchors);
  // params.outside.grid.enabled: false hides it (no shadow, no rain drips off it)
  if (P.outside.grid.enabled === false) grid.group.visible = false;
  group.add(grid.group);
  parts.push(grid);

  // --- the grey far-right column (Dreamlike opens it) ------------------------------------
  const blocked = new THREE.Group();
  blocked.name = "blockedPane";
  const rs = anchors.rightSection;
  const r2 = anchors.r2Pane;
  if (rs && r2 && O.blocked.plane) {
    rs.updateWorldMatrix(true, false);
    const pw = r2.x1 - r2.x0 + 0.6 * W;
    const ph = r2.y1 - r2.y0 + 0.6 * W;
    const bm = outdoorMaterial(U, { albedo: linv(O.blocked.color), roughness: 0.9, haze: 0, ambient: O.blocked.ambient ?? 0.5, name: "blockedPane" });
    owned.push(bm);
    const pg = new THREE.PlaneGeometry(pw, ph);
    owned.push(pg);
    const pl = new THREE.Mesh(pg, bm);
    pl.position.set((r2.x0 + r2.x1) / 2, (r2.y0 + r2.y1) / 2, -O.blocked.depth * W);
    pl.receiveShadow = true;
    blocked.add(pl);
    blocked.matrixAutoUpdate = false;
    blocked.matrix.copy(rs.matrixWorld);
  }
  group.add(blocked);

  // --- the bamboo ---------------------------------------------------------------------------
  const chair = P.camera?.ref?.pos ? P.camera.ref.pos.map((v) => v * W) : null;
  const bamboo = O.bamboo.enabled ? buildBamboo(P, U, rnd, { chair }) : null;
  if (bamboo) {
    group.add(bamboo.group);
    parts.push(bamboo);
  }

  // --- the rest of the view --------------------------------------------------------------------
  const far = buildFarTrees(P, U, rnd, { chair });
  group.add(far.group);
  parts.push(far);

  // --- the far edge and the city ---------------------------------------------------------------
  const horizon = buildHorizon(P, U, ctx);
  group.add(horizon.group);
  parts.push(horizon);

  // --- rain, moon, motes -----------------------------------------------------------------------
  const rain = buildRain(P, U, rnd, { dripBars: P.outside.grid.enabled === false ? [] : grid.dripBars });
  group.add(rain.group);
  parts.push(rain);
  const moon = buildMoon(P, U, ctx);
  group.add(moon.group);
  parts.push(moon);
  const roomHasMotes = !!(anchors.motes || anchors.lampHead?.parent?.getObjectByName?.("motes"));
  const motes = buildMotes(P, U, rnd, { lampHead: anchors.lampHead || null, roomHasMotes });
  group.add(motes.group);
  parts.push(motes);
  // the neon signs: nothing until a look enables them (update, below)
  let neon = null;

  // --- the camera, for the lens (U.lens) --------------------------------------------------------
  // The engine hands no camera to the modules; the canopy's own draw call does. The
  // camera object is the engine's one scene camera, posed before update() runs, so
  // the reference is kept and read each frame. (A shadow or depth pass never draws
  // the canopy: it casts no shadow.)
  let viewCam = null;
  const cardsMesh = far.group.getObjectByName("canopyCards");
  if (cardsMesh) {
    cardsMesh.onBeforeRender = (_r, _s, cam) => {
      if (cam && cam.isPerspectiveCamera && !viewCam) viewCam = cam;
    };
  }

  // --- per frame --------------------------------------------------------------------------------
  const skyU = ctx.uniforms?.skyAvg;
  const sunTint = new THREE.Color();
  const tmpC = new THREE.Color();
  let lastW = null;
  let lastT = null;
  let look = "dreamlike";

  // U.lens: what the far layers' pre-blur needs (common.js outdoorLensBlur). The
  // focus: state.lens.focus when the engine passes the pose's, else the camera's
  // distance to the glass plane (z = 0), which is where every keyframe but the hero
  // focuses. The DOF's own far blur, as an angle: its bokeh radius is bokehScale x the
  // path's bokeh in pixels of a 1600 px wide frame.
  function updateLens(state) {
    const Ln = P.outside.lens || {};
    const cam = viewCam;
    if (!Ln.enabled || !cam) {
      U.lens.value.w = 0;
      return;
    }
    const focus = Math.max(0.2, state.lens?.focus ?? Math.abs(cam.position.z));
    const D = P.post?.dof || {};
    const tier = P.quality && P.post?.tiers?.[P.quality];
    const dofOn = D.enabled !== false && !(tier && tier.dof === false);
    const fovH = 2 * Math.atan(Math.tan((cam.fov * Math.PI) / 360) * (cam.aspect || 1.6));
    const dofRad = dofOn ? (D.bokehScale ?? 2.5) * (state.lens?.bokeh ?? 1) * ((2 * Math.tan(fovH / 2)) / 1600) : 0;
    U.lens.value.set(Ln.aperture ?? 0.0039, 1 / focus, 2 * dofRad, 1);
  }

  function applyParams() {
    blocked.visible = !!P.outside.blocked.plane && !P.outside.blocked.open;
  }
  applyParams();

  // Outdoor surfaces take only the lights that really reach them: the key (the sun
  // by day, the moon by night, with the house's shadow) and the desk lamp through
  // the glass. Not the room's bounce, the window fill or the monitor glow, which
  // are the room's light (the room bounce hemisphere would light every south face
  // outside as if the room shone on it). The sky's own light is added in the
  // materials (U.skyAmb). Resolved once the lights exist, again after a rebuild.
  let lightSig = "";
  function bindLights() {
    const scene = group.parent;
    if (!scene) return;
    const rig = scene.getObjectByName("lights");
    if (!rig) return;
    const picked = ["sun", "lamp"].map((n) => rig.getObjectByName(n)).filter((l) => l && l.isLight);
    const sig = picked.map((l) => l.uuid).join("|");
    if (!picked.length || sig === lightSig) return;
    lightSig = sig;
    const ln = lightsNode(picked);
    for (const m of U.materials) {
      if (m.userData?.outdoorNoLights) continue;
      m.lightsNode = ln;
      m.needsUpdate = true;
    }
  }

  function update(state) {
    applyParams();
    if (P.outside.light.ownLights) bindLights();
    look = state.look || look;
    const Lk = P.outside.looks?.[look] || { sat: 1, ambient: 1 };
    if (bamboo) for (const m of bamboo.spray) m.visible = !!Lk.spray;
    const sw = state.weather || {};
    const Wd = P.outside.wind;
    let w = state.wind || { vecX: 1, vecZ: 0, speed: 8, gust: 12, gustEnvelope: 1 };
    if (Wd.force) {
      // a test and tuning knob: the outside's wind pinned (the sky keeps the real one)
      const f = Wd.force;
      const toward = ((f.dirFrom ?? 250) + 180) * (Math.PI / 180);
      w = { ...w, speed: f.speed ?? w.speed, gust: f.gust ?? (f.speed ?? w.speed) * 1.5, vecX: Math.sin(toward), vecZ: -Math.cos(toward) };
    }

    // the wind, this frame and the last (for motion vectors): the mean and the gust
    // speed as strengths (common.js windOffset: the plants feel mean..gust as a gust
    // front passes, advected along the wind at `advect` of the 10 m speed)
    const st = (v) => Math.min(3.5, Math.max(0, (v || 0) / Wd.strengthAt));
    const wNow = [w.vecX || 0, w.vecZ || 0, st(w.speed), st(Math.max(w.speed || 0, w.gust ?? (w.speed || 0) * 1.5))];
    if (!lastW) lastW = wNow.slice();
    U.Wp.value.set(...lastW);
    U.W.value.set(...wNow);
    lastW = wNow;
    U.Tp.value = lastT ?? state.time;
    U.T.value = state.time;
    lastT = state.time;
    U.K.value.set(Wd.lean, Wd.sway, Wd.flutter, Math.max(0.5, ((w.speed || 0) / 3.6) * Wd.advect));

    // the light outside: the sky plate's own average (scene units, set by the engine
    // before this call), what the ground throws back, lightning on top
    const L = P.outside.light;
    const sky = skyU?.value || new THREE.Color(0.3, 0.35, 0.4);
    const flash = sw.storm?.active ? lightningAt(state.time, sw.storm).flash * L.flash : 0;
    const amb = L.ambient * Lk.ambient;
    U.skyAmb.value.setRGB(sky.r * amb + flash * 0.9, sky.g * amb + flash * 0.95, sky.b * amb + flash);
    const gt = L.groundTint;
    U.groundAmb.value.setRGB(sky.r * amb * L.ground * gt[0], sky.g * amb * L.ground * gt[1], sky.b * amb * L.ground * gt[2]);
    const ht = L.hazeTint;
    U.hazeCol.value.setRGB(sky.r * ht[0] + flash * 0.3, sky.g * ht[1] + flash * 0.3, sky.b * ht[2] + flash * 0.3);
    const vis = Number.isFinite(sw.visibility) ? sw.visibility : 20000;
    let hd = Math.max(L.hazeMin, Math.min(L.hazeMax, vis * L.hazeK));
    if (sw.rain?.active) hd *= L.rainHaze;
    U.hazeDist.value = hd;
    U.bloom.value = P.sky.bloom ?? 0.1;
    U.wet.value = Math.max(0, Math.min(1, sw.rain?.wetness ?? 0));
    U.sat.value = Lk.sat;
    U.sunDir.value.fromArray(sw.sun?.dir || [0, 1, 0]);
    // the outdoor sun for far things: dimmer and redder near the horizon, hidden by cloud
    const alt = sw.sun?.alt ?? -10;
    // night: 0 with the sun above +5 deg (17:41 is +6.9), 1 from civil twilight (-5)
    U.night.value = 1 - smooth(-5, 5, alt);
    updateLens(state);
    const cloud = Math.max(0, Math.min(1, sw.cloud?.total ?? 0.4));
    const clear = sw.rain?.active ? 0.08 : 1 - 0.8 * cloud * cloud;
    const up = smooth(-1.5, 5, alt) * (0.55 + 0.45 * smooth(3, 30, alt));
    setKelvin(sunTint, 2400 + 3400 * smooth(0, 30, alt));
    const sk = L.sun * up * clear;
    U.sunCol.value.setRGB(sunTint.r * sk, sunTint.g * sk, sunTint.b * sk);
    // the horizon band's sun: the sun's colour at the sky light's luminance
    const fk = (LUM(U.skyAmb.value) / Math.max(1e-6, LUM(sunTint))) * up * clear;
    U.farSun.value.setRGB(sunTint.r * fk, sunTint.g * fk, sunTint.b * fk);

    // THE CITY AT NIGHT (loop 2, ledger 7.7: "no city light at night; 21:00 equals
    // 00:00"). The hour is the local clock of the sky being shown (sw.tod): windows
    // light up from dusk and go dark through the night (outside.city.windows, the
    // share lit), the city's glow in the low air follows them down after 22:00 (as a
    // multiple of the night sky's own light, so a cloudy city night, which the plate
    // already draws brighter, glows more), and the white-LED street lights burn from
    // dusk to dawn
    const C = P.outside.city || {};
    const cityOn = C.enabled !== false;
    const tod = Number.isFinite(sw.tod) ? sw.tod : 21;
    const dark = cityOn ? 1 - smooth(-6, -1, alt) : 0;
    const litShare = cityOn ? hourCurve(C.windows, tod) : 0;
    const glowLevel = cityOn ? hourCurve(C.glow, tod) * (C.glowRel ?? 1) * LUM(U.skyAmb.value) * dark : 0;
    const Sl = C.street || {};
    const streetOn = cityOn && Sl.level > 0 ? 1 - smooth(-4, 1, alt) : 0;
    U.city.value.set(litShare, glowLevel, streetOn, dark);
    // the street lights, the lit windows and the lamp heads are PHYSICAL light, like
    // the sky: under the light lane's two exposures (light/exposure.js) they carry
    // the same gain G = E_true / E_render as the sky and the lamp, so at night they
    // keep their level against the sky whatever the camera does (the glow already
    // does: it is a multiple of the sky's own light)
    const G = typeof exposureModule.lightGain === "function" ? exposureModule.lightGain(P) : 1;
    U.lightGain.value = Number.isFinite(G) && G > 0 ? G : 1;
    tmpC.setStyle(C.glowColor || "#b79a86", THREE.SRGBColorSpace);
    const gl = glowLevel / Math.max(1e-6, LUM(tmpC));
    U.glowCol.value.setRGB(tmpC.r * gl, tmpC.g * gl, tmpC.b * gl);
    tmpC.setStyle(Sl.color || "#e9efff", THREE.SRGBColorSpace);
    const sl = ((Sl.level || 0) * streetOn * U.lightGain.value) / Math.max(1e-6, LUM(tmpC));
    U.streetCol.value.setRGB(tmpC.r * sl, tmpC.g * sl, tmpC.b * sl);
    const poles = Sl.poles || [];
    for (let i = 0; i < U.poles.length; i++) {
      const pl = poles[i];
      if (!pl) {
        U.poles[i].value.set(0, -100, 0, 0);
        continue;
      }
      const [bearing, dist, y, w = 1] = pl;
      U.poles[i].value.set(Math.sin(bearing * D2R) * dist, y, -Math.cos(bearing * D2R) * dist, w);
    }
    // THE NEON SIGNS (Cyberpunk, outside/neon.js): built on the first frame a look
    // enables them; their light (NEON.mean) joins the outdoor air and the sky light
    // the outdoor surfaces receive (outside.neon.air); 0 while no sign is on
    if (!neon && P.outside.neon?.enabled) {
      neon = buildNeon(P, U);
      group.add(neon.group);
      parts.push(neon);
    }
    if (neon) neon.update(state);
    else {
      NEON.mean.setRGB(0, 0, 0);
      NEON.a.value.set(0, 0, 0);
      NEON.b.value.set(0, 0, 0);
    }
    const nAir = P.outside.neon?.enabled ? P.outside.neon.air ?? 1 : 0;
    if (nAir > 0) {
      const m = NEON.mean;
      U.hazeCol.value.r += m.r * nAir;
      U.hazeCol.value.g += m.g * nAir;
      U.hazeCol.value.b += m.b * nAir;
      U.skyAmb.value.r += m.r * nAir;
      U.skyAmb.value.g += m.g * nAir;
      U.skyAmb.value.b += m.b * nAir;
    }
    // THE MURK (Cyberpunk; outside.horizon.murk, absent elsewhere: 0): a cloud deck
    // and rain lit from below by the city, the towers' tops and their lights fading
    // into it, the sky between them a lit violet murk (horizon.js, neon.js)
    const Mk = P.outside.horizon?.murk;
    let murk = 0;
    if (Mk) {
      const deck = smooth(0.45, 0.95, cloud);
      const wetM = sw.rain?.active ? Math.max(0.5, U.wet.value) * (sw.storm?.active ? Mk.storm ?? 1 : 1) : 0;
      murk = Math.min(1, (Mk.cloud ?? 0) * deck + (Mk.rain ?? 0) * wetM);
    }
    U.murk.value.set(murk, Mk?.base ?? 16, Math.max(0.1, Mk?.depth ?? 4), Mk?.glow ?? 1);
    horizon.update(state);
    far.update?.(state);

    rain.update(state, { lampHead: anchors.lampHead, wind: w });
    moon.update(state);
    motes.update(state, { wind: w });
    // night: the moon rim is the only moonlight here (Dreamlike); others stay at 0,
    // but for the neon signs' own rim on the bamboo (Cyberpunk, outside.neon.rim:
    // the signs stand behind the clump, so its edges catch their colour)
    if (!(P.sky.moon?.mode === "placed")) {
      if (!(neon && neon.rim(U))) U.moonRim.value.setRGB(0, 0, 0);
    }
  }

  const api = {
    group,
    update,
    setLook(l) {
      if (l) look = l;
      applyParams();
    },
    stats: { bamboo: bamboo?.stats, trees: far.stats, horizon: horizon.stats },
    // dev only: what the outside is being lit with this frame (tools read it)
    debug() {
      const c = (u) => [u.value.r, u.value.g, u.value.b].map((v) => +v.toFixed(4));
      return { neon: neon ? neon.debug() : null, city: U.city.value.toArray().map((v) => +v.toFixed(5)), glowCol: c(U.glowCol), streetCol: c(U.streetCol), farSun: c(U.farSun), skyAmb: c(U.skyAmb), groundAmb: c(U.groundAmb), hazeCol: c(U.hazeCol), hazeDist: U.hazeDist.value, wet: U.wet.value, W: U.W.value.toArray(), K: U.K.value.toArray(), moonRim: c(U.moonRim), night: +U.night.value.toFixed(3), skyGain: ctx.uniforms?.skyGain ? c(ctx.uniforms.skyGain) : null, lens: U.lens.value.toArray().map((v) => +v.toFixed(5)), stats: api.stats };
    },
    dispose() {
      for (const p of parts) p.dispose();
      for (const o of owned) o.dispose();
      group.removeFromParent();
      if (typeof window !== "undefined" && window.__windowOutside === api) delete window.__windowOutside;
    },
  };
  if (typeof window !== "undefined" && import.meta.env?.DEV) window.__windowOutside = api;
  return api;
}
