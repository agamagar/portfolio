# Pepo menu 45-degree shots · research dossier
_Researched 2026-10-02. Sources listed at the bottom, numbered; cite by number inline._

Scope: hero menu and social shots for Pepo House (drinks in tall glasses, fries in bowls, burgers, pasta in bowls, pizza on boards, sandwiches), shot at the "45-degree" or "three-quarter" angle, generated with FLUX image models and possibly animated with FLUX 3 Video. Model mechanics (no negative prompts, no seed on video, prompt rewriting, first-frame behaviour) are in flux3-video.md and models.md and are not repeated here.

## What the medium actually is

**The angle.** Food educators treat "three-quarter" as a band, not a number: the camera sits anywhere from 25 to 75 degrees to the subject, and "45-degrees is the most common angle for commercial food photography" because it shows "the front and surface of the dish, as well as the sides" [4]. It is the diner's seated view of the plate (inference from [4], which frames it as a natural, versatile view).

**Dish by dish.** Educators split the menu by height:
- Tall or stacked items (burgers, sandwiches, pancake stacks) are recommended at straight-on, not 45: straight-on is "most suitable for 'tall' foods, like burgers" [4] and shows height and layers [6].
- Bowls with layered contents (salads, so by inference pasta and fries in bowls) suit the 45 to show the surface and the bowl wall [4].
- Flat foods with toppings (pizza) are named under overhead, not 45 [4].
- Drinks in tall glasses: nothing solid found in a fetched source. Inference: a tall glass behaves like a tall food, so the 45 should sit at the low end of the band (closer to 25 to 30 degrees) or the glass rim will dominate.
- Consequence for a single "45-degree menu" template: one angle across the whole menu is a brand-consistency choice, not what a photographer would pick per dish. The template needs per-dish height wording (see clauses).

**The lens.** At 45 degrees distortion is most visible. Rachel Korinek: wider lenses (50mm, 60mm) "don't provide as flattering an image when used to capture your dish at 45 degrees", and a 90 to 105mm focal length gives "much flattering images" [5]. Amie Prescott uses 70 to 120mm full-frame for straight-on shots to compress the scene and reduce distortion [6]. So the real look is a short telephoto from a few feet back: compressed, verticals near-parallel, little bowl-rim stretch.

**Negative space.** Korinek drops to a 50mm when "negative space is key" and when "looking to add a text element as an overlay" [5]. The real medium trades distortion for room: a centred dish with open space for a price or name is shot looser and wider, then the 45 is softened.

**Instagram 4:5.** Meta's Instagram feed spec recommends 4:5 at 1440 x 1800 px [7]. Meta's creative advice on that page is general ("an interesting image of a product" [7]); it says nothing on negative space, centring or props. Nothing solid found from Meta on food composition. Prop restraint rests on educators: the background should complement, "the subject is what should be really standing out" [6].

## Vocabulary worth putting in prompts

| TERM | meaning | why a model responds | source # |
| - | - | - | - |
| three-quarter angle | camera 25 to 75 degrees above the table plane | standard photographic term; models trained on captioned stock likely saw it (inference) | 4 |
| 45-degree angle | the commercial default inside that band | most common commercial food angle, so heavily represented (inference) | 4 |
| high angle | camera looks downward | a BFL-documented angle term, matches their vocabulary | 1 |
| center framing | subject locked in the middle | BFL's own definition: "Keeps the subject locked in the middle" | 1 |
| symmetry | mirrored shapes for precision | BFL-documented composition term | 1 |
| negative space | open space around the subject | BFL-documented: "Leaves open space around the subject" | 1, 5 |
| 100mm lens / short telephoto | compressed perspective, low distortion | BFL says to use lens terms like "85mm lens" for photographic results | 3, 5, 6 |
| straight-on / eye level | camera level with the food | BFL's "eye level" is a neutral height; educators use straight-on for tall foods | 1, 4, 6 |
| shallow depth of field | soft background | BFL-listed photographic term | 3 |
| full shot (adapted) | whole subject visible | BFL's video term for whole-body framing; "whole dish" is our adaptation (inference) | 1 |

## What separates a convincing result from a generic one

1. Compression. Real 45s are shot on 90 to 105mm [5]; a generic render looks like a phone at arm's length, with stretched rims and a bowl that bulges toward the lens. Naming a lens is the lever [3][5].
2. Height-aware angle. Burgers and sandwiches read best straight-on [4][6]; forcing a steep 45 flattens the stack. A convincing template lowers the angle for tall items.
3. Subject dominance. Background and props support, the food stands out [6]. One or two props, none overlapping the dish (inference from [6]).
4. Planned empty space. Space is left deliberately for text, not as an accident [5]; Meta's feed crop is 4:5 [7], so the space should sit above or below the dish, not beside it (inference: a vertical frame has spare height, not width).
5. Whole dish legible. The rim, board edge or glass base all inside the frame; nothing cropped. No fetched source states this as a rule for menu shots; it follows from the menu use case (inference).

## Model-side levers

- **Front-load the angle.** FLUX.2 [pro]/[max]: "Front-load text descriptions for better accuracy" [2]. BFL's suggested order is image type, subject, setting, light, framing, but "put first whatever matters most" [3]. For this template the angle and framing matter most, so they go in sentence one.
- **One framing term, not five.** BFL: "Start with one framing term, one movement term, and one clear subject action. Too many camera instructions in a single sentence usually make the shot less readable" [1]. Written for video, but it argues against stacking "centred, symmetrical, rule of thirds" together.
- **No negative prompts.** FLUX.2 [pro]/[max] has none, and FLUX 3 Image has no `negative_prompt` field [2]. "Not cropped" must be written as a positive: "the whole plate visible with space around it".
- **FLUX 3 Image layout boxes.** BFL documents bounding-box layout; a box of `[150, 150, 850, 850]` "puts the runner in the middle 70% of the frame", and `aspect_ratio` must match the shape the boxes were drawn for [2]. This is the strongest documented lever for centring and whole-dish-in-frame. Whether Palmier exposes it: UNVERIFIED.
- **Kontext / edit models.** Say what changes and state preservation explicitly ("while maintaining the same ...") [2]. For re-angling an existing dish photo, preserve the food, change only the camera.
- **FLUX 3 Video.** The camera-terms page offers high angle, eye level, center framing, symmetry, negative space [1]; no "three-quarter" or "45 degree" term is documented there. Camera lock and first-frame behaviour: see flux3-video.md.
- **Level horizon.** Nothing solid found in BFL docs. Inference: "level", "straight table edge parallel to the bottom of the frame" and "no tilt" are plain-language positives the rewriter should keep, since explicit choices are respected (flux3-video.md).

## Proposed clause upgrades

1. **Camera angle:** "Shot from a three-quarter angle, camera about 45 degrees above the table, on a 100mm lens from a few feet back, so the bowl rim stays round and the sides are compressed; for tall items like burgers, sandwiches and tall glasses, the camera drops lower, nearer eye level, to show the height."
   Rationale: names the band and the commercial default [4], adds the lens that makes 45s flattering [5][3], and lowers the angle for tall foods as educators do [4][6]. Front-loaded per [2].
2. **Centring and framing:** "Center framing: the dish sits in the middle of the frame, alone as the hero, with at most one or two small props kept to the edges and never touching it."
   Rationale: uses BFL's own term "center framing" [1], one framing term only [1], subject dominance per [6].
3. **Whole dish in frame:** "The whole dish is visible, rim, board edge or glass base fully inside the frame, with generous negative space above and below it in a vertical 4:5 frame."
   Rationale: no negative prompts, so cropping is prevented by positive wording [2]; "negative space" is a BFL term [1]; 4:5 is Meta's feed ratio [7]; space for text overlay per [5]. Above-and-below placement is inference.
4. **Level horizon:** "The camera is level, not tilted: the back edge of the table runs straight and parallel to the top and bottom of the frame, and glasses and bottles stand perfectly upright."
   Rationale: nothing solid found in BFL docs for "level horizon"; written as concrete, checkable positives because negatives are unsupported [2] (inference). Long-lens compression keeps verticals straighter [5][6].

## Sources

1. Black Forest Labs, "Camera Terms, Prompts & Examples" (FLUX 3). https://docs.bfl.ai/guides/prompting_video_camera_terms.md
2. Black Forest Labs, prompting unified reference. https://docs.bfl.ai/guides/prompting_unified_reference.md
3. Black Forest Labs, prompting unified building. https://docs.bfl.ai/guides/prompting_unified_building.md
4. Darina Kopcok, "6 Best Food Photography Angles (When to Use Them)", ExpertPhotography. https://expertphotography.com/best-camera-angles-food-photography
5. Rachel Korinek, "4 ultimate food photography lenses", Two Loves Studio. https://twolovesstudio.com/blog/4-ultimate-food-photography-lenses/
6. Amie Prescott, "How to Best Photograph Food with a Straight-On Perspective", PetaPixel, 21 June 2021. https://petapixel.com/2021/06/21/how-best-photograph-food-with-a-straight-on-perspective/
7. Meta, Ads Guide: Instagram Feed image specifications. https://www.facebook.com/business/ads-guide/update/image/instagram-feed

Not used: ice.edu food photography angles page (HTTP 403, not read); BFL Kontext i2i guide URL tried returned 404.
