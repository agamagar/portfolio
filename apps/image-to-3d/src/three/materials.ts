import * as THREE from "three";
import type { MaterialSpec, Style } from "../../shared/spec";

/** 3-band ramp for toon shading. NearestFilter keeps the bands crisp. */
let toonRamp: THREE.DataTexture | null = null;
export function getToonRamp(): THREE.DataTexture {
  if (toonRamp) return toonRamp;
  const data = new Uint8Array([90, 90, 90, 255, 175, 175, 175, 255, 255, 255, 255, 255]);
  toonRamp = new THREE.DataTexture(data, 3, 1, THREE.RGBAFormat);
  toonRamp.minFilter = THREE.NearestFilter;
  toonRamp.magFilter = THREE.NearestFilter;
  toonRamp.generateMipmaps = false;
  toonRamp.needsUpdate = true;
  return toonRamp;
}

/**
 * Tileable fibre-ish normal map for felt, generated from a seeded value noise
 * so renders (and tests) are deterministic.
 */
let feltNormal: THREE.DataTexture | null = null;
export function getFeltNormal(): THREE.DataTexture {
  if (feltNormal) return feltNormal;
  const size = 128;
  const h = new Float32Array(size * size);
  let seed = 1337;
  const rand = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
  for (let i = 0; i < h.length; i++) h[i] = rand();
  // two box blurs → soft fuzz
  for (let pass = 0; pass < 2; pass++) {
    const c = h.slice();
    for (let y = 0; y < size; y++)
      for (let x = 0; x < size; x++) {
        let s = 0;
        for (let dy = -1; dy <= 1; dy++)
          for (let dx = -1; dx <= 1; dx++) s += c[((y + dy + size) % size) * size + ((x + dx + size) % size)];
        h[y * size + x] = s / 9;
      }
  }
  const data = new Uint8Array(size * size * 4);
  for (let y = 0; y < size; y++)
    for (let x = 0; x < size; x++) {
      const i = y * size + x;
      const dx = h[y * size + ((x + 1) % size)] - h[y * size + ((x - 1 + size) % size)];
      const dy = h[((y + 1) % size) * size + x] - h[((y - 1 + size) % size) * size + x];
      const n = new THREE.Vector3(-dx * 6, -dy * 6, 1).normalize();
      data[i * 4] = (n.x * 0.5 + 0.5) * 255;
      data[i * 4 + 1] = (n.y * 0.5 + 0.5) * 255;
      data[i * 4 + 2] = (n.z * 0.5 + 0.5) * 255;
      data[i * 4 + 3] = 255;
    }
  feltNormal = new THREE.DataTexture(data, size, size, THREE.RGBAFormat);
  feltNormal.wrapS = feltNormal.wrapT = THREE.RepeatWrapping;
  feltNormal.repeat.set(3, 3);
  feltNormal.needsUpdate = true;
  return feltNormal;
}

export function makeMaterial(m: MaterialSpec, style: Style): THREE.Material {
  const color = new THREE.Color(m.color);
  const emissive = new THREE.Color(m.emissive);
  const transparent = m.opacity < 0.999;
  const common = { color, transparent, opacity: m.opacity, name: m.id };
  let mat: THREE.Material;
  switch (style) {
    case "toon":
      mat = new THREE.MeshToonMaterial({ ...common, gradientMap: getToonRamp(), emissive });
      break;
    case "low-poly":
      mat = new THREE.MeshStandardMaterial({
        ...common,
        roughness: Math.max(0.5, m.roughness),
        metalness: m.metalness * 0.5,
        emissive,
        flatShading: true,
      });
      break;
    case "felt":
      mat = new THREE.MeshPhysicalMaterial({
        ...common,
        roughness: 1,
        metalness: 0,
        sheen: 1,
        sheenRoughness: 0.55,
        sheenColor: color.clone().lerp(new THREE.Color("#ffffff"), 0.45),
        normalMap: getFeltNormal(),
        normalScale: new THREE.Vector2(0.45, 0.45),
        emissive,
      });
      break;
    case "clay":
    default:
      mat = new THREE.MeshStandardMaterial({
        ...common,
        roughness: Math.max(0.55, m.roughness),
        metalness: m.metalness * 0.3,
        emissive,
      });
  }
  mat.userData.specId = m.id;
  return mat;
}

/** Inverted-hull outline for toon style. Not exported to GLB. */
export function makeOutlineMaterial(base: THREE.Color, width = 0.012): THREE.MeshBasicMaterial {
  const mat = new THREE.MeshBasicMaterial({
    color: base.clone().multiplyScalar(0.18),
    side: THREE.BackSide,
  });
  mat.onBeforeCompile = (shader) => {
    shader.uniforms.outlineWidth = { value: width };
    shader.vertexShader = shader.vertexShader
      .replace("#include <common>", "#include <common>\nuniform float outlineWidth;")
      .replace("#include <begin_vertex>", "#include <begin_vertex>\ntransformed += normalize(normal) * outlineWidth;");
  };
  mat.userData.outline = true;
  return mat;
}
