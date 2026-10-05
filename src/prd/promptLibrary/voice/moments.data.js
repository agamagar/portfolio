// Moments, as structured data: each is a job, optional extra context, and the
// reference lines. Everything else in the rendered prompt comes from the framework.
// Part of the prompt library (src/prd/promptLibrary). See index.js for the map.

export const MOMENT_SETS = [
  {
    "id": "pl-away-moments",
    "framework": "pl-away-voice",
    "eyebrow": "Away",
    "title": "Away · moments",
    "summary": "21 moments. Each block is the exact, copy-paste prompt for that moment (topic left as [your topic]).",
    "moments": {
      "First touch / onboarding": {
        "job": "Open the conversation, no forms, get them talking about the trip.",
        "references": [
          "where to?",
          "tell me where, i’ll handle which flight.",
          "say the destination. i’ll do the forty tabs."
        ]
      },
      "Kicking off a search": {
        "job": "Confirm you heard them and set expectations without hype.",
        "references": [
          "bali in december. on it.",
          "got it — DEL to bali, mid-december. give me a sec.",
          "looking now. i’ll come back with the few that are actually worth it."
        ]
      },
      "Search results / verdict": {
        "job": "Don’t dump options — give the shortlist and the reason.",
        "references": [
          "8 flights. 3 are actually good.",
          "checked everything flying that week. only 3 worth your time.",
          "most of these are traps. here are the ones that aren’t."
        ]
      },
      "The recommendation": {
        "job": "Name the one you’d book yourself, with the specific why.",
        "references": [
          "best bet: indigo direct, ₹38,400. lands 3:20pm, 94% on-time.",
          "this is the one i’d book. non-stop, decent legroom, home by 5.",
          "if it were my trip: the 9:10am direct. costs ₹2k more, saves you a brutal day."
        ]
      },
      "Warning / flag": {
        "job": "Grab their arm before the mistake. Always the why, never alarm.",
        "references": [
          "the ₹28k qatar? skip it. 30 hours and a visa trap.",
          "heads up — this one needs a transit visa at mumbai. most sites won’t tell you.",
          "cheapest on paper. also a connection 1 in 4 people miss. not worth the ₹6,300."
        ]
      },
      "Deep Search in progress": {
        "job": "Make the wait feel like work on your behalf, not a spinner.",
        "references": [
          "checking places kayak can’t see. takes a few minutes.",
          "calling around the consolidators. usually saves a few thousand."
        ]
      },
      "Deep Search result": {
        "job": "State the gap you closed, in money.",
        "references": [
          "found it — ₹4,200 below the cheapest public fare.",
          "got you ₹6,100 under google flights. same flight, same seat."
        ]
      },
      "Booking confirmation": {
        "job": "Clean paperwork — accurate, scannable, then get out of the way. (Soften: transactional.)",
        "references": [
          "booked. DEL → DPS, 6E-2053, dec 14. 2 passengers. ₹42,200 total.",
          "done. confirmation’s in your email. seats 2A + 2B."
        ]
      },
      "Hold / commit": {
        "job": "Give breathing room without pressure.",
        "references": [
          "want me to hold it? free for 24 hours, no card.",
          "hold it or commit — your call. fare’s locked either way for 24h."
        ]
      },
      "Price-drop alert": {
        "job": "The agent who calls back weeks later because the fare moved.",
        "references": [
          "fare dropped ₹3,400 on your bali flight. want me to rebook?",
          "watching this since you booked — it finally dropped. here’s the move."
        ]
      },
      "Monitoring reassurance": {
        "job": "Prove you’re still on the clock without nagging.",
        "references": [
          "still watching. no drop worth your time yet — i’ll only ping if it’s real.",
          "checked again today. holding steady. no action needed."
        ]
      },
      "Pre-departure": {
        "job": "Anticipate the airport friction before they hit it.",
        "references": [
          "check-in opens in an hour. terminal 3 at DEL — leave extra time, security’s slow.",
          "you’re flying tomorrow. visa’s sorted, seats are good. nothing for you to do."
        ]
      },
      "Amend / change / cancel": {
        "job": "Handle the dread admin, tell the real cost, no judgment.",
        "references": [
          "want to move it a day? change fee’s ₹2,500 — or i can find a cheaper reroute.",
          "cancelling: you get ₹31k back, ₹2,200 held by the airline. want me to file it?"
        ]
      },
      "Book gate / paywall": {
        "job": "Be straight about the trade. No dark patterns, no fake urgency. (Soften.)",
        "references": [
          "free to look, always. booking and the 90-day watch is where credits come in.",
          "one fare, fully handled — search, book, and i keep watching it. here’s the cost."
        ]
      },
      "Referral (WhatsApp)": {
        "job": "The conspiratorial \"let you in on it\" handoff. Outlaw can run freer.",
        "references": [
          "know someone who still books on kayak? do them a favour.",
          "send this to the friend who always overpays. you both get in."
        ]
      },
      "Re-engagement / next trip": {
        "job": "The agent who remembers you and reopens the door.",
        "references": [
          "back from bali? where to next.",
          "it’s been a while. found a couple of routes you’d actually fly. want them?"
        ]
      },
      "Disruption (delay/cancel)": {
        "job": "Calm, specific, already holding the next step.",
        "references": [
          "your 6E-2053 got moved 3 hours later. still makes your connection — you’re fine.",
          "indigo cancelled the morning flight. i’ve found two ways out. here’s the better one."
        ]
      },
      "Error states": {
        "job": "Say what broke, what it means, what’s next. No false cheer, no blame.",
        "references": [
          "couldn’t reach indigo’s system. their end, not yours. retrying in 30s.",
          "payment didn’t go through — card declined. try another, your fare’s still held."
        ]
      },
      "Empty states": {
        "job": "Turn nothing into a next move.",
        "references": [
          "no flights for those exact dates. widen by a day — midweek usually drops.",
          "nothing worth booking on that route yet. want me to watch it and ping you?"
        ]
      },
      "Marketing / landing line": {
        "job": "Confident brand that doesn’t try hard. Name the gap, not the feature.",
        "references": [
          "They give you options. Away gives you opinions.",
          "The fares they don’t show you.",
          "Sorting by price isn’t intelligence. Knowing what to skip is."
        ]
      },
      "App Store line": {
        "job": "Conversion copy that weaves keywords without hype.",
        "references": [
          "One conversation books your international flight — and tells you which one is actually worth taking."
        ]
      }
    }
  },
  {
    "id": "pl-zepto-moments",
    "framework": "pl-zepto-voice",
    "eyebrow": "Zepto",
    "title": "Edge · moments",
    "summary": "11 moments. Each block is the exact, copy-paste prompt for that moment (topic left as [your topic]).",
    "moments": {
      "Suggestion card": {
        "job": "Propose a money move with the number and a one-tap action.",
        "references": [
          "Shift ₹12K from Sugarfree-A to Sugarfree-B. 2.4x higher ROAS this week. Apply?"
        ]
      },
      "Alert card": {
        "job": "Flag what’s bleeding, with the metric and the move.",
        "references": [
          "ROAS dipping on Beco wipes — 3.2x to 2.8x in 24h. Diagnose?",
          "3 advertised SKUs going OOS in BLR-South by 7 PM. Pause them?"
        ]
      },
      "Diagnostic card": {
        "job": "Name the drop, the likely cause, the fix — in three beats.",
        "references": [
          "CTR dropped 22% Monday. Likely creative fatigue on banner B — live 14 days, frequency 8.2. Rotate two variants?"
        ]
      },
      "Draft / creation": {
        "job": "Say what’s ready and offer to ship.",
        "references": [
          "3 Diwali headlines for Beco wipes — Hindi + English ready. Use?",
          "Draft ready. 4 campaigns swapped to Diwali keywords. Ship?"
        ]
      },
      "Toast notification": {
        "job": "One line of news + a two-word choice.",
        "references": [
          "3 SKUs going OOS by 7 PM — and they’re live. Handle it / Skip",
          "Sugarfree-A burns out in ~36h at this pace. Reallocate / OK"
        ]
      },
      "Sample prompt (starter)": {
        "job": "A user-facing starter the brand manager can tap.",
        "references": [
          "Save me ₹50K this week",
          "Why did CTR tank on Monday?",
          "Spin up a 14-day banner test for Beco wipes in BLR",
          "Move money to whatever’s winning"
        ]
      },
      "Input placeholder": {
        "job": "Rotating, contextual nudge in the chat box.",
        "references": [
          "Ask anything about your ads",
          "Make me a Diwali campaign",
          "Save me ₹50K"
        ]
      },
      "Empty state": {
        "job": "Turn empty into momentum, dry and short.",
        "references": [
          "Nothing burning. Nice.",
          "Start something below.",
          "No hits. Try a different word."
        ]
      },
      "Error / edge case": {
        "job": "Say what broke and offer the next move — no apology theatre.",
        "references": [
          "Today’s data isn’t in yet. Want yesterday’s?",
          "Lost the connection. Retry?",
          "Hit a wall. Try again or tweak."
        ]
      },
      "Apply / status": {
        "job": "Confirm the change in the fewest words.",
        "references": [
          "Done. Changes live.",
          "Most went through — 1 didn’t. See why?",
          "Reverted. We’re back where we started."
        ]
      },
      "Onboarding tooltip": {
        "job": "Point at the thing, in one line.",
        "references": [
          "This is Edge. Click anywhere to ask.",
          "Stuck? Pick a starter."
        ]
      }
    }
  },
  {
    "id": "pl-zepto-premium-moments",
    "framework": "pl-zepto-premium-voice",
    "eyebrow": "Zepto",
    "title": "Zepto Premium · moments",
    "summary": "14 moments. Each block is the exact, copy-paste prompt for that moment (topic left as [your topic]).",
    "moments": {
      "Invite / eligibility": {
        "job": "Tell them they've been picked, without making a show of it.",
        "references": [
          "You're in. It's ready when you are.",
          "Based on how you shop, this is worth ten minutes of your time.",
          "A spot opened up. Yours if you want it."
        ]
      },
      "Onboarding": {
        "job": "Show what changed without running a tour.",
        "references": [
          "Same app. Quieter, faster, already set up for you.",
          "Nothing to configure. It's already working.",
          "Your next order goes through the fast lane. That's it."
        ]
      },
      "Dedicated space": {
        "job": "Point to the reserved surface without calling it a perk.",
        "references": [
          "This row is yours. Nobody else sees it.",
          "A section set aside for what you actually buy.",
          "Held for you, not sorted by what's popular."
        ]
      },
      "Curated pick": {
        "job": "Hand over the one thing worth their attention today.",
        "references": [
          "One pick today: the oat milk you keep running out of.",
          "Skipped the rest. This is the one worth it.",
          "Found something better than your usual. Want it swapped in?"
        ]
      },
      "Persona-tailored suggestion": {
        "job": "Sound like it knows this specific person, not a segment.",
        "references": [
          "You've been buying clean labels all month. Try this next.",
          "Restocking the usual, plus the bar you liked last week.",
          "Three ingredients, not thirty. Matches what you've been picking."
        ]
      },
      "Priority delivery status": {
        "job": "State the fast lane as fact, no fanfare.",
        "references": [
          "Ahead of the queue. Eight minutes out.",
          "Yours goes first today.",
          "Already packed. Rider's assigned."
        ]
      },
      "Order confirmation": {
        "job": "Clean, quiet paperwork, then get out of the way.",
        "references": [
          "Handled. Fourteen items, ₹1,240, here by 9:40.",
          "Done. Nothing else needed from you."
        ]
      },
      "Deep check / why this made the cut": {
        "job": "Justify the pick without selling it.",
        "references": [
          "Checked the label. No added sugar, unlike the one you had last time.",
          "This batch passed, the last one didn't. Swapped it for you.",
          "Vetted before it reached your list. Not just in stock, in stock and good."
        ]
      },
      "Value recap": {
        "job": "Show what was quietly handled this month, in specifics.",
        "references": [
          "Three substitutions caught before they became your problem.",
          "Saved you two trips back for forgotten items this month.",
          "Nothing dramatic happened this month. That was the point."
        ]
      },
      "Renewal reminder": {
        "job": "State the fact, no pressure, no countdown theatrics.",
        "references": [
          "Renews in three days. Same terms, same spot held.",
          "Your space stays open through the 14th."
        ]
      },
      "Downgrade / cancel": {
        "job": "No guilt, no retention theatre, handle it cleanly.",
        "references": [
          "Done. Your usual list stays exactly as it is.",
          "Cancelled. If it's the price, say so and we'll find what fits."
        ]
      },
      "Referral": {
        "job": "A quiet invite, not a campaign.",
        "references": [
          "Know someone who'd actually use this. Bring them in.",
          "One spot to give away. Yours if you want it."
        ]
      },
      "Error / stockout": {
        "job": "Say what happened, already fixing it, no apology theatre.",
        "references": [
          "Out of stock. Swapped for the next best, same price.",
          "Missed today's window. Moved you to tomorrow's first slot."
        ]
      },
      "Marketing / landing line": {
        "job": "Confident, doesn't announce itself as premium.",
        "references": [
          "The list that already knows what you need.",
          "Less browsing. Better picks.",
          "Not more options. Better ones."
        ]
      }
    }
  },
  {
    "id": "pl-generic-moments",
    "framework": "pl-generic-voice",
    "eyebrow": "House",
    "title": "Generic · moments",
    "summary": "6 moments. Each block is the exact, copy-paste prompt for that moment (topic left as [your topic]).",
    "moments": {
      "Headline": {
        "job": "One sharp line that lands the value.",
        "references": []
      },
      "Button / CTA": {
        "job": "Two or three words, action-first.",
        "references": []
      },
      "Empty state": {
        "job": "Explain what’s here and the next step.",
        "references": []
      },
      "Error message": {
        "job": "What happened, what it means, what to do.",
        "references": []
      },
      "Notification / push": {
        "job": "One line of news plus a reason to open.",
        "references": []
      },
      "Onboarding line": {
        "job": "Welcome briefly, deliver value fast.",
        "references": []
      }
    }
  }
];
