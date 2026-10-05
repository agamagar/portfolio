# Base-mesh restyling - research dossier
_Researched 2026-08-15. Sources numbered at the bottom, cited inline by number._

Honesty note, per the pipeline's standing rules: everything below is either drawn from a page
actually fetched, or marked _(inference)_ / UNVERIFIED. Several claims that circulate widely in
prompt-craft writing (that normal maps "beat" depth, that indexed role labels like "IMAGE 1 =
STRUCTURE" are a documented feature of GPT Image) could not be sourced and are called out as such
rather than repeated. Two fetches failed outright and are listed at the end.

## The problem

One fixed, identity-free 3D head render is the "empty slate": correct proportions, no material, no
colour, no likeness. From it we want N stylised heads (soft-vinyl toy, matte clay, plaster cast,
oil caricature) where the **form and volume are byte-for-byte the same silhouette** and only the
**material and light treatment** move. Identity arrives separately, as a photo of a person.

That is three separate jobs stacked on one generation:

1. **Hold geometry** (the base render must dominate shape).
2. **Swap material and light** (the style clause must dominate surface).
3. **Inject identity** (a second reference must dominate features, without dragging its own
   photographic material and lighting in with it).

Jobs 1 and 2 are in direct tension, because the base render is itself an image with a material and
a light: whatever holds its shape also tends to hold its grey. That tension is the whole dossier.

## What the base render should be

The honest headline: **there is no published head-to-head benchmark ranking these passes for
restyling reliability.** The ControlNet paper trains eight conditions (Canny edge, depth map,
normal map, M-LSD lines, HED soft edge, ADE20K segmentation, Openpose, user sketches) and shows
them qualitatively side by side, but states no quantitative comparison between depth, normal and
Canny [1]. Anyone who tells you normal beats depth by a documented margin is guessing.

What IS documented is what each pass encodes, and therefore what it can and cannot constrain.

| PASS TYPE | what it encodes | how reliably a model follows it | source # |
| --- | --- | --- | --- |
| Depth map | per-pixel distance from camera. Gross volume and front-to-back ordering. Loses fine surface relief, because a shallow crease is a near-zero depth delta | Trained ControlNet condition; the diffusers guide uses depth as its worked example specifically "to keep the spatial information in the image" [1][2]. Strong on mass and pose, weak on detail | 1, 2 |
| Normal map | per-pixel surface orientation. Every crease, nostril edge and lid fold survives, because those are large orientation deltas even at zero depth delta | Trained ControlNet condition. The official card notes it was trained on 25,452 DIODE normal-image pairs, then extended on "coarse" normals derived by running Midas depth then normal-from-distance [3]. That derivation matters: a **true** normal pass rendered out of Blender or ZBrush is cleaner than what the model was mostly trained on _(inference: cleaner input than training distribution is usually fine, but it is not what the model saw)_ | 1, 3 |
| Canny / lineart | binarised edges only. Silhouette and hard feature boundaries. No volume information at all | Trained condition [1]. Cheap and very literal, but a line drawing of a head underconstrains where the cheek mass sits, so two styles can both satisfy it and still differ in volume _(inference)_ | 1 |
| Ambient occlusion | cavity and contact darkening. Reads as form to a human eye, but it is a **shading** term, not a geometry term | **Not a trained ControlNet condition** [1]. Nothing found documenting AO as a structure reference. Its real risk is category confusion: it looks like a lit greyscale photo of a head, so a model is as likely to treat it as the picture to restyle as the structure to obey _(inference)_ | 1 |
| Matcap | material-capture shading looked up by surface normal. Visually the richest form read of the set, and effectively a normal map with a baked lighting model on top | Nothing found in any primary model documentation naming matcap as a conditioning type. UNVERIFIED as a controllable pass. It is the single worst offender for the bleed failure below, because its whole purpose is to bake a material into the shape | - |
| Flat-lit untextured clay render | shape plus a neutral material plus a soft light, all at once | This is the one that closed-model reference-image edits are actually built for: they take ordinary images, not control passes. Note it carries the most bleed risk of any option in a hosted tool, because it is a complete, plausible picture of a grey head | 4, 5, 7 |

**The practical call.** Which pass is right depends entirely on which mechanism you have:

- **If you have ControlNet** (local or a node tool that exposes it): render a **normal pass**, and
  optionally stack a depth pass alongside it. Normal because it is the only trained condition that
  carries surface relief as well as mass; depth alongside because it pins global front-to-back
  ordering that normals alone leave ambiguous. Both are trained conditions [1][3].
- **If you have only a hosted closed model** (GPT Image 2, Gemini, Kontext): there is no control
  pass input at all. The base render must be a **legible picture of a head**, so use the
  **flat-lit untextured neutral clay render**, and manage bleed in language (see failure modes).
  A raw normal map fed to GPT Image 2 as a reference image is a picture of a purple-and-green head
  and will be restyled as such _(inference, but a direct consequence of the fact that these models
  accept reference images rather than control tensors)_.

Whichever you pick, one thing is documented for the base render itself: **holding the camera
fixed**. Turnaround practice uses low-opacity guide lines across every view so head height, chin
line and ground line match across angles [8]. From a 3D base you get that for free by orbiting one
camera at one focal length, and you should, because it is the cheapest consistency you will ever
buy.

## Conditioning mechanisms

| MECHANISM | preserves what | available in hosted tools? | source # |
| --- | --- | --- | --- |
| ControlNet (depth / normal / canny / lineart) | spatially localised structure. The architecture locks the base model's weights and adds a trainable copy joined by zero convolutions, so the condition adds control without damaging the pretrained prior [1] | **No.** Requires model-level access (diffusers, ComfyUI, A1111). Not exposed by GPT Image 2, Gemini or the Kontext API | 1, 2 |
| ControlNet condition strength / CFG resolution weighting | how hard the condition is enforced against the prompt. The paper introduces CFG Resolution Weighting (weights w_i = 64 / h_i per block) to balance guidance across resolutions without dropping CFG [1] | No | 1 |
| IP-Adapter | image-prompt **content and appearance**, via a decoupled cross-attention that handles text and image features in separate layers, 22M params, base model frozen. It composes with ControlNet: the paper states it generalises "to controllable generation using existing controllable tools" [6] | No | 6 |
| img2img denoise strength | resemblance to the init image, continuously. Documented exactly: strength determines how many noise steps are added, so at num_inference_steps 50 and strength 0.8 you add 40 steps of noise and denoise 40. Higher strength gives the model more freedom, and 1.0 means "the initial image is more or less ignored" [2] | Sometimes, under names like "image strength" or "similarity". Where exposed, it is the only continuous geometry dial a hosted tool gives you | 2 |
| Closed-model reference-image edits (GPT Image 2) | whatever the prompt tells it to preserve. `input_fidelity` is **not** a lever here: the docs say to omit it because "the API doesn't allow changing it because the model processes every image input at high fidelity automatically" [4]. Masking is "entirely prompt-based" and, when several images are passed, a mask applies **only to the first image** [4] | **Yes.** This is the hosted path | 4 |
| Closed-model edits (Gemini 3 image family) | structure via prompt, identity via a typed reference slot. Gemini 3.1 Flash Image takes up to 14 reference images split by **role**: up to 10 object images, up to 4 character images "to maintain character consistency", up to 3 style references. Gemini 3 Pro Image: 6 / 5 / 3 [5] | **Yes**, and it is the only model found with role-typed image inputs | 5 |
| Flux Kontext image-to-image | character and style across scenes. BFL claim it can "preserve unique elements of an image, such as a reference character or object in a picture, across multiple scenes and environments" and keep "characters, identities, styles, and distinctive features consistent across different scenes and viewpoints" [7] | Yes, via API | 7 |
| Multi-image prompting with role labels | UNVERIFIED as a general mechanism. See the two-reference section | partially | 4, 5 |

**The practical fallback for a hosted node tool with no ComfyUI:** you lose every architectural
control (ControlNet, IP-Adapter, per-condition strength) and are left with exactly two levers,
**the reference images themselves** and **the words**. Which means the pipeline has to put its
engineering into the base render (make it unambiguous, make it identical across the set, make it
carry as little material as possible) and into the preserve-clause, rather than into parameters.

## The two-reference problem

Passing a structure reference AND an identity photo at once. Here the documentation splits sharply
by vendor, and that split should decide which model you use for this project.

**Gemini documents the role assignment structurally.** Reference images are not an undifferentiated
bag: they are typed as object references (up to 10), character references (up to 4, explicitly "to
maintain character consistency") and style references (up to 3) [5]. That is a documented,
first-class answer to "how do I say which image is which". The identity photo goes in the character
slot; the base render goes in the object slot. For prompt language, the docs use ordinal reference
throughout: "the first image", "the second image", "from image 1", and an example of the form "Take
the [element from image 1]" and place it with "the [element from image 2]" [5].

**OpenAI documents almost the opposite.** The image-generation guide's worked multi-image example
passes four images and never refers to any of them individually. Its stated approach is to describe
the desired output and let the model absorb the references: "containing all the items in the
reference pictures" [4]. On our questions specifically, the docs give **no guidance on image
ordering or role differentiation**, and the references read as equal material [4]. The one ordering
fact that IS documented is narrow and important: a mask applies only to the first image [4].

So: **indexed role labels ("IMAGE 1 = STRUCTURE REFERENCE, IMAGE 2 = IDENTITY") are documented
practice for Gemini and are folklore for GPT Image 2.** They may well work on GPT Image 2 (the
model reads text and images jointly, and the library's own model dossier notes GPT Image 2 processes
all inputs at high fidelity), but no primary source was found supporting it and it must be labelled
as such until tested. UNVERIFIED.

One more documented weighting fact, from the open side, that explains why this is hard at all:
ControlNet's training deliberately replaced 50% of text prompts with empty strings so the model
would learn to read semantics directly off the conditioning image [1]. Conditioning images are
trained to be believed. When you pass two, you are asking the model to believe two things about the
same pixels.

## Angles and turnarounds

**Nothing solid found** in model vendor documentation stating that a per-angle structure reference
outperforms a single front reference. No benchmark, no vendor recommendation. Do not claim it.

What can be said from the sources:

- On the generative side, the closest documented evidence is FlashTex, which reaches multi-view
  consistency by first producing "a sparse set of visually consistent reference views of the mesh
  using LightControlNet" before optimising the texture [9]. That is a real, published pipeline in
  which **per-view conditioning renders come first and consistency follows from them** rather than
  from prompt language. It is about texturing a mesh, not restyling a portrait, so it is supporting
  evidence, not proof _(inference on the transfer)_.
- On the craft side, a turnaround is conventionally 2 to 5 views, commonly three-quarter, front,
  side and rear, and the documented technique for keeping them consistent is explicit shared guide
  lines: lines for head height, for where the figure's base lands, and to ensure "each drawing is
  standing on the same level", kept at low opacity [8]. The underlying principle stated is to treat
  shapes "as objects with volume" rather than flat forms [8].
- Kontext's own claim covers "different scenes and viewpoints" from one reference [7], which is the
  competing approach: one reference, many angles, model-supplied rotation.

**The judgement _(inference, flagged):** you already own a 3D base, so rendering the pass per angle
is nearly free, and it converts the hardest thing to ask of a language prompt ("same skull, rotated
23 degrees") into a thing the model is documented to be good at (following a structure image). Take
the free win. But present it as a reasoned choice, not as a sourced fact.

## Documented failure modes

**1. The structure reference is restyled instead of obeyed.** ControlNet's Figure 11 documents that
"if the input is ambiguous and the user does not mention object contents in prompts, the results
look like the model tries to interpret input shapes" [1]. The paper's fix is in the prompt: name
what the thing is. The base render is exactly this ambiguous input, so the prompt must state the
subject ("a human head") independently of the reference, never rely on the reference to say it.

**2. Baked lighting and material bleeding into the output.** This is a named, published problem, not
prompt folklore. FlashTex exists because prior text-to-texture methods embed lighting directly into
generated surfaces; the whole point of LightControlNet is to "disentangle lighting from surface
material/reflectance" so the mesh "can be properly relit and rendered in any lighting environment"
[9]. The documented prevention is **structural**: make the lighting an explicit, separately
specified conditioning input rather than something implicit in the reference.

Translated to a hosted tool where you cannot supply a lighting condition, the same logic gives you
two moves _(inference, but a direct read of [9] plus [5])_:
- Strip what you can from the source. A flat-lit render with no rim, no gradient and no shadow has
  less lighting to bleed than a matcap or an AO pass.
- Name the target light and the target material explicitly in the prompt, so the style clause and
  not the reference is the only place a material is specified.

**3. The grey tinting the result.** This specific claim (a clay render's grey desaturating the
output) could not be sourced from any primary document. **UNVERIFIED.** It is highly plausible given
[9] and given how img2img works (the init image is literally the starting latent, and low strength
means less of it is destroyed [2]), but it is stated as mechanism here, not as evidence. Practically,
[9] justifies the mitigation regardless.

**4. Iterative drift.** BFL document this for Kontext directly: "Excessive multi-turn editing
sessions can introduce visual artifacts that degrade image quality", illustrated with a failure case
after six iterations [7]. Consequence for a style set: **always generate each style in one hop from
the same clean base**, never chain style onto style. A set generated as a chain will fan out.

**5. Losing the preserve intent by not stating it.** The documented counter is that both Gemini and
BFL tell you to say the preserve part out loud. Gemini's style-transfer template is verbatim:
"Transform the provided photograph of [subject] into the artistic style of [artist/art style].
Preserve the original composition but render it with [description of stylistic elements]" [5]. BFL's
guidance, as reported in their materials, is to explicitly state what should not change, in the form
"Change to Bauhaus art style while maintaining the original composition and object placement" [7]
(note: this phrasing reached us via search result summary, the docs.bfl.ai and docs.bfl.ml pages both
404'd on direct fetch, so treat the exact wording as second-hand).

## Proposed pipeline (concrete, for a hosted node tool with GPT Image 2 available)

**Asset prep, done once, in Blender or ZBrush.**

1. One neutral head, A-pose equivalent: symmetric, no hair, no expression, eyes closed or neutral.
2. One camera, one focal length, orbited to fixed angles. Front, three-quarter, profile, rear
   three-quarter is the conventional 4-view set [8].
3. Per angle, render **flat, even, shadowless light on a pure white sweep**, untextured, matte,
   mid-grey. No rim light, no gradient ramp, no AO composited on top, no matcap. Every lighting cue
   you leave in is a cue that can bleed [9].
4. Also export the **normal pass** per angle, and archive it. You cannot use it on GPT Image 2, but
   the day this moves to a ControlNet-capable tool it is the highest-value asset you own [1][3].

**Generation, one hop per style per angle. Never chained** [7].

Two images in: `[1]` the base render for that angle, `[2]` the identity photo. Prompt shape, in the
library's existing clause order (non-negotiables, then IS, then IS NOT, then form, then material,
then light, then ground, then finish):

> A single human head, three-quarter view.
> Keep the exact head shape, skull proportions, facial feature placement, scale and camera angle of
> the first image. Preserve that geometry precisely.
> Take the likeness of the second image: its facial features, its proportions of eye, nose and mouth.
> The first image supplies form only. It is not a photograph and its grey surface, its material and
> its lighting must not appear in the result.
> Render it as [style clause: material, then light, then ground, then finish].

Four things to note about that prompt, each tied to a source:

- The subject is named independently of the reference, per ControlNet's ambiguity failure [1].
- The preserve clause is explicit and enumerated, per Gemini's documented style-transfer template
  and BFL's stated-preserve advice [5][7].
- The negation is **targeted, not blanket**: it names exactly the thing documented to bleed
  (the reference's own material and lighting [9]) and nothing else, per the library's own clause
  rule that blanket negation is cargo cult.
- The ordinal references ("first image", "second image") follow Gemini's documented convention [5].
  On GPT Image 2 this is UNVERIFIED and is the first thing to A/B test.

**Do not pass a mask** to disambiguate: with multiple images, a mask applies only to the first image
and GPT Image 2's masking is prompt-based anyway [4]. There is no `input_fidelity` to reach for [4].

**If the tool also offers Gemini 3 / Gemini 3.1 Flash Image, prefer it for this specific job.** It
is the only model in this set that lets you declare the roles structurally: identity photo into the
character-reference slot (documented for character consistency), base render as the object
reference [5]. That removes the single biggest unverified assumption in the GPT Image 2 path.

**Test protocol before generating a set.** Generate one style at all four angles, and one angle at
all styles. The first tells you whether geometry survives rotation, the second whether it survives
restyling. Fix whichever fails before spending on the full grid.

## What I could NOT verify

- **Any head-to-head evidence that one pass type beats another** for restyling. ControlNet trains
  eight conditions and compares them only qualitatively, with no metric [1].
- **Matcap as a conditioning input.** Nothing in any primary model documentation names it.
- **Ambient occlusion as a structure reference.** Not a trained ControlNet condition [1], and
  nothing found treating it as one.
- **Indexed role labels on GPT Image 2.** Documented for Gemini [5], absent from OpenAI's docs,
  which explicitly say references need not be individually referred to and give no ordering or role
  guidance [4]. UNVERIFIED for OpenAI.
- **"The grey tints the output."** Plausible and consistent with [9] and [2], but no primary source
  states it. UNVERIFIED.
- **Per-angle structure references beating a single front reference.** Nothing solid found. Only
  the indirect FlashTex precedent [9] and general turnaround craft [8].
- **Seedream.** No primary documentation fetched for it in this pass. Nothing to say.
- **FLUX.2 multi-reference behaviour.** Search results indicated BFL now recommend FLUX.2 over
  Kontext, with "multi-reference support", but no FLUX.2 primary doc was successfully fetched.
- **Fetches that failed, stated explicitly:** `docs.bfl.ai/guides/prompting_guide_kontext_i2i` and
  `docs.bfl.ml/guides/prompting_guide_kontext_i2i` both returned 404; the Blender manual passes page
  returned 403 on two URL variants; the FlashTex PDF exceeded the fetch size limit (the arXiv
  abstract page was used instead). All BFL prompting-guide phrasings above are therefore second-hand
  via search summary and are marked as such.

## Sources

1. **Adding Conditional Control to Text-to-Image Diffusion Models** (Zhang, Rao, Agrawala) -
   https://arxiv.org/html/2302.05543 - the eight trained conditions; locked-weights plus zero-conv
   architecture; the 50%-empty-prompt training detail; CFG Resolution Weighting; Figure 11 on
   ambiguous inputs being interpreted rather than obeyed; and the confirmed absence of any
   quantitative depth-vs-normal-vs-canny comparison.
2. **Diffusers, Image-to-image guide** -
   https://huggingface.co/docs/diffusers/en/using-diffusers/img2img - the exact definition of
   `strength` (noise steps added, 1.0 means the init image is more or less ignored), its interaction
   with `guidance_scale`, and depth-ControlNet used specifically "to keep the spatial information".
3. **lllyasviel/sd-controlnet-normal model card** -
   https://huggingface.co/lllyasviel/sd-controlnet-normal - what the normal ControlNet conditions on
   and how its training normals were produced (25,452 DIODE pairs, then coarse Midas-derived
   normals). Also confirms no stated comparison against depth.
4. **OpenAI, Image generation guide** -
   https://developers.openai.com/api/docs/guides/image-generation - multi-image edits; no ordering or
   role guidance; references described rather than indexed; mask applies only to the first image;
   masking is prompt-based; `input_fidelity` must be omitted on gpt-image-2 because inputs are always
   processed at high fidelity.
5. **Google, Gemini API image generation docs** -
   https://ai.google.dev/gemini-api/docs/image-generation - the role-typed reference slots (object /
   character / style) and their per-model limits; the verbatim style-transfer template with its
   "Preserve the original composition" clause; ordinal image-reference language.
6. **IP-Adapter: Text Compatible Image Prompt Adapter** -
   https://arxiv.org/abs/2308.06721 - decoupled cross-attention, 22M params, frozen base model, and
   the stated generalisation to "controllable generation using existing controllable tools".
7. **Black Forest Labs, Introducing FLUX.1 Kontext** -
   https://bfl.ai/blog/flux-1-kontext - character and style preservation claims across scenes and
   viewpoints, and the documented multi-turn degradation after six iterations.
8. **CharacterHub, How To Make An Amazing Character Design Sheet** -
   https://characterhub.com/blog/character-resources/character-design-sheet - turnaround convention
   (2 to 5 views; three-quarter, front, side, rear) and the low-opacity shared guide-line technique
   for holding proportions across angles.
9. **FlashTex: Fast Relightable Mesh Texturing with LightControlNet** -
   https://arxiv.org/abs/2402.13251 - lighting supplied as an explicit conditioning image; the
   baked-in-lighting problem stated as the motivation; disentangling lighting from surface material;
   multi-view consistency achieved by generating consistent reference views first.
