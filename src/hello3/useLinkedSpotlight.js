import { useEffect } from "react";

// ONE SPOTLIGHT FOR THE TIMELINE AND THE CARDS (mv3mbvr7, 11 Oct 2026: "there
// is a hover interaction where all the elements grey out, apply to the visual
// cards below as well, they should work in conjunction too"). Every timeline
// row and every work card carries data-project (its case href). Pointing at,
// or tabbing to, any of them writes that project onto the page root as
// data-spot and marks every element of the same project data-lit; the CSS in
// hello3.css dims everything else to the rows' existing 0.4. So hovering
// "Toppr" in the timeline keeps the Toppr card lit and greys the rest, and the
// reverse. CSS cannot compare two attribute values, which is why the match is
// made here. Touch is ignored (a tap navigates; a sticky spotlight would be
// left behind on the page it returns to).
export default function useLinkedSpotlight(anchorRef) {
  useEffect(() => {
    const root = anchorRef.current?.closest(".hello");
    if (!root) return undefined;
    let current = null;
    const set = (project) => {
      if (project === current) return;
      current = project;
      root.querySelectorAll("[data-project]").forEach((el) => {
        if (project && el.dataset.project === project) el.setAttribute("data-lit", "");
        else el.removeAttribute("data-lit");
      });
      if (project) {
        root.setAttribute("data-spot", project);
        // the entrance stagger delays are spent by now; from here the dim
        // answers at once, in and out (see hello3.css)
        root.setAttribute("data-spot-ready", "");
      } else root.removeAttribute("data-spot");
    };
    const from = (e) => e.target.closest?.("[data-project]");
    // with the pointer off every project, a KEYBOARD focus still holds the spot
    // (a mouse click focuses the link too, but that must not leave it stuck on)
    const kbd = (el) => (el?.matches?.(":focus-visible") ? el.closest("[data-project]") : null);
    const focused = () => kbd(document.activeElement)?.dataset.project || null;
    const onOver = (e) => { if (e.pointerType !== "touch") set(from(e)?.dataset.project || focused()); };
    const onOut = (e) => { if (e.pointerType !== "touch" && !e.relatedTarget?.closest?.("[data-project]")) set(focused()); };
    const onFocusIn = (e) => { const el = kbd(e.target); if (el) set(el.dataset.project); };
    const onFocusOut = (e) => { if (!e.relatedTarget?.closest?.("[data-project]")) set(null); };
    root.addEventListener("pointerover", onOver);
    root.addEventListener("pointerout", onOut);
    root.addEventListener("focusin", onFocusIn);
    root.addEventListener("focusout", onFocusOut);
    return () => {
      set(null);
      root.removeEventListener("pointerover", onOver);
      root.removeEventListener("pointerout", onOut);
      root.removeEventListener("focusin", onFocusIn);
      root.removeEventListener("focusout", onFocusOut);
    };
  }, [anchorRef]);
}
