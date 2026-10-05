// The window scene on the folio page (Hello3, behind ?scene=window until Agam
// approves; 30-locked-brief "Build order" 2). It replaces the Living Sky band: the
// canvas sits fixed behind the whole page (z-index -1, over the paper grain, under
// every section), the hero plus one viewport of spacer is the main runway, and a
// bookend runway before the footer pulls the camera back out into the room.
//
// Hello3 owns the runways and the hero (it passes their refs); this owns the canvas
// and the engine (useWindowScene). The hero fades on Hello3's own --hero-fade.

import { useMemo, useRef, useState } from "react";
import { parseCaptureParams } from "./capture.js";
import { useWindowScene } from "./useWindowScene.js";
import { landingPosterUrl } from "./landingPoster.js";

export default function WindowSceneFolio({ run1Ref, run2Ref, heroRef }) {
  const hostRef = useRef(null);
  const opts = useMemo(() => parseCaptureParams(typeof window !== "undefined" ? window.location.search : ""), []);
  const reduced = useMemo(
    () => !opts.capture && typeof window !== "undefined" && !!window.matchMedia?.("(prefers-reduced-motion: reduce)").matches,
    [opts]
  );
  // the first frame is the pulled-back room (p 0.5 of the path), the portfolio's top on
  // the monitor; heroRef stays for the calm field, which is off from p 0.3 on
  // the landing poster (landingPoster.js): the opening frame as a still, shown at once;
  // the canvas crossfades over it on ready. No poster (or it fails to load): the page
  // ground and the loader alone
  const posterSrc = useMemo(() => {
    if (opts.capture || typeof window === "undefined") return null;
    const vv = window.visualViewport;
    const dark = document.documentElement.classList.contains("dark");
    return landingPosterUrl({ w: vv ? vv.width : window.innerWidth, h: vv ? vv.height : window.innerHeight, theme: dark ? "dark" : "light", search: window.location.search });
  }, [opts]);
  const [posterOk, setPosterOk] = useState(true);
  useWindowScene({ hostRef, run1Ref, run2Ref, heroRef, opts, reduced, fadeHero: false, pFrom: 0.5, pOver: "height", livePoster: true, endRun: false, sweepDeg: -5, ramp: true });
  // sweepDeg: negative turns the camera LEFT (Agam: "the right screen gets cut off a
  // little and the left screen is slightly more visible"); it eases to 0 at the
  // landing, so the window drifts left as the camera closes in
  // endRun (the pull-back into the monitor at the bottom) is OFF for now (Agam,
  // 2026-09-27: "hide that or comment it out"); set it true with the spacer below
  return (
    <>
      <div className="wscene__host wscene__host--folio" ref={hostRef} aria-hidden="true">
        {posterSrc && posterOk && <img className="wscene__poster" src={posterSrc} alt="" decoding="async" fetchpriority="high" onError={() => setPosterOk(false)} />}
      </div>
      {/* the scroll nudge at the foot of the opening frame (2026-09-27, Agam): minimal,
          Google Sans Code, an arrow; it fades as the runway starts (--wscene-run) */}
      {!reduced && (
        <div className="wscene-nudge" aria-hidden="true">
          {/* until the scene is ready the pill is the loader (html[data-wscene-ready],
              windowScene.css): three pulsing dots, then the scroll label and arrow */}
          <span className="wscene-nudge__loading" role="status">
            loading
            <span className="wscene-nudge__dots"><i /><i /><i /></span>
          </span>
          <span className="wscene-nudge__label">scroll</span>
          {/* Material Symbols (Google) arrow_downward_alt, the short arrow: the drawn
              one read too long (Agam). Path from fonts.gstatic.com's 24px release svg */}
          <svg className="wscene-nudge__arrow" width="20" height="20" viewBox="0 -960 960 960" fill="currentColor">
            <path d="M480-240 240-480l56-56 144 144v-368h80v368l144-144 56 56-240 240Z" />
          </svg>
        </div>
      )}
    </>
  );
}
