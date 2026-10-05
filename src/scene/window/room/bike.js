// A die-cast miniature of a Royal Enfield Meteor 350 on the monitor's top edge
// (2026-09-27, Agam: "remove that and add a small miniature model of a Meteor 350";
// it replaces the souvenir tile). About 1:30, 7 cm long like the woodie beside it.
// Modelled in real metres (x along the bike, front at +x; y up; z across) and scaled
// down by the group: the cruiser read is the silhouette, so the parts that make it
// are here, the rest is left out. A 19" front and 17" rear alloy wheel, the teardrop
// tank in Fireball red over a chrome-and-black single, a low stepped seat, a round
// headlamp on raked forks, the wide pulled-back bars, the long chrome exhaust on the
// right, fenders, and the side stand, the bike leaning on it to the left.

import * as THREE from "three/webgpu";
import { Batch, M } from "./geom.js";

const SCALE = 1 / 30;
const WB = 1.4; // wheelbase
const FX = WB / 2, RX = -WB / 2, FR = 0.33, RR = 0.31;

export function buildBike(mats, parent) {
  const m = mats.m;
  const paint = new THREE.MeshPhysicalMaterial({ name: "bikePaint", color: 0xa3161a, roughness: 0.28, metalness: 0.1, clearcoat: 1, clearcoatRoughness: 0.08 });
  const black = new THREE.MeshStandardMaterial({ name: "bikeBlack", color: 0x151517, roughness: 0.55, metalness: 0.3 });
  const alloy = new THREE.MeshStandardMaterial({ name: "bikeAlloy", color: 0x2a2a2e, roughness: 0.35, metalness: 0.8 });
  const seatM = new THREE.MeshStandardMaterial({ name: "bikeSeat", color: 0x2b1d16, roughness: 0.7 });
  const B = new Batch("bike");
  const S = new THREE.Matrix4().makeScale(SCALE, SCALE, SCALE);
  const add = (mat, g, mtx) => B.add(mat, g, mtx ? S.clone().multiply(mtx) : S);
  // a bar between two points
  const bar = (mat, a, b, r) => {
    const A = new THREE.Vector3(...a), Bv = new THREE.Vector3(...b);
    const g = new THREE.CylinderGeometry(r, r, A.distanceTo(Bv), 10);
    const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), Bv.clone().sub(A).normalize());
    add(mat, g, new THREE.Matrix4().compose(A.clone().add(Bv).multiplyScalar(0.5), q, new THREE.Vector3(1, 1, 1)));
  };
  const blob = (mat, [x, y, z], [sx, sy, sz], seg = 20) => {
    const g = new THREE.SphereGeometry(1, seg, Math.round(seg * 0.6));
    g.scale(sx, sy, sz);
    add(mat, g, M.T(x, y, z));
  };

  // wheels: tyre, alloy disc with six spokes, hub
  for (const [x, r] of [[FX, FR], [RX, RR]]) {
    add(m.tyre, new THREE.TorusGeometry(r - 0.065, 0.07, 12, 36), M.T(x, r, 0));
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2;
      bar(alloy, [x, r, 0], [x + Math.cos(a) * (r - 0.09), r + Math.sin(a) * (r - 0.09), 0], 0.018);
    }
    add(alloy, new THREE.TorusGeometry(r - 0.09, 0.012, 6, 32), M.T(x, r, 0));
    const hub = new THREE.CylinderGeometry(0.06, 0.06, 0.12, 14);
    hub.rotateX(Math.PI / 2);
    add(m.chrome, hub, M.T(x, r, 0));
  }
  // forks, raked, from the front axle to the steering head
  const head = [0.5, 1.0];
  for (const z of [-0.09, 0.09]) {
    bar(m.chrome, [FX, FR, z], [head[0], head[1], z], 0.028);
  }
  // headlamp nacelle and lamp, the round speedo above it
  blob(m.chrome, [0.6, 0.92, 0], [0.09, 0.09, 0.09]);
  blob(black, [0.5, 1.07, 0], [0.05, 0.03, 0.05]);
  // handlebar: wide, pulled back to the rider
  bar(m.chrome, [0.48, 1.08, -0.18], [0.48, 1.08, 0.18], 0.016);
  for (const s of [-1, 1]) {
    bar(m.chrome, [0.48, 1.08, s * 0.18], [0.36, 1.1, s * 0.4], 0.016);
    bar(black, [0.36, 1.1, s * 0.4], [0.3, 1.1, s * 0.47], 0.022);
  }
  // mirrors
  for (const s of [-1, 1]) {
    bar(m.chrome, [0.42, 1.09, s * 0.3], [0.44, 1.26, s * 0.34], 0.008);
    blob(m.chrome, [0.44, 1.28, s * 0.35], [0.02, 0.045, 0.045], 10);
  }
  // frame: backbone under the tank, down tube, the rear loop
  bar(black, [head[0], head[1] - 0.05, 0], [-0.15, 0.72, 0], 0.03);
  bar(black, [head[0], head[1] - 0.08, 0], [0.28, 0.25, 0], 0.03);
  bar(black, [0.28, 0.25, 0], [-0.28, 0.25, 0], 0.028);
  for (const z of [-0.12, 0.12]) {
    bar(black, [-0.15, 0.72, z], [-0.72, 0.76, z], 0.024);
    bar(black, [-0.28, 0.25, z], [RX, RR, z], 0.026); // swingarm
    bar(m.chrome, [-0.55, 0.78, z], [RX + 0.05, RR + 0.05, z], 0.03); // twin shocks
  }
  // the teardrop tank, its chrome badge line and the cap
  blob(paint, [0.16, 0.86, 0], [0.34, 0.15, 0.17], 24);
  blob(m.chrome, [0.22, 1.0, 0], [0.035, 0.012, 0.035], 10);
  for (const s of [-1, 1]) blob(m.chrome, [0.16, 0.86, s * 0.165], [0.09, 0.02, 0.012], 10);
  // side panels under the seat
  for (const s of [-1, 1]) blob(paint, [-0.2, 0.6, s * 0.12], [0.17, 0.12, 0.04], 14);
  // the engine: crankcase, a finned cylinder leaning forward, the head
  blob(alloy, [0.02, 0.42, 0], [0.28, 0.18, 0.15], 18);
  for (let i = 0; i < 7; i++) {
    const y = 0.52 + i * 0.035;
    const fin = new THREE.CylinderGeometry(0.12 - i * 0.004, 0.12 - i * 0.004, 0.012, 16);
    add(i > 4 ? m.chrome : black, fin, M.mul(M.T(0.1 + i * 0.008, y, 0), M.RZ(-0.2)));
  }
  // the long exhaust on the right (+z), header down and back, the peashooter can
  bar(m.chrome, [0.18, 0.72, 0.08], [0.2, 0.3, 0.17], 0.028);
  bar(m.chrome, [0.2, 0.3, 0.17], [-0.3, 0.3, 0.2], 0.03);
  bar(m.chrome, [-0.3, 0.3, 0.2], [-0.95, 0.42, 0.2], 0.042);
  // seats: the low rider saddle and the stepped pillion
  blob(seatM, [-0.24, 0.72, 0], [0.24, 0.07, 0.18], 18);
  blob(seatM, [-0.55, 0.79, 0], [0.13, 0.045, 0.11], 16);
  // fenders: arcs over both wheels
  // (a torus arc starts at +x and runs counter-clockwise: over the top of each wheel)
  const fender = (x, r, from, arc) => {
    const g = new THREE.TorusGeometry(r + 0.05, 0.06, 6, 24, arc);
    g.scale(1, 1, 1.4);
    g.rotateZ(from);
    add(paint, g, M.T(x, r, 0));
  };
  fender(FX, FR, 0.25, 2.1);
  fender(RX, RR, 0.9, 2.2);
  blob(paint, [RX - 0.3, 0.55, 0], [0.04, 0.03, 0.06], 10); // tail lamp housing
  // footpegs and the side stand, on the left (-z)
  for (const s of [-1, 1]) bar(black, [0.12, 0.3, s * 0.12], [0.12, 0.3, s * 0.26], 0.018);
  bar(black, [-0.05, 0.28, -0.14], [-0.2, 0.0, -0.32], 0.016);

  // lean onto the stand: roll about x toward -z
  const g = new THREE.Group();
  g.name = "bikeModel";
  g.rotation.x = -0.1;
  g.position.y = 0.0015;
  B.build(g);
  parent.add(g);
  return g;
}
