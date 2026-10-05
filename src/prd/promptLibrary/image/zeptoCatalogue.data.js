// Prose for the Zepto catalogue group. No prompts live here: every prompt in this
// group is composed from the recipe (zeptoCatalogueViews.js) over the taxonomy
// (zeptoCatalogue.taxonomy.js) at assembly time. See zeptoCatalogue.js.

export const SPECS = [
  {
    id: "pl-zepto-catalogue-system",
    group: "Zepto catalogue",
    eyebrow: "Zepto",
    title: "Zepto catalogue · the system",
    summary:
      "Every category and subcategory Zepto sells, 340 of them, written so that restyling the whole catalogue tomorrow is one new entry in one file rather than 340 rewrites. Three layers: a subject that never mentions light, a material class that carries the photographic knowledge, and a style that owns the entire look.",
    "The problem this solves": [
      "A catalogue of prompts written the ordinary way bakes the look into every entry: each prompt says what the product is AND how it is lit, coloured and rendered. Change the art direction and every entry is dead.",
      "So nothing here describes a look. A subcategory entry may say form, material, finish, closure, how the thing sits, and the one or two props that read as its aisle. It may not say light, colour grade, camera or render. Those words appear in exactly one file.",
      "Restyling the catalogue is therefore adding an entry to STYLES. Every one of the 340 blocks rebuilds from the same subjects on the next render, and the subjects are untouched.",
    ],
    "The three layers": [
      "Subject, 340 entries. What the thing is. Style-agnostic by construction.",
      "Material class, 17 entries. The staging knowledge: what a gloss bottle, a matte carton, a metallised pouch, a frosted frozen pack or a loose heap of grain each need from a set. A pack of atta and a pack of detergent powder are different products and the same photographic problem, so the knowledge is written 17 times rather than 340 times.",
      "Style, 4 entries and counting. The whole look: ground, backdrop, palette, light, shadow, camera, render. A style may override any material-class clause by declaring a same-named field, which is how a style that is not photography at all still works over the same subjects.",
    ],
    "The four styles today": [
      "Studio packshot. The premium FMCG set: seamless sweep, three-light grammar, parallel verticals via a perspective-control lens, focus-stacked front-to-back sharpness. The default.",
      "App grid asset. The listing tile: one item dead centre on flat off-white, near shadowless, no props, legible at thumbnail size.",
      "Campaign world. The brand's sun-drenched violet world, sharing its constants with the campaign tiles group: hard sun upper left, flat brand surfaces, fresh food alone keeping its ripe colour.",
      "Soft toy model. Not photography at all, the stylised 3D toy-model render the Away icon sets use. It is in the set deliberately, as the proof: it overrides every photographic clause in all 17 material classes and the 340 subjects still hold without a single edit.",
    ],
    "The two layers a prompt can be for": [
      "Generate. The prompt makes the product itself, as an unbranded archetype of its subcategory. Nothing is pinned to a supplied photo, so a restyle is total.",
      "Stage. The prompt makes only the set, and a real transparent-background product PNG drops in with its own pixels untouched. This is the existing Zepto FMCG composition path, now reachable per subcategory instead of assembled by hand.",
    ],
    "One honest exception to the global rules": [
      "The library appends two global rules to every image prompt: no text anywhere, and strip all branding.",
      "The stage layer cannot take them as written. It promises that the supplied cutout keeps its own logo and printing exactly as provided, and the global rule says no text or branding anywhere in the image. Both cannot be true at once.",
      "So the stage layer closes with the same two prohibitions SCOPED to the half of the image the model is actually generating, the set, with the supplied pack explicitly carved out. This is the only place in the library where the global rules are re-scoped, and it is re-scoped rather than dropped.",
    ],
    Sources: [
      "Taxonomy captured 2026-08-20 from Zepto's own category sitemap, https://www.zepto.com/sitemap/categories.xml: 39 categories and 344 subcategory URLs, of which 6 test or placeholder categories were dropped, leaving 33 categories and 338 subcategories carried here verbatim by slug. Two further categories appear in the app's home rail but not in the sitemap and are carried flagged, so 35 categories and 340 subcategories in total.",
      "The material classes are written from research/composition.md, the sourced FMCG staging dossier: gloss returns a picture of the light source so you light the surface rather than the object; matte scatters, so raking side light is what reveals its texture; glass wants backlighting or an edge-lighting setup; metal behaves like a mirror and needs a built gradient plus negative fill; the contact shadow is the cue whose absence makes a cutout float.",
      "The campaign style shares its constants with research/zepto-campaign.md and zeptoCampaignViews.js. Its violet and aubergine are STAND-INS sampled from this portfolio's own Zepto tokens, not the real brand values.",
      "UNVERIFIED: the sitemap is the app's own published taxonomy, but subcategory display labels here are title-cased from the slugs rather than read off the live category pages, which are client-rendered and were not reachable without a store location. A few labels will differ in wording from what the app shows.",
    ],
  },
  {
    id: "pl-zepto-catalogue-classes",
    group: "Zepto catalogue",
    eyebrow: "Zepto",
    title: "Zepto catalogue · material classes",
    summary:
      "The 17 material classes, the middle layer. Each one is written from the sourced staging dossier and is shared by every subcategory made of that material, which is why the catalogue holds together and why a restyle stays cheap.",
    "Why 17 and not 340": [
      "Products differ; materials repeat. Atta, detergent powder, protein powder and pet kibble are four aisles and one problem: matte laminate, no useful reflection, texture only under a raking source.",
      "So the photographic knowledge is attached to the material, not to the product. A new subcategory costs one line and inherits a set that already works.",
      "A style may override any clause here. The soft toy model style overrides all of them, which is the test that the layering is real rather than decorative.",
    ],
  },
];
