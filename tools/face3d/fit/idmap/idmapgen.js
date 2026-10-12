// The id map for a rig fitted without one (noir): which part, and which of its two depth
// layers, the reference shows at each pixel (id = part * 2 + layer + 1, part = the index in
// fit.ids), rendered from the rig's fitted camera at rest at 802 x 862. Parts left out of
// `ids` (noir's hat) still hide what is behind them. Loaded in the fit harness by idmapgen.mjs.
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { MeshoptDecoder } from "three/examples/jsm/libs/meshopt_decoder.module.js";

// mode "depth": instead of ids, each pixel's distance from the camera at rest (view-space -z,
// over [DEPTH_NEAR, DEPTH_FAR] in 8 bits, 0.02 units a step; the far ear sits 0.5+ behind the
// cheek it hides behind, so that is plenty, and the file stays small): FaceSV tests a
// fragment against it once the head turns, so surface the reference never saw (the far ear,
// behind the face) is told from surface it did, which the id map alone can't when both are skin
export const DEPTH_NEAR = 4.5, DEPTH_FAR = 10;
export async function renderIdMap(glb, fitUrl, ids, props = [], mode = "ids") {
  const W = 802, H = 862;
  const fit = await (await fetch(fitUrl)).json();
  const gltf = await new GLTFLoader().setMeshoptDecoder(MeshoptDecoder).loadAsync(glb);
  const renderer = new THREE.WebGLRenderer({ antialias: false, preserveDrawingBuffer: true });
  renderer.setPixelRatio(1);
  renderer.setSize(W, H);
  const cam = new THREE.PerspectiveCamera(fit.camera.fov, W / H, 0.1, 50);
  cam.position.fromArray(fit.camera.position);
  cam.quaternion.fromArray(fit.camera.quaternion);
  const big = Math.max(W, H);
  cam.setViewOffset(W, H, fit.camera.shift[0] * big, -fit.camera.shift[1] * big, W, H);
  cam.updateProjectionMatrix();
  const scene = new THREE.Scene();
  const root = gltf.scene;
  root.position.y = 0; // FaceSV's head stack at rest is identity (root at NECK under a head at -NECK)
  scene.add(root);
  root.traverse((o) => {
    if (!o.isMesh) return;
    const name = o.name.startsWith("Lid") ? "Skin" : o.name;
    const part = ids.indexOf(name);
    const layered = ["Skin", "Hair", "LidL", "LidR"].includes(o.name);
    // props and lids are not drawn at rest (FaceSV hides lids until a blink; the lip shows)
    if (o.name.startsWith("Lid") || o.name === "MouthInner") { o.visible = false; return; }
    // props show only on the skins that wear them (props: the ones this rig's skin wears)
    if (["Hat", "HatBand", "Pin"].includes(o.name) && !props.includes(o.name)) { o.visible = false; return; }
    if (mode === "depth") {
      o.material = new THREE.ShaderMaterial({
        vertexShader: `#include <common>
          #include <morphtarget_pars_vertex>
          varying float vZ; void main(){
          #include <begin_vertex>
          #include <morphtarget_vertex>
          vec4 mv = modelViewMatrix * vec4(transformed, 1.0); vZ = -mv.z; gl_Position = projectionMatrix * mv; }`,
        fragmentShader: `varying float vZ; void main(){
          gl_FragColor = vec4(clamp((vZ - ${DEPTH_NEAR.toFixed(2)}) / ${(DEPTH_FAR - DEPTH_NEAR).toFixed(2)}, 0.0, 1.0), 0.0, 0.0, 1.0); }`,
      });
      return;
    }
    o.material = new THREE.ShaderMaterial({
      uniforms: { uPart: { value: part }, uLayered: { value: layered ? 1 : 0 } },
      vertexShader: `#include <common>
        #include <morphtarget_pars_vertex>
        varying vec2 vUv; void main(){ vUv = uv;
        #include <begin_vertex>
        #include <morphtarget_vertex>
        gl_Position = projectionMatrix * modelViewMatrix * vec4(transformed, 1.0); }`,
      fragmentShader: `uniform float uPart, uLayered; varying vec2 vUv; void main(){
        float id = uPart < 0.0 ? 0.0 : uPart * 2.0 + (uLayered > 0.5 ? step(0.5, vUv.x) : 0.0) + 1.0;
        gl_FragColor = vec4(id / 255.0, 0.0, 0.0, 1.0); }`,
    });
  });
  renderer.setClearColor(mode === "depth" ? 0xffffff : 0x000000, 1); // depth: empty = farthest
  renderer.render(scene, cam);
  const gl = renderer.getContext();
  const px = new Uint8Array(W * H * 4);
  gl.readPixels(0, 0, W, H, gl.RGBA, gl.UNSIGNED_BYTE, px);
  const ch = 1;
  const out = new Uint8Array(W * H * ch);
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) for (let c = 0; c < ch; c++) out[(y * W + x) * ch + c] = px[((H - 1 - y) * W + x) * 4 + c]; // top row first
  renderer.dispose();
  return Array.from(out);
}
