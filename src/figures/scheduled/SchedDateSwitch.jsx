import { useRef, useState } from "react";
import { useReducedMotion, useFitScale, useInViewLoop, centerInFrame } from "../ds/hooks";
import { PhoneWindow } from "../ds/Scaffold";
import Cursor from "../ds/Cursor";
import "./scheduled.css";

// The Today <-> Tomorrow date micro-interaction, rebuilt to the real component
// (Schedule Order Handoff, node 9498:77607 "Schedule for Later" -> PICK A TIME
// SLOT). The point of the interaction: today is PARTIAL (earlier slots like
// 6-7 PM have passed), tomorrow opens a FULL day (16 slots vs 12). Switching
// days smart-animates the slot list. A demo cursor taps between the two days.

const ic = { fill: "none", stroke: "currentColor", strokeWidth: 2, strokeLinecap: "round", strokeLinejoin: "round" };
const ICal = () => (<svg viewBox="0 0 24 24" {...ic} aria-hidden><rect x="3.5" y="5" width="17" height="15.5" rx="2.5" /><path d="M3.5 9.5h17M8 3v4M16 3v4" /></svg>);
const ISunset = () => (<svg viewBox="0 0 24 24" {...ic} aria-hidden><path d="M12 4v5M5 12a7 7 0 0114 0M3 16h18M8 9l4 3 4-3" /></svg>);
const IMoon = () => (<svg viewBox="0 0 24 24" {...ic} aria-hidden><path d="M21 12.8A8 8 0 1111.2 3a6.2 6.2 0 009.8 9.8z" /></svg>);
const ISunrise = () => (<svg viewBox="0 0 24 24" {...ic} aria-hidden><path d="M12 3v6M8.5 6.5L12 3l3.5 3.5M4 14a8 8 0 0116 0M2 18h20" /></svg>);
const ISun = () => (<svg viewBox="0 0 24 24" {...ic} aria-hidden><circle cx="12" cy="12" r="4.5" /><path d="M12 2v2M12 20v2M2 12h2M20 12h2M5 5l1.5 1.5M17.5 17.5L19 19M19 5l-1.5 1.5M6.5 17.5L5 19" /></svg>);
const IChevD = () => (<svg viewBox="0 0 24 24" {...ic} aria-hidden><path d="M6 9l6 6 6-6" /></svg>);
const GICON = { Morning: <ISunrise />, Afternoon: <ISun />, Evening: <ISunset />, Night: <IMoon /> };

const DAYS = [
  {
    d: "Today, 24 Oct", c: "12 slots",
    groups: [
      { head: "Evening", slots: [{ t: "6 - 7 PM", disabled: true }, { t: "7 - 8 PM" }, { t: "8 - 9 PM" }] },
      { head: "Night", slots: [{ t: "9 - 10 PM" }, { t: "10 - 11 PM" }, { t: "11 - 12 PM" }] },
    ],
  },
  {
    d: "Tomorrow, 25 Oct", c: "16 slots",
    groups: [
      { head: "Morning", slots: [{ t: "8 - 9 AM" }, { t: "9 - 10 AM" }, { t: "10 - 11 AM" }] },
      { head: "Afternoon", slots: [{ t: "12 - 1 PM" }, { t: "1 - 2 PM" }, { t: "2 - 3 PM" }] },
    ],
  },
];

const NOTES = [
  { t: "Today is partial", s: "Earlier slots like 6 to 7 PM have already passed" },
  { t: "Tomorrow opens a full day", s: "16 slots against today's 12" },
  { t: "Switch days, the list re-animates", s: "The grid restaggers to the new day" },
];

export default function SchedDateSwitch() {
  const reduce = useReducedMotion();
  const [day, setDay] = useState(0);
  const [moving, setMoving] = useState(false);
  const [cur, setCur] = useState({ x: 0, y: 0, visible: false, press: false, n: 0 });

  const { fitRef, frameRef } = useFitScale(660, 1.06);
  const screenRef = useRef(null);
  const tabRefs = useRef([]);

  const loopRef = useInViewLoop(!reduce, async ({ wait, alive }) => {
    const tapTab = async (i) => {
      const el = tabRefs.current[i], screen = screenRef.current;
      if (!el || !screen) return;
      const { x, y } = centerInFrame(el, screen);
      setMoving(true);
      setCur((c) => ({ ...c, x, y, visible: true, press: false }));
      await wait(560); if (!alive()) return;
      setCur((c) => ({ ...c, press: true, n: c.n + 1 }));
      await wait(150); if (!alive()) return;
      setDay(i);
      setCur((c) => ({ ...c, press: false }));
      setMoving(false);
    };
    while (alive()) {
      setDay(0); setCur((c) => ({ ...c, visible: false })); await wait(1700); if (!alive()) break;
      await tapTab(1); if (!alive()) break;
      await wait(1900); if (!alive()) break;
      await tapTab(0); if (!alive()) break;
      await wait(1500);
    }
  });

  const activeNote = moving ? 2 : day;
  const dd = DAYS[day];

  return (
    <div className="ds-fit" ref={(n) => { fitRef.current = n; loopRef.current = n; }}>
      <div className="ds-root ds-root--phone" ref={frameRef}>
        <div className="sd-stage sd-stage--rail sd-stage--dsw">
          <PhoneWindow title="Schedule order">
            <div className="dsw" ref={screenRef}>
              <div className="dsw-head">
                <span className="dsw-cal"><ICal /></span>
                <span className="dsw-head__txt">
                  <span className="dsw-head__t">Schedule for Later</span>
                  <span className="dsw-head__s">Pick a time slot for delivery</span>
                </span>
                <span className="dsw-radio" />
              </div>

              <div className="dsw-box">
                <span className="dsw-boxlabel">PICK A TIME SLOT</span>
                <div className="dsw-tabs">
                  {DAYS.map((x, i) => (
                    <div className="dsw-tab" key={i} ref={(el) => (tabRefs.current[i] = el)} data-on={day === i}>
                      <span className="dsw-tab__d">{x.d}</span>
                      <span className="dsw-tab__c">{x.c}</span>
                    </div>
                  ))}
                </div>

                <div className="dsw-slotlist" key={day}>
                  {dd.groups.map((g, gi) => (
                    <div className="dsw-group" key={g.head}>
                      <div className="dsw-ghead">{GICON[g.head]}{g.head}</div>
                      <div className="dsw-slots">
                        {g.slots.map((s, si) => (
                          <span
                            className={`dsw-slot${reduce ? "" : " dsw-slot--enter"}`}
                            key={s.t}
                            data-disabled={s.disabled}
                            style={{ animationDelay: `${(gi * 3 + si) * 45}ms` }}
                          >{s.t}</span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="dsw-more">More slots <IChevD /></div>
              </div>

              <div className="dsw-info"><span className="dsw-info__ic">i</span>You can cancel up to 30 mins prior to delivery</div>

              <Cursor x={cur.x} y={cur.y} visible={cur.visible} press={cur.press} clickN={cur.n} />
            </div>
          </PhoneWindow>

          <div className="sd-rail">
            <div className="sd-rail__cap">The day switch</div>
            {NOTES.map((nt, i) => (
              <div className="sd-step" key={nt.t} data-on="true" data-active={i === activeNote} data-tone="purple">
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
