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

// ONCE PER VISIT, not once per mount (Agam, 08 Sep 2026: "when I press back
// from a detailed page the face animation should not play"). The rule above
// this used to be "every load, no seen-flag", written when the landing was
// the only page; now every case study returns here, and the intro replaying
// on each return read as a loading screen. This is in-memory, not storage:
// a fresh page load still opens with the intro, a route back into the
// landing within the same visit starts at rest. There is still no second
// compressed timeline; the skip is the same jump-to-reveal a keypress makes.
let introPlayed = false;

// off: never play the intro (the window scene's folio page: the hero is inside the
// monitor). Starting at "reveal" means the centred face never paints and the scroll
// lock never engages; skipping it after mount let a dev hot reload keep the lock (a
// page stuck on the face, 2026-09-27)
export function useIntroStage(rootRef, { off = false } = {}) {
  const [stage, setStage] = useState(() => {
    if (typeof window === "undefined" || off) return "reveal";
    if (introPlayed) return "reveal";
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return "reveal";
    return "center";
  });
  useEffect(() => {
    if (stage === "reveal") introPlayed = true;
  }, [stage]);

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
