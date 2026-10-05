// The Away app's in-product palette, copied from the app source
// (~/away/away-app/src/core/theme/palettes.ts, "colors from in house color palette")
// by a script, not retyped. Twelve ramps, 50-950 in the light theme; the dark theme
// reverses every ramp except Neutral BW, which has its own hand-set dark steps.
// Feedback and surface aliases from src/core/theme/semantic.ts.
export const RAMPS = [
  {
    "key": "brightRed",
    "label": "Bright red",
    "steps": {
      "50": "#ffe9e6",
      "100": "#ffd3cf",
      "200": "#ffb6b1",
      "300": "#ff9793",
      "400": "#f46e6d",
      "500": "#d14e4f",
      "600": "#ae2c33",
      "700": "#831821",
      "800": "#5b040f",
      "900": "#330004",
      "950": "#1c0203"
    }
  },
  {
    "key": "neonRose",
    "label": "Neon rose",
    "steps": {
      "50": "#ffe7f9",
      "100": "#ffd0ee",
      "200": "#ffb2dd",
      "300": "#ff92c7",
      "400": "#ee68a9",
      "500": "#cb488a",
      "600": "#a8266d",
      "700": "#7f124f",
      "800": "#570034",
      "900": "#30001a",
      "950": "#1a020d"
    }
  },
  {
    "key": "earthyYellow",
    "label": "Earthy yellow",
    "steps": {
      "50": "#fff1df",
      "100": "#ffe1c2",
      "200": "#faca9f",
      "300": "#eab07c",
      "400": "#d08e4f",
      "500": "#af702e",
      "600": "#8f5202",
      "700": "#6b3a00",
      "800": "#492300",
      "900": "#270f00",
      "950": "#150800"
    }
  },
  {
    "key": "lifeLime",
    "label": "Life lime",
    "steps": {
      "50": "#f7f8db",
      "100": "#ebecbb",
      "200": "#d9da94",
      "300": "#c4c46d",
      "400": "#a6a438",
      "500": "#878505",
      "600": "#6b6800",
      "700": "#4e4b00",
      "800": "#333000",
      "900": "#191700",
      "950": "#0d0c00"
    }
  },
  {
    "key": "fuanaGreen",
    "label": "Fuana green",
    "steps": {
      "50": "#e8fddb",
      "100": "#d2f5bc",
      "200": "#b6e595",
      "300": "#99d16e",
      "400": "#74b338",
      "500": "#569405",
      "600": "#397500",
      "700": "#255600",
      "800": "#123800",
      "900": "#051d00",
      "950": "#040f00"
    }
  },
  {
    "key": "neutralBw",
    "label": "Neutral BW",
    "steps": {
      "0": "#ffffff",
      "30": "#f9f9fa",
      "50": "#f5f5f6",
      "100": "#e8e8e9",
      "200": "#d4d4d5",
      "300": "#bebebe",
      "400": "#9e9e9f",
      "500": "#808081",
      "600": "#636363",
      "700": "#484848",
      "800": "#2e2e2e",
      "900": "#161616",
      "950": "#0b0b0b"
    }
  },
  {
    "key": "forestTeal",
    "label": "Forest teal",
    "steps": {
      "50": "#dfffeb",
      "100": "#c1f7d6",
      "200": "#9be9ba",
      "300": "#75d59e",
      "400": "#3cb97a",
      "500": "#00995c",
      "600": "#007a40",
      "700": "#005a2b",
      "800": "#003b17",
      "900": "#001f07",
      "950": "#001005"
    }
  },
  {
    "key": "glassCyan",
    "label": "Glass cyan",
    "steps": {
      "50": "#defcfd",
      "100": "#c1f3f4",
      "200": "#9be4e4",
      "300": "#74d0d0",
      "400": "#3bb2b3",
      "500": "#009394",
      "600": "#007576",
      "700": "#005557",
      "800": "#003839",
      "900": "#001d1e",
      "950": "#000f0f"
    }
  },
  {
    "key": "mysticBlue",
    "label": "Mystic blue",
    "steps": {
      "50": "#e4f8ff",
      "100": "#cbecff",
      "200": "#abd9ff",
      "300": "#8bc3fe",
      "400": "#62a3e7",
      "500": "#4384c5",
      "600": "#2366a5",
      "700": "#11497c",
      "800": "#022f56",
      "900": "#001630",
      "950": "#020c1a"
    }
  },
  {
    "key": "tribalIndigo",
    "label": "Tribal indigo",
    "steps": {
      "50": "#fdecff",
      "100": "#f5d9ff",
      "200": "#e6beff",
      "300": "#d3a1ff",
      "400": "#b77aff",
      "500": "#995ade",
      "600": "#7b3abc",
      "700": "#5b248f",
      "800": "#3d0f64",
      "900": "#200339",
      "950": "#10041f"
    }
  },
  {
    "key": "dancingPurple",
    "label": "Dancing purple",
    "steps": {
      "50": "#ffe8ff",
      "100": "#ffd1ff",
      "200": "#ffb3ff",
      "300": "#f094ff",
      "400": "#d669ed",
      "500": "#b548cb",
      "600": "#9524aa",
      "700": "#6f0f81",
      "800": "#4c0059",
      "900": "#290032",
      "950": "#16021b"
    }
  },
  {
    "key": "vividCyan",
    "label": "Vivid cyan",
    "steps": {
      "50": "#dffbff",
      "100": "#c2f1ff",
      "200": "#9de0f7",
      "300": "#77cce6",
      "400": "#41aecc",
      "500": "#118eac",
      "600": "#00708d",
      "700": "#005269",
      "800": "#003547",
      "900": "#001b26",
      "950": "#000e14"
    }
  }
];

export const DARK_NEUTRAL = {
  "0": "#171717",
  "30": "#161616",
  "50": "#0b0b0b",
  "100": "#292929",
  "200": "#2e2e2e",
  "300": "#484848",
  "400": "#636363",
  "500": "#808081",
  "600": "#9e9e9f",
  "700": "#bebebe",
  "800": "#d4d4d5",
  "900": "#e8e8e9",
  "950": "#f5f5f6"
};

// semantic.ts: lightTheme.colors feedback shortcuts (dark theme uses the 600 step)
export const FEEDBACK = [
  { key: "success", label: "Success", ramp: "fuanaGreen", light: 500, dark: 600 },
  { key: "warning", label: "Warning", ramp: "earthyYellow", light: 500, dark: 600 },
  { key: "error", label: "Error", ramp: "brightRed", light: 500, dark: 600 },
  { key: "info", label: "Info", ramp: "vividCyan", light: 500, dark: 600 },
];

// semantic.ts: surfaces and text are aliases into Neutral BW
export const SURFACES = {
  light: { background: 50, backgroundSecondary: 100, text: 900, textSecondary: 600, textTertiary: 500, border: 200 },
  dark: { background: 50, backgroundSecondary: 100, text: 950, textSecondary: 700, textTertiary: 600, border: 300 },
};

// semantic.ts customColors: hardcoded, outside the ramps
export const CUSTOM = [
  { label: "customBackground", hex: "#1C1C1C" },
  { label: "customBackgroundSecondary", hex: "#292929" },
  { label: "customBlue_01", hex: "#3B82F6" },
];
