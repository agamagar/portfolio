// Image-generation prompts: Specimen.
// { pre } blocks carrying rules:true get the library rules appended at assembly.
// Part of the prompt library (src/prd/promptLibrary). See index.js for the map.

export const SPECS = [
  {
    "id": "pl-specimen-system",
    "group": "Specimen",
    "eyebrow": "Specimen",
    "title": "Specimen · the system",
    "summary": "A premium studio product-shot style with a swappable object, a family of physical framing artifacts, and three colourways. The look stays constant; you feed the object (a text name or a hero image), pick a frame, and pick a colourway. Built for image-gen models (e.g. Nano Banana 2 in Figma, or any image model).",
    "What this is": [
      "Six prompts, one per frame, each written out in all three colourways, so every block is copy-paste ready.",
      "The look is constant: studio void, premium light, film grain, one restrained palette. Only the object, the frame, and the colourway change.",
      "Distilled from three references: a Shadow-Study postage stamp (the framing device), an Aesop tube (premium light and shine), and a Humanrace jar plus a synara bottle (the cool and warm gradient colourways)."
    ],
    "The constant": [
      "Controlled studio, seamless ground or gradient, no environment and no props beyond the hero object.",
      "Premium light does the luxury signalling: a specular bloom and a fine shimmer, hard-keyed on the dramatic colourways, soft and high-key on Powder.",
      "Two separate textures, not one overlay: the artifact's own surface tooth, and over the photograph a fine monochromatic film grain in the emulsion, never coloured digital speckle, a collected, specimen feel, not clean CGI.",
      "One restrained palette per shot; acid chartreuse-yellow (or cream on dark grounds) may accent a single small non-text detail, never any text.",
      "Direct, straight-on framing, crisp focus throughout."
    ],
    "The three dials": [
      "Object: supplied by you. A text name in [SUBJECT], or feed a hero studio image as a reference and set [SUBJECT] to \"the provided product image\".",
      "Frame: the physical artifact the shot is presented as. Hero (no frame), Stamp, Postcard, 35mm slide, Polaroid, or Foil trading card.",
      "Colourway: Powder, Cobalt and Sage, or Scarlet. Each sets the ground, the subject tone, and the light."
    ],
    "Colourways": [
      "Powder: soft powder-blue ground (#A9CBE0), buttery-yellow and cream subject (#EFCF74 / #EEE7D4), high-key diffused light, tiny red and chartreuse prop pops allowed. Playful-premium.",
      "Cobalt and Sage: deep cobalt-to-silver gradient (#1E2A57 to #C4D0DC), muted sage-green subject (#557B5B), one hard key with a shimmer edge. Moody-premium.",
      "Scarlet: glowing maroon-to-white gradient (#4E0E06 to #FFEFE0), matte tone-on-tone red subject (#C0301A), strong backlight bloom. Dramatic-warm."
    ],
    "How a prompt is assembled": [
      "Opening: what the artifact is and where the subject image sits inside it.",
      "Colour block: the ground, the subject tone, and the light for the chosen colourway (this is the only part that changes between colourways).",
      "Framing: direct and straight-on, crisp focus, no depth-of-field blur.",
      "Texture: monochromatic silver-halide film grain in the emulsion of the photograph, plus the artifact's own printed tooth, for the archival, specimen feel.",
      "Type: none. No text is rendered (the caption has been removed).",
      "Close: restrained, editorial, luxury, no clutter."
    ],
    "Copy-paste template": {
      "pre": "A premium studio product photograph of [SUBJECT], presented as [FRAME]. Studio ground: [COLOURWAY]. Framing: direct and straight-on, the subject centred and filling most of the frame, everything in crisp focus with no depth-of-field blur. Texture, in two separate layers: the artifact's own printed tooth, and over the whole photograph a fine monochromatic silver-halide film grain in the emulsion, never coloured digital speckle, a collected, archival, specimen feel rather than clean CGI. Restrained, editorial, luxury, no clutter, no props beyond the subject. {{RULES}}\n\n[FRAME] options: full-bleed with no border | a collectible postage stamp with perforated die-cut edges, the studio image inside the stamp window | a printed postcard with a ghosted postmark | a mounted 35mm film slide glowing as if backlit | an instant Polaroid-style print with a thick white border | a collectible trading card behind a holographic foil finish.\n\n[COLOURWAY] options: a soft powder-blue ground (#A9CBE0) with a buttery-yellow and cream subject (#EFCF74 / #EEE7D4), high-key and soft | a deep cobalt-to-silver gradient (#1E2A57 to #C4D0DC) with a muted sage-green subject (#557B5B), hard key and shimmer | a glowing maroon-to-white gradient (#4E0E06 to #FFEFE0) with a matte tone-on-tone red subject (#C0301A), strong backlight bloom.\n\nTo use a hero image instead of a text object, replace [SUBJECT] with \"the provided product image\" and delete its description."
    },
    "Sources": [
      "Retuned 2026-08-15 against research/specimen.md: comb versus line perforation, gauge as holes per 2cm, intaglio ink sitting in relief, the 24 by 36mm slide frame in a 2 inch mount and reversal film's narrow latitude, the Polaroid chin explained by the reagent pod at the trailing edge, and foil as a diffraction grating whose rainbow must SHIFT with viewing angle. The strongest single lever: film grain is monochromatic and lives in the emulsion of the photograph, unlike coloured digital speckle, so the artifact's surface and the photograph's grain are two separate layers.",
      "Style references: Shadow Study stamp (Jacob Hutch), Aesop Rind Concentrate Body Balm, Humanrace, synara.",
      "Tuned for image-gen models (Nano Banana 2 in Figma, or any image model)."
    ]
  },
  {
    "id": "pl-specimen-hero",
    "group": "Specimen",
    "eyebrow": "Specimen",
    "title": "Hero · no frame",
    "summary": "The full-bleed studio hero shot, no artifact frame, written out in all three colourways. Feed a hero image or a text object as [SUBJECT]. No caption or text is rendered. This is also the base plate you can reuse inside the framed shots below.",
    "Powder": {
      "pre": "A premium studio product photograph of [SUBJECT], full-bleed with no border. The studio ground is a soft powder-blue seamless sweep (#A9CBE0); the subject reads in buttery yellow and cream (#EFCF74 / #EEE7D4), a warm form set against the cool ground. Light is soft, high-key and diffused, only a gentle sheen and a whisper of shimmer along the top edge, airy and clean rather than harsh. Direct, straight-on hero framing, the subject centred and filling most of the frame, a slight low hero angle, everything in crisp focus with no depth-of-field blur. Two separate textures, not one overlay: the artifact's own printed surface tooth, and over the whole photograph a fine monochromatic silver-halide film grain that sits in the emulsion, never coloured digital speckle, a collected, archival feel rather than clean CGI. Restrained, editorial, luxury, no clutter and no props beyond the subject.",
      "rules": true
    },
    "Cobalt · Sage": {
      "pre": "A premium studio product photograph of [SUBJECT], full-bleed with no border. The studio ground is a deep cobalt-to-silver vertical gradient (#1E2A57 fading to #C4D0DC); the subject reads in muted sage green (#557B5B) with a soft sage highlight (#7FA383). One hard directional key light from the upper left throws a bright specular bloom and a fine shimmer along the top edge for a premium, jewel-like finish. Direct, straight-on hero framing, the subject centred and filling most of the frame, a slight low hero angle, everything in crisp focus with no depth-of-field blur. Two separate textures, not one overlay: the artifact's own printed surface tooth, and over the whole photograph a fine monochromatic silver-halide film grain that sits in the emulsion, never coloured digital speckle, a collected, archival feel rather than clean CGI. Restrained, editorial, luxury, no clutter and no props beyond the subject.",
      "rules": true
    },
    "Scarlet": {
      "pre": "A premium studio product photograph of [SUBJECT], full-bleed with no border. The studio ground is a glowing scarlet gradient, deep maroon at the top (#4E0E06) burning down through vivid orange-red (#E23A0E) to a bright near-white bloom at the horizon (#FFEFE0) over a saturated red-orange floor; the subject reads in matte tone-on-tone red (#C0301A). It is lit strongly from behind so a halo of light blooms around it, dramatic and warm, with a deep contact shadow in front. Direct, straight-on hero framing, the subject centred and filling most of the frame, a slight low hero angle, everything in crisp focus with no depth-of-field blur. Two separate textures, not one overlay: the artifact's own printed surface tooth, and over the whole photograph a fine monochromatic silver-halide film grain that sits in the emulsion, never coloured digital speckle, a collected, archival feel rather than clean CGI. Restrained, editorial, luxury, no clutter and no props beyond the subject.",
      "rules": true
    }
  },
  {
    "id": "pl-specimen-stamp",
    "group": "Specimen",
    "eyebrow": "Specimen",
    "title": "Stamp · perforated",
    "summary": "The shot issued as a collectible postage stamp, in all three colourways. The philatelic framing device from the Shadow-Study reference. Feed [SUBJECT]. No caption or text is rendered.",
    "Powder": {
      "pre": "A premium studio photograph of a collectible postage stamp comb-perforated on all four sides at roughly gauge 13, the paper genuinely punched away so fibrous teeth stand between the holes rather than a scalloped printed outline, the image built from ruled and cross-hatched intaglio engraved lines sitting in slight relief above a subtle paper tooth, floating centred on the studio ground. Inside the stamp window sits a studio image of [SUBJECT]. The studio ground is a soft powder-blue seamless sweep (#A9CBE0); the subject reads in buttery yellow and cream (#EFCF74 / #EEE7D4), a warm form set against the cool ground. Light is soft, high-key and diffused, only a gentle sheen and a whisper of shimmer along the top edge, airy and clean rather than harsh. The stamp sits centred with a generous margin, soft occlusion beneath it where it floats, everything in crisp focus with no depth-of-field blur. Two separate textures, not one overlay: the artifact's own printed surface tooth, and over the whole photograph a fine monochromatic silver-halide film grain that sits in the emulsion, never coloured digital speckle, an archival, philatelic, specimen feel. Restrained, editorial, luxury.",
      "rules": true
    },
    "Cobalt · Sage": {
      "pre": "A premium studio photograph of a collectible postage stamp comb-perforated on all four sides at roughly gauge 13, the paper genuinely punched away so fibrous teeth stand between the holes rather than a scalloped printed outline, the image built from ruled and cross-hatched intaglio engraved lines sitting in slight relief above a subtle paper tooth, floating centred on the studio ground. Inside the stamp window sits a studio image of [SUBJECT]. The studio ground is a deep cobalt-to-silver vertical gradient (#1E2A57 fading to #C4D0DC); the subject reads in muted sage green (#557B5B) with a soft sage highlight (#7FA383). One hard directional key light from the upper left throws a bright specular bloom and a fine shimmer along the top edge for a premium, jewel-like finish. The stamp sits centred with a generous margin, soft occlusion beneath it where it floats, everything in crisp focus with no depth-of-field blur. Two separate textures, not one overlay: the artifact's own printed surface tooth, and over the whole photograph a fine monochromatic silver-halide film grain that sits in the emulsion, never coloured digital speckle, an archival, philatelic, specimen feel. Restrained, editorial, luxury.",
      "rules": true
    },
    "Scarlet": {
      "pre": "A premium studio photograph of a collectible postage stamp comb-perforated on all four sides at roughly gauge 13, the paper genuinely punched away so fibrous teeth stand between the holes rather than a scalloped printed outline, the image built from ruled and cross-hatched intaglio engraved lines sitting in slight relief above a subtle paper tooth, floating centred on the studio ground. Inside the stamp window sits a studio image of [SUBJECT]. The studio ground is a glowing scarlet gradient, deep maroon at the top (#4E0E06) burning down through vivid orange-red (#E23A0E) to a bright near-white bloom at the horizon (#FFEFE0) over a saturated red-orange floor; the subject reads in matte tone-on-tone red (#C0301A). It is lit strongly from behind so a halo of light blooms around it, dramatic and warm, with a deep contact shadow in front. The stamp sits centred with a generous margin, soft occlusion beneath it where it floats, everything in crisp focus with no depth-of-field blur. Two separate textures, not one overlay: the artifact's own printed surface tooth, and over the whole photograph a fine monochromatic silver-halide film grain that sits in the emulsion, never coloured digital speckle, an archival, philatelic, specimen feel. Restrained, editorial, luxury.",
      "rules": true
    }
  },
  {
    "id": "pl-specimen-postcard",
    "group": "Specimen",
    "eyebrow": "Specimen",
    "title": "Postcard · mailed",
    "summary": "The shot printed as a postcard with a ghosted postmark, in all three colourways. Feed [SUBJECT]. No caption or text is rendered.",
    "Powder": {
      "pre": "A premium studio photograph of a printed postcard on heavy uncoated card stock with softly rounded corners, a faint deckled edge and a visible halftone rosette in the printed image, floating centred on the studio ground. The postcard front carries a studio image of [SUBJECT]. The studio ground is a soft powder-blue seamless sweep (#A9CBE0); the subject reads in buttery yellow and cream (#EFCF74 / #EEE7D4), a warm form set against the cool ground. Light is soft, high-key and diffused, only a gentle sheen and a whisper of shimmer along the top edge, airy and clean rather than harsh. Direct straight-on framing, soft occlusion where the card floats, everything in crisp focus with no depth-of-field blur. Two separate textures, not one overlay: the artifact's own printed surface tooth, and over the whole photograph a fine monochromatic silver-halide film grain that sits in the emulsion, never coloured digital speckle, a collected, mailed-artifact feel. Restrained, editorial, luxury.",
      "rules": true
    },
    "Cobalt · Sage": {
      "pre": "A premium studio photograph of a printed postcard on heavy uncoated card stock with softly rounded corners, a faint deckled edge and a visible halftone rosette in the printed image, floating centred on the studio ground. The postcard front carries a studio image of [SUBJECT]. The studio ground is a deep cobalt-to-silver vertical gradient (#1E2A57 fading to #C4D0DC); the subject reads in muted sage green (#557B5B) with a soft sage highlight (#7FA383). One hard directional key light from the upper left throws a bright specular bloom and a fine shimmer along the top edge for a premium, jewel-like finish. Direct straight-on framing, soft occlusion where the card floats, everything in crisp focus with no depth-of-field blur. Two separate textures, not one overlay: the artifact's own printed surface tooth, and over the whole photograph a fine monochromatic silver-halide film grain that sits in the emulsion, never coloured digital speckle, a collected, mailed-artifact feel. Restrained, editorial, luxury.",
      "rules": true
    },
    "Scarlet": {
      "pre": "A premium studio photograph of a printed postcard on heavy uncoated card stock with softly rounded corners, a faint deckled edge and a visible halftone rosette in the printed image, floating centred on the studio ground. The postcard front carries a studio image of [SUBJECT]. The studio ground is a glowing scarlet gradient, deep maroon at the top (#4E0E06) burning down through vivid orange-red (#E23A0E) to a bright near-white bloom at the horizon (#FFEFE0) over a saturated red-orange floor; the subject reads in matte tone-on-tone red (#C0301A). It is lit strongly from behind so a halo of light blooms around it, dramatic and warm, with a deep contact shadow in front. Direct straight-on framing, soft occlusion where the card floats, everything in crisp focus with no depth-of-field blur. Two separate textures, not one overlay: the artifact's own printed surface tooth, and over the whole photograph a fine monochromatic silver-halide film grain that sits in the emulsion, never coloured digital speckle, a collected, mailed-artifact feel. Restrained, editorial, luxury.",
      "rules": true
    }
  },
  {
    "id": "pl-specimen-slide",
    "group": "Specimen",
    "eyebrow": "Specimen",
    "title": "35mm slide · backlit",
    "summary": "The shot mounted as a 35mm film transparency, glowing as if backlit, in all three colourways. Feed [SUBJECT]. No caption or text is rendered.",
    "Powder": {
      "pre": "A premium studio photograph of a mounted 35mm film slide held in the studio void: a 2 by 2 inch card mount with a clean rectangular aperture window over a 24 by 36 mm transparency. The transparency frames a studio image of [SUBJECT], glowing as if backlit on a lightbox so the image reads luminous inside its mount, with the narrow latitude of reversal film, deep saturated shadows and highlights clipping abruptly to clear film. The studio ground is a soft powder-blue seamless sweep (#A9CBE0); the subject reads in buttery yellow and cream (#EFCF74 / #EEE7D4), a warm form set against the cool ground. Light is soft, high-key and diffused, only a gentle sheen and a whisper of shimmer along the top edge, airy and clean rather than harsh. The slide sits centred with a generous margin, soft occlusion where it floats, everything in crisp focus with no depth-of-field blur. Two separate textures, not one overlay: the artifact's own printed surface tooth, and over the whole photograph a fine monochromatic silver-halide film grain that sits in the emulsion, never coloured digital speckle, an archival, cataloged-transparency feel. Restrained, editorial, luxury.",
      "rules": true
    },
    "Cobalt · Sage": {
      "pre": "A premium studio photograph of a mounted 35mm film slide held in the studio void: a 2 by 2 inch card mount with a clean rectangular aperture window over a 24 by 36 mm transparency. The transparency frames a studio image of [SUBJECT], glowing as if backlit on a lightbox so the image reads luminous inside its mount, with the narrow latitude of reversal film, deep saturated shadows and highlights clipping abruptly to clear film. The studio ground is a deep cobalt-to-silver vertical gradient (#1E2A57 fading to #C4D0DC); the subject reads in muted sage green (#557B5B) with a soft sage highlight (#7FA383). One hard directional key light from the upper left throws a bright specular bloom and a fine shimmer along the top edge for a premium, jewel-like finish. The slide sits centred with a generous margin, soft occlusion where it floats, everything in crisp focus with no depth-of-field blur. Two separate textures, not one overlay: the artifact's own printed surface tooth, and over the whole photograph a fine monochromatic silver-halide film grain that sits in the emulsion, never coloured digital speckle, an archival, cataloged-transparency feel. Restrained, editorial, luxury.",
      "rules": true
    },
    "Scarlet": {
      "pre": "A premium studio photograph of a mounted 35mm film slide held in the studio void: a 2 by 2 inch card mount with a clean rectangular aperture window over a 24 by 36 mm transparency. The transparency frames a studio image of [SUBJECT], glowing as if backlit on a lightbox so the image reads luminous inside its mount, with the narrow latitude of reversal film, deep saturated shadows and highlights clipping abruptly to clear film. The studio ground is a glowing scarlet gradient, deep maroon at the top (#4E0E06) burning down through vivid orange-red (#E23A0E) to a bright near-white bloom at the horizon (#FFEFE0) over a saturated red-orange floor; the subject reads in matte tone-on-tone red (#C0301A). It is lit strongly from behind so a halo of light blooms around it, dramatic and warm, with a deep contact shadow in front. The slide sits centred with a generous margin, soft occlusion where it floats, everything in crisp focus with no depth-of-field blur. Two separate textures, not one overlay: the artifact's own printed surface tooth, and over the whole photograph a fine monochromatic silver-halide film grain that sits in the emulsion, never coloured digital speckle, an archival, cataloged-transparency feel. Restrained, editorial, luxury.",
      "rules": true
    }
  },
  {
    "id": "pl-specimen-polaroid",
    "group": "Specimen",
    "eyebrow": "Specimen",
    "title": "Polaroid · instant",
    "summary": "The shot as an instant Polaroid-style print with a thick white border, in all three colourways. Feed [SUBJECT]. No caption or text is rendered.",
    "Powder": {
      "pre": "A premium studio photograph of an instant Polaroid-style photo, a square image area inside a white frame with equal thin borders left, right and top and a chin at the bottom two to three times deeper, where the reagent pod sits at the trailing edge. It floats centred in the studio void. Inside the border sits a studio image of [SUBJECT], its colour muted and its edges softly migrated by dye diffusion transfer, with slightly uneven reagent spread at the corners and the soft vignette of an instant print. The studio ground is a soft powder-blue seamless sweep (#A9CBE0); the subject reads in buttery yellow and cream (#EFCF74 / #EEE7D4), a warm form set against the cool ground. Light is soft, high-key and diffused, only a gentle sheen and a whisper of shimmer along the top edge, airy and clean rather than harsh. Direct straight-on framing, soft occlusion where it floats, everything in crisp focus with no depth-of-field blur. Two separate textures, not one overlay: the artifact's own printed surface tooth, and over the whole photograph a fine monochromatic silver-halide film grain that sits in the emulsion, never coloured digital speckle, a collected, snapshot-archive feel. Restrained, editorial, luxury.",
      "rules": true
    },
    "Cobalt · Sage": {
      "pre": "A premium studio photograph of an instant Polaroid-style photo, a square image area inside a white frame with equal thin borders left, right and top and a chin at the bottom two to three times deeper, where the reagent pod sits at the trailing edge. It floats centred in the studio void. Inside the border sits a studio image of [SUBJECT], its colour muted and its edges softly migrated by dye diffusion transfer, with slightly uneven reagent spread at the corners and the soft vignette of an instant print. The studio ground is a deep cobalt-to-silver vertical gradient (#1E2A57 fading to #C4D0DC); the subject reads in muted sage green (#557B5B) with a soft sage highlight (#7FA383). One hard directional key light from the upper left throws a bright specular bloom and a fine shimmer along the top edge for a premium, jewel-like finish. Direct straight-on framing, soft occlusion where it floats, everything in crisp focus with no depth-of-field blur. Two separate textures, not one overlay: the artifact's own printed surface tooth, and over the whole photograph a fine monochromatic silver-halide film grain that sits in the emulsion, never coloured digital speckle, a collected, snapshot-archive feel. Restrained, editorial, luxury.",
      "rules": true
    },
    "Scarlet": {
      "pre": "A premium studio photograph of an instant Polaroid-style photo, a square image area inside a white frame with equal thin borders left, right and top and a chin at the bottom two to three times deeper, where the reagent pod sits at the trailing edge. It floats centred in the studio void. Inside the border sits a studio image of [SUBJECT], its colour muted and its edges softly migrated by dye diffusion transfer, with slightly uneven reagent spread at the corners and the soft vignette of an instant print. The studio ground is a glowing scarlet gradient, deep maroon at the top (#4E0E06) burning down through vivid orange-red (#E23A0E) to a bright near-white bloom at the horizon (#FFEFE0) over a saturated red-orange floor; the subject reads in matte tone-on-tone red (#C0301A). It is lit strongly from behind so a halo of light blooms around it, dramatic and warm, with a deep contact shadow in front. Direct straight-on framing, soft occlusion where it floats, everything in crisp focus with no depth-of-field blur. Two separate textures, not one overlay: the artifact's own printed surface tooth, and over the whole photograph a fine monochromatic silver-halide film grain that sits in the emulsion, never coloured digital speckle, a collected, snapshot-archive feel. Restrained, editorial, luxury.",
      "rules": true
    }
  },
  {
    "id": "pl-specimen-foil",
    "group": "Specimen",
    "eyebrow": "Specimen",
    "title": "Foil card · holographic",
    "summary": "The shot behind a holographic foil trading card, the frame that leans hardest into shine and shimmer, in all three colourways. Feed [SUBJECT]. No caption or text is rendered.",
    "Powder": {
      "pre": "A premium studio photograph of a collectible trading card floating centred in the studio void. The card frames a studio image of [SUBJECT] behind a hot-stamped holographic foil whose microscopic diffraction grating, around a thousand lines per millimetre in relief a micron deep, splits the light into a rainbow that shifts across the card with the viewing angle rather than sitting still, the printed image overprinted densely enough on top that the diffraction still reads through. The studio ground is a soft powder-blue seamless sweep (#A9CBE0); the subject reads in buttery yellow and cream (#EFCF74 / #EEE7D4), a warm form set against the cool ground. Light is soft, high-key and diffused, only a gentle sheen and a whisper of shimmer along the top edge, airy and clean rather than harsh. A bright bloom and prismatic shimmer sweep across the foil for a premium, jewel-like finish, wet-look gloss on the lamination, soft occlusion where it floats, everything in crisp focus with no depth-of-field blur. Fine analog film grain and a risograph tooth over the whole frame so it still reads collected and analog, not clean CGI. Restrained, editorial, luxury.",
      "rules": true
    },
    "Cobalt · Sage": {
      "pre": "A premium studio photograph of a collectible trading card floating centred in the studio void. The card frames a studio image of [SUBJECT] behind a hot-stamped holographic foil whose microscopic diffraction grating, around a thousand lines per millimetre in relief a micron deep, splits the light into a rainbow that shifts across the card with the viewing angle rather than sitting still, the printed image overprinted densely enough on top that the diffraction still reads through. The studio ground is a deep cobalt-to-silver vertical gradient (#1E2A57 fading to #C4D0DC); the subject reads in muted sage green (#557B5B) with a soft sage highlight (#7FA383). One hard directional key light from the upper left throws a bright specular bloom and a fine shimmer along the top edge for a premium, jewel-like finish. A bright bloom and prismatic shimmer sweep across the foil for a premium, jewel-like finish, wet-look gloss on the lamination, soft occlusion where it floats, everything in crisp focus with no depth-of-field blur. Fine analog film grain and a risograph tooth over the whole frame so it still reads collected and analog, not clean CGI. Restrained, editorial, luxury.",
      "rules": true
    },
    "Scarlet": {
      "pre": "A premium studio photograph of a collectible trading card floating centred in the studio void. The card frames a studio image of [SUBJECT] behind a hot-stamped holographic foil whose microscopic diffraction grating, around a thousand lines per millimetre in relief a micron deep, splits the light into a rainbow that shifts across the card with the viewing angle rather than sitting still, the printed image overprinted densely enough on top that the diffraction still reads through. The studio ground is a glowing scarlet gradient, deep maroon at the top (#4E0E06) burning down through vivid orange-red (#E23A0E) to a bright near-white bloom at the horizon (#FFEFE0) over a saturated red-orange floor; the subject reads in matte tone-on-tone red (#C0301A). It is lit strongly from behind so a halo of light blooms around it, dramatic and warm, with a deep contact shadow in front. A bright bloom and prismatic shimmer sweep across the foil for a premium, jewel-like finish, wet-look gloss on the lamination, soft occlusion where it floats, everything in crisp focus with no depth-of-field blur. Fine analog film grain and a risograph tooth over the whole frame so it still reads collected and analog, not clean CGI. Restrained, editorial, luxury.",
      "rules": true
    }
  }
];
