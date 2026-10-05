import { useFitScale } from "../ds/hooks";
import "./scheduled.css";

// Design Mode: the real R&R "Review Items" screen — items to return, refund
// method (Zepto Cash instant vs source 3-5 days), and pickup booked on the
// same 1-hr slot picker as scheduled delivery. Exported from Figma node
// 9498:64540, Schedule Order Handoff.

export default function SchedRnR() {
  const { fitRef, frameRef } = useFitScale(660, 1.06);
  return (
    <div className="ds-fit" ref={fitRef}>
      <div className="ds-root ds-root--phone" ref={frameRef}>
        <div className="sd-stage sd-stage--rnr">
          <div className="rnr-device">
            <img
              className="rnr-plate"
              src="/figures/scheduled/rnr-screen-1.png"
              alt="The Returns and Refunds Review Items screen: item selection with live refund total, instant Zepto Cash versus source-account refund method, and pickup booked on the same one-hour slot picker as scheduled delivery."
            />
          </div>
        </div>
      </div>
    </div>
  );
}
