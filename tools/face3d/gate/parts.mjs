// parts.mjs: for every face, is every part built, visible, drawn and attached; and do chromium and webkit agree.
// usage: node parts.mjs [--base http://127.0.0.1:5218] [--browsers chromium,webkit] [--faces a,b]   writes <cache>/<face>/parts.json
import { chromium, webkit } from "playwright"; import fs from "node:fs"; import path from "node:path";
const arg = (n, d) => { const i = process.argv.indexOf("--" + n); return i < 0 ? d : process.argv[i + 1]; };
const base = arg("base", "http://127.0.0.1:5218"), only = arg("faces", null), cache = path.resolve(arg("cache", path.join(process.env.HOME, ".cache/face-gate/cache")));
const kinds = { chromium: () => chromium.launch({ args: ["--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--ignore-gpu-blocklist"] }), webkit: () => webkit.launch() };
const results = {};
for (const b of arg("browsers", "chromium,webkit").split(",")) {   // one browser at a time
  let browser; try { browser = await kinds[b](); } catch (e) { console.log(b, "unavailable:", e.message.split("\n")[0]); continue; }
  const page = await browser.newPage(); let faces = null;
  const load = async () => { await page.goto(base + "/tools/face3d/gate/parts.html", { timeout: 180000 }); await page.waitForFunction(() => window.PARTS_READY, null, { timeout: 120000 }); };
  const list = fs.readdirSync(cache).filter((d) => fs.existsSync(path.join(cache, d, "meta.json"))).map((d) => JSON.parse(fs.readFileSync(path.join(cache, d, "meta.json"), "utf8")));
  for (const m of list) { if (only && !only.split(",").includes(m.id)) continue;
    let r; for (let a = 0; a < 2 && !r; a++) { try { await load(); r = await page.evaluate(([s, p]) => window.P.inspect(s, p), [m.skin, m.preset]); if (r.ctxLost) { r = null; } } catch (e) { r = { error: e.message.split("\n")[0].slice(0, 200) }; if (a === 0) r = null; else break; } }
    (results[m.id] ||= {})[b] = r || { error: "context lost" }; console.log(b, m.id, r?.error || r?.problems?.length ? (r.error || r.problems.join("; ")) : "ok"); }
  await browser.close();
}
for (const [id, r] of Object.entries(results)) { const f = path.join(cache, id.replace(/[^\w.-]/g, "_"), "parts.json"); const old = fs.existsSync(f) ? JSON.parse(fs.readFileSync(f, "utf8")) : {}; fs.writeFileSync(f, JSON.stringify({ ...old, ...r })); }
