// A modular switchboard on the wall: one white plate with a 6/16 A universal socket
// (the round-pin kind Indian rooms use) and a rocker switch beside it. Unbranded, no
// markings. Built in metres, the group's origin at the plate's centre with its back on
// the wall (z = 0), facing +z. Uses the room's shared whitePlastic / dark materials,
// no textures.

import * as THREE from "three/webgpu";
import { Batch, rboxGeo, bezelFrameGeo, M } from "./geom.js";

export function buildWallPlate(mats, parent, { w = 0.086, h = 0.086 } = {}) {
  const m = mats.m;
  const g = new THREE.Group();
  g.name = "wallPlate";
  parent.add(g);
  const B = new Batch("wallPlate");
  const d = 0.009;
  // the plate: a soft-cornered slab with a chamfered raised frame ring on top
  B.add(m.whitePlastic, rboxGeo(-w / 2, w / 2, -h / 2, h / 2, 0, d, 0.0025, 3));
  B.add(m.whitePlastic, bezelFrameGeo({ ow: w - 0.012, oh: h - 0.012, iw: w - 0.02, ih: h - 0.02, z0: d - 0.0005, z1: d + 0.0014, r: 0.0015, ri: 0.001, ch: 0.0004 }));
  // two fixing screws, top and bottom, their slots a dark line
  for (const sy of [-1, 1]) {
    const sc = new THREE.CylinderGeometry(0.0021, 0.0021, 0.0012, 12);
    sc.rotateX(Math.PI / 2);
    B.add(m.screwSteel, sc, M.T(0, sy * (h / 2 - 0.0075), d + 0.0006), { cast: false });
    B.add(m.dark, new THREE.BoxGeometry(0.0034, 0.0004, 0.0004), M.T(0, sy * (h / 2 - 0.0075), d + 0.0013), { cast: false });
  }
  // the socket on the left: a round-cornered face with an earth hole above two pin holes
  const sx = -0.016;
  B.add(m.whitePlastic, rboxGeo(sx - 0.015, sx + 0.015, -0.026, 0.026, d, d + 0.0022, 0.003, 2));
  const hole = (x, y, r) => {
    const c = new THREE.CircleGeometry(r, 14);
    B.add(m.dark, c, M.T(x, y, d + 0.0024), { cast: false, receive: false });
  };
  hole(sx, 0.012, 0.0032); // earth
  hole(sx - 0.007, -0.01, 0.0023);
  hole(sx + 0.007, -0.01, 0.0023);
  // the switch on the right: a rocker in a bezel, tipped a few degrees
  const wx = 0.019;
  B.add(m.whitePlastic, bezelFrameGeo({ ow: 0.016, oh: 0.03, iw: 0.0118, ih: 0.0258, z0: d, z1: d + 0.0028, r: 0.002, ri: 0.0012, ch: 0.0005, cx: wx, cy: 0 }));
  const rocker = rboxGeo(-0.0055, 0.0055, -0.012, 0.012, 0, 0.0034, 0.0015, 2);
  rocker.rotateX(0.14);
  B.add(m.whitePlastic, rocker, M.T(wx, 0, d + 0.0006));
  B.build(g);
  return g;
}
