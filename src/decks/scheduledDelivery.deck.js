// Presentation deck for the Scheduled Delivery (Zepto) case study.
// Rebuilt 2026-07-05 to the DOUBLE DIAMOND (Discover / Define / Develop / Deliver),
// following the flow of the reference deck (Portfolio Landing Page, Figma node
// 1819-87061): centered cover -> interactive contents -> business goals -> the four
// D's, each opened by a phase-divider "section start". The reference's orange
// section headings set the structure; the content is the case study's own material
// (unchanged), re-slotted into this flow. New connective slides (Overview,
// Competitors, the three explored directions, Designers Assemble, etc.) are built
// from the same case-study / PRD material.
//
// Voice: LOCKED presentation-mode tone (memory: presentation-mode-tone): spoken,
// contractions, plain words, short beats. The deck is talked, not read. No em-dash,
// no tilde. Full loosening pass 2026-07-05.
//
// Renders through buildSlides / Slide in App.jsx. The `contents` slide links to each
// section by an `id` on its phase divider and jumps to it in present mode.

export const scheduledDeck = [
  // 1 - Cover: the reusable "case study" title archetype — native/coded to match
  // the reference deck's title frame (Figma Portfolio-Landing-Page node 1773-446):
  // white slate, coral flagged "CASE STUDY" eyebrow up top, serif title centred.
  {
    type: "title",
    frame: "casestudy",
    eyebrow: "Case study",
    title: "Bringing Scheduled Delivery to a 10-minute platform",
    meta: null,
    lead: null,
  },

  // 2 - Contents (interactive index; each row jumps to its section). Uses the global
  // "index" archetype: the white-slate + coral flagged-eyebrow treatment shared with
  // the title frame (Figma 1773-446), with the interactive jump list kept.
  {
    type: "index",
    kicker: "Contents",
    items: [
      { n: "", label: "Business goals", to: "goals" },
      { n: "01", label: "Discover", to: "discover" },
      { n: "02", label: "Define", to: "define" },
      { n: "03", label: "Develop", to: "develop" },
      { n: "04", label: "Deliver", to: "deliver" },
    ],
  },

  // 3 - Business goals
  {
    type: "numbered",
    id: "goals",
    kicker: "Business goals",
    items: [
      {
        title: "Capture demand instant can't",
        body: "Every window we can't serve, every \"not right now\" moment, that's someone who wanted Zepto and left. The goal is simple: turn \"we can't serve you now\" into a booked order, and stop losing people at the edges of the network.",
      },
      {
        title: "Grow order value",
        body: "Give planning a home on an app built for impulse. When people shop for later, they buy bigger and more deliberately. We wanted that, without buying it with discounts.",
      },
      {
        title: "Improve fulfilment efficiency",
        body: "When you know an order's coming hours ahead, you can batch and route it in ways live dispatch can't. That's cheaper to fulfil, and it takes some of the load off peak hours.",
      },
    ],
  },

  // ===================== 01 DISCOVER =====================
  {
    type: "phaseDivider",
    id: "discover",
    n: "01",
    name: "Discover",
    sub: "Get the lay of the land: the business, the users, the market",
  },
  {
    type: "statement",
    kicker: "Overview",
    text: "Zepto runs on one promise: groceries in ten minutes. The brief was to add a way to order for later, without letting the two ideas bleed into each other.",
  },
  {
    type: "splitLabeled",
    h: "Questions I took to the business",
    items: [
      { label: "Isn't Zepto a 10-minute delivery platform? So why schedule?", body: "The whole company is speed. So asking someone to wait sounds like the opposite of the product. But that's exactly the point: every time ten minutes can't happen, that demand doesn't wait, it just leaves. Scheduling is how we catch it instead of losing it." },
      { label: "So what is scheduling an order for supply chain ops?", body: "It's the flip side of impulse. Live orders hit ops with no warning, but a scheduled order is demand they can see coming, hours ahead. Something to batch, route, and staff around instead of scramble for. Known future demand is easier to serve than a surprise." },
      { label: "And aren't we ready to deliver 24x7?", body: "Being open isn't the same as being able to deliver. Coverage isn't the same at every hour or every address. Areas go dark late at night, stores close, capacity runs out, a pincode drops off. So \"always on\" isn't \"always serviceable,\" and those gaps are exactly where \"we can't serve you now\" turns into \"book it for later.\"" },
    ],
  },
  {
    type: "splitLabeled",
    h: "Questions I asked about the users",
    items: [
      { label: "How do I ask without putting the idea in their heads?", body: "Straight out of The Mom Test: don't pitch scheduling and ask if they'd use it. Ask about their life. So instead of \"where would you want scheduled delivery,\" I asked where ordering now just doesn't work for them." },
      { label: "So what did they actually say?", body: "The real moments came out on their own. \"When I'm heading to sleep.\" \"When I haven't reached home yet.\" \"When the store's down and it's back in fifteen minutes.\" Nobody asked for a scheduler. They kept describing where now falls apart." },
      { label: "And what's the thread through all of it?", body: "They're fine with the delivery landing a little later. They just want to finish the order now. That's the whole insight: split the decision from the drop-off. Decide now, receive later." },
    ],
  },
  {
    type: "splitLabeled",
    h: "Questions I asked about the product",
    items: [
      { label: "What kind of problem is this, really?", body: "A trust problem before a UX one. You're asking people to believe later will show up exactly when promised, from the one app built on never making them wait." },
      { label: "So what's the bet?", body: "Serve the people who can wait, without spending the trust that makes now work. Keep it restrained, and show scheduling only where it actually helps." },
      { label: "And how should it work?", body: "Something you reach for in the cart, after you've decided what to buy. Per shipment, on one-hour slots the operation can actually keep." },
    ],
  },
  {
    type: "figure",
    layout: "text",
    kicker: "Discover · Competitors",
    h: "Where scheduling sits in the market",
    p: [
      "People have stopped ranking speed first. McKinsey had delivery speed at #1 in 2022 and #5 by 2024. Reliability is what they want now. And if a slower tier is nearly as good as the fast one, the slow one starts eating into the premium. So the smart players treat scheduling as a trust play, not just convenience.",
    ],
    ul: [
      "Instacart is the most built-out: ranked tiers, a paid \"no rush\" discount, even an explicit 10-minute slot hold",
      "Walmart is best at recovery: miss a slot and it switches you to pickup with a 24-hour window",
      "The 10-minute crowd (Blinkit, Instamart, Zepto) is under pressure to drop the 10-minute claim, so a believable \"later\" is a hedge",
      "Where we lead: the split-cart summary that stays put, and the relabel across midnight. Where we hold back: fixed one-hour windows and no discount lever, because precision is the whole promise",
    ],
  },

  // ===================== 02 DEFINE =====================
  {
    type: "phaseDivider",
    id: "define",
    n: "02",
    name: "Define",
    sub: "Landscaping the problem statement",
  },
  {
    type: "statement",
    kicker: "Framing the problem",
    text: "How do you make \"later\" trustworthy without spending the trust that makes \"now\" work? It's a trust problem before it's a UX one.",
  },
  {
    type: "numbered",
    kicker: "Define · Constraints",
    h: "What are our constraints",
    items: [
      { title: "One-hour slots", body: "Slots could only be an hour wide. And early on, we couldn't even count on them being available." },
      { title: "Demand has to balance", body: "Pre-booked orders still fulfil through the peak, while live 10-minute demand keeps flowing right alongside them." },
      { title: "Trust isn't up for grabs", body: "A 6 to 7pm promise had to land 6 to 7pm, every time. Behind that one-hour window sits about ninety minutes of dark-store margin to make it hold." },
    ],
  },
  {
    type: "methodFinding",
    h: "Where to place scheduling",
    finding: "On the product page, scheduling fought the booking model and read like a listing telling you what you couldn't have.",
    p: [
      "Scheduling isn't something you go discover. It's something you reach for once you've already decided what to buy. So it belongs on the cart, where the deciding is done.",
    ],
    fig: "schedExplorations",
  },
  {
    type: "figure",
    h: "One cart, many hubs",
    p: [
      "Zepto ships from tiered hubs, so a mixed cart splits by store, up to four shipments. Scheduling sits on each shipment, so every one answers the slot question for itself.",
    ],
    fig: "schedSplit",
    figure: "A mixed cart ships in pieces, up to four. The worst case: four shipments at once, one scheduled, one unavailable, one closed.",
    layout: "split",
  },
  {
    type: "gallery",
    h: "Cart states: a matrix, not a screen",
    p: [
      "The Schedule button alone can be open, disabled, hidden, the only action, or just gone, depending on what each shipment's store can actually do. I drew every one of those cells, and shipped them.",
    ],
    fig: "schedCartStates",
  },

  // ===================== 03 DEVELOP =====================
  {
    type: "phaseDivider",
    id: "develop",
    n: "03",
    name: "Develop",
    sub: "Mapping directions",
  },
  {
    type: "figure",
    layout: "text",
    kicker: "Develop · Mapping directions",
    h: "Three ways scheduling could live in the cart",
    p: [
      "With placement settled on the cart, I mapped three ways to build it, from the lightest surface to the most structured. Each made a different trade between how fast it was to ship and how much of the order stayed in view.",
    ],
    ul: [
      "A bottom sheet over the cart, the lightest to ship",
      "A progressive flow, one tab per shipment",
      "A full page holding every shipment on one surface",
    ],
  },
  {
    type: "figure",
    kicker: "Exploring directions #1",
    h: "Bottom sheet",
    p: [
      "The lightest option: scheduling as a bottom sheet over the cart. Clean with one shipment. But it fell apart past a couple, the sheet turned into a long scroll and you lost track of which shipment was which.",
    ],
    layout: "text",
  },
  {
    type: "figure",
    kicker: "Exploring directions #2",
    h: "Progressive flow",
    p: [
      "A tab per shipment, each with its own instant-or-schedule choice and slot grid. Tidier on paper. But picking a slot in one shipment hid the rest behind a tab, so you never saw the whole thing you were committing to.",
    ],
    layout: "text",
  },
  {
    type: "figure",
    kicker: "Exploring directions #3",
    h: "Full page",
    p: [
      "A dedicated schedule page that keeps every shipment on one screen, each one opening in place. More to build, but the whole order stays readable the entire time.",
    ],
    layout: "text",
  },
  {
    type: "figure",
    layout: "text",
    kicker: "Develop · Exploring slot selection",
    h: "Then the slot picker itself",
    p: [
      "Placing scheduling was one problem; picking a slot was another. I explored how to show a day of one-hour windows without it turning into a booking form: a picker that opens per shipment, Today and Tomorrow as tabs, and the earliest open slot pre-selected so the fast path stays fast.",
    ],
  },
  {
    type: "statement",
    kicker: "Designers assemble",
    text: "We put all three in front of the team, product, content, and engineering, and held each one to a single bar: can you always see the full commitment before you pay?",
  },
  {
    type: "figure",
    layout: "text",
    kicker: "Running with option 2 and 3",
    h: "Two survived the crit",
    p: [
      "The bottom sheet was out. We built the progressive flow and the full page far enough to test, because the difference between them only shows up under real multi-shipment load, and that's almost every scheduling cart.",
    ],
  },
  {
    type: "statement",
    kicker: "Research",
    text: "I might forget the slots I picked for shipment one by the time I'm choosing the slot for shipment two.",
    cite: "Usability test participant",
  },
  {
    type: "compare",
    h: "Option 3 wins",
    a: {
      label: "Tab per shipment",
      body: "Tidier on paper, simpler build. But move to shipment two and shipment one's choice is on another tab, out of view.",
      verdict: "Lost the picture, lost trust",
    },
    b: {
      label: "One single page",
      body: "Every shipment switchable in place, every slot you picked visible at once. That summary sitting there is itself a trust mechanism.",
      verdict: "Shipped",
    },
    winner: "b",
    note: "You commit to \"later\" because you can see exactly what you committed to.",
  },
  {
    type: "figure",
    kicker: "Micro-details",
    h: "The real work: where every control lives",
    p: [
      "Picking the one-page direction settled the concept, not the interaction. It took a lot of passes to make all that density feel obvious.",
    ],
    ul: [
      "Scheduling opens its own full page, never a bottom sheet that hides the other shipments",
      "The shipment you arrived from expands; the rest stay collapsed but visible",
      "Per shipment: an instant-or-scheduled toggle, then its slot picker",
    ],
    fig: "schedDateSwitch",
    figure: "Switching Today and Tomorrow re-animates the slot list. Today is partial because earlier slots have passed; tomorrow opens a full day.",
    layout: "split",
  },
  {
    type: "figure",
    h: "One scroll across midnight",
    p: ["Someone picking a slot at 11pm is planning tonight a little later, not tomorrow."],
    ul: [
      "The same six post-midnight windows belong to both days",
      "Crossing into tomorrow relabels them in place, Late Night to Early Morning",
      "A later iteration dissolved the seam into one continuous timeline",
    ],
    fig: "schedPageReal",
    figure: "The slot list runs straight past midnight. Late tonight and early tomorrow are one shopping moment, not two calendar days.",
    stamp: "Watch it scroll",
    layout: "split",
  },
  {
    type: "gallery",
    h: "Slot-page states: density without confusion",
    p: [
      "The one screen where all the complexity has to feel effortless. Empty and failure states got the same care as the happy path.",
    ],
    fig: "schedPageStates",
  },
  {
    type: "numbered",
    kicker: "Serviceability",
    h: "Why a store can be unserviceable",
    items: [
      { title: "Out of hours", body: "The store's closed for that window. Superstores shut overnight, and every site keeps its own hours." },
      { title: "Out of stock", body: "The item isn't stocked at that store for that window, so it can't be promised from there." },
      { title: "Beyond coverage", body: "The address sits past what the store can reach, patchy near home and worse late at night." },
      { title: "At capacity", body: "Demand spikes and there's no rider left to take on a fresh slot in that window." },
      { title: "Something breaks", body: "Weather, blocked roads, or a store-side outage pauses fulfilment for the area." },
    ],
  },
  {
    type: "methodFinding",
    kicker: "Crisis",
    h: "The stuck cart, shown in plain sight",
    finding: "The instinct is to hide the broken thing. I did the opposite.",
    p: [
      "The hardest state: a cart that stays unserviceable even with a schedule. I flagged it in place, said the consequence up front, and offered a reopen slot where a store is just closed. And when we miss a slot, a late breach auto-cancels with an apology and a credit, instead of leaving you watching a countdown that never resolves.",
    ],
    fig: "schedStuckCart",
  },
  {
    type: "figure",
    layout: "text",
    kicker: "Develop · Scaling the pattern",
    h: "The same picker, now for returns and refunds",
    p: [
      "Once the slot picker earned its trust on the forward cart, it became a pattern, not a one-off. The returns and refunds flow reused it to book a pickup window, this time with the slots laid out inline on the page instead of in a sheet. One picker, two jobs.",
    ],
  },
  {
    type: "figure",
    kicker: "Booked",
    h: "The order's second life",
    p: [
      "A scheduled order spends almost its whole life after you've paid, and that's exactly where trust is won or lost. The 10-minute promise doesn't go away for scheduling. It just waits, then keeps itself inside your window.",
    ],
    fig: "schedPostBooking",
    figure: "Roughly thirty minutes before your slot the order wakes up, a rider is assigned, and the familiar 10-minute experience resumes, landing inside your window.",
    layout: "split",
  },
  {
    type: "numbered",
    kicker: "Post booking",
    h: "Keeping the promise in front of you",
    items: [
      { title: "A card built for a slot", body: "\"Scheduled for 6 to 7 PM\" takes the place of the 10-minute line, on home and in My Orders." },
      { title: "Reminders that find you", body: "Push and a pinned in-app banner, with WhatsApp in the plan. The order's hours away, so it comes to you." },
      { title: "The 30-minute wake-up", body: "A rider gets assigned and the 10-minute experience picks back up, landing inside your slot." },
      { title: "Control, and an honest miss", body: "Edit the slot before you confirm, cancel from the support chat. And if we blow the slot, it auto-cancels with an apology and a 50-rupee credit." },
    ],
  },
  {
    type: "methodFinding",
    kicker: "Customer support",
    h: "Cancellation, and where it lived in v1",
    finding: "Cancelling a scheduled order ran through the support chat, not a button on the order. A deliberate compromise, and one I'll own.",
    p: [
      "Editing a slot before you confirm is a first-class control. Cancelling after that routed through support chat in v1, on purpose, to handle abuse and refunds safely while the flow was young. It belongs as a first-class control next, held to the same honesty rules as the rest, alongside the auto-cancel-and-credit for when we're the ones who miss.",
    ],
  },

  // ===================== 04 DELIVER =====================
  {
    type: "phaseDivider",
    id: "deliver",
    n: "04",
    name: "Deliver",
    sub: "Ship it, measure it, and be honest about what it did",
  },
  {
    type: "figure",
    kicker: "GTM",
    h: "The go-to-market: restraint",
    p: [
      "Push it everywhere and it waters down the instant promise. Hide it and nobody finds it. So we show it only where it earns its place.",
    ],
    ul: [
      "A little animated banner introduces it as you land in the flow",
      "The prompt only shows up when demand's high and instant can't serve the cart",
    ],
    fig: "schedGtmReal",
    figure: "The real schedule page, with just the top banner brought to life. Calm motion that never fights the instant promise.",
    layout: "split",
  },
  {
    type: "impact",
    id: "impact",
    mark: "Metrics",
    h: "The bar was simple: does it pay for itself without watering down instant. It did.",
    metrics: [
      { value: "54%", label: "Of every scheduled-delivery rupee is now a large appliance. A fridge needs a time slot, a snack doesn't. We built a grocery feature and it became a delivery channel" },
      { value: "1.72%", label: "Adoption at its peak, May 2026; about 1.4% now. Roughly 1.3% when instant's fully available, so the rest is people falling back from a window we couldn't serve" },
      { value: "93 to 96%", label: "Orders that weren't late, held all year. The within-slot number looks worse only because it counts arriving early as a miss, and an early arrival rates no worse than an on-time one" },
      { value: "₹61 cr", label: "Booked basket cancelled in one month. Rebased, 96% of those are customers changing their minds, not operations failing. This, not lateness, is the real problem" },
    ],
  },
  {
    type: "methodFinding",
    h: "What 45 users told us, just after launch",
    finding: "Roughly 8 in 10 scheduled as a fallback, because instant wasn't available, not because they'd planned ahead.",
    p: [
      "A mixed-method study: 45 moderated interviews across twelve cities, behaviour data on several thousand users, and a read through the support tickets. The planners are real, just fewer than the people an unserviceable cart pushes into scheduling.",
      "The number that stung: 454 \"where is my order\" tickets from about 366 users, every single one before the slot had even started. That went straight into design, a clear \"Arriving today\", morning and evening slot sections, and a notification that repeats the exact window.",
    ],
    data: [
      { k: "8 in 10", v: "scheduled as a fallback, not a plan" },
      { k: "454", v: "pre-slot tickets, from about 366 users" },
      { k: "#1 ask", v: "finer slots, 15 to 30 minutes" },
    ],
  },
  {
    type: "closing",
    id: "reflection",
    h: "Reflections: the subtlest problem wasn't UX. It was perception.",
    p: [
      "Zepto means instant, and a scheduled option can feel like it cuts against that. The answer was restraint, show it only when it genuinely helps.",
      "I'd still go back to the one-hour slots (people's top ask was finer ones) and post-order editing (fuller editing landed later). Both were trade-offs we made on purpose to ship.",
    ],
    kind: "outcome",
  },
  {
    type: "closing",
    h: "Thank you",
    p: [
      "Instant is still the moat. But this proved there's a real, high-value group whose need is the exact opposite of instant, and serving them made the core product stronger.",
    ],
    kind: "thanks",
  },
];
