import { useState } from "react";
import { useReducedMotion, useFitScale, useInViewLoop } from "../ds/hooks";
import Cursor from "../ds/Cursor";
import "./scheduled.css";

// Design Mode: the real Today <-> Tomorrow date switch (Schedule Order Handoff,
// section 40000019:69582). Today is PARTIAL — earlier windows have passed, 11
// slots left; Tomorrow opens a FULL day, 19 slots. The glass pointer taps
// between the two day tabs and the real screen swaps. Reuses the slot-real
// device (a 232 x 504 rounded screen, no bezel).

const SCREENS = [
  { key: "today", src: "/figures/scheduled/sched-today-all.png", alt: "Today: 11 slots, Evening, Night and Late Night (OCT 25), with 3 to 4 AM selected." },
  { key: "tmr", src: "/figures/scheduled/sched-tomorrow-all.png", alt: "Tomorrow: 19 slots, a full day from Early Morning through Evening." },
];

// day-tab targets in the screen-viewport space (~232 x 504)
const TAB_TODAY = { x: 68, y: 174 };
const TAB_TMR = { x: 162, y: 174 };

const NOTES = [
  { t: "Today is partial", s: "Earlier windows have passed, 11 slots left" },
  { t: "Tomorrow opens fully", s: "A full day ahead, 19 slots" },
];

export default function SchedDateSwitch() {
  const reduce = useReducedMotion();
  const [beat, setBeat] = useState(reduce ? 1 : 0);
  const [touch, setTouch] = useState({ x: TAB_TMR.x, y: TAB_TMR.y - 60, visible: false, hover: false, press: false, n: 0 });

  const { fitRef, frameRef } = useFitScale(660, 1.06);

  const loopRef = useInViewLoop(!reduce, async ({ wait, alive }) => {
    const tapTo = async (target, onPress) => {
      setTouch((t) => ({ ...t, x: target.x, y: target.y - 60, visible: true, hover: false, press: false }));
      await wait(220); if (!alive()) return false;
      setTouch((t) => ({ ...t, x: target.x, y: target.y }));   // glide to the tab (move token)
      await wait(540); if (!alive()) return false;
      setTouch((t) => ({ ...t, hover: true }));                 // grow (expand token)
      await wait(400); if (!alive()) return false;
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
      setTouch({ x: TAB_TMR.x, y: TAB_TMR.y - 60, visible: false, hover: false, press: false, n: 0 });
      await wait(1600); if (!alive()) break;

      if (!(await tapTo(TAB_TMR, () => setBeat(1)))) break;     // -> Tomorrow (full day)
      await wait(1600); if (!alive()) break;

      if (!(await tapTo(TAB_TODAY, () => setBeat(0)))) break;   // -> back to Today (partial)
      await wait(1400); if (!alive()) break;
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
            <div className="sd-rail__cap">The day switch</div>
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
