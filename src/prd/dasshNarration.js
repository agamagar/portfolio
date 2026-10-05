// The Dassh PRD walkthrough, written to be SPOKEN (first person, a designer
// narrating the project to you). Fed to NarrationPlayer, which reads it aloud via
// the browser's speech synthesis and karaoke-highlights it. Authored so each
// paragraph splits cleanly into sentences (no abbreviations, no "e.g."), and
// numbers are spelled for natural speech. Dassh is an early working draft, so the
// script speaks to the thinking and the bets, and stays honest about what is not
// settled, rather than claiming shipped results. No em-dash, no tilde.

export const dasshNarration = {
  title: "The walkthrough, narrated",
  subtitle: "Dassh, in the designer's voice",
  audio: "/narration/dassh",
  paragraphs: [
    "Let me walk you through Dassh. I should say up front that this is a working draft, an early version of the thinking, not a shipped product with a scoreboard of results. So I will show you the bets, not the metrics. The problem it starts from is one every recruiter knows in their bones. Setting up a hiring pipeline today means stitching together disconnected tools, an applicant tracking system for the record, spreadsheets for the criteria, a calendar for scheduling, email and WhatsApp for outreach. Every handoff adds delay, drops context, and lets good candidates slip. People spend more time configuring the tools and shuffling candidates between stages than actually evaluating talent. So the framing that anchors the whole thing was sharp, and I kept coming back to it. Recruiters do not need another tool. They need a teammate.",

    "That one word, teammate, changes what you build. In Dassh everything anchors to a Job, which is the atom of the entire platform. Every agent, every candidate, every metric, every report rolls up to a Job. Inside a job, autonomous agents each own one discrete step of the pipeline, screening, calling, interviewing, assessment, sourcing, scheduling, the follow-up messages. Each one takes an input, does the task, produces an evaluation, and hands off to the next. And the human's job changes shape. It shrinks from doing the work to deciding on the work the agents have already done.",

    "The defensible idea here is not AI in recruiting, because everyone says that now. It is the teammate framing made literal. An org-wide fabric of agents on one shared candidate spine, where each pipeline step is a colleague that does the work and hands off, not a feature you have to operate. And that gives you the bar I held every screen against. The product earns its place by the work it removes, not the screens it adds. A screen that adds one more step for a person to operate is a screen to be suspicious of.",

    "There is a second rule underneath that one, and it is where the design has to get careful. The human owns the verdict. Agents can screen, score, and recommend, but they do it in full view, with a match score, a skill and experience breakdown, a gap analysis, a priority ranking, all of it on the table. A person confirms the consequential calls, the shortlist, the reject, the interview, the offer. Trust is not earned by hiding the reasoning and looking confident. It is earned by being legible and easy to override. That is the line the whole product has to walk.",

    "The surface that is furthest along is the CV Screening agent, and it became the reference pattern for every other agent to come. You create one through a four-step wizard, and the feeling I was after was briefing a smart colleague, not filling in a form. You link the job, you set the checklist of what good looks like, you point it at the candidates, then you decide how much it is allowed to do on its own. Complexity reveals itself gradually instead of all at once. And every step gives you three ways in, have the thing already, generate it with AI, or upload your own, so nobody hits a wall because their data lives somewhere else.",

    "The hardest design problem was the homepage, and it opened with a trap. On a platform where agents do most of the work, the obvious thing to show is the agents. In every early conversation that is exactly what people asked for. How many CVs did the screening agent read, how accurate is it, which agent is pulling its weight. It was seductive, because it looked like the right question for an AI product, concrete and countable and easy to build tomorrow. And we very nearly shipped a control panel for the machines.",

    "What turned it was one recruiter in a session. She dutifully asked to see how many CVs the screening agent had processed overnight, so we showed her the number, forty-seven across five roles. She looked at it, said okay, and then asked the question that reframed the whole product. But which of these do I actually need to look at? Is my backend role going to close? If I forward this shortlist and one candidate is wrong, it is my name in the room, not the agent's. She had walked straight past the forty-seven. The count was never the thing. It was the door she knocked on because no tool had ever once shown her what was behind it.",

    "So we reframed the whole surface around one distinction. Job performance is the end, agent performance is the means. Every person is accountable for a job outcome, is this role going to close, well and fast and fairly, not for how busy the AI was. The homepage leads with the job outcome each person owns, in their own language. And agent statistics stop being the headline. They become a drill-down you open only when a job is off track and you need to know which agent to tune. Nobody opens the calling agent's connect rate because it is Tuesday. They open it because a role went cold.",

    "That thinking became the signature surface, the Daily Report. The idea is that the homepage is not a static dashboard, it is a generated briefing, different every visit, reflecting what actually changed since you were last there. It answers three questions in order of urgency. What is broken comes first, a stalled pipeline or a failing agent. What needs you comes next, the decisions only a human can make. What happened comes last, the momentum you can scroll through. And I wanted it to do one thing more than be efficient. It should open by naming you and speaking in your register, so the first feeling is that someone has your back, not here is more data.",

    "The same job-and-candidate spine is shown at four different altitudes, because the people who share this screen share almost nothing else. A CEO reading a board-ready sentence, a head of talent watching funnel health across hundreds of roles, recruiters who live in tables all day, and a candidate months into the black hole. Each one meets the product where they stand. The candidate view is the clearest test of the whole principle. It carries no agent metric at all, just where she stands, a real date, and the promise that a person owns the call.",

    "I want to be honest about what is not settled, because a draft that hides its holes is not worth trusting. The business is the biggest gap, there is no pricing, no go-to-market, no funding story written down yet. The proposed north-star metric, trusted autonomous advances, the share of stage-advances a human accepts without overriding, is a proposal, not a decision. Most of the agents beyond screening are still described, not yet designed. And the deepest risk is one you cannot design away, you only learn the screening was right after the candidate actually progresses, so trust has to build slowly. If there is one thing to take from this, it is the spine the whole product hangs on. Build the teammate, not the tool. Judge it by the work it removes. And never let the machine take the verdict out of the person's hands. Show the job, not the machine. That is the bet.",
  ],
  asks: {
    0: [
      {
        q: "Consultant and director, which were you really, and how much of this is yours?",
        a: "[you fill: your actual contractual role. The PRD team list says Agam Agarwal, Product and Design, with no director title. If director meant advisory and founding scope rather than an officer title, say plainly: I was the sole product designer, and I also advised the founder on positioning and the raise.]",
        note: "Do not present one role as two flattering titles; pick the true one and own its scope.",
      },
    ],
    3: [
      {
        q: "You built an AI that screens and interviews people. What about bias, consent, and the person being screened?",
        a: "I designed for it. Recorded, spoken consent as the mandatory first script block. Demographic-cliff checks so scores do not skew against exactly the India-context candidates we serve. The human always owns the verdict. And the candidate, the person months into the job-search black hole, was a first-class persona, not an afterthought. A machine that rejects people at scale has to earn that.",
        note: "This depth exists in the PRD and was cut from the case; lead with it when ethics comes up.",
      },
    ],
    4: [
      {
        q: "The design system that wrote its own code, did you build the engine or feed it?",
        a: "The engine was existing infrastructure. I built the design system that made it produce usable output: clean tokens, named frames, a component contract. The pipeline's quality was a direct function of my design hygiene. I designed the contract that drove the codegen, not the codegen itself.",
      },
    ],
    10: [
      {
        q: "Pilots are not paying retention. How do you know Stella works beyond a demo?",
        a: "Honestly, the pilots proved pipeline speed, not yet hire quality or paid retention; that is the real gap. What I stand behind is the design judgment, especially the job-versus-agent reversal, and that enterprises ran it live on real requisitions.",
      },
    ],
  },
};
