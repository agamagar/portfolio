import fs from "node:fs"; import path from "node:path";
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
const COL = { pass: "#2e9e5b", warn: "#e0a020", fail: "#d6403a", "n/a": "#888" };
export function writeReport(out, s) {
  const faces = Object.values(s.faces), checks = [...new Set(faces.flatMap((f) => Object.keys(f.checks)))];
  const fmt = (v) => typeof v !== "number" ? v : Math.abs(v) >= 100 ? v.toFixed(0) : v.toFixed(2);
  let h = `<!doctype html><meta charset=utf-8><title>Face gate</title><style>
body{font:13px/1.4 system-ui;margin:24px;background:#fafafa;color:#111}h1{font-size:20px}h2{font-size:15px;margin:28px 0 8px}
table{border-collapse:collapse}td,th{padding:4px 7px;border:1px solid #ddd;font-size:12px;text-align:left}th{background:#eee;position:sticky;top:0}
td.c{color:#fff;text-align:center;font-weight:600;min-width:46px}.pass{background:${COL.pass}}.warn{background:${COL.warn}}.fail{background:${COL.fail}}.na{background:${COL["n/a"]}}
a{color:inherit}.gal{display:flex;flex-wrap:wrap;gap:6px}.gal img{width:128px;border-radius:6px}.card{background:#fff;border:1px solid #ddd;border-radius:8px;padding:10px;margin:0 0 12px}
.row{display:flex;gap:6px;flex-wrap:wrap}.crop{border:2px solid ${COL.fail};border-radius:6px;max-width:260px}small{color:#666}</style>
<h1>Face production gate</h1><small>${esc(s.generated)} · ${faces.length} faces · ${s.fast ? "fast subset" : "full matrix"} · renders: production rig (faceRig3D), native 802x862, derived 256 / 83 px, light + dark ground</small>
<h2>Matrix</h2><table><tr><th>face</th><th>status</th>${checks.map((c) => `<th>${c}</th>`).join("")}</tr>`;
  for (const f of faces) { h += `<tr><td><a href="#${esc(f.dir)}">${esc(f.dir)}</a></td><td class="c ${f.status}">${f.status}</td>`;
    for (const c of checks) { const r = f.checks[c]; h += r ? `<td class="c ${r.status === "n/a" ? "na" : r.status}" title="${esc(r.note)}">${r.crop ? `<a href="${r.crop}">` : ""}${fmt(r.value)}${r.crop ? "</a>" : ""}</td>` : "<td></td>"; } h += "</tr>"; }
  h += "</table><h2>Faces</h2>";
  for (const f of faces) { h += `<div class=card id="${esc(f.dir)}"><b>${esc(f.dir)}</b> <span class="c ${f.status}" style="color:#fff;padding:1px 8px;border-radius:9px">${f.status}</span><div class=row>`;
    for (const c of ["rest_front", "rest_q3L", "rest_q3R", "blinkclosed_front", "emote_grin", "emote_surprised"]) for (const t of ["l", "d"]) { const p = `thumbs/${f.dir}__${c}__${t}.png`; if (fs.existsSync(path.join(out, p))) h += `<img src="${p}" title="${c}" loading=lazy>`; }
    h += `</div><table>`;
    for (const [c, r] of Object.entries(f.checks)) if (r.status !== "pass") h += `<tr><td>${c}</td><td class="c ${r.status === "n/a" ? "na" : r.status}">${fmt(r.value)}</td><td>${esc(r.unit)}</td><td>${esc(r.worst || "")}</td><td>${esc(r.note)}</td><td>${r.crop ? `<a href="${r.crop}"><img class=crop src="${r.crop}"></a>` : ""}</td></tr>`;
    h += "</table></div>"; }
  fs.writeFileSync(path.join(out, "index.html"), h);
}
