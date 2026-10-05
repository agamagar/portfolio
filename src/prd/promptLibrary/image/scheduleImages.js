// Schedule images: the group's specs, COMPOSED from the recipe rather than
// stored. The picker's live output, the written-out scene catalog and the master
// template all come from scheduleImagesRecipe.compose().
import { RULES_TOKEN } from "../rules.js";
import { SPECS } from "./scheduleImages.data.js";
import {
  scheduleImagesRecipe,
  SCENES,
  ANGLES,
  PEOPLE,
  OBJECTS,
  COLORWAYS,
  REFERENCES,
  COMPACT_LIMIT,
  FACELESS,
  DEFAULT_LOOK,
} from "./scheduleImagesViews.js";

const { Sources, ...system } = SPECS.find((s) => s.id === "pl-schedule-images-system");
const { compose } = scheduleImagesRecipe;

// One written-out block per scene, compact, scene's own angle, violet case,
// words only, so only the scene moves between blocks.
const sceneSpec = {
  id: "pl-schedule-images-scenes",
  group: "Schedule images",
  eyebrow: "Zepto",
  title: "The scenes · written out",
  summary: `One ready block per scene in the compact register (each under ${COMPACT_LIMIT} characters, for Figma's GPT Image 2 prompt field), each on its own camera angle, violet case, no objects, words only. For a real photograph attached, switch the picker's reference dial to moodboard mode; for the rest of a set, anchor to the best output.`,
  ...Object.fromEntries(
    SCENES.map((sc) => [
      sc.label,
      {
        pre: compose({
          look: DEFAULT_LOOK.key,
          scene: sc.key,
          angle: "own",
          colorway: "violet",
          reference: "none",
          length: "compact",
        }),
      },
    ])
  ),
};

const options = (items, get) => items.map(get).join(" | ");

// The template is written in the default look; the other look swaps its four
// constants (use, light, lens, finish) and reads the scene's `sun` clause instead.
const template = [DEFAULT_LOOK.use, "[REFERENCE]", "[CAMERA]", "[FRAME]", "[PEOPLE]", FACELESS, "[PHONE]", "[OBJECTS]", DEFAULT_LOOK.light, "[SOURCE]", DEFAULT_LOOK.lens, DEFAULT_LOOK.finish, RULES_TOKEN].join(" ");

const templateBlock = {
  pre: [
    template,
    "",
    `[CAMERA], [FRAME] and [SOURCE] come from the scene: ${SCENES.map((s) => `${s.label}, ${s.blurb}`).join(" ")}`,
    "",
    `[CAMERA] can instead be one of the board's angles: ${options(ANGLES.filter((a) => a.key !== "own"), (a) => `${a.label}: ${a.full}`)}`,
    "",
    `[PEOPLE]: leave empty for the scene's one person, or add: ${options(PEOPLE.filter((x) => x.key !== "one" && x.key !== "none"), (x) => `${x.label}: ${x.full}`)} Or, for an objects-only still, replace [FRAME], [PEOPLE] and [PHONE] with the crate: a stackable plastic delivery crate in the colorway, perforated walls and a thick rounded rim, packed above the brim with the picked objects, sitting where the scene keeps things, camera close and slightly above, nobody in frame and no phone.`,
    "",
    `[PHONE]: a generic slab phone, small in frame, its case in the chosen colorway (${options(COLORWAYS, (c) => `${c.desc} ${c.color}`)}), its screen one flat field of the contrasting brand colour, no icons, no text; the UI is set over it in Figma.`,
    "",
    `[OBJECTS]: leave empty (the goods are not there yet), or place up to six from the assortment where the scene keeps them, as the goods from the last order: ${options(OBJECTS, (o) => o.cue)}.`,
    "",
    `[REFERENCE]: leave empty to work from words alone; attach one real moodboard photograph and open with: ${REFERENCES.find((r) => r.key === "moodboard").full} Or, for the rest of a set, attach the best output and open with: ${REFERENCES.find((r) => r.key === "anchor").full}`,
    "",
    "Two settings, no overlap. PEOPLE = scene, camera, how many people: posture, clothes, room, light source. OBJECT = the phone's case colour and up to six goods: the only things in the frame that carry brand colour or product. The light system, the faceless rule and the finish never change. Change one dial at a time.",
  ].join("\n"),
};

// Agam (2026-08-16): "only keep the Pick a combination section, hide all others."
// The prose, the template and the scene catalog stay authored here and in
// scheduleImages.data.js (they are the system's record and its sources) but the
// page renders the picker alone. Flip HIDE_PROSE to show them again.
const HIDE_PROSE = true;

const { summary, group, eyebrow, id, title } = system;

export const scheduleImagesSpecs = HIDE_PROSE
  ? [{ id, group, eyebrow, title, summary, "Pick a combination": { builder: "schedule-images" } }]
  : [
      {
        ...system,
        "Pick a combination": { builder: "schedule-images" },
        "Copy-paste template": templateBlock,
        "Converging on the look": scheduleImagesRecipe.tokens,
        Sources,
      },
      sceneSpec,
    ];
