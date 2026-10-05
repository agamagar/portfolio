// The bamboo on the right (Agam: "canes and leaves, plain green"; 30-locked-brief.md).
//
// A clump standing in the yard to the north-east of the window, its green canes
// crossing the right-hand panes (R1 and, when Dreamlike opens it, R2) and its leafy
// tops above; one or two culms arch over toward the left pair, so a spray of leaves
// hangs in L2's upper corner (13-photo 4.9: "faint arching thin strands at the right
// edge of L2's row A") and the first frame (p = 0) has bamboo in it.
//
// Built as three merged meshes, one draw call each:
//   canes     tapered tubes along a cubic curve, a ring bulge at every node, the
//             node line, the waxy white band just below each node and the old
//             culm sheath at the lower nodes painted in TSL from the internode
//             coordinate (uv.y)
//   branches  thin tubes from the upper nodes, drooping under their own weight
//   leaves    narrow lanceolate blades on cards: the outline is analytic in TSL
//             (maskNode, so no texture and no mip blur), a raised midrib fold for
//             shading, a paler underside, a few dry straw leaves; MeshSSSNodeMaterial
//             so a leaf with light behind it glows yellow-green
// Every vertex carries its cane's root, height and phase, so the whole canes bend
// with the real wind and the leaves flutter on top (common.js windOffset), with
// the previous frame's offset on positionPrevious for TRAA.

import * as THREE from "three/webgpu";
import { uv, vec3, float, mix, smoothstep, abs, faceDirection, vertexColor, mx_noise_float, attribute, max } from "three/tsl";
import { GeoBuilder, tube, outdoorMaterial, windPositionNode, lin, linv, D2R } from "./common.js";

const V3 = (x = 0, y = 0, z = 0) => new THREE.Vector3(x, y, z);

// cubic Bezier
function bez(p0, p1, p2, p3, t) {
  const u = 1 - t;
  return V3()
    .addScaledVector(p0, u * u * u)
    .addScaledVector(p1, 3 * u * u * t)
    .addScaledVector(p2, 3 * u * t * t)
    .addScaledVector(p3, t * t * t);
}

// Where a cane crosses the window's heights, it must stay right of the left
// pair as seen from the chair: Agam's bamboo crosses the RIGHT-hand panes. Returns
// the smallest bearing (deg, seen from the chair) of the cane between y0 and y1.
function minBearing(ctrl, chair, y0, y1) {
  let m = Infinity;
  for (let i = 0; i <= 60; i++) {
    const p = bez(...ctrl, i / 60);
    if (p.y < y0 || p.y > y1) continue;
    m = Math.min(m, Math.atan2(p.x - chair.x, chair.z - p.z) / D2R);
  }
  return m;
}

// The canes' layout: seeded random ones around the clump centre, plus the named
// arching culms from params.
function layout(B, ground, rnd, chair) {
  const c = B.center;
  const cx = Math.sin(c.bearing * D2R) * c.dist;
  const cz = -Math.cos(c.bearing * D2R) * c.dist;
  const canes = [];
  for (let i = 0; i < B.canes; i++) {
    const a = rnd() * Math.PI * 2;
    const r = B.spread * Math.sqrt(0.15 + 0.85 * rnd());
    const x = cx + Math.cos(a) * r;
    const z = cz + Math.sin(a) * r * 0.8;
    // canes lean out of the clump, away from the house wall and never toward the
    // left pair (the bias), so the tops roll over the yard and to the right
    let ox = x - cx + (rnd() - 0.5) * 0.2 + B.leanBias[0], oz = z - cz + (rnd() - 0.5) * 0.2 + B.leanBias[1];
    const ol = Math.hypot(ox, oz) || 1;
    ox /= ol;
    oz /= ol;
    const H = B.height[0] + rnd() * (B.height[1] - B.height[0]);
    const lean = (B.leanDeg[0] + rnd() * (B.leanDeg[1] - B.leanDeg[0])) * D2R;
    const arch = B.arch[0] + rnd() * (B.arch[1] - B.arch[0]);
    const r0 = B.radius[0] + rnd() * (B.radius[1] - B.radius[0]);
    const age = rnd();
    const make = (rx, rz, dx, dz) => {
      const out = H * Math.sin(lean) + arch * H * 0.16;
      const tip = V3(rx + dx * out, ground + H * Math.cos(lean) - arch * H * 0.07, rz + dz * out);
      return { root: V3(rx, ground, rz), tip, H, lean, out: V3(dx, 0, dz), arch, r0, age };
    };
    let c = make(x, z, ox, oz);
    // keep it right of the left pair where it crosses the window's heights
    for (let k = 0; k < 12 && chair && minBearing(caneCurve(c), chair, B.window[0], B.window[1]) < B.minBearing; k++) {
      const turn = Math.min(1, (k + 1) / 4);
      const dx = ox * (1 - turn) + 0.8 * turn, dz = oz * (1 - turn) - 0.6 * turn;
      const dl = Math.hypot(dx, dz);
      c = make(x + 0.06 * Math.max(0, k - 3), z, dx / dl, dz / dl);
    }
    canes.push(c);
  }
  for (const s of B.arching || []) {
    const root = V3(s.root[0], ground, s.root[1]);
    const tip = V3(...s.tip);
    const H = tip.y - ground + s.bow * 0.5;
    const d = V3(tip.x - root.x, 0, tip.z - root.z);
    const out = d.clone().normalize();
    // first in the list, so the leaf budget (maxLeaves) never starves it
    canes.unshift({ root, tip, H, lean: s.leanDeg * D2R, out, arch: s.bow, r0: s.radius ?? B.radius[1], age: s.age ?? 0.3, special: s });
  }
  return canes;
}

// Control points: straight and near vertical for most of the height, curving over
// at the top (bamboo culms bow only in their upper third).
function caneCurve(c) {
  const up = V3(0, 1, 0);
  const H = c.tip.y - c.root.y;
  const p0 = c.root;
  const lean = c.out.clone().multiplyScalar(Math.tan(c.lean));
  const p1 = p0.clone().addScaledVector(up, H * 0.42).addScaledVector(lean, H * 0.42);
  const bowUp = c.special ? c.special.bow : c.arch * 0.9;
  const p2 = p0.clone().addScaledVector(up, H * 0.8 + bowUp).addScaledVector(lean, H * 0.8);
  // pull p2 toward the tip horizontally so the top rolls over
  p2.x += (c.tip.x - p2.x) * 0.45;
  p2.z += (c.tip.z - p2.z) * 0.45;
  return [p0, p1, p2, c.tip];
}

export function buildBamboo(P, U, rnd, { chair = null } = {}) {
  const O = P.outside;
  const B = O.bamboo;
  const ground = O.ground.y;
  const group = new THREE.Group();
  group.name = "bamboo";
  const canes = layout(B, ground, rnd, chair ? V3(...chair) : null);

  const caneGB = new GeoBuilder({ aW0: 4, aW1: 4, aW2: 4, color: 3 });
  const brGB = new GeoBuilder({ aW0: 4, aW1: 4, aW2: 4, color: 3 });
  const leafGB = new GeoBuilder({ aW0: 4, aW1: 4, aW2: 4, color: 3 });
  // the arching culm's hanging spray (hang.spray): its own meshes, so a look can
  // show it (Dreamlike) or keep the photo's view (outside.looks.<look>.spray)
  const sprayBrGB = new GeoBuilder({ aW0: 4, aW1: 4, aW2: 4, color: 3 });
  const sprayLeafGB = new GeoBuilder({ aW0: 4, aW1: 4, aW2: 4, color: 3 });

  const col = B.colors;
  const cCane = lin(col.cane), cOld = lin(col.caneOld), cBranch = lin(col.branch);
  const cLeaf = lin(col.leaf), cYoung = lin(col.leafYoung), cDry = lin(col.leafDry);
  const tmpC = new THREE.Color();
  let leafCount = 0;
  // params.quality (high | mid | low) trims the leaves, the clump's largest cost; the
  // arching culm is first in the list, so it keeps its spray
  const maxLeaves = Math.round(B.maxLeaves * (B.quality?.[P.quality || "high"] ?? 1));

  const perCane = [];
  canes.forEach((c, ci) => {
    const leaves0 = leafCount;
    const ctrl = caneCurve(c);
    const phase = rnd() * Math.PI * 2;
    const stiff = 0.8 + rnd() * 0.5;
    const H = c.tip.distanceTo(c.root) * 1.02;
    const aW0 = [c.root.x, c.root.z, H, phase];
    // sample the curve densely, measure arc length
    const NS = 160;
    const samples = [];
    let arc = 0;
    let prev = null;
    for (let i = 0; i <= NS; i++) {
      const p = bez(...ctrl, i / NS);
      if (prev) arc += p.distanceTo(prev);
      samples.push({ p, arc, s: i / NS });
      prev = p;
    }
    const L = arc;
    const at = (d) => {
      // point at arc length d
      let lo = 0, hi = samples.length - 1;
      while (hi - lo > 1) {
        const mid = (lo + hi) >> 1;
        if (samples[mid].arc < d) lo = mid;
        else hi = mid;
      }
      const a = samples[lo], b = samples[hi];
      const f = (d - a.arc) / Math.max(1e-6, b.arc - a.arc);
      return { p: a.p.clone().lerp(b.p, f), s: (a.s + (b.s - a.s) * f) };
    };
    // nodes: internodes short at the base, longest mid-culm, short again at the top
    const nodes = [0];
    while (nodes[nodes.length - 1] < L) {
      const u = nodes[nodes.length - 1] / L;
      const k = Math.sin(Math.PI * Math.min(1, u * 1.1)) * 0.75 + 0.25;
      const len = B.internode[0] + (B.internode[1] - B.internode[0]) * k * (0.85 + rnd() * 0.3);
      nodes.push(nodes[nodes.length - 1] + len);
    }
    const nodeFrac = (d) => {
      let i = 0;
      while (i < nodes.length - 1 && nodes[i + 1] <= d) i++;
      return { i, f: (d - nodes[i]) / Math.max(1e-4, nodes[i + 1] - nodes[i]) };
    };
    // rings: dense near each node (the bulge), coarse far below the window
    const ds = [];
    for (let d = 0; d < L; ) {
      ds.push(d);
      const y = at(d).p.y;
      d += y < -2.2 ? 0.35 : 0.11;
    }
    ds.push(L);
    for (let k = 1; k < nodes.length - 1; k++) {
      const n = nodes[k];
      if (n > L) break;
      if (at(n).p.y < -2.2) continue;
      for (const o of [-0.009, 0.009]) if (n + o > 0 && n + o < L) ds.push(n + o);
    }
    ds.sort((a, b) => a - b);
    const pts = ds.map((d) => at(d).p);
    const baseCol = tmpC.copy(cCane).lerp(cOld, c.age * 0.6).clone();
    const r0 = c.r0;
    tube(
      caneGB,
      pts,
      (i) => {
        const d = ds[i];
        const u = d / L;
        const taper = 1 - 0.72 * Math.pow(u, 1.25);
        const nf = nodeFrac(d);
        const dn = Math.min(nf.f, 1 - nf.f) * (nodes[nf.i + 1] - nodes[nf.i]);
        const bulge = 1 + 0.07 * Math.exp(-(dn * dn) / (0.008 * 0.008));
        return r0 * taper * bulge;
      },
      8,
      (i) => {
        const d = ds[i];
        const s = at(d).s;
        const nf = nodeFrac(d);
        return { aW0, aW1: [s, stiff, 0, 0], aW2: [0, 0, 0, 0], color: [baseCol.r, baseCol.g, baseCol.b], _f: nf.f };
      },
      (i) => {
        // v = internode coordinate (0 at the node below, 1 at the node above) + node index
        const nf = nodeFrac(ds[i]);
        return nf.f + nf.i;
      },
    );

    // --- branches and leaves ------------------------------------------------------------
    let side = rnd() * Math.PI * 2;
    for (let k = 1; k < nodes.length - 1; k++) {
      const d = nodes[k];
      if (d > L * 0.985) break;
      const { p: np, s } = at(d);
      const u = d / L;
      if (u < B.branchFrom) continue;
      // leafiness grows with height above the sill: sparse at the window, dense above
      const dens = B.leafDensity * (0.18 + 0.82 * THREE.MathUtils.smoothstep(np.y, B.denseFrom, B.denseFull));
      const tangent = at(Math.min(L, d + 0.05)).p.sub(np).normalize();
      const nb = rnd() < 0.55 ? 1 : rnd() < 0.7 ? 2 : 3;
      side += Math.PI * (0.8 + rnd() * 0.4);
      for (let b = 0; b < nb; b++) {
        const az = side + (b - (nb - 1) / 2) * 0.5 + (rnd() - 0.5) * 0.3;
        // a radial direction around the cane
        const ref = Math.abs(tangent.y) < 0.95 ? V3(0, 1, 0) : V3(1, 0, 0);
        const e1 = V3().crossVectors(tangent, ref).normalize();
        const e2 = V3().crossVectors(tangent, e1).normalize();
        const radial = e1.clone().multiplyScalar(Math.cos(az)).addScaledVector(e2, Math.sin(az));
        const elev = (35 + rnd() * 30) * D2R;
        let dir = tangent.clone().multiplyScalar(Math.cos(elev)).addScaledVector(radial, Math.sin(elev)).normalize();
        let Lb = (B.branchLen[0] + rnd() * (B.branchLen[1] - B.branchLen[0])) * (1 - 0.45 * Math.max(0, u - 0.6)) * (b === 0 ? 1 : 0.7);
        let droop = 0.15 + rnd() * 0.35;
        const hang = c.special && c.special.hang && u > c.special.hang.from;
        if (hang) {
          // the arching culm's crown: long pendulous branchlets thrown out along the
          // arch (toward the left pair) that hang down in front of L2's upper panes
          const H2 = c.special.hang;
          const along = V3(H2.toward[0], 0, H2.toward[1]).normalize();
          dir = dir.multiplyScalar(0.35).addScaledVector(along, 0.65).normalize();
          Lb *= H2.length;
          droop = H2.droop * (0.8 + rnd() * 0.4);
        } else if (c.special) droop += 0.45;
        const isSpray = hang && c.special.hang.spray;
        const bGB = isSpray ? sprayBrGB : brGB;
        const lGB = isSpray ? sprayLeafGB : leafGB;
        const fanDens = hang ? c.special.hang.density ?? dens : dens;
        const bph = rnd() * Math.PI * 2;
        const bpts = [];
        const NB = 6;
        for (let j = 0; j <= NB; j++) {
          const t = j / NB;
          bpts.push(np.clone().addScaledVector(dir, Lb * t).add(V3(0, -Lb * droop * t * t, 0)));
        }
        const br = Math.max(0.0025, r0 * 0.16 * (1 - 0.4 * u));
        tube(
          bGB,
          bpts,
          (j) => br * (1 - 0.6 * (j / NB)),
          5,
          (j) => ({ aW0, aW1: [s, stiff, bph, Lb * (j / NB)], aW2: [0, 0, 0, 0], color: [cBranch.r, cBranch.g, cBranch.b] }),
        );
        // leaf fans along the outer part of the branch
        const nf = Math.max(1, Math.round((1 + rnd() * 2.5) * fanDens + (rnd() < fanDens ? 1 : 0)));
        for (let f = 0; f < nf; f++) {
          if (leafCount >= maxLeaves) break;
          if (rnd() > Math.min(1, fanDens + 0.15)) continue;
          // hanging branchlets carry their leaves low, on their outer half
          const t = f === nf - 1 ? 1 : hang ? 0.55 + rnd() * 0.45 : 0.35 + rnd() * 0.6;
          const fp = np.clone().addScaledVector(dir, Lb * t).add(V3(0, -Lb * droop * t * t, 0));
          const fdir = dir.clone().add(V3(0, -2 * droop * t, 0)).normalize();
          const nl = 4 + Math.floor(rnd() * 5);
          const heading = Math.atan2(fdir.x, fdir.z);
          for (let l = 0; l < nl; l++) {
            if (leafCount >= maxLeaves) break;
            leafCount++;
            const len = B.leafLen[0] + rnd() * (B.leafLen[1] - B.leafLen[0]);
            const wid = B.leafWidth[0] + rnd() * (B.leafWidth[1] - B.leafWidth[0]);
            // fan: spread around the twig's heading, drooping (more in a heavy crown)
            const h = heading + (l / Math.max(1, nl - 1) - 0.5) * (1.6 + rnd() * 0.8) + (rnd() - 0.5) * 0.4;
            const pitch = -(18 + rnd() * 45 + (c.special ? 15 : 0)) * D2R;
            const ld = V3(Math.sin(h) * Math.cos(pitch), Math.sin(pitch), Math.cos(h) * Math.cos(pitch));
            // blade normal: mostly up, with a random roll about the leaf's axis
            const flat = V3(0, 1, 0).sub(ld.clone().multiplyScalar(ld.y)).normalize();
            const sideV = V3().crossVectors(ld, flat).normalize();
            const roll = (rnd() - 0.5) * 1.3;
            const bn = flat.clone().multiplyScalar(Math.cos(roll)).addScaledVector(sideV, Math.sin(roll)).normalize();
            const bs = V3().crossVectors(ld, bn).normalize(); // across the blade
            const curl = 0.1 + rnd() * 0.25; // the blade arcs down along its length
            const lph = rnd() * Math.PI * 2;
            const r = rnd();
            const lc = r < B.dryFraction ? cDry : tmpC.copy(cLeaf).lerp(cYoung, Math.pow(rnd(), 1.6) * 0.85);
            const lcol = [lc.r * (0.85 + rnd() * 0.3), lc.g * (0.85 + rnd() * 0.3), lc.b * (0.85 + rnd() * 0.3)];
            const base = fp.clone().addScaledVector(ld, 0.01);
            const NSEG = 4;
            const rows = [];
            for (let q = 0; q <= NSEG; q++) {
              const tq = q / NSEG;
              const cp = base.clone().addScaledVector(ld, len * tq).add(V3(0, -len * curl * tq * tq, 0));
              const tan = ld.clone().add(V3(0, -2 * curl * tq, 0)).normalize();
              const nq = V3().crossVectors(bs, tan).normalize();
              if (nq.dot(bn) < 0) nq.negate();
              const fold = wid * 0.12;
              const row = [];
              for (let e = 0; e < 3; e++) {
                const xe = (e - 1) * 0.5 * wid;
                const pos = cp.clone().addScaledVector(bs, xe).addScaledVector(nq, e === 1 ? fold : 0);
                const nrm = nq.clone().addScaledVector(bs, (e - 1) * 0.35).normalize();
                row.push(
                  lGB.vert({
                    p: [pos.x, pos.y, pos.z],
                    n: [nrm.x, nrm.y, nrm.z],
                    uv: [e * 0.5, tq],
                    aW0,
                    aW1: [s, stiff, bph, Lb * t + 0.05],
                    aW2: [lph, tq, len, 1],
                    color: lcol,
                  }),
                );
              }
              rows.push(row);
            }
            for (let q = 0; q < NSEG; q++) {
              const a = rows[q], b2 = rows[q + 1];
              for (let e = 0; e < 2; e++) {
                // wound so the front face looks along bn (the upper surface)
                lGB.tri(a[e], a[e + 1], b2[e]);
                lGB.tri(a[e + 1], b2[e + 1], b2[e]);
              }
            }
          }
        }
      }
    }
    perCane.push(leafCount - leaves0);
  });

  // --- materials ------------------------------------------------------------------------
  const pos = windPositionNode(U, B.sway);

  // canes: node line, waxy band below each node, old sheath at the lower nodes
  const f = uv().y.fract();
  const nodeLine = float(1).sub(smoothstep(0.0, 0.03, f)).max(smoothstep(0.985, 1.0, f));
  // the white bloom just below each node: a narrow, faint band (strong bands read as stripes)
  const wax = smoothstep(0.88, 0.94, f).mul(float(1).sub(smoothstep(0.975, 0.992, f)));
  const nodeIdx = uv().y.floor();
  const streak = mx_noise_float(vec3(uv().x.mul(26), uv().y.mul(1.7), nodeIdx.mul(3.1))).mul(0.5).add(0.5);
  const lowY = attribute("position", "vec3").y;
  const sheath = float(1).sub(smoothstep(-1.8, -0.2, lowY)).mul(smoothstep(0.55, 0.75, mx_noise_float(vec3(uv().x.mul(3), nodeIdx.mul(0.7), 2.3)).mul(0.5).add(0.5)));
  const cBase = vertexColor();
  let caneAlb = mix(cBase, linv(col.wax), wax.mul(0.3));
  caneAlb = caneAlb.mul(float(0.9).add(streak.mul(0.2)));
  caneAlb = mix(caneAlb, linv(col.sheath), sheath.mul(0.8));
  caneAlb = caneAlb.mul(float(1).sub(nodeLine.mul(0.45)));
  const caneMat = outdoorMaterial(U, { albedo: caneAlb, roughness: 0.42, position: pos, ambient: B.ambient, rim: 1, sun: B.sun, name: "bambooCane" });
  const branchMat = outdoorMaterial(U, { albedo: vertexColor(), roughness: 0.55, position: pos, ambient: B.ambient, rim: 1, sun: B.sun, name: "bambooBranch" });

  // leaves: analytic lanceolate outline, midrib, paler underside
  const lu = uv();
  const x = abs(lu.x.sub(0.5)).mul(2);
  const t = lu.y;
  const w = smoothstep(0.0, 0.14, t).mul(float(1).sub(t).pow(0.75)).mul(1.25).min(1).max(float(1).sub(smoothstep(0.0, 0.045, t)).mul(0.14));
  const mask = x.lessThan(w);
  const midrib = float(1).sub(smoothstep(0.0, 0.09, x));
  const veins = float(1).sub(smoothstep(0.1, 0.45, abs(lu.x.mul(9).fract().sub(0.5)).mul(2))).mul(0.06);
  const top = vertexColor().mul(float(1).add(midrib.mul(0.22)).sub(veins));
  const under = mix(vertexColor(), linv(col.leafUnder), 0.55).mul(float(1).add(midrib.mul(0.12)));
  const leafAlb = mix(under, top, faceDirection.mul(0.5).add(0.5));
  const leafMat = outdoorMaterial(U, {
    kind: "sss",
    albedo: leafAlb,
    roughness: 0.48,
    side: THREE.DoubleSide,
    mask,
    position: pos,
    ambient: B.ambient,
    rim: 1.4,
    trans: linv(col.trans).mul(max(vertexColor().g.mul(4), 0.4)),
    sun: B.sun,
    transGain: B.transGain,
    // no leaf outshines the sky behind it: the low sun's glints and the translucency
    // of a leaf held against it were the hot yellow points in R1 at 17:41 that the
    // DOF's gather rang into blobs (loop round 2)
    cap: B.cap ?? 0,
    name: "bambooLeaf",
  });

  const meshes = [];
  const mk = (gb, mat, name, cast = B.shadows) => {
    const g = gb.build();
    const m = new THREE.Mesh(g, mat);
    m.name = name;
    m.castShadow = cast;
    m.receiveShadow = true;
    group.add(m);
    meshes.push(m);
    return m;
  };
  mk(caneGB, caneMat, "bambooCanes");
  mk(brGB, branchMat, "bambooBranches");
  // leaves cast only when asked: thousands of masked cards in two shadow maps (the key
  // and the lamp) is the clump's largest cost, and the canes carry the shadow shapes
  mk(leafGB, leafMat, "bambooLeaves", B.shadows && B.leafShadows);
  const spray = [];
  if (sprayLeafGB.n > 0) {
    spray.push(mk(sprayBrGB, branchMat, "bambooSprayBranches"), mk(sprayLeafGB, leafMat, "bambooSprayLeaves", B.shadows && B.leafShadows));
  }

  return {
    group,
    spray,
    // leaves per cane, the arching culms first (they are first in the leaf budget)
    stats: { canes: canes.length, leaves: leafCount, arching: perCane.slice(0, (B.arching || []).length), clump: perCane.slice((B.arching || []).length).reduce((a, b) => a + b, 0), triangles: meshes.reduce((a, m) => a + m.geometry.index.count / 3, 0) },
    dispose() {
      for (const m of meshes) {
        m.geometry.dispose();
        m.material.dispose();
      }
      group.removeFromParent();
    },
  };
}
