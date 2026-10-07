// A Zepto delivery scooter, die-cast at 1:30 like the Meteor 350 beside it (Agam,
// 2026-10-05: "build the zepto scooter", then "render the scooter after Ather's
// Rizta"). Modelled in real metres (x along the scooter, front at +x; y up; z
// across) and scaled down by the group, as bike.js is.
//
// The Ather Rizta's documented cues, from its launch coverage: a chubby, rounded
// family scooter (chubbier than the 450); a BOXY front apron with the LED headlamp
// and the indicators in one unit, low and centred on it; curvy rounded side panels;
// the longest seat in its class, flat, about 900 mm; a roomy flat floorboard; 12"
// wheels that look small under the bulky body. The paint here is a white body over
// dark grey lower panels. The Zepto delivery box rides on the pillion: the brand
// purple with a lighter lid band. No logos: at 6 cm they would only be noise.

import * as THREE from "three/webgpu";
import { RoundedBoxGeometry } from "three/addons/geometries/RoundedBoxGeometry.js";
import { Batch, M } from "./geom.js";

const SCALE = 1 / 36; // 2026-10-05 ("scooter is a little big"): smaller than the bikes' 1:30
const WB = 1.32; // wheelbase
const FX = WB / 2 + 0.04, RX = -WB / 2 + 0.04, WR = 0.225; // axles and the 12" wheel's radius

export function buildScooter(mats, parent) {
  const m = mats.m;
  const body = new THREE.MeshPhysicalMaterial({ name: "scooterBody", color: 0xeceae5, roughness: 0.28, metalness: 0.05, clearcoat: 0.9, clearcoatRoughness: 0.1 });
  const lower = new THREE.MeshStandardMaterial({ name: "scooterLower", color: 0x3a3c40, roughness: 0.55, metalness: 0.1 });
  const black = new THREE.MeshStandardMaterial({ name: "scooterBlack", color: 0x151518, roughness: 0.6, metalness: 0.2 });
  const box = new THREE.MeshStandardMaterial({ name: "zeptoBox", color: 0x4a1d96, roughness: 0.55, metalness: 0 });
  const lid = new THREE.MeshStandardMaterial({ name: "zeptoLid", color: 0x7b4fd6, roughness: 0.5, metalness: 0 });
  const lamp = new THREE.MeshStandardMaterial({ name: "scooterLamp", color: 0xf4f2ea, roughness: 0.1, metalness: 0, emissive: 0x3a362a });
  const amber = new THREE.MeshStandardMaterial({ name: "scooterIndicator", color: 0xd98a1c, roughness: 0.2, emissive: 0x2a1704 });
  const tail = new THREE.MeshStandardMaterial({ name: "scooterTail", color: 0xa01818, roughness: 0.3, emissive: 0x200404 });
  const seatM = new THREE.MeshStandardMaterial({ name: "scooterSeat", color: 0x2a2421, roughness: 0.8 });
  const B = new Batch("scooter");
  const S = new THREE.Matrix4().makeScale(SCALE, SCALE, SCALE);
  const add = (mat, g, mtx) => B.add(mat, g, mtx ? S.clone().multiply(mtx) : S);
  const rbox = (mat, [x, y, z], [sx, sy, sz], r, rz = 0) =>
    add(mat, new RoundedBoxGeometry(sx, sy, sz, 4, Math.min(r, sx / 2, sy / 2, sz / 2)), rz ? M.mul(M.T(x, y, z), M.RZ(rz)) : M.T(x, y, z));
  const bar = (mat, a, b, r) => {
    const A = new THREE.Vector3(...a), Bv = new THREE.Vector3(...b);
    const g = new THREE.CylinderGeometry(r, r, A.distanceTo(Bv), 10);
    const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), Bv.clone().sub(A).normalize());
    add(mat, g, new THREE.Matrix4().compose(A.clone().add(Bv).multiplyScalar(0.5), q, new THREE.Vector3(1, 1, 1)));
  };

  // wheels: fat 12" tyres on dark alloys, a disc on the front
  for (const x of [FX, RX]) {
    add(m.tyre, new THREE.TorusGeometry(WR - 0.055, 0.06, 12, 32), M.T(x, WR, 0));
    const rim = new THREE.CylinderGeometry(WR - 0.09, WR - 0.09, 0.09, 22);
    rim.rotateX(Math.PI / 2);
    add(black, rim, M.T(x, WR, 0));
  }
  const disc = new THREE.CylinderGeometry(0.1, 0.1, 0.01, 20);
  disc.rotateX(Math.PI / 2);
  add(m.chrome, disc, M.T(FX, WR, 0.055));
  // the front fork (mostly hidden by the apron) and the front mudguard hugging the tyre
  for (const z of [-0.065, 0.065]) bar(black, [FX, WR, z], [FX - 0.12, 0.62, z], 0.026);
  const guard = new THREE.TorusGeometry(WR + 0.03, 0.045, 6, 20, 1.9);
  guard.scale(1, 1, 1.6);
  guard.rotateZ(0.6);
  add(body, guard, M.T(FX, WR, 0));

  // the front apron: BOXY, broad and deep, raked back a little
  rbox(body, [0.5, 0.72, 0], [0.26, 0.78, 0.56], 0.1, -0.2);
  // the headlamp and indicator unit, low and centred on the apron's face (one
  // horizontal lamp with an amber indicator at each end)
  rbox(lamp, [0.645, 0.6, 0], [0.03, 0.09, 0.3], 0.03, -0.2);
  for (const s of [-1, 1]) rbox(amber, [0.643, 0.6, s * 0.19], [0.03, 0.06, 0.07], 0.025, -0.2);
  // the dark lower skirt of the apron, down to the floorboard
  rbox(lower, [0.42, 0.42, 0], [0.24, 0.2, 0.5], 0.07, -0.2);

  // the handlebar: a rounded cowl over the steering with the dash on top, black
  // grips and short mirrors
  rbox(body, [0.42, 1.14, 0], [0.24, 0.14, 0.58], 0.06);
  rbox(black, [0.37, 1.22, 0], [0.12, 0.02, 0.22], 0.008); // the dash screen
  for (const s of [-1, 1]) {
    bar(black, [0.42, 1.16, s * 0.29], [0.42, 1.16, s * 0.4], 0.024);
    bar(black, [0.42, 1.2, s * 0.22], [0.38, 1.36, s * 0.3], 0.008);
    rbox(black, [0.38, 1.38, s * 0.31], [0.04, 0.05, 0.09], 0.02);
  }

  // the flat, roomy floorboard
  rbox(lower, [0.13, 0.31, 0], [0.56, 0.05, 0.44], 0.02);

  // the rear body: chubby, long and rounded, over dark grey lower panels
  rbox(body, [-0.43, 0.6, 0], [1.02, 0.42, 0.44], 0.17);
  rbox(lower, [-0.36, 0.38, 0], [0.86, 0.14, 0.4], 0.06);
  rbox(body, [0.06, 0.45, 0], [0.32, 0.24, 0.4], 0.09); // the rise from the floorboard
  rbox(tail, [-0.94, 0.62, 0], [0.04, 0.07, 0.24], 0.02); // the tail lamp

  // the long flat seat (about 900 mm), wide, from the rise to the tail
  rbox(seatM, [-0.38, 0.85, 0], [0.9, 0.09, 0.34], 0.04);
  // the grab rail behind the rider
  rbox(lower, [-0.82, 0.86, 0], [0.12, 0.05, 0.38], 0.02);

  // the Zepto box, strapped over the pillion: a 50 cm cube, the lid band on top,
  // a dark latch on its rear face
  rbox(box, [-0.62, 1.15, 0], [0.5, 0.5, 0.48], 0.03);
  rbox(lid, [-0.62, 1.42, 0], [0.52, 0.05, 0.5], 0.02);
  rbox(black, [-0.875, 1.17, 0], [0.012, 0.07, 0.16], 0.004);

  // the side stand, out on the left (-z)
  bar(black, [-0.05, 0.3, -0.16], [-0.18, 0.0, -0.3], 0.016);

  const g = new THREE.Group();
  g.name = "scooterModel";
  g.rotation.x = -0.06; // a slight lean onto the stand, like the Meteor
  g.position.y = 0.0012;
  B.build(g);
  parent.add(g);
  return g;
}
