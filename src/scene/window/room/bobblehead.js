// Bobbleheads: a golden retriever and a cat (Agam, 2026-10-05: "a bobble head of a
// golden retriever", "make the dog bobblehead smaller", then "add one cat as well,
// make the dog smaller and a little closer to a golden retriever").
//
// Modelled at a real bobblehead's size in metres (x along the edge, y up, z toward
// the camera: the pet faces +z) and scaled down by SIZE. A sitting pet on a round
// base, the oversized head on a hidden spring at the neck. The head is its own
// group, pivoting at the neck, so room.js can drive it: jiggle(ax, ay, dt) takes the
// toy's acceleration in its monitor's frame (m/s^2), and the head swings on an
// underdamped spring, so a pick-up, a carry or a landing sets it nodding for a
// second or two after the hand stops. update(dt) runs every frame.
//
// The retriever, round 2: the first read as a cartoon puppy. A retriever is a long
// muzzle on a broad skull, ears set level with the eyes and hanging to the jaw with
// feathered edges, a cream ruff on the chest, a feathered plume of a tail, and a
// rich gold coat paler on the feathering. The cat: a grey tabby with a white chest
// and muzzle, upright triangular ears, green eyes, its tail wrapped round its paws.

import * as THREE from "three/webgpu";
import { Batch, M } from "./geom.js";

const SIZE = { dog: 0.42, cat: 0.42 }; // about 4.2 cm tall on the edge (2026-10-05: "make the cat and dog smaller", was 0.55)

export function buildBobblehead(mats, parent, kind = "dog") {
  const m = mats.m;
  const cat = kind === "cat";
  const vinyl = (name, color, rough = 0.45) => new THREE.MeshPhysicalMaterial({ name, color, roughness: rough, metalness: 0, clearcoat: 0.5, clearcoatRoughness: 0.3 });
  // coats: the retriever's rich gold over pale feathering; the tabby's grey over white
  const coat = vinyl(cat ? "catCoat" : "dogFur", cat ? 0x7d7a76 : 0xd29a4c);
  const pale = vinyl(cat ? "catWhite" : "dogPale", cat ? 0xefece6 : 0xf0d3a0);
  const stripe = vinyl("catStripe", 0x4a4743);
  const dark = new THREE.MeshStandardMaterial({ name: "petDark", color: 0x1a120c, roughness: 0.25 });
  const nose = new THREE.MeshStandardMaterial({ name: cat ? "catNose" : "dogNose", color: cat ? 0xd98b8f : 0x1a120c, roughness: 0.3 });
  const iris = new THREE.MeshStandardMaterial({ name: "catIris", color: 0x6fa33a, roughness: 0.2, emissive: 0x0c1404 });
  const tongue = new THREE.MeshStandardMaterial({ name: "dogTongue", color: 0xd8606a, roughness: 0.4 });
  const baseM = new THREE.MeshStandardMaterial({ name: "bobbleBase", color: 0x2a2523, roughness: 0.5, metalness: 0.1 });
  const blob = (B, mat, [x, y, z], [sx, sy, sz], seg = 20, rot = null) => {
    const g = new THREE.SphereGeometry(1, seg, Math.round(seg * 0.65));
    g.scale(sx, sy, sz);
    B.add(mat, g, rot ? M.mul(M.T(x, y, z), rot) : M.T(x, y, z));
  };

  const root = new THREE.Group();
  root.name = cat ? "catBobbleModel" : "bobbleheadModel";
  root.scale.setScalar(SIZE[kind] ?? 0.55);
  parent.add(root);

  // --- the base and the body (static) ---
  const BB = new Batch(cat ? "catBody" : "dogBody");
  BB.add(baseM, new THREE.CylinderGeometry(0.026, 0.028, 0.008, 28), M.T(0, 0.004, 0));
  if (cat) {
    // a slimmer, upright sit: the haunches, a narrow chest, the white bib
    // (2026-10-05: the haunches with two stripe rings round them read as a two-tier
    // grey platform under the cat; the rings are gone and the haunches sit low
    // and wide on the base, the back feet tucked beside them)
    // round 2: still a tier; now ONE pear of a body rising straight off the base,
    // the haunches folded into it, no tucked feet
    blob(BB, coat, [0, 0.024, -0.002], [0.014, 0.018, 0.015]);
    blob(BB, coat, [0, 0.037, 0.002], [0.012, 0.017, 0.011]);
    blob(BB, pale, [0, 0.034, 0.0105], [0.0075, 0.014, 0.005], 14);
    // front legs, white socks
    for (const s of [-1, 1]) {
      BB.add(coat, new THREE.CylinderGeometry(0.0034, 0.0038, 0.022, 10), M.T(s * 0.0055, 0.019, 0.01));
      blob(BB, pale, [s * 0.0055, 0.0095, 0.012], [0.0042, 0.003, 0.0055], 10);
    }
    // the tail, wrapped round the front of the paws
    const tail = new THREE.TorusGeometry(0.019, 0.0034, 8, 18, Math.PI * 1.1);
    tail.rotateX(Math.PI / 2);
    BB.add(coat, tail, M.mul(M.T(0, 0.0105, 0.0), M.RY(-0.3)));
  } else {
    // the retriever: haunches, a deeper chest, and the cream ruff that marks the breed
    blob(BB, coat, [0, 0.026, -0.005], [0.021, 0.019, 0.022]);
    blob(BB, coat, [0, 0.043, 0.002], [0.016, 0.02, 0.015]);
    blob(BB, pale, [0, 0.045, 0.012], [0.011, 0.016, 0.007], 14); // the ruff
    blob(BB, pale, [0, 0.035, 0.013], [0.008, 0.01, 0.006], 12);
    for (const s of [-1, 1]) {
      BB.add(coat, new THREE.CylinderGeometry(0.0042, 0.0046, 0.026, 10), M.T(s * 0.0065, 0.021, 0.011));
      blob(BB, pale, [s * 0.0065, 0.0095, 0.014], [0.0055, 0.0035, 0.007], 10);
      // feathering on the backs of the front legs
      blob(BB, pale, [s * 0.0065, 0.022, 0.0075], [0.0035, 0.009, 0.003], 10);
    }
    for (const s of [-1, 1]) blob(BB, coat, [s * 0.016, 0.012, 0.003], [0.006, 0.004, 0.011], 10);
    // the feathered plume of a tail, sweeping round onto the base
    const tail = new THREE.TorusGeometry(0.014, 0.0045, 8, 14, Math.PI * 0.85);
    tail.rotateY(Math.PI / 2);
    BB.add(coat, tail, M.mul(M.T(0.012, 0.012, -0.012), M.RY(-0.6)));
    blob(BB, pale, [0.02, 0.008, -0.004], [0.004, 0.004, 0.008], 10); // its pale tip
  }
  BB.build(root);

  // --- the head (bobbles): pivots at the neck ---
  const neck = new THREE.Group();
  neck.name = cat ? "catNeck" : "bobbleNeck";
  neck.position.set(0, cat ? 0.052 : 0.06, 0.004);
  root.add(neck);
  const HB = new Batch(cat ? "catHead" : "dogHead");
  if (cat) {
    // a round head, a short muzzle with a white whisker pad, upright ears, green eyes
    blob(HB, coat, [0, 0.019, 0.0], [0.02, 0.017, 0.018], 24);
    blob(HB, pale, [0, 0.012, 0.015], [0.009, 0.0065, 0.006], 14);
    blob(HB, nose, [0, 0.0145, 0.0205], [0.0022, 0.0017, 0.0015], 8);
    for (const s of [-1, 1]) {
      const ear = new THREE.ConeGeometry(0.0075, 0.014, 4);
      HB.add(coat, ear, M.mul(M.T(s * 0.012, 0.035, -0.002), M.RZ(-s * 0.3)));
      blob(HB, iris, [s * 0.008, 0.022, 0.0155], [0.0034, 0.0036, 0.0016], 10);
      blob(HB, dark, [s * 0.008, 0.022, 0.0168], [0.0011, 0.0029, 0.0008], 8); // the slit pupil
    }
    // forehead stripes, the tabby's M
    for (const s of [-1, 0, 1]) blob(HB, stripe, [s * 0.005, 0.031, 0.011], [0.0012, 0.004, 0.0015], 8);
  } else {
    // the retriever's head: a broad skull, a LONG muzzle forward (round 1 was a short
    // puppy snout), a black nose at its end, kind dark eyes, a happy tongue
    blob(HB, coat, [0, 0.022, 0.0], [0.02, 0.018, 0.019], 24);
    blob(HB, coat, [0, 0.013, 0.02], [0.0095, 0.0085, 0.014], 18); // the muzzle
    blob(HB, pale, [0, 0.009, 0.024], [0.0085, 0.006, 0.011], 14); // its pale underside
    blob(HB, dark, [0, 0.0155, 0.0335], [0.0045, 0.0033, 0.003], 10); // nose
    blob(HB, tongue, [0, 0.0045, 0.03], [0.004, 0.0045, 0.0018], 10);
    for (const s of [-1, 1]) {
      blob(HB, dark, [s * 0.0088, 0.0255, 0.0165], [0.0026, 0.003, 0.0016], 10); // eyes
      // the ears: set level with the eyes, hanging to the jaw, feathered paler edges
      blob(HB, coat, [s * 0.0195, 0.014, 0.001], [0.0045, 0.014, 0.0095], 14, M.RZ(s * 0.18));
      blob(HB, pale, [s * 0.021, 0.0045, 0.001], [0.0038, 0.0045, 0.008], 10);
    }
  }
  HB.build(neck);
  // the spring under the head, a short dark coil only visible as the head tips
  const coil = new THREE.Mesh(new THREE.CylinderGeometry(0.0035, 0.0035, 0.006, 10), m.steelDark);
  coil.position.y = neck.position.y - 0.003;
  root.add(coil);

  // the head's spring: two angles (pitch about x, roll about z), underdamped
  const st = { px: 0, vx: 0, pz: 0, vz: 0 };
  const K = cat ? 300 : 260, C = 2.2; // a long, soft nod: it rings for a second or two
  // the head lags its base like a pendulum: angular acceleration KA rad/s^2 per
  // m/s^2 of the base's (a head about 2 cm above its spring would take about 50;
  // softened, so a fast carry tips it, not flips it)
  const KA = 22;
  const MAX = 0.55;
  function jiggle(ax, ay, dt) {
    if (!(dt > 0)) return;
    // moving sideways rolls the head back the way it came (+x tips it toward -x,
    // which is +z rotation); lifting it nods it forward, a landing jolts it back
    st.vz += ax * KA * dt;
    st.vx += ay * KA * 0.6 * dt;
  }
  function update(dt) {
    if (!(dt > 0)) return;
    const n = Math.ceil(dt / 0.006), h = dt / n;
    for (let i = 0; i < n; i++) {
      st.vx += (-K * st.px - C * st.vx) * h;
      st.vz += (-K * st.pz - C * st.vz) * h;
      st.px += st.vx * h;
      st.pz += st.vz * h;
    }
    st.px = Math.max(-MAX, Math.min(MAX, st.px));
    st.pz = Math.max(-MAX, Math.min(MAX, st.pz));
    neck.rotation.set(st.px, 0, st.pz);
  }
  // a nudge on its own, for a hover or a tap
  function nudge(strength = 1) {
    st.vx += 1.2 * strength;
    st.vz += 0.6 * strength * (Math.random() < 0.5 ? -1 : 1);
  }
  return { group: root, jiggle, update, nudge };
}
