import { useState } from "react";
import { useReducedMotion, useInViewLoop } from "../ds/hooks";
import "./awayReveal.css";

// First instance of the CONSUMER / Apple-keynote register (reveal clock).
// Recipe: "From the void" + "Word / claim build" (consumer-motion-framework.md §7).
// A dark void stage holds, a hero card materializes (scale-down-to-settle + fade,
// NO overshoot) with a one-shot specular sweep at settle, holds a generous beat,
// then the thesis builds word by word. One thing in motion per beat; the held-still
// surround is the design. Reduced motion jumps to the parked end state.

const CLAIM = ["An", "agent", "for", "the", "whole", "trip."];

export default function AwayReveal() {
  const reduce = useReducedMotion();
  const [step, setStep] = useState(reduce ? 2 : 0);
  const ref = useInViewLoop(!reduce, async ({ wait, alive }) => {
    while (alive()) {
      setStep(0); await wait(900); if (!alive()) break;   // dwell on the void (anticipation)
      setStep(1); await wait(2600); if (!alive()) break;  // hero materializes, then --ds-hold-cine
      setStep(2); await wait(3400); if (!alive()) break;  // the claim builds, then holds
    }
  });

  return (
    <div className="ch-stage" ref={ref} role="img" aria-label="Consumer register: an Away hero materializes from a dark stage, then the thesis builds word by word">
      <span className="ch-vignette" aria-hidden />

      <div className={`ch-hero${step >= 1 ? " is-in" : ""}`}>
        <span className="ch-hero__glow" aria-hidden />
        <div className="ch-card">
          <span className="ch-card__brand">AWAY</span>
          <span className="ch-card__route">BLR <i aria-hidden>→</i> GOI</span>
          <span className="ch-card__meta">booked, watched, and rescued, end to end</span>
        </div>
        <span className="ch-hero__sweep" aria-hidden />
      </div>

      <p className={`ch-claim${step >= 2 ? " is-in" : ""}`}>
        {CLAIM.map((w, i) => (
          <span key={i} className="ch-word" style={{ transitionDelay: `calc(${i} * var(--m3-stagger-word))` }}>{w}&nbsp;</span>
        ))}
      </p>
    </div>
  );
}
