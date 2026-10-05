import { useFitScale, useStepSequence } from "../ds/hooks";
import { Mark, Panel, FactRow, Connector } from "../ds/SystemExplainer";
import "./awayAgent.css";

// System-Explainer · EXTRACT archetype (base-layer §12, registry instance #1).
// "A real brief, untangled." A verbatim message from a test run carries eleven
// separate constraints at once. The agent scans it and highlights each requirement
// in turn while the structured brief fills in on the right, one mapping per step.
// The point: a messy, all-at-once request is never a worse path than tidy cards.
//
// Assembled entirely from the shared kit (Mark / Panel / Field / Connector) on the
// useStepSequence clock — this figure no longer owns any mode-specific code.

const BRIEF = [
  { k: "Passengers", v: "3 adults" },
  { k: "Route", v: "BLR → DTW" },
  { k: "Origin flex", v: "or BOM, if cheaper" },
  { k: "Arrival flex", v: "or ORD, if cheaper" },
  { k: "Dates", v: "1–16 May" },
  { k: "Date flex", v: "± 2 days" },
  { k: "Fare", v: "Lite · 1 bag each" },
  { k: "Avoid", v: "Gulf carriers + hubs" },
  { k: "Stops", v: "1, up to 2" },
  { k: "Max time", v: "≤ 27h total" },
  { k: "Transit visa", v: "none required" },
];
const N = BRIEF.length;

export default function AwIntakeBrief() {
  const { ref: seqRef, step } = useStepSequence(N);
  const { fitRef, frameRef } = useFitScale(880, 1);

  return (
    <div className="ds-fit" ref={(n) => { fitRef.current = n; seqRef.current = n; }}>
      <div className="ds-root ds-root--away" ref={frameRef} style={{ width: 880 }}>
        <div style={{ display: "flex", justifyContent: "center" }}>
          <div style={{ width: 880, display: "flex", gap: 0, alignItems: "stretch", fontFamily: "Inter, system-ui, sans-serif" }}>

            <Panel title="What the user asked" tone="raw" grow>
              <p style={{ margin: 0, fontSize: 14.5, lineHeight: 1.85, color: "#cbcbd4" }}>
                I want to book travel to the US for <Mark on={step >= 1}>3 of us</Mark>, <Mark on={step >= 2}>BLR to Detroit</Mark>, though <Mark on={step >= 3}>Mumbai departure is also ok if cost is lower</Mark> and <Mark on={step >= 4}>Chicago arrival is also fine for cost</Mark>. Ideal dates are <Mark on={step >= 5}>May 1st to May 16th</Mark> with <Mark on={step >= 6}>1-2 days flexibility on both sides</Mark> for cost reasons. I don't need much luggage so <Mark on={step >= 7}>lite fare class, one baggage each</Mark> is fine. I would prefer <Mark on={step >= 8}>avoiding gulf based carriers or transit points</Mark>, and <Mark on={step >= 9}>one stop but can consider 2 stops</Mark> as long as total travel time is <Mark on={step >= 10}>within 26-27 hrs</Mark> and there is <Mark on={step >= 11}>no visa need</Mark>.
              </p>
            </Panel>

            <Connector length={64} />

            <Panel title="What the agent understood" tone="built" width={312}>
              <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
                {BRIEF.map((b, i) => (
                  <FactRow key={b.k} k={b.k} v={b.v} shown={step >= i + 1} />
                ))}
              </div>
            </Panel>

          </div>
        </div>
      </div>
    </div>
  );
}
