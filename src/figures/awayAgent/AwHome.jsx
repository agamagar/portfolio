import { useState } from "react";
import { useReducedMotion, useFitScale, useInViewLoop } from "../ds/hooks";
import { PhoneWindow } from "../ds/Scaffold";
import { Rail } from "./Rail";
import { Composer, PillRow, Flight, Badge } from "./chrome";
import { ISun, ISpark, ITrend, IClock } from "./icons";
import "./awayAgent.css";

// "The home adapts to how well it knows you." A stranger gets convince-first proof
// (insider routes that are soft right now), not an empty input. One field — the
// composer — blooms in place into structured pickers as you focus it. And once it
// knows you, the input leads and your watched trips sit on top. Same surface,
// three postures, depending on what the agent has earned.

const STEPS = [
  { t: "Meets a stranger", s: "Convince-first: insider proof" },
  { t: "The input expands", s: "One field blooms into pickers" },
  { t: "Knows you", s: "Input-first, your trips on top" },
];

const DISC = [
  { ic: <ISun />, t: "Lisbon", s: "3-month low", val: "-18%" },
  { ic: <ISpark />, t: "Tokyo", s: "blossoms peak in 12 days" },
  { ic: <ITrend />, t: "Bali", s: "soft all month", val: "-12%" },
];

const WHEN = [
  { label: "Today" },
  { label: "Tomorrow" },
  { label: "This weekend" },
  { label: "Next week" },
];

export default function AwHome() {
  const reduce = useReducedMotion();
  const [beat, setBeat] = useState(reduce ? 2 : 0);
  const { fitRef, frameRef } = useFitScale(660, 1.06);

  const loopRef = useInViewLoop(!reduce, async ({ wait, alive }) => {
    while (alive()) {
      setBeat(0); await wait(2400); if (!alive()) break;
      setBeat(1); await wait(2100); if (!alive()) break;
      setBeat(2); await wait(2400);
    }
  });

  const active = beat;
  const done = new Set([0, 1].filter((i) => i < active));
  const pills = WHEN.map((p) => ({ ...p, on: p.label === "This weekend" }));

  return (
    <div className="ds-fit" ref={(n) => { fitRef.current = n; loopRef.current = n; }}>
      <div className="ds-root ds-root--away" ref={frameRef}>
        <div className="aw-stage">
          <PhoneWindow title="Away">
            <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
              {beat === 0 && (
                <>
                  <div className="aw-greet">Good evening</div>
                  <div className="aw-sub">Flying from Mumbai. A few routes are soft right now.</div>
                  <div className="aw-disc" style={{ marginTop: 12 }}>
                    {DISC.map((d) => (
                      <div className="aw-disc__row" key={d.t}>
                        <span className="aw-disc__ic">{d.ic}</span>
                        <span className="aw-disc__txt">
                          <span className="aw-disc__t">{d.t}</span>
                          <span className="aw-disc__s">{d.s}</span>
                        </span>
                        {d.val && <span className="aw-disc__val">{d.val}</span>}
                      </div>
                    ))}
                  </div>
                  <div style={{ flex: 1 }} />
                  <div style={{ marginTop: 10 }}>
                    <Composer ph="where to, Agam?" />
                  </div>
                </>
              )}

              {beat === 1 && (
                <>
                  <div className="aw-greet">Good evening</div>
                  <div className="aw-sub">Flying from Mumbai. A few routes are soft right now.</div>
                  <div style={{ flex: 1 }} />
                  <div style={{ marginTop: 10, display: "flex", flexDirection: "column", gap: 8 }}>
                    <Badge tone="indigo" icon={<IClock />}>BOM &rarr; GOI</Badge>
                    <PillRow label="When?" pills={pills} />
                    <Composer ph="where to, Agam?" ready={false} />
                  </div>
                </>
              )}

              {beat === 2 && (
                <>
                  <div className="aw-greet">Good evening, Agam</div>
                  <div className="aw-panel" data-tone="indigo" style={{ marginTop: 12 }}>
                    <div className="aw-panel__head">
                      <span className="aw-eyebrow">Your trips</span>
                    </div>
                    <Flight air="6E" time="BOM &rarr; GOI · 06:10" meta="IndiGo · nonstop · Aug 14" now="4,180" />
                    <Badge tone="green" icon={<ITrend />}>Watching price, -90 days</Badge>
                  </div>
                  <div style={{ flex: 1 }} />
                  <div style={{ marginTop: 10 }}>
                    <Composer ph="where to, Agam?" />
                  </div>
                </>
              )}
            </div>
          </PhoneWindow>
          <Rail cap="Design states" steps={STEPS} active={active} done={done} />
        </div>
      </div>
    </div>
  );
}
