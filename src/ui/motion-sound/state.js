// Shim for the motion-sound engine's synth.js when it runs inside the site.
// The app's state.js looks up its own UI controls by id. The site has none of
// them, so this returns stand-ins carrying the app's own DEFAULTS, read from
// posts/motion-sound.html and main.js (28 Sep 2026):
//   scale  "Minor pentatonic" (main.js sets it at boot)
//   spread 0.6, bright 0.5 (the range inputs' value attributes)
// Without these, pitchOf() read `.value` of null and every PITCHED event
// (hit, land, enter, swell) threw and fell silent; only atonal types played.
// Source of truth for the engine: the Drive copy, posts/motion-sound/.
const DEFAULTS = { scale: "Minor pentatonic", spread: "0.6", bright: "0.5" };
export const $ = (id) => (id in DEFAULTS ? { value: DEFAULTS[id], checked: false } : null);
