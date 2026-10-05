// Zepto campaign tiles: the group's specs, COMPOSED from the recipe rather than
// stored. Every copy-paste block on the page, the picker's live output and the
// master template are all produced by zeptoCampaignRecipe.compose(), so a change
// to one clause in zeptoCampaignViews.js rewrites all of them at once.
import { RULES_TOKEN } from "../rules.js";
import { SPECS } from "./zeptoCampaign.data.js";
import {
  zeptoCampaignRecipe,
  STYLES,
  SUBJECTS,
  COLORWAYS,
  REFERENCES,
  COMPACT_LIMIT,
  USE,
  LIGHT,
  PALETTE,
  RENDER,
} from "./zeptoCampaignViews.js";

// Sources is pulled out so it can be re-added LAST: a duplicate key in an object
// literal keeps its first position, so spreading and re-stating it would not move it.
const { Sources, ...system } = SPECS.find((s) => s.id === "pl-zepto-campaign-system");

const { compose } = zeptoCampaignRecipe;

// One written-out tile each, compact register, defaults chosen so the six read as
// one campaign: the field tile is the anchor the prose tells you to generate first.
const TILE_DEFAULTS = [
  { style: "field", subject: "bananas", colorway: "violet" },
  { style: "crate-macro", subject: "mangoes", colorway: "violet" },
  { style: "texture", subject: "tomatoes", colorway: "violet" },
  { style: "corner-peek", subject: "strawberries", colorway: "aubergine" },
  { style: "street-sign", subject: "coriander", colorway: "violet" },
  { style: "phone-in-hand", subject: "grocery-bag", colorway: "violet" },
];

const tileSpec = {
  id: "pl-zepto-campaign-tiles",
  group: "Zepto campaign tiles",
  eyebrow: "Zepto",
  title: "The six tiles · written out",
  summary: `One ready block per tile in the compact register (each under ${COMPACT_LIMIT} characters, for Figma's GPT Image 2 prompt field), with subjects and colorways chosen so the six read as one campaign set. Generate the colour-field packshot first, then switch the reference dial to anchor mode in the picker above and attach that render while generating the rest.`,
  ...Object.fromEntries(
    TILE_DEFAULTS.map((d) => {
      const st = STYLES.find((s) => s.key === d.style);
      return [
        st.label,
        { pre: compose({ ...d, reference: "none", length: "compact" }) },
      ];
    })
  ),
};

// The master template. Composed from the same constants, with the dials left as
// bracketed slots and their option lists spelled out beneath.
const options = (items, get) => items.map(get).join(" | ");

const template = [
  USE,
  "[REFERENCE]",
  "[TILE]",
  LIGHT,
  PALETTE,
  RENDER,
  RULES_TOKEN,
].join(" ");

const templateBlock = {
  pre: [
    template,
    "",
    `[TILE] is the scene and subject, one pair per tile type. ${STYLES.map((s) => `${s.label}: ${s.blurb}`).join(" ")} Compose the scene clause from the tile's staging, the chosen [COLORWAY] on every manufactured surface, and the chosen [SUBJECT] cue.`,
    "",
    `[SUBJECT] options (shape-only cues): ${options(SUBJECTS.filter((s) => s.key !== "custom"), (s) => s.cue)}. Or describe your own subject by its shape alone.`,
    "",
    `[COLORWAY] options: ${options(COLORWAYS, (c) => `${c.desc} (${c.color})`)}.`,
    "",
    "",
    `[REFERENCE]: leave empty to work from words alone; attach the set's anchor tile and open with: ${REFERENCES.find((r) => r.key === "anchor").full} Or, for the lifestyle scenes, attach one real moodboard photograph and open with: ${REFERENCES.find((r) => r.key === "moodboard").full}`,
    "",
    "Consistency tip: generate the colour-field packshot first, then anchor every other tile to that render. Re-anchor to the same tile each time rather than chaining outputs, and change one dial at a time.",
  ].join("\n"),
};

export const zeptoCampaignSpecs = [
  {
    ...system,
    "Pick a combination": { builder: "zepto-campaign" },
    "Copy-paste template": templateBlock,
    "Converging on the look": zeptoCampaignRecipe.tokens,
    Sources,
  },
  tileSpec,
];
