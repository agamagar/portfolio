import { chromium } from "/Users/agamagarwal/portfolio/node_modules/playwright/index.mjs";
const b = await chromium.launch({ args: ["--use-angle=metal", "--enable-gpu", "--ignore-gpu-blocklist"] });
const p = await b.newPage();
p.on("console", (m) => console.log("page:", m.text()));
p.on("pageerror", (e) => console.log("ERR", e.message));
await p.goto("http://localhost:58731/?fit");
await p.waitForFunction(() => window.F, null, { timeout: 60000 });
const res = await p.evaluate(() => {
  const { F } = window; const { nelderMead } = window.fitPose;
  // x: yaw, pitch, s, th, tx, ty (the 2D start from the feature-only similarity fit)
  const f = (x) => F.score({ yaw: x[0], pitch: x[1] }, { s: x[2], th: x[3], tx: x[4], ty: x[5] });
  const x0 = [0, 0, 5.439, -0.16667, -255.76, -34.50];
  const t0 = performance.now();
  const base = F.score({ yaw: 0, pitch: 0 }, { s: x0[2], th: x0[3], tx: x0[4], ty: x0[5] }, true);
  let r = nelderMead(f, x0, [0.15, 0.1, 0.3, 0.05, 15, 15], 250);
  r = nelderMead(f, r.x, [0.05, 0.04, 0.1, 0.02, 5, 5], 250);
  const x = r.x;
  const best = F.score({ yaw: x[0], pitch: x[1] }, { s: x[2], th: x[3], tx: x[4], ty: x[5] }, true);
  return { base, best, x, ms: performance.now() - t0 };
});
console.log(JSON.stringify(res, null, 1));
await b.close();
