import { useFitScale, useStepSequence } from "../ds/hooks";
import "./jarvis.css";
import "./edgeOos.css";

// Edge: the out-of-stock alert, the real-time join between what a brand
// advertises and what dark stores are about to run out of. A toast lands, the
// insight card explains the join, one click pauses the SKUs, reversibly.

const ROWS = [
  { name: "Choco Crunch 300g · BLR-South" },
  { name: "Berry Muesli 500g · BLR-South" },
  { name: "Honey Oats 1kg · BLR-South" },
];

const STEPS = [
  { t: "Money actively burning", s: "Advertised and going out of stock, joined live", tone: "red" },
  { t: "The card knows why", s: "Symptom, driver, and the one smart move", tone: "amber" },
  { t: "One click, reversible", s: "Applied with an audit trail and undo", tone: "green" },
  { t: "The moat, in one moment", s: "No outside bot can make this join", tone: "pink" },
];

const Check = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5" /></svg>
);

export default function EdgeOos() {
  const { fitRef, frameRef } = useFitScale(660, 1.06);
  const { ref: seqRef, step } = useStepSequence(4, { beat: 1700, hold: 3400 });
  const paused = step >= 3;

  return (
    <div className="ds-fit" ref={(n) => { fitRef.current = n; seqRef.current = n; }}>
      <div className="ds-root ds-root--edge" ref={frameRef}>
        <div className="ej-stage ejo-stage">
          <div
            className="ej-stage__main ejo-main"
            role="img"
            aria-label="The out-of-stock alert: a toast warns that advertised SKUs are running out, the insight card explains the join, one click pauses them, with undo."
          >
            <div className="ej-page ejo-page">
              <div className="ej-page__bar">
                <span className="ej-page__brand">Zepto Ads</span>
                <span className="ej-page__tab" data-on="true">Campaigns</span>
                <span className="ej-page__tab">Analytics</span>
              </div>

              <div className="ejo-rows">
                {ROWS.map((r) => (
                  <div className="ejo-row" key={r.name}>
                    <span className="ejo-row__name">{r.name}</span>
                    <span className="ejo-pill" data-paused={paused}>{paused ? "Paused" : "Live"}</span>
                  </div>
                ))}
              </div>

              <div className="ej-toast ejo-toast" data-on={step >= 1} data-dim={step >= 2}>
                <span className="ej-toast__t">3 SKUs going OOS by 7 PM, and they're live.</span>
                <span className="ej-actions">
                  <span className="ej-btn">Handle it</span>
                  <span className="ej-btn ej-btn--ghost">Skip</span>
                </span>
              </div>

              <div className="ej-card ejo-card" data-on={step >= 2}>
                <div className="ejo-card__face" data-show={step < 3}>
                  <span className="ej-badge" data-tone="red">Urgent</span>
                  <span className="ej-card__claim">3 advertised SKUs going out of stock in BLR-South by 7 PM.</span>
                  <span className="ej-card__detail">Advertised and stock falling: a join only first-party data can see.</span>
                  <span className="ej-actions">
                    <span className="ej-btn">Pause SKUs</span>
                    <span className="ej-btn ej-btn--ghost">View</span>
                  </span>
                </div>
                <div className="ejo-card__face" data-show={step >= 3}>
                  <span className="ej-badge" data-tone="green">Done</span>
                  <span className="ej-card__claim">Done. Live in 4 minutes.</span>
                  <span className="ej-card__detail">Undo stays open for 24 hours.</span>
                  <span className="ej-actions">
                    <span className="ej-btn ej-btn--ghost">View</span>
                    <span className="ej-btn ej-btn--ghost">Undo</span>
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="ej-rail">
            <div className="ej-rail__cap">The alert only Zepto can build</div>
            {STEPS.map((st, i) => (
              <div className="ej-step" key={st.t} data-active={step === i + 1} data-tone={st.tone}>
                <span className="ej-step__dot"><Check /></span>
                <span className="ej-step__txt">
                  <span className="ej-step__t">{st.t}</span>
                  <span className="ej-step__s">{st.s}</span>
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
