// ONE definition of "this popover is a bottom sheet now" (Agam, 2026-08-11).
//
// Two components on this page open panels anchored to a word: the footnote in
// the sign-off (HelloNote) and the role cards in the credentials line
// (RoleTooltip). Below 640px neither can behave like a tooltip — a ~390px card
// hanging off a centred line has nowhere to hang, so it clamps to the viewport
// edge and covers the very words it is annotating, with no obvious way out for
// a thumb. Both become sheets instead, and they have to agree on WHEN, or the
// page would switch modes at two different widths.
//
// Breakpoint, not pointer type: a narrow window on a laptop has the same
// geometry problem, and a tablet with a mouse does not.

import { useEffect, useState } from "react";

export const SHEET_QUERY = "(max-width: 640px)";

export function useSheetMode() {
  // Guarded for the first render on a server or a pre-hydration pass: false is
  // the safe default because it is the layout the CSS falls back to as well.
  const [sheet, setSheet] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia(SHEET_QUERY);
    const sync = () => setSheet(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  return sheet;
}
