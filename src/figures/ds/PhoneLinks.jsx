// The "Try prototype" action under a phone frame (private build only; callers pass `proto` from private-build data).
import "./phoneFrame.css";
import { lazy, Suspense, useEffect, useState } from "react";

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

export default function PhoneLinks({ proto }) {
  const [open, setOpen] = useState(false);
  if (!proto) return null;
  return (
    <div className="pf__links">
      {proto && <button type="button" className="fshot-pill" onClick={() => setOpen(true)}>Try prototype</button>}
      {open && <ProtoDialog id={proto} onClose={() => setOpen(false)} />}
    </div>
  );
}
