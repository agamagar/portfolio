import { useState } from "react";
import { useReducedMotion, useFitScale, useInViewLoop } from "../ds/hooks";
import { PhoneWindow, Shimmer, Caption } from "../ds/Scaffold";
import { Rail } from "./Rail";
import { IClock, ICal } from "./icons";
import "./scheduled.css";

// "Context & problem" — who scheduling is actually for. Three high-intent moments
// where instant isn't the answer, each reframing the feature from nice-to-have
// into the reason they ordered at all. The phone shows the non-intrusive
// contextual nudge (surfaced only when the cart isn't serviceable now); the rail
// holds the user taxonomy, lighting one moment at a time, then converging.

const USERS = [
  { t: "Commuter", s: "Schedules on the ride home so it lands when they do", head: "Order now, arrive after work", slot: "7–8 PM" },
  { t: "Patchy coverage", s: "Lives where instant often isn't serviceable", head: "Instant can't reach here", slot: "Tomorrow 9–10 AM" },
  { t: "Superstore night owl", s: "Wants a category only the superstore stocks, after hours", head: "The store reopens in the morning", slot: "8–9 AM" },
];
const CAPS = ["", "On the ride home", "Where instant can't reach", "After the store closes", "Later, not now"];

export default function SchedUsers() {
  const reduce = useReducedMotion();
  const [beat, setBeat] = useState(reduce ? 4 : 0);
  const { fitRef, frameRef } = useFitScale(660, 1.06);

  const loopRef = useInViewLoop(!reduce, async ({ wait, alive }) => {
    while (alive()) {
      setBeat(0); await wait(1000); if (!alive()) break;
      setBeat(1); await wait(1500); if (!alive()) break;
      setBeat(2); await wait(1500); if (!alive()) break;
      setBeat(3); await wait(1500); if (!alive()) break;
      setBeat(4); await wait(2100);
    }
  });

  const converge = beat >= 4;
  const u = beat >= 1 && beat <= 3 ? USERS[beat - 1] : null;
  const active = converge ? -1 : beat - 1;
  const done = new Set(converge ? [0, 1, 2] : [0, 1, 2].filter((i) => i < beat - 1));

  return (
    <div className="ds-fit" ref={(n) => { fitRef.current = n; loopRef.current = n; }}>
      <div className="ds-root ds-root--phone" ref={frameRef}>
        <div className="sd-stage sd-stage--rail">
          <PhoneWindow title="Zepto">
            <div className="sd-summary"><span className="sd-summary__t">Your cart</span><span className="sd-summary__c">not serviceable now</span></div>
            <div className="sd-grid">
              {Array.from({ length: 6 }).map((_, i) => (<span className="sd-tile" key={i} />))}
            </div>
            <div className="sd-nudge" data-on={beat >= 1}>
              <div className="sd-nudge__head"><IClock />{converge ? "Different needs, one answer" : u ? u.head : "Need it a little later?"}</div>
              <div className="sd-nudge__sub">{converge ? "Order anything on Zepto for a future one-hour slot." : u ? u.s : "Schedule it for a slot that works for you."}</div>
              <span className="sd-confirm__slot sd-nudge__slot">{converge ? "Later, not now" : <><ICal />{u ? u.slot : "Pick a slot"}</>}</span>
            </div>
            {beat >= 1 && <Caption mode="purple" label={CAPS[beat]} style={{ left: "50%", bottom: 12, transform: "translateX(-50%)" }} />}
          </PhoneWindow>
          <Rail cap="Who it's for" steps={USERS.map((x) => ({ t: x.t, s: x.s }))} active={active} done={done} />
        </div>
      </div>
    </div>
  );
}
