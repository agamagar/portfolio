import { useState } from "react";
import { useReducedMotion, useFitScale, useInViewLoop } from "../ds/hooks";
import "./scheduled.css";

// Design Mode: the per-shipment CART STATE MATRIX as a contact sheet of real
// Zepto cart screens (Schedule Order Handoff). Each tile is a distinct state the
// Instant/Schedule control resolves into, read roughly as a spectrum from "both
// paths open" through degrading availability to "scheduled, committed".
// Frames verified + pulled via the Figma REST API.

const TILES = [
  { src: "sched-cart-both.png", cap: "Instant + Schedule" },
  { src: "sched-cart-prompted.png", cap: "Schedule prompted" },
  { src: "sched-cart-only.png", cap: "Schedule only" },
  { src: "sched-cart-disabled.png", cap: "Schedule disabled, no slots" },
  { src: "sched-cart-store-out.png", cap: "Store unserviceable" },
  { src: "sched-cart-items-out.png", cap: "Items unavailable" },
  { src: "sched-cart-confirmed.png", cap: "Delivery scheduled" },
  { src: "sched-cart-edit.png", cap: "Scheduled, edit slot" },
];

export default function SchedCartStates() {
  const reduce = useReducedMotion();
  const [shown, setShown] = useState(reduce ? TILES.length : 0);
  const [active, setActive] = useState(-1);
  const { fitRef, frameRef } = useFitScale(660, 1.06);

  const loopRef = useInViewLoop(!reduce, async ({ wait, alive }) => {
    while (alive()) {
      setShown(0); setActive(-1);
      await wait(240); if (!alive()) break;
      for (let i = 0; i < TILES.length; i++) { setShown(i + 1); await wait(150); if (!alive()) return; }
      await wait(650); if (!alive()) break;
      for (let i = 0; i < TILES.length; i++) { setActive(i); await wait(600); if (!alive()) return; }
      setActive(-1);
      await wait(900); if (!alive()) break;
    }
  });

  return (
    <div className="ds-fit" ref={(n) => { fitRef.current = n; loopRef.current = n; }}>
      <div className="ds-root ds-root--phone" ref={frameRef}>
        <div className="sd-stage sd-stage--gallery">
          <div className="sdg-grid">
            {TILES.map((t, i) => (
              <div className="sdg-tile" key={t.src} data-on={i < shown ? "true" : "false"} data-active={i === active ? "true" : "false"}>
                <div className="sdg-screen"><img src={`/figures/scheduled/${t.src}`} alt={t.cap} draggable={false} /></div>
                <div className="sdg-cap">{t.cap}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
