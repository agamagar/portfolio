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
// HOW MUCH OF THE BADGE THE FACE FILLS, and the reason the scale is measured off
// the BADGE rather than off the avatar's own box (Agam, 2026-08-11: the lockup is
// 30% smaller on phones).
//
// The old maths was `avatarBox / 40 * 1.44`, and the avatar box is a constant
// 36px - so the scale was a constant 1.296 no matter what size the lockup was.
// That held while there was only one lockup size. Shrink the lockup to 70% and
// the badge goes 78.6 -> 55 while the face stays 51.8px wide: it went from
// sitting inside its disc to crowding it.
// 0.6594 is exactly what the drawn lockup rendered before this change
// (40 * 1.296 / 78.615), so desktop is pixel-identical and the phone now scales
// with everything else in the box.
const FACE_FILLS_BADGE = (NATURAL_FACE_PX * ((36 / NATURAL_FACE_PX) * SIZE_BUMP)) / 78.615;
// THE NUDGE IS GONE, AND THE CENTRE IS NOW THE CLUSTER'S (Agam, 2026-08-11:
// "the face loader animation when the site loads is not centred in web too").
//
// Two errors were stacking, both to the right:
//   1. an optical nudge (24px at 1440, 1/60th of the viewport) that anticipated
//      the wordmark landing to the face's right. It was defensible when the face
//      was the only thing on screen; it is not, because
//   2. the wave hand is on screen too, absolutely positioned at the face's top
//      RIGHT. Measured: the avatar wrap is 36px wide and the hand runs from 31
//      to 57, so what the eye sees spans 0-57 and its centre is 10.5px right of
//      the face's own - about 13.6px once the resting scale is applied.
// So the visible cluster sat roughly 37px right of centre at 1440 while the
// FACE alone was, by the maths, exactly where it was asked to be. Centring what
// is actually drawn removes the need for a fudge factor at any width.
//
// `clientWidth`, not `innerWidth`: innerWidth includes a classic scrollbar, so
// on a platform that reserves gutter space the "centre" would sit half a
// scrollbar right of the centre of what the reader can see.
const viewportCentre = () =>
  typeof document === "undefined" ? 0 : document.documentElement.clientWidth / 2;

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

    // rest scale: the natural 40px avatar sized to fill THE BADGE AS DRAWN AT
    // THIS VIEWPORT. The badge is the element the face lives in, so measuring it
    // is what makes the face shrink with the lockup instead of staying put while
    // the box around it moves. Falls back to the avatar's own box if the badge
    // is not found, which reproduces the previous constant rather than 1.
    const badge = flyer.closest(".hello-hero__badge");
    const badgeW = badge?.getBoundingClientRect().width;
    const restScale = badgeW
      ? (badgeW * FACE_FILLS_BADGE) / NATURAL_FACE_PX
      : (r.width / NATURAL_FACE_PX) * SIZE_BUMP;
    root.style.setProperty("--fly-rest", restScale.toFixed(4));

    // Horizontal-only glide, per annotation msabeoqp: the face STARTS centred and
    // then slides LEFT into its resting lockup spot. Size and vertical position
    // never change (annotations ms9q3mmq + ms8up04s). --fly-x is the real-pixel
    // delta from the resting centre to that start point; translateX happens after
    // scale in the CSS, so it is NOT divided by restScale.
    //
    // What gets centred is the WAVE-INCLUSIVE box, because that is what is on
    // screen during the intro. The hand is absolutely positioned, so it is
    // outside the flyer's layout box and has to be unioned in by hand - in the
    // wrap's own untransformed coordinates (offsetLeft/offsetWidth), never
    // getBoundingClientRect: the hand is mid-wave while this runs and its
    // rendered rect moves frame to frame.
    const wrap = flyer.querySelector(".header__avatar-wrap") || flyer;
    const wave = flyer.querySelector(".header__wave");
    const wrapW = wrap.offsetWidth || r.width;
    // reduced motion renders no hand, and then the face IS the whole cluster
    const clusterLeft = wave ? Math.min(0, wave.offsetLeft) : 0;
    const clusterRight = wave ? Math.max(wrapW, wave.offsetLeft + wave.offsetWidth) : wrapW;
    // how far the drawn centre sits from the face's own, before scaling
    const opticalOffset = (clusterLeft + clusterRight) / 2 - wrapW / 2;

    // The scale runs about the flyer's own centre (transform-origin: 50% 50%),
    // so that centre is scale-invariant and everything measured from it grows by
    // restScale.
    const restCx = r.left + r.width / 2 + opticalOffset * restScale;
    root.style.setProperty("--fly-x", `${(viewportCentre() - restCx).toFixed(2)}px`);
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
