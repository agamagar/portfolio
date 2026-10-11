// Marker colours. Teal is the pen the handwriting was captured with; the rest are the other markers in the tray.
export const COLORS = {
  teal: "#0b8a6c", black: "#1f2430", blue: "#2457d6", red: "#d63b3b", orange: "#e8872b",
  purple: "#7a47d1", green: "#2f9e4f", pink: "#d6409f", grey: "#6b7280", white: "#ffffff",
};
/** Colours cycled across mind-map branches / columns, in the order a person grabs markers. */
export const BRANCH_COLORS = ["blue", "red", "green", "orange", "purple", "teal", "pink"];
export const colorOf = (c, fb = "teal") => COLORS[c] ?? c ?? COLORS[fb];
