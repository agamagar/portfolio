// A VR headset miniature (Agam, 2026-10-05: "a vr headset", "turn around the VR
// headset and make it much smaller", "model the vr for quest 3", then "the VR
// headset needs to be SHAPED like the quest 3").
//
// The Meta Quest 3's shape, as documented: a soap-bar visor about 184 mm wide and
// 98 mm tall, its top and bottom edges heavily rounded; seen from above the shell
// narrows from the front toward the face; the front carries three vertical
// pill-shaped dark sensor areas (left, centre, right); a dark facial interface with
// a nose cut-out. The strap is left off (Agam: "remove the strap"). No brand marks.
//
// Built in real metres and scaled 1:3 by its group, so the miniature is about 6 cm
// wide and sits with the toys. TURNED AROUND: the face side (the interface and the
// lenses) faces the room (+z), the sensor front faces the wall (-z).
// Frame: x along the edge, y up, z toward the camera; origin on the edge's top.

import * as THREE from "three/webgpu";
import { Batch, M } from "./geom.js";

const SCALE = 1 / 3;

// a rounded trapezoid in the extrude plane: half-width wf at the front (y = yf),
// wb at the back (y = yb), corner radius r
function trapezoid(wf, wb, yf, yb, r) {
  const s = new THREE.Shape();
  s.moveTo(-wf + r, yf);
  s.lineTo(wf - r, yf);
  s.quadraticCurveTo(wf, yf, wf, yf + Math.sign(yb - yf) * r);
  s.lineTo(wb, yb - Math.sign(yb - yf) * r);
  s.quadraticCurveTo(wb, yb, wb - r, yb);
  s.lineTo(-wb + r, yb);
  s.quadraticCurveTo(-wb, yb, -wb, yb - Math.sign(yb - yf) * r);
  s.lineTo(-wf, yf + Math.sign(yb - yf) * r);
  s.quadraticCurveTo(-wf, yf, -wf + r, yf);
  return s;
}

export function buildVrHeadset(mats, parent) {
  const shellM = new THREE.MeshPhysicalMaterial({ name: "vrShell", color: 0xeceae6, roughness: 0.42, metalness: 0, clearcoat: 0.35, clearcoatRoughness: 0.4 });
  const pillM = new THREE.MeshPhysicalMaterial({ name: "vrPill", color: 0x101114, roughness: 0.12, metalness: 0.1, clearcoat: 1, clearcoatRoughness: 0.06 });
  const faceM = new THREE.MeshStandardMaterial({ name: "vrInterface", color: 0x2f3034, roughness: 0.9 });
  // the lenses are glass: near-black, mirror smooth and coated, so they pick up the
  // room's lights (Agam: "bring back the lens, which will glisten in base state")
  const lensM = new THREE.MeshPhysicalMaterial({ name: "vrLens", color: 0x1c2230, roughness: 0.02, metalness: 0.6, clearcoat: 1, clearcoatRoughness: 0, envMapIntensity: 1.6 });
  const B = new Batch("vr");
  const S = new THREE.Matrix4().makeScale(SCALE, SCALE, SCALE);
  const add = (mat, g, mtx) => B.add(mat, g, mtx ? S.clone().multiply(mtx) : S);

  // --- the visor shell: 184 x 98 mm, about 70 mm deep, narrowing toward the face.
  // Drawn from above (x across, y = -z), extruded upward, and given a big bevel so
  // the top and bottom edges roll round like a bar of soap
  const H = 0.098, DEPTH = 0.07, BEV = 0.022;
  const zFront = -DEPTH / 2, zFace = DEPTH / 2;
  const plan = trapezoid(0.092 - BEV, 0.082 - BEV, -zFront - 0.004, -zFace + 0.004, 0.02);
  const shell = new THREE.ExtrudeGeometry(plan, { depth: H - 2 * BEV, bevelEnabled: true, bevelThickness: BEV, bevelSize: BEV, bevelSegments: 5, curveSegments: 10 });
  shell.rotateX(-Math.PI / 2); // extrude axis -> up; the plan's y -> -z
  shell.translate(0, BEV, 0); // its foot on y = 0
  add(shellM, shell);

  // --- the front (facing the wall): three tall dark sensor pills, the side ones a
  // little larger, set into the shell's face
  for (const [x, w, h] of [[-0.058, 0.014, 0.036], [0, 0.011, 0.03], [0.058, 0.014, 0.036]]) {
    const pill = new THREE.SphereGeometry(1, 18, 12);
    pill.scale(w, h, 0.004);
    add(pillM, pill, M.T(x, H / 2, zFront - 0.0005));
  }

  // --- the face side (+z, toward the room): the dark facial interface, its nose
  // cut-out, and the two lenses
  // (render: the interface swamped the shell; a little smaller, so the white shell frames it)
  const iface = trapezoid(0.068, 0.064, -zFace, -zFace - 0.02, 0.016);
  const ifaceG = new THREE.ExtrudeGeometry(iface, { depth: H * 0.6, bevelEnabled: true, bevelThickness: 0.008, bevelSize: 0.006, bevelSegments: 3, curveSegments: 8 });
  ifaceG.rotateX(-Math.PI / 2);
  ifaceG.translate(0, H * 0.2 + 0.008, 0);
  add(faceM, ifaceG);
  // the nose cut-out: a shell-coloured notch filling the interface's bottom middle
  const nose = new THREE.SphereGeometry(1, 14, 10);
  nose.scale(0.016, 0.012, 0.012); // flatter: render 1 read as a white ball
  add(shellM, nose, M.T(0, H * 0.2, zFace + 0.014));
  for (const s of [-1, 1]) {
    const lens = new THREE.CylinderGeometry(0.019, 0.019, 0.004, 28);
    lens.rotateX(Math.PI / 2);
    add(lensM, lens, M.T(s * 0.03, H * 0.53, zFace + 0.0305)); // just proud of the interface, so they read
  }

  // (2026-10-05: "remove the strap from the VR headset": no arms, no band; the
  // shell and its face side alone)

  const g = new THREE.Group();
  g.name = "vrModel";
  g.position.y = 0.0005; // a hair of clearance on the edge
  B.build(g);
  parent.add(g);

  // the glisten: a soft highlight on each lens that sweeps across it every few
  // seconds while the headset sits still, like light running over curved glass. An
  // additive white ellipse clipped (by size) to the lens, its sweep eased in and out,
  // the two lenses a beat apart. It never blooms: the room's MRT emissive is unset
  const glints = [];
  for (const s of [-1, 1]) {
    const mat = new THREE.MeshBasicNodeMaterial({ color: 0xffffff, transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending });
    const glint = new THREE.Mesh(new THREE.CircleGeometry(1, 20), mat);
    glint.name = "vrLensGlint";
    glint.scale.set(0.004 * SCALE, 0.0115 * SCALE, 1);
    glint.rotation.z = -0.5; // a diagonal streak
    glint.renderOrder = 2;
    g.add(glint);
    glints.push({ glint, mat, cx: s * 0.03 * SCALE, cy: H * 0.53 * SCALE, z: (zFace + 0.0328) * SCALE, phase: s > 0 ? 0.18 : 0 });
  }
  const PERIOD = 4.2, SWEEP = 0.9; // s between sweeps, s a sweep takes
  let t = 0;
  function update(dt) {
    t += dt;
    for (const gl of glints) {
      const k = ((t / PERIOD + gl.phase) % 1) * PERIOD; // seconds into this cycle
      const u = Math.min(1, k / SWEEP); // 0..1 across the lens
      const e = u * u * (3 - 2 * u); // eased
      const R = 0.014 * SCALE; // how far it travels from the centre
      gl.glint.position.set(gl.cx - R + 2 * R * e, gl.cy + R * 0.6 - 1.2 * R * e, gl.z);
      gl.mat.opacity = k < SWEEP ? 0.55 * Math.sin(Math.PI * u) : 0;
    }
  }
  // it has no head to nod: room.js feeds every toy's motion, so this is a no-op
  return { group: g, update, jiggle() {} };
}
