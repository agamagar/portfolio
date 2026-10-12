import * as THREE from "three";
import { describe, expect, it } from "vitest";
import { STYLES, type Shape } from "../shared/spec";
import { buildLights, buildModel, frameCamera, meshBounds } from "../src/three/builder";
import { makeGeometry } from "../src/three/geometry";
import { fixtureSpec, miniSpec, p } from "./helpers";

const SHAPES: Shape[] = [
  { type: "sphere", radius: 0.5 },
  { type: "box", size: [1, 0.5, 0.8], bevel: 0.1 },
  { type: "box", size: [1, 0.5, 0.8], bevel: 0 },
  { type: "cylinder", radiusTop: 0.2, radiusBottom: 0.4, height: 1 },
  { type: "cone", radius: 0.4, height: 1 },
  { type: "capsule", radius: 0.2, length: 0.6 },
  { type: "torus", radius: 0.5, tube: 0.1, arcDegrees: 200 },
  { type: "lathe", profile: [[0, 0], [0.5, 0], [0.4, 0.5], [0, 0.8]] },
  { type: "extrude", outline: [[0, 0], [1, 0], [0.5, 0.8]], depth: 0.2, bevel: 0.02 },
  { type: "tube", path: [[0, 0, 0], [0.2, 0.5, 0], [0, 1, 0.2]], radius: 0.05, closed: false },
];

function worldPos(o: THREE.Object3D) {
  return o.getWorldPosition(new THREE.Vector3());
}

describe("makeGeometry", () => {
  for (const style of STYLES) {
    for (const shape of SHAPES) {
      it(`${shape.type} builds finite, non-empty geometry in ${style}`, () => {
        const g = makeGeometry(shape, style);
        const pos = g.getAttribute("position");
        expect(pos.count).toBeGreaterThan(0);
        expect(g.getAttribute("normal")).toBeTruthy();
        for (let i = 0; i < pos.array.length; i++) expect(Number.isFinite(pos.array[i])).toBe(true);
        expect(g.boundingBox!.isEmpty()).toBe(false);
      });
    }
  }

  it("low-poly geometry is faceted (non-indexed) and much lighter", () => {
    const smooth = makeGeometry({ type: "sphere", radius: 1 }, "clay");
    const faceted = makeGeometry({ type: "sphere", radius: 1 }, "low-poly");
    expect(faceted.index).toBeNull();
    const tris = (g: THREE.BufferGeometry) => (g.index ? g.index.count : g.getAttribute("position").count) / 3;
    expect(tris(faceted)).toBeLessThan(tris(smooth) / 5);
  });

  it("clamps a bevel larger than the box", () => {
    const g = makeGeometry({ type: "box", size: [0.2, 0.2, 0.2], bevel: 1 }, "clay");
    g.computeBoundingBox();
    const size = g.boundingBox!.getSize(new THREE.Vector3());
    expect(size.x).toBeCloseTo(0.2, 2);
  });
});

describe("buildModel", () => {
  it("sits the model on the ground, centred on X/Z", () => {
    const spec = miniSpec([p("a", { type: "sphere", radius: 0.5 }, { position: [3, 5, -2] })]);
    const { bounds, offset, root } = buildModel(spec);
    expect(bounds.min.y).toBeCloseTo(0, 5);
    const c = bounds.getCenter(new THREE.Vector3());
    expect(c.x).toBeCloseTo(0, 5);
    expect(c.z).toBeCloseTo(0, 5);
    expect(offset.toArray()).toEqual([-3, -4.5, 2]);
    expect(meshBounds(root).min.y).toBeCloseTo(0, 5);
  });

  it("children follow the parent's position and rotation but not its scale", () => {
    const spec = miniSpec([
      p("body", { type: "sphere", radius: 0.5 }, { position: [0, 1, 0], rotation: [0, 90, 0], scale: [3, 3, 3] }),
      p("nose", { type: "sphere", radius: 0.1 }, { parentId: "body", position: [0, 0, 1] }),
    ]);
    const { root } = buildModel(spec);
    const body = root.getObjectByName("body")!;
    const nose = root.getObjectByName("nose")!;
    // rotated 90° about Y: local +Z becomes world +X, 1 unit away (unscaled)
    const d = worldPos(nose).sub(worldPos(body));
    expect(d.x).toBeCloseTo(1, 5);
    expect(d.z).toBeCloseTo(0, 5);
    const noseMesh = nose.children.find((c) => (c as THREE.Mesh).isMesh)!;
    expect(noseMesh.getWorldScale(new THREE.Vector3()).x).toBeCloseTo(1, 5);
  });

  it("resolves parents listed after their children", () => {
    const spec = miniSpec([
      p("child", { type: "sphere", radius: 0.1 }, { parentId: "parent", position: [1, 0, 0] }),
      p("parent", { type: "sphere", radius: 0.2 }, { position: [0, 2, 0] }),
    ]);
    const { root } = buildModel(spec);
    expect(root.getObjectByName("child")!.parent!.name).toBe("parent");
  });

  it("mirrorX reflects a part (and its children) across the parent's X = 0 plane", () => {
    const spec = miniSpec([
      p("head", { type: "sphere", radius: 1 }, { position: [0, 1, 0] }),
      p("ear", { type: "cone", radius: 0.2, height: 0.5 }, { parentId: "head", position: [0.6, 0.8, 0], mirrorX: true }),
      p("tip", { type: "sphere", radius: 0.05 }, { parentId: "ear", position: [0, 0.3, 0] }),
    ]);
    const { root, stats } = buildModel(spec);
    expect(stats.mirrored).toBe(1);
    const ear = worldPos(root.getObjectByName("ear")!);
    const mirrored = worldPos(root.getObjectByName("ear-mirrored")!);
    expect(mirrored.x).toBeCloseTo(-ear.x, 5);
    expect(mirrored.y).toBeCloseTo(ear.y, 5);
    // the mirrored copy includes the child
    const mirroredTips: THREE.Object3D[] = [];
    root.getObjectByName("ear-mirrored")!.traverse((o) => o.name === "tip" && !(o as THREE.Mesh).isMesh && mirroredTips.push(o));
    expect(mirroredTips).toHaveLength(1);
    expect(worldPos(mirroredTips[0]).x).toBeCloseTo(-worldPos(root.getObjectByName("tip")!).x, 5);
  });

  it("applies pose adjustments on top of the rest rotation", () => {
    const parts = [p("arm", { type: "capsule", radius: 0.1, length: 1 }, { position: [0, 1, 0] }), p("hand", { type: "sphere", radius: 0.1 }, { parentId: "arm", position: [0, -1, 0] })];
    const rest = buildModel(miniSpec(parts)).root;
    const posed = buildModel(miniSpec(parts, { pose: { description: "", adjustments: [{ partId: "arm", rotation: [0, 0, 90] }] } })).root;
    const r = worldPos(rest.getObjectByName("hand")!).sub(worldPos(rest.getObjectByName("arm")!));
    const q = worldPos(posed.getObjectByName("hand")!).sub(worldPos(posed.getObjectByName("arm")!));
    expect(r.y).toBeCloseTo(-1, 5);
    expect(q.x).toBeCloseTo(1, 5); // swung up to +X
  });

  it("uses one material per spec material and the style's material type", () => {
    const parts = [p("a", { type: "sphere", radius: 0.5 }), p("b", { type: "box", size: [1, 1, 1], bevel: 0.1 }, { position: [1, 0, 0] })];
    const types = { clay: "MeshStandardMaterial", toon: "MeshToonMaterial", "low-poly": "MeshStandardMaterial", felt: "MeshPhysicalMaterial" } as const;
    for (const style of STYLES) {
      const { root } = buildModel(miniSpec(parts), { style });
      const mats = new Set<THREE.Material>();
      root.traverse((o) => (o as THREE.Mesh).isMesh && !o.userData.outline && mats.add((o as THREE.Mesh).material as THREE.Material));
      expect(mats.size).toBe(1);
      expect([...mats][0].type).toBe(types[style]);
    }
  });

  it("adds outline hulls in toon style only, excluded from triangle counts", () => {
    const spec = miniSpec([p("a", { type: "sphere", radius: 0.5 })]);
    const count = (style: "toon" | "clay") => {
      let n = 0;
      buildModel(spec, { style }).root.traverse((o) => o.userData.outline && n++);
      return n;
    };
    expect(count("toon")).toBe(1);
    expect(count("clay")).toBe(0);
    expect(buildModel(spec, { style: "toon" }).stats.triangles).toBe(buildModel(spec, { style: "clay" }).stats.triangles);
  });

  it("uses sandbox geometry for custom parts, or a placeholder with a warning", () => {
    const custom = { id: "gear", name: "Gear", description: "", code: "return null", parentId: "", position: [0, 0, 0] as [number, number, number], rotation: [0, 0, 0] as [number, number, number], scale: [1, 1, 1] as [number, number, number], materialId: "m" };
    const spec = miniSpec([p("a", { type: "sphere", radius: 0.5 })], { customParts: [custom] });
    const missing = buildModel(spec);
    expect(missing.warnings.join(" ")).toMatch(/gear/);
    expect(missing.stats.custom).toBe(0);

    const g = new THREE.BoxGeometry(0.3, 0.3, 0.3);
    const ok = buildModel(spec, { customGeometries: new Map([["gear", g]]) });
    expect(ok.stats.custom).toBe(1);
    expect((ok.root.getObjectByName("gear")!.children[0] as THREE.Mesh).geometry).toBe(g);
  });

  it("is deterministic", () => {
    const spec = fixtureSpec("refine.toadstool.1.json");
    const a = buildModel(spec).root;
    const b = buildModel(spec).root;
    const sig = (r: THREE.Object3D) => {
      const out: string[] = [];
      r.updateMatrixWorld(true);
      r.traverse((o) => out.push(`${o.name}:${o.matrixWorld.elements.map((x) => x.toFixed(4)).join(",")}`));
      return out.join("|");
    };
    expect(sig(a)).toBe(sig(b));
  });

  for (const name of ["create.toadstool.json", "refine.toadstool.1.json", "refine.toadstool.2.json", "create.robot.json", "refine.robot.1.json"]) {
    it(`builds the ${name} fixture spec in every style`, () => {
      const spec = fixtureSpec(name);
      for (const style of STYLES) {
        const r = buildModel(spec, { style, customGeometries: new Map([["gear", new THREE.TorusGeometry(0.2, 0.05)]]) });
        expect(r.warnings).toEqual([]);
        expect(r.stats.meshes).toBe(spec.parts.length + spec.customParts.length);
        const size = r.bounds.getSize(new THREE.Vector3());
        expect(size.y).toBeGreaterThan(1.5);
        expect(size.y).toBeLessThan(3);
      }
    });
  }
});

describe("lights and camera", () => {
  it("builds a rig with a shadow-casting key light", () => {
    const spec = miniSpec([p("a", { type: "sphere", radius: 0.5 })]);
    const lights = buildLights(spec);
    const dirs = lights.children.filter((c) => (c as THREE.DirectionalLight).isDirectionalLight) as THREE.DirectionalLight[];
    expect(dirs.length).toBe(3);
    expect(dirs.filter((d) => d.castShadow)).toHaveLength(1);
  });

  it("frames the whole model even when the spec camera is inside it", () => {
    const spec = miniSpec([p("a", { type: "box", size: [2, 2, 2], bevel: 0 })], { camera: { position: [0, 1, 0.2], target: [0, 1, 0], fov: 35 } });
    const built = buildModel(spec);
    const cam = frameCamera(spec, built, 1);
    const camera = new THREE.PerspectiveCamera(cam.fov, 1, cam.near, cam.far);
    camera.position.copy(cam.position);
    camera.lookAt(cam.target);
    camera.updateMatrixWorld();
    const frustum = new THREE.Frustum().setFromProjectionMatrix(new THREE.Matrix4().multiplyMatrices(camera.projectionMatrix, camera.matrixWorldInverse));
    const b = built.bounds;
    for (const x of [b.min.x, b.max.x]) for (const y of [b.min.y, b.max.y]) for (const z of [b.min.z, b.max.z]) expect(frustum.containsPoint(new THREE.Vector3(x, y, z))).toBe(true);
  });
});
