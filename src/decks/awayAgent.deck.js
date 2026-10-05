// Presentation deck for the Away agent case study ("away-agent" in App.jsx).
// Composed from the slide-archetype library in App.jsx (see buildSlides / Slide),
// following the interview 'recipe' set by scheduledDelivery.deck.js:
// title -> the central question -> set the table -> the research bar ->
// four phases (The bet, Search and verdict, The money moment, The watch),
// each opened by a phaseDivider -> the decisions ledger -> the declared
// scoreboard -> close. Figure ids reference the coded figures the article
// uses (src/figures/away-agent).

export const awayAgentDeck = [
  {
    "type": "title"
  },
  {
    "type": "statement",
    "kicker": "The central question",
    "text": "How do you build an agent complete enough to own the whole trip, and disciplined enough to never take the wheel?"
  },
  {
    "type": "splitLabeled",
    "h": "Set the table",
    "items": [
      {
        "label": "Overview",
        "body": "Away is a travel agent you keep: it finds the flight, negotiates and vets it, books it, watches it for months, and steps in when the trip goes wrong. Not a chat box that answers and disappears."
      },
      {
        "label": "Role",
        "body": "Founding designer, the only designer on a five-person team. I led design end to end: how the agent searches, vets, gates the booking, and behaves through every phase after, plus the voice it speaks in."
      }
    ]
  },
  {
    "type": "statement",
    "kicker": "The research, in one sentence",
    "text": "I reach out to my agent, and they already know what's going on. I don't have to worry.",
    "cite": "Every traveller who used a human agent, across every scenario we walked through"
  },
  {
    "type": "phaseDivider",
    "n": "01",
    "name": "The bet",
    "sub": "The hard part of travel is not the booking"
  },
  {
    "type": "figure",
    "h": "Own the case, not the turn",
    "p": [
      "Booking a flight is the part everyone competes on, and it is rarely the hard part. The hard parts come later, and a chat box that forgets you on close can never reach them.",
      "So Away owns the whole case: find, vet, book, watch, rescue, remember. That reframes the problem from a better booking flow into a relationship across months."
    ],
    "ul": [
      "The cheap fare that quietly hides a self-transfer",
      "The schedule change three weeks out",
      "The connection you are about to miss",
      "The compensation you are owed and never claim"
    ],
    "layout": "text"
  },
  {
    "type": "compare",
    "h": "The two ways agents fail",
    "a": {
      "label": "The wrapper",
      "body": "Answers the turn well, then vanishes. It cannot touch the follow-through, the failure, or the 2am call, which is exactly where the value lives.",
      "verdict": "Optimises the turn, misses the job"
    },
    "b": {
      "label": "The chauffeur",
      "body": "The over-correction: an agent that takes the wheel. On a product moving real money, one wrong auto-action and it is done. Trust does not come back.",
      "verdict": "One wrong move, trust gone"
    },
    "note": "The target sits between them: complete without autonomy. The agent does the figuring-out, you still travel."
  },
  {
    "type": "numbered",
    "kicker": "The voice",
    "h": "One dial, three registers",
    "items": [
      {
        "title": "Edge",
        "body": "Loud, dry, and opinionated, pointed at the industry: the verdict on a search, the trap flagged, the compensation you are owed."
      },
      {
        "title": "Calm",
        "body": "Plain and restrained, no jokes, wherever you are exposed: the first thirty seconds, anything touching money, any error."
      },
      {
        "title": "Warmth",
        "body": "All warmth, zero edge, in a real crisis. A joke in the wound is unforgivable."
      }
    ]
  },
  {
    "type": "phaseDivider",
    "n": "02",
    "name": "Search and verdict",
    "sub": "From a messy sentence to the one flight worth booking"
  },
  {
    "type": "figure",
    "h": "The brief",
    "p": [
      "A good search needs a lot of facts, so the agent gathers them as a conversation, one tappable question at a time, never a form. The preferences you give last become the lens it vets with later.",
      "And the messy, real request is never the worse path. One client typed a single paragraph carrying eleven constraints, two flexible origins, a date range, carriers to avoid, a transit-visa rule. The agent pulled each one out into a structured brief."
    ],
    "fig": "awIntakeBrief",
    "figure": "A real test-run brief, untangled: one paragraph, eleven constraints, each turned into a structured field.",
    "layout": "split"
  },
  {
    "type": "figure",
    "h": "Asks first",
    "p": [
      "A wrong guess is cheap in a chatbot and expensive in a booking. Type just a city and the agent does not invent dates and start spending. It asks.",
      "But a question that scrolls up the thread is where chat gets awkward, so the question is not a bubble: the composer you are already looking at morphs in place into a tappable card. Only the latest question ever lives in that slot, so stale cards are structurally impossible."
    ],
    "fig": "awClarify",
    "figure": "The composer morphs into a clarifying card: the agent asks rather than guesses, and a tap sends the answer.",
    "layout": "split"
  },
  {
    "type": "figure",
    "h": "The wait",
    "p": [
      "A real negotiation across hundreds of supplier fares takes a couple of minutes, and a blank spinner reads as broken while hiding the work that justifies the price. So the agent narrates: a live timeline built from your actual airlines and routes.",
      "I held one line hard here: the narration names the category of work truthfully and never claims a step the system cannot guarantee. It resolves on the one unambiguous thing, the money."
    ],
    "fig": "awDeepSearch",
    "figure": "The deep-search timeline: the agent thinking out loud, resolving on the public fare struck through and the negotiated price beside it.",
    "stamp": "Watch it think",
    "layout": "split"
  },
  {
    "type": "methodFinding",
    "h": "The flow I almost built, and the data that stopped me",
    "finding": "The split that matters is not the border. It is whether the traveller has any idea what good costs.",
    "p": [
      "I was close to shipping domestic and international as two products. Then I pulled the real fare payloads: a four-hour Bangalore to Dubai hop behaves exactly like a domestic scan, while a thirty-one-hour trip to the US has no price anchor at all, and a third of its fares quietly drop the checked bag.",
      "So it is one system that shifts gears, reading price magnitude, anchor strength, and how much the options vary. The passport never decides how hard the agent works. The shape of the decision does."
    ]
  },
  {
    "type": "figure",
    "h": "Trap check",
    "p": [
      "Indian travellers are trained to scroll a list and pick, so I did not fight the muscle memory. The agent hands back a list, but one it has already vetted: sorted by which flight is right, not merely cheapest, with the traps flagged inline and the reason attached.",
      "That warning, the agent spending its own credibility to talk you out of a cheaper option, is the highest-trust moment in the product. And when nothing beats the public fare, it says so plainly and offers nearby dates instead, the one thing no OTA will ever tell you."
    ],
    "fig": "awVet",
    "figure": "The vetted listing: sorted by what is right, the trap flagged with its reason, the public fare struck through where the negotiation wins.",
    "layout": "split"
  },
  {
    "type": "figure",
    "h": "The verdict",
    "p": [
      "The verdict card leads with the single flight the agent would book, then shows its work: a short dossier of the options it ruled out, each with the reason it lost. Naming the rejected traps out loud is the move no OTA makes, and it retires the fear that something better was hiding.",
      "The price-by-date strip looks like a filter and is deliberately not one. I built a draggable version, then cut it: in an agent product, making you operate the controls is the failure. The bars stay as evidence the floor was found. The handles go."
    ],
    "fig": "awResultCard",
    "figure": "The verdict as an argument in layers: the pick, the ruled-out traps with reasons, and the price strip as proof, not a control.",
    "layout": "split"
  },
  {
    "type": "figure",
    "h": "Fares are verdicts",
    "p": [
      "I pulled 45,000 real international fares out of the deep search, and the first thing the data killed was airline fare brands: over a thousand distinct brand strings, half of them supplier noise. You cannot build a shelf out of that.",
      "So Away renders a verdict on every fare instead, a small set of honest value types with the catch on its face. The honesty is load-bearing: the negotiated price beat the public one only about half the time, with a typical edge of 3.4 percent, so when it does not win the card says already the best price here. It never invents a discount."
    ],
    "fig": "awFareCards",
    "figure": "Fare types as verdicts: the true all-in price with its source, the trap ledger, and the Bare fare shown unmasked with its stripped atoms greyed.",
    "layout": "split"
  },
  {
    "type": "phaseDivider",
    "n": "03",
    "name": "The money moment",
    "sub": "The agent prepares everything. You make the tap"
  },
  {
    "type": "figure",
    "h": "Tap to pay",
    "p": [
      "The commit is the one thing the agent never does for you. It finds, vets, and prepares the whole booking, then hands you the tap: no stored-card surprise, no auto-charge, no fare pushed through while you were not looking.",
      "Two things make paying feel safe rather than tense. On UPI the convenience fee is zero, so the price you agreed to is the price you pay. And with Away Advance the order is reversed from a normal OTA: the ticket is issued first, then you settle. You are never paying into a void hoping a PNR appears."
    ],
    "need": "The tap-to-pay moment, exported from the Away Figma motion reel",
    "needHint": "The fare breakdown with a zero fee on UPI, the tap, and the money-in-flight hold",
    "needDim": "393 × 852",
    "layout": "split"
  },
  {
    "type": "methodFinding",
    "h": "A worried double-tap, held",
    "finding": "A parent who taps twice in a panic must never become a parent who is charged twice.",
    "p": [
      "The payment screen locks back-navigation and polls the gateway until it has a real answer, so a double-tap is held, not re-charged. A declined card lands on a calm retry, with no blame and the fare still held.",
      "The honest gap, on the record: there is no server-side idempotency guard yet. The locked screen is the real guard, and I would rather say that plainly than imply a safety net that is not there."
    ]
  },
  {
    "type": "figure",
    "h": "Confirmation",
    "p": [
      "Confirmation is the emotional payoff, you are going to Goa, and a quiet danger zone: the airline can take minutes to issue the PNR, and that gap, real money spent and no ticket in hand, is the scariest stretch in the product.",
      "So the agent holds you there: issuing your ticket, this is normal, I will ping you the second it is done. Never a dead spinner, always a place to watch it. It is also the moment the agent says, in effect, I have it from here, and starts the watch."
    ],
    "fig": "awConfirm",
    "figure": "Confirmation: the payoff first, then the paid-but-not-yet-ticketed gap held steady, polling until the PNR lands.",
    "layout": "split"
  },
  {
    "type": "phaseDivider",
    "n": "04",
    "name": "The watch",
    "sub": "Months of quiet, and the 2am call"
  },
  {
    "type": "figure",
    "h": "The quiet middle",
    "p": [
      "Nobody briefs their own agent, so the bar after booking is simple: you never, ever catch the agent up. In the long middle the agent is a silent steward: no nagging pings, a living diary of what it is watching, and the passport-and-visa check run weeks early, while a problem is still cheap to fix.",
      "As departure nears it sharpens into an operator: check-in handled, the leave-by time with traffic in mind, and in motion the anxious math done for you. You have forty-seven minutes, your gate is a twelve-minute walk, you are fine."
    ],
    "fig": "awHub",
    "figure": "The quiet middle: a living diary instead of claims, a passport problem caught early, and the agent calling back when the fare drops.",
    "layout": "split"
  },
  {
    "type": "figure",
    "h": "When it breaks",
    "p": [
      "A cancelled flight at 2am is the moment that justifies the whole product. The voice goes all warmth, zero edge, and the surface opens already knowing: what changed, what you are owed, the one smart move already worked out. Never how can I help you today.",
      "What makes it more than reassurance is the rights line. I had the real rules researched and encoded: in India the airline owes you care and a refund even in force majeure; in the EU a long delay can owe you cash. And the agent still never rebooks in the dark. It hands you the desk, the drafted message, the deep link, with the panic already done for you."
    ],
    "fig": "awDisruption",
    "figure": "The rescue surface: what changed, what you are actually owed, the one smart move, and a clean hand-off. The agent preps, you commit.",
    "layout": "split"
  },
  {
    "type": "figure",
    "h": "The recap",
    "p": [
      "Because the agent spends its goodwill in the hard moments, the good ones have to refill it, and they do it by making competence visible. The trip ends on a recap that plays it back: time saved, money saved, the comfort and flexibility you chose.",
      "Then the single best delight, one no other app offers: your Frankfurt flight was delayed six hours, you are owed about six hundred euros, here is the claim, I have drafted it. Most travellers never claim what they are owed. Away does it for you."
    ],
    "fig": "awRecap",
    "figure": "The peak-end: the four-param recap, then the compensation you did not know you were owed, with the claim already drafted.",
    "layout": "split"
  },
  {
    "type": "numbered",
    "kicker": "The decisions ledger",
    "h": "The forks, and what I turned down at each",
    "items": [
      {
        "title": "Own the case, not the turn",
        "body": "The value lives in the follow-through. I turned down the wrapper that answers well and vanishes."
      },
      {
        "title": "Hand off, never take the wheel",
        "body": "One wrong auto-action breaks trust where real money moves. I turned down autonomy, even where it would feel faster in a crisis."
      },
      {
        "title": "One system, not two flows",
        "body": "The fare data said the passport was the wrong line to draw. I abandoned the two-flow build I had almost started."
      },
      {
        "title": "Upgrade the habit",
        "body": "Indian travellers are OTA-trained, so scroll-and-pick survives, handed back as a vetted, trap-flagged list."
      }
    ]
  },
  {
    "type": "impact",
    "mark": "The scoreboard",
    "h": "v1 is live, invite only. The scoreboard was declared before the results, and the numbers land here as they stabilise.",
    "metrics": [
      {
        "value": "End to end",
        "label": "Bookings handed over whole: do people give the agent the case, not just the search?"
      },
      {
        "value": "Repeat",
        "label": "Trips per traveller, unprompted: the agent-you-keep bet"
      },
      {
        "value": "Caught",
        "label": "Before it hurt: passport flags acted on, traps dodged, junk fares avoided"
      },
      {
        "value": "Claims won",
        "label": "Compensation filed and collected: the rights engine as the moat"
      },
      {
        "value": "Recovered",
        "label": "Dropped streams that resume with the case intact: the crisis backbone"
      }
    ]
  },
  {
    "type": "closing",
    "h": "The line I watch hardest is the one in the title",
    "p": [
      "Never take the wheel is the right constraint for trust, but it has a real cost in the moment: a stranded traveller would often rather the agent just fixed it. Doing everything up to the commit and nothing past it is the thing I am least finished thinking about.",
      "The other discipline is the rights engine: an agent that confidently tells you what you are owed had better be right. I scoped it to the regimes Indian travellers hit most, and flagged what I could not verify rather than guess."
    ],
    "kind": "outcome"
  },
  {
    "type": "closing",
    "h": "Thank you",
    "p": [
      "The agents that win will not be the ones that answer best. They will be the ones that own the whole case: present for months, sharp in a crisis, and disciplined enough to leave the commit in your hands. It does the figuring-out. You still travel."
    ],
    "kind": "thanks"
  }
];
