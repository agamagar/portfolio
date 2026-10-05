import { useRef, useState } from "react";
import { useReducedMotion, useFitScale, useInViewLoop } from "../../figures/ds/hooks";
import { AppWindow, Shimmer, FocalOutline, Caption } from "../../figures/ds/Scaffold";
import "./wireframes.css";

// The interface map (Personas): five roles read the SAME job spine at four
// altitudes. FFF: four altitude cards; each lights in turn, showing what that
// role sees of one shared job. Ends with all four lit -> one job, four altitudes.
const ALT = [
  { role: "CEO", zoom: "The number", kind: "number" },
  { role: "CHRO", zoom: "All reqs", kind: "grid" },
  { role: "Recruiter", zoom: "My jobs", kind: "list" },
  { role: "Candidate", zoom: "My application", kind: "status" },
];

function AltBody({ kind }) {
  if (kind === "number") return (<div className="pa-num"><span className="pa-num__v">1</span><span className="pa-num__l">hire, on plan</span></div>);
  if (kind === "grid") return (<div className="pa-grid">{Array.from({ length: 6 }).map((_, i) => <span key={i} className="pa-cell" />)}</div>);
  if (kind === "list") return (<div className="pa-list">{Array.from({ length: 3 }).map((_, i) => (<div key={i} className="pa-row"><Shimmer w="58%" h={6} r={3} /><span className="pa-tag" /></div>))}</div>);
  return (<div className="pa-status"><span className="pa-step" data-done /><span className="pa-step" data-done /><span className="pa-step" data-now /><span className="pa-step" /></div>);
}

export default function PersonaAltitudes() {
  const reduce = useReducedMotion();
  const [active, setActive] = useState(reduce ? -1 : 0); // -1 => all lit (end state)
  const [cap, setCap] = useState(
    reduce ? { label: "One job, four altitudes", mode: "green" } : { label: "CEO altitude: the number", mode: "blue" }
  );
  const { fitRef, frameRef } = useFitScale(660, 1.06);
  const cardRefs = useRef([]);
  const [focal, setFocal] = useState(null);
  const stageRef = useRef(null);

  const lightCard = (i) => {
    const el = cardRefs.current[i];
    if (!el) return setFocal(null);
    let x = 0, y = 0, n = el, stop = stageRef.current;
    while (n && n !== stop) { x += n.offsetLeft; y += n.offsetTop; n = n.offsetParent; }
    setFocal({ left: x - 4, top: y - 4, width: el.offsetWidth + 8, height: el.offsetHeight + 8 });
  };

  const loopRef = useInViewLoop(!reduce, async ({ wait, alive }) => {
    while (alive()) {
      for (let i = 0; i < ALT.length; i++) {
        setActive(i); lightCard(i);
        setCap({ label: `${ALT[i].role} altitude: ${ALT[i].zoom.toLowerCase()}`, mode: "blue" });
        await wait(1150); if (!alive()) return;
      }
      setActive(-1); setFocal(null); setCap({ label: "One job, four altitudes", mode: "green" });
      await wait(1600); if (!alive()) return;
    }
  });

  return (
    <div className="ds-fit" ref={(n) => { fitRef.current = n; loopRef.current = n; }}>
      <div className="ds-root ds-root--scaf" ref={frameRef}>
        <AppWindow url="localhost:3000/jobs/senior-backend-engineer" rail={false}>
          <div className="pa-spinehint">One job: Senior Backend Engineer</div>
          <div className="pa-stage" ref={stageRef}>
            {ALT.map((a, i) => (
              <div
                className="pa-card"
                key={a.role}
                ref={(n) => (cardRefs.current[i] = n)}
                data-lit={active === -1 || active === i}
              >
                <div className="pa-card__head">
                  <span className="pa-card__role">{a.role}</span>
                  <span className="pa-card__zoom">{a.zoom}</span>
                </div>
                <AltBody kind={a.kind} />
              </div>
            ))}
            {focal && <FocalOutline style={{ left: focal.left, top: focal.top, width: focal.width, height: focal.height }} />}
          </div>
          <Caption mode={cap.mode} label={cap.label} style={{ left: "50%", bottom: 14, transform: "translateX(-50%)" }} />
        </AppWindow>
      </div>
    </div>
  );
}
