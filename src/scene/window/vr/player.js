// The viewer's three.js side: a plain WebGLRenderer on its own canvas (the room's
// WebGPU one is left alone), the camera at the centre of an equirectangular sphere
// (360), a half-sphere (180) or in front of a flat screen. Drag, arrow keys or the
// phone's gyro look around; the wheel and pinch zoom. Everything created here is
// released in dispose().
import * as THREE from "three";

const D2R = Math.PI / 180;

export function createPlayer(canvas) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false, powerPreference: "high-performance" });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.setClearColor(0x000000, 1);
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(75, 1, 0.1, 2000);
  camera.rotation.order = "YXZ";

  const mat = new THREE.MeshBasicMaterial({ color: 0xffffff, side: THREE.FrontSide, toneMapped: false });
  const geo = {};
  const sphere = new THREE.Mesh(new THREE.BufferGeometry(), mat);
  scene.add(sphere);

  // yaw 0 = straight ahead (-z). 360: u = 0.5 is dead ahead; 180: the whole frame is the
  // front hemisphere. Both are mirrored so the inside reads the right way round.
  function geometryFor(mode) {
    if (geo[mode]) return geo[mode];
    let g;
    if (mode === "180") {
      g = new THREE.SphereGeometry(500, 64, 48, 0, Math.PI);
      g.rotateY(Math.PI);
    } else if (mode === "360") {
      g = new THREE.SphereGeometry(500, 80, 56);
      g.rotateY(Math.PI / 2);
    } else g = new THREE.PlaneGeometry(1, 1);
    if (mode !== "flat") g.scale(-1, 1, 1);
    geo[mode] = g;
    return g;
  }

  let mode = "360", source = null, layout = "mono", mono = true;
  const view = { lon: 0, lat: 0, vlon: 0, vlat: 0, fov: 75, drag: false };
  let gyro = null; // { q0 } while the phone's orientation drives the view
  const gyroQ = new THREE.Quaternion(), screenQ = new THREE.Quaternion(), qa = new THREE.Quaternion();
  const euler = new THREE.Euler(), zee = new THREE.Vector3(0, 0, 1);
  const q1 = new THREE.Quaternion(-Math.sqrt(0.5), 0, 0, Math.sqrt(0.5));

  function applyCrop() {
    const tex = source?.texture;
    if (!tex) return;
    const crop = mono && layout !== "mono";
    tex.repeat.set(crop && layout === "sbs" ? 0.5 : 1, crop && layout === "tb" ? 0.5 : 1);
    tex.offset.set(0, crop && layout === "tb" ? 0.5 : 0);
    tex.wrapS = tex.wrapT = THREE.ClampToEdgeWrapping;
  }
  function layoutFlat() {
    if (mode !== "flat" || !source) return;
    let [w, h] = source.size;
    if (mono && layout === "sbs") w /= 2;
    if (mono && layout === "tb") h /= 2;
    const aspect = w / Math.max(1, h);
    sphere.scale.set(aspect * 1.6, 1.6, 1);
    sphere.position.set(0, 0, -2.2);
    sphere.rotation.set(0, 0, 0);
  }

  function setMode(m) {
    mode = m;
    sphere.geometry = geometryFor(m);
    if (m === "flat") {
      layoutFlat();
      view.fov = 60;
    } else {
      sphere.scale.set(1, 1, 1);
      sphere.position.set(0, 0, 0);
      view.fov = 75;
    }
    view.lon = view.lat = view.vlon = view.vlat = 0;
  }
  function setSource(s, stereo) {
    source = s;
    layout = stereo || "mono";
    mat.map = s?.texture || null;
    mat.needsUpdate = true;
    applyCrop();
    layoutFlat();
  }
  function setStereoMono(on) {
    mono = on;
    applyCrop();
    layoutFlat();
  }

  function resize() {
    const w = canvas.clientWidth || 1, h = canvas.clientHeight || 1;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }

  // ---- looking around ----
  let px = 0, py = 0;
  const lim = () => (mode === "flat" ? 12 : mode === "180" ? 80 : 85);
  function pointerDown(e) {
    view.drag = true;
    px = e.clientX;
    py = e.clientY;
    view.vlon = view.vlat = 0;
    canvas.setPointerCapture?.(e.pointerId);
  }
  function pointerMove(e) {
    if (!view.drag) return;
    const k = view.fov / (canvas.clientHeight || 600);
    const dx = (e.clientX - px) * k, dy = (e.clientY - py) * k;
    px = e.clientX;
    py = e.clientY;
    view.lon -= dx;
    view.lat += dy;
    view.vlon = -dx * 60;
    view.vlat = dy * 60;
  }
  function pointerUp() {
    view.drag = false;
  }
  function wheel(e) {
    e.preventDefault();
    view.fov = Math.max(30, Math.min(100, view.fov + e.deltaY * 0.05));
  }
  canvas.addEventListener("pointerdown", pointerDown);
  canvas.addEventListener("pointermove", pointerMove);
  canvas.addEventListener("pointerup", pointerUp);
  canvas.addEventListener("pointercancel", pointerUp);
  canvas.addEventListener("wheel", wheel, { passive: false });

  function nudge(dlon, dlat) {
    view.lon += dlon;
    view.lat += dlat;
  }

  // gyro: DeviceOrientation -> a quaternion (three's classic DeviceOrientationControls
  // maths), relative to where the phone pointed when it was switched on
  let orient = null;
  const onOrient = (e) => (orient = e);
  async function setGyro(on) {
    if (!on) {
      window.removeEventListener("deviceorientation", onOrient);
      gyro = null;
      return true;
    }
    try {
      if (typeof DeviceOrientationEvent !== "undefined" && DeviceOrientationEvent.requestPermission) {
        if ((await DeviceOrientationEvent.requestPermission()) !== "granted") return false;
      }
    } catch {
      return false;
    }
    window.addEventListener("deviceorientation", onOrient);
    gyro = { q0: null };
    return true;
  }
  function gyroQuat() {
    if (!orient || orient.alpha == null) return null;
    const a = (orient.alpha || 0) * D2R, b = (orient.beta || 0) * D2R, g = (orient.gamma || 0) * D2R;
    const o = (screen.orientation?.angle || 0) * D2R;
    euler.set(b, a, -g, "YXZ");
    gyroQ.setFromEuler(euler).multiply(q1).multiply(screenQ.setFromAxisAngle(zee, -o));
    return gyroQ;
  }

  let raf = 0, lastT = 0;
  function frame(now) {
    raf = requestAnimationFrame(frame);
    const dt = Math.min(0.05, (now - lastT) / 1000 || 0.016);
    lastT = now;
    if (!view.drag) {
      view.lon += view.vlon * dt;
      view.lat += view.vlat * dt;
      const d = Math.exp(-dt * 4);
      view.vlon *= d;
      view.vlat *= d;
    }
    view.lat = Math.max(-lim(), Math.min(lim(), view.lat));
    if (mode === "flat") view.lon = Math.max(-lim() * 1.5, Math.min(lim() * 1.5, view.lon));
    if (mode === "180") view.lon = Math.max(-80, Math.min(80, view.lon));
    camera.fov += (view.fov - camera.fov) * Math.min(1, dt * 10);
    camera.updateProjectionMatrix();
    camera.rotation.set(view.lat * D2R, -view.lon * D2R, 0, "YXZ");
    const gq = gyro && gyroQuat();
    if (gq) {
      if (!gyro.q0) gyro.q0 = gq.clone().invert();
      qa.copy(gyro.q0).multiply(gq); // phone motion since it was switched on
      camera.quaternion.multiply(qa);
    }
    renderer.render(scene, camera);
  }
  resize();
  raf = requestAnimationFrame(frame);

  return {
    setMode, setSource, setStereoMono, resize, nudge, setGyro,
    get canGyro() { return typeof DeviceOrientationEvent !== "undefined" && window.matchMedia?.("(pointer: coarse)").matches; },
    refreshFlat: layoutFlat,
    dispose() {
      cancelAnimationFrame(raf);
      canvas.removeEventListener("pointerdown", pointerDown);
      canvas.removeEventListener("pointermove", pointerMove);
      canvas.removeEventListener("pointerup", pointerUp);
      canvas.removeEventListener("pointercancel", pointerUp);
      canvas.removeEventListener("wheel", wheel);
      window.removeEventListener("deviceorientation", onOrient);
      for (const g of Object.values(geo)) g.dispose();
      sphere.geometry = new THREE.BufferGeometry();
      mat.map = null;
      mat.dispose();
      renderer.dispose();
      renderer.forceContextLoss();
    },
  };
}
