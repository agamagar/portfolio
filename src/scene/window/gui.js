// The dev tuning panel, behind ?gui=1: lil-gui (three's copy), one folder per
// params section, plus the look switch, the camera progress sliders and the debug
// view. Loaded lazily so it never lands in the scene chunk for visitors.
//
// Numbers get a range from their magnitude; colours ("#rrggbb") a picker; nested
// objects a sub-folder. A change to dims, room or outside rebuilds the geometry;
// everything else is read by the engine every frame.

const ENUMS = {
  "renderer.toneMapping": ["agx", "neutral", "aces", "none"],
  "debug.view": ["beauty", "normal", "ao", "emissive", "velocity", "depth"],
  "sky.moon.mode": ["true", "placed"],
  quality: ["high", "mid", "low"],
  "calm.shape": ["band", "boxes"],
  "calm.themes.dark.dir": ["down", "up", "both"],
  "calm.themes.light.dir": ["down", "up", "both"],
  "renderer.compile": ["none", "canvas", "pass"],
};

function rangeFor(path, v) {
  if (/angleDeg|tiltDeg|tiltDirDeg|yaw|pitch|roll|fov|ajarDeg|rockDeg|az$|alt$/.test(path)) return [-180, 180, 0.1];
  if (/exposure|gain|intensity|strength|bulb|white|handoffLight|glow/.test(path)) return [0, Math.max(4, v * 4), 0.001];
  if (Math.abs(v) <= 1) return [Math.min(0, v * 2), 1, 0.001];
  const m = Math.pow(10, Math.ceil(Math.log10(Math.abs(v) + 1e-9)));
  return [v < 0 ? -m * 2 : 0, m * 2, m / 1000];
}

export async function createGui(engine, { onChange } = {}) {
  const { GUI } = await import("three/examples/jsm/libs/lil-gui.module.min.js");
  const P = engine.params;
  const gui = new GUI({ title: "window scene" });
  gui.domElement.style.zIndex = 60;

  const changed = (path) => {
    // a new tier re-layers the params and rebuilds (engine.setParams)
    if (path === "quality") {
      engine.setParams({ quality: P.quality }).then(() => gui.controllersRecursive().forEach((c) => c.updateDisplay()));
      return;
    }
    const geometry = /^(dims|room|outside)\b/.test(path);
    if (geometry) engine.rebuild();
    if (/^sky\.(plate|view|radius)\b/.test(path)) engine.rebuildSky();
    if (path === "debug.view") engine.setView(P.debug.view);
    onChange?.(path);
    if (!engine.running) engine.renderOnce();
  };

  const now = engine.stats();
  const ctl = {
    look: engine.look,
    p: now.p ?? 0,
    p2: now.p2 ?? 0,
    pinCamera: false,
    snapshot() {
      console.log(JSON.stringify(P, null, 2));
    },
  };
  const top = gui.addFolder("look and camera");
  top.add(ctl, "look", engine.looks).onChange((v) => engine.setLook(v).then(() => gui.controllersRecursive().forEach((c) => c.updateDisplay())));
  const pin = () => (ctl.pinCamera ? engine.pinProgress(ctl.p, ctl.p2) : engine.pinProgress(null, null));
  top.add(ctl, "pinCamera").name("pin p (else scroll)").onChange(pin);
  top.add(ctl, "p", 0, 1, 0.001).onChange(() => {
    ctl.pinCamera = true;
    pin();
    gui.controllersRecursive().forEach((c) => c.updateDisplay());
  });
  top.add(ctl, "p2", 0, 1, 0.001).onChange(() => {
    ctl.pinCamera = true;
    pin();
    gui.controllersRecursive().forEach((c) => c.updateDisplay());
  });
  top.add(ctl, "snapshot").name("log params (JSON)");

  const addObject = (folder, obj, prefix) => {
    for (const key of Object.keys(obj)) {
      const v = obj[key];
      const path = prefix ? `${prefix}.${key}` : key;
      if (v && typeof v === "object" && !Array.isArray(v)) {
        addObject(folder.addFolder(key).close(), v, path);
      } else if (Array.isArray(v)) {
        if (v.every((x) => typeof x === "number")) {
          const sub = folder.addFolder(`${key} [${v.length}]`).close();
          v.forEach((_, i) => {
            const [lo, hi, st] = rangeFor(path, v[i]);
            sub.add(v, String(i), lo, hi, st).onChange(() => changed(path));
          });
        }
      } else if (ENUMS[path]) {
        folder.add(obj, key, ENUMS[path]).onChange(() => changed(path));
      } else if (typeof v === "boolean") {
        folder.add(obj, key).onChange(() => changed(path));
      } else if (typeof v === "number") {
        const [lo, hi, st] = rangeFor(path, v);
        folder.add(obj, key, lo, hi, st).onFinishChange(() => changed(path)).onChange(() => !/^(dims|room|outside|sky\.(plate|view|radius))\b/.test(path) && changed(path));
      } else if (typeof v === "string" && /^#[0-9a-f]{6}$/i.test(v)) {
        folder.addColor(obj, key).onChange(() => changed(path));
      } else if (typeof v === "string") {
        folder.add(obj, key).onFinishChange(() => changed(path));
      }
    }
  };
  for (const section of Object.keys(P)) {
    if (P[section] === null || typeof P[section] !== "object") {
      if (ENUMS[section]) top.add(P, section, ENUMS[section]).onChange(() => changed(section));
      continue;
    }
    const f = gui.addFolder(section).close();
    addObject(f, P[section], section);
  }
  return gui;
}
