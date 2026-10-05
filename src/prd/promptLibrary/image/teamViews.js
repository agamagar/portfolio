// Recipe for the "Team illustrations" prompt system: the seven teams Agam collaborated
// with, each drawn as an OBJECT or as a CHARACTER (up to three per team), through the
// library's three icon systems. Built on the shared recipe contract in ./recipe.js.
//
// Dials (shape only, so any style holds for any pick):
//   1. Team       - one of seven (see TEAMS).
//   2. Mode       - object (the team's emblem object) or character (a person from it).
//   3. Character  - which of the team's three people, character mode only.
//   4. Style      - line (thin isometric line icon), flat (front-facing line glyph),
//                   glass (Zepto premium glass), toy (Away soft 3D toy). Look only.
//   5. Length     - full, or compact under COMPACT_LIMIT for Figma's prompt field.
//
// The three style constants are the library's own: the line template is read from the
// Portfolio line icons system, the glass constant is sliced from the Zepto premium glass
// catalog, the toy template is the Away icon system's. The compact twins condense the
// same sourced claims; nothing new is asserted in them. The CHARACTER constants come
// from research/characters.md (see the citations beside each).
import { defineRecipe } from "./recipe.js";
import { SPECS as ICONS } from "./icons.data.js";
import { SPECS as PORTFOLIO_ICONS } from "./portfolioIcons.data.js";

export const COMPACT_LIMIT = 1000;

const need = (specs, id) => {
  const s = specs.find((x) => x.id === id);
  if (!s) throw new Error(`team illustrations: missing source system "${id}"`);
  return s;
};
const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);

// ---------- dial 1: the teams, each with its object and its three people ----------
// Written the Away way (2026-09-04 post-mortem, Claude/Prompt Library/2026-09-04_generic-
// outputs-analysis.md): every subject is ONE sentence naming a real object or a real
// person in real clothes, with its material, its colour and one characterful detail,
// ending in a noun in apposition ("a walnut"), the pattern the 75 proven Away prompts
// share. Colour adjectives are wrapped in braces so a style that owns its own palette
// (line, flat, glass, dreamy) can strip them with decolour() while toy and Zepto keep
// them. Variety across a team's three people is written INTO each sentence (a bob, a
// beard, glasses, a rounder or taller build) rather than asked for as a set rule.
// Light, camera and lens words stay out: those belong to the style layer.
export const TEAMS = [
  {
    key: "data-science",
    label: "Data science",
    object:
      "Two small {glass} test tubes standing in a slim {pale-oak} rack, one filled a little higher with {sky-blue} liquid than the other, a tiny {cream} paper tag tied to the rack with {red} string, a split test",
    noun: "a split test",
    characters: [
      { key: "analyst", label: "Analyst", cue: "A small stylised person with a cropped {black} side-parted haircut and round {tortoiseshell} glasses in a {mustard} knit sweater, seated at a tiny {pale-oak} desk behind an open {silver} laptop, a {cream} card printed with three {teal} bars propped against the screen, an analyst", scene: "the analyst with a cropped {black} side-parted haircut and round {tortoiseshell} glasses in a {mustard} knit sweater behind an open {silver} laptop" },
      { key: "experimenter", label: "Experimenter", cue: "A small stylised person with a {black} bob in a {sage-green} lab coat over a {white} tee, holding up a slim {pale-oak} rack of two {glass} test tubes, one filled a little higher with {sky-blue} liquid than the other, an experimenter", scene: "the experimenter with a {black} bob in a {sage-green} lab coat holding up a {pale-oak} rack of two {glass} test tubes" },
      { key: "forecaster", label: "Forecaster", cue: "A small stylised person with {black} hair tied back and a rounder build in a {rust-orange} cardigan, standing beside a tall {cream} easel board with a single {teal} line rising across it, one finger resting on the line's end, a forecaster", scene: "the forecaster with {black} hair tied back and a rounder build in a {rust-orange} cardigan tracing a rising {teal} line on a {cream} easel board" },
    ],
  },
  {
    key: "product",
    label: "Product",
    object:
      "A {cream} paper roadmap card held under a small {brass} bulldog clip on a {pale-oak} board, three stepped {teal} bars printed across it, a tiny {red} flag pin pushed into the end of the last bar, a product plan",
    noun: "a product plan",
    characters: [
      { key: "planner", label: "Planner", cue: "A small stylised person with short {black} curls in a {navy} shirt with rolled sleeves, holding a {pale-oak} clipboard with a {cream} card of three stepped {teal} bars, the other hand pointing ahead, a product planner", scene: "the product planner with short {black} curls in a {navy} shirt holding a {pale-oak} clipboard of three stepped {teal} bars and pointing ahead" },
      { key: "researcher", label: "Researcher", cue: "A small stylised person with a {black} bob and round {gold} glasses in a {lilac} sweater, seated at a small round {white} table across from an empty {teal} chair, an open {cream} notebook and a {coral} pen in front of them, a user researcher", scene: "the user researcher with a {black} bob and round {gold} glasses in a {lilac} sweater at a small round {white} table with an open {cream} notebook" },
      { key: "writer", label: "Writer", cue: "A small stylised person with a full {black} beard and a taller build in a {charcoal} tee, holding one large {cream} sheet in both hands with a tiny {red} flag pin at its corner, a product writer", scene: "the product writer with a full {black} beard and a taller build in a {charcoal} tee holding one large {cream} sheet with a tiny {red} flag pin" },
    ],
  },
  {
    key: "last-mile",
    label: "Last mile",
    object:
      "A compact {sky-blue} scooter with a {charcoal} seat and a boxy {deep-purple} insulated delivery cube strapped behind it, parked at the rolled-up {grey} shutter of a small dark store with {peach} plaster walls, a delivery",
    noun: "a delivery",
    characters: [
      { key: "rider", label: "Rider", cue: "A small stylised delivery rider in a {purple} polo with a lighter collar, {charcoal} trousers and a rounded {purple} helmet with a chin strap, astride a compact {sky-blue} scooter with a boxy {deep-purple} delivery cube strapped behind the seat, one hand on the throttle, a delivery rider", scene: "the delivery rider in a {purple} polo and rounded {purple} helmet astride a compact {sky-blue} scooter with a {deep-purple} delivery cube behind the seat" },
      { key: "picker", label: "Picker", cue: "A small stylised person with a {black} bob under a {purple} cap and a {purple} apron over a {teal} polo, holding a {peach} paper carrier bag by its two handles in one hand and a small {orange} basket of groceries in the other, in front of a low shelf of plain {tan} cardboard boxes, a store picker", scene: "the store picker with a {black} bob under a {purple} cap and a {purple} apron holding a {peach} paper carrier bag and a small {orange} basket" },
      { key: "ops-lead", label: "Ops lead", cue: "A small stylised person with a full {black} beard in a {purple} polo and {charcoal} trousers, standing beside the rolled-up {grey} shutter of a small dark store, holding a {white} phone out flat in one hand, the other resting on two stacked {tan} cardboard boxes, an ops lead", scene: "the ops lead with a full {black} beard in a {purple} polo holding a {white} phone out flat, the other hand on two stacked {tan} cardboard boxes" },
    ],
  },
  {
    key: "backend",
    label: "Backend engineering",
    object:
      "A short stack of three matte {charcoal} server units, each with two small round {green} status lights on its face, bound by a single coiled {sky-blue} cable trailing out of one side, a server stack",
    noun: "a server stack",
    characters: [
      { key: "builder", label: "Builder", cue: "A small stylised person with short {black} hair and round {black} glasses in a {forest-green} hoodie, seated at a tiny {pale-oak} desk behind an open {silver} laptop, a short stack of three matte {charcoal} server units with {green} status lights standing beside the desk, a backend engineer", scene: "the backend engineer with short {black} hair and round {black} glasses in a {forest-green} hoodie behind an open {silver} laptop beside a stack of three matte {charcoal} server units" },
      { key: "integrator", label: "Integrator", cue: "A small stylised person with {black} hair tied back and a rounder build in a {navy} tee, standing and feeding a thick coiled {sky-blue} cable into the side of a stack of three matte {charcoal} server units, an integrator", scene: "the integrator with {black} hair tied back and a rounder build in a {navy} tee feeding a coiled {sky-blue} cable into the server stack" },
      { key: "on-call", label: "On-call", cue: "A small stylised person with a {black} bob and a taller build in a {rust-orange} sweater, standing at a tall {cream} panel with three {brass}-rimmed round gauges, one hand raised to the top gauge whose needle has swung into the {red} warning band, an on-call engineer", scene: "the on-call engineer with a {black} bob and a taller build in a {rust-orange} sweater at a tall {cream} panel of three {brass}-rimmed round gauges" },
    ],
  },
  {
    key: "frontend",
    label: "Frontend engineering",
    object:
      "An upright matte {white} phone in a {lilac} frame with three rounded {pastel} component tiles laid on its screen, the top tile lifted a finger's width above the glass and casting a small soft shadow, a screen being built",
    noun: "a screen being built",
    characters: [
      { key: "builder", label: "Builder", cue: "A small stylised person with short {black} curls and round {tortoiseshell} glasses in a {lilac} sweater, seated at a tiny {pale-oak} desk behind an open {silver} laptop with an upright {white} phone propped beside it, three rounded {pastel} tiles on the phone's screen, a frontend engineer", scene: "the frontend engineer with short {black} curls and round {tortoiseshell} glasses in a {lilac} sweater behind an open {silver} laptop with an upright {white} phone propped beside it" },
      { key: "component", label: "Component maker", cue: "A small stylised person with a {black} bob in a {teal} tee, standing and holding an upright {white} phone in one hand while the other lifts a rounded {coral} component tile a finger's width off the screen, a component maker", scene: "the component maker with a {black} bob in a {teal} tee lifting a rounded {coral} tile off the screen of an upright {white} phone" },
      { key: "reviewer", label: "Reviewer", cue: "A small stylised person with a full {black} beard and a rounder build in a {mustard} cardigan, holding up a large empty {lilac} rectangular frame in both hands like a window and looking through it, a reviewer", scene: "the reviewer with a full {black} beard and a rounder build in a {mustard} cardigan holding up a large empty {lilac} rectangular frame like a window" },
    ],
  },
  {
    key: "design-leads",
    label: "Design leads",
    object:
      "A cork pinboard in a {pale-oak} frame with four small {cream} cards pinned in a row, a {brass}-rimmed round magnifying loupe resting over the second card, a design critique",
    noun: "a design critique",
    characters: [
      { key: "critic", label: "Critic", cue: "A small stylised person with {black} hair tied back in a {black} turtleneck, standing beside a cork pinboard in a {pale-oak} frame with four small {cream} cards pinned in a row, one finger on the second card, a design critic", scene: "the design critic with {black} hair tied back in a {black} turtleneck pointing at the second of four small {cream} cards pinned in a row" },
      { key: "reviewer", label: "Reviewer", cue: "A small stylised person with a {black} bob and round {gold} glasses in a {sage-green} shirt, seated at a tiny {pale-oak} desk holding a {brass}-rimmed round magnifying loupe over a single {cream} sheet, a design reviewer", scene: "the design reviewer with a {black} bob and round {gold} glasses in a {sage-green} shirt holding a {brass}-rimmed round loupe over a single {cream} sheet" },
      { key: "mentor", label: "Mentor", cue: "A small stylised person with short {black} curls and a taller build in a {rust-orange} overshirt, holding a {coral} pen in one hand and a small fanned stack of {cream} cards in the other, offering the top card forward, a mentor", scene: "the mentor with short {black} curls and a taller build in a {rust-orange} overshirt offering forward the top card of a small fanned stack of {cream} cards" },
    ],
  },
  {
    key: "leadership",
    label: "Company leadership",
    object:
      "A round {brass} compass with a {cream} dial and a single {deep-red} needle, set on a low square {oiled-walnut} block, a direction",
    noun: "a direction",
    characters: [
      { key: "founder", label: "Founder", cue: "A small stylised person with a {black} side-parted crop in a {navy} blazer over a {white} tee, standing beside a low square {oiled-walnut} block with a round {brass} compass resting on it, one hand laid flat on the compass, a founder", scene: "the founder with a {black} side-parted crop in a {navy} blazer, one hand laid flat on a round {brass} compass on a square {oiled-walnut} block" },
      { key: "speaker", label: "Speaker", cue: "A small stylised person with a {black} bob and round {gold} glasses in a {charcoal} dress, standing behind a small {pale-oak} lectern with a single {cream} sheet on it, one hand raised mid-sentence, a speaker", scene: "the speaker with a {black} bob and round {gold} glasses in a {charcoal} dress behind a small {pale-oak} lectern with a single {cream} sheet, one hand raised" },
      { key: "navigator", label: "Navigator", cue: "A small stylised person with a full {black} beard and a rounder build in a {forest-green} jacket, mid-stride with a rolled {cream} map tucked under one arm, the other arm pointing ahead, a navigator", scene: "the navigator with a full {black} beard and a rounder build in a {forest-green} jacket mid-stride with a rolled {cream} map under one arm, pointing ahead" },
    ],
  },
];

// Colour adjectives are marked {like this} in the cues. keepColour() unwraps them for
// the styles that render true colour; decolour() drops them for the styles that own
// their palette (a line has no colour, glass borrows it from the light, dreamy keeps
// one hue family).
export const keepColour = (s) => s.replace(/\{([^}]+)\}/g, "$1");
export const decolour = (s) =>
  s.replace(/\s?\{[^}]+\}(-[a-z]+)?/g, " ").replace(/\s{2,}/g, " ").replace(/\s,/g, ",").replace(/^\s+/, "");

export const MODES = [
  { key: "object", label: "Object", blurb: "The team's emblem object." },
  { key: "character", label: "Character", blurb: "A person from the team, role carried by props and posture." },
  { key: "scene", label: "Scene", blurb: "A setting full of furniture and constructs, with the chosen teams each at their station." },
];

// ---------- scene mode: a setting, plus one vignette per team in it ----------
// Each setting is one Away-grade sentence of furniture and constructs (material, colour,
// one characterful build per piece), written so the teams' props have somewhere to be.
// Colour words are braced like the subjects. No light, camera or lens words.
export const SETTINGS = [
  {
    key: "office",
    label: "Office floor",
    stage: "An open-plan office floor: a long {pale-oak} shared desk with {white} monitors and {teal} swivel chairs, a {cream} whiteboard wall on rolling casters, a low {lilac} sofa around a round {walnut} coffee table, a spiral bookshelf tower built from stacked {tan} cardboard boxes, a tall potted fig tree in a {terracotta} pot, and a big round wall clock with a {red} second hand",
    stageShort: "An open-plan office: a long {pale-oak} shared desk with {white} monitors, a {cream} whiteboard wall, a {lilac} sofa, a spiral tower of stacked {tan} boxes, a potted fig tree",
  },
  {
    key: "playground",
    label: "Playground",
    stage: "A playground on a patch of {sage-green} lawn with a {rust-orange} rubber running track: a slide shaped like a long {sky-blue} scooter ramp, a swing frame built from three stacked {charcoal} server units with {coral} rope swings, a see-saw made of one giant {cream} roadmap card balanced on a round {brass} compass, a climbing frame of {purple} delivery cubes, and a sandpit ringed with {tan} cardboard boxes",
    stageShort: "A playground on {sage-green} lawn: a slide shaped like a {sky-blue} scooter ramp, swings hung from stacked {charcoal} server units, a see-saw of one giant {cream} roadmap card on a {brass} compass, a climbing frame of {purple} delivery cubes",
  },
  {
    key: "yard",
    label: "Delivery yard",
    stage: "The loading yard behind a dark store: a rolled-up {grey} shutter, a row of {sky-blue} scooters parked at a {charcoal} rail, a pyramid of {peach} paper carrier bags on a {pale-oak} pallet, a short roller conveyor of {tan} cardboard boxes, a {purple} awning over a folding table with a {white} tablet on it, and a tall {cream} whiteboard of the day's plan",
    stageShort: "A dark-store loading yard: a rolled-up {grey} shutter, a row of {sky-blue} scooters at a rail, a pyramid of {peach} paper bags on a pallet, a conveyor of {tan} boxes, a {purple} awning over a table",
  },
  {
    key: "rooftop",
    label: "Rooftop terrace",
    stage: "A rooftop terrace: {pale-oak} decking, a long {charcoal} picnic table with benches, a string of round {cream} paper lanterns on {brass} poles, a {sage-green} planter wall, a small {white} projector screen on a folding stand, a {sky-blue} water cooler, and a low parapet with the city's rooftops beyond it",
    stageShort: "A rooftop terrace: {pale-oak} decking, a long {charcoal} picnic table, round {cream} paper lanterns on {brass} poles, a {sage-green} planter wall, a small {white} projector screen, a low parapet",
  },
  {
    key: "workshop",
    label: "Workshop",
    stage: "A maker workshop: a heavy {pale-oak} workbench with a {charcoal} bench vice, a pegboard wall of {silver} hand tools, a boxy {white} 3D printer on a side table, a rolling {teal} tool chest, a {cream} pin-up wall of cards and sketches, and a giant {brass} compass mounted on the wall like a clock",
    stageShort: "A maker workshop: a {pale-oak} workbench with a {charcoal} vice, a pegboard of {silver} tools, a boxy {white} 3D printer, a rolling {teal} tool chest, a {cream} pin-up wall, a giant {brass} wall compass",
  },
];

// ---------- brick-built look: the official colour palette ----------
// Our braced colour words mapped to the LEGO Group's own moulding-palette names and
// numeric IDs (research/lego.md, sources 5 and 6: the 2016 LEGO Moulding Colour Palette
// and BrickLink's guide, which lists both). Traps the dossier caught: LEGO's "Bright
// Purple" 221 is a PINK, the real purple is Medium Lilac 268; LEGO's "Dark Green" 28 is
// BrickLink's plain Green, forest green is Earth Green 141; 2019's coral is "Vibrant
// Coral" 353. No good match exists for mustard, brass or tortoiseshell; the nearest
// current colour stands in and is marked so in the comment.
export const LEGO_COLOURS = {
  white: ["White", 1], black: ["Black", 26], red: ["Bright Red", 21], "deep-red": ["Dark Red", 154],
  "sky-blue": ["Medium Azur", 322], navy: ["Earth Blue", 140], teal: ["Bright Bluish Green", 107],
  cream: ["Cool Yellow", 226], mustard: ["Bright Yellow", 24] /* no match; nearest current */,
  orange: ["Bright Orange", 106], "rust-orange": ["Dark Orange", 38], terracotta: ["Dark Orange", 38],
  coral: ["Vibrant Coral", 353], peach: ["Light Nougat", 283], tan: ["Brick Yellow", 5],
  oak: ["Medium Nougat", 312], "pale-oak": ["Medium Nougat", 312], walnut: ["Dark Brown", 308], "oiled-walnut": ["Dark Brown", 308],
  green: ["Dark Green", 28], "forest-green": ["Earth Green", 141], "sage-green": ["Sand Green", 151],
  purple: ["Medium Lilac", 268], "deep-purple": ["Medium Lilac", 268] /* darkest current purple */, lilac: ["Lavender", 325],
  pastel: ["Lavender", 325], grey: ["Medium Stone Grey", 194], charcoal: ["Dark Stone Grey", 199],
  gold: ["Warm Gold", 297], brass: ["Warm Gold", 297] /* no match; the antique brass retired 2005 */, silver: ["Silver Metallic", 315],
  glass: ["Transparent", 40], tortoiseshell: ["Reddish Brown", 192] /* no marbled finish exists */,
};
// Swap each braced word for its official name; unknown words are dropped like decolour.
export const legoColour = (s) =>
  s.replace(/\s?\{([^}]+)\}(-[a-z]+)?/g, (m, word, tail) => {
    const c = LEGO_COLOURS[word];
    return c ? ` ${c[0]}${tail || ""}` : " ";
  }).replace(/\s{2,}/g, " ").replace(/\s,/g, ",").replace(/^\s+/, "");
// The palette line: every official colour the subject uses, with its ID, once.
export const legoPalette = (raw) => {
  const seen = new Map();
  for (const m of String(raw).matchAll(/\{([^}]+)\}/g)) {
    const c = LEGO_COLOURS[m[1]];
    if (c) seen.set(c[0], c[1]);
  }
  return [...seen].map(([n, id]) => `${n} ${id}`).join(", ");
};

// ---------- the subject sentence, resolved from the dials ----------
// Returns { subject, isCharacter, team, character } for one pick; `subject` is the whole
// Away-style sentence including its closing noun, coloured or not per `colour`.
export function resolveSubject(pick = {}, { colour = true } = {}) {
  const team = TEAMS.find((t) => t.key === pick.team) || TEAMS[0];
  const fix = colour === "lego" ? legoColour : colour ? keepColour : decolour;
  if (pick.mode === "scene") {
    const setting = SETTINGS.find((x) => x.key === pick.setting) || SETTINGS[0];
    const chosen = Array.isArray(pick.teams) && pick.teams.length ? TEAMS.filter((t) => pick.teams.includes(t.key)) : TEAMS;
    const stage = fix(setting.stage);
    const groups = chosen.map((t) => `the ${t.label.toLowerCase()} team: ${t.characters.map((c) => fix(c.scene)).join(", ")}`);
    const count = chosen.reduce((n, t) => n + t.characters.length, 0);
    const raw = `${setting.stage} ${chosen.flatMap((t) => t.characters.map((c) => c.scene)).join(" ")}`;
    return { subject: `${stage}. In it, ${count} people in all, each at their own station: ${groups.join("; ")}`, raw, count, isCharacter: false, isScene: true, team: null, character: null, setting, teams: chosen };
  }
  if (pick.mode === "character") {
    // the character is picked by key, or by index (the gate sweeps 0, 1, 2)
    const c =
      team.characters.find((x) => x.key === pick.character) ||
      team.characters[Number(pick.character)] ||
      team.characters[0];
    return { subject: fix(c.cue), raw: c.cue, isCharacter: true, team, character: c };
  }
  return { subject: fix(team.object), raw: team.object, isCharacter: false, isScene: false, team, character: null };
}

// ---------- the three style constants, read from their source systems ----------
const LINE = need(PORTFOLIO_ICONS, "pl-portfolio-line-icons-system")["Copy-paste template"].pre;
const LINE_BODY = LINE.split("\n\n[MODE] options:")[0];
const LINE_OPTS = LINE.split("[MODE] options:")[1].split("\n");
const LINE_ISO = LINE_OPTS.find((l) => l.startsWith("- Isometric mode:")).slice(2);
const LINE_FLAT = LINE_OPTS.find((l) => l.startsWith("- Flat mode:")).slice(2);
export const LINE_CONSTANT = LINE_BODY.split("\n\n[MODE]")[0];
// Compact twins of the two mode clauses: the same projection claims, fewer words.
const LINE_ISO_SHORT =
  "Isometric mode: a true isometric projection, axes at 30 degrees from the horizontal and 120 degrees apart, equal foreshortening, seen from above and to one side, built from layered planes and extruded volumes on an isometric ground.";
const LINE_FLAT_SHORT = "Flat mode: straight-on and front-facing, flat 2D, no perspective, one clean silhouette line icon.";
const LINE_SUBJECT = (r) => `Subject: ${r.subject}.`;

const GLASS_SAMPLE = need(ICONS, "pl-zepto-premium-glass-icons")["Growth"].pre;
const GLASS_HEAD = "A single clean, surreal 3D glass icon.";
const GLASS_TAIL = GLASS_SAMPLE.slice(GLASS_SAMPLE.indexOf(" Model the hero object")).trim();
if (!GLASS_SAMPLE.startsWith(GLASS_HEAD) || GLASS_TAIL.length < 200)
  throw new Error("team illustrations: the Zepto glass constant moved; re-slice it");
export const GLASS_CONSTANT = GLASS_TAIL;
// Same claims as GLASS_TAIL, condensed for the compact register.
export const GLASS_CONSTANT_SHORT =
  "A tangible fully 3D isometric object with real volume, three-quarter view, never flat, in thick clear colourless optical glass like hand-blown crystal, soft organic forms. Realistic refraction, soft caustics, internal reflections, glossy, soft highlights, faint rainbow dispersion on the edges; colour only from the light. Soft out-of-focus ground fading from faint royal orange to pink, warm glow, soft contact shadow. Centred, generous padding, one clear hero, bold silhouette, no clutter.";

const TOY = need(ICONS, "pl-away-icons-system")["Copy-paste template"].pre;
const TOY_PARTS = TOY.split("[SUBJECT]. ");
if (TOY_PARTS.length !== 2) throw new Error("team illustrations: the Away toy template moved; re-split it");
export const TOY_HEAD = TOY_PARTS[0].trim(); // "A single clean, stylized 3D-rendered miniature icon."
export const TOY_CONSTANT = TOY_PARTS[1].replace(/\s*\{\{RULES\}\}\s*$/, "").replace(/,?\s*no text, no labels\.\s*$/, ".").trim();
// Same claims as TOY_CONSTANT, condensed.
export const TOY_CONSTANT_SHORT =
  "A smoothly stylized 3D illustration with a soft toy-model look, not a photo: smooth uniform surfaces, soft matte finish, gently rounded simplified forms, recognisable by colour and basic material, no fabric texture, grain or micro-detail, crisp focus, no harsh highlights. One clear hero, at most two props, bold silhouette. Slightly muted natural colours, soft even flat shading, minimal soft shadows. Plain off-white #F7F7F5 ground, centred, generous padding.";

// Zepto illustration: the house language as it appears in the FINISHED banners (the
// "New Order" phone POV, the picker at the shelf, the rider handing the bag with the
// phone tick, the rider on the scooter with the delivery cube, the exploding grocery
// bag, the scooter bursting out of an oversized phone, the purple document-and-shield
// scene), read alongside the character sheets in Claude/Prompt Library/refs/
// zepto-illustration-library. The first draft said "flat white ground, crisp, no
// texture" and Agam's real outputs came back too flat: the banners live on a warm
// peach ground (the brand swatch is about #FEDDC6) filled with big soft swept strokes,
// hot-pink streaks and radial light rays, the figure and its hero prop carry a soft
// pale-yellow outer glow, shading is airbrushed inside the forms, props float tilted
// with soft cast shadows, and the crop is tight and dynamic. Brand marks on the helmet,
// bags and cube are NOT carried (the library rules strip branding).
export const ZEPTO_CONSTANT =
  "Rendered in the house illustration language of the marketing banners: a warm peach ground (about #FEDDC6) filled edge to edge with large soft swept brush-stroke shapes in paler cream and deeper peach, a few thin hot-pink streaks, and soft radial light rays fanning out from behind the subject. The subject and its hero prop carry a soft pale-yellow outer glow halo so they lift off the ground. Forms are flat vector shapes with no outlines, each filled with a smooth multi-stop gradient (peach into orange on skin, paper and card; deep violet into bright purple on uniform and helmet, with a lighter highlight band), shaded with soft-edged airbrushed shadows inside the form rather than hard cut shapes, and finished with small white glint highlights on glossy props. Supporting props (fruit, a bottle, boxes, a phone, a basket) float around the subject at tilted angles with soft cast shadows beneath them, scaled up and cropped tight so the composition feels dynamic; pink and cream speed streaks trail anything moving. Palette: purple and violet, charcoal for trousers and shoes, peach-orange, hot pink as the accent, teal for a phone screen or a tick, sky blue for a scooter, near-black hair. Props from the house set: a paper carrier bag with two handles, a plain cardboard box, an open basket, a wire cart, a phone, a deep-purple delivery cube, a blue scooter, a spray bottle, a watermelon slice, a pineapple, an orange.";
export const ZEPTO_CONSTANT_SHORT =
  "House banner illustration: peach ground (#FEDDC6) with cream and peach swept strokes, thin hot-pink streaks, radial light rays behind it; a pale-yellow outer glow lifts subject and hero prop; flat shapes, no outlines, smooth multi-stop gradients, airbrushed shading, white glints; props float tilted with soft shadows, tight crop; pink speed streaks.";

// Dreamy glow: from two reference paintings (a cluster of glowing lemons with a small
// black cat peeking from behind; lemons, a slice and sparkles on a dark navy ground)
// and research/dreamy.md (27 sources). What the research corrected: it is NOT vector,
// it is soft-brush raster painting with no outlines [1][7][15]; the glow is additive
// (Add / Linear Dodge, not Screen) over a dark ground tinted to the object hue
// [14][16][17]; the artist's own colour rule is two main colours then stop [1]; the
// four-point star is the manga "captivated" mark and sits on the admired thing [21];
// gradients route through a connecting hue, never grey [24]; a living artist is never
// named (OpenAI refuses it) [26], so the look is described in craft terms only.
export const DREAMY_CONSTANT =
  "Rendered as a soft airbrushed digital painting with no outlines and no visible brush texture: chubby rounded silhouettes with fully feathered edges, each filled with a hue-shifted gradient that stays inside one warm family (yellow into orange into deep amber, never passing through grey) and glows from inside as an additive light source, brightest at the core with a fast, faint outer halo. The ground is a dark brown-to-black gradient tinted toward the object's hue. Background copies of the object defocus into round soft-edged bokeh discs of varied size, dimmer than the subject, with a few extra discs floating in the dark. A handful of small four-point star sparkles at two or three sizes sit on the brightest edges of the subject, never on the ground; if a second hue appears it is one cool accent, slightly desaturated for the dark ground. Subtle darker soft spots suggest the surface's pores. Two colours, then stop.";
// The reference does not render an object, it renders a CLUSTER of chubby blobs: the
// subject simplified to a few rounded masses with no small parts, repeated at several
// depths, the nearest sharp, the rest softening into discs. Without this clause the
// Away-grade subject sentence (a rack, a tag, string) dominates and the model paints a
// detailed object on a dark ground, which is what came back "not following the
// reference" on 2026-09-04. The subject dominates; so the simplification sits right
// after it, before the style constant.
export const DREAMY_SIMPLIFY =
  "Simplify it the way the reference does: the whole subject reduced to a few chubby rounded blobs with fully feathered edges, no small parts, no thin lines and no fine detail, the parts named above kept only as soft shapes; then repeat the subject as a loose cluster that fills the frame at several depths, the nearest one sharp and the rest softening behind it into round out-of-focus discs, so the picture reads as a glowing pile rather than one object on a ground.";
export const DREAMY_SIMPLIFY_SHORT =
  "Simplify to a few chubby rounded blobs, no fine detail, repeated as a loose cluster at several depths, the nearest sharp, the rest softening into discs.";
export const DREAMY_HEAD = "A dreamy, softly glowing kawaii digital painting on a dark ground.";
export const DREAMY_CONSTANT_SHORT =
  "Soft airbrushed painting, no outlines: chubby rounded shapes, feathered edges, one warm hue family in a hue-shifted gradient, glowing from inside with a faint outer halo on a dark brown-black ground tinted to the hue; a few four-point star sparkles on the bright edges; one cool accent at most.";

// Brick-built (LEGO): every number from research/lego.md. Geometry from a measured 2x4
// drawing and the LDraw spec [3][14][16]: studs 4.8 mm across on an 8 mm grid, about
// 1.7 mm tall; bricks 9.6 mm, plates 3.2 mm (three to a brick), tiles plate-height with
// no studs [16][33]; slopes that exist are 45 and 33 (the common ones) and the 30 degree
// cheese wedge, part 54200 [37]; glossy opaque ABS since 1963 [21]; official renders are
// clean and unscratched, cast a shadow on a ground plane, solid background [29]; the
// product-shot recipe is Gemini's own [41]. Real studs carry the LEGO logo [29][31], so
// the prompt says plain studs with no lettering (the library strips branding). The word
// LEGO is never used: the LEGO Group permits it only as an adjective and no vendor page
// settles whether an image model refuses it [38][39][40].
export const LEGO_HEAD = "A single clean product render of a brick-built model.";
export const LEGO_CONSTANT =
  "Rebuild the subject as a brick-built model of interlocking plastic building elements: studs up on every top face, each stud a plain unmarked round cylinder 4.8 mm across and about 1.7 mm tall on an 8 mm grid; standard bricks 9.6 mm tall, plates one third of that at 3.2 mm, smooth studless tiles wherever a surface should read flat; every curve stepped from real elements, 45 and 33 degree slope bricks and small 30 degree wedge slopes, never a smooth sculpted surface; every element in glossy opaque ABS plastic, clean and unscratched with no yellowing; only the official moulding palette, each colour flat and uniform. The model stands free on a plain light-grey ground plane with a soft contact shadow against a solid neutral background, studio-lit with a three-point softbox, seen from a slightly elevated 45 degree three-quarter view with the studs clearly readable.";
export const LEGO_CONSTANT_SHORT =
  "Brick-built model of interlocking plastic elements, studs up, plain round 4.8 mm studs on an 8 mm grid, 9.6 mm bricks, 3.2 mm plates, smooth tiles, 45 and 33 degree slopes, glossy opaque ABS, official palette only, on a plain light-grey ground with a soft shadow, solid neutral background, softbox light, elevated 45 degree view.";

// ---------- the CHARACTER constants: how a person is drawn in each system ----------
// From research/characters.md. Each says how the figure is simplified in that medium,
// how the role is carried, and what stays off the figure at icon scale. Line: the
// detached round head and the 45-degree axis grid are the pictogram's identity
// (Aicher, DOT, the stick figure [12][14][16][17]); three heads keeps a limb long enough
// to hold a prop [1]; frontal or profile is the ISO convention [21]; no added human
// detail unless it carries meaning [22]. Glass: satin-frosted against polished clear is
// how Lalique makes a clear figure show hair and dress [28][29], the integral base is
// the figurine convention [27], limbs fuse because thin clear limbs vanish (inference).
// Toy: the Funko face and hairline rule [10][11], the chibi head, torso, limb and eye
// rules [2][3], platform-toy seams [6][8], the accessory as identity [9][11]. The role
// rule (one prop, held or worn, same material, one posture, never a badge or a
// legible screen) is Aicher, Isotype and Funko's shared move [11][16][18]. The short
// twins condense the same claims for the compact register.
export const CHARACTER = {
  line:
    "One person drawn as a pictogram in the same thin single-weight black line: a round head separated from the body by a small gap, a body of straight segments on horizontal, vertical and 45-degree axes with rounded ends, no face, no fingers, no neck, feet as short strokes, about three heads tall so the limbs are long enough to hold a prop. In flat mode the figure is frontal or in profile; in isometric mode it stands on the same ground and its prop is a solid drawn in the same projection. The role is one prop in the same line plus one posture, never a badge and never a screen with content on it.",
  lineShort:
    "One pictogram person: round head, small gap to the body, straight limbs on 45-degree axes, no face, three heads tall; role by one prop and one posture.",
  glass:
    "One person sculpted in the same clear optical glass, two and a half heads tall, the head a single smooth dome with no features, limbs fused to the torso with no daylight between them, hands as rounded paddles, standing on a small integral glass base. Hair and one garment (a cap, an apron, a jacket, a hood) are the same glass with a satin-frosted finish against the polished clear body, and that frosted zone plus one fused prop is the whole role, never a badge and never a screen with content on it.",
  glassShort:
    "Clear-glass person, 2.5 heads, featureless dome head, fused limbs, integral base; satin-frosted hair and garment, one fused prop carries the role.",
  toy:
    "One person as a miniature designer-toy figure in the same matte soft-touch surface, two and a half heads tall: a rounded block head at least as wide as it is tall, two wide-set solid black dot eyes at least a quarter of the head high, no mouth, an egg or rectangle torso, arms no thicker than the legs, mitt hands, pad feet, faint joint seams at the neck and shoulders. One hairline silhouette, one garment and one held accessory carry the character; garment folds and small details are dropped. It stands on the off-white ground with the same soft shadow as the object icons, never a badge and never a screen with content on it.",
  toyShort:
    "Toy-figure person, 2.5 heads, block head, wide-set black dot eyes, no mouth, egg torso, mitt hands, seam joints; one hairline, garment and held prop.",
  // Zepto flat: the house figure, read off the character sheets. Five heads tall (the
  // proportion sheets stand the figure against five circles), a slim straight body,
  // mitt-like hands with a few defined fingers, small dark rounded shoes; the face is a
  // parts system (two thick short black brows, eyes as two closed happy arcs or small
  // dots, a tiny wedge nose, a small open mouth in deep maroon, a faint warm cheek), the
  // hair one solid glossy near-black mass; the uniform is the purple polo with a lighter
  // collar and cuffs, charcoal trousers with a purple ankle band, and for a delivery
  // partner the plain purple helmet with a chin strap; the pose set is standing holding,
  // leaning on an oversized prop, walking with a bag, running with speed clouds, riding.
  zepto:
    "One person in the house figure, wrapped in the soft pale-yellow outer glow the banners give every figure: five heads tall, a slim straight-standing body with narrow shoulders and long simple legs, mitt-like hands with a few defined fingers, feet as small dark rounded shoes. The house face: two thick short black brows, eyes as two closed happy arcs, a tiny wedge nose, a small open smiling mouth in deep maroon, a faint warm cheek; hair one solid glossy near-black mass with a single highlight shape. Dress: the purple polo with a lighter collar and sleeve cuffs over charcoal trousers with a purple ankle band for anyone on the delivery side, with a plain purple helmet and chin strap for a rider; a teal polo, or a plain knee-length kurta, for everyone else. The role is one house prop held, carried or straddled, and one pose from the house set: standing and holding, leaning an elbow on an oversized prop, walking with a bag, running with speed clouds, riding, handing a box forward.",
  zeptoShort:
    "House figure, five heads tall, slim, mitt hands, dark shoes; thick brows, closed happy arc eyes, tiny nose, small open maroon mouth, glossy near-black hair; purple polo, charcoal trousers, plain purple helmet for a rider, teal polo for others; one house prop, one house pose.",
  // Dreamy glow: derived from the reference cat plus the artist's stated taste for
  // "secrets" and vague, expressionless faces [1][11], kawaii proportions [22][23],
  // and light-from-the-props per the glow-as-light-source sources [16][17]. The role's
  // prop IS the glowing object the figure peeks from behind.
  dreamy:
    "The person is a small solid near-black silhouette with kawaii proportions: a round chubby body, a big head, no neck, stubby limbs. The only features are two big round white eyes with dark pupils; no nose, no mouth, no hair detail, no clothing edges, the hair and any hat read as silhouette only. The silhouette is lit only by the props: a faint warm rim glow on the edge nearest the glowing object and a soft reflection of that hue in the eyes. The role's prop is the glowing object, rendered in the style above, and the figure peeks from behind or beside it, partly hidden, never the brightest thing in frame.",
  dreamyShort:
    "Small solid near-black chubby silhouette, big round white eyes with dark pupils, no other features; faint warm rim glow from the glowing prop; peeking from behind it.",
  // Brick-built: the minifigure, every value from the LEGO Group's own statements and
  // its 2013 Brand Manual drawing [22][24]: exactly four bricks tall, 4 cm with the head
  // stud; head 10.2 mm wide; classic printed face; torso two studs wide; C-shaped hands
  // the width of a stud; seven joints; hair as a separate piece on the head stud; Bright
  // Yellow 24 as the generic skin (chosen by 1970s focus groups, not a neutrality
  // decision [22]); the outfit is flat torso printing, never moulded [2].
  lego:
    "The person is a minifigure: exactly four bricks tall, 4 cm with the head stud; a cylindrical head 10.2 mm wide with a plain stud on top and the face printed as two black dot eyes and a black curved smile; a trapezoid torso two studs wide and narrower at the shoulders, the outfit as flat printing on the torso rather than moulded; straight cylindrical arms with C-shaped claw hands the width of a stud; a hip block with two blocky legs and one-plate feet; seven joints only, at the neck, the shoulders, the wrists and the hips; hair or a hat as a separate moulded piece seated on the head stud; Bright Yellow 24 skin; glossy ABS.",
  legoShort:
    "Minifigure: four bricks tall, cylinder head with a plain stud, dot eyes and a curved smile, printed trapezoid torso, C-claw hands, blocky legs, seven joints, Bright Yellow 24 skin, glossy ABS.",
};

// What actually COMPOSES for a character: one short prose clause per style, appended to
// the subject sentence, carrying only the proportion and face rule from the constant
// above (the post-mortem: one subject definition per prompt, and no second description
// of the figure in a second voice). The full constants stay exported for the page.
export const FIGURE_CLAUSE = {
  line: "The person is drawn as a pictogram: a round head separated from the body by a small gap, limbs as straight segments on horizontal, vertical and 45-degree axes with rounded ends, no face and no fingers, about three heads tall, the prop drawn as a solid in the same projection.",
  glass: "The person is about two and a half heads tall with a featureless dome head, limbs fused to the torso, hands as rounded paddles, standing on a small integral glass base, with hair and clothing satin-frosted against the polished clear body.",
  toy: "The person is a designer-toy figure about two and a half heads tall, with a rounded block head at least as wide as it is tall, two wide-set solid black dot eyes and no mouth, mitt hands, pad feet and faint joint seams at the neck and shoulders, the clothing rendered as smooth painted surfaces.",
  zepto: "The person is the house figure, five heads tall and slim with mitt-like hands and small dark rounded shoes, the house face of two thick short black brows, closed happy arc eyes, a tiny wedge nose and a small open smiling mouth, the hair one solid glossy near-black mass, the whole figure wrapped in a soft pale-yellow outer glow.",
  dreamy: "The person is a small solid near-black chubby silhouette with two big round white eyes with dark pupils and no other features, lit only by a faint warm rim glow from the glowing prop, peeking from behind or beside it and never the brightest thing in frame.",
  lego: "The person is a minifigure: exactly four bricks tall, 4 cm with the head stud; a cylindrical head 10.2 mm wide with a plain stud on top and the face printed as two black dot eyes and a black curved smile; a trapezoid torso two studs wide and narrower at the shoulders, the outfit as flat printing on the torso rather than moulded; straight cylindrical arms with C-shaped claw hands the width of a stud; a hip block with two blocky legs and one-plate feet; seven joints only, at the neck, the shoulders, the wrists and the hips; hair or a hat as a separate moulded piece seated on the head stud; Bright Yellow 24 skin; glossy ABS; the prop built from elements at minifigure scale.",
};

// The set rule is a note for the person generating three, never a line in a single-image
// prompt (the post-mortem: a generation cannot vary against images it has not seen).
// It stays exported for the page; the variety is written into each character's sentence.
export const VARIETY =
  "When generating a team's three people, keep the same style, scale and ground and let the sentences carry the difference: each one already names its own hair (a bob, a crop, curls, tied back, covered), its own build (rounder, taller) and its own accessory (glasses, a beard). No character stands above another and the leader is no bigger.";
export const VARIETY_SHORT = "Same style, scale and ground for the three; the sentences carry the difference; nobody bigger.";

// ---------- styles: look only ----------
// How a group scene is composed, per style. The Away constants describe one hero object;
// a scene is a compact diorama read at a glance, every figure the same scale at its own
// station, nothing overlapping. Zepto keeps its banner sweep; line keeps its projection.
export const SCENE_CLAUSE = {
  default:
    "Compose the whole set as one compact diorama seen from a raised three-quarter view, standing on a small ground plate that ends cleanly at its edges, the furniture and constructs at tabletop-model scale, every figure at the same scale at its own station holding its one prop, generous spacing between stations, no overlapping silhouettes, the whole scene readable at a glance.",
  zepto:
    "Compose it as one wide banner scene: the setting's constructs as oversized props spread across the frame, every figure the same scale at its own station with its one prop, generous spacing, no overlapping silhouettes, the swept strokes and light rays behind the whole group.",
  line:
    "Draw the whole set in the same projection on one ground grid, the furniture and constructs as layered planes and extruded volumes, every figure the same scale at its own station with its one prop, generous spacing, nothing overlapping, readable at a glance.",
};
SCENE_CLAUSE.lego =
  "Build the whole set on one large Medium Stone Grey 194 baseplate with its studs up, the furniture and constructs brick-built at minifigure scale, every minifigure at its own station holding its one prop, generous spacing, nothing overlapping, the set readable at a glance from a slightly elevated three-quarter view.";
export const SCENE_CLAUSE_SHORT = {
  default: "One compact diorama from a raised three-quarter view on a small ground plate, tabletop-model scale, every figure the same size at its own station with its one prop, spaced out, nothing overlapping.",
  zepto: "One wide banner scene, constructs as oversized props, every figure the same size at its own station, spaced out, swept strokes behind the group.",
  line: "The whole set in one projection on one ground grid, every figure the same size at its own station, spaced out, nothing overlapping.",
};
SCENE_CLAUSE_SHORT.lego = "The whole set on one Medium Stone Grey 194 baseplate, studs up, brick-built at minifigure scale, every minifigure at its own station, spaced out, nothing overlapping.";
const sceneClause = (styleKey, compact) => (compact ? SCENE_CLAUSE_SHORT : SCENE_CLAUSE)[styleKey] || (compact ? SCENE_CLAUSE_SHORT : SCENE_CLAUSE).default;
const figureFor = (styleKey, compact) => (compact ? CHARACTER[`${styleKey}Short`] : FIGURE_CLAUSE[styleKey]);

// Full composes the prose figure clause; compact (an opt-in for a capped client) falls
// back to the condensed twin in CHARACTER so it stays under COMPACT_LIMIT. A scene
// composes the figure clause for everyone plus the scene composition clause.
const modeClause = (styleKey, r, compact = false) => {
  if (r.isScene) {
    const fig = String(figureFor(styleKey, compact)).replace(/^(The person is|Small solid|Toy-figure person|Clear-glass person|House figure|One pictogram person|Minifigure)/, (m) =>
      m === "The person is" ? "Every person is" : `Every person: ${m.charAt(0).toLowerCase()}${m.slice(1)}`);
    return `${fig} ${sceneClause(styleKey, compact)}`;
  }
  return r.isCharacter ? figureFor(styleKey, compact) : "";
};
// The Away composition rule names a hero OBJECT; for a figure the hero is the person and
// the meaning rides on the one prop they hold.
const HERO_OBJECT = "Lead with one clear hero object that carries the meaning by itself; add at most one or two supporting props, and only when they make the meaning clearer.";
const HERO_FIGURE = "Lead with one clear hero figure whose single held prop carries the meaning; add nothing else.";
const forFigure = (text, r) => (r.isScene ? text.replace(HERO_OBJECT, "") : r.isCharacter ? text.replace(HERO_OBJECT, HERO_FIGURE) : text);

export const STYLES = [
  {
    key: "line",
    label: "Isometric line",
    blurb: "The portfolio's thin black line on white, true 30-degree isometric.",
    parts(pick) {
      const r = resolveSubject(pick, { colour: false });
      const compact = pick.length === "compact" && !r.isScene;
      return [LINE_CONSTANT, compact ? LINE_ISO_SHORT : LINE_ISO, LINE_SUBJECT(r), modeClause("line", r, compact)];
    },
  },
  {
    key: "flat",
    label: "Flat line",
    blurb: "The same thin line, front-facing and flat, a glyph rather than a scene.",
    parts(pick) {
      const r = resolveSubject(pick, { colour: false });
      const compact = pick.length === "compact" && !r.isScene;
      return [LINE_CONSTANT, compact ? LINE_FLAT_SHORT : LINE_FLAT, LINE_SUBJECT(r), modeClause("line", r, compact)];
    },
  },
  {
    key: "glass",
    label: "Glass",
    blurb: "Zepto's clear hand-blown glass miniature on the orange-to-pink ground.",
    parts(pick) {
      const r = resolveSubject(pick, { colour: false });
      const compact = pick.length === "compact" && !r.isScene;
      return [
        `${r.isScene ? GLASS_HEAD.replace("glass icon", "glass diorama") : GLASS_HEAD} ${cap(r.subject)}.`,
        modeClause("glass", r, compact),
        compact ? GLASS_CONSTANT_SHORT : GLASS_CONSTANT,
      ];
    },
  },
  {
    key: "toy",
    label: "Toy",
    blurb: "Away's soft 3D toy-model miniature, light theme, off-white ground.",
    parts(pick) {
      const r = resolveSubject(pick, { colour: true });
      const compact = pick.length === "compact" && !r.isScene;
      return [
        `${r.isScene ? TOY_HEAD.replace("miniature icon", "miniature diorama") : TOY_HEAD} ${cap(r.subject)}.`,
        modeClause("toy", r, compact),
        forFigure(compact ? TOY_CONSTANT_SHORT : TOY_CONSTANT, r),
      ];
    },
  },
];

STYLES.push({
  key: "zepto",
  label: "Zepto illustration",
  blurb: "The house banner language: peach ground with swept strokes and light rays, glow halos, airbrushed gradient forms, floating props, the purple uniform.",
  parts(pick) {
    const r = resolveSubject(pick, { colour: true });
    const compact = pick.length === "compact" && !r.isScene;
    return [
      `A single house-style banner illustration. ${cap(r.subject)}.`,
      modeClause("zepto", r, compact),
      compact ? ZEPTO_CONSTANT_SHORT : ZEPTO_CONSTANT,
    ];
  },
});

STYLES.push({
  key: "dreamy",
  label: "Dreamy glow",
  blurb: "Soft airbrushed glow painting: one warm hue family lit from inside on a dark tinted ground, bokeh discs, four-point sparkles.",
  parts(pick) {
    const r = resolveSubject(pick, { colour: false });
    const compact = pick.length === "compact" && !r.isScene;
    return [
      `${DREAMY_HEAD} ${cap(r.subject)}.`,
      r.isScene ? "" : compact ? DREAMY_SIMPLIFY_SHORT : DREAMY_SIMPLIFY,
      modeClause("dreamy", r, compact),
      compact ? DREAMY_CONSTANT_SHORT : DREAMY_CONSTANT,
    ];
  },
});

STYLES.push({
  key: "lego",
  label: "Brick-built",
  blurb: "A brick-built model of interlocking plastic elements, studs up, official moulding-palette colours by name and ID, people as minifigures.",
  parts(pick) {
    const r = resolveSubject(pick, { colour: "lego" });
    const compact = pick.length === "compact" && !r.isScene;
    const palette = legoPalette(r.raw);
    return [
      `${r.isScene ? LEGO_HEAD.replace("brick-built model", "brick-built diorama") : LEGO_HEAD} ${cap(r.subject)}.`,
      modeClause("lego", r, compact),
      compact ? LEGO_CONSTANT_SHORT : LEGO_CONSTANT,
      // the official names already sit inline; the numbered palette line is full only
      palette && !compact ? `Colours used, from the official moulding palette by name and number: ${palette}.` : "",
    ];
  },
});

export const STYLE_META = STYLES.map(({ key, label, blurb }) => ({ key, label, blurb }));

export const teamRecipe = defineRecipe({
  key: "team-illustrations",
  label: "Team illustrations",
  dials: { team: TEAMS, mode: MODES, setting: SETTINGS },
  styles: STYLES,
});
