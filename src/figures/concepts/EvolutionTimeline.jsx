import { useState } from "react";
import { useReducedMotion, useFitScale, useInViewLoop } from "../ds/hooks";
import { AppWindow, Shimmer, Caption } from "../ds/Scaffold";
import "./concepts.css";

// "How the use case evolved" — the product surface MORPHS through its evolution:
// a screening list -> a dashboard -> a holistic workspace -> a grid of agents
// running. Concept: the use case transforming form over time. (Per Agam's
// annotation.) Storyline/captions are placeholder.

const STATES = [
  { url: "localhost:3000/candidates", cap: "Started as a list" },
  { url: "localhost:3000/dashboard", cap: "Grew into a dashboard" },
  { url: "localhost:3000/workspace", cap: "Became one workspace" },
  { url: "localhost:3000/agents", cap: "Now: six agents, running", mode: "green" },
];
const RW = ["66%", "52%", "70%", "44%", "60%", "48%"];

const ListPane = ({ on }) => (
  <div className="ev2-pane" data-on={on}>
    <div className="ev2-search"><div className="ev2-searchbar" /><span className="ev2-chip" /><span className="ev2-chip" /></div>
    <div className="ev2-rows">
      {RW.map((w, i) => (
        <div className="ev2-row" key={i}><span className="ev2-av" /><div className="ev2-bars"><Shimmer w={w} h={6} r={3} /><Shimmer w="32%" h={5} r={3} /></div><Shimmer w={44} h={16} r={999} style={{ marginLeft: "auto" }} /></div>
      ))}
    </div>
  </div>
);

const DashPane = ({ on }) => (
  <div className="ev2-pane" data-on={on}>
    <div className="ev2-tiles">{[0, 1, 2].map((i) => (<div className="ev2-tile" key={i}><div className="ev2-tile__n" /><Shimmer w="72%" h={6} r={3} /></div>))}</div>
    <div className="ev2-chart" />
    <div className="ev2-rows">{["64%", "50%"].map((w, i) => (<div className="ev2-row" key={i}><span className="ev2-av" /><div className="ev2-bars"><Shimmer w={w} h={6} r={3} /></div></div>))}</div>
  </div>
);

const HolisticPane = ({ on }) => (
  <div className="ev2-pane" data-on={on}>
    <div className="ev2-holistic">
      <div className="ev2-panel ev2-panel--main">
        <Shimmer w="52%" h={9} r={4} /><Shimmer w="88%" h={6} r={3} /><Shimmer w="78%" h={6} r={3} />
        <div className="ev2-chart" style={{ flex: 1 }} />
      </div>
      <div className="ev2-panel ev2-panel--side">
        {["80%", "60%", "72%", "54%"].map((w, i) => (<Shimmer key={i} w={w} h={7} r={3} />))}
      </div>
    </div>
  </div>
);

const AgentsPane = ({ on }) => (
  <div className="ev2-pane" data-on={on}>
    <div className="ev2-grid">
      {Array.from({ length: 6 }).map((_, i) => (
        <div className="ev2-cell" key={i}>
          <span className="ev2-cell__live" />
          <Shimmer w="46%" h={6} r={3} />
          <span className="ev2-bub" /><span className="ev2-bub ev2-bub--r" /><span className="ev2-bub" />
        </div>
      ))}
    </div>
  </div>
);

export default function EvolutionTimeline() {
  const reduce = useReducedMotion();
  const [state, setState] = useState(reduce ? STATES.length - 1 : 0);
  const { fitRef, frameRef } = useFitScale(660, 1.06);

  const loopRef = useInViewLoop(!reduce, async ({ wait, alive }) => {
    while (alive()) {
      for (let s = 0; s < STATES.length && alive(); s++) {
        setState(s);
        await wait(s === STATES.length - 1 ? 2200 : 1800);
      }
    }
  });

  const st = STATES[state];

  return (
    <div className="ds-fit" ref={(n) => { fitRef.current = n; loopRef.current = n; }}>
      <div className="ds-root ds-root--scaf" ref={frameRef}>
        <AppWindow url={st.url} rail={false}>
          <ListPane on={state === 0} />
          <DashPane on={state === 1} />
          <HolisticPane on={state === 2} />
          <AgentsPane on={state === 3} />
          <Caption mode={st.mode || "blue"} label={st.cap} style={{ left: "50%", bottom: 14, transform: "translateX(-50%)" }} />
        </AppWindow>
      </div>
    </div>
  );
}
