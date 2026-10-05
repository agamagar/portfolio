// Image-generation prompts: Portfolio line icons.
// { pre } blocks carrying rules:true get the library rules appended at assembly.
// Part of the prompt library (src/prd/promptLibrary). See index.js for the map.

export const SPECS = [
  {
    "id": "pl-portfolio-line-icons-system",
    "group": "Portfolio line icons",
    "eyebrow": "Portfolio",
    "title": "Portfolio line icons · the system",
    "summary": "A two-mode line-icon set for the portfolio, matched to the Icons Overview reference: one thin precise black line on a flat white ground, keyed to transparency afterwards. Every icon renders in Isometric mode (a true 30-degree isometric projection, for spatial and layered concepts) or Flat mode (front-facing, for objects and UI glyphs). Built for Nano Banana 2 in Figma, or any image model.",
    "What this is": [
      "One line-icon system with two modes, Isometric and Flat. Pick the mode that fits the concept.",
      "Two catalogs of copy-paste prompts below, one per mode, each icon self-contained.",
      "The line style is constant across both modes, only the projection and the subject change."
    ],
    "The constant": [
      "One uniform thin black line, about 1.5px, clean and precise, no fill.",
      "Pure flat white #FFFFFF background, no background shape, no gradient, no shadow. (Ask for white, not transparency: these models emit RGB with no alpha channel, and the word 'transparent' makes them paint a fake checkerboard. Recover real alpha downstream by re-rendering the same icon on pure black through the edit path and comparing.)",
      "One icon centred in a square with generous padding, refined and technical.",
      "No text and no branding, ever."
    ],
    "The two modes": [
      "Isometric: a true isometric projection, axes at 30 degrees from the horizontal and 120 degrees apart, the subject built from layered planes and extruded volumes on an isometric ground, showing depth and elevation. Best for spatial, layered, structural ideas (systems, data, flows, building).",
      "Flat: straight-on and front-facing, flat 2D with no perspective, a simple clean silhouette. Best for objects, tools and UI glyphs (people, search, screens, media)."
    ],
    "The dials": [
      "Mode: Isometric or Flat.",
      "Subject: the one thing the icon depicts, described as simple shapes and ending with what it represents."
    ],
    "How to use it in Figma": [
      "Paste a prompt straight into a Figma image-gen plugin (e.g. Nano Banana 2). Generate square, one icon per image.",
      "Match the mode to the concept: volumetric and layered ideas read better isometric, discrete objects read better flat.",
      "Keyed off the flat white ground, each icon drops onto any surface.",
      "Generate one icon you like first and feed it back as a style reference to hold the set together, especially the isometric line angles."
    ],
    "Copy-paste template": {
      "pre": "Single thin line icon: one uniform black stroke about 1.5px wide, clean and precise, no fill of any kind, on a pure flat white #FFFFFF background, one icon centred in a square frame with generous padding. Refined, technical and minimal, like a premium architectural icon set.\n\n[MODE]\n\nSubject: [SUBJECT, described as simple shapes]. Represents [MEANING]. {{RULES}}\n\n[MODE] options:\n- Isometric mode: draw the subject in a true isometric projection, axes at 30 degrees from the horizontal and 120 degrees apart, equal foreshortening on all three axes, as if seen from above and to one side, built from flat layered planes and extruded volumes resting on an isometric ground, with clean parallel edges that show depth and elevation.\n- Flat mode: draw the subject straight-on and front-facing in flat 2D with no perspective, a single clean silhouette line icon."
    },
    "Sources": [
      "Retuned 2026-08-15 against research/icons.md. Two corrections: a 2:1 projection is 26.565 degrees and is strictly DIMETRIC, so calling the same drawing both 2:1 and 30-degree isometric named two different drawings; it is now true isometric throughout. And the models emit RGB with no alpha channel, so asking for a transparent background makes them paint a fake checkerboard. The prompts now ask for pure flat white and the alpha is recovered downstream.",
      "Style reference: the two-mode Icons Overview sheet (Isometric and Flat).",
      "Line-icon lineage: the Zepto line-icon set in the Icon prompts group.",
      "Tuned for Nano Banana 2 in Figma, or any image model."
    ]
  },
  {
    "id": "pl-portfolio-line-icons-iso",
    "group": "Portfolio line icons",
    "eyebrow": "Isometric",
    "title": "Isometric mode",
    "summary": "Spatial and layered portfolio concepts in a true 30-degree isometric projection: design systems, prototyping, research data, systems thinking, zero to one, the work, motion. Copy-paste ready.",
    "Design systems": {
      "pre": "Single thin line icon: one uniform black stroke about 1.5px wide, clean and precise, no fill of any kind, on a pure flat white #FFFFFF background, one icon centred in a square frame with generous padding. Refined, technical and minimal, like a premium architectural icon set.\n\nIsometric mode: draw the subject in a true isometric projection, axes at 30 degrees from the horizontal and 120 degrees apart, equal foreshortening on all three axes, as if seen from above and to one side, built from flat layered planes and extruded volumes resting on an isometric ground, with clean parallel edges that show depth and elevation.\n\nSubject: a stack of three flat square plates floating one above another with a small even gap between them, layered like component sheets or design tokens. Represents a design system of reusable, layered parts.",
      "rules": true
    },
    "Prototyping": {
      "pre": "Single thin line icon: one uniform black stroke about 1.5px wide, clean and precise, no fill of any kind, on a pure flat white #FFFFFF background, one icon centred in a square frame with generous padding. Refined, technical and minimal, like a premium architectural icon set.\n\nIsometric mode: draw the subject in a true isometric projection, axes at 30 degrees from the horizontal and 120 degrees apart, equal foreshortening on all three axes, as if seen from above and to one side, built from flat layered planes and extruded volumes resting on an isometric ground, with clean parallel edges that show depth and elevation.\n\nSubject: two flat square screen planes at different heights, connected by a single arrow flowing from the lower plane up to the higher one, a user flow laid out in space. Represents prototyping and flows.",
      "rules": true
    },
    "Research data": {
      "pre": "Single thin line icon: one uniform black stroke about 1.5px wide, clean and precise, no fill of any kind, on a pure flat white #FFFFFF background, one icon centred in a square frame with generous padding. Refined, technical and minimal, like a premium architectural icon set.\n\nIsometric mode: draw the subject in a true isometric projection, axes at 30 degrees from the horizontal and 120 degrees apart, equal foreshortening on all three axes, as if seen from above and to one side, built from flat layered planes and extruded volumes resting on an isometric ground, with clean parallel edges that show depth and elevation.\n\nSubject: a single flat isometric square subdivided into a fine even grid of small cells, like a field of data points on the ground. Represents research and data.",
      "rules": true
    },
    "Systems thinking": {
      "pre": "Single thin line icon: one uniform black stroke about 1.5px wide, clean and precise, no fill of any kind, on a pure flat white #FFFFFF background, one icon centred in a square frame with generous padding. Refined, technical and minimal, like a premium architectural icon set.\n\nIsometric mode: draw the subject in a true isometric projection, axes at 30 degrees from the horizontal and 120 degrees apart, equal foreshortening on all three axes, as if seen from above and to one side, built from flat layered planes and extruded volumes resting on an isometric ground, with clean parallel edges that show depth and elevation.\n\nSubject: several small extruded cubes of varying heights scattered across a flat isometric ground plane, connected to each other by thin straight lines, a network in space. Represents systems thinking.",
      "rules": true
    },
    "Zero to one": {
      "pre": "Single thin line icon: one uniform black stroke about 1.5px wide, clean and precise, no fill of any kind, on a pure flat white #FFFFFF background, one icon centred in a square frame with generous padding. Refined, technical and minimal, like a premium architectural icon set.\n\nIsometric mode: draw the subject in a true isometric projection, axes at 30 degrees from the horizontal and 120 degrees apart, equal foreshortening on all three axes, as if seen from above and to one side, built from flat layered planes and extruded volumes resting on an isometric ground, with clean parallel edges that show depth and elevation.\n\nSubject: a single tall extruded cube rising from the centre of an otherwise empty flat isometric base plate, one form emerging where there was nothing. Represents building from zero to one.",
      "rules": true
    },
    "The work": {
      "pre": "Single thin line icon: one uniform black stroke about 1.5px wide, clean and precise, no fill of any kind, on a pure flat white #FFFFFF background, one icon centred in a square frame with generous padding. Refined, technical and minimal, like a premium architectural icon set.\n\nIsometric mode: draw the subject in a true isometric projection, axes at 30 degrees from the horizontal and 120 degrees apart, equal foreshortening on all three axes, as if seen from above and to one side, built from flat layered planes and extruded volumes resting on an isometric ground, with clean parallel edges that show depth and elevation.\n\nSubject: a neat stack of offset flat isometric cards, the top card lifted and floating slightly above the rest of the pile. Represents the body of work, the case studies.",
      "rules": true
    },
    "Motion": {
      "pre": "Single thin line icon: one uniform black stroke about 1.5px wide, clean and precise, no fill of any kind, on a pure flat white #FFFFFF background, one icon centred in a square frame with generous padding. Refined, technical and minimal, like a premium architectural icon set.\n\nIsometric mode: draw the subject in a true isometric projection, axes at 30 degrees from the horizontal and 120 degrees apart, equal foreshortening on all three axes, as if seen from above and to one side, built from flat layered planes and extruded volumes resting on an isometric ground, with clean parallel edges that show depth and elevation.\n\nSubject: a flat isometric tile with a small solid sphere arcing above it along a dotted curved trajectory, rising and falling. Represents motion and animation.",
      "rules": true
    }
  },
  {
    "id": "pl-portfolio-line-icons-flat",
    "group": "Portfolio line icons",
    "eyebrow": "Flat",
    "title": "Flat mode",
    "summary": "Objects and UI glyphs front-facing and flat: about, search, contact, software, read, listen, global, prototype, business, users, product, craft, code, idea, time, schedule, camera, music, location, award, feedback. Copy-paste ready.",
    "About": {
      "pre": "Single thin line icon: one uniform black stroke about 1.5px wide, clean and precise, no fill of any kind, on a pure flat white #FFFFFF background, one icon centred in a square frame with generous padding. Refined, technical and minimal, like a premium architectural icon set.\n\nFlat mode: draw the subject straight-on and front-facing in flat 2D with no perspective, a single clean silhouette line icon.\n\nSubject: a simple person, a circle for the head above a wide rounded arc for the shoulders. Represents the person behind the work, the about section.",
      "rules": true
    },
    "Search": {
      "pre": "Single thin line icon: one uniform black stroke about 1.5px wide, clean and precise, no fill of any kind, on a pure flat white #FFFFFF background, one icon centred in a square frame with generous padding. Refined, technical and minimal, like a premium architectural icon set.\n\nFlat mode: draw the subject straight-on and front-facing in flat 2D with no perspective, a single clean silhouette line icon.\n\nSubject: a magnifying glass, a clean circle lens with a short straight diagonal handle. Represents search.",
      "rules": true
    },
    "Contact": {
      "pre": "Single thin line icon: one uniform black stroke about 1.5px wide, clean and precise, no fill of any kind, on a pure flat white #FFFFFF background, one icon centred in a square frame with generous padding. Refined, technical and minimal, like a premium architectural icon set.\n\nFlat mode: draw the subject straight-on and front-facing in flat 2D with no perspective, a single clean silhouette line icon.\n\nSubject: a paper plane folded from a single flat triangle, tilting upward, with a short dotted motion trail behind it. Represents getting in touch.",
      "rules": true
    },
    "Software": {
      "pre": "Single thin line icon: one uniform black stroke about 1.5px wide, clean and precise, no fill of any kind, on a pure flat white #FFFFFF background, one icon centred in a square frame with generous padding. Refined, technical and minimal, like a premium architectural icon set.\n\nFlat mode: draw the subject straight-on and front-facing in flat 2D with no perspective, a single clean silhouette line icon.\n\nSubject: a desktop monitor, a rounded rectangle screen on a short central stand and small base. Represents the software and the craft tools.",
      "rules": true
    },
    "Read": {
      "pre": "Single thin line icon: one uniform black stroke about 1.5px wide, clean and precise, no fill of any kind, on a pure flat white #FFFFFF background, one icon centred in a square frame with generous padding. Refined, technical and minimal, like a premium architectural icon set.\n\nFlat mode: draw the subject straight-on and front-facing in flat 2D with no perspective, a single clean silhouette line icon.\n\nSubject: an open book seen from the front, two facing pages meeting at a soft central spine. Represents reading a case study, read mode.",
      "rules": true
    },
    "Listen": {
      "pre": "Single thin line icon: one uniform black stroke about 1.5px wide, clean and precise, no fill of any kind, on a pure flat white #FFFFFF background, one icon centred in a square frame with generous padding. Refined, technical and minimal, like a premium architectural icon set.\n\nFlat mode: draw the subject straight-on and front-facing in flat 2D with no perspective, a single clean silhouette line icon.\n\nSubject: a small right-pointing play triangle beside four vertical sound-wave bars of varying heights. Represents the spoken narration, listen mode.",
      "rules": true
    },
    "Global": {
      "pre": "Single thin line icon: one uniform black stroke about 1.5px wide, clean and precise, no fill of any kind, on a pure flat white #FFFFFF background, one icon centred in a square frame with generous padding. Refined, technical and minimal, like a premium architectural icon set.\n\nFlat mode: draw the subject straight-on and front-facing in flat 2D with no perspective, a single clean silhouette line icon.\n\nSubject: a globe, a clean circle crossed by a few curved latitude and longitude lines. Represents a global, worldwide reach.",
      "rules": true
    },
    "Prototype": {
      "pre": "Single thin line icon: one uniform black stroke about 1.5px wide, clean and precise, no fill of any kind, on a pure flat white #FFFFFF background, one icon centred in a square frame with generous padding. Refined, technical and minimal, like a premium architectural icon set.\n\nFlat mode: draw the subject straight-on and front-facing in flat 2D with no perspective, a single clean silhouette line icon.\n\nSubject: a rounded-rectangle phone screen with a bold right-pointing play triangle centred on it and a small cursor arrow near its lower-right corner. Represents an interactive prototype.",
      "rules": true
    },
    "Business": {
      "pre": "Single thin line icon: one uniform black stroke about 1.5px wide, clean and precise, no fill of any kind, on a pure flat white #FFFFFF background, one icon centred in a square frame with generous padding. Refined, technical and minimal, like a premium architectural icon set.\n\nFlat mode: draw the subject straight-on and front-facing in flat 2D with no perspective, a single clean silhouette line icon.\n\nSubject: a briefcase, a rounded-rectangle case with a short handle on top and a horizontal seam across the middle. Represents business.",
      "rules": true
    },
    "Users": {
      "pre": "Single thin line icon: one uniform black stroke about 1.5px wide, clean and precise, no fill of any kind, on a pure flat white #FFFFFF background, one icon centred in a square frame with generous padding. Refined, technical and minimal, like a premium architectural icon set.\n\nFlat mode: draw the subject straight-on and front-facing in flat 2D with no perspective, a single clean silhouette line icon.\n\nSubject: two overlapping person figures, each a circle head above a wide rounded shoulder arc, one set slightly behind and to the side of the other. Represents users, a group of people.",
      "rules": true
    },
    "Product": {
      "pre": "Single thin line icon: one uniform black stroke about 1.5px wide, clean and precise, no fill of any kind, on a pure flat white #FFFFFF background, one icon centred in a square frame with generous padding. Refined, technical and minimal, like a premium architectural icon set.\n\nFlat mode: draw the subject straight-on and front-facing in flat 2D with no perspective, a single clean silhouette line icon.\n\nSubject: a simple closed box seen from the front, a square with a lid seam across the top and a short strip of tape running down the centre. Represents the product.",
      "rules": true
    },
    "Craft": {
      "pre": "Single thin line icon: one uniform black stroke about 1.5px wide, clean and precise, no fill of any kind, on a pure flat white #FFFFFF background, one icon centred in a square frame with generous padding. Refined, technical and minimal, like a premium architectural icon set.\n\nFlat mode: draw the subject straight-on and front-facing in flat 2D with no perspective, a single clean silhouette line icon.\n\nSubject: a broad-nibbed pen tip, a narrow tapering triangle with a slit down its centre and a small round vent hole where the slit ends. Represents the craft, the drawing itself.",
      "rules": true
    },
    "Code": {
      "pre": "Single thin line icon: one uniform black stroke about 1.5px wide, clean and precise, no fill of any kind, on a pure flat white #FFFFFF background, one icon centred in a square frame with generous padding. Refined, technical and minimal, like a premium architectural icon set.\n\nFlat mode: draw the subject straight-on and front-facing in flat 2D with no perspective, a single clean silhouette line icon.\n\nSubject: two angle brackets facing away from each other with a single forward slash leaning between them, each stroke ending in a square cap. Represents code and building in the browser.",
      "rules": true
    },
    "Idea": {
      "pre": "Single thin line icon: one uniform black stroke about 1.5px wide, clean and precise, no fill of any kind, on a pure flat white #FFFFFF background, one icon centred in a square frame with generous padding. Refined, technical and minimal, like a premium architectural icon set.\n\nFlat mode: draw the subject straight-on and front-facing in flat 2D with no perspective, a single clean silhouette line icon.\n\nSubject: a light bulb, a circle sitting on a short square base of two horizontal bars, with three short rays spaced evenly around the upper half. Represents an idea, the spark of a concept.",
      "rules": true
    },
    "Time": {
      "pre": "Single thin line icon: one uniform black stroke about 1.5px wide, clean and precise, no fill of any kind, on a pure flat white #FFFFFF background, one icon centred in a square frame with generous padding. Refined, technical and minimal, like a premium architectural icon set.\n\nFlat mode: draw the subject straight-on and front-facing in flat 2D with no perspective, a single clean silhouette line icon.\n\nSubject: a clock face, a plain circle with two straight hands from the centre, a short one and a long one, set apart by a right angle. Represents time and how long something takes.",
      "rules": true
    },
    "Schedule": {
      "pre": "Single thin line icon: one uniform black stroke about 1.5px wide, clean and precise, no fill of any kind, on a pure flat white #FFFFFF background, one icon centred in a square frame with generous padding. Refined, technical and minimal, like a premium architectural icon set.\n\nFlat mode: draw the subject straight-on and front-facing in flat 2D with no perspective, a single clean silhouette line icon.\n\nSubject: a calendar, a rounded-rectangle sheet with a horizontal rule below the top edge, two short vertical binder tabs standing above that edge, and a fine even grid of small squares below it. Represents a scheduled slot, planning ahead.",
      "rules": true
    },
    "Camera": {
      "pre": "Single thin line icon: one uniform black stroke about 1.5px wide, clean and precise, no fill of any kind, on a pure flat white #FFFFFF background, one icon centred in a square frame with generous padding. Refined, technical and minimal, like a premium architectural icon set.\n\nFlat mode: draw the subject straight-on and front-facing in flat 2D with no perspective, a single clean silhouette line icon.\n\nSubject: a camera body, a landscape rounded rectangle with a small raised viewfinder bump on its top edge, a concentric circle lens centred on the face and a small dot to one side of the top edge. Represents capture, photography and visual reference.",
      "rules": true
    },
    "Music": {
      "pre": "Single thin line icon: one uniform black stroke about 1.5px wide, clean and precise, no fill of any kind, on a pure flat white #FFFFFF background, one icon centred in a square frame with generous padding. Refined, technical and minimal, like a premium architectural icon set.\n\nFlat mode: draw the subject straight-on and front-facing in flat 2D with no perspective, a single clean silhouette line icon.\n\nSubject: two quarter notes joined by a single straight beam across their top, each stem ending in a small circular note head. Represents sound, music and the mixing work.",
      "rules": true
    },
    "Location": {
      "pre": "Single thin line icon: one uniform black stroke about 1.5px wide, clean and precise, no fill of any kind, on a pure flat white #FFFFFF background, one icon centred in a square frame with generous padding. Refined, technical and minimal, like a premium architectural icon set.\n\nFlat mode: draw the subject straight-on and front-facing in flat 2D with no perspective, a single clean silhouette line icon.\n\nSubject: a map pin, a teardrop with a rounded top narrowing to a point at the bottom, holding one small concentric circle in its upper half. Represents place, a location on a map.",
      "rules": true
    },
    "Award": {
      "pre": "Single thin line icon: one uniform black stroke about 1.5px wide, clean and precise, no fill of any kind, on a pure flat white #FFFFFF background, one icon centred in a square frame with generous padding. Refined, technical and minimal, like a premium architectural icon set.\n\nFlat mode: draw the subject straight-on and front-facing in flat 2D with no perspective, a single clean silhouette line icon.\n\nSubject: an award medal, a circle with two short ribbon strips angling down and apart from its lower edge, each ending in a notched V. Represents recognition and awarded work.",
      "rules": true
    },
    "Feedback": {
      "pre": "Single thin line icon: one uniform black stroke about 1.5px wide, clean and precise, no fill of any kind, on a pure flat white #FFFFFF background, one icon centred in a square frame with generous padding. Refined, technical and minimal, like a premium architectural icon set.\n\nFlat mode: draw the subject straight-on and front-facing in flat 2D with no perspective, a single clean silhouette line icon.\n\nSubject: a speech bubble, a rounded rectangle with a short tail dropping from its lower-left corner, holding three evenly spaced dots in a horizontal row. Represents feedback, critique and conversation.",
      "rules": true
    }
  }
];
