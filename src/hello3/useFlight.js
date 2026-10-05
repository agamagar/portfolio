// Sizes the /hello0 face to fill the greeting badge.
//
// The face does NOT travel any more (see hello.css "the face" block and
// annotations ms9q3mmq + ms8up04s): it holds one size and one position from
// first paint to rest, like the index-page avatar. So the only thing measured
// here is the RESTING size — the scale that grows the 40px avatar up to fill the
// drawn badge. Everything about the old fly-from-centre choreography is gone.

import { useCallback, useEffect } from "react";

// The avatar renders at its index-page natural size, 40px (.header__avatar in
// index.css). It fills the badge at --fly-rest, then a 1.2 bump on top per
// annotation ms8skarx ("make this bigger").
const NATURAL_FACE_PX = 40;
// 1.2 (the first "make it bigger") then +20% again (annotation msad2f8l) = 1.44.
const SIZE_BUMP = 1.44;
// The face's start point sits a touch right of true viewport centre, which reads
// as "centred" to the eye (per annotation msabeoqp).
const RIGHT_NUDGE_PX = 24;

export function useFlight(flyerRef, rootRef, active) {
  const measure = useCallback(() => {
    const flyer = flyerRef.current;
    const root = rootRef.current;
    if (!flyer || !root) return;

    // Read the rest geometry with the scale removed, so what we measure is the
    // face's true resting box rather than an already-scaled one.
    flyer.style.setProperty("--fly-measuring", "1");
    const r = flyer.getBoundingClientRect();
    flyer.style.removeProperty("--fly-measuring");
    if (!r.width) return;

    // rest scale: the natural 40px avatar sized to fill the drawn badge, bumped
    const restScale = (r.width / NATURAL_FACE_PX) * SIZE_BUMP;
    root.style.setProperty("--fly-rest", restScale.toFixed(4));

    // Horizontal-only glide, per annotation msabeoqp: the face STARTS centred
    // (a touch right of true centre, which reads as centred to the eye) and then
    // slides LEFT into its resting lockup spot. Size and vertical position never
    // change (annotations ms9q3mmq + ms8up04s). --fly-x is the real-pixel delta
    // from the resting centre to that start point; translateX happens after scale
    // so it is NOT divided by restScale.
    const restCx = r.left + r.width / 2;
    const startCx = window.innerWidth / 2 + RIGHT_NUDGE_PX;
    root.style.setProperty("--fly-x", `${(startCx - restCx).toFixed(2)}px`);
  }, [flyerRef, rootRef]);

  // Measured before the first paint, so the face is never seen at the wrong size
  // for a frame.
  useEffect(() => {
    if (!active) return undefined;
    measure();
    // Fonts change the lockup's height and width, which move the badge. Re-measure
    // when they land, and on resize, so the face keeps filling the badge.
    let cancelled = false;
    document.fonts?.ready?.then(() => {
      if (!cancelled) measure();
    });
    window.addEventListener("resize", measure);
    return () => {
      cancelled = true;
      window.removeEventListener("resize", measure);
    };
  }, [active, measure]);

  return measure;
}
