// The Edge (codename JARVIS) problem-framing PRD, synthesized from the IDEO
// steps 1 to 4 discovery doc (Active - Zepto/Ads & Strategy/JARVIS/PRD/) into the
// same shape the Away and Dassh PRDs use, so it renders as native portfolio DOM
// via PrdRenderer. WIP / Draft v0.1. [VENDOR] marks vendor-self-reported figures;
// [UNVERIFIED] marks claims to confirm. No em-dashes (portfolio rule):
// commas / periods / colons instead. The IDEO steps render as spec sections.

export const jarvisPrdData = {
  synthesis: {
    oneLiner:
      "Edge is the proactive, role-adaptive, first-party intelligence layer that closes the analytics-to-action loop on Zepto Ads, behind a trust boundary an external bot structurally cannot cross.",
    whatThisIs:
      "Edge (codename JARVIS) is an in-flow and tab AI copilot for Zepto Ads brand advertisers, from single-SKU long-tail sellers to HUL-scale advertisers with dozens of sub-brands grouped into families. This document frames the problems for the intelligence and personalization layer specifically, around three things the team flagged: serving brands of different sizes and complexity, showing correlations in the data, and deciding what to suggest and when. It runs the IDEO process through step 4 only (Frame, Gather Inspiration, Synthesize, Generate Ideas). Steps 5 to 7 (make tangible, test, share) are the next phase. Status: WIP draft v0.1; scope, success metrics, and sizing are deliberately out of scope here, this frames problems, not solutions.",
    theWedge:
      "Edge is the proactive, role-adaptive, first-party intelligence layer that closes the analytics-to-action loop: modeling brand families as first-class objects, explaining drivers as confounder-controlled waterfalls, and pacing suggestions to an explicit attention budget, behind a trust boundary an external bot structurally cannot cross.",
    twoGoverningRules: [
      "Serve the brand's goal, not Zepto's GMV. Every suggestion must visibly advance the brand's stated goal (iROAS, awareness, conversion), never platform spend. This is the only thing that converts Edge's first-party access into trust, and the exact gap incumbents are criticized for: recommendations optimized for the platform's metrics, not the advertiser's.",
      "Every suggestion is legible and reversible. Lead with the goal-relevant symptom, attach the driver plus confidence plus an honest scope caveat, quantify the predicted impact, and gate any money-moving action behind approve-with-audit. Trust is earned by being derivable and easy to override, never by an opaque score.",
    ],
    whyNowAndTheThreat:
      "Quick-commerce ad spend is roughly doubling (about Rs 4,000 cr in 2025 to about Rs 6,000 cr in 2026, industry estimate). The strategic frame from the existing JARVIS specs: the platform must turn metrics into insights, push proactive alerts, and close the loop with one-click optimizations, or external bots build the AI layer on top of Zepto and reduce it to a dumb pipe. The acute pressure is GobbleCube, an external bot built by ex-Blinkit founders, already inside HUL, Tata, and Reckitt, ranking problems over dashboards from on top of Zepto's own platform. Zepto's own Atom plus Zepto GPT (paid tier, May 2025) is the pull-only data substrate Edge sits on; Edge's wedge is the push and action loop Atom stops short of.",
    howThisWasBuilt:
      "IDEO step 2 was a multi-agent deep-research workflow: 6 domain agents ran live web search and fetch, each fact-checked by a paired verify agent, then a synthesis pass rolled up the competitor map, inspiration, STAR seeds, and idea seeds, mirroring how the Away 13-agent PRD synthesis was built. 35 cited sources. Steps 1, 3, and 4 are our product synthesis on top. Confidence flags carry the verify verdicts.",
  },

  // The IDEO spine renders as spec sections (each a flexible, labeled block).
  specs: [
    {
      eyebrow: "IDEO · Step 1",
      id: "edge-frame",
      title: "Frame the questions",
      summary:
        "The team supplied three core How-Might-We questions; we keep them verbatim and add four the research surfaced as load-bearing, grouped into three themes. Plus a proposed wedge and two governing rules (in Synthesis).",
      serveDifferentSizesAndComplexity: [
        "H1 (core): How might we serve brands of different sizes and their ads data, when requirements differ by size and org complexity (HUL has multiple sub-brands, divided into families)?",
        "H4 (added): How might we roll up and drill down across a brand hierarchy (org, brand family, brand, SKU, campaign) without losing the thread?",
        "H6 (added): How might we adapt the surface to the user's role and altitude (media buyer vs brand lead vs leadership) on the same data?",
      ],
      showCorrelations: [
        "H2 (core): How might we show correlations across data points, tell a brand what moves what, defensibly?",
      ],
      whatAndWhenToSuggest: [
        "H3 (core): How might we summarize the aspects of performance that matter to a brand's goals, and decide what to suggest and when?",
        "H5 (added): How might we make a proactive suggestion legible and trustworthy (why this, why now) so brands act, especially when the platform itself profits from more spend?",
        "H7 (added): How might we time and pace proactivity so it lands as help, not noise (alert fatigue)?",
      ],
    },

    {
      eyebrow: "IDEO · Step 2",
      id: "edge-inspiration",
      title: "Gather inspiration and map competitors",
      summary:
        "Live web research across six domains (account hierarchy, retail-media tools, correlation and driver analytics, ad recommendation systems, goal and timing frameworks, Indian quick-commerce), fact-checked in a verify pass. 35 sources in the appendix.",
      callout: {
        label: "The headline",
        body:
          "Incumbents have solved the plumbing of serving different brand sizes (nested manager accounts, brand-ID-mapped families, portfolio tiers), the driver analysis (property-scans, significance-ranked waterfalls, iROAS and MMM discipline), and the what and when of suggestions (goal-readiness scores, impact-ranked recs, dismiss-cooldown loops, interrupt vs digest cadence). But they uniformly differentiate by permission and scope, not by an adaptive role and altitude view. That is the clear whitespace. The acute pressure is GobbleCube, ranking problems over dashboards from on top of Zepto's own platform.",
      },
      competitorMap: [
        {
          name: "GobbleCube",
          category: "Indian q-commerce AI copilot, the direct threat",
          strength:
            "Quick-commerce-native growth layer (ex-Blinkit founders). Unifies sales, stock-on-hand, POs, ad spend, search rank, and competitor pricing across Amazon, Blinkit, Zepto, Flipkart. Ranks problems and recommends actions, not dashboards; classifies issue types and routes to the right owner. 400-plus brands incl. HUL, Tata, ITC; 15M dollar Series A.",
          gap: "External to Zepto: ingests or scrapes, cannot act with first-party fidelity or write back into Zepto's auction; no PIN-code Atom substrate. The 2-to-3x revenue claim is [VENDOR].",
        },
        {
          name: "Zepto Atom and Zepto GPT",
          category: "Native platform Edge extends",
          strength:
            "Zepto's paid analytics tier (May 2025): hyperlocal PIN-code market share, minute-by-minute sales on a real-time map; Zepto GPT returns NL recommendations. The data substrate Edge sits on.",
          gap: "Pull, not push: query-driven, stops at recommendations and reports; no closed action loop, no role-adaptation, no proactive in-flow suggestions. Edge's wedge is exactly this gap.",
        },
        {
          name: "Blinkit Brand Central",
          category: "Native Indian q-commerce",
          strength:
            "Self-serve ad console; publishes outcome benchmarks (3.8x avg ROAS [VENDOR]). The self-serve maturity Zepto historically lacked.",
          gap: "A console, not an intelligence layer: no proactive driver analysis, no copilot, no role-adaptation.",
        },
        {
          name: "Pacvue (Agent)",
          category: "Enterprise commerce-media OS",
          strength:
            "Governed agentic execution (Apr 2026): next-best-actions tied to explicit goals become campaign and budget updates behind approval gates plus full audit; impact-ranked; if-this-then-that rules as the legible alternative to black-box AI; weekly cadence plus attribution-aware lookback.",
          gap: "Amazon-only at launch; SMBs served by a separate product (Helium 10); US and Amazon-first, stock is one signal not q-commerce-native.",
        },
        {
          name: "CommerceIQ",
          category: "Enterprise multi-brand CPG copilot",
          strength:
            "iROAS and incrementality across 50-plus shelf-aware signals (avoids cannibalizing organic); hourly dayparting; anomaly detection that names the cause; Omni cross-retailer roll-up onto unified KPIs; what, why, how in one place.",
          gap: "US, Amazon, and Walmart-first; role-adaptation marketed but depth [UNVERIFIED]; lifts are [VENDOR].",
        },
        {
          name: "Skai (Celeste AI)",
          category: "genAI commerce-media analyst",
          strength:
            "NL agent over the brand's own first-party data; trust recipe: ground in first-party, name the KPI, give the why plus next action, auditable; ships a separate Executive Copilot vs operator Budget Navigator.",
          gap: "Mostly reactive (user-prompted) today; proactive multi-agent still planned; not q-commerce-native.",
        },
        {
          name: "Stackline (Beacon)",
          category: "Catalog-wide adaptive-AI analytics",
          strength:
            "Continuously scans the whole catalog; every recommendation paired with a predicted sales impact; 52-week SKU forecasts; margin-protection alerts.",
          gap: "US-first; no first-class role surface; predicted-impact accuracy not independently validated.",
        },
        {
          name: "Perpetua and Quartile",
          category: "AI bid-optimization",
          strength:
            "Goal-state input (set a target efficiency, the algorithm chases it); strong for high-volume growth brands.",
          gap: "Black-box; thin on legibility and driver explanation; weak on cross-retailer rollups and long-tail SMB; not q-commerce-native.",
        },
        {
          name: "Google Ads",
          category: "Native platform, hierarchy and recommendation reference",
          strength:
            "Single 0-to-100 percent Optimization Score; each rec carries a quantified uplift used to rank; goal inferred from bid strategy reshapes the rec set; dismiss, cool-down, re-surface; deep MCC tree (up to 6 levels) with weighted score roll-up; five named access levels.",
          gap: "Score formula opaque; recs critiqued as optimized for Google, not the advertiser, causing alert fatigue; scope-based, not role-adaptive; not q-commerce.",
        },
        {
          name: "Amazon Ads",
          category: "Native platform, hierarchy and formula-backed recs",
          strength:
            "Optional portfolio tier (budget cap plus spend roll-up); nested Manager Accounts mirroring the org chart (buying-team slice vs parent aggregate); formula-backed recs (Recommended Budget equals Missed Clicks times CPC); event-aware (Prime Day).",
          gap: "Portfolio cap is a hard ceiling that auto-pauses, it does not pace spend; no role-adaptive surface; not q-commerce.",
        },
        {
          name: "Meta Business Portfolio",
          category: "Native platform, access model",
          strength:
            "Two-axis access: portfolio-level (whole business) vs asset-level (one brand); client owns the asset, agency or bot is a scoped Partner; Opportunity Score ranks recs by estimated impact.",
          gap: "Score formula opaque; no retail-media context; scope-based, not role-adaptive.",
        },
        {
          name: "Criteo Retail Media",
          category: "Retail-media, brand-family primitive",
          strength:
            "Brand-ID mapping: many brand IDs roll into one demand account, the literal brand-family primitive; an insight or campaign can span brands (a mesh, not a pure tree).",
          gap: "US and global, not q-commerce; line-item is single-retailer.",
        },
        {
          name: "Amplitude, Mixpanel, Sisu, Anodot, Tableau Pulse, New Relic",
          category: "Analytics and BI, driver and alerting reference",
          strength:
            "Property-scanning root-cause; Sisu significance-ranked waterfall; correlation-grouping of co-moving anomalies into one alert; Compass strength plus CI plus confounder caveat; Pulse fixed 14-insight taxonomy plus Concentrated-Contribution plus digest-first, at most 1 off-cycle alert per day; seasonality-aware baselines.",
          gap: "None ad or q-commerce-specific; richest features enterprise-gated; significance math proprietary. The toolbox for H2, H5, H7.",
        },
      ],
      inspirationByQuestion: [
        {
          question: "H1: serve different sizes and complexity",
          patterns: [
            "Nested Manager Accounts mirroring the org chart (Amazon)",
            "Brand-ID mapping as the family primitive (Criteo)",
            "One-portfolio-SMB vs master-plus-brand-portfolios-enterprise fork (Meta)",
            "Separate products for enterprise vs SMB (Pacvue and Helium 10)",
            "Graceful degradation on thin history via category benchmarks (Google)",
          ],
          takeaway:
            "Detect the shape a brand needs. Default SMBs to a single-goal, prescriptive next-best-action mode; reserve nested org, family, brand roll-ups for enterprises. Model the family as a first-class object; fall back to category benchmarks when own-history is thin.",
        },
        {
          question: "H2: show correlations and drivers",
          patterns: [
            "Property and dimension-scanning root-cause (Amplitude, Mixpanel)",
            "Significance-ranked Smart Waterfall (Sisu)",
            "Correlation-grouping of co-moving anomalies (Anodot)",
            "iROAS and incrementality as the driver lens (CommerceIQ)",
            "SOV-vs-campaign and cannibalization detection (GobbleCube)",
            "MMM discipline: control confounders, high R-squared is not proof (PyMC, Recast)",
            "Hyperlocal PIN-code framing (Atom)",
          ],
          takeaway:
            "Auto-decompose a moved metric across the brand's own dimensions (city, PIN-code, SKU, campaign, daypart) and rank by contribution, but with MMM-grade discipline (control seasonality, promo, competitor-stockout confounders; prefer base-vs-incremental) and classify the issue type, because in a multi-brand mesh raw correlation hands credit to the wrong driver.",
        },
        {
          question: "H3: summarize vs goals; what to suggest",
          patterns: [
            "Funnel stage as the goal-to-metric spine (Amazon)",
            "Single goal-readiness score ranking recs by uplift (Google Optimization Score)",
            "Fixed insight taxonomy plus impact-scoring plus thumbs-personalization (Tableau Pulse)",
            "Problem-ranking over dashboards (GobbleCube)",
            "Goal-as-target to ranked actions (Pacvue)",
          ],
          takeaway:
            "Make the goal an explicit input that reshapes which suggestions even generate. Give each suggestion a quantified apply-this-for-plus-X-percent-toward-your-goal that doubles as the ranking key. Present a ranked problem list, not a metric wall; let thumbs personalize.",
        },
        {
          question: "H4: roll up and drill down",
          patterns: [
            "Weighted hierarchy score roll-up (Google MCC)",
            "Nested-MA aggregate-vs-slice reports (Amazon)",
            "Concentrated-Contribution alert: a few members are 50 percent-plus of the move (Tableau Pulse)",
            "Cross-retailer roll-up onto unified KPIs (CommerceIQ Omni)",
            "Brand-ID mesh, not pure tree (Criteo)",
          ],
          takeaway:
            "Build a bounded, legible tree (org, family, brand, SKU, campaign) with structural limits; roll a goal-readiness score up by weighted aggregation, drill back without losing per-entity detail; use Concentrated-Contribution so a family-level shift collapses to one cause.",
        },
        {
          question: "H5: legible and trustworthy suggestions",
          patterns: [
            "Formula-backed derivable recs (Amazon: Missed Clicks times CPC)",
            "Predicted sales impact on every rec (Stackline)",
            "Strength plus confidence interval plus confounder caveat together (Amplitude Compass)",
            "Name the KPI plus why plus next action, grounded in first-party data (Skai)",
            "Governed recommend, approve, audit (Pacvue)",
            "What, why, how in one place (CommerceIQ)",
            "Lead with the symptom, attach the cause (Google SRE)",
          ],
          takeaway:
            "Prefer formula-backed derivations over opaque scores for anything that spends money; lead with the goal-relevant symptom; show strength plus confidence plus honest scope (ignores margin); carry a predicted impact; gate one-click action behind approve-with-audit.",
        },
        {
          question: "H6: role and altitude adaptation (the whitespace)",
          patterns: [
            "Five named access levels as an altitude taxonomy (Google: Email-only equals exec digest)",
            "Portfolio-vs-asset access (Meta)",
            "Tree-position-defines-altitude (Amazon nested MA)",
            "Separate Executive Copilot vs operator view (Skai)",
            "Same data reframed for QBR vs operator action (CommerceIQ)",
            "Issue-type routing to the owner who can fix it (GobbleCube)",
          ],
          takeaway:
            "A first-class role-adaptive surface is genuine whitespace, incumbents differentiate by scope, not view. Operator equals per-campaign drivers plus one-click fixes; brand lead equals rolled-up goal-pace summary; leadership equals low-frequency digest. Route each issue type to its owner.",
        },
        {
          question: "H7: time and pace proactivity",
          patterns: [
            "Dismiss, cool-down (28 or 60 days), conditional re-surface (Google)",
            "Two-tier interrupt-vs-digest, capped at most 1 off-cycle per day (Tableau Pulse, Google SRE)",
            "Seasonality-aware dynamic baselines plus sensitivity dial (Mixpanel, New Relic)",
            "Correlation-grouping into one alert (Anodot)",
            "Attribution-aware lookback, exclude the last 1 to 2 unsettled days (Pacvue)",
            "Event-aware timing on real calendar moments (Amazon Prime Day)",
            "Right-time delivery at task breakpoints: about 50 percent faster response, about 46 percent lower cognitive load (HCI research)",
          ],
          takeaway:
            "Make the brand's attention budget (a few urgent things a day) an explicit constraint. Interrupt only for actionable, threshold-exceeded, goal-visible events (cap about 1 per day); digest the rest. Define normal with seasonality-aware baselines (Indian festival, payday, weather); group co-moving anomalies; exclude unsettled data; pace non-urgent insights to natural breakpoints and real Zepto sale moments; remember dismissals.",
        },
      ],
    },

    {
      eyebrow: "IDEO · Step 3",
      id: "edge-problems",
      title: "Synthesize for action (STAR)",
      summary:
        "Each card is a problem statement the build-out PRD must answer, via Situation, Task, Action, Result. These are the exact problem statements. Confidence flags carry the verify verdicts.",
      problemStatements: [
        {
          problem:
            "P1, the brand-family and brand-size problem. An HUL-scale advertiser with many sub-brands grouped into families has no first-class way to model the family, roll a health and goal-readiness signal up the org, family, brand, SKU, campaign tree, and drill back without losing the thread, while a long-tail SMB drowns in a hierarchy it never needed.",
          answers: "H1, H4",
          situation:
            "Edge sits on Atom's first-party PIN-code data; brands span single-SKU SMBs to HUL with dozens of sub-brands. Incumbents model family inconsistently (Criteo brand-IDs, Meta master-plus-brand portfolios, Amazon nested MAs) and none expose a role-adaptive roll-up view.",
          task:
            "Give a giant a first-class brand-family object with weighted roll-up and clean drill-down; keep the SMB surface flat and prescriptive.",
          action:
            "Adopt Criteo's brand-ID-mapping primitive (family equals one navigable mesh); a bounded MCC-style tree with weighted score roll-up; Tableau Pulse's Concentrated-Contribution alert to collapse a family move to one cause; detect brand shape and default SMBs to a flat next-best-action mode.",
          result:
            "Both get the right shape: HUL rolls up and drills down without losing the thread; the SMB sees one ranked action list. Confidence: hierarchy primitives well-verified; the role-adaptive roll-up view is whitespace, not a copied pattern.",
        },
        {
          problem:
            "P2, the trustworthy-driver problem. When a brand's ROAS or sales moves on Zepto, tools show the symptom but not a trustworthy driver, and naive correlation across a multi-brand by city by SKU by campaign mesh hands credit to the wrong cause.",
          answers: "H2, H5",
          situation:
            "Edge has rich first-party signals (PIN-code sales, stock-on-hand, search rank, CPC, competitor availability). GobbleCube already classifies issue types and detects cannibalization; MMM practice warns raw correlation is a correlation machine and high R-squared is not proof.",
          task:
            "Tell the brand what moved its metric and why, defensibly, not just that it moved.",
          action:
            "Auto-decompose across the brand's own dimensions (property-scan) into a Sisu-style significance-ranked contribution waterfall; classify the issue type; apply MMM discipline (control confounders, prefer base-vs-incremental and iROAS); show strength plus CI plus confounder caveat together.",
          result:
            "These three things, in this order, moved your ROAS, and here is why we are confident, differentiated from bots by iROAS and first-party stock signals. Confidence: driver and discipline patterns verified; incumbents' exact significance math is proprietary.",
        },
        {
          problem:
            "P3, the what-and-when problem. The same data yields different advice per goal, and a stream of pings causes alert fatigue that makes brands ignore even good suggestions.",
          answers: "H3, H7",
          situation:
            "SMBs realistically live in one funnel stage (conversion or target-ROAS); HUL runs all four across sub-brands. SRE and Tableau Pulse independently converge on interrupt-only-for-actionable plus digest-the-rest; Pacvue prescribes weekly cadence plus attribution-aware lookback.",
          task:
            "Suggest only what matters to the stated goal, at a pace that lands as help.",
          action:
            "Make the goal an input that reshapes which suggestions generate (Amazon stage-to-metric; Google goal-from-bid-strategy); rank by quantified uplift; a two-tier cadence (interrupt cap about 1 per day; digest the rest); seasonality-aware baselines (Indian festival, payday) excluding the last 1 to 2 unsettled days; a 28 or 60-day dismissal cool-down.",
          result:
            "A short, goal-relevant, well-paced list instead of a metric wall, proactivity read as help, not noise.",
        },
        {
          problem:
            "P4, the legibility and trust-boundary problem. A suggestion that spends money is ignored unless the brand sees exactly why it surfaced now and trusts it serves their goal, especially since the platform profits from more spend.",
          answers: "H5, H3",
          situation:
            "Google's recs are critiqued as optimized for Google's metrics, not the advertiser's; Amazon is candid that the suggested bid does not tell you what is profitable. Edge is first-party (a trust advantage) but that advantage is conditional on visibly serving the brand's goal, not Zepto's GMV.",
          task:
            "Make each money-moving suggestion legible, trustworthy, and safe to act on in one click.",
          action:
            "Prefer formula-backed derivable recs (Amazon: Recommended Budget equals Missed Clicks times CPC, to Rs X missed sales) over opaque scores; attach a predicted impact (Stackline); bundle what, why, how in one place (CommerceIQ) leading with the symptom (SRE); name the KPI plus why plus next action grounded in first-party data (Skai); an approve plus audit gate (Pacvue); state honest scope (ignores margin).",
          result:
            "Brands act because the derivation is visible, the upside quantified, the action reversible and auditable, and first-party trust holds because suggestions visibly serve the brand's goal.",
        },
        {
          problem:
            "P5, the role and altitude problem (the whitespace). A media buyer, a brand lead, and leadership need different framings of the same data, but incumbents differentiate only by permission and scope, so execs get operator noise and operators get exec abstraction.",
          answers: "H6, H7",
          situation:
            "Skai's Executive Copilot vs operator Budget Navigator and CommerceIQ's QBR-vs-operator reframing are the closest precedents; role differentiation across Google, Amazon, Meta is scope-based, not view-based. Verified whitespace.",
          task: "Render one data spine at three altitudes without rebuilding the data.",
          action:
            "Map roles to a Google-style altitude taxonomy (buyer equals Standard or act, brand lead equals Read-only or steer, leadership equals Email-only digest) plus a Meta-style portfolio-vs-asset scope; route each issue type to its owner (stock-out to supply chain, visibility to category manager, ROAS or SOV to ad team); operators get per-campaign drivers plus one-click fixes, brand leads the rolled-up goal-pace summary, leadership a low-frequency digest; a business waterfall for leaders vs raw score plus CI for analysts.",
          result:
            "Each role sees help pitched at their altitude on the same data, a feature no incumbent markets, a defensible wedge.",
        },
        {
          problem:
            "P6, the competitive-defense problem. GobbleCube, an external bot built by ex-Blinkit founders, already inside HUL, Tata, Reckitt, is building the AI optimization layer on top of Zepto Ads that Edge should own, binding ad automation to live stock and availability in a way generic Amazon-first tools do not.",
          answers: "H1, H2, H3, H5",
          situation:
            "q-commerce ad spend is doubling (about Rs 4,000 cr 2025 to about Rs 6,000 cr 2026, industry estimate); Zepto ad revenue scaling fast; GobbleCube has a 15M dollar Series A and about 2M dollar ARR in 9 months [VENDOR]. Zepto's own Atom and GPT is pull-only and stops at recommendations.",
          task:
            "Beat the external bot from the inside by closing the analytics-to-action loop with first-party fidelity and a trust boundary bots cannot cross.",
          action:
            "Steal GobbleCube's problem-ranking-over-dashboards, issue-type routing, and goal-based campaigns, but exploit Edge's first-party moat: PIN-code and minute-by-minute depth, one-click write-back into Zepto's auction, Meta's brand-owns-the-asset, bot-gets-scoped-Partner-access boundary, and live dark-store stock binding (the q-commerce-native edge Amazon-first tools lack). Fix Amazon's gap: make budget caps pace spend, not hard-stop.",
          result:
            "Edge becomes the proactive, action-closing, role-adaptive layer Atom and GPT stop short of and an external bot structurally cannot match, defending the optimization margin GobbleCube is funded to capture. Confidence: GobbleCube founding, funding, capabilities verified; the 2-to-3x and module specifics are [VENDOR].",
        },
      ],
    },

    {
      eyebrow: "IDEO · Step 4",
      id: "edge-ideas",
      title: "Generate ideas",
      summary:
        "Idea seeds tied to the problem statements. Divergent, not yet prioritized or scoped (that is the build-out PRD).",
      ideaSeeds: [
        "Brand-family object plus altitude-adaptive roll-up: model an HUL family via Criteo-style brand-ID mapping into one navigable tree (org, family, brand, SKU, campaign) with MCC-style weighted score roll-up; auto-detect brand shape so SMBs get a flat prescriptive surface and giants get the full tree; surface family-level moves via Concentrated-Contribution (these 3 SKUs equal 50 percent-plus of the move). Serves P1.",
        "Driver Waterfall card: on any metric move, auto-decompose across the brand's own dimensions into a significance-ranked contribution waterfall, with the issue type classified (stock-out, SOV, bidding, cannibalization) and confounders controlled (iROAS, base-vs-incremental); show strength plus CI plus confounder caveat inline. Serves P2.",
        "Goal-anchored proactive card schema: every suggestion carries a symptom-led headline, the driver and why, a predicted plus-X-percent toward the chosen goal, a formula derivation where money is involved, an honest scope (ignores margin), and a one-click approve-with-audit action; rank by uplift; the goal is an input that reshapes which cards generate. Serves P3 and P4.",
        "Two-tier, festival-aware cadence engine: interrupt only for actionable, threshold-exceeded, goal-visible events capped about 1 per day; digest the rest; seasonality-aware baselines tuned to Indian festival, payday, weather; exclude the last 1 to 2 unsettled days; group co-moving anomalies into one card; a 28 or 60-day dismissal cool-down; pace non-urgent cards to dashboard-open breakpoints and Zepto sale events. Serves P3.",
        "Three-altitude surfaces on one spine: operator equals per-campaign drivers plus one-click fixes plus continuous re-eval; brand lead equals rolled-up goal-pace summary (business waterfall); leadership equals a low-frequency Email-only-style executive digest; route each issue type to its owner. Serves P5.",
        "Pacing budget cap (better than Amazon): a portfolio or family budget control that paces spend over the period (festive windows) instead of hard-stopping when the cap is hit. Serves P1 and P6.",
        "Trust-boundary and moat layer: bake in brand-owns-the-asset, agencies-and-external-bots-get-scoped-Partner-access (Meta model) plus first-party one-click write-back into Zepto's auction plus live dark-store stock binding, the structural advantages an external bot cannot replicate. Serves P6.",
        "SOV-vs-campaign plus cannibalization detectors from first-party data: compute whether a ROAS dip is a bidding problem or a share-of-voice problem, and flag when sponsored placements undermine the brand's own organic, two defensible q-commerce-native correlations on data Zepto already owns. Serves P2.",
      ],
    },

    {
      eyebrow: "IDEO · Steps 5 to 7",
      id: "edge-next",
      title: "Next: make tangible, test, share",
      summary: "Per the team's instruction, the back half of IDEO comes later.",
      theSteps: [
        "5. Make ideas tangible: prototype the highest-leverage seeds. The coded Edge prototype (the Brand overview page) already prototypes seeds for driver and leak surfacing, goal-anchored cards, and brand context, a natural starting point. Decide which 2 to 3 problems (P1 to P6) to make tangible first.",
        "6. Test to learn: put tangible flows in front of real brand managers (the rollout cohort: top 20 to 40 brands by spend, KAM-in-the-loop) and an SMB long-tail sample; test the role-altitude split (P5) and the cadence engine (P3) hardest, since they are whitespace and risk.",
        "7. Share the story: fold the validated problems and ideas into the build-out PRD (Away and Dassh framework: Overview, Product pillars, System, Roadmap, Risks), with this doc as its discovery appendix.",
      ],
      decisionNeededToStartStep5:
        "Which of P1 to P6 are v1 vs later? Cross-reference the existing JARVIS v1 structuring cut: P2, P3, P4 align with the v1 in-flow-copilot-plus-alerts spine; P1 and P5 are the bigger, more novel bets.",
    },

    {
      eyebrow: "Appendix",
      id: "edge-sources",
      title: "Sources and how this was built",
      summary:
        "IDEO step 2 was a multi-agent deep-research workflow (6 domain agents plus paired verify agents plus a synthesis pass), mirroring the Away 13-agent PRD synthesis. 35 cited sources, grouped below.",
      confidenceNote:
        "Vendor performance claims (GobbleCube 2-to-3x, CommerceIQ 75, 55, 40, Blinkit 3.8x ROAS) are self-reported and not independently audited; tagged [VENDOR] inline.",
      sourcesByDomain: [
        {
          domain: "Account hierarchy and brand-family",
          sources: [
            "Amazon nested Manager Accounts (advertising.amazon.com/resources/whats-new/nested-manager-accounts)",
            "Amazon portfolios (tinuiti.com/blog/amazon/amazon-portfolio)",
            "Google MCC (support.google.com/google-ads/answer/7456530)",
            "Google access levels (support.google.com/google-ads/answer/9978556)",
            "Meta Business Portfolio (whitebunnie.com/blog/what-is-a-meta-business-portfolio)",
            "Criteo Retail Media campaign structure (developers.criteo.com/retail-media/docs/campaign-structure)",
          ],
        },
        {
          domain: "Retail-media tools",
          sources: [
            "Pacvue Agent (pacvue.com/newsroom/pacvue-launches-pacvue-agent)",
            "Pacvue optimization rules (pacvue.com/blog/overview-and-benefits-of-advertising-optimization-rules)",
            "CommerceIQ retail-media management (commerceiq.ai/retail-media-management)",
            "CommerceIQ Omni (commerceiq.ai/blog/omni-dashboard)",
            "CommerceIQ Amazon copilot (commerceiq.ai/amazon-copilot)",
            "Skai Celeste (skai.io/blog/celeste-ai and prnewswire.com Skai-launches-Celeste-AI)",
            "Stackline Beacon (stackline.com/beacon)",
          ],
        },
        {
          domain: "Correlation, driver, alerting",
          sources: [
            "Amplitude RCA (amplitude.com/docs/analytics/root-cause-analysis)",
            "Amplitude Compass (amplitude.com/docs/analytics/charts/compass/compass-interpret-1)",
            "Sisu Smart Waterfall (research.isg-one.com/analyst-perspectives/sisu-optimizes-analytics)",
            "Anodot correlation and anomaly (anodot.com/blog/correlation-analysis-anomaly-detection)",
            "PyMC-Marketing MMM causal ID (pymc-marketing.io mmm_causal_identification)",
            "Mixpanel anomaly and RCA (mixpanel.com/blog/anomaly-detection-custom-alerts-root-cause-analysis)",
            "Tableau Pulse insight types (help.tableau.com pulse_insights_platform_insight_types)",
            "Google SRE monitoring (sre.google/sre-book/monitoring-distributed-systems)",
            "Right-time HCI study (frontiersin.org fpsyg.2024.1465323)",
          ],
        },
        {
          domain: "Ad recommendations and goals",
          sources: [
            "Google Optimization Score (support.google.com/google-ads/answer/9061546)",
            "Google recommendations API (developers.google.com/google-ads/api/docs/recommendations)",
            "Google dismiss and cool-down (support.google.com/google-ads/answer/10169817)",
            "Amazon SP budget best-practices (advertising.amazon.com/library/guides/sponsored-products-budget-best-practices)",
            "Amazon SP best-practices (advertising.amazon.com/library/guides/sponsored-products-best-practices)",
            "Amazon marketing funnel (advertising.amazon.com/library/guides/marketing-funnel)",
          ],
        },
        {
          domain: "Indian quick-commerce and competitive",
          sources: [
            "GobbleCube 15M dollar raise (woodenscale.ai/blogs/gobblecube-ai-platform-raises-15m)",
            "GobbleCube analytics blog (gobblecube.ai/blog/journey-towards-simplifying-analytics-for-brands)",
            "GobbleCube products (gobblecube.ai/products)",
            "Zepto Atom launch (startuptalky.com/news/zepto-unveils-atom)",
            "Blinkit Brand Central (brands.blinkit.com)",
            "India ADEX and retail-media 2026 (bestmediainfo.com retail-media-and-ctv-to-power-indias-adex-in-2026)",
          ],
        },
        {
          domain: "Internal (Zepto project)",
          sources: [
            "JARVIS_MVP_Spec_and_Design_Plan.md, JARVIS_v1_Structuring.md (the v1 / v1.5 / v2 cut), JARVIS_MVP_Widget_System.md, JARVIS_Voice_and_Sample_Copy.md (name locked to Edge)",
            "The coded prototype Ads Proto Cluade (the Brand overview page prototypes several idea seeds)",
            "Full source: Active - Zepto/Ads & Strategy/JARVIS/PRD/2026-06-29_jarvis-edge-problem-framing-WIP.md",
          ],
        },
      ],
    },
  ],
};
