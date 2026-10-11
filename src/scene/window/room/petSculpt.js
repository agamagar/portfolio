// A tiny sculptor for the bobblehead pets (2026-10-11, Agam: "make the cat and dog
// models more detailed").
//
// A pet is a signed distance field: ellipsoids and tapered limbs joined with smooth
// unions (the soft creases of a vinyl figure), grooves cut with smooth subtractions.
// meshSdf() turns it into a smooth indexed mesh with surface nets: one vertex per
// grid cell the surface crosses, pulled onto the surface, its normal the field's
// gradient. Markings (the tabby's stripes, the retriever's pale feathering) are
// painted per vertex by a paint(x, y, z) function, and a few steps along each normal
// bake a soft occlusion into the same colour, so the creases darken under any light.
//
// Plain JavaScript, no three.js: tools/pets/bake.mjs runs it in Node at a fine
// grid, simplifies the result and writes public/room/pets.glb, which the room
// loads (meshing at load time cost about 0.6 s and 40k triangles a pet).

// --- distance primitives (scalar maths, no allocation in the hot loop) ---

// Ellipsoid centred at (cx, cy, cz), radii (rx, ry, rz): iq's bound, close to exact
// near the surface.
export function ell(x, y, z, cx, cy, cz, rx, ry, rz) {
  const px = (x - cx) / rx, py = (y - cy) / ry, pz = (z - cz) / rz;
  const k0 = Math.sqrt(px * px + py * py + pz * pz);
  const qx = px / rx, qy = py / ry, qz = pz / rz;
  const k1 = Math.sqrt(qx * qx + qy * qy + qz * qz);
  return k1 > 1e-12 ? (k0 * (k0 - 1)) / k1 : -Math.min(rx, ry, rz);
}

// A tapered limb from a (radius ra) to b (radius rb): iq's round cone.
export function cone(x, y, z, a, b, ra, rb) {
  const bax = b[0] - a[0], bay = b[1] - a[1], baz = b[2] - a[2];
  const pax = x - a[0], pay = y - a[1], paz = z - a[2];
  const l2 = bax * bax + bay * bay + baz * baz;
  const rr = ra - rb, a2 = l2 - rr * rr, il2 = 1 / l2;
  const yy = pax * bax + pay * bay + paz * baz;
  const zz = yy - l2;
  const cx = pax * l2 - bax * yy, cy = pay * l2 - bay * yy, cz = paz * l2 - baz * yy;
  const x2 = cx * cx + cy * cy + cz * cz, y2 = yy * yy * l2, z2 = zz * zz * l2;
  const k = Math.sign(rr) * rr * rr * x2;
  if (Math.sign(zz) * a2 * z2 > k) return Math.sqrt(x2 + z2) * il2 - rb;
  if (Math.sign(yy) * a2 * y2 < k) return Math.sqrt(x2 + y2) * il2 - ra;
  return (Math.sqrt(x2 * a2 * il2) + yy * rr) * il2 - ra;
}

// A chain of limbs through points pts with radii rs (a tail).
export function chain(x, y, z, pts, rs, k = 0) {
  let d = 1e9;
  for (let i = 0; i < pts.length - 1; i++) {
    const s = cone(x, y, z, pts[i], pts[i + 1], rs[i], rs[i + 1]);
    d = k > 0 ? smin(d, s, k) : Math.min(d, s);
  }
  return d;
}

// smooth union / smooth subtraction (polynomial, k the blend width in metres)
export function smin(a, b, k) {
  const h = Math.max(k - Math.abs(a - b), 0) / k;
  return Math.min(a, b) - h * h * k * 0.25;
}
export function ssub(a, b, k) {
  // a minus b
  return -smin(-a, b, k);
}

// smoothstep, for painting
export const sstep = (e0, e1, v) => {
  const t = Math.max(0, Math.min(1, (v - e0) / (e1 - e0)));
  return t * t * (3 - 2 * t);
};

// a cheap smooth value noise (three octaves of sines), for colour drift only
export function wobble(x, y, z) {
  return (
    Math.sin(x * 517 + Math.sin(z * 311) * 1.7) * Math.sin(y * 433 + 1.3) * 0.5 +
    Math.sin(z * 977 + y * 613) * Math.sin(x * 811 - 0.7) * 0.3 +
    Math.sin((x + y - z) * 1913) * 0.2
  );
}

// --- surface nets ---

const EDGES = [
  [0, 1], [2, 3], [4, 5], [6, 7], // along x
  [0, 2], [1, 3], [4, 6], [5, 7], // along y
  [0, 4], [1, 5], [2, 6], [3, 7], // along z
];

/**
 * Mesh a distance field. sdf(x, y, z) -> metres; paint(x, y, z, out) writes a
 * linear RGB triplet into out. bounds: [x0, y0, z0, x1, y1, z1]; h: cell size.
 * opts.ao: occlusion strength (0 = none). Returns { pos, nrm, col, idx } typed
 * arrays (an indexed mesh).
 */
export function meshSdf(sdf, paint, bounds, h, { ao = 0.9, aoStep = 0.0016 } = {}) {
  const [x0, y0, z0, x1, y1, z1] = bounds;
  const nx = Math.ceil((x1 - x0) / h) + 1, ny = Math.ceil((y1 - y0) / h) + 1, nz = Math.ceil((z1 - z0) / h) + 1;
  const sxy = nx * ny;
  const f = new Float32Array(nx * ny * nz);
  // coarse pass: blocks of B cells whose centre is farther from the surface than
  // the block's half diagonal take that value everywhere (the field changes by at
  // most about its distance), so only a shell round the surface is sampled finely
  const B = 4;
  const reach = Math.sqrt(3) * B * h * 0.5 * 1.25 + h;
  for (let bk = 0; bk < nz; bk += B)
    for (let bj = 0; bj < ny; bj += B)
      for (let bi = 0; bi < nx; bi += B) {
        const ie = Math.min(bi + B + 1, nx), je = Math.min(bj + B + 1, ny), ke = Math.min(bk + B + 1, nz);
        const cx = x0 + (bi + (ie - 1 - bi) / 2) * h, cy = y0 + (bj + (je - 1 - bj) / 2) * h, cz = z0 + (bk + (ke - 1 - bk) / 2) * h;
        const dc = sdf(cx, cy, cz);
        const far = Math.abs(dc) > reach;
        for (let k = bk; k < ke; k++)
          for (let j = bj; j < je; j++)
            for (let i = bi; i < ie; i++) f[i + j * nx + k * sxy] = far ? dc : sdf(x0 + i * h, y0 + j * h, z0 + k * h);
      }

  // one vertex per crossed cell
  const cellV = new Int32Array((nx - 1) * (ny - 1) * nz).fill(-1);
  const cIdx = (i, j, k) => i + j * (nx - 1) + k * (nx - 1) * (ny - 1);
  const pos = [];
  const cv = new Float32Array(8);
  for (let k = 0; k < nz - 1; k++)
    for (let j = 0; j < ny - 1; j++)
      for (let i = 0; i < nx - 1; i++) {
        let mask = 0;
        for (let c = 0; c < 8; c++) {
          const v = f[i + (c & 1) + (j + ((c >> 1) & 1)) * nx + (k + ((c >> 2) & 1)) * sxy];
          cv[c] = v;
          if (v < 0) mask |= 1 << c;
        }
        if (mask === 0 || mask === 255) continue;
        let ax = 0, ay = 0, az = 0, n = 0;
        for (const [a, b] of EDGES) {
          const va = cv[a], vb = cv[b];
          if (va < 0 === vb < 0) continue;
          const t = va / (va - vb);
          ax += (a & 1) + (((b & 1) - (a & 1)) * t);
          ay += ((a >> 1) & 1) + ((((b >> 1) & 1) - ((a >> 1) & 1)) * t);
          az += ((a >> 2) & 1) + ((((b >> 2) & 1) - ((a >> 2) & 1)) * t);
          n++;
        }
        cellV[cIdx(i, j, k)] = pos.length / 3;
        pos.push(x0 + (i + ax / n) * h, y0 + (j + ay / n) * h, z0 + (k + az / n) * h);
      }

  // normals from the gradient, then one step onto the surface
  const vn = pos.length / 3;
  const P = new Float32Array(pos.length), N = new Float32Array(pos.length), C = new Float32Array(pos.length);
  const e = h * 0.35;
  const grad = (x, y, z, o) => {
    const gx = sdf(x + e, y, z) - sdf(x - e, y, z);
    const gy = sdf(x, y + e, z) - sdf(x, y - e, z);
    const gz = sdf(x, y, z + e) - sdf(x, y, z - e);
    const l = Math.hypot(gx, gy, gz) || 1;
    o[0] = gx / l; o[1] = gy / l; o[2] = gz / l;
  };
  const g = [0, 0, 0], col = [0, 0, 0];
  for (let v = 0; v < vn; v++) {
    let x = pos[v * 3], y = pos[v * 3 + 1], z = pos[v * 3 + 2];
    grad(x, y, z, g);
    const d = sdf(x, y, z);
    if (Math.abs(d) < h) { x -= g[0] * d; y -= g[1] * d; z -= g[2] * d; }
    grad(x, y, z, g);
    P[v * 3] = x; P[v * 3 + 1] = y; P[v * 3 + 2] = z;
    N[v * 3] = g[0]; N[v * 3 + 1] = g[1]; N[v * 3 + 2] = g[2];
    paint(x, y, z, col, g);
    let occ = 1;
    if (ao > 0) {
      let s = 0, w = 0.5;
      for (let i = 1; i <= 4; i++) {
        const t = i * aoStep;
        s += w * (t - sdf(x + g[0] * t, y + g[1] * t, z + g[2] * t)) / aoStep;
        w *= 0.5;
      }
      occ = Math.max(0.35, 1 - ao * s * 0.5);
    }
    C[v * 3] = col[0] * occ; C[v * 3 + 1] = col[1] * occ; C[v * 3 + 2] = col[2] * occ;
  }

  // a quad for every grid edge the surface crosses, joining the four cells round it
  const idx = [];
  const quad = (a, b, c, d) => {
    if (a < 0 || b < 0 || c < 0 || d < 0) return;
    // split along the shorter diagonal, wound to agree with the normals
    const dAC = dist2(P, a, c), dBD = dist2(P, b, d);
    const tris = dAC <= dBD ? [a, b, c, a, c, d] : [a, b, d, b, c, d];
    const flip = !agrees(P, N, tris[0], tris[1], tris[2]);
    for (let t = 0; t < 6; t += 3) {
      if (flip) idx.push(tris[t], tris[t + 2], tris[t + 1]);
      else idx.push(tris[t], tris[t + 1], tris[t + 2]);
    }
  };
  for (let k = 1; k < nz - 1; k++)
    for (let j = 1; j < ny - 1; j++)
      for (let i = 1; i < nx - 1; i++) {
        const s0 = f[i + j * nx + k * sxy] < 0;
        if (i < nx - 1 && s0 !== f[i + 1 + j * nx + k * sxy] < 0)
          quad(cellV[cIdx(i, j - 1, k - 1)], cellV[cIdx(i, j, k - 1)], cellV[cIdx(i, j, k)], cellV[cIdx(i, j - 1, k)]);
        if (j < ny - 1 && s0 !== f[i + (j + 1) * nx + k * sxy] < 0)
          quad(cellV[cIdx(i - 1, j, k - 1)], cellV[cIdx(i, j, k - 1)], cellV[cIdx(i, j, k)], cellV[cIdx(i - 1, j, k)]);
        if (k < nz - 1 && s0 !== f[i + j * nx + (k + 1) * sxy] < 0)
          quad(cellV[cIdx(i - 1, j - 1, k)], cellV[cIdx(i, j - 1, k)], cellV[cIdx(i, j, k)], cellV[cIdx(i - 1, j, k)]);
      }

  return { pos: P, nrm: N, col: C, idx: new Uint32Array(idx) };
}

function dist2(P, a, b) {
  const dx = P[a * 3] - P[b * 3], dy = P[a * 3 + 1] - P[b * 3 + 1], dz = P[a * 3 + 2] - P[b * 3 + 2];
  return dx * dx + dy * dy + dz * dz;
}
function agrees(P, N, a, b, c) {
  const ux = P[b * 3] - P[a * 3], uy = P[b * 3 + 1] - P[a * 3 + 1], uz = P[b * 3 + 2] - P[a * 3 + 2];
  const vx = P[c * 3] - P[a * 3], vy = P[c * 3 + 1] - P[a * 3 + 1], vz = P[c * 3 + 2] - P[a * 3 + 2];
  const cx = uy * vz - uz * vy, cy = uz * vx - ux * vz, cz = ux * vy - uy * vx;
  const nx = N[a * 3] + N[b * 3] + N[c * 3], ny = N[a * 3 + 1] + N[b * 3 + 1] + N[c * 3 + 1], nz = N[a * 3 + 2] + N[b * 3 + 2] + N[c * 3 + 2];
  return cx * nx + cy * ny + cz * nz >= 0;
}

// sRGB hex to a linear [r, g, b]
export function lin(hex) {
  const f = (v) => (v <= 0.04045 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4));
  return [f(((hex >> 16) & 255) / 255), f(((hex >> 8) & 255) / 255), f((hex & 255) / 255)];
}
// mix two linear colours into out
export function mixInto(out, a, t) {
  out[0] += (a[0] - out[0]) * t;
  out[1] += (a[1] - out[1]) * t;
  out[2] += (a[2] - out[2]) * t;
}
