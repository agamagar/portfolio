// Recipe for the "Pepo motion" prompt system: FLUX 3 image-to-video for Pepo House, a cafe
// in Jaipur. The first frame is a designed poster PLATE rendered by the Pepo design system
// (Active - Pepo House/Claude/Brand/templates.py): real food photography placed in flat
// printed graphics (design system 0.4: one soft square cell, pierced, mirrored, two inks,
// paper grain). The model animates only the food; every word is set afterwards from the
// template's type layer, so the plate carries no text at all (research/models.md, failure
// table row 1, and the library's NO_TEXT rule).
//
// Research: research/flux3-video.md (model behaviour, clause order, motion vocabulary) and
// research/pepo-crafts.md (names of the printed graphics, for the hold list, cited inline).
//
// What the research changed, in one line each:
//   - Prompt the motion, not the scene: the first frame is pixel exact, so re-describing it
//     only invites the model to re-imagine it [flux3-video 8].
//   - Lock the camera by default: an unnamed camera drifts, and any move drags the flat
//     layout with it; push-ins are done as a scale keyframe in the editor [flux3-video 17].
//   - Name every element that must hold, never "the rest" [flux3-video 15, 18].
//   - One clean action per 5 to 7 seconds; sequence the beats [flux3-video 17].
//   - The strongest hold is a pinned end frame made by EDITING the start plate, so the
//     layout matches at both ends (BFL cookbook, experimental) [flux3-video 8].
//
// Clause order never varies (research/models.md rule 2, and BFL's own i2v examples):
// use, anchor, camera, hold list, beats, motion character, focus, audio, ending, close,
// then the library rules via compose().
import { defineRecipe } from "./recipe.js";

export const COMPACT_LIMIT = 1000;

// The one prohibition this group adds: BFL's own i2v examples close this way, and our
// plates must stay type-free so the type layer can be composited after.
export const EXTRA_RULE = "No on-screen text added, no subtitles, no captions.";
export const EXTRA_RULE_COMPACT = "No on-screen text or subtitles.";

export const USE =
  "A 9:16 vertical social video for a cafe in Jaipur, animated from a designed poster still: real food photography placed inside flat printed graphic artwork.";
export const USE_SHORT = "9:16 cafe social video animated from a designed poster still.";

export const ANCHOR =
  "The video begins exactly on the provided image and holds still for a beat.";
export const ANCHOR_SHORT = "Begin exactly on the provided image; hold a beat.";

export const CAMERAS = [
  {
    key: "locked",
    label: "Locked off",
    full: "Locked-off camera: the frame does not move, zoom or refocus for the whole clip.",
    short: "Locked-off camera: no move, zoom or refocus.",
  },
  {
    key: "push",
    label: "Whole-card push-in",
    full: "One slow push-in toward the food over the full clip, the whole printed card moving as one flat object, its graphics never bending or separating.",
    short: "One slow push-in, the whole card moving as one flat object.",
  },
];

// The hold list names each printed element by its craft name. Shared vocabulary lives here;
// each style lists only the elements its layout actually contains.
export const HOLD_NAMES = {
  // Pepo design system 0.4: one soft square cell, pierced and mirrored, printed in two inks.
  // pepo-crafts.md: riso grain on uncoated toothy stock [30][31]
  paper: "the uncoated, toothy paper ground with its fine riso-style print grain",
  // pepo-crafts.md: filet crochet reads as open and filled squares on a grid [26]
  field: "the grid of small printed motifs built from soft square cells, like filet crochet",
  band: "the printed border band",
  tags: "the two printed label blocks with pierced corners",
  shadow: "the hard flat offset shadow block printed under the pizza",
  ground: "the flat printed blue ground with its fine riso-style grain",
  squares: "the pierced paper squares behind the plates and the motifs printed on them",
  motifs: "the small printed star motifs",
};
const holdClause = (items, short) => {
  const named = items.map((k) => HOLD_NAMES[k]).filter(Boolean);
  const list = named.length > 1 ? `${named.slice(0, -1).join(", ")} and ${named[named.length - 1]}` : named[0];
  return short
    ? `Flat graphics hold exactly: ${list}.`
    : `${list.charAt(0).toUpperCase()}${list.slice(1)} are flat printed graphics that stay exactly as they are, same shapes, same colours, never moving.`;
};

export const PACES = [
  { key: "beats", label: "Beats in order" },
  { key: "timed", label: "Timestamped" },
];

export const MOTION =
  "The food motion plays out in gentle slow motion, as if overcranked at 120 fps and played back at 24.";
export const MOTION_SHORT = "Food moves in gentle slow motion, overcranked feel.";

export const AUDIOS = [
  { key: "sound", label: "Sound", full: "Audio: a soft crust crackle, quiet cafe room tone, no music.", short: "Audio: soft crust crackle, room tone, no music." },
  { key: "silent", label: "Silent", full: "", short: "" },
];

export const ENDINGS = [
  { key: "open", label: "First frame only", full: "", short: "" },
  {
    key: "pinned",
    label: "Pinned end frame",
    full: "The clip ends exactly on the provided last frame, every graphic in the same place as in the first.",
    short: "End exactly on the provided last frame.",
  },
];

const by = (list, key) => list.find((x) => x.key === key) || list[0];

export const STYLES = [
  {
    key: "held-hero",
    label: "Held hero",
    blurb: "One whole stone-baked pizza, tilted, on printed paper over a motif field, with two printed tags; a hand lifts the hero slice with a mozzarella pull.",
    hold: ["paper", "field", "band", "tags", "shadow"],
    parts: (pick) => {
      const compact = pick.length === "compact";
      const cam = by(CAMERAS, pick.camera), au = by(AUDIOS, pick.audio), en = by(ENDINGS, pick.ending);
      const beats = pick.pace === "timed"
        ? (compact
          ? "0 to 2s: steam wisps rise off the charred crust. 2 to 7s: a hand lifts one slice, mozzarella strands stretch. 7 to 9s: the hand holds, strands sag."
          : "0 to 2s: thin wisps of steam rise and curl off the charred crust. 2 to 7s: a hand enters from the lower right, lifts the hero slice, and long strands of melted mozzarella stretch between the slice and the pie, side light glowing through the strands, the neighbouring slices staying seated. 7 to 9s: the hand holds at the top of the lift and the strands slowly sag.")
        : (compact
          ? "First, steam wisps rise off the charred crust. Then a hand enters lower right and lifts one slice; melted mozzarella strands stretch and sag, side-lit, other slices stay seated."
          : "First, thin wisps of steam rise and curl off the charred crust. Then a hand enters from the lower right, lifts the hero slice, and long strands of melted mozzarella stretch and sag between the slice and the pie, side light glowing through the strands, the neighbouring slices staying seated. The hand pauses at the top of the lift.");
      return compact
        ? [USE_SHORT, ANCHOR_SHORT, cam.short, holdClause(STYLES[0].hold, true), beats, MOTION_SHORT, au.short, en.short]
        : [USE, ANCHOR, cam.full, holdClause(STYLES[0].hold, false), beats, MOTION, au.full, en.full];
    },
  },
  {
    key: "edge-plates",
    label: "Edge plates",
    blurb: "Two whole pizzas cropped off opposite corners of a printed blue ground, each on a pierced paper square; steam rises and both pies turn slowly.",
    hold: ["ground", "squares", "shadow", "motifs"],
    parts: (pick) => {
      const compact = pick.length === "compact";
      const cam = by(CAMERAS, pick.camera), au = by(AUDIOS, pick.audio), en = by(ENDINGS, pick.ending);
      const beats = pick.pace === "timed"
        ? (compact
          ? "0 to 3s: steam wisps rise off both crusts. 3 to 8s: each pizza turns a slow eighth of a turn on its own square, like a turntable, staying fully on its square."
          : "0 to 3s: thin wisps of steam rise and curl off the crust of both pizzas, caught by a soft backlight. 3 to 8s: each pizza turns a slow eighth of a turn in place on its own paper square, like a turntable, the toppings staying put and each pizza staying fully on its square.")
        : (compact
          ? "First, steam wisps rise off both crusts. Then each pizza turns a slow eighth of a turn in place on its square, like a turntable."
          : "First, thin wisps of steam rise and curl off the crust of both pizzas, caught by a soft backlight. Then each pizza turns a slow eighth of a turn in place on its own paper square, like a turntable, the toppings staying put and each pizza staying fully on its square.");
      return compact
        ? [USE_SHORT, ANCHOR_SHORT, cam.short, holdClause(STYLES[1].hold, true), beats, MOTION_SHORT, au.short, en.short]
        : [USE, ANCHOR, cam.full, holdClause(STYLES[1].hold, false), beats, MOTION, au.full, en.full];
    },
  },
];

// The pinned end frame is an EDIT of the start plate, never a fresh generation, so every
// graphic matches at both ends (flux3-video.md, BFL cookbook [8]). Sent to an image model
// with the plate as the only reference.
export const END_FRAME_EDIT = {
  "held-hero":
    "Image 1 is the start frame of a video: a designed poster still. Edit it into the last frame. Change only the pizza: a hand coming from the lower right now holds one slice lifted well above the pie, long strands of melted mozzarella stretching and sagging between the slice and the pie, side light glowing through the strands, the other slices still seated, a few thin wisps of steam above the crust. Keep everything else in Image 1 exactly as it is, pixel for pixel: the uncoated paper ground and its grain, the printed motif field, the border band, the two label blocks, the offset shadow block, their positions, sizes and colours, the framing and the light.",
};

export const pepoMotionRecipe = defineRecipe({
  key: "pepo-motion",
  label: "Pepo motion",
  dials: {
    camera: CAMERAS,
    pace: PACES,
    audio: AUDIOS,
    ending: ENDINGS,
    length: ["compact", "full"],
  },
  extraRule: EXTRA_RULE,
  extraRuleCompact: EXTRA_RULE_COMPACT,
  styles: STYLES,
  tokens: [
    "Hold: how many printed elements are named in the hold list; every one present must be named",
    "Pace: one clean action per 5 to 7 seconds",
    "Steam: shows only over darker crust with a backlight",
    "Pull: credited to melted mozzarella, side-lit so light glows through the strands",
  ],
});

export const { compose, styleMeta: STYLE_META } = pepoMotionRecipe;
