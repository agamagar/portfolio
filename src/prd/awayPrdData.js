// The Away PRD content, extracted from the former A2UI surface
// (the DATA object in public/prd/away-prd.html) and shipped as plain data so the PRD
// renders as native portfolio DOM (PrdDoc.jsx) — fully scannable by Agentation.
export const awayPrdData = {
  "pillars": [
    {
      "key": "problem",
      "title": "Problem & Why-Now",
      "oneLiner": "Booking and taking a trip in India is a long, messy journey. Confusing rules, common mental traps, and scattered tools trip people up at every step, and no single product handles the whole trip for you: finding flights, checking they are good, deciding, watching them, and stepping in when things go wrong.",
      "lockedDecisions": [
        "We think of a trip as 12 stages, from dreaming about it to remembering it afterwards: dream, shape, find, vet, decide, book, watch, prepare, travel, arrive, return, remember. A separate 'something went wrong' lane can kick in at any stage.",
        "Away tackles two kinds of problems at once. One: the hard facts and rules people get wrong. Two: the quiet habits, fears, and myths that push people toward the wrong choice.",
        "We start with India on purpose. Every insight is grounded in real Indian passport, airline-rules, tax, customs, visa, and airport realities, not generic global travel advice.",
        "People feel the most anxiety when checking a flight is good, when deciding, and when something breaks. Those moments matter most, and the agent earns trust by calming the fear, not just doing the task.",
        "For each habit, the agent gently nudges you toward the better choice (reassure, correct, show a hidden-better option, decide for you, or head off a mistake) rather than lecturing you with a statistic.",
        "Every stage is written as the real job the traveller is trying to do (for example, checking a flight is 'which one is good, which one is a trap'), so we own a job, not just a feature."
      ],
      "requirements": [
        "Map every Away feature to its stage in the 12-step trip, so it is clear where we have gaps and where we have already designed something (finding, checking, and deciding already have search work done).",
        "Turn the hard rules into live, re-checkable facts: visas (passport valid at least 6 months past your return), the free-cancellation window (48 hours on direct flights, if booked 7+ days ahead for domestic or 15+ for international), the tax tiers (5% in economy, 18% in business and premium since September 2025), the duty-free limit (₹75,000, raised in February 2026), and roughly 38.5% all-in duty on anything over the allowance.",
        "Turn the mental traps into gentle agent nudges: bust the 'book in incognito' and 'Tuesday is cheapest' myths, warn that a self-transfer has no airline or regulator protection, point out that Gulf one-stops (usually skipped) are often the comfiest and cheapest, and compare the true all-in cost against a budget airline's headline fare.",
        "Spot and fix the traps tied to each stage: waiting then panic-booking (when checking), who actually owns the refund (when deciding), setting up an eSIM before you fly instead of scrambling on arrival (when preparing), and treating a layover as dead time (when arriving).",
        "Surface the protections people leave on the table: denied-boarding cash up to ₹20,000, meals and a hotel you are owed even in fog or other force-majeure, baggage limits (₹450 per kg domestic, about ₹1.72 lakh international), and filing a lost-baggage report before you leave the airport.",
        "Give a clear 'book now or wait' call on fares, quietly rebook you at the new fare when the schedule changes, and watch your booking for changes the airlines and booking sites never email you about.",
        "Every rule and number carries a 're-check' flag, because aviation, tax, customs, and visa rules change often; these were last checked around June 2026."
      ],
      "keySurfaces": [
        "The 12-stage job map, our single source of truth for the whole problem.",
        "A one-line 'real job' for each stage (finding = 'show me the options worth my time, no effort'; watching = 'nothing better or worse slips by before I fly').",
        "A 'when it breaks' rescue lane that runs across watching, travelling, and returning ('when it breaks, get rescued, not blamed').",
        "Three layers on each stage: the hard rules, the human habits, and what Away's agent does about them.",
        "A row marking checking, deciding, and disruption as the moments where help matters most."
      ],
      "moat": [
        "A deep research process (research, then curate, then a strict fact-check) that produced web-verified, India-specific facts, and caught real errors competitors keep repeating (duty-free is ₹75k, not ₹50k; over-allowance duty is about 38.5%, not a flat 10%).",
        "Insight at two depths, the hard rules AND the quiet human habits mined from Reddit, X, FlyerTalk and Quora, which is hard to copy and gets richer with every trip.",
        "Owning the whole 12-stage trip (not just search and booking) means the agent builds up context and trust that generic booking sites and chatbots can't.",
        "Knowing both the rules and the habits, specifically for India, is a local advantage that foreign-built travel agents don't have."
      ],
      "v1": [
        "Build the product around the verified 12-stage trip map as the source of truth.",
        "Ship the high-anxiety stages first, finding, checking, and deciding, where the search work is already designed (the international search box, the trade-off strips, and the ruled-out-traps summary).",
        "Fix the biggest mental traps when people check and decide: the incognito myth, waiting then panic-booking, self-transfers being unprotected, who owns the refund, and true all-in cost vs a budget airline's headline.",
        "Show the key rule corrections right at the moment of decision (free-cancellation window, tax tier, duty-free limit, visa validity)."
      ],
      "v2": [
        "Cover booking, watching, and preparing too: the currency-conversion markup (about 4-7% extra), adding your tax details before booking, setting up an eSIM early, a smart 'leave by' time, and auto check-in for the best free seat.",
        "Turn on watching: quietly rebook to a credit when the schedule changes, monitor the booking for changes, and give 'book now or wait' fare calls.",
        "Stand up the rescue lane: rebook in the app first, claim the meals, hotel, or cash you are owed, file the lost-baggage report before you leave the hall, and pre-fill card and insurance delay claims."
      ],
      "northStar": [
        "Own the whole trip end to end across all 12 stages, plus always-on rescue, the agent that finds, checks, books, watches, rescues, and remembers, so the traveller never has to.",
        "Close the loop at the end: track and use travel credits before they expire (within 365 days), reclaim missing miles, keep the proof every later claim needs, and re-check habitual rebookings for better value.",
        "Become the trusted default that heads off every rule trap and habit mistake before the traveller can make it."
      ],
      "metrics": [
        "How many of the 12 trip stages Away actively helps with, vs leaves as gaps.",
        "How often we calm the anxiety at the three hardest moments (checking, deciding, and when something breaks).",
        "Money saved or recovered per trip (avoided currency markup of about 4-7%, denied-boarding cash up to ₹20k, baggage and delay protections claimed, travel credits used before they expire).",
        "How often the agent flips a misleading habit (incognito, self-transfer, budget-airline headline, panic-booking) to the better choice."
      ],
      "openQuestions": [
        "How to keep the live rules continuously re-checked as aviation, tax, customs, and visa rules change (numbers only checked around June 2026).",
        "How hard the agent should push to correct a traveller vs holding back, tuning the 'nudge gently, don't lecture' line.",
        "Which stages to make sticky and build shared working spaces for, vs keep fully automated.",
        "Whether to spell out the automated-vs-co-piloted split for each stage before locking the build."
      ],
      "risks": [
        "Rules go stale fast; a wrong number (the review already caught ₹50k vs ₹75k, and flat-10% vs 38.5%) would break trust at the exact moment the agent claims to know best.",
        "The habit patterns are directionally true from what people say online, not statistically proven; over-claiming could backfire if the agent sounds confidently wrong.",
        "Owning all 12 stages is a wide surface; under-serving some leaves visible gaps that undercut the 'owns the whole trip' promise.",
        "India's rules are genuinely complex (self-transfers, currency markup, tax details, green and red customs channels, gold limits); covering them only partly could mislead more than help."
      ],
      "sources": [
        "Claude/JTBD & Travel Research/2026-06-25_travel-jtbd-insights-deepsearch.md",
        "Claude/JTBD & Travel Research/2026-06-25_travel-jtbd-semantic-nuance-layer.md",
        "Claude/JTBD & Travel Research/2026-06-25_travel-jtbd-figjam.md"
      ]
    },
    {
      "key": "vision",
      "title": "Vision & Principles",
      "oneLiner": "Away is an India-first AI travel agent you keep, the friend who just got back from that exact trip. It finds, checks, books, watches, and rescues your whole trip, winning for you against an industry built on confusion.",
      "lockedDecisions": [
        "Away is 'the friend who just got back from that exact trip', not a search engine, a virtual assistant, or a chatbot dressed up as a travel agent.",
        "One personality, pointed two ways: warm and wise toward you, dry and sharp toward the industry. Same insider knowledge, aimed differently.",
        "The enemy is the system (booking sites, airlines, the cheapest-not-right algorithm, dark patterns), never the user. Warmth always goes to the traveller; the sharp edge only ever goes at the industry.",
        "The dial: one personality that knows when to turn itself down. It runs free where Away wins for you (search, the verdict, warnings, getting you compensation), softens where you are exposed (the first 30 seconds, money, errors), and goes all-warmth in a real crisis.",
        "The co-pilot rule (the big one): the agent never takes the wheel. No auto-booking, no rebooking without you confirming. It prepares, recommends, and hands off; you always make the final call.",
        "Do what the best human travel agent on the phone would do, then go further (a 90-day price watch, a passport check, a compensation claim). Help to the max, never take control.",
        "Negotiation is the one skill that runs through everything: the muscle that beats the fare is the same one that rescues you when the trip breaks. Onboarding plants it; the rescue pays it off.",
        "Charm and clarity never share a sentence. Personality lives in greetings, waits, and wins; buttons, errors, and anything about money stay plain and calm.",
        "Two kinds of crisis, designed differently: the app failing you vs the trip failing you. How loud the agent gets scales with how bad it is and how much time you have.",
        "The whole agent (search, checking, watching, rescue) is free; only booking needs an invite, shown as a generous partial reveal (3 real fares shown, the rest locked, a 'private club' feel).",
        "Our north-star reference is Airbnb's 2026 summer release: the same 'a wrapper becomes the whole thing' idea at company scale (booking a stay becomes owning the whole trip). Great design is what makes the integration work.",
        "Voice principles: be specific (specifics read as intelligence); lead with the verdict, not the process; protect, don't sell ('skip it' beats 'book now'); confidence through restraint; lowercase and casual in the app, proper capitalisation in marketing."
      ],
      "requirements": [
        "Every line the agent says has to pass one test: 'would you text this to a friend?' If it sounds like a brand or a helpful robot, rewrite it.",
        "Set the voice per moment: gentle on onboarding, a flash of edge on results, more forward on the why-Away pitch, all warmth in a disruption, and a flash of edge on the compensation win.",
        "Hard don'ts, everywhere: no exclamation marks, no hype ('amazing deals'), no fake urgency or '1 seat left', never blame the user, never mix charm into a money or error message.",
        "Numbers over adjectives: always the figure ('94% on-time', '₹4,200 under the public fare'), never the vague claim ('great record').",
        "Verdict first: give the conclusion, then show the work if asked. '8 flights. 3 are actually good.' not 'I searched 8 flights and compared...'.",
        "Make 'protect, don't sell' visible: the warning (say, '1 in 4 people miss this connection') is the single most trust-building moment, the agent spending its own credibility to talk you out of a cheaper option.",
        "In marketing, show the gap, not the feature: 'The fares they don't show you' beats 'We search 250+ suppliers'.",
        "Treat new ideas as a lens on every stage, not a bolt-on feature list. Each stage carries its own new idea, summed up once in a single 'what we changed, and why it's new' highlight.",
        "Every new move has to pass the co-pilot test: does it prepare and hand off, or quietly take the wheel? (For example, it drafts the rebooking or claim; you tap to send it.)",
        "Colour carries meaning, not decoration: a dark, premium theme with one accent per thing (indigo = the agent and a win, green = done and protected, amber = a trap, red = the real problem).",
        "A notification that says 'nothing happened' is banned. Silence, plus a living diary you can pull up, carries presence between real events.",
        "The rights engine (passenger rights encoded country by country) is the clearest 'better than a human on the phone' move, and must run as a proactive, visible 'you're owed X' superpower."
      ],
      "keySurfaces": [
        "Onboarding's four-part pitch: the shift (stop searching, start negotiating), the enemy (the fares the screens won't show), the promise (one total, quoted once), and the agent (we hunt, watch, negotiate, and rebook; you travel).",
        "The adaptive home, one screen that changes with how well Away knows you (new to you: convince first; getting to know you: a blend; regular: input-first, with your trips and a 90-day watch).",
        "The verdict and the flight list, the co-pilot rule made real: the agent checks, sorts, and flags; you scroll and pick. A verdict line up top, traps flagged inline with the reason.",
        "The trap warning, the highest-trust moment, for example 'the ₹28k Qatar one? skip it. 30 hours and a visa trap.'",
        "The deep-search wait, an honest timeline that shows the negotiation happening and justifies the price (truthful about the kind of work being done).",
        "The rescue screen, calm and all-warmth, the fix already prepared, handed off by a deep link, a desk, or a drafted message (the co-pilot rule under maximum pressure).",
        "The 'claim what you're owed' moment after the trip, a proactive rights claim, a flash of edge aimed at the airline.",
        "The booking and money screen, fully calm, never reads a slow payment gateway as a failure, and the agent never taps Book for you."
      ],
      "moat": [
        "Voice is the one advantage that ships in every single interaction. Every AI product has similar models; the 'friend who just got back' voice is what sets Away apart in every sentence.",
        "The warm-and-sharp mix (same insider knowledge, two directions; the enemy is the system, not the user) is a stance incumbents structurally can't copy, because their incentive is to sell, not protect.",
        "'Protect, don't sell' flips the booking-site incentive: the most brand-building thing you can do is talk someone out of a bad flight, which no booking site will.",
        "The passenger-rights engine that powers a proactive 'you're owed X' claim, almost no booking site does this; the clearest 'better than a human on the phone' capability.",
        "Knowing where you are in the trip is the integration advantage: owning find, check, book, watch, rescue, and remember makes helpful services land at the right moment instead of feeling like spam.",
        "'How flights are really sold', an edge-forward marketing angle that exposes the industry's tricks; the one territory only Away can credibly own."
      ],
      "v1": [
        "Lock and ship the full voice system, the identity, the dial, the house rule, the do's and don'ts, and a copy bank by moment, as the single reference for all agent and marketing copy.",
        "Enforce the co-pilot rule on every screen we ship: no auto-booking, prepare-and-hand-off everywhere, including watch and rescue.",
        "Ship freemium plus the invite gate as a generous partial reveal (3 real fares, the fare held, a 'private club' feel).",
        "Apply the 'new idea as a lens' approach to the v1 stages, and produce the single 'what we changed, and why it's new' highlight for the case study.",
        "Ground the rights-engine voice (force-majeure care and refund, drafting the EU delay claim) in the shipped disruption and post-trip copy.",
        "Track trust signals: the bet is that people decide in 2-3 exchanges, so calibrate against real user language after the first ~1,000 conversations."
      ],
      "v2": [
        "Deepen the new moves into the stages they belong in: ask-about-this-flight, the honest total, act-in-place, and services-at-the-moment, woven in, not tacked on.",
        "Build the honest-total comparison on your own terms (baggage, on-time, real total cost), pin-and-compare, the opposite of drip pricing.",
        "Make the group and multi-ticket trip coordinated and social, so the messiest booking becomes Away's home turf.",
        "Extend the rights engine to more verified countries (Canada, Brazil, Australia, and the Gulf, care-only) with live currency conversion, never over-promising cash where none is owed.",
        "Tune the persona model (Planner, Vanguard) and the per-persona voice flex once available; resolve the 'ask the name twice' and error-state open items."
      ],
      "northStar": [
        "Own the whole trip, find, check, book, watch, rescue, remember, an agent you keep, not a search box you use once.",
        "'A wrapper becomes the whole thing' at company scale: book-a-flight becomes own-the-whole-journey, proven at the biggest scale by Airbnb's 2026 release.",
        "Negotiation as the skill that runs through everything: the same muscle that beats the fare rescues the broken trip, end to end.",
        "A running 'what you're owed' superpower in every country, the agent that always has your back against the industry.",
        "Helpful services arriving at exactly the right moment because the agent knows where you are in the trip."
      ],
      "metrics": [
        "Trust speed: people decide whether to trust an AI product in the first 2-3 exchanges, and the voice either speeds that up or kills it (the core brand bet).",
        "Secondary signals to track: use beyond just booking, a 'caught before it hurt' signal, and coming back.",
        "Airbnb benchmark: in-thread agent support resolves 40%+ instantly, and Away's co-pilot version aims for one-tap resolution.",
        "How to measure 'I feel seen and heard' is still an open slot."
      ],
      "openQuestions": [
        "Square 'the whole agent is free' with the locked 3-fare teaser so the two never contradict each other in copy.",
        "Decide how to measure 'I feel seen and heard'.",
        "Confirm the personas beyond Planner and Vanguard (any third one is yours to supply; a made-up 'Visionary' persona was already removed).",
        "Confirm exactly which phone and OTP error states ship, and settle the 'ask the name twice' question (from the sign-in profile plus a separate 'is this right?').",
        "Pressure-test every new move against the co-pilot rule before it ships, prepare and hand off, never quietly take the wheel.",
        "Recalibrate the voice against real user language after the first ~1,000 conversations (the framework is flagged for a revisit)."
      ],
      "risks": [
        "The honesty risk in the deep-search wait: a dramatic narration builds trust but is fragile, and the moment the copy drifts from the real work being done, it stops being worth it and can break trust in the core product.",
        "A bait-and-switch risk at the handoff: marketing recruits with the loud, defiant promise, but the product they keep is the warm concierge, so the first 30 seconds have to soften the edge or it reads like a switch.",
        "In a conversation-first app, the voice is the product: one badly-worded recommendation breaks trust in the core product, not just the brand feel.",
        "Over-promising rights or cash where none exists (say, for Australian or Gulf-carrier passengers) would destroy the 'protect, don't sell' trust the whole brand rests on.",
        "Mixing charm into a money or error message (breaking the house rule) instantly undermines credibility, 'an agent that cracks a joke while your payment is confirming hasn't earned the joke.'"
      ],
      "sources": [
        "Claude/Agent/2026-06-20_away-agent-design-spec.md",
        "Claude/Agent/2026-06-20_innovation-layer.md",
        "Claude/Away_Tonality_Framework.md",
        "Claude/Brand & Marketing/2026-06-06_brand-marketing-framework.md"
      ]
    },
    {
      "key": "users",
      "title": "Users, Personas & Jobs",
      "oneLiner": "Away serves Indian travellers by meeting them three different ways at app-open, and by reading each person's priorities across about 20 flight details rather than sorting them into fixed types. It owns the whole trip, find, check, book, watch, rescue, remember, with a search box and a voice that adapt to how well it knows you.",
      "lockedDecisions": [
        "At app-open we have exactly one signal: your location. No name, trip, points, or history. The first 90 seconds is all about working out what you actually want.",
        "That intent shows up three ways: you type a route (clear intent), you forward a booking (the clearest), or you say 'surprise me' (the vaguest).",
        "So the pre-sign-in home has three doors: a text search, a forward-your-booking email (trips@yourname.away.com), and a 'surprise me' demo.",
        "The goal is to move the vague 'surprise me' people toward clear intent, a 'now I know what I want' moment.",
        "We read each person as a set of preferences across about 20 flight details, not a fixed type, so one engine can build a search box that feels hand-made for everyone.",
        "Seven example personas locked as test cases: Price Hunter, Comfort seeker, Time-Boxed Pro, Family Coordinator, Loyalty Optimizer, Flexible Explorer, Anxious First-Timer.",
        "How well we know you shapes the home: someone new sees proof and reassurance over a search box; someone we are getting to know sees a search box seeded by what they looked at; a regular sees their trips and watches, search-first.",
        "The whole agent (search, checking, watching, rescue) is free; only booking needs an invite, and we never turn someone away without a code.",
        "The voice: edge where Away wins for you, plain and calm where you are exposed (the first 30 seconds, money, errors), all warmth in a real crisis.",
        "50 free credits on signup, no card needed; when you run out, the recommendation is honest (it will tell a light user to stay on the free plan).",
        "If you forward a held or booked ticket, it goes to rescue and watch, not a fresh search.",
        "v1 ships the typed-search and forwarded-booking doors; the 'surprise me' door ships only if typed-search conversion turns out weak."
      ],
      "requirements": [
        "From your location alone, work out currency, language, which countries your passport enters without a visa, the regional airlines, your nearest big airports and how long they take to reach, the season and holiday windows, and whether you are home or away.",
        "Lightly tell business from leisure by checking whether the internet connection looks like a home, an office, or a VPN.",
        "Show real fares out of your own airport, not generic examples, and run a quiet ticker of live agent activity in your region.",
        "Before the sign-in wall, run a free taste (about three credits of real work) for each door, capped at one per device per day to prevent abuse.",
        "Rank options by weighing three things: how sure we are of what you want, your leaning, and how much a detail actually varies (a detail that never changes gets dropped). Starting mix: intent 40 percent, leaning 35, variation 25.",
        "The search box has a fixed core (a plain-English line and an editable ticket that never move) plus one adaptive highlight that swaps per person; at most one highlight and four visible chips.",
        "Work out all roughly 20 flight details and show them as an editable ticket; never ask for all 20; only surface the hidden ones when they clash.",
        "Reflect the brief back with an opinion (about the season, conflicting wants, or low confidence) before you launch the search; the ticket stays editable throughout.",
        "Let people give their intent by typing, speaking, or pasting a screenshot of a fare, and read the route, fare, and dates back to confirm.",
        "If we cannot tell where you are flying from (a VPN or a shared device), that is the one thing worth asking; impossible dates get a calm nudge to the nearest workable ones.",
        "Offer to keep watching right after the receipt (about 50 credits over 90 days); if yes, it goes to quiet monitoring; if not yet, it goes to a gentle come-back loop.",
        "Adapt the words per person: the Anxious First-Timer gets reassurance, few knobs, and one clear button, not a wall of dials."
      ],
      "keySurfaces": [
        "The pre-sign-in home (three doors: text search, forward-your-booking, surprise-me), tuned to your location, with a time-aware greeting and the live activity ticker.",
        "The adaptive home, weighted by how well we know you (new to you / getting to know you / regular).",
        "The self-composing search box (a plain-English line, an editable ticket, a swappable highlight, and chips).",
        "The clarifying card: the box reshapes in place to ask for the one missing thing that matters, one question at a time.",
        "The onboarding flow: splash, an 'activating your concierge' loader, the four-part pitch, phone and one-time code, your name, a welcome, and the invite gate.",
        "The receipt reveal after sign-in, with a 'how I got there' expander that shows the work.",
        "The offer to keep watching, and the quiet-monitoring and come-back diary.",
        "The year-end recap and referral screen (a ledger of credits spent, money saved, hours saved)."
      ],
      "moat": [
        "Advice that knows your situation: anyone can ping you about a fare drop, but only an agent that knows the route's seasons has earned the right to say hold or lock.",
        "Honesty as the wedge: an honest plan recommendation, an honest 'you weren't overpaying', an honest 'nothing happened' diary, which is what earns a power traveller's trust.",
        "A search box that genuinely reshapes per person (which controls, how prominent, what form) across seven personas from one engine, each feeling hand-made.",
        "Power travellers cluster in dense communities (FlyerTalk, r/awardtravel, One Mile at a Time): one happy user is worth about three to five referrals over a year if the recap is honest.",
        "Owning the after-booking jobs (rebook on a fare drop, handle a schedule change, watch the seat, claim EU and US delay rights) that only an agent holding your booking can offer."
      ],
      "v1": [
        "Cold start from location only, with sensible local defaults and fares out of your own airport.",
        "The typed-search and forwarded-booking doors with their free pre-sign-in taste; the surprise-me door held back.",
        "The onboarding flow through phone, one-time code, name, and the invite gate; the freemium reveal (whole agent free, booking invite-only).",
        "The self-composing search box with its fixed core and one swapping highlight; the reflect-back brief with one opinion.",
        "All 7 personas runnable through the ranking engine as test cases.",
        "The clarifying card for the one missing thing that matters; handling for when we don't know where you're flying from.",
        "The offer to keep watching, plus the quiet loop (Day 1, 7, 14, 30) and the come-back branch.",
        "50 free credits, no card; an honest plan recommendation when they run out."
      ],
      "v2": [
        "The surprise-me door as a regional demo, shipped if typed-search conversion turns out weak.",
        "Paste-a-screenshot intent input, read back to confirm.",
        "Lock the ranking mix with real behaviour data (replace the 40 / 35 / 25 starting point).",
        "Higher-fidelity highlight prototypes (a price-by-date view, a per-passenger panel) and the decision on how the highlight swaps.",
        "After-booking jobs surfaced per person (rebook on a fare drop, schedule change, seat watcher, EU and US delay rights).",
        "Come-back and win-back digests for idle users and expired watches."
      ],
      "northStar": [
        "The agent that owns the whole trip for every kind of Indian traveller, from anxious first-timer to seasoned power user, adapting its screen and its voice to exactly how well it knows you.",
        "A self-composing search box that feels hand-made for each of millions of different travellers, from one engine.",
        "Permanent travel infrastructure: power users with three or more active watches, a running savings ledger, and a yearly recap that drives referrals.",
        "Turning vague 'I want to fly somewhere eventually' into booked, watched, rescued trips, at scale."
      ],
      "metrics": [
        "Receipt-to-watch conversion, the number the whole funnel rests on (target: typed 40 to 55 percent, forwarded 60 to 75, surprise-me 15 to 25).",
        "Which door people use, how fast they make their first tap, and how many leave the pre-sign-in home without doing anything.",
        "Day-30 retention per door (typed about 50 percent, forwarded about 65, surprise-me about 25) and, on active watches, Day-7 at 70 percent or more and Day-30 at 45 or more.",
        "How often an alert leads to action (60 percent or more lock-or-hold); lots of dismissals are the warning sign; and whether the advice was right (was 'hold' correct?).",
        "How many people upgrade to paid when their free credits run out (35 percent or more); and how often after-booking jobs get used (30 percent or more of bookings).",
        "Funnel survival: about 10 of every 1,000 App Store views reach paid; the two biggest leaks are home-to-tap and receipt-to-watch.",
        "The persona test: run all 7 personas and each should get a search box that feels hand-made from one engine."
      ],
      "openQuestions": [
        "Lock the ranking mix (40 / 35 / 25) with real behaviour data; it is a starting point for now.",
        "Does the box visibly reshape when the highlight swaps, or settle before it reveals?",
        "Is the surprise-me door worth building, or just noise next to typed and forwarded?",
        "Sign-in wall before the receipt (the biggest conversion lift if the result is good) or after (less friction)? Leaning towards before.",
        "The free-taste cap: one per device per day, or higher, given it costs about three credits (about three US cents).",
        "Referral reward size: 200 credits (about three weeks free for a heavy traveller) or up to 500 if acquisition needs a push.",
        "Ticket the flight directly (through airline systems, about six months of lead time) or hand off to an affiliate, which changes how the last stage works and the lifetime-value maths."
      ],
      "risks": [
        "The free taste coming back no better than Google Flights, the agent isn't yet clearly better; fix that before spending on acquisition.",
        "Lots of people turning on watches but few sticking around at Day 30, the watch isn't delivering or the alerts are poor.",
        "Alerts leading to action less than 30 percent of the time, the advice is wrong or people don't trust it; that is the core advantage failing.",
        "Cold start gives us location but NOT intent, the whole funnel hinges on drawing out intent in 90 seconds.",
        "The surprise-me door has the lowest intent, retention (about 25 percent), and value, a risk of building noise.",
        "The self-composing box becoming chaotic instead of adaptive if the rules (fixed core, one dial per screen, always reversible) slip.",
        "Most people only ever run a deep search, so the specialist persona tools never show up (the 'get them to a second tool' step fails)."
      ],
      "sources": [
        "Claude/Generative UI/2026-06-25_generative-input-spec.md",
        "Claude/Journeys/2026-06-25_away-journey-copy-spec.md",
        "Claude/Onboarding/2026-05-11_user-funnel-journey.md"
      ]
    },
    {
      "key": "onboard-home",
      "title": "Onboard + Home/Intent",
      "oneLiner": "The front of the funnel: a short cinematic intro, an invite-only free trial, and a home that remembers you, where three doors (ask in plain words, fill a form, or forward a booking) drop you straight into an agent that does the actual work. Every first session ends by offering to watch your trip for 90 days, which is what brings people back.",
      "lockedDecisions": [
        "The onboarding backbone is one magic moment: tell it your next trip, get a receipt, then get offered a watch on it. The search, not the intro screens, is the first thing that really matters.",
        "Five intro screens before sign-in: the Away wordmark and tagline, an 'activating your concierge' loader (1.5 to 4 seconds), your name (the one thing we ask up front), a personal 'Welcome to Away, {Name}', and three promises.",
        "The three promises stay three: best prices always, help mid-trip, no convenience fee. Do not add a fourth.",
        "We call the agent a 'concierge', never an 'AI' or a 'bot', premium-service framing that fits paying for work done.",
        "Away is invite-only; people without an invite still get a real trial, they can run the whole thing through to results, they just cannot book yet.",
        "The gate appears when you tap Book: 'you need an invite to book a flight', then either enter a code or refer a friend on WhatsApp, and you are in once your friend signs up.",
        "The gate is the natural last step of the live results feed (no jarring jump to a new screen), it keeps the deal you found visible on a 'held pass' card, and the referral prompt uses the app's dry, conspiratorial voice.",
        "The home has three doors into one engine: Ask (plain words, the default, least effort), Search (a structured form like other booking sites), and Upload (paste a rival's price or forward a booking).",
        "All three doors feed the same ranking on four things: price, time, flexibility, and comfort.",
        "We took the referral block off the home screen (the single biggest layout win), referrals now live in their own tab instead of competing with the main search.",
        "Always show the cost before doing the work, the single most important rule, set on the very first job: a quick search (about 3 credits) or a deep search (about 5 to 8), agreed in two taps.",
        "The voice is dry and conspiratorial ('we', 'hunt' rather than 'negotiate'), but it has to soften at payment, errors, legal small print, and the first 30 seconds for a brand-new user.",
        "The chat-search flow: read everything you said at once, show one editable ticket, ask at most one question (dates only, via the date-and-price strip), show a working receipt, then ranked results with insight chips. Never ask again for something you already told it.",
        "The free plan is 50 credits a month; one credit is about ten cents of agent work; we do not ask for a card until the first paid top-up."
      ],
      "requirements": [
        "The free first taste: the home takes a query and runs a demo search (from cached data), capped at one freebie per device per day, then holds the result behind sign-in ('that took about 3 credits of agent work, sign in to see it and claim 50 free credits').",
        "Sign-in is one screen (Apple, Google, or email) with a single line: '50 free credits on signup, about $5 of agent work, no card needed'.",
        "Reuse the name from the Apple or Google account and just ask 'is this right? edit it', rather than asking for the name twice.",
        "A fast path for returning users: skip the splash and loader on a warm launch, and skip the name and welcome screens when we already know them (still deciding the roughly 30-day inactivity cut-off).",
        "The empty state shows two doors: 'tell me your next trip' (for example, San Francisco to Tokyo, September, business class on miles) or 'forward us a booking' (your own address, e.g. trips@agam.away.com). No tutorial overlay; the four chips (price, time, flexibility, comfort) light up as you type.",
        "The home prompt greets you by name and sets the intent ('where are we going, Agam?'); a switcher offers Ask, Search, or Upload, defaulting to Ask; the input changes shape per mode, and the button verb matches.",
        "One editable ticket card (from, to, dates, travellers, class, and what to optimise for) replaces being asked one thing at a time; you edit it through in-chat sheets (airport search with recents and a swap, traveller steppers, a class row).",
        "Sensible defaults: from is your home airport (never asked), to is always yours to set, dates are asked only if vague (via the strip), class is economy or learned (never asked), travellers is one or learned (never asked); learned defaults are pre-filled but labelled 'from your last trip' the first time.",
        "Read signals from the words: 'we' means two or more travellers, 'business' or 'anniversary' means lean towards comfort, a city like Goa means search both its airports, infer, do not ask.",
        "The date-and-price strip has two modes: Picker (a 14-day strip with estimated prices that verify live when tapped, which also tells us you are flexible) and Insight (how much you would save versus your chosen date, shown only if it is worth more than about 8 percent or Rs.1,500); the strip shows per-person prices, the savings shown as totals.",
        "For round trips, slide a window (trip length read or asked once: 3 to 4 days, 5 to 7, a week or more, or exact; one strip shows the whole-trip total per departure day); the outbound strip shows the lowest full-trip total 'from Rs.X', never a misleading half-price.",
        "A working receipt shows the paid effort as it happens ('checking 14 airlines, 9 date pairs'), tied to the credits you are spending.",
        "The receipt is a bottom sheet, not a new screen: credits spent, the money value, how much it beat Google by, and a collapsible 'how I got there' (routes checked, miles options tried, and the clever tricks it verified).",
        "The watch offer is in the same sheet, right after the receipt: 'keep watching until you book? about 50 credits over 90 days, paused until you say go', then Yes, watch it, or Not yet.",
        "The free-trial welcome should shrink the invite code to a quiet 'have a code?' pill and put search and upload in easy thumb reach; it needs a no-name version for brand-new users (no 'welcome, Sukesh' before we have asked their name).",
        "A clear 'locked' look for the trial: a key icon on cards, plus a finished-results screen (three fares, outcome chips, and tabs for best price, cheap cancellation, and baggage).",
        "The gate screen keeps the deal you found visible (the held-pass card) and leads with referral over entering a code; design the 'waiting on your friend' state too.",
        "The invited-friend flow ('you were invited by Agam, enter your name', then 'you're in') must not dead-end, start them with a first search and give them visible invites of their own.",
        "The deals section: a one-line explainer, two or three ready-made routes that lead with the savings (with the usual price for context), and a 'start hunting' button.",
        "A gentle rhythm on days 1, 7, and 30: quiet notifications for events, email for detail, and an honest 'nothing changed' when that is the truth.",
        "Honesty about held fares: only use urgency or 'we're holding this' language if the fare is genuinely held (and confirm for how long)."
      ],
      "keySurfaces": [
        "The five intro screens (splash, concierge-activating loader, name, personal welcome, three promises)",
        "The cinematic pre-sign-in home and its free first taste",
        "The sign-in screen (Apple, Google, or email, with the free-credits line)",
        "The home hero that remembers you, with the three-door switcher (Ask, Search, Upload)",
        "The empty state with its two prompts (type a trip, or forward a booking)",
        "The chat-search flow: capture the intent, show an editable ticket, the date-and-price strip, a working receipt, then results with insight chips",
        "The date-and-price strip (14-day Picker mode and savings Insight mode)",
        "The receipt bottom sheet with its collapsible 'how I got there'",
        "The watch-offer sheet and the quiet 'watching' badge on the recents card",
        "The free-trial welcome (with its no-name version), the finished-results screen, and the fare-family screens",
        "The end gate (the results feed flowing into a locked step, with the held-pass card and a WhatsApp referral)",
        "The invited-friend screens ('you were invited by...', then 'you're in')",
        "The deals block (ready-made routes led by savings)",
        "The forward-a-booking flow (your own inbound email address, plus three free check-ups)"
      ],
      "moat": [
        "Invite-only scarcity plus refer-to-unlock turns the paywall into a growth loop (a cheeky 'smuggle a friend in' framing).",
        "An upside-down funnel: let people taste real agent work before the sign-in or booking wall, which sets it apart from the demo apps power users have learned to distrust.",
        "Openness as the advantage: the live results feed and the 'how I got there' receipt prove the agent actually worked, competitors sell search, Away sells work done.",
        "Reading everything at once plus a single editable ticket avoids the one-question-at-a-time interrogation that every chat booking site falls into.",
        "The watch offer turns the first magic moment into a 90-day reason to stay, keeping the agent in your life until you pay.",
        "A split-flap board look (the old railway departure boards) for 'hunting', instantly travel, familiar in India, and it scales from an icon to a marketing motif."
      ],
      "v1": [
        "The five intro screens (splash, activating concierge, name, welcome, three promises), in light and dark.",
        "The brand-new-user home with three doors (Ask, Search, Upload), search as the clear main action.",
        "Sign-in with the 50-free-credits framing; name reused from the Apple or Google account.",
        "The chat-search flow: read the intent, show an editable ticket, ask at most about dates via the strip, a working receipt, then ranked results.",
        "The date-and-price Picker mode (14-day strip, estimates, live verify) plus the sliding-window round trip.",
        "The receipt bottom sheet with its collapsible 'how', and asking before spending.",
        "The watch-offer sheet and the watching badge.",
        "The invite-gated trial: the full flow to results, the gate on the Book tap (a code or a WhatsApp referral), and the no-name version.",
        "The finished-results and fare-family screens, with the locked 'key' look.",
        "The invited-friend screens that start them on a first search (no dead-ends).",
        "Forward-a-booking through the second door if the email side is ready (otherwise ship the first door only)."
      ],
      "v2": [
        "The date-and-price Insight mode (how much you would save versus your date) and trip-length insight.",
        "Home versions for every state (a trip coming up, an active watch, gone quiet, brand new) so the home serves returning and active users, not just new ones.",
        "A tab-preview row on the home (history, bookings, wallet) for a fuller home screen.",
        "The returning-user fast path that skips the name and respects an inactivity cut-off.",
        "A one-leg-at-a-time round-trip fallback for when each leg has its own constraints.",
        "The deals block backed by live savings data.",
        "The 'waiting on your friend' state, plus an invite quota that quietly tapers (five down to two).",
        "The days 1, 7, and 30 rhythm (quiet notifications plus email for detail)."
      ],
      "northStar": [
        "A home that reads your state and offers the next best move (active watches, an upcoming trip, a gentle nudge if you have gone quiet) before you type anything.",
        "An agent that can say hold or lock using its own built-up sense of a route's seasons (needs at least six months of history), the advice next to the alert is the deeper advantage.",
        "Defaults that learn (travellers, class, what you optimise for, your household) so the ticket is right the first time, with almost nothing re-asked.",
        "A whole family of trade-off strips (price by date, price by airport, price by time of day) as a reusable building block.",
        "Onboarding driven by a savings ledger that proves it pays for itself many times over and picks the right plan for you automatically."
      ],
      "metrics": [
        "How many free tastes turn into sign-ins; each taste costs about 30 cents (roughly 3 credits of computing).",
        "How fast free credits get used: about 20 spent by the end of month one, leaving about 30 in the bank on purpose.",
        "How often people accept the watch at the end of the first session (a one-tap yes to 90 days).",
        "How often the Book gate gets unlocked by referral (invites sent, friends who signed up, access granted).",
        "How many upgrade to paid when their credits run out, ideally right after a real watch win.",
        "How fast the first result arrives and how often we re-ask (the target: never re-ask what you told us, at most one question about dates).",
        "The average person sees their first fare drop about 12 days in; a frequent traveller's plan pays for itself by about day 18."
      ],
      "openQuestions": [
        "How long before a returning user skips the splash (about 30 days?), and whether the three-promises screen earns its place or should be skippable.",
        "Whether the sign-in gate comes before or after the receipt is shown (more friction but more conversion, versus less friction).",
        "Is the found fare genuinely held, and for how long, the gate's honesty depends on it.",
        "Exactly when a referral counts: when the friend installs, signs up, or does a first search (assuming signup for now).",
        "The final word on 'hunt' versus 'negotiate' language, and the final home headline ('what are we hunting today?' or 'where to?').",
        "Where 'watch my trip' belongs in the app, a fourth door or something reached through the three doors.",
        "How to define the savings benchmark: the last 30 days' middle price, the lowest ever seen, or the average booking-site price.",
        "For sliding-window round trips, whether the agent pairs the dates automatically (recommended) or you pick, and where browsing the strip stops being free and verifying starts costing credits.",
        "Where to soft-launch (US only, to avoid EU delay-claim operations, or both)."
      ],
      "risks": [
        "A 'welcome, Sukesh' greeting cannot exist for a brand-new user, without the no-name version it breaks on first impression.",
        "Power-user slang (a 'fuel dump', a 'hidden-city' ticket) puts off curious holiday travellers; the mass-market version may need its own store listing.",
        "Showing a recognisable rival's interface in the Upload card is a legal and brand risk, use a stylised generic fare card instead.",
        "The free taste costs about 3 credits of computing per throwaway install, so cap it at one per device per day.",
        "Too much swagger up front or at payment reads as 'is this legit?', so soften it in the first 30 seconds, at payment, in errors, and in legal copy.",
        "Forward-a-booking (the second door) needs a personal inbound email and parsing; if it is not ready, ship the first door only and follow up.",
        "The hold-or-lock advice needs a sense of the route's seasons the agent may not have yet, so keep the wording cautious until six months of data build up.",
        "The 'you're in' and finished-results screens risk dead-ending if they do not offer a next step.",
        "The current home only really works for brand-new users; without the remembers-you and tab-preview versions, the fuller home is not there yet."
      ],
      "sources": [
        "Claude/Onboarding/2026-05-12_onboarding-intro-flow.md",
        "Claude/Onboarding/2026-05-11_app-store-and-onboarding.md",
        "Claude/Other Features/2026-06-10 - Session - Freemium flow critique + end-gate directions.md",
        "Claude/Homepage/2026-05-15_homepage_information_architecture.md",
        "Claude/Homepage/2026-05-17_homepage_v3_final_audit.md",
        "Claude/Other Features/2026-06-10-agent-chat-search-workflow.md"
      ]
    },
    {
      "key": "search",
      "title": "Search + Deep Search",
      "oneLiner": "One chat-led search where the kind of trip quietly sets the controls, plus a premium Deep Search step that goes back to wholesale flight suppliers to re-negotiate the price and the rules on the flights you have shortlisted. Both are built to remove regret, not just find the cheapest fare.",
      "lockedDecisions": [
        "Search is one system, not two products. Domestic versus international is just a starting hint on a scale from quick-scan to fully personalised, then corrected by what the data actually shows. It feels like the same tool changing gear, never a fork in the road.",
        "What really matters is whether the trip is long-haul and unfamiliar, not whether it is 'international'. The data proves it: Bangalore to the UAE is short, all non-stop, prices close together (it behaves like a domestic trip), while Bangalore to the US is 88 percent two-stop, a 31-hour median, a third of fares with no bag included, and only 14 percent refundable.",
        "What sets Away apart is the safety gate, the honest floor price, and a defended recommendation (the list of traps it ruled out), not the charts. The trade-off strips are just the receipt that shows the work.",
        "Price is evidence, not a filter: no Airbnb-style price slider, instead bar heights across dates. You drag the dates, never a price range.",
        "We rejected a separate international flow in favour of a blend: one flow, one ticket, one voice, one codebase that visibly changes gear. Carry the difference in the pieces on screen, not in separate flows.",
        "Deep Search is not a fresh flight search: it goes back on the one to three flights you have already shortlisted per direction and re-negotiates the price and the rules with wholesale suppliers. You pay credits, and the wait itself is the product.",
        "Your trips are the star of the Deep Search progress screen; the 15-step timeline collapses into a single shape-shifting 'live activity' card plus a row of 15 dots.",
        "Never show a provisional price during the wait (only the real one, once it is final), never show supplier names or ticketing jargon, and never put a number on the 'price is dropping' pulse.",
        "Ship the simple version first: start from the domestic or international label, with one override (a messy mix of stops, or no non-stop option, pushes it towards fully personalised). Log the underlying signals quietly for tuning. The detector must stay invisible, never show a score or a mode name on screen.",
        "Hide it rather than guess it: the verdict layer (calling a price low, typical, or high; buy or wait; the best month; 'visa verified'; the all-in cab-and-bag cost) all needs data we do not have yet, so it stays hidden until the data arrives, because guessing would invent a number people would trust."
      ],
      "requirements": [
        "The search flow (unchanged): capture the intent, show one editable ticket, ask at most one question, show a working receipt, then results with insight chips.",
        "A family of trade-off strips: one component, five versions (price by date, by time of day, by stops, by airport, by trip length), with price always up the side and exactly one thing along the bottom, never two at once.",
        "How the strips read: bar height is the amount (colour just reinforces where it sits in the range); one highlighted bar is your current choice; every other bar shows the difference from it, drawn only if it is worth at least about 8 percent or Rs.1,500, otherwise left silent.",
        "The estimate-versus-verified promise: cached bars are marked 'est.' and slightly faded; tap one and it verifies live and the badge disappears. The floor we show is the floor we can book. Tapping to verify is the only thing that spends credits, browsing is free.",
        "Bars show per-person prices, differences shown as trip totals; round-trip strips show the whole-trip total per departure day, never a misleading half-price (unlike booking sites); the date strip only shows whole-trip totals once the trip length is fixed.",
        "The price-outlook component has three looks: the strip ships now, the calendar grid becomes a drill-down sheet, and the 12-month graph is blocked until we have a feed of each month's floor price.",
        "A one-tap 'tighten' control for power users: a budget cap, a non-stop toggle, and a maximum-duration cap; we cut the automatic 'under Rs.X' chip because it was a filter sneaking in the side door.",
        "The verdict chip ships as a relative call plus a within-search difference ('cheapest in this stretch', '-Rs.3,900 versus your date'); we cut calling a price 'low, typical, or high for this route' and bare confidence percentages until we have price history.",
        "The defended recommendation: it names the pick, then lists the traps it ruled out (fares with no bag, self-transfers or airport swaps, brutal overnight layovers) with the reason each was rejected.",
        "Honesty guardrails on that: no made-up '+Rs.9k at the counter' total, no 'no visa needed' claim (the transit-visa data is unreliable), no 'March's floor was Rs.X', and the full trade-off map stays behind the verdict, never the hero.",
        "A settings table mapping each mode (quick-scan, middle, fully personalised) to its defaults: what to optimise for, which strips to show, how hard to vet (light to a firm gate), how dense the results are, and how confidence is expressed.",
        "The learned brief works in three layers: your baseline preferences always apply silently; how personalised the mode is changes how they are expressed, not whether they apply; and it only confirms something with you when the mode is highly personalised and it would genuinely change the recommendation (never more than three questions).",
        "Behind Deep Search: a background job queries three wholesale suppliers per route at once, with a hard five-minute deadline; a separate process drives the 15-step show, checking every 10 seconds and advancing about every 15.",
        "Live updates come over a private per-user connection carrying progress steps, occasional questions, and the final result; if you drop off, reconnecting refetches the current status and step (progress is capped at 95 percent until it is truly done).",
        "The 15-step timeline has four kinds of step: text (cycling captions), airline (logo pills), route (airport code, plane, airport code), and airport (a city photo with airport-code chips); each step is decorated with the real airlines, routes, and airports from your own choices.",
        "Each trip card moves through states: queued, then negotiating (an amber pulse), then found (a green sparkle, no number yet), then either improved (old price struck through, a savings chip), verified (same price, stated calmly), or no luck (no better rate found).",
        "Any questions appear as dismissable cards in the feed (not pop-ups), about every 30 seconds, capped at three or four; the final reveal is a bottom sheet over your trips, with a headline about the trips ('we saved you Rs.1,727 across 2 flights')."
      ],
      "keySurfaces": [
        "The search ticket, one editable card that captures the intent, with at most one question",
        "The working receipt, a proof-of-work line that grows richer with the trip type ('checked 14 airlines')",
        "The results with insight chips, a ranked list for simple trips, a vetted shortlist plus one defended pick for long-haul",
        "The trade-off strips, 7 to 14 bars at chat width, collapsing to a small inline pill ('Thu -Rs.3,900')",
        "The price-outlook component, in its strip form (shipping), calendar-grid drill-down, and blocked graph",
        "The 'tighten' control (budget cap, non-stop toggle, maximum duration), one tap away",
        "The defended recommendation, the hero output: the call plus the list of traps it ruled out",
        "The Deep Search progress screen: trips as the hero, a single shape-shifting live-activity card, a row of 15 dots, and a smooth progress bar on top",
        "The in-feed question cards during the wait",
        "The final reveal, a bottom sheet that slides up over your trips and names the flights",
        "The four-way results after Deep Search: Cheapest, Best-for-you, Most-flexible, and Fastest, with a 'For You' ribbon"
      ],
      "moat": [
        "The gate, the floor, and the defended pick: real agent behaviours (disqualify a trap, quietly apply what it has learned, defend one choice) that no incumbent ships and that run on data Away already has, the opposite of Google's 'Cheapest' quietly including self-transfers or Kayak's stitched-together 'Hacker Fares'.",
        "The ruled-out-traps list: it does not hide the cheaper options, it names why each is a trap and shows the checking already happened, the single best regret-remover in the set.",
        "'The floor we show is the floor we can book', the estimate-to-verified promise, Away's honesty edge over Hopper's murk and Skyscanner's 'everything looks green' trap.",
        "A preference brief it learns and never asks for (folded into how it ranks flights), which compounds the more you use it, while competitors send you to a settings page.",
        "Re-negotiating with wholesale suppliers on the exact flights you shortlisted, on both price and rules, not a fresh search, which is structurally hard for booking sites to copy.",
        "Vetting grounded in India: 51 percent of Indian travellers avoided an airline over safety in the past year, 28 percent avoided routes, a safety gate the incumbents do not surface."
      ],
      "v1": [
        "The defended recommendation, buildable today from stops, baggage, self-transfers, airline, and layover, and it leads everywhere.",
        "The price-by-stops strip (price plus the hidden time cost, the only strip that fairly shows two things), built straight from the listing data.",
        "The price-by-time-of-day strip, built straight from departure times and fares, showing only the time bands that have flights.",
        "The price-by-airport bars, showing drive time only, with no rupee comparison until we have a city-to-airport transfer feed (otherwise it is the booking-site bait trick).",
        "The estimate-to-verified promise, grounded in real freshness data, enforcing 'the floor we show is the floor we can book'.",
        "The simple mode detector (start from the label, override on messy variance), logged quietly, and kept invisible.",
        "The verdict chip as a relative call plus a within-search difference only; no absolute low, typical, or high, and no bare confidence percentage.",
        "The 'tighten' power-user controls (budget, non-stop, maximum duration); no automatic 'under Rs.X' chip.",
        "The Deep Search progress screen: trips as hero, a single shape-shifting live-activity card, the 15-dot row, a smooth top bar, in-feed question cards (up to three), and the final bottom-sheet reveal.",
        "The Deep Search states covered: the happy path, finishing early (leave the skipped steps as pending), failure or timeout (framed as recovery, no over-apologising), expired (a re-check button), leaving and coming back (restore and reconnect), and one deep search at a time.",
        "The four-way podium with a 'For You' ribbon on results, using the fare breakdown properly and grounded in what it has learned about you.",
        "A savings counter (a running rupee figure from the negotiated fares, not a percentage)."
      ],
      "v2": [
        "The price-by-date strip (wide, 14 days, up to 14 bars), waiting on a feed of the cheapest fare per day (coming soon).",
        "The price-by-trip-length strip, which needs the date fan extended with a return axis (not ready yet).",
        "Ranking that accounts for change and cancel penalties, plus a flexibility floor, waiting on something that can read the fare rules' free text (coming soon).",
        "A tight-connection risk gate, recomputed from the timestamps where the layover length is missing on the riskiest leg (coming soon).",
        "A work ledger (a live feed of the agent's decisions: asked seven suppliers, kept Emirates, skipped Vistara), which needs the backend to emit those decisions.",
        "A view of suppliers working in parallel (five to eight chips lighting up) and a spoken time budget, both needing per-supplier events from the backend.",
        "iOS Live Activity and Dynamic Island, and a persistent Android notification, so the agent keeps working when you leave the app, a big chunk of native work.",
        "A parked-searches tray, a rich 'it's done' notification, and a come-back banner, which turn Deep Search from a one-off flow into something you can leave running, several at once.",
        "A fit score per fare (0 to 100 with a five-bar breakdown) and the ability to refine results by chatting after the fact.",
        "Smoothing on the mode-detector thresholds, plus an override that drops a repeat-route expert back to quick-scan.",
        "Move to the smarter weighted detector (blending price spread, how anchored you are, and how much prices vary) once we have outcome data to set the weights."
      ],
      "northStar": [
        "Search disappears as a thing you do: the agent holds a standing brief (your preferences, calendar, regular routes, and watch lists) and proposes trips before you ask.",
        "The main screen is a single trip proposal ('out Thursday 7pm, four nights, back Monday 11am, about Rs.52k all-in') with a one-paragraph reason grounded in your history; the alternatives are whole trips, not fares, one tap away.",
        "Guarantees as a real product: rebook on a schedule change, refund on reasonable cause, so you are buying the absence of future pain, not a fare.",
        "Silence as a feature: most of the time the main screen is empty, and the agent shows up only when there is something worth saying.",
        "Disagreeing, with reasons: the agent protects the you-who-travels from the you-who-books ('you'll regret the 6am, here is a Rs.600 upgrade that lands before midnight').",
        "A seasonality hero for international trips and a best-trade-offs view (behind the verdict), once the 12-month cheapest-fare and route price-history feeds arrive.",
        "Bundle-aware negotiation: compare the total cost of what you actually want (base fare plus your usual add-ons) against bundled fares, not just base fares."
      ],
      "metrics": [
        "Live (from our analytics, 28 June 2026): 3,424 flight searches and 2,778 deep searches run, with 81 percent of searches reaching a deep search; 2,197 deep searches in the last 30 days, up 278 percent on the 30 days before."
      ],
      "openQuestions": [
        "The credits line: confirm that browsing is free and verifying on tap is what costs credits.",
        "Window pairing: once you pick a window, does the agent pair the outbound and return dates automatically, or do you? (still open).",
        "Whether you can skip or cancel a Deep Search mid-run, there is no way to today and the credits are already spent; also the wording for refunding credits on failure or timeout.",
        "Whether to show a live count during the wait ('2 of 3 ready') or hide it until the end (the prototype hides it).",
        "Adding comfort as a sixth fare category, blocked on a cabin, seat, and meal feed, so deferred.",
        "Light or dark for the Deep Search progress screen (the prototype is light and cream; a darker, more premium feel is possible).",
        "The transition from the final bottom sheet to the results screen, still undefined.",
        "How true the 'better prices' claim really is (inventory versus timing versus all-in honesty), the evidence comes from shipping the verdict and the watch, so do not settle it in copy yet."
      ],
      "risks": [
        "Faking the verdict: calling a price 'low for this route' from a single snapshot is Skyscanner's 'everything looks green' trap; absolute verdicts, buy-or-wait, the best month, 'visa verified', and the all-in cab-and-bag cost all need data we do not have, and guessing would invent a number people trust, so hide them, do not estimate them.",
        "The domestic side is untested (not a single domestic itinerary in any sample), so every domestic claim rests only on how the market is structured; pull a real Delhi-Mumbai listing to check.",
        "We have no India-specific data on how much fares swing, the single biggest research gap and the one most central to the 'graph as evidence' idea; worth paying for a fare-trend source or an academic India dataset.",
        "The mode detector misfires worst on the repeat expert: a consultant flying Bangalore to London monthly gets the slow, fully-personalised flow because price spread and variance dominate and familiarity counts too little (it needs an expert override and some smoothing).",
        "A half-built airport strip (a cheaper-airport bar without the offsetting cab cost) is exactly the booking-site bait trick, so ship drive time only until the transfer feed exists.",
        "Drawing a 14-bar date strip from a single-date search invents the other 13 bars, recreating the exact 'looked cheaper in the calendar than at checkout' trust-killer.",
        "The visa line: the transit-visa data reads zero on hub routings and is unreliable, and claiming a check we cannot actually do is the worst trust violation in the set.",
        "Changing gear mid-flow, out loud, can feel worse than a clean fork would; the seasonality and best-trade-offs views are heavy new components, so sequence them ruthlessly.",
        "Showing the best-trade-offs map by default just swaps 'something cheaper was hiding' for 'I don't understand this graph', so keep it behind the verdict, never as the hero.",
        "The Deep Search price flickering if the best fare changes mid-run, hold the number until the end and pulse with a sparkle or chip only, never a number."
      ],
      "sources": [
        "Claude/Search/2026-06-25_search-domestic-intl-and-price-surfaces.md",
        "Claude/Deep Search/2026-04-23_deep-search-first-principles.md",
        "Claude/Deep Search/2026-04-23_deep-search-constructs.md",
        "Claude/Deep Search/2026-05-09_deep-search-progress-screen-spec.md",
        "Claude/Deep Search/2026-05-09_deep-search-ux-decisions.md"
      ]
    },
    {
      "key": "vet",
      "title": "Vet + Verdict, the intelligence/moat",
      "oneLiner": "The Flight Index: an engine that takes the same fare data every booking site has and turns it into a verdict it can defend, which flights are worth your time, which are traps, and the one the agent would book, earning the right to be believed when it says 'skip it'.",
      "lockedDecisions": [
        "The co-pilot rule: the engine prepares and recommends, but you always make the final call, it never books on its own.",
        "Everything hangs off four things, price, time, flexibility, and comfort, with risk and trust cutting across all of them; every signal, tag, chip, and verdict maps back to these.",
        "The goal is to minimise regret, not just find the cheapest: rank on the real cost once you fold in the odds you will need to change (times the penalty) and any missing bag, not the sticker price.",
        "Silence beats a wrong opinion: the default is to say nothing, and a warning is the highest-trust moment, so it is judged on how often the warning is right.",
        "Specifics are what make it feel intelligent: a number beats an adjective ('94 percent on time', 'Rs.4,200 under the public price'), and no claim ships without a traceable source.",
        "The overall score exists only on the server, as a way to rank, the user never sees a single number (the mistake Hipmunk made).",
        "Score against a real route baseline, not against the other results in the list; a group of three similar flights scores about 78 and 76, never a fake 100 and 0.",
        "Group before scoring: cluster by destination city and cabin, and never rank across different destinations (a real batch of listings mixed six different city pairs).",
        "Remove duplicates before tagging: the same flight shows up four or five times across suppliers, so collapse to the cheapest supplier per option first, then add signals.",
        "The hard warnings fire on expected regret (how likely a problem is, times how much you would regret it), not on how sure we are of a fact, and they fire no matter which lens you are in, safety beats any score.",
        "Be careful about fact versus guess in the wording: a change of airport (different airport codes) is stated as fact; a self-transfer or a protected connection is always a guess for now (the true ticket structure is not available yet), so it is capped in confidence and hedged ('looks like...').",
        "At most two tags per card, warnings always win and can take both slots; three levels, amber for a warning (before you commit only), indigo for an opportunity, grey for a fact. Red is saved for something that has actually gone wrong, in Rescue.",
        "Five plain fare categories, at most one per flight: Best Value, Lowest Price (with a penalty warning), Flexible, Free Changes, and Extra Baggage; we dropped 'Steal Deal' and 'Standard'; a Comfort category waits until we have seat and meal data.",
        "Two-layer labels: the plain, functional name sits on the money line, and the cheeky subtitle only appears when you expand the fare detail, where it cannot cause a misclick.",
        "Below-public-price savings are secondary and only shown if they are big enough (at least Rs.1,500 or 5 percent); a real deep search saved Rs.131, Rs.133, and Rs.0 (under 1 percent), too thin to build the headline on, so the price story leads with real value and being below the market floor instead.",
        "A lens is a weighted blend that leans on one thing (about half to two-thirds of the weight), never a single-column sort; a pure 'Cheapest' sort exists on its own but is not a lens.",
        "The transit-visa trap is shelved for now, the data field reads false in all 200 cases we checked; never claim 'no visa needed', only gently flag when a route passes through a hub known to need one.",
        "The verdict headline is fixed: '{N} flights, {M} worth your time', where worth-it is a property of each flight against an absolute bar, not just how it compares to the others."
      ],
      "requirements": [
        "The pipeline (the order matters): group, remove duplicates, derive what we can now, enrich with data as it lands, apply the hard warnings, score each axis 0 to 100, combine them, apply soft penalties, sort into categories, then resolve conflicts and render.",
        "When suppliers disagree (one real flight was refundable per two suppliers, non-refundable per two others; baggage listed as none, 25kg, or blank) take the safer value, lower the confidence, and hide any opportunity tags; drop the missing-bag flag when the baggage data conflicts.",
        "Normalise the baggage text ('NIL', 'None', 'Paid...' all mean no checked bag) before working out any bag signal.",
        "The price score: use the real cost, anchored to the route's history; add a flat Rs.3,000 to Rs.5,000 stand-in penalty for non-changeable fares (not a percentage, which would slap a Rs.60,000 phantom on a Rs.200,000 fare); this stand-in only affects ordering, it is never spoken aloud.",
        "The time score: measure duration against the shortest realistic time for the route, plus a fixed arrival-time curve (best late morning, worst in the small hours), minus penalties for red-eyes and next-day arrivals.",
        "The flexibility score: a simple ladder (refundable and changeable at the top, neither at the bottom) at low confidence for now, sharpened by the real penalty amounts once we can read the fare rules.",
        "The comfort score: start neutral at 50 and add or subtract for each component we actually know, each of which can drop out if we are unsure; overall confidence here is low today; baggage does not count as comfort (it belongs to price).",
        "The combined score weights each axis by its lens weight and its confidence; a missing axis drops out of the maths entirely so the score stays honest; the balanced lens weights price, time, flexibility, and comfort at 35, 30, 15, and 20 percent.",
        "The hard-warning list (highest regret weight): changing airport, a self-transfer (a guess, capped in confidence), a connection too tight to make (layover shorter than the minimum), and a brutal-penalty saver fare; these worst-case gates fire above about a 40 percent chance and cap the flight as a trap.",
        "Three levels of voice by confidence: opinionated (high confidence plus a real consequence), factual and specific (medium), and silent (low); warnings fire at a lower bar than praise, paid for with hedged wording in between.",
        "Confidence multiplies four things, sample size, recency, source quality, and density, and any one weak factor caps the whole thing; it is judged per flight, never turned on globally for a whole signal.",
        "What makes a flight 'worth it': it passes every gate, clears an acceptable floor on each axis, has no unaddressed worst-case warning, and beats an absolute quality bar (proposed 65); how it compares to the others only affects ranking and how many we show.",
        "The single recommendation is chosen only from the worth-it flights, and it names one or two things it rejected ('skipped the Rs.3,600-cheaper one, looks like two separate tickets through Newark').",
        "Honest ways to say there is no clean win: everything is a trap ('none I'd put you on as-is, shift a day'), a thin route, an 'it is already the floor' relief verdict, or 'this is outside what we are good at', never just dump a bad flight as the answer.",
        "Stability: because scores are absolute, adding or dropping one flight only changes that flight's score; the top pick is sticky (it only loses the crown to something at least four points better); display bands are coarse and smoothed so nothing flickers.",
        "Clear thresholds before a signal is allowed: an on-time claim needs at least 30 flights at the level claimed; a below-market claim needs at least 20 observations from Away's own log; a savings claim needs both prices checked against the route median and a minimum size; and fake scarcity is never shown.",
        "Log searches from day one, every search is a price observation feeding the route's price-history baseline."
      ],
      "keySurfaces": [
        "The verdict line: a shield icon, '{N} flights, {M} worth your time', and an optional second line for the tone (cleanly played, right one plus a near-miss, edge-walking, all traps, or outside our edge).",
        "The flight row: a mark dot (indigo means worth your time, its absence tells you something too), airline, route, price (old struck through, new), a meta line, and a row of at most two tags (amber warning, indigo opportunity, grey fact).",
        "The recommendation card ('the smart move'): a first-person verdict, the flight row inside it, the top two or three signals with the reason, and co-pilot buttons that lead with the prepare verb (negotiate, hold it 24h, shift a day).",
        "The lens switcher: a four-way toggle (price, time, flexibility, comfort), defaulting to your inferred leaning or Balanced; warnings show regardless of lens.",
        "The insight chip strip: per lens, each chip carries a number and only appears once it clears its confidence bar ('Rs.2,800 below the 90-day median', 'one lands at 2:40am, lose tomorrow'); it never pads to a fixed count.",
        "The why-this-flight breakdown (the one brand-new piece): four bars against the route baseline, a caption per axis, and a proof-of-work footer ('checked 7 suppliers, rejected 2, source: regulator on-time data'); a low-confidence bar renders grey and unscored.",
        "The fare-category cards: a hero (Best Value) plus two contextual cards, then 'see all fares', never five equal cards; the saver card carries its own amber penalty chip ('Rs.3,999 to cancel') or the name lies by leaving it out.",
        "The empty, all-traps, thin-route, sparse-data, and dead-lens states reuse the verdict line, the card, and the pills; the engine states its limit ('light on data here') rather than guessing."
      ],
      "moat": [
        "The verdict itself: the same public fare data turned into a point of view it can defend ('skip it') that no booking site dares give, the agent spending its own credibility, judged on how precise its warnings are.",
        "Away's own price-history baseline for each route, built up from every logged search, something no vendor sells, powering the below-market-floor call, buy-now-versus-wait, and every route-baseline badge.",
        "Ranking on the real cost after penalties, the agent's built-in edge over a booking site's sticker-price sort; it can flip a cheap saver fare below a pricier flexible one for people who need flexibility.",
        "An India-first data stack (the regulator's on-time figures, official minimum connection times, and a hand-curated table of Indian-hub lounge and airport quality) tuned to the Indian market.",
        "The calibration discipline: per-flight confidence, careful fact-versus-guess wording, and expected-regret gating, the trust machinery competitors cannot copy without the data and the feedback loop.",
        "A learning loop: every signal shown or held back is logged against what actually happened on the trip, so over time it learns each signal's bar, which supplier's flags to trust, and how much to discount coarse data."
      ],
      "v1": [
        "Ships on the normal search results (terminals, layover length, multi-leg routing) plus deep search for the fare grid, with no extra data and no paid feeds.",
        "Signals live from day one: the change-airport trap (fact), self-transfer (hedged guess), a sprint between terminals, the hand-baggage-only trap, red-eye, next-day, lands-you-fresh, lose-a-day, fastest, long-way-round, and only-non-stop.",
        "The real-cost ranking (rough, with a flat stand-in penalty, never quoted in rupees), deduplication and supplier-conflict handling (on both flexibility and baggage), plus signals for bag-friendly, meal-included, bare-bones budget airline, and sleep-through-it versus rough-sleep.",
        "The verdict, the worth-your-time marks, the at-most-two tags, the single pick with its rejections, and the four-axis breakdown, all working on today's facts only.",
        "The five fare categories (Best Value as hero, plus Lowest Price, Flexible, Free Changes, and Extra Baggage) with two-layer labels and the saver penalty chip.",
        "Honest limits stated on screen from day one: no on-time tag (no on-time feed yet), no 'new A350' or 'real legroom' (aircraft data almost never present), no spoken penalty in rupees (yes or no only, so 'non-refundable'), and the below-market call stays silent until the baseline is dense.",
        "Search logging wired from day one so the route price-history baseline builds up, the single most important data decision in the whole spec."
      ],
      "v2": [
        "The regulator's monthly performance report (a free PDF to parse) gives 'often delayed', 'holds up well', and 'cancels a lot', honestly labelled 'across its network', the first extra data to stand up.",
        "Per-flight on-time history (from a flight-data provider, enterprise or budget) gives on-time rates and delay spreads down to the individual flight.",
        "Reading the fare rules on the backend gives the actual penalty amount and the true after-penalty price, so it can finally say it out loud ('Rs.3,999 to change').",
        "Once Away's own price history is dense enough, the below-market-floor call, buy-now-versus-wait, and all the route-baseline badges switch on (silent until then).",
        "Official minimum connection times give a precise 'tight to make' and a miss-the-connection estimate; the scheduled aircraft code gives 'new aircraft'; a seat-map feed gives real legroom and tight-cabin warnings.",
        "Lounge and airport-quality data (plus a curated top-10 of Indian hubs) gives 'a comfortable stop' versus 'stuck at the hub'; Google's free travel-impact data gives a carbon estimate.",
        "Tracking the incoming aircraft and live status gives an 'inbound aircraft at risk' warning, a genuinely new before-you-buy disruption signal; plus a per-user learned leaning (from soft signals only)."
      ],
      "northStar": [
        "The true ticket structure (one ticket versus two) from an airline booking-system feed, which turns self-transfer and protected-connection from a hedged guess into stated fact, the biggest blocker, the whole self-transfer promise rests on it.",
        "A visa-rules lookup (your nationality against the route and each transit airport) that turns the transit-visa trap into a real signal instead of a shelved hedge.",
        "Real miss-the-connection rates ('about one in four miss this connection') from historical flight data at Indian scale.",
        "Clarity on who actually operates the flight, from codeshare data ('sold as Air India 2014, actually flown by Vistara').",
        "A per-user learned chance-of-changing and leaning, replacing the population average, reflected in the wording, never a settings page; safety and money warnings keep a shared floor for everyone."
      ],
      "metrics": [
        "Live (from our analytics, 28 June 2026): the verdict and negotiation screens are heavily used, the negotiation results and orchestration screens are among the most viewed, fed by 2,778 deep searches; warning precision itself is not yet tracked as an event."
      ],
      "openQuestions": [
        "How typical the below-public savings really are, audit more than the three deep-search results (about 1 percent, Rs.131) before pinning the 'Best Value = corporate rate' story to the size of those savings; reframe the hero around value maths if 1 percent turns out to be normal.",
        "The minimum size before we show below-public savings (proposed at least Rs.1,500 or 5 percent).",
        "The absolute quality bar for 'worth your time' (proposed 65) and the acceptable floor on each axis, to be calibrated against labelled good and bad flights, not just asserted.",
        "Where to draw the group boundaries, which nearby airports count as one city versus separate (Chicago's two airports are clearly one; set the distance threshold for the long tail).",
        "The expected-regret threshold for firing a worst-case gate (proposed 0.4), the starting chance-of-changing by trip type, and the flat stand-in penalty band (Rs.3,000 to Rs.5,000).",
        "Do people want Comfort as a sixth fare category? It is not real in today's data (no cabin or seat info), only worth it if seat, meal, and bag get bundled later ('Comfort' or 'Sit Easy')."
      ],
      "risks": [
        "Crying wolf, one wrong 'skip it' poisons every future warning; guarded by the 90 percent precision target, the two-tag ceiling, and watching how often warnings get dismissed.",
        "The true ticket structure is not available, so the common self-transfer case stays a guess; we need a proper airline-booking-system source rather than thin scraping, or the worst-case gate fires too rarely.",
        "Calling a rip-off 'great' just because it beats the others in the list, avoided by scoring against an absolute baseline and capping the price score when we have nothing to anchor to.",
        "A trap out-ranking safer flights because it is cheap, avoided by making the expected-regret gate a hard warning (not a soft penalty a low price can absorb) that fires in every lens.",
        "Faking specificity or dressing up coarse data as fine, the regulator's data is only airline-by-city, so the copy must say 'across its network', and no claim ships without a traceable source.",
        "Thin samples, the grouping, anchoring, and verdict logic were checked on one three-result deep search and one batch of listings; they need pressure-testing on routes where a saver fare genuinely undercuts the corporate one.",
        "Optimising the wrong number, chasing accept-rate rewards the safe, boring pick; keep it as a health check only, with warning precision and 'caught before it hurt' as the real targets."
      ],
      "sources": [
        "Claude/Other Features/2026-06-20_flight-index-insights-engine.md",
        "Claude/Other Features/2026-06-13-fare-categorization.md",
        "Claude/Bookings/2026-04-30_user-centric-flight-tags.md"
      ]
    },
    {
      "key": "book",
      "title": "Book + Payments",
      "oneLiner": "Away's ticket-first, pay-after booking: a real ticket is issued the moment you verify your phone, and you have 24 hours to pay or it cancels itself with no penalty. It turns the riskiest moment, handing over money, into Away's most distinctive, trust-building move.",
      "lockedDecisions": [
        "The core idea is ticket-first, pay-after: a real ticket is issued the instant you verify the code, and you get 24 hours to pay or it cancels itself with no penalty.",
        "'No penalty' appears wherever cancellation is mentioned, it carries the trust and the wording is non-negotiable.",
        "The pay-after intro sheet does three jobs at once: it sells the pay-after idea, collects the phone code, and leads into booking.",
        "The recommended version turns the sheet into a draft boarding pass being written in your name, with a shimmering placeholder where the ticket number will appear (it makes the trust handoff visible).",
        "The strongest version puts the app's dry voice into that metaphor: instead of 'writing your ticket', it says 'money first? That's how they get you. Not here.'",
        "Never ship the plain-form version, it wastes the brand moment for a transparency gain nobody notices yet.",
        "The loading screen shows the agent's real steps (held the fare, confirmed the seat, generating the ticket, issuing the e-ticket, sending it to your inbox), showing the work is brand-defining, not a generic spinner.",
        "The button on the trip summary says 'Lock the route' or 'Hold this seat' (not 'Continue to payment'), with a helper line 'you won't be charged yet' bridging the screens.",
        "The total is framed as a hold, not a charge: 'holding Rs.34,900, paid only if confirmed', the single most important trust signal, and it must sit on the button bar.",
        "The price calendar is a custom-built component (not an off-the-shelf one), because it needs a price on every day, a range band, and cheap, typical, and expensive tiers.",
        "The calendar looks about 350 days ahead (the typical airline booking window, roughly 330 to 365 days depending on the airline), not the 35-to-55-day range where people usually book.",
        "The wording at payment stays soft, in line with the brand rule; 'Ticket first. Pay after.' is the boldest line we use at that moment."
      ],
      "requirements": [
        "The code step: a six-digit phone-code field that auto-advances, the masked number (+91 ... 4521), a resend countdown, and a main button 'Book my ticket'.",
        "The button must show the phone number itself ('Send code to +91 ..... 1234'), because a bare 'Get code' reads as a scam pattern to Indian users trained by bank messages.",
        "The price must stay visible through the code step ('holding Rs.34,900, pay only if confirmed'), it cannot vanish at verification.",
        "Fix the contradiction: never show 'ticket number, pay to reveal' next to 'ticket first'; reveal the number after booking, not behind a paywall.",
        "The loading screen: a top-to-bottom list of the agent's steps in human words ('Locked Rs.12,840 with IndiGo, 9 min left in the hold', 'Seat 14C confirmed, matches the seat you like'), with a note 'keep this screen open, usually under 60 seconds'.",
        "An escape hatch after five minutes: 'Go home' and 'Talk to us', softer body copy ('the airline is slow today...'), and the time elapsed plus the current step in a status card.",
        "The 'ticket secured' state: a live countdown ('pay within 23h 58m, cancels itself Sat 5:32 PM, no penalty'), a placeholder ticket card with route, flight, and seat, an 'Unpaid' pill and the total due, a main button 'Pay Rs.12,840 now', and a soft 'or pay later, we'll remind you'.",
        "The paid state: a 'you're flying' confirmation, the ticket card flips to a 'Confirmed' pill, and two buttons, 'Ticket' (download) and 'See trip'.",
        "Name the actual payment method (UPI, the card gateway, bank verification), and drop the vague 'pay securely' for users made wary by fintech scams.",
        "The sheet needs a drag handle or a clear way out (give people control); remove the copy icon on a locked ticket number.",
        "Handle a fare or date change out in the open: if the fare moves between screens, show it clearly, never swap it silently.",
        "The price calendar's states: default, the next month, past days disabled, days with no fare, a ring on today, range start and end, the in-range band, single-day select, the cheap, typical, and expensive tiers (worked out automatically), a loading skeleton, pressed, and accessibility labels.",
        "The calendar's price tiers use Away's own green (not a borrowed one), split into cheap, typical, and expensive because 'the cheapest day to fly' is the whole point; a per-day override is supported.",
        "Prices use Indian digit grouping and short forms (k, lakh, crore); a 'Rs.-' placeholder keeps every cell the same height whether it is priced, past, or beyond the window.",
        "Wire the price calendar up as the output of the agent's calendar tool (the loading state already exists).",
        "The shimmer must respect reduced-motion settings (fall back to static dashes); the 'draft' tag must not read as an error or rejection (consider amber-on-amber).",
        "The payoff after the code: the draft pass must visibly complete itself (seat and ticket number fill in), it must not vanish into a generic success screen."
      ],
      "keySurfaces": [
        "The trip-summary button bar, a floating 'Lock the route / Hold this seat' button with the hold-framed total and a 'you won't be charged yet' helper.",
        "The pay-after intro and code sheet (the draft boarding pass with its shimmering ticket-number placeholder), the moment that states the brand's whole thesis.",
        "The code input (the sheet grows in place), a six-digit auto-advancing field, the masked number, a resend countdown.",
        "The loading screen, the agent's live narrated steps plus a five-minute escape hatch (Go home / Talk to us).",
        "The 'ticket secured' screen with its pay nudge, the live self-cancel countdown, the unpaid ticket card, and 'Pay Rs.X now'.",
        "The paid state with the ticket live, a confirmed ticket card, and 'Ticket' (download) and 'See trip' buttons.",
        "The price calendar, a multi-month vertical-scrolling fare calendar with a sticky weekday header, a range band, price tiers, and a clean nav and footer ('Jun 12-23, 11 nights, from Rs.12,000', with a Select button)."
      ],
      "moat": [
        "The pay-after-ticket model: a real ticket before any charge, a 24-hour no-penalty window, a genuinely riskier, harder-to-copy promise that flips the industry's 'money first' default.",
        "The show-the-work loading screen: seeing the real steps (fare held, seat matched to what you like, ticket generated) builds trust no spinner can, and it compounds with Away's memory of your seats and trips.",
        "The draft-ticket-in-your-name metaphor makes the trust handoff feel emotional rather than informational, borrowing from Apple Wallet's pass-as-content, Cash App's single-purpose screen, and Robinhood's big pre-confirm amount.",
        "A custom fare calendar with a price on every day and a roughly 350-day window, making 'the cheapest day to fly' a first-class part of booking, tied to the Flight Index."
      ],
      "v1": [
        "Ship the full ticket-first, pay-after flow: button bar, intro sheet, phone code, live loading, ticket secured (the 24-hour no-penalty countdown), then the paid ticket live.",
        "A simpler fallback for the intro sheet: ship the plainer version (right framing, phone visible, hold pill, three steps compressed) if the animated draft pass is too heavy for v1.",
        "A fixed loading step list (the same five every time): held the fare, confirmed the seat, generating the ticket, issuing the e-ticket, sending it to your inbox, with the five-minute escape hatch.",
        "The phone number on the button, the hold-framed price kept visible throughout, the named payment method, 'No penalty' everywhere, and a drag handle.",
        "The price calendar live as the agent's calendar-tool output, with price tiers and range selection."
      ],
      "v2": [
        "Ship the full animated sheet: the draft boarding pass with its shimmering ticket-number placeholder, the self-completing pass payoff after the code, and the 'money first?' headline.",
        "Real, varying loading steps (like 'trying another seat, your usual wasn't free') instead of the fixed list, more on-brand but more engineering.",
        "A shorter version for returning users (no headline, just the draft pass) so the pitch isn't wasted on repeat bookings.",
        "Fallback when the phone code fails: an emailed code or a hand-off to support after three tries.",
        "Pay with Away: top up an Away balance once, then pay for any booking in a single tap, no re-entering card or bank details every time. Written in plain, reassuring language, since it is money that people are trusting us to hold.",
        "Check the fare-colour thresholds against real deep-search data, and add a proper accent colour so the selected-day border stops being a hard-coded value."
      ],
      "northStar": [
        "Booking that feels like an agent writing your ticket in front of you: verify, watch it work, fly, and pay only once it is truly yours.",
        "Pay-after-ticket as the default on every Away booking, with the self-cancel, no-penalty safety net making a risk-free hold the norm.",
        "Fully agent-driven booking where your seat memory, the fare watch, and the calendar's roughly 350-day horizon come together to book the cheapest right seat with barely any input from you."
      ],
      "metrics": [
        "Live (from our analytics, 28 June 2026): 1,502 bookings created, 54 percent of deep searches; 132 payments succeeded and 74 tickets issued; a 34.7 percent payment success rate with 248 failures, including a 122-failure spike on 13 June, a live reliability flag."
      ],
      "openQuestions": [
        "Should 'or pay later' on the ticket-secured screen be a real button or stay quiet text? (currently quiet)",
        "Keep the loading steps fixed, or show real variation? (variation is more on-brand but more engineering)",
        "After three failed phone codes, fall back to an emailed code or hand off to support?",
        "Is there a real fallback if Away can't lock the fare? The 'you pay nothing' line assumes there is one.",
        "Is purple the brand accent? It appears on the sheet but not the trip page, an inconsistency to resolve.",
        "Was the date and time mismatch between the trip summary and the sheet just a mock-up slip, or a deliberate fare-refresh moment?"
      ],
      "risks": [
        "The contradiction between 'ticket first' and 'pay to reveal the ticket number' will sink conversion if it is not fixed.",
        "A bare 'Get code' with no phone number or context reads as a scam to Indian users trained by bank messages.",
        "The 'draft' tag with a blood-red border can read as 'rejected' or 'error'; a shimmer with no reduced-motion fallback shuts some users out.",
        "The wrong button ('Continue to payment') makes the code sheet feel like a non-sequitur, payment isn't what happens next, verifying is.",
        "If the pass just disappears into a generic success screen after the code, the whole draft-ticket metaphor is wasted.",
        "A brand tension: payment is meant to soften the voice, but the dry, bold voice is loud, so it has to be balanced at the payment moment.",
        "A vague 'pay securely' erodes trust with Indian users burned by fintech scams, who expect a named method."
      ],
      "sources": [
        "Claude/Payments/2026-05-30_payment_flow_spec.md",
        "Claude/Payments/2026-05-31_otp_bottom_sheet_critique.md",
        "Claude/Payments/2026-05-31_pay_after_sheet_four_directions.md",
        "Claude/Bookings/2026-06-20_price-calendar-component.md"
      ]
    },
    {
      "key": "trip",
      "title": "Watch + Trip Detail + Post-Booking",
      "oneLiner": "The after-booking home where Away lives with your trip: a Trip page that changes with the trip's stage, pulls separate bookings into one, watches every leg, and reshapes itself from a calm reference page into a single-decision rescue screen the moment something breaks.",
      "lockedDecisions": [
        "The app has two top tabs, Chat and Trip; this pillar is the Trip tab (the Chat tab is settled but designed separately).",
        "The Trip tab has five sections plus a quiet Manage row: a status hero, a timeline, tickets, money, travellers, and Manage.",
        "The page has two modes: at each stage it either asks for nothing (reference mode) or asks for exactly one decision (decision mode), and the page's shape is itself the design decision.",
        "Reference mode is the accurate structure with editorial flourishes on just two high-value moments: the route-stamp ring atop the timeline, and the '-Rs.4,200 taken back from the airlines' number in Money.",
        "Decision mode makes the state the shape: the top ~60 percent is the decision card, the bottom ~40 percent is the 'we're holding this for you' strip, and everything else collapses to one 'view full trip details' line.",
        "Luggage is never its own section, it shows inline for each passenger on each leg on their traveller card, so uneven allowances (say two bags one way, one the other) show up automatically.",
        "Cancel and change-date are labelled with their outcome, not just flat buttons, showing the rules, fee, or refund before the irreversible step (for example, 'Rs.12 refund on Light, upgrade to Plus for Rs.45?').",
        "Flight status lives in exactly two places, never duplicated: the status hero (the dominant next-up state) and a small status chip on each leg in the timeline.",
        "The after-booking life is modelled as five phases over time (confirmation, the trip hub, the last three days before departure, during the trip, and after the trip) crossed with four layers (your records, awareness of what's happening, the marketplace of add-ons, and the things Away does for you).",
        "'Skills' is a way of interacting that runs across the layers (something Away does on your behalf), not a screen you navigate to, and it carries the flexibility and comfort side of things.",
        "The trip hub (phase two) is where you go to check in; notifications are how it reaches out; both are designed as one system on a fixed rhythm (from a week before to a week after).",
        "The disruption recommendation is first-person with a two-line concrete reason ('we'd take Etihad 2103', plus the bag-transfer and hotel-cutoff reasons) and a one-tap override ('see 3 others').",
        "The email-reading cards in Chat: lead with what changed, state your rights as fact, and pre-select the alternative; where it came from ('view original email') is the trust anchor but never the default view.",
        "The trust panel (book now, pay in 24 hours): a restructured stack that separates the capability ('we book before you pay') from the trust it extends you; ship it as a warm handshake or a bolder flex.",
        "The bold editorial voice must soften at any payment or disruption moment, a calm, operational tone is the right one when something has actually gone wrong."
      ],
      "requirements": [
        "Pull several separate bookings into one trip (the standard test case: a round trip, two bookings, two passengers, Delhi to San Francisco on Etihad out, San Francisco to Delhi on United and Lufthansa back).",
        "The status hero: one main action chosen by the trip's stage (say 'open Etihad web check-in' 14 hours out, or 'add to your calendar' when it is booked two weeks out).",
        "The timeline: a vertical, stitched itinerary anchored in time ('in 14h', 'return in 16 days'), a dashed rail with lit dots, a status chip per leg, and inline smart notes (like 'Abu Dhabi is not Dubai, they're 139 km apart').",
        "Tickets: a grid of files with status tags, a combined PDF as the main tile, the individual booking PDFs, a boarding pass in amber with a countdown until check-in opens, visa and hotel vouchers, and tax invoices that reflect the trip's state.",
        "Money: a tidy ledger of bookings, credits used, savings against the market, and net spent, with the editorial 'taken back from the airlines' number as the standout moment.",
        "Travellers: a card per passenger with passport, seat, meal, and frequent-flyer number; luggage chips inline for each passenger on each leg.",
        "The Manage row: change date, add a leg, report an issue, cancel, each labelled with its outcome, and the fee or refund shown before you commit.",
        "The disruption decision card: a red 'CANCELLED' label, the route struck through (the destination stays, the path doesn't), a live decide-by countdown as the dominant fact, a first-person recommendation, and a one-tap override.",
        "The 'we're holding this for you' strip: the delay claim auto-filed, hotel cover, the return leg's status, and per-traveller fixes, capped at four visible with a '+n more' link.",
        "The transition: a designed one-to-two-second morph between the calm shape and the decision shape, plus a quiet line explaining it ('this page changed because Etihad just cancelled').",
        "The confirmation (phase one): 'you're going to {city}', the dates, the number of travellers, a tickets card (with a 'fetching tickets...' state), three next actions (add to your phone wallet, share, and one add-on nudge), and the Pay-with-Away receipt.",
        "The awareness layer: live flight status, gate and terminal, Indian immigration wait times, a leave-by time (using traffic and, with consent, your location), weather at both ends, and connection watching ('47 minutes, the gate is a 12-minute walk').",
        "The marketplace layer: lounge and credit-card pairing (two days out), insurance, a travel SIM, cabs, Digi Yatra (India's airport face-scan entry), priority check-in, and duty-free you order on the way out and pick up on the way back.",
        "The skills layer: an 'Ask Away' entry and a 'need help here' chip in each section, a document check ('is my passport okay?'), automatic web check-in three days out with consent, rebooking on disruption, and filing insurance claims.",
        "The email-reading card, part by part: an activity line ('email from IndiGo, read'), a where-it-came-from row, a scannable old-to-new change, a rights line (a delay over two hours means a free change or refund), a pre-selected next step, action chips echoed in the composer, and a way to view the original.",
        "The trust panel, top to bottom: a compact trip anchor, the gift as the hero line, a 'why this is safe', a three-fact promise (ticket instantly, 24 hours to pay with no card, free self-cancel), a quiet 'we trust you too' whisper, and the verify-your-phone button.",
        "The after-trip recap (phase five): a delightful echo of the four things (time saved, money saved, comfort, flexibility used), the final receipts, the tax invoice, the duty-free pickup confirmation, and an optional review prompt."
      ],
      "keySurfaces": [
        "The Trip tab in reference mode (five sections plus the Manage row), the calm default page",
        "The Trip tab in decision mode (the state as the shape: decision card, held strip, collapsed details)",
        "The status hero with its stage-chosen main action",
        "The timeline with its route-stamp ring, per-leg status chips, and inline smart notes",
        "The tickets grid (combined PDF, individual bookings, countdown boarding pass, visa, tax invoice)",
        "The money ledger with its editorial savings number",
        "The traveller cards with inline per-leg luggage chips",
        "The Manage row (change date, add a leg, report an issue, cancel)",
        "The confirmation screen (phase one, right after booking)",
        "The trip hub (phase two, the place you check back into)",
        "The day-of and boarding-pass card (phase three, the last day)",
        "The in-transit and connection-watching card (phase four)",
        "The after-trip recap (phase five)",
        "The email-reading card in the Chat transcript, with a 'view original email' sheet",
        "The trust panel (book now, pay in 24 hours)"
      ],
      "moat": [
        "Stitching separate airline bookings (Etihad plus United and Lufthansa) into one watched trip, which no airline app or booking site does.",
        "Connection watching that layers airline data with airport walk times ('you have 47 minutes, the gate is a 12-minute walk'), a moment no incumbent does well.",
        "The two-mode page that watches the trip and physically reshapes into a single-decision rescue screen when something breaks, rescue built into the structure, not bolted on as a banner.",
        "The email reader shows work already done ('we checked: Air India 2806 still leaves at 06:25, Rs.0 to move via a refund'), the one line no airline email can write.",
        "The outcome-labelled Manage actions create a way to earn: Away can charge a small credit fee for working out the best refund (across split bookings, voucher versus cash).",
        "An India-native trust play: the book-now-pay-in-24-hours gift, Digi Yatra, tax invoices, and immigration wait times, a local white-glove layer booking sites skip."
      ],
      "v1": [
        "A Trip tab that shows the whole trip at a glance: current status, a timeline, tickets, money, travellers, and a Manage menu.",
        "Stitch a round trip made of two separate bookings, for two passengers, into one trip view.",
        "Live flight status in two places: a small status chip on each leg, and one prominent current-status card at the top.",
        "A booking-confirmation screen with a Pay-with-Away receipt and a trust panel.",
        "Luggage shown per leg on each traveller's card; manage the trip per passenger and as a whole, with clearly labelled Cancel and Date-change actions.",
        "A card in Chat that reads a schedule-change email for you, showing its provenance (airlines, airports or public source), and lets you view the original.",
        "Auto web check-in three days before departure (with your consent), and a tile that shows the time as your check-in window opens."
      ],
      "v2": [
        "Decision mode (the state as the shape) for the cancelled or disrupted stages, with the first-person recommendation and the held-items strip.",
        "The designed one-to-two-second morph between the calm and decision shapes, plus the 'this page changed because...' line.",
        "The connection-watching card (airline data plus airport walk times) for during the trip.",
        "More marketplace depth: lounge and card pairing, Digi Yatra, order-out-pick-up-back duty-free, and priority check-in.",
        "A 'wallet-stack' Trip page prototype (like Apple Wallet's stack of passes) tested against the main design.",
        "The after-trip recap (phase five) with its four-part echo, plus insurance-claim and refund follow-through."
      ],
      "northStar": [
        "A trip that watches itself and handles disruption end to end: it detects, recommends, auto-files the delay claim, rebooks, and surfaces only the one decision you must own.",
        "A page that reshapes for every stage (an upgrade window, a fix needed, boarding, half-decision 'watching' states, and two decisions at once).",
        "The wallet-stack trip idea extended to any kind of trip (flight, hotel-only, train-only) once the data model supports it cleanly.",
        "A full concierge: live rescue during the trip, answering questions ('where's my baggage?'), and white-glove skills as the natural human side of the trip."
      ],
      "metrics": [
        "How often people reopen the trip mid-trip (the target: 5 to 10 reopens per trip, a sign a power traveller is engaged).",
        "The savings shown against the market ('-Rs.4,200 taken back from the airlines') as the recurring trust-and-value moment.",
        "How often disruptions get resolved in the app (a reroute accepted in-app versus sent to the airline).",
        "How often the email reader catches a schedule change over two hours and turns it into a free change or refund.",
        "How reliably automatic web check-in runs three days out (with consent).",
        "Trust-panel conversion: how many verify their phone, and the self-cancel rate on book-now-pay-in-24-hours."
      ],
      "openQuestions": [
        "The combined PDF: does Away assemble and sign it, or just zip the airline-issued ones? It changes how confidently we can label the combined tile.",
        "How reliable the per-leg status feed is, if the return legs' status is patchy, the chips need a 'last checked' note.",
        "Does the wallet-stack idea hold for hotel-only or train-only trips? (Probably, a pass is a pass, but sketch it first.)",
        "What the Money headline number shows before departure versus after ('-Rs.4,200 so far' becoming '-Rs.6,800 in total')?",
        "How far disruption help goes: does Away actually rebook you, or just send you to the airline? It decides whether the skill is real or a polite redirect.",
        "What Pay with Away is: a wallet you top up, or a pay-later method? It affects the confirmation receipt and the payment step.",
        "Digi Yatra: a flow inside Away, or a hand-off to the Digi Yatra app? (A marketplace card versus a skill.)",
        "Duty-free pickup: a real integration with the airport shops, or just a catalogue and a voucher?",
        "Connection watching: airline data alone, or layered with airport walk times (the walk times are the killer feature)?",
        "Handling a low-confidence read: it should default to the raw email with the summary second; and the counts in the design must wire to the real output.",
        "Where an email-reading card goes once you have acted on it, does it collapse to a single ledger line?",
        "Half-decision states (delayed but the connection is uncertain) and two decisions at once (a disruption plus an expired passport), gaps in the framework to design explicitly.",
        "Button wording to test: 'shake on it' or 'I'm in' versus a plain 'verify your phone', worth an experiment."
      ],
      "risks": [
        "The transition between the calm and decision shapes is not yet designed, a hard cut is jarring and the morph does real work in helping people follow what changed.",
        "The 'we're holding' strip has no cap yet, without the four-item limit and a '+n more', it becomes the overload it was meant to prevent.",
        "Two things competing for attention in decision mode (a dot on Trip and a dot on Chat), the Chat dot should only appear after you have accepted or declined.",
        "The bold voice reads as theatre or a threat in disruption and payment moments ('don't make us regret it' is right at the edge of the softening rule).",
        "The wallet-stack risks feeling gimmicky without Apple-Wallet-level polish, and the money and traveller details lose room.",
        "A recurring design mistake: early mockups assumed the calm shape no matter the stage, so it is easy to slip back and treat a cancelled trip like a booked one.",
        "The 'we trust you too' line is too good to lose but takes a different form in each place, so there is a risk of it being inconsistent across screens."
      ],
      "sources": [
        "Claude/Trip Detail & Post-Booking/2026-05-30_trip-detail-page-IA-and-directions.md",
        "Claude/Trip Detail & Post-Booking/2026-04-30_post-booking-structure.md",
        "Claude/Trip Detail & Post-Booking/2026-05-30_post-booking-page-4-stage-worked-example.md",
        "Claude/Trip Detail & Post-Booking/2026-05-30_trust_modal_directions.md",
        "Claude/Other Features/2026-06-07_email-parser-card-copy-and-directions.md"
      ]
    },
    {
      "key": "rescue",
      "title": "Disruption → Rescue",
      "oneLiner": "When the trip fails the traveller, a cancellation, a schedule change, a broken layover, denied boarding, a lost bag, Away arrives holding the fix (the smart move plus the rights you are owed), not just reporting the problem.",
      "lockedDecisions": [
        "A forwarded booking and a live disruption are one incoming flow, not two features, both hand the agent an incomplete picture and a decision to make under pressure.",
        "Three rules for taking it in: never ask what you can work out yourself; never quietly guess something irreversible; never hide what you are putting off. Close every gap by inferring, asking, or deferring.",
        "The screen has a fixed seven-part shape: where it came from, what changed, the rights line, the work already done, the one decision (a first-person recommendation, a two-line reason, and a one-tap override), the held-items strip (capped at four), and action chips.",
        "The page switches between two shapes: the calm 'watching' shape and the decision shape (a 60/40 collapse with a designed transition); when the agent is unsure of what it read, it flips to showing the email first and the summary second.",
        "The four things (price, time, flexibility, comfort) decide the order and which option is recommended, not which parts of the screen appear.",
        "The voice when something has gone wrong is calm and practical, all warmth, none of the usual edge; the swagger is saved for the win. Disruption sits at the calm end of the voice dial.",
        "How loud it is scales with how bad it is: a minor schedule change far off is a quiet line in the hub; a cancellation or broken connection near departure is a full takeover that breaks through Do-Not-Disturb with the fix already prepared.",
        "The co-pilot rule holds in a rescue: the agent offers the next move (rebook, open the airline app, draft the message), it never takes it, no auto-booking and no rebooking without your say-so.",
        "Negotiation is the thread that runs through: the same engine that beats the fare at onboarding does the rebooking in a rescue, so the early promise pays off here.",
        "Your rights depend on how the ticket is structured: one ticket (even across partner airlines) means you are protected and the airline must rebook you; two separate tickets mean a self-transfer, where no airline is obliged, the gap Away fills with awareness and the smart move.",
        "The binding Indian rule is fixed (the aviation regulator's requirement, revised 15 Feb 2023); under it, 'compensation' means cash only.",
        "In India, an event outside the airline's control (like weather) waives only the cash, never the refund, the rerouting, or the duty of care; the agent must never tell someone the weather wiped out their meal, hotel, or refund rights.",
        "The rescue hand-off is fixed: show the smart move, then open the airline app, point to the right desk or helpline, and draft the message or claim for you to send."
      ],
      "requirements": [
        "Build a structured rights table (country, type of disruption, and threshold, mapped to what you are owed) covering India, the EU and UK, the US, Canada, Brazil, Australia, the UAE, and the international treaty (the Montreal Convention).",
        "India: meals kick in at 2 hours (short flights), 3 hours (medium), or 4 hours (long); a domestic delay over 6 hours means an alternative within 6 hours or a full refund; a hotel is owed after 24 hours total, or after 6 hours for overnight red-eyes.",
        "India cash: a short-notice cancellation or a missed connection on the same ticket pays Rs.5,000, Rs.7,500, or Rs.10,000 depending on flight length; two weeks' notice or more means no cash.",
        "India denied boarding: nothing if an alternative leaves within an hour; 200 percent of the fare (up to Rs.10,000) within 24 hours; 400 percent (up to Rs.20,000) beyond that; and 400 percent plus a full refund if you decline the alternative.",
        "EU and UK: cash by distance of 250, 400, or 600 euros, including for arrival delays over 3 hours; 14 days' notice or more rules it out entirely; and note the catch, a non-EU airline flying into the EU is not covered (for example, Emirates from Dubai to London).",
        "US: mostly a refund system, an automatic refund on a big change (3+ hours domestic, 6+ international, a different airport, more connections, or a downgrade); cash only for being bumped against your will (200 percent up to $1,075, or 400 percent up to $2,150, as of Jan 2025).",
        "Canada: cash depends on the airline's size and whether it was in the airline's control, a big airline pays 400, 700, or 1,000 Canadian dollars, a small one 125, 250, or 500, for delays of 3-6, 6-9, or 9+ hours, and only when it was within control and not a safety issue; you have to ask, and they pay within 30 days.",
        "Brazil: a clean ladder, communication after 1 hour, food after 2, accommodation after 4 (if overnight), plus a choice at 4 hours of refund, rebook, or reroute; no fixed cash payout.",
        "Australia and the UAE: care and refund only, no fixed cash payout, so the agent must never promise an Australian or Gulf-airline passenger a delay payment.",
        "The international treaty's current ceilings (from 28 Dec 2024): delay about US$8,400, baggage about US$2,000, death or injury much higher, all based on proven damages and set in the treaty's currency unit, so fetch a live exchange rate before quoting any rupee figure.",
        "How to actually claim, built in: file the baggage report before leaving the airport; the treaty's written deadlines (7 days for damage, 21 for delay); a two-year overall limit; and where to escalate (India's grievance portal, the EU's national bodies, the US Department of Transportation).",
        "Every number shown to a user passes a freshness check, the agent re-verifies the amounts and exchange rates before quoting, because the rules change and being out of date is the main risk.",
        "Build it in the Away design system, in dark mode, using the shared colour, spacing, corner, and type tokens; clear the default white container fills to transparent first.",
        "Confirm (or flag as missing) a distinct accent colour in the design system for the rights line."
      ],
      "keySurfaces": [
        "The decision-mode screen (built): the full seven-part shape on the standard IndiGo +2h 35m schedule-change example, using the design tokens, in dark mode.",
        "The calm 'watching' screen (the quiet monitoring state), to be drawn next to the decision screen so the switch between them is clear.",
        "The forwarded-booking version: a read booking card shown in Chat for a booking made elsewhere (an unsure read flips to showing the email first).",
        "The rights line: an on-screen read of what you are owed, driven by the country, the disruption, and whether your ticket is protected.",
        "The quiet hub line for far-off schedule changes, which grows into a takeover as the date nears or the trip breaks.",
        "The crisis takeover screen near or at departure that breaks through Do-Not-Disturb with the fix ready.",
        "The after-trip 'claim what you're owed' screen: a proactive 'you're owed about X under this rule, want me to draft the claim?'",
        "The hand-off chips and composer: open the airline app, point to the desk or helpline, and draft the message or claim."
      ],
      "moat": [
        "A built-in passenger-rights engine, no booking site does this; the agent's value in a disruption is only as good as the rules behind it ('Away knows the way').",
        "Rules checked hard: 49 claims survived a three-way verification against the primary regulators across eight regions, each with its effective date flagged.",
        "Self-transfer awareness: Away fills the built-in gap (missed connections on separate tickets, where no airline is obliged) that cheap itineraries hide and where insurance, not the airline, is the backstop.",
        "The agent arrives holding the fix (what it read, the smart move, and your rights), turning the rescue from 'reporting a problem' into 'handled before you noticed', the 2am-cancellation moment a travel agent is judged on.",
        "Negotiation running all the way through: the rebooking engine is the same one that beat the fare, something booking sites and airline apps don't carry into the crisis.",
        "Proactively claiming what you are owed after the trip, most travellers never claim, so this goes beyond what a person on the phone would do."
      ],
      "v1": [
        "Ship the decision-mode disruption screen (the seven-part shape) on the IndiGo schedule-change example, using the Away design tokens.",
        "Encode the Indian rights line first (domestic and India-departing): the care ladder, the 6-hour alternative-or-refund rule, short-notice cash, denied boarding, and 'outside-the-airline's-control waives only the cash'.",
        "Detect whether the ticket is protected to drive the rights line: showing the one-ticket (protected) versus two-tickets (self-transfer) difference.",
        "Loudness that scales with severity: a quiet hub line for far-off changes, a takeover for a near-departure cancellation or broken connection.",
        "The hand-off built in: open the airline app, point to the desk or helpline, draft the message or claim; rebooking offered and confirmed by you (never auto-booked).",
        "A calm, practical voice when something has gone wrong (no edge)."
      ],
      "v2": [
        "Add the calm 'watching' screen and the designed transition between the two shapes so the switch is clear.",
        "The forwarded-booking version: a read booking card in Chat for bookings made elsewhere, flipping to email-first when the read is unsure.",
        "Extend the rights engine to the EU and UK, the US, and the international treaty's live ceilings for international trips.",
        "The after-trip 'claim what you're owed' screen, drafting the claim from the encoded rules.",
        "Swap the hand-built pieces for the real flight-card and trip components.",
        "Resolve the known gaps: half-states (delayed but the connection is uncertain) and two decisions at once (a disruption plus an expired passport)."
      ],
      "northStar": [
        "A rescue engine that matches and beats what a person on the phone would do, across every country the traveller touches, with the whole rights table live and verified.",
        "An agent awake the whole trip, catching the disruption it is watching for and arriving with the fix before the panic ends, the moment that justifies the whole product.",
        "Live connection watching through layovers that heads off the missed-connection crisis, and claim follow-through that chases refunds until they are paid.",
        "An always-fresh rights engine that re-checks its own effective dates and exchange rates so the numbers shown are never out of date."
      ],
      "metrics": [
        "Rights-table coverage: 49 claims verified against primary sources across 8 regions so far.",
        "India care thresholds: meals at 2, 3, or 4 hours; an alternative or refund after 6 hours; a hotel after 24 hours (or 6 for a red-eye).",
        "India cash tiers: Rs.5,000, Rs.7,500, or Rs.10,000; denied boarding up to Rs.20,000.",
        "EU cash: 250, 400, or 600 euros, including arrival delays over 3 hours.",
        "The treaty's live ceilings: about US$8,400 for delay and US$2,000 for baggage, from 28 Dec 2024.",
        "The held-options strip is capped at four; the one decision is a single recommendation, a two-line reason, and a one-tap override.",
        "73 percent of about 11,000 Indians surveyed believe fares move when they search again, the us-versus-them instinct that rescue and negotiation tap into."
      ],
      "openQuestions": [
        "Work through the after-booking phases one by one, or go straight to the rescue and crisis layer (the trust centrepiece)?",
        "Saudi payouts, the live exchange rate for the treaty's currency unit, and Gulf airlines' own terms are all unverified, don't quote them until checked.",
        "Canada's late-2024 amendments are proposed, not yet law (as of June 2026), so advise on the current rules and flag the change as coming.",
        "The EU's exact care-hour thresholds did not hold up against the primary source, so reconfirm them before the agent quotes care hours (the EU cash amounts and the 3-hour delay line are confirmed).",
        "Is there a distinct accent colour for the rights line in the design system, or is that a gap to flag?",
        "The half-states (delayed but the connection is uncertain) and two-decisions-at-once cases are named but not yet drawn."
      ],
      "risks": [
        "Being out of date is the main risk, the US amounts changed in Jan 2025, the treaty ceilings in Dec 2024, an Indian draft is circulating, and Canada's amendments are pending; quoting a stale number erodes the 'knows the way' trust the whole pillar is built on.",
        "Over-promising (say, an EU payout to an Emirates Dubai-to-London passenger, or any fixed cash in Australia or the Gulf) directly contradicts the verified rules and breaks trust at the worst possible moment.",
        "The self-transfer gap: if the agent implies an airline is obliged when the tickets are separate, the user is left stranded with no recourse, so the protection badge and rights line must be exact.",
        "Any bold edge or false cheer when something has gone wrong breaks the calm-voice rule and reads as tone-deaf during a real crisis.",
        "Crossing the co-pilot rule (auto-booking a rescue rebooking) breaks the brand's core principle.",
        "A build trap to remember: new frames start with a white fill that hides white text on the dark UI, so clear container fills to transparent up front."
      ],
      "sources": [
        "Claude/Other Features/2026-06-19_passenger-rights-disruption-rules.md",
        "Claude/Other Features/2026-06-20_passenger-rights-additional-jurisdictions.md",
        "Claude/Agent/2026-06-19_disruption-forward-intake-skill.md",
        "Claude/Agent/2026-06-19_agent-lifecycle-scenario-build.md",
        "Claude/Other Features/2026-06-13-negotiate-communication-ideation.md"
      ]
    },
    {
      "key": "genui",
      "title": "Generative-UI system",
      // Opt this pillar into a 3rd "Preview" view alongside Cards | Table: a live,
      // interactive recreation of the app's Generative View (wired via the
      // `genPreview` builder in PrdDoc).
      "interactive": "genPreview",
      "oneLiner": "One engine that builds the right screen for any point in the trip out of a kit of vetted building blocks, instead of hand-building 60 fixed screens. The AI proposes, the design system decides.",
      "lockedDecisions": [
        "The AI proposes, the design system decides: the engine ranks and picks from a kit of vetted blocks and fills a fixed structure, and never draws raw interface from scratch.",
        "This is how every reliable system does it (Google, Airbnb, Lyft, DoorDash, and the research), so it is the consensus, not a contrarian bet.",
        "One function takes a moment (the stage, the signals, and the context) and returns a screen (a stage template, ranked blocks, a voice mode, and honest fallback states). The search box is that function at the search stage; every other screen is the same function on a different moment.",
        "Fully rebuild the screen only where the options really vary (the international search box, the verdict, a disruption); keep it simple where they don't (a domestic scan, the calm watch), rebuilding a daily habit for no reason only hurts it.",
        "Check the values inside each block, not just which blocks are allowed, an allowed block can still carry a made-up fare or a wrong button, and that is the single most dangerous hole for an agent that quotes fares.",
        "Separate thinking from formatting: let the AI reason freely when ranking, and only lock down the final fill, forcing the reasoning into a rigid template makes it worse.",
        "The checker that sits between the AI's ranking and the final screen is a system in its own right, not just one guardrail among many, it is the new, load-bearing piece that earlier systems didn't need (their selection was plain code).",
        "Meaningful blocks (a fare-compare card, a verdict card), never generic boxes-and-buttons, Lyft and Zalando proved that over-generic pieces just rebuild raw web pages on the server.",
        "If we ever open the generation up, the hard limit moves from the list of allowed blocks to the facts and the rules (a verified source of truth plus a rules checker), so the kit becomes a store of what generation has proven works, not a cap on it.",
        "The split at runtime: the server composes a layout description, the app draws it from the kit, and updates stream as small changes against a stable frame, never a full redraw."
      ],
      "requirements": [
        "A five-step pipeline: (1) a cheap gate decides how much to build, fill a fixed screen, pick from options, or rebuild, based on how much the options vary, how clear the request is, how urgent it is, and how close departure is (and asks a question first if it's unclear); (2) the AI reasons freely to rank what matters, with a nudge towards stability when things are urgent; (3) a tightly-constrained fill produces the screen description, naming only registered blocks; (4) a plain checker enforces all the rules and, on failure, shows a safe fallback rather than anything broken; (5) the app turns each block into a real component and streams small updates against the stable frame.",
        "The screen description is simple: a template, a flat list of blocks (each with its slot, rank, voice mode, and values), and a version, using id references so it can be updated a piece at a time.",
        "Every block has a contract that declares: its id, which stages and needs it serves, its values (and whether the data for each is available now, coming soon, or not yet), its states, its voice modes, its slot (hero, supporting, chip, or ticket), a required honest fallback, the actions it supports, a minimum confidence, and rules for when it must, should, or must never show.",
        "Checks on every block's values: each rupee figure, button target, and route is validated, or the block falls back to its honest state (a fare must be a live, bookable quote within the route's normal range; an on-time percentage only shows if it's at the right level of detail with at least 30 flights behind it).",
        "Values we don't have the data for are hidden, never guessed: absolute price verdicts, 'visa verified', monthly seasonality, and compensation amounts all fall back to a within-search difference or a 'reason pending' instead.",
        "Keep the frame stable: the navigation, the conversation thread, and the ticket never change and never appear in the update stream; each block's slot is fixed, so re-ranking only changes which block is the hero, never moves a block to a different slot (the lesson from Office's shape-shifting menus); and only rebuild at stage or moment boundaries, not on every tiny signal.",
        "The checker's rules (enforced before anything draws): at most one hero, one control per screen, the frame intact, slots respected, every data need either met or dropped to an honest state, actions validated up front (not when you tap), and any unrecognised choice snapped to the nearest valid one in under a tenth of a second.",
        "A dark-pattern checker that fails the build outright: what we've learned about a person must never auto-generate fake urgency, guilt-tripping, or a pushy 'Best Value' upsell (India's data-protection law is our benchmark).",
        "Accessibility is built into each vetted block (screen-reader roles, focus, keyboard maps, live announcements), not into the generated description, which turns the documented 23-to-47 percent failure rate of generated accessibility into a one-time cost paid once per component.",
        "Every block must have an honest fallback; a missing one is treated as an error, so no block ships without its 'hide, don't guess' state, which defuses the classic empty-container failure.",
        "Overrides you control ('pin this block', 'show me everything') saved to your standing brief, because letting people adjust it themselves consistently beats the system silently adapting.",
        "Operational discipline: a version on every screen description, a list of what each app version can render, only ever adding (never removing), and an instant rollback of the ranking logic if something goes wrong."
      ],
      "keySurfaces": [
        "The verdict card (at the vet stage, as the hero, edge or warmth voice): the single pick, why it, the ruled-out-traps list, and the lens and override; with honest 'no clean win' and 'all traps' states; and never a 'best' label when nothing clears the bar.",
        "The price landscape (at the vet, home, and watch stages, hero or supporting, plain or edge voice): price across dates, shown as evidence the floor was found; bars only across dates actually checked; it collapses to one confident line when flat; estimated and verified are always distinguished; it is evidence, not a price-range filter.",
        "The disruption takeover (at the rescue and related stages, as the hero, warmth by default with edge on the rights line): rescue the broken trip, state what's owed by country, the prepared move, and the hand-off; the co-pilot rule is absolute here, it never auto-books, the last tap is always yours.",
        "The stage templates: a slot structure per stage (named regions, hero, supporting, chips, and the inferred ticket) across the 12-stage journey, keeping layout separate from content, each template kept visually distinct so people remember where things are.",
        "The stable frame: navigation, the conversation thread, and the ticket, constant across every moment; only the core region rebuilds.",
        "The full kit of about 45 blocks (trade-off strips, the Flight Index read, a cabin and seat picker, a per-passenger panel, a time dial, ticket-structure cases, tap-to-pay, the watch diary, connection arithmetic, the rights and rescue card, the recap, the editable ticket, the working receipt, and chips), which is both the quality floor and the starting cache.",
        "The gate, a visible, cheap classifier that decides how much to build before any generation effort is spent."
      ],
      "moat": [
        "The checker and block-contract layer (value validation, treating a missing honest state as an error, snap-to-nearest, and the dark-pattern check), the one piece with no precedent because earlier teams' selection was plain code; this is where the de-risking effort and the defensibility both live.",
        "A verified source of truth for every fact, number, fare, and rule, so the generator can display truths but can never invent one, which structurally closes the made-up-fare risk that allow-lists leave open.",
        "The kit as a crystallising cache: screens that recur and keep passing their contract harden into reusable components, so the system gets cheaper and more consistent the more it's used, a house style that emerges rather than a static library.",
        "Covering the odd intersections (a Gulf one-stop bias, an unfamiliar long-haul, a senior companion with no SIM, at 9:40pm) that a fixed 45-block kit can only answer with the nearest block, being bespoke at the edge is the real value, and the India-specific people and biases are the moat.",
        "A coverage grid (the 12 stages against persona leaning, trip type, voice mode, state, and data availability, with the build level marked in each cell) as a defensible proof that every scenario is covered."
      ],
      "v1": [
        "First: formalise the kit and write machine-readable contracts for the blocks (the inventory already exists from the jobs, flow, and copy work); ship the three reference contracts, the verdict card, the price landscape, and the disruption takeover.",
        "Then: build the compose function for the search stage as the reference engine (the spec and personas are done), running on available data only.",
        "Build the checker and block-contract format on one high-variance stage and test it against the known failure modes (an unknown block, a new id, an unsupported action); if this layer is solid, everything downstream is proven.",
        "Build the two-step engine (reason freely to rank, then fill a strict template) and measure whether splitting it beats doing it in one go, on both ranking quality and how well it sticks to the template.",
        "Stand up the gate and set an interactive speed budget (a research prototype took several minutes, the cautionary number to stay well under).",
        "Audit the prototype blocks for accessibility and dark patterns; test each vetted block once with a person and with assistive technology."
      ],
      "v2": [
        "Generalise the compose function across all 12 stages via the templates; wire the voice dial (edge, plain, warmth) and honest states everywhere.",
        "Build a replay and visual-regression setup ('given this moment, show this screen'), since predictability is the trust metric; and catch any drift in the frame.",
        "Extend the kit to the remaining ~42 blocks under the same contract shape.",
        "Ship the user overrides (pin, show everything) saved to the learned brief; plus the operational pieces (versions, a capability list, instant rollback of the ranking logic).",
        "Prototype the open generate-and-check loop (verified truths plus a rules critic) on one high-nuance moment (the disruption) to test moving the constraint rather than removing it."
      ],
      "northStar": [
        "A learning loop that tunes the ranking from real behaviour and switches on the feeds we don't have yet (route variance, price history, the brief store).",
        "Open generation at the edge, crystallising towards a kit at the core: the generator answers any nuance bespoke and verified, the winners harden into the kit automatically, and only the truths and guarantees stay constrained.",
        "Every one of the roughly 45 behavioural biases gets its own gentle correction, generated for the exact person and moment (a first-timer's fear, a loyalty optimiser's bad miles trade, a senior with no SIM in a 9:40pm disruption).",
        "A house style that emerges from the winners (a memory of what's coherent plus a critic), so bespoke-per-moment still feels like one product without hand-authoring every slot."
      ],
      "metrics": [
        "How well the constrained fill sticks to the template (target near 100 percent with constrained generation, versus about 93 percent with prompting alone), and it can never name a block that doesn't exist.",
        "Predictability: the same moment produces the same screen (the trust metric, measured with the replay and visual-regression setup, catching any frame drift).",
        "Full rebuilds stay under an interactive speed cap (versus a research prototype's several minutes).",
        "The accessibility failure rate driven towards zero by building it into the blocks (the baseline for generated code is 23 to 47 percent).",
        "How much of the known failure list the checker catches (an unknown block, a new id, an unsupported action, all handled gracefully, never an empty screen or a crash).",
        "The dark-pattern checker: zero fake urgency, guilt-tripping, or upsell emerging from what we've learned about a person.",
        "The two-step engine's ranking quality versus doing it in one; and the gate's accuracy (does it correctly save the generation effort for the moments that vary a lot)."
      ],
      "openQuestions": [
        "Where to draw the generative line: the constrained approach (recommended and hardened) versus the open one, which only works if the constraint genuinely moves to the truths and rules rather than being dropped; the research rated fully-open generation risky.",
        "Exactly which cells of the coverage grid get a full rebuild versus a simple pick (the commitment: generate only where the options vary a lot).",
        "What to deliver: a written system spec, a Figma block kit, or a coded engine prototype.",
        "Confirm the screen-description-tree approach over the simpler tool-call-to-block one, given the composition and ranking layer this needs.",
        "Whether to deep-research the open frontier (generating interfaces, verified generation, and evaluating generated interfaces) to harden the open approach the way the constrained plan was hardened.",
        "Exactly where the free reasoning ends and the structured output begins in the ranking step."
      ],
      "risks": [
        "Confidently wrong values (a made-up fare, a bad button), the worst risk for a fare agent; guarded by value checks and the verified source of truth, not by allow-lists ('hide, don't guess' covers missing data, not wrong-but-confident data).",
        "Shape-shifting instability, re-ranking that moves or hides what people rely on; guarded by fixed slots, adapting only by prominence, and never touching the frame (the Office-menus failure).",
        "Speed and cost blowing up from generating a screen for every query; guarded by the cheap gate before any generation, caching by the shape of the request, pre-generating, and streaming.",
        "Trust eroding if the same moment gives a different screen each time; guarded by a memory of what's coherent, keeping the truth and the verdict stable even when the form varies, and persistent overrides.",
        "Dark patterns creeping in from personalisation (against India's data-protection law); guarded by the hard dark-pattern checker, which matters even more when generation is open.",
        "Sliding into generic 'web pages on the server' (the Lyft, Zalando, and Spotify failure), so keep the blocks meaningful; the AI only ranks, selects, fills values, and picks from set options, never invents new block types or raw layout.",
        "The evaluation gap: wins in the lab die with regular users; guarded by long-term repeat-use testing plus the visual-regression and replay tools.",
        "Tooling is the make-or-break dependency every team like this flagged, so treat the checker, the replay, and the visual-regression setup as first priority, not an afterthought."
      ],
      "sources": [
        "Claude/Generative UI/2026-06-25_generative-ui-system-plan.md",
        "Claude/Generative UI/2026-06-25_generative-ui-unconstrained-remap.md",
        "Claude/Generative UI/2026-06-25_genui-harden-research.md",
        "Claude/Generative UI/2026-06-25_away-hero-block-contracts.md"
      ]
    },
    {
      "key": "foundations",
      "title": "Foundations: IA, Tokens, Brand",
      "oneLiner": "The structural bedrock everything else sits on: a four-tab, India-tuned app structure, a clean dark-first system of named design tokens in Figma, and a consistent type and brand language.",
      "lockedDecisions": [
        "The four-tab bottom bar is settled: Home (search), Trips, Negotiate, and Refer, plus a floating plane button that's always there.",
        "The home screen is a full overview, not search-only (this overrides the earlier review); Indian users engage with the home screen and rarely dig into other tabs, so Home previews every tab's content, a deliberate duplication.",
        "The rule of thumb: someone who only ever sees Home must understand the product, see what's happening, and be able to do all four things (search, negotiate, refer, check trips).",
        "Rename 'Booking' to 'Trips': a booking is a past purchase (an order), while a trip is an ongoing relationship (watching, negotiating, booked, past), which is the right idea for Away.",
        "The referral model switched from a scarce quota (five invites, then two) to tier-up rewards (20 percent off, then 30), trading some brand magic for proven conversion, accepted at this early stage.",
        "The product is dark-only; the light theme is left minimal and unused.",
        "The token modes were restructured to Light, Accent, and Dark across all six Figma collections (the old Light/Dark/Away had Dark and Away almost identical).",
        "Fonts: keep Google Sans Flex for the main sans-serif, Libre Baskerville for editorial serif headings, and JetBrains Mono for monospace. The code currently uses Inter as a web stand-in, to be reconciled separately, not by changing Figma.",
        "The colour naming is locked to a human-friendly role-and-variant scheme with eight families: background, surface, text, icon, stroke, control, accent, and status.",
        "The core rule: always bind the named tokens, never the raw values directly; and every frame must set both the semantic and the primitive modes to the same theme (setting only one is a silent bug)."
      ],
      "requirements": [
        "The bottom bar: four tabs (Home, Trips, Negotiate, Refer); settle the grammar, pick all verbs (Search, Negotiate, Refer, Trip-Check) or all nouns (Home, Trips, Negotiations, Invites), mixing the two is the worst option.",
        "The Home tab has six blocks: a header (the wordmark, a credit chip like '42 credits', and a profile icon); an atmospheric photo band (decoration only); Search ('where are we going, Agam?', a single input, two secondary cards, a 'Hunt it down, 2 credits' button, and recent-search chips on focus); Your trips (three cards for returning users); a Negotiations preview ('don't search, negotiate', three benefit pills, two to four recent wins, and a 'Start a negotiation, 8 credits' button); and a Refer preview ('share the access', a tier badge, and 'Share on WhatsApp').",
        "The Trips tab: a summary line ('2 watching, 1 negotiating, 0 booked'), a segmented filter (All, Watching, Negotiating, Booked, Past), trip cards (status chip, route, price and change, key info, sorted by urgency), and an empty state ('no trips yet, start a search and we'll watch the price for 90 days').",
        "The Negotiate tab: a header and a two-or-three-sentence explanation of how it works, a start form (route, dates, travellers, 'Pick a fight, 8 credits'), your active negotiations, three detailed how-it-works cards, a larger recent-wins feed, and past negotiations with the total saved.",
        "The Refer tab: a header, your tier status (a badge and progress bar, '1 more invite for 30 percent off'), ways to share (WhatsApp first, then copy link, SMS, more, and the invite code), your invites (pending, joined, first-search, converted, and the reward earned), and the full tier ladder with its thresholds.",
        "Show the credit cost right on every action button ('Hunt it down, 2 credits', 'Start a negotiation, 8 credits').",
        "The Figma token layer: about 36 to 40 tokens set exactly to the dark-mode spec, near-black surfaces in a few steps, off-white to grey text in three steps, the Tribal Indigo accent, a green for success, and distinct soft tints behind status messages.",
        "Three self-contained themes per token: Light (white surfaces, near-black ink, darker status colours for contrast), Dark (the neutral near-black spec), and Accent (the same chrome as Dark, with indigo only on the major components, the primary button, the accents, and focus rings).",
        "Sixteen text styles bound to tokens: display, four heading levels, three body sizes, three label sizes, caption, and overline (in Google Sans Flex), a serif display and heading (in Libre Baskerville), and a medium monospace (in JetBrains Mono).",
        "Shadow styles: one for cards and one for modals; light-mode cards need a drop shadow to read as raised, while dark mode gets its lift from lightness instead.",
        "A per-screen rebinding recipe (a token-binding script): rules based on role and lightness map surfaces, text, icons, and borders to the right token families, indigo to the accent, and detect status colours by hue; hide the glow shapes that can't be tokenised and replace them with a token-aware accent glow; the primary button gets its own contrast treatment; about 90 percent automatic, 10 percent by hand."
      ],
      "keySurfaces": [
        "The bottom bar (four tabs plus the floating plane button)",
        "The Home / Search tab (the six-block overview)",
        "The Trips tab (live status and history, with segmented filters)",
        "The Negotiate tab (the pitch, the start form, active, the wins feed, and past)",
        "The Refer tab (tier status, sharing, invites, and the ladder)",
        "The Figma 'Agent States' page (116 frames, about 27,900 nodes), the find-to-vet flow",
        "The on-canvas 'Tokens' proof board (three columns for Light, Accent, and Dark, with swatches bound to the named tokens)"
      ],
      "moat": [
        "India-tuned structure: a full home screen built around the real Indian habit of not digging into tabs, a deliberate localisation most travel apps miss.",
        "Trips as an ongoing relationship (watching, negotiating, booked, past) rather than a list of past purchases, which uniquely fits the watch-and-rescue promise.",
        "A clean, fully token-bound, theme-switchable dark-first design system (the named-token layer plus a reusable binding script) that lets every future screen ship on-brand fast."
      ],
      "v1": [
        "Ship the settled four-tab structure (Home, Trips, Negotiate, Refer) with the floating plane button.",
        "Build Home as the six-block overview; Trips with segmented filters and live-status cards.",
        "Fix all the recurring must-fixes from the reviews before shipping: fill or remove the empty negotiation card slots, add a true 'how it works' line, decide the role of the round photos, replace 'Pick a random location' with 'Start a negotiation', make the benefit pills specific, show the credit cost on every button, and change 'Find the best fare' to 'Beat this price'.",
        "Use the reconciled dark-mode tokens (the definitions are done) on all new and redesigned screens; bind them with the token-binding script.",
        "Apply the 16 text styles and the shadow styles; keep it dark-only.",
        "Rebuild the vet-and-verdict screen on the now-correct tokens as the first per-screen rebind (it's the heart of the product and currently missing)."
      ],
      "v2": [
        "Rebind the remaining ~30 original screens (from the Snapmint file we forked) onto the clean token layer (90 to 198 bindings each) as each is redesigned.",
        "Clear out the leftover clutter from the Snapmint fork (credit and loan dashboard layers, dead layer stacks) once we've scanned every page for what's actually used.",
        "Retire the overlapping old grey scales and prune the unused colour values after that scan.",
        "Finish the live wins-feed backend (the Negotiate tab and the Home preview both need it); until then, ship cached, rotating recent wins.",
        "Write the full tier ladder (the actual tiers and rewards beyond 20 and 30 percent).",
        "Decide on the floating plane button, keep it with one clear job (suggested: a quick plain-language search from anywhere) or drop it.",
        "Regenerate the out-of-date labels on the 'Tokens' proof board (the swatches are correct, only the labels show old names)."
      ],
      "northStar": [
        "A single fully-tokenised, theme-switchable design system with no orphaned or raw-value bindings, where every screen follows the theme automatically.",
        "Reconcile the official font set across code and Figma (settle the code's Inter versus Figma's Google Sans Flex, Inter Display, and Libre Baskerville; remove the stray one-offs like Unbounded, Barlow Condensed, and Helvetica Neue).",
        "One canonical flight-card component and consistent placeholder data ('flights to Peru' actually showing Peru routes, not Delhi to Dubai), with the understated lowercase voice applied throughout.",
        "A consistent, action-oriented brand voice, in verbs, across the whole app."
      ],
      "metrics": [
        "How much people engage deep in the tabs versus on the home screen (the Indian habit that drove the full-home-screen decision).",
        "The share of Figma elements bound to the named tokens (today only 6 percent; 38 percent orphaned, 40 percent bound to raw values; target near 100).",
        "Referral conversion under the new tier-up model versus the old scarce-quota one."
      ],
      "openQuestions": [
        "Confirm the team accepts renaming 'Booking' to 'Trips'; if not, where does the live-status screen live?",
        "The final tab grammar: all verbs or all nouns?",
        "The floating plane button: drop it (it's redundant given the full home screen) or give it one defined job?",
        "The true wording for how negotiation works (the current 'travel-agent fares, fare-class arbitrage, direct airline channels' is placeholder and must be accurate before shipping).",
        "The role of the round photos on Home: decoration, tappable inspiration, or personalisation?",
        "The official set of font families across code and Figma.",
        "Whether the round-photo and live-wins-feed backends are ready to ship."
      ],
      "risks": [
        "The deliberate duplication between the home screen and the tabs can weaken both if it's not carefully scoped (the original review's main warning).",
        "The tier-up referral model is a generic mechanic (it feels like Uber or Cash App) and loses the distinctive, exclusive feel.",
        "Token debt: 38 percent orphaned, 40 percent bound to raw values, and hard-coded surfaces mean visual changes don't ripple through until the big per-screen rebind is done.",
        "Leftover clutter from the Snapmint fork (hidden fintech layers, inverted scales, mode mismatches) causes silent 'not adapting to dark mode' bugs when the semantic and primitive modes aren't set together.",
        "The fonts (Google Sans Flex, Inter Display, Libre Baskerville) aren't installed in the automated environment, which blocks applying text styles from the agent side, so it has to be done on the user's machine.",
        "Inconsistent placeholder data (one trip labelled Peru but the cards show Delhi to Dubai, three identical Rs.28,000 cards) undermines credibility if it ships."
      ],
      "sources": [
        "Claude/App Structure & IA/2026-05-15_four_tab_ia_final.md",
        "Claude/App Structure & IA/2026-05-15_app_structure_review.md",
        "Claude/Figma & Tokens/2026-06-20_figma-token-reconciliation.md"
      ]
    },
    {
      "key": "business",
      "title": "Business, Monetization, GTM & ASO",
      "oneLiner": "Away makes money from the agent's work (not affiliate hand-offs) through a credits system, launches as an invite-only 'private club' over a signal-gated 30-day plan, and wins cheap installs by owning a defensible power-traveller niche in app-store search.",
      "lockedDecisions": [
        "The money idea: charge for work done (compare, hold, optimise, rebook), not for handing off the booking, credits mean 'pay for labour, not affiliate kickbacks'.",
        "The credit price: one credit is ten cents to the customer; it costs us about four to six cents (the AI, the flight data, and servers); the margin grows at scale.",
        "A hybrid pricing model: subscription tiers, plus top-up packs, plus success-fee jobs, neither pure pay-as-you-go nor pure subscription.",
        "The subscription tiers are set: Free ($0, 50 credits), Traveller ($9, 200), Frequent ($29, 800), and Concierge ($99, 3,000).",
        "Unused credits carry over up to three times your monthly amount, generous-feeling without unlimited exposure to heavy users.",
        "Top-up packs with a growing bonus: $10 buys 110 credits (10 percent extra), $25 buys 300 (20 percent), $100 buys 1,300 (30 percent).",
        "A success-fee track billed only when it wins: a delay claim takes 20 percent of the payout (versus AirHelp's 35 percent), a mistake-fare rebook takes 5 percent capped at $50, and a fare-drop rebook takes 10 percent on bookings of $400 or more.",
        "Three workflow rules: always estimate before, never bill after a surprise; a quiet live meter during long jobs; and value-versus-cost receipts that close the loop.",
        "Long-running jobs run against an agreed budget: they pause automatically when it's reached, ask to extend, and never quietly overspend.",
        "The launch plan: a 30-day timeline (not 42), four sequential acts each gated on a signal (not six parallel tracks), and the brand film on day 28.",
        "The launch moment is the day-28 brand film 'The tab you never close', at 6pm India time; no in-person launch party in this version.",
        "The core launch idea: the main thing stopping people booking is confidence in the decision, not price or availability, so earn trust before asking for anything.",
        "A waitlist target of 1,000-plus, with ways to jump the queue: +15 for a referral, +50 for sharing a dream trip, +25 for a visa story, +10 for a follow, and a golden ticket for the top 50.",
        "The recommended App Store title is set: 'Away, Negotiate Flights' (30 characters); the subtitle is 'Hunt the deals booking sites hide'.",
        "The main category is Travel, the second is Productivity (positioning Away as a tool, not a lifestyle or utility app).",
        "The keyword field leaves out rival app names (Apple's policy); rival-brand terms live only in the description and promo text.",
        "The App Store visuals are an eight-frame story (story beats, not a feature tour), one shared visual system, with no superlatives or store-ranking claims.",
        "The brand voice: no emojis, no startup-speak, no exclamation marks; the sign-off is 'Get Away.'; the bolder voice in the store, the warm, wise voice in the app."
      ],
      "requirements": [
        "A credits ledger and wallet: track the balance, the monthly amount, the three-times carry-over cap, top-up purchases, and what each job costs.",
        "A pre-job estimate: every job opens with an agreed credit estimate (a range is fine, say 15 to 25 credits) before spending anything.",
        "A quiet live meter: a small counter ('about 12 credits, pausable') that expands on tap to show the work so far.",
        "A value receipt at the end of a job: credits spent, the estimated savings against a named competitor, and a 'how it did it' explanation.",
        "A dashboard for long-running jobs: budget used, budget total, time remaining, and results delivered, pausing automatically at the budget.",
        "In-chat top-up: 'this needs about 30 credits, you have 12, top up $10?', paid without leaving the chat.",
        "A savings ledger: monthly and lifetime credits spent against dollars saved and hours saved; plus a year-end recap email.",
        "An onboarding job: 50 free credits and 'where are you flying next?' runs one real deep search (about 5 credits), then a panel showing the work done, the routes checked, and the savings.",
        "A 'what does the agent do' panel: each tool in one plain line, with its credit cost per use.",
        "Comparison anchors next to every job offer (for example, AirHelp's 35 percent versus Away's 20; PointsYeah's $90 a year versus 100 credits, $10, for six months).",
        "The pricing bands: cheap 1 to 5 credits (one-shot), medium 10 to 30 (several tools), heavy 50 to 200 (long-running), and big 200 to 1,000-plus (whole-travel-department jobs).",
        "Subscription and billing plumbing for the four tiers, the recurring credit grants, and the separate success-fee track.",
        "The launch calendar: 30 days of events plus three post-launch follow-ups, four act filters, and a channel, metric, and signal for each event.",
        "A six-signal performance dashboard with a green/amber/red grid that gates moving from one act to the next.",
        "A waitlist system with queue-jumping, 50 pre-seeded plus 50 public golden-ticket seats, and a golden ticket for the top 50.",
        "Four ad concepts: 'The tab you never close' (the hero), 'We knew before you asked', 'The visa is not the point', and 'The mood came first'.",
        "The Apple product page: the name (30 characters), the subtitle (30), the 100-character keyword field, the promo text (170), and the first three lines of the description.",
        "Eight App Store screenshots: the hero, the enemy, the agent at work, the honest pricing, the receipts, the business model, member voices, and the invite call-to-action.",
        "Three 30-second preview videos: a negotiation outcome, the agent at work, and receipts scrolling, each with a poster frame that works on its own.",
        "Custom product pages per channel (default, the FlyerTalk and One Mile at a Time crowd, Indian power travellers, and paid Facebook/Google) once the channels scale.",
        "The Google Play listing: an 80-character short description, a 4,000-character full description (which must differ from the short one), a feature graphic, and a YouTube video.",
        "Localised keyword variants, for India: cheap flights, international, USA visa, Europe visa; for the US: miles, points, business class, Amex points.",
        "An A/B test setup for the store page (three variants per test) run in order: the first frame, then the icon, then the subtitle."
      ],
      "keySurfaces": [
        "The credits wallet and balance view, with the monthly amount and carry-over status",
        "The pre-job estimate prompt (cheap versus deep, with a start-cheap-go-deeper option)",
        "The quiet live meter (a corner counter that expands to the work so far)",
        "The value-receipt screen (credits spent, savings versus a competitor, and how it did it)",
        "The dashboard for long-running jobs (the agreed budget, results, and time remaining)",
        "The in-chat top-up flow (pay without leaving the chat)",
        "The savings ledger (monthly and lifetime dollars and hours saved) plus the year-end recap email",
        "The onboarding first-job panel (23 steps, 47 routes checked, you spent 5 credits, beats Google by $180)",
        "The 'what the agent does' catalogue (a one-liner and credit cost per tool)",
        "The plan-selection screen (Free, Traveller, Frequent, Concierge)",
        "The interactive launch calendar (acts, week banners, per-platform copy, reference pop-ups)",
        "The waitlist signup with its queue-jumping and golden-ticket screen",
        "The App Store product page (icon, eight screenshots, three previews, description)",
        "The Google Play listing (feature graphic, short and full description)",
        "The in-app invite-code screen (closing the loop from the eighth store frame)"
      ],
      "moat": [
        "Charging for labour (not the hand-off) is something booking sites structurally can't copy, their whole model is the opposite, so they literally can't say 'we take no affiliate money'.",
        "The power-traveller search niche (award travel, miles and points, fare hacking, FlyerTalk) is low-volume, low-competition, and very high-converting, meaning cheap organic installs booking sites won't fight for.",
        "Specialist know-how encoded from about 200,000 FlyerTalk posts (hidden-city tickets, fuel dumps, married segments, award routing), a long tail Google won't bother to build.",
        "Long-running watch jobs (fare-drop rebook, an award watcher, catching schedule changes) keep the agent quietly present, the retention engine against travel that only happens 2 to 6 times a year.",
        "The web of data from users' trips (saved trips, price alerts, and email-itinerary reading as loss-leaders) compounds the agent's edge over time.",
        "The invite-only 'private club' positioning and the bold brand in a niche make a brand moat the incumbents can't authentically occupy.",
        "The trust and transaction plumbing (ticketing directly through airline systems, about six months of lead time) keeps the margin and owns the customer relationship."
      ],
      "v1": [
        "Validation: run three real jobs (cheap, medium, heavy) by hand for 20 strangers, then ask afterwards if they'd have paid the credit price, this shapes the pack sizes before building anything.",
        "A behind-the-scenes, manually-run bot on Telegram or WhatsApp, with three jobs (watch-and-rebook for 50 credits, award-hunt for 100, filing a delay claim for 500 on success only), $5 for 50 credits, for the first 50 customers.",
        "Ship the Free, Traveller, Frequent, and Concierge tiers, with top-up packs and the three success-fee jobs.",
        "Build the three workflow rules (estimate before, the quiet meter, the value receipt), the long-job dashboard, and in-chat top-up.",
        "The onboarding job with 50 free credits and the after-job 'here's what I just did' panel.",
        "Run the 30-day, four-act, signal-gated launch to a waitlist of 1,000-plus, ending in the day-28 brand film.",
        "Ship the default Apple product page: the settled title and subtitle, the 100-character keyword field, the eight-frame screenshots, the promo text, and the first three lines of the description.",
        "Ship the Google Play listing with the 80-character short description and the feature graphic (the wordmark plus the bold line, the lowest-risk option).",
        "Run the first-frame A/B test first (three headlines by three visuals) as the biggest conversion lever.",
        "Commit to an app-store-optimisation tool (like AppTweak, about $80 to $200 a month) to get keyword volume and difficulty scores."
      ],
      "v2": [
        "The savings ledger as a full retention tool, plus the year-end recap email (aiming to show Frequent-tier users 50 to 100 times their money back).",
        "Comparison anchors next to every job offer (against AirHelp, PointsYeah, and point.me).",
        "Channel-specific product pages (the FlyerTalk and One Mile at a Time crowd, Indian power travellers, paid Facebook/Google), each emphasising different frames.",
        "The Indian product page: the receipts frame in rupees, Indian member testimonials, and Indian press (Live From A Lounge, Indian Travel Tribe) in the description.",
        "Three 30-second preview videos (a negotiation outcome, the agent at work, receipts) with poster frames.",
        "The icon and subtitle A/B tests, in order, once the first frame is settled.",
        "Localised keyword variants for India versus the US, then Hindi, Spanish, and Mandarin to be decided.",
        "Decide on the transaction layer: start conversations with airline ticketing systems (about six months' lead) to ticket directly and keep the margin.",
        "Post-launch follow-ups (days 31, 34, 38) and the 'pivot like a gazelle' content.",
        "A promo-text playbook for time-sensitive moments (mistake-fare windows, holiday peaks, responding to disruption news)."
      ],
      "northStar": [
        "Credits as the single currency for the agent's work across the whole trip (find, vet, book, watch, rescue, remember), not just flights.",
        "The agent as your travel department: big jobs (a year-long status run for 300 credits, an open 'get me to Tokyo in business on miles in 90 days' hunt for 400).",
        "A savings ledger so credible that every member sees 50 to 100 times their money back a year, making the credit spend obviously worth it.",
        "Own the transaction layer end to end (ticketing directly) so Away keeps the margin and the customer relationship, not affiliate scraps.",
        "Defensible against the coming wave of AI travel agents (Booking, Expedia, Kayak, Hopper, Google, OpenAI) through the data web, the power-traveller toolkit, the trust plumbing, and the niche brand.",
        "Scale across markets (US miles-and-points plus international-from-India) with localised stores, product pages, and press."
      ],
      "metrics": [
        "Credit economics: the measured cost per query (the AI, flight data, and servers) against the credits charged, aiming for a profit or a clear path to one.",
        "20 real paying users (not friends or investors) in the first 30 days; the query-to-booking conversion; a satisfaction score; and a log of failures.",
        "The trust threshold: a stranger hands the agent their card and lets it transact (the chasm, until then the business is unproven).",
        "Retention through long-running jobs (staying quietly present against travel that only happens 2 to 6 times a year).",
        "Savings-ledger payback: 50 to 100 times their money for Frequent-tier users; if not, the pricing or the agent is wrong.",
        "Launch: a waitlist of 1,000-plus by day 30; 50 founder messages as the gate into act two; a channel, metric, and signal target per event; and the six-signal decision grid.",
        "App-store discoverability: keyword ranking (top 10 is page one), impressions per keyword, the split between branded and unbranded installs, and the Travel category rank.",
        "App-store conversion: the install rate (as an illustration, 30 percent versus 60 percent on 1,000 organic views a day is 300 versus 600 installs, at zero spend)."
      ],
      "openQuestions": [
        "Which of the three credit models wins (charge for the compute, share the savings, or a hybrid), Away leans towards charging for compute and the hybrid, but it's unproven.",
        "Which single job people pay for again and again (the irreplaceable use case), 'that's the company'.",
        "Whether to ticket directly (keep the margin, own the relationship, about six months of lead through airline systems) or stay search-and-handoff (an affiliate $5 to $15 a booking, which makes credits hard to justify).",
        "The support load when things go wrong (a wrong flight, a failed rebook, a denied claim), AI often increases support because people blame the agent.",
        "A real 'last week we saved travellers $X' figure for the receipts frame, a placeholder until it's real, falling back to a single-trip win.",
        "Three real member testimonials with consent (handle, face, quote, verified savings) for the member-voices frame, to be sourced from the early-user pool.",
        "Real keyword volume and difficulty data, blocked on choosing an app-store-optimisation tool.",
        "Launch open items: creators for day 24, a venue and permits for the day-27 projection, a visa officer on retainer, consent for user-generated content, and the budget for the brand film and outdoor ads.",
        "Whether the pack sizes and prices are right, to be settled by the 20-stranger pricing test before building."
      ],
      "risks": [
        "Being honest about the early stage: probably only 'the tech works' plus partly 'the quality works', with the economics and trust still unproven; don't pretend otherwise.",
        "The moat eroding within 18 months as Booking, Expedia, Kayak, Hopper, Google, and OpenAI all ship AI travel agents, so the moat has to be the data web, the toolkit, the trust, and the niche brand.",
        "The affiliate trap: search-and-handoff caps what you can earn at $5 to $15 a booking, which makes credits hard to justify.",
        "Surprise bills kill trust faster than anything else, so estimating before is non-negotiable.",
        "Pure pay-as-you-go means anxiety and no recurring revenue; pure subscription lets the heaviest 5 percent of users destroy the margins, hence the hybrid.",
        "The retention risk: travel is occasional, so without long-running watch jobs there's no reason to keep the app around.",
        "App-store compliance: rival app names in the keyword field, anonymous testimonials, and press logos or superlatives in the graphics all risk rejection by Apple or Google.",
        "Shipping the receipts frame or the testimonials with placeholder, un-real content would read as marketing fluff and break the 'receipts, not boasts' positioning.",
        "The launch is signal-gated, so missing a gate (say, 50 messages) stalls the move to the next act."
      ],
      "sources": [
        "Claude/Credits & Monetization/2026-05-08_away_credits_monetization.md",
        "Claude/Credits & Monetization/2026-05-08_away_credits_pricing_workflow_education.md",
        "Claude/Business/2026-04-24_gtm-roadmap-integration.md",
        "Claude/App Store & ASO/2026-05-27_aso_framework_and_8_screens.md"
      ]
    }
  ],
  "synthesis": {
    "oneLiner": "Away is an India-first AI travel agent you keep, the friend who just got back from that exact trip, that finds, vets, books, watches, and rescues your whole journey, winning for you against an industry built on confusion.",
    "execSummary": [
      "Away owns the whole trip, from dreaming about it to remembering it (12 stages), plus a disruption-and-rescue lane running across all of them, an agent that finds, vets, books, watches, rescues, and remembers, not a search box you use once.",
      "The wedge is the verdict: the same fare data every booking site has, turned into a point of view it can defend, which flights are worth your time, which are traps, the one the agent would book, earning the right to say 'skip it.'",
      "India-first by design: every fact is grounded in the real rules (the regulator's 48-hour free-cancel, the 5 and 18 percent tax tiers, the Rs.75,000 duty-free limit, denied-boarding pay up to Rs.20,000), a local grounding foreign agents lack.",
      "Two rules run through everything: the co-pilot rule (the agent prepares and hands off, never auto-books) and protect-don't-sell ('skip it' beats 'book now'), the opposite of a booking site's incentive.",
      "It makes money from labour, not affiliate kickbacks: a credits system (one credit is ten cents) across four tiers, with the estimate-before, quiet-meter, and value-receipt discipline, which booking sites structurally can't copy.",
      "Trust-building bold moves anchor the product: ticket-first, pay-after (a real ticket, 24 hours with no penalty), the built-in passenger-rights engine ('you're owed X'), and a generous invite-gated free tier where the whole agent is free and only booking needs an invite.",
      "The launch is a 30-day, signal-gated 'private club' rollout to a waitlist of 1,000-plus, ending in a day-28 brand film.",
      "The build is a generation engine that composes each screen from a kit of vetted blocks plus a verified source of truth, bespoke at the edge and consistent at the core, so the agent can display truths but never invent one."
    ],
    "problemWhyNow": [
      "Indian travel is a 12-stage obstacle course where confusing rules, mental traps, and scattered tools punish travellers at every step, and no product owns the whole trip.",
      "Two layers of problem: one, hard facts and rules people get wrong (visa validity, cancellation windows, tax tiers, duty-free limits); two, unconscious biases and folk wisdom (the incognito myth, 'Tuesday is cheapest', not knowing a self-transfer has no protection, chasing a budget airline's headline fare).",
      "Anxiety spikes when checking, deciding, and during a disruption are the highest-leverage moments, the agent earns trust by resolving fear, not just doing tasks.",
      "Travellers leave protections on the table: denied-boarding cash up to Rs.20,000, meals and a hotel owed even in fog, baggage limits, and delay rights most never claim.",
      "Why now: Airbnb's 2026 summer release proves the idea at scale (booking a stay becomes owning the whole trip); the wave of AI travel agents (Booking, Expedia, Hopper, Google, OpenAI) is about 18 months out, so the data and trust moat has to be built first.",
      "An India-specific signal: 73 percent of about 11,000 Indians surveyed believe fares move when they search again, and 51 percent avoided an airline over safety in the past year, the us-versus-them instinct the product taps into.",
      "The main thing stopping people booking is confidence in the decision, not price or availability, and no incumbent will spend its own credibility to talk you out of a bad flight, because their incentive is to sell."
    ],
    "visionPrinciples": [
      "Identity: Away is 'the friend who just got back from that exact trip', not a search engine, an assistant, or a booking site with a chatbot skin; every line of copy must pass 'would you text this to a friend?'",
      "The co-pilot rule (the master constraint): the agent prepares, recommends, and hands off, no auto-booking, no rebooking without your explicit confirmation, you always make the final call.",
      "Protect, don't sell: the warning is the highest-trust moment; the agent spends its own credibility to steer you off a cheaper-but-worse option ('one in four miss this connection').",
      "The enemy is the system (booking sites, dark patterns, the cheapest-not-right algorithm), never the user, the warmth flows to the traveller, the edge flows to the incumbents, and the dial goes all-warmth, zero-edge in a real crisis.",
      "The house rule: charm and clarity never share a sentence, personality lives in the greetings, the waits, and the wins; buttons, errors, and anything touching money stay plain and calm.",
      "Specifics are intelligence, and lead with the verdict: open with the number and the conclusion ('8 flights, 3 worth your time'), not the process, and no claim without a traceable source.",
      "Silence beats a wrong opinion: hide rather than guess, the agent shows up only when there's something worth saying, and never invents a baseline the user would trust.",
      "Negotiation is the thread that runs through: the same muscle that beats the fare at onboarding rescues you when the trip breaks, onboarding plants it, the rescue pays it off."
    ],
    "theMoat": [
      "The verdict itself: the same public fare data turned into a defensible 'skip it' no booking site dares give, judged on warning precision (target 90 percent or more) and powered by real-cost-after-penalties ranking the incumbents structurally won't ship.",
      "Away's own price-history baseline for each route, built up from every logged search, something no vendor sells, powering the below-market-floor call, buy-now-versus-wait, and a learning loop.",
      "India-first ground truth: a 27-agent research process producing web-verified rules and behaviour insights (it caught that the duty-free limit is Rs.75,000, not Rs.50,000, and that the over-allowance is about 38.5 percent, not a flat 10) plus the India-specific data stack.",
      "The built-in passenger-rights engine, 49 claims verified against primary sources across 8 countries (India, the EU, the US, and the international treaty's live ceilings), powering a proactive 'you're owed X' almost no booking site does.",
      "Knowing where you are in the trip as the integration moat: owning find, vet, book, watch, rescue, and remember makes add-on services helpful instead of spam, timed by an agent that knows the stage you're at.",
      "Voice as the moat that ships in every sentence: the warm-but-sharp blend (the enemy is the system, not the user) is structurally uncopyable by incumbents whose incentive is to sell, not protect.",
      "Charging for labour, not the hand-off: booking sites literally can't say 'we take no affiliate kickbacks' without breaking their own model.",
      "The generation engine's checker and source-of-truth layer (value validation, treating a missing honest state as an error, the dark-pattern check) has no precedent, the agent can display a fact but never invent one."
    ],
    "investorAngle": [
      "Market: every Indian international and domestic traveller, entered through a power-traveller wedge (FlyerTalk, r/awardtravel, One Mile at a Time) where one happy user is worth about three to five referrals over a year.",
      "Wedge: own the whole trip deep, not wide, start at the high-anxiety find-vet-decide core where the verdict stands out, then expand outward, rather than grabbing all 12 stages thinly.",
      "Why now: Airbnb's 2026 release is the biggest-scale proof of the idea; the AI-travel incumbents are about 18 months from shipping, so the data, trust, and rights moats have to start compounding first.",
      "Business model: a credits system that charges for the agent's work, one credit is ten cents to the customer at about four to six cents cost, across Free, $9, $29, and $99 tiers, top-up packs, and win-only success fees (a delay claim at 20 percent versus AirHelp's 35).",
      "The launch is a capital-light, 30-day, signal-gated 'private club' rollout to a waitlist of 1,000-plus, with no in-person party.",
      "Defensibility against the coming wave: the web of data from trips, the power-traveller toolkit (hidden-city tickets, award routing from about 200,000 FlyerTalk posts), the built-in rights engine, and the invite-only bold brand.",
      "Margin path: own the transaction layer by ticketing directly (through airline systems, about six months' lead) so Away keeps the margin and the customer relationship instead of $5-to-15 affiliate scraps.",
      "App-store edge: a low-volume, low-competition, very-high-converting power-traveller keyword niche booking sites won't fight for, cheap organic installs at near-zero spend."
    ],
    "northStarMetric": "Caught-before-it-hurt, the number of trips where Away's verdict or watch steered the traveller off a flight that later hit the warned problem, or recovered money or rights they'd otherwise have lost (regret prevented, made measurable). It's the single number that proves the protect-don't-sell promise, compounds the price-history and rights moats, and only an agent that owns the whole trip can move.",
    "roadmap": {
      "v1": [
        "Anchor on the verified 12-stage map of jobs and ship the high-anxiety core deep, not wide: find, vet, and decide, where the search work is already designed.",
        "The vet-and-verdict (the moat) on available data only: '{N} flights, {M} worth your time', the ruled-out-traps list, the single defended pick with named rejections, at most two tags, the four-axis why-this breakdown, and warning precision of 90 percent or more.",
        "The search flow: read the intent, one editable ticket, at most one question about dates via the price strip, a working receipt, then ranked results; the estimate-to-verified promise ('the floor we show is the floor we can book'); the price-by-stops and price-by-time-of-day strips; and no absolute low, typical, or high until we have price history.",
        "Deep Search: re-negotiate the price and rules on your shortlisted flights with wholesale suppliers (a background job, five-minute deadline), the trips-as-hero progress screen, the final bottom-sheet reveal, and a savings counter in rupees.",
        "Onboarding and the adaptive home: the five-screen intro, sign-in, and the invite-gated free tier (the whole agent free, three real fares shown and the rest locked, the gate on the Book tap with a code or a WhatsApp referral); a location-only cold start; the typed and forwarded doors; and the self-composing search box with its fixed core and one swapping highlight across all 7 personas.",
        "Book and Payments: ticket-first, pay-after (a real ticket once you verify the code, a 24-hour no-penalty self-cancel), the show-the-work loading, the hold-framed price, the named payment method, and the price calendar as the agent's calendar-tool output.",
        "Trip, watch, and rescue (v1): the calm Trip tab (separate bookings shown as one trip), per-leg status chips, inline luggage, the email-reading card, and automatic web check-in three days out; the decision-mode disruption screen (the seven-part shape) with the Indian rights line and a calm, practical voice; and the watch offer (about 50 credits over 90 days) ending every first session.",
        "The generation-engine foundation: formalise the block kit and its machine-readable contracts, ship the three reference contracts (the verdict card, the price landscape, the disruption takeover) and the checker on one high-variance stage, tested against the known failure list.",
        "Foundations: the settled four-tab structure (Home, Trips, Negotiate, Refer) with the full India-tuned home screen, dark-only named tokens, and the vet screen rebuilt on clean tokens.",
        "Business: the credits ledger, four tiers, top-ups, and the success-fee track, the estimate-before, quiet-meter, and value-receipt discipline, 50 free credits, the 30-day signal-gated launch to a waitlist of 1,000-plus, Apple and Google store pages with the first-frame A/B test, and validating willingness to pay on 20 strangers."
      ],
      "v2": [
        "Extend coverage to the book, watch, and prepare stages: currency-conversion-markup warnings, capturing your tax ID before ticketing, arming a travel SIM in advance, a calibrated leave-by time, and automatic web check-in for the best free seat.",
        "Activate the watch fully: quietly turning a schedule change into a credit, monitoring ticket changes, and buy-now-versus-wait verdicts; a days 1, 7, and 30 rhythm that honestly reports 'nothing changed'.",
        "Stand up the rights engine internationally (the EU and UK, the US, and the international treaty's live ceilings) and the after-trip 'claim what you're owed' screen; the decision-mode disruption with its calm-to-decision morph.",
        "The vet's extra data lands: the regulator's monthly performance, per-flight on-time history, reading the fare rules to speak the penalty in rupees, and the price-history baseline getting dense enough for below-market-floor and buy-or-wait badges.",
        "More search depth: the price-by-date and price-by-trip-length strips (once the feeds exist), penalty-adjusted ranking, a tight-connection risk gate, the work ledger, and iOS Live Activity with a parked-searches tray.",
        "The generation engine generalised across all 12 stages via the templates, with the voice dial and honest states everywhere, the replay and visual-regression setup, user overrides saved to the learned brief, and operational discipline.",
        "Book: ship the full animated pay-after sheet (the draft boarding pass and its self-completing payoff); Trip: connection watching (airline data plus airport walk times), more marketplace depth (lounge and card, Digi Yatra, duty-free), and the after-trip recap.",
        "Users and home: the surprise-me door if typed-search conversion is weak, paste-a-screenshot intent, home variants for every state, after-booking jobs surfaced per type of user, and the ranking weights locked from real behaviour.",
        "Business: the savings ledger and year-end recap (aiming for 50 to 100 times their money back), comparison anchors on every job, channel-specific product pages (the FlyerTalk and One Mile at a Time crowd, Indian power travellers), India keyword localisation, and starting direct-ticketing conversations.",
        "Foundations: rebinding the remaining original screens one by one, clearing out the forked-file clutter, retiring the old colour scales, and finishing the tier ladder and the live wins feed."
      ],
      "northStar": [
        "Search disappears: the agent holds a standing brief and proposes trips before you ask, the main screen is one justified trip, and the alternatives are whole trips, not fares.",
        "A trip that watches itself and handles disruption end to end, detects, auto-files the delay claim, rebooks, and surfaces only the one decision you must own, across every country the traveller touches.",
        "Close the loop at 'remember': track and use up flight credits before they lapse at a year, claim missing miles after the fact, keep the proof every later claim needs, and re-check your regular rebookings.",
        "Guarantees as a real product: rebook on a schedule change, refund on reasonable cause, so you're buying the absence of future pain, not a fare.",
        "Credits as the single currency for the agent's work across the whole trip; the agent as your travel department for open jobs ('get me to Tokyo in business on miles in 90 days').",
        "Own the transaction layer end to end (ticketing directly) for the margin and the relationship, defensible against the AI-travel wave through the data web, the power-traveller toolkit, the rights engine, and the niche brand.",
        "The generation engine opens up at the edge while crystallising at the core: every behavioural bias gets its own gentle correction, generated for the exact person and moment, with a house style that emerges from the winners.",
        "The trusted default that heads off every rule trap and mental mistake before the traveller can make it, at scale across markets (US miles-and-points plus international-from-India)."
      ]
    },
    "topRisks": [
      "Rules go stale fast (the US amounts changed in Jan 2025, the treaty ceilings in Dec 2024, plus regulator revisions and tax, customs, and visa changes), and one wrong number erodes trust at the exact moment the agent claims authority; the live layer must re-verify itself, and several countries (Saudi Arabia, the Gulf airlines, Canada's amendments) are unverified and must not be quoted.",
      "Crying wolf: one wrong 'skip it' poisons every future warning, so the whole moat rests on the 90-percent precision target, the two-tag ceiling, and watching how often warnings get dismissed.",
      "Over-promising rights or cash where none is owed (an EU payout to an Emirates Dubai-to-London passenger, any fixed cash in Australia or the Gulf, claiming an airline is obliged when the tickets are separate) directly contradicts the verified rules and breaks protect-don't-sell at the worst moment.",
      "Owning all 12 stages is a wide surface, and under-serving some leaves visible gaps that undercut the 'owns the whole trip' promise; v1 must go deep on find, vet, and decide, not thin everywhere.",
      "A confidently wrong screen (a wrong fare, a bad button) is the worst failure for a fare agent, guarded only by value checks and the source of truth, not by allow-lists; hiding rather than guessing covers missing data, not wrong data.",
      "Voice is the product in a conversation-first app: a single badly-worded recommendation, a bold joke during a payment or a crisis, or a gap between the loud launch promise and the calmer product breaks core trust.",
      "Being honest about the early stage: only 'the tech works' and partly 'the quality works' are proven, the economics and the trust chasm (a stranger handing the agent their card) are unproven; surprise bills kill trust faster than anything else, so estimating before is non-negotiable.",
      "Thin spots in the data: domestic search is untestable from the current data, we have no India fare-swing data, the true ticket structure isn't available (so self-transfer stays a guess), and the price-history baseline starts empty, so many flagship claims must ship hidden until the feeds arrive."
    ],
    "gaps": [
      "No single owner for the cross-cutting 'live re-verification' system, every pillar assumes the rules, exchange rates, and fare baselines stay fresh, but the freshness service, how often it runs, and who owns it are all unspecified.",
      "The automated-versus-co-piloted split isn't settled per stage, the co-pilot rule is universal, but which stages get a hands-on collaborative zone versus full automation is still open.",
      "The direct-ticketing decision (through airline systems, about six months' lead) is unresolved and blocks the booking stage's mechanics, the lifetime-value maths, the margin, and whether the credits model is even justifiable versus an affiliate hand-off, a foundational business fork still open.",
      "The ranking weights (40/35/25), the 'worth your time' quality bar (about 65), the per-axis floors, the expected-regret threshold, and the minimum below-public-savings size are all assumed defaults needing real behaviour and outcome data to lock.",
      "A free-tier contradiction is unresolved: 'the whole agent is free' versus the gated three-fare teaser must be reconciled so the copy never contradicts itself; and when a referral counts (install, signup, or first search) is also unconfirmed.",
      "The persona model is incomplete (two are confirmed, the third is the user's to supply) and the voice framework is explicitly flagged to be recalibrated against real user language after the first roughly 1,000 conversations.",
      "Disruption scope is ambiguous: does Away actually rebook you or just send you to the airline, which decides whether the rescue is real or a polite redirect, and the same uncertainty hits what Pay with Away is, Digi Yatra, and the duty-free integrations.",
      "The support load when things go wrong (a wrong flight, a failed rebook, a denied claim) isn't modelled, AI agents often increase support because people blame the agent, and there are still undesigned gaps for half-states (delayed but the connection is uncertain) and two decisions at once (a disruption plus an expired passport)."
    ]
  },
  "flightIndex": {
    "title": "AWAY Flight Index, Build-Ready Spec for the Flight-Quality Intelligence Engine (Vet/Verdict moat)",
    "summary": "The Flight Index is the engine behind the vet step: it takes the same fare and schedule data every booking site has, groups and de-duplicates it, works out quality signals, scores each flight on four things (price, time, flexibility, comfort) against a real baseline, catches the traps you would most regret, and produces a point of view it can defend (the verdict, the marks, the trap flags, the tags, and one recommendation). It is the moat because the one number it is judged on is how often its warnings are right (target 90 percent or more): the right to be believed when it says \"skip it\" is what no cheapest-sort competitor can copy, and because the price-history baseline it builds up from search logs is a dataset no vendor sells. By default it stays silent, the bar for praise is higher than for a warning, and the overall score it ranks flights by is never shown to the user.",
    "dataInputs": [
      {
        "name": "fare booleans: refundable / changeable",
        "availability": "NOW",
        "note": "Per-fare booleans in both payloads. Drive FLEX ordinal ladder and the brutal-Saver gate. On supplier disagreement (IX-865: refundable true per Cleartrip/TBO, false per Riya/Tripjack) take the conservative value and lower that fare's FLEX confidence; suppress any opportunity tag."
      },
      {
        "name": "schedule timestamps (ISO8601 + tz offset), stops, segments",
        "availability": "NOW",
        "note": "Powers all TIME signals (fastest, long-way-round, only-non-stop, land-fresh, lose-tomorrow, red-eye, next-day) and duration anchoring. Parse local times correctly off the offset."
      },
      {
        "name": "segment airport IATA codes (arr_apt[i], dep_apt[i+1])",
        "availability": "NOW",
        "note": "change_airport_trap is a hard FACT when arr_apt[i] != dep_apt[i+1] (found 14x in real sample). The only connection-structure signal allowed to ASSERT at full strength; gates at regret_weight 1.0."
      },
      {
        "name": "terminals + layover_minutes (regular search-response.json)",
        "availability": "NOW",
        "note": "sprint_between_terminals and coarse tight_to_make. Regular search payload carries terminals/layover/multi-segment routing the deep-search payload lacks; use both sources."
      },
      {
        "name": "checkin_baggage string + supplier_session.baggage[] ladder",
        "availability": "NOW",
        "note": "hand_baggage_only_trap, bag_friendly, bag_gap (cheapest checked-bag add-on). Needs a normalization map (NIL/None/Paid... -> no-checked-bag). On baggage conflict across suppliers, SUPPRESS bag_gap entirely rather than guess a 3,000 demotion."
      },
      {
        "name": "supplier_session: is_lcc, meals_included",
        "availability": "NOW",
        "note": "bare_bones_lcc (neutral expectation-setter), meal_included. Deep-search payload."
      },
      {
        "name": "original_price vs negotiated_price (off-market savings)",
        "availability": "NOW",
        "note": "SECONDARY and magnitude-gated. Real sample savings were 131/133/0 (max 0.94%) so it never anchors the hero; surfaces only above the materiality floor [confirm >=1,500 OR >=5%]. Validate original_price against min(supplier original, route median) so a struck-through anchor can't be inflated."
      },
      {
        "name": "P_change population prior (0.18) for penalty-adjusted effective price",
        "availability": "NOW",
        "note": "effective = price + P_change*change_penalty + bag_gap. NOW uses a flat absolute proxy penalty (3,000-5,000 for non-changeable, NOT 0.30*price which injects phantom penalties on premium fares); the proxy reorders only and is never spoken as a number."
      },
      {
        "name": "seats_available (scarcity)",
        "availability": "NOW",
        "note": "Suppressed by design. Score-only at lowest weight; never surfaced as copy (voice forbids '1 seat left'). Capped sentinel data."
      },
      {
        "name": "Own route price-history baseline (search-log)",
        "availability": "SOON",
        "note": "THE MOAT. Powers below_market_floor, at_the_floor, buy-now-vs-wait, and the absolute price anchor. No vendor sells it; it compounds from day-one search logging. Until dense, PRICE ceiling is capped and below-floor claims stay silent."
      },
      {
        "name": "ParsedFareRules / PolicySummary penalty amounts",
        "availability": "SOON",
        "note": "The spoken change/cancel rupee figure (penalty_size, flexible_low_fee). Backend fare-rules parse, the missing server step. Until then FLEX is boolean-only and copy says 'non-refundable', never a fabricated figure."
      },
      {
        "name": "DGCA monthly performance (airline x metro x month)",
        "availability": "SOON",
        "note": "often_delayed, holds_up_well, high_cancellation. Free PDF. Grain caveat: copy MUST say 'across its network', never route x time (f_density x0.6). First enrichment to stand up."
      },
      {
        "name": "Per-flight historical OTP (Cirium/OAG; AeroDataBox/AviationStack budget)",
        "availability": "SOON",
        "note": "Route x carrier x time on-time, delay_distribution. Enterprise $. Enables the distribution-aware on-time signal at honest grain."
      },
      {
        "name": "Schedule equipment code + seat-product sub-fleet table",
        "availability": "SOON",
        "note": "new_aircraft, real_legroom/lie_flat, tight_cabin. Aircraft is 0/282 populated NOW so these comfort tags do NOT exist day one; silent when sub-type ambiguous."
      },
      {
        "name": "IATA SSIM Ch.8 MCT table",
        "availability": "SOON",
        "note": "Precise tight_to_make and the misconnect proxy. NOW uses coarse defaults (domestic 60 / intl 120 min) with hedge."
      },
      {
        "name": "Inbound-tail + live status (AeroDataBox/FlightAware)",
        "availability": "SOON",
        "note": "inbound_aircraft_risk, the novel pre-purchase disruption signal (the plane is already late on its prior leg)."
      },
      {
        "name": "Lounge/airport-quality + Google Travel Impact Model",
        "availability": "SOON",
        "note": "stretch_stop/stuck_at_the_hub (LoungeReview + curated top-10 India hubs); carbon_estimate (TIM API, free). Metros only."
      },
      {
        "name": "True PNR structure (same-PNR vs separate-ticket)",
        "availability": "COLD",
        "note": "The biggest blocker. Modeled in deepSearchTypes.ts, absent from payloads. self_transfer_risk and protected_connection stay INFERENCE-only (capped 0.7, hedged copy) until an NDC/GDS feed exposes it. Drives the whole self-transfer promise, favor NDC/GDS over scrapes."
      },
      {
        "name": "Visa-rules lookup (nationality x routing x transit-airport)",
        "availability": "COLD",
        "note": "transit_visa_required field is false in 200/200 occurrences; absence is not safety. visa_transit_trap drops off the day-one set; only ever a hedged 'may need a transit visa, confirm', never asserted, never a gate."
      },
      {
        "name": "True realized mis-connect %; operating-vs-marketing carrier",
        "availability": "COLD",
        "note": "one_in_four_miss_this uses a (buffer-MCT)*OTP proxy until Cirium/FA historical at scale; operated_by is 0/100 populated so operated_by_clarity needs codeshare schedule data."
      }
    ],
    "subScores": [
      {
        "axis": "Price",
        "what": "score_low(effective) blended 0.45 with a market/history anchor at 0.55 once the baseline exists. effective = total_amount + P_change*change_penalty + bag_gap (bag_gap only when baggage unambiguous). Baggage true-cost is owned by PRICE alone (R5).",
        "basis": "ABSOLUTE-anchored to route price-history median/floor with a tolerance band to the route 'poor' value, NOT within-set min-max. A flight 40% over route median scores low even if it is the cheapest in the cluster. Set-relative position breaks ties only. PRICE ceiling is CAPPED when savings are small and there is no history (never 100 on an unanchored rip-off)."
      },
      {
        "axis": "Time",
        "what": "clamp(0.55*duration_score + 0.45*arrival_fit - red_eye_penalty(12 if red-eye and not sleepable) - next_day_penalty(8)). Under Time lens arrival_fit takes 0.55 (people mean 'fits my day'). arrival_fit curve: 06-11=100, 11-17=85, 17-21=70, 21-24=45, 00-05=20.",
        "basis": "duration_score = score_low(total_duration_minutes) ABSOLUTE-anchored to the route shortest-feasible duration, within the {arrival metro, cabin} cluster. arrival_fit is a FIXED curve, not relative to the set."
      },
      {
        "axis": "Flex",
        "what": "flex_base ordinal ladder: 95 refundable AND changeable / 70 changeable not refundable / 45 not changeable + has_free_hold / 25 neither. flex_score = clamp(flex_base +/- 5 ladder_adjust). With [SOON] amounts: flex_base - score_high(change_penalty)*0.3 so 299-to-change beats 3,999-to-change.",
        "basis": "ABSOLUTE ordinal anchored to fare-config archetype (Corporate/Saver/Flexi/Upfront), boolean-only today at low axis confidence (about 0.5). Cluster position is a +/-5 tie-break only. On supplier conflict take the less-favourable boolean and lower FLEX confidence."
      },
      {
        "axis": "Comfort",
        "what": "50 (neutral base) + sum of available component deltas, each set-bounded and weighted by component confidence; clamp 0-100. Components: stops (non-stop full, each stop -18), layover quality [SOON], aircraft [SOON], seat product [SOON], meals [NOW], LCC [NOW], red-eye sleepability [NOW]. Baggage is NOT a comfort component (R5).",
        "basis": "ABSOLUTE neutral-base-plus-deltas with graceful degradation: each component drops out when its data is missing (excluded, not zeroed). Realistic NOW state (stops+meals+LCC+sleepability only) computes at axis confidence about 0.4; the engine never invents aircraft/seat comfort and stays factual ('non-stop, bags included') rather than opinionated ('most comfortable')."
      }
    ],
    "composite": {
      "how": "AwayScore = Sum_axis[ w_axis * conf_axis * subscore_axis ] / Sum_axis[ w_axis * conf_axis ]. Dividing by Sum(w*conf) makes degradation honest: a missing axis drops out of both numerator and denominator so the score stays on a true 0-100. w_axis is the lens preset (dominant axis about 0.5-0.6, others NEVER zero): Balanced .35/.30/.15/.20; Price .60/.18/.10/.12; Time .18/.55/.10/.17; Flex .20/.18/.47/.15; Comfort .18/.22/.10/.50. The lens is a weighted blend, never a single-axis sort (a Price lens that ignores a 1-in-4-miss connection is the exact trap the product beats). conf_axis from the multiplicative confidence ladder. The four named sub-scores always travel with the composite so any verdict decomposes to a sourced reason ('fastest to Chicago, but locked-in'), never 'Agony 7.2'.",
      "shownToUser": false,
      "note": "The composite lives ONLY server-side as a ranking key. Reasons it is never surfaced: (1) a score is the adjective dressed as a number, violating 'specificity is intelligence'; (2) the Hipmunk failure, an opaque composite hides which axis hurts; (3) it launders confidence ('87' reads equally certain across a search where confidences differ wildly); (4) it invites mis-sorting back to the trap; (5) it structurally cannot carry a warning, a 92-scoring flight can be a hard-gated trap. The user meets the verdict line, the marks, <=2 lens-aware tags, the pick with three reasons + a named rejection, and on expand a four-axis baseline-bar breakdown."
    },
    "hardGates": [
      {
        "gate": "Expected-regret gate (the master rule)",
        "trigger": "P(problem) * regret_weight >= gate_threshold. Catastrophe-class (regret_weight 1.0) gates at P >= about 0.4 [confirm], so an INFERRED self-transfer at P=0.6 still gates even though copy stays hedged. Decouples WHETHER we gate the ranking (driven by expected cost) from HOW certain the copy is (driven by confidence).",
        "action": "Cap the bucket at TRAP: disqualify from the worth-count AND from being the pick. The flight still appears (browsable) flagged with its reason and keeps a computed composite used for nothing, so the gate VISIBLY overrides the number rather than zeroing it. Gates are LENS-INVARIANT, no weighting rescues a gated flight, and the Price lens is where users get lured so it protects hardest there."
      },
      {
        "gate": "Change-airport connection",
        "trigger": "arr_apt[i] != dep_apt[i+1] (different IATA codes). A FACT, Pabout 1.0, regret_weight 1.0.",
        "action": "TRAP. Copy ASSERTS at full strength ('lands EWR, leaves JFK, a taxi across new york on you'). The one connection-structure signal allowed to assert."
      },
      {
        "gate": "Self-transfer / different-PNR",
        "trigger": "mixed carriers + tight layover + no protected flag. INFERENCE (true PNR is COLD), P capped <=0.7, regret_weight 1.0 -> gates at P>=0.4.",
        "action": "TRAP, but copy HEDGES ('looks like two separate tickets, confirm before booking'). Gates the ranking while keeping the voice honest. Drives the whole moat; favor an NDC/GDS PNR source."
      },
      {
        "gate": "Tight to make",
        "trigger": "layover < MCT (coarse domestic 60 / intl 120 min NOW, IATA SSIM SOON). regret_weight 1.0.",
        "action": "TRAP. Asserts when an MCT reference exists; hedges on the coarse default."
      },
      {
        "gate": "Brutal-penalty Saver",
        "trigger": "not changeable AND not refundable AND badged 'Lowest Price'. regret_weight 1.0.",
        "action": "TRAP unless the user explicitly chose the cheapest-floor sort. The Saver name 'lies by omission' without its penalty; an amber fact chip ('3,999 to cancel') rides in fare detail."
      },
      {
        "gate": "Material-class cap (not a full gate)",
        "trigger": "often-delayed / hidden-costs / above-market at high P. regret_weight 0.6.",
        "action": "Caps the composite (e.g. min(score, 50)), NOT a flat -8 a good price can absorb. Demotes hard but does not force TRAP."
      },
      {
        "gate": "Vibe-class (soft only)",
        "trigger": "rough-sleep / stuck-at-hub. regret_weight 0.3.",
        "action": "Soft penalty within the score only; never the only thing between a trap and 'worth your time'."
      }
    ],
    "confidenceLadder": [
      {
        "level": "Opinionated (a verdict)",
        "when": "conf >= 0.75 AND a consequence exists to act on. The pivot to opinion is the CONSEQUENCE, not confidence alone, high confidence is necessary, a consequence is what makes it an opinion.",
        "behavior": "Speak a verdict: 'skip the savings', 'tight to make', 'self-transfer, no airline covers the miss'. Praise/opportunity holds to a higher bar (>=0.78) because over-claiming ('worth the splurge' that's wrong) is a betrayal."
      },
      {
        "level": "Factual + specific",
        "when": "conf >= 0.55, high confidence but no clear judgment to render.",
        "behavior": "State the number, no adjective: '94% on-time', 'new A350', 'non-stop, 3h 55m'. Numbers carry their own caveat. Must carry the exact evidence string it displays (the number, the airport, the source), no number, no claim."
      },
      {
        "level": "Hedged warning (the bought-down band)",
        "when": "0.55 <= conf < 0.75 for a safety/money warning (regret_weight 1.0/0.6). Warnings fire at a LOWER bar (0.55) than praise because a missed landmine costs more than a hedged caution.",
        "behavior": "Warn but hedge, the hedge IS the honesty: 'looks like a self-transfer, worth confirming', 'may need a transit visa, confirm'. Maps exactly to fact-vs-inference: change-airport (fact) asserts at full strength; self-transfer (inference) hedges. Warning precision target >=0.90; precision <0.85 auto-raises that signal's own bar."
      },
      {
        "level": "Silent",
        "when": "conf < 0.55, OR a comfort/vibe warning below 0.75, OR no consequence worth a slot, OR a non-discriminating axis, OR below-market with no dense baseline.",
        "behavior": "Nothing renders. A dropped tag still feeds the score, just not the copy. Silence beats a wrong opinion: one wrong 'skip it' destroys trust faster than ten cautious tags help. Cold-start ships silent and earns voice as N accumulates."
      }
    ],
    "surfaces": [
      {
        "name": "Verdict line (§19 Verdict line, reuse)",
        "what": "Shield glyph + the locked headline '{N} flights, {M} worth your time.' plus an optional second line driven by the tone-mode. Leads with the conclusion, never 'i searched 8 flights'. M is the worth-it count from §4.1.",
        "states": [
          "Several clear winners (Cleanly Played)",
          "One standout (Right + adjacent)",
          "Winners with a catch (Edge-walking)",
          "Mostly traps (All-traps: 'none i'd put you on as-is')",
          "Thin/sparse (Outside our edge: 'lightly vetted')"
        ]
      },
      {
        "name": "Flight row (§19 Flight row, reuse)",
        "what": "mark dot · airline · route · price (struck/now) · meta line · tag row (<=2). The mark (indigo dot) means 'worth your time' and its ABSENCE is information. Two-layer label: plain functional primary on the row, Outlaw subtitle only in fare-detail where it can't cause a misclick. Charm never shares the money line.",
        "states": [
          "Worth-your-time (marked)",
          "Opportunity tag (indigo, secondary slot)",
          "Neutral fact tag (gray, lowest)",
          "Warning/trap (amber #fbbf24, icon, primary, non-reorderable, can take BOTH slots)",
          "Asserted vs hedged warning copy",
          "Supplier-conflicted (opportunity tags suppressed)"
        ]
      },
      {
        "name": "Lens switcher + insight chips (§19 Suggestion pills, reuse)",
        "what": "Four-segment toggle (price · time · flex · comfort) + a chip strip below, each chip carrying a delta value. Default = inferred lean, fallback Balanced. The lens is a re-weight, not a single-axis filter; warnings are lens-invariant. The strip renders only chips that clear the confidence gate, never pads to a fixed count.",
        "states": [
          "Active lens (underlined indigo)",
          "Inferred lean (no manual selection)",
          "Inert lens (axis non-discriminating: 'every option's about the same on comfort here, ranking on what actually differs')",
          "Sparse axis (strip goes quiet)"
        ]
      },
      {
        "name": "Recommendation card (§19 Panel indigo, reuse, new copy modes)",
        "what": "'the smart move' panel directly under the verdict: first-person verdict + embedded compact Flight row + the basis (top 2-3 signals with the why) + the hand-off. Carries 1-2 NAMED rejections ('skipped the 3,600-cheaper one, looks like two tickets through newark'). Co-pilot CTAs lead with the prepare verb ([negotiate]/[hold it 24h]/[shift a day]); commit is secondary and clearly the user's, never a bare agent 'book'.",
        "states": [
          "Single pick",
          "Conflict-naming variant ([negotiate the cheap one][negotiate the comfortable one])",
          "All-traps no-win (least-bad + shift offer)",
          "Already-the-floor relief ('this is already the best price, book it')",
          "Outside-our-edge (names the limit)"
        ]
      },
      {
        "name": "Why-this-flight breakdown (§19 Recap grid, the ONE new variant)",
        "what": "Per-flight four-axis breakdown: bars filled against the ROUTE BASELINE (not within-set), each captioned with the 2-3 signals that moved it + their source, plus a verifiable-labour footer ('checked 7 suppliers · rejected 2 · sourced: DGCA on-time'). Explicitly does NOT show a composite number.",
        "states": [
          "Confident axis (filled bar + signal caption)",
          "Low-confidence axis (gray, unscored, 'not enough data on this route')",
          "Footer with rejections + cited baselines"
        ]
      },
      {
        "name": "Empty / all-traps / thin / data-sparse / inert (Verdict line + Panel + Suggestion pills, reuse)",
        "what": "Honesty surfaces that never dump junk as the verdict. Each declares its limit rather than guessing (Decoder Mode D).",
        "states": [
          "Empty ('no flights for those exact dates' + [shift a day][nearby airport])",
          "All-traps ('7 flights, none i'd put you on as-is' + least-bad)",
          "Thin route ('thin day, everything, lightly vetted')",
          "Data-sparse (renders on trusted axes; under-data axis shows 'light on data here')",
          "Inert lens (annotated, never silently hands control to other axes)"
        ]
      }
    ],
    "acceptance": [
      "Clustering: a single search returning six O-D pairs (BLR/BOM -> ORD, MDW, IND, LAN as in the real listing payload) is scored within {arrival metro, cabin} clusters; ORD+MDW collapse to 'Chicago', IND and LAN stay separate; alternate destinations appear as 'or fly into X', NEVER ranked against the requested one. No 'fastest of the set' claim spans destinations.",
      "Dedupe + conflict reconcile: each brand appearing 4-5x (Riya/Akbar/Cleartrip/Tripjack/TBO) collapses to the cheapest supplier per {normalized brand, refundable, changeable, normalized baggage} BEFORE any signal fires. On the IX-865 LITE conflict (refundable true/false across suppliers; baggage NIL/25Kg/null/'Paid'), the engine takes the conservative value, lowers that fare's PRICE/FLEX confidence, suppresses opportunity tags, and suppresses bag_gap entirely.",
      "Absolute anchoring proven: a cluster of two near-identical fares scores about 78/76 (NOT 100/0); a cluster where the cheapest fare is still 40% over the route median scores that fare LOW on price despite being cheapest; for |cluster| <= 3 percentiles are skipped entirely.",
      "Change-airport gate: any itinerary with arr_apt[i] != dep_apt[i+1] is capped at TRAP, excluded from the worth-count and the pick, asserted at full strength, and stays a trap under the Price lens (lens-invariant) even when its raw composite would rank 2nd.",
      "Self-transfer gate: an inferred self-transfer at Pabout 0.6 caps the bucket at TRAP while copy stays hedged ('looks like two separate tickets, confirm'); it never asserts as fact and is capped at 0.7 confidence.",
      "Composite never rendered: no surface displays a single 0-100 score; the four-axis breakdown shows baseline bars + captions + labour footer, with low-confidence axes gray and unscored.",
      "Tag discipline: <=2 tags per row; a catastrophe warning takes both slots and no pro-flight tag sits beside a warning against that same flight ('tight to make' + 'worth the splurge' is forbidden); a wanted third tag goes to the expanded view, not the row.",
      "Confidence registers: a signal at conf 0.80 with a consequence speaks a verdict; at 0.60 it hedges; below 0.55 it is silent but still feeds the score. Praise requires >=0.78. No claim renders without its exact evidence_string + source_id.",
      "Worth-count is flight-property, not crowd-size: the SAME flight does not flip in/out of 'worthy' based on how many other flights were searched; for |cluster| <= 2 the absolute bar alone decides (no sigma term).",
      "v1 ships on [NOW] signals only: verdict + marks + <=2 tags + the pick + the four-axis breakdown all work with zero enrichment; the on-time tag, 'new A350'/'real legroom', spoken penalty rupees, and below-market are NOT present and the surfaces say so honestly.",
      "Search logging is wired from day one (every search is a price observation) so the route price-history baseline compounds.",
      "Honest no-fabrication: visa_transit_trap never asserts 'no visa needed' from an all-false field; penalty rupees are never spoken until ParsedFareRules lands; off_market_savings never fires on the 131-rupee non-story (below the materiality floor)."
    ],
    "v1": [
      "Ships NOW on the regular search-response.json shape (terminals, layover_minutes, multi-segment routing) PLUS deep-search for the fare matrix, zero enrichment.",
      "Live day-one signals: change-airport trap (fact, asserted), self-transfer inference (hedged), sprint-between-terminals, hand-baggage trap, red-eye/next-day/land-fresh/lose-tomorrow, fastest/long-way-round/only-non-stop, penalty-adjusted effective price (coarse proxy, never spoken), dedupe + supplier-conflict reconciliation (flex AND baggage), bag-friendly, meal-included, bare-bones-LCC, sleep-through-it/rough-sleep.",
      "Day-one verdict, marks, <=2 tags, the pick, and the four-axis breakdown all function on these [NOW] facts.",
      "Build the baggage-string normalization map and supplier-conflict reconciliation BEFORE any bag-based signal fires.",
      "Instrument search logging from day one, the single most important data decision; the route price-history baseline is a moat no vendor sells.",
      "Redraw the §6.2 example rows in two sets ('day-one [NOW]' vs 'full-fidelity') so reviewers never mistake the enriched future for the shippable present."
    ],
    "v2": [
      "DGCA monthly performance (free PDF) as the FIRST enrichment: often_delayed/holds_up_well/high_cancellation at airline x metro grain, copy always says 'across its network'.",
      "ParsedFareRules/PolicySummary backend parse: the spoken change/cancel rupee, true penalty-adjusted price, flexible_low_fee.",
      "Own route price-history baseline goes dense: below_market_floor, at_the_floor, buy-now-vs-wait, the absolute price anchor, and the PRICE ceiling cap lifts.",
      "Per-flight historical OTP (Cirium/OAG enterprise; AeroDataBox/AviationStack budget): route x carrier x time on-time + delay_distribution.",
      "Schedule equipment code + seat-product sub-fleet table: new_aircraft, real_legroom/lie_flat, tight_cabin (silent when sub-type ambiguous).",
      "IATA SSIM Ch.8 MCT: precise tight_to_make + the (buffer-MCT)*OTP misconnect proxy for one_in_four_miss_this.",
      "Inbound-tail + live status: inbound_aircraft_risk, the novel pre-purchase disruption signal.",
      "Lounge/airport-quality (stretch_stop/stuck_at_the_hub) and Google Travel Impact Model carbon_estimate.",
      "Learned per-user lean nudges weights from behavior (vibe signals only; money/safety keep a global floor)."
    ],
    "cold": [
      "True PNR structure (same-PNR vs separate-ticket): the biggest blocker, modeled in deepSearchTypes.ts but absent from payloads. self_transfer_risk and protected_connection stay inference-only (capped 0.7, hedged) until an NDC/GDS feed exposes it. Lock down a fare source that exposes PNR/codeshare structure, favor NDC/GDS over scrapes.",
      "Visa-rules lookup (nationality x routing x transit-airport): not in scope. transit_visa_required is false in 200/200 occurrences and absence is not safety, so visa_transit_trap drops off the day-one set; only ever a hedged 'may need a transit visa, confirm', never asserted, never a gate.",
      "True realized mis-connect %: needs Cirium/FA historical at scale (India sparse); use the (buffer-MCT)*OTP proxy meanwhile.",
      "Operating-vs-marketing carrier: operated_by is 0/100 populated; operated_by_clarity needs schedule codeshare data."
    ],
    "metrics": [
      "NORTH STAR: warning precision, when a warning fired, was it right? Target >=0.90. One wrong 'skip it' poisons every future warning, so optimize precision and accept lower recall. A signal whose precision drops below 0.85 auto-raises its own confidence bar until it recovers.",
      "Caught before it hurt: catastrophe warnings where the user changed choice AND the avoided flight later had the predicted problem, regret prevented, the product's actual measurable value.",
      "Warning override -> regret rate: of users who booked despite a warning, what fraction hit the warned outcome. High = right (they own it); low = wolf, auto-tightens.",
      "Recommendation-accept rate: a HEALTH signal, NEVER a target (optimizing it rewards the safe boring pick).",
      "Silent-miss rate (sampled audit): booked flights with bad outcomes that should have fired a signal, the only honest way to watch recall without letting it override precision.",
      "False-praise rate: 'below market'/'worth the splurge' contradicted by outcome; a stricter standard than warnings.",
      "Tag dismissal/blindness: rising dismissal = wallpaper, review for over-firing.",
      "Log per Signal Instance every surface AND every suppression: signal_id, axis, class, register, confidence, magnitude, regret_weight, evidence_string, source_ids, grain, surfaced, suppressed_reason, lens_active, slot, plus user action and post-trip outcome (actual_on_time, actual_delay, connection_made, was_refunded/changed, price_at_departure). Outcomes recalibrate per-signal bars, source priors (learns which OTA's flex flags to trust, the IX-865 conflict), grain penalties, and per-user vibe weights."
    ],
    "edgeCases": [
      "|cluster| <= 2 or uniform set: skip the sigma/percentile term entirely; the absolute quality bar alone decides worthiness; two near-identical fares score about 78/76 not 100/0.",
      "Non-discriminating axis (all non-stop, identical duration): axis scores 50 for all AND its weight is suppressed for this cluster; if the user selected that axis's lens, show the inert-lens treatment, never silently hand control to other axes.",
      "Supplier flex/baggage conflict (IX-865): take the conservative value, lower confidence, suppress opportunity tags, and suppress bag_gap entirely on baggage conflict rather than guess a 3,000 demotion off a 'Paid'/'25 Kg' disagreement.",
      "Multi-destination search (6 O-D pairs in one payload): cluster by {arrival metro, cabin}; alternate destinations become an 'or fly into X' surface, never ranked against the requested one.",
      "Off-market savings of 131/133/0 rupees (0.94% max): below the materiality floor [confirm >=1,500 OR >=5%], fold into a neutral 'at the published fare', never a hero tag; the hero's REASON stays the penalty-adjusted value math, not the discount size.",
      "Unanchored rip-off (no dense price history): PRICE ceiling is CAPPED so a small-savings fare never scores 100; below-floor claims stay silent.",
      "Inferred self-transfer that is actually a codeshare (false alarm) vs a real one missed (false all-clear): always inference, capped 0.7, hedged copy; the lower warning bar (0.55) catches the real ones hedged rather than missing them.",
      "Stability under re-search: absolute anchoring means adding/dropping one itinerary changes only that itinerary's score; plus 2-pt display bands with hysteresis, a sticky pick (loses its crown only to a challenger >=4 pts better), and frozen anchors per search session (recompute only on explicit re-search, not background polls).",
      "Premium long-haul (200k fare): the change-penalty proxy is a FLAT absolute (3,000-5,000), never 0.30*price, which would inject a 60,000 phantom penalty and arbitrarily reorder premium fares.",
      "All-traps day: surface the single least-bad with its flaw named; the date/airport shift is the real recommendation, not a forced verdict.",
      "Baggage string chaos (NIL/None/null/'Paid Baggage as per airlines policy'/'25 Kg'): normalize to a no-checked-bag boolean before any bag signal; on conflict, suppress.",
      "scarcity (low seats_available): never surfaced; score-only at lowest weight; voice forbids '1 seat left'."
    ],
    "risks": [
      "Crying wolf: warnings fire too often and the whole tag layer becomes wallpaper. Mitigation: precision >=0.90 north-star, <=2-tag ceiling, precision <0.85 auto-raises the bar, dismissal monitor.",
      "Wrong 'skip the savings' destroys trust faster than ten cautious tags help. Mitigation: opinion bar 0.75 / praise bar 0.78, a consequence is required, multiplicative confidence forces silence on any one weak factor.",
      "Asserting an inference as fact (the exact calibration failure the model exists to prevent): self-transfer/protected-connection are always inferences today. Mitigation: capped 0.7, hedged copy, only change-airport (different IATA codes) may assert.",
      "Trap out-ranked by a good price: the common case since true PNR is COLD. Mitigation: the expected-regret gate (P*regret), not a soft penalty a price can absorb; lens-invariant.",
      "Set-relative 'great' verdict on a rip-off: within-set min-max forces best-of-an-all-terrible-set to 100. Mitigation: absolute anchoring + the PRICE ceiling cap when unanchored.",
      "Fabricated specificity (the fake-Hipmunk-stats failure): Mitigation: no claim without a traceable evidence_string + source_id; the universal gate.",
      "Grain laundering: airline-wide OTP shown as a route number. Mitigation: f_density x0.6 + copy names the true grain ('across its network').",
      "Optimizing the wrong metric: chasing accept-rate rewards the safe boring pick. Mitigation: accept-rate is a health signal only; warning precision + caught-before-it-hurt are the targets.",
      "Per-user demotion of safety: personalization quietly downweights a warning. Mitigation: personalization may demote VIBE signals only; money/safety warnings have a global floor.",
      "Cold-start over-confidence on a new route/signal. Mitigation: ship silent, earn voice as N accumulates.",
      "COLD-source dependency risk: the entire self-transfer promise (the moat) hinges on a PNR feed that does not yet exist. Mitigation: stays hedged inference until an NDC/GDS source is locked; named as the #1 next move.",
      "[confirm] calibration gaps: the absolute quality bar (65), per-axis acceptable floors, the gate threshold (P*regret >= 0.4), the off-market materiality floor, P_change priors, and cluster boundaries are all proposed, not validated against labelled good/bad flights, shipping on unvalidated thresholds risks systematic mis-verdicts."
    ]
  },
  "rescueSpec": {
    "title": "AWAY Disruption to Rescue Engine: the encoded passenger-rights moat (build-ready spec, India-first)",
    "summary": "The rescue engine is the second moat: a built-in set of passenger-rights rules (country, event, and threshold, mapped to what you are owed) that lets Away say \"you are owed X\" and arrive holding the fix, not just reporting the problem. It is the payoff of the whole-trip promise (the same negotiation muscle that beats the fare gets you out of trouble) and the co-pilot rule (the agent goes ahead and beside, never instead of you). It wins because no booking site encodes rights: Away detects the disruption, states what is owed in plain rupees, does the work in advance (rebooking options, the lost-baggage report, credit-card delay cover, a drafted claim), and hands you the move to commit, never doing it for you.",
    "triggers": [
      {
        "event": "Cancellation (airline-initiated)",
        "signal": "Live PNR/flight-status monitoring flips a leg to CANCELLED, or carrier push/email parsed by the email-parser, or user forwards the cancellation notice. Capture notice timestamp vs STD to compute the notice window (the >=2-week / <2-week India bar, the EU 14-day bar, Canada 14-day gate).",
        "note": "Notice window is the single most load-bearing field: it decides whether fixed cash is owed at all (India <2wk, EU <14d, Canada <=14d). Record cause text verbatim if the carrier gives one (force-majeure determination)."
      },
      {
        "event": "Delay (departure / projected arrival)",
        "signal": "Status feed shows revised STD/ETA; compute delay length AND block time of the flight (India ladders care by both). Cross 2h/3h/4h care lines (India by block time), >6h (India alternate-or-refund), >24h or red-eye >6h (India hotel). Project arrival delay at FINAL destination for EU Sturgeon 3h line.",
        "note": "India has NO cash for mere delay: surface care + refund/reroute, never promise a delay payout. EU cash attaches to 3h+ ARRIVAL delay, so monitor projected final-destination arrival, not just departure."
      },
      {
        "event": "Missed connection",
        "signal": "Connection monitor (live during-trip) sees inbound leg arrival vs outbound leg cutoff; flags at-risk before it happens. Decision branches entirely on PNR/protection: SAME PNR (interline/codeshare) = protected; DIFFERENT PNRs = self-transfer = unprotected.",
        "note": "Protection status comes from trip-structure metadata captured at book/forward-in. IndiGo rarely interlines, so DEL->hub->US is usually two tickets (self-transfer) - the highest-trust warning and the gap insurance/card cover, not airline liability, must fill."
      },
      {
        "event": "Denied boarding (involuntary, overbooking)",
        "signal": "User at gate reports bumped, or boarding pass invalidated, or carrier offload notice. Must distinguish VOLUNTARY (negotiated, no statutory cash) from INVOLUNTARY (triggers DGCA/Part 250 cash). Capture alternate-flight departure time vs original STD (India 1h zero-cash line; 24h tiers).",
        "note": "Involuntary is what triggers cash. Agent must coach the user to NOT accept a voluntary-bump voucher without knowing the involuntary cash they are giving up."
      },
      {
        "event": "Schedule change (far-out)",
        "signal": "Monitoring detects STD/STA shift weeks out (canonical IndiGo +2h 35m fixture), or different airport, more connections, or downgrade. Map against US significant-change thresholds (>=3h domestic / >=6h international, different airport, +connections, downgrade) and India >6h-communicated-24h-ahead reroute-or-refund.",
        "note": "Low urgency: a quiet hub line + smart move, escalates only as date nears or if it breaks the trip. US significant change unlocks the automatic-refund right if user declines rebooking."
      },
      {
        "event": "Baggage delay / loss / damage",
        "signal": "User reports bag not on belt, or carrier MBR/PIR issued. Start the clock for fee-refund (US 12h/15h/30h) and the Montreal written-claim window (7 days damage / 21 days delay).",
        "note": "File the PIR/MBR BEFORE leaving the airport - in the US the fee-refund right does not attach without it; Montreal written windows are short. This is a time-critical, do-it-now action."
      },
      {
        "event": "Tarmac delay (US legs)",
        "signal": "Status shows aircraft held on tarmac; cross 2h (food/water owed) and 3h domestic / 4h international (opportunity to deplane).",
        "note": "US-only (14 CFR 259, 30+ seat aircraft). Edge surface; informational coaching rather than a claim."
      }
    ],
    "rightsRules": [
      {
        "jurisdiction": "India (DGCA CAR S3, Series M, Part IV; Rev.4 eff. 15 Feb 2023)",
        "event": "Delay - duty of care",
        "owed": "Meals/refreshments at 2h+ (block time <=2.5h), 3h+ (block 2.5-5h), 4h+ (block >5h). Hotel + transfers at total delay >24h OR >6h for red-eye flights scheduled 2000-0300. Domestic delay expected >6h (communicated >24h before STD): alternate within 6h OR full refund.",
        "note": "NO per-flight cash for mere delay in India. Value is care + refund/reroute that scale with delay and block time."
      },
      {
        "jurisdiction": "India (DGCA Part IV)",
        "event": "Cancellation",
        "owed": "Notified >=2 weeks before STD: alternate flight OR refund, no cash. Notified <2 weeks (esp <24h): alternate OR full refund PLUS fixed cash by block time - INR 5,000 (block <=1h, capped at lower of 5,000 or one-way basic fare + fuel), INR 7,500 (block >1h to 2h), INR 10,000 (block >2h). Care (meals) while waiting at airport.",
        "note": "The <2-week notice window is the cash gate. Same-ticket missed connection is treated as short-notice cancellation (same 5,000/7,500/10,000 cash)."
      },
      {
        "jurisdiction": "India (DGCA Part IV)",
        "event": "Denied boarding (involuntary)",
        "owed": "Alternate departs within 1h of original STD: ZERO. Alternate within 24h: 200% of one-way basic fare + fuel, max INR 10,000. Alternate >24h: 400% + fuel, max INR 20,000. Passenger declines the alternate: 400% + fuel, max INR 20,000, PLUS full ticket refund. This is on top of meal/hotel care.",
        "note": "Cash is only for INVOLUNTARY denial. The DBC stacks with duty of care."
      },
      {
        "jurisdiction": "India (DGCA Part IV)",
        "event": "Force majeure / extraordinary circumstances",
        "owed": "Cash compensation WAIVED only. Refund, rerouting/rebooking, and duty of care (meals, refreshments, hotel for overnight) are STILL OWED.",
        "note": "Load-bearing edge case: DGCA uses compensation to mean cash only. When the user says they blamed the weather, the agent must say weather may defeat the cash claim but NEVER the food, hotel, or refund."
      },
      {
        "jurisdiction": "EU/UK (Reg EC 261/2004; UK261 mirror in GBP)",
        "event": "Cancellation / denied boarding / 3h+ arrival delay - CASH",
        "owed": "EUR 250 (flight <=1,500 km), EUR 400 (>1,500 km intra-EU or any 1,500-3,500 km), EUR 600 (>3,500 km). Carrier may halve if re-routing keeps arrival within 2h/3h/4h by band. On >3,500 km, a 3-4h arrival delay pays only 50% (EUR 300). Same cash for 3h+ delay at FINAL destination (Sturgeon).",
        "note": "Distance sets the band; delay length only matters at the long-haul 3-4h half-cut. Scope trap: EU covers all EU departures (any carrier) + EU-carrier arrivals into EU + intra-EU + Iceland/Norway/Switzerland; a non-EU carrier arriving into the EU is NOT covered (Emirates DXB to LHR is out)."
      },
      {
        "jurisdiction": "EU/UK (261/2004)",
        "event": "Cancellation - notice bar + care",
        "owed": "Notified >=14 days before STD: no cash (absolute bar). Inside 14 days, cash due unless a qualifying re-routing offer was made. Right to care (meals, refreshments, comms; hotel + transfers if overnight) on long delays. Refund OR re-routing on cancellation/qualifying long delay. Extraordinary circumstances waive cash but not care or re-routing.",
        "note": "EU exact care HOURS (Art 6/9) were refuted against the cited primary source - re-verify before quoting specific care hours. Cash thresholds and the 3h Sturgeon rule ARE confirmed."
      },
      {
        "jurisdiction": "USA (DOT, 14 CFR Parts 250/254/259/260)",
        "event": "Cancellation / significant change - automatic refund",
        "owed": "Automatic cash refund to original payment method if the passenger declines rebooking/credits, when departure/arrival moves >=3h domestic or >=6h international, OR a different airport, OR more connections, OR a downgrade. Refund within 7 business days (card) / 20 calendar days (other); no forced vouchers. Unprovided paid ancillaries (Wi-Fi, seat) auto-refunded.",
        "note": "US is a REFUND regime, not a compensation regime: if you fly (however late) the refund right typically lapses. A Dec 5 2025 DOT rulemaking pauses enforcement (through 30 Jun 2026) only for a re-flighted-cancellation-under-a-different-number scenario; the four significant-change triggers and amounts are unchanged."
      },
      {
        "jurisdiction": "USA (14 CFR Part 250, eff. Jan 22 2025)",
        "event": "Denied boarding (involuntary) - cash",
        "owed": "Domestic: 200% of one-way fare, cap $1,075 (1-2h late); 400%, cap $2,150 (>2h). International departing US: 200%, cap $1,075 (1-4h); 400%, cap $2,150 (>4h).",
        "note": "Caps rose from $775/$1,550 on Jan 22 2025. Involuntary only."
      },
      {
        "jurisdiction": "USA (14 CFR Part 260 / 254 / 259)",
        "event": "Baggage fee refund, baggage liability cap, tarmac",
        "owed": "Delayed-bag fee refunded (MBR required) if not delivered within 12h domestic / 15h intl segment <=12h / 30h intl segment >12h. Domestic mishandled-baggage liability cap $4,700/passenger. Tarmac: food + water by 2h; opportunity to deplane before 3h domestic / 4h international (safety/ATC exceptions).",
        "note": "MBR must be filed before leaving the airport for the fee-refund right to attach."
      },
      {
        "jurisdiction": "Canada (APPR, SOR/2019-150; CTA)",
        "event": "Delay / cancellation - cash (within carrier control, not safety-required)",
        "owed": "By arrival delay: Large carrier CAD 400 (3-<6h) / 700 (6-<9h) / 1,000 (9h+); Small carrier CAD 125 / 250 / 500 at the same tiers. Care at 2h+ (food, drink, comms; hotel if overnight). Refund if rebooking declined or inadequate. Safety-required or outside-control: NO cash, care + rebooking still owed.",
        "note": "Passenger must REQUEST the cash; carrier has 30 days to pay or justify; 1-year claim window. Only when notice <=14 days. Dec 2024 burden-shift amendments are PROPOSED, not law as of Jun 2026 (dollar tiers unchanged)."
      },
      {
        "jurisdiction": "Brazil (ANAC Resolution 400/2016)",
        "event": "Delay - material assistance ladder",
        "owed": ">1h: communication access. >2h: meals/food vouchers. >4h (if overnight): hotel + round-trip transfer. >4h (also cancellation/overbooking): passenger choice of full refund, reaccommodation on another flight, OR rebooking via another transport mode.",
        "note": "No EU261-style fixed cash. Clean 1h/2h/4h care ladder + 4h refund/rebooking fork."
      },
      {
        "jurisdiction": "Australia (ACL / ACCC)",
        "event": "Delay / cancellation - no fixed cash",
        "owed": "Consumer-guarantee breach (service not provided in reasonable time) gives the consumer a CHOICE of replacement service OR refund. NO statutory cash amount. Airline charter policy sits on top of (never replaces) consumer guarantees. International legs governed by Montreal.",
        "note": "No EU261-style cash and no aviation-specific cash regulator. 2024-2026 reforms add a charter/ombuds scheme, NOT pay-on-delay. Never promise an Australian or Gulf-carrier passenger a fixed delay payout. Route trap: Sydney->London compensates only on a UK/EU carrier; inbound London->Sydney is covered on any carrier."
      },
      {
        "jurisdiction": "UAE / GCC (GCAA CAR-PWP Issue 02, eff. 1 Jan 2025)",
        "event": "Delay / denied boarding / cancellation - care only",
        "owed": "Terminal delay: info (1-3h); meals + comms (3-8h, + hotel if onward connection >8h away); hotel + transfer (>8h). Denied boarding: return-to-origin OR re-routing + care, NO cash. Cancellation (within 48h of STD): notice + care + carriage on next flight or return/re-route, NO cash.",
        "note": "Care-and-welfare regime only; zero AED compensation anywhere. Gulf carriers on UK/EU-departing legs ARE bound by EU261/UK261 cash; on UAE-origin legs they fall under this care-only floor. Saudi GACA reportedly has some monetary remedies but amounts unverified - do not quote."
      },
      {
        "jurisdiction": "Montreal Convention 1999 (international carriage; SDR caps eff. 28 Dec 2024)",
        "event": "Baggage and passenger-delay liability",
        "owed": "Passenger delay (Art 19): up to 6,303 SDR (about US$8,400, roughly Rs 7.0-7.3 lakh) for PROVABLE damages, carrier escapes if it proves all reasonable measures taken. Baggage (loss/damage/delay): up to 1,519 SDR (about US$2,000, roughly Rs 1.7 lakh). Death/injury tier 1: 151,880 SDR.",
        "note": "Use the 2024 figures (6,303 / 1,519); the prior 5,346 / 1,288 are STALE. Damages-based, not automatic - document actual loss. Written baggage claim: 7 days damage / 21 days delay. 2-year limitation. Pull a live SDR rate before quoting any rupee/dollar figure."
      }
    ],
    "intake": [
      {
        "mode": "Forward-in (cold)",
        "what": "User forwards a booking or disruption email/screenshot made elsewhere. The email-parser extracts carrier, flight, PNR, legs, timings, fare basis. Voice = warm-pro. Low-confidence parse INVERTS the default: show the source email first, the summary second."
      },
      {
        "mode": "Live monitoring (warm)",
        "what": "Away already holds the trip (booked or previously forwarded). Continuous PNR/flight-status + connection monitoring detects the disruption first; the agent arrives already holding the delta and the fix. Voice = calm-operational, no Outlaw in the wound."
      },
      {
        "mode": "Reconcile",
        "what": "Parse against what Away already knows; compute the delta (what changed: +2h 35m, new airport, leg cancelled) and the new state. Captures notice timestamp, block time, projected final-destination arrival, PNR/protection status, voluntary-vs-involuntary, cause text - the fields the rights rules key on."
      },
      {
        "mode": "Infer",
        "what": "Never ask what can be inferred. Derive jurisdiction from route, protection from PNR structure, care/cash thresholds from delay + block time. Law 2: never silently infer the irreversible (a refund choice, accepting a voluntary bump)."
      },
      {
        "mode": "Ask",
        "what": "Ask at most ONE gap, via the composer-morph card, only when a rights-determining field cannot be inferred (e.g. was the bump voluntary or involuntary; did the carrier state a cause). Default the rest out loud."
      },
      {
        "mode": "Defer",
        "what": "Law 3: never hide what you defer. If a field is unresolved (cause pending, connection uncertain), say so on the held strip and proceed with the safe default, surfacing it for later resolution."
      }
    ],
    "actions": [
      {
        "action": "Rebook on app first (offered, user-confirmed)",
        "when": "Cancellation, connection-breaking change, or significant schedule change where an Away-sourced alternate exists.",
        "how": "Surface the ONE smart move (best option by the 4-param lean + the trip), plus 'See N other options'. Never auto-book. The user taps to commit (composer: Switch to AI 2806 / Keep 08:45 / Take the refund). Reuses the booking negotiation engine, so the lifecycle promise pays off."
      },
      {
        "action": "Claim owed care / cash",
        "when": "Any event where the rights rule returns a care or cash entitlement (DGCA cash, EU261 EUR, Canada CAD, US DBC, US auto-refund).",
        "how": "State 'you are owed X for that [event] under [rule]' in plain rupees, with the basis. Offer to draft the claim (first-person, sent to the carrier channel). Coach the in-person ask by name (meal voucher, hotel + transfer, 'I decline the alternate and request a full refund', 'is this voluntary or involuntary'). On force-majeure, assert the surviving care/refund rights."
      },
      {
        "action": "File PIR/MBR before leaving the airport",
        "when": "Any baggage delay/loss/damage event.",
        "how": "Time-critical do-it-now prompt: the fee-refund right (US) does not attach without it and Montreal written windows are short (7 days damage / 21 days delay). Surface the desk location, pre-fill the report fields from the parsed booking, start the Montreal 2-year and 7/21-day clocks."
      },
      {
        "action": "Pre-fill card delay-cover claim",
        "when": "Delay/cancellation/missed-connection produces out-of-pocket costs, especially the self-transfer gap where no airline is liable.",
        "how": "Pre-fill the credit-card travel-insurance / delay-cover claim (and standalone travel insurance) from the trip + receipts. Explain subrogation: claim airline statutory entitlements first, keep receipts, then file insurance for the residual (non-refundable losses, separate-ticket misconnects, costs beyond airline care); no double-recovery of the same expense."
      },
      {
        "action": "Handoff",
        "when": "When the fix lives outside Away (carrier desk, airline app, helpline, regulator).",
        "how": "Deep-link the airline app, surface the right desk/helpline, draft the message/claim the user sends. Regulator escalation: DGCA/AirSahayata (India), national NEBs/AirHelp (EU/UK), DOT transportation.gov (US), CTA (Canada). The agent prepares; the user commits (co-pilot rule)."
      },
      {
        "action": "Severity-scaled surfacing",
        "when": "Every detected event.",
        "how": "Prominence scales by severity: a minor far-out schedule change = a quiet line in the hub; a cancellation mid-trip = a takeover that breaks through Do-Not-Disturb with the fix already prepared."
      }
    ],
    "surfaces": [
      {
        "name": "Disruption decision surface (7-part anatomy)",
        "what": "The takeover/decision-mode card built in the Away Figma file (page 'Disruption & Forward - surfaces', node 6647:43943). Order: provenance -> delta/state badge -> rights line -> pre-done 'we already checked' inset -> the one decision (first-person rec + 2-line basis + 1-tap override + 'See N other options') -> held strip (cap 4 chips) -> action chips/composer. Token-bound to the Away DS (Semantic/Color dark mode, Spacing, Radius, Typography).",
        "states": [
          "takeover (cancellation mid-trip)",
          "decision-mode (choose rebook/keep/refund)",
          "low-confidence parse (source email first)",
          "force-majeure (cash struck, care/refund asserted)",
          "protected vs self-transfer rights line",
          "half-state (delayed + connection uncertain)"
        ]
      },
      {
        "name": "Reference / watching surface",
        "what": "The quiet monitoring frame (reference page-shape) the agent shows while watching, before a decision is needed. Connected to the decision surface by the bi-modal switch (60/40 collapse + designed transition).",
        "states": [
          "watching (quiet)",
          "at-risk pointer (connection tightening)",
          "transition to decision"
        ]
      },
      {
        "name": "Rights line (in-the-moment, Phase 3-4)",
        "what": "The single line that states what is owed, keyed by jurisdiction x event x threshold x protection status. Needs a distinct rights/entitlement accent token (confirm it exists in the Away DS or flag the gap).",
        "states": [
          "cash owed (amount in rupees)",
          "care owed",
          "refund/reroute owed",
          "nothing owed (honest)",
          "unprotected/self-transfer (insurance/card backstop)"
        ]
      },
      {
        "name": "Claim-what-you-are-owed (after-the-fact, Phase 5)",
        "what": "Post-trip surface: 'you are owed about X for that delay under [rule], want me to draft the claim?' Most travelers never claim; this is the moat made visible.",
        "states": [
          "claim available",
          "draft ready to review",
          "filed / tracking",
          "no claim owed"
        ]
      },
      {
        "name": "Trip-structure / protection badge",
        "what": "Legs grouped by PNR with a plain PROTECTION badge and operated-by clarity (operated by Vistara, sold as AI 2014), set from book/forward-in. Pre-empts airport confusion and powers the rights branch.",
        "states": [
          "one PNR (protected)",
          "separate PNRs (self-transfer, not protected)",
          "codeshare/interline"
        ]
      },
      {
        "name": "Time-critical action banners",
        "what": "Do-it-now banners for windowed actions: file PIR before leaving, Montreal 7/21-day baggage windows, US 7-business-day/20-day refund timing, claim deadlines.",
        "states": [
          "deadline active (countdown)",
          "action pending",
          "done",
          "expired"
        ]
      }
    ],
    "acceptance": [
      "Given a forwarded or live cancellation, the agent computes the notice window (vs STD) and states the correct India entitlement: >=2 weeks = reroute/refund only; <2 weeks = reroute/refund PLUS the correct INR 5,000/7,500/10,000 by block time.",
      "Given an India delay, the agent surfaces care + refund/reroute scaled by delay AND block time and NEVER promises a cash delay payout (because none exists in India).",
      "Given the carrier blames weather (force majeure), the agent correctly tells the user the cash may be waived but refund, rerouting, and duty of care (meals, hotel for overnight) are still owed.",
      "Given a missed connection, the agent branches correctly on PNR/protection: same PNR = carrier must rebook + India same-ticket cash; separate PNRs = no airline liable, surface the smart move + insurance/card backstop.",
      "Given involuntary denied boarding in India, the agent returns 0 if alternate departs within 1h, else 200%/max 10,000 (within 24h) or 400%/max 20,000 (>24h), and coaches voluntary-vs-involuntary.",
      "Given a baggage event, the agent prompts to file the PIR/MBR BEFORE leaving the airport and starts the Montreal 7-day-damage / 21-day-delay and 2-year clocks.",
      "The disruption decision surface renders the 7-part anatomy in order, token-bound to the Away DS, container fills cleared (no white-on-white), with severity-scaled prominence (quiet hub line for far-out change, takeover for mid-trip cancellation).",
      "Every rights amount carries its rule citation and effective date; the agent re-checks effective amounts and pulls a live SDR rate before quoting any Montreal rupee/dollar figure.",
      "The agent never auto-books or auto-charges: rebooking and refund choices are always offered and user-confirmed (co-pilot rule)."
    ],
    "v1": [
      "India-first rights engine: full DGCA Part IV ruleset (delay care by delay+block time, cancellation notice bar + cash tiers, involuntary denied-boarding tiers, force-majeure carve-out) wired to the rights line.",
      "Detection for the five core triggers: cancellation, delay, missed connection, denied boarding, schedule change, from live monitoring + email-parser forward-in.",
      "Trip-structure/protection capture (PNR grouping, protected vs self-transfer, operated-by) feeding the missed-connection branch.",
      "The 7-part disruption decision surface + the reference/watching surface + the bi-modal switch, built and token-bound in the Away file.",
      "Actions: rebook-on-app-first (offered, user-confirmed), claim owed care/cash with first-person draft, file PIR/MBR before leaving, handoff (deep-link + desk + drafted message).",
      "EU261/UK261 and US DOT rules for India-departing internationals and common return routings (cash bands + Sturgeon for EU; auto-refund significant-change + DBC for US).",
      "Severity-scaled prominence + DnD break-through for true mid-trip crises.",
      "Effective-date and live-SDR re-check guardrail before any user-facing amount."
    ],
    "v2": [
      "Swap hand-built primitives for the real flight-card + trip-chrome components.",
      "Additional jurisdictions: Canada APPR cash tiers, Brazil ANAC 400 care ladder, Australia ACL choice, UAE GCAA care-only, with the correct 'no fixed cash' messaging for AU/Gulf.",
      "Card delay-cover and standalone travel-insurance pre-fill with subrogation-aware sequencing (airline first, insurance for residual).",
      "Half-states (delayed + connection uncertain) and concurrent decisions (disruption + expiring passport) drawn as designed seams.",
      "Cold forward-in parsed-card-in-Chat variant and the low-confidence inverted layout.",
      "Proactive Phase-5 'claim what you are owed' automation across all encoded jurisdictions, plus refund-not-received chase.",
      "Tarmac-delay (US) coaching and Montreal damages-claim assembly with documented out-of-pocket totals.",
      "Live SDR-rate integration to quote exact rupee figures for Montreal caps."
    ],
    "cold": [
      "The rules change: US amounts changed 22 Jan 2025 (DBC caps $1,075/$2,150, baggage cap $4,700), US auto-refund eff. 28 Oct 2024, a Dec 2025 DOT rulemaking paused enforcement through 30 Jun 2026 for one narrow re-flighted-cancellation case; India CAR is Rev.4 eff. 15 Feb 2023 with a draft Part II on refunds circulating; Montreal SDR caps rose 28 Dec 2024 to 6,303 (delay) / 1,519 (baggage). Re-verify effective dates and amounts before any user-facing quote.",
      "DGCA 'compensation' is a term of art meaning CASH ONLY; force majeure waives only that cash, never refund/reroute/care. Never tell a user weather wipes out their meal/hotel/refund rights.",
      "EU261 scope asymmetry: a non-EU carrier arriving into the EU is NOT covered (Emirates DXB->LHR is out). EU departures are covered on any carrier.",
      "EU exact CARE hours (Art 6/9) were refuted against the cited primary source; the cash thresholds and 3h Sturgeon arrival rule are confirmed. Re-verify care hours before quoting them.",
      "Self-transfer (separate PNRs) is the structural gap: no airline is obligated. IndiGo rarely interlines so DEL->hub->US is usually two tickets. Insurance/card cover, not airline liability, is the backstop.",
      "The operative India instrument is Part IV (not Part II as an earlier brief stated). Part II covers refund mechanics.",
      "Unverified, do not quote numbers: Saudi GACA monetary remedies; exact Gulf-carrier Conditions of Carriage goodwill. Pull a live SDR rate before any Montreal rupee/dollar figure.",
      "Voice in the wound = calm-operational, all warmth, zero Outlaw edge; swagger only on the win and only post-trip on the claim (pointed at the airline, never the user)."
    ],
    "metrics": [
      "Disruption detection lead time: minutes between carrier event and Away surfacing it (target: ahead of the carrier's own push).",
      "Rights-line accuracy: % of disruptions where the stated entitlement matches the encoded rule for that jurisdiction x event x threshold (audited sample).",
      "Rescue completion rate: % of detected disruptions where the user reaches a resolved state (rebooked, refund taken, claim filed) in-app.",
      "Claim capture rate: % of owed-cash/owed-care events where a claim is drafted and filed (baseline: most travelers never claim).",
      "Amount recovered: total rupees of care/cash/refund the user obtained via Away.",
      "PIR-before-leaving rate: % of baggage events where the report was filed before airport exit (window preserved).",
      "Time-to-decision: from takeover surface shown to user tapping a commit.",
      "Override rate on the first-person rec: how often users pick a non-default option (calibrates the 4-param recommendation).",
      "False-positive disruption alerts (trains ignore-behavior if high).",
      "Effective-date staleness: % of user-facing amounts quoted from an out-of-date rule (target zero)."
    ],
    "edgeCases": [
      "Force majeure / extraordinary circumstances: cash waived, care + refund + reroute still owed (India and EU both).",
      "Voluntary vs involuntary denied boarding: only involuntary triggers statutory cash; coach the user not to accept a voluntary voucher blindly.",
      "Alternate departs within 1h (India): zero denied-boarding cash owed - state it honestly.",
      "Separate-ticket self-transfer missed connection: no airline liable; pivot to smart move + insurance/card backstop, no Away rebooking obligation.",
      "EU non-EU-carrier-arriving-into-EU: not covered (Emirates DXB->LHR); do not promise EU cash.",
      "US 'you flew anyway': refund right lapses if you take the (delayed) flight; cash only for denied boarding.",
      "Half-state: delayed AND connection uncertain - surface the held/deferred field, do not force a premature decision.",
      "Concurrent decisions: disruption + expiring passport / visa at once - sequence without conflating.",
      "Codeshare confusion: operated-by carrier differs from ticketing carrier; user could check in at the wrong counter.",
      "Notice exactly at the bar (e.g. exactly 14 days EU, exactly 2 weeks India): apply the boundary rule precisely.",
      "Montreal damages are provable-loss-based, not an automatic payout: set expectations, require receipts.",
      "Australia/Gulf 'no fixed cash': manage expectations, never promise a delay payout.",
      "Carrier states no cause or a contested cause: defer the force-majeure determination, surface the surviving care/refund rights meanwhile.",
      "Downgrade and different-airport and added-connection: all are US significant-change triggers that unlock the refund right even without a time delay."
    ],
    "risks": [
      "Recency risk is the headline: amounts and effective dates change (US Jan 2025, Montreal Dec 2024, India Rev.4, pending Canada/Australia/India-Part-II reforms). A stale quote breaks trust and could mis-state what is owed. Mitigate with an effective-date guardrail and a re-check-before-quote rule.",
      "Over-promising entitlements (e.g. promising EU cash on an uncovered route, or a delay payout where none exists in India/AU/Gulf) erodes the moat's credibility. The verb/claim IS the contract (per the negotiate-communication finding on Hopper/Honey false states).",
      "Verification gaps: Saudi GACA amounts, exact Gulf Conditions of Carriage, EU exact care hours, live SDR conversion - do not invent numbers for these.",
      "Detection dependency: the engine is only as good as the flight-status/PNR feeds and the email-parser; missed or late detection means the agent arrives without the fix.",
      "Co-pilot violation risk: any auto-book or auto-charge breaks the governing rule and the trust it protects. Keep every commit user-confirmed.",
      "Time-critical windows missed (PIR before leaving, Montreal 7/21-day, US 7-business-day refund) silently forfeit rights if the banner/countdown fails to fire.",
      "Liability of stating 'you are owed X': framing must stay as informed guidance with citation + effective-date, not a legal guarantee; subrogation and no-double-recovery must be explained so users do not expect to stack the same loss.",
      "Missing rights/entitlement accent token in the Away DS could weaken the most load-bearing line; confirm the token or flag the gap.",
      "Container-fill white-on-white Figma gotcha and aggressive get_screenshot caching can hide build errors during iteration; clear fills to transparent up front and use inline node.screenshot()."
    ]
  },
  "personaMatrix": {
    "lead": "Eight canonical personas, run as test cases through one priority engine. Each is a weight-vector over about 20 flight params, not a fixed segment, and the same engine composes a hand-built-feeling input and copy register for each.",
    "dimensions": [
      { "key": "optimises", "label": "Optimises for" },
      { "key": "tell", "label": "The tell" },
      { "key": "leads", "label": "Away leads with" },
      { "key": "dial", "label": "Copy dial" }
    ],
    "columns": [
      {
        "key": "price-hunter",
        "name": "Devika",
        "archetype": "Price Hunter",
        "cells": {
          "optimises": "The rock-bottom all-in fare, and beating what her friends paid.",
          "tell": "Opens 5+ tabs, flexes dates by 3 days, takes the 4am red-eye for the win.",
          "leads": "The all-in floor plus the trap ruled out: 'beats your app by ₹4,100; the cheaper one strands you overnight in KL.'",
          "dial": "Edge, plain for the money mechanics. Warmth only if it breaks."
        }
      },
      {
        "key": "comfort-class",
        "name": "Mr. Subramanian",
        "archetype": "Comfort seeker",
        "cells": {
          "optimises": "A forward aisle seat, a layover long enough to walk, everything confirmed ahead.",
          "tell": "Asks twice, wants it in writing; books wheelchair assist and a slow layover.",
          "leads": "The comfort verdict first: 'aisle 14C, 2h40m layover, wheelchair booked both ends.' Fare second, stated plainly.",
          "dial": "Plain, leaning warm around the seat, the walk and the assistance."
        }
      },
      {
        "key": "time-boxed-pro",
        "name": "Arjun",
        "archetype": "Time-Boxed Pro",
        "cells": {
          "optimises": "The single fastest correct answer and his meeting buffer, not a menu.",
          "tell": "Types one terse line, bails on any quiz, pays ₹3k for reliability.",
          "leads": "A verdict as a buffer trade: 'SQ 7:10am, ₹3k more, 4h buffer. Take it.' One tap books, calendars and files the receipt.",
          "dial": "Edge at the decision, plain through booking. Warmth once, when the buffer collapses."
        }
      },
      {
        "key": "family-coordinator",
        "name": "Sneha",
        "archetype": "Family Coordinator",
        "cells": {
          "optimises": "Four seats together, one all-in price, bags and check-in handled.",
          "tell": "Reads every fare as 'can we sit together?'; books late, in one sitting.",
          "leads": "The four-seats guarantee as the headline: 'row 24, all four, 2 bags each, ₹68,400 final.' Rules out the split-seat trap.",
          "dial": "Mostly plain for logistics; tips to warmth at the anxious wait and a broken connection."
        }
      },
      {
        "key": "loyalty-optimizer",
        "name": "Karthik",
        "archetype": "Loyalty Optimizer",
        "cells": {
          "optimises": "Tier credit and paise-per-mile value, judged before price.",
          "tell": "Sorts by fare class, does mile math in his head, walks from sub-1p/mile 'deals'.",
          "leads": "The cash-vs-miles ruling in his units: 'don't burn 35k miles at 0.6p, pay cash, keep the miles', full tier credit kept.",
          "dial": "Edge-dominant, plain for logistics. Warmth is edge-flavoured: 'you lose no status.'"
        }
      },
      {
        "key": "flexible-explorer",
        "name": "Riya",
        "archetype": "Flexible Explorer",
        "cells": {
          "optimises": "The cheapest date-and-city combo, and a base she can actually work from.",
          "tell": "Types intent not a form, leaves dates a week loose, won't babysit the trip.",
          "leads": "The collapsed verdict from about 40 combos: 'Da Nang, Mar 11 to 25, dodges the festival spike, wifi tested, ₹54k all-in.'",
          "dial": "Edge then plain. Warmth only if a connection drops while she is solo."
        }
      },
      {
        "key": "anxious-first-timer",
        "name": "Meera",
        "archetype": "Anxious First-Timer",
        "cells": {
          "optimises": "Amma safe and comfortable, nothing breaking on her watch, no hidden surprises.",
          "tell": "Refreshes on any silence, re-reads the verdict twice, checks names against passports.",
          "leads": "Reassurance before information: 'I see it, you are rebooked, Amma's lift rescheduled, you are okay.' Logistics filed underneath.",
          "dial": "Warmth-dominant, plain underneath. Edge once, at the verdict."
        }
      },
      {
        "key": "offer-maximizer",
        "name": "Nikhil",
        "archetype": "Offer Maximizer",
        "cells": {
          "optimises": "The perfect card-offer stack, discount plus EMI plus points plus lounge, nothing left on the table.",
          "tell": "Knows his cards cold; routes the booking through combos to find the deepest stack.",
          "leads": "The winning stack as the verdict: 'book on ICICI Amex, ₹6,000 off + 5x points + 2 lounge visits, beats your other cards this month.'",
          "dial": "Edge-dominant, plain for payment mechanics. Warmth once, protecting the stack at a disruption."
        }
      }
    ],
    "interfaceNote": "The UI never forks per persona. One generative input and one copy dial reflow to each: edge where Away wins for you, plain and calm where you are exposed (first 30s, money, errors), all warmth in a real crisis."
  },

  "personas": [
    {
      "key": "price-hunter",
      "name": "Devika",
      "archetype": "The Price Hunter",
      "tagline": "Treats every fare like a personal challenge, and a 4am red-eye is a fair price for the win.",
      "who": "21, a final-year college student in Bengaluru planning the post-exam graduation trip to Bangkok with three friends, all on pooled-together student money. The trip is the reward for four years of grind, so it has to happen, but it has to come in under everyone's tight budget or it doesn't happen at all. She's done all the trip research herself in a shared notes doc, and she's the one the group trusts to \"find the cheap flight.\"",
      "cares": [
        "The rock-bottom number, is this genuinely the floor for BLR→BKK, or can she squeeze it lower with flexible dates and odd hours?",
        "Coming in under what her friends paid, winning the fare is half the point; bragging rights are the other half.",
        "No nasty surprise at checkout, convenience fees, seat charges, baggage add-ons that quietly inflate the 'cheap' fare she chose."
      ],
      "tells": [
        "Opens 5+ tabs, MMT, Cleartrip, Skyscanner, the airline direct site, and cross-checks the same route across all of them before trusting any single price.",
        "Flexes dates by ±3 days and filters in red-eyes and 5am departures on purpose; a 4am flight that saves ₹3k is a feature, not a deterrent.",
        "Books in incognito because she's convinced the fare jumps if the site 'sees her looking twice', and screenshots the low fare as proof before it moves.",
        "Waits and watches instead of buying, refreshes for days hoping for the dip, then risks panic-booking when she fears she missed it."
      ],
      "frustrations": [
        "The 'cheap' headline fare balloons at checkout, 18% off a base fare that didn't include cabin baggage, seat, or the payment-gateway convenience fee, so the number she chased isn't the number she pays.",
        "The cheapest result is often a trap she can't see, a 9-hour overnight KL layover or a self-transfer with no protection, and budget apps cheerfully sort it to the top anyway.",
        "She second-guesses the timing forever: did she book too early, too late, leave money on the table? No app ever tells her whether the price she got was actually good."
      ],
      "quote": "\"I'll take the 4am flight, I don't care, just tell me it's actually the cheapest and there's no catch I'm missing at checkout.\"",
      "awayLeadsWith": "The savings number and the verdict, together, leads with the all-in price (taxes, bags, convenience fee already inside) framed as \"this is the floor / this beats the app you tried by ₹4,100,\" and in the same breath rules out the fake-cheap trap (\"the ₹8,200 one strands you overnight in KL, this ₹9,400 actually wins\"). She sees the win and the catch she'd have missed, before anything else.",
      "dialNote": "Dominantly edge, plain underneath. Edge because what wins her is the quiet verdict, the floor confirmed, the trap ruled out, \"you beat the price.\" Plain for the money mechanics, all-in number, no upsell, fare locked with no checkout jump. Warmth only surfaces when it goes wrong (the 3am cancellation her budget can't absorb), then recedes; she doesn't want hand-holding, she wants the win."
    },
    {
      "key": "comfort-class",
      "name": "Mr. Subramanian",
      "archetype": "The Comfort seeker",
      "tagline": "A good seat, a slow walk, and someone who's already thought of the knee.",
      "who": "58, recently retired bank manager in Chennai; old-school, courteous, does things properly or not at all. He's flying Delhi to London to spend a month with his daughter and her new baby, his first long-haul in years, and his knees are not what they were. He'll happily pay more for a forward aisle seat and an extra hour of layover; what he won't tolerate is a scramble, a tight connection, or being made to feel like he's holding up a queue. His daughter set up the app on his phone and told him to just type to it.",
      "cares": [
        "An aisle seat near the front, extra legroom, and a layover long enough to walk slowly, no sprinting between gates with bad knees",
        "Everything sorted and confirmed in advance, boarding pass, wheelchair-assist booked, no surprises at the counter",
        "Being spoken to plainly and respectfully, clear next steps, no jargon, no rush"
      ],
      "tells": [
        "Asks the same question twice to be sure, 'so the seat is confirmed, the aisle one?', and wants it in writing, not just reassurance",
        "Books wheelchair assistance and a long layover on purpose; reads the seat map carefully and avoids the rear of the cabin",
        "Phones his daughter to double-check anything the app tells him before he acts on it",
        "Prints the boarding pass and itinerary even though it's on the phone, paper is reassurance"
      ],
      "frustrations": [
        "Tight 60-minute connections that assume he can power-walk a terminal; he's missed one before and won't risk it again",
        "Apps that bury the seat and assistance details, or hand him a 'cheapest fare' that's a middle seat at the back with a hard upgrade fee",
        "Being rushed, fast-talking agents, hidden steps, and finding out at the airport that wheelchair-assist was never actually booked"
      ],
      "quote": "\"I don't mind paying a little more. Just give me a proper seat, enough time to walk, and tell me plainly that it's all taken care of.\"",
      "awayLeadsWith": "Leads with the comfort verdict, not the price: 'Aisle seat, 14C, near the front for easy boarding, confirmed. Your London layover is 2h 40m, plenty of time to walk it slowly. Wheelchair assist is booked at both Delhi and Heathrow.' The fare comes second, stated plainly and calmly; reassurance that it's all genuinely done comes first.",
      "dialNote": "Plain-leaning-warm. Money and logistics are delivered calm and clear (plain), but his real need is reassurance, so Away softens into warmth around the things he worries about: the seat, the walk, the assistance, the 'it's all handled, you don't need to do anything at the counter.'"
    },
    {
      "key": "time-boxed-pro",
      "name": "Arjun",
      "archetype": "The Time-Boxed Pro",
      "tagline": "Doesn't want options. Wants the answer, and his meeting buffer left intact.",
      "who": "34, management consultant in Bengaluru, flying BLR to Singapore for a 2-day client visit. The trip is a means to an end: he has to be in the room near Marina Bay by Wednesday afternoon and back at his desk by Friday. He books from the back of a Meru between meetings, types in fragments, and judges every tool by how few taps it takes. He's flown this Gulf-and-Southeast-Asia circuit enough times to have opinions, but not enough free attention to manage it himself.",
      "cares": [
        "Protecting the buffer before his meeting, landing early enough to shower, prep and still have slack if the flight slips",
        "The single fastest correct answer, not a wall of fare options to compare himself",
        "Clean one-tap execution that lands on his calendar and produces a proper tax receipt he can drop straight into the expense claim"
      ],
      "tells": [
        "Types one terse line, 'blr to singapore tue-thu, land by 2pm wed', and bails on anything that opens a multi-step quiz or a signup essay",
        "Books a morning flight with a deliberate cushion, never the last reasonable connection, because a tight change is a risk he won't carry into a client meeting",
        "Hates dead air, a spinner with no ETA makes him alt-tab away; he wants '90 seconds' not 'soon'",
        "Pays the ₹3k premium without blinking when it buys him on-time reliability or hours of buffer; time is the currency, not rupees"
      ],
      "frustrations": [
        "Apps that bury the verdict under fifteen near-identical fares and make him do the on-time-record math himself",
        "Onboarding quizzes, upsell carousels and 'create your profile' walls that stand between him and a booking he could've made in two taps",
        "Getting stranded by a self-booked tight connection or a quiet diversion with no one rebooking him, the buffer he guarded evaporating while he's mid-air and unreachable"
      ],
      "quote": "Don't show me forty flights. Tell me which one gets me there with time to spare, book it, put it on my calendar, and leave me alone.",
      "awayLeadsWith": "The decided verdict, stated as a buffer trade, one flight, the reason, and a 'take it': 'SQ 7:10am, ₹3k more but lands you 4 hours of buffer ahead of your meeting. Take it.' One tap books it, drops both flight and hotel on his calendar, and files the receipt. It never makes him choose between options or wait on a spinner without an ETA.",
      "dialNote": "Edge-dominant, plain underneath. At the decision point Away is pure edge, it has already done the comparison and hands him a verdict with the buffer math, not a shortlist. Through booking and watch it drops to plain: terse, logistical, 'nothing left to do.' Warmth surfaces only once, the moment his guarded buffer collapses, the mid-air diversion to KL, where it leads with the fix already done ('rebooked, you still make the 3pm, car's waiting') before he can even feel the panic."
    },
    {
      "key": "family-coordinator",
      "name": "Sneha",
      "archetype": "The Family Coordinator",
      "tagline": "If the four of us aren't sitting together, it isn't booked yet.",
      "who": "39, lives in Mumbai (Chembur), mother of two, a 6-year-old and a 9-year-old. She's the household's default trip-planner: the one with everyone's passport numbers in a Notes file, the WhatsApp group admin, the one who packs the kids' bags the night before. This is the school summer-break trip, Mumbai to Phuket, six days, two adults, two kids, and it's on her to make it feel effortless for everyone but herself. She books late at night after the kids are asleep, on her phone, with one eye on the clock.",
      "cares": [
        "Four seats together, the kids cannot be split across rows or aisles from a parent, full stop",
        "No nasty surprises, final all-in price with bags and taxes, no add-on creep at checkout, no midnight landing with sleepy kids",
        "Bags and check-in handled, enough free check-in allowance for four, and the web check-in seats grabbed the second the window opens"
      ],
      "tells": [
        "Reads every fare as 'but can we actually sit together?', ignores the cheapest option if it can't guarantee a 4-seat block",
        "Books late at night on her phone after the kids sleep; wants it done in one sitting, not parked half-finished",
        "Sets a reminder for the moment web check-in opens (48 hours before) and pounces on it to lock seats before the flight fills",
        "Forwards the final itinerary to the family WhatsApp group so her husband and the grandparents have it too"
      ],
      "frustrations": [
        "Airline seat maps show '4 seats free' but at payment they're scattered, 24A and 31F, and reserving them together costs extra per seat she didn't budget for",
        "Add-on creep: a fare that looked cheap balloons once she adds two checked bags, seat selection, and kids' meals",
        "When a connection breaks she's not just rebooking herself, she's doing it one-handed in a strange airport with two tired, hungry kids melting down beside her"
      ],
      "quote": "Don't show me the cheapest one. Show me the one where my kids are next to me, the bags are already in, and nobody's landing at 1am.",
      "awayLeadsWith": "Leads with the four-seats-together guarantee as the headline of every option, 'row 24, all four side by side, 2 bags each, taxes in, ₹68,400 final', so the seat block and the all-in price are the verdict, not a checkout surprise. It actively rules out the ₹4k-cheaper fare with a 50-minute, two-terminal change because that's a non-starter with kids, and it pre-commits to grabbing her 4 seats the moment web check-in opens.",
      "dialNote": "Mostly plain, she lives in logistics, so the seat block, the bag allowance, and the one final number are stated flatly and completely, no fluff. It tips to warmth at the two pressure points: the anxious wait ('still hunting the one with 4 seats together, won't settle') and the broken connection, when 'all 4 rebooked, seats together, lounge passes sent, wait inside' is doing the emotional work for a frazzled mom with two kids in tow."
    },
    {
      "key": "loyalty-optimizer",
      "name": "Karthik",
      "archetype": "The Loyalty Optimizer",
      "tagline": "Optimizes every trip down to the paise-per-mile, and quietly needs someone to tell him when optimizing is the trap.",
      "who": "41, Chennai-based, a senior consulting/sales lead who's on a flight most weeks, MAA→DXB and the Gulf sector is his bread and butter. He's chasing his airline's top tier for the year (the lounge, the priority lane, the upgrade chances) and sits on a six-figure miles balance he's almost protective of. This Dubai run is a short work trip, but in his head it's also a status run, every segment is tier-credit he's counting toward re-qualifying.",
      "cares": [
        "Protecting his tier, every fare judged first on whether it earns full status/tier credit, not just on price",
        "Spending miles only when they actually pay off, he knows his floor in paise-per-mile and won't burn points below it",
        "No silent value leaks, fare drops, devaluations, downgraded cabins on a reroute, miles that don't post"
      ],
      "tells": [
        "Sorts by fare class, not price, checks whether it's a status-earning bucket before he even looks at the rupee figure",
        "Does paise-per-mile math in his head and walks away from 'deals' below about 1 paise/mile, even when the redemption looks flashy",
        "Logs into the airline app after every flight to confirm miles and tier credit actually posted, and chases it if they didn't",
        "Books the cash fare over the award seat when the math says so, and feels smug about the miles he didn't waste"
      ],
      "frustrations": [
        "Apps that push the flashy points redemption as a 'great deal' when it's 0.6 paise/mile, they optimize for looking clever, not for his actual value bar",
        "Cheap rebookings after a disruption that quietly drop him to a non-status fare bucket or a lower cabin, costing him the tier credit he flew for",
        "Generic booking flows that don't know his airline, his tier, or his miles balance, so he has to re-run the whole loyalty calculation himself every single time"
      ],
      "quote": "\"Don't sell me the redemption, tell me what it's actually worth per mile. If cash wins, I want to keep my miles and still earn the tier credit. The day an app stops me from making a bad points trade is the day I trust it.\"",
      "awayLeadsWith": "Leads with the verdict on cash vs. miles, in his units: \"Don't burn 35k miles here, that's 0.6 paise each. Pay cash, keep the miles.\" It surfaces the honest call against his own optimizing instinct first, flags the bad redemption, then confirms the fare still earns full tier credit and that he's about 4k miles from re-qualifying. The savings and status math are the hero; the booking is an afterthought.",
      "dialNote": "Edge-dominant, plain underneath. He wants the ruling, \"take the cash, the miles trade is bad value\", stated with conviction, because a verdict that goes against his own bias is exactly the ally he's missing. Plain carries the tier-credit and miles-posted logistics. Warmth only appears at disruption, and even then it's edge-flavoured reassurance: the thing he fears losing is status credit, so Away reassures by confirming \"same cabin, full tier credit kept, you lose nothing.\""
    },
    {
      "key": "flexible-explorer",
      "name": "Riya",
      "archetype": "The Flexible Explorer",
      "tagline": "No fixed dates, no fixed city, she'd rather hand over the \"where and when\" than agonise over it.",
      "who": "28, a remote product designer on a laptop-anywhere contract, currently subletting in Goa. She has a month free in March and a vague pull toward Southeast Asia, no flights booked, no city chosen, just \"somewhere warm I can work from.\" She travels slow: one base for weeks, not a 5-city sprint. Because nothing is fixed, she's the rare Indian traveller who can actually catch the cheap window, if someone watches it for her instead of her doom-scrolling Skyscanner at 1am.",
      "cares": [
        "Landing in the genuine sweet spot, the cheapest date-and-city combo, not the first decent one",
        "A base she can actually work from: fast, tested wifi and a warm-but-not-monsoon climate",
        "Keeping it open-ended without it turning into a costly, paralysing mistake"
      ],
      "tells": [
        "Types intent, not a form, 'somewhere in SE Asia, sometime in March, under ₹60k' and expects that to be enough",
        "Won't pick between Chiang Mai and Da Nang herself, wants the data to decide, then a verdict",
        "Leaves dates ±a week loose on purpose, betting flexibility buys a cheaper fare",
        "Books flight + refundable stay in one go, then closes the app and goes back to work, won't babysit the trip"
      ],
      "frustrations": [
        "Every app demands an exact city and exact dates up front, the one thing she doesn't have and doesn't want to guess",
        "Open-endedness quietly costs her: she either books too early at a bad fare or freezes and the cheap window closes",
        "Generic 'best wifi' lists are guesswork, she's been burned by a 'digital nomad hub' with hotel wifi that died every afternoon"
      ],
      "quote": "\"Don't make me choose the city and the dates. Watch the combos, find the dip, and just tell me where I'm going.\"",
      "awayLeadsWith": "The collapsed verdict: out of about 40 date-and-city combinations, one winner, \"Da Nang, March 11-25. Dodges the festival price spike, wifi tested fast, ₹54k all-in.\" Her flexibility becomes the lever, and Away leads with the single decided answer plus what it ruled out, not a menu.",
      "dialNote": "edge then plain. Edge leads, she's handed over the decision, so the win is a confident verdict that turns 40 open combos into one pick and names the trap it dodged (the festival fare spike). Plain carries the money and logistics underneath, all-in number, refundable stay, eSIM, one card that works everywhere. Warmth only surfaces if a mid-trip connection drops while she's solo."
    },
    {
      "key": "anxious-first-timer",
      "name": "Meera Iyer",
      "archetype": "The Anxious First-Timer",
      "tagline": "The family fixer on her mother's first trip abroad, if anything breaks, it's on her.",
      "who": "34, a product manager in Bengaluru and the family's designated fixer, the one who handles tickets, hotels and the WhatsApp logistics group. She's taking her 61-year-old mother Lakshmi to Vietnam: Lakshmi's first time flying international, with bad knees and no working SIM once she's abroad. Meera isn't scared of travel itself, she's scared of being the only adult in the room when something goes wrong in a country where neither of them speaks the language.",
      "cares": [
        "Amma is safe and comfortable, short transfers, lifts not stairs, no 5am starts, wheelchair-on-request, and a way to reach her even with no SIM",
        "Nothing breaks on her watch, and if it does, it's caught before Amma ever notices",
        "No hidden surprises, the all-in price is the real price, both names match the passports exactly, and someone is actually watching the booking"
      ],
      "tells": [
        "Refreshes the screen during any silence, reads 'still checking…' as reassurance, reads a spinner with no words as abandonment",
        "Re-reads the verdict twice before her shoulders drop; double-checks both names against the passports before she pays",
        "Forwards every confirmation to the family WhatsApp group, being seen to have it handled is part of the relief",
        "Packs at midnight in a quiet panic over the one thing she hasn't solved, usually 'how does Amma reach me if her phone is dead abroad'"
      ],
      "frustrations": [
        "Booking apps go dark after 'payment successful', no one is watching the flight, and the moment something slips she's alone with a foreign call-centre at 2am",
        "Generic itineraries ignore Amma, tight connections, terminal changes, stairs and 5am departures that a senior traveller can't actually do",
        "Fine print and fake reviews, she can't tell the legit cheap option from the trap, and a hidden fee at checkout would confirm her worst fear about 'just another booking site with a chatbot'"
      ],
      "quote": "If anything breaks, it's on me, and Amma is watching me, in a country where neither of us speaks the language.",
      "awayLeadsWith": "Reassurance before information: Away leads with the fact that it's awake and watching both of them, 'I see it, you're already rebooked, Amma's airport lift is rescheduled, you're okay', the resolved outcome and Amma's care surfaced first, the logistics and the fare-difference claim filed quietly underneath. In calm moments it leads the same way: 'you'll only hear from me if something changes,' so silence finally feels safe instead of ominous.",
      "dialNote": "Warmth-dominant, plain underneath. Almost every beat of her journey runs warmth (onboard, the wait, pre-departure panic, the disruption, the recap) or plain (logistics and money, stated calmly so nothing reads as a surprise). Away only shifts to edge once, at the verdict, where ruling out the fake-review trap and the bad-transfer option is itself reassuring. She needs to feel held first and informed second; the competence is the gift, the calm is the wrapping."
    },
    {
      "key": "offer-maximizer",
      "name": "Nikhil",
      "archetype": "The Offer Maximizer",
      "tagline": "Comfortable enough not to need the discount, but leaving one on the table physically hurts.",
      "who": "32, lives in Mumbai (Lower Parel), works in product at a fintech, financially comfortable, money is genuinely not the constraint. What he can't stand is the idea that a bank offer existed and he didn't catch it. He carries a fat wallet of cards (HDFC Infinia, ICICI Amex, Axis Magnus, SBI Cashback) and knows, off the top of his head, which card plus which portal yields what discount, what points multiplier, and which lounge it unlocks. This Mumbai → Dubai long weekend is a flex trip, not a budget one, but he'll still route the booking through whichever card stacks the deepest instant discount, no-cost EMI and lounge access this month. Winning the stack is the sport; bragging about it on the group chat is the trophy.",
      "cares": [
        "The perfect stack, bank instant discount + no-cost EMI + max reward points + card-linked lounge access, all layered onto one booking",
        "Catching the offer-of-the-month before it rotates out, knowing HDFC/ICICI/Axis/SBI's live coupon for travel this cycle, not last month's stale banner",
        "Never leaving value on the table, every booking should extract the maximum the cards are willing to give, or it nags at him"
      ],
      "tells": [
        "Knows his cards cold, quotes 'ICICI Amex is 5x on travel this month, ₹6k instant off over ₹40k, beats Infinia's stack' from memory before he opens any portal",
        "Routes the same booking through different card+portal combos to compare which one stacks deepest, then screenshots the winning stack",
        "Chooses no-cost EMI even when he can pay in full, keeping the cash float and still taking the discount is the whole flex",
        "Logs into each bank app after travel to confirm the points and cashback actually posted, and raises a ticket the moment they don't"
      ],
      "frustrations": [
        "Booking flows that ignore his cards entirely, generic checkout that makes him manually hunt the coupon, eligibility caps and minimum-spend fine print himself",
        "The offer that looked stackable but wasn't, discount and no-cost EMI turn out mutually exclusive, or the coupon silently expired the day he booked",
        "A cancellation that tangles the offer layer, the bank claws back the instant discount, the no-cost EMI keeps running on a refunded ticket, and now he's filing a card dispute to recover value that was rightfully his"
      ],
      "quote": "\"I don't need the discount, but if HDFC's giving ₹6,000 off and 5x points this month and I miss it, that's going to bother me all weekend. Just tell me which card to swipe.\"",
      "awayLeadsWith": "The winning stack as the verdict, leads with the best card-and-offer combination already chosen and quantified: 'Book on ICICI Amex, not HDFC, ₹6,000 instant off + 5x points + 2 lounge visits beats your other cards this month.' It surfaces the optimization he'd have done himself, but better and faster, and confirms the offer applied at source with nothing left on the table. The fare is secondary; the stack is the hero.",
      "dialNote": "Edge-dominant, plain underneath. Edge because what wins him is the quiet flex of the perfect stack, the right card named, the discount + EMI + points + lounge layered, 'clean win, nothing left behind.' Plain carries the payment mechanics: instant discount applied at source, no-cost EMI confirmed, points pending post-travel, DCC dodged. Warmth surfaces only once, at the disruption, the moment a cancellation threatens to unravel the discount, the EMI and the refund into a bank dispute, where Away leads by protecting the stack ('your ₹6,000 discount and no-cost EMI both stay intact') before he can spiral into dread."
    }
  ],
  "journeys": [
    {
      "user": {
        "name": "Devika",
        "persona": "The Price Hunter",
        "trip": "Bengaluru → Bangkok, graduation trip, tight student budget",
        "oneLine": "21, college senior who'll fly at 4am to save 3k and treats every fare like a personal challenge"
      },
      "stages": [
        {
          "stage": "01 Onboard",
          "moment": "Skeptical. another travel app that'll upsell me?",
          "away": "tell me your budget and i'll fight for every rupee. no upsells.",
          "emotion": 1,
          "tone": "plain"
        },
        {
          "stage": "02 Home + intent",
          "moment": "Types: Bangkok, cheapest, dates flexible, any hour",
          "away": "bangkok on a student budget. flexible dates, odd hours ok. got it.",
          "emotion": 2,
          "tone": "plain"
        },
        {
          "stage": "03 The brief",
          "moment": "Wants the rock-bottom number, no fluff",
          "away": "hunting the floor: bengaluru→bangkok, ±3 days, red-eyes included. one fare to beat.",
          "emotion": 2,
          "tone": "plain"
        },
        {
          "stage": "04 The wait",
          "moment": "Prices keep moving. did i miss the cheap one?",
          "away": "fares twitching today. holding for the dip, not the panic-buy. sit tight.",
          "emotion": -1,
          "tone": "warmth"
        },
        {
          "stage": "05 Vet + verdict",
          "moment": "Cheapest had a 9-hour layover trap. she'd have booked it.",
          "away": "the ₹8,200 one strands you overnight in KL. this ₹9,400 actually wins.",
          "emotion": 2,
          "tone": "edge"
        },
        {
          "stage": "06 Book",
          "moment": "Booking. praying the price doesn't jump at checkout",
          "away": "₹9,400 locked, no surprise fees added. saved ₹4,100 vs the app you tried.",
          "emotion": 3,
          "tone": "plain"
        },
        {
          "stage": "07 First hours",
          "moment": "Did the cheap fare actually go through? real ticket?",
          "away": "ticket confirmed, PNR in. it's real, it's cheap, it's yours.",
          "emotion": 2,
          "tone": "plain"
        },
        {
          "stage": "08 The watch",
          "moment": "Could it have dropped more after i booked?",
          "away": "watching your fare. if it drops, i'll claim the refund difference for you.",
          "emotion": 2,
          "tone": "plain"
        },
        {
          "stage": "09 Pre-departure",
          "moment": "4am flight. visa, baht, will i make it?",
          "away": "leave by 1:30am. e-visa ready, ₹ rate best at this kiosk, not airport.",
          "emotion": 1,
          "tone": "plain"
        },
        {
          "stage": "10 In motion",
          "moment": "At the gate, half-asleep, the cheap red-eye worth it",
          "away": "gate A6, on time. you beat the crowd and the price. nice.",
          "emotion": 2,
          "tone": "edge"
        },
        {
          "stage": "11 Disruption → Rescue",
          "moment": "Flight cancelled at 3am. budget can't absorb this.",
          "away": "got you on the 7am, no fare difference. your trip's still on. breathe.",
          "emotion": -3,
          "tone": "warmth"
        },
        {
          "stage": "12 Recap",
          "moment": "Made it. spent less than friends, survived the scare",
          "away": "₹4,100 under budget, one cancel dodged. bangkok cost you less than your friends paid.",
          "emotion": 3,
          "tone": "warmth"
        }
      ]
    },
    {
      "user": {
        "name": "Mr. Subramanian",
        "persona": "The Comfort seeker, 58, careful and old-school; price is secondary, a good seat and an easy trip are everything",
        "trip": "Delhi (DEL) → London (LHR), visiting his daughter; bad knees, wants legroom and no rush",
        "oneLine": "A 58-year-old father flying to his daughter who just wants his knees and his nerves looked after"
      },
      "stages": [
        {
          "stage": "01 Onboard",
          "moment": "Tries a travel app his daughter recommended",
          "away": "tell me how you like to travel. we'll handle the rest.",
          "emotion": 1,
          "tone": "plain"
        },
        {
          "stage": "02 Home + intent",
          "moment": "Types that he needs legroom and a calm trip",
          "away": "delhi to london, comfort first. knees noted. price comes second.",
          "emotion": 1,
          "tone": "plain"
        },
        {
          "stage": "03 The brief",
          "moment": "Asks for an aisle seat and no tight connection",
          "away": "got it: aisle, extra legroom, direct only. no mad dashes.",
          "emotion": 2,
          "tone": "plain"
        },
        {
          "stage": "04 The wait",
          "moment": "Waiting; wonders if a good seat is even possible",
          "away": "checking real legroom and seat maps, not just the photos. one minute.",
          "emotion": 0,
          "tone": "warmth"
        },
        {
          "stage": "05 Vet + verdict",
          "moment": "Sees the pick; one option had a cramped seat",
          "away": "this one. direct, 34\" legroom, aisle free. skipped the knee-cruncher.",
          "emotion": 3,
          "tone": "edge"
        },
        {
          "stage": "06 Book",
          "moment": "Pays a bit more for the roomy seat, gladly",
          "away": "booked. seat 14C locked, meal set, ₹6,200 more for the legroom. worth it.",
          "emotion": 2,
          "tone": "plain"
        },
        {
          "stage": "07 First hours",
          "moment": "Quietly hopes the seat is really confirmed",
          "away": "all confirmed. aisle 14C is yours. wheelchair assist offered if you want it.",
          "emotion": 2,
          "tone": "plain"
        },
        {
          "stage": "08 The watch",
          "moment": "Forgets about it; gets a gentle nudge later",
          "away": "still watching your flight. seat held. nothing for you to do.",
          "emotion": 2,
          "tone": "plain"
        },
        {
          "stage": "09 Pre-departure",
          "moment": "Night before; the usual quiet worry returns",
          "away": "leave by 4:30pm. terminal 3, gate near assist desk. knee-friendly route saved.",
          "emotion": 1,
          "tone": "plain"
        },
        {
          "stage": "10 In motion",
          "moment": "At the gate, settling in, feeling looked after",
          "away": "boarding on time, 14C confirmed. assist team knows you're coming.",
          "emotion": 2,
          "tone": "plain"
        },
        {
          "stage": "11 Disruption → Rescue",
          "moment": "Flight cancelled mid-journey; dreads a cramped reroute",
          "away": "we've got you. rebooked direct, aisle 12C, extra legroom. car waiting at lhr.",
          "emotion": -3,
          "tone": "warmth"
        },
        {
          "stage": "12 Recap",
          "moment": "Hugs his daughter; the trip stayed easy on him",
          "away": "delhi to london, knees intact. legroom held both ways. welcome to your daughter's.",
          "emotion": 3,
          "tone": "warmth"
        }
      ]
    },
    {
      "user": {
        "name": "Arjun",
        "persona": "The Time-Boxed Pro",
        "trip": "Bengaluru → Singapore, 2-day client visit",
        "oneLine": "34, management consultant, terse; wants the fastest fix and his meeting buffer protected"
      },
      "stages": [
        {
          "stage": "01 Onboard",
          "moment": "Tries it between calls, expects fluff and friction",
          "away": "no signup essay. tell me where, when, and i'll handle the rest.",
          "emotion": 0,
          "tone": "plain"
        },
        {
          "stage": "02 Home + intent",
          "moment": "Types one line, no patience for a quiz",
          "away": "blr → singapore, tue-thu. got it. buffer before your meeting noted.",
          "emotion": 1,
          "tone": "plain"
        },
        {
          "stage": "03 The brief",
          "moment": "Spells out the only thing that matters: land early",
          "away": "land by 2pm wed, hotel near marina bay, aisle seat. anything else?",
          "emotion": 1,
          "tone": "plain"
        },
        {
          "stage": "04 The wait",
          "moment": "Nothing back yet; he hates dead air",
          "away": "comparing 40 fares and on-time records. 90 seconds, not a spinner forever.",
          "emotion": -1,
          "tone": "plain"
        },
        {
          "stage": "05 Vet + verdict",
          "moment": "Wants the answer, not the options",
          "away": "SQ at 7:10am. costs ₹3k more but lands 4hrs of buffer ahead. take it.",
          "emotion": 2,
          "tone": "edge"
        },
        {
          "stage": "06 Book",
          "moment": "Approves, expects it done cleanly in one tap",
          "away": "booked. aisle 14C, hotel held, both on your calendar. nothing left to do.",
          "emotion": 2,
          "tone": "plain"
        },
        {
          "stage": "07 First hours",
          "moment": "Back to work, half-expecting a hidden snag",
          "away": "visa-free, you're set. boarding pass lands here at check-in. go work.",
          "emotion": 2,
          "tone": "plain"
        },
        {
          "stage": "08 The watch",
          "moment": "Forgot about it; trip runs in the background",
          "away": "watching your flight and the hotel rate. you don't need to check in.",
          "emotion": 2,
          "tone": "plain"
        },
        {
          "stage": "09 Pre-departure",
          "moment": "Night before; one last thing he didn't want to think about",
          "away": "cab at 4:40am, terminal 1, seat 14C. weather clear. early night.",
          "emotion": 2,
          "tone": "plain"
        },
        {
          "stage": "10 In motion",
          "moment": "At the gate, on schedule, briefly relaxed",
          "away": "gate A19, on time. landing 1:30pm sgt, your buffer holds.",
          "emotion": 2,
          "tone": "plain"
        },
        {
          "stage": "11 Disruption → Rescue",
          "moment": "Mid-air diversion; the buffer he guarded is gone",
          "away": "diverted to KL. rebooked you on the 11:40, you still make the 3pm. car's waiting.",
          "emotion": -3,
          "tone": "warmth"
        },
        {
          "stage": "12 Recap",
          "moment": "Walked into the meeting on time; it just worked",
          "away": "made it with 50 mins to spare. receipts filed, return's set. welcome back.",
          "emotion": 3,
          "tone": "edge"
        }
      ]
    },
    {
      "user": {
        "name": "Sneha",
        "persona": "The Family Coordinator",
        "trip": "Mumbai → Phuket, 6-day family holiday for 4 (kids 6 & 9), school summer break",
        "oneLine": "39, mom of two, the one who holds the whole family's trip together, wants bags handled, seats together, no surprises."
      },
      "stages": [
        {
          "stage": "01 Onboard",
          "moment": "Downloads it at 11pm after the kids sleep, skeptical.",
          "away": "tell me who's coming and i'll keep everyone together.",
          "emotion": 0,
          "tone": "plain"
        },
        {
          "stage": "02 Home + intent",
          "moment": "Types: Mumbai to Phuket, 2 adults 2 kids, June.",
          "away": "four of you, school break, beach. on it.",
          "emotion": 1,
          "tone": "plain"
        },
        {
          "stage": "03 The brief",
          "moment": "Adds the must-haves: seats together, check-in bags, no red-eye.",
          "away": "4 seats side by side, bags included, no midnight landing. noted.",
          "emotion": 2,
          "tone": "plain"
        },
        {
          "stage": "04 The wait",
          "moment": "Hours pass, no answer yet, did it forget us?",
          "away": "still hunting the one with 4 seats together. won't settle.",
          "emotion": -1,
          "tone": "warmth"
        },
        {
          "stage": "05 Vet + verdict",
          "moment": "It ruled out the cheap one, a tight layover with kids.",
          "away": "skipped the ₹4k-cheaper one: 50-min change, 2 terminals, with kids. no.",
          "emotion": 2,
          "tone": "edge"
        },
        {
          "stage": "06 Book",
          "moment": "One fare, four seats locked, bags in, she pays.",
          "away": "row 24, all four together. 2 bags each, taxes in. ₹68,400 final.",
          "emotion": 3,
          "tone": "plain"
        },
        {
          "stage": "07 First hours",
          "moment": "Wonders if seats and bags really stuck after booking.",
          "away": "confirmed: 24 A-D held, 8 bags tagged. saved to your trip.",
          "emotion": 2,
          "tone": "plain"
        },
        {
          "stage": "08 The watch",
          "moment": "Three weeks out, half-forgets, then a quiet ping.",
          "away": "web check-in opens in 6 hrs. i'll grab your 4 seats first.",
          "emotion": 2,
          "tone": "plain"
        },
        {
          "stage": "09 Pre-departure",
          "moment": "Night before, packing two kids, double-checking everything.",
          "away": "boarding passes ready, terminal 2, gate by 6am. bags: 15kg each.",
          "emotion": 2,
          "tone": "plain"
        },
        {
          "stage": "10 In motion",
          "moment": "At the gate, kids restless, watching the board.",
          "away": "you're checked in, seats together. gate's on time. breathe.",
          "emotion": 2,
          "tone": "plain"
        },
        {
          "stage": "11 Disruption → Rescue",
          "moment": "Connection cancelled, stranded in Bangkok with two tired kids.",
          "away": "got you. rebooked all 4, 8:40pm, seats together. lounge passes sent, wait inside.",
          "emotion": -3,
          "tone": "warmth"
        },
        {
          "stage": "12 Recap",
          "moment": "Home, kids asleep, scrolls back through the whole trip.",
          "away": "4 of you, 0 separated, 1 mess i caught. ₹3,100 back for the delay.",
          "emotion": 3,
          "tone": "warmth"
        }
      ]
    },
    {
      "user": {
        "name": "Karthik",
        "persona": "The Loyalty Optimizer, 41, frequent flyer who runs every trip through a miles-and-status calculator, but secretly wants someone to stop him from making bad points trades.",
        "trip": "Chennai (MAA) → Dubai (DXB), short work trip, wants to protect his airline status and spend miles only when they actually pay off.",
        "oneLine": "He optimizes everything; he needs an ally that tells him when optimizing is the trap."
      },
      "stages": [
        {
          "stage": "01 Onboard",
          "moment": "Skeptical, another app that won't know miles math.",
          "away": "tell us your airlines and tiers. we'll only spend miles when they actually pay off.",
          "emotion": 1,
          "tone": "edge"
        },
        {
          "stage": "02 Home + intent",
          "moment": "Types the trip, eyeing his status run for the year.",
          "away": "chennai to dubai. want this to protect your tier, or just get you there cheap?",
          "emotion": 2,
          "tone": "plain"
        },
        {
          "stage": "03 The brief",
          "moment": "Lays out his rules: keep status, miles only if worth it.",
          "away": "got it. status-earning fares first, award seats only if the value clears your bar.",
          "emotion": 2,
          "tone": "plain"
        },
        {
          "stage": "04 The wait",
          "moment": "Worries it'll just push the flashy points redemption.",
          "away": "running the numbers on cash vs miles across both airlines. won't sugarcoat it.",
          "emotion": 0,
          "tone": "plain"
        },
        {
          "stage": "05 Vet + verdict",
          "moment": "The honest call lands: his miles plan is bad value.",
          "away": "don't burn 35k miles here, that's 0.6 paise each. pay cash, keep the miles.",
          "emotion": 3,
          "tone": "edge"
        },
        {
          "stage": "06 Book",
          "moment": "Books the status-earning cash fare, miles untouched.",
          "away": "booked. full tier credit, miles intact. you're about 4k miles from re-qualifying.",
          "emotion": 3,
          "tone": "plain"
        },
        {
          "stage": "07 First hours",
          "moment": "Checks the points posted correctly, half-expecting an error.",
          "away": "fare confirmed for tier credit. we'll verify the miles post after you fly.",
          "emotion": 2,
          "tone": "plain"
        },
        {
          "stage": "08 The watch",
          "moment": "Notices a fare drop he'd normally have missed.",
          "away": "same flight dropped 2,100 rupees. rebooked you, same tier credit. no action needed.",
          "emotion": 3,
          "tone": "edge"
        },
        {
          "stage": "09 Pre-departure",
          "moment": "Wants lounge access and seat sorted without faff.",
          "away": "your tier gets the dxb lounge and free seat select. seat 4c held for you.",
          "emotion": 2,
          "tone": "plain"
        },
        {
          "stage": "10 In motion",
          "moment": "At the gate, boarding, everything tracking smoothly.",
          "away": "boarding on time, gate a12. priority lane is open with your card. miles on track.",
          "emotion": 2,
          "tone": "plain"
        },
        {
          "stage": "11 Disruption → Rescue",
          "moment": "Inbound flight cancelled, fears losing the status credit.",
          "away": "we already moved you to the 6:40, same cabin, full tier credit kept. you lose nothing.",
          "emotion": -3,
          "tone": "warmth"
        },
        {
          "stage": "12 Recap",
          "moment": "Re-qualified for status, miles bank still full.",
          "away": "tier renewed, 35k miles saved, +1,950 earned. the bad redemption we skipped: avoided.",
          "emotion": 3,
          "tone": "edge"
        }
      ]
    },
    {
      "user": {
        "name": "Riya",
        "persona": "The Flexible Explorer",
        "trip": "Somewhere in Southeast Asia, sometime in March, remote work + slow travel, no fixed dates or city",
        "oneLine": "28, remote worker who'd rather hand over the 'where and when' than agonize over it"
      },
      "stages": [
        {
          "stage": "01 Onboard",
          "moment": "Tells it she's flexible, no dates, no city picked",
          "away": "no fixed plan? good. that's the part i'm best at.",
          "emotion": 1,
          "tone": "plain"
        },
        {
          "stage": "02 Home + intent",
          "moment": "Types 'somewhere in SE Asia, sometime in March'",
          "away": "march, southeast asia, you can work from there. i'll find the sweet spot.",
          "emotion": 2,
          "tone": "plain"
        },
        {
          "stage": "03 The brief",
          "moment": "Adds: good wifi, under 60k, warm but not soaked",
          "away": "fast wifi, dry-ish, under ₹60k. chiang mai or da nang are leading.",
          "emotion": 2,
          "tone": "plain"
        },
        {
          "stage": "04 The wait",
          "moment": "Nothing locked yet, is open-ended a mistake?",
          "away": "watching 40 date-and-city combos. holding out for the real dip.",
          "emotion": -1,
          "tone": "plain"
        },
        {
          "stage": "05 Vet + verdict",
          "moment": "Sees the pick: Da Nang, March 11-25",
          "away": "da nang wins. march 11 dodges the festival price spike. wifi tested, fast.",
          "emotion": 3,
          "tone": "edge"
        },
        {
          "stage": "06 Book",
          "moment": "One screen, flight, stay, the lot",
          "away": "₹54,200 all in. refundable stay. one tap and march is settled.",
          "emotion": 3,
          "tone": "plain"
        },
        {
          "stage": "07 First hours",
          "moment": "Booked. The open plan finally has an anchor",
          "away": "you're going. saved you ₹6k by waiting. café list for working drops next week.",
          "emotion": 2,
          "tone": "edge"
        },
        {
          "stage": "08 The watch",
          "moment": "Back to work, half-forgets the trip exists",
          "away": "stay price dropped, i rebooked the same room ₹1,900 cheaper. nothing for you to do.",
          "emotion": 2,
          "tone": "plain"
        },
        {
          "stage": "09 Pre-departure",
          "moment": "Two days out, packing for a month away",
          "away": "e-visa approved, saved. da nang's 31° and humid. one card works everywhere there.",
          "emotion": 2,
          "tone": "plain"
        },
        {
          "stage": "10 In motion",
          "moment": "Layover in Bangkok, gate just changed",
          "away": "gate moved to D6, 8-min walk. your bag's checked through. plenty of time.",
          "emotion": 2,
          "tone": "plain"
        },
        {
          "stage": "11 Disruption → Rescue",
          "moment": "Connecting flight cancelled, stranded mid-trip, alone",
          "away": "i see it. you're on the 9:40 instead, aisle seat. tonight's room is held. breathe.",
          "emotion": -3,
          "tone": "warmth"
        },
        {
          "stage": "12 Recap",
          "moment": "A month in Da Nang done, looking back",
          "away": "31 days, ₹52k spent, one save you slept through. where's flexible taking us next?",
          "emotion": 3,
          "tone": "warmth"
        }
      ]
    },
    {
      "user": {
        "name": "Meera Iyer",
        "persona": "The Anxious First-Timer",
        "trip": "Bengaluru → Vietnam (Da Nang + Hoi An), with her mother Lakshmi, Lakshmi's first trip abroad",
        "oneLine": "34, the family fixer; takes one international trip with her 61-year-old mother and quietly fears everything that could go wrong"
      },
      "stages": [
        {
          "stage": "01 Onboard",
          "moment": "Downloads it the night before telling her mother yes",
          "away": "tell me who's coming and what scares you. i'll hold the rest.",
          "emotion": 0,
          "tone": "warmth"
        },
        {
          "stage": "02 Home + intent",
          "moment": "Types: mum's first trip, she's 61, no roaming",
          "away": "vietnam with your mum in november. gentle pace, short transfers. i've noted no sim for her.",
          "emotion": 1,
          "tone": "plain"
        },
        {
          "stage": "03 The brief",
          "moment": "Worries about steps, heat, long layovers for mum",
          "away": "da nang + hoi an, 6 nights. one easy flight, no 5am starts, lifts not stairs.",
          "emotion": 1,
          "tone": "plain"
        },
        {
          "stage": "04 The wait",
          "moment": "It's quiet; she refreshes, fears she picked wrong",
          "away": "still checking. ruling out the ones with bad transfers for your mum. won't be long.",
          "emotion": -1,
          "tone": "warmth"
        },
        {
          "stage": "05 Vet + verdict",
          "moment": "Reads the verdict twice; lets her shoulders drop",
          "away": "this one. ground-floor room, 40-min transfer, hotel does mum's visa-on-arrival. skipped the cheap one, fake reviews.",
          "emotion": 2,
          "tone": "edge"
        },
        {
          "stage": "06 Book",
          "moment": "Pays for two; double-checks both names match passports",
          "away": "booked. both names match your passports exactly. ₹84,200 all-in, nothing hidden. confirmations saved.",
          "emotion": 2,
          "tone": "plain"
        },
        {
          "stage": "07 First hours",
          "moment": "Quietly relieved it's real, but still bracing",
          "away": "all confirmed. i've added mum's wheelchair-on-request and a slow-walk note to the airline.",
          "emotion": 2,
          "tone": "plain"
        },
        {
          "stage": "08 The watch",
          "moment": "Stops compulsively checking; trusts something is watching",
          "away": "watching your flights and the da nang forecast. you'll only hear from me if something changes.",
          "emotion": 2,
          "tone": "plain"
        },
        {
          "stage": "09 Pre-departure",
          "moment": "Packing at midnight, panicking about mum's phone abroad",
          "away": "mum's phone won't work there, here's how she reaches you offline, plus your full day-one plan.",
          "emotion": 1,
          "tone": "warmth"
        },
        {
          "stage": "10 In motion",
          "moment": "At the gate, holding two boarding passes, breathing",
          "away": "gate 24, boards 6:10. transfer driver booked, name board ready. mum's lift is at arrivals door 3.",
          "emotion": 3,
          "tone": "plain"
        },
        {
          "stage": "11 Disruption → Rescue",
          "moment": "Connection cancelled; mum's stranded, no SIM, panic floods",
          "away": "i see it. you're rebooked on the 2:40, same airline. driver told. mum's lift rescheduled. you're okay.",
          "emotion": -3,
          "tone": "warmth"
        },
        {
          "stage": "12 Recap",
          "moment": "Home; mum keeps retelling the trip to relatives",
          "away": "you got her there and back. one wobble, caught. here's the trip, saved, for the next one.",
          "emotion": 3,
          "tone": "warmth"
        }
      ]
    },
    {
      "user": {
        "name": "Nikhil",
        "persona": "The Offer Maximizer",
        "trip": "Mumbai → Dubai long weekend, a flex trip where card offers, no-cost EMI and lounge access genuinely stack",
        "oneLine": "32, comfortable but allergic to leaving a bank offer on the table; runs a wallet of cards and knows exactly which one pays."
      },
      "stages": [
        {
          "stage": "01 Onboard",
          "moment": "Another travel app. does it even know HDFC offer-of-the-month?",
          "away": "tell me which cards you carry. i'll stack every offer they're sitting on.",
          "emotion": 2,
          "tone": "edge"
        },
        {
          "stage": "02 Home + intent",
          "moment": "Types: Dubai long weekend, and which card wins this month?",
          "away": "mumbai → dubai. HDFC, ICICI, Axis, SBI on file. i'll find the best stack.",
          "emotion": 2,
          "tone": "plain"
        },
        {
          "stage": "03 The brief",
          "moment": "Wants instant discount + no-cost EMI + points + lounge, all of it.",
          "away": "goal logged: bank discount, no-cost EMI, max points, card lounge access. on it.",
          "emotion": 2,
          "tone": "plain"
        },
        {
          "stage": "04 The wait",
          "moment": "Did the HDFC offer expire? are the codes still live today?",
          "away": "checking which offers are actually live right now, not stale banners. about 10 min.",
          "emotion": -1,
          "tone": "plain"
        },
        {
          "stage": "05 Vet + verdict",
          "moment": "It found a stack he'd have missed, better card, live coupon.",
          "away": "book on ICICI Amex, not HDFC: ₹6,000 instant off + 5x points beats it this month.",
          "emotion": 2,
          "tone": "edge"
        },
        {
          "stage": "06 Book",
          "moment": "The perfect stack lands, discount, no-cost EMI, points, lounge.",
          "away": "₹6,000 off, 6-month no-cost EMI, 9,200 points, 2 lounge visits. clean win, no fee added.",
          "emotion": 3,
          "tone": "edge"
        },
        {
          "stage": "07 First hours",
          "moment": "Did the instant discount actually apply? points credited?",
          "away": "discount applied at source, EMI confirmed, points pending post-travel. all real.",
          "emotion": 2,
          "tone": "plain"
        },
        {
          "stage": "08 The watch",
          "moment": "Half-forgets, then a quiet ping about a better offer.",
          "away": "Axis dropped a fresh lounge+upgrade voucher. saved it to your trip, no rebook needed.",
          "emotion": 2,
          "tone": "edge"
        },
        {
          "stage": "09 Pre-departure",
          "moment": "Wants the lounge sorted and forex without DCC sting.",
          "away": "BOM lounge access on your ICICI card, gate 42. pay in AED, never accept INR, dodges DCC.",
          "emotion": 2,
          "tone": "plain"
        },
        {
          "stage": "10 In motion",
          "moment": "In the lounge, stack working, quietly pleased with himself.",
          "away": "both lounge visits logged, points on track. boarding 11:20, gate b7. enjoy the win.",
          "emotion": 2,
          "tone": "edge"
        },
        {
          "stage": "11 Disruption → Rescue",
          "moment": "Flight cancelled, the EMI, the discount, the refund, all tangled.",
          "away": "don't panic. rebooked, no fare gap. your ₹6,000 discount and no-cost EMI both stay intact.",
          "emotion": -3,
          "tone": "warmth"
        },
        {
          "stage": "12 Recap",
          "moment": "Offer survived the cancellation. nothing left on the table.",
          "away": "₹6,000 off held, EMI untouched, 9,200 points landed, 2 lounges used. nothing left behind.",
          "emotion": 3,
          "tone": "edge"
        }
      ]
    }
  ]
};


// --- 2026-06-30: international-booking problem-statement fold (Overview reframe + consolidated research + 2 deep specs). Appended; see Claude/Problem Framing/. ---
export const awayOverviewFold = {"Scared to decide, not to book":"People are not scared to book international flights on an app. They are scared to decide, and to be alone when it breaks. The fear lives before the transaction (which flight, right price, right time, visa, which airline) and after it (who has my back when it goes wrong), not at the tap-to-pay moment. The human travel agent was never paid for the booking. It was paid for the judgment and the rescue. Away does the agent's jobs, not its persona.","The reframe":{"overview":"Anxiety is high at decide, dips at book-and-pay, and rises again at survive. Booking sites optimise the low-fear dip by selling the cheapest-looking fare. The agent, and Away, owns the two peaks: the verdict before booking and the rescue after. This is why we build the agent's jobs (the watch, the verdict, the rescue) rather than dressing up a human-agent persona. Travellers already do the booking themselves; what they hand off is the call and the cover.","evidence":["71% of travellers book online or in-app, only 16% want a human to do the booking, and 53% prefer the airline's own site or app.  ·  IATA Global Passenger Survey 2024 (verified against primary release)  (high)"]},"Why international":{"overview":"The driver is complexity, being hard to reverse, and how much is at stake (trips across several airlines, fare consolidation, visas and documents, sorting things out after booking), not nationality or the passport. This backs the long-haul, unfamiliar framing over a nationality cut. The agent and the trade channel persist for international precisely because it is the high-stake, hard-to-reverse end, and the incumbents are walking away from it: flights are low-margin, so booking sites are de-prioritising the exact segment that most needs vetting and rescue. The gap is structural, not an oversight.","evidence":["MakeMyTrip air take-rate is about 6.4% and flat, so booking sites are de-prioritising flights, the segment that most needs vetting and rescue.  ·  MakeMyTrip reporting, via market-structure workflow (external, directional)  (medium)","The cleanest hard international-online figure (about 20% of intl booked online) is from 2015 / BusinessToday. Stale and directional only; treat the agent-capture claim as a strong hypothesis, not a measured fact.  ·  BusinessToday 2015 (external, stale)  (low)"]},"The four booking-site failures are one failure":{"overview":"Combo fares shown badly, no best pairing of the outbound and return, filters barely used, and \"doesn't understand my nuances\" all share one root cause: booking sites are built to sell the cheapest-looking fare. Protect-don't-sell is the structural inversion of all four. The regulator is currently doing the marketing (a live 2026 consumer-protection probe into booking-site cancellation fees; 80% of Indian flyers hit hidden charges).","evidence":["Self-transfer combo fares are separate tickets with no through-checked bags and no missed-connection protection; India's regulator protects same-ticket connections only, so combo buyers are structurally unprotected.  ·  Goibibo/Skyscanner terms + regulator (verified)  (high)"]},"What our own data proves":{"overview":"Our own analytics validate the wedge: deep search (the agent engine) is the default, not an opt-in, filters are barely touched, and people already try to talk to the product in sentences. But the loudest signal is that the funnel does not leak at search, it collapses at payment. A 35% payment success rate is a bigger fire than any search-quality gain, and it feeds the \"can I trust this platform with my money\" fear directly. One blind spot gates everything: there is no 'international' flag on any server event, so the international-first strategy is currently unmeasurable on the real two-month dataset.","evidence":["81.6% of completed searches trigger a deep search (2,819 / 3,454), over a 90-day server window. Deep search is the default.  ·  our analytics  (high)","Only about 19% of search sessions apply any filter (19/99); the filter panel is being abandoned, not used.  ·  our analytics (client, <2wk, directional)  (medium)","Payment success is about 35.2% (135 of 384 attempts; 249 failed). This is the real fire, not search.  ·  our analytics  (high)","International is about 39% of searches on the one client event with flight geography (n=187, <2wk). No 'international' flag exists on server events, so this is unmeasurable on the full dataset.  ·  our analytics (client only, <2wk, directional)  (low)"]}};
export const awayResearchSpec = {"id":"prd-research","eyebrow":"Evidence","title":"Research","summary":"People are not scared to book international flights on an app. They are scared to decide, and to be alone when it goes wrong. The fear lives before the transaction (which flight, the right price, the right time, the visa, which airline) and after it (who has my back when it breaks), not at tap-to-pay. The research below grounds that reframe across the market structure, traveller psychology, segments, booking-site design, the opportunity, and our own behaviour data. Our own data is high confidence and was reproduced live this session; the outside market stats are softer, and several are flagged as stale or refuted.","1. Market structure: why international still goes to agents":{"overview":"For international flights, the agent, offline, and trade channels win far more of the market than they do for domestic. The driver is complexity, being hard to reverse, and how much is at stake (trips across several airlines, fare consolidation, visas and documents, sorting things out after booking), not the passport. This backs Away's call that the real driver is long-haul and unfamiliar, not nationality. The incumbents will not fix it because flights are low-margin, so booking sites are de-prioritising the exact segment that most needs vetting and rescue. The gap is structural, not an oversight.","points":["The agent/offline/B2B channel is structurally weighted to international because of net-fare consolidation, multi-carrier itineraries, visa/documentation, and post-booking servicing. Domestic India air is low-value LCC point-to-point and overwhelmingly online; Away should not anchor on it.","Consolidator net fares are an international-only mechanism: bulk seat agreements apply to international flights only, are restricted from online display, and are accessed by agents via GDS/NDC, focused on long-haul and complex itineraries. This is the supply-side reason agents win internationally.","TBO Tek, India's B2B distribution backbone, runs about 54% of GTV from international operations vs about 46% India, with about 41% of GTV from airlines, connecting 750+ airlines across 159,000+ travel buyers. The B2B aggregator layer is internationally weighted.","India's B2B share of OTA is projected to reach 40-45% by FY28 (from a Rs 42-46B base in FY23). The agent-served pool is digitizing, which sets Away's timing window.","MakeMyTrip's air-ticketing adjusted margin is about 6.4% of gross bookings and flat YoY. Air is margin-dilutive, so OTAs are de-prioritizing the segment that most needs vetting and rescue. The take-rate is the strategic reason incumbents will not build deep verdict/rescue capability.","Stale-stat caveat: the cleanest hard international-online number (about 20% of intl booked online) is a 2015 BusinessToday figure, directional only. Treat the headline 'agents beat OTAs for international' claim as a strong, multiply-corroborated hypothesis, not a measured current fact. A clean, current India international-air channel split is not publicly published."],"evidence":["TBO Tek: about 54.1% of FY25 GTV from international operations vs 45.9% India; about 41% of GTV from airlines; annual GTV about INR 308B; 159,000+ buyers, 750+ airlines.  ·  Motilal Oswal / TBO disclosures; Skift (2024-05-06, 2025-11-03)  (medium)","India OTA B2B share projected to reach 40-45% by FY28 (B2B gross bookings Rs 42-46B FY23 to Rs 89-93B FY28, 15-16% CAGR).  ·  CRISIL MI&A (EaseMyTrip/Easy Trip Planners SEC filing ex99-1)  (medium)","MakeMyTrip air-ticketing adjusted margin 6.4% of gross bookings FY25 (flat vs FY24); air-ticketing gross bookings $5,867.9B, air adjusted margin $373.1M.  ·  MakeMyTrip Q4/FY25 earnings release (verified verbatim)  (high)","Consolidator net fares apply to international flights only; restricted from online display; focused on long-haul / complex multi-carrier itineraries.  ·  AltexSoft / Centrav / Travelport  (high)","Only about 20% of India international ticket bookings happen online; intl ticket about Rs 45,000 vs Rs 12,000 domestic. STALE: 2015 figure, directional only.  ·  BusinessToday (Feb/Mar 2015) — verified verbatim, flagged stale  (low)","Per-OTA flight shares are RANGES, not point values: MMT >50% of OTA; EaseMyTrip/Cleartrip/Ixigo/Yatra each roughly 7-9% (Cleartrip cited 8.5-13.7%). Quote as ranges; direction holds, decimals do not.  ·  stocksmantra / whalesbook trackers (fact-check correction)  (low)","Offline channels hold about 53% of all India travel bookings (late 2024); air online penetration about 74-76% FY23, OTAs 80-82% of online air.  ·  Skift Research (Nov 2024); CRISIL MI&A (FY23)  (medium)"]},"2. Traveler psychology: the six fears and what collapses each":{"overview":"The dominant emotion when booking a Rs 50,000-to-80,000 international ticket is dread, a stack of six fears, each matching a known bit of psychology: loss aversion (a wrong call hurts about twice as much as a right one feels good), a fear of unknown odds (people pay to avoid them), decision fatigue, and the wish to hand the risk to a competent human. The human agent was never valued for the booking; only about 16% of passengers want a human to do the transaction. The human is wanted for the verdict and the rescue. Each fear collapses against a concrete reassurance, and each maps one-to-one to an Away job.","points":["Fear 1 'too complex / will I be left out?' = ambiguity aversion + accountability transfer. Collapses with a named owner of the outcome shown before booking (watch/rescue).","Fear 2 'can I trust this platform with Rs 60k?' = loss aversion (wrong call hurts about 2x). Collapses with all-in price, fare-fairness, and a reversible undo (protect-don't-sell).","Fear 3 'am I finding the right flight/price/time?' = decision fatigue + regret under fare volatility. Collapses with one defended verdict, not another grid (the verdict).","Fear 4 'will visas/documents trip me up?' = real and quantified: 36% deterred by immigration rules, 49% blame process complexity (IATA). Collapses with an itinerary-level visa/transit-fit hard gate.","Fear 5 'which airline do I trust?' = availability heuristic, live and swingy. Post the June 2025 Air India crash, 51% of Indian flyers actively avoid certain airlines on safety grounds. Collapses with a per-airline safety/reliability read (Flight Index / Comfort).","Fear 6 the AI-trust ceiling: 66% will not trust an AI to book and only 8% are comfortable (Expedia/YouGov, NOT Phocuswright). The co-pilot rule (human decides at pay) is a feature, not a limitation.","OTA trust crisis backs the 'nobody to call' fear: about 80% of Indian flyers hit hidden charges; a live 2026 CCPA probe into OTA cancellation fees; MakeMyTrip rated about 1.2 stars on Trustpilot. The regulator is currently doing the marketing for 'protect-don't-sell'."],"evidence":["Only 16% of passengers prefer human interaction to book; 71% book online/in-app; 53% prefer the airline's own site/app.  ·  IATA Global Passenger Survey 2024 (verified verbatim; sample-size/IPSOS sub-claims unverified)  (high)","36% deterred from a destination by immigration requirements; of those, 49% cite process complexity (19% cost, 8% privacy); 66% want the visa online before travel.  ·  IATA GPS 2023 (verified verbatim, 8,000+ responses)  (high)","Post-AI171 (June 2025), 51% of recent Indian flyers actively avoided certain airlines on safety grounds; about 29% now check aircraft type before booking.  ·  Skift exclusive survey (Jun 2025); LocalCircles (85,000+ responses)  (high)","66% will not trust an AI to book a flight; only 8% are comfortable. Source is Expedia/YouGov 2026, NOT Phocuswright.  ·  Expedia/YouGov 2026 (source correction preserved)  (medium)","Loss aversion: pain of a loss is about 2x the pleasure of an equivalent gain; high-stakes + high-ambiguity drives decision paralysis. Ambiguity aversion (Ellsberg): people pay to avoid unknown odds.  ·  Kahneman & Tversky; Ellsberg (behavioral-economics canon)  (high)","OTA trust crisis: MakeMyTrip currently about 1.2 stars on Trustpilot (about 2,000 reviews, not the earlier-cited 1.5/979); about 80% of Indian flyers hit hidden charges; live 2026 CCPA probe into OTA cancellation fees. Cleartrip 1.6/87%-unfavorable figure is pissedconsumer.com, not Trustpilot.  ·  Trustpilot; pissedconsumer; CCPA (fact-check corrections preserved)  (medium)"]},"3. Segmentation: trip-type and experience set the dials":{"overview":"First-time and experienced travellers do not differ in how much they flex; they differ in which thing they refuse to flex on. The kind of trip, not nationality, is the stronger driver. The same flight needs a different verdict headline per segment, and self-transfer should be a hard warning for first-timers, people visiting family, and families, but opt-in for the value-optimisers.","points":["First-timers (the fastest-growing cohort: 63% of outbound from Tier-2/3, first-time visa apps +32%, average age fell from 32 in 2019 to 25 in 2025) are rigid on reassurance (safety, nonstop, 'is this real?') and flexible on price/dates if hand-held.","Value-optimizers (experienced) are rigid on price/value and time, flexible on airline and even self-transfer because they can self-recover. They tolerate aggressive routings (self-connects, hidden-city) a first-timer would never risk. Affluent experienced travelers flex on price LESS, trading money for comfort/time.","VFR/migrant travelers invert the leisure pattern: date-rigid (locked to festivals, weddings, visa appointments, job-start) but route- and airline-flexible ('just get me there cheap', the ULCC domain). About 16% of Indian outbound is VFR.","Students are a distinct hybrid: baggage- and airline-rigid (they pick the airline by free-bag/student-fare rules, which must be locked into the fare at booking and cannot be added later) but layover- and date-flexible.","Date flexibility is bimodal: about 42% of outbound trips are booked within 7 days of departure (and punished with fares 34-80% above the 4-6 week window), yet leisure travelers are the most date-flexible. Self-transfer is a hard experience gate; about 30% of self-transfer travelers do not realize they may need a transit visa.","Reassurance-seeking is now table stakes across all segments: 85% of Indian travelers buy/likely-buy travel insurance (89% for peace of mind). The differentiator is depth of need: first-timers want pre-trip certainty, experienced want fast in-trip recovery."],"evidence":["63% of outbound travelers (and of first-time international bookings) from Tier-2/3; first-time visa applications +32%; passport penetration about 8.71%; average first-timer age fell 32 (2019) to 25 (2025).  ·  TravClan India Outbound Index 2025 / Atlys / Business Standard / HappyFares (denominator framing varies)  (medium)","VFR is date-rigid but route/airline-flexible; about 16% of Indian outbound is VFR, about 30% leisure, about 26% business, about 28% other.  ·  CAPA-Expedia; ETC India outbound snapshot  (medium)","Students: airline chosen by free-bag rule (e.g. Lufthansa student = 2x23kg, must book the Student fare, cannot add free baggage later); layover/date-flexible.  ·  Lufthansa / Emirates student-fare terms; Wise  (high)","About 42% of outbound trips booked within 7 days of departure; within-7-day fares average +34% (Hopper India: +40-80% same route); about 30% of self-transfer travelers unaware of transit-visa need.  ·  HappyFares 2025-26 fare DB; Hopper India 2024; Skift/HotelierIndia; Simple Flying  (medium)","85% of Indian travelers likely to buy travel insurance, 89% for peace of mind; concern stack: delays/cancellations 80%, lost luggage 75%, lost documents 74%.  ·  Booking.com Travel Predictions (n=1,007 India)  (high)"]},"4. OTA UX failures: four symptoms, one root cause":{"overview":"Everything the problem list named checks out against primary sources, and the four failures share one root cause: booking sites are built to sell the cheapest-looking fare. 'Protect-don't-sell' is the structural inversion of all four. Notably, the industry is converging on Away's answer (capturing intent plus AI ranking) but from the sell side, not the protect side.","points":["Combo/self-transfer fares are shown badly: self-transfer means separate PNRs, no through-bags, and no missed-connection protection (Goibibo/Skyscanner verbatim). India's DGCA protects same-PNR connections only, so combo buyers are structurally unprotected, yet the cheap-looking combo wins the headline.","No best onward-return pairing optimization: no mass OTA does true total-trip optimization; Google Flights is the ceiling; most dump two independent leg lists. The root cause is selling legs, not trips.","Filter usage is low and jargon-laden: filters are a power-user, mobile-hidden, jargon-heavy tool (Baymard), confirmed in our own data below. The platform pushes comprehension onto the user.","Nuance-blindness ('it doesn't understand me'): the industry is converging on intent capture + AI ranking (Google 'Best', Kayak Ask AI, Skyscanner + ChatGPT, all 2025), validating Away's wedge, but doing it to sell, not to protect.","Each failure invisibly hides the trap at the price-comparison step: the cheap-looking option is often the self-transfer/basic-economy trap. Surfacing that ('this Rs 4k saving costs you bag re-check plus missed-connection risk') is the highest-trust move Away can make."],"evidence":["Self-transfer = separate PNRs, no through-baggage, no missed-connection protection; India's DGCA protects same-PNR connections only.  ·  Goibibo/Skyscanner terms; DGCA; Simple Flying  (high)","No mass OTA does true total onward-return trip optimization; Google Flights is the ceiling; most show two independent leg lists.  ·  OTA UX teardown (qualitative, cross-source)  (medium)","Filters are a power-user, mobile-hidden, jargon-laden tool with low real usage.  ·  Baymard Institute; confirmed in our analytics (see section 6)  (high)","Industry converging on intent capture + AI ranking in 2025: Google 'Best', Kayak Ask AI, Skyscanner + ChatGPT.  ·  Vendor product launches 2025  (high)"]},"5. The opportunity: the verdict, the rescue, and honesty":{"overview":"Away owns the two anxiety peaks (decide, survive) that booking sites ignore because they optimise the low-fear payment dip. The wedge is to do the agent's jobs (the verdict before booking, the rescue after), be aware of the segment, make self-transfer a hard warning before the results, and position itself explicitly against dark patterns. Honesty converts better than perfection: surfacing the trap and disqualifying the cheap-looking option is the highest-trust move. Price-freeze fintech is table stakes, not a moat.","points":["The verdict: resolve the choice, do not add to it. Lead with a single 'skip this / book this' and a one-line WHY (the expected-regret gate), comparison collapsed. Make it segment-aware (reassurance-first for first-timers, trap-catching for value-optimizers).","The rescue: make it a marketed, first-class surface anchored on the December 2025 IndiGo collapse (1.62M stranded). A named, reachable owner of the outcome shown BEFORE booking collapses the #1 fear. Caveat: only works if rescue is actually operationalized; a hollow promise is exactly what tanked MakeMyTrip's trust.","Service-recovery paradox: a disruption handled well can leave a customer more loyal than if nothing had gone wrong. Rescue is not a cost center, it is the trust-building moment OTAs squander.","Self-transfer as a pre-result hard gate, with the DGCA-protection teaching baked in, is the highest-trust 'skip this' Away can ship.","Price-freeze / price-prediction is table-stakes, not a moat: Hopper runs about 60% attach and about half of revenue from it, now white-labeled. Match it; do not build the strategy on it.","Position explicitly anti-dark-pattern (all-in price, no forced add-ons, refund transparency), timely with the 2026 CCPA probe. Honesty out-converts perfection: the regulator is doing the marketing."],"evidence":["IATA: anxiety is high at 'decide', dips at 'book & pay', rises again at 'survive'; OTAs optimize the low-fear dip, the agent owns the two peaks.  ·  IATA GPS 2024 (interpretive framing of the 71/53/16 split)  (high)","December 2025 IndiGo operational collapse stranded about 1.62M passengers; reported highest-ever fine (reported, not confirmed).  ·  Press reports (flagged: fine unconfirmed)  (low)","Hopper price-freeze: about 60% attach, about half of revenue, now white-labeled, so price-freeze is table-stakes not a moat.  ·  Hopper disclosures / trade coverage  (medium)","Refuted/dropped in fact-check: Kiwi rebooking £-amount figures were forum-sourced and could not be verified; dropped from the evidence base.  ·  Fact-check correction (preserved)  (low)"]},"6. Our own data (our analytics): the thesis holds, the fire is payment":{"overview":"Our own behaviour data is the most reliable evidence here and was reproduced live this session. It confirms the thesis: search and AI decision-help are working and well adopted, people are already speaking in sentences, and the funnel does NOT leak at search. It collapses at payment. Two structural caveats: there is no server-side 'international' flag (so the international-first strategy is currently unmeasurable on the real two-month dataset), and the client-side geography and filter splits rest on under two weeks of data and are directional only. Server events have been live since about 29 April 2026 (about two months); client events since about 21 June.","points":["Deep-search is the default, not an opt-in: 81.6% of completed searches trigger AI deep-search (2,819 / 3,454, 90d). On a per-user basis 882 unique deep-searchers EXCEED 513 unique standard searchers, the strongest validation of the 'agent's jobs, not a filter panel' wedge.","Filter usage is low and users talk instead: only about 19% of search sessions apply any filter; of 50 filter_applied events, 47 are untagged and the only 3 real ones are sentences ('Direct flights to Ahmedabad', 'Flights arriving around 10 PM', 'Best flights around 5 PM'). Sort collapses to cheapest at 73% (19/26).","Negotiation IS the product: a deep search surfaces about 1.70 fares and about 100% of them are negotiated (avg negotiated 1.69 vs avg found 1.70); 85.6% of deep-searches are free; reruns just 9.7% (users accept the first negotiated result).","The funnel collapses at payment, not search: search 3,454 to deep-search 2,812 (81.4%) to booking-INTENT 1,517 (54.0%) to payment-success 135 (8.9%) to ticket 76 (56.3%). Payment success is about 35.2% (135/384 attempts); a 13 Jun 2026 spike (122 failures + 11 superseded vs 7 successes) is about 49% of all 90-day failures, but excluding it success is still only 50.2%. The headline '1,500 bookings' is intent, overstating real conversion 11.2x.","International is directionally about 39% of searches (73/187, client, under 2 weeks), with BOM-DXB and DEL-LHR alone 48 of 73. But there is NO is_international flag or origin/destination on any server event, only device $geoip. The international-first strategy is currently un-measurable on the real 2-month dataset; this is a one-property instrumentation fix that gates every other geography claim.","Cart economics: avg Rs 25,504 / median Rs 10,202 (right-skewed by an intl tail: LH about Rs 82k, SQ about Rs 35k, KQ about Rs 290k); top carrier 6E IndiGo (152 adds, avg Rs 13,796), then QP Akasa 57, IX Air India Express 32."],"evidence":["Deep-search adoption 81.6% (2,819 deep-search initiated / 3,454 completed searches); 882 unique deep-searchers > 513 unique standard searchers.  ·  our analytics (90d, server; reproduced via SQL editor)  (high)","Only about 19.2% of search sessions apply any filter (19/99); of 50 filter_applied events 47 untagged, 3 are natural-language sentences; sort = cheapest 73.1% (19/26).  ·  our analytics (client, <2wk, directional)  (medium)","Negotiation: about 1.70 fares per deep-search, about 100% negotiated (1.69 negotiated vs 1.70 found); 85.6% of deep-searches free; reruns 9.7%.  ·  our analytics (90d, server)  (high)","Funnel: 3,454 search to 2,812 deep-search to 1,517 booking-INTENT to 135 payment-success to 76 ticket; payment success about 35.2% (50.2% excl. 13 Jun spike); intent:paid = 11.2x.  ·  our analytics (90d raw event counts, server)  (high)","13 Jun 2026 payment-failure spike: 122 failed + 11 superseded vs 7 succeeded, about 49% of all 90-day failures; secondary elevation 19-20 and 25 Jun. Ticketing 72 failed vs 76 issued (about 51%), mostly cleared after about 14 Jun.  ·  our analytics (90d daily series, server)  (high)","International about 39% of searches (73/187), BOM-DXB + DEL-LHR = 48 of 73. DIRECTIONAL: n=187, <2 weeks. No is_international/origin/destination on any server event (only $geoip).  ·  our analytics (client_flight_search_started, <2wk)  (low)","Cart: avg Rs 25,504, median Rs 10,202 (min 1,260, max 450,514, n=347); top carrier 6E IndiGo 152 adds avg Rs 13,796.  ·  our analytics (client, 30d/<2wk)  (medium)"]}};
export const awayPaymentSpec = {"id":"prd-payment","eyebrow":"The real fire","title":"Payment & ticketing reliability","summary":"Search and AI decision-help work, but the funnel collapses at payment: only about 35 percent of payment attempts succeed (our analytics, over 90 days) and ticketing issues only about 51 percent of what gets paid for. This is the single biggest leak in the product and it feeds the \"can I trust this platform with 60k\" fear directly. This spec makes reliability something we measure, watch, and defend, separates the three kinds of failure (the bank declining, an error in our app, and an outage), closes the honest gap that lets a payment be charged twice, makes the locked price actually enforced, and defines the calm, no-blame screens that turn a failure into kept trust rather than a walk-away.","Summary":{"overview":"Payment is where Away leaks. On the 90-day server window (our analytics, events live since 2026-04-29), the funnel runs search 3,454 to deep-search 2,812 to booking-INTENT 1,517 to payment_succeeded 135 to ticket_issued 76. Search-to-deep-search holds at 81.4% and deep-search-to-intent at 54.0%, but intent-to-paid is 8.9% and payment success is about 35.2% (135 of 384 attempts; 249 failed plus 12 superseded). Even excluding the 13 Jun spike the success rate is only about 50.2%, so the spike is a major event layered on a chronically poor baseline, not the whole story. Ticketing is a second, distinct failure: 72 ticket_failed vs 76 issued (about 51% issuance), clustered in May and early Jun and near-zero after about 14 Jun. The headline 'about 1,500 bookings' is booking-INTENT (server_booking_created), not paid, so intent overstates real conversion about 11.2x. This spec treats payment success as a north-star reliability metric, separates gateway decline from app error from incident, adds the server-side idempotency guard the code currently lacks, wires price_locked enforcement from advisory to real, and specifies calm-retry, no-blame-decline, pending-not-failed, and partial-issue-recovery states.","points":["Confirmed (our analytics, 90d): payment success about 35.2% (135/384); excluding 13 Jun spike about 50.2%.","Confirmed (our analytics, 90d): ticketing about 51% issuance (76 issued vs 72 failed), failures clear after about 14 Jun.","Confirmed (our analytics, 90d): server_booking_created is INTENT not paid; intent:paid about 11.2x.","Confirmed (code, App.jsx): no server-side idempotency guard exists; the locked polling screen is the only guard.","Confirmed (code, App.jsx): price_locked is set as a field but its enforcement is not wired; blocking is advisory (sheet gating the CTA), not a server lock."]},"Why this matters":{"overview":"Every other workstream optimizes the top of the funnel, which is already healthy: deep-search adoption is 81.6% and more unique users touch the AI engine (882) than plain search (513). A search-quality gain moves a funnel step that is already converting well. Payment is the opposite: about two of every three attempts that reach the gateway fail, and only about half of paid bookings actually ticket. Recovering payment from about 35% toward even 70% roughly doubles realized bookings off the same demand, which dwarfs any plausible search-ranking improvement. The strategic point is sharper than arithmetic. The problem statement names the core fear as 'can I trust this platform with 60k.' A failed or ambiguous payment at the 60k moment is that fear made real: the user has committed money and the platform has visibly broken. A reliability leak is therefore not just lost conversion, it is trust destruction at the highest-stake moment in the journey, and it undercuts the entire 'protect, do not sell' positioning. Reliability is a feature of the brand, not just the backend.","points":["The about 35% payment leak is the largest single drop in the funnel and is downstream of the parts that already work (our analytics, high confidence).","Lifting payment success roughly doubles realized bookings on the same demand: a bigger prize than any search-ranking gain (modeled from the funnel, high confidence on the funnel, hypothesis on the lift).","A broken payment at the 60k moment is the 'can I trust this platform' fear made real, so reliability defends the brand thesis, not just the metric (interpretation, ties to problem statement)."]},"Symptoms & evidence":{"overview":"All figures are our analytics, 90d server window (events span 2026-04-29 to 2026-06-29, about 2 months inside the 90d window), reproducible via the SQL editor and the consolidated 'Agam — Away PRD Board' (dashboard 1770694; the five old theme boards 1770457/67/66/69/68 are 404). High confidence: these are our own re-run numbers. One caveat carried from the pull: the funnel figures are raw event counts, not a person-stitched sequential funnel, so a user-level funnel with conversion windows could differ, but the order-of-magnitude collapse at payment is unambiguous.","points":["Funnel (raw counts, 90d): search_completed 3,454 to deep_search_completed 2,812 (81.4%) to booking_created/INTENT 1,517 (54.0% of deep-search) to payment_succeeded 135 (8.9% of intent) to ticket_issued 76 (56.3% of paid).","Payment success rate about 35.2% (135 succeeded / 384 attempts; 249 failed, plus 12 server_payment_failed_superseded not counted in the denominator). Excluding the 13 Jun spike: about 50.2%.","Collapse step: booking intent to payment success is 135/1,517 = 8.9%; about 91% of stated intent never pays successfully.","Failure spike 2026-06-13: 122 failed + 11 superseded vs 7 succeeded that day, about 49% of all 90d payment failures on one day. Secondary elevation 19-20 Jun (14, 12) and 25 Jun (17).","Ticketing: 72 ticket_failed vs 76 ticket_issued, about 51% issuance. Failures clustered May/early-Jun, near-zero after about 14 Jun.","Intent:paid ratio about 11.2x (1,517/135): server_booking_created is INTENT, not paid, and overstates conversion by an order of magnitude.","Divergence worth noting: payment failures WORSENED late (spike 13 Jun, elevated 19-25 Jun) while ticket failures IMPROVED late (near-zero after about 14 Jun). These are two distinct problems on different timelines, not one."]},"Root-cause hypotheses":{"overview":"Four hypotheses, tagged by confidence. The data and the code disagree on which is primary, which is itself the finding: we cannot today separate a gateway decline from an app error from an incident, so root cause is partly un-diagnosable until we instrument it (see Requirements). Confirmed facts are the code structure (from the App.jsx case study) and the event shapes; everything causal is hypothesis.","points":["H1 — Gateway/Cashfree reliability plus the 13 Jun incident (HYPOTHESIS, partly confirmed). The 13 Jun spike (122 failures, about 49% of 90d total) looks like a discrete incident, not steady-state user behavior. CONFIRMED that it is an outlier day; HYPOTHESIS that it was gateway-side. Even excluding it, about 50.2% baseline says there is a chronic problem underneath the incident.","H2 — Missing server-side idempotency (CONFIRMED gap, hypothesized impact). CONFIRMED from code: 'there is NO server-side idempotency guard in the current code, the locked screen is the real guard.' The payment screen polls Cashfree every about 2s to a terminal answer and locks back-navigation (BackHandler + swipe disabled) to prevent double-charge. HYPOTHESIS: any path that escapes the locked screen (app kill, crash, OS interruption, network drop mid-poll) has no server-side guard, which can surface as failed/duplicate/superseded attempts and inflate the failure count. The 12 superseded events are consistent with retries that a server guard would have collapsed.","H3 — price_locked unenforced (CONFIRMED gap, hypothesized impact). CONFIRMED from code: price_locked is set as a field but its enforcement code is not visible/wired, so blocking relies on the sheet gating the CTA (advisory only), not a server lock. CONFIRMED that Cashfree rejects re-payment of an old order_id server-side, so on a price-change accept the app creates a fresh order_id and cancels the old poll. HYPOTHESIS: price drift between intent and pay, only softly gated client-side, contributes to declined/superseded attempts and to user-perceived 'it failed' moments.","H4 — Ticketing and payment are two distinct failures on different timelines (CONFIRMED). The data shows payment worsening late while ticketing improved late, so they cannot share a single root cause. CONFIRMED from code that partial-issued legs (outbound issued, return failed) are handled independently, which means ticketing failure is a separate fulfillment-stage problem (supplier/PNR issuance) downstream of a successful charge, and must be measured and alerted separately from payment."]},"Requirements":{"overview":"Five requirements. R1 and R2 are the foundation (you cannot fix what you cannot see, and you cannot dedupe what has no key). R3 and R4 close the two confirmed code gaps. R5 makes the whole thing operationally alive.","points":["R1 — Payment success as a north-star reliability metric. Define success = server_payment_succeeded / (succeeded + failed), computed daily and rolling-7d, surfaced on the consolidated board (1770694). Separate three failure classes on every server_payment_failed event via a required reason taxonomy: (a) gateway_decline (issuer/bank/insufficient-funds, user-recoverable), (b) app_error (crash, timeout, lost poll, client bug, our fault), (c) incident (gateway outage / mass-failure window like 13 Jun). Without this split the 35% number is un-actionable. CONFIRMED need: today there is no class on the failure event.","R2 — Add server-side idempotency. Introduce a server idempotency key per booking-intent (stable across retries of the same intent), so a re-submitted or duplicate attempt collapses to one charge server-side rather than relying on the locked screen. The locked polling screen stays as defense-in-depth, but stops being the ONLY guard. This is the confirmed honest gap from the code.","R3 — Wire price_locked enforcement. Move price_locked from an advisory field to a server-enforced lock: the server validates the locked price/order at charge time and rejects or forces a fresh-order re-accept (the existing Cashfree old-order_id rejection path) rather than trusting the client sheet to gate the CTA. Keep the existing fresh-order_id + old-poll-cancellation flow on a legitimate price-change accept.","R4 — Treat ticketing reliability as its own tracked metric and flow. Track ticket_issued / (issued + failed) separately from payment, alert on it separately, and keep partial-issue handling (outbound issued, return failed) as independent leg states. CONFIRMED from code that legs are handled independently; this requirement makes that visible and measured.","R5 — Alert on daily failure spikes. Automated alert when daily payment failures exceed a baseline threshold (the 13 Jun spike must page someone the same day, not surface weeks later in a board). Same for a ticketing-failure spike. Pending must never be silently rolled into 'failed' in any metric or alert (CONFIRMED code principle: pending is never treated as failure)."]},"Surfaces & states":{"overview":"Four states, all written in the 'protect, do not sell', no-blame register. The design principle: a payment problem is the highest-anxiety moment in the app, so every state must reduce fear, never assign blame to the user, and never imply their money is lost or double-taken. These map onto the existing payment flow (see Payments/2026-05-30_payment_flow_spec.md) and the confirmed code behaviors.","points":["Calm retry. While status=polling, the screen polls Cashfree every about 2s to a terminal answer and back-navigation is locked (BackHandler + swipe disabled) to prevent a double-charge. The UI must explain the lock as protection ('Staying here keeps your booking safe, one charge only') rather than a trap, with a steady progress affordance, not a spinner that reads as 'hung'.","No-blame decline. On a gateway_decline, never say 'your payment failed' in a way that implies user fault or that money moved. Say what happened plainly, confirm no charge was taken, offer one clear retry, and (where the reason is known, e.g. insufficient funds vs bank decline) give a specific next step. This is the single most trust-load-bearing screen in the app.","Pending, not failed. A pending/unknown terminal answer must be shown as pending, never as failure (CONFIRMED code principle). Tell the user we are confirming with the bank, keep the screen safe, and resolve to success or a true decline before changing the message. Do not let the user re-pay into a pending state (this is where R2 idempotency and the locked screen jointly protect them).","Partial-issue recovery. When outbound issues but return fails (legs handled independently, CONFIRMED code), show the issued leg as secured and the failed leg as 'we are re-issuing this', not the whole booking as failed. The user must see clearly which part of their trip is confirmed and what Away is doing about the rest, on its own timeline. This is the ticketing-stage analog of no-blame decline.","Price-change accept. On a legitimate price change between intent and pay, the existing flow creates a fresh order_id and cancels the old poll; the surface must frame this as a transparent re-confirm of the new all-in price (consistent with all-in-price positioning), not a silent re-charge."]},"Acceptance criteria":{"overview":"Measurable, instrumented, and tied to the confirmed event shapes. 'Measured' below means computed from our analytics events.","points":["AC1: Every server_payment_failed event carries a failure_class in {gateway_decline, app_error, incident} and the board (1770694) shows payment success rate split by class, daily and rolling-7d. Done when 100% of new failure events are classed.","AC2: Payment success rate (succeeded / (succeeded+failed)), measured rolling-7d, reaches at least 70% in V1 and at least 85% in V2, with the app_error class driven toward near-zero (app_error is our fault and is the controllable share).","AC3: Duplicate/superseded charges for a single booking-intent reach zero after server-side idempotency ships (R2): measured as superseded-or-duplicate attempts per unique intent.","AC4: No price-change charge occurs without a server-validated price_locked check (R3): measured as zero charges where the charged price differs from the locked/re-accepted price.","AC5: Ticketing issuance rate (issued / (issued+failed)), measured separately, reaches at least 85% in V1; partial-issue legs always resolve to a per-leg terminal state visible to the user.","AC6: A daily payment-failure or ticketing-failure spike above threshold pages within the same day (R5): a 13-Jun-shaped event must trigger an alert on 13 Jun, validated by replaying the historical series against the alert rule.","AC7: No state ever labels a pending payment as failed (CONFIRMED principle): validated in QA across app-kill, network-drop, and OS-interruption scenarios on the locked polling screen."]},"V1 / V2":["V1 (instrument and stop the bleeding): R1 failure-class taxonomy + success-rate as north-star on board 1770694; R5 daily spike alerting (catch the next 13 Jun same-day); R2 server-side idempotency key (close the confirmed honest gap); the calm-retry, no-blame-decline, and pending-not-failed states. V1 is about making reliability visible, alertable, and double-charge-safe.","V2 (enforce and harden): R3 server-enforced price_locked (advisory to real lock); R4 ticketing reliability as a first-class tracked metric with its own alerting and full partial-issue recovery UX; success-rate target raised to about 85% with app_error driven near-zero; reliability surfaced as a trust signal in-product (consistent with 'protect, do not sell'). Optional V2+: route/segment reliability splits once the server geography flag (the separate C2 instrumentation gap) lands, so we can see if intl payments fail differently."],"Metrics":["North-star: payment success rate = succeeded / (succeeded+failed), rolling-7d, split by failure_class. Baseline about 35.2% (about 50.2% ex-spike), 90d, our analytics, high confidence.","Guardrail: app_error share of failures (the controllable, our-fault slice). Drive toward zero.","Ticketing issuance rate = issued / (issued+failed), tracked separately. Baseline about 51% (76 issued vs 72 failed), 90d, high confidence.","Intent:paid ratio (1,517/135 = about 11.2x today): a falling ratio means real conversion is catching up to stated intent. High confidence on the baseline.","Daily failure-spike count vs threshold (alert metric): the 13 Jun day was 122+11 failures vs 7 successes, about 49% of all 90d failures, high confidence."],"Risks":["Idempotency done wrong can itself drop a legitimate charge or block a valid retry: it must collapse duplicates without swallowing a genuine second booking. Test against the partial-issue and price-change-accept flows specifically.","Over-tight spike alerting creates pager fatigue; under-tight misses the next incident. Calibrate the threshold against the replayed 13/19/20/25 Jun series before going live.","Failure-class taxonomy is only as good as the gateway's own reason codes; some Cashfree declines may be ambiguous, leaving an 'unknown' bucket that must be monitored, not hidden.","The about 35% baseline is raw event counts, not a person-stitched funnel; a user-level funnel could shift the exact number. Re-run as a stitched funnel before committing the V1/V2 success targets as contractual.","Reliability work competes for the same eng time as search/verdict features; the case for prioritizing it rests on the modeled lift (doubling realized bookings), which is a hypothesis until the fixes ship and move the metric."],"Open questions":["What actually happened on 13 Jun? Confirm whether it was a Cashfree-side outage, a deploy, or an app bug. This single answer reclassifies about 49% of all failures and decides how much of the about 35% is incident vs chronic.","Of the chronic about 50.2% ex-spike baseline, what is the gateway_decline vs app_error split? Un-answerable until R1 ships; it determines whether the fix is mostly ours (app_error) or mostly the user's bank (gateway_decline).","Why did ticketing improve after about 14 Jun? Was a supplier/PNR-issuance fix shipped? If so, document it; the cause may inform the payment fix.","Is price drift between intent and pay a material driver of failed/superseded attempts, i.e. how often does price_locked actually fire today (currently advisory)? Needs the R3 instrumentation to answer.","Should pending payments have a max-resolve SLA before we proactively reach out (rescue-adjacent), and does that belong in this spec or in the Disruption/Rescue surface?"],"Sources & confidence":["Own data (HIGH confidence): all funnel, success-rate, spike, ticketing, and intent:paid figures from our analytics, 90d server window (2026-04-29 to 2026-06-29), re-run live; consolidated board 1770694 (the five old theme boards 1770457/67/66/69/68 are 404).","Code facts (CONFIRMED from the App.jsx case study): about 2s polling to terminal; locked back-nav (BackHandler + swipe) as the double-charge guard; NO server-side idempotency; price_locked set but enforcement not wired (advisory); Cashfree rejects old order_id re-pay so fresh order_id + old-poll-cancel on price change; partial-issued legs handled independently; pending never treated as failure.","Causal root causes (HYPOTHESIS): gateway-vs-app-vs-incident attribution, and the conversion impact of each fix, are un-confirmed until R1 instrumentation lands. Flagged per-bullet above.","Funnel caveat (MEDIUM): figures are raw event counts, not a person-stitched funnel; the collapse magnitude is unambiguous, the exact percentages may shift on a stitched re-run."]};
export const awayVerdictSpec = {"id":"prd-verdict","eyebrow":"The verdict","title":"Segment-aware verdict","summary":"The Flight Index already produces one defended verdict. This spec makes that verdict speak differently to different travellers, the same engine, the same flight, the same hard warnings, but the headline, what it leads with, the default sort order, and how it treats a self-transfer all bend to the traveller's kind of trip and how experienced they are. The segment sets the dials; it never adds a second list to choose from. The verdict resolves the choice for the person actually making it.","1. Summary":{"overview":"People are not scared to book an international flight on an app. They are scared to decide, and to be alone when it breaks (an industry survey found 71% book online, only 16% want a human for the transaction; the human was always wanted for the judgment and the rescue). The Flight Index already collapses the decide-fear into one verdict: book this or skip this, with a defended pick and named rejections. But a single verdict voice cannot serve every traveller, because travellers do not differ in how flexible they are, they differ in which thing they refuse to flex on. A first-timer is rigid on reassurance and will flex price and dates if hand-held; a value-optimiser is rigid on price and time and will flex the airline and even a self-transfer; someone locked to a date (visiting family, or a student) is rigid on the date and flexible on route and airline. The same Rs.84,000 Doha connection is the right answer for one and a trap for another. This spec makes the verdict aware of the segment: the kind of trip and the experience level set which of the four things leads the headline, what the default sort is, what gets shown versus hidden, and whether a self-transfer is ruled out or merely offered. It never adds a settings screen, never shows a second ranked list, and never lets the segment override a money or safety warning.","points":["The principle: same flight, different verdict headline per segment — the verdict resolves the choice, it never adds another grid to choose within.","Three to five segments, set by trip-type + experience (not nationality), each with a dominant fear, a flex set, a will-not-flex set, and the one verdict headline they need.","Detection in <=3 onboarding questions plus behavioral inference, degrading gracefully to Balanced when unknown.","The dials change by segment: which axis leads, the default sort, surfaced-vs-suppressed signals — all on the existing engine.","Self-transfer becomes a segment-conditioned hard gate: disqualified for first-timer/VFR/family-with-kids/checked-bag, opt-in for value-optimizers, with DGCA same-PNR protection taught inline."]},"2. The principle — same flight, different verdict":{"overview":"The Flight Index's job is to retire decision fatigue by handing one defended answer instead of a grid. Segment-awareness is the recognition that 'the right answer' is not a property of the flight alone — it is a property of the flight FOR THIS TRAVELER. The engine already computes four absolute-anchored sub-scores and a composite that ranks but is never shown. Segment-awareness changes three things and nothing else: (1) which sub-score the verdict headline LEADS with, (2) the default lens weighting and sort, and (3) which signals surface versus stay silent. The composite math, the hard gates, and the confidence ladder are untouched.","points":["INVARIANT 1 — one verdict, never a second grid. The output is still '{N} flights, {M} worth your time' plus one pick. Segment changes the words on the headline and the pick's lead reason, never the number of choices handed back. A first-timer who is overwhelmed by options must not be handed a 'first-timer view' AND a 'normal view' to pick between — that re-introduces the exact decision the verdict exists to kill.","INVARIANT 2 — segment re-voices and re-weights; it never relaxes a gate. A value-optimizer can opt into a self-transfer; a value-optimizer cannot opt into a change-airport trap, a sub-MCT connection, or a brutal locked-in Saver. Money and safety gates have a global floor (Flight Index 5.6: per-user demotion of safety forbidden). Segment may only move VIBE-class signals and the LEAD/voice of catastrophe-class ones.","INVARIANT 3 — the same flight gets a different headline, not a different rank within a segment. F2 (the AI same-PNR 1-stop) is the pick for everyone in the Chicago worked example; what changes is whether the headline leads 'in by 3pm, fully protected, one ticket end to end' (first-timer) or '₹3,600 over the stitched fare, but that one is not really one ticket' (value-optimizer). Different lead reason, same defended pick.","INVARIANT 4 — when segment is unknown, fall back to Balanced and the neutral verdict voice. Detection is a confidence-weighted prior, not a hard branch. A mis-detected segment must degrade to a sensible generic verdict, never to a wrong-and-confident one.","The mechanism is a SEGMENT PROFILE applied at render: it picks the default lens preset (3.6), reorders the headline's lead axis, and sets surfaced-vs-suppressed per signal. It is read AFTER gates and scoring, at the arbitration/render stage (pipeline stage [J]), so it can never reach back and rescue a gated flight."]},"3. Segment model":{"overview":"Five segments, set by two dials — trip-type and experience — exactly as the research concludes (trip-type is the stronger dial; VFR/student/business invert the leisure flex pattern). Away's 8 personas map onto these five; the personas are the qualitative faces, the segments are the dial-settings the engine reads. Each segment is defined by its dominant fear, what it will flex, what it will NOT flex, and the verdict headline it needs. Confidence on the experience split is high (Skift June 2025: 51% of Indian flyers avoid airlines on safety; LocalCircles: 29% check aircraft type — both post-AI171, both behaviors that barely existed before); the segment cluster structure itself is synthesis from survey + JTBD, not a clustering study on India outbound (medium confidence — see open questions).","points":["S1 FIRST-TIMER (0 prior intl trips; reassurance-rigid). Personas: Anxious First-Timer Meera, Family Coordinator Sneha (with kids). Dominant fear: 'is this safe / real / will I be stranded?' WILL flex: price, dates, even a longer routing — IF hand-held. WILL NOT flex: nonstop-equivalent (no airport changes), full airline protection (same PNR), named/trusted airline, safety. Verdict headline they need: reassurance-first — 'safe, one ticket end to end, no airport changes, full airline protection — this is the simple one.' Source: Skift 51% avoid-on-safety, LocalCircles 29% aircraft-check (high); first-timer cohort fastest-growing, 63% from Tier-2/3, avg age fell 32->25 (medium).","S2 VALUE-OPTIMIZER (3+ prior intl trips; price/value-rigid, self-recovers). Personas: Price Hunter Devika, Offer Maximizer Nikhil, Loyalty Optimizer Karthik. Dominant fear: 'am I overpaying / is something cheaper hiding / is the brand premium a con?' WILL flex: airline, layover, self-transfer (eyes open), cabin. WILL NOT flex: total effective price, time wasted (long-way-round), being patronized. Verdict headline they need: trap-catching value math — 'you are paying ₹X for the brand; same itinerary, here is the catch in the cheap one so you can judge it.' Source: hidden-city/self-connect adoption by sophisticated travelers (medium); they are the credibility beachhead — they verify the verdict against their own knowledge.","S3 COMFORT-FIRST (experienced, affluent; comfort/time-rigid). Personas: Comfort seeker Subramanian, Time-Boxed Pro Arjun. Dominant fear: 'will this wreck me / cost me a working day?' WILL flex: price (trades money for comfort/time). WILL NOT flex: nonstop, cabin/seat product, arrival fit, low total fatigue. Verdict headline they need: arrive-fresh math — 'non-stop, lands 3pm, you start tomorrow rested — ₹900 more than the red-eye that costs you a day.' Source: Air India comfort survey 80% comfort-matters-more, 60% pay-extra; Google-Kantar 2025 72% price-matters-less, 81% splurge (medium).","S4 DATE-LOCKED VFR / EVENT (any experience; date-rigid, route/airline-flexible). Personas: Family Coordinator Sneha (event-locked), Flexible Explorer Riya only when event-locked. Dominant fear: 'will I miss the wedding/term-start/visa-appointment?' WILL flex: route, airline, layover, even self-transfer if experienced. WILL NOT flex: the date, arriving-before-the-event with margin. Verdict headline they need: get-there-on-time, defend-the-date — 'lands the 14th with a day's margin; cheapest route that still protects the connection. waiting costs you ₹X (last-minute fares run +34-80%).' Source: CAPA-Expedia ~16% of Indian outbound is VFR (high); within-7-day fares +34% HappyFares / +40-80% Hopper (high); 42% of outbound booked within 7 days (high).","S5 STUDENT (1-2 prior trips; baggage/airline-rigid, date/layover-flexible — a distinct hybrid). Personas: maps closest to Flexible Explorer Riya in study-abroad mode. Dominant fear: 'will my bags cost a fortune / not make it?' WILL flex: dates (term-start gives ~2-week window), layovers, long routings. WILL NOT flex: free checked-bag allowance (2x23kg drives airline choice), the bag benefit being locked AT booking. Verdict headline they need: all-in-with-bags — 'both bags free on this fare (lock it now — cannot be added later); ₹X all-in including baggage, lands before term.' Source: Lufthansa/Emirates student-fare bag rules, must book the student fare or cannot add bags later (high)."]},"4. Segment detection":{"overview":"Detection is a triage, not an interrogation: at most three onboarding questions, each cheaply predictive of the flex/rigid profile, plus continuous behavioral inference that can override or confirm the onboarding prior. The output is a per-user segment vector with a confidence; below a confidence floor the engine renders the neutral Balanced verdict. Detection never blocks search — a user who skips onboarding gets Balanced and is inferred from behavior.","points":["Q1 — trip purpose: visiting family/event · holiday · study/work-relocation · business. (Sets trip-type dial: family/event -> S4 lean; holiday -> S1/S2/S3 by experience; study -> S5; business -> S3/value by behavior.)","Q2 — prior international trips: 0 / 1-2 / 3+. (Sets experience dial: 0 -> S1 reassurance-rigid; 1-2 -> transitional, lighter reassurance; 3+ -> S2/S3 self-recover.)","Q3 — who is traveling: alone · couple · family with kids · with elders. (family-with-kids or with-elders forces the self-transfer gate ON regardless of experience — they cannot self-recover; raises reassurance weight.)","Behavioral inference (continuous, overrides a stale onboarding prior): repeated cheapest-sort + self-transfer-accept -> S2; three 30kg/checked-bag bookings -> S5/comfort baggage floor; repeated nonstop-only + named-airline filter -> S1/S3; aircraft-type checks -> reassurance weight up; date-grid usage -> date-flexible (NOT S4); price-watch on a fixed date -> S4. This mirrors the Flight Index 'inferred lean' (3.6): reflected in copy, never a settings page. our analytics can measure self-transfer accept/reject by trip-type as revealed preference — stronger than the survey proxies (open question O1).","Decay: first-timer rigidity decays after one successful long-haul (anecdotal; transition curve unquantified — O3). Treat S1 as time-boxed: after a completed intl trip, soften reassurance weight toward S2/S3 unless behavior says otherwise. Re-arm reassurance mode for a new region or a much longer haul.","Confidence floor: if onboarding skipped AND <2 searches of behavioral signal, segment_confidence < floor -> render Balanced + neutral verdict voice. Detection is a prior multiplied into the render, exactly like the confidence ladder gates copy — never a hard branch that can strand a mis-detected user in the wrong-and-confident voice."]},"5. How the dials change by segment":{"overview":"Each segment maps to (a) a default lens preset from Flight Index 3.6, (b) a default sort, (c) a headline lead-axis, and (d) a surfaced-vs-suppressed signal policy. All five run on the identical engine: same sub-scores, same composite, same gates. Only the render-stage profile differs. The lens remains a weighted blend with a dominant axis (~0.5-0.6), never a single-axis sort (3.6) — so a hard warning on a non-dominant axis still surfaces and demotes for every segment.","points":["S1 FIRST-TIMER — lens: Comfort-leaning Balanced biased to protection (raise the RISK&TRUST surfacing, w_comfort up). Default sort: protected + nonstop first, not cheapest. Headline leads: protection/safety ('one ticket end to end, no airport changes'). SURFACE: protected_connection (the positive 'looks like one ticket — if the first leg slips they rebook you'), only_non_stop, operated_by clarity, holds_up_well. SUPPRESS: off_market_savings hero, scarcity, skiplagging-adjacent value framing, raw cheapest sort. Self-transfer gate: HARD (section 6).","S2 VALUE-OPTIMIZER — lens: Price (0.60/0.18/0.10/0.12). Default sort: effective (penalty-adjusted) price, with the cheapest-floor view available as an explicit separate sort (Google Best-vs-Cheapest pattern). Headline leads: PRICE trap-catching ('you are overpaying ₹X for the brand; the cheap one's catch is...'). SURFACE: penalty_adjusted_value, cheapest_is_a_trap, below_market_floor, off_market_savings (when it clears the materiality floor), hidden_costs. SUPPRESS: over-reassurance copy, hand-holding tone. Self-transfer gate: OPT-IN (loud flag, not disqualify).","S3 COMFORT-FIRST — lens: Comfort (0.18/0.22/0.10/0.50). Default sort: arrival-fit + low-fatigue first. Headline leads: COMFORT/TIME arrive-fresh ('non-stop, lands 3pm, rested for a 9am start'). SURFACE: only_non_stop, land_fresh/save_the_morning, sleep_through_it, worth_the_splurge (the ₹900-more-arrives-fresh trade), real_legroom/lie_flat [SOON]. SUPPRESS: cheapest-first framing, bare_bones_lcc as a positive. Self-transfer gate: HARD-leaning (a comfort-seeker is not buying a self-transfer).","S4 DATE-LOCKED VFR/EVENT — lens: Balanced biased to PRICE with a date-defense overlay. Default sort: effective price among on-time-for-the-event options; routes/airlines wide open. Headline leads: arrival-deadline + cost-of-waiting ('lands the 14th with margin; cheapest protected route; waiting costs +34-80%'). SURFACE: cost-of-waiting / lock-the-fare nudge, protected_connection IF inexperienced-VFR or with kids, all-in route options. SUPPRESS: flexible-date grid and 'shift a day, save ₹X' (the dates do not move — mis-targeting flexibility reads as the product not understanding them). Self-transfer gate: HARD for inexperienced/family VFR; opt-in for experienced VFR.","S5 STUDENT — lens: Price with a hard BAGGAGE floor (effective price MUST include checked-bag all-in; bag_friendly elevated to a lead signal). Default sort: all-in-with-bags price among bags-included or bag-cheap fares, before term-start. Headline leads: bags + all-in ('both bags free — lock it now, cannot add later; ₹X all-in, lands before term'). SURFACE: bag_friendly (elevated), hand_baggage_only_trap (elevated — bag traps are catastrophic for students), flexible-date grid (they ARE date-flexible), long-layover tolerance. SUPPRESS: nothing reassurance-heavy. Self-transfer gate: opt-in IF experienced, but the bag-protection caveat dominates (separate tickets = bags not through-checked = a student's whole life mis-routed)."]},"6. Self-transfer as a segment-conditioned HARD GATE":{"overview":"Self-transfer (different-PNR / stitched-carrier connection) is the single highest-trust 'skip this' the engine can ship, and it is exactly where the cheapest-looking fare lures the wrong traveler. In the Flight Index it is a catastrophe-class gate (regret_weight 1.0, P>=~0.4 caps the bucket at TRAP), but it is always an INFERENCE today (true PNR is [COLD], capped at 0.7 confidence, hedged copy). Segment-awareness conditions WHO the gate disqualifies versus WHO may opt in — without ever weakening the underlying detection or the hedge discipline.","points":["The asymmetry, grounded: self-connecting is advised 'only for confident and experienced travelers'; ~30% of self-transfer travelers do not realize they may need a transit visa; first-timers should avoid self-connections with checked bags, kids, tight layovers, or unfamiliar airports — a list that maps 1:1 onto the first-timer/VFR/family profile (research, high). India's DGCA protects same-PNR connections ONLY — combo buyers are structurally unprotected (problem note, high). ~179M self-connect pax/yr globally are exposed.","DISQUALIFY (gate to TRAP, exclude from worth-count and pick): S1 first-timer, S4 inexperienced/family VFR, any segment traveling with kids or elders, and any traveler with a checked bag on the routing. For these the verdict asserts/hedges the skip and recommends the protected alternative even at a higher price. Copy (hedged, since PNR is inferred): 'this looks like two separate tickets — if the first leg slips, the second airline owes you nothing, and your bags are not checked through. for a first trip i would not put you on it. the ₹3,600-dearer Air India is one ticket end to end.'","OPT-IN (loud flag, not disqualified): S2 value-optimizer, experienced S4 VFR without kids/bags, experienced S5 student without checked bags. The flag is shown at full prominence; the flight stays eligible and may even be the pick if the user has demonstrated self-recovery behavior. Copy: 'looks like two separate tickets — no airline covers a missed connection here, and bags are not through-checked. you have flown these before; the saving is ₹3,600. your call.' The opt-in is a one-time informed acknowledgment, logged, then remembered as a behavioral signal.","TEACH the DGCA same-PNR protection inline, for every segment, once. The protected_connection positive ('looks like one ticket end to end — if the first leg slips, they rebook you and your bags follow') is the reassurance counterpart that lets a first-timer feel safe choosing the dearer fare, and the education that lets a value-optimizer make a real choice rather than a blind one. This is 'protect-don't-sell' made concrete — and it is timely with the 2026 CCPA probe into OTA practices.","Implementation: segment sets the gate's DISPOSITION (disqualify vs flag-and-allow) at render stage [J]; it does NOT change P(problem) or regret_weight in the scoring math. The gate still fires identically in the engine; segment only decides whether a fired gate removes the flight from the worth-set (first-timer) or surfaces it as an acknowledged-risk option (value-optimizer). Safety floor preserved: NO segment can suppress the flag entirely or downgrade it below amber. Change-airport, sub-MCT, and brutal locked-in Saver remain disqualify-for-everyone (lens- and segment-invariant)."]},"7. Surfaces & states":{"overview":"Reuses the Flight Index surfaces (design-spec §19) with zero net-new components beyond what the index already added. Segment changes copy and signal selection in existing slots: Verdict line, Flight row tags, Recommendation Panel, the lens switcher default, and the why-this-flight breakdown. The lens switcher stays user-overridable — segment sets the DEFAULT lens, the user can always switch, and an explicit override is itself a strong behavioral signal.","points":["Verdict line (reused): same '{N} flights, {M} worth your time' headline; the SECOND line is segment-driven (extends the existing tone-mode second-line system). First-timer: 'one of them is the simple, fully-protected one — that's the one i'd book for a first trip.' Value-optimizer: 'the cheapest hides a self-transfer; the one i'd book is ₹X more and actually one ticket.' Date-locked: 'two land before the 14th with margin; the cheaper one cuts it close.'","Recommendation Panel (reused): the pick's LEAD reason is the segment's lead axis; the named rejection is framed in the segment's fear-language. First-timer pick leads protection; value-optimizer pick leads the price/trap math; the rejection a first-timer sees is 'skipped the cheaper one — looked like two tickets, no airline covers the miss,' while the value-optimizer sees the same flight rejected as 'the brand premium buys you nothing here.'","Onboarding triage (NEW, lightweight): three single-tap questions on first run; skippable; renders into the existing onboarding flow, not a new surface. A 'why we ask' line keeps it honest ('so i lead with what matters to you — you can change this anytime').","Segment-conditioned states: the all-traps and thin states (4.3) inherit segment voice — for a date-locked user, all-traps becomes 'nothing protected lands before the 14th on these exact routes; widen the route, not the date.' For a value-optimizer, all-traps stays 'none i'd put you on as-is — the cheap ones are self-transfers.'","Override transparency: when a user switches lens away from their segment default, no friction, but log it; three overrides toward Price re-weight the segment toward S2 (mirrors Flight Index inferred-lean). The segment is never shown as a label the user must manage — it lives in the verdict's voice, not a profile screen."]},"8. Acceptance criteria":["AC1 — Given the Chicago worked-example cluster, a first-timer (S1) and a value-optimizer (S2) both receive F2 (AI same-PNR) as the pick, with DIFFERENT lead reasons (S1: protection-first; S2: price/trap-first), and the SAME worth-count. (Proves: same flight, different headline, never a second grid.)","AC2 — A self-transfer flight that fires the catastrophe gate is EXCLUDED from the worth-count and pick for an S1/S4-family/with-kids user, and SURFACED as an acknowledged-risk eligible option for an S2 user — from the identical engine output, decided only at render. The amber flag text is present in BOTH cases (no segment suppresses it).","AC3 — A change-airport trap, a sub-MCT connection, and a brutal locked-in Saver are disqualified for ALL segments including S2 value-optimizer (segment-invariant safety floor).","AC4 — With onboarding skipped and <2 searches of behavior, the verdict renders in neutral Balanced voice with no segment-specific copy (graceful degradation; no wrong-and-confident segment voice).","AC5 — For an S5 student, the displayed effective price for any bag-eligible fare includes the all-in checked-bag cost, bag_friendly is surfaced as a lead signal, and a hand_baggage_only fare is flagged as a trap even when it is the sticker-cheapest.","AC6 — For an S4 date-locked user, the flexible-date grid and 'shift a day' nudge are SUPPRESSED and replaced by a cost-of-waiting / lock-the-fare nudge; for an S1/S3 leisure user the date grid is shown.","AC7 — Switching the lens away from the segment default applies immediately with no friction and is logged; segment is never shown as an editable label.","AC8 — Segment changes only LEAD-axis ordering, default lens, default sort, surfaced-vs-suppressed selection, and gate disposition. It provably does NOT alter any sub-score, the composite value, P(problem), or regret_weight (engine unit tests assert identical scores across segments for the same input)."],"9. V1 / V2":["V1 (ships on the [NOW] engine, zero enrichment): three segments only — S1 first-timer, S2 value-optimizer, and a neutral Balanced default for everyone else. Onboarding Q1+Q2 (purpose + prior trips) and the with-kids flag from Q3. Self-transfer gate disposition conditioned on S1-vs-S2 + with-kids (the highest-trust, highest-leverage split). Verdict second-line and pick lead-reason re-voiced per segment. DGCA same-PNR teaching inline. All on the existing inferred-self-transfer signal (hedged, capped 0.7).","V1 explicitly defers: S3 comfort and S5 student as distinct profiles (they fold into Balanced + behavioral baggage floor at v1); behavioral decay of first-timer rigidity; the cost-of-waiting date-defense overlay beyond a simple last-minute warning.","V2 (with enrichment + accumulated behavior): all five segments. Full behavioral inference loop (PostHog-grounded segment vector, decay curve after first successful trip). S4 date-defense overlay using the owned price-history baseline (+34-80% last-minute, lock-the-fare). S5 student baggage floor using real fare-rules bag tiers [SOON]. Comfort-first leaning on aircraft/seat enrichment [SOON]. Self-transfer gate upgraded from inference to asserted once true PNR structure (NDC/GDS) lands — the gate disposition logic is unchanged, only the copy stops hedging.","V2 measurement prerequisite: instrument the international/origin-destination flag on server events (the C2 gap from the problem note) and self-transfer accept/reject by trip-type — without these, segment effectiveness is un-measurable on the real dataset."],"10. Metrics":{"overview":"Inherits the Flight Index north star (warning precision >= 0.90) unchanged — segment must never degrade it. Segment-specific metrics measure whether the re-voicing actually resolves the decision for the right people.","points":["Primary — segment-conditioned pick-accept WITHOUT regret: of users who took the segment-led pick, the fraction whose post-trip outcome confirmed the lead reason (first-timer: connection made, one ticket held; value-optimizer: no cheaper-and-equivalent surfaced later). NOT raw accept-rate (a health signal only — optimizing it rewards the boring pick, per Flight Index 8.3).","Self-transfer gate efficacy: for DISQUALIFY segments, the rate at which a disqualified self-transfer would have caused a real miss/visa/bag problem (caught-before-it-hurt, segmented). For OPT-IN segments, the regret rate of users who opted in — high regret means the opt-in copy under-warned.","Detection accuracy: agreement between onboarding-declared segment and behaviorally-inferred segment after N searches; high disagreement flags a bad triage question. Measured against our analytics' revealed preference (self-transfer accept/reject by trip-type).","Mis-targeting guardrail: rate of lens-override away from the segment default (a high override rate for a segment means its default dial is wrong); and explicit 'this doesn't fit me' dismissals of segment-voiced copy.","Safety-floor audit (catastrophic class): zero tolerance — any instance where segment disposition suppressed an amber flag below threshold is a P0 regression. Sampled audit, same rigor as the silent-miss audit in Flight Index 8."]},"11. Risks":["Wrong-and-confident mis-detection. A mis-segmented user gets a verdict voiced for the wrong fear (telling a value-optimizer 'don't worry, it's safe' insults them; telling a first-timer 'the saving is ₹3,600, your call' abandons them). Mitigation: detection is a confidence-weighted prior with a Balanced fallback floor; behavioral inference overrides stale onboarding; lens stays user-overridable.","Stereotyping / patronizing the first-timer. Reassurance voice can tip into condescension. Mitigation: reassurance is specific and factual ('one ticket, bags through-checked, 94% on-time' — the number over the adjective, per Flight Index voice), never 'don't be scared.' Reassurance mode decays after a successful trip.","Segment used to relax safety. The opt-in path is the obvious place for safety to erode (a value-optimizer talked into a change-airport trap because 'they're experienced'). Mitigation: hard architectural separation — segment sets disposition only for the self-transfer gate's disqualify-vs-flag choice; change-airport, sub-MCT, brutal-Saver remain segment-invariant; AC8 unit-tests assert identical scores across segments.","Second-grid creep. Pressure to show 'a first-timer view and an everything view' re-introduces the choice the verdict kills. Mitigation: INVARIANT 1 — one verdict, one pick, always; segment is voice + dial, never a parallel list.","Un-measurability on the real dataset. With no server-side intl/OD flag and self-transfer choice un-logged, segment effectiveness cannot be measured today (problem note C2 gap). Mitigation: gate V2 on the instrumentation fix; treat V1 as a directional bet validated on the ~2-week client dataset only.","Cluster-validity risk. The five segments are JTBD/survey synthesis, not a clustering study on India outbound (medium confidence). Mitigation: validate against our analytics' revealed preference before hard-coding more than the V1 two-segment split; commission a latent-profile study (O2)."],"12. Open questions":["O1 — Measure self-transfer and multi-stop accept/reject by trip-type on our analytics (revealed preference, far stronger than the survey proxies). Gates the gate-disposition calibration.","O2 — Validate the five-segment model with a latent-profile/cluster analysis on Away's own user base or a commissioned India-outbound study (a domestic study exists, Nature 2025; outbound does not).","O3 — Quantify the first-timer rigidity decay curve (1->2->3 trips): how fast does reassurance-need drop, and which fears reset on a new region vs a longer haul? Drives how long S1 voice persists.","O4 — Gulf/labor-migrant VFR behavior is under-documented (price-rigid, route-flexible assumed). If material to TAM, needs primary research on the Kerala/UP/Bihar corridors before a distinct S4-migrant profile is built.","O5 — The family-decision dynamic (who actually chooses when a Family Coordinator books for the household) — does the verdict address the booker, the traveler, or both? Affects S1-family and S4-family voice.","O6 — [confirm] the segment_confidence floor below which we fall back to Balanced, and the number of lens-overrides that re-weight a segment (proposed 3).","O7 — [confirm] whether the value-optimizer self-transfer opt-in is a one-time global acknowledgment or per-routing (per-routing is safer but higher-friction)."]};
