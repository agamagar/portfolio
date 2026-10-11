// Bake the bobblehead pets (src/scene/window/room/petShapes.js) to
// public/room/pets.glb: each part is meshed with surface nets at a fine grid,
// simplified with meshoptimizer (normals and painted colours weighted, so the
// markings keep their edges), then compressed with gltfpack (meshopt, quantised).
//
//   node tools/pets/bake.mjs            (needs network once, for npx gltfpack)
//
// Four meshes, named dogBody, dogHead, catBody, catHead, each with POSITION,
// NORMAL and COLOR_0 (linear) in the model frame of petShapes.js.

import { writeFileSync, mkdirSync, statSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { tmpdir } from "node:os";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { meshSdf } from "../../src/scene/window/room/petSculpt.js";
import { PET_PARTS } from "../../src/scene/window/room/petShapes.js";
import { MeshoptSimplifier } from "../../node_modules/three/examples/jsm/libs/meshopt_simplifier.module.js";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "../..");
const OUT = join(ROOT, "public/room/pets.glb");
const H = 0.00042; // fine grid (m)
const TARGET = { dogBody: 5600, dogHead: 6000, catBody: 5600, catHead: 6000 }; // triangles

await MeshoptSimplifier.ready;

const meshes = [];
for (const [name, part] of Object.entries(PET_PARTS)) {
  const t0 = Date.now();
  const m = meshSdf(part.sdf, part.paint, part.bounds, H);
  const vn = m.pos.length / 3;
  // simplify: positions, plus normals and colours as attributes
  const attr = new Float32Array(vn * 6);
  for (let i = 0; i < vn; i++) {
    attr.set(m.nrm.subarray(i * 3, i * 3 + 3), i * 6);
    attr.set(m.col.subarray(i * 3, i * 3 + 3), i * 6 + 3);
  }
  const [idx, err] = MeshoptSimplifier.simplifyWithAttributes(m.idx, m.pos, 3, attr, 6, [1.2, 1.2, 1.2, 1.5, 1.5, 1.5], null, TARGET[name] * 3, 0.05, []);
  // keep only the vertices still used
  const remap = new Int32Array(vn).fill(-1);
  let n = 0;
  for (const v of idx) if (remap[v] < 0) remap[v] = n++;
  const pos = new Float32Array(n * 3), nrm = new Float32Array(n * 3), col = new Float32Array(n * 3);
  for (let v = 0; v < vn; v++) {
    const r = remap[v];
    if (r < 0) continue;
    pos.set(m.pos.subarray(v * 3, v * 3 + 3), r * 3);
    nrm.set(m.nrm.subarray(v * 3, v * 3 + 3), r * 3);
    col.set(m.col.subarray(v * 3, v * 3 + 3), r * 3);
  }
  const ind = n > 65535 ? new Uint32Array(idx.length) : new Uint16Array(idx.length);
  for (let i = 0; i < idx.length; i++) ind[i] = remap[idx[i]];
  meshes.push({ name, pos, nrm, col, ind });
  console.log(`${name}: ${m.idx.length / 3} -> ${ind.length / 3} tris, ${n} verts, err ${err.toFixed(4)}, ${Date.now() - t0} ms`);
}

// --- a plain glTF binary ---
const views = [], accessors = [], chunks = [];
let off = 0;
const push = (arr, target, type, compType, extra = {}) => {
  const bytes = new Uint8Array(arr.buffer, arr.byteOffset, arr.byteLength);
  const pad = (4 - (bytes.length % 4)) % 4;
  views.push({ buffer: 0, byteOffset: off, byteLength: bytes.length, target });
  chunks.push(bytes, new Uint8Array(pad));
  off += bytes.length + pad;
  const count = arr.length / { SCALAR: 1, VEC3: 3 }[type];
  accessors.push({ bufferView: views.length - 1, componentType: compType, count, type, ...extra });
  return accessors.length - 1;
};
const bounds = (p) => {
  const mn = [Infinity, Infinity, Infinity], mx = [-Infinity, -Infinity, -Infinity];
  for (let i = 0; i < p.length; i += 3) for (let k = 0; k < 3; k++) { mn[k] = Math.min(mn[k], p[i + k]); mx[k] = Math.max(mx[k], p[i + k]); }
  return { min: mn, max: mx };
};
const gltfMeshes = meshes.map((m) => ({
  name: m.name,
  primitives: [{
    attributes: {
      POSITION: push(m.pos, 34962, "VEC3", 5126, bounds(m.pos)),
      NORMAL: push(m.nrm, 34962, "VEC3", 5126),
      COLOR_0: push(m.col, 34962, "VEC3", 5126),
    },
    indices: push(m.ind, 34963, "SCALAR", m.ind instanceof Uint16Array ? 5123 : 5125),
    mode: 4,
  }],
}));
const json = {
  asset: { version: "2.0", generator: "tools/pets/bake.mjs" },
  scene: 0,
  scenes: [{ nodes: meshes.map((_, i) => i) }],
  nodes: meshes.map((m, i) => ({ name: m.name, mesh: i })),
  meshes: gltfMeshes,
  accessors,
  bufferViews: views,
  buffers: [{ byteLength: off }],
};
let js = Buffer.from(JSON.stringify(json));
js = Buffer.concat([js, Buffer.alloc((4 - (js.length % 4)) % 4, 0x20)]);
const bin = Buffer.concat(chunks.map((c) => Buffer.from(c)));
const header = Buffer.alloc(12), jh = Buffer.alloc(8), bh = Buffer.alloc(8);
header.writeUInt32LE(0x46546c67, 0); header.writeUInt32LE(2, 4); header.writeUInt32LE(12 + 8 + js.length + 8 + bin.length, 8);
jh.writeUInt32LE(js.length, 0); jh.writeUInt32LE(0x4e4f534a, 4);
bh.writeUInt32LE(bin.length, 0); bh.writeUInt32LE(0x004e4942, 4);
const raw = join(tmpdir(), "pets-raw.glb");
writeFileSync(raw, Buffer.concat([header, jh, js, bh, bin]));

// --- compress: meshopt, quantised; keep the four named nodes ---
mkdirSync(dirname(OUT), { recursive: true });
execFileSync("npx", ["-y", "gltfpack@1.3.0", "-i", raw, "-o", OUT, "-cc", "-kn", "-vp", "12", "-vc", "8"], { stdio: "inherit" });
console.log(`wrote ${OUT}: ${(statSync(raw).size / 1024).toFixed(0)} KB raw -> ${(statSync(OUT).size / 1024).toFixed(0)} KB`);
