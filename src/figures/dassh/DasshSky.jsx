// DasshSky: the backdrop every Dassh gradient is drawn with (dasshGradients.css holds the tokens, dasshSky.css the paint).
// Figma: the frames on Portfolio-2026 board 1878:80325.
//
//   <DasshSky sky="violet" />      Hero / Light / Violet, or its dark twin when the page is dark
//   <DasshSky sky="mint" />        Hero / Light / Mint
//   <DasshSky sky="tangerine" paper /> Card / Light / Tangerine, with its paper grain
//   <DasshSky hue="coral" />       Speaker tints: one person's hue into the ground
//
//   sky    "violet" | "mint" | "tangerine"
//   hue    "sky" | "coral" | "mint" | "butter" | "lilac" | "apricot" (a speaker tile, in place of `sky`)
//   paper  the card grain; on a dark sky the same dose is the dither
//   mode   "light" | "dark" holds the surface in one mode, whatever the page is doing
//   as     the element or component to draw (it must pass className and data-* on)
import "./dasshGradients.css";
import "./dasshSky.css";

// the same classes for a surface that can't be wrapped, such as a section frame
export function skyClass({ sky, hue, paper } = {}) {
  const c = ["dsky"];
  if (hue) c.push("dsky--speaker", `dsky--${hue === "mint" ? "speaker-mint" : hue}`);
  else c.push(`dsky--${sky || "violet"}`);
  if (paper) c.push("dsky--paper");
  return c.join(" ");
}

export function DasshSky({ sky, hue, paper, mode, as: Tag = "div", className = "", children, ...rest }) {
  return (
    <Tag className={skyClass({ sky, hue, paper }) + (className ? " " + className : "")} data-gradient-mode={mode} {...rest}>
      {children}
    </Tag>
  );
}
