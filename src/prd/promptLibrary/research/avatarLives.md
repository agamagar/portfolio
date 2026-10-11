# Avatar lives research dossier
_Researched 2026-10-07. Sources listed at the bottom, numbered; cite by number inline._

## What the medium actually is
One fixed 3D character (the site avatar, rendered as a glossy designer-toy head, base-v2) shown across many human lives: same face, same render, same framing; only age, skin, hair or headwear, visible aids and marks change. The precedent is the avatar systems that already do this at scale: Apple Memoji added cochlear implants, oxygen tubes and a soft helmet as ordinary customisation options in 2021 [1][2], lobbied for by cochlear implant users' groups since 2018 [3]. Skin tone is set from a published scale, not by eye: Google's Monk Skin Tone scale (10 tones, open, built with sociologist Ellis Monk to represent darker tones better) [4][5].

## Vocabulary worth putting in prompts
| TERM | meaning | why a model responds | source # |
|---|---|---|---|
| behind-the-ear hearing aid | small shell over the ear, thin clear tube into the ear | names the commonest form, not a generic "earpiece" | inference |
| cochlear implant sound processor and coil | unit behind the ear, cable to a round magnetic coil on the side of the head | the coil is the visual signature | [2][3] |
| nasal cannula | thin clear tube looped over the ears into the nose | Memoji's "oxygen tubes" | [1] |
| soft protective helmet | padded fabric headgear for people with epilepsy and other conditions | Memoji option | [1] |
| repaired cleft lip | a fine vertical scar from lip to nostril | specific, avoids a "deformed" read | inference |
| vitiligo | well-defined patches of lighter skin | precise term, models know it | inference |
| port-wine stain | flat wine-red birthmark | precise term | inference |
| MST n (#hex) | Monk Skin Tone step and its hex | a hex anchors the tone; a name alone drifts lighter | [4] |

## What separates a convincing result from a generic one
- Ordinary, not tragic and not heroic: no pity framing, no "inspirational" framing, no forlorn expression, no clinical setting, no dim light [6][7]. In a head-only set that means every life gets the same warm expression, the same eye-level camera and the same light as the base.
- Aids are shown accurately and plainly, as ordinary objects people use [6][8].
- Diversity across the set: range of ethnicity and body, and disability across that range, not only on one tone [6].
- Older people as vibrant and engaged, with independence and dignity, not frail or lonely [9][10].
- Some disabilities are invisible; an "ordinary" version can stand for them, and nothing needs labelling [6].

## Model-side levers
- Chain every prompt from the base-v2 render, never the drawing (ledger, 2026-10-07: mentioning the drawing re-rendered the whole head).
- Hold list first, the one change second: identity + render + framing are constants; only the dials move.
- Skin: name the MST step AND its hex; GPT-family models lighten when given only a word (inference from round tests, UNVERIFIED).
- Age on a toy sculpt: express it in the shapes the toy already has (quiff colour and volume, soft sculpted creases, fuller or rounder cheeks), not photoreal wrinkles, or the material changes.

## Proposed clause upgrades
- DIGNITY constant: "Relaxed and confident, the same warm smile, eye-level camera, same even studio light as every other version; any aid is rendered as precisely as an accessory, neither hidden nor the focus." [6][7][9]
- Skin dial: MST steps 1, 3, 5, 7, 9, 10 with hex [4].
- Aids dial limited to what shows on a head: hearing aid, cochlear implant, low-vision glasses, nasal cannula, soft helmet, repaired cleft lip [1][2].

## Sources
1. TechRadar, Apple expanding Memoji and accessibility features (2021): https://www.techradar.com/news/apple-is-expanding-memoji-and-accessibility-features-in-ios-ipados-and-watchos (cochlear implants, oxygen tubes, soft helmets).
2. Cochlear, Apple's plans recognise people wearing a cochlear implant: https://family-news.cochlear.com/en-uk/apples-plans-recognise-people-wearing-a-cochlear-implant
3. CIICA / EURO-CIU welcomes Memoji depicting a CI user: https://ciicanet.org/2021/05/21/euro-ciu-welcomes-new-apple-memoji-depicting-a-cochlear-implant-user/
4. Wikipedia, Monk Skin Tone Scale: https://en.wikipedia.org/wiki/Monk_Skin_Tone_Scale (10 hex values).
5. Google, Monk Skin Tone scale: https://blog.google/technology/ai/monk-skin-tone-scale/
6. People with Disability Australia, guidelines for images portraying people with disability: https://commonslibrary.org/guidelines-images-portraying-people-with-disability/ (fetched; dos and don'ts).
7. Adobe Stock, disability representation in stock: https://stock.adobe.com/pages/artisthub/learn/disability-representation-in-stock (search result only, not fetched).
8. Disabled And Here (via search summary): avoid the "ableist gaze", inspiration or pity.
9. AARP, Disrupt Aging collection with Getty Images: https://www.aarp.org/press/releases/2019-9-23-aarp-and-getty-images-announce-collaboration-to-change-the-look-of-aging.html (independence, dignity, empowerment).
10. SA Government, Age Positive Communication Toolkit image guidelines: https://dhs.sa.gov.au/__data/assets/pdf_file/0004/179968/Age-Positive-Communication-Toolkit-Image-Guidelines.pdf (search result only, not fetched).
