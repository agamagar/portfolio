import { useState } from "react";
import { useReducedMotion, useFitScale, useInViewLoop } from "../ds/hooks";
import "./awayAgent.css";

// "A real brief, untangled." A verbatim message from a test run carries eleven
// separate constraints at once. The agent scans it and pointer-highlights each
// requirement in turn (the highlight rectangle drawn + a pointer to the corner,
// the shadcn PointerHighlight effect re-implemented in this kit, CSS-only and
// reduced-motion-safe), while the structured brief fills in on the right. The
// point: a messy, all-at-once request is never a worse path than tidy cards.

const ACCENT = "#3b82f6";

// Inline highlight that flows with the running paragraph and wraps across lines
// (box-decoration-break clones the box/border onto each line fragment), instead
// of an inline-block unit that can't break and rags the paragraph.
function Mark({ on, children }) {
  return (
    <span style={{
      display: "inline",
      WebkitBoxDecorationBreak: "clone",
      boxDecorationBreak: "clone",
      borderRadius: 5,
      padding: "0.5px 3px",
      margin: "0 -1px",
      color: on ? "#eaf1ff" : "inherit",
      background: on ? "rgba(59,130,246,0.16)" : "transparent",
      boxShadow: on ? `inset 0 0 0 1.5px ${ACCENT}` : "inset 0 0 0 1.5px transparent",
      transition: "color .2s ease, background .2s ease, box-shadow .25s ease",
    }}>
      {children}
    </span>
  );
}

const BRIEF = [
  { k: "Passengers", v: "3 adults" },
  { k: "Route", v: "BLR → DTW" },
  { k: "Origin flex", v: "or BOM, if cheaper" },
  { k: "Arrival flex", v: "or ORD, if cheaper" },
  { k: "Dates", v: "1–16 May" },
  { k: "Date flex", v: "± 2 days" },
  { k: "Fare", v: "Lite · 1 bag each" },
  { k: "Avoid", v: "Gulf carriers + hubs" },
  { k: "Stops", v: "1, up to 2" },
  { k: "Max time", v: "≤ 27h total" },
  { k: "Transit visa", v: "none required" },
];
const N = BRIEF.length;

export default function AwIntakeBrief() {
  const reduce = useReducedMotion();
  const [step, setStep] = useState(reduce ? N : 0);
  const { fitRef, frameRef } = useFitScale(880, 1);

  const loopRef = useInViewLoop(!reduce, async ({ wait, alive }) => {
    while (alive()) {
      setStep(0); await wait(850); if (!alive()) break;
      for (let i = 1; i <= N; i++) { setStep(i); await wait(600); if (!alive()) break; }
      await wait(3000);
    }
  });

  // two free-standing black boxes; no enclosing frame, so the streaming line
  // bridges the open gap between them rather than sitting inside one box
  const card = { background: "#0b0b0f", border: "1px solid #20202a", borderRadius: 16, padding: "16px 18px" };
  const head = { fontSize: 10.5, letterSpacing: ".06em", textTransform: "uppercase", color: "#6f6f7e", margin: "0 0 12px" };

  return (
    <div className="ds-fit" ref={(n) => { fitRef.current = n; loopRef.current = n; }}>
      <div className="ds-root ds-root--away" ref={frameRef} style={{ width: 880 }}>
        <div style={{ display: "flex", justifyContent: "center" }}>
          <div style={{ width: 880, display: "flex", gap: 0, alignItems: "stretch", fontFamily: "Inter, system-ui, sans-serif" }}>

            {/* the verbatim message — a self-contained box, heading inside */}
            <div style={{ ...card, flex: "1 1 0", minWidth: 0 }}>
              <p style={head}>What the user asked</p>
              <p style={{ margin: 0, fontSize: 14.5, lineHeight: 1.85, color: "#cbcbd4" }}>
                I want to book travel to the US for <Mark on={step >= 1}>3 of us</Mark>, <Mark on={step >= 2}>BLR to Detroit</Mark>, though <Mark on={step >= 3}>Mumbai departure is also ok if cost is lower</Mark> and <Mark on={step >= 4}>Chicago arrival is also fine for cost</Mark>. Ideal dates are <Mark on={step >= 5}>May 1st to May 16th</Mark> with <Mark on={step >= 6}>1-2 days flexibility on both sides</Mark> for cost reasons. I don't need much luggage so <Mark on={step >= 7}>lite fare class, one baggage each</Mark> is fine. I would prefer <Mark on={step >= 8}>avoiding gulf based carriers or transit points</Mark>, and <Mark on={step >= 9}>one stop but can consider 2 stops</Mark> as long as total travel time is <Mark on={step >= 10}>within 26-27 hrs</Mark> and there is <Mark on={step >= 11}>no visa need</Mark>.
              </p>
            </div>

            {/* the streaming line, flush between the two boxes */}
            <div className="aw-intake-stream" style={{ alignSelf: "center", width: 64 }} />

            {/* the structured brief building — a self-contained box, heading inside */}
            <div style={{ ...card, width: 312, flex: "0 0 auto" }}>
              <p style={head}>What the agent understood</p>
              <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
                {BRIEF.map((b, i) => {
                  const shown = step >= i + 1;
                  return (
                    <div key={b.k} style={{
                      display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10,
                      padding: "7px 11px", background: "#17171f", border: "1px solid #20202a", borderRadius: 9,
                      opacity: shown ? 1 : 0.12, transform: shown ? "none" : "translateY(4px)",
                      transition: "opacity .3s ease, transform .3s cubic-bezier(.2,.8,.2,1)",
                    }}>
                      <span style={{ fontSize: 10.5, color: "#8a8a98", flex: "0 0 auto" }}>{b.k}</span>
                      <span style={{ fontSize: 12.5, fontWeight: 500, color: "#f4f4f6", textAlign: "right" }}>{b.v}</span>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
