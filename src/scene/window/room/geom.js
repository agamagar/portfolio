// Geometry helpers for the room: boxes and extruded profiles with UVs in metres
// (so a procedural texture keeps one physical scale everywhere, and brush streaks
// run along each member's grain), plus a batcher that merges every static part
// per material into one mesh (a few draw calls instead of hundreds).
//
// All geometries here are non-indexed with position, normal and uv, so any of them
// can be merged with any other.

import * as THREE from "three/webgpu";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";

const AX = { x: 0, y: 1, z: 2 };

// Push one planar quad (a, b, c, d counter-clockwise seen from the front) with UVs
// from two in-plane axes (metres).
function pushQuad(out, a, b, c, d, n, uAxis, vAxis) {
  const tri = [a, b, c, a, c, d];
  for (const p of tri) {
    out.pos.push(p[0], p[1], p[2]);
    out.nrm.push(n[0], n[1], n[2]);
    out.uv.push(p[0] * uAxis[0] + p[1] * uAxis[1] + p[2] * uAxis[2], p[0] * vAxis[0] + p[1] * vAxis[1] + p[2] * vAxis[2]);
  }
}

function toGeometry(out) {
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute(out.pos, 3));
  g.setAttribute("normal", new THREE.Float32BufferAttribute(out.nrm, 3));
  g.setAttribute("uv", new THREE.Float32BufferAttribute(out.uv, 2));
  return g;
}

// Axis-aligned box from min/max corners (metres). grain: the axis the paint's
// brush streaks run along ('x' | 'y' | 'z'); on every face that contains it, the
// texture's v runs along it. faces: optional subset, e.g. { nz: false } drops the
// back face (-z) where nothing can see it.
export function boxGeo(x0, x1, y0, y1, z0, z1, grain = "y", faces = {}) {
  const out = { pos: [], nrm: [], uv: [] };
  const X = [1, 0, 0], Y = [0, 1, 0], Z = [0, 0, 1];
  const g = grain === "x" ? X : grain === "z" ? Z : Y;
  // choose (u, v) for a face with normal axis `na`: v along the grain when possible
  const uvFor = (na) => {
    const others = [X, Y, Z].filter((_, i) => i !== na);
    if (others.includes(g)) return [others.find((o) => o !== g), g];
    return others;
  };
  const f = (name) => faces[name] !== false;
  // +x
  if (f("px")) { const [u, v] = uvFor(0); pushQuad(out, [x1, y0, z1], [x1, y0, z0], [x1, y1, z0], [x1, y1, z1], [1, 0, 0], u, v); }
  if (f("nx")) { const [u, v] = uvFor(0); pushQuad(out, [x0, y0, z0], [x0, y0, z1], [x0, y1, z1], [x0, y1, z0], [-1, 0, 0], u, v); }
  if (f("py")) { const [u, v] = uvFor(1); pushQuad(out, [x0, y1, z1], [x1, y1, z1], [x1, y1, z0], [x0, y1, z0], [0, 1, 0], u, v); }
  if (f("ny")) { const [u, v] = uvFor(1); pushQuad(out, [x0, y0, z0], [x1, y0, z0], [x1, y0, z1], [x0, y0, z1], [0, -1, 0], u, v); }
  if (f("pz")) { const [u, v] = uvFor(2); pushQuad(out, [x0, y0, z1], [x1, y0, z1], [x1, y1, z1], [x0, y1, z1], [0, 0, 1], u, v); }
  if (f("nz")) { const [u, v] = uvFor(2); pushQuad(out, [x1, y0, z0], [x0, y0, z0], [x0, y1, z0], [x1, y1, z0], [0, 0, -1], u, v); }
  return toGeometry(out);
}

// Extrude a closed 2D profile along an axis from a0 to a1 (metres).
//   axis 'y': profile points are (x, z)   (vertical members: stiles, casing, post)
//   axis 'x': profile points are (y, z)   (horizontal members: rails, sill, head)
//   axis 'z': profile points are (x, y)
// The profile is counter-clockwise when seen from the +axis end. smooth: indices of
// profile vertices whose side normals are averaged (round beads); caps: end caps.
export function prismGeo(profile, axis, a0, a1, { smooth = null, caps = true } = {}) {
  const out = { pos: [], nrm: [], uv: [] };
  const ai = AX[axis];
  // accept either winding: a clockwise profile (negative signed area in the (p, q)
  // plane) is reversed, and its smooth indices with it
  let area = 0;
  for (let i = 0; i < profile.length; i++) {
    const [p0, q0] = profile[i], [p1, q1] = profile[(i + 1) % profile.length];
    area += p0 * q1 - p1 * q0;
  }
  if (area < 0) {
    const n0 = profile.length;
    profile = profile.slice().reverse();
    if (smooth) smooth = smooth.map((i) => n0 - 1 - i);
  }
  // map (p, q, a) to xyz for this axis
  const P = (p, q, a) => (ai === 1 ? [p, a, q] : ai === 0 ? [a, p, q] : [p, q, a]);
  const n = profile.length;
  // side faces
  const edgeN = [];
  for (let i = 0; i < n; i++) {
    const [p0, q0] = profile[i], [p1, q1] = profile[(i + 1) % n];
    const dp = p1 - p0, dq = q1 - q0, L = Math.hypot(dp, dq) || 1;
    // outward normal of a CCW profile seen from +axis: (dq, -dp) rotated into 3D
    edgeN.push([dq / L, -dp / L]);
  }
  const vN = profile.map((_, i) => {
    const a = edgeN[(i - 1 + n) % n], b = edgeN[i];
    const m = [a[0] + b[0], a[1] + b[1]];
    const L = Math.hypot(m[0], m[1]) || 1;
    return [m[0] / L, m[1] / L];
  });
  const sm = smooth ? new Set(smooth) : null;
  // arc length along the profile for the u coordinate
  let s = 0;
  const sAt = [0];
  for (let i = 0; i < n; i++) {
    const [p0, q0] = profile[i], [p1, q1] = profile[(i + 1) % n];
    s += Math.hypot(p1 - p0, q1 - q0);
    sAt.push(s);
  }
  // handedness: in the ai === 1 mapping (p, a, q) the frame is left-handed, flip
  const flip = ai === 1;
  for (let i = 0; i < n; i++) {
    const j = (i + 1) % n;
    const [p0, q0] = profile[i], [p1, q1] = profile[j];
    const nA = sm && sm.has(i) ? vN[i] : edgeN[i];
    const nB = sm && sm.has(j) ? vN[j] : edgeN[i];
    const N = (nn) => P(nn[0], nn[1], 0);
    const verts = [
      [P(p0, q0, a0), N(nA), sAt[i], a0],
      [P(p1, q1, a0), N(nB), sAt[i + 1], a0],
      [P(p1, q1, a1), N(nB), sAt[i + 1], a1],
      [P(p0, q0, a1), N(nA), sAt[i], a1],
    ];
    const order = flip ? [0, 3, 2, 0, 2, 1] : [0, 1, 2, 0, 2, 3];
    for (const k of order) {
      const [p, nn, u, v] = verts[k];
      out.pos.push(p[0], p[1], p[2]);
      out.nrm.push(nn[0], nn[1], nn[2]);
      out.uv.push(u, v);
    }
  }
  if (caps) {
    const tris = THREE.ShapeUtils.triangulateShape(profile.map(([p, q]) => new THREE.Vector2(p, q)), []);
    for (const [a, sign] of [[a1, 1], [a0, -1]]) {
      const nn = P(0, 0, sign);
      for (const t of tris) {
        const idx = (sign > 0) !== flip ? t : [t[0], t[2], t[1]];
        for (const k of idx) {
          const [p, q] = profile[k];
          const v = P(p, q, a);
          out.pos.push(v[0], v[1], v[2]);
          out.nrm.push(nn[0], nn[1], nn[2]);
          out.uv.push(p, q);
        }
      }
    }
  }
  return toGeometry(out);
}

// A three.js geometry made compatible with the batcher: non-indexed, only
// position/normal/uv, UVs optionally rescaled.
export function clean(g, uvScale = 1) {
  const n = g.index ? g.toNonIndexed() : g;
  if (n !== g) g.dispose();
  for (const k of Object.keys(n.attributes)) if (!["position", "normal", "uv"].includes(k)) n.deleteAttribute(k);
  if (!n.attributes.normal) n.computeVertexNormals();
  if (!n.attributes.uv) n.setAttribute("uv", new THREE.Float32BufferAttribute(new Float32Array((n.attributes.position.count) * 2), 2));
  if (uvScale !== 1) {
    const uv = n.attributes.uv;
    for (let i = 0; i < uv.count; i++) uv.setXY(i, uv.getX(i) * uvScale, uv.getY(i) * uvScale);
  }
  n.groups = [];
  return n;
}

// A bar of square (or w x d) section from a to b; its grain runs along it.
export function barGeo(a, b, w, d = w) {
  const va = new THREE.Vector3(...a), vb = new THREE.Vector3(...b);
  const len = va.distanceTo(vb);
  const g = boxGeo(-w / 2, w / 2, 0, len, -d / 2, d / 2, "y");
  const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), vb.clone().sub(va).normalize());
  g.applyMatrix4(new THREE.Matrix4().compose(va, q, new THREE.Vector3(1, 1, 1)));
  return g;
}

// A bar of rounded-rectangle section, sx (x) by sz (z), corner radius r, along +y
// from 0 to len, centred in x and z. Exact normals: the flats keep their face
// normal, each fillet its radial one, so a glossy bar draws the continuous
// highlight line along its length that the photos show on the black room bars
// (5481: a thin bright line down every bar; a square box has no normal between
// its faces that can catch the light, so it read as a flat dark strip). UVs in
// metres: u round the section, v along the bar (the grain). Caps close both ends.
export function roundBarY(len, sx, sz, r, seg = 4) {
  const hx = sx / 2, hz = sz / 2;
  r = Math.max(0, Math.min(r, hx, hz));
  // the section, counter-clockwise from +x toward +z: [x, z, nx, nz] (each fillet's
  // ends repeat so the flats between them stay flat)
  const pts = [];
  const corners = [[hx - r, hz - r, 0], [-(hx - r), hz - r, 90], [-(hx - r), -(hz - r), 180], [hx - r, -(hz - r), 270]];
  for (const [cx, cz, a0] of corners)
    for (let i = 0; i <= seg; i++) {
      const t = ((a0 + (90 * i) / seg) * Math.PI) / 180;
      pts.push([cx + r * Math.cos(t), cz + r * Math.sin(t), Math.cos(t), Math.sin(t)]);
    }
  const out = { pos: [], nrm: [], uv: [] };
  let s = 0;
  const n = pts.length;
  for (let i = 0; i < n; i++) {
    const a = pts[i], b = pts[(i + 1) % n];
    const ds = Math.hypot(b[0] - a[0], b[1] - a[1]);
    if (ds < 1e-9) continue;
    // outside: a@0, a@len, b@len and a@0, b@len, b@0 (counter-clockwise seen from outside)
    const V = [[a, 0, s], [a, len, s], [b, len, s + ds], [a, 0, s], [b, len, s + ds], [b, 0, s + ds]];
    for (const [p, y, u] of V) {
      out.pos.push(p[0], y, p[1]);
      out.nrm.push(p[2], 0, p[3]);
      out.uv.push(u, y);
    }
    s += ds;
  }
  // caps: a fan from the centre (bottom faces -y, top +y)
  for (const [y, ny] of [[0, -1], [len, 1]])
    for (let i = 0; i < n; i++) {
      const a = pts[i], b = pts[(i + 1) % n];
      const tri = ny > 0 ? [[0, 0], [b[0], b[1]], [a[0], a[1]]] : [[0, 0], [a[0], a[1]], [b[0], b[1]]];
      for (const [x, z] of tri) {
        out.pos.push(x, y, z);
        out.nrm.push(0, ny, 0);
        out.uv.push(x, z);
      }
    }
  return toGeometry(out);
}

// roundBarY from a to b (world points, metres): the square bars of the room grille
export function roundBarGeo(a, b, w, d = w, r = 0.3 * Math.min(w, d), seg = 4) {
  const va = new THREE.Vector3(...a), vb = new THREE.Vector3(...b);
  const g = roundBarY(va.distanceTo(vb), w, d, r, seg);
  const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), vb.clone().sub(va).normalize());
  g.applyMatrix4(new THREE.Matrix4().compose(va, q, new THREE.Vector3(1, 1, 1)));
  return g;
}

// A flat bar along x, centred at the origin: len long, sy tall, sz deep, rounded
// edges (the grille's tie bars), for the same matrix a centred boxGeo(.., "x") takes
export function roundBeamX(len, sy, sz, r, seg = 3) {
  const g = roundBarY(len, sy, sz, r, seg); // along +y, sy across x
  g.applyMatrix4(new THREE.Matrix4().makeRotationZ(-Math.PI / 2)); // +y -> +x, x -> -y
  g.translate(-len / 2, 0, 0);
  return g;
}

// Collects geometries per material and merges them. Each add() takes an optional
// matrix (applied to a clone). build(parent) makes one mesh per material.
export class Batch {
  constructor(name = "batch") {
    this.name = name;
    this.items = new Map();
  }
  add(material, geometry, matrix = null, { cast = true, receive = true } = {}) {
    const key = material.uuid + (cast ? "c" : "") + (receive ? "r" : "");
    if (!this.items.has(key)) this.items.set(key, { material, geos: [], cast, receive });
    const g = clean(geometry);
    if (matrix) g.applyMatrix4(matrix);
    this.items.get(key).geos.push(g);
    return g;
  }
  build(parent) {
    const meshes = [];
    for (const { material, geos, cast, receive } of this.items.values()) {
      if (!geos.length) continue;
      const merged = geos.length === 1 ? geos[0] : mergeGeometries(geos, false);
      if (geos.length > 1) geos.forEach((g) => g.dispose());
      merged.computeBoundingSphere();
      merged.computeBoundingBox();
      const m = new THREE.Mesh(merged, material);
      m.name = `${this.name}:${material.name || "mat"}`;
      m.castShadow = cast;
      m.receiveShadow = receive;
      parent.add(m);
      meshes.push(m);
    }
    this.items.clear();
    return meshes;
  }
}

// Matrix helpers
export const M = {
  T: (x, y, z) => new THREE.Matrix4().makeTranslation(x, y, z),
  RY: (a) => new THREE.Matrix4().makeRotationY(a),
  RX: (a) => new THREE.Matrix4().makeRotationX(a),
  RZ: (a) => new THREE.Matrix4().makeRotationZ(a),
  mul: (...ms) => ms.reduce((acc, m) => acc.multiply(m), new THREE.Matrix4()),
};

// A monitor bezel: one frame, a rounded-rectangle outline with a screen-sized hole,
// extruded from z0 to z1 (metres) with a small chamfer on its edges (Agam,
// 2026-10-05: "make both bezels of the monitors equal and same properties and add a
// slight corner radius and chamfering"). Centred on (cx, cy). ow/oh the outer size,
// iw/ih the hole; r the outer corner radius, ri the hole's; ch the chamfer.
// ExtrudeGeometry grows a bevel OUTWARD by `ch` and adds `ch` to each face, so the
// outline is shrunk, the hole grown and the depth cut by the same amounts: the frame
// lands on exactly the box the square bars used to fill.
function roundRectPath(path, w, h, r) {
  const x = -w / 2, y = -h / 2;
  r = Math.min(r, w / 2, h / 2);
  path.moveTo(x + r, y);
  path.lineTo(x + w - r, y);
  path.quadraticCurveTo(x + w, y, x + w, y + r);
  path.lineTo(x + w, y + h - r);
  path.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  path.lineTo(x + r, y + h);
  path.quadraticCurveTo(x, y + h, x, y + h - r);
  path.lineTo(x, y + r);
  path.quadraticCurveTo(x, y, x + r, y);
  return path;
}
export function bezelFrameGeo({ ow, oh, iw, ih, z0, z1, r = 0.006, ri = 0.002, ch = 0.0012, cx = 0, cy = 0 }) {
  const shape = roundRectPath(new THREE.Shape(), ow - 2 * ch, oh - 2 * ch, Math.max(0, r - ch));
  shape.holes.push(roundRectPath(new THREE.Path(), iw + 2 * ch, ih + 2 * ch, ri + ch));
  const g = new THREE.ExtrudeGeometry(shape, {
    depth: Math.max(0.0001, z1 - z0 - 2 * ch),
    bevelEnabled: true,
    bevelThickness: ch,
    bevelSize: ch,
    bevelSegments: 1, // one segment: a flat chamfer, not a round
    curveSegments: 6,
  });
  g.translate(cx, cy, z0 + ch);
  return g;
}
