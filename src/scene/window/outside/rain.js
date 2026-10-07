// Rain as a scene layer between the bamboo and the glass (20-question Q12), only
// while SceneWeather.rain says it is raining; slanted by the real wind, gusts
// included; and, for about an hour after rain (rain.wetness), drops gathering under
// the outside grille's horizontal bars and falling off them.
//
// Every streak is one quad in a merged mesh; where it is and how it leans is worked
// out in the vertex shader from its seed, the ambient time and the wind's drift
// (integrated on the CPU, so a gust never makes the drops jump), so nothing is
// uploaded per frame, the count follows the rain rate through the draw range, and a
// frozen ?t gives the same frame every time. A streak is what a drop draws in a
// 1/45 s exposure: its length is its speed times that, its direction the fall plus
// the wind.
//
// WHAT A DROP LOOKS LIKE (loop round 1: the streaks read as sleet). A falling drop
// is a tiny lens: it shows a squeezed image of the sky around it, so its radiance is
// about the sky's average, and it covers only part of a pixel. It is drawn with
// normal blending at that radiance and a low coverage (rain.coverage, 0.2 at a
// streak's core): over dark foliage and the canes it lightens a little, against a
// bright sky it all but vanishes, as real rain does. It is thinned in front of the
// clump (rain.nearThin), so the canes stay readable through it. A drop hanging
// under a wet brown bar is a small dark bead with a glint of sky low in it (the lens
// turns the bright sky above upside down), then a short faint streak when it lets
// go. Gusts slant the rain harder and thicken it (rain.gustDensity).

import * as THREE from "three/webgpu";
import { Fn, attribute, vec3, float, fract, normalize, cross, length, smoothstep, max, abs, positionPrevious, cameraPosition, uniform, dot, mix, mrt, step } from "three/tsl";
import { GeoBuilder, GUST, windGustAt, NEON } from "./common.js";

const G = 9.81;

// The wind's horizontal drift at a point, integrated from 0 to t (m), and its
// velocity (m/s), for the gust model of common.js: the along-wind speed runs from
// the mean to the gust speed with the RAW gust signal (its integral is closed form,
// so drift(t) is a pure function of t), the cross-wind part swings with the lateral
// signal. tau0 is the gust's delay at that point.
function driftAt(t, w, tau0, factor) {
  const ms = (w.speed ?? 0) / 3.6;
  const mg = Math.max(ms, (w.gust ?? (w.speed ?? 0) * 1.5) / 3.6);
  const tau = t + tau0;
  let S = 0, I = 0, Sl = 0, Il = 0;
  for (let i = 0; i < 3; i++) {
    S += GUST.a[i] * Math.sin(tau * GUST.f[i] + GUST.ph[i]);
    I += (-GUST.a[i] * Math.cos(tau * GUST.f[i] + GUST.ph[i])) / GUST.f[i];
    const tl = tau + GUST.latShift;
    Sl += GUST.a[i] * Math.sin(tl * GUST.fl[i] + GUST.phl[i]);
    Il += (-GUST.a[i] * Math.cos(tl * GUST.fl[i] + GUST.phl[i])) / GUST.fl[i];
  }
  const along = ms * t + (mg - ms) * 0.5 * (t + I);
  const vAlong = ms + (mg - ms) * 0.5 * (1 + S);
  const lat = GUST.lateral * (mg - ms) * Il;
  const vLat = GUST.lateral * (mg - ms) * Sl;
  const dx = w.vecX ?? 0, dz = w.vecZ ?? 0; // toward, unit
  const px = -dz, pz = dx; // the wind's left
  return {
    x: (dx * along + px * lat) * factor,
    z: (dz * along + pz * lat) * factor,
    vx: (dx * vAlong + px * vLat) * factor,
    vz: (dz * vAlong + pz * vLat) * factor,
  };
}

// a see-through layer: normal blending; its bloom share is written as if it were the
// sky it mostly shows (transparent layers overwrite the emissive target, see
// common.js layerMRT), so a streak never punches a hole in the sky's bloom
function layerMaterial({ colorNode, opacityNode, positionNode, bloomNode, name }) {
  const m = new THREE.MeshBasicNodeMaterial({ transparent: true, depthWrite: false, blending: THREE.NormalBlending, side: THREE.DoubleSide });
  m.name = name;
  m.colorNode = colorNode;
  m.opacityNode = opacityNode;
  m.positionNode = positionNode;
  m.mrtNode = mrt({ emissive: bloomNode });
  m.fog = false;
  return m;
}

export function buildRain(P, U, rnd, { dripBars = [] } = {}) {
  const R = P.outside.rain;
  const quality = P.quality || "high";
  const group = new THREE.Group();
  group.name = "rain";
  const u = {
    // the wind's drift (m) this frame and the last, wrapped to the box, and its velocity
    drift: uniform(new THREE.Vector3()),
    driftP: uniform(new THREE.Vector3()),
    vel: uniform(new THREE.Vector3()),
    velP: uniform(new THREE.Vector3()),
    sky: uniform(new THREE.Color(0.1, 0.1, 0.1)), // what a drop shows: about the sky's average
    cover: uniform(0.2), // a streak's coverage at its core
    lampPos: uniform(new THREE.Vector3()),
    lampDir: uniform(new THREE.Vector3(0, 0, -1)),
    lampCos: uniform(0.76),
    lampCol: uniform(new THREE.Color(0, 0, 0)),
    wet: uniform(0),
    bar: uniform(new THREE.Color(0.02, 0.015, 0.01)), // a wet bar, lit: what a bead's rim shows
    // the neon signs (outside/neon.js, Cyberpunk): the share of the drops that catch
    // one, and how much of a sign's colour they show (0: the term below is exactly 0)
    neonShare: uniform(0),
    neonGain: uniform(0),
  };

  // --- falling rain -----------------------------------------------------------------------
  const N = Math.round(R.maxDrops * (R.quality?.[quality] ?? 1));
  const gb = new GeoBuilder({ aS: 4, aC: 2 });
  for (let i = 0; i < N; i++) {
    const s = [rnd(), rnd(), rnd(), rnd()];
    const ids = [];
    for (const [cx, cy] of [
      [-1, 0],
      [1, 0],
      [-1, 1],
      [1, 1],
    ])
      ids.push(gb.vert({ p: [0, 0, 0], n: [0, 0, 1], uv: [cx * 0.5 + 0.5, cy], aS: s, aC: [cx, cy] }));
    gb.quad(ids[0], ids[1], ids[2], ids[3]);
  }
  const geo = gb.build();
  geo.boundingSphere = new THREE.Sphere(new THREE.Vector3((R.box[0] + R.box[1]) / 2, (R.box[2] + R.box[3]) / 2, (R.box[4] + R.box[5]) / 2), 8);

  const aS = attribute("aS", "vec4");
  const aC = attribute("aC", "vec2");
  const [x0, x1, y0, y1, z0, z1] = R.box;
  const box = { x0, y0, z0, sx: x1 - x0, sy: y1 - y0, sz: z1 - z0 };

  // centre of a drop at time t, and its velocity, for a given drift
  const dropAt = (t, drift, vel) => {
    const v = float(R.fallSpeed[0]).add(aS.w.mul(R.fallSpeed[1] - R.fallSpeed[0]));
    const y = float(box.y0 + box.sy).sub(fract(aS.y.add(t.mul(v).div(box.sy))).mul(box.sy));
    const x = float(box.x0).add(fract(aS.x.add(drift.x.div(box.sx))).mul(box.sx));
    const z = float(box.z0).add(fract(aS.z.add(drift.z.div(box.sz))).mul(box.sz));
    return { c: vec3(x, y, z), vel: vec3(vel.x, v.negate(), vel.z) };
  };
  const quadAt = (t, drift, vel) => {
    const { c, vel: vv } = dropAt(t, drift, vel);
    const dir = normalize(vv);
    const len = length(vv).mul(R.shutter);
    const view = normalize(c.sub(cameraPosition));
    const side = normalize(cross(dir, view));
    const dist = length(c.sub(cameraPosition));
    const w = max(float(R.width), dist.mul(R.pixelAngle));
    return c.add(dir.mul(aC.y.sub(0.5).mul(len))).add(side.mul(aC.x.mul(w)));
  };
  const rainPos = Fn((builder) => {
    if (builder.needsPreviousData && builder.needsPreviousData()) positionPrevious.assign(quadAt(U.Tp, u.driftP, u.velP));
    return quadAt(U.T, u.drift, u.vel);
  })();
  // what a streak shows: the sky, plus the lamp's beam catching it near the window
  const { c: cNow } = dropAt(U.T, u.drift, u.vel);
  const toDrop = cNow.sub(u.lampPos);
  const dl = length(toDrop);
  const inCone = smoothstep(u.lampCos, u.lampCos.add(0.08), dot(normalize(toDrop), u.lampDir));
  const lampLit = vec3(u.lampCol).mul(inCone).div(dl.mul(dl).add(0.04));
  // a share of the drops catch a neon sign: each picks ONE of the two sign colours (so
  // magenta and cyan never average to grey), from its own seed, and shows it only
  // while it falls in front of that colour's signs (the view toward the drop near
  // where they stand, NEON.dirA / dirB; 2026-10-06: every drop in every pane wore a
  // colour, confetti over the garden)
  const vDrop = normalize(cNow.sub(cameraPosition));
  const nearA = vec3(NEON.a).mul(dot(vDrop, NEON.dirA).sub(1).mul(NEON.spread.x).exp());
  const nearB = vec3(NEON.b).mul(dot(vDrop, NEON.dirB).sub(1).mul(NEON.spread.x).exp());
  const neonPick = mix(nearA, nearB, step(0.5, fract(aS.x.mul(7.3))));
  const neonLit = neonPick.mul(step(float(1).sub(u.neonShare), aS.z)).mul(u.neonGain);
  const col = vec3(u.sky).add(lampLit).add(neonLit);
  // coverage: thin across, soft ends, a little per-drop variety; thinned in front of
  // the bamboo (the drops between the glass and the canes)
  const across = float(1).sub(abs(aC.x));
  const ends = smoothstep(0.0, 0.25, aC.y).mul(float(1).sub(smoothstep(0.75, 1.0, aC.y)));
  const [n0, n1, nk] = R.nearThin;
  const near = mix(float(nk), float(1), smoothstep(n0, n1, cNow.z.negate()));
  const cover = across.mul(ends).mul(aS.w.mul(0.5).add(0.5)).mul(u.cover).mul(near);
  const mat = layerMaterial({ colorNode: col, opacityNode: cover, positionNode: rainPos, bloomNode: vec3(u.sky).mul(U.bloom), name: "rain" });
  const mesh = new THREE.Mesh(geo, mat);
  mesh.name = "rainStreaks";
  mesh.frustumCulled = false;
  mesh.renderOrder = 2;
  mesh.castShadow = false;
  mesh.receiveShadow = false;
  group.add(mesh);

  // --- drops under the outside grille (while it is wet) -------------------------------------------
  const ND = Math.round(R.drips * (R.quality?.[quality] ?? 1));
  const dgb = new GeoBuilder({ aS: 4, aC: 2, aP: 3 });
  for (let i = 0; i < ND; i++) {
    const bar = dripBars.length ? dripBars[Math.floor(rnd() * dripBars.length)] : { y: 0.5, x0: -0.3, x1: 0.3, z0: -0.38, z1: -0.38 };
    const f = rnd();
    const px = bar.x0 + f * (bar.x1 - bar.x0);
    const pz = bar.z ?? bar.z0 + f * (bar.z1 - bar.z0);
    const s = [rnd(), 0.8 + rnd() * 2.6, rnd(), rnd()]; // phase, period (s), -, size
    const ids = [];
    for (const [cx, cy] of [
      [-1, 0],
      [1, 0],
      [-1, 1],
      [1, 1],
    ])
      ids.push(dgb.vert({ p: [px, bar.y, pz], n: [0, 0, 1], uv: [cx * 0.5 + 0.5, cy], aS: s, aC: [cx, cy], aP: [px, bar.y, pz - 0.004] }));
    dgb.quad(ids[0], ids[1], ids[2], ids[3]);
  }
  const dgeo = dgb.build();
  const aP = attribute("aP", "vec3");
  const BEAD = R.bead; // m, radius of a hanging drop when it lets go
  const dripAt = (t) => {
    const per = aS.y;
    const tau = fract(aS.x.add(t.div(per))).mul(per);
    // gathers and swells for most of the period, then falls
    const swell = tau.div(per.mul(0.7)).min(1);
    const fallT = max(tau.sub(per.mul(0.7)), 0);
    const fall = fallT.mul(fallT).mul(0.5 * G);
    const v = fallT.mul(G);
    const r = float(BEAD).mul(aS.w.mul(0.4).add(0.6)).mul(swell.sqrt().mul(0.7).add(0.3));
    return { c: aP.sub(vec3(0, fall.add(r), 0)), v, r, falling: smoothstep(0.0, 0.004, fallT), gone: smoothstep(0.35, 0.5, fallT) };
  };
  const dripQuad = (t) => {
    const { c, v, r } = dripAt(t);
    // a round bead while it hangs, a short streak once it falls
    const len = max(v.mul(R.shutter), r.mul(2));
    const view = normalize(c.sub(cameraPosition));
    const side = normalize(cross(vec3(0, 1, 0), view));
    const w = max(r, length(c.sub(cameraPosition)).mul(R.pixelAngle * 0.5));
    return c.add(vec3(0, aC.y.sub(0.5).mul(len), 0)).add(side.mul(aC.x.mul(w)));
  };
  const dripPos = Fn((builder) => {
    if (builder.needsPreviousData && builder.needsPreviousData()) positionPrevious.assign(dripQuad(U.Tp));
    return dripQuad(U.T);
  })();
  const dNow = dripAt(U.T);
  // the bead: round, a dark rim of wet bar, the sky's glint low in it (inverted)
  const ry = aC.y.sub(0.5).mul(2); // -1 bottom .. 1 top
  const rr = length(vec3(aC.x, ry, 0));
  const round = float(1).sub(smoothstep(0.75, 1.0, rr));
  const glint = float(1).sub(smoothstep(0.0, 0.45, length(vec3(aC.x.mul(1.2), ry.add(0.35), 0))));
  const beadCol = mix(vec3(u.bar), vec3(u.sky).mul(1.1), glint.mul(0.85));
  const beadA = round.mul(0.92);
  // falling: a faint streak like the rain's
  const streakA = float(1).sub(abs(aC.x)).mul(ends).mul(u.cover).mul(1.3);
  const dToLamp = dNow.c.sub(u.lampPos);
  const dLamp = vec3(u.lampCol).mul(smoothstep(u.lampCos, u.lampCos.add(0.08), dot(normalize(dToLamp), u.lampDir))).div(dot(dToLamp, dToLamp).add(0.04));
  const dCol = mix(beadCol, vec3(u.sky), dNow.falling).add(dLamp);
  const dCover = mix(beadA, streakA, dNow.falling).mul(float(1).sub(dNow.gone)).mul(u.wet);
  const dmat = layerMaterial({ colorNode: dCol, opacityNode: dCover, positionNode: dripPos, bloomNode: vec3(u.sky).mul(U.bloom), name: "drips" });
  const drips = new THREE.Mesh(dgeo, dmat);
  drips.name = "gridDrips";
  drips.frustumCulled = false;
  drips.renderOrder = 2;
  group.add(drips);

  const lampCol = new THREE.Color();
  const barCol = new THREE.Color();
  const tmp = new THREE.Vector3();
  let last = null;
  // the gust's delay at the middle of the rain box
  const cx = (x0 + x1) / 2, cz = (z0 + z1) / 2;
  const wrap = (v, s) => ((v % s) + s) % s;

  function update(state, { lampHead, wind } = {}) {
    const sw = state.weather;
    const r = sw?.rain || { active: false, mmh: 0, intensity: 0, wetness: 0 };
    const on = P.outside.rain.enabled && r.active;
    const w = wind || { vecX: 1, vecZ: 0, speed: 0, gust: 0 };
    const adv = Math.max(0.5, ((w.speed ?? 0) / 3.6) * P.outside.wind.advect);
    const along = cx * (w.vecX ?? 0) + cz * (w.vecZ ?? 0);
    const acrossC = -cx * (w.vecZ ?? 0) + cz * (w.vecX ?? 0);
    const tau0 = -along / adv + acrossC * GUST.across;
    // rate: a sqrt of the rain rate (a drizzle still reads as rain), 0.1 .. 1, and
    // gusts thicken it
    const rate = on ? Math.min(1, 0.12 + 0.88 * Math.sqrt(Math.max(r.mmh || 0, (r.intensity || 0) * 8) / R.fullAt)) : 0;
    const g = windGustAt(w, cx, cz, state.time, adv).g;
    const gd = R.gustDensity;
    const n = rate * (1 - gd + gd * g);
    mesh.visible = n > 0.001;
    geo.setDrawRange(0, Math.max(0, Math.round(N * n)) * 6);
    // the drift this frame and the last (wrapped to the box, so it never loses precision)
    const d = driftAt(state.time, w, tau0, R.windFactor);
    const dp = last ? driftAt(last.t, last.w, last.tau0, R.windFactor) : d;
    const sx = x1 - x0, sz = z1 - z0;
    // wrap both by the same whole number of box sizes, so fract() sees the same step
    const kx = Math.floor(d.x / sx) * sx, kz = Math.floor(d.z / sz) * sz;
    u.drift.value.set(d.x - kx, 0, d.z - kz);
    u.driftP.value.set(dp.x - kx, 0, dp.z - kz);
    u.vel.value.set(d.vx, 0, d.vz);
    u.velP.value.set(dp.vx, 0, dp.vz);
    last = { t: state.time, w: { ...w }, tau0 };
    // what a drop shows: about the sky's average (U.skyAmb is that, times the outdoor
    // ambient share)
    const sky = U.skyAmb.value;
    const k = R.radiance;
    u.sky.value.setRGB(sky.r * k, sky.g * k, sky.b * k);
    u.cover.value = R.coverage * (0.85 + 0.15 * rate);
    // a wet bar under the sky: its dark enamel lit by what a bar faces
    barCol.setStyle(P.outside.grid.color, THREE.SRGBColorSpace);
    const bk = (P.outside.grid.ambient ?? 0.25) * 0.5;
    u.bar.value.setRGB(barCol.r * sky.r * bk, barCol.g * sky.g * bk, barCol.b * sky.b * bk);
    // the lamp through the glass, at night it catches the drops by the window
    if (lampHead) {
      lampHead.updateWorldMatrix(true, false);
      lampHead.getWorldPosition(u.lampPos.value);
      u.lampDir.value.copy(tmp.set(0, 0, -1).transformDirection(lampHead.matrixWorld));
      u.lampCos.value = Math.cos(P.lights.lamp.angle);
      lampCol.set(P.lights.lamp.color).multiplyScalar(P.lights.lamp.enabled ? P.lights.lamp.intensity * R.lampGlint : 0);
      u.lampCol.value.copy(lampCol);
    }
    const RN = P.outside.rain.neon || {};
    u.neonShare.value = Math.max(0, Math.min(1, RN.share ?? 0));
    u.neonGain.value = u.neonShare.value > 0 ? RN.gain ?? 1 : 0;
    u.wet.value = P.outside.rain.enabled ? r.wetness ?? 0 : 0;
    drips.visible = u.wet.value > 0.01 && dripBars.length > 0;
  }

  return {
    group,
    update,
    dispose() {
      geo.dispose();
      dgeo.dispose();
      mat.dispose();
      dmat.dispose();
      group.removeFromParent();
    },
  };
}
