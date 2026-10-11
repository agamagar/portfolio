// Recipe for the "Avatar lives" prompt system: the site avatar as ONE 3D character lived
// many ways. Same face, same glossy designer-toy render, same head-only framing; only the
// life changes: age, skin, hair or headwear, a visible aid, a mark, an expression.
//
// Every prompt is an EDIT of the chosen base render (Claude/Prompt Library/avatar-3d/
// base-v2.webp), attached as the only reference. Never mention the original line drawing:
// on 7 Oct a nose edit that did re-rendered the whole head back toward the flat drawing.
//
// Research: research/avatarLives.md. What it changed, in one line each:
//   - Ordinary, not tragic and not heroic: every life keeps the same warm expression, the
//     same eye-level camera and the same light as the base [6][7].
//   - Aids are drawn precisely and plainly, the way Memoji ships them as ordinary options
//     (cochlear implants, oxygen tubes, soft helmet) [1][2].
//   - Skin comes from the Monk Skin Tone scale with its hex, never picked by eye [4].
//   - Age shows as vibrant and engaged, never frail [9].
//   - Age is carried in the toy's own shapes (quiff colour and volume, soft sculpted
//     creases, cheek fullness), not photoreal wrinkles, or the material changes.
//
// Clause order never varies: anchor, identity, the one life, dignity, render, framing, rules.
import { defineRecipe } from "./recipe.js";

export const COMPACT_LIMIT = 1000;

export const EXTRA_RULE = "No logos or branding on any aid or headwear.";
export const EXTRA_RULE_COMPACT = "No logos on any aid.";

export const ANCHOR =
  "Edit the attached 3D head into another life of the same person. Keep the render, material and framing exactly; change only what is described below.";
export const ANCHOR_SHORT =
  "Edit the attached 3D head into another life of the same person; change only what is described.";

// The quiff is part of the identity only where the hair dial and the aid leave it visible;
// a turban, a buzz cut or a soft helmet would otherwise be told to keep a quiff it covers.
export const QUIFF = "the tall swept quiff with two rounded lobes rising up and right,";
export const QUIFF_SHORT = "swept two-lobed quiff rising up-right,";
export const COVERS_QUIFF = { hair: ["buzz", "turban"], aid: ["helmet"] };
const quiffShows = (pick) =>
  !COVERS_QUIFF.hair.includes(pick.hair) && !COVERS_QUIFF.aid.includes(pick.aid);

export const IDENTITY =
  "The same face in every life: QUIFF the big rounded left ear, short brow bars, small glossy bead eyes, the long soft nose blending into a rounded tip, the small carved smile.";
export const IDENTITY_SHORT =
  "Same face: QUIFF big rounded left ear, short brow bars, small bead eyes, long nose with a rounded tip, small carved smile.";

// [6][7][9] research/avatarLives.md: no pity, no inspiration framing, eye level, same light.
export const DIGNITY =
  "He looks relaxed and confident, at ease in his own life: eye-level camera, the same even studio light as every other version. Any aid is sculpted as precisely as an accessory, neither hidden nor made the focus.";
export const DIGNITY_SHORT =
  "Relaxed and confident, eye-level camera, same even light; any aid sculpted precisely, not hidden, not the focus.";

export const RENDER =
  "Render unchanged: glossy designer-toy 3D, satin hair, smooth matte skin, soft studio key from the upper left, soft contact shadow.";
export const RENDER_SHORT = "Same glossy designer-toy 3D render and light.";

export const FRAMING =
  "Head only, floating, no neck or body, three-quarter view facing right, centred on a square canvas, plain light grey background #E9E7E3.";
export const FRAMING_SHORT = "Head only, floating, three-quarter right, centred, square, plain light grey #E9E7E3.";

// ---------- dials: SHAPE of the life only; the look never changes ----------

export const AGES = [
  { key: "base", label: "As is (30s)", full: "", short: "" },
  {
    key: "child",
    label: "Child (7)",
    full: "Age about seven: a rounder head with a bigger cranium, fuller cheeks, a shorter softer nose that keeps its rounded tip, a smaller fluffier quiff of the same shape, bigger eyes relative to the face.",
    short: "Age seven: rounder head, full cheeks, shorter nose same tip, smaller fluffy quiff.",
  },
  {
    key: "teen",
    label: "Teen (16)",
    full: "Age about sixteen: a slightly longer leaner face, the quiff taller and stiffer with gel, a few small soft blemishes on the cheeks.",
    short: "Age sixteen: leaner face, taller gelled quiff, a few small blemishes.",
  },
  {
    key: "fifties",
    label: "Fifties",
    full: "Age about fifty-five: silver grey at the temples and through the hair, soft sculpted smile lines and crow's feet, a slightly heavier jaw.",
    short: "Age fifty-five: grey temples and hair, soft smile lines, heavier jaw.",
  },
  {
    key: "elder",
    label: "Elder (80)",
    full: "Age about eighty: a soft white quiff, thinner but still the same swept shape, smooth sculpted wrinkles at the eyes and brow, softer cheeks, bushier white brows, eyes bright and amused.",
    short: "Age eighty: soft white thinner quiff same shape, sculpted wrinkles, bushy white brows, bright amused eyes.",
  },
];

// Monk Skin Tone scale [4]: step and hex. "base" keeps the render's cream.
export const SKINS = [
  { key: "base", label: "As is", full: "", short: "" },
  { key: "mst1", label: "MST 1", full: "Skin tone Monk scale 1, very fair #F6EDE4, with a faint pink flush on the cheeks.", short: "Skin Monk 1 #F6EDE4." },
  { key: "mst5", label: "MST 5", full: "Skin tone Monk scale 5, warm medium #D7BD96.", short: "Skin Monk 5 #D7BD96." },
  { key: "mst6", label: "MST 6", full: "Skin tone Monk scale 6, warm tan brown #A07E56.", short: "Skin Monk 6 #A07E56." },
  { key: "mst7", label: "MST 7", full: "Skin tone Monk scale 7, brown #825C43.", short: "Skin Monk 7 #825C43." },
  { key: "mst9", label: "MST 9", full: "Skin tone Monk scale 9, deep brown #3A312A, with warm highlights so the form still reads.", short: "Skin Monk 9 #3A312A, warm highlights." },
  { key: "mst10", label: "MST 10", full: "Skin tone Monk scale 10, deepest brown #292420, with warm highlights so the form still reads.", short: "Skin Monk 10 #292420, warm highlights." },
];

export const HAIRS = [
  { key: "base", label: "Swept quiff", full: "", short: "" },
  {
    key: "curls",
    label: "Curly quiff",
    full: "The quiff in tight springy curls, the same tall two-lobed silhouette built from curls.",
    short: "Quiff in tight curls, same two-lobed silhouette.",
  },
  {
    key: "locs",
    label: "Locs",
    full: "Hair in short locs gathered up and back into the same tall swept silhouette.",
    short: "Short locs gathered up into the same swept silhouette.",
  },
  {
    key: "buzz",
    label: "Buzz cut",
    full: "A short even buzz cut in place of the quiff, a soft velvety texture over the skull.",
    short: "Short velvety buzz cut instead of the quiff.",
  },
  {
    key: "turban",
    label: "Turban",
    full: "A neatly tied Sikh turban (dastar) in deep saffron, crisp folds rising to a point at the front, covering the hair; a short full beard.",
    short: "Neat saffron Sikh turban, crisp folds; short full beard.",
  },
  {
    key: "kufi",
    label: "Kufi cap",
    full: "A white crocheted kufi cap sitting on top of the head, the quiff's ends just showing at the front.",
    short: "White crocheted kufi cap, quiff ends showing at the front.",
  },
];

// Only what shows on a head-only crop [1][2]. Each named by the device's real parts.
export const AIDS = [
  { key: "none", label: "None", full: "", short: "" },
  {
    key: "hearing",
    label: "Hearing aid",
    full: "A small behind-the-ear hearing aid on the left ear in matte grey, a thin clear tube curving into the ear.",
    short: "Small grey behind-the-ear hearing aid, thin clear tube into the left ear.",
  },
  {
    key: "cochlear",
    label: "Cochlear implant",
    full: "A cochlear implant: a sound processor behind the left ear and a short cable to a round magnetic coil on the side of the head, in a bright teal.",
    short: "Cochlear implant: teal processor behind the left ear, cable to a round coil on the head.",
  },
  {
    key: "lowvision",
    label: "Low-vision glasses",
    full: "Thick round low-vision glasses in a sturdy black frame, the lenses magnifying the eyes slightly.",
    short: "Thick round low-vision glasses, sturdy black frame, eyes slightly magnified.",
  },
  {
    key: "cannula",
    label: "Nasal cannula",
    full: "A thin clear nasal cannula looped over both ears and resting under the nose.",
    short: "Thin clear nasal cannula over the ears, under the nose.",
  },
  {
    key: "helmet",
    label: "Soft helmet",
    full: "A soft padded protective helmet in navy fabric with a chin strap, the quiff tucked in, a few strands showing at the front.",
    short: "Soft padded navy protective helmet with chin strap, quiff tucked in.",
  },
  {
    key: "cleft",
    label: "Repaired cleft lip",
    full: "A repaired cleft lip: a fine vertical scar running from the upper lip to the left nostril, the smile unchanged.",
    short: "Repaired cleft lip: fine vertical scar from lip to left nostril.",
  },
];

export const MARKS = [
  { key: "none", label: "None", full: "", short: "" },
  { key: "freckles", label: "Freckles", full: "A scatter of small freckles across the nose and cheeks.", short: "Freckles across nose and cheeks." },
  { key: "vitiligo", label: "Vitiligo", full: "Vitiligo: well-defined patches of lighter skin around the eyes and on one cheek.", short: "Vitiligo patches around the eyes and one cheek." },
  { key: "portwine", label: "Port-wine stain", full: "A flat wine-red port-wine stain birthmark across the right cheek.", short: "Flat wine-red birthmark on the right cheek." },
  { key: "stubble", label: "Stubble", full: "Short dark stubble along the jaw and upper lip.", short: "Short stubble on jaw and lip." },
  { key: "moustache", label: "Moustache", full: "A full rounded moustache in the hair colour.", short: "Full rounded moustache." },
  { key: "paint", label: "Paint smudge", full: "A small smudge of blue paint on the cheek, as if he just stepped out of the studio.", short: "Small blue paint smudge on the cheek." },
];

export const EXPRESSIONS = [
  { key: "smile", label: "Small smile", full: "", short: "" },
  { key: "laugh", label: "Laugh", full: "Expression: a warm open laugh, eyes creased.", short: "Warm open laugh." },
  { key: "calm", label: "Calm", full: "Expression: calm and content, a softer smile.", short: "Calm, softer smile." },
];

const by = (list, key) => list.find((x) => x.key === key) || list[0];

export const STYLES = [
  {
    key: "base-v2",
    label: "Base toy render",
    blurb: "The chosen glossy designer-toy head, unchanged; only the life changes.",
    parts: (pick) => {
      const c = pick.length === "compact";
      const f = c ? "short" : "full";
      return [
        c ? ANCHOR_SHORT : ANCHOR,
        (c ? IDENTITY_SHORT : IDENTITY).replace("QUIFF ", quiffShows(pick) ? `${c ? QUIFF_SHORT : QUIFF} ` : ""),
        by(AGES, pick.age)[f],
        by(SKINS, pick.skin)[f],
        by(HAIRS, pick.hair)[f],
        by(AIDS, pick.aid)[f],
        by(MARKS, pick.mark)[f],
        by(EXPRESSIONS, pick.expression)[f],
        c ? DIGNITY_SHORT : DIGNITY,
        c ? RENDER_SHORT : RENDER,
        c ? FRAMING_SHORT : FRAMING,
      ];
    },
  },
];

// The portfolio set: twelve lives picked so every dial shows, disability spans the skin
// range rather than sitting on one tone [6], and no two neighbours share an age.
export const CURATED = [
  { name: "The original", age: "base", skin: "base", hair: "base", aid: "none", mark: "none", expression: "smile" },
  { name: "Seven", age: "child", skin: "mst7", hair: "curls", aid: "none", mark: "freckles", expression: "laugh" },
  { name: "Sixteen", age: "teen", skin: "mst5", hair: "base", aid: "cochlear", mark: "none", expression: "smile" },
  { name: "Grandad", age: "elder", skin: "mst6", hair: "base", aid: "hearing", mark: "none", expression: "laugh" },
  { name: "Turban", age: "fifties", skin: "mst5", hair: "turban", aid: "none", mark: "none", expression: "smile" },
  { name: "Vitiligo", age: "base", skin: "mst9", hair: "buzz", aid: "none", mark: "vitiligo", expression: "calm" },
  { name: "Reader", age: "elder", skin: "mst1", hair: "base", aid: "lowvision", mark: "moustache", expression: "smile" },
  { name: "Kufi", age: "base", skin: "mst7", hair: "kufi", aid: "none", mark: "stubble", expression: "calm" },
  { name: "Helmet", age: "child", skin: "mst1", hair: "base", aid: "helmet", mark: "none", expression: "laugh" },
  { name: "Locs", age: "teen", skin: "mst10", hair: "locs", aid: "none", mark: "none", expression: "smile" },
  { name: "Cleft", age: "base", skin: "base", hair: "base", aid: "cleft", mark: "paint", expression: "smile" },
  { name: "Oxygen", age: "fifties", skin: "mst9", hair: "base", aid: "cannula", mark: "portwine", expression: "calm" },
];

export const avatarLivesRecipe = defineRecipe({
  key: "avatar-lives",
  label: "Avatar lives",
  dials: {
    age: AGES,
    skin: SKINS,
    hair: HAIRS,
    aid: AIDS,
    mark: MARKS,
    expression: EXPRESSIONS,
    length: ["compact", "full"],
  },
  extraRule: EXTRA_RULE,
  extraRuleCompact: EXTRA_RULE_COMPACT,
  styles: STYLES,
  tokens: [
    "Identity: quiff silhouette, left ear, long nose with rounded tip, small smile; survive every life",
    "Dignity: same expression family, eye level, same light for every life",
    "Skin: Monk Skin Tone step plus hex, never by eye",
    "Aid: only what shows on a head, named by its real parts",
  ],
});

export const { compose, styleMeta: STYLE_META } = avatarLivesRecipe;
