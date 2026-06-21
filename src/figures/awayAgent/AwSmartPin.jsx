import { useState, useRef, useEffect } from "react";
import { useReducedMotion, useFitScale, useInViewLoop } from "../ds/hooks";
import { PhoneWindow } from "../ds/Scaffold";
import { Rail } from "./Rail";
import "./awayAgent.css";

// "One chat does everything, so the chat needs a map." Away runs the whole trip
// inside a single conversation, so the thread fills with very different outputs.
// A smart pin at the top (the WhatsApp pinned-message pattern, but agent-managed)
// always points at the output that matters now and jumps you straight to it:
// your live negotiation while shopping, your booking once you commit, the
// boarding pass on the day.

const PINS = [
  { label: "Your negotiation", sub: "BOM to GOI · vetted, best of 8", target: "neg", dot: "#6d5cf0" },
  { label: "Your booking", sub: "6E 2014 · confirmed", target: "book", dot: "#34d399" },
  { label: "Boarding pass", sub: "Gate 24 · boards 17:40", target: "pass", dot: "#3b82f6" },
];

const STEPS = [
  { t: "One chat, every output", s: "Search, negotiation, booking, pass" },
  { t: "Pinned: your negotiation", s: "While you are still shopping" },
  { t: "Pinned: your booking", s: "The pin follows the trip state" },
  { t: "Pinned: boarding pass", s: "One tap jumps you there" },
];

function Pin() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 17v5" /><path d="M9 10.76a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24V16a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-.76a2 2 0 0 0-1.11-1.79l-1.78-.9A2 2 0 0 1 15 10.76V7a1 1 0 0 1 1-1 2 2 0 0 0 0-4H8a2 2 0 0 0 0 4 1 1 0 0 1 1 1z" />
    </svg>
  );
}

const card = { background: "#17171f", border: "1px solid #20202a", borderRadius: 13, padding: "10px 12px" };
const msg = { background: "#15151c", borderRadius: 12, borderBottomLeftRadius: 4, padding: "8px 11px", fontSize: 12, color: "#a6a6b2", maxWidth: "86%", lineHeight: 1.4 };

export default function AwSmartPin() {
  const reduce = useReducedMotion();
  const [beat, setBeat] = useState(reduce ? 3 : 0);
  const { fitRef, frameRef } = useFitScale(660, 1.06);
  const scrollRef = useRef(null);
  const refs = { neg: useRef(null), book: useRef(null), pass: useRef(null) };

  const loopRef = useInViewLoop(!reduce, async ({ wait, alive }) => {
    while (alive()) {
      setBeat(0); await wait(1500); if (!alive()) break;
      setBeat(1); await wait(2100); if (!alive()) break;
      setBeat(2); await wait(2100); if (!alive()) break;
      setBeat(3); await wait(2100);
    }
  });

  // The pin jumps the thread: scroll the active output to just under the pin bar.
  const pinIdx = Math.max(0, beat - 1);
  const pin = PINS[pinIdx];
  useEffect(() => {
    const c = scrollRef.current;
    const t = beat === 0 ? null : refs[pin.target].current;
    if (!c) return;
    c.style.scrollBehavior = reduce ? "auto" : "smooth";
    c.scrollTop = t ? Math.max(0, t.offsetTop - 6) : 0;
  }, [beat, reduce]); // eslint-disable-line

  const hot = (k) => beat !== 0 && pin.target === k;
  const ring = (k) => hot(k)
    ? { borderColor: PINS[pinIdx].dot, boxShadow: `0 0 0 3px ${PINS[pinIdx].dot}28` }
    : {};

  return (
    <div className="ds-fit" ref={(n) => { fitRef.current = n; loopRef.current = n; }}>
      <div className="ds-root ds-root--away" ref={frameRef}>
        <div className="aw-stage">
          <PhoneWindow title="Away">
            <div style={{ display: "flex", flexDirection: "column", height: "100%", gap: 8 }}>

              {/* the smart pin bar */}
              <div style={{
                display: "flex", alignItems: "center", gap: 10, padding: "8px 11px",
                background: "#101019", border: "1px solid #23232e", borderRadius: 12,
                borderLeft: `3px solid ${beat === 0 ? "#34343f" : pin.dot}`, flex: "0 0 auto",
                opacity: beat === 0 ? 0.6 : 1, transition: "opacity .3s, border-color .3s",
              }}>
                <span style={{ color: beat === 0 ? "#6f6f7e" : pin.dot, display: "grid", placeItems: "center", transition: "color .3s" }}><Pin /></span>
                <div style={{ display: "flex", flexDirection: "column", gap: 1, minWidth: 0, flex: 1 }}>
                  <span style={{ fontSize: 9, letterSpacing: ".06em", textTransform: "uppercase", color: "#6f6f7e" }}>Pinned</span>
                  <span style={{ fontSize: 12.5, fontWeight: 500, color: "#f4f4f6", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                    {beat === 0 ? "Nothing pinned yet" : pin.label}
                  </span>
                </div>
                <span style={{ fontSize: 10.5, color: "#8a8a98", flex: "0 0 auto" }}>{beat === 0 ? "" : pin.sub}</span>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#6f6f7e" strokeWidth="2.4" style={{ flex: "0 0 auto" }}><path d="M9 6l6 6-6 6" /></svg>
              </div>

              {/* the one long thread of mixed outputs */}
              <div ref={scrollRef} style={{ flex: 1, overflow: "hidden", display: "flex", flexDirection: "column", gap: 9, paddingRight: 2 }}>
                <div style={msg}>Found 8 on your dates. Here is the shortlist worth your time.</div>

                <div style={{ ...card }}>
                  <div style={{ fontSize: 12.5, fontWeight: 500, color: "#f4f4f6" }}>8 flights · 3 worth your time</div>
                  <div style={{ fontSize: 11, color: "#8a8a98", marginTop: 3 }}>sorted by what is right, the trap flagged</div>
                </div>

                <div ref={refs.neg} style={{ ...card, ...ring("neg"), transition: "box-shadow .3s, border-color .3s" }}>
                  <div style={{ fontSize: 12.5, fontWeight: 500, color: "#f4f4f6" }}>Negotiated · BOM to GOI</div>
                  <div style={{ fontSize: 11, color: "#8a8a98", marginTop: 3 }}>vetted best of 8 · Rs 180 under the cheapest OTA</div>
                </div>

                <div style={msg}>Watching this fare, I'll ping you if it moves.</div>
                <div style={msg}>Locked it in. You are going to Goa.</div>

                <div ref={refs.book} style={{ ...card, ...ring("book"), transition: "box-shadow .3s, border-color .3s" }}>
                  <div style={{ fontSize: 12.5, fontWeight: 500, color: "#f4f4f6" }}>Goa · 6E 2014 · confirmed</div>
                  <div style={{ fontSize: 11, color: "#8a8a98", marginTop: 3 }}>protected connection · PNR XKZ4P9</div>
                </div>

                <div style={msg}>Passport and visa check passed, you're clear.</div>
                <div style={msg}>Checked you in. Leave by 15:50 for the airport.</div>

                <div ref={refs.pass} style={{ ...card, ...ring("pass"), transition: "box-shadow .3s, border-color .3s" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                    <div style={{ fontSize: 12.5, fontWeight: 500, color: "#f4f4f6" }}>Boarding pass</div>
                    <div style={{ fontSize: 11, color: "#8a8a98" }}>Gate 24</div>
                  </div>
                  <div style={{ fontSize: 11, color: "#8a8a98", marginTop: 3 }}>BOM 17:40 · boards 17:10 · seat 14C</div>
                </div>
              </div>

            </div>
          </PhoneWindow>
          <Rail cap="Design states" steps={STEPS} active={beat} done={new Set([0, 1, 2].filter((i) => i < beat))} />
        </div>
      </div>
    </div>
  );
}
