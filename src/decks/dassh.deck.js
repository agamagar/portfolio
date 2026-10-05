// Presentation deck for the Dassh (Stella) case study.
// Composed from the slide-archetype library in App.jsx (see buildSlides / Slide).
// Recipe: title -> central premise -> set the table -> the evidence -> five
// phases (The bet, Four people one product, Anyone can create an agent,
// What the pilots changed, A design system that drove codegen), each opened
// by a phaseDivider -> clients + impact -> close.
// Figure ids reference the coded figures the article uses (src/figures).

export const dasshDeck = [
  {
    "type": "title"
  },
  {
    "type": "statement",
    "kicker": "The premise",
    "text": "About 70 percent of recruiting is execution. The execution load is what crowds the judgement out."
  },
  {
    "type": "splitLabeled",
    "h": "Set the table",
    "items": [
      {
        "label": "Overview",
        "body": "Stella, an AI recruiter that does the execution work of hiring: screening CVs, calling and messaging candidates, running first-round interviews, keeping the ATS current. The people stay free for judgement."
      },
      {
        "label": "Role",
        "body": "Sole product and design person on a four-person founding team. I owned product design end to end, and advised the founder on positioning and the raise."
      }
    ]
  },
  {
    "type": "numbered",
    "kicker": "The evidence",
    "h": "Two pilots, the same flood",
    "items": [
      {
        "title": "Zydus Lifesciences",
        "body": "One posting pulled a flood of CVs across roles within a day or two, into a decentralised process with an underused talent pool."
      },
      {
        "title": "Increff",
        "body": "A tech hiring push brought in more than 3,000 resumes in a single week, with panels unavailable and interview-to-offer conversion suffering."
      },
      {
        "title": "What we set out to move",
        "body": "The time from posting to a shortlisted, engaged, interviewed candidate, without adding recruiter headcount."
      }
    ]
  },
  {
    "type": "figure",
    "h": "The work that buries hiring",
    "p": [
      "The people meant to evaluate that talent were instead drowning in the mechanics of moving it: screening, ranking, chasing candidates for availability, scheduling, taking notes, updating the ATS."
    ],
    "fig": "executionFlood",
    "figure": "The execution flood: a role goes live and CVs pour in faster than anyone can read.",
    "layout": "split"
  },
  {
    "type": "phaseDivider",
    "n": "01",
    "name": "The bet",
    "sub": "An AI employee, not another tool"
  },
  {
    "type": "figure",
    "h": "You brief her, you don't configure her",
    "p": [
      "The obvious version of this product is a dashboard with AI features bolted on, a smarter ATS. We killed that direction early: more buttons is the opposite of the problem. The execution load does not drop when you add a feature, it drops when someone else does the work.",
      "So Stella is a teammate you brief, the way you brief a new hire: tell her the role, hand her the criteria, point her at the candidates. Where a normal SaaS would show a settings panel, we showed a conversation."
    ],
    "image": "/figures/dassh/stella-chat.jpg",
    "figure": "Stella's conversational home: a hiring manager briefs a role instead of filling out a form.",
    "layout": "split"
  },
  {
    "type": "phaseDivider",
    "n": "02",
    "name": "Four people, one product",
    "sub": "One data model, four purpose-built experiences"
  },
  {
    "type": "numbered",
    "kicker": "Who's reading",
    "h": "Hiring is not one user",
    "items": [
      {
        "title": "Stella, chat-first",
        "body": "Full screen, almost no chrome. The founder asks a question; the conversation is the interface."
      },
      {
        "title": "The agency view",
        "body": "The dense power-user surface: tables, filters, kanban, bulk actions, built for eight hours a day."
      },
      {
        "title": "The manager view",
        "body": "Summary-first. The system writes the first thing you see, with green, amber and red health signals."
      },
      {
        "title": "The candidate side",
        "body": "A light portal plus the messages, calls and interviews, designed to feel like texting a helpful person."
      }
    ]
  },
  {
    "type": "figure",
    "h": "Onboarding is a conversation",
    "p": [
      "Rather than ship one interface and water it down for everyone, I designed four, all reading from the same underlying data and all anchored to the same atomic unit, the job.",
      "Not all four went equally deep at once: the screening agent and the daily report shipped deepest first, with the other surfaces designed and staged on the roadmap behind them."
    ],
    "fig": "stellaOnboarding",
    "figure": "Stella greets you and guides setup, connect the ATS, set preferences, pick a plan, ticking the checklist off as you go.",
    "layout": "split"
  },
  {
    "type": "phaseDivider",
    "n": "03",
    "name": "Anyone can create an agent",
    "sub": "Four steps from hiring intent to a working agent"
  },
  {
    "type": "figure",
    "h": "One spine for every agent",
    "p": [
      "Under the four experiences sits a system of purpose-built agents, each owning one step of the pipeline. The hard design problem was creation: how does a recruiter turn what they want into a working agent without learning a new vocabulary?"
    ],
    "ul": [
      "Link it to a job",
      "Define what it should evaluate",
      "Give it candidates",
      "Set what happens next"
    ],
    "fig": "agentWizardFff",
    "figure": "The four-step creation flow, the same spine for every agent type. Every step offers a template, an AI draft from the job description, or your own upload.",
    "layout": "split"
  },
  {
    "type": "methodFinding",
    "h": "The screening agent shows its work",
    "finding": "Each criterion is tagged Essential, Valuable or Not preferred, so the recruiter's priorities are legible to the AI and to any human reviewer.",
    "p": [
      "And the screening agent returns more than a yes or no: a match score, skill and experience breakdowns, a gap analysis and a priority ranking, so a human can audit the call in seconds instead of re-reading the CV."
    ]
  },
  {
    "type": "phaseDivider",
    "n": "04",
    "name": "What the pilots changed",
    "sub": "Live roles taught us what no mockup could"
  },
  {
    "type": "methodFinding",
    "h": "The misread we almost built",
    "finding": "In every early conversation, users asked for agent performance. They actually cared about job performance.",
    "p": [
      "How many CVs did the screening agent read overnight, which agent is pulling its weight. It sounded like exactly the right question for an AI product, and we came close to shipping a control panel for the machines.",
      "Then we mocked it and put it in front of a recruiter. She glanced at the overnight count, said okay, and every question that followed walked straight past the number: which of these do I need to look at, is my req going to close, if one candidate is wrong it is my name in the room."
    ]
  },
  {
    "type": "statement",
    "kicker": "The tell",
    "text": "Agent performance was the doorway. Job performance was the room."
  },
  {
    "type": "numbered",
    "kicker": "The hierarchy flip",
    "h": "Every surface now leads with the outcome",
    "items": [
      {
        "title": "Lead with the job",
        "body": "Is this role going to close, well, fast and fairly, in the reader's own register. The founder never sees an agent counter at all."
      },
      {
        "title": "Demote the agents",
        "body": "Agent activity is a drill-down you open when a job is off-track and you need to know which agent to tune."
      },
      {
        "title": "Keep the machine out of sight",
        "body": "The recruiter gets the reasoning behind each shortlist, one tap in. The candidate sees her status, a real date, and a human behind the decision."
      }
    ]
  },
  {
    "type": "methodFinding",
    "h": "Asking about the day, not the dashboard",
    "finding": "Ask people what they want on screen and they design their old tools back at you.",
    "p": [
      "So we switched to Mom Test questions and asked about their days instead. Walk me through yesterday. What did you check first this morning? What does a bad week look like?",
      "Across every one of those conversations, one sentence kept coming back in different words: I want to know how the job is doing."
    ]
  },
  {
    "type": "figure",
    "h": "The composition that won",
    "p": [
      "Our first translation was embarrassingly standard: a dashboard that showed everything at once. It looked complete, and it answered nothing, because it left the reader to do the reading."
    ],
    "ul": [
      "Agents summarized in one strip up top, present but compressed",
      "The jobs list beneath, because jobs are what people are accountable for",
      "A generative read across the day: what changed, what is off-track, what needs a decision"
    ],
    "fig": "evolutionTimeline",
    "figure": "The surface finding its shape: from a screening list to a show-everything dashboard to the workspace that won.",
    "layout": "split"
  },
  {
    "type": "figure",
    "h": "The homepage is a daily report",
    "p": [
      "Different every time, because it reflects what changed since you were last there. It answers three questions in order of urgency: what is broken, what needs you, what happened.",
      "The same report adapts to its reader, dense and numbers-forward for the agency recruiter, a short narrative with health cards for the manager, and it reaches you where you already are: in the app, as a morning email, as a WhatsApp message from Stella."
    ],
    "fig": "dailyReport",
    "figure": "The briefing that writes itself: broken first, decisions second, momentum last, regenerated since your last visit.",
    "layout": "split"
  },
  {
    "type": "phaseDivider",
    "n": "05",
    "name": "A design system that drove codegen",
    "sub": "Breadth on a tiny team, turned into a design decision"
  },
  {
    "type": "figure",
    "h": "The contract that made the engine useful",
    "p": [
      "Four experiences and three engineers do not add up unless design output stops being the bottleneck. The Figma-to-code engine was existing infrastructure; what I built was the design system contract that made it produce usable output: clean frame names, real component descriptions, tokens instead of hardcoded values.",
      "Mark a component Ready for Dev and the engine generates the React and CSS, compares the result against the design with a visual diff scored out of 100, and drops it into Slack. The engineer polishes the last few percent and wires up the logic."
    ],
    "fig": "figmaToCode",
    "figure": "The pipeline: Ready for Dev in Figma, generated React scored against the design, delivered to the team.",
    "layout": "split"
  },
  {
    "type": "figure",
    "h": "Pilots, live at real enterprises",
    "p": [
      "Zydus Lifesciences, Increff, Cholamandalam, HCPL, Atomberg and Tophire ran live hiring on Stella, across pharma, retail, manufacturing and insurance, all inside each customer's existing ATS."
    ],
    "image": "/figures/dassh/clients.jpg",
    "figure": "The enterprises running live hiring on Stella.",
    "layout": "media"
  },
  {
    "type": "impact",
    "mark": "Impact",
    "h": "The execution load moved to Stella. The judgement stayed human.",
    "metrics": [
      {
        "value": "2 days",
        "label": "About two days from posting to a shortlisted, engaged, interviewed candidate, down from weeks"
      },
      {
        "value": "6",
        "label": "Enterprise pilots running live hiring"
      },
      {
        "value": "4 to 20",
        "label": "The founding four grew to a team of around twenty across the year"
      },
      {
        "value": "₹1.2 Cr",
        "label": "Raised as the year closed. Context, not the point: the pilots were real enough to fund the company"
      }
    ]
  },
  {
    "type": "closing",
    "h": "The rule the pilots left us: job performance is the end, agent performance is the means.",
    "p": [
      "Every surface leads with the outcome a person is accountable for, and the machines surface only when something needs tuning. That rule came from watching real recruiters work, not from a design review.",
      "I would still sequence the four experiences more ruthlessly: take Stella all the way to excellent and let it pull the others, rather than advancing all four at once."
    ],
    "kind": "outcome"
  },
  {
    "type": "closing",
    "h": "Thank you",
    "p": [
      "Stella went from zero to running live hiring in a year. The execution moved to the agent. The judgement, the interview and the decision stayed exactly where they belong, with people."
    ],
    "kind": "thanks"
  }
];
