import { useRef, useState } from "react";
import { useReducedMotion, useFitScale, useInViewLoop } from "../../figures/ds/hooks";
import { AppWindow, Shimmer, FocalOutline, Caption } from "../../figures/ds/Scaffold";
import "./wireframes.css";

// "Show the job, not the machine" (design challenge). The same surface reframes
// from an agent-organised board (the machine) to a job-organised board (what the
// user actually asks: how is my job doing?). FFF: cross-fade two layers, the
// segmented control flips Agents -> Jobs, caption names each beat.
const AGENTS = ["Screening", "Calling", "Interview"];
const JOBS = [
  { title: "Senior Backend Engineer", status: "On track", tone: "green" },
  { title: "Product Designer", status: "Needs you", tone: "amber" },
  { title: "Sales Development Rep", status: "Stalled", tone: "red" },
];

export default function DashboardChallenge() {
  const reduce = useReducedMotion();
  // beat: 0 machine, 1 machine+problem, 2 jobs, 3 jobs+arrival
  const [beat, setBeat] = useState(reduce ? 3 : 0);
  const [cap, setCap] = useState(
    reduce ? { label: "Job-first: how is my job doing?", mode: "green" } : { label: "Organised by agent", mode: "blue" }
  );
  const [focal, setFocal] = useState(null);

  const { fitRef, frameRef } = useFitScale(660, 1.06);
  const stageRef = useRef(null);
  const machineRef = useRef(null);
  const jobRowRef = useRef(null);

  // box of `el` in `.dc-stage` coords (scale-independent; walks offsetParents),
  // padded out by 4px for the focal ring.
  const focalBox = (el, variant) => {
    let x = 0, y = 0, n = el, stop = stageRef.current;
    while (n && n !== stop) { x += n.offsetLeft; y += n.offsetTop; n = n.offsetParent; }
    return { variant, left: x - 4, top: y - 4, width: el.offsetWidth + 8, height: el.offsetHeight + 8 };
  };

  const loopRef = useInViewLoop(!reduce, async ({ wait, alive }) => {
    while (alive()) {
      setBeat(0); setFocal(null); setCap({ label: "Organised by agent", mode: "blue" });
      await wait(1200); if (!alive()) break;
      setBeat(1); setCap({ label: "But nobody asks 'how's my agent?'", mode: "red" });
      if (machineRef.current) setFocal(focalBox(machineRef.current, "red"));
      await wait(1500); if (!alive()) break;
      setBeat(2); setFocal(null); setCap({ label: "Reframe around the job", mode: "blue" });
      await wait(1200); if (!alive()) break;
      setBeat(3); setCap({ label: "Job-first: how is my job doing?", mode: "green" });
      if (jobRowRef.current) setFocal(focalBox(jobRowRef.current, "green"));
      await wait(1700);
    }
  });

  const showJobs = beat >= 2;

  return (
    <div className="ds-fit" ref={(n) => { fitRef.current = n; loopRef.current = n; }}>
      <div className="ds-root ds-root--scaf" ref={frameRef}>
        <AppWindow url="localhost:3000/dashboard" rail={false}>
          <div className="dc-head">
            <span className="dc-seg" data-on={showJobs ? "jobs" : "agents"}>
              <span className="dc-seg__pill" />
              <span className="dc-seg__opt">Agents</span>
              <span className="dc-seg__opt">Jobs</span>
            </span>
          </div>

          <div className="dc-stage" ref={stageRef}>
            {/* machine layer: columns of agents */}
            <div className="dc-layer dc-machine" data-show={!showJobs} ref={machineRef}>
              {AGENTS.map((a) => (
                <div className="dc-agcol" key={a}>
                  <div className="dc-agcol__tag">{a}</div>
                  <div className="dc-chip"><span className="dc-av" /><Shimmer w="60%" h={6} r={3} /></div>
                  <div className="dc-chip"><span className="dc-av" /><Shimmer w="72%" h={6} r={3} /></div>
                  <div className="dc-chip"><span className="dc-av" /><Shimmer w="52%" h={6} r={3} /></div>
                </div>
              ))}
            </div>

            {/* job layer: rows of jobs, agents demoted to chips */}
            <div className="dc-layer dc-jobs" data-show={showJobs}>
              {JOBS.map((j, i) => (
                <div className="dc-job" key={j.title} ref={i === 1 ? jobRowRef : null}>
                  <span className="dc-job__title">{j.title}</span>
                  <span className="dc-job__agents"><i /><i /><i /></span>
                  <span className="dc-job__status" data-tone={j.tone}>{j.status}</span>
                </div>
              ))}
            </div>

            {focal && <FocalOutline variant={focal.variant} style={{ left: focal.left, top: focal.top, width: focal.width, height: focal.height }} />}
          </div>

          <Caption mode={cap.mode} label={cap.label} style={{ left: "50%", bottom: 14, transform: "translateX(-50%)" }} />
        </AppWindow>
      </div>
    </div>
  );
}
