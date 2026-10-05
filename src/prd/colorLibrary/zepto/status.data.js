// The five unavailability states. Hue encodes domain, depth encodes severity.
// 500 is the icon on white; 700 is label plus icon on a tinted surface.
// Values attested in the handoff doc; the CVD figures are the doc's, from cvd.py
// (Viénot LMS projection, CIE76 dE), and are quoted, not recomputed here.
export const STATUS = [
  { key: "out-of-hours", label: "Out of hours", hue: "indigo", s500: "#3F3FA5", s700: "#313181" },
  { key: "beyond-coverage", label: "Beyond coverage", hue: "taupe", s500: "#8B837E", s700: "#68625E" },
  { key: "at-capacity", label: "At capacity", hue: "amber", s500: "#D47E05", s700: "#905603" },
  { key: "out-of-stock", label: "Out of stock", hue: "cyan", s500: "#229ED3", s700: "#176B8F" },
  { key: "disruptions", label: "Disruptions", hue: "red", s500: "#A02222", s700: "#7D1B1B" },
];

export const CVD = {
  worstPairDeltaE: 32.1,
  confusableBelow: 15,
  firstHandPickedSet: 5.4,
  note: "A rose collapsed onto a slate for protanopes in the first hand-picked set. Each state is now constrained to a semantically valid hue band and optimised inside it.",
};
