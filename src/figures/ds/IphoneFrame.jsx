// THE phone frame for the whole site (one component, one set of tokens in phoneFrame.css).
// The bezel is the "Bezel" component from Figma Portfolio 2026 (node 492-48278, iPhone 17 Pro
// Silver, 3x export at /figures/frames/iphone-17-pro.png); the screen cutout was measured off
// its alpha. Everything that shows a mobile screen goes through this: bare screenshots,
// videos, iframes, live coded screens.
//
//   <PhoneFrame screen="/figures/x.png" alt="..." size="md" />                  image
//   <PhoneFrame size="lg" caption="..." tag="Shipped" figma={url} proto="id"><LiveScreen/></PhoneFrame>
//   <PhoneFrame size="sm"><video src=... /></PhoneFrame>                          video / iframe
//
// size    "xs" thumbnail 120 · "sm" row/carousel 168 · "md" pair/default 208 · "lg" single 300 ·
//         "hero" 340 (the token widths live in phoneFrame.css; a number = px override)
// width   px override of size
// theme   "light" | "dark": ground for the drop shadow (auto = follows the page)
// shadow  "none" | "sm" | "md" (default) | "lg"
// statusBar  false | "dark" | "light": draw the iOS status bar (9:41, signal, battery) over a bare
//         screen that doesn't carry its own; island adds the Dynamic Island pill
// caption / tag / figma / proto: caption under the phone, a status chip over it, and the
//         "Open in Figma" / "Try prototype" row under it (links are private-build only)
// interactive  hover bar with play / restart / scrub / expand (PhoneControls); on by default
// enter   scroll entrance on the section-play controller (fade-up); off for hero phones that
//         have their own load sequence
// overlay a node drawn over the bezel (pointers, cues)
// sheet   bottom-sheet export alone: anchored to the foot of a dimmed screen
import { useEffect, useRef } from "react";
import PhoneControls from "../../ui/PhoneControls";
import { rise } from "../../ui/useSectionPlay";
import PhoneLinks from "./PhoneLinks";
import "./phoneFrame.css";

export const IPHONE_FRAME_SRC = "/figures/frames/iphone-17-pro.png";
export const PHONE_SIZES = { xs: 120, sm: 168, md: 208, lg: 300, hero: 340 };

function StatusBar({ tone }) {
  return (
    <div className="pf__status" data-tone={tone} aria-hidden="true">
      <span className="pf__time">9:41</span>
      <span className="pf__sys">
        <svg width="17" height="11" viewBox="0 0 17 11"><path fill="currentColor" d="M0 7h3v4H0zM4.7 5h3v6h-3zM9.3 2.7h3V11h-3zM14 0h3v11h-3z" /></svg>
        <svg width="25" height="12" viewBox="0 0 25 12"><rect x=".5" y=".5" width="21" height="11" rx="3.2" fill="none" stroke="currentColor" opacity=".4" /><rect x="2" y="2" width="18" height="8" rx="2" fill="currentColor" /><path d="M23 4v4c.8-.3 1.4-1.1 1.4-2S23.8 4.3 23 4z" fill="currentColor" opacity=".45" /></svg>
      </span>
    </div>
  );
}

export default function PhoneFrame({
  screen, alt = "", size = "md", width, theme, shadow = "md", statusBar = false, island = false,
  caption, tag, tagTone, figma, proto, overlay, interactive = true, enter = true, sheet = false,
  className = "", style, children, controls, ...rest
}) {
  const root = useRef(null);
  const w = width ?? (typeof size === "number" ? size : PHONE_SIZES[size] ?? PHONE_SIZES.md);
  const on = controls ?? interactive;
  useEffect(() => {
    const el = root.current;
    if (!enter || !el) return undefined;
    const dev = el.querySelector(".pf__dev");
    return rise(el, [dev], { lead: 0, step: 0 });
  }, [enter]);
  return (
    <figure ref={root} className={"pf " + className} data-play={enter ? "" : undefined} data-theme={theme} data-shadow={shadow}
      data-sheet={sheet ? "" : undefined} style={{ "--pf-w": w + "px", ...style }} {...rest}>
      {tag && <span className="pf__tag" data-tone={tagTone || String(tag).toLowerCase()}>{tag}</span>}
      <div className="pf__dev ifr">
        <div className="ifr__screen">
          {screen ? <img className="ifr__img" src={screen} alt={alt} loading="lazy" draggable="false" /> : children}
          {statusBar && <StatusBar tone={statusBar === "light" ? "light" : "dark"} />}
          {island && <span className="pf__island" aria-hidden="true" />}
        </div>
        {on && <PhoneControls label={alt || caption || "Phone"} />}
        <img className="ifr__bezel" src={IPHONE_FRAME_SRC} alt="" draggable="false" aria-hidden="true" />
        {overlay}
      </div>
      {(figma || proto) && <PhoneLinks figma={figma} proto={proto} />}
      {caption && <figcaption className="pf__cap">{caption}</figcaption>}
    </figure>
  );
}

export { PhoneFrame };
