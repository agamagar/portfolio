import * as THREE from "three";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";
import type { Shape, Style } from "../../shared/spec";

export interface Detail {
  radial: number;
  height: number;
  curve: number;
  bevel: number;
}

export function detailFor(style: Style): Detail {
  return style === "low-poly"
    ? { radial: 8, height: 6, curve: 10, bevel: 1 }
    : { radial: 48, height: 32, curve: 72, bevel: 4 };
}

const DEG = Math.PI / 180;

/**
 * Deterministic primitive → BufferGeometry. Never throws for a schema-valid
 * shape: degenerate input is nudged to the nearest buildable value.
 */
export function makeGeometry(shape: Shape, style: Style): THREE.BufferGeometry {
  const d = detailFor(style);
  let g: THREE.BufferGeometry;
  switch (shape.type) {
    case "sphere":
      g =
        style === "low-poly"
          ? new THREE.IcosahedronGeometry(shape.radius, 1)
          : new THREE.SphereGeometry(shape.radius, d.radial, d.height);
      break;
    case "box": {
      const [w, h, depth] = shape.size;
      const r = Math.min(shape.bevel, Math.min(w, h, depth) / 2 - 1e-4);
      g = r > 1e-3 && style !== "low-poly" ? new RoundedBoxGeometry(w, h, depth, d.bevel, r) : new THREE.BoxGeometry(w, h, depth);
      break;
    }
    case "cylinder":
      g = new THREE.CylinderGeometry(shape.radiusTop, Math.max(shape.radiusBottom, shape.radiusTop === 0 ? 1e-3 : 0), shape.height, d.radial);
      break;
    case "cone":
      g = new THREE.ConeGeometry(shape.radius, shape.height, d.radial);
      break;
    case "capsule":
      g = new THREE.CapsuleGeometry(shape.radius, shape.length, Math.max(2, d.height / 4), d.radial);
      break;
    case "torus":
      g = new THREE.TorusGeometry(
        shape.radius,
        Math.min(shape.tube, shape.radius),
        Math.max(6, d.height / 2),
        d.curve,
        Math.min(360, shape.arcDegrees) * DEG,
      );
      break;
    case "lathe": {
      const pts = shape.profile.map(([r, y]) => new THREE.Vector2(Math.max(0, r), y));
      g = new THREE.LatheGeometry(pts, d.radial);
      break;
    }
    case "extrude": {
      const s = new THREE.Shape(shape.outline.map(([x, y]) => new THREE.Vector2(x, y)));
      const bevel = Math.min(shape.bevel, shape.depth / 2);
      g = new THREE.ExtrudeGeometry(s, {
        depth: shape.depth,
        bevelEnabled: bevel > 1e-3 && style !== "low-poly",
        bevelSize: bevel,
        bevelThickness: bevel,
        bevelSegments: d.bevel,
        curveSegments: d.curve / 6,
      });
      g.translate(0, 0, -shape.depth / 2);
      break;
    }
    case "tube": {
      const pts = shape.path.map(([x, y, z]) => new THREE.Vector3(x, y, z));
      const curve = new THREE.CatmullRomCurve3(pts, shape.closed, "centripetal");
      g = new THREE.TubeGeometry(curve, Math.max(d.curve / 2, pts.length * 8), shape.radius, Math.max(6, d.radial / 3), shape.closed);
      if (!shape.closed) g = capTube(g, curve, shape.radius, Math.max(6, d.radial / 3));
      break;
    }
  }
  if (style === "low-poly") g = facet(g);
  if (!g.getAttribute("normal")) g.computeVertexNormals();
  g.computeBoundingBox();
  g.computeBoundingSphere();
  return g;
}

/** Non-indexed geometry with face normals, so the facets survive GLB export. */
export function facet(g: THREE.BufferGeometry): THREE.BufferGeometry {
  const out = g.index ? g.toNonIndexed() : g;
  out.deleteAttribute("normal");
  out.computeVertexNormals();
  if (out !== g) g.dispose();
  return out;
}

/** Round end caps so open tubes read as solid limbs, stems, handles. */
function capTube(g: THREE.BufferGeometry, curve: THREE.Curve<THREE.Vector3>, radius: number, segs: number) {
  const caps: THREE.BufferGeometry[] = [g];
  for (const t of [0, 1]) {
    const cap = new THREE.SphereGeometry(radius, segs, Math.max(4, segs / 2));
    const p = curve.getPointAt(t);
    cap.translate(p.x, p.y, p.z);
    caps.push(cap);
  }
  const merged = mergeSimple(caps);
  caps.forEach((c) => c.dispose());
  return merged;
}

/** Minimal merge for geometries with position/normal/uv (avoids pulling BufferGeometryUtils for one call). */
export function mergeSimple(geos: THREE.BufferGeometry[]): THREE.BufferGeometry {
  const parts = geos.map((g) => (g.index ? g.toNonIndexed() : g));
  const total = parts.reduce((n, g) => n + g.getAttribute("position").count, 0);
  const pos = new Float32Array(total * 3);
  const nor = new Float32Array(total * 3);
  const uv = new Float32Array(total * 2);
  let o = 0;
  for (const g of parts) {
    const p = g.getAttribute("position");
    const n = g.getAttribute("normal");
    const u = g.getAttribute("uv");
    pos.set(p.array as Float32Array, o * 3);
    if (n) nor.set(n.array as Float32Array, o * 3);
    if (u) uv.set(u.array as Float32Array, o * 2);
    o += p.count;
  }
  const out = new THREE.BufferGeometry();
  out.setAttribute("position", new THREE.BufferAttribute(pos, 3));
  out.setAttribute("normal", new THREE.BufferAttribute(nor, 3));
  out.setAttribute("uv", new THREE.BufferAttribute(uv, 2));
  parts.forEach((g, i) => g !== geos[i] && g.dispose());
  return out;
}
