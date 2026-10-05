# Dreamy glow vector: research dossier
_Researched 2026-09-04. Sources numbered at the bottom; cite by number inline._

## What the medium actually is
- It is NOT vector. Apofiss (Rihards Donskis, Latvian, self-taught) paints in Photoshop CS3 and Paint Tool SAI on a Wacom Intuos, "mostly default brushes only" [1][7]. SAI is used "for sketching and general painting" and "colour blending"; Photoshop "for overall colour correction and adjusting levels ... atmospheric changes" [1]. The "vector-like" look in the reference is soft-brush raster painting with no outlines; the flat, clean silhouettes come from soft-edged airbrush fills, not paths.
- Self-described style: "something between realism and pixar-ish illustrations", settled around 2008 [7]. Colour habit stated in his own words: "I try to use less base colours than I probably should ... I tend to go with two main colours to begin with" [1]. That is the source for the single-hue-family rule (lemon yellow-orange plus one cool accent).
- Recurring props are deliberate compositional filler: "I find bubbles as a perfect complimentary object to make the whole thing look complete" [1]. The bokeh discs and sparkles in the lemon pieces play the same role. The clouds tutorial confirms the whole kit runs on one tool: "any digital software ... which has a soft brush" [6].
- Cat: "there is something mystical about cats ... certain secrets gives an extra interest for the image" [1]. A secondary fan page (uncited, treat as inference) describes the creatures as having "innocent, somewhat vague looks due to the lack of expression in the mouths and eyes", eyes "glassy and dreamlike", and the rendering as "gradients, blurring, and soft, airbrush-like brush strokes", avoiding "sharp or rough looking textures" [11].
- How the glow is built (practitioner sources, not Apofiss's own words; his tutorials are image-only [2][3][4]): a lighter copy of the object on a layer set to Add / Linear Dodge, Gaussian-blurred, over a background that is "a dark shade of whatever color you are using"; "1 or 2 Add layers for soft glow", maximum five [16]. Clip Studio's lighting guide: Add (Glow) is chosen over Screen because "with Screen, we don't get the saturation that we get with Add Glow/Linear Dodge", painted with a soft airbrush for "color gradation", starting from "a darker mid-tone color, so we don't go too bright too soon" [17]. Outer Glow layer style: "Linear Dodge (Add) and Screen are good modes", Technique "Softer" is "more organic and natural-looking", keep Spread near 0 for a soft falloff [14].
- Nothing solid found on: an Apofiss text tutorial for the glow itself, a Behance page, a YouTube process video with a readable description, or any Apofiss statement about Illustrator or Procreate (no evidence he uses either).

## Vocabulary worth putting in prompts (table: TERM | meaning | why a model responds | source #)
| TERM | meaning | why a model responds | source # |
|---|---|---|---|
| soft airbrush, soft round brush, 0% hardness | brush with fully feathered edge; used for "sky, clouds, smoke, fog" and blending, muddies if used for blocking | names the actual tool; "airbrushed" pulls matte, grainless, edge-free surfaces | [6][15][17] |
| Add / Linear Dodge (Add) glow | lightening blend that "brightens the base color ... by increasing the brightness", stronger than Screen, keeps saturation | "additive glow" reads as light that saturates rather than washes to white | [12][13][17] |
| Screen | "always a brighter color ... black becomes transparent" | gentler halo; use when the glow should stay pale | [12][13] |
| Overlay / Soft Light | contrast-shifting modes; Soft Light is "a gentler version of Overlay" | for the darker peel-pore spots and rim tint without hard edges | [12][13] |
| Outer Glow, Softer technique, Spread 0 | layer-style halo with organic falloff | "faint outer glow" is a phrase models map to rim halos | [14][25] |
| dark ground, dark shade of the glow hue | glow background "has a dark shade of whatever color you are using"; UX guidance prefers dark grey (#121212) to pure black | tells the model the ground is tinted brown-black, not neutral | [16][25] |
| bokeh, circle of confusion, out-of-focus discs | "each point of light becomes an image of the aperture, generally a more or less round disc"; disc size grows with distance from the focus plane and aperture; may be "uniformly illuminated, brighter near the edge, or brighter near the center" | photographic term gives round soft discs of varied size instead of random blobs | [18][19] |
| shallow depth of field | background "very blurred, soft and lacking detail" needs a large entrance pupil | defocuses the back lemons into discs | [18] |
| four-point star sparkle, kirakira | manga convention: four-pointed stars mean the subject is "captivated by something ... something wonderful"; Japanese term kirakira | "four-point star" is the precise shape word; "kirakira" cues the anime register | [21] |
| starburst, diffraction spike | optical cause: "a diaphragm with n blades yields n spikes if n is even" | photographic synonym if the model over-cartoons the sparkle | [20] |
| kawaii, chubby, rounded | "shapes are simplified and rounded, giving them a safe, approachable feel"; "two dot-like eyes and a tiny mouth"; over-detail "comes off as creepy" | names the proportion system: round, minimal features | [22][23] |
| hue-shifted gradient, no grey midpoint | "the most common gradient mistake is interpolating through gray"; fix: "route through a connecting hue" | forces yellow to orange to deep amber rather than yellow to brown-grey | [24] |
| desaturate for dark mode | "highly saturated colours can appear overly intense ... against a dark background" | keeps the cool sparkle accent from vibrating | [25] |
| Add Glow, Linear Dodge (Clip Studio naming) | same as Add; airbrushed "pastel colors around the light source" | vendor-native wording for the glow pass | [17] |
| gradient mesh, freeform gradient | Illustrator constructs for smooth vector shading | UNVERIFIED: Adobe pages timed out three times; only search snippets seen. Do not cite as fetched | none |

## What separates a convincing result from a generic one
1. Two colours, then stop. Apofiss starts with "two main colours" [1]. The lemon pieces are one warm family (yellow to orange to amber) plus one cool accent (blue sparkles). Generic renders add green leaves, pink highlights, rainbow bokeh.
2. The glow is a light source, not a filter. The Clip Studio guide treats the glow layer as "a light source" that starts from a darker mid-tone and builds [17]; the Procreate guide caps it at five layers and demands a dark ground of the same hue [16]. Convincing: the fruit is brightest at its core, the halo dies quickly, the cat's near edge and the background discs pick up the same amber. Generic: uniform neon outline.
3. Bokeh discs obey optics. Discs are round, soft-edged, larger the further they sit from the focus plane, and dimmer than the subject [18][19]. Spacing: nothing solid found on spacing rules in any fetched source; inference from the optics is that discs vary in size and never overlap the sharp subject.
4. Sparkle placement. Only the manga meaning is sourced: the star means "captivated" and sits on or near the thing admired [21]. Placement rules beyond that are inference: a few, at two or three sizes, on the brightest edge of the fruit, never on the ground.
5. No outlines, no texture. "Avoids sharp or rough looking textures" [11, secondary]; soft brushes blend edges together [15]. Peel pores are darker soft spots (Soft Light register), not stipple.
6. Proportions are kawaii: round, chubby, minimal face, and over-detail reads as creepy [22][23]. The cat has eyes and nothing else.

## Model-side levers
- OpenAI: the GPT-4o native image generation system card states "we added a refusal which triggers when a user attempts to generate an image in the style of a living artist" [26]. Apofiss is a living artist: never name him in the prompt; describe the look instead.
- Google Imagen prompt guide: structure prompts as subject, context, style; lists "bokeh", "soft focus", "portrait mode" as camera-setting modifiers and "natural, dramatic, warm, or cold lighting"; says "referencing specific artists or art movements can be helpful" [27]. So Imagen tolerates movement names; still avoid the living artist for consistency across models.
- Midjourney: docs pages (Prompt Basics, Style Reference) returned 403 on every fetch. UNVERIFIED from search snippets: --sref transfers "colors, medium, textures, or lighting", --sw 0 to 1000 default 100. Do not treat as fetched.
- Craft terms that models respond to are the vendor terms above: "soft airbrush", "additive glow", "bokeh discs", "shallow depth of field", "four-point star sparkles", "kawaii proportions", "dark grey-brown ground" [12][14][16][17][18][21][22].
- "Vector illustration" as a prompt word is a risk: the Imagen-adjacent guides describe vector as "flat colors, no gradients or shadows" (search snippet, UNVERIFIED). Prefer "smooth airbrushed digital painting, no outlines" and let the clean silhouettes come from "soft-edged shapes".

## Proposed clause upgrades (style constant, character constant, compact twins)
(a) STYLE constant, objects:
"Soft airbrushed digital painting, no outlines, no visible brush texture: chubby rounded silhouettes with fully feathered edges [6][15], each filled with a hue-shifted gradient that stays in one warm family (yellow to orange to deep amber, never through grey) [24] and glows from inside as an additive light source, brightest at the core with a fast, faint outer halo [14][16][17]. Ground is a dark brown-to-black gradient tinted toward the object hue [16][25]. Background copies of the object defocus into round soft-edged bokeh discs of varied size, dimmer than the subject [18][19], with a few extra discs floating in the dark. A handful of small four-point star sparkles at two or three sizes sit on the brightest edges [21]; if a second hue appears it is one cool accent, slightly desaturated for the dark ground [25]. Subtle darker soft spots suggest surface pores, painted as if on Soft Light [12][13]."
Rationale: every noun is the tool's own name (airbrush, Add glow, bokeh disc, four-point star) rather than a mood word; the one-family rule comes from the artist's own statement [1].

(b) CHARACTER constant, a person in this look:
"A person is a small solid near-black silhouette with kawaii proportions: round chubby body, big head, no neck, stubby limbs [22][23]. The only features are two big round white eyes with dark pupils; no nose, mouth, hair detail or clothing edges [11][22]. The silhouette is lit only by the props: a faint warm rim glow on the edge nearest the glowing object, painted on Add at low opacity, and a soft reflection of that hue in the eyes [16][17]. The figure peeks from behind or beside the objects, partly hidden, never the brightest thing in frame [1]."
Rationale: derived from the reference cat plus the artist's stated preference for "secrets" and vague, expressionless faces [1][11]; the eye treatment is the one feature Apofiss himself teaches (cat eye tutorial exists, image-only) [3]; light-from-props follows the glow-as-light-source sources [16][17].

(c) Compact twins:
STYLE (under 420): "Soft airbrushed painting, no outlines: chubby rounded shapes, feathered edges, one warm hue family in a hue-shifted gradient, glowing from inside with a faint outer halo on a dark brown-black ground. Background copies defocus into round soft bokeh discs; a few four-point star sparkles on the bright edges; one cool accent at most; subtle darker soft pore spots."
CHARACTER (under 160): "Small solid near-black chubby silhouette, big round white eyes with dark pupils, no other features, faint warm rim glow from the props, peeking from behind."

## Sources (numbered; title, URL, what it gave us)
1. interview with apofiss (DeviantArt), https://www.deviantart.com/apofiss/art/interview-with-apofiss-319217234 : tools (Photoshop + SAI, default brushes), "two main colours", bubbles as filler, cats as "secrets".
2. MAGIC bubble tutorial, https://www.deviantart.com/apofiss/art/MAGIC-bubble-tutorial-172319836 : "photoshop, paint tool sai and wacom"; steps are image-only.
3. cat eye tutorial, https://www.deviantart.com/apofiss/art/cat-eye-tutorial-322766375 : "used photoshop and paint tool sai"; steps image-only.
4. colouring tips, https://www.deviantart.com/apofiss/art/colouring-tips-149597266 : "used photoshop"; tips image-only.
5. Apofiss profile, https://www.deviantart.com/apofiss : recent work titles (Stardust Kitten, Moon Cats), 832 deviations, no tools listed.
6. Almost Magic Clouds tutorial, https://www.deviantart.com/apofiss/art/Almost-Magic-Clouds-tutorial-video-403089839 : SAI, "any digital software ... which has a soft brush".
7. status / F.A.Q journal, https://www.deviantart.com/apofiss/journal/status-F-A-Q-233977495 : Intuos 5, Photoshop CS3 + SAI 1.2.0, "mostly default brushes only", "between realism and pixar-ish".
8. Instagram profile @apofissx, https://www.instagram.com/apofissx/ : bio "digital artist", no tools.
9. Instagram post, https://www.instagram.com/apofissx/p/C0mhsXLMgnm/ : caption only, no technique.
10. Patreon, https://www.patreon.com/cw/apofiss : tiers are finished art, no PSDs or process videos.
11. Rihard Donskis (Apofiss) fan analysis, https://catsandcraftthings.weebly.com/rihard-donskis-apofiss.html : SECONDARY, uncited; "gradients, blurring, soft airbrush-like strokes", vague expressionless faces, glassy eyes.
12. Procreate Handbook: Blend Modes, https://help.procreate.com/procreate/handbook/5.0/layers/layers-blend : Screen, Add, Color Dodge, Overlay, Soft Light definitions.
13. Blending Modes Explained (Photoshop Training Channel), https://photoshoptrainingchannel.com/blending-modes-explained/ : Photoshop wording for Screen, Color Dodge, Linear Dodge (Add), Overlay, Soft Light.
14. How to Apply Outer Glow (Envato Tuts+), https://design.tutsplus.com/articles/how-to-apply-outer-glow-to-layer-styles-in-photoshop--psd-16796 : Linear Dodge/Screen for glow, Softer vs Precise, Spread, Range.
15. Hard vs Soft Brushes (Envato Tuts+), https://design.tutsplus.com/articles/quick-tip-painting-with-hard-vs-soft-brushes-in-adobe-photoshop--cms-23144 : 0 to 50% hardness, uses and muddying risk.
16. How to make things glow in Procreate (MuzenikArt), https://muzenikart.com/blogs/news/how-to-make-things-glow : duplicate, Gaussian blur, Overlay + Add, max five layers, dark ground of same hue.
17. Lighting your Painting (Clip Studio Art Rocket), https://www.clipstudio.net/how-to-draw/archives/156055 : Add Glow vs Screen saturation, soft airbrush gradation, start from darker mid-tone.
18. Depth of Field and Bokeh, H. H. Nasse, Carl Zeiss (PDF), https://lenspire.zeiss.com/photo/app/uploads/2022/02/technical-article-depth-of-field-and-bokeh.pdf : circle of confusion, entrance pupil drives blur, iris images of out-of-focus highlights.
19. Bokeh (Wikipedia), https://en.wikipedia.org/wiki/Bokeh : point of light becomes a disc, disc illumination profiles, polygonal when stopped down.
20. Diffraction spike (Wikipedia), https://en.wikipedia.org/wiki/Diffraction_spike : n blades give n spikes when even; starburst in photography.
21. Sparkling Eyes (Japanese with Anime), https://www.japanesewithanime.com/2020/01/sparkling-eyes.html : kirakira, four-pointed star meaning "captivated".
22. Kawaii design guide (Kittl), https://www.kittl.com/blogs/kawaii-design-guide/ : rounded shapes, dot eyes and tiny mouth, oversized heads.
23. 10 Top Tips for Kawaii Art (Envato Tuts+), https://design.tutsplus.com/articles/10-top-tips-for-creating-cute-kawaii-art--cms-25705 : giant heads, tiny bodies, simplicity, over-detail reads creepy.
24. Gradient Color Palette guide (ColorArchive), https://colorarchive.org/guides/gradient-color-palette/ : grey-midpoint mistake, route through a connecting hue.
25. Dark Mode Design guide (UX Design Institute), https://www.uxdesigninstitute.com/blog/dark-mode-design-practical-guide/ : dark grey over pure black, desaturate accents, faint outer glow.
26. GPT-4o Native Image Generation System Card addendum (OpenAI PDF), https://cdn.openai.com/11998be9-5319-4302-bfbf-1167e093f1fb/Native_Image_Generation_System_Card.pdf : refusal for living-artist style.
27. Imagen prompt guide (Google Cloud), https://docs.cloud.google.com/vertex-ai/generative-ai/docs/image/img-gen-prompt-guide : subject/context/style, bokeh and soft focus modifiers, artist and movement references.
Not fetched (timeouts or 403, cited nowhere above as fact): Adobe Photoshop blending-mode descriptions, Adobe Illustrator freeform gradient and mesh pages, Midjourney Prompt Basics and Style Reference, OpenAI DALL-E 3 page, photographylife.com bokeh, cambridgeincolour depth of field, YouTube clouds video, Apofiss Behance (no page found).
