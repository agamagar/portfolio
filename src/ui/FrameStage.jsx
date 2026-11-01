// A Figma frame rebuilt live (1 Nov 2026, Dassh opening). The stage keeps the
// frame's aspect and maps one Figma px to `--fp` (100cqw / frame width), so a
// child placed with <Box x y w h> in Figma px lands where it sits in the file at
// any column width. Text stays live HTML; photos are Figma exports. A frame may
// add `stack` so phones drop the absolute layout and read top to bottom.
import "./frameStage.css";

export function FrameStage({ w = 1512, h = 982, stack, className = "", style, children, ...rest }) {
  return (
    <div
      className={"fs" + (stack ? " fs--stack" : "") + (className ? " " + className : "")}
      style={{ "--fw": w, "--fh": h, ...style }}
      {...rest}
    >
      <div className="fs__plate">{children}</div>
    </div>
  );
}

// a box at Figma px; `glass` paints the site's frosted panel (Figma GLASS)
export function Box({ x = 0, y = 0, w, h, r, glass, className = "", style, children, as: Tag = "div", ...rest }) {
  return (
    <Tag
      className={"fs__box" + (glass ? " fs__glass" : "") + (className ? " " + className : "")}
      style={{ "--x": x, "--y": y, ...(w != null ? { "--w": w } : null), ...(h != null ? { "--h": h } : null), ...(r != null ? { "--r": r } : null), ...style }}
      {...rest}
    >
      {children}
    </Tag>
  );
}

// fonts the Figma frames name that the site does not load up front; requested once
const loaded = new Set();
export function useFrameFonts(families) {
  if (typeof document === "undefined") return;
  const key = families.join("|");
  if (loaded.has(key)) return;
  loaded.add(key);
  const l = document.createElement("link");
  l.rel = "stylesheet";
  l.href = "https://fonts.googleapis.com/css2?" + families.map((f) => "family=" + f).join("&") + "&display=swap";
  document.head.appendChild(l);
}
