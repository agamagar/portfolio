import { useState } from "react";
import { useReducedMotion, useFitScale, useInViewLoop } from "../ds/hooks";
import "./awayAgent.css";

// Real screens from the Away "Search flow" board, exported from Figma (design
// mode, not coded SVG). The agent collects the brief as an ordered, card-by-card
// conversation; here the actual screens advance one after another, the way the
// composer morphs into each tappable question in turn.
const BASE = "/figures/away-agent/search-flow/";
const STATES = [
  { src: BASE + "state-1.png", label: "Home" },
  { src: BASE + "state-2.png", label: "New cart" },
  { src: BASE + "state-3.png", label: "Destination" },
  { src: BASE + "state-4.png", label: "Dates" },
  { src: BASE + "state-5.png", label: "Class" },
  { src: BASE + "state-6.png", label: "Passengers" },
];
const N = STATES.length;

export default function AwSearchFlow() {
  const reduce = useReducedMotion();
  const [i, setI] = useState(reduce ? 2 : 0);
  const { fitRef, frameRef } = useFitScale(360, 1);

  const loopRef = useInViewLoop(!reduce, async ({ wait, alive }) => {
    while (alive()) {
      for (let k = 0; k < N; k++) {
        setI(k);
        await wait(1900);
        if (!alive()) break;
      }
      await wait(700);
    }
  });

  return (
    <div className="ds-fit" ref={(n) => { fitRef.current = n; loopRef.current = n; }}>
      <div className="ds-root ds-root--away" ref={frameRef} style={{ width: 360 }}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16, fontFamily: "Inter, system-ui, sans-serif" }}>

          {/* one phone; the real screens crossfade one after another */}
          <div style={{
            position: "relative", width: 340, aspectRatio: "360 / 783",
            borderRadius: 30, overflow: "hidden", border: "1px solid #23232c",
            background: "#0a0a0e", boxShadow: "0 26px 64px -30px rgba(0,0,0,0.75)",
          }}>
            {STATES.map((s, k) => (
              <img
                key={k}
                src={s.src}
                alt={s.label}
                draggable={false}
                style={{
                  position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover",
                  opacity: i === k ? 1 : 0,
                  transform: i === k ? "none" : "scale(1.02)",
                  transition: "opacity .55s ease, transform .85s cubic-bezier(.2,.8,.2,1)",
                }}
              />
            ))}
          </div>

        </div>
      </div>
    </div>
  );
}
