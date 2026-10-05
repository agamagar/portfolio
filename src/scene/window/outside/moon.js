// DREAMLIKE ONLY: the real moon moved into the window (30-locked-brief.md).
//
// The engine places the moon on the Living Sky plate at params.sky.moon (az, alt,
// scale) with the true phase and lit limb (skyPlate.js). The plate is 1024 px for
// 120 deg, so its disc is 16 texels across its radius: stretched over 35 px of the
// hero it read as "a porch light through frosted glass" (loop round 2). This module
// draws the moon the plate only sketches, at the same place and size, over it:
//   - THE DISC: a card just inside the halo, facing the window. A crisp limb
//     (antialiased on fwidth), the near side's maria from a map of where they are
//     (Imbrium, Serenitatis, Tranquillitatis, Crisium, Fecunditatis, Nectaris,
//     Nubium, Humorum, Oceanus Procellarum, Frigoris; Tycho and Copernicus bright),
//     lit Lommel-Seeliger style (a full moon is flat, not a shaded ball) from the
//     true phase angle (illuminated fraction) along the true bright-limb angle, the
//     same inputs the plate uses. Normal blending: opaque where lit, so it covers
//     the plate's soft disc; the dark side lets the plate's sky through, with a
//     faint earthshine. Where the plate shows a cloud over the moon (its lit side
//     sampled at three points is no longer moon-bright) the disc fades and the
//     plate's cloud stands in front, as it should.
//   - THE CORONA AND HALO: a large additive card behind the disc: a tight glow at
//     the limb plus a wide faint aureole, brighter where the plate has cloud, and a
//     silver rim on cloud edges that face the moon (the plate's luminance rising
//     away from the moon: the thin moon-facing edge of a cloud is the bright one).
//   - its light on the edges of the bamboo and the grille: U.moonDir and U.moonRim,
//     which every outdoor material reads (common.js outdoorMaterial rim).
//   - DEPTH OF FIELD: the disc writes 0 into the normal target's alpha (every other
//     surface writes 1: a vec3 normal is padded with 1.0), a flag the post can read
//     to keep the disc sharp behind soft bars (the post is the light lane's; until
//     it reads the flag the disc takes the far field's blur like the sky).
// Its strength follows the night and the gloom; visible whenever the moon is up in
// reality, and at night even when it is not (it is a dream), exactly as the engine
// decides the plate's disc.

import * as THREE from "three/webgpu";
import { uv, vec2, vec3, vec4, float, exp, length, texture, positionWorld, normalize, atan, asin, uniform, dot, max, min, mod, mix, smoothstep, sqrt, abs, fwidth, sin, cos, mrt, mx_noise_float } from "three/tsl";
import { glowMaterial, lin, smooth, D2R } from "./common.js";
import { plateUV } from "../skyPlate.js";

// the near side's maria, in disc radii (x to the viewer's right, y up, north up),
// read off a full-moon photograph: [x, y, rx, ry, depth]
const MARIA = [
  [-0.6, 0.05, 0.34, 0.52, 0.8], // Oceanus Procellarum: the broad western (left) sea
  [-0.3, 0.44, 0.3, 0.24, 0.95], // Imbrium
  [0.15, 0.44, 0.19, 0.18, 0.95], // Serenitatis
  [0.36, 0.13, 0.24, 0.2, 0.95], // Tranquillitatis
  [0.73, 0.3, 0.12, 0.1, 1.0], // Crisium
  [0.6, -0.16, 0.15, 0.2, 0.8], // Fecunditatis
  [0.39, -0.3, 0.11, 0.11, 0.75], // Nectaris
  [-0.2, -0.36, 0.2, 0.15, 0.75], // Nubium
  [-0.52, -0.42, 0.11, 0.11, 0.8], // Humorum
  [0.0, 0.76, 0.45, 0.08, 0.6], // Frigoris
  [0.05, 0.2, 0.13, 0.1, 0.7], // Vaporum and Sinus Medii: the neck between the northern seas
  [-0.05, 0.3, 0.14, 0.12, 0.6], // (Imbrium to Serenitatis, joined)
];

// WHERE THE DREAM MOON IS, BY THE HOUR (loop 2, ledger 7.7: "the dream moon is
// static; 21:00 equals 00:00"). The placed moon rides a short arc through the upper
// left pair, set by the real moon's hour angle. params.sky.moon's az is where it
// comes in at the real moonrise, and it drifts west from there (to the left: a
// north window has east on its right), never east of it: a first try centred on
// the transit put the 21:00 moon behind the corner stile between L1 and L2, the
// one place the hero cannot show it. Its alt is where it stands at the real
// transit; it sits lower toward rise and set (a parabola).
// `T` is params.outside.moon.track: degPerHour (bearing it drifts per hour since
// rise), sag (deg lower at `span` hours from transit), span (hours from transit to
// rise or set; past it the moon holds, it is a dream). The hour angle comes from the real
// moon's altitude and azimuth at the sky's own place (sw.place.lat), so it is right
// for "yours" too. With no track (or no real moon) it is params.sky.moon itself.
// ONE place for everything that shows the placed moon: the plate's disc
// (engine.js moonOption), the dome point (engine.js moonWorld, moonCheck), its key
// light (lights.js) and this module's disc, halo and rim all take the same answer;
// the engine computes it once per frame and hands it on as state.moonPlaced.
// T.by = "clock" (2026-09-27, the default): the hours come from the local clock
// around T.center (midnight) instead of the real moon's hour angle. With the hour
// angle, any night the real moon was down (below the horizon for most evenings in
// part of each month) clamped it at the span's end and parked it, so 21:00 equalled
// 00:00. The dream moon is placed anyway (a north window never sees it), so it now
// crosses the upper left pair every night, dusk to dawn; its phase and bright limb
// still come from the real moon.
export function placedMoonAt(M, sw, T) {
  const base = { az: M.az, alt: M.alt, hourAngle: null };
  if (T?.enabled && T.by === "clock" && Number.isFinite(sw?.tod)) {
    const span = Math.max(0.5, T.span ?? 6);
    let hours = sw.tod - (T.center ?? 0);
    hours = ((((hours + 12) % 24) + 24) % 24) - 12; // -12..12 around the centre
    const hc = Math.max(-span, Math.min(span, hours));
    const q = hc / span;
    return { az: M.az - (T.degPerHour ?? 1) * (hc + span), alt: M.alt - (T.sag ?? 5) * q * q, hourAngle: hours };
  }
  if (!T || !T.enabled || !sw?.moon || !Number.isFinite(sw.moon.az) || !Number.isFinite(sw.moon.alt)) return base;
  const lat = (Number.isFinite(sw.place?.lat) ? sw.place.lat : 12.97) * D2R;
  const A = sw.moon.az * D2R, h = sw.moon.alt * D2R;
  // horizontal to hour angle (azimuth from north through east): west of the
  // meridian positive
  const H = Math.atan2(-Math.sin(A) * Math.cos(h), Math.sin(h) * Math.cos(lat) - Math.cos(h) * Math.cos(A) * Math.sin(lat));
  const hours = H / D2R / 15;
  const span = Math.max(0.5, T.span ?? 6);
  const hc = Math.max(-span, Math.min(span, hours));
  const q = hc / span;
  return { az: M.az - (T.degPerHour ?? 1) * (hc + span), alt: M.alt - (T.sag ?? 5) * q * q, hourAngle: hours };
}

export function buildMoon(P, U, ctx) {
  const M = P.outside.moon;
  const group = new THREE.Group();
  group.name = "moonHalo";
  const u = {
    strength: uniform(0),
    col: uniform(lin(M.color)),
    viewAz: uniform(P.sky.view.viewAz),
    fovH: uniform(P.sky.view.fovH),
    aspect: uniform(P.sky.plate.width / P.sky.plate.height),
    // the disc
    disc: uniform(0), // 0..1 how visible (night, gloom)
    discDeg: uniform(1.9), // its angular radius
    limb: uniform(new THREE.Vector2(0, 1)), // toward the bright limb, on the disc (x right, y up)
    cosI: uniform(1), // cos of the phase angle: 2 illum - 1
    bright: uniform(new THREE.Color(1, 1, 1)), // the lit surface at albedo 1, scene units
    moonUV: uniform(new THREE.Vector2(0.5, 0.2)), // its centre on the plate
    probeA: uniform(new THREE.Vector4()), // two plate uv's on its lit side
    probeB: uniform(new THREE.Vector2()), // and a third
    lit: uniform(1), // the illuminated fraction (the corona scales with it)
  };
  const R = M.distance;
  const LUMA = vec3(0.2126, 0.7152, 0.0722);
  const plateAt = (puv) => (ctx.skyTexture ? dot(texture(ctx.skyTexture, puv).rgb, LUMA) : float(0));
  // the plate uv of the direction a fragment of a card faces from the origin (the
  // dome hangs every texel along its own direction from there)
  const plateUvOf = (p) => {
    const d = normalize(p);
    const az = atan(d.x, d.z.negate()).mul(180 / Math.PI);
    const alt = asin(d.y.clamp(-1, 1)).mul(180 / Math.PI);
    const du = mod(az.sub(u.viewAz).add(540), 360).sub(180);
    return vec2(du.div(u.fovH).add(0.5), alt.div(u.fovH.div(u.aspect)));
  };

  // --- the halo and the silver cloud rims (additive, behind the disc) ------------------------
  const half = R * Math.tan(M.extentDeg * D2R);
  const geo = new THREE.PlaneGeometry(2 * half, 2 * half);
  // angular distance from the moon's centre, in degrees (small-angle on the card)
  const rDeg = length(uv().sub(0.5)).mul(2 * M.extentDeg);
  const aureole = exp(rDeg.div(M.aureoleDeg).negate()).mul(M.aureole);
  let cloudy = float(1);
  let silver = float(0);
  if (ctx.skyTexture) {
    const puv = plateUvOf(positionWorld);
    const l = plateAt(puv);
    // moonlit cloud: cloud is brighter than clear sky. Not within two radii of the
    // moon, where the plate's own disc and glow would read as cloud (round 2: that
    // turned the corona into a bright ring), and capped
    cloudy = mix(float(1), min(float(0.55).add(max(l.sub(0.02), 0).mul(M.cloudLift)), 1.8), smoothstep(u.discDeg.mul(1.6), u.discDeg.mul(3.5), rDeg));
    // silver rims: the plate a little way TOWARD the moon is darker than here, so
    // this is a cloud's moon-facing edge (thin, lit from behind: the brightest part)
    const toMoon = u.moonUV.sub(puv).mul(vec2(u.aspect, 1));
    const step = normalize(toMoon.add(vec2(1e-5, 0))).mul(M.rimStepDeg / (P.sky.view.fovH / (P.sky.plate.width / P.sky.plate.height)));
    const lIn = plateAt(puv.add(vec2(step.x.div(u.aspect), step.y)));
    silver = max(l.sub(lIn), 0).mul(exp(rDeg.div(M.rimDeg).negate())).mul(M.silver).mul(smoothstep(u.discDeg.mul(1.2), u.discDeg.mul(2), rDeg));
  }
  const glow = vec3(u.col).mul(aureole.mul(cloudy).add(silver)).mul(u.strength);
  const mat = glowMaterial({ colorNode: glow, bloomNode: glow.mul(M.bloom), name: "moonHalo" });
  mat.depthTest = true;
  const mesh = new THREE.Mesh(geo, mat);
  mesh.name = "moonHaloCard";
  mesh.frustumCulled = false;
  mesh.renderOrder = 0;
  group.add(mesh);

  // --- the disc and its corona ------------------------------------------------------------------
  const DISC_MAX = 4; // deg: the card's half-size (the disc radius stays well under it)
  const Rd = R - 0.4;
  const dHalf = Rd * Math.tan(DISC_MAX * D2R);
  const dGeo = new THREE.PlaneGeometry(2 * dHalf, 2 * dHalf);
  // q: position on the disc in disc radii
  const q = uv().sub(0.5).mul(2 * DISC_MAX).div(u.discDeg);
  const r = length(q);
  const fw = max(fwidth(r), 1e-4);
  const inDisc = smoothstep(float(1), float(1).sub(fw.mul(1.5)), r);
  // the maria, with ragged shores
  const qn = q.add(vec2(mx_noise_float(vec3(q.mul(3.3), 1.7)), mx_noise_float(vec3(q.mul(3.3), 8.9))).mul(0.07));
  let mare = float(0);
  for (const [x, y, rx, ry, dep] of MARIA) {
    const e = length(qn.sub(vec2(x, y)).div(vec2(rx, ry)));
    mare = max(mare, smoothstep(1.15, 0.4, e).mul(dep));
  }
  // highlands: a fine mottle; the rayed craters bright
  const mottle = mx_noise_float(vec3(q.mul(6), 3.1)).mul(0.04).add(mx_noise_float(vec3(q.mul(17), 5.3)).mul(0.025));
  const tv = q.sub(vec2(-0.12, -0.72));
  const tycho = exp(length(tv).div(0.035).negate());
  const rays = abs(sin(atan(tv.y, tv.x).mul(7).add(mx_noise_float(vec3(tv.mul(4), 2.2)).mul(2)))).pow(10).mul(exp(length(tv).div(0.45).negate())).mul(0.12);
  const copernicus = exp(length(q.sub(vec2(-0.3, 0.2))).div(0.03).negate());
  const albedo = float(1).sub(mare.mul(M.mare)).add(mottle).add(tycho.mul(0.35)).add(copernicus.mul(0.25)).add(rays);
  // Lommel-Seeliger: mu0 / (mu0 + mu), normalised to 1 at full
  const nz = sqrt(max(float(1).sub(r.mul(r)), 0));
  const sinI = sqrt(max(float(1).sub(u.cosI.mul(u.cosI)), 0));
  const mu0 = max(q.x.mul(u.limb.x).add(q.y.mul(u.limb.y)).mul(sinI).add(nz.mul(u.cosI)), 0);
  const ls = mu0.mul(2).div(mu0.add(nz).add(1e-3));
  // its light, a touch bluer in the maria (they are).
  // In SCENE units, not through the sky's grade and gain: the plate's gain at night is
  // set so a night sky reads dark (0.08 at 21:00), and the grade's contrast squeezes a
  // moon-bright pixel (it also recolours it as a lit cloud, night blue); the real moon
  // is about 10^5 times the night sky, and a camera exposed for the room clips it, so
  // the disc carries its own level (outside.moon.discBright) and the exposure does the rest
  const tint = mix(vec3(1.0, 0.975, 0.935), vec3(0.93, 0.95, 0.98), mare.mul(0.6));
  const level = u.bright.r;
  const radiance = tint.mul(albedo).mul(ls).mul(level);
  const litA = smoothstep(0.0, 0.18, ls);
  const earth = float(M.earthshine).mul(float(1).sub(litA));
  // is the plate's own moon still moon-bright on its lit side? (else a cloud is in front)
  let clear = float(1);
  if (ctx.skyTexture) {
    const lp = max(max(plateAt(u.probeA.xy), plateAt(u.probeA.zw)), plateAt(u.probeB));
    clear = smoothstep(M.clearAt[0], M.clearAt[1], lp);
  }
  const show = u.disc.mul(clear);
  const alpha = inDisc.mul(max(litA, earth)).mul(show);
  // the corona: a tight glow hugging the limb, in the disc's own light (the moon at
  // albedo 1, fully lit, graded the same way) times how much of it is lit
  const full = vec3(1.0, 0.975, 0.935).mul(level);
  const corona = full.mul(exp(max(r.sub(1), 0).mul(u.discDeg).div(M.coreDeg).negate())).mul(M.corona).mul(u.lit).mul(show).mul(float(1).sub(inDisc));
  // blended as premultiplied colour (One, OneMinusSrcAlpha): over the plate where the
  // disc is (it covers the plate's soft moon), added where only the corona is
  const lit = radiance.add(full.mul(earth).mul(0.02)).mul(inDisc).mul(show);
  const colour = lit.add(corona);
  const dMat = new THREE.MeshBasicNodeMaterial({ transparent: true, depthWrite: false, side: THREE.DoubleSide });
  dMat.blending = THREE.CustomBlending;
  dMat.blendSrc = THREE.OneFactor;
  dMat.blendDst = THREE.OneMinusSrcAlphaFactor;
  dMat.blendSrcAlpha = THREE.OneFactor;
  dMat.blendDstAlpha = THREE.OneMinusSrcAlphaFactor;
  dMat.name = "moonHaloDisc"; // "halo" in the name: engine.js moonCheck sees through it
  // colorNode carries the alpha too (the opacity path would multiply it again)
  dMat.colorNode = vec4(colour, alpha);
  dMat.opacityNode = float(1);
  // skip the card's empty corners (a transparent layer overwrites the MRT targets
  // wherever it draws, so draw only where there is moon or corona)
  dMat.maskNode = alpha.add(dot(corona, LUMA).mul(50)).greaterThan(0.004);
  // the bloom: the moon's, plus about the sky's own share behind it (the targets are
  // overwritten here, not blended); the DOF flag: normal alpha 0 on the disc
  const skyBehind = ctx.skyTexture && ctx.uniforms?.skyGain ? texture(ctx.skyTexture, plateUvOf(positionWorld)).rgb.mul(ctx.uniforms.skyGain).mul(ctx.uniforms.skyBloom ?? 0.12) : vec3(0);
  dMat.mrtNode = mrt({ emissive: colour.mul(M.discBloom).add(skyBehind.mul(float(1).sub(alpha))), normal: vec4(0, 0, 1, float(1).sub(alpha)) });
  dMat.fog = false;
  const disc = new THREE.Mesh(dGeo, dMat);
  disc.name = "moonHaloDisc";
  disc.frustumCulled = false;
  disc.renderOrder = 1;
  group.add(disc);

  const dir = new THREE.Vector3();
  const view = { viewAz: 0, fovH: 120, aspect: 1.6 };
  function update(state) {
    const Mo = P.sky.moon;
    // where it is this hour (placedMoonAt): as the engine placed the plate's disc,
    // else params.sky.moon (an engine that does not track yet keeps them together)
    const mp = state.moonPlaced || Mo;
    const sw = state.weather;
    const placed = Mo.mode === "placed" && P.outside.moon.enabled;
    const sunAlt = sw?.sun?.alt ?? 10;
    // the same visibility the engine gives the disc (engine.js moonOption)
    const above = smooth(-1, 2, sw?.moon?.alt ?? -10);
    const nightAlways = Mo.nightAlways ? 1 - smooth(-8, -2, sunAlt) : 0;
    const vis = Math.max(above, nightAlways);
    // the plate only draws the moon at night; the glow follows the dark
    const night = 1 - smooth(-6, 3, sunAlt);
    const illumRaw = Math.max(0, Math.min(1, sw?.moon?.illum ?? 0.5));
    const illum = Math.pow(illumRaw, 0.7);
    const gloom = sw?.rain?.active ? 0.35 : 1 - 0.5 * Math.max(0, (sw?.cloud?.low ?? 0) - 0.6);
    const k = placed ? vis * night * illum * gloom : 0;
    u.strength.value = k * M.halo;
    view.viewAz = P.sky.view.viewAz;
    view.fovH = P.sky.view.fovH;
    view.aspect = P.sky.plate.width / P.sky.plate.height;
    u.viewAz.value = view.viewAz;
    u.fovH.value = view.fovH;
    u.aspect.value = view.aspect;
    u.col.value.copy(lin(M.color));
    mesh.visible = k > 0.001;
    // the card: out along the placed moon's bearing and altitude, facing the window
    const az = mp.az * D2R, alt = mp.alt * D2R;
    dir.set(Math.sin(az) * Math.cos(alt), Math.sin(alt), -Math.cos(az) * Math.cos(alt));
    mesh.position.copy(dir).multiplyScalar(R);
    mesh.lookAt(0, 0, 0);
    // the disc: the plate's own size (living-sky.frag: radius 0.014 of the plate's
    // height x scale, the height spanning fovH / aspect deg), the true phase and limb
    const dOn = placed && M.disc !== false ? vis * night * (sw?.rain?.active ? 0.2 : 1) : 0;
    u.disc.value = dOn;
    disc.visible = dOn > 0.001 && illumRaw > 0.02;
    const rM = 0.014 * (Mo.scale || 1);
    u.discDeg.value = rM * (view.fovH / view.aspect) * (M.discScale ?? 1);
    disc.position.copy(dir).multiplyScalar(Rd);
    disc.lookAt(0, 0, 0);
    // bright limb: astro.js limbAngle, 0 up, + counterclockwise (to the viewer's left),
    // exactly as skyPlate.js hands it to the plate (u_moonLimb = limbAngle + 90 deg)
    const la = ((sw?.moon?.limbAngle ?? 0) + 90) * D2R;
    u.limb.value.set(Math.cos(la), Math.sin(la));
    u.cosI.value = 2 * illumRaw - 1;
    u.bright.value.setRGB(M.discBright, M.discBright, M.discBright);
    u.lit.value = illumRaw;
    // where the plate's moon is, and three points on its lit side
    const [mu, mv] = plateUV(mp.az, mp.alt, view);
    u.moonUV.value.set(mu, mv);
    // (the plate lights the part of the disc past 1 - 2 illum along the limb axis and
    // softens its own edge from 0.62 of its radius out: the probes sit between)
    const lx = Math.cos(la), ly = Math.sin(la);
    const pa = Math.max(0.2, Math.min(0.7, 1 - illumRaw));
    const at = (a, b2) => [mu + ((lx * a - ly * b2) * rM) / view.aspect, mv + (ly * a + lx * b2) * rM];
    const [a0, a1] = at(pa, 0), [b0, b1] = at(pa * 0.85, 0.3), [c0, c1] = at(pa * 0.85, -0.3);
    u.probeA.value.set(a0, a1, b0, b1);
    u.probeB.value.set(c0, c1);
    // its light on the outdoor edges
    U.moonDir.value.copy(dir);
    U.moonRim.value.copy(u.col.value).multiplyScalar(k * M.rim);
  }

  return {
    group,
    update,
    dispose() {
      geo.dispose();
      mat.dispose();
      dGeo.dispose();
      dMat.dispose();
      group.removeFromParent();
    },
  };
}
