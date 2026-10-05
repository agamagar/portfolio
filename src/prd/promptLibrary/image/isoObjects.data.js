// Image-generation prompts: Isometric objects.
//
// Two sets built on one locked spec block: consumer electronics (the real devices,
// each in its own true colours) and desk objects (one muted palette across the set).
// Ported here from Claude/3d-isometric-asset-prompt-library.md and
// Claude/set-01-consumer-electronics.md, with three clauses corrected against the
// research dossiers (see the Sources block on the system spec).
//
// { pre } blocks carrying rules:true get the library rules appended at assembly.
// Part of the prompt library (src/prd/promptLibrary). See index.js for the map.

// The locked spec block. Identical in every prompt below; this constant is why.
const SPEC =
  "Realistic 3D isometric render of a real product, product-photography quality, isolated on a pure flat white #FFFFFF background, nothing else in frame. True isometric projection: camera at 45 degrees azimuth and 35.264 degrees elevation, 120 degrees between the three axes, ground axes at 30 degrees from horizontal, orthographic parallel projection with no vanishing point and no perspective convergence, every parallel edge stays parallel. Single object centred, occupying the centre 70 percent of the frame with even margin, well composed and balanced. Soft top-left key light plus gentle fill, one soft contact shadow directly beneath the object, no cast shadow across the floor, no ground plane. Physically based materials rendered true to life, accurate surface finish and reflectivity, subtle micro-bevels on every hard edge, clean and new. Tack sharp, high detail, realistic lighting. No watermark, no environment reflections, no ground grid, no checkerboard.";

// The desk set swaps two clauses of the spec block: matte miniature-model materials
// instead of true-to-life product finishes, and one locked palette instead of real colours.
const SPEC_DESK =
  "3D isometric asset, miniature-model feel, product-render quality, isolated on a pure flat white #FFFFFF background, nothing else in frame. True isometric projection: camera at 45 degrees azimuth and 35.264 degrees elevation, 120 degrees between the three axes, ground axes at 30 degrees from horizontal, orthographic parallel projection with no vanishing point and no perspective convergence, every parallel edge stays parallel. Single object centred, occupying the centre 70 percent of the frame with even margin. Soft top-left key light plus gentle fill, one soft contact shadow directly beneath the object, no cast shadow across the floor, no ground plane. Matte physically based materials, subtle micro-bevels on every hard edge, clean surface, no dust or wear. Palette held to warm greys, cream, matte black and oiled walnut, restrained saturation, one burnt-orange accent only where named. Tack sharp, high detail. No watermark, no environment reflections, no ground grid, no checkerboard.";

const asset = (line, spec = SPEC) => ({ pre: `${line}\n\n${spec}`, rules: true });

export const SPECS = [
  {
    id: "pl-iso-objects-system",
    group: "Isometric objects",
    eyebrow: "Objects",
    title: "Isometric objects · the system",
    summary:
      "One locked spec block plus a small per-asset slot, which is how a batch of six to twenty objects reads as one family instead of twenty separate renders. Two sets are built on it below: eight consumer electronics in their own real colours, and eight desk objects on one muted palette.",
    "What this is": [
      "A set system, not a single prompt. Consistency comes from never editing the spec block between assets; only the per-asset slot changes.",
      "Detail comes from naming real parts and real materials, not from adjectives. 'Knurled focus knob' renders; 'premium' does not.",
      "Two catalogs below, one per set. Every prompt is self-contained: the asset line, then the spec block verbatim.",
    ],
    "The constant (never edit it between assets)": [
      "Fixed camera: true isometric, 45 degrees azimuth and 35.264 degrees elevation, 120 degrees between the three axes, ground axes at 30 degrees from horizontal.",
      "Fixed parallel projection: no vanishing point, no perspective convergence, every parallel edge stays parallel. This is the direct suppressor for the model's default one-point perspective, which is the most common way a generated isometric fails.",
      "Fixed ground: pure flat white #FFFFFF, nothing else in frame, one soft contact shadow directly beneath the object and no ground plane.",
      "Fixed framing: single object centred at the centre 70 percent of the frame, so a television and a pair of earbuds end up the same on-screen size.",
      "Fixed light rig: soft top-left key plus gentle fill, so every object reads its depth the same way.",
      "Fixed render register: physically based materials, micro-bevels on every hard edge, tack sharp.",
    ],
    "The per-asset slot (the only part that changes)": [
      "PRODUCT: the real product, named plainly and specifically.",
      "FORM: the silhouette and proportions in one clause. Models drift proportions badly and one clause ('taller than wide', 'thin slab') fixes it.",
      "SIGNATURE DETAILS: two or three mechanisms or parts that make this object itself. Two or three read as intentional; ten read as noise and get averaged into mush.",
      "MATERIALS: named by their physics (brushed anodised aluminium, matte injection-moulded ABS, frosted polycarbonate, oiled walnut, leatherette with visible grain), with the colour anchored to a hex.",
    ],
    "The two sets": [
      "Consumer electronics: the palette is fluid, because each device wears its real colours and finishes. What holds the set together is the spec block alone.",
      "Desk objects: one locked palette (warm greys, cream, matte black, oiled walnut, one burnt-orange accent) across all eight, so the set reads as a family of props rather than a shelf of real products.",
    ],
    "How to run a set": [
      "Generate one asset first and get it perfect. It becomes the master.",
      "Chain the rest off the master through the edit path, passing the master as the input image: 'Use this image as the exact reference for camera angle, isometric projection, lighting, contact shadow, background, framing and render style. Keep all of that identical. Replace the object with: [the next asset line].' Re-describing the whole scene per asset is where sets drift.",
      "On GPT Image 2 there is no input_fidelity dial to turn up. The model processes image inputs at high fidelity by default and the parameter applies only to gpt-image-1.5 and gpt-image-1, so reference strength has to be managed in language, not in parameters.",
      "Ask for pure white, never for a transparent background. These models emit RGB with no alpha channel, and the word 'transparent' pushes the model to paint an opaque grey-and-white checkerboard that only looks like transparency.",
      "Recover real alpha downstream: re-render the same object on pure solid black through the edit path (so the two renders stay pixel-aligned) and compare. Identical pixels are opaque, maximally different pixels are transparent, and the in-between recovers the soft contact shadow that a binary background remover would destroy.",
      "Batch the whole set back to back in one session, with the same settings. Do not return a week later to a drifted model version.",
    ],
    "Copy-paste template": {
      pre: `[PRODUCT and FORM in one clause]. [SIGNATURE DETAILS, two or three named mechanisms or parts]. Real materials: [material and finish, colour anchored to a hex], [material and finish, hex], [material and finish, hex].\n\n${SPEC} {{RULES}}`,
    },
    "QA per asset": [
      "Parallel edges, no vanishing point?",
      "Pure white ground, even margin, object well centred, no painted checkerboard?",
      "One soft contact shadow only, grounded rather than floating, no ground plane?",
      "Colours read as the real object and match the anchored hex rather than being invented?",
      "Materials true to life, right gloss or matte, right metal?",
      "On-screen size normalised across the whole set?",
      "Assets two onwards chained off the master reference rather than re-described from scratch?",
      "Fail a box and you change only the one clause that governs it. The spec block stays untouched.",
    ],
    Sources: [
      "Ported from Claude/3d-isometric-asset-prompt-library.md (the system) and Claude/set-01-consumer-electronics.md (the eight devices).",
      "Projection wording corrected against research/icons.md: the source doc gave the 45 / 35.264 degree camera, which is true isometric, so the prompt now states the projection completely (120 degrees between the axes, 30 degrees from horizontal) and adds the explicit no-vanishing-point clause. Isometric alone does not name a drawing: the 2:1 convention most illustration calls isometric is 26.57 degrees and is strictly dimetric.",
      "Transparency corrected against research/icons.md source 18: the source doc asked for a transparent background in the prompt text. The models emit RGB with no alpha and the word makes them paint a fake checkerboard, so the ground is pure white here and alpha is recovered by the white and black double render through the edit path.",
      "input_fidelity corrected against research/models.md source 5: the OpenAI cookbook states it applies to gpt-image-1.5 and gpt-image-1, not gpt-image-2. The source doc's chaining step told you to set it high on GPT Image 2, where it is not a lever at all.",
    ],
  },

  {
    id: "pl-iso-objects-electronics",
    group: "Isometric objects",
    eyebrow: "Set 01",
    title: "Consumer electronics · the eight",
    summary:
      "Eight real devices, each in its own true colours and finishes: smart TV, phone, games console, watch, earbuds, power bank, Bluetooth speaker, smart speaker. The palette is fluid per product; the spec block is what makes them one set. Generate the TV first, then chain the other seven off it. Copy-paste ready.",
    "Smart TV (the master, generate this first)": asset(
      "A slim flat-panel smart television on a low central pedestal stand, the screen much wider than tall with a near-borderless dark graphite bezel and a slim brushed-aluminium foot. The glass display is powered on showing a vivid nature wallpaper. Screen corners gently rounded as a squircle, not a circular arc. Real materials: matte black bezel (#1B1D22), silver brushed-aluminium stand (#C7C9CC), glossy glass screen."
    ),
    "Phone": asset(
      "A modern smartphone standing slightly angled, a tall rounded-rectangle glass slab thinner than a finger with continuous squircle corners rather than circular arcs, a raised squircle camera module with three lenses at the top left, and a machined aluminium side rail with one recessed button. Real materials: deep midnight-blue glass back (#2E3A4E), matte titanium-silver rail (#B9BCC0), glossy display showing a colourful abstract wallpaper."
    ),
    "Games console": asset(
      "A modern home games console standing vertically, a tall two-tone body with glossy white curved side panels wrapping a matte-black centre core, a thin blue light seam running down the middle, and a disc slot with two round ports on the front. Real materials: glossy off-white plastic panels (#EDEEF0), matte black core (#15161A), soft blue light accent (#2B6FF6)."
    ),
    "Smart watch": asset(
      "A smartwatch at a slight tilt, a rounded-square aluminium case with continuous squircle corners, a knurled rotating crown and a flush side button on the right edge, and a soft silicone sport band curving away on both sides. The glass display is powered on with a colourful watch face. Real materials: space-grey aluminium case (#3B3D40), midnight silicone band (#23252A), glossy black glass front."
    ),
    "Earbuds": asset(
      "A pair of true-wireless earbuds beside their open charging case. The case is a small glossy-white rounded pebble with a squircle profile, a flip-up lid and a tiny status LED; each bud has a short white stem and a light-grey silicone ear tip. Real materials: glossy white plastic (#F5F6F7), soft-grey tips (#C4C6C9), amber-green LED (#8FC93A)."
    ),
    "Power bank": asset(
      "A rectangular power bank slab with continuous squircle corners, a brushed-aluminium body thicker than a phone, a recessed USB-C and USB-A port on one edge, and four small round charge-level LEDs on the top face. Real materials: matte dark-grey aluminium shell (#33363B), white LED dots (#F2F3F4)."
    ),
    "Bluetooth speaker": asset(
      "A portable cylindrical Bluetooth speaker standing upright, wrapped in a charcoal woven-fabric mesh grille, with a dark soft-touch rubber top cap carrying three raised control buttons, a rubberised base and a short grey fabric carry loop. Real materials: charcoal fabric (#2C2E31), black rubber (#1A1B1D), subtle brushed-metal top ring (#9A9DA1)."
    ),
    "Smart speaker": asset(
      "A smart speaker: a short fabric-wrapped cylinder wider than it is tall, with a dark top control plate carrying two pinhole buttons and a mic dot, and a glowing cyan-blue light ring around the bottom edge. Real materials: heather-grey woven fabric (#8C9095), matte dark top (#1E1F22), glowing blue-cyan light ring (#22B8E6)."
    ),
    "Why this reads as one set even though the colours all differ": [
      "Same camera, ground and framing, so every device stands on an identical stage.",
      "Same light rig and single contact shadow, so every device reads its depth and weight the same way.",
      "Same physically based render register, so all eight feel photographed on the same day.",
      "Normalised on-screen size, so the television and the earbuds sit at the same scale, icon-set style.",
      "The colours change and the composition never does. That is the whole trick.",
    ],
  },

  {
    id: "pl-iso-objects-desk",
    group: "Isometric objects",
    eyebrow: "Set 02",
    title: "Desk objects · the starter set",
    summary:
      "Nine desk props on one locked palette (warm greys, cream, matte black, oiled walnut, a single burnt-orange accent), the counterpart to the electronics set: here the palette does the holding, not just the spec block. Rotary phone, twin-lens camera, mechanical keyboard, kitchen scale, cassette player, desk lamp, pencil cup, calculator, and a discount coupon in two states, uncut and torn. Copy-paste ready.",
    "Rotary desk phone": asset(
      "A rotary desk telephone, a squat rectangular base wider than tall, a circular finger-wheel dial with ten holes on the top face, a curved handset resting in its cradle, and a coiled cable running to the base. Materials: matte injection-moulded black body, one burnt-orange dial ring.",
      SPEC_DESK
    ),
    "Twin-lens film camera": asset(
      "A twin-lens reflex film camera, a boxy upright body taller than wide with the waist-level viewfinder hood open on top, twin round lenses stacked on the front face, and a knurled focus knob on the side. Materials: leatherette body wrap with visible grain, brushed metal lens barrels, one burnt-orange shutter dot.",
      SPEC_DESK
    ),
    "Mechanical keyboard": asset(
      "A mechanical keyboard, a thin slab wider than deep, sculpted keycaps in stepped rows, an exposed switch plate along the top edge, and a braided cable exiting the back left corner. Materials: matte ABS keycaps in warm grey and cream, anodised aluminium case, one burnt-orange escape key.",
      SPEC_DESK
    ),
    "Analogue kitchen scale": asset(
      "An analogue kitchen scale, a round dial face set into a wide flat base with a single needle, a shallow weighing platform on top, and folded metal legs beneath. Materials: cream enamelled metal body, brushed steel platform, one burnt-orange needle.",
      SPEC_DESK
    ),
    "Cassette player": asset(
      "A portable cassette player, a flat rectangular body with a hinged clear window over the tape door, five ribbed transport buttons in a row along the front edge, and a thumbwheel volume dial on the side. Materials: matte black moulded plastic, frosted polycarbonate window, one burnt-orange play triangle.",
      SPEC_DESK
    ),
    "Desk lamp": asset(
      "An articulated desk lamp, a weighted round base, two hinged arm segments with visible spring joints, and a conical shade tilted forward. Materials: matte warm-grey painted steel, exposed springs in bare metal, one burnt-orange inner shade.",
      SPEC_DESK
    ),
    "Pencil cup": asset(
      "A film-canister pencil cup, a cylindrical body taller than wide with a knurled cap ring at the base, holding a fan of pencils and one ruler standing upright inside. Materials: matte black anodised aluminium body, oiled walnut pencils, one burnt-orange pencil.",
      SPEC_DESK
    ),
    "Pocket calculator": asset(
      "A pocket calculator, a thin slab with a small segmented LCD strip at the top, a grid of low rounded rubber keys below it, and a solar strip above the display. Materials: matte cream injection-moulded shell, soft warm-grey rubber keys, one burnt-orange equals key.",
      SPEC_DESK
    ),
    "Discount coupon · torn": asset(
      "A discount voucher card lying flat, wider than tall, one corner curling up off the ground. It has been torn from its counterfoil along a macro perforation of roughly eight teeth per inch: the ties between the cuts are visibly snapped, so that edge is ragged and carries raised paper fibre, and the detached stub, about a third of the card, sits just beside it. The two semicircular notches biting into the long edges are die-cut instead, their curves clean and smooth, and the contrast between the torn edge and the cut edge is the point of the object. The face carries an empty embossed cartouche where the amount would sit, a blank guilloche of fine interlaced engine-turned line work around the border, and a small hot-foil stamped seal with a real relief impression rather than flat silver ink. On the stub, an opaque silver scratch-off latex panel half removed, with tiny curls of scratched latex resting on the card. Every panel stays empty. Materials: 14pt uncoated cream card stock with a visible paper tooth, one burnt-orange printed rule, matte silver foil.",
      SPEC_DESK
    ),
    "Discount coupon · uncut": asset(
      "A discount voucher card in pristine unused condition, lying perfectly flat, wider than tall, all four corners crisp and square with no curl and no handling wear. It is still whole: the card and its counterfoil are one piece, joined by an intact macro perforation of roughly eight teeth per inch that reads as a straight ruled row of small punched holes with the paper ties between them unbroken, so the line is dead straight and there is no ragged edge and no raised fibre anywhere on it. The two semicircular notches biting into the long edges are die-cut, their curves clean and smooth. The face carries an empty embossed cartouche where the amount would sit, a blank guilloche of fine interlaced engine-turned line work around the border, and a small hot-foil stamped seal with a real relief impression rather than flat silver ink. On the stub, an opaque silver scratch-off latex panel completely intact, an even unbroken field with a soft metallic sheen and not a single scratch through it. Every panel stays empty. Materials: 14pt uncoated cream card stock with a visible paper tooth, one burnt-orange printed rule, matte silver foil.",
      SPEC_DESK
    ),
    "Holding the palette": [
      "Pick four or five neutrals and at most two accents up front, then let every asset draw only from that set.",
      "Keep one house material list across the set. If asset one is matte ABS and anodised aluminium, do not let asset seven introduce chrome and glass.",
      "The accent is a single element per object, never a wash. One orange key, one orange needle, one orange dial ring.",
    ],
    "Reading as a coupon with no word on it": [
      "The library rule bars text, letters, numbers and labels from every image, so a coupon here cannot say fifty percent off. What makes it read is the separation logic, not the offer.",
      "A coupon is a two-part document, so the stub has to be in frame. Showing only the retained half loses the whole logic of the object. The stub sits at about a third of the card, torn free and resting beside it.",
      "Two different edges on one object is the strongest tell, and the one a model gets wrong. A perforation is torn: the ties between the cuts snap and leave a ragged edge with raised paper fibre. A notch is die-cut: the blade goes clean through and the curve is smooth. Asked for loosely, both come back as the same decorative scallop.",
      "Countable pitch beats adjectives. Macro perforation runs 3 to 18 teeth per inch, so naming roughly eight gives the edge a rhythm the way perf gauge 13 does for the stamp specimen; 20 TPI and up is micro-perf, which is a different, much finer look.",
      "Foil and embossing are depth, not colour. Hot foil is transferred under heat and pressure and leaves a relief impression, so asking for a stamped seal with a real impression is what stops the model returning flat silver ink. Guilloche, the interlaced engine-turned line work of currency printing, carries the security register as pure pattern with nothing to read.",
      "One mechanism, half-used: the scratch-off latex panel partly removed, with curls of latex on the card. Mechanisms render; the word premium does not.",
      "The void pantograph, the background that reads as a word only when photocopied, is the one real coupon feature deliberately left out. It resolves as lettering, which the rules forbid.",
      "Two states, one object. The uncut card is the whole document with the perforation intact, a dead straight ruled row of holes with the ties unbroken and no ragged fibre anywhere; the torn card has been separated, so the ties are snapped and the edge is ragged. Generate the uncut one first and chain the torn one off it, then the pair reads as the same coupon before and after.",
      "Sources: research/coupon.md (TPI and ties, macro versus micro perforation, tear release, die cut versus tear, guilloche, hot foil relief, scratch-off panels, void pantograph). Perforation-as-paper-removed and the empty-panel-as-form argument come from research/specimen.md, sources 1 and 2.",
    ],
  },
];

export default SPECS;
