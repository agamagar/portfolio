// The head's own surface, as a query object, so parts that sit ON the face (beards, stubble, bindi, tilak, nose pin,
// earrings, glasses' temples) are built from the real skin geometry instead of guessed numbers.
//   const S = makeSurface(skinMesh)   // skinMesh: the loaded Skin mesh (base pose, object space)
//   S.frontZ(x, y)      surface z facing the viewer at (x, y) (the front-most skin there)
//   S.normalAt(x, y)    its normal
//   S.sideX(y, z, side) outermost x on `side` (+1 / -1) near (y, z): the cheek, the temple, the ear rim
//   S.lobe(side)        the ear's lowest point on that side [x, y, z]
//   S.shell(thick)      a mesh-compatible geometry made of the skin triangles where thick(cx, cy, cz, nx, ny, nz) >= 0, pushed out along
//                       the normal by that thickness; it keeps the skin's morph targets, so it rides every emote (jaw, smile, puff)
import * as THREE from "three";

export function makeSurface(skin) {
  const g = skin.geometry, P = g.attributes.position, N = g.attributes.normal, idx = g.index.array, n = P.count;
  const pos = new Float32Array(n * 3), nor = new Float32Array(n * 3);
  for (let i = 0; i < n; i++) { pos[i * 3] = P.getX(i); pos[i * 3 + 1] = P.getY(i); pos[i * 3 + 2] = P.getZ(i); nor[i * 3] = N.getX(i); nor[i * 3 + 1] = N.getY(i); nor[i * 3 + 2] = N.getZ(i); }
  // a grid over (x, y): the vertices in each column
  const CELL = 0.06, grid = new Map(), key = (a, b) => a * 4096 + b;
  const cx = (x) => Math.floor((x + 3) / CELL), cy = (y) => Math.floor((y + 3) / CELL);
  for (let i = 0; i < n; i++) { const k = key(cx(pos[i * 3]), cy(pos[i * 3 + 1])); (grid.get(k) || grid.set(k, []).get(k)).push(i); }
  const near = (x, y, r) => {
    const out = [], a0 = cx(x - r), a1 = cx(x + r), b0 = cy(y - r), b1 = cy(y + r);
    for (let a = a0; a <= a1; a++) for (let b = b0; b <= b1; b++) for (const i of grid.get(key(a, b)) || []) {
      const dx = pos[i * 3] - x, dy = pos[i * 3 + 1] - y; if (dx * dx + dy * dy <= r * r) out.push(i);
    }
    return out;
  };
  const S = { pos, nor, near };
  S.frontZ = (x, y, r = 0.05) => { let z = -9; for (const i of near(x, y, r)) z = Math.max(z, pos[i * 3 + 2]); return z; };
  S.normalAt = (x, y, r = 0.05) => {
    const z0 = S.frontZ(x, y, r), v = new THREE.Vector3();
    for (const i of near(x, y, r)) if (pos[i * 3 + 2] > z0 - 0.06) v.add(new THREE.Vector3(nor[i * 3], nor[i * 3 + 1], nor[i * 3 + 2]));
    return v.lengthSq() ? v.normalize() : new THREE.Vector3(0, 0, 1);
  };
  // a point on the face surface at (x, y), lifted `lift` along its normal
  S.onFace = (x, y, lift = 0) => { const z = S.frontZ(x, y), nm = S.normalAt(x, y); return { p: new THREE.Vector3(x, y, z).addScaledVector(nm, lift), n: nm }; };
  S.sideX = (y, z, side, r = 0.07) => {
    let best = null;
    for (let i = 0; i < n; i++) { if (Math.abs(pos[i * 3 + 1] - y) < r && Math.abs(pos[i * 3 + 2] - z) < r) { const x = pos[i * 3] * side; if (best === null || x > best) best = x; } }
    return best === null ? null : best * side;
  };
  S.lobe = (side) => {
    let best = -1;
    for (let i = 0; i < n; i++) { if (pos[i * 3] * side > 1.05 && (best < 0 || pos[i * 3 + 1] < pos[best * 3 + 1])) best = i; }
    return best < 0 ? [side * 1.3, -0.4, 0.1] : [pos[best * 3], pos[best * 3 + 1], pos[best * 3 + 2]];
  };
  // the skin triangles where thick(...) >= 0 (evaluated at the triangle's centre and mean normal), as a standalone geometry
  S.shell = (thick, { downward = null } = {}) => {
    const keep = [], map = new Map(), outP = [], outN = [], outI = [], src = [];
    const t = new THREE.Vector3();
    for (let f = 0; f < idx.length; f += 3) {
      const a = idx[f], b = idx[f + 1], c = idx[f + 2];
      const x = (pos[a * 3] + pos[b * 3] + pos[c * 3]) / 3, y = (pos[a * 3 + 1] + pos[b * 3 + 1] + pos[c * 3 + 1]) / 3, z = (pos[a * 3 + 2] + pos[b * 3 + 2] + pos[c * 3 + 2]) / 3;
      const nx = (nor[a * 3] + nor[b * 3] + nor[c * 3]) / 3, ny = (nor[a * 3 + 1] + nor[b * 3 + 1] + nor[c * 3 + 1]) / 3, nz = (nor[a * 3 + 2] + nor[b * 3 + 2] + nor[c * 3 + 2]) / 3;
      if (thick(x, y, z, nx, ny, nz) < 0) continue;
      keep.push([a, b, c]);
    }
    for (const tri of keep) for (const v of tri) if (!map.has(v)) { map.set(v, src.length); src.push(v); }
    // each kept vertex is pushed out by the thickness at its own position
    for (const v of src) {
      const x = pos[v * 3], y = pos[v * 3 + 1], z = pos[v * 3 + 2];
      let th = thick(x, y, z, nor[v * 3], nor[v * 3 + 1], nor[v * 3 + 2]); if (th < 0) th = 0;
      t.set(nor[v * 3], nor[v * 3 + 1], nor[v * 3 + 2]);
      const px = x + t.x * th, py = y + t.y * th - (downward ? downward(x, y, z) : 0), pz = z + t.z * th;
      outP.push(px, py, pz); outN.push(t.x, t.y, t.z);
    }
    for (const tri of keep) outI.push(map.get(tri[0]), map.get(tri[1]), map.get(tri[2]));
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.Float32BufferAttribute(outP, 3));
    geo.setAttribute("normal", new THREE.Float32BufferAttribute(outN, 3));
    geo.setAttribute("uv", new THREE.Float32BufferAttribute(new Float32Array(src.length * 2), 2));
    geo.setIndex(outI);
    // the skin's morph targets for the kept vertices, so the shell moves with the face
    const MA = g.morphAttributes.position || [];
    if (MA.length) {
      geo.morphAttributes.position = MA.map((m) => { const arr = new Float32Array(src.length * 3); src.forEach((v, k) => { arr[k * 3] = m.getX(v); arr[k * 3 + 1] = m.getY(v); arr[k * 3 + 2] = m.getZ(v); }); const a = new THREE.Float32BufferAttribute(arr, 3); a.name = m.name; return a; });
      geo.morphTargetsRelative = g.morphTargetsRelative;
    }
    return geo;
  };
  S.morphDict = skin.morphTargetDictionary ? { ...skin.morphTargetDictionary } : null;
  S.morphCount = (g.morphAttributes.position || []).length;
  return S;
}

// a mesh that carries a shell geometry's morph targets (the rig drives rig.morphs by dictionary)
export function shellMesh(geo, S, name) {
  const m = new THREE.Mesh(geo);
  m.name = name;
  if (S.morphDict && geo.morphAttributes.position) { m.morphTargetDictionary = { ...S.morphDict }; m.morphTargetInfluences = new Array(S.morphCount).fill(0); }
  return m;
}
