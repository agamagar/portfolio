// Image-generation prompts: 3D faces. The PROSE half of the group.
// Every copy-paste block, the angle list and the template are composed from the
// recipe in ./faces3dViews.js by ./faces3d.js, so nothing here is a frozen prompt.
// Part of the prompt library (src/prd/promptLibrary). See index.js for the map.

export const SPECS = [
  {
    id: "pl-3d-faces-system",
    group: "3D faces",
    eyebrow: "3D faces",
    title: "3D faces · the system",
    summary:
      "Turn one photograph of a person into a floating, soft-satin, pastel-toy stylised 3D character head, then turn that head through a set of angles without losing the likeness. Attach the photo, pick an angle, an expression, a backdrop and a material, and the prompt assembles below in the interactive picker. Built for image-gen models (GPT Image 2 in Figma first, or any image model that accepts a reference image), in a compact register that fits Figma's prompt-length cap and a full one that does not try to.",
    "What this is": [
      "An image-to-image system, not a words-only one. The photograph carries the likeness; the prompt carries the sculpt, the material, the light and the crop.",
      "Six angles (front, three-quarter left, three-quarter right, profile, low hero, high tilt), seven expressions, six pastel backdrops, five materials (four 3D sculpts and one painted odd-one-out).",
      "The signature of the set is the crop: the head alone, ending at the jaw, no neck, no shoulders, no body, floating.",
      "The first group in the library built on the shared recipe contract (image/recipe.js). Adding an angle or a material is one entry in faces3dViews.js and it appears in the picker, in the written-out blocks and in the template at once.",
    ],
    "The constant": [
      "One base form, stated as DIMENSIONS. Every character is cast onto the same fixed toy head, and that head is specified numerically as fractions of head height H (crown to chin): skull 0.80 H wide, eye line at 0.50 H, eyes 0.16 H wide and one eye-width apart, brow ridge at 0.42 H, nose 0.14 H long with its base at 0.68 H, mouth 0.22 H wide at 0.80 H, chin 0.30 H wide, ears 0.18 H tall from eye line to nose base, no neck (the head ends at the jaw), the head 0.70 of the frame height. Numbers move an image model where adjectives do not, and they are what a turnaround or model sheet uses to hold proportion across views. The materials only change what that head is made of and how it is lit; they never reshape it, and since 2026-08-15 that includes the painted caricature, whose exaggeration now lives in the paint, not the volume.",
      "Simplify, do not copy. Proportions smoothed and gently idealised, features rounded and slightly enlarged, small detail removed, but the brow, nose, lips, jaw, hairline, ears and skin tone all carried over so the person stays unmistakable.",
      "Smooth toy skin does the work: no pores, no fine texture, only broad tonal falloff, with a single gentle sheen on the forehead, nose, cheekbones and lower lip in the reference look (none at all in matte clay).",
      "The palette is pastel: cream, powder blue, blush, mint, butter, lavender. Backdrops sit in it and every accessory is re-coloured into it, so a photographed black beanie comes back as a powder-blue fur hat.",
      "Hair is one smooth carved mass, never strands. Eyebrows are two raised ridges. The eyes are the only wet, glossy thing on the head.",
      "Accessories are the only detailed elements: a plush pastel fur hat with a soft fuzzy edge, a soft cap with crown seams and a stitched brim, gem-set eyewear with thin metal temples and flat near-black lenses, hard metal studs. They stop the image collapsing into one uniform putty surface.",
      "One very large soft frontal key, almost shadowless, the whole image bright, airy and low-contrast. Shadow only as gentle occlusion under the brow, nose, lower lip, ears and jaw. No rim light, no hard edge, no coloured light.",
      "One flat unbroken backdrop colour: no gradient, no floor, no horizon, no props, only the faintest corner darkening.",
      "A clean render. This group is the deliberate opposite of Specimen: no film grain, no noise, no bokeh, no bloom, no environment reflections.",
    ],
    "The base form as an image": [
      "The most robust way to hold one form across a set is to stop describing it and show it. Subject mode 'Base skeleton + photo' expects TWO images: the first is the base render (the head form and volume every character shares), the second is the person's photograph. The prompt then only assigns roles and states what must survive.",
      "What the base render should be, per the research: a flat, evenly lit, shadowless, untextured mid-grey clay render on a plain white ground, one camera orbited to each angle you intend to generate. NOT a matcap and NOT an ambient-occlusion pass: neither is a documented conditioning type, and both bake a lighting model into the very thing you are trying to keep material-free. If this ever moves to a ControlNet-capable tool, render and archive a normal pass per angle too, because that is the highest-value asset here and no hosted model can use it yet.",
      "The prompt has to do four things, each of them sourced. Name the subject independently of the reference ('a single human head'), because an ambiguous structure image with no stated subject gets interpreted rather than obeyed. Enumerate what to preserve, because both Gemini and Black Forest Labs tell you to state the preserve part out loud. Negate in a targeted way, aiming only at the documented bleed (the base render's own grey material and lighting), never with a blanket list. And keep the identity photo to identity, so its photographic skin and lighting do not ride along.",
      "GENERATE EACH STYLE IN ONE HOP FROM THE SAME CLEAN BASE. Never chain one style onto the render of another: multi-turn editing is documented to accumulate artefacts, with a published failure case after six iterations, so a chained set fans out. Chaining is only for holding a character across ANGLES when no per-angle base render exists.",
      "If the surface you are working in offers Gemini's image models, prefer them for this specific job. Gemini is the only model found with role-typed image inputs (object, character and style reference slots, the character slot documented for character consistency), which turns 'which image is which' from an unverified prompt convention into a structural guarantee. On GPT Image 2 the ordinal convention ('the first image', 'the second image') is undocumented folklore that happens to work, and it is the first thing to test rather than assume.",
      "If likeness is slipping on GPT Image 2 and Gemini is not available, A/B the subject clause itself. 'Base skeleton + photo (no ordinals)' in the picker carries the identical preserve/negate content as the ordinal version but describes each reference's role instead of indexing it ('a form reference' / 'a likeness reference'), matching OpenAI's own multi-image examples, which never refer to inputs by number. Generate the same combination both ways and keep whichever holds the face.",
      "Test protocol before committing to a set: generate one style at every angle, and one angle in every style. The first tells you whether the geometry survives rotation, the second whether it survives restyling. Fix whichever fails before spending on the full grid.",
    ],
    "Two registers": [
      "Compact (the default in the picker): the whole system in under 1,000 characters, rules included, for Figma's image-generation prompt field. The 1,000 is an observed working ceiling, not a documented one: no Figma source states a character limit, and the figure that circulates online turns out to be Adobe Firefly's. The models themselves have far more room (32,000 characters on GPT image, a 131,072-token context on Nano Banana 2), so any real cap is Figma's client. Written for GPT Image 2, which follows dense prose faithfully and only lightly rewrites, so the non-negotiables (likeness, material, angle, crop, pastel palette) come first and the explanatory sub-clauses are gone.",
      "Full: every clause spelled out, around 4,000 characters, for models and fields with no cap, or when a compact result drifts and needs the reasoning back.",
      "Both registers compose from the same dials, so a set can be generated compact and a stubborn angle regenerated full without changing character. The picker shows a live character count against the cap.",
    ],
    "The five dials": [
      "Subject: Base skeleton + photo (the default: Image 1 the fixed head form, Image 2 the person), or the photograph alone with the base form in words, or a text description in [SUBJECT] if you have no photo. In every mode identity is only brow, nose, lips, jaw, hairline, ears, skin tone; the base form supplies everything else.",
      "Angle: front, three-quarter left, three-quarter right, profile, low hero, or high tilt. Shape only, so any angle holds in any material.",
      "Expression: neutral, side glance, slight smile, warm smile, brow raise, eyes closed, or surprise. Written as mouth and brow (and where the irises sit) so it still reads behind dark lenses.",
      "Backdrop: cream, powder blue, blush, mint, butter, or lavender. Each is one flat pastel field with its hex value stated.",
      "Material: Pastel toy (the reference look, soft-satin skin and plush pastel accessories), Matte clay (fully matte, no sheen), Soft vinyl (a collectible-figure satin sheen), Plaster bust (one unpainted monochrome material, form carrying everything), or Grotesque oil paint (the odd one out: not a 3D sculpt at all but a digital-oil caricature, ugly on purpose, chunky knife strokes with scribbled ink over them, hot pinks and reds on the nose and cheeks, a bust crop and one hard light; it swaps the group's subject, crop, accessory and render clauses as well as material and light, while angle, expression and backdrop still come from the same dials).",
    ],
    "If it comes out literal or low quality": [
      "Say what it is NOT, first. Both registers now open with 'stylised 3D CGI character head, animated-film sculpt, not a photo': with a photograph attached, an image model defaults to photorealism unless the very first clause forbids it.",
      "Name the stylisation moves, not just 'stylised': big smooth rounded cranium, large wide-set almond eyes, small soft nose, full simple lips, no fine detail. The reference heads are pushed a long way from the photo; a vague 'simplify' does not get there.",
      "Turn the photo's weight down with WORDS, not a parameter. There is no fidelity slider to reach for here: input_fidelity applies to gpt-image-1 and 1.5 only, and GPT Image 2 always processes an attached image at high fidelity, so reference strength has to be carried by the prompt. If the result is still literal, describe the person in [SUBJECT] and attach the photo only for the second pass.",
      "Ask for production quality by name: 'production-quality 3D render, flawless smooth surfaces, subtle subsurface skin, razor sharp'. Without it, a short prompt on a photo reference lands on a soft, low-detail default. Generate at the largest size and highest quality the field allows.",
      "Chain the reference. Once one head is right, attach THAT render (not the photo) as the reference for the rest of the set with 'same character, same sculpt, same material and light, new angle'. This is what carries the gem-set glasses and cap across the four reference frames.",
    ],
    "Keeping a set consistent": [
      "Generate the front angle first. It fixes the proportions best, and it is the one a model gets right from a photograph most reliably.",
      "Then attach BOTH the original photograph and that first render as references while generating the other angles, so the sculpt, the hair mass and the accessories stay locked.",
      "Keep the material and the backdrop fixed across a set. Changing two dials at once is what makes a set look like different characters.",
      "Profile drifts most: the nose and chin contour is the first thing to go. Regenerate it with the front render attached and the nose called out by name.",
      "For a three-face set, the reference trio is front, three-quarter left and three-quarter right, one backdrop each.",
    ],
    Sources: [
      "Retuned 2026-08-15 against research/faces3d.md: the sheen ladder is measured (matte under 10 percent, satin 26 to 40), skin returns only about 6 percent of light specularly and scatters the rest, and the vinyl tells (rotocast hollow body, mould parting line, hard-edged spray-mask paint, pad-printed catchlight) are what separate a real production toy from a generic render. Caricature reworded as Court Jones teaches it, amplify only where the face deviates from the average, which protects the likeness.",
      "Derived by reading four reference frames of one sculpted head (same character, four backdrops, four angles), then re-tuned on 2026-08-15 to a pastel-toy reference: a floating head under a powder-blue plush hat on cream, side glance, one gentle sheen.",
      "Tuned for image-gen models that accept a reference image (GPT Image 2 in Figma, Nano Banana 2, or any image model). Compact register added 2026-08-15 for Figma's prompt-length cap.",
      "Base-form-as-image mode, the base render spec, the one-hop rule and the preserve/negation clause language come from research/base-mesh-restyling.md (ControlNet, OpenAI and Gemini image docs, Black Forest Labs Kontext guidance, FlashTex, plus turnaround practice), researched 2026-08-15.",
      "Grotesque oil paint added 2026-08-15 from three digital-oil caricature references: a scowling shaved head on cobalt blue, a red-bobbed woman with smeared lipstick on white, a boy in gold aviators and braces on pale grey.",
    ],
  },
];
