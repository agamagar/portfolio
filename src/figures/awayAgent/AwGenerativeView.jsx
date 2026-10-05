import { useState, useRef, useEffect } from "react";
import { PhoneWindow } from "../ds/Scaffold";
import { useReducedMotion } from "../ds/hooks";
import { ISun, ISpark, ITrend, ISend } from "./icons";
import "./awayAgent.css";

// The one interactive surface in the Away PRD: a live recreation of the app's
// Generative View (features/generativeView). It is not a looping figure — the
// reader drives it. Tapping a prompt runs the generative pipeline in miniature:
// the cheap gate picks a build level for that request, the system "composes" for
// a beat, then streams a screen that is DIFFERENT per prompt from one engine —
// the whole point of the generative-UI system. Composed strictly from the same
// .aw-* / .ds-root--away language as every other Away figure.

const PROMPTS = [
  {
    id: "weekend",
    icon: "🏖️",
    title: "Plan a weekend",
    subtitle: "Somewhere warm, under ₹15k",
    // the gate's read on this request, surfaced so the mechanism is legible
    gate: "Rebuild",
    why: "options vary a lot",
  },
  {
    id: "cheapest",
    icon: "📉",
    title: "Cheapest week to fly",
    subtitle: "Delhi → anywhere",
    gate: "Fill a fixed screen",
    why: "one clear intent",
  },
  {
    id: "surprise",
    icon: "✨",
    title: "Surprise me",
    subtitle: "Pick a June trip",
    gate: "Pick from options",
    why: "low urgency, playful",
  },
];

// The composed "screen" the system streams for each request. Same engine, three
// shapes — a ranked warm-list, a price calendar, a single confident reveal.
function Composed({ id }) {
  if (id === "weekend") {
    const rows = [
      { ic: <ISun />, t: "Goa", s: "warm · nonstop 1h", val: "₹4,180" },
      { ic: <ISpark />, t: "Lisbon", s: "3-month low", val: "₹14,900" },
      { ic: <ITrend />, t: "Bali", s: "soft all month", val: "₹12,400" },
    ];
    return (
      <div className="aw-gen__screen">
        <p className="aw-eyebrow">Warm, under ₹15k</p>
        <div className="aw-disc" style={{ marginTop: 8 }}>
          {rows.map((d) => (
            <div className="aw-disc__row" key={d.t}>
              <span className="aw-disc__ic">{d.ic}</span>
              <span className="aw-disc__txt">
                <span className="aw-disc__t">{d.t}</span>
                <span className="aw-disc__s">{d.s}</span>
              </span>
              <span className="aw-disc__val">{d.val}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }
  if (id === "cheapest") {
    const weeks = [
      { w: "Jun 2", p: 62 },
      { w: "Jun 9", p: 41 },
      { w: "Jun 16", p: 100, hi: false },
      { w: "Jun 23", p: 33, hi: true },
      { w: "Jun 30", p: 78 },
    ];
    return (
      <div className="aw-gen__screen">
        <p className="aw-eyebrow">Delhi → anywhere · next 5 weeks</p>
        <div className="aw-gen__cal">
          {weeks.map((k) => (
            <div className="aw-gen__col" key={k.w} data-hi={!!k.hi}>
              <span className="aw-gen__bar" style={{ height: `${k.p}%` }} />
              <span className="aw-gen__wk">{k.w}</span>
            </div>
          ))}
        </div>
        <div className="aw-gen__pick">
          <span className="aw-gen__pick-dot" />
          Cheapest: <b>Jun 23</b> · from ₹3,290
        </div>
      </div>
    );
  }
  // surprise
  return (
    <div className="aw-gen__screen">
      <div className="aw-panel" data-tone="indigo" style={{ marginTop: 4 }}>
        <div className="aw-panel__head">
          <span className="aw-eyebrow">Your June surprise</span>
        </div>
        <div className="aw-gen__reveal">
          <span className="aw-gen__reveal-city">Udaipur</span>
          <span className="aw-gen__reveal-sub">
            Lake palaces, monsoon-green hills. 3 nights, nonstop.
          </span>
          <span className="aw-gen__reveal-fare">₹8,640 return · Jun 14–17</span>
        </div>
      </div>
    </div>
  );
}

export default function AwGenerativeView() {
  const reduce = useReducedMotion();
  const [draft, setDraft] = useState("");
  const [req, setReq] = useState(null); // the active prompt object
  const [phase, setPhase] = useState("idle"); // idle | composing | result
  const timer = useRef(null);

  const run = (p) => {
    setDraft(p.title);
    setReq(p);
    clearTimeout(timer.current);
    if (reduce) {
      setPhase("result");
    } else {
      setPhase("composing");
      timer.current = setTimeout(() => setPhase("result"), 1050);
    }
  };
  const reset = () => {
    clearTimeout(timer.current);
    setPhase("idle");
    setReq(null);
    setDraft("");
  };
  useEffect(() => () => clearTimeout(timer.current), []);

  return (
    <div className="ds-root ds-root--away aw-gen">
      <div className="aw-gen__stage">
        <PhoneWindow title="Generative View">
          <div className="aw-gen__col-fill">
            {/* Concierge card — the fixed frame the system streams into */}
            <div className="aw-gen__concierge">
              <div className="aw-gen__concierge-top">
                <span className="aw-gen__badge">✦</span>
                <span className="aw-gen__concierge-title">Away Concierge</span>
                <span className="aw-gen__concierge-tag">Generative preview</span>
              </div>

              {phase === "idle" && (
                <p className="aw-gen__concierge-body">
                  Ask me to plan, compare, or book a trip. Every element here is
                  composed live from the Away design system.
                </p>
              )}

              {phase === "composing" && (
                <div className="aw-gen__composing">
                  <span className="aw-gen__gatechip">
                    Gate: <b>{req.gate}</b> · {req.why}
                  </span>
                  <div className="aw-gen__sk">
                    <span className="aw-gen__sk-line" style={{ width: "58%" }} />
                    <span className="aw-gen__sk-line" style={{ width: "88%" }} />
                    <span className="aw-gen__sk-line" style={{ width: "72%" }} />
                  </div>
                  <span className="aw-gen__composing-cap">Composing screen…</span>
                </div>
              )}

              {phase === "result" && (
                <>
                  <span className="aw-gen__gatechip aw-gen__gatechip--done">
                    Gate chose <b>{req.gate.toLowerCase()}</b> · {req.why}
                  </span>
                  <Composed id={req.id} />
                  <button type="button" className="aw-gen__new" onClick={reset}>
                    ↺ New request
                  </button>
                </>
              )}
            </div>

            {/* Suggestions — only in the resting state */}
            {phase === "idle" && (
              <>
                <p className="aw-gen__try">TRY ASKING</p>
                <div className="aw-gen__suggest">
                  {PROMPTS.map((p) => (
                    <button
                      type="button"
                      key={p.id}
                      className="aw-gen__scard"
                      onClick={() => run(p)}
                    >
                      <span className="aw-gen__scard-ic">{p.icon}</span>
                      <span className="aw-gen__scard-t">{p.title}</span>
                      <span className="aw-gen__scard-s">{p.subtitle}</span>
                    </button>
                  ))}
                </div>
              </>
            )}

            <div style={{ flex: 1 }} />

            {/* Generative input dock */}
            <div className="aw-gen__dock">
              <span
                className={`aw-gen__input${draft ? " is-filled" : ""}`}
              >
                {draft || "Ask the concierge…"}
              </span>
              <span className="aw-gen__send" aria-hidden>
                <ISend />
              </span>
            </div>
          </div>
        </PhoneWindow>

        <aside className="aw-gen__note">
          <p className="aw-gen__note-h">One engine, many screens</p>
          <p className="aw-gen__note-p">
            Tap a prompt. A cheap gate first decides how much to build, then the
            system composes a screen for that request from registered blocks —
            different shape each time, same engine underneath.
          </p>
          <p className="aw-gen__note-foot">Live recreation · features/generativeView</p>
        </aside>
      </div>
    </div>
  );
}
