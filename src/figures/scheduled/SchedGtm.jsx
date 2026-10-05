import { useFitScale } from "../ds/hooks";
import { PhoneWindow, Shimmer } from "../ds/Scaffold";
import { IBolt, ICal } from "./icons";
import GtmMotion from "./GtmMotion";
import "./scheduled.css";

// The go-to-market promo that animates at the top of the schedule page. The real
// banner (Schedule Order Handoff, node 8450:72119 "Schedule Delivery Animation 2")
// is an empty container hosting a Lottie/video, so this is a coded stand-in
// motion (the shared GtmMotion). The same motion is composited onto the real
// screen plate in SchedGtmReal (Design Mode).

export default function SchedGtm() {
  const { fitRef, frameRef } = useFitScale(660, 1.06);
  return (
    <div className="ds-fit" ref={fitRef}>
      <div className="ds-root ds-root--phone" ref={frameRef}>
        <div className="sd-stage sd-stage--gtm">
          <PhoneWindow title="Schedule your order">
            <div className="gtm-banner"><GtmMotion /></div>

            <div className="gtm-below">
              <div className="gtm-toggle">
                <span className="gtm-toggle__opt">
                  <span className="gtm-toggle__ic" style={{ background: "#16a34a" }}><IBolt /></span>
                  <span className="gtm-toggle__txt"><Shimmer w="64%" h={7} r={4} /><Shimmer w="40%" h={6} r={3} /></span>
                </span>
                <span className="gtm-toggle__opt" data-sched="true">
                  <span className="gtm-toggle__ic" style={{ background: "#f2820a" }}><ICal /></span>
                  <span className="gtm-toggle__txt"><Shimmer w="68%" h={7} r={4} /><Shimmer w="44%" h={6} r={3} /></span>
                </span>
              </div>
              <div className="gtm-slotrow">
                {[0, 1, 2, 3, 4, 5].map((i) => (<span className="gtm-slot" key={i} />))}
              </div>
            </div>
          </PhoneWindow>
        </div>
      </div>
    </div>
  );
}
