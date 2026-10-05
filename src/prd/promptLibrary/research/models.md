# Image models · cross-cutting research dossier
_Researched 2026-08-15. Sources listed at the bottom, numbered; cite by number inline._

Scope note on honesty: everything below is either quoted from a page actually fetched, or
marked as inference, UNVERIFIED or UNRESOLVED. Several very widely repeated prompt-engineering
claims turned out to have no primary backing; they are called out as such in their sections
rather than quietly repeated.

## GPT Image 2

**Identity and endpoints.** `gpt-image-2` is OpenAI's current image model, latest snapshot
`gpt-image-2-2026-04-21` (the default). It is served by `v1/images/generations` and
`v1/images/edits` only: no chat completions, no fine-tuning, no video. It takes text and image
inputs and returns images, and supports inpainting and "high-fidelity image inputs" [2].
Prior models still documented alongside it: `gpt-image-1.5`, `gpt-image-1`, `gpt-image-1-mini` [1].
Version discipline matters here, because the single most-quoted parameter in this family
(`input_fidelity`) behaves differently on 2 than on 1.5 and 1.

**Parameters that matter to a prompt library** [1]:

| Parameter | Values | Note |
| --- | --- | --- |
| `size` | 1024x1024, 1536x1024, 1024x1536, 2048x2048, 2048x1152, 3840x2160, 2160x3840, auto | max edge 3840px, multiples of 16px, ratio at most 3:1, total pixels 655,360 to 8,294,400 |
| `quality` | low, medium, high, auto | low is for fast drafts |
| `background` | transparent, opaque, auto | [3] |
| `output_format` | png (default), jpeg, webp | jpeg is lowest latency |
| `output_compression` | 0 to 100 | jpeg and webp only |
| `n` | integer | several images per request |
| `stream` / `partial_images` | bool / 0 to 3 | progressive previews |
| `moderation` | auto (default), low | filter strictness |

**`input_fidelity`.** Values are `low` and `high`, and it controls how strongly the model
adheres to the supplied source images during an edit [3]. The OpenAI cookbook is explicit that
it "applies to `gpt-image-1.5` and `gpt-image-1` (not `gpt-image-2`)", and recommends `high`
for identity-sensitive edits, large scene edits that risk losing likeness, and lighting or
weather transformations [5]. For `gpt-image-2` the parameter is not a lever at all: the model
processes image inputs at high fidelity by default. Practical consequence for us: on GPT Image 2
you cannot dial reference adherence down or up, so reference strength has to be managed in
language, not in parameters.

**Reference images, edits and masks.** The edits endpoint accepts up to 16 input images for the
GPT image models (1 for dall-e-2) [3]. A mask must be the same format and size as the source,
must carry an alpha channel, and must be under 50MB [1]. In the Responses API, images can be
passed as URLs, base64 data URLs, or Files API file IDs [1]. Image inputs are billed as tokens,
and because GPT Image 2 always runs inputs at high fidelity, edit requests carrying references
cost more input tokens than the equivalent 1.x request [1].

**Prompt rewriting.** Documented and real, but scoped: the Responses API "will automatically
revise your prompt for improved performance", and the rewritten text comes back in a
`revised_prompt` field [1]. Inference (flagged as such): if a prompt from this library is run
through a Responses-API-based surface, the text that actually conditioned the image is the
revised one, so a drifting style across a set may be the rewriter's doing rather than ours, and
`revised_prompt` is the place to check. I found no statement that the direct
`v1/images/generations` call rewrites prompts.

**Prompt length.** The API reference states the maximum prompt length as 32,000 characters for
the GPT image models, 1,000 for dall-e-2 and 4,000 for dall-e-3 [3]. So at the API level there
is enormous headroom, and any 1,000-character ceiling we work under is a client-side limit, not
a model limit (see the Figma section).

**Seeds.** No seed parameter appears in the documented parameter set for the images endpoints
[1][3]. Treat GPT Image 2 as non-reproducible: identical prompts do not give identical images,
and set consistency must come from references and restated invariants, not from a seed.
UNRESOLVED whether any undocumented seed exists.

**Official prompting guidance** [5][6]. This is the strongest primary source we have and it is
worth following closely:
- Write prompts in a consistent order: background/scene, then subject, then key details, then
  constraints [5].
- State the intended use (ad, UI mock, infographic) to set the mode and level of polish [5].
- Syntax is not the lever. "Minimal prompts, descriptive paragraphs, JSON-like structures,
  instruction-style prompts, and tag-based prompts can all work well as long as the intent and
  constraints are clear", and for production systems the advice is to "prioritize a skimmable
  template over clever prompt syntax" [5]. For complex briefs, short labelled segments or line
  breaks beat one long paragraph [6].
- Reference each input image by index and description ("Image 1: product photo, Image 2: style
  reference"), and be explicit about placement when compositing [5].
- Set consistency: establish a character or style anchor first, then on every subsequent
  generation restate what must not change. The guide repeats the invariants verbatim across
  panels ("same green hooded tunic", "same facial features, proportions, and color palette") and
  says to repeat preservation constraints on every iteration to reduce drift [5][6].
- Exclusions are stated explicitly and they work: "no watermark", "no extra text",
  "no logos/trademarks", "Do not change her face, facial features, skin tone, body shape, pose,
  or identity" [5]. Note this is the opposite of Google's advice (see below), and the difference
  is real, not a contradiction to be averaged away: OpenAI's instruction-following image models
  are documented to take direct negative constraints.
- Text in images: put literal copy in quotes or ALL CAPS, specify typography, demand verbatim
  rendering, spell tricky brand names letter by letter, and use medium or high quality for small
  or dense text [5][6].
- Specificity about material, texture and medium beats generic boosters; camera and composition
  language ("lens, aperture feel, lighting") steers realism more reliably than "8K/ultra-detailed" [6].
- On length: no limit is stated, and long structured prompts are accepted for complex briefs, but
  the guide's own advice is "iterate instead of overloading" and to debug from a clean base prompt
  with small single-change follow-ups [5][6].

## Nano Banana 2 / Gemini image

**Identity.** "Nano Banana" is Google's name for Gemini's native image generation. The current
family [7][10]:
- `gemini-3.1-flash-image` = Nano Banana 2, the versatile workhorse, up to 4K.
- `gemini-3.1-flash-lite-image` = Nano Banana 2 Lite, fastest and cheapest, 1K.
- `gemini-3-pro-image` = Nano Banana Pro, premium, complex visual tasks.
- `gemini-2.5-flash-image` is legacy and deprecated, shutting down October 2026 [10].

Context windows are large: Nano Banana 2 at 131,072 tokens, Nano Banana Pro at 65,536, output
max 32,768, knowledge cutoff January 2025 [8]. Prompt length is a non-issue at the API level.

**Prompt structure. Prose, explicitly, not keyword lists.** Google's guide says do not use simple
keyword lists, and use narrative description when starting from a blank canvas: "you are the
director" [8]. The documented text-to-image formula is
`[Subject] + [Action] + [Location/context] + [Composition] + [Style]` [8], and the consumer-side
tips repeat the same elements: subject, composition, action, location, style, plus explicit
editing instructions [9]. The API docs likewise emphasise "descriptive, detailed prose over
keywords" and supply templates carrying shot type, lighting, camera angle and material [7].
Google also warns against over-prompting with generic boosters such as "4k, trending on
artstation".

**Negative prompting.** Two separate facts, both sourced:
1. As a *parameter*, negative prompts are gone. `negativePrompt` was an Imagen 3 feature
   (`imagen-3.0-generate-001`, `-fast-generate-001`, `-capability-001`) and the docs state
   plainly: "Negative prompts are a legacy feature, and are not included with the Imagen models
   starting with `imagen-3.0-generate-002` and newer" [11]. No negative-prompt parameter is
   documented for the Gemini image models [7][10].
2. As *language*, Google tells you to invert it: describe what you want, not what you do not.
   The guide's own example is "no cars" (wrong) versus "empty street" (right) [8].

**Multi-image and reference behaviour.** Documented per-model slots [7][10]:
- Flash Lite: up to 14 objects.
- Flash Image (Nano Banana 2): up to 10 objects, 4 character images, 3 style references.
- Pro Image: up to 6 objects, 5 character images (Firebase doc lists Pro with 3 style refs [10]).

The reference formula is `[Reference images] + [Relationship instruction] + [New scenario]`, and
the guide's example names the role of each input ("the attached napkin sketch as the structure
and the attached fabric sample as the texture") [8]. This role-naming is the same discipline as
OpenAI's index-plus-description rule [5], which makes it a genuinely cross-model rule.

**Character consistency.** Supported via the dedicated character reference slots, and listed as a
headline capability ("multi-image blending with character consistency") [9][7]. But Google's own
limitations list includes "variable character consistency across edits" [9], so consistency is a
best effort, not a guarantee. Multi-turn editing is supported via `previous_interaction_id` [7].

**Aspect ratio and resolution.** Aspect ratios 1:1 (default), 3:2, 2:3, 3:4, 4:3, 4:5, 5:4, 9:16,
16:9, 21:9 and, per Firebase, thirteen options up to 8:1 and 1:8 [7][10]. Resolutions 512 (Flash
only), 1K, 2K, 4K, and the K must be uppercase or the request is rejected [7]. Pro supports 1K,
2K, 4K; Flash Lite is 1K (512 on the Developer API only) [10].

**Seeds.** No seed parameter is documented for the Gemini image models [10]. Same conclusion as
OpenAI: reproducibility comes from references and restated invariants, not from a seed.

**Watermark.** Generated images carry a SynthID watermark, and Nano Banana output also carries
C2PA Content Credentials [7][8]. SynthID is imperceptible to humans and verifiable either by
asking Gemini in chat or through the SynthID Detector portal [12]. One honest caveat: the
DeepMind page does not itself state that *every* Gemini image is watermarked; the universal claim
for these models comes from the Gemini API docs, which say all generated images include it [7].

**Documented failure modes from Google itself** [9][7]: imperfect text fidelity and small detail
rendering; factual accuracy in data visuals needs checking; grammar issues in multilingual text;
artifacts in complex edits; variable character consistency. Generation can also fail silently
with finish reason `NO_IMAGE`, and the documented remedy is to retry or rephrase [10].

## Figma's image generation

**What Figma exposes.** "Make an image" (text to image), "Edit with prompt", "Select area",
"Remove background", "Expand image", "Boost resolution", available across Figma Design, FigJam,
Figma Draw, Figma Slides, Figma Sites and Figma Buzz, on paid plans with edit access, drawing on
a shared AI credit pool [13]. The prompt field has a model dropdown ("select an available AI
model"), and reference images can be attached by upload, by clicking a canvas image, by paste, or
by drag [13]. Figma's own guidance on writing the prompt is one line: "include as much context as
possible" [13].

**Which models.** Figma's help pages never name the providers [13][14]. Figma states only that
its generative features are "powered by third-party, out-of-the-box AI models" not trained on
customer files [16]. The one model Figma names publicly for image generation is Google's
**Gemini 3 Pro Image (Nano Banana Pro)**, announced as rolling out "in all Figma products where
you can generate images", covering Buzz, Design, Slides and Weave [17]. Whether an OpenAI
`gpt-image-*` model is offered in the native dropdown is UNVERIFIED from any Figma primary
source; the search hits pairing "Nano Banana" and "GPT-Image" in Figma are third-party community
plugins (VM Studio and similar), not the native feature.

**The prompt length cap: UNRESOLVED.** No Figma primary source states a character limit for the
image prompt field. The pages that do carry limits list attachment counts and file sizes only
(10 files per prompt in Make, 25 to 50MB images, 5MB PDFs, and so on), with no prompt character
figure [15], and the "Make or edit an image with AI" page states no length restriction [13].
Two things must be said plainly:
- Neither model behind the field imposes anything like a 1,000-character cap. OpenAI documents
  32,000 characters for GPT image models [3]; Gemini image models have a 131,072-token context on
  Nano Banana 2 [8]. So a 1,000-character ceiling, if it exists, is Figma's client-side choice.
- The widely circulated "1,000 characters" figure that surfaces in search is, on inspection,
  **Adobe Firefly's** limit as discussed in Adobe's own community forum, not Figma's. Do not cite
  it as a Figma fact.

Recommendation: keep `COMPACT_LIMIT` at 1000 as a defensive, empirically-derived working number,
but label it in code as an observed client limit with no primary source, and re-measure it by
pasting a known-length string into the field rather than trusting documentation that does not
exist. This dossier cannot confirm the cap, and says so.

## What is actually evidence-based about prompt writing

**Prose versus keyword soup.** Genuinely model-dependent, and both vendors have said so in their
own words. Google: do not use keyword lists, write narrative description, and skip generic
boosters like "4k, trending on artstation" [8]. OpenAI: format is not the lever, paragraphs,
JSON-ish structures, instruction style and tag lists all work "as long as the intent and
constraints are clear", and production systems should favour a skimmable template [5]. The safe
intersection, and what this library should write, is **specific descriptive prose organised into
labelled, ordered segments**. That satisfies Google's prose requirement and OpenAI's skimmability
requirement at once.

**Clause order.** OpenAI gives a concrete order and calls it a recommendation:
background/scene, subject, key details, constraints [5]. Google gives a different but equally
concrete order: subject, action, location/context, composition, style [8]. Both are vendor
recommendations, not measured effects. The stronger claim usually attached to this, that
**earlier tokens carry more weight**, I could find **no primary evidence for** on either GPT
Image or Gemini image. Flag it as folklore for these models. What is documented is that a
*consistent* order helps, mostly because it makes prompts diffable and debuggable [5].

**Prompt length versus adherence.** The academic evidence is real but is about diffusion models,
not about GPT Image 2 or Gemini, so apply with care. Long prompts measurably reduce output
diversity across SD3.5-Large, Flux.1-Krea-Dev, CogView4 and Qwen-Image: "longer prompts
consistently yield lower scores across all evaluated models", because specifying style, camera
angle and composition "restricts the feasible region of possible outputs" [18]. Separately,
adherence degrades with length: LongAlign drops "by up to 30% for those over 500 tokens", and
strong models "miss more than half of the specified objects" on long compositional prompts, with
more than half of described characters omitted entirely by FLUX [19]. Two useful takeaways that
do transfer: (a) length is what buys us style constancy across a set, and the diversity collapse
is a *feature* for this library, not a bug; (b) past a few hundred tokens some clauses will be
silently dropped, so the clauses that must not be dropped should be few, early and repeated.
OpenAI's own guidance points the same way: iterate rather than overload [5].

**Negative prompting.** Three distinct things, kept apart:
1. A real `negativePrompt` *parameter* exists only on legacy Imagen 3 models and is explicitly
   dropped from `imagen-3.0-generate-002` onward [11]. Neither GPT Image 2 nor the Gemini image
   models expose one [1][3][7][10].
2. Negative *language* is endorsed by OpenAI: the cookbook's own prompts say "no watermark",
   "no extra text", "Do not change her face" [5]. So on GPT Image, "no X" is documented to work.
3. Negative *language* is discouraged by Google, which prescribes positive reframing:
   "empty street" rather than "no cars" [8].
The claim that "no X summons X" on these specific models is **not supported by any primary source
I could find**, and OpenAI's guidance is direct evidence against it for GPT Image. Treat it as
folklore inherited from earlier CLIP-conditioned diffusion models. The defensible rule is not
"never negate", it is "prefer a positive description when one exists, and reserve explicit
negations for the specific places the model actually defaults wrong".

**Seeds and reproducibility.** No seed parameter is documented on either family [1][3][10].
Reproducibility is therefore not available; set consistency has to be engineered.

**Keeping a set consistent.** This is the best-sourced technique in the whole dossier, and both
vendors converge on it:
- Anchor first. Generate or supply one reference that fixes the look, then reuse it [5].
- Name every reference's role. OpenAI: index plus description [5]. Google: relationship
  instruction naming which input is structure and which is texture [8].
- Restate the invariants on every single generation, verbatim, and expect drift if you do not:
  "repeat preservation constraints on every iteration to reduce drift" [5][6].
- Use the dedicated slots when on Gemini: character references and style references are separate
  input types with their own caps [7][10].
- Chaining a previous output back in as reference is supported (multi-turn editing via the
  Responses API on OpenAI [1], `previous_interaction_id` on Gemini [7]), but Google lists
  variable character consistency across edits as a known limitation [9], so a long chain will
  drift. Prefer re-anchoring to the original reference over chaining many generations deep.

## Known failure modes and documented counters

| Failure | Documented? | Counter, and source |
| --- | --- | --- |
| Text rendering wrong, misspelled, extra characters | Yes, both vendors. Google lists "text fidelity and small detail rendering imperfections" and grammar issues in multilingual text [9] | Put literal copy in quotes or ALL CAPS, specify font style, size, colour and placement, demand verbatim rendering, spell tricky words letter by letter, use medium or high quality for small or dense text [5][6]. Google: quote the text, name the font, and generate the copy in conversation first, then ask for the image [8]. The Gemini API doc likewise says text works best when generated separately first [10] |
| Sameness and averaging across a set | Partially. Measured on diffusion models: long prompts collapse diversity [18] | For this library that is desirable. Where variety is wanted, vary a small number of dials and keep the rest constant, rather than lengthening the prompt |
| Clauses silently ignored on long prompts | Yes, on diffusion models: over half of specified objects missed on long compositional prompts [19]. Not measured on GPT Image 2 or Gemini | Keep non-negotiables few and early, repeat them, and iterate with single-change follow-ups from a clean base [5] |
| Negations summoning the thing negated | **No primary evidence found for GPT Image 2 or Gemini.** OpenAI actively uses negations [5]; Google merely prefers positive phrasing [8] | Prefer positive description; use targeted negation where the model defaults wrong |
| Hands, anatomy | **No primary vendor documentation found.** UNVERIFIED as a documented failure mode of these two model families | No sourced counter to offer. Do not put folklore hand-fixing clauses in prompts on this dossier's authority |
| Service rewrites the prompt | Yes: the Responses API "will automatically revise your prompt for improved performance", returned as `revised_prompt` [1] | Read `revised_prompt` when diagnosing drift. On surfaces that hide it (Figma), assume some rewriting may occur and keep the invariants unmissable and early |
| Generation silently returns nothing | Yes on Gemini: finish reason `NO_IMAGE` [10] | Retry or rephrase [10] |
| Moderation blocks | Yes on both: OpenAI returns `moderation_details` with categories and stage (input/output) [1]; Gemini safety filters may block [10] | On OpenAI, `moderation: low` loosens strictness [1] |
| Reference adherence not tunable on GPT Image 2 | Yes: `input_fidelity` does not apply to `gpt-image-2` [5] | Manage reference strength in language, and use `gpt-image-1.5` with `input_fidelity: high` when an identity-preserving edit needs the knob [5] |

## Rules this library should adopt

1. **Write specific descriptive prose, never a keyword pile.** Google explicitly rejects keyword
   lists and generic boosters such as "4k, trending on artstation" [8]; OpenAI says format is
   secondary to clear intent and constraints [5]. Checkable: no prompt in the library contains a
   bare comma-run of quality boosters.
2. **Organise every prompt in one fixed clause order and never vary it between styles.** Use
   OpenAI's order as the spine (scene/ground, subject, key details, constraints) [5], with
   Google's elements (subject, action, location, composition, style) mapped into it [8]. Order
   consistency is defensible; "earlier tokens weigh more" is not, so do not justify the order
   that way.
3. **State the intended use of the image explicitly** (packshot, spotter chart, icon sheet), since
   OpenAI documents that naming the use sets the model's mode and level of polish [5].
4. **Name the role of every reference image in the prompt text.** "Image 1: style reference.
   Image 2: subject." OpenAI requires index plus description [5]; Google requires an explicit
   relationship instruction [8]. Checkable: any prompt shipped with a reference names it.
5. **Repeat the invariant clauses in full on every generation in a set.** Do not rely on
   conversational carry-over. OpenAI: restate preservation constraints on every iteration to
   reduce drift [5][6]. This is exactly what the library's constants already do; it now has a
   source.
6. **Prefer positive description; negate only where the model actually defaults wrong.** Google's
   "empty street" not "no cars" [8], balanced against OpenAI's documented, working negations
   ("no watermark", "no extra text") [5]. Checkable: every remaining "no X" clause has a note
   saying which default it corrects.
7. **Never write a negative-prompt field or expect one to exist.** The only real `negativePrompt`
   parameter belonged to legacy Imagen 3 models and was removed from `imagen-3.0-generate-002`
   onward [11]; neither target model exposes one [3][7][10].
8. **For any text inside an image: quote it verbatim, name the typeface character, and demand
   exact rendering** [5][6][8]. Where the global rules forbid text entirely, keep the explicit
   "no lettering" constraint, which is OpenAI-documented usable phrasing [5].
9. **Do not put a seed or reproducibility promise anywhere in the library.** No seed parameter is
   documented on either family [1][3][10]; consistency comes from references plus restated
   invariants.
10. **Keep the compact register genuinely short and load-bearing clauses first.** Adherence
    degrades and clauses get dropped on long prompts, measured at up to 30% over 500 tokens on
    diffusion models [19]; OpenAI's own advice is to iterate rather than overload [5]. Marked as
    partially transferable evidence.
11. **Treat length as the tool for style constancy, not for detail hoarding.** Longer, more
    constrained prompts measurably reduce output diversity [18], which is what a consistent set
    needs; but every added clause is another candidate for silent dropping [19].
12. **Keep `COMPACT_LIMIT` at 1000 but label it UNSOURCED in code.** No Figma primary source
    states a character cap [13][14][15], and the widely repeated 1,000 figure traces to Adobe
    Firefly, not Figma. Model-side limits are 32,000 characters (GPT image) [3] and a
    131,072-token context (Nano Banana 2) [8], so the cap, if real, is Figma's client only.
13. **Target Gemini 3 Pro Image / Nano Banana Pro as the model actually behind Figma's field**,
    since that is the only image model Figma has publicly named for its native generation [17].
    Whether a `gpt-image-*` option exists natively is UNVERIFIED.
14. **On GPT Image 2, do not send `input_fidelity`.** It applies to `gpt-image-1.5` and
    `gpt-image-1` only [5]; GPT Image 2 handles inputs at high fidelity by default, so reference
    strength must be expressed in words.
15. **Use Gemini's typed reference slots rather than dumping every image in as an object.**
    Nano Banana 2 takes up to 10 objects, 4 character images and 3 style references; Pro takes 6
    objects and 5 characters [7][10].
16. **Assume every Gemini-generated image carries SynthID and C2PA Content Credentials** [7][8],
    and say so on the page rather than implying the outputs are unmarked.
17. **When a set drifts on an OpenAI surface, check `revised_prompt` before rewriting clauses**,
    since the Responses API revises prompts automatically [1].
18. **Debug by single-change iteration from a clean base prompt, not by rewriting the whole
    thing** [5][6]. This suits the library's one-clause-one-job architecture and gives it a source.
19. **Do not add anatomy or hand-fixing folklore clauses.** No primary documentation for these
    model families was found; UNVERIFIED, so nothing goes in the prompts on that basis.
20. **Re-anchor rather than chain deep.** Multi-turn editing exists on both (`previous_interaction_id`
    on Gemini [7], Responses API multi-turn on OpenAI [1]) but Google lists variable character
    consistency across edits as a known limitation [9], so long chains drift.

## Sources

1. Image generation guide · https://developers.openai.com/api/docs/guides/image-generation · parameter table (size, quality, output_format, n, stream, partial_images, moderation), mask requirements, reference input formats, automatic prompt revision via `revised_prompt`, moderation error detail, high-fidelity input token cost on gpt-image-2.
2. GPT Image 2 model page · https://developers.openai.com/api/docs/models/gpt-image-2 · snapshot `gpt-image-2-2026-04-21`, supported endpoints, inpainting and high-fidelity image inputs, rate tiers.
3. Images API reference (create) · https://developers.openai.com/api/docs/api-reference/images/create · prompt maximum of 32,000 characters for GPT image models (1,000 dall-e-2, 4,000 dall-e-3), `background`, `moderation`, `input_fidelity` (low/high) on edits, up to 16 input images for GPT models.
4. Images and vision guide · https://developers.openai.com/api/docs/guides/images-vision · image input methods and formats, 512MB payload / 1,500 image ceiling, `detail` levels, input-fidelity token costs on GPT Image 1 edits.
5. GPT image models prompting guide (OpenAI Cookbook) · https://developers.openai.com/cookbook/examples/multimodal/image-gen-models-prompting-guide · the primary OpenAI prompting source: clause order, syntax-agnosticism, reference indexing, set-consistency by restating invariants, explicit negations, text rendering rules, `input_fidelity` not applying to gpt-image-2, iterate-rather-than-overload.
6. gpt-image-1.5 prompting guide (OpenAI Cookbook) · https://developers.openai.com/cookbook/examples/multimodal/image-gen-1.5-prompting_guide · corroborates clause order, labelled segments over one long paragraph, camera language over generic boosters, preservation phrasing, text rules.
7. Nano Banana image generation, Gemini API docs · https://ai.google.dev/gemini-api/docs/image-generation · model line-up and versions, resolutions and uppercase-K rule, aspect ratios, per-model reference slots, prose-over-keywords, multi-turn via `previous_interaction_id`, SynthID on all outputs.
8. Ultimate prompting guide for Nano Banana (Google Cloud Blog) · https://cloud.google.com/blog/products/ai-machine-learning/ultimate-prompting-guide-for-nano-banana · the primary Google prompting source: narrative not keyword lists, the subject/action/location/composition/style formula, positive framing ("empty street" not "no cars"), reference relationship instructions, text-in-quotes, materiality and camera direction, context windows, C2PA plus SynthID.
9. Nano Banana Pro prompting tips (Google blog) · https://blog.google/products-and-platforms/products/gemini/prompting-tips-nano-banana-pro/ · consumer-facing prompt elements, reference-role guidance, and Google's own stated limitations list including variable character consistency and text fidelity.
10. Generate and edit images using Gemini, Firebase AI Logic · https://firebase.google.com/docs/ai-logic/generate-images-gemini · model IDs and deprecations, aspect ratio and resolution options, per-model reference caps, absence of seed and negative-prompt parameters, `NO_IMAGE` silent failure, text-first advice.
11. Omit content using a negative prompt (Vertex AI docs) · https://docs.cloud.google.com/vertex-ai/generative-ai/docs/image/omit-content-using-a-negative-prompt · `negativePrompt` supported only on three Imagen 3 models and stated as legacy, "not included with the Imagen models starting with imagen-3.0-generate-002 and newer".
12. SynthID (Google DeepMind) · https://deepmind.google/science/synthid/ · what SynthID is, imperceptibility, and the two verification routes; does not itself assert universal coverage.
13. Make or edit an image with AI (Figma Help) · https://help.figma.com/hc/en-us/articles/24004542669463-Make-or-edit-an-image-with-AI · the feature set, the model dropdown, reference-image attachment routes, credits, and the absence of any stated prompt character limit.
14. Use AI tools in Figma Design (Figma Help) · https://help.figma.com/hc/en-us/articles/23870272542231-Use-AI-tools-in-Figma-Design · confirms no provider names and no prompt length limits are published here.
15. Attach designs and images to a prompt (Figma Help) · https://help.figma.com/hc/en-us/articles/31304529835671-Attach-designs-and-images-to-a-prompt · the only documented Figma limits are attachment counts and file sizes, not prompt characters.
16. Introducing Figma AI (Figma Blog) · https://www.figma.com/blog/introducing-figma-ai/ · "powered by third-party, out-of-the-box AI models", with no models named.
17. Creativity meets precision with Gemini 3 Pro Image (Figma Blog) · https://www.figma.com/blog/creativity-meets-precision-with-gemini-3-pro-with-nano-banana/ · the one image model Figma names publicly, rolling out across all Figma products where images can be generated.
18. PromptMoG (arXiv 2511.20251) · https://arxiv.org/html/2511.20251v1 · measures diversity collapse as prompt length rises, across SD3.5-Large, Flux.1-Krea-Dev, CogView4, Qwen-Image. Diffusion models only, does not cover GPT Image or Gemini.
19. Long-Text-to-Image Generation via Compositional Prompt Decomposition (arXiv 2604.18258) · https://arxiv.org/html/2604.18258v1 · adherence degradation on long prompts (up to 30% over 500 tokens), over half of specified objects and characters omitted. Diffusion models only.

UNVERIFIED / not fetched, therefore not cited anywhere above: the platform.openai.com API reference (returned HTTP 403), and every third-party listicle or vendor-reseller page that appeared in search results (Replicate, fal, Runware, WaveSpeed, apiyi, pixeldojo, Medium posts, Adobe community threads). The Adobe community threads are the traceable origin of the "1,000 character" figure and describe Adobe Firefly, not Figma.
