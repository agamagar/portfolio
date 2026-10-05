// Image-generation prompts: 3D icons. The PROSE half of the group.
// Every copy-paste block, the ladders and the template are composed from the recipe
// in ./icons3dViews.js by ./icons3d.js, so nothing here is a frozen prompt.
// Part of the prompt library (src/prd/promptLibrary). See index.js for the map.

export const SPECS = [
  {
    id: "pl-icons-3d-system",
    group: "3D icons",
    eyebrow: "3D icons",
    title: "3D icons · the system",
    summary:
      "Turn any flat 2D icon into a soft, rounded, matte 3D icon: the register of the reference (a deep violet squircle calendar with two binder rings and a raised lavender heart, seen straight on, on white). Drop the flat icon in the picker, drop the 3D sample beside it, say what the icon is, pick the route and the look, and the prompt assembles below. The flat icon carries the metaphor, the silhouette and the colour; the prompt carries volume, material, light and what must not change. Built for the image models that accept a reference (Figma's Edit with prompt, Gemini's Nano Banana models, the GPT Image 2 edits endpoint), in a compact register that fits Figma's prompt field and a full one that does not try to.",
    "What this is": [
      "An image-to-image system for RENDERING. The attached flat icon is the subject and is held constant; the prompt changes only how it is drawn: from a flat glyph to stacked slabs of matte clay under one soft light.",
      "It is a 3D render of a flat icon, not a 3D object. Both canonical references were built that way: Microsoft's Fluent emoji were drawn flat first and modelled after, from simple base shapes; the 3D style adds only volume, material and light. The generic failure is the icon turning into a product shot, a real desk calendar with paper pages, and the prompt says so.",
      "Seven dials. Source (the attached icon, or a description), sample (whether a second image of the target look is attached), route (Figma, Gemini or GPT Image 2, because they name images differently), view (front, raised three-quarter, isometric), colour (the icon's own, or one named hue), ground (white, or real alpha on GPT Image 2) and set (one icon, or one of a set).",
      "Two materials. Soft matte clay is the reference. Glossy is the Fluent 3D emoji finish, kept as a named alternative because it is where the model drifts when 'matte' is not said out loud.",
      "Two wire treatments, added the same day at Agam's ask: the icon as a ball-and-stick skeleton (thin straight struts, a very small glossy sphere at every vertex, the spheres in a contrasting colour), alone or traced over the matte body in a complementary colour. Named by the two real referents, a chemistry model kit and a space-frame truss, never 'wireframe' alone, which pulls monochrome line drawings. Full register only.",
      "Built on the shared recipe contract (image/recipe.js). Adding a view, a colour or a material is one entry in icons3dViews.js and it appears in the picker, the ladders and the template at once.",
    ],
    "The constant": [
      "Front elevation, camera level, no perspective. Apple's macOS 11 icon grammar is 'front-facing perspective, level position, and uniform drop shadow', and the 3dicons library kept Front as a fixed camera with its own light set. Depth in that view is read from three cues only, the rolled edge, the raised parts and their shadows, and the clause says so, because most 3D captions are three-quarter views and the model drifts there otherwise.",
      "Two roundings, named separately. In plan the corner is Apple's squircle (a quintic superellipse, fuller than a rounded rectangle); in section the edge is a fillet, a smooth rounded bevel of several segments, about a twentieth of the body width. 'Bevelled' alone gets a flat 45 degree chamfer with a hard highlight line, which is the wrong edge.",
      "Stacked slabs. Each shape of the flat icon becomes its own slab, the body lowest and the smaller shapes raised in front of it, with a contact shadow in the seam where they meet. That seam is what sells stacking; without it the heart reads as a print on the surface.",
      "Matte is a decision, not a default. The famous reference, Fluent 3D, is glossy and gradient-heavy, so the material clause says matte soft-touch plastic like clay, high roughness with no mirror reflections, a faint velvety sheen and a little subsurface softness, and then says 'not glossy' out loud. Roughness 1.0 is the render-tool number for a fully diffuse surface; sheen and subsurface are the two Principled-shader terms that turn hard plastic into clay.",
      "One large softbox from the upper left with a strong fill. Area lights produce shadows with soft borders and larger ones softer highlights; fill lessens the shadow side so the icon's colour survives; upper-left is Google's 45 degree top-left light and the direction in the reference. Highlights are broad and dim, never a hot point.",
      "Three shadows only, all soft and low opacity: a contact shadow in the seams, a slightly heavier shadow just below and to the right of each raised part, one diffuse drop shadow on the ground. Google's product-icon spec gives the register (20 percent opacity, 4dp offset and blur, heavier below and to the right). The generic render has a black pool under the icon and a hard cast shadow across the body; counting the shadows is what stops that.",
      "One hue, graded by light. The reference is one violet at three values (lit body #8459cb, shaded body #4d2a97, the heart a tint at #cbb6ef, measured off the image). Google's system does this by construction: a tint on the lit edge, a shade on the low edge, a faint 'finish' gradient from upper-left to lower-right. The prompt asks for that ramp and forbids new hues, because both vendors' style templates invite a palette and the sample would otherwise lend its colours.",
      "Preserve, out loud, every generation. The prompt restates what must survive: the same silhouette, the same shapes in the same positions, the same colours; the sample lends only material, light and depth; change only the rendering; do not change anything else. Both OpenAI and Google document this as the way to hold a subject across variations, and neither model has a seed to lean on instead.",
      "The library's two global rules close every prompt: no text anywhere, strip all branding. A flat icon that carries a numeral or a wordmark loses it in the conversion, by design.",
    ],
    "Which image is which": [
      "The vendors document different handles, so the opener is written per route and that is the whole of the route dial. Gemini: 'the first image' and 'the second image', in attachment order. GPT Image 2: 'Image 1' and 'Image 2' by index, with a stated role for each ('Image 2: style reference only'), and 'apply Image 2's style to Image 1' is OpenAI's own phrasing. Figma's Edit with prompt: the selected layer is the thing edited and the attachment is 'a reference image to influence the edit', so the prompt says 'this icon' and 'the attached reference' and does not depend on an order Figma never documents.",
      "Gemini's 'object, character, style' reference types are a capacity table (up to 3 style references on Nano Banana 2, none listed for Pro), not a field you can set; the role lives in the prose. Bracketed tags like [style reference] are folklore on every vendor.",
      "Even with a sample attached, the style is still described in words. Every vendor example that names a style also describes it; a sample alone is how the sample's palette and subject leak in.",
      "Name the subject in the field. An image with no stated subject gets interpreted rather than obeyed; 'a calendar glyph with a heart on it' is enough.",
    ],
    "Two registers": [
      "Compact (the default in the picker): the whole system in under 1,000 characters, rules included, for Figma's image-generation prompt field. The cap is an observed working ceiling, not a documented one (see research/models.md), and the models themselves have far more room. In this register the icon's own colours are carried by the preserve clause alone, and the chamfer and squircle glosses are dropped.",
      "Full: every clause spelled out, with the glosses (what subsurface softness looks like, why the highlight is broad, the twentieth-of-the-width edge radius, the below-right shadow), for models and fields with no cap or when a compact result drifts.",
      "The transparent ground always composes the full register: it is a GPT Image 2 API parameter and the API has no cap.",
      "The two wire treatments always compose the full register: a skeleton with its proportion rules, its sparse-line negation and its two materials does not fit beside the rest of the system under the cap, the same reason a team-illustration scene is full only.",
    ],
    "Grounds and alpha": [
      "White in words on every route. It is the only lever on Gemini, whose docs give no alpha at all, and OpenAI's own style-transfer example asks for 'on a white background' in words even though the model can do alpha.",
      "Real alpha on one route: GPT Image 2 edits with background set to transparent and output_format png (in preview per the reference). The prompt still has to say 'fully transparent background, no backdrop, checkerboard, scenery or shadow', because a drawn checkerboard is not transparency, and it drops the ground shadow so it is not baked into the alpha. Check the decoded alpha channel at the edges.",
      "Never write 'transparent' for any other route. A model that cannot emit alpha has nothing to do with the word except paint it.",
      "In Figma, the documented route is generate on white then Remove background as a separate action.",
    ],
    "Keeping a set consistent": [
      "Consistency across a set is a grid and a light rig, not taste. Google's keyline shapes hold 'consistent visual proportion across related product icons'; Apple's icon grid keeps centred inner elements the same size; the 3dicons library reused three sets of the same lights across every icon. The set dial adds one clause that says all of that in a sentence.",
      "Generate one icon first and get it right. It becomes the sample for the rest: attach it beside each new flat icon so the material, the light and the edge radius are shown, not only described.",
      "Colour drift across a set is the documented hard part (the 3dicons author 'tried and failed a few times' to hold one colour across angles). Hold the base colour to the flat icon's own hex and let light make the ramp; never ask for 'a palette'.",
      "Keep the material and the view fixed across a set. A restyle is a separate set, generated from the same flat icons, never chained from a restyled render.",
    ],
    "If it comes out wrong": [
      "It came back as a real object (paper pages, a hinge, a scene): the conservation clause lost. Put the icon's name in the field, switch to the full register, and attach the flat icon again beside the best render so far.",
      "The camera tilted on the front pick: most 3D captions are three-quarter. The full register's front clause says depth reads only from the edges, the raised parts and the shadows; if it still tilts, add 'like an app icon on a home screen' to the description.",
      "It came back glossy: the model reached for the famous reference. The matte style already says 'not glossy'; add 'roughness 1.0' to the description if it persists.",
      "The raised part looks printed on: name it in the description ('the heart is a separate slab standing proud of the body') so the contact shadow has something to sit under.",
      "A colour leaked from the sample: pick the icon's own colours and, if it persists, remove the sample and let the words carry the look.",
    ],
    Sources: [
      "Craft clauses (the front elevation, the squircle and the fillet, the stacked slabs, the matte material, the softbox and fill, the three shadows, the one-hue ramp, the set rig): research/icons-3d.md (2026-09-20). Primary sources include Apple's macOS 11 App Icon guidance, Nando Costa's and Tendril's accounts of building the Fluent emoji, Google's 2014 product-icon spec, the Blender and Cinema 4D manuals on bevels, the Principled BSDF and area lights, and the 3dicons library case study.",
      "Reference-image handles, preservation language, style transfer, input_fidelity and the alpha route: research/icons-3d-model-levers.md (2026-09-20), from Google's Gemini image-generation docs, OpenAI's image-generation and image-prompting guides, the Images API reference and Cookbook, and Figma's Make or edit an image and AI credits help pages.",
      "Wire treatments (ball-and-stick proportion, struts and nodes, capped constant cylinders, the sparse edge set, bead shine, the complementary on-colour, the overlay offset): research/icons-3d-wire.md (2026-09-20), from the Blender manual (Wireframe modifier, Curve to Mesh, Freestyle, overlays), Houdini and Cinema 4D docs, Wikipedia on ball-and-stick models and space frames, the Mero system, and Material's on-colour guidance.",
      "The reference image and its measured colours: Claude/3D Icons/reference-calendar-heart.png.",
      "The compact cap and the rule that white is asked for in words: research/models.md (rules 10 to 13) and research/icons.md source 18.",
    ],
  },
];
