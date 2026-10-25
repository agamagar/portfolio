import { createContext } from "react";

// A slot under a PhoneFrame that a live screen inside it can fill with its controls, so they sit in the frame's link
// row under the phone and cover no screen. FigmaEmbed puts two here: its phone "Open in Figma" (critique 18.2, 25 Oct)
// and its glass Restart (Agam, 25 Oct: "the glass reload button should not be inside the phone frame").
// The value is a setter: call it with { figma: href, restart: fn } (either may be missing), or null to clear.
// Outside a PhoneFrame it is null.
export const PhoneLinkSlot = createContext(null);
