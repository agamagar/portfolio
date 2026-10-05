# Prompt research: design leads and company leadership (sourced 2026-09-04)

Scope: what each function produces, the words its practitioners use, what separates a convincing artefact from a generic one, the inputs a model needs, and proposed prompt material. Every claim carries a source number from the Sources list. "Inference" marks my reading of a source; "UNVERIFIED" marks things I could not fetch. Gaps are named, not filled.

## Design leads

### 1. What the function produces
- Critique (crit): a continual, designer-initiated analysis of whether a design achieves its stated goals; explicitly NOT a sign-off [2]. Figma runs six forms (standard, jams, pair design, silent, paper, FYI) toward four goals: unblocking, elevating quality, encouraging consistency, sharing context [1].
- Design review: "centered around signoff and approval", milestone-driven, process-driven [2]. Stripe's version is a product quality review where the room uses the product instead of watching a deck ("Let's just use the product") [7].
- Design brief / problem statement: customer outcome, why they want it, what is most painful now; explicitly "isn't a PRD or a spec" [11]. Intercom's 10-step process starts with defining what users need and what success looks like before any design [10].
- Quality bar / craft rubric: craft is the how (thinking, work, mastery); quality is the output, scored on utility, usability, beauty; Stripe scores 15 "essential journeys" quarterly on utility, usability, craft, beauty [7].
- Hiring scorecard and portfolio review: the work is judged on the idea (rationale), usability, craftsmanship; the person on proactivity, critical thinking, thoughtfulness, collaboration, values [6]. Excellent candidates narrate what did not work and what they abandoned [5].
- Design principles: short named commitments with one-line rationale (Airbnb: unified, universal, iconic, conversational [8]; Atlassian: build trust in every interaction, connect people, match purpose and feel familiar, drive momentum end to end, guide mastery [9]).
- Design system governance note: nothing solid fetched. Nathan Curtis's contribution-model articles were blocked (403); search snippet only, UNVERIFIED: a contribution is work by someone outside the core team released through the system for reuse.
- Design debt register: "the cohesion and consistency of a design deteriorates over time as new experiments are run"; causes are fire drills, competing teams, feature testing, tech debt; paid down by a refactoring cycle after small iterations [12].
- Performance feedback: Situation, Behaviour, Impact; quote the role rubric, group feedback under those quotes, keep it to observed facts, include other reviewers' fact-based observations [14]. Grove: share the written review before the meeting so the person can process it privately [15].
- Team ritual plan: crit is a scheduled rhythm with room size, topic scheduling, a note-taker, max two topics per hour, plus crit outside the weekly meeting [1]. One-on-ones sized to task-relevant maturity (weekly for low, monthly for high) [15].

### 2. Vocabulary
| TERM | meaning | why it belongs in a prompt | source |
| --- | --- | --- | --- |
| critique vs feedback | feedback is "nothing more than just a gut reaction"; critique asks how a design is or is not achieving goals | stops the model returning reactions | 2 |
| critique vs review | review = "signoff and approval"; critique = "continual process of analysis" | forces the model to say which one it is writing | 2 |
| goals / the ask | presenter states "Here's the feedback I am looking for" and "Here's what I'm NOT looking for" | scopes the output | 1 |
| clarifying questions | a named stage before feedback: present context, clarifying questions, feedback, thanks and follow-ups | questions before opinions | 1 |
| no problem-solving | rule 1 of critique: "avoid problem-solving and design decisions" | analysis only, no redesigns | 2 |
| intent / intentional | "Design is the act of intentionally trying to influence an outcome"; good candidates show "every decision they've made has a purpose" | separates intent from execution | 4, 6 |
| execution | "the actually doing part after you make a plan"; bad execution picks two of time, quality, cost; good chooses scope | vocabulary for the execution half | 3 |
| craft vs quality | craft = the how; quality = the output; "rarely quality without craft" | rubric axes | 7 |
| utility, usability, beauty | Stripe's three quality levels; beauty "can elevate utility and usability" | scoring dimensions | 7 |
| MVQP | "Minimum Viable Quality Product" | names the floor, not the ceiling | 7 |
| friction log / walk the store | PMs, engineers, designers use the product as customers and log every pain | evidence method for a review | 7 |
| presentationing | the failure mode of reviewing decks instead of product | avoid-word | 7 |
| problem statement | outcome + why + current pain; not a PRD | brief structure | 11 |
| layers: outcome, structure, interaction, visual | review one layer at a time, do not mix concerns | orders a crit | 10 |
| heuristic | "broad rules of thumb and not specific usability guidelines" (Nielsen's 10) | shared checklist language | 13 |
| design debt | cohesion lost over time; "reciprocal awareness" between new and old elements | names the register | 12 |
| refactoring cycle | "a large iteration" that consolidates patterns after experiments | the pay-down unit | 12 |
| the idea / usability / craftsmanship | Zhuo's three portfolio criteria | scorecard columns | 6 |
| SBI | Situation, Behaviour, Impact; fact-based | feedback sentence shape | 14 |
| task-relevant maturity | how experienced the person is at this task; sets 1:1 cadence and delegation | ritual and feedback dosing | 15 |
| principles as guardrails | Airbnb/Atlassian each pair a name with a one-line "because" | principle shape | 8, 9 |
| calibration | nothing solid found in fetched sources; do not use in prompts without a source | UNVERIFIED | none |

### 3. What separates convincing from generic (per practitioners)
- A crit restates the goals first, asks clarifying questions, then analyses fit-to-goal; it never redesigns [1, 2]. Zhuo: "fewer off-the-cuff opinions; more questions" [3].
- It says what kind of feedback is wanted and what is out of scope, in the presenter's own words [1].
- A review is run on the product, not the deck, and admits when the bar is not met even if that delays shipping; "micro-decisions every day" make a product mediocre [7].
- A brief names the outcome and pain, not the feature customers asked for (tickets vs tracking status) [11]; Intercom insists on testing the current flow "leave no stone unturned" before proposing [10].
- A rubric has axes with named levels (utility, usability, beauty) and evidence from a friction log, not adjectives [7].
- Hiring and portfolio notes weigh the mess: alternatives explored, what was abandoned; red flag is "perfect" work with "minor cosmetic changes" [5, 6].
- Performance feedback quotes the rubric and sticks to observed behaviour; assumptions and judgments are stripped out [14].
- Principles are few, named, and each carries a because-clause; Spool (search snippet, UNVERIFIED) says they emerge from observed work, not a meeting about aspirations.

### 4. Inputs the model needs
- Crit / review: the goals and stage of the work, the ask and non-ask, the artefact (screens, flow, prototype) or a friction log, the relevant principles, the layer under review (outcome, structure, interaction, visual) [1, 2, 7, 10].
- Brief: who the customer is, the outcome they seek, why, the current pain, constraints, what success looks like and how it is measured [10, 11].
- Quality rubric: the essential journeys, current scores if any, examples of the bar met and missed [7].
- Hiring / portfolio: the role, the ladder or rubric, the case study, interview notes [5, 6, 14].
- Performance feedback: the role description or ladder text, dated observed behaviours, peer feedback, the person's own goals [14, 15].
- Design debt register: inventory of inconsistent patterns, their origin (fire drill, competing team, test), the system's canonical patterns [12].
- Ritual plan: team size, product areas, task-relevant maturity of members, meeting load [1, 15].

### 5. Proposed prompt material
- Persona: "You are a head of design running a critique, not a review: you analyse against stated goals and you do not sign off or redesign." [2]
- Principles: (1) restate the goals and the ask before any judgment [1]; (2) questions before opinions [3]; (3) separate intent (what it tries to do) from execution (how well it does it) [3, 4]; (4) score on utility, usability, beauty with evidence from use, not from the deck [7]; (5) never solve in the crit; name the problem and the goal it misses [2]; (6) feedback to people is SBI and quotes the rubric [14].
- Reach-for words: goals, the ask, clarifying question, intent, execution, craft, quality, utility, usability, beauty, friction, essential journey, problem statement, outcome, layer, heuristic, design debt, refactoring cycle, rationale, tradeoff, observed behaviour [1, 3, 7, 10, 11, 12, 13, 14].
- Avoid, with replacements: "I like / I don't like" -> "this achieves / misses goal X because" [2]; "just a gut reaction" -> a goal-linked observation [2]; "presentationing" -> "use the product" [7]; "make it pop" -> name the layer and the heuristic [10, 13]; "perfect" -> "what we tried and abandoned" [5]; "attitude / always / never" -> dated situation, behaviour, impact [14].
- Hard rules: (1) no redesign inside a critique [2]; (2) every judgment cites a stated goal, a principle, or a heuristic [1, 9, 13]; (3) a review must state whether the bar is met and what would have to change, and may say "do not ship yet" [7]; (4) people feedback contains only observed behaviour tied to the rubric [14].
- Self-check: "Could the designer act on every line without asking what I meant, and does every line point at a goal rather than at my taste?" (inference from 1, 2)
- Tasks:
  1. Run a crit. Inputs: goals, stage, ask and non-ask, screens or flow, principles. Output: goals restated, 3 to 5 clarifying questions, observations grouped by layer, each tied to a goal, no solutions [1, 2, 10].
  2. Write a design review decision. Inputs: friction log or walkthrough notes, essential journey, rubric. Output: scores on utility, usability, beauty with evidence, the bar met or not, what must change, ship or hold [7].
  3. Write a design brief. Inputs: customer, outcome, why, current pain, constraints, measures. Output: one-page problem statement, success measure, out of scope, open questions [10, 11].
  4. Build a quality rubric for a surface. Inputs: essential journeys, examples of good and bad. Output: axes, levels, evidence required per level, review cadence [7].
  5. Draft a hiring scorecard or portfolio note. Inputs: role, ladder, case study, notes. Output: idea, usability, craftsmanship on the work; proactivity, thinking, thoughtfulness, collaboration on the person; what they abandoned; hire signal [5, 6].
  6. Write performance feedback. Inputs: rubric text, dated observations, peer notes. Output: rubric quotes with grouped SBI facts under each, one growth ask, delivery preference asked first [14, 15].

## Company leadership

### 1. What the function produces
- Strategy memo: Rumelt's kernel, a diagnosis, a guiding policy ("like the guardrails on a highway" it "directs and constrains action without fully defining it"), and coherent action; bad strategy is fluff, failure to face the challenge, goals mistaken for strategy, bad objectives [16]. Martin's cascade: winning aspiration, where to play, how to win, must-have capabilities, enabling systems; where-to-play and how-to-win "need to be a matched pair" [18]. The test of any possibility is "what would have to be true" [17].
- Six-pager / narrative memo: six pages of prose, no bullets, appendix for data; read silently for 20 minutes (about three minutes a page), then 40 minutes of discussion; not sent as a pre-read so everyone reads the same version [22, 23]. Great memos "are written and re-written, shared with colleagues", set aside and edited again; they take "a week or more" [21].
- PR/FAQ: press release, external FAQ, internal FAQ; must identify the customer, the problem, the solution, and why they would adopt it [22].
- Board update: highlights and lowlights since last meeting, then calibration with "the fewest number of correct metrics", then company building and working sessions, then closed session; the deck says "where the company needs help" [26]. Package sent days ahead with the expectation it is read; 70 percent of the meeting on the future; "don't hide the shortcomings, address them up front" [27].
- Investor letter: the YC template (attributed to Aaron Harris of YC) is highlights, lowlights, requests, KPIs; body of the template not fetched, so its section order is UNVERIFIED [29].
- OKR set: three to five objectives, about three key results each; key results are numeric and graded 0 to 1.0; sweet spot 60 to 70 percent [24]. Committed OKRs expect 1.0 and a miss "requires explanation"; aspirational expect 0.7 "with high variance" [25].
- Decision memo: classify the door. Type 1 is "consequential and irreversible or nearly irreversible", needs "great deliberation and consultation"; Type 2 is a two-way door, "made quickly by high judgment individuals or small groups" [19]. Decide at about 70 percent of the information; "being slow is going to be expensive for sure" [20].
- Layoff / hard message: decide fast once decided, be clear the company missed its plan (not a performance clean-up), managers lay off their own people, the CEO addresses the whole company first, and "the message is for the people who are staying" [28].
- Crisis / incident communication: nothing solid fetched (Atlassian and PagerDuty pages returned no body or 404). Do not ship a clause on incident comms without a source.
- All-hands narrative: nothing solid fetched beyond Hughes Johnson naming all-hands and 1:1s as rituals that give "solid ground within which chaos and ambiguity can exist" (search snippet, UNVERIFIED) and her principle "say the thing you think you cannot say" [30].
- Hiring plan: nothing solid found as a document form; the only sourced hiring mechanism is Amazon's Bar Raiser with veto and the rule "every new hire should raise the bar" [23].

### 2. Vocabulary
| TERM | meaning | why it belongs in a prompt | source |
| --- | --- | --- | --- |
| diagnosis | what is going on and the biggest obstacle | first section of a strategy memo | 16 |
| guiding policy | "guardrails on a highway": directs and constrains without defining | second section | 16 |
| coherent action | "coordinated and coherent actions" that follow the policy | third section | 16 |
| fluff | jargon that hides the absence of thought | avoid-word | 16 |
| proximate objective | a target the team "can reasonably be expected to hit" | replaces vague goals | 16 |
| where to play / how to win | matched pair; do not lock a market then hunt a way to win | forces the pairing | 18 |
| what would have to be true | the conditions a possibility needs; isolate the least confident and test it | turns argument into tests | 17 |
| one-way / two-way door | Type 1 irreversible vs Type 2 reversible | the reversibility line in a decision memo | 19 |
| 70 percent | decide with about 70 percent of the information you wish you had | the cost-of-delay line | 20 |
| disagree and commit | "will you gamble with me on it?"; not "I told you so" | how dissent is recorded | 20 |
| escalate misalignment | "You've worn me down is an awful decision-making process" | names the failure mode | 20 |
| process is not the thing | "do we own the process or does the process own us?" | guard against proxies | 20 |
| six-pager / narrative | prose memo, silent read, no bullets | format name | 21, 22, 23 |
| PR/FAQ | press release plus external and internal FAQ | working-backwards form | 22 |
| high standards | "domain specific", teachable, need realistic scope | quality register for memos | 21 |
| highlights / lowlights | first section of a board deck | bad news is a named slot | 26, 27 |
| calibration (board sense) | telling the story with the fewest correct metrics | metric discipline | 26 |
| where we need help | the asks slot | make the ask explicit | 26 |
| objective / key result | ambitious statement; numeric, graded 0 to 1.0 | OKR grammar | 24 |
| committed vs aspirational | 1.0 expected vs 0.7 expected | classify each OKR | 25 |
| sandbagging, business-as-usual | timid or status-quo OKRs | avoid-list | 24, 25 |
| managerial leverage | output of the manager's org; meddling is negative leverage | leadership register | 15 |
| operating cadence, north star, span of control, operating principles | nothing solid in fetched sources; do not use without a source | UNVERIFIED | none |

### 3. What separates convincing from generic (per practitioners)
- A strategy memo faces the challenge: it opens with a diagnosis and names the obstacle; goals alone are not a strategy; the guiding policy constrains, which means it implies what will not be done (inference from 16). Martin: strategy is "picking the choice that is most attractive from the universe of choices", so the memo shows the rejected possibilities and what would have to be true for each [17, 18].
- A six-pager is prose that survives a reader who "assumes each sentence he read is wrong until he could prove otherwise" (Bezos habit, secondary) [23]; it took a week and several rewrites [21].
- A board update leads with lowlights next to highlights and states where help is needed; hiding shortcomings makes the meeting "bullsh*t" and forces the "real story" into side conversations [26, 27].
- A decision memo names the door type, the information level at which it decides, who decides, and how dissent is recorded (disagree and commit) [19, 20].
- OKRs read as outcomes with a number and a date ("Improve daily sign-ups by 25 percent by May 1"), one line each, not all landing on the last day of the quarter [25].
- A hard message admits the company failed its plan, does not apologise excessively, and is written for those who stay [28].

### 4. Inputs the model needs
- Strategy memo: the challenge as the leader sees it, facts on customers and competitors, the candidate possibilities, constraints, what has been tried [16, 17, 18].
- Six-pager / PR/FAQ: the customer, the problem, the proposed solution, data for the appendix, the hard questions the room will ask [22, 23].
- Board update / investor letter: period metrics, the few that tell the story, wins, misses, cash and runway, the asks [26, 27, 29].
- OKRs: the company objectives, team scope, baseline numbers, committed vs aspirational intent [24, 25].
- Decision memo: the options, reversibility of each, the information available now vs later, who is accountable, dissent on record [19, 20].
- Layoff or hard message: the plan miss and its cause, who is affected, benefits details, what changes for those who stay [28].

### 5. Proposed prompt material
- Persona: "You are a founder-CEO writing for a room that reads in silence and assumes every sentence is wrong until proven." [21, 23]
- Principles: (1) diagnosis before policy before action; no goals dressed as strategy [16]; (2) name what would have to be true and the least confident condition [17]; (3) classify every decision by door type and state the information level you decide at [19, 20]; (4) bad news and asks get named slots up front [26, 27]; (5) prose, not bullets, in narrative memos [22, 23]; (6) record dissent as disagree and commit, escalate misalignment instead of wearing people down [20].
- Reach-for words: diagnosis, obstacle, guiding policy, coherent action, proximate objective, where to play, how to win, what would have to be true, one-way door, two-way door, 70 percent, reversible, disagree and commit, escalate, lowlights, where we need help, key result, committed, aspirational, the plan [16, 17, 18, 19, 20, 24, 25, 26, 28].
- Avoid, with replacements: "fluff" and buzzwords -> the plain obstacle [16]; a list of goals -> a diagnosis plus one guiding policy [16]; "we'll wait for more data" -> the 70 percent line and the cost of being slow [20]; "consensus" -> a named decider plus disagree and commit [20]; "restructuring for performance" -> "the company failed to hit its plan" [28]; "launch X" as a key result -> "launch X to move metric Y by Z by date" [25].
- Hard rules: (1) a strategy memo without a diagnosis and a named obstacle is returned unfinished [16]; (2) a decision memo must state door type, reversibility cost, and the information level [19, 20]; (3) a board or investor update must contain a lowlights section and an asks section [26, 27]; (4) every key result has a number and a date [24, 25].
- Self-check: "Could a board member who read only page one name the obstacle, the bad news, and the ask?" (inference from 16, 26, 27)
- Tasks:
  1. Write a strategy memo. Inputs: challenge, facts, possibilities. Output: diagnosis, guiding policy, coherent actions, rejected possibilities with what would have to be true, proximate objectives [16, 17, 18].
  2. Draft a six-pager. Inputs: customer, problem, proposal, data, hard questions. Output: six pages of prose, FAQ, appendix list, the three sentences most likely to be challenged [21, 22, 23].
  3. Write a board update. Inputs: metrics, wins, misses, asks. Output: highlights, lowlights, the fewest correct metrics, company building, where we need help, proposed working session [26, 27].
  4. Write a decision memo. Inputs: options, reversibility, information now vs later. Output: door type, recommendation, what 70 percent looks like, cost of delay, decider, dissent on record [19, 20].
  5. Set OKRs. Inputs: company objectives, team scope, baselines. Output: 3 to 5 objectives, about 3 numeric dated key results each, each tagged committed or aspirational, sandbag check [24, 25].
  6. Write a layoff or hard message. Inputs: plan miss and cause, who is affected, what changes. Output: CEO all-company message written for those who stay, manager talking points, what not to say [28].

## Sources
1. How we do design critiques at Figma (Noah Levin), https://www.figma.com/blog/design-critiques-at-figma/ : six crit forms, four goals, stage order, the ask and the non-ask.
2. Adam Connor and Aaron Irizarry, Discussing Design: The Art of Critique (UIE Brainsparks archive), https://archive.uie.com/brainsparks/2012/07/13/adam-connor-aaron-irizarry-discussing-design-the-art-of-critique/ : feedback vs critique, critique vs review, the three rules. Note: the book is Connor and Irizarry; Spool hosts, he is not the author.
3. Julie Zhuo, All About Execution, https://lg.substack.com/p/the-looking-glass-all-about-execution : execution defined, "fewer off-the-cuff opinions; more questions".
4. Julie Zhuo, Higher Level Design, https://lg.substack.com/p/the-looking-glass-higher-level-design : design as intentional influence, seniority = abstraction.
5. Julie Zhuo, How to Spot a World-Class Designer, https://lg.substack.com/p/how-to-spot-a-world-class-designer : portfolio signals, the mess, "should this exist".
6. First Round Review, An Inside Look at Facebook's Method for Hiring Designers (Zhuo), https://review.firstround.com/an-inside-look-at-facebooks-method-for-hiring-designers/ : idea, usability, craftsmanship; person attributes; red flags.
7. Creator Economy summary of Katie Dill on Lenny's Podcast, https://creatoreconomy.so/p/how-stripe-crafts-quality-products-katie-dill : SECONDARY; craft vs quality, utility/usability/beauty, PQR, friction logs, essential journeys. The Lenny page itself was fetched but the transcript is paywalled.
8. Airbnb design principles (principles.design mirror of airbnb.design/the-way-we-build), https://principles.design/examples/airbnb-design-principles : four principles verbatim.
9. Atlassian design principles (principles.design mirror), https://principles.design/examples/atlassian-design-principles : five principles verbatim; the atlassian.design page fetched empty.
10. Intercom, How we do product design at Intercom (Paul Adams), https://www.intercom.com/blog/how-we-design-at-intercom/ : 10 steps, layers, success before design.
11. Intercom, For Better Products, Start With a Problem Statement, https://www.intercom.com/blog/how-to-write-problem-statements/ : outcome, why, pain; not a PRD.
12. Austin Knight, Design Debt, https://austinknight.com/writing/design-debt : definition, causes, refactoring cycle.
13. Nielsen Norman Group, 10 Usability Heuristics, https://www.nngroup.com/articles/ten-usability-heuristics/ : heuristic defined, the ten.
14. Lara Hogan, It's performance review season, https://larahogan.me/blog/performance-reviews/ : SBI, rubric quotes, fact-based, ask delivery preference.
15. Nat Eliason notes on High Output Management, https://www.nateliason.com/notes/high-output-management-andy-grove : SECONDARY; leverage, task-relevant maturity, 1:1s, written review before the meeting.
16. Alex Murrell summary of Good Strategy Bad Strategy, https://www.alexmurrell.co.uk/summaries/richard-rumelt-good-strategy-bad-strategy : SECONDARY; kernel, four hallmarks, proximate objectives. Rumelt's McKinsey article timed out three times.
17. Roger Martin, What Would Have to be True, https://rogerlmartin.substack.com/p/2022-08-22_what-would-have-to-be-true-83dac5bd2189html : the question, logic vs data, tests.
18. Roger Martin, Decoding the Strategy Choice Cascade, https://rogerlmartin.substack.com/p/2023-02-20_decoding-the-strategy-choice-cascade-475d40555eb1html : five choices, matched pair rule.
19. Amazon 2015 shareholder letter, https://www.sec.gov/Archives/edgar/data/1018724/000119312516530910/d168744dex991.htm : Type 1 / Type 2 doors.
20. Amazon 2016 shareholder letter, https://www.sec.gov/Archives/edgar/data/1018724/000119312517120198/d373368dex991.htm : 70 percent, slow is expensive, disagree and commit, escalate, process is not the thing.
21. Amazon 2017 shareholder letter, https://www.sec.gov/Archives/edgar/data/1018724/000119312518121161/d456916dex991.htm : high standards, memos take a week or more.
22. Colin Bryar, Working Backwards: How to Write an Amazon PR/FAQ, https://docs.superhuman.com/@colin-bryar/working-backwards-how-write-an-amazon-pr-faq : PR/FAQ parts, silent read, no pre-read.
23. Commoncog summary of Working Backwards, https://commoncog.com/working-backwards/ : SECONDARY; six pages, no bullets, appendix, Bar Raiser.
24. Google re:Work, Set goals with OKRs, https://rework.withgoogle.com/intl/en/guides/set-goals-with-okrs : counts, grading, sweet spot, not performance evaluation.
25. What Matters, Google's OKR Playbook, https://www.whatmatters.com/resources/google-okr-playbook : committed vs aspirational, litmus tests.
26. Sequoia, Preparing a board deck, https://articles.sequoiacap.com/preparing-a-board-deck : agenda, lowlights, fewest metrics, where help is needed.
27. a16z (Peter Levine), What Now: Board Meeting or Bullsh*t?, https://a16z.com/2012/05/01/what-now-board-meeting-or-bullsht/ : pre-read, 70 percent future, address shortcomings up front.
28. a16z (Ben Horowitz), The Right Way to Lay People Off, https://a16z.com/the-right-way-to-lay-people-off/ : six steps, message for those who stay.
29. Visible.vc, Y Combinator investor update template page, https://visible.vc/templates/y-combinator-investor-update-template/ : SECONDARY; attributes the template to Aaron Harris of YC; template body not fetched.
30. First Round podcast page, Claire Hughes Johnson, https://review.firstround.com/podcast/claire-hughes-johnson-on-being-a-learning-organism-during-stripes-growth-and-more-scaling-advice-for-leaders/ : "say the thing you think you cannot say".

Not fetched despite attempts (do not cite): GV Guide to Design Critique (Kowitz, four attempts blocked), Cap Watkins blog (403 and DNS), Nathan Curtis contribution-model articles (403), IDEO critique guidance (nothing solid), Figma resource-library critique page (404), Atlassian and PagerDuty incident-communication pages (empty or 404), Julie Zhuo's product critique post on Medium (403).
