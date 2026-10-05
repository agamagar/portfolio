import "./components.css";

// Shared demo pointer: a soft, blurred dark halo blob centred on the target
// (x, y) in the parent's unscaled coordinate space. It sits behind/around the
// target like a focus glow: small as it arrives, growing large on `hover`, with
// a slight settle on `press` (the tap). `size` is the base diameter in px.
// Place inside a position:relative ancestor; if that ancestor is itself
// transformed (e.g. a camera zoom) the blob scales with it and stays glued to
// its target. (clickN is accepted for API compatibility; the blob has no ripple.)
export default function Cursor({ x, y, visible, hover, press, clickN, size = 36 }) {
  return (
    <div
      className="ds-cursor"
      data-visible={visible ? "true" : "false"}
      data-hover={hover ? "true" : "false"}
      data-press={press ? "true" : "false"}
      style={{ transform: `translate(${x}px, ${y}px)`, "--ds-cursor-size": `${size}px` }}
      aria-hidden
    >
      <span className="ds-cursor__dot" />
    </div>
  );
}
