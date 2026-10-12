/**
 * Spec → three.js scene graph. Pure and deterministic: no DOM, no WebGL, so it
 * runs (and is unit-tested) in Node. Custom snippet geometry is produced
 * elsewhere (the sandbox worker) and passed in as finished BufferGeometry.
 *
 * Hierarchy: every part is a pivot Group (position + rotation, pose applied)
 * holding a Mesh (scale). Children attach to the parent's pivot, so they follow
 * its position/rotation but not its scale. mirrorX wraps a clone of the whole
 * subtree in a Group with scale.x = -1, reflecting it across the parent's
 * X = 0 plane.
 */
import * as THREE from "three";
import type { CustomPartSpec, PartSpec, Spec, Style } from "../../shared/spec";
import { makeGeometry } from "./geometry";
import { makeMaterial, makeOutlineMaterial } from "./materials";

const DEG = Math.PI / 180;

export interface BuildOptions {
  /** Override the spec's style (the viewer's style switch). */
  style?: Style;
  /** Geometry produced by the sandbox for spec.customParts, keyed by custom part id. */
  customGeometries?: Map<string, THREE.BufferGeometry>;
  /** Add inverted-hull outlines in toon style (on by default). */
  outlines?: boolean;
}

export interface BuildResult {
  root: THREE.Group;
  /** The translation applied to sit the model on the ground, centred. Apply to the spec camera too. */
  offset: THREE.Vector3;
  bounds: THREE.Box3;
  warnings: string[];
  stats: { meshes: number; triangles: number; parts: number; mirrored: number; custom: number };
}

type AnyPart = (PartSpec & { kind: "part" }) | (CustomPartSpec & { kind: "custom" });

export function buildModel(spec: Spec, opts: BuildOptions = {}): BuildResult {
  const style = opts.style ?? spec.style;
  const outlines = opts.outlines ?? true;
  const warnings: string[] = [];
  const root = new THREE.Group();
  root.name = spec.title || "model";
  root.userData.spec = { title: spec.title, style };

  const model = new THREE.Group();
  model.name = "model";
  root.add(model);

  const materials = new Map<string, THREE.Material>();
  for (const m of spec.materials) materials.set(m.id, makeMaterial(m, style));
  const fallback = materials.values().next().value as THREE.Material;

  const all: AnyPart[] = [
    ...spec.parts.map((p) => ({ ...p, kind: "part" as const })),
    ...spec.customParts.map((c) => ({ ...c, kind: "custom" as const })),
  ];
  const ordered = topoSort(all, warnings);
  const poseById = new Map(spec.pose.adjustments.map((a) => [a.partId, a.rotation]));

  const pivots = new Map<string, THREE.Group>();
  let meshes = 0;
  let custom = 0;

  for (const p of ordered) {
    const pivot = new THREE.Group();
    pivot.name = p.id;
    pivot.position.set(...p.position);
    pivot.rotation.set(p.rotation[0] * DEG, p.rotation[1] * DEG, p.rotation[2] * DEG, "XYZ");
    const pose = poseById.get(p.id);
    if (pose) {
      const q = new THREE.Quaternion().setFromEuler(new THREE.Euler(pose[0] * DEG, pose[1] * DEG, pose[2] * DEG, "XYZ"));
      pivot.quaternion.multiply(q);
    }
    pivot.userData.partId = p.id;

    let geometry: THREE.BufferGeometry;
    if (p.kind === "part") {
      geometry = makeGeometry(p.shape, style);
    } else {
      const g = opts.customGeometries?.get(p.id);
      if (g) {
        geometry = g;
        custom++;
      } else {
        warnings.push(`Custom part '${p.id}' has no sandbox geometry: showing a placeholder`);
        geometry = makeGeometry({ type: "sphere", radius: 0.15 }, style);
      }
    }
    const material = materials.get(p.materialId) ?? fallback;
    const mesh = new THREE.Mesh(geometry, material);
    mesh.name = p.name || p.id;
    mesh.scale.set(...p.scale);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    mesh.userData.partId = p.id;
    pivot.add(mesh);
    meshes++;

    if (style === "toon" && outlines) {
      const color = (material as THREE.MeshToonMaterial).color ?? new THREE.Color("#333");
      const outline = new THREE.Mesh(geometry, makeOutlineMaterial(color));
      outline.name = `${p.id}__outline`;
      outline.userData.outline = true;
      outline.castShadow = false;
      mesh.add(outline);
    }

    const parent = (p.parentId && pivots.get(p.parentId)) || model;
    parent.add(pivot);
    pivots.set(p.id, pivot);
  }

  // Mirrors deepest-first so a mirrored parent's clone includes its children's mirrors.
  let mirrored = 0;
  for (const p of [...ordered].reverse()) {
    if (p.kind !== "part" || !p.mirrorX) continue;
    const pivot = pivots.get(p.id)!;
    const mirror = new THREE.Group();
    mirror.name = `${p.id}__mirror`;
    mirror.scale.x = -1;
    const copy = pivot.clone(true);
    copy.name = `${p.id}-mirrored`;
    copy.traverse((o) => (o.userData = { ...o.userData, mirrored: true }));
    mirror.add(copy);
    pivot.parent!.add(mirror);
    mirrored++;
  }

  // Sit on the ground (y = 0), centred on X/Z.
  model.updateMatrixWorld(true);
  const bounds = meshBounds(model);
  const offset = new THREE.Vector3();
  if (!bounds.isEmpty()) {
    const c = bounds.getCenter(new THREE.Vector3());
    offset.set(-c.x, -bounds.min.y, -c.z);
    model.position.add(offset);
    bounds.translate(offset);
  } else {
    warnings.push("The model is empty");
  }
  root.updateMatrixWorld(true);

  let triangles = 0;
  root.traverse((o) => {
    if ((o as THREE.Mesh).isMesh && !o.userData.outline) {
      const g = (o as THREE.Mesh).geometry;
      triangles += (g.index ? g.index.count : g.getAttribute("position").count) / 3;
    }
  });

  return {
    root,
    offset,
    bounds,
    warnings,
    stats: { meshes, triangles: Math.round(triangles), parts: ordered.length, mirrored, custom },
  };
}

/** Bounds of the real meshes (outline hulls excluded). */
export function meshBounds(obj: THREE.Object3D): THREE.Box3 {
  const box = new THREE.Box3();
  obj.updateMatrixWorld(true);
  obj.traverse((o) => {
    const m = o as THREE.Mesh;
    if (!m.isMesh || m.userData.outline) return;
    if (!m.geometry.boundingBox) m.geometry.computeBoundingBox();
    const b = m.geometry.boundingBox!.clone().applyMatrix4(m.matrixWorld);
    box.union(b);
  });
  return box;
}

/** Parents before children; unknown parents become root; cycles were broken in repairSpec. */
function topoSort(all: AnyPart[], warnings: string[]): AnyPart[] {
  const byId = new Map(all.map((p) => [p.id, p]));
  const out: AnyPart[] = [];
  const state = new Map<string, 1 | 2>();
  const visit = (p: AnyPart) => {
    const s = state.get(p.id);
    if (s === 2) return;
    if (s === 1) {
      warnings.push(`Parent cycle at '${p.id}'`);
      p.parentId = "";
      return;
    }
    state.set(p.id, 1);
    if (p.parentId) {
      const parent = byId.get(p.parentId);
      if (parent) visit(parent);
      else p.parentId = "";
    }
    state.set(p.id, 2);
    out.push(p);
  };
  all.forEach(visit);
  return out;
}

// ---------------------------------------------------------------------------
// lights + camera
// ---------------------------------------------------------------------------

const RIGS = {
  studio: { sky: "#ffffff", ground: "#b9b2a6", hemi: 1.1, key: 2.4, keyPos: [3, 5, 4], fill: 0.6, rim: 1.2, rimColor: "#ffffff" },
  soft: { sky: "#f4f1ea", ground: "#cfc8bb", hemi: 1.7, key: 1.2, keyPos: [2, 6, 3], fill: 0.5, rim: 0.4, rimColor: "#ffffff" },
  sunset: { sky: "#ffd2a1", ground: "#6b4d6e", hemi: 0.9, key: 2.6, keyPos: [5, 2, 3], fill: 0.4, rim: 1.4, rimColor: "#ff9f6e" },
  night: { sky: "#3a4775", ground: "#11131c", hemi: 0.8, key: 1.6, keyPos: [-3, 4, 3], fill: 0.3, rim: 2.2, rimColor: "#7fd4ff" },
} as const;

export function buildLights(spec: Spec, bounds?: THREE.Box3): THREE.Group {
  const rig = RIGS[spec.lighting.preset];
  const k = spec.lighting.intensity;
  const size = bounds && !bounds.isEmpty() ? bounds.getSize(new THREE.Vector3()).length() : 3;
  const s = Math.max(1, size / 2);

  const g = new THREE.Group();
  g.name = "lights";
  g.add(new THREE.HemisphereLight(rig.sky, rig.ground, rig.hemi * k));

  const key = new THREE.DirectionalLight(new THREE.Color(spec.lighting.keyColor), rig.key * k);
  key.position.set(rig.keyPos[0] * s, rig.keyPos[1] * s, rig.keyPos[2] * s);
  key.castShadow = true;
  key.shadow.mapSize.set(1024, 1024);
  key.shadow.camera.left = key.shadow.camera.bottom = -2 * s;
  key.shadow.camera.right = key.shadow.camera.top = 2 * s;
  key.shadow.camera.far = 30 * s;
  key.shadow.bias = -0.0005;
  key.shadow.normalBias = 0.02;
  key.shadow.radius = 4;
  g.add(key);

  const fill = new THREE.DirectionalLight("#ffffff", rig.fill * k);
  fill.position.set(-4 * s, 2 * s, 2 * s);
  g.add(fill);

  const rim = new THREE.DirectionalLight(rig.rimColor, rig.rim * k);
  rim.position.set(0, 3 * s, -5 * s);
  g.add(rim);
  return g;
}

/**
 * The spec camera, shifted by the grounding offset, pushed back if it would
 * clip into the model or leave it out of frame.
 */
export function frameCamera(spec: Spec, result: Pick<BuildResult, "offset" | "bounds">, aspect = 1) {
  const fov = spec.camera.fov;
  const pos = new THREE.Vector3(...spec.camera.position).add(result.offset);
  const target = new THREE.Vector3(...spec.camera.target).add(result.offset);
  const sphere = result.bounds.isEmpty() ? new THREE.Sphere(new THREE.Vector3(0, 1, 0), 1) : result.bounds.getBoundingSphere(new THREE.Sphere());

  // keep the target near the model
  if (target.distanceTo(sphere.center) > sphere.radius) target.copy(sphere.center);

  const dir = pos.clone().sub(target);
  if (dir.lengthSq() < 1e-6) dir.set(0.6, 0.35, 1);
  dir.normalize();
  const vfov = (fov * Math.PI) / 180;
  const hfov = 2 * Math.atan(Math.tan(vfov / 2) * aspect);
  const need = (sphere.radius * 1.3) / Math.sin(Math.min(vfov, hfov) / 2);
  const dist = Math.max(need, pos.distanceTo(target));
  // don't let a wildly distant spec camera shrink the subject to a dot
  const finalDist = Math.min(dist, need * 2.2);
  pos.copy(target).addScaledVector(dir, finalDist);
  return { position: pos, target, fov, near: Math.max(0.01, finalDist / 100), far: finalDist * 20 };
}

export function disposeObject(obj: THREE.Object3D) {
  const seen = new Set<unknown>();
  obj.traverse((o) => {
    const m = o as THREE.Mesh;
    if (!m.isMesh) return;
    if (!seen.has(m.geometry)) {
      seen.add(m.geometry);
      m.geometry.dispose();
    }
    const mats = Array.isArray(m.material) ? m.material : [m.material];
    for (const mat of mats) {
      if (!seen.has(mat)) {
        seen.add(mat);
        mat.dispose();
      }
    }
  });
}
