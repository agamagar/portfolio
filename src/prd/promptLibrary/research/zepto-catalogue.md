# Zepto catalogue · research dossier
_Researched 2026-08-20. Sources listed at the bottom, numbered; cite by number inline._

## What the medium actually is

Two mediums, joined by one taxonomy.

The first is **the catalogue itself**, which is a data structure, not a craft. Getting it right is a question of provenance rather than of vocabulary: either the categories are the ones Zepto actually publishes or they are invented. They are published, in a sitemap, and that is the whole finding [1].

The second is **FMCG product photography**, which is a craft with a settled vocabulary, and which this library already has a full dossier for. Nothing in the staging layer here is newly researched; it is `research/composition.md` applied per material rather than per product [2]. The one genuinely new idea is the **material class**: the observation that 338 subcategories reduce to about 17 photographic problems, because a pack of atta and a pack of detergent powder are the same matte-laminate problem, and a glass pickle jar and a glass honey jar are the same backlighting problem.

## The taxonomy, and how it was obtained

The app's category pages are client-rendered and return no product tree to a plain fetch without a store location, so scraping the site returned only partial rails [3]. The complete taxonomy is published in Zepto's own sitemap index at `/sitemap.xml`, which links `/sitemap/categories.xml` [1]. That file yields:

- 39 category slugs, 344 subcategory URLs, in the canonical form `/cn/<category>/<subcategory>/cid/<uuid>/scid/<uuid>`.
- Six of the 39 are test or placeholder entries and are dropped: `all`, `boost-your-daily-health` (its only child is `integration-test`), `print`, `sample-box`, `test-cafe`, `test-cat4`. One subcategory slug is self-labelled dead, `local-favorites-deactivated`, and is carried under its real name because the aisle is real even if the slug is retired.
- That leaves **33 categories and 338 subcategories**, all carried verbatim by slug.
- Two further categories appear in the app's own home rail but not in the sitemap: `electricals-accessories` and `homegrown-brands` [3]. They are carried and flagged `homeRail: true`, because a home-rail slug is weaker evidence than a sitemap entry.

**UNVERIFIED.** Subcategory display labels are title-cased from the slugs, not read off the live pages, which were not reachable without a store location [3]. Slugs are exact; a few labels will differ in wording from what the app shows. The uuids were captured but deliberately not stored: they are store-and-catalogue state, they will rot, and nothing in a prompt needs them.

## Vocabulary worth putting in prompts

All of these come from the FMCG staging dossier [2] and are used here as the material classes' clauses.

| TERM | meaning | why a model responds | source # |
| --- | --- | --- | --- |
| contact shadow | the tight near-black core exactly where an object meets the surface | it is the ambient-occlusion cue; without it a pack floats even when the cast shadow is right, which is the single commonest tell of a composite | 2 |
| form shadow | the shading on the faces of the object turned away from the key | this is what makes a carton read as a volume rather than as a printed rectangle | 2 |
| raking light | a source skimmed across a surface at a shallow angle | matte surfaces scatter, so only side light reveals board texture, crease lines, weave, pile or the grain of a heap | 2 |
| negative fill | black flags placed to subtract ambient from one side | it is what keeps a cylinder round; without it a can flattens into an even grey | 2 |
| light the surface, not the object | build a gradient for a gloss surface to reflect | gloss obeys the law of reflection, so what you see on a shiny pack is a picture of the source, not the source | 2 |
| edge lighting | a source behind and below aimed up through glass | draws the edges of a bottle as bright or dark lines and is the standard answer for transparency | 2 |
| seamless sweep | paper curving from wall to table with no visible corner | names the actual set rather than asking for "a clean background" | 2 |
| perspective-control lens | shifts the lens rather than tipping the body | keeps verticals parallel with no keystone, which is why professional packshots look correct and casual ones look tipped back | 2 |
| focus stacking | merging frames shot at shifted focus points | the trade answer to a macro's shallow depth of field, and the way to ask for front-to-back sharpness without asking for f/16 and diffraction | 2 |

## What separates a convincing result from a generic one

For this group specifically, the answer is not a clause at all, it is the **layering**. A catalogue whose prompts each carry their own art direction is dead the moment the art direction changes. The test applied here is the **Soft toy model** style: a style that is not photography, that overrides every clause in all 17 material classes, and under which all 340 subjects still compose correctly without a single edit to any of them. If a subject had smuggled in a word about light, that style would break it. The runnable check enforces this directly, failing any subject that names light, shadow, camera, aperture or colour grade.

## Model-side levers

- Clause order follows the same spine as the rest of the library [4]: intended use, subject, ground, light, shadow, palette, render, rules.
- The toy style states the render FIRST, because naming the medium up front is what stops the model defaulting to photography [4].
- Compact register measured across all 5,440 combinations (340 subcategories, 4 styles, 2 layers), longest 937 of the 1,000-character working cap [4].

## Proposed clause upgrades

Already applied, listed for the record:

1. **The stage layer re-scopes the global rules rather than inheriting them.** The library appends "no text anywhere" and "strip all branding" to every image prompt. A staged prompt simultaneously promises the supplied cutout keeps its own logo and printing exactly. Those contradict. The stage layer therefore closes with the same two prohibitions scoped to the generated scene, with the supplied pack explicitly carved out. This is the only place in the library where the global rules are re-scoped, and it is re-scoped, never dropped. The check asserts both halves: a stage prompt must scope the rule, and must not carry the unscoped one.
2. **Props are dropped in the App grid style and in the compact register.** A listing tile is one item on flat white; a supporting prop in that frame is a defect, not a flourish.

## Sources

1. Zepto category sitemap, https://www.zepto.com/sitemap/categories.xml, reached via https://www.zepto.com/sitemap.xml. Gave the complete published taxonomy: 39 categories, 344 subcategory URLs, canonical slugs. Captured 2026-08-20.
2. `research/composition.md`, this library's own FMCG product-staging dossier (researched 2026-08-15). Gave every clause in the 17 material classes: the shadow taxonomy, the light-the-surface principle, per-material lighting, the set kit, the lens and focus practice.
3. Zepto home page, https://www.zepto.com/. Gave the home-rail category list, which is where `electricals-accessories` and `homegrown-brands` come from, and established that category pages are client-rendered and return no tree without a store location.
4. `research/models.md`, the cross-cutting model dossier. Gave the clause-order spine, the intended-use-first rule, and the 1,000-character working cap for Figma's prompt field, which is itself flagged there as defensive rather than documented.
