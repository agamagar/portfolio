// The /hello0 intro clock.
//
// Four stages, and the face is a single element travelling through all of them,
// never a handoff between two:
//
//   center   the face sits in the middle of the viewport at full size and plays
//            the index page's own sequence (MorphFace turn-out, the wave, the
//            turn-back). Length comes from MORPH_SEQUENCE, not a number typed
//            here, so it cannot drift from the animation it is timing.
//   rise     it lifts to its final height. The turn-back plays DURING this, which
//            is what stops the two beats reading as a queue.
//   settle   it slides left into the greeting lockup while the page arrives
//            around it.
//   reveal   at rest.
//
// Every duration is a CSS custom property on `.hello` aliasing a token in
// index.css, read back with getComputedStyle, so no raw millisecond literal ever
// appears in the motion code.

import { useCallback, useEffect, useRef, useState } from "react";
import { MORPH_SEQUENCE } from "../MorphFace";

export function readMs(el, name, fallback = 0) {
  if (!el) return fallback;
  const v = getComputedStyle(el).getPropertyValue(name).trim();
  if (!v) return fallback;
  if (v.endsWith("ms")) return parseFloat(v) || fallback;
  if (v.endsWith("s")) return (parseFloat(v) || 0) * 1000 || fallback;
  const n = parseFloat(v);
  return Number.isFinite(n) ? n : fallback;
}

// stages: "center" -> "rise" -> "settle" -> "reveal"
const NEXT = { center: "rise", rise: "settle", settle: "reveal" };

export function useIntroStage(rootRef, enabled = true) {
  // The greeting plays on EVERY load. No persistence, no seen-flag, no second
  // compressed path: two timelines for one choreography drift apart the first
  // time either is edited. Only asking for less motion skips it.
  //
  // `enabled` is NOT a second path — it takes the exact branch reduced-motion
  // already takes, starting at rest.
  //
  // It used to be false for the index's SCAN MODE mount, on the argument that a
  // front door earns 2.6 seconds of held viewport and a mode toggle does not.
  // Agam reversed that: scan mode IS this page, the same mount /hello gets, and
  // greeting someone on one and not the other made the greeting read as a
  // property of the URL rather than of the page. Nothing passes `false` today.
  //
  // The parameter stays because the concern behind it was real and the next
  // caller may not be an arrival — an embed, a preview, a card. What actually
  // protects the impatient is below and is unconditional: reduced-motion starts
  // at rest, and any wheel, touch, pointer or key press skips to `reveal`.
  const [stage, setStage] = useState(() => {
    if (typeof window === "undefined") return "reveal";
    if (!enabled) return "reveal";
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return "reveal";
    return "center";
  });

  const timers = useRef([]);
  const clear = () => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
  };

  // Any deliberate input means "I am here, get on with it".
  const skip = useCallback(() => {
    clear();
    setStage("reveal");
  }, []);

  useEffect(() => {
    if (stage === "reveal") return undefined;
    const el = rootRef.current;

    // The hold at centre is the index sequence's own hold: the wave ends at
    // MORPH_SEQUENCE.holdEnd, and the rise begins there so the face turns back
    // while it is already moving.
    const hold =
      stage === "center"
        ? MORPH_SEQUENCE.holdEnd
        : readMs(el, stage === "rise" ? "--hello-rise" : "--hello-settle", 800);

    timers.current.push(setTimeout(() => setStage((s) => NEXT[s] || "reveal"), hold));
    return clear;
  }, [stage, rootRef]);

  // Lock the page while the loader owns the viewport, and let any real input out.
  useEffect(() => {
    if (stage === "reveal") return undefined;
    // TO THE TOP FIRST. Locking overflow freezes WHEREVER the page currently
    // is, which was fine while the intro only ever ran on a fresh navigation to
    // /hello. It runs on the index's scan toggle now, and the index can be
    // scrolled when you press it — caught this at 373px down, where the intro
    // played its full 2.6s into a viewport with no hero in it and handed back a
    // page already scrolled past its own greeting.
    //
    // `instant`, not smooth: a scroll animating alongside the face's own
    // travel is two motions competing for the same 2.6 seconds, and the jump
    // is invisible anyway because the loader covers the viewport.
    window.scrollTo({ top: 0, behavior: "instant" });
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e) => {
      // Tab is a person navigating, not skipping; reveal so there is something
      // to move through.
      if (e.key === "Escape" || e.key === " " || e.key === "Enter" || e.key === "Tab") skip();
    };
    const opts = { passive: true };
    window.addEventListener("wheel", skip, opts);
    window.addEventListener("touchmove", skip, opts);
    window.addEventListener("pointerdown", skip, opts);
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("wheel", skip, opts);
      window.removeEventListener("touchmove", skip, opts);
      window.removeEventListener("pointerdown", skip, opts);
      window.removeEventListener("keydown", onKey);
    };
  }, [stage, skip]);

  return { stage, skip };
}
