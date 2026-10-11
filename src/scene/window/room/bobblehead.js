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
// Round 3 (2026-10-11, Agam: "make the cat and dog models more detailed"): the
// stretched spheres are gone. Each pet is now sculpted as one smooth vinyl body and
// one head (petSculpt.js: a distance field meshed with surface nets), so the parts
// melt into each other the way a cast figure's do: thighs into the back, the stop
// between skull and muzzle, toes cut into the paws, a mouth line, eye sockets. The
// markings are painted per vertex (the retriever's cream ruff, feathering and
// darker ears; the tabby's mackerel stripes, the M on its brow, cheek lines, a
// ringed tail with a dark tip, white bib, muzzle and socks) with a soft occlusion
// baked into the creases. Eyes are glossy lenses with a painted iris and catch
// light, the noses wet and glossy, the cat's ears cupped with a pink inside and
// whiskers.
// The pose has some character: the retriever tilts its head, the cat glances
// across at the dog, its ringed tail wrapped round its paws, the tip lifted.

import * as THREE from "three/webgpu";
import { DOG_EYE, CAT_EYE } from "./petShapes.js";

// The sculpted bodies and heads, baked by tools/pets/bake.mjs (about 120 KB, meshopt
// compressed), fetched once with the room (never on page load) and shared by both.
const PETS_URL = `${import.meta.env?.BASE_URL ?? "/"}room/pets.glb`;
let petsPromise = null;
function loadPets() {
  petsPromise ||= (async () => {
    const [{ GLTFLoader }, { MeshoptDecoder }] = await Promise.all([
      import("three/addons/loaders/GLTFLoader.js"),
      import("three/addons/libs/meshopt_decoder.module.js"),
    ]);
    const gltf = await new GLTFLoader().setMeshoptDecoder(MeshoptDecoder).loadAsync(PETS_URL);
    const parts = {};
    // each named node holds one quantised mesh (its node transform dequantises it)
    gltf.scene.traverse((o) => { if (o.isMesh && o.parent?.name) parts[o.parent.name] = o; });
    return parts;
  })();
  petsPromise.catch(() => { petsPromise = null; }); // a failed fetch may be retried by a rebuild
  return petsPromise;
}
// start the fetch as this module loads (it ships in the room's lazy chunk, so with
// the room, not the page): the pets are then in place before the room's shader
// warm-up, which skips anything still hidden
if (typeof window !== "undefined") loadPets().catch(() => {});

const SIZE = { dog: 0.42, cat: 0.42 }; // about 4.2 cm tall on the edge (2026-10-05: "make the cat and dog smaller", was 0.55)
const NECK = { dog: [0, 0.06, 0.004], cat: [0, 0.0495, 0.0038] }; // the spring's pivot, in the model's frame

// ---------------------------------------------------------------------------
// Small glossy parts
// ---------------------------------------------------------------------------

// A 64 px eye: the iris (and a slit pupil for the cat), a dark rim, a catch light.
function eyeTexture(cat) {
  const S = 64;
  const cv = typeof document !== "undefined" ? document.createElement("canvas") : new OffscreenCanvas(S, S);
  cv.width = cv.height = S;
  const g = cv.getContext("2d");
  g.fillStyle = cat ? "#4e7a26" : "#120c08"; // the cat's iris runs to the lens edge: no dark ring in the fur
  g.fillRect(0, 0, S, S);
  const r = S * (cat ? 0.72 : 0.46);
  const grd = g.createRadialGradient(S / 2, S / 2, r * 0.15, S / 2, S / 2, r);
  if (cat) { grd.addColorStop(0, "#d8d24a"); grd.addColorStop(0.55, "#8fb43a"); grd.addColorStop(1, "#4e7a26"); }
  else { grd.addColorStop(0, "#7a4a24"); grd.addColorStop(0.6, "#4a2a14"); grd.addColorStop(1, "#24140a"); }
  g.fillStyle = grd;
  g.beginPath(); g.arc(S / 2, S / 2, r, 0, Math.PI * 2); g.fill();
  if (!cat) {
    g.strokeStyle = "rgba(20,12,6,0.85)"; g.lineWidth = S * 0.05;
    g.beginPath(); g.arc(S / 2, S / 2, r - S * 0.02, 0, Math.PI * 2); g.stroke();
  }
  g.fillStyle = "#050302";
  g.beginPath();
  if (cat) g.ellipse(S / 2, S / 2, S * 0.07, S * 0.36, 0, 0, Math.PI * 2);
  else g.arc(S / 2, S / 2, S * 0.2, 0, Math.PI * 2);
  g.fill();
  g.fillStyle = "rgba(255,252,244,0.95)";
  g.beginPath(); g.ellipse(S * 0.36, S * 0.33, S * 0.085, S * 0.07, -0.5, 0, Math.PI * 2); g.fill();
  g.fillStyle = "rgba(255,252,244,0.5)";
  g.beginPath(); g.arc(S * 0.62, S * 0.66, S * 0.035, 0, Math.PI * 2); g.fill();
  const tex = new THREE.CanvasTexture(cv);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 4;
  return tex;
}

// a lens: a flattened sphere with its front projected onto the eye texture
function eyeGeo(rx, ry, rz) {
  const g = new THREE.SphereGeometry(1, 16, 12);
  const p = g.attributes.position, uv = g.attributes.uv;
  for (let i = 0; i < p.count; i++) uv.setXY(i, 0.5 + p.getX(i) * 0.5, 0.5 + p.getY(i) * 0.5);
  g.scale(rx, ry, rz);
  return g;
}

// a nose: a sphere pinched to a rounded triangle, point down
function noseGeo(w, h, d) {
  const g = new THREE.SphereGeometry(1, 16, 10);
  const p = g.attributes.position;
  for (let i = 0; i < p.count; i++) {
    const y = p.getY(i);
    const k = 1 - 0.38 * Math.max(0, -y);
    p.setX(i, p.getX(i) * k * w);
    p.setY(i, y * h);
    p.setZ(i, p.getZ(i) * d);
  }
  g.computeVertexNormals();
  return g;
}

// the base: a rounded plinth turned on a lathe
function baseGeo() {
  const pts = [[0, 0], [0.028, 0], [0.0282, 0.0012], [0.0278, 0.0058], [0.0272, 0.0072], [0.0262, 0.0079], [0.024, 0.008], [0, 0.008]];
  return new THREE.LatheGeometry(pts.map(([r, y]) => new THREE.Vector2(r, y)), 48);
}

export function buildBobblehead(mats, parent, kind = "dog") {
  const m = mats.m;
  const cat = kind === "cat";
  const t0 = performance.now();
  const owned = []; // materials and textures this pet owns, freed with its geometry

  const coatM = new THREE.MeshPhysicalMaterial({
    name: cat ? "catCoat" : "dogFur", color: 0xffffff, vertexColors: true, roughness: 0.52, metalness: 0,
    clearcoat: 0.35, clearcoatRoughness: 0.4, sheen: 0.4, sheenRoughness: 0.55, sheenColor: cat ? 0xc8c4be : 0xf6d29a,
  });
  const eyeTex = eyeTexture(cat);
  const eyeM = new THREE.MeshPhysicalMaterial({ name: "petEye", map: eyeTex, roughness: 0.12, clearcoat: 1, clearcoatRoughness: 0.04 });
  const noseM = new THREE.MeshPhysicalMaterial({ name: cat ? "catNose" : "dogNose", color: cat ? 0xd98a8f : 0x17110d, roughness: cat ? 0.38 : 0.22, clearcoat: cat ? 0.4 : 0.9, clearcoatRoughness: 0.12 });
  const baseM = new THREE.MeshPhysicalMaterial({ name: "bobbleBase", color: 0x2a2523, roughness: 0.42, metalness: 0.1, clearcoat: 0.4, clearcoatRoughness: 0.3 });
  owned.push(coatM, eyeM, eyeTex, noseM, baseM);

  const root = new THREE.Group();
  root.name = cat ? "catBobbleModel" : "bobbleheadModel";
  root.scale.setScalar(SIZE[kind] ?? 0.55);
  parent.add(root);
  // QA close-ups (tools): dev, or the capture contract's capture=1
  if (typeof window !== "undefined" && (import.meta.env?.DEV || /[?&]capture=1/.test(window.location?.search || ""))) (window.__pets ||= {})[kind] = root;
  const add = (par, geo, mat, name, x = 0, y = 0, z = 0) => {
    const mesh = new THREE.Mesh(geo, mat);
    mesh.name = name;
    mesh.position.set(x, y, z);
    // in the room's shadows like everything else (unshadowed, the sun and the lamp
    // reach it through the walls and it glows white)
    mesh.castShadow = mesh.receiveShadow = true;
    par.add(mesh);
    return mesh;
  };

  // --- the base and the body (static) ---
  const base = add(root, baseGeo(), baseM, cat ? "catBase" : "dogBase");

  // --- the head (bobbles): pivots at the neck ---
  const neck = new THREE.Group();
  neck.name = cat ? "catNeck" : "bobbleNeck";
  neck.position.set(...NECK[kind]);
  root.add(neck);
  // the pose, held inside the spring: the retriever's curious tilt, the cat's glance
  // across at the dog beside it
  const pose = new THREE.Group();
  if (cat) pose.rotation.set(-0.04, -0.32, 0.07);
  else pose.rotation.set(-0.08, 0.06, 0.15);
  neck.add(pose);
  // the sculpted body and head arrive with pets.glb; the toy stays hidden till then
  let disposed = false;
  root.visible = false;
  loadPets()
    .then((parts) => {
      if (disposed) return;
      for (const [part, par] of [["Body", root], ["Head", pose]]) {
        const src = parts[kind + part];
        if (!src) throw new Error(`pets.glb has no ${kind}${part}`);
        const mesh = new THREE.Mesh(src.geometry, coatM);
        mesh.name = kind + part;
        mesh.position.copy(src.position);
        mesh.quaternion.copy(src.quaternion);
        mesh.scale.copy(src.scale);
        mesh.castShadow = mesh.receiveShadow = true;
        par.add(mesh);
      }
      root.visible = true;
      if (import.meta.env?.DEV) {
        let tris = 0;
        root.traverse((o) => { if (o.isMesh) tris += (o.geometry.index ? o.geometry.index.count : o.geometry.attributes.position.count) / 3; });
        console.info(`[bobblehead] ${kind}: ${Math.round(tris)} tris, ready ${(performance.now() - t0).toFixed(0)} ms after the build`);
      }
    })
    .catch((e) => console.warn("[bobblehead] pets.glb failed:", e?.message || e));

  // eyes, set into their sockets and turned out with the skull's curve
  for (const s of [-1, 1]) {
    const E = cat ? CAT_EYE : DOG_EYE;
    const eye = add(pose, cat ? eyeGeo(0.0037, 0.0031, 0.0023) : eyeGeo(0.0029, 0.003, 0.0022), eyeM, "petEye", s * E[0], E[1], E[2]);
    eye.rotation.set(-0.12, s * (cat ? 0.36 : 0.3), s * (cat ? 0.2 : 0));
  }
  if (cat) {
    add(pose, noseGeo(0.0024, 0.0016, 0.0013), noseM, "catNose", 0, 0.0146, 0.0196).rotation.x = 0.35;
    // whiskers: three a side from the pads, fanning and drooping
    const whiskerM = new THREE.MeshStandardMaterial({ name: "catWhisker", color: 0xf4f1ea, roughness: 0.6 });
    owned.push(whiskerM);
    const ws = [];
    for (const s of [-1, 1])
      for (const [dy, rz] of [[0.0008, 0.22], [0, 0.04], [-0.0008, -0.14]]) {
        const w = new THREE.CylinderGeometry(0.00011, 0.00024, 0.017, 3);
        w.translate(0, 0.0085, 0);
        w.rotateZ(-s * (Math.PI / 2 - rz));
        w.rotateY(s * 0.42);
        w.translate(s * 0.005, 0.0112 + dy, 0.0168);
        ws.push(w);
      }
    add(pose, mergeAll(ws), whiskerM, "catWhiskers");
  } else {
    add(pose, noseGeo(0.0043, 0.003, 0.0027), noseM, "dogNose", 0, 0.0168, 0.0314).rotation.x = 0.2;
    // a happy tongue, out of the side of the mouth
    const tongueM = new THREE.MeshPhysicalMaterial({ name: "dogTongue", color: 0xd65f69, roughness: 0.3, clearcoat: 0.8, clearcoatRoughness: 0.15 });
    owned.push(tongueM);
    const tg = new THREE.SphereGeometry(1, 14, 10);
    tg.scale(0.0033, 0.0012, 0.0043);
    add(pose, tg, tongueM, "dogTongue", 0.0012, 0.0078, 0.0238).rotation.set(0.85, 0.12, 0);
  }

  // the spring under the head, a short dark coil only visible as the head tips
  const coil = new THREE.Mesh(new THREE.CylinderGeometry(0.0035, 0.0035, 0.006, 10), m.steelDark);
  coil.position.y = neck.position.y - 0.003;
  root.add(coil);

  // free this pet's own materials and eye canvas when room.js disposes the geometry
  // (the base's geometry is this pet's own; the shared sculpted geometry is freed by
  // the same traversal and re-uploads if a rebuilt room uses it again)
  base.geometry.addEventListener("dispose", () => {
    disposed = true;
    owned.forEach((o) => o.dispose());
  });

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

// merge the whiskers' small geometries into one (position and normal only)
function mergeAll(geos) {
  const parts = geos.map((g) => (g.index ? g.toNonIndexed() : g));
  let n = 0;
  for (const g of parts) n += g.attributes.position.count;
  const pos = new Float32Array(n * 3), nrm = new Float32Array(n * 3);
  let o = 0;
  for (const g of parts) {
    pos.set(g.attributes.position.array, o * 3);
    nrm.set(g.attributes.normal.array, o * 3);
    o += g.attributes.position.count;
  }
  geos.forEach((g) => g.dispose());
  const out = new THREE.BufferGeometry();
  out.setAttribute("position", new THREE.BufferAttribute(pos, 3));
  out.setAttribute("normal", new THREE.BufferAttribute(nrm, 3));
  return out;
}
