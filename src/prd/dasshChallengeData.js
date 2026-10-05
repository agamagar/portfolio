// AUTO-GENERATED from the dassh dashboard design-challenge workflow (judge panel +
// critic, verdict: ship), then hand-reviewed. The "designing the dashboard: show the job,
// not the machine" narrative (agent-perf vs job-perf misread -> correction -> per-persona
// resolution -> principle). Imported by dasshPrdData.js. Regenerate via scratchpad/gen-challenge.mjs.
// Style: no em-dashes/en-dashes (portfolio rule).

export const dashboardChallenge = {
  "eyebrow": "Design challenge",
  "id": "prd-dashboard-challenge",
  "title": "Designing the dashboard: show the job, not the machine",
  "wireframe": { "builder": "dashboardChallenge" },
  "summary": "The brief was deceptively simple: design one homepage for a platform where autonomous agents do most of the hiring, and make it work for five people who share nothing but the screen. A CEO who signed a cheque on a headcount number. A CHRO accountable for 240 reqs and 11 recruiters. Two recruiters who live in tables all day. And a candidate eight months into the black hole. On a platform where the work is done by agents, the obvious thing to show is the agents. That obvious thing was the trap.",
  "callout": {
    "label": "The principle",
    "body": "Show the job, not the machine: lead with the outcome the human is accountable for, and demote agent activity to a drill-down you open only when a job is off-track. When users ask for machine stats, they are usually reaching for a job truth no tool ever showed them."
  },
  "theMisread": "In every early interview the ask was the same: agent performance. How many CVs did the screening agent read, how accurate is it, how many calls did the calling agent connect, can I see a leaderboard of which agent is pulling its weight. It was seductive because it looked like exactly the right question for an AI product: concrete, countable, buildable tomorrow, since the metrics already existed in the Metrics Framework, throughput and quality and efficiency for every agent. The team felt the same pull from the build side, because agent activity is the easiest thing to instrument and the most impressive thing to demo. A grid of live counters looks like proof the product works. So the users and the makers reached for the same thing, and we very nearly shipped a control panel for the machines.",
  "theInterviewMoment": "It clicked in a session with Sneha, an in-house recruiter carrying eleven live reqs, sixty CVs before her chai went cold. She asked, almost dutifully, to see how many CVs the screening agent had processed overnight. So we mocked it and showed her the number: 47 screened across 5 reqs. She looked at it for a second, said \"okay,\" and then asked the question that reframed the whole product: \"But which of these do I actually need to look at? Is my Backend req going to close? If I forward this shortlist to that picky manager and one candidate is wrong, it's my name in the room, not the agent's.\" Every follow-up she had walked straight past the 47. The number of CVs screened was never the thing. It was the doorway she knocked on because no tool had ever once shown her the thing behind it: is this req going to close, and can I trust what it is handing me. She was asking about the machine because nobody had ever offered to show her the job.",
  "theCorrection": "We reframed the whole surface around one distinction: job performance is the end, agent performance is the means. Every one of the five people is accountable for a job outcome, is this role going to close, well, fast, and fairly, am I losing good people, will I make my number, not for how busy the AI was. So the dashboard leads with the job outcome each person owns, in their own register, and agent performance stops being a headline. It becomes a drill-down you open only when a job is off-track and you want to know which agent to tune. Nobody opens the calling agent's connect rate because it is Tuesday. They open it because a role went cold and they need to know why. Agent stats became the answer to \"why,\" reachable in a tap, not the headline you have to decode first.",
  "howWeSolvedPerPerson": [
    {
      "persona": "Aditya Rao, CEO",
      "leadsWithTheJob": "One chief-of-staff sentence he could read to his board: on track for 300 by Q4, cost-per-hire down 22 percent, quality holding, humans owned 94 percent of the calls, one role needs you. The verdict on the talent bet, in money and trust.",
      "agentStatsDemotedTo": "Gone entirely from his view. He never sees an agent counter. The only time agent behavior surfaces is a 'what's broken' alert, screening rejecting at 80 percent against a 45 percent norm, and even then it arrives as the reason a job is at risk, already naming the human who owns the fix."
    },
    {
      "persona": "Aparna Rao, VP of TA / CHRO",
      "leadsWithTheJob": "Honest funnel health across 240 reqs, a recruiter win named first, load and strain across her 11 recruiters, and a fairness trail she can stand behind: Kavya closed Risk Analyst in 19 days, the team made 3 hires, the agents took roughly 140 hours of grunt work off their plates.",
      "agentStatsDemotedTo": "A trust-and-defensibility drill-down: the explainability and consent log per decision, agent recommended, recruiter confirmed, pulled only when the audit asks or a req slips. Never an agent-throughput leaderboard on the home surface."
    },
    {
      "persona": "Sneha Krishnan, in-house recruiter",
      "leadsWithTheJob": "Her reqs' health plus the shortlists that need her judgment today: 8 strong matches across 5 reqs, nothing sent without her, here is what needs her call. The night's screening framed as labor already removed, not as the agents being busy.",
      "agentStatsDemotedTo": "The agent's reasoning becomes the trust drill-down behind each shortlisted candidate: match score, skill and experience breakdown, gap analysis, one tap in when she needs to defend a pick and one tap to override, invisible when she doesn't."
    },
    {
      "persona": "Farheen Qureshi, agency recruiter",
      "leadsWithTheJob": "Ranked cross-client triage: which 3 of her 14 roles will move a placement today, which shortlist is ready to send first before a rival agency wakes up, which role just went cold, kept in separate per-client lanes so she never crosses data.",
      "agentStatsDemotedTo": "Overnight agent work is stated once as labor removed, 'screened 86 CVs, shortlist ready, you're first to submit,' and per-agent detail lives one level down on the job, opened only to diagnose a stalled role behind a 'what's broken' flag."
    },
    {
      "persona": "Ananya Reddy, candidate",
      "leadsWithTheJob": "Where she stands with a real date and a human behind it: through screening at Lumio, next a 15-minute call a recruiter reviews, and 'you'll hear either way.' A job of one, told plainly.",
      "agentStatsDemotedTo": "No agent metric at all, ever. She never sees a score, a throughput number, or a model detail. The only thing surfaced is her own status and the promise that a person owns the verdict."
    }
  ],
  "whatItChanged": [
    "The homepage became a generated briefing that leads with the job outcome and the person's name, not a static grid of agent counters.",
    "Agent scorecards moved out of the headline into collapsed Level 2 cards and a Level 3 detail view, reachable in one or two taps but opened only to diagnose an off-track job or verify a recommendation. The only agent trace left at Level 1 is a running/paused status chip.",
    "Each of the five people gets a different job-outcome headline in their own register from the same underlying data, and agent activity is demoted differently per role: gone for the CEO and candidate, a trust-proof for the CHRO, a per-decision drill-down for the two recruiters.",
    "The candidate view was stripped of every agent metric, leaving only her status, a real date, and the promise that a human owns the call."
  ],
  "grounding": [
    "The Metrics Framework encodes the correction as a display hierarchy, not a preference. Level 1, the Job Dashboard, is always visible and holds five numbers: total candidates, pipeline health (green/amber/red), pending actions, days active, and active agents shown only as a status chip (running/paused/completed), never as throughput. The per-agent throughput, quality, and efficiency numbers sit at Level 2 (agent cards, collapsed by default), Level 3 (agent detail on click), and Level 4 (analytics). Job truth sits structurally above agent activity by design, and the one place an agent appears up top is a state light, not a scoreboard.",
    "The Daily Report answers 'what's broken / what needs you / what happened' about the job and the humans, in that order of urgency. Agent activity appears only inside 'what happened,' the Awareness tier, deliberately last, after the two sections about job outcomes and human decisions. It never asks or answers how busy the AI was.",
    "The north-star metric is Trusted Autonomous Advances, a job-plus-trust outcome, explicitly not agent throughput. The governing rules force the framing: agents are judged by labor removed (a job outcome), and the human owns the verdict, so the drill-down exists to let a person inspect and override an agent, never to celebrate its activity.",
    "The persona matrix locks each person's 'leads with' as an outcome, and not one leads with agent output: the CEO's verdict in money and trust, the CHRO's function as a story with fairness proof quiet, Sneha's judgment with screening framed as labor removed, Farheen's ranked triage, Ananya's presence and a promise."
  ],
  "sources": [
    "Dassh - Metrics Framework.md (Metric Display Hierarchy: Level 1 Job Dashboard, five numbers incl. active-agents status chip -> Level 2 Agent Cards collapsed -> Level 3 Agent Detail -> Level 4 Analytics)",
    " what happened; agent activity last under Awareness; persona tailoring)",
    "Dassh - Architecture.md (four interface altitudes and the personas)",
    "dasshPersonaData.js (personaMatrix, personaJourneys, dailyReportFirstViews, belongingThesis)",
    "awayPrdData.js (voice and quality bar)"
  ]
};
