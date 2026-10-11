// <FaceSV>: the Blender-built face (public/faces/face.glb, tools/face3d/build_head.py)
// drawn in a Spider-Verse register (2026-10-08). One custom shader for every part:
//   - stepped cel light: lit, mid, shadow (three hard bands, no smooth falloff)
//   - halftone dots in the mid band (screen-space, 45 deg screen, dot size from the light)
//   - hatching lines in the shadow band
//   - a thin rim of light on the silhouette
//   - an inked outline (inverted hull, constant pixel width with a little wobble), and
//     a magenta copy of it a pixel or two off: the print's misregistration
//   - the character animates ON TWOS (12 poses a second) while the page stays smooth
// Expressions are the model's shape keys, named as ARKit names them (eyeBlinkLeft, jawOpen,
// mouthSmileRight...; Left = the character's own left). An emote is a timeline of those
// weights plus head moves; a name can live on several parts (mouthSmileLeft lifts the lip
// and the cheek) and every mesh that has it is set. Gaze slides the bead eyes with their
// lids. The bounce squashes the whole head about the chin. Reduced motion: still.

import { forwardRef, useEffect, useImperativeHandle, useRef } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

import { SKINS, MODES, PROPS, skinById, partKey, VERT, FRAG, OUT_VERT, OUT_FRAG } from "./faceSkins";

// kept for callers that want the Spider-Verse paper colour
export const SV = { paper: skinById("print").bg };

const reduce = () => typeof window !== "undefined" && !!window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

const FaceSV = forwardRef(function FaceSV({ size = 420, src = "/faces/face.glb", fitSrc = "/faces/fit.json", skin: skin0 = "clay", cycle = 0, onSkin }, ref) {
  const host = useRef(null);
  const api = useRef(null);
  const onSkinRef = useRef(onSkin);
  onSkinRef.current = onSkin;
  useImperativeHandle(ref, () => ({
    emote: (n) => api.current?.emote(n), bounce: () => api.current?.bounce(), pose: (n, k) => api.current?.pose(n, k),
    setSkin: (id) => api.current?.switchSkin(id), next: () => api.current?.next(),
  }), []);

  useEffect(() => {
    const el = host.current;
    // the canvas has the reference image's proportions (802 x 862), so the fitted camera
    // frames the head exactly as the drawing does
    const W = Math.round(size * 1.15), H = Math.round(W * 862 / 802);
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(dpr);
    renderer.setSize(W, H);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    el.appendChild(renderer.domElement);
    const scene = new THREE.Scene();
    const cam = new THREE.PerspectiveCamera(27, W / H, 0.1, 50);
    // a 3/4 view, the character turned toward the viewer's right like the drawings (we
    // see his right ear)
    cam.position.set(-2.5, 0.4, 7.2);
    cam.lookAt(0, 0.38, 0);
    let baseRoll = 0.24; // the head's tip, until the fitted camera (which carries the roll) loads
    const lightDir = new THREE.Vector3(-0.35, 0.75, 0.75).normalize();
    const res = new THREE.Vector2(W * dpr, H * dpr);
    const lView = new THREE.Vector3();
    // shared by every part: the skin's shading mode and its dot size
    // uTurn: 0 at the fitted pose, 1 once the view has turned well away (the fitted look then
    // trusts its projected texture only where the surface faced the camera squarely)
    // uActs: how much the eyes, brows and mouth are moving (0..1 each): their skin margins
    // fade from the reference's raw pixels to clean skin by that much
    const shared = { uL: { value: lView }, uMode: { value: 0 }, uDot: { value: 7 * dpr }, uTurn: { value: 0 }, uActs: { value: new THREE.Vector3() } };
    let skin = skinById(skin0);

    const body = new THREE.Group(); // squash about the chin
    body.position.y = -1.0;
    scene.add(body);
    // the viewer's own turn (drag to see every angle), about the head's centre; the
    // emotes' turns ride inside it, about the neck
    const turn = new THREE.Group();
    turn.position.y = 1.0;
    body.add(turn);
    const head = new THREE.Group();
    const NECK = 0.85; // the head turns about the neck: this far below its centre
    head.position.y = -NECK;
    turn.add(head);
    let alive = true;

    // A rig is one fitted model: its GLB, the camera and light fitted to its reference
    // (tools/face3d/fit), its parts. The face starts on `src`; a skin with its own `rig`
    // (noir: the hatted head fitted to the noir tile, tools/face3d/fit/noir) loads that one
    // the first time it is worn and swaps it in, camera and all. The lists below are the rig
    // on stage.
    let skinned = []; // { mesh, key, mat, ink, mis }
    let parts = {};
    let morphs = []; // every mesh with shape keys, its outlines included
    let fit = null;
    let rig = null;
    const rigs = {};
    const SHv = (L) => Array.from({ length: 9 }, (_, j) => new THREE.Vector3(L.sh[0][j], L.sh[1][j], L.sh[2][j]));
    // put a camera where a fit says (Blender's lens shift is in units of the larger image side)
    const placeCam = (c, f) => {
      c.fov = f.camera.fov;
      c.position.fromArray(f.camera.position);
      c.quaternion.fromArray(f.camera.quaternion);
      const big = Math.max(W, H);
      c.setViewOffset(W, H, f.camera.shift[0] * big, -f.camera.shift[1] * big, W, H);
      c.updateProjectionMatrix();
      c.updateMatrixWorld();
    };
    // files: the rig's id map, raw skin and feature margins (clay's sit beside fit.json; a
    // skin's rig names its own, felt: idmap-felt.png...). A rig without them draws clean skin.
    const loadRig = (rsrc, rfit, files) => {
      if (rigs[rsrc]) return rigs[rsrc];
      const r = { root: null, fit: null, parts: {}, morphs: [], skinned: [], loaded: false };
      const fitP = fetch(rfit).then((x) => (x.ok ? x.json() : null)).catch(() => null);
      const beside = (f) => rfit.replace(/fit\.json$/, f);
      const F = files?.idmap ? files : /(^|\/)fit\.json$/.test(rfit) ? { idmap: beside("idmap.png"), raw: beside("skin-raw.png"), margins: beside("margins.png") } : null;
      // which part the reference shows at each pixel: data, read exactly (no filtering, no flip)
      let idMap = null;
      if (F) {
        idMap = new THREE.TextureLoader().load(F.idmap, (t) => {
          t.flipY = false; t.colorSpace = THREE.NoColorSpace; t.needsUpdate = true;
        });
        idMap.flipY = false; idMap.magFilter = idMap.minFilter = THREE.NearestFilter; idMap.generateMipmaps = false;
      }
      // the skin exactly as the reference shows it (features baked in), and where each moving
      // feature's margin lies: at rest the skin shows raw; a margin fades to the clean skin
      // while its feature moves, so nothing is left behind
      // (switched on only once both images have loaded: a missing file means clean skin, never black)
      let skinRaw = null, margins = null, rawLoaded = 0;
      const rawMats = [];
      const rawReady = () => { if (++rawLoaded === 2) rawMats.forEach((m) => { m.uniforms.uHasRaw.value = 1; }); };
      if (idMap) {
        const data = (file, filter) => {
          const t = new THREE.TextureLoader().load(file, (tt) => { tt.flipY = false; tt.needsUpdate = true; rawReady(); });
          t.flipY = false; t.colorSpace = THREE.NoColorSpace; t.magFilter = t.minFilter = filter;
          return t;
        };
        if (F.raw && F.margins) {
          skinRaw = data(F.raw, THREE.LinearFilter);
          margins = data(F.margins, THREE.LinearFilter);
        }
      }
      r.ready = new Promise((done) => new GLTFLoader().load(rsrc, async (gltf) => {
        const fit = (r.fit = await fitP);
        if (!alive) return;
        const root = (r.root = gltf.scene);
        // the rig's own camera at rest, for the rest normal matrix
        const rc = new THREE.PerspectiveCamera(27, W / H, 0.1, 50);
        if (fit) placeCam(rc, fit); else rc.copy(cam);
        rc.updateMatrixWorld();
        root.updateMatrixWorld(true); // rest pose (the head stack is identity until it moves)

        const meshes = [];
        root.traverse((o) => { if (o.isMesh) meshes.push(o); });
        meshes.forEach((o) => {
          const key = partKey(o.name);
          // the fitted part's light, its albedo-ratio texture (stored as data, not colour)
          const map = o.material?.map || null;
          if (map) { map.colorSpace = THREE.NoColorSpace; map.needsUpdate = true; }
          const L = fit?.light;
          // the mouth is a crease pressed into the clay: the skin's own light, a shade darker
          const crease = key === "Mouth" || key === "MouthInner";
          const lit = L && (key === "Hair" ? L.hair : key === "Brow" ? L.brow || L.hair : key === "Eye" ? L.eye || L.skin
            : key === "Hat" || key === "HatBand" ? L.hat || L.hair : L.skin);
          const mat = new THREE.ShaderMaterial({
            vertexShader: VERT, fragmentShader: FRAG, vertexColors: !!o.geometry.attributes.color,
            uniforms: { ...shared, uBase: { value: new THREE.Color() }, uShade: { value: new THREE.Color() }, uDeep: { value: new THREE.Color() },
              uSpec: { value: 0 }, uIsHair: { value: key === "Hair" ? 1 : 0 }, uMisreg: { value: new THREE.Color() },
              uSH: { value: lit ? SHv(lit) : Array.from({ length: 9 }, () => new THREE.Vector3()) }, uK: { value: lit ? lit.k : 0 },
              uUseMap: { value: map ? 1 : 0 }, uMap: { value: map }, uIsEye: { value: key === "Eye" ? 1 : 0 },
              // how the ratio texture is stored and the light's floor: clay's defaults, or the
              // fit's own (noir: near-black parts get their own floor, scale and gamma)
              uFloor: { value: lit?.floor ?? 0.03 }, uTexScale: { value: lit?.scale ?? 4 }, uTexGamma: { value: lit?.gamma ?? 1 },
              // the lip carries its own texture (the reference's crease); the mouth's inside is dark
              uTint: { value: key === "MouthInner" ? (fit?.mono ? new THREE.Vector3().setScalar(0.2) : new THREE.Vector3(0.32, 0.16, 0.14))
                : new THREE.Vector3().setScalar(crease && !map ? 0.8 : 1) },
              uRestNM: { value: new THREE.Matrix3().setFromMatrix4(rc.matrixWorldInverse.clone().multiply(o.matrixWorld)) },
              // the lids read the skin's texture, so they test against the skin's id
              uIdMap: { value: idMap }, uIdRes: { value: new THREE.Vector2(802, 862) },
              uPartId: { value: fit?.ids && idMap ? fit.ids.indexOf(o.name.startsWith("Lid") ? "Skin" : o.name) : -1 },
              uLayered: { value: ["Skin", "Hair", "LidL", "LidR"].includes(o.name) ? 1 : 0 },
              uFlatN: { value: new THREE.Vector3().fromArray(fit?.lids?.[o.name] || [0, 0, 1]) }, uFlat: { value: fit?.lids?.[o.name] ? 0.85 : 0 },
              uRatioMean: { value: new THREE.Vector3().fromArray(fit?.ratioMean?.[o.name.startsWith("Lid") ? "Skin" : o.name] || [0, 0, 0]) },
              uMapRaw: { value: o.name === "Skin" ? skinRaw : null }, uMargin: { value: o.name === "Skin" ? margins : null },
              uHasRaw: { value: o.name === "Skin" && skinRaw && rawLoaded === 2 ? 1 : 0 } },
          });
          if (o.name === "Skin" && skinRaw) rawMats.push(mat);
          o.material = mat;
          // the ink outline and a misregistered copy (behind the mesh: back faces only)
          const outline = () => new THREE.Mesh(o.geometry, new THREE.ShaderMaterial({
            vertexShader: OUT_VERT, fragmentShader: OUT_FRAG, side: THREE.BackSide,
            uniforms: { uColor: { value: new THREE.Color() }, uWidth: { value: 1 }, uRes: { value: res }, uShift: { value: new THREE.Vector2() } },
          }));
          const lines = o.name === "MouthInner" ? [] : [outline(), outline()];
          lines.forEach((l) => o.add(l));
          if (o.morphTargetDictionary) r.morphs.push(o, ...lines.map((l) => Object.assign(l, { morphTargetDictionary: o.morphTargetDictionary })));
          o.userData.rest = { p: o.position.clone(), s: o.scale.clone(), r: o.rotation.clone() };
          r.parts[o.name] = o;
          r.skinned.push({ mesh: o, key, mat, mis: lines[0], ink: lines[1], small: o.name !== "Skin" && o.name !== "Hair" });
        });
        root.position.y = NECK; // at rest the whole stack is identity (the fitted textures rely on it)
        r.loaded = true;
        done(r);
      }));
      rigs[rsrc] = r;
      return r;
    };
    const useRig = (r) => {
      if (rig === r) return;
      if (rig?.root) head.remove(rig.root);
      rig = r;
      head.add(r.root);
      ({ skinned, parts, morphs, fit } = r);
      if (fit) {
        placeCam(cam, fit);
        baseRoll = 0;
      }
    };
    const baseRig = loadRig(src, fitSrc);
    baseRig.ready.then((r) => { if (!rig || !skin.rig) { useRig(r); applySkin(skin); } });

    // a skin's flat layers (noir: the rain behind, the coat collar in front), the canvas's size
    el.style.position = "relative";
    renderer.domElement.style.position = "relative";
    renderer.domElement.style.zIndex = 1;
    const front = document.createElement("img");
    front.alt = "";
    Object.assign(front.style, { position: "absolute", left: 0, top: 0, width: W + "px", height: H + "px", zIndex: 2, pointerEvents: "none", display: "none" });
    el.appendChild(front);
    // the rain: two sheets of short streaks, falling at two speeds, behind the head
    const rain = document.createElement("div");
    Object.assign(rain.style, { position: "absolute", left: 0, top: 0, width: W + "px", height: H + "px", zIndex: 0, pointerEvents: "none", display: "none" });
    el.appendChild(rain);
    let rainAnim = null;
    const rainTile = (n, len, alpha) => {
      const c = document.createElement("canvas");
      c.width = c.height = 256;
      const g = c.getContext("2d");
      g.strokeStyle = `rgba(235,235,235,${alpha})`;
      g.lineWidth = 1;
      for (let i = 0; i < n; i++) {
        const x = Math.random() * 256, y = Math.random() * 256, l = len * (0.6 + Math.random() * 0.8);
        for (const dx of [-256, 0, 256]) for (const dy of [-256, 0, 256]) {
          g.beginPath(); g.moveTo(x + dx, y + dy); g.lineTo(x + dx - l * 0.17, y + dy + l); g.stroke();
        }
      }
      return c.toDataURL();
    };
    const setRain = (on) => {
      rain.style.display = on ? "block" : "none";
      if (!on) { rainAnim?.cancel(); rainAnim = null; return; }
      if (!rain.style.backgroundImage) rain.style.backgroundImage = `url(${rainTile(26, 26, 0.16)}), url(${rainTile(40, 14, 0.09)})`;
      if (!rainAnim && !reduce()) {
        rainAnim = rain.animate([{ backgroundPosition: "0px 0px, 0px 0px" }, { backgroundPosition: "-87px 512px, -22px 256px" }],
          { duration: 900, iterations: Infinity });
      }
    };

    // ---- skins ---------------------------------------------------------------
    let fitOn = false; // the skin is drawn with its rig's fitted light and textures
    const applySkin = (sk) => {
      skin = sk;
      const want = sk.rig ? loadRig(sk.rig.src, sk.rig.fit, sk.rig) : baseRig;
      if (want.loaded) useRig(want);
      else want.ready.then(() => { if (skin === sk) applySkin(sk); });
      fitOn = !!(want.loaded && rig === want && fit && (sk.mode === "fit" || sk.rig));
      const pr = sk.pixel ? sk.pixel : dpr;
      renderer.setPixelRatio(pr);
      renderer.setSize(W, H);
      res.set(W * pr, H * pr);
      renderer.domElement.style.imageRendering = sk.pixel ? "pixelated" : "auto";
      shared.uMode.value = MODES[fitOn ? "fit" : sk.mode];
      shared.uDot.value = 7 * pr;
      for (const s of skinned) {
        const P = sk.parts[s.key] || sk.parts.Skin;
        if (PROPS.includes(s.key)) s.mesh.visible = !!sk.props?.includes(s.key);
        s.mat.uniforms.uBase.value.set(P.base);
        if (fitOn && s.key === "Eye" && fit) s.mat.uniforms.uBase.value.setRGB(...fit.eye, THREE.LinearSRGBColorSpace);
        s.mat.uniforms.uShade.value.set(P.shade);
        s.mat.uniforms.uDeep.value.set(P.deep);
        s.mat.uniforms.uSpec.value = P.spec || 0;
        const ol = sk.outline;
        if (s.ink) {
          s.ink.visible = !!ol;
          s.mis.visible = !!ol?.misreg;
          if (ol) {
            const wpx = (s.small ? ol.small : ol.width) * pr;
            s.ink.material.uniforms.uColor.value.set(ol.ink);
            s.ink.material.uniforms.uWidth.value = wpx;
            s.ink.material.uniforms.uShift.value.set(0, 0);
            if (ol.misreg) {
              s.mis.material.uniforms.uColor.value.set(ol.misreg);
              s.mis.material.uniforms.uWidth.value = wpx * 1.15;
              s.mis.material.uniforms.uShift.value.set(2.2 * pr, -1.6 * pr);
            }
          }
        }
      }
      const pl = fitOn ? sk.rig?.plates : null;
      el.style.background = pl?.back ? `url(${pl.back}) 0 0 / ${W}px ${H}px no-repeat, ${sk.bg}` : sk.bg;
      front.style.display = pl?.front ? "block" : "none";
      if (pl?.front && !front.src.endsWith(pl.front)) front.src = pl.front;
      setRain(!!(fitOn && sk.rig?.rain));
      onSkinRef.current?.(sk);
    };

    // ---- motion (sampled on twos) ---------------------------------------------
    // head moves, gaze, and every shape key (0 at rest)
    const KEYS = ["eyeBlinkLeft", "eyeBlinkRight", "eyeSquintLeft", "eyeSquintRight", "eyeWideLeft", "eyeWideRight",
      "browInnerUp", "browOuterUpLeft", "browOuterUpRight", "browDownLeft", "browDownRight",
      "jawOpen", "mouthSmileLeft", "mouthSmileRight", "mouthFrownLeft", "mouthFrownRight", "mouthPucker", "cheekPuff"];
    const base = { sx: 1, sy: 1, by: 0, tilt: 0, yaw: 0, pitch: 0, hy: 0, eyeX: 0, eyeY: 0, ...Object.fromEntries(KEYS.map((k) => [k, 0])) };
    const K = (t, o) => [t, { ...base, ...o }];
    // shorthands for the pairs
    const both = (n, v) => ({ [n + "Left"]: v, [n + "Right"]: v });
    const smile = (v) => both("mouthSmile", v), squint = (v) => both("eyeSquint", v), blinkB = (v) => both("eyeBlink", v);
    const EMOTES = {
      blink: [220, [K(0, {}), K(0.45, blinkB(1)), K(1, {})]],
      grin: [1000, [K(0, {}), K(0.22, { ...smile(1), ...squint(0.7), jawOpen: 0.3, tilt: 0.06, hy: 0.03 }), K(0.75, { ...smile(0.95), ...squint(0.65), jawOpen: 0.25, tilt: 0.05 }), K(1, {})]],
      surprised: [1100, [K(0, {}), K(0.14, { jawOpen: 0.85, mouthPucker: 0.5, ...both("eyeWide", 1), browInnerUp: 1, ...both("browOuterUp", 0.8), hy: 0.08 }), K(0.75, { jawOpen: 0.7, mouthPucker: 0.45, ...both("eyeWide", 0.8), browInnerUp: 0.8, ...both("browOuterUp", 0.6), hy: 0.03 }), K(1, {})]],
      wink: [850, [K(0, {}), K(0.2, { eyeBlinkLeft: 1, eyeSquintRight: 0.3, mouthSmileLeft: 0.9, mouthSmileRight: 0.2, browDownLeft: 0.4, browOuterUpRight: 0.5, tilt: -0.08 }), K(0.65, { eyeBlinkLeft: 1, eyeSquintRight: 0.3, mouthSmileLeft: 0.85, mouthSmileRight: 0.2, browDownLeft: 0.4, browOuterUpRight: 0.45, tilt: -0.07 }), K(1, {})]],
      lookAround: [1800, [K(0, {}), K(0.15, { eyeX: -0.035, yaw: -0.1, tilt: 0.04, browOuterUpRight: 0.4 }), K(0.4, { eyeX: -0.035, yaw: -0.11, tilt: 0.05, browOuterUpRight: 0.4 }), K(0.55, { eyeX: 0.035, yaw: 0.09, tilt: -0.04, browOuterUpLeft: 0.4 }), K(0.8, { eyeX: 0.035, yaw: 0.1, tilt: -0.05, browOuterUpLeft: 0.4 }), K(1, {})]],
      laugh: [1000, [K(0, {}), K(0.12, { hy: 0.1, ...blinkB(1), ...smile(1), jawOpen: 0.75 }), K(0.3, { ...blinkB(1), ...smile(1), jawOpen: 0.45 }), K(0.48, { hy: 0.08, ...blinkB(1), ...smile(1), jawOpen: 0.75 }), K(0.66, { ...blinkB(1), ...smile(0.9), jawOpen: 0.4 }), K(1, {})]],
      shy: [1300, [K(0, {}), K(0.25, { tilt: 0.12, yaw: -0.08, pitch: 0.06, hy: -0.04, ...squint(0.6), eyeY: -0.02, ...smile(0.45), mouthPucker: 0.25, cheekPuff: 0.3 }), K(0.8, { tilt: 0.11, yaw: -0.07, pitch: 0.05, hy: -0.04, ...squint(0.6), eyeY: -0.02, ...smile(0.45), mouthPucker: 0.25, cheekPuff: 0.3 }), K(1, {})]],
      think: [1600, [K(0, {}), K(0.2, { yaw: 0.07, pitch: -0.06, eyeX: 0.03, eyeY: 0.03, browOuterUpLeft: 0.9, browDownRight: 0.4, mouthPucker: 0.45, mouthSmileLeft: 0.25, tilt: -0.06 }), K(0.85, { yaw: 0.07, pitch: -0.06, eyeX: 0.03, eyeY: 0.03, browOuterUpLeft: 0.9, browDownRight: 0.4, mouthPucker: 0.45, mouthSmileLeft: 0.25, tilt: -0.06 }), K(1, {})]],
      nod: [800, [K(0, {}), K(0.25, { pitch: 0.09, hy: -0.03, ...smile(0.4) }), K(0.5, { pitch: -0.02, ...smile(0.4) }), K(0.75, { pitch: 0.06, hy: -0.02, ...smile(0.3) }), K(1, {})]],
      sad: [1500, [K(0, {}), K(0.25, { ...both("mouthFrown", 1), browInnerUp: 1, ...squint(0.25), hy: -0.05, tilt: 0.06, eyeY: -0.015 }), K(0.8, { ...both("mouthFrown", 0.9), browInnerUp: 0.9, ...squint(0.25), hy: -0.05, tilt: 0.06, eyeY: -0.015 }), K(1, {})]],
      angry: [1200, [K(0, {}), K(0.15, { ...both("browDown", 1), ...both("mouthFrown", 0.8), ...squint(0.5), hy: -0.03 }), K(0.3, { ...both("browDown", 1), ...both("mouthFrown", 0.8), ...squint(0.5), tilt: 0.04 }), K(0.45, { ...both("browDown", 1), ...both("mouthFrown", 0.8), ...squint(0.5), tilt: -0.04 }), K(0.8, { ...both("browDown", 0.9), ...both("mouthFrown", 0.7), ...squint(0.45) }), K(1, {})]],
      puff: [1200, [K(0, {}), K(0.2, { cheekPuff: 1, mouthPucker: 0.7, ...both("eyeWide", 0.4), hy: 0.04 }), K(0.7, { cheekPuff: 1, mouthPucker: 0.7, ...both("eyeWide", 0.3), hy: 0.04 }), K(0.85, { jawOpen: 0.3, mouthPucker: 0.6, ...squint(0.3) }), K(1, {})]],
    };
    const BOUNCE = [640, [K(0, {}), K(0.14, { sx: 1.14, sy: 0.84, ...squint(0.6) }), K(0.42, { sx: 0.9, sy: 1.12, by: 0.45, ...both("eyeWide", 0.6), browInnerUp: 0.4 }), K(0.68, { sx: 1.12, sy: 0.88, ...squint(0.5) }), K(0.84, { sx: 0.96, sy: 1.04 }), K(1, {})]];
    let tracks = [];
    const play = (dur, frames) => new Promise((done) => tracks.push({ t0: performance.now(), dur, frames, done }));
    const sample = (frames, t) => {
      let i = 0;
      while (i < frames.length - 2 && t > frames[i + 1][0]) i++;
      const [ta, a] = frames[i], [tb, b] = frames[i + 1];
      const k = Math.min(1, Math.max(0, (t - ta) / (tb - ta || 1)));
      const e = k * k * (3 - 2 * k);
      const o = {};
      for (const key of Object.keys(a)) o[key] = a[key] + (b[key] - a[key]) * e;
      return o;
    };
    const apply = (s) => {
      body.scale.set(s.sx, s.sy, (s.sx + s.sy) / 2);
      body.position.y = -1.0 + s.by;
      // turn (yaw), nod (pitch, + = chin down) and tilt (roll)
      head.rotation.set(s.pitch, s.yaw, baseRoll + s.tilt);
      head.position.y = -NECK + s.hy;
      turn.rotation.set(view.pitch, view.yaw, 0, "YXZ");
      // pull back as the head turns away from the drawing's pose, so no angle is cropped
      const away = Math.min(1, (Math.abs(Math.atan2(Math.sin(view.yaw), Math.cos(view.yaw))) + Math.abs(view.pitch)) / 0.7);
      shared.uTurn.value = away;
      const on = (v) => Math.min(1, Math.max(0, v / 0.12)); // reaches clean skin early in a move
      shared.uActs.value.set(
        on(Math.max(s.eyeBlinkLeft, s.eyeBlinkRight, s.eyeSquintLeft, s.eyeSquintRight, s.eyeWideLeft, s.eyeWideRight, Math.abs(s.eyeX) * 8, Math.abs(s.eyeY) * 8)),
        on(Math.max(s.browInnerUp, s.browOuterUpLeft, s.browOuterUpRight, s.browDownLeft, s.browDownRight)),
        on(Math.max(s.jawOpen, s.mouthSmileLeft, s.mouthSmileRight, s.mouthFrownLeft, s.mouthFrownRight, s.mouthPucker, s.cheekPuff)));
      const z = 1 - 0.22 * away * away * (3 - 2 * away);
      if (Math.abs(cam.zoom - z) > 1e-4) { cam.zoom = z; cam.updateProjectionMatrix(); }
      // gaze: the bead and its lids slide together
      for (const n of ["EyeL", "EyeR", "LidL", "LidR"]) {
        const o = parts[n];
        if (o) o.position.set(o.userData.rest.p.x + s.eyeX, o.userData.rest.p.y + s.eyeY, o.userData.rest.p.z);
      }
      // the fitted look: the lids (skin-textured) only appear while the eyes use them; the
      // lip is always there (it carries the reference's crease), its inside only when open
      if (fitOn) {
        // (wide eyes pull the lids back out of sight, so only a blink or a squint shows them)
        const eyeOn = ["eyeBlinkLeft", "eyeBlinkRight", "eyeSquintLeft", "eyeSquintRight"].some((k) => s[k] > 0.02);
        const mouthOn = ["jawOpen", "mouthSmileLeft", "mouthSmileRight", "mouthFrownLeft", "mouthFrownRight", "mouthPucker"].some((k) => s[k] > 0.02);
        for (const n of ["LidL", "LidR"]) if (parts[n]) parts[n].visible = eyeOn;
        // (a rig whose smile is baked into the skin, untextured lip: only while the mouth moves)
        if (parts.Mouth) parts.Mouth.visible = mouthOn || !!parts.Mouth.material.uniforms?.uUseMap?.value;
        if (parts.MouthInner) parts.MouthInner.visible = mouthOn;
      } else {
        for (const n of ["LidL", "LidR", "Mouth", "MouthInner"]) if (parts[n]) parts[n].visible = true;
      }
      for (const m of morphs) {
        const d = m.morphTargetDictionary, w = m.morphTargetInfluences;
        if (w) for (const k in d) w[d[k]] = s[k] ?? skin.keys?.[k] ?? 0;
      }
    };
    let busy = false;
    const switchSkin = async (id) => {
      const next = typeof id === "string" ? skinById(id) : id;
      if (busy || !next || next === skin) return;
      if (reduce()) { applySkin(next); return; }
      busy = true;
      setTimeout(() => applySkin(next), BOUNCE[0] * 0.36); // at the top of the hop
      await play(...BOUNCE);
      const pool = Object.keys(EMOTES).filter((e) => !["blink", "sad", "angry", "lookAround"].includes(e));
      await emote(pool[Math.floor(Math.random() * pool.length)]);
      busy = false;
    };
    const nextSkin = () => switchSkin(SKINS[(SKINS.indexOf(skin) + 1) % SKINS.length]);
    const emote = async (n) => { if (!reduce() && EMOTES[n]) await play(...EMOTES[n]); };
    const bounce = async () => {
      if (reduce() || busy) return;
      busy = true;
      await play(...BOUNCE);
      const pool = Object.keys(EMOTES).filter((e) => e !== "blink" && e !== "sad" && e !== "angry");
      await emote(pool[Math.floor(Math.random() * pool.length)]);
      busy = false;
    };
    // pose(name, k): hold an emote frozen at k (0..1) of its timeline; pose() lets go
    let held = null;
    const pose = (n, k = 0.5) => { held = n && EMOTES[n] ? sample(EMOTES[n][1], k) : null; };
    api.current = { emote, bounce, pose, switchSkin, next: nextSkin, applySkin: (id) => applySkin(skinById(id)),
      // set the drag view directly (radians), for turntable checks
      setView: (yaw, pitch = 0) => { view.yaw = yaw; view.pitch = pitch; view.vy = view.vp = 0; view.home = false; },
      // a PNG of the face as it stands (renders first, so the drawing buffer is still there)
      snapshot: () => { renderer.render(scene, cam); return renderer.domElement.toDataURL("image/png"); } };
    let cycleT = 0;
    if (cycle > 0) {
      const tick = () => { if (!document.hidden) nextSkin(); cycleT = setTimeout(tick, cycle); };
      cycleT = setTimeout(tick, cycle);
    }
    el.__face = api.current; // for headless checks: document.querySelector(".face-sv").__face.pose("grin")
    let n = 0, idleT = 0;
    const idle = () => {
      n += 1;
      if (!busy && !document.hidden) emote(n % 4 === 0 ? ["lookAround", "think", "nod", "wink"][n % 3] : "blink");
      idleT = setTimeout(idle, 3000 + Math.random() * 3000);
    };
    idleT = setTimeout(idle, 2500);

    // ---- drag to turn ------------------------------------------------------------
    // a full turn side to side, up to 70 degrees up or down; a little momentum on release;
    // double-click eases back to the drawing's pose. A drag never counts as a click.
    const view = { yaw: 0, pitch: 0, vy: 0, vp: 0, home: false };
    let drag = null;
    const onDown = (e) => {
      drag = { x: e.clientX, y: e.clientY, moved: 0, t: performance.now() };
      view.vy = view.vp = 0; view.home = false;
      el.setPointerCapture?.(e.pointerId);
      el.classList.add("face-sv--dragging");
    };
    const onMove = (e) => {
      if (!drag) return;
      const dx = e.clientX - drag.x, dy = e.clientY - drag.y;
      const now = performance.now(), dt = Math.max(1, now - drag.t);
      drag.x = e.clientX; drag.y = e.clientY; drag.t = now; drag.moved += Math.abs(dx) + Math.abs(dy);
      const ky = 0.012, kp = 0.006;
      view.yaw += dx * ky;
      view.pitch = Math.max(-1.22, Math.min(1.22, view.pitch + dy * kp));
      view.vy = (dx * ky) / dt; view.vp = (dy * kp) / dt;
    };
    const onUp = (e) => {
      if (!drag) return;
      el.dragged = drag.moved > 5;
      drag = null;
      el.releasePointerCapture?.(e.pointerId);
      el.classList.remove("face-sv--dragging");
      if (reduce()) view.vy = view.vp = 0;
    };
    const onDouble = () => { view.home = true; view.vy = view.vp = 0; };
    el.addEventListener("pointerdown", onDown);
    el.addEventListener("pointermove", onMove);
    el.addEventListener("pointerup", onUp);
    el.addEventListener("pointercancel", onUp);
    el.addEventListener("dblclick", onDouble);
    let lastNow = performance.now();
    const stepView = (now) => {
      const dt = Math.min(64, now - lastNow); lastNow = now;
      if (drag) return;
      if (view.home) {
        // the shortest way home round the turn, then settle
        const wrap = Math.atan2(Math.sin(view.yaw), Math.cos(view.yaw));
        view.yaw = wrap + (0 - wrap) * Math.min(1, dt * 0.008);
        view.pitch += (0 - view.pitch) * Math.min(1, dt * 0.008);
        if (Math.abs(view.yaw) + Math.abs(view.pitch) < 0.002) { view.yaw = view.pitch = 0; view.home = false; }
        return;
      }
      if (Math.abs(view.vy) + Math.abs(view.vp) > 1e-5) {
        view.yaw += view.vy * dt;
        view.pitch = Math.max(-1.22, Math.min(1.22, view.pitch + view.vp * dt));
        const f = Math.exp(-dt / 220);
        view.vy *= f; view.vp *= f;
      }
    };

    let raf = 0, lastStep = -1;
    const frame = (now) => {
      stepView(now);
      // on twos (12 poses a second) for the drawn styles; the fitted clay look runs smooth
      const STEP_MS = fitOn ? 1 : 1000 / 12;
      const step = Math.floor(now / STEP_MS);
      const viewMoving = !!drag || view.home || Math.abs(view.vy) + Math.abs(view.vp) > 1e-5;
      if (step !== lastStep || viewMoving) {
        lastStep = step;
        const t = step * STEP_MS;
        let s = { ...base };
        tracks = tracks.filter((tr) => {
          const k = (t - tr.t0) / tr.dur;
          if (k >= 1) { tr.done(); return false; }
          if (k >= 0) Object.assign(s, sample(tr.frames, k));
          return true;
        });
        // a slow idle sway: never quite still, never far from the drawing's pose
        if (!held && !reduce()) {
          s.yaw += 0.035 * Math.sin(t * 0.00041) + 0.012 * Math.sin(t * 0.00113 + 1.3);
          s.pitch += 0.02 * Math.sin(t * 0.00033 + 0.7);
          s.tilt += 0.02 * Math.sin(t * 0.00027 + 2.1);
        }
        apply(held ? { ...s, ...held } : s);
        lView.copy(lightDir).transformDirection(cam.matrixWorldInverse);
        renderer.render(scene, cam);
      }
      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);
    return () => {
      alive = false;
      cancelAnimationFrame(raf);
      clearTimeout(idleT);
      clearTimeout(cycleT);
      rainAnim?.cancel();
      el.removeEventListener("pointerdown", onDown);
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerup", onUp);
      el.removeEventListener("pointercancel", onUp);
      el.removeEventListener("dblclick", onDouble);
      renderer.dispose();
      el.removeChild(renderer.domElement);
      el.removeChild(front);
      el.removeChild(rain);
    };
  }, [size, src, skin0, cycle]);

  return (
    <div ref={host} className="face-sv" title="Drag to turn. Double-click to reset."
      style={{ position: "relative", width: Math.round(size * 1.15), height: Math.round(size * 1.25), touchAction: "none" }}
      onClick={(e) => { if (e.currentTarget.dragged) { e.currentTarget.dragged = false; return; } api.current?.next(); }}>
      <style>{`
        .face-sv { cursor: grab; }
        .face-sv.face-sv--dragging { cursor: grabbing; }
        .face-sv__hint { position: absolute; z-index: 3; left: 50%; bottom: 8px; transform: translate(-50%, 4px); padding: 6px 10px; border-radius: 999px;
          font: 500 12px/1 Inter, system-ui, sans-serif; color: #ededf0; background: rgba(14, 14, 17, 0.72); pointer-events: none;
          opacity: 0; transition: opacity 160ms ease, transform 160ms ease; white-space: nowrap; }
        .face-sv:hover .face-sv__hint { opacity: 1; transform: translate(-50%, 0); }
        .face-sv.face-sv--dragging .face-sv__hint { opacity: 0; }
        @media (hover: none) { .face-sv__hint { opacity: 1; transform: translate(-50%, 0); } }
        @media (prefers-reduced-motion: reduce) { .face-sv__hint { transition: none; } }
      `}</style>
      <span className="face-sv__hint" aria-hidden="true">Drag to turn</span>
    </div>
  );
});

export default FaceSV;
