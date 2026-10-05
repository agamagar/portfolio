import { useLayoutEffect, useRef, useState } from "react";
import "./scheduled.css";
import { feedback, feedbackCoalesced } from "../../ui/feedback"; // muku5gig: the site sound engine (silent unless the sound toggle is on)
import { Rail } from "../../hello/Timeline";
import "../../hello/timeline.css";
import { PenNib, ChatCircleText, Package, TextAa, RocketLaunch, Truck, UsersThree, ArrowUUpLeft, ShieldCheck, ShoppingCartSimple, CalendarX, WarningCircle, ChartBar, CalendarBlank } from "@phosphor-icons/react";
import { MONTHLY, SLOT_BANDS, SLOT_MIX, VS_INSTANT, SOURCE_NOTE, ROLLOUT } from "../sdAvailability/sdReport";

// 27 Sep 2026 ("create a lot more detail slides for my role ... just wireframe
// them ... collaboration with different teams, timeline management, team
// management ... go broad, we'll cut down later"). A broad, deliberately rough
// run of WIREFRAME slides after "My role", one case-study-frame-default box
// each, for annotation. Copy follows the writing harness's accuracy rule:
// every name, date and count is from the Figma handoff timeline (Zepto Handoff
// file, 506 comments, synthesised 2026-06-24); anything a lead-design story
// needs that is NOT sourced is a visible [CONFIRM: ...] for Agam to fill or cut.

// mujupawd (27 Sep): "draft all these sections based on the design system
// established on all the screens above". The wireframes are now drafted in the
// page's own system (the My role / key finding / use-cases frames): no boxes,
// the page ground, a light purple label column, a Stack Sans statement, and
// small Stack Sans body in the purple ink. Placeholders became content built
// only from facts already on these slides.

const SLIDES = [
  // mujvc9e0 (27 Sep): "Role at a glance" merged into the My role frame above (App.jsx roleFrame.lead / leadership)
  // muk0nxkb (27 Sep): Wins merged into Who I worked with (the numbers sit above the diorama)
  {
    tag: "Who I worked with",
    stats: [
      ["2 releases", "A narrow M1 (late Oct 2025), the full multi-shipment M2 (mid-Nov 2025)"],
      ["6 months", "August to February, from the first canvas notes to engineering hardening"],
      // mukposjs (28 Sep): commented out at Agam's request; uncomment to bring back
      // ["506 comments", "In the design file, about 300 of them my own working notes"],
      ["5 functions", "Design, product, content, engineering and QA, operations"],
    ],
    stack: true, // mujv7fzk: label over content, both centred
    title: "The team around the file.",
    kind: "map",
    // muk0jers (27 Sep): the table becomes Figma 278:5449, a brick diorama of
    // the team, annotated. Pins sit on each zone (x, y in % of the image); the
    // people on each pin are the groups below, unchanged.
    diorama: {
      src: "/figures/scheduled/photos/team-diorama.webp",
      alt: "A brick-built diorama of the team at work: product at a chart easel, engineering at laptops and a server rack, supply chain with a scooter and parcels, content at a board of notes, design with a phone and a frame, leadership at a podium, and customers in a playground behind.",
      pins: [
        { g: "Product", x: 22, y: 16 },
        { g: "Design", x: 84, y: 48 },
        { g: "Content", x: 22, y: 66 },
        { g: "Engineering and QA", x: 47, y: 44 },
        { g: "Supply chain", x: 12, y: 49, kind: "notes" },
        { g: "Leadership", x: 70, y: 70, people: ["Design leadership and the CPO", "The C-suite", "Senior Director of New Category"] },
        { g: "Who it was for", x: 55, y: 14, kind: "users", people: ["The 45-user validation study, run just after launch"] },
      ],
    },
    groups: [
      ["Design", ["Me, lead designer", "Shreya Garg, design manager and partner through M1 and M2"]],
      ["Product", ["Nishit Raj, PM for M1", "Kavya Jain, lead PM from M2 onward", "Nishanth Bhat"]],
      ["Content", ["Ciara Greenwood, the October copy pass", "Shriya Karani", "Harish, returns copy"]],
      ["Engineering and QA", ["sainath banuru", "Abhijeet", "Junaid Ahmed", "Amit", "tushar patil", "and seven more on build and QA"]],
      // confirmed by Agam, 27 Sep (Brand card removed at his request)
      ["Supply chain", ["Part of the planning from the start", "Part of shipping, at the very end"]],
    ],
  },
  {
    tag: "Timeline",
    stack: true, // mujwi96y: full width for the horizontal track
    title: "How the six months actually ran.",
    kind: "timeline",
    phases: [
      ["19 to 28 Aug 2025", "Problem on the canvas", "I laid the whole problem space into the file before anyone reviewed it: order lifecycle, edge cases, the cart-entry experiments."],
      ["Late Aug", "First review", "Nishit's review set rules that stuck: never negative copy, show the real date, default-select Schedule."],
      ["Sep 2025", "M1 build and handoff", "The serviceability state matrix; engineering starts asking the hard questions."],
      ["Oct 2025", "Content pass", "The busiest month in the file, about 105 comments, most of them copy with Ciara."],
      ["Late Oct", "M1 ships", "Deliberately narrow."],
      ["Mid-Nov 2025", "M2 ships", "Full multi-shipment scheduling, and the go-to-market with Kavya."],
      // confirmed by Agam, 27 Sep: the study ran in November
      ["Nov 2025", "Validation study", "The 45-user mixed-method study, run with the PMs just after launch."],
      ["Dec 2025 to Jan 2026", "Returns and refunds", "The slot picker extended into the returns pickup flow."],
      ["Jan to Feb 2026", "Hardening", "Edge cases with engineering: zero slots, API failure, analytics."],
    ],
  },
  {
    tag: "Timeline management",
    stack: true, // mukuo5m5 (28 Sep): vertical, label over title over charts, so the graphs get the width
    // title: "Scoping M1 small was the timeline decision.", // mukpqnci (28 Sep): removed at Agam's request, uncomment to restore
    // mukpqxg3 (28 Sep): the four points commented out at Agam's request, uncomment to restore
    // kind: "list",
    // items: [
    // ["Ship narrow first", "M1 shipped deliberately narrow in late October so the full multi-shipment version could follow in mid-November."],
    // ["Two directions in parallel", "Two directions ran in parallel early, so the choice was made on evidence, not on the first idea."],
    // ["A checklist for what was missing", "A pending-screens checklist (6 Jan) kept the returns work honest about what was still missing."],
    // // Agam, 27 Sep
    // ["Dates set together", "The PMs owned the dates, set together with design, so the timeline could be managed from day one."],
    // ],
    // mujvibm1 (27 Sep): the section now shows SPEED, all as graphs: pilot ->
    // first measured month -> full rollout -> scale (sdReport ROLLOUT/MONTHLY)
    speed: true,
    // mukp2jed + mukpqnci (28 Sep): with "Scoping M1 small..." removed, this is the slide's only heading, so it leads
    title: "Ship first, measure first, iterate later.",
    // Agam, 27 Sep: what M1 was set to measure, with the case study's numbers
    // measures: "What M1 was set to measure: cancellations, average order value, and the time slots people ordered in.", // mukpxjmx (28 Sep): removed at Agam's request, uncomment to restore
    // charts: true, (mujvibm1: the cancellation / order value / slot charts were swapped for the speed charts)
  },
  {
    tag: "Working with product",
    title: "Two PMs, one system.",
    kind: "list",
    items: [
      ["Nishit set the rules", "Nishit Raj led product through M1; his first review set the copy and default rules the feature kept."],
      ["Kavya took M2", "Kavya Jain took over as lead PM for M2 and defined the returns state set."],
      ["One system across the handover", "The design stayed one coherent system across the handover: the same slot picker, the same states."],
      ["Current layout first", "Shreya's steer: try it inside the current layout first, to keep front-end change small."],
    ],
    // the artefact (27 Sep): a review thread from the design file, annotated.
    // Comments are PARAPHRASED from the file's comment history (the June
    // synthesis of its 506 comments), not verbatim quotes.
    thread: [
      { who: "Nishit Raj", role: "PM, M1", when: "24 to 25 Aug 2025", text: "The title shouldn't be negative. \"Schedule your order\", not \"Some items are unserviceable\".", led: "Became a rule for every state: positive copy, always." },
      { who: "Nishit Raj", role: "PM, M1", when: "24 to 25 Aug 2025", text: "If someone taps Schedule, the Schedule option should already be selected when they land.", led: "Shipped as the default selection." },
      { who: "Nishit Raj", role: "PM, M1", when: "24 to 25 Aug 2025", text: "Don't write \"day after tomorrow\". Show the actual date.", led: "Every slot tab carries its real date." },
      { who: "Shreya Garg", role: "Design manager", when: "Direction reviews", text: "Try it inside the current layout first, to keep front-end change small.", led: "Set the constraint the explorations worked within." },
      { who: "Nishit Raj", role: "PM, M1", when: "Direction reviews", text: "In the tabbed version the tabs don't look tappable, and there's too much white space.", led: "One of the reasons the tabbed direction was dropped." },
    ],
  },
  {
    tag: "Working with engineering",
    title: "Their questions, design answers.",
    kind: "qa",
    qa: [
      ["User taps Pay but an item is unavailable: remove it, or move it to the wishlist?", "Answered in the cart states."],
      ["A day has zero slots: grey the tab out?", "No: keep the tab, and open the first day that has a slot."],
      ["The slot check fails, or the slot is gone: what now?", "A plain toast: the slot isn't available, try again shortly."],
      ["What do we measure?", "Slots shown and first slot time per tab, carried in the analytics."],
    ],
  },
  {
    tag: "Working with content",
    title: "Positive copy, always.",
    kind: "list",
    items: [
      ["Negative copy, killed three times", "Three reviewers (Nishit, Ciara, Harish) independently killed negative phrasing: \"Schedule your order\", not \"Some items are unserviceable\"."],
      ["October, the busiest month", "Ciara's October pass was the busiest month in the file."],
      ["One question left open", "An open question I raised and never closed: should \"shipment\" become \"delivery\"?"],
    ],
    // the two rewrites the file records (WF05's thread): before -> after
    pairs: [["Some items are unserviceable", "Schedule your order"], ["Day after tomorrow", "The actual date, on every slot tab"]],
  },
  {
    tag: "Working with supply chain", // renamed to match WF02
    title: "Every promise on screen is a warehouse promise.",
    kind: "list",
    items: [
      ["Slots are warehouse facts", "Slots, store hours and capacity are supply-chain facts, so supply chain shaped what the design could promise."],
      // Agam, 27 Sep. NB the order data shows no slots between 2 and 6 AM (sdReport SLOT_MIX note); wording to check
      ["24-hour slots, from the interviews", "Seeing our initial user interviews, supply chain were convinced to open 24-hour slots."],
    ],
    // the warehouse side is the sourced line above (slots, store hours,
    // capacity); the screen side is what the slot picker shows
    split: [["On screen, a promise", ["A slot to pick", "The date it lands", "The time it arrives"]], ["In the warehouse, a fact", ["Slots", "Store hours", "Capacity"]]],
  },
  {
    tag: "Team leadership",
    title: "The 5 steps to leading and reporting without a structure.", // mukuvb8b: "5" as a numeral. mukupbi1 (28 Sep), Agam's words; was "Leading without a reporting line."
    // the crit cadence, visualised as three illustrative weeks (one per pace),
    // Mon to Fri; Agam gave a pace-dependent cadence, not a dated log
    cadence: [
      ["Steady", "every other day", [1, 0, 1, 0, 1]],
      ["Pushing", "every day", [1, 1, 1, 1, 1]],
      ["Crunch", "2 to 3 a day", [2, 3, 2, 3, 2]],
    ],
    kind: "list",
    items: [
      // Agam, 27 Sep
      ["Mentoring the pods", "The other tracks ran in parallel, so I mentored the designers in each pod on translating the feature into their part of the app."],
      // Agam, 27 Sep
      ["Crits at the pace of the work", "Design crits ran every other day, then daily, and two or three times a day when we were pushing to solve something fast."],
      // Agam, 27 Sep
      ["Strategy, formed together", "I worked with visual designers and designers from across the app to form the strategy together."],
      ["Into the rest of the app", "Then I made the feature work in the other parts of the app it touches: customer delight, last mile, and returns and refunds."],
      ["The file as shared memory", "The design file as the team's shared memory: about 300 of its 506 comments are my own working notes."],
    ],
  },
  {
    tag: "What I'd do differently",
    title: "One thread I left open.",
    kind: "list",
    vertical: true, // mukxi6f6 (28 Sep): "make this a vertical layout", one column
    items: [
      ["The 11 PM case", "The 11 PM case, where no same-day slots remain, was flagged in the first review and still needed handling."],
      // mukx547q (28 Sep): removed ["Shipment or delivery", "The shipment-or-delivery naming question never closed."]
      // Agam, 27 Sep: the lesson, in his words (lightly shaped)
      ["Trust the instinct, then check it", "The lesson: sometimes the first instinct is right. But on a feature whose outcome is hard to measure, it takes tangential research to be certain enough to commit to it."],
    ],
  },
];

// ---- WF04 metric charts, from the case study's own data (sdReport.js, the
// warehouse pull of 23 Sep 2026). Series colours validated with the dataviz
// validator in both themes: scheduled purple / comparison orange.
const L2 = (m) => m.label;
// 27 Sep: each chart carries its FINDING as a callout, with the area it talks
// about highlighted in light orange (kept very light so it never reads as the
// strong orange comparison series). Numbers are computed from the data.
function Callout({ x, y, w, lines, to }) {
  const h = 10 + lines.length * 13;
  return (
    <g className="rwf-call">
      {to && <line x1={to[0]} y1={to[1]} x2={Math.min(Math.max(to[0], x), x + w)} y2={to[1] < y ? y : y + h} className="rwf-call__lead" />}
      <rect x={x} y={y} width={w} height={h} rx="6" className="rwf-call__box" />
      {lines.map((l, i) => <text key={i} x={x + 8} y={y + 16 + i * 13} className={"rwf-call__txt" + (i === 0 ? " is-lead" : "")}>{l}</text>)}
    </g>
  );
}

function CancelChart() {
  const rows = MONTHLY.filter((r) => r.sdCancelPct != null && !r.partial);
  const W = 600, H = 210, P = { l: 34, r: 90, t: 12, b: 62 };
  const max = 35, x = (i) => P.l + (i * (W - P.l - P.r)) / (rows.length - 1), y = (v) => P.t + (1 - v / max) * (H - P.t - P.b);
  const path = (k) => rows.map((r, i) => `${i ? "L" : "M"}${x(i).toFixed(1)},${y(r[k]).toFixed(1)}`).join(" ");
  const last = rows[rows.length - 1];
  return (
    <figure className="rwf-chart" tabIndex={0} onMouseEnter={() => feedbackCoalesced("navigate", 200)} onFocus={() => feedbackCoalesced("navigate", 200)}>
      <figcaption>Cancelled, % of orders by month</figcaption>
      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Scheduled orders cancel at 27 to 31 percent a month, against 11 to 15 percent for all orders">
        {[0, 10, 20, 30].map((g) => <g key={g}><line x1={P.l} x2={W - P.r} y1={y(g)} y2={y(g)} className="rwf-chart__grid" /><text x={P.l - 5} y={y(g) + 3} className="rwf-chart__axis" textAnchor="end">{g}%</text></g>)}
        {/* the finding: the gap between the lines, shaded */}
        <path className="rwf-hl" d={`${path("sdCancelPct")} ${[...rows].reverse().map((r, i) => `L${x(rows.length - 1 - i).toFixed(1)},${y(r.allCancelPct).toFixed(1)}`).join(" ")} Z`} />
        <Callout x={150} y={H - 44} w={300}
          to={[x(Math.floor(rows.length / 2)), (y(rows[Math.floor(rows.length / 2)].sdCancelPct) + y(rows[Math.floor(rows.length / 2)].allCancelPct)) / 2]}
          lines={[`Scheduled orders cancel at ${Math.min(...rows.map((r) => r.sdCancelPct / r.allCancelPct)).toFixed(1)}x to ${Math.max(...rows.map((r) => r.sdCancelPct / r.allCancelPct)).toFixed(1)}x the overall rate`, "every month since launch"]} />
        <path d={path("allCancelPct")} className="rwf-chart__line rwf-chart__line--b" />
        <path d={path("sdCancelPct")} className="rwf-chart__line rwf-chart__line--a" />
        {rows.map((r, i) => (
          <g key={r.m}>
            <circle cx={x(i)} cy={y(r.sdCancelPct)} r="3.5" className="rwf-chart__dot rwf-chart__dot--a"><title>{`${L2(r)}: scheduled ${r.sdCancelPct}%, all orders ${r.allCancelPct}%`}</title></circle>
            <circle cx={x(i)} cy={y(r.allCancelPct)} r="3.5" className="rwf-chart__dot rwf-chart__dot--b"><title>{`${L2(r)}: scheduled ${r.sdCancelPct}%, all orders ${r.allCancelPct}%`}</title></circle>
          </g>
        ))}
        <text x={x(0)} y={H - 6} className="rwf-chart__axis">{rows[0].label}</text>
        <text x={x(rows.length - 1)} y={H - 6} className="rwf-chart__axis" textAnchor="end">{last.label}</text>
        <text x={W - P.r + 4} y={y(last.sdCancelPct) + 3} className="rwf-chart__lbl">Scheduled {last.sdCancelPct}%</text>
        <text x={W - P.r + 4} y={y(last.allCancelPct) + 3} className="rwf-chart__lbl">All {last.allCancelPct}%</text>
      </svg>
    </figure>
  );
}
function AovChart() {
  const rows = VS_INSTANT.filter((r) => /order value/i.test(r.label));
  const W = 600, H = 150, P = { l: 70, r: 60, t: 6, b: 26 }, max = 1500;
  const bw = (v) => (v / max) * (W - P.l - P.r);
  const band = (H - P.t - P.b) / rows.length;
  return (
    <figure className="rwf-chart" tabIndex={0} onMouseEnter={() => feedbackCoalesced("navigate", 200)} onFocus={() => feedbackCoalesced("navigate", 200)}>
      <figcaption>Order value, scheduled vs instant (Aug 2026)</figcaption>
      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Average order value 1,452 rupees scheduled against 543 instant; median 561 against 332">
        {rows.map((r, i) => {
          const y0 = P.t + i * band;
          return (
            <g key={r.label}>
              <text x={P.l - 6} y={y0 + band / 2 + 3} className="rwf-chart__axis" textAnchor="end">{r.label.replace(" order value", "")}</text>
              {i === 0 && <rect className="rwf-hl" x={P.l + bw(r.instant)} y={y0 + 2} width={bw(r.scheduled) - bw(r.instant)} height={band - 4} rx="4" />}
              <rect x={P.l} y={y0 + 6} width={bw(r.scheduled)} height={band / 2 - 8} rx="3" className="rwf-chart__bar--a"><title>{`${r.label}, scheduled: Rs ${r.scheduled.toLocaleString("en-IN")}`}</title></rect>
              <rect x={P.l} y={y0 + band / 2 + 2} width={bw(r.instant)} height={band / 2 - 8} rx="3" className="rwf-chart__bar--b"><title>{`${r.label}, instant: Rs ${r.instant.toLocaleString("en-IN")}`}</title></rect>
              <text x={P.l + bw(r.scheduled) + 4} y={y0 + band / 4 + 4} className="rwf-chart__lbl">₹{r.scheduled.toLocaleString("en-IN")}</text>
              <text x={P.l + bw(r.instant) + 4} y={y0 + (3 * band) / 4 - 1} className="rwf-chart__lbl">₹{r.instant.toLocaleString("en-IN")}</text>
            </g>
          );
        })}
        {(() => { const r = rows[0]; return (
          <Callout x={P.l + bw(r.instant) + 40} y={H - 24} w={250}
            lines={[`A scheduled basket is worth ${(r.scheduled / r.instant).toFixed(1)}x an instant one`]} />
        ); })()}
      </svg>
      <p className="rwf-chart__key"><i className="rwf-chart__sw rwf-chart__sw--a" />Scheduled <i className="rwf-chart__sw rwf-chart__sw--b" />Instant</p>
    </figure>
  );
}
function SlotChart() {
  const pick = [SLOT_MIX[0], SLOT_MIX.find((r) => r.m === "2026-08")];
  const W = 600, H = 130, P = { l: 48, r: 6, t: 6, b: 40 };
  const bh = (H - P.t - P.b) / 2 - 8, iw = W - P.l - P.r;
  return (
    <figure className="rwf-chart" tabIndex={0} onMouseEnter={() => feedbackCoalesced("navigate", 200)} onFocus={() => feedbackCoalesced("navigate", 200)}>
      <figcaption>When people ordered for, % of scheduled orders</figcaption>
      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Slot mix: evening led in Nov 2025 at 36.5 percent; by Aug 2026 the 6 to 10 AM morning slots led at 34.3 percent">
        {pick.map((r, i) => {
          let acc = 0;
          const y0 = P.t + i * (bh + 16);
          return (
            <g key={r.m}>
              <text x={P.l - 6} y={y0 + bh / 2 + 3} className="rwf-chart__axis" textAnchor="end">{r.label}</text>
              {SLOT_BANDS.map((b, k) => {
                const w = (r[b.key] / 100) * iw, x0 = P.l + (acc / 100) * iw;
                acc += r[b.key];
                return (
                  <g key={b.key}>
                    <rect x={x0 + 1} y={y0} width={Math.max(0, w - 2)} height={bh} rx="2" className={`rwf-chart__seq rwf-chart__seq--${k}`}><title>{`${r.label}, ${b.label}: ${r[b.key]}%`}</title></rect>
                    {b.key === "am" && <rect x={x0 - 1} y={y0 - 2} width={w + 2} height={bh + 4} rx="4" className="rwf-hl rwf-hl--ring" />}
                    {w > 30 && <text x={x0 + w / 2} y={y0 + bh / 2 + 3} textAnchor="middle" className={`rwf-chart__seglbl${k >= 3 ? " is-inv" : ""}`}>{Math.round(r[b.key])}%</text>}
                  </g>
                );
              })}
            </g>
          );
        })}
        <Callout x={P.l} y={H - 34} w={430}
          lines={[`Mornings (6 to 10 AM) grew from ${Math.round(pick[0].am)}% to ${Math.round(pick[1].am)}% of orders; evenings fell from ${Math.round(pick[0].eve)}% to ${Math.round(pick[1].eve)}%`]} />
      </svg>
      <p className="rwf-chart__key">{SLOT_BANDS.map((b, k) => <span key={b.key}><i className={`rwf-chart__sw rwf-chart__seq--${k}`} />{b.label}</span>)}</p>
    </figure>
  );
}

// mujvhkft (27 Sep): each timeline step gets a filled icon for what it is
const STEP_ICON = {
  "Problem on the canvas": PenNib, "First review": ChatCircleText, "M1 build and handoff": Package,
  "Content pass": TextAa, "M1 ships": RocketLaunch, "M2 ships": Truck, "Validation study": UsersThree,
  "Returns and refunds": ArrowUUpLeft, "Hardening": ShieldCheck,
};

// ---- mujvibm1: speed. Every number from sdReport (warehouse pull, 23 Sep 2026)
const DAY = 864e5, day0 = new Date("2025-10-10");
const daysFrom = (d) => Math.round((new Date(d) - day0) / DAY);
function SpeedStrip() {
  const full = ROLLOUT.find((r) => r.mark === "full rollout");
  const firstM = MONTHLY.find((r) => r.sdCancelPct != null);
  const million = MONTHLY.find((r) => r.sd >= 1e6);
  const steps = [
    ["10 Oct 2025", "First scheduled order", `${ROLLOUT[0].orders} orders, ${ROLLOUT[0].stores} stores`],
    [firstM.label.replace(" 25", " 2025"), "First month measured", `${firstM.sd.toLocaleString("en-IN")} orders, cancellations tracked`],
    [`${full.label} 2025`, "Every store", `${full.stores.toLocaleString("en-IN")} stores, ${daysFrom(full.d)} days after the pilot`],
    [million.label.replace(" 26", " 2026"), "A million a month", `${(million.sd / 1e6).toFixed(2)}M orders, 3 months in`],
  ];
  return (
    <ol className="rwf-speed">
      {steps.map(([when, what, sub]) => (
        <li key={what}><span className="rwf__when">{when}</span><span className="rwf__what">{what}</span><span className="rwf__detail">{sub}</span></li>
      ))}
    </ol>
  );
}
// mukpkglc (28 Sep): the two speed charts sit SIDE BY SIDE with one legend, so
// each is drawn at half width (320) rather than a 600-wide chart squeezed to
// half, which would shrink its 9px labels to about 4px
function RolloutChart() {
  const W = 320, H = 230, P = { l: 34, r: 34, t: 14, b: 30 };
  const maxD = daysFrom(ROLLOUT[ROLLOUT.length - 1].d), maxO = 40000, maxS = 1200;
  const x = (d) => P.l + (daysFrom(d) / maxD) * (W - P.l - P.r);
  const yO = (v) => P.t + (1 - v / maxO) * (H - P.t - P.b), yS = (v) => P.t + (1 - v / maxS) * (H - P.t - P.b);
  const line = (f, k) => ROLLOUT.map((r, i) => `${i ? "L" : "M"}${x(r.d).toFixed(1)},${f(r[k]).toFixed(1)}`).join(" ");
  const full = ROLLOUT.find((r) => r.mark === "full rollout");
  return (
    <figure className="rwf-chart" tabIndex={0} onMouseEnter={() => feedbackCoalesced("navigate", 200)} onFocus={() => feedbackCoalesced("navigate", 200)}>
      <figcaption>Pilot to every store, in {daysFrom(full.d)} days</figcaption>
      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={`Rollout: 2 stores on 10 Oct 2025 to ${full.stores} stores on 12 Dec; daily scheduled orders from 16 to ${ROLLOUT[ROLLOUT.length - 1].orders.toLocaleString("en-IN")} by 23 Dec`}>
        {[0, 20000, 40000].map((g) => <g key={g}><line x1={P.l} x2={W - P.r} y1={yO(g)} y2={yO(g)} className="rwf-chart__grid" /><text x={P.l - 5} y={yO(g) + 3} className="rwf-chart__axis" textAnchor="end">{g ? `${g / 1000}k` : 0}</text></g>)}
        {[0, 600, 1200].map((g) => <text key={g} x={W - P.r + 5} y={yS(g) + 3} className="rwf-chart__axis">{g}</text>)}
        <rect className="rwf-hl" x={x(ROLLOUT[0].d)} y={P.t} width={x(full.d) - x(ROLLOUT[0].d)} height={H - P.t - P.b} rx="4" />
        <path d={line(yS, "stores")} className="rwf-chart__line rwf-chart__line--b" />
        <path d={line(yO, "orders")} className="rwf-chart__line rwf-chart__line--a" />
        {ROLLOUT.map((r) => (
          <g key={r.d}>
            <circle cx={x(r.d)} cy={yO(r.orders)} r="3.5" className="rwf-chart__dot rwf-chart__dot--a"><title>{`${r.label}: ${r.orders.toLocaleString("en-IN")} orders a day, ${r.stores} stores`}</title></circle>
            <circle cx={x(r.d)} cy={yS(r.stores)} r="3.5" className="rwf-chart__dot rwf-chart__dot--b"><title>{`${r.label}: ${r.stores} stores`}</title></circle>
          </g>
        ))}
        {ROLLOUT.filter((r, i) => i === 0 || r.mark === "full rollout" || i === ROLLOUT.length - 1).map((r) => <text key={r.d} x={x(r.d)} y={H - 10} className="rwf-chart__axis" textAnchor="middle">{r.label}</text>)}
        <Callout x={Math.min(x(ROLLOUT[1].d) + 6, W - 176)} y={P.t + 4} w={172}
          lines={[`${ROLLOUT[0].stores} stores to ${full.stores.toLocaleString("en-IN")} in ${daysFrom(full.d)} days`, `orders a day: ${ROLLOUT[0].orders} to ${ROLLOUT[ROLLOUT.length - 1].orders.toLocaleString("en-IN")}`]} />
      </svg>
    </figure>
  );
}
function ScaleChart() {
  const rows = MONTHLY.filter((r) => !r.partial || r.m === "2025-10");
  const W = 320, H = 230, P = { l: 34, r: 6, t: 14, b: 30 }, max = 2e6;
  const bw = (W - P.l - P.r) / rows.length;
  const y = (v) => P.t + (1 - v / max) * (H - P.t - P.b);
  const peak = rows.reduce((a, b) => (b.sd > a.sd ? b : a));
  const mi = rows.findIndex((r) => r.sd >= 1e6);
  return (
    <figure className="rwf-chart" tabIndex={0} onMouseEnter={() => feedbackCoalesced("navigate", 200)} onFocus={() => feedbackCoalesced("navigate", 200)}>
      <figcaption>Scheduled orders a month</figcaption>
      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={`Monthly scheduled orders: 383 in the October 2025 pilot, over a million by January 2026, peaking at ${(peak.sd / 1e6).toFixed(2)} million in ${peak.label}`}>
        {[0, 1e6, 2e6].map((g) => <g key={g}><line x1={P.l} x2={W - P.r} y1={y(g)} y2={y(g)} className="rwf-chart__grid" /><text x={P.l - 5} y={y(g) + 3} className="rwf-chart__axis" textAnchor="end">{g ? `${g / 1e6}M` : 0}</text></g>)}
        <rect className="rwf-hl" x={P.l} y={P.t} width={bw * (mi + 1)} height={H - P.t - P.b} rx="4" />
        {rows.map((r, i) => (
          <g key={r.m}>
            <rect x={P.l + i * bw + 2} y={y(r.sd)} width={bw - 4} height={Math.max(1, y(0) - y(r.sd))} rx="3" className="rwf-chart__bar--a"><title>{`${r.label}: ${r.sd.toLocaleString("en-IN")} orders, ${r.sdPct}% of all shipments`}</title></rect>
            {(i === 0 || i === mi || r === peak || i === rows.length - 1) && <text x={P.l + i * bw + bw / 2} y={H - 10} className="rwf-chart__axis" textAnchor="middle">{r.label}</text>}
          </g>
        ))}
        <text x={P.l + rows.indexOf(peak) * bw + bw / 2} y={y(peak.sd) - 5} className="rwf-chart__lbl" textAnchor="middle">{(peak.sd / 1e6).toFixed(2)}M</text>
        <Callout x={Math.min(P.l + bw * (mi + 1) + 6, W - 184)} y={P.t + 8} w={180}
          lines={[`From ${rows[0].sd} orders to ${(rows[mi].sd / 1e6).toFixed(2)}M a month`, `in ${mi} months, peak ${(peak.sd / 1e6).toFixed(2)}M in ${peak.label}`]} />
      </svg>
    </figure>
  );
}

// mujwi96y (27 Sep): the timeline HORIZONTAL, content inside the cards (was
// the /lab vertical rail, mujvlj10). Built on the hello rail's idea rather than
// its code (that Rail is internal to the career data): a month axis, each
// phase a card spanning its months, packed into lanes the way the rail packs
// tenures. Month columns 0..6 = Aug 2025 .. Feb 2026, [start, end] inclusive.
const PHASE_SPAN = [[0, 0], [0, 0], [1, 1], [2, 2], [2, 2], [3, 3], [3, 3], [4, 5], [5, 6]];
const AXIS = ["Aug", "Sep", "Oct", "Nov", "Dec", "Jan", "Feb"];
function PhaseTrack({ phases }) {
  // first-fit lane packing: a card takes the first lane whose last card ended before it starts
  const ends = [];
  const placed = phases.map((ph, i) => {
    const [a, b] = PHASE_SPAN[i];
    let lane = ends.findIndex((e) => e < a);
    if (lane === -1) { lane = ends.length; ends.push(b); } else ends[lane] = b;
    return { ph, i, a, b, lane };
  });
  return (
    <div className="ptk" role="list" aria-label="Six months, Aug 2025 to Feb 2026">
      <div className="ptk__grid" style={{ "--cols": AXIS.length }}>
        {placed.map(({ ph: [when, what, detail], i, a, b, lane }) => {
          const I = STEP_ICON[what];
          return (
            <div role="listitem" className="ptk__card" key={what} style={{ gridColumn: `${a + 1} / ${b + 2}`, gridRow: lane + 1 }}>
              <span className="ptk__top">{I && <span className="ptk__icon" aria-hidden><I weight="fill" /></span>}<span className="rwf__when">{when}</span></span>
              <span className="rwf__what">{what}</span>
              <span className="rwf__detail">{detail}</span>
            </div>
          );
        })}
        <div className="ptk__axis" aria-hidden style={{ gridRow: ends.length + 1 }}>
          {AXIS.map((m, k) => <span key={m}>{m}{k === 0 ? " 2025" : m === "Jan" ? " 2026" : ""}</span>)}
        </div>
      </div>
    </div>
  );
}

// muk0jers: an image with numbered pins; each pin opens its group's people
// mukpzwqz (28 Sep): every expanded pill reads the same way. One row per
// person (a Material "person" icon, the name, the role muted) and a count on
// top, so it is clear how many people took part. "and seven more" counts as
// seven; a line that is not a person (Supply chain's notes) gets an info icon
// and no count; the users pin counts users.
const NUM = { one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7, eight: 8, nine: 9, ten: 10 };
function peopleRows(pin, lines) {
  if (pin.kind === "notes") return { rows: lines.map((l) => ({ icon: "info", name: l })), count: null };
  if (pin.kind === "users") {
    const n = Number((lines.join(" ").match(/(\d+)-user/) || [])[1]) || null;
    return { rows: lines.map((l) => ({ icon: "groups", name: l })), count: n ? `${n} users` : null };
  }
  let n = 0;
  const rows = lines.map((l) => {
    const more = l.match(/^and (\w+) more(.*)$/i);
    if (more) { const k = NUM[more[1].toLowerCase()] || Number(more[1]) || 0; n += k; return { icon: "groups", name: `${more[1]} more`, role: more[2].trim() }; }
    n += 1;
    const i = l.indexOf(", ");
    return i > 0 ? { icon: "person", name: l.slice(0, i), role: l.slice(i + 2) } : { icon: "person", name: l };
  });
  return { rows, count: `${n} ${n === 1 ? "person" : "people"}` };
}
function Diorama({ d, groups }) {
  const people = (g) => d.pins.find((p) => p.g === g)?.people || groups.find(([n]) => n === g)?.[1] || [];
  return (
    <figure className="dio">
      <div className="dio__stage">
        <img src={d.src} alt={d.alt} loading="lazy" />
        {d.pins.map((p, i) => (
          <button type="button" className="dio__pin" key={p.g}
            // mukqb0zz: anchored by an EDGE, not the centre, so the name stays
            // still as the pill grows; right-side pins grow leftward into the image
            data-side={p.x > 60 ? "right" : "left"}
            onMouseEnter={() => feedbackCoalesced("reveal", 250)} onFocus={() => feedbackCoalesced("reveal", 250)}
            style={p.x > 60 ? { right: `${100 - p.x}%`, top: `${p.y}%` } : { left: `${p.x}%`, top: `${p.y}%` }} aria-label={`${p.g}: ${people(p.g).join(", ")}`}>
            {/* muk1dz9x: numbers removed, the tag names the zone */}
            <span className="dio__tag">{p.g}</span>
            {(() => {
              const { rows, count } = peopleRows(p, people(p.g));
              return (
                <span className="dio__card" aria-hidden>
                  {count && <span className="dio__count">{count}</span>}
                  {rows.map((r) => (
                    <span className="dio__row" key={r.name}>
                      <span className="dio__icon">{r.icon}</span>
                      <span className="dio__who"><b>{r.name}</b>{r.role ? <em>{r.role}</em> : null}</span>
                    </span>
                  ))}
                </span>
              );
            })()}
          </button>
        ))}
      </div>
    </figure>
  );
}

// muk1fomw (27 Sep): "use the complete glass component here, use the text,
// chuck the rest". The hello page's horizontal glass rail, whole (magnifier
// wave, resting cards, the readout), fed this project's record through an
// adapter shaped like scrubModel()/detailsById(). One tick per WEEK, 11 Aug
// 2025 to 23 Feb 2026, so the spine has texture; each phase is a run of weeks.
const WK0 = new Date("2025-08-11");
const PHASE_DATES = [["2025-08-19", "2025-08-28"], ["2025-08-25", "2025-08-31"], ["2025-09-01", "2025-09-30"], ["2025-10-01", "2025-10-31"], ["2025-10-20", "2025-10-31"], ["2025-11-10", "2025-11-20"], ["2025-11-01", "2025-11-30"], ["2025-12-01", "2026-01-31"], ["2026-01-01", "2026-02-28"]];
const wk = (d) => Math.max(0, Math.floor((new Date(d) - WK0) / (7 * 864e5)));
// mukp8kvi (28 Sep): an emoji before each card label, one per step
// mukqhh5r (28 Sep): an icon for each number box, in the leadership icons' style
const STAT_ICON = { "2 releases": RocketLaunch, "6 months": CalendarBlank, "5 functions": UsersThree, "506 comments": ChatCircleText };
const PHASE_EMOJI = {
  "Problem on the canvas": "🗺️", "First review": "👀", "M1 build and handoff": "🛠️", "Content pass": "✍️",
  "M1 ships": "🚀", "M2 ships": "📦", "Validation study": "🎙️", "Returns and refunds": "🔁", "Hardening": "🛡️",
};
// mukpq377 (28 Sep): the expanded card reads as bullets, split from each step's
// own sentence (nothing added)
const PHASE_BULLETS = {
  "Problem on the canvas": ["The whole problem space, laid out before any review", "The order lifecycle, end to end", "Edge cases and the cart-entry experiments"],
  "First review": ["Nishit's review set rules that stuck", "Never negative copy", "Show the real date", "Default-select Schedule"],
  "M1 build and handoff": ["The serviceability state matrix", "Engineering starts asking the hard questions"],
  "Content pass": ["The busiest month in the file", "About 105 comments", "Most of them copy, with Ciara"],
  "M1 ships": ["Deliberately narrow"],
  "M2 ships": ["Full multi-shipment scheduling", "The go-to-market, with Kavya"],
  "Validation study": ["The 45-user mixed-method study", "Run with the PMs, just after launch"],
  "Returns and refunds": ["The slot picker, extended into returns pickup"],
  "Hardening": ["Edge cases with engineering", "Zero slots", "API failure", "Analytics"],
};
// mukpz799 (28 Sep): a Google Material Symbols icon per bullet, matched to what
// the bullet says (loaded as a subset in index.html; add a name there too)
const PHASE_BULLET_ICONS = {"Problem on the canvas": ["map", "sync", "science"], "First review": ["rule", "sentiment_satisfied", "calendar_today", "check_circle"], "M1 build and handoff": ["grid_view", "help"], "Content pass": ["trending_up", "forum", "edit_note"], "M1 ships": ["rocket_launch"], "M2 ships": ["local_shipping", "campaign"], "Validation study": ["groups", "handshake"], "Returns and refunds": ["assignment_return"], "Hardening": ["engineering", "event_busy", "cloud_off", "analytics"]};
const phaseLabel = (what) => (PHASE_EMOJI[what] ? `${PHASE_EMOJI[what]} ${what}` : what);
function phaseRailModel(phases) {
  // 28 Sep: the rail ENDS just after the last step starts, so Hardening is the
  // last thing on it and the earlier steps get the width (was Feb 28, which
  // left a long empty tail after Hardening)
  const lastStart = wk(PHASE_DATES[PHASE_DATES.length - 1][0]);
  const n = lastStart + 3;
  const spans = phases.map((p, k) => ({ k, i0: wk(PHASE_DATES[k][0]), i1: Math.min(n - 1, wk(PHASE_DATES[k][1])), what: phaseLabel(p[1]) }));
  const months = Array.from({ length: n }, (_, i) => {
    const d = new Date(WK0.getTime() + i * 7 * 864e5);
    const on = spans.filter((sp) => sp.i0 <= i && i <= sp.i1);
    const field = on[on.length - 1];
    return {
      m: d.getFullYear() * 12 + d.getMonth(),
      label: d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }),
      field: field ? { org: field.what, role: null, kind: "work" } : null,
      fieldId: field ? `p${field.k}` : null,
      riders: on.slice(0, -1).map((sp) => ({ id: `p${sp.k}`, org: sp.what, kind: "work", role: null })),
      count: on.length,
    };
  });
  const years = [{ label: "2025", x: 0, i: 0 }];
  const jan = months.findIndex((c) => c.m === 2026 * 12);
  if (jan > 0) years.push({ label: "2026", x: (jan / n) * 100, i: jan });
  const cards = spans.map((sp) => ({ key: `p${sp.k}`, tid: `p${sp.k}`, org: sp.what, role: null, x: (sp.i0 / n) * 100, i0: sp.i0, i1: sp.i1 }));
  const details = new Map(phases.map(([when, what, detail], k) => [`p${k}`, { id: `p${k}`, org: phaseLabel(what), kind: "", rawKind: "work", role: null, dates: when, span: when, outs: [], summary: PHASE_BULLETS[what] ? null : detail, bullets: PHASE_BULLETS[what] ? PHASE_BULLETS[what].map((t, j) => ({ icon: PHASE_BULLET_ICONS[what]?.[j], text: t })) : null }]));
  return { model: { months, n, years, cards }, details };
}
// mukt31g5 (28 Sep): a month row under the glass ticks, above the years. Each
// label sits under the FIRST tick of its month, three letters, uppercase, grey.
// Positions are read off the rail's own tick rows, so they stay on the ticks
// at any width.
function MonthRow({ host, months }) {
  const [marks, setMarks] = useState([]);
  useLayoutEffect(() => {
    const el = host.current;
    if (!el) return undefined;
    const starts = months.map((c, i) => (i === 0 || c.m !== months[i - 1].m ? i : -1)).filter((i) => i >= 0);
    const place = () => {
      const rows = el.querySelectorAll(".tlx__rail-row");
      const tick = rows[0]?.querySelector(".tlx__rail-tick");
      if (!rows.length || !tick) return;
      const base = el.getBoundingClientRect();
      const top = tick.getBoundingClientRect().bottom - base.top + 8;
      setMarks(starts.map((i) => {
        const r = rows[i].getBoundingClientRect();
        const d = new Date(Math.floor(months[i].m / 12), months[i].m % 12, 1);
        return { i, x: r.left + r.width / 2 - base.left, top, label: d.toLocaleString("en-GB", { month: "short" }).slice(0, 3).toUpperCase() };
      }));
    };
    place();
    const ro = new ResizeObserver(place);
    ro.observe(el);
    return () => ro.disconnect();
  }, [host, months]);
  return (
    <div className="rwf-months" aria-hidden="true">
      {marks.map((m) => <span key={m.i} className="rwf-months__m" style={{ left: `${m.x}px`, top: `${m.top}px` }}>{m.label}</span>)}
    </div>
  );
}

function PhaseGlassRail({ phases }) {
  const { model, details } = phaseRailModel(phases);
  const host = useRef(null);
  return (
    <div className="tlx rwf-glass" data-style="rail" ref={host}>
      <MonthRow host={host} months={model.months} />
      {/* mukp1kbl: every other phase sits under the line, so the two rows share the crowding */}
      <Rail model={model} details={details} below={phases.filter((_, k) => k % 2 === 1).map((p) => phaseLabel(p[1]))} reduce={typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches} />
    </div>
  );
}

// the crit-cadence figure, standalone so a layout can place it (mukw790w)
function Cadence({ s }) {
  return (
      <figure className="rwf-cad">
        <figcaption>Design crit cadence, by pace <span>illustrative weeks, not a log</span></figcaption>
        <div className="rwf-cad__grid" role="table" aria-label="Crits per weekday at each pace">
          <div className="rwf-cad__row rwf-cad__row--head" role="row">
            <span role="columnheader" />{["Mon", "Tue", "Wed", "Thu", "Fri"].map((d) => <span key={d} role="columnheader">{d}</span>)}<span role="columnheader">Week</span>
          </div>
          {s.cadence.map(([pace, desc, days]) => (
            <div className="rwf-cad__row" role="row" key={pace}>
              <span role="rowheader" className="rwf-cad__pace"><b>{pace}</b>{desc}</span>
              {days.map((n, d) => (
                <span role="cell" key={d} className="rwf-cad__day" title={`${pace}: ${n} crit${n === 1 ? "" : "s"}`}>
                  {Array.from({ length: n }, (_, j) => <i key={j} className="rwf-cad__dot" />)}
                  {n === 0 && <i className="rwf-cad__dot rwf-cad__dot--off" />}
                </span>
              ))}
              <span role="cell" className="rwf-cad__sum">{days.reduce((a, b) => a + b, 0)}</span>
            </div>
          ))}
        </div>
      </figure>
  );
}

// mukwg17w (28 Sep): a slide can render just its MAIN part (text) or just its
// SIDE part (its visual: the review thread, the copy pairs, the promise/fact
// split, the crit cadence), so a layout can place the visual in its own column.
const SIDE_KEYS = ["thread", "pairs", "split", "cadence"];
const pickSide = (s) => Object.fromEntries(SIDE_KEYS.filter((k) => s[k]).map((k) => [k, s[k]]));
const omitSide = (s) => Object.fromEntries(Object.entries(s).filter(([k]) => !SIDE_KEYS.includes(k)));
export const hasSide = (s) => SIDE_KEYS.some((k) => s[k]);

function Slide({ s: s0, embedded, compact, noCad, part }) {
  const s = part === "side" ? pickSide(s0) : part === "main" ? omitSide(s0) : s0;
  const body = (
      <div className="rwf__main">
        {s.title && <h3 className="rwf__title">{s.title}</h3>}
        {s.lead && <p className="rwf__lead">{s.lead}</p>}
        {s.leadership && (
          <ul className="rwf__leadership">{s.leadership.map((l) => <li key={l}>{l}</li>)}</ul>
        )}
        {s.stats && !s.diorama && (
          <dl className="rwf__stats">
            {s.stats.map(([big, small]) => (
              <div className="rwf__stat" key={big}>{STAT_ICON[big] && (() => { const I = STAT_ICON[big]; return <span className="rwf__stat-icon" aria-hidden><I weight="fill" /></span>; })()}<dt className="rwf__big">{big}</dt><dd className="rwf__small">{small}</dd></div>
            ))}
          </dl>
        )}
        {s.diorama && <Diorama d={s.diorama} groups={s.groups} />}
        {/* mukq0i20 (28 Sep): with the diorama, the numbers sit BELOW the illustration */}
        {s.stats && s.diorama && (
          <dl className="rwf__stats">
            {s.stats.map(([big, small]) => (
              <div className="rwf__stat" key={big}>{STAT_ICON[big] && (() => { const I = STAT_ICON[big]; return <span className="rwf__stat-icon" aria-hidden><I weight="fill" /></span>; })()}<dt className="rwf__big">{big}</dt><dd className="rwf__small">{small}</dd></div>
            ))}
          </dl>
        )}
        {s.kind === "map" && !s.diorama && (
          <div className="rwf__map">
            {s.groups.map(([g, people]) => (
              <div className="rwf__group" key={g}><p className="rwf__gname">{g}</p><ul>{people.map((p, i) => <li key={i}>{p}</li>)}</ul></div>
            ))}
          </div>
        )}
        {s.kind === "timeline" && <PhaseGlassRail phases={s.phases} />}
        {s.kind === "list" && (
          <ol className={"rwf__list" + (s.vertical ? " rwf__list--vertical" : "")}>
            {/* mujvef11 (27 Sep): every point built like a timeline step: small
                meta, a headline saying what the point says, then the detail */}
            {s.items.map((it, i) => {
              const [head, text] = Array.isArray(it) ? it : [null, it];
              return (
                <li key={i}>
                  <span className="rwf__n" aria-hidden>{String(i + 1).padStart(2, "0")}</span>
                  {head && <span className="rwf__what">{head}</span>}
                  <span className="rwf__detail">{text}</span>
                </li>
              );
            })}
          </ol>
        )}
        {s.pairs && (
          <ul className="rwf__pairs" aria-label="Copy, before and after">
            {s.pairs.map(([was, now]) => (
              <li key={was}><s className="rwf__was">{was}</s><span className="rwf__arrow" aria-hidden>→</span><span className="rwf__now">{now}</span></li>
            ))}
          </ul>
        )}
        {s.split && (
          <div className="rwf__split">
            {s.split.map(([h, items]) => (
              <div key={h}><p className="rwf__gname">{h}</p><ul>{items.map((it) => <li key={it}>{it}</li>)}</ul></div>
            ))}
          </div>
        )}
        {s.measures && <p className="rwf__lead">{s.measures}</p>}
        {s.speed && (
          <>
            {s.speedTitle && <h3 className="rwf__title rwf__title--second">{s.speedTitle}</h3>}
            <div className="rwf__charts rwf__charts--pair"><RolloutChart /><ScaleChart /></div>
            {/* mukq3d05: the four milestones closed the section. mukuobv4 (28 Sep): commented out for now */}
            {/* <SpeedStrip /> */}
            {/* mukq2tj2 (28 Sep): "combine this and the legends": the shared legend
                (mukpkglc: purple = scheduled orders in both charts, orange = stores) and
                the source note sit in one dashed box */}
            <div className="rwf-keybox">
              <p className="rwf-chart__key rwf-chart__key--shared"><span><i className="rwf-chart__sw rwf-chart__sw--a" />Scheduled orders</span><span><i className="rwf-chart__sw rwf-chart__sw--b" />Stores live</span></p>
              {/* mukuubjs (28 Sep): where the data comes from, not how it was pulled (writing harness, Sauer register, gate clean) */}
            <p className="rwf__source">Source: Zepto's own order records, every order booked with a delivery slot, from the first on 10 October 2025 to 21 September 2026. The daily orders and store counts come from seven checkpoint days in the rollout, 10 October to 23 December 2025.</p>
            </div>
          </>
        )}
        {s.charts && (
          <>
            <div className="rwf__charts"><CancelChart /><AovChart /><SlotChart /></div>
            <p className="rwf__source">{SOURCE_NOTE} Order values match 55% of scheduled orders to the GMV table, so they are indicative.</p>
          </>
        )}
        {s.kind === "qa" && (
          <dl className="rwf__qa">
            {/* mujvjphh (27 Sep): a big filled icon anchors each point */}
            {s.qa.map(([q, a], i) => {
              const I = [ShoppingCartSimple, CalendarX, WarningCircle, ChartBar][i];
              return (<div key={q}>{I && <span className="rwf__anchor" aria-hidden><I weight="fill" /></span>}<dt>{q}</dt><dd>{a}</dd></div>);
            })}
          </dl>
        )}
        {s.cadence && !noCad && <Cadence s={s} />}
        {s.thread && (
          <div className="rwf-thread" aria-label="Review thread from the design file, paraphrased">
            <p className="rwf-thread__head">From the design file <span>paraphrased, not verbatim</span></p>
            {/* compact (the tabbed view, mukq87g4): the three comments that became rules */}
          {(compact ? s.thread.slice(0, 3) : s.thread).map((c, i) => (
              <div className="rwf-thread__row" key={i}>
                <div className="rwf-thread__comment">
                  <span className="rwf-thread__av" aria-hidden>{c.who.split(" ").map((w) => w[0]).join("")}</span>
                  <div>
                    <p className="rwf-thread__meta"><b>{c.who}</b> · {c.role} · {c.when}</p>
                    <p className="rwf-thread__text">{c.text}</p>
                  </div>
                </div>
                <p className="rwf-thread__led">{c.led}</p>
              </div>
            ))}
          </div>
        )}
        {s.note && <p className="rwf__note">{s.note}</p>}
      </div>
  );
  // `embedded` (mukq4l29): just the body, for a tab panel inside another section
  if (embedded) return body;
  return (
    <section className={"rwf" + (s.stack ? " rwf--stack" : "")} aria-label={s.tag}>
      <p className="rwf__tag">{s.tag}</p>
      {body}
    </section>
  );
}

// `only` (28 Sep, the presenting cut): render just these slide tags, in this order
// mukq4l29 (28 Sep): the five "how I worked" slides, from Working with product
// up to Team leadership, are ONE section with five tabs, "Leading with design".
// Each tab shows that slide's own content, unchanged.
const LEAD_GROUP = [
  ["Leadership", "Team leadership"], // muku1j7t (28 Sep): Leadership first
  ["Product", "Working with product"],
  ["Engineering", "Working with engineering"],
  ["Content", "Working with content"],
  ["Supply chain", "Working with supply chain"],
];
function LeadingWithDesign() {
  // mukt9s3o (28 Sep): Leadership is the tab that opens by default
  const [on, setOn] = useState(() => LEAD_GROUP.findIndex(([label]) => label === "Leadership"));
  const tabs = useRef([]);
  const slides = LEAD_GROUP.map(([, tag]) => SLIDES.find((x) => x.tag === tag));
  const key = (e) => {
    const d = e.key === "ArrowRight" || e.key === "ArrowDown" ? 1 : e.key === "ArrowLeft" || e.key === "ArrowUp" ? -1 : 0; // mukwa8bz: vertical list, up/down move too
    if (!d) return;
    e.preventDefault();
    const n = (on + d + LEAD_GROUP.length) % LEAD_GROUP.length;
    feedback("navigate");
    setOn(n);
    tabs.current[n]?.focus();
  };
  return (
    <section className="rwf rwf--tabs" aria-label="Leading with design">
      <p className="rwf__tag">Leading with design</p>
      <div className="rwf__tabwrap">
        {/* mukq87g4 (28 Sep): all five panels share ONE grid cell and only the
            active one is visible, so the section is always as tall as the
            tallest tab and never changes height when you switch */}
        <div className="rwf-tabs__stack">
          {slides.map((sl, i) => sl && (
            <div key={sl.tag} className="rwf-tabs__panel" role="tabpanel" id={`lwd-panel-${i}`} aria-labelledby={`lwd-tab-${i}`}
              data-on={on === i ? "true" : undefined} aria-hidden={on !== i} inert={on !== i ? "" : undefined}>
              <Slide s={sl} embedded compact part="main" />
            </div>
          ))}
        </div>
        {/* mukw790w (28 Sep): a right-hand column beside the text: the active
            tab's figure (the crit cadence, on Leadership) with the tab pills under it */}
        <div className="rwf-tabs__side">
        {/* mukvntjs (28 Sep): the tab bar sits BELOW the panel, under the crit-cadence box */}
        <div className="rwf-tabs" role="tablist" aria-label="Leading with design" aria-orientation="vertical" onKeyDown={key}>
          {LEAD_GROUP.map(([label], i) => (
            <button key={label} type="button" role="tab" id={`lwd-tab-${i}`} aria-controls={`lwd-panel-${i}`}
              aria-selected={on === i} tabIndex={on === i ? 0 : -1} className="rwf-tabs__tab"
              ref={(el) => (tabs.current[i] = el)} onClick={() => { if (i !== on) feedback("select"); setOn(i); }}>
              {label}
            </button>
          ))}
        </div>
          {/* mukwg17w: each tab's own visual, all in ONE grid cell (the tallest
              sets the height), so switching tabs never shifts the layout */}
          <div className="rwf-tabs__vizstack">
            {slides.map((sl, i) => sl && hasSide(sl) && (
              <div key={sl.tag} className="rwf-tabs__sidefig" data-on={on === i ? "true" : undefined} aria-hidden={on !== i} inert={on !== i ? "" : undefined}>
                <Slide s={sl} embedded compact part="side" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export default function SchedRoleWireframes({ only }) {
  const list = only ? only.map((t) => SLIDES.find((x) => x.tag === t)).filter(Boolean) : SLIDES;
  const grouped = new Set(LEAD_GROUP.map(([, t]) => t));
  return (
    <div className="rwf-run">
      {list.map((s) => {
        // the tabbed section replaces its five slides on the full page; a
        // hand-picked `only` list (the presenting cut) keeps slides as chosen
        if (!only && grouped.has(s.tag)) return s.tag === "Working with product" ? <LeadingWithDesign key="lwd" /> : null; // the section sits where the first of the five slides was
        // mukq5ujj (28 Sep): "What I'd do differently" closes the whole case study now (App.jsx renders it after Reflection)
        if (!only && s.tag === "What I'd do differently") return null;
        return <Slide key={s.tag} s={s} />;
      })}
    </div>
  );
}
