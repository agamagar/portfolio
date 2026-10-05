// The Scheduled Delivery walkthrough, written to be SPOKEN (first person, a
// designer narrating the project to you). Fed to NarrationPlayer, which reads it
// aloud via the browser's speech synthesis and karaoke-highlights it. Authored so
// each paragraph splits cleanly into sentences (no abbreviations, no "e.g."), and
// numbers are spelled for natural speech. No em-dash, no tilde.

export const scheduledNarration = {
  title: "The walkthrough, narrated",
  subtitle: "Scheduled Delivery, in the designer's voice",
  audio: "/narration/scheduled",
  paragraphs: [
    "Let me walk you through Scheduled Delivery. Zepto's whole promise is ten-minute grocery delivery, so when we were asked to add a way to order for later, the real question was not how to build a scheduler. It was how to add later to a product that has staked everything on ten-minute delivery, without the two ideas contaminating each other. That is a trust problem before it is a design problem, and that framing shaped almost every decision I made.",

    "The users were never the issue. Three kinds of people kept building full carts and then not paying. Someone on the train home who will not be back for hours. Someone in an area instant cannot reach late at night. Someone doing a big weekly shop that the ten-minute impulse mode was never built for. The value was there. Only the timing was wrong.",

    "The first thing I had to learn was that a Zepto order is not one thing. The cart splits by warehouse. A mother hub feeds superstores and small local dark stores, and stock is placed on purpose, so a mixed cart cannot leave from one place. In the worst case it ships in four pieces, each from a different site, each on its own clock. So scheduling could never be one switch on the order. It had to resolve per shipment.",

    "Before I settled the flow, I let the wrong answers fail loudly. Putting scheduling on the product page was the most instructive kill. It turned browsing into a warning, you might not be able to get this now, which is the exact fear we were trying to bury. A tabbed cart hid the other shipments and quietly lost people's trust. A combined single cart tested clean in a demo and then collapsed the moment real mixed states hit it.",

    "The decision came from one sentence in testing. A participant said, I might forget the slots I picked for shipment one by the time I am choosing the slot for shipment two. That ended a debate I had been having with myself for weeks. The single page won, not because it was prettier, but because it keeps the record of your own choices in front of you the whole time. A summary you can see is itself a trust mechanism. You commit to later only when you can see exactly what you committed to.",

    "Then the real work was in the slot picker. One-hour windows, six at a time, grouped by part of the day. The detail I am proudest of lives right at the day's edge. The windows just after midnight belong to both days at once, late night at the tail of today, early morning at the head of tomorrow. So when you cross from today into tomorrow, they do not vanish and reappear. They relabel in place, and you feel it as continuity instead of a reset, because late tonight and early tomorrow are one shopping decision, not two calendar days.",

    "There is a piece of this you only see in the plumbing. The one-hour window a user picks is backed by a wider fulfilment window of about ninety minutes, deliberate margin for the dark store so that a six to seven promise is actually a six to seven delivery. We kept tuning that number against real conditions. The trust is built in the operations, not just the interface.",

    "A feature this careful also has to be honest about failing. The hardest state was a cart that stays unserviceable even with a schedule. The instinct is to hide the broken thing. I did the opposite. We flag it in place, say plainly that those items will be removed, and offer to save them for later. And when we miss a slot, the order does not sit there pretending. Past the window you can cancel, and a longer breach cancels itself with an apology and a small credit. A broken promise should end cleanly, not leave you watching a countdown that never resolves.",

    "After launch we ran a mixed-method study, behavioural data on thousands of users, forty-five interviews, and every support ticket the feature threw off. The most useful finding was humbling. Eight in ten people who scheduled did it as a fallback, because instant was unavailable, not because they planned ahead. And the trust thesis stopped being my hypothesis and became a direct quote. One user asked, why would I schedule an order if Zepto has already made a habit to get it at the earliest. That is the dilution fear, live, and it is exactly what the restraint was for.",

    "The hardest number was quieter. Four hundred and fifty-four people raised a where is my order ticket on an order that was going to arrive exactly on time, every one of them before their slot had even started. They never registered that they had booked the future. The worst of it clustered at midnight, where a slot near twelve is easy to read as the wrong half of the day, and people cancelled thinking it had slipped to tomorrow. That one was on us, and it turned straight into design. An explicit arriving today on the cart, slots grouped by part of the day instead of a raw clock, and a notification that repeats the exact window after you book. The fix for a trust feature is almost always to say the true thing one more time.",

    "On impact, I will give you the honest read rather than the slide. Blended adoption settled around two percent of orders, but with instant fully available only about one point three percent schedule. The climb to two comes almost entirely from the windows when instant cannot serve you, so the topline is measuring how often instant is unavailable as much as how much people want to plan. The carts that do schedule are a fuller basket, average order value around five hundred and fifty rupees against three hundred at full scale.",

    "If there is one thing to take from this, it is the framing. When you add later to a product built on now, the work is not the scheduler. It is the trust, and trust is built by what you are willing to show, every shipment and its slot, in plain sight, the whole time. It is not a big feature. But it works at the edges, it is honest about what it cannot do, and it never makes the thing it is attached to feel smaller. That was the whole job.",
  ],

  // The interviewer layer: the question a reviewer would ask at this point, the
  // answer to say aloud, and a brainstorm note. Keys are paragraph indexes.
  asks: {
    4: [
      {
        q: "That decision rests on one sentence from one participant. How confident should we be?",
        a: "The quote is the story, not the sample. The debate was already leaning single-page on state-legibility grounds, and her sentence crystallised the failure mode of tabs, hidden state you have to remember. Post-launch behaviour validated it, people managed multi-shipment schedules without confusion tickets pointing at the page itself.",
      },
    ],
    6: [
      {
        q: "Was the one-hour window a design choice or an operations limit you rationalised? Users named it the top complaint.",
        a: "Both, honestly. The operations floor made anything finer a promise we would break, and I chose a keepable promise over a flattering picker. The top complaint is real, and finer slots is the first thing I would fund next, as operations work, not interface work.",
        note: "Brainstorm: know what fifteen-minute slots would actually require operationally.",
      },
    ],
    8: [
      {
        q: "If eight in ten used it as a fallback, did you design the wrong thing?",
        a: "We designed for the planner and the fallback user arrived, and the design held for both. Fallback is not failure, it is retention, demand instant loses that we now keep. What I would change is the sequence: that research should have happened before launch.",
      },
    ],
    10: [
      {
        q: "Two percent adoption sounds like a failure. Why is this a success story?",
        a: "Because the bar was never share of orders. It was, does it pay for itself without diluting instant, and it cleared both. A few percent of otherwise-lost carts kept, bigger and batchable, without touching the core promise, is what we scoped for.",
      },
      {
        q: "How do you know the basket lift is your design and not who self-selected in?",
        a: "It is selection, and I am careful about it. Planners with bigger baskets choose to schedule. My design did not make carts bigger, it captured a higher-value cart we were previously losing.",
      },
    ],
  },
};

// The CASE-STUDY listen script: the complete-project answer, as spoken to a big-tech
// interviewer or Carnegie faculty who asks "walk me through this project." Longer and
// more defended than the PRD walkthrough above: it volunteers the role boundary, states
// the success bar, treats every number with attribution care, and carries the
// interviewer layer (asks): the questions they will ask at each point, with the answer
// to say aloud and a brainstorm note. Spoken register: no abbreviations, numbers
// written for speech, sentences that split cleanly. No em-dash, no tilde.
export const scheduledCaseNarration = {
  // Pre-rendered Qwen3-TTS (aiden) audio + timing map; see scripts/render_narration.py.
  // Re-render whenever the script changes or the player falls back to browser speech.
  audio: "/narration/scheduled-case",
  title: "The complete project, as I would tell it",
  subtitle: "Scheduled Delivery, the interview walkthrough",
  paragraphs: [
    "Let me walk you through the whole project. Zepto is a ten-minute grocery delivery app, that is the entire brand promise, and my brief was to add scheduled delivery, the ability to pick a one-hour slot up to days ahead. The real question was never how to build a scheduler. It was how to add later to a product that has staked everything on now, without the two ideas contaminating each other. If scheduling makes even one user doubt that instant is instant, the feature has cost more than it earns. So I treated it as a trust problem before a design problem, and that framing drove every decision that follows.",

    "Before the work, the boundaries, because they matter. I led the interaction design end to end. Every flow, every state, the cart logic, the schedule page, the failure paths, that was mine. Shreya Garg was my design manager, she set direction and pushed on the craft in critique. Nishit and Kavya were the product managers, and the post-launch research was run with them, their operations, my questions and synthesis alongside. Ciara owned content design, and the rule that every state reads in positive framing is hers. I would rather tell you who did what than let end to end imply I worked alone.",

    "We also set the bar for success up front, and it was deliberately not a growth bar. Scheduling was never meant to become how people use Zepto. The bar was, does it pay for itself operationally without diluting the instant promise. Hold that bar in mind, because the numbers at the end only make sense against it.",

    "The demand was real and specific. Three kinds of people kept building full carts and then not paying. A commuter on the train home who will not be there for a delivery in ten minutes. Someone in an area instant cannot serve, especially late at night. And the big weekly shop, which the impulse mode was never built for. The value existed, only the timing was wrong.",

    "The first hard thing I learned is that a Zepto order is not one thing. The cart splits by fulfilment site. A mother hub feeds superstores and the small dark stores, stock is placed deliberately, and a mixed cart can ship in up to four pieces, each from a different site on its own clock. Dark stores only serve same-day slots, superstores serve multi-day. So scheduling could never be one switch on an order. It had to resolve per shipment, and the whole interface problem became, how does a person hold four small decisions in their head without it feeling like four errands.",

    "I let the wrong answers fail early, on purpose. Scheduling on the product page was the most instructive kill, because it turned browsing into a warning. It whispered, you might not get this now, which is precisely the fear we were trying not to plant. A tabbed cart hid the other shipments and people lost track of what they had chosen. A combined single cart demoed beautifully and collapsed the moment real mixed availability hit it.",

    "The converging decision came from testing. We ran the directions past users, and one participant said, I might forget the slots I picked for shipment one by the time I am choosing for shipment two. That sentence ended a debate I had been running with myself for weeks. The single page won because it keeps the record of your own choices visible the whole time, and a summary you can always see is itself a trust mechanism. You commit to later only when you can see exactly what you committed to.",

    "Then the craft work was the slot picker itself. One-hour windows, six at a time, grouped by part of day rather than a raw clock. The detail I am proudest of sits at the day's edge. The windows just past midnight belong to two days at once, the tail of tonight and the head of tomorrow. So when you cross from today into tomorrow they do not vanish and reappear, they relabel in place, late night becomes early morning, and you feel continuity instead of a reset. Someone scheduling at eleven at night is planning tonight, a little later, not tomorrow.",

    "There is a layer you only see in the plumbing. The one-hour window a user picks rides on a wider fulfilment window, roughly ninety minutes, deliberate margin so that a six to seven promise lands inside six to seven. That margin is also why the windows are an hour wide and not fifteen minutes. Users asked for finer slots, it became the top request, and the honest answer is that precision is an operations budget. I chose a window we could keep over a window that flattered the interface. And we deliberately did not sell looser windows at a discount, because the moment you discount flexibility you admit that precision is a premium, and precision is the whole promise.",

    "A trust feature also has to fail honestly. The hardest state was a cart that stays unserviceable even with a schedule. The instinct is to hide the broken thing, and I did the opposite. We flag it in place, say plainly which items will be removed, and offer to save them. When we miss a slot, the order does not sit there pretending. Past the window the user can cancel, and a longer breach cancels itself with an apology and a small credit. A broken promise should end cleanly, not leave someone watching a countdown that never resolves.",

    "After you book, the order changes register. The tracking surface swaps the ten-minute countdown for a scheduled-for card, mirrored on home and in orders, and then about thirty minutes before the slot the order wakes up, a rider is assigned, and it rejoins the familiar ten-minute experience to land inside the window. The feature borrows the muscle memory of the product it lives in, which is what makes later feel like a mode of Zepto rather than a different app.",

    "Go to market was restraint, on purpose. No splash, no home takeover. Scheduling surfaces contextually, mostly when the cart cannot be served now, because the dilution fear was the villain of this project and every loud placement risked feeding it. We shipped narrow first, one milestone with a single unserviceable shipment, then a month later the full multi-shipment cart with the state matrix. Ship the trust, then ship the scale.",

    "Then we validated, properly. A mixed-method study after launch, behavioural data on thousands of users, forty-five interviews, and every support ticket the feature generated. The humbling finding first, eight in ten people who scheduled did it as a fallback because instant was unavailable, not as a plan. The planner I designed for is real but smaller. I now read scheduling as much as a graceful answer to we cannot serve you right now as a planning tool, and that reframe is worth more than a flattering one. The dilution fear also stopped being my hypothesis and became a user quote. Someone asked, why would I schedule if Zepto already gets it to me at the earliest. That is the exact sentence the restraint was designed for.",

    "The hardest number was quieter. Four hundred and fifty-four where is my order tickets came from about three hundred and sixty-six users, on orders that were going to arrive exactly on time, and every single one was raised before the slot had even started. Those were fallback users who never registered they had booked the future. The worst clustered at midnight, where a twelve o'clock slot reads as the wrong half of the day, and people cancelled thinking their order had slipped. That one is on us, and it went straight back into design. An explicit arriving today on the cart, slots grouped by part of day, and a notification that repeats the exact window after you book. The fix for a trust feature is almost always to say the true thing one more time.",

    "Now the numbers, and I will give you the honest read rather than the slide. Blended adoption settled around two percent of orders. Decompose it and the truer picture appears, with instant fully available only about one point three percent choose a slot, and it climbs toward two mostly in the windows when instant cannot serve. So the topline partly measures how often instant is unavailable. Against the bar we set, pay for itself without diluting instant, it cleared both, batching cut delivery cost on scheduled orders and instant stayed untouched. On basket size, scheduled carts averaged around five hundred and fifty rupees against roughly three hundred, and I am careful with that number. It is selection, not causation. Planners with bigger baskets choose to schedule, my design did not make carts bigger, it captured a higher-value cart we were previously losing. And that average was near six hundred at seventy percent rollout before settling at five fifty at full scale, which is what you would expect as early high-intent adopters get diluted by the broader base.",

    "What I would do differently. I would run the validation research before launch, not after, the personas were asserted going in and corrected coming out. I would fight harder for the finer slots roadmap, because the top user ask deserves an answer even if the answer is operations work. And there is money on the table we never surfaced, scheduling waives surge and rain and night fees, a real price benefit users told us they could not see. If you remember one thing from this project, make it the framing. When you add later to a product built on now, the work is not the scheduler, it is the trust, and trust is built by what you are willing to show, every shipment, every slot, every failure, in plain sight, the whole time.",
  ],

  // The interviewer layer. Keys are paragraph indexes (zero-based) into paragraphs[].
  asks: {
    1: [
      {
        q: "The research was run by the PMs. How much of the flagship finding is yours to claim?",
        a: "The operations were theirs, the instrument and the synthesis were shared, and the design translation was mine. The eight-in-ten fallback finding changed my read of the feature, and the ticket analysis turned directly into three shipped design fixes. I claim the design consequences, not the fieldwork.",
        note: "Brainstorm: name one interview question YOU added to the guide, it makes the shared claim concrete.",
      },
    ],
    2: [
      {
        q: "Who set that bar, and was it written down before launch?",
        a: "It was the operating bar the product team aligned on when the feature was scoped, scheduling existed to serve demand instant loses, not to convert instant users. I can walk you through how each decision traces to it.",
        note: "Brainstorm: dig up the actual scoping doc or OKR line so this has a paper trail. If none exists, say the bar was implicit and own that.",
      },
    ],
    4: [
      {
        q: "Why not just restrict scheduling to single-hub carts and skip the whole split problem?",
        a: "Because the carts that most needed scheduling were exactly the mixed ones, the big weekly shop pulls from superstores and dark stores at once. Restricting to single-hub carts would have served the users who needed it least and quietly taught everyone else that scheduling does not work.",
        note: "Brainstorm: is there data on what share of scheduled carts were multi-shipment? That number would nail this answer.",
      },
    ],
    5: [
      {
        q: "Your product-page argument sounds asserted. What evidence says discovery-stage scheduling is wrong beyond your own failed attempt?",
        a: "Fair push. The direct evidence is the experiment we ran and killed, browsing with availability warnings read as negative listing, and the dilution fear users later voiced in research supports the same instinct. I hold it as a strong prior validated by one real attempt, not a law.",
        note: "Brainstorm: pre-order and back-in-stock patterns DO put future availability on product pages. Be ready to explain why grocery-now differs from those.",
      },
    ],
    6: [
      {
        q: "That decision rests on one sentence from one participant in a small internal test. How confident should we be?",
        a: "The quote is the story, not the sample. The debate was already leaning single-page on state-legibility grounds, the test was ten people, and her sentence crystallised the failure mode of tabs, hidden state you have to remember. Post-launch behaviour validated the choice, people managed multi-shipment schedules without the confusion tickets pointing at the page itself.",
        note: "Brainstorm: is there any post-launch signal specifically on page comprehension? Even the absence of layout-confusion tickets is usable.",
      },
    ],
    8: [
      {
        q: "So was the one-hour window a principled design choice or an operations limit you rationalised? Your users called it the top complaint.",
        a: "Both, honestly. The operations floor made anything finer a promise we would break, and I chose a keepable promise over a flattering picker. The design judgment is in what I did with the constraint. But the top complaint is real, and finer slots is the first thing I would fund next, as operations work, not interface work.",
        note: "Brainstorm: what would fifteen-minute slots actually require operationally? Knowing the answer shows you understand the system, not just the screen.",
      },
    ],
    9: [
      {
        q: "Cancel lives in a support chat. For a feature about trust and control, isn't burying cancel a trust failure?",
        a: "I will own that as a compromise. The primary controls, editing a slot before confirm and the wake-up visibility, are first class. Cancellation routed through support in v1 partly for abuse and refund handling. It is on my list of things that should graduate to a first-class control, and I would design it with the same honesty rules as the rest.",
        note: "Brainstorm: was there a real constraint (refund flow, abuse) behind chat-only cancel? Find the reason, or concede it cleanly.",
      },
    ],
    11: [
      {
        q: "Your users said they never saw the Schedule button. How do you know restraint didn't suppress the adoption you now explain away?",
        a: "It is a real tension and I hold both truths. Restraint protected the instant promise, and it cost discoverability, several non-schedulers in research had never seen the entry point. If the bar had been growth I would have made a different call. Given the bar was protect-the-core, I would make the same call again, then fix discoverability inside the contextual moments rather than with louder placement.",
        note: "Brainstorm: sketch what a discoverable-but-quiet entry looks like, a contextual nudge on the third unserviceable cart, not a banner.",
      },
    ],
    12: [
      {
        q: "If eight in ten used it as a fallback, did you design the wrong thing?",
        a: "We designed for the planner and the fallback user arrived, and the design held for both, which is the part I am glad of. The reframe is that fallback is not failure, it is retention, demand instant loses that we now keep. What I would change is the sequence, that research should have happened before launch, and the confusion tickets are the cost of learning it after.",
      },
    ],
    14: [
      {
        q: "Two percent adoption sounds like a failure. Why is this a success story?",
        a: "Because the bar was never share of orders. It was, does it pay for itself without diluting instant, and it cleared both. A ten-minute platform that converts a few percent of otherwise-lost carts into kept, bigger, batchable orders, without touching the core promise, is the outcome we scoped for. I would defend the framing before the number, the number only reads against the bar.",
      },
      {
        q: "The basket average fell from six hundred to five fifty as you scaled. Isn't the effect washing out?",
        a: "Partly, and that is expected, early adopters are the highest-intent planners, broader rollout regresses toward the mean. The number to watch is whether scheduled baskets keep a premium over instant at full scale, and they do, roughly five fifty against three hundred. If that gap ever closes, the case for the feature changes and I would say so.",
      },
    ],
  },
};
