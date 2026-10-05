# Icon systems (Zepto, Away, Portfolio line icons) · research dossier
_Researched 2026-08-15. Sources listed at the bottom, numbered; cite by number inline._

> Scope note: Google Material Symbols, Apple HIG / SF Symbols, IBM Carbon and Shopify Polaris are all JavaScript-rendered documentation sites and returned no body text to the fetcher. They are listed at the bottom as UNVERIFIED and **nothing in this dossier is cited to them**. The craft claims below come from design systems whose docs are static and fetchable (Atlassian, Telerik/Kendo, Denali), from working icon designers' writeups, and from the projection and image-model sources.

## What the medium actually is

### Icon grids and geometry

An icon grid is a rule system, not decoration. Its anatomy, per a working icon designer (Helena Zhang, ex-Material) [1]:

- **Pixel grid** · the underlying increment paths snap to. Historically 1px; 0.5px increments are now common so that half-pixel stroke weights (1.5px) can still land on a real coordinate [1][7].
- **Keyshapes / keylines** · a small family of template shapes that every icon is grown from. The common four are circle, square, portrait rectangle, landscape rectangle [1][7]. Their whole reason for existing is optical: a 20px circle and an 18px square read as the *same size*, whereas two 20px shapes do not.
- **Orthogonals** · keylines through the centre point, conventionally at 90 and 45 degrees, with 15 and 5 degree increments for finer work [1][8]. This is the origin of the informal "45 degree rule": angled elements snap to 45 (or 15 degree steps), never to arbitrary angles.
- **Live area vs trim area vs padding** · the live area is where the main content of the icon sits; content may bleed into the trim area but must not exceed it; the padding is the breathing space at the outer edge [1][7]. Concrete published values:
  - 24px canvas, 2px padding, 20px live area [3]
  - 32px canvas exporting at 24px, live area 26x26px (up to 28x28 for detailed icons), trim 3px minimum reducible to 2px [10]
  - 48px canvas, 46x46 live area, 2px padding all round [11]
  - 16x16 default bounding box with a 12px small size for chevrons and status marks [4]
- **Mask** · the container silhouette when there is one (squircle on iOS, rounded rect on Android) [1].
- Keyshape numbers a designer actually used on a 24px canvas: circles at 10 and 20px, square 18x18, portrait rect 16w x 20h, landscape rect 20w x 16h, on a 1px grid chosen because the stroke is 1.5px [7].

Zhang's own caveat is worth carrying into prompts: grids are guides, not hard rules, and optical balance beats grid compliance; icons should be judged at native size in context, not zoomed in the editor [1].

### Stroke and terminals

- **One weight across the set** is the non-negotiable. Published defaults: 1.5px on a 16px box [4]; 2px on a 32px artboard that scales to 1px at 16px [10]; 4px on a 48px box [11]; 2px is the common 24px-grid convention [3].
- **Stroke alignment must be centred on the path**, not inside or outside, or the shape distorts when scaled [10].
- **Caps and joins are a style decision that must be uniform.** Round caps on open paths and round joins at corners is one coherent house style [10]; Atlassian instead uses square end terminals for boldness, and explicitly sets end points to "none" style because the alternative renders blurry [4].
- **Corner radius is a constant, not a per-icon choice.** A single 2px outer radius applied to all outer geometric shapes [10][11]. Atlassian's signature is the mixed rule: rounded exterior corners with sharp interior angles, which reads friendly but precise [4].
- **Pixel alignment.** X and Y coordinates should be whole numbers, not decimals; decimals put the stroke edge between pixels and produce blur [3]. This is the practical core of "drawn at one size and hinted": the artwork is fitted to the pixel grid of its intended size rather than scaled from an arbitrary master.
- **Minimum spacing between distinct elements** of one stroke width or 2px, so counters and gaps do not fill in at small sizes [10].
- **Simplicity is a rendering constraint, not taste.** Detail that cannot survive the target size should be deleted [3][4].

### Optical correction

- **Optical size compensation**: circles, diamonds and triangles must be drawn *larger* than squares to read as equal weight; the correction is to let visually smaller icons extend past the nominal area and give squarish icons extra padding [9][12].
- **Optical centering**: asymmetric shapes (play triangles being the classic) are geometrically centred but read off-centre; they must be nudged. On a circular button, align the icon's *circumscribing circle* to the button, not its bounding box [9].
- Denali allows explicit exceptions to its own stroke rule "where necessary for visual balance" [11]; Telerik requires visual centering rather than mathematical alignment for asymmetric shapes [10]. Every serious system writes optical override into the spec.
- The eye is more sensitive to an object's height than its width, which is why horizontal and vertical strokes of equal numeric weight do not read equal [9]. _(inference)_ For prompt purposes this argues for saying "uniform apparent stroke weight" rather than a numeric px value alone.
- Standard geometric corner rounding looks mechanical; refined sets pull the curve handles in to smooth the line-to-curve transition, and superellipse (Lame curve) beats a plain rounded rect for containers [9].

### Isometric projection

This distinction matters for the Portfolio isometric mode and is routinely got wrong.

- **True isometric**: the three axes are equally foreshortened and the angle between any two of them is 120 degrees [5]. On the page this means the two ground axes each run at **30 degrees from horizontal**. It comes from rotating 45 degrees about the vertical then about 35.264 degrees (arctan 1/root2), and true projection foreshortens sides to roughly 80 percent, though isometric *drawing* conventionally uses true lengths instead [5].
- **The 2:1 convention** (what most "isometric" illustration and all isometric pixel art actually uses): lines step two units across for every one unit down, giving **arctan(1/2) = 26.565 degrees from horizontal**, not 30 [6][13][14]. It was adopted because a real 30 degree line on a raster grid produces an uneven, shimmering staircase, whereas 2:1 gives a perfectly regular one [6][13][14].
- **The 2:1 convention is technically dimetric, not isometric**: only two of the three inter-axis angles are equal (about 116.565, 116.565 and 126.870 degrees) versus true isometric's three equal 120s [6]. Wikipedia is blunt that "isometric computer graphics are rarely truly isometric" and that 2.5D, 3/4 view and pseudo-3D are used interchangeably for it [6]. Practitioners call it isometric anyway [13][14].
- Axonometric is the parent family; isometric, dimetric and trimetric are its members [5].
- Construction practice: build from one correct tile or primitive and repeat, rather than drawing each element freehand, because freehand angles produce misaligned seams [13]; build objects from stacked basic geometric solids so parts can be swapped [14]; verify by counting units against a 2:1 ruler rather than trusting the eye [14]. Depth is read from three tonal values (light top, medium side, dark side) under one consistent light direction [13] · relevant only if the Portfolio isometric mode ever admits tone; a pure line version has to carry depth with occlusion and edge continuity alone _(inference)_.

**Practical consequence for the Portfolio prompt:** "2:1 isometric" and "true isometric / 30 degrees" are two different drawings. If the prompt says 2:1 it should say **26.57 degrees**, and if it says 30 degrees it should stop saying 2:1 [5][6].

### Glass treatments

What actually makes a surface read as glass, from an implementation teardown [15] and an app-icon teardown [16]:

- **Refraction / displacement** · light bending as it passes through the medium; implemented as a displacement map that shifts the pixels behind the shape, strongest at the edges [15]. This is the single element that separates glass from a plain translucent panel.
- **Backdrop blur** · a modest gaussian on what is behind (1 to 4px in the CSS implementation), enough to soften without destroying legibility [15].
- **Specular edge highlight** · a painted rim map around the shape's edge, softened and composited back on top [15]. Apple's current direction is *sharper* specular highlights, plus an "Exterior" option that lights both the inside and outside edge of the object [16].
- **Saturation boost** in the displaced region, so refracted colour reads as glass rather than grey [15].
- **Inner shadow** and edge treatment give the wall of the glass thickness _(inference from [15][16]: both describe rim and edge work as the load-bearing part)_.
- **Chromatic aberration** at the lens edge (red/blue split) is a real part of the look but in app icons it is painted into the artwork by hand, not generated [16].
- **Layer order matters**: content sits above the filter layer so text stays legible [15]. Apple-style icons are foreground / midground / background layers, with translucency reduced toward the lower layer to keep the silhouette legible [16].
- Known artefact: refraction over high-contrast backgrounds produces jagged edges; 5 to 10 percent blur fixes it at the cost of crispness [16].

## Vocabulary worth putting in prompts

| TERM | what it means | why an image model responds to it | source # |
|---|---|---|---|
| Live area / trim area / padding | where content sits, how far it may bleed, the untouched outer margin | gives the model an explicit composition frame, which suppresses edge-to-edge crops and stray marks in the margin | 1, 3, 7, 10, 11 |
| Keyshape / keyline | the circle, square, portrait and landscape rect templates every icon grows from | names a small shape vocabulary, pushing output toward geometric primitives instead of freehand illustration | 1, 7 |
| Uniform stroke weight, centred on the path | one weight everywhere, stroke centred not inside/outside | "uniform" is the single highest-leverage word against the model's habit of tapering and varying line width | 3, 10 |
| Butt / round / square cap; miter / round join | how a line ends and how two lines meet | a concrete, nameable terminal style stops the model mixing endings within one drawing | 4, 10 |
| Constant corner radius | one radius value on all outer corners across the set | prevents the per-icon radius drift that makes a generated set look assembled from different hands | 10, 11 |
| Rounded exterior corners, sharp interior angles | a specific house rule, not a generic "rounded" | a rule with two clauses is much harder for the model to average away than "rounded corners" | 4 |
| Optical size compensation / optically centred | circles and triangles drawn larger; asymmetric shapes nudged off geometric centre | licenses the model to break the bounding box, which is what stops icons in a set reading as different sizes | 9, 12 |
| Counter / negative space, minimum 1 stroke gap | the enclosed and between-element gaps | explicitly reserving gaps is the counter to the model's tendency to fill enclosed shapes | 10 |
| Whole-number coordinates, aligned to the pixel grid | no sub-pixel path positions | signals crispness and vector flatness rather than a soft raster drawing | 3 |
| 45 degree orthogonals, 15 degree increments | angles snap to a fixed ladder | replaces arbitrary wobbly diagonals with a discrete set | 1, 8 |
| Boolean union / subtract, single closed path | icon built as combined primitives, exported as one path | "single path" language pushes toward flat, unshaded, uniform artwork | 10 |
| 2:1 isometric, 26.57 degrees from horizontal | the pixel/illustration isometric convention | a numeric angle is far more reliable than the word "isometric", which the model reads as generic 3D | 6, 13, 14 |
| True isometric, 120 degrees between axes, 30 degrees from horizontal | the real projection | the alternative to the above; naming which one you want removes the ambiguity | 5 |
| Axonometric, no vanishing point, parallel projection | no perspective convergence | directly suppresses the model's default one-point perspective | 5, 6 |
| Specular edge highlight, exterior edge | the bright rim on the glass wall, inner and outer | the highest-value single word for glass; without it the result is just a blurred translucent blob | 15, 16 |
| Refraction / displacement at the edges | background pixels shifted by the glass | the element that separates glass from frosted plastic | 15 |
| Backdrop blur, saturation boost | soft, colour-amplified content behind the pane | keeps the glass from reading grey and dead | 15 |
| Chromatic aberration at the lens edge | slight red/blue split on the rim | a small, specific cue that reads as real optics | 16 |

## What separates a convincing result from a generic one

1. **A named terminal and join style, held.** Generic output mixes round and flat endings inside one icon. Every real system picks one and writes it down [4][10].
2. **One stroke weight, including at junctions.** Convincing sets read as if drawn with a single pen; the give-away in generated icons is weight that thickens on curves and thins at crossings [3][10].
3. **Optical corrections that visibly break the grid.** A set where every icon fits its box exactly reads mechanical and, paradoxically, uneven. Circles overshooting and triangles nudged off centre is what real sets do [9][12].
4. **Restraint at the target size.** Detail that cannot survive 16 or 24px is the main thing separating a professional set from an illustration set [3][4].
5. **A shared shape vocabulary.** Reused rectangles, arrows and circles across icons, rather than each icon invented from scratch [3][4].
6. **For isometric: one angle, everywhere, verified.** The tell of amateur isometric is mixed angles and seams that do not meet; the fix is one primitive repeated and unit-counted, not eyeballed [13][14].
7. **For glass: edges do the work.** Rim highlight, refraction and edge thickness carry the read; interior blur alone gives the generic 2020 glassmorphism card [15][16].

## Model-side levers

- **Structure the prompt, do not pile up adjectives.** A workable ordering for image prompts is subject, action, setting, style, lighting, mood, details; vague evaluative words ("beautiful", "aesthetic") do nothing [17]. Google's own guidance is the same: describe the scene in prose rather than listing keywords [2].
- **Describe, do not name, the style.** Google's icon/logo guidance is to specify font style descriptively, define the colour scheme explicitly, and state structural containment ("put the logo in a circle") [2].
- **Transparency is the big one: current Gemini/Nano Banana output is RGB with no alpha channel.** Asking for a transparent background does not produce one, and the word "transparent" actively pushes the model to *paint* an opaque grey-and-white checkerboard that only looks like transparency [18]. Two consequences:
  - Prompt for a **pure white #FFFFFF background** (or pure solid black), never "transparent" [18].
  - Recover real alpha by rendering the same subject once on pure white and once on pure black and comparing: identical pixels are opaque, maximally different pixels are transparent, and the in-between recovers partial opacity, which preserves soft glows that a binary background remover destroys [18]. Use the model's *edit* path to swap the background rather than regenerating, so the two renders stay pixel-aligned [18].
  - Green #00FF00 is a fallback second plate if black is hard to get [18].
- **Set consistency comes from reference images, not from words.** Gemini supports multiple reference images (up to 14) and its documented consistency mechanism is providing prior renders alongside the instruction [2]; the same advice appears in practitioner writeups, where uploading the canonical asset is what preserves fidelity across variants [17]. _(inference)_ For a set: generate one exemplary icon, approve it, then pass it back as the style reference for every subsequent icon rather than re-describing the style.
- **Known failure modes to write explicit negative clauses against** _(inference, grounded in the mechanisms above)_: wobbling and variable stroke weight (counter: "uniform stroke weight throughout, no tapering, no calligraphic variation"); filled shapes where outlines were wanted ("outline only, no fills, counters left empty"); added drop shadows and gradients ("flat, no shadow, no gradient, no highlight"); invented labels and letterforms ("no text, no lettering, no numerals") · Gemini is documented as *good* at text rendering [2], which is exactly why it volunteers text you did not ask for; checkerboard backgrounds [18]; and perspective convergence in isometric work (counter: "parallel projection, no vanishing point") [5][6].
- **Nothing solid turned up** on published, measured evaluations of image models' stroke-weight consistency for icon sets. The claims made by icon-generator products about enforcing cap style and stroke weight at generation time are vendor marketing and were not verifiable; they are not cited here.

## Proposed clause upgrades

1. **(All three systems)** Replace any bare "2px stroke" with **"a single uniform stroke weight throughout, centred on the path, identical on curves, straights and junctions; no tapering, no calligraphic variation."** Centred alignment and uniformity are the two rules every real system states, and "uniform" is the direct counter to the model's tapering habit [3][10].
2. **(Zepto line, Portfolio flat)** Add an explicit terminal and join clause, one of: **"round caps on all open paths and round joins at every corner"** or **"square butt caps, rounded exterior corners, sharp interior angles."** Two systems chose opposite conventions and both wrote them down; leaving it unspecified is what lets the model mix endings inside one icon [4][10].
3. **(All three)** Add **"a constant corner radius applied to every outer corner across the whole set; interior corners stay sharp."** Per-icon radius drift is the loudest tell that a generated set was not drawn by one hand [4][10][11].
4. **(All three)** Add a composition frame: **"drawn on a 24px canvas with 2px padding and a 20px live area; nothing crosses into the padding."** Naming live area and padding gives the model an explicit frame instead of letting it crop edge to edge [1][3][7].
5. **(All three)** Add **"built from geometric primitives (circle, square, portrait and landscape rectangle) reused across the set; angles snap to 45 degrees, or 15 degree increments where 45 will not do."** This replaces arbitrary wobbly diagonals with a discrete ladder and enforces a shared shape vocabulary [1][3][8].
6. **(All three)** Add an optical clause: **"optically balanced, not mathematically centred: circles and triangles drawn slightly larger than squares, asymmetric shapes nudged to their optical centre."** Grid-perfect output reads mechanical and, oddly, uneven; the correction is what real sets do [9][12].
7. **(All three)** Replace "transparent background" with **"isolated on a pure white #FFFFFF background, nothing else in frame"** and add a pipeline note to re-render the same subject on pure solid black via the edit path and recover alpha by difference. The models emit RGB with no alpha, and the word "transparent" makes them paint a fake checkerboard [18].
8. **(All three)** Add a standing negative clause: **"no text, no lettering, no numerals, no drop shadow, no gradient, no highlight, no background object, no checkerboard."** Gemini is documented as eager and capable at text rendering, so text must be suppressed explicitly rather than merely not requested [2][18].
9. **(Portfolio isometric)** Fix the projection wording to one of two exact forms: **"2:1 isometric, ground axes at 26.57 degrees from horizontal (arctan 1/2)"** or **"true isometric, 120 degrees between the three axes, ground axes at 30 degrees from horizontal."** They are different drawings and the word "isometric" alone does not pick one; 2:1 is strictly dimetric [5][6][13][14].
10. **(Portfolio isometric)** Add **"parallel projection, no vanishing point, no perspective convergence; every parallel edge stays parallel."** This is the direct suppressor for the model's default one-point perspective, which is the most common way generated "isometric" fails [5][6].
11. **(Portfolio isometric)** Add **"all receding edges share one angle; seams meet exactly, no near-miss joins."** Mixed angles and unmet seams are the named amateur tell, and the professional fix is one repeated primitive rather than freehand [13][14].
12. **(Portfolio isometric, line-only)** Add **"depth is carried by occlusion and continuous edges only; no tone, no fills, no shading."** Isometric convention normally reads depth from three tonal values, so a line-only version has to be told where depth comes from instead _(inference from [13])_.
13. **(Zepto premium glass)** Replace generic glassmorphism wording with the mechanism: **"a sharp specular highlight along the rim, lighting both the inner and the outer edge; visible refraction displacing the background at the edges; a soft backdrop blur with a slight saturation boost behind the pane; a faint chromatic split at the lens edge."** Edge behaviour is what separates glass from a blurred translucent blob, and specular plus refraction are the two named load-bearing components [15][16].
14. **(Zepto premium glass)** Add **"three layers: a legible foreground mark, a midground, and a background pane, with the lower layers reduced in opacity so the silhouette stays readable"** plus **"the mark itself stays simple: no detail that would not survive at 24px."** Layer separation with reduced lower-layer opacity is the documented way glass icons keep their shape legible [16], and size-survivability is the standing simplicity rule [3][4].

## Sources

1. Icon Grids and Keylines Demystified, Helena Zhang · https://minoraxis.medium.com/icon-grids-keylines-demystified-5a228fe08cfd · the anatomy vocabulary (pixel grid, keyshapes, orthogonals, live/trim area, mask) and the "grids are guides not rules" caveat.
2. Gemini API image generation docs, Google · https://ai.google.dev/gemini-api/docs/image-generation · official prompting guidance: describe scenes in prose, icon/logo advice, text rendering strength, multi-reference-image consistency (up to 14).
3. Icon Design Guidelines: How to Design Icons, Hugeicons · https://hugeicons.com/blog/design/how-to-design-icons · 24px grid with 2px padding and 20px live area, whole-number coordinates, uniform stroke and corner rounding, reusable shapes, simplicity at small sizes.
4. Iconography, Atlassian Design System · https://atlassian.design/foundations/iconography/ · 16px box (12px small), 1.5px stroke, square terminals with "none" end points, rounded exterior + sharp interior corners, avoid diagonal 3D effects.
5. Isometric projection, Wikipedia · https://en.wikipedia.org/wiki/Isometric_projection · 120 degrees between axes, the 45 / 35.264 degree rotations, about 80 percent foreshortening, the axonometric family.
6. Isometric video game graphics, Wikipedia · https://en.wikipedia.org/wiki/Isometric_video_game_graphics · the 2:1 ratio equals arctan(1/2) = 26.565 degrees, why it is dimetric (116.565 / 116.565 / 126.870), and the naming misnomer.
7. My understanding of icon grid and keyline, Aditi Saini · https://medium.muz.li/my-understanding-of-icon-grid-and-keyline-ba599ea6d09 · concrete 24px keyshape numbers (circles 10/20, square 18x18, rects 16x20 and 20x16) and a 1px grid chosen for a 1.5px stroke.
8. Unlocking the Magic of Icon Design: Grids, Keylines and Beyond · https://designproject.io/blog/icon-design-grids-keylines/ · orthogonals at 90 and 45 degrees with 15 and 5 degree increments; live area and padding definitions; 1px vs 0.5px increments.
9. Optical effects in user interfaces, Slava Shestopalov · https://medium.com/design-bridges/optical-effects-9fca82b4cd9a · letting visually smaller icons overflow while padding squarish ones, optical centering against a circumscribing circle, handle-adjusted corner smoothing, superellipse, height-vs-width sensitivity.
10. Iconography styles and guidelines, Telerik / Kendo Design System · https://www.telerik.com/design-system/docs/foundation/iconography/styles-and-guidelines/ · the most complete fetchable spec: 32px canvas exporting at 24, 26x26 live area, 3px trim, 2px stroke centred on path, round caps and joins, constant 2px outer radius, 2px minimum element spacing, visual centering for asymmetric shapes, single-path export variants.
11. Iconography, Denali Design · https://denali.design/design/principles/iconography · 48px grid, 46x46 live area, 2px padding, 4px stroke with permitted optical exceptions, 2px corner radius, nothing may leave the live area.
12. Research/summary results on visual size and visual alignment in icon sets (search result summary only, article body not fetched) · https://www.sciencedirect.com/science/article/abs/pii/S0141938223002056 · used only for the general point that non-square shapes must be drawn larger to balance optically. UNVERIFIED body; the same claim is independently supported by [9].
13. How Isometric Pixel Art Actually Works (the 2:1 Trick) · https://the-pixel.art/articles/isometric-pixel-art/ · true 30 degrees gives an uneven staircase, 2:1 is technically dimetric, build from one repeated tile, three-value shading.
14. Pixelblog 41: Isometric Pixel Art, Slynyrd · https://www.slynyrd.com/blog/2022/11/28/pixelblog-41-isometric-pixel-art · explicit "true isometric is 30 degrees, pixel isometric compromises at 2:1, closer to 26.5 degrees"; count units with a 2:1 ruler rather than trusting the eye; build from stacked primitives.
15. How to create Liquid Glass effects with CSS and SVG, LogRocket · https://blog.logrocket.com/how-create-liquid-glass-effects-css-and-svg/ · the layer stack: displacement-map refraction, 1 to 4px backdrop blur, painted and blurred specular rim, saturation boost, compositing order, content above the filter layer.
16. Liquid Glass App Icons, Parakeet · https://parakeet.co/blog/liquid-glass-app-icons/ · sharper specular highlights and the "Exterior" inner+outer edge option, layered foreground/midground/background, reduced lower-layer opacity for silhouette legibility, hand-painted chromatic aberration, jagged-edge artefact and the 5 to 10 percent blur fix.
17. How to Write High-Performance Image Prompts for Nano Banana, JumpFly · https://www.jumpfly.com/blog/how-to-write-high-performance-image-prompts-for-nanobanana-using-gemini/ · the subject / action / setting / style / lighting / mood / details ordering, avoid vague evaluative adjectives, upload reference assets to hold fidelity across variants.
18. Gemini Transparent Background: Nano Banana PNG Fix, Transparify · https://transparify.app/blog/gemini-transparent-background · the model outputs RGB with no alpha, "transparent" in the prompt causes a painted checkerboard, and the pure-white / pure-black double-render alpha recovery method (with green as fallback, and using edit rather than regenerate to keep renders aligned).

**UNVERIFIED / could not be fetched (JavaScript-rendered; no claims above are cited to these):** Material Design 3 icon guidance (m3.material.io/styles/icons/designing-icons and m2.material.io/design/iconography/system-icons.html), Apple Human Interface Guidelines icons, app icons and SF Symbols pages (developer.apple.com/design/human-interface-guidelines/...), IBM Carbon iconography (carbondesignsystem.com/guidelines/icons/design and /elements/icons/library/), Shopify Polaris icons (polaris-icons.shopify.com, redirects to shopify.dev), Nucleo blog index (nucleoapp.com/blog), Icons8 "Anatomy of the icon" (fetched but contained only grid/keyline/live-area/padding basics already covered by [1] and [3]; no terminal, join, counter, boolean or hinting vocabulary).
