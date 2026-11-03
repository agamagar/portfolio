// A real Dassh UI screen: the captured still always, and in dev the live prototype from the Dassh UI dev
// server over it once the figure nears the viewport (lazy, so nothing loads early and nothing shifts).
// The iframe keeps its native viewport (w x h) and is scaled to fill the device screen.
import { useEffect, useRef, useState } from "react";

const LIVE = import.meta.env.DEV ? (import.meta.env.VITE_DASSH_UI || "http://localhost:5181") : null;

export function DasshLiveScreen({ persona, still, alt, w, h }) {
  const ref = useRef(null);
  const [src, setSrc] = useState(null);
  const [ready, setReady] = useState(false);
  const [k, setK] = useState(0);
  useEffect(() => {
    const el = ref.current;
    if (!el) return undefined;
    const fit = () => setK(el.clientWidth / w);
    fit();
    const ro = new ResizeObserver(fit); ro.observe(el);
    let io;
    if (LIVE) {
      io = new IntersectionObserver(([e]) => {
        if (!e.isIntersecting) return;
        setSrc(`${LIVE}/stella-chat.html?persona=${persona}`);
        io.disconnect();
      }, { rootMargin: "400px" });
      io.observe(el);
    }
    return () => { ro.disconnect(); io?.disconnect(); };
  }, [persona, w]);
  return (
    <div ref={ref} className="dsh__screen">
      <img src={still} alt={alt} width={w} height={h} loading="lazy" draggable="false" />
      {src && (
        <iframe src={src} title={alt} onLoad={() => setReady(true)}
          style={{ width: w, height: h, transform: `scale(${k})`, opacity: ready ? 1 : 0 }} />
      )}
    </div>
  );
}
