import { useEffect, useRef, useState } from "react";
import { animate } from "motion";
import "./scheduled.css";
import { feedback, feedbackCoalesced } from "../../ui/feedback"; // muku5gig: the site sound engine (silent unless the sound toggle is on)

// muilckke (26 Sep 2026): Portfolio 2026 node 1167:43070, four stacked
// 1512 x 982 frames (so each is the case study frame default): a light label
// over the lead statement, then one persona per frame, centred, muted purple
// with the load-bearing phrase in full-ink semibold. Figma sets the personas in
// Zepto Norms, which the site does not load; the site's Zepto stand-in, Google
// Sans Flex, takes its place. Each frame rises in on its own first view.
const PERSONAS = [
  ["Commuters scheduling on the ride home so groceries arrive when they do, ", "planning ahead", ""],
  ["Users in geographies with patchy store coverage near home, for whom ", "instant wasn't serviceable", ""],
  ["Shoppers buying new-category items that are unavailable overnight but ", "not needed urgently", " by the user"],
];

// [left %, top %, width %] of the persona frame, measured off the Figma screenshot
// mujors3k (27 Sep): four DIFFERENT photos, borrowed from the Six moments
// collage above for now (to be replaced later), matched to each persona:
// commuters -> on the way home; patchy coverage -> dinner at home;
// new-category shoppers -> the gift, and the evening rush.
const SPHERES = [
  [[11.5, 2.5, 18.1, "commute"]],
  [[38.8, -21.3, 31, "dinner"]],
  [[9.3, -27, 20.6, "occasion"], [63.8, -10.7, 26.6, "peak"]],
];

// mujp7hem (27 Sep): GLASS ORB distortion, no scale change. Each orb's photo
// runs through its own SVG displacement filter: a lens (a bulge map, made once
// on a canvas) that magnifies what is under it. The lens sits in the middle at
// rest and FOLLOWS THE POINTER while you hover or drag, eased toward it each
// frame so it glides rather than jumps. Positions are fractions of the orb
// (primitiveUnits objectBoundingBox), so moving it is one attribute write.
let LENS_MAP = null;
function lensMap() {
  if (LENS_MAP || typeof document === "undefined") return LENS_MAP;
  const n = 128, c = document.createElement("canvas");
  c.width = c.height = n;
  const ctx = c.getContext("2d"), img = ctx.createImageData(n, n);
  for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) {
    const dx = (x + 0.5) / n * 2 - 1, dy = (y + 0.5) / n * 2 - 1, r = Math.hypot(dx, dy);
    // sample from nearer the centre (magnify), strongest mid-radius, zero at the rim
    const f = r < 1 ? Math.sin(Math.PI * r) * 0.5 : 0;
    const i = (y * n + x) * 4;
    img.data[i] = 128 - dx * f * 127; img.data[i + 1] = 128 - dy * f * 127;
    img.data[i + 2] = 128; img.data[i + 3] = 255;
  }
  ctx.putImageData(img, 0, 0);
  return (LENS_MAP = c.toDataURL());
}
const LENS = 0.62; // lens diameter, as a fraction of the orb

function Orb({ id, sp, delay }) {
  const feRef = useRef(null);
  const [map, setMap] = useState(null);
  useEffect(() => { setMap(lensMap()); }, []);
  const target = useRef({ x: 0.5, y: 0.5 }), cur = useRef({ x: 0.5, y: 0.5 }), raf = useRef(0);
  const place = () => {
    raf.current = 0;
    const c = cur.current, t = target.current;
    c.x += (t.x - c.x) * 0.22; c.y += (t.y - c.y) * 0.22; // eased follow
    const fe = feRef.current;
    if (fe) { fe.setAttribute("x", (c.x - LENS / 2).toFixed(4)); fe.setAttribute("y", (c.y - LENS / 2).toFixed(4)); }
    if (Math.abs(t.x - c.x) > 0.001 || Math.abs(t.y - c.y) > 0.001) raf.current = requestAnimationFrame(place);
  };
  const aim = (x, y) => { target.current = { x, y }; if (!raf.current) raf.current = requestAnimationFrame(place); };
  const onMove = (e) => {
    const r = e.currentTarget.getBoundingClientRect();
    aim(Math.min(1, Math.max(0, (e.clientX - r.left) / r.width)), Math.min(1, Math.max(0, (e.clientY - r.top) / r.height)));
  };
  useEffect(() => () => cancelAnimationFrame(raf.current), []);
  return (
    <span className="suc__drag" aria-hidden onPointerDown={dragBubble} onPointerMove={onMove} onPointerLeave={() => aim(0.5, 0.5)}
      style={{ left: sp[0] + "%", top: sp[1] + "%", width: sp[2] + "%" }}>
      <svg width="0" height="0" style={{ position: "absolute" }} aria-hidden>
        <filter id={id} x="0" y="0" width="1" height="1" primitiveUnits="objectBoundingBox" colorInterpolationFilters="sRGB">
          {map && <feImage ref={feRef} href={map} x={0.5 - LENS / 2} y={0.5 - LENS / 2} width={LENS} height={LENS} preserveAspectRatio="none" result="lens" />}
          <feFlood floodColor="rgb(128,128,0)" result="flat" />
          <feMerge result="map"><feMergeNode in="flat" /><feMergeNode in="lens" /></feMerge>
          <feDisplacementMap in="SourceGraphic" in2="map" scale="0.16" xChannelSelector="R" yChannelSelector="G" />
        </filter>
      </svg>
      <span className="suc__bubble" style={{ animationDelay: `${delay}s` }}>
        <img src={`/figures/scheduled/moments/${sp[3]}-v2.webp`} alt="" draggable="false" style={{ filter: `url(#${id})` }} />
      </span>
    </span>
  );
}

// pick up, drag, and it stays where it is dropped (as the moment tags do)
function dragBubble(e) {
  if (e.button !== 0) return;
  const n = e.currentTarget;
  e.preventDefault();
  try { n.setPointerCapture(e.pointerId); } catch { /* synthetic pointer */ }
  const x0 = e.clientX - (n._dx || 0), y0 = e.clientY - (n._dy || 0);
  n.classList.add("is-held");
  const move = (m) => {
    n._dx = m.clientX - x0; n._dy = m.clientY - y0;
    n.style.translate = `${n._dx}px ${n._dy}px`;
  };
  const up = () => {
    n.removeEventListener("pointermove", move);
    n.removeEventListener("pointerup", up);
    n.removeEventListener("pointercancel", up);
    n.classList.remove("is-held");
    feedback("select"); // the bubble is set down
  };
  n.addEventListener("pointermove", move);
  n.addEventListener("pointerup", up);
  n.addEventListener("pointercancel", up);
}

function useRise(ref) {
  useEffect(() => {
    const frames = [...(ref.current?.querySelectorAll(".suc__frame") || [])];
    if (!frames.length || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const ios = frames.map((f) => {
      const items = [...f.querySelectorAll("[data-rise]")];
      items.forEach((n) => { n.style.opacity = "0"; n.style.transform = "translateY(28px)"; });
      const io = new IntersectionObserver(([e]) => {
        if (!e.isIntersecting) return;
        io.disconnect();
        feedbackCoalesced("reveal", 600); // one reveal per frame arriving, never a chain
        items.forEach((n, k) => animate(n, { opacity: [0, 1], y: [28, 0] },
          { duration: 0.7, delay: 0.1 + k * 0.12, ease: [0.22, 1, 0.36, 1] }));
      }, { threshold: 0.35 });
      io.observe(f);
      return io;
    });
    return () => ios.forEach((io) => io.disconnect());
  }, [ref]);
}

export default function SchedUseCases() {
  const ref = useRef(null);
  useRise(ref);
  return (
    <div className="suc" ref={ref}>
      <div className="suc__frame suc__frame--lead">
        <p className="suc__label" data-rise>The use-cases start to emerge</p>
        <p className="suc__lead" data-rise>Talking to users, a few high-intent personas emerged. Each one reframed the feature from a nice-to-have into the reason they ordered at all.</p>
      </div>
      {PERSONAS.map(([a, b, c], i) => (
        <div className="suc__frame suc__frame--persona" key={b} data-i={i}>
          {/* muilfls3 "add the spheres" / "get the spheres from the figma": circular
              crops of the bed-at-night photo, placed per persona as in Agam's Figma
              screenshot (the synced file did not carry them yet). Boxes are % of the
              1512 x 982 frame; several reach up into the frame above. */}
          {SPHERES[i].map((sp, k) => (
            // "make these bubble": each sphere is a soap bubble, the photo seen
            // through it; the rim sheen and glints are the span's pseudo-elements
            // 27 Sep: draggable like the moment tags (stays where dropped) with a
            // hover. The WRAPPER carries position, drag and hover; the bubble
            // inside keeps its CSS float/breathe, which would otherwise override
            // an inline drag offset on the same element.
            <Orb key={k} id={`orb-${i}-${k}`} sp={sp} delay={-k * 5 - i * 3} />
          ))}
          <p className="suc__persona" data-rise>{a}<strong>{b}</strong>{c}</p>
        </div>
      ))}
    </div>
  );
}
