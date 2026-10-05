// EKAM: one page, one generator. This group used to render eleven catalog pages (the
// system spec, four asset catalogs, the colourway set, and two experiment groups); all
// of that prose now lives in Claude/EKAM Art Direction/prompt-library-ekam.md and is
// deliberately not rendered. Style and object are dials, not pages.
//
// The prompts themselves are unchanged: the builder composes through ekamAllViews.js,
// which delegates to the same per-style parts() in ekamViews.js (Soft Focus),
// ekamExperimentViews.js (icon badge, constellation figure) and ekamExperiment2Views.js
// (chalk print).
const generatorSpec = {
  id: "pl-ekam-generator",
  group: "Ekam",
  eyebrow: "Ekam",
  title: "Ekam · prompt generator",
  summary:
    "Imagery for EKAM, the women's health clinic in Dehradun, generated in Figma with GPT Image 2. Pick a style and an object; the prompt composes live. The model makes imagery only: the five-slot post grammar (band, kicker, headline, body, signature) is built in Figma and set in real type, never generated.",
  Generator: { builder: "ekam" },
};

export const ekamSpecs = [generatorSpec];
export default ekamSpecs;
