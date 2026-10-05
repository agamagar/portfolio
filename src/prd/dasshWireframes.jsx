// Registry of wireframe animations embedded in the Dassh PRD, in explanation
// order. Passed to PrdRenderer via the `builders` prop; a PRD field valued
// { builder: "<key>" } renders the matching animation as the section's hero.
// Reuses the case-study FFF figures where they map; new PRD-specific ones live
// in ./wireframes. Framework: Claude/animation-base-layer.md §11 (Frozen-Frame Focal).
import AgentWizardFFF from "../figures/agentWizard/AgentWizardFFF";
import DailyReport from "../figures/concepts/DailyReport";
import FigmaToCode from "../figures/concepts/FigmaToCode";
import EvolutionTimeline from "../figures/concepts/EvolutionTimeline";
import AgentPillar from "./wireframes/AgentPillar";
import CallJourney from "../figures/concepts/CallJourney";
import DashboardChallenge from "./wireframes/DashboardChallenge";
import OverviewWedge from "./wireframes/OverviewWedge";
import PersonaAltitudes from "./wireframes/PersonaAltitudes";

// Every non-Screening agent shares one shape: input -> the agent runs -> output +
// a metric. One parameterized wireframe, configured per agent. Counts are
// illustrative wireframe placeholders, not measured outcomes.
const AGENT = {
  calling:    { slug: "agents/calling",    name: "Calling",    inputLabel: "Candidates + call script",  outputLabel: "Transcripts + fit scores",   metric: { value: 48, label: "called" } },
  interview:  { slug: "agents/interview",  name: "Interview",  inputLabel: "Shortlist + rubric",        outputLabel: "Structured feedback",        metric: { value: 26, label: "interviewed" } },
  assessment: { slug: "agents/assessment", name: "Assessment", inputLabel: "Candidates + test",         outputLabel: "Graded results",             metric: { value: 31, label: "assessed" } },
  sourcing:   { slug: "agents/sourcing",   name: "Sourcing",   inputLabel: "Role + channels",           outputLabel: "Matched profiles",           metric: { value: 120, label: "sourced" } },
  scheduling: { slug: "agents/scheduling", name: "Scheduling", inputLabel: "Panel + open slots",         outputLabel: "Booked calls",               metric: { value: 40, label: "scheduled" } },
  whatsapp:   { slug: "agents/whatsapp",   name: "WhatsApp",   inputLabel: "Candidates + template",     outputLabel: "Replies handled",            metric: { value: 88, label: "messaged" } },
  mailer:     { slug: "agents/mailer",     name: "Mailer",     inputLabel: "List + sequence",           outputLabel: "Sent + opened",              metric: { value: 210, label: "emailed" } },
  notetaker:  { slug: "agents/notetaker",  name: "Notetaker",  inputLabel: "Call audio",                outputLabel: "Notes + action items",       metric: { value: 34, label: "summarized" } },
};
const agentPillar = (key) => function AgentPillarBound() { return <AgentPillar cfg={AGENT[key]} />; };

export const dasshWireframes = {
  // — new: overview + personas bookends (explanation order) —
  overviewWedge: OverviewWedge,        // Overview: disconnected tools -> one teammate
  personaAltitudes: PersonaAltitudes,  // Personas: one job read at four altitudes

  // — reused case-study figures —
  screeningWizard: AgentWizardFFF,     // Pillar A: the 4-step screening wizard
  dailyReport: DailyReport,            // The Daily Report: broken / needs you / happened
  dashboardChallenge: DashboardChallenge, // Design challenge: the machine reframed as the job
  sdsMigration: FigmaToCode,           // Foundations: SDS, Figma -> production code
  callJourney: CallJourney,            // Research: the candidate journey + the cliff at engage (10 of 43, recounted)
  roadmapEvolution: EvolutionTimeline, // Roadmap: capabilities growing v1 -> v2 -> north-star

  // — the rest of the agent fabric (Pillars B-I), one shared parameterized shape —
  callingAgent: agentPillar("calling"),
  interviewAgent: agentPillar("interview"),
  assessmentAgent: agentPillar("assessment"),
  sourcingAgent: agentPillar("sourcing"),
  schedulingAgent: agentPillar("scheduling"),
  whatsappAgent: agentPillar("whatsapp"),
  mailerAgent: agentPillar("mailer"),
  notetakerAgent: agentPillar("notetaker"),
};
