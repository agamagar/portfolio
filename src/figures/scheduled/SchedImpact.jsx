import { useState } from "react";
import { useReducedMotion, useFitScale, useInViewLoop } from "../ds/hooks";
import { PhoneWindow, Shimmer, Caption, CountUp } from "../ds/Scaffold";
import { ICheck, ICal } from "./icons";
import "./scheduled.css";

// "Impact." The behavioural shift is the story: because the order is for later,
// people plan and build a bigger, more deliberate cart. Figures updated to the
// verified warehouse pull of 23 Sep 2026: August 2026 average order value was
// \u20b91,452 for a scheduled order against \u20b9543 for an instant one; adoption
// peaked at 1.72% of all orders in May 2026 and has settled near 1.4%; and
// predictable timing let operations batch scheduled with live orders, cutting
// last-mile cost. The phone holds a confirmed scheduled order; the rail counts up.

export default function SchedImpact() {
  const reduce = useReducedMotion();
  const [beat, setBeat] = useState(reduce ? 3 : 0);
  const [aov, setAov] = useState(reduce ? 1452 : 543);
  const { fitRef, frameRef } = useFitScale(660, 1.06);

  const loopRef = useInViewLoop(!reduce, async ({ wait, alive }) => {
    while (alive()) {
      setBeat(0); setAov(543); await wait(900); if (!alive()) break;
      setBeat(1); setAov(1452); await wait(1500); if (!alive()) break;
      setBeat(2); await wait(1100); if (!alive()) break;
      setBeat(3); await wait(2400);
    }
  });

  return (
    <div className="ds-fit" ref={(n) => { fitRef.current = n; loopRef.current = n; }}>
      <div className="ds-root ds-root--phone" ref={frameRef}>
        <div className="sd-stage sd-stage--rail">
          <PhoneWindow title="Order placed">
            <div className="sd-confirm">
              <span className="sd-confirm__badge"><ICheck /></span>
              <Shimmer w="58%" h={9} r={5} />
              <span className="sd-confirm__slot"><ICal /> Scheduled for 6–7 PM</span>
              <div className="sd-confirm__rows">
                <div className="sd-confirm__row"><span className="sd-ava" style={{ width: 26, height: 26, borderRadius: 8 }} /><span style={{ flex: 1, display: "flex", flexDirection: "column", gap: 6 }}><Shimmer w="62%" h={7} r={4} /><Shimmer w="40%" h={6} r={3} /></span></div>
                <div className="sd-confirm__row"><span className="sd-ava" style={{ width: 26, height: 26, borderRadius: 8 }} /><span style={{ flex: 1, display: "flex", flexDirection: "column", gap: 6 }}><Shimmer w="54%" h={7} r={4} /><Shimmer w="34%" h={6} r={3} /></span></div>
                <div className="sd-confirm__row"><span className="sd-ava" style={{ width: 26, height: 26, borderRadius: 8 }} /><span style={{ flex: 1, display: "flex", flexDirection: "column", gap: 6 }}><Shimmer w="48%" h={7} r={4} /><Shimmer w="30%" h={6} r={3} /></span></div>
              </div>
            </div>
            {beat >= 1 && <Caption mode="purple" label="Nearly 3x the order value" style={{ left: "50%", bottom: 12, transform: "translateX(-50%)" }} />}
          </PhoneWindow>

          <div className="sd-rail">
            <div className="sd-rail__cap">What changed</div>
            <div className="sd-metric" data-on={beat >= 1} style={{ "--sd-w": "100%" }}>
              <span className="sd-metric__l">Average order value, scheduled</span>
              <span className="sd-metric__row"><span className="sd-metric__from">₹543</span><span className="sd-metric__arrow">→</span><span className="sd-metric__big">₹<CountUp value={aov} /></span></span>
              <span className="sd-metric__bar"><span className="sd-metric__fill" /></span>
            </div>
            <div className="sd-metric" data-on={beat >= 2}>
              <span className="sd-metric__l">Adoption, share of all orders</span>
              <span className="sd-metric__row"><span className="sd-metric__big" style={{ fontSize: 22 }}>1.72%</span><span className="sd-metric__unit">peak, May 2026; settled near 1.4%</span></span>
            </div>
            <div className="sd-metric" data-on={beat >= 3}>
              <span className="sd-metric__l">Last-mile cost</span>
              <span className="sd-metric__row"><span className="sd-metric__big" style={{ fontSize: 22 }}>Lower</span><span className="sd-metric__unit">predictable times batch scheduled with live orders</span></span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
