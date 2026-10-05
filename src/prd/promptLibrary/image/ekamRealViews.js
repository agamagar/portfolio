// EKAM "Real": the photographic register, built as TWO separate styles rather than one
// style with a subject dial, because a portrait of a woman and a still life of an object
// share almost no clauses once you get past the grade.
//
//   real-portrait   - documentary/environmental portraiture of real women.
//   real-still-life - photographed objects, the same lived-detail set the Chalk Print
//                     dial carries, shot on a real surface instead of carved into a block.
//
// Why this is a real gap in the system: every existing EKAM style is a made image (a
// defocused abstract, a carved print, a flat icon, a flat silhouette). Nothing in the
// group has ever been a photograph of an actual person or an actual object, so there was
// no way to make an asset that says "this is a real woman in Dehradun" rather than
// "this is an ornament about her".
//
// The discretion tension, stated rather than dodged. Soft Focus exists because softness
// IS the discretion promise made visual (ekamViews.js). A recognisable photograph of a
// woman's face runs directly against that, for a patient described in brand-strategy.md
// as a young woman under family and social scrutiny. The resolution here is NOT to ban
// portraits, it is to make identifiability a DIAL: the framing dial runs from hands only
// through to direct-to-camera, so the person composing an asset has to choose how visible
// she is instead of getting a face by default. The default position is the least
// identifiable one.
//
// EXTRA_RULE (no anatomy, no clinical imagery, no medical instruments, no nudity) is
// inherited unchanged from ekamViews.js and does real work here: it is why the consult
// moment is two people talking at a desk with nothing clinical on it.
import { defineRecipe } from "./recipe.js";
import { EXTRA_RULE, EXTRA_RULE_COMPACT } from "./ekamViews.js";

export const COMPACT_LIMIT = 1000;

// The grade. Not a filter: the brand's own palette described as things that are actually
// in the room, so the model builds the colour rather than tinting it on afterwards.
export const TOKENS = [
  ["Grade", "warm and desaturated", "no cool cast, no heavy contrast"],
  ["Ground tones", "#F7F2EF / #EDE5D6", "warm white and oat, as real walls and cloth"],
  ["Accents in frame", "#AEB9E8 / #E9B9C6 / #F0DE86", "periwinkle, blush, soft yellow, as real objects"],
];

export const GRADE =
  "The colour is warm and gently desaturated throughout, closer to soft daylight than to a saturated commercial grade: warm whites and oat tones carry the frame, with periwinkle, blush or soft yellow appearing only as real things in the scene, a dupatta, a cushion, a painted wall, never as a colour wash laid over the picture. No cool blue cast, no heavy contrast, no crushed blacks, no orange and teal grade, no filter look.";
export const GRADE_SHORT =
  "Warm, gently desaturated daylight colour. Periwinkle, blush or soft yellow only as real objects. No cool cast, no filter look.";

// Camera language over quality boosters, per research/models.md: OpenAI's own guidance is
// that lens, aperture feel and lighting steer realism more reliably than "8K/ultra-detailed".
export const CAMERA =
  "Shot on a fast prime lens at a wide aperture, the subject sharp and the background falling gently out of focus, at a natural eye-level standing height, handheld rather than tripod-locked. A real photograph with real depth of field, not a render, not an illustration, not AI-smooth skin.";
export const CAMERA_SHORT =
  "Fast prime wide open, subject sharp, background soft, eye level, handheld. A real photograph, not a render.";

export const HONEST =
  "Everything is left as it really is: real skin with real texture, visible pores and fine lines, no retouching, no skin smoothing, no slimming, no whitening, no beauty filter. Ordinary clothes, ordinary hair, an ordinary room that looks lived in rather than styled for a shoot.";
export const HONEST_SHORT =
  "Real skin texture, no retouching, smoothing, whitening or beauty filter. Ordinary clothes, a lived-in room.";

export const RENDER =
  "Clean and quiet: no lens flare, no bloom, no vignette, no heavy grain, no motion blur, no tilt, no props arranged to point at the subject, nothing else competing for attention in the frame.";
export const RENDER_SHORT =
  "No flare, bloom, vignette, heavy grain, motion blur or tilt.";

// ---------- portrait: who and where ----------
// Named specifically (north Indian, Dehradun, a hill town) because a generic "woman"
// prompt drifts to a western stock default, which is the wrong patient entirely.
export const SUBJECT =
  "A real north Indian woman in her late twenties or thirties, photographed in Dehradun, a small hill town in Uttarakhand, dressed in everyday Indian clothes she would actually wear on that day. She is calm and self-possessed, not smiling for the camera and not performing distress.";
export const SUBJECT_SHORT =
  "A real north Indian woman, late twenties or thirties, in Dehradun, everyday Indian clothes, calm, not smiling for the camera.";

// ---------- portrait dial 1: framing (the identifiability control) ----------
// Ordered least identifiable first, so the DEFAULT position of this dial is the most
// discreet one. This is the clause that carries the brand's discretion promise into a
// medium that does not get it for free the way a blurred abstract does.
export const FRAMINGS = [
  {
    key: "hands",
    label: "Hands only",
    framing:
      "Framed on her hands alone, close in, her face entirely outside the frame and no part of it visible.",
    framingShort: "Her hands alone, close in, face entirely out of frame.",
  },
  {
    key: "behind",
    label: "From behind",
    framing:
      "Photographed from behind or just over her shoulder, so she is unmistakably present but not identifiable, her face turned away from the camera.",
    framingShort: "From behind or over her shoulder, present but not identifiable, face turned away.",
  },
  {
    key: "turned",
    label: "Turned away",
    framing:
      "Turned three quarters away from the camera with her face caught only in partial edge, most of it lost to the turn, so she reads as a specific person without being recognisable.",
    framingShort: "Turned three quarters away, face only in partial edge, specific but not recognisable.",
  },
  {
    key: "profile",
    label: "Quiet profile",
    framing:
      "A quiet profile at close range, her eyes lowered and her face fully visible in side view, unhurried and composed.",
    framingShort: "Close profile, eyes lowered, face visible in side view, composed.",
  },
  {
    key: "direct",
    label: "Direct",
    framing:
      "Looking straight down the lens at close range, level with the camera, holding the look without challenge and without appeal.",
    framingShort: "Straight down the lens, close, level, holding the look without challenge or appeal.",
  },
];

// ---------- portrait dial 2: the moment ----------
// Ordinary hours, not clinical ones. The consult moment is deliberately two people
// talking at a bare desk, because EXTRA_RULE bars instruments and because the brand's
// whole pitch is that a consult is a conversation.
export const MOMENTS = [
  {
    key: "morning",
    label: "Morning",
    scene:
      "Standing at a kitchen counter early in the morning, mid-routine, a steel tumbler and the ordinary clutter of a household morning around her.",
    sceneShort: "At a kitchen counter early morning, mid-routine, a steel tumbler and household clutter.",
  },
  {
    key: "mirror",
    label: "At the mirror",
    scene:
      "In front of a small bathroom mirror in the first light, close to the glass, the moment private and unremarkable.",
    sceneShort: "At a small bathroom mirror in first light, close to the glass, private and unremarkable.",
  },
  {
    key: "waiting",
    label: "Waiting",
    scene:
      "Sitting in a plain, warm waiting area on an upholstered chair, bag in her lap, waiting without impatience. The room is calm and domestic in feeling, with nothing clinical in it.",
    sceneShort: "In a plain warm waiting area, bag in her lap, calm, nothing clinical in the room.",
  },
  {
    key: "consult",
    label: "In consult",
    scene:
      "Sitting across a plain wooden desk from a woman doctor in ordinary clothes, mid conversation, both leaning slightly in. The desk is bare apart from a notebook. No instruments, no equipment, no charts, nothing medical anywhere in the room.",
    sceneShort: "Across a plain desk from a woman doctor, mid conversation, only a notebook, nothing medical in the room.",
  },
  {
    key: "afternoon",
    label: "Late afternoon",
    scene:
      "At a work desk in the late afternoon, mid task and visibly tired, the light gone long and low across the room.",
    sceneShort: "At a work desk late afternoon, mid task, visibly tired, light long and low.",
  },
  {
    key: "outside",
    label: "Outside",
    scene:
      "Walking on a quiet hill-town street with low buildings and trees behind her, unhurried, the town ordinary rather than picturesque.",
    sceneShort: "Walking a quiet hill-town street, low buildings and trees behind, unhurried and ordinary.",
  },
];

// ---------- portrait dial 3: light ----------
// Available-light vocabulary, sourced 2026-08-21: available light is any source not
// supplied by the photographer, window light is prized in portraiture because it is soft
// and comes from a fixed direction, and a catchlight in the eye is the named detail that
// makes a portrait read as alive (research/ekam.md, Real section).
export const LIGHTS = [
  {
    key: "window",
    label: "Window light",
    light:
      "Lit entirely by soft directional window light from one side, the shadow side falling away gently with no fill, a small round catchlight in the eye where the eye is visible.",
    lightShort: "Soft directional window light one side, shadow side unfilled, a small round catchlight.",
  },
  {
    key: "overcast",
    label: "Overcast",
    light:
      "Lit by flat, even overcast daylight with no visible sun and no hard shadow anywhere, the whole frame softly and equally lit.",
    lightShort: "Flat even overcast daylight, no visible sun, no hard shadow anywhere.",
  },
  {
    key: "evening",
    label: "Low evening",
    light:
      "Lit by low warm evening sun raking in almost horizontally, long soft shadows stretching across the frame, the warmth coming from the hour rather than from a grade.",
    lightShort: "Low warm evening sun raking in nearly horizontal, long soft shadows, warmth from the hour not a grade.",
  },
  {
    key: "lamp",
    label: "Lamp",
    light:
      "Lit after dark by a single warm household lamp just out of frame, the light falling off quickly into a soft dark room, no overhead light and no second source.",
    lightShort: "One warm household lamp out of frame after dark, quick falloff into a soft dark room, no second source.",
  },
];

// ---------- still life dial 1: the object ----------
// Keys deliberately match ekamExperiment2Views.js MOTIFS where an ornament has a real
// physical counterpart, so the same subject can be seen in both registers. Two chalk
// ornaments are absent on purpose: "starburst" and "crescent" are drawn devices with no
// honest still-life equivalent, and inventing a prop for them would be the tail wagging
// the dog. "gapped-grid" keeps its key but becomes a hand-drawn paper grid, because a real
// calendar carries numbers and the library's global rule bars text in the image.
export const REAL_OBJECTS = [
  {
    key: "gapped-grid",
    label: "Paper grid",
    object:
      "An open notebook on a table, a month grid ruled by hand across the page in pen, several cells marked with a small cross and a run of cells left conspicuously blank. The grid is ruled but completely unlettered, with no numbers, dates or writing of any kind anywhere on the page.",
    objectShort:
      "An open notebook, a hand-ruled month grid, some cells crossed and a run left blank, completely unlettered, no numbers or writing.",
  },
  {
    key: "hand-mirror",
    label: "Hand mirror",
    object:
      "A small hand mirror lying face up on a bathroom shelf, catching a plain patch of ceiling in its glass, a pair of tweezers set down beside it.",
    objectShort: "A small hand mirror face up on a bathroom shelf catching plain ceiling, tweezers beside it.",
  },
  {
    key: "comb",
    label: "Comb",
    object:
      "A comb resting on a folded cotton cloth with several long dark strands of hair caught in its teeth, the strands trailing loose across the cloth.",
    objectShort: "A comb on a folded cotton cloth, long dark strands caught in the teeth and trailing across it.",
  },
  {
    key: "balance",
    label: "Balance",
    object:
      "A small old brass balance standing on a table, its beam level and both shallow pans completely empty, the metal dulled with use.",
    objectShort: "A small old brass balance, beam level, both shallow pans empty, metal dulled with use.",
  },
  {
    key: "seed-pod",
    label: "Pomegranate",
    object:
      "A pomegranate cut clean in half on a wooden board, the two halves set beside each other, seeds dense and glistening, a few fallen loose onto the board.",
    objectShort: "A pomegranate cut in half on a wooden board, both halves showing dense glistening seeds, a few fallen loose.",
  },
  {
    key: "garland",
    label: "Marigold garland",
    object:
      "A fresh marigold garland hung from a nail against a plain wall, the loop dipping and the two ends hanging free, a few petals dropped on the floor beneath it.",
    objectShort: "A fresh marigold garland hung from a nail on a plain wall, ends hanging free, a few petals dropped beneath.",
  },
  {
    key: "vase-bud",
    label: "Vessel & bud",
    object:
      "A small plain ceramic vessel holding one single stem with an unopened bud, set alone on a table with clear space around it.",
    objectShort: "A small plain ceramic vessel holding one stem with an unopened bud, alone on a table with clear space.",
  },
  {
    key: "fern",
    label: "Fern",
    object:
      "A single fresh fern frond laid flat on a table, its leaflets fanned open, one edge beginning to curl.",
    objectShort: "One fresh fern frond laid flat, leaflets fanned open, one edge beginning to curl.",
  },
  {
    key: "low-sun",
    label: "Late light",
    object:
      "No object at all, only late afternoon light falling across an empty table through a window, the shadow of the frame stretched long across the surface.",
    objectShort: "No object, only late light falling across an empty table, the window frame's shadow stretched long.",
  },
];

// ---------- still life dial 2: the surface ----------
export const SURFACES = [
  {
    key: "plaster",
    label: "Plaster",
    surface: "Set on and against warm oat-coloured plaster, slightly uneven, the wall of an ordinary Indian home.",
    surfaceShort: "On warm oat plaster, slightly uneven, an ordinary Indian home.",
  },
  {
    key: "wood",
    label: "Wood",
    surface: "Set on a worn wooden surface with the grain showing and the finish rubbed thin in places.",
    surfaceShort: "On worn wood, grain showing, finish rubbed thin.",
  },
  {
    key: "cotton",
    label: "Cotton",
    surface: "Set on undyed handloom cotton, the weave visible and the cloth loosely creased rather than pressed flat.",
    surfaceShort: "On undyed handloom cotton, weave visible, loosely creased not pressed.",
  },
  {
    key: "steel",
    label: "Steel",
    surface: "Set on a plain steel kitchen surface, brushed and faintly scratched from use.",
    surfaceShort: "On plain brushed steel, faintly scratched from use.",
  },
];

// ---------- still life dial 3: light ----------
// Still-life lighting vocabulary, sourced 2026-08-21: diffused window light through a
// scrim is the workhorse, side and raking light at roughly 45 degrees is what reveals
// texture and three-dimensionality, and negative fill (blocking rather than adding light)
// is the named technique for deepening the shadow side (research/ekam.md, Real section).
export const STILL_LIGHTS = [
  {
    key: "diffused",
    label: "Diffused",
    light:
      "Lit by soft diffused window light through a scrim, broad and even, shadows present but open and gentle.",
    lightShort: "Soft diffused window light through a scrim, broad and even, shadows open and gentle.",
  },
  {
    key: "raking",
    label: "Raking",
    light:
      "Lit by raking side light striking the scene at roughly forty five degrees so that every surface texture is picked out in relief, with deep open shadow held on the far side by negative fill rather than lifted with a reflector.",
    lightShort: "Raking side light near forty five degrees picking out texture in relief, far side held deep by negative fill.",
  },
  {
    key: "overcast",
    label: "Overcast",
    light: "Lit by flat overcast daylight, shadowless and even, nothing dramatised.",
    lightShort: "Flat overcast daylight, shadowless and even, nothing dramatised.",
  },
  {
    key: "evening",
    label: "Low evening",
    light:
      "Lit by low evening sun coming in almost horizontally, the shadows thrown long across the surface and well past the object.",
    lightShort: "Low evening sun nearly horizontal, shadows thrown long across the surface past the object.",
  },
];

const pickFrom = (list, key) => list.find((x) => x.key === key) || list[0];

const realPortrait = {
  key: "real-portrait",
  label: "Real · portrait",
  blurb:
    "Documentary photography of real women in Dehradun. Warm available light, no retouching. The framing dial is the discretion control: it runs from hands only to direct to camera, and it defaults to the least identifiable position.",
  parts: (pick = {}) => {
    const compact = pick.length === "compact";
    const framing = pickFrom(FRAMINGS, pick.asset);
    const moment = pickFrom(MOMENTS, pick.motif);
    const light = pickFrom(LIGHTS, pick.colourway);
    return [
      compact
        ? "A real documentary photograph, not an illustration or staged stock photo."
        : "A real documentary photograph in the register of honest editorial portraiture: not an illustration, not a render, and not a staged stock photo.",
      compact ? SUBJECT_SHORT : SUBJECT,
      compact ? moment.sceneShort : moment.scene,
      compact ? framing.framingShort : framing.framing,
      compact ? light.lightShort : light.light,
      compact ? CAMERA_SHORT : CAMERA,
      compact ? HONEST_SHORT : HONEST,
      compact ? GRADE_SHORT : GRADE,
      compact ? RENDER_SHORT : RENDER,
    ];
  },
};

const realStillLife = {
  key: "real-still-life",
  label: "Real · still life",
  blurb:
    "The same lived-detail objects the Chalk Print dial carries, photographed for real on a real surface instead of carved into a block. No people in frame, so no discretion tension at all.",
  parts: (pick = {}) => {
    const compact = pick.length === "compact";
    const object = pickFrom(REAL_OBJECTS, pick.motif);
    const surface = pickFrom(SURFACES, pick.asset);
    const light = pickFrom(STILL_LIGHTS, pick.colourway);
    return [
      compact
        ? "A real still life photograph, not an illustration and not a render."
        : "A real still life photograph, quiet and observational rather than advertising-styled: not an illustration, not a render, not a product shot.",
      compact ? object.objectShort : object.object,
      compact ? surface.surfaceShort : surface.surface,
      compact ? light.lightShort : light.light,
      compact ? CAMERA_SHORT : CAMERA,
      compact ? GRADE_SHORT : GRADE,
      "No person and no part of a person anywhere in the frame.",
      compact ? RENDER_SHORT : RENDER,
    ];
  },
};

export const REAL_STYLES = [realPortrait, realStillLife];

export const ekamRealRecipe = defineRecipe({
  key: "ekam-real",
  label: "EKAM Real",
  dials: {
    asset: { label: "Framing", values: FRAMINGS.map(({ key, label }) => ({ key, label })) },
    motif: { label: "Moment", values: MOMENTS.map(({ key, label }) => ({ key, label })) },
    colourway: { label: "Light", values: LIGHTS.map(({ key, label }) => ({ key, label })) },
  },
  styles: REAL_STYLES,
  extraRule: EXTRA_RULE,
  extraRuleCompact: EXTRA_RULE_COMPACT,
  tokens: TOKENS,
});
