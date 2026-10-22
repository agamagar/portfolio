import { lazy, Suspense, useEffect, useState } from "react";
import IphoneFrame from "../ds/IphoneFrame";
import { FIGMA_SCREENS } from "./figmaScreens";
import "./figmaShot.css";

// One screen from the Zepto Figma file, in the site's shared phone (IphoneFrame), with a status tag and, in the private
// build only, a glass "Open in Figma" link and (where a live playground case matches) "Try prototype".
//   <FigmaShot k="pdp" width={208} alt="..." />          phone
//   <FigmaShot k="toggle-demo" bare alt="..." />          a board / composite that isn't one phone: plain plate
const PlaygroundEmbed = lazy(() => import("../sdStory/PlaygroundEmbed"));
const TAG = { killed: "Rejected", explored: "Explored", shipped: "Shipped" };

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

// the link row alone, for places that already draw their own screen (SchedDirections)
export function FigmaLinks({ k }) {
  const m = FIGMA_SCREENS[k];
  const [open, setOpen] = useState(false);
  if (!m || !(m.link || m.proto)) return null;
  return (
    <div className="fshot__links">
      {m.link && <a className="fshot-pill" href={m.link} target="_blank" rel="noopener noreferrer">Open in Figma ↗</a>}
      {m.proto && <button type="button" className="fshot-pill" onClick={() => setOpen(true)}>Try prototype</button>}
      {open && <ProtoDialog id={m.proto} onClose={() => setOpen(false)} />}
    </div>
  );
}

export default function FigmaShot({ k, alt, width = 208, bare = false, tag = true, className = "" }) {
  const m = FIGMA_SCREENS[k];
  if (!m) return null;
  const links = <FigmaLinks k={k} />;
  return (
    <figure className={"fshot " + className} data-status={m.status} style={{ width: bare ? undefined : width }}>
      {tag && <span className="fshot__tag" data-status={m.status}>{TAG[m.status]}</span>}
      {bare
        ? <img className="fshot__bare" src={m.src} alt={alt} loading="lazy" draggable="false" />
        : (
          <IphoneFrame width={width} controls={false} className={m.sheet ? "fshot__sheet" : ""} alt={alt}>
            <img className="ifr__img" src={m.src} alt={alt} loading="lazy" draggable="false" />
          </IphoneFrame>
        )}
      {links}
    </figure>
  );
}
