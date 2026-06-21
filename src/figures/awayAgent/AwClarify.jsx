import { useState } from "react";
import { useReducedMotion, useFitScale, useInViewLoop } from "../ds/hooks";
import { PhoneWindow } from "../ds/Scaffold";
import { Rail } from "./Rail";
import { Msg, Typing, Composer, QuestionCard } from "./chrome";
import "./awayAgent.css";

// "Asking instead of guessing." You type a city with no dates; the agent does not
// invent them. The composer you are already looking at morphs in place into a
// tappable question card; one tap sends the answer; only the latest card ever
// lives in that slot, so stale cards are structurally impossible.

const STEPS = [
  { t: "Asks, never guesses", s: "A city with no dates? It asks." },
  { t: "The input becomes a card", s: "The composer morphs in place" },
  { t: "Tap sends instantly", s: "The chip's label is the answer" },
  { t: "Stale cards impossible", s: "Only the latest ever shows" },
];
const CHIPS = [
  { label: "Next week" },
  { label: "Next month" },
  { label: "I'm flexible" },
  { label: "Pick a date", kind: "date" },
];

export default function AwClarify() {
  const reduce = useReducedMotion();
  const [beat, setBeat] = useState(reduce ? 4 : 0);
  const { fitRef, frameRef } = useFitScale(660, 1.06);

  const loopRef = useInViewLoop(!reduce, async ({ wait, alive }) => {
    while (alive()) {
      setBeat(0); await wait(1150); if (!alive()) break;
      setBeat(1); await wait(1200); if (!alive()) break;
      setBeat(2); await wait(1500); if (!alive()) break;
      setBeat(3); await wait(1300); if (!alive()) break;
      setBeat(4); await wait(2200);
    }
  });

  const active = beat === 0 ? 0 : beat === 1 ? 0 : beat - 1;
  const done = new Set([0, 1, 2].filter((i) => i < active));
  const chips = CHIPS.map((c) => ({ ...c, on: beat >= 3 && c.label === "Next week" }));

  return (
    <div className="ds-fit" ref={(n) => { fitRef.current = n; loopRef.current = n; }}>
      <div className="ds-root ds-root--away" ref={frameRef}>
        <div className="aw-stage">
          <PhoneWindow title="Away">
            <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
              <div className="aw-chat" style={{ flex: 1, justifyContent: "flex-end" }}>
                <Msg who="user" enter={beat === 0}>Mumbai</Msg>
                {beat === 1 && <Typing />}
                {beat >= 4 && <Msg who="user" enter>Next week</Msg>}
                {beat >= 4 && <Msg who="agent" enter>On it. Checking the week of the 22nd.</Msg>}
              </div>
              <div style={{ marginTop: 10 }}>
                {beat < 2 || beat >= 4
                  ? <Composer ph="Tell me where, I'll handle which flight" />
                  : <QuestionCard q="When do you want to fly to Mumbai?" chips={chips} />}
              </div>
            </div>
          </PhoneWindow>
          <Rail cap="Design states" steps={STEPS} active={active} done={done} />
        </div>
      </div>
    </div>
  );
}
