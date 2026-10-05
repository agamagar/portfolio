import { useState } from "react";
import { useReducedMotion, useFitScale, useInViewLoop } from "../../figures/ds/hooks";
import { AppWindow, FocalOutline, Caption } from "../../figures/ds/Scaffold";
import "./wireframes.css";

// The wedge (Overview): recruiting today is stitched by hand across disconnected
// tools; Dassh collapses them into one teammate. FFF: scattered tool tiles ->
// the gaps between them -> the tiles merge into a single Stella card.
const TOOLS = [
  { label: "ATS", x: 18, y: 14 },
  { label: "Sheets", x: 196, y: 4 },
  { label: "WhatsApp", x: 384, y: 20 },
  { label: "Email", x: 40, y: 138 },
  { label: "Calendar", x: 224, y: 152 },
  { label: "Notes", x: 400, y: 140 },
];
const CENTER = { x: 250, y: 78 }; // top-left of the unified card in stage coords

export default function OverviewWedge() {
  const reduce = useReducedMotion();
  // beat: 0 tools, 1 gaps, 2 merge, 3 one teammate
  const [beat, setBeat] = useState(reduce ? 3 : 0);
  const [cap, setCap] = useState(
    reduce ? { label: "One teammate across the whole desk", mode: "green" } : { label: "The recruiter's desk today", mode: "blue" }
  );
  const [focal, setFocal] = useState(null);
  const { fitRef, frameRef } = useFitScale(660, 1.06);

  const loopRef = useInViewLoop(!reduce, async ({ wait, alive }) => {
    while (alive()) {
      setBeat(0); setFocal(null); setCap({ label: "The recruiter's desk today", mode: "blue" });
      await wait(1200); if (!alive()) break;
      setBeat(1); setCap({ label: "Handoffs fall through the gaps", mode: "amber" });
      setFocal({ variant: "amber", left: 8, top: 0, width: 560, height: 210 });
      await wait(1500); if (!alive()) break;
      setBeat(2); setFocal(null); setCap({ label: "Collapse the stack into one teammate", mode: "blue" });
      await wait(1300); if (!alive()) break;
      setBeat(3); setCap({ label: "One teammate across the whole desk", mode: "green" });
      setFocal({ variant: "green", left: CENTER.x - 6, top: CENTER.y - 6, width: 172, height: 108 });
      await wait(1800);
    }
  });

  const merged = beat >= 2;
  const cardCX = CENTER.x + 80, cardCY = CENTER.y + 48;

  return (
    <div className="ds-fit" ref={(n) => { fitRef.current = n; loopRef.current = n; }}>
      <div className="ds-root ds-root--scaf" ref={frameRef}>
        <AppWindow url="localhost:3000" rail={false}>
          <div className="ow-stage">
            {TOOLS.map((t) => (
              <div
                className="ow-tile"
                key={t.label}
                data-merged={merged}
                style={
                  merged
                    ? { left: t.x, top: t.y, transform: `translate(${cardCX - t.x - 44}px, ${cardCY - t.y - 16}px) scale(.55)`, opacity: 0 }
                    : { left: t.x, top: t.y }
                }
              >
                <span className="ow-tile__ic" />
                <span className="ow-tile__lbl">{t.label}</span>
              </div>
            ))}

            <div className="ow-card" data-show={merged} style={{ left: CENTER.x, top: CENTER.y }}>
              <span className="ow-card__orb" />
              <span className="ow-card__name">Stella</span>
              <span className="ow-card__sub">Hiring teammate</span>
            </div>

            {focal && <FocalOutline variant={focal.variant} style={{ left: focal.left, top: focal.top, width: focal.width, height: focal.height }} />}
          </div>
          <Caption mode={cap.mode} label={cap.label} style={{ left: "50%", bottom: 14, transform: "translateX(-50%)" }} />
        </AppWindow>
      </div>
    </div>
  );
}
