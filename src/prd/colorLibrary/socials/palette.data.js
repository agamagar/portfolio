// The social media palette for "Designing in public" (/socials). Seeded from the
// accent the socials page already uses (#b5487e) and picked by measurement, not by
// eye: candidates were run against White, Paper and Ink before any value landed here.
// #b5487e itself is 4.46:1 on Paper, a body-text miss, so the palette darkens it to
// Plum #A33D70 (5.40:1 on Paper) and keeps the original only as a graphic.
export const PRINCIPLE = [
  "Warm paper, dark ink, one plum voice. Three supports for when a post needs a second note.",
  "Paper and Ink carry every post: the ground and the type. A feed of these reads as one hand.",
  "Plum is the voice. Headlines, the series number, the highlighted word. One per post.",
  "Coral, Teal and Marigold are supports: a chart bar, a sticker, a series colour. Each is a fill, never a paragraph colour.",
];

export const CORE = [
  { key: "paper", label: "Paper", hex: "#F6F1EA", role: "ground" },
  { key: "ink", label: "Ink", hex: "#1C1917", role: "type, dark ground" },
  { key: "plum", label: "Plum", hex: "#A33D70", role: "the voice" },
];

export const SUPPORTS = [
  { key: "coral", label: "Coral", hex: "#E07A5F", role: "fill, Ink type on it" },
  { key: "teal", label: "Teal", hex: "#2F6F6A", role: "fill, Paper or white type on it" },
  { key: "marigold", label: "Marigold", hex: "#F2C14E", role: "highlight, Ink type on it" },
];

// One series colour per content pillar, so a grid of posts is readable at a glance.
export const SERIES = [
  { label: "Case breakdowns", bg: "#A33D70", fg: "#F6F1EA" },
  { label: "Process in public", bg: "#2F6F6A", fg: "#F6F1EA" },
  { label: "Quick tips", bg: "#F2C14E", fg: "#1C1917" },
  { label: "Lab experiments", bg: "#E07A5F", fg: "#1C1917" },
  { label: "Dark carousel", bg: "#1C1917", fg: "#F6F1EA" },
];
