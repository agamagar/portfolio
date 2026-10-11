import { createContext } from "react";

// muzdylub (8 Oct): false while a case study that opts in (cs.loadReveal) is still
// settling its fonts and hero assets behind opacity 0; true once the page reveals.
// A figure that animates on mount reads it to hold its clock until the reveal, so
// its opening beats are not spent behind an invisible page. Defaults to true, so
// a figure rendered anywhere else (slides, labs) is never held.
export const LoadRevealContext = createContext(true);
