import { useState } from "react";
import { useReducedMotion, useFitScale, useInViewLoop } from "../ds/hooks";
import { PhoneWindow, Caption } from "../ds/Scaffold";
import { Rail } from "./Rail";
import "./scheduled.css";

// "Click, same slot, different name." Cursor-driven demo of the cross-midnight
// interaction: tap More slots to reveal Late Night; select 3–4 AM; switch to
// Tomorrow — the same post-midnight windows are now labeled Early Morning.
// Design: Figma Dz5kNdC3bOc2I44wdZfC6N node 10246:2921 (Schedule Page, 3 screens).

const STEPS = [
  { t: "More slots", s: "Late Night hidden by default" },
  { t: "3–4 AM selected", s: "A Late Night slot, Tonight" },
  { t: "Tomorrow tab", s: "Same slot, labeled Early Morning" },
];

const CAPS = [
  "Late Night slots hidden behind collapse",
  "3–4 AM, a Late Night slot",
  "Same slot, now labeled Early Morning",
];

// Cursor positions are pixel offsets from the top-left of ds-phone__screen
// (padding: 14px 14px 6px). Phone is 300px wide × 476px tall in rail mode.
// Layout: toggle (42px) + 9px gap + tabs (35px) + 9px margin + slot grid.
const CURSOR_POS = {
  'more-slots': { left: 150, top: 255 },
  '3-4am':      { left: 57,  top: 320 },
  'tomorrow':   { left: 218, top: 83  },
};

export default function SchedSinglePage() {
  const reduce = useReducedMotion();
  const [beat, setBeat]             = useState(reduce ? 2 : 0);
  const [lateOpen, setLateOpen]     = useState(reduce);
  const [selected, setSelected]     = useState(reduce);
  const [tab, setTab]               = useState(reduce ? 'tomorrow' : 'today');
  const [cursorAt, setCursorAt]     = useState('more-slots');
  const [clicking, setClicking]     = useState(false);
  const [cursorVisible, setCursorVisible] = useState(false);
  const [slotKey, setSlotKey]       = useState(0);

  const { fitRef, frameRef } = useFitScale(660, 1.06);

  const loopRef = useInViewLoop(!reduce, async ({ wait, alive }) => {
    while (alive()) {
      setBeat(0); setTab('today'); setLateOpen(false); setSelected(false);
      setCursorAt('more-slots'); setClicking(false);
      await wait(80); if (!alive()) break;

      setCursorVisible(true);
      await wait(1300); if (!alive()) break;

      setClicking(true);
      await wait(420); if (!alive()) break;
      setClicking(false); setLateOpen(true); setCursorAt('3-4am');
      await wait(750); if (!alive()) break;

      setBeat(1); setClicking(true);
      await wait(420); if (!alive()) break;
      setClicking(false); setSelected(true); setCursorAt('tomorrow');
      await wait(750); if (!alive()) break;

      setClicking(true);
      await wait(420); if (!alive()) break;
      setClicking(false);
      setTab('tomorrow'); setSlotKey(k => k + 1); setBeat(2);

      await wait(300); if (!alive()) break;
      setCursorVisible(false);
      await wait(2500); if (!alive()) break;
    }
  });

  const pos = CURSOR_POS[cursorAt] ?? CURSOR_POS['more-slots'];
  const done = new Set([0, 1, 2].filter(i => i < beat));

  return (
    <div className="ds-fit" ref={(n) => { fitRef.current = n; loopRef.current = n; }}>
      <div className="ds-root ds-root--phone" ref={frameRef}>
        <div className="sd-stage sd-stage--rail">
          <PhoneWindow title="Schedule order">

            {/* Cursor overlay, absolute within ds-phone__screen */}
            <div
              className="scsp-cursor"
              data-visible={cursorVisible ? 'true' : 'false'}
              data-clicking={clicking ? 'true' : 'false'}
              style={{ left: pos.left, top: pos.top }}
            />

            {/* Delivery type toggle: Instant | Schedule */}
            <div className="scsp-dtog">
              <div className="scsp-dtog__opt">
                <div className="scsp-dtog__t">⚡ Instant</div>
                <div className="scsp-dtog__s">9 min</div>
              </div>
              <div className="scsp-dtog__opt" data-sched="">
                <div className="scsp-dtog__t">🛍 Schedule</div>
                <div className="scsp-dtog__s">Select a slot</div>
              </div>
            </div>

            {/* Day tabs, underline style, with slot count */}
            <div className="scsp-tabs">
              <div className="scsp-tab" data-on={tab === 'today' ? '' : undefined}>
                Today
                <span className="scsp-tab__count">13 slots</span>
              </div>
              <div className="scsp-tab" data-on={tab === 'tomorrow' ? '' : undefined}>
                Tomorrow
                <span className="scsp-tab__count">0 slots</span>
              </div>
            </div>

            {/* TODAY slot grid */}
            {tab === 'today' && (
              <div className="sd-slots">
                <span className="sd-slot__div">Evening</span>
                <span className="sd-slot" data-state="disabled">6–7 PM</span>
                <span className="sd-slot">7–8 PM</span>
                <span className="sd-slot">8–9 PM</span>
                <span className="sd-slot__div">Night</span>
                <span className="sd-slot">9–10 PM</span>
                <span className="sd-slot">10–11 PM</span>
                <span className="sd-slot">11–12 PM</span>
                {!lateOpen && <span className="scsp-more">More slots ∨</span>}
                <div className="scsp-late" data-open={lateOpen ? 'true' : 'false'}>
                  <div className="scsp-late__expand">
                    <div className="scsp-late__inner">
                      <span className="sd-slot__div">Late night</span>
                      <span className="sd-slot">12–1 AM</span>
                      <span className="sd-slot">1–2 AM</span>
                      <span className="sd-slot">2–3 AM</span>
                      <span className="sd-slot"
                        data-state={selected ? 'on' : undefined}>3–4 AM</span>
                      <span className="sd-slot">4–5 AM</span>
                      <span className="sd-slot">5–6 AM</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TOMORROW slot grid, Early Morning first, Evening/Night dimmed */}
            {tab === 'tomorrow' && (
              <div key={slotKey} className="sd-slots scsp-slide-up">
                <span className="sd-slot__div">Early morning</span>
                <span className="sd-slot">12–1 AM</span>
                <span className="sd-slot">1–2 AM</span>
                <span className="sd-slot">2–3 AM</span>
                <span className="sd-slot" data-state="on">3–4 AM</span>
                <span className="sd-slot">4–5 AM</span>
                <span className="sd-slot">5–6 AM</span>
                <span className="sd-slot__div scsp-dim">Evening</span>
                <span className="sd-slot scsp-dim">6–7 PM</span>
                <span className="sd-slot scsp-dim">7–8 PM</span>
                <span className="sd-slot scsp-dim">8–9 PM</span>
                <span className="sd-slot__div scsp-dim">Night</span>
                <span className="sd-slot scsp-dim">9–10 PM</span>
                <span className="sd-slot scsp-dim">10–11 PM</span>
                <span className="sd-slot scsp-dim">11–12 PM</span>
              </div>
            )}

            <Caption mode="purple" label={CAPS[beat]} className="sd-cap" />
          </PhoneWindow>

          <Rail
            cap="Same slot, two names"
            steps={STEPS}
            active={beat}
            done={done}
          />
        </div>
      </div>
    </div>
  );
}
