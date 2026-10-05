import { useFitScale, useStepSequence } from "../ds/hooks";
import { Panel, Track, ScoreMeter } from "../ds/SystemExplainer";

// System-Explainer · SEQUENCE archetype demo (base-layer §12b). The deep-search
// wait as a narrated timeline: the agent's work advances one node at a time, and
// once it resolves it scores the options it found. Two archetypes composed in
// order (sequence -> score), assembled from the shared kit on one clock.

const STEPS = [
  { label: "Reading your brief", sub: "11 constraints, 2 flexible origins" },
  { label: "Scanning inventory", sub: "BLR/BOM → DTW/ORD, 1–16 May" },
  { label: "Cross-referencing suppliers", sub: "Riya · Akbar · Cleartrip · TBO" },
  { label: "Negotiating bulk rates", sub: "below the headline B2C fare" },
  { label: "Scoring your options", sub: "on the four things you asked for" },
];
const SCORES = [
  { label: "Price", value: 0.86 },
  { label: "Total time", value: 0.72 },
  { label: "Stops", value: 0.9 },
  { label: "Avoids Gulf hubs", value: 1, display: "✓" },
];
const N = STEPS.length;

export default function SeqDemo() {
  const { ref: seqRef, step } = useStepSequence(N, { beat: 700, hold: 3200 });
  const { fitRef, frameRef } = useFitScale(720, 1);
  const resolved = step >= N; // scores reveal only once the sequence completes

  return (
    <div className="ds-fit" ref={(n) => { fitRef.current = n; seqRef.current = n; }}>
      <div className="ds-root ds-root--away" ref={frameRef} style={{ width: 720 }}>
        <div style={{ display: "flex", gap: 14, alignItems: "stretch", fontFamily: "Inter, system-ui, sans-serif" }}>

          <Panel title="What the agent is doing" tone="raw" grow>
            <Track steps={STEPS} step={step} />
          </Panel>

          <Panel title="What it found" tone="built" width={320}>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {SCORES.map((s) => (
                <ScoreMeter key={s.label} {...s} shown={resolved} tone="good" />
              ))}
              <p style={{
                margin: "4px 0 0", fontSize: 12, color: "#8a8a98",
                opacity: resolved ? 1 : 0.18, transition: "opacity .3s ease",
              }}>
                Best fit holds the price you watched, within your time and stop limits.
              </p>
            </div>
          </Panel>

        </div>
      </div>
    </div>
  );
}
