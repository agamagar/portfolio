import { useEffect, useRef } from "react";
import { annotateElement } from "./core/annotateElement.js";

/**
 * <Annotated notes={[{ selector: ".price", text: "...", kind: "circle" }]}>...anything...</Annotated>
 * Wraps any content and writes notes around it on a transparent whiteboard overlay. `margin` = [vertical,
 * horizontal] px of room for the labels; give the wrapper matching space (padding or gap) so they don't
 * collide with neighbours. See core/annotateElement.js for note options.
 */
export default function Annotated({ notes, margin = [110, 280], animate = "inview", noteSize, seed, className, style, children }) {
  const ref = useRef(null);
  const key = JSON.stringify(notes);
  useEffect(() => {
    const a = annotateElement(ref.current, JSON.parse(key), { margin, animate, noteSize, seed });
    return () => a.destroy();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, animate, noteSize, seed, margin[0], margin[1]]);
  return (
    <div ref={ref} className={className} style={{ position: "relative", ...style }}>
      {children}
    </div>
  );
}
