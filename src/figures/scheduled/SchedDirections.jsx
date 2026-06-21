import { useState } from "react";
import { useReducedMotion, useFitScale, useInViewLoop } from "../ds/hooks";
import { PhoneWindow, Shimmer } from "../ds/Scaffold";
import { ICheck, IBox, IClock } from "./icons";
import "./scheduled.css";

// "Two directions, and the sentence that decided them." Before/after marquee:
// the killed TABBED flow (a tab per shipment — move to shipment 2 and shipment
// 1's chosen slot is on another tab, out of view) against the shipped
// SINGLE-PAGE listing (every shipment and its slot stay visible at once).

const TABS = ["Shipment 1", "Shipment 2", "Shipment 3"];
const SLOTS = ["5–6 PM", "6–7 PM", "7–8 PM", "8–9 PM", "9–10 PM", "10–11 PM"];

function Tabbed({ tab, lost }) {
  return (
    <>
      <div className="sd-tabs">
        {TABS.map((t, i) => (
          <span className="sd-tabs__t" key={t} data-on={tab === i} data-set={i === 0}>
            {i === 0 ? "Shpmt 1" : i === 1 ? "Shpmt 2" : "Shpmt 3"}
            <span className="sd-tabs__chk"><ICheck /></span>
          </span>
        ))}
      </div>
      <div className="sd-summary"><span className="sd-ship__ic" style={{ width: 22, height: 22 }}><IBox /></span><Shimmer w="56%" h={8} r={4} /></div>
      <div className="sd-slots" style={{ marginTop: 4 }}>
        {SLOTS.map((s, i) => (
          <span className="sd-slot" key={s} data-state={tab === 0 && i === 1 ? "on" : "off"}>{s}</span>
        ))}
      </div>
      {lost && (
        <span className="sd-lost" style={{ top: 150 }}><IClock />Shipment 1's slot, out of view</span>
      )}
    </>
  );
}

function ShipRow({ icon, title, pill, pillTone, open, slots, sel }) {
  return (
    <div className="sd-ship" data-tone={pillTone} data-open={open}>
      <div className="sd-ship__head">
        <span className="sd-ship__ic">{icon}</span>
        <span className="sd-ship__meta">
          <Shimmer w={title} h={7} r={4} />
          <div className="sd-ship__cv"><span className="sd-ava" /><Shimmer w="44%" h={6} r={3} /></div>
        </span>
        <span className="sd-pill" data-tone={pill ? pillTone : undefined}>{pill && <span className="sd-pill__dot" />}{pill || "Choose slot"}</span>
      </div>
      <div className="sd-ship__body"><div className="sd-ship__inner"><div className="sd-ship__pad">
        <div className="sd-slots" style={{ marginTop: 11 }}>
          {slots.map((s, i) => (<span className="sd-slot" key={s} data-state={i === sel ? "on" : "off"}>{s}</span>))}
        </div>
      </div></div></div>
    </div>
  );
}

export default function SchedDirections() {
  const reduce = useReducedMotion();
  const [tab, setTab] = useState(reduce ? 1 : 0);
  const [open2, setOpen2] = useState(reduce);
  const [lost, setLost] = useState(reduce);
  const { fitRef, frameRef } = useFitScale(660, 1.06);

  const loopRef = useInViewLoop(!reduce, async ({ wait, alive }) => {
    while (alive()) {
      setTab(0); setOpen2(false); setLost(false);
      await wait(1400); if (!alive()) break;
      setTab(1); setOpen2(true);
      await wait(500); if (!alive()) break;
      setLost(true);
      await wait(2200);
    }
  });

  return (
    <div className="ds-fit" ref={(n) => { fitRef.current = n; loopRef.current = n; }}>
      <div className="ds-root ds-root--phone" ref={frameRef}>
        <div className="sd-stage sd-stage--compare">
          <div className="sd-compare__col">
            <PhoneWindow title="Schedule order">
              <Tabbed tab={tab} lost={lost} />
            </PhoneWindow>
            <span className="sd-label"><span className="sd-label__tag" data-tone="red">Killed</span> Tabs hide the rest</span>
          </div>

          <div className="sd-compare__col">
            <PhoneWindow title="Schedule order">
              <div className="sd-summary"><span className="sd-summary__t">3 shipments</span><span className="sd-summary__c">all in view</span></div>
              <div className="sd-list">
                <ShipRow icon={<IBox />} title="58%" pill="6–7 PM" pillTone="purple" open={false} slots={SLOTS} sel={1} />
                <ShipRow icon={<IBox />} title="50%" pill={open2 ? "7–8 PM" : ""} pillTone="purple" open={open2} slots={SLOTS} sel={2} />
                <ShipRow icon={<IBox />} title="46%" pill="" pillTone="purple" open={false} slots={SLOTS} sel={-1} />
              </div>
            </PhoneWindow>
            <span className="sd-label"><span className="sd-label__tag" data-tone="green">Shipped</span> Every choice stays visible</span>
          </div>
        </div>
      </div>
    </div>
  );
}
