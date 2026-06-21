import { useState } from "react";
import { useReducedMotion, useFitScale, useInViewLoop } from "../ds/hooks";
import { PhoneWindow, Shimmer, Caption } from "../ds/Scaffold";
import { Rail } from "./Rail";
import { IWarehouse, IStore, IBox } from "./icons";
import "./scheduled.css";

// "The cart conundrum: one order, many hubs." Zepto fulfils from tiered hubs
// (Mother Hub -> superstores + dark stores), and categories are stored
// deliberately, so a mixed cart splits into separate shipments, one per
// fulfilling site, up to four. Scheduling is per shipment, so each one answers
// the slot question on its own and the answers rarely agree: the worst case is
// a four-way split where one is scheduled, one unavailable, one closed.

const STEPS = [
  { t: "Split across hubs", s: "Superstore items and dark-store items travel separately" },
  { t: "Each schedules on its own", s: "A slot is per shipment, not per order" },
  { t: "Worst case: four shipments", s: "Scheduled, unavailable and closed, all at once", tone: "amber" },
];
const CAPS = ["", "Split across hubs", "Each schedules on its own", "Up to four shipments"];
const MODES = ["purple", "purple", "purple", "amber"];

const HUB_ICON = { Superstore: <IStore />, "Dark store": <IBox /> };

const SETS = {
  1: [{ hub: "Superstore", items: "6 items" }, { hub: "Dark store", items: "4 items" }],
  2: [{ hub: "Superstore", pill: "7–8 PM", tone: "purple" }, { hub: "Dark store", pill: "Unavailable", tone: "red" }],
  3: [
    { hub: "Superstore", pill: "7–8 PM", tone: "purple" },
    { hub: "Dark store", pill: "6–7 PM", tone: "purple" },
    { hub: "Dark store", pill: "Unavailable", tone: "red" },
    { hub: "Superstore", pill: "Closed", tone: "amber" },
  ],
};

const ShipCard = ({ hub, items, pill, tone }) => (
  <div className="sd-ship sd-split-enter" data-tone={tone}>
    <div className="sd-ship__head">
      <span className="sd-ship__ic">{HUB_ICON[hub]}</span>
      <span className="sd-ship__meta">
        <span className="sd-ship__hub">{hub}{items ? ` · ${items}` : ""}</span>
        <div className="sd-ship__cv"><span className="sd-ava" /><Shimmer w="46%" h={6} r={3} /></div>
      </span>
      <span className="sd-pill" data-tone={tone}>{tone && <span className="sd-pill__dot" />}{pill || "Schedulable"}</span>
    </div>
  </div>
);

export default function SchedSplit() {
  const reduce = useReducedMotion();
  const [beat, setBeat] = useState(reduce ? 3 : 0);
  const { fitRef, frameRef } = useFitScale(660, 1.06);

  const loopRef = useInViewLoop(!reduce, async ({ wait, alive }) => {
    while (alive()) {
      setBeat(0); await wait(1200); if (!alive()) break;
      setBeat(1); await wait(1500); if (!alive()) break;
      setBeat(2); await wait(1600); if (!alive()) break;
      setBeat(3); await wait(2400);
    }
  });

  const split = beat >= 1;
  const cards = SETS[Math.min(beat, 3)] || [];
  const active = beat - 1;
  const done = new Set([0, 1, 2].filter((i) => i < active));

  return (
    <div className="ds-fit" ref={(n) => { fitRef.current = n; loopRef.current = n; }}>
      <div className="ds-root ds-root--phone" ref={frameRef}>
        <div className="sd-stage sd-stage--rail">
          <PhoneWindow title="Cart">
            <div className="sd-summary"><span className="sd-summary__t">Your cart</span><span className="sd-summary__c">{split ? `${beat === 3 ? 4 : 2} shipments` : "10 items"}</span></div>

            <div className="sd-hub" style={{ opacity: split ? 1 : 0.35 }}>
              <span className="sd-hubchip" data-root="true"><IWarehouse /> Mother Hub</span>
              <span className="sd-hubarrow">→</span>
              <span className="sd-hubsplit">
                <span className="sd-hubchip"><IStore /> Superstore</span>
                <span className="sd-hubchip"><IBox /> Dark store</span>
              </span>
            </div>

            {!split ? (
              <div className="sd-ship">
                <div className="sd-itemrow sd-summary" style={{ margin: 0, padding: "9px 11px" }}><span className="sd-summary__t" style={{ fontSize: 11 }}>One delivery, for now</span></div>
                {[0, 1, 2, 3].map((i) => (
                  <div className="sd-itemrow" key={i}><span className="sd-ava" /><Shimmer w={["62%", "48%", "55%", "44%"][i]} h={7} r={4} /></div>
                ))}
              </div>
            ) : (
              <div className="sd-list" key={beat}>
                {cards.map((c, i) => (<ShipCard key={i} {...c} />))}
              </div>
            )}

            {beat >= 1 && <Caption mode={MODES[beat]} label={CAPS[beat]} style={{ left: "50%", bottom: 12, transform: "translateX(-50%)" }} />}
          </PhoneWindow>
          <Rail cap="The cart conundrum" steps={STEPS} active={active} done={done} />
        </div>
      </div>
    </div>
  );
}
