import { useEffect, useMemo, useRef, useState } from "react";
import "./crosssell.css";

// Figure: the theme space as a point cloud. Every 25th of the 1,021,654 theme
// rows (40,866 points) from the third pull, each row's numeric fingerprint
// (tab count, domains and families spanned, sensitive/soft share, rules fired,
// hour targeting, evidence, domain mix of tabs and seed) standardised and
// projected onto its first two principal components. Built 2026-09-04 in
// Active - Zepto/Ads & Strategy/Cross-Sell/theme-review/ (combine.py writes
// the "Point cloud data" sheet of Cross_Sell_Review_ALL_SEGMENTS.xlsx; the
// page reads a compact copy at public/data/xs/pointcloud.json, fetched only
// when the figure scrolls into view: ~1 MB).
//
// What it says, per the workbook's read-me: the axes fell out of the data and
// are category-driven, not rule-driven (PC1 food-ness, PC2 body-ness), and
// the verdicts do NOT separate in that space. So quality problems sit across
// the whole catalogue, not in one aisle. Honest limits: PC1+PC2 carry 16% of
// the variance (10% and 6%); the banding is quantisation of integer-count
// features, not clusters.
//
// Data hygiene: the workbook's sheet carries the raw search term per point.
// It is deliberately NOT in the page's JSON (the case's own guardrail: free-
// text queries get screened before they appear anywhere). Theme names and
// seed L3 categories are catalogue labels and stay, in the hover only.
// !! Internal Zepto data, same open call as XsReview (no-internal-numbers
// rule, 2026-08-23; exception extended 2026-09-04). Settle before publish.
//
// Form (dataviz method): identity of 40k points -> scatter on canvas, colour
// as the only per-point channel, so the palette is the validated status
// triple / categorical quad in crosssell.css (.xc tokens), a legend is always
// present with counts, a table view carries the full-population counts, and
// hover gives a per-mark tooltip with a 2px surface ring on the hit point.

const DATA_URL = "/data/xs/pointcloud.json";
const fmt = (n) => n.toLocaleString("en-US");

// Full-population verdict split per band (theme-review/README.md, 4 Sep 2026).
const FULL = [
  ["Head", 18659, 6568, 11865, 226],
  ["Head of Tail", 851593, 337936, 497871, 15786],
  ["Torso", 8012, 5533, 2368, 111],
  ["Tail", 143390, 70228, 70398, 2764],
];
const TOTAL = [1021654, 420265, 582502, 18887];

const MODES = [
  { k: "v", t: "By verdict", key: "v", names: ["Ship", "Review", "Pull"], vars: ["--xc-v1", "--xc-v2", "--xc-v3"] },
  { k: "s", t: "By band", key: "s", names: ["Head", "Head of Tail", "Torso", "Tail"], vars: ["--xc-s1", "--xc-s2", "--xc-s3", "--xc-s4"] },
];

// Data bounds, padded. PC1 runs -4.2..5.5, PC2 -3.1..6.3.
const X0 = -4.6, X1 = 5.9, Y0 = -3.5, Y1 = 6.7;

function useCloudData(ref) {
  const [data, setData] = useState(null);
  const [err, setErr] = useState(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let cancelled = false;
    const load = () => {
      fetch(DATA_URL)
        .then((r) => (r.ok ? r.json() : Promise.reject(new Error(r.status))))
        .then((d) => { if (!cancelled) setData(d); })
        .catch((e) => { if (!cancelled) setErr(e); });
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

export default function XsCloud() {
  const root = useRef(null);
  const canvas = useRef(null);
  const stage = useRef(null);
  const { data, err } = useCloudData(root);
  const [mode, setMode] = useState("v");
  const [only, setOnly] = useState(null); // isolated series index, or null
  const [hover, setHover] = useState(null); // { i, px, py }
  const M = MODES.find((m) => m.k === mode);

  // Resolved colours from CSS custom properties (theme-aware, re-read on draw).
  const colours = () => {
    const cs = getComputedStyle(root.current);
    return M.vars.map((v) => cs.getPropertyValue(v).trim());
  };

  // Sample counts per series for the legend.
  const counts = useMemo(() => {
    if (!data) return null;
    const arr = data[M.key];
    const c = new Array(M.names.length).fill(0);
    for (let i = 0; i < arr.length; i++) c[arr[i]]++;
    return c;
  }, [data, M]);

  // Spatial index for hover: 10px cells in canvas CSS pixels.
  const index = useRef(null);

  // Draw.
  useEffect(() => {
    const cv = canvas.current;
    const st = stage.current;
    if (!cv || !st) return;
    const draw = () => {
      const w = st.clientWidth;
      const h = Math.round(w * 0.68);
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      cv.width = Math.round(w * dpr);
      cv.height = Math.round(h * dpr);
      cv.style.height = h + "px";
      const ctx = cv.getContext("2d");
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w, h);
      const cs = getComputedStyle(root.current);
      const ink = cs.getPropertyValue("--fg").trim() || "#111";
      const muted = cs.getPropertyValue("--muted").trim() || "rgba(0,0,0,.56)";
      const line = cs.getPropertyValue("--fc-line").trim() || "rgba(0,0,0,.08)";
      const pad = { l: 26, r: 10, t: 10, b: 26 };
      const X = (x) => pad.l + ((x - X0) / (X1 - X0)) * (w - pad.l - pad.r);
      const Y = (y) => h - pad.b - ((y - Y0) / (Y1 - Y0)) * (h - pad.t - pad.b);

      // recessive axes: the zero lines only
      ctx.strokeStyle = line; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(X(X0), Y(0)); ctx.lineTo(X(X1), Y(0)); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(X(0), Y(Y0)); ctx.lineTo(X(0), Y(Y1)); ctx.stroke();

      if (data) {
        const col = colours();
        const series = data[M.key];
        const xs = data.x, ys = data.y, sc = data.scale;
        const n = data.n;
        const r = w < 480 ? 1.2 : 1.5;
        const cell = 10;
        const cols = Math.ceil(w / cell), rows = Math.ceil(h / cell);
        const grid = new Array(cols * rows);
        // grey pass for the non-isolated series, colour pass for the rest
        const dim = only != null;
        for (let pass = 0; pass < (dim ? 2 : 1); pass++) {
          for (let i = 0; i < n; i++) {
            const s = series[i];
            const inFocus = !dim || s === only;
            if (dim && ((pass === 0) === inFocus)) continue;
            const px = X(xs[i] / sc), py = Y(ys[i] / sc);
            if (pass === (dim ? 1 : 0) || !dim) {
              const gi = Math.floor(py / cell) * cols + Math.floor(px / cell);
              (grid[gi] || (grid[gi] = [])).push(i);
            }
            ctx.fillStyle = inFocus ? col[s] : muted;
            ctx.globalAlpha = inFocus ? 0.55 : 0.08;
            ctx.beginPath(); ctx.arc(px, py, r, 0, 6.2832); ctx.fill();
          }
        }
        ctx.globalAlpha = 1;
        index.current = { grid, cols, rows, cell, X, Y, w, h };

        // the two regions the loadings name
        ctx.fillStyle = muted;
        ctx.font = "500 11px ui-sans-serif, system-ui, sans-serif";
        ctx.textAlign = "center";
        ctx.fillText("grocery arm", X(2.6), Y(1.9));
        ctx.fillText("personal-care lobe", X(-1.6), Y(5.8));
      }

      // axis words (the loadings, not the component numbers)
      ctx.fillStyle = muted;
      ctx.font = "11px ui-sans-serif, system-ui, sans-serif";
      ctx.textAlign = "right";
      ctx.fillText("more food, more dayparts →", w - pad.r, h - 8);
      ctx.textAlign = "left";
      ctx.fillText("← gear, stationery", pad.l, h - 8);
      ctx.save();
      ctx.translate(10, pad.t + 4); ctx.rotate(-Math.PI / 2);
      ctx.textAlign = "right";
      ctx.fillText("more personal care →", 0, 0);
      ctx.restore();
      ctx.fillStyle = ink;
    };
    draw();
    const ro = new ResizeObserver(draw);
    ro.observe(st);
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const onTheme = () => draw();
    mq.addEventListener?.("change", onTheme);
    const mo = new MutationObserver(onTheme);
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ["class", "data-theme"] });
    return () => { ro.disconnect(); mq.removeEventListener?.("change", onTheme); mo.disconnect(); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, mode, only]);

  // Hover: nearest point within 7px via the grid.
  const onMove = (e) => {
    const ix = index.current;
    if (!ix || !data) return;
    const r = canvas.current.getBoundingClientRect();
    const mx = e.clientX - r.left, my = e.clientY - r.top;
    const cx = Math.floor(mx / ix.cell), cy = Math.floor(my / ix.cell);
    let best = -1, bd = 49;
    const xs = data.x, ys = data.y, sc = data.scale;
    for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
      const gx = cx + dx, gy = cy + dy;
      if (gx < 0 || gy < 0 || gx >= ix.cols || gy >= ix.rows) continue;
      const b = ix.grid[gy * ix.cols + gx];
      if (!b) continue;
      for (const i of b) {
        const px = ix.X(xs[i] / sc), py = ix.Y(ys[i] / sc);
        const d = (px - mx) ** 2 + (py - my) ** 2;
        if (d < bd) { bd = d; best = i; }
      }
    }
    if (best < 0) { if (hover) setHover(null); return; }
    if (!hover || hover.i !== best) {
      setHover({ i: best, px: ix.X(xs[best] / sc), py: ix.Y(ys[best] / sc) });
    }
  };

  const tipText = (i) => {
    const v = data.verdicts[data.v[i]], s = data.segments[data.s[i]];
    return { theme: data.themes[data.t[i]], seed: data.seeds[data.d[i]], meta: `${v} · ${s}` };
  };

  return (
    <figure className="xn xc" ref={root}>
      <div className="xn__tabs" role="tablist" aria-label="Colour the theme space">
        {MODES.map((m) => (
          <button key={m.k} role="tab" aria-selected={mode === m.k} className="xn__tab"
            onClick={() => { setMode(m.k); setOnly(null); setHover(null); }}>{m.t}</button>
        ))}
      </div>
      <p className="xv__head">Ship, review and pull are interleaved everywhere. The map is a map of aisles.</p>
      <div className="xv__panel">
        <p className="xv__claim">
          <b>{fmt(40866)}</b> of the {fmt(1021654)} theme rows, every 25th, each placed by the shape of its
          fingerprint. The axes fell out of the data: food-ness across, body-ness up. No aisle is safe to ship unreviewed.
        </p>
        <div className="xc__stage" ref={stage}
          onMouseMove={onMove} onMouseLeave={() => setHover(null)}>
          <canvas ref={canvas} className="xc__canvas" role="img"
            aria-label="Scatter of 40,866 sampled theme rows on two principal components, coloured by verdict or by band" />
          {hover && data && (
            <>
              <i className="xc__ring" style={{ left: hover.px, top: hover.py, background: `var(${M.vars[data[M.key][hover.i]]})` }} />
              <div className="xc__tip" style={{ left: hover.px, top: hover.py }} role="status">
                <b>{tipText(hover.i).theme}</b>
                <span>{tipText(hover.i).seed}</span>
                <span className="xc__tipmeta">{tipText(hover.i).meta}</span>
              </div>
            </>
          )}
          {!data && !err && <p className="xc__loading">Loading {fmt(40866)} points</p>}
          {err && <p className="xc__loading">The point data did not load.</p>}
        </div>
        <div className="xc__legend" role="group" aria-label="Series">
          {M.names.map((name, i) => (
            <button key={name} type="button" className="xc__chip" aria-pressed={only === i}
              data-off={only != null && only !== i ? "1" : "0"}
              onClick={() => setOnly(only === i ? null : i)}>
              <i className="xc__dot" style={{ background: `var(${M.vars[i]})` }} />
              {name}{counts ? <span className="xc__n">{fmt(counts[i])}</span> : null}
            </button>
          ))}
          {only != null && <span className="xc__hint">Click again to show all</span>}
        </div>
        <p className="xv__foot">
          The two components carry 16% of the variance (10% and 6%), so distance here is suggestive, never conclusive.
          The stripes are quantisation, not clusters: most features are small integer counts. Hover any point for its theme and seed.
        </p>
        <details className="xv__table">
          <summary>Table view</summary>
          <table>
            <caption className="xv__sr">Verdict split per band, all 1,021,654 rows</caption>
            <thead><tr><th scope="col">Band</th><th scope="col">Rows</th><th scope="col">Ship</th><th scope="col">Review</th><th scope="col">Pull</th></tr></thead>
            <tbody>
              {FULL.map((r) => (
                <tr key={r[0]}><th scope="row">{r[0]}</th>{r.slice(1).map((c, j) => <td key={j}>{fmt(c)}</td>)}</tr>
              ))}
              <tr><th scope="row">All</th>{TOTAL.map((c, j) => <td key={j}>{fmt(c)}</td>)}</tr>
            </tbody>
          </table>
        </details>
      </div>
    </figure>
  );
}
