// <Face3D>: the face as real 3D (Agam, 2026-10-08: SVG lighting looked "very bad";
// three.js chosen). First skin: clay.
//
// GEOMETRY, from the one 2D rig (faceRig.js): every part is drawn into an offscreen
// mask, a distance transform gives each pixel its distance to the part's edge, and a
// grid mesh is lifted by a rounded profile of that distance: a pillow that domes from
// its outline, like a piece of clay pressed into shape. Skin, hair, nose, ear curl,
// brows and mouth are separate pieces (so they crease where they meet, as clay does);
// the eyes are spheres. The features sit on the skin's own height field.
//
// MOTION: the root squashes, springs and lands on a switch; emotes move the pieces
// (eyes scale, brows lift, mouth widens, head tilts). Reduced motion: no motion.

import { forwardRef, useEffect, useImperativeHandle, useRef } from "react";
import * as THREE from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import { PATHS, HAIR_CLIP, EYES } from "./faceRig";

// the drawing's frame (SVG units, y down) and the mask resolution
const X0 = 40, Y0 = 26, WU = 136, HU = 160, PX = 4; // 4 px per unit
const MW = WU * PX, MH = HU * PX;
const CX = 108, CY = 108; // the head's centre, the scene origin
const STEP = 2; // mesh grid step in mask px (0.5 unit)

const toWorld = (u, v, z) => new THREE.Vector3((u - CX) / 50, -(v - CY) / 50, z / 50);

// a mask canvas with one part drawn into it
function mask(draw) {
  const c = document.createElement("canvas");
  c.width = MW;
  c.height = MH;
  const g = c.getContext("2d");
  g.setTransform(PX, 0, 0, PX, -X0 * PX, -Y0 * PX);
  g.fillStyle = g.strokeStyle = "#fff";
  g.lineCap = "round";
  draw(g);
  const d = g.getImageData(0, 0, MW, MH).data;
  const m = new Uint8Array(MW * MH);
  for (let i = 0; i < m.length; i++) m[i] = d[i * 4 + 3] > 127 ? 1 : 0;
  return m;
}

// exact Euclidean distance (to the nearest outside pixel), Felzenszwalb 1D passes
function edt(m) {
  const INF = 1e9, f = new Float32Array(Math.max(MW, MH)), D = new Float32Array(MW * MH);
  for (let i = 0; i < m.length; i++) D[i] = m[i] ? INF : 0;
  const pass = (get, set, n) => {
    for (let q = 0; q < n; q++) f[q] = get(q);
    const v = new Int32Array(n), z = new Float32Array(n + 1);
    let k = 0;
    v[0] = 0; z[0] = -INF; z[1] = INF;
    for (let q = 1; q < n; q++) {
      let s;
      while (true) {
        s = (f[q] + q * q - (f[v[k]] + v[k] * v[k])) / (2 * q - 2 * v[k]);
        if (s <= z[k]) k--;
        else break;
      }
      k++; v[k] = q; z[k] = s; z[k + 1] = INF;
    }
    k = 0;
    for (let q = 0; q < n; q++) {
      while (z[k + 1] < q) k++;
      set(q, (q - v[k]) * (q - v[k]) + f[v[k]]);
    }
  };
  for (let x = 0; x < MW; x++) pass((y) => D[y * MW + x], (y, val) => (D[y * MW + x] = val), MH);
  for (let y = 0; y < MH; y++) pass((x) => D[y * MW + x], (x, val) => (D[y * MW + x] = val), MW);
  for (let i = 0; i < D.length; i++) D[i] = Math.sqrt(D[i]) / PX; // in drawing units
  return D;
}

// lift a mask into a pillow: height = H * round profile of (distance / R), on a base
// height field (so features sit on the skin)
// separable box blur, a few passes (about a gaussian): takes the creases off the
// distance field's ridges (its medial axis), which lit as sunburst streaks
function blur(h, r, passes = 3) {
  const t = new Float32Array(h.length);
  for (let p = 0; p < passes; p++) {
    for (let y = 0; y < MH; y++) {
      let acc = 0;
      for (let x = -r; x <= r; x++) acc += h[y * MW + Math.min(MW - 1, Math.max(0, x))];
      for (let x = 0; x < MW; x++) {
        t[y * MW + x] = acc / (2 * r + 1);
        acc += h[y * MW + Math.min(MW - 1, x + r + 1)] - h[y * MW + Math.max(0, x - r)];
      }
    }
    for (let x = 0; x < MW; x++) {
      let acc = 0;
      for (let y = -r; y <= r; y++) acc += t[Math.min(MH - 1, Math.max(0, y)) * MW + x];
      for (let y = 0; y < MH; y++) {
        h[y * MW + x] = acc / (2 * r + 1);
        acc += t[Math.min(MH - 1, y + r + 1) * MW + x] - t[Math.max(0, y - r) * MW + x];
      }
    }
  }
  return h;
}

function inflate(m, { H, R, base = null, flat = 0, smooth = 0, step = STEP }) {
  const D = edt(m);
  let height = new Float32Array(MW * MH);
  for (let i = 0; i < D.length; i++) {
    if (!m[i]) continue;
    const t = Math.min(D[i] / R, 1);
    const round = Math.sqrt(1 - (1 - t) * (1 - t)); // a quarter circle off the edge
    height[i] = H * (round + flat * t);
  }
  if (smooth) {
    height = blur(height, smooth);
    for (let i = 0; i < height.length; i++) if (!m[i]) height[i] = 0;
  }
  if (base) for (let i = 0; i < height.length; i++) if (m[i]) height[i] += base[i];
  const STEP = step;
  const cols = Math.floor(MW / STEP), rows = Math.floor(MH / STEP);
  const idx = new Int32Array(cols * rows).fill(-1);
  const pos = [];
  let n = 0;
  for (let r = 0; r < rows; r++)
    for (let c = 0; c < cols; c++) {
      const i = r * STEP * MW + c * STEP;
      if (!m[i]) continue;
      const p = toWorld(X0 + (c * STEP) / PX, Y0 + (r * STEP) / PX, height[i]);
      pos.push(p.x, p.y, p.z);
      idx[r * cols + c] = n++;
    }
  const tri = [];
  for (let r = 0; r < rows - 1; r++)
    for (let c = 0; c < cols - 1; c++) {
      const a = idx[r * cols + c], b = idx[r * cols + c + 1], d = idx[(r + 1) * cols + c], e = idx[(r + 1) * cols + c + 1];
      if (a >= 0 && d >= 0 && b >= 0) tri.push(a, d, b);
      if (b >= 0 && d >= 0 && e >= 0) tri.push(b, d, e);
    }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  geo.setIndex(tri);
  geo.computeVertexNormals();
  return { geo, height };
}

// a fine fingerprint/lumpy normal map for the clay
function clayNormalMap(seed = 1, scale = 1) {
  const S = 256, c = document.createElement("canvas");
  c.width = c.height = S;
  const g = c.getContext("2d");
  const h = new Float32Array(S * S);
  let s = seed;
  const rnd = () => ((s = (s * 16807) % 2147483647) / 2147483647);
  // a few octaves of blurred value noise
  for (const [cells, amp] of [[8, 1], [24, 0.5], [64, 0.25]]) {
    const grid = Array.from({ length: (cells + 1) * (cells + 1) }, rnd);
    for (let y = 0; y < S; y++)
      for (let x = 0; x < S; x++) {
        const fx = (x / S) * cells, fy = (y / S) * cells, ix = Math.floor(fx), iy = Math.floor(fy), tx = fx - ix, ty = fy - iy;
        const at = (i, j) => grid[((j % cells) * (cells + 1)) + (i % cells)];
        const sx = tx * tx * (3 - 2 * tx), sy = ty * ty * (3 - 2 * ty);
        h[y * S + x] += amp * ((at(ix, iy) * (1 - sx) + at(ix + 1, iy) * sx) * (1 - sy) + (at(ix, iy + 1) * (1 - sx) + at(ix + 1, iy + 1) * sx) * sy);
      }
  }
  const img = g.createImageData(S, S);
  for (let y = 0; y < S; y++)
    for (let x = 0; x < S; x++) {
      const dx = (h[y * S + ((x + 1) % S)] - h[y * S + ((x + S - 1) % S)]) * scale;
      const dy = (h[((y + 1) % S) * S + x] - h[((y + S - 1) % S) * S + x]) * scale;
      const nz = 1 / Math.sqrt(dx * dx + dy * dy + 1);
      const i = (y * S + x) * 4;
      img.data[i] = (-dx * nz * 0.5 + 0.5) * 255;
      img.data[i + 1] = (-dy * nz * 0.5 + 0.5) * 255;
      img.data[i + 2] = nz * 255;
      img.data[i + 3] = 255;
    }
  g.putImageData(img, 0, 0);
  const t = new THREE.CanvasTexture(c);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  return t;
}

export const CLAY = {
  bg: "#e9e8e6",
  skin: "#f7c9ad",
  shade: "#e3a98c",
  hair: "#5a2f1f",
  dark: "#2a1812",
  mouth: "#6e3326",
};

function buildFace(P) {
  const p2 = (d) => new Path2D(d);
  // skin: the head and the ear, minus the hair
  const hairPath = (g) => {
    g.save();
    g.clip(p2(HAIR_CLIP));
    g.fill(p2(PATHS.hair), "evenodd");
    g.restore();
  };
  const hairM = mask(hairPath);
  const skinM = mask((g) => {
    g.fill(p2(PATHS.silhouette));
    g.fill(p2(PATHS.ear));
  });
  const skin = inflate(skinM, { H: 34, R: 60, flat: 0, smooth: 10, step: 1 });
  // the hair: a thick lump laid ON the head (its base is the skin's own surface)
  const hair = inflate(hairM, { H: 14, R: 16, flat: 0.2, smooth: 4, base: skin.height, step: 1 });
  const stroke = (d, w) => mask((g) => { g.lineWidth = w; g.stroke(p2(d)); });
  const nose = inflate(stroke(PATHS.nose, 11), { H: 9, R: 5.5, base: skin.height, smooth: 2, step: 1 });
  const curl = inflate(stroke(PATHS.earCurl, 3.6), { H: 1.6, R: 1.8, base: skin.height, step: 1 });
  const browL = inflate(stroke(PATHS.browL, 4.6), { H: 2.2, R: 2.3, base: skin.height, step: 1 });
  const browR = inflate(stroke(PATHS.browR, 4.6), { H: 2.2, R: 2.3, base: skin.height, step: 1 });
  const mouth = inflate(stroke(PATHS.mouth, 3.8), { H: 1.8, R: 1.9, base: skin.height, step: 1 });
  const at = (u, v) => skin.height[Math.round((v - Y0) * PX) * MW + Math.round((u - X0) * PX)] || 0;
  return { skin, hair, nose, curl, browL, browR, mouth, eyeZ: EYES.map((e) => at(e.cx, e.cy)) };
}

const reduce = () => typeof window !== "undefined" && !!window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

const Face3D = forwardRef(function Face3D({ size = 360, skin = CLAY, interactive = true }, ref) {
  const host = useRef(null);
  const api = useRef(null);
  useImperativeHandle(ref, () => ({ emote: (n) => api.current?.emote(n), bounce: () => api.current?.bounce() }), []);

  useEffect(() => {
    const el = host.current;
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(2, window.devicePixelRatio || 1));
    renderer.setSize(size * 1.3, size * 1.1);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.05;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFShadowMap;
    el.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const pmrem = new THREE.PMREMGenerator(renderer);
    scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    scene.environmentIntensity = 0.55;
    const cam = new THREE.PerspectiveCamera(26, 1.3 / 1.1, 0.1, 50);
    cam.position.set(0, 0.05, 7.4);

    // a big soft key from the upper left, a cool fill, a warm rim
    const key = new THREE.DirectionalLight("#fff6ee", 2.6);
    key.position.set(-2.4, 5.2, 4.2);
    key.castShadow = true;
    key.shadow.mapSize.set(2048, 2048);
    key.shadow.radius = 6;
    key.shadow.bias = -0.0004;
    Object.assign(key.shadow.camera, { left: -6, right: 6, top: 6, bottom: -6, near: 0.5, far: 30 });
    scene.add(key);
    scene.add(new THREE.HemisphereLight("#f4f1ec", "#b9a597", 0.6));
    const rim = new THREE.DirectionalLight("#ffd9c2", 0.9);
    rim.position.set(3.5, 1.5, -2);
    scene.add(rim);

    // the floor that catches the soft contact shadow
    const floor = new THREE.Mesh(new THREE.PlaneGeometry(10, 10), new THREE.ShadowMaterial({ opacity: 0.18 }));
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = -1.42;
    floor.receiveShadow = true;
    scene.add(floor);

    const F = buildFace();
    const nrm = clayNormalMap(3, 6);
    nrm.repeat.set(3, 3);
    const clay = (color, o = {}) =>
      new THREE.MeshPhysicalMaterial({ color, roughness: 0.62, metalness: 0, sheen: 0.35, sheenRoughness: 0.7, sheenColor: new THREE.Color("#fff3ea"), normalMap: nrm, normalScale: new THREE.Vector2(0.12, 0.12), side: THREE.DoubleSide, ...o });
    const M = {
      skin: clay(skin.skin),
      hair: clay(skin.hair, { roughness: 0.38, clearcoat: 0.35, clearcoatRoughness: 0.35, normalScale: new THREE.Vector2(0.18, 0.18) }),
      shade: clay(skin.shade),
      dark: clay(skin.dark, { roughness: 0.3, clearcoat: 0.6 }),
      mouth: clay(skin.mouth, { roughness: 0.45 }),
    };

    // body (squash/stretch about the chin) > head (tilts) > pieces
    const body = new THREE.Group();
    body.position.y = -1.42;
    scene.add(body);
    const head = new THREE.Group();
    head.position.y = 1.42;
    body.add(head);
    const mesh = (geo, mat) => {
      const m = new THREE.Mesh(geo, mat);
      m.castShadow = m.receiveShadow = true;
      head.add(m);
      return m;
    };
    mesh(F.skin.geo, M.skin);
    mesh(F.hair.geo, M.hair);
    mesh(F.nose.geo, M.skin);
    mesh(F.curl.geo, M.shade);
    // the moving features get their own pivots at their centres
    const pivot = (geo, mat) => {
      geo.computeBoundingBox();
      const c = geo.boundingBox.getCenter(new THREE.Vector3());
      geo.translate(-c.x, -c.y, -c.z);
      const m = mesh(geo, mat);
      m.position.copy(c);
      m.userData.rest = c.clone();
      return m;
    };
    const parts = {
      browL: pivot(F.browL.geo, M.hair),
      browR: pivot(F.browR.geo, M.hair),
      mouth: pivot(F.mouth.geo, M.mouth),
    };
    EYES.forEach((e, i) => {
      const s = new THREE.Mesh(new THREE.SphereGeometry(e.r / 50, 32, 24), M.dark);
      const p = toWorld(e.cx, e.cy, F.eyeZ[i] - 0.6);
      s.position.copy(p);
      s.scale.z = 0.6;
      s.castShadow = true;
      head.add(s);
      s.userData.rest = p.clone();
      parts[i ? "eyeR" : "eyeL"] = s;
    });

    // ---- motion ----------------------------------------------------------------
    // a tiny tween system: tracks of keyframes on numbers, sampled each frame
    let tracks = [];
    const play = (dur, frames) =>
      new Promise((done) => {
        tracks.push({ t0: performance.now(), dur, frames, done });
      });
    const lerpFrames = (frames, t) => {
      let i = 0;
      while (i < frames.length - 2 && t > frames[i + 1][0]) i++;
      const [ta, a] = frames[i], [tb, b] = frames[i + 1];
      const k = Math.min(1, Math.max(0, (t - ta) / (tb - ta || 1)));
      const e = k * k * (3 - 2 * k);
      const out = {};
      for (const key of Object.keys(a)) out[key] = a[key] + (b[key] - a[key]) * e;
      return out;
    };
    const base = { sx: 1, sy: 1, by: 0, tilt: 0, hy: 0, eyeS: 1, eyeSL: 1, eyeSR: 1, eyeX: 0, eyeY: 0, browY: 0, browRY: 0, mouthSX: 1, mouthSY: 1, mouthR: 0 };
    const apply = (s) => {
      body.scale.set(s.sx, s.sy, (s.sx + s.sy) / 2);
      body.position.y = -1.42 + s.by;
      head.rotation.z = s.tilt;
      head.position.y = 1.42 + s.hy;
      for (const [k, scl] of [["eyeL", s.eyeS * s.eyeSL], ["eyeR", s.eyeS * s.eyeSR]]) {
        const m = parts[k];
        m.scale.set(s.eyeS, scl, 0.6);
        m.position.set(m.userData.rest.x + s.eyeX, m.userData.rest.y + s.eyeY, m.userData.rest.z);
      }
      parts.browL.position.y = parts.browL.userData.rest.y + s.browY;
      parts.browR.position.y = parts.browR.userData.rest.y + s.browY + s.browRY;
      parts.mouth.scale.set(s.mouthSX, s.mouthSY, 1);
      parts.mouth.rotation.z = s.mouthR;
    };
    const K = (t, o) => [t, { ...base, ...o }];
    const EMOTES = {
      blink: [220, [K(0, {}), K(0.45, { eyeS: 1, eyeSL: 0.08, eyeSR: 0.08 }), K(1, {})]],
      grin: [900, [K(0, {}), K(0.25, { mouthSX: 1.35, mouthSY: 1.25, eyeSL: 0.5, eyeSR: 0.5, tilt: 0.05 }), K(0.75, { mouthSX: 1.3, mouthSY: 1.2, eyeSL: 0.55, eyeSR: 0.55, tilt: 0.04 }), K(1, {})]],
      surprised: [1100, [K(0, {}), K(0.15, { browY: 0.12, eyeS: 1.35, hy: 0.08, mouthSX: 0.7, mouthSY: 1.6 }), K(0.75, { browY: 0.1, eyeS: 1.25, mouthSX: 0.75, mouthSY: 1.5 }), K(1, {})]],
      wink: [850, [K(0, {}), K(0.2, { eyeSR: 0.08, browRY: -0.04, mouthR: 0.18, mouthSX: 1.15, tilt: -0.07 }), K(0.65, { eyeSR: 0.08, browRY: -0.04, mouthR: 0.15, mouthSX: 1.12, tilt: -0.06 }), K(1, {})]],
      lookAround: [1500, [K(0, {}), K(0.15, { eyeX: -0.07, tilt: 0.04 }), K(0.4, { eyeX: -0.07, tilt: 0.04 }), K(0.55, { eyeX: 0.07, tilt: -0.04 }), K(0.8, { eyeX: 0.07, tilt: -0.04 }), K(1, {})]],
      laugh: [1000, [K(0, {}), K(0.12, { hy: 0.1, eyeSL: 0.1, eyeSR: 0.1, mouthSX: 1.35, mouthSY: 1.35 }), K(0.3, { hy: 0, eyeSL: 0.1, eyeSR: 0.1, mouthSX: 1.35, mouthSY: 1.35 }), K(0.48, { hy: 0.08, eyeSL: 0.1, eyeSR: 0.1, mouthSX: 1.35, mouthSY: 1.35 }), K(0.66, { hy: 0, eyeSL: 0.1, eyeSR: 0.1, mouthSX: 1.3, mouthSY: 1.3 }), K(1, {})]],
      shy: [1300, [K(0, {}), K(0.25, { tilt: 0.12, hy: -0.04, eyeSL: 0.6, eyeSR: 0.6, eyeX: -0.04, eyeY: -0.04 }), K(0.8, { tilt: 0.11, hy: -0.04, eyeSL: 0.6, eyeSR: 0.6, eyeX: -0.04, eyeY: -0.04 }), K(1, {})]],
      think: [1600, [K(0, {}), K(0.2, { eyeX: 0.05, eyeY: 0.06, browRY: 0.08, mouthSX: 0.75, tilt: -0.05 }), K(0.85, { eyeX: 0.05, eyeY: 0.06, browRY: 0.08, mouthSX: 0.75, tilt: -0.05 }), K(1, {})]],
      nod: [700, [K(0, {}), K(0.25, { hy: -0.06, tilt: -0.04 }), K(0.5, { hy: 0.02 }), K(0.75, { hy: -0.04, tilt: -0.02 }), K(1, {})]],
    };
    const BOUNCE = [620, [K(0, {}), K(0.14, { sx: 1.12, sy: 0.86 }), K(0.42, { sx: 0.92, sy: 1.1, by: 0.42 }), K(0.68, { sx: 1.1, sy: 0.9 }), K(0.84, { sx: 0.97, sy: 1.03 }), K(1, {})]];
    let busy = false;
    const emote = async (n) => {
      if (reduce() || !EMOTES[n]) return;
      await play(EMOTES[n][0], EMOTES[n][1]);
    };
    const bounce = async () => {
      if (reduce() || busy) return;
      busy = true;
      await play(BOUNCE[0], BOUNCE[1]);
      const pool = ["grin", "surprised", "wink", "laugh", "lookAround", "shy", "think", "nod"];
      await emote(pool[Math.floor(Math.random() * pool.length)]);
      busy = false;
    };
    api.current = { emote, bounce };

    // idle life, with restraint: a blink every 3 to 6 s, an emote every fourth tick
    let n = 0, idleT = 0;
    const idle = () => {
      n += 1;
      if (!busy && !document.hidden) emote(n % 4 === 0 ? ["lookAround", "think", "nod", "wink"][n % 3] : "blink");
      idleT = setTimeout(idle, 3000 + Math.random() * 3000);
    };
    idleT = setTimeout(idle, 2500);

    // the head follows the pointer a little (a real 3D turn)
    let px = 0, py = 0, tx = 0, ty = 0;
    const onMove = (e) => {
      const r = el.getBoundingClientRect();
      tx = ((e.clientX - r.left) / r.width - 0.5) * 0.5;
      ty = ((e.clientY - r.top) / r.height - 0.5) * 0.3;
    };
    if (interactive) window.addEventListener("pointermove", onMove);

    let raf = 0;
    const frame = (now) => {
      let s = { ...base };
      tracks = tracks.filter((tr) => {
        const t = (now - tr.t0) / tr.dur;
        if (t >= 1) { tr.done(); return false; }
        const v = lerpFrames(tr.frames, t);
        for (const k of Object.keys(v)) if (v[k] !== base[k]) s[k] = v[k];
        return true;
      });
      apply(s);
      px += (tx - px) * 0.08;
      py += (ty - py) * 0.08;
      head.rotation.y = px;
      head.rotation.x = py;
      renderer.render(scene, cam);
      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(idleT);
      window.removeEventListener("pointermove", onMove);
      renderer.dispose();
      pmrem.dispose();
      el.removeChild(renderer.domElement);
    };
  }, [size, skin, interactive]);

  return <div ref={host} className="face3d" style={{ width: size * 1.3, height: size * 1.1, cursor: "pointer" }} onClick={() => api.current?.bounce()} />;
});

export default Face3D;
