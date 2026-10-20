import { useEffect, useMemo, useRef, useState } from "react";
import "./scheduled.css";
import "./schedReachMap.css";
import MAP from "./indiranagarMap.json"; // OSM extract, built by tools/osm-indiranagar.mjs

// Reach explorer (5 Oct 2026), after the Morphocode Explorer reference Agam
// pinned: a data panel on the left, a city on the right, and a dashed circle
// you drag across it while the numbers recount live.
//
// What it shows is the mechanism the whole case turns on: whether a cart gets
// INSTANT, SCHEDULE ONLY or NOTHING is decided by how far the address sits from
// an open dark store, and by the clock. At 11 PM two of the three stores stop
// taking instant orders, so their neighbourhoods flip to schedule-only.
//
// mv588qrj (12 Oct): the base is now the real street map of Indiranagar,
// Bangalore, from OpenStreetMap (c) OpenStreetMap contributors, ODbL: roads, parks
// and water baked into indiranagarMap.json (no tile server, no key) and projected
// with Web Mercator, scaled so the map's units are true ground distance at the
// window's centre (KM units = 1 km). "Blocks" are 100 m squares of that map, kept
// where a street runs through them and not inside a park or water.
//
// HONESTY: the geography is real; the MODEL is not. The three store pins, the
// two reach radii and which stores close at 11 PM are made up. The report has no
// geography, so nothing here is presented as Zepto data, and the panel says so
// in its footnote. The stores sit at plausible spots, not real addresses.

const W = 640, H = 800; // map window in units; north is up
const KM = 150; // units per km of ground: the window is 4.3 x 5.3 km
const INSTANT_R = 1.6 * KM; // instant reach from an open store (daytime is mostly instant)
const SCHED_R = 3.2 * KM; // scheduled reach (the next-day run goes further)
const CELL = KM / 10; // a block is a 100 m square

// Web Mercator (EPSG:3857) metres, then to window units. Mercator stretches
// ground distance by 1 / cos(lat), so metres are scaled back by cos(centre lat):
// 1 km on the ground is KM units at the window's centre.
const R_EARTH = 6378137;
const merc = (lon, lat) => [R_EARTH * (lon * Math.PI) / 180, R_EARTH * Math.log(Math.tan(Math.PI / 4 + (lat * Math.PI) / 360))];
const [MX0, MY0] = merc(MAP.center[0], MAP.center[1]);
const GROUND = Math.cos((MAP.center[1] * Math.PI) / 180); // ground metres per Mercator metre here
const proj = (lon, lat) => { const [x, y] = merc(lon, lat); return [W / 2 + ((x - MX0) * GROUND * KM) / 1000, H / 2 - ((y - MY0) * GROUND * KM) / 1000]; };
const pathOf = (pts, close) => pts.map(([lo, la], i) => { const [x, y] = proj(lo, la); return (i ? "L" : "M") + x.toFixed(1) + " " + y.toFixed(1); }).join("") + (close ? "Z" : "");

// the three pins: unit positions on the map. Illustrative, not store addresses.
const STORES = [
  { id: "A", name: "Store A", x: 214, y: 268, nightOpen: false },
  { id: "B", name: "Store B", x: 446, y: 392, nightOpen: true },
  { id: "C", name: "Store C", x: 282, y: 556, nightOpen: false },
];
const KIND = [
  { key: "instant", label: "Instant", color: "var(--rex-mute)" },
  { key: "sched", label: "Schedule only", color: "var(--sdc-c2)" },
  { key: "none", label: "Nothing", color: "var(--rex-none)" },
];

// the real map as paths, once
const GEO = {
  parks: MAP.parks.map((g) => pathOf(g, true)),
  water: MAP.water.map((g) => pathOf(g, true)),
  drains: MAP.drains.map((g) => pathOf(g)),
  minor: MAP.roads.minor.map((r) => pathOf(r.p)).join(""),
  major: [1, 2, 3].map((c) => MAP.roads.major.filter((r) => r.c === c).map((r) => pathOf(r.p)).join("")),
  labels: MAP.labels.filter((l) => l.name === "100 Feet Road" || l.name === "CMH Road").map((l) => ({ ...l, xy: proj(l.lon, l.lat) })),
};

function inPoly(x, y, poly) { // ray casting, poly = [[x, y]...]
  let c = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const [xi, yi] = poly[i], [xj, yj] = poly[j];
    if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) c = !c;
  }
  return c;
}

// the blocks: 100 m squares kept where a street passes within 60 m and the
// centre is not inside a park or water
function buildCity() {
  const road = []; // road samples every ~10 m, hashed into cells for a quick nearest test
  const hash = new Map(), hs = CELL * 2;
  const add = (x, y) => { const k = Math.floor(x / hs) + "," + Math.floor(y / hs); (hash.get(k) || hash.set(k, []).get(k)).push([x, y]); };
  [...MAP.roads.major, ...MAP.roads.minor].forEach((r) => {
    const pts = r.p.map(([lo, la]) => proj(lo, la));
    for (let i = 1; i < pts.length; i++) {
      const [x1, y1] = pts[i - 1], [x2, y2] = pts[i], n = Math.max(1, Math.ceil(Math.hypot(x2 - x1, y2 - y1) / (KM / 100)));
      for (let t = 0; t <= n; t++) add(x1 + ((x2 - x1) * t) / n, y1 + ((y2 - y1) * t) / n);
    }
  });
  const near = (x, y, d) => {
    const gx = Math.floor(x / hs), gy = Math.floor(y / hs);
    for (let a = -1; a <= 1; a++) for (let b = -1; b <= 1; b++) for (const [px, py] of hash.get(gx + a + "," + (gy + b)) || []) if (Math.hypot(px - x, py - y) <= d) return true;
    return false;
  };
  const voids = [...MAP.parks, ...MAP.water].map((g) => g.map(([lo, la]) => proj(lo, la)));
  const blocks = [];
  for (let gy = CELL / 2; gy < H; gy += CELL) {
    for (let gx = CELL / 2; gx < W; gx += CELL) {
      if (!near(gx, gy, 0.06 * KM)) continue;
      if (voids.some((v) => inPoly(gx, gy, v))) continue;
      blocks.push({ k: blocks.length, x: gx, y: gy, w: CELL - 2.5, h: CELL - 2.5 });
    }
  }
  return blocks;
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
        <h4 className="rex__title">Delivery availability</h4>
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
            <button key={l} type="button" aria-pressed={night === v} onClick={() => { setTouched(true); setNight(v); }}>{l}</button>
          ))}
        </div>

        <section className="rex__sec">
          {/* mv589p9j (12 Oct, "make it simple"): one number, the one the case turns on. The waffle, the per-store bars and the second stat are gone; the same counts feed the map colours and this line. */}
          <p className="rex__big rex__mono rex__big--hl">{pct[1].toFixed(0)}%</p>
          <p className="rex__lbl">of the {inside.length} blocks in the circle can only schedule</p>
          <ul className="rex__legend rex__legend--min">
            {KIND.map((k, i) => (
              <li key={k.key}>
                <i style={{ background: k.color }} />
                <span>{k.label}</span>
                <span className="rex__mono">{pct[i].toFixed(0)}%</span>
              </li>
            ))}
          </ul>
        </section>

        <p className="rex__note">
          Illustrative model on a real map of Indiranagar, Bangalore: the streets are OpenStreetMap, but the three stores are placed for the demo, not real addresses, and instant reach is {INSTANT_R / KM} km, scheduled reach {SCHED_R / KM} km. A block is a 100 m square of the map. It shows how distance and the clock decide a cart's options. It is not Zepto data.
        </p>
      </aside>

      <div className="rex__map">
        <svg
          ref={svgRef}
          viewBox={`0 0 ${W} ${H}`}
          preserveAspectRatio="xMidYMid slice"
          role="img"
          aria-label={`A street map of Indiranagar, Bangalore, with three illustrative dark stores. Inside the circle, ${pct[0].toFixed(0)}% of blocks get instant delivery, ${pct[1].toFixed(0)}% can only schedule, ${pct[2].toFixed(0)}% get nothing. Drag the circle, or focus it and use the arrow keys.`}
          tabIndex={0}
          onPointerDown={onDown}
          onPointerMove={onMove}
          onPointerUp={onUp}
          onPointerCancel={onUp}
          onKeyDown={onKey}
        >
          <g className="rex__geo" aria-hidden="true">
            {GEO.parks.map((d, i) => <path key={"p" + i} d={d} className="rex__park" />)}
            {GEO.water.map((d, i) => <path key={"w" + i} d={d} className="rex__water" />)}
            {GEO.drains.map((d, i) => <path key={"d" + i} d={d} className="rex__drain" />)}
          </g>
          {tagged.map((b) => (
            <rect
              key={b.k}
              x={b.x - b.w / 2} y={b.y - b.h / 2} width={b.w} height={b.h}
              fill={fill(b)}
              data-in={dist(b, c) <= r ? "" : undefined}
              className="rex__block"
            />
          ))}
          <g className="rex__geo" aria-hidden="true">
            <path d={GEO.minor} className="rex__road rex__road--minor" />
            <path d={GEO.major[2]} className="rex__road rex__road--3" />
            <path d={GEO.major[1]} className="rex__road rex__road--2" />
            <path d={GEO.major[0]} className="rex__road rex__road--1" />
            {GEO.labels.map((l) => (
              <text key={l.name} x={l.xy[0]} y={l.xy[1]} transform={`rotate(${l.ang} ${l.xy[0]} ${l.xy[1]})`} className="rex__street" textAnchor="middle">{l.name}</text>
            ))}
          </g>
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
        <a className="rex__osm" href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">© OpenStreetMap contributors</a>
        <p className="rex__hint">{touched ? "Drag the circle, or its edge to resize" : "Drag the circle to explore"}</p>
      </div>
    </div>
  );
}
