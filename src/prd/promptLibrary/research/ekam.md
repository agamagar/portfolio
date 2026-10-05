# Ekam: research dossier
_Brand side sourced 2026-08-21 from Agam's own EKAM documents. Medium side (soft-focus /
defocus photography) researched 2026-08-21. Sources numbered, cited inline by number._

## What the medium actually is
The reference look (soft, large, coloured orbs dissolving over a warm-white/pale ground, no
dark background, no crisp specular points) sits inside real shallow-depth-of-field defocus
photography, but is a specific slice of it, and the common word for it, "bokeh", carries a
strong DARK-BACKGROUND connotation this brand needs to route around.

**Defocus vs bokeh are two different words for two different things.** Defocus is the general
condition of being outside the focal plane; bokeh is specifically the QUALITY of that defocus,
"the character of the blur", not the blur condition itself [5]. Bokeh is most commonly
illustrated with point light sources against dark surroundings, contrast being what makes the
circular shapes visible at all [4], that is exactly the mental model (city lights at night,
fairy lights on black) this brand's pale-ground reference is NOT. No established alternate term
for "defocused coloured shapes on a light ground" was found in any source; this is a real
vocabulary gap, not a search failure. The working resolution: avoid the bare word "bokeh" and
compose from the sourced sub-vocabulary instead, "heavy defocus", "soft circular defocus
discs/orbs", "warm pale ground, no dark background, no specular point highlights".

**Gaussian blur is explicitly NOT the same look as real lens defocus**, gaussian blur is a
uniform mathematical post-process convolution; optical defocus has "a very different look" [5].
The prompt should never ask for "gaussian blur" when the goal is optically-plausible defocus
character.

**Bokeh shape is a real, nameable variable**, governed by aperture blade count and geometry:
more/rounded blades keep the disc close to a true circle (circular bokeh); fewer straight
blades render it as a visible polygon (polygonal bokeh, e.g. heptagonal at 7 blades) [1][2].
Near frame edges, discs can clip into lentil/oval shapes from lens-barrel vignetting (cat's-eye
bokeh), a different mechanism from blade-count faceting [1][2]. The brand's orbs are circular
and centred, so "circular bokeh, no polygonal faceting, no cat's-eye clipping at the edges" is
the correct, sourced clause.

**Naming aperture and focal length as camera-spec language is a real, partially-verified lever
on GPT-4o** (the image-gen architectural predecessor to GPT Image 2, not the same model, no
source tests GPT Image 2 by name). An empirical benchmark [6] found GPT-4o "achieves decent
results in controlling bokeh blur parameters and color temperature... [but] falls short in
adjusting focal length and shutter speed, occasionally leading to inconsistent visual
semantics." So: naming an aperture value (e.g. f/1.2) is a reasonable, evidence-adjacent bet;
naming a specific focal length in mm is the weaker lever and should not be relied on to do real
optical work. No source runs a controlled A/B of "numeric aperture spec" vs "plain-English blur
description", this remains INFERENCE, not a direct result.

**Gradient banding is a real, well-documented artifact** in large smooth low-contrast
gradients under 8-bit-per-channel colour, most visible in low-saturation regions where the eye
is sensitive to a 1-step jump [3]. Correct term: colour/gradient banding. Standard fix:
error-diffusion dithering, or a small amount of added noise (roughly 0.5-1%), both of which are
raster POST-PROCESS techniques. Whether naming "no banding" in a generation prompt actually
suppresses it, versus banding being inherent to the model's own output encoding, is UNTESTED,
no source verifies prompt-time language prevents it.

## Vocabulary worth putting in prompts
| Term | Meaning | Why it helps a generation model | Source |
|---|---|---|---|
| Heavy defocus | The general condition of being outside the focal plane | Names the phenomenon without bokeh's dark-ground baggage | 5 |
| Circular bokeh | Round, non-faceted defocus discs from a rounded/many-bladed aperture | Matches the reference's round orb shapes directly | 1, 2 |
| No polygonal faceting | Negative clause against visible N-gon discs from a straight-bladed aperture | Suppresses a real, named failure mode | 1, 2 |
| No cat's-eye clipping | Negative clause against lentil/oval edge-of-frame discs from lens-barrel vignetting | Suppresses a real, named failure mode at the frame edges | 1, 2 |
| No specular point highlights | Negative clause against bright discrete light-point bokeh | Likely the single most useful clause for steering away from stock dark-bokeh imagery | 2 |
| Warm pale ground, no dark background | States the field directly rather than relying on bokeh's default dark-ground association | Directly counters bokeh's typical training-data context | 4 |
| Aperture (f-stop), e.g. f/1.2 | Numeric lens-opening value; low number = shallow depth of field | Evidence-adjacent control axis GPT-4o (image-gen predecessor) responds to "decently" for blur amount | 6 |
| Focal length in mm | Lens length, affects compression/DOF | Weaker lever per the same benchmark; include but do not over-rely on it | 6 |
| Gradient/colour banding | Visible discrete steps in an 8-bit smooth gradient | Names the failure mode explicitly; whether naming it in-prompt suppresses it is UNTESTED | 3 |
| NOT gaussian blur | Uniform post-process blur, a different look from real lens defocus | Prevents the model reaching for the wrong (flatter, more uniform) blur character | 5 |

## What separates a convincing result from a generic one
A generic result reads as "blurry photo" or defaults to dark-ground stock bokeh (specular
points on black). A convincing one names the ground colour explicitly, states the ABSENCE of
specular highlights and dark background, and asks for circular (not polygonal, not cat's-eye)
disc shapes, because that is the specific combination the training data's dominant "bokeh"
association will not hand over by default.

## Model-side levers (inherited, not re-researched this pass)
From `research/models.md` and `research/icons.md`:
- GPT Image 2 accepts an aspect ratio of at most 3:1, so the about 5:1 band cannot be generated
  at its finished aspect. Generate 2048x1152 and crop.
- `input_fidelity` does not apply to gpt-image-2; reference strength is managed in language.
- Never ask for a transparent background: RGB out, no alpha, and the word makes the model paint
  a checkerboard. Here the ground is a real brand colour anyway, so it is generated.
- The 1000-character compact ceiling is a Figma client limit, not a model limit.

## What IS sourced (brand side)
From `about /My Drive/Active - Portfolio/Claude/EKAM Art Direction/`:
- `design-system.md`: the five-slot grammar (band, kicker, headline, body, signature), the three
  directions and their tokens, the 2026-08-21 decision that **B Soft Focus is the final direction**
  and A and C are retired, the detail layer (chips, myth/fact card, info grid, CTA bar), the three
  formats (1080x1350, 1200x630, 336x280), and the Buzz build mechanics.
- `art-direction.md`: the moodboard reading, the six principles ("ornament, not diagram",
  hand-made over vector-perfect, type quiet and small, imagery carries the emotion), and the
  **discretion judgment**: the strongest reference carries explicit vulva motifs and nude figures,
  the primary patient is under family and social scrutiny, so public-channel motifs read as
  botanical and celestial instead. That judgment is what the group's EXTRA_RULE encodes.
- `brand-strategy.md`: voice, register and the five patient personas. Relevant to a future EKAM
  VOICE framework, not to this image group.

## Sources
1. Fstoppers, "Understanding Bokeh: Quality Over Blur", aperture blade count, circular vs
   polygonal bokeh. https://fstoppers.com/education/what-bokeh-and-what-actually-makes-it-good-or-bad-903056
2. Search-aggregated bokeh-shape sources (cat's-eye bokeh / optical vignetting, blade-count →
   polygon relationship), consensus across B&H Explora and adjacent indexed pages.
   https://www.bhphotovideo.com/explora/photography/tips-and-solutions/understanding-bokeh
   (direct fetch returned 403; content drawn from search-result snippets citing this and
   adjacent pages)
3. Search-aggregated banding/dithering sources, Blur Busters Forums, SVGator, ktcplay, on
   colour banding cause (8-bit tonal steps) and error-diffusion dithering as the standard fix.
   https://forums.blurbusters.com/viewtopic.php?t=927 ;
   https://www.svgator.com/blog/color-banding-gradient-animation/ ;
   https://us.ktcplay.com/blogs/support-tips/color-banding-bit-depth-explained
4. Search-aggregated circle-of-confusion / specular-highlight-on-dark-background sources,
   Camera Club India, Learning with Experts, confirming bokeh's typical dark-ground/point-light
   association. https://cameraclub.in/blogs/learn/understanding-bokeh ;
   https://www.learningwithexperts.com/blogs/articles/circles-of-confusion
5. LearnVFX, "Understanding Defocus and Bokeh" (fetched directly), defines defocus vs bokeh vs
   gaussian blur as three distinct concepts. https://www.learnvfx.com/p/understanding-defocus-and-bokeh
6. Chen et al., "An Empirical Study of GPT-4o Image Generation Capabilities," arXiv:2504.05979,
   benchmark: GPT-4o controls bokeh blur amount and colour temperature "decently", weaker on
   focal length and shutter speed. Tests GPT-4o, not GPT Image 2 by name.
   https://arxiv.org/abs/2504.05979

**Gaps, stated honestly:** no source tests GPT Image 2 specifically (only GPT-4o, its
architectural predecessor) on camera-spec-language control. No source runs a controlled A/B of
numeric aperture/focal-length spec versus plain-English blur description, the aperture-naming
recommendation above is inference from adjacent evidence, not a direct result. The three
candidate coinages considered before this research ("defocused color field", "circle of
confusion wash", "gaussian defocus gradient") are NOT attested as real industry terms in any
source found and should not be used as if they were. Whether prompt-time language actually
suppresses banding in generation output, versus banding being inherent to the model's own
output encoding, is untested by any source found here.

## Experiment: icon badges & constellation figure (2026-08-21)

A reference PCOS teleconsult brochure (ekam.her, six-panel leaflet) was supplied as a source of
new object/illustration ideas, explicitly OUTSIDE the Soft Focus system: it uses flat line-icon
badges (hormones, metabolism, insulin resistance, emotional wellbeing, muscle & movement,
nutrition) and a front-cover figure of a woman with glowing constellation-style points and
botanical sprigs overlaid on her silhouette. Two quick searches grounded the vocabulary used in
`ekamExperimentViews.js`, rather than writing these clauses from memory:

- **Icon-badge construction.** Stock/vector wellness-icon listings converge on "pixel-perfect"
  outline icons built on a fixed grid with a fixed editable stroke width (2px cited at 48x48),
  mounted in a circular badge, no shading or gradient [7]. This is the generation-target version
  of the same "even stroke weight on a fixed grid" discipline EKAM's own hand-authored detail
  chips already use at 1.6px/24px (see ekam.js systemSpec, "What the model does NOT make"): the
  experiment is whether GPT Image 2 can hold that discipline as a generation target, which the
  system page explicitly says is a drawing job, not a generation job.
- **Constellation overlay on a silhouette.** "Human silhouette with a constellation/star-map
  overlay" is an established stock-illustration and branding trope (glowing points joined by thin
  lines, traced across a solid-colour figure) [8], which is the real name for what the brochure's
  front-cover figure is doing under its botanical spray. Framed this way rather than as a nervous-
  system or vein diagram, both to use an attested term and to keep the figure clear of
  EXTRA_RULE's "nothing anatomical, clinical or explicit" (research/ekam.md above; art-direction.md).

**Gaps, stated honestly:** both searches were general web/stock-photo-index results, not a
craft-practitioner or standards source the way the defocus research above is; treat the icon-grid
numbers (2px/48px) as one convention seen, not a verified universal spec. No source was found for
"constellation overlay" as a formal term of art (it reads consistently across multiple stock
listings, not from one canonical origin). Whether GPT Image 2 actually holds an even stroke
weight or a closed silhouette edge under generation is UNTESTED; this section grounds the
prompt's vocabulary, not the model's output.

7. iStock health/wellness icon and doctor-badge listings (aggregate search), converging on
   pixel-perfect outline icon sets with a fixed editable stroke width and circle-badge mounting.
   https://www.istockphoto.com/illustrations/health-and-wellness-icons ;
   https://www.istockphoto.com/illustrations/doctor-badge
8. Dreamstime, "Silhouette of a Human Figure with an Overlay of Constellations and Stars," and
   related "Constellation Overlay" listings, as evidence the pairing is an established
   stock-illustration trope. https://www.dreamstime.com/illustration/constellation-overlay.html ;
   https://www.dreamstime.com/silhouette-human-figure-overlay-constellations-stars-against-silhouette-human-figure-overlay-image400394774

## Experiment 02: chalk & organic block print (2026-08-21)

A second reference was supplied: an indigo-on-cream block-print grid of crouching and
standing nude figures, starbursts, ferns and a seated-figure-with-flower motif. This is
the SAME reference art-direction.md already reviewed and flagged: "the strongest
reference (the block print) contains explicit vulva motifs and nude figures," which the
brand's own discretion judgment resolved by keeping the block print's language (symmetry,
indigo-on-oat, folk ornament, hand-carved warmth) while dropping the nude/genital figures
for public channels. That resolution is carried forward unchanged into
`ekamExperiment2Views.js`: only the non-figurative ornaments (starburst, fern) are used,
plus the seated-figure silhouette re-read as an abstract vase-and-bud shape, never the
figure itself.

Two things needed grounding before writing the chalk/mottled-fill clause:

- **Why a block print reads as mottled rather than flat.** Printmaking sources describe
  the physical cause directly: a carved relief surface is never perfectly even, so ink
  sits higher on some raised areas than others and transfers unevenly, producing a
  mottled, speckled fill rather than a flat one [9][10]. This is why the prompt states the
  mottling as a consequence of "a hand-carved block leaves when ink sits unevenly," a real
  mechanism, rather than asking for "textured" as a bare adjective.
- **"Chalk texture" as independent digital-illustration vocabulary.** Separately from
  print, digital chalk-texture writing converges on the same small set of words for a
  soft particulate surface: grainy, gritty, dusty, mottled [11]. Both vocabularies point
  at the same visual quality from different physical causes (ink-on-relief vs.
  pigment-on-surface), which is why the clause names both a chalky grain AND the
  block-print mechanism in one sentence rather than picking one metaphor.

**Gaps, stated honestly:** both searches are general craft/stock-illustration sources, not
a printmaking-practitioner standard or a tested prompt study; there is no source here
confirming GPT Image 2 specifically holds an uneven, grain-within-a-flat-fill look under
generation rather than defaulting to either a smooth flat fill or a literal paper-grain
overlay texture. Whether "chalk" as a bare word in a prompt pulls toward chalkboard/dust
imagery (the dominant stock-photo sense) rather than the mottled-fill sense intended here
is UNTESTED; the clause avoids the bare word for this reason and describes the mottling
directly instead.

9. Number Analytics, "The Art of Texture in Printmaking" and "Mastering Texture in
   Printmaking," on uneven ink transfer from a raised relief surface producing a mottled,
   speckled printed texture. https://www.numberanalytics.com/blog/the-art-of-texture-in-printmaking
10. Mulberry Paper & More, "Block Printing," on how block material and surface evenness
    change the printed texture. https://www.mulberrypaperandmore.com/c-679-block-printing.aspx
11. Claire Makes Things, "The Magic of Chalk Textures in Digital Illustration," on chalk
    texture vocabulary (grainy, gritty, dusty, mottled) in digital illustration practice.
    https://clairemakesthings.es/the-magic-of-chalk-textures-in-digital-illustration/

## Experiment 02 objects: the lived-detail ornaments (2026-08-21)

Eight ornaments were added to the Chalk Print dial from a list of what PCOS actually looks
like day to day: a calendar that skips or doubles, the chin hair plucked at the mirror,
hair in the comb, jaw-line acne at 26, tired by 4pm, the scale that will not move and the
aunt's "bas thoda weight kam karo", the scan report with the word "cysts", and "shaadi ke
baad theek ho jaayega".

**The translation rule applied.** Each one is written as an OBJECT, never as the body it
happens to. Three of the eight (chin hair, jaw acne, the scan report) sit directly on a
woman's body or on a clinical document, which is exactly what EXTRA_RULE bars and what
art-direction.md's discretion judgment already resolved once for this same reference
board. The resolution carried forward: the object beside her carries the experience. Chin
hair becomes a hand mirror with one stray line across it. Jaw acne becomes a crescent moon
with three dots along its inner curve, which also keeps it inside the celestial motif
family the brand already approved for public channels. The scan report becomes a cut-open
pomegranate style seed pod, and the clause says in so many words that it is a fruit motif
and not an ovary, not a cross section and not a diagram, because that is the single most
likely way this prompt fails the brand rather than the craft.

**Block-print grounding.** "Buti" is the attested term for precisely this kind of small
single isolated motif, and "buta" for a larger one; "jaal" is a net or trellis grid and
"bel" a running creeper border [11][12]. That matters twice: it confirms an isolated
object-motif is a real unit of the medium rather than something invented for this page,
and it grounds the gapped-calendar ornament, which is a jaal with cells removed. The
marigold is the one item with its own named motif in the sources, "genda buti" [11], which
is why the garland is the most confidently traditional of the eight.

**Gaps, stated honestly.** The mirror, comb, balance and low sun are NOT attested
traditional block-print motifs in any source found. They are new objects drawn in the
block-print language, which is a legitimate move and is marked as such in the code rather
than presented as heritage. Bagru's motif families are listed as flowers and birds,
tendrils, trellis, geometric and figurative [12], and a domestic object set is not among
them. Whether GPT Image 2 can hold a chalky grain inside a flat fill at all remains
untested, same as the rest of Experiment 02.

11. Sanganeri and Bagru block-print motif vocabulary: buta, buti, jaal, bel, and the named
    floral butis including genda (marigold). Aggregate of Incredible India's Sanganeri
    Hand Block Printing page and Farida Gupta's craft history.
    https://www.incredibleindia.gov.in/en/rajasthan/sanganeri-hand-block-printing ;
    https://faridagupta.com/blogs/farida-gupta-blogs/the-history-craftsmanship-of-indian-block-prints
12. Bagru print, motif families listed as flowers and birds, tendrils, trellis or jaal,
    geometric, and human or animal figurative. https://en.wikipedia.org/wiki/Bagru_print

## Real: the photographic register (2026-08-21)

Two new styles, `real-portrait` and `real-still-life`, built separately rather than as one
style with a subject dial, because a portrait of a woman and a still life of an object
share almost nothing below the grade. Until now every EKAM style was a MADE image (a
defocused abstract, a carved print, a flat icon, a flat silhouette), so there was no way
to make an asset that says "this is a real woman in Dehradun" rather than "this is an
ornament about her".

**The discretion problem, and how it is handled.** Soft Focus exists because softness IS
the discretion promise made visual. A recognisable photograph of a woman's face runs
straight at that promise, for a patient brand-strategy.md describes as under family and
social scrutiny. The resolution taken is NOT a ban: identifiability is made a DIAL.
`FRAMINGS` runs hands only, from behind, turned away, quiet profile, direct, ordered least
identifiable first so the dial's DEFAULT position is the most discreet one and a visible
face is a deliberate act rather than what you get by not choosing. This is the same shape
of resolution art-direction.md took for the block print: keep the thing, control the
exposure.

**Portrait vocabulary, sourced.** Available light is the term for any source not supplied
by the photographer [13]. Window light is specifically prized in portraiture because it is
soft and comes from one fixed direction, which is easier to control than direct sun [14].
A catchlight, the small reflected highlight in the eye, is the named detail that makes a
portrait read as alive [15]. Environmental portraiture is the term for photographing a
person in a setting that gives context about their life [16], which is exactly what the
moment dial is doing. All four light entries are written as available light: no strobes,
no modifiers, nothing the brand could not actually shoot in Dehradun.

**Still life vocabulary, sourced.** Diffused window light through a scrim is the workhorse
[17]. Side and raking light at roughly forty five degrees is what reveals surface texture
and three-dimensionality [17][18]. Negative fill, deepening the shadow side by BLOCKING
light rather than adding a reflector, is the named technique and is what the raking entry
asks for [17]. These are real techniques with real names, which is the point: "moody
lighting" is an adjective and "raking side light at forty five degrees with negative fill"
is a mechanism.

**Camera language over quality boosters.** Both styles name lens, aperture feel and light
rather than reaching for "8K, ultra detailed", per OpenAI's own guidance already recorded
in research/models.md that camera and composition language steers realism more reliably
than generic boosters.

**Two deliberate omissions in the still-life object list.** The chalk ornaments "starburst"
and "crescent" have no honest photographic counterpart and are simply absent; inventing a
prop for them would be the tail wagging the dog. "gapped-grid" keeps its key so the subject
lines up across styles, but becomes a hand-ruled paper grid rather than a calendar, because
a real calendar carries numbers and the library's global rule bars text in the image. That
constraint is stated twice inside the clause itself, since it is the most likely way this
particular prompt fails.

**Gaps, stated honestly.** The lighting and portraiture sources are photography-education
sites rather than a standards body or a named practitioner's own writing; they agree with
each other and with common professional usage, but this is convergent tutorial material,
not primary craft literature. Nothing here is tested against GPT Image 2: whether naming an
available-light setup produces available light, and in particular whether "no retouching,
real skin texture" survives a model heavily trained on retouched stock, is UNTESTED. The
"no AI-smooth skin" style of clause is a reasonable bet on OpenAI's documented handling of
direct negative constraints, not a verified result.

13. Wikipedia, "Available light": any source not explicitly supplied by the photographer.
    https://en.wikipedia.org/wiki/Available_light
14. SLR Lounge, "Simple Window Light Portraits": window light as a fixed-direction, easily
    controlled portrait source. https://www.slrlounge.com/simple-window-light-portraits-shot/
15. The Lens Lounge, "How to use directional lighting for portrait photography": direction
    of light, and the catchlight as the detail that brings a portrait alive.
    https://thelenslounge.com/direction-of-light/
16. Icon Photography School and Markus Hagner, on environmental portraiture as photographing
    a person in a setting that carries context about their life.
    https://photographyicon.com/environmental-portrait-photography/ ;
    https://markus-hagner-photography.com/what-is-environmental-portraiture-and-how-to-tell-a-story-with-setting/
17. Photofocus and Photography Icon, on still-life lighting: diffused window light through a
    scrim, side and raking light for texture, and reflector versus negative fill.
    https://photofocus.com/photography/a-look-at-lighting-for-still-life-photography/ ;
    https://photographyicon.com/still-life-photography/
18. Digital Photography School, "5 Still Life Lighting Tips": lighting at roughly forty five
    degrees for texture, three-dimensionality and detail.
    https://digital-photography-school.com/5-still-life-lighting-tips-for-beginners/
