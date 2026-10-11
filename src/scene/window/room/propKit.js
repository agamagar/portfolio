// Small helpers for the desk toys' detail pass (2026-10-11, Agam: "add a lot more
// detail to the 3D models"): materials a prop owns (freed with its geometry, since
// room.js's dispose frees only the shared set), creased normals so lathed and
// extruded parts shade smooth without losing their hard edges, tubes along curves,
// and a soft contact shadow under a toy.

import * as THREE from "three/webgpu";
import { toCreasedNormals } from "three/addons/utils/BufferGeometryUtils.js";

// free `owned` (materials, textures) when the first mesh's geometry is disposed
export function ownWith(meshes, owned) {
  const g = meshes.find((m) => m.geometry)?.geometry;
  if (g) g.addEventListener("dispose", () => owned.forEach((o) => o.dispose()));
}

// smooth across shallow angles, keep creases past `deg` (the geometry may be indexed or not)
export function creased(geo, deg = 40) {
  const g = toCreasedNormals(geo.index ? geo : geo, (deg * Math.PI) / 180);
  return g;
}

// a thin tube along points (metres), for cables, seams and panel gaps
export function tubeAlong(points, radius, seg = 24, radial = 5) {
  const curve = new THREE.CatmullRomCurve3(points.map((p) => new THREE.Vector3(...p)));
  return new THREE.TubeGeometry(curve, seg, radius, radial, false);
}

// a soft dark footprint on the surface the toy stands on: a radial gradient, black,
// multiplied in by its alpha. Parent is the toy's group; w and d in the group's units.
export function contactShadow(parent, { w, d, y = 0.0002, opacity = 0.55, name = "contactShadow" }) {
  const S = 64;
  const cv = typeof document !== "undefined" ? document.createElement("canvas") : null;
  if (!cv) return null;
  cv.width = cv.height = S;
  const c = cv.getContext("2d");
  const g = c.createRadialGradient(S / 2, S / 2, 0, S / 2, S / 2, S / 2);
  g.addColorStop(0, "rgba(0,0,0,1)");
  g.addColorStop(0.45, "rgba(0,0,0,0.55)");
  g.addColorStop(1, "rgba(0,0,0,0)");
  c.fillStyle = g;
  c.fillRect(0, 0, S, S);
  const tex = new THREE.CanvasTexture(cv);
  const mat = new THREE.MeshBasicMaterial({ color: 0x000000, alphaMap: tex, transparent: true, opacity, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -2 });
  const geo = new THREE.PlaneGeometry(w, d);
  geo.rotateX(-Math.PI / 2);
  const mesh = new THREE.Mesh(geo, mat);
  mesh.name = name;
  mesh.position.y = y;
  mesh.renderOrder = 1;
  parent.add(mesh);
  geo.addEventListener("dispose", () => { mat.dispose(); tex.dispose(); });
  return mesh;
}

// the footprint of a built toy in its group's own frame: centre and size on x and z
export function footprint(group) {
  group.updateMatrixWorld(true);
  const inv = new THREE.Matrix4().copy(group.matrixWorld).invert();
  const box = new THREE.Box3(), tmp = new THREE.Box3(), m = new THREE.Matrix4();
  group.traverse((o) => {
    if (!o.isMesh || !o.geometry || o.name === "contactShadow") return;
    if (!o.geometry.boundingBox) o.geometry.computeBoundingBox();
    tmp.copy(o.geometry.boundingBox).applyMatrix4(m.multiplyMatrices(inv, o.matrixWorld));
    box.union(tmp);
  });
  if (box.isEmpty()) return null;
  return { cx: (box.min.x + box.max.x) / 2, cz: (box.min.z + box.max.z) / 2, w: box.max.x - box.min.x, d: box.max.z - box.min.z };
}
