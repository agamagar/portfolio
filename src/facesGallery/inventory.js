// Every face in the codebase, as plain data: { id, group, sub, name, kind, ... }.
//   kind "3d"   -> drawn by the one shared morph renderer ({ skin, face? }; face only for the face-system skin "plast")
//   kind "node" -> a legacy React component / image, shown as is (see LEGACY_RENDER in FacesPage)
// Public API only (core.js presets, morphRenderer SKIN_IDS, faceSkins labels).
import { PRESETS, complete } from "../figures/faces/features/core";
import { SKIN_IDS } from "../figures/faces/morph/morphRenderer";
import { skinById } from "../figures/faces/faceSkins";

export const GROUPS = [
  { id: "skins", label: "Skins", blurb: "One head, every look the hero can wear." },
  { id: "presets", label: "Presets", blurb: "Ready faces from the face system." },
  { id: "desi", label: "Desi-Log parts", blurb: "Skin tones, hair, headwear, beards and accessories on the soft-clay head." },
  { id: "legacy", label: "Legacy", blurb: "Older 2D, mascot and flat faces still in the repo." },
];

const label = (id) => (id === "plast" ? "Clay, soft (face system)" : skinById(id)?.label || id);
const title = (s) => s.replace(/(^|[-_ ])(\w)/g, (_, a, b) => (a ? " " : "") + b.toUpperCase());
const SMILE = { mouth: { smile: 0.3 } };
const merge = (...parts) => parts.reduce((a, p) => { for (const k in p) a[k] = { ...(a[k] || {}), ...p[k] }; return a; }, {});
const BASE = merge({ skin: { tone: 0.45 }, hair: { style: "crop" } }, SMILE);

const skins = SKIN_IDS.map((id) => ({ id: "skin-" + id, group: "skins", name: label(id), kind: "3d", skin: id, face: id === "plast" ? PRESETS["agam-clay"] : undefined }));

const presets = Object.keys(PRESETS).filter((k) => !k.startsWith("desi-")).map((k) => ({ id: "preset-" + k, group: "presets", name: title(k), kind: "3d", skin: "plast", face: PRESETS[k] }));

const part = (sub, key, name, cfg) => ({ id: `desi-${sub}-${key}`, group: "desi", sub, name, kind: "3d", skin: "plast", face: merge(BASE, cfg) });
const TONES = [0, 0.14, 0.28, 0.42, 0.56, 0.7, 0.84, 1];
const HAIR = ["bald", "balding", "bob", "boy-cut", "braid", "bun", "crop", "curly", "gelled", "long-straight", "mohawk", "shoulder-messy"];
const desi = [
  ...desiPresets().map(([k, cfg]) => ({ id: "desi-archetype-" + k, group: "desi", sub: "Archetypes", name: title(k.replace(/^desi-/, "")), kind: "3d", skin: "plast", face: cfg })),
  ...TONES.map((t, i) => part("Skin tones", "tone" + i, `Tone ${i + 1}`, { skin: { tone: t } })),
  ...HAIR.map((h) => part("Hair", h, title(h), { hair: { style: h } })),
  ...[["turban", "Turban", "#b2483e"], ["taqiyah", "Prayer cap", "#f1ede4"], ["hijab", "Hijab", "#5f9e6e"], ["dupatta", "Dupatta", "#d6568a"]]
    .map(([k, n, c]) => part("Headwear", k, n, { hair: { style: "bald" }, headwear: { kind: k, color: c } })),
  ...[["stubble", "Stubble"], ["moustache", "Moustache"], ["goatee", "Goatee"], ["full", "Full beard"]]
    .map(([k, n]) => part("Facial hair", k, n, { facialHair: { kind: k, followHair: false, color: "#2a211c" } })),
  ...[["round", "Round glasses"], ["square", "Square glasses"]].map(([k, n]) => part("Accessories", "glasses-" + k, n, { accessories: { glasses: k } })),
  part("Accessories", "bindi", "Bindi", { accessories: { bindi: true } }),
  part("Accessories", "tilak", "Tilak", { accessories: { tilak: true } }),
  part("Accessories", "hoops", "Hoop earrings", { accessories: { earrings: "hoops" } }),
  part("Accessories", "studs", "Stud earrings", { accessories: { earrings: "studs" } }),
  part("Accessories", "nosepin", "Nose pin", { accessories: { nosePin: "1" } }),
];

function desiPresets() { return Object.entries(PRESETS).filter(([k]) => k.startsWith("desi-")); }

// older faces: the 2D SVG head (figures/faces/Face.jsx), the pixel and illustrated mascots (/mascot), flat SVGs in public/
const legacy = [
  { id: "legacy-face2d", group: "legacy", name: "2D clay head (SVG filters)", kind: "node", node: "face2d" },
  { id: "legacy-pixel", group: "legacy", name: "Pixel mascot", kind: "node", node: "pixel" },
  { id: "legacy-illustrated", group: "legacy", name: "Illustrated mascot", kind: "node", node: "illustrated" },
  { id: "legacy-avatar", group: "legacy", name: "Avatar (flat)", kind: "node", node: "img", src: "/avatar.svg" },
  { id: "legacy-wave", group: "legacy", name: "Face wave (flat)", kind: "node", node: "img", src: "/face-wave.svg" },
];

export const ENTRIES = [...skins, ...presets, ...desi, ...legacy];
export const fullFace = (e) => complete(e.face || {});
