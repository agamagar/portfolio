import { useState } from "react";
import { useReducedMotion, useFitScale, useInViewLoop } from "../ds/hooks";
import Cursor from "../ds/Cursor";
import "./scheduled.css";

// Design Mode: after you book — the scheduled order's real post-booking life
// (Schedule Order Handoff, page "M1 Dev Ready"):
//   beat 0 — "Scheduled for Aug 20, 7-8 AM" pinned atop My Orders (9387:420358)
//   beat 1 — tap the order -> Cancel Order surfaces (9387:420931); editable and
//            cancellable up to 30 min before the slot
//   beat 2 — mirrored on home as a live ongoing-order strip (9387:421130)
// The glass pointer drives the one real interaction (the cancel reveal); the
// home surface is a crossfade.

const SCREENS = [
  { key: "orders", src: "/figures/scheduled/sched-order-scheduled.png", alt: "My Orders with a Scheduled for Aug 20, 7-8 AM card pinned at the top." },
  { key: "cancel", src: "/figures/scheduled/sched-order-cancel.png", alt: "The scheduled order expanded with a Cancel Order option." },
  { key: "home", src: "/figures/scheduled/sched-home-strip.png", alt: "The home page with a live ongoing-order strip at the foot." },
];

const CARD = { x: 116, y: 130 };   // the scheduled-order card, screen-viewport space

const NOTES = [
  { t: "Scheduled for", s: "Your booked window, pinned atop My Orders" },
  { t: "Edit or cancel", s: "Manage it up to 30 minutes before the slot" },
  { t: "Live on home", s: "An ongoing-order strip while it's active" },
];

export default function SchedPostBooking() {
  const reduce = useReducedMotion();
  const [beat, setBeat] = useState(reduce ? 2 : 0);
  const [touch, setTouch] = useState({ x: CARD.x, y: CARD.y + 70, visible: false, hover: false, press: false, n: 0 });

  const { fitRef, frameRef } = useFitScale(660, 1.06);

  const loopRef = useInViewLoop(!reduce, async ({ wait, alive }) => {
    while (alive()) {
      setBeat(0);
      setTouch({ x: CARD.x, y: CARD.y + 70, visible: false, hover: false, press: false, n: 0 });
      await wait(1700); if (!alive()) break;

      // tap the scheduled-order card -> Cancel Order surfaces
      setTouch((t) => ({ ...t, visible: true, hover: false, press: false }));
      await wait(220); if (!alive()) break;
      setTouch((t) => ({ ...t, x: CARD.x, y: CARD.y }));
      await wait(540); if (!alive()) break;
      setTouch((t) => ({ ...t, hover: true }));
      await wait(400); if (!alive()) break;
      setTouch((t) => ({ ...t, press: true, n: t.n + 1 }));
      await wait(200); if (!alive()) break;
      setBeat(1);
      setTouch((t) => ({ ...t, press: false }));
      await wait(360); if (!alive()) break;
      setTouch((t) => ({ ...t, visible: false, hover: false }));
      await wait(1700); if (!alive()) break;

      // mirrored on home (crossfade)
      setBeat(2);
      await wait(2000); if (!alive()) break;
    }
  });

  return (
    <div className="ds-fit" ref={(n) => { fitRef.current = n; loopRef.current = n; }}>
      <div className="ds-root ds-root--phone" ref={frameRef}>
        <div className="sd-stage sd-stage--rail sd-stage--slotreal">
          <div className="slotreal-device">
            <div className="slotreal-screen">
              {SCREENS.map((s, i) => (
                <img key={s.key} className="slotreal-img" src={s.src} alt={s.alt} draggable={false} data-on={beat === i} />
              ))}
              <Cursor x={touch.x} y={touch.y} visible={touch.visible} hover={touch.hover} press={touch.press} clickN={touch.n} size={24} />
            </div>
          </div>

          <div className="sd-rail">
            <div className="sd-rail__cap">After you book</div>
            {NOTES.map((nt, i) => (
              <div className="sd-step" key={nt.t} data-on="true" data-active={i === beat} data-tone="purple">
                <span className="sd-step__dot"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5" /></svg></span>
                <span className="sd-step__txt"><span className="sd-step__t">{nt.t}</span><span className="sd-step__s">{nt.s}</span></span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
