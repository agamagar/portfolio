// The Edge (codename JARVIS) walkthrough, written to be SPOKEN (first person, a
// designer narrating the problem-framing PRD to you). Fed to NarrationPlayer,
// which reads it aloud via the browser's speech synthesis and karaoke-highlights
// it. Authored so each paragraph splits cleanly into sentences (no abbreviations,
// no "e.g."), and numbers are spelled for natural speech. This is a WIP
// problem-framing doc, so the narration speaks to the framing, the competitor
// map, the whitespace, and the voice-as-design-system, and does not claim shipped
// results or invent metrics. No em-dash, no tilde.

export const jarvisNarration = {
  title: "The walkthrough, narrated",
  subtitle: "Edge, in the designer's voice",
  audio: "/narration/jarvis",
  paragraphs: [
    "Let me walk you through Edge. Edge, codename JARVIS, is the intelligence layer we are building for the brand managers who advertise on Zepto. Before I show you any of it, one honest note. What you are reading is a problem-framing document, not a shipped feature. I wrote it to find the real problem before anyone drew a screen. And the real problem is not a dashboard. A brand manager can already see every number Zepto has and still not know what to do next. Edge is about closing that gap, from the metric, to the insight, to the one action worth taking. But there is a catch underneath it, and it shaped everything. An ads platform that recommends more ad spend has an obvious conflict of interest, and brands are not naive about it.",

    "So why build this now. Quick-commerce ad spend is roughly doubling in a single year, by industry estimate, and that kind of money attracts company. The pressure that made this urgent has a name. GobbleCube, an outside bot built by founders who came out of Blinkit, is already sitting inside HUL, Tata, and Reckitt. It ranks a brand's problems over dashboards, and it does that from on top of Zepto's own platform. That is the quiet threat. If Zepto does not build the intelligence layer, someone else builds it on top of us and reduces the platform underneath to a dumb pipe. Edge is the answer to that from the inside.",

    "I ran the framing as a discovery process, the first four steps of the IDEO method. Frame the questions, gather inspiration and map the competitors, synthesize for action, then generate ideas. The team handed me three things they were worried about. Serving brands of wildly different sizes, from a single-product seller to a giant with dozens of sub-brands. Showing correlations in the data defensibly. And deciding what to suggest, and when. I kept those three questions verbatim and let the research surface a few more, which left seven how-might-we questions as the spine of the whole document.",

    "The second step was the competitive teardown, and I did not want to guess my way through it. I ran it as a multi-agent research sweep across six domains, twelve incumbents in all, from GobbleCube to Amazon Ads to Tableau Pulse, over thirty-five cited sources. Every domain agent was paired with a verify agent, and every vendor performance claim got tagged and fact-checked before it was allowed to shape a single decision. The headline that came back was clarifying. The incumbents have already solved the plumbing. Nested accounts for big org charts, brand-family mapping, significance-ranked driver analysis, goal-readiness scores that rank suggestions by impact. None of that is whitespace anymore.",

    "But there was one thing none of them had touched, and it is the insight I am proudest of, because it came from the framing and not from a screen. Every incumbent differentiates by permission and scope, by who is allowed to see what. Not one of them adapts the view to the person's altitude. A media buyer, a brand lead, and a leadership team are all looking at the same data, but they need it framed three completely different ways. Today executives get operator noise, and operators get executive abstraction, and nobody markets a fix. Rendering one data spine at three altitudes became Edge's most defensible idea. That is the clear whitespace.",

    "Then there is the driver problem, which is harder than it looks. When a brand's sales or its return on ad spend moves on Zepto, every tool can show you that it moved. Almost none can tell you why, defensibly. And the trap is that Zepto's data is a mesh, many brands across many cities across many products, so raw correlation happily hands the credit to the wrong cause. The discipline I borrowed from marketing-mix modeling is blunt about this. A strong statistical fit is not proof. So the answer Edge has to build is a significance-ranked waterfall that decomposes the move across the brand's own dimensions, controls for the obvious confounders like a festival or a competitor stockout, and prefers real incremental lift over a flattering correlation.",

    "Which brings me back to trust, and to the two rules I wrote before any of the design. The first rule. Every suggestion has to visibly serve the brand's goal, not Zepto's revenue. That is the only thing that turns Edge's first-party access into trust instead of suspicion, and it is the exact gap the incumbents get criticized for. The second rule. Every suggestion has to be legible and reversible. Lead with the symptom, attach the driver and an honest confidence caveat, quantify the predicted impact, and gate anything that moves money behind an approve-and-audit step. Trust is earned by being easy to check and easy to undo, never by an opaque score.",

    "There is one part of this I treated as a design surface in its own right, and that is the voice. Most AI products default to a tone that is polite, hedged, and long, which for a brand manager mid-campaign is just friction. So I wrote Edge's voice as a design system. Direct, tactical, forward. Specific numbers over adjectives, because twelve thousand rupees wasted lands harder than significant waste. Verbs that actually move, shift, pause, rotate, cut. Every message ends with a next step. And a banned-word list that catches the corporate register on sight, leverage, synergize, seamless, circle back. Voice is the part of an AI product a user touches most, so it deserved a spec, not an afterthought.",

    "The reason Edge can win from the inside is a trust boundary an outside bot structurally cannot cross. An external tool ingests or scrapes Zepto's data secondhand. Edge sits on the real thing, PIN-code-level, minute by minute, and it can write an approved change straight back into the auction. The sharpest example is the one alert only Zepto could ever build. The moment a brand is advertising a product that its dark stores are about to run out of. That is money actively burning, it is native to quick-commerce, and no bot on the outside can see it in time. That alert is the wedge.",

    "So let me be honest about where this stands. This document is only the first four steps. Frame, gather, synthesize, generate. Making the ideas tangible, testing them with real brand managers, and folding them into the build-out is the next phase, and I have deliberately kept scope, success metrics, and sizing out of it, because this frames the problems, it does not pretend to have solved them. If there is one thing to take from it, it is that the most defensible idea Edge has, the three-altitude view, did not come from a screen or a clever interaction. It came from taking the framing seriously before anyone opened Figma. That is usually where the real work is.",
  ],
  asks: {
    0: [
      {
        q: "The product has not shipped. Why is this a case study and not a proposal?",
        a: "The wedge shipped: recommendations and a predicted-performance review, run as live experiments, about 30% adoption and roughly 60L a month, and that de-risked the copilot. Edge v1 is the specified continuation, about a month from rollout. This documents shipped experiments plus a pre-registered scoreboard, not a proposal.",
      },
    ],
    3: [
      {
        q: "The competitive research was run by AI agents. What was your design contribution versus the tool's output?",
        a: "The agents gathered and fact-checked 35 sources; the synthesis judgment was mine. [you fill: one concrete synthesis call the agents did not produce, a rollup you rejected, a problem you reframed, an option you killed.]",
        note: "Without one concrete example this is the most attackable sentence in the case.",
      },
    ],
    5: [
      {
        q: "Thirty percent of what denominator? And incremental versus what control?",
        a: "About 30% of the advertisers exposed to the experiments adopted them. On incrementality, I need to state the baseline honestly rather than let the word carry it. [you fill or confirm: the denominator and whether there was a holdout, from the ads analytics.]",
        note: "Nail the denominator and the control before any interview; an un-caveated incremental is self-inconsistent with the case's own rigor.",
      },
    ],
    6: [
      {
        q: "Your invariant says serve the brand, not Zepto's revenue, but your scoreboard measures budget growth. Is that not a contradiction?",
        a: "Fair catch, and I would rather name it than dodge it. They align through iROAS: good guidance grows the spend a brand actually wants to make. But I am precise about what the design enforces, disclosure and reversibility, not neutrality. It cannot structurally stop an honest spend-increasing suggestion; it makes every one legible and auditable. Budget growth is a proxy for delivered value, with that caveat said out loud.",
      },
    ],
  },
};
