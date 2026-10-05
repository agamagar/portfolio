// The Zepto Scheduled Delivery PRD, synthesized from the product model, the
// "Schedule Order Handoff" Figma file (506 comments / 350 threads, Aug 2025 to
// Jun 2026), the case study, and the 2026-06-29 deep-research field gap analysis,
// into the same shape the Away / Dashh PRDs use, so it renders as native portfolio
// DOM via PrdRenderer. WIP / Draft v0.1.
//   [GAP]        content not yet confirmed / not in source.
//   [UNVERIFIED] a public or external claim to confirm before external use.
//   [confirm]    a real Zepto mechanic the case asserts that Agam should verify.
// Portfolio rule: no em-dashes, no tildes. Commas / periods / colons instead.

export const scheduledPrdData = {
  synthesis: {
    oneLiner:
      "Priya, building a cart on the train she cannot receive for three more hours. Scheduled Delivery adds 'later' to a platform whose entire promise is 'now', without spending the trust that makes 'now' work.",
    execSummary:
      "Scheduled Delivery lets a Zepto user pick a future one-hour window instead of instant delivery. It is a cart-level management tactic used after the user has decided what to buy, not a discovery feature, which is the rationale that killed every product-page placement. Because a Zepto cart splits into one to four shipments by fulfilment hub, scheduling resolves per shipment: each shipment independently is instant-available and/or schedule-available, so the Instant/Schedule control's state is decided shipment by shipment. The user picks one one-hour slot per shipment on a dedicated schedule page, with every shipment and its chosen slot held visible until pay. On confirm the order becomes a scheduled order: the tracking page swaps Zepto's default 10-minute countdown for a 'Scheduled for [day], [window]' card mirrored on home and in My Orders, then roughly 30 minutes before the slot it wakes up, a rider is assigned, and it rejoins the familiar 10-minute flow to land inside the window. Shipped in two milestones: M1 (23 Oct 2025) was scoped deliberately narrow, scheduling only for a single unserviceable shipment with slots available and Schedule as the primary cart CTA; M2 (10 Nov 2025) opened it to multi-shipment carts with the full per-shipment state matrix and the cart-CTA-by-shipment-mix logic. The same slot-picker pattern later extended into a Returns and Refunds pickup track.",
    theBet:
      "The defensible insight is that this is a trust problem before it is a UX problem. Zepto's whole promise is instant, so the moment you offer a future slot you are asking people to trust that 'later' will arrive exactly when promised, from the one product built on not making you wait. The bet: restraint everywhere, so scheduling reads as a peer of instant, never a degraded fallback, and never dilutes the instant promise. The field backs this framing. Reliability has overtaken speed as the primary consumer delivery priority (McKinsey: speed #1 in 2022 to #5 by 2024; Narvar 2025: delivery-date accuracy outranks even cost at checkout, 57% vs 56%), and a formal operations model shows that when the gap between a fast tier and a slow tier is small, the slow option cannibalizes the premium one, which is the math under the 'later dilutes now' fear.",
    governingRules: [
      "Instant is untouchable. Scheduling sits beside instant as a peer, never as the sad fallback. Any treatment that makes instant feel optional is wrong.",
      "The user owns the commitment. Every shipment and its chosen slot stay visible until pay; a summary you can see is itself a trust mechanism, because people commit to 'later' only when they can see exactly what they committed to.",
      "Positive copy, always. Titles and states never lead with the negative. Three reviewers (Nishit, Ciara, Harish) independently killed negative framing across ten months; even a bad state (unserviceable, slot expired, items moved) is stated factually, not apologetically.",
      "Architecture invariant: the shipment is the atom. A cart splits by hub into one to four shipments; scheduling, state, and slots all resolve per shipment, never per order.",
      "Precision is the promise. Fixed one-hour committed windows, no discount-for-vagueness lever. The moment you sell a looser window at a discount, you concede that precision is a premium, and precision is the whole argument.",
    ],
    northStarMetric:
      "Proposed (WIP): on-time-within-window rate, the share of scheduled orders delivered inside the chosen one-hour slot without a miss. It is the literal measure of whether 'later' is trustworthy. Paired with scheduled adoption and scheduled AOV so trust is never bought by suppressing volume. Guardrail metric: instant's own conversion and speed must not move, proving scheduling did not dilute the core. [confirm: no north-star was formally defined in source; this is a proposal.]",
    whyNowProblem:
      "Three high-intent users keep abandoning full carts, and none of them is failing to find the product, they are failing to commit to the timing. The commuter builds a cart on the train but cannot receive a 10-minute delivery from a moving train. The user on a coverage edge finds instant unavailable after about 9pm and reads it as a broken promise. The weekly-shop planner wants a 40-item basket the impulse-tuned 10-minute mode was never built to hold. The intent is present; only the timing is wrong. Quick-commerce demand is splitting from 'impulse vs planned' into 'need now vs can wait', so one brand now has to serve both intents.",
    visionPrinciples: [
      "Reveal the model bit by bit. Do not dump the hub split or the state matrix up front; let the four-way split land only when scheduling makes it bite.",
      "Center the worst case, not the happy path. Almost all real scheduling happens on mixed carts (some items instant, some unavailable), so the design starts there.",
      "Honest unavailability. Disabled-not-hidden where a slot could return; an honest 'store unserviceable' when neither instant nor schedule works; never a silent failure.",
      "Speak first when something slips. Most delivery anxiety is caused by the missing heads-up, not the delay itself, so the product surfaces a problem before the user has to go looking.",
    ],
    strategicContext:
      "[UNVERIFIED, postdates the design work] In January 2026 India's labour ministry reportedly asked Blinkit, Swiggy Instamart, and Zepto to drop the '10-minute' marketing promise (TechCrunch). If the instant promise is under regulatory pressure, a credible 'later' stops being a side feature and becomes a strategic hedge. Forward-looking only; confirm before any external use.",
  },

  pillars: [
    {
      key: "cart",
      title: "Cart integration (the placement decision)",
      oneLiner:
        "Scheduling lives in the cart, per shipment, on one page where every shipment and slot stays visible. The reference decision of the whole feature.",
      lockedDecisions: [
        "Placement is the cart, per shipment. The product page was killed: 'schedule this item' in discovery mode creates a negative-listing problem (the implication 'you might not get this now'), the exact fear the feature exists to avoid.",
        "Structure is a single-page listing: every shipment is an expanded card, every slot choice stays on screen, the full commitment reads at a glance before pay.",
        "A home-screen prompt ships as a restrained, reachable nudge, not an interruption.",
      ],
      requirements: [
        "Persistent summary: every shipment and its chosen slot visible until pay.",
        "Inline expand/collapse per shipment on the cart; scheduling itself opens the dedicated schedule page that lists every shipment.",
        "Cart CTA copy resolves by shipment mix (M2): all shipments serviceable, 'Click to Pay'; any shipment unserviceable with slots, 'Select delivery options'; one instant + one unserviceable (no slots), 'Remove Unserviceable' (retain the existing flow); one unserviceable-with-slots + one unserviceable-no-slots, 'Select delivery options' into the schedule page with the bottom-sheet removal flow.",
        "Multi-shipment scroll affordance (users may not know to scroll past shipment 1), flagged as a recurring UX risk by the PM in Aug 2025.",
        "Default-select the Schedule CTA when the user taps schedule (Nishit Raj rule).",
      ],
      keySurfaces: ["Cart, full view", "Cart, scheduled state", "Per-shipment Schedule control"],
      moat: [
        "The persistent summary is the trust mechanism. Baymard documents users rebuilding carts after discovering a fulfilment split late; the single-page listing is the designed answer to that failure mode.",
      ],
      v1: "M1 (23 Oct 2025): scheduling enabled only for the narrow entry case, a SINGLE shipment that is unserviceable with slots available; Schedule shows at shipment level and as the PRIMARY cart CTA. Multi-shipment carts (one serviceable, one not) stayed on the BAU flow with no scheduling shown at all. Scoped narrow on purpose.",
      v2: "M2 (10 Nov 2025): multi-shipment scheduling. Schedule button visible at shipment level in all cases, greyed where slots are unavailable; the cart CTA resolves by shipment mix (see requirements).",
      northStar: "Users confident in the full commitment before pay, not after.",
      openQuestions: [
        "'Shipment' vs 'delivery' terminology (raised for B2C recognisability, never cleanly closed). [confirm]",
        "Explicit secondary 'move to wishlist' button per shipment vs auto-apply (parked to M3 by a tech constraint).",
      ],
      sources: ["Schedule Order Handoff (Figma)", "scheduled-delivery-handoff.md"],
    },
    {
      key: "slots",
      title: "Slot picker",
      oneLiner:
        "One-hour windows, six at a time, bucketed by time of day, with a dynamic 'Earliest' and a cross-midnight relabel that makes the timeline read the way the day is actually lived.",
      lockedDecisions: [
        "Fixed one-hour windows as shown to the user, six at a time, then 'More slots' (appended, chronological). Behind that one-hour display the backend fulfilment window was about 1.5 hours, deliberate margin for dark-store execution so the promised window holds; the team kept tuning that figure against real-world conditions.",
        "Buckets: Earliest (dynamic, the next bookable block from now), Afternoon, Evening, Night, Late Night, Early Morning.",
        "Store type drives the slot set: a DARK STORE shows same-day slots only (Today tab; last window 11 PM-12 AM; if none are left, Schedule is disabled for that shipment, and scheduling is off entirely in the nightly scenario), while a SUPERSTORE shows Today / Tomorrow / Later (multi-day, 'up to X days') and stays schedulable even with no same-day slot, defaulting a closed store to tomorrow's earliest slot. A calendar was rejected as overkill for this range. This split is the engine under the buckets: the dark store is the near-you 10-minute store, the superstore is the planning store.",
        "Picker surface (resolved): the forward cart schedule is a dedicated NEW PAGE (not a bottom sheet over the cart) listing every shipment; the slot picker opens per shipment there (QA: a bottom-sheet picker with Today/Tomorrow tabs, earliest pre-highlighted). The slots-inline-on-the-same-page treatment was built for the RETURNS AND REFUNDS flow, not the forward cart, so 'inline, never a bottom sheet' describes R&R, not this.",
        "AM/PM on every slot pill (Kavya Jain); a separator so pills do not visually hang; selected-slot fill explored in pink/magenta; one slot per shipment, selection highlighted and persisted across collapse.",
        "0-slots: do not grey out the day tab, show it with 0 and default-open the day that has at least one slot; an explicit 'No slots available' empty state.",
      ],
      requirements: [
        "Earliest recalculates continuously (at 3pm it can be the 3 to 6 block).",
        "Cross-midnight relabel: the same post-midnight windows are Late Night at the tail of today and Early Morning at the head of tomorrow, relabeled in place on the day switch; a later iteration removed the seam into one continuous cross-day scroll.",
        "Today is partial (earlier windows have passed), Tomorrow opens fully; the switcher communicates both at a glance.",
        "validateSlots (IRIS) failure shows a toast: 'Selected slot is not available. Please try again in some time.'",
      ],
      keySurfaces: ["Schedule page", "Today/Tomorrow day switcher", "Slot grid (default, picked, partial, full, cross-day)"],
      moat: [
        "The cross-midnight relabel is a genuine craft signature; nothing in the 23-source field scan does this continuity.",
        "Concrete one-hour windows are the right trust instrument: uncertain waits feel longer than known finite ones.",
      ],
      v1: "One-hour slots, six at a time, buckets, dynamic Earliest, Today/Tomorrow switch, relabel, shipped.",
      v2: "Seamless continuous cross-day scroll (seam removed).",
      northStar: "The picker reads like the day actually feels, not a grid you translate.",
      openQuestions: [
        "Slot-reservation hold: a hold clearly exists behind the 'slot expired before pay' state, but its mechanics (TTL, contention) were a backend concern the design did not surface, out of scope here. Reference pattern: Instacart fences a chosen slot for a fixed 10 minutes and makes the order impossible to place without the hold id.",
        "Tomorrow's exact bucket labels in the reconstruction need confirming against the live build. [confirm]",
      ],
      risks: ["A slot can be there at 3pm and gone by 4 (capacity is rider-driven, see system spec); the picker must not imply permanence."],
      sources: ["Schedule Order Handoff (Figma)", "Instacart Connect API (service option hold, list service options)"],
    },
    {
      key: "states",
      title: "The state matrix (per shipment)",
      oneLiner:
        "The difference between a feature that works in the demo and one that works in the world. Every Schedule-button and scheduled-page state, drawn.",
      lockedDecisions: [
        "Per-shipment Schedule-button states: instant+schedule both available; schedule disabled (no slots open, greyed not hidden); schedule hidden (the delivery PIN code / area is not enabled for scheduling, geographic serviceability); schedule-only highlighted (instant unavailable, the only action); store unserviceable (neither works); scheduling limit reached (BOTH caps are live: max 2 ongoing scheduled orders at a time, and 5 scheduled orders per day per Ciara's 'Only 5 orders can be scheduled per day' copy); first-run education modal (one-time); items auto-moved to another shipment + save-to-wishlist; slot expired before pay.",
        "Scheduled-page states: schedule selected (no slot yet); default picker; slot picked; instant+scheduled mix; partial day (some slots full, greyed but visible); cross-day late night; tomorrow full (no slots); scheduled pickup OTP.",
      ],
      requirements: [
        "Confirm CTA is enabled for all cases (M2).",
        "Unserviceable + no-slots shipment: card tagged unserviceable with no actions, copy 'Delivery options currently unavailable'; on Confirm a bottom sheet states the shipment will be removed and wishlisted, with 'Go back' and 'Proceed to Checkout'.",
        "No slot selected but the user proceeds: if instant is available the shipment defaults to instant; if instant is not available, a bottom sheet shows 'Below items will be removed from cart and moved to wishlist' with 'Go back' or 'Proceed to checkout'.",
        "Copy by scenario, no design change: store closed shows 'Store is closed. Re-opens at 6AM'; high-demand swaps are copy-only.",
        "Daily-limit copy: 'Schedule limit reached. Only 5 orders can be scheduled per day.'",
        "Wishlist-recovery copy (shipped, past tense, factual): 'Unserviceable items have been moved to your wishlist.'",
        "Edge case (M1): a single-item scheduled shipment that is removed and re-added (via superstore or dark store) must NOT retain its scheduled state; the new shipment starts clean.",
        "Edge case (M1): once an order is placed, later cart additions must NOT retain the previously selected slot; slot details reset after purchase.",
      ],
      keySurfaces: ["Per-shipment cart matrix (contact sheet)", "Scheduled-page state set (contact sheet)"],
      moat: ["Honest disabled-not-hidden discipline; backed by the transparency and WISMO literature (surfacing the broken thing beats failing silently)."],
      v1: "Full per-shipment cart matrix and scheduled-page state set, shipped.",
      openQuestions: [
        "Multi-shipment order-history copy: 'your order is scheduled for delivery' is a placeholder when an order is partly instant and partly scheduled (flagged by eng). [GAP]",
        "Reschedule into a now-full slot; notification-permission prompt; slot-page loading skeleton; near-midnight day rollover (proposed, confirm in figures).",
      ],
      sources: ["Schedule Order Handoff (Figma)", "SchedCartStates / SchedPageStates figures"],
    },
    {
      key: "lifecycle",
      title: "Post-booking lifecycle (keeping the promise)",
      oneLiner:
        "Where the bet pays off: the 10-minute promise is deferred, then honoured, landing inside the window the user chose.",
      lockedDecisions: [
        "Confirm swaps the 10-minute countdown for a 'Scheduled for [Today/Tomorrow], [window]' card, mirrored on home and in My Orders.",
        "Reminders fan out: push, in-app strip pinned at the home foot, and WhatsApp. WhatsApp was designed-for, not shipped (no WhatsApp engine live at launch).",
        "About 30 minutes before the slot the order wakes up: rider assigned, packing starts, and it becomes the standard 10-minute real-time flow, landing inside the window.",
        "Slot EDIT before order confirmation shipped: an Edit button on the cart callout reopens the picker (e.g. 6-7 PM replaces 4-5 PM); editing is not allowed after confirmation. Cancellation is allowed up to 30 minutes before the slot, and ONLY through the chat bot. Post-confirmation reschedule came later (M3+). Riders get their own scheduled-order screen.",
      ],
      requirements: [
        "The card persists until fulfilled; the promise stays visible.",
        "ETA populates only when dispatched; before that, show the scheduled time.",
      ],
      keySurfaces: ["Order tracking (scheduled)", "Home strip", "My Orders", "Rider scheduled-order screen"],
      moat: [
        "The wake-up reveal is backed by the labor-illusion research (operational transparency raises perceived value), with the documented caveat that it backfires on a bad outcome, so the design keeps the wake-up quiet and reserves visible effort for when things go right.",
      ],
      v1: "Scheduled-for card, push + in-app reminders, the wake-up hand-off, shipped (M1/M2). Cancel available; full edit and reschedule came post-launch (M3+), not at launch.",
      v2: ["Order editing and reschedule (M3+).", "WhatsApp reminders (engine needed).", "iOS Dynamic Island live activity (Arriving Soon to Out for Delivery), designed-for, needs the Live Activity entitlement."],
      northStar: "The wake-up is unremarkable; the order just resumes and lands on time.",
      openQuestions: ["WhatsApp aggressiveness and opt-out. [GAP]", "Dynamic Island scope and entitlement. [confirm]"],
      sources: ["Schedule Order Handoff (Figma)", "SchedPostBooking figure"],
    },
    {
      key: "failure",
      title: "Failure and recovery (the honest underside)",
      oneLiner:
        "A promise you can see is a promise you can also watch break. The states that decide whether 'later' is actually trustworthy, including the real late-slot failure path (auto-cancel and compensate) most case studies would quietly hide.",
      lockedDecisions: [
        "Unserviceable shipment is flagged in place (the other shipments continue), with a save-to-wishlist recovery path; the cart is not lost.",
        "Slot expired while away: 'review the schedule again' before pay.",
        "Late-slot rule (shipped): +30 min past the slot end, the user can manually cancel; +60 min past the slot end, the order AUTO-CANCELS with a token of apology, a Rs.50 coupon, and a text message.",
        "Availability-drift review (shipped): returning to the cart or schedule screen after closing the app surfaces a 'Schedule needs review' bottom sheet, 'Product availability has changed since your last visit', with a 'Review Schedule' button.",
        "Cancellation is allowed up to 30 minutes before the slot, and ONLY through the chat bot, which ties this feature to the support-chat track.",
      ],
      requirements: [
        "SHIPPED (was flagged a gap, in fact specced): late-slot / SLA-miss recovery via auto-cancel-and-compensate (the +30 / +60 rule above). Note the model is cancel-and-refund, not a reflow into another fulfilment mode the way Walmart reflows a late slot into a pickup offer with a 24-hour window; reflow stays a v-next option.",
        "SHIPPED (partial): the between-visits availability-drift review ('Schedule needs review'). The remaining open case is the at-wake-up live-stock re-check.",
        "[GAP, narrowed] At-wake-up stock re-check: the ~30-min wake-up should re-validate live stock and offer a substitute or line refund before the rider moves. Baymard documents substitution-confirmation as core grocery UX.",
        "Out of scope for this design work: the payment auth-vs-capture timing for a future order (a backend concern the UX did not need to surface). The standard pattern is authorise at booking, capture at wake-up.",
      ],
      keySurfaces: ["Unserviceable shipment state", "Slot-expired review", "'Schedule needs review' drift sheet", "Late-slot auto-cancel + Rs.50 compensation"],
      v1: "Unserviceable handling, slot-expired review, the late-slot +30/+60 auto-cancel + Rs.50 compensation, and the 'Schedule needs review' availability-drift sheet, all shipped or specced.",
      v2: "At-wake-up live-stock re-check, and reflow-into-pickup as an alternative to auto-cancel.",
      risks: [
        "Auto-cancel-and-compensate is honest but blunt; a reschedule or pickup-reflow offer would save more orders than a refund plus coupon.",
        "Customer-not-home on a committed slot is more likely than for instant and is not yet modeled. [GAP]",
      ],
      sources: ["Scheduled Delivery QA / experiment sheet (2026-06-29)", "2026-06-29_scheduled-delivery-gap-analysis.md", "Walmart help", "Baymard grocery UX", "Stripe authorization holds"],
    },
    {
      key: "gtm",
      title: "Go-to-market and discovery",
      oneLiner: "Showing up only when it helps. A brief introduction, then out of the way.",
      lockedDecisions: [
        "A promo banner animates once on landing on the schedule page; it does not replay per session.",
        "Entry copy (final): '(New) Orders can be scheduled for later too! Choose when your order arrives.' Tagline options considered: 'Stay one step ahead', 'Ahead of the need', 'Sorted before you need it'.",
        "Fallback framing when instant is unavailable: 'We got you! Instant's unavailable, schedule for later.'",
        "A new schedule icon (the prior candidate already meant 'instant' elsewhere in the app).",
      ],
      requirements: [
        "First-run education modal on the new Schedule button, one-time.",
        "Lottie animations for the banner (production-injected).",
        "PDP 'Back soon' suppression: for the test cohort, the out-of-stock 'Back soon' message is hidden on the product detail page (M1), then updated across all EDLP layouts (M2), so a schedulable item does not read as simply unavailable in discovery. This is how the PDP was handled without placing scheduling there.",
      ],
      keySurfaces: ["Schedule-page banner", "Home nudge / coachmark", "First-run education modal"],
      v1: "Banner + nudge + education modal, shipped (banner motion is a coded stand-in in the case study; production Lottie to swap in).",
      openQuestions: ["Final Lottie assets. [GAP]"],
      sources: ["Schedule Order Handoff (Figma)", "M2: GTM frame"],
    },
  ],

  // The three high-intent users as a comparison matrix. The value is never in
  // doubt for any of them; only the timing is wrong.
  personaMatrix: {
    lead: "Three users, three full carts, none of them tapping pay. Not a discovery problem, a timing problem.",
    dimensions: [
      { key: "moment", label: "The moment" },
      { key: "whyfail", label: "Why instant fails them" },
      { key: "schedules", label: "What they schedule" },
      { key: "risk", label: "The trust risk" },
    ],
    columns: [
      {
        key: "commuter",
        name: "Priya, the commuter",
        archetype: "Plans for the evening",
        cells: {
          moment: "Builds a cart on the train home, will be in by 7:30.",
          whyfail: "Cannot receive a 10-minute delivery from a moving train; no one home now.",
          schedules: "An evening one-hour window she will actually be home for.",
          risk: "Will the slot she picked actually be honoured, hours later?",
        },
      },
      {
        key: "coverage",
        name: "The coverage-edge regular",
        archetype: "Served all day, not at night",
        cells: {
          moment: "Tries to order after about 9pm.",
          whyfail: "Instant is unavailable at the edge of the dark-store network after hours.",
          schedules: "The earliest morning window, so the gap becomes a plan, not a closed door.",
          risk: "Reads 'unavailable' as a broken promise unless 'later' is offered honestly.",
        },
      },
      {
        key: "planner",
        name: "The weekly-shop planner",
        archetype: "Big basket, low urgency",
        cells: {
          moment: "Builds a 40-item Sunday basket.",
          whyfail: "The impulse-tuned 10-minute mode was never built for a planned shop.",
          schedules: "A convenient delivery window for a large, deliberate order.",
          risk: "Wants planning time without feeling like a second-class order.",
        },
      },
    ],
    interfaceNote:
      "All three meet the same surface: the cart, per shipment, on one page. The design does not fork by persona; it earns each of them by being legible and honest about what it can do and when.",
  },

  // Two journey arcs (emotion dips at the friction, recovers at the resolution).
  journeys: [
    {
      name: "Priya schedules from the train",
      archetype: "The commuter",
      arcLabel: "Intent high, blocked by timing, then resolved into a committed evening window.",
      who: "Priya, building a cart on her commute for an evening she has already planned.",
      beats: [
        { beat: "Builds the cart", feeling: "Purposeful", doing: "Adds bread, eggs, vegetables on the train.", thinking: "I will cook when I get in.", emotionScore: 4, painOrDelight: "neutral" },
        { beat: "Hits the timing wall", feeling: "Stuck", doing: "Realises she cannot receive a 10-minute delivery now.", thinking: "There is no one home for three hours.", emotionScore: 2, painOrDelight: "pain" },
        { beat: "Finds Schedule in the cart", feeling: "Relieved", doing: "Sees the Schedule control per shipment.", thinking: "I can pick when this comes.", emotionScore: 3, painOrDelight: "neutral" },
        { beat: "Picks an evening slot", feeling: "In control", doing: "Selects a one-hour window, sees every shipment and slot held visible.", thinking: "I can see exactly what I committed to.", emotionScore: 4, painOrDelight: "delight" },
        { beat: "The order wakes up", feeling: "Reassured", doing: "Gets the reminder; the order rejoins the 10-minute flow about 30 minutes out.", thinking: "It is actually coming, on time.", emotionScore: 4, painOrDelight: "neutral" },
        { beat: "Lands inside the window", feeling: "Trusting", doing: "Receives the order inside her chosen slot.", thinking: "Later arrived exactly when promised.", emotionScore: 5, painOrDelight: "delight" },
      ],
    },
    {
      name: "The coverage-edge user after 9pm",
      archetype: "Instant fails, schedule rescues",
      arcLabel: "A closed door becomes a plan.",
      who: "A regular in an area instant cannot reach late at night.",
      beats: [
        { beat: "Tries to order late", feeling: "Hopeful", doing: "Builds a cart after 9pm.", thinking: "Quick top-up before bed.", emotionScore: 4, painOrDelight: "neutral" },
        { beat: "Instant unavailable", feeling: "Let down", doing: "Hits the coverage edge at checkout.", thinking: "Is Zepto just broken here?", emotionScore: 2, painOrDelight: "pain" },
        { beat: "Offered schedule, honestly", feeling: "Reassured", doing: "Reads 'Instant's unavailable, schedule for later.'", thinking: "Okay, they can still do it, just later.", emotionScore: 3, painOrDelight: "neutral" },
        { beat: "Books a morning slot", feeling: "Settled", doing: "Picks the earliest window for tomorrow.", thinking: "Sorted before I need it.", emotionScore: 4, painOrDelight: "delight" },
        { beat: "Arrives in the window", feeling: "Loyal", doing: "Receives it on time the next morning.", thinking: "The gap was a plan, not a failure.", emotionScore: 5, painOrDelight: "delight" },
      ],
    },
  ],

  specs: [
    {
      eyebrow: "System",
      id: "prd-hubs",
      title: "Hub topology and the split-shipment model",
      summary:
        "The structural reality that makes scheduling a per-shipment feature, not an order-level one.",
      callout: {
        label: "Architecture invariant",
        body: "The shipment is the atom. A mixed cart cannot all ship from one site, so it splits by hub, and every agent of the feature (state, slot, schedule) resolves per shipment.",
      },
      topology:
        "A Mother Hub (largest warehouse, stocks almost everything) feeds superstores (broad catalogue, larger footprint) and dark stores (small, hyper-local, the engine of 10-minute delivery). Category storage is deliberate, so a mixed cart draws from multiple sites.",
      split:
        "A mixed cart splits into one to four shipments, each from a different hub, each on its own clock. Order splitting by inventory availability across warehouse / dark-store / retail hubs is a recognised fulfilment pattern.",
      implication:
        "Each shipment independently resolves instant-availability and schedule-availability, so the Instant/Schedule control's state is decided shipment by shipment, and the cart UI must hold up to four simultaneous, differing states legibly.",
      sources: ["Schedule Order Handoff (Figma)", "Omniful (order splitting and routing)"],
    },
    {
      eyebrow: "System",
      id: "prd-slotsystem",
      title: "The slot system spec",
      summary: "What makes a slot a slot, and why the timeline reads the way it does.",
      callout: {
        label: "What a slot really is",
        body: "A window is bookable only if a rider can stand in that dark store at that hour. Slot availability is rider availability wearing a calendar. That is why Earliest is dynamic, why late-night thins out, and why a slot can be there at 3pm and gone by 4.",
      },
      windows: "Fixed one-hour, non-overlapping windows, six shown at a time, then 'More slots'.",
      buckets: "Earliest (dynamic, next bookable block from now), Afternoon, Evening, Night, Late Night, Early Morning.",
      crossMidnight:
        "The same post-midnight windows are Late Night at the tail of today and Early Morning at the head of tomorrow; crossing Today to Tomorrow relabels them in place. A later iteration removed the seam entirely into one continuous cross-day scroll.",
      lastWindowFix:
        "The day's final window ends at midnight and must read 12 AM, not 12 PM (a real label fix at M2, 10 Nov 2025). Midnight is the head of Early Morning, not noon; the cross-midnight handling has to be right at the data level, not just visually.",
      capacityNote:
        "[confirm] Capacity is gated by rider supply and store hours, first-come-first-served, the same gating Instacart surfaces (only slots with shoppers still available are shown). Zepto's matrix models availability as states (open / disabled / hidden / sold-out) without surfacing rider supply as the driver.",
      reservationHold:
        "A picked slot is reserved through checkout (the 'slot expired before pay' state implies a hold with a TTL); the hold mechanics were a backend concern, not a design focus here. Reference: Instacart fences a chosen slot for a fixed 10 minutes, one held slot per user, and requires the hold id to place the order.",
      sources: ["Schedule Order Handoff (Figma)", "Instacart docs (service options and time slots)"],
    },
    {
      eyebrow: "Research",
      id: "prd-gaps",
      title: "Competitive landscape and gap analysis",
      summary:
        "A 2026-06-29 deep-research field check (5 angles, 23 sources, 99 claims) diffing our coverage against the field. Note: the adversarial-verify and synthesis steps were rate-limited, so most claims are sourced-but-unverified; three load-bearing stats were re-verified by hand against primaries.",
      callout: {
        label: "The thesis",
        body: "'Trust before UX', later must not dilute now, is the field consensus, not a contrarian take. Reliability has overtaken speed (McKinsey: delivery speed #1 priority in 2022 to #5 by 2024; Narvar 2025: date accuracy outranks even cost at checkout, 57 vs 56), and a formal ops model proves the 'later dilutes now' tension is real (a small fast-vs-slow quality gap lets the slow tier cannibalize the premium).",
      },
      competitorMap: [
        "Instacart, the most productized: three ranked, monetized tiers (Scheduled / Standard / Priority), 2 to 3-hour overlapping windows, a $2 'no rush' discount to demand-shape, slots gated on courier supply first-come-first-served, and an explicit 10-minute slot-reservation hold.",
        "Walmart, the recovery leader: a late scheduled slot proactively offers a switch to pickup with a 24-hour window, plus late-delivery compensation.",
        "Amazon Fresh, Ocado and the attended-home-delivery world: mature slot-capacity and demand-shaping models, but built for a next-day cadence, not a ten-minute one.",
        "The 10-minute cohort (Blinkit, Swiggy Instamart, Zepto): all under regulatory pressure as of Jan 2026 to drop the '10-minute' marketing claim, which turns a credible 'later' from a side feature into a strategic hedge.",
      ],
      realGapsToClose: [
        "Late-slot / SLA-miss recovery (highest). We cover everything up to the window, nothing after a breach. Walmart reflows a late slot into a pickup offer with a 24-hour window.",
        "Inventory drift between booking and wake-up (most Zepto-specific). The item in stock at booking can be gone at the 30-minute wake-up; re-check and offer substitute or refund.",
        "Slot reservation hold primitive. We show the expiry state but not the mechanism (Instacart's 10-minute hold, id required).",
        "Payment auth vs capture timing for a future order (authorise at booking, capture at wake-up).",
      ],
      deliberateTradeOffs: [
        "Capacity is rider-supply-driven, worth saying plainly rather than presenting availability as abstract.",
        "No discount-for-flexibility lever. The field widens windows and pays you to take them (Instacart's discounted 3-hour 'no rush' slot; academic slot-offer-set optimization). We held the line at fixed one-hour windows because precision is the promise.",
        "Instant vs schedule stays binary and instant stays sacred, vs the field's ranked, monetized tiers (Instacart Scheduled / Standard / Priority).",
      ],
      aheadOfField: [
        "The persistent summary on a split cart (Baymard documents the rebuild-after-late-split failure we designed past).",
        "The cross-midnight relabel (unmatched in the 23-source scan).",
        "Honest disabled-not-hidden discipline (backed by transparency and WISMO research).",
      ],
      verifiedStats: [
        "McKinsey: delivery speed ranked #1 priority in 2022, #5 by 2024 (re-verified).",
        "Narvar 2025 (3,461 US consumers): accuracy outranks cost at checkout, 57% vs 56% (re-verified verbatim).",
        "Instacart: a reserved slot is held for exactly 10 minutes, hold id required to create the order (re-verified).",
      ],
      sources: ["2026-06-29_scheduled-delivery-gap-analysis.md", "deep-research run wf_4ea49b19-3a8"],
    },
    {
      eyebrow: "Process",
      id: "prd-decisions",
      title: "Decision log (grounded in 506 Figma comments)",
      summary:
        "The real arguments that shaped the feature, from the Schedule Order Handoff file, Aug 2025 to Jun 2026.",
      positiveCopyRule:
        "Three reviewers independently killed negative framing: Nishit ('the title of the bottom sheet shouldn't be negative'), Ciara (humanising 'Failed to load slots' into 'Your order will be packed closer to your delivery time slot'), Harish (softening 'instant pickup unavailable' into a next-eligible-date statement).",
      killedExplorations: [
        "Product-page placement: killed (negative listing, fought the booking model).",
        "Tabbed, one tab per shipment: killed in testing (hides the other shipments' choices; 'doesn't look clickable, too much white space', 'this interaction seems weird').",
        "Bottom sheet: did not scale past a couple of shipments (tried in the current layout first to minimise FE cost, per Shreya).",
        "One combined cart: designed, user-tested, killed. In a real eight-item mixed cart, state changed at the item level all at once and users started 'confirming the hell out of it' (blind-tapping); per-item timings made arrival impossible to reason about. The split-card model wins because it resolves state at the shipment level.",
      ],
      researchMoment:
        "A 10-person usability test (25 Oct 2025) drove the bottom-sheet 'remove prominence' and clickability fixes. The pivot quote, mid-task: 'I might forget the slots I picked for shipment one by the time I'm choosing the slot for shipment two.'",
      techConstraint:
        "'Confirmation of removal is not possible' (per eng). This blocked the cleaner explicit-intent wishlist flow and pushed the auto-remove-vs-explicit-intent decision to M3 (parked).",
      slotDecisions:
        "AM/PM on every pill; pink/magenta selected fill; a separator so pills do not hang; 0-slots day shown (not greyed) with the populated day default-open; max 5 scheduled orders/day.",
      openTerminology: "'Shipment' vs 'delivery' (B2C recognisability), never cleanly resolved. [confirm]",
      sources: ["2026-06-24_schedule-order-handoff-timeline.md", "2026-06-24_zepto-handoff-figma-comments.md"],
    },
    {
      eyebrow: "QA",
      id: "prd-experiment",
      title: "Experiment design and QA coverage",
      summary:
        "Scheduled Delivery shipped behind an A/B experiment (the scheduled_delivery cohort) with a roughly 90-case QA plan. The behaviors below are grounded in that sheet (Figma node 301-93717).",
      callout: {
        label: "The two variants",
        body: "Both variants keep the cart CTA as 'Click to Pay' if any shipment is serviceable. They differ only when BOTH shipments are unserviceable. Test 1: the primary CTA is DISABLED until a shipment becomes serviceable or any shipment is scheduled. Test 2: the primary CTA becomes 'Schedule order' and opens the schedule page. These are the live form of the early 'Pay disabled' vs 'Pay replaced with a schedule button' experiments.",
      },
      concurrencyCap:
        "Two caps, both live: max 2 ONGOING scheduled orders at a time (2 shipments or 2 orders), AND max 5 scheduled orders per day (Ciara's 'Only 5 orders can be scheduled per day' copy). A further attempt past either shows an error.",
      feeWaivers:
        "Scheduling waives premiums: no surge fee when the store is on surge, no rain fee when it is raining, no night fee for a morning slot. Instant shipments keep surge and rain fees as BAU. So scheduling is implicitly the cheaper path during a surge, a real price effect worth noting against the 'no discount lever' trade-off.",
      bothUnserviceable:
        "When both dark store and superstore are unserviceable, items club into a single greyed 'store unserviceable' block (the bifurcation hidden, Pay disabled); tapping Schedule opens the picker where the two shipments reappear (dark store today-only, superstore from the next available slot), each with its own scheduled card and Edit, and Pay enables once both have valid slots. This is the real 'combined' treatment, scoped to the both-unserviceable case.",
      categoryEdges: [
        "Cafe items: Schedule is disabled if a cafe item is in the cart.",
        "Pharmacy: the doctor call (if applicable) fires immediately on schedule-and-place, but the order does not move to packing until later.",
        "Coupons and campaigns: computed at order-placement time and honoured even on a fully scheduled order; the counter updates on placement.",
        "COD: hidden when there is no instant-eligible shipment (a fully scheduled order); the PTP bottom sheet does not open for scheduled shipments.",
        "First-time buyers: a dismissable 'you can schedule your orders now' cart toast, capped at X times and once per session per day.",
        "Weight split: a cart over 30 kg auto-splits; both shipments keep the chosen slot and show no schedule button (the split is automatic).",
        "Out of stock: a single-item OOS shipment is hidden from the Schedule your order page.",
        "Address change: resets the scheduled slot, with a warning that any address change will reset it.",
      ],
      qaStatus:
        "A subset is marked passed: experiment membership; single-shipment unserviceable scheduling plus quantity edits; cafe disable; the 30 kg weight split; back-arrow navigation; the View-items bottom sheet; and Edit navigating to the schedule page. Many cases are still open.",
      sources: ["Scheduled Delivery QA / experiment sheet (Figma node 301-93717)", "2026-06-29_scheduled-delivery-qa-experiment.md"],
    },
    {
      eyebrow: "Research",
      id: "prd-research",
      title: "User research (n=45 validation study)",
      summary:
        "A mixed-method study, not just interviews: large CDP sampling frames per behavioral cohort (about 1,520 SS schedulers, 1,424 DS schedulers, 1,216 WIMO users, 499 cart-to-PTP dropoffs), 45 moderated phone interviews across those cohorts (13-18 Nov 2025, just after M2), and a 454-ticket support analysis. 12+ cities, order-frequency 1 to 551, run by PMs Kavya and Shriya. Qualitative numbers are directional, not powered.",
      callout: {
        label: "The one finding that reframes everything",
        body: "8 in 10 who placed a scheduled order did so as a FALLBACK because instant was unavailable, not as a plan. Of 19 placers, only 4 scheduled from a serviceable cart by choice. Current demand is mostly instant-unavailability fallback; the planned-ahead segment is real but smaller than the personas assumed.",
      },
      behavioralTwin:
        "The analytics say the same thing: with instant fully available, adoption is about 1.3% of orders, and it rises only in the unserviceable windows. The blended topline is a fallback story, not a planning-adoption number. The 23 Sep 2026 warehouse pull puts that topline at 1.72% of all orders at its May peak and about 1.4% now, and confirms nothing in the warehouse records a customer who opened the slot picker and found nothing bookable, so the split itself is still uninstrumented.",
      ticketAnalytics:
        "The confusion, quantified: 454 'where is my order' support tickets from about 366 users on delivered scheduled orders, and 100% were raised PRE-SLOT, before the chosen window had even started. 63% came within the first hour of ordering. People did not understand they had booked a future slot and still expected instant, so they panicked before the order was due. This is the single hardest number in the study.",
      cohorts: [
        "Schedule placed (19): completed a scheduled order.",
        "Cart unserviceable, did not schedule (4).",
        "Dropped off, slot selected (6).",
        "Dropped off, interacted with schedule (7).",
        "WIMO pre-slot (6): 'where is my order' confusion before delivery.",
        "WIMO cancellation (3): cancelled, mostly from confusion.",
      ],
      topFindings: [
        "Fallback, not a plan (dominant): users reached for scheduling only when instant failed. 'Will use this only when I don't see instant delivery.'",
        "The instant-identity objection, in users' own words (the trust thesis, confirmed): 'Why would I schedule an order if Zepto has already made a habit to get it at the earliest?' One user seeing the slots questioned 'whether instant was entirely gone'.",
        "Slot imprecision is the #1 unprompted feature ask: 15 or 30-minute slots. 'The ambiguity in a one-hour slot is there, I don't know if I will get it at the beginning of 7 or end of 8.'",
        "Confusion drove WIMO and cancellations: users routed from 'instant unavailable' did not register they had booked a FUTURE slot, still expected about 15 minutes, then cancelled when it arrived next day.",
        "Real use cases exist for a planning segment: morning-order-for-evening, the work-meeting 'didn't want to forget', the peak and traffic-delay hedge, and gifting or surprises.",
        "On-time is existential: a 20-25 minute miss produced 'would switch apps if I need something immediately'.",
        "Discoverability: several non-schedulers never saw the Schedule button.",
        "No perceived price benefit ('why schedule if there's no pricing difference?'), even though scheduling waives surge, rain, and night fees; the benefit is not surfaced.",
      ],
      implications: [
        "Finer slots or a tightening in-window ETA (the top ask, and the demand behind the still-unshipped finer slots).",
        "Disambiguate fallback from planned at the instant-unavailable handoff: a hard expectation-set that this arrives LATER.",
        "On-time SLA is the make-or-break; the +30 / +60 auto-cancel plus Rs.50 recovery is the right instinct, but dispatch tightening matters more than any UI.",
        "Surface the benefit (fee waiver, peak reliability); users currently perceive 'no difference'.",
        "Lead GTM with the validated use cases (morning-for-evening, peak hedge, work, gifting), not 'plan your groceries', which most reject.",
        "Reassure on dilution at the entry: make clear instant is not gone.",
      ],
      designActionables: [
        "AM/PM confusion drives cancellations (orders placed 12-2 am): the midnight boundary makes a same-day 12-1 slot read as next-day. Fixes: cart copy 'Arriving today...', a shipment-level today/tomorrow tag, and slot sections for morning / afternoon / evening. Deliberately NOT 'arriving in X hours' (users anchor to the start of the hour they picked; 30 and 45-minute cases break that math). The human cost behind the 'last slot reads 11-12 AM not PM' fix.",
        "Dilution perception ('instant is going away, this is the new standard'), trigger unserviceable cart: use 'Back soon' instead of 'Unavailable' on the schedule page, and a cart subtext 'Instant delivery is temporarily unavailable'.",
        "Fifteen-minute expectation (users expect delivery within 15 minutes of the slot START), trigger scheduled or unserviceable carts: push notifications once the shipment is registered, and reiterate the exact window ('between 7-8 pm') at every touchpoint. Directly targets the 454 pre-slot tickets.",
      ],
      sources: ["2026-06-29_scheduled-delivery-user-research.md", "SD M2 User Research workbook (15 sheets)", "Validation study (45 interviews + 454 tickets, 13-18 Nov 2025)"],
    },
    {
      eyebrow: "Business",
      id: "prd-business",
      title: "Impact, roadmap, risks, honest gaps",
      summary: "What it moved, where it goes next, and what is not yet in hand.",
      impact: [
        "Adoption is deceiving and worth decomposing: it peaked at 1.72% of all orders in May 2026 (1.81M scheduled orders) and has settled near 1.4%, but with instant FULLY available only about 1.3% schedule. So the topline measures how often instant is unavailable as much as planning demand, which matches the n=45 finding that most scheduling is a fallback.",
        "Scheduled-order AOV was about 1,450 rupees against 543 for an instant order in August 2026, with 5.85 items against 4.65. The 550-vs-300 pair quoted through 2026 was the MEDIAN (561 vs 332), not the mean. CAUTION: August has THREE AOVs on three scopes and they must never be quoted without saying which - 1,401 (GMV bridge, ~55% of orders, delivered only), 1,452 (the scheduled-vs-instant table), 1,718 (implied by the appliance split, 94.8% order coverage, includes cancelled).",
        "THE BIGGEST FINDING OF THE SEPTEMBER PULL: scheduled delivery is becoming the APPLIANCE-DELIVERY CHANNEL. AOV was flat at 930-982 for seven months then jumped from July (1,240 / 1,401 / 1,748). It is NOT bigger baskets: items per order stayed 5.4-6.3 all year with no break. Price per item went 147-176 to 203 / 240 / 291, and that is one category - Electronics & Appliances went from 21% of SD GMV in Jun to 37% in Jul to 54% in Sep, at 10,810 rupees per item. Only ~5% of scheduled orders contain one. GMV grows while ORDERS FALL: 94 Cr (May) to 118 Cr (Aug), ~823 Cr total since Dec. A fridge needs a time slot; a snack does not. That is a different product - installation, two-person delivery, a real returns path - and every operational metric in the report measures it as though it were groceries. [confirm with Product whether this was deliberate.]",
        "Appliance orders (order contains an E&A item, 7.5% of Aug volume) fail far more: 34.4% cancelled vs 26.6%, 4.5% RTO vs 2.9%, 12.9% late vs 9.2%, and the cancellation gap has WIDENED three months running (30.6 / 33.1 / 34.4 against a flat ~26%). One in three never arrives. BUT they are not why SD looks bad against instant: support tickets are IDENTICAL between the two groups (166 per 1,000) and ratings only slightly worse (3.84 vs 4.00). Where they matter is money: 7.5% of orders, >50% of GMV, and about 58% of the cancelled value (44 Cr of Aug's ~76 Cr).",
        "The cost side, same month: 147 support tickets per 1,000 scheduled orders against 57 for instant, an average rating of 3.98 against 4.32, and a 27.4% cancellation rate against about 11%. The most valuable order in the business gets the worst experience.",
        "Delivery within the booked hour fell from 92.6% (Feb 2026) to 76.8% (Sep 2026), but that is a metric artefact: the fall is early arrivals (2.6% to 17.0%) while lateness peaked in May and recovered to about 6%. Early rates 4.14 against 4.07 for on-time (t = 1.59, NOT significant) and 3.81 for late (t = -6.38, significant). The supported claim is that early is NO WORSE, not better; that is enough to make NOT LATE (within plus early) the right headline, and it has held at 93 to 96% all year. Two caveats on the slice: response rate rises with how badly the order went (3.54% early, 5.23% late), and the slice reports 13.3% late where the August month says 5.8%.",
        "The report's CAUSE for early arrivals does not survive. It reads them as the move to 6 AM slots; a shift-share decomposition Feb to Sep puts 0.3 of the 14.4pp rise on slot mix and 13.2pp on within-band rates rising in EVERY band, and by Sep the daytime band is the earliest. Candidate cause: batching (75% of SD orders are batched, and a batched order inherits the instant order's dispatch clock). [confirm: batching rate by month and slot band.]",
        "CANCELLATION, not on-time, is the largest problem. 3.66M cancelled SD orders Nov 2025 to Sep 2026; August alone is 421,145, about Rs 76 crore of booked basket when each group is valued at its own AOV (Rs 44 Cr of it appliances). Rebasing the reasons off the 84.6% blanks (which the team confirmed are customer bot cancels): 95.9% customer-initiated, 3.6% supply-side. The SD bot line is 73% of the cancels that carry a reason, not 11%. SD cancels at 2.45x the network rate and that ratio is flat-to-worse since Dec, so the absolute improvement is the network improving, not SD.",
        "The basket gap is a TAIL, not a typical cart: SD mean/median = 2.59 against instant's 1.64, so the median gap is only Rs 229 (+69%) against the mean's +167%. With 47.6% of Sep orders booked under 2h ahead, there are two populations inside 'scheduled' and the weekly shop is the minority. [follow-up: split and re-run AOV, cancellation and rating per population.]",
        "Slot supply is inverted: 52.7% of August capacity sits 10 AM to 6 PM at about 11% fill, while the peaks have the least capacity per slot. Lifting each peak to the midday 9.4 would add 16% at 6 AM, 31% at 9 PM, 38% at 10 PM and 59% at 11 PM at zero net capacity.",
        "Per store, demand is down 33% from the May peak (46.2 to 31.0 orders per store per day) while store count rose 14%. Absolute volume being down only 16% hides it.",
        "May 2026 was a supply release, not a demand shift: on a flat store count, 6 AM capacity per slot rose 64% (4.5 to 7.4) and open 6 AM store-slot-days rose 37%, and sell-outs FELL from 35.2% to 25.0% even as orders doubled. 6 AM has been the busiest slot hour ever since.",
        "The DS experiment verdict holds but only two of its four negatives do: orders per rider instance -10% is real and is the headline, delivered -0.6pp is marginal (z = -2.03), order count -2.5% is real but confounded by assignment (z = 2.78), and the cancellation rise of +0.41pp is noise (z = 1.61).",
        "The product inverted its own identity and nobody named it: Nov 2025 was 36.5% evening and 10.8% morning; Sep 2026 is 19.1% evening and 33.7% morning. It launched as an evening top-up scheduler and is now a morning delivery service, so every pilot-era design assumption is about a different product.",
        "Never meant to be a majority feature; the bar was 'does it pay for itself without diluting instant', and it cleared it.",
        "Last-mile economics improved: a known future slot can be batched and routed in a way real-time dispatch cannot. [confirm exact figure with ops.]",
      ],
      roadmap: [
        "M1 (23 Oct 2025): the narrow entry. Scheduling for the single-shipment case only (one unserviceable shipment with slots), Schedule as the primary cart CTA; the single-item re-add reset and the post-purchase slot reset; PDP 'Back soon' suppression for the test cohort.",
        "M2 (10 Nov 2025): the expansion. Multi-shipment scheduling, shipment-level Schedule button in all cases (greyed where no slots), the cart-CTA-by-shipment-mix matrix, unserviceable-shipment handling with the bottom-sheet removal/wishlist flow, the schedule-page state set, GTM banner + nudge, the back-soon update across EDLP layouts, and slot-label fixes (last window reads 12 AM, not PM).",
        "Later (M3+): fuller post-order editing and reschedule (in-flow slot edits shipped at launch); the parked auto-remove-vs-explicit-intent wishlist decision; the residual failure items (at-wake-up live-stock re-check, reflow-to-pickup as an alternative to auto-cancel); WhatsApp reminders (engine); Dynamic Island; seamless cross-day scroll.",
        "Adjacent tracks (kept separate): Returns and Refunds (reuses the slot picker for pickup), customer-delight / support chat.",
      ],
      topRisks: [
        "Auto-cancel-and-compensate on a late slot is honest but blunt; a reschedule or pickup-reflow would save more orders than a refund plus credit. The at-wake-up live-stock re-check is the residual gap.",
        "Multi-shipment legibility under real mixed-state load (the reason the combined cart died).",
        "WhatsApp framed as shipped when it was designed-for (engine not live).",
        "Unverified / postdated external context (the 10-minute regulatory note).",
      ],
      honestGaps: [
        "Metrics: the monthly series (volume, share, cancellation, slot mix, lead time, on-time, capacity, scheduled-vs-instant) are locked to the verified 23 Sep 2026 pull; the earlier decomposed adoption (about 1.3% at full instant availability) predates it and is not re-verified. The last-mile figure, the role lead-vs-contribute split, and team/timeline are [confirm].",
        "DATA TRAP for any future query on gold.product.shipment_fact: it holds MULTIPLE ROWS PER ORDER (16,584 of 85,709 E&A orders in July). Counting shipment rows without deduplicating overstates delivered orders, and `arrived_timestamp IS NOT NULL` is the wrong delivered test - use `delivered_timestamp IS NOT NULL AND cancelled_timestamp IS NULL`. Full-month July adherence could not be obtained in Qri (five attempts); run it in Databricks.",
        "Not instrumented, and the biggest gap in the dataset: slot-level demand loss. Nothing records a customer who found no bookable slot. Also missing: the planned-vs-fallback flag per order, WISMO ticket timing against slot start, and shipments-per-order for scheduled carts.",
        "Residual design gap: the at-wake-up live-stock re-check (late-slot recovery and the availability-drift review already shipped). Payment auth/capture timing and the reservation-hold mechanics are backend concerns, out of scope for the design.",
        "Returns and Refunds and support-chat tracks: held, await brain-dumps.",
      ],
      sources: ["scheduled-delivery-handoff.md", "2026-06-29_scheduled-delivery-gap-analysis.md", "Schedule Order Handoff (Figma)"],
    },
  ],
};
