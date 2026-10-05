import { useState, useRef } from "react";
import { useReducedMotion, useFitScale, useInViewLoop } from "../ds/hooks";
import "./awayAgent.css";

// "Fares are verdicts, not products." A flight is chosen first; its TICKET
// STRUCTURE (one ticket / codeshare / self-transfer) is a highlighted parameter
// of the FLIGHT, not a fare category. The fare TYPES are pure value variations.
// Two variations are kept, switchable by the top toggle:
//   Cards , the verdict view (flight header + structure, then a tabbed detailed
//           card per fare type: badge, all-in + source, attribute strip, trap
//           ledger, catch).
//   List  , the shipped layout (the chosen flight, then the fares stacked one
//           below the other), rebuilt from the Figma design.

/* ---------- Cards view palette (awayAgent) ---------- */
const C = {
  bg: "#0a0a0e", card: "#15151c", head: "#12121a", line: "#22222c", text: "#f4f4f6",
  muted: "#a6a6b2", dim: "#6f6f7e",
  good: "#5be3b3", warn: "#e6b45e", bad: "#ef6d5a", info: "#5b9cf0", accent: "#8b7cf6",
};
const tone = (t) => ({ good: C.good, warn: C.warn, bad: C.bad, info: C.info, accent: C.accent, ok: C.dim }[t] || C.dim);

const FLIGHT = {
  route: "BLR → LHR", meta: "1 stop · via DXB · 14h 45m",
  airline: "Emirates · EK 568 + EK 003", times: "04:10 BLR  →  09:25 LHR +1",
  structure: [
    { k: "one", label: "One ticket", tone: "good" },
    { k: "code", label: "Codeshare", tone: "warn" },
    { k: "self", label: "Self-transfer", tone: "bad" },
  ],
  activeStructure: "one",
  structureLine: "Protected end to end. A missed connection is the airline's problem, not yours.",
  note: "A ₹49,900 self-transfer exists on this route. It is flagged in red, never the default.",
};

const FARES = [
  { tab: "Best value", status: "BEST VALUE", t: "good", tag: "recommended", price: "₹56,800", source: "Constructed rate", savings: "₹1,600 under the cheapest OTA",
    atoms: [{ k: "Bag", v: "1 pc · 23kg", t: "good" }, { k: "Cancellation", v: "Fee from ₹4,000", t: "ok" }, { k: "Seat", v: "Included", t: "good" }, { k: "Source", v: "Constructed", t: "ok" }],
    trap: [], catch: "A little above the bare sticker, because the bag and seat are already in, not waiting to ambush you at checkout." },
  { tab: "Cheapest", status: "HONEST CHEAP", t: "good", price: "₹54,900", source: "Constructed rate",
    atoms: [{ k: "Bag", v: "1 pc · 15kg", t: "ok" }, { k: "Cancellation", v: "Fee from ₹4,500", t: "ok" }, { k: "Seat", v: "Paid", t: "warn" }, { k: "Source", v: "Constructed", t: "ok" }],
    trap: [], catch: "It rejected a ₹49,900 hand-baggage-only row. The gap is a checked bag and a seat, the price of not getting stranded." },
  { tab: "Bare", status: "BARE, UNMASKED", t: "bad", price: "₹49,900", source: "Public rate", madeWhole: "₹56,400 once a bag and seat are added back",
    atoms: [{ k: "Bag", v: "Cabin only", t: "bad" }, { k: "Cancellation", v: "None", t: "bad" }, { k: "Seat", v: "None", t: "bad" }, { k: "Source", v: "Public", t: "ok" }],
    trap: ["No checked bag; adding one takes it to ₹56,400 all-in", "Non-refundable, no changes at all"],
    catch: "Add the bag and seat back and the honest all-in meets the best-value fare. The cheap number was never the price you'd pay." },
  { tab: "Low cancellation", status: "MOVABLE", t: "info", price: "₹66,000", source: "Public rate", delta: "+₹9,200 for freedom",
    atoms: [{ k: "Bag", v: "2 pc · 30kg", t: "good" }, { k: "Cancellation", v: "Free change + refund", t: "good" }, { k: "Seat", v: "Included", t: "good" }, { k: "Source", v: "Public", t: "ok" }],
    trap: [], catch: "You pay ₹9,200 over the best-value fare for freedom you may never use. Worth it only if the trip is genuinely uncertain." },
  { tab: "High luggage", status: "LOADED", t: "good", price: "₹60,200", source: "Constructed rate", delta: "+₹3,400 for 60kg",
    atoms: [{ k: "Bag", v: "2 pc · 30kg", t: "good" }, { k: "Cancellation", v: "Fee from ₹4,000", t: "ok" }, { k: "Seat", v: "Included", t: "good" }, { k: "Source", v: "Constructed", t: "ok" }],
    trap: [], catch: "Beats the base fare plus five paid bags once the bag math is shown, and it is all through-checked on one ticket." },
  { tab: "Cabin step-up", status: "BUSINESS", t: "accent", price: "₹1,42,000", source: "Public rate", delta: "the occasion upgrade",
    atoms: [{ k: "Cabin", v: "Business, lie-flat", t: "good" }, { k: "Bag", v: "2 pc · 40kg", t: "good" }, { k: "Seat", v: "Lie-flat", t: "good" }, { k: "Extras", v: "Lounge", t: "good" }],
    trap: [], catch: "A real lie-flat, not a recliner, so the money buys sleep on the overnight. On a short hop it would not be worth it." },
  { tab: "Series fare", status: "SERIES FARE", subStatus: "group booking", t: "warn", price: "₹47,400", source: "Constructed rate",
    seriesLine: "A group fare: your seat is held now, and your ticket number arrives in the last 24 hours before you fly. That is normal for this fare, not a problem.",
    timeline: [
      { when: "Now", what: "Your seat is confirmed inside the group booking and your payment is held. You will not see a PNR yet, and that is expected." },
      { when: "48 to 72h out", what: "We lock your passenger details with the airline, so your exact passport name is due before then." },
      { when: "Last 24 hours", what: "The airline releases your PNR and ticket number. We issue it and ping you the moment it is in hand, in time to check in." },
    ],
    trap: [], catch: "A group fare is cheaper for a reason: the PNR comes late and changes are limited. If your plans are firm it is a real saving; if they might move, pick a movable fare instead." },
];

/* ---------- List view palette + data (rebuilt from the Figma design) ---------- */
const L = { bg: "#0b0b14", card: "#13131f", surf: "#181826", line: "#242433", text: "#f1f5f9", muted: "#94a3b8", dim: "#64748b", blue: "#3b3ad9", green: "#10b981", red: "#ef4444", purple: "#8b5cf6" };
const LIST_FLIGHT = { route: "DXB - BLR", count: "15 Jul · 42 Flights", airline: "IndiGo 6E 870", meta: "3h 40m · Non-stop", dep: "02:05", depC: "DXB", arr: "07:45", arrC: "BLR", date: "15 Jul", price: "₹16,500" };
const LIST_FARES = [
  { name: "Best Price", dot: L.green, struck: "₹16,500", delta: "-₹1,700", deltaCol: L.green, bag: "15 kg", cancel: "No Cancellation", cancelCol: L.red, fee: "From ₹1200", seat: "Free / Paid" },
  { name: "Standard", dot: L.blue, delta: "+ ₹1,500", deltaCol: L.text, bag: "15 kg", cancel: "With fee", cancelCol: L.muted, fee: "From ₹1200", seat: "Free / Paid" },
  { name: "High Luggage", dot: L.purple, delta: "+ ₹1,900", deltaCol: L.text, bag: "30 kg", cancel: "With fee", cancelCol: L.muted, fee: "From ₹1200", seat: "Free / Paid" },
  { name: "Low Cancellation", dot: "#22d3aa", delta: "+ ₹2,400", deltaCol: L.text, bag: "15 kg", cancel: "Free cancel", cancelCol: L.green, fee: "₹0", seat: "Free / Paid" },
];

function Chip({ label, active, col, onClick }) {
  return (
    <button type="button" onClick={onClick} style={{
      height: 26, padding: "0 11px", borderRadius: 999, fontSize: 11, cursor: "pointer",
      border: `1px solid ${active ? col : "#2a2a34"}`, background: active ? `${col}22` : "#14141b",
      color: active ? "#eef1f6" : C.muted, whiteSpace: "nowrap", fontFamily: "inherit",
      transition: "background .2s, border-color .2s, color .2s",
    }}>{label}</button>
  );
}

function CardsView({ active, pick }) {
  const f = FARES[active];
  const col = tone(f.t);
  return (
    <div style={{ width: 460, background: C.bg, borderRadius: 20, padding: 18, fontFamily: "Inter, system-ui, sans-serif" }}>
      {/* THE FLIGHT , ticket structure highlighted here */}
      <div style={{ background: C.head, border: `1px solid ${C.line}`, borderRadius: 14, padding: "13px 15px", marginBottom: 14 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
          <span style={{ fontSize: 15, fontWeight: 600, color: C.text }}>{FLIGHT.route}</span>
          <span style={{ fontSize: 11, color: C.dim }}>{FLIGHT.meta}</span>
        </div>
        <div style={{ fontSize: 11.5, color: C.muted, marginTop: 3 }}>{FLIGHT.airline}</div>
        <div style={{ fontSize: 11.5, color: C.muted, marginTop: 1 }}>{FLIGHT.times}</div>
        <div style={{ marginTop: 11, paddingTop: 11, borderTop: `1px solid ${C.line}` }}>
          <div style={{ fontSize: 8.5, letterSpacing: ".07em", textTransform: "uppercase", color: C.dim, marginBottom: 6 }}>Ticket structure</div>
          <div style={{ display: "flex", gap: 6 }}>
            {FLIGHT.structure.map((s) => {
              const on = s.k === FLIGHT.activeStructure; const sc = tone(s.tone);
              return (<span key={s.k} style={{ fontSize: 10.5, padding: "4px 9px", borderRadius: 7, whiteSpace: "nowrap", border: `1px solid ${on ? sc : "#26262f"}`, background: on ? `${sc}22` : "transparent", color: on ? sc : C.dim, fontWeight: on ? 600 : 400 }}>{s.label}</span>);
            })}
          </div>
          <p style={{ margin: "7px 0 0", fontSize: 11, color: C.good, lineHeight: 1.4 }}>{FLIGHT.structureLine}</p>
          <p style={{ margin: "3px 0 0", fontSize: 10.5, color: C.dim, lineHeight: 1.4 }}>{FLIGHT.note}</p>
        </div>
      </div>
      {/* fare TYPES , value variations only */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 12 }}>
        {FARES.map((x, i) => (<Chip key={x.tab} label={x.tab} active={i === active} col={tone(x.t)} onClick={() => pick(i)} />))}
      </div>
      <div style={{ background: C.card, border: `1px solid ${C.line}`, borderRadius: 15, padding: 15 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 11 }}>
          <span style={{ width: 9, height: 9, borderRadius: 3, background: col, transform: "rotate(45deg)", flex: "0 0 auto" }} />
          <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: ".05em", color: col }}>{f.status}</span>
          {f.subStatus && <span style={{ fontSize: 10, color: C.dim }}>· {f.subStatus}</span>}
          {f.tag && <span style={{ fontSize: 10, color: C.dim, marginLeft: "auto" }}>{f.tag}</span>}
        </div>
        <div style={{ display: "flex", alignItems: "baseline", gap: 10 }}>
          <span style={{ fontSize: 26, fontWeight: 600, color: C.text, letterSpacing: "-.02em" }}>{f.price}</span>
          <span style={{ fontSize: 10, padding: "2px 7px", borderRadius: 6, border: `1px solid ${C.line}`, color: f.source.startsWith("Constructed") ? C.accent : C.dim }}>{f.source}</span>
        </div>
        {f.savings && <p style={{ margin: "3px 0 0", fontSize: 11, color: C.good }}>{f.savings}</p>}
        {f.delta && <p style={{ margin: "3px 0 0", fontSize: 11, color: C.muted }}>{f.delta}</p>}
        {f.madeWhole && <p style={{ margin: "3px 0 0", fontSize: 11, color: C.warn }}>{f.madeWhole}</p>}
        {f.seriesLine && <p style={{ margin: "8px 0 0", fontSize: 11.5, color: "#d9d9e0", lineHeight: 1.45 }}>{f.seriesLine}</p>}
        {f.timeline ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 8, margin: "12px 0" }}>
            {f.timeline.map((s) => (
              <div key={s.when} style={{ display: "flex", gap: 10 }}>
                <span style={{ flex: "0 0 82px", fontSize: 10, fontWeight: 600, letterSpacing: ".02em", color: col, paddingTop: 1 }}>{s.when}</span>
                <span style={{ fontSize: 11, color: C.muted, lineHeight: 1.45 }}>{s.what}</span>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 7, margin: "13px 0" }}>
            {f.atoms.map((a) => (
              <div key={a.k} style={{ borderLeft: `2px solid ${tone(a.t)}`, background: "#101017", borderRadius: 6, padding: "6px 9px" }}>
                <div style={{ fontSize: 8.5, letterSpacing: ".06em", textTransform: "uppercase", color: C.dim }}>{a.k}</div>
                <div style={{ fontSize: 11, color: a.t === "bad" ? C.bad : a.t === "warn" ? C.warn : "#e6e6ec", marginTop: 1 }}>{a.v}</div>
              </div>
            ))}
          </div>
        )}
        {f.trap.length > 0 && (
          <div style={{ display: "flex", flexDirection: "column", gap: 5, marginBottom: 11 }}>
            {f.trap.map((t, i) => (<div key={i} style={{ display: "flex", gap: 7, alignItems: "flex-start" }}><span style={{ color: C.bad, fontSize: 11, lineHeight: 1.4 }}>▲</span><span style={{ fontSize: 11, color: "#e8b7ae", lineHeight: 1.4 }}>{t}</span></div>))}
          </div>
        )}
        <div style={{ background: "#101017", borderRadius: 9, padding: "9px 11px", marginBottom: 12 }}>
          <span style={{ fontSize: 9.5, letterSpacing: ".06em", textTransform: "uppercase", color: C.dim }}>The catch</span>
          <p style={{ margin: "3px 0 0", fontSize: 11.5, color: C.muted, lineHeight: 1.45 }}>{f.catch}</p>
        </div>
        <div style={{ display: "flex", justifyContent: "flex-end" }}>
          <span style={{ height: 32, lineHeight: "32px", padding: "0 16px", borderRadius: 999, background: "#ececf2", color: "#101017", fontSize: 12, fontWeight: 560 }}>+ Book</span>
        </div>
      </div>
    </div>
  );
}

function Attr({ label, value, col }) {
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 11, color: L.muted }}>
      <span style={{ color: L.dim }}>{label}</span>
      <span style={{ color: col || L.text }}>{value}</span>
    </span>
  );
}

function ListView() {
  return (
    <div style={{ width: 340, background: L.bg, borderRadius: 22, padding: 16, fontFamily: "Inter, system-ui, sans-serif" }}>
      {/* the chosen flight */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", padding: "2px 4px 12px" }}>
        <span style={{ fontSize: 16, fontWeight: 600, color: L.text }}>{LIST_FLIGHT.route}</span>
        <span style={{ fontSize: 11, color: L.dim }}>{LIST_FLIGHT.count}</span>
      </div>
      <div style={{ border: `1.5px solid ${L.blue}`, borderRadius: 14, padding: "11px 13px", marginBottom: 14, background: "#111124" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 7, fontSize: 12, color: L.text }}>
          <span style={{ width: 14, height: 14, borderRadius: 4, background: L.blue, display: "inline-block" }} />
          {LIST_FLIGHT.airline}<span style={{ color: L.dim, fontSize: 11 }}>· {LIST_FLIGHT.meta}</span>
        </div>
        <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginTop: 9 }}>
          <span style={{ fontSize: 12, color: L.muted }}><b style={{ color: L.text, fontSize: 14 }}>{LIST_FLIGHT.dep}</b> {LIST_FLIGHT.depC}</span>
          <span style={{ flex: 1, height: 1, background: L.line, margin: "0 10px" }} />
          <span style={{ fontSize: 12, color: L.muted }}><b style={{ color: L.text, fontSize: 14 }}>{LIST_FLIGHT.arr}</b> {LIST_FLIGHT.arrC}</span>
          <span style={{ fontSize: 15, fontWeight: 700, color: L.text, marginLeft: 12 }}>{LIST_FLIGHT.price}</span>
        </div>
      </div>

      {/* the fares, one below the other */}
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {LIST_FARES.map((f) => (
          <div key={f.name} style={{ borderTop: `1px solid ${L.line}`, paddingTop: 12 }}>
            <div style={{ display: "flex", alignItems: "center" }}>
              <span style={{ width: 13, height: 13, borderRadius: 4, background: f.dot, transform: "rotate(45deg)", marginRight: 9, flex: "0 0 auto" }} />
              <span style={{ fontSize: 13.5, fontWeight: 600, color: L.text }}>{f.name}</span>
              <span style={{ marginLeft: "auto", display: "flex", alignItems: "baseline", gap: 6 }}>
                {f.struck && <span style={{ fontSize: 11.5, color: L.dim, textDecoration: "line-through" }}>{f.struck}</span>}
                <span style={{ fontSize: 14, fontWeight: 700, color: f.deltaCol }}>{f.delta}</span>
              </span>
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "5px 14px", margin: "8px 0 10px" }}>
              <Attr label="Baggage" value={f.bag} />
              <Attr label="Cancellation" value={f.cancel} col={f.cancelCol} />
              <Attr label="Cancel fee" value={f.fee} />
              <Attr label="Seat" value={f.seat} />
            </div>
            <div style={{ display: "flex", justifyContent: "flex-end" }}>
              <span style={{ height: 30, lineHeight: "30px", padding: "0 15px", borderRadius: 999, background: "#ececf4", color: "#0b0b14", fontSize: 12, fontWeight: 600 }}>+ Book</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function AwFareCards() {
  const reduce = useReducedMotion();
  const [mode, setMode] = useState("cards");
  const [active, setActive] = useState(0);
  const manual = useRef(false);
  const { fitRef, frameRef } = useFitScale(496, 1.05);

  const loopRef = useInViewLoop(!reduce, async ({ wait, alive }) => {
    while (alive()) {
      if (manual.current || mode !== "cards") { await wait(1200); continue; }
      await wait(2400);
      if (!alive() || manual.current || mode !== "cards") continue;
      setActive((i) => (i + 1) % FARES.length);
    }
  });

  const pick = (i) => { manual.current = true; setActive(i); };
  const setV = (m) => { manual.current = true; setMode(m); };

  return (
    <div className="ds-fit" ref={(n) => { fitRef.current = n; loopRef.current = n; }}>
      <div className="ds-root ds-root--away" ref={frameRef} style={{ width: 496 }}>
        <div style={{ width: 496, fontFamily: "Inter, system-ui, sans-serif" }}>
          {/* the top toggle: the two variations, both kept */}
          <div style={{ display: "flex", gap: 6, justifyContent: "center", marginBottom: 14 }}>
            {[["cards", "Cards"], ["list", "List"]].map(([m, label]) => (
              <button key={m} type="button" onClick={() => setV(m)} style={{
                height: 30, padding: "0 16px", borderRadius: 999, fontSize: 12, fontWeight: 540, cursor: "pointer",
                border: `1px solid ${mode === m ? "#4a4a58" : "#22222c"}`, background: mode === m ? "#20202a" : "transparent",
                color: mode === m ? "#f4f4f6" : "#7a7a86", fontFamily: "inherit", transition: "background .2s, color .2s, border-color .2s",
              }}>{label}</button>
            ))}
          </div>
          <div style={{ display: "flex", justifyContent: "center" }}>
            {mode === "cards" ? <CardsView active={active} pick={pick} /> : <ListView />}
          </div>
        </div>
      </div>
    </div>
  );
}
