// The rest of the view: the street trees across the road (the "dense bright
// yellow-green foliage at and just above the horizon, small leaves in soft clumps"
// that fills the left pair's row C at 17:41), the larger trees behind them on the
// horizon, the sunlit cream building face with its red-orange patch that the
// handle leaf's panes see, the compound wall, the road and the ground.
//
// Photo evidence (13-photo 9, measured on ref_full_srgb.png from the chair):
//   - the canopy's top edge sits 6 to 10 deg above the horizon through the left pair
//     (image y 1790 to 2100 against the horizon at 2537, focal 3960 px), so crowns
//     at 10 to 16 m top out 1 to 2.5 m above the sill
//   - through R1 row B: a cream building face lit by the low western sun, with a
//     vertical red-orange patch (about 0.25 x 0.6 W as seen, 1.4 x 3.4 deg)
// At p = 0 the camera, 32 cm from the glass and 2.4 W above the sill, looks down
// to about -34 deg through row C, so the ground, the road and the crowns' lower
// halves are seen too: the street trees' crowns hang low over the road.
//
// Crowns are clouds of "leaf clump" cards: each card's outline is a cluster of
// small leaves cut analytically in TSL (a 2D cellular pattern inside a soft round
// clump), and its vertex normals are bent toward the crown's own sphere, so a
// crown shades as one soft volume (lit side, shadow side) while its edge breaks up
// into small leaves. They sway with the same wind as the bamboo, at a third of its
// amplitude (they are bigger and stiffer). Far things are in metres.
//
// LOOP 2 ("the canopy carries painted gold dots that jump in motion"): the holes
// between a crown's leaf clumps showed the sky behind it, and at 17:41 the sky near
// the horizon is graded gold, so every hole was a gold dot; the clumps' 20 Hz card
// flutter and a 5.5 Hz shimmer made the dots and the cells jump every frame. A real
// street crown seen from 10 m is many leaves deep: a gap shows the crown's own
// shaded inside, the sky only at the silhouette. So each crown now has a CORE, a
// lumpy shaded ellipsoid at `core` of its radii inside the clump cards (one merged
// mesh, one draw call, swaying with its tree), the clumps no longer flutter as
// rigid cards (a clump of leaves does not vibrate; its branch sways at about 1 Hz,
// windOffset's branch term), and the shimmer comes only with a gust. The horizon
// trees (20 to 37 m) are softened into the haze: flat clumps, extra aerial haze
// (farTrees.haze), no shimmer. What shows between the crowns is the horizon band
// (outside/horizon.js), not the bare sky.

import * as THREE from "three/webgpu";
import { uv, vec2, vec3, float, mix, smoothstep, length, vertexColor, mx_worley_noise_float, mx_noise_float, attribute, positionWorld, cameraPosition, max, min, sin, fract, floor, uniform } from "three/tsl";
import { GeoBuilder, tube, outdoorMaterial, outdoorLensBlur, windPositionNode, windGustNode, lin, linv, D2R } from "./common.js";

const V3 = (x = 0, y = 0, z = 0) => new THREE.Vector3(x, y, z);
const polar = (bearing, dist, y = 0) => V3(Math.sin(bearing * D2R) * dist, y, -Math.cos(bearing * D2R) * dist);

// The crown's shaded inside: a lumpy ellipsoid at spec.core of the crown's radii,
// flattened underneath like the cards, in the crown's colour darkened to coreDark
// (the inside of a crown is lit only through the leaves above it). Every vertex
// carries its tree's wind attributes, so it sways with the cards around it.
function crownCore(gb, tree, spec, far) {
  const { c, rx, ry, rz, trunk, H, phase, colA, colB } = tree;
  const k = spec.core ?? 0.8;
  const nLat = 8, nLon = 14;
  const dark = spec.coreDark ?? 0.5;
  // the leaves the inside is seen through are the crown's own, young and old: its
  // colour leans coreWarm of the way to the crown's light (yellower) colour, which
  // the gold dots had been standing in for (17:41 row C: b* 12 in the photo)
  const cw = spec.coreWarm ?? 0;
  const col = [(colA.r + (colB.r - colA.r) * cw) * dark, (colA.g + (colB.g - colA.g) * cw) * dark, (colA.b + (colB.b - colA.b) * cw) * dark];
  const base = gb.n;
  for (let i = 0; i <= nLat; i++) {
    const th = (i / nLat) * Math.PI; // 0 at the top
    for (let j = 0; j <= nLon; j++) {
      const ph = (j / nLon) * Math.PI * 2;
      const sx = Math.sin(th) * Math.cos(ph), sy = Math.cos(th), sz = Math.sin(th) * Math.sin(ph);
      // a few low harmonics: the crown's big clumps bulge
      const lump = 1 + 0.09 * Math.sin(3 * ph + phase) * Math.sin(2 * th) + 0.06 * Math.cos(5 * ph + 2 * phase) * Math.sin(th);
      const yy = sy < 0 ? sy * 0.8 : sy;
      const p = V3(c.x + sx * rx * k * lump, c.y + yy * ry * k * lump, c.z + sz * rz * k * lump);
      const n = V3(sx / rx, yy / ry, sz / rz).normalize();
      const s = Math.max(0.05, (p.y - trunk.y) / H);
      gb.vert({ p: [p.x, p.y, p.z], n: [n.x, n.y, n.z], uv: [j / nLon, 1 - i / nLat], aW0: [trunk.x, trunk.z, H, phase], aW1: [s, spec.stiff, 0, 0], aW2: [0, 0, 0, 0], color: col, aF: [far ? 1 : 0] });
    }
  }
  const row = nLon + 1;
  for (let i = 0; i < nLat; i++)
    for (let j = 0; j < nLon; j++) {
      const a = base + i * row + j, b = a + 1, cc = a + row, d = cc + 1;
      // outward-facing (counter-clockwise seen from outside)
      gb.tri(a, b, cc);
      gb.tri(b, d, cc);
    }
}

function crownCards(gb, tree, rnd, spec) {
  const { c, rx, ry, rz, trunk, H, phase, colA, colB, cardSize, count } = tree;
  const n = count;
  const tmp = new THREE.Color();
  for (let i = 0; i < n; i++) {
    // biased toward the crown's skin, where the light and the silhouette are
    let q;
    do q = V3(rnd() * 2 - 1, rnd() * 2 - 1, rnd() * 2 - 1);
    while (q.lengthSq() > 1);
    const rr = Math.pow(q.length(), 0.45) / Math.max(1e-3, q.length());
    q.multiplyScalar(rr);
    // flatten the underside a little (crowns are domes over their branches)
    if (q.y < 0) q.y *= 0.8;
    const p = V3(c.x + q.x * rx, c.y + q.y * ry, c.z + q.z * rz);
    const sph = V3(q.x / rx, q.y / ry, q.z / rz).normalize();
    const nrm = sph.clone().add(V3(rnd() - 0.5, rnd() - 0.5, rnd() - 0.5).multiplyScalar(0.9)).normalize();
    const ref = Math.abs(nrm.y) < 0.9 ? V3(0, 1, 0) : V3(1, 0, 0);
    const e1 = V3().crossVectors(nrm, ref).normalize();
    const e2 = V3().crossVectors(nrm, e1).normalize();
    const rot = rnd() * Math.PI * 2;
    const a1 = e1.clone().multiplyScalar(Math.cos(rot)).addScaledVector(e2, Math.sin(rot));
    const a2 = V3().crossVectors(nrm, a1).normalize();
    const sz = cardSize * (0.7 + rnd() * 0.6);
    // shading normal: mostly the crown's sphere, a little the card's own
    const sn = sph.clone().multiplyScalar(0.75).addScaledVector(nrm, 0.25).normalize();
    // colour: sunlit tops yellower, the inside darker
    const depth = 1 - Math.min(1, q.length());
    const topness = Math.max(0, q.y) * 0.5 + 0.5;
    tmp.copy(colA).lerp(colB, Math.min(1, rnd() * 0.7 + topness * 0.45));
    const dark = 1 - depth * 0.55;
    const col = [tmp.r * dark, tmp.g * dark, tmp.b * dark];
    const s = Math.max(0.05, (p.y - trunk.y) / H);
    const seed = rnd() * 50;
    const ids = [];
    for (const [u, v] of [
      [0, 0],
      [1, 0],
      [0, 1],
      [1, 1],
    ]) {
      const pp = p.clone().addScaledVector(a1, (u - 0.5) * sz).addScaledVector(a2, (v - 0.5) * sz);
      ids.push(
        gb.vert({
          p: [pp.x, pp.y, pp.z],
          n: [sn.x, sn.y, sn.z],
          uv: [u, v],
          aW0: [trunk.x, trunk.z, H, phase],
          aW1: [s, spec.stiff, rnd() * 6.28, sz * 0.5],
          aW2: [seed, 0.5 + 0.5 * v, sz * spec.flutter, 1],
          color: col,
          aF: [tree.kind === "far" ? 1 : 0],
        }),
      );
    }
    gb.quad(ids[0], ids[1], ids[2], ids[3]);
  }
}

// trunk and a few limbs into the crown (seen through the gaps)
function limbs(gb, tree, rnd, col) {
  const { c, ry, trunk, H, phase } = tree;
  const base = V3(trunk.x, trunk.y, trunk.z);
  const fork = V3(c.x + (rnd() - 0.5) * 0.4, c.y - ry * 0.55, c.z + (rnd() - 0.5) * 0.4);
  const attrs = (p) => ({ aW0: [trunk.x, trunk.z, H, phase], aW1: [Math.max(0, (p.y - trunk.y) / H), 2.2, 0, 0], aW2: [0, 0, 0, 0], color: col });
  const pts = [];
  for (let i = 0; i <= 6; i++) pts.push(base.clone().lerp(fork, i / 6).add(V3((rnd() - 0.5) * 0.12, 0, (rnd() - 0.5) * 0.12)));
  const r0 = tree.trunkR;
  tube(gb, pts, (i) => r0 * (1 - 0.3 * (i / 6)), 6, (i) => attrs(pts[i]));
  const nl = 3 + Math.floor(rnd() * 2);
  for (let l = 0; l < nl; l++) {
    const a = (l / nl) * Math.PI * 2 + rnd() * 0.8;
    const end = V3(c.x + Math.cos(a) * tree.rx * (0.55 + rnd() * 0.3), c.y + (rnd() * 0.8 - 0.1) * ry, c.z + Math.sin(a) * tree.rz * (0.55 + rnd() * 0.3));
    const mid = fork.clone().lerp(end, 0.5).add(V3(0, 0.25 * ry, 0));
    const lp = [];
    for (let i = 0; i <= 5; i++) {
      const t = i / 5;
      lp.push(V3().addScaledVector(fork, (1 - t) * (1 - t)).addScaledVector(mid, 2 * t * (1 - t)).addScaledVector(end, t * t));
    }
    tube(gb, lp, (i) => r0 * 0.45 * (1 - 0.8 * (i / 5)), 5, (i) => attrs(lp[i]));
  }
}

export function buildFarTrees(P, U, rnd, { chair } = {}) {
  const O = P.outside;
  const ground = O.ground.y;
  const group = new THREE.Group();
  group.name = "farTrees";
  const disposables = [];

  // --- trees -----------------------------------------------------------------------------
  // aF: 0 for a street tree, 1 for a horizon tree (how much of the haze it takes)
  const cardGB = new GeoBuilder({ aW0: 4, aW1: 4, aW2: 4, color: 3, aF: 1 });
  const coreGB = new GeoBuilder({ aW0: 4, aW1: 4, aW2: 4, color: 3, aF: 1 });
  const woodGB = new GeoBuilder({ aW0: 4, aW1: 4, aW2: 4, color: 3 });
  const NC = O.canopy;
  const FT = O.farTrees;
  const woodCol = lin(NC.wood);
  const trees = [];
  const plant = (bearing, dist, spec, kind) => {
    const rx = spec.radius[0] + rnd() * (spec.radius[1] - spec.radius[0]);
    const ry = rx * (spec.squash[0] + rnd() * (spec.squash[1] - spec.squash[0]));
    const top = spec.top[0] + rnd() * (spec.top[1] - spec.top[0]);
    const c = polar(bearing, dist, top - ry);
    const trunk = V3(c.x + (rnd() - 0.5) * 0.6, ground, c.z + (rnd() - 0.5) * 0.6);
    const H = top - ground;
    const vol = rx * rx * ry;
    const colA = lin(spec.colors[Math.floor(rnd() * spec.colors.length)]);
    const colB = lin(spec.light);
    trees.push({
      kind,
      c,
      rx,
      ry,
      rz: rx * (0.85 + rnd() * 0.3),
      trunk,
      H,
      phase: rnd() * 6.28,
      colA,
      colB,
      cardSize: spec.card,
      count: Math.min(Math.round(spec.maxCards * (O.canopy.quality?.[P.quality || "high"] ?? 1)), Math.round(spec.cardsPerM3 * vol)),
      trunkR: spec.trunk,
    });
  };
  // the street trees across the road
  for (let i = 0; i < NC.count; i++) {
    const b = NC.bearing[0] + ((NC.bearing[1] - NC.bearing[0]) * (i + 0.2 + rnd() * 0.6)) / NC.count;
    plant(b, NC.distance[0] + rnd() * (NC.distance[1] - NC.distance[0]), NC, "near");
  }
  // the larger trees behind, on the horizon
  for (let i = 0; i < FT.count; i++) {
    const b = FT.bearing[0] + ((FT.bearing[1] - FT.bearing[0]) * (i + rnd())) / FT.count;
    plant(b, FT.distance[0] + rnd() * (FT.distance[1] - FT.distance[0]), FT, "far");
  }
  for (const t of trees) {
    const spec = t.kind === "near" ? NC : FT;
    crownCards(cardGB, t, rnd, spec);
    // (params.quality low: only the street trees get a core; the horizon trees are
    // flat hazy clumps whose gaps show the horizon band's treeline anyway)
    if ((spec.core ?? 0) > 0 && !(t.kind === "far" && P.quality === "low")) crownCore(coreGB, t, spec, t.kind === "far");
    if (t.kind === "near") limbs(woodGB, t, rnd, [woodCol.r, woodCol.g, woodCol.b]);
  }

  const treePos = windPositionNode(U, O.canopy.sway);
  // a clump of small leaves: 2D cells inside a soft round outline
  const cuv = uv().sub(0.5).mul(2);
  const r = length(cuv);
  const aW0 = attribute("aW0", "vec4");
  const aW1 = attribute("aW1", "vec4");
  const seed = attribute("aW2", "vec4").x;
  const cells = mx_worley_noise_float(uv().mul(vec2(NC.leafCells, NC.leafCells * 0.62)).add(vec2(seed, seed.mul(1.37))));
  // THE LENS (loop round 2, the close-ups: "sharp-edged green and white camouflage
  // patches" where the photos show a soft mass). The part of a real lens's blur the
  // post's depth of field cannot give a point this far out (common.js
  // outdoorLensBlur), as a radius in leaf cells on this card (its size is 2 aW1.w):
  // past about half a cell the leaves' own light and dark are gone in a photo, so
  // the card's colour flattens to the clump's mean and its gaps close a little (a
  // blurred gap reads as leaf and sky mixed). The mask keeps its leafy outline:
  // turning the cards solid showed their 0.9 m discs as giant flat leaves (tried in
  // round 2). Zero where the DOF already blurs enough.
  const camDist = positionWorld.sub(cameraPosition).length();
  const cellM = aW1.w.mul(2 / NC.leafCells);
  // the horizon trees (aF 1) are flat clumps in the haze: their leaves never resolve
  const farK = attribute("aF", "float");
  const soft = max(smoothstep(0.15, 0.7, outdoorLensBlur(U, camDist).mul(camDist).mul(0.5).div(max(cellM, 1e-3))), farK);
  // dense in the clump's middle, breaking up into single small leaves at its rim
  const edge = float(NC.fill).sub(r.mul(r).mul(NC.fill - 0.18)).add(soft.mul(0.1));
  const leafMask = cells.lessThan(edge).and(r.lessThan(1));
  const flick = mx_noise_float(vec3(uv().mul(NC.leafCells * 0.5), seed)).mul(float(0.12).mul(float(1).sub(soft)));
  // the crowns shimmer as a gust passes (leaves turning their pale undersides up):
  // ONLY with the gust at the tree (it was a steady 5.5 Hz flicker at a quarter of
  // its strength between gusts: 12 to 13 % of the tree pixels changed by more than
  // 4/255 in every 0.2 s with the bamboo hidden), slower (3 to 4.6 Hz: a leaf flips
  // and settles), travelling with the front; none on the horizon trees
  const gust = windGustNode(U, vec2(aW0.x, aW0.y), aW0.w);
  const shimmer = sin(U.T.mul(float(3.1).add(gust.g.mul(1.5))).add(seed.mul(7.3)))
    .mul(float(NC.shimmer ?? 0).mul(gust.g.mul(min(gust.u, 2))))
    .mul(float(1).sub(farK));
  const canopyAlb = vertexColor().mul(float(1).add(flick).add(shimmer)).mul(float(1).add(mix(cells, float(0.45), soft).mul(-0.35)));
  // aerial haze: the street trees take the air's own (1), the horizon trees more
  const hazeK = float(1).add(farK.mul((FT.haze ?? 1) - 1));
  const canopyMat = outdoorMaterial(U, {
    kind: NC.kind ?? "lambert",
    albedo: canopyAlb,
    roughness: 0.72,
    side: THREE.DoubleSide,
    mask: leafMask,
    position: treePos,
    ambient: NC.ambient,
    rim: NC.rim ?? 0.6,
    rimPow: NC.rimPow ?? 3,
    trans: linv(NC.trans),
    transGain: NC.transGain,
    sun: 1,
    flipNormals: false,
    cap: NC.cap ?? 0,
    nightAmb: NC.nightAmb ?? 1,
    nightDark: NC.nightDark ?? 1,
    nightTint: NC.nightTint ?? null,
    haze: hazeK,
    street: NC.street ?? 0,
    name: "canopy",
  });
  const woodMat = outdoorMaterial(U, { kind: "lambert", albedo: vertexColor(), position: treePos, ambient: NC.ambient, sun: 1, nightAmb: NC.nightAmb ?? 1, nightDark: NC.nightDark ?? 1, street: NC.street ?? 0, name: "treeWood" });
  const cards = new THREE.Mesh(cardGB.build(), canopyMat);
  cards.name = "canopyCards";
  const wood = new THREE.Mesh(woodGB.build(), woodMat);
  wood.name = "treeWood";
  const meshes = [cards, wood];
  // the crowns' shaded insides: a clump-scale mottle (so a gap never reads as a flat
  // disc), the same light, night and haze as the cards; front faces only (the camera
  // is always outside a crown)
  let cores = null;
  if (coreGB.n > 0) {
    const coreN = mx_noise_float(positionWorld.mul(1.9)).mul(0.5).add(0.5);
    const coreAlb = vertexColor().mul(float(0.82).add(coreN.mul(0.36)));
    // a crown's inside is lit through its leaves, never by the sun directly: no scene
    // light (at noon a directly lit core made the crowns one flat lime wall), the sky
    // at coreAmbient of the crown's, and the low sun filtering through on the side
    // facing it (coreSun: the warm glow inside a crown at golden hour, what the gold
    // holes had been standing in for at 17:41)
    const coreMat = outdoorMaterial(U, {
      kind: "lambert",
      albedo: coreAlb,
      position: treePos,
      ambient: NC.ambient * (NC.coreAmbient ?? 0.7),
      noLights: true,
      farSun: NC.coreSun ?? 0.4,
      farSunLow: 0.85,
      cap: NC.cap ?? 0,
      nightAmb: NC.nightAmb ?? 1,
      nightDark: NC.nightDark ?? 1,
      nightTint: NC.nightTint ?? null,
      haze: float(1).add(attribute("aF", "float").mul((FT.haze ?? 1) - 1)),
      // the leaves around it shade it from a street light (their own share is street)
      street: (NC.street ?? 0) * (NC.coreStreet ?? 0.15),
      name: "canopyCore",
    });
    cores = new THREE.Mesh(coreGB.build(), coreMat);
    cores.name = "canopyCore";
    // drawn before the cards: the cards' fragments behind a core fail the depth test
    cores.renderOrder = -1;
    meshes.push(cores);
  }
  for (const m of meshes) {
    m.castShadow = false;
    m.receiveShadow = false;
    group.add(m);
    disposables.push(m.geometry, m.material);
  }

  // --- the building on the right -------------------------------------------------------------
  const Bd = O.building;
  const bc = polar(Bd.bearing, Bd.dist, 0);
  const bw = Bd.width, bh = Bd.roofY - ground, bd = Bd.depth;
  const bGeo = new THREE.BoxGeometry(bw, bh, bd);
  // face-local coordinates in metres for the facade pattern: x across the face, y up from the ground
  const fx = uv().x.mul(bw);
  const fy = uv().y.mul(bh);
  const storey = float(Bd.storey);
  const bayW = float(Bd.bay);
  const inBayX = fx.sub(Bd.bayOffset).mod(bayW);
  const inStoreyY = fy.mod(storey);
  const win = smoothstep(0.0, 0.03, inBayX.sub(bayW.mul(0.5).sub(Bd.window[0] / 2)))
    .mul(smoothstep(0.0, 0.03, bayW.mul(0.5).add(Bd.window[0] / 2).sub(inBayX)))
    .mul(smoothstep(0.0, 0.03, inStoreyY.sub(Bd.sillH)))
    .mul(smoothstep(0.0, 0.03, float(Bd.sillH + Bd.window[1]).sub(inStoreyY)));
  // window grilles: thin bars inside the openings
  const grille = smoothstep(0.82, 0.92, inBayX.mul(8.5).fract().sub(0.5).abs().mul(2).oneMinus()).mul(0.5);
  // the chajja (sunshade slab) over each window and the stain streaks it leaves
  const aboveWin = inStoreyY.sub(Bd.sillH + Bd.window[1]);
  const chajja = smoothstep(0.0, 0.02, aboveWin).mul(smoothstep(0.0, 0.02, float(0.12).sub(aboveWin)));
  const shade = smoothstep(0.0, 0.03, float(0).sub(aboveWin)).mul(smoothstep(0.0, 0.5, aboveWin.add(0.55))).mul(0.45);
  const stainN = mx_noise_float(vec3(fx.mul(3.2), fy.mul(0.25), 4.2)).mul(0.5).add(0.5);
  const stain = smoothstep(0.55, 0.85, stainN).mul(0.3);
  const parapet = smoothstep(bh - 1.05, bh - 1.0, fy).mul(float(1).sub(smoothstep(bh - 0.9, bh - 0.85, fy))).mul(0.25);
  const plaster = mx_noise_float(vec3(fx.mul(6), fy.mul(6), 1.7)).mul(0.06);
  // (2026-10-06) a look can repaint the plaster and the chajjas live (building.paint:
  // colour and amount; amount 0 = the house's own cream, exactly): Cyberpunk's cool
  // concrete, where the cream read ochre at dusk, off its palette
  const PU = { color: uniform(new THREE.Color(1, 1, 1)), amount: uniform(0) };
  const setPaint = () => {
    const Pt = P.outside.building?.paint;
    PU.color.value.setStyle(Pt?.color || "#ffffff", THREE.SRGBColorSpace);
    PU.amount.value = Pt?.amount ?? 0;
  };
  setPaint();
  let bAlb = mix(linv(Bd.color), vec3(PU.color), PU.amount).mul(float(1).add(plaster)).mul(float(1).sub(stain));
  bAlb = bAlb.mul(float(1).sub(shade.mul(win.oneMinus())));
  bAlb = mix(bAlb, mix(linv(Bd.chajja), vec3(PU.color).mul(0.9), PU.amount), chajja);
  bAlb = bAlb.mul(float(1).sub(parapet));
  const openAlb = mix(vec3(0.012, 0.012, 0.014), linv(Bd.grille), grille);
  bAlb = mix(bAlb, openAlb, win);
  // NIGHT (loop 2): its windows lit, a share of them that falls through the night
  // (U.city.x, outside.js cityAt). Each opening picks once whether it is among the
  // lit (a hash of its bay and storey against the share, so the same windows stay
  // lit as the share falls and they go dark one by one), warm filament-white or the
  // cool white of an LED tube light, a curtain drawn across part of it, the grille's
  // bars dark against the light. Through the depth of field they are soft bokeh.
  // (2026-10-05) the colours, the level and the cool share are uniforms set every
  // frame (update below), so a look switch changes them without a rebuild; whether
  // the windows are built at all (level > 0 in the base) stays build-time
  let bGlow = null;
  const Lw = Bd.lit;
  const LU = { warm: uniform(new THREE.Color()), cool: uniform(new THREE.Color()), level: uniform(0), coolShare: uniform(0.5) };
  const setLit = () => {
    const L2 = P.outside.building?.lit;
    if (!L2) return;
    LU.warm.value.setStyle(L2.warm, THREE.SRGBColorSpace);
    LU.cool.value.setStyle(L2.cool, THREE.SRGBColorSpace);
    LU.level.value = L2.level ?? 0;
    LU.coolShare.value = L2.coolShare ?? 0.5;
  };
  setLit();
  if (Lw && Lw.level > 0) {
    const col = fx.sub(Bd.bayOffset).div(bayW).floor();
    const rowI = fy.div(storey).floor();
    const h1 = fract(sin(col.mul(12.9898).add(rowI.mul(78.233)).add(Lw.seed ?? 3.7)).mul(43758.5453));
    const h2 = fract(h1.mul(7.31).add(0.173));
    const on = smoothstep(h1.sub(0.015), h1.add(0.015), U.city.x);
    const tone = mix(vec3(LU.warm), vec3(LU.cool), smoothstep(LU.coolShare.sub(0.02), LU.coolShare.add(0.02), float(1).sub(h2)));
    const wx = inBayX.sub(bayW.mul(0.5).sub(Bd.window[0] / 2)).div(Bd.window[0]); // 0..1 across the opening
    const curtain = mix(float(0.3), float(1), smoothstep(h2.mul(0.5).add(0.15), h2.mul(0.5).add(0.3), wx));
    bGlow = tone.mul(U.lightGain.mul(LU.level)).mul(on).mul(curtain).mul(float(1).sub(grille.mul(1.6))).mul(win).mul(U.city.w).mul(float(0.7).add(h2.mul(0.6)));
  }
  const bMat = outdoorMaterial(U, { albedo: bAlb, roughness: 0.92, ambient: Bd.ambient, wetDarken: 0.25, sun: 1, glow: bGlow, street: Bd.street ?? 0, name: "building" });
  const bMesh = new THREE.Mesh(bGeo, bMat);
  bMesh.name = "building";
  bMesh.position.set(bc.x, ground + bh / 2, bc.z);
  // BoxGeometry's +z face carries the facade uv; turn it so +z looks toward faceBearing
  bMesh.rotation.y = Math.PI - Bd.faceBearing * D2R;
  group.add(bMesh);
  disposables.push(bGeo, bMat);

  // the red-orange patch: placed on the facade where the chair's ray through R1 row B
  // meets it (bearing and elevation seen from the chair, 13-photo 9)
  const faceN = new THREE.Vector3(Math.sin(Bd.faceBearing * D2R), 0, -Math.cos(Bd.faceBearing * D2R));
  const facePt = bc.clone().addScaledVector(faceN, bd / 2 + 0.02);
  const eye = chair ? V3(...chair) : V3(-0.234, 0.045, 0.792);
  const pb = Bd.patch.bearing * D2R, pe = Bd.patch.elevation * D2R;
  const ray = V3(Math.sin(pb) * Math.cos(pe), Math.sin(pe), -Math.cos(pb) * Math.cos(pe));
  const tHit = facePt.clone().sub(eye).dot(faceN) / ray.dot(faceN);
  const hit = eye.clone().addScaledVector(ray, tHit);
  const pGeo = new THREE.PlaneGeometry(Bd.patch.size[0], Bd.patch.size[1], 1, 4);
  const puv = uv();
  const folds = mx_noise_float(vec3(puv.x.mul(3), puv.y.mul(1.5), 9.1)).mul(0.18);
  const pAlb = linv(Bd.patch.color).mul(float(1).add(folds)).mul(float(1).sub(smoothstep(0.7, 1.0, puv.y).mul(0.25)));
  const pMat = outdoorMaterial(U, { albedo: pAlb, roughness: 0.85, ambient: Bd.ambient, sun: 1, name: "redPatch" });
  const patch = new THREE.Mesh(pGeo, pMat);
  patch.name = "redPatch";
  patch.position.copy(hit).addScaledVector(faceN, 0.03);
  patch.lookAt(patch.position.clone().add(faceN));
  group.add(patch);
  disposables.push(pGeo, pMat);

  // --- compound wall, road, ground ------------------------------------------------------------
  const Wl = O.wall;
  const wallGeo = new THREE.BoxGeometry(Wl.length, Wl.height, 0.23);
  const wN = mx_noise_float(positionWorld.mul(vec3(1.2, 4, 1.2))).mul(0.5).add(0.5);
  const wAlb = linv(Wl.color).mul(float(0.8).add(wN.mul(0.25))).mul(float(1).sub(float(1).sub(smoothstep(0.0, 0.3, positionWorld.y.sub(ground))).mul(0.3)));
  const wallMat = outdoorMaterial(U, { albedo: wAlb, roughness: 0.95, ambient: Wl.ambient, sun: 1, street: Wl.street ?? 0, name: "compoundWall" });
  const wallMesh = new THREE.Mesh(wallGeo, wallMat);
  wallMesh.name = "compoundWall";
  wallMesh.position.set(Wl.x, ground + Wl.height / 2, Wl.z);
  group.add(wallMesh);
  disposables.push(wallGeo, wallMat);

  const G = O.ground;
  const gGeo = new THREE.CircleGeometry(G.radius, 48);
  gGeo.rotateX(-Math.PI / 2);
  const road = smoothstep(G.road[0] - 0.2, G.road[0], positionWorld.z.negate()).mul(float(1).sub(smoothstep(G.road[1], G.road[1] + 0.2, positionWorld.z.negate())));
  const gN = mx_noise_float(positionWorld.mul(0.6)).mul(0.5).add(0.5);
  const gN2 = mx_noise_float(positionWorld.mul(5.0)).mul(0.5).add(0.5);
  let gAlb = mix(linv(G.color), linv(G.color2), gN);
  gAlb = mix(gAlb, linv(G.roadColor).mul(float(0.85).add(gN2.mul(0.3))), road);
  const gMat = outdoorMaterial(U, { albedo: gAlb, roughness: max(float(0.95).sub(road.mul(0.2)), 0.5), ambient: G.ambient, wetDarken: 0.45, sun: 1, street: G.street ?? 0, name: "ground" });
  const gMesh = new THREE.Mesh(gGeo, gMat);
  gMesh.name = "ground";
  gMesh.position.set(0, ground, 0);
  group.add(gMesh);
  disposables.push(gGeo, gMat);

  return {
    group,
    update() {
      setLit();
      setPaint();
    },
    stats: { trees: trees.length, cards: cardGB.idx.length / 6, coreTris: coreGB.idx.length / 3 },
    dispose() {
      for (const d of disposables) d.dispose();
      group.removeFromParent();
    },
  };
}
