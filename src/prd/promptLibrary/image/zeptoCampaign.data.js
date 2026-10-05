// Image-generation prompts: Zepto campaign tiles. The PROSE half of the group.
// Every copy-paste block, the tile catalog and the template are composed from the
// recipe in ./zeptoCampaignViews.js by ./zeptoCampaign.js, so nothing here is a
// frozen prompt. Part of the prompt library (src/prd/promptLibrary).
// See index.js for the map.

export const SPECS = [
  {
    id: "pl-zepto-campaign-system",
    group: "Zepto campaign tiles",
    eyebrow: "Zepto",
    title: "Zepto campaign tiles · the system",
    summary:
      "Generate the photographic layer of a brand campaign tile: sun-drenched editorial grocery photography living in one purple brand world, with the headline, price and interface chips deliberately left to Figma. Pick a tile type, a subject, a colorway and a reference mode, and the prompt assembles in the interactive picker below. Built for GPT Image 2 in Figma first, in a compact register that fits the prompt field's observed cap, with a full register for surfaces that have room.",
    "What this is": [
      "A campaign-tile system derived by reading a 2025 US grocery rebrand board (Amazon Fresh, by Koto): two greens and an off-white, chunky rounded type doing the talking, hard-sun grocery photography doing the proving, phone screens and price chips floating over the photos.",
      "Translated into Zepto's world: electric violet, deep aubergine and a lilac off-white instead of the two greens, Indian market produce and cutting chai instead of pancakes, delivery crates instead of the green basket. The colour values are stand-ins sampled from this portfolio's own Zepto tokens; swap in the real brand values in zeptoCampaignViews.js and every prompt follows.",
      "The sharpest reading of the reference: its type is not photography. Every headline sits as flat graphic design over a photo or a flat colour field, which is exactly what Figma does natively at perfect fidelity, while text inside a generated image is both vendors' best-documented failure mode. So this system generates only the photography and the blank brand surfaces, and the library's no-text rule stops being a constraint and becomes the design.",
      "Six tile types cover the board: a colour-field packshot (the hero), a crate macro (the basket tile), an edge-to-edge produce wall (the cucumber tile, built to carry a UI chip), a corner peek (the price tile, centre left empty), a street sign (the billboard, its board blank for the campaign line), and a phone in hand (the app-screen tiles, the screen one flat brand field for the UI).",
      "Built on the shared recipe contract (image/recipe.js): adding a subject, a colorway or a whole tile type is one entry in zeptoCampaignViews.js, and it appears in the picker, the written-out catalog and the template at once.",
    ],
    "The constant": [
      "One brand world of three colours: electric violet #7C3AED, deep aubergine #2A1430, soft off-white #F4F1FA. Every manufactured surface (sweep, crate, board, tray) stays flat and clean in those colours; only the produce keeps its own ripe saturated colour, so every tile pops by saturation contrast rather than by hue soup.",
      "One sun. Light is stated as its physical cause, not an adjective: a small undiffused source far from the set, which is what gives the crisp-edged cast shadows the reference runs on. Shadows are tinted toward the violet ambient, never neutral grey, and every object keeps a tight dark contact shadow, the single strongest this-is-really-sitting-there cue.",
      "One lens. About 100mm at working distance, verticals parallel, crisp front to back, clean edges, no grain, no bokeh, no bloom. The reference reads as trade photography, not phone snaps, and the lens clause is what carries that.",
      "One fixed clause order across all six tiles: intended use, reference role, scene and ground, subject, light and shadow, palette, render, then the library rules. Consistent order is what makes a set of prompts diffable when one tile drifts.",
      "Subject cues describe shape only (a hand of bananas as curved fingers joined at one crown), so any subject survives a move between tiles without dragging staging or style along.",
    ],
    "The six tiles": [
      "Colour-field packshot: one subject low on a seamless brand-colour sweep, about a stop of falloff, the upper third left empty for the headline. The hero tile.",
      "Crate macro: tight into a perforated brand-colour delivery crate packed with produce, sun dropping a gobo-like shadow pattern through the perforations. The texture-and-appetite tile.",
      "Edge-to-edge produce: one subject repeated as a dense market wall, no ground, no hero piece, even density, built so a small price or product chip can sit over any part of it in Figma.",
      "Corner peek: a flat unbroken colour field with two or three subjects pushing in from the corners, cropped mid-object, the centre 60 percent left as one clean field for a large price or word.",
      "Street sign: a blank freshly painted brand-colour signboard on a sun-baked brick or plaster wall, shot straight on, crates below, foliage shadow raking one corner. The out-of-home tile, its board empty for the campaign line.",
      "Phone in hand: one hand from the lower right holding a generic slab phone square to camera on the contrasting brand sweep, the screen one flat field of the colorway with a single soft glass highlight, no icons and no text, the subject at the base as the delivered goods. The app-screen tile, built as a screen-replacement plate: the UI is set over the flat field in Figma. The lifestyle moments that once hung off this tile (bed, commute, party, Sunday planning, office, morning counter, guests) are now their own system, Schedule images, further down the rail.",
    ],
    "The dials": [
      "Subject: ten seeded Zepto-flavoured objects (mangoes, bananas, tomatoes, strawberries, cucumbers, coriander, eggs, a meal bowl, cutting chai, a kraft grocery bag) or [SUBJECT] free text, each carried by a shape-only cue.",
      "Tile: which of the six stagings above. This is the style axis: it changes the scene, never the brand world.",
      "Colorway: which of the three brand colours carries the manufactured surfaces in that tile (the sweep, the crate, the board). The produce ignores the dial and keeps its ripe colour.",
      "Reference: words only; anchor mode; or moodboard mode, which attaches one REAL photograph for its photographic quality only (skin texture, grain, grade, contrast, framing) and takes none of its content; the compact render clause drops because the photo carries the lens feel. Anchor mode is which names an attached image's role out loud: match its palette, sun and shadow tint exactly, take nothing else from it. Generate the hero tile first, then anchor every other tile to it; re-anchor to that same tile rather than chaining each new result onto the last, because long chains are documented to drift.",
      "Length: compact, the default, the whole tile in under 1,000 characters for Figma's image prompt field; or full, every clause spelled out for surfaces without a cap.",
    ],
    "Two registers": [
      "Compact: the non-negotiables front-loaded (use, scene, subject, light, palette), explanatory sub-clauses dropped, rules kept. Written for GPT Image 2, which follows dense prose faithfully and only lightly rewrites. The 1,000-character ceiling is an observed working number, not a documented one: no Figma source states a limit, and the figure that circulates online is Adobe Firefly's. The models themselves have far more room.",
      "Full: the same clauses with their reasoning restored, around 2,000 characters, for models and fields with no cap, or when a compact result drifts and needs the explanatory sub-clauses back.",
      "Both registers compose from the same dials, so a set can be generated compact and one stubborn tile regenerated full without changing worlds.",
    ],
    "Why the type is not generated": [
      "Text inside a generated image is the one failure mode both OpenAI and Google document by name: misspellings, extra characters, grammar drift in small or dense text. The reference board's entire typographic voice is flat type over photography, which Figma sets natively, at any size, in the actual brand face, editable forever.",
      "Splitting the layers also makes the set art-directable: one generated photograph can carry three different headlines across three placements, and a price change is a text edit, not a regeneration.",
      "So every tile arrives with its clear space stated in the prompt (the empty upper third, the empty centre, the blank board), and the group's extra rule keeps every in-scene surface blank so nothing collides with the type layer.",
    ],
    "Keeping a set consistent": [
      "Generate the colour-field packshot first: it is the simplest scene, so it fixes the palette, the sun and the shadow tint most reliably. That render becomes the anchor.",
      "Then switch the reference dial to anchor mode and attach that tile while generating the other four, so the world stays locked while the staging changes.",
      "Change one dial at a time between generations. A tile that moves subject, colorway and staging at once is a new campaign, not a new tile.",
      "Re-anchor, never chain: always attach the original anchor tile, not the latest output, because chained edits are documented to accumulate drift.",
      "If a tile drifts on a surface that rewrites prompts, the invariants (sun, shadow tint, the three hexes) are deliberately short and early so they survive the rewrite; restate them verbatim rather than paraphrasing.",
    ],
    Sources: [
      "Derived 2026-08-16 by reading an eight-tile 2025 grocery rebrand campaign board (Amazon Fresh, by Koto): a produce-filled brand-colour basket macro, an app screen on a brand field, a meal packshot beside display type, repeated wordmark type, a produce wall carrying a price chip, a price tile with corner strawberries, a delivery-tracking screen, and a painted billboard on brick.",
      "Light, shadow and lens clauses follow research/composition.md: hard shadow stated as its cause (small undiffused source far from the set), the contact shadow called out separately, shadows tinted with the scene's ambient rather than grey, about a stop between subject and ground, long lens with parallel verticals.",
      "Prompt architecture follows research/models.md: one fixed clause order (rule 2), intended use stated first (rule 3), every reference's role named in the text (rule 4), invariants restated verbatim per generation (rule 5), positive description with only targeted negations (rule 6), compact register short and front-loaded (rule 10), the 1,000-character cap treated as observed and unsourced (rule 12), anchor-first set consistency with re-anchoring over chaining (rule 20).",
      "Colour values are stand-ins sampled from this portfolio's own Zepto tokens (#7C3AED accent, #2A1430 wash) pending real brand values.",
      "The phone-in-hand tile follows research/zepto-campaign.md (18 sources, 2026-08-16): screen replacement is the trade name for shooting a device with a deliberately empty display and dropping the interface in afterwards; the hand-model brief supplies the grip (firm yet delicate, fingers relaxed and curved, thumb on the side rail, clean short nails, no rings, plain sleeve); Apple's marketing guidance argues for a straight-on phone with no keystone and no maker's cues on a generic device; Google's prompt guide argues for describing the empty screen positively rather than only negating. The pro plate is a switched-off black glass; ours is a flat colorway field because the whole group ships blank brand surfaces for a Figma overlay. The 100mm lens is the group's, not the dossier's: no source documents a lens for phone-in-hand work.",
      "Tuned for GPT Image 2 in Figma first; the full register suits Nano Banana 2 or any image surface without a client-side cap.",
    ],
  },
];
