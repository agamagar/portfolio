# Avatar roles research dossier
_Researched 2026-10-07. Sources listed at the bottom, numbered; cite by number inline._

## What the medium actually is
A collectible-figure convention: one fixed head sculpt, sold in many roles, each role carried by headwear, face details and one accessory part. Here the head is the site avatar (base-v2) at one age; framing is head only, so the role must read from the head and one floating prop.

## Vocabulary worth putting in prompts
| TERM | meaning | why a model responds | source # |
|---|---|---|---|
| LED pictograph visor | Guy-Manuel de Homem-Christo's Daft Punk helmet visor shows images, never words | lets the helmet carry his face without text | [1] |
| gold helmet / silver helmet | Guy-Man gold with LED display; Thomas silver, inspired by Gort (The Day the Earth Stood Still) | names the two looks | [1] |
| character + parts | name the film character AND its visible parts (fedora, whip; round glasses, scar) | parts survive if a model declines the name | inference |

## What separates a convincing result from a generic one
- One prop, small, in the same toy finish: reads as the figure's accessory, not a collage.
- Film picks are the ones recognisable from the head alone (hat, glasses, hair shape, face paint) plus one prop. A character whose signature is a body costume would not survive the crop. Popularity was judged, not measured (inference).

## Model-side levers
- Edit-chain from base-v2, never the drawing (ledger 2026-10-07).
- Image models may decline named copyrighted characters; keep the parts list complete so the name can be dropped. UNVERIFIED per model.

## v2 (2026-10-08): the Away / Airbnb icon recipe
v1 (head + one floating prop) was "too basic". v2 builds each role like an Away product icon (image/icons.data.js, "Away · icon system", whose reference sets were Away product renders and the Airbnb service-icon set): a miniature vignette with the head as hero; the most universally recognised object for the role (the global rule); one hero object plus at most two props, bold silhouette, negative space (composition rule); one characterful detail that adds meaning; the Away colour themes as a dial. Airbnb's own framing: the 3D icons are "a universal language" with "a ton of utility" and "playful" (Teo Connor, VP design) [4]; a shift "away from generic geometric designs and toward texture and form" (Brian Chesky, via [5]); the house icon's door pops open and its porch light comes on (Bloomberg) [6], which is the model for the ALIVE clause.

## v2.2 (2026-10-08): the face emotes to the setting
Each role carries one emotion that is a reaction to its own scene, written as the toy face's parts (brow bars, lids, cheeks, mouth) and a gaze aimed at the scene's alive detail, so the feeling reads as caused. The parts follow FACS action units [7]: surprise = brows raised + upper lids raised + jaw dropped (AU1+2+5+26); happiness = cheek raiser + lip-corner puller (AU6+12), which on a bead-eyed toy reads as eyes squeezed into crescents; sadness and worry use the inner brow raised and pinched (AU1+4). The range is spread across the set (delight, sleepy content, awkward, focus, surprise, wonder, effort, alarm, puzzlement, calm, mischief, snarl, amusement) so no two neighbours share a face.

## Sources
1. Gulf News, What's inside the helmets of Daft Punk (Tony Gardner, Alterian): https://gulfnews.com/entertainment/whats-inside-the-helmets-of-daft-punk-1.1284812 (via search summary: Thomas silver after Gort; Guy-Man gold, "never a word on his face", pictographs only).
2. The Playground, Daft Punk 2005 prototype helmet sketches: https://theplayground.co.uk/?p=53253 (Alterian built the helmets).
4. It's Nice That, Airbnb app redesign (May 2025): https://www.itsnicethat.com/articles/airbnb-app-redesign-140525 (via search summary).
5. One Thing newsletter, Airbnb's relaunch and the texture era of design: https://onethingnewsletter.substack.com/p/airbnbs-relaunch-and-the-texture (via search summary; Chesky quote relayed, UNVERIFIED at source).
6. Bloomberg, Big Tech is dealing flat design a death blow (June 2025): https://www.bloomberg.com/news/articles/2025-06-13/apple-airbnb-ditch-flat-app-icons-for-new-3d-ui-design (via search summary).
7. Wikipedia, Facial Action Coding System (Ekman and Friesen): https://en.wikipedia.org/wiki/Facial_Action_Coding_System (emotion to AU table; via search summary).
