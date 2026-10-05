# Engineering prompt research: backend and frontend (sourced 2026-09-04)

Scope: what each craft produces, its own vocabulary, what practitioners say separates a convincing artefact from a generic one, the inputs a model needs, and proposed prompt material. Every clause carries a source number from the Sources list; only fetched pages are listed. Inference is marked (inference). Gaps say "nothing solid found".

## Backend engineering

### 1. What the function produces
- Design doc: context and scope, goals and non-goals, the design (overview then detail, "the place to write down the trade-offs"), system-context diagram, API sketch, data storage, alternatives considered, cross-cutting concerns (security, privacy, observability); 10 to 20 pages for a large project, 1 to 3 for a mini doc; skip it when the solution is obvious. [6]
- ADR: Title, Context (value-neutral forces), Decision ("We will ..." in active voice), Status (proposed / accepted / deprecated / superseded), Consequences (all of them, not just positive); one or two pages; old ADRs are kept and marked superseded, never edited away. [12]
- API contract: designed around the business domain not the implementation; separate mutations per logical action; user-level errors in a userErrors field; required inputs only when semantically required; paginate list fields; "easier to add fields than to remove them". [22] Error responses use canonical codes, a "brief but actionable" developer-facing message, and machine-readable ErrorInfo (reason, domain, metadata). [19]
- Code review: the reviewer approves once the CL "definitely improves the overall code health" even if imperfect; reviews design first, then functionality, complexity, tests, naming, comments, style, consistency, docs, every line, context, and says what is good. [1][3] Comments are labelled by severity (Nit:, Optional/Consider:, FYI:) and explain why. [2]
- Runbook (Google calls it a playbook): "high-level instructions on how to respond to automated alerts", stating severity and impact, debugging suggestions, mitigation and resolution actions; one entry per alert; goes stale at the rate production changes. [10]
- Post-mortem: "a written record of an incident, its impact, the actions taken to mitigate or resolve it, the root cause(s), and the follow-up actions to prevent the incident from recurring"; blameless; has a timeline, quantified user impact, action items. [7]
- Migration plan (Stripe's four phases): dual write to old and new; move reads (with a Scientist-style comparison experiment); move writes; remove old data; backfill from snapshots offline. [18]
- SLO definition: SLIs as good events over valid events; an SLO document with authors, reviewers, the objectives, the SLI implementations, the budget calculation, and "the rationale behind the numbers"; an error budget policy with the actions on exhaustion and an escalation path. [9][8]

### 2. Vocabulary
| TERM | meaning | why it belongs in a prompt | source |
|---|---|---|---|
| idempotency key | client-generated unique key (V4 UUID suggested) the server uses to recognise retries and return the saved first result; up to 24 h; parameter mismatch is an error | makes "safe to retry" a checkable property of a POST contract | 13, 14 |
| retry with backoff and jitter | sleep = random(0, min(cap, base * 2^attempt)); plain exponential backoff still clusters calls | tells the model to write "full jitter", not "retry 3 times" | 15 |
| retryable vs non-retryable codes | retry UNAVAILABLE; never auto-retry INVALID_ARGUMENT, DEADLINE_EXCEEDED, CANCELLED, DATA_LOSS | the retry policy is per code, not per call | 20 |
| p99 / tail latency | "1% of requests might easily take 5 seconds" at 100 ms average; collect latency histograms not averages | replaces "fast" with a percentile | 11, 8 |
| SLI / SLO / SLA | quantitative measure / target for it / contract with consequences | the three are routinely confused in generic text | 8 |
| error budget | the acceptable rate of missing the SLO, with a written policy for exhaustion | turns reliability into a spendable number | 8, 9 |
| four golden signals | latency, traffic, errors, saturation | the minimum dashboard for any service | 11 |
| blast radius / bulkhead / cell | "fault isolated boundaries limit the effect of a failure ... to a limited number of components"; cells are service bulkheads, shards are data bulkheads | scopes what a rollout or migration can break | 24 |
| backpressure | "when one component is struggling to keep up, the system as a whole needs to respond in a sensible way" | names the load-shedding requirement in queues and streams | 25 |
| circuit breaker | closed / open / half-open; trips after a failure threshold so callers stop waiting on a dead dependency; every state change logged and alerted | standard defence against cascading failure | 23 |
| rate limit (leaky bucket, 429, calculated cost) | bucket drains at a fixed rate; overflow returns 429; GraphQL cost is per field | the client side of a contract needs the bucket size and refill | 21 |
| feature flag (release / experiment / ops / permissioning) | four toggle kinds with different lifetimes; flags are "inventory which comes with a carrying cost" | forces a removal date and a kind | 17 |
| dual write, backfill | write both stores while migrating; copy history offline from snapshots | the safe migration vocabulary | 18 |
| consistency model | "defines a set of histories that a system can legally execute"; serializability = equivalent to a total order | pins what "eventually consistent" is allowed to mean | 26 |
| blameless post-mortem | identifies contributing causes "without indicting any individual or team" | changes the tone of the whole document | 7 |
| rollback | small CLs make rollbacks easier because fewer files drift | a rollback plan is a size decision as much as a script | 5 |
| non-goals | "things that could reasonably be goals, but are explicitly chosen not to be goals" | the single most skipped section | 6 |

### 3. Convincing vs generic (per the practitioners)
- A design doc names non-goals and the alternatives that "would have reasonably achieved similar outcomes" with the trade-off that decided it; a doc that is an implementation manual without trade-offs should not exist. [6]
- An ADR writes the decision as "We will ..." and lists every consequence including the bad ones; it reads as a conversation with a future developer. [12]
- A post-mortem is blameless, quantifies impact, and ends in action items to prevent recurrence; "you can't fix people, but you can fix systems and processes". [7]
- A review comment is about the code not the developer, explains why, labels severity, and separates blocking from nitpick (Conventional Comments: label (decoration): subject, with (blocking) / (non-blocking) / (if-minor)); at least one praise per review. [2][16]
- An SLO target is not copied from current performance, avoids absolutes ("always available"), keeps SLIs simple, and uses few SLOs. [8]
- A page (alert) is actionable, needs intelligence, is novel, and is rare; a runbook entry exists for every alert. [11][10]
- An API is named for the business domain, never the legacy table, and mutation payloads carry userErrors. [22]

### 4. Inputs the model needs
Design doc / ADR: the problem statement, current architecture (diagram or list of services and stores), constraints and forces, candidate options already known, who reviews. [6][12] API contract: the domain objects and relationships first, the client's use cases, existing naming conventions, pagination and error conventions. [22][19] Code review: the diff plus the CL description (what and why, context, known shortcomings). [4] Runbook: the alert definition, its severity and user impact, dashboards, known mitigations. [10] Post-mortem: the timeline with timestamps, impact numbers, what was tried, the detection path. [7] Migration: the old and new models, read and write paths, volume, rollback point. [18] SLO: the user journeys, the events that count as valid, current latency histograms, business consequences of a miss. [9][8]

### 5. Proposed prompt material
Persona: "You are a staff backend engineer on a quick-commerce service team who writes the design doc before the code, reviews for code health not perfection, and treats every retry, flag and migration as something that must be safe to roll back." [1][6][5][17] (inference on the composite)
Principles:
1. State the non-goals and the alternatives rejected, with the trade-off that decided it. [6]
2. Decide in active voice, "We will ...", and list every consequence, not only the positive ones. [12]
3. Make retries safe before making them automatic: idempotency key, per-code retry policy, capped backoff with full jitter. [13][20][15]
4. Reason in percentiles and error budgets, never averages or "always". [11][8]
5. Name the blast radius: which cell, shard, cohort or flag bounds the damage, and the rollback that un-does it. [24][17][5]
6. Blameless by construction: causes are systemic, action items have owners and prevent recurrence. [7]
Reach-for words: non-goals, alternatives considered, trade-off, idempotency key, retry budget, full jitter, p99, SLI, SLO, error budget, golden signals, saturation, blast radius, bulkhead, cell, backpressure, circuit breaker (half-open), 429 with cost, release toggle vs ops toggle, dual write, backfill, superseded, contributing cause, action item, userErrors, canonical code, actionable page. [6][12][13][15][11][8][9][24][25][23][21][17][18][7][22][19]
Avoid, with replacements: "fast" -> a p99 target with a number [11]; "always available" -> an SLO percentage and its budget [8]; "retry a few times" -> attempts, cap, base, jitter formula and the codes that qualify [15][20]; "the user made a mistake" -> the contributing cause in the system [7]; "add a flag" -> which toggle kind, who flips it, when it is removed [17]; "just migrate the table" -> dual write, read cut-over, write cut-over, delete [18]; "looks good to me" -> what was checked (design, tests, naming) and any nits labelled [3][2]; "orderId field on Subscription" -> an object reference [22].
Hard rules:
1. No design doc ships without a Non-goals section and an Alternatives considered section. [6]
2. Every POST or mutation that creates or charges carries an idempotency key clause; every retry names the codes it retries and the ones it never retries. [13][14][20]
3. Every post-mortem is blameless and every action item has an owner; no names attached to causes. [7]
4. Every review comment carries a label and says why; blocking and nitpick are never mixed in one comment. [16][2]
Self-check: "Could a future engineer, reading only this, tell what we chose NOT to do, what happens on the retry, and what number we will be paged on?" [6][13][11] (inference on the composite)
Tasks:
- Design doc draft. Job: turn a problem statement into a Google-style design doc. Paste: problem, current system, constraints, known options, reviewers. Output: Context and scope; Goals; Non-goals; Design (overview, system-context diagram in text, APIs, storage); Alternatives considered with trade-offs; Cross-cutting concerns (security, privacy, observability); Open questions. [6]
- ADR. Job: record one architecture decision. Paste: the forces, the options, the decision taken. Output: Title (short noun phrase), Context, Decision ("We will ..."), Status, Consequences (positive and negative), Supersedes. [12]
- Code review pass. Job: review a diff for code health, with labelled comments. Paste: the diff, the CL description, the style guide link. Output: one verdict (approve / approve with nits / request changes), then comments in Conventional Comments form: label (decoration): subject, then why; end with at least one praise. [1][2][16]
- Retry and idempotency spec. Job: define the retry policy for one call path. Paste: the endpoint, its side effects, the dependency's error codes, latency histogram. Output: idempotency key header and lifetime; parameter-mismatch behaviour; retryable codes; non-retryable codes; base, cap, attempts, full-jitter formula; circuit breaker thresholds; what the caller shows the user on final failure. [13][14][20][15][23]
- Blameless post-mortem. Job: write the incident record. Paste: timeline with timestamps, impact metrics, detection path, mitigations tried. Output: Summary; Impact (numbers); Timeline; Contributing causes (systemic); What went well; What went wrong; Action items table (item, owner, priority, due); Lessons. [7]
- SLO and error budget policy. Job: define SLIs and SLOs for one user journey. Paste: the journey, valid-event definition, current histograms, consequences of a miss. Output: SLI (good / valid events); SLO target with window and rationale; error budget; the policy actions on exhaustion; escalation path; owners and review date. [9][8]
- Migration plan. Job: plan a zero-downtime data model change. Paste: old and new models, read and write paths, data volume, rollback point. Output: Phase 1 dual write; Phase 2 read cut-over with comparison experiment; Phase 3 write cut-over; Phase 4 delete; backfill method; verification job; rollback per phase; flag kind and removal date. [18][17]

## Frontend engineering

### 1. What the function produces
- Component spec: anatomy (named parts), properties / props, variants, states, sizes, spacing and layout, behaviours, accessibility, content. Nathan Curtis's EightShapes articles are the canonical practitioner source but returned 403 twice; the section list above comes from search-result snippets only. UNVERIFIED. Atomic design gives the level vocabulary: atoms, molecules, organisms, templates (content structure), pages (real representative content that tests resilience: long headlines, cart quantities, permissions). [40]
- Code review: the same Google standard applies (code health, design first, labelled severity, why) [1][3][2]; Conventional Comments for the comment form. [16]
- Accessibility pass: keyboard reachability of every interactive component (Tab between components, arrows within), roving tabindex or aria-activedescendant for composites, visible focus indicator always, focus vs selection distinct [32]; modal dialogs move focus in on open, trap Tab, close on Escape, return focus to the invoker, carry aria-modal and a label [33]; "No ARIA is better than bad ARIA" and ARIA roles add no keyboard behaviour by themselves [34]; pointer targets at least 24 by 24 CSS px with the five exceptions (spacing, equivalent, inline, user agent, essential) [35]; prefers-reduced-motion honoured, reduce rather than remove. [41]
- Performance budget: limits on quantity metrics (bytes, requests, fonts), milestone timings, and rule-based scores; when over budget the three moves are optimise, remove, or decline; enforced in CI (bundlesize, Lighthouse CI). [31] Field targets: LCP 2.5 s, INP 200 ms, CLS 0.1, each at the 75th percentile across mobile and desktop; lab data is not a substitute for field data. [27]
- Design-to-code implementation: from Figma Dev Mode: inspect panel specs, code snippets, applied and suggested variables (tokens), Ready-for-dev status, Code Connect showing the team's own component code instead of autogenerated code, measurements and annotations, exportable assets. [43] Tokens exchange in the Design Tokens Format Module: a token is an object with $value, optional $type (inheritable from a group) and $description; aliases as {group.token}; types include color, dimension, fontFamily, fontWeight, duration, cubicBezier, number and composites (border, shadow, typography). [39]
- State matrix (loading, error, empty, optimistic): instant loading state via loading.js / Suspense fallback showing "skeletons and spinners, or a small but meaningful part of future screens"; navigation stays interruptible and shared layouts stay interactive [44]; useOptimistic renders a temporary value while an Action is pending and falls back to the real value on error [38]; derived state is computed during render, not stored, and race conditions in fetches are handled with a cleanup flag. [36]
- Release checklist: nothing solid found as a practitioner checklist. Closest vendor doc: Expo EAS Update rollouts, "roll out a change to a portion of your users to catch bugs", percentage via --rollout-percentage, edited with update:edit, reverted with update:revert-update-rollout, one rollout per branch at a time. [46]

### 2. Vocabulary
| TERM | meaning | why it belongs in a prompt | source |
|---|---|---|---|
| design token | "information associated with a human readable name, at minimum a name/value pair"; $value, $type, $description; alias {group.token} | stops the model hard-coding hex and px | 39 |
| atoms / molecules / organisms / templates / pages | five levels; pages test the system with real content | gives the model a level to build at | 40 |
| controlled vs uncontrolled | controlled: "the important information in it is driven by props"; uncontrolled: local state, easier but less coordinable | the first decision in any component API | 37 |
| lifting state up / single source of truth | each piece of state has one owning component | prevents duplicated state | 37 |
| derived state | computed during render; never set in an Effect | kills the double-render bug | 36 |
| optimistic update (useOptimistic) | temporary state while an Action is pending; reverts to value on failure | names the rollback behaviour explicitly | 38 |
| skeleton / instant loading state | fallback UI shown immediately on navigation, prerenderable | the loading state is a designed state, not a spinner | 44 |
| LCP | render time of the largest image, text block or video in the viewport; good at 2.5 s or less | a number the model can budget against | 28, 27 |
| INP | worst latency of click, tap and key interactions over the visit: input delay + processing + presentation delay; good at 200 ms or less | replaces "feels snappy" | 29 |
| CLS (layout shift) | unexpected shift; good at 0.1 or less; causes: images without dimensions, late-loaded content, font swap, animating top/left | tells the model to reserve space and animate transform | 30, 27 |
| 75th percentile, field vs lab | pass = all three vitals good at p75 in field data | makes the metric a distribution | 27 |
| performance budget | limits on quantity, milestone and rule metrics, enforced in CI | turns "keep it light" into a gate | 31 |
| focus management (focus trap, focus return) | dialog moves focus in, traps Tab, returns to invoker on close | the dialog test screen readers actually run | 33 |
| roving tabindex / aria-activedescendant | Tab enters the composite, arrows move inside | the composite widget rule | 32 |
| reduced motion | prefers-reduced-motion: reduce; vestibular disorders; reduce not remove | every animation needs its reduced branch | 41 |
| hit target (target size) | at least 24 by 24 CSS px, five exceptions | a checkable number for buttons and icons | 35 |
| interruptibility, frequency, spatial origin | gestures cancel mid-flight; high-frequency actions get less or no motion; motion says where things come from | the motion judgement, incl. not animating | 42 |
| i18n (Intl) | Intl.NumberFormat, DateTimeFormat, PluralRules, RelativeTimeFormat, ListFormat, Collator | stops hand-rolled formatting and pluralisation | 45 |
| rollout percentage | ship to a share of users first, revert if needed | the release-safety word for OTA updates | 46 |

### 3. Convincing vs generic (per the practitioners)
- A component spec lists every state and every part by name; a page-level check uses real representative content (long strings, many items, no permission) rather than lorem ipsum. [40] (state-listing rule: UNVERIFIED, Curtis 403)
- A component API decides controlled vs uncontrolled deliberately and keeps one owner per piece of state. [37]
- An accessibility pass is judged by keyboard behaviour and focus, not by ARIA attributes sprinkled on divs; roles add no behaviour; test with real assistive technology. [34][32]
- A performance claim is a p75 field number against the 2.5 s / 200 ms / 0.1 thresholds, not a Lighthouse lab score. [27]
- A loading state is a designed skeleton of the coming screen, and optimistic UI states what happens on failure. [44][38]
- Motion is justified per interaction: high-frequency interactions often get none. [42]
- A review comment labels severity and explains why. [2][16]

### 4. Inputs the model needs
Component spec / implementation: the Figma node or Dev Mode export (specs, variables, annotations, Ready-for-dev status), the token file, the existing component library and its naming, Code Connect mappings if any. [43][39] State matrix: the data source, its latency profile, what can fail and how, what "empty" means in the domain. [44][38] Accessibility pass: the component's role and expected keyboard model, the markup or RN tree, target platforms and assistive tech. [32][34] Performance budget: current field vitals at p75, bundle report, device and network class of users. [27][31] Code review: the diff and description. [4] i18n: locales, plural categories, RTL requirement. [45] Release: the update channel or branch, rollout tooling. [46]

### 5. Proposed prompt material
Persona: "You are a senior frontend engineer on a React Native and web team who treats loading, empty, error and optimistic as designed states, measures at the 75th percentile in the field, and tests every component with the keyboard before shipping." [44][27][32] (inference on the composite)
Principles:
1. Tokens, not values: every colour, dimension, duration and easing references a $value by alias. [39]
2. Decide who owns each piece of state; controlled or uncontrolled is a stated choice; derive, do not store. [37][36]
3. Every component ships its state matrix: default, loading (skeleton), empty, error, optimistic with its revert. [44][38]
4. Keyboard first: reachable, arrows inside composites, visible focus, focus returned; ARIA only where semantics are missing. [32][33][34]
5. Budget against LCP 2.5 s, INP 200 ms, CLS 0.1 at p75 in the field; reserve space, animate transform. [27][30]
6. Motion earns its place: reduce for prefers-reduced-motion, none for high-frequency actions, and gestures stay interruptible. [41][42]
Reach-for words: token alias, $type, atom / molecule / organism, controlled, uncontrolled, single source of truth, derived state, cleanup, optimistic state, revert, skeleton, Suspense boundary, empty state, LCP element, INP (input delay, processing, presentation delay), layout shift, aspect-ratio, font-display, p75, field data, performance budget, roving tabindex, focus trap, focus return, aria-modal, aria-labelledby, target size 24 px, prefers-reduced-motion, interruptible, Intl.PluralRules, rollout percentage. [39][40][37][36][38][44][28][29][30][27][31][32][33][35][41][42][45][46]
Avoid, with replacements: "spinner" -> skeleton of the coming layout [44]; "make it accessible" -> the keyboard model and focus behaviour for this pattern [32][33]; "add aria-label everywhere" -> native element first, ARIA only where semantics are missing [34]; "fast" -> LCP / INP / CLS numbers at p75 [27]; "#FF5A1F" or "16px" -> {color.brand.primary} or {space.400} [39]; "useEffect to sync state" -> compute during render or handle in the event handler [36]; "disable animations" -> reduce them under prefers-reduced-motion [41]; "smooth animation" -> which property (transform, opacity), duration token, and whether it should animate at all [30][42]; "ship to everyone" -> rollout percentage and the revert command [46].
Hard rules:
1. Every component deliverable includes a state matrix with loading, empty, error and optimistic-then-revert. [44][38]
2. No raw colour or dimension literals; every value is a token alias. [39]
3. Every interactive element is keyboard reachable with a visible focus indicator and a target of at least 24 by 24 CSS px; dialogs trap and return focus. [32][35][33]
4. Every animation has a prefers-reduced-motion branch and animates transform or opacity only. [41][30]
Self-check: "Tab through it with the mouse unplugged, load it on a slow phone and read the p75 vitals, then unplug the network mid-action: does each state look designed?" [32][27][38] (inference on the composite)
Tasks:
- Component spec from Figma. Job: turn a Dev Mode node into a build-ready spec. Paste: the Dev Mode export (specs, variables, annotations), the token file, library naming. Output: Anatomy (named parts); Props table (name, type, default, controlled?); Variants; States (default, hover, pressed, focus, disabled, loading, empty, error); Sizes; Spacing (token aliases); Behaviour (keyboard model, focus); Content rules; Open questions for design. [43][39][37][32] (section list partly UNVERIFIED, Curtis 403)
- State matrix. Job: enumerate every UI state for one screen or component. Paste: data source, failure modes, domain meaning of empty. Output: table of state, trigger, what renders (skeleton / real content / message), what the user can do, what happens on failure or revert, which token and copy it uses. [44][38][36]
- Accessibility pass. Job: audit a component against APG and WCAG 2.2. Paste: markup or RN tree, intended pattern (dialog, menu, tabs), platforms. Output: keyboard model table (key, action); focus in / trap / return; roles and names actually needed; target-size check; reduced-motion check; findings labelled blocking / non-blocking with why. [32][33][34][35][41][16]
- Performance budget and vitals plan. Job: set the budget for a route. Paste: current p75 LCP / INP / CLS, bundle report, device class. Output: the LCP element and its load path; INP hot interactions and the phase to cut; CLS causes with reservations (dimensions, aspect-ratio, font-display); budget table (metric, limit, CI gate); the optimise / remove / decline decision for anything over. [28][29][30][31][27]
- Code review pass (frontend). Job: review a UI diff. Paste: diff, description, token file. Output: verdict; Conventional Comments per finding covering derived state in Effects, token literals, missing states, keyboard and focus, layout-shift risks; one praise. [1][2][16][36][39][32][30]
- Rollout plan (OTA). Job: ship a React Native update safely. Paste: branch or channel, blast radius of the change, the revert command. Output: rollout percentage steps, what metric is watched at each step, the revert trigger, who flips it. [46] (metric-watch clause is inference)

## Sources
1. Google eng-practices, The Standard of Code Review, https://google.github.io/eng-practices/review/reviewer/standard.html : approve when code health improves; data over opinion; style guide is authority; Nit label.
2. Google eng-practices, How to write code review comments, https://google.github.io/eng-practices/review/reviewer/comments.html : courtesy, explain why, severity labels Nit / Optional / FYI, praise.
3. Google eng-practices, What to look for in a code review, https://google.github.io/eng-practices/review/reviewer/looking-for.html : the review checklist headings.
4. Google eng-practices, Writing good CL descriptions, https://google.github.io/eng-practices/review/developer/cl-descriptions.html : first line imperative, what and why, shortcomings.
5. Google eng-practices, Small CLs, https://google.github.io/eng-practices/review/developer/small-cls.html : about 100 lines, one thing, refactors separate, easier rollbacks.
6. Malte Ubl, Design Docs at Google, https://www.industrialempathy.com/posts/design-docs-at-google/ : anatomy incl. non-goals and alternatives, length, when not to write one.
7. Google SRE book, Postmortem Culture, https://sre.google/sre-book/postmortem-culture/ : definition, blameless, triggers, action items.
8. Google SRE book, Service Level Objectives, https://sre.google/sre-book/service-level-objectives/ : SLI / SLO / SLA, error budget, choosing targets, percentiles.
9. Google SRE workbook, Implementing SLOs, https://sre.google/workbook/implementing-slos/ : SLI types, good over valid events, SLO document and error budget policy contents.
10. Google SRE workbook, On-Call, https://sre.google/workbook/on-call/ : playbook definition and contents, staleness.
11. Google SRE book, Monitoring Distributed Systems, https://sre.google/sre-book/monitoring-distributed-systems/ : four golden signals, tail latency, the four page criteria.
12. Michael Nygard, Documenting Architecture Decisions, https://cognitect.com/blog/2011/11/15/documenting-architecture-decisions : ADR sections, superseded status, length.
13. Stripe API docs, Idempotent requests, https://docs.stripe.com/api/idempotent_requests : header, UUID, 24 h, mismatch error, POST only.
14. AWS Builders' Library, Making retries safe with idempotent APIs, https://aws.amazon.com/builders-library/making-retries-safe-with-idempotent-APIs/ : client token, ACID recording, semantic equivalence, mismatch validation error.
15. AWS Architecture Blog (Marc Brooker), Exponential Backoff and Jitter, https://aws.amazon.com/blogs/architecture/exponential-backoff-and-jitter/ : full jitter formula, why backoff alone clusters.
16. Conventional Comments, https://conventionalcomments.org/ : label (decoration): subject, nine labels, blocking / non-blocking / if-minor.
17. Pete Hodgson on martinfowler.com, Feature Toggles, https://martinfowler.com/articles/feature-toggles.html : four toggle kinds, inventory with carrying cost.
18. Stripe blog, Online migrations at scale, https://stripe.com/blog/online-migrations : four phases, dual write, backfill, Scientist.
19. Google AIP-193 Errors, https://google.aip.dev/193 : canonical codes, actionable developer-facing messages, ErrorInfo.
20. Google AIP-194 Automatic retry configuration, https://google.aip.dev/194 : retry UNAVAILABLE only; codes never auto-retried.
21. Shopify API rate limits, https://shopify.dev/docs/api/usage/rate-limits : leaky bucket, calculated query cost, 429, backoff advice.
22. Shopify GraphQL Design Tutorial, https://github.com/Shopify/graphql-design-tutorial/blob/master/TUTORIAL.md : 24 API design rules.
23. Martin Fowler, CircuitBreaker, https://martinfowler.com/bliki/CircuitBreaker.html : states, cascading failure, monitoring.
24. AWS Well-Architected REL 10, Fault isolation, https://wa.aws.amazon.com/wellarchitected/2020-07-02T19-33-23/wat.question.REL_10.en.html : fault-isolated boundaries, bulkheads, cells, shards.
25. Reactive Manifesto glossary, https://www.reactivemanifesto.org/glossary : back-pressure, failure vs error, isolation.
26. Jepsen, Consistency Models, https://jepsen.io/consistency : definition of a consistency model, serializability.
27. web.dev, Web Vitals, https://web.dev/articles/vitals : LCP / INP / CLS thresholds, p75, field vs lab.
28. web.dev, LCP, https://web.dev/articles/lcp : what counts as the LCP element.
29. web.dev, INP, https://web.dev/articles/inp : interactions counted, three phases, thresholds.
30. web.dev, Optimize CLS, https://web.dev/articles/optimize-cls : causes and fixes (dimensions, aspect-ratio, font-display, transform).
31. web.dev, Performance budgets 101, https://web.dev/articles/performance-budgets-101 : metric types, optimise / remove / decline, CI tools.
32. WAI-ARIA APG, Developing a Keyboard Interface, https://www.w3.org/WAI/ARIA/apg/practices/keyboard-interface/ : Tab vs arrows, roving tabindex, aria-activedescendant, visible focus.
33. WAI-ARIA APG, Dialog (Modal) pattern, https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/ : focus in, trap, Escape, return, aria-modal, label.
34. WAI-ARIA APG, Read Me First, https://www.w3.org/WAI/ARIA/apg/practices/read-me-first/ : no ARIA better than bad ARIA, roles add no behaviour, test with AT.
35. WCAG 2.2 Understanding 2.5.8 Target Size (Minimum), https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html : 24 by 24 CSS px and exceptions.
36. react.dev, You Might Not Need an Effect, https://react.dev/learn/you-might-not-need-an-effect : derive during render, events in handlers, race-condition cleanup.
37. react.dev, Sharing State Between Components, https://react.dev/learn/sharing-state-between-components : controlled vs uncontrolled, lifting state, single source of truth.
38. react.dev, useOptimistic, https://react.dev/reference/react/useOptimistic : temporary state during an Action, revert on error.
39. Design Tokens Format Module (DTCG), https://www.designtokens.org/TR/drafts/format/ : token definition, $value / $type / $description, aliases, types.
40. Brad Frost, Atomic Design chapter 2, https://atomicdesign.bradfrost.com/chapter-2/ : five stages, templates vs pages with real content.
41. web.dev, prefers-reduced-motion, https://web.dev/articles/prefers-reduced-motion : media query, vestibular disorders, reduce not remove, matchMedia.
42. Rauno Freiberg, Invisible Details of Interaction Design, https://rauno.me/craft/interaction-design : interruptibility, frequency, spatial origin, hit targets.
43. Figma Help, Guide to Dev Mode, https://help.figma.com/hc/en-us/articles/15023124644247-Guide-to-Dev-Mode : inspect, variables, Ready for dev, Code Connect, annotations, assets.
44. Next.js docs, loading.js, https://nextjs.org/docs/app/api-reference/file-conventions/loading : instant loading states, skeletons, Suspense boundaries, interruptible navigation.
45. MDN, Intl, https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl : locale-sensitive formatting constructors.
46. Expo docs, EAS Update rollouts, https://docs.expo.dev/eas-update/rollouts/ : percentage rollouts, edit, revert, one per branch.
Not fetched (do not cite as fact): Nathan Curtis, Component Specifications (medium.com/eightshapes-llc, HTTP 403 twice; section names taken from search snippets, UNVERIFIED); AWS Builders' Library, Timeouts, retries and backoff with jitter (builder.aws.com returned a JS shell with no article text; the Brooker blog post [15] covers jitter, timeouts guidance remains unsourced).
