// /face-maker: a public 3D face maker. The face is the face system's JSON; the taste layer (src/faceTaste)
// scores it, suggests fixes and randomizes it. Nothing here depends on private-only code.
import { useCallback, useDeferredValue, useEffect, useMemo, useRef, useState } from "react";
import { score, suggest, randomize, constrain, complete, NUMERIC, HAIR_STYLES, MATERIALS, pairings, browFor } from "../faceTaste/index.js";
import { AGAM_CLAY } from "../faceTaste/data.js";
import { get, set, clone } from "../faceTaste/params.js";
import { useFaceStage, FW, FH } from "./useFaceStage";
import { encodeFace, decodeFace, faceUrl, hashToken } from "./share";
import { GROUPS, STYLE_LABELS, MATERIAL_LABELS, EMOTES, STYLE_CHOICES, HAIR_COLOURS } from "./controls";
import "./faceMaker.css";

const START = constrain(AGAM_CLAY);
const usePrefersReduced = () => {
  const [r, setR] = useState(() => typeof matchMedia !== "undefined" && matchMedia("(prefers-reduced-motion: reduce)").matches);
  useEffect(() => { const m = matchMedia("(prefers-reduced-motion: reduce)"), f = () => setR(m.matches); m.addEventListener("change", f); return () => m.removeEventListener("change", f); }, []);
  return r;
};
const grade = (n) => (n >= 90 ? "Lovely" : n >= 78 ? "Good" : n >= 62 ? "Getting there" : "Needs work");
const describe = (f) => `A 3D face: ${MATERIAL_LABELS[f.material.kind]} look, ${STYLE_LABELS[f.hair.style].toLowerCase()} hair, ${f.mouth.smile > 0.2 ? "smiling" : f.mouth.smile < -0.2 ? "frowning" : "calm"}.`;
const download = (blob, name) => { const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = name; document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(a.href), 4000); };

export default function FaceMakerPage({ onBack }) {
  const reduce = usePrefersReduced();
  const [{ face, past }, setS] = useState({ face: START, past: [] }); // past: the undo stack
  const setFace = useCallback((f) => setS((s) => ({ ...s, face: f })), []);
  const lastEdit = useRef({ key: "", at: 0 });
  const canvasRef = useRef(null);
  const stage = useFaceStage(canvasRef, face, reduce);
  const [style, setStyle] = useState("balanced");
  const [msg, setMsg] = useState("");
  const toast = useCallback((t) => { setMsg(t); clearTimeout(toast.t); toast.t = setTimeout(() => setMsg(""), 2400); }, []);

  // an edit: pushes the previous face for Undo; edits to the same control within 700 ms are one undo step
  const edit = useCallback((next, key = "") => {
    const now = performance.now(), L = lastEdit.current, merge = !!key && L.key === key && now - L.at < 700;
    L.key = key; L.at = now;
    setS((s) => ({ face: typeof next === "function" ? next(s.face) : next, past: merge ? s.past : [...s.past.slice(-60), s.face] }));
  }, []);
  const undo = useCallback(() => { lastEdit.current.key = ""; setS((s) => (s.past.length ? { face: s.past[s.past.length - 1], past: s.past.slice(0, -1) } : s)); }, []);
  const setPath = (path, v) => edit((f) => { const n = clone(f); set(n, path, v); return n; }, path);

  // load a shared face from the hash once
  useEffect(() => { const t = hashToken(); if (t) decodeFace(t).then((f) => { if (f) setFace(f); }); }, []);
  useEffect(() => { document.title = "Face maker"; }, []);
  // keep the hash current (no history spam) so the address bar is always the share link
  useEffect(() => { const id = setTimeout(async () => { try { history.replaceState(null, "", "#f=" + (await encodeFace(face))); } catch { /* ignore */ } }, 400); return () => clearTimeout(id); }, [face]);
  useEffect(() => {
    const k = (e) => { if ((e.metaKey || e.ctrlKey) && !e.shiftKey && e.key.toLowerCase() === "z" && !/^(INPUT|TEXTAREA|SELECT)$/.test(document.activeElement?.tagName || "") ) { e.preventDefault(); undo(); } };
    window.addEventListener("keydown", k); return () => window.removeEventListener("keydown", k);
  }, [undo]);

  const dface = useDeferredValue(face);
  const taste = useMemo(() => score(dface), [dface]);
  const tips = useMemo(() => suggest(dface), [dface]);
  const locked = face.material.kind !== "clay";

  const doRandom = () => { edit(randomize((Math.random() * 1e9) | 0, { style })); toast("New face"); };
  const share = async () => {
    const url = await faceUrl(face);
    try { await navigator.clipboard.writeText(url); toast("Link copied"); } catch { history.replaceState(null, "", url.slice(url.indexOf("#"))); toast("Link is in the address bar"); }
  };
  const shotPng = async () => { const b = await stage.snapshot({ bg: getComputedStyle(document.documentElement).getPropertyValue("--fm-ground").trim() || "#ebebeb", size: 1200 }); if (b) { download(b, "face.png"); toast("Saved face.png"); } };
  const shotAvatar = async () => { const b = await stage.snapshot({ crop: true, size: 512 }); if (b) { download(b, "face-avatar.png"); toast("Saved a transparent avatar"); } };

  return (
    <main className="fm" aria-labelledby="fm-title">
      <header className="fm__top">
        {onBack && <button type="button" className="fm__pill" onClick={onBack}>Home</button>}
        <h1 id="fm-title" className="fm__title">Face maker</h1>
        <p className="fm__lede">Build a face in 3D. The taste meter tells you what works and why.</p>
      </header>

      <div className="fm__grid">
        <section className="fm__stage" aria-label="Your face">
          <div className="fm__canvasWrap">
            <canvas ref={canvasRef} className="fm__canvas" width={FW} height={FH} role="img" aria-label={describe(face)} />
            {!stage.ready && !stage.err && <p className="fm__loading" role="status">Building the head…</p>}
            {stage.err && <p className="fm__loading" role="alert">The 3D view could not start ({stage.err}).</p>}
          </div>
          <div className="fm__row" role="group" aria-label="Expressions">
            {EMOTES.map(([id, label]) => <button key={id} type="button" className="fm__chip" disabled={!stage.ready} onClick={() => stage.play(id)}>{label}</button>)}
          </div>
          <div className="fm__row">
            <button type="button" className="fm__pill fm__pill--strong" onClick={doRandom}>Randomize</button>
            <label className="fm__sel"><span className="fm__sr">Randomize style</span>
              <select value={style} onChange={(e) => setStyle(e.target.value)}>{STYLE_CHOICES.map(([v, l]) => <option key={v} value={v}>{l}</option>)}</select></label>
            <button type="button" className="fm__pill" onClick={undo} disabled={!past.length}>Undo</button>
            <button type="button" className="fm__pill" onClick={() => edit(START)}>Reset</button>
          </div>
          <div className="fm__row">
            <button type="button" className="fm__pill" onClick={share}>Copy link</button>
            <button type="button" className="fm__pill" onClick={shotPng} disabled={!stage.ready}>Download PNG</button>
            <button type="button" className="fm__pill" onClick={shotAvatar} disabled={!stage.ready}>Transparent avatar</button>
          </div>
          <p className="fm__toast" role="status" aria-live="polite">{msg}</p>
        </section>

        <aside className="fm__side">
          <section className="fm__taste" aria-labelledby="fm-taste">
            <div className="fm__meterHead">
              <h2 id="fm-taste" className="fm__h2">Taste</h2>
              <p className="fm__score" role="status" aria-live="polite"><strong>{taste.total}</strong><span> / 100 · {grade(taste.total)}</span></p>
            </div>
            <div className="fm__meter" role="meter" aria-valuemin={0} aria-valuemax={100} aria-valuenow={taste.total} aria-label="Taste score"><i style={{ width: taste.total + "%" }} data-grade={grade(taste.total)} /></div>
            <details className="fm__why"><summary>Why this score</summary>
              <ul>{taste.rules.map((r) => <li key={r.id}><span>{r.label}</span><i aria-hidden="true"><b style={{ width: Math.round(r.score * 100) + "%" }} /></i><em>{Math.round(r.score * 100)}</em><small>{r.notes[0]}</small></li>)}</ul>
            </details>
            {tips.length > 0 ? (
              <ul className="fm__tips" aria-label="Suggestions">
                {tips.map((t) => (
                  <li key={t.path + t.to}><button type="button" className="fm__tip" onClick={() => { edit(t.apply(face)); toast(t.label + " applied"); }}>
                    <span className="fm__tipT">{t.label} <b>+{t.gain}</b></span><span className="fm__tipD">{t.explain}</span></button></li>
                ))}
              </ul>
            ) : <p className="fm__ok">Nothing to fix. This one works.</p>}
          </section>

          <div className="fm__groups">
            {GROUPS.map((g) => (
              <details key={g.id} className="fm__group" open={g.open}>
                <summary>{g.label}</summary>
                <div className="fm__ctls">{g.controls.map((c, i) => <Control key={c.path || c.kind + i} c={c} face={face} locked={locked} setPath={setPath} edit={edit} />)}</div>
              </details>
            ))}
          </div>
        </aside>
      </div>
    </main>
  );
}

function Control({ c, face, locked, setPath, edit }) {
  const id = "fm-" + (c.path || c.kind);
  if (c.kind === "material") return (
    <fieldset className="fm__fs"><legend>Material</legend>
      <div className="fm__chips">{MATERIALS.map((m) => <button key={m} type="button" className="fm__chip" aria-pressed={face.material.kind === m}
        onClick={() => edit((f) => { const n = clone(f); n.material.kind = m; return n; }, "material")}>{MATERIAL_LABELS[m]}</button>)}</div></fieldset>);
  if (c.kind === "tone") return (
    <div className="fm__field"><label htmlFor={id}>Skin tone</label>
      <input id={id} type="range" className="fm__tone" min={0} max={1} step={0.01} value={face.skin.tone} disabled={locked} onChange={(e) => setPath("skin.tone", +e.target.value)} aria-describedby={locked ? id + "-h" : undefined} />
      {locked && <small id={id + "-h"}>{MATERIAL_LABELS[face.material.kind]} brings its own skin colour. Pick Soft clay to set a tone.</small>}</div>);
  if (c.kind === "style") return (
    <fieldset className="fm__fs"><legend>Style</legend>
      <div className="fm__chips">{Object.keys(HAIR_STYLES).map((s) => <button key={s} type="button" className="fm__chip" aria-pressed={face.hair.style === s}
        onClick={() => edit((f) => { const n = clone(f), d = HAIR_STYLES[s]; n.hair.style = s; for (const k of ["length", "fringe", "messiness", "volume", "sweep"]) n.hair[k] = d[k]; return n; }, "style")}>{STYLE_LABELS[s]}</button>)}</div></fieldset>);
  if (c.kind === "hairColor") {
    const sug = pairings.hairColours(face), all = [...new Set([...sug, ...HAIR_COLOURS])];
    const setColour = (col) => edit((f) => { const n = clone(f); n.hair.color = col; n.brows.color = browFor(col); return n; }, "hair.color");
    return (
      <fieldset className="fm__fs"><legend>Colour</legend>
        <div className="fm__chips">{all.map((col) => <button key={col} type="button" className="fm__sw" aria-pressed={face.hair.color.toLowerCase() === col} aria-label={"Hair colour " + col + (sug.includes(col) ? ", suits this skin" : "")} data-suits={sug.includes(col)} style={{ background: col }} onClick={() => setColour(col)} />)}
          <label className="fm__sw fm__sw--custom"><span className="fm__sr">Custom hair colour</span><input type="color" value={face.hair.color} onChange={(e) => setColour(e.target.value)} /></label></div>
        <small>Ringed swatches suit this skin tone.</small></fieldset>);
  }
  if (c.kind === "clip") return (
    <div className="fm__field fm__field--row"><input id={id} type="checkbox" checked={face.hair.clip} onChange={(e) => setPath("hair.clip", e.target.checked)} /><label htmlFor={id}>Hair clip</label></div>);
  const s = NUMERIC[c.path], v = get(face, c.path);
  return (
    <div className="fm__field"><div className="fm__fl"><label htmlFor={id}>{c.label}</label></div>
      <div className="fm__rng"><span aria-hidden="true">{c.ends[0]}</span>
        <input id={id} type="range" min={s.lo} max={s.hi} step={0.01} value={Math.min(s.hi, Math.max(s.lo, v))} onChange={(e) => setPath(c.path, +e.target.value)}
          aria-valuetext={`${c.label}: ${Math.round(((v - s.lo) / (s.hi - s.lo)) * 100)} percent, from ${c.ends[0]} to ${c.ends[1]}`} />
        <span aria-hidden="true">{c.ends[1]}</span></div></div>);
}
