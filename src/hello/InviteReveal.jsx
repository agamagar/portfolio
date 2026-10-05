// The CaratLane invite reveal (annotation msk5ybfa).
//
// The second Figma motion spec brought into the phone row, and a much bigger one
// than the Toppr scroll: `get_motion_context` on node 80:2601 returns a
// 2000ms looping cohort of TWENTY-SEVEN animated nodes. Every number below is
// from that response — the keyframes, the `times`, the per-segment easings and
// the spring. Nothing here is eyeballed.
//
// ── WHY THE SCREEN IS ELEVEN IMAGES AND NOT ONE ─────────────────────────────
// The Toppr card could be a static export with one moving band over it, because
// exactly one thing moved. Here the card rises, and WHILE it rises two wordmark
// layers fade up through a blur and two star clusters sweep in from opposite
// sides — motion nested inside motion. A single flattened export cannot do
// that, so the frame is taken apart into the pieces that move independently and
// reassembled at the offsets Figma reports.
//
// Positions are absolute, in the source frame's own 360x783 units, expressed as
// percentages so the whole thing scales with the phone at any cell size — the
// same reasoning as the Toppr band, one step further.
//
// ── WHAT IS NOT REBUILT, AND IT IS DELIBERATE ───────────────────────────────
// Twenty-two of those twenty-seven nodes are INDIVIDUAL STARS, each rotating
// from its own large negative angle on its own stagger. They are children of the
// two cluster groups, and Figma cannot export a group without its children — so
// rebuilding their rotations separately would mean either 22 more exports or
// editing the source file to hide layers. The clusters travel exactly as
// specified; the stars inside them arrive already spun.
//
// That is the one place this is a faithful reduction rather than a copy, and it
// is worth naming precisely rather than leaving someone to discover it.

import { motion } from "motion/react";

// The source frame, in its own units. Everything below is a share of these.
const W = 360;
const H = 783;
const pct = (v, total) => `${(v / total) * 100}%`;

// A layer's box, straight from the node's absoluteBoundingBox minus its
// parent's. TWO helpers, because percentages resolve against the PARENT and the
// card is its own coordinate space: everything inside the card is a share of
// 348x415, everything outside is a share of the frame's 360x783. Using one for
// both put every piece of the card's content in the wrong place.
const at = (cw, ch) => (x, y, w, h) => ({
  position: "absolute",
  left: pct(x, cw),
  top: pct(y, ch),
  width: pct(w, cw),
  height: pct(h, ch),
});
const box = at(W, H);      // against the frame
const inCard = at(348, 415); // against the card

// EXACT, FROM THE PIPELINE (annotation msk7hjl1, "not accurate with the figma
// motion proto"). The travel distances below were originally derived by hand
// off the node dump's ROUNDED boxes, and every one of them was slightly wrong:
// the card read 96% against a true 96.4302, the wordmarks 27% against 27.3027,
// the star clusters 152% against 150.6412 — that last one out by more than a
// point, because 100/66 is not 100/66.36.
//
// They now come from `tools/figma-motion/build-spec.mjs`, which does the
// division against the unrounded rects. Regenerate rather than re-deriving:
//   node tools/figma-motion/build-spec.mjs motion.json nodes.json 80:2601

const A = "/mockups/figma/caratlane";

// THE SPRING, verbatim. Figma hands this back as a closed-form decay rather than
// a bezier — 1 - e^(-7.6657t)(cos(6.7605t) + 1.1339 sin(6.7605t)) — because the
// card's rise is a real spring and no cubic can spell one. motion takes an
// easing function directly, so it goes in as written rather than being
// approximated by the nearest curve.
const CARD_SPRING = (t) =>
  1 - Math.exp(-t * 7.6657) * (Math.cos(t * 6.7605) + 1.1339 * Math.sin(t * 6.7605));

const LOOP = { duration: 2, repeat: Infinity };

export default function InviteReveal({ playing = true }) {
  // AT REST IT SHOWS THE ARRIVED STATE, not the first frame.
  //
  // Dropping `animate` entirely was the obvious way to stop it and it is wrong:
  // motion falls back to `initial`, and `initial` here is opacity 0 with the
  // card 96% below its slot — so a cell that was not playing rendered the
  // background photo and nothing else. Caught it on screen: the card measured
  // settled at y -3 / opacity 0.99, the row was paused, and the phone went
  // empty.
  //
  // So not-playing animates to the END of the timeline with a zero duration.
  // The still frame of a reveal should be the thing revealed.
  const anim = (target, rest) => (playing ? target : rest);
  const REST = playing ? undefined : { duration: 0 };

  return (
    <span className="hm__invite" aria-hidden>
      <img className="hm__invite-layer" style={box(0, 0, 360, 783)} src={`${A}/bg.png`} alt="" />
      <img className="hm__invite-layer" style={box(0, 0, 360, 783)} src={`${A}/scrim.png`} alt="" />

      {/* THE CARD. y 400 -> 0 on the spring, opacity 0 -> 1 over the first 39%.
          The two properties run on DIFFERENT clocks — the fade finishes long
          before the travel settles — which is what stops it reading as one
          uniform slide. */}
      <motion.span
        className="hm__invite-card"
        data-node="80:2604"
        style={box(6, 394, 348, 415)}
        initial={{ opacity: 0, y: "96.4302%" }}
        animate={anim({ opacity: [0, 1, 1], y: ["96.4302%", "0%", "0%"] }, { opacity: 1, y: "0%" })}
        transition={
          REST || {
            opacity: { ...LOOP, times: [0, 0.3878, 1], ease: ["easeOut", "linear"] },
            y: { ...LOOP, times: [0, 0.8, 1], ease: [CARD_SPRING, "linear"] },
          }
        }
      >
        {/* The card's own contents, at their offsets INSIDE the card box. */}
        <img className="hm__invite-layer" style={inCard(0, 0, 348, 415)} src={`${A}/panel.png`} alt="" />
        {/* The two TEXT layers place at their absoluteRenderBounds, not their
            layout boxes: a text node's layout box is the line box (219x15)
            while the export crops to the GLYPHS (124x11), and stretching
            glyphs to a line box was a 29.5% distortion at 0.57x resolution
            (/motion-check's worst CaratLane finding). */}
        <img className="hm__invite-layer" style={inCard(111.82, 58.4, 124, 11)} src={`${A}/t-invited.png`} alt="" />
        <img className="hm__invite-layer" style={inCard(108.28, 237.9, 133, 30)} src={`${A}/t-email.png`} alt="" />
        <img className="hm__invite-layer" style={inCard(91, 224, 165, 2)} src={`${A}/line1.png`} alt="" />
        <img className="hm__invite-layer" style={inCard(91, 279, 165, 2)} src={`${A}/line2.png`} alt="" />
        <img className="hm__invite-layer" style={inCard(29, 315, 290, 43)} src={`${A}/button.png`} alt="" />
        <img className="hm__invite-layer" style={inCard(305, 18, 25, 25)} src={`${A}/close.png`} alt="" />

        {/* TWO WORDMARKS, NOT ONE, and that is the file's doing rather than a
            mistake here: 80:2608 and 80:2645 are the same artwork stacked, run
            on the same clock but landing at 0.5 and 1.0 opacity. The pair reads
            as one mark resolving out of its own ghost. */}
        {[
          { src: "mark-a", node: "80:2608", to: 0.5, t: [0, 0.173, 0.6392, 1], bt: [0, 0.1744, 0.1745, 0.5554, 0.5555, 0.9999, 1] },
          { src: "mark-b", node: "80:2645", to: 1, t: [0, 0.173, 0.6305, 1], bt: [0, 0.1734, 0.1735, 0.5877, 0.5878, 0.9999, 1] },
        ].map((m) => (
          <motion.img
            key={m.src}
            data-node={m.node}
            className="hm__invite-layer"
            style={inCard(86, 114, 175, 73)}
            src={`${A}/${m.src}.png`}
            alt=""
            initial={{ opacity: 0, y: "27.3027%", filter: "blur(4px)" }}
            animate={anim(
              {
                opacity: [0, 0, m.to, m.to],
                y: ["27.3027%", "27.3027%", "0%", "0%"],
                filter: ["blur(4px)", "blur(4px)", "blur(4px)", "blur(4px)", "blur(0px)", "blur(0px)", "blur(0px)"],
              },
              { opacity: m.to, y: "0%", filter: "blur(0px)" },
            )}
            transition={
              REST || {
                opacity: { ...LOOP, times: m.t, ease: ["linear", "easeOut", "linear"] },
                y: { ...LOOP, times: m.t, ease: ["linear", [0.27, -0.004, 0, 0.993], "linear"] },
                filter: { ...LOOP, times: m.bt, ease: "linear" },
              }
            }
          />
        ))}

        {/* THE TWO STAR CLUSTERS, sweeping in from opposite sides. Same clock,
            mirrored travel, and different easings — the right-hand group gets a
            near-linear [1, 0.008, 0, 0.992] and the left an overshooting
            [0.42, 0, 0.007, 1.007], so they do not arrive as a matched pair. */}
        {/* The cluster WRAPPERS sit at the layout boxes the motion track and
            data-node describe; the star artwork inside is centre-anchored on
            its render bounds at the PNG's own ratio (the exports come out
            60x69 / 60x57.5 frame units against 66.4-wide layout boxes, and
            filling the box skewed the stars 2.6%). The 100px sweep is
            166.6667% of the 60-unit artwork's box - but the track lives on
            the WRAPPER, so it stays a share of 66.4: 150.6024%. */}
        <motion.span
          data-node="80:2688"
          style={inCard(24.5, 115, 66.4, 74.4)}
          initial={{ opacity: 0, x: "150.6024%" }}
          animate={anim({ opacity: [0, 0, 0.23, 0.23], x: ["150.6024%", "150.6024%", "0%", "0%"] }, { opacity: 0.23, x: "0%" })}
          transition={
            REST || {
              opacity: { ...LOOP, times: [0, 0.2995, 0.6965, 1], ease: ["linear", "easeOut", "linear"] },
              x: { ...LOOP, times: [0, 0.4365, 0.6965, 1], ease: ["linear", [1, 0.008, 0, 0.992], "linear"] },
            }
          }
        >
          <img
            className="hm__invite-layer"
            style={{ position: "absolute", left: "4.834%", top: "3.522%", width: "90.361%", height: "92.742%" }}
            src={`${A}/stars-l.png`}
            alt=""
          />
        </motion.span>
        <motion.span
          data-node="80:2700"
          style={inCard(263, 115, 66.4, 63.7)}
          initial={{ opacity: 0, x: "-150.6024%" }}
          animate={anim({ opacity: [0, 0, 0.23, 0.23], x: ["-150.6024%", "-150.6024%", "0%", "0%"] }, { opacity: 0.23, x: "0%" })}
          transition={
            REST || {
              opacity: { ...LOOP, times: [0, 0.2995, 0.6965, 1], ease: ["linear", "easeInOut", "linear"] },
              x: { ...LOOP, times: [0, 0.4365, 0.6965, 1], ease: ["linear", [0.42, 0, 0.007, 1.007], "linear"] },
            }
          }
        >
          <img
            className="hm__invite-layer"
            style={{ position: "absolute", left: "4.774%", top: "4.836%", width: "90.361%", height: "90.267%" }}
            src={`${A}/stars-r.png`}
            alt=""
          />
        </motion.span>
      </motion.span>
    </span>
  );
}
