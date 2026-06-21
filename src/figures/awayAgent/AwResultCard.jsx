import { useState } from "react";
import { useReducedMotion, useFitScale, useInViewLoop } from "../ds/hooks";
import "./awayAgent.css";

// "Rendering a verdict, not a list." The results surface is an argument in layers.
// This figure renders one round-trip result card and walks the six layers in
// sequence (a numbered marker lights on each, with a legend on the right): trip
// shape, date frame, controls, the card, the negotiation win, and the why strip.

const ACC = "#3b82f6";
const LEGEND = [
  { t: "Trip shape", d: "one card, the whole round trip, paired and priced" },
  { t: "Date frame", d: "a price-by-date strip, only when you're flexible" },
  { t: "Controls", d: "the lens re-ranks; hard constraints filter" },
  { t: "The card", d: "facts, the agent's opinion, fine print on tap" },
  { t: "The win", d: "a modest, real edge on the OTAs, or an honest 'already the best price'" },
  { t: "The why", d: "one or two defensible signals, deeper on tap" },
];

function Mark({ n, on, active }) {
  return (
    <span aria-hidden style={{
      position: "absolute", right: -10, top: -9, width: 19, height: 19, borderRadius: 99,
      display: "grid", placeItems: "center", fontSize: 11, fontWeight: 700, color: "#fff",
      background: ACC, border: "2px solid #0a0a0e", zIndex: 5,
      opacity: on ? 1 : 0, transform: on ? (active ? "scale(1.18)" : "scale(1)") : "scale(0.4)",
      boxShadow: active ? `0 0 0 4px ${ACC}33` : "none",
      transition: "opacity .25s ease, transform .3s cubic-bezier(.2,.8,.2,1), box-shadow .25s",
    }}>{n}</span>
  );
}

const sec = (on) => ({ position: "relative", outline: on ? `1.5px solid ${ACC}` : "1.5px solid transparent", outlineOffset: 3, borderRadius: 12, transition: "outline-color .25s ease" });
const chip = (active) => ({ height: 26, padding: "0 11px", borderRadius: 999, fontSize: 11, display: "inline-flex", alignItems: "center", gap: 5, border: `1px solid ${active ? "#3b82f6" : "#2a2a34"}`, background: active ? "rgba(59,130,246,.16)" : "#17171f", color: active ? "#bcd6ff" : "#a6a6b2" });
const card = { background: "#17171f", border: "1px solid #20202a", borderRadius: 14, padding: 12 };

export default function AwResultCard() {
  const reduce = useReducedMotion();
  const [step, setStep] = useState(reduce ? 6 : 0);
  const { fitRef, frameRef } = useFitScale(720, 1);

  const loopRef = useInViewLoop(!reduce, async ({ wait, alive }) => {
    while (alive()) {
      setStep(0); await wait(700); if (!alive()) break;
      for (let i = 1; i <= 6; i++) { setStep(i); await wait(820); if (!alive()) break; }
      await wait(3400);
    }
  });
  const on = (n) => step >= n;
  const live = (n) => step === n;

  const dates = [
    { d: "30 Apr", p: "1,09k" }, { d: "1 May", p: "1,06k" },
    { d: "2 May", p: "1,02k", best: true }, { d: "3 May", p: "1,05k" },
  ];

  return (
    <div className="ds-fit" ref={(n) => { fitRef.current = n; loopRef.current = n; }}>
      <div className="ds-root ds-root--away" ref={frameRef}>
        <div style={{ background: "#0a0a0e", borderRadius: 20, padding: 22, display: "flex", gap: 26, alignItems: "flex-start", fontFamily: "Inter, system-ui, sans-serif" }}>

          {/* the result surface */}
          <div style={{ width: 360, display: "flex", flexDirection: "column", gap: 12, flex: "0 0 auto" }}>

            {/* 3 — controls */}
            <div style={sec(live(3))}>
              <Mark n={3} on={on(3)} active={live(3)} />
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                <span style={chip(true)}>For you</span>
                <span style={chip(false)}>Cheapest</span>
                <span style={chip(false)}>Fastest</span>
                <span style={{ ...chip(false), color: "#7f8aa0" }}>≤ 2 stops</span>
                <span style={{ ...chip(false), color: "#7f8aa0" }}>no Gulf hubs</span>
              </div>
            </div>

            {/* 2 — date frame */}
            <div style={sec(live(2))}>
              <Mark n={2} on={on(2)} active={live(2)} />
              <div style={{ display: "flex", gap: 6 }}>
                {dates.map((x) => (
                  <div key={x.d} style={{
                    flex: 1, textAlign: "center", padding: "7px 4px", borderRadius: 10,
                    border: `1px solid ${x.best ? "#3b82f6" : "#20202a"}`, background: x.best ? "rgba(59,130,246,.14)" : "#15151c",
                  }}>
                    <div style={{ fontSize: 10.5, color: "#a6a6b2" }}>{x.d}</div>
                    <div style={{ fontSize: 12, fontWeight: 500, color: x.best ? "#bcd6ff" : "#f4f4f6", marginTop: 2 }}>₹{x.p}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* 4 — the card (holds 1 trip shape + 5 the win) */}
            <div style={{ ...card, ...sec(live(4)) }}>
              <Mark n={4} on={on(4)} active={live(4)} />
              {/* header */}
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ width: 26, height: 26, borderRadius: 7, background: "#1a1a22", display: "grid", placeItems: "center", fontSize: 10, fontWeight: 600, color: "#a6a6b2" }}>6E</span>
                <span style={{ fontSize: 11, color: "#6f6f7e" }}>+ Delta · BLR ⇄ DTW</span>
                <span style={{ marginLeft: "auto", height: 21, padding: "0 8px", borderRadius: 6, fontSize: 10.5, fontWeight: 500, display: "inline-flex", alignItems: "center", background: "rgba(109,92,240,.16)", color: "#a99cf8" }}>best pick</span>
              </div>
              {/* 1 — trip shape: two legs */}
              <div style={{ ...sec(live(1)), marginTop: 10, display: "flex", flexDirection: "column", gap: 7 }}>
                <Mark n={1} on={on(1)} active={live(1)} />
                <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
                  <span style={{ fontSize: 9.5, color: "#6f6f7e", width: 30 }}>out</span>
                  <span style={{ fontSize: 12.5, fontWeight: 500, color: "#f4f4f6" }}>04:10 → 14:25</span>
                  <span style={{ fontSize: 10.5, color: "#6f6f7e" }}>1 stop · 23h45</span>
                </div>
                <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
                  <span style={{ fontSize: 9.5, color: "#6f6f7e", width: 30 }}>back</span>
                  <span style={{ fontSize: 12.5, fontWeight: 500, color: "#f4f4f6" }}>19:30 → 23:50 +1</span>
                  <span style={{ fontSize: 10.5, color: "#6f6f7e" }}>1 stop · 22h50</span>
                </div>
                <span style={{ fontSize: 10, color: "#5be3b3" }}>protected both ways · one PNR</span>
              </div>
              {/* 5 — the win */}
              <div style={{ ...sec(live(5)), marginTop: 10, display: "flex", alignItems: "center", gap: 9 }}>
                <Mark n={5} on={on(5)} active={live(5)} />
                <span style={{ fontSize: 12, color: "#6f6f7e", textDecoration: "line-through" }}>₹1,07,900</span>
                <span style={{ fontSize: 17, fontWeight: 600, color: "#f4f4f6" }}>₹1,04,900</span>
                <span style={{ marginLeft: "auto", fontSize: 10.5, color: "#5be3b3", textAlign: "right", lineHeight: 1.3 }}>₹3,000 under<br />the cheapest OTA</span>
              </div>
            </div>

            {/* 6 — the why */}
            <div style={{ ...sec(live(6)) }}>
              <Mark n={6} on={on(6)} active={live(6)} />
              <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 11px", background: "#101019", border: "1px solid #20202a", borderRadius: 10 }}>
                <span style={{ fontSize: 11, color: "#a6a6b2", flex: 1 }}>94% on-time · lands fresh, not a red-eye · the cheapest here hides a self-transfer</span>
                <span style={{ fontSize: 10.5, color: "#8b7cf6", whiteSpace: "nowrap" }}>why ›</span>
              </div>
            </div>
          </div>

          {/* the legend */}
          <div style={{ width: 286, flex: "0 0 auto", paddingTop: 2 }}>
            <p style={{ margin: "0 0 14px", fontSize: 10.5, letterSpacing: ".06em", textTransform: "uppercase", color: "#6f6f7e" }}>six layers of one argument</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 11 }}>
              {LEGEND.map((l, i) => {
                const n = i + 1, shown = on(n), active = live(n);
                return (
                  <div key={l.t} style={{ display: "flex", gap: 10, alignItems: "flex-start", opacity: shown ? 1 : 0.28, transition: "opacity .3s ease" }}>
                    <span style={{ width: 19, height: 19, borderRadius: 99, flex: "0 0 auto", display: "grid", placeItems: "center", fontSize: 11, fontWeight: 700, color: shown ? "#fff" : "#8a8a98", background: shown ? ACC : "#20202a", transform: active ? "scale(1.1)" : "scale(1)", transition: "background .25s, transform .25s" }}>{n}</span>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 500, color: "#f4f4f6" }}>{l.t}</div>
                      <div style={{ fontSize: 11.5, color: "#8a8a98", lineHeight: 1.45, marginTop: 1 }}>{l.d}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
