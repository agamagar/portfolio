// The October 2026 update to /work/away-agent: Tern, the agent narrowed to flights.
// Copy is from the travel chat's decisions.md (Fadell register), edited only to fit the layout.
// The agent is called Goose in prose. The captures show the prototype name, Atlas.
const T = (g) => "Tern · " + g;

export const ternSections = [
  {
    h: "The trip breaks",
    group: T("Focus"),
    tldr: "Travel apps promise to plan your trip. Almost none help when it breaks. So I narrowed the agent to one problem, flights after booking.",
    p: [
      "Everything above stands. This is what I built next, a prototype called Tern. Travel apps promise to plan your trip. Almost none of them help when the trip breaks. That's the gap I went after. And it's a dangerous brief. An agent that sounds sure in the middle of a refund fight, and is wrong, costs someone real money. So the first rule wasn't a feature. It was a limit.",
      "I started with a scan of X and three 2026 surveys. 61% of travelers named hidden fees as their top booking frustration. 89% of US travelers planning to fly in the next year say they're concerned about delays or cancellations. The barriers they named: long waits 48%, too few rebooking options 42%, not knowing what the options are 34%. And 46% of US consumers say they've abandoned a booking because it was too complicated or time-consuming.",
      "Fortune doesn't print fieldwork dates and doesn't say which survey base the 48, 42 and 34 come from, so I cite them as Fortune's reporting. The X scan was web search over posts, a sample and not a live feed, so I treat it as an informal signal. The surveys carry the numbers.",
      "A travel agent that does everything is a demo. A travel agent that does one thing, at the moment it matters, is a product. So the decision was flights only, and only from the moment someone has booked.",
    ],
    sources: [
      { t: "Fullstory survey, May 2026", href: "https://www.fullstory.com/fullstory-releases-travel-and-hospitality-survey-findings" },
      { t: "Fortune on Hopper's survey, May 2026", href: "https://fortune.com/2026/05/19/89-travelers-disruptions-top-concern-paying-more-summer-travel/" },
      { t: "Travelport survey, June 2026", href: "https://www.travelport.com/press-releases/new-survey-finds-consumers-want-clarity-and-confidence-when-booking-travel" },
      { t: "Meta, WhatsApp Groups API docs", href: "https://developers.facebook.com/documentation/business-messaging/whatsapp/groups.md" },
      { t: "Meta, WhatsApp Business terms", href: "https://www.facebook.com/legal/Meta-Terms-for-WhatsApp-Business-Platform" },
    ],
    ul: [
      "Ruled out, a broad trip planner. Food, stays, things to do. I built them, then hid them behind one flag. They worked. They weren't the problem.",
      "Ruled out, a bill splitter. Splitwise already owns it.",
      "Ruled out, WhatsApp first. The official docs let a business run a group only up to 8 people, created by the business and joined by invite link, and only for an Official Business Account. As far as the docs say, you can't drop a bot into an existing friends group, and groups have no buttons or lists. The terms also bar general-purpose AI assistants as the main product, so my reading is that a travel-only agent is the safe shape. Not a fast first step.",
      "Ruled out, a web app. I switched to iOS. The product lives at an airport gate.",
    ],
    soWhat: "If the agent can talk about everything, nobody trusts it about the one thing that costs money.",
    fig: "ternWhichFlight",
    figure: "The first question Tern asks: which flight are you on? A real screen, light and dark.",
    divider: true,
  },
  {
    h: "Hold two phones together",
    group: T("Pairing"),
    tldr: "Phones find each other with no server and no account. The flow is built, and it is untested on two real phones.",
    p: [
      "People coordinate flights in a messy group thread. That was the second problem. A server means accounts, and nobody makes an account at a gate. So phones find each other nearby with no server. They only connect when ultra-wideband says they're within 35 centimetres, and a green fill sweeps down the screen when they do.",
      "I want to be exact about the state of this. The 35 cm threshold and the whole pairing flow are untested on two real phones. Every connecting screen and the green sweep on this page is simulated, driven by a script with fixed sample phones. No radios are involved.",
      "My first build found nothing. Both phones sat on \"Looking for nearby phones.\" I changed three things at once: restart discovery when the app comes forward, retry the invite every five seconds, drop the encryption requirement. It connected. I never isolated which of the three mattered, so I won't claim a cause. I shipped a fix I can't explain. I'd rather isolate it before I tell anyone why it works.",
    ],
    ul: [
      "Ruled out, a server-backed chat, for now.",
      "Ruled out, connecting at room range. I wanted the connection to happen when two phones are held together, so I gated it on distance.",
    ],
    fig: "ternConnecting",
    figure: "The four connecting states, from searching to two phones side by side. Simulated preview states with fixed sample phones.",
    figsAfter: [
      { fig: "ternSweep", caption: "A phone appears far, moves closer, then the green sweep. A timer drives it, not UWB or Multipeer." },
      { fig: "ternGroupEmpty", caption: "The group tab before any chat: create or join. A real screen." },
    ],
    divider: true,
  },
  {
    h: "Goose proposes, you decide",
    group: T("Goose"),
    tldr: "Goose never books and never pays. It earns the right to interrupt, and every claim names its source.",
    p: [
      "Goose lives in the group chat. In the prototype it still shows as Atlas, and the final name is Goose. It never books and it never pays. Every claim names its source and when it was fetched, or it says \"estimate.\"",
      "An agent that talks too much gets muted. An agent that talks too little isn't there when the flight gets cancelled. The moment that taught me this: Goose posted a food card three seconds after two phones paired, whether or not anyone had asked. My note to the build was, don't just throw suggestions, be smart about it.",
      "So Goose tracks the trip, stays quiet while people are talking, waits two minutes after it speaks, never repeats what someone dismissed, and offers before it researches. Every offer quotes what the group said. The rules sit in plain logic with tests, and the tests pass. Nobody has watched it behave in a real conversation yet.",
    ],
    ul: [
      "Ruled out, an agent that rebooks for you.",
      "Ruled out, automatic cards on a timer.",
    ],
    soWhat: "An agent earns the right to interrupt. It doesn't start with it.",
    fig: "ternChat",
    figure: "Atlas (prototype name, becoming Goose) joins the group chat and says what it will and won't do. Sample messages in the real chat UI.",
    divider: true,
  },
  {
    h: "The timeline starts after booking",
    group: T("Flights"),
    tldr: "I cut search, compare and choose. People have already booked, so the app builds their timeline from a flight number or a boarding pass.",
    p: [
      "My first plan had stages: search, compare, choose, book. I cut the first three. People have already booked. They enter a flight number or scan the boarding pass, and the app builds their timeline from there: check-in, connections, what to do if something breaks. Start where the stress starts.",
      "Two caveats on what you see. Camera scanning is untried, because the simulator has no camera, so the clip uses the paste path. And the flight lookup in that clip is a canned mock, not a live lookup.",
    ],
    ul: [
      "Ruled out, flight shopping.",
    ],
    fig: "ternJourney",
    figure: "The journey for a dummy flight that leaves in three hours: done, now, next. Fixture data, times relative to when it was captured.",
    figsAfter: [
      { fig: "ternAddFlight", caption: "Paste a boarding pass, see the flight card, land on the timeline. Edited from a longer take with the waits cut." },
      { fig: "ternGroupView", caption: "The group view flags a very tight connection: 35 minutes, separate bookings, an airline and terminal change. Sample flights and a real connection planner." },
    ],
    divider: true,
  },
  {
    h: "The barcode stays on the phone",
    group: T("Flights"),
    tldr: "When someone scans a boarding pass, the group sees name, route, flight, date and seat. Never the raw code, never the booking reference.",
    p: [
      "The code carries the booking reference and the surname. Many airlines accept that pair as the login to manage a booking. In 2015 a researcher used it on Lufthansa's site to see flights, change seats and cancel. In 2020 a researcher read a former prime minister's booking details, passport number included, from a posted photo. Jetstar tells customers not to share booking references.",
      "Not every airline works this way, and I didn't test any of them. Those cases concern the printed booking reference. The barcode encodes the same one, so the link is my inference. I found no regulator guidance to cite. So the rule is simple: treat the code like a password.",
    ],
    sources: [
      { t: "IATA boarding pass guide", href: "https://www.iata.org/contentassets/1dccc9ed041b4f3bbdcf8ee8682e75c4/2021_03_02-bcbp-implementation-guide-version-7-.pdf" },
      { t: "KrebsOnSecurity, 2015", href: "https://krebsonsecurity.com/2015/10/whats-in-a-boarding-pass-barcode-a-lot/" },
      { t: "Executive Traveller, 2020", href: "https://www.executivetraveller.com/news/tony-abbott-private-information-exposed-after-instagram-post" },
      { t: "Karryon on Jetstar, 2024", href: "https://www.karryon.com.au/?p=293341" },
    ],
    ul: [
      "Ruled out, sharing the pass with the group \"for convenience.\"",
    ],
    fig: "ternBoarding",
    figure: "A dummy pass parsed from a generated code, fictional passenger. The code is blurred on this page. Fixture data through the real parser.",
    divider: true,
  },
  {
    h: "No invented route",
    group: T("Flights"),
    tldr: "The live demo flight has a position and nothing else, so the card says so. Empty fields stay empty.",
    p: [
      "I wanted a live demo flight in the app, refreshed every hour. The free live-tracking source gives position, altitude, speed and heading. It gives no origin, no destination and no schedule. I could have guessed a route from the callsign. It would have looked great.",
      "Instead the card says \"No route or schedule from this source.\" Dummy flights get a DUMMY badge on the card, the boarding pass and the group view. Both the live demo flight and the dummy flights are still in progress, and neither has shipped.",
    ],
    soWhat: "Empty fields stay empty. A missing source gets named. An unknown route gets said out loud, on every card, every time.",
    fig: "ternLive",
    figure: "The live demo flight card: a position fix fetched from a live source, with the missing route said plainly.",
    divider: true,
  },
  {
    h: "Rights come from rules",
    group: T("Flights"),
    tldr: "The disruption help will encode written rules, not model memory, and every output will say it usually applies and to verify with the airline.",
    p: [
      "I re-checked my old notes against official sources on 22 October 2026. The old notes had a mistake that would have shipped wrong: they lumped denied boarding in with cancellation, and the two are different tables. Check the rules on the day you ship them. The EU rewrote its own on the day I checked.",
      "I'm leaving out three things until I can source them: the old note of INR 450 per kilo for domestic baggage, the EU care thresholds by distance, and US passenger rules. The app will say they aren't covered. And it will never state a legal right as fact.",
    ],
    table: {
      cols: ["Regime", "What the rules say", "What I couldn't confirm"],
      rows: [
        ["EU261", "Compensation of 250, 400 or 600 euros by distance, and the bands are unchanged in the new law. Regulation (EU) 2026/2202 was published on 2 October 2026, enters into force on 22 October 2026 and applies from 23 October 2027. Until then the old text applies.", "I couldn't open the EUR-Lex page. The dates come from the Council's final text and a second report."],
        ["India, DGCA", "Meals and care after a 2, 3 or 4 hour delay, by flight length. Cancellation compensation of INR 5,000, 7,500 or 10,000 by flight length, or the base fare plus fuel charge if that's less. Denied boarding is a different table: 200% of fare plus fuel charge capped at INR 10,000 if the alternative leaves within 24 hours, otherwise 400% capped at INR 20,000.", "The baggage rate per kilo and the refund timelines."],
        ["Montreal Convention", "1,519 SDR for baggage and 6,303 SDR for passenger delay, since 28 December 2024.", "Whether India has adopted the new figures in its own law."],
      ],
      caption: "The rules the disruption screens will encode, as checked on 22 October 2026. Designed, not built.",
    },
    sources: [
      { t: "EUR-Lex, Regulation 2026/2202", href: "https://eur-lex.europa.eu/eli/reg/2026/2202/oj/eng" },
      { t: "Lovguiden on the EU reform", href: "https://www.lovguiden.dk/en/det-offentlige/eur-lex-lovgivning/2026-10-02-ny-eu-forordning-om-flypassagerrettigheder-regler-gaelder-fra-oktober-2027" },
      { t: "DGCA passenger rules", href: "https://www.dgca.gov.in/digigov-portal/Upload?flag=iframeAttachView&attachId=we1PSlOuQhYdHcwKKrm7ew%3D%3D" },
      { t: "ICAO Montreal limits", href: "https://www.icao.int/sites/default/files/secretariat/legal/LEB%20Treaty%20Collection%20Documents/2024_Revised_Limits_of_Liability_Under_the_Montreal_Convention_of_1999_en.pdf" },
    ],
    divider: true,
  },
  {
    h: "A design system that expects new agents",
    group: T("System"),
    tldr: "A new capability ships as a short declaration, and the look, the motion and the accessibility are derived from it.",
    p: [
      "The agents will keep changing, and new ones will show up. So a new capability ships as a short declaration, the Agent Surface Contract: what it means (inform, ask, offer, warn, triage), how sure it is (sourced, estimate, inferred), how risky it is to act on, and what state it's in. The look, the motion and the accessibility are derived from that.",
      "Anything claiming a source without naming one displays as \"Goose thinks.\" An unknown block renders as a plain card instead of breaking an older app. The colours come from one brightness curve, so contrast holds by construction, and 74 text and background checks pass in light and dark.",
      "It is written, the tokens are generated and the checks pass. The app isn't migrated onto it yet.",
    ],
    ul: [
      "Ruled out, custom styling per agent.",
    ],
    soWhat: "A new agent should need no new design work. If it does, the contract is missing something.",
  },
  {
    h: "A tern and a face",
    group: T("System"),
    tldr: "Plain text rows instead of bubbles, a vector redraw of my own portrait for Goose, and a tern for the mark.",
    p: [
      "Messages are plain text rows, no bubbles. Goose wears a vector redraw of my hand-drawn portrait, with a slow blink and a glance when it's thinking. The tern logo came from my own photo of an Arctic tern, redrawn by hand as a vector.",
    ],
    fig: "ternBrand",
    figure: "The dot-matrix splash with the tern mark, the typing welcome, and the crossfade into the first question. Real screens, chained by a debug state, with a sample name.",
  },
  {
    h: "Limits and what's next",
    group: T("Limits"),
    tldr: "Everything here is a local prototype on one phone. Disruption triage is designed and not built, and that is the biggest gap.",
    p: [
      "Nothing is on the App Store and nothing is deployed. It was installed by cable on one iPhone. Here is where each piece stands.",
    ],
    table: {
      cols: ["Piece", "State"],
      rows: [
        ["Splash, typing welcome, \"Which flight are you on?\"", "Built and installed on one phone"],
        ["Create or join a chat, connecting screens, green sweep", "Built. The first pairing worked on two phones. The redesigned screens and UWB proximity are untested on two real phones"],
        ["Goose in the group chat", "Built. Behaviour not yet watched in a real conversation"],
        ["Flights by number or boarding pass, timeline, group view, connection flags", "Built. Camera scanning untried"],
        ["Live demo flight, dummy flight presets", "In progress. Position only, no route or schedule"],
        ["Disruption triage, claims tracker", "Designed, not built"],
        ["Design system and Agent Surface Contract", "Written and checked. The app isn't migrated"],
        ["Tern logo", "Done as a vector, set as the app icon"],
      ],
      caption: "Shipped versus prototype. Nothing here is shipped.",
    },
    ul: [
      "Not done: disruption triage.",
      "Not done: a real flight schedule feed. Today it's web search with named sources, so results are indicative.",
      "Not done: group behaviour on two real phones.",
      "Not done: the app on the new design system.",
      "The limits of the research: the X scan is an informal signal and not a measurement. Fortune prints no fieldwork dates, and the base for its 48, 42 and 34 figures isn't stated. The EU reform dates rest on the Council's final text and one more report. The boarding pass cases concern the printed booking reference, no airline was tested and no regulator guidance turned up. Pairing, proximity and the read-along are untested on two real phones and in a live conversation.",
    ],
    divider: true,
  },
];
