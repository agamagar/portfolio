// The scrolling band inside a phone cell (annotation msjywvoj).
//
// A screen whose content scrolls itself, played to the EXACT timeline drawn in
// Figma rather than to a plausible-looking loop. The spec lives in helloData's
// `scroll` and was read off node 80:4215 with `get_motion_context`; nothing here
// invents a number.
//
// WHY THE SPEC HAD TO BE FETCHED AND NOT INFERRED. The first build of this read
// the frame's CONSTRUCTION — a short clipped viewport over a very tall content
// strip, with copies of the content parked below it — and concluded it was a
// continuous seamless loop, which is what that construction usually means. It is
// not what this one means. The real timeline holds still, scrolls, holds, and
// runs back to the top: the PAUSES are the whole gesture, and a constant drift
// had none of them. Construction is evidence of intent, not a substitute for it.
//
// ONE COPY OF THE STRIP, not two. The seam a second copy exists to hide only
// happens if the travel wraps; this one turns around and comes home (-940 of
// 1460, then back to -8), so the far end is never reached and a duplicate would
// be a megabyte of nothing.
//
// ── WHY CSS AND NOT motion/react ────────────────────────────────────────────
// This shipped broken first and the QA is worth keeping, because four different
// causes each produced the identical symptom — a strip sitting perfectly still —
// and only the last one is about the library:
//
//   1. `loading="lazy"` on the strip. It lives inside a band with
//      `overflow: hidden` in a marquee cell usually parked off to one side, so
//      the lazy heuristic never fetched it: naturalWidth 0, strip height 0,
//      every offset resolving against nothing. A lazy image is fine when it is
//      a picture; this one is the animation's coordinate system.
//   2. `initial={false}`. It reads as a harmless "do not animate on mount", and
//      against a KEYFRAME ARRAY it makes motion skip the sequence and render
//      the last keyframe as a static style.
//   3. A HIDDEN TAB. Both readings above were taken through a browser tab that
//      was not visible, where `document.hidden` is true and an animation's
//      currentTime simply does not advance — so a working animation and a dead
//      one produce the same measurement, zero. Two full rounds of "fix" were
//      aimed at this. Anything that samples motion has to check
//      `document.hidden` FIRST; it is the null hypothesis, not an afterthought.
//
// Causes 1 and 2 were real and were observed independently of visibility (a
// naturalWidth of 0, and a static inline style holding the last keyframe).
// Whether motion/react would have played the array once those were fixed was
// NEVER ESTABLISHED — the bisect that seemed to condemn it ran in the hidden
// tab. It may well have worked. Recorded that way rather than as a verdict.
//
// CSS is still the right tool here, on its own merits and not as a workaround. This
// timeline is ten stops on uneven offsets with a DIFFERENT easing per segment,
// and CSS expresses that natively: `animation-timing-function` declared inside a
// keyframe governs the interval STARTING at that keyframe, which is precisely
// what Figma's per-segment ease array means. Offsets are `times` as percentages.
// And translateY takes a percentage of the element's own height, so the whole
// thing rescales with the cell for free — no ResizeObserver, no measurement, no
// second source of truth.
//
// The rule the rest of this codebase already follows applies here too: a value
// rewritten every frame does not belong to a library that has to be talked into
// it when the platform does it directly.

import { useMemo } from "react";

// Figma's ease entries -> CSS timing functions. The two beziers ending above 1
// are a slight overshoot and are Figma's, not a typo; CSS allows y outside
// [0,1] (only x is clamped), so they carry over exactly.
function timing(e) {
  if (Array.isArray(e)) return `cubic-bezier(${e.join(",")})`;
  if (e === "easeOut") return "ease-out";
  if (e === "easeIn") return "ease-in";
  if (e === "easeInOut") return "ease-in-out";
  return "linear";
}

// `playing` is the answer to "is anyone actually looking at this right now".
//
// IT RESETS RATHER THAN RESUMES (annotation msk1b8fq: "always reset the
// animation when the user moves on to the next screen or comes back to this").
// This REVERSES the previous call here, which paused and picked up where it
// stopped on the reasoning that a 3s hold against a 5s tour means a resetting
// tour can only ever show its first three seconds. Agam's call, and the reading
// behind it is the stronger one: a screen you return to should show you the same
// thing it showed you last time. A tour that resumes mid-scroll opens on an
// arbitrary middle and never reads as the beginning of anything.
//
// Done by swapping `animation` to `none` and back rather than by seeking the
// animation imperatively: the none -> name transition IS a restart, so the reset
// is a consequence of the declarative state rather than a second mechanism that
// has to be kept in step with it. While it is off the strip sits at
// translateY(0), which is the top of the screen — the reset state is also the
// resting state, with nothing extra to arrange.
//
// WORTH KNOWING, and left as Agam's to weigh: the hold is 3s and the timeline is
// 5s, so the last two seconds — the deepest scroll and the run back to the top —
// never play. Syncing the two is a one-number change at either end.
export default function ScrollBand({ scroll, reduce, playing = true }) {
  // A name per strip, so two screens with different timelines cannot collide on
  // one @keyframes rule.
  const name = useMemo(
    () => `hm-scroll-${scroll.body.replace(/[^a-z0-9]+/gi, "-").replace(/^-|-$/g, "")}`,
    [scroll.body],
  );

  const css = useMemo(() => {
    const stops = scroll.y.map((v, i) => {
      const offset = +(scroll.times[i] * 100).toFixed(4);
      const pct = +((v / scroll.frame) * 100).toFixed(4);
      // ease[i] governs the segment that STARTS at keyframe i, so the last
      // keyframe has no easing of its own to declare.
      const fn = i < scroll.ease.length ? `animation-timing-function:${timing(scroll.ease[i])};` : "";
      return `${offset}%{transform:translateY(${pct}%);${fn}}`;
    });
    return `@keyframes ${name}{${stops.join("")}}`;
  }, [name, scroll]);

  return (
    <span
      className="hm__scroll"
      aria-hidden
      style={{
        "--sc-top": `${scroll.top}%`,
        "--sc-h": `${scroll.height}%`,
        background: scroll.bg,
      }}
    >
      <style>{css}</style>
      {/* Reduced motion gets the strip at rest rather than no strip at all: it
          is the same content the static export was already showing, so holding
          it still removes the motion without removing anything to look at. */}
      <span
        className="hm__scroll-track"
        data-node="80:4215"
        data-check="motion"
        style={
          reduce
            ? undefined
            : { animation: playing ? `${name} ${scroll.duration}s infinite` : "none" }
        }
      >
        {/* NOT lazy — see cause 1 above. `aspect-ratio` gives the box its true
            proportions on the FIRST layout pass rather than when the bytes
            land, so the percentages never resolve against a collapsed strip. */}
        <img
          src={scroll.body}
          alt=""
          draggable="false"
          decoding="async"
          style={{ aspectRatio: `${scroll.frameW} / ${scroll.frame}` }}
        />
      </span>
    </span>
  );
}
