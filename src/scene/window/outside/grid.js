// The brown box grille beyond the glass (20-question Q19; 13-photo 4.8).
//
// ONE flat mesh across the whole window, measured on ref_1600 through the solved
// reference camera (-2.6, 0.5, 8.8 W, yaw 8, pitch 5.7, roll -0.7, vertical FOV
// 56.8) by backprojecting every bar the photo shows onto a trial plane and asking
// the bars to land on one lattice (loop round 1, outside lane; scratchpad
// outside/fit*.py):
//   - the verticals seen in L1 (image x 900 to 908), L2 (993 to 1007), the two
//     half hidden at L1's left and L2's right glass edges, and the one in R1 (1280
//     to 1320) all sit on world x = firstX + k * pitchX, plumb
//   - the horizontals in L1, L2 and R1 (image y 113 to 122, 270 to 291, 355 to 381,
//     448 to 469, 550, 642, 732) all sit on y = firstY + k * pitchY, level
//   - the brace in L1 row B (813, 303) and the brace in L2 row C (1075, 659) are one
//     straight member (a line through one predicts the other within 2 px)
// That only holds when the mesh is a single plane that is turned planDeg in plan
// (its right end nearer the house): with the plane parallel to the L pair the
// horizontals miss by 6.7 px rms, turned 11.3 deg they miss by 2.0 px. Through R1
// the same plane, not a second one parallel to the angled section, lands the R1
// horizontals within 0.05 of a pitch. So there is no corner in view: the earlier
// box with a second front plane behind the right section showed that plane
// through L2 (a dense band of receding verticals and a kinked "arched" row A),
// and its top frame, bottom frame and left return showed through row A, row C
// and L1's left edge. Now the frame and both returns sit outside every runway
// view (p = 0, the 17:41 reference, the closing shot) and the mesh ends on the
// right between R1's view and R2's, so R2 keeps the photo's dark stipple.
//   - the flats are 0.125 W (11 mm) wide at 4.2 W (38 cm) beyond the glass: 0.13
//     of the lattice's pitch, as the sharp 5481 close-up shows them (loop round 2;
//     the first fit's 0.148 W came from the soft 17:41 frame and read 18 % wide)
//   - the finish: flat tan paint (params: color, edge), smooth, no albedo noise,
//     each face darker along its two long edges. In the photos the speckle on the
//     bars is the dusty glass in front (13-photo 4.8), so the bars carry none of
//     their own; against the 17:41 sky they are near silhouettes with a thin
//     sky-lit edge, at dusk the room's light shows them tan.
// Lengths in W except where marked.

import * as THREE from "three/webgpu";
import { float, uv, min, smoothstep } from "three/tsl";
import { GeoBuilder, outdoorMaterial, linv } from "./common.js";

// an oriented box into a GeoBuilder: centre c, half-extents along axes ax, ay, az
function box(gb, c, ax, ay, az, hx, hy, hz) {
  const faces = [
    [ax, ay, az, hx, hy, hz],
    [ax.clone().negate(), ay, az.clone().negate(), hx, hy, hz],
    [ay, az, ax, hy, hz, hx],
    [ay.clone().negate(), az, ax.clone().negate(), hy, hz, hx],
    [az, ax, ay, hz, hx, hy],
    [az.clone().negate(), ax, ay.clone().negate(), hz, hx, hy],
  ];
  // each face: normal n = first axis; spans the other two
  for (const [n, u, v, hn, hu, hv] of faces) {
    const center = c.clone().addScaledVector(n, hn);
    const corners = [
      [-1, -1],
      [1, -1],
      [-1, 1],
      [1, 1],
    ].map(([a, b]) => center.clone().addScaledVector(u, a * hu).addScaledVector(v, b * hv));
    const cross = new THREE.Vector3().crossVectors(u, v);
    const flip = cross.dot(n) < 0;
    const ids = corners.map((p, i) => gb.vert({ p: [p.x, p.y, p.z], n: [n.x, n.y, n.z], uv: [i & 1, i >> 1] }));
    if (flip) gb.quad(ids[1], ids[0], ids[3], ids[2]);
    else gb.quad(ids[0], ids[1], ids[2], ids[3]);
  }
}

// a bar between two points a and b lying in a plane with normal nrm: flat face
// (half width hw) toward nrm, half thickness ht
function bar(gb, a, b, nrm, hw, ht) {
  const along = b.clone().sub(a);
  const len = along.length();
  along.divideScalar(len);
  const across = new THREE.Vector3().crossVectors(nrm, along).normalize();
  box(gb, a.clone().add(b).multiplyScalar(0.5), nrm, across, along, ht, hw, len / 2);
}

export function buildGrid(P, U, anchors) {
  const W = P.dims.W;
  const G = P.outside.grid;
  const group = new THREE.Group();
  group.name = "outsideGrid";
  const hb = (G.bar * W) / 2; // half the flat's width (seen face on)
  const ht = (G.thick * W) / 2; // half its thickness
  const d = G.depth * W;
  const wallZ = -(P.room?.wall?.thickness ?? 2.4) * W; // the outer face of the house wall (room params)
  const y0 = G.bottom * W, y1 = G.top * W;
  const xL = G.leftStart * W, xR = G.rightEnd * W;

  // --- the plane: through (pivot, -depth), turned planDeg so its right end comes
  // toward the house. Every point is addressed by its WORLD x and y (the fit's
  // coordinates); zAt(x) puts it on the plane.
  const phi = (G.planDeg ?? 0) * (Math.PI / 180);
  const slope = Math.tan(phi);
  const pivot = (G.pivot ?? 0.5) * W;
  const N = new THREE.Vector3(-Math.sin(phi), 0, Math.cos(phi)); // the plane's normal, toward the room
  const zAt = (x) => -d + slope * (x - pivot);
  // a point of the plane by world x and y, `back` metres further out along -N
  const at = (x, y, back = 0) => new THREE.Vector3(x, y, zAt(x)).addScaledVector(N, -back);

  const gb = new GeoBuilder({});
  // verticals, in front
  const px = G.pitchX * W, py = G.pitchY * W;
  const vertX = [];
  for (let k = Math.ceil((xL + hb - G.firstX * W) / px); ; k++) {
    const x = G.firstX * W + k * px;
    if (x > xR - hb) break;
    vertX.push(x);
  }
  for (const x of vertX) bar(gb, at(x, y0), at(x, y1), N, hb, ht);
  // horizontals, just behind them (flats welded back to back)
  const horizY = [];
  for (let k = Math.ceil((y0 + hb - G.firstY * W) / py); ; k++) {
    const y = G.firstY * W + k * py;
    if (y > y1 - hb) break;
    horizY.push(y);
  }
  for (const y of horizY) bar(gb, at(xL, y, 2 * ht), at(xR, y, 2 * ht), N, hb, ht);
  // the frame: angle iron round the edge, heavier than the flats (out of view on
  // every runway frame; it only closes the box for shadows and the closing shot)
  const fb = hb * 1.4;
  bar(gb, at(xL, y0), at(xR, y0), N, fb, ht * 2);
  bar(gb, at(xL, y1), at(xR, y1), N, fb, ht * 2);
  bar(gb, at(xL, y0), at(xL, y1), N, fb, ht * 2);
  bar(gb, at(xR, y0), at(xR, y1), N, fb, ht * 2);
  // the long brace, behind the horizontals, clipped to the frame
  for (const dg of G.diagonals || []) {
    let [ax, ay, bx, by] = dg.map((v) => v * W);
    const dx = bx - ax, dy = by - ay;
    let t0 = -Infinity, t1 = Infinity;
    for (const [p0, dp, lo, hi] of [
      [ax, dx, xL, xR],
      [ay, dy, y0, y1],
    ]) {
      if (Math.abs(dp) < 1e-9) continue;
      const ta = (lo - p0) / dp, tb = (hi - p0) / dp;
      t0 = Math.max(t0, Math.min(ta, tb));
      t1 = Math.min(t1, Math.max(ta, tb));
    }
    if (!(t1 > t0)) continue;
    bar(gb, at(ax + dx * t0, ay + dy * t0, 4 * ht), at(ax + dx * t1, ay + dy * t1, 4 * ht), N, hb, ht);
  }
  // the returns back to the house wall: top and bottom rails only (out of view;
  // mid-height rails on the right return would cross R2's view)
  const rs = anchors?.rightSection;
  let wallZRight = wallZ;
  if (rs) {
    // the right section's outer wall face: its glass plane moved out by the wall
    rs.updateWorldMatrix(true, false);
    const o = new THREE.Vector3().setFromMatrixPosition(rs.matrixWorld);
    const ex = new THREE.Vector3().setFromMatrixColumn(rs.matrixWorld, 0).normalize();
    const ez = new THREE.Vector3().setFromMatrixColumn(rs.matrixWorld, 2).normalize();
    const base = o.clone().addScaledVector(ez, wallZ);
    if (Math.abs(ex.x) > 1e-6) wallZRight = base.z + ex.z * ((xR - base.x) / ex.x);
  }
  for (const y of [y0, y1]) {
    const zl = zAt(xL), zr = zAt(xR);
    if (wallZ > zl) bar(gb, new THREE.Vector3(xL, y, zl), new THREE.Vector3(xL, y, wallZ), new THREE.Vector3(1, 0, 0), fb, ht * 2);
    if (wallZRight > zr) bar(gb, new THREE.Vector3(xR, y, zr), new THREE.Vector3(xR, y, wallZRight), new THREE.Vector3(-1, 0, 0), fb, ht * 2);
  }

  // --- material: flat tan paint, smooth, no albedo noise ------------------------------------
  // The one texture is the edge: in 5481 each flat reads as a clean tan face between
  // two thin dark lines (the paint rolled over the edge, the flat's side in shadow).
  // A face's uv.x runs across the flat on its front and back (box() above), so the
  // face darkens over the outer fifth of its width on each side.
  const across = uv().x;
  const edgeLine = float(1).sub(smoothstep(0.0, 0.2, min(across, float(1).sub(across))));
  const mat = outdoorMaterial(U, {
    albedo: linv(G.color).mul(float(1).sub(edgeLine.mul(G.edge ?? 0))),
    roughness: float(G.roughness ?? 0.55),
    ambient: G.ambient,
    rim: 0.6,
    wetDarken: 0.3,
    haze: 0,
    name: "outsideGrid",
  });

  const geo = gb.build();
  const mesh = new THREE.Mesh(geo, mat);
  mesh.name = "gridMesh";
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  group.add(mesh);

  // where drips can fall from (for rain.js): the horizontal bars' lower edges over
  // the span any runway frame sees through the glass (world, metres)
  const [vx0, vx1] = (G.dripSpan || [-2.2, 6.0]).map((v) => v * W);
  const dripBars = horizY.map((y) => ({ y: y - hb, x0: vx0, x1: vx1, z0: zAt(vx0) - 2 * ht, z1: zAt(vx1) - 2 * ht }));

  return {
    group,
    dripBars,
    depth: d,
    zAt,
    dispose() {
      geo.dispose();
      mat.dispose();
      group.removeFromParent();
    },
  };
}
