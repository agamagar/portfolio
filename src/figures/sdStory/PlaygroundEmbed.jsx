import { useCallback, useEffect, useRef, useState } from "react";
import { embedPoster, embedUrl, getEmbed, loadSynced, PLAYGROUND_BASE } from "./playgroundBase";
import "./playgroundEmbed.css";

// A live chromeless view of the design playground (the same React components the
// prototypes are built from), kept in sync by `npm run sync:sd-playground`.
//
//   <PlaygroundEmbed id="flow-returns-cs-chat-exchange" caseId="EX-003" />
//   <PlaygroundEmbed id="states" fit="fill" />
//
// fit="auto"   height follows the embed's own {source:'sd-playground',type:'size'} message (page view)
// fit="scale"  the embed keeps its catalog size and is scaled down to fit its box (deck slides)
// fit="fill"   iframe fills the box and scrolls inside it
//
// Keyboard safety: until the reader clicks in, a transparent button covers the frame, so
// arrow keys / Esc keep driving the deck. Esc (same-origin bundle), the Done button or a
// click anywhere outside gives control back.

const siteIsDark = () => document.documentElement.classList.contains("dark");
const prefersReduced = () => window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

function useSiteTheme(explicit) {
  const [t, setT] = useState(() => explicit || (siteIsDark() ? "dark" : "light"));
  useEffect(() => {
    if (explicit) return setT(explicit);
    const mo = new MutationObserver(() => setT(siteIsDark() ? "dark" : "light"));
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    setT(siteIsDark() ? "dark" : "light");
    return () => mo.disconnect();
  }, [explicit]);
  return t;
}

export default function PlaygroundEmbed({
  id,
  caseId,
  state,
  theme,
  fit = "auto",
  frame = "card", // "card" | "none"
  title,
  caption,
  maxHeight,
  className = "",
}) {
  const entry = getEmbed(id);
  const wrapRef = useRef(null);
  const boxRef = useRef(null);
  const frameRef = useRef(null);
  const activateRef = useRef(null);
  const [near, setNear] = useState(false); // within ~1 viewport: mount the iframe
  const [loaded, setLoaded] = useState(false);
  const [active, setActive] = useState(false);
  const [bundle, setBundle] = useState(undefined); // undefined = checking, null = missing, object = SYNCED.json
  const [autoH, setAutoH] = useState(null);
  const [box, setBox] = useState({ w: 0, h: 0 });
  const siteTheme = useSiteTheme(theme);

  useEffect(() => {
    let live = true;
    loadSynced().then((j) => live && setBundle(j));
    return () => { live = false; };
  }, []);

  // Mount when near the viewport, unmount again when far (frees the iframe's memory).
  useEffect(() => {
    const el = wrapRef.current;
    if (!el || !("IntersectionObserver" in window)) return setNear(true);
    const io = new IntersectionObserver(([e]) => setNear(e.isIntersecting), { rootMargin: "100% 0px 100% 0px" });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  useEffect(() => { if (!near) { setLoaded(false); setActive(false); } }, [near]);

  // Size messages from the embed.
  useEffect(() => {
    const onMsg = (e) => {
      const d = e.data;
      if (!d || d.source !== "sd-playground" || d.type !== "size") return;
      if (e.source !== frameRef.current?.contentWindow) return;
      if (typeof d.height === "number" && d.height > 0) setAutoH(Math.ceil(d.height));
    };
    window.addEventListener("message", onMsg);
    return () => window.removeEventListener("message", onMsg);
  }, []);

  // Measure the box for fit="scale".
  useEffect(() => {
    if (fit !== "scale" || !boxRef.current) return;
    const ro = new ResizeObserver(([e]) => setBox({ w: e.contentRect.width, h: e.contentRect.height }));
    ro.observe(boxRef.current);
    return () => ro.disconnect();
  }, [fit]);

  const deactivate = useCallback((refocus) => {
    setActive(false);
    if (refocus) requestAnimationFrame(() => activateRef.current?.focus());
  }, []);

  // A click anywhere outside gives control back.
  useEffect(() => {
    if (!active) return;
    const onDown = (e) => { if (!wrapRef.current?.contains(e.target)) deactivate(false); };
    document.addEventListener("pointerdown", onDown, true);
    return () => document.removeEventListener("pointerdown", onDown, true);
  }, [active, deactivate]);

  // An embed must never steal the keyboard before the reader clicks in (the deck's arrow keys
  // and Esc live on the parent window). If focus lands in the frame on its own, hand it back.
  const returnFocus = useCallback(() => {
    const f = frameRef.current;
    if (f && document.activeElement === f) { f.blur(); window.focus(); }
  }, []);
  useEffect(() => {
    if (active) return;
    const onBlur = () => setTimeout(returnFocus, 0);
    window.addEventListener("blur", onBlur);
    return () => window.removeEventListener("blur", onBlur);
  }, [active, returnFocus]);

  const onFrameLoad = () => {
    setLoaded(true);
    returnFocus();
    setTimeout(returnFocus, 300);
    try {
      // same-origin bundle: Esc inside the frame returns control to the page
      frameRef.current.contentWindow.addEventListener("keydown", (e) => {
        if (e.key === "Escape") { e.stopPropagation(); deactivate(true); }
      });
    } catch { /* cross-origin dev URL: the Done button and outside click still work */ }
  };

  if (!entry) {
    if (import.meta.env.DEV) console.warn(`[sdStory] unknown embed id "${id}" (not in embedCatalog.json; re-run npm run sync:sd-playground)`);
    return <div className={`pgE pgE--missing ${className}`} role="note">This view isn't in the synced playground catalog.</div>;
  }

  const label = title || entry.title;
  const src = embedUrl(entry, {
    case: caseId,
    state,
    theme: siteTheme,
    motion: prefersReduced() ? "reduce" : undefined,
    bg: frame === "none" ? "transparent" : undefined,
  });
  const fullSrc = embedUrl(entry, { case: caseId, state, theme: siteTheme });
  // fit="scale" lays the embed out at its natural size; the embed's own reported height wins when it is taller than the catalog's
  const nw = entry.size.w;
  const nh = fit === "scale" ? Math.max(entry.size.h, autoH || 0) : entry.size.h;
  const scale = fit === "scale" && box.w && box.h ? Math.min(1, box.w / nw, box.h / nh) : 1;
  const wantFrame = near && bundle;

  let boxStyle;
  if (fit === "auto") boxStyle = { height: Math.min(autoH || nh, maxHeight || 1400) };
  else if (fit === "scale") boxStyle = undefined; // box fills the slide pane
  else boxStyle = { height: "100%" };
  const frameStyle =
    fit === "scale"
      ? { width: nw, height: nh, transform: `scale(${scale})`, transformOrigin: "top left" }
      : { width: "100%", height: "100%" };

  const thumb = embedPoster(entry);

  return (
    <figure ref={wrapRef} className={`pgE pgE--${fit} pgE--${frame}${active ? " is-active" : ""} ${className}`}>
      <div ref={boxRef} className="pgE__box" style={boxStyle}>
        {bundle === null ? (
          <div className="pgE__offline" role="img" aria-label={`${label} (preview unavailable)`}>
            {thumb ? <img src={thumb} alt="" loading="lazy" onError={(e) => { e.currentTarget.style.display = "none"; }} /> : null}
            <p>The live prototype isn't available right now.</p>
          </div>
        ) : (
          <div
            className="pgE__scaler"
            style={fit === "scale" ? { width: nw * scale, height: nh * scale } : { width: "100%", height: "100%" }}
          >
            {!loaded && <div className="pgE__skeleton" aria-hidden="true" />}
            {wantFrame && (
              <iframe
                ref={frameRef}
                key={src}
                title={label}
                src={src}
                loading="lazy"
                tabIndex={active ? 0 : -1}
                allow="clipboard-write"
                onLoad={onFrameLoad}
                className="pgE__frame"
                style={{ ...frameStyle, opacity: loaded ? 1 : 0 }}
              />
            )}
            {wantFrame && loaded && !active && (
              <button
                ref={activateRef}
                type="button"
                className="pgE__activate"
                aria-label={`Interact with ${label}. Press Enter or click to use it. Escape returns to the slides.`}
                onClick={() => { setActive(true); requestAnimationFrame(() => frameRef.current?.focus()); }}
              >
                <span className="pgE__hint" aria-hidden="true">Click to interact</span>
              </button>
            )}
          </div>
        )}
      </div>
      <figcaption className="pgE__cap">
        {caption && <span className="pgE__capText">{caption}</span>}
        <span className="pgE__tools">
          {active && (
            <button type="button" className="pgE__done" onClick={() => deactivate(true)}>
              Done (Esc)
            </button>
          )}
          <a className="pgE__open" href={fullSrc} target="_blank" rel="noopener noreferrer" aria-label={`Open ${label} full size (new tab)`}>
            Open full size
          </a>
          {import.meta.env.DEV && bundle && <span className="pgE__sync" title={bundle.syncedAt}>playground {bundle.commit}</span>}
        </span>
      </figcaption>
    </figure>
  );
}

export { PLAYGROUND_BASE };
