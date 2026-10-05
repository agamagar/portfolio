// The device from the Figma file, not a coded approximation of one.
//
// Figma: Portfolio 2026, node 6:1710 ("Apple Pay - Dark - iPhone"). Its Bezel
// instance renders an "iPhone 17 Pro - Silver - Portrait" plate at 268.7 x 549.3
// with a fully transparent screen cutout, exported at 3x to
// public/mockups/figma/iphone-17-pro-silver.png. Verified transparent: the alpha
// at the screen centre is 0, which is the whole reason this can be layered.
//
// Three layers, bottom to top:
//
//   1. .fp__screen   the screenshot. THIS is the swappable one. It is a plain
//                    <img> in its own clipped box, so replacing a screen is a
//                    one-line change to the `screen` prop and nothing about the
//                    device moves. Absent right now: see `full` below.
//   2. .fp__glass    an optional overlay per screen (a scrim, a sheet, a state)
//                    sitting above the screenshot and below the frame, which is
//                    how the source composes its own screens: image, then a 70%
//                    black rectangle, then the sheet on top.
//   3. .fp__frame    the exported device plate, on top, its transparent cutout
//                    letting 1 and 2 through.
//
// Geometry, all taken off the node rather than eyeballed:
//   device   268.7 x 549.3   (the exported plate)
//   screen   240   x 522     inset 14.35 horizontal, 13.75 vertical
//   radius   28.66           (the "Clip Content" frame's corner)
// Expressed as percentages of the device box so one `width` scales everything.

const DEVICE_W = 268.7;
const DEVICE_H = 549.3;
const SCREEN_W = 240;
const SCREEN_H = 522;
const INSET_X = (DEVICE_W - SCREEN_W) / 2; // 14.35
const INSET_Y = (DEVICE_H - SCREEN_H) / 2; // 13.65
const RADIUS = 28.656719207763672;

// The plate on its own, screen cutout transparent. Used for the layered path.
export const PHONE_FRAME_SRC = "/mockups/figma/iphone-17-pro-silver.png";
// The whole device WITH its screen baked in, exported from node 6:1710. All five
// instances in the drawn row are the same composition (checked: 0.01% of pixels
// differ, which is antialiasing), so one asset serves the whole row. The moment
// the instances carry different screens, re-export each and give the cells their
// own `screen` instead.
export const PHONE_FULL_SRC = "/mockups/figma/iphone-17-pro-full.png";
export const PHONE_ASPECT = DEVICE_H / DEVICE_W;

// A SECOND PLATE (pins mtrcw5sf + mtrcwiqd, 07 Sep 2026, "use this phone
// frame"): Figma node 708:107896, the "Bezel" frame from the Examples phones,
// 1317.6 x 2865.9 with the 'iPhone 17 Pro - Silver - Portrait' image bleeding
// 78.7 / 75.4 past it. In that construction the FRAME IS THE SCREEN: the
// screen frame beside it (643:97824, "Homepage") is the same 158.5 x 344.7
// box with a 24 corner, so at this plate the inset is 0 and the radius is
// 24 / 158.5 of the width. Exported at 1x (1318 x 2866, centre alpha 0).
// The plate image is exported from the image rectangle (708:107897, 1475 x
// 3015.5) rather than the frame, because the frame crops the bezel's outer
// edge; so the plate is drawn LARGER than the box, at the rectangle's offset:
// left -78.7, top -75.4 of the 1317.6 x 2865.9 box. hello3.css reads these.
const PLATES = {
  pro17: {
    src: "/mockups/figma/iphone-17-pro-silver-bezel.png",
    ar: 2865.9 / 1317.6,
    insetX: 0,
    insetY: 0,
    // A CIRCULAR corner, not an elliptical one (pin mtslvirf, "weird edges
    // visible at the bottom"): a single percentage radius resolves against
    // width horizontally and HEIGHT vertically, and on a 1 : 2.18 box that
    // made the vertical radius 2.2x the horizontal, so the white screen was
    // cut with a tall ellipse while the plate's cutout is a 24-unit circle
    // and the mismatch showed as odd edges in the corners. The two axes are
    // given separately: 24 / 158.5 of the width, 24 / 344.7 of the height.
    radius: `${(24 / 158.5) * 100}% / ${(24 / 344.7) * 100}%`,
    island: true,
    frame: { x: (-78.7 / 1317.6) * 100, y: (-75.4 / 2865.9) * 100, w: (1475 / 1317.6) * 100, h: (3015.5 / 2865.9) * 100 },
  },
};

export default function FigmaPhone({
  screen, // string src, or a React node for a live screen
  overlay, // optional node drawn over the screen, under the frame
  alt = "",
  width = 269,
  className = "",
  style,
  plate, // undefined = the original 6:1710 plate; "pro17" = the Bezel frame plate
  ...rest
}) {
  const P = plate ? PLATES[plate] : null;
  // No screen supplied: render the complete export, device and screen in one
  // piece, exactly as drawn. Supply `screen` and it splits back into layers with
  // the plate on top, which is the path that exists for real screenshots later.
  const layered = screen != null;
  const vars = {
    "--fp-w": `${width}px`,
    "--fp-ar": P ? P.ar : DEVICE_H / DEVICE_W,
    "--fp-inset-x": `${P ? P.insetX : (INSET_X / DEVICE_W) * 100}%`,
    "--fp-inset-y": `${P ? P.insetY : (INSET_Y / DEVICE_H) * 100}%`,
    // the corner is a fraction of the DEVICE width, so it scales with the phone
    "--fp-radius": P ? P.radius : `${(RADIUS / DEVICE_W) * 100}%`,
    ...(P?.frame ? { "--fp-frame-x": `${P.frame.x}%`, "--fp-frame-y": `${P.frame.y}%`, "--fp-frame-w": `${P.frame.w}%`, "--fp-frame-h": `${P.frame.h}%` } : null),
    ...style,
  };
  const cls = `fp${plate ? ` fp--${plate}` : ""} ${className}`.trim();
  const isImg = typeof screen === "string";

  if (!layered) {
    return (
      <div className={cls} style={vars} {...rest}>
        <img className="fp__frame" src={PHONE_FULL_SRC} alt={alt} draggable="false" loading="lazy" />
      </div>
    );
  }

  return (
    <div className={cls} style={vars} {...rest}>
      <div className="fp__screen">
        {isImg ? (
          <img className="fp__shot" src={screen} alt={alt} draggable="false" loading="lazy" />
        ) : (
          screen
        )}
        {overlay ? <div className="fp__glass">{overlay}</div> : null}
        {/* THE DYNAMIC ISLAND, for the pro17 plate only (Agam, 07 Sep 2026,
            "fix all the phone frames"): that plate is the bare bezel with a
            fully transparent screen, so unlike the 6:1710 plate it draws no
            island, and every screen showed its time and signal with an empty
            gap between them. The pill is the iPhone 16/17 Pro island as a
            fraction of the 402 x 874 pt screen: 125 wide, 37 tall, 11 from
            the top. Drawn above the content and under the frame. */}
        {P?.island ? <span className="fp__island" aria-hidden /> : null}
      </div>
      {/* the plate is decoration; the screen carries the meaning */}
      <img className="fp__frame" src={P ? P.src : PHONE_FRAME_SRC} alt="" aria-hidden draggable="false" />
    </div>
  );
}
