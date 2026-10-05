import { useEffect, useMemo, useRef, useState } from "react";
import ShaderCanvas from "../ShaderCanvas";

/* ART MODE — the third register, beside read and scan.
 *
 * Read is a document you start at the top of. Scan is a board you compare
 * across. Art is neither: one project at a time, full-bleed, with nothing on
 * screen to compare it to. The whole viewport is the piece, so the only
 * decisions left are "stay" or "go in".
 *
 * How it is built:
 *  - Vertical scroll-snap panels, one per project. Snap (not free scroll) is
 *    what makes it a sequence of held frames rather than a long page — you are
 *    never looking at two halves of two projects.
 *  - The shader lives in ONE fixed layer behind everything, not per panel. Two
 *    stacked <ShaderCanvas> that ping-pong: the incoming preset paints into the
 *    idle layer and crossfades over. Two WebGL contexts total, whatever the
 *    project count, and the background reads as one continuous surface the work
 *    passes through instead of four separate hero boxes.
 *  - The accent is a tint over the shader, so each project owns the room's
 *    colour without needing its own shader.
 *
 * Reduced motion: the shaders already freeze themselves (ShaderCanvas), and
 * scroll-snap is a browser scroll, not an animation. The crossfade and the
 * type reveal are suppressed in CSS.
 */

// Each project gets a wash whose character matches it, not a random assignment.
// Falls back down the list if the roster grows past the presets.
// Structured washes only. Living Sky is the site's showpiece but it is a
// near-uniform luminance field at most times of day, and once the accent tint
// takes the hue off it there is nothing left to look at — a flat rectangle.
const WASHES_BY_INDEX = ["aurora", "iridescent", "chrome", "caustics", "quilt", "mesh", "golden"];

export default function ArtMode({ projects, onNavigate }) {
  const items = useMemo(() => projects.filter((p) => !p.placeholder), [projects]);
  const [active, setActive] = useState(0);
  const panelsRef = useRef([]);

  // Which shader layer is currently on top. The other one is repainted with the
  // incoming preset and then faded in, so there is never a blank frame between
  // two washes.
  const [layer, setLayer] = useState(0);
  const [presets, setPresets] = useState([WASHES_BY_INDEX[0], WASHES_BY_INDEX[0]]);
  const activeRef = useRef(0);

  useEffect(() => {
    const els = panelsRef.current.filter(Boolean);
    if (!els.length) return;
    const io = new IntersectionObserver(
      (entries) => {
        // the panel occupying the most of the viewport wins; with snap that is
        // unambiguous except mid-flick, where "most visible" is still right.
        let best = null;
        for (const e of entries) if (!best || e.intersectionRatio > best.intersectionRatio) best = e;
        if (!best || best.intersectionRatio < 0.5) return;
        const i = Number(best.target.dataset.index);
        if (i === activeRef.current) return;
        activeRef.current = i;
        setActive(i);
      },
      { threshold: [0.5, 0.75, 1] }
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [items.length]);

  // Paint the incoming wash into the idle layer, then swap which is on top.
  useEffect(() => {
    const next = WASHES_BY_INDEX[active % WASHES_BY_INDEX.length];
    setLayer((cur) => {
      const idle = cur === 0 ? 1 : 0;
      setPresets((p) => {
        if (p[idle] === next) return p;
        const copy = [...p];
        copy[idle] = next;
        return copy;
      });
      return idle;
    });
  }, [active]);

  const accent = items[active]?.accent || "#2563EB";

  return (
    <div className="art" style={{ "--art-accent": accent }}>
      <div className="art__bg" aria-hidden>
        <div className={`art__wash${layer === 0 ? " is-on" : ""}`}>
          <ShaderCanvas preset={presets[0]} clock={presets[0] === "livingSky"} />
        </div>
        <div className={`art__wash${layer === 1 ? " is-on" : ""}`}>
          <ShaderCanvas preset={presets[1]} clock={presets[1] === "livingSky"} />
        </div>
        <div className="art__tint" />
      </div>

      {/* Position in the sequence. Art mode hides the list, so this is the only
          thing telling you how much work there is and where you are in it. */}
      <div className="art__index" aria-hidden>
        {items.map((p, i) => (
          <span key={p.href || i} className={i === active ? "is-active" : undefined} />
        ))}
      </div>

      <div className="art__scroller">
        {items.map((p, i) => (
          <section
            key={p.href || i}
            data-index={i}
            ref={(el) => (panelsRef.current[i] = el)}
            className={`art__panel${i === active ? " is-active" : ""}`}
          >
            <div className="art__plate">
              <div className="art__eyebrow">
                <span>{p.brand}</span>
                <span>{p.year}</span>
                {p.status ? <span>{p.status}</span> : null}
              </div>
              <h2 className="art__title">{p.title}</h2>
              <p className="art__blurb">{p.blurb}</p>
              {p.href ? (
                <button type="button" className="art__enter" onClick={() => onNavigate(p.href)}>
                  <span>Enter</span>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                    <path d="M5 12h14" />
                    <path d="m13 6 6 6-6 6" />
                  </svg>
                </button>
              ) : null}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
