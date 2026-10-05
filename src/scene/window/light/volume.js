// The air: the lamp's beam and the dust in the room.
//
//   1. A box of air around the lamp's cone (fitted every frame, clipped to
//      params.post.volume.box in W), drawn only in its own low-resolution pass
//      (layer VOLUME_LAYER) with VolumeNodeMaterial:
//      a ray march that gathers every light on that layer (only the lamp: its cone,
//      its gobo rim and its shadow map, so the grille bars cut dark shafts in the
//      beam) through a drifting 3D dust field. Occluded by the scene pass's depth.
//      The daylight through the opening and a lightning flash add their own glow
//      (scatteringEmissiveNode), analytic, without a light of their own.
//   2. Specks: a few hundred motes of dust that catch the beam, lit on the CPU from
//      the lamp's cone (they are tiny and never shadowed, so no light is needed),
//      drawn in the main pass into the emissive target so they glint.
//
// Everything moves as a pure function of the ambient time t, so a capture at ?t=
// is repeatable. 10-r186.md 2.3: webgpu_volume_lighting is the template.

import * as THREE from "three/webgpu";
import {
  Fn,
  uniform,
  vec2,
  vec3,
  float,
  texture3D,
  screenCoordinate,
  interleavedGradientNoise,
  fract,
  max,
  min,
  mrt,
  instancedBufferAttribute,
} from "three/tsl";
import { VOLUME_LAYER } from "./bus.js";

// A tileable value-noise field (fBm, 2 octaves), R8, deterministic from a seed.
function dustField(n = 48, cells = 8, seed = 1741) {
  let a = seed >>> 0;
  const rnd = () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  const lattice = (c) => {
    const L = new Float32Array(c * c * c);
    for (let i = 0; i < L.length; i++) L[i] = rnd();
    return L;
  };
  const oct = [
    { c: cells, L: lattice(cells), w: 0.65 },
    { c: cells * 2, L: lattice(cells * 2), w: 0.35 },
  ];
  const s = (t) => t * t * (3 - 2 * t);
  const data = new Uint8Array(n * n * n);
  let k = 0;
  for (let z = 0; z < n; z++)
    for (let y = 0; y < n; y++)
      for (let x = 0; x < n; x++) {
        let v = 0;
        for (const o of oct) {
          const fx = (x / n) * o.c, fy = (y / n) * o.c, fz = (z / n) * o.c;
          const x0 = Math.floor(fx), y0 = Math.floor(fy), z0 = Math.floor(fz);
          const tx = s(fx - x0), ty = s(fy - y0), tz = s(fz - z0);
          const at = (i, j, l) => o.L[(((l % o.c) * o.c + (j % o.c)) * o.c) + (i % o.c)];
          const x1 = x0 + 1, y1 = y0 + 1, z1 = z0 + 1;
          const c00 = at(x0, y0, z0) * (1 - tx) + at(x1, y0, z0) * tx;
          const c10 = at(x0, y1, z0) * (1 - tx) + at(x1, y1, z0) * tx;
          const c01 = at(x0, y0, z1) * (1 - tx) + at(x1, y0, z1) * tx;
          const c11 = at(x0, y1, z1) * (1 - tx) + at(x1, y1, z1) * tx;
          const c0 = c00 * (1 - ty) + c10 * ty, c1 = c01 * (1 - ty) + c11 * ty;
          v += o.w * (c0 * (1 - tz) + c1 * tz);
        }
        data[k++] = Math.round(255 * Math.max(0, Math.min(1, v)));
      }
  const tex = new THREE.Data3DTexture(data, n, n, n);
  tex.format = THREE.RedFormat;
  tex.minFilter = THREE.LinearFilter;
  tex.magFilter = THREE.LinearFilter;
  tex.wrapS = tex.wrapT = tex.wrapR = THREE.RepeatWrapping;
  tex.unpackAlignment = 1;
  tex.needsUpdate = true;
  return tex;
}

// Halton (2, 3): per-frame dither offsets that TRAA's own jitter averages out.
function halton(i, b) {
  let r = 0, f = 1;
  while (i > 0) {
    f /= b;
    r += f * (i % b);
    i = Math.floor(i / b);
  }
  return r;
}
const HALTON = Array.from({ length: 32 }, (_, i) => [halton(i + 1, 2), halton(i + 1, 3)]);

export function createAir({ scene, P, depthNode }) {
  const W = P.dims.W;
  const V = P.post.volume;
  const u = {
    density: uniform(1),
    dust: uniform(0.5),
    drift: uniform(new THREE.Vector3()),
    scale: uniform(9), // dust field cells per metre (wisps a few cm across, the beam is 20 cm)
    jitter: uniform(new THREE.Vector2()),
    // the daylight through the opening: radiance, the opening's centre, half size
    winL: uniform(new THREE.Color(0, 0, 0)),
    winC: uniform(new THREE.Vector3()),
    winH: uniform(new THREE.Vector2(0.3, 0.3)),
    flash: uniform(new THREE.Color(0, 0, 0)),
  };
  const noise = dustField();

  const mat = new THREE.VolumeNodeMaterial();
  mat.name = "air";
  mat.steps = V.steps;
  mat.transparent = true;
  mat.blending = THREE.AdditiveBlending;
  mat.depthNode = depthNode;
  mat.offsetNode = fract(interleavedGradientNoise(screenCoordinate.add(u.jitter.mul(97))).add(u.jitter.x));
  const density = Fn(([p]) => {
    const q = p.mul(u.scale).add(u.drift);
    const n1 = texture3D(noise, q, 0).r;
    const n2 = texture3D(noise, q.mul(2.7).add(vec3(0.37, 0.11, 0.73)), 0).r;
    const clump = n1.mul(0.65).add(n2.mul(0.35)).mul(2).sub(0.5).max(0);
    return u.density.mul(float(1).sub(u.dust).add(u.dust.mul(clump)));
  });
  mat.scatteringNode = Fn(({ positionRay }) => density(positionRay));
  // daylight in the air: the opening's form factor seen from the sample (a
  // rectangle at z = 0 facing +z), plus the lightning flash, both scaled by the
  // same density so the dust that shows the beam also shows the window
  mat.scatteringEmissiveNode = Fn(({ positionRay }) => {
    const d = positionRay.sub(u.winC);
    const z = max(d.z, 0.0);
    const lat = max(d.xy.abs().sub(u.winH), vec2(0)).length();
    const r2 = z.mul(z).add(lat.mul(lat)).add(0.0004);
    const ff = min(u.winH.x.mul(u.winH.y).mul(4).mul(z).mul(z).div(r2.mul(r2)).mul(1 / Math.PI), 1.0);
    return u.winL.mul(ff).add(u.flash).mul(density(positionRay));
  });
  // a unit box, fitted every frame around the lamp's cone (params.post.volume.box
  // is the room's limit): the march covers only the pixels the beam can be in
  const geo = new THREE.BoxGeometry(1, 1, 1);
  const box = new THREE.Mesh(geo, mat);
  box.name = "air";
  const lim = new THREE.Box3();
  const fit = new THREE.Box3();
  const setLimit = () => {
    const [x0, x1, y0, y1, z0, z1] = P.post.volume.box.map((v) => v * P.dims.W);
    lim.min.set(x0, y0, z0);
    lim.max.set(x1, y1, z1);
  };
  setLimit();
  box.position.copy(lim.getCenter(new THREE.Vector3()));
  box.scale.copy(lim.getSize(new THREE.Vector3()));
  box.layers.disableAll();
  box.layers.enable(VOLUME_LAYER);
  box.frustumCulled = false;
  box.receiveShadow = true;
  box.castShadow = false;
  scene.add(box);

  // --- specks ----------------------------------------------------------------------
  const S = V.specks;
  const count = Math.max(1, S.count | 0);
  const speckMat = new THREE.MeshBasicNodeMaterial();
  speckMat.name = "specks";
  speckMat.blending = THREE.AdditiveBlending;
  speckMat.transparent = true;
  speckMat.depthWrite = false;
  speckMat.fog = false;
  const speckGeo = new THREE.IcosahedronGeometry(1, 0);
  const specks = new THREE.InstancedMesh(speckGeo, speckMat, count);
  specks.name = "specks";
  specks.frustumCulled = false;
  specks.castShadow = specks.receiveShadow = false;
  // per-speck light, written on the CPU each frame; the glint goes to the bloom too
  const speckLight = new THREE.InstancedBufferAttribute(new Float32Array(count * 3), 3);
  speckLight.setUsage(THREE.DynamicDrawUsage);
  const speckNode = instancedBufferAttribute(speckLight, "vec3");
  speckMat.colorNode = speckNode;
  speckMat.mrtNode = mrt({ emissive: speckNode.mul(0.6) });
  scene.add(specks);
  // seeds: a slab in front of the glass where the beam is
  let a = 20260926 >>> 0;
  const rnd = () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  // brightness is a power law (a few bright motes, many faint ones), and the
  // bright ones are a little larger: same-size, same-brightness specks read as a
  // particle preset (art critic, round 2)
  const seeds = Array.from({ length: count }, () => {
    const b = 0.06 + 0.94 * Math.pow(rnd(), 2.6);
    return { x: rnd(), y: rnd(), z: rnd(), ph: rnd() * 6.283, sp: 0.5 + rnd(), b, tw: 1 + 3 * rnd() };
  });
  const m4 = new THREE.Matrix4();
  const q = new THREE.Quaternion();
  const pos = new THREE.Vector3();
  const scl = new THREE.Vector3();
  const tmp = new THREE.Vector3();

  function update({ t, lamp, winLum, winColor, opening, flash, flashColor }) {
    const Vp = P.post.volume;
    box.visible = !!Vp.enabled;
    // the cone's bounding box (apex + a ring at its reach), clipped to the room
    setLimit();
    if (lamp && Vp.fitBeam !== false) {
      const reach = Vp.beamReach ?? 0.4;
      const ang = ((lamp.rimDeg + 6) * Math.PI) / 180;
      const r = Math.tan(Math.min(ang, 1.3)) * reach;
      fit.makeEmpty();
      fit.expandByPoint(lamp.pos);
      for (let k = 0; k < 8; k++) {
        const a = (k / 8) * Math.PI * 2;
        tmp.copy(lamp.pos).addScaledVector(lamp.dir, reach).addScaledVector(lamp.right, Math.cos(a) * r).addScaledVector(lamp.up, Math.sin(a) * r);
        fit.expandByPoint(tmp);
      }
      fit.expandByScalar(0.02);
      fit.intersect(lim);
      if (!fit.isEmpty()) {
        fit.getCenter(box.position);
        fit.getSize(box.scale);
      }
    } else {
      lim.getCenter(box.position);
      lim.getSize(box.scale);
    }
    box.updateMatrixWorld();
    // VolumetricLightingModel scatters 0.01 of the light per metre per unit of
    // density; x 8 makes density 1 a haze you can see in a 20 cm beam
    u.density.value = Vp.density * 8;
    u.dust.value = Vp.dust;
    // the dust drifts slowly, and the air through the ajar leaf carries it
    u.drift.value.set(0.8, 0.3, -0.5).normalize().multiplyScalar(Vp.drift * t * u.scale.value);
    const h = HALTON[(Math.floor(t * 60) >>> 0) % 32];
    u.jitter.value.set(h[0], h[1]);
    const wl = Vp.windowLight * winLum;
    u.winL.value.setRGB(winColor[0] * wl, winColor[1] * wl, winColor[2] * wl);
    if (opening) {
      u.winC.value.copy(opening.center);
      u.winH.value.set(opening.width / 2, opening.height / 2);
    }
    u.flash.value.setRGB(flashColor[0] * flash, flashColor[1] * flash, flashColor[2] * flash);

    // specks: in the slab of the beam, lit by the lamp's cone on the CPU
    specks.visible = !!(Vp.enabled && S.enabled && lamp);
    if (!specks.visible) return;
    const cosRim = Math.cos((lamp.rimDeg * Math.PI) / 180);
    const cosIn = Math.cos(((lamp.rimDeg - 3) * Math.PI) / 180);
    // a look can thin the motes live (the count is fixed at build): the seeds
    // are random, so the first `share` of them are a random subset
    const active = Math.round(count * Math.max(0, Math.min(1, S.share ?? 1)));
    for (let i = 0; i < count; i++) {
      const s = seeds[i];
      if (i >= active) {
        speckLight.setXYZ(i, 0, 0, 0);
        m4.compose(lamp.pos, q, scl.set(1e-6, 1e-6, 1e-6));
        specks.setMatrixAt(i, m4);
        continue;
      }
      // a small region around the lamp's beam: 3 to 32 cm out along it, spread
      // by the square root so the motes are not crowded at the bulb (uniform in
      // distance they packed the first centimetres of the cone, whose cross
      // section is tiny there, into a glittering curtain)
      const d = 0.03 + 0.29 * Math.sqrt(s.z);
      const spread = Math.tan((lamp.rimDeg * Math.PI) / 180) * d * 1.15;
      const ang = s.ph + t * 0.03 * s.sp;
      const rr = Math.sqrt(s.x) * spread;
      pos.copy(lamp.pos)
        .addScaledVector(lamp.dir, d + 0.012 * Math.sin(t * 0.21 * s.sp + s.ph))
        .addScaledVector(lamp.right, Math.cos(ang) * rr + 0.004 * Math.sin(t * 0.37 * s.sp + 2 * s.ph))
        .addScaledVector(lamp.up, Math.sin(ang) * rr + 0.006 * Math.sin(t * 0.17 * s.sp + s.ph) - 0.002 * ((t * 0.02 * s.sp + s.y) % 1));
      tmp.copy(pos).sub(lamp.pos);
      const dist = Math.max(0.02, tmp.length());
      const c = tmp.dot(lamp.dir) / dist;
      const inCone = c <= cosRim ? 0 : c >= cosIn ? 1 : (c - cosRim) / (cosIn - cosRim);
      // a glint when the mote turns its face (flicker), otherwise a dim speck
      const tw = 0.55 + 0.45 * Math.pow(0.5 + 0.5 * Math.sin(t * s.tw + s.ph * 3), 6);
      // the beam's irradiance falls as 1 / d^2 but is not a point at the bulb:
      // the shade's mouth is about 6 cm across (d0), so the nearest motes do not
      // flare
      const d0 = S.nearSoft ?? 0.07;
      const e = (inCone * lamp.intensity * S.gain * s.b * tw * 2.2) / (dist * dist + d0 * d0);
      speckLight.setXYZ(i, lamp.color[0] * e, lamp.color[1] * e, lamp.color[2] * e);
      const size = S.size * (0.55 + 0.9 * Math.sqrt(s.b));
      m4.compose(pos, q, scl.set(size, size, size));
      specks.setMatrixAt(i, m4);
    }
    specks.instanceMatrix.needsUpdate = true;
    speckLight.needsUpdate = true;
  }

  return {
    mesh: box,
    specks,
    uniforms: u,
    material: mat,
    update,
    dispose() {
      scene.remove(box);
      scene.remove(specks);
      geo.dispose();
      mat.dispose();
      noise.dispose();
      speckGeo.dispose();
      speckMat.dispose();
      specks.dispose?.();
    },
  };
}
