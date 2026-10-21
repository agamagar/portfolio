// THE TASTE DATA. Everything tunable lives here; index.js only interprets it. RULES.md says why each is there.

// rule weights (sum 1): how much each rule moves the 0-100 score
export const WEIGHTS = { proportion: 0.2, compatibility: 0.15, silhouette: 0.14, colour: 0.14, expression: 0.15, material: 0.09, distinct: 0.13 };

// proportion targets. band = free zone either side of the ideal, soft = how far beyond it the penalty reaches 1
export const PROPORTION = {
  eyeSpacing: { faceWidthGain: 0.35, band: 0.4, soft: 0.5, weight: 1 },   // ideal spacing follows face width (jaw, cheeks)
  eyeMouth: { mouthPerEye: 0.5, band: 0.65, soft: 0.6, weight: 1 },       // mouth width ~ half the eye size, either side
  noseMouth: { mouthPerNose: 0.5, band: 0.6, soft: 0.6, weight: 0.8 },
  hairMass: { lo: 0.3, hi: 0.78, soft: 0.35, weight: 1 },
  browClearance: { minGap: -0.5, soft: 0.5, weight: 0.8 },                 // brow height - eye height
};
// declarative feature clashes. when = every [path, op, value] must hold. fix = the edit that cures it
export const CLASHES = [
  { id: "angry-read", penalty: 0.6, when: [["brows.angle", ">", 0.35], ["eyes.openness", "<", -0.35], ["mouth.smile", "<", 0.2]],
    because: "A heavy, angled brow over narrowed eyes reads angry", fix: [{ path: "brows.angle", to: 0.1 }, { path: "eyes.openness", to: -0.1 }] },
  { id: "menace-grin", penalty: 0.5, when: [["brows.angle", ">", 0.5], ["mouth.smile", ">", 0.5]],
    because: "A stern brow over a big grin reads menacing, not friendly", fix: [{ path: "brows.angle", to: 0.15 }] },
  { id: "startled", penalty: 0.4, when: [["eyes.openness", ">", 0.5], ["brows.height", "<", -0.4]],
    because: "Wide eyes under low brows look startled and uneasy", fix: [{ path: "brows.height", to: 0 }] },
  { id: "hidden-eyes", penalty: 0.5, when: [["hair.fringe", ">", 0.85], ["eyes.size", "<", -0.2], ["eyes.openness", "<", -0.4]],
    because: "A full fringe swallows small, narrowed eyes", fix: [{ path: "hair.fringe", to: 0.6 }] },
  { id: "square-point", penalty: 0.3, when: [["cheeks.jaw", ">", 0.55], ["cheeks.chin", "<", -0.45]],
    because: "A wide jaw with a pointed chin pulls the face in two directions", fix: [{ path: "cheeks.chin", to: 0 }] },
  { id: "nose-over-mouth", penalty: 0.35, when: [["nose.width", ">", 0.5], ["mouth.width", "<", -0.4]],
    because: "A broad nose over a tiny mouth throws the lower face off balance", fix: [{ path: "mouth.width", to: 0 }] },
  { id: "squint-no-smile", penalty: 0.5, when: [["eyes.smileSquint", ">", 0.3], ["mouth.smile", "<", -0.15]],
    because: "The smile-squint needs a smile; with a frown it reads as a wince", fix: [{ path: "eyes.smileSquint", to: 0 }] },
  { id: "hair-buries", penalty: 0.3, when: [["hair.volume", ">", 1.18], ["hair.length", ">", 0.85]],
    because: "Big volume and full length bury the face", fix: [{ path: "hair.volume", to: 1.05 }] },
  { id: "tiny-wide", penalty: 0.35, when: [["eyes.spacing", ">", 0.45], ["eyes.size", "<", -0.3]],
    because: "Tiny, wide-set eyes read vacant", fix: [{ path: "eyes.spacing", to: 0.1 }] },
  { id: "brow-eye-clash", penalty: 0.3, when: [["brows.height", "<", -0.45], ["eyes.height", ">", 0.3]],
    because: "Brows sinking onto eyes that sit high leaves no room between them", fix: [{ path: "brows.height", to: -0.1 }] },
];
// small-size legibility (favicon / avatar). minContrastL = CIE L* gap hair vs skin
export const SILHOUETTE = { hairSkinL: 25, mouthSkinL: 8, eyeLegible: 0.3, mouthLegible: 0.15, weights: { hair: 1.2, eyes: 1, mouth: 0.7 } };
// colour: how saturated a hair colour may be, per material (stylised looks allow more)
export const COLOUR = {
  hairSatMax: { default: 0.55, riso: 1, stone: 0.4, pixel: 0.8, print: 0.7, hose: 0.6, cel: 0.7 },
  accent: { clip: "#b9a2e0", riso: "#e0368f" }, accentNearMiss: [8, 38], eyeLMax: 0.34, browHairL: [-14, 40], lipHueMax: 45, lipSkinL: 8,
};
// expression: channels in -1..1 (positive = warm). Disagreement among them is the penalty
export const EXPRESSION = { disagree: 0.55, soft: 0.6, weights: { mouth: 1, eyes: 0.7, brows: 0.7 } };
// material fit: per material the ranges its look wants. [path, lo, hi, weight, why]
export const MATERIAL_FIT = {
  clay: [],
  claySun: [["cheeks.fullness", -0.2, 1, 0.5, "sun-baked clay wants soft cheeks"]],
  felt: [["cheeks.fullness", 0, 1, 1, "felt is round and soft, it wants full cheeks"], ["hair.messiness", 0.15, 1, 0.5, "felt hair reads fuzzy, tidy strands look wrong"], ["cheeks.jaw", -0.7, 0.3, 0.6, "felt can't hold a hard jaw"]],
  stone: [["cheeks.jaw", -0.3, 1, 0.8, "stone is carved: it needs a defined jaw"], ["hair.messiness", 0, 0.5, 0.8, "carved hair can't be messy"], ["mouth.parted", 0, 0.12, 0.6, "a stone mouth stays closed"]],
  pixel: [["eyes.size", 0, 1, 1, "at pixel scale small eyes vanish"], ["hair.messiness", 0, 0.5, 0.5, "noisy hair turns to mush in pixels"], ["mouth.smile", 0.1, 1, 0.5, "pixel mouths need a clear curve"]],
  riso: [["brows.angle", -0.5, 0.5, 0.4, "riso prints best with simple brows"], ["hair.messiness", 0.1, 1, 0.5, "riso hair wants a hand-cut edge"]],
  hose: [["mouth.smile", 0.1, 1, 0.8, "rubber hose is cheerful"], ["eyes.size", 0.05, 1, 0.8, "rubber hose has big eyes"]],
  cel: [["brows.height", -0.3, 1, 0.4, "cel brows read best clear of the eyes"], ["eyes.size", -0.2, 1, 0.5, "cel eyes are drawn bold"]],
  print: [["hair.messiness", 0.1, 1, 0.5, "the print look likes loose hair"], ["brows.angle", -0.6, 0.6, 0.3, "the print look takes strong brows"]],
};
// distinctiveness: mean normalised distance to the nearest reference face. Under `near` is a near-duplicate
export const DISTINCT = { near: 0.06, far: 0.2, categorical: 1.4 };
// how hard the overall score punishes a failed rule (1 = plain weighted geometric mean)
export const AGGREGATE = { sharpness: 2.2 };

// ---- positive examples: agam-clay (features/presets/agam-clay.json) and one face per hand-tuned skin ----
export const AGAM_CLAY = {
  material: { kind: "clay", grain: 0.6, warmth: 0.65 }, skin: { tone: 0.46, blush: 0.6 },
  hair: { style: "shoulder-messy", color: "#4a2f21", clip: true, seed: 7 },
  eyes: { openness: -0.5, smileSquint: 0.35, size: 0.05, spacing: 0 }, brows: { height: -0.15, angle: 0.1 },
  nose: { width: -0.1, tip: 0.1 }, mouth: { width: 0.1, smile: 0.45 }, cheeks: { fullness: 0.45, jaw: -0.45, chin: 0.5 },
};
// hand-tuned skin exemplars: the same face the morph renderer wears for each skin (hair crop, smile 0.3), lightly
// tuned per medium so each reads as its look is meant to
const skinFace = (kind, extra = {}) => ({ material: { kind }, hair: { style: "crop", fringe: 0.5, clip: false, color: "#3a2418" }, mouth: { smile: 0.3 }, ...extra });
export const SKIN_EXEMPLARS = Object.fromEntries(MATERIAL_ORDER().map((k) => [k, skinFace(k, EXEMPLAR_TWEAKS(k))]));
function MATERIAL_ORDER() { return ["hose", "cel", "claySun", "pixel", "felt", "stone", "riso", "print"]; }
function EXEMPLAR_TWEAKS(k) {
  return ({
    hose: { eyes: { size: 0.3 }, mouth: { smile: 0.5, width: 0.2 } }, cel: { eyes: { size: 0.15 }, brows: { height: 0.05 } },
    claySun: { cheeks: { fullness: 0.25 } }, pixel: { eyes: { size: 0.25 }, hair: { style: "crop", messiness: 0.3, fringe: 0.5, clip: false, color: "#3a2418" } },
    felt: { cheeks: { fullness: 0.4, jaw: -0.2 }, hair: { style: "bob", clip: false, color: "#3a2418" } },
    stone: { cheeks: { jaw: 0.2 }, hair: { style: "crop", messiness: 0.2, fringe: 0.4, clip: false, color: "#5a4a3c" }, mouth: { smile: 0.15 } },
    riso: { hair: { style: "bob", messiness: 0.4, clip: false, color: "#151414" } }, print: { hair: { style: "shoulder-messy", clip: false, color: "#3a2418" } },
  })[k];
}
export const REFERENCES = { "agam-clay": AGAM_CLAY, neutral: {}, ...SKIN_EXEMPLARS };

// ---- skin palettes (copied from faceSkins.js; the check script fails when they drift) ----
export const SKIN_COLOURS = {
  noir: { skin: "#d9d9d9", mouth: "#5c5c5c" }, hose: { skin: "#fbdcae", mouth: "#1a1410" }, cel: { skin: "#f3c9a3", mouth: "#a4503f" },
  claySun: { skin: "#ecc4a2", mouth: "#d3a07f" }, pixel: { skin: "#f8d39f", mouth: "#7c3b22" }, felt: { skin: "#f4d6bb", mouth: "#9c3b33" },
  stone: { skin: "#ece6da", mouth: "#d9d1c3" }, riso: { skin: "#e9e5de", mouth: "#2a2826" }, print: { skin: "#f7c7a6", mouth: "#9a3a2b" },
};
// the soft clay's skin tone slider: six anchors light to deep (features/modules/skin.js)
export const TONE_ANCHORS = ["#f6dfc9", "#e8bf9a", "#d29c72", "#b57a52", "#8a5638", "#5e3a27"];

// ---- curated pairings: what goes well with what ----
export const PAIRINGS = {
  // hair colours that sit well on a skin-tone band (tone 0..1 split in three)
  hairBySkinBand: {
    light: ["#2a1810", "#4a2f21", "#6e4b32", "#9a6a3c", "#c9a36a", "#151414"],
    mid: ["#1b110d", "#2a1810", "#4a2f21", "#7a4a2a", "#a0522d", "#151414"],
    deep: ["#0f0a08", "#1b110d", "#2a1810", "#4a2f21", "#6a3b24", "#2b3a55"],
  },
  hairByMaterial: {
    clay: ["shoulder-messy", "bob", "crop", "long-straight"], claySun: ["shoulder-messy", "bob", "crop"], felt: ["bob", "shoulder-messy"],
    stone: ["crop", "long-straight", "bob"], pixel: ["crop", "bob"], riso: ["bob", "crop", "shoulder-messy"],
    hose: ["crop", "bob"], cel: ["crop", "shoulder-messy", "long-straight"], print: ["shoulder-messy", "crop", "long-straight"],
  },
  // hair style -> brows and mouth that suit it
  byHairStyle: {
    "shoulder-messy": { "brows.height": [-0.2, 0.1], "mouth.smile": [0.2, 0.6] }, bob: { "brows.height": [-0.1, 0.25], "brows.arch": [0, 0.4] },
    crop: { "brows.height": [-0.1, 0.3], "cheeks.jaw": [-0.2, 0.4] }, "long-straight": { "brows.arch": [0, 0.4], "mouth.smile": [0, 0.4] },
  },
  // expression -> materials that carry it
  emoteMaterials: { grin: ["hose", "cel", "clay", "pixel"], think: ["clay", "stone", "print"], surprised: ["hose", "cel", "print"], sad: ["clay", "felt", "stone"], angry: ["print", "cel", "riso"], laugh: ["hose", "felt", "clay"], shy: ["clay", "felt", "claySun"] },
};
