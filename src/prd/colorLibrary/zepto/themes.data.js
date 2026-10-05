// The six Zepto themes, as attested in the handoff doc "Zepto colour system, handoff
// to Claude Code" (Google Doc 1QsMZEyWNuWLb8RpgxjRa7PsfR5C-RaVLPSNxxrg5yzk).
// Only values the doc states are here: the primary per theme, plus the three lavender
// values it names (100 surface, 700 type, 900). The 50-900 ramps, ink/canvas/hot/
// hotdeep/warm/cool accents and the twelve banner recipes live in the generated
// tokens.json, which is NOT in this repo yet; see zepto/index.js "Known gaps".
export const INK_PROBE = "#111111"; // the page's probe ink for audits, not a system token
export const WHITE = "#FFFFFF";

export const THEMES = [
  {
    key: "green",
    label: "Green",
    primary: "#47D62C",
    register: "Amazon Fresh. Light primary, dark forest type.",
    provenance: "Sampled by eye from a JPEG-ish Amazon Fresh board, not from brand files. Treat as close, not authoritative.",
  },
  {
    key: "purple",
    label: "Purple",
    primary: "#950EDB",
    register: "Zepto Electric Violet. Campaign voice, white type.",
  },
  {
    key: "orange",
    label: "Orange",
    primary: "#F2600C",
    register: "Signal. Urgency.",
    caveat: "A known mid-tone: holds neither white nor ink at 4.5:1. Button fills step deeper along the hot chain, never to black.",
  },
  {
    key: "blue",
    label: "Blue",
    primary: "#1668E3",
    register: "Trust, utility.",
  },
  {
    key: "yellow",
    label: "Yellow",
    primary: "#FFC803",
    register: "Attention, value.",
  },
  {
    key: "lavender",
    label: "Lavender",
    primary: "#8B5CF6",
    register: "Zepto in-product. Pastel surface with deep royal type.",
    surface100: "#EADCFB",
    type700: "#6318B8",
    deep900: "#33095E",
    caveat:
      "Not a lighter purple. Its brand signal is the pastel surface (100) with deep royal type (700), not a saturated fill. The 900 is exactly the colour the unavailability icons ship in today. A known mid-tone: 4.2:1 on white, 3.9:1 on ink.",
    provenance: "Every lavender value is sampled from Zepto in-product assets except the hot/warm/cool accents, which are extensions.",
  },
];
