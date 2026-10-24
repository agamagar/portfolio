// The clay head as three.js objects: SDF -> surface-nets meshes (skin, hair), bead eyes, brow pills, soft studio light and matte clay materials.
//   const head = buildClayHead(THREE, params, { n: 96 })   -> { group, meta: { ms, tris }, dispose() }
import { surfaceNets } from "./surfaceNets.js";
import { skinSdf, hairSdf, headCore, surfZ } from "./claySdf.js";
import { mergeParams } from "./params.js";
import { smin } from "./sdf.js";
function geo(THREE, m) { const g = new THREE.BufferGeometry(); g.setAttribute("position", new THREE.BufferAttribute(m.positions, 3)); g.setAttribute("normal", new THREE.BufferAttribute(m.normals, 3)); g.setIndex(new THREE.BufferAttribute(m.indices, 1)); return g; }
export function clayMaterial(THREE, color, { roughness = 0.78, sheen = "#ffd9c0", sheenAmount = 0.14 } = {}) {
  return new THREE.MeshPhysicalMaterial({ color, roughness, metalness: 0, sheen: sheenAmount, sheenRoughness: 0.6, sheenColor: new THREE.Color(sheen), clearcoat: 0, envMapIntensity: 0.9 });
}
export function buildClayHead(THREE, over = {}, { n = 96 } = {}) {
  const P = mergeParams(over), t0 = performance.now(), group = new THREE.Group(), mats = [], geos = [];
  const skin = skinSdf(P), hair = hairSdf(P), core = headCore(P);
  // ONE surface: skin and hair are unioned (smooth min), then coloured by whichever field is nearer. No shell, no z-fighting, a soft hairline ledge.
  const union = (x, y, z) => smin(skin(x, y, z), hair(x, y, z), P.hair.edgeBlend);
  const sk = surfaceNets(union, { min: [-1.8, -1.3, -1.3], max: [1.8, 2.15, 1.7], n });
  const baseC = new THREE.Color(P.skin.color), darkC = baseC.clone().multiplyScalar(0.62), hairC = new THREE.Color(P.hair.color), col = new Float32Array(sk.positions.length);
  for (let i = 0; i < sk.positions.length; i += 3) {
    const x = sk.positions[i], y = sk.positions[i + 1], z = sk.positions[i + 2], ds = skin(x, y, z), dh = hair(x, y, z), w = Math.max(0, Math.min(1, 0.5 + (ds - dh) / 0.06)), gd = skin.groove(x, y, z), g = Math.max(0, Math.min(1, 1 - gd / (skin.mouthDepth * 1.6)));
    // soft ambient occlusion from the field itself: probe 0.14 out along the normal; creases (ear bowl, nose sides, under the wing) read darker
    const nx = sk.normals[i], ny = sk.normals[i + 1], nz = sk.normals[i + 2], ao = Math.max(0, Math.min(1, union(x + nx * 0.14, y + ny * 0.14, z + nz * 0.14) / 0.14)), shade = 0.74 + 0.26 * ao;
    const c = baseC.clone().lerp(darkC, g * g * (3 - 2 * g) * (1 - w)).lerp(hairC, w * w * (3 - 2 * w)).multiplyScalar(shade); col[i] = c.r; col[i + 1] = c.g; col[i + 2] = c.b;
  }
  const skinMat = clayMaterial(THREE, "#ffffff", { roughness: P.skin.roughness, sheen: P.skin.sheen }); skinMat.vertexColors = true; mats.push(skinMat);
  const skinGeo = geo(THREE, sk); skinGeo.setAttribute("color", new THREE.BufferAttribute(col, 3)); const skinMesh = new THREE.Mesh(skinGeo, skinMat); skinMesh.name = "Head"; group.add(skinMesh); geos.push(skinGeo);
  const hr = { indices: new Uint32Array(0) };
  // eyes: glossy beads sunk into the face
  const eyeMat = new THREE.MeshPhysicalMaterial({ color: P.eye.color, roughness: 0.12, metalness: 0, clearcoat: 1, clearcoatRoughness: 0.05 }); mats.push(eyeMat);
  for (const sd of [-1, 1]) { const ez = surfZ(core, sd * P.eye.x, P.eye.y), e = new THREE.Mesh(new THREE.SphereGeometry(P.eye.r, 32, 24), eyeMat); e.position.set(sd * (P.eye.x + P.eye.gap), P.eye.y, ez - P.eye.r * 0.25); e.name = "Eye"; group.add(e); geos.push(e.geometry); }
  // brow pills: tubes along a shallow arc with round ends
  const browMat = clayMaterial(THREE, P.brow.color, { roughness: 0.6, sheen: "#6a3a28", sheenAmount: 0.2 }); mats.push(browMat);
  for (const sd of [-1, 1]) {
    const B = P.brow, pts = []; for (let i = 0; i <= 12; i++) { const u = i / 12 - 0.5, x = sd * B.x + u * B.len * (sd), y = B.y + B.arch * (1 - 4 * u * u) + u * Math.sin((B.tilt * Math.PI) / 180) * B.len * sd * -1 * 0.5; pts.push(new THREE.Vector3(x, y, surfZ(core, x, y) + B.thick * 0.35)); }
    const tube = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 24, B.thick, 12, false), browMat); tube.name = "Brow"; group.add(tube); geos.push(tube.geometry);
    for (const p of [pts[0], pts[pts.length - 1]]) { const c = new THREE.Mesh(new THREE.SphereGeometry(B.thick, 16, 12), browMat); c.position.copy(p); group.add(c); geos.push(c.geometry); }
  }
  return { group, params: P, meta: { ms: Math.round(performance.now() - t0), tris: (sk.indices.length + hr.indices.length) / 3 }, dispose() { geos.forEach((g) => g.dispose()); mats.forEach((m) => m.dispose()); } };
}
// soft studio: a hemisphere fill, a broad key, a frontal fill and a faint rim, on a light grey ground (the sheet's)
export function studioLights(THREE, scene) {
  scene.add(new THREE.HemisphereLight("#ffffff", "#d8d4d6", 2.1));
  const key = new THREE.DirectionalLight("#fff4ea", 2.3); key.position.set(-3, 4, 5); scene.add(key);
  const fill = new THREE.DirectionalLight("#eaf0ff", 0.8); fill.position.set(4, 0.5, 4); scene.add(fill);
  const rim = new THREE.DirectionalLight("#ffffff", 0.6); rim.position.set(1, 3, -5); scene.add(rim);
}
