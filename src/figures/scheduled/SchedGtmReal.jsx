import { useEffect, useRef } from "react";
import { useFitScale } from "../ds/hooks";
import LayerMap from "../ds/LayerMap";
import schedulePageLayers from "./schedulePageLayers";
import PhoneFrame from "../ds/IphoneFrame";
import PhoneControls from "../../ui/PhoneControls";
import "./scheduled.css";

// Design Mode: the EXACT schedule-page screen, plated pixel-for-pixel from the
// Figma frame (Schedule Order Handoff 8450:71730, exported 360x780 @3x), with the
// real GTM animation video composited into the banner region.

// mtmm2p84: `single` = one phone, no frame chrome, for the plate under the
// parallax in the "in motion" section; the outer plate is the container.
// mvfbhuoa (Agam): on the plain plate (no scrim) the phone's UI scrolls: the page starts scrolled down (the banner under the
// header), eases up so the banner animation moves into focus, holds there while it plays, then eases back and loops.
// The status bar + header stay put (the pan layer is clipped below them); the pan is driven off the video's own clock, so it
// loops with the animation, pauses with the phone control bar, sleeps off-screen and stays still under reduced motion.
const SCROLL_PCT = 18;   // how far the page is scrolled down at rest, % of the screen height
const SCROLL_IN = 0.14, SCROLL_OUT = 0.84; // fractions of the video's loop
const ease = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
function useBannerScroll(on) {
  const root = useRef(null), pan = useRef(null), vid = useRef(null);
  useEffect(() => {
    if (!on || !root.current || !pan.current || !vid.current) return undefined;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) { pan.current.style.transform = "translateY(0)"; return undefined; }
    let raf = 0, visible = false;
    const set = (k) => { pan.current.style.transform = `translateY(${(-SCROLL_PCT * k).toFixed(3)}%)`; };
    const tick = () => {
      raf = 0; if (!visible) return;
      const v = vid.current, d = v.duration;
      if (d && isFinite(d)) {
        const p = (v.currentTime % d) / d;
        const k = p < SCROLL_IN ? 1 - ease(p / SCROLL_IN) : p < SCROLL_OUT ? 0 : ease((p - SCROLL_OUT) / (1 - SCROLL_OUT));
        set(k);
      }
      raf = requestAnimationFrame(tick);
    };
    set(1);
    // mvfwgfv5 (Agam, "auto play this timed with scroll"): the video plays when the phone scrolls into view, from its start, and
    // rests when it leaves (a pause chosen on the control bar is respected); it no longer plays unseen off-screen
    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting && e.intersectionRatio >= 0.4;
      const v = vid.current;
      if (visible) { if (v.dataset.ppUser !== "1") { v.currentTime = 0; v.play()?.catch?.(() => {}); } if (!raf) raf = requestAnimationFrame(tick); }
      else if (v.dataset.ppUser !== "1") v.pause();
    }, { threshold: [0, 0.4, 0.7] });
    io.observe(root.current);
    return () => { io.disconnect(); if (raf) cancelAnimationFrame(raf); };
  }, [on]);
  return { root, pan, vid };
}

export function SchedGtmRealOne({ dim = false }) {
  const motion = !dim;
  const { root, pan, vid } = useBannerScroll(motion);
  // mtmovxez: the same real bezel as the prototype plate; the screen plate
  // sits in the cutout, the bezel rides on top
  const IMG = "/figures/scheduled/schedule-page-ui.png";
  const ALT = "The Zepto schedule page: header, the promo banner, the instant-versus-scheduled toggle, and the slot grid.";
  const video = <video ref={motion ? vid : undefined} className="gtmr-video" src="/figures/scheduled/gtm-animation.mp4" autoPlay={!motion} muted loop playsInline preload="auto" />; // motion: started by useBannerScroll when scrolled into view
  return (
    <div className="gtmr-one">
      <PhoneFrame className="gtmr-one__phone" interactive={false} enter={false}>
          <div className="gtmr-device gtmr-device--bare" ref={root}>
            <img className="gtmr-plate" src={IMG} alt={ALT} />
            {/* mvf9oumy (Agam): a black overlay, like the plate on the right, so only the video is fully visible */}
            {dim && <span className="gtmr-scrim" aria-hidden />}
            {motion ? (
              <div className="gtmr-scroll" aria-hidden>
                <div className="gtmr-pan" ref={pan}>
                  <img className="gtmr-plate" src={IMG} alt="" draggable="false" />
                  <div className="gtmr-region">{video}</div>
                </div>
              </div>
            ) : (
              <div className="gtmr-region">{video}</div>
            )}
            <PhoneControls label="Schedule page" />
          </div>
      </PhoneFrame>
    </div>
  );
}

// mvfbhuoa: the plate in "The go-to-market" keeps the black scrim (dim); the one under Context and objective has none
export const SchedGtmRealOneDim = () => <SchedGtmRealOne dim />;

// mv56yxug (12 Oct, "we don't need to show the whole thing, just the animation in its full view"):
// the go-to-market plate shows the banner animation ALONE, at the plate's width
// and its own 1080 x 340 ratio, instead of a cropped phone with the animation
// small at its top. Same video, same speed (no playbackRate anywhere on it).
export function SchedGtmBanner() {
  return (
    <div className="gtmr-banner" style={{ width: "88%", justifySelf: "center" }}>
      <video className="gtmr-banner__video" style={{ width: "100%", borderRadius: 16 }} src="/figures/scheduled/gtm-animation.mp4" autoPlay muted loop playsInline aria-label="The go-to-market banner animation: a sweeping clock and slot chips popping in." />
    </div>
  );
}

// muky18to / muky9xug (28 Sep): the CART screen from the pair, alone in the
// same bezel as SchedGtmRealOne, for the second go-to-market box
export function SchedGtmCartOne() {
  return (
    <div className="gtmr-one">
      <PhoneFrame className="gtmr-one__phone" interactive={false} enter={false}>
          <div className="gtmr-device gtmr-device--bare">
            <img className="gtmr-plate" src="/figures/scheduled/gtm-first-plate.png" alt="The Zepto cart: Special Offers, the Introducing scheduled delivery banner, and the Schedule for later prompt above the items." />
            <PhoneControls label="Cart page" />
          </div>
      </PhoneFrame>
    </div>
  );
}

// Figma "Tooltip Option 71" (2:4306): the cart with the Scheduled order tooltip on the Schedule button
export function SchedGtmTooltipOne() {
  return (
    <div className="gtmr-one">
      <PhoneFrame className="gtmr-one__phone" interactive={false} enter={false}>
          <div className="gtmr-device gtmr-device--bare">
            <img className="gtmr-plate" src="/figures/scheduled/gtm-tooltip-plate.webp" alt="The Zepto cart with a Scheduled order tooltip on the Schedule button: Plan your deliveries, Choose a time slot." />
            <PhoneControls label="Cart tooltip" />
          </div>
      </PhoneFrame>
    </div>
  );
}

export default function SchedGtmReal() {
  const { fitRef, frameRef } = useFitScale(790, 1.0);
  return (
    <div className="ds-fit" ref={fitRef}>
      <div className="ds-root ds-root--phone sd-root--gtmr" ref={frameRef}>{/* 790 wide via .sd-root--gtmr so the phone stylesheet can re-author it */}
        <div className="sd-stage sd-stage--gtmr">
          {/* mtmrp7er: the first phone is the cart page (Schedule Order Handoff
              8205-78448) with the "Introducing scheduled delivery" banner in place */}
          <div className="gtmr-device ibz">
            <img className="gtmr-plate" src="/figures/scheduled/gtm-first-plate.png" alt="The Zepto cart: Special Offers, the Introducing scheduled delivery banner, and the Schedule for later prompt above the items." />
            <PhoneControls label="Cart page" />
          </div>
          <div className="gtmr-device ibz">
            <img className="gtmr-plate" src="/figures/scheduled/schedule-page-ui.png" alt="The Zepto schedule page: header, the promo banner, the instant-versus-scheduled toggle, and the slot grid." />
            <div className="gtmr-region">
              <video className="gtmr-video" src="/figures/scheduled/gtm-animation.mp4" autoPlay muted loop playsInline />
            </div>
            <LayerMap layers={schedulePageLayers} label="Schedule page layers" />
            <PhoneControls label="Schedule page" />
          </div>
        </div>
      </div>
    </div>
  );
}
