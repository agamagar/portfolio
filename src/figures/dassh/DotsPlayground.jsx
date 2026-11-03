// /dev/dots (dev server only): drag the boundary where the radiate dots start, per image, and save it to
// radiate-boundaries.json through the dev-only Vite endpoint. The canvas is the live DasshRadiate, so the dots follow the drag.
import { useCallback, useEffect, useRef, useState } from "react";
import { DasshRadiate, contours } from "./DasshRadiate";
import BOUNDARIES from "./radiate-boundaries.json";
import { RADIATE_IMAGES } from "./radiateImages";
import "./dasshOpening.css";
import "./dotsPlayground.css";

const clone = (v) => JSON.parse(JSON.stringify(v));
const clamp01 = (v) => Math.max(0, Math.min(1, v));

function simplify(pts, eps) {   // Douglas-Peucker on a closed ring, split at the two farthest points
  const dp = (a, lo, hi, out) => {
    let far = -1, dmax = 0;
    const [x0, y0] = a[lo], [x1, y1] = a[hi], dx = x1 - x0, dy = y1 - y0, L = Math.hypot(dx, dy) || 1e-9;
    for (let i = lo + 1; i < hi; i++) { const d = Math.abs((a[i][0] - x0) * dy - (a[i][1] - y0) * dx) / L; if (d > dmax) { dmax = d; far = i; } }
    if (dmax > eps) { dp(a, lo, far, out); out.push(a[far]); dp(a, far, hi, out); }
  };
  let j = 0, best = 0;
  pts.forEach((p, i) => { const d = Math.hypot(p[0] - pts[0][0], p[1] - pts[0][1]); if (d > best) { best = d; j = i; } });
  const a = [...pts.slice(0, j + 1)], b = [...pts.slice(j), pts[0]], out = [pts[0]];
  dp(a, 0, a.length - 1, out); out.push(pts[j]); dp(b, 0, b.length - 1, out);
  return out;
}

// Starting boundary: trace the PNG mask with marching squares, simplify to about 40 to 80 points in all.
function traceMask(src) {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const w = img.width, h = img.height, c = document.createElement("canvas");
      c.width = w; c.height = h;
      const g = c.getContext("2d", { willReadFrequently: true });
      g.drawImage(img, 0, 0);
      const px = g.getImageData(0, 0, w, h).data, D = new Float32Array(w * h);
      for (let i = 0; i < D.length; i++) D[i] = px[i * 4] > 128 ? 0 : 1;
      const rings = contours(D, w, h, 0.5).filter((l) => l.pts.length > 12).sort((a, b) => b.pts.length - a.pts.length).slice(0, 4);
      let eps = 0.4, polys = [];
      for (; eps < 20; eps *= 1.25) {
        polys = rings.map((l) => simplify(l.pts, eps).slice(0, -1));
        if (polys.reduce((n, p) => n + p.length, 0) <= 70) break;
      }
      resolve(polys.filter((p) => p.length >= 3).map((p) => p.map(([x, y]) => [+((x + 0.5) / w).toFixed(4), +((y + 0.5) / h).toFixed(4)])));
    };
    img.onerror = () => resolve([]);
    img.src = src;
  });
}

function nearestOnEdge(p, a, b) {   // in px space, returns { t, d }
  const dx = b[0] - a[0], dy = b[1] - a[1], l2 = dx * dx + dy * dy || 1e-9;
  const t = Math.max(0, Math.min(1, ((p[0] - a[0]) * dx + (p[1] - a[1]) * dy) / l2));
  return { t, d: Math.hypot(p[0] - a[0] - dx * t, p[1] - a[1] - dy * t) };
}

export default function DotsPlayground() {
  const [imageId, setImageId] = useState(RADIATE_IMAGES[0].id);
  const image = RADIATE_IMAGES.find((i) => i.id === imageId);
  const { W, H } = image.view;
  const [polygons, setPolygons] = useState([]);
  const [feather, setFeather] = useState(0);
  const [showImage, setShowImage] = useState(true);
  const [status, setStatus] = useState("");
  const [history, setHistory] = useState([]);
  const svgRef = useRef(null), drag = useRef(null), state = useRef({});
  state.current = { polygons, feather };

  const load = useCallback(async (img) => {
    const saved = BOUNDARIES[img.id];
    setHistory([]);
    if (saved) { setPolygons(clone(saved.polygons)); setFeather(saved.feather ?? 0); setStatus("Loaded the saved boundary"); return; }
    setStatus("Tracing the PNG mask");
    const traced = await traceMask(img.mask);
    setPolygons(traced); setFeather(0); setStatus(`Traced ${traced.reduce((n, p) => n + p.length, 0)} points from the PNG mask`);
  }, []);
  useEffect(() => { load(image); }, [image, load]);

  const snapshot = () => setHistory((h) => [...h.slice(-49), clone(state.current)]);
  const undo = () => setHistory((h) => {
    if (!h.length) return h;
    const last = h[h.length - 1]; setPolygons(last.polygons); setFeather(last.feather); return h.slice(0, -1);
  });
  const toPx = (e) => { const r = svgRef.current.getBoundingClientRect(); return [(e.clientX - r.left) / r.width, (e.clientY - r.top) / r.height]; };

  const begin = (e, d) => { e.preventDefault(); e.stopPropagation(); svgRef.current.setPointerCapture(e.pointerId); drag.current = { ...d, moved: false, start: toPx(e), orig: clone(state.current.polygons) }; };
  const onPointDown = (e, si, pi) => {
    if (e.altKey || e.button === 2) {
      e.preventDefault(); e.stopPropagation();
      if (polygons[si].length <= 3) { setStatus("A shape needs at least three points"); return; }
      snapshot(); setPolygons(polygons.map((p, i) => (i === si ? p.filter((_, k) => k !== pi) : p)));
      return;
    }
    snapshot(); begin(e, { type: "point", si, pi });
  };
  const onEdgeDown = (e, si, pi) => {
    if (e.altKey || e.button === 2) return;
    const [x, y] = toPx(e), poly = polygons[si], a = poly[pi], b = poly[(pi + 1) % poly.length];
    const { t } = nearestOnEdge([x * W, y * H], [a[0] * W, a[1] * H], [b[0] * W, b[1] * H]);
    snapshot();
    const next = clone(polygons);
    next[si].splice(pi + 1, 0, [clamp01(a[0] + (b[0] - a[0]) * t), clamp01(a[1] + (b[1] - a[1]) * t)]);
    setPolygons(next);
    begin(e, { type: "point", si, pi: pi + 1 });
    drag.current.orig = clone(next);
  };
  const onShapeDown = (e, si) => { if (e.altKey || e.button === 2) return; snapshot(); begin(e, { type: "shape", si }); };
  const onMove = (e) => {
    const d = drag.current; if (!d) return;
    const [x, y] = toPx(e), dx = x - d.start[0], dy = y - d.start[1];
    d.moved = true;
    const next = clone(d.orig);
    if (d.type === "point") next[d.si][d.pi] = [clamp01(d.orig[d.si][d.pi][0] + dx), clamp01(d.orig[d.si][d.pi][1] + dy)];
    else next[d.si] = d.orig[d.si].map(([px, py]) => [clamp01(px + dx), clamp01(py + dy)]);
    setPolygons(next);
  };
  const onUp = () => { drag.current = null; };

  const addShape = () => { snapshot(); setPolygons([...polygons, [[0.4, 0.4], [0.6, 0.4], [0.6, 0.6], [0.4, 0.6]]]); setStatus("Added a shape in the middle"); };
  const removeShape = (si) => { if (polygons.length < 2) return; snapshot(); setPolygons(polygons.filter((_, i) => i !== si)); };
  const round = (v) => +v.toFixed(4);
  const save = async () => {
    const entry = { polygons: polygons.map((p) => p.map(([x, y]) => [round(x), round(y)])), feather };
    try {
      const r = await fetch("/__dev/radiate-boundaries", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: image.id, entry }) });
      setStatus(r.ok ? `Saved ${image.id} at ${new Date().toLocaleTimeString()}` : `Save failed: ${await r.text()}`);
    } catch { setStatus("Save failed: dev server not reachable"); }
  };
  const total = polygons.reduce((n, p) => n + p.length, 0);

  return (
    <main className="dots">
      <header className="dots__bar">
        <label className="dots__field">Image
          <select value={imageId} onChange={(e) => setImageId(e.target.value)}>
            {RADIATE_IMAGES.map((i) => <option key={i.id} value={i.id}>{i.label}</option>)}
          </select>
        </label>
        <label className="dots__field">Feather {feather}
          <input type="range" min="0" max="12" step="0.5" value={feather} onChange={(e) => { setFeather(+e.target.value); }} onPointerDown={snapshot} />
        </label>
        <label className="dots__field dots__field--row"><input type="checkbox" checked={showImage} onChange={(e) => setShowImage(e.target.checked)} />Show image</label>
        <button type="button" onClick={addShape}>Add shape</button>
        <button type="button" onClick={undo} disabled={!history.length}>Undo</button>
        <button type="button" onClick={() => load(image)}>Reset</button>
        <button type="button" className="dots__save" onClick={save}>Save</button>
        <span className="dots__status" role="status">{status} · {polygons.length} shape{polygons.length === 1 ? "" : "s"}, {total} points</span>
      </header>
      <p className="dots__help">Drag a point to move it. Click an edge to add a point. Alt-click or right-click a point to delete it. Drag inside a shape to move it all.</p>
      <div className="dots__stage" style={{ aspectRatio: `${W} / ${H}`, width: `min(100%, ${W}px, calc((100vh - 120px) * ${W} / ${H}))` }}>
        {showImage && <img src={image.photo} alt="" draggable={false} />}
        <DasshRadiate mask={image.mask} boundary={{ polygons, feather }} view={image.view} />
        <svg ref={svgRef} viewBox={`0 0 ${W} ${H}`} onPointerMove={onMove} onPointerUp={onUp} onPointerCancel={onUp} onContextMenu={(e) => e.preventDefault()}>
          {polygons.map((poly, si) => (
            <g key={si}>
              <polygon className="dots__shape" points={poly.map(([x, y]) => `${x * W},${y * H}`).join(" ")} onPointerDown={(e) => onShapeDown(e, si)} />
              {poly.map((a, pi) => {
                const b = poly[(pi + 1) % poly.length];
                return <line key={`e${pi}`} className="dots__edge" x1={a[0] * W} y1={a[1] * H} x2={b[0] * W} y2={b[1] * H} onPointerDown={(e) => onEdgeDown(e, si, pi)} />;
              })}
              {poly.map(([x, y], pi) => <circle key={`p${pi}`} className="dots__pt" cx={x * W} cy={y * H} r="6" onPointerDown={(e) => onPointDown(e, si, pi)} />)}
              <text className="dots__tag" x={poly[0][0] * W + 10} y={poly[0][1] * H - 10} onClick={() => removeShape(si)}>{polygons.length > 1 ? `Shape ${si + 1} (click to remove)` : ""}</text>
            </g>
          ))}
        </svg>
      </div>
    </main>
  );
}
