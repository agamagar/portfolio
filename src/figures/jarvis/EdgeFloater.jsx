import { useFitScale, useStepSequence } from "../ds/hooks";
import "./jarvis.css";
import "./edgeFloater.css";

// Where Edge lives: the floater pill riding the Zepto Ads Analytics page. It
// idles in the corner, picks up one unread insight, turns urgent only when
// money is burning, then expands in place into a side panel that already knows
// what the advertiser is looking at. The rail names each escalation beat.

const TILES = [
  { l: 52, v: 74 }, { l: 60, v: 66 }, { l: 46, v: 80 },
  { l: 58, v: 70 }, { l: 44, v: 62 }, { l: 64, v: 76 },
];

const RAIL = [
  { t: "A pill, not a destination", s: "Rides the pages brands already use" },
  { t: "Something worth knowing", s: "One new, never a nag" },
  { t: "Only urgency interrupts", s: "Reserved for money actively burning", tone: "red" },
  { t: "One click, in context", s: "The panel opens knowing what you look at", tone: "green" },
];

export default function EdgeFloater() {
  const { ref: seqRef, step } = useStepSequence(4, { beat: 1500, hold: 3200 });
  const { fitRef, frameRef } = useFitScale(660, 1.06);
  const urgent = step === 2;
  const open = step >= 3;

  return (
    <div className="ds-fit" ref={(n) => { fitRef.current = n; seqRef.current = n; }}>
      <div className="ds-root ds-root--edge" ref={frameRef}>
        <div className="ej-stage">
          <div
            className="ej-stage__main"
            role="img"
            aria-label="The Edge floater on the Zepto Ads analytics page: an idle pill escalates to unread, then urgent, then expands into a context-aware side panel."
          >
            <div className="ej-page ejf-page">
              <div className="ej-page__bar">
                <span className="ej-page__brand">Zepto Ads</span>
                <span className="ej-page__tab" data-on="true">Analytics</span>
                <span className="ej-page__tab">Campaigns</span>
                <span className="ej-page__tab">Elevate</span>
              </div>

              <div className="ejf-tiles">
                {TILES.map((tl, i) => (
                  <div className="ejf-tile" key={i}>
                    <span className="ejf-tile__label" style={{ width: `${tl.l}%` }} />
                    <span className="ejf-tile__value" style={{ width: `${tl.v}%` }} />
                  </div>
                ))}
              </div>
              <div className="ejf-chart">
                <span className="ejf-tile__label" style={{ width: "22%" }} />
              </div>

              <div className="ej-pill ejf-pill" data-tone={urgent ? "red" : undefined} data-gone={open || undefined}>
                <span className="ej-pill__spark" />
                <span>{urgent ? "Edge · needs you" : "Ask Edge"}</span>
                {step === 1 && <span className="ej-pill__n">1 new</span>}
              </div>

              <div className="ejf-panel" data-open={open || undefined}>
                <div className="ejf-panel__ctx">Looking at: Beco wipes · BLR · last 7 days</div>
                <div className="ej-card">
                  <span className="ej-badge">Suggestion</span>
                  <div className="ej-card__claim">Shift ₹12K from Sugarfree-A to Sugarfree-B. 2.4x higher ROAS this week.</div>
                  <div className="ej-actions">
                    <span className="ej-btn">Apply</span>
                    <span className="ej-why">Why?</span>
                    <span className="ej-btn ej-btn--ghost">Skip</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="ej-rail">
            <div className="ej-rail__cap">Where Edge lives</div>
            {RAIL.map((r, i) => (
              <div className="ej-step" key={r.t} data-active={step >= i + 1} data-tone={r.tone}>
                <span className="ej-step__dot"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5" /></svg></span>
                <span className="ej-step__txt"><span className="ej-step__t">{r.t}</span><span className="ej-step__s">{r.s}</span></span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
