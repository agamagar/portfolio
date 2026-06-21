import { useRef, useState } from "react";
import { useReducedMotion, useFitScale, useInViewLoop } from "../ds/hooks";
import { AppWindow, Shimmer, FocalOutline, Caption, CountUp } from "../ds/Scaffold";
import "./concepts.css";

// "A design system that wrote its own code" — the Figma→React engine. A design
// frame on the left becomes production code on the right; a visual-diff score
// climbs to 100. Concept: design-to-code with a fidelity score (the craft moment).

const CODE = [
  { indent: 0, w: "46%" }, { indent: 16, w: "62%" }, { indent: 16, w: "52%" },
  { indent: 30, w: "44%" }, { indent: 16, w: "58%" }, { indent: 0, w: "32%" },
];

export default function FigmaToCode() {
  const reduce = useReducedMotion();
  const [beat, setBeat] = useState(reduce ? 3 : 0);
  const [codeIn, setCodeIn] = useState(reduce ? CODE.length : 0);
  const [score, setScore] = useState(reduce ? 100 : 0);
  const [scoreShow, setScoreShow] = useState(reduce);
  const [scoreMode, setScoreMode] = useState(reduce ? "green" : "blue");
  const [focal, setFocal] = useState(null);
  const [cap, setCap] = useState(reduce ? { label: "100% · production code", mode: "green" } : { label: "Figma frame", mode: "blue" });

  const { fitRef, frameRef } = useFitScale(660, 1.06);
  const splitRef = useRef(null);

  const loopRef = useInViewLoop(!reduce, async ({ wait, alive }) => {
    while (alive()) {
      setBeat(0); setCodeIn(0); setScore(0); setScoreShow(false); setScoreMode("blue"); setFocal(null); setCap({ label: "Figma frame", mode: "blue" });
      await wait(1100); if (!alive()) break;
      setBeat(1); setCodeIn(CODE.length); setCap({ label: "Generating React", mode: "blue" });
      await wait(1500); if (!alive()) break;
      setBeat(2); setScoreShow(true); setScore(100); setCap({ label: "Visual match", mode: "blue" });
      await wait(1100); if (!alive()) break;
      setBeat(3); setScoreMode("green"); setCap({ label: "100% · production code", mode: "green" });
      const el = splitRef.current;
      if (el) setFocal({ left: el.offsetLeft - 4, top: el.offsetTop - 4, width: el.offsetWidth + 8, height: el.offsetHeight + 8 });
      await wait(1600);
    }
  });

  return (
    <div className="ds-fit" ref={(n) => { fitRef.current = n; loopRef.current = n; }}>
      <div className="ds-root ds-root--scaf" ref={frameRef}>
        <AppWindow url="localhost:3000/build">
          <div className="cx-head"><div className="cx-title"><Shimmer w="150px" h={11} r={5} /><Shimmer w="90px" h={8} r={4} /></div></div>

          <div className="fc-split" ref={splitRef}>
            <div className="fc-pane fc-pane--design">
              <Shimmer w="68%" h={9} r={4} />
              <div style={{ display: "flex", gap: 8 }}><span className="fc-shape" style={{ flex: 1, height: 26 }} /><span className="fc-shape" style={{ flex: 1, height: 26 }} /></div>
              <Shimmer w="82%" h={7} r={4} /><Shimmer w="58%" h={7} r={4} />
              <span className="fc-shape" style={{ width: 58, height: 18, borderRadius: 999 }} />
            </div>
            <div className="fc-pane fc-pane--code">
              {CODE.map((l, i) => (
                <div className="fc-codeline" key={i} data-in={i < codeIn} style={{ paddingLeft: l.indent, transitionDelay: codeIn ? `${i * 70}ms` : "0ms" }}>
                  <span className="fc-dot" /><Shimmer w={l.w} h={6} r={3} />
                </div>
              ))}
            </div>
          </div>
          {focal && <FocalOutline variant="green" style={{ left: focal.left, top: focal.top, width: focal.width, height: focal.height }} />}

          <div className="fc-score" data-show={scoreShow} style={{ opacity: scoreShow ? 1 : 0, transition: "opacity var(--ds-dur-state) var(--ds-ease-out)" }}>
            <CountUp className="cx-num" value={score} dur={900} data-mode={scoreMode} /><span className="cx-numlabel">% visual match</span>
          </div>

          <Caption mode={cap.mode} label={cap.label} style={{ left: "50%", bottom: 14, transform: "translateX(-50%)" }} />
        </AppWindow>
      </div>
    </div>
  );
}
