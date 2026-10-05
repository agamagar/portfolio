// Recipe for the "Camera views" prompt system: take one image of a subject and
// re-render the same subject from a different camera position, holding everything
// about the subject constant and moving only the camera.
//
// Built on the shared recipe contract in ./recipe.js (defineRecipe). Five camera
// dials, each one axis the trade already keeps separate (research/camera-views.md,
// finding 1: "name the axis, never the number alone"):
//   1. Height    - the vertical angle, top-down to worm's-eye, plus the body-height
//                  ladder (shoulder / hip / knee) for human-scale subjects.
//   2. Orbit     - which side faces the lens: front, three-quarter, profile, rear.
//   3. Distance  - the shot size, extreme close-up to extreme wide.
//   4. Lens      - focal length paired with working distance, because perspective is
//                  set by distance and not by the lens (dossier [11]); plus
//                  orthographic, which is a projection rather than a lens.
//   5. Roll      - level, or a Dutch angle.
// plus the TREATMENT (the style slot): match the source, studio packshot, grey clay.
//
// Every view clause names the view in the craft's own term AND spells out its
// geometric consequence (what becomes visible, which way verticals converge), because
// the benchmarks read for the dossier show models "collapse to biased canonical
// angles" on bare degrees ([22][23]) and the vendors' own guides prefer named views
// ([15][18]). Degrees are stated with their axis ("raised 45 degrees" versus "rotated
// 45 degrees around"), never bare, because "45-degree" means an orbit in one source
// and an elevation in another ([19][25][29]).
//
// Sources by number refer to research/camera-views.md.
import { defineRecipe } from "./recipe.js";
import { withRules, withRulesCompact } from "../rules.js";

export const EXTRA_RULE = undefined;

// The library's global rules say no text and no branding anywhere. A prompt that
// works FROM a reference image promises to keep the subject's own printing, and both
// cannot hold at once, so, exactly as the Zepto catalogue's stage layer does, the rule
// is SCOPED to what the model generates and the subject's own printing is carved out.
// The grey clay treatment strips all printing anyway, so it takes the global rules
// as written.
export const SCOPED_RULES =
  "Add no text, letters, numbers or labels of your own anywhere in the image, and no logos, wordmarks or brand marks of any kind on anything you create. The subject's own printing, exactly as it appears in the reference, is the only exception and stays as it is.";
export const SCOPED_RULES_COMPACT =
  "No new text, logos or branding anywhere; the subject's own printing stays as it is.";

// The Figma prompt-field working ceiling, rules included. See research/models.md.
export const COMPACT_LIMIT = 1000;

// ---------- the opening: what the reference is, and what the job is ----------
// Name the subject independently of the image: an image with no stated subject gets
// interpreted rather than obeyed (research/base-mesh-restyling.md), and Google's edit
// template opens "Using the provided image of [subject]" ([18][19]).
export const openFor = ({ subject = "image", what = "" } = {}) => {
  const w = what && what.trim();
  if (subject === "text") return `${w || "[SUBJECT]"}, photographed from a specified camera position.`;
  return `Using the attached image of ${w || "the subject"} as the reference, re-render the same subject from a new camera position.`;
};
export const openShortFor = ({ subject = "image", what = "" } = {}) => {
  const w = what && what.trim();
  if (subject === "text") return `${w || "[SUBJECT]"}, from a specified camera position.`;
  return `Re-render ${w || "the subject"} of the attached image from a new camera position.`;
};

// ---------- dial 1: height (the vertical angle) ----------
// `deg` is the camera's elevation above the subject's centre, for the picker's
// diagram. The body-height entries (shoulder, hip, knee) are absolute heights on a
// standing figure rather than angles; their deg is the diagram's approximation.
// No source read quotes a degree range for "high angle" or "low angle" as such, so
// the only numbers in the clauses are the ones the sources actually state: 90 for
// top-down and flat lay ([1][30]), 45 for the elevated product shot ([19][25]), 35 for
// the isometric elevation ([13]).
export const HEIGHTS = [
  {
    key: "top",
    label: "Top-down",
    deg: 90,
    blurb: "Directly overhead, lens straight down. Only the top face. For kits, sets and layouts.",
    view: "A top-down shot from directly overhead: the camera vertically above the subject with the lens pointing straight down at 90 degrees, so only the top face is visible and nothing of the sides, the perspective kept true across the whole frame.",
    viewShort: "Top-down from directly overhead, lens straight down at 90 degrees: only the top face visible, none of the sides.",
  },
  {
    key: "flatlay",
    label: "Flat lay",
    deg: 90,
    blurb: "The subject laid flat on a surface, shot at exactly 90 degrees. Anything short of 90 skews the edges.",
    view: "A flat lay: the subject laid flat on a plain surface and photographed from directly above at exactly 90 degrees, every element on one plane, no perspective skew at the edges of the frame.",
    viewShort: "Flat lay: laid flat on a plain surface, shot from directly above at exactly 90 degrees, one plane, no edge skew.",
  },
  {
    key: "bird",
    label: "Bird's-eye",
    deg: 75,
    blurb: "From high above, steep but not vertical, the ground reading like a map. The drone view.",
    view: "A bird's-eye view from high above: the camera far above the subject looking steeply down, not quite vertical, so the top face dominates, the near side shows as a thin strip and the ground around the subject fills the frame like a map.",
    viewShort: "Bird's-eye from high above, steep but not vertical: top face dominant, near side a thin strip, the ground like a map.",
  },
  {
    key: "high",
    label: "High angle",
    deg: 60,
    blurb: "Well above, looking down. The subject reads smaller; the surface around it takes the frame.",
    view: "A high-angle shot: the camera well above the subject looking down at it, verticals converging toward the ground, the top and the front both visible with the top the larger, the subject reading smaller and the surface around it taking up the frame.",
    viewShort: "High angle, camera well above looking down: verticals converge toward the ground, top larger than front, the subject reads smaller.",
  },
  {
    key: "angled",
    label: "Raised 45",
    deg: 45,
    blurb: "The classic angled product shot: raised and tilted down about 45 degrees, front still dominant.",
    view: "A slightly elevated 45-degree shot: the camera raised above the subject and tilted down about 45 degrees while facing it, so the top face and the front face are both visible with the front still dominant, the classic angled product shot.",
    viewShort: "Elevated 45-degree shot, camera raised and tilted down about 45 degrees: top and front visible, front dominant.",
  },
  {
    key: "iso",
    label: "Iso raise 35",
    deg: 35,
    blurb: "The isometric elevation. Pair with the three-quarter orbit and the orthographic lens for a true isometric.",
    view: "The camera raised so that its line of sight drops at about 35 degrees, the elevation of a true isometric view, so the top and the facing sides share the frame in near-equal weight.",
    viewShort: "Camera raised so the line of sight drops about 35 degrees, the isometric elevation: top and facing sides in near-equal weight.",
  },
  {
    key: "slight",
    label: "Slightly raised",
    deg: 20,
    blurb: "A little higher than the subject, the way you see a thing on the table in front of you.",
    view: "The camera a little higher than the subject, tilted gently down by about 20 degrees, so a sliver of the top face shows above the front, the way a person sees an object on the table in front of them.",
    viewShort: "Camera a little higher than the subject, tilted gently down about 20 degrees: a sliver of the top face shows above the front.",
  },
  {
    key: "eye",
    label: "Eye level",
    deg: 0,
    blurb: "In line with the subject at its own height, lens level. The ecommerce default. For a person, at their eyes.",
    view: "At eye level: the camera directly in line with the subject, on the same plane and at the subject's own mid height, the lens level with no tilt, so the top and the underside are both hidden and the subject is seen square, the way it presents itself.",
    viewShort: "Eye level: camera in line with the subject at its own height, lens level, no tilt, top and underside both hidden.",
  },
  {
    key: "shoulder",
    label: "Shoulder level",
    deg: 8,
    blurb: "For people and human-scale subjects: camera at shoulder height, lens level, head near the top of the frame.",
    view: "A shoulder-level shot: the camera at the subject's shoulder height with the lens level, so the head sits near the top of the frame and the body is seen straight on with no tilt.",
    viewShort: "Shoulder-level shot: camera at shoulder height, lens level, the head near the top of the frame, no tilt.",
  },
  {
    key: "hip",
    label: "Hip level",
    deg: -8,
    blurb: "The cowboy shot: camera at hip height, lens level, the upper body from slightly below.",
    view: "A hip-level shot, the cowboy shot: the camera at the subject's hip height with the lens level, so the frame cuts around the waist and the upper body is seen from slightly below with no tilt.",
    viewShort: "Hip-level (cowboy) shot: camera at hip height, lens level, the upper body seen from slightly below, no tilt.",
  },
  {
    key: "knee",
    label: "Knee level",
    deg: -18,
    blurb: "Kneeling: camera lowered to knee height, lens level or a slight upward tilt. The subject stands tall.",
    view: "A knee-level shot: the camera lowered to the subject's knee height, as if kneeling, with the lens level or tilted only slightly upward, so the subject stands tall in the frame, the ground plane recedes and the underside of any overhanging part begins to show.",
    viewShort: "Knee-level shot, camera lowered to knee height, lens level or tilted slightly up: the subject stands tall, ground receding.",
  },
  {
    key: "hero",
    label: "Low hero",
    deg: -12,
    blurb: "Slightly below the base, tilted up. The subject towers. Watches, cars, premium goods.",
    view: "A low-angle hero shot: the camera slightly below the subject's base and tilted up at it, so the subject towers, its underside edge shows, the verticals converge gently toward the top of the frame and the ground plane recedes behind it.",
    viewShort: "Low-angle hero shot, camera just below the base and tilted up: the subject towers, underside edge showing, ground receding.",
  },
  {
    key: "worm",
    label: "Worm's-eye",
    deg: -28,
    blurb: "On the ground, tilted steeply up. Three-point perspective, the subject looming.",
    view: "A worm's-eye view from ground level: the camera on the ground tilted steeply upward, three-point perspective with the verticals converging toward the top of the frame and the subject looming over the lens.",
    viewShort: "Worm's-eye from ground level, camera tilted steeply up, three-point perspective, verticals converging upward, the subject looming.",
  },
];

// ---------- dial 2: orbit (which side faces the lens) ----------
// `az` is the camera's position around the subject in degrees, 0 in front, positive
// toward the subject's left, for the picker's plan diagram. The five lateral angles
// of the film glossaries ([32]) plus the turnaround set ([36]). Back views are the
// benchmarks' named failure case ([22]), so the rear clauses say "rear face only".
export const ORBITS = [
  {
    key: "front",
    label: "Front",
    az: 0,
    orbit: "The camera stands directly in front of the subject, so the front face leads and the sides are hidden.",
    orbitShort: "Directly in front: the front face leads, sides hidden.",
  },
  {
    key: "tql",
    label: "Three-quarter left",
    az: 45,
    orbit: "A three-quarter front view from the subject's left: the camera rotated about 45 degrees around the subject, so the front and the left side are both visible and the near corner leads.",
    orbitShort: "Three-quarter front from the left, rotated about 45 degrees around the subject: front and left side visible.",
  },
  {
    key: "tqr",
    label: "Three-quarter right",
    az: -45,
    orbit: "A three-quarter front view from the subject's right: the camera rotated about 45 degrees around the subject, so the front and the right side are both visible and the near corner leads.",
    orbitShort: "Three-quarter front from the right, rotated about 45 degrees around the subject: front and right side visible.",
  },
  {
    key: "profl",
    label: "Profile left",
    az: 90,
    orbit: "A pure side view in profile from the subject's left: the camera at 90 degrees to its facing, so only the silhouette and the left side plane are seen, flat and outline-led.",
    orbitShort: "Pure profile from the left, camera at 90 degrees to its facing: silhouette and left side only, outline-led.",
  },
  {
    key: "profr",
    label: "Profile right",
    az: -90,
    orbit: "A pure side view in profile from the subject's right: the camera at 90 degrees to its facing, so only the silhouette and the right side plane are seen, flat and outline-led.",
    orbitShort: "Pure profile from the right, camera at 90 degrees to its facing: silhouette and right side only, outline-led.",
  },
  {
    key: "rearl",
    label: "Rear three-quarter left",
    az: 135,
    orbit: "A three-quarter rear view from the subject's left: the camera behind and to the left, so the back and the left side are visible and the front is hidden.",
    orbitShort: "Three-quarter rear from the left, camera behind and to the left: back and left side visible, front hidden.",
  },
  {
    key: "rearr",
    label: "Rear three-quarter right",
    az: -135,
    orbit: "A three-quarter rear view from the subject's right: the camera behind and to the right, so the back and the right side are visible and the front is hidden.",
    orbitShort: "Three-quarter rear from the right, camera behind and to the right: back and right side visible, front hidden.",
  },
  {
    key: "rear",
    label: "Rear",
    az: 180,
    orbit: "A direct back view: the camera squarely behind the subject, showing the rear face only and nothing of the front.",
    orbitShort: "Direct back view, camera squarely behind: the rear face only, nothing of the front.",
  },
];

// ---------- dial 3: distance (shot size) ----------
// The shot-size ladder ([2][4]); "close-up, wide, top-down" are OpenAI's own framing
// keywords ([15]) and "macro shot" is Google's ([18]).
export const DISTANCES = [
  {
    key: "ecu",
    label: "Extreme close-up",
    dist: "An extreme close-up on a macro lens: the frame filled with one detail of the subject so its surface texture reads, the whole silhouette out of frame.",
    distShort: "Extreme close-up on a macro lens: one detail fills the frame, texture reading, silhouette out of frame.",
  },
  {
    key: "cu",
    label: "Close-up",
    dist: "A close-up: the subject's most characteristic part fills the frame and the edges of the subject are cropped away.",
    distShort: "Close-up: the most characteristic part fills the frame, edges cropped away.",
  },
  {
    key: "medium",
    label: "Medium",
    default: true,
    dist: "A medium shot: the subject fills most of the frame with a little of its setting around it, no part of it cropped.",
    distShort: "Medium shot: the subject fills most of the frame, uncropped, a little setting around it.",
  },
  {
    key: "full",
    label: "Full",
    dist: "A full shot: the whole subject seen top to bottom with a margin of setting on every side.",
    distShort: "Full shot: the whole subject, a margin of setting all round.",
  },
  {
    key: "wide",
    label: "Wide",
    dist: "A wide shot: the subject clearly the focus, but its setting taking up most of the frame.",
    distShort: "Wide shot: the subject the focus, its setting most of the frame.",
  },
  {
    key: "ews",
    label: "Extreme wide",
    dist: "An extreme wide shot: the subject small against its whole location, the camera far back so the setting dominates.",
    distShort: "Extreme wide: the subject small in its whole location, the setting dominant.",
  },
];

// ---------- dial 4: lens (focal length, paired with distance) ----------
// Two shots from the same distance have identical perspective whatever the lens
// ([11]), so every lens clause states the working distance with it. Focal length is
// the weakest camera lever measured ([21]), which is why each clause also describes
// the distortion the lens produces. Orthographic is a projection, not a lens, but it
// lives here because it is the same choice: how the geometry is drawn ([39][40]).
export const LENSES = [
  {
    key: "wide24",
    label: "24mm wide, close",
    blurb: "From close on a wide-angle: near edges swell, depth stretches, the background falls away small.",
    lens: "Shot from close on a wide-angle lens, around 24mm, so the near edges swell, depth stretches and the background falls away small.",
    lensShort: "From close on a 24mm wide-angle: near edges swell, depth stretches, background falls away small.",
  },
  {
    key: "normal50",
    label: "50mm normal",
    default: true,
    blurb: "A natural distance on a 50mm, perspective as the eye sees it. The vendors' own worked example.",
    lens: "Shot on a 50mm lens from a natural distance, the perspective as the eye sees it.",
    lensShort: "On a 50mm from a natural distance, perspective as the eye sees it.",
  },
  {
    key: "tele85",
    label: "85mm portrait",
    blurb: "Further back on an 85mm: flattering proportions, the background gently compressed.",
    lens: "Shot from further back on an 85mm portrait lens, the proportions flattering and the background gently compressed toward the subject.",
    lensShort: "From further back on an 85mm: flattering proportions, background gently compressed.",
  },
  {
    key: "long135",
    label: "135mm long, far",
    blurb: "From a distance on a long lens: depth compresses, faces stay in true proportion, the background comes up close.",
    lens: "Shot from a distance on a long lens, around 135mm, so depth compresses, the subject's faces stay in true proportion and the background is brought up close behind it.",
    lensShort: "From a distance on a 135mm: depth compresses, faces in true proportion, background close behind.",
  },
  {
    key: "ortho",
    label: "Orthographic",
    blurb: "No perspective at all: parallel projection, nothing shrinks with distance. For plan views and isometrics.",
    lens: "Drawn in orthographic projection, parallel projection lines and no perspective: parallel edges stay parallel and nothing shrinks with distance, as in a technical drawing.",
    lensShort: "Orthographic projection, no perspective: parallel edges stay parallel, no shrinking with distance.",
  },
];

// ---------- dial 5: roll ----------
// No source quotes a degree range for the Dutch angle; "the tilt can be subtle or
// extreme" ([35c]) is all there is, so the clause says clear but not extreme.
export const ROLLS = [
  {
    key: "level",
    label: "Level",
    roll: "The camera held level, the horizon and every vertical true.",
    rollShort: "",
  },
  {
    key: "dutch",
    label: "Dutch angle",
    roll: "A Dutch angle: the camera rolled about its lens axis so the horizon and every vertical lean together, the tilt clear but not extreme, a canted, unsettled frame.",
    rollShort: "Dutch angle: camera rolled so horizon and verticals lean, clear but not extreme.",
  },
];

// ---------- the preserve clause: hold the subject, move the camera ----------
// Assembled from the vendors' edit templates ("Keep everything else in the image
// exactly the same" [18][19]; "Preserve product geometry ... Do not change anything
// else", "repeat the preserve list on each iteration to reduce drift" [15][16]).
// When the camera is the thing changing, the list drops "camera angle" and keeps
// geometry, materials and printing. The perspective sentence is ours: it gives the
// model a second, redundant cue that the OLD view is not to be pasted into the new
// frame (dossier finding 2, inference).
export const PRESERVE =
  "Preserve the subject's exact geometry, proportions, materials, colours and surface details, and the printing already on it. Draw the perspective for the new camera, not the old one: what the new position reveals is shown and what it hides is hidden. Change only the camera position and what that position reveals. Do not change anything else.";
export const PRESERVE_SHORT =
  "Keep the subject's exact geometry, proportions, materials, colours, details and own printing; draw the perspective for the new camera and change nothing else.";

// The clay treatment strips every surface, so it preserves form only.
export const PRESERVE_FORM =
  "Preserve the subject's exact geometry and proportions; every surface becomes the clay. Draw the perspective for the new camera, not the old one: what the new position reveals is shown and what it hides is hidden.";
export const PRESERVE_FORM_SHORT =
  "Keep the subject's exact geometry and proportions; every surface becomes the clay. Draw the perspective for the new camera.";

// ---------- the treatments (the style slot) ----------
// Match the source is the default and the whole point: only the camera moves.
// Studio packshot re-lights on the sourced three-light grammar and the seamless sweep
// (research/composition.md). Grey clay is the sourced form-check render
// (research/base-mesh-restyling.md): flat, shadowless, untextured mid-grey on white.
const parts = (S) => (pick) => {
  const compact = pick.length === "compact";
  const text = pick.subject === "text";
  const H = HEIGHTS.find((h) => h.key === pick.height) || HEIGHTS.find((h) => h.key === "eye");
  const O = ORBITS.find((o) => o.key === pick.orbit) || ORBITS[0];
  const D = DISTANCES.find((d) => d.key === pick.distance) || DISTANCES.find((d) => d.default);
  const L = LENSES.find((l) => l.key === pick.lens) || LENSES.find((l) => l.default);
  const R = ROLLS.find((r) => r.key === pick.roll) || ROLLS[0];
  const treatment = text ? (compact ? S.treatmentTextShort : S.treatmentText) : compact ? S.treatmentShort : S.treatment;
  const preserve = text ? "" : compact ? S.preserveShort : S.preserve;
  return [
    compact ? openShortFor(pick) : openFor(pick),
    compact ? H.viewShort : H.view,
    compact ? O.orbitShort : O.orbit,
    compact ? D.distShort : D.dist,
    compact ? L.lensShort : L.lens,
    compact ? R.rollShort : R.roll,
    treatment,
    preserve,
  ];
};

export const STYLES = [
  {
    key: "match",
    label: "Match the source",
    blurb: "Keeps the image's own light, materials, colours and background. Only the camera moves.",
    scoped: true,
    treatment:
      "Keep the same lighting direction and quality, the same materials and colours and the same background treatment as the reference, so the result reads as the same photograph taken from a different spot.",
    treatmentShort:
      "Same lighting, materials, colours and background as the reference: the same photograph from a new spot.",
    treatmentText: "Photographic, lit naturally for the setting, the light direction consistent across the whole frame.",
    treatmentTextShort: "Photographic, lit naturally for the setting.",
    preserve: PRESERVE,
    preserveShort: PRESERVE_SHORT,
  },
  {
    key: "studio",
    label: "Studio packshot",
    blurb: "Re-lights the subject on a seamless sweep with a key, a fill and a rim, a soft cast shadow and a tight contact shadow.",
    scoped: true,
    treatment:
      "Re-light it as a studio packshot: the subject on a seamless paper sweep with no horizon line, a large diffused key light above and to one side, a soft fill opposite, a subtle rim for separation, a soft-edged cast shadow falling away from the key and a tight dark contact shadow where the subject meets the sweep, the background held about a stop darker than the subject, verticals kept parallel with no keystone, front-to-back sharpness.",
    treatmentShort:
      "Studio packshot on a seamless sweep: large diffused key above and to one side, soft fill, subtle rim; soft cast and tight contact shadow; verticals parallel.",
    treatmentText:
      "A studio packshot: the subject on a seamless paper sweep with no horizon line, a large diffused key light above and to one side, a soft fill opposite, a subtle rim for separation, a soft-edged cast shadow falling away from the key and a tight dark contact shadow at the base, the background about a stop darker than the subject, verticals kept parallel, front-to-back sharpness.",
    treatmentTextShort:
      "Studio packshot on a seamless sweep: large diffused key above and to one side, soft fill, subtle rim; soft cast and tight contact shadow; verticals parallel.",
    preserve: PRESERVE,
    preserveShort: PRESERVE_SHORT,
  },
  {
    key: "clay",
    label: "Grey clay study",
    blurb: "A form-check render: matte mid-grey, flat shadowless light, white ground. See whether the geometry survives the move before styling.",
    scoped: false,
    treatment:
      "Render it as a form study: the entire subject one uniform matte mid-grey modelling clay, completely untextured, with no paint, no markings and no colour, lit by flat, even, shadowless illumination with no cast shadow, no rim light and no specular highlight, on a pure white ground with no horizon, a clean sharp render with no grain, no blur and no depth of field.",
    treatmentShort:
      "Form study: the whole subject one uniform matte mid-grey clay, untextured, no colour, flat shadowless light, pure white ground, clean sharp render.",
    treatmentText:
      "A form study: the entire subject one uniform matte mid-grey modelling clay, completely untextured, with no paint, no markings and no colour, lit by flat, even, shadowless illumination with no cast shadow, no rim light and no specular highlight, on a pure white ground with no horizon, a clean sharp render with no grain, no blur and no depth of field.",
    treatmentTextShort:
      "Form study: one uniform matte mid-grey clay, untextured, no colour, flat even shadowless light, no cast shadow, pure white ground, clean sharp render.",
    preserve: PRESERVE_FORM,
    preserveShort: PRESERVE_FORM_SHORT,
  },
].map((s) => ({ ...s, parts: parts(s) }));

export const STYLE_META = STYLES.map(({ key, label, blurb }) => ({ key, label, blurb }));

// ---------- presets: the set-ups the trade reaches for by name ----------
// The product set from the sources ([24][25][27][29]), the turnaround set ([36]), and
// the two drawn projections ([6][13]).
export const PRESETS = [
  {
    key: "packshot45",
    label: "Packshot 45",
    blurb: "The ecommerce angled shot: raised 45, three-quarter, 85mm. Shows top, front and one side.",
    pick: { height: "angled", orbit: "tql", distance: "medium", lens: "tele85", roll: "level" },
  },
  {
    key: "straight",
    label: "Straight-on",
    blurb: "Front, eye level, on an 85mm from further back so the faces stay true. Packaging and electronics.",
    pick: { height: "eye", orbit: "front", distance: "medium", lens: "tele85", roll: "level" },
  },
  {
    key: "flatlay",
    label: "Flat lay",
    blurb: "Exactly 90 degrees overhead on a 50mm, the whole subject in frame. Apparel, kits, handheld things.",
    pick: { height: "flatlay", orbit: "front", distance: "full", lens: "normal50", roll: "level" },
  },
  {
    key: "hero",
    label: "Low hero",
    blurb: "Slightly below the base, tilted up, three-quarter. Premium, grand. Watches, cars.",
    pick: { height: "hero", orbit: "tql", distance: "full", lens: "normal50", roll: "level" },
  },
  {
    key: "knee",
    label: "Knee-level walk-up",
    blurb: "Kneeling in front of the subject, full shot on a 50mm: the subject stands tall.",
    pick: { height: "knee", orbit: "front", distance: "full", lens: "normal50", roll: "level" },
  },
  {
    key: "drone",
    label: "Drone overhead",
    blurb: "Bird's-eye, extreme wide on a 24mm: the subject small in its whole location, the ground like a map.",
    pick: { height: "bird", orbit: "tql", distance: "ews", lens: "wide24", roll: "level" },
  },
  {
    key: "profile",
    label: "Profile",
    blurb: "Pure side view at eye level from a distance on a 135mm: outline-led, faces in true proportion.",
    pick: { height: "eye", orbit: "profl", distance: "full", lens: "long135", roll: "level" },
  },
  {
    key: "rearq",
    label: "Rear three-quarter",
    blurb: "Behind and to one side at eye level: the back and one side, the front hidden.",
    pick: { height: "eye", orbit: "rearl", distance: "full", lens: "normal50", roll: "level" },
  },
  {
    key: "worm",
    label: "Worm's-eye",
    blurb: "On the ground, tilted steeply up, wide on a 24mm: the subject looms, verticals converge upward.",
    pick: { height: "worm", orbit: "front", distance: "wide", lens: "wide24", roll: "level" },
  },
  {
    key: "macro",
    label: "Macro detail",
    blurb: "Extreme close-up on a macro lens, three-quarter at eye level: one detail, the texture reading.",
    pick: { height: "eye", orbit: "tql", distance: "ecu", lens: "normal50", roll: "level" },
  },
  {
    key: "plan",
    label: "Plan view",
    blurb: "Top-down in orthographic projection: the drafted plan, no perspective.",
    pick: { height: "top", orbit: "front", distance: "full", lens: "ortho", roll: "level" },
  },
  {
    key: "isometric",
    label: "Isometric",
    blurb: "Orthographic, rotated 45 degrees around and raised 35: top and two sides, parallel edges staying parallel.",
    pick: { height: "iso", orbit: "tql", distance: "full", lens: "ortho", roll: "level" },
  },
];

// ---------- the recipe ----------
const base = defineRecipe({
  key: "camera-views",
  label: "Camera views",
  dials: {
    height: "The vertical angle, top-down to worm's-eye, plus shoulder / hip / knee for human-scale subjects.",
    orbit: "Which side faces the lens: front, three-quarter, profile, rear three-quarter, rear.",
    distance: "The shot size, extreme close-up to extreme wide.",
    lens: "Focal length with its working distance, or orthographic projection.",
    roll: "Level, or a Dutch angle.",
    style: "The treatment: match the source, studio packshot, or grey clay form study.",
    subject: "The attached image (default), or text only.",
    what: "What the subject is, in a few words. Optional but stops the model reinterpreting the image.",
    length: "Full, or compact for a prompt field under a character cap.",
  },
  styles: STYLES,
  extraRule: EXTRA_RULE,
  tokens: [
    "eye level: same plane, same height, no tilt",
    "three-quarter: rotated 45 degrees around, not raised 45",
    "low-angle hero",
    "worm's-eye, three-point perspective",
    "bird's-eye: steep, not vertical",
    "flat lay: exactly 90 degrees",
    "Dutch angle",
    "orthographic projection",
    "wide close versus long far: distance sets the perspective",
    "the preserve list, restated every generation",
  ],
});

// Image-mode prompts under the match and studio treatments close with the SCOPED
// rules (the subject's own printing is carved out); clay and text-only prompts close
// with the library's global rules as written. Everything else routes through the
// contract's compose().
export const cameraRecipe = {
  ...base,
  compose(pick = {}) {
    const S = STYLES.find((s) => s.key === pick.style) || STYLES[0];
    const scoped = S.scoped && pick.subject !== "text";
    if (!scoped) return base.compose({ ...pick, style: S.key });
    const compact = pick.length === "compact";
    const body = S.parts({ ...pick, style: S.key })
      .filter(Boolean)
      .map((s) => String(s).trim())
      .join(" ");
    return `${body} ${compact ? SCOPED_RULES_COMPACT : SCOPED_RULES}`;
  },
};

// Export the un-scoped helpers for the checker, which asserts the two closings never
// appear together in one prompt.
export { withRules, withRulesCompact };
