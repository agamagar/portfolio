// The Away zero state, rebuilt from its Figma motion cohort (annotation msk87bcy).
//
// Node 95:20176, a 2000ms loop over twenty animated nodes: the sky settles, the
// two chrome icons pop, the whole content column lifts, and then the greeting,
// the subhead, three suggestion rows and the composer arrive one after another
// on their own offsets. It is a staggered entrance, and the stagger IS the
// design — every layer has its own `times`, none of them share one.
//
// ── BUILT THROUGH THE PIPELINE, NOT BY HAND ─────────────────────────────────
// tools/figma-motion/. Motion context, then geometry, then the ground-truth
// MP4, then `build-spec.mjs` for the numbers. That last step matters: on the
// CaratLane reveal every travel distance was hand-derived off rounded boxes and
// every one was slightly wrong. The percentages below came out of the script.
//
// The script also resolved the nesting, which is the part that is genuinely
// hard to see by eye — the rows sit inside 95:20863, the headings inside
// 95:20203, the icons inside 95:20190, and each of those is its own coordinate
// space. A percentage against the wrong parent is a layer in the wrong place.
//
// ── THE TWO REDUCTIONS, NAMED ───────────────────────────────────────────────
//   1. The content column (95:20199) lifts y 24 -> 0 while its children arrive
//      inside it. That is modelled as the wrapper below, so the two motions
//      compose exactly as they do in the file.
//   2. `95:22852` — the composer frame — RETURNS NO IMAGE from the export API.
//      Its two visible children do, and they carry their own motion anyway, so
//      the composer is rebuilt from those rather than from the parent that
//      would not render. Nothing is lost; it is just assembled a level lower.

import { motion } from "motion/react";

const W = 360;
const H = 782.68;
const A = "/mockups/figma/away";

// Boxes are a share of the ROOT frame. Everything here is a direct child of it
// or is positioned against it deliberately — the nested parents in Figma are
// layout groups with no visual of their own, so flattening them costs nothing
// and saves four wrappers that would only forward a percentage.
const box = (x, y, w, h) => ({
  position: "absolute",
  left: `${(x / W) * 100}%`,
  top: `${(y / H) * 100}%`,
  width: `${(w / W) * 100}%`,
  height: `${(h / H) * 100}%`,
});

// Children of the CONTENT COLUMN resolve their percentages against the
// column's 360x669 box, not the frame's 360x782.68 - `box()` on a column
// child divided by the frame and quietly squashed every layer to 85% of its
// height (312x26 rendered 312x22.2; /motion-check measured it as 17-64%
// aspect distortion across the rows and composer). Coordinates stay in frame
// units with the column's y already subtracted at the call site; only the
// denominators change.
const COL_H = 669;
const inCol = (x, y, w, h) => ({
  position: "absolute",
  left: `${(x / W) * 100}%`,
  top: `${(y / COL_H) * 100}%`,
  width: `${(w / W) * 100}%`,
  height: `${(h / COL_H) * 100}%`,
});

// The kit's own easing, used by nearly every layer in this cohort: a hard
// decelerate that lands without bouncing.
const OUT = [0.16, 1, 0.3, 1];
const LOOP = { duration: 2, repeat: Infinity };

// One entry per layer that arrives on its own offset. `t` is the layer's `times`
// straight from the motion context; the shape of the entrance is shared, the
// timing never is.
// `img` is each row's ARTWORK box relative to its layout box, in percent of
// the 336x68 layout cell. The exports carry the card's drop shadow, so every
// PNG is larger than the cell and off-centre from it; forcing the PNG INTO
// the cell squashed row3 by 47% of its own ratio (/motion-check's finding).
// The wrapper now sits at the layout box - it is what the motion track and
// data-node describe - and the artwork overflows it at the PNG's own ratio,
// centre-anchored on the node's absoluteRenderBounds (export padding around
// render bounds is symmetric antialias margin).
const ROWS = [
  { src: "row1", node: "95:20864", y: 424.5, t: [0, 0.175, 0.4, 1],
    img: { l: -1.1161, t: -4.0074, w: 102.2321, h: 127.2059 } },
  { src: "row2", node: "95:20872", y: 496.5, t: [0, 0.235, 0.46, 1],
    img: { l: -1.3393, t: -11.0294, w: 102.6786, h: 133.8235 } },
  { src: "row3", node: "95:20881", y: 568.5, t: [0, 0.295, 0.52, 1],
    img: { l: -2.381, t: -23.5294, w: 104.7619, h: 147.0588 } },
];

export default function AwayZeroState({ playing = true, reduce = false }) {
  // At rest it holds the ARRIVED frame, not the first one. Dropping `animate`
  // reverts motion to `initial`, which here is a blank screen — the lesson the
  // CaratLane build cost a round to learn, written into the pipeline's README.
  const go = (target, rest) => (playing ? target : rest);
  const REST = playing ? undefined : { duration: 0 };

  return (
    <span className="hm__away" aria-hidden>
      {/* The sky and its glow share one motion — the cohort literally says
          "identical to living-sky, reuse the same component". */}
      <motion.span
        data-node="95:20177"
        data-check="motion"
        style={{ position: "absolute", inset: 0 }}
        initial={{ opacity: 0, scale: 0.92 }}
        animate={go({ opacity: [0, 1, 1], scale: [0.92, 1, 1] }, { opacity: 1, scale: 1 })}
        transition={
          REST || {
            opacity: { ...LOOP, times: [0, 0.3, 1], ease: ["easeOut", "linear"] },
            scale: { ...LOOP, times: [0, 0.4, 1], ease: [OUT, "linear"] },
          }
        }
      >
        {/* The glow's export is the UNCLIPPED blur (1994x1402 = 997x701 frame
            units; the tree's render bounds are frame-clipped to 360 wide, but
            the export is not). Centre-anchored on the layout ellipse: the
            computed left edge of -318 reproduces the render bounds' top of 80
            exactly, which is the cross-check that this anchor is right.
            Forcing it into the 841x545 layout box was an 8.5% squash. */}
        <img className="hm__away-layer" style={box(-318, 80, 997, 701)} src={`${A}/glow.png`} alt="" />
        {/* THE SKY IS A VIDEO (annotation mskcebc1) — `assets/living-sky.mp4`
            from the Drive, which is the real thing the still was a frame of.
            It keeps the still's exact box, so the layer swap changes what is
            painted and nothing about the composition.

            TRANSCODED ON THE WAY IN, the same call the OdinEye clip needed: the
            source is VP9 in an MP4, which Safari will not play, at 5120x2646
            for a layer that renders about 270px wide. Now H.264 yuv420p at
            1352, 3.6MB down to 1.2MB.

            muted + playsInline are what make autoplay legal on iOS at all, and
            `reduce` falls back to the still rather than to motion nobody asked
            for — the same shape as the marquee's other clip. */}
        {reduce ? (
          <img className="hm__away-layer" data-node="95:20177" data-check="geometry" style={box(-158, 0, 676, 349)} src={`${A}/sky.png`} alt="" />
        ) : (
          <video
            className="hm__away-layer"
            data-node="95:20177"
            data-check="geometry"
            style={box(-158, 0, 676, 349)}
            src={`${A}/living-sky.mp4`}
            poster={`${A}/sky.png`}
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
            tabIndex={-1}
          />
        )}
      </motion.span>

      {/* The two chrome icons, popping from 0.7 on their own offsets. */}
      {[
        { src: "icon-l", node: "95:20191", x: 16, t: [0, 0.075, 0.225, 1] },
        { src: "icon-r", node: "95:20194", x: 308, t: [0, 0.125, 0.275, 1] },
      ].map((ic) => (
        <motion.img
          key={ic.src}
          data-node={ic.node}
          className="hm__away-layer"
          style={box(ic.x, 62, 36, 36)}
          src={`${A}/${ic.src}.png`}
          alt=""
          initial={{ opacity: 0, scale: 0.7 }}
          animate={go({ opacity: [0, 0, 1, 1], scale: [0.7, 0.7, 1, 1] }, { opacity: 1, scale: 1 })}
          transition={
            REST || {
              opacity: { ...LOOP, times: ic.t, ease: ["linear", "easeOut", "linear"] },
              scale: { ...LOOP, times: ic.t, ease: ["linear", OUT, "linear"] },
            }
          }
        />
      ))}

      {/* THE CONTENT COLUMN lifts as one, and everything below arrives inside
          it. Nesting rather than adding 24px to each child's own travel: the
          file composes them, so this composes them. */}
      <motion.span
        data-node="95:20199"
        style={box(0, 114, 360, 669)}
        initial={{ y: "3.5876%" }}
        animate={go({ y: ["3.5876%", "3.5876%", "0%", "0%"] }, { y: "0%" })}
        transition={REST || { y: { ...LOOP, times: [0, 0.1, 0.4, 1], ease: ["linear", OUT, "linear"] } }}
      >
        {/* offsets inside the column: the frame's y minus the column's 114 */}
        {/* THE GREETING IS A WIPE, and getting here was the whole lesson of this
            build. The nodes NAMED "Good Morning Sukesh" and "Where are you
            travelling today" are what `get_motion_context` hands you, and the
            image API will happily export them — but their parent (95:20203) is
            `visible: false`, so neither appears in the design at all. I built
            both before checking, and the phone showed text the reference video
            does not contain.

            The real greeting lives inside 95:22851, which reveals by animating
            its HEIGHT from -43 to 125 rather than by fading: a wipe, not an
            entrance. Rebuilt as a clipped box whose height animates, with the
            two texts sitting inside at their own offsets — negative clamps to
            zero, so the travel is 0 -> 125. */}
        <motion.span
          className="hm__away-wipe"
          data-node="95:22851"
          style={{
            position: "absolute",
            left: `${(46 / W) * 100}%`,
            top: `${((142 - 114) / 669) * 100}%`,
            width: `${(268 / W) * 100}%`,
            overflow: "hidden",
          }}
          initial={{ height: 0 }}
          animate={go({ height: [0, 125, 125] }, { height: 125 })}
          transition={REST || { height: { ...LOOP, times: [0, 0.275, 1], ease: [[0.22, 1, 0.36, 1], "linear"] } }}
        >
          <img
            className="hm__away-layer"
            style={{ position: "absolute", left: `${((105 - 46) / 268) * 100}%`, top: 63, width: `${(150 / 268) * 100}%` }}
            src={`${A}/hey.png`}
            alt=""
          />
          <img
            className="hm__away-layer"
            style={{ position: "absolute", left: `${((60 - 46) / 268) * 100}%`, top: 96, width: `${(240 / 268) * 100}%` }}
            src={`${A}/headed.png`}
            alt=""
          />
        </motion.span>

        {ROWS.map((r) => (
          <motion.span
            key={r.src}
            data-node={r.node}
            style={inCol(12, r.y - 114, 336, 68)}
            initial={{ opacity: 0, x: "-8.9286%" }}
            animate={go({ opacity: [0, 0, 1, 1], x: ["-8.9286%", "-8.9286%", "0%", "0%"] }, { opacity: 1, x: "0%" })}
            transition={
              REST || {
                opacity: { ...LOOP, times: r.t, ease: ["linear", "easeOut", "linear"] },
                x: { ...LOOP, times: r.t, ease: ["linear", OUT, "linear"] },
              }
            }
          >
            <img
              className="hm__away-layer"
              style={{
                position: "absolute",
                left: `${r.img.l}%`,
                top: `${r.img.t}%`,
                width: `${r.img.w}%`,
                height: `${r.img.h}%`,
              }}
              src={`${A}/${r.src}.png`}
              alt=""
            />
          </motion.span>
        ))}

        {/* The composer, rebuilt from its two children — see the note at the
            top about the parent frame that will not export. */}
        {[
          // `rise` is the spec's 12px travel as a share of each element's OWN
          // height - one "46%" served both before, which was 12/26 applied to
          // a 36.5-tall layer too (a second, quieter deviation).
          { src: "input", node: "95:20892", y: 680.5, h: 26, rise: "46.1538%", t: [0, 0.2, 1], two: true },
          { src: "actions", node: "95:20893", y: 722.5, h: 36.5, rise: "32.8767%", t: [0, 0.06, 0.26, 1], two: false },
        ].map((c) => (
          <motion.img
            key={c.src}
            data-node={c.node}
            className="hm__away-layer"
            style={inCol(24, c.y - 114, 312, c.h)}
            src={`${A}/${c.src}.png`}
            alt=""
            initial={{ opacity: 0, y: c.rise }}
            animate={go(
              c.two
                ? { opacity: [0, 1, 1], y: [c.rise, "0%", "0%"] }
                : { opacity: [0, 0, 1, 1], y: [c.rise, c.rise, "0%", "0%"] },
              { opacity: 1, y: "0%" },
            )}
            transition={
              REST || {
                opacity: { ...LOOP, times: c.t, ease: [[0.25, 0.1, 0.25, 1], "linear"] },
                y: { ...LOOP, times: c.t, ease: [[0.25, 0.1, 0.25, 1], "linear"] },
              }
            }
          />
        ))}
      </motion.span>
    </span>
  );
}
