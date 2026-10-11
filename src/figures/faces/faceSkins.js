// The face's skins (2026-10-08): one model (public/faces/face.glb), one shader, many looks.
// The nine reference tiles (tools/face-styles/ref/) plus the Spider-Verse print. A skin is
// a shading mode, a palette per part, an outline, a background, and (pixel only) a lower
// render resolution. Everything else (rig, emotes, bounce) is shared, so switching a skin
// mid-bounce is just a uniform change.
//
// Props (Hat, HatBand, Pin) are hidden unless a skin lists them in `props`; `keys` holds
// shape-key weights a skin always wears (noir: hatCompress, the hair pressed under the hat).
// Parts: Skin (and the lids), Hair, Eye, Brow, Mouth, MouthInner. Each gets base (lit),
// shade (turning away) and deep (core shadow). `spec` is the gloss on that part.

const P = (base, shade, deep, spec = 0) => ({ base, shade, deep, spec });

export const MODES = { print: 0, clay: 1, noir: 2, hose: 3, cel: 4, clayRough: 5, pixel: 6, felt: 7, stone: 8, riso: 9, fit: 10 };

export const SKINS = [
  {
    // "fit": the lighting and surface colour recovered from the reference image itself
    // (tools/face3d/fit: spherical-harmonic light per part, baked AO, an albedo texture)
    id: "clay", label: "Clay", mode: "fit", bg: "#ebebeb",
    parts: {
      Skin: P("#f6dfc9", "#e3c2a6", "#c39d80", 0.12), Hair: P("#4c2a1c", "#33190f", "#1f0e08", 0.35),
      Eye: P("#171111", "#171111", "#0b0808", 1), Brow: P("#3b2016", "#2a160e", "#1b0d08", 0.1),
      // the mouth is a crease pressed into the clay: skin colour, in shadow
      Mouth: P("#dcae92", "#c08f74", "#9a6c55", 0.1), MouthInner: P("#5a1e18", "#43150f", "#2c0c08"),
    },
    outline: null,
  },
  {
    id: "noir", label: "Noir", mode: "noir", bg: "#121212",
    parts: {
      Skin: P("#d9d9d9", "#7c7c7c", "#262626", 0.15), Hair: P("#4a4a4a", "#222222", "#0b0b0b", 0.5),
      Eye: P("#0a0a0a", "#0a0a0a", "#050505", 1), Brow: P("#2a2a2a", "#1b1b1b", "#0c0c0c"),
      Mouth: P("#5c5c5c", "#3c3c3c", "#1e1e1e"), MouthInner: P("#141414", "#0c0c0c", "#060606"),
      Hat: P("#3a3a3a", "#1c1c1c", "#080808", 0.2), HatBand: P("#101010", "#080808", "#030303"),
    },
    props: ["Hat", "HatBand"], keys: { hatCompress: 1 },
    // its own fitted rig (tools/face3d/fit/noir): the head under a fedora fitted to the noir
    // tile, with that tile's light and surface; the rain behind and the coat collar in
    // front are flat layers cut from the tile. Until the rig loads, the mode above draws it.
    rig: { src: "/faces/face-noir.glb", fit: "/faces/fit-noir.json", plates: { back: "/faces/noir-back.webp", front: "/faces/noir-coat.webp" }, rain: true },
    outline: null,
  },
  {
    id: "hose", label: "Rubber hose", mode: "hose", bg: "#f6e6bf",
    parts: {
      Skin: P("#fbdcae", "#efc38e", "#e2ad78"), Hair: P("#7c3414", "#5d230b", "#45190a"),
      Eye: P("#1a1410", "#1a1410", "#1a1410"), Brow: P("#1a1410", "#1a1410", "#1a1410"),
      Mouth: P("#1a1410", "#1a1410", "#1a1410"), MouthInner: P("#7a1e14", "#5c140c", "#3c0c06"),
    },
    outline: { ink: "#1a1410", width: 3.4, small: 1.8 },
  },
  {
    id: "cel", label: "Cel", mode: "cel", bg: "#4ea4e6",
    parts: {
      Skin: P("#f3c9a3", "#d69b78", "#b97c5c"), Hair: P("#6e3b1f", "#41200f", "#2a1409", 1),
      Eye: P("#24160f", "#24160f", "#24160f", 1), Brow: P("#3f2416", "#2c180e", "#2c180e"),
      Mouth: P("#a4503f", "#83392b", "#83392b"), MouthInner: P("#5a1e18", "#43150f", "#2c0c08"),
    },
    outline: { ink: "#3a2116", width: 1.7, small: 1.1 },
  },
  {
    id: "claySun", label: "Clay, sun", mode: "clayRough", bg: "#e3a722",
    parts: {
      Skin: P("#ecc4a2", "#d3a17e", "#ad7c5c", 0.08), Hair: P("#4b2515", "#33180c", "#211007", 0.25),
      Eye: P("#150f0d", "#150f0d", "#0a0706", 1), Brow: P("#33190f", "#24110a", "#170a05"),
      Mouth: P("#d3a07f", "#b78364", "#8d5f47", 0.1), MouthInner: P("#561b15", "#40130e", "#2a0b07"),
    },
    outline: null,
  },
  {
    id: "pixel", label: "Pixel", mode: "pixel", bg: "#0f1c4f", pixel: 0.2,
    parts: {
      Skin: P("#f8d39f", "#dca06c", "#a96b43"), Hair: P("#79401f", "#512910", "#311608"),
      Eye: P("#1e120a", "#1e120a", "#1e120a"), Brow: P("#3b2010", "#3b2010", "#3b2010"),
      Mouth: P("#7c3b22", "#7c3b22", "#5a2814"), MouthInner: P("#4a1a10", "#3a120a", "#2a0c06"),
    },
    outline: { ink: "#2a1608", width: 1, small: 0.6 },
  },
  {
    id: "felt", label: "Felt", mode: "felt", bg: "#d52a20",
    parts: {
      Skin: P("#f4d6bb", "#ddb697", "#b88f71"), Hair: P("#55241a", "#3c1810", "#260e08"),
      Eye: P("#120d0c", "#120d0c", "#070505", 1), Brow: P("#3b1d12", "#2a140c", "#1a0b06"),
      Mouth: P("#9c3b33", "#7d2c25", "#5a1d17"), MouthInner: P("#4f1712", "#3a100c", "#250806"),
    },
    // its own fitted rig (tools/face3d/fit/felt): the clay form re-fitted to the felt tile
    // (knit.png), with that tile's camera, light and surface (its raw skin, margins and id
    // map as clay has them); the red backdrop with the head painted out sits behind.
    rig: { src: "/faces/face-felt.glb", fit: "/faces/fit-felt.json", idmap: "/faces/idmap-felt.png", raw: "/faces/skin-raw-felt.png",
      margins: "/faces/margins-felt.png", plates: { back: "/faces/felt-back.webp" } },
    outline: null,
  },
  {
    id: "stone", label: "Stone", mode: "stone", bg: "#1f4a32",
    parts: {
      Skin: P("#ece6da", "#bdb4a5", "#857c6e"), Hair: P("#e4ddd0", "#b3aa9b", "#7c7366"),
      Eye: P("#cfc7b8", "#a59c8d", "#6f675b"), Brow: P("#ddd6c9", "#aea595", "#777064"),
      Mouth: P("#d9d1c3", "#aaa192", "#726a5e"), MouthInner: P("#8a8174", "#6c6458", "#4c463d"),
    },
    outline: null,
  },
  {
    id: "riso", label: "Riso", mode: "riso", bg: "#cdc9c2",
    parts: {
      Skin: P("#e9e5de", "#9a958e", "#3b3835"), Hair: P("#e0368f", "#b8206f", "#7c1049"),
      Eye: P("#151414", "#151414", "#151414"), Brow: P("#1d1c1b", "#1d1c1b", "#1d1c1b"),
      Mouth: P("#2a2826", "#2a2826", "#2a2826"), MouthInner: P("#2a2826", "#2a2826", "#2a2826"),
      Pin: P("#1b1a19", "#1b1a19", "#1b1a19"),
    },
    props: ["Pin"],
    outline: { ink: "#1b1a19", width: 1.4, small: 1, misreg: "#e0368f" },
  },
  {
    id: "print", label: "Spider-Verse", mode: "print", bg: "#f4efe4",
    parts: {
      Skin: P("#f7c7a6", "#d98f74", "#a65a4c"), Hair: P("#6b3622", "#3f1d13", "#22100b"),
      Eye: P("#1d1412", "#1d1412", "#1d1412"), Brow: P("#4a2618", "#2f170e", "#1b0d08"),
      Mouth: P("#9a3a2b", "#6e2419", "#4a150e"), MouthInner: P("#4a1410", "#3a0e0b", "#240706"),
    },
    outline: { ink: "#1b1414", width: 2.6, small: 1.4, misreg: "#e0368f" },
  },
];

export const skinById = (id) => SKINS.find((s) => s.id === id) || SKINS[0];

// which palette entry a mesh uses (lids are skin)
export const PROPS = ["Hat", "HatBand", "Pin"];
export const partKey = (name) =>
  name.startsWith("Eye") ? "Eye" : name.startsWith("Brow") ? "Brow" : ["Hair", "Mouth", "MouthInner", ...PROPS].includes(name) ? name : "Skin";

// ---- shaders --------------------------------------------------------------------
// the morph chunks let the shape keys (glTF morph targets) bend position and normal;
// vP (object space, morphed) feeds the procedural textures, so grain sticks to the head
export const VERT = /* glsl */ `
#include <common>
#include <morphtarget_pars_vertex>
#include <color_pars_vertex>
// how squarely this point faced the fitted camera at rest (the reference only shows those)
uniform mat3 uRestNM;
// the turnaround atlas's UVs (fit mode, Skin and Hair only)
attribute vec2 _mvuv;
varying vec3 vN; varying vec3 vV; varying vec3 vP; varying vec3 vMV; varying vec2 vUv; varying float vSeen; varying vec2 vMvUv;
void main(){
  #include <color_vertex>
  vUv = uv;
  vMvUv = _mvuv;
  vSeen = normalize(uRestNM * normal).z;
  #include <beginnormal_vertex>
  #include <morphinstance_vertex>
  #include <morphnormal_vertex>
  #include <begin_vertex>
  #include <morphtarget_vertex>
  vec4 mv = modelViewMatrix * vec4(transformed,1.0);
  vN = normalize(normalMatrix * objectNormal);
  vV = normalize(-mv.xyz);
  vMV = mv.xyz;
  vP = (modelMatrix * vec4(transformed,1.0)).xyz;
  gl_Position = projectionMatrix * mv;
}`;

export const FRAG = /* glsl */ `
uniform vec3 uBase, uShade, uDeep, uL, uMisreg; uniform float uDot, uMode, uSpec, uIsHair;
uniform vec3 uSH[9], uTint; uniform float uK, uUseMap, uIsEye, uFloor, uTexScale, uTexGamma; uniform sampler2D uMap;
// a lid is lit with the face's normal round its eye (uFlat of the way), so a blink reads as flush skin
uniform vec3 uFlatN, uRatioMean; uniform float uFlat, uTurn;
uniform sampler2D uMapRaw, uMargin; uniform float uHasRaw; uniform vec3 uActs;
// which part the reference shows at each pixel (id = part * 2 + layer + 1), and who this is
uniform sampler2D uIdMap; uniform float uPartId, uLayered; uniform vec2 uIdRes;
// the surface colour from every side: an albedo atlas baked from the turnaround views (tools/face3d/fit/mv)
uniform sampler2D uMV; uniform float uHasMV;
#include <color_pars_fragment>
varying vec3 vN; varying vec3 vV; varying vec3 vP; varying vec3 vMV; varying vec2 vUv; varying float vSeen; varying vec2 vMvUv;
// the fitted light: 9 spherical-harmonic terms of the view-space normal (radiance, linear)
vec3 shEval(vec3 n){
  return uSH[0] * 0.282095 + uSH[1] * 0.488603 * n.y + uSH[2] * 0.488603 * n.z + uSH[3] * 0.488603 * n.x
       + uSH[4] * 1.092548 * n.x * n.y + uSH[5] * 1.092548 * n.y * n.z + uSH[6] * 0.315392 * (3.0 * n.z * n.z - 1.0)
       + uSH[7] * 1.092548 * n.x * n.z + uSH[8] * 0.546274 * (n.x * n.x - n.y * n.y);
}

float hash(vec3 p){ p = fract(p * 0.3183099 + 0.1); p *= 17.0; return fract(p.x * p.y * p.z * (p.x + p.y + p.z)); }
float noise(vec3 x){
  vec3 i = floor(x), f = fract(x); f = f * f * (3.0 - 2.0 * f);
  return mix(mix(mix(hash(i), hash(i + vec3(1,0,0)), f.x), mix(hash(i + vec3(0,1,0)), hash(i + vec3(1,1,0)), f.x), f.y),
             mix(mix(hash(i + vec3(0,0,1)), hash(i + vec3(1,0,1)), f.x), mix(hash(i + vec3(0,1,1)), hash(i + vec3(1,1,1)), f.x), f.y), f.z);
}
float fbm(vec3 p){ return 0.5 * noise(p) + 0.25 * noise(p * 2.03) + 0.125 * noise(p * 4.01); }
float halftone(vec2 p, float cell, float amount){
  mat2 r = mat2(0.7071,-0.7071,0.7071,0.7071);
  vec2 q = r * p / cell; vec2 f = fract(q) - 0.5;
  return step(length(f), amount * 0.62);
}
float lum(vec3 c){ return dot(c, vec3(0.299, 0.587, 0.114)); }
// soft three-tone ramp: deep -> shade -> base over the wrapped light w (0..1)
vec3 ramp(float w, float soft){
  vec3 c = mix(uDeep, uShade, smoothstep(0.12 - soft, 0.12 + soft, w));
  return mix(c, uBase, smoothstep(0.5 - soft, 0.5 + soft, w));
}

void main(){
  vec3 n = normalize(vN); vec3 l = normalize(uL); vec3 v = normalize(vV);
  vec3 h = normalize(l + v);
  float d = dot(n, l);
  float w = d * 0.5 + 0.5;
  float fres = 1.0 - max(dot(n, v), 0.0);
  int m = int(uMode + 0.5);
  vec3 col;

  if (m == 10) {
    // fitted to the reference: its own light (SH), its own soft shadow (AO^k), its own
    // surface colour (the albedo-ratio texture, stored x0.25 so 1.0 = 4x)
    float ao = 1.0;
    #if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA )
      ao = vColor.r;   // baked ambient occlusion
    #endif
    // the UVs are projected from the fitted camera (skin and hair in two depth layers)
    // (a darker fit, noir, stores (ratio / scale) ^ (1 / gamma) so near-black parts keep their tones)
    vec3 ratio = uUseMap > 0.5 ? pow(texture2D(uMap, vUv).rgb, vec3(uTexGamma)) * uTexScale : vec3(1.0);
    if (uHasRaw > 0.5) {
      // the skin at rest is the reference's own (features baked in); a feature's margin fades
      // to the clean skin while that feature moves
      vec2 suv = vUv;
      if (uLayered > 0.5) suv.x = vUv.x * 2.0 - step(0.5, vUv.x);
      float moving = clamp(dot(texture2D(uMargin, suv).rgb, uActs), 0.0, 1.0);
      vec3 raw = pow(texture2D(uMapRaw, vUv).rgb, vec3(uTexGamma)) * uTexScale;
      ratio = mix(raw, ratio, moving);
    }
    // surface the reference never showed (it faced away at rest, revealed by a turn): the
    // fitted light on a neutral surface (ratio 1) instead of a smeared texture
    // was this very surface what the reference showed at this spot? (a shadow-map style test
    // against the reference camera, softened over the 3x3 pixels around it)
    float seen = 1.0;
    if (uPartId >= 0.0) {
      float layer = 0.0; vec2 puv = vUv;
      if (uLayered > 0.5) { layer = step(0.5, vUv.x); puv.x = vUv.x * 2.0 - layer; }
      float want = uPartId * 2.0 + layer + 1.0, hits = 0.0;
      for (int i = -1; i <= 1; i++) for (int j = -1; j <= 1; j++) {
        float idv = floor(texture2D(uIdMap, puv + vec2(float(i), float(j)) / uIdRes).r * 255.0 + 0.5);
        hits += step(abs(idv - want), 0.5);
      }
      seen = hits / 9.0;
    }
    // where it wasn't, use the part's local colour: a heavily blurred (mip) read of its own
    // texture, so a turn reveals plausible surface with no seam against the textured part
    vec3 local = uUseMap > 0.5 ? pow(texture2D(uMap, vUv, 5.0).rgb, vec3(uTexGamma)) * uTexScale : vec3(1.0);
    // well round the back (it faced away at rest), the projected UVs land on the face's own
    // pixels, so take the part's overall colour (the texture's smallest mip) instead
    // (the part's median colour from the fit; without one, the texture's smallest mip)
    vec3 whole = uRatioMean.x > 0.0 ? uRatioMean
      : uUseMap > 0.5 ? pow(texture2D(uMap, vUv, 12.0).rgb, vec3(uTexGamma)) * uTexScale : vec3(1.0);
    local = mix(whole, local, smoothstep(0.0, 0.3, vSeen)); // hidden and facing away (the nose's underside): the part's colour, not a blur of its neighbours
    // with the turnaround atlas, the surface's own colour from the views that saw it: wherever
    // the reference never saw it, and everywhere once the head has turned away (at rest, a
    // fragment on the edge of what the reference saw keeps the blend above, so the drawing's
    // own view is untouched)
    if (uHasMV > 0.5) {
      vec3 mvc = pow(texture2D(uMV, vMvUv).rgb, vec3(uTexGamma)) * uTexScale;
      local = mix(mvc, local, step(0.01, seen) * (1.0 - uTurn));
    }
    // and only trust it where the surface faced the camera squarely: an edge-on sliver at rest
    // would stretch into streaks once the head turns
    // turned away from the fitted pose, surfaces that were edge-on at rest fade to plain clay too
    float turnGate = mix(1.0, smoothstep(0.3, 0.75, vSeen), uTurn);
    ratio = mix(local, ratio, smoothstep(0.05, 0.35, seen) * smoothstep(0.0, 0.2, vSeen) * turnGate);
    // the light never drops below a floor (the texture maker uses the same one), so a
    // grazing edge keeps its colour instead of clipping to black
    vec3 nl = uFlat > 0.0 ? normalize(mix(n, uFlatN, uFlat)) : n;
    col = max(max(shEval(nl), 0.0) * pow(max(ao, 1e-3), uK), vec3(uFloor)) * ratio * uTint;
    if (uIsEye > 0.5 && uUseMap < 0.5) {
      // a glossy bead (when there is no fitted texture): the dark base and a sharp window highlight up and to the left
      col = uBase + vec3(1.0) * pow(max(dot(n, normalize(vec3(-0.45, 0.6, 0.75))), 0.0), 220.0) * 1.6;
    }
  } else if (m == 0) {
    // the Spider-Verse print: three hard bands, a dot screen in the mid, hatching in the shadow
    if (d > 0.42) col = uBase;
    else if (d > -0.08) col = mix(uBase, uShade, halftone(gl_FragCoord.xy, uDot, 0.35 + 0.65 * smoothstep(0.42, -0.08, d)));
    else {
      float k = smoothstep(-0.08, -0.7, d);
      col = mix(uShade, uDeep, step(0.78 - 0.35 * k, fract((gl_FragCoord.x + gl_FragCoord.y) / (uDot * 0.9))));
    }
    col = mix(col, vec3(1.0, 0.97, 0.92), step(0.62, pow(fres, 3.0)) * step(0.0, d) * 0.85);
  } else if (m == 1 || m == 5) {
    // clay: soft wrapped light, a waxy sheen, a fine grain (sun clay: coarser, with tool marks)
    col = ramp(w, 0.28);
    float g = m == 1 ? fbm(vP * 38.0) : fbm(vP * 26.0) + 0.12 * sin(fbm(vP * 5.0) * 30.0);
    col *= (m == 1 ? 0.97 : 0.95) + (m == 1 ? 0.05 : 0.08) * g;
    col += uSpec * pow(max(dot(n, h), 0.0), mix(18.0, 90.0, step(0.9, uSpec))) * 0.55;
    col *= 1.0 - 0.18 * pow(fres, 2.5);
  } else if (m == 2) {
    // noir: one hard key from the side, the rest falls into black; a cold rim and film grain
    float k = smoothstep(0.05, 0.22, d);
    col = mix(uDeep, uBase, k);
    col = mix(col, uShade, (1.0 - k) * smoothstep(-0.35, 0.05, d) * 0.6);
    col += uSpec * pow(max(dot(n, h), 0.0), 60.0) * 0.6;
    col += vec3(0.75) * step(0.55, pow(fres, 2.5)) * step(-0.2, d) * 0.6;
    col = vec3(lum(col));
    col += (hash(vec3(floor(gl_FragCoord.xy), 3.0)) - 0.5) * 0.018;
  } else if (m == 3) {
    // rubber hose: flat ink fills; one shadow shape on the turned-away side, no gradients
    col = mix(uShade, uBase, step(-0.25, d));
  } else if (m == 4) {
    // cel: one hard shadow line, a crisp highlight; the hair gets the anime sheen band
    col = mix(uShade, uBase, step(0.08, d));
    float s = pow(max(dot(n, h), 0.0), 40.0);
    if (uIsHair > 0.5) {
      // one crisp sheen shape on each lock, cut where the half-vector meets the surface
      float band = step(0.965, dot(n, h) + 0.02 * (noise(vP * 14.0) - 0.5));
      col = mix(col, mix(uBase, vec3(1.0, 0.86, 0.72), 0.5), band);
    } else col = mix(col, vec3(1.0), step(0.6, s) * uSpec);
    col = mix(col, uDeep, step(0.5, pow(fres, 3.0)) * step(d, 0.08) * 0.5);
  } else if (m == 6) {
    // pixel: posterised to the three palette tones (the canvas is drawn small, then
    // scaled up hard-edged); an ordered dither on the band edges
    float dith = (mod(floor(gl_FragCoord.x) + floor(gl_FragCoord.y), 2.0) - 0.5) * 0.12;
    float t = d + dith;
    col = t > 0.3 ? uBase : t > -0.15 ? uShade : uDeep;
    if (uSpec > 0.5 && dot(n, h) > 0.9) col = vec3(1.0);
  } else if (m == 7) {
    // felt: soft light through fibre; high-frequency fuzz, lighter fuzz on the silhouette
    col = ramp(w, 0.35);
    float fib = fbm(vP * vec3(140.0, 160.0, 150.0));
    col *= 0.86 + 0.24 * fib;
    col = mix(col, uBase * 1.12, smoothstep(0.55, 0.95, fres) * 0.5);
    // running stitch a little in from every edge: a pale thread, dashed along the surface
    float seam = smoothstep(0.66, 0.7, fres) * (1.0 - smoothstep(0.74, 0.78, fres));
    float dash = step(0.45, fract((vP.x * 0.6 + vP.y + vP.z * 0.8) * 9.0));
    col = mix(col, mix(uBase, vec3(1.0, 0.95, 0.88), 0.55), seam * dash * 0.85);
    col += uSpec * pow(max(dot(n, h), 0.0), 80.0) * 0.5;
  } else if (m == 8) {
    // stone: chiselled. The normal is half the mesh's, half the flat facet of the pixel
    // (screen-space derivatives), roughened with noise; then plain diffuse light
    vec3 fn = normalize(cross(dFdx(vMV), dFdy(vMV)));
    vec3 nn = normalize(mix(n, fn, 0.55) + (vec3(fbm(vP * 9.0), fbm(vP * 9.0 + 7.1), fbm(vP * 9.0 + 3.7)) - 0.5) * 0.5);
    float sd = dot(nn, l) * 0.5 + 0.5;
    col = ramp(sd, 0.3);
    col *= 0.9 + 0.16 * fbm(vP * 30.0);
    col *= 1.0 - 0.25 * pow(fres, 3.0);
  } else {
    // riso: one ink colour per part, laid as a coarse dot screen on the paper; the
    // darker the light, the bigger the dot; ink parts print solid
    float tone = 1.0 - w;
    float dots = halftone(gl_FragCoord.xy, uDot * 0.8, 0.25 + 0.95 * tone);
    vec3 paper = vec3(0.91, 0.9, 0.87);
    vec3 ink = uIsHair > 0.5 ? uBase : uDeep;
    col = mix(paper, ink, dots);
    if (uIsHair > 0.5) col = mix(mix(paper, uBase, 0.85), uDeep, dots * 0.8);
    if (distance(uBase, uDeep) < 0.02) col = uDeep; // ink parts (eyes, brows, lips) print solid
    col *= 0.94 + 0.08 * hash(vec3(floor(gl_FragCoord.xy / 2.0), 1.0));
  }
  gl_FragColor = vec4(col, 1.0);
  #include <colorspace_fragment>
}`;

// the outline: the mesh pushed out along its normals, in clip space so the line keeps a
// constant pixel width, with a slow wobble in width like a brush pen
export const OUT_VERT = /* glsl */ `
#include <common>
#include <morphtarget_pars_vertex>
uniform float uWidth; uniform vec2 uRes, uShift;
void main(){
  #include <beginnormal_vertex>
  #include <morphinstance_vertex>
  #include <morphnormal_vertex>
  #include <begin_vertex>
  #include <morphtarget_vertex>
  vec4 clip = projectionMatrix * modelViewMatrix * vec4(transformed,1.0);
  vec3 nView = normalize(normalMatrix * objectNormal);
  vec2 dir = normalize(nView.xy + 1e-5);
  float wob = 0.75 + 0.5 * sin(position.y * 23.0 + position.x * 17.0);
  clip.xy += dir * uWidth * wob * 2.0 / uRes * clip.w;
  clip.xy += uShift * 2.0 / uRes * clip.w;
  gl_Position = clip;
}`;
export const OUT_FRAG = /* glsl */ `uniform vec3 uColor; void main(){ gl_FragColor = vec4(uColor,1.0);
  #include <colorspace_fragment>
}`;
