// The full-flow story for the Scheduled Delivery deck: what the design playground
// (32 flows, 326 cases, all prototyped) adds to the Double Diamond. Spread into
// scheduledDelivery.deck.js at the points marked there; nothing in the original
// slides was changed.
//
// Voice: LOCKED presentation-mode tone (spoken, contractions, plain words, short beats,
// no em-dash, no tilde). Every fact comes from the playground map (flow/map/*.json) or
// its docs; the source of each slide is the `// src:` line above it. Anything the map
// can't confirm is NOT in this file: it lives in docs/sd-story-notes.md as [CONFIRM].
//
// `playground` slides embed a live, synced view of the playground. `embed` is a
// catalog id from src/figures/sdStory/embedCatalog.json (never a hash). See
// docs/sd-story-sync.md.

// ===== DISCOVER =====
export const sdDiscover = [
  // src: schedule.json slots-unavailable-feedback (S-017, S-018, S-019)
  {
    type: "methodFinding",
    kicker: "Discover · Product feedback",
    h: "Then the feedback said: slots run out",
    finding: "Product feedback flagged it: slots sell out during the day.",
    p: [
      "So the picker can't just be a list of open windows. It needs to say what happens when one's gone, and when the whole day is.",
      "I drew it three ways. Greyed chips with no label. A SLOT FULL tag on each full chip. And a plain panel that says ALL SLOTS ARE BOOKED when a day is empty.",
    ],
  },
  // src: schedule.json ut-oct29-research (S-106 to S-110)
  {
    type: "numbered",
    kicker: "Discover · Oct 29 session",
    h: "Three people, one task: schedule what can't ship now",
    items: [
      { title: "Don't let me save yet", body: "One person wanted Save locked until a slot was picked. They also asked why nothing was selected for them." },
      { title: "I might forget the slot", body: "Another worried they'd lose shipment one's slot while picking shipment two. Their fix: show the slot in the collapsed pill, not just \"Scheduled\"." },
      { title: "Removed when?", body: "A third couldn't tell if the unserviceable items were already gone or would go on save. The copy had to say it was on save." },
      { title: "A tick brings peace", body: "The green tick on a scheduled shipment calmed one person. Worth keeping." },
    ],
  },
];

// ===== DEFINE =====
export const sdDefine = [
  // src: schedule.json cases-breakdown-shipment-card (S-025 to S-028)
  {
    type: "playground",
    embed: "flow-schedule-cases-breakdown-shipment-card",
    caseId: "S-025",
    kicker: "Define · The case breakdown",
    h: "Two questions decide every shipment card",
    p: ["Can this shipment go instant? Can it be scheduled? Two answers, four cards."],
    ul: [
      "Both yes: Delivering in 10 min, and the Schedule for later chip lights up",
      "Instant only: nothing changes, the chip goes quiet",
      "Schedule only: an Instant Unavailable tag and a dashed chip, because this one has to be scheduled",
      "Neither: delivery unavailable, and the items move to the wishlist",
    ],
    figure: "The four cards, running. Same components the prototype's built from.",
  },
  // src: schedule.json confirm-page-multi-shipment (S-029, S-030)
  {
    type: "playground",
    embed: "flow-schedule-confirm-page-multi-shipment",
    caseId: "S-029",
    kicker: "Define · Multi-shipment",
    h: "1 of 3, 2 of 3, 3 of 3",
    p: ["Most scheduling carts have more than one shipment. So the page has to read as a set, even with every card collapsed."],
    ul: [
      "1 of 3: Delivering 19 Oct, 5 AM - 6 AM",
      "2 of 3: Delivering in 10 min",
      "3 of 3: Delivery unavailable, items will be moved to wishlist",
      "A shipment that needs a slot and has none says so: select a slot",
    ],
  },
  // src: schedule.json cart-header-states (S-061 to S-070), status final
  {
    type: "playground",
    embed: "flow-schedule-cart-header-states",
    caseId: "S-061",
    kicker: "Define · Reason codes",
    h: "The cart says why, in one line",
    p: ["Behind every blocked shipment is a reason from the backend. The header turns it into a sentence, and a button when there's something to do."],
    ul: [
      "Scheduleable: Schedule for later, with a Schedule button",
      "Store closed: it re-opens at 6AM, add to cart now",
      "Rain: deliveries paused, we'll resume as conditions improve",
      "High demand: back soon in 15 minutes",
      "Order limits: you have 2 active orders, or place your next one tomorrow",
    ],
    figure: "The final headers, one per reason code.",
  },
  // src: synthesis of the four slides above plus the existing deck (see docs/sd-story-notes.md)
  {
    type: "numbered",
    kicker: "Define · Principles",
    h: "Four rules the cases follow",
    items: [
      { title: "Say why, in one line", body: "Every blocked shipment gets a reason a person can read. Store closed. Rain. High demand. An order limit." },
      { title: "Show the broken thing", body: "A shipment with no way to deliver says so, and says where its items go. The wishlist." },
      { title: "Keep the commitment in view", body: "Collapse a card and it still says its slot. People told us they forget." },
      { title: "Offer a way out", body: "Where a store is shut or a day is full, the cart says when to come back, or lets you schedule." },
    ],
  },
];

// ===== DEVELOP: the toggle, after "The real work: where every control lives" =====
export const sdDevelopToggle = [
  // src: schedule.json ut-prototypes + variants V-01 to V-03
  {
    type: "numbered",
    kicker: "Develop · The toggle",
    h: "Three ways to choose between now and later",
    items: [
      { title: "UT 01: dual toggle", body: "Instant and Schedule side by side in each shipment card. A sheet holds the stack, Save sits at the bottom, and a second sheet confirms which items get removed." },
      { title: "UT 02: three options", body: "Instant, Schedule, and a third: Remove Items, which clears the cart. The separate unserviceable panel goes away." },
      { title: "UT 03: mini toggle", body: "A small pill per shipment that carries its own state. 9 mins. Aug 18, 5-6 AM. Unserviceable. Removed." },
    ],
  },
  // src: ut-prototypes S-104; research S-108
  {
    type: "playground",
    embed: "flow-schedule-ut-prototypes",
    caseId: "S-104",
    kicker: "Develop · The toggle",
    h: "The pill that remembers",
    p: [
      "UT 03 answered the person who'd forget. The slot sits in the pill, so shipment one still says its window while you're busy with shipment two.",
    ],
    figure: "UT 03, running. Tap through the cases to compare the three.",
  },
  // src: slot-picker-m4 S-001/S-002, collapsed-card-slot-summary S-044..S-047, cart-header-states S-070, cases S-028
  {
    type: "numbered",
    kicker: "Develop · Where it landed",
    h: "What the page kept",
    items: [
      { title: "Two cards, one choice", body: "Instant and Schedule stay as two cards on the shipment, the way UT 01 had them. Pick one and the slot picker opens or closes." },
      { title: "The slot, on the collapsed card", body: "From UT 03 and the person who'd forget. A collapsed shipment says Delivering 19 Oct, 5 AM - 6 AM. I drew four wordings for that line." },
      { title: "Remove lives in the header", body: "Remove Items never became a third option. A shipment that can't be delivered gets its own header, with a Remove button." },
    ],
  },
];

// ===== DEVELOP: the slot picker, after "Slot-page states: density without confusion" =====
export const sdDevelopSlots = [
  // src: slot-picker-m4 S-001 to S-008 (the 8 prototyped states a1 to c1), canvas
  {
    type: "playground",
    layout: "wide",
    embed: "states",
    kicker: "Develop · The slot picker",
    h: "Eight states, one screen",
    p: ["The picker has to hold a lot. So I drew every state it can be in, and ran them all."],
    figure: "Instant selected. Instant unavailable. Schedule unavailable. Past slots in the morning. A full evening. The next-day pick. Tomorrow's full grid.",
  },
  // src: slot-picker-m4 S-001 to S-004 outcomes; docs/qa-notes.md
  {
    type: "playground",
    embed: "schedule",
    state: "a1",
    kicker: "Develop · Try it",
    h: "This is the real component",
    p: ["Not a recording. Tap a slot. Flip to Tomorrow. Switch to Instant and back."],
    ul: [
      "Instant unavailable greys the Instant card and keeps Schedule as the path",
      "Schedule unavailable is the only state where Confirm is disabled",
      "In the morning, slots that have passed can't be picked",
    ],
  },
  // src: slots-unavailable-feedback S-017 to S-024
  {
    type: "playground",
    embed: "flow-schedule-slots-unavailable-feedback",
    caseId: "S-019",
    kicker: "Develop · When a slot's gone",
    h: "Slots sell out, so the picker says so",
    p: [
      "Three answers are in the file. Greyed chips. A SLOT FULL tag on each one. And when the whole day's gone, a panel that says ALL SLOTS ARE BOOKED.",
    ],
    figure: "Same picker, drawn for each answer. The returns pickup page borrows it too.",
  },
];

// ===== DEVELOP: the cart, after "The stuck cart, shown in plain sight" =====
export const sdDevelopCart = [
  // src: cart.json ftb-cart-entry-states (C-001 to C-012), status dev-ready
  {
    type: "playground",
    embed: "flow-cart-ftb-cart-entry-states",
    caseId: "C-001",
    kicker: "Develop · The cart",
    h: "How people meet it in the cart",
    p: ["The dev handover covers the first time, the second time, and the cart that can't ship now."],
    ul: [
      "First time: a pop-up introduces Schedule Delivery and points at the picker",
      "Coming back: the bottom tray lights up with a nudge to pick a time",
      "Items that can't ship now: a banner explains and offers Schedule Now",
      "There's a limit of 5 scheduled orders a day, and it has its own state",
    ],
    figure: "The handover states, running. Next to them in the file: the picker, with skip, view items and no-slots.",
  },
];

// ===== DEVELOP: returns, after "The same picker, now for returns and refunds" =====
export const sdDevelopReturns = [
  // src: returns.json scheduled-exchange-return (SE-001 to SE-015)
  {
    type: "playground",
    embed: "flow-returns-scheduled-exchange-return",
    caseId: "SE-007",
    kicker: "Develop · Exchange and return",
    h: "Exchange some, return the rest, in one go",
    p: [
      "One request can exchange some items and return others. Pick the items, say what you want for each, and the review shows two pickup partners, the refund method and the pickup time.",
      "That pickup time is the slot picker again.",
    ],
  },
  // src: returns.json pickup-slot-picker (PK-001, PK-003)
  {
    type: "playground",
    embed: "flow-returns-pickup-slot-picker",
    caseId: "PK-001",
    kicker: "Develop · Pickup slots",
    h: "Pickup is the same idea",
    p: [
      "Instant Pickup in 9 minutes, or Scheduled for Later with a day and a slot grid. When nothing's open, the grid says the slots are booked.",
    ],
  },
  // src: returns.json cs-chat-exchange (EX-001 to EX-026)
  {
    type: "playground",
    embed: "flow-returns-cs-chat-exchange",
    caseId: "EX-003",
    kicker: "Develop · In chat",
    h: "Or ask in chat",
    p: [
      "The same exchange can start in Help and Support. A bot called Zap checks what's eligible, offers the exchange, confirms you'll be home, and places the replacement order.",
      "When it can't, it pitches a return instead.",
    ],
  },
  // src: returns.json order-tracking-states (TR-001 to TR-015), refund-handling (RF-001 to RF-004)
  {
    type: "playground",
    embed: "flow-returns-order-tracking-states",
    caseId: "TR-002",
    kicker: "Develop · Tracking and refunds",
    h: "Tracking has two chains",
    p: [
      "A replacement goes: getting packed, on the way, arrived, delivered, with the old item picked up. A return goes: rider on the way, arrived, picked up, then refund initiated and refund credited.",
      "The refund lands in Zepto Cash straight away, or back at the source account in 3 to 5 days.",
    ],
  },
  // src: returns.json otp-pickup-handover (OT-001 to OT-005)
  {
    type: "playground",
    embed: "flow-returns-otp-pickup-handover",
    caseId: "OT-002",
    kicker: "Develop · Handover",
    h: "The rider needs the OTP",
    p: [
      "On pickup day the order status page offers See OTP. Share it, and the rider collects the item. One OTP per rider, so an exchange and a return together don't get tangled.",
    ],
  },
];

// ===== DEVELOP: offers and edge cases, after "Cancellation, and where it lived in v1" =====
export const sdDevelopOffers = [
  // src: cart.json bxgy-offer-combined-cart, swap-save-and-add-on-constructs (both on-hold)
  {
    type: "playground",
    embed: "flow-cart-bxgy-offer-combined-cart",
    caseId: "C-065",
    kicker: "Develop · Offers (on hold)",
    h: "Offers got complicated fast",
    p: [
      "On a combined cart an offer has to work across shipments. Buy 2, get 10% off. Swap three items and save 60 rupees. Special-price add-ons.",
      "All of it is designed and prototyped. All of it is on hold.",
    ],
  },
  // src: cart.json unservisability-cases, oos-limit-and-edge-cases (both on-hold)
  {
    type: "playground",
    embed: "flow-cart-unservisability-cases",
    caseId: "C-101",
    kicker: "Develop · Edge cases (on hold)",
    h: "When the cart can't ship",
    p: [
      "Out of stock. One store unserviceable. Both. Each one drawn with a schedule path and without.",
      "The pay button stays disabled until you choose: schedule it, remove the items, or come back later.",
    ],
  },
];

// ===== DEVELOP: motion and system, closing the phase =====
export const sdDevelopSystem = [
  // src: docs/motion-map.md
  {
    type: "playground",
    embed: "schedule",
    state: "a2",
    kicker: "Develop · Motion",
    h: "Motion is a small set of named moves",
    p: ["Enter, Exit, Emphasis, Spring. Durations and easings come from tokens, so one change moves everything. Reduced motion keeps the meaning and drops the movement."],
    ul: [
      "The shipment card enters first, the footer 0.12 seconds later",
      "The slot grid arrives on a Spring at 0.2 seconds",
      "The selected Schedule card pops with Emphasis at 0.4 seconds",
    ],
    figure: "Tap Schedule to replay the pop.",
  },
  // src: tokens/ZEPTO-NOTES.md, docs/qa-notes.md, docs/build-flows.md
  {
    type: "numbered",
    kicker: "Develop · The system",
    h: "The system underneath",
    items: [
      { title: "One token file", body: "Colour, type, space, radius and motion live in one place. The prototypes and the embeds read it, so a token change shows up everywhere." },
      { title: "Zepto's own values", body: "The tokens are read straight from Zepto's Figma library, and the components are built only from them. ShipmentCard, DeliveryModeCard, DateTabs, SlotChip, SlotGroup, BottomSheet." },
      { title: "What the file didn't have", body: "Zepto's dark mode was placeholder-grade, so the dark tokens are derived and marked that way. Some colours, like the orange on the selected Schedule card, were never bound to a variable." },
      { title: "The font", body: "Zepto Norms is proprietary, so the web build uses Figtree. It runs wider, so a few titles are tightened to stay on one line." },
    ],
  },
];

// ===== DELIVER: after "What 45 users told us", before the reflections =====
export const sdDeliver = [
  // src: flow/map/*.json flow statuses (counts computed from the three files)
  {
    type: "numbered",
    kicker: "Deliver · Status",
    h: "What's ready, what's waiting",
    items: [
      { title: "Dev ready and final: 90 cases", body: "The cart headers, the handover states, the picker inside it, order tracking, cart composition. Seven flows." },
      { title: "In progress: 125 cases", body: "The slot picker page and the whole returns family. Ten flows, marked WIP in the file." },
      { title: "On hold: 50 cases", body: "Offers and the combined-cart edge cases. Five flows, designed and prototyped, waiting on a decision." },
      { title: "Exploring: 61 cases", body: "Toggles, banners, coachmarks, the Oct 29 research. Ten flows. Where the ideas were tested." },
    ],
  },
  // src: docs/canvas.md
  {
    type: "playground",
    layout: "wide",
    embed: "canvas",
    fit: "scale",
    kicker: "Deliver · The canvas",
    h: "All eight states, on one canvas",
    p: ["Pan and zoom like a Figma file. The frames are the real components. Double-click one and it's live."],
  },
  // src: embed-catalog.json prototype-*, storyboard-*
  {
    type: "playground",
    embed: "prototype-tonight",
    kicker: "Deliver · Journeys",
    h: "Five journeys, walked end to end",
    p: [
      "Instant. Tonight. Tomorrow. Instant unavailable. Nothing available.",
      "Each one has a filmstrip and a guided prototype. This is Schedule for tonight.",
    ],
  },
  // src: flow/map/*.json totals (32 flows, 326 cases: 111 + 101 + 114), docs/build-*.md
  {
    type: "playground",
    layout: "wide",
    embed: "map",
    kicker: "Deliver · The full map",
    h: "326 cases, 32 flows, all prototyped",
    p: [
      "Schedule Delivery, 111 cases. Returns, refunds and exchange, 101. Cart, offers and entry points, 114. Every case has a screen you can open.",
    ],
    figure: "The master map. Filter by cluster, flow or status. A few research and asset cases are small viewers instead of full screens.",
  },
  // src: schedule.json / returns.json / cart.json inconsistencies + openQuestions
  {
    type: "numbered",
    kicker: "Deliver · Learnings",
    h: "What the full map caught",
    items: [
      { title: "The numbers disagree", body: "Date tabs say 13 Slots and 0 Slots on screens that list slots under Tomorrow. Slot counts need one source." },
      { title: "Confirm needs a rule", body: "Confirm is drawn enabled even with no slot selected. The research said it should wait for one." },
      { title: "Unavailable has six wordings", body: "Back soon. Unavailable. Currently unavailable. Not Available. Temporarily unavailable. And again in capitals. Pick one." },
      { title: "Two doors for returns", body: "Exchange and return are drawn in chat and in the app, and both read as current. Which one ships is still open." },
    ],
  },
];
