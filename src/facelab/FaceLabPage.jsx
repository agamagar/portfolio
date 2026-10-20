// /face-lab: compare face-animation variants side by side (dev + private builds only).
// One shared morph renderer (one WebGL context, the hero's own createMascotMorph) draws every
// cell in turn and each result is blitted into that cell's 2D canvas, so 6 faces cost one
// context. Cells off-screen or paused are skipped. Params are lab-side wrappers around the
// real emote engine (its internal spring/lag tables are private to emoteEngine.js).
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createMascotMorph } from "../figures/faces/morph/mascotMorph";
import { createEmoteEngine, EMOTE_NAMES, CHAIN_NAMES, IDLE, toPose } from "../figures/faces/morph/emoteEngine";
import { DURATION, ramp } from "../figures/faces/morph/flood";
import { FW, FH } from "../figures/faces/morph/morphRenderer";
import "./faceLab.css";

const SKINS = [["clay", "Clay"], ["noir", "Noir"]]; // the rigs the hero's renderer carries
const EASES = {
  hero: ramp, // the hero's speed ramp
  linear: (u) => u,
  inOut: (u) => (u < 0.5 ? 2 * u * u : 1 - (-2 * u + 2) ** 2 / 2),
  out: (u) => 1 - (1 - u) ** 3,
};
// defaults = what the hero does today (DURATION from flood.js, idle cadence from HeroMorph)
export const DEFAULTS = {
  skin: "clay", t: 1, emote: "cycle", playing: true, speed: 1, follow: false,
  intensity: 1, headMove: 1, ambient: true, quick: false, cycleGap: 3200,
  morphMs: DURATION, morphEase: "hero", gaze: 0.6, seed: 7,
};
const PRESETS = {
  "Current hero": {},
  Calm: { speed: 0.6, intensity: 0.7, headMove: 0.6, cycleGap: 5500, morphMs: 5200, morphEase: "inOut", gaze: 0.4 },
  Playful: { speed: 1.2, intensity: 1.35, headMove: 1.4, cycleGap: 1600, morphMs: 3200, morphEase: "out", follow: true, gaze: 1 },
  Snappy: { speed: 1.8, intensity: 1.1, headMove: 0.9, quick: true, cycleGap: 1200, morphMs: 1800, morphEase: "linear", gaze: 0.8 },
};
const SLIDERS = [
  ["speed", "Speed", 0.25, 2, 0.05, "×"],
  ["intensity", "Intensity", 0, 1.5, 0.05, ""],
  ["headMove", "Head motion", 0, 1.6, 0.05, ""],
  ["gaze", "Pointer strength", 0, 1.5, 0.05, ""],
  ["cycleGap", "Cycle gap (ms)", 600, 8000, 100, ""],
  ["morphMs", "Morph time (ms)", 800, 8000, 100, ""],
];
const ALL_EMOTES = [...EMOTE_NAMES, ...CHAIN_NAMES];

// ---- the shared renderer + scheduler -------------------------------------------------------
function useShared() {
  const [mm, setMm] = useState(null);
  const [err, setErr] = useState("");
  const cells = useRef(new Map()); // id -> cell runtime
  const pointer = useRef({ x: 0, y: 0 });
  useEffect(() => {
    let dead = false, raf = 0, mmLocal = null;
    const off = document.createElement("canvas");
    (async () => {
      try {
        mmLocal = await createMascotMorph(off, { clear: true, ink: "#17171a" });
        await mmLocal.MR.loadNoir();
        if (dead) return;
        setMm(mmLocal);
      } catch (e) { setErr(String(e?.message || e)); return; }
      let last = performance.now(), rr = 0;
      const loop = (now) => {
        raf = requestAnimationFrame(loop);
        const dt = Math.min(50, now - last); last = now;
        const list = [...cells.current.values()];
        if (!list.length || document.hidden) return;
        const t0 = performance.now();
        // round-robin so a slow frame never starves a cell; stop once the budget is spent
        for (let n = 0; n < list.length; n++) {
          const c = list[(rr + n) % list.length];
          const need = c.step(dt);
          if (need === "draw") { c.draw(mmLocal); if (performance.now() - t0 > 14) { rr = (rr + n + 1) % list.length; break; } }
        }
      };
      raf = requestAnimationFrame(loop);
    })();
    const onMove = (e) => { pointer.current = { x: e.clientX, y: e.clientY }; };
    window.addEventListener("pointermove", onMove);
    return () => {
      dead = true; cancelAnimationFrame(raf); window.removeEventListener("pointermove", onMove);
      if (mmLocal) { mmLocal.MR.renderer.dispose(); mmLocal.MR.renderer.forceContextLoss(); }
    };
  }, []);
  return { mm, err, cells, pointer };
}

// ---- one cell ------------------------------------------------------------------------------
function Cell({ id, shared, onRemove, initial }) {
  const [p, setP] = useState({ ...DEFAULTS, ...initial });
  const pr = useRef(p); pr.current = p;
  const cv = useRef(null), box = useRef(null);
  const rt = useRef({ seen: true, tm: 1, morphing: false, morphU: 0, engine: null, gapLeft: 1500, lastPose: null, dirty: true, step: 0, lastDraw: 0 });
  const [info, setInfo] = useState("");

  // morph state: slider drives t directly; "Play morph" animates it
  const setT = (t) => { setP((q) => ({ ...q, t })); rt.current.morphing = false; rt.current.dirty = true; };
  const playMorph = () => { const r = rt.current; r.morphing = true; r.morphU = 0; setP((q) => ({ ...q, t: 0, playing: true })); r.dirty = true; };
  const reset = () => { const r = rt.current; r.engine = createEmoteEngine({ seed: pr.current.seed }); r.engine.setAmbient(pr.current.ambient); r.gapLeft = 1500; r.dirty = true; };
  useEffect(() => { reset(); }, [p.seed]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { rt.current.engine?.setAmbient(p.ambient); }, [p.ambient]);
  useEffect(() => { rt.current.dirty = true; }, [p.skin, p.t, p.intensity, p.headMove]);

  useEffect(() => {
    const io = new IntersectionObserver(([e]) => { rt.current.seen = e.isIntersecting; rt.current.dirty = true; });
    io.observe(box.current);
    const r = rt.current;
    r.step = (dt) => {
      const q = pr.current;
      if (!r.seen) return null;
      const idle = !q.playing && !r.dirty;
      if (idle) return null;
      const d = q.playing ? dt * q.speed : 0;
      if (q.playing && r.morphing) {
        r.morphU = Math.min(1, r.morphU + d / q.morphMs);
        const t = (EASES[q.morphEase] || ramp)(r.morphU);
        r.tm = t;
        if (r.morphU >= 1) { r.morphing = false; setP((s) => ({ ...s, t: 1 })); }
      } else r.tm = q.t;
      // emotes only once the clay is formed
      if (r.tm >= 0.98 && q.playing) {
        if (q.emote === "cycle") {
          r.gapLeft -= d;
          if (r.gapLeft <= 0 && !r.engine.active()) {
            const pool = [...IDLE]; r.engine.play(pool[(Math.random() * pool.length) | 0], { quick: q.quick });
            r.gapLeft = q.cycleGap * (0.7 + Math.random() * 0.6);
          }
        } else if (q.emote !== "none" && !r.engine.active()) {
          r.gapLeft -= d;
          if (r.gapLeft <= 0) { r.engine.play(q.emote, { quick: q.quick }); r.gapLeft = Math.max(400, q.cycleGap * 0.5); }
        }
      }
      // ~30 fps for a running cell, immediate when something was edited
      const now = performance.now();
      if (!r.dirty && now - r.lastDraw < 28) return null;
      r.d = d; return "draw";
    };
    r.draw = (mm) => {
      const q = pr.current;
      const MR = mm.MR;
      MR.setRig(q.skin);
      const out = r.engine.tick(q.playing ? r.d || 0 : 0, q.skin);
      // lab wrappers over the engine's output: amplitude and head share
      const pose = { ...out, keys: { ...out.keys } };
      for (const k in pose.keys) pose.keys[k] = Math.min(1.5, pose.keys[k] * q.intensity);
      for (const c of ["tilt", "hpitch", "hyaw", "hy", "hx"]) pose[c] = out[c] * q.headMove;
      pose.sx = 1 + (out.sx - 1) * q.headMove; pose.sy = 1 + (out.sy - 1) * q.headMove;
      if (q.follow && box.current) {
        const b = box.current.getBoundingClientRect(), P = shared.pointer.current;
        const nx = Math.max(-1, Math.min(1, (P.x - (b.left + b.width / 2)) / 420));
        const ny = Math.max(-1, Math.min(1, (P.y - (b.top + b.height * 0.4)) / 420));
        pose.eyeX += nx * 0.03 * q.gaze; pose.eyeY += -ny * 0.018 * q.gaze;
        pose.hyaw += nx * 0.05 * q.gaze; pose.hpitch += ny * 0.04 * q.gaze;
      }
      if (r.tm >= 0.98) mm.renderAt(r.tm, toPose(pose)); else mm.renderAt(r.tm);
      const c2 = cv.current.getContext("2d");
      c2.clearRect(0, 0, FW, FH);
      c2.drawImage(MR.renderer.domElement, 0, 0);
      r.dirty = false; r.lastDraw = performance.now();
    };
    shared.cells.current.set(id, r);
    return () => { io.disconnect(); shared.cells.current.delete(id); };
  }, [shared.mm]); // eslint-disable-line react-hooks/exhaustive-deps

  const set = (k, v) => setP((q) => ({ ...q, [k]: v }));
  const json = () => JSON.stringify({ skin: p.skin, emote: p.emote, ...Object.fromEntries(Object.keys(DEFAULTS).filter((k) => !["skin", "emote", "playing", "t"].includes(k)).map((k) => [k, p[k]])) }, null, 2);
  const copy = async () => { try { await navigator.clipboard.writeText(json()); setInfo("Copied"); } catch { setInfo("Copy failed"); } setTimeout(() => setInfo(""), 1400); };
  const preset = (name) => { setP((q) => ({ ...DEFAULTS, skin: q.skin, ...PRESETS[name] })); reset(); };

  return (
    <section className="fl-cell" data-cell={id}>
      <div className="fl-stage" ref={box} data-skin={p.skin}>
        <canvas ref={cv} width={FW} height={FH} />
        {!shared.mm && <span className="fl-wait">{shared.err || "Loading…"}</span>}
        <button className="fl-x" onClick={onRemove} aria-label="Remove cell">×</button>
      </div>
      <div className="fl-row">
        <label>Skin <select value={p.skin} onChange={(e) => set("skin", e.target.value)}>{SKINS.map(([v, l]) => <option key={v} value={v}>{l}</option>)}</select></label>
        <label>Emote <select value={p.emote} onChange={(e) => { set("emote", e.target.value); rt.current.gapLeft = 0; }}>
          <option value="cycle">cycle</option><option value="none">none (ambient only)</option>
          {ALL_EMOTES.map((n) => <option key={n} value={n}>{n}</option>)}</select></label>
      </div>
      <div className="fl-row">
        <label className="fl-grow">Morph 2D ↔ 3D <input type="range" min="0" max="1" step="0.005" value={p.t} onChange={(e) => setT(+e.target.value)} /></label>
        <button onClick={playMorph}>Play morph</button>
        <select value={p.morphEase} onChange={(e) => set("morphEase", e.target.value)} aria-label="Morph easing">{Object.keys(EASES).map((k) => <option key={k}>{k}</option>)}</select>
      </div>
      <div className="fl-row">
        <button onClick={() => set("playing", !p.playing)}>{p.playing ? "Pause" : "Play"}</button>
        <button onClick={reset}>Reset</button>
        <label><input type="checkbox" checked={p.follow} onChange={(e) => set("follow", e.target.checked)} /> Follow pointer</label>
        <label><input type="checkbox" checked={p.ambient} onChange={(e) => set("ambient", e.target.checked)} /> Ambient</label>
        <label><input type="checkbox" checked={p.quick} onChange={(e) => set("quick", e.target.checked)} /> Quick</label>
      </div>
      <details open>
        <summary>Params</summary>
        {SLIDERS.map(([k, l, a, b, s]) => (
          <label className="fl-sl" key={k}><span>{l}</span>
            <input type="range" min={a} max={b} step={s} value={p[k]} onChange={(e) => set(k, +e.target.value)} /><output>{(+p[k]).toFixed(k === "cycleGap" || k === "morphMs" ? 0 : 2)}</output></label>
        ))}
      </details>
      <div className="fl-row">
        <select value="" onChange={(e) => e.target.value && preset(e.target.value)} aria-label="Load preset"><option value="">Load preset…</option>{Object.keys(PRESETS).map((n) => <option key={n}>{n}</option>)}</select>
        <button onClick={copy}>{info || "Copy params as JSON"}</button>
      </div>
    </section>
  );
}

export default function FaceLabPage({ onBack }) {
  const shared = useShared();
  const [ids, setIds] = useState([1, 2, 3, 4]);
  const next = useRef(5);
  const seeds = useMemo(() => [
    { skin: "clay", emote: "grin" }, { skin: "noir", emote: "surprised" },
    { skin: "clay", emote: "cycle" }, { skin: "noir", emote: "lookGrin" },
    { skin: "clay", emote: "think" }, { skin: "noir", emote: "laugh" },
  ], []);
  const setCount = useCallback((n) => setIds((cur) => {
    if (n < cur.length) return cur.slice(0, n);
    const out = [...cur]; while (out.length < n) out.push(next.current++); return out;
  }), []);
  return (
    <main className="fl-page">
      <header className="fl-head">
        <button onClick={onBack}>← Back</button>
        <h1>Face lab</h1>
        <label>Cells <input type="range" min="2" max="6" value={ids.length} onChange={(e) => setCount(+e.target.value)} /> {ids.length}</label>
        <span className="fl-note">One shared WebGL context · off-screen cells pause · dev/private builds only</span>
      </header>
      <div className="fl-grid">
        {ids.map((id, i) => <Cell key={id} id={id} shared={shared} initial={seeds[i % seeds.length]} onRemove={() => ids.length > 2 && setIds(ids.filter((x) => x !== id))} />)}
      </div>
    </main>
  );
}
