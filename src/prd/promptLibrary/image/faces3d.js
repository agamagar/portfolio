// 3D faces: the group's specs, COMPOSED from the recipe rather than stored.
//
// Every copy-paste block on the page, the picker's live output, and the master
// template are all produced by faces3dRecipe.compose(), so a change to one clause in
// faces3dViews.js rewrites all of them at once. Airplane views had to promise this and
// leave it to a build script; here there is no frozen text to drift from.
import { RULES_TOKEN } from "../rules.js";
import { SPECS } from "./faces3d.data.js";
import {
  faces3dRecipe,
  ANGLES,
  EXPRESSIONS,
  BACKDROPS,
  STYLES,
  COMPACT_LIMIT,
  SUBJECT_PHOTO,
  BASE_FORM,
  CROP,
  ACCESSORIES,
  RENDER,
} from "./faces3dViews.js";

// Sources is pulled out so it can be re-added LAST: a duplicate key in an object
// literal keeps its first position, so spreading and re-stating it would not move it.
const { Sources, ...system } = SPECS.find((s) => s.id === "pl-3d-faces-system");

const { compose } = faces3dRecipe;

// One catalog spec per material: the six angles written out, expression and backdrop
// held fixed so the set reads as one character (which is what the prose advises).
export const SET_BACKDROP = {
  pastel: "cream",
  clay: "blush",
  vinyl: "powder",
  plaster: "cream",
  grotesque: "powder",
};

const angleSpecs = STYLES.map((s) => {
  const backdrop = SET_BACKDROP[s.key];
  const bd = BACKDROPS.find((b) => b.key === backdrop);
  const blocks = Object.fromEntries(
    ANGLES.map((a) => [
      a.label,
      { pre: compose({ style: s.key, angle: a.key, expression: "neutral", backdrop, length: "compact" }) },
    ])
  );
  return {
    id: `pl-3d-faces-${s.key}`,
    group: "3D faces",
    eyebrow: "3D faces",
    title: `${s.label} · six angles`,
    summary: `${s.blurb} The full turnaround, written out for all six angles in the compact register (each under ${COMPACT_LIMIT} characters, ready for Figma's GPT Image 2 prompt field) with the expression held at neutral and the backdrop held at ${bd.label} (${bd.color}), so the set reads as one character. Attach the reference photograph alongside any of these. Change the expression, the backdrop or switch to the full register in the picker above.`,
    ...blocks,
  };
});

// The expression dial, written out once in the reference material at the front angle,
// so the six readings can be compared side by side without the angle also moving.
const expressionSpec = {
  id: "pl-3d-faces-expressions",
  group: "3D faces",
  eyebrow: "3D faces",
  title: "The seven expressions",
  summary:
    "The expression dial written out at the front angle in the pastel toy material on the cream backdrop, compact register, so the seven readings can be compared with nothing else moving. Each is described as mouth and brow rather than eyes, so it still reads through the flat near-black lenses of the reference eyewear.",
  ...Object.fromEntries(
    EXPRESSIONS.map((e) => [
      e.label,
      { pre: compose({ style: "pastel", angle: "front", expression: e.key, backdrop: "cream", length: "compact" }) },
    ])
  ),
};

// The master template. Composed from the same constants, with the dials left as
// bracketed slots and their option lists spelled out beneath.
const options = (items, get) => items.map(get).join(" | ");

const template = [
  SUBJECT_PHOTO,
  BASE_FORM,
  "[ANGLE].",
  "[EXPRESSION].",
  CROP,
  "[MATERIAL]",
  ACCESSORIES,
  "[LIGHT]",
  "The background is one single flat field of [BACKDROP]: a solid unbroken colour with no gradient, no texture, no floor, no horizon line, no wall, no props and no environment, only the faintest darkening toward the corners of the frame.",
  RENDER,
  RULES_TOKEN,
].join(" ");

const templateBlock = {
  pre: [
    template,
    "",
    `[ANGLE] options: ${options(ANGLES, (a) => a.proj)}.`,
    "",
    `[EXPRESSION] options: ${options(EXPRESSIONS, (e) => e.face)}.`,
    "",
    `[BACKDROP] options: ${options(BACKDROPS, (b) => `${b.desc} (${b.color})`)}.`,
    "",
    `[MATERIAL] and [LIGHT] travel together, one pair per material. ${STYLES.map(
      (s) =>
        `${s.label}: ${s.material} ${s.light}${
          s.subjectPhoto
            ? ` (This material also replaces the opening sculpt sentence, the crop, the accessory clause and the render clause of the template, because it is a painting and not a 3D render. Opening: ${s.subjectPhoto} Crop: ${s.crop} Accessories: ${s.accessories} Finish: ${s.render})`
            : ""
        }`
    ).join("\n\n")}`,
    "",
    "To work without a photograph, replace the opening sentence with: A stylised 3D character head of [SUBJECT]. Simplify rather than copy: proportions smoothed and gently idealised, features rounded and slightly enlarged, small detail removed, the way a skilled character artist sculpts a recognisable head.",
    "",
    "Consistency tip: generate the front angle first, then attach BOTH the photograph and that render as references for the other angles, keeping the material and the backdrop fixed.",
  ].join("\n"),
};

export const faces3dSpecs = [
  {
    ...system,
    "Pick a combination": { builder: "faces-3d" },
    "Copy-paste template": templateBlock,
    "Converging on the look": faces3dRecipe.tokens,
    Sources,
  },
  ...angleSpecs,
  expressionSpec,
];
