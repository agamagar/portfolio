// helpers shared by part builders (not a part: no slot)
export const smooth = (a, b, x) => { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t); };
export function meshFromGrid(THREE, rows, cols, fn, wrapU = true) {
  // rows x cols grid of points from fn(i, j) -> [x, y, z]; wrapU closes the columns
  const pos = [], uv = [], idx = [];
  for (let i = 0; i <= rows; i++) for (let j = 0; j <= cols; j++) { const p = fn(i, j); pos.push(p[0], p[1], p[2]); uv.push(j / cols, i / rows); }
  for (let i = 0; i < rows; i++) for (let j = 0; j < cols; j++) { const a = i * (cols + 1) + j, b = a + cols + 1; idx.push(a, a + 1, b, b, a + 1, b + 1); }
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute("uv", new THREE.Float32BufferAttribute(uv, 2)); g.setIndex(idx);
  g.computeVertexNormals();
  return g;
}
// make a closed-ish surface face outward: flip all triangles when the mean normal points at the centre
export function faceOut(THREE, g, c) {
  const P = g.attributes.position, ix = g.index.array, a = new THREE.Vector3(), b = new THREE.Vector3(), d = new THREE.Vector3(); let s = 0;
  for (let t = 0; t < ix.length; t += 3) { a.fromBufferAttribute(P, ix[t]); b.fromBufferAttribute(P, ix[t + 1]); d.fromBufferAttribute(P, ix[t + 2]); const nrm = b.clone().sub(a).cross(d.clone().sub(a)), mid = a.clone().add(b).add(d).divideScalar(3).sub(c); s += Math.sign(nrm.dot(mid)); }
  if (s < 0) { for (let t = 0; t < ix.length; t += 3) { const q = ix[t + 1]; ix[t + 1] = ix[t + 2]; ix[t + 2] = q; } }
  g.computeVertexNormals();
  return g;
}
