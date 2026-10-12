import { useEffect, useRef } from "react";
import { Stage } from "../three/stage";

/** Owns one WebGL Stage for the lifetime of the component. */
export function StageView({ onReady, label, autoRotate }: { onReady: (stage: Stage | null) => void; label: string; autoRotate?: boolean }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const cb = useRef(onReady);
  cb.current = onReady;

  useEffect(() => {
    if (!ref.current) return;
    let stage: Stage | null = null;
    try {
      stage = new Stage(ref.current, { autoRotate });
    } catch (err) {
      console.error(err);
    }
    cb.current(stage);
    return () => {
      cb.current(null);
      stage?.dispose();
    };
  }, [autoRotate]);

  return <canvas ref={ref} className="stage-canvas" role="img" aria-label={label} tabIndex={0} />;
}
