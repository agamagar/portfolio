import { useEffect, useRef, useState } from "react";
import { animate } from "motion";
import "./scheduled.css";
import { feedback, feedbackCoalesced } from "../../ui/feedback"; // muku5gig: the site sound engine (silent unless the sound toggle is on)

// muienfze (26 Sep 2026): Portfolio 2026 node 942:64899, "The key finding" beside
// "The central question", built as live text (not exports). Two equal columns,
// each an icon, a light label and the statement, sized from the 1512 frame to
// the page column (x 0.54): label 36 -> ~19px light, statement 48 -> ~26px,
// icon 64 -> ~35px, the frame's 180px top padding and 60px gaps scaled with it.
// The icons are the frame's own SVGs, painted as masks in the theme ink so they
// follow dark mode. The blocks rise in with the Context and Objective reveal.
const COLS = [
  // mujp8ifl (27 Sep): swapped, the central question now leads on the left
  { icon: "icon-question.svg", label: "The central question", lines: [["Zepto means now ", { e: "⚡" }, ". How do you promise later ", { e: "🗓️" }, " without breaking the trust ", { e: "🤝" }, " that Zepto is built on?"]] },
  { icon: "icon-finding.svg", label: "The key finding", // mujp86fb (27 Sep): one paragraph, was two lines
  lines: [["Users are fine with deliveries landing later ", { e: "🗓️" }, ". They want to finish the order ", { e: "🛒" }, " now ", { e: "⚡" }, "."]] },
];

// mujp9wpx + mujpa4jr (27 Sep): both icons DRAW ON, the lab's line-draw
// technique (the system catalog's edges): every stroke gets pathLength="1" and
// its dash offset runs 1 -> 0, one stroke after another, when the frame comes
// into view. Inlined (they were CSS masks, which cannot animate per stroke);
// the stroke is currentColor so the theme ink still applies.
function DrawIcon({ src }) {
  const ref = useRef(null);
  const [svg, setSvg] = useState("");
  useEffect(() => {
    let live = true;
    fetch(src).then((r) => r.text()).then((t) => {
      if (!live) return;
      let i = 0;
      setSvg(t.replace(/stroke="#33095E"/gi, 'stroke="currentColor"')
        .replace(/<path /g, () => `<path pathLength="1" style="--i:${i++}" `)
        .replace(/style="display: block;"/, 'style="display:block;width:100%;height:100%"'));
    });
    return () => { live = false; };
  }, [src]);
  // mujpn8um: SCROLL-LINKED, not play-once. As the icon travels from the
  // bottom of the viewport (95%) to just above centre (45%) each stroke draws
  // on in turn, on the decelerate curve; scrolling back undraws it.
  useEffect(() => {
    const el = ref.current;
    if (!el || !svg) return;
    const paths = [...el.querySelectorAll("path")];
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) { paths.forEach((pa) => (pa.style.strokeDashoffset = "0")); return; }
    const ease = (t) => 1 - Math.pow(1 - t, 3);
    const clamp = (v) => Math.max(0, Math.min(1, v));
    const n = paths.length, span = 0.55, step = n > 1 ? (1 - span) / (n - 1) : 0;
    let raf = 0;
    const update = () => {
      raf = 0;
      const r = el.getBoundingClientRect();
      const vh = window.visualViewport?.height || window.innerHeight;
      const p = clamp((vh * 0.95 - (r.top + r.height / 2)) / (vh * 0.5));
      paths.forEach((pa, i) => { pa.style.strokeDashoffset = (1 - ease(clamp((p - i * step) / span))).toFixed(4); });
    };
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(update); };
    update();
    window.addEventListener("scroll", onScroll, { passive: true, capture: true });
    window.addEventListener("resize", onScroll);
    return () => { window.removeEventListener("scroll", onScroll, { capture: true }); window.removeEventListener("resize", onScroll); if (raf) cancelAnimationFrame(raf); };
  }, [svg]);
  return <span ref={ref} className="sin__icon sin__icon--draw" aria-hidden dangerouslySetInnerHTML={{ __html: svg }} />;
}

export default function SchedInsight() {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const items = [...el.querySelectorAll("[data-rise]")];
    items.forEach((n) => { n.style.opacity = "0"; n.style.transform = "translateY(28px)"; });
    const io = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return;
      io.disconnect();
      feedbackCoalesced("reveal", 600); // the question and the finding arrive
      items.forEach((n, k) => animate(n, { opacity: [0, 1], y: [28, 0] },
        { duration: 0.7, delay: 0.1 + k * 0.1, ease: [0.22, 1, 0.36, 1] }));
    }, { threshold: 0.25 });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return (
    <div className="sin" ref={ref}>
      {COLS.map((c) => (
        <div className="sin__col" key={c.label}>
          <DrawIcon src={`/figures/scheduled/insight/${c.icon}`} />
          <p className="sin__label" data-rise>{c.label}</p>
          <div className="sin__lines">
            {/* mujtz56p (27 Sep): static emoji as reading aids beside the key words
                (now, later, trust, the order); aria-hidden so a screen reader
                reads the sentence, not the pictographs */}
            {c.lines.map((l, i) => (
              <p className="sin__line" key={i} data-rise>
                {(Array.isArray(l) ? l : [l]).map((t, j) => (typeof t === "string" ? t : <span key={j} className="sin__aid" aria-hidden="true">{t.e}</span>))}
              </p>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
