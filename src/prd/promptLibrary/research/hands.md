# Doodle hands · research dossier
_Researched 2026-08-15. Sources listed at the bottom, numbered; cite by number inline._

## What the medium actually is

### Rubber hose and the four-finger convention

"Rubber hose" is the American cartoon drawing system of the 1920s and early 1930s. Its defining rule is that limbs have **no joints**: arms and legs are drawn as flexible tubes that bend anywhere along their length, "hose-like, flexible tubes" rather than an armature of bones with elbows and knees [1][2]. Everything that follows is downstream of that rule: round simplified forms for head, hands and feet; continuous curves instead of angles; motion that is constant and bouncy; and a deliberate preference for fluidity over anatomical accuracy [1][2]. Bill Nolan is credited with pioneering the approach on *Felix the Cat* around 1919, Disney and Ub Iwerks carried it through *Oswald the Lucky Rabbit* and *Steamboat Willie* (1928), and the style receded through the 1930s as studios moved toward realism and Technicolor [1][2]. Cuphead is the reference-grade modern revival [1][2].

The **four fingers** and the **white glove** are two separate decisions that arrived together. Walt Disney's own stated reason for four is production economics and optical weight: "Five fingers looked like too much on such a little figure, so we took one away. That was just one less finger to animate" [3]. The gloves solved a different problem: in black-and-white cartoons a dark-bodied character's hands vanished against the body and the background, and a white glove restored the separation [3][1]. Both conventions outlived their technical cause and are now carried as homage [3]. Note the honest history: Open Culture also records that white gloves were standard costume in blackface minstrel shows, and that early cartoon audiences overlapped with that audience [3]. Worth knowing, not worth putting in a prompt.

For this library the useful reframing is that four fingers is not a stylisation bolted onto a real hand; it is **the** convention, with a documented rationale about silhouette weight [3][4]. Tutorial practice states the same thing from the drawing side: four fingers "adds dynamism" while reducing complexity, and is the Mickey Mouse and Simpsons convention [4].

### Cartoon hand construction

Every construction account converges on the same two-mass build, in this order:

1. **The palm as a single primitive.** A box, a cup, a flattened disc "similar to a fat burger patty", or an oblong. Fingers to palm sit at roughly a 1:1 length ratio [5][6].
2. **The fingers as one grouped mitten first, then split.** Proko is explicit: start with a mitten shape for the whole finger group to establish the overall silhouette, then divide that shape into individual sausages [5]. Preston Blair's published construction is the same move: begin from a mitten, add the two middle fingers, then place the little finger last, varying its position to avoid monotony [8].
3. **The thumb as a separate mass**, built off a triangular base at the side of the palm, with a trowel-shaped tip [5][6].
4. **Details last, and mostly omitted.** "Don't show all the knuckles. Most of the knuckles are softened to continue the gesture" [5][6].

Two further craft points matter for our sheet. First, the **pinky is deliberately off-rhythm**: placing it unevenly breaks monotony and steers the eye to the main action [4][8]. Second, in the Mickey register the forms are explicitly soft and pliable so they can be "bent, stretched, squashed, twisted" in service of the story, and **gesture beats anatomy** [5].

Silhouette is the acceptance test. Early Disney worked poses as a black shape on white with no interior detail, forcing readability from contour alone [9]. The professional posing order puts hands near the end of the pass and finger detail dead last, on the grounds that intention has to read before refinement, and negative space between forms is what clarifies the action [9]. Practical tests worth borrowing: fill the drawing solid black and see if it still reads; check it small; show it to someone with no context and ask what it is doing [9].

Squash and stretch is the first of the twelve principles, and its non-negotiable is **volume constancy**: as one dimension compresses another expands, so mass never appears to change [10]. It was "greatly exaggerated in classic 1930s rubber hose cartoons" [10], and it applies to small parts, not just whole bodies [10]. For a hand that means a fist reads as a compressed version of the same volume as the open hand, not a smaller hand.

### Line quality

A **monoline** is a tool and a discipline: a pen that produces uniform stroke width regardless of pressure, "one pressure, one line width, no drama", used for technical drawing, minimal art and clean outlines [11]. It is the opposite of comic **inking**, where line weight is varied on purpose: heavy on shadow and weight-bearing contours, thin on detail and lit edges [12, search-level only]. Our sheet is monoline, so the prompt should say the tool as well as the effect.

What makes a monoline look *drawn* rather than *traced* is stroke behaviour, not width variation. Proko's account: confident lines come from single committed movements made from the shoulder and elbow rather than the fingers, rehearsed by ghosting the motion in the air and executed with follow-through so the stroke does not stop dead [13]. The failure signature is the opposite: hesitant strokes "end abruptly and don't meet properly", producing a choppy contour that makes the eye jump [13]. Usefully for us, a gestural drawing can leave lines that do not perfectly connect and still read as confident [13]. That is the aesthetic to ask for: long unbroken committed arcs, small open gaps tolerated, no scratchy repeated searching strokes.

### Gesture legibility

Two gestures are documented as genuinely risky and both are ones a gesture set would obviously include.

- **V sign.** Palm outward is victory or peace. Palm inward is an insult equivalent to the middle finger in the UK, Ireland, Australia, New Zealand and South Africa, and has been read that way for centuries [14]. The entire meaning turns on a detail an image model will not control unless told: **which way the palm faces**.
- **OK sign.** Approval in English-speaking contexts and "everything is OK" in scuba. But it reads as "zero, worthless" in France and Tunisia, as a vulgar or homophobic insult around the Mediterranean and Middle East, and as an evil-eye curse when shaken [15]. Separately, a 2017 4chan campaign attached a white-power reading to it, and the ADL added it to its hate-symbol database in September 2019 while noting it is innocuous in most contexts [15].

I did **not** find a primary source I could fetch for the commonly repeated claim that thumbs-up is obscene in Iran, Afghanistan or parts of West Africa. It appeared only in travel listicles at search-snippet level, so treat it as UNVERIFIED and do not write it into the library prose as fact.

I found **nothing solid** on quantitative research into cartoon hand-signal legibility (recognition rates, silhouette confusion matrices). Animation practice offers the qualitative test [9]; there is no measured study behind it that I could locate.

## Vocabulary worth putting in prompts

| TERM | what it means | why an image model responds to it | source # |
| --- | --- | --- | --- |
| rubber hose | 1920s cartoon system: jointless tube limbs, curves not angles, round simplified forms | Names an entire visual era that is densely labelled in training data; pulls the whole look at once instead of one attribute | 1, 2 |
| four-fingered hand / three fingers and a thumb | The classic convention; states the count two ways | Finger count is the model's single worst failure mode; the redundant phrasing gives it two chances to get 4 | 3, 4, 16 |
| mitten construction | Fingers built as one grouped mass then split into sausages | Biases toward a fused readable finger block instead of independently hallucinated digits | 5, 8 |
| sausage fingers / bulbous rounded tips | Cylinders with rounded ends, no tapering nails | Concrete shape noun; suppresses realistic tapered anatomy | 5, 6 |
| trowel-shaped thumb on a triangular base | The standard cartoon thumb build | The thumb is the mass most often duplicated or misplaced; naming its own construction separates it | 5, 6 |
| softened knuckles | Knuckle detail mostly omitted so the gesture keeps flowing | Kills the interior scribble a model adds when it tries to render anatomy | 5, 6 |
| reads in silhouette / solid-black silhouette test | Pose legible as a filled shape with no interior detail | Pushes fingers apart and away from the palm, which is exactly what prevents finger merging | 9 |
| line of action | One clear energy line through the pose | Produces one committed gesture instead of a limp neutral hand | 9 |
| negative space between fingers | The voids are what clarify the action | Directly counteracts the merged-digit failure | 9 |
| squash and stretch at constant volume | Deform without changing apparent mass | Keeps a fist and an open hand looking like the same hand | 10 |
| monoline pen, uniform stroke width, no pressure variation | Tool that cannot taper | Names the instrument, not just the result; blocks the default tapered-ink look | 11 |
| confident single-stroke contour, drawn from the shoulder, with follow-through | The mechanics of a non-hesitant line | Suppresses the scratchy, repeated, searching stroke look | 13 |
| open trailing wrist / cropped at the wrist | Wrist left open rather than closed off | Removes the arm stump the model otherwise invents | (inference from the reference sheet) |
| palm facing the viewer / palm facing away | Explicit palm orientation | Changes the meaning of the V sign entirely, and disambiguates a shape the model would otherwise pick at random | 14 |

## What separates a convincing result from a generic one

- **The finger count is right and the fingers are separated.** Everything else is cosmetic if this fails. The reference-sheet look depends on four clearly countable digits with visible gaps [3][4][9].
- **Two masses, not five twigs.** A convincing doodle hand has an obvious plump palm and an obvious grouped finger block, built in that order [5][8]. A generic one has fingers of equal weight radiating from nothing.
- **The pinky is off-rhythm.** Evenly fanned fingers read as a template; one finger placed against the pattern reads as drawn [4][8].
- **The pose has one line of action.** Springy exaggeration comes from a single committed curve through wrist to fingertip, not from bending everything a little [9].
- **The line is uniform but not mechanical.** Uniform width from the monoline [11], liveliness from committed long strokes and a slight wobble, with hesitant abrupt joins as the tell of a bad result [13].
- **The interior is empty.** Softened knuckles, no shading, no nails, no palm creases [5][6]. Interior detail is where a model's realism prior leaks back in.
- **Curves, never angles.** Rubber hose forbids the joint; a hand drawn with a hinged wrist immediately leaves the style [1][2].

## Model-side levers

**The hands failure mode, as actually documented.** Three independent explanations, all consistent:

1. *No 3D model of the object.* Prof Peter Bentley (UCL): "These are 2D image generators that have absolutely no concept of the three-dimensional geometry of something like a hand" and "they've got the hang of the general idea of a hand... but none of these models actually understand what the full thing is" [17]. He attributes persistence to data sourcing: it is easy to scrape a million 2D images without context, and fixing it needs 3D geometric training data [17].
2. *Hands are under-represented and occluded in training data.* Stability AI's stated position is that in AI datasets hands appear less visibly than faces and are much smaller in source images [16]. Amelia Winger-Bearskin adds that hands in photographs are usually holding something, partly hidden, or cropped, so the spread-fingered canonical view is rare [16].
3. *Statistical pattern matching with no anatomical reasoning*, plus low-resolution merging of adjacent digits and patch-wise generation that loses global consistency [18, search-level only].

Whether it is fixed: I could not verify any strong claim here. Search-level material asserts 2025-era models improved markedly, but the one page making a specific technical claim about "latent anatomical priors" was not fetchable and is UNVERIFIED [18]. Google's own Nano Banana Pro page does list current limitations (small text fidelity, complex edits, multilingual grammar) and does **not** claim hands are solved [19].

**What the vendor documentation actually supports for our case:**

- **Reference images are first-class.** Nano Banana 2 accepts up to 14 reference images, and the documented practice is to state the role of each one explicitly rather than just attaching it: use image A for pose, image B for style [20]. Our sheet should be named as a strict style reference, not merely attached.
- **Positive framing beats negation.** Google's guidance is explicit: say "empty street", not "no cars" [20]. This argues for replacing negative clauses like "no shading, no colour" with positive statements of the fill and the ground wherever possible, and keeping negation only where the model defaults wrong.
- **Be specific about the subject; avoid quality-word spam.** The current guidance is that descriptive natural language works and "4k, masterpiece, trending on artstation" stacking no longer buys anything [19][20].
- **Character-sheet consistency is a documented technique**: generate the subject from several angles so the model has a fuller understanding, then hold it constant [20][19].
- **The generation formula in the vendor guide** is `[Subject] + [Action] + [Location/context] + [Composition] + [Style]` [20], which matches the library's existing ordering discipline reasonably well.

_(inference)_ Combining the craft and the model side: the silhouette test [9] is unusually well-suited as a prompt clause here, because the thing it forces a human to do (separate the fingers, open the negative space, avoid overlapping masses) is precisely the thing that defeats the documented merged-digit failure [16][18].

## Proposed clause upgrades

1. **Replace** "Exactly four chubby fingers in total (three fingers plus a thumb)" with "**exactly four digits: three fingers and one thumb, four in total, each digit clearly separate with visible negative space between them**". Rationale: finger count is the documented number-one failure [16][17], and adding the separation requirement attacks the merging mechanism directly [9][16]. Sources 9, 16, 17.
2. **Add** a construction clause: "**built with mitten construction: one plump rounded palm mass, then a grouped finger mitten split into four soft sausage forms with rounded tips, and a trowel-shaped thumb on a triangular base at the side of the palm**". Rationale: this is the literal published build order from both Proko and Preston Blair, and it gives the model a shape recipe instead of an adjective [5][8][6]. Sources 5, 6, 8.
3. **Add** "**rubber-hose cartoon drawing: jointless tube-like wrist, continuous curves and no hard angles anywhere**". Rationale: names the era-level style, which carries the whole look, and rules out the hinged realistic wrist [1][2]. Sources 1, 2.
4. **Replace** "springy exaggerated poses with playful cartoon energy" with "**one clear line of action running from wrist to fingertip; the pose reads instantly as a solid black silhouette**". Rationale: swaps two adjectives for the profession's actual acceptance test, and silhouette legibility is what makes the pose readable at thumbnail size [9]. Source 9.
5. **Add** to poses that involve a fist or a squeeze: "**squashed at constant volume, the same mass as the open hand**". Rationale: volume constancy is the stated golden rule of the principle and prevents fists rendering as shrunken hands [10]. Source 10.
6. **Replace** "A single thin, even-weight near-black pen line... Fine pen, never a thick marker" with "**drawn with a fine monoline pen: uniform stroke width throughout, no pressure taper, no swelling on shadow edges**". Rationale: "monoline" is the tool's real name and is the precise antonym of tapered comic inking, which is what the model defaults to [11][12]. Sources 11, 12.
7. **Add** a stroke-quality clause: "**long confident single strokes with follow-through, a slight hand-drawn wobble, small open gaps where strokes meet, never scratchy or repeated searching lines**". Rationale: this is the documented difference between a confident and a hesitant contour, and gestural drawings are allowed non-meeting lines [13]. Source 13.
8. **Replace** the negative pair "no shading, no colour" with the positive "**flat pure white fill inside every closed shape, on a plain white background**", keeping only "**not a photograph, not 3D**" as targeted negation. Rationale: Google's guidance is explicitly to prefer positive framing over negation [20]. Source 20.
9. **Add** "**interior left empty: knuckles softened away, no nails, no palm creases, no fingerprints**". Rationale: softened knuckles is the stated cartoon rule and interior emptiness is where the model's realism prior leaks back in [5][6]. Sources 5, 6.
10. **Add** a pinky clause to the sheet-replication prompts: "**the little finger placed off the rhythm of the other three**". Rationale: both Blair and the tutorial literature name uneven pinky placement as the specific anti-monotony device [8][4]. Sources 4, 8.
11. **Add** an explicit palm-orientation field to the gesture dial: every gesture prompt must state "**palm facing the viewer**" or "**palm facing away**". Rationale: for the V sign this is literally the difference between "peace" and an obscenity in five countries [14]. Source 14.
12. **Add** to the reference-sheet instruction: "**use the attached sheet as a strict style reference: match its line weight, finger proportion and fill exactly; take only the gesture from this prompt**". Rationale: the documented technique is to state each reference image's role rather than just attaching it [20][19]. Sources 19, 20.
13. **Flag in the prose, not the prompt**: the OK-sign gesture carries a documented offensive reading around the Mediterranean and Middle East and an ADL-listed hate-symbol association since 2019, innocuous in most contexts but worth a note beside the gesture set [15]. Source 15.

## Sources

1. Rubber Hose Animation: Full Guide on the Art Style · https://rebusfarm.net/blog/the-rubber-hose-art-style-that-defined-animation · jointless bendy limbs, white gloves, pie-cut eyes, round forms, Fleischer and Disney origins, Cuphead revival.
2. Rubber Hose Animation Guide · https://www.foxrenderfarm.com/news/learn-about-rubber-hose-animation/ · "hose-like flexible tubes" definition, dates (Nolan 1919, Steamboat Willie 1928), minimal backgrounds, decline after the 1930s.
3. Why Cartoon Characters Wear Gloves (Open Culture) · https://www.openculture.com/2017/06/why-cartoon-characters-wear-gloves-a-curious-trip-through-the-history-of-animation.html · the Disney "one less finger to animate" quote, contrast rationale for white gloves, and the minstrel-show context.
4. Cartoon Fundamentals: How to Draw Cartoon Hands (Envato Tuts+) · https://design.tutsplus.com/articles/cartoon-fundamentals-how-to-draw-cartoon-hands--vector-21315 · four-finger convention as dynamism plus simplification, uneven pinky placement, hands as emotional carriers.
5. How to Draw Cartoon Hands (Proko) · https://www.proko.com/course-lesson/how-to-draw-cartoon-hands-comic-cartoon-and-mickey-mouse/ · mitten-then-sausages construction, palm box, separate thumb, softened knuckles, gesture over anatomy, pliable forms.
6. How to Draw Cartoon Hands (Colin Cotterill) · https://www.colincotterill.com/how-to-draw-cartoon-hands/ · oblong and oval palm approaches, gesture meaning of open hand vs fist.
7. (Merged into 5 and 6 during research; the palm-as-disc and 1:1 finger-to-palm ratio phrasing appears in the Proko lesson material at 5.) No separate URL · do not cite independently.
8. Preston Blair archive, AnimationResources.org · https://animationresources.org/category/preston-blair/ · Blair's published hand construction: mitten first, two middle fingers, little finger last with varied position. UNVERIFIED at page level: the specific construction wording was retrieved via search summary of Blair's material, not from a fetched page of the book itself; treat the attribution as sound but the exact phrasing as paraphrase.
9. Silhouette in Animation: Master Readable Poses (Anim.works, Vanessa Ruffra) · https://anim.works/silhouette-in-animation/ · line of action as the pose's backbone, posing order with hands late and finger detail last, negative space, the black-silhouette and no-context readability tests.
10. Mastering the Squash and Stretch Principle (CGWire) · https://blog.cg-wire.com/squash-stretch-principle/ · volume preservation as the core rule, application to small parts, and its exaggerated use in 1930s rubber hose cartoons.
11. What is a Monoline Pen? (Brush Galaxy) · https://www.brushgalaxy.com/procreate-tutorials/what-is-a-monoline-pen/ · monoline defined as uniform width regardless of pressure; uses in technical and minimal line work.
12. Search-level only, not fetched: the monoline-versus-inking line-weight distinction (thick for shadow and weight, thin for detail and light). UNVERIFIED · do not cite as a load-bearing claim.
13. How to Draw Confident Lines: The Tapered Stroke (Proko) · https://www.proko.com/course-lesson/how-to-draw-confident-lines-the-tapered-stroke · confident vs hesitant strokes, choppy contours from abrupt endings, drawing from the shoulder, ghosting, follow-through, gestural lines allowed not to meet.
14. V sign (Wikipedia) · https://en.wikipedia.org/wiki/V_sign · palm-outward victory/peace vs palm-inward obscenity in the UK, Ireland, Australia, New Zealand and South Africa.
15. OK gesture (Wikipedia) · https://en.wikipedia.org/wiki/OK_gesture · approval and scuba meanings; "zero/worthless" in France and Tunisia; vulgar reading around the Mediterranean and Middle East; 2017 4chan campaign and the ADL hate-symbol listing in September 2019.
16. AI Image Generators Keep Messing Up Hands. Here's Why. (BuzzFeed News) · https://www.buzzfeednews.com/article/pranavdixit/ai-generated-art-hands-fingers-messed-up · Stability AI on hands being less visible and smaller in datasets; Winger-Bearskin on hands being occluded in source images.
17. Why AI-generated hands are the stuff of nightmares (BBC Science Focus) · https://www.sciencefocus.com/future-technology/why-ai-generated-hands-are-the-stuff-of-nightmares-explained-by-a-scientist · Prof Peter Bentley quotes on the absence of 3D geometric understanding and why 2D scraping perpetuates it.
18. Search-level only, not fetched (403 / paywalled): claims that patch-based generation, low-resolution digit merging, and 2025-era "latent anatomical priors" explain and fix the hands problem. UNVERIFIED · no claim in this dossier rests on it.
19. Nano Banana Pro prompting tips (Google blog) · https://blog.google/products-and-platforms/products/gemini/prompting-tips-nano-banana-pro/ · be specific about the subject, define each reference image's role, current limitations list which does not claim hands are solved.
20. Ultimate prompting guide for Nano Banana (Google Cloud blog) · https://cloud.google.com/blog/products/ai-machine-learning/ultimate-prompting-guide-for-nano-banana · Nano Banana 2 specs (131,072-token context, up to 14 reference images, 1K/2K/4K), the Subject + Action + Context + Composition + Style formula, style transfer, and the explicit "use positive framing" rule.
