// THE PROMPT LIBRARY - map of this folder.
//
//   rules.js              the two global image rules, declared once
//   voice/
//     frameworks.data.js  4 voice frameworks as structured data
//     moments.data.js     52 moments: a job, optional context, reference lines
//     buildPrompt.js      the assembler; every voice prompt is composed by it
//     index.js            derives the framework + moment specs
//   teams/                the Team prompts PAGE (its own route, not part of this
//                         library's specs): 7 roles, their tasks, one assembler, page.js
//   image/
//     recipe.js           the shared recipe contract (dials, styles, compose)
//     airplaneViews.js    the group the contract was generalised from
//     faces3dViews.js     3D faces, the first group built ON the contract
//     *.data.js           the six catalogs, one file per group
//     index.js            orders the groups and appends the rules
//
// This file assembles the two halves into the object PrdRenderer consumes. It was
// one 1415-line file holding both kinds of prompt in a flat list; the split exists
// so a group is edited in its own file, which also ends the collision when Claude
// Code and Cowork edit the library in parallel.
import { voiceSpecs } from "./voice/index.js";
import { imageSpecs } from "./image/index.js";

export const promptLibraryData = {
  synthesis: {
    oneLiner:
      "Two kinds of prompt, kept in one place: the voice frameworks that write product copy, and the image systems that draw everything else.",
    "What this is": [
      "Voice: four frameworks (Away, Edge, Zepto Premium, and a neutral default), each a persona plus principles, a reach-for and an avoid list, hard rules, and a one-line test.",
      "Every framework carries its moments (onboarding, verdict, warning, error, and so on), each with its job and reference lines.",
      "Image: seventeen prompt systems (Zepto icons, Away icons, 3D icons, team illustrations, composition, camera views, Zepto catalogue, Zepto campaign tiles, schedule images, schedule POV, specimen cards, doodle hands, portfolio line icons, isometric objects, Ekam, aircraft turnarounds, 3D faces), each a constant style plus a small set of dials.",
      "The text prompts for the seven teams Agam worked with live on their own page, Team prompts, at /work/team-prompts.",
      "Nothing on this page is typed twice. Every copy-paste block is composed from the data beside it, so editing one principle rewrites every prompt that uses it.",
    ],
    "How a voice prompt is assembled": [
      "System line: 'You are {framework}. {one-liner}', then the persona.",
      "Task: write N options of the chosen moment's copy for a topic.",
      "The moment's job, plus any extra context.",
      "Voice principles, as bullets.",
      "A reach-for word list and an avoid list.",
      "The framework's hard rules.",
      "Reference lines for how the moment sounds (write fresh, do not copy).",
      "The framework's test, to self-check against.",
      "Final instruction: N fresh, ship-ready options, one per line, no preamble.",
    ],
    "How an image prompt is assembled": [
      "One constant style paragraph per system, which is what holds a set together.",
      "A dial per thing you pick: the subject, and depending on the system a view, a frame, a mode, a colourway, or a campaign.",
      "A per-subject cue describing shape only, so it survives a change of style.",
      "The library's two global rules, appended last from one constant: no text anywhere in the image, and strip all branding.",
      "Where a system has an interactive picker, the page composes the prompt live from the same recipe the catalogs are built from.",
    ],
    Sources: [
      "Away: Away_Tonality_Framework.md, away-brand-marketing-framework.md, travel-agent-voice-one-liners.md, App Store / ASO copy.",
      "Zepto: Edge (JARVIS) Voice and Sample Copy, Zepto Premium voice.",
      "Check Designs plugin: prompts-data.js.",
      "The image systems were built here, in the portfolio, one session per group.",
    ],
  },
  specs: [...voiceSpecs, ...imageSpecs],
};

export default promptLibraryData;
