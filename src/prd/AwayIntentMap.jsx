// The agent-copy intent map: every "thing a traveller can ask" the Away agent,
// filterable by journey stage, intent category, and persona. Native portfolio DOM
// (styled with the site tokens) so it themes with the page and Agentation can scan
// it. Rendered as the "Agent copy" tab of the Away PRD (see PrdRenderer).
import { useState } from "react";

const P = {
  price: "Price shopper", couple: "Couple", kids: "Family (kids)", infant: "Family (infant)",
  group: "Group organiser", elderly: "Elderly", access: "Accessibility", corp: "Corporate",
  urgent: "Urgent / compassion", lastmin: "Last-minute", wander: "Wanderer",
  mover: "Heavy-baggage mover", nri: "NRI long-haul", elig: "UMNR / pet / visa", award: "Award / miles",
};
const STAGES = ["Dream", "Search", "Decide", "Book", "First hours", "In-trip", "Disruption", "After"];
const CATS = ["Discover", "Search", "Vet", "Book", "Pay", "Confirm", "Documents", "Watch", "Pre-departure", "Disruption", "Rights & claims", "Manage", "Special needs", "Award", "Group"];
const DANGER = { "Disruption": 1, "Rights & claims": 1 };

const D = [
  { a: "Where can I go for 30k in December?", c: "Discover", s: "Dream", w: ["price", "wander"], g: "Suggests destinations within budget and season" },
  { a: "Somewhere warm, direct, under 5 hours", c: "Discover", s: "Dream", w: ["couple", "wander"], g: "Filters ideas by vibe, stops and time" },
  { a: "Is now a good time to book Bangkok?", c: "Discover", s: "Dream", w: ["price", "wander", "nri"], g: "Reads the price trend, says wait or book" },
  { a: "Surprise me with a weekend trip", c: "Discover", s: "Dream", w: ["wander", "couple"], g: "Proposes a shortlist from history and price" },
  { a: "BLR to Dubai next Friday, 2 adults", c: "Search", s: "Search", w: ["all"], g: "Runs the search and vets the results" },
  { a: "Cheapest to London in March, flexible dates", c: "Search", s: "Search", w: ["price", "wander", "nri"], g: "Shows the cheapest day across the window" },
  { a: "Direct flights only", c: "Search", s: "Search", w: ["elderly", "kids", "corp"], g: "Filters to non-stop" },
  { a: "I found a cheaper fare, can you beat it?", c: "Vet", s: "Search", w: ["price"], g: "Negotiates and compares honestly" },
  { a: "Business class to New York, lie-flat", c: "Search", s: "Search", w: ["couple", "corp", "award"], g: "Prices the cabin ladder" },
  { a: "Fly into Rome, out of Paris", c: "Search", s: "Search", w: ["wander"], g: "Builds an open-jaw" },
  { a: "3 of us, BLR to Detroit, plus or minus a day, avoid Gulf carriers", c: "Search", s: "Search", w: ["nri"], g: "Reads the whole brief into structured filters" },
  { a: "I have 60kg to move, one way to Toronto", c: "Search", s: "Search", w: ["mover", "nri"], g: "Ranks on true fare-plus-baggage cost" },
  { a: "Get me on the next flight to Delhi, it is urgent", c: "Search", s: "Search", w: ["urgent", "lastmin"], g: "Prioritises soonest, calm register" },
  { a: "Book for 12 of us to Bangkok", c: "Group", s: "Search", w: ["group"], g: "Assembles a group fare" },
  { a: "Is this a good deal?", c: "Vet", s: "Decide", w: ["all"], g: "Renders a verdict with the reasons" },
  { a: "Is the cheap one a trap?", c: "Vet", s: "Decide", w: ["price"], g: "Unmasks the stripped or self-transfer fare" },
  { a: "Is this a self-transfer?", c: "Vet", s: "Decide", w: ["all"], g: "Flags the ticket structure" },
  { a: "Which should I pick?", c: "Vet", s: "Decide", w: ["all"], g: "Recommends one and says why" },
  { a: "Does this fare include a bag?", c: "Vet", s: "Decide", w: ["all"], g: "Reads baggage in pieces and kg" },
  { a: "Can we sit together?", c: "Vet", s: "Decide", w: ["couple", "kids"], g: "Checks seat adjacency (proposed)" },
  { a: "Is Premium Economy worth it here?", c: "Vet", s: "Decide", w: ["couple", "nri", "corp"], g: "Says what the extra money buys" },
  { a: "Is this refundable?", c: "Vet", s: "Decide", w: ["wander", "corp", "urgent"], g: "Names the flexibility rung" },
  { a: "Do I need a transit visa for this layover?", c: "Documents", s: "Decide", w: ["elig", "nri"], g: "Vets the layover airport against the passport" },
  { a: "Can I use my miles for this?", c: "Award", s: "Decide", w: ["award"], g: "Prices points plus cash (proposed)" },
  { a: "Cash or points, which is better?", c: "Award", s: "Decide", w: ["award"], g: "Shows value-per-point honestly" },
  { a: "Book it", c: "Book", s: "Book", w: ["all"], g: "Prepares the booking, you tap to commit" },
  { a: "Hold this fare", c: "Book", s: "Book", w: ["all"], g: "Holds where the fare allows" },
  { a: "Pay with UPI", c: "Pay", s: "Book", w: ["price"], g: "Zero convenience fee on UPI" },
  { a: "Can I pay later?", c: "Pay", s: "Book", w: ["price", "lastmin"], g: "Away Advance: ticket first, settle later" },
  { a: "Book for my parents", c: "Book", s: "Book", w: ["kids", "group", "elderly"], g: "Books on behalf, captures their details" },
  { a: "Add a checked bag", c: "Manage", s: "Book", w: ["kids", "mover"], g: "Prices and adds the ancillary" },
  { a: "Add a bassinet for the baby", c: "Special needs", s: "Book", w: ["infant"], g: "Requests a bassinet-eligible seat (proposed)" },
  { a: "I need wheelchair assistance", c: "Special needs", s: "Book", w: ["access", "elderly"], g: "Prepares the SSR request" },
  { a: "Seats together for all 12", c: "Group", s: "Book", w: ["group"], g: "Reconciles seating on one booking" },
  { a: "Hold 30 seats for a wedding party", c: "Group", s: "Book", w: ["group"], g: "Assembles and holds the series (proposed)" },
  { a: "I am travelling with a service animal", c: "Special needs", s: "Search", w: ["access"], g: "Filters to carriers that allow it" },
  { a: "Can my 10-year-old fly alone?", c: "Special needs", s: "Search", w: ["elig"], g: "Vets UMNR-eligible routes" },
  { a: "Travelling with a pet, which airlines allow it?", c: "Special needs", s: "Search", w: ["elig"], g: "Narrows to pet-accepting carriers" },
  { a: "Where is my ticket?", c: "Confirm", s: "First hours", w: ["all"], g: "Explains the ticketing gap, pings on issue" },
  { a: "Did my payment go through?", c: "Confirm", s: "First hours", w: ["all"], g: "Reads the real gateway status" },
  { a: "What did I actually buy?", c: "Confirm", s: "First hours", w: ["all"], g: "Reads the booking back in plain terms" },
  { a: "Do I need a visa?", c: "Documents", s: "First hours", w: ["nri", "elig"], g: "Checks visa and entry rules per stop" },
  { a: "Is my passport valid for this trip?", c: "Documents", s: "First hours", w: ["all"], g: "Flags the six-month rule early" },
  { a: "Send me my e-ticket", c: "Confirm", s: "First hours", w: ["all"], g: "Hands over the artifacts" },
  { a: "Watch this fare, tell me if it drops", c: "Watch", s: "In-trip", w: ["price", "wander"], g: "Arms a price watch" },
  { a: "Is my flight on time?", c: "Watch", s: "In-trip", w: ["all"], g: "Reads live status" },
  { a: "My flight time changed", c: "Disruption", s: "In-trip", w: ["all"], g: "Brings the rebooking options held" },
  { a: "Check me in", c: "Pre-departure", s: "In-trip", w: ["all"], g: "Opens check-in, copies the PNR" },
  { a: "When should I leave for the airport?", c: "Pre-departure", s: "In-trip", w: ["all"], g: "Leave-by with traffic and the gate" },
  { a: "What gate and terminal?", c: "Pre-departure", s: "In-trip", w: ["all"], g: "Live gate and terminal, flags a change" },
  { a: "My flight is cancelled, now what?", c: "Disruption", s: "Disruption", w: ["all"], g: "Says what it can and cannot do, prepares the move" },
  { a: "I missed my connection", c: "Disruption", s: "Disruption", w: ["all"], g: "Branches on protected vs self-transfer" },
  { a: "I am at the airport and something is wrong", c: "Disruption", s: "Disruption", w: ["all"], g: "Reads the board, hands you the move" },
  { a: "Rebook me", c: "Disruption", s: "Disruption", w: ["all"], g: "Arrives holding options, you commit" },
  { a: "My bag did not arrive", c: "Disruption", s: "Disruption", w: ["kids", "mover"], g: "Starts the claim, sorts the interim" },
  { a: "Am I owed compensation?", c: "Rights & claims", s: "After", w: ["all"], g: "Checks DGCA and EU261 rights, prepares the claim" },
  { a: "Claim my refund", c: "Rights & claims", s: "After", w: ["all"], g: "Files and tracks the refund" },
  { a: "What did I spend on this trip?", c: "Manage", s: "After", w: ["corp"], g: "The trip recap" },
  { a: "Download my invoice", c: "Manage", s: "After", w: ["corp", "nri"], g: "Hands over the invoice and GST" },
  { a: "Cancel my booking", c: "Manage", s: "After", w: ["wander", "urgent"], g: "Runs the cancel you confirm" },
  { a: "Change my date", c: "Manage", s: "After", w: ["all"], g: "Prices the change, you commit" },
];

// The home is a re-entry surface, not a search box: it surfaces the single most
// actionable thing, tinted by who the traveller is and where they are in the trip.
const PERSONA_HOME = [
  ["Price shopper", "A watched fare that moved, or a route at a three-month low"],
  ["Couple", "The next milestone-trip idea, or a saved shortlist"],
  ["Family (kids)", "The school-holiday trip: price alert, seats-together, the held booking"],
  ["Family (infant)", "The upcoming trip: bassinet status, document check, leave-by"],
  ["Group organiser", "The series-fare confirmation clock, the party's booking"],
  ["Elderly", "The upcoming trip, assistance confirmed, one calm leave-by line"],
  ["Accessibility", "The trip with the wheelchair or SSR status front and centre"],
  ["Corporate", "Rebook your usual BLR to BOM, the next trip, the expense recap"],
  ["Urgent / compassion", "Soonest options, pay-later, a calm register, no discovery noise"],
  ["Last-minute", "Tonight's cheapest and the pay-later option"],
  ["Wanderer", "Weekend ideas and cheap-now destinations for the budget"],
  ["Heavy-baggage mover", "The one-way, the baggage math, the held booking"],
  ["NRI long-haul", "The annual India trip: the 45-day watch, visa and passport check"],
  ["UMNR / pet / visa", "The eligibility-vetted trip and the document deadline"],
  ["Award / miles", "Award sweet spots and the points balance"],
];
const STAGE_HOME = [
  ["Dream", "Convince and discovery, plus the pick, plan, find entry points (today's screen)"],
  ["Search", "Carry on the search you left, seeded with what changed"],
  ["Decide", "Your vetted shortlist is ready, the verdict on top"],
  ["Book", "The held fare and the clock; the pay-later status"],
  ["First hours", "Issuing your ticket, then the read-back and the document check"],
  ["In-trip", "The silent watch: a price drop, a schedule change, or nothing at all"],
  ["Pre-departure", "Check-in, leave-by, gate and terminal, the boarding pass"],
  ["Disruption", "The rescue surface takes over everything else"],
  ["After", "The recap of what it saved, compensation owed, the next-trip seed"],
];

export default function AwayIntentMap() {
  const [stage, setStage] = useState([]);
  const [cat, setCat] = useState([]);
  const [persona, setPersona] = useState("");
  const [q, setQ] = useState("");

  const toggle = (arr, set, v) => set(arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v]);
  const reset = () => { setStage([]); setCat([]); setPersona(""); setQ(""); };

  const rows = D.filter((r) =>
    (!stage.length || stage.includes(r.s)) &&
    (!cat.length || cat.includes(r.c)) &&
    (!persona || r.w.includes("all") || r.w.includes(persona)) &&
    (!q || r.a.toLowerCase().includes(q) || r.g.toLowerCase().includes(q))
  );

  return (
    <>
    <section className="prd__section" aria-label="Agent copy: what travellers ask">
      <p className="prd__eyebrow">Agent copy</p>
      <h2 className="prd__h2">What travellers ask</h2>
      <p className="prd__lead">Every intent across the trip, filterable by persona, intent, and journey stage. This is the surface area the agent is designed to answer.</p>

      <div className="prd-im">
        <div className="prd-im__controls">
          <div className="prd-im__grp">
            <span className="prd-im__lab">Journey</span>
            <div className="prd-im__chips">
              {STAGES.map((s) => (
                <button key={s} type="button" className={`prd-im__chip${stage.includes(s) ? " is-on" : ""}`} aria-pressed={stage.includes(s)} onClick={() => toggle(stage, setStage, s)}>{s}</button>
              ))}
            </div>
          </div>
          <div className="prd-im__grp">
            <span className="prd-im__lab">Intent</span>
            <div className="prd-im__chips">
              {CATS.map((c) => (
                <button key={c} type="button" className={`prd-im__chip${cat.includes(c) ? " is-on" : ""}`} aria-pressed={cat.includes(c)} onClick={() => toggle(cat, setCat, c)}>{c}</button>
              ))}
            </div>
          </div>
          <div className="prd-im__grp prd-im__grp--last">
            <span className="prd-im__lab">Who</span>
            <select className="prd-im__select" value={persona} onChange={(e) => setPersona(e.target.value)} aria-label="Persona">
              <option value="">All personas</option>
              {Object.entries(P).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select>
            <input className="prd-im__search" type="text" placeholder="Search asks" value={q} onChange={(e) => setQ(e.target.value.toLowerCase().trim())} aria-label="Search asks" />
            <button type="button" className="prd-im__clear" onClick={reset}>Reset</button>
          </div>
        </div>

        <p className="prd-im__count">{rows.length} of {D.length} asks</p>

        <div className="prd-im__table" role="table" aria-label="Traveller intents">
          <div className="prd-im__head" role="row">
            <span role="columnheader">What they ask</span>
            <span role="columnheader">Intent</span>
            <span role="columnheader">Journey</span>
            <span role="columnheader">Who asks it</span>
          </div>
          {rows.length === 0 ? (
            <div className="prd-im__empty">No asks match these filters. Reset to see all.</div>
          ) : (
            rows.map((r, i) => (
              <div className="prd-im__row" role="row" key={i}>
                <span role="cell"><span className="prd-im__ask">{r.a}</span><span className="prd-im__agent">{r.g}</span></span>
                <span role="cell" className="prd-im__meta"><span className={`prd-im__pill${DANGER[r.c] ? " prd-im__pill--danger" : ""}`}>{r.c}</span></span>
                <span role="cell" className="prd-im__meta"><span className="prd-im__pill prd-im__pill--stage">{r.s}</span></span>
                <span role="cell" className="prd-im__who">
                  {r.w.includes("all")
                    ? <span className="prd-im__tag prd-im__tag--all">Everyone</span>
                    : r.w.map((k) => <span className="prd-im__tag" key={k}>{P[k] || k}</span>)}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </section>

    <section className="prd__section" aria-label="The home surface">
      <p className="prd__eyebrow">Zero state</p>
      <h2 className="prd__h2">The home, mapped to persona and stage</h2>
      <p className="prd__lead">The home is a re-entry surface, not a search box: it surfaces the single most actionable thing, tinted by who the traveller is and where they are in the trip. Today's screen is the empty state; the ladder above it is what a whole-app agent earns.</p>

      <h3 className="prd__h3">What the home leads with, by persona</h3>
      <table className="prd-homet">
        <thead><tr><th scope="col">Persona</th><th scope="col">The home leads with</th></tr></thead>
        <tbody>
          {PERSONA_HOME.map(([p, v]) => (
            <tr key={p}><th scope="row">{p}</th><td>{v}</td></tr>
          ))}
        </tbody>
      </table>

      <h3 className="prd__h3">What the home becomes, across the journey</h3>
      <table className="prd-homet">
        <thead><tr><th scope="col">Stage</th><th scope="col">The home becomes</th></tr></thead>
        <tbody>
          {STAGE_HOME.map(([s, v]) => (
            <tr key={s}><th scope="row">{s}</th><td>{v}</td></tr>
          ))}
        </tbody>
      </table>
    </section>
    </>
  );
}
