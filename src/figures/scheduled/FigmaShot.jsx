import PhoneFrame from "../ds/IphoneFrame";
import PhoneLinks from "../ds/PhoneLinks";
import FigmaEmbed from "../../ui/FigmaEmbed";
import { FIGMA_SCREENS } from "./figmaScreens";
import "./figmaShot.css";

// One screen from the Zepto Figma file, in the site's shared PhoneFrame (live from Figma when the entry has a `node`), with a status tag and, in the private
// build only, "Try prototype" where a live playground case matches.
//   <FigmaShot k="pdp" size="md" alt="..." />          phone
//   <FigmaShot k="toggle-demo" bare alt="..." />       a board / composite that isn't one phone: plain plate
const TAG = { killed: "Rejected", explored: "Explored", shipped: "Shipped" };

// the link row alone, for places that already draw their own screen (SchedDirections)
export function FigmaLinks({ k }) {
  const m = FIGMA_SCREENS[k];
  return m ? <PhoneLinks proto={m.proto} /> : null;
}

export default function FigmaShot({ k, alt, width, size = "md", bare = false, tag = true, className = "" }) {
  const m = FIGMA_SCREENS[k];
  if (!m) return null;
  if (bare) {
    return (
      <figure className={"fshot " + className} data-status={m.status}>
        {tag && <span className="fshot__tag" data-status={m.status}>{TAG[m.status]}</span>}
        <img className="fshot__bare" src={m.src} alt={alt} loading="lazy" draggable="false" />
        <FigmaLinks k={k} />
      </figure>
    );
  }
  // live: the Figma frame fills the screen (a full 360x829 frame, so no sheet anchoring); the export is its still
  const live = m.node && <FigmaEmbed mode="proto" node={m.node} title={alt} fallback={m.src} alt={alt} floor={m.sheet ? "bottom" : "cover"} />;
  return (
    <PhoneFrame screen={live ? undefined : m.src} alt={alt} size={size} width={width} sheet={!live && m.sheet} interactive={false}
      tag={tag ? TAG[m.status] : undefined} tagTone={m.status} proto={m.proto} className={className}>{live}</PhoneFrame>
  );
}
