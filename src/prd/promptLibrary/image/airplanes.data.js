// Image-generation prompts: Airplane views.
// { pre } blocks carrying rules:true get the library rules appended at assembly.
// Part of the prompt library (src/prd/promptLibrary). See index.js for the map.

export const SPECS = [
  {
    "id": "pl-airplane-views-system",
    "group": "Airplane views",
    "eyebrow": "Airplane views",
    "title": "Airplane views · the system",
    "summary": "A turnaround system for aircraft: pick an aircraft, a view, and a style, and the prompt assembles below in the interactive picker. The aircraft roster is every major commercial family currently in service (see The fleet). Three styles ship: a thin technical spotter-chart line drawing, a photorealistic all-white studio render, and an art-directed mode with a dropdown library of campaign treatments drawn from current visual trends. Built for image-gen models (e.g. Nano Banana 2 in Figma, or any image model).",
    "What this is": [
      "A roster of real commercial aircraft families in service (Airbus, Boeing, Embraer, Bombardier, Comac, Sukhoi, ATR, De Havilland Canada), each buildable in six views: top, front, side, back, three-quarter, and isometric.",
      "Three styles: Line drawing (a thin, precise, near-black recognition-chart line, matched to the Portfolio line icons), Studio render (a photorealistic all-white configurator render), and Art directed (a dropdown library of campaign treatments).",
      "The picker composes any aircraft, view and style live; only those three change, everything else in each prompt is constant."
    ],
    "Where this comes from": [
      "Retuned 2026-08-15 against research/airplanes.md. The line style is now named as what it really is: a general-arrangement orthographic 3-view, the artefact a manufacturer publishes for airport planning, with a numeric 2:1 line-weight hierarchy because thick-and-thin alone collapses into one weight.",
      "Type identification follows WEFT, the spotter's own system since 1941: wing planform, engine mounting and nacelle cross-section, fuselage length and exit arrangement, tail shape. The single most reliable narrow-body tell is the nacelle cross-section, flat-bottomed on the 737 and circular on the A320.",
      "The white render is a clay-render material, and the background wall stays shadowless because the aircraft is held far off a cyclorama, which is the technique rather than a prohibition.",
      "Neither target model exposes a negative-prompt field, so every prohibition has to sit inside the sentence."
    ],
    "The three dials": [
      "Aircraft: any commercial family from The fleet list below, at family granularity (the A320 family stands in for A319/A320/A321, and so on). Each carries a fixed identity line so the model draws the right silhouette, resolved through one of five categories (single-aisle twinjet, wide-body twinjet, four-engine, rear-engine regional jet, turboprop) that supply the per-view cues.",
      "View: top (plan), front, side (profile), back, three-quarter, or isometric. The four flat views are strictly orthographic; three-quarter and isometric add mild perspective / true isometric.",
      "Style: Line drawing, Studio render, or Art directed (with a campaign dropdown). The shape dials stay identical; only the surrounding look changes."
    ],
    "Studio render style (from the reference)": [
      "One uniform clean white over the whole aircraft: a smooth satin-white fuselage, wings and tail with only soft tonal shading for volume, no colour, no cheatline, no titles.",
      "Soft, even, high-key studio light from the upper front, a gentle broad specular sheen along the top of the fuselage and the leading edges, soft occlusion under the belly and wing root.",
      "Details in restrained near-white and light grey: a smoky dark-tinted cockpit glass, a single neat row of small dark cabin windows, faint panel lines, a subtly outlined forward door.",
      "Floats on a pure white seamless studio background with at most a very soft faint contact shadow. Crisp focus, gear up, no ground or clouds.",
      "Words-only: the render carries no reference image, so the whole look is in the prompt text. Converge by nudging one named token at a time (finish, sheen, shadow, cockpit glass, windows, panel lines, background, camera) in the picker."
    ],
    "Art directed (campaign library)": [
      "A third style with its own dropdown: pick a campaign and the whole treatment swaps, while the aircraft and view stay fixed. A library of art-directed looks pulled from current visual trends, extend it by adding one entry.",
      "Chrome Dream: liquid-chrome Y2K aero, a mirror-polished airframe throwing iridescent reflections.",
      "Riso Press: a two-colour risograph poster, fluoro pink and blue inks, halftone dots and honest misregistration.",
      "Deco Voyage: a vintage Art Deco travel poster, flat geometry, sunburst rays and a warm limited palette.",
      "Golden Hour: a cinematic dusk scene, an amber-to-magenta gradient sky and long warm light.",
      "Aura Glow: the aura aesthetic, a soft glowing gradient halo and dreamy pastel mesh.",
      "Blueprint: a cyanotype engineering blueprint, fine white linework and a faint grid on deep drafting blue.",
      "Inflatable: soft-body 3D, the aircraft as a glossy inflated balloon toy.",
      "Neon Nocturne: a glowing neon-tube outline of the aircraft on deep dark."
    ],
    "The six views": [
      "Top: plan view from directly above, nose up, perfectly symmetrical. The wing planform and engine count do the talking.",
      "Front: head-on elevation. Reads dihedral, engine placement and tail shape.",
      "Side: profile elevation, nose left. The classic identification view, and the best one to generate first.",
      "Back: rear elevation, tail fin centred.",
      "Three-quarter: front-left and slightly above, a gentle hero angle with mild perspective.",
      "Isometric: true 30-degree isometric, no perspective convergence, matches the isometric mode of the Portfolio line icons."
    ],
    "Keeping a set consistent": [
      "Generate the side view of an aircraft first; it fixes proportions best.",
      "Then attach that result as a reference image while generating the other five views of the same aircraft, so nose shape, engine size and tail geometry stay locked.",
      "If one view drifts (three-quarter and isometric drift most), regenerate it with both the side view and the top view attached as references."
    ],
    "Pick a combination": {
      "builder": "airplane-views"
    },
    "Copy-paste template": {
      "pre": "Minimalist technical line illustration of [AIRCRAFT]. Drawn in [VIEW]. Thin, even, near-black ink line (about 1.5px) with rounded caps, precise and confident vector linework, a flat 2D technical drawing with no fills, no shading and no gradients, on a fully transparent background, the aircraft centred in the frame with generous padding. Refined and technical, like a plate from a premium aircraft recognition chart. In clean flight configuration: landing gear retracted and omitted (no wheels), flaps in, no ground, no clouds, no people. {{RULES}}\n\n[AIRCRAFT]: name a commercial family from The fleet list and its identity line, e.g. the Airbus A320 family (a single-aisle narrow-body twinjet with sharklet wingtip fences), the Boeing 787 Dreamliner (a twin-aisle wide-body with raked wingtips and a pointed nose), the Airbus A380 (the double-deck four-engine superjumbo), the ATR 42 or 72 (a high-wing twin turboprop with a T-tail), or the Bombardier CRJ (a slim regional jet with rear-fuselage engines and a T-tail). The picker fills this in for you from the roster.\n\n[VIEW] options: a top view (plan view) seen from directly above: the aircraft pointing straight up in the frame, perfectly symmetrical about its centreline, both wings fully spread, the tailplane at the bottom of the drawing; strictly orthographic, no perspective | a front view (head-on elevation) seen from directly ahead of the nose: the fuselage cross-section at the centre, the wings running out to each side with their natural dihedral, the tail fin rising behind the fuselage; strictly orthographic, no perspective | a side view (profile elevation) seen from directly abeam with the nose pointing left: the full length of the fuselage, the near wing in profile, the tail fin and tailplane at the right; strictly orthographic, no perspective | a rear view seen from directly behind the tail: the tail fin at the centre, the tailplane and the wing trailing edges running out to each side; strictly orthographic, no perspective | a three-quarter view from the front-left and slightly above, a gentle hero angle with very mild perspective: the nose nearest the viewer, both wings visible, the far wing partly foreshortened | a true isometric projection, axes at 30 degrees as if the aircraft sits on an invisible isometric ground plane, no perspective convergence so parallel edges stay parallel: the nose toward the lower left, the tail toward the upper right.\n\nFor the three-quarter and isometric views, swap the flat-2D sentence for: volume described only by clean contour lines.\n\nConsistency tip: generate the side view first, then attach it as a reference image when generating the other five views of the same aircraft, so proportions and details stay locked across the set."
    }
  },
  {
    "id": "pl-airplane-views-fleet",
    "group": "Airplane views",
    "eyebrow": "Airplane views",
    "title": "The fleet",
    "summary": "The full roster the interactive picker draws from: commercial aircraft families currently in service, grouped by segment. Family granularity, so one entry per family, the A320 family entry standing in for the A319, A320 and A321 in both ceo and neo, and so on. Use the picker above to build any of these in any view and style.",
    "How the roster works": [
      "Each family carries an identity line (the silhouette that tells it apart) and a category (single-aisle twinjet, wide-body twinjet, four-engine, rear-engine regional jet, or turboprop) that supplies the per-view cues.",
      "Adding a family in airplaneViews.js adds it to both the picker and this list at once. Length sub-variants that look identical in a drawing are folded into their family."
    ],
    "Mainline jets": [
      "The Airbus A220 (formerly the Bombardier C Series), a single-aisle narrow-body twinjet: a slim tubular fuselage with a pointed nose, low swept wings each carrying one large geared-turbofan engine, small blended winglets, and a tall single swept fin",
      "The Airbus A320 family (A319, A320 and A321, in both ceo and neo), a single-aisle narrow-body twinjet: a smooth tubular fuselage with a rounded nose, low swept wings each with one underslung engine, tall upright sharklet wingtip fences, and a single swept fin",
      "The Airbus A330, a twin-aisle wide-body twinjet: a long wide fuselage, low swept wings each carrying one large engine, small upturned winglets, and a tall swept fin",
      "The Airbus A350, a twin-aisle wide-body twinjet: a long wide fuselage with a smooth pointed nose, gently upswept wings ending in distinctive backswept curved wingtips, one large engine under each wing, and a tall swept fin",
      "The Airbus A380, the double-deck four-engine superjumbo: a very large full-length double-deck fuselage, giant low swept wings carrying two engines on each side, and a huge swept fin",
      "The Boeing 737 (NG and MAX), a single-aisle narrow-body twinjet: a tubular fuselage with a pointed nose, low swept wings each with one underslung engine set close under the wing with a flattened nacelle underside, upward-and-downward split scimitar winglets, and a single swept fin",
      "The Boeing 747 jumbo jet, a four-engine wide-body: a very long fuselage with the iconic raised hump upper deck over the forward section, giant low swept wings carrying two engines on each side, and a tall swept fin",
      "The Boeing 757, a long single-aisle narrow-body twinjet: a notably long slim tubular fuselage with a pointed nose, low swept wings each carrying one large underslung engine, and a tall single swept fin",
      "The Boeing 767, a semi-wide twin-aisle twinjet, a little narrower than the largest wide-bodies: a long rounded fuselage, low swept wings each with one large engine, small winglets, and a tall swept fin",
      "The Boeing 777, a large twin-aisle wide-body twinjet: a very long wide fuselage with a bluntly rounded nose, long low swept wings each carrying one of the largest engines in service, flat-bladed raked wingtips on later variants, and a tall swept fin",
      "The Boeing 787 Dreamliner, a twin-aisle wide-body twinjet: a smooth fuselage with a four-window cockpit and a sharply pointed nose, gracefully raked upswept wingtips, one large engine with a serrated chevron exhaust under each wing, and a tall swept fin",
      "The Comac C919, a single-aisle narrow-body twinjet in the A320 and 737 class: a tubular fuselage with a rounded nose, low swept wings each with one large underslung engine, upturned winglets, and a single swept fin"
    ],
    "Regional jets": [
      "The Embraer E-Jet family (E170, E175, E190 and E195, and the newer E2), a small single-aisle regional twinjet: a compact tubular fuselage, low swept wings each carrying one underslung engine, small winglets, and a single swept fin",
      "The Bombardier CRJ (CRJ700, CRJ900 and CRJ1000), a slim regional jet: a narrow low fuselage with a pointed nose, low lightly swept wings, two engines mounted at the rear of the fuselage, and a T-tail",
      "The Comac ARJ21, a regional jet: a narrow fuselage, low swept wings, two engines mounted at the rear of the fuselage, and a T-tail",
      "The Sukhoi Superjet 100, a small single-aisle regional twinjet: a slim tubular fuselage with a pointed nose, low swept wings each carrying one underslung engine, upturned winglets, and a single swept fin"
    ],
    "Turboprops": [
      "The ATR 42 and ATR 72, twin-engine regional turboprops: a slim fuselage, straight high-mounted wings each carrying one turboprop engine with a six-blade propeller, and a T-tail",
      "The De Havilland Canada Dash 8 (Q400), a twin-engine regional turboprop: a long slim fuselage, straight high-mounted wings each carrying one turboprop engine with a large six-blade propeller on a long nacelle, and a tall T-tail"
    ]
  }
];
