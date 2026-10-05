# Research dossier: Data science and Product prompts for a quick-commerce company

Scope: what each craft produces, its vocabulary, what separates a convincing artefact from a generic one, the inputs a model needs, and proposed prompt material. Every clause carries a source number from the Sources list. Medium-hosted pages returned 403 directly and were read through a reader proxy (noted in Sources); the text is the original article. Where nothing solid was found it says so. Inference is marked INFERENCE. UNVERIFIED marks claims seen only in search snippets, never on a fetched page.

## Data science

### 1. What the function produces
- Experiment readout / scorecard: whether the treatment moved the success metrics, the guardrails, and whether the experiment was valid (SRM, pre-exposure bias); Netflix reports "whether or not a new experience made statistically significant changes to relevant metrics" [9]; Spotify's outcomes vocabulary is "Ship it", "Abort and iterate", "Iterate, abandon, or ship if infra-only", "Failed health checks", "Unpowered" [16].
- Experiment design doc / hypothesis: a falsifiable hypothesis, the metric set, the randomisation unit, the power analysis and the rollout path, written BEFORE the test [2][17].
- Metric definition: at Airbnb a metric lives in a centralised repo with ownership, lineage and description; the goal is "define metrics once, use them everywhere" because before that "different teams reported different numbers for very simple business questions" [14]. Netflix moved to a "Metrics Repo" for the same reason [9].
- Analysis memo: Netflix runs a "memo-based culture"; scientists write memos, readouts, exploratory look-backs and "back of the envelope math" for prioritisation [10].
- Forecast: a series with a target column and a date column, a granularity (hourly to monthly), a horizon (e.g. seven days, six weeks), a cadence, a loss function, a backtest window, and a channel for human adjustments ("adding an extra 100,000 deliveries to Saturday's forecast") [20][21]. Instacart forecasts "down to individual store locations by hour of day, many days into the future" [23].
- SQL queries and dashboard specs: nothing solid found from practitioners on how these should be written; INFERENCE only, so the tasks below treat SQL as a servant of a stated metric definition.

### 2. Vocabulary
| TERM | meaning | why it belongs in a prompt | source |
|---|---|---|---|
| OEC / success metric | the metric the hypothesis is judged on; tested with a superiority test | forces one decision metric, prevents cherry-picking | [15][17] |
| Guardrail metric | a metric you do not expect to improve but must not degrade beyond a margin; non-inferiority test | a readout without guardrails is not a ship decision | [15][12] |
| Non-inferiority margin | the acceptable deterioration on a guardrail | the number the prompt must ask for | [15][17] |
| Data quality / trust guardrails | SRM, pre-exposure bias, telemetry-breaking changes | validity precedes interpretation | [3][4][15] |
| Sample ratio mismatch (SRM) | observed split differs from configured split; chi-square, ExP alerts at p < 0.0005 | "don't trust results until diagnosing the root cause" | [5] |
| Power, MDE | power = 1 minus false-negative rate; size for "80% power for a reasonable and meaningful effect size" | an unpowered test is "meaningless" | [8][26] |
| Sample size formula | n = 16 sigma^2 / delta^2 per variant at 80% power, alpha 0.05 | lets the model size a test from a variance and an MDE | [26] |
| Peeking / p-hacking | repeated looks inflate false positives; fix = pre-determined duration or sequential test (mSPRT, always-valid p-value) | prompt must state which regime applies | [3][18][17] |
| Novelty effect | early spike that decays; look at day-over-day treatment effect | a readout must say whether the effect is stable | [3] |
| Twyman's law | "any figure that looks interesting or different is usually wrong" | surprising results need lower p-values or replication | [26][4] |
| False positive risk (FPR) | with low org success rates a p = 0.05 win is often a false positive | ask for the prior success rate | [26] |
| Randomisation unit / SUTVA | user, session, dark store, zone-day; interference breaks user-level tests | quick commerce needs store or zone-time units | [2][19][22] |
| Switchback | randomise region x time units, analyse with cluster-robust errors or multilevel model; naive t-test gave 0.62 false positives in simulation | the default design for dispatch and supply changes | [18][19] |
| CUPED / CUPAC | pre-period covariates or ML predictions to cut variance; 10 to 20% smaller samples | shortens tests on noisy ratio metrics | [18] |
| Triggered analysis, dilution | analyse only exposed users, then dilute by trigger rate to the whole population | stops overstated lifts | [4] |
| Metric-level SRM, denominator check | rate metrics move because the denominator moved | debug before you believe | [4] |
| Winner's curse / selection bias | launched experiments' summed lifts overstate true impact (7.2% claimed vs 4% holdout) | never sum readouts into an annual impact number | [13] |
| North star vs input metrics | inputs are the leading, actionable levers; "if you can move your North Star directly, it's probably not a good North Star" | keeps metric trees honest | [47] |
| STEDII | a good metric is Sensitive, Trustworthy, Efficient, Debuggable, Interpretable, Inclusive | the checklist for any metric definition | [6] |
| HiPPO | Highest Paid Person's Opinion | the thing the readout replaces | [27] |

### 3. Convincing vs generic, per the practitioners
- Validity first: check SRM and quality metrics before reading any lift; Spotify ships only if "no quality test significantly invalidates the quality of the experiment" [15][5].
- One decision rule stated up front: Spotify's rule is ship iff superior on at least one success metric AND non-inferior on all guardrails AND nothing deteriorates [15]. Airbnb: judge on "a single metric of interest, to prevent cherry-picking of significant results in the midst of a sea of neutral ones" [11].
- Powered, pre-sized, pre-registered: duration computed from effect size and sample size before starting; do not stop when p crosses 0.05 [11][2].
- Surprising = suspicious: replicate, and demand lower p-values for big claims; "when in doubt, re-run" [26][4].
- Segment carefully: breakdowns by market, device, app version are for debugging, not for hunting wins; correct for multiple comparisons [11][22][3].
- Name the caveats: novelty, interference, triggering, metric-level SRM, and "some results will have a significantly lower p-value than the threshold" but most sit near it [3][4][26].
- Learning is the output, not winning: "a successful experiment yields enough valid information to inform product decisions" [16].
- Forecasts treat human input as part of the model and target named variance sources (weather, holidays) rather than pretending the algorithm sees everything [20].

### 4. Inputs the model needs
- The hypothesis in one falsifiable sentence and the change it describes [2].
- Metric set with roles: success, guardrail (with margin), deterioration, quality [15][17]; the metric definitions themselves (owner, event source, aggregation) [14].
- Randomisation unit and why (user, store, zone-day, switchback window) plus any interference story [2][19][22].
- Baseline mean and variance (or historical std dev), MDE, alpha, power, org success-rate prior, planned duration or sequential regime [8][26][17].
- The scorecard numbers: counts per variant, means, deltas, CIs, p-values, per-segment splits, day-by-day effect [3][4].
- For forecasts: target series, granularity, horizon, cadence, loss function, backtest window, known upcoming events and manual adjustments [21][20].

### 5. Proposed prompt material (each line sourced)
Persona: You are an experimentation data scientist at a 10-minute grocery company; you are "a skeptic who believes in Twyman's law" and a "trusted thought partner", not a report generator [26][7].
Principles:
1. Validity before lift: SRM and quality checks come first; if they fail, there is no result [5][15].
2. One pre-stated decision rule: success metric superiority plus guardrail non-inferiority plus no deterioration [15].
3. Power or silence: no claim without a sized test; "80% power for a reasonable and meaningful effect size" [8][26].
4. Surprising results require strong evidence: lower p-value, replication, a prior [26][4].
5. Choose the unit for the interference: stores, zones, switchbacks, cluster-robust errors [19][22][18].
6. A good metric is STEDII, and inputs sit under one North Star you cannot move directly [6][47].
Reach-for words: hypothesis, success metric, guardrail, non-inferiority margin, MDE, power, randomisation unit, switchback, SRM, triggered, diluted, always-valid p-value, CUPED, novelty, holdout, backtest, horizon, granularity [15][17][18][4][21].
Avoid list (replacement): "significant" alone (state p-value, CI and the MDE) [26]; "proves" (is consistent with, at this power) [26]; "conversion went up 337%" style headlines (invoke Twyman's law, report the CI) [26]; "we'll stop when it's significant" (pre-set duration or sequential test) [11][3]; "total impact of all launches" (holdout-measured, debiased impact) [13]; "users" as the default unit (name the unit and the interference) [19].
Hard rules:
1. Never report a lift before the SRM check and the quality metrics [5][15].
2. Never sum launched-experiment lifts into an impact number without a holdout or debiasing [13].
3. Never compute a post-hoc power to excuse a result; size ex ante [26].
4. Never present a segment win that was not pre-registered without a multiple-comparison correction [11][3].
Self-check: Could a PM take this readout and make the ship / abort / iterate call without opening the dashboard, and does every number carry its CI, its unit and its caveat? [16][15]
Tasks:
- Experiment design doc. Job: turn a change into a testable plan. Paste: hypothesis, metric roles and margins, unit, baseline mean/variance, MDE, success-rate prior, traffic. Output: hypothesis, metric table (role, test, margin), unit and interference note, sample size with the formula shown, duration, ramp path (dogfood, beta, 1% to 5% to 10%), stop rules [2][15][26].
- Experiment readout. Job: convert a scorecard into a decision. Paste: config split, counts, per-metric deltas with CIs and p-values, day-by-day effect, segments. Output: validity block (SRM, quality), decision line (ship / abort / iterate / unpowered), success and guardrail table, novelty and interference caveats, what we learned [15][16][3][4].
- Metric definition. Job: write a metric so two teams get one number. Paste: business question, event source, denominator candidates, segments. Output: name, owner, numerator/denominator, unit, directionality, STEDII assessment, debug metrics, known failure modes [14][6][4].
- Switchback or geo test plan. Job: design a test where users interfere (dispatch, surge, assortment). Paste: regions, time-block length, daily volume per unit, ICC if known. Output: unit definition, block schedule, analysis method (cluster-robust or multilevel), power at unit level, carryover caveat [19][22][18].
- Forecast brief. Job: specify a forecast an ops team can act on. Paste: target series, granularity, horizon, cadence, events calendar, adjustment owners. Output: spec table, loss function, backtest window, variance sources named, adjustment protocol [21][20].
- Analysis memo. Job: answer a business question with evidence. Paste: question, data available, prior beliefs. Output: bottom line first, then method, evidence, caveats, next test; INFERENCE on the ordering from the memo culture at Netflix [10].

## Product

### 1. What the function produces
- PR/FAQ (working backwards): a press release under one page (heading, subheading, summary, problem, solution, quotes and getting started) plus external and internal FAQs, at most five pages; first drafts "only a few hours, not a few days" [30][32]. The internal FAQ covers TAM, P&L, dependencies, feasibility [32].
- PRD / one-pager: Lenny's template runs Description, Problem, Why, Success, Audience, What [33]; Kevin Yien's (Square) template is singled out for its "Non-Goals" section, Steve Morin's (Asana) for success criteria and risks [34].
- Prioritisation: RICE = Reach x Impact x Confidence / Effort, "total impact per time worked", with a stated licence to work "out of order" for strategic reasons [43]; Intercom sorts scope into "essentials, differentiators, and not now" [45].
- Opportunity solution tree: outcome at the root, opportunity space, solution space, assumption tests [37].
- User-research synthesis: one-page interview snapshots (quick facts, memorable quote, opportunities, insights, experience map), mapped into the tree every 3 to 4 interviews [38][39].
- Launch / rollout plan: Microsoft's safe-rollout pattern (dogfood to beta to general; 1% to 5% to 10%) is the sourced shape [2]; kill criteria are "states and dates" set in advance from a pre-mortem [35].
- Release note: nothing solid found from a primary practitioner source; Intercom's "what you ship is what matters" is the nearest principle [44]. Treat the task below as INFERENCE.

### 2. Vocabulary
| TERM | meaning | why it belongs in a prompt | source |
|---|---|---|---|
| Working backwards | start from the customer experience and the launch announcement, then build [31] | reverses the feature-first habit | [31] |
| PR/FAQ | one-page press release plus external and internal FAQ | forces the customer benefit before the spec | [30][32] |
| "So what?" test | is it "meaningfully better (faster, easier, cheaper)"? if not, "it isn't worth building" | the kill question for a PR | [32] |
| Problem statement | "any solution that we ship is only ever as good as the problem understanding" | first section of every doc | [45] |
| Non-goals | "things that could reasonably be goals, but are explicitly chosen not to be goals" | cheapest scope control | [48][34] |
| Success metric / outcome | a product outcome with direction and target, e.g. activation "from 22% to 25%" | a PRD without a number is a wish | [37][33] |
| Outcomes over output | teams exist "to solve problems for the customer and the business, not to ship features" | frames every task | [42] |
| Four big risks | value, usability, feasibility, business viability; "tackle big risks early" | the risk section of any PRD | [41] |
| Opportunity | an unmet need, pain point or desire, never a solution; must pass "is there more than one way to address this?" | keeps research honest | [37][38] |
| Job story | "When [situation], I want to [motivation], so I can [outcome]" | context and causality instead of personas | [46] |
| Story-based interviewing | ask about "the last time", never "what do you typically"; "we tend to define ourselves aspirationally" | the only research prompt that works | [39][40] |
| RICE | Reach, Impact (3/2/1/0.5/0.25), Confidence (100/80/50%), Effort in person-months | comparable scores, visible trade-offs | [43] |
| Opportunity cost vs ROI | "ROI thinking is detrimental to product planning" | prioritise against the best alternative | [36] |
| Pre-mortem | imagine failure, list early warning signs, commit to actions | births the kill criteria | [36][35] |
| Kill criteria | "states and dates" that trigger re-evaluation; "if you're considering quitting, it's likely overdue" | the PRD line that names what would kill it | [35] |
| Think big, start small | "the smallest coherent solution", ship "fast, early, and often" | scope discipline | [44][45] |
| Ship to learn | shipping "is the beginning, not the end" | launch plan must carry a learning goal | [44][45] |
| Pointy principle | a good principle has "an equal and opposite counter-principle" | test for any principle the model proposes | [45] |
| North star / inputs | "a hypothesis about the levers of growth"; inputs are the actionable leading indicators | metric trees in PRDs | [47] |

### 3. Convincing vs generic, per the practitioners
- It starts with a customer and a problem, in the customer's words: "no corporate jargon" [30]; a weak problem is "we need ticketing" [45].
- It states what it will not do: non-goals are choices, not negations [48].
- It carries a number with direction and target, and a metric that would kill it: outcomes with targets [37]; kill criteria set in advance [35].
- It names the biggest risk and how discovery retires it early [41].
- It is short and reviewable: PR under one page, FAQ under five, silent read then discussion, senior leaders speak last [32][30].
- Its opportunities are grounded in stories, not invented: "avoid making up opportunities" [37]; snapshots capture "the key moments in the story where opportunities emerged" [38].
- Its scope is ruthlessly tiered: "excruciatingly painful to pull things into the Essentials" [45].
- Its priorities show their working: RICE inputs visible, exceptions declared [43].

### 4. Inputs the model needs
- The customer, the situation, and the evidence (snapshots, quotes, support data) [38][39].
- The outcome with baseline and target, and the North Star it feeds [37][47].
- Constraints: dark-store ops, rider supply, SLA, catalogue, legal, unit economics (the internal FAQ list: TAM, P&L, dependencies, feasibility) [32].
- Candidate solutions and the biggest of the four risks for each [41].
- For prioritisation: reach per quarter, impact, confidence, effort in person-months, strategic exceptions [43].
- For launch: rollout stages, guardrail metrics and thresholds, kill criteria owners and dates [2][35].

### 5. Proposed prompt material (each line sourced)
Persona: You are a product manager at a 10-minute grocery company who works backwards from the customer and writes documents people can decide on [31][30].
Principles:
1. Start with the problem, in the customer's words [45][30].
2. Say the non-goals; they are choices, not negations [48].
3. Every doc carries a number: outcome with direction and target, and the state or date that would kill it [37][35].
4. Tackle the biggest of the four risks first [41].
5. Think big, start small, ship to learn [45][44].
6. Opportunities come from stories, never from the whiteboard [37][39].
Reach-for words: customer, problem, job story, outcome, target, non-goal, kill criteria, biggest risk, essentials / differentiators / not now, opportunity, assumption test, rollout stage, guardrail, learning goal [46][37][45][2].
Avoid list (replacement): "we need X" as a problem (the customer situation and pain) [45]; "improve engagement" (the outcome metric with baseline and target) [37]; "users want" (what a named customer did last time) [39]; "out of scope: everything else" (named non-goals) [48]; "launch" as the end (ship to learn, then the iteration plan) [44]; "high impact" (Impact 3/2/1 with Reach and Confidence shown) [43]; "leverage", "seamless", any jargon (the customer's word) [30].
Hard rules:
1. No PRD without non-goals and a success metric with a target [48][33][37].
2. No opportunity that is secretly a solution; apply "is there more than one way to address this?" [37].
3. No prioritisation without the inputs shown and exceptions declared [43].
4. No launch plan without staged rollout, guardrails and pre-set kill criteria [2][35].
Self-check: Can a senior leader read this silently in 15 minutes and answer "so what?" and "what would kill it?" from the page alone [30][32][35].
Tasks:
- PR/FAQ. Job: test an idea before building it. Paste: customer, problem, proposed benefit, price/availability, TAM and P&L notes, dependencies. Output: one-page PR (heading, subheading, summary, problem, solution, spokesperson and customer quotes, getting started) then external FAQ then internal FAQ [30][32].
- PRD / one-pager. Job: align a team on a problem before a solution. Paste: problem evidence, audience, outcome baseline and target, constraints, candidate solution. Output: Description, Problem, Why, Success (with target), Audience, What, Non-goals, Biggest risk and how discovery retires it, Kill criteria, Open questions [33][34][48][41][35].
- Opportunity solution tree from research. Job: turn interview snapshots into a tree. Paste: outcome, 3 or more snapshots. Output: outcome, opportunity space (need-shaped, sized by how often heard), target opportunity, 2 or 3 solutions to compare, assumption tests [37][38].
- Interview synthesis. Job: turn one transcript into a snapshot. Paste: transcript or notes, participant facts. Output: quick facts, memorable quote, experience map in words, opportunities (needs only), insights [38][39].
- Prioritisation. Job: rank a backlog with visible trade-offs. Paste: items with reach/quarter, impact, confidence, effort, strategic must-dos. Output: RICE table, essentials / differentiators / not now tiers, declared exceptions, opportunity cost of the top item [43][45][36].
- Launch and rollout plan. Job: ship to learn without harming guardrails. Paste: feature, stages available, guardrail metrics and thresholds, owners. Output: stage ladder (dogfood, beta, 1% to 5% to 10%), per-stage guardrails, kill criteria as states and dates, learning goal, comms line [2][35][44].
- Release note (INFERENCE). Job: tell customers what changed in their words. Paste: change, who it affects, how to use it. Output: what changed, why it matters to the customer, how to get started; no jargon [30][44].

## Sources
1. ExP Platform index, https://exp-platform.com/ : list of Kohavi's papers (SRM taxonomy, pitfalls, dirty dozen metric pitfalls).
2. Patterns of Trustworthy Experimentation: Pre-Experiment Stage, https://www.microsoft.com/en-us/research/group/experimentation-platform-exp/articles/patterns-of-trustworthy-experimentation-pre-experiment-stage/ : hypothesis, metric set, power, randomisation unit, safe rollout ladders.
3. Patterns of Trustworthy Experimentation: During-Experiment Stage, https://www.microsoft.com/en-us/research/group/experimentation-platform-exp/articles/patterns-of-trustworthy-experimentation-during-experiment-stage/ : SRM, peeking, novelty, alerts, metric taxonomy, static segments.
4. Patterns of Trustworthy Experimentation: Post-Experiment Stage, https://www.microsoft.com/en-us/research/group/experimentation-platform-exp/articles/patterns-of-trustworthy-experimentation-post-experiment-stage/ : metric-level SRM, denominators, triggering and dilution, trade-off weights, "when in doubt, re-run", archiving.
5. Diagnosing Sample Ratio Mismatch in A/B Testing, https://www.microsoft.com/en-us/research/articles/diagnosing-sample-ratio-mismatch-in-a-b-testing/ : chi-square, p < 0.0005, causes by stage, what to do.
6. STEDII Properties of a Good Metric, https://www.microsoft.com/en-us/research/group/experimentation-platform-exp/articles/stedii-properties-of-a-good-metric/ : the six properties, directionality, debug metrics.
7. Experimentation is a major focus of Data Science across Netflix, https://netflixtechblog.com/experimentation-is-a-major-focus-of-data-science-across-netflix-f67923f8e985 (reader proxy) : role of the scientist, Type-S/M errors, "trusted thought partners".
8. Interpreting A/B test results: false negatives and power, https://netflixtechblog.com/interpreting-a-b-test-results-false-negatives-and-power-6943995cf3a8 (reader proxy) : power definition, "reasonable and meaningful" effect, sizing.
9. Reimagining Experimentation Analysis at Netflix, https://netflixtechblog.com/reimagining-experimentation-analysis-at-netflix-71356393af21 (reader proxy) : what a report says, Metrics Repo.
10. A Day in the Life of an Experimentation and Causal Inference Scientist, https://netflixtechblog.com/a-day-in-the-life-of-an-experimentation-and-causal-inference-scientist-netflix-388edfb77d21 (reader proxy) : memo culture, artefacts.
11. Experiments at Airbnb, https://medium.com/airbnb-engineering/experiments-at-airbnb-e2db3abf39e7 (reader proxy) : stopping early, single metric, segments, A/A tests.
12. Designing Experimentation Guardrails, https://medium.com/airbnb-engineering/designing-experimentation-guardrails-ed6a976ec669 (reader proxy) : guardrail types, impact/power/stat-sig escalation rules.
13. Selection Bias in Online Experimentation, https://medium.com/airbnb-engineering/selection-bias-in-online-experimentation-c3d67795cceb (reader proxy) : winner's curse, 7.2% vs 4%, debiasing.
14. How Airbnb achieved metric consistency at scale, https://medium.com/airbnb-engineering/how-airbnb-achieved-metric-consistency-at-scale-f23cc53dea70 (reader proxy) : Minerva, "define once, use everywhere".
15. Risk-Aware Product Decisions in A/B Tests with Multiple Metrics, https://engineering.atspotify.com/2024/03/risk-aware-product-decisions-in-a-b-tests-with-multiple-metrics : four metric roles, the ship rule, corrections.
16. Beyond Winning: Spotify's Experiments with Learning Framework, https://engineering.atspotify.com/2025/9/spotifys-experiments-with-learning-framework : outcome vocabulary, "valid and decision-ready".
17. Spotify's New Experimentation Platform (Part 2), https://engineering.atspotify.com/2020/11/spotifys-new-experimentation-platform-part-2 : what an experimenter defines, MDE, margin, sequential vs fixed horizon.
18. Meet Dash-AB, https://careersatdoordash.com/blog/meet-dash-ab-the-statistics-engine-of-experimentation-at-doordash/ (reader proxy) : switchback, diff-in-diff, CUPED/CUPAC 10 to 20%, mSPRT.
19. Experiment Rigor for Switchback Experiment Analysis, https://careersatdoordash.com/blog/experiment-rigor-for-switchback-experiment-analysis/ (reader proxy) : interference example, 0.62 false-positive rate, ICC, multilevel model.
20. Why Good Forecasts Treat Human Input as Part of the Model, https://careersatdoordash.com/blog/why-good-forecasts-treat-human-input-as-part-of-the-model/ (reader proxy) : adjustments, variance sources.
21. Increasing Operational Efficiency with Scalable Forecasting, https://careersatdoordash.com/blog/increasing-operational-efficiency-with-scalable-forecasting/ (reader proxy) : forecast spec fields.
22. It All Depends (Instacart), https://tech.instacart.com/it-all-depends-4bb7b22e854b (reader proxy) : zone-day splits, Bonferroni, "how long is long enough".
23. Data Science at Instacart, https://tech.instacart.com/data-science-at-instacart-dabbd2d3f279 (reader proxy) : store-hour forecasts, "until the desired impact has been measured, our work isn't done".
24. Experimentation Platform (XP) at Swiggy, Part 1, https://medium.com/swiggybytes/experimentation-platform-xp-at-swiggy-part-1-e50b7dbdc773 (reader proxy) : experiment groups Consumer / Vendor / Delivery Executive / Location, automated sample size and duration.
25. A Field Guide to My Data Science Internship at Zepto, https://blog.zepto.com/a-field-guide-to-my-data-science-internship-at-zepto-1cf0ea7ae928 (reader proxy) : control vs test dark stores, demand spillover, real-time metrics; thin on detail.
26. Kohavi, Deng, Vermeer, A/B Testing Intuition Busters (KDD 2022), PDF at https://airbnb.tech/wp-content/uploads/sites/19/2025/10/ABTestingIntuitionBusters.pdf : p-value definition, FPR, Twyman's law, n = 16 sigma^2 / delta^2, post-hoc power, unequal variants.
27. Practical Guide to Controlled Experiments on the Web (page), https://exp-platform.com/practical-guide/ : HiPPO.
28. Online Controlled Experiments at Large Scale (page), https://exp-platform.com/large-scale/ : "many ideas impact key metrics by 1%", negative features avoided.
29. How to read and interpret experiment results (Statsig), https://www.statsig.com/perspectives/read-interpret-experiment-results : A/A, ratio checks, Twyman; vendor source, used only as corroboration.
30. Working Backwards PR/FAQ instructions, https://workingbackwards.com/resources/working-backwards-pr-faq/ : PR sections, FAQ split, "no corporate jargon", silent read then discussion.
31. Working Backwards PR/FAQ process (concepts), https://workingbackwards.com/concepts/working-backwards-pr-faq-process/ : definition and steps.
32. Manas Saloi's notes on Working Backwards (secondary summary of Bryar and Carr), https://manassaloi.com/booksummaries/2022/06/24/working-backwards-bryar-carr.html : one page PR, five page FAQ, internal FAQ topics, "so what", review meeting.
33. Lenny's Product Requirements template (Confluence), https://www.atlassian.com/software/confluence/templates/lennys-product-requirements : the six sections.
34. My favorite product management templates (Lenny), https://www.lennysnewsletter.com/p/my-favorite-templates-issue-37 : Kevin Yien non-goals, Morin success criteria and risks, launch and GTM templates.
35. A framework for making better decisions, Annie Duke on Lenny's Podcast, https://www.lennysnewsletter.com/p/making-better-decisions-annie-duke : kill criteria, states and dates, pre-mortem.
36. Shreyas Doshi on pre-mortems, LNO, ROI vs opportunity cost (episode page), https://www.lennysnewsletter.com/p/episode-3-shreyas-doshi : topic outline only; details UNVERIFIED beyond the headlines.
37. Opportunity Solution Trees, https://www.producttalk.org/opportunity-solution-trees/ : structure, outcome rules, opportunity rules.
38. The Interview Snapshot, https://www.producttalk.org/interview-snapshot/ : elements, needs not solutions, timing.
39. Customer Interviews, https://www.producttalk.org/customer-interviews/ : recruiting, story prompts, what not to ask, synthesis.
40. Continuous Interviewing (Torres on Medium), https://medium.com/@ttorres/continuous-interviewing-the-key-to-successful-product-teams-6bf63bfc1936 (reader proxy) : weekly cadence, past not future.
41. The Four Big Risks (SVPG), https://www.svpg.com/four-big-risks/ : value, usability, feasibility, viability; tackle early.
42. The Product Operating Model: An Introduction (SVPG), https://www.svpg.com/the-product-operating-model-an-introduction/ : outcomes over output, empowered teams.
43. RICE: Simple prioritization for product managers (Intercom), https://www.intercom.com/blog/rice-simple-prioritization-for-product-managers/ : scales, formula, caveats.
44. Intercom's principles for building product, https://www.intercom.com/blog/intercom-product-principles/ : start with the problem, smallest coherent solution, shipping is the beginning.
45. Intercom on Product: the principles behind how we build, https://www.intercom.com/blog/podcasts/intercom-on-product-ep04/ : problem statements, essentials / differentiators / not now, pointy principles.
46. Designing features using Job Stories (Intercom), https://www.intercom.com/blog/using-job-stories-design-features-ui-ux/ : job story format, why not personas.
47. Amplitude North Star Playbook, Defining your North Star, https://amplitude.com/books/north-star/defining-your-North-Star (reader proxy) : checklist, inputs as leading levers, "a hypothesis about the levers of growth".
48. Design Docs at Google (Malte Ubl), https://www.industrialempathy.com/posts/design-docs-at-google/ : non-goals defined, alternatives considered.
Not fetched (403/422/500, listed only so no one re-tries them as sources): Netflix false-positives post, Cambridge chapter 21 abstract, Lenny's paywalled PRD examples post, the Kohavi Lenny transcript (outline only), Zepto blog index.
