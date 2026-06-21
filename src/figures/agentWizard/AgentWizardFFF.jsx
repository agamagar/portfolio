import { useRef, useState } from "react";
import { useReducedMotion, useFitScale, useInViewLoop } from "../ds/hooks";
import { AppWindow, Shimmer, FocalOutline, Caption, CountUp } from "../ds/Scaffold";
import "./fff.css";

// Agent-creation wizard as a CONCEPT animation (Frozen-Frame Focal). The builder
// UI is skeleton; the concept "intent -> a working agent that screens many CVs
// down to a ranked few" is the one lit thing per beat. Leans blue + the count.
// Storyline (numbers/labels) is placeholder — tune separately.

const CRITERIA = 4;
const ROWS = 6;
const ROW_BARS = [["62%", "40%"], ["55%", "36%"], ["66%", "44%"], ["50%", "33%"], ["60%", "38%"], ["57%", "42%"]];

export default function AgentWizardFFF() {
  const reduce = useReducedMotion();
  // beat: 0 new, 1 criteria, 2 candidates, 3 screening, 4 live
  const [beat, setBeat] = useState(reduce ? 4 : 0);
  const [critN, setCritN] = useState(reduce ? CRITERIA : 0);
  const [rowsIn, setRowsIn] = useState(reduce);
  const [count, setCount] = useState(reduce ? 42 : 0);
  const [countShow, setCountShow] = useState(reduce);
  const [countHero, setCountHero] = useState(reduce);
  const [narrowed, setNarrowed] = useState(reduce);
  const [live, setLive] = useState(reduce);
  const [topFocal, setTopFocal] = useState(null);
  const [cap, setCap] = useState(reduce ? { label: "Ranked · agent live", mode: "blue" } : { label: "New CV-screening agent", mode: "blue" });

  const { fitRef, frameRef } = useFitScale(660, 1.06);
  const rowRefs = useRef([]);

  const loopRef = useInViewLoop(!reduce, async ({ wait, alive }) => {
    while (alive()) {
      setBeat(0); setCritN(0); setRowsIn(false); setCount(0); setCountShow(false); setCountHero(false);
      setNarrowed(false); setLive(false); setTopFocal(null); setCap({ label: "New CV-screening agent", mode: "blue" });
      await wait(1000); if (!alive()) break;

      setBeat(1); setCap({ label: "Define what to evaluate", mode: "blue" });
      for (let i = 1; i <= CRITERIA && alive(); i++) { setCritN(i); await wait(320); }
      await wait(250); if (!alive()) break;

      setBeat(2); setRowsIn(true); setCountShow(true); setCount(480); setCap({ label: "Add candidates", mode: "blue" });
      await wait(1300); if (!alive()) break;

      setBeat(3); setCountHero(true); setCount(42); setCap({ label: "Screening 480 CVs", mode: "blue" });
      await wait(650); if (!alive()) break;
      setNarrowed(true);
      await wait(850); if (!alive()) break;

      setBeat(4); setLive(true); setCap({ label: "Ranked · agent live", mode: "blue" });
      const top = rowRefs.current[0];
      if (top) setTopFocal({ left: top.offsetLeft - 4, top: top.offsetTop - 4, width: top.offsetWidth + 8, height: top.offsetHeight + 8 });
      await wait(1600);
    }
  });

  return (
    <div className="ds-fit" ref={(n) => { fitRef.current = n; loopRef.current = n; }}>
      <div className="ds-root ds-root--scaf" ref={frameRef}>
        <AppWindow url="localhost:3000/agents/new" rail>
          <div className="aw2-head">
            <div className="aw2-title"><Shimmer w="150px" h={11} r={5} /><Shimmer w="92px" h={8} r={4} /></div>
            <div className="aw2-count" data-show={countShow} data-hero={countHero}>
              <CountUp className="aw2-count__n" value={count} />
              <span className="aw2-count__l">candidates</span>
            </div>
          </div>

          <div className="aw2-criteria">
            {Array.from({ length: CRITERIA }).map((_, i) => (
              <span className="aw2-chip" key={i} data-on={i < critN}>
                <span className="aw2-chip__dot" /><span className="aw2-chip__bar" />
              </span>
            ))}
          </div>

          <div className="aw2-list">
            {Array.from({ length: ROWS }).map((_, i) => (
              <div
                className="aw2-row" key={i} ref={(el) => (rowRefs.current[i] = el)}
                data-in={rowsIn} data-faint={narrowed && i >= 2} data-top={live && i === 0}
                style={{ transitionDelay: rowsIn ? `${i * 60}ms` : "0ms" }}
              >
                <span className="aw2-row__av" />
                <span className="aw2-row__bars"><Shimmer w={ROW_BARS[i][0]} h={7} r={4} /><Shimmer w={ROW_BARS[i][1]} h={6} r={3} /></span>
                <span className="aw2-row__score">{live && i === 0 ? "94" : ""}</span>
              </div>
            ))}
            {topFocal && <FocalOutline style={{ left: topFocal.left, top: topFocal.top, width: topFocal.width, height: topFocal.height }} />}
          </div>

          <Caption mode={cap.mode} label={cap.label} style={{ left: "50%", bottom: 16, transform: "translateX(-50%)" }} />
        </AppWindow>
      </div>
    </div>
  );
}
