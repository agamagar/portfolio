// Bakes the Indiranagar base map for the reach explorer (src/figures/scheduled/SchedReachExplorer.jsx).
// Input: Overpass JSON ("out geom tags") saved from the public Overpass API, ODbL, (c) OpenStreetMap contributors:
//   node tools/osm-indiranagar.mjs <major.json> <minor.json> <green.json> > src/figures/scheduled/indiranagarMap.json
//     major = highway trunk|primary|secondary|tertiary over 12.953,77.619,13.004,77.662
//     minor = the same classes + residential|unclassified over the core 12.969,77.635,12.983,77.652
//     green = leisure park|garden, natural water, named waterways (drains, canals), and water relations
// Output is lon/lat rounded to 5 decimals (about 1 m), simplified to 4 m, so the runtime does the Mercator projection.
import fs from "node:fs";

const [major, minor, green] = process.argv.slice(2).map((p) => JSON.parse(fs.readFileSync(p, "utf8")).elements);
const LAT0 = 12.9784, LON0 = 77.6408; // the window's centre: Indiranagar
const KX = 111320 * Math.cos((LAT0 * Math.PI) / 180), KY = 110574; // metres per degree here, only for simplifying
const inWin = (g) => g.some((p) => Math.abs((p.lat - LAT0) * KY) < 2900 && Math.abs((p.lon - LON0) * KX) < 2400);

function dp(pts, tol) { // Douglas-Peucker in metres
  if (pts.length < 3) return pts;
  const m = pts.map((p) => [(p.lon - LON0) * KX, (p.lat - LAT0) * KY]);
  const keep = new Uint8Array(pts.length); keep[0] = keep[pts.length - 1] = 1;
  const stack = [[0, pts.length - 1]];
  while (stack.length) {
    const [a, b] = stack.pop(); let best = 0, bi = -1;
    for (let i = a + 1; i < b; i++) {
      const [x, y] = m[i], [x1, y1] = m[a], [x2, y2] = m[b];
      const dx = x2 - x1, dy = y2 - y1, L = dx * dx + dy * dy || 1;
      const t = Math.max(0, Math.min(1, ((x - x1) * dx + (y - y1) * dy) / L));
      const d = Math.hypot(x - (x1 + t * dx), y - (y1 + t * dy));
      if (d > best) { best = d; bi = i; }
    }
    if (best > tol) { keep[bi] = 1; stack.push([a, bi], [bi, b]); }
  }
  return pts.filter((_, i) => keep[i]);
}
const out = (g) => dp(g, 4).map((p) => [+p.lon.toFixed(5), +p.lat.toFixed(5)]);

const seen = new Set(), roads = { major: [], minor: [] };
const MAJOR = new Set(["motorway", "trunk", "primary", "secondary", "tertiary"]);
for (const e of [...major, ...minor]) {
  if (e.type !== "way" || seen.has(e.id) || !e.geometry || !inWin(e.geometry)) continue;
  seen.add(e.id);
  const cls = e.tags.highway;
  (MAJOR.has(cls) ? roads.major : roads.minor).push({ c: cls === "primary" || cls === "trunk" || cls === "motorway" ? 1 : cls === "secondary" ? 2 : 3, p: out(e.geometry) });
}

const parks = [], water = [], drains = [];
for (const e of green) {
  const t = e.tags || {};
  const shapes = e.type === "relation" ? (e.members || []).filter((m) => m.type === "way" && m.geometry && m.role === "outer").map((m) => m.geometry) : e.geometry ? [e.geometry] : [];
  for (const g of shapes) {
    if (!inWin(g)) continue;
    if (t.waterway) drains.push(out(g));
    else if (t.natural === "water") water.push(out(g));
    else if (g.length > 3) parks.push(out(g));
  }
}

// street names to print on the map: the longest way of each, labelled at its midpoint along the way
const WANT = { "100 Feet Road": "100 Feet Road", "Chinmaya Mission Hospital Road": "CMH Road", "12th Main Road": "12th Main", "80 Feet Road": "80 Feet Road", "Indiranagar Double Road": "Double Road" };
const labels = [];
for (const [full, short] of Object.entries(WANT)) {
  const ways = [...major, ...minor].filter((e) => e.type === "way" && e.tags?.name === full && e.geometry && inWin(e.geometry));
  if (!ways.length) continue;
  const len = (g) => g.reduce((s, p, i) => (i ? s + Math.hypot((p.lon - g[i - 1].lon) * KX, (p.lat - g[i - 1].lat) * KY) : 0), 0);
  const w = ways.sort((a, b) => len(b.geometry) - len(a.geometry))[0].geometry;
  const i = Math.floor(w.length / 2), a = w[Math.max(0, i - 1)], b = w[Math.min(w.length - 1, i + 1)];
  let ang = (Math.atan2(-(b.lat - a.lat) * KY, (b.lon - a.lon) * KX) * 180) / Math.PI;
  if (ang > 90) ang -= 180; if (ang < -90) ang += 180;
  labels.push({ name: short, lon: +w[i].lon.toFixed(5), lat: +w[i].lat.toFixed(5), ang: Math.round(ang) });
}
process.stdout.write(JSON.stringify({ center: [LON0, LAT0], roads, parks, water, drains, labels }));
