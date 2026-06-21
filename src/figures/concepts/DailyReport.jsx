import { useRef, useState } from "react";
import { useReducedMotion, useFitScale, useInViewLoop } from "../ds/hooks";
import { AppWindow, Shimmer, FocalOutline, Caption } from "../ds/Scaffold";
import "./concepts.css";

// "The homepage is a daily report" — a generated briefing that writes itself in
// order of urgency: what's broken (red), what needs you (amber), what happened
// (green). Concept: a self-generating briefing with health signals.

const CARDS = [
  { tone: "red", label: "What's broken", lines: ["64%", "44%"] },
  { tone: "amber", label: "What needs you", lines: ["58%", "38%"] },
  { tone: "green", label: "What happened", lines: ["62%", "48%"] },
];

export default function DailyReport() {
  const reduce = useReducedMotion();
  const [beat, setBeat] = useState(reduce ? CARDS.length + 1 : 0);
  const [onCount, setOnCount] = useState(reduce ? CARDS.length : 0);
  const [focal, setFocal] = useState(null);
  const [cap, setCap] = useState(reduce ? { label: "Today's briefing", mode: "blue" } : { label: "Generating your briefing", mode: "blue" });

  const { fitRef, frameRef } = useFitScale(660, 1.06);
  const cardRefs = useRef([]);

  const loopRef = useInViewLoop(!reduce, async ({ wait, alive }) => {
    while (alive()) {
      setBeat(0); setOnCount(0); setFocal(null); setCap({ label: "Generating your briefing", mode: "blue" });
      await wait(1000); if (!alive()) break;
      for (let c = 0; c < CARDS.length && alive(); c++) {
        setBeat(c + 1); setCap({ label: CARDS[c].label, mode: CARDS[c].tone });
        const el = cardRefs.current[c];
        if (el) setFocal({ left: el.offsetLeft - 4, top: el.offsetTop - 4, width: el.offsetWidth + 8, height: el.offsetHeight + 8, variant: CARDS[c].tone, key: c });
        setOnCount(c + 1);
        await wait(1300);
      }
      if (!alive()) break;
      setBeat(CARDS.length + 1); setFocal(null); setCap({ label: "Today's briefing", mode: "blue" });
      await wait(1300);
    }
  });

  return (
    <div className="ds-fit" ref={(n) => { fitRef.current = n; loopRef.current = n; }}>
      <div className="ds-root ds-root--scaf" ref={frameRef}>
        <AppWindow url="localhost:3000/home" rail>
          <div className="cx-head"><div className="cx-title"><Shimmer w="160px" h={12} r={5} /><Shimmer w="96px" h={8} r={4} /></div></div>
          <div className="dr-list">
            {CARDS.map((c, i) => (
              <div className="dr-card" key={c.tone} ref={(el) => (cardRefs.current[i] = el)} data-tone={c.tone} data-on={i < onCount}>
                <span className="dr-strip" />
                <div className="dr-body"><Shimmer w={c.lines[0]} h={8} r={4} /><Shimmer w={c.lines[1]} h={7} r={4} /></div>
              </div>
            ))}
          </div>
          {focal && <FocalOutline key={focal.key} variant={focal.variant} style={{ left: focal.left, top: focal.top, width: focal.width, height: focal.height }} />}
          <Caption mode={cap.mode} label={cap.label} style={{ left: "50%", bottom: 16, transform: "translateX(-50%)" }} />
        </AppWindow>
      </div>
    </div>
  );
}
