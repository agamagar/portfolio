// The link row under a phone frame: "Try prototype" (private build only; callers pass `proto` from private-build data),
// "Open in Figma" (`figma`, an href; FigmaEmbed sets it on phones through PhoneLinkSlot) and, right-aligned, the glass
// Restart of a live prototype (`onRestart`; FigmaEmbed sets it while its iframe runs).
import "./phoneFrame.css";
import { lazy, Suspense, useEffect, useState } from "react";
import { OpenNewWindow, Refresh } from "iconoir-react";
import { PhoneLinkSlot } from "./phoneLinkSlot";

const PlaygroundEmbed = lazy(() => import("../sdStory/PlaygroundEmbed"));

function ProtoDialog({ id, onClose }) {
  useEffect(() => {
    const k = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", k);
    return () => window.removeEventListener("keydown", k);
  }, [onClose]);
  return (
    <div className="fshot-dlg" role="dialog" aria-modal="true" aria-label="Prototype" onClick={onClose}>
      <div className="fshot-dlg__box" onClick={(e) => e.stopPropagation()}>
        <button type="button" className="fshot-pill fshot-dlg__x" onClick={onClose}>Close</button>
        <Suspense fallback={null}><PlaygroundEmbed id={id} fit="fill" frame="none" /></Suspense>
      </div>
    </div>
  );
}

export default function PhoneLinks({ proto, figma, onRestart }) {
  const [open, setOpen] = useState(false);
  if (!proto && !figma && !onRestart) return null;
  return (
    <div className="pf__links" data-restart={onRestart ? "" : undefined}>
      {proto && <button type="button" className="fshot-pill" onClick={() => setOpen(true)}>Try prototype</button>}
      {figma && (
        <a className="fshot-pill fshot-pill--link" href={figma} target="_blank" rel="noopener noreferrer" aria-label="Open in Figma (opens a new tab)">
          Open in Figma <OpenNewWindow width={12} height={12} strokeWidth={2} aria-hidden />
        </a>
      )}
      {onRestart && (
        <button type="button" className="theme-toggle dev-glass pf__restart" aria-label="Restart the prototype" title="Restart" onClick={onRestart}>
          <Refresh width={15} height={15} strokeWidth={2} aria-hidden />
        </button>
      )}
      {open && <ProtoDialog id={proto} onClose={() => setOpen(false)} />}
    </div>
  );
}

// Catches a phone link (PhoneLinkSlot) from anything inside and draws the link row under it, for a phone that is
// cropped by its plate, where a row under the phone itself would be cut off. Give that PhoneFrame linkSlot={false}.
export function LinksBelow({ children }) {
  const [slotted, setSlotted] = useState(null);
  return (
    <>
      <PhoneLinkSlot.Provider value={setSlotted}>{children}</PhoneLinkSlot.Provider>
      {(slotted?.figma || slotted?.restart) && <PhoneLinks figma={slotted.figma} onRestart={slotted.restart} />}
    </>
  );
}
