// /faces: the one gallery of every face in the codebase (inventory.js). One shared WebGL context draws each tile once
// into a cached 2D canvas; only the hovered tile (or the open viewer) is live. Public route: nothing private is imported.
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { EMOTE_NAMES, CHAIN_NAMES } from "../figures/faces/morph/emoteEngine";
import { complete } from "../figures/faces/features/core";
import Face from "../figures/faces/Face";
import PixelMascot from "../figures/pixelMascot/PixelMascot";
import IllustratedMascot from "../figures/pixelMascot/IllustratedMascot";
import "../figures/pixelMascot/pixelMascotLab.css";
import { PRIVATE_SITE } from "../lib/site";
import { encodeFace } from "../faceMaker/share";
import { ENTRIES, GROUPS } from "./inventory";
import { useGalleryStage, FW, FH } from "./useGalleryStage";
import "./facesGallery.css";

const TILE_W = 360, TILE_H = Math.round((TILE_W * FH) / FW);
const HAS_LAB = import.meta.env.DEV || PRIVATE_SITE; // /face-lab only exists in dev and private builds
const EMOTES = [...EMOTE_NAMES, ...CHAIN_NAMES];
const usePrefersReduced = () => {
  const [r, setR] = useState(() => typeof matchMedia !== "undefined" && matchMedia("(prefers-reduced-motion: reduce)").matches);
  useEffect(() => { const m = matchMedia("(prefers-reduced-motion: reduce)"), f = () => setR(m.matches); m.addEventListener("change", f); return () => m.removeEventListener("change", f); }, []);
  return r;
};

function LegacyArt({ entry, size, live }) {
  const n = entry.node;
  if (n === "face2d") return <Face skin="clay" size={size} />;
  if (n === "pixel") return <PixelMascot action="idle" size={size * 0.8} playing={live} />;
  if (n === "illustrated") return <IllustratedMascot action={live ? "wave" : "idle"} size={size * 0.8} />;
  return <img src={entry.src} alt="" width={size} height={size} loading="lazy" decoding="async" />;
}

function FaceTile({ entry, stage, onOpen }) {
  const cv = useRef(null), box = useRef(null);
  const [drawn, setDrawn] = useState(false), [hot, setHot] = useState(false);
  const is3d = entry.kind === "3d";
  // draw the thumbnail once, when the tile comes within a screen of the viewport
  useEffect(() => {
    if (!is3d || !stage.ready) return;
    const c = cv.current, io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { io.disconnect(); stage.still(entry, c, { done: () => setDrawn(true) }); } }, { rootMargin: "400px" });
    io.observe(box.current);
    return () => { io.disconnect(); stage.clear(c); };
  }, [is3d, stage.ready]); // eslint-disable-line react-hooks/exhaustive-deps
  const enter = (e) => { if (e.pointerType === "touch") return; setHot(true); if (is3d && drawn) stage.live(entry, cv.current); };
  const leave = () => { setHot(false); if (is3d) stage.stop(entry, cv.current); };
  useEffect(() => { if (hot && is3d && drawn) stage.live(entry, cv.current); }, [drawn]); // eslint-disable-line react-hooks/exhaustive-deps
  return (
    <li className="fg-cell">
      <button type="button" className="fg-tile" onClick={() => onOpen(entry)} onPointerEnter={enter} onPointerLeave={leave} onFocus={() => { setHot(true); if (is3d && drawn) stage.live(entry, cv.current); }} onBlur={leave} aria-label={`${entry.name}, open larger`}>
        <span className="fg-art" ref={box}>
          {is3d ? <canvas ref={cv} width={TILE_W} height={TILE_H} className={drawn ? "is-drawn" : ""} aria-hidden="true" /> : <LegacyArt entry={entry} size={180} live={hot} />}
          {is3d && !drawn && <i className="fg-wait" aria-hidden="true" />}
        </span>
        <span className="fg-name">{entry.name}</span>
      </button>
    </li>
  );
}

function Viewer({ entry, stage, reduce, onClose }) {
  const cv = useRef(null), dlg = useRef(null);
  const [links, setLinks] = useState({ maker: null, lab: null });
  const is3d = entry.kind === "3d";
  useEffect(() => {
    const d = dlg.current; d.showModal();
    const c = cv.current;
    if (is3d && c) { c.width = FW; c.height = FH; stage.live(entry, c); }
    return () => { if (is3d && c) stage.stop(entry, c); };
  }, [entry]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (!is3d) return;
    let dead = false;
    (async () => {
      const tok = entry.skin === "plast" ? await encodeFace(complete(entry.face || {})) : null;
      if (dead) return;
      const json = entry.skin === "plast" ? btoa(JSON.stringify(entry.face || {})).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "") : "";
      setLinks({ maker: tok ? `/face-maker#f=${tok}` : null, lab: `/face-lab?skin=${entry.skin}${json ? `#face=${json}` : ""}` });
    })();
    return () => { dead = true; };
  }, [entry]); // eslint-disable-line react-hooks/exhaustive-deps
  return (
    <dialog ref={dlg} className="fg-view" onClose={onClose} onClick={(e) => { if (e.target === dlg.current) dlg.current.close(); }} aria-label={entry.name}>
      <div className="fg-view__body">
        <div className="fg-view__art">{is3d ? <canvas ref={cv} aria-label={entry.name} role="img" /> : <LegacyArt entry={entry} size={300} live />}</div>
        <div className="fg-view__side">
          <h2>{entry.name}</h2>
          <p className="fg-sub">{GROUPS.find((g) => g.id === entry.group).label}{entry.sub ? " · " + entry.sub : ""}</p>
          {is3d && <div className="fg-chips" role="group" aria-label="Emotes">{EMOTES.map((n) => <button key={n} type="button" className="fg-chip" onClick={() => stage.play(n)}>{n}</button>)}</div>}
          <div className="fg-links">
            {links.maker && <a className="fg-pill" href={links.maker}>Open in face maker</a>}
            {HAS_LAB && links.lab && <a className="fg-pill" href={links.lab}>Open in face lab</a>}
            <button type="button" className="fg-pill fg-pill--strong" onClick={() => dlg.current.close()}>Close</button>
          </div>
        </div>
      </div>
    </dialog>
  );
}

export default function FacesPage({ onBack }) {
  const reduce = usePrefersReduced();
  const stage = useGalleryStage(reduce);
  const [open, setOpen] = useState(null);
  useEffect(() => { document.title = "Faces"; }, []);
  const by = useMemo(() => GROUPS.map((g) => {
    const items = ENTRIES.filter((e) => e.group === g.id), subs = [...new Set(items.map((e) => e.sub || ""))];
    return { ...g, items, subs: subs.map((s) => ({ s, items: items.filter((e) => (e.sub || "") === s) })) };
  }), []);
  const close = useCallback(() => setOpen(null), []);
  return (
    <main className="fg" aria-labelledby="fg-title">
      <header className="fg__top">
        {onBack && <button type="button" className="fg-pill" onClick={onBack}>Home</button>}
        <h1 id="fg-title">Faces</h1>
        <p className="fg__lede">Every face in the repo, {ENTRIES.length} of them. Hover to make one blink or emote; tap to open it larger.</p>
        <nav className="fg-chips" aria-label="Sections">{by.map((g) => <a key={g.id} className="fg-chip" href={`#${g.id}`}>{g.label} <b>{g.items.length}</b></a>)}</nav>
        {stage.err && <p role="alert" className="fg__err">The 3D view could not start ({stage.err}).</p>}
      </header>
      {by.map((g) => (
        <section key={g.id} id={g.id} className="fg-sec" aria-labelledby={`h-${g.id}`}>
          <h2 id={`h-${g.id}`}>{g.label} <small>{g.items.length}</small></h2>
          <p className="fg-sec__blurb">{g.blurb}</p>
          {g.subs.map(({ s, items }) => (
            <div key={s}>
              {s && <h3 className="fg-subh">{s}</h3>}
              <ul className="fg-grid">{items.map((e) => <FaceTile key={e.id} entry={e} stage={stage} onOpen={setOpen} />)}</ul>
            </div>
          ))}
        </section>
      ))}
      {open && <Viewer entry={open} stage={stage} reduce={reduce} onClose={close} />}
    </main>
  );
}
