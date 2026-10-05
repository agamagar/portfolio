// The Away brand palette, as printed in the Brand Guidelines, Color section
// (Active - Away/Brand Book/Color/color_2.pdf and color_3.pdf). Hex values read from
// the PDF text layer and checked against the rendered page. RGB/CMYK are the
// guideline's own, quoted not derived.
export const PRINCIPLE = [
  "We are a neutral brand. With one bright note, and a few more when we want them.",
  "Neutrals do most of the work. Black, white and eight tones of grey make up the ground the brand stands on. Most of what Away puts on the page lives here: quiet, editorial, unshowy.",
  "Sky is the primary accent. One clear modern note against the neutrals, used sparingly and always intentionally.",
  "Three secondaries, Midnight, Glow and Basil, sit alongside Sky for the moments the brand wants to widen its voice. Editorial, campaign and expressive contexts. Never as decoration.",
];

export const NEUTRALS = [
  { key: "black", label: "Black", hex: "#000000", cmyk: "10/0/0/100" },
  { key: "white", label: "White", hex: "#FFFFFF", cmyk: "0/0/0/0" },
  { key: "grey-100", label: "Grey 100", hex: "#E1E1E1", cmyk: "0/0/0/12" },
  { key: "grey-200", label: "Grey 200", hex: "#BEBDBD", cmyk: "0/1/1/25" },
  { key: "grey-300", label: "Grey 300", hex: "#8E8C8C", cmyk: "0/1/1/44" },
  { key: "grey-400", label: "Grey 400", hex: "#4F4D4D", cmyk: "0/3/3/69" },
  { key: "grey-500", label: "Grey 500", hex: "#3F3D3D", cmyk: "0/3/3/75" },
  { key: "grey-600", label: "Grey 600", hex: "#302E2E", cmyk: "0/4/4/81" },
  { key: "grey-700", label: "Grey 700", hex: "#232222", cmyk: "0/3/3/86" },
  { key: "grey-800", label: "Grey 800", hex: "#1A1A1A", cmyk: "0/0/0/90" },
];

export const SKY = [
  { key: "light-sky", label: "Light Sky", hex: "#8CE3F2", cmyk: "42/6/0/5" },
  { key: "sky", label: "Sky", hex: "#18C8E8", cmyk: "90/14/0/9" },
  { key: "dark-sky", label: "Dark Sky", hex: "#0B7E93", cmyk: "92/14/0/42" },
];

export const SECONDARIES = [
  { key: "midnight", label: "Midnight", hex: "#6854E8", cmyk: "55/64/0/9" },
  { key: "glow", label: "Glow", hex: "#C459C4", cmyk: "0/55/0/23" },
  { key: "basil", label: "Basil", hex: "#4AC485", cmyk: "62/0/32/23" },
];
