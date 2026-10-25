import { createContext } from "react";

// A slot under a PhoneFrame that a live screen inside it can fill with a link (critique 18.2, 25 Oct). FigmaEmbed puts
// its phone "Open in Figma" here, so the link sits in the frame's link row under the phone and covers no screen.
// The value is a setter: call it with an href, or null to clear. Outside a PhoneFrame it is null.
export const PhoneLinkSlot = createContext(null);
