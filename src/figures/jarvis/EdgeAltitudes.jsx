import { useFitScale, useStepSequence } from "../ds/hooks";
import "./jarvis.css";
import "./edgeAltitudes.css";

// Edge's signature move: one data spine (ROAS, spend, SOV) rendered at three
// altitudes. The buyer gets a one-click fix, the lead gets goal pace, and
// leadership gets a one-line digest. Differentiation by altitude, not permission.

const SPINE = [
  { label: "ROAS", value: "2.1", delta: "down 18%", tone: "red" },
  { label: "Spend", value: "₹4.2L", delta: "92% used" },
  { label: "SOV", value: "31%", delta: "down 4 pts", tone: "amber" },
];

const NOTES = [
  { t: "The buyer acts", s: "Per-campaign drivers, one-click fixes", tone: "pink" },
  { t: "The lead steers", s: "Goal pace, rolled up, read-only", tone: "amber" },
  { t: "Leadership glances", s: "A digest, not a dashboard", tone: "green" },
  { t: "Nobody else does this", s: "Differentiation by altitude, not permission", tone: "pink" },
];

export default function EdgeAltitudes() {
  const { fitRef, frameRef } = useFitScale(660, 1.06);
  const { ref: seqRef, step } = useStepSequence(4, { beat: 1500, hold: 3400 });

  return (
    <div className="ds-fit" ref={(n) => { fitRef.current = n; seqRef.current = n; }}>
      <div className="ds-root ds-root--edge" ref={frameRef}>
        <div className="ej-stage">
          <div
            className="ej-stage__main eja-main"
            data-linked={step === 4}
            role="img"
            aria-label="One data spine rendered at three altitudes: the media buyer gets a one-click fix, the brand lead gets goal pace, leadership gets a one-line digest."
          >
            <div className="eja-spine">
              <div className="eja-spine__cap">The spine</div>
              {SPINE.map((m) => (
                <div className="eja-metric" key={m.label}>
                  <span className="eja-metric__label">{m.label}</span>
                  <span className="eja-metric__row">
                    <span className="eja-metric__value">{m.value}</span>
                    <span className="eja-metric__delta" data-tone={m.tone}>{m.delta}</span>
                  </span>
                </div>
              ))}
            </div>

            <div className="eja-alts">
              <div className="eja-alt" data-on={step >= 1}>
                <div className="eja-alt__head">
                  <span className="ej-badge">Media buyer</span>
                  <span className="eja-mode">acts</span>
                </div>
                <div className="eja-alt__claim">Sugarfree-A eating spend at 0.7x ROAS. Shift ₹12K to Sugarfree-B?</div>
                <div className="ej-actions">
                  <button className="ej-btn" type="button" tabIndex={-1}>Apply</button>
                  <span className="ej-why">Why?</span>
                </div>
              </div>

              <div className="eja-alt" data-on={step >= 2}>
                <div className="eja-alt__head">
                  <span className="ej-badge" data-tone="amber">Brand lead</span>
                  <span className="eja-mode">steers</span>
                  <span className="eja-tag">read-only</span>
                </div>
                <div className="eja-alt__line">Sugarfree family: 84% to goal. One drag: Sugarfree-A in BLR.</div>
              </div>

              <div className="eja-alt" data-on={step >= 3}>
                <div className="eja-alt__head">
                  <span className="ej-badge" data-tone="green">Leadership</span>
                  <span className="eja-mode">glances</span>
                </div>
                <div className="eja-mail">Q3 pace: on track. ROAS 2.1, spend 92% utilised. One flag this week.</div>
              </div>
            </div>
          </div>

          <div className="ej-rail">
            <div className="ej-rail__cap">Same data, three altitudes</div>
            {NOTES.map((nt, i) => (
              <div className="ej-step" key={nt.t} data-active={step === i + 1} data-tone={nt.tone}>
                <span className="ej-step__dot">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5" /></svg>
                </span>
                <span>
                  <span className="ej-step__t">{nt.t}</span>
                  <span className="ej-step__s">{nt.s}</span>
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
