import { useFitScale } from "../ds/hooks";
import LayerMap from "../ds/LayerMap";
import schedulePageLayers from "./schedulePageLayers";
import "./scheduled.css";

// Design Mode: the EXACT schedule-page screen, plated pixel-for-pixel from the
// Figma frame (Schedule Order Handoff 8450:71730, exported 360x780 @3x), with the
// real GTM animation video composited into the banner region.

// mtmm2p84: `single` = one phone, no frame chrome, for the plate under the
// parallax in the "in motion" section; the outer plate is the container.
export function SchedGtmRealOne() {
  // mtmovxez: the same real bezel as the prototype plate; the screen plate
  // sits in the cutout, the bezel rides on top
  return (
    <div className="gtmr-one">
      <div className="article__plate-phone gtmr-one__phone">
        <div className="article__plate-screen">
          <div className="gtmr-device gtmr-device--bare">
            <img className="gtmr-plate" src="/figures/scheduled/schedule-page-ui.png" alt="The Zepto schedule page: header, the promo banner, the instant-versus-scheduled toggle, and the slot grid." />
            <div className="gtmr-region">
              <video className="gtmr-video" src="/figures/scheduled/gtm-animation.mp4" autoPlay muted loop playsInline />
            </div>
          </div>
        </div>
        <img className="article__plate-bezel" src="/figures/frames/iphone-17-pro.png" alt="" draggable="false" />
      </div>
    </div>
  );
}

// muky18to / muky9xug (28 Sep): the CART screen from the pair, alone in the
// same bezel as SchedGtmRealOne, for the second go-to-market box
export function SchedGtmCartOne() {
  return (
    <div className="gtmr-one">
      <div className="article__plate-phone gtmr-one__phone">
        <div className="article__plate-screen">
          <div className="gtmr-device gtmr-device--bare">
            <img className="gtmr-plate" src="/figures/scheduled/gtm-first-plate.png" alt="The Zepto cart: Special Offers, the Introducing scheduled delivery banner, and the Schedule for later prompt above the items." />
          </div>
        </div>
        <img className="article__plate-bezel" src="/figures/frames/iphone-17-pro.png" alt="" draggable="false" />
      </div>
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
          </div>
          <div className="gtmr-device ibz">
            <img className="gtmr-plate" src="/figures/scheduled/schedule-page-ui.png" alt="The Zepto schedule page: header, the promo banner, the instant-versus-scheduled toggle, and the slot grid." />
            <div className="gtmr-region">
              <video className="gtmr-video" src="/figures/scheduled/gtm-animation.mp4" autoPlay muted loop playsInline />
            </div>
            <LayerMap layers={schedulePageLayers} label="Schedule page layers" />
          </div>
        </div>
      </div>
    </div>
  );
}
