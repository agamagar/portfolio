import { useEffect, useRef, useState } from "react";
import { motion, useMotionValue, useTransform, useAnimationFrame } from "motion/react";
import { cubicBezier } from "motion";
import { useReducedMotion } from "../ds/hooks";
import { Refresh as IconRefresh } from "iconoir-react";
import "./scheduled.css";
import { feedback, feedbackCoalesced } from "../../ui/feedback";
import { withAudio } from "../../ui/sound";
import { voice } from "../../ui/motion-sound/synth.js"; // muku5gig: the site sound engine (silent unless the sound toggle is on)

// mujk4cl5 (27 Sep 2026): the Scheduled Delivery hero, rebuilt from Figma
// HBBgHT1u7e5jsz7BEEZ3fT node 231:8842 ("228"). One 5.48s loop, every track
// verbatim from get_motion_context (values, times, eases):
//   0.00-0.54  the four soft hearts shrink and fade; four lightning bolts
//              (instant) pop in, hold, and go; the hearts spring back
//   0.60-0.73  the hearts swell x7.52, filling the frame
//   0.57-0.79  "Schedule" and "Delivery" arrive letter by letter from each side,
//              the calendar-heart icon drops in between
//   0.83-1.00  the lockup slides back out; the loop restarts
// The stage is laid out in the frame's own 1512 x 982 px and scaled to fit, so
// every position and x offset is Figma's number. Reduced motion: the resting
// lockup, no loop. Off screen: paused (the hearts are very large layers).

// mujqyxf4 (27 Sep): the opening is now Figma 267:12204, a 4s heart <-> lightning
// morph (rotations, 1.2 overshoots, a real crossfade), verbatim. The bloom and
// the lockup keep their timing from 231:8842 and start as the morph completes.
// Timeline in SECONDS, converted to loop fractions with sec().
const A = 4;                 // the morph (267:12204 cohort, 4000ms)
const T0 = 4.05;             // bloom + lockup start, just after the morph lands
const OLD = 5.48, OLD_T0 = 3.18; // 231:8842's loop length and its bloom start
const D = 6.35;              // whole timeline; play-once stops at REST
const sec = (t) => t / D;
const morph = (f) => sec(f * A); // a 267:12204 time fraction -> loop fraction
const L = "linear";
const IN = [0.7, 0, 1, 0.5];
const IO = [0.65, 0, 0.35, 1];
const OUT = [0.16, 1, 0.3, 1];
const SINE = [0.5, 0, 0.5, 1];
const MOVE = [0.42, 0, 0, 0.997];
const SRC = "/figures/scheduled/heart-v2/";
// Site motion tokens (src/index.css), used for the smoothing added on top of
// Figma's keyframes (27 Sep, "clean up this animation ... the hard shapes
// should come smoothly ... follow our website design system motion"):
// the zoom-back mirrors Figma's own zoom-in curve (SINE). QA: a decelerate
// (emphasized-decelerate) launched from the hold at full speed, 1.7x in one
// frame; the standard-spatial curve overshoots 6%, dipping the hearts to x0.61
const M3_SETTLE = [0.5, 0, 0.5, 1];
const M3_EFFECTS = [0.34, 0.8, 0.34, 1];           // --m3-effects-default
// THE BLOOM (27 Sep, "can be smoother when the heart and the other layers
// grow"): the swell 1 -> 7.52 now runs over --m3-dur-cine-hero (1200ms, was
// 0.72s), cascading from the inner heart outward (~55ms per ring) and landing
// together on REST, the lockup. Scale is animated in LOG space (see useScale).
// Curve: Figma's own sine. Measured per frame at 60fps over the 1.2s: sine
// peaks at 5.8% growth/frame with jerk 0.39; --m3-ease-cinematic-push (built
// for glides that LAUNCH) peaked at 8.1% with jerk 8.09, a lurch from rest.
const CINE_PUSH = SINE;
const BLOOM_END = sec(T0 + 1.2);                    // = REST, the lockup frame
const BLOOM_LEN = 1.2 / D;                         // --m3-dur-cine-hero
const bloomAt = (ring) => BLOOM_END - BLOOM_LEN + ring * (0.055 / D); // ring 0 = innermost
const SETTLE = 0.75 / D;                           // --m3-dur-spatial-standard-slow, 750ms of the loop
const SETTLE_AT = 1 - SETTLE;

// [track values, times, eases] per property; one entry per animated node
const track = (values, times, ease) => ({ values, times, ease });
// the swell holds, then SETTLES back to x1 over the loop's last 750ms on the
// same symmetric curve as the zoom-in, so the wrap is a continuous zoom-out, not a snap
// 27 Sep, "a horizontal line cutting the heart": Figma exported each soft heart
// with its blur filter region = its canvas, so the blur was CROPPED at the
// canvas edge (blur 200 in a 400px margin; 55.7 in 111px). Scaled up for the
// bloom, that crop edge showed as a hard line. The SVGs in heart-v2/ are now
// padded by 3x their blur (600 / 167px) and the insets below grew by the same,
// so each heart sits exactly where it did; originals kept in the scratchpad.
// ---- the morph, Figma 267:12204, verbatim (values, times, eases) ----
const E1 = [0.4, 0, 0.2, 1], E2 = [0.22, 0.61, 0.36, 1], E3 = [0.45, 0.05, 0.15, 1];
const mt = (t) => t.map(morph);
// a heart: the morph, then held until its bloom, then the bloom and the settle
// muju0wqt (27 Sep): the bloom's final size is set PER RING so the hearts end
// where the next section begins, instead of a feathered mask hiding a x7.52
// flood. Limit: half the next section's height below the header (243px on the
// 816 column; the ratio holds at any width since both scale with it). Worked in
// stage px from each heart's box plus its blur overhang, centre y 491:
//   heart-4 (inner):  (1448 - 491) / (169 + 111) = x3.4
//   heart-3 (solid):  (1448 - 491) / (444 + 111) = x1.72
//   heart-2, heart-1: already at the line at x1, so they hold at x1
function heartTracks({ o, op, opT, opE, rot, rotT, scT, ring, swell }) {
  return {
    o,
    opacity: track([...op, o], [...mt(opT), 1], [...opE, L]),
    rotate: track([0, rot, rot, 0, 0], [...mt(rotT), 1], [E1, L, E3, L]),
    scale: track([1, 1.2, 0.25, 0.25, 1.2, 1, 1, swell, swell, 1],
      [...mt(scT), bloomAt(ring), BLOOM_END, SETTLE_AT, 1],
      [E2, E1, L, E2, E3, L, CINE_PUSH, L, M3_SETTLE]),
  };
}
const HEARTS = [
  { id: "231:8843", src: "heart-1.svg", box: [-449, -553, 2408.533, 2088], inset: [47.89, 41.52],
    ...heartTracks({ o: 1, op: [1, 1, 0, 0, 1, 1], opT: [0, 0.2, 0.4, 0.6, 0.8, 1], opE: [L, E1, L, E2, L],
      rot: -25, rotT: [0, 0.4, 0.6, 1], scT: [0, 0.2, 0.4, 0.6, 0.8, 1], ring: 3, swell: 1 }) },
  { id: "231:8844", src: "heart-2.svg", box: [-289, -414, 2088.824, 1809.49], inset: [15.38, 13.32],
    ...heartTracks({ o: 0.3, op: [0.3, 0.345, 0, 0, 0.345, 0.3], opT: [0, 0.22, 0.42, 0.58, 0.78, 1], opE: [E3, E1, L, E2, E3],
      rot: 18, rotT: [0, 0.42, 0.58, 1], scT: [0, 0.22, 0.42, 0.58, 0.78, 1], ring: 2, swell: 1 }) },
  { id: "231:8845", src: "heart-3.svg", box: [243, 47, 1025.2, 888.284], inset: [31.33, 27.15],
    ...heartTracks({ o: 1, op: [1, 1, 0, 0, 1, 1], opT: [0, 0.24, 0.44, 0.56, 0.76, 1], opE: [L, E1, L, E2, L],
      rot: -12, rotT: [0, 0.44, 0.56, 1], scT: [0, 0.24, 0.44, 0.56, 0.76, 1], ring: 1, swell: 1.72 }) },
  { id: "231:8846", src: "heart-4.svg", box: [560, 322, 390.711, 338.394], inset: [82.23, 71.22],
    ...heartTracks({ o: 0.66, op: [0.66, 0.759, 0, 0, 0.759, 0.66], opT: [0, 0.26, 0.46, 0.54, 0.74, 1], opE: [E3, E1, L, E2, E3],
      rot: 8, rotT: [0, 0.46, 0.54, 1], scT: [0, 0.26, 0.46, 0.54, 0.74, 1], ring: 0, swell: 3.4 }) },
];
// a bolt: the morph, then hidden (held at its last frame) for the rest
function boltTracks({ op, opT, opE, rot, rotT, scT }) {
  return {
    bolt: true,
    opacity: track([...op, 0], [...mt(opT), 1], [...opE, L]),
    rotate: track([rot, 0, 0, rot, rot], [...mt(rotT), 1], [E1, L, E3, L]),
    scale: track([0.25, 0.25, 1.2, 1, 1.2, 0.25, 0.25], [...mt(scT), 1], [L, E2, E3, E2, E1, L]),
  };
}
const BOLTS = [
  // inset: top, right, bottom, left, as % of the 1512 x 982 frame
  { id: "231:8847", src: "bolt-1.svg", inset: [-108.96, -32.41, -109.88, -32.47],
    ...boltTracks({ op: [0, 0, 1, 1, 0], opT: [0, 0.2, 0.4, 0.8, 1], opE: [L, E2, L, E1], rot: 25, rotT: [0, 0.4, 0.8, 1], scT: [0, 0.2, 0.4, 0.5, 0.8, 1] }) },
  { id: "231:8848", src: "bolt-2.svg", inset: [-73.93, -14.29, -74.85, -14.35],
    ...boltTracks({ op: [0, 0, 0.345, 0.3, 0.345, 0], opT: [0, 0.22, 0.42, 0.5, 0.78, 1], opE: [L, E2, E3, E3, E1], rot: -18, rotT: [0, 0.42, 0.78, 1], scT: [0, 0.22, 0.42, 0.5, 0.78, 1] }) },
  { id: "231:8849", src: "bolt-3.svg", inset: [-20.06, 13.56, -21.08, 13.49],
    ...boltTracks({ op: [0, 0, 1, 1, 0], opT: [0, 0.24, 0.44, 0.76, 1], opE: [L, E2, L, E1], rot: 12, rotT: [0, 0.44, 0.76, 1], scT: [0, 0.24, 0.44, 0.5, 0.76, 1] }) },
  { id: "231:8850", src: "bolt-4.svg", inset: [33.81, 41.41, 32.83, 41.34],
    ...boltTracks({ op: [0, 0, 0.759, 0.66, 0.759, 0], opT: [0, 0.26, 0.46, 0.5, 0.74, 1], opE: [L, E2, E3, E3, E1], rot: -8, rotT: [0, 0.46, 0.74, 1], scT: [0, 0.26, 0.46, 0.5, 0.74, 1] }) },
];
// letters: [char, left px, gradient angle, start time]. Every letter runs the
// same shape (hold, 0.158 in, 0.0884 held, 0.1277 out) from its own start, the
// word assembling from its inner edge outward.
const LETTER_EASE = [L, MOVE, L, MOVE, L];
// start/durations are 231:8842's, re-anchored so the lockup begins at T0
const letterTimes = (s) => {
  const st = sec(T0 + s * OLD - OLD_T0);
  const out = st + sec(0.3741 * OLD);
  const t = [0, st, st + sec(0.158 * OLD), st + sec(0.2464 * OLD)];
  return out >= 0.9999 ? [...t, 1] : [...t, out, 1];
};
const SCHEDULE = [["S", 0, 151.1, 0.6259], ["c", 55, 149.72, 0.6186], ["h", 107, 149.24, 0.6113], ["e", 158, 149.72, 0.604],
  ["d", 210, 150.66, 0.5967], ["u", 264, 149.24, 0.5894], ["l", 315, 123.38, 0.5821], ["e", 335, 149.72, 0.5748]];
const DELIVERY = [["D", 0, 152.77, 0.5748], ["e", 59, 149.72, 0.5821], ["l", 111, 123.38, 0.5894], ["i", 131, 124.67, 0.5967],
  ["v", 152, 148.22, 0.604], ["e", 201, 149.72, 0.6113], ["r", 253, 137.39, 0.6186], ["y", 286, 148.22, 0.6259]];

// The bolts are drawn INLINE, not as <img>: their glow filters reach far past
// the layer box, and an <img> clips an SVG to its own canvas. (Their Figma
// export also came out broken: a 32 x 32 viewBox around a 260+ px path, the
// group's resting opacity 0 baked in, and an "inf" filter region. The files in
// heart-v2/ are repaired: true viewBox, no baked opacity, finite region.)
const svgCache = new Map();
function InlineSvg({ src }) {
  const [html, setHtml] = useState(() => svgCache.get(src) || "");
  useEffect(() => {
    if (svgCache.has(src)) return;
    let live = true;
    fetch(src).then((r) => r.text()).then((t) => {
      const fixed = t.replace(/style="display: block;"/, 'style="display:block;width:100%;height:100%;overflow:visible"');
      svgCache.set(src, fixed);
      if (live) setHtml(fixed);
    });
    return () => { live = false; };
  }, [src]);
  return <span className="shl__svg" aria-hidden dangerouslySetInnerHTML={{ __html: html }} />;
}

// ONE CLOCK (QA 27 Sep, "make sure all the frames are in sync"). Every layer
// used to run its own Motion loop: ~50 independent clocks that started at
// slightly different moments (mount order, the bolts' async SVG) and could
// drift. Now a single progress value p (0..1, one loop = 5.48s) drives every
// property through Figma's own keyframes, times and eases, so all 25 nodes are
// in lockstep by construction. Paused off screen (p just stops); reduced
// motion shows p = REST, the frame where the full lockup is on screen.
const REST = BLOOM_END; // the lockup frame, where play-once stops
// mukuloci (28 Sep): the hero is scored by the MOTION-SOUND ENGINE itself
// (posts/motion-sound/synth.js, copied to src/ui/motion-sound/), not hand-made
// cues. Each beat is one of the engine's own event types, read off this
// timeline (seconds): the engine applies its doctrine (hierarchy level,
// humanised repeats, atonal motion) exactly as it does to a video.
// One voice for the whole clip (doctrine rule 4: peers share attributes).
const HERO_VOICE = "Veil"; // hazy shimmer; any engine voice name works here
const HERO_EVENTS = [
  { t: 0.2 * A, type: "morph", dur: 0.8, gain: 1, pan: 0, cy: 0.45, area: 0.35 }, // heart -> lightning
  { t: 0.8 * A, type: "morph", dur: 0.8, gain: 0.85, pan: 0, cy: 0.45, area: 0.35 }, // lightning -> heart
  { t: T0, type: "rise", dur: 1.2, gain: 1, pan: 0, cy: 0.5, area: 0.9 }, // the bloom builds
  { t: T0 + 1.2, type: "land", dur: 0.45, gain: 1, pan: 0, cy: 0.5, area: 0.6 }, // the lockup settles
];
const ez = (e) => (typeof e === "function" ? e : e === L ? (x) => x : cubicBezier(...e));
const tr = (t) => ({ times: t.times, values: t.values, ease: t.ease.map(ez) });
const K = (v) => ({ times: [0, 1], values: [v, v], ease: [(x) => x] });
// scale in LOG space: equal steps of time give equal RATIOS of growth, which is
// how a zoom is perceived (1 -> 2 reads as big as 4 -> 8)
function useScale(p, t) {
  const lg = useTrack(p, { ...t, values: t.values.map((v) => Math.log(v)) });
  return useTransform(lg, (v) => Math.exp(v));
}
function useTrack(p, t) {
  const c = tr(t);
  return useTransform(p, c.times, c.values, { ease: c.ease, clamp: true });
}

// "the hard shapes should come smoothly": the crisp shapes (the two small bolts,
// the two inner hearts) come INTO FOCUS instead of popping. A bolt resolves from
// a 14px blur to sharp as it fades in and blurs away as it fades out; a heart
// blurs as it fades out and resolves as it returns. Windows are the layer's own
// Figma fade windows, so focus and opacity move together. Stage px (scaled).
const BLUR_MAX = 14;
function blurTrack(n) {
  if (n.focus) { // bolts: in, then out
    const [[a, b], [c, d]] = n.focus;
    return track([BLUR_MAX, BLUR_MAX, 0, 0, BLUR_MAX, BLUR_MAX], [0, a, b, c, d, 1], [L, M3_EFFECTS, L, M3_EFFECTS, L]);
  }
  if (n.blur) { // hearts: out at the start, back in later
    const [[a, b], [c, d]] = n.blur;
    return track([0, BLUR_MAX * 0.7, BLUR_MAX * 0.7, 0, 0], [a, b, c, d, 1], [M3_EFFECTS, L, M3_EFFECTS, L]);
  }
  return K(0);
}

function Letter({ ch, left, deg, start, from, to, p }) {
  const t = letterTimes(start);
  const n = t.length;
  const op = n === 5 ? [0, 0, 1, 1, 0] : [0, 0, 1, 1, 0, 0];
  const x = n === 5 ? [from, from, 0, 0, to] : [from, from, 0, 0, to, to];
  const ease = LETTER_EASE.slice(0, n - 1);
  const opacity = useTrack(p, track(op, t, ease));
  const tx = useTrack(p, track(x, t, ease));
  return (
    <motion.span className="shl__letter"
      style={{ left, x: tx, opacity, backgroundImage: `linear-gradient(${deg}deg, rgb(139, 92, 246) 4.49%, rgb(76, 20, 148) 85.6%)` }}>
      {ch}
    </motion.span>
  );
}

// one keyframed layer: opacity plus uniform `scale` or separate scaleX / scaleY
function Layer({ node, p, className, style, children }) {
  const opacity = useTrack(p, node.opacity || K(1));
  const sx = useScale(p, node.scale || node.scaleX || K(1));
  const sy = useScale(p, node.scale || node.scaleY || K(1));
  const rotate = useTrack(p, node.rotate || K(0));
  const filter = useTransform(useTrack(p, blurTrack(node)), (b) => (b < 0.05 ? "none" : `blur(${b.toFixed(2)}px)`));
  return (
    <motion.div className={className} style={{ ...style, opacity, scaleX: sx, scaleY: sy, rotate, filter }}>
      {children}
    </motion.div>
  );
}

const ICON_T = [0, ...[0.6113, 0.6949, 0.8334, 0.9099].map((f) => sec(T0 + f * OLD - OLD_T0)), 1];
const ICON = {
  opacity: track([0, 0, 1, 1, 0, 0], ICON_T, [L, MOVE, L, SINE, L]),
  scaleY: track([0, 0, 1, 1, 0, 0], ICON_T, [L, [0, 0, 0.2, 1], L, [0.4, 0, 1, 1], L]),
  y: track([-110, -110, 0, 0, -110, -110], ICON_T, [L, [0, 0, 0.2, 1], L, [0.4, 0, 1, 1], L]),
};
function Icon({ p }) {
  const opacity = useTrack(p, ICON.opacity), scaleY = useTrack(p, ICON.scaleY), y = useTrack(p, ICON.y);
  return (
    <motion.div className="shl__icon" data-node-id="231:8861" style={{ opacity, scaleY, y }}>
      <span className="shl__cal">
        <span className="shl__cal-body" />
        <span className="shl__cal-ring shl__cal-ring--l" />
        <span className="shl__cal-ring shl__cal-ring--r" />
        <img className="shl__cal-heart" src={SRC + "icon-heart.svg"} alt="" draggable="false" />
      </span>
    </motion.div>
  );
}

export default function SchedHeartLoop() {
  const reduce = useReducedMotion();
  const root = useRef(null);
  const [k, setK] = useState(816 / 1512);
  const [dx, setDx] = useState(0);
  const [inView, setInView] = useState(true);
  const p = useMotionValue(reduce ? REST : 0);
  const elapsed = useRef(0);
  useEffect(() => {
    const el = root.current; if (!el) return;
    // fit the 1512 x 982 stage inside the box (the box may be height-capped)
    const fit = () => {
      const s = Math.min(el.clientWidth / 1512, el.clientHeight / 982);
      setK(s); setDx((el.clientWidth - 1512 * s) / 2);
      // 27 Sep: the bleed below the header is capped at HALF the height of the
      // first section after it (the opening question), measured live
      // the first real block inside the article body (skipping id anchors)
      const body = el.closest("article")?.querySelector(".article__body");
      const next = body ? [...body.children].find((n) => n.getBoundingClientRect().height >= 40) : null;
      const cap = next ? next.getBoundingClientRect().height * 0.5 : 265;
      el.style.setProperty("--bleed", cap.toFixed(0) + "px");
    };
    const ro = new ResizeObserver(fit); ro.observe(el); fit();
    const io = new IntersectionObserver(([e]) => setInView(e.isIntersecting), { threshold: 0.05 });
    io.observe(el);
    return () => { ro.disconnect(); io.disconnect(); };
  }, []);
  useEffect(() => { if (reduce) p.set(REST); }, [reduce, p]);
  const play = !reduce && inView;
  // 27 Sep: plays ONCE ("should not play on loop") and holds on REST, the
  // frame where the full lockup is on screen; the replay button runs it again.
  const [done, setDone] = useState(false);
  const END = REST * D * 1000;
  useAnimationFrame((_, delta) => {
    if (!play || done) return;
    const before = elapsed.current / 1000;
    elapsed.current = Math.min(END, elapsed.current + Math.min(delta, 100)); // a stalled tab resumes, it does not leap
    // muku9xkn (28 Sep): sound on the animation's own beats, measured off this
    // timeline (seconds): the bolts start forming at 0.2 of the morph (0.8s),
    // start folding back at 0.8 of it (3.2s), and the bloom runs T0 -> +1.2s.
    // A cue fires once, when the clock CROSSES its beat.
    const now = elapsed.current / 1000;
    for (const ev of HERO_EVENTS) if (before < ev.t && now >= ev.t) withAudio((c, out) => voice(c, out, ev, c.currentTime + 0.001, HERO_VOICE));
    const v = elapsed.current / 1000 / D;
    p.set(v);
    if (root.current) root.current.dataset.p = v.toFixed(4); // for QA
    if (elapsed.current >= END) setDone(true); // the lockup's sound is the engine's "land" event
  });
  const replay = () => { feedback("select"); elapsed.current = 0; p.set(0); setDone(false); };
  // mujw5frz (27 Sep): the opening question below takes the hero's colour. The
  // lightning bolts' OWN opacity track (bolt-1, the lead bolt) is the green
  // weight, 0..1, so the text is exactly as green as the bolts are visible.
  // Written as a CSS variable on the article; index.css mixes the ink with it.
  const green = useTrack(p, BOLTS[0].opacity);
  useEffect(() => {
    // 28 Sep PERF: written on the opening question's own block, NOT the article.
    // A custom property set on <article> every frame restyled the whole 35k px
    // page each frame (measured: 46 janky frames, worst 450ms); scoped here only
    // the question re-styles. The label reads it by inheritance.
    const host = root.current?.closest("article")?.querySelector(".iq");
    if (!host) return undefined;
    const put = (v) => host.style.setProperty("--hero-green", Math.max(0, Math.min(1, v)).toFixed(3));
    put(green.get());
    const off = green.on("change", put);
    return () => { off(); host.style.removeProperty("--hero-green"); };
  }, [green]);
  return (
    <div className="shh shl" aria-label="Schedule Delivery" ref={root}>
      {/* the bleed window: the swell can glow past the header, feathered out so
          it ends exactly --bleed below it (and the same above and at the sides) */}
      <div className="shl__bleed">
      <div className="shl__stage" style={{ transform: `translate(calc(${dx}px + var(--bleed)), var(--bleed)) scale(${k})` }} data-node-id="231:8842">
        {HEARTS.map((h) => (
          <Layer key={h.id} node={h} p={p} className="shl__heart"
            style={{ left: h.box[0], top: h.box[1], width: h.box[2], height: h.box[3] }}>
            {/* the svg overhangs its node box by the frame's insets (the blur) */}
            <img src={SRC + h.src} alt="" draggable="false"
              style={{ left: `-${h.inset[1]}%`, top: `-${h.inset[0]}%`, width: `${100 + 2 * h.inset[1]}%`, height: `${100 + 2 * h.inset[0]}%` }} />
          </Layer>
        ))}
        {BOLTS.map((b) => (
          <Layer key={b.id} node={b} p={p} className="shl__bolt"
            style={{ inset: b.inset.map((v) => v + "%").join(" ") }}>
            <InlineSvg src={SRC + b.src} />
          </Layer>
        ))}
        <div className="shl__text" data-node-id="231:8851">
          <div className="shl__word" style={{ left: 255.5 }} aria-hidden>
            {SCHEDULE.map(([ch, left, deg, s2], i) => (
              <Letter key={i} ch={ch} left={left} deg={deg} start={s2} from={-40} to={-175.5} p={p} />
            ))}
          </div>
          <Icon p={p} />
          <div className="shl__word" style={{ left: 870.5 }} aria-hidden>
            {DELIVERY.map(([ch, left, deg, s2], i) => (
              <Letter key={i} ch={ch} left={left} deg={deg} start={s2} from={40} to={233.5} p={p} />
            ))}
          </div>
        </div>
      </div>
      </div>
      {/* the replay, back (27 Sep), in the nav's glass (.article__hero-replay
          shares the top-controls glass and the #glass-lens refraction) */}
      {!reduce && (
        <button type="button" className="article__hero-replay" aria-label="Replay the header animation" onClick={replay}>
          <IconRefresh width={15} height={15} strokeWidth={1.8} aria-hidden="true" />
        </button>
      )}
    </div>
  );
}

// for the timeline QA script (tools/qa-heart-loop.mjs); not used by the page
export const __QA = { HEARTS, BOLTS, ICON, SCHEDULE, DELIVERY, letterTimes, LETTER_EASE, blurTrack, D };
