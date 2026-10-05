// ══════════════════════════════════════════════════════════════════════════
// ALONGPATH v1 — A FROZEN SNAPSHOT, taken 2026-08-11 (annotation msnzjru1:
// "save this exact version in /lab page and we'll start designing the v2 once
// saved").
//
// This is a byte-for-byte copy of src/hello/AlongPath.jsx at the moment v2 work
// began, kept so the redesign has something to be compared against. Do not fix
// bugs in here and do not tidy it: its whole value is being exactly what
// shipped, including the parts that were about to be changed.
//
// WHAT IS FROZEN AND WHAT IS NOT — worth knowing before trusting it:
//
//   FROZEN   the component: the step-aside geometry, the tilt loop, the caption
//            side-flip, the controls, the preset maths. All of it lives in this
//            file and nothing outside can change it.
//
//   SHARED   the CSS. Every `.ap*` class here still resolves against the live
//            rules in hello.css, because duplicating 41 rules into a namespaced
//            copy is a mechanical rewrite with more ways to go subtly wrong than
//            to go right. So: **v2 must add NEW class names rather than editing
//            the existing `.ap*` rules.** Edit `.ap__card` and this snapshot
//            changes with it, silently.
//
//   SHARED   PathMarquee, Globe, AiimsGap and the path presets, for the same
//            reason. They are the engine, not the design.
//
// If the styling needs to be frozen too, the honest way is a git tag on the
// current commit — that captures every file exactly, which no amount of copying
// in here can match.
// ══════════════════════════════════════════════════════════════════════════

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
import PathMarquee from "../../../hello/PathMarquee";
import { AiimsGap } from "../../aiims/AiimsFigures";
import Globe from "../../../hello/Globe";
import { feedback } from "../../../ui/feedback";
import { PATH_PRESETS, PATH_KEYS } from "../../../hello/pathPresets";

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

// Depth is the knob with the most range in it, so it gets real options rather
// than an on/off. Each is a different theory of how distance reads:
//   Flat        nothing recedes; the path is a track, not a space
//   Size        near things are bigger. The default, and the cheapest.
//   Air         size PLUS aerial perspective — far things pale out
//   Air + haze  adds blur. Honest about the cost: a filter repaints.
const DEPTHS = {
  flat: { label: "Flat", scaleRange: undefined, depthFade: undefined, depthBlur: 0 },
  size: { label: "Size", scaleRange: [0.82, 1.14], depthFade: undefined, depthBlur: 0 },
  air: { label: "Air", scaleRange: [0.8, 1.16], depthFade: [0.55, 1], depthBlur: 0 },
  haze: { label: "Air + haze", scaleRange: [0.8, 1.16], depthFade: [0.55, 1], depthBlur: 2.5 },
};

const DENSITIES = [
  { label: "Sparse", value: 1 },
  { label: "Full", value: 2 },
  { label: "Packed", value: 3 },
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
const SIZES = [
  { label: "S", value: 138 },
  { label: "M", value: 185 },
  { label: "L", value: 258 },
];

// Spacing only goes DOWN from "Even", and that is not an oversight: at Even the
// cards already occupy the whole path, so it is the most air they can have at a
// given count. More air than that means fewer cards, which is what Density is
// for. This knob adds the other direction — deliberately bunching them.
// "Airy" goes past Even, which needs more path than exists — so it buys the
// extra gap by dropping the cards that would have wrapped past the end (see
// `shown` in PathMarquee). Fewer cards, further apart, same curve.
const SPREADS = [
  { label: "Tight", value: 0.55 },
  { label: "Close", value: 0.78 },
  { label: "Even", value: 1 },
  { label: "Airy", value: 1.4 },
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

export default function AlongPathV1({ reduce }) {
  // THE DEFAULTS ARE THE SETTING AGAM TUNED TO, not the component's own starting
  // point: Wave / Slow / Flat / Sparse / L / Airy, hover Slow, nothing under Show.
  // Read off the live controls rather than guessed, so the section opens on the
  // arrangement he chose instead of one that has to be re-dialled every visit.
  //
  // Worth knowing when reading these: Sparse (repeat 1) is 8 cards, and Airy
  // trims to `floor(count / spread)` = 5 of them. Big cards, few of them, wide
  // apart on a calm curve — a deliberately quiet run, not a busy one.
  const [preset, setPreset] = useState("wave");
  const [speed, setSpeed] = useState(3);
  const [showPath, setShowPath] = useState(false);
  const [rotate, setRotate] = useState(false);
  const [reverse, setReverse] = useState(false);
  const [depth, setDepth] = useState("flat");
  const [density, setDensity] = useState(1);
  const [size, setSize] = useState(258);
  // "pause", not "slow": the ask is that the moment STOPS under the cursor.
  const [hover, setHover] = useState("pause");
  const [spread, setSpread] = useState(1.4);

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
        el.querySelector(".ap__shift")?.style.removeProperty("translate");
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
        if (!me || !cap) return;
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
        const capW = cap.getBoundingClientRect().width;

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
        const hover =
          parseFloat(getComputedStyle(card).getPropertyValue("--ap-hover")) || 1;
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
        const goLeft = capW + gap > roomRight && roomLeft > roomRight;
        if (goLeft) mineCell.dataset.capSide = "left";

        // EVERY TILE THE LABEL LANDS ON, not just the nearest one.
        //
        // The first version moved "the nearest tile that starts to the right",
        // which is right only while a caption is narrower than one gap. These
        // captions are sentences: measured across the run, a single label
        // overlapped TWO cards at once and only one of them was ever asked to
        // move. So the test is the label's actual box against each tile's, and
        // anything it covers steps aside by the same distance.
        //
        // Read AFTER the side is written, because the side is what decides where
        // the box is — and the position is not hover-gated in CSS (only the
        // opacity is), so this rect is the real one even mid-transition.
        const capBox = cap.getBoundingClientRect();
        root.querySelectorAll(".pm__item").forEach((other) => {
          if (other === me) return;
          const r = other.getBoundingClientRect();
          if (!r.width) return;
          // THE CARD'S OWN BOX, not the item's. The item is the engine's slot
          // and the card can sit a little wider than it; pushing by the slot's
          // edge left the card itself a few pixels short — measured 12px and
          // 7px of residue after an otherwise exact step.
          const oc = other.querySelector(".ap__card");
          const cr = oc ? oc.getBoundingClientRect() : r;
          const hitsX = cr.left < capBox.right && cr.right > capBox.left;
          const hitsY = cr.top < capBox.bottom && cr.bottom > capBox.top;
          if (!hitsX || !hitsY) return;
          const cell = other.querySelector(".ap__cell");
          if (!cell) return;
          // EXACTLY AS FAR AS IT INTRUDES. One constant cannot serve every
          // starting position: a tile that was already close to the label ends
          // up still under it, measured at 91px of overlap remaining after a
          // full 200.8px step. How far a tile must go is how far it currently
          // reaches INTO the label, so that is what it moves.
          //
          // WRITTEN ON .ap__shift, and it took a wrong diagnosis to get here.
          // The first attempt set this on .ap__cell and read back correctly off
          // `style` while the computed value stayed 0px; I put that down to
          // React's style reconciliation wiping it. It was not that — the value
          // was still there. It was the TRANSITION on the same property: this
          // row re-renders continuously, the transition restarted before it
          // could advance, and the computed value stayed pinned at its start.
          // The transition is gone (see hello.css) and the write lands.
          const push =
            (goLeft ? cr.right - capBox.left : capBox.right - cr.left) + gap;
          cell.dataset.stepAside = "true";
          cell.dataset.stepDir = goLeft ? "left" : "right";
          const shift = cell.querySelector(".ap__shift");
          if (shift) shift.style.translate = `${goLeft ? -push : push}px`;
        });
        // Recorded together, at the end, because the guard above reads them as a
        // pair: which card was done, and whether that pass left anything behind
        // that can be checked for survival.
        current = card;
        currentShifted = !!root.querySelector("[data-step-aside]");
      },
      onPointerLeave: (e) => {
        current = null;
        clear(e.currentTarget);
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
        ref={tiltRef}
      >
        <PathMarquee
          preset={preset}
          speed={speed}
          direction={reverse ? "reverse" : "normal"}
          showPath={showPath}
          rotate={rotate}
          repeat={density}
          spacing="x"
          itemWidth={size}
          spread={spread}
          hoverMode={hover}
          scaleRange={DEPTHS[depth].scaleRange}
          depthFade={DEPTHS[depth].depthFade}
          depthBlur={DEPTHS[depth].depthBlur}
          reduce={reduce}
          className="ap__run"
        >
          {/* Each plate is wrapped in a CARD container (annotation msbodd5p) so
              per-card interaction has somewhere to attach. PathMarquee already
              gives every child a positioned .pm__item, but that box belongs to
              the engine — it carries the offset-path and is rewritten by the
              animation, so it is the wrong place to hang content off. */}
          {PLATES.map((p) =>
            p.video ? (
              /* --ap-sat-reach: how far the satellite cluster spreads, as a
                 fraction of the cell, so the caption can clear the CLUSTER
                 rather than the card (annotation msivdpd3). Derived from the
                 same s.x the satellites are placed with — a typed number here
                 would silently stop matching the first time a plate's
                 arrangement is edited. Absent on plates with no satellites, and
                 the CSS falls back to the card's own edge there. */
              <div
                key={p.video}
                className="ap__cell"
                style={{
                  "--ap-opt": optical(p.aspect),
                  ...(p.sats
                    ? { "--ap-sat-reach": Math.max(...p.sats.map((s) => Math.abs(s.x))) }
                    : {}),
                }}
              >
                <span className="ap__shift">
                <article className="ap__card" style={{ aspectRatio: p.aspect }}>
                  {/* muted + playsInline are what make autoplay legal on iOS at all;
                      `reduce` swaps it for the poster frame rather than motion. */}
                  <video
                    className="ap__plate"
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
                <span className="ap__cap" aria-hidden={p.caption ? undefined : true}>
                  {p.caption || p.alt}
                </span>
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
                <span className="ap__cap" aria-hidden={p.caption ? undefined : true}>
                  {p.caption || p.alt}
                </span>
                </span>
              </div>
            ),
          )}
        </PathMarquee>
      </div>

      {/* The controls ARE the exhibit. A path that can only be changed in the
          source is not "customisable" to anyone reading the page. */}
      <div className="ap__controls">
        <Group
          name="Path"
          options={PATH_KEYS.map((k) => ({ label: PATH_PRESETS[k].label, value: k }))}
          value={preset}
          onPick={setPreset}
        />
        <Group name="Speed" options={SPEEDS} value={speed} onPick={setSpeed} />
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
