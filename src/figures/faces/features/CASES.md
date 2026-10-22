# Cases the face system covers (Desi-Log "Ek Log" pack, and the people a photo can show)

Source: the Desi-Log community Figma (Samples, "Make your own"): 72 sample characters and the customiser's variant list (skin tone, expression,
hair, facial hair, accessories: glasses, bindi, tilak, earrings tops / hoops, nose pin). Each is a feature module; a case is a face config.

| Case in the pack | Where it lives |
| --- | --- |
| Skin tones, light peach to deep brown-black, warm/cool | `skin.tone` (8 anchors), `skin.undertone` |
| Hair: bald, boy cut, gelled, balding (+ grey), bun, long straight, side plait, curly, mohawk/undercut, shoulder | `hair.style` (hairStyles/*.js) + length, fringe, messiness, volume, sweep, colour, greying |
| Grey / white hair, grey beards | `hair.greying`, `facialHair.greying` |
| Turban (pagri), prayer cap (taqiyah), hijab, dupatta | `headwear.kind` (parts/headwear-*.js), colour, height, wraps, drop, looseness |
| Stubble, moustache (handlebar), goatee, full beard | `facialHair.kind` (parts/beard-*.js), length, fullness, curl, width |
| Round / rectangular glasses | `accessories.glasses` (parts/glasses-*.js), colour, lens size, frame weight |
| Bindi, tilak | `accessories.bindi`, `accessories.tilak` (parts/bindi-dot.js, tilak-lines.js) |
| Earrings (hoops, studs), nose pin | `accessories.earrings`, `accessories.nosePin` |
| Expressions: smiling, neutral, frown, eyes closed, mouth open | `mouth.smile`, `eyes.openness`, `eyes.smileSquint` (resting), and the emotes on top |
| 14 ready archetypes | `presets/desi-*.json` |

Not covered (head-only rig): clothing, body, neck jewellery (chains), saree pallu, sleeves. The hijab and dupatta drape to the shoulder line.

Adding a case: a part file in `parts/` (a new headwear, beard or glasses shape), a hair style file in `hairStyles/`, or a preset JSON. Nothing in core changes.
