// Team illustrations: the group's specs, COMPOSED from the recipe in teamViews.js
// rather than stored. Every block on the page, the picker's live output and the
// template all come from teamRecipe.compose(), so a change to one clause (or a
// retune of the line, glass or toy system the recipe reads) rewrites all of them.
import { RULES_TOKEN } from "../rules.js";
import { teamRecipe, TEAMS, MODES, STYLES, STYLE_META, SETTINGS, COMPACT_LIMIT, LINE_CONSTANT, VARIETY, keepColour } from "./teamViews.js";

const { compose } = teamRecipe;
const GROUP = "Team illustrations";

const systemSpec = {
  id: "pl-team-illustrations-system",
  eyebrow: GROUP,
  title: "Team illustrations, the system",
  summary:
    "The seven teams Agam collaborated with, each drawn as an object or as one of three characters, through seven looks: the portfolio's thin line in isometric or flat mode, Zepto's clear glass, Away's soft 3D toy, Zepto's own banner illustration language, a dreamy airbrushed glow, and a brick-built model with minifigures. One recipe, five dials, every prompt composed live.",
  "Build one": { builder: "team-illustrations" },
  "What this is": [
    "Five dials: team (seven), mode (object, character, or scene), character (three per team, character mode only), setting and the teams in it (scene mode only), style (isometric line, flat line, glass, toy, Zepto illustration, dreamy glow, brick-built) and length. Full is the register that ships: the proven Away prompts run about 2,000 characters on Nano Banana 2, and neither it nor GPT Image 2 caps anywhere near 1,000. Compact exists only for a client that does.",
    "Every subject is written the Away way: one sentence naming a real object or a real person in real clothes, with its material, its colour and one characterful detail, ending in a noun. Styles that own their palette (line, glass, dreamy) strip the colour words; toy and Zepto keep them.",
    "Four of the looks are the library's own systems, read from their catalogs at assembly and never retyped: retune one of them and every prompt here re-renders. The fifth, Zepto illustration, is the house banner language read off the finished Zepto banners and the character sheets.",
    "Character mode adds one short clause per style saying how a person is simplified in that medium (proportion, face, hands), sourced in research/characters.md. The difference between a team's three people is written into their sentences (a bob, a beard, glasses, a rounder or taller build), never asked for as a set rule inside a single prompt.",
  ],
  "The objects": TEAMS.map((t) => `${t.label}: ${keepColour(t.object)}.`),
  "The characters": TEAMS.map((t) => `${t.label}: ${t.characters.map((c) => `${c.label}: ${keepColour(c.cue)}`).join(". ")}.`),
  "Generating a team's three": VARIETY,
  "The settings": SETTINGS.map((st) => `${st.label}: ${keepColour(st.stage)}.`),
  "Scene mode": [
    "Pick a setting and the teams in it; every character of each chosen team appears, all three per team, twenty-one people when all seven are in, each with their own scene line (look, prop and action at their own station), grouped by team in the prompt, and the style's figure clause applies to everyone.",
    "Scenes ship in the full register only: seven vignettes and a setting cannot fit a 1,000-character cap, and the proven prompts never obeyed one.",
    "The composition clause turns the style's single-hero rule into a compact diorama (or, for the Zepto look, a wide banner) with every figure at the same scale and nothing overlapping.",
  ],
  "The styles": STYLE_META.map((s) => `${s.label}: ${s.blurb}`),
  "How to use it in Figma": [
    "Pick the style that matches the surface: line for the portfolio's own chrome, glass for Zepto work, toy for Away work.",
    "Generate the object first, then the three characters of the same team in the same style, feeding the first good result back as a style reference so the four hold together.",
    "The catalogs below are the full register. Run the Away globe icon as a control in the same session: if the control is good and a team prompt is not, the subject is still wrong; if both are bad, the session is.",
  ],
  "Copy-paste template": {
    pre: `[FORMAT ANCHOR of the chosen style, e.g. "A single clean, stylized 3D-rendered miniature icon."] [SUBJECT: one sentence, a real object or a real person in real clothes, with its material, its colour and one characterful detail, ending in a noun: "..., a delivery rider."] [FIGURE CLAUSE for the chosen style, character mode only] [STYLE CONSTANT, verbatim from the chosen system] ${RULES_TOKEN}`,
  },
  Sources: [
    "Style constants: the Portfolio line icons system, the Zepto premium glass icons and the Away icon system in this library, each already retuned against research/icons.md and research/models.md; the compact twins condense the same claims.",
    "Dreamy glow: two reference paintings of glowing lemons with a small black cat, described in craft terms per research/dreamy.md (27 sources; the living artist is never named, since OpenAI refuses that).",
    "Brick-built: research/lego.md (46 sources, anchored on the LEGO Group's 2013 Brand Manual minifigure drawing and its 2016 Moulding Colour Palette): stud, brick, plate and slope geometry, the minifigure's exact measurements, and the official colour names and IDs every braced colour word is swapped for. The brand word itself never appears in a prompt.",
    "Character constants and the variety clause: research/characters.md. The Zepto illustration style is read off the finished Zepto marketing banners (peach ground, swept strokes, light rays, glow halos, floating props) and its character constant off the Zepto illustration library (Claude/Prompt Library/refs/zepto-illustration-library): Sections 7 to 9 for the rider poses and props, sheets 9 to 13 for the figure and its five-head proportion, sheets 8, 14 to 16 for the face parts, hair variants, beard and glasses, sheets 2 to 7 for the prop set.",
    "Subjects: chosen from what each function works with per research/teams/, described as shape only.",
    "Untested against a real model run.",
  ],
};

// One catalog per style and mode, in the compact register.
const catalogs = STYLES.flatMap((s) => {
  const objects = {
    id: `pl-team-illustrations-${s.key}-objects`,
    eyebrow: GROUP,
    title: `${s.label}: objects`,
    summary: `The seven team objects in the ${s.label.toLowerCase()} look, full register. ${s.blurb}`,
  };
  TEAMS.forEach((t) => {
    objects[t.label] = { pre: compose({ team: t.key, mode: "object", style: s.key, length: "full" }) };
  });
  const characters = {
    id: `pl-team-illustrations-${s.key}-characters`,
    eyebrow: GROUP,
    title: `${s.label}: characters`,
    summary: `Three people per team, twenty-one in the ${s.label.toLowerCase()} look, full register. Generate a team's three together with the first good one as the style reference.`,
  };
  TEAMS.forEach((t) => {
    t.characters.forEach((c) => {
      characters[`${t.label} · ${c.label}`] = {
        pre: compose({ team: t.key, mode: "character", character: c.key, style: s.key, length: "full" }),
      };
    });
  });
  const scenes = {
    id: `pl-team-illustrations-${s.key}-scenes`,
    eyebrow: GROUP,
    title: `${s.label}: scenes`,
    summary: `The five settings with all twenty-one people in them, three per team, in the ${s.label.toLowerCase()} look, full register. Pick fewer teams in the picker above.`,
  };
  SETTINGS.forEach((st) => {
    scenes[st.label] = { pre: compose({ mode: "scene", setting: st.key, style: s.key, length: "full" }) };
  });
  return [objects, characters, scenes];
});

export const teamIllustrationSpecs = [systemSpec, ...catalogs];
export { TEAMS, MODES, STYLES, STYLE_META, COMPACT_LIMIT, teamRecipe };
