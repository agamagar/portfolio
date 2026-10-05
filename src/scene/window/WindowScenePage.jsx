// /window: the window scene sandbox (unlisted, like /dj).
//
// A fixed full-viewport canvas under a scroll runway (R = 1 viewport) that drives
// the camera from the window to the monitor (p). At p = 1 the screen's light has
// become exactly the page ground, the canvas hides and the render loop stops
// (setAnimationLoop(null)); a stand-in page scrolls. At the bottom a second runway
// drives the bookend (p2): out of the screen, back into the room at that hour.
//
// The loop runs only while a runway is on screen (IntersectionObserver on the
// runway elements, never on the fixed canvas), pauses with the tab, and under
// prefers-reduced-motion there is no runway: the p = 0 frame is drawn once as a
// still (and the closing shot once at the bottom), then a plain cut.
//
// The hero's text stand-ins: two outlined boxes where the folio page's greeting
// and timeline sit (12-folio-page-scroll 2), in the runway's sticky stage, fading
// out over the first stretch of the runway as the hero text will. Their live rects
// go to engine.setCalmBoxes, so the calm field (calm.js) follows the page's layout
// at any viewport: the integration does the same with the real elements.
//
// URL parameters: see capture.js (the capture contract). ?gui=1 opens the panel.

import { useMemo, useRef } from "react";
import { parseCaptureParams } from "./capture.js";
import { useWindowScene } from "./useWindowScene.js";
import "./windowScene.css";

export default function WindowScenePage() {
  const hostRef = useRef(null);
  const run1Ref = useRef(null);
  const run2Ref = useRef(null);
  const heroRef = useRef(null);
  const opts = useMemo(() => parseCaptureParams(typeof window !== "undefined" ? window.location.search : ""), []);
  const reduced = useMemo(
    () => !opts.capture && typeof window !== "undefined" && !!window.matchMedia?.("(prefers-reduced-motion: reduce)").matches,
    [opts]
  );

  useWindowScene({ hostRef, run1Ref, run2Ref, heroRef, opts, reduced });

  return (
    <div className={"wscene" + (reduced ? " wscene--still" : "")}>
      <div className="wscene__host" ref={hostRef} />
      <section className="wscene__runway" ref={run1Ref} aria-label="Window scene">
        <div className="wscene__stage">
          <div className="wscene__hero" ref={heroRef} aria-hidden="true">
            <div className="wscene__standin wscene__standin--greeting" data-calm>
              <span>greeting</span>
            </div>
            <div className="wscene__standin wscene__standin--timeline" data-calm>
              <span>timeline</span>
            </div>
          </div>
        </div>
      </section>
      <main className="wscene__page">
        <p className="wscene__note">Stand-in page after the hand-off</p>
        <div className="wscene__grid">
          <div className="wscene__block" />
          <div className="wscene__block" />
          <div className="wscene__block" />
          <div className="wscene__block" />
        </div>
        <div className="wscene__block wscene__block--wide" />
        <div className="wscene__block wscene__block--foot" />
      </main>
      <section className="wscene__runway wscene__runway--bookend" ref={run2Ref} aria-label="Closing shot">
        <div className="wscene__stage" />
      </section>
    </div>
  );
}
