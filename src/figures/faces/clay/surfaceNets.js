// Naive surface nets: polygonise sdf(x, y, z) = 0 on a regular grid into a smooth-shaded triangle mesh. Vertices sit at the mean of the cell's edge
// crossings (clamped inside the cell), normals come from the SDF's own gradient (central differences), so the surface shades as smooth as the field is.
//   const { positions, normals, indices } = surfaceNets(sdf, { min: [x, y, z], max: [x, y, z], n: 96 })
export function surfaceNets(sdf, { min, max, n = 96, relax = 0 }) {
  const nx = n, ny = Math.round(n * (max[1] - min[1]) / (max[0] - min[0])), nz = Math.round(n * (max[2] - min[2]) / (max[0] - min[0]));
  const dx = (max[0] - min[0]) / nx, dy = (max[1] - min[1]) / ny, dz = (max[2] - min[2]) / nz;
  const sx = nx + 1, sy = ny + 1, sz = nz + 1, field = new Float32Array(sx * sy * sz);
  const id = (i, j, k) => i + sx * (j + sy * k);
  for (let k = 0; k < sz; k++) for (let j = 0; j < sy; j++) for (let i = 0; i < sx; i++) field[id(i, j, k)] = sdf(min[0] + i * dx, min[1] + j * dy, min[2] + k * dz);
  const vmap = new Int32Array(nx * ny * nz).fill(-1), cid = (i, j, k) => i + nx * (j + ny * k), pos = [];
  const corners = [[0, 0, 0], [1, 0, 0], [0, 1, 0], [1, 1, 0], [0, 0, 1], [1, 0, 1], [0, 1, 1], [1, 1, 1]];
  const edges = [[0, 1], [2, 3], [4, 5], [6, 7], [0, 2], [1, 3], [4, 6], [5, 7], [0, 4], [1, 5], [2, 6], [3, 7]];
  for (let k = 0; k < nz; k++) for (let j = 0; j < ny; j++) for (let i = 0; i < nx; i++) {
    const v = corners.map(([a, b, c]) => field[id(i + a, j + b, k + c)]);
    let neg = 0; for (const x of v) if (x < 0) neg++;
    if (neg === 0 || neg === 8) continue;
    let ax = 0, ay = 0, az = 0, cnt = 0;
    for (const [e0, e1] of edges) {
      const f0 = v[e0], f1 = v[e1]; if ((f0 < 0) === (f1 < 0)) continue;
      const t = f0 / (f0 - f1), c0 = corners[e0], c1 = corners[e1];
      ax += c0[0] + (c1[0] - c0[0]) * t; ay += c0[1] + (c1[1] - c0[1]) * t; az += c0[2] + (c1[2] - c0[2]) * t; cnt++;
    }
    vmap[cid(i, j, k)] = pos.length / 3; pos.push(min[0] + (i + ax / cnt) * dx, min[1] + (j + ay / cnt) * dy, min[2] + (k + az / cnt) * dz);
  }
  const idx = [], quad = (a, b, c, d, flip) => { if (a < 0 || b < 0 || c < 0 || d < 0) return; if (flip) idx.push(a, b, c, a, c, d); else idx.push(a, c, b, a, d, c); };
  // one quad per grid edge that crosses the surface, joining the four cells around the edge
  for (let k = 1; k < nz; k++) for (let j = 1; j < ny; j++) for (let i = 0; i < nx; i++) { const a = field[id(i, j, k)], b = field[id(i + 1, j, k)]; if ((a < 0) !== (b < 0)) quad(vmap[cid(i, j - 1, k - 1)], vmap[cid(i, j, k - 1)], vmap[cid(i, j, k)], vmap[cid(i, j - 1, k)], a < 0); }
  for (let k = 1; k < nz; k++) for (let j = 0; j < ny; j++) for (let i = 1; i < nx; i++) { const a = field[id(i, j, k)], b = field[id(i, j + 1, k)]; if ((a < 0) !== (b < 0)) quad(vmap[cid(i - 1, j, k - 1)], vmap[cid(i - 1, j, k)], vmap[cid(i, j, k)], vmap[cid(i, j, k - 1)], a < 0); }
  for (let k = 0; k < nz; k++) for (let j = 1; j < ny; j++) for (let i = 1; i < nx; i++) { const a = field[id(i, j, k)], b = field[id(i, j, k + 1)]; if ((a < 0) !== (b < 0)) quad(vmap[cid(i - 1, j - 1, k)], vmap[cid(i, j - 1, k)], vmap[cid(i, j, k)], vmap[cid(i - 1, j, k)], a < 0); }
  const positions = new Float32Array(pos), normals = new Float32Array(pos.length), h = 0.5 * Math.min(dx, dy, dz);
  for (let v = 0; v < pos.length; v += 3) {
    const x = pos[v], y = pos[v + 1], z = pos[v + 2];
    // (move each vertex onto the true surface by one Newton step along the gradient: removes the grid's faceting)
    let gx = sdf(x + h, y, z) - sdf(x - h, y, z), gy = sdf(x, y + h, z) - sdf(x, y - h, z), gz = sdf(x, y, z + h) - sdf(x, y, z - h), gl = Math.hypot(gx, gy, gz) || 1;
    gx /= gl; gy /= gl; gz /= gl;
    if (relax) { const d = sdf(x, y, z); positions[v] = x - gx * d * relax; positions[v + 1] = y - gy * d * relax; positions[v + 2] = z - gz * d * relax; } else { positions[v] = x; positions[v + 1] = y; positions[v + 2] = z; }
    normals[v] = gx; normals[v + 1] = gy; normals[v + 2] = gz;
  }
  return { positions, normals, indices: new Uint32Array(idx) };
}
