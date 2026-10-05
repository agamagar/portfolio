// "Along a path" — a new section built on <PathMarquee>.
//
// The section exists to be PLAYED WITH, not just looked at: the controls under
// the run change the path and its properties live. That is the whole point of
// writing our own instead of dropping the sample in — the sample hardcodes one
// curve and one speed, and this treats both as data.
//
// The images are real work, not stock. Per the strategy doc section 5, card and
// section art is "real product UI at recognizable fidelity", never decorative
// filler, and everything here is licensed because it is Agam's own.

import { useEffect, useMemo, useRef, useState } from "react";
import PathMarquee from "./PathMarquee";
import { AiimsGap } from "../figures/aiims/AiimsFigures";
import Globe from "./Globe";
import { feedback } from "../ui/feedback";
import { PATH_PRESETS, PATH_KEYS } from "./pathPresets";

// PURPOSE-BUILT DERIVATIVES, not the case-study originals. The originals run
// 720x1582 to 1080x2487 and are drawn here at about 110x148, a 16x downscale,
// and the marquee changes their scale as they travel — so every frame was
// asking the compositor to re-rasterise 11.8 megapixels of source into
// thumbnails. That, not the maths, was where the frame drops came from.
// /figures/marquee/* are the same images at 300px wide: 1.5MP total, 1.2MB down
// to 364KB. The originals are untouched, because the case studies still need
// them at full size.
const PLATES = [
  // The one moving card (annotation msd34k8a). Its own aspect, NOT the 3/4 the
  // stills use: the clip is a 500x394 landscape title card and "GET AWAY" runs
  // nearly its full width, so `cover`-cropping it into a portrait slot would
  // slice the words off both ends. Same card WIDTH as its neighbours, so the run
  // still reads as one row of objects rather than one odd size.
  // SATELLITES (annotation mshtn052): "instead one video playing, 3-5 more
  // smaller containers around this tile, all expand on hover". So the clip stops
  // being a single object and becomes the centre of a small constellation.
  //
  // All three are Away's own surfaces, which is the whole reason this reads as a
  // cluster rather than a collage: a satellite borrowed from another project
  // would say "here are some pictures" where these say "here is one product,
  // seen from three more angles". There is no fourth Away still in
  // public/figures/marquee/, so it is 3 rather than the 5 the annotation allows
  // — inventing a filler plate to hit a number would be the wrong trade.
  {
    video: "/figures/marquee/away.mp4",
    poster: "/figures/marquee/away-poster.png",
    alt: "Away: get away",
    // Same split as the Dassh plate below (annotation msiblbao): the alt keeps
    // describing the picture, the caption carries the news. Written in the same
    // "raise, then the human bit" shape so the two read as one voice.
    caption: "Away raises a million in seed round, so the travel agent gets to grow up",
    aspect: "500 / 394",
    // x/y are the OUT positions, as a fraction of the card, measured from its
    // centre. They live here rather than in nth-child CSS so the arrangement is
    // editable next to the assets it arranges.
    // SEPARATE FILES, NOT THE PLATES' OWN (annotation msi4u77a's QA finding,
    // then "resize those satellite images properly"). The satellites render
    // into roughly a 71px slot but were loading the full 300x659 plates, about
    // 2.3x oversized even at 2x DPR. These are 180px-wide re-encodes, 75%
    // smaller. New files rather than shrunk originals because night-ui and
    // market-street are ALSO full plates further along this same run, where
    // they are drawn at ~280px and would have gone soft.
    //
    // Downscaled, NOT pre-cropped to the 3/4 slot: a 3:4 centre crop of the two
    // phone screenshots came out BYTE-IDENTICAL (same md5 from different
    // sources), because their middles are the same chrome. CSS object-fit does
    // the cropping already and does it at render size, so pre-cropping only
    // threw away what told the two apart.
    sats: [
      { src: "/figures/marquee/morning-ui-sat.jpg", alt: "Away: morning", x: -0.62, y: -0.34 },
      { src: "/figures/marquee/night-ui-sat.jpg", alt: "Away: after dark", x: 0.64, y: -0.22 },
      // THE GLOBE TAKES THIS SLOT (annotation msk1l98q, "on one of the satellite
      // containers add this component"). It replaces the market-street still
      // rather than being added as a fourth, because the ask was for one of the
      // EXISTING containers and a fourth satellite would change the
      // arrangement's composition, which was chosen deliberately at three.
      //
      // What it costs: this cluster was three views of one product, and one of
      // them is now a motif rather than a screen. What it buys is the only piece
      // of the cluster that says what Away IS — a travel agent — instead of what
      // it looks like.
      { globe: true, alt: "Away: where it goes", x: 0.5, y: 0.46 },
    ],
  },
  // OdinEye. Transcoded on the way in: the source was HEVC, which Chrome will
  // not play, and 3600x2012 / 3.9MB for a card that renders ~135px wide.
  // Now H.264 yuv420p at 800px, 75KB.
  { video: "/figures/marquee/odineye.mp4", poster: "/figures/marquee/odineye-poster.png", alt: "OdinEye", aspect: "800 / 448" },
  // Dropped (msd752md, msd7551r, msd7xang): the Zepto slot picker, the Away
  // "deep search running" state and the Zepto confirmed cart. All were flat
  // product screenshots in a run that otherwise carries motion and made things —
  // they read as thumbnails.
  // `caption` SPLIT FROM `alt` here (annotation msdfxejd). Everywhere else the
  // two are the same string, and the caption is aria-hidden because it would
  // otherwise announce the alt twice. Not here: the line Agam wants shown is
  // news about the project, and handing that to a screen reader AS THE
  // DESCRIPTION OF A DIAGRAM would be wrong. So alt keeps describing the
  // picture, caption carries the words, and the caption stops being hidden
  // once the two differ — it is real information the alt no longer contains.
  {
    src: "/figures/marquee/dassh-stella-system.png",
    alt: "Dassh: Stella, constructed",
    caption: "Dassh raises 1.2 Cr angel round, building things from scratch is fun",
    aspect: "1478 / 1080",
    // ONE PLATE AGAIN (annotation msi5ym2p, "i see multiple images inside the
    // container keep it one and fix"). This reverses msef2i73, which stacked
    // the SAME image three times as a placeholder arrangement pending real
    // screens. Those screens never arrived, so the stack was three copies of
    // one picture reading as a rendering fault rather than as a cluster.
    // `cluster` still works if it is ever wanted with genuinely different
    // plates; nothing declares it today.
  },
  // AIIMS (annotation msk1e5oo). The only card in the run that is not an
  // exported image, because AIIMS is the only project here with nothing to
  // export: it is a research study, and its case study is drawn in React.
  // `aspect` is squarer than the 3/4 the stills use — this is a chart with a
  // name column, a track and a value, and a portrait slot would squeeze the one
  // dimension it actually needs.
  {
    node: "aiimsGap",
    alt: "AIIMS: studies on nurses and empathy, by country",
    caption: "A research gap you can see: India, against every country that had already asked",
    aspect: "4 / 3",
  },
  { src: "/figures/marquee/night-ui.jpg", alt: "Away: after dark" },
  { src: "/figures/marquee/market-street.jpg", alt: "Zepto: market street" },
];

// Coded figures usable as plates, by key. A registry rather than a direct
// import at the call site because the plate list is DATA — a plate names the
// figure it wants with a string, exactly as the others name a file with a path.
const NODES = { aiimsGap: AiimsGap };

function PlateNode({ name }) {
  const Fig = NODES[name];
  return Fig ? <Fig /> : null;
}

const SPEEDS = [
  { label: "Slow", value: 3 },
  { label: "Steady", value: 7 },
  { label: "Quick", value: 14 },
];

// THE PACE CURVE (Agam, 2026-08-14: "apply a max slope bezier on both ends for
// the steady"). PathMarquee's `easing` prop remaps position over the cycle, so
// a curve whose SLOPE peaks at both ends makes each card race through the run's
// edges and linger through the middle — the centre is where a card is read, so
// the dwell goes where the attention is. "Max slope at both ends" is exactly
// the INVERSE of smoothstep (smoothstep's slope is 0 at the ends and peaks
// mid-run; inverting swaps those), and inverse smoothstep has a closed form —
// no bezier solver needed for what the bezier was asked to draw.
const EASE_ENDS = (t) => 0.5 - Math.sin(Math.asin(1 - 2 * Math.min(1, Math.max(0, t))) / 3);
const PACES = [
  { label: "Even", value: "linear" },
  { label: "Sprint the ends", value: "ends" },
];

// Depth is the knob with the most range in it, so it gets real options rather
// than an on/off. Each is a different theory of how distance reads:
//   Flat        nothing recedes; the path is a track, not a space
//   Size        near things are bigger. The default, and the cheapest.
//   Air         size PLUS aerial perspective — far things pale out
//   Air + haze  adds blur. Honest about the cost: a filter repaints.
//   Bloom       the whimsical one, and now the default (Agam, 2026-08-11: the
//               cards "remain the same size throughout ... start very small,
//               grow to their maximum size ... almost centred and taking the
//               whole space ... and then go back to a smaller size").
//
// BLOOM IS A CURVE, NOT JUST A WIDER RANGE. The nearness factor is a triangle
// peaking at the centre of the run, so a linear map has an item already half
// grown a quarter of the way in - widen that and the whole run simply gets
// bigger, which is not what was asked for. `scaleCurve: 2.6` holds them near
// the small end for most of the lap and spends the growth around the middle, so
// a card arrives, blooms, and folds away again.
// The fade rides the same curve: at the edges these are small AND pale, which
// is what keeps a 1.62x card at the centre from looking like a mistake.
// ABOVE DEPTHS, and it has to be: `golden` reads GOLDEN_MIN while this module
// is being evaluated, so declaring it after DEPTHS is a temporal dead zone, not
// a style question. Shipped that way for one save and the whole section threw
// "Cannot access 'GOLDEN_MIN' before initialization".
const PHI = 1.618033988749895;
const GOLDEN_MIN = 1 / PHI ** 3; // 0.236 - the blueprint's smallest, 187/769
// MOBILE size spread (Agam, 2026-08-13): the largest card is phi*1.5 the
// smallest, a gentler ladder than the phi^3 (~4.24x) golden one so the edge
// cards stay legible on a phone instead of shrinking to specks.
const MOBILE_MIN = 1 / (PHI * 1.5); // ~0.412; ratio max:min = phi*1.5 = 2.427

const DEPTHS = {
  bloom: {
    label: "Bloom",
    // 0.30 -> 1.80, MEASURED against the room the section actually has. At the
    // 258px base that is a 77px card at the edges and a 464px one at the peak,
    // and the peak card spans 1858..2440 against a section running 1478..2565
    // with the heading ending at 1618 - so it fills the run without touching
    // either. `overflow: visible` on the run is what lets it exceed its own
    // 326px box, which it must: a card that only ever grew to the height of the
    // strip it travels on could never read as "taking the whole space".
    scaleRange: [0.3, 1.8],
    scaleCurve: 2.6,
    depthFade: [0.25, 1],
    depthBlur: 0,
    // the caption belongs to the card that is being LOOKED at, so it appears
    // only at the top of the bloom
    frontAt: 0.82,
  },
  // THE BLUEPRINT'S OWN LADDER (msq1t4q9). See the note above BLUEPRINT_PLATES
  // for where these two numbers come from: the range is 1/phi^3 to 1 because
  // that is the ratio between the blueprint's smallest frame and its largest,
  // and the curve is steep so most tiles sit low on the ladder and ONE reaches
  // the top - the blueprint has a single 769px frame and eight smaller ones,
  // not an even spread. Fade and blur are off: nine copies of one picture
  // already read as depth by size alone, and dimming them would say "these are
  // different pictures, some further away" about an image that is the same.
  golden: {
    label: "Golden",
    scaleRange: [GOLDEN_MIN, 1],
    scaleCurve: 2.6,
    depthFade: undefined,
    depthBlur: 0,
    frontAt: 0.82,
  },
  // OPTION 1 — GOLDEN, FAR CARDS DIMMED (Agam, 2026-08-13, "still abrupt": the
  // stacking swap between opaque overlapping cards pops, worst at the centre).
  // A depth fade makes cards farther back dimmer and the nearest brightest, so a
  // card crossing another reads as a smooth brightness change rather than a hard
  // flip. This is a COPY of `golden`; the original is left untouched above, per
  // "do option 1 but make a copy". Reverses golden's "same image, do not dim"
  // note deliberately — that call was about legibility, this is about motion.
  goldenDim: {
    label: "Golden dim",
    scaleRange: [GOLDEN_MIN, 1],
    scaleCurve: 2.6,
    depthFade: [0.4, 1],
    depthBlur: 0,
    frontAt: 0.82,
  },
  // OPTION 3 — REAL PERSPECTIVE (Agam, 2026-08-13, "show me option 3 as well").
  // The layer gets a `perspective`, so the translateZ that already orders the
  // cards ALSO foreshortens them: a card coming to the centre physically zooms
  // toward the viewer, and that continuous motion masks the paint-order swap.
  // scaleRange is gentler here because perspective is doing much of the sizing;
  // the two compose. `perspective` is read by AlongPath and passed to PathMarquee.
  perspective: {
    label: "Perspective",
    scaleRange: [0.7, 1],
    scaleCurve: 2.6,
    depthFade: [0.55, 1],
    depthBlur: 0,
    frontAt: 0.82,
    perspective: 620,
  },
  flat: { label: "Flat", scaleRange: undefined, depthFade: undefined, depthBlur: 0 },
  size: { label: "Size", scaleRange: [0.82, 1.14], depthFade: undefined, depthBlur: 0 },
  air: { label: "Air", scaleRange: [0.8, 1.16], depthFade: [0.55, 1], depthBlur: 0 },
  haze: { label: "Air + haze", scaleRange: [0.8, 1.16], depthFade: [0.55, 1], depthBlur: 2.5 },
};

// ── THE BLUEPRINT RUN (annotation msq1t4q9, "for this section let's remove all
// text for now, only single image flowing by following this blueprint, use
// golden ratios to determine difference in sizes between sizes";
// figma.com/design/dUwMRorsFMXh9G6wlHOh5B node 138-2777) ────────────────────
//
// WHAT THE BLUEPRINT ACTUALLY SAYS, read off the file rather than off the
// picture of it. Nine frames, one image ('odineye 1') in every one, at five
// distinct sizes: 769x606 once in the middle, then 366x288, 295x232, 241x190
// and 187x147 twice each, scattered out to both edges.
//
// Two things fall out of those numbers, and both are why this is a preset
// rather than a new layout engine:
//
// 1. EVERY FRAME IS THE SAME RECTANGLE. 769/606, 366/288, 295/232, 241/190 and
//    187/147 all come to 1.27 - which is sqrt(phi), the rectangle whose sides
//    are in the golden mean's own root. So the run needs ONE aspect, not nine.
//
// 2. THE SIZES ARE A PHI LADDER MEASURED FROM THE BIG ONE. Divide each by 769:
//    0.476, 0.384, 0.313, 0.243. Against 1/phi^1.5, 1/phi^2, 1/phi^2.5 and
//    1/phi^3 - 0.486, 0.382, 0.300, 0.236 - every one lands within a few
//    pixels. That is the "use golden ratios to determine difference in sizes"
//    made specific: the scatter is not nine arbitrary boxes, it is half-steps
//    of phi down from the hero, and the smallest is phi-cubed below it.
//
// So the scale ladder is the DEPTH ladder: a marquee already sizes each tile by
// where it sits on the path, which is exactly what the blueprint draws. 1/phi^3
// to 1 reproduces it, and the curve is what puts one tile at the top rather
// than a smooth spread of nine.
// ONE IMAGE, NINE TIMES, NO WORDS. The blueprint repeats a single plate, and
// the plates carry no `caption`, which is the whole of "remove all text": the
// caption span is the only copy a tile draws, and with the field absent it is
// rendered empty and aria-hidden. `alt` stays - it is not text on the page, it
// is the picture's name for anyone who cannot see it, and stripping it would
// make nine unlabelled images rather than a quiet run.
//
// The poster still, not the .mp4 it belongs to: the ask is an image flowing, and
// nine simultaneous videos on one path is a different (and much more expensive)
// thing than the one clip that plays here today.
const BLUEPRINT_ASPECT = "769 / 606"; // sqrt(phi), the blueprint's own rectangle

// REAL PROJECT CLIPS IN SOME OF THE FRAMES (Agam, 2026-08-13: "use these videos
// for some of the frames, keep the size the same, no cropping, smart color
// fill"). Each clip sits in the SAME 769/606 slot as every other card (so the
// run stays one size), is `contain`-fit so nothing is cropped, and the letterbox
// its aspect leaves is filled with a colour SAMPLED from the clip itself (the
// average of a mid frame, computed with ffmpeg) so the bars read as part of the
// card, not black gaps. away is already 1.27 so it fills the slot with no bars;
// the wider ones (fire-safety 16:9, odineye 16:9, schedule 3.18:1) letterbox
// top/bottom into their fill. Transcoded to web H.264 in public/.../bp/.
const BLUEPRINT_VIDEOS = [
  { video: "/figures/marquee/bp/away.mp4", poster: "/figures/marquee/bp/away-poster.jpg", alt: "Away", fill: "#897347" },
  { video: "/figures/marquee/bp/fire-safety.mp4", poster: "/figures/marquee/bp/fire-safety-poster.jpg", alt: "Fire safety training", fill: "#252524" },
  { video: "/figures/marquee/bp/odineye.mp4", poster: "/figures/marquee/bp/odineye-poster.jpg", alt: "OdinEye", fill: "#282b28" },
  { video: "/figures/marquee/bp/schedule.mp4", poster: "/figures/marquee/bp/schedule-poster.jpg", alt: "Scheduled delivery", fill: "#e2cef8" },
];
// The non-clip frames are BLACK CARDS (Agam, 2026-08-13: "make them black
// instead"). Same card as the clips — frame, border, shadow, one size — just a
// solid black fill and no video. They keep the four clips spread out and never
// adjacent, and read as blank plates in the run rather than gaps.
const BLUEPRINT_FILLER = { black: true };
// Nine frames: the four clips spread out, black cards between and after them,
// so no two videos sit adjacent on the path and the decode count stays at four.
// FOUR CONSECUTIVE STILLS (Agam, 2026-08-15: "add 4 consecutive frames of
// these 4", Portfolio 2026 section 168:26700): the AIIMS VR study photographs -
// the headset on, the sim on the laptop, the nurse at the laptop, the
// controller in hand - exported at 2x from their 500x394 frames, which is the
// blueprint's own 1.27 aspect so they fill the card with no letterbox. They
// take the four filler slots after the clips so the run stays at NINE plates
// (Wave 2's stops and sizes are nine); one black card remains at the end.
const AIIMS_STILLS = [
  { src: "/figures/marquee/bp/aiims-1.jpg", alt: "AIIMS VR study: a nurse wearing the headset" },
  { src: "/figures/marquee/bp/aiims-2.jpg", alt: "AIIMS VR study: the simulation on a laptop" },
  { src: "/figures/marquee/bp/aiims-3.jpg", alt: "AIIMS VR study: a nurse working at the laptop" },
  { src: "/figures/marquee/bp/aiims-4.jpg", alt: "AIIMS VR study: a controller in hand" },
];
// ...AS ONE ENTITY (Agam, 2026-08-15: "make these 4 flow together as one
// entity ... still 4 separate containers that flow together"). Four SEPARATE
// cards on the path, not one card: the second, third and fourth carry a tight
// `pitch` (PathMarquee lays children out from cumulative pitches), so the
// four ride as a TRAIN - each its own container, one narrow gap between them,
// moving as one piece. They take the slots after OdinEye; the black fillers
// go, and the run is 8 children (clips 4 + stills 4).
const TRAIN_PITCH = 0.55; // 0.42 first; a touch more air so each container shows its own edge
const BLUEPRINT_PLATES = [
  { ...BLUEPRINT_VIDEOS[0], contain: true },
  { ...BLUEPRINT_VIDEOS[1], contain: true },
  { ...BLUEPRINT_VIDEOS[2], contain: true },
  { ...AIIMS_STILLS[0], pitch: 1 },
  { ...AIIMS_STILLS[1], pitch: TRAIN_PITCH },
  { ...AIIMS_STILLS[2], pitch: TRAIN_PITCH },
  { ...AIIMS_STILLS[3], pitch: TRAIN_PITCH },
  { ...BLUEPRINT_VIDEOS[3], contain: true },
].map((p, i) => ({
  ...p,
  aspect: BLUEPRINT_ASPECT,
  // NO CAPTION ELEMENT AT ALL — the run stays wordless (see the note above).
  quiet: true,
  // key must differ per tile even where the src/video repeats.
  id: `bp-${i}`,
}));

// MORE STEPS (Agam, 2026-08-13: "add more density levers, with more spacing").
// `density` is `repeat` — how many times the nine blueprint plates recur around
// the path — so higher values put more cards on the run, which is what gives the
// wider Spacing options below enough tiles to space out without thinning to two
// or three. Sparse..Packed are unchanged so the defaults and the earlier chips
// keep their meaning; Dense and Teeming extend the top of the ladder.
const DENSITIES = [
  { label: "Sparse", value: 1 },
  { label: "Full", value: 2 },
  { label: "Packed", value: 3 },
  { label: "Dense", value: 4 },
  { label: "Teeming", value: 5 },
];

// Scaled up one step across the board (annotation msd6wqg9, "make these
// bigger"): the old L (124) is the new M, and L goes to 172. The DEFAULT moves
// with it, since L was already selected — bumping the ladder without moving the
// default would have changed nothing on the page.
// Doubled (annotation msd8fotf: "make the default and hover states 2x"). The
// whole ladder moves, not just the default, so the S/M/L chips stay meaningful
// relative to each other. The HOVER state doubles with it for free: hover is a
// `scale: 2` on the card, so twice the base size is twice the expanded size too,
// and nothing about the hover rule needed touching.
// ...then taken back DOWN 35% (annotation msd8l3m1). The ladder has now been
// 92/124/172, then 184/248/344, and sits at 0.65 of that. It moves as a whole
// each time, never just the default, so the S/M/L chips keep their relationship.
// ...and now +15% (annotation msfml47u, "make the tiles 15% bigger in the default
// state"). Full history: 92/124/172 -> 184/248/344 -> 120/161/224 -> this.
// The whole ladder scales every time rather than just the default, so the S/M/L
// chips keep their relationship to each other — that still matters even though
// the control bar is hidden on /hello now (msfmij73), because /hello3 shows it.
// The stage's hover headroom needs no edit: it derives from --ap-size.
// XL ADDED (Agam, 2026-08-13: "on mobile there should be an XL size"). 350,
// continuing the ladder's own ~1.35x step (138 -> 185 is 1.34x, 185 -> 258 is
// 1.39x; 258 -> 350 is 1.36x) rather than picking a round number that breaks
// the relationship the S/M/L chips already have to each other.
// XXL ADDED (Agam, 2026-08-13: "create one xxl setting too"). 475 continues the
// same step (350 -> 475 is 1.36x, matching L -> XL).
const SIZES = [
  { label: "S", value: 138 },
  { label: "M", value: 185 },
  { label: "L", value: 258 },
  { label: "XL", value: 350 },
  { label: "XXL", value: 475 },
];

// Spacing only goes DOWN from "Even", and that is not an oversight: at Even the
// cards already occupy the whole path, so it is the most air they can have at a
// given count. More air than that means fewer cards, which is what Density is
// for. This knob adds the other direction — deliberately bunching them.
// "Airy" goes past Even, which needs more path than exists — so it buys the
// extra gap by dropping the cards that would have wrapped past the end (see
// `shown` in PathMarquee). Fewer cards, further apart, same curve.
// MORE AIR ABOVE AIRY (Agam, 2026-08-13: "with more spacing"). Wide and Vast
// push the gap further still. They only read well with enough cards to give
// away, which is why the Density ladder grew in the same pass: at Teeming (5x =
// 45 tiles) even Vast keeps a full run on the path, where at Sparse it would
// thin to a handful. Pairing a high density with a high spacing is the
// "many cards, far apart" arrangement the two levers now reach together.
const SPREADS = [
  { label: "Tight", value: 0.55 },
  { label: "Close", value: 0.78 },
  { label: "Even", value: 1 },
  { label: "Airy", value: 1.4 },
  { label: "Wide", value: 1.9 },
  { label: "Vast", value: 2.6 },
];

// EQUAL AREA AT REST (annotation mskhlfr7, "all default states should have
// same optical sizing"). The run gives every card one WIDTH, but optical size
// is closer to AREA: at the same width a 800/448 landscape encloses less than
// half the pixels of a 3/4 portrait and reads as the small one. The factor is
// sqrt(aspect / ref): width scales by it, height scales by width/aspect, and
// the product - the area - comes out identical to the portrait reference for
// every plate. Applied as --ap-opt on the cell; hello.css turns it into the
// card's width, and the caption offsets read it so they still clear the edge.
const OPTICAL_REF = 3 / 4; // the portrait stills, the run's default aspect
const optical = (aspect) => {
  if (!aspect) return 1;
  const [w, h] = aspect.split("/").map(Number);
  if (!w || !h) return 1;
  return +Math.sqrt(w / h / OPTICAL_REF).toFixed(4);
};

const HOVERS = [
  { label: "Slow", value: "slow" },
  { label: "Stop", value: "pause" },
  // "SPACE OUT" IS GONE (Agam, 2026-08-13: "remove the path change where all the
  // cards come in one horizontal line, we'll keep the size change on hover").
  // msqrx3mm built it to straighten the run into the Figma 138-2778 row on
  // hover; that path change is exactly what is being removed. The size change it
  // is confused with lives elsewhere and stays: `.ap__card:hover` grows the
  // pointed card by --ap-hover and the stepAside handler moves its neighbours
  // out of the way, all WITHOUT leaving the curve. So dropping this option loses
  // the row and keeps the grow.
  { label: "Ignore", value: "none" },
];

// One labelled row of chips. Extracted once the control bar went past three
// groups: eight copies of the same twelve lines is where a typo hides.
function Group({ name, options, value, onPick }) {
  return (
    <div className="ap__group" role="group" aria-label={name}>
      <span className="ap__label">{name}</span>
      <div className="ap__chips">
        {options.map((o) => (
          <button
            key={o.label}
            type="button"
            className="ap__chip"
            data-active={value === o.value ? "true" : undefined}
            aria-pressed={value === o.value}
            onClick={() => {
              // every chip in every group is a `select`: a choice commits.
              // Guarded on an actual change — re-picking the active chip changes
              // nothing, and feedback confirms a TRANSITION of state, never
              // announces presence.
              if (o.value !== value) feedback("select");
              onPick(o.value);
            }}
          >
            {o.label}
          </button>
        ))}
      </div>
    </div>
  );
}

export default function AlongPath({ reduce }) {
  // THE DEFAULTS ARE THE SETTING AGAM TUNED TO, not the component's own starting
  // point: Wave / Slow / Flat / Sparse / L / Airy, hover Slow, nothing under Show.
  // Read off the live controls rather than guessed, so the section opens on the
  // arrangement he chose instead of one that has to be re-dialled every visit.
  //
  // Worth knowing when reading these: Sparse (repeat 1) is 8 cards, and Airy
  // trims to `floor(count / spread)` = 5 of them. Big cards, few of them, wide
  // apart on a calm curve — a deliberately quiet run, not a busy one.
  // "even" - the straightened copy of the wave (Agam, 2026-08-12). `flow` is
  // still in the list; this is the simple reading of the blueprint, left to
  // right with nothing touching. See the preset's note, and the spread note
  // below for the half of "no overlap" that a path cannot provide.
  // Phones open on a LOOSER arrangement (Agam, 2026-08-13: "fix the look and feel
  // in mobile view as well"). Desktop keeps the locked-in Sparse/Even/L pile; on a
  // narrow screen that many big cards stack into an unreadable heap, and drag is
  // the only way to move them there (no hover), so the run opens wider — the same
  // Airy spread that trims to fewer cards with air between them, at a smaller size.
  // Evaluated once at mount; a mid-session desktop<->mobile resize keeps whatever
  // it opened on, which the hidden-on-mobile controls make moot.
  const narrow =
    typeof window !== "undefined" &&
    window.matchMedia("(max-width: 640px)").matches;
  // Defaults set to the arrangement Agam locked in (2026-08-13 screenshot):
  // Wave / Slow / Golden / Sparse / L / Even, hover Stop, nothing under Show.
  // MOBILE has its own locked arrangement (Agam, 2026-08-14 screenshot: "make
  // these the default settings for side quests mobile layout"):
  // Wave / Steady / Golden dim / Sparse / XXL / Vast, hover Stop, Show all off.
  // Same `narrow` gate the size/spread defaults below already use.
  const [preset, setPreset] = useState("wave");
  const [speed, setSpeed] = useState(narrow ? 7 : 3);
  const [showPath, setShowPath] = useState(false);
  const [rotate, setRotate] = useState(false);
  const [reverse, setReverse] = useState(false);
  // "golden" rather than "bloom" (msq1t4q9): the blueprint's size ladder IS a
  // depth ladder, so the preset that reproduces it has to be the one selected -
  // shipping it unselected would leave the section looking exactly as it did.
  // Golden per the 2026-08-13 screenshot. "goldenDim" (option 1) and
  // "perspective" (option 3) remain selectable beside it in the Depth control.
  const [depth, setDepth] = useState(narrow ? "goldenDim" : "golden");
  const [density, setDensity] = useState(1);
  // L (258) per the 2026-08-13 screenshot. Earlier this opened at 128, DERIVED so
  // the 9 tiles cleared each other on the "even" run with no overlap; the call now
  // is the bigger L tile, and overlap is fine — depth sorts the cards front-to-back
  // (translateZ) so a nearer card cleanly covers the ones behind. The S/M/L chips
  // still tune it live; this is only the opening size.
  // XXL (475) on mobile per the 2026-08-14 screenshot; was M (185).
  const [size, setSize] = useState(narrow ? 475 : 258);
  // "pause": the run STOPS under the cursor and the pointed card grows in place
  // (--ap-hover) - no row collapse (the "Space out" mode was removed 2026-08-13).
  const [hover, setHover] = useState("pause");
  // the toolbar's handle into PathMarquee + its own play/pause label state
  const marqueeApi = useRef(null);
  const [barPaused, setBarPaused] = useState(false);
  // "ends" by default — the ask was to APPLY the max-slope curve, with the
  // toggle there to turn it back off (Agam, 2026-08-14).
  const [pace, setPace] = useState("ends"); // (an "Ease max" quintic in-out lived here for an hour on 2026-08-15 and was removed on request)
  // 1.4 -> 1 (msq1t4q9). Above 1 the run trims itself - `shown = count / spread`
  // in PathMarquee - so 9 plates at 1.4 put only 6 on the path at a time. The
  // blueprint draws NINE frames at once, and the ninth cannot be the one that
  // was trimmed to buy air between the others.
  //
  // KEPT AT 1 FOR THE "even" PATH, and this is where "no overlap" is actually
  // decided. The run spans ~1218px of stage and carries 9 tiles, so the gap
  // between neighbours is 1218/9 = 135px. Two tiles touch when the gap is
  // smaller than a tile, so the size below - not the path, not the spread - is
  // what has to give. The alternative was `spread: 2.25`, which buys the room
  // by DROPPING tiles to four, and the blueprint's whole subject is nine.
  // Vast (2.6) on mobile per the 2026-08-14 screenshot; was Airy (1.4).
  const [spread, setSpread] = useState(narrow ? 2.6 : 1);

  // WHICH TILE STEPS ASIDE (annotation msecmfwo). The caption sits to the right
  // of its tile and is up to --ap-cap-w wide; measured at 1440px the gap between
  // neighbours was 21px, so it landed on the next card every time.
  //
  // The neighbour has to be found by MEASUREMENT, not by DOM order. A first pass
  // used `.pm__item:has(.ap__card:hover) + .pm__item` and it moved the wrong tile:
  // the run wraps, so the item visually right of DOM index 2 was index 0, and the
  // CSS shoved something on the far side of the screen while the caption still
  // covered its real neighbour.
  //
  // Delegated from the stage rather than per-card handlers: the run re-renders its
  // children on every control change, and one listener survives that.
  const stepAside = useMemo(() => {
    const clear = (root) => {
      // ONE PASS, AND THE STYLE GOES FIRST. A version of this deleted the
      // attribute and then queried `[data-step-aside]` to remove the inline
      // translate — by which point nothing matched, so the translates were
      // never reset and every hover ADDED to the last one. Measured a tile
      // sitting at 292px after four hovers of cards it was not even next to.
      root.querySelectorAll("[data-step-aside]").forEach((el) => {
        const shift = el.querySelector(".ap__shift");
        shift?.style.removeProperty("translate");
        // the edge fade written in pass two goes back too, or a card carried off
        // to the edge stays dim after it slides home
        shift?.style.removeProperty("opacity");
        delete el.dataset.stepDir;
        delete el.dataset.stepAside;
      });
      root.querySelectorAll("[data-cap-side]").forEach((el) => delete el.dataset.capSide);
    };
    // THE HANDLER WAS ERASING ITS OWN WORK (annotation mslem9ei, "on hover other
    // elements should move away, this is not happening consistently").
    //
    // Measured, after two wrong theories: the shifts ARE applied - two cells, the
    // right distance - and then both the attribute and the inline translate are
    // gone again within 50ms, while the pointer has not moved at all. Nothing
    // external wipes them; React keeps the same nodes and leaves the style alone
    // (checked by tagging the node and re-reading it).
    //
    // It is this function. Moving the neighbours CHANGES WHAT IS UNDER THE
    // CURSOR, and the browser answers a layout change under a stationary pointer
    // with a fresh `pointerover`. That second event lands on whatever is now
    // beneath - often the gap a tile just vacated, not a card - so `card` is
    // null, and the old code had already called `clear(root)` before it looked.
    // Everything resets; the tiles slide back; the pointer is over a card again;
    // it re-fires. Whether you SEE the step depends on which half of that loop
    // you catch, which is exactly the "sometimes" in the report.
    //
    // The fix is to make the handler idempotent about its own state instead of
    // rebuilding it on every event:
    //   same card as last time  -> nothing to do, and crucially nothing to clear
    //   no card under the event -> ignore it; only a real pointerleave means left
    //   a different card        -> clear, then apply to the new one
    // A stationary pointer over one card now produces exactly one computation, so
    // there is no loop to lose the race in.
    let current = null;
    // Did the last pass actually move anything? A card whose caption clears every
    // neighbour correctly produces NO shifts, and without this the survival
    // check below would find nothing, conclude the work was lost, and recompute
    // on every single pointerover - the flicker loop, back again by the door.
    let currentShifted = false;
    return {
      onPointerOver: (e) => {
        // RESOLVED FROM THE CELL, NOT THE CARD - the second half of mslem9ei.
        // The caption's own visibility is gated on `.ap__cell:hover` in CSS,
        // while this handler was asking for `.ap__card`. The cell is the larger
        // box, so there is a band inside it - the padding the card grows into -
        // where the label is ON SCREEN and the step-aside has not run at all.
        // Caught in a screenshot with the cursor a few px outside the artwork:
        // caption up, nothing moved. Two rules deciding one behaviour from two
        // different boxes disagree exactly in the gap between them.
        const cell = e.target.closest?.(".ap__cell");
        const card = cell?.querySelector(".ap__card");
        const root = e.currentTarget;
        // THE LIVE DEPTH SCALE, not the quantised one (annotation msudifmx,
        // "all the expand sizes are not the same optically"). --pm-s is a
        // stepped snapshot written only when the item crosses a scale step,
        // while the depth itself animates continuously on .pm__fx via WAAPI -
        // so cards at the same nominal step were up to a step apart in real
        // size, and dividing the hover by --pm-s left that difference in the
        // expanded size. Reading the fx's computed `scale` (which includes the
        // running animation) at the moment of pointing gives the exact factor;
        // written on the card as --pm-live for the CSS scale rule and the
        // satellite offsets to read.
        if (card) {
          const fx = card.closest(".pm__fx");
          const live = fx ? parseFloat(getComputedStyle(fx).scale) : NaN;
          if (Number.isFinite(live) && live > 0) card.style.setProperty("--pm-live", String(live));
          else card.style.removeProperty("--pm-live");
        }
        // Not over a card. This is NOT a leave - it is routinely the echo of our
        // own layout change - so the state stands until pointerleave says
        // otherwise. Clearing here is what made the step flicker away.
        if (!card) return;
        // Already computed for this card AND the answer is still on the page.
        // Re-running when nothing has changed rebuilds an identical result and
        // the frame in between is a visible flicker, which is why the guard
        // exists - but identity alone is not enough to know the work SURVIVED.
        //
        // The shifts are inline styles on nodes this component does not own:
        // the marquee re-renders continuously and recreates item nodes as the
        // run wraps, and a recreated node comes back with no `translate` and no
        // `data-step-aside`. `current` still points at the card, so the guard
        // said "already done" and the row sat there with a caption over two
        // tiles and nothing moved. That is the intermittent half of this - it
        // depends on whether a re-render happened to land while you were
        // hovering.
        //
        // So the guard now asks whether the result is STILL THERE, not just
        // whether it was computed. Checking the DOM is cheap next to the layout
        // pass that follows, and it makes the handler self-healing rather than
        // trusting a memory of work it cannot see.
        if (card === current && (!currentShifted || root.querySelector("[data-step-aside]"))) return;
        const me = card.closest(".pm__item");
        const mineCell = card.closest(".ap__cell");
        const cap = mineCell?.querySelector(".ap__cap");
        // BAIL BEFORE CLEARING, NOT AFTER. This check used to sit below
        // `current = card` and below `clear(root)`, which made a failed pass
        // destructive AND sticky: it wiped every shift on the row, then recorded
        // the card as "done" so the guard skipped it next time. With the
        // previous pass having produced no shifts, `!currentShifted` made that
        // skip permanent - the card could never compute again while it stayed
        // `current`, which is a hover that silently stops working.
        //
        // Nothing is touched until the work is known to be possible, and
        // `current` is recorded at the END, next to the shift count it has to
        // agree with. A pass that cannot run leaves the row exactly as it was
        // and will be retried on the next pointerover.
        //
        // A CAPTION IS NO LONGER REQUIRED. The breathing-room step-aside opens a
        // gap on both sides of ANY hovered card, caption or not — the current
        // blueprint run carries `quiet` plates with no `.ap__cap` at all, and the
        // old `!cap` bail meant nothing moved for them. The caption, when there
        // is one, only widens the side it sits on (below).
        if (!me) return;
        clear(root);
        const mine = me.getBoundingClientRect();

        // ── WHICH SIDE, THEN WHO MOVES. The order is the fix (annotation
        // msk1qirh, "hover states are not spacing out correctly").
        //
        // The first version decided the neighbour FIRST and the side second,
        // and only ever looked rightward — "the nearest tile that starts to the
        // right of this one". That is fine while the caption is on the right.
        // The moment it flips left, the label lands on the tiles BEHIND the
        // card and nothing moves at all, because the mechanism has no left-hand
        // case. Measured on the Dassh tile: the caption flipped correctly and
        // then overlapped two cards, 136x84 and 33x85, with no cell translated.
        //
        // So the side is decided from the CARD's geometry and the caption's own
        // width — not from the caption's current rect, which is a consequence of
        // the side and would make this circular — and only then is the neighbour
        // on THAT side asked to step out of the way.
        const margin = 12;
        const gap = 28;
        const capW = cap ? cap.getBoundingClientRect().width : 0;

        // THE SCALED EDGES, not the item's. `mine` is the engine's unscaled box;
        // the card grows by --ap-hover about its bottom-centre and the caption
        // is placed off THAT edge. Measuring room from the unscaled box made the
        // right side look wider than it is, so a caption that did not fit
        // stayed put and ran off the page — caught at 24px over.
        //
        // Derived rather than read from the card's own rect, because at
        // pointerover the scale transition has not finished and the rect is
        // whatever frame it is on. The factor is known; the arithmetic is exact
        // at any point in the transition.
        // ...DIVIDED BY THE DEPTH SCALE (Agam, 2026-08-15: "the expand size
        // for each card in side quests should be the right size"): the hover
        // now grows every card to ONE absolute size (--ap-hover x the base
        // card) rather than 1.3x whatever depth it happened to be at, so the
        // amount it grows BY is --ap-hover / --pm-s. Same number the CSS
        // scale rule uses; read here so the room math stays exact.
        const depthS =
          parseFloat(getComputedStyle(card).getPropertyValue("--pm-live")) ||
          parseFloat(getComputedStyle(mineCell).getPropertyValue("--pm-s")) ||
          1;
        // x the run's largest default scale (msud22f1) - see the CSS hover rule
        const depthMax =
          parseFloat(getComputedStyle(mineCell).getPropertyValue("--pm-smax")) || 1;
        const hover =
          ((parseFloat(getComputedStyle(card).getPropertyValue("--ap-hover")) || 1) * depthMax) / depthS;
        // THE OPTICAL FACTOR TOO (annotation mslem9ei, "not happening
        // consistently" - deep QA found exactly one defect). Since mskhlfr7
        // the card is --ap-opt WIDER than the engine's slot, and this math
        // still scaled the slot's width alone: the four widened cards
        // under-measured their own reach, decided the caption's side off bad
        // room numbers, and landed labels on tiles that were never asked to
        // move - while every portrait card behaved. Consistent-for-some is
        // exactly the reported symptom. The rest of the mechanism held up
        // under the QA: clear-before-measure resets residue, the deliberate
        // no-transition shift keeps rects true, and the hit-test already
        // reads the card's REAL box (which includes opt).
        const opt =
          parseFloat(getComputedStyle(mineCell).getPropertyValue("--ap-opt")) || 1;
        const cx = (mine.left + mine.right) / 2;
        const half = (mine.width / 2) * hover * opt;
        // A plate with satellites reaches further than its own card — the same
        // (0.5 + reach + 0.19) the stylesheet uses, in px.
        const satReach =
          parseFloat(
            getComputedStyle(mineCell).getPropertyValue("--ap-sat-reach"),
          ) || 0;
        const outer = satReach
          ? Math.max(half, mine.width * (0.5 + satReach + 0.19))
          : half;
        const roomRight = window.innerWidth - margin - (cx + outer);
        const roomLeft = cx - outer - margin;
        // Right unless it does not fit and the left genuinely has more room. A
        // caption wider than either side fits nowhere, and flipping it there
        // would only clip the other end.
        const goLeft = cap ? capW + gap > roomRight && roomLeft > roomRight : false;
        if (goLeft) mineCell.dataset.capSide = "left";
        else delete mineCell.dataset.capSide;

        // THE WHOLE RUN PARTS AROUND THE HOVERED CARD (Agam, 2026-08-13: "all
        // the cards to the left and all to the right should move", not just the
        // immediate neighbours). The pointed card grows by --ap-hover into the
        // space this opens; everything to its left slides left as one body and
        // everything to its right slides right as one body, so the group keeps
        // its internal spacing and reads as a curtain drawing back rather than
        // the nearest tile shoving onto the next.
        //
        // Two clear lines, one per side, off the card's SCALED edge (cx ± outer)
        // plus a fixed halo. The caption still lands beyond the card on ONE side,
        // so that side's line is extended to clear the label too. capBox read
        // here because the side decides where the caption sits; its position is
        // not hover-gated in CSS (only opacity is), so the rect is real even
        // mid-transition. No caption on the quiet blueprint plates — then it is
        // just the two symmetric halos.
        const capBox = cap ? cap.getBoundingClientRect() : null;
        const breath = 44; // the halo the run opens around the grown card
        let leftLine = cx - outer - breath; // the left group's inner edge clears this
        let rightLine = cx + outer + breath; // the right group's inner edge clears this
        if (capBox) {
          if (goLeft) leftLine = Math.min(leftLine, capBox.left - gap);
          else rightLine = Math.max(rightLine, capBox.right + gap);
        }

        // PASS ONE — sort every other tile onto a side and measure how far the
        // NEAREST one reaches past its line. That single intrusion is the screen
        // distance the entire side has to travel; taking the max over the side
        // finds it (the nearest card has the largest inner edge, so the largest
        // intrusion), and moving everyone by it keeps the run's spacing intact.
        const left = [];
        const right = [];
        let dLeft = 0;
        let dRight = 0;
        root.querySelectorAll(".pm__item").forEach((other) => {
          if (other === me) return;
          const r = other.getBoundingClientRect();
          if (!r.width) return;
          // THE CARD'S OWN BOX, not the item slot — the card can sit a little
          // wider than the engine's slot, and measuring the slot leaves residue.
          const oc = other.querySelector(".ap__card");
          const cr = oc ? oc.getBoundingClientRect() : r;
          const cell = other.querySelector(".ap__cell");
          const shift = cell?.querySelector(".ap__shift");
          if (!shift) return;
          // Each card's depth scale, to convert the shared screen distance into
          // that card's local translate: .ap__shift sits inside the depth-scaled
          // .pm__fx, so a translate here renders at value * scale on screen.
          const fx = other.querySelector(".pm__fx");
          const s = (fx && parseFloat(getComputedStyle(fx).scale)) || 1;
          const otherCx = (cr.left + cr.right) / 2;
          // the card's position ALONG the path, so pass two can slide it to a new
          // point on the curve rather than straight across (see alongPath below)
          const od = parseFloat(getComputedStyle(other).offsetDistance) || 0;
          if (otherCx <= cx) {
            left.push({ cell, shift, s, cx: otherCx, od });
            dLeft = Math.max(dLeft, cr.right - leftLine);
          } else {
            right.push({ cell, shift, s, cx: otherCx, od });
            dRight = Math.max(dRight, rightLine - cr.left);
          }
        });
        // Clamp at 0: a side whose nearest card is already clear of its line does
        // not move at all.
        dLeft = Math.max(0, dLeft);
        dRight = Math.max(0, dRight);

        // PASS TWO — move EVERY card on a side by that side's one screen distance,
        // each divided by its own scale so the on-screen travel is identical.
        //
        // AND FADE THE ONES THE PART CARRIES OFF-FRAME (Agam, 2026-08-13: "fade
        // for 2"). Sliding the whole run out pushes the outermost cards to and
        // past the viewport edges; rather than cap the travel, they fade as their
        // NEW centre nears the edge — opacity ramps 0..1 across `fadeBand` px, so
        // a card leaving the frame dissolves instead of clipping. Inner cards land
        // far from either edge, clamp to 1, and are left untouched. Opacity on
        // .ap__shift (multiplying the marquee's own item opacity) and reset in
        // clear() alongside the translate.
        const vw = window.innerWidth;
        const fadeBand = 150; // px of run-in over which an edge-bound card fades

        // ALONG THE PATH, NOT ALONG X (Agam, 2026-08-13: "their movement should
        // only be along the path not just along one axis"). Each parting card
        // slides to a new point further along the CURVE, so the step follows the
        // wave (x and y together) instead of cutting straight across it. The one
        // screen clearance each side needs (dLeft/dRight) is converted to an arc
        // length in the path's own units (÷ the layer scale k), and every card on
        // that side travels the same arc so the run keeps its spacing. The shift
        // translate is the screen VECTOR from the card's current path point to its
        // shifted one, divided by the card's scale like the x-only version was.
        const svgPath = root.querySelector(".pm__svg path");
        const layerEl = root.querySelector(".pm__layer");
        const L = svgPath ? svgPath.getTotalLength() : 0;
        const m = layerEl
          ? new DOMMatrix(getComputedStyle(layerEl).transform)
          : new DOMMatrix();
        const k = m.a || 1; // layer scale: viewBox units -> screen px
        const alongPath = (od, arc, dir) => {
          // screen delta of moving `arc` path-units in `dir` (±1) from `od`%.
          // Falls back to a flat x-slide if the path can't be read.
          if (!svgPath || !L) return { dx: dir * arc * k, dy: 0 };
          const cur = (od / 100) * L;
          const p0 = svgPath.getPointAtLength(cur);
          const next = cur + dir * arc;
          let p1;
          if (next < 0 || next > L) {
            // EXTRAPOLATE PAST THE ENDS along the end tangent, so a card sitting
            // at the path start/finish still travels (and fades off) instead of
            // clamping in place — every card moves, edge ones included.
            const end = next < 0 ? 0 : L;
            const inner = next < 0 ? Math.min(L, 1) : Math.max(0, L - 1);
            const a = svgPath.getPointAtLength(end);
            const b = svgPath.getPointAtLength(inner);
            // tangent from the inner sample toward the end point, i.e. pointing
            // outward past the end — same expression for both ends
            const tx = a.x - b.x;
            const ty = a.y - b.y;
            const len = Math.hypot(tx, ty) || 1;
            const over = Math.abs(next - end);
            p1 = { x: a.x + (tx / len) * over, y: a.y + (ty / len) * over };
          } else {
            p1 = svgPath.getPointAtLength(next);
          }
          return { dx: k * (p1.x - p0.x), dy: k * (p1.y - p0.y) };
        };

        if (dLeft > 0) {
          const arc = dLeft / k;
          left.forEach(({ cell, shift, s, cx: ocx, od }) => {
            cell.dataset.stepAside = "true";
            cell.dataset.stepDir = "left";
            const { dx, dy } = alongPath(od, arc, -1);
            shift.style.translate = `${dx / s}px ${dy / s}px`;
            const op = Math.max(0, Math.min(1, (ocx + dx) / fadeBand));
            shift.style.opacity = op < 1 ? op.toFixed(3) : "";
          });
        }
        if (dRight > 0) {
          const arc = dRight / k;
          right.forEach(({ cell, shift, s, cx: ocx, od }) => {
            cell.dataset.stepAside = "true";
            cell.dataset.stepDir = "right";
            const { dx, dy } = alongPath(od, arc, 1);
            shift.style.translate = `${dx / s}px ${dy / s}px`;
            const op = Math.max(0, Math.min(1, (vw - (ocx + dx)) / fadeBand));
            shift.style.opacity = op < 1 ? op.toFixed(3) : "";
          });
        }
        // Recorded together, at the end, because the guard above reads them as a
        // pair: which card was done, and whether that pass left anything behind
        // that can be checked for survival.
        current = card;
        currentShifted = !!root.querySelector("[data-step-aside]");
      },
      // A DRAG REVERTS THE PART (Agam, 2026-08-13: "if the cards are being
      // dragged the hover should revert to default automatically"). The drag
      // starts with a pointerdown on the run, which bubbles up to the stage; the
      // parted/faded neighbours snap back so the throw carries a clean row, not a
      // frozen hover state. PathMarquee drops the hover-grow on the same event.
      onPointerDown: (e) => {
        current = null;
        clear(e.currentTarget);
      },
      onPointerLeave: (e) => {
        current = null;
        clear(e.currentTarget);
      },
      // BELT AND BRACES ON THE RESET (Agam, 2026-08-13: "sometimes the cards
      // don't snap back after the mouse has moved away"). onPointerLeave alone is
      // not enough: on hover the pointed card grows and the run parts, and those
      // boxes overflow the stage — so the pointer can be visually over a card
      // while sitting OUTSIDE the stage's own box, which fires pointerleave early.
      // Move off from there and there is no leave left to run clear(), so the
      // parted/faded state sticks. pointerout BUBBLES and fires on the stage even
      // from an overflowing child, and its relatedTarget says where the pointer
      // went: if that is outside the run (or nothing), the pointer has truly left
      // and we reset. Internal card<->gap moves keep relatedTarget inside root, so
      // they do NOT clear here and the step does not flicker.
      onPointerOut: (e) => {
        const to = e.relatedTarget;
        if (!to || !e.currentTarget.contains(to)) {
          current = null;
          clear(e.currentTarget);
        }
      },
    };
  }, []);

  // ── THE 3D TILT (annotation msi7l5z6) ──────────────────────────────────────
  // The card leans toward the cursor: rotateY from the horizontal offset,
  // rotateX from the vertical, about its own centre, under a 700px perspective.
  //
  // NO CSS TRANSITION ON THE TILT, and that is the whole architecture. This page
  // has been bitten four separate times by putting a transition on a value that
  // is rewritten every frame (the marquee depth, the DJ scan bar, the tick speed
  // response, the drag scaling): the transition re-targets on each new value and
  // the element permanently chases a number it never reaches, which reads as lag
  // rather than as smoothing. So the easing lives in a rAF LERP instead — the
  // current angle walks toward the target by a fraction each frame, which gives
  // the same softness on the way in AND settles to rest on the way out, with
  // nothing to fight.
  //
  // Written straight to the node's style, never through state: this fires at
  // pointer rate, and a setState per move would re-render the whole run for a
  // value only one card cares about. Same reasoning as the timeline's cursor
  // speed and the phone-row preview.
  const tiltRef = useRef(null);
  useEffect(() => {
    const root = tiltRef.current;
    if (!root || reduce) return undefined;
    // a coarse pointer has no hover to lean into, and a touch drag would swing
    // the card around under the finger
    if (window.matchMedia?.("(hover: none)").matches) return undefined;

    // The card hinges at its BOTTOM EDGE, not its centre: the base rule's
    // `transform-origin: bottom center` is load-bearing (msd7qrro, growth must
    // not cover the caption) and one origin serves both transform and scale.
    // So X gets a smaller swing than Y — a big rotateX about the base reads as
    // the card toppling forward, while rotateY about a vertical axis through
    // the base is indistinguishable from one through the centre.
    const MAX_Y = 10;     // degrees left/right
    const MAX_X = 5;      // degrees front/back, halved for the hinge
    const EASE = 0.14;    // per-frame approach; the softness knob
    let active = null;    // the ONE card being tilted right now
    let tx = 0, ty = 0;   // where it is
    let gx = 0, gy = 0;   // where it is going
    let raf = 0;

    const release = (el) => {
      if (!el) return;
      el.style.removeProperty("--tilt-x");
      el.style.removeProperty("--tilt-y");
    };
    const frame = () => {
      tx += (gx - tx) * EASE;
      ty += (gy - ty) * EASE;
      if (active) {
        active.style.setProperty("--tilt-x", `${tx.toFixed(2)}deg`);
        active.style.setProperty("--tilt-y", `${ty.toFixed(2)}deg`);
      }
      // homed and nothing under the pointer: hand the card back and stop, so a
      // still page is not paying for a rAF that writes the same zero forever
      if (!gx && !gy && Math.abs(tx) < 0.02 && Math.abs(ty) < 0.02) {
        release(active);
        active = null; tx = 0; ty = 0; raf = 0;
        return;
      }
      raf = requestAnimationFrame(frame);
    };
    const start = () => { if (!raf) raf = requestAnimationFrame(frame); };

    const onMove = (e) => {
      if (e.pointerType === "touch") return;
      const hit = e.target.closest?.(".ap__card") || null;
      if (hit !== active) {
        // moving between cards: the one being left snaps back rather than
        // keeping a stale lean, since only one card animates at a time
        release(active);
        active = hit;
        tx = 0; ty = 0;
      }
      if (!active) { gx = 0; gy = 0; start(); return; }
      const r = active.getBoundingClientRect();
      // -1..1 out from the centre, so the lean follows the corner you are near
      const nx = (e.clientX - (r.left + r.width / 2)) / (r.width / 2);
      const ny = (e.clientY - (r.top + r.height / 2)) / (r.height / 2);
      gy = Math.max(-1, Math.min(1, nx)) * MAX_Y;   // horizontal offset spins Y
      gx = -Math.max(-1, Math.min(1, ny)) * MAX_X;  // vertical offset spins X, inverted
      start();
    };
    const onLeave = () => { gx = 0; gy = 0; start(); };

    root.addEventListener("pointermove", onMove);
    root.addEventListener("pointerleave", onLeave);
    return () => {
      root.removeEventListener("pointermove", onMove);
      root.removeEventListener("pointerleave", onLeave);
      if (raf) cancelAnimationFrame(raf);
      for (const el of root.querySelectorAll(".ap__card")) {
        el.style.removeProperty("--tilt-x");
        el.style.removeProperty("--tilt-y");
      }
    };
  }, [reduce]);

  // A clip decoding while nobody is looking is exactly the cost this section was
  // optimised to remove (msbkbach), and a video does not stop on its own when it
  // scrolls out of view. The marquee already pauses its animations off-screen;
  // this gives the video the same manners.
  // The front caption is placed by CSS, ABOVE the card and centred on it - see
  // `.pm__item[data-front] .ap__cap` in hello.css. An earlier version measured
  // the room either side and flipped the label the way the hover path does; it
  // is gone, and the note is worth keeping because the reason it failed is a
  // property of the bloom rather than a bug in the maths: at 1.8x the card is
  // 464px wide and the sentence wants ~635, so NEITHER side has room. There is
  // no side to choose. Above the card there is 278px of clear section.

  const sectionRef = useRef(null);
  useEffect(() => {
    const root = sectionRef.current;
    // querySelectorAll, not querySelector: this started with one clip in the run
    // and a second was added later, which the single-element version would have
    // silently left decoding off-screen forever.
    const vids = [...(root?.querySelectorAll("video") || [])];
    if (!vids.length) return undefined;
    const io = new IntersectionObserver(
      ([e]) => {
        for (const v of vids) {
          if (e.isIntersecting) v.play?.().catch(() => {});
          else v.pause?.();
        }
      },
      { threshold: 0 },
    );
    io.observe(root);
    return () => io.disconnect();
  }, [reduce]);

  return (
    <section className="ap" ref={sectionRef} aria-label="Work along a path">
      <header className="ap__head">
        <h2 className="ap__title">Side quests!</h2>
        {/* Copy replaced by Agam (annotation msd8nv5v), verbatim. The line it
            displaced explained the controls; this one does not, which is the
            point — the controls are directly underneath and explain themselves. */}
        <p className="ap__sub">Making things worth making&hellip;</p>
      </header>

      {/* The stage's top headroom is DERIVED from the card size, not typed in.
          A card grows upward by its own height on hover, so the two have to move
          together — and they already fell out of step once: the 120px added for
          msd80b09 was exactly right for a 172px card and half of what a 344px one
          needs, so doubling the size (msd8fotf) put tiles through the heading. */}
      <div
        className="ap__stage"
        style={{ "--ap-size": `${size}px` }}
        {...stepAside}
        /* TWO refs, one node: the tilt handler owns the pointer, the front-side
           observer owns the attribute the engine writes. Kept as separate
           callbacks rather than one shared ref so each effect can be read on its
           own. */
        ref={tiltRef}
      >
        <PathMarquee
          apiRef={marqueeApi}
          pitches={BLUEPRINT_PLATES.map((p) => p.pitch ?? 1)}
          preset={preset}
          speed={speed}
          easing={pace === "ends" ? EASE_ENDS : undefined}
          direction={reverse ? "reverse" : "normal"}
          showPath={showPath}
          rotate={rotate}
          repeat={density}
          spacing="x"
          itemWidth={size}
          spread={spread}
          hoverMode={hover}
          /* On a phone, hold the top of the ladder but lift the floor to
             MOBILE_MIN, so the size spread is phi*1.5 instead of the depth's own
             (golden = phi^3). Depths with no scaleRange (Flat) stay untouched. */
          scaleRange={
            narrow && DEPTHS[depth].scaleRange
              ? [MOBILE_MIN, DEPTHS[depth].scaleRange[1]]
              : DEPTHS[depth].scaleRange
          }
          scaleCurve={DEPTHS[depth].scaleCurve || 1}
          frontAt={DEPTHS[depth].frontAt || 0}
          depthFade={DEPTHS[depth].depthFade}
          depthBlur={DEPTHS[depth].depthBlur}
          perspective={DEPTHS[depth].perspective || 0}
          reduce={reduce}
          /* 0.07 -> 0.14 (msq2cguw). The seam is only just off the frame now
             that the path stopped overshooting by a whole tile width, so the
             fade has to start earlier: at 0.07 a tile was still near full
             strength as it crossed the edge. This is the half of "flow in from
             the left, out to the right" that the path cannot do on its own -
             the path decides where a tile enters, the fade decides whether you
             see it arrive or see it appear. */
          /* 0.2 -> 0.06 (deep QA of "follow the path end to end"). At 0.2 the
             tiles reached full opacity only between 20% and 80% of the path and
             were faded to nothing at both ends - so the motion was VISIBLE only
             across the middle 64%, which reads as "plays in the middle, not end
             to end" even though the geometry sweeps the whole width (verified:
             offset-distance 0->100% carries an item cx 1 -> 1087 across the full
             stage, dead on the path).

             A big edge fade was hiding the per-tile wrap - the instant a tile
             jumps from 100% back to 0%. But this is a left-to-right marquee: a
             tile arriving at the left edge and leaving at the right IS the flow
             the section is meant to show (msq2cguw), not a seam to erase. 0.06
             keeps just enough softening that the wrap does not pop, while the
             tile stays fully visible from ~6% to ~94% - effectively edge to
             edge. */
          fadeEdges={0.06}
          className="ap__run"
        >
          {/* Each plate is wrapped in a CARD container (annotation msbodd5p) so
              per-card interaction has somewhere to attach. PathMarquee already
              gives every child a positioned .pm__item, but that box belongs to
              the engine — it carries the offset-path and is rewritten by the
              animation, so it is the wrong place to hang content off. */}
          {/* THE BLUEPRINT RUN, not the ten project plates (msq1t4q9). PLATES is
              left standing directly above rather than deleted: "for now" is in
              the annotation, and the ten cards carry captions, satellites, a
              video and a React-drawn node that would be real work to reconstruct
              from a diff. Swapping this one identifier back restores them. */}
          {BLUEPRINT_PLATES.map((p) =>
            p.black ? (
              /* A BLACK CARD — same frame/size as the clips, solid black fill,
                 no video. Holds its slot so the clips stay spread out. */
              <div key={p.id} className="ap__cell" style={{ "--ap-opt": optical(p.aspect) }} aria-hidden>
                <span className="ap__shift">
                  <article className="ap__card" style={{ aspectRatio: p.aspect, background: "#000" }} />
                </span>
              </div>
            ) : p.video ? (
              /* --ap-sat-reach: how far the satellite cluster spreads, as a
                 fraction of the cell, so the caption can clear the CLUSTER
                 rather than the card (annotation msivdpd3). Derived from the
                 same s.x the satellites are placed with — a typed number here
                 would silently stop matching the first time a plate's
                 arrangement is edited. Absent on plates with no satellites, and
                 the CSS falls back to the card's own edge there. */
              <div
                key={p.id || p.video}
                className="ap__cell"
                style={{
                  "--ap-opt": optical(p.aspect),
                  ...(p.sats
                    ? { "--ap-sat-reach": Math.max(...p.sats.map((s) => Math.abs(s.x))) }
                    : {}),
                }}
              >
                <span className="ap__shift">
                {/* `background` is the SMART FILL for `contain` clips — the colour
                    sampled from the video shows through the letterbox its aspect
                    leaves, so nothing is cropped and the bars are not black. */}
                <article
                  className="ap__card"
                  data-ambient={p.contain && p.poster ? "true" : undefined}
                  style={{
                    aspectRatio: p.aspect,
                    ...(p.fill ? { background: p.fill } : {}),
                    // AMBIENT FILL (annotation msuaf27c, "smart fill for the empty
                    // space in the tile"): the letterbox is filled with the clip's
                    // own poster, blown up and blurred behind the contained video
                    // (see .ap__card[data-ambient]::before), the way a player's
                    // ambient mode does it. The sampled `fill` colour stays
                    // underneath as the base the blur sits on.
                    ...(p.contain && p.poster ? { "--ap-poster": `url(${p.poster})` } : {}),
                  }}
                >
                  {/* muted + playsInline are what make autoplay legal on iOS at all;
                      `reduce` swaps it for the poster frame rather than motion.
                      `--contain` fits the whole clip with no crop (see hello.css). */}
                  <video
                    className={`ap__plate${p.contain ? " ap__plate--contain" : ""}`}
                    src={reduce ? undefined : p.video}
                    poster={p.poster}
                    aria-label={p.alt}
                    autoPlay={!reduce}
                    muted
                    loop
                    playsInline
                    preload="metadata"
                    tabIndex={-1}
                  />
                </article>
                {/* OUTSIDE the card, and that placement is forced: .ap__card is
                    `overflow: hidden`, so satellites that sit around the tile
                    would be sliced off by it. The cell wrapper already exists
                    for exactly this reason (the caption hit it first, msd7qrro).

                    aria-hidden throughout: these are three more views of the
                    same product the card already names, and a screen reader
                    listing them adds nothing the alt has not said. */}
                {p.sats && (
                  <span className="ap__sats" aria-hidden>
                    {p.sats.map((s, k) =>
                      s.globe ? (
                        <span
                          key="globe"
                          className="ap__sat ap__sat--globe"
                          style={{ "--sx": s.x, "--sy": s.y, "--i": k }}
                        >
                          <Globe />
                        </span>
                      ) : (
                        <img
                          key={s.src}
                          className="ap__sat"
                          style={{ "--sx": s.x, "--sy": s.y, "--i": k }}
                          src={s.src}
                          alt=""
                          loading="lazy"
                          /* async: these decode while the run is moving, and a
                             synchronous decode on a marquee frame is a stutter */
                          decoding="async"
                          draggable="false"
                        />
                      ),
                    )}
                  </span>
                )}
                {/* `quiet` plates draw no caption at all — the blueprint clips
                    carry no words (the image branch already did this; the video
                    branch was drawing the alt as text on the tile). */}
                {p.quiet ? null : (
                  <span className="ap__cap" aria-hidden={p.caption ? undefined : true}>
                    {p.caption || p.alt}
                  </span>
                )}
                </span>
              </div>
            ) : p.node ? (
              /* A CODED FIGURE AS A PLATE (annotation msk1e5oo, "add one card
                 for AIIMS research"). Every other card in this run is an
                 exported image because every other project has shipped screens;
                 AIIMS has none — it is a research study, and its case study is
                 built from figures written in React rather than captured.

                 So the card carries the figure itself. Agam picked the
                 research-gap chart over a purpose-built plate, knowing the
                 trade: it is the argument of the whole piece in one image, and
                 it is also a labelled bar chart being asked to read at a
                 fraction of the width it was drawn for.

                 What makes that survivable is the half-scale wrapper in
                 hello.css — the figure lays out at twice the card's width and
                 is scaled to half, so it gets the room its grid was designed
                 for and keeps its proportions at any card size, rather than
                 collapsing its 88px name column. */
              <div key={p.node} className="ap__cell" style={{ "--ap-opt": optical(p.aspect) }}>
                <span className="ap__shift">
                <article className="ap__card" style={p.aspect ? { aspectRatio: p.aspect } : undefined}>
                  <span className="ap__node" role="img" aria-label={p.alt}>
                    <PlateNode name={p.node} />
                  </span>
                </article>
                <span className="ap__cap" aria-hidden={p.caption ? undefined : true}>
                  {p.caption || p.alt}
                </span>
                </span>
              </div>
            ) : (
              <div key={p.src} className="ap__cell" style={{ "--ap-opt": optical(p.aspect) }}>
                <span className="ap__shift">
                <article className="ap__card" style={p.aspect ? { aspectRatio: p.aspect } : undefined}>
                  {p.cluster ? (
                  /* The cluster is one CARD holding several plates, not several
                     cards: the run positions cards on the path, so a second card
                     would be a second stop on the curve rather than a stack. Only
                     the first carries the alt — the others are the same picture,
                     and repeating it would just make a screen reader say it three
                     times. */
                  Array.from({ length: p.cluster }, (_, k) => (
                    <img
                      key={k}
                      className="ap__plate ap__plate--stacked"
                      style={{ "--k": k, "--of": p.cluster }}
                      src={p.src}
                      alt={k === 0 ? p.alt : ""}
                      aria-hidden={k === 0 ? undefined : true}
                      loading="lazy"
                      draggable="false"
                    />
                  ))
                ) : (
                  <img className="ap__plate" src={p.src} alt={p.alt} loading="lazy" draggable="false" />
                )}
                </article>
                {/* OUTSIDE the card (annotation msd7qrro), which is why the cell
                    wrapper exists at all: .ap__card is `overflow: hidden`, so a
                    caption below it was being clipped away.
                    aria-hidden ONLY while the caption repeats the alt — which is
                    the usual case, and saying it twice helps nobody. A plate with
                    its own `caption` says something the alt does not, so that one
                    stays readable to assistive tech. */}
                {/* `quiet` plates draw nothing here at all - see BLUEPRINT_PLATES */}
                {p.quiet ? null : (
                  <span className="ap__cap" aria-hidden={p.caption ? undefined : true}>
                    {p.caption || p.alt}
                  </span>
                )}
                </span>
              </div>
            ),
          )}
        </PathMarquee>
      </div>

      {/* THE ROW'S TOOLBAR, HERE TOO (annotation msu925a2, "add this to the
          side quest section as well" - pointing at the phone row's .hm-bar).
          Same pill, same classes (.hm-filter / __nav / __arrow), so the two
          sections share one control language: prev / next step the run by one
          tile, and a play/pause takes the place of the phone row's dwell ring
          - this run is continuous, so it has no dwell to report, but it does
          have a state worth holding. Talks to PathMarquee through apiRef. */}
      <div className="hm-bar ap__bar">
        <div className="hm-filter">
          {/* the play/pause sits where the phone row's dwell ring sits, in the
              same group box, so the divider and spacing match */}
          <div className="hm-filter__dwell">
          <button
            type="button"
            className="hm-filter__arrow"
            onClick={() => {
              feedback("toggle");
              if (marqueeApi.current?.isPaused()) marqueeApi.current.play();
              else marqueeApi.current?.pause();
              setBarPaused((v) => !v);
            }}
            aria-pressed={barPaused}
            data-tip
            aria-label={barPaused ? "Play the run" : "Pause the run"}
          >
            {barPaused ? (
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden>
                <path d="M6.5 4.5v9l7-4.5-7-4.5z" fill="currentColor" />
              </svg>
            ) : (
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden>
                <path d="M6 4.5v9M12 4.5v9" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
              </svg>
            )}
          </button>
          </div>
          <div className="hm-filter__nav">
            <button type="button" className="hm-filter__arrow" onClick={() => { feedback("navigate"); marqueeApi.current?.nudge(-1); }} data-tip aria-label="Previous tile">
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden>
                <path d="M11 4l-5 5 5 5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            <button type="button" className="hm-filter__arrow" onClick={() => { feedback("navigate"); marqueeApi.current?.nudge(1); }} data-tip aria-label="Next tile">
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden>
                <path d="M7 4l5 5-5 5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* The controls ARE the exhibit. A path that can only be changed in the
          source is not "customisable" to anyone reading the page. */}
      <div className="ap__controls">
        <Group
          name="Path"
          options={PATH_KEYS.map((k) => ({ label: PATH_PRESETS[k].label, value: k }))}
          value={preset}
          /* A DRAWN PRESET BRINGS ITS OWN RHYTHM (Wave 2, Agam 2026-08-15,
             "not matching exactly"): a preset carrying `xs` was measured off a
             frame with exactly that many cards evenly phased, so picking it
             also sets Density to Sparse (one lap of the nine plates) and
             Spacing to Even (no thinning), or the stops cannot land. The
             chips stay live to change afterwards. */
          onPick={(k) => {
            setPreset(k);
            if (PATH_PRESETS[k]?.xs) {
              setDensity(1);
              setSpread(1);
            }
          }}
        />
        <Group name="Speed" options={SPEEDS} value={speed} onPick={setSpeed} />
        {/* The pace CURVE beside the pace RATE: Speed says how fast a lap is,
            this says where in the lap the time is spent (Agam, 2026-08-14). */}
        <Group name="Pace" options={PACES} value={pace} onPick={setPace} />
        <Group
          name="Depth"
          options={Object.entries(DEPTHS).map(([k, v]) => ({ label: v.label, value: k }))}
          value={depth}
          onPick={setDepth}
        />
        <Group name="Density" options={DENSITIES} value={density} onPick={setDensity} />
        <Group name="Size" options={SIZES} value={size} onPick={setSize} />
        <Group name="Spacing" options={SPREADS} value={spread} onPick={setSpread} />
        <Group name="On hover" options={HOVERS} value={hover} onPick={setHover} />

        <div className="ap__group" role="group" aria-label="Options">
          <span className="ap__label">Show</span>
          <div className="ap__chips">
            <button type="button" className="ap__chip" data-active={showPath ? "true" : undefined}
              aria-pressed={showPath} onClick={() => { feedback("toggle"); setShowPath((v) => !v); }}>
              The path
            </button>
            <button type="button" className="ap__chip" data-active={rotate ? "true" : undefined}
              aria-pressed={rotate} onClick={() => { feedback("toggle"); setRotate((v) => !v); }}>
              Face the curve
            </button>
            <button type="button" className="ap__chip" data-active={reverse ? "true" : undefined}
              aria-pressed={reverse} onClick={() => { feedback("toggle"); setReverse((v) => !v); }}>
              Reverse
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
