# Characters in icon systems: research dossier
_Researched 2026-09-04. Sources numbered at the bottom; cite by number inline._

> Scope note: Apple HIG / SF Symbols and Material Design 3 returned no body text; Shopify Polaris redirects to a JS API index; Midjourney's Zendesk docs, Atlassian's Medium post and the Vogue HK Kenny Wong interview returned 403. They are listed as UNVERIFIED at the bottom and nothing here is cited to them. Material Design 1 (static) stands in for Material.

## What the medium actually is

### Line pictogram (the Portfolio line system)
- A pictogram person is an alphabet, not a drawing. Aicher wanted "a font of human body parts": a grid of vertical, horizontal and 45 degree strokes, figures posed at 45 degrees kicking a ball or bent over a bicycle, and the sport read from pose plus equipment [16]. Cooper Hewitt: rules and grids "determine the proportions of heads, torsos, and features" [15].
- The grid is partly a myth. Mark Holt found that any limb built from one orthogonal and one 45 degree segment "cannot be of uniform thickness"; the finished icons contain compromises the theory hides [14]. For prompts: state the axes and the uniform stroke as intent, and expect the model to fudge joints the way Aicher's artworkers did (inference).
- The DOT/AIGA set (34 symbols in 1974, 50 by 1979, 55 referents today) was chosen by scoring semantic, syntactic and pragmatic quality 1 to 5, and Cook and Shanosky "redrew until consent was reached" [12][13]. The figure is "Helvetica Man" [12]; the standard stick figure has a circle head that "can be filled or unfilled", hands, feet and neck "may be present or absent", and a garment (dress) is how a variant is distinguished [17].
- Isotype is the ancestor of props-as-role: a generic "man" acquires meaning through "small variations or additions (such as a cap or standardized signs for various industries)", and pictograms are "simplified pictures of people or things, designed to function as repeatable units" [18][19].
- ISO 7001 symbols must work "without any accompanying text" and read "as small as a floor plan" or "as a giant sign"; its figures are frontal or profile; ISO 3864 safety colours are excluded [21]. The 67 percent comprehension threshold appears only in search snippets: UNVERIFIED.
- Material (v1) on human figures: consistent stroke weight, align elements for silhouette clarity, do not crop limbs, and "add human characteristics only when amplifying icon meaning" [22].

### Glass figurine (the Zepto premium glass system)
- Lalique's earliest glass objects were "small statuettes and figurines" cast by cire perdue (lost wax); production pieces were press-moulded in series; the figures were "vaguely classical nymph or warrior like figures" and kept classical bases and contrapposto "despite being structurally unnecessary in glass" [27].
- The Lalique signature is a figure whose garment is a finish, not a colour: satin frosting on drapery, hair, fur or feathers against polished clear crystal; "the contrast of the satin-finished and shiny crystal magnifies the fineness of the motifs" [28][29]. Quality tells are "silky clarity", "precise mold detail" and crisp frosted transitions [29].
- Lampworking (torch, rods, marver, kiln) is the small-figure craft; soft glass expands more on heating, borosilicate is more forgiving and pricier [30]. Nothing solid found on how a lampworker simplifies a human face or limb; a Murano dealer says human forms are "created in segments and assembled while still malleable" but that page was not fetched: UNVERIFIED.

### Toy figure (the Away toy system)
- Platform toys fix the body and sell the surface. Dunny: "a distinctive bunny-like silhouette", 3 in to 4 ft, "three points of articulation, rotating head and movable arms", vinyl, accessories "from crowns to gas masks" [6]. Munny: 4, 7 and 18 in, "movable joints", a "blank 3D canvas" [7]. Bearbrick: 70 mm at 100 percent, 280 mm at 400, 700 mm at 1000; "nine parts with eight points of articulation"; silhouette fixed since 2001, identity carried by artwork, flocked or chrome material, and add-ons like hats or bases [8].
- Funko Pop: about 3.75 in, the block-shaped head is "roughly half of the toy's dimensions", pupils far apart with the nose just below the eye line, and no mouth ("the science of cute"); when the template hides identity they lean on accessories and hairstyles: "you'd be surprised how much a hairline can capture a character" [11]. Round black eyes force "other cues" to carry recognition [10].
- Pop Mart's MOLLY: "striking blue eyes", a paintbrush as her defining accessory, and every series (Space, Royal, Snow White) recontextualises "through different costumes, props, and artistic themes while maintaining her core identity" [9].
- Chibi is the proportion language all of these borrow: head "between one third and one half" of the height, "folds on a jacket are ignored, and general shapes are favored", but "distinctive hair or accessories remain prominent" [3].

## Vocabulary worth putting in prompts

| TERM | meaning | why a model responds | source # |
|---|---|---|---|
| 2 to 2.5 heads tall | chibi compromise; below 2 the limbs vanish and costumes cannot show, above 3 it reads as a child | pins the scale of head vs body instead of "cute" | [1][2][3] |
| head width equal to or wider than height | chibi head rule | stops the tall oval head | [2] |
| egg or rectangle body | the two chibi torsos; no inverted triangle | kills the heroic V-torso | [2] |
| arms not thicker than legs | chibi limb rule | keeps the figure from reading muscular | [2] |
| eyes no smaller than a quarter of head height | chibi eye floor | forces the toy face, not a realistic one | [2] |
| no mouth, two wide-set dot eyes | Funko face template | a known product look the model has seen millions of times | [10][11] |
| hairline as identifier | Funko's substitute for a face | shifts identity to a silhouette feature | [11] |
| defining accessory | MOLLY's paintbrush, Joey's duck | one prop, held, in the same material | [9][11] |
| platform toy, fixed silhouette | Dunny / Munny / Bearbrick body | keeps three characters on one body | [6][7][8] |
| points of articulation | visible joint seams at neck, shoulder, hip | seams read as toy, not as sculpture | [6][8] |
| silhouette test | fill the figure solid black and check it still reads | asks for parts that are "separately identifiable", not "a blob" | [4][5] |
| three-quarter view, pushed pose | shows both sides of the body; posture replaces the missing face | pose carries character when the face is blank | [4] |
| detached round head | pictogram convention (Aicher, DOT, stick figure) | the single strongest "this is an icon person" cue | [12][16][17] |
| 45 degree stroke grid | Aicher axes | limbs snap to axes instead of curving | [14][16] |
| base figure plus one addition | Isotype cap / tool | role without a costume | [18] |
| satin-frosted vs polished clear | Lalique finish contrast | the only way a clear figure shows hair or a garment | [28][29] |
| integral base | Lalique classical base | gives a glass figure something to stand on | [27] |
| character anchor, do not redesign | OpenAI cookbook | consistency across a set | [31] |

## What separates a convincing character from a generic one
- **Silhouette first.** Disney's museum sheet: use a silhouette to test whether the design "reads"; each part (body, hair, clothes) must be "separately identifiable"; shapes "should not be layered on top of one another as to create a blob"; too many complicated shapes lose focus; actions in front of the body "get lost in the overall silhouette" [4]. Concept-art practice adds: thumbnails as black shapes, dominant shapes that work together, distinctness by chest width and limb length, readable from front, side and three-quarter [5].
- **Proportion is a decision, not a default.** Lower head ratios are cuter but "limbs also appear shorter and harder to see" and "difficult to show off costumes or have them strike various poses"; the fix at longer ratios is bigger eyes and a lowered centre of gravity [1]. For a role icon that must hold a prop, 2.5 heads is the honest number (inference from [1][2]).
- **Props carry identity when faces cannot.** Every fixed-face system says the same thing: Funko (accessories, hairline) [11], MOLLY (paintbrush) [9], Bearbrick (print and add-ons) [8], Isotype (cap or industry sign) [18], Aicher (equipment and pose) [16]. A role prop must be one object, held or straddled, in the same medium as the figure.
- **Pose does the face's job.** With no expression available, "push your pose", draw in three-quarter view, keep the action beside the body not across it [4].
- **Face at icon scale.** Line: none [17][22]. Glass: none, or a frosted zone. Toy: two dots, no mouth, nose implied by eye placement [10][11]; eyes at least a quarter of head height [2].
- **Inclusivity without caricature.** Atlassian's history is the cautionary arc: 2012 meeples "used simple props to indicate roles" with no diversity; 2015 added three skin tones and was "somewhat shallow"; the current rule is "a collection of subtle elements to indicate ethnicity", never one feature, plus varied body sizes, glasses and hearing aids, hairstyles and clothing beyond the binary, no ties as the authority prop, and "everyone in a scene should contribute equally"; think "normalizing" not "diversifying" to avoid token characters [24]. Microsoft went further and stopped drawing people in role scenarios because flat vector people felt "emotionless" and risked reinforcing stereotypes, replacing them with symbols of activity [23]. Humaaans and Open Peeps show the mechanical answer: heads, torsos, legs, hair and clothes as swappable parts, 584,688 combinations, bust / standing / sitting variants, black-and-white by default [25][26].

## Model-side levers
- **OpenAI (GPT image models).** Establish a "character anchor" image, then repeat "same facial features, proportions, and color palette" and "Do not redesign the character" on every follow-up; state framing ("full body visible, feet included") and scale against a nearby object; for figurine or collectible looks, name materials, paint texture and toy-suited proportions [31].
- **Gemini.** "Describe the scene, don't just list keywords"; sticker template "A [style] sticker of a [subject], featuring [key characteristics] and a [color palette] ... [line style] and [shading style]", with the kawaii red panda as the worked example; if features drift after many edits, restart with the full description [32]. Reference caps: Gemini 3.1 Flash takes up to 10 object, 4 character and 3 style images; 3 Pro takes 6 object and 5 character images [33].
- **Midjourney.** Omni Reference (--oref, weight --ow 1 to 1000, default 100, keep under 400) per search snippets only: UNVERIFIED.
- **Terms the models are documented on:** "sticker", "kawaii", "cel-shading", "bold clean outlines", "minimalist composition" (Gemini) [32][33]; "figurine", "collectible", "vintage toy" (OpenAI) [31]. Nothing solid found on "pictogram" or "chibi" as documented tokens in any vendor guide; they are used on the strength of the craft sources above.
- **Consistency across a set** is documented only as (a) a locked descriptive block repeated verbatim and (b) reference images. There is no documented "style seed" for a set beyond that (nothing solid found).

## Proposed clause upgrades

**CHARACTER, line system.** "One person drawn as a pictogram in the same thin single-weight black line: a round head separated from the body by a small gap, a body of straight segments on horizontal, vertical and 45 degree axes with rounded ends, no face, no fingers, no neck, feet as short strokes. About three heads tall so the limbs are long enough to hold a prop. In flat mode the figure is frontal or profile; in isometric mode it stands on the same ground grid and its prop is a solid drawn in the same projection. The role is one prop in the same line and one posture." Rationale: the detached head and axis grid are the pictogram's identity [14][16][17]; three heads keeps a holdable limb [1]; frontal or profile is the ISO convention [21]; no added human detail unless it amplifies meaning [22].

**CHARACTER, glass system.** "One person sculpted in clear optical glass, two and a half heads tall, the head a single smooth dome with no features, limbs fused to the torso with no daylight between them, hands as rounded paddles, standing on a small integral glass base. Hair and one garment (cap, apron, jacket, hood) are the same glass with a satin-frosted finish against the polished clear body, and this frosted zone plus one fused prop is the whole role. Isometric three-quarter view, same ground and light as the object icons." Rationale: frosted-versus-polished is how Lalique makes a clear figure show dress and hair [28][29]; the base is the figurine convention [27]; fused limbs because thin clear limbs vanish and glass cannot hold them (inference from [30]); 2.5 heads so the prop stays legible [1][2].

**CHARACTER, toy system.** "One person as a miniature designer-toy figure in matte soft-touch vinyl, two and a half heads tall: a rounded block head with width at least equal to its height, two wide-set solid black dot eyes at least a quarter of the head high, no mouth, an egg or rectangle torso, arms no thicker than the legs, mitt hands, pad feet, faint joint seams at neck and shoulders. One hairline silhouette, one garment and one held accessory carry the character; garment folds and small details are dropped. Standing on the off-white ground with the soft studio shadow of the object icons." Rationale: Funko face and hairline rule [10][11]; chibi head, torso, limb and eye rules [2][3]; platform-toy seams and fixed body [6][8]; accessory as identity [9][11].

**Rule: how a role is carried.** Props and posture only. One prop, held, straddled or worn, in the same material and line as the figure; one posture that names the job (astride, seated at, pointing at, carrying). Never text, never a logo, never a badge, never a screen with legible content; the prop is a shape (a cube box, a bar-chart card, a laptop lid, a headset, a pen, a tie-less blazer). Aicher, Isotype and Funko all carry role this way [11][16][18]; ISO symbols must work without text [21]; Atlassian bars the tie as an authority prop and asks that everyone "contribute equally" [24]. Suggested props (inference, to be tested): rider = helmet plus scooter or cube box; data scientist = chart card or magnifier; product manager = clipboard or roadmap card; backend engineer = server block or terminal; frontend engineer = laptop with a window frame; design lead = pen or frame; company leader = the same body, a step forward, no larger and no higher.

**Rule: variety across three characters of one team.** Same body template, same stroke, same scale, same ground. Vary three things per character, never one: hair silhouette (curly, short, long, covered, none), build (a rounder torso, a taller stance, a shorter one) and one accessory (glasses, a cap, a hearing aid), following Atlassian's "collection of subtle elements" [24] and Open Peeps' parts logic [26]. In the toy system also vary skin tone across the three; in line and glass there is no colour, so variety rides on hair, build and posture alone. No character stands above another; the leader is not bigger [24]. Add no scene, no second prop, no expression beyond the fixed face.

## Sources
1. Clip Studio Tips, AIO, "Deciding the Body Proportion": https://tips.clip-studio.com/en-us/articles/10494 (2 to 2.5 heads; low ratios hide limbs and costume; bigger eyes, lower centre of gravity)
2. Clip Studio Tips, CHYEE, "Body Proportion in Chibi Drawing": https://tips.clip-studio.com/en-us/articles/4829 (1.75 to 3 heads; eyes a quarter of head; head width; egg or rectangle body; arms vs legs)
3. Wikipedia, Super deformed: https://en.wikipedia.org/wiki/Super_deformed (head one third to one half of height; folds ignored, hair and accessories kept)
4. Walt Disney Family Museum, Tips and Techniques: Silhouette (PDF): https://www.waltdisney.org/sites/default/files/2020-05/T&T_Silhouette-final2.pdf (silhouette test, separately identifiable shapes, three-quarter view, pushed pose)
5. Character Design Notes, "The use of Silhouettes in Concept Design": http://characterdesignnotes.blogspot.com/2011/03/use-of-silhouettes-in-concept-design.html (silhouette thumbnails, dominant shapes, multi-angle readability)
6. Kidrobot, "What is a Dunny": https://www.kidrobot.com/pages/what-is-a-dunny (silhouette, sizes, three points of articulation, accessories)
7. Kidrobot, Munny 7 in product page: https://www.kidrobot.com/products/munny-world-7-munny-blank-diy-art-toy (sizes, movable joints, blank canvas)
8. originalbearbrick.com, "Bearbrick sizes explained" (fan/collector site): https://originalbearbrick.com/bearbrick-sizes-explained/ (mm sizes, nine parts, eight articulation points, identity by print and material)
9. Pop Mart, MOLLY collection: https://www.popmart.com/us/collection/5 (blue eyes, paintbrush, series vary costume and props)
10. hobbydb blog, "The Eyes Have It": https://blog.hobbydb.com/2018/05/20/the-eyes-have-it-see-why-some-funko-pop-figures-look-differentthe-eyes-have-it-see-what-makes-some-funko-pops-look-different/ (marshmallow head, dot eyes, other cues carry identity)
11. Mental Floss, "Maximum Cute: How Funko Conquered the Toy World": https://www.mentalfloss.com/article/73886/maximum-cute-how-funko-conquered-toy-world (3.75 in, head about half, eye and nose placement, no mouth, hairline and accessories)
12. Wikipedia, DOT pictograms: https://en.wikipedia.org/wiki/DOT_pictograms (survey, semantic/syntactic/pragmatic scoring, Helvetica Man)
13. pictograms.info, AIGA Symbol Signs: https://pictograms.info/organizations/aiga.htm (55 referents, review and redraw process)
14. Eye Magazine blog, "This sporting myth": https://eyemagazine.com/blog/post/this-sporting-myth (orthogonal plus 45 degree limbs cannot be uniform; the grid myth)
15. Cooper Hewitt, "Faster, Higher, Stronger": https://www.cooperhewitt.org/2017/12/29/faster-higher-stronger/ (grids determine head and torso proportions; pose and equipment)
16. Smithsonian Magazine on Aicher's pictograms: https://www.smithsonianmag.com/innovation/this-graphic-artists-olympic-pictograms-changed-urban-design-forever-180978256/ ("a font of human body parts", 45 degree figures)
17. Wikipedia, Stick figure: https://en.wikipedia.org/wiki/Stick_figure (circle head, optional hands/feet/neck, dress variant)
18. Gerd Arntz Web Archive: http://gerdarntz.org/content/gerd-arntz.html (base man plus cap or industry sign; 4000 pictograms)
19. Isotype Revisited, Introduction: https://isotyperevisited.org/2012/08/introduction.php (pictograms as repeatable units; consistency)
21. Wikipedia, ISO 7001: https://en.wikipedia.org/wiki/ISO_7001 (no text, works small and giant, frontal or profile figures)
22. Material Design 1, Icons: https://m1.material.io/style/icons.html (human figure rules, do not crop limbs, add human traits only for meaning)
23. Microsoft Design, "Embracing vibrant universality in Fluent illustrations": https://microsoft.design/articles/embracing-vibrant-universality-in-fluent-illustrations/ (stopped depicting people in roles; why)
24. Atlassian Work Life, "Designing inclusive illustrations (or, a brief history of the meeple)": https://www.atlassian.com/blog/inside-atlassian/designing-inclusive-illustrations-at-atlassian (subtle elements, no ties, equal contribution, normalising)
25. Humaaans: https://humaaans.com/ (parts, hair, tops, pants, CC0)
26. Open Peeps: https://www.openpeeps.com/ (584,688 combinations, bust/standing/sitting, black and white default, CC0)
27. USC Scalar, "Rene Lalique's glass: Techniques and Methods": https://scalar.usc.edu/works/rene-laliques-glass/techniques-and-methods-used-in-the-factory (cire perdue figurines, press moulding, classical bases)
28. Lalique North America, Figurine et Raisins panel: https://us.lalique.com/products/figurine-et-raisins-decorative-panel-clear-crystal-10067800 (satin-finished vs shiny crystal magnifies the motif)
29. Around The Block, "A Guide to Lalique Crystal Figurines" (dealer, secondary): https://www.aroundtheblock.com/blogs/news/lalique-crystal-figurines-guide (frosting on drapery and hair; quality tells)
30. Wikipedia, Lampworking: https://en.wikipedia.org/wiki/Lampworking (torch, rods, soft vs borosilicate, figurines)
31. OpenAI Cookbook, GPT Image Generation Models Prompting Guide: https://developers.openai.com/cookbook/examples/multimodal/image-gen-models-prompting-guide (character anchor, do not redesign, figurine styling)
32. Google Developers Blog, prompting Gemini 2.5 Flash Image: https://developers.googleblog.com/how-to-prompt-gemini-2-5-flash-image-generation-for-the-best-results/ (sticker template, drift, describe the scene)
33. Google AI, Gemini image generation docs: https://ai.google.dev/gemini-api/docs/image-generation (reference image caps per model)
UNVERIFIED / not fetched: Apple HIG SF Symbols and Material Design 3 icons (no body text); Shopify Polaris illustrations (redirects); Midjourney Omni Reference docs, Atlassian "Illustrating Balanced and Inclusive Teams" (Medium), Vogue HK Kenny Wong interview, Corning flameworking (all 403); ISO 9186 67 percent threshold; Murano "created in segments" claim.
