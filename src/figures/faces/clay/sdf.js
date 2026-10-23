// Signed-distance primitives and smooth booleans for the procedural clay head. Pure functions on (x, y, z), no three.js: they run in the page, in a worker,
// and in node for tests. Units: head width about 2 (x in [-1, 1]); y up, +z toward the viewer (three.js axes).
export const smin = (a, b, k) => { if (k <= 0) return Math.min(a, b); const h = Math.max(k - Math.abs(a - b), 0) / k; return Math.min(a, b) - h * h * k * 0.25; };
export const smax = (a, b, k) => -smin(-a, -b, k);
// subtract b from a, smoothly (a minus b)
export const ssub = (a, b, k) => smax(a, -b, k);
export function sphere(x, y, z, cx, cy, cz, r) { return Math.hypot(x - cx, y - cy, z - cz) - r; }
// ellipsoid (the usual cheap bound: exact on the surface's normal direction to first order, good for blends)
export function ellipsoid(x, y, z, cx, cy, cz, rx, ry, rz) {
  const px = (x - cx) / rx, py = (y - cy) / ry, pz = (z - cz) / rz, k0 = Math.hypot(px, py, pz);
  const qx = px / rx, qy = py / ry, qz = pz / rz, k1 = Math.hypot(qx, qy, qz);
  return k1 < 1e-9 ? -Math.min(rx, ry, rz) : k0 * (k0 - 1) / k1;
}
// a capsule between a and b
export function capsule(x, y, z, ax, ay, az, bx, by, bz, r) {
  const pax = x - ax, pay = y - ay, paz = z - az, bax = bx - ax, bay = by - ay, baz = bz - az;
  const h = Math.min(1, Math.max(0, (pax * bax + pay * bay + paz * baz) / (bax * bax + bay * bay + baz * baz + 1e-12)));
  return Math.hypot(pax - bax * h, pay - bay * h, paz - baz * h) - r;
}
// a capsule with its radius varying from ra to rb
export function cone(x, y, z, ax, ay, az, bx, by, bz, ra, rb) {
  const pax = x - ax, pay = y - ay, paz = z - az, bax = bx - ax, bay = by - ay, baz = bz - az;
  const h = Math.min(1, Math.max(0, (pax * bax + pay * bay + paz * baz) / (bax * bax + bay * bay + baz * baz + 1e-12)));
  return Math.hypot(pax - bax * h, pay - bay * h, paz - baz * h) - (ra + (rb - ra) * h);
}
// rotate a point about z (roll), y (yaw) or x (pitch) around a centre; returns [x, y, z]
export function rotZ(x, y, z, a, cx = 0, cy = 0) { const c = Math.cos(a), s = Math.sin(a), dx = x - cx, dy = y - cy; return [cx + c * dx - s * dy, cy + s * dx + c * dy, z]; }
export function rotY(x, y, z, a, cx = 0, cz = 0) { const c = Math.cos(a), s = Math.sin(a), dx = x - cx, dz = z - cz; return [cx + c * dx + s * dz, y, cz - s * dx + c * dz]; }
export function rotX(x, y, z, a, cy = 0, cz = 0) { const c = Math.cos(a), s = Math.sin(a), dy = y - cy, dz = z - cz; return [x, cy + c * dy - s * dz, cz + s * dy + c * dz]; }
