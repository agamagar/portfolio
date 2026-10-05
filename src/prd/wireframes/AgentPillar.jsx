import { useRef, useState } from "react";
import { useReducedMotion, useFitScale, useInViewLoop } from "../../figures/ds/hooks";
import { AppWindow, Shimmer, FocalOutline, Caption, CountUp } from "../../figures/ds/Scaffold";
import "./wireframes.css";

// Parameterized agent-pillar wireframe (FFF). Every non-Screening agent follows
// the same shape: input -> the agent runs -> output + a metric. Configured per
// agent via `cfg`. Storyline (labels/numbers) is placeholder.
// cfg: { slug, name, inputLabel, outputLabel, metric:{value,label}, inN, outN }

export default function AgentPillar({ cfg }) {
  const reduce = useReducedMotion();
  // beat: 0 input in, 1 agent runs, 2 output + metric, 3 done
  const [beat, setBeat] = useState(reduce ? 3 : 0);
  const [count, setCount] = useState(reduce ? cfg.metric.value : 0);
  const [nodeFocal, setNodeFocal] = useState(null);
  const [cap, setCap] = useState(reduce ? { label: cfg.outputLabel, mode: "green" } : { label: cfg.inputLabel, mode: "blue" });

  const { fitRef, frameRef } = useFitScale(660, 1.06);
  const nodeRef = useRef(null);

  const loopRef = useInViewLoop(!reduce, async ({ wait, alive }) => {
    while (alive()) {
      setBeat(0); setCount(0); setNodeFocal(null); setCap({ label: cfg.inputLabel, mode: "blue" });
      await wait(1100); if (!alive()) break;
      setBeat(1); setCap({ label: `${cfg.name} agent running`, mode: "blue" });
      if (nodeRef.current) { const el = nodeRef.current; setNodeFocal({ left: el.offsetLeft - 4, top: el.offsetTop - 4, width: el.offsetWidth + 8, height: el.offsetHeight + 8 }); }
      await wait(1200); if (!alive()) break;
      setBeat(2); setNodeFocal(null); setCount(cfg.metric.value); setCap({ label: cfg.outputLabel, mode: "green" });
      await wait(1500);
    }
  });

  const inItems = Array.from({ length: cfg.inN || 4 });
  const outItems = Array.from({ length: cfg.outN || 3 });

  return (
    <div className="ds-fit" ref={(n) => { fitRef.current = n; loopRef.current = n; }}>
      <div className="ds-root ds-root--scaf" ref={frameRef}>
        <AppWindow url={`localhost:3000/${cfg.slug}`} rail={false}>
          <div className="ap-flow">
            <div className="ap-col">
              <div className="ap-coltag">Input</div>
              {inItems.map((_, i) => (
                <div className="ap-item" key={i} data-in={beat >= 0} style={{ transitionDelay: `${i * 60}ms` }}>
                  <span className="ap-av" /><Shimmer w="62%" h={6} r={3} />
                </div>
              ))}
            </div>

            <div className="ap-mid">
              <span className="ap-arrow" data-on={beat >= 1} />
              <div className="ap-node" ref={nodeRef} data-run={beat === 1}>
                <span className="ap-node__ic" />
                <span className="ap-node__name">{cfg.name}</span>
              </div>
              <span className="ap-arrow" data-on={beat >= 2} />
            </div>

            <div className="ap-col">
              <div className="ap-coltag">Output</div>
              {outItems.map((_, i) => (
                <div className="ap-item ap-item--out" key={i} data-in={beat >= 2} style={{ transitionDelay: `${i * 70}ms` }}>
                  <span className="ap-dot" /><Shimmer w="58%" h={6} r={3} />
                </div>
              ))}
              <div className="ap-metric" data-in={beat >= 2}>
                <CountUp className="ap-metric__n" value={count} dur={800} />
                <span className="ap-metric__l">{cfg.metric.label}</span>
              </div>
            </div>

            {nodeFocal && <FocalOutline style={{ left: nodeFocal.left, top: nodeFocal.top, width: nodeFocal.width, height: nodeFocal.height }} />}
          </div>
          <Caption mode={cap.mode} label={cap.label} style={{ left: "50%", bottom: 14, transform: "translateX(-50%)" }} />
        </AppWindow>
      </div>
    </div>
  );
}
