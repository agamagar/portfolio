// Recipe for the "Airplane views" prompt system. Single source for the interactive
// picker (AirplanePromptBuilder) AND the on-page fleet roster (airplanes.js composes
// it from these constants at assembly), so the two can never drift.
//
// This is the group the shared recipe contract in ./recipe.js was generalised from;
// its foot now comes from ../rules so the library states its global rules once.
//
// Three dials of the prompt:
//   1. Aircraft  - a roster of real commercial families in service (see AIRCRAFT). Each
//      model carries an identity `desc` (its distinguishing silhouette) and a `category`
//      (a shared silhouette archetype that supplies the per-view cues), so the roster can
//      grow to any number of models without re-authoring 6 cues per model.
//   2. View      - top / front / side / back / three-quarter / isometric (see VIEWS).
//   3. Style     - line drawing, studio render, or an art-directed campaign (see below).
// The aircraft `desc`, the view `proj`, and the category `cues` describe shape only, so
// they hold in any style; a style swaps only the surrounding style prose.

import { withRules } from "../rules.js";

// ---------- style constants: line ----------
export const STYLE_LINE_ORTHO =
  "A general-arrangement orthographic drawing in the manner of a manufacturer airport-planning 3-view: parallel projection, no perspective and no vanishing points. Strict CAD linework in near-black with a 2:1 weight hierarchy, roughly 0.6mm continuous for visible outlines and 0.3mm for panel lines and leaders, rounded caps, precise and confident, no fills, no shading and no gradients, no construction lines and no hatching, on a pure flat white background, the aircraft centred in the frame with generous padding. Refined and technical, like a plate from a premium aircraft recognition chart. Identify the type the way a spotter's chart does, by wing planform, engine mounting and nacelle cross-section, fuselage length and exit arrangement, and tail shape, so the family is unmistakable. In clean flight configuration: landing gear retracted and omitted (no wheels), flaps in, no ground, no clouds, no people.";

export const STYLE_LINE_VOLUME =
  "A technical line drawing in parallel projection with no perspective. Strict CAD linework in near-black with a 2:1 weight hierarchy, roughly 0.6mm continuous for the outer contour and 0.3mm for interior contour and panel lines, rounded caps, volume described only by clean contour lines, no fills, no shading and no gradients, no construction lines, on a pure flat white background, the aircraft centred in the frame with generous padding. Refined and technical, like a plate from a premium aircraft recognition chart. Identify the type the way a spotter's chart does, by wing planform, engine mounting and nacelle cross-section, fuselage length and exit arrangement, and tail shape, so the family is unmistakable. In clean flight configuration: landing gear retracted and omitted (no wheels), flaps in, no ground, no clouds, no people.";

// ---------- style constant: studio render (from the reference) ----------
export const STYLE_RENDER =
  "A photorealistic 3D studio render at glossy, magazine-configurator quality, not a photograph and not a line drawing. The whole aircraft is finished in one uniform clean white, a neutral mid-grey clay-render material read as white under key light, slightly rough rather than mirror: a smooth satin-white fuselage, wings and tail with only soft tonal shading and an ambient-occlusion pass to give the form volume, no colour, no cheatline and no titles. Soft, even, high-key studio lighting from the upper front lays a gentle broad specular sheen along the top of the fuselage and the leading edges, with soft ambient occlusion under the belly and inside the wing root. Details are picked out in restrained near-white and light grey: a smoky dark-tinted cockpit glass, a single neat row of small dark cabin windows, faint panel lines, and a subtly outlined forward door. The aircraft sits on a pure white seamless cyclorama, held far enough off the back wall that the wall stays shadowless, with at most a very soft, faint contact shadow directly beneath it. Crisp focus throughout, the aircraft centred with generous padding. In clean flight configuration: landing gear retracted, gear doors closed, flaps in, no ground, no clouds, no people.";

// The one prohibition this group adds to the library's global rules.
export const EXTRA_RULE = "No airline livery and no registration marks.";
export const FOOT = withRules("", EXTRA_RULE).trim();

// ---------- the six views ----------
export const VIEWS = [
  {
    key: "Top",
    label: "Top view",
    proj: "a top view (plan view) seen from directly above: the aircraft pointing straight up in the frame, perfectly symmetrical about its centreline, both wings fully spread, the tailplane at the bottom of the drawing; strictly orthographic, no perspective",
    volume: false,
  },
  {
    key: "Front",
    label: "Front view",
    proj: "a front view (head-on elevation) seen from directly ahead of the nose: the fuselage cross-section at the centre, the wings running out to each side with their natural dihedral, the tail fin rising behind the fuselage; strictly orthographic, no perspective",
    volume: false,
  },
  {
    key: "Side",
    label: "Side view",
    proj: "a side view (profile elevation) seen from directly abeam with the nose pointing left: the full length of the fuselage, the near wing in profile, the tail fin and tailplane at the right; strictly orthographic, no perspective",
    volume: false,
  },
  {
    key: "Back",
    label: "Back view",
    proj: "a rear view seen from directly behind the tail: the tail fin at the centre, the tailplane and the wing trailing edges running out to each side; strictly orthographic, no perspective",
    volume: false,
  },
  {
    key: "Three-quarter",
    label: "Three-quarter view",
    proj: "a three-quarter view from the front-left and slightly above, a gentle hero angle with very mild perspective: the nose nearest the viewer, both wings visible, the far wing partly foreshortened",
    volume: true,
  },
  {
    key: "Isometric",
    label: "Isometric view",
    proj: "a true isometric projection, axes at 30 degrees as if the aircraft sits on an invisible isometric ground plane, no perspective convergence so parallel edges stay parallel: the nose toward the lower left, the tail toward the upper right",
    volume: true,
  },
];

// ---------- silhouette categories: one bespoke cue per view, shared by every model in
// that category. The model `desc` supplies the identity; the category supplies what is
// distinctive to look for in each view. ----------
export const CATEGORIES = {
  "twinjet-narrow": {
    label: "Single-aisle twinjet (low wing, two underwing engines)",
    cues: {
      "Top": "From above the swept wings make a clean arrow shape, one engine nacelle visible ahead of each wing, the winglets as small ticks at the tips, and the single-aisle fuselage a slender tube with a smaller swept tailplane at the rear.",
      "Front": "Head-on the single-aisle fuselage is a neat circle, the wings run outward with a gentle upward dihedral, one round engine pod hangs under each wing, and the tail fin rises as a single blade behind.",
      "Side": "In profile the nose is rounded, the single-aisle cabin roofline runs as one long clean line, the underslung engine pod shows below and ahead of the wing, and the fin sweeps back over the tail cone.",
      "Back": "From behind the fin stands centred over the fuselage circle, the tailplanes spread low to each side, and the two engine exhausts show beneath the wings.",
      "Three-quarter": "The classic airliner hero angle: the nose nearest the viewer, the near engine pod clearly readable under the near wing, the swept fin closing the composition at the rear.",
      "Isometric": "The tubular fuselage runs along the isometric axis as parallel contour lines, the wings read as flat swept planes, and the engine pods as small clean cylinders.",
    },
  },
  "twinjet-wide": {
    label: "Twin-aisle wide-body twinjet (low wing, two large underwing engines)",
    cues: {
      "Top": "From above the wings are long with a gentle sweep, one large engine nacelle sits ahead of each wing, and the fuselage reads as a wide twin-aisle tube with a broad swept tailplane.",
      "Front": "Head-on the fuselage is a large wide circle, the long wings flex gently upward toward the tips, and one large engine pod hangs under each wing.",
      "Side": "In profile the fuselage is long and wide, the large engine pod sits below and ahead of the wing, and the tail fin is tall and swept.",
      "Back": "From behind the tall fin centres the drawing over the wide fuselage circle, the tailplane spreads wide, and the two large engine exhausts show beneath the long wings.",
      "Three-quarter": "The long wide fuselage recedes from the nose, the large near engine the focal detail under the near wing, the wingtips catching the edge of the frame.",
      "Isometric": "The long wide tube of the fuselage runs along the isometric axis, the wings read as thin swept planes, and the two engines as large cylinders beneath them.",
    },
  },
  "quadjet": {
    label: "Four-engine wide-body (low wing, two engines per side)",
    cues: {
      "Top": "From above four engine nacelles sit ahead of the giant wings, two on each side, and the large fuselage runs the length of the frame with a broad swept tailplane.",
      "Front": "Head-on four engine pods hang under the wings, two on each side, and the tall fin rises far above the large fuselage.",
      "Side": "In profile the long fuselage carries two near engine pods under the near wing, and the tall swept fin closes the tail.",
      "Back": "From behind the huge fin centres the drawing over the fuselage, with four engine exhausts spread beneath the wings, two on each side.",
      "Three-quarter": "The bulk of the fuselage and all four engines are on view, the nose nearest the viewer, the vast near wing sweeping across the frame.",
      "Isometric": "A massive clean volume along the isometric axis, the four engines as cylinders under flat swept wing planes.",
    },
  },
  "regional-rearjet": {
    label: "Regional jet (rear-fuselage engines, T-tail)",
    cues: {
      "Top": "From above the slim fuselage carries low wings set well back, the two engines read as small nacelles flanking the tail cone, and the T-tail crossbar sits at the very rear.",
      "Front": "Head-on the fuselage is a slim oval, the low wings run out to each side, the two engines sit high against the rear fuselage, and the tailplane rests on top of the fin like a T.",
      "Side": "In profile a pointed nose leads a slim cabin line, the engine is mounted high on the rear of the fuselage, and the tailplane perches on top of the swept fin as a clean T.",
      "Back": "From behind the T-tail reads as a clean letter T at the centre, with one engine exhaust on each side of the tapered tail cone.",
      "Three-quarter": "A sleek hero angle: the nose nearest the viewer, the rear-mounted engines and T-tail gathered at the far end of the slim fuselage.",
      "Isometric": "A slender volume along the isometric axis, thin wing planes low on the tube, the two engine cylinders hugging the rear fuselage below the raised T-tail plane.",
    },
  },
  "turboprop": {
    label: "Regional turboprop (high wing, two propeller engines, T-tail)",
    cues: {
      "Top": "From above the straight high wing crosses the fuselage as one clean constant-chord bar, one engine nacelle on each wing with its propeller disc drawn as a thin circle ahead of the leading edge.",
      "Front": "Head-on the high wing sits on top of the fuselage, one nacelle hangs below each wing with its propeller drawn head-on as a circle of thin blades, and the T-tail rises above.",
      "Side": "In profile the slim fuselage sits under the high wing, the near nacelle carries its propeller as a thin vertical ellipse at its nose, and the T-tail closes the drawing at the rear.",
      "Back": "From behind the T-tail sits centred, the straight wing reads as one long horizontal line high on the fuselage, with a nacelle hanging below it on each side.",
      "Three-quarter": "A workhorse hero angle: both propeller discs readable as thin ellipses ahead of the wing nacelles, the high straight wing over the slim fuselage.",
      "Isometric": "The straight wing reads as one flat plane across the top of the fuselage tube, nacelle cylinders below it, each propeller a thin disc, the T-tail a raised plane at the rear.",
    },
  },
};

// ---------- the roster: commercial families currently in service ----------
// Family granularity (one entry per family, not per length sub-variant). Grouped for the
// picker by `group`; `maker` orders within a group; `category` supplies the view cues.
export const GROUPS = ["Mainline jets", "Regional jets", "Turboprops"];

export const AIRCRAFT = [
  // --- Airbus mainline ---
  { key: "Airbus A220", maker: "Airbus", group: "Mainline jets", category: "twinjet-narrow", desc: "the Airbus A220 (formerly the Bombardier C Series), a single-aisle narrow-body twinjet: a slim tubular fuselage with a pointed nose, low swept wings each carrying one large geared-turbofan engine, small blended winglets, and a tall single swept fin" },
  { key: "Airbus A320 family", maker: "Airbus", group: "Mainline jets", category: "twinjet-narrow", desc: "the Airbus A320 family (A319, A320 and A321, in both ceo and neo), a single-aisle narrow-body twinjet: a smooth tubular fuselage with a rounded nose, low swept wings each with one underslung engine, tall upright sharklet wingtip fences, and a single swept fin" },
  { key: "Airbus A330", maker: "Airbus", group: "Mainline jets", category: "twinjet-wide", desc: "the Airbus A330, a twin-aisle wide-body twinjet: a long wide fuselage, low swept wings each carrying one large engine, small upturned winglets, and a tall swept fin" },
  { key: "Airbus A350", maker: "Airbus", group: "Mainline jets", category: "twinjet-wide", desc: "the Airbus A350, a twin-aisle wide-body twinjet: a long wide fuselage with a smooth pointed nose, gently upswept wings ending in distinctive backswept curved wingtips, one large engine under each wing, and a tall swept fin" },
  { key: "Airbus A380", maker: "Airbus", group: "Mainline jets", category: "quadjet", desc: "the Airbus A380, the double-deck four-engine superjumbo: a very large full-length double-deck fuselage, giant low swept wings carrying two engines on each side, and a huge swept fin" },
  // --- Boeing mainline ---
  { key: "Boeing 737", maker: "Boeing", group: "Mainline jets", category: "twinjet-narrow", desc: "the Boeing 737 (NG and MAX), a single-aisle narrow-body twinjet: a tubular fuselage with a pointed nose, low swept wings each with one underslung engine set close under the wing with a flattened nacelle underside, upward-and-downward split scimitar winglets, and a single swept fin" },
  { key: "Boeing 747", maker: "Boeing", group: "Mainline jets", category: "quadjet", desc: "the Boeing 747 jumbo jet, a four-engine wide-body: a very long fuselage with the iconic raised hump upper deck over the forward section, giant low swept wings carrying two engines on each side, and a tall swept fin" },
  { key: "Boeing 757", maker: "Boeing", group: "Mainline jets", category: "twinjet-narrow", desc: "the Boeing 757, a long single-aisle narrow-body twinjet: a notably long slim tubular fuselage with a pointed nose, low swept wings each carrying one large underslung engine, and a tall single swept fin" },
  { key: "Boeing 767", maker: "Boeing", group: "Mainline jets", category: "twinjet-wide", desc: "the Boeing 767, a semi-wide twin-aisle twinjet, a little narrower than the largest wide-bodies: a long rounded fuselage, low swept wings each with one large engine, small winglets, and a tall swept fin" },
  { key: "Boeing 777", maker: "Boeing", group: "Mainline jets", category: "twinjet-wide", desc: "the Boeing 777, a large twin-aisle wide-body twinjet: a very long wide fuselage with a bluntly rounded nose, long low swept wings each carrying one of the largest engines in service, flat-bladed raked wingtips on later variants, and a tall swept fin" },
  { key: "Boeing 787 Dreamliner", maker: "Boeing", group: "Mainline jets", category: "twinjet-wide", desc: "the Boeing 787 Dreamliner, a twin-aisle wide-body twinjet: a smooth fuselage with a four-window cockpit and a sharply pointed nose, gracefully raked upswept wingtips, one large engine with a serrated chevron exhaust under each wing, and a tall swept fin" },
  // --- Comac mainline ---
  { key: "Comac C919", maker: "Comac", group: "Mainline jets", category: "twinjet-narrow", desc: "the Comac C919, a single-aisle narrow-body twinjet in the A320 and 737 class: a tubular fuselage with a rounded nose, low swept wings each with one large underslung engine, upturned winglets, and a single swept fin" },
  // --- Regional jets ---
  { key: "Embraer E-Jet / E2", maker: "Embraer", group: "Regional jets", category: "twinjet-narrow", desc: "the Embraer E-Jet family (E170, E175, E190 and E195, and the newer E2), a small single-aisle regional twinjet: a compact tubular fuselage, low swept wings each carrying one underslung engine, small winglets, and a single swept fin" },
  { key: "Bombardier CRJ", maker: "Bombardier", group: "Regional jets", category: "regional-rearjet", desc: "the Bombardier CRJ (CRJ700, CRJ900 and CRJ1000), a slim regional jet: a narrow low fuselage with a pointed nose, low lightly swept wings, two engines mounted at the rear of the fuselage, and a T-tail" },
  { key: "Comac ARJ21", maker: "Comac", group: "Regional jets", category: "regional-rearjet", desc: "the Comac ARJ21, a regional jet: a narrow fuselage, low swept wings, two engines mounted at the rear of the fuselage, and a T-tail" },
  { key: "Sukhoi Superjet 100", maker: "Sukhoi", group: "Regional jets", category: "twinjet-narrow", desc: "the Sukhoi Superjet 100, a small single-aisle regional twinjet: a slim tubular fuselage with a pointed nose, low swept wings each carrying one underslung engine, upturned winglets, and a single swept fin" },
  // --- Turboprops ---
  { key: "ATR 42 / 72", maker: "ATR", group: "Turboprops", category: "turboprop", desc: "the ATR 42 and ATR 72, twin-engine regional turboprops: a slim fuselage, straight high-mounted wings each carrying one turboprop engine with a six-blade propeller, and a T-tail" },
  { key: "De Havilland Dash 8", maker: "De Havilland Canada", group: "Turboprops", category: "turboprop", desc: "the De Havilland Canada Dash 8 (Q400), a twin-engine regional turboprop: a long slim fuselage, straight high-mounted wings each carrying one turboprop engine with a large six-blade propeller on a long nacelle, and a tall T-tail" },
];

// per-model per-view cue, resolved through the model's silhouette category
export function cueFor(a, v) {
  const cat = CATEGORIES[a.category];
  return (cat && cat.cues[v.key]) || "";
}

// ---------- composition ----------
export function composeLine(a, v) {
  const style = v.volume ? STYLE_LINE_VOLUME : STYLE_LINE_ORTHO;
  return `Minimalist technical line illustration of ${a.desc}. Drawn in ${v.proj}. ${cueFor(a, v)} ${style} ${FOOT}`;
}

export function composeRender(a, v) {
  return `A photorealistic all-white studio render of ${a.desc}. Shown in ${v.proj}. ${cueFor(a, v)} ${STYLE_RENDER} ${FOOT}`;
}

// ---------- Art-directed campaign library ----------
// The third style. Each campaign is a full art-direction preset (a distinct treatment
// pulled from current visual trends), swapped from a dropdown in the picker. The shape
// dials stay constant; only `style` (the whole treatment) changes. Add a campaign by
// pushing one { key, label, blurb, style } object; it appears in the dropdown at once.
export const CAMPAIGNS = [
  {
    key: "chrome",
    label: "Chrome Dream",
    blurb: "Liquid-chrome Y2K aero: a mirror-polished airframe throwing iridescent reflections.",
    style:
      "The entire aircraft is rendered as liquid mirror chrome, a flawless polished metal skin reflecting a soft studio environment in warped highlights and deep chrome blacks, with an oil-slick iridescent sheen of magenta, cyan and gold rippling across the fuselage. It sits on a smooth pale-grey to white gradient studio backdrop with a soft mirrored reflection beneath it. High-gloss, futuristic and expensive, glossy 3D render quality with crisp specular highlights, no colour on the body other than the reflected spectrum.",
  },
  {
    key: "riso",
    label: "Riso Press",
    blurb: "Two-colour risograph print: fluoro inks, halftone dots, honest misregistration.",
    style:
      "Printed as a two-colour risograph poster in fluorescent pink and bright blue spot inks only, with visible coarse halftone dot texture, a slight ink misregistration offset between the two layers, and the soft tooth of uncoated recycled paper showing through. Flat graphic shapes, a darker third tone only where the two inks overprint, gentle imperfection and a warm analog printed feel rather than a clean digital render, on a cream paper ground.",
  },
  {
    key: "deco",
    label: "Deco Voyage",
    blurb: "Retro Art-Deco travel poster: flat geometry, sunburst rays, a warm limited palette.",
    style:
      "Illustrated as a vintage Art Deco travel poster in the classic airline-poster tradition: flat geometric shapes, clean hard edges and a limited warm palette of cream, deep teal, burnt orange and soft sky blue. Bold radiating sunburst rays and simple banded cloud shapes fill the background, long stylised light and a subtle grain like old lithograph ink. Elegant, optimistic and graphic, a strong flat silhouette with no photographic shading.",
  },
  {
    key: "golden",
    label: "Golden Hour",
    blurb: "Cinematic dusk: an amber-to-magenta gradient sky and long warm light.",
    style:
      "A cinematic golden-hour scene: the aircraft caught in warm low sunlight against a smooth gradient sky running from deep magenta and violet at the top down through amber and peach to a bright glowing horizon. Long soft directional light rakes across the airframe, a gentle lens glow and faint atmospheric haze, the body reading as a warm-lit form with cool shadow. Dreamy, filmic and aspirational, soft focus falloff and rich saturated dusk colour.",
  },
  {
    key: "aura",
    label: "Aura Glow",
    blurb: "Aura aesthetic: a soft glowing gradient halo and dreamy pastel mesh.",
    style:
      "Wrapped in the aura aesthetic: a soft glowing gradient halo blooms outward from the aircraft in dreamy pastel lavender, mint, peach and baby blue, like a backlit gradient mesh. The airframe is a clean soft-white form with gentle pastel light spilling onto it, set against a blurred out-of-focus gradient field with a faint grain and a weightless, ethereal calm. No hard edges in the background, luminous, airy and modern.",
  },
  {
    key: "blueprint",
    label: "Blueprint",
    blurb: "Cyanotype blueprint: fine white linework and a faint grid on deep drafting blue.",
    style:
      "Drawn as a classic cyanotype engineering blueprint: crisp fine white technical linework over a deep drafting-blue ground, with a faint white measurement grid, subtle dimension ticks and construction guide lines (but no numbers), and the mottled sun-print texture of real cyanotype paper. Precise, archival and technical, an old drafting-table feel with uniform line weight, the aircraft rendered as a clean white outline drawing on blue.",
  },
  {
    key: "inflatable",
    label: "Inflatable",
    blurb: "Soft-body 3D: the aircraft as a glossy inflated balloon toy.",
    style:
      "Rendered as a soft inflatable balloon version of the aircraft: rounded puffy forms, plump seams and pinched welds where the panels meet, a glossy air-filled plastic surface with soft highlights and a gentle subsurface glow, in a cheerful pastel colourway. It floats against a clean soft-gradient studio background with a soft contact shadow, toy-like, tactile and playful, smooth 3D render quality with everything softened and inflated.",
  },
  {
    key: "neon",
    label: "Neon Nocturne",
    blurb: "Neon night: a glowing neon-tube outline of the aircraft on deep dark.",
    style:
      "The aircraft drawn as a glowing neon-sign outline at night: bright luminous neon tubes tracing the fuselage, wings and tail in electric cyan, hot pink and violet, with a soft coloured glow bleeding onto a deep near-black background and a faint wet reflection beneath. Dark, moody and electric, high contrast, the body implied entirely by its glowing contour and a few interior neon accent lines, with a subtle bloom around the tubes.",
  },
];

export function composeArt(a, v, campaignKey) {
  const c = CAMPAIGNS.find((x) => x.key === campaignKey) || CAMPAIGNS[0];
  return `An art-directed ${c.label} treatment of ${a.desc}. Shown in ${v.proj}. ${cueFor(a, v)} ${c.style} ${FOOT}`;
}

export const STYLE_META = [
  { key: "line", label: "Line drawing" },
  { key: "render", label: "Studio render" },
  { key: "art", label: "Art directed" },
];

export function compose(styleKey, a, v, campaignKey) {
  if (styleKey === "render") return composeRender(a, v);
  if (styleKey === "art") return composeArt(a, v, campaignKey);
  return composeLine(a, v);
}

// Named tokens for the words-only convergence loop on the studio-render style: the model
// gets no reference image, so the whole look is in the prose. Generate, compare to the
// intended look, then ask to nudge one of these; each maps to one clause in STYLE_RENDER.
export const RENDER_TOKENS = [
  "Finish: satin white (default) vs matte white vs glossy pearl",
  "Sheen: strength of the specular highlight along the top of the fuselage",
  "Shadow: none vs a soft faint contact shadow vs a grounded shadow",
  "Cockpit glass: how dark and how smoky the windscreen tint reads",
  "Cabin windows: keep the single dark row, thin it out, or omit entirely",
  "Panel lines: faint (default) vs none vs crisp",
  "Background: pure white vs a soft light-grey studio sweep",
  "Camera: flat configurator elevation vs a slight wide-angle hero drama",
];
