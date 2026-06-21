import ShaderCanvas from "../../ShaderCanvas";
import "./design.css";

// Design Mode — the pixel-perfect figure type.
//
// Instead of rebuilding a screen as coded SVG/HTML (the `fig:` "SVG mode"), a
// `design` figure drops in the EXACT Figma export and animates ONLY the directed
// regions. The static UI is pixel-perfect; only what should move, moves.
//
// The plate is an opaque PNG of the screen with its animated source (here the sky
// video) hidden, so that region exports as the flat device colour. A directed
// region then sits ON TOP of the plate and screen-blends a live shader into that
// dark area — black plate pixels take the shader, bright UI (the status bar, the
// greeting) is preserved by screen. A mask fades the region out before it reaches
// text, so legibility is never touched.
//
// Data shape (a section sets `design: {...}`):
//   {
//     w, h,          // the Figma frame's natural size → aspect ratio
//     bg,            // device body colour (fallback behind the opaque plate)
//     mocks: [{
//       base,        // "/figures/.../screen-ui.png" — opaque pixel-perfect plate
//       regions: [{  // directed animated regions composited OVER the plate
//         box: [x,y,w,h],   // % of the mock
//         kind: "shader", preset, dark,
//         blend: "screen",  // mix-blend-mode against the plate
//         maskFade: [solidPct, endPct], // region fades to transparent solidPct→endPct
//       }],
//     }],
//   }
// Region kinds are extensible (shader today; crossfade / lottie next).

function Region({ r }) {
  const box = r.box || [0, 0, 100, 100];
  const style = {
    left: `${box[0]}%`,
    top: `${box[1]}%`,
    width: `${box[2]}%`,
    height: `${box[3]}%`,
  };
  // An authored overlay asset (SVG/PNG) composited over the plate. Use this when
  // a CSS/shader effect (e.g. an ellipse scrim) will not place reliably: bake the
  // glow into a vector instead and blend it in. `src` is the asset, `blend` the
  // mix-blend-mode (default "screen", so it adds light over the dark plate).
  if (r.kind === "image") {
    style.mixBlendMode = r.blend || "screen";
    return (
      <div className="fig-design__region" style={style}>
        <img className="fig-design__shader" src={r.src} alt="" draggable={false} />
      </div>
    );
  }
  if (r.kind === "shader") {
    if (r.blend) style.mixBlendMode = r.blend;
    if (r.maskFade) {
      const [m0, m1] = r.maskFade;
      // `ellipse` mimics the Figma scrim (a wide, heavily-blurred dark ellipse):
      // the shader falls off along a soft elliptical curve, so the sky and the UI
      // merge with no flat horizon line. `linear` (default) is the legacy band.
      // `maskOrigin` (default "50% 0%", top-centre) places the ellipse centre, so
      // the glow can sit behind a greeting that is not at the top of the region.
      const origin = r.maskOrigin || "50% 0%";
      const grad =
        r.maskShape === "ellipse"
          ? `radial-gradient(155% 125% at ${origin}, #000 0%, #000 ${m0}%, transparent ${m1}%)`
          : `linear-gradient(180deg, #000 0%, #000 ${m0}%, transparent ${m1}%)`;
      style.WebkitMaskImage = grad;
      style.maskImage = grad;
    }
    return (
      <div className="fig-design__region" style={style}>
        <ShaderCanvas preset={r.preset} dark={r.dark} className="fig-design__shader" />
      </div>
    );
  }
  return null;
}

function DesignMock({ mock, w, h, bg }) {
  return (
    <div
      className="fig-design__phone"
      style={{ aspectRatio: `${w} / ${h}`, backgroundColor: bg }}
    >
      {/* pixel-perfect opaque plate underneath (the figure's content — load eagerly
          so the mock never shows an empty frame) */}
      <img className="fig-design__base" src={mock.base} alt={mock.alt || ""} />
      {/* directed live regions screen-blended on top */}
      {(mock.regions || []).map((r, i) => (
        <Region key={i} r={r} />
      ))}
    </div>
  );
}

export default function DesignFigure({ design, variant }) {
  const slide = variant === "slide";
  const { mocks = [], w = 360, h = 791, bg = "#0e0e12", label } = design;
  return (
    <div
      className={`fig-design${slide ? " fig-design--slide" : ""}`}
      role="img"
      aria-label={label || "Design mockups"}
    >
      <div className="fig-design__row">
        {mocks.map((m, i) => (
          <DesignMock key={i} mock={m} w={w} h={h} bg={bg} />
        ))}
      </div>
    </div>
  );
}
