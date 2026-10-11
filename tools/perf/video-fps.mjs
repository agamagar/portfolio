// Minimal repro: do playing <video>s cap rAF at 30 fps when something else moves? node video-fps.mjs [count] [fps]
import { chromium } from "playwright-core";
const b = await chromium.launch({ channel: "chrome", headless: !process.env.HEADED, args: ["--ignore-gpu-blocklist"] });
for (const n of (process.argv[2] || "0,1,6").split(",").map(Number)) {
  const p = await (await b.newContext({ viewport: { width: 1000, height: 700 } })).newPage();
  await p.route("**/away60.mp4", (r) => r.fulfill({ contentType: "video/mp4", path: "/tmp/perfruns/away60.mp4" }));
  await p.route("**/*.html", (r) => r.fulfill({ contentType: "text/html", body: `<body style="margin:0;background:#111"><div id=m style="position:absolute;left:0;top:0;width:60px;height:60px;background:#f60"></div>${Array.from({ length: n }, (_, i) => `<video muted loop autoplay playsinline src="${process.env.SRC || "/figures/marquee/away.mp4"}" style="position:absolute;left:${80 + i * 150}px;top:200px;width:140px"></video>`).join("")}</body>` }));
  await p.goto("http://127.0.0.1:4312/x.html"); await p.waitForTimeout(2000);
  const fps = await p.evaluate(() => new Promise((res) => { let c = 0; const t0 = performance.now(); const m = document.getElementById("m"); const f = (t) => { m.style.transform = `translateX(${(t / 4) % 900}px)`; c++; if (t - t0 > 4000) res(c / ((t - t0) / 1000)); else requestAnimationFrame(f); }; requestAnimationFrame(f); }));
  console.log(n, "videos:", fps.toFixed(1), "fps"); await p.context().close();
}
await b.close();
