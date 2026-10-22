import PhoneFrame from "../ds/IphoneFrame";
import PhoneLinks from "../ds/PhoneLinks";
import { FIGMA_SCREENS } from "./figmaScreens";
import "./figmaShot.css";

// One screen from the Zepto Figma file, in the site's shared PhoneFrame, with a status tag and, in the private
// build only, "Open in Figma" and (where a live playground case matches) "Try prototype".
//   <FigmaShot k="pdp" size="md" alt="..." />          phone
//   <FigmaShot k="toggle-demo" bare alt="..." />       a board / composite that isn't one phone: plain plate
const TAG = { killed: "Rejected", explored: "Explored", shipped: "Shipped" };

// the link row alone, for places that already draw their own screen (SchedDirections)
export function FigmaLinks({ k }) {
  const m = FIGMA_SCREENS[k];
  return m ? <PhoneLinks figma={m.link} proto={m.proto} /> : null;
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
  return (
    <PhoneFrame screen={m.src} alt={alt} size={size} width={width} sheet={m.sheet} interactive={false}
      tag={tag ? TAG[m.status] : undefined} tagTone={m.status} figma={m.link} proto={m.proto} className={className} />
  );
}
