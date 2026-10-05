// Fit a fixed reel design frame into its container. Lives in its own module so
// both Reel.jsx and the individual reels can use it without an import cycle
// (Reel.jsx owns the registry and imports each reel, so a reel importing back
// from Reel.jsx would close the loop).
import { useLayoutEffect, useRef } from "react";

export function useFitContain(designW, designH, { contain = false, max = 1 } = {}) {
  const fitRef = useRef(null);
  const frameRef = useRef(null);
  useLayoutEffect(() => {
    const fit = fitRef.current;
    const frame = frameRef.current;
    if (!fit || !frame) return;
    const apply = () => {
      const w = fit.clientWidth;
      if (!w) return;
      let s = w / designW;
      if (contain) {
        const h = fit.clientHeight;
        if (h) s = Math.min(s, h / designH);
      }
      s = Math.min(max, s);
      frame.style.setProperty("--reel-scale", s.toFixed(4));
      if (!contain) fit.style.height = `${designH * s}px`;
    };
    const ro = new ResizeObserver(apply);
    ro.observe(fit);
    apply();
    return () => ro.disconnect();
  }, [designW, designH, contain, max]);
  return { fitRef, frameRef };
}
