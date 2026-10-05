# Voice frameworks: research dossier
_Researched 2026-08-15. Sources listed at the bottom, numbered; cite by number inline._

## How the authorities specify a voice

### Mailchimp [1]
The most structurally useful model for this library, because it separates two things our
assembler currently fuses.

- **Voice is fixed, tone moves.** "You have the same voice all the time, but your tone
  changes." [1]
- **Voice is specified as a short list of named traits**, each with a gloss: plainspoken,
  genuine, translators, dry humour. Four traits, not twenty. Each trait is a behaviour, not
  an adjective ("we strip all that away and value clarity above all"). [1]
- **Tone is specified as a rule for reading the situation**, not a fixed setting: consider
  the reader's state of mind, and name it (relieved, confused). The tone spec is therefore a
  *procedure* the writer runs per moment, not a value on a dial. [1]
- **Three execution rules** sit under the voice: active voice, no slang or jargon, positive
  rather than negative phrasing. [1]
- **One hard prohibition**, stated flatly: do not write in the mascot's voice. [1]
- A separate section [2] handles word-level rules (capitalisation of ethnicity terms,
  singular they, modifier-not-noun for identity terms, no age or disability descriptors
  unless relevant). This is the "avoid" list, and note its shape: each entry is a *rule with
  a reason*, not a bare banned word.

Structure to steal: **traits (named, glossed) + emotional-state read + execution rules +
prohibitions + a separate word-level list.** That is almost exactly our framework schema,
which is a good sign; the gap is the emotional-state read.

### Shopify [3]
- Explicitly holds the same voice/tone split: voice is constant, "tone can change based on
  the audience and their current context." [3]
- Specifies a **measurable readability target**: grade 7, and names a tool (Hemingway) to
  check it. That is a spec with a test attached, which is rarer than it should be. [3]
- **Consistency rule as a hard constraint**: "Use a single noun, verb, or phrase to describe
  a specific thing, action, or concept." No synonyms for the same object. Do not say both
  "upload images" and "add photos". [3]
- Avoid list is categorical rather than lexical: jargon, technical language, large text
  blocks, idioms, indirect phrasing. [3]
- CTAs: start with a strong verb, active voice. [3]
- A posture rule that reads like a principle and behaves like one: "Give merchants enough
  information to make the right decision on their own" rather than dictating. [3]

### GOV.UK [4] [5]
The most prescriptive, and the only one that publishes a genuine banned-word table.

- **Plain English is mandatory**, justified by adult literacy data rather than taste. [5]
- **Numeric constraints**: split sentences over 25 words; paragraphs no longer than five
  sentences. [5]
- **Active voice over passive.** [5]
- **Contractions, asymmetrically**: use positive contractions (you'll, it's) but avoid
  negative ones (can't, don't), and avoid should've / could've / would've / they've. [5]
  This asymmetry is a real finding and not something a model will infer on its own.
- **A to Z word list** [4] with one-for-one replacements: agenda to plan, deliver to
  make/create/provide, facilitate to say how you are helping, leverage to influence or use,
  utilise to use, tackle to stop/solve/deal with. Metaphors get the same treatment: drive to
  create/cause/encourage, hub or portal or one-stop shop to website or service, ring fencing
  to separate. [4]
- The governing principle behind the list: **"Be open and specific"**: break the abstract
  term into what you are actually doing. [4]
- Discourages nominalisations, specifically words ending in -ion and -ment that pad a
  sentence. [5]

Structure to steal: **a banned word paired with its replacement, plus the one-line reason
the ban exists.** A bare avoid list tells a model what not to type; a paired list tells it
where to go instead, which is what actually changes the output.

### Microsoft [10] [11]
Two documents, and together they are the cleanest "principle plus do/don't pair" spec found.

- **Three named voice principles** [11]: be warm and relaxed; be ready to lend a hand; be
  crisp and clear. Every downstream rule in the page is attributed back to one of the three,
  including the error-message rules and the spoken-experience rules. The principle is not
  decorative; it is the index.
- Each principle is taught by a **matched do/don't pair on the same content**, which is the
  single most transferable device for a prompt: "Select filters to add effects to your image"
  against "If you want to add visual effects or alterations to your image, select filters."
  [11]
- **Person rules**: address the user as "you"; use "we" for the product's perspective; never
  "I" or "me". [11]
- **Punctuation rules tied to grammatical status**: periods end full sentences in tooltips,
  errors and dialogs; never on buttons, radio buttons, labels or checkboxes. [11]
- **Contractions**: use them where natural, do not force unnatural ones to save space. [11]
- Buttons: a couple of short words at most, active voice, action words not reactions. [11]

### Atlassian, Apple HIG, Material Design
UNVERIFIED. Repeated fetches of the Atlassian voice-and-tone pages, the Apple HIG Writing
page and the Material 3 writing page returned 404s or empty bodies. No claims in this
dossier are attributed to them. If they matter, they need a browser fetch rather than
WebFetch.

## Moment craft

### Error
The best-sourced moment in the whole set. Three independent authorities converge.

**Required contents.** Microsoft states the payload as three questions the message must
answer: what happened and why; what the end result is for the user; what the user can do to
prevent it happening again. [10] NN/g's version: describe the issue concisely and precisely
with context rather than generically, and offer constructive advice toward a remedy. [6]

**Specificity over genericness.** "Write a separate error message for each known cause of
the error. Do not use a single, generic message" [10]. NN/g: avoid generic statements, and
place the error adjacent to where it occurred. [6]

**Blame framing.** Microsoft: "Do not make the user feel at fault even if the problem is the
result of a user error." [10] NN/g goes further and names the offending vocabulary: avoid
blame language like *invalid* or *incorrect*. [6] Microsoft [11] adds the mechanism: the app
takes responsibility, not the user.

**Technical detail.** Do not use technical jargon; use terminology the audience understands;
no slang, no abbreviations [10]. NN/g: write plainly without obscure codes or jargon, and
educate briefly on system behaviour with links to fuller help [6]. So technical detail is not
banned, it is *relocated* to a secondary surface.

**Specific word-level bans.** Avoid "bad" (say what criterion was violated instead) [10].
Avoid "please", because it can imply a required action is optional [10]. Avoid uppercase text
and exclamation points [10]. Do not anthropomorphise: do not imply programs or hardware think
or feel [10].

**Tense and voice.** Present tense for conditions that caused the problem or a state that
still exists; past tense only for a distinct past event. Active voice wherever possible;
passive is tolerated for describing the error condition itself. [10]

**Step budget.** Microsoft [10] says if the solution has more than one step, link to a help
topic. The Microsoft Style Guide is widely quoted as capping in-message solutions at two or
three steps; that specific number is folklore as far as this research goes, since the page
carrying it could not be fetched.

**Apology policy.** Microsoft's style guide is widely cited as saying to apologise only for
things that went wrong inside the product, not for external causes. Sourced only to a search
snippet here, so treat as **folklore** until the style-guide page is fetched directly.

**Worked example.** The exemplar in [11] is worth reading as a shape, not copying: a bolded
short statement of state ("You're not connected.") followed by a scannable list of four
one-line checks. Statement of state, then remedies as a list, no preamble.

### Warning
Distinct from error and under-specified everywhere. The only structural guidance found: NN/g
tells designers to **design severity levels appropriately**, distinguishing warnings from
blocking errors, and to avoid premature error display [6]. Microsoft classes confirmations,
warnings and notifications as message types separate from errors [10].
_(inference)_ The operative difference for our moment spec is tense and agency: an error
describes something that already failed and offers recovery; a warning describes a
consequence that has not happened yet and offers a choice. A warning that reads like an error
has stolen the user's remaining agency.

### Empty state
NN/g gives three jobs, and they are jobs, not tones [7]:
1. **Communicate system status**: is this loading, errored, or genuinely empty? The example
   given is explicitly boring and explicitly complete: "There are no records to display for
   the selected date range."
2. **Teach**: surface a feature the user has not discovered. Example cited: "Star your
   favorites to list them here."
3. **Start the task**: a direct link or button into the relevant workflow, ideally with more
   than one entry point (add real data, or explore demo data).

The failure mode named is the totally blank space, which leaves the user unsure whether the
system is broken. [7]

### Onboarding
Thinly sourced. Shopify's guidance is that new merchants appreciate a light and
straightforward tone, and that complex tasks should be broken into individual steps with
essential information prioritised [3]. Microsoft's "lead with what's important" rule applies
with force here: do not pad with introductions, present the core of an idea before adding to
it [11].

### Confirmation
Microsoft's dialog rule is the sharpest thing found: there must be a **"call and response"
between the title of a dialog and its buttons**: the buttons must be clear answers to the
question the title poses, in a format consistent across the app [11]. So a confirmation is
written as a matched pair, never as an isolated sentence. Confirmations are also named as a
message type distinct from errors [10].

### Buttons and CTAs (cuts across many moments)
Active voice, action words not reactions, a couple of short words at most, no terminal period
[11]. Start with a strong verb [3].

## What is actually evidence-based about prompting an LLM to write in a voice

**Documented, from the vendors' own guides.**

- **Role prompting works and is cheap.** Anthropic: "Setting a role in the system prompt
  focuses Claude's behavior and tone for your use case. Even a single sentence makes a
  difference." [9] OpenAI structures this as a message-role hierarchy in which developer
  instructions are "prioritized ahead of user messages" [12]. So the persona belongs in the
  system position, and the per-moment task belongs in the user position. Our assembler
  currently concatenates both into one blob.
- **Examples steer tone specifically.** Anthropic: "Examples are one of the most reliable
  ways to steer Claude's output format, tone, and structure." [9] Three qualities are
  required of them: **relevant** (mirror the actual use case), **diverse** (cover edge cases
  and vary enough that the model does not pick up unintended patterns), **structured**
  (wrapped in `<example>` / `<examples>` tags so they are distinguishable from instructions).
  Recommended count: **3 to 5**. [9]
- **The copying risk is real and the documented counter is diversity, not a warning.**
  The instruction "write fresh, do not copy" is not the technique Anthropic documents. What
  is documented is that examples must "vary enough that Claude doesn't pick up unintended
  patterns" [9]. The lever is the *composition of the example set*, not a plea appended after
  it. _(inference)_ Reference lines that all share one syntactic shape will be copied as a
  shape however firmly the prompt forbids copying.
- **Tell it what to do, not what not to do.** Anthropic's formatting guidance is explicit:
  instead of "Do not use markdown", say "Your response should be composed of smoothly flowing
  prose paragraphs." [9] This has a direct consequence for our "avoid" list, which is
  entirely negative.
- **Give the reason with the rule.** Anthropic: providing motivation behind an instruction
  helps, and the worked example is exactly a word-ban. "NEVER use ellipses" is less effective
  than "Your response will be read aloud by a text-to-speech engine, so never use ellipses
  since the text-to-speech engine will not know how to pronounce them." "Claude is smart
  enough to generalize from the explanation." [9] This is the single highest-leverage finding
  for our avoid lists.
- **XML tags disambiguate mixed prompts.** Wrapping each content type in its own tag
  ("`<instructions>`, `<context>`, `<input>`") "reduces misinterpretation" in prompts that
  mix instructions, context, examples and variable inputs [9]. Our assembler mixes exactly
  those four and uses no delimiters. OpenAI independently recommends Markdown headers or XML
  tags to split a prompt into Identity, Instructions, Examples and Context [12].
- **Long inputs go near the top.** "Place your long documents and inputs near the top of your
  prompt, above your query, instructions, and examples." [9] Our long block is the moment
  inventory / reference set.
- **Prompt style leaks into output style.** "The formatting style used in your prompt may
  influence Claude's response style... try matching your prompt style to your desired output
  style as closely as possible. For example, removing markdown from your prompt can reduce
  the volume of markdown in the output." [9] A prompt written in bulleted marketing register
  will produce copy in bulleted marketing register.
- **Be explicit about the ask, including "above and beyond".** "If you want 'above and
  beyond' behavior, explicitly request it rather than relying on the model to infer this from
  vague prompts." [9] Modifiers that demand quality and range measurably shape output [9].
- **Prefill is gone.** Prefilled responses on the last assistant turn are no longer supported
  starting with Claude 4.6 models [9]. Any voice technique that relied on prefilling the first
  words of the copy is dead.
- **Self-critique and rubrics: documented as evaluation, not as a single-pass trick.** OpenAI
  documents three model-graded approaches: pairwise comparison, single-answer grading, and
  reference-guided grading: and recommends **pairwise for reliability**, rubrics that are
  "clear and detailed", "showing rather than telling" by providing examples at several score
  levels, reasoning before scoring, controlling for response length because judges bias
  toward longer responses, and validating the judge against human labels [13]. That is a
  well-documented *second pass*. The popular "add 'now critique your own answer' to the end
  of the prompt" move is attested only in secondary write-ups, so: **folklore** in that form,
  evidence-based in the separate-judge-call form.
- **N options at once versus one at a time: not documented either way.** No vendor guidance
  was found on batch generation of alternatives for a writing task. What is documented and
  bears on it: judges bias toward longer responses [13], and models converge toward "on
  distribution" outputs [9]. _(inference)_ Asking for N in one call risks N variations on one
  underlying draft; the documented lever against convergence is to constrain the options to
  be different along a named axis rather than merely to be different.

**Not documented / folklore.** Prompting tricks widely repeated but not found in any primary
source during this research: "act as a world-class copywriter" style credential stacking
beyond the one-sentence role; temperature advice for voice; offering the model a reward;
"take a deep breath"; and any claim that a specific number of adjectives improves style
adherence.

**Voice drift.** Peer-reviewed work on multi-turn identity drift finds that models' "interaction
patterns or styles change over time", that **larger models drifted more**, and, importantly for
us, that **assigning a persona may not be enough to maintain identity** [14]. _(inference)_ For a
one-shot copy generator this matters mainly within a single long output: the 12th option in a
list of 12 is the least likely to still be in voice, which argues for shorter batches and for
restating the hard rules after the reference block rather than only before it.

## The AI-copy tell

**There is a documented mechanism, and Anthropic names it.** In its own frontend guidance
Anthropic writes: "You tend to converge toward generic, 'on distribution' outputs. In frontend
design, this creates what users call the 'AI slop' aesthetic." [9] The prescribed counter is
instructive because of its shape. It does not say "be creative". It:
- names the specific overused defaults (Inter, Roboto, Arial, system fonts; purple gradients
  on white; predictable layouts);
- names the *second-order* convergence, which is the sharp part: "You still tend to converge
  on common choices (Space Grotesk, for example) across generations": that is, the model
  converges even on the escape hatch;
- gives positive direction per axis (typography, colour, motion, background) rather than a
  blanket prohibition;
- and closes with a stated stake: "it is critical that you think outside the box." [9]

Nothing equivalent exists for *copy* in vendor documentation, but the design case transfers
directly _(inference)_: the copy equivalent of Inter and purple gradients is a small set of
constructions ("Ready to...?", "Let's get started", "Oops!", "Seamlessly", "Effortlessly",
noun-stacked value phrases, the three-item rule of three, the rhetorical question opener).
The lesson from [9] is that the fix is a *named* list plus positive direction plus an
acknowledgement that the model converges on the substitutes too.

**Independent measurement of the tell exists.** A stylometric study using 70 function words
found that "AI-generated texts exhibited marked stylistic uniformity, while human writing was
more variable and idiosyncratic", with machine essays forming a compact tight cluster against
human dispersion; classifiers reached roughly 99 percent accuracy on longer texts and
degraded on 200-word excerpts [15]. So the measurable tell is **uniformity**, not any single
word. Two consequences: (a) an avoid list of banned words attacks the symptom, while
variance instructions attack the cause; (b) the tell is hardest to detect in short text,
which is mildly good news for microcopy and very bad news for a *set* of microcopy generated
in one pass, where the uniformity across the set is exactly what shows.

Note against overreach: no source found here measures the AI tell in product microcopy
specifically. Applying essay-level stylometry to a 6-word button label is inference, and the
"burstiness" framing widely used online is popular-press vocabulary, not something verified
against a primary source in this pass.

## Proposed upgrades to the assembler

1. **Split the prompt across message roles.** Persona plus voice principles plus hard rules
   in the system position; the moment, the topic and the N-options ask in the user position.
   Both vendors document the role hierarchy as behaviour-shaping and priority-ordering, not
   cosmetic. [9] [12]
2. **Delimit every block with XML tags** (`<persona>`, `<voice_principles>`, `<moment>`,
   `<reach_for>`, `<avoid>`, `<hard_rules>`, `<reference_lines>`, `<test>`). The assembler
   mixes instructions, context, examples and variable input in one flat run, which is the exact
   case both guides say tags fix. [9] [12]
3. **Attach a one-clause reason to every hard rule and every avoid entry.** "Never use
   exclamation points" becomes "never use exclamation points, they read as forced enthusiasm
   in a moment where the user is already stressed." Documented as materially more effective
   than a bare prohibition, with a word-ban as the vendor's own worked example. [9]
4. **Convert the avoid list from bans to swaps**, GOV.UK style: banned term, replacement,
   reason. A model given "leverage to use" has somewhere to go; a model given "not leverage"
   only has somewhere not to go. [4] Reinforced by Anthropic's tell-it-what-to-do rule. [9]
5. **Cap reference lines at 3 to 5 and select them for diversity, not for being the best
   ones.** The documented count is 3 to 5, and the documented requirement is that they vary
   enough that the model does not pick up unintended patterns. A block of a dozen similar
   reference lines is a template, not a sample. [9]
6. **Replace "write fresh, do not copy" with a structural constraint.** Keep a short form of
   the instruction, but earn the effect through example diversity and by adding an explicit
   axis: each option must differ from the others in sentence shape and length, not only in
   wording. The copying risk is countered by set composition in the documented guidance, not
   by the disclaimer. [9] [15]
7. **Add a variance instruction to the N-options ask.** Something like: vary sentence length
   across the options, include at least one that is a fragment and at least one that is a
   full sentence. The measurable AI tell is stylistic uniformity across a set, and a set is
   exactly what our prompt asks for. [15]
8. **Add a named-defaults block per framework, modelled on Anthropic's frontend_aesthetics
   block.** List the specific overused constructions to avoid, give positive direction per
   axis, and state outright that the model converges even on the obvious substitutes. That
   final acknowledgement is in the vendor's own anti-slop prompt and is the part everyone
   leaves out. [9]
9. **Give each framework a reader-emotional-state field per moment, separate from the voice
   principles.** Mailchimp's whole tone model is "consider the reader's state of mind" with
   the state named (relieved, confused); our moments carry a job but not a state, so the model
   has no basis on which to move tone while holding voice. [1]
10. **Add measurable constraints where an authority publishes one.** Sentence cap of 25 words,
    paragraph cap of five sentences, an explicit reading-level target for frameworks that want
    one. Numeric constraints are followed more reliably than adjectives, and both GOV.UK and
    Shopify publish them. [5] [3]
11. **Add a terminology-consistency rule to hard rules**: one noun or verb per concept across
    the whole generated set, no synonym variation for the same object. This is Shopify's rule
    and it is the one rule that only bites when generating multiple options at once, which is
    exactly our case. [3]
12. **Make the moment spec carry a required-contents checklist for error and warning**, not
    just a job: what happened, what it means for the user, what to do next, plus the blame
    constraint and the "no *invalid*, no *incorrect*, no *bad*, no *please*, no exclamation
    marks, no anthropomorphising" list. Both Microsoft and NN/g specify errors as a content
    contract, and a contract is checkable in a way that a job description is not. [10] [6]
13. **Pair confirmation moments with their button labels in one generation.** Microsoft's call
    and response rule means the title and the buttons cannot be written independently without
    risking a mismatch. [11]
14. **Move the framework test out of the prompt body and into a second judge call.** Rather
    than a one-line test the model reads and then ignores, run the generated options through a
    separate pairwise or rubric-graded pass with a detailed rubric, reasoning before scoring,
    and length controlled for. This is the documented form of self-critique; the appended
    "now check your work" line is folklore in comparison. [13]
15. **Restate the two or three hardest rules after the reference block, not only before it.**
    Style consistency degrades over a long generation and persona assignment alone is not a
    reliable guard against it. _(inference from [14])_
16. **Write the prompt itself in the register you want out of it.** If the framework's voice
    is plain and unbulleted, the prompt should not be a bulleted marketing document; prompt
    formatting style leaks into output style. [9]

## Sources

1. Mailchimp Content Style Guide, Voice and Tone / https://styleguide.mailchimp.com/voice-and-tone/ / the voice-fixed/tone-moves model, four named voice traits, the reader's-state-of-mind procedure, execution rules and the mascot prohibition.
2. Mailchimp Content Style Guide, Writing About People / https://styleguide.mailchimp.com/writing-about-people/ / the shape of a word-level rule list (rule plus reason); confirmed the emotional-state model lives on the voice-and-tone page, not here.
3. Shopify, App design guidelines: Content / https://shopify.dev/docs/apps/design/content / voice constant / tone contextual, grade-7 readability target with a named checking tool, one-term-per-concept consistency rule, CTA verb rule, guidance-over-prescription posture.
4. GOV.UK content and publishing guidance, A to Z style guide / https://guidance.publishing.service.gov.uk/writing-to-gov-uk-standards/style-guides/a-to-z-style-guide/ / the paired banned-word-to-replacement table and the metaphor bans; the "be open and specific" governing principle.
5. GOV.UK content and publishing guidance, Use clear language / https://guidance.publishing.service.gov.uk/writing-to-gov-uk-standards/writing-guidelines/clear-language/ / plain English as mandatory, 25-word sentence cap, five-sentence paragraph cap, active voice, the positive/negative contraction asymmetry, nominalisation warning.
6. Nielsen Norman Group, Error Message Guidelines / https://www.nngroup.com/articles/error-message-guidelines/ / required contents of an error, blame-word bans (*invalid*, *incorrect*), severity levels, proximity, preserving user input, relocating technical detail to help links.
7. Nielsen Norman Group, Empty-State Interface Design / https://www.nngroup.com/articles/empty-state-interface-design/ / the three jobs of an empty state with real quoted examples, and the blank-space failure mode.
8. Nielsen Norman Group, The Four Dimensions of Tone of Voice / https://www.nngroup.com/articles/tone-of-voice-dimensions/ / the four dimensions (formal/casual, serious/funny, respectful/irreverent, matter-of-fact/enthusiastic), Kate Moran's derivation method, and the finding that variation along them produces measurable but modest differences in user impressions (n=50, p<0.05).
9. Anthropic, Prompting best practices / https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/claude-prompting-best-practices / role prompting, the 3-to-5 relevant/diverse/structured example rule, XML tagging, reason-with-rule, tell-it-what-to-do, prompt-style-leaks-into-output, long-input-at-top, prefill removal, and the verbatim "on distribution" / AI-slop anti-convergence block.
10. Microsoft Learn, Error Message Guidelines (Win32) / https://learn.microsoft.com/en-us/windows/win32/debug/error-message-guidelines / the three-question content contract, per-cause specificity, no-blame rule, tense and voice rules, and the explicit word bans (*bad*, *please*, uppercase, exclamation points, anthropomorphising).
11. Microsoft Learn, Writing style (Windows apps) / https://learn.microsoft.com/en-us/windows/apps/design/style/writing-style / three named voice principles indexing every downstream rule, matched do/don't pairs, you/we person rules, period rules by grammatical status, contraction rule, the error exemplar, the dialog call-and-response rule, button rules.
12. OpenAI, Prompt engineering guide / https://developers.openai.com/api/docs/guides/prompt-engineering / the developer/user message priority hierarchy, few-shot pattern induction, and the Identity / Instructions / Examples / Context prompt structure with Markdown or XML delimiters.
13. OpenAI, Evaluation best practices / https://developers.openai.com/api/docs/guides/evaluation-best-practices / the three model-graded methods, pairwise preferred for reliability, rubric design by showing score-level examples, reasoning before scoring, length-bias control, human validation of the judge.
14. Jung et al., Examining Identity Drift in Conversations of LLM Agents (arXiv 2412.00804) / https://arxiv.org/abs/2412.00804 / identity/style drift across multi-turn conversation, larger models drifting more, and the finding that assigning a persona may not maintain identity. Abstract only; full text not fetched.
15. Stylometric detection of AI-generated texts (Digital Scholarship in the Humanities, OUP) / https://academic.oup.com/dsh/advance-article/doi/10.1093/llc/fqag064/8714041 / 70 function-word feature set, the core finding that AI text is stylistically uniform and clustered while human text is dispersed and idiosyncratic, and the drop in detectability on short texts.
16. Anthropic, Prompt engineering overview / https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/overview / the precondition framing (success criteria and evals before prompt engineering) and the pointer to the living best-practices reference.

**UNVERIFIED, not cited above:** Atlassian Design System voice and tone (atlassian.design/content/voice-and-tone-principles/ returned an empty body); Apple Human Interface Guidelines, Writing (developer.apple.com/design/human-interface-guidelines/writing returned title only across several attempts); Material Design 3 writing guidance (m3.material.io/foundations/writing returned no substantive body); Microsoft Style Guide term collection for error messages (404); NN/g microcopy and form-error articles (404). Several of these surfaced quotable-looking text in search snippets, which has deliberately not been used.
