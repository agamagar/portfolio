// The Dassh PRD content, synthesized from the Dassh product docs (Agent Creation
// PRD, Architecture, Metrics Framework, Daily Report Concept) into the same shape
// the Away PRD uses, so it renders as native portfolio DOM via PrdRenderer.
// WIP / Draft v0.1. [GAP] marks business/funding/GTM content not yet in context;
// [UNVERIFIED] marks public claims to confirm before external use. No em-dashes
// (portfolio rule): commas/periods instead.
import { personaMatrix, personaJourneys, belongingThesis, dailyReportFirstViews, deepenedPillars } from "./dasshPersonaData";
import { dashboardChallenge } from "./dasshChallengeData";

export const dasshPrdData = {
  synthesis: {
    oneLiner:
      "Stella, the recruiter who's already done the screening. Dassh replaces hiring workflows with a job-anchored fabric of autonomous agents on one shared candidate spine.",
    wireframe: { builder: "overviewWedge" },
    execSummary:
      "Dassh is an AI-native recruitment platform where hiring is executed by purpose-built agents instead of operated through tools. At its center is Stella, an AI recruiter. The thesis, in the founders' words: recruiters don't need another tool, they need a teammate. Everything anchors to a Job, the atomic unit of the platform. Within a job, autonomous agents each own one discrete step of the pipeline (Screening, Calling, Interview, Assessment, Sourcing, Scheduling, WhatsApp, Mailer, Notetaker): they receive input, execute a task, produce an evaluation, and trigger the next action. The human's job shrinks from doing the work to deciding on the work the agents have already done. The same job-and-candidate spine is presented through four purpose-built experiences (chat-first Stella, dense SaaS, summary-first smart view, candidate portal), so each persona meets the product at their own altitude. The most-developed surface today is the CV Screening agent and its 4-step creation wizard, plus the Daily Report homepage. The front-end is fully migrated onto the Stella Design System (SDS) with a green production build.",
    theWedge:
      "The defensible point is not 'AI in recruiting' (everyone claims it). It is the teammate framing made literal: an org-wide, job-anchored fabric of autonomous agents on one shared candidate spine, where each pipeline step is a teammate that does the work and hands off, not a feature you operate. The product earns its place by the work it removes, not the screens it adds.",
    twoGoverningRules: [
      "Teammate, not tool. Agents do the work and hand off; the product is judged by labor removed, not features shipped. A screen that adds a step the user must operate is suspect.",
      "The human owns the verdict. Agents screen, score, and recommend with full transparency (match score, skill and experience breakdown, gap analysis, priority ranking); a human confirms consequential decisions (shortlist, reject, interview, offer). Trust is earned by being legible and easy to override, never by hiding the reasoning.",
      "Architecture invariant: the Job is the atom. Every agent, candidate, metric, and report rolls up to a Job.",
    ],
    northStarMetric:
      "Proposed (WIP): Trusted autonomous advances, the share of candidate stage-advances an agent made (screen to shortlist, call to advance) that the human accepts without override. High means the teammate is trusted; it is the inverse of the revert rate. Paired with time-to-first-qualified-shortlist so trust is never bought with slowness. Alternatives to weigh: time-to-hire collapse; share of a job's pipeline progressed with zero human touch until the decision gate. Decision open, to confirm with founders. [GAP: no north-star defined in source docs.]",
    whyNowProblem:
      "Setting up a hiring pipeline today means stitching together disconnected tools: an ATS for tracking, spreadsheets for criteria, calendar tools for scheduling, email and WhatsApp for outreach. Every handoff adds delay, inconsistency, and dropped context. Recruiters spend more time configuring tools and shuffling candidates between stages than evaluating talent. The result is slow pipelines, inconsistent screening, and lost candidates. Why now: agentic AI can finally do the discrete jobs (read a CV against a rubric, hold a phone screen, run an L1 interview, draft the follow-up) at a quality and cost that makes the teammate framing real rather than aspirational.",
    visionPrinciples: [
      "Vision: make hiring as simple as defining what you're looking for and letting agents do the rest. The agent-creation flow is the front door; it should feel like briefing a smart colleague.",
      "Progressive disclosure: reveal complexity gradually (the 4-step wizard), don't dump every option up front.",
      "Flexible input: every step supports multiple paths (have a checklist / generate one with AI / upload one; CVs in a folder / connect an ATS / pull from talent pool).",
      "Opinionated defaults, full control: smart defaults (AI checklists, recommended automations) with full power-user customization underneath.",
      "Connect, don't recreate: pull from where jobs, candidates, and data already live (ATS, drives, databases) rather than re-asking.",
    ],
    forInvestors:
      "[GAP, needs founder input] The investable story is the teammate fabric: as more agent types ship on the shared job spine, each new agent compounds the value of the others (a Screening agent's output is a Calling agent's input is an Interview agent's input), and the org's accumulated criteria, talent pool, and decision history become a switching-cost moat. Funding, traction, revenue, and commercial outcomes are not in context. Do not present an investor narrative on top of this until founders fill it in.",
  },

  pillars: [
    {
      key: "screening",
      title: "Screening agent",
      oneLiner:
        "Evaluates CVs against a defined checklist. The most-developed flow and the reference pattern for every other agent.",
      wireframe: { builder: "screeningWizard" },
      lockedDecisions: [
        "Creation is a 4-step linear wizard with a left vertical stepper.",
        "Step 1, CV Screening Group: link a job (Select job / Custom group / Import from ATS), name and describe the group, choose checklist type (Preset / AI-generated / Upload).",
        "Step 2, Candidate Checklist: criteria in category tabs (Overall, CV Detail, Education, Experience, Responsibility, Technical); each item has a priority tag (Essential / Valuable / Not preferred), a note field, hide and reorder; a global checklist is shared across groups by default; refine via natural language ('Edit your checklist with AI').",
        "Step 3, Upload Candidates: Upload Files / Contact group / Connect ATS / Talent pool (PDF, Doc, DocX, Zip, PNG, JPEG); shows a match count ('42 Matching Candidates Found').",
        "Step 4, Automations: Smart move and Auto-shortlist toggles (off by default), then 'Start screening agent'.",
      ],
      requirements: [
        "Three input paths per applicable step (have-it / generate-it / upload-it).",
        "Inline validation on Next.",
        "AI-standardization banner ('Dassh AI has standardised the list...') with a revert warning.",
        "Hidden-items section ('these are not considered during evaluation').",
        "Footer actions: save-as-preset, import-template, add-a-reviewer.",
      ],
      keySurfaces: [
        "The 4-step wizard (centered ~1132px card in a 1440px viewport, single scrollable stepper).",
        "Job-detail screening-agent card.",
        "Agent detail with match distribution and score histogram.",
      ],
      moat: [
        "Legible evaluation: every decision ships with match score, skill breakdown, experience breakdown, gap analysis, and priority ranking, making the agent trustworthy and override-friendly (governing rule 2).",
        "The global/shared checklist turns one org's evaluation standards into reusable, compounding IP.",
      ],
      v1: "The screening agent + 4-step wizard, live. CV evaluation with full breakdown.",
      v2: "Checklist versioning + inheritance; reviewer workflow; criteria-discrimination insights.",
      northStar:
        "Screening so trusted that auto-shortlist runs by default with near-zero revert.",
      metrics: [
        "Throughput: CVs processed / remaining / completion %.",
        "Quality: match distribution, shortlist rate, checklist hit rate, essential-criteria coverage, flag rate.",
        "Efficiency: avg time per CV, total processing time, ETA.",
        "Unique: criteria usage, score distribution, revert rate (feeds the north-star).",
      ],
      openQuestions: [
        "Checklist versioning: inherit vs. pin?",
        "Candidate dedup across upload + ATS + talent pool?",
        "Post-launch editing of a running agent?",
        "Agency multi-client permissions and data isolation?",
      ],
      risks: [
        "Accuracy feedback-loop delay: you only know the agent was 'right' after the candidate progresses.",
        "Over-strict criteria causing silent drop-off spikes.",
        "Unverified public accuracy claims carry reputational risk.",
      ],
      sources: [
        "Dassh - Agent Creation PRD.md (primary product source).",
        "Dassh - Metrics Framework.md.",
      ],
    },

    // The rest of the fabric: deepened via the dassh-pillars-deepen workflow (still
    // Planned work, flagged as sensible-default not validated design). See dasshPersonaData.
    ...deepenedPillars,
  ],

  // Five role personas as a comparison matrix (the 4 interface modes are folded in
  // via personaMatrix.interfaceNote). Built from the dassh-personas-enrich workflow.
  personaMatrix,

  // Per-persona journey arcs (emotion dips then recovers), with pain + delight beats.
  journeys: personaJourneys,

  specs: [
    // The dashboard design-challenge narrative (agent-perf vs job-perf misread + fix).
    // Leads the System area, setting up the Daily Report.
    dashboardChallenge,
    {
      eyebrow: "Research",
      id: "prd-call-research",
      title: "Field research: the calling agent (Zydus + the 43-call collision study)",
      summary:
        "The calling agent is the one pillar whose design decisions are backed by primary field research: persona-tuned call flows learned at Zydus, and a 43-call mixed-method study for a tech-recruiting deployment that reframed every candidate as a user of the calling experience. Research base: about 300 people across the pilots; the 43-call log is the deep-coded instrument inside it. Ownership: Agam owned the research and the UX end to end (engineering owned the calling stack). Outcome: every recommendation shipped and screening-call completion climbed to 71%. Sources: Claude/dassh-call-research-collision-study.docx + R5/R6 in dassh-user-requirements.md. Candidate details anonymized (source log is confidential).",
      wireframe: { builder: "callJourney" },
      callout: {
        label: "The headline finding",
        body:
          "The dominant failure mode is the system breaking, not candidates saying no. 15 of 43 calls carry the raw INCOMPLETE status (34.9%), but 5 of those are coded no-answer, so the defensible figure is 10 of 43, about a quarter, that connected and then died before any screening question was asked. Three carry verbatim recruiter notes proving the candidate had engaged. Mechanism: production voice-AI latency of 1.4 to 1.7 seconds median against the roughly 200ms humans expect; past about a second of dead air people decide the call is broken and hang up. The journey fails at engage, inside our own system, right after the candidate did the hard part of answering.",
      },
      whatZydusTaught: [
        "Pickup is a timing problem, not a pitch problem: abysmal pickup rates improved substantially once calls moved to each persona's reachable hours (directional, exact lift unlogged).",
        "Reachability is persona-dependent: a factory worker and a mid-manager answer at different hours; Zydus hiring spans that full spectrum, with AI calls needed most for factory workers.",
        "Completion cracked only with per-persona conversation flows: some people need to be greeted and warmed up first, others want the point straight away; one script cannot serve both.",
        "Language is woven, not switched: Ahmedabad hires speak Gujarati or Gujarati plus English, so flows carry little bits of Gujarati inside the conversation.",
        "The house rule this minted: the agent is only as good as the user research behind it. Timeline: a POC of about 2 weeks, about a month more of research, then design.",
      ],
      theStudy: [
        "Primary: a 43-call field log (25 Oct to 3 Nov 2025, 39 unique numbers), every outcome coded into six mutually exclusive candidate-experience categories, recruiter notes kept as the qualitative spine.",
        "Secondary: literature scan across voice-AI latency benchmarks, caller-ID/spam screening, TRAI regulation, and dialer concurrency, so the small sample is corroborated from two sides.",
        "Projections: pilot base rates applied to 300/500/1,000-candidate campaigns with explicit 95% bands; at 1,000, about 350 dead-air experiences and about 90 duplicate dials, all avoidable.",
        "Two senses of 300, keep them distinct: about 300 people is the BASE research pool across the pilots (confirmed by Agam); the 300/500/1,000 figures in the report are campaign projection tiers computed from the 43-call coded sample.",
      ],
      theFourCollisions: [
        "Duplicate/repeat-dial: a 9% duplicate rate, one candidate dialled 3x in a week; reads as harassment, drives spam-flagging. Fix: a hard dedup lock per candidate per campaign window.",
        "Concurrency: dialling past real backend throughput converts extra calls into dead-air collapses; the collapse rate is a floor, not a constant. Fix: a global concurrency cap paced to latency.",
        "Scheduling: calls landing at the wrong moment (festivals, meetings) prime rejection, and TRAI bounds everything to a 9AM to 9PM window. Fix: honour stated preferences, pace across days.",
        "Data/identity: schema drift and duplicate identities produce mispersonalised openings, including a name the agent could not pronounce with no fallback. Fix: phonetic-name field or a name-free greeting.",
      ],
      trustSignals: [
        "A candidate on the brand: 'always calls but never follows up with real opportunities', in a market averaging 16.8 spam calls per person per month, empty check-ins become spam.",
        "Silent call-screening hides the true decline rate: screened candidates are logged as unresponsive, so the system undercounts its own exclusion.",
        "At least one clearly interested candidate was lost to a system bug, not disinterest.",
      ],
      whatItChangedInTheDesign: [
        "The calling pillar's consent-first, disclosure-first script block and calling-window guard are the study's regulatory findings shipped as defaults (TRAI: DLT, 140-series, 9AM to 9PM, mandatory AI disclosure under the 2025-26 amendments).",
        "Recovery out loud, never dead air: the 'Are you still there?' repair line, designed three failures deep, targets the single failure that loses the most reachable, willing candidates.",
        "The WHAT/HOW customisation split (recruiter owns questions/criteria/language mix; system owns disclosure, pacing, repair, close) exists so no configuration can reintroduce the harms the study measured.",
        "Instrument the next run: latency, collapse reason, screening detection, and a disposition on every call, the projection bands are wide because the pilot was not instrumented.",
        "The outcome: everything above shipped (recovery lines, dedup lock, concurrency cap, compliance stack), and screening-call COMPLETION climbed to 71%, measured over CONNECTED calls (seven of ten connected candidates finish the whole screen), up from 35 to 40%. The pilot connect rate of about 4 in 10 dials is a separate measure with a separate denominator and must never be stated in the same breath.",
      ],
      sources: [
        "Claude/dassh-call-research-collision-study.docx (the full study; confidential candidate log).",
        "Claude/dassh-cmu-source-material.md (the Zydus arc as told + fidelity flags).",
        "Claude/dassh-user-requirements.md, R5 + R6.",
      ],
    },
    {
      eyebrow: "System",
      id: "prd-daily-report",
      title: "The Daily Report (signature surface)",
      summary:
        "The homepage IS the report. Not a static dashboard; a generated briefing, different every visit, reflecting what changed since you were last here. The hero of the eventual interactive build.",
      wireframe: { builder: "dailyReport" },
      callout: { label: "The belonging thesis", body: belongingThesis },
      whatEachPersonaSeesFirst: dailyReportFirstViews,
      answersThreeQuestions: [
        "What's broken? Anomalies first: stalled pipelines, agent failures, drop-off spikes, SLA breaches, integration issues. Zero anomalies shows a clean 'All clear', never filler.",
        "What needs you? Human-decision gates (shortlist review, interview approval, offer decision, agent input, client feedback), each resolvable in 1-2 taps from the report.",
        "What happened? The momentum report: agent activity, pipeline movement, per-job health (green/amber/red). The satisfying scroll that builds trust.",
      ],
      sameDataThreeAltitudes: [
        "Agency: dense, numbers-forward, exportable.",
        "Mid-manager: AI-narrative + health cards.",
        "Stella: conversational catch-up.",
      ],
      delivery: ["Homepage (primary)", "8am email digest", "WhatsApp headlines from Stella"],
      openQuestions: [
        "'Since last visit' vs. fixed daily cadence?",
        "Report history, sharing (with auto-redaction?), and customization?",
        "How aggressive should Stella be on WhatsApp?",
      ],
      sources: ["Dassh - Daily Report Concept.md"],
    },
    {
      eyebrow: "System",
      id: "prd-foundations",
      title: "The agent fabric + foundations",
      summary:
        "Where Away's system pillar is its generative-UI engine, Dassh's is the agent orchestration fabric plus Stella as the conversational engine that composes views and takes actions in natural language.",
      wireframe: { builder: "sdsMigration" },
      informationHierarchy:
        "Organization (Agency/Company) to Workspace to Client/Department to Job to {Agents, Candidates, Pipeline, Reports}. The Job is the atom.",
      coreDataModel: [
        "Organization, Workspace, User (with persona_type), Job, Agent, Candidate, Application (joins Candidate to Job), Evaluation, Automation, Integration.",
      ],
      integrations: [
        "ATS: Workday, Darwinbox, Greenhouse, Lever.",
        "Comms: WhatsApp Business API, SendGrid/SES, Twilio.",
        "Storage: Drive, OneDrive, S3. Calendar: Google, Outlook.",
        "Assessment: HackerRank, Codility. Internal talent pool/DB.",
      ],
      designSystem:
        "SDS (Stella Design System): front-end fully migrated off Mantine onto SDS across ~297 files with a green production build (tsc 0 errors, next build passes, prod SSR verified). Token layer standardized; login on SDS primitives; light-lock built; Mantine layout primitives retained (no SDS equivalents). Canonical front-end: dashboard-v2-review (dassh-portal).",
      openQuestions: [
        "Multi-tenancy: client-as-workspace vs. client-as-tag (billing + isolation).",
        "Orchestration handoff: who triggers Screening to Calling to Interview, a Workflow agent, automations, or an orchestration layer?",
        "Stella's permission scope: same as the user, or its own model?",
        "Persona view switching: fixed per role, or switchable?",
        "Candidate identity across jobs/agencies: global record vs. isolated application?",
      ],
      sources: ["Dassh - Architecture.md", "Dassh - Metrics Framework.md", "CONTEXT.md + sds-* notes"],
    },
    {
      eyebrow: "Business",
      id: "prd-business",
      title: "Business, roadmap, risks",
      summary:
        "Business material is largely not in context. Treat the items below as a scaffold to fill with founders, not as fact.",
      wireframe: { builder: "roadmapEvolution" },
      business: [
        "Monetization: [GAP], no pricing/credits model in context (metrics docs mention a possible cost-per-stage / agency client-billing concept, nothing decided).",
        "GTM: [GAP], no go-to-market plan in context.",
        "Customers/pilots (confirmed for public use by Agam, 2026-07-05; mention sparingly): Zydus, Increff, Cholamandalam, HCPL, Atomberg, Tophire. A Zydus demo exists.",
        "Team in context: Agam Agarwal (Product & Design, doc author); Harshit Modi, Shivansh, Aniruddh (Engineering).",
      ],
      roadmap: [
        "v1 (now): Screening agent + wizard live; CV evaluation with breakdown; Daily Report concept; SDS migration complete, prod build green.",
        "v2 (next): Calling, Interview, Workflow agents; per-agent creation flows; checklist versioning + reviewer; Smart and Stella views fleshed out; multi-agent handoff; Stella in-chat actions; email + WhatsApp report delivery; pricing/credits.",
        "North-star: full agent fabric (Assessment, Sourcing, Scheduling, WhatsApp, Mailer, Notetaker); candidate portal; trusted auto-advance by default; org-wide compounding moat.",
      ],
      topRisks: [
        "Trust feedback-loop delay (screening correctness only knowable after candidates progress).",
        "Over-automation eroding the verdict (illegible advances break governing rule 2).",
        "Multi-tenancy / data isolation for agencies.",
        "Orchestration handoff undecided.",
        "Unverified public claims (accuracy/throughput, customer names).",
      ],
      honestGaps: [
        "Business / funding / GTM / pricing: [GAP], the biggest hole.",
        "North-star metric: proposed, not confirmed.",
        "Per-agent creation flows (beyond Screening): undesigned.",
        "Persona view-switching model and Stella's permission scope: undecided.",
      ],
      sources: ["Dassh_Full_Context_Dump.md", "Dassh - Metrics Framework.md", "CONTEXT.md"],
    },
  ],
};
