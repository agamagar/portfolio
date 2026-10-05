// The far edge of the view (loop 2): what a gap between the street crowns shows.
//
// Before this, a gap between (or through) the street trees showed the bare Living
// Sky plate near the horizon, which the 17:41 grade turns gold, so the canopy wore
// gold dots (ledger 7.2). What is really there, north over a Bangalore street: more
// crowns, the tops of a few mid-rise blocks, all in the low haze that makes a city
// horizon pale; at night the same silhouette dark against the city's own glow, with
// lit windows in it that go out as the night goes on.
//
// One band, a cylinder segment 38.5 m out (inside the sky dome's 40 m, behind the
// horizon trees at 20 to 37 m), drawn transparent and premultiplied over the dome:
//   THE TREELINE  opaque below a noisy crown line (treeTop, deg above the sill's
//                 horizon), with block-topped buildings rising a little over it here
//                 and there; far foliage and pale concrete, lit by the sky and the
//                 low sun, then mostly hazed (haze): at these distances the air, not
//                 the leaf, sets the colour
//   THE HAZE      above the line, a veil of the horizon's own colour that thins with
//                 elevation (veil at the line, e-folding over veilDeg): the pale band
//                 a hazy city horizon has, where the grade had painted gold
//   THE SKYGLOW   at night, light added over the line and the veil: the city's glow
//                 in the low air (U.glowCol, its level falling after 22:00), not a
//                 colour painted over the sky
//   THE WINDOWS   at night, small lit rectangles in the buildings and a few among the
//                 trees, a hashed share of them lit (U.city.x); at the hero's focus
//                 they are soft bokeh
// Angular sizes are what matter here: a block 300 m away 30 m tall stands 5.7 deg
// over the horizon, drawn at 38.5 m with the same angle (the cameras move less than
// a metre, so the parallax this gives up is a few hundredths of a degree).
//
// World frame: metres, x right (east), y up (0 = the sill), -z north (outside).

import * as THREE from "three/webgpu";
import { vec2, vec3, vec4, float, mix, smoothstep, exp, max, dot, fract, sin, floor, abs, atan, sqrt, length, min, positionWorld, cameraPosition, normalLocal, mx_noise_float, texture, mrt, normalize, asin, mod } from "three/tsl";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import { linv, outdoorMaterial, outdoorLensBlur, D2R } from "./common.js";

export function buildHorizon(P, U, ctx = {}) {
  const Hz = P.outside.horizon;
  const group = new THREE.Group();
  group.name = "horizon";
  if (!Hz || !Hz.enabled) return { group, update() {}, dispose() {}, stats: {} };

  const R = Hz.radius;
  const [az0, az1] = Hz.bearing;
  const [e0, e1] = Hz.elev;
  // (params.quality low: half the segments; the band is smooth, its detail is in the shader)
  const nA = P.quality === "low" ? 72 : 144, nE = P.quality === "low" ? 10 : 14;
  const pos = [], idx = [];
  for (let j = 0; j <= nE; j++) {
    const e = e0 + ((e1 - e0) * j) / nE;
    for (let i = 0; i <= nA; i++) {
      const a = (az0 + ((az1 - az0) * i) / nA) * D2R;
      pos.push(R * Math.sin(a), R * Math.tan(e * D2R), -R * Math.cos(a));
    }
  }
  for (let j = 0; j < nE; j++)
    for (let i = 0; i < nA; i++) {
      const a = j * (nA + 1) + i, b = a + 1, c = a + nA + 1, d = c + 1;
      idx.push(a, c, b, b, c, d);
    }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  geo.setIndex(idx);
  geo.computeVertexNormals();
  geo.computeBoundingSphere();

  // --- where a fragment is: bearing and elevation (deg) from the window ---------------------
  const pw = positionWorld;
  const hd = sqrt(pw.x.mul(pw.x).add(pw.z.mul(pw.z)));
  const el = atan(pw.y, hd).mul(180 / Math.PI);
  const az = atan(pw.x, pw.z.negate()).mul(180 / Math.PI);

  // --- the silhouette ------------------------------------------------------------------------
  const [t0, t1] = Hz.treeTop;
  const big = mx_noise_float(vec3(az.mul(0.07), 0.5, 1.3)).mul(0.5).add(0.5); // stands of trees, about 15 deg across
  const crowns = abs(mx_noise_float(vec3(az.mul(0.62), 2.1, 4.7))); // single crowns, about 1.5 deg
  const twigs = mx_noise_float(vec3(az.mul(3.1), el.mul(3.1), 7.7)).mul(0.12); // a ragged edge
  const treeLine = float(t0).add(big.mul(t1 - t0)).add(crowns.mul(Hz.crownDeg)).add(twigs);
  // buildings: some bearing segments carry a block with a flat roof over the trees
  const segW = Hz.blockDeg;
  const seg = floor(az.div(segW));
  const hs = fract(sin(seg.mul(91.345).add(17.1)).mul(43758.5453));
  const isBlock = smoothstep(1 - Hz.blocks - 0.01, 1 - Hz.blocks + 0.01, hs);
  const inSeg = fract(az.div(segW));
  const blockW = float(0.35).add(fract(hs.mul(13.7)).mul(0.45)); // the block's share of its segment
  const inBlock = smoothstep(0, 0.02, inSeg.sub(float(0.5).sub(blockW.mul(0.5)))).mul(smoothstep(0, 0.02, float(0.5).add(blockW.mul(0.5)).sub(inSeg))).mul(isBlock);
  const blockTop = float(Hz.blockTop[0]).add(fract(hs.mul(7.1)).mul(Hz.blockTop[1] - Hz.blockTop[0]));
  const top = max(treeLine, mix(float(-90), blockTop, inBlock));
  // the block shows where it stands out of the trees: from a little under the crown
  // line up to its roof (lower down, the trees in front of it hide it)
  const isBld = inBlock.mul(smoothstep(treeLine.sub(0.05), treeLine.add(0.05), blockTop)).mul(smoothstep(treeLine.sub(0.35), treeLine.add(0.05), el));
  // soft on about 0.12 deg (the lens and the DOF blur it far more anyway)
  const solid = float(1).sub(smoothstep(top.sub(0.06), top.add(0.06), el));

  // --- the silhouette's colour by day -----------------------------------------------------------
  const fol = mx_noise_float(vec3(az.mul(1.3), el.mul(1.3), 3.3)).mul(0.5).add(0.5);
  const treeAlb = linv(Hz.treeColor).mul(float(0.75).add(fol.mul(0.5)));
  // storeys: faint floor bands on the blocks
  const floorsB = smoothstep(0.75, 0.9, fract(el.div(Hz.storeyDeg))).mul(0.25);
  const bldAlb = linv(Hz.blockColor).mul(float(1).sub(floorsB)).mul(float(0.85).add(fract(hs.mul(3.3)).mul(0.3)));
  const alb = mix(treeAlb, bldAlb, isBld);
  // lit by the sky (a vertical surface sees about half of it) and the low sun (a
  // wrapped term: at this distance only the side toward the sun matters)
  const sunSide = dot(normalize(vec3(pw.x, 0, pw.z)).negate(), U.sunDir).mul(0.5).add(0.5);
  const lit = alb.mul(vec3(U.skyAmb).mul(Hz.ambient).add(vec3(U.farSun).mul(sunSide.mul(Hz.sun))));
  // aerial haze toward the horizon's own colour, less by night (the city's air is
  // lit by the glow instead, added below)
  const hazeK = float(Hz.haze).mul(float(1).sub(U.city.w.mul(0.35)));
  const surface = mix(lit, vec3(U.hazeCol), hazeK);

  // --- the veil above it ------------------------------------------------------------------------
  const above = max(el.sub(top), 0);
  const veil = float(Hz.veil).mul(exp(above.div(Hz.veilDeg).negate())).mul(float(1).sub(solid));
  const veilCol = vec3(U.hazeCol).mul(vec3(...Hz.veilTint)).mul(Hz.veilGain);

  // --- the city's glow (night) --------------------------------------------------------------------
  const glowShape = exp(max(el.sub(Hz.glowFrom), 0).div(Hz.glowDeg).negate());
  const glow = vec3(U.glowCol).mul(glowShape).mul(mix(float(1), float(Hz.glowOnSolid), solid));

  // --- lit windows (night) ------------------------------------------------------------------------
  // Each lit window is drawn as the lens would show it: a far point of light 38.5 m
  // (really hundreds of metres) out blurs to a disc about outdoorLensBlur across at
  // the hero's focus (0.4 deg; the post's depth of field gives it only about half of
  // that), so the window's light is spread over a disc of that radius (capped inside
  // its cell), energy kept, and at the sharp framings it stays a small rectangle.
  const W = Hz.windows;
  const cell = vec2(az.div(W.cellDeg[0]), el.div(W.cellDeg[1]));
  const ci = floor(cell);
  const cf = fract(cell);
  const dDeg = cf.sub(0.5).mul(vec2(W.cellDeg[0], W.cellDeg[1])); // deg from the cell's centre
  const hw = vec2(W.size[0] / 2, W.size[1] / 2);
  const blurR = min(outdoorLensBlur(U, float(R)).mul(90 / Math.PI), Math.min(W.cellDeg[0], W.cellDeg[1]) * 0.45); // radius, deg
  const discR = max(blurR, Math.max(W.size[0], W.size[1]) / 2);
  const disc = float(1).sub(smoothstep(discR.mul(0.7), discR, length(dDeg)));
  const areaK = float((W.size[0] * W.size[1]) / Math.PI).div(discR.mul(discR));
  const h1 = fract(sin(dot(ci, vec2(12.9898, 78.233))).mul(43758.5453));
  const h2 = fract(h1.mul(9.17).add(0.31));
  const h3 = fract(h1.mul(31.7).add(0.77));
  // in a block below its roof, or (a few cells) among the trees under the crown line:
  // a house's window seen through the leaves
  const inB = isBld.mul(float(1).sub(smoothstep(blockTop.sub(0.3), blockTop.sub(0.15), el)));
  const inT = float(1).sub(isBld).mul(float(1).sub(smoothstep(treeLine.sub(0.9), treeLine.sub(0.4), el))).mul(float(1).sub(smoothstep(W.amongTrees - 0.01, W.amongTrees + 0.01, h3)));
  const where = max(inB, inT).mul(solid);
  const onW = smoothstep(h1.sub(0.01), h1.add(0.01), U.city.x.mul(W.density));
  const rect = float(1).sub(smoothstep(hw.x.mul(0.8), hw.x, abs(dDeg.x))).mul(float(1).sub(smoothstep(hw.y.mul(0.8), hw.y, abs(dDeg.y))));
  // the rectangle while the lens keeps it sharp, the lens's disc (same light) once it does not
  const shape = mix(rect, disc.mul(areaK.min(1)), smoothstep(hw.x.mul(1.2), hw.x.mul(2.2), blurR));
  const wTone = mix(linv(W.warm), linv(W.cool), smoothstep(0.5, 0.52, h2));
  const windows = wTone.mul(shape).mul(onW).mul(where).mul(U.city.w).mul(U.lightGain.mul(W.level)).mul(float(0.55).add(h2.mul(0.9)));

  // --- premultiplied out ------------------------------------------------------------------------------
  // (the dome behind is opaque sky; One, OneMinusSrcAlpha: this covers it where the
  // silhouette is, veils it above, and adds the glow and the windows as light)
  const alpha = solid.add(veil).clamp(0, 1);
  const rgb = surface.mul(solid).add(veilCol.mul(veil)).add(glow).add(windows);
  const mat = new THREE.MeshBasicNodeMaterial({ transparent: true, depthWrite: false, side: THREE.DoubleSide });
  mat.name = "horizonBand";
  mat.blending = THREE.CustomBlending;
  mat.blendSrc = THREE.OneFactor;
  mat.blendDst = THREE.OneMinusSrcAlphaFactor;
  mat.blendSrcAlpha = THREE.OneFactor;
  mat.blendDstAlpha = THREE.OneMinusSrcAlphaFactor;
  mat.colorNode = vec4(rgb, alpha);
  mat.opacityNode = float(1);
  // only where there is something to draw: a transparent layer overwrites the MRT
  // targets wherever it draws (common.js layerMRT)
  mat.maskNode = alpha.add(dot(glow.add(windows), vec3(0.2126, 0.7152, 0.0722)).mul(400)).greaterThan(0.002);
  // the bloom: this layer's own share, the windows a little more, plus the sky's own
  // share behind it where it only veils (the target is overwritten, not blended)
  let skyBehind = vec3(0);
  if (ctx.skyTexture && ctx.uniforms?.skyGain) {
    const V = P.sky.view;
    const aspect = P.sky.plate.width / P.sky.plate.height;
    const d = normalize(pw);
    const pa = atan(d.x, d.z.negate()).mul(180 / Math.PI);
    const pe = asin(d.y.clamp(-1, 1)).mul(180 / Math.PI);
    const du = mod(pa.sub(V.viewAz).add(540), 360).sub(180);
    const puv = vec2(du.div(V.fovH).add(0.5), max(pe, 0).div(V.fovH / aspect));
    skyBehind = texture(ctx.skyTexture, puv).rgb.mul(ctx.uniforms.skyGain).mul(ctx.uniforms.skyBloom ?? 0.12);
  }
  mat.mrtNode = mrt({ emissive: rgb.mul(U.bloom).add(windows.mul(W.bloom)).add(skyBehind.mul(float(1).sub(alpha))) });
  mat.fog = false;
  const mesh = new THREE.Mesh(geo, mat);
  mesh.name = "horizonBand";
  mesh.frustumCulled = false;
  mesh.castShadow = false;
  mesh.receiveShadow = false;
  // first among the see-through layers (its object origin is the window, so a sort by
  // distance would draw it last, over the rain and the motes in front of it)
  mesh.renderOrder = -2;
  // never in a raycast: it is air and distance, not something between the camera
  // and the moon or the lamp (engine.js moonCheck reported the placed moon
  // "blockedBy: horizonBand" at every hour until this)
  mesh.raycast = () => {};
  group.add(mesh);
  const owned = [geo, mat];

  // --- the street lights: poles and heads --------------------------------------------------------
  // A cobra head on a 6 m pole at the far kerb, its arm out over the road. From a
  // first-floor window its lit underside is seen nearly edge-on: a thin bright bar
  // that the depth of field turns to a soft bokeh bar; by day a grey housing among
  // the crowns. Their light on things is common.js streetLight (U.poles).
  const S = P.outside.city?.street;
  if (S?.heads && Array.isArray(S.poles) && S.poles.length) {
    const G = P.outside.ground.y;
    const poleParts = [], headParts = [];
    for (const [bearing, dist, y] of S.poles) {
      const hx = Math.sin(bearing * D2R) * dist, hz = -Math.cos(bearing * D2R) * dist;
      // the pole stands behind the head, away from the house (the arm reaches back toward it)
      const back = new THREE.Vector3(hx, 0, hz).normalize().multiplyScalar(S.arm);
      const px = hx + back.x, pz = hz + back.z;
      const pole = new THREE.CylinderGeometry(0.05, 0.07, y - G + 0.1, 6);
      pole.translate(px, (y + G) / 2 + 0.05, pz);
      poleParts.push(pole);
      const arm = new THREE.CylinderGeometry(0.03, 0.03, S.arm, 5);
      arm.rotateZ(Math.PI / 2);
      arm.rotateY(Math.atan2(back.x, back.z) + Math.PI / 2);
      arm.translate(hx + back.x / 2, y + 0.08, hz + back.z / 2);
      poleParts.push(arm);
      const head = new THREE.BoxGeometry(0.22, 0.09, 0.62);
      head.rotateY(Math.atan2(back.x, back.z));
      head.translate(hx, y, hz);
      headParts.push(head);
    }
    const poleGeo = mergeGeometries(poleParts);
    const headGeo = mergeGeometries(headParts);
    for (const g of [...poleParts, ...headParts]) g.dispose();
    const poleMat = outdoorMaterial(U, { kind: "lambert", albedo: linv(S.poleColor), ambient: 0.8, sun: 1, name: "streetPoles" });
    const poleMesh = new THREE.Mesh(poleGeo, poleMat);
    poleMesh.name = "streetPoles";
    // the lit underside: the light's own colour at headLevel x the street strength;
    // the housing's other faces grey (and lit by the sky like the poles)
    const under = float(1).sub(smoothstep(-0.8, -0.3, normalLocal.y));
    const housing = linv(S.poleColor).mul(vec3(U.skyAmb).mul(0.8));
    const headCol = mix(housing, vec3(U.streetCol).mul(S.headLevel), under);
    const headMat = new THREE.MeshBasicNodeMaterial();
    headMat.name = "streetHeads";
    const dist = positionWorld.sub(cameraPosition).length();
    const hf = float(1).sub(exp(dist.div(U.hazeDist).negate())).clamp(0, 0.97);
    const headOut = mix(headCol, vec3(U.hazeCol), hf);
    headMat.colorNode = headOut;
    headMat.mrtNode = mrt({ emissive: headOut.mul(under.mul(S.headBloom).add(U.bloom)) });
    headMat.fog = false;
    const headMesh = new THREE.Mesh(headGeo, headMat);
    headMesh.name = "streetHeads";
    for (const m of [poleMesh, headMesh]) {
      m.castShadow = false;
      m.receiveShadow = false;
      group.add(m);
      owned.push(m.geometry, m.material);
    }
  }

  return {
    group,
    update() {},
    stats: { triangles: idx.length / 3, poles: S?.heads ? S.poles?.length ?? 0 : 0 },
    dispose() {
      for (const o of owned) o.dispose();
      group.removeFromParent();
    },
  };
}
