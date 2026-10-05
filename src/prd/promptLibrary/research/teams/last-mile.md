# Last-mile operations (quick commerce, India): research for the prompt library

Scope: what a last-mile ops team at Zepto / Blinkit / Swiggy Instamart actually produces, the words it uses, and what a model needs before it can help. Every clause carries a source number from the Sources list. "Inference" marks my reading; UNVERIFIED marks a term in wide informal use that no practitioner source fetched here defines.

## 1. What the function produces

- Quarterly and weekly operating reviews built on a fixed metric set: NOV or GOV, AOV / NAOV, contribution margin as % of GOV, Adjusted EBITDA as % of NOV, active dark store count and net adds, orders per dark store per day, GOV per sq ft, store cohorts by profitability [10][11][12].
- Store network plans: where to add stores for "densification, expansion in zones with fully-utilised capacity, and selection expansion" vs sweating existing capacity ("darkstores can operate at 2000+ orders", network average 1,025) [10]; coverage expressed as % of pin codes serviceable and stores per serviceable pin code [11].
- Dispatch and batching policy changes, evaluated by simulation first then switchback experiments because dispatch changes have network effects [1][2]; picker batching validated with a discrete-time simulation on a store-date replay [4].
- Serviceability and stress policy: which stores are shown to which customers, when to cut last-mile distance, when to apply a surge factor, on a discrete stress scale per zone [6].
- ETA promise policy: what delivery time to quote, trading earliness against lateness, measured as on-time accuracy [3][5].
- Rider (delivery partner) supply plans and incentive schemes: per-order base pay, daily order-count incentives, peak-hour surge bonuses, referral and festive top-ups, weekly or daily payouts [15][19][20]; supply reported as Average Monthly Transacting Delivery Partners [10].
- Store audits (cycle counts, shrinkage, fill rate, pick time): nothing solid found from practitioners; only job ads and vendor pages, none fetched.
- Incident post-mortems, city launch playbooks, escalation SOPs, rider comms: nothing solid found as published artefacts; inference that they exist from the metrics above.

## 2. Vocabulary (only terms found in sources)

| TERM | meaning | why it belongs in a prompt | src |
|---|---|---|---|
| dark store / darkstore | delivery-only micro-warehouse, no walk-ins; Instamart avg 4,168 sq ft; "megapods" are larger | the unit every ops number is cut by | [10][11][16] |
| Active Dark Stores | stores with at least one completed order on the last day of the period | the denominator has a definition; use it | [10] |
| orders / dark store / day | throughput per store on active darkstore-days; 1,025 network avg, capacity 2000+ | the single store-health number | [10][11] |
| NOV vs GOV, NAOV | net order value after discounts; NAOV = net AOV; Eternal calls NOV "a more" meaningful metric as NOV/GOV drifts | say which one you mean, every time | [10][11][12] |
| contribution margin (% of GOV) | adjusted revenue less delivery charges, discounts, fulfilment cost, other variable cost, over GOV | the ops P&L line; stores are cohorted by it | [10] |
| store cohort / mature store | about 25% of Instamart stores profitable, top cohort above 5% CM; new customer cohorts break even at CM in month one | separates a network problem from a store problem | [10][12] |
| serviceability | whether a store is shown to a customer given distance, predicted delivery time and fleet stress | the first lever pulled when supply is short | [5][6] |
| stress level, graceful degradation | discrete per-zone stress from demand-to-available-partner ratio; system cuts last-mile distance and applies surge | names the supply-side cause of a bad hour | [6] |
| surge factor | customer-side surcharge set by stress level, store, time of day, last-mile distance, rain or festival | demand-throttling lever, distinct from rider surge bonus | [6][23] |
| assignment delay, first mile, prep time, wait time, last mile, last-last mile | the legs of Delivery Time = Max(Assignment Delay + First Mile, Prep Time) + Last Mile; last-last mile = gate to door | forces a breach to be attributed to a leg | [5][6][7] |
| DE / delivery executive / delivery partner / Dasher | the rider; Swiggy says DE, Eternal and Zepto say delivery partner | use the house noun | [4][5][10][19] |
| picker, picker assignment, time to mark ready | store staff who pick; round-robin base assignment; p90 of order-to-picker time is the pain metric | the pick-pack half of a breach | [4] |
| batching / clubbing | one DE or picker serves several orders; DoorDash batches by same merchant or nearby drop; Swiggy limits picker batches to 2 orders to cap packing errors | every batching change has a lateness cost to state | [2][4][14] |
| dispatch, offer, delay dispatch | DeepRed scores and ranks offers, decides batches, and "strategically delay[s] dispatches" so the Dasher does not wait at the store | dispatch is a timed decision, not just a match | [2] |
| order ready time, acceptance likelihood | ML inputs to dispatch: prep-time estimate, travel time, will the rider accept | the inputs a dispatch review must show | [2] |
| efficiency vs quality, undersupply | dispatch objective balances Dasher efficiency and delivery speed; in undersupply "we have to make tradeoffs" | the two-column structure of any dispatch memo | [1][2] |
| switchback test | time-and-region randomised experiment for changes with network effects | the only accepted evidence for a policy change | [1][2] |
| on-time accuracy, earliness vs lateness | ETA north-star is how often delivery lands on time vs prediction; tree models traded earliness for lateness | a promise metric, not an average | [3] |
| dispatch wave / decision epoch | orders in the same 15-minute slot bundled and dispatched together; dispatch frequency and fleet size are policy knobs | academic name for the batching interval | [13] |
| Average Monthly Transacting Delivery Partners | unique partners with at least one delivery in a month, averaged | the supply headline number | [10] |
| DE login volumes, zone-wise cancellation rates | what Swiggy ops watches per area in real time | "logins" is the practitioner word for supply on shift | [8] |
| rate card, base pay, per-order earnings, daily incentive, surge bonus, peak hours, weekly payout, 3 km radius, store-based | Zepto: earn per order, surge bonuses during peak hours, weekly payouts, deliver within 3 km of your store; Blinkit: daily payouts, same pickup store, "quick trips = higher per-hour earnings"; Zepto daily scheme about Rs 134 for 15 special orders, Rs 282 for about 30; Blinkit Navratri 20% on daily earnings | the actual shape of an incentive structure | [15][19][20] |
| minimum wage after work-related costs | Fairwork Fair Pay first point; only bigbasket and Urban Company earned it in 2024; platforms "take control of when and for how long workers can provide" gigs | the fairness floor any payout design must pass | [17] |
| pin code coverage, stores per serviceable pin code, demand density | Delhi NCR about 2x the density of the next seven cities, 8x beyond | the geography cut for launch plans | [11] |
| cost of delivery as % of AOV | Swiggy food delivery: 12 to 13% of AOV | the CPD unit practitioners actually quote | [10] |
| delivery radius, share in 10 min | Zepto claim 1.8 km average distance, over 90% inside 10 min; CMR: "sub-11-minute delivery for 90% of orders" | P90-style promise language | [16][18] |
| P90 | 90th percentile; Swiggy uses p90 of picker assignment time | practitioners use percentiles for time metrics | [4] |
| OPH, rider utilisation, CPD, ODT, fill rate, rider churn, login hours (as a KPI) | UNVERIFIED as named KPIs: only vendor and job-ad pages use them; "2 to 3 orders per rider per hour" is a vendor number | keep, but flag; do not assert a benchmark | [22] |

## 3. What separates a convincing ops artefact from a generic one

- It leads with the defined metric and the delta, in the house definition: "orders/darkstore/day has moved up 4% QoQ to 1025" [10]; "216 net new stores ... 2,243 stores" [11].
- It names the cut: store, cohort, city tier, pin code, zone. Eternal answers store questions by city tier and pin-code coverage, not network averages [11][12].
- It separates supply causes from demand causes: fleet stress (supply) vs demand growth, then names the lever pulled (serviceability cut, surge, delayed dispatch) [2][6].
- It attributes a breach to a leg of the delivery equation before proposing a fix [5][6].
- It states the tradeoff it accepted: batching delays a delivery so a rider earns more without breaking the promise; picker batching raised average time-to-packed while cutting picker travel [2][4].
- It says what was tried and why it failed: Swiggy lists three routing approaches that failed before the one that shipped [7].
- It proves change with an experiment design, not a before-after: switchback, or simulation on real store-day data [1][2][4].
- It reports store economics by cohort, not by average, because the average hides the loss-making drag [10].
- Owner and date per action: inference from the review format; no source shows an ops action register.

## 4. Inputs a model needs per task

| task | metrics | cut | window |
|---|---|---|---|
| weekly ops review | orders/store/day, NOV or GOV, AOV/NAOV, CM % GOV, on-time %, active stores, transacting partners [10][11] | store, cohort, city | week vs prior week and same week last year; festive flag [11] |
| SLA / ETA breach root cause | breach share by leg: assignment delay, first mile, prep or pick time, wait, last mile, last-last mile [5][6]; stress level history [6] | store x hour | the breach window plus the two hours before |
| rider supply plan | logins per zone per hour, demand forecast, assignment delay, stress transitions, cancellations [6][8] | zone x hour slot | next 7 days, peak slots 7 to 11 am and 5 to 8 pm [15] |
| batching or dispatch policy | current batch rate, lateness and earliness distribution, rider wait at store, acceptance rate, order ready time accuracy [2][3] | store, order-pair type | experiment period, switchback unit [1] |
| incentive structure | base pay, per-order add-ons, daily and weekly targets, peak bonuses, payout cadence, earnings after costs vs local minimum wage [15][17][19][20] | city, store, rider tenure | pay week; festive period separately [15] |
| store audit / network plan | orders/store/day vs 2000+ capacity, GOV per sq ft, store CM cohort, pin-code coverage [10][11] | store, pin code | quarter |

## 5. Proposed prompt material

Persona: You are a last-mile operations lead at an Indian quick-commerce company; you read stores by orders per store per day and contribution margin cohort, breaches by delivery leg, and supply by logins per zone per hour [5][10][11].

Principles
1. Define the metric before you move it: NOV vs GOV, active store, contribution margin each have a house definition [10][11].
2. Attribute before you fix: every breach goes to a leg of Delivery Time = Max(Assignment Delay + First Mile, Prep) + Last Mile [5][6].
3. Supply and demand are two columns, never one: fleet stress is a supply cause; growth and festivals are demand causes; name the lever for each [6][11].
4. Every batching or dispatch change has a lateness price; write it down beside the efficiency gain [2][4].
5. Cohorts, not averages: loss-making stores drag the network; mature stores prove the model [10][12].
6. Evidence is an experiment or a replay, not a before-after; dispatch has network effects [1][2][4].

Reach-for words: orders/darkstore/day, NOV, NAOV, contribution margin as % of GOV, active dark stores, net new stores, store cohort, serviceability, stress level, surge factor, assignment delay, first mile, last mile, last-last mile, delivery partner, picker, order ready time, batching, delay dispatch, on-time accuracy, switchback, logins per zone, rate card, base pay, daily incentive, peak hours, weekly payout, pin-code coverage, demand density [2][3][5][6][8][10][11][15][19].

Avoid, with replacements: "delivery boy" (delivery partner or DE) [10][19]; "average delivery time" alone (on-time % and the p90 leg) [3][4]; "warehouse" (dark store) [10]; "driver" (partner on a two-wheeler) [5]; "sales" or "revenue" for order value (NOV or GOV, named) [10][11]; "surge" without saying which side (customer surge factor vs rider surge bonus) [6][19]; "utilisation" or "OPH" as a benchmark (UNVERIFIED; describe logins and orders per hour with the source of the number) [22].

Hard rules
1. Never state a store, city or network number without its definition and its window [10][11].
2. Never propose a batching, dispatch or serviceability change without the lateness or reach cost it accepts [2][6].
3. Never design a payout without showing earnings after work-related costs against the local minimum wage [17].
4. Never claim an improvement from a before-after; name the switchback or replay that would prove it [1][4].

Self-check: Can a store manager read the first line and know which store, which metric, which delta, which leg, and who owns the fix by when? If any of the five is missing, it is not done (inference from [5][10][11]).

Tasks
- Weekly store review. Job: turn one week of store-level numbers into a ranked review with one action per outlier. Inputs: orders/store/day, NOV, NAOV, CM % GOV per store for this week, last week, same week last year; store cohort; festive flag [10][11]. Output: headline delta, top and bottom five stores with cause (supply or demand) and lever, owner and date.
- ETA breach root cause. Job: attribute a breach spike to delivery legs and stress state. Inputs: breach share by leg per store-hour, stress level log, logins per zone, prep or pick p90 [4][5][6]. Output: leg attribution table, supply vs demand column, one fix per leg with the tradeoff it accepts.
- Rider supply plan for peak slots. Job: size logins per zone per hour slot for the next week. Inputs: demand forecast by slot, logins by slot last four weeks, assignment delay by slot, planned incentives [6][8][15]. Output: slot x zone gap table, incentive lever per gap, expected assignment-delay effect.
- Batching or dispatch policy memo. Job: argue one batching or delay-dispatch change with its evidence plan. Inputs: batch rate, lateness and earliness distribution, rider wait at store, order-ready accuracy [2][3]. Output: change, efficiency gain, lateness cost, switchback design, stop rule [1].
- Incentive structure review. Job: redesign a rate card for one city. Inputs: base pay, per-order add-ons, daily and weekly targets, peak bonuses, payout cadence, rider earnings and costs, local minimum wage [15][17][19][20]. Output: current vs proposed card, earnings after costs at three activity levels, pass or fail vs minimum wage, festive variant.
- City launch or densification plan. Job: decide where the next stores go. Inputs: pin-code coverage, stores per serviceable pin code, orders/store/day vs capacity, GOV per sq ft, store CM cohort [10][11]. Output: densify vs expand list with the metric that justifies each, ramp expectation by cohort.

Not sourced here: McKinsey and BCG pages were blocked; Gopuff and Getir have no engineering posts found; Zepto has no engineering blog found; the Fairwork India 2024 PDF itself could not be fetched (press release used).

## Sources

1. DoorDash, Next-Generation Optimization for Dasher Dispatch, https://careersatdoordash.com/blog/next-generation-optimization-for-dasher-dispatch-at-doordash/ : dispatch objective (speed plus dasher efficiency), MIP, delayed offers, switchback experiments.
2. DoorDash, Using ML and Optimization to Solve DoorDash's Dispatch Problem, https://careersatdoordash.com/blog/using-ml-and-optimization-to-solve-doordashs-dispatch-problem/ : DeepRed layers, order ready time, acceptance likelihood, batching rules, delay dispatch, undersupply tradeoffs, simulation then experiment.
3. DoorDash, Improving ETAs with multi-task models, deep learning, and probabilistic forecasts, https://careersatdoordash.com/blog/improving-etas-with-multi-task-models-deep-learning-and-probabilistic-forecasts/ : on-time accuracy as north star, earliness vs lateness, probabilistic ETA, calibration and CRPS.
4. Swiggy Bytes, Optimising the picking process to enable faster deliveries for Instamart, https://medium.com/swiggy-bytes/optimizing-the-picking-process-to-enable-faster-deliveries-for-instamart-93de0fe9d819 : picker round-robin, p90 assignment time, 2-order batching, delay cost, simulation results.
5. Swiggy Bytes, The Swiggy Delivery Challenge (Part One), https://medium.com/swiggy-bytes/the-swiggy-delivery-challenge-part-one-6a2abb4f82f6 : serviceability, the Delivery Time equation, last-last mile, Goldilocks promise.
6. Swiggy Bytes, What Serviceability means at Swiggy?, https://medium.com/swiggy-bytes/what-serviceability-means-at-swiggy-c94c1aad352a : stress levels, graceful degradation, surge factor inputs, wait time leg.
7. Swiggy Bytes, Beyond the Map (last-last-mile routing), https://medium.com/swiggy-bytes/beyond-the-map-building-a-last-last-mile-routing-system-that-learns-from-every-delivery-3b78331a3505 : three failed approaches, medoid paths, DE approach direction.
8. Swiggy Bytes, The Tech That Brings You Your Food, https://medium.com/swiggy-bytes/the-tech-that-brings-you-your-food-1a7926229886 : DE login volumes, zone-wise cancellation rates, three-way hyperlocal marketplace.
9. Instacart tech blog, Space, Time and Groceries, https://tech.instacart.com/space-time-and-groceries-a315925acf3a : VRPTW framing, batch plans recomputed every minute, just-in-time dispatch, fulfillment engine.
10. Swiggy Limited, Q2 FY2026 Shareholder letter (PDF), https://www.swiggy.com/corporate/wp-content/uploads/2025/10/Q2-FY2026-Shareholder-letter.pdf : metric glossary (Active Dark Stores, CM % GOV, transacting delivery partners), orders/darkstore/day series, store profitability cohorts, cost of delivery 12 to 13% of AOV.
11. Eternal Limited, Shareholders' Letter Q4FY26 (PDF), https://b.zmtcdn.com/investor-relations/Eternal_Shareholders_Letter_Q4FY26_Results.pdf : NOV definition, NOV per day per store, store count and net adds, pin-code coverage, demand density, 5 to 6% steady-state margin.
12. Eternal Limited, Q2FY26 earnings call transcript (PDF), https://b.zmtcdn.com/investor-relations/Q2FY26-earnings-call-transcript.pdf : customer cohort CM breakeven in month one, 70 to 75% of store adds in top 10 cities, NOV preferred over GOV.
13. Liu and Luo, On-Demand Delivery from Stores: Dynamic Dispatching and Routing with Random Demand, https://arxiv.org/pdf/2107.13058 : 15-minute dispatch waves, on-time performance objective, fleet size and dispatch frequency experiments.
14. Simoni and Winkenbach, Crowdsourced on-demand food delivery: an order batching and assignment algorithm (abstract only), https://www.sciencedirect.com/science/article/pii/S0968090X2300044X : batching and assignment as the platform's core matching problem.
15. Business Standard, Quick commerce firms roll out festive incentives for delivery partners (26 Sep 2025), https://www.business-standard.com/industry/news/quick-commerce-firms-offer-festive-incentives-to-delivery-partners-125092600259_1.html : Blinkit 20% daily-earnings incentive, Zepto daily order-count scheme, peak slots, shift lengths.
16. IIM Bangalore (Forbes India reprint), Quick commerce last mile delivery: Indispensable (PDF), https://www.iimb.ac.in/sites/default/files/2022-12/Quick-commerce-last-mile-delivery_%20Indispensable.pdf : 4 to 5 km rider radius, Zepto 1.8 km average, over 90% in 10 min, the 10 vs 15 minute promise argument.
17. Fairwork India Ratings 2024 press release (CXOToday) https://cxotoday.com/press-release/fairwork-india-2024-report-examines-the-conditions-of-gig-workers-on-digital-labour-platforms/ and Entrackr summary https://entrackr.com/2024/10/ola-uber-and-porter-score-zero-in-fairwork-india-ratings-2024/ : five principles, minimum wage after costs, platform control over when and how long workers work, 2024 scores. Report PDF not fetched.
18. California Management Review (Berkeley), The Dark Store Revolution, https://cmr.berkeley.edu/2026/01/the-dark-store-revolution-how-indias-10-minute-economy-is-redefining-retail-infrastructure/ : store size, staff per site, sub-11-minute for 90% of orders.
19. Zepto Delivery Partner app listing (Google Play), https://play.google.com/store/apps/details?id=com.zepto.rider&hl=en_IN : per-order earnings, surge bonuses during peak hours, referral bonus, 3 km radius of your store, weekly payouts.
20. Blinkit Delivery Partner app listing (Google Play), https://play.google.com/store/apps/details?id=app.blinkit.onboarding&hl=en_US : same pickup store, within 3 km, daily payouts, insurance, per-hour earnings framing.
21. productgrowth.in, Quick Commerce Metrics, https://productgrowth.in/insights/ecommerce/quick-commerce-product-metrics/ : P90 and promise-accuracy vocabulary; no author, secondary, low trust.
22. Base.com blog, Last-Mile Delivery in Quick Commerce, https://base.com/en-EN/blog/last-mile-delivery-in-quick-commerce-why-its-so-expensive-and-how-to-fix-it/ : vendor source for "2 to 3 orders per rider per hour" and rider payout ranges; UNVERIFIED.
23. Storyboard18, Quick commerce platforms raise consumer fees, https://www.storyboard18.com/brand-marketing/blinkit-zepto-instamart-raise-fees-as-quick-commerce-goes-mainstream-ws-l-99758.htm : platform, handling, delivery fees and customer-side surge history.
24. TechCrunch, India's Zepto zooms to $1.2B in annualized sales, https://techcrunch.com/?p=2687208 : Goldman note on steady-state CM 12% and EBITDA 7%, new stores profitable in months.
