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

export default function FigmaPhone({
  screen, // string src, or a React node for a live screen
  overlay, // optional node drawn over the screen, under the frame
  alt = "",
  width = 269,
  className = "",
  style,
  ...rest
}) {
  // No screen supplied: render the complete export, device and screen in one
  // piece, exactly as drawn. Supply `screen` and it splits back into layers with
  // the plate on top, which is the path that exists for real screenshots later.
  const layered = screen != null;
  const vars = {
    "--fp-w": `${width}px`,
    "--fp-ar": DEVICE_H / DEVICE_W,
    "--fp-inset-x": `${(INSET_X / DEVICE_W) * 100}%`,
    "--fp-inset-y": `${(INSET_Y / DEVICE_H) * 100}%`,
    // the corner is a fraction of the DEVICE width, so it scales with the phone
    "--fp-radius": `${(RADIUS / DEVICE_W) * 100}%`,
    ...style,
  };
  const isImg = typeof screen === "string";

  if (!layered) {
    return (
      <div className={`fp ${className}`.trim()} style={vars} {...rest}>
        <img className="fp__frame" src={PHONE_FULL_SRC} alt={alt} draggable="false" loading="lazy" />
      </div>
    );
  }

  return (
    <div className={`fp ${className}`.trim()} style={vars} {...rest}>
      <div className="fp__screen">
        {isImg ? (
          <img className="fp__shot" src={screen} alt={alt} draggable="false" loading="lazy" />
        ) : (
          screen
        )}
        {overlay ? <div className="fp__glass">{overlay}</div> : null}
      </div>
      {/* the plate is decoration; the screen carries the meaning */}
      <img className="fp__frame" src={PHONE_FRAME_SRC} alt="" aria-hidden draggable="false" />
    </div>
  );
}
