// Recipe for the "Avatar roles" prompt system: the site avatar at ONE age (the 30s base)
// in different parts of life, and as the most recognisable lead characters of seven films.
// Sibling of avatarLivesViews.js (which varies the PERSON); this one varies the ROLE.
//
// v2 (2026-10-08). v1 was a head plus one floating prop; Agam: "too basic, pull from our
// work on the travel icons we built following the design philosophy of Airbnb". So each
// role is now built like an Away product icon (icons.data.js, "Away · icon system"):
//   - a miniature icon VIGNETTE, not a portrait: the head is the hero, set in a tiny scene;
//   - working backward from the viewer: the most universally recognised object for the role;
//   - one hero object, at most two supporting props, bold silhouette, negative space;
//   - ONE characterful "alive" detail that adds meaning (Airbnb's house icon: the tiny door
//     pops open and the porch light comes on [2]);
//   - specific colours and materials per object; one of the Away colour themes.
// Airbnb's own framing of its 3D icons: "a ton of utility, a universal language, and
// playful" (Teo Connor) and a shift "away from generic geometric designs toward texture and
// form" (Brian Chesky) [1][2]. research/avatarRoles.md.
//
// Every prompt EDITS the chosen base render (Claude/Prompt Library/avatar-3d/base-v2.webp).
// Never mention the original drawing (ledger 2026-10-07).
import { defineRecipe } from "./recipe.js";

export const COMPACT_LIMIT = 1000;

export const EXTRA_RULE = "No logos, no insignia, no printed words or characters on any costume, screen or prop.";
export const EXTRA_RULE_COMPACT = "No logos or characters on screens or props.";

export const ANCHOR =
  "Edit the attached 3D head into a single clean, stylized 3D-rendered miniature icon: the same person, same age, as the hero of a tiny scene that names his role at a glance.";
export const ANCHOR_SHORT =
  "Turn the attached 3D head into a stylized 3D miniature icon, same person and age, hero of a tiny role scene.";

// v2.1 (2026-10-08): v2 renders grew a body (arms on a tablet, shoulders in a hoodie, hands on
// a spoon) because scene verbs implied one ("rises behind", "peeks over") and garments implied
// a torso. The head is the WHOLE character: objects sit around it, nothing is held or worn below
// the jaw, and anything a hand would hold floats or rests on its own.
export const NO_BODY =
  "Floating head only, exactly like the attached render: no neck, no shoulders, no torso, no arms, no hands. Nothing is held; every object floats or rests on its own around the head.";
export const NO_BODY_SHORT = "Floating head only: no neck, body, arms or hands; nothing held.";

export const QUIFF = "the tall swept quiff with two rounded lobes rising up and right,";
export const QUIFF_SHORT = "swept two-lobed quiff,";

export const IDENTITY =
  "His face stays his: QUIFF the big rounded left ear, short brow bars, small glossy bead eyes, the long soft nose with a rounded tip; his head keeps its satin hair and matte skin.";
export const IDENTITY_SHORT = "Keep his face: QUIFF left ear, bead eyes, long nose with rounded tip.";

// The Away icon system's composition rule and global rule, condensed. [icons.data.js]
export const RECIPE =
  "Design it working backward from the viewer: the role is carried by the single most universally recognised object for it, readable anywhere in the world at a glance. The head plus one hero object carry the meaning; at most two supporting props. Bold readable silhouette, generous negative space, no clutter. Smooth matte toy-model surfaces, gently rounded simplified forms, no fine texture or micro-detail, crisp focus, soft even shading, light ambient occlusion.";
export const RECIPE_SHORT =
  "Universal objects for the role; head plus one hero object, at most two props; bold silhouette, negative space. Smooth matte toy forms, crisp, soft shading.";

// The Away icon colour themes, verbatim in meaning. [icons.data.js, "Colour themes"]
export const THEMES = [
  {
    key: "light", label: "Light",
    full: "Colours natural and true to each object, clean and just slightly muted.",
    short: "Colours natural, slightly muted.",
  },
  {
    key: "away", label: "Away",
    full: "Colours from the Away heritage palette across the scene: sage, dusty blue, terracotta, cream and warm wood.",
    short: "Palette: sage, dusty blue, terracotta, cream, wood.",
  },
  {
    key: "oldmoney", label: "Old Money",
    full: "Understated heritage tones across the scene: racing green, camel, navy, burgundy and ivory, with a single aged-brass accent.",
    short: "Racing green, camel, navy, burgundy, ivory, one brass accent.",
  },
];

export const GROUND =
  "Three-quarter view facing right. Plain off-white #F7F7F5 background, scene centred with generous padding, soft contact shadow.";
export const GROUND_SHORT = "Three-quarter right, plain off-white #F7F7F5, centred, padded.";

// Each role: head (what changes on him), scene (hero object + up to two props, each with a
// colour and material), alive (the one characterful detail), quiff / hidesFace flags.
export const ROLES = [
  // ---------- parts of life ----------
  {
    key: "designer", family: "life", label: "Designer",
    head: "Product designer: thin round tortoiseshell glasses, a pencil tucked behind the left ear.",
    headShort: "Designer: round tortoiseshell glasses, pencil behind the ear.",
    emote: "Emotion, the aha moment as the curve lands: brows lifted, cheeks pushed up so the eyes squeeze into happy crescents, a wide open grin, eyes on the pen nib.",
    emoteShort: "Aha delight: brows up, eyes squeezed to happy crescents, wide open grin, looking at the nib.",
    scene: "Below and in front of his floating head, a large tilted drawing tablet in soft charcoal stands on its own; a thick sage-green bezier curve lifts off the tablet into 3D with two round handle dots, a terracotta sticky note on the tablet's corner.",
    sceneShort: "A tilted charcoal drawing tablet stands below his head; a thick sage bezier curve lifts off it into 3D with two handle dots; terracotta sticky note.",
    alive: "The curve is still being drawn: a pen nib floats on its own at its open end.",
    aliveShort: "A pen nib floats alone at the curve's open end.",
    quiff: true,
  },
  {
    key: "student", family: "life", label: "Student",
    head: "Studying late: a black graduation mortarboard tilted on the quiff, its tassel swinging.",
    headShort: "Student: black mortarboard tilted on the quiff, tassel swinging.",
    emote: "Emotion, sleepy but content: heavy half-closed eyelids, brows relaxed and slightly sloped, a small lopsided smile, head tipped a little to one side.",
    emoteShort: "Sleepy content: heavy half-closed lids, soft sloped brows, small lopsided smile, head tipped.",
    scene: "His floating head rests directly on top of a chunky stack of three blank-spined textbooks in dusty blue, cream and terracotta, like a bust on a plinth; a small bent brass desk lamp leans in over him.",
    sceneShort: "His head rests on top of three blank-spined books (dusty blue, cream, terracotta) like a bust on a plinth; a brass desk lamp leans over him.",
    alive: "The lamp throws a warm pool of light on his face and a mug beside the books still steams.",
    aliveShort: "Warm lamp light on his face; a mug still steams.",
    quiff: true,
  },
  {
    key: "office", family: "life", label: "Office",
    head: "At work on calls: a slim headset with a boom mic, the quiff neatly combed.",
    headShort: "Office: slim headset with boom mic, combed quiff.",
    emote: "Emotion, the awkward moment he realises he has been on mute: brows up and pinched together in the middle, eyes wide, a stiff clenched-teeth grimace smile, eyes sliding to the mute light.",
    emoteShort: "Realising he is on mute: brows up and pinched, eyes wide, clenched-teeth grimace, eyes on the light.",
    scene: "Only his floating head sits inside a rounded cream video-call window frame, like a tile in a call, the frame empty below his chin; a sage takeaway coffee cup with a sleeve beside it.",
    sceneShort: "Only his head inside a rounded cream video-call window, empty below the chin; sage takeaway coffee cup beside it.",
    alive: "A tiny green light glows on the headset: he is on mute and does not know it.",
    aliveShort: "A tiny green mute light glows on the headset.",
    quiff: true,
  },
  {
    key: "coder", family: "life", label: "Late-night coder",
    head: "Coding at night: a slouchy grey knit beanie pushed back behind the quiff, over-ear headphones with one cup pushed back, a cool glow on his face from below.",
    headShort: "Night coder: grey beanie behind the quiff, headphones one cup back, cool glow from below.",
    emote: "Emotion, deep focus: brows pulled low and knitted, eyes narrowed to a squint, lips pressed with the tip of the tongue poking out of one corner, eyes on the code bars.",
    emoteShort: "Deep focus: brows low and knitted, squinting, tongue tip poking from the mouth corner.",
    scene: "His floating head hovers above an open charcoal laptop that stands on its own; rounded blank code bars in soft blue and sage float up out of the screen like stacking bricks.",
    sceneShort: "Head hovers above an open charcoal laptop; rounded blank code bars in blue and sage float up out of the screen like bricks.",
    alive: "A small yellow rubber duck sits on the laptop's edge, listening.",
    aliveShort: "A small yellow rubber duck sits on the laptop edge.",
    quiff: true,
  },
  {
    key: "chef", family: "life", label: "Weekend cook",
    head: "Cooking at the weekend: a tall white pleated chef's toque on the quiff, a dab of flour on the nose.",
    headShort: "Cook: tall white pleated toque, flour on the nose.",
    emote: "Emotion, the first taste surprise: brows shot high, eyes wide and bright, lips pushed into a small round oo, eyes on the drop on the spoon.",
    emoteShort: "First-taste surprise: brows high, eyes wide, lips a small round oo, eyes on the spoon drop.",
    scene: "A small copper saucepan sits on a round cream hob ring below his floating head, a wooden spoon standing in it on its own.",
    sceneShort: "A copper saucepan below his head, a wooden spoon standing in it on its own.",
    alive: "Steam curls up from the pan and one drop of sauce hangs from the spoon.",
    aliveShort: "Steam curls up; one sauce drop hangs from the spoon.",
    quiff: true,
  },
  {
    key: "traveller", family: "life", label: "Traveller",
    head: "Travelling: gold aviator sunglasses pushed up into the quiff, a light sunburn across the nose.",
    headShort: "Traveller: aviators pushed up into the quiff, light sunburn.",
    emote: "Emotion, pure wonder: brows lifted, eyes wide and shining, mouth open in a delighted smile, eyes following the paper plane.",
    emoteShort: "Wonder: brows lifted, eyes wide and shining, open delighted smile, eyes following the plane.",
    scene: "His floating head sits inside an open slate-blue hardshell suitcase like a souvenir in its case, a small paper plane in pale blue banking past.",
    sceneShort: "His head sits inside an open slate-blue hardshell suitcase like a souvenir; a pale blue paper plane banks past.",
    alive: "A blank cream luggage tag flutters from the suitcase handle.",
    aliveShort: "A blank cream luggage tag flutters from the handle.",
    quiff: true,
  },
  {
    key: "runner", family: "life", label: "Morning run",
    head: "On a morning run: a terry sweatband under the quiff, flushed cheeks, a single drop of sweat.",
    headShort: "Runner: terry sweatband, flushed cheeks, one sweat drop.",
    emote: "Emotion, pushing through the last stretch: brows knitted, eyes squeezed nearly shut, cheeks puffed, lips blowing out a round puff of breath.",
    emoteShort: "Effort: brows knitted, eyes squeezed, cheeks puffed, lips blowing a round puff of breath.",
    scene: "His head floats above a short curving terracotta running-track lane with white lane lines, one sage running shoe mid-stride on it.",
    sceneShort: "Head above a curving terracotta track lane with white lines; one sage running shoe mid-stride.",
    alive: "A small butter-yellow sun is just rising behind him.",
    aliveShort: "A small yellow sun rising behind him.",
    quiff: true,
  },
  {
    // Guy-Man's gold helmet: pictographs on the LED visor, never words [3].
    key: "daftpunk", family: "life", label: "Daft Punk",
    head: "As a Daft Punk-style robot: a polished gold helmet fully covering his head with a raised fin shaped like his swept two-lobed quiff, a large black glass visor showing his face as glowing LED dots: two dot eyes, the long curved nose, a smile.",
    headShort: "Daft Punk-style robot: polished gold helmet, a fin shaped like his swept quiff, black visor showing his face as LED dots (eyes, curved nose, smile).",
    emote: "Emotion on the visor: the LED eyes are two upturned happy crescents and the LED smile is wide, glowing brighter on the beat.",
    emoteShort: "LED emotion: eyes two happy crescents, wide LED grin glowing on the beat.",
    scene: "The helmet sits above a compact black turntable deck with a vinyl record, a strip of rainbow LED bars along the deck's edge.",
    sceneShort: "Above a compact black turntable with a vinyl record and a rainbow LED strip.",
    alive: "The record is mid-spin and the LED smile on the visor is mid-blink.",
    aliveShort: "Record mid-spin; LED smile mid-blink.",
    quiff: false, hidesFace: true,
  },
  // ---------- films: each scene is the film's most recognisable moment, in miniature ----------
  {
    key: "indy", family: "film", label: "Indiana Jones",
    head: "As Indiana Jones from Raiders of the Lost Ark: a battered brown felt fedora over the quiff, stubble, a scratch on the cheek.",
    headShort: "As Indiana Jones: battered brown fedora, stubble, cheek scratch.",
    emote: "Emotion, alarm: brows high and pinched together, eyes wide, mouth stretched in a tight oh-no grimace, eyes cut back over his shoulder at the boulder.",
    emoteShort: "Alarm: brows high and pinched, eyes wide, oh-no grimace, eyes cut back at the boulder.",
    scene: "Beside him a small golden idol on a carved stone pedestal, a coiled leather bullwhip at its foot.",
    sceneShort: "Beside him a golden idol on a stone pedestal, a coiled bullwhip at its foot.",
    alive: "A round stone boulder is rolling in from behind.",
    aliveShort: "A round boulder rolls in from behind.",
    quiff: true,
  },
  {
    key: "potter", family: "film", label: "Harry Potter",
    head: "As Harry Potter: thin round wire glasses, a lightning-bolt scar under the quiff.",
    headShort: "As Harry Potter: round wire glasses, lightning scar.",
    emote: "Emotion, wide-eyed wonder: brows lifted, eyes big and sparkling behind the glasses, lips parted in a soft amazed smile, eyes on the golden ball.",
    emoteShort: "Wonder: brows lifted, eyes big and sparkling, soft amazed smile, eyes on the golden ball.",
    scene: "A small white snowy owl perches on top of his quiff; a slim wooden wand floats beside him, a red and gold striped scarf looped loosely around it.",
    sceneShort: "A snowy owl perches on his quiff; a wand floats beside him, a red and gold striped scarf looped around it.",
    alive: "A tiny golden winged ball hovers just out of reach, wings a blur.",
    aliveShort: "A tiny golden winged ball hovers, wings a blur.",
    quiff: true,
  },
  {
    key: "sparrow", family: "film", label: "Jack Sparrow",
    head: "As Captain Jack Sparrow from Pirates of the Caribbean: a red bandana under a worn brown tricorn hat, beaded braids, kohl around the eyes, a braided goatee.",
    headShort: "As Jack Sparrow: red bandana, worn tricorn, beaded braids, kohl eyes, braided goatee.",
    emote: "Emotion, suspicious puzzlement: one brow cocked high and the other pulled down, eyes narrowed at the compass, lips pursed off to one side.",
    emoteShort: "Puzzled: one brow cocked, one low, eyes narrowed at the compass, lips pursed sideways.",
    scene: "Beside him an open brass compass and a tiny sailing ship in a bottle.",
    sceneShort: "Beside him an open brass compass and a ship in a bottle.",
    alive: "The compass needle is spinning and will not settle.",
    aliveShort: "The compass needle spins and will not settle.",
    quiff: false,
  },
  {
    key: "neo", family: "film", label: "Neo",
    head: "As Neo from The Matrix: narrow black oval sunglasses, the quiff slicked back.",
    headShort: "As Neo: narrow black oval sunglasses, quiff slicked back.",
    emote: "Emotion, total calm: brows level and very slightly lowered above the sunglasses, mouth a flat composed line, chin lifted a touch, unbothered by the bullets.",
    emoteShort: "Total calm: level brows, flat composed mouth, chin slightly lifted, unbothered.",
    scene: "Behind him falling columns of glowing green blank bars; in front, a red pill and a blue pill.",
    sceneShort: "Behind him falling columns of glowing green blank bars; in front a red and a blue pill.",
    alive: "Three bullets hang frozen mid-air beside his head, each with a ripple trail.",
    aliveShort: "Three bullets frozen mid-air beside him, ripple trails.",
    quiff: true,
  },
  {
    key: "joker", family: "film", label: "The Joker",
    head: "As the Joker from The Dark Knight: the quiff dyed a messy green, smeared white face paint, dark smudged eye sockets, a smeared red painted smile.",
    headShort: "As the Joker: messy green quiff, smeared white paint, smudged eyes, smeared red paint smile.",
    emote: "Emotion, gleeful mischief: brows arched high, eyes wide and gleaming, a huge open grin showing teeth, head tilted.",
    emoteShort: "Gleeful mischief: brows arched high, eyes wide and gleaming, huge toothy grin, head tilted.",
    scene: "Beside him a loose fan of blank purple playing cards.",
    sceneShort: "Beside him a loose fan of blank purple playing cards.",
    alive: "One card is flipping through the air, caught mid-turn.",
    aliveShort: "One card flips through the air mid-turn.",
    quiff: true,
  },
  {
    key: "wolverine", family: "film", label: "Wolverine",
    head: "As Wolverine from X-Men: the quiff swept up into two sharp points, thick mutton-chop sideburns.",
    headShort: "As Wolverine: quiff in two sharp points, mutton-chop sideburns.",
    emote: "Emotion, a snarl: brows driven down into a hard V, eyes narrowed, upper lip curled back over clenched teeth.",
    emoteShort: "Snarl: brows in a hard V, eyes narrowed, lip curled over clenched teeth.",
    scene: "Beside him three short polished steel claws and a pair of dog tags on a ball chain.",
    sceneShort: "Beside him three polished steel claws and dog tags on a ball chain.",
    alive: "Three clean scratch marks are cut into the ground beside the claws.",
    aliveShort: "Three scratch marks cut into the ground.",
    quiff: false,
  },
  {
    key: "gandalf", family: "film", label: "Gandalf",
    head: "As Gandalf the Grey from The Lord of the Rings: a tall pointed grey wizard hat over the quiff, a long grey beard, bushy grey brows.",
    headShort: "As Gandalf: tall pointed grey hat, long grey beard, bushy brows.",
    emote: "Emotion, knowing amusement: one bushy brow raised, eyes crinkled at the corners, a small closed smile under the beard.",
    emoteShort: "Knowing amusement: one brow raised, eyes crinkled, small closed smile.",
    scene: "Beside him the gnarled top of a wooden staff with a softly glowing white tip.",
    sceneShort: "Beside him a gnarled wooden staff top, glowing white tip.",
    alive: "A single smoke ring drifts up and away from him.",
    aliveShort: "A smoke ring drifts up from him.",
    quiff: false,
  },
];

const by = (list, key) => list.find((x) => x.key === key) || list[0];

export const STYLES = [
  {
    key: "away-icon",
    label: "Away icon vignette",
    blurb: "The base head as the hero of a miniature icon scene, built on the Away product-icon recipe.",
    parts: (pick) => {
      const c = pick.length === "compact";
      const r = by(ROLES, pick.role);
      const t = by(THEMES, pick.theme);
      const id = r.hidesFace
        ? (c ? "Same person inside the helmet." : "The same person, his head fully inside the helmet.")
        : (c ? IDENTITY_SHORT : IDENTITY).replace("QUIFF ", r.quiff ? `${c ? QUIFF_SHORT : QUIFF} ` : "");
      return c
        ? [ANCHOR_SHORT, NO_BODY_SHORT, id, r.headShort, r.emoteShort, r.sceneShort, r.aliveShort, RECIPE_SHORT, t.short, GROUND_SHORT]
        : [ANCHOR, NO_BODY, id, r.head, r.emote, r.scene, r.alive, RECIPE, t.full, GROUND];
    },
  },
];

export const avatarRolesRecipe = defineRecipe({
  key: "avatar-roles",
  label: "Avatar roles",
  dials: { role: ROLES, theme: THEMES, length: ["compact", "full"] },
  extraRule: EXTRA_RULE,
  extraRuleCompact: EXTRA_RULE_COMPACT,
  styles: STYLES,
  tokens: [
    "Vignette: head is the hero; one hero object, at most two props (Away icon composition rule)",
    "Alive: one characterful detail that adds meaning (Airbnb house icon: the door opens, the porch light comes on)",
    "Theme: one Away colour theme line, everything else constant",
    "Films: name AND parts, so the parts still work if a model declines the name",
  ],
});

export const { compose, styleMeta: STYLE_META } = avatarRolesRecipe;
