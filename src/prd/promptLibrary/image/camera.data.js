// Image-generation prompts: Camera views. The PROSE half of the group.
// Every copy-paste block, the ladders and the template are composed from the recipe
// in ./cameraViews.js by ./camera.js, so nothing here is a frozen prompt.
// Part of the prompt library (src/prd/promptLibrary). See index.js for the map.

export const SPECS = [
  {
    id: "pl-camera-views-system",
    group: "Camera views",
    eyebrow: "Camera views",
    title: "Camera views · the system",
    summary:
      "Take one image of a subject and re-shoot it from anywhere: straight down, from a drone, from standing height, from a kneel, from the floor, from the side, from behind, close or far, wide or compressed. Drop the image in the picker, say what it is, pick where the camera stands, and the prompt assembles below. The subject is held constant by a preserve clause and only the camera moves. Built for image-gen models that accept a reference image (GPT Image 2 in Figma first, Nano Banana 2, or any edit endpoint), in a compact register that fits Figma's prompt field and a full one that does not try to.",
    "What this is": [
      "An image-to-image system for CAMERA POSITION. The attached image carries the subject, its materials, its colours and its details; the prompt carries where the camera is and what must not change.",
      "Five camera dials, each one axis the trade already names: height (the vertical angle, from top-down to worm's-eye), orbit (which side faces the lens), distance (the shot size), lens (focal length, which draws the same spot wide or compressed) and roll (level or canted). They are separate axes in every glossary and they are separate dials here, so 'high three-quarter' is height plus orbit rather than one blurred word.",
      "Three treatments. Match the source keeps the image's own light, materials and finish and moves nothing but the camera. Studio packshot re-lights it on a seamless sweep. Grey clay study strips it to a form-check render, the cheapest way to see whether the geometry survived the move before spending on a styled set.",
      "Presets for the set-ups a product photographer or a storyboard artist reaches for by name: the packshot 45, the flat lay, the low hero, the knee-level walk-up, the drone overhead, the profile, the rear three-quarter.",
      "Built on the shared recipe contract (image/recipe.js). Adding a height, an orbit or a treatment is one entry in cameraViews.js and it appears in the picker, the ladders and the template at once.",
    ],
    "The constant": [
      "Name the subject independently of the image. An image with no stated subject gets interpreted rather than obeyed, so the picker has a 'what the subject is' field and the prompt opens with it. Leave it empty and the prompt falls back to 'the subject of the attached image'.",
      "Preserve, out loud, every generation. The prompt restates what must survive the move: the subject's shape, proportions, materials, colours, surface details and any markings, plus its setting. Both OpenAI and Google document this as the way to hold a subject across variations, and neither model has a seed to lean on instead.",
      "Say only what changes. The camera clauses describe the new viewpoint in the trade's own terms (elevation in degrees, which face is toward the lens, the shot size, the focal length) with a short gloss of what that looks like, so a model that does not know the word still gets the picture.",
      "Perspective follows the camera, not the source. A view from above must draw the top face large and the far side foreshortened; a low view must let the ground plane recede and the subject tower. Stating the consequence is what stops the model pasting the old view into a new frame.",
      "The library's two global rules close every prompt: no text anywhere, strip all branding.",
    ],
    "Two registers": [
      "Compact (the default in the picker): the whole system in under 1,000 characters, rules included, for Figma's image-generation prompt field. The cap is an observed working ceiling, not a documented one (see research/models.md), and the models themselves have far more room.",
      "Full: every clause spelled out, with the gloss and the perspective consequences, for models and fields with no cap or when a compact result drifts.",
      "Both registers compose from the same dials, so a set can be generated compact and one stubborn view regenerated full without the subject changing.",
    ],
    "Keeping a set consistent": [
      "Move one dial per generation. A set that changes height and orbit and lens at once reads as different subjects; a set that walks one ladder reads as one subject seen from different places.",
      "Generate the view nearest the source first (usually eye level, front or three-quarter), then attach that render beside the original for the rest. Two references, one subject, and the preserve clause restated every time.",
      "The views furthest from the source drift most: straight top-down and straight rear both hide the face the source shows. Expect to regenerate those with the best intermediate render attached.",
      "Keep the treatment fixed across a set. A restyle is a separate set, generated from the same source, never chained from a restyled render.",
    ],
    "If it comes out wrong": [
      "The camera did not move: the model repainted the source in a new frame. Switch to the full register, where each view spells out its perspective consequence (what is large, what is foreshortened, where the horizon sits), and put the subject description in the field.",
      "The subject changed: the preserve clause lost to the view clause. Attach the best render so far beside the original and, in the description, name the two or three features that drifted.",
      "Top-down came back as a tilted high angle: say 'the camera looks straight down along the vertical, the lens axis perpendicular to the ground' in the description. The model's default 'top view' is a bird's-eye, not a plan.",
      "The wide lens looked like a normal lens: focal length is the weakest camera lever on these models. Describe the distortion instead: 'the near side enlarged, straight edges bowing, the background pushed far away'.",
    ],
    Sources: [
      "Camera clauses: research/camera-views.md (2026-09-03).",
      "Preserve-clause language and the one-dial rule: research/models.md (OpenAI gpt-image prompting guide and cookbook, Google Gemini image prompting guide) and research/base-mesh-restyling.md (turnaround practice, the one-hop rule).",
      "Studio packshot treatment: research/composition.md (focal length, viewpoint versus angle, seamless sweep, three-light grammar, contact shadow).",
      "Grey clay treatment: research/base-mesh-restyling.md (the flat-lit, shadowless, untextured base render).",
    ],
  },
];
