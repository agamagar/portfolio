# Plan: from the canonical head to the 12-head fidelity target (`goldens/target-fidelity-sheet.png`)

Honest state: `goldens/target-vs-ours-chef.png` puts the target's chef head beside the current canonical head with a chef hat (Eevee, headless). It is
NOT close. The gap is modelling, not rendering:
- **Proportions:** the target head is a broad, soft block: big cranium, full rounded jaw, ears about 1.5x ours with a sculpted inner fold, features
  small and set low. Ours has narrower cheeks, small ears (a ring with a flat inner disc), and a thin cone nose with a visible seam.
- **Features:** the target's nose is one soft rounded form that bulges off the cheek; brows are thick rounded pills standing proud; the smile is a
  carved arc with soft lips; the eyes are glossy black beads with a crisp highlight. Ours are thin and flat, and the skin is overexposed.
- **Hair/hat:** the target hair is one big glossy swoosh with a clean silhouette over a smooth hairline; the chef hat is a band plus five fat puffs. Ours
  is the old quiff mesh under a hat that does not sit on the head.
- **Light:** soft, low-contrast studio light on light grey, a mild rim, form read from gentle shading. Ours has hard highlights and a flat face.

## What reaches all 12 looks (in order)
1. **Sculpt the canonical head to the target's proportions** in Blender (live MCP, `SkinCanon`): scale and shape the cranium/jaw, enlarge and re-sculpt the ears
   (inner fold as real geometry), rebuild the nose as a soft form with a seamless bridge, brow pills and a carved smile as modelled geometry on the
   head (not textures), bead eyes with highlight, and clay lids that close over the beads. Keep the mirror-exact topology and one UV layout.
2. **Skin = material, not projection**: one clay shader per skin tone (flat colour, subtle noise normal, SSS warmth). Details are decals/normal maps on the
   single UV layout: freckles, vitiligo patches, a birthmark, wrinkles, stubble (a shell mesh already exists in `features/parts`), a small scar.
3. **Hair library as sculpted clay**: swoosh quiff (silver and brown), curls (clustered spheres), short fade, locs (tube chain), bald. Port the
   builders in `morph/plastHair.js` to Blender so the three.js and Eevee shapes match, or bake the Blender hair to GLB.
4. **Accessories as parts on named anchors** (chef hat, turban, knit taqiyah with perforation, helmet with strap, round glasses, beard, moustache,
   hearing aid, cochlear implant, nasal cannula): the part library in `src/figures/faces/features/parts` already has turban, taqiyah, glasses,
   beard, moustache; new: chef hat, helmet, hearing aid, cochlear implant, cannula, knit pattern.
5. **Expressions**: ARKit 52 on the canonical head, plus an open-mouth sculpt with teeth and tongue for the laughing looks.
6. **Lookdev + goldens**: Eevee turntables per look (front, 3/4 L/R, both profiles, blink, expression peaks); Agam approves; the gate compares three.js
   to these (SSIM / LPIPS).
7. **Export** (gltf-transform: meshopt + KTX2; Khronos validator), then the existing `listSkins/setSkin` and face-JSON API keep working with the new asset.

## What I need decided
- Whether the 12 looks are the new set of "skins" (a preset per look) replacing today's nine fitted skins, or are added alongside. The fitted skins cannot reach
  this fidelity (they are projections), so the clay-family looks should become the product and the old skins remain as legacy styles.
