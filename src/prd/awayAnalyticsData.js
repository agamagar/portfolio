// Live Away-app analytics pulled from PostHog (project phc_KZ3s…), organized by
// pages (screens) and flows (funnels). Snapshot; window noted below. Shipped as
// plain data so /work/away-deep-search renders as native, Agentation-scannable DOM
// (AwayAnalyticsDoc.jsx) instead of an embedded iframe.
// Regenerate by re-running the PostHog queries in Claude/ and pasting the numbers.
// Pre-filled (unsaved) PostHog insight links, so any headline number can be
// clicked and checked against source. Project 265698 (Away, US). A trends
// insight over the same window: math "total" = event count, "dau" = unique
// users. Nothing is saved in PostHog; the link just opens the query.
const PH_BASE = "https://us.posthog.com/project/265698";
const PH_WINDOW = { from: "2026-03-29", to: "2026-07-01" };
function phLink(events, extra) {
  const qs = new URLSearchParams({
    insight: "TRENDS",
    events: JSON.stringify(events),
    date_from: PH_WINDOW.from,
    date_to: PH_WINDOW.to,
    ...extra,
  });
  return `${PH_BASE}/insights/new?${qs.toString()}`;
}
// one event, by count (total) or unique users (dau)
function phVerify(event, math = "total") {
  return phLink([{ id: event, name: event, type: "events", order: 0, math }]);
}
// unique users across all events (for the distinct-person "Tracked IDs" metric)
function phVerifyAllUsers() {
  return phLink([{ id: null, name: "All events", type: "events", order: 0, math: "dau" }]);
}

export const awayAnalyticsData = {
  window: "≈100 days · 29 Mar – 1 Jul 2026",
  source: "PostHog · Away production project",

  // Headline totals across the window. Each number links to the PostHog query it
  // came from (click to verify). Refreshed from live on 8 Jul 2026.
  overview: [
    { label: "Installs", value: "1,965", sub: "Application Installed · unique installers, under 2,000", href: phVerify("Application Installed", "dau") },
    { label: "Tracked IDs", value: "5,549", sub: "distinct person_id, incl. anonymous + reinstalls", href: phVerifyAllUsers() },
    { label: "Deep searches", value: "3,002", sub: "920 users", href: phVerify("server_deep_search_completed") },
    { label: "Bookings created", value: "1,607", sub: "454 users · booking records at init, pre-payment", href: phVerify("server_booking_created") },
    { label: "Payments succeeded", value: "148", href: phVerify("server_payment_succeeded") },
    { label: "Payments failed", value: "253", href: phVerify("server_payment_failed") },
    { label: "Tickets issued", value: "89", href: phVerify("server_ticket_issued") },
    { label: "Onboardings completed", value: "128", href: phVerify("client_onboarding_completed") },
    { label: "Chat messages", value: "9", href: phVerify("client_chat_message_sent") },
  ],

  // every screen, by views + unique users (client_screen_viewed → `screen`)
  pages: [
    { screen: "index", views: 1310, users: 434 },
    { screen: "home", views: 1110, users: 194 },
    { screen: "limited_home", views: 695, users: 121 },
    { screen: "negotiation_results", views: 476, users: 148 },
    { screen: "flight_listing", views: 371, users: 105 },
    { screen: "concierge", views: 357, users: 128 },
    { screen: "negotiation_orchestration", views: 352, users: 151 },
    { screen: "history", views: 202, users: 57 },
    { screen: "welcome", views: 177, users: 172 },
    { screen: "invite_redeem", views: 155, users: 95 },
    { screen: "login", views: 146, users: 138 },
    { screen: "pre_flights_booking", views: 145, users: 70 },
    { screen: "bookings_list", views: 134, users: 54 },
    { screen: "refer", views: 113, users: 47 },
    { screen: "onboarding", views: 104, users: 100 },
    { screen: "post_booking_details", views: 77, users: 22 },
    { screen: "profiles", views: 71, users: 28 },
    { screen: "concierge_tab", views: 58, users: 33 },
    { screen: "payment_processing", views: 30, users: 16 },
    { screen: "flight_negotiation_details", views: 24, users: 18 },
    { screen: "trip_flight_details", views: 18, users: 8 },
    { screen: "wallet", views: 13, users: 11 },
    { screen: "booking", views: 5, users: 3 },
    { screen: "experimental", views: 4, users: 3 },
    { screen: "flight_search", views: 2, users: 1 },
  ],

  // key journeys as ordered steps (unique users + raw event count). Bars are
  // normalized to the flow's largest step, since server-side steps fire more
  // broadly than a single client entry point (so a flow isn't strictly monotonic).
  flows: [
    {
      "key": "login",
      "name": "Login & auth",
      "headline": "Phone-first OTP login is clean and high-converting: 145 users start, 118 succeed (81%), and 87% of those go on to complete onboarding, with failures rare across the board.",
      "lead": "Users land on the login screen, tap the phone button, enter a number and continue, receive an OTP, and verify to succeed. These are independent event populations over 100 days (not a strict per-user funnel), but they line up tightly step to step, so the drop-off read is reliable. One caveat: the verify-OTP-clicked event is effectively not firing (7 users), so verification is measured by the succeeded event, not the tap.",
      "kpis": [
        {
          "label": "Login screen viewers",
          "value": "145",
          "sub": "153 screen views"
        },
        {
          "label": "Login succeeded",
          "value": "118",
          "sub": "125 events"
        },
        {
          "label": "Start to success",
          "value": "81%",
          "sub": "118 of 145 phone-button tappers"
        },
        {
          "label": "Succeeded to onboarding",
          "value": "87%",
          "sub": "103 of 118 users"
        }
      ],
      "funnel": [
        {
          "label": "Viewed login screen",
          "users": 145,
          "events": 153,
          "note": "screen = 'login'"
        },
        {
          "label": "Tapped phone button",
          "users": 145,
          "events": 151,
          "note": "client_login_phone_button_clicked; 100% of screen viewers start"
        },
        {
          "label": "Continue clicked",
          "users": 130,
          "events": 172,
          "note": "client_login_continue_clicked; 90% of starters"
        },
        {
          "label": "OTP sent",
          "users": 127,
          "events": 167,
          "note": "client_login_otp_sent; 88% of starters"
        },
        {
          "label": "Login succeeded",
          "users": 118,
          "events": 125,
          "note": "client_login_succeeded; 81% of starters, 93% of OTP-sent"
        }
      ],
      "cohort": [
        {
          "label": "Login succeeded then completed onboarding",
          "value": "103 / 118 (87%)",
          "note": "Strong hand-off; the about 13% gap is likely returning users who already onboarded"
        },
        {
          "label": "Login succeeded then created a booking",
          "value": "34 / 118 (29%)",
          "note": "Downstream intent within the same 100d window"
        },
        {
          "label": "Login succeeded then paid",
          "value": "6 / 118 (5%)",
          "note": "Payment is far downstream and rare across the whole app (75 unique paying users of about 5,367; 146 payment events)"
        }
      ],
      "insights": [
        "Auth is not a leak point. Of 145 users who start (tap the phone button), 118 succeed - an 81% start-to-success rate, and 93% of everyone who gets an OTP sent goes on to succeed.",
        "Every login screen viewer starts: all 145 unique screen viewers also fired phone_button_clicked, so there is essentially zero abandonment at the login screen itself.",
        "The only real intra-funnel drop is phone entry: 145 tap the button but 130 click continue and 127 get an OTP sent - about 12% fall off while entering their number, before any OTP is involved.",
        "Failures are negligible: 4 users hit OTP send failure, 3 hit an invalid OTP, and 6 hit verification failure - low single digits against 127 OTPs sent, so delivery and verification are not friction sources.",
        "Login is a tiny slice of the about 5,367-user base (145 login-screen users, about 2.7%), consistent with most sessions being already-authenticated or pre-login browsing; login is the gate to the committed cohort, not a mass event.",
        "The logged-in cohort is high quality: 87% complete onboarding and 29% create a booking, versus a booking rate far lower across the whole base - successful login strongly predicts downstream engagement."
      ],
      "caveats": [
        "Steps are independent event populations over 100 days, not a strict single-user sequential funnel; conversions are computed as unique-user ratios between steps and read cleanly here because the counts descend monotonically.",
        "The 93% (118/127) succeeded-to-OTP-sent figure is a cross-population ratio, not a per-user funnel step: login_succeeded is not a strict subset of otp_sent (only 115 of 118 succeeders also fired otp_sent within the window).",
        "client_login_verify_otp_clicked is effectively not instrumented (only 7 users / 7 events vs 118 succeeded), so the verify-OTP tap step is omitted from the funnel and success is measured directly by client_login_succeeded.",
        "Event counts slightly exceed unique users at some steps (e.g. continue_clicked 172 events / 130 users), indicating retries - normal for phone/OTP entry.",
        "Downstream booking (34) and payment (6) cohorts are within the same 100-day window; users who logged in late in the window may not have had time to convert, so these are floors not ceilings.",
        "Overlap between login_succeeded and onboarding_completed is co-occurrence within the window, not proof of strict ordering; some of the 103 may have onboarded before this login event."
      ]
    },
    {
      "key": "onboarding",
      "name": "Onboarding",
      "headline": "Onboarding is short and near-frictionless, 87% of users who log in finish it in a median 11 seconds, and the tiny onboarded cohort books at 3x and pays at about 2.7x the app-wide rate.",
      "lead": "Users hit the welcome screen, log in, submit a name, and complete onboarding in one quick pass. These are largely the same people at each step, not independent populations: login_succeeded (118 users) flows almost entirely into name_submitted (104) and onboarding_completed (104), with name-submit and completion firing together. The step is a low-volume gate, only about 100-180 users touch it in 100 days versus 5,347 total users, but those who pass it convert downstream far above baseline.",
      "kpis": [
        {
          "label": "Completion rate",
          "value": "87%",
          "sub": "103 of 118 logged-in users completed onboarding (ordered per-user funnel)"
        },
        {
          "label": "Median time to complete",
          "value": "11s",
          "sub": "login to onboarding_completed; avg 43s, p90 about 19s (n=103)"
        },
        {
          "label": "Onboarded users",
          "value": "104",
          "sub": "unique users, 106 completion events (100d)"
        },
        {
          "label": "Onboarded who book",
          "value": "24%",
          "sub": "25 of 104 vs 8.4% app-wide base (about 3x)"
        }
      ],
      "funnel": [
        {
          "label": "Welcome screen viewed",
          "users": 183,
          "events": 188,
          "note": "client_screen_viewed, screen='welcome'"
        },
        {
          "label": "Login succeeded",
          "users": 118,
          "events": 125,
          "note": "client_login_succeeded; 118 also anchor the ordered funnel"
        },
        {
          "label": "Onboarding screen viewed",
          "users": 105,
          "events": 109,
          "note": "client_screen_viewed, screen='onboarding'"
        },
        {
          "label": "Name submitted",
          "users": 104,
          "events": 106,
          "note": "client_onboarding_name_submitted; 103 in the ordered-after-login funnel"
        },
        {
          "label": "Onboarding completed",
          "users": 104,
          "events": 106,
          "note": "client_onboarding_completed; 103 in the ordered-after-login funnel"
        }
      ],
      "cohort": [
        {
          "label": "Onboarded users who create a booking",
          "value": "25 / 104 (24%)",
          "note": "server_booking_created; vs app-wide 450 / 5,347 = 8.4%, about 3x baseline"
        },
        {
          "label": "Onboarded users who succeed a payment",
          "value": "4 / 104 (3.8%)",
          "note": "server_payment_succeeded; vs app-wide 75 / 5,347 = 1.4% (user rate), about 2.7x baseline"
        },
        {
          "label": "App-wide base",
          "value": "5,347 users",
          "note": "denominator for baseline comparison; bookers 450 (8.4%), payers 75 (1.4%)"
        }
      ],
      "insights": [
        "Onboarding is not a leaky funnel, it is a single fast pass. Of 118 users who logged in, 103 (87%) both submitted a name and completed onboarding, and name-submit and completion are the same population (both 104 users / 106 events over 100 days), meaning virtually no one submits a name and then abandons.",
        "It is genuinely quick: median 11 seconds from login to completion, p90 just about 19 seconds. The 43s average is pulled up by a few slow tails, but the typical user is through in seconds.",
        "This is a low-volume, high-intent gate. Only about 100-180 users pass through it in 100 days against a 5,347 total-user base, but the drop from welcome-screen views (183 users) to login (118) to completion (103-104) is the real narrowing, most fall-off happens before onboarding starts, at welcome/login, not inside the name step.",
        "The onboarded cohort is disproportionately valuable: 24% go on to create a booking (vs 8.4% app-wide, about 3x) and 3.8% succeed a payment (vs 1.4% app-wide by users, about 2.7x). Both comparisons are now like-for-like user rates. Completing onboarding correlates strongly with becoming a booker and a payer."
      ],
      "caveats": [
        "Steps are separate event populations queried over the full 100-day window, not a strict single-user funnel, except the login->name->completed funnel, which IS computed per-user with time-ordering (event timestamps after login). The ordered funnel yields 118 -> 103 -> 103.",
        "Overall event-population counts differ slightly from the ordered funnel: login_succeeded is 118 users / 125 events, while name_submitted and completed are each 104 users / 106 events over 100 days. The ordered funnel shows 103 because a small number completed onboarding before/without a login_succeeded event in-window.",
        "Payment baseline is a USER rate, not an event rate. The brief's line 'payments succeeded 146 / failed 251' is event counts; over 100d server_payment_succeeded = 146 events / 75 users and server_payment_failed = 251 events / 90 users. The correct app-wide payment-success rate is 75 / 5,347 = 1.4%, so the onboarded cohort's 3.8% (4/104, a user rate) is about 2.7x baseline. An earlier draft compared 3.8% against an inflated event-based 2.7%, that comparison was wrong and is corrected here.",
        "Screen name is read from the 'screen' string property on client_screen_viewed; values 'welcome' and 'onboarding' were confirmed to exist. Screen views count anyone landing on the screen, including repeat/unauthenticated views, so they exceed login and completion counts.",
        "Downstream booking/payment cohort is directional given the small onboarded base (104 users; 25 booked, 4 paid). It measures whether an onboarded user ever booked/paid within the window, not strictly after onboarding, and small-n percentages are noisy.",
        "All figures are app events over the 100-day window (2026-03-29 to 2026-07-01), excluding PostHog system ($) and mcp events. Baseline onboarding-completed of 99-101 in the brief is close to the queried 104 users / 106 events (window/rounding difference). App-wide total users queried at about 5,364 over the exact window vs the 5,347 baseline used as the denominator here, acceptable rounding/window drift."
      ]
    },
    {
      "key": "search",
      "name": "Search & deep search",
      "headline": "Deep search is the engine of Away: 904 users ran 2,950 deep searches, and all 449 bookers passed through it, though only a thin slice of users engage deeply with results.",
      "lead": "These are largely independent event populations, not a strict per-user funnel. A user's client-side search kicks off server-side fan-out across three engines (deep, flex, flight), so most volume lives server-side and the server populations exceed the 184 unique client searchers. Results engagement (filter/sort/scroll/tab) and flight selection are much thinner client-side populations. All figures are unique users (person_id) primary, raw events secondary, over the last 100 days (2026-03-29 to 2026-07-01).",
      "kpis": [
        {
          "label": "Deep searches completed",
          "value": "904 users",
          "sub": "2,950 events; 2,958 initiated"
        },
        {
          "label": "Flex searches completed",
          "value": "955 users",
          "sub": "2,957 events; 3,090 init, 133 failed"
        },
        {
          "label": "Flight searches completed (server)",
          "value": "524 users",
          "sub": "3,624 events; 3,762 init, 137 failed"
        },
        {
          "label": "Results engagers (filter/sort/scroll/tab)",
          "value": "95 users",
          "sub": "filter, sort, tab-switch, or scroll"
        },
        {
          "label": "Deep-search cohort who booked",
          "value": "449 of 904 (49.7%)",
          "sub": "100% of all 449 bookers came via deep search"
        },
        {
          "label": "Deep-search cohort who paid",
          "value": "75 of 904 (8.3%)",
          "sub": "server_payment_succeeded (146 events)"
        }
      ],
      "funnel": [
        {
          "label": "Client search started (any entry point)",
          "users": 184,
          "events": 802,
          "note": "home_search_started 63u/119e + direct_search_tapped 80u/268e + limited_home_search_started 66u/110e + flight_search_started 79u/305e; union of unique users = 184"
        },
        {
          "label": "Server deep search completed",
          "users": 904,
          "events": 2950,
          "note": "2,958 initiated -> 2,950 completed; about 99.7% event-level completion"
        },
        {
          "label": "Results engaged (filter/sort/scroll/tab-switch)",
          "users": 95,
          "events": 1319,
          "note": "filter_clicked 40u/142e, filter_applied 37u/98e, sort_changed 27u/53e, tab_switched 17u/453e, list_scrolled 58u/313e, scroll_engagement 77u/260e"
        },
        {
          "label": "Flight selected",
          "users": 45,
          "events": 129,
          "note": "client_flight_selected; 39 of these 45 also completed a deep search"
        },
        {
          "label": "Booking created",
          "users": 449,
          "events": 1578,
          "note": "server_booking_created; ALL 449 bookers had a completed deep search"
        }
      ],
      "cohort": [
        {
          "label": "Deep-search completers who go on to book",
          "value": "49.7%",
          "note": "449 of 904 deep-search users booked, vs 449 of 5,347 (8.4%) base -- a about 6x lift"
        },
        {
          "label": "Deep-search completers who go on to pay",
          "value": "8.3%",
          "note": "75 of 904 succeeded at payment, vs 75 of 5,347 (1.4%) base"
        },
        {
          "label": "Share of all bookers who used deep search",
          "value": "100%",
          "note": "all 449 server_booking_created users also completed a deep search"
        },
        {
          "label": "Flight-selectors from the deep-search cohort",
          "value": "39 of 45",
          "note": "87% of the 45 flight_selected users had completed a deep search"
        }
      ],
      "insights": [
        "Deep search is the true spine: every one of the 449 bookers (100%) completed a deep search first, and deep-search completers book at 49.7% vs 8.4% for the base of 5,347 users -- a about 6x lift.",
        "Server-side search is highly reliable. Deep: 2,958 initiated -> 2,950 completed (about 99.7%). Flex: 3,090 initiated -> 2,957 completed with 133 failure events (about 4.3% event-level). Flight (server): 3,762 initiated -> 3,624 completed with 137 failure events (about 3.6%). Client flight search: 291 succeeded / 14 failed across 79 users.",
        "A single client search fans out into multiple server engines: 184 unique client searchers generate 904 deep-, 955 flex-, and 524 flight-completing users at the server layer, so server populations far exceed the client entry population.",
        "Results engagement is thin and concentrated: only 95 users touched filter/sort/scroll/tab controls, and just 45 users ever tapped client_flight_selected -- most users appear to accept results without heavy manipulation.",
        "server_fare_category_low_confidence is by far the highest-volume server event (98,290 events across 877 users), suggesting fare-confidence signals fire very frequently during search fan-out.",
        "client_flight_listing_tab_switched is extremely concentrated: 453 events from just 17 users (about 27 switches each), i.e. a handful of power users toggling tabs heavily rather than broad behavior."
      ],
      "caveats": [
        "Steps are independent event populations, not a strict ordered per-user funnel; the funnel ordering is illustrative, and users can appear in later steps without a captured earlier client event (client search entry = 184 unique users but 904 completed deep searches server-side).",
        "client_flight_selected is captured for only 45 users / 129 events; there is a separate client_negotiation_flight_selected (4 users / 6 events) not included in the main selection count.",
        "Booking and payment events are server-side (server_booking_created 449u, server_payment_succeeded 75u / 146 events); the '75 payers' figure is unique users. Client-side payment events exist but are lower-coverage -- server events used as source of truth.",
        "Completion/failure rates are event-level (initiated vs completed/failed counts), not strict same-session matched pairs; some initiated searches may complete outside the window edges.",
        "'Any client search' = union of client_home_search_started, client_home_direct_search_tapped, client_limited_home_search_started, and client_flight_search_started distinct person_ids (184); component per-event user counts do not sum to 184 due to overlap.",
        "The results-engager scroll events are the project-wide client_list_scrolled and client_scroll_engagement (not flight-prefixed); filter/sort/tab events are the flight-listing variants (client_flight_filter_clicked, client_flight_listing_tab_switched, etc.).",
        "Cohort base of 5,347 total users is the provided 100-day baseline; deep-search->book/pay lifts are computed against it. All counts re-run on the exact 2026-03-29..2026-07-01 window."
      ]
    },
    {
      "key": "negotiation",
      "name": "Negotiation",
      "headline": "The negotiation engine is Away's highest-intent surface: the 164 users who engage it convert to a booking at 60% and to paid at 20% - roughly 7x the app-wide book rate and about 14x the app-wide pay rate.",
      "lead": "Users open the negotiation engine, watch the AI orchestrate across suppliers (a about 25s \"working\" wait), add fares to a cart, review results, then initiate a booking. It is not a strict per-user funnel: far more users add to cart (156) than fire the home-open event (52), so most enter negotiation from surfaces other than the home entry point. The steps below are independent event populations over the last 100 days (2026-03-29 to 2026-07-01), with cross-step overlaps computed separately.",
      "kpis": [
        {
          "label": "Negotiation-engaged users",
          "value": "164",
          "sub": "any negotiation event, 100d"
        },
        {
          "label": "Cart-adders",
          "value": "156",
          "sub": "530 add events"
        },
        {
          "label": "Results viewed",
          "value": "151 users",
          "sub": "372 views"
        },
        {
          "label": "Booking initiated",
          "value": "71 users",
          "sub": "147 events"
        },
        {
          "label": "Cart removal rate",
          "value": "10%",
          "sub": "15 of 156 adders removed"
        },
        {
          "label": "Median orchestration dwell",
          "value": "25.5s",
          "sub": "the AI 'working' wait; 15.3s on results"
        }
      ],
      "funnel": [
        {
          "label": "Home negotiation opened",
          "users": 52,
          "events": 119,
          "note": "Explicit home entry point only - most engagement enters from other surfaces, so this understates reach"
        },
        {
          "label": "Orchestration state (AI working)",
          "users": 154,
          "events": 356,
          "note": "Progress runs 0-100%; median dwell 25.5s on the orchestration screen"
        },
        {
          "label": "Cart added",
          "users": 156,
          "events": 530,
          "note": "Largest population; 98% of the 52 openers (51) added to cart"
        },
        {
          "label": "Results viewed",
          "users": 151,
          "events": 372,
          "note": "Results screen dwell median 15.3s / avg 27.9s"
        },
        {
          "label": "Booking initiated",
          "users": 71,
          "events": 147,
          "note": "47% of results-viewers (71/151); all 71 had viewed results first"
        }
      ],
      "cohort": [
        {
          "label": "Negotiation cohort books",
          "value": "98 / 164 = 60%",
          "note": "vs app-wide base 450 / 5,347 = 8.4% - about 7x"
        },
        {
          "label": "Negotiation cohort pays (succeeds)",
          "value": "32 / 164 = 20%",
          "note": "vs app-wide base 75 users / 5,347 = 1.4% - about 14x (base uses unique users, not the 146 payment-succeeded events)"
        },
        {
          "label": "Booking-initiators who create a booking",
          "value": "71 / 71 = 100%",
          "note": "Initiating a negotiation booking maps 1:1 to a created booking record"
        },
        {
          "label": "Booking-initiators who succeed payment",
          "value": "22 / 71 = 31%",
          "note": "Payment is the real drop-off, not booking creation"
        },
        {
          "label": "Cohort payment failures",
          "value": "26 users",
          "note": "Payment-failed users within the negotiation cohort - a meaningful leak vs 32 who succeed"
        }
      ],
      "insights": [
        "Negotiation is a small but disproportionately valuable surface: only 164 users touched it in 100 days, yet they book at 60% (vs 8.4% app-wide, about 7x) and pay at 20% (vs 1.4% app-wide unique-user base, about 14x). The pay lift is its strongest signal.",
        "Not a linear funnel. Cart-adds (156 users) and results-views (151) dwarf the home-open event (52), so most users reach the negotiation engine from surfaces other than the explicit home entry - the home-open metric badly understates true reach.",
        "The wait is the product. Users sit a median 25.5s on the orchestration ('AI working') screen and 15.3s on results - the labour-illusion dwell is substantial and clearly tolerated, since 98% of openers still add to cart.",
        "Cart is sticky: only 15 of 156 adders (10%) ever removed a fare, and results-view converts to booking-initiation at 47% (71/151).",
        "The real leak is payment, not intent. All 71 booking-initiators produce a booking record (100%), but only 22 (31%) succeed payment; 26 cohort users hit a payment failure - payment reliability, not persuasion, is the bottleneck.",
        "Notify-enabled (waiting on a price) and flight-selected are tiny: 3 and 4 users respectively over 100 days - these are edge behaviors, not core to the flow today."
      ],
      "caveats": [
        "Window: last 100 days (2026-03-29 to 2026-07-01), app events only. Unique users = count(DISTINCT person_id); event counts given secondarily.",
        "App-wide base rates use UNIQUE USERS in both numerator and denominator. Payment succeeded = 75 users / 146 events and payment failed = 90 users / 251 events - the 146/251 figures in the source baseline are event counts, not users, so the pay base rate is 75/5,347 = 1.4% (not 146/5,347).",
        "Steps are independent event populations, not a strict per-user funnel. Because cart/results populations exceed the home-open population, the ordering opened->cart->results->booking reflects overlaps computed pairwise, not a single sequential funnel.",
        "client_negotiation_orchestration_state carries a numeric progress (0-100) and an is_complete boolean, but is_complete=true was captured on only 2 events / 2 users - completion is effectively not tracked via that flag, so orchestration completion rate could not be measured reliably.",
        "Screen dwell comes from client_screen_time_spent (properties.screen, properties.duration_ms) for screens negotiation_orchestration (154 users) and negotiation_results (120 users) - a separate event population from the negotiation_* events, so dwell user counts will not line up exactly with the funnel step counts.",
        "client_negotiation_notify_enabled (3 users / 3 events) and client_negotiation_flight_selected (4 users / 6 events) have volumes too low to analyze meaningfully; reported as-is.",
        "Downstream booking/payment attribution is cohort-level (did a negotiation-engaged person later fire server_booking_created / server_payment_succeeded within the window), not a strict causal link to the negotiation session itself."
      ]
    },
    {
      "key": "booking",
      "name": "Booking & payment",
      "headline": "Payment is the flagship's true bottleneck: for every 146 bookings that get paid, 234 hit a payment failure, and 78% of those failures are abandoned/expired UPI collects rather than hard declines.",
      "lead": "Users enter from negotiation (booking initiated), land on the prebooking sheet, tap pay, pick a payment mode, and the payment either succeeds or fails at the Cashfree gateway; on success the server creates the booking, absorbs any supplier price drift, and issues the ticket. These are independent event populations over the last 100 days (2026-03-29..2026-07-01), not a strict per-user funnel - user counts drop steeply because most later steps only fire for the small paying cohort, while server_booking_created (450 users) also captures bookings from other entry paths.",
      "kpis": [
        {
          "label": "Bookings paid vs failed",
          "value": "146 vs 234",
          "sub": "booking_id level; payment resolves in the app's favour only about 38% of the time"
        },
        {
          "label": "Payment success users",
          "value": "75",
          "sub": "server_payment_succeeded (146 events)"
        },
        {
          "label": "Payment failure users",
          "value": "90",
          "sub": "server_payment_failed (251 events)"
        },
        {
          "label": "#1 failure cause",
          "value": "expired/abandoned",
          "sub": "76 users / 195 events (78% of failure events), all Cashfree"
        },
        {
          "label": "Tickets issued",
          "value": "82 bookings",
          "sub": "53 users / 87 events; vs 26 users / 72 events ticket-failed"
        },
        {
          "label": "Failed then recovered",
          "value": "9 bookings",
          "sub": "of 234 failed bookings, only 9 later succeeded - retries rarely save it"
        }
      ],
      "funnel": [
        {
          "label": "Booking initiated",
          "users": 71,
          "events": 147,
          "note": "client_negotiation_booking_initiated"
        },
        {
          "label": "Prebooking sheet shown",
          "users": 70,
          "events": 144,
          "note": "client_prebooking_state"
        },
        {
          "label": "Pay clicked",
          "users": 31,
          "events": 79,
          "note": "client_prebooking_pay_clicked"
        },
        {
          "label": "Payment initiated",
          "users": 29,
          "events": 65,
          "note": "client_booking_payment_initiated"
        },
        {
          "label": "Payment mode selected",
          "users": 25,
          "events": 49,
          "note": "client_payment_mode_selected"
        },
        {
          "label": "Payment succeeded (server)",
          "users": 75,
          "events": 146,
          "note": "server_payment_succeeded; client_payment_succeeded fires for only 16 users / 25 events"
        },
        {
          "label": "Payment failed (server)",
          "users": 90,
          "events": 251,
          "note": "server_payment_failed; client_payment_failed only 16 users / 32 events"
        },
        {
          "label": "Booking created",
          "users": 450,
          "events": 1583,
          "note": "server_booking_created - larger base, includes non-negotiation entry paths"
        },
        {
          "label": "Ticket issued",
          "users": 53,
          "events": 87,
          "note": "server_ticket_issued"
        },
        {
          "label": "Ticket failed",
          "users": 26,
          "events": 72,
          "note": "server_ticket_failed"
        }
      ],
      "cohort": [
        {
          "label": "Booking-initiators reaching payment success",
          "value": "22 of 71 (31%)",
          "note": "cohort = client_negotiation_booking_initiated users; server_payment_succeeded"
        },
        {
          "label": "Booking-initiators reaching ticket issued",
          "value": "22 of 71 (31%)",
          "note": "server_ticket_issued within same cohort"
        },
        {
          "label": "Booking-initiators hitting a payment failure",
          "value": "19 of 71 (27%)",
          "note": "server_payment_failed within same cohort"
        },
        {
          "label": "Ticketing transition confirmed",
          "value": "57 users / 93 events",
          "note": "server_booking_status_changed ticketing -> confirmed"
        },
        {
          "label": "Ticketing transition failed",
          "value": "26 users / 59 events",
          "note": "ticketing -> ticketing_failed"
        }
      ],
      "insights": [
        "Payment, not booking construction, is the drop-off. At booking_id level 146 paid vs 234 failed means a payment attempt resolves against the user roughly 62% of the time. server_payment_failed (251 events) > server_payment_succeeded (146 events) confirms the brief's known bottleneck.",
        "The dominant failure is not a hard decline - it is abandonment. 'expired/abandoned payment' on Cashfree accounts for 76 users / 195 events (78% of all failure events). Next is 'User dropped and did not complete the two factor authentication' (11 users / 39 events). Genuine bank declines are a long tail of 1-4 events each. This is a UPI-collect / 2FA timeout problem, i.e. a design + latency problem, not a card-processing problem.",
        "Retries almost never recover the sale: of 234 failed bookings only 9 eventually succeeded, and server_payment_failed_superseded is tiny (7 users / 12 events / 9 bookings) - it marks a prior failed attempt replaced by a later attempt on the same booking. Once a payment expires, the user is effectively lost.",
        "Client-side payment events massively undercount vs server: client_payment_succeeded 16 users vs server 75; client_payment_failed 16 vs server 90. The client only logs a fraction of outcomes (users close the app during the redirect/2FA), so server_payment_* is the reliable source of truth for this flow.",
        "Ticket issuance is a real second failure surface: 82 bookings ticketed but 26 users / 72 events failed, with concrete supplier errors - Riya 'EX-PNR might be created' (16 events), a TICKETING_FORCE_FAILURE test-mode flag (13 events), Cleartrip 500s, TripJack timeouts/validation, TBO session/balance issues. 'BOOKING_IN_PROGRESS' stuck state appears 14 users / 18 events. This is money-taken-but-no-ticket risk.",
        "Supplier price drift is common but almost fully absorbed by the app: 46 users / 74 events across 71 distinct bookings, absorbed in 73 of 74 events, avg change 3.88% (median 0%, one 100% outlier). The app eats supplier repricing rather than passing it to the user - a trust-preserving design choice.",
        "Payment-mode mix skews to cards: credit_card 19 users / 29 events, upi 8 / 10, debit_card 6 / 6, net_banking 4 / 4. Yet the biggest failure bucket is UPI-collect expiry - a mismatch worth noting.",
        "Ancillary attach is dominated by seat selection: seat add 12 users / 52 events (with 6 users / 22 remove events showing fiddling), meal and baggage are negligible (2-3 events each). Seat is the only ancillary with real engagement."
      ],
      "caveats": [
        "Steps are independent event populations over 100 days, not a single-cohort funnel - do not read the per-step user counts as strict sequential conversion. server_booking_created (450 users) includes bookings from entry paths other than negotiation, so it is a larger base than client_negotiation_booking_initiated (71 users).",
        "Client-side payment events (client_payment_succeeded/failed) under-report vs server events because users leave the app during the gateway redirect/2FA; treat server_payment_* as authoritative.",
        "'234 bookings failed' counts distinct booking_ids that saw a server_payment_failed; a booking can appear in both paid and failed buckets (9 recovered), so failed and paid are not mutually exclusive (146 + 234 overlap by 9).",
        "No dedicated failure-reason property exists on server_ticket_failed beyond a free-text 'error' string and on client_payment_failed beyond 'reason'; breakdowns are on raw error text, which is high-cardinality. server_payment_failed uses 'error_message' + 'pg_provider' (cashfree dominant).",
        "price_change_pct has a 100% max outlier pulling the mean; median drift is 0%, so 'avg 3.88%' overstates the typical case. 'absorbed' is a boolean; only 1 of 74 drift events was not absorbed.",
        "Absolute volumes are small (dozens of paying users), so percentages are directional, not statistically tight."
      ]
    }
  ],
  // How users actually use referrals, a deep-dive from live PostHog analysis
  // (funnel, virality, referred-user quality). Replaces the thin invite flow.
  referrals: {
    headline:
      "The invite loop is tiny but high-quality: about 1% of users touch it, redemption succeeds 89% of the time, and 88% of redeemers onboard. The friction is intent-to-action upstream and payment downstream, not the redeem step.",
    lead:
      "Referrals reach only about 1% of Away's 5,347 users, but redeemers are a disproportionately activated cohort: 88% onboard and 46% book. The loop went live around 23 June (roughly 8 days of data), so this is a launch snapshot, not steady state. Redemption is a first-session action taken right after onboarding, sharing is 100% WhatsApp, and the biggest leaks are intent-to-action upstream and payment downstream.",
    kpis: [
      { label: "Users who redeemed", value: "59", sub: "about 1.1% of the 5,347 base" },
      { label: "Redeem success rate", value: "89.4%", sub: "59 of 66 users who submit a code succeed" },
      { label: "Redeemers onboarded", value: "88.1%", sub: "52 of 59, about 48x base" },
      { label: "Redeemers booked", value: "45.8%", sub: "27 of 59, about 5.4x base" },
      { label: "Users who shared", value: "33", sub: "37 shares, 100% WhatsApp" },
      { label: "Loop age", value: "about 8 days", sub: "first redeem 23 Jun" },
    ],
    // ordered by intent, not a strict per-user funnel (see caveats)
    funnel: [
      { label: "refer-state reached", users: 128, events: 381, note: "Broad top-of-loop surface; likely fires passively, so it far exceeds refer-screen viewers." },
      { label: "invite_redeem screen viewed", users: 95, events: 155, note: "The redeem side reaches about 2x the refer screen (47 users)." },
      { label: "redeem-state reached", users: 94, events: 154, note: "Screen-state event, not a strict gate." },
      { label: "unlock tapped", users: 55, events: 85, note: "The unlock CTA is not a strict prerequisite; submitters exceed it." },
      { label: "code submitted", users: 66, events: 76, note: "74% manual entry (47 users) vs 20 prefilled / deep-link." },
      { label: "redeem succeeded", users: 59, events: 60, note: "89.4% of submitters at the user level." },
      { label: "redeem failed", users: 13, events: 16, note: "56% of failures are 'cannot use your own invite code'; users can retry and still succeed." },
    ],
    virality: [
      { label: "Sharers", value: "33 users, 37 shares", note: "About 1.1 shares per sharer." },
      { label: "Share channel", value: "WhatsApp 100%", note: "The only channel present; the outbound loop is WhatsApp-driven." },
      { label: "Share entry point", value: "refer_tab 8, home 7, 22 untagged", note: "Attribution covers only 15 of 37 shares." },
      { label: "Codes copied", value: "20 users, 39 events", note: "A manual-copy alternative to the share sheet." },
      { label: "Redemptions per sharer", value: "about 1.8", note: "Crude loop ratio (59 redemptions / 33 sharers). NOT a validated K-factor." },
      { label: "Invite requests", value: "45 users", note: "A pre-loop request mechanic that fired 1 to 15 Jun only, then stopped." },
    ],
    quality: [
      { label: "Onboarding completed", value: "88.1% vs 1.85% base", note: "52 of 59 redeemers, about 48x the base rate." },
      { label: "Login succeeded", value: "91.5%", note: "54 of 59; redeemers almost universally reach an authenticated session." },
      { label: "Booking created", value: "45.8% vs 8.42% base", note: "27 of 59 redeemers, about 5.4x base." },
      { label: "Payment succeeded", value: "8.5% vs 1.40% base", note: "5 of 59, about 6.1x base but a small count; steep booking-to-paid drop." },
      { label: "Base vs non-redeemer", value: "8.42% vs 8.00% booking", note: "Redeemers are too small a slice to move aggregate totals." },
    ],
    insights: [
      "Redemption almost always works once a code is submitted: 89.4% of submitters succeed (59 of 66 users). The redeem step is low-friction, not where users are lost.",
      "The real friction is upstream intent-to-action, not submit-to-success: 128 users reach refer-state and 94 reach the redeem screen, but only 55 tap unlock and 66 submit a code.",
      "Failures are a messaging problem, not a bug: 9 of 16 failure events (56%) are 'cannot use your own invite code'. Only 5 are genuinely invalid and 2 expired or used. Blocking a user's own code before submit would erase the largest failure category.",
      "Redeemers are a tiny but disproportionately activated cohort: 88% onboard (about 48x the base's 1.85%) and 46% book (about 5.4x). But redemption follows onboarding and login by about a minute in every case checked, so it is a first-session engagement step, not the acquisition source.",
      "Payment is the shared bottleneck: even redeemers convert to paid at only 8.5% (5 of 59). Referrals surface higher-intent users, but the booking-to-paid drop is steep across every cohort.",
      "The loop reaches more people on the redeem side than the refer side, and holds their attention: 95 users view the redeem screen (median dwell 8.2s) vs 47 on refer (median 1.4s, mostly instant bounces). Redemption is mostly manual code entry (74%).",
      "This is an 8-day feature launch, not a trend: redemptions only started firing 23 June, so all 59 redeemers fall in two partial weeks. The apparent week-over-week drop is a partial-week artifact, not decay.",
    ],
    caveats: [
      "Not a true ordered funnel: steps are independent event-count populations over the window, which is why submitted (66) exceeds unlock (55). Treat step figures as population sizes, not sequential drop-off.",
      "The loop is only about 8 days old (first redeem 23 Jun), so every trend conclusion describes a launch, not steady state.",
      "Referral does not cause acquisition: for every onboarded redeemer, redeem happened after onboarding and login (about a minute later), so it is a first-session action, not the entry point.",
      "The 1.8 redemptions-per-sharer loop ratio is not a validated K-factor: shares are not linked to the redemptions they caused, over an 8-day window.",
      "Payment and failure figures rest on small counts (5 paid redeemers, 16 failure events), so they are directional.",
    ],
  },
};
