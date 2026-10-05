// Minimal reference implementation of the capture contract in spec/30-locked-brief.md:
// window.__windowScene = { ready, version, params, setParams, renderFrames, seek, stats }.
// It draws a stand-in window (two panes of sky, a dark frame, one grille bar, a warm lamp
// glow) so a render is recognisably non-black. URL params used: backend=webgl2, capture=1, t.
import * as THREE from "three/webgpu";

const q = new URLSearchParams(location.search);
const capture = q.get("capture") === "1";
const forceWebGL = q.get("backend") === "webgl2";
let t = q.has("t") ? Number(q.get("t")) : 0;
let frameMs = 0;
// r186's internal Animation loop calls renderer.info.reset() on every rAF (Animation.js:81),
// so counters read later are zero. Snapshot them right after each render instead.
let last = { drawCalls: 0, triangles: 0 };

const params = {
  sky: { top: "#8fb8d8", bottom: "#f4e6c2" },
  frame: { color: "#524336" },
  lamp: { color: "#ffbe6c", intensity: 6 },
  wind: { sway: 0.02 },
};

const renderer = new THREE.WebGPURenderer({ antialias: true, forceWebGL });
renderer.setPixelRatio(devicePixelRatio);
renderer.setSize(innerWidth, innerHeight);
renderer.toneMapping = THREE.AgXToneMapping;
document.body.appendChild(renderer.domElement);

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x1d1d1b);
const camera = new THREE.PerspectiveCamera(56.8, innerWidth / innerHeight, 0.01, 20);
camera.position.set(-0.05, 0.3, 0.9);
camera.lookAt(0, 0.3, 0);

// Sky panes: a vertical gradient via vertex colours.
function pane(x) {
  const g = new THREE.PlaneGeometry(0.1, 0.6, 1, 8);
  const top = new THREE.Color(params.sky.top), bot = new THREE.Color(params.sky.bottom);
  const cols = [];
  const pos = g.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    const k = (pos.getY(i) + 0.3) / 0.6;
    const c = bot.clone().lerp(top, k);
    cols.push(c.r, c.g, c.b);
  }
  g.setAttribute("color", new THREE.Float32BufferAttribute(cols, 3));
  const m = new THREE.Mesh(g, new THREE.MeshBasicNodeMaterial({ vertexColors: true }));
  m.position.set(x, 0.33, -0.01);
  return m;
}
const panes = [pane(-0.07), pane(0.07)];
panes.forEach((p) => scene.add(p));

const wood = new THREE.MeshStandardNodeMaterial({ color: params.frame.color, roughness: 0.3 });
const frameGroup = new THREE.Group();
for (const [w, h, x, y] of [[0.36, 0.04, 0, 0.02], [0.36, 0.04, 0, 0.65], [0.04, 0.67, -0.16, 0.335], [0.04, 0.67, 0.16, 0.335], [0.04, 0.67, 0, 0.335]]) {
  const b = new THREE.Mesh(new THREE.BoxGeometry(w, h, 0.03), wood);
  b.position.set(x, y, 0);
  frameGroup.add(b);
}
scene.add(frameGroup);
const bar = new THREE.Mesh(new THREE.BoxGeometry(0.009, 0.7, 0.009), new THREE.MeshStandardNodeMaterial({ color: 0x1b1714, roughness: 0.4 }));
bar.position.set(-0.05, 0.33, 0.07);
scene.add(bar);

scene.add(new THREE.HemisphereLight(0xbad9eb, 0x21150a, 0.6));
const lamp = new THREE.PointLight(params.lamp.color, params.lamp.intensity, 0, 2);
lamp.position.set(0.14, 0.08, 0.1);
scene.add(lamp);

function draw() {
  const t0 = performance.now();
  bar.rotation.z = Math.sin(t * 1.3) * params.wind.sway;
  lamp.color.set(params.lamp.color);
  lamp.intensity = params.lamp.intensity;
  wood.color.set(params.frame.color);
  renderer.render(scene, camera);
  frameMs = performance.now() - t0;
  last = { drawCalls: renderer.info.render.drawCalls, triangles: renderer.info.render.triangles };
}
const nextFrame = () => new Promise((r) => requestAnimationFrame(() => r()));

const ready = (async () => {
  await renderer.init();
  await renderer.compileAsync(scene, camera);
  draw();
  await nextFrame();
})();

function merge(dst, src) {
  for (const [k, v] of Object.entries(src)) {
    if (v && typeof v === "object" && !Array.isArray(v)) merge(dst[k] ??= {}, v);
    else dst[k] = v;
  }
}

window.__windowScene = {
  ready,
  version: "stub-1",
  params,
  async setParams(patch) { merge(params, patch); draw(); await nextFrame(); },
  renderFrames(n) {
    return new Promise((res) => {
      let i = 0;
      const step = () => { draw(); if (++i >= n) requestAnimationFrame(() => res()); else requestAnimationFrame(step); };
      requestAnimationFrame(step);
    });
  },
  seek(s) { t = s; },
  stats() {
    return { backend: renderer.backend.isWebGPUBackend ? "webgpu" : "webgl2", drawCalls: last.drawCalls, triangles: last.triangles, frameMs: +frameMs.toFixed(3) };
  },
};

window.addEventListener("resize", () => { renderer.setSize(innerWidth, innerHeight); camera.aspect = innerWidth / innerHeight; camera.updateProjectionMatrix(); draw(); });
if (!capture) ready.then(() => renderer.setAnimationLoop((ms) => { t = ms / 1000; draw(); }));
