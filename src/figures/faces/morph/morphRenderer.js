// The mascot morph's renderer (2026-10-10): one WebGL canvas, at the reference's own size
// (802 x 862, scaled by CSS), that draws the fitted head three ways and blends them:
//   ink    the head drawn in the line drawing's register, live from the mesh: the hair a
//          solid ink mass, an ink band inside the silhouette, the ear and the nose drawn as
//          lines (the ear's rim, the nose's occluding contour), eyes, brows and mouth as ink
//   flat   each part in a flat colour
//   shaded the fitted clay look (faceRig3D, what FaceSV draws)
// plus the morph field (morphField.js): the drawing warped and blended into the ink.
// Lines are a constant width in pixels: jump flooding gives every pixel its distance to the
// nearest seed (background, ear rim, nose contour, mouth), and the ink is a distance test.
import * as THREE from "three";
import { createFaceRig, PART_ID } from "./faceRig3D";
import { resolveFace, PRESETS } from "../features/core";
import { SKINS, skinById } from "../faceSkins";
import { rigConfig } from "./rigConfigs";

// every skin the hero's renderer can wear, in click-cycle order (see createMorphRenderer's listSkins/setSkin)
export const SKIN_IDS = ["clay", "noir", ...SKINS.filter((s) => s.id !== "clay" && s.id !== "noir" && (s.rig || s.mode === "print")).map((s) => s.id), "plast"];
export const FW = 802, FH = 862;

const QUAD_VERT = /* glsl */ `varying vec2 vUv; void main(){ vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }`;

// the ids pass with depth: R = part code, G = view depth
// B = how squarely the surface faces the camera, on the nose (the skin's front layer, in the
// nose's own box) and the ear; else -1
const ID_DEPTH_FRAG_PATCH = (frag) => frag.replace("gl_FragColor = vec4(id / 255.0, 0.0, 0.0, 1.0);",
  "bool nz = (id == 1.0 && vUv.x >= 0.5 && vO.x > -0.2 && vO.x < 0.25 && vO.y > -0.25 && vO.y < 0.5 && vO.z > 0.8) || id == 8.0;\n  gl_FragColor = vec4(id, vDepth, nz ? abs(vNz) : -1.0, 1.0);");

// seeds: for each of the four sets a pixel is a seed of, write its own coordinates
// set 0: background (and the ears), set 1: the ear's rim, set 2: the nose's contour, set 3: the mouth
const SEED_FRAG = /* glsl */ `
uniform sampler2D tId; uniform vec2 uRes; uniform float uDepthK, uGraze; varying vec2 vUv;
float idAt(vec2 p){ return texture2D(tId, p / uRes).r; }
float zAt(vec2 p){ return texture2D(tId, p / uRes).g; }
void main(){
  vec2 p = floor(vUv * uRes) + 0.5;
  float id = idAt(p);
  // the band runs inside the silhouette and along the ears' joins, as the drawing's does
  bool bg = id < 0.5 || abs(id - ${PART_ID.Ear.toFixed(1)}) < 0.5;
  // the ear's rim: ear pixels next to anything that is not ear (background, hair, face)
  bool ear = false;
  if (abs(id - ${PART_ID.Ear.toFixed(1)}) < 0.5) {
    for (int i = 0; i < 4; i++) {
      vec2 o = i == 0 ? vec2(1,0) : i == 1 ? vec2(-1,0) : i == 2 ? vec2(0,1) : vec2(0,-1);
      if (abs(idAt(p + o) - ${PART_ID.Ear.toFixed(1)}) > 0.5) ear = true;
    }
  }
  // set 2, the nose and the folds inside the ear.
  // The nose: the edge of the skin's front layer (the nose, nzHere >= 0 there) against the
  // cheek, on the side the nose is turned to (the viewer's right, and below). The ear's
  // folds: an occluding contour inside the ear, this pixel in front and the neighbour far
  // behind, much further than the surface's own slope here.
  bool nose = false;
  float nzHere = texture2D(tId, p / uRes).b;
  bool inEar = abs(id - ${PART_ID.Ear.toFixed(1)}) < 0.5;
  bool isNose = abs(id - ${PART_ID.Skin.toFixed(1)}) < 0.5 && nzHere >= 0.0;
  if (isNose) {
    // on the nose's edge (a cheek pixel next to it), with the edge's outward normal (away
    // from the nose pixels in a 5 x 5 window) pointing right or down
    bool edge = false; vec2 c = vec2(0.0);
    for (int j = -2; j <= 2; j++) for (int i = -2; i <= 2; i++) {
      vec4 t = texture2D(tId, (p + vec2(float(i), float(j))) / uRes);
      bool n = abs(t.r - ${PART_ID.Skin.toFixed(1)}) < 0.5 && t.b >= 0.0;
      if (n) c += vec2(float(i), float(j));
      else if (abs(i) + abs(j) == 1 && abs(t.r - ${PART_ID.Skin.toFixed(1)}) < 0.5) edge = true;
    }
    vec2 nrm = -c / max(length(c), 1e-3);
    if (edge && length(c) > 1.5 && (nrm.x > 0.25 || nrm.y < -0.6)) nose = true;
  }
  if (inEar && nzHere < uGraze) {
    float z = zAt(p);
    for (int i = 0; i < 8; i++) {
      float a = float(i) * 0.7853982;
      vec2 o = floor(vec2(cos(a), sin(a)) * 1.5 + 0.5);
      if (abs(idAt(p + o) - id) > 0.5 || abs(idAt(p - o) - id) > 0.5 || abs(idAt(p + o * 3.0) - id) > 0.5) continue;
      float jump = zAt(p + o) - z, slope = abs(z - zAt(p - o));
      if (jump > uDepthK && jump > 6.0 * slope) nose = true;
    }
  }
  bool mouth = abs(id - ${PART_ID.Mouth.toFixed(1)}) < 0.5;
  vec2 none = vec2(-1.0);
  if (gl_FragCoord.x < 0.0) discard;
  gl_FragColor = vec4(bg ? p : none, ear ? p : none);
  #ifdef SECOND
  gl_FragColor = vec4(nose ? p : none, mouth ? p : none);
  #endif
}`;

const JFA_FRAG = /* glsl */ `
uniform sampler2D tSeed; uniform vec2 uRes; uniform float uStep; varying vec2 vUv;
void main(){
  vec2 p = floor(vUv * uRes) + 0.5;
  vec4 best = vec4(-1.0); vec2 bd = vec2(1e9);
  for (int j = -1; j <= 1; j++) for (int i = -1; i <= 1; i++) {
    vec2 q = p + vec2(float(i), float(j)) * uStep;
    if (q.x < 0.0 || q.y < 0.0 || q.x > uRes.x || q.y > uRes.y) continue;
    vec4 s = texture2D(tSeed, q / uRes);
    if (s.x >= 0.0) { float d = distance(p, s.xy); if (d < bd.x) { bd.x = d; best.xy = s.xy; } }
    if (s.z >= 0.0) { float d = distance(p, s.zw); if (d < bd.y) { bd.y = d; best.zw = s.zw; } }
  }
  gl_FragColor = best;
}`;

const COMP_FRAG = /* glsl */ `
uniform sampler2D tShaded, tId, tJ0, tJ1, tF2, tF3, tD, tDi; uniform vec2 uRes, uGrid; uniform float uGridStep;
uniform vec3 uPaper, uInk, uFlatSkin, uFlatHair, uFlatEye, uFlatBrow, uFlatMouth;
// line widths in px (0 = off): the band inside the silhouette, the ear's line, the nose's
// line (and the ear's fold), the mouth
uniform float uBand, uEarW, uNoseW, uMouthW;
// the morph field: uField of the way from the 3D ink to the field; uWarp how far the warp
// has carried both shapes; uBlend how far the field has gone from the drawing to the ink
uniform float uField, uWarp, uBlend;
// the ink's two layers (2026-10-11, "remove the ink from the face animations"): uLive3 the live
// 3D ink head (hair mass, band, ear / nose / mouth lines; 0 = never drawn), uInkA the drawing's
// own lines (the field), which fade out as the clay arrives
uniform float uLive3, uInkA;
// clean edges (noir, 2026-10-12): once fully developed, the silhouette is the shaded layer's own
// anti-aliased coverage; the id pass's binary silhouette (and the flat under-colour that fills
// to it) only fills the interior, one pixel in, so no flat-colour fringe rings the head
uniform float uEdgeAA;
// developing: inside the head, everything deeper than uDev px from the outline has taken its
// flat colour (and the ink has left it); deeper than uDevS, its shading
uniform float uDev, uDevS, uSoft;
uniform float uDebug, uClear;
varying vec2 vUv;
float dist(vec4 s, bool second, vec2 p){ vec2 q = second ? s.zw : s.xy; return q.x < 0.0 ? 1e4 : distance(p, q); }
float within(float d, float r){ return r <= 0.0 ? 0.0 : clamp(r - d + 0.5, 0.0, 1.0); }
// image px (y down) to texture coords
vec2 tuv(vec2 x){ return vec2(x.x / uRes.x, 1.0 - x.y / uRes.y); }
vec2 disp(sampler2D t, vec2 x){ return texture2D(t, vec2((x.x / uGridStep + 0.5) / uGrid.x, 1.0 - (x.y / uGridStep + 0.5) / uGrid.y)).rg; }
float field(vec2 y){
  // the drawing's point that the warp carries here, and the ink's point
  vec2 x2 = y, x3 = y;
  for (int i = 0; i < 6; i++) { x2 = y - uWarp * disp(tD, x2); x3 = y - (1.0 - uWarp) * disp(tDi, x3); }
  float f2 = texture2D(tF2, tuv(x2)).r, f3 = texture2D(tF3, tuv(x3)).r;
  return mix(f2, f3, uBlend);
}
void main(){
  vec2 p = floor(vUv * uRes) + 0.5;
  vec2 uv = vUv;
  vec2 pImg = vec2(vUv.x * uRes.x, (1.0 - vUv.y) * uRes.y);
  float id = texture2D(tId, uv).r;
  vec4 j0 = texture2D(tJ0, uv), j1 = texture2D(tJ1, uv);
  float dBg = dist(j0, false, p), dEar = dist(j0, true, p), dNose = dist(j1, false, p), dMouth = dist(j1, true, p);
  bool head = id > 0.5;
  bool isHair = abs(id - ${PART_ID.Hair.toFixed(1)}) < 0.5;
  bool isEar = abs(id - ${PART_ID.Ear.toFixed(1)}) < 0.5;
  bool isEye = abs(id - ${PART_ID.EyeL.toFixed(1)}) < 0.5 || abs(id - ${PART_ID.EyeR.toFixed(1)}) < 0.5;
  bool isBrow = abs(id - ${PART_ID.BrowL.toFixed(1)}) < 0.5 || abs(id - ${PART_ID.BrowR.toFixed(1)}) < 0.5;
  bool isMouth = abs(id - ${PART_ID.Mouth.toFixed(1)}) < 0.5;
  float band = head && !isEar ? within(dBg, uBand) : 0.0;
  float ear = within(dEar, uEarW * 0.5) * (head ? 1.0 : 0.0);
  float nose = within(dNose, uNoseW * 0.5);
  float mouth = within(dMouth, uMouthW * 0.5);
  if (uDebug > 2.5) { vec4 t = texture2D(tId, uv); gl_FragColor = vec4(t.b < 0.0 ? 0.0 : t.b, t.b < 0.0 ? 0.3 : 0.0, fract(t.g * 4.0), 1.0); return; }
  if (uDebug > 1.5) { gl_FragColor = vec4(isEye ? 1.0 : 0.0, isBrow ? 1.0 : 0.0, mouth, 1.0); return; }
  if (uDebug > 0.5) { gl_FragColor = vec4(max(isHair ? 1.0 : 0.0, band), ear, nose, 1.0); return; }
  // how far this pixel has developed (the front moves from deep inside out to the outline)
  // (the ear counts as outside for the band, so it measures its depth from its own rim, set
  // deeper so it develops with the cheek beside it)
  float depth = isEar ? dEar + 70.0 : dBg;
  // the ink leaves along a crisp front; the colour washes in softly just ahead of it (uSoft
  // px wide), so the front never reads as a grey halo and the distance's ridge never shows
  float inkDev = head ? clamp(depth - uDev + 0.5, 0.0, 1.0) : 0.0;
  float dev = head ? smoothstep(uDev - uSoft, uDev + 0.5, depth) : 0.0;
  float devS = head ? smoothstep(uDevS - uSoft, uDevS + 0.5, depth) : 0.0;
  // the 3D ink: the hair mass and the eyes and brows until developed, the lines by width
  float mass = (isHair || isEye || isBrow) ? 1.0 - inkDev : 0.0;
  float ink3 = max(max(mass, band * (1.0 - inkDev)), max(max(ear, nose), mouth));
  // the colour under it: paper, then flat part colours, then the clay
  vec3 flatC = isHair ? uFlatHair : isEye ? uFlatEye : isBrow ? uFlatBrow : isMouth ? uFlatMouth : uFlatSkin;
  vec4 sh = texture2D(tShaded, uv);
  vec3 shaded = sh.rgb + uPaper * (1.0 - sh.a); // premultiplied by the resolve
  vec3 col = mix(uPaper, flatC, dev);
  col = mix(col, shaded, devS);
  // the morph field (the drawing on its way to the ink), anti-aliased over a pixel
  float fInk = 0.0;
  if (uField > 0.0) fInk = clamp(0.5 - field(pImg), 0.0, 1.0);
  float ink = mix(ink3 * uLive3, fInk * uInkA, uField);
  col = mix(col, uInk, ink);
  if (uClear < 0.5) { gl_FragColor = vec4(col, 1.0); }
  else {
    // over a clear ground (the hero, 2026-10-11): the page shows through. Premultiplied
    // layers: the flat colours, the clay over them, the ink over both
    float devE = dev, devSE = devS;
    if (uEdgeAA > 0.5 && uDevS < -1.0) {
      float inner = 1.0;
      for (int j = -1; j <= 1; j++) for (int i = -1; i <= 1; i++) inner *= step(0.5, texture2D(tId, uv + vec2(float(i), float(j)) / uRes).r);
      devE = dev * inner;
      devSE = 1.0;
    }
    vec3 c0 = flatC * devE;
    vec3 c1 = mix(c0, sh.rgb + c0 * (1.0 - sh.a), devSE);
    float a1 = mix(devE, sh.a + devE * (1.0 - sh.a), devSE);
    float a = mix(a1, 1.0, ink);
    gl_FragColor = vec4(a > 0.0 ? mix(c1, uInk, ink) / a : vec3(0.0), a);
  }
  #include <colorspace_fragment>
  gl_FragColor.rgb *= gl_FragColor.a;
}`;

// clear: draw over a transparent ground (premultiplied) instead of the paper; ink: the
// line colour (any CSS colour), so the drawing keeps the page's own ink in both themes
export function createMorphRenderer({ canvas, src, fitSrc, clear = false, ink = "#17171a" }) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: false, alpha: clear, premultipliedAlpha: true, preserveDrawingBuffer: true });
  renderer.setPixelRatio(1);
  renderer.setSize(FW, FH, false);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  const rig = createFaceRig({ W: FW, H: FH, src, fitSrc });
  // the rigs on hand: clay (always), and noir once loaded (the click on the hero's head). Each
  // brings its own camera, light, textures and parts; frame() draws the current one
  const rigs = { clay: rig };
  let wear = rig;
  const FLATS = {
    clay: { uFlatSkin: "#f2dcc6", uFlatHair: "#4a2a1c", uFlatEye: "#171111", uFlatBrow: "#3b2016", uFlatMouth: "#d9ab90" },
    plast: { uFlatSkin: "#c98f66", uFlatHair: "#553626", uFlatEye: "#1b110d", uFlatBrow: "#2f1d14", uFlatMouth: "#b9704f" },
    noir: { uFlatSkin: "#6c6c6c", uFlatHair: "#1d1d1d", uFlatEye: "#0a0a0a", uFlatBrow: "#1a1a1a", uFlatMouth: "#474747" },
  };

  const rtShaded = new THREE.WebGLRenderTarget(FW, FH, { samples: 4, colorSpace: THREE.SRGBColorSpace });
  const fl = { type: THREE.FloatType, minFilter: THREE.NearestFilter, magFilter: THREE.NearestFilter, depthBuffer: false };
  const rtId = new THREE.WebGLRenderTarget(FW, FH, { ...fl, depthBuffer: true });
  const ping = [0, 1].map(() => [new THREE.WebGLRenderTarget(FW, FH, fl), new THREE.WebGLRenderTarget(FW, FH, fl)]);

  const quadScene = new THREE.Scene();
  const quadCam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
  const quad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2));
  quad.frustumCulled = false;
  quadScene.add(quad);
  const res = new THREE.Vector2(FW, FH);
  const seedMat = (second) => new THREE.ShaderMaterial({ vertexShader: QUAD_VERT, fragmentShader: SEED_FRAG, defines: second ? { SECOND: 1 } : {},
    uniforms: { tId: { value: rtId.texture }, uRes: { value: res }, uDepthK: { value: 0.04 }, uGraze: { value: 0.45 } } });
  const seeds = [seedMat(false), seedMat(true)];
  const jfa = new THREE.ShaderMaterial({ vertexShader: QUAD_VERT, fragmentShader: JFA_FRAG, uniforms: { tSeed: { value: null }, uRes: { value: res }, uStep: { value: 1 } } });

  const C = (h) => new THREE.Color(h);
  const comp = new THREE.ShaderMaterial({ vertexShader: QUAD_VERT, fragmentShader: COMP_FRAG,
    uniforms: { tShaded: { value: rtShaded.texture }, tId: { value: rtId.texture }, tJ0: { value: null }, tJ1: { value: null },
      tF2: { value: null }, tF3: { value: null }, tD: { value: null }, tDi: { value: null }, uGrid: { value: new THREE.Vector2(1, 1) }, uGridStep: { value: 4 },
      uField: { value: 0 }, uWarp: { value: 0 }, uBlend: { value: 0 }, uLive3: { value: 1 }, uInkA: { value: 1 }, uEdgeAA: { value: 0 }, uDev: { value: 1e4 }, uDevS: { value: 1e4 }, uSoft: { value: 70 },
      uRes: { value: res }, uPaper: { value: C("#ebebeb") }, uInk: { value: new THREE.Color().setStyle(ink) }, uClear: { value: clear ? 1 : 0 },
      uFlatSkin: { value: C("#f2dcc6") }, uFlatHair: { value: C("#4a2a1c") }, uFlatEye: { value: C("#171111") }, uFlatBrow: { value: C("#3b2016") }, uFlatMouth: { value: C("#d9ab90") },
      uBand: { value: 0 }, uEarW: { value: 0 }, uNoseW: { value: 0 }, uMouthW: { value: 0 },
      uDebug: { value: 0 } } });

  // the ids pass carries depth too: patch a rig's id materials once it loads
  const patchIds = (rig) => {
    for (const o of Object.values(rig.parts)) {
      if (!o.userData.mats) continue;
      const m = o.userData.mats.id;
      m.vertexShader = m.vertexShader.replace("varying vec3 vO;", "varying vec3 vO; varying float vDepth; varying float vNz;")
        .replace("gl_Position = projectionMatrix * modelViewMatrix * vec4(transformed, 1.0);",
          "vec4 mvp = modelViewMatrix * vec4(transformed, 1.0); vDepth = -mvp.z; vNz = normalize(normalMatrix * objectNormal).z; gl_Position = projectionMatrix * mvp;")
        .replace("#include <begin_vertex>", "#include <beginnormal_vertex>\n  #include <morphnormal_vertex>\n  #include <begin_vertex>");
      m.fragmentShader = ID_DEPTH_FRAG_PATCH(m.fragmentShader).replace("varying vec3 vO;", "varying vec3 vO; varying float vDepth; varying float vNz;");
      m.needsUpdate = true;
    }
    return rig;
  };
  const ready = rig.ready.then(() => patchIds(rig));

  const runQuad = (mat, target) => { quad.material = mat; renderer.setRenderTarget(target); renderer.render(quadScene, quadCam); };

  // render one frame: pose for the head, u for the blend uniforms
  let forceFields = false;
  const frame = (pose, u = {}) => {
    wear.pose(pose);
    wear.shaded(renderer, rtShaded);
    wear.ids(renderer, rtId);
    // The distance fields (seeds, then jump flooding: about 20 full-size passes) exist for the ink
    // lines (uLive3) and for the develop front that carries the colour in from the middle (uDev,
    // uDevS). Once the head is fully developed with no live ink (the hold, the emotes, the turn)
    // nothing reads them, and they are the bulk of a frame's GPU cost, so they are skipped there.
    // (The compositor keeps its last textures; with both fronts past the outline its depth test
    // is true wherever the field is non-negative.) setForceFields(true) turns the skip off.
    const val = (k) => (u[k] !== undefined ? u[k] : comp.uniforms[k].value);
    const fields = forceFields || !(val("uLive3") === 0 && val("uDev") < -1 && val("uDevS") < -1);
    if (fields) {
      // seeds then jump flooding, both seed textures together (32, 16, ... 1 px)
      for (let k = 0; k < 2; k++) runQuad(seeds[k], ping[k][0]);
      let cur = 0;
      for (let step = 256; step >= 1; step /= 2) {
        jfa.uniforms.uStep.value = step;
        for (let k = 0; k < 2; k++) { jfa.uniforms.tSeed.value = ping[k][cur].texture; runQuad(jfa, ping[k][1 - cur]); }
        cur = 1 - cur;
      }
      comp.uniforms.tJ0.value = ping[0][cur].texture;
      comp.uniforms.tJ1.value = ping[1][cur].texture;
    } else if (!comp.uniforms.tJ0.value) {
      comp.uniforms.tJ0.value = ping[0][0].texture;
      comp.uniforms.tJ1.value = ping[1][0].texture;
    }
    for (const k in u) if (comp.uniforms[k]) comp.uniforms[k].value = u[k];
    runQuad(comp, null);
  };
  // noir: the hatted head fitted to the noir tile (public/faces/face-noir.glb + fit-noir.json),
  // loaded on demand (7.5 MB). No id map; its raw skin (the GLB map, features in), clean skin
  // (inpainted) and margins (from its id pass) come from tools/face3d/morph/clean_skin.py
  let noirP = null;
  const loadNoir = () => (noirP ||= (() => {
    const r = createFaceRig({ W: FW, H: FH, src: "/faces/face-noir.glb", fitSrc: "/faces/fit-noir.json", idSrc: null, rawSrc: "/faces/skin-raw-noir.png", marginSrc: "/faces/margins-noir.png", cleanSrc: "/faces/skin-clean-noir.png", skinId: "noir", hat: true });
    rigs.noir = r;
    return r.ready.then(() => patchIds(r));
  })());
  // the soft clay (2026-10-20): drawn, not fitted; its hair is built in code (plastHair.js), so it has no
  // id map, raw skin or GLB hair. Same head, camera and emotes as clay
  let plastP = null;
  const loadPlast = () => (plastP ||= (() => {
    const r = createFaceRig({ W: FW, H: FH, idSrc: null, rawSrc: null, marginSrc: null, cleanSrc: null, skinId: "plast", hat: true, procedural: true, face: resolveFace(PRESETS["agam-clay"]) });
    rigs.plast = r;
    return r.ready.then(() => patchIds(r));
  })());
  // ---- every skin (2026-10-20): a public API for the click-cycle -------------------------------
  // The fitted skins (hose, cel, claySun, pixel, felt, stone, riso) are rigs of their own (their GLB,
  // fit, id map, raw skin and margins, the same files FaceSV wears); print is drawn on the head with
  // the face system; clay, noir and plast are above. A rig loads the first time it is asked for
  // (loadSkin), is kept while it is one of the few most recent, and is disposed after that (each holds
  // a few MB of geometry and several 1604x862 textures), so cycling all of them stays within budget.
  const skinLoads = {}, lru = [];
  const flatsOf = (id) => { const p = skinById(id).parts; return { uFlatSkin: p.Skin.base, uFlatHair: p.Hair.base, uFlatEye: p.Eye.base, uFlatBrow: p.Brow.base, uFlatMouth: p.Mouth.base }; };
  const loadSkin = (id) => {
    if (id === "clay") return Promise.resolve(rig);
    if (id === "noir") return loadNoir();
    if (id === "plast") return loadPlast();
    if (!SKIN_IDS.includes(id)) return Promise.reject(new Error("unknown skin " + id));
    return (skinLoads[id] ||= (() => {
      const r = createFaceRig(rigConfig(id, FW, FH));
      r.skinId = id;
      rigs[id] = r;
      return r.ready.then(() => patchIds(r)).then((rr) => {
        lru.push(id);
        // keep the base rigs and the three newest others; free the rest (never the one on stage)
        while (lru.length > 3) {
          const old = lru.shift();
          if (rigs[old] === wear) { lru.push(old); break; }
          rigs[old]?.dispose?.(); delete rigs[old]; delete skinLoads[old];
        }
        return rr;
      });
    })());
  };
  // wear a rig: its camera and parts, and its flat under-colours
  const setRig = (name) => {
    if (!rigs[name]) return false;
    wear = rigs[name];
    comp.uniforms.uEdgeAA.value = name === "noir" ? 1 : 0;
    const fl = FLATS[name] || flatsOf(name);
    for (const k in fl) comp.uniforms[k].value.set(fl[k]);
    const i = lru.indexOf(name); if (i >= 0) { lru.splice(i, 1); lru.push(name); }
    return true;
  };
  // the public API. listSkins(): [{ id, label }] in cycle order. setSkin(id, { transition }): loads the
  // skin if needed (never blocks the frame loop: the GLB and maps stream in while the current skin keeps
  // drawing), then swaps. With `transition` (a function) the swap is handed to it as `(swap) => ...` so the
  // caller can fire it at its own midpoint (HeroMorph's morph: u >= 0.5), light or dark; without, it swaps at once.
  // preloadNext(id): loads the skin after `id` when the browser is idle.
  const listSkins = () => SKIN_IDS.map((id) => ({ id, label: skinById(id).label || id }));
  const nextSkin = (id) => SKIN_IDS[(SKIN_IDS.indexOf(id) + 1) % SKIN_IDS.length];
  const setSkin = async (id, { transition } = {}) => {
    await loadSkin(id);
    const swap = () => setRig(id);
    if (typeof transition === "function") await transition(swap); else swap();
    return id;
  };
  const preloadNext = (id) => {
    const go = () => loadSkin(nextSkin(id)).catch(() => {});
    if (typeof requestIdleCallback === "function") requestIdleCallback(go, { timeout: 4000 }); else setTimeout(go, 800);
  };
  return { renderer, rig, ready, frame, comp, seeds, FW, FH, loadNoir, loadPlast, loadSkin, setSkin, listSkins, nextSkin, preloadNext, setRig, get rigs() { return rigs; },
    // the id pass of the current frame (R = part code, bottom-up rows), for the offline texture tools
    readIds: () => { const buf = new Float32Array(FW * FH * 4); renderer.readRenderTargetPixels(rtId, 0, 0, FW, FH, buf); return buf; },
    setForceFields: (v) => { forceFields = !!v; }, get rigName() { return wear === rigs.noir ? "noir" : wear === rigs.plast ? "plast" : wear.skinId || "clay"; } };
}
