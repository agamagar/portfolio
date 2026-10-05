// Edge figure "One card, five voices": the insight card is Edge's workhorse
// widget. Five variants share one anatomy; static callouts label the shared
// parts while the card content steps through all five voices.
import { useFitScale, useStepSequence } from "../ds/hooks";
import "./jarvis.css";
import "./edgeCard.css";

const VARIANTS = [
  { badge: "Suggestion", claim: "Shift ₹12K from Sugarfree-A to Sugarfree-B. 2.4x higher ROAS this week.", primary: "Apply", why: "Why?", ghost: "Skip" },
  { badge: "Urgent", tone: "red", claim: "3 advertised SKUs going OOS in BLR-South by 7 PM.", primary: "Pause SKUs", ghost: "View" },
  { badge: "Diagnostic", tone: "amber", claim: "CTR dropped 22% Monday. Likely creative fatigue on banner B.", detail: "Live 14 days · frequency 8.2", primary: "Rotate creatives", ghost: "Show data" },
  { badge: "Draft", claim: "3 Diwali headlines drafted for your sweets range.", primary: "Use one", ghost: "Tweak" },
  { badge: "Benchmark", tone: "green", claim: "Your snacks CTR runs 1.8x the category median in BLR.", primary: "See the gap", ghost: "Dismiss" },
];

const STEPS = [
  { t: "Suggestion", s: "A move, costed and ready" },
  { t: "Urgent", s: "Money burning, one click to stop", tone: "red" },
  { t: "Diagnostic", s: "The driver, not the symptom", tone: "amber" },
  { t: "Draft", s: "Generated, never auto-sent" },
  { t: "Benchmark", s: "You, versus the category", tone: "green" },
];

const CHECK = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5" /></svg>
);

export default function EdgeCard() {
  const { fitRef, frameRef } = useFitScale(660, 1.06);
  const { ref: seqRef, step } = useStepSequence(5, { beat: 1600, hold: 3000 });
  const vi = Math.max(1, step);
  const v = VARIANTS[vi - 1];

  return (
    <div className="ds-fit" ref={(n) => { fitRef.current = n; seqRef.current = n; }}>
      <div className="ds-root ds-root--edge" ref={frameRef}>
        <div className="ej-stage">
          <div className="ej-stage__main" role="img" aria-label="The Edge insight card anatomy: one layout carrying five variants, suggestion, alert, diagnostic, draft, and comparison.">
            <div className="ejc-canvas">
              <div className="ejc-tag ejc-tag--badge">variant badge</div>
              <div className="ejc-lead ejc-lead--badge" />
              <div className="ejc-tag ejc-tag--claim">one claim sentence</div>
              <div className="ejc-lead ejc-lead--claim" />

              <div className="ej-card ejc-card">
                <div className="ejc-swap" key={vi}>
                  <span className="ej-badge" data-tone={v.tone}>{v.badge}</span>
                  <div className="ej-card__claim">{v.claim}</div>
                  {v.detail ? <div className="ej-card__detail">{v.detail}</div> : null}
                  <div className="ej-actions">
                    <span className="ej-btn">{v.primary}</span>
                    {v.why ? <span className="ej-why">{v.why}</span> : null}
                    <span className="ej-btn ej-btn--ghost">{v.ghost}</span>
                  </div>
                </div>
              </div>

              <div className="ejc-lead ejc-lead--primary" />
              <div className="ejc-tag ejc-tag--primary">one primary action</div>
              <div className="ejc-lead ejc-lead--why" />
              <div className="ejc-tag ejc-tag--why">reasoning, one tap away</div>

              <div className="ejc-rule">Carries an action, so it is a card, never prose.</div>
            </div>
          </div>

          <div className="ej-rail">
            <div className="ej-rail__cap">One card, five voices</div>
            {STEPS.map((st, i) => (
              <div className="ej-step" key={st.t} data-active={step === i + 1} data-tone={st.tone}>
                <span className="ej-step__dot">{CHECK}</span>
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
