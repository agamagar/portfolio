// The Away walkthrough, written to be SPOKEN (first person, a designer narrating
// the project to you). Fed to NarrationPlayer, which reads it aloud via the
// browser's speech synthesis and karaoke-highlights it. Authored so each
// paragraph splits cleanly into sentences (no abbreviations, no "e.g."), and
// numbers are spelled for natural speech. No em-dash, no tilde.

export const awayNarration = {
  title: "The walkthrough, narrated",
  subtitle: "Away, in the designer's voice",
  audio: "/narration/away",
  paragraphs: [
    "Let me walk you through Away. Most travel agents you build these days are a chat box with good manners, they answer your question and then they vanish. But the hard part of a trip is almost never the answer. It is the follow-through, the cheap fare that quietly hides a self-transfer, the schedule change three weeks out, the cancelled flight at two in the morning. So Away is built the other way around, to own the whole case, not the single turn, a travel agent you keep that finds the flight, vets it, books it, watches it for months, and steps in when the trip goes wrong. I was the only designer on a founding team of five, and my job was the agent as a whole experience, how much it says, does, and decides at every moment. The one hard problem underneath everything was holding two opposites at once, an agent complete enough to do all of that, and disciplined enough to never take the wheel.",

    "The reframe came first, before any screen. Booking a flight is the part everyone competes on, and a booking is rarely where a trip actually breaks. The pain shows up later, the connection you are about to miss, the compensation you are owed and never claim, the passport that is a month short of the six month window. A chat box that disappears after the answer cannot touch any of that, which is exactly where the value lives. So I stopped designing a better booking flow and started designing a relationship across the whole trip, a full lifecycle from the first vague search to the final refund, find, vet, book, watch, rescue, and remember. That is a much larger and stranger thing to design, and it changed every decision after it.",

    "Before the screens, I kept walking real travellers through their real trips, how they book, what they do when a flight moves, who they call when something breaks abroad. The people differed and the trips differed, but one sentence came back almost word for word from everyone who used a human agent. I reach out to my agent, and they already know what is going on, I do not have to worry. Read it carefully and that is not a compliment about service, it is the whole foundation. Nobody briefs their own agent, and the moment you have to explain your trip to the person who is supposed to be watching it, the relationship is already dead. So that became the bar for everything after the booking, you never, ever catch the agent up.",

    "The brand gave me the spine for the voice. Away is the friend in the trade, warm and generous pointed at you, dry and unimpressed pointed at the airlines and the big travel sites that profit from your confusion. The enemy is never the traveller, it is the industry, and the agent has a real point of view about it. The craft is knowing when to turn that point of view down. I think of it as a dial with three settings, loud and opinionated when it is winning something for you, plain and calm the moment your money is moving or something has gone wrong, and all warmth in a real crisis, because a joke in the wound is unforgivable. One rule holds it together, charm and clarity never share a sentence.",

    "The thing that first sets Away apart is that it does not just search, it negotiates. Behind one tap, the agent fans out across hundreds of supplier fares and consolidator rates, the bulk and agency prices that sit below the public number, and works your chosen flights down to the best deal it can find. That takes a couple of minutes, and a blank spinner for that long reads as broken while hiding the very work that justifies the price. So I designed the wait itself, a live timeline built from your own airlines and routes, scanning inventory, cross-referencing prices, negotiating bulk rates. It leans on a simple truth, that visible effort is trusted and valued more than a number that just appears. And I held a hard line on honesty there, the timeline names the category of work truthfully and never claims a step the system cannot guarantee, then it resolves on the one thing that is unambiguous, the public fare struck through and the negotiated price beside it.",

    "One of the biggest calls got made by the data, not by me. I assumed domestic and international were two different searches, a fast scan for the home routes and a richer, slower flow for the big trips abroad, and I was close to building it exactly that way. Then I pulled the real fare payloads, and the border turned out to be the wrong line to draw. What separates the two is not the passport, it is the price anchor. A four hour Bangalore to Dubai hop is non-stop and predictably priced, so the traveller roughly knows the number and the job is just to show the options. A thirty-one hour trip from Bangalore to the United States is almost always two stops, a third of the fares quietly drop the checked bag, and the price swings through a different hub each time, so the traveller has no idea what good even costs. So I built one system that shifts gears on that signal, instead of two products that drift apart.",

    "To make the fares themselves honest, I pulled forty-five thousand real ones out of the deep search and studied them. The first thing the data killed was leaning on airline fare brands, there were more than a thousand distinct brand names in there, half of them supplier-internal noise you cannot build a shelf out of. So Away stops reselling brands and instead reads every fare across a few plain axes and hands you a verdict, with the catch on its face. And the honesty runs deeper than naming, because the data is unsentimental. Across those forty-five thousand fares the negotiated price beat the public one only about half the time, and when it did win the typical edge was three point four percent. So when a rate cannot beat the public fare, the agent says so plainly, it tells you this is already the best price here rather than inventing a discount to look clever.",

    "The results card is the piece I care most about, because it is an argument, not a row in a list. It leads with the single flight the agent would book, then it shows its work, the options it threw out and the exact reason each one lost, the cabin-only fare that is not actually cheapest once the counter charge lands, the self-transfer no airline will cover if your first leg slips. Naming the rejected flights out loud is the move no travel site makes, and it is what retires the fear that something better was hiding. Underneath sits a price-by-date strip that looks like a filter and is deliberately not one, it is evidence that the agent swept the whole landscape and this is the floor. I actually built a version with a draggable price range, the kind you slide on a booking site, and then I cut it. In an agent product, making you operate the controls is the failure, not the feature, so the bars stayed as proof and the handles went.",

    "The highest-trust moment in the whole product is a small one, the agent spending its own credibility to talk you out of a cheaper option, a hidden self-transfer, a connection one in four people miss. It costs the agent something to say that, and that is exactly why it lands. Paying is the mirror image, the one thing the agent never does for you. It finds, vets, and prepares the entire booking, then hands you the tap, no stored-card surprise, no fare quietly pushed through while you were not looking. The convenience fee is zero, so the price you agreed to is the price you pay. And with our pay-later option the order is reversed from a normal travel site, the ticket is issued first and you settle after, so you are never paying into a void and hoping a confirmation appears.",

    "After you book is where the agent you keep becomes real. It stays awake the whole trip, quiet in the long middle so it never nags, then it sharpens as departure nears, checks you in, tells you when to leave, and in transit it does the anxious arithmetic for you, you have forty-seven minutes, your gate is a twelve minute walk, you are fine. Most of that value is small and invisible, a hundred things handled before you thought to ask. But the moment that justifies the entire product is a cancelled flight at two in the morning. The voice goes fully calm there, and what makes it more than reassurance is that it knows what you are actually owed, because I had the real rules researched and encoded. In India the airline owes you care and a refund even when a cancellation is nobody's fault, in Europe a long delay can owe you real cash, and a stitched-together self-transfer is the trap where no airline is on the hook at all. The agent never rebooks in the dark, it arrives already holding the smart move and hands it off cleanly, so you take it from there with the panic already done for you.",

    "The best surprise in Away is one no other app offers. Because the agent spends its goodwill in the hard moments, the good moments have to refill it, and the way they do that is by making its competence visible. The trip ends on a recap that plays back what it saved you, the time, the money, the comfort and the flexibility you chose. And then the single best moment, after a rough trip the agent tells you about money you did not even know you were owed and drafts the claim for you, your Frankfurt flight was delayed, you are owed about six hundred euros, here is the claim I have prepared. Most travellers never claim that. Away claims it for them.",

    "On the numbers, I will give you the real read rather than a slide. Version one is live with an invite-only group and the traction is real, but the data is still young. So instead of dressing up a first-week spike, I declared the scoreboard in advance and tied every number to the design bet it will prove or break. The one signal I can stand behind today comes from the earlier negotiation experiment, where about a third of users negotiated instead of taking the listed price, and this build carries that baseline forward. If there is one thing to take from all of it, it is the framing, an agent complete enough to do the figuring-out, and disciplined enough to never take the wheel. It does the figuring-out, you still travel, and that was the whole job.",
  ],
  asks: {
    0: [
      {
        q: "Sole designer on a five-person team, what was actually yours versus product and engineering?",
        a: "[you fill: name what engineering and the CEO owned, for example the payment and ticketing integration and the resilience backbone. I owned the whole experience layer: the voice, the behaviour, the fare-verdict model, and the rights research.]",
        note: "Fill with the real split before any interview; an undifferentiated I is the risk.",
      },
    ],
    8: [
      {
        q: "An agent that never takes the wheel, is that not just slower? Where is the evidence users want it?",
        a: "It is a deliberate v1 trust-earning constraint on a product moving real money, not an eternal law. My own reflection admits a stranded traveller often wants it just fixed. v1 earns the right to act by proving it asks well; I will relax the constraint with data.",
        note: "Brainstorm: find one real moment where asking first saved a booking, one story beats the principle.",
      },
    ],
    9: [
      {
        q: "Which of these screens actually shipped versus are speculative?",
        a: "Shipped: onboarding, search, negotiation, vetting, and booking through payment. Designed but not built, and I flag these: PNR-stitching, codeshare, series fares, per-segment granularity, server-side idempotency, and most of the post-booking watch and rescue arc. The funnel shows most users live in the search-to-book stretch.",
        note: "Volunteer this boundary before they ask; the case narrates the lifecycle as if lived.",
      },
    ],
    11: [
      {
        q: "You show a scoreboard but no numbers. Define traction with a number, right now.",
        a: "Honest funnel: around 1,950 installs. Strong through negotiation, negotiation-engaged users book at 60% and pay at 20%, onboarded users book at about three times baseline. Then it drops at payment: about 35% payment success, 87 tickets issued in a hundred days. The design works up to the money moment; payment reliability is the number one engineering bet I scoped next.",
        note: "Leading with the real good number and then the leak reads as rigor, not spin. Never say the traction is real without a number ready.",
      },
    ],
  },
};
