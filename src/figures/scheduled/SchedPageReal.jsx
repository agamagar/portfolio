import { useState } from "react";
import { useReducedMotion, useFitScale, useInViewLoop } from "../ds/hooks";
import Cursor from "../ds/Cursor";
import "./scheduled.css";

// "One scroll across midnight" — the real Schedule states inside the real device
// frame (Schedule Order Handoff, section 40000019:69582), driven by the glass
// pointer. Reads the artboard names for the states:
//   beat 0 — "Today: all slots"    (Late Night / OCT 25, 3-4 AM selected)
//   beat 1 — "Tomorrow: more slots" (tap the Tomorrow tab; same windows now
//            read as Early Morning at the head of the new day, 3-4 AM still set)
//   beat 2 — "Tomorrow: all slots"  (tap "more slots" -> Morning/Afternoon/Evening)
// The pointer travels into each control, grows, then taps; the screen reacts.

const SCREENS = [
  { key: "today", src: "/figures/scheduled/sched-today-all.png", alt: "Today: all slots, Evening, Night and the Late Night (OCT 25) group with 3 to 4 AM selected." },
  { key: "tmrMore", src: "/figures/scheduled/sched-tomorrow-more.png", alt: "Tomorrow: collapsed, Early Morning with 3 to 4 AM still selected and a more-slots control." },
  { key: "tmrAll", src: "/figures/scheduled/sched-tomorrow-all.png", alt: "Tomorrow: all slots, Early Morning, Morning, Afternoon and Evening." },
];

// Tap targets in the screen-viewport space (~232 x 504 px at the 280px device).
const TAB_TMR = { x: 162, y: 174 };   // the "Tomorrow" tab
const MORE = { x: 117, y: 424 };      // the "more slots" control

const NOTES = [
  { t: "Today, all slots", s: "Late Night sits at the tail of today, badged for the next date. 3 to 4 AM picked" },
  { t: "Tap Tomorrow", s: "The same six windows lead the new day, relabelled Early Morning" },
  { t: "More slots", s: "The full day opens up: Morning, Afternoon, Evening" },
];

export default function SchedPageReal() {
  const reduce = useReducedMotion();
  const [beat, setBeat] = useState(reduce ? 2 : 0);
  const [touch, setTouch] = useState({ x: TAB_TMR.x, y: TAB_TMR.y + 70, visible: false, hover: false, press: false, n: 0 });

  const { fitRef, frameRef } = useFitScale(660, 1.06);

  const loopRef = useInViewLoop(!reduce, async ({ wait, alive }) => {
    const tapTo = async (target, onPress) => {
      setTouch((t) => ({ ...t, x: target.x, y: target.y + 70, visible: true, hover: false, press: false }));
      await wait(220); if (!alive()) return false;
      setTouch((t) => ({ ...t, x: target.x, y: target.y }));   // glide to target (move token)
      await wait(560); if (!alive()) return false;
      setTouch((t) => ({ ...t, hover: true }));                 // grow (expand token)
      await wait(420); if (!alive()) return false;
      setTouch((t) => ({ ...t, press: true, n: t.n + 1 }));
      await wait(200); if (!alive()) return false;
      onPress();
      setTouch((t) => ({ ...t, press: false }));
      await wait(360); if (!alive()) return false;
      setTouch((t) => ({ ...t, visible: false, hover: false }));
      return true;
    };

    while (alive()) {
      setBeat(0);
      setTouch({ x: TAB_TMR.x, y: TAB_TMR.y + 70, visible: false, hover: false, press: false, n: 0 });
      await wait(1800); if (!alive()) break;

      // tap the Tomorrow tab -> Tomorrow: more slots (the relabel)
      if (!(await tapTo(TAB_TMR, () => setBeat(1)))) break;
      await wait(900); if (!alive()) break;

      // tap "more slots" -> Tomorrow: all slots
      if (!(await tapTo(MORE, () => setBeat(2)))) break;
      await wait(1900); if (!alive()) break;
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
            <div className="sd-rail__cap">One scroll across midnight</div>
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
