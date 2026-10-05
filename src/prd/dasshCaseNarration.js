// The Dassh case-study (dassh-v2) walkthrough, written to be SPOKEN: first person, a
// designer narrating the calling-agent project to you. Fed to NarrationPlayer, which
// reads it aloud via the browser's speech synthesis and karaoke-highlights it. Authored
// so each paragraph splits cleanly into sentences (no abbreviations, no "e.g."), and
// numbers are spelled for natural speech. No em-dash, no tilde.
//
// Mirrors the 13 written sections in App.jsx caseStudies["dassh-v2"], condensed to what
// carries in speech. Source facts: Claude/dassh-rewrite-brief.md and the four verified
// research briefs (Claude/dassh-gujarati-research.md, dassh-call-craft-research.md,
// dassh-disclosure-research.md).

export const dasshCaseNarration = {
  title: "The walkthrough, narrated",
  subtitle: "The call that had to be worth answering, in the designer's voice",
  audio: "/narration/dassh-v2",
  paragraphs: [
    "Let me walk you through the piece of Dassh I care most about, the first round phone screen an AI recruiter runs before anyone touches a resume. I want to start with one call, because it is the reason the rest of this exists. A candidate picked up and said, out loud, that he was looking for a job. Not a maybe. He was telling the machine on the other end the one fact the whole system existed to act on. The agent thanked him, confirmed his details, and hung up, because its mandate was to confirm fields, not to capture intent. I only found him because I read through call transcripts one by one for three weeks. Then I called him myself and told him he was still in the pipeline. That is the least scalable thing I did on this project, and the most important one.",

    "Here is why a phone screen is the hardest surface in hiring to get right. From a recruiter's side it looks like the most repetitive thing they do, the same handful of questions asked hundreds of times, which is exactly why it looks automatable. But stand on the other end of the line. The candidate is often answering in a second or third language, from a factory floor or a shared phone, from a number they do not recognize, in a country where job scams are common enough that suspicion is the sane default. They need the job far more than the system needs them. That imbalance is the whole design problem, so I made one decision early and let it govern everything else. On this surface, the candidate is the primary user, not the recruiter paying for it.",

    "The research behind this was about three hundred candidate call transcripts, read rather than sampled, plus a tightly coded field log of forty three calls over ten days with a note kept against every single one. Then I called forty seven of those candidates myself, over three weeks, because the transcripts alone were quietly lying to me. What people said and what the system recorded were not always the same thing, and people kept raising needs the script had no field for.",

    "The number that mattered was not who picked up. It was what happened after. About a quarter of the connected calls, ten out of forty three, died before a single screening question was asked. The candidate had already done the hard part, decided we were not a scam, and stayed on the line, and then the system dropped them. The mechanism is latency. Production voice agents were answering in something like one and a half seconds where a real conversation runs on a gap closer to two tenths of a second, and past about a second of silence, a person assumes the call has failed and hangs up.",

    "The first version we built was one ambitious, do everything agent, a single open flow for anyone who picked up. It failed on completion, not on intelligence. What actually beat it was granularity, splitting the flow by role level, by how much Gujarati sits inside the conversation, by job type, and by whether the candidate was fresh or being re-engaged cold from an old database. One flow could not hold all four of those differences at once.",

    "Before I changed a single word of the script, pickup moved just by changing when we called. Availability by hour turned out to be predictable by job type, and the surprise was that for some roles the best window was the candidate's commute, a short call with nobody around to interrupt it. I will say plainly that the retiming and the flow rewrite shipped in the same window, so I cannot tell you exactly how much of the lift came from each one.",

    "Every call now opens by asking whether this is a good time to talk. In a cold sales call that line performs badly, it is one of the easiest ways to get a hang up. But this is not a sales call, it is an unscheduled call to someone who already applied for a job, and the psychology runs the other way. Most candidates did not take the exit. They proposed their own callback time instead, and those rescheduled calls turned into some of the most engaged conversations we had, because a person who sets their own appointment has actually committed to it.",

    "I also had to tune how the agent sounds, in both directions. Faster almost everywhere, because the latency itself was the main killer. But deliberately slower right after a candidate says something that cost them something, because an instant reply in that moment reads as nobody having listened. I want to be honest about one claim I nearly made and did not. I could not find real evidence that adding background noise makes a synthetic voice sound more trustworthy, and the closest research actually argues the opposite. So the ambient sound in this call does one job only, telling the candidate the line is still live, the same reason phone systems have generated comfort noise for decades. It is not standing in for a person.",

    "Language needed the same honesty. The candidates who needed this agent most were factory workers in Ahmedabad, and they speak Gujarati woven into English, not one language handed over cleanly. I originally wrote that the agent asks a candidate's preferred language and switches to it. That was wrong, and I have corrected it. Proficiency is not something you can ask about honestly on a cold call, people say they are comfortable in English out of politeness and then struggle. What actually works is a light nudge in Gujarati, and then mirroring whatever the candidate does on their first real answer. I also want to name a gap honestly. We never checked whether completion was worse for a rural accent than a city one, and that is the equity question this design opens and does not yet answer.",

    "The candidate from the very start of this walkthrough is the reason for the biggest architectural change. A single scripted agent cannot both confirm a checklist and hear everything a person might volunteer, adding more questions only makes the call longer, which is the thing already killing it. So we split the work. The scripted flow keeps moving through its questions, and underneath it, separate agents listen in parallel for intent, for distress, for whether the candidate is actually following, and for the moment a human needs to step in. A person is more than the fields you called to collect. That sentence is the whole architecture.",

    "One more story belongs here, even though it is not about the call. Early on, every conversation with users pulled us toward showing agent performance, how many resumes were read overnight, how accurate the model is. It looks like exactly the right metric for an AI product, and we nearly shipped a control panel for the machines. But nobody is measured on an agent's connect rate. People are measured on whether the role closes, and whether the shortlist they forward holds up in the room. Agent performance was the doorway. Job performance was the room. It is the same mistake as the call, a system showing you what it cares about instead of what you actually needed.",

    "Here is the number, stated carefully. Of the calls that connect, seventy one percent now complete the whole screen, up from thirty five to forty percent before this work. I want to be precise, that is measured over calls that connected, not over everyone dialled, and I will not blend those two figures into one sentence just to make the arc look steeper. What matters more to me is what the candidate actually gets now, told plainly what the call is, asked whether now suits them, heard when they say something the form did not ask for, and told what happens next either way.",

    "If I did this again, I would fix three things. I would never ship two changes in the same window without separating their effects, the way I did with the retiming and the flow rewrite. I would instrument language and dialect from day one, because our aggregate number could have hidden real unfairness and still gone up. And I would measure the one number we never did, how often a human actually overturned what the system recommended, because a screening system that only reports speed is, from the outside, indistinguishable from a very fast way of rejecting people.",
  ],

  // The interviewer layer: the question a reviewer would ask at this point, the
  // answer to say aloud, and an optional brainstorm note. Keys are paragraph indexes.
  asks: {
    3: [
      {
        q: "Ten out of forty three is a small, hand-recounted number. How solid is it?",
        a: "It came from going back to the study's own appendix rather than trusting its headline stat. Fifteen calls carried the raw incomplete status, but five of those were coded no-answer, not a collapse, so ten is the defensible count, and three of those ten carry a verbatim recruiter note proving the candidate had actually engaged. It is smaller than the number I first wrote, and it survives someone checking my own appendix, which the bigger number did not.",
      },
    ],
    5: [
      {
        q: "You changed the timing and the script in the same window. How do you know which one worked?",
        a: "Honestly, I do not, not cleanly. Both moved together and nobody logged their effects apart. I say that plainly rather than claim credit I cannot support, and it is the first thing I would build differently next time, instrument before you change two variables at once.",
      },
    ],
    7: [
      {
        q: "Sales data says asking permission hurts conversion. Why would it help here?",
        a: "Because the mechanism is different. A cold sales call is optional to begin with, so an easy exit kills it. A job screen is a call someone already asked for, and an unscheduled one feels imposed, so offering a real choice reduces the resistance that imposition creates rather than inviting a rejection nobody wanted to give. Different psychology, not the same interaction wearing a different script.",
      },
    ],
    8: [
      {
        q: "Why bring up a claim you decided not to make?",
        a: "Because I think that is the more useful thing to model. I went looking for evidence that ambient noise builds trust, found the opposite, and wrote the honest, smaller claim instead of the flattering one. Showing that discipline matters more to me than the noise trick itself.",
      },
    ],
    11: [
      {
        q: "Seventy one percent of what, exactly?",
        a: "Of calls that connected to a live candidate, not of everyone dialled. Completion of the dialled figure cannot be higher than the pickup rate itself, so I keep the two numbers in separate sentences on purpose. It is a smaller claim than blending them would produce, and it is the one I can defend.",
      },
    ],
    12: [
      {
        q: "You built a whole trust layer and never measured the revert rate. Isn't that the most important number here?",
        a: "Yes, and I say so directly. We measured whether the call finished, not whether the system was right, and those are different questions. If I built this again, the revert rate is the first instrument I would add, before any new feature.",
      },
    ],
  },
};
