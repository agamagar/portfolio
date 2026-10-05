import { useEffect, useMemo, useRef, useState } from "react";
import "./crosssell.css";

// Figure: the theme space as an embedding projector (2026-09-04), after
// Google's Embedding Projector (research.google, 2016): the same 40,866-row
// sample as XsCloud, now with the projector's moves. Three projections: PCA in
// 3D (rotate by dragging, the first three components), t-SNE in 2D (local
// neighbourhoods on the sample, perplexity 30), and a custom linear projection
// (two supervised directions in the fingerprint space: Pull-to-Ship centroid
// axis across, Head-to-Tail centroid axis up). Click a point for its six
// nearest neighbours in the full standardised space with distances; click a
// neighbour to walk.
//
// The space is 49-d, not the cloud's 51: the two features that ARE the verdict
// (counts of pull reasons and review reasons) are dropped in project.py, or
// the neighbours and the custom axes would separate verdicts by construction.
// (With them in, Ship-vs-Pull AUC on the custom axis was 1.0 and a Pull's
// neighbours were 99% Pull. Circular.) Measured on the clean space, 4 Sep
// 2026, project.py + the check in the session note:
//   Pull's neighbours: 58% Pull (base rate 1.9%), 21% Ship, 22% Review
//   Ship's neighbours: 80% Ship (base 41%); Review's: 85% Review (base 57%)
//   custom verdict axis AUC: Ship vs Pull 0.951, Review vs Pull 0.954,
//   Ship vs Review 0.563. Pull has a shape. Ship against Review is a coin.
//   Band axis Head vs Tail AUC 1.0 (query length and evidence are in it). Search (substring or regex) over theme and seed names
// highlights matches. Legend chips isolate a series. Colour by verdict or band.
//
// Data: public/data/xs/pointcloud.json (labels, shared with XsCloud) plus
// projector.bin / projector.json written by theme-review/scripts/project.py
// (Int16 blocks: pca n x 3, tsne n x 2, custom n x 2; Uint16 nn n x 6; Int16
// nnd n x 6; all scaled by 1000). Fetched only when the figure nears the
// viewport. Search terms are not in the data (the case's guardrail).
// !! Internal Zepto data, same open call as XsReview / XsCloud.
//
// Form: identity of 40k points -> scatter; colour = the validated .xc tokens;
// legend with counts always present; a table view (the loadings) and a real
// table for the neighbour list; hover tooltip + 2px surface ring on the hit.

const LABELS_URL = "/data/xs/pointcloud.json";
const HEAD_URL = "/data/xs/projector.json";
const BIN_URL = "/data/xs/projector.bin";
const fmt = (n) => n.toLocaleString("en-US");

const VIEWS = [
  { k: "pca", t: "PCA, 3D", h: "The first three components. Drag to rotate." },
  { k: "tsne", t: "t-SNE", h: "Local neighbourhoods on the sample. The clusters are aisles and tab counts, not verdicts." },
  { k: "custom", t: "Custom axes", h: "Pull to Ship across, Head to Tail up. Pull has a shape. Ship against Review is a coin." },
];
const COLOUR = [
  { k: "v", t: "verdict", names: ["Ship", "Review", "Pull"], vars: ["--xc-v1", "--xc-v2", "--xc-v3"] },
  { k: "s", t: "band", names: ["Head", "Head of Tail", "Torso", "Tail"], vars: ["--xc-s1", "--xc-s2", "--xc-s3", "--xc-s4"] },
];

function useProjectorData(ref) {
  const [data, setData] = useState(null);
  const [err, setErr] = useState(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let cancelled = false;
    const load = async () => {
      try {
        const [labels, head, buf] = await Promise.all([
          fetch(LABELS_URL).then((r) => (r.ok ? r.json() : Promise.reject(new Error(r.status)))),
          fetch(HEAD_URL).then((r) => (r.ok ? r.json() : Promise.reject(new Error(r.status)))),
          fetch(BIN_URL).then((r) => (r.ok ? r.arrayBuffer() : Promise.reject(new Error(r.status)))),
        ]);
        const block = (k, T) => {
          const b = head.blocks[k];
          return new T(buf, b.offset, b.len);
        };
        const d = {
          n: head.n, labels, head,
          pca: block("pca", Int16Array), tsne: block("tsne", Int16Array), custom: block("custom", Int16Array),
          nn: block("nn", Uint16Array), nnd: block("nnd", Int16Array), k: head.k,
        };
        if (!cancelled) setData(d);
      } catch (e) { if (!cancelled) setErr(e); }
    };
    if (!("IntersectionObserver" in window)) { load(); return () => { cancelled = true; }; }
    const io = new IntersectionObserver((es) => {
      if (es.some((e) => e.isIntersecting)) { io.disconnect(); load(); }
    }, { rootMargin: "400px" });
    io.observe(el);
    return () => { cancelled = true; io.disconnect(); };
  }, [ref]);
  return { data, err };
}

// Per-view coordinates in a common -1..1 box, plus the 3D depth for PCA.
function useCoords(data, view) {
  return useMemo(() => {
    if (!data) return null;
    const n = data.n;
    const X = new Float32Array(n), Y = new Float32Array(n), Z = new Float32Array(n);
    let src, dims;
    if (view === "pca") { src = data.pca; dims = 3; }
    else if (view === "tsne") { src = data.tsne; dims = 2; }
    else { src = data.custom; dims = 2; }
    const cx = [0, 0, 0];
    for (let i = 0; i < n; i++) for (let d = 0; d < dims; d++) cx[d] += src[i * dims + d];
    for (let d = 0; d < dims; d++) cx[d] /= n;
    for (let i = 0; i < n; i++) {
      X[i] = src[i * dims] - cx[0];
      Y[i] = src[i * dims + 1] - cx[1];
      Z[i] = dims === 3 ? src[i * dims + 2] - cx[2] : 0;
    }
    // 3D: one uniform scale so the cube is true. 2D: each axis on its own
    // robust scale (99.5th percentile of |v|, clipped) so a few far outliers
    // on the custom verdict axis cannot squash the rest into a band.
    const p995 = (A) => { const a = Array.from(A, Math.abs).sort((u, w) => u - w); return a[Math.floor(a.length * 0.995)] || 1; };
    if (dims === 3) {
      let mx = 0;
      for (let i = 0; i < n; i++) mx = Math.max(mx, Math.abs(X[i]), Math.abs(Y[i]), Math.abs(Z[i]));
      const s = mx ? 1 / mx : 1;
      for (let i = 0; i < n; i++) { X[i] *= s; Y[i] *= s; Z[i] *= s; }
    } else {
      const sx = 1 / p995(X), sy = 1 / p995(Y);
      for (let i = 0; i < n; i++) {
        X[i] = Math.max(-1, Math.min(1, X[i] * sx));
        Y[i] = Math.max(-1, Math.min(1, Y[i] * sy));
      }
    }
    return { X, Y, Z, is3d: dims === 3 };
  }, [data, view]);
}

function matchFn(q) {
  if (!q) return null;
  let re = null;
  try { re = new RegExp(q, "i"); } catch { re = null; }
  const lq = q.toLowerCase();
  return (s) => (re ? re.test(s) : s.toLowerCase().includes(lq));
}

export default function XsProjector() {
  const root = useRef(null);
  const stage = useRef(null);
  const canvas = useRef(null);
  const { data, err } = useProjectorData(root);
  const [view, setView] = useState("pca");
  const [colour, setColour] = useState("v");
  const [only, setOnly] = useState(null);
  const [q, setQ] = useState("");
  const [sel, setSel] = useState(null);
  const [hover, setHover] = useState(null);
  const [spin, setSpin] = useState(() => !(typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches));
  const rot = useRef({ ry: 0.6, rx: -0.35 });
  const zoomRef = useRef(1);
  const [zoomTick, setZoomTick] = useState(0);
  const coords = useCoords(data, view);
  const C = COLOUR.find((c) => c.k === colour);
  const series = data ? data.labels[C.k] : null;
  const index = useRef(null);
  const raf = useRef(0);
  const drag = useRef(null);

  const counts = useMemo(() => {
    if (!series) return null;
    const c = new Array(C.names.length).fill(0);
    for (let i = 0; i < series.length; i++) c[series[i]]++;
    return c;
  }, [series, C]);

  const matches = useMemo(() => {
    if (!data) return null;
    const f = matchFn(q.trim());
    if (!f) return null;
    const L = data.labels;
    const m = new Uint8Array(data.n);
    let count = 0;
    const themeHit = L.themes.map(f), seedHit = L.seeds.map(f);
    for (let i = 0; i < data.n; i++) {
      if (themeHit[L.t[i]] || seedHit[L.d[i]]) { m[i] = 1; count++; }
    }
    return { m, count };
  }, [data, q]);

  const neighbours = useMemo(() => {
    if (!data || sel == null) return null;
    const out = [];
    for (let j = 0; j < data.k; j++) out.push({ i: data.nn[sel * data.k + j], d: data.nnd[sel * data.k + j] / data.head.scale });
    return out;
  }, [data, sel]);

  const label = (i) => {
    const L = data.labels;
    return { theme: L.themes[L.t[i]], seed: L.seeds[L.d[i]], verdict: L.verdicts[L.v[i]], band: L.segments[L.s[i]] };
  };

  // Projection to screen. Returns [sx, sy, depth] into scratch arrays.
  const project = (w, h, out) => {
    const { X, Y, Z, is3d } = coords;
    const n = data.n;
    const z = zoomRef.current;
    const pad = 22;
    const half = Math.min(w, h) / 2 - pad;
    const cx = w / 2, cy = h / 2;
    if (!is3d) {
      for (let i = 0; i < n; i++) { out.sx[i] = cx + X[i] * half * z; out.sy[i] = cy - Y[i] * half * z; out.dz[i] = 0; }
      return;
    }
    const { ry, rx } = rot.current;
    const cy1 = Math.cos(ry), sy1 = Math.sin(ry), cx1 = Math.cos(rx), sx1 = Math.sin(rx);
    const f = 2.6;
    for (let i = 0; i < n; i++) {
      // yaw about Y, then pitch about X
      const x1 = X[i] * cy1 + Z[i] * sy1;
      const z1 = -X[i] * sy1 + Z[i] * cy1;
      const y2 = Y[i] * cx1 - z1 * sx1;
      const z2 = Y[i] * sx1 + z1 * cx1;
      const p = f / (f - z2);
      out.sx[i] = cx + x1 * p * half * z * 0.9;
      out.sy[i] = cy - y2 * p * half * z * 0.9;
      out.dz[i] = z2;
    }
  };

  const scratch = useRef(null);

  const draw = (light = false) => {
    const cv = canvas.current, st = stage.current;
    if (!cv || !st || !data || !coords) return;
    const w = st.clientWidth, h = Math.max(300, Math.round(w * 0.78));
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    if (cv.width !== Math.round(w * dpr) || cv.height !== Math.round(h * dpr)) {
      cv.width = Math.round(w * dpr); cv.height = Math.round(h * dpr); cv.style.height = h + "px";
    }
    const ctx = cv.getContext("2d");
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, w, h);
    const cs = getComputedStyle(root.current);
    const col = C.vars.map((v) => cs.getPropertyValue(v).trim());
    const fg = cs.getPropertyValue("--fg").trim() || "#111";
    const muted = cs.getPropertyValue("--muted").trim() || "rgba(0,0,0,.56)";
    const line = cs.getPropertyValue("--fc-line").trim() || "rgba(0,0,0,.08)";
    const n = data.n;
    if (!scratch.current || scratch.current.sx.length !== n) {
      scratch.current = { sx: new Float32Array(n), sy: new Float32Array(n), dz: new Float32Array(n) };
    }
    const S = scratch.current;
    project(w, h, S);

    // axes for the 2D views; a faint cube edge for 3D
    ctx.strokeStyle = line; ctx.lineWidth = 1;
    if (!coords.is3d) {
      ctx.beginPath(); ctx.moveTo(0, h / 2); ctx.lineTo(w, h / 2); ctx.moveTo(w / 2, 0); ctx.lineTo(w / 2, h); ctx.stroke();
    }

    const dim = only != null || matches;
    const focus = (i) => (only == null || series[i] === only) && (!matches || matches.m[i]);
    const r0 = w < 480 ? 1.1 : 1.4;
    for (let pass = 0; pass < (dim ? 2 : 1); pass++) {
      for (let i = 0; i < n; i++) {
        const inF = focus(i);
        if (dim && ((pass === 0) === inF)) continue;
        const r = coords.is3d ? r0 * (1 + S.dz[i] * 0.45) : r0;
        ctx.fillStyle = inF ? col[series[i]] : muted;
        ctx.globalAlpha = inF ? (matches ? 0.8 : 0.55) : 0.06;
        ctx.beginPath(); ctx.arc(S.sx[i], S.sy[i], r, 0, 6.2832); ctx.fill();
      }
    }
    ctx.globalAlpha = 1;

    // selection: lines to neighbours, neighbour rings, a label
    if (sel != null && neighbours) {
      ctx.strokeStyle = fg; ctx.globalAlpha = 0.45; ctx.lineWidth = 1;
      ctx.beginPath();
      for (const nb of neighbours) { ctx.moveTo(S.sx[sel], S.sy[sel]); ctx.lineTo(S.sx[nb.i], S.sy[nb.i]); }
      ctx.stroke();
      ctx.globalAlpha = 1;
      for (const nb of neighbours) {
        ctx.fillStyle = col[series[nb.i]]; ctx.strokeStyle = cs.getPropertyValue("--bg").trim() || "#fff"; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.arc(S.sx[nb.i], S.sy[nb.i], 4, 0, 6.2832); ctx.fill(); ctx.stroke();
      }
      ctx.fillStyle = col[series[sel]]; ctx.strokeStyle = fg; ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.arc(S.sx[sel], S.sy[sel], 5.5, 0, 6.2832); ctx.fill(); ctx.stroke();
      const lb = label(sel);
      ctx.font = "500 11px ui-sans-serif, system-ui, sans-serif"; ctx.textAlign = "left"; ctx.fillStyle = fg;
      const tx = Math.min(S.sx[sel] + 9, w - 140), ty = Math.max(12, S.sy[sel] - 8);
      ctx.fillText(lb.theme, tx, ty);
    }

    // axis words
    ctx.fillStyle = muted; ctx.font = "11px ui-sans-serif, system-ui, sans-serif";
    ctx.textAlign = "right";
    if (view === "custom") {
      ctx.fillText("more like Ship →", w - 10, h - 8);
      ctx.textAlign = "left"; ctx.fillText("← more like Pull", 10, h - 8);
      ctx.save(); ctx.translate(12, 12); ctx.rotate(-Math.PI / 2); ctx.textAlign = "right"; ctx.fillText("more like Tail →", 0, 0); ctx.restore();
    } else if (view === "pca") {
      ctx.fillText("PC1 food-ness · PC2 body-ness · PC3", w - 10, h - 8);
    } else {
      ctx.fillText("t-SNE, perplexity 30, distances not to scale", w - 10, h - 8);
    }

    if (!light) {
      const cell = 10, cols = Math.ceil(w / cell), rows = Math.ceil(h / cell);
      const grid = new Array(cols * rows);
      for (let i = 0; i < n; i++) {
        if (dim && !focus(i)) continue;
        const gi = Math.floor(S.sy[i] / cell) * cols + Math.floor(S.sx[i] / cell);
        if (gi >= 0 && gi < grid.length) (grid[gi] || (grid[gi] = [])).push(i);
      }
      index.current = { grid, cols, rows, cell, w, h };
    }
  };

  // redraw on state; spin loop for 3D
  useEffect(() => {
    draw();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, coords, colour, only, matches, sel, neighbours, zoomTick]);

  useEffect(() => {
    if (!coords || !coords.is3d || !spin) return;
    let last = performance.now();
    const tick = (t) => {
      rot.current.ry += ((t - last) / 1000) * 0.18; last = t;
      draw(true);
      raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
    return () => { cancelAnimationFrame(raf.current); draw(); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [coords, spin, colour, only, matches, sel]);

  useEffect(() => {
    const st = stage.current; if (!st) return;
    const ro = new ResizeObserver(() => draw());
    ro.observe(st);
    const mo = new MutationObserver(() => draw());
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ["class", "data-theme"] });
    return () => { ro.disconnect(); mo.disconnect(); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, coords]);

  const nearest = (mx, my, radius = 8) => {
    const ix = index.current; const S = scratch.current;
    if (!ix || !S) return -1;
    const cx = Math.floor(mx / ix.cell), cy = Math.floor(my / ix.cell);
    let best = -1, bd = radius * radius;
    for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
      const gx = cx + dx, gy = cy + dy;
      if (gx < 0 || gy < 0 || gx >= ix.cols || gy >= ix.rows) continue;
      const b = ix.grid[gy * ix.cols + gx]; if (!b) continue;
      for (const i of b) { const d = (S.sx[i] - mx) ** 2 + (S.sy[i] - my) ** 2; if (d < bd) { bd = d; best = i; } }
    }
    return best;
  };

  const onPointerDown = (e) => {
    const r = canvas.current.getBoundingClientRect();
    drag.current = { x: e.clientX, y: e.clientY, moved: false, sx: e.clientX - r.left, sy: e.clientY - r.top };
    canvas.current.setPointerCapture?.(e.pointerId);
  };
  const onPointerMove = (e) => {
    const r = canvas.current.getBoundingClientRect();
    const mx = e.clientX - r.left, my = e.clientY - r.top;
    if (drag.current) {
      const dx = e.clientX - drag.current.x, dy = e.clientY - drag.current.y;
      if (Math.abs(dx) + Math.abs(dy) > 3) drag.current.moved = true;
      if (drag.current.moved && coords?.is3d) {
        rot.current.ry += dx * 0.008; rot.current.rx = Math.max(-1.4, Math.min(1.4, rot.current.rx + dy * 0.008));
        drag.current.x = e.clientX; drag.current.y = e.clientY;
        if (spin) setSpin(false);
        draw(true);
        if (hover) setHover(null);
      }
      return;
    }
    if (spin && coords?.is3d) return;
    const i = nearest(mx, my);
    if (i < 0) { if (hover) setHover(null); return; }
    if (!hover || hover.i !== i) setHover({ i, px: scratch.current.sx[i], py: scratch.current.sy[i] });
  };
  const onPointerUp = (e) => {
    const d = drag.current; drag.current = null;
    if (!d) return;
    if (d.moved) { draw(); return; }
    if (spin && coords?.is3d) { setSpin(false); draw(); }
    const i = nearest(d.sx, d.sy, 10);
    if (i >= 0) setSel(i === sel ? null : i);
    else setSel(null);
  };

  const zoom = (f) => { zoomRef.current = Math.max(0.5, Math.min(6, zoomRef.current * f)); setZoomTick((t) => t + 1); };

  const loadings = useMemo(() => {
    if (!data) return null;
    const H = data.head;
    return [0, 1, 2].map((k) => {
      const L = H.loadings[k].map((v, i) => [H.features[i], v]).sort((a, b) => Math.abs(b[1]) - Math.abs(a[1])).slice(0, 4);
      return { k, var: H.variance[k], top: L };
    });
  }, [data]);

  const tip = hover && data ? label(hover.i) : null;
  const selLabel = sel != null && data ? label(sel) : null;

  return (
    <figure className="xn xc xj" ref={root}>
      <div className="xn__tabs" role="tablist" aria-label="Projection">
        {VIEWS.map((v) => (
          <button key={v.k} role="tab" aria-selected={view === v.k} className="xn__tab"
            onClick={() => { setView(v.k); setSel(null); setHover(null); zoomRef.current = 1; }}>{v.t}</button>
        ))}
      </div>
      <p className="xv__head">{VIEWS.find((v) => v.k === view).h}</p>
      <div className="xv__panel">
        <p className="xv__claim">
          The same <b>{fmt(40866)}</b> rows, with the projector's moves, in the 49 features that are not the verdict itself.
          Click any point for its six nearest neighbours in that space. Search a theme or a seed. Asked directly, the space
          separates Pull from everything else (AUC <b>0.95</b>) and Ship from Review barely at all (AUC <b>0.56</b>).
        </p>
        <div className="xj__bar">
          <label className="xj__search">
            <span className="xv__sr">Search themes and seeds</span>
            <input type="search" value={q} placeholder="Search themes and seeds, regex ok" spellCheck={false}
              onChange={(e) => setQ(e.target.value)} />
            {matches && <span className="xj__count">{fmt(matches.count)} match{matches.count === 1 ? "" : "es"}</span>}
          </label>
          <div className="xj__tools">
            <span className="xj__lab">Colour by</span>
            {COLOUR.map((c) => (
              <button key={c.k} type="button" className="xj__btn" aria-pressed={colour === c.k}
                onClick={() => { setColour(c.k); setOnly(null); }}>{c.t}</button>
            ))}
            {coords?.is3d && (
              <button type="button" className="xj__btn" aria-pressed={spin} onClick={() => setSpin((s) => !s)}>spin</button>
            )}
            <button type="button" className="xj__btn" onClick={() => zoom(1.35)} aria-label="Zoom in">+</button>
            <button type="button" className="xj__btn" onClick={() => zoom(1 / 1.35)} aria-label="Zoom out">−</button>
          </div>
        </div>
        <div className="xc__stage xj__stage" ref={stage}>
          <canvas ref={canvas} className="xc__canvas" role="img"
            aria-label="Embedding projector of 40,866 sampled theme rows in 49 features: PCA in three dimensions, t-SNE, or two custom axes"
            onPointerDown={onPointerDown} onPointerMove={onPointerMove} onPointerUp={onPointerUp}
            onPointerLeave={() => { setHover(null); }} />
          {tip && (
            <>
              <i className="xc__ring" style={{ left: hover.px, top: hover.py, background: `var(${C.vars[series[hover.i]]})` }} />
              <div className="xc__tip" style={{ left: hover.px, top: hover.py }} role="status">
                <b>{tip.theme}</b><span>{tip.seed}</span><span className="xc__tipmeta">{tip.verdict} · {tip.band}</span>
              </div>
            </>
          )}
          {!data && !err && <p className="xc__loading">Loading the projector</p>}
          {err && <p className="xc__loading">The projector data did not load.</p>}
        </div>
        <div className="xc__legend" role="group" aria-label="Series">
          {C.names.map((name, i) => (
            <button key={name} type="button" className="xc__chip" aria-pressed={only === i}
              data-off={only != null && only !== i ? "1" : "0"} onClick={() => setOnly(only === i ? null : i)}>
              <i className="xc__dot" style={{ background: `var(${C.vars[i]})` }} />
              {name}{counts ? <span className="xc__n">{fmt(counts[i])}</span> : null}
            </button>
          ))}
          {only != null && <span className="xc__hint">Click again to show all</span>}
        </div>
        {selLabel && neighbours && (
          <div className="xj__sel" aria-live="polite">
            <p className="xj__selhead">
              <b>{selLabel.theme}</b> <span>{selLabel.seed} · {selLabel.verdict} · {selLabel.band}</span>
              <button type="button" className="xj__btn xj__close" onClick={() => setSel(null)} aria-label="Clear selection">×</button>
            </p>
            <table className="xj__nn">
              <caption className="xv__sr">Six nearest neighbours in the 49-feature space</caption>
              <thead><tr><th scope="col">Nearest in 49-d</th><th scope="col">Seed</th><th scope="col">Verdict</th><th scope="col">Distance</th></tr></thead>
              <tbody>
                {neighbours.map((nb) => { const l = label(nb.i); return (
                  <tr key={nb.i} onClick={() => setSel(nb.i)} tabIndex={0} onKeyDown={(e) => { if (e.key === "Enter") setSel(nb.i); }}>
                    <th scope="row"><i className="xc__dot" style={{ background: `var(${C.vars[series[nb.i]]})` }} />{l.theme}</th>
                    <td>{l.seed}</td><td>{l.verdict}</td><td>{nb.d.toFixed(2)}</td>
                  </tr>
                ); })}
              </tbody>
            </table>
            <p className="xj__note">Distance is Euclidean in the standardised fingerprint, so 0 means built identically. Click a row to walk.</p>
          </div>
        )}
        <p className="xv__foot">
          {data ? <>The three components carry {Math.round(data.head.variance.slice(0, 3).reduce((a, b) => a + b) * 100)}% of the variance, the first ten {Math.round(data.head.variance10 * 100)}%. </> : null}
          t-SNE keeps neighbourhoods and throws away global distance, so read it for clusters, never for gaps. Neighbours are computed in the full 49-feature space, not on this screen.
          A Pull's neighbours are Pull 58 times in 100, against a base rate of 2, because the pull rules read a shape: sensitive tabs, adjacency, worlds spanned. Ship and Review sit on one threshold, and no direction in the space finds it.
        </p>
        {loadings && (
          <details className="xv__table">
            <summary>Table view: what each component is made of</summary>
            <table>
              <caption className="xv__sr">Top loadings per principal component</caption>
              <thead><tr><th scope="col">Component</th><th scope="col">Variance</th><th scope="col">Largest loadings</th></tr></thead>
              <tbody>
                {loadings.map((l) => (
                  <tr key={l.k}><th scope="row">PC{l.k + 1}</th><td>{(l.var * 100).toFixed(1)}%</td>
                    <td>{l.top.map(([f, v]) => `${f} ${v >= 0 ? "+" : ""}${v.toFixed(2)}`).join(", ")}</td></tr>
                ))}
              </tbody>
            </table>
          </details>
        )}
      </div>
    </figure>
  );
}
