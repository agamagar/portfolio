import { useState } from "react";
import { useReducedMotion, useFitScale, useInViewLoop } from "../ds/hooks";
import { PhoneWindow, Shimmer, Caption } from "../ds/Scaffold";
import { Rail } from "./Rail";
import { IBox, IBolt, ICal } from "./icons";
import "./scheduled.css";

// "Then the real work: grinding one page to ground." The shipped single-page
// listing, demonstrated on one shipment: a per-shipment instant/scheduled
// toggle, an INLINE slot picker (never a bottom sheet), the Today/Tomorrow day
// row, and the later continuous cross-day scroll where tonight's 11 meets
// tomorrow's first slot. The rail names each state as the phone performs it.

const STEPS = [
  { t: "Instant vs Scheduled", s: "A clear per-shipment toggle" },
  { t: "Inline slot picker", s: "Not a bottom sheet, never leaves the page" },
  { t: "Today / Tomorrow", s: "The day row we launched with" },
  { t: "One continuous scroll", s: "Tonight's 11 meets tomorrow's first" },
];
const PM = ["5–6 PM", "6–7 PM", "7–8 PM", "8–9 PM", "9–10 PM", "10–11 PM"];
const CAPS = ["", "Switch to scheduled", "Pick a slot, inline", "Today and tomorrow", "One continuous scroll"];

const Collapsed = ({ pill }) => (
  <div className="sd-ship">
    <div className="sd-ship__head">
      <span className="sd-ship__ic"><IBox /></span>
      <span className="sd-ship__meta">
        <Shimmer w="52%" h={7} r={4} />
        <div className="sd-ship__cv"><span className="sd-ava" /><Shimmer w="36%" h={6} r={3} /></div>
      </span>
      <span className="sd-pill">{pill}</span>
    </div>
  </div>
);

export default function SchedSinglePage() {
  const reduce = useReducedMotion();
  const [beat, setBeat] = useState(reduce ? 4 : 0);
  const { fitRef, frameRef } = useFitScale(660, 1.06);

  const loopRef = useInViewLoop(!reduce, async ({ wait, alive }) => {
    while (alive()) {
      setBeat(0); await wait(1100); if (!alive()) break;
      setBeat(1); await wait(1300); if (!alive()) break;
      setBeat(2); await wait(1300); if (!alive()) break;
      setBeat(3); await wait(1400); if (!alive()) break;
      setBeat(4); await wait(2100);
    }
  });

  const open = beat >= 1;
  const scheduled = beat >= 1;
  const slotsShown = beat >= 2;
  const cross = beat >= 4;
  const active = beat - 1;
  const done = new Set([0, 1, 2, 3].filter((i) => i < active));
  const headPill = !scheduled ? "Instant" : cross ? "11–12 AM" : beat >= 3 ? "6–7 PM" : "Set a time";

  return (
    <div className="ds-fit" ref={(n) => { fitRef.current = n; loopRef.current = n; }}>
      <div className="ds-root ds-root--phone" ref={frameRef}>
        <div className="sd-stage sd-stage--rail">
          <PhoneWindow title="Schedule order">
            <div className="sd-summary"><span className="sd-summary__t">3 shipments</span><span className="sd-summary__c">superstore + 2 dark stores</span></div>
            <div className="sd-list">
              <div className="sd-ship" data-tone={scheduled ? "purple" : undefined} data-open={open}>
                <div className="sd-ship__head">
                  <span className="sd-ship__ic"><IBox /></span>
                  <span className="sd-ship__meta">
                    <Shimmer w="60%" h={7} r={4} />
                    <div className="sd-ship__cv"><span className="sd-ava" /><Shimmer w="40%" h={6} r={3} /></div>
                  </span>
                  <span className="sd-pill" data-tone={scheduled ? "purple" : undefined}>{scheduled && <span className="sd-pill__dot" />}{headPill}</span>
                </div>
                <div className="sd-ship__body"><div className="sd-ship__inner"><div className="sd-ship__pad">
                  <div className="sd-toggle">
                    <span className="sd-toggle__opt" data-on={!scheduled}><IBolt /> Instant</span>
                    <span className="sd-toggle__opt" data-on={scheduled} data-sched="true"><ICal /> Scheduled</span>
                  </div>
                  {slotsShown && !cross && (
                    <>
                      <div className="sd-days"><span className="sd-day" data-on="true">Today</span><span className="sd-day">Tomorrow</span></div>
                      <div className="sd-slots">
                        {PM.map((s, i) => (<span className="sd-slot" key={s} data-state={beat >= 3 && i === 1 ? "on" : "off"}>{s}</span>))}
                      </div>
                    </>
                  )}
                  {cross && (
                    <div className="sd-slots">
                      <span className="sd-slot" data-state="off">9–10 PM</span>
                      <span className="sd-slot" data-state="off">10–11 PM</span>
                      <span className="sd-slot" data-state="on">11–12 AM</span>
                      <span className="sd-slot__div">Tomorrow</span>
                      <span className="sd-slot" data-state="off">7–8 AM</span>
                      <span className="sd-slot" data-state="off">8–9 AM</span>
                      <span className="sd-slot" data-state="off">9–10 AM</span>
                    </div>
                  )}
                </div></div></div>
              </div>
              <Collapsed pill="Instant" />
              <Collapsed pill="Instant" />
            </div>
            {beat >= 1 && <Caption mode="purple" label={CAPS[beat]} style={{ left: "50%", bottom: 12, transform: "translateX(-50%)" }} />}
          </PhoneWindow>
          <Rail cap="Design states" steps={STEPS} active={active} done={done} />
        </div>
      </div>
    </div>
  );
}
