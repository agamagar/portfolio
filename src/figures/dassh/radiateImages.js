// Every image that draws the DasshRadiate shader. boundaryId keys src/figures/dassh/radiate-boundaries.json;
// mask is the PNG fallback (and the playground's starting outline when nothing is saved yet).
import { PROBLEM_VIEW, NOISE_VIEW } from "./DasshRadiate";

const IMG = "/figures/dassh/";
export const RADIATE_IMAGES = [
  { id: "problem", label: "Problem photo", photo: IMG + "problem-photo.webp", mask: IMG + "problem-mask.png", view: PROBLEM_VIEW },
  { id: "noise", label: "Noise photo (hero)", photo: IMG + "noise-photo.webp", mask: IMG + "noise-mask.png", view: NOISE_VIEW },
];
