// Camera views: the group's specs, COMPOSED from the recipe rather than stored.
//
// Every copy-paste block on the page, the picker's live output and the master
// template are produced by cameraRecipe.compose(), so a change to one clause in
// cameraViews.js rewrites all of them at once.
import { RULES_TOKEN } from "../rules.js";
import { SPECS } from "./camera.data.js";
import {
  cameraRecipe,
  HEIGHTS,
  ORBITS,
  DISTANCES,
  LENSES,
  ROLLS,
  STYLES,
  PRESETS,
  COMPACT_LIMIT,
  PRESERVE,
  SCOPED_RULES,
} from "./cameraViews.js";

const { Sources, ...system } = SPECS.find((s) => s.id === "pl-camera-views-system");
const { compose } = cameraRecipe;

// The neutral pick every ladder is walked from: three-quarter, medium, 50mm, level,
// match the source, compact. One dial moves per ladder, which is the rule the prose
// gives for shooting a set.
const BASE = { height: "eye", orbit: "tql", distance: "medium", lens: "normal50", roll: "level", style: "match", subject: "image", what: "", length: "compact" };
const ladder = (items, dial, fixed = {}) =>
  Object.fromEntries(items.map((it) => [it.label, { pre: compose({ ...BASE, ...fixed, [dial]: it.key }) }]));

const heightSpec = {
  id: "pl-camera-views-heights",
  group: "Camera views",
  eyebrow: "Camera views",
  title: "The height ladder · thirteen vertical angles",
  summary: `Every height written out with the other dials held at the base pick (three-quarter left, medium shot, 50mm, level, match the source), compact register, each under ${COMPACT_LIMIT} characters. Top-down to worm's-eye, with the shoulder / hip / knee body heights between. Attach the reference image beside any of these.`,
  ...ladder(HEIGHTS, "height"),
};

const orbitSpec = {
  id: "pl-camera-views-orbits",
  group: "Camera views",
  eyebrow: "Camera views",
  title: "The orbit ring · eight sides",
  summary:
    "Every orbit at eye level, medium shot, 50mm, level, match the source, compact register: the turnaround. Front first, then round through the three-quarters and profiles to the rear. Generate the side nearest the reference first and attach that render for the rest.",
  ...ladder(ORBITS, "orbit", { height: "eye" }),
};

const distanceSpec = {
  id: "pl-camera-views-distances",
  group: "Camera views",
  eyebrow: "Camera views",
  title: "Shot sizes · six distances",
  summary:
    "Every distance at eye level, three-quarter left, 50mm, level, match the source, compact register. Extreme close-up through to extreme wide; the macro lens is named in the extreme close-up.",
  ...ladder(DISTANCES, "distance"),
};

const lensSpec = {
  id: "pl-camera-views-lenses",
  group: "Camera views",
  eyebrow: "Camera views",
  title: "Lenses · five ways to draw the same spot",
  summary:
    "Every lens at eye level, three-quarter left, medium shot, level, match the source, compact register. Each clause pairs the focal length with its working distance, because distance sets the perspective and the lens only crops it; orthographic is the no-perspective option for plans and isometrics.",
  ...ladder(LENSES, "lens"),
};

const presetSpec = {
  id: "pl-camera-views-presets",
  group: "Camera views",
  eyebrow: "Camera views",
  title: "The presets · twelve named set-ups",
  summary:
    "The set-ups a product photographer or a storyboard artist asks for by name, each written out in the compact register with match the source. Packshot 45, straight-on, flat lay, low hero, knee-level walk-up, drone overhead, profile, rear three-quarter, worm's-eye, macro detail, plan view and isometric.",
  ...Object.fromEntries(
    PRESETS.map((p) => [p.label, { pre: compose({ ...BASE, ...p.pick }) }])
  ),
};

// The master template: the constants with the dials left as bracketed slots.
const options = (items, get) => items.map(get).join(" | ");
const template = [
  "Using the attached image of [SUBJECT] as the reference, re-render the same subject from a new camera position.",
  "[HEIGHT].",
  "[ORBIT].",
  "[DISTANCE].",
  "[LENS].",
  "[ROLL].",
  "[TREATMENT]",
  PRESERVE,
  RULES_TOKEN,
].join(" ");

const templateBlock = {
  pre: [
    template,
    "",
    `[HEIGHT] options: ${options(HEIGHTS, (h) => h.view)}`,
    "",
    `[ORBIT] options: ${options(ORBITS, (o) => o.orbit)}`,
    "",
    `[DISTANCE] options: ${options(DISTANCES, (d) => d.dist)}`,
    "",
    `[LENS] options: ${options(LENSES, (l) => l.lens)}`,
    "",
    `[ROLL] options: ${options(ROLLS, (r) => r.roll)}`,
    "",
    `[TREATMENT] options: ${STYLES.map((s) => `${s.label}: ${s.treatment}`).join("\n\n")}`,
    "",
    `When the treatment keeps the subject's own printing (match the source, studio packshot), the rules at the end are scoped instead of global: ${SCOPED_RULES}`,
    "",
    "To work without an image, replace the opening sentence with: [SUBJECT], photographed from a specified camera position. Drop the preserve sentence.",
  ].join("\n"),
};

export const cameraSpecs = [
  {
    ...system,
    "Pick a view": { builder: "camera-views" },
    "Copy-paste template": templateBlock,
    "Converging on the look": cameraRecipe.tokens,
    Sources,
  },
  presetSpec,
  heightSpec,
  orbitSpec,
  distanceSpec,
  lensSpec,
];
