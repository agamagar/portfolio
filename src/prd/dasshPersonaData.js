// AUTO-GENERATED from the dassh-personas-enrich + dassh-pillars-deepen workflows,
// then hand-reviewed against the adversarial critic. Source of truth for the persona
// MATRIX, JOURNEYS, the Daily Report belonging content, and the DEEPENED agent pillars
// on the Dassh PRD. Imported by dasshPrdData.js. Regenerate via scratchpad/gen-final-data.mjs.
// Style: no em-dashes/en-dashes (portfolio rule).

export const personaMatrix = {
  "wireframe": { "builder": "personaAltitudes" },
  "lead": "Dassh serves five people who never see hiring the same way: the CEO who signed the cheque on a number, the CHRO accountable for every figure and every recruiter, the in-house operator drowning in CVs, the agency closer racing two rival firms, and the candidate eight months into the black hole. Each carries a different fear and a different definition of winning, yet they share one daily surface. The thesis of this section is that the Daily Report should make every one of them feel not just faster but seen: joy and belonging, not only efficiency.",
  "interfaceNote": "The five roles map cleanly onto Dassh's four altitudes, with one shared by design. Aditya the CEO and Aparna the CHRO both live in the Smart view, the summary-first Daily Report of AI-written health cards, because they check in and decide rather than operate; Aparna drops one level into the dense SaaS dashboard when she needs to drill into a slipping req or pull board-grade numbers herself, and Aditya occasionally asks Stella a question over WhatsApp. Sneha the in-house recruiter and Farheen the agency recruiter both live in the dense SaaS power-user view, tables, filters, bulk approve, keyboard speed, for eight-plus hours a day, reaching into Stella's chat for quick actions and catch-up briefings between meetings. Ananya the candidate lives in the candidate portal plus the agent touchpoints, WhatsApp, email, call and assessment links, since she has no dashboard to manage, only her own single application to track. The chat-first Stella altitude is not one persona's home but a thread that runs through all of them.",
  "dimensions": [
    {
      "key": "role",
      "label": "Role & context"
    },
    {
      "key": "thought",
      "label": "Thought process"
    },
    {
      "key": "jobs",
      "label": "Core job (JTBD)"
    },
    {
      "key": "pain",
      "label": "Top pain"
    },
    {
      "key": "wantToSee",
      "label": "Wants to see"
    },
    {
      "key": "delight",
      "label": "Delight / belonging"
    },
    {
      "key": "fear",
      "label": "Biggest fear"
    },
    {
      "key": "success",
      "label": "Success looks like"
    },
    {
      "key": "interface",
      "label": "Interface altitude"
    },
    {
      "key": "leadsWith",
      "label": "Dassh leads with"
    }
  ],
  "columns": [
    {
      "key": "economic-buyer-ceo",
      "name": "Aditya Rao",
      "archetype": "The Accountable Optimist",
      "cells": {
        "role": "42, B2B SaaS CEO post Series B, scaling 180 to 300 in 18 months. Signs cheques, never operates.",
        "thought": "Every hire is capital allocated; judge the AI like a delegate. Show outcome, prove no corner cut.",
        "jobs": "Give me one defensible board-ready answer on whether we're winning the talent bet.",
        "pain": "Finds out hiring is behind only when a launch slips; three tools, three different numbers.",
        "wantToSee": "One chief-of-staff sentence: on track, spend down, quality holding, humans owned the calls.",
        "delight": "A board line already written; a milestone naming Meera, his 40th hire, not a metric.",
        "fear": "They hire fast and wrong, and his name walks a 40-lakh mistake to the board.",
        "success": "Walks into the board already knowing the hiring story is good, never had to dig.",
        "interface": "Smart view Daily Report, plus the odd WhatsApp question to Stella.",
        "leadsWith": "The verdict in money and trust, one sentence he could read aloud to his board."
      }
    },
    {
      "key": "chro-head-of-ta",
      "name": "Aparna Rao",
      "archetype": "The Steward Under Audit",
      "cells": {
        "role": "47, VP of TA at 6,000-person Bengaluru enterprise. 240 reqs, 11 recruiters, monthly board deck.",
        "thought": "I think in funnels and SLAs, but every number is also a person. Defensible story or new liability.",
        "jobs": "Show my team is winning without breaking, and that I can defend every agent decision in my name.",
        "pain": "Recruiters carry 30 reqs each; she gets no burnout signal, only the resignation email.",
        "wantToSee": "Honest funnel health across 240 reqs, recruiter strain, board story, DPDP fairness trail.",
        "delight": "Report opens with Kavya's win and load rebalancing framed as care, not surveillance.",
        "fear": "An AI shortlist she approved turns out biased or non-consented; her name on the approval.",
        "success": "Board review with time-to-hire down, fairness trail intact, team hiring more while saner.",
        "interface": "Smart view first, drops into SaaS dashboard for a slipping req or board numbers.",
        "leadsWith": "The state of her function as a story she can stand behind; fairness proof present but quiet."
      }
    },
    {
      "key": "in-house-recruiter",
      "name": "Sneha Krishnan",
      "archetype": "The Amplified Operator",
      "cells": {
        "role": "31, TA Specialist on a four-person team, 900-person Bangalore SaaS. 11 to 14 live reqs.",
        "thought": "I think in reqs, not features. My instinct on AI is suspicion: show me why before I sign my name.",
        "jobs": "Walk in already knowing the 8 CVs worth my time, with reasoning I can defend to managers.",
        "pain": "60+ CVs a morning; she triages until noon and real evaluation never gets a calm hour.",
        "wantToSee": "Per-req shortlists with match reasoning, a 'what needs you today' list, revert on every pick.",
        "delight": "Named as decider not operator; her counteroffer save credited as her 4th hire.",
        "fear": "'AI does the screening' ends with 'so we need fewer recruiters,' and she's one of four.",
        "success": "By 9:30 she's confirmed three shortlists, raised one stalling req, bought back her morning.",
        "interface": "Dense SaaS power view 8+ hours daily, plus Stella chat for quick actions.",
        "leadsWith": "Her judgment, not the agents' output: morning's screening framed as labor already removed."
      }
    },
    {
      "key": "agency-recruiter",
      "name": "Farheen Qureshi",
      "archetype": "The Multi-Client Closer",
      "cells": {
        "role": "31, senior recruiter at Bangalore IT staffing firm. 14 live reqs, 5 clients, half-incentive pay.",
        "thought": "Every role is a race against two agencies. First decent shortlist wins the fee; where do I spend the hour?",
        "jobs": "Tell me which 3 roles to touch today and hand me the shortlist that's ready to send first.",
        "pain": "Lives across 5 disconnected tools; judged on speed but screens CVs by hand, submits day three.",
        "wantToSee": "Ranked cross-client triage, separate per-client lanes, ready shortlists, roles at risk, closing placements.",
        "delight": "'You're first to submit'; per-client warm lanes; '4th placement' counted when nobody else does.",
        "fear": "An agent submits a wrong-fit candidate under her name; client loses trust in her, not the tool.",
        "success": "At 9am sees the 3 roles needing her, sends 2 shortlists before rivals wake, full incentive.",
        "interface": "Dense SaaS power view, per-client switching, bulk approve, keyboard speed, all day.",
        "leadsWith": "Ranked cross-client triage: the 3 roles that need her and the 2 shortlists ready now."
      }
    },
    {
      "key": "candidate-applicant",
      "name": "Ananya Reddy",
      "archetype": "The One Who Just Wants to Know",
      "cells": {
        "role": "23, B.Com grad in a Bengaluru PG. 140 applications, six replies. The rest, a black hole.",
        "thought": "Assume rejection, protect the hope. A bot that replies beats a human who ghosts; but will it misread me?",
        "jobs": "Tell me where I stand and what's next with a real date, and make me feel like a person.",
        "pain": "The black hole: 134 of 140 applications got no reply at all, and the nothing is what erodes her.",
        "wantToSee": "One honest status line with a real date, proof a human owns the call, the next step explained.",
        "delight": "The void replies by name; 'You advanced' before she asks; a no that keeps her in the pool.",
        "fear": "An algorithm filters her out for her gap, accent, or college before a human sees she's capable.",
        "success": "Always knows where she stands; every step human-backed; yes or no arrives respectfully, on time.",
        "interface": "Candidate portal plus agent touchpoints: WhatsApp, email, call and assessment links.",
        "leadsWith": "Presence and a promise: a human will see you, and you'll hear at every step. Not a void."
      }
    }
  ]
};

export const personaJourneys = [
  {
    "key": "economic-buyer-ceo",
    "name": "Aditya Rao",
    "archetype": "The Accountable Optimist",
    "arcLabel": "skeptical buyer, dips into dread, lands trusting",
    "who": "42, co-founder and CEO of a Bangalore B2B SaaS company that just closed a Series B and has to grow from 180 to roughly 300 people in eighteen months. He doesn't operate hiring; he signed the cheque for Dassh because his Head of People walked him a number he couldn't unsee: a bad senior hire costs the company 25 to 40 lakh and eats a quarter of a manager's year. He thinks in runway, headcount-to-revenue, and the board deck due the 14th. He has never opened the agency-recruiter table view and never will. What keeps him up is not speed; it is the day a candidate posts that a cold AI rejected them, or that they hired fast and hired wrong, and his name is on the company.",
    "beats": [
      {
        "beat": "The cheque, signed on a number",
        "doing": "Approves the Dassh spend after his Head of People shows him that one bad senior hire costs 25 to 40 lakh and a quarter of a manager's year.",
        "thinking": "The math is undeniable. But I've bought 'AI that transforms hiring' before and got a login I never used.",
        "feeling": "convinced but braced",
        "emotionScore": 3,
        "painOrDelight": "neutral"
      },
      {
        "beat": "First Monday, the one-line briefing",
        "doing": "Opens the Daily Report on his phone between standup and a board prep call, expecting a dashboard, gets one written sentence.",
        "thinking": "Wait, it just told me we're on track and the spend is down 22 percent. In a sentence. I didn't have to do anything.",
        "feeling": "disarmed, lightly hopeful",
        "emotionScore": 4,
        "painOrDelight": "delight"
      },
      {
        "beat": "The 3am fear, made real",
        "doing": "Reads a 'What's broken' alert: the Senior PM screening is rejecting at 80 percent, far above the 45 percent norm, possible over-strict criteria.",
        "thinking": "This is the exact nightmare. Is the AI quietly throwing out the people who'd have built this place? Am I the founder who automated away his own kind of hire?",
        "feeling": "cold dread",
        "emotionScore": 2,
        "painOrDelight": "pain"
      },
      {
        "beat": "The verdict, owned by a human",
        "doing": "Taps the alert; sees the flagged criterion, the demographic check showing no gender cliff, and 'paused, awaiting your Head of People's review, no one was auto-rejected.'",
        "thinking": "Okay. It caught it, it stopped itself, and it's waiting for a person. It told me before I had to find out the hard way.",
        "feeling": "steadied, respect",
        "emotionScore": 4,
        "painOrDelight": "delight"
      },
      {
        "beat": "The board deck writes itself",
        "doing": "The morning of the board meeting, copies the report's summary line and the cost-per-hire and quality numbers straight into slide 11.",
        "thinking": "I'm walking in already knowing the hiring story is good. I'm not reconciling three spreadsheets at midnight.",
        "feeling": "in control, quietly proud",
        "emotionScore": 5,
        "painOrDelight": "delight"
      },
      {
        "beat": "A name, not a number",
        "doing": "Gets a WhatsApp from Stella: 'Meera accepted the Staff Engineer offer, your 40th hire this quarter,' and forwards it to his co-founder.",
        "thinking": "We're actually building the thing. And it remembered it's our company, not just a pipeline.",
        "feeling": "belonging, warmth",
        "emotionScore": 5,
        "painOrDelight": "delight"
      }
    ]
  },
  {
    "key": "chro-head-of-ta",
    "name": "Aparna Rao",
    "archetype": "The Steward Under Audit",
    "arcLabel": "guarded, exposed, then quietly trusting",
    "who": "47, VP of Talent Acquisition at a 6,000-person enterprise in Bengaluru (financial services, scaling fast). She carries 240 open requisitions across 11 recruiters, a board deck due the first Monday of every month, and the quiet fear that one of her best recruiters is about to resign from sheer requisition load. Hiring matters to her right now because the CEO has tied 2026 revenue to headcount that simply isn't arriving fast enough, and because she has personally promised the audit committee that nothing in their hiring will ever show up as a DPDP or bias problem. She came up through recruiting herself; she still remembers the 11pm CV piles. She measures her own worth by whether her team is winning without breaking.",
    "beats": [
      {
        "beat": "The handover",
        "doing": "Signs off on letting Dassh's agents screen and call for 240 reqs across her 11 recruiters.",
        "thinking": "If an algorithm I approved discriminates against a candidate, that's my name in the audit finding, not the vendor's.",
        "feeling": "wary, exposed",
        "emotionScore": 2,
        "painOrDelight": "neutral"
      },
      {
        "beat": "First Daily Report",
        "doing": "Opens the homepage Monday morning expecting a wall of metrics to decode.",
        "thinking": "Wait, it told me Kavya's win first, and named who's overloaded. It's reading my function the way I do.",
        "feeling": "surprised, seen",
        "emotionScore": 4,
        "painOrDelight": "delight"
      },
      {
        "beat": "The cold pipeline",
        "doing": "The report flags a senior Compliance role stalled 6 days, SLA breached, hiring manager about to escalate.",
        "thinking": "This is exactly the kind of thing I used to find out about from an angry email to my boss.",
        "feeling": "tense, on the spot",
        "emotionScore": 2,
        "painOrDelight": "pain"
      },
      {
        "beat": "The bias scare",
        "doing": "Audit asks her to prove a screening shortlist wasn't biased and candidates consented, by end of day.",
        "thinking": "This is the call I've dreaded. Please tell me there's a trail and not just a black box.",
        "feeling": "dread",
        "emotionScore": 1,
        "painOrDelight": "pain"
      },
      {
        "beat": "The defensible trail",
        "doing": "Pulls the explainability and consent log: every agent recommendation reasoned, every consequential decision human-signed.",
        "thinking": "It's all here. I can walk into that room and not flinch. The agent recommended, my recruiter confirmed.",
        "feeling": "steadied, relieved",
        "emotionScore": 4,
        "painOrDelight": "delight"
      },
      {
        "beat": "The board Monday",
        "doing": "One tap turns the month's report into her board narrative: time-to-hire down, team load saner, fairness attached.",
        "thinking": "I'm walking in with the number AND the proof AND a team that isn't burning out. This is the job done right.",
        "feeling": "proud, in command",
        "emotionScore": 5,
        "painOrDelight": "delight"
      }
    ]
  },
  {
    "key": "in-house-recruiter",
    "name": "Sneha Krishnan",
    "archetype": "The Amplified Operator",
    "arcLabel": "guarded, threatened, then quietly indispensable",
    "who": "Sneha is 31, a Talent Acquisition Specialist on a four-person TA team at a 900-person enterprise SaaS company in Bangalore. She carries 11 to 14 open requisitions at once across engineering and GTM, most of them needed yesterday. Her day starts at 8:40am with chai at her desk, 60-odd unread CVs, three hiring managers already pinging her on Slack, and a 2pm panel she still has not confirmed. Hiring matters to her because this is a growth year: headcount targets are tied to the next funding milestone, the TA budget is flat while demand is up, and every slow req is a leader watching the clock. She is genuinely good at the human part, reading a person in a 12-minute call, and she resents how little of the day the job leaves for it.",
    "beats": [
      {
        "beat": "The 8:40 deluge",
        "doing": "Drops her bag, opens the laptop to 60-odd fresh CVs and three Slack pings before her chai is even warm.",
        "thinking": "Eleven reqs and it's not even 9. I'll be reading resumes till lunch and the calls I actually want to make won't happen. Again.",
        "feeling": "Bracing, already behind",
        "emotionScore": 2,
        "painOrDelight": "pain"
      },
      {
        "beat": "Named, not replaced",
        "doing": "Opens Dassh; the Daily Report greets her by name: agents screened 47 overnight, 8 strong matches lined up, nothing sent without her.",
        "thinking": "Okay. It did the reading. But it's telling me it waited for me, that's new.",
        "feeling": "Disarmed, cautiously curious",
        "emotionScore": 3,
        "painOrDelight": "neutral"
      },
      {
        "beat": "The trust dip",
        "doing": "Opens the Backend shortlist and hesitates before forwarding it to a notoriously picky engineering manager.",
        "thinking": "If this thing is wrong about even one of these, it's my credibility in that room, not its. Why should I believe it?",
        "feeling": "Suspicious, exposed",
        "emotionScore": 2,
        "painOrDelight": "pain"
      },
      {
        "beat": "The reasoning earns it",
        "doing": "Taps a candidate and reads the match score, skill and experience breakdown, and gap analysis behind the pick.",
        "thinking": "It's showing its work. I can defend every one of these in his language. Fine, I believe it, and I can still throw one out.",
        "feeling": "Reassured, in control",
        "emotionScore": 4,
        "painOrDelight": "delight"
      },
      {
        "beat": "Two taps, busywork gone",
        "doing": "Bulk-approves the shortlist; Stella instantly schedules the panel and WhatsApps the candidates while she moves to her next req.",
        "thinking": "That's twenty minutes of scheduling I just didn't do. I'm spending my morning judging, not chasing.",
        "feeling": "Light, fast",
        "emotionScore": 5,
        "painOrDelight": "delight"
      },
      {
        "beat": "Her save, credited",
        "doing": "A milestone card surfaces: the candidate she personally talked off a counteroffer accepted, named as her 4th hire this quarter.",
        "thinking": "That one was me. The call, the read, the save. And it knows it. This is the part of the job I'm proud of, and it's the part it's putting my name on.",
        "feeling": "Seen, belonging",
        "emotionScore": 5,
        "painOrDelight": "delight"
      }
    ]
  },
  {
    "key": "agency-recruiter",
    "name": "Farheen Qureshi",
    "archetype": "The Multi-Client Closer",
    "arcLabel": "guarded, briefly sinking, then quietly backed",
    "who": "31, a senior recruiter at a mid-size IT staffing firm in Bangalore (HSR Layout), four years in agency recruitment after a stint in BPO HR. On any given Tuesday she is running roughly fourteen live requisitions across five clients: contract DevOps for a fintech, two permanent backend roles for a Pune product company, a bulk QA mandate, a niche data-engineer role three agencies are also chasing. Her billing is half base, half placement incentive, so a slow month is a real dent in her salary. She is the buffer everyone leans on: the client who changes the JD on Thursday, the candidate who ghosts the offer, the account manager asking \"any movement on Cognida?\" She wins by speed and by never letting a client feel forgotten, and most days nobody tells her she did well.",
    "beats": [
      {
        "beat": "The 9am avalanche",
        "doing": "Opens Dassh after a weekend of fourteen reqs piling up across five clients, bracing for the usual scramble through ATS, inbox and WhatsApp.",
        "thinking": "Another tool wanting my login. Where do I even start, which client is already angry?",
        "feeling": "wary, pre-stretched thin",
        "emotionScore": 2,
        "painOrDelight": "neutral"
      },
      {
        "beat": "It worked the night shift",
        "doing": "Reads the opening line: her screening agents ranked 86 CVs overnight and the Data Engineer shortlist is ready to send, with 'you're first' called out.",
        "thinking": "Wait, this is already done? I can submit before the other two agencies even read the JD.",
        "feeling": "surprised, a flicker of relief",
        "emotionScore": 4,
        "painOrDelight": "delight"
      },
      {
        "beat": "The role she'd forgotten went cold",
        "doing": "Scrolls into 'What's broken' and sees the Pune backend role flagged: no activity in 4 days, SLA about to breach, client last contacted Thursday.",
        "thinking": "I dropped that one. If the client noticed before I did, I'd have lost the account's trust.",
        "feeling": "stung, exposed",
        "emotionScore": 2,
        "painOrDelight": "pain"
      },
      {
        "beat": "Caught before the client was",
        "doing": "Uses the inline 'send shortlist' and one-tap client nudge straight from the report, fixing the stalled role in two clicks without opening another tab.",
        "thinking": "Okay. It caught it for me, and I fixed it before anyone complained. I'm not behind anymore.",
        "feeling": "steadying, back in control",
        "emotionScore": 4,
        "painOrDelight": "delight"
      },
      {
        "beat": "Someone counted her wins",
        "doing": "Hits a green milestone: Aman accepted the DevOps offer, '4th placement this month,' her incentive progress shown beside it.",
        "thinking": "Four. Nobody at the office said a word, but it's right there. That's my month.",
        "feeling": "seen, quietly proud",
        "emotionScore": 5,
        "painOrDelight": "delight"
      },
      {
        "beat": "Owning the verdict",
        "doing": "Reviews the agent's top pick for the niche role, overrides one ranking with her own read of the candidate, and submits under her name with confidence.",
        "thinking": "It did the legwork, but the call is still mine. That's exactly the part the client is paying me for.",
        "feeling": "trusted, in charge",
        "emotionScore": 5,
        "painOrDelight": "delight"
      }
    ]
  },
  {
    "key": "candidate-applicant",
    "name": "Ananya Reddy",
    "archetype": "The One Who Just Wants to Know",
    "arcLabel": "braced for the void, slowly daring to hope",
    "who": "23, a B.Com graduate from Hyderabad now living in a Bengaluru PG with three other girls, all job-hunting, all rationing their data packs. She is eight months out of college and has applied to roughly 140 roles for customer success and ops jobs. Maybe six replied. The rest vanished into what she and her flatmates call the black hole. Her father, a schoolteacher in Warangal, asks every Sunday call how it is going, and she has run out of ways to say nothing has happened. The money from her tuition side-gig is thinning. This is not a career-strategy problem for Ananya. It is a self-worth problem wearing a job-search costume.",
    "beats": [
      {
        "beat": "One more into the dark",
        "doing": "Submits application #141 to Lumio from her PG bed at 11pm, already closing the tab to protect herself.",
        "thinking": "Fine. Another one gone. I won't wait for this one either.",
        "feeling": "numb, pre-emptively defeated",
        "emotionScore": 2,
        "painOrDelight": "neutral"
      },
      {
        "beat": "The void replies",
        "doing": "A WhatsApp arrives from Stella within minutes, using her name and confirming a human will see her file.",
        "thinking": "Wait, it knows my name. And a person will actually look? Okay. Okay.",
        "feeling": "startled, a flicker of warmth",
        "emotionScore": 4,
        "painOrDelight": "delight"
      },
      {
        "beat": "The interview that always breaks her",
        "doing": "Gets the AI screening-call link and feels the old dread rise: the freeze, the accent she hides, the scoring she can't see.",
        "thinking": "Here it is. The machine that doesn't get me. Do I even sound right to it?",
        "feeling": "anxious, exposed, small",
        "emotionScore": 1,
        "painOrDelight": "pain"
      },
      {
        "beat": "Told what's actually happening",
        "doing": "Reads Stella's plain pre-call note: 15 minutes, here's what we'll cover, a human recruiter reviews every call.",
        "thinking": "A person watches it after. I can just talk. I can prepare instead of perform.",
        "feeling": "steadier, allowed to breathe",
        "emotionScore": 3,
        "painOrDelight": "delight"
      },
      {
        "beat": "Seen, in writing",
        "doing": "Next morning her status card says 'You advanced' before she's even asked, and notes her event-logistics experience was flagged as relevant.",
        "thinking": "They saw the fest thing. Someone actually read past the gap.",
        "feeling": "proud, recognised",
        "emotionScore": 5,
        "painOrDelight": "delight"
      },
      {
        "beat": "The honest ending",
        "doing": "Two days later, a clear message: not selected for this role, one real reason given, profile saved to Lumio's ops talent pool with a note to reach out for the next opening.",
        "thinking": "It's a no. But it's a real no, on time, and they kept me. That's the first no that didn't feel like disappearing.",
        "feeling": "disappointed but intact, oddly respected",
        "emotionScore": 4,
        "painOrDelight": "delight"
      }
    ]
  }
];

export const belongingThesis = "Most hiring software greets you with a wall of metrics and asks you to do the worrying. The Daily Report inverts that. It opens by naming you and speaking in your own register, the CEO's chief-of-staff line, the recruiter's \"while you were out,\" the candidate's \"Hi Ananya,\" so the first feeling is \"someone has my back,\" not \"here is data.\" Four principles make it joyful rather than merely efficient. One, lead with belonging before tasks: a win, a name, a human credited, before anything broken. Two, frame the AI as labor removed for a named person, never the hero; the verdict stays pointedly theirs. Three, count the wins nobody else counts, the 40th hire, the counteroffer save, the 4th placement, the fest logistics finally seen. Four, make safety legible: humans owned the calls, the fairness trail exists, \"you'll hear either way.\" The result is a homepage that feels less like a tool you bought and more like a teammate who stayed up reading the numbers so you didn't have to.";

export const dailyReportFirstViews = [
  {
    "persona": "Aditya Rao",
    "seesFirst": "A single AI-written line addressed to him: 'Good morning Aditya. You're on track for 300 by Q4, cost-per-hire down 22 percent, quality holding. Humans approved 94 percent of Stella's calls, one role needs you.'",
    "joyAndBelonging": "The report knows it's HIS company: it names his Q4 number, his board's question, and the actual humans being hired. Framed as a chief of staff who already did the worrying, so it reads as 'the bet is working and someone has your back.'"
  },
  {
    "persona": "Aparna Rao",
    "seesFirst": "Before any red flag, a recruiter win and a team line: 'Kavya closed Risk Analyst in 19 days, your fastest this quarter. Your team made 3 hires since Monday, and the agents took roughly 140 hours of grunt work off their plates.'",
    "joyAndBelonging": "It reads her function the way she does, people first. Her recruiters are credited by name, the AI is positioned as the thing that gave them back their hours, and she feels proud and in command before she's asked to fix anything."
  },
  {
    "persona": "Sneha Krishnan",
    "seesFirst": "Addressed to her, framing the night's work as time returned, then handing her the wheel: 'Good morning Sneha. While you were out, your agents screened 47 CVs across 5 reqs and surfaced 8 strong matches. Nothing went out without you. Here's what needs your judgment today.'",
    "joyAndBelonging": "It casts her as the recruiter the agents work for, not the worker they're replacing. Every shortlist arrives pre-justified and one tap from override, and her human saves get her name on them, so the craft she's proud of is the part the report elevates."
  },
  {
    "persona": "Farheen Qureshi",
    "seesFirst": "Her name and a night-shift line: 'Farheen, while you were out your agents screened 86 CVs across 4 roles. The Data Engineer shortlist is ready, you're first to submit.'",
    "joyAndBelonging": "It makes the invisible middle-woman the protagonist who was worked for overnight, and hands her the exact competitive win her job hinges on, first to submit, before showing anything broken. Per-client warm lanes lift the constant fear of crossing data."
  },
  {
    "persona": "Ananya Reddy",
    "seesFirst": "A single calm status card opening with her name and where she stands: 'Hi Ananya. You're through screening at Lumio. Next: a 15-min call, a human recruiter reviews it, scheduled options below.'",
    "joyAndBelonging": "Being addressed as Ananya, a real date to hold onto, and the line 'You'll hear from us either way, we won't leave you wondering.' That one sentence converts the daily refresh from dread into a place she's safe to check."
  }
];

export const deepenedPillars = [
  {
    "key": "calling",
    "title": "Calling agent",
    "wireframe": { "builder": "callingAgent" },
    "oneLiner": "Stella places the first phone screen herself: candidates plus a script become live voice calls, and every call comes back as a transcript, a scored disposition, and a one-tap human decision.",
    "lockedDecisions": [
      "Creation follows the same 4-step wizard with a left vertical stepper, adapted to voice: (1) Calling Group, link a job (Select job / Custom group / Import from ATS), name and describe the group, choose script type (Preset / AI-generated from the JD and screening checklist / Upload); (2) Call Script, a structured flow of question blocks (Intro and consent, Role fit, Availability and notice period, Current and expected CTC, Location and relocation, Closing) each with a priority tag (Essential / Valuable / Not preferred), expected-answer note, and a follow-up-probe field, plus voice, language, and a per-question 'must-ask' flag; (3) Add Candidates, the same paths as Screening (Upload Files / Contact group / Connect ATS / Talent pool) but phone-number-validated, with a count surfaced like '38 callable candidates found' and invalid or missing numbers flagged separately; (4) Automations, calling-window and retry policy plus disposition-driven moves, then 'Start calling agent'.",
      "Calling defaults assume India: Hindi plus English (Hinglish) by default with per-candidate language override; an explicit recorded consent line as the first script block; and a default calling window of 10:00 to 19:00 IST with a do-not-disturb guard so the agent never dials outside it.",
      "Default retry policy: up to 3 attempts per candidate, spaced 90+ minutes apart and rotated across morning / afternoon / evening slots before a candidate is marked No-answer; voicemail does not count as a connect.",
      "Every completed call produces four artifacts together: the recording, the timestamped transcript, a rubric score against the script blocks, and a recommended disposition (Advance / Reject / Callback requested / Needs human review). The agent recommends; it never finalizes a Reject on its own.",
      "Disposition automations (Smart move, Auto-advance strong calls, Route flagged calls to a reviewer) are off by default, honoring the governing rule that the human owns the verdict until trust is earned per job."
    ],
    "requirements": [
      "Three input paths on each applicable step (have-it / generate-it / upload-it), mirroring Screening: the script can be AI-generated from the linked job and its screening checklist so the call probes exactly the gaps the CV screen left open.",
      "Phone-number validation and normalization to E.164 (+91) at candidate add time, with a clearly separated 'uncallable' bucket (missing, invalid, or duplicate numbers) so the recruiter sees reachability before any credits are spent.",
      "Recorded, spoken consent as the mandatory first script block, with the consent outcome stored on the call record; if a candidate declines recording, the agent logs the refusal and ends without screening rather than proceeding.",
      "A legible call record per candidate: transcript with speaker labels, per-block rubric scores, sentiment, key-topic coverage, and the recommended disposition with its reasoning, all override-friendly in one or two taps.",
      "Candidate-experience requirement: the agent identifies itself as Stella, an AI recruiter calling on behalf of the named company, states why it is calling and how long it will take, offers a callback or human-handoff at any point, and respects an opt-out immediately and permanently. This is the answer to Ananya's dread of the AI call that always breaks her: she always knows who is calling, why, and how long, and a human is one tap away.",
      "Inline validation on Next, an AI-standardization banner for generated scripts with a revert warning, and save-script-as-preset / import-template / add-a-reviewer footer actions, consistent with the Screening wizard."
    ],
    "keySurfaces": [
      "The 4-step calling wizard (centered ~1132px card in a 1440px viewport, single scrollable left stepper), with a live script preview and an estimated-cost-and-duration readout for the loaded candidate batch.",
      "The Calling agent card on the job detail page showing Connected / Attempted, Advance rate, and Avg call duration, with a live 'on call now' indicator.",
      "The call record / agent detail view: audio player synced to the transcript, per-block rubric, disposition recommendation, and Advance / Reject / Callback action buttons.",
      "The candidate phone touchpoint itself (the Stella voice call), plus the Daily Report 'what needs you' entries for calls flagged Needs human review."
    ],
    "moat": [
      "Legible voice evaluation: a recruiter can read or replay any call and see exactly why the agent recommended a disposition, making autonomous phone screening trustworthy and easy to override (governing rule #2).",
      "The script library compounds: scripts auto-derived from each job's screening checklist turn an org's evaluation standards into reusable, voice-ready IP, and connect-rate-by-time-slot data makes every subsequent campaign reach more candidates.",
      "Removing the single most time-consuming recruiter chore in India (chasing candidates by phone to confirm CTC, notice period, and location) is labor genuinely removed, not a feature added."
    ],
    "v1": "Shipped and field-validated (see the Research spec: every study recommendation implemented, screening-call completion climbed to 71%). The calling agent and 4-step wizard with preset and AI-generated scripts, Hinglish voice, consent-first flow, 3-attempt retry, and per-call transcript + score + recommended disposition surfaced for human confirmation. Telephony via Twilio (per the integrations layer).",
    "v2": "Multi-agent handoff so a strong Screening result auto-queues a call and a strong call auto-queues Scheduling; best-time-to-call optimization from connect-rate data; drop-off-point analytics on the script; reviewer workflow; and per-question effectiveness insights (which probes best separate advance from reject).",
    "northStar": "Phone screening so trusted that Auto-advance runs by default with near-zero revert, because the reasoning behind every Advance is equally legible whether Stella or a recruiter made the call (the trust is in the transparency, never in being indistinguishable from a human), and time-to-first-qualified-shortlist collapses to a single calling window.",
    "metrics": [
      "Throughput: Calls attempted, Calls completed, Calls remaining, Connect rate (completed / attempted)",
      "Quality: Advance rate, Reject rate, Avg call score, Sentiment breakdown, Key-topic (script) coverage",
      "Efficiency: Avg call duration, Time to first attempt, Retry rate, No-answer rate",
      "Unique to Calling: Best time to call, Script drop-off point, Voicemail rate, Callback-requested rate",
      "Trust: revert rate on agent-recommended dispositions, feeding the platform north-star (trusted autonomous advances)",
      "Candidate experience: opt-out rate and human-handoff-requested rate as guardrails against over-aggressive dialing"
    ],
    "openQuestions": [
      "Consent and compliance: what recorded-consent script and data-retention policy satisfies Indian telecom and DPDP requirements, and does TRAI DND registration block outbound screening calls to some candidates?",
      "Voice realism vs. disclosure: how human should Stella sound, and exactly when and how must she disclose she is an AI without depressing connect or completion rates?",
      "Handoff trigger: when a Screening pass should auto-start a call, who owns the transition (a Workflow agent, automations, or an orchestration layer) and how are credits authorized?",
      "Reachability economics: how are per-minute telephony costs surfaced and capped per job, especially for agencies billing clients per stage?"
    ],
    "risks": [
      "Compliance and reputational risk: unsolicited AI voice calls at scale can breach DND or DPDP rules and damage the employer brand if disclosure or consent is mishandled; this is a launch blocker, not a polish item.",
      "Voice quality and accent robustness: poor speech recognition on Indian languages, names, and code-switched Hinglish produces wrong transcripts and wrong scores, eroding trust in the disposition and creating an accuracy feedback-loop delay (you only learn the call was misjudged after the candidate progresses).",
      "Over-automation eroding the verdict: auto-rejecting on a single noisy call without legible, replayable reasoning breaks governing rule #2 and silently loses good candidates."
    ],
    "sources": [
      "FIELD RESEARCH now backs this pillar: the Zydus persona-tuned flow arc + the 43-call collision study (see the Research spec 'Field research: the calling agent' below, and Claude/dassh-user-requirements.md R5/R6). Headline (recounted 2026-07-24 against the study's own appendix): 10 of 43 calls, about a quarter, connected and then died before any screening question. The raw 34.9% INCOMPLETE status includes 5 no-answers and does not support the stronger claim; latency, dedup, and consent-first defaults here are its direct answers.",
      "Claude/Dassh - Architecture.md (Calling agent row, integrations: Twilio, candidate portal calling touchpoint)",
      "Claude/Dassh - Metrics Framework.md (Calling agent throughput / quality / efficiency / unique metrics, agent-card metrics)",
      "Claude/Dassh - Agent Creation PRD.md (the 4-step wizard reference pattern matched here)",
      "PRD/2026-06-28_dassh-global-prd-WIP.md (Pillar B Calling stub, governing rules, north-star proposal)"
    ]
  },
  {
    "key": "interview",
    "title": "Interview agent",
    "wireframe": { "builder": "interviewAgent" },
    "oneLiner": "Takes the shortlist plus a question set, runs structured AI-led video or audio interviews, and hands back recordings, per-competency evaluations, and a transparent recommendation a human confirms.",
    "lockedDecisions": [
      "Creation follows the same 4-step wizard with a left vertical stepper: (1) Interview Group, link a job and pull the shortlist (Select job / From screening shortlist / Custom group), name and describe the group, choose interview mode (Video / Audio-only / Async one-way vs Live two-way) and language (English plus India-context options like Hindi, Tamil, Telugu, Kannada, Marathi); (2) Question Set, questions organized into competency tabs (Technical, Behavioral, Role-specific, Cultural, Communication) each carrying a weight and a model-answer or rubric, plus follow-up depth (how aggressively Stella probes), generated from the job and screening gaps, reused via templates, or uploaded; (3) Add Candidates, default-pulled from the screening shortlist with manual add and a per-candidate interview window; (4) Automations, post-interview toggles (Auto-recommend threshold, Move strong-recommend to next stage, Send rejection draft for review, Trigger Scheduling agent for a human round), all off by default, then Start interview agent.",
      "Async one-way (candidate answers on their own time within a window) is the v1 default because it removes the scheduling-coordination labor that kills funnels in high-volume India hiring; live two-way is configurable.",
      "The human owns the verdict (governing rule 2): the agent never auto-rejects or auto-hires. It produces a recommendation on the five-point scale (Strong recommend / Recommend / Neutral / Not recommend / Strong reject) with full reasoning, and a human confirms any consequential move.",
      "Every recommendation ships legibly: per-competency score, the exact moment in the recording each score is anchored to, response-depth signal, and any red flags, so the verdict is inspectable and override-friendly.",
      "Integrity is on by default but advisory, never automatic: tab-switch, multiple-faces, and answer-similarity signals raise a review flag rather than disqualifying the candidate."
    ],
    "requirements": [
      "Three input paths on applicable steps (have-it / generate-it / upload-it) and inline validation on Next, matching the screening wizard.",
      "Questions auto-generated from the job description AND the screening gap analysis, so the interview deliberately probes what screening could not confirm from a CV, and an AI-standardization banner with a revert warning mirrors screening.",
      "Recording with synchronized transcript and speaker diarization; each competency score must deep-link to the timestamp that justifies it so reviewers verify in one tap instead of rewatching.",
      "Candidate-experience requirement: a friction-light join flow (browser link, no install, mic/camera check, sample practice question, clear time estimate and per-question timer), graceful handling of poor connectivity (audio fallback, auto-resume after drop) for India mobile networks, and a transparent status page entry afterward. (Serves Ananya's 'the interview that always breaks her' beat: told what is happening, a human reviews it, so she can prepare instead of perform.)",
      "Reviewer workflow: assign a human reviewer per group, who sees the recommendation, can agree or override with a one-line reason, and whose override is captured to feed the revert metric.",
      "Accessibility and fairness: per-question time can be extended on request, captions on playback, and language choice honored end to end."
    ],
    "keySurfaces": [
      "The 4-step creation wizard (centered ~1132px card in a 1440px viewport, single scrollable stepper) reusing screening's pattern.",
      "The candidate interview room: question prompt, timer, record/re-record-once control, progress, and connectivity status.",
      "The reviewer evaluation view: recording with synced transcript, per-competency score cards each deep-linked to its evidence timestamp, red-flag and integrity panel, and the recommendation with confirm/override.",
      "Job-detail Interview agent card (Completed / Scheduled, strong-recommend rate, avg score) expanding to agent detail with competency breakdown and recommend distribution."
    ],
    "moat": [
      "Evidence-anchored recommendations: every score links to the exact spoken moment, making an AI interview verdict auditable and override-friendly in a way human-panel notes never are.",
      "The interview compounds on screening on the shared candidate spine: questions target the screening gap analysis, so each agent's output sharpens the next, and the org's accumulated question sets, rubrics, and override history become switching-cost IP.",
      "Removes the highest-labor, highest-variance step (first-round interviews) at India volumes, judged by labor removed per governing rule 1."
    ],
    "v1": "Planned (sensible defaults, not validated design). Async one-way structured interviews on the shortlist: question set from job plus screening gaps, recording with synced transcript, per-competency scoring with evidence timestamps, five-point recommendation, and human confirm/override. Off-by-default automations.",
    "v2": "Live two-way interviews with real-time adaptive follow-up probing; multi-language interviews across major Indian languages; question-effectiveness insights (which questions best separate strong from weak candidates); reviewer-calibration view; auto-trigger of the Scheduling agent for a human round on strong-recommend.",
    "northStar": "Interviews trusted enough that strong-recommend candidates advance automatically with near-zero override, while the human verdict stays one tap away and every advance remains fully traceable to recorded evidence.",
    "metrics": [
      "Throughput: interviews scheduled / completed / remaining, no-show rate",
      "Quality: avg interview score, per-competency breakdown, strong-recommend rate, recommend distribution, response-depth score",
      "Efficiency: avg interview duration, time from schedule to complete, question coverage",
      "Unique: question effectiveness (differentiation power), red-flag rate, candidate engagement (talk-time ratio), follow-up trigger rate",
      "Trust: override/revert rate on the recommendation (feeds the north-star)",
      "Candidate experience: completion rate of started interviews and drop-during-interview rate on mobile networks"
    ],
    "openQuestions": [
      "Async one-way vs live two-way as the v1 default per role type, and whether candidates may re-record an answer (and how many times)?",
      "How are integrity/red-flag signals surfaced to candidates, if at all, to stay transparent without inviting gaming?",
      "Multi-language: do we interview, transcribe, and score in the candidate's language, or normalize to English for scoring fairness?",
      "Where does the interview-vs-screening boundary sit so the two agents probe complementary, non-duplicative things?"
    ],
    "risks": [
      "AI interview bias and fairness exposure: accent, language, lighting, and connectivity can skew scores against exactly the India-context candidates we serve; needs auditing and human override as the backstop.",
      "Candidate trust and consent: AI-led recorded interviews can feel impersonal or surveillant; weak consent, recording disclosure, or no human in the loop damages employer brand.",
      "Recommendation-correctness feedback-loop delay (only knowable after later rounds), plus integrity false-positives wrongly flagging honest candidates."
    ],
    "sources": [
      "/Users/agamagarwal/My Drive/Active - Dassh/Claude/Dassh - Architecture.md",
      "/Users/agamagarwal/My Drive/Active - Dassh/Claude/Dassh - Metrics Framework.md",
      "/Users/agamagarwal/My Drive/Active - Dassh/Claude/Dassh - Agent Creation PRD.md",
      "/Users/agamagarwal/My Drive/Active - Dassh/PRD/2026-06-28_dassh-global-prd-WIP.md"
    ]
  },
  {
    "key": "assessment",
    "title": "Assessment agent",
    "wireframe": { "builder": "assessmentAgent" },
    "oneLiner": "Sends purpose-built skill assessments to candidates, proctors them, and returns scored, pass/fail reports with a per-skill breakdown the recruiter can trust and override.",
    "lockedDecisions": [
      "Creation follows the same 4-step wizard with a left vertical stepper: (1) Assessment Group, link a job (Select job / Custom group / Import from ATS), name and describe the group, choose how the test is built (Preset test library / AI-generated from the job description and checklist / Upload your own questions); (2) Test Configuration, the assessment-specific core, build sections by skill area (Aptitude, Domain knowledge, Coding, Language, Case study), set per-question type (MCQ, short answer, coding, file upload, video response), marks and negative marking, duration and per-section time limits, attempt window, and the pass threshold (overall and optional per-section minimums); (3) Add Candidates, Upload Files / Contact group / Connect ATS / Talent pool, or pull the shortlist handed off by the Screening or Calling agent; (4) Automations, on submit auto-score objective sections, route pass to the next stage and fail to a rejection or hold, and send the report, all toggles off by default, then Start assessment agent.",
      "Objective sections (MCQ, coding test cases) are auto-scored instantly; subjective sections (short answer, case study, video) get an AI-suggested score with a rubric breakdown that a human confirms, honoring governing rule #2, the human owns the verdict. Pass/fail is therefore recommended, not auto-finalized, on subjective-heavy tests.",
      "Proctoring is configurable, not forced: tab-switch, paste, multiple-face, and time-anomaly signals are captured and surfaced as a cheating-flag with evidence, but a flag is a review prompt, not an automatic rejection.",
      "Every result ships legibly: overall score, per-skill breakdown, per-question correct/incorrect with the candidate's answer, time taken, and proctoring flags, so the verdict is explainable and override-friendly.",
      "Default assessment delivery is a no-login link sent over WhatsApp and email so candidates in India can take the test on a phone without creating an account."
    ],
    "requirements": [
      "Three input paths for building the test (preset library / AI-generated from the job and screening checklist / upload your own), mirroring the Screening checklist pattern, with inline validation on Next.",
      "Candidate-experience requirement: a mobile-first, low-bandwidth test runner with a no-login link, auto-save of answers every few seconds, resume-after-disconnect, a visible timer, and a one-line plain-language status so candidates on patchy networks are never penalized for a dropped connection.",
      "Per-section configuration: question type, marks, negative marking, time limit, and shuffle, plus an overall pass threshold and optional per-section minimums.",
      "AI-suggested scoring for subjective answers with a visible rubric and confidence, always routed to a human for confirmation, never silently finalized.",
      "Proctoring evidence panel: each flag (tab-switch, paste, multi-face, copy, time anomaly) is logged with a timestamp and shown on the candidate's report for human judgment.",
      "Auto-generated candidate-facing and recruiter-facing reports: the recruiter view has the full breakdown, the candidate view (if enabled) is a respectful pass/next-step or a neutral close, never a raw score dump."
    ],
    "keySurfaces": [
      "The 4-step creation wizard (centered ~1132px card in a 1440px viewport, single scrollable stepper), with the test-builder as the step-2 anchor surface.",
      "The candidate test runner: mobile-first, no-login, timer, auto-save, resume, accessible on a low-end Android phone.",
      "The job-detail Assessment agent card (Completed / Sent, Pass rate, Avg score) and the agent-detail view with score distribution, per-skill breakdown, and a proctoring-flag queue.",
      "The per-candidate assessment report: overall score, pass/fail recommendation, per-skill and per-question breakdown, time taken, and proctoring evidence."
    ],
    "moat": [
      "Job-anchored, skill-tagged test bank: every test built or AI-generated against a job's screening checklist becomes reusable, calibrated org IP, and item-discrimination data accumulates over time so the platform learns which questions actually separate strong from weak candidates.",
      "Legible, override-friendly scoring (per-skill breakdown plus proctoring evidence) makes the assessment a teammate the recruiter trusts rather than a black-box test vendor.",
      "Sits natively on the shared candidate spine: the Screening or Calling shortlist flows straight in, and the pass set flows straight to Interview, so no re-uploading or re-keying between tools."
    ],
    "v1": "Planned. v1 target: the 4-step creation wizard with a preset test library and upload path, a mobile-first no-login test runner, instant auto-scoring of MCQ and coding sections, a recruiter-confirmed pass/fail, and a per-candidate report with score and per-skill breakdown.",
    "v2": "AI-generated tests from the job and screening checklist; AI-suggested scoring for subjective and video answers with rubric and human confirmation; configurable proctoring with an evidence panel and cheating-flag queue; HackerRank and Codility integration; per-section thresholds and negative marking.",
    "northStar": "Adaptive, item-calibrated assessments where the test bank self-tunes from accumulated discrimination data, subjective scoring is trusted enough that pass/fail auto-routes with near-zero revert, and the candidate experience is a short, fair, mobile test that respects their time, all feeding the platform's trusted-autonomous-advances north-star.",
    "metrics": [
      "Throughput: assessments sent / completed / pending, completion rate (completed / sent).",
      "Quality: avg score, pass rate, score distribution (normal vs. bimodal), per-skill breakdown, cheating-flag rate.",
      "Efficiency: avg completion time, dropout rate (started but not finished), time-to-start (invitation to begin).",
      "Unique: difficulty calibration (scores too high = too easy, too low = too hard), question discrimination (which items separate high/low performers), partial-credit distribution on open-ended items.",
      "Trust signal feeding the north-star: revert rate on the agent's pass/fail recommendation (how often a human overrides).",
      "Candidate-experience metric: disconnect-resume rate and mobile completion rate, to catch when network or device friction, not skill, is driving dropouts."
    ],
    "openQuestions": [
      "Anti-cheating depth: how aggressive should proctoring be before it harms the candidate experience or excludes low-end devices and patchy networks common in India?",
      "Subjective scoring trust: how much human confirmation is needed before AI scores on case studies and video answers can be trusted, and how is the rubric calibrated per role?",
      "Handoff: does the Assessment agent sit before or after the Interview agent in the pipeline, and is the order configurable per job or fixed by a Workflow agent?",
      "Candidate-visible results: should candidates see their own score or only a pass/next-step, balancing transparency against anxiety and gaming?"
    ],
    "risks": [
      "Cheating arms race: remote, no-login tests are easy to game (outside help, AI assistants), and over-strict proctoring excludes legitimate candidates on low-end devices or weak networks, so the flag-not-reject stance must hold.",
      "Difficulty miscalibration at launch: with no accumulated item-discrimination data, early tests may cluster too easy or too hard and produce misleading pass rates until the bank tunes.",
      "Subjective-scoring feedback-loop delay: as with Screening, whether an assessment correctly predicted on-the-job skill is only knowable after the candidate progresses, so the revert-rate trust signal lags."
    ],
    "sources": [
      "/Users/agamagarwal/My Drive/Active - Dassh/Claude/Dassh - Architecture.md (Assessment agent row, integrations layer, agent model, personas)",
      "/Users/agamagarwal/My Drive/Active - Dassh/Claude/Dassh - Metrics Framework.md (Assessment agent metrics: throughput, quality, efficiency, unique)",
      "/Users/agamagarwal/My Drive/Active - Dassh/Claude/Dassh - Agent Creation PRD.md (the 4-step wizard pattern this pillar adapts)",
      "/Users/agamagarwal/My Drive/Active - Dassh/PRD/2026-06-28_dassh-global-prd-WIP.md (Screening pillar depth bar, governing rules, north-star)"
    ]
  },
  {
    "key": "sourcing",
    "title": "Sourcing agent",
    "wireframe": { "builder": "sourcingAgent" },
    "oneLiner": "Hand it a job description and criteria; it scans databases and platforms, surfaces ranked candidate profiles with match scores, and fills the top of the pipeline before a recruiter ever opens a search tab.",
    "lockedDecisions": [
      "Creation follows the shared 4-step wizard with a left vertical stepper, adapted to sourcing: (1) Sourcing Group, link a job (Select job / Custom group / Import from ATS), name and describe the search, and choose how the search brief is built (Preset role template / AI-generated from the JD / Upload a spec); (2) Search Criteria, the searchable equivalent of the screening checklist, organized into the same category tabs (Overall, Education, Experience, Responsibility, Technical) plus sourcing-only facets (Location/relocation, Notice period, Current/expected CTC band, Active vs passive), each criterion carrying an Essential / Valuable / Not preferred priority that weights the match score; (3) Select Sources, pick where to scan (internal Talent pool, connected ATS, Database import, and external Platforms) rather than uploading CVs; (4) Automations, e.g. Auto-add strong matches to the pipeline and Hand off to the Screening agent, both off by default, then Start sourcing agent.",
      "The output of every scan is a ranked list of candidate profiles, each with a match score and a legible breakdown (skills met, experience fit, gap analysis, why-matched), mirroring the Screening agent's evaluation surface so the two read identically.",
      "The human owns the verdict (governing rule #2): the agent proposes matches and ranks them transparently; a recruiter confirms which profiles enter the pipeline. Auto-add is opt-in, not the default.",
      "De-duplication against the existing pipeline runs by default; a profile already present is flagged 'In pipeline', never silently re-added, so the same candidate is not sourced twice across runs or sources.",
      "Sourcing hands off to Screening rather than re-evaluating: a sourced profile that is auto-added enters as a 'New' pipeline candidate and the Screening agent (if active on the job) picks it up, keeping each agent to one job (teammate, not tool)."
    ],
    "requirements": [
      "Three input paths for the search brief, matching the Screening pattern: have a spec (Preset/Upload) or generate one with AI from the job description; inline validation on Next before a scan can launch.",
      "Criteria priorities (Essential / Valuable / Not preferred) must drive the ranking, not just filter: Essential gaps cap a profile's score, Valuable items lift it, Not-preferred items demote, so the ranked list reflects the same weighting language recruiters set during screening.",
      "Each result must ship with a legible match breakdown and a source attribution ('found on <platform/talent pool/ATS>') and an outreach-readiness flag (valid contact present or not), so a recruiter can trust, override, and act on it without leaving the list.",
      "Candidate-experience requirement: a sourced person is not contacted by the act of being found. Sourcing only surfaces profiles; outreach happens only after a human confirms and an explicit comms agent (WhatsApp/Mailer) is triggered, and first contact must state how Dassh found them and offer a one-tap opt-out, so passive candidates are approached respectfully and on consent, not spammed.",
      "Multi-source aggregation in one run with cross-source de-duplication and an 'In pipeline' flag; the recruiter sees one merged ranked list, not one list per source.",
      "Compliance guardrails for India context: respect platform terms and data-source limits, store only what is needed for evaluation, and keep a clear record of where each profile came from for auditability."
    ],
    "keySurfaces": [
      "The 4-step sourcing wizard (centered card in the standard viewport, single scrollable left-stepper), with Step 3 'Select Sources' replacing the Screening agent's 'Upload Candidates' step.",
      "The ranked results list: profiles with match score, skills/experience/gap breakdown, source badge, passive-vs-active and outreach-readiness flags, and a per-row confirm-to-pipeline action plus bulk select.",
      "The job detail sourcing agent card showing Matches found, Match accuracy, and Profiles scanned (per the Metrics Framework Level-2 card), and an agent detail view with source-quality and diversity breakdowns."
    ],
    "moat": [
      "A shared candidate spine plus accumulated org criteria and talent pool: every search reuses the org's evaluation standards and its growing internal pool, so sourcing gets sharper and cheaper the longer the org runs on Dassh, instead of paying per-search on external platforms forever.",
      "Closed-loop match quality: because sourced profiles flow into Screening, Dassh learns which sourced matches actually pass downstream, feeding Match accuracy back into ranking. This compounding feedback is something single-step sourcing tools cannot replicate."
    ],
    "v1": "Planned. v1 is the 4-step sourcing wizard reusing the Screening criteria model, scanning the internal Talent pool and connected ATS, producing a ranked match list with breakdowns and human confirm-to-pipeline; external platform connectors and auto-add are scoped but staged behind v1.",
    "v2": "External platform sourcing at breadth (job boards, professional networks via supported APIs), auto-add of strong matches with low revert, source-quality learning that reallocates scan budget to the best-yielding sources, and one-click handoff into Screening plus a confirmed comms agent for consented outreach.",
    "northStar": "Sourcing trusted enough that the top of every job's pipeline fills itself: the org rarely opens an external search tool, strong matches auto-advance into Screening with near-zero revert, and time-to-first-qualified-shortlist collapses because qualified candidates are already waiting when the recruiter logs in.",
    "metrics": [
      "Throughput: Profiles scanned, Matches found, Candidates added, Sources searched (Metrics Framework, Sourcing).",
      "Quality: Match accuracy (% of sourced candidates who pass Screening downstream, the closed-loop signal), Duplicate rate, Diversity score, Source quality (match rate per source).",
      "Efficiency: Scan rate (profiles/hour), Time to first match, Cost per match (where platform API costs are tracked).",
      "Unique to Sourcing: Criteria refinement (how often the agent auto-adjusted search parameters), Passive vs active split, Outreach readiness (% of matches with valid contact info).",
      "Level-2 job card: Matches found, Match accuracy, Profiles scanned.",
      "Feeds the north-star: a sourced match's downstream Match accuracy and the revert rate on auto-added profiles."
    ],
    "openQuestions": [
      "Per-source compliance and terms: which external platforms can be scanned within their terms and Indian data norms, and which require the candidate's own consent before a profile is stored?",
      "Candidate identity across jobs and agencies: is a sourced person a global record or isolated per application, and how does that interact with de-duplication and the talent pool? (carried open architecture question)",
      "Auto-add threshold and ranking weights: what match score warrants auto-add into the pipeline, and is that org-set or learned from downstream Match accuracy?",
      "Cost governance: external sourcing has real per-match API cost; how is scan budget capped and surfaced (the cost-per-stage / credits concept is undecided)?"
    ],
    "risks": [
      "Match accuracy is only knowable after sourced candidates clear Screening, so the closed-loop quality signal and any auto-add trust are delayed (the same feedback-loop-delay risk as Screening).",
      "Sourcing from external platforms risks terms-of-service and data-privacy violations, and over-aggressive or non-consented outreach to passive candidates would damage candidate trust and the brand; this is why outreach is gated behind human confirmation and explicit opt-out.",
      "Criteria phrased for filtering can over-narrow the pool (e.g. rigid CTC or notice-period bands), silently starving the pipeline; needs visibility into why the match count is low rather than just returning few results."
    ],
    "sources": [
      "Claude/Dassh - Architecture.md (agent model, Sourcing in agent-types table, integrations layer, data model, open architecture questions)",
      "Claude/Dassh - Metrics Framework.md (Sourcing agent metrics: throughput/quality/efficiency/unique, Level-2 card)",
      "Claude/Dassh - Agent Creation PRD.md (the 4-step wizard pattern this pillar adapts)",
      "PRD/2026-06-28_dassh-global-prd-WIP.md (Screening pillar as depth bar; Pillar E Sourcing stub; governing rules)"
    ]
  },
  {
    "key": "scheduling",
    "title": "Scheduling agent",
    "wireframe": { "builder": "schedulingAgent" },
    "oneLiner": "Takes shortlisted candidates and interviewer calendars, finds a slot everyone can actually make, and locks it with invites and confirmations, so coordinating an interview stops being a recruiter's day of WhatsApp tag.",
    "lockedDecisions": [
      "Follows the shared 4-step creation wizard with the left vertical stepper: (1) Scheduling Group, link a job and the interview round being scheduled (Select job / Custom group / Import from ATS), name and describe the group; (2) Configure availability and rules, connect interviewer calendars (Google Calendar / Outlook), set interview duration, mode (in-person / Google Meet / phone), working-hours window, buffer between interviews, and per-day interview cap; (3) Add candidates, pull the shortlist from the Screening or Calling agent queue or upload, capture each candidate's availability via the WhatsApp/Mailer touchpoint; (4) Automations, toggle auto-propose slots, auto-send the calendar invite on candidate accept, and auto-reschedule on a decline (all off by default), then 'Start scheduling agent'.",
      "Slot logic respects governing rule #2: for low-ambiguity cases (clear mutual availability, within rules) the agent proposes and confirms; for consequential or conflicting cases (no clean overlap, interviewer double-book, candidate asks for an out-of-window time) it surfaces options and a human confirms before anything is locked.",
      "Candidate-facing proposals go out over the channel the candidate already uses, defaulting to WhatsApp in India with email fallback; the message offers 2 to 3 concrete slots in the candidate's stated timezone (defaulting to IST) rather than a generic 'reply with your availability', to cut round-trips.",
      "Default rules are India-pragmatic: IST timezone, Mon to Sat working window (many Indian agencies and startups run six-day weeks), a 15-minute buffer between interviews, and a per-interviewer daily cap so panels are not overloaded.",
      "Every confirmed interview writes back to both calendars and the candidate's Application record with the Google Meet/location, the round name, and the interviewer panel, and emits the standard agent events (move candidate to Interview stage, notify the interviewer) so the Interview and Notetaker agents pick up cleanly."
    ],
    "requirements": [
      "Three input paths where applicable, mirroring Screening: link an existing job or create a custom group or import from ATS in step 1; pull the shortlist from an upstream agent queue or upload or connect a contact group in step 3.",
      "Real two-way calendar sync with Google Calendar and Outlook: read interviewer free/busy to avoid proposing booked slots, write the confirmed invite, and detect a later interviewer-side change to trigger a reschedule rather than a silent no-show.",
      "Candidate experience: propose 2 to 3 specific slots in the candidate's timezone over WhatsApp/email, allow a one-tap accept, allow 'none of these work' to request a fresh set, and send a confirmation plus reminders (24h and 1h before) with the join link or address, so the candidate is never left guessing where or when. (Serves Sneha's panel-no-show pain: scheduling she no longer chases by hand.)",
      "Inline validation on Next (a calendar must be connected and a duration set before step 2 can advance) and a clear failed state when no mutually available slot exists within the rules, routed to a human with the conflict shown.",
      "Reschedule and cancel handling end to end: candidate-initiated, interviewer-initiated, and agent-initiated (interviewer freed/blocked), each updating both calendars, re-notifying the other party, and recording the reason.",
      "Surface the same legible reasoning the platform promises elsewhere: when the agent picks a slot it shows why (mutual availability, within buffer, respects daily cap) so a recruiter can trust or override it."
    ],
    "keySurfaces": [
      "The 4-step creation wizard (centered ~1132px card in a 1440px viewport, single scrollable left-stepper) adapted for scheduling: calendar connection and rules in step 2 replace the checklist.",
      "The job detail Scheduling agent card showing Scheduled / Requested, first-slot accept rate, and avg time to confirm.",
      "The agent detail view with a calendar/timeline of booked interviews, pending and failed scheduling requests, and the round-trips-to-confirm and reschedule-rate breakdowns.",
      "The candidate-side WhatsApp/email slot-picker and confirmation thread (the touchpoint the candidate actually experiences), plus its appearance as a 'What needs you?' item in the Daily Report when a conflict needs a human."
    ],
    "moat": [
      "Coordination is the single most thankless, interrupt-driven labor in recruiting (the WhatsApp and phone back-and-forth that eats a recruiter's day); removing it is the clearest expression of 'teammate, not tool', judged by labor removed.",
      "Sitting on the shared job spine, the agent inherits the shortlist from Screening/Calling and hands a confirmed slot to Interview and Notetaker with zero re-entry, so each new agent compounds the others rather than being a standalone calendar tool.",
      "Accumulated availability patterns (best-converting slots, interviewer response habits, candidate timezones) become org-specific scheduling intelligence that a generic Calendly-style tool cannot replicate."
    ],
    "v1": "Single-round scheduling for one candidate against one or a small set of interviewers: connect Google Calendar, propose 2 to 3 slots over WhatsApp/email, candidate one-tap accept, invite written to both calendars, confirmation and reminders sent, candidate moved to the Interview stage.",
    "v2": "Multi-interviewer panel coordination and multi-round sequencing; Outlook support; auto-reschedule on interviewer or candidate change; interviewer daily-cap and buffer enforcement; reschedule-reason analytics and best-time-to-schedule insights surfaced on the agent detail view.",
    "northStar": "Interview coordination that runs end to end with zero recruiter touch in the common case: the agent reads the pipeline, negotiates a slot everyone can make, books it, and reschedules around conflicts on its own, with the recruiter pulled in only for genuine deadlocks, and a near-zero no-show rate because reminders and confirmations are baked in.",
    "metrics": [
      "Throughput: scheduling requests, successfully scheduled, pending (awaiting candidate/interviewer), failed (no mutual slot)",
      "Quality: first-slot acceptance rate, reschedule rate, no-show rate, interviewer satisfaction (if feedback collected)",
      "Efficiency: avg time to confirm, round-trips to confirm (back-and-forth messages before lock), calendar utilization (% of offered interviewer slots filled)",
      "Unique to Scheduling: peak scheduling times, timezone conflicts (% of difficulties from timezone mismatch), buffer compliance (% booked with proper gap)",
      "Daily Report tie-in: scheduling failures and conflicts surface under 'What needs you?', resolvable in 1 to 2 taps",
      "North-star feed: share of interviews scheduled with zero human touch, paired with no-show rate so speed is never bought at the cost of attendance"
    ],
    "openQuestions": [
      "When the candidate proposes a time outside the configured working window, does the agent auto-decline, auto-accept within a tolerance, or always escalate to a human?",
      "How aggressive should WhatsApp reminders be (24h and 1h is the default), and what is the opt-out path, given India's reliance on WhatsApp for this?",
      "For panel interviews, is the slot locked only when all interviewers are free, or does it book a quorum and chase the rest?",
      "Does the agent own buffer/cap enforcement, or does that belong to a higher Workflow/orchestration layer that sequences rounds across agents?"
    ],
    "risks": [
      "Calendar integration fragility: stale free/busy, OAuth token expiry, or a permission gap causes double-bookings or silent failures, which directly damages trust in the teammate.",
      "Candidate-side latency: a non-replying candidate can stall the pipeline, and reminder cadence vs. annoyance is a real tension, especially over WhatsApp; no-show and last-minute reschedule rates are partly outside the agent's control, so the zero-touch north-star needs a fallback-to-human strategy.",
      "This flow is Planned, not designed: the per-agent creation flow beyond Screening is a [GAP], so the step-2 availability/rules UI and the candidate slot-picker are sensible defaults, not validated designs."
    ],
    "sources": [
      "/Users/agamagarwal/My Drive/Active - Dassh/Claude/Dassh - Architecture.md (agent model, integrations layer: Google Calendar/Outlook, candidate touchpoints)",
      "/Users/agamagarwal/My Drive/Active - Dassh/Claude/Dassh - Metrics Framework.md (Scheduling agent throughput/quality/efficiency/unique metrics, agent-card metrics)",
      "/Users/agamagarwal/My Drive/Active - Dassh/Claude/Dassh - Agent Creation PRD.md (the 4-step wizard pattern this pillar matches)",
      "/Users/agamagarwal/My Drive/Active - Dassh/PRD/2026-06-28_dassh-global-prd-WIP.md (Pillar F Scheduling stub, governing rules, Daily Report, north-star)"
    ]
  },
  {
    "key": "whatsapp",
    "title": "WhatsApp agent",
    "wireframe": { "builder": "whatsappAgent" },
    "oneLiner": "A teammate that reaches candidates where they actually reply: it sends approved WhatsApp templates, holds the two-way thread, collects documents and answers, and hands back clean conversation logs so a recruiter never has to chase a candidate over chat again.",
    "lockedDecisions": [
      "Built on the same 4-step creation wizard with a left vertical stepper: (1) WhatsApp Group, link a job (Select job / Custom group / Import from ATS) and name the messaging campaign; (2) Templates and Flow, pick the goal (document collection / interview confirmation / status nudge / re-engagement), attach approved message templates with merge fields and choose tone, set the two-way reply behaviour and fallback rules; (3) Add Candidates, Upload Files / Contact group / Connect ATS / Talent pool, with phone-number validation and a reachable-on-WhatsApp count; (4) Automations, on-reply and on-document-received triggers plus quiet-hours, then Start WhatsApp agent.",
      "Messaging runs on the WhatsApp Business API: the first outbound contact uses a Meta-approved template (template-vs-freeform is enforced by Meta's policy), and freeform conversational replies are only allowed inside the 24-hour customer-service window opened by a candidate reply.",
      "Every conversation requires explicit opt-in and honours STOP / opt-out instantly; an opted-out candidate is removed from the send queue and flagged, never re-messaged by automation.",
      "Quiet hours default to 9pm to 9am IST and are on by default; no automated message is sent outside the window so candidates are not pinged at night.",
      "Governing rule #2 holds: the agent can confirm a slot, collect a PDF, or answer a templated FAQ on its own, but any consequential reply (reject, offer, off-script negotiation) is escalated to a human with the full thread attached, agent recommends, human sends."
    ],
    "requirements": [
      "Three input paths where it fits (have-it / generate-it / upload-it): attach existing approved templates, generate a template draft with AI from the job and goal, or upload a template for submission; inline validation on Next (phone format, template approval status, opt-in present).",
      "Candidate-experience requirement: replies feel like texting a helpful person, not a bot, no repeated questions, the agent reads back what it already has (name, role, stage) and only asks for what is missing; STOP, language switch (English / Hindi / Hinglish), and a clear path to reach a human are always available.",
      "Document collection: the agent accepts PDF / DocX / image / and WhatsApp media, confirms receipt in-thread, names and files each document against the candidate record, and re-prompts politely once if a required document is missing or unreadable.",
      "Template governance surface: shows each template's Meta approval state (approved / pending / rejected) and category so a recruiter never tries to send an unapproved template; rejected templates are blocked from selection with the reason shown.",
      "Full two-way conversation log per candidate: outbound and inbound messages, delivery and read ticks, media received, sentiment, and any human takeover, all attached to the candidate profile and surfaced in the Daily Report.",
      "Honesty: this agent is Planned, not built. The flow above is the intended adaptation of the Screening wizard; per-agent flow detail beyond the shared pattern is not yet designed."
    ],
    "keySurfaces": [
      "The 4-step creation wizard (centered ~1132px card in a 1440px viewport, single scrollable stepper) adapted for WhatsApp: Group, Templates and Flow, Add Candidates, Automations.",
      "Job detail WhatsApp agent card showing the Level-2 metrics: response rate, task completion rate, candidates reached.",
      "Conversation inbox / thread view, the live two-way log with delivery and read ticks, collected documents, sentiment, and a human-takeover control.",
      "Candidate portal touchpoint: the WhatsApp thread is the candidate's primary channel for updates, scheduling, and document upload, with the status page kept in sync."
    ],
    "moat": [
      "Channel reality in India: WhatsApp is where candidates actually read and reply, so an agent that holds a compliant two-way thread removes the single most time-consuming recruiter chore, chasing people, and is judged on labor removed (governing rule #1).",
      "Collected documents and structured replies flow straight back onto the shared candidate spine, feeding Screening, Scheduling, and the Daily Report, so each conversation compounds the value of the other agents rather than living in a separate chat tool."
    ],
    "v1": "Single-goal campaigns on approved templates (document collection, interview confirmation, status nudge) with opt-in / opt-out, quiet hours, two-way logging, and document collection filed to the candidate record; human takeover on escalation.",
    "v2": "Multi-step conversational flows with branching (collect, confirm, reschedule in one thread); AI template drafting with Meta-submission tracking; Hindi / Hinglish handling; tighter handoff into the Scheduling and Screening agents; Stella surfacing WhatsApp headlines.",
    "northStar": "Candidates can run their whole pre-interview journey, confirm, reschedule, ask questions, submit every document, entirely over one WhatsApp thread with near-zero recruiter intervention, while the agent quietly escalates only the consequential moments to a human.",
    "metrics": [
      "Throughput: messages sent, messages received, conversations active, candidates reached.",
      "Quality: response rate (% who replied to at least one message), task completion rate (% of threads that hit their goal, e.g. document collected or interview confirmed), avg response time, sentiment.",
      "Efficiency: delivery rate, read rate (blue ticks), messages per resolution.",
      "Unique to WhatsApp: opt-out rate, template-vs-freeform ratio, media collection (documents received via chat).",
      "Level-2 agent-card trio: response rate, task completion rate, candidates reached.",
      "Feeds the Daily Report: drop-off in response rate or a spike in opt-outs surfaces under What's broken?"
    ],
    "openQuestions": [
      "How aggressive should automated WhatsApp nudges be before they read as spam and drive opt-outs? (carried open question on WhatsApp push aggressiveness)",
      "Where exactly is the human-takeover line, which intents auto-resolve vs. escalate, and does that line move per client or per job?",
      "Language policy: does the agent auto-detect and switch between English / Hindi / Hinglish, or is language set per campaign at creation?",
      "Single global candidate opt-in vs. per-job opt-in, especially for agencies messaging the same candidate across multiple clients (ties to candidate-identity-across-jobs)."
    ],
    "risks": [
      "Meta WhatsApp Business API policy and template approval are external dependencies: rejected or slow-approved templates, the 24-hour window, and category rules can block sends; over-messaging risks number-quality downgrades and bans.",
      "Opt-out and consent missteps carry regulatory and reputational risk; automation must fail closed (never message without opt-in, honour STOP instantly).",
      "Over-automation eroding the verdict: a too-chatty agent that resolves consequential moments itself breaks governing rule #2 and the teammate trust."
    ],
    "sources": [
      "/Users/agamagarwal/My Drive/Active - Dassh/Claude/Dassh - Architecture.md",
      "/Users/agamagarwal/My Drive/Active - Dassh/Claude/Dassh - Metrics Framework.md",
      "/Users/agamagarwal/My Drive/Active - Dassh/Claude/Dassh - Agent Creation PRD.md",
      "/Users/agamagarwal/My Drive/Active - Dassh/PRD/2026-06-28_dassh-global-prd-WIP.md"
    ]
  },
  {
    "key": "mailer",
    "title": "Mailer agent",
    "wireframe": { "builder": "mailerAgent" },
    "oneLiner": "The teammate who writes and sends every candidate email, status updates, interview invites, offers, and rejects, on time and on brand, then reports back who opened, who clicked, and what bounced.",
    "lockedDecisions": [
      "Follows the shared 4-step creation wizard with a left vertical stepper: (1) Mailer Group, link a job (Select job / Custom group / Import from ATS), name and describe the group, and pick a default sender identity (verified domain or shared Dassh sending domain); (2) Templates, a library of typed templates (Status update, Interview invite, Assessment link, Offer, Reject, Follow-up, Custom) with merge fields ({{candidate.first_name}}, {{job.title}}, {{stage}}, {{interview.slot}}, {{recruiter.name}}), subject + body editor, and Edit-with-AI for tone and length; (3) Add candidates, who receives mail, by stage, by upload, by contact group, or by ATS pull, with a per-candidate preview of the rendered email; (4) Automations, stage-triggered sends (on shortlist send interview invite, on reject send the rejection template), all OFF by default with the consequential ones (Offer, Reject) gated behind human confirm.",
      "Honesty: this is a Planned agent. The metrics spec exists in full (Metrics Framework, Mailer section) but the creation flow above is a sensible default modeled on the Screening wizard, not yet designed or built.",
      "Governing rule #2 (human owns the verdict) is enforced at the send gate: status updates and follow-ups can auto-send, but Offer and Reject emails always require an explicit human confirm before dispatch, never silent auto-send of a consequential, irreversible message to a candidate.",
      "Every send is logged as an Evaluation-adjacent event on the candidate's Application timeline (sent, delivered, opened, clicked, bounced, replied, unsubscribed) so the Mailer's activity is legible inside the candidate record, not buried in an email tool.",
      "Sender identity defaults to a verified custom domain via the Integrations layer (SendGrid/SES); white-label sender (agency or client brand in the From and footer) is the agency default so candidates see the brand they applied to, not Dassh."
    ],
    "requirements": [
      "Three input paths on the template step (use a saved template / generate with AI from the email type and job context / upload or paste existing copy), mirroring the Screening flexible-input principle.",
      "Candidate-experience requirement: every outbound email carries an unsubscribe / communication-preference link and honors opt-out across all Mailer groups in the org, no candidate gets a rejection followed by a status nudge after opting out; quiet hours and a max-emails-per-candidate cap prevent inbox flooding during high-volume India campaigns.",
      "Inline validation on Next: a template cannot be saved with an unresolved merge field, and a send cannot launch without a verified sender domain (or explicit fallback to the shared Dassh domain).",
      "Per-candidate render preview before any batch send, showing the exact subject and body each recipient will receive with merge fields resolved, so the recruiter confirms what the candidate will actually read.",
      "Delivery and engagement tracking, open and click tracking with delivery, bounce, and spam-placement status, surfaced both per-candidate (on the timeline) and per-group (on the agent card and detail), feeding the open / click / bounce / unsubscribe metrics.",
      "Save-as-template, import-template, and add-a-reviewer footer actions on the template step, matching the Screening footer pattern, so one org's approved offer and rejection copy becomes reusable IP."
    ],
    "keySurfaces": [
      "The 4-step creation wizard (centered ~1132px card in a 1440px viewport, single scrollable stepper) with the template editor and per-candidate render preview as its distinctive middle steps.",
      "Job-detail Mailer agent card showing the three headline metrics (Open rate, Click rate, Emails sent) per the Metrics display hierarchy.",
      "Mailer agent detail: email-type breakdown (status / invite / reject / offer / follow-up), engagement funnel (sent to delivered to opened to clicked), bounce and unsubscribe lists, and best-send-time and subject-line-performance insights.",
      "Candidate-facing surface: the actual inbox email (white-labeled From, brand footer, one-tap CTA for interview-scheduling or assessment links) plus the unsubscribe / preferences page, this is where the Mailer is judged by the candidate."
    ],
    "moat": [
      "Stage-aware sending on the shared job-and-candidate spine: because the Mailer reads pipeline stage and the other agents' output, the right email fires from the right trigger with the candidate's real context, something a standalone email tool bolted onto an ATS cannot do.",
      "Reusable, org-approved template library (offer, reject, invite copy) becomes compounding communication IP, the same global-shared pattern the Screening checklist uses.",
      "Closed-loop engagement data (who opens an interview invite, who never clicks the assessment link) feeds back into pipeline health and the Daily Report, turning send-and-forget email into a signal the rest of the fabric acts on."
    ],
    "v1": "Template library + manual and stage-triggered sends for the core email types (status, invite, reject, offer, follow-up); verified custom sender domain; merge fields with per-candidate preview; delivery + open/click/bounce tracking on the candidate timeline; consequential sends (offer/reject) gated behind human confirm. Honest status: Planned, not yet built.",
    "v2": "A/B subject-line testing with auto-pick of the winner; best-send-time optimization per candidate timezone and locale; reply detection that routes candidate responses back into the pipeline (or to Stella/WhatsApp); deliverability dashboard (domain reputation, spam-placement monitoring); reviewer-approval workflow for offer/reject copy before any batch goes out.",
    "northStar": "The Mailer becomes the invisible, trusted comms layer of the whole fabric: every candidate touchpoint is timely, on-brand, and on-preference with near-zero bounce and near-zero spam, recruiters stop writing emails entirely and only confirm the consequential ones, and candidates consistently report knowing exactly where they stand, the comms half of \"the human owns the verdict, the teammate does the work.\"",
    "metrics": [
      "Throughput: emails sent, unique candidates emailed, breakdown by email type (status / invite / reject / offer / follow-up).",
      "Quality: open rate, click rate (scheduling, assessment, offer links), reply rate, bounce rate, unsubscribe rate.",
      "Efficiency: delivery speed (trigger to sent), avg time to open, emails per candidate across the job lifecycle.",
      "Unique to Mailer: subject-line performance (open rate by variant if A/B tested), spam rate, best send time.",
      "Card-level (job detail): Open rate, Click rate, Emails sent.",
      "Candidate-experience guardrail: opt-out honored rate and max-emails-per-candidate compliance (a guardrail metric, not in the source doc, proposed to protect the candidate inbox)."
    ],
    "openQuestions": [
      "Reply handling: when a candidate replies to a Mailer email, who owns the thread, the Mailer agent, Stella, a human recruiter, or a handoff to the WhatsApp agent?",
      "Offer-letter mechanics: does the Mailer send the offer as inline copy, a generated PDF attachment, or a link to an e-sign flow, and where does the signed-offer status live?",
      "Channel arbitration with the WhatsApp agent: when both can reach a candidate, who decides email vs. WhatsApp, and how do we avoid duplicate or conflicting messages?",
      "Deliverability ownership: shared Dassh sending domain vs. per-client verified domains, who manages SPF/DKIM/DMARC and warm-up, especially for agencies running many client brands?"
    ],
    "risks": [
      "Deliverability and reputation: high-volume reject/status batches can trip spam filters or burn domain reputation, harming both delivery rates and the agency's brand, the spam-rate and bounce metrics are leading indicators that need active monitoring.",
      "Wrong-template-to-wrong-candidate is a high-blast-radius error (sending a rejection to a shortlisted candidate, or an offer with an unresolved merge field); the per-candidate preview and the offer/reject human-confirm gate are the mitigations, but a bad automation rule could still misfire at scale.",
      "Candidate-experience erosion: over-automated, impersonal, or too-frequent emails undercut the transparency-and-respect-their-time portal principles and can spike unsubscribes, the comms-cap and opt-out guardrails are essential, not optional."
    ],
    "sources": [
      "/Users/agamagarwal/My Drive/Active - Dassh/Claude/Dassh - Metrics Framework.md (Mailer agent metrics, display hierarchy)",
      "/Users/agamagarwal/My Drive/Active - Dassh/Claude/Dassh - Architecture.md (Mailer in agent types, Candidate portal email touchpoint, Integrations: SendGrid/SES)",
      "/Users/agamagarwal/My Drive/Active - Dassh/Claude/Dassh - Agent Creation PRD.md (shared 4-step wizard pattern, footer actions, flexible-input principle)",
      "/Users/agamagarwal/My Drive/Active - Dassh/PRD/2026-06-28_dassh-global-prd-WIP.md (Pillar H Mailer stub, governing rules, Daily Report)"
    ]
  },
  {
    "key": "notetaker",
    "title": "Notetaker agent (cross-cutting)",
    "wireframe": { "builder": "notetakerAgent" },
    "oneLiner": "The teammate that sits in every hiring conversation, records it, and hands back a clean transcript, a summary, and the action items, so no decision or commitment ever lives only in someone's memory.",
    "lockedDecisions": [
      "Follows the shared 4-step creation pattern, adapted to capture: (1) Define group, link to a job or run job-agnostic, name the notetaker instance, set the meeting context (interview / client sync / internal debrief / candidate call); (2) Configure capture, pick recording sources (Google Meet, Zoom, Teams, dial-in phone bridge, in-person mic), set language and India-accent transcription, choose a summary template per meeting type, map speakers to roles; (3) Add participants, connect the meeting via a Scheduling-agent invite, a pasted calendar event, or an ad-hoc session so the recording attaches to the right candidate record; (4) Set automations, route the summary and action items downstream (post to the candidate's Evaluation, create review tasks, ping the Daily Report, trigger a Mailer follow-up).",
      "Cross-cutting by design: a Notetaker is not stage-bound, it can attach to a Calling-agent screen, an Interview-agent session, a recruiter-led client meeting, or an internal debrief, and every output rolls up to the Job (the atom) and the relevant candidate's Application record.",
      "Governing-rule alignment: Notetaker produces transcript, summary, and a proposed action-item list, it never closes the loop on its own. Action items become draft tasks a human confirms, and any summary feeding an evaluation is labelled agent-generated and is editable.",
      "Consent and recording disclosure is on by default: every recorded session opens with an audible and on-screen disclosure to all participants, consent state is logged per session, a hard requirement for candidate-facing calls and for India DPDP-aligned handling of personal data.",
      "Default outputs per session: a time-stamped transcript, a structured summary segmented by topic, an extracted action-item list with owners, and a short headline for the Daily Report, all available the moment processing completes, with speaker attribution required (unattributed audio is flagged, not silently summarized)."
    ],
    "requirements": [
      "Three capture paths in step 2 mirroring the platform's flexible-input principle: join a live virtual meeting via bot (Meet / Zoom / Teams), bridge a phone call (shared with the Calling agent's telephony), or upload an existing recording (audio or video) for after-the-fact processing.",
      "Per-meeting-type summary templates: an interview template surfaces competency signals and red flags, a client-meeting template surfaces requirements and commitments, an internal-debrief template surfaces the hire / no-hire leaning and next steps, users can edit or save their own as a preset (same save-as-preset pattern as the screening checklist).",
      "Inline validation and honest empty states: if no speaker can be matched to a known participant the session shows an Unidentified speaker chip rather than guessing, and if audio quality drops below a transcription-confidence threshold the affected span is marked low-confidence instead of presented as fact.",
      "Candidate-experience requirement: before any candidate-facing session is recorded the candidate hears and sees a plain-language disclosure (one-line consent note on WhatsApp / portal), can request the recording not proceed, and the resulting summary never exposes interviewer-private debrief notes back to the candidate, only the official status moves through their portal.",
      "Action items must carry an owner, a due hint, and one-tap accept / edit / dismiss, accepted items become tasks on the Job and, where configured, trigger the right downstream agent (e.g. an accepted Schedule the L2 item nudges the Scheduling agent).",
      "Every output links back to its source: each summary line and action item deep-links to the exact transcript timestamp so a human can verify the claim in two taps, supporting the override-friendly, legible-evidence standard."
    ],
    "keySurfaces": [
      "The 4-step creation wizard (centered card, left vertical stepper) matching the Screening agent's layout, adapted for capture / participants / summary-routing.",
      "The session detail view: synced transcript and playback on one side, the structured summary, action items, and speaker timeline on the other, with timestamp deep-links between them.",
      "The Notetaker card on the Job detail page showing sessions recorded, action items extracted, and avg processing time, expanding to the full per-agent metric breakdown.",
      "Daily Report placement: recorded sessions and their open action items surface under What happened and What needs you (unconfirmed action items awaiting a human), keeping the cross-cutting output visible without a separate inbox."
    ],
    "moat": [
      "The org's accumulating, searchable record of every hiring conversation, transcripts, decisions, and commitments tied to candidates and jobs, becomes institutional memory no spreadsheet or single recruiter holds, a compounding switching cost.",
      "Cross-cutting capture turns otherwise-lost context (the offhand reason a candidate was rejected, a client's real must-have) into structured, attributable data that feeds Screening criteria, Interview rubrics, and the Daily Report, making the whole agent fabric smarter over time.",
      "Reliable speaker attribution plus India-accent transcription is a quality bar generic notetakers built for Western boardrooms do not clear for high-volume Indian recruitment calls."
    ],
    "v1": "Bot-join capture for one virtual platform plus recording upload, English transcription tuned for Indian accents, a single interview summary template, time-stamped transcript, topic-segmented summary, and an extracted action-item list with manual accept, attached to a Job and candidate. Consent disclosure on by default.",
    "v2": "All three capture paths (bot / phone bridge / upload) across Meet, Zoom, and Teams, multiple summary templates per meeting type with save-as-preset, reliable speaker-to-role mapping, action items that trigger downstream agents (Scheduling, Mailer), Daily Report headlines, and multi-language / code-switching (Hindi-English) transcription.",
    "northStar": "Notetaker runs silently across every hiring conversation in the org so the recruiter never takes a manual note again, the platform's institutional memory is complete and queryable through Stella (ask any past commitment or decision in natural language), and action items flow into the right agent with near-zero human routing, while consequential decisions still pass through a human gate.",
    "metrics": [
      "Throughput: sessions recorded, total recording time, summaries generated, action items extracted",
      "Quality: transcription accuracy (word error rate), summary usefulness (user feedback), action-item completion rate, key-moment capture",
      "Efficiency: processing time (recording end to summary available), avg summary length",
      "Unique to Notetaker: speaker-identification accuracy, topic-segmentation quality, follow-up generation (action items that auto-created tasks or agent triggers)",
      "Consent integrity: % of candidate-facing sessions with logged consent disclosure (target 100%)",
      "Job-card headline trio: sessions recorded, action items extracted, avg processing time"
    ],
    "openQuestions": [
      "Recording retention and deletion: how long are transcripts and recordings kept, and what is the candidate's right to request deletion under India's DPDP framework?",
      "Cross-cutting ownership: when a session spans two jobs or candidates (e.g. a client meeting covering five roles), does the recording attach to all of them or to a parent client record?",
      "Speaker identification cold-start: how are speakers identified on the first call with an unknown participant, voiceprint enrollment, manual tagging, or calendar-attendee inference?",
      "Does the candidate get any access to their own interview summary, or only their official status, and where is the line between transparency and exposing private debrief notes?"
    ],
    "risks": [
      "Consent and privacy exposure: recording candidate calls without robust, logged, jurisdiction-aware consent is a legal and reputational risk, especially for personal data under India's DPDP Act.",
      "Attribution and transcription errors poisoning decisions: a misattributed quote or a low-confidence transcript span treated as fact could drive an unfair reject, the legibility and low-confidence flagging requirements exist to contain this but the accuracy feedback loop is delayed.",
      "Scope creep into surveillance: a cross-cutting recorder of every internal conversation risks feeling like employee monitoring rather than a teammate, the meeting-type scoping and disclosure defaults must hold to keep trust."
    ],
    "sources": [
      "/Users/agamagarwal/My Drive/Active - Dassh/Claude/Dassh - Architecture.md",
      "/Users/agamagarwal/My Drive/Active - Dassh/Claude/Dassh - Metrics Framework.md",
      "/Users/agamagarwal/My Drive/Active - Dassh/Claude/Dassh - Agent Creation PRD.md",
      "/Users/agamagarwal/My Drive/Active - Dassh/PRD/2026-06-28_dassh-global-prd-WIP.md"
    ]
  }
];
