// A real Dassh UI screen: the captured still always, and in dev the live page from the Dassh UI dev server
// over it once the figure nears the viewport (lazy, so nothing loads early and nothing shifts).
import { useEffect, useRef, useState } from "react";

const LIVE = import.meta.env.DEV ? (import.meta.env.VITE_DASSH_UI || "http://localhost:5181") : null;

export function DasshLiveScreen({ persona, mobile, still, alt, width, height }) {
  const ref = useRef(null);
  const [src, setSrc] = useState(null);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    if (!LIVE || !ref.current) return undefined;
    const io = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return;
      setSrc(`${LIVE}/stella-chat.html?layout=page&persona=${persona}${mobile ? "&device=mobile" : ""}`);
      io.disconnect();
    }, { rootMargin: "400px" });
    io.observe(ref.current);
    return () => io.disconnect();
  }, [persona, mobile]);
  return (
    <div ref={ref} style={{ position: "absolute", inset: 0 }}>
      <img src={still} alt={alt} width={width} height={height} loading="lazy" draggable="false" />
      {src && <iframe src={src} title={alt} onLoad={() => setReady(true)} style={{ opacity: ready ? 1 : 0, transition: "opacity .4s" }} />}
    </div>
  );
}
