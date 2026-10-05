# Text-prompt levers: research dossier
_Researched 2026-09-04. Sources numbered at the bottom; cite by number inline._

Scope note: primary vendor docs only. Anthropic's old per-technique pages (be-clear-and-direct, multishot, chain-of-thought, use-xml-tags, system-prompts, prefill, long-context-tips, chain-prompts, claude-4-best-practices) all now 301-redirect to one consolidated page [1]; that page and the Fable 5 / 5.1 / Sonnet 5 pages [3][4][5] were read in full raw text. OpenAI [7][8][9][10], Google [11] and the Anthropic blog [6] were read through the fetch tool's extraction, so their quotes are "as extracted" from the page, not eyeballed in the raw HTML.

## What each vendor says works (per vendor, quoted or closely paraphrased, with source #)

**Anthropic** [1] unless noted
- Clarity first. "Claude responds well to clear, explicit instructions." Golden rule: "Show your prompt to a colleague with minimal context on the task and ask them to follow it. If they'd be confused, Claude will be too." Use numbered steps "when the order or completeness of steps matters." Want above-and-beyond work? "explicitly request it rather than relying on the model to infer this."
- Give the reason. "Providing context or motivation behind your instructions ... can help Claude better understand your goals." Worked example: "NEVER use ellipses" is the weak form; "Your response will be read aloud by a text-to-speech engine, so never use ellipses since ..." is the strong form. "Claude is smart enough to generalize from the explanation." Fable 5 page repeats it as a template: "I'm working on [the larger task] for [who it's for]. They need [what the output enables]. With that in mind: [request]." [4]
- Examples. "Examples are one of the most reliable ways to steer Claude's output format, tone, and structure." Make them relevant, diverse ("vary enough that Claude doesn't pick up unintended patterns"), and wrapped in `<example>` / `<examples>` tags. "Include 3-5 examples for best results." Blog adds the warning: models "pay very close attention to details in examples ... minimize any patterns you want to avoid." [6] Sonnet 5 page: "Positive examples ... tend to be more effective than negative examples or instructions that tell the model what not to do." [5] Fable 5.1 page: one complete example with a `<rationale>` line explaining WHY it is correct fixes source-quoting behaviour. [3]
- XML tags. They "help Claude parse complex prompts unambiguously, especially when your prompt mixes instructions, context, examples, and variable inputs." Consistent tag names, nest when there is hierarchy. Blog concedes "modern models are better at understanding structure without XML tags, they can still be useful." [6]
- Role. "Setting a role in the system prompt focuses Claude's behavior and tone ... Even a single sentence makes a difference." Blog tempers it: "heavy-handed role prompting is often unnecessary"; "being explicit about what perspective you want is more effective." [6]
- Long inputs. "Put longform data at the top ... above your query, instructions, and examples." "Queries at the end can improve response quality by up to 30 percent in tests." Wrap each doc in `<document>` with `<source>` and `<document_content>`. "Ground responses in quotes": ask for relevant quotes first, then the task.
- Output format. "Tell Claude what to do instead of what not to do" (prose paragraphs, not "no markdown"). Use XML format indicators for the answer. "Match your prompt style to the desired output": markdown in the prompt breeds markdown in the answer. Fable 5.1: it already formats less, so old anti-formatting blocks now "suppress structure the content needs"; replace with a rule saying when formatting is appropriate. [3]
- Thinking. On current models thinking is adaptive and always on; you steer it with prose ("Thinking adds latency and should only be used when ...") or the effort parameter, not "think step by step." Fable 5: "Don't instruct Claude to reproduce its reasoning in the response", it can trip a refusal category. [4]
- Prefill. Dead lever on current models: "prefilled responses ... on the last assistant turn are no longer supported" from Claude 4.6 on; replace with "Respond directly without preamble" or structured outputs.
- Chaining. Mostly internalised now; still useful "when you need to inspect intermediate outputs." Canonical chain is "self-correction: generate a draft, have Claude review it against criteria, have Claude refine."
- Literalism. Sonnet 5 "interprets prompts literally ... does not silently generalize an instruction from one item to another"; state scope ("Apply this formatting to every section, not just the first one"). [5] Fable 5: "steer most behaviors with a brief instruction rather than enumerating each behavior by name"; older skills "are often too prescriptive ... and can degrade output quality." [4] Migration list: "dial back" anti-laziness prompting, models "may overtrigger on instructions that were needed for previous models." [1]
- Prerequisite. Before any of this: "A clear definition of the success criteria ... Some ways to empirically test against those criteria." [2]

**OpenAI**
- Developer-message structure, in this order: Identity, Instructions, Examples, Context; context "is usually best positioned near the end of your prompt." Markdown headers and XML tags to delimit sections. GPT models want "precise instructions that explicitly provide the logic and data"; reasoning models want "only high-level guidance." [7]
- GPT-4.1 "is trained to follow instructions more closely and more literally than its predecessors." Fix drift with "a single sentence firmly and unequivocally clarifying your desired behavior." Long context: put instructions "at both the beginning and end"; if once, "above the context." XML and `ID: 1 | TITLE: ...` formats beat JSON, which "performed particularly poorly." Conflicts: the model "tends to follow the one closer to the end of the prompt." All-caps and bribes: "starting without" them; existing ones "could cause GPT-4.1 to pay attention to it too strictly." Recommended skeleton: Role and Objective, Instructions, Reasoning Steps, Output Format, Examples, Context, Final instructions. [8]
- GPT-5 "follows prompt instructions with surgical precision"; "contradictory or vague instructions can be more damaging to GPT-5 than to other models" because it burns reasoning "searching for a way to reconcile the contradictions." Self-check pattern: "create a rubric that has 5-7 categories" and iterate against it internally. Markdown adherence "can degrade over the course of a long conversation": re-remind every 3-5 turns. [9]
- Reasoning models: "Keep prompts simple and direct." "Avoid chain-of-thought prompts ... 'think step by step' ... is unnecessary." "Try zero shot first, then few shot if needed." "Be very specific about your end goal." [10]

**Google (Gemini)** [11]
- "We recommend to always include few-shot examples in your prompts. Prompts without few-shot examples are likely to be less effective." Keep example formatting identical; experiment with the count to avoid overfitting.
- "Change the order of prompt content" as an iteration move: "order can sometimes affect the response." Three sample orders are given, none declared best.
- Gemini 3: "Prioritize critical instructions: Place essential behavioral constraints, role definitions (persona), and output format requirements in the System Instruction or at the very beginning of the user prompt." For long context, "supply all the context first. Place your specific instructions or questions at the very end of the prompt." "Be precise and direct." Keep sampling params at defaults.
- Break work down: separate prompts, chained prompts, aggregated parallel responses.

## The ordering of a good prompt
- Anthropic: role in the system prompt [1]; for long inputs, documents at the TOP, then instructions, examples, and the query LAST [1]. For short prompts no explicit order is prescribed; the blog says "most critical details at the beginning or end." [6]
- OpenAI: Identity, Instructions, Examples, Context (context near the end) [7]; the GPT-4.1 skeleton puts Output Format before Examples and Context, then closes with "Final instructions" [8]; long context gets instructions at BOTH ends [8]; on conflict the later instruction wins [8].
- Google: constraints, persona and output format at the very START (system instruction) [11]; long context first, question at the very END [11].
- Convergence (inference, not any single source): role and hard constraints at the top; pasted material in the middle, tagged; the actual ask and output shape at the bottom; examples between the rules and the material. All three vendors agree the query goes last when inputs are long.

## Levers that are actually documented vs folklore
| LEVER | documented by | what it does | source # |
|---|---|---|---|
| Clear, specific, explicit ask | Anthropic, OpenAI, Google | The base lever; every vendor leads with it | 1, 8, 11 |
| Explain WHY (motivation behind a rule) | Anthropic | Model generalises from the reason; a bare "NEVER" is the weak form | 1, 4 |
| 3-5 diverse, tagged examples | Anthropic (3-5), Google (always include), OpenAI (few-shot, but reasoning models: zero-shot first) | Steers format, tone, structure; copies details you did not intend | 1, 6, 10, 11 |
| Positive instructions over prohibitions | Anthropic | "Tell Claude what to do instead of what not to do"; positive examples beat negative ones | 1, 5 |
| Role / persona line | Anthropic, OpenAI (Identity), Google (persona in system instruction) | Focuses behaviour and tone; Anthropic blog says heavy role play is unnecessary, explicit perspective is better | 1, 6, 7, 11 |
| XML / delimiter tags | Anthropic, OpenAI, Google (delimiters) | Separates instructions, context, input, examples; XML beat JSON for long docs on GPT-4.1 | 1, 7, 8, 11 |
| Long inputs first, query last | Anthropic, Google, OpenAI (instructions at both ends) | Up to 30 percent quality gain on complex multidoc inputs (Anthropic figure) | 1, 8, 11 |
| Quote-first grounding | Anthropic | Ask for relevant quotes before the task on long docs | 1 |
| Output format stated positively + prompt style mirrors desired output | Anthropic, OpenAI (Output Format section) | Markdown in prompt yields markdown out | 1, 8 |
| Success criteria / rubric in the prompt | OpenAI (GPT-5 rubric, reasoning "be very specific about your end goal"), Anthropic (evals as a prerequisite) | Gives the model something to check against | 2, 9, 10 |
| Self-correction chain (draft, review against criteria, refine) | Anthropic | Canonical chaining pattern | 1 |
| Scope statements ("apply to every section") | Anthropic (Sonnet 5), OpenAI (GPT-4.1 single firm sentence) | Literal models do not generalise unasked | 5, 8 |
| Remove contradictions | OpenAI | Contradictions degrade GPT-5 more than other models | 9 |
| Permission to say "I don't know" | Anthropic blog | Reduces hallucination | 6 |
| Re-state format rules in long chats | OpenAI | Adherence decays over a long conversation | 9 |
| "Think step by step" | OpenAI says AVOID on reasoning models; Anthropic: thinking is adaptive, steer with effort or a short prose rule, never ask it to echo reasoning | Legacy lever, now neutral to harmful on reasoning models | 1, 4, 10 |
| ALL CAPS, "CRITICAL", bribes, threats | OpenAI: start without them, they cause over-strict attention; Anthropic: over-prompting causes overtriggering | Folklore that now backfires | 1, 8 |
| Prefill the assistant turn | Anthropic: removed on current models (400 error) | Dead lever | 1 |
| Long enumerated rule lists | Anthropic: brief instruction beats enumerating; old skills "too prescriptive" | Folklore | 4 |
| Temperature / top_p for style | Google: keep defaults on Gemini 3; Anthropic Sonnet 5 rejects them | Not a chat-box lever anyway | 5, 11 |
| "Act as a world-class expert" boosts quality | UNVERIFIED | No vendor doc fetched claims expertise adjectives raise quality; only the single-sentence role is documented | none |
| Saying "please" / politeness | UNVERIFIED | Nothing solid found in fetched docs | none |
| Offering a tip / emotional stakes | Documented only as a thing to remove (OpenAI) | See caps row | 8 |
| Fixed "magic" section order for short prompts | UNVERIFIED | Vendors disagree on short-prompt order; only long-context placement is evidenced | 7, 8, 11 |

## Proposed prompt skeleton for a "team role" prompt
Each part, with rationale and source. Tags shown are Anthropic-style; OpenAI accepts XML or markdown headers [7], Google wants delimiters [11].

1. `<role>` one sentence: who this is, for whom, what perspective to take. Rationale: single-sentence role is documented [1]; make it a perspective, not a costume [6]; Google wants persona at the top of the system instruction [11].
2. `<task>` the deliverable in one or two plain sentences, plus the WHY: "I'm working on [larger task] for [who]. They need [what it enables]." Rationale: explicit ask [1][8][11]; motivation lets the model generalise [1][4].
3. `<inputs>` the pasted material, each piece in its own tag (`<brief>`, `<transcript>`, `<document index="n">` with `<source>`). Placed ABOVE the rules-of-output and the final ask when it is long. Rationale: longform data at the top, query last [1][11]; XML separates inputs from instructions [1][8].
4. `<examples>` 1 to 3 short, diverse, positive examples of the wanted output, each with a one-line rationale. Rationale: 3-5 examples [1] (fewer when space is tight; Google says always include some [11]); positive beats negative [5]; a rationale line is the Fable 5.1 fix for copy-the-shape-but-not-the-point [3]. Skip on reasoning-first tasks and try zero-shot first [10].
5. `<output>` the shape stated positively: sections, length, format, tone. Written in the style you want back (prose rules for prose, list rules for lists). Rationale: tell it what to do not what not to [1]; prompt style mirrors output [1]; Output Format is its own section in OpenAI's skeleton [8].
6. `<rules>` a SHORT list of hard constraints, each with its reason, scope stated ("every section, not just the first"), no caps, no "CRITICAL", no contradictions. Rationale: brief beats enumerated [4]; scope for literal models [5][8]; contradictions burn reasoning [9]; emphasis overtriggers [1][8].
7. `<check>` the self-test: "Before answering, check the draft against these criteria: [3 to 5 rubric items]. Fix anything that fails. If a fact is not in the inputs, say so rather than guess." Rationale: rubric self-check [9]; be specific about the end goal [10]; the draft-review-refine chain [1]; permission to express uncertainty [6]. Do NOT ask it to print its reasoning [4][10].
8. Final line: restate the ask in one sentence. Rationale: query last on long inputs [1][11]; later instruction wins on GPT [8].

Line budget: for a chat paste, 1 and 2 go at the top, 3 in the middle, 4 to 8 at the bottom. Order 1-2-3-4-5-6-7-8 is an inference reconciling [1], [8] and [11]; only "long inputs first, ask last" is directly evidenced.

## Sources
1. Anthropic, "Prompting best practices", https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/claude-prompting-best-practices. Read in full. Gave: clarity, why, examples (3-5), XML, role, long-context (30 percent, docs on top, quote-first), format control, prefill removal, chaining, overtriggering warning. All legacy per-technique docs.anthropic.com URLs redirect here.
2. Anthropic, "Prompt engineering overview", https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/overview. Gave: success criteria and evals as prerequisites; points to [1] and [6].
3. Anthropic, "Prompting Claude Fable 5.1", https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/prompting-claude-fable-5-1. Read in full. Gave: writing density, remove anti-formatting rules, one example plus rationale for quoting, finish-the-task block.
4. Anthropic, "Prompting Claude Fable 5", https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/prompting-claude-fable-5. Gave: brief instruction beats enumeration, give-the-reason template, do not ask it to echo reasoning, old skills too prescriptive.
5. Anthropic, "Prompting Claude Sonnet 5", https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/prompting-claude-sonnet-5. Gave: literal instruction following and scope statements, positive examples beat negative, sampling params rejected.
6. Anthropic blog, "Best practices for prompt engineering" (dated 2025-11-10), https://claude.com/blog/best-practices-for-prompt-engineering. Gave: heavy role prompting unnecessary, XML less needed, examples copied closely, permission to express uncertainty, critical details at beginning or end.
7. OpenAI, "Prompt engineering", https://developers.openai.com/api/docs/guides/prompt-engineering (platform.openai.com URL redirects here). Gave: Identity, Instructions, Examples, Context order; context near the end; GPT vs reasoning model guidance.
8. OpenAI Cookbook, "GPT-4.1 prompting guide", https://developers.openai.com/cookbook/examples/gpt4-1_prompting_guide. Gave: literalism, instructions at both ends, XML beats JSON, later instruction wins, caps and bribes overcomply, section skeleton.
9. OpenAI Cookbook, "GPT-5 prompting guide", https://developers.openai.com/cookbook/examples/gpt-5/gpt-5_prompting_guide. Gave: surgical precision, contradictions harm, 5-7 item rubric self-check, markdown decay in long chats.
10. OpenAI, "Reasoning best practices", https://developers.openai.com/api/docs/guides/reasoning-best-practices. Gave: simple prompts, avoid chain-of-thought, zero-shot first, specific end goal.
11. Google, "Prompt design strategies", https://ai.google.dev/gemini-api/docs/prompting-strategies. Gave: always include few-shot, consistent example format, order matters, Gemini 3 constraints at top and question at the very end, default sampling.

Not fetched or not found: no Google page on system-instruction ordering beyond [11]; no vendor source on politeness, expertise adjectives, or a fixed short-prompt order. Nothing solid found.
