import { useRef, useState } from "react";
import { useReducedMotion, useFitScale, useInViewLoop } from "../ds/hooks";
import { AppWindow, Shimmer, FocalOutline, Caption } from "../ds/Scaffold";
import "./onboarding.css";

// Stella onboarding as a CONCEPT animation (Frozen-Frame Focal). The onboarding
// UI is skeleton; the concept "Stella sets herself up — setup completes itself"
// is the one lit thing per beat: each row's focal ring + green check, named by a
// caption. No real forms, no cursor, no annotation popup.

const ORB = "/figures/onboarding/stella-orb.svg";
const STEPS = ["ATS", "Email", "WhatsApp", "AI calls", "Billing", "Plan"]; // the 6 concept words
const BARS = ["55%", "47%", "62%", "41%", "57%", "50%"]; // varied widths = a composed silhouette
const N = STEPS.length;
const T = { meet: 1100, snap: 440, settle: 360, live: 1600 };

const Check = () => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5" /></svg>);

export default function StellaOnboarding() {
  const reduce = useReducedMotion();
  // beat: 0 = meet Stella; 1..N = completing step i; N+1 = live
  const [beat, setBeat] = useState(reduce ? N + 1 : 0);
  const [done, setDone] = useState(reduce ? N : 0);
  const [focal, setFocal] = useState(null); // {left,top,width,height,key}
  const [cap, setCap] = useState(reduce ? { label: "Stella is live", mode: "blue" } : { label: "Stella is setting up", mode: "blue" });

  const { fitRef, frameRef } = useFitScale(660, 1.06);
  const rowRefs = useRef([]);

  const focalFor = (i, key) => {
    const el = rowRefs.current[i];
    if (!el) return null;
    return { left: el.offsetLeft - 4, top: el.offsetTop - 4, width: el.offsetWidth + 8, height: el.offsetHeight + 8, key };
  };

  const loopRef = useInViewLoop(!reduce, async ({ wait, alive }) => {
    while (alive()) {
      // beat 0 — meet Stella
      setBeat(0); setDone(0); setFocal(null); setCap({ label: "Stella is setting up", mode: "blue" });
      await wait(T.meet); if (!alive()) break;
      // beats 1..N — one row completes per beat
      for (let b = 1; b <= N && alive(); b++) {
        const i = b - 1;
        setBeat(b); setCap({ label: STEPS[i], mode: "green" }); setDone(i);
        setFocal(focalFor(i, b));
        await wait(T.snap); if (!alive()) break;
        setDone(i + 1); // the row's check stamps green
        await wait(T.settle);
      }
      if (!alive()) break;
      // final — Stella is live
      setBeat(N + 1); setFocal(null); setDone(N); setCap({ label: "Stella is live", mode: "blue" });
      await wait(T.live);
    }
  });

  const live = beat === N + 1;

  return (
    <div className="ds-fit" ref={(n) => { fitRef.current = n; loopRef.current = n; }}>
      <div className="ds-root ds-root--scaf" ref={frameRef}>
        <AppWindow url="localhost:3000/onboarding" rail={false}>
          <div className="onb2-head">
            <img className="onb2-orb" src={ORB} alt="" aria-hidden data-breathe={beat === 0} data-live={live} />
            <Shimmer w="120px" h={10} r={5} />
          </div>

          <div className="onb2-list">
            {STEPS.map((s, i) => (
              <div className="onb2-row" key={s} ref={(el) => (rowRefs.current[i] = el)} data-done={i < done}>
                <span className="onb2-box">{i < done && <Check />}</span>
                <Shimmer w={BARS[i]} h={9} r={5} />
              </div>
            ))}
          </div>

          {focal && (
            <FocalOutline key={focal.key} variant="green" style={{ left: focal.left, top: focal.top, width: focal.width, height: focal.height }} />
          )}

          <Caption mode={cap.mode} label={cap.label} style={{ left: "50%", bottom: 18, transform: "translateX(-50%)" }} />
        </AppWindow>
      </div>
    </div>
  );
}
