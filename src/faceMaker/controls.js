// The friendly control panel, as data: groups -> controls. Labels name the two ends in plain words.
// range = the taste range from faceTaste/params (so a slider can never reach an out-of-taste extreme).
export const GROUPS = [
  { id: "look", label: "Look", open: true, controls: [{ kind: "material" }, { kind: "tone" }] },
  { id: "hair", label: "Hair", open: true, controls: [
    { kind: "style" }, { kind: "hairColor" },
    { path: "hair.length", label: "Length", ends: ["Short", "Long"] }, { path: "hair.fringe", label: "Fringe", ends: ["None", "Full"] },
    { path: "hair.messiness", label: "Messiness", ends: ["Neat", "Messy"] }, { path: "hair.volume", label: "Volume", ends: ["Flat", "Big"] },
    { path: "hair.sweep", label: "Fringe sweep", ends: ["Left", "Right"] }, { kind: "clip" } ] },
  { id: "eyes", label: "Eyes", open: true, controls: [
    { path: "eyes.size", label: "Size", ends: ["Small", "Big"] }, { path: "eyes.spacing", label: "Spacing", ends: ["Close", "Wide"] },
    { path: "eyes.openness", label: "Openness", ends: ["Sleepy", "Wide awake"] }, { path: "eyes.smileSquint", label: "Smiley eyes", ends: ["None", "A lot"] },
    { path: "eyes.height", label: "Height", ends: ["Low", "High"] } ] },
  { id: "brows", label: "Brows", controls: [
    { path: "brows.height", label: "Height", ends: ["Low", "High"] }, { path: "brows.angle", label: "Mood", ends: ["Worried", "Stern"] }, { path: "brows.arch", label: "Arch", ends: ["Flat", "Arched"] } ] },
  { id: "nose", label: "Nose", controls: [
    { path: "nose.width", label: "Width", ends: ["Slim", "Broad"] }, { path: "nose.tip", label: "Tip", ends: ["Down", "Up"] }, { path: "nose.length", label: "Length", ends: ["Short", "Long"] } ] },
  { id: "mouth", label: "Mouth", controls: [
    { path: "mouth.smile", label: "Smile", ends: ["Frown", "Smile"] }, { path: "mouth.width", label: "Width", ends: ["Small", "Wide"] }, { path: "mouth.parted", label: "Open", ends: ["Closed", "Parted"] } ] },
  { id: "cheeks", label: "Cheeks and jaw", controls: [
    { path: "cheeks.fullness", label: "Cheeks", ends: ["Hollow", "Round"] }, { path: "cheeks.jaw", label: "Jaw", ends: ["Narrow", "Wide"] }, { path: "cheeks.chin", label: "Chin", ends: ["Pointed", "Round"] } ] },
];
export const STYLE_LABELS = { "shoulder-messy": "Shoulder, messy", bob: "Bob", crop: "Short crop", "long-straight": "Long, straight" };
export const MATERIAL_LABELS = { clay: "Soft clay", claySun: "Sun clay", felt: "Felt", stone: "Stone", pixel: "Pixel", riso: "Riso", hose: "Rubber hose", cel: "Cel", print: "Print" };
export const EMOTES = [["grin", "Smile"], ["laugh", "Laugh"], ["surprised", "Surprised"], ["shy", "Shy"], ["think", "Thinking"], ["sad", "Sad"], ["angry", "Angry"], ["lookAround", "Look around"]];
export const STYLE_CHOICES = [["balanced", "Balanced"], ["cute", "Cute"], ["bold", "Bold"], ["calm", "Calm"], ["character", "Character"]];
export const HAIR_COLOURS = ["#151414", "#1b110d", "#2a1810", "#4a2f21", "#6e4b32", "#7a4a2a", "#a0522d", "#c9a36a", "#2b3a55"];
