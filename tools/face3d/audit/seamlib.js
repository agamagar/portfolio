// page-side half of seams.mjs (served by vite so the bare imports resolve)
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { MeshoptDecoder } from "three/examples/jsm/libs/meshopt_decoder.module.js";
export async function seams(url) {
  const gltf = await new Promise((ok, no) => new GLTFLoader().setMeshoptDecoder(MeshoptDecoder).load(url, ok, undefined, no));
  const out = [];
  gltf.scene.traverse((o) => {
    if (!o.isMesh) return;
    const g = o.geometry, P = g.attributes.position, names = Object.keys(g.morphAttributes);
    const M = g.morphAttributes.position || [], dict = o.morphTargetDictionary || {};
    const q = (v) => Math.round(v * 2000);
    const groups = new Map();
    for (let i = 0; i < P.count; i++) {
      const k = q(P.getX(i)) + "," + q(P.getY(i)) + "," + q(P.getZ(i));
      (groups.get(k) || groups.set(k, []).get(k)).push(i);
    }
    let split = 0; const worst = {};
    for (const ids of groups.values()) {
      if (ids.length < 2) continue;
      split++;
      M.forEach((m, t) => {
        const name = Object.keys(dict).find((n) => dict[n] === t) || t;
        let lo = [1e9, 1e9, 1e9], hi = [-1e9, -1e9, -1e9];
        for (const i of ids) { const d = [m.getX(i), m.getY(i), m.getZ(i)]; for (let a = 0; a < 3; a++) { lo[a] = Math.min(lo[a], d[a]); hi[a] = Math.max(hi[a], d[a]); } }
        const gap = Math.hypot(hi[0] - lo[0], hi[1] - lo[1], hi[2] - lo[2]);
        if (gap > (worst[name]?.gap || 1e-4)) worst[name] = { gap, at: P.getX(ids[0]).toFixed(3) + "," + P.getY(ids[0]).toFixed(3) + "," + P.getZ(ids[0]).toFixed(3) };
      });
    }
    out.push({ name: o.name, verts: P.count, splitPositions: split, worstGapPerKey: worst });
  });
  return out;
}
// open edges of a mesh after welding coincident positions (tol = grid step): a crack's two sides
export async function openEdges(url, name, tol = 0.0005) {
  const gltf = await new Promise((ok, no) => new GLTFLoader().setMeshoptDecoder(MeshoptDecoder).load(url, ok, undefined, no));
  let mesh; gltf.scene.traverse((o) => { if (o.isMesh && o.name === name) mesh = o; });
  const g = mesh.geometry, P = g.attributes.position, idx = g.index.array;
  const key = (i) => Math.round(P.getX(i) / tol) + "," + Math.round(P.getY(i) / tol) + "," + Math.round(P.getZ(i) / tol);
  const w = new Int32Array(P.count), ids = new Map();
  for (let i = 0; i < P.count; i++) { const k = key(i); if (!ids.has(k)) ids.set(k, ids.size); w[i] = ids.get(k); }
  const cnt = new Map();
  for (let t = 0; t < idx.length; t += 3) for (let e = 0; e < 3; e++) {
    const a = w[idx[t + e]], b = w[idx[t + (e + 1) % 3]], k = a < b ? a + "_" + b : b + "_" + a;
    cnt.set(k, (cnt.get(k) || 0) + 1);
  }
  const rep = new Map(); for (let i = 0; i < P.count; i++) if (!rep.has(w[i])) rep.set(w[i], i);
  const open = [];
  for (const [k, c] of cnt) if (c === 1) { const [a, b] = k.split("_").map(Number); const i = rep.get(a), j = rep.get(b);
    open.push([(P.getX(i) + P.getX(j)) / 2, (P.getY(i) + P.getY(j)) / 2, (P.getZ(i) + P.getZ(j)) / 2, Math.hypot(P.getX(i) - P.getX(j), P.getY(i) - P.getY(j), P.getZ(i) - P.getZ(j))]); }
  // coarse grid clusters
  const cl = new Map();
  for (const [x, y, z, l] of open) { const k = [x, y, z].map((v) => Math.round(v / 0.08)).join(","); const c = cl.get(k) || { n: 0, len: 0, x: 0, y: 0, z: 0 }; c.n++; c.len += l; c.x += x; c.y += y; c.z += z; cl.set(k, c); }
  return { tris: idx.length / 3, welded: ids.size, open: open.length, clusters: [...cl.values()].sort((a, b) => b.n - a.n).slice(0, 25).map((c) => ({ n: c.n, len: +c.len.toFixed(3), at: [c.x / c.n, c.y / c.n, c.z / c.n].map((v) => +v.toFixed(3)) })) };
}
// the UV coverage of one mesh as a PNG data URL (white = covered), W x H, for padding its textures
export async function uvMask(url, name, W, H) {
  const gltf = await new Promise((ok, no) => new GLTFLoader().setMeshoptDecoder(MeshoptDecoder).load(url, ok, undefined, no));
  let mesh; gltf.scene.traverse((o) => { if (o.isMesh && o.name === name) mesh = o; });
  const uv = mesh.geometry.attributes.uv, idx = mesh.geometry.index.array;
  const c = document.createElement("canvas"); c.width = W; c.height = H;
  const x = c.getContext("2d"); x.fillStyle = "#000"; x.fillRect(0, 0, W, H); x.fillStyle = "#fff"; x.strokeStyle = "#fff"; x.lineWidth = 0.5;
  x.imageSmoothingEnabled = false;
  for (let t = 0; t < idx.length; t += 3) {
    x.beginPath();
    for (let e = 0; e < 3; e++) { const i = idx[t + e]; const px = uv.getX(i) * W, py = uv.getY(i) * H; e ? x.lineTo(px, py) : x.moveTo(px, py); }
    x.closePath(); x.fill(); x.stroke();
  }
  return c.toDataURL("image/png");
}
// object-space bounding box of every mesh (the head's size, for building geometry that fits it)
export async function bboxes(url) {
  const gltf = await new Promise((ok, no) => new GLTFLoader().setMeshoptDecoder(MeshoptDecoder).load(url, ok, undefined, no));
  const out = {};
  gltf.scene.updateMatrixWorld(true);
  gltf.scene.traverse((o) => { if (o.isMesh) { o.geometry.computeBoundingBox(); const b = o.geometry.boundingBox.clone().applyMatrix4(o.matrixWorld); out[o.name] = { min: b.min.toArray().map((v) => +v.toFixed(3)), max: b.max.toArray().map((v) => +v.toFixed(3)) }; } });
  out._root = { pos: gltf.scene.position.toArray(), scale: gltf.scene.scale.toArray() };
  return out;
}
// head profile: per y slice of a mesh, the x and z extent (to build hair that sits on the scalp)
export async function slices(url, name, step = 0.2) {
  const gltf = await new Promise((ok, no) => new GLTFLoader().setMeshoptDecoder(MeshoptDecoder).load(url, ok, undefined, no));
  let m; gltf.scene.traverse((o) => { if (o.isMesh && o.name === name) m = o; });
  const P = m.geometry.attributes.position, rows = {};
  for (let i = 0; i < P.count; i++) { const k = Math.round(P.getY(i) / step) * step; const r = rows[k.toFixed(2)] ||= { xmin: 9, xmax: -9, zmin: 9, zmax: -9, zmaxAtX0: -9 }; const x = P.getX(i), z = P.getZ(i);
    r.xmin = Math.min(r.xmin, x); r.xmax = Math.max(r.xmax, x); r.zmin = Math.min(r.zmin, z); r.zmax = Math.max(r.zmax, z); if (Math.abs(x) < 0.15) r.zmaxAtX0 = Math.max(r.zmaxAtX0, z); }
  return rows;
}
// triangles whose UVs are stretched across the texture (a fold's sliver joining two depth layers samples every texel between):
// per mesh, the count with a UV span > thr and where they sit
export async function stretched(url, name, thr = 0.2) {
  const gltf = await new Promise((ok, no) => new GLTFLoader().setMeshoptDecoder(MeshoptDecoder).load(url, ok, undefined, no));
  let m; gltf.scene.traverse((o) => { if (o.isMesh && o.name === name) m = o; });
  const uv = m.geometry.attributes.uv, P = m.geometry.attributes.position, ix = m.geometry.index.array;
  const bad = [];
  for (let t = 0; t < ix.length; t += 3) {
    const us = [0, 1, 2].map((k) => uv.getX(ix[t + k])), vs = [0, 1, 2].map((k) => uv.getY(ix[t + k]));
    const du = Math.max(...us) - Math.min(...us), dv = Math.max(...vs) - Math.min(...vs);
    if (du > thr || dv > thr) bad.push([t / 3, du, dv, [0, 1, 2].reduce((a, k) => a + P.getX(ix[t + k]) / 3, 0), [0, 1, 2].reduce((a, k) => a + P.getY(ix[t + k]) / 3, 0), [0, 1, 2].reduce((a, k) => a + P.getZ(ix[t + k]) / 3, 0)]);
  }
  return { tris: ix.length / 3, bad: bad.length, sample: bad.slice(0, 40).map((b) => b.map((v) => +v.toFixed(2))) };
}
// the Skin mesh's own albedo-ratio map (what a rig reads as its "clean" skin), as a PNG data URL
export async function skinMapPng(url) {
  const gltf = await new Promise((ok, no) => new GLTFLoader().setMeshoptDecoder(MeshoptDecoder).load(url, ok, undefined, no));
  let m; gltf.scene.traverse((o) => { if (o.isMesh && o.name === "Skin") m = o; });
  const img = m.material.map.image, c = document.createElement("canvas"); c.width = img.width; c.height = img.height;
  c.getContext("2d").drawImage(img, 0, 0);
  return c.toDataURL("image/png");
}
