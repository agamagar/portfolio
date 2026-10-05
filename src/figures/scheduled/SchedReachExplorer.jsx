import { useEffect, useMemo, useRef, useState } from "react";
import "./scheduled.css";

// Reach explorer (5 Oct 2026), after the Morphocode Explorer reference Agam
// pinned: a data panel on the left, a city on the right, and a dashed circle
// you drag across it while the numbers recount live.
//
// What it shows is the mechanism the whole case turns on: whether a cart gets
// INSTANT, SCHEDULE ONLY or NOTHING is decided by how far the address sits from
// an open dark store, and by the clock. At 11 PM two of the three stores stop
// taking instant orders, so their neighbourhoods flip to schedule-only.
//
// HONESTY: this is an illustrative MODEL. The blocks, the three stores and the
// two reach radii are made up (seeded, so it draws the same every time). The
// report has no geography, so nothing here is presented as Zepto data, and the
// panel says so in its footnote.

const W = 640, H = 800; // tall, so the map fills the panel's height (sliced to fit)
const KM = 80; // units per km in the model
const INSTANT_R = 1.6 * KM; // instant reach from an open store (daytime is mostly instant)
const SCHED_R = 3.2 * KM; // scheduled reach (the next-day run goes further)
const ANGLE = -29; // the grid's tilt, Manhattan-ish

const STORES = [
  { id: "A", name: "Store A", x: 214, y: 268, nightOpen: false },
  { id: "B", name: "Store B", x: 446, y: 392, nightOpen: true },
  { id: "C", name: "Store C", x: 282, y: 556, nightOpen: false },
];
const KIND = [
  { key: "instant", label: "Instant", color: "var(--sdc-c1)" },
  { key: "sched", label: "Schedule", color: "var(--sdc-c2)" },
  { key: "none", label: "Nothing", color: "var(--sdc-neutral)" },
];

// a tiny seeded PRNG so the city is identical on every render
function rng(seed) {
  let s = seed >>> 0;
  return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 2 ** 32);
}

function buildCity() {
  const r = rng(7);
  const rad = (ANGLE * Math.PI) / 180, cos = Math.cos(rad), sin = Math.sin(rad);
  const blocks = [];
  const bw = 30, bh = 17, gx = 6, gy = 6;
  for (let i = -22; i <= 22; i++) {
    for (let j = -26; j <= 26; j++) {
      if (r() < 0.07) continue; // parks and plazas
      const avenue = Math.floor(i / 4) * 6; // every fourth column, a wider avenue
      const lx = i * (bw + gx) + avenue, ly = j * (bh + gy);
      const cx = W / 2 + lx * cos - ly * sin, cy = H / 2 + lx * sin + ly * cos;
      if (cx < -20 || cx > W + 20 || cy < -20 || cy > H + 20) continue;
      if (cx < 70 - cy * 0.06) continue; // the river on the west edge
      if (cx > W - 120 && cy > H - 150 + (W - cx) * 0.9) continue; // the bay
      const split = r() < 0.18; // some blocks are two lots
      const h = split ? bh / 2 - 1 : bh;
      blocks.push({ cx, cy, w: bw, h, off: split ? -bh / 4 : 0 });
      if (split) blocks.push({ cx, cy, w: bw, h, off: bh / 4 });
    }
  }
  return blocks.map((b, k) => {
    // a split lot's centre sits a quarter-block either side, along the tilt
    const ox = -b.off * Math.sin(rad), oy = b.off * Math.cos(rad);
    return { ...b, k, x: b.cx + ox, y: b.cy + oy };
  });
}

const dist = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);

function classify(block, night) {
  let kind = "none", nearest = null, best = Infinity;
  for (const s of STORES) {
    const d = dist(block, s);
    if (d < best) { best = d; nearest = s.id; }
    const open = !night || s.nightOpen;
    if (open && d <= INSTANT_R) kind = "instant";
    else if (kind !== "instant" && d <= SCHED_R) kind = "sched";
  }
  return { kind, nearest };
}

// largest-remainder rounding, so the waffle always has exactly 100 dots
function toHundred(counts) {
  const total = counts.reduce((a, b) => a + b, 0) || 1;
  const raw = counts.map((c) => (c / total) * 100);
  const out = raw.map(Math.floor);
  let left = 100 - out.reduce((a, b) => a + b, 0);
  raw.map((v, i) => [v - Math.floor(v), i]).sort((a, b) => b[0] - a[0]).forEach(([, i]) => { if (left-- > 0) out[i] += 1; });
  return out;
}

export default function SchedReachExplorer() {
  const city = useMemo(buildCity, []);
  const [night, setNight] = useState(false);
  const [km, setKm] = useState(1.0);
  const [c, setC] = useState({ x: 320, y: 400 });
  const [touched, setTouched] = useState(false);
  const svgRef = useRef(null);
  const drag = useRef(null);
  const r = km * KM;

  const tagged = useMemo(() => city.map((b) => ({ ...b, ...classify(b, night) })), [city, night]);
  const inside = useMemo(() => tagged.filter((b) => dist(b, c) <= r), [tagged, c, r]);
  const counts = KIND.map((k) => inside.filter((b) => b.kind === k.key).length);
  const pct = counts.map((n) => (inside.length ? (n / inside.length) * 100 : 0));
  const dots = toHundred(counts);
  const byStore = STORES.map((s) => inside.filter((b) => b.nearest === s.id).length);
  const maxStore = Math.max(1, ...byStore);

  // the idle drift: until someone touches it, the circle wanders the city on a
  // slow loop, only while on screen, never under reduced motion
  useEffect(() => {
    if (touched) return undefined;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return undefined;
    const el = svgRef.current;
    let raf = 0, t0 = 0, on = false;
    const tick = (t) => {
      if (!t0) t0 = t;
      const s = (t - t0) / 1000;
      setC({ x: 320 + Math.sin(s * 0.23) * 150, y: 410 + Math.sin(s * 0.37 + 1) * 190 });
      raf = requestAnimationFrame(tick);
    };
    const io = new IntersectionObserver(([e]) => {
      on = e.isIntersecting;
      cancelAnimationFrame(raf);
      t0 = 0;
      if (on) raf = requestAnimationFrame(tick);
    }, { threshold: 0.2 });
    if (el) io.observe(el);
    return () => { cancelAnimationFrame(raf); io.disconnect(); };
  }, [touched]);

  const toSvg = (e) => {
    const pt = svgRef.current.createSVGPoint();
    pt.x = e.clientX; pt.y = e.clientY;
    return pt.matrixTransform(svgRef.current.getScreenCTM().inverse());
  };
  const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));
  const onDown = (e) => {
    setTouched(true);
    const p = toSvg(e);
    const onHandle = Math.abs(dist(p, { x: c.x - r, y: c.y })) < 16;
    drag.current = onHandle ? { mode: "r" } : { mode: "move", dx: dist(p, c) <= r ? c.x - p.x : 0, dy: dist(p, c) <= r ? c.y - p.y : 0 };
    if (!onHandle && dist(p, c) > r) setC({ x: p.x, y: p.y });
    e.currentTarget.setPointerCapture(e.pointerId);
  };
  const onMove = (e) => {
    if (!drag.current) return;
    const p = toSvg(e);
    if (drag.current.mode === "r") setKm(clamp(Math.round((Math.abs(c.x - p.x) / KM) * 20) / 20, 0.5, 2));
    else setC({ x: clamp(p.x + drag.current.dx, 0, W), y: clamp(p.y + drag.current.dy, 0, H) });
  };
  const onUp = () => { drag.current = null; };
  const onKey = (e) => {
    const step = e.shiftKey ? 30 : 10;
    const d = { ArrowLeft: [-step, 0], ArrowRight: [step, 0], ArrowUp: [0, -step], ArrowDown: [0, step] }[e.key];
    if (!d) return;
    e.preventDefault();
    setTouched(true);
    setC((p) => ({ x: clamp(p.x + d[0], 0, W), y: clamp(p.y + d[1], 0, H) }));
  };
  const fill = (b) => (dist(b, c) <= r ? KIND.find((k) => k.key === b.kind).color : "var(--rex-block)");

  return (
    <div className="rex">
      <aside className="rex__panel">
        <div className="rex__row rex__row--slider">
          <input
            type="range" min="0.5" max="2" step="0.05" value={km}
            onChange={(e) => { setTouched(true); setKm(+e.target.value); }}
            aria-label="Circle radius in kilometres"
          />
          <span className="rex__mono">{km.toFixed(2)} km</span>
        </div>
        <div className="rex__seg" role="group" aria-label="Time of day">
          {[[false, "2 PM"], [true, "11 PM"]].map(([v, l]) => (
            <button key={l} type="button" aria-pressed={night === v} onClick={() => setNight(v)}>{l}</button>
          ))}
        </div>

        <section className="rex__sec">
          <h4 className="rex__h">What the cart can offer</h4>
          <div className="rex__stats">
            <div><p className="rex__big rex__mono">{inside.length}</p><p className="rex__lbl">Blocks inside</p></div>
            <div><p className="rex__big rex__mono">{pct[0].toFixed(1)}%</p><p className="rex__lbl">Get instant</p></div>
          </div>
        </section>

        <section className="rex__sec">
          <h4 className="rex__h">Instant, schedule, or nothing</h4>
          <div className="rex__waffle-row">
            <div className="rex__waffle" aria-hidden>
              {KIND.flatMap((k, i) => Array.from({ length: dots[i] }, (_, n) => <i key={`${k.key}${n}`} style={{ background: k.color }} />))}
            </div>
            <ul className="rex__legend">
              {KIND.map((k, i) => (
                <li key={k.key}>
                  <i style={{ background: k.color }} />
                  <span className="rex__lead">{k.label}</span>
                  <span className="rex__mono">{pct[i].toFixed(1)}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section className="rex__sec">
          <h4 className="rex__h">Nearest dark store</h4>
          <p className="rex__sub">Blocks in the circle, by the store closest to them</p>
          <ul className="rex__bars">
            {STORES.map((s, i) => (
              <li key={s.id}>
                <span className="rex__mono rex__bar-l">
                  {s.name}{night && !s.nightOpen ? ", closed" : ""}
                </span>
                <span className="rex__mono">{byStore[i]}</span>
                <span className="rex__bar"><b style={{ width: `${(byStore[i] / maxStore) * 100}%` }} /></span>
              </li>
            ))}
          </ul>
        </section>

        <p className="rex__note">
          Illustrative model: made-up blocks and three stores, instant reach {INSTANT_R / KM} km, scheduled reach {SCHED_R / KM} km. It shows how distance and the clock decide a cart's options. It is not Zepto data.
        </p>
      </aside>

      <div className="rex__map">
        <svg
          ref={svgRef}
          viewBox={`0 0 ${W} ${H}`}
          preserveAspectRatio="xMidYMid slice"
          role="img"
          aria-label={`A city of blocks with three dark stores. Inside the circle, ${pct[0].toFixed(0)}% of blocks get instant delivery, ${pct[1].toFixed(0)}% can only schedule, ${pct[2].toFixed(0)}% get nothing. Drag the circle, or focus it and use the arrow keys.`}
          tabIndex={0}
          onPointerDown={onDown}
          onPointerMove={onMove}
          onPointerUp={onUp}
          onPointerCancel={onUp}
          onKeyDown={onKey}
        >
          {tagged.map((b) => (
            <rect
              key={b.k}
              x={b.x - b.w / 2} y={b.y - b.h / 2} width={b.w} height={b.h}
              transform={`rotate(${ANGLE} ${b.x} ${b.y})`}
              fill={fill(b)}
              className="rex__block"
            />
          ))}
          {STORES.map((s) => {
            const open = !night || s.nightOpen;
            return (
              <g key={s.id} className="rex__store" data-open={open}>
                <circle cx={s.x} cy={s.y} r="7" />
                <text x={s.x + 11} y={s.y + 4}>{s.name}{open ? "" : ", closed"}</text>
              </g>
            );
          })}
          <circle cx={c.x} cy={c.y} r={r} className="rex__ring" />
          <circle cx={c.x} cy={c.y} r="5" className="rex__dot" />
          <g className="rex__handle" transform={`translate(${c.x - r} ${c.y})`}>
            <circle r="12" />
            <path d="M-5 0H5M0 -5V5" />
          </g>
        </svg>
        <p className="rex__hint">{touched ? "Drag the circle, or its edge to resize" : "Drag the circle to explore"}</p>
      </div>
    </div>
  );
}
