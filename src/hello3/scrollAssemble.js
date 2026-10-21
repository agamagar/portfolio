// Scroll assemble's roots join the section controller (src/ui/sectionPlay.js): each plays its
// settle, time-based, when its top reaches the viewport centre, and again every time it is
// scrolled back to. The CSS lives in scrollAssemble.css.
import { markSections } from "../ui/sectionPlay";

const ROOTS = '.hello[data-page="3"] .wg__card, .hello[data-page="3"] .ap, .hello[data-page="3"] .hello-foot, .hello[data-page="3"] .sq, .hello[data-page="3"] .wg__cap';

if (typeof document !== "undefined") markSections(ROOTS);
