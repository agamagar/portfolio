# 3D faces · research dossier
_Researched 2026-08-15. Sources listed at the bottom, numbered; cite by number inline._

## What the medium actually is

The style system sits on top of four genuinely different real-world crafts, and the prompts get sharper when they borrow each craft's own words rather than generic "3D render" language.

**Stylised character sculpting.** Practising character artists build a head in a strict order of **primary, secondary and tertiary forms**: the big masses first, then muscle/fold-scale structure, then pore-and-wrinkle detail. Guy Shoshan's Mariachi breakdown puts the priority plainly: he needed "to get the curves and **silhouette** right from the get-go since it's such a big part of the appeal of this character", and he deliberately kept "cleaner and smoother shapes in certain areas and rougher, more detailed textures" elsewhere [1]. The named tool vocabulary is real and specific: **clay buildup**, **trim dynamic**, **dam standard**, **polish**, **flatten** [1]. These brush names carry a look. Clay buildup leaves stacked, slightly lumpy planes; trim dynamic and polish leave crisp flat planes meeting at a defined edge. That contrast (soft mass, cut plane) is what makes a sculpt look sculpted rather than smoothed.

Lighting in that world is also named. Shoshan's render goal was "getting that continuous thin **rim light** going along the silhouette", plus layered **area lights** and a subtle overhead spot [1]. A stylised head reads as a designed object partly because a thin rim traces its outline.

**Material and shading.** The honest technical term for skin, wax, marble and unpainted plaster behaving warmly is **subsurface scattering**: light enters a translucent boundary, scatters internally and exits somewhere else. In skin, "approximately 94% of the light is scattered beneath the surface, while only about 6% is reflected directly off the surface" [2]. The controls are **scatter radius** (about 5 to 20mm for skin, about 2cm for wax), **scatter colour** (which "is mostly visible in the thin parts of the geometry. (Ears of a character, for instance)"), **forward scattering** versus **back scattering** (back scatter gives "the subtle softness on the lit side of human cheeks or the creamy look of yogurt"), and **isotropic** scattering [2]. **Translucency** is the shallower cousin: light diffusing through a thin material "like a lampshade or leaf" [2].

The satin-versus-matte axis has a measurable ladder from the paint trade: **matte** under 10% reflected light, **eggshell** 10 to 15%, **sheen** 15 to 25%, **satin** 26 to 40%, **semi-gloss** 41 to 69%, **full gloss** 70 to 90% [3]. The physical cause is binder ratio: "more binder creates a smoother surface with regular reflection, while less binder exposes pigment grains, scattering light" [3]. Flat paint also conceals surface imperfections better than gloss [3], which is exactly why a matte-clay variant forgives sloppy form and a satin variant does not.

**Designer vinyl.** Soft vinyl (**sofubi**) figures are **rotocast**: liquid PVC **plastisol** is poured into a copper mould and spun in a hot oven, "only the layer touching the mould solidifies at first, forming a 'skin'", with excess drained before curing [4][5]. That is why the objects are **hollow**, why **wall thickness** matters, and why the surface is soft and slightly yielding [4][5]. The finishing vocabulary: the **parting line** where mould halves meet, the **gate** where PVC was poured, **flash** trimmed away with knives and files, and then paint applied through **spray masks**, described as "custom-fitted metal covers that only expose the part of the toy being painted (e.g., just the eyes or the belly)" [5], with **pad printing** for "tiny, precise details like logos or pupil reflections" [5]. Vinyl is "non-porous; standard paints won't stick", so it takes vinyl-based inks [5]. A production paint pass runs primer, airbrushed base coat, washes and dry brushing for contrast, hand-painted micro detail, then a "matte, gloss, or satin top coat" that "locks pigment... and sets final tone" [6]. **Colourway** is the trade word for the chosen palette of a given release [4].

**Plaster study casts.** I could not verify a fetchable technical source on plaster cast surface optics (the V&A conservation paper and the Academia PDF both refused fetch), so the plaster material clause is the weakest-evidenced part of this dossier. What is safely transferable from [3]: an uncoated plaster surface belongs at the extreme matte end of the sheen ladder, with reflection dominated by diffuse scatter rather than a specular highlight, and its own porosity showing rather than being hidden.

**The painted outlier.** For the grotesque caricature, the oil vocabulary is precise. **Alla prima** is wet-on-wet, worked in one go. **Impasto** is "paint applied to a surface in thick layers, usually heavy enough that brushstroke or palette knife marks stay clearly visible on the finished work", and the raised relief means peaks and valleys "cast their own shadows, creating dimensional luminosity" [7]. Its neighbours are **glazing** (thin transparent layers, the opposite move), and **scumbling** (dry-brushed, semi-opaque, broken texture) [7]. Rembrandt used impasto selectively on lit passages only, van Gogh straight from the tube [7]. The caricature discipline itself is not distortion for its own sake: Court Jones defines it as "a portrait where the proportions are changed to highlight what makes a person different from everyone else" [8]. The method is to memorise the **average** head proportion, find where this face **deviates** from it, and amplify that deviation, which is why a good caricature can read as a stronger likeness than the photograph [8].

## Vocabulary worth putting in prompts

| TERM | what it means | why an image model responds to it | source # |
| --- | --- | --- | --- |
| Primary / secondary / tertiary forms | Big masses, then structural forms, then fine detail | Names a hierarchy, pushing the model toward simplified large shapes instead of even detail everywhere | [1] |
| Silhouette read | The outline alone identifies the character | Steers to clean outer contour and away from noisy hair and accessories | [1] |
| Clay buildup / trim dynamic / polish | Sculpting brushes leaving stacked mass vs cut flat planes | Concrete surface-mark language, more actionable than "sculpted look" | [1] |
| Rim light along the silhouette | A thin continuous edge light tracing the outline | A single, reliably renderable lighting instruction that separates head from flat backdrop | [1] |
| Subsurface scattering / scatter radius / scatter colour | Light entering and re-exiting a translucent surface; depth and hue of that transport | Directly produces warm glow in ears, nose, nostril rims rather than flat plastic | [2] |
| Back scatter | Light returning toward the source, "the subtle softness on the lit side of human cheeks" | Gives the soft-satin pastel toy its creamy, non-plastic quality | [2] |
| Translucency | Thin-material diffusion, "like a lampshade or leaf" | Cheaper, safer word when full SSS overcooks the render into waxiness | [2] |
| Matte / eggshell / satin / semi-gloss / gloss | A measured sheen ladder (under 10% up to 90% reflectance) | Five discrete rungs the model can actually differentiate, unlike "shiny" | [3] |
| Sofubi / rotocast / plastisol | Japanese soft vinyl, spun-mould hollow casting | Anchors to a real object class with a known look, not generic 3D | [4][5] |
| Parting line / seam / gate / flash | Mould-half join, pour point, trimmed excess | Adds the manufactured tell that separates a real toy from a render | [4][5] |
| Wall thickness / hollow | Thin skin formed against the mould | Implies light physics of a hollow shell, and slightly soft edges | [4] |
| Spray mask / paint mask | Metal stencil exposing only one region to paint | Explains why toy paint has crisp hard-edged colour blocks, no soft airbrush blends | [5] |
| Pad printing | Tiny printed detail, "logos or pupil reflections" | The correct term for the perfectly clean catchlight dot on a toy eye | [5] |
| Colourway | The named palette of a release | Frames the pastel palette as a deliberate product decision | [4] |
| Primer / base coat / wash / dry brushing / top coat | The factory paint pipeline | Lets you specify weathering-free clean paint, or a wash in the recesses | [6] |
| Impasto | Thick paint holding visible brush and knife marks that cast their own shadows | Produces physical relief in the painted outlier rather than a smooth digital blur | [7] |
| Alla prima / glazing / scumbling | Wet-on-wet; thin transparent layers; dry broken semi-opaque texture | Three separable paint behaviours the model treats differently | [7] |
| Deviation from the average | Caricature method: find what differs from the norm and push it | Reframes exaggeration as targeted, which protects likeness | [8] |
| Turnaround / model sheet | Front, three-quarter, profile, back at identical scale on shared guide lines | The correct frame for asking a model for a consistent set | [9] |

## What separates a convincing result from a generic one

- The silhouette is decided before anything else, and the outline alone should identify the person; artists treat this as the main source of appeal [1].
- Detail is unevenly distributed on purpose: smooth clean passages in some areas, rougher texture in others, rather than uniform noise everywhere [1].
- Thin geometry glows. Ears, nostril wings and the bridge of the nose are where scatter colour shows [2], so a head with dead-opaque ears reads as plastic even when everything else is right.
- Skin reflects only about 6% of light off the surface [2], so an overly strong, tight specular highlight is the single fastest way to make a stylised head look cheap _(inference from [2])_.
- Sheen is a ladder, not a switch. Satin at 26 to 40% reflectance is a different object class from matte under 10% [3]; asking for "matte" and then describing glossy highlights fights itself.
- Matte finishes hide surface imperfection, gloss reveals it [3]. So the unpainted plaster and matte clay variants tolerate loose form, while the satin toy variant needs the form to be genuinely resolved _(inference from [3])_.
- The manufactured tells sell the object: a faint parting line down the side of the head, a trimmed gate, uniform hollow wall thickness [4][5]. Their absence is what makes most AI "toy" outputs read as generic renders _(inference)_.
- Toy paint has hard edges, because it is sprayed through a metal mask that exposes one region at a time [5]. Soft airbrushed blends between colour regions are a tell of a render, not a toy _(inference from [5])_.
- The eye catchlight on a real production figure is a printed dot, not an optical reflection [5], so it is perfectly clean, small and repeated identically in both eyes _(inference from [5])_.
- A continuous thin rim tracing the silhouette is a deliberate production choice by character artists, not incidental [1], and it is what separates the head from a flat backdrop without adding a background.
- In the painted outlier, thickness must actually cast shadows. Impasto reads because the ridges of paint self-shadow and shift with viewing angle [7]; flat digital brush texture does not.
- Caricature works by amplifying what already deviates from an average head, and the artist must decide "what parts of the face need to stay stable so the subject remains identifiable" [8]. A caricature that pushes everything loses the likeness entirely.
- For a set, drift comes from unstated proportion: turnarounds fix it with shared horizontal guide lines for eyes, chin and shoulders, identical scale, and identical lighting across views [9].

## Model-side levers

- I found no fetchable first-party documentation of a numeric reference-fidelity or denoise-strength control for GPT Image 2. The verified guidance treats fidelity as a matter of wording plus a quality tier, not a slider [11], so the working lever is explicit language about what to keep and what to abandon.
- Structure the prompt as background/scene, then subject, then key details, then constraints, with the intended use stated [11]. fal's version is the same five slots and adds that "the fifth slot is where most mediocre prompts fail silently" [12].
- Label every input image by role: "Image 1: base scene to preserve, Image 2: style reference" and then say how they interact, e.g. "apply Image 2's style to Image 1" [11][12]. Guessing which image is content is a common failure [12].
- For style transfer, state what stays constant (palette, texture, brushwork) versus what changes (subject or scene), and add hard constraints on background, framing and unwanted elements [11].
- For character consistency across a set, build an **anchor** image that locks appearance and proportions, then prompt each new one with "Same character, new scene" plus an explicit instruction not to redesign [11].
- Use surgical preservation language: "change only X", "keep everything else the same", "do not change facial features", "preserve camera angle", "no creative reinterpretation" · and restate these on every iteration, because omitting them causes drift [11].
- Iterate one revision per turn; bundling several changes into one prompt is listed as a named failure mode [12].
- Replace evaluative words with visual facts. "Stunning" and "masterpiece" render as nothing; "overcast daylight, brushed aluminium, soft bounce light" render as something [12]. The same applies to style tags: describe the visual construction, not the label [12].
- Use higher quality settings for close-up portraits and identity-sensitive edits; low quality is for high-volume iteration [11].
- Character consistency is reported to work for simple subjects and to degrade as scene complexity grows. A floating head on a flat backdrop is about the simplest possible case, which is a real advantage of this style system's framing _(inference)_.

## Proposed clause upgrades

1. Replace any generic "3D render" phrasing with the object-class anchor: **"a rotocast soft-vinyl collectible figure, hollow shell, uniform wall thickness"**. It names a real manufacturing class with a known look instead of asking for a render [4][5].
2. Add a manufactured-tell clause to the vinyl variant: **"a faint mould parting line running down the side of the head and behind the ear, cleanly trimmed, no flash"**. This is the specific detail that separates a real production toy from a generic render [4][5].
3. Replace "shiny"/"glossy" with a measured rung: **"satin finish, roughly 30% sheen, one broad soft specular highlight, no mirror reflection"** for the toy, and **"dead matte, under 10% sheen, no specular highlight at all"** for the plaster and clay. The ladder is discrete and the model can separate the rungs [3].
4. Add to every skin-bearing material: **"subsurface scattering with a short scatter radius, warm scatter colour visible only in the thin geometry of the ears, nostril wings and the bridge of the nose"**. Named thin-part glow is where SSS actually shows [2].
5. Add a surface-reflection guard: **"the surface reflects very little light directly; the softness comes from light scattering under the surface, not from a hot specular"**. Skin reflects only about 6% specularly, and an over-hot highlight is the fastest cheapening tell [2].
6. Replace soft airbrush colour language in the toy variant with **"paint applied through metal spray masks: hard-edged colour blocks with crisp boundaries, no soft gradients between colour regions"**. This is literally how toy paint is applied [5].
7. Specify the eye highlight as production, not optics: **"a single small perfectly clean pad-printed catchlight in each eye, identical in both"**. Pad printing is the named process for exactly this [5].
8. Add a sculpting-hierarchy clause: **"resolved primary forms, simplified secondary forms, almost no tertiary detail; no pores, no skin noise"**. This names the artist's own order of operations and directly suppresses AI-typical uniform micro-detail [1].
9. Add a lighting clause borrowed from character lookdev: **"large soft key from front-left, plus one thin continuous rim light tracing the entire silhouette"**. Both halves are what stylised character artists actually build [1].
10. In the clay variant, name the brushwork rather than the material alone: **"visible clay-buildup mass and trim-dynamic flat planes meeting at defined edges, matte and slightly porous"**. Brush names carry a specific surface signature [1].
11. Rewrite the caricature clause around deviation, not distortion: **"identify the two or three proportions where this face most deviates from an average head and amplify only those; keep every other proportion stable so the likeness holds"**. This is the working caricature method and it protects recognisability [8].
12. Make the paint physical in the outlier: **"alla prima, heavy impasto laid with a palette knife, ridges thick enough to cast their own shadows across the form; scumbled broken colour in the half-tones; no glazing, no smooth blending"**. Impasto reads only when the relief self-shadows [7].
13. Add a preservation block to the tail of every prompt, restated each turn: **"Preserve identity, head proportion relationships, hairline, and the framing. Change only the material and finish. No redesign of the face, no added accessories, no text, no watermark, no background objects."** Omitted preservation instructions are the named cause of drift [11][12].
14. For generating the set, add an anchor clause: **"Same character as the reference, new material. Do not redesign the figure."** plus fixed shared geometry, **"eye line, chin line and shoulder line at identical heights across every image, identical camera distance and lighting"** [11][9].

## Sources

1. Mariachi: Stylized Character Breakdown (80.lv) · https://80.lv/articles/mariachi-stylized-character-breakdown · sculpting brush names, silhouette priority, rim-light setup, SSS use on a stylised character.
2. Subsurface scattering explained (Chaos) · https://blog.chaos.com/subsurface-scattering-explained · scatter radius and colour numbers, forward/back/isotropic scattering, the 94/6 skin split, thin-part glow.
3. Paint sheen (Wikipedia) · https://en.wikipedia.org/wiki/Paint_sheen · the measured matte-to-gloss reflectance ladder, binder/PVC cause, and that matte conceals imperfections.
4. Vinyl Toy Production: Everything You Need To Know (Sukeauto) · https://sukeauto.com/vinyl-toy-production-everything-you-need-to-know/ · rotocast, parting line, flash, wall thickness, hollow skin formation, paint masks, colourway.
5. How Soft Vinyl Toys are Made (MIHOX) · https://newmiho.com/soft-vinyl-toy-production-process/ · sofubi, copper moulds, gate trimming, spray masks defined, pad printing for pupil reflections, non-porous vinyl.
6. How Are Action Figures Painted (EDNTOY) · https://edntoy.com/blog/how-are-action-figures-painted-a-step-by-step-guide · primer, airbrushed base, washes and dry brushing, matte/gloss/satin top coat.
7. What Is the Impasto Technique? (Russell Collection) · https://russell-collection.com/what-is-the-impasto-technique/ · impasto definition, self-shadowing relief, and its relation to glazing, scumbling and alla prima.
8. Caricature 101 – How to Exaggerate, Court Jones (Proko) · https://www.proko.com/course-lesson/caricature-101-how-to-exaggerate · caricature as amplified deviation from an average, and why it can beat a photo for likeness.
9. Character Turnaround Guide (Spines) · https://spines.com/character-turnaround/ · shared horizontal guide lines, identical scale and style across views, named causes of off-model drift.
10. _(intentionally unused: a candidate GPT Image 2 API page surfaced in search but was not fetched, so nothing is cited to it.)_
11. GPT Image Generation Models Prompting Guide (OpenAI Cookbook) · https://developers.openai.com/cookbook/examples/multimodal/image-gen-models-prompting-guide · prompt structure, indexed image roles, style transfer, anchor images for consistency, preservation language, quality tiers.
12. GPT Image 2 Prompting Guide (fal) · https://fal.ai/learn/tools/prompting-gpt-image-2 · five-slot template, the constraints slot as the common silent failure, anti-vagueness rules, one-revision-per-turn.

Gaps I could not close with a fetchable source: plaster-cast surface optics and historical coatings (the V&A conservation paper and the Academia PDF both refused fetch), and any first-party documentation of a numeric reference-fidelity control for GPT Image 2 beyond what [11] states.
