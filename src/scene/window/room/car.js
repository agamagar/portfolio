// The Hot Wheels woodie on the sill (13-photo 8; 5481, 5483): a rounded 1940s-50s
// wagon casting about 7 cm long in pearl silver-grey, blue and teal surf graphics
// over the rear two thirds of each side with the white logo on the rear quarter and
// an orange cartoon on the door, a tall chrome blower through the hood under a gold
// scoop, a gold toothed grille, a teal surfboard on the roof, a chrome side pipe,
// black wheels with copper rims. Built in metres in its own frame: x along the car
// (front at +x, it faces right from the chair), y up, z across.
//
// Round 2: round 1 extruded one side silhouette, a slab-sided box that read as a
// dark van with a flat roof (the photo critic, c5483). Now the body and the cabin
// are lofted from rounded (superellipse) sections: pontoon sides that roll under,
// fenders that swell over the wheels, a crowned roof, a raked windshield and a
// rounded tail.

import * as THREE from "three/webgpu";
import { Batch, boxGeo, M } from "./geom.js";

const L = 0.07; // length
const FRONT_WHEEL = 0.0215, REAR_WHEEL = -0.0225, WHEEL_R = 0.0062;
const Y0 = 0.004, YSPAN = 0.022; // the livery's v: 0 at the rocker, about 0.93 at the roof (it repeats past 1)

// A loft through rounded sections. stations: [x, yBottom, yTop, halfWidth, n]
// (n: the superellipse exponent, 2 an ellipse, higher a rounder box). Both ends are
// closed with a fan. UVs: u along the car (0 at the tail, 1 at the nose), v up (the
// livery's frame).
function loft(stations, seg = 28) {
  const pos = [], uvs = [], idx = [];
  const ring = seg;
  stations.forEach(([x, yb, yt, hw, n]) => {
    const yc = (yb + yt) / 2, hh = (yt - yb) / 2;
    for (let i = 0; i < ring; i++) {
      const a = (i / ring) * Math.PI * 2;
      const c = Math.cos(a), s = Math.sin(a);
      const e = 2 / n;
      const z = hw * Math.sign(c) * Math.pow(Math.abs(c), e);
      const y = yc + hh * Math.sign(s) * Math.pow(Math.abs(s), e);
      pos.push(x, y, z);
      uvs.push((x + L / 2) / L, (y - Y0) / YSPAN);
    }
  });
  for (let j = 0; j < stations.length - 1; j++)
    for (let i = 0; i < ring; i++) {
      const a = j * ring + i, b = j * ring + ((i + 1) % ring), c = a + ring, d = b + ring;
      idx.push(a, c, b, b, c, d);
    }
  const cap = (j, flip) => {
    const [x, yb, yt] = stations[j];
    const ci = pos.length / 3;
    pos.push(x, (yb + yt) / 2, 0);
    uvs.push((x + L / 2) / L, ((yb + yt) / 2 - Y0) / YSPAN);
    for (let i = 0; i < ring; i++) {
      const a = j * ring + i, b = j * ring + ((i + 1) % ring);
      if (flip) idx.push(ci, b, a);
      else idx.push(ci, a, b);
    }
  };
  cap(0, false);
  cap(stations.length - 1, true);
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute("uv", new THREE.Float32BufferAttribute(uvs, 2));
  g.setIndex(idx);
  g.computeVertexNormals();
  return g;
}

// a part painted all over in the plain pearl (a silver spot of the livery)
function pearl(g) {
  const uv = g.attributes.uv;
  for (let i = 0; i < uv.count; i++) uv.setXY(i, 0.92, 0.8);
  return g;
}

export function buildCar(mats, parent, { quality = "high" } = {}) {
  const m = mats.m;
  const CB = new Batch("car");
  const seg = quality === "low" ? 16 : 28;
  // the lower body, tail (-x) to nose (+x): the beltline at 14.8 mm, the sides
  // rolling under to the rocker, the fenders swelling over the wheels, the nose and
  // the tail rounded down
  const body = loft(
    [
      [-0.0362, 0.0082, 0.0108, 0.004, 2.5],
      [-0.0357, 0.0066, 0.0132, 0.0094, 2.8],
      [-0.0346, 0.0056, 0.0148, 0.0113, 3],
      [-0.032, 0.005, 0.0156, 0.0123, 3.2],
      [-0.025, 0.0049, 0.016, 0.0129, 3.2],
      [-0.015, 0.0049, 0.016, 0.0126, 3],
      [0.0, 0.0049, 0.0159, 0.0125, 3],
      [0.012, 0.0049, 0.0156, 0.0127, 3],
      [0.0205, 0.0049, 0.0154, 0.0132, 3.2],
      [0.0275, 0.005, 0.0147, 0.0129, 3.2],
      [0.0322, 0.0053, 0.0138, 0.0121, 3],
      [0.0347, 0.0058, 0.0124, 0.0107, 2.8],
      [0.0358, 0.0068, 0.0108, 0.0088, 2.6],
      [0.0362, 0.008, 0.0094, 0.004, 2.5],
    ],
    seg,
  );
  CB.add(m.carBody, body);
  // the cabin: tinted glass all round (the pillars and the roof skin go over it),
  // a raked windshield, a crowned roof, the wagon's near-upright tail
  const cabin = loft(
    [
      [-0.0348, 0.015, 0.0158, 0.0094, 2.6],
      [-0.0342, 0.015, 0.0204, 0.0098, 2.6],
      [-0.0322, 0.015, 0.0226, 0.0101, 2.6],
      [-0.024, 0.015, 0.0237, 0.0102, 2.6],
      [-0.012, 0.015, 0.0238, 0.0102, 2.6],
      [-0.004, 0.015, 0.0234, 0.0104, 2.6],
      [0.0015, 0.015, 0.0222, 0.0107, 2.6],
      [0.006, 0.015, 0.0196, 0.0112, 2.6],
      [0.0095, 0.015, 0.016, 0.0116, 2.6],
    ],
    seg,
  );
  CB.add(m.carGlass, cabin);
  // the roof skin over the glass, and the pillars (B, C, D; the A-pillars along
  // the windshield)
  const roof = loft(
    [
      [-0.0339, 0.0192, 0.021, 0.0096, 2.6],
      [-0.0326, 0.019, 0.0231, 0.0104, 2.6],
      [-0.024, 0.0192, 0.0242, 0.0105, 2.6],
      [-0.012, 0.0192, 0.0243, 0.0105, 2.6],
      [-0.004, 0.0193, 0.0239, 0.0107, 2.6],
      [0.0012, 0.0198, 0.0229, 0.0104, 2.6],
    ],
    seg,
  );
  CB.add(m.carBody, roof);
  for (const [x, w] of [[-0.0322, 0.0034], [-0.0205, 0.0026], [-0.0075, 0.0024]]) CB.add(m.carBody, pearl(boxGeo(x - w / 2, x + w / 2, 0.0154, 0.0215, -0.0105, 0.0105, "y")));
  for (const s of [-1, 1]) {
    const a0 = new THREE.Vector3(0.0092, 0.0158, s * 0.0111), a1 = new THREE.Vector3(0.0012, 0.0224, s * 0.0103);
    const len = a0.distanceTo(a1);
    const g = boxGeo(-0.0007, 0.0007, 0, len, -0.0007, 0.0007, "y");
    g.applyMatrix4(new THREE.Matrix4().compose(a0, new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), a1.clone().sub(a0).normalize()), new THREE.Vector3(1, 1, 1)));
    CB.add(m.carBody, pearl(g));
  }
  // bumpers, the gold toothed grille, the headlights
  CB.add(m.chrome, boxGeo(0.0352, 0.0368, 0.0046, 0.0062, -0.0105, 0.0105, "z"));
  CB.add(m.chrome, boxGeo(-0.037, -0.0355, 0.005, 0.0066, -0.0102, 0.0102, "z"));
  for (let i = 0; i < 3; i++) CB.add(m.goldChrome, boxGeo(0.0346, 0.0366, 0.0064 + i * 0.002, 0.0078 + i * 0.002, -0.0092 + i * 0.0006, 0.0092 - i * 0.0006, "z"));
  for (let i = -5; i <= 5; i++) CB.add(m.goldChrome, boxGeo(0.0355, 0.0368, 0.0062, 0.0112, i * 0.0016 - 0.00035, i * 0.0016 + 0.00035, "y"));
  for (const s of [-1, 1]) CB.add(m.chrome, new THREE.SphereGeometry(0.0021, 12, 8), M.T(0.0318, 0.0128, s * 0.0094));
  // the blower through the hood: a chrome case, its pulley, two velocity stacks and
  // the gold bug-catcher scoop that stands above the roof line (5483)
  CB.add(m.chrome, boxGeo(0.0125, 0.0255, 0.0148, 0.0228, -0.0058, 0.0058, "x"));
  for (let i = 0; i < 5; i++) CB.add(m.chrome, boxGeo(0.0128 + i * 0.0026, 0.0138 + i * 0.0026, 0.0152, 0.0226, -0.0062, 0.0062, "x")); // the case's ribs
  for (const dz of [-0.0028, 0.0028]) CB.add(m.chrome, new THREE.CylinderGeometry(0.0025, 0.0023, 0.01, 14), M.T(0.019, 0.0262, dz));
  CB.add(m.goldChrome, boxGeo(0.0148, 0.0252, 0.029, 0.0326, -0.0062, 0.0062, "x"));
  for (let i = 0; i < 5; i++) CB.add(m.goldChrome, boxGeo(0.015 + i * 0.0021, 0.0162 + i * 0.0021, 0.0326, 0.0331, -0.0058, 0.0058, "x"));
  const pulley = new THREE.CylinderGeometry(0.0028, 0.0028, 0.0018, 16);
  pulley.rotateZ(Math.PI / 2);
  CB.add(m.chrome, pulley, M.T(0.0262, 0.0185, 0));
  // roof rails and the teal surfboard
  for (const dx of [-0.024, -0.009]) CB.add(m.tyre, boxGeo(dx - 0.0007, dx + 0.0007, 0.0239, 0.0249, -0.0096, 0.0096, "z"));
  const board = new THREE.SphereGeometry(0.5, 24, 10);
  board.scale(0.04, 0.003, 0.0105);
  CB.add(m.surf, board, M.T(-0.0165, 0.0259, 0));
  // the chrome side pipe along each rocker, between the wheels
  for (const s of [-1, 1]) {
    const pipe = new THREE.CylinderGeometry(0.0011, 0.0011, 0.03, 10);
    pipe.rotateZ(Math.PI / 2);
    CB.add(m.chrome, pipe, M.T(-0.0005, 0.0056, s * 0.0126));
  }
  // wheels: black tyres standing just proud of the fenders, a copper rim ring, a
  // chrome hub
  for (const wx of [FRONT_WHEEL, REAR_WHEEL])
    for (const s of [-1, 1]) {
      const tyreG = new THREE.CylinderGeometry(WHEEL_R, WHEEL_R, 0.0042, 24);
      tyreG.rotateX(Math.PI / 2);
      CB.add(m.tyre, tyreG, M.T(wx, WHEEL_R, s * 0.0118));
      const ring = new THREE.TorusGeometry(0.0041, 0.00065, 8, 24);
      CB.add(m.rim, ring, M.T(wx, WHEEL_R, s * 0.0139));
      const hub = new THREE.CylinderGeometry(0.0011, 0.0011, 0.0046, 10);
      hub.rotateX(Math.PI / 2);
      CB.add(m.chrome, hub, M.T(wx, WHEEL_R, s * 0.0119));
    }
  CB.build(parent);
}

// the car's frame for the livery painter (materials.js)
export const CAR = { L, FRONT_WHEEL, REAR_WHEEL, WHEEL_R, Y0, YSPAN };
