import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { GLTFExporter } from "three/examples/jsm/exporters/GLTFExporter.js";
import type { Spec, Style } from "../../shared/spec";
import { buildLights, buildModel, disposeObject, frameCamera, type BuildResult } from "./builder";
import { buildCustomGeometries } from "./sandbox";

export interface ShowResult {
  warnings: string[];
  stats: BuildResult["stats"];
}

/** A canvas with a model in it: render loop, orbit controls, screenshots, GLB export. */
export class Stage {
  readonly renderer: THREE.WebGLRenderer;
  readonly scene = new THREE.Scene();
  readonly camera = new THREE.PerspectiveCamera(35, 1, 0.01, 200);
  readonly controls: OrbitControls;
  private result: BuildResult | null = null;
  private lights: THREE.Group | null = null;
  private ground: THREE.Mesh;
  private resizeObs: ResizeObserver;
  private raf = 0;
  private dirty = true;
  private disposed = false;
  private spec: Spec | null = null;

  constructor(private canvas: HTMLCanvasElement, opts: { autoRotate?: boolean } = {}) {
    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false, preserveDrawingBuffer: false });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFShadowMap;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.05;
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;

    this.controls = new OrbitControls(this.camera, canvas);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.08;
    const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    this.controls.autoRotate = !!opts.autoRotate && !reduce;
    this.controls.autoRotateSpeed = 0.8;
    this.controls.addEventListener("change", () => (this.dirty = true));
    // stop the idle spin once someone takes the wheel
    this.controls.addEventListener("start", () => (this.controls.autoRotate = false));

    this.ground = new THREE.Mesh(new THREE.CircleGeometry(1, 64), new THREE.ShadowMaterial({ opacity: 0.16 }));
    this.ground.rotation.x = -Math.PI / 2;
    this.ground.receiveShadow = true;
    this.ground.name = "__ground";
    this.scene.add(this.ground);

    this.resizeObs = new ResizeObserver(() => this.resize());
    this.resizeObs.observe(canvas);
    this.resize();
    this.loop();
  }

  private resize() {
    const { clientWidth: w, clientHeight: h } = this.canvas;
    if (!w || !h) return;
    this.renderer.setSize(w, h, false);
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
    this.dirty = true;
  }

  private loop = () => {
    if (this.disposed) return;
    this.raf = requestAnimationFrame(this.loop);
    const moving = this.controls.update();
    if (moving || this.dirty || this.controls.autoRotate) {
      this.renderer.render(this.scene, this.camera);
      this.dirty = false;
    }
  };

  /** Build and show a spec. Custom snippet parts run in the sandbox worker first. */
  async show(spec: Spec, opts: { style?: Style; keepView?: boolean } = {}): Promise<ShowResult> {
    const { geometries, errors } = await buildCustomGeometries(spec.customParts);
    if (this.disposed) return { warnings: [], stats: { meshes: 0, triangles: 0, parts: 0, mirrored: 0, custom: 0 } };
    const result = buildModel(spec, { style: opts.style, customGeometries: geometries });
    this.clearModel();
    this.result = result;
    this.spec = spec;
    this.scene.add(result.root);

    this.lights = buildLights(spec, result.bounds);
    this.scene.add(this.lights);
    this.scene.background = new THREE.Color(spec.background);

    const size = result.bounds.isEmpty() ? 2 : result.bounds.getSize(new THREE.Vector3()).length();
    this.ground.scale.setScalar(size * 1.4);

    if (!opts.keepView) this.resetView();
    this.dirty = true;
    return { warnings: [...errors.map((e) => `Custom part ${e}`), ...result.warnings], stats: result.stats };
  }

  resetView() {
    if (!this.result || !this.spec) return;
    const f = frameCamera(this.spec, this.result, this.camera.aspect);
    this.camera.fov = f.fov;
    this.camera.near = f.near;
    this.camera.far = f.far;
    this.camera.position.copy(f.position);
    this.camera.updateProjectionMatrix();
    this.controls.target.copy(f.target);
    this.controls.minDistance = f.near * 5;
    this.controls.maxDistance = f.far / 4;
    this.controls.update();
    this.dirty = true;
  }

  private clearModel() {
    if (this.result) {
      this.scene.remove(this.result.root);
      disposeObject(this.result.root);
      this.result = null;
    }
    if (this.lights) {
      this.scene.remove(this.lights);
      this.lights.traverse((o) => (o as THREE.DirectionalLight).shadow?.map?.dispose());
      this.lights = null;
    }
  }

  /**
   * Render from the spec camera (not the user's orbit) at a fixed square size.
   * This is what Claude sees in the compare-and-fix loop, so it must be stable.
   */
  snapshot(size = 768, type: "image/jpeg" | "image/png" = "image/jpeg", fromSpecCamera = true): string {
    const prev = { w: this.canvas.width, h: this.canvas.height, pr: this.renderer.getPixelRatio() };
    const cam = this.camera.clone();
    if (fromSpecCamera && this.result && this.spec) {
      const f = frameCamera(this.spec, this.result, 1);
      cam.fov = f.fov;
      cam.near = f.near;
      cam.far = f.far;
      cam.position.copy(f.position);
      cam.lookAt(f.target);
    }
    cam.aspect = 1;
    cam.updateProjectionMatrix();
    this.renderer.setPixelRatio(1);
    this.renderer.setSize(size, size, false);
    this.renderer.render(this.scene, cam);
    const url = this.canvas.toDataURL(type, 0.88);
    this.renderer.setPixelRatio(prev.pr);
    this.renderer.setSize(prev.w / prev.pr, prev.h / prev.pr, false);
    this.resize();
    this.renderer.render(this.scene, this.camera);
    return url;
  }

  /** GLB of the model only (no ground, no outline hulls), toon materials baked to PBR. */
  async exportGlb(): Promise<ArrayBuffer> {
    if (!this.result) throw new Error("Nothing to export");
    return exportGlb(this.result.root);
  }

  dispose() {
    this.disposed = true;
    cancelAnimationFrame(this.raf);
    this.resizeObs.disconnect();
    this.controls.dispose();
    this.clearModel();
    this.ground.geometry.dispose();
    (this.ground.material as THREE.Material).dispose();
    this.renderer.dispose();
  }
}

export async function exportGlb(root: THREE.Object3D): Promise<ArrayBuffer> {
  const copy = root.clone(true);
  const swapped: THREE.Material[] = [];
  copy.traverse((o) => {
    const m = o as THREE.Mesh;
    if (!m.isMesh) return;
    if (m.userData.outline) {
      m.visible = false;
      return;
    }
    const mat = m.material as THREE.Material & { color?: THREE.Color };
    if ((mat as THREE.MeshToonMaterial).isMeshToonMaterial) {
      const std = new THREE.MeshStandardMaterial({
        color: mat.color,
        roughness: 0.8,
        metalness: 0,
        transparent: mat.transparent,
        opacity: mat.opacity,
        emissive: (mat as THREE.MeshToonMaterial).emissive,
        name: mat.name,
      });
      swapped.push(std);
      m.material = std;
    }
  });
  const exporter = new GLTFExporter();
  const out = await exporter.parseAsync(copy, { binary: true, onlyVisible: true });
  swapped.forEach((m) => m.dispose());
  if (!(out instanceof ArrayBuffer)) throw new Error("GLB export failed");
  return out;
}
