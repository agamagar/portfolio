// The lamp's gobo (SpotLight.map): what the dome shade does to a bare bulb.
//
// A recessed bulb in a 15 cm dome throws a disc with a HARD edge where the rim
// cuts it (13-photo 5: "a crisp diagonal cut-off at its lower left, the shade
// rim's shadow"), brighter toward the middle where the enamelled reflector
// concentrates it, and a little spill past the rim off the dome's lip.
//
// three projects the map through the spot's shadow camera (fov = 2 x angle), so a
// texel at radius r (0 centre, 1 the square's edge) sits at the angle
// atan(r x tan(angle)) off the beam axis: the profile is authored in angles and
// converted, so the rim stays at rimDeg whatever the cone angle is.
//
// Values are normalised to a peak of 1; the light's intensity is the peak. A
// fitted profile (G.profile, [deg, relative] knots) can replace the hot core, and
// an azimuthal lobe (G.lobe) can shape it; the spill toward the stiles is its own
// light with its own map (makeSpillGobo, below), since a single projected map
// cannot reach 85 deg off the axis.

import * as THREE from "three/webgpu";

const D2R = Math.PI / 180;
const smooth = (a, b, x) => {
  const t = Math.max(0, Math.min(1, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
};

// The emission inside the rim, before normalising: a fitted table of
// [deg, relative] knots (G.profile, linear between them) when there is one, else
// the reflector's hot core over an even field.
function inside(G, thetaDeg) {
  const P = G.profile;
  if (Array.isArray(P) && P.length) {
    if (thetaDeg <= P[0][0]) return P[0][1];
    for (let i = 1; i < P.length; i++) {
      if (thetaDeg <= P[i][0]) {
        const t = (thetaDeg - P[i - 1][0]) / Math.max(1e-6, P[i][0] - P[i - 1][0]);
        return P[i - 1][1] + (P[i][1] - P[i - 1][1]) * t;
      }
    }
    return P[P.length - 1][1];
  }
  return 1 + (G.hot - 1) * Math.exp(-Math.pow(thetaDeg / Math.max(1, G.hotDeg), 2));
}
function peakOf(G) {
  const P = G.profile;
  if (Array.isArray(P) && P.length) return Math.max(...P.map((k) => k[1]), 1e-6);
  return G.hot;
}

// Relative intensity at theta (deg) off the axis, peak 1.
export function goboProfile(G, thetaDeg) {
  const core = inside(G, thetaDeg);
  const edge = 1 - smooth(G.rimDeg - G.rimSoftDeg / 2, G.rimDeg + G.rimSoftDeg / 2, thetaDeg);
  const rimV = inside(G, G.rimDeg);
  const v = core * edge + G.spill * rimV * (1 - edge) * Math.exp(-Math.max(0, thetaDeg - G.rimDeg) / 6);
  return v / peakOf(G);
}

// The spill's lobe in azimuth: phi (deg) is the angle around the axis in the
// map's frame (0 = the map's +u, 90 = +v). 1 inside the lobe, `floor` outside,
// a smooth shoulder between.
export function lobeAt(G, phiDeg) {
  const L = G.lobe;
  if (!L) return 1;
  let d = Math.abs((((phiDeg - L.az) % 360) + 540) % 360 - 180);
  const w = 1 - smooth(L.width * 0.5, L.width * 0.5 + (L.soft ?? 30), d);
  return (L.floor ?? 0) + (1 - (L.floor ?? 0)) * w;
}
// how much of the emission at theta is spill (lobed) rather than the symmetric core
function spillWeight(G, thetaDeg) {
  const L = G.lobe;
  return L ? smooth(L.from ?? 40, L.full ?? 55, thetaDeg) : 0;
}

export function makeGobo(G, angleRad) {
  const n = Math.max(32, G.size | 0);
  const data = new Uint8Array(n * n * 4);
  const tanA = Math.tan(Math.min(angleRad, 1.5));
  for (let j = 0; j < n; j++) {
    for (let i = 0; i < n; i++) {
      const x = ((i + 0.5) / n) * 2 - 1, y = ((j + 0.5) / n) * 2 - 1;
      const theta = Math.atan(Math.hypot(x, y) * tanA) / D2R;
      const phi = Math.atan2(y, x) / D2R;
      const sw = spillWeight(G, theta);
      const lobe = 1 - sw + sw * lobeAt(G, phi);
      const v = Math.round(255 * Math.max(0, Math.min(1, goboProfile(G, theta) * lobe)));
      const k = (j * n + i) * 4;
      data[k] = data[k + 1] = data[k + 2] = v;
      data[k + 3] = 255;
    }
  }
  // the emitted flux relative to the peak (sr): the texels' values times the
  // solid angle each covers (the bounce's flux balance reads it)
  let flux = 0;
  const t2 = tanA * tanA, dA = (2 / n) * (2 / n);
  for (let j = 0; j < n; j++) {
    for (let i = 0; i < n; i++) {
      const x = ((i + 0.5) / n) * 2 - 1, y = ((j + 0.5) / n) * 2 - 1;
      const r2 = (x * x + y * y) * t2;
      flux += (data[(j * n + i) * 4] / 255) * (dA * t2) / Math.pow(1 + r2, 1.5);
    }
  }
  const tex = new THREE.DataTexture(data, n, n, THREE.RGBAFormat);
  tex.userData.flux = flux;
  tex.colorSpace = THREE.NoColorSpace;
  tex.wrapS = tex.wrapT = THREE.ClampToEdgeWrapping;
  tex.minFilter = THREE.LinearMipmapLinearFilter;
  tex.magFilter = THREE.LinearFilter;
  tex.generateMipmaps = true;
  tex.needsUpdate = true;
  tex.name = "lampGobo";
  return tex;
}

// A signature of the params the texture depends on (rebuild only when it changes).
export function goboKey(G, angleRad) {
  return [G.rimDeg, G.rimSoftDeg, G.hot, G.hotDeg, G.spill, G.size, JSON.stringify(G.profile ?? null), JSON.stringify(G.lobe ?? null), angleRad.toFixed(4)].join("|");
}

// The spill's gobo: the dome's reflector throws one wide lobe toward the window's
// stiles (the 18:40 glow on L2's hinge stile, 80 deg off the shade's axis), cut by
// the shade's rim. In the spill light's own map (u right, v up, the cone's edge
// at radius 1): a soft disc, brighter low (the hotspot near the rim) than high
// (the glow up by the keyhole), and a hard straight cut on the side the rim
// shades (the diagonal edge at the hotspot's lower left in 5482).
//   S = { size, edge (0..1 radius where the disc starts to fall), xScale (a
//         tall narrow lobe above 1), hotV, midV,
//         midRatio (a ramp from 1 at hotV to midRatio at midV along rampAz deg,
//         90 = up the map), cutAz (deg, the direction of the dark side), cutAt (map
//         units along it), cutSoft, and optionally a second straight cut
//         cut2Az, cut2At, cut2Soft (the rim is a curve: in 5482 its shadow runs
//         straight down the stile's left edge, then turns into the diagonal
//         wedge at the stile's foot; two straight cuts draw both) }
export function makeSpillGobo(S) {
  const n = Math.max(32, S.size | 0);
  const data = new Uint8Array(n * n * 4);
  const ca = Math.cos((S.cutAz * Math.PI) / 180), sa = Math.sin((S.cutAz * Math.PI) / 180);
  const two = Number.isFinite(S.cut2Az) && Number.isFinite(S.cut2At);
  const ca2 = two ? Math.cos((S.cut2Az * Math.PI) / 180) : 0, sa2 = two ? Math.sin((S.cut2Az * Math.PI) / 180) : 0;
  const s2 = S.cut2Soft ?? S.cutSoft;
  // the ramp's direction in the map (deg; 90 = +v, the old vertical ramp; 180 =
  // toward -u: brighter to the right, the reflector throwing more toward R1)
  const ra = ((S.rampAz ?? 90) * Math.PI) / 180, rc = Math.cos(ra), rs = Math.sin(ra);
  let flux = 0;
  for (let j = 0; j < n; j++) {
    for (let i = 0; i < n; i++) {
      const x = ((i + 0.5) / n) * 2 - 1, y = ((j + 0.5) / n) * 2 - 1;
      const r = Math.hypot(x * (S.xScale ?? 1), y); // xScale > 1: a tall, narrow lobe (the stile, not its neighbours)
      const disc = 1 - smooth(S.edge, 1, r);
      const ramp = 1 + (S.midRatio - 1) * smooth(S.hotV, S.midV, x * rc + y * rs);
      let cut = 1 - smooth(S.cutAt - S.cutSoft, S.cutAt + S.cutSoft, x * ca + y * sa);
      if (two) cut *= 1 - smooth(S.cut2At - s2, S.cut2At + s2, x * ca2 + y * sa2);
      const v = Math.max(0, Math.min(1, disc * ramp * cut));
      const k = (j * n + i) * 4;
      data[k] = data[k + 1] = data[k + 2] = Math.round(255 * v);
      data[k + 3] = 255;
      flux += v;
    }
  }
  const tex = new THREE.DataTexture(data, n, n, THREE.RGBAFormat);
  tex.colorSpace = THREE.NoColorSpace;
  tex.wrapS = tex.wrapT = THREE.ClampToEdgeWrapping;
  tex.minFilter = THREE.LinearMipmapLinearFilter;
  tex.magFilter = THREE.LinearFilter;
  tex.generateMipmaps = true;
  tex.needsUpdate = true;
  tex.name = "lampSpillGobo";
  tex.userData.fill = flux / (n * n); // the lit share of the map (the flux estimate reads it)
  return tex;
}

export function spillKey(S, angleRad) {
  return [S.size, S.edge, S.xScale ?? 1, S.hotV, S.midV, S.midRatio, S.rampAz ?? 90, S.cutAz, S.cutAt, S.cutSoft, S.cut2Az, S.cut2At, S.cut2Soft, angleRad.toFixed(4)].join("|");
}
