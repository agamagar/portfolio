// mv840zms / mv844xem QA: at 1440, 1920, 1024 and 390 in light and dark, asserts the corner nav's outer
// edges sit within 1px of the work grid (.wg__grid) and the room pill's enter button is a >= 44px square.
// Usage: node tools/qa-home-chrome.mjs [screenshot-dir]   (needs `npx vite --port 5173` running)
import { chromium } from "playwright";
const out = process.argv[2];
const b = await chromium.launch();
let fail = 0;
for (const scheme of ["light", "dark"]) for (const [w,h] of [[1440,900],[1920,1080],[1024,768],[390,844]]) {
  const p = await b.newPage({ viewport: { width: w, height: h }, colorScheme: scheme, deviceScaleFactor: w < 500 ? 2 : 1 });
  await p.goto(`http://localhost:5173/?theme=${scheme}`, { waitUntil: "load" }); await p.waitForTimeout(1500); (0);
  await p.waitForSelector('.hello[data-stage="reveal"]', { timeout: 90000 }).catch(() => console.log("  (never revealed)"));
  await p.waitForSelector('.wg__card img', { timeout: 30000 }).catch(() => {});
  await p.waitForTimeout(3000);
  await p.waitForTimeout(800);
  const r = await p.evaluate(() => {
    const R = (e) => e.getBoundingClientRect();
    const grid = R(document.querySelector(".wg__grid"));
    const eye = R(document.querySelector(".view-menu__btn"));
    const btns = [...document.querySelectorAll(".top-controls > button, .top-controls > a, .top-controls > * > button")].filter(e => e.offsetWidth && !e.closest(".view-menu"));
    const right = Math.max(...btns.map(e => R(e).right));
    const pill = document.querySelector(".wscene-warm-pill");
    if (!pill) return { grid: [grid.left, grid.right], eyeLeft: eye.left, navRight: right, sizes: {}, text: "(no room pill at this width)" };
    const btn = pill.querySelector(".wscene-warm-pill__btn");
    const sizes = {};
    for (const st of ["ready", "entering"]) {
      pill.dataset.state = st; btn.style.transition = "none"; void btn.offsetWidth;
      const bb = R(btn); sizes[st] = [bb.width, bb.height, R(pill).height];
    }
    pill.dataset.state = "ready"; btn.style.transition = "";
    // headless never warms the room: show the ready look as the page would (labels swap)
    const labels = pill.querySelectorAll(".wscene-warm-pill__label");
    labels[0].removeAttribute("data-on"); labels[1].setAttribute("data-on", "");
    pill.style.animation = "none";
    return { grid: [grid.left, grid.right], eyeLeft: eye.left, navRight: right, pillState: pill.dataset.state, sizes, text: pill.innerText.trim() };
  });
  const okL = Math.abs(r.eyeLeft - r.grid[0]) <= 1, okR = Math.abs(r.navRight - r.grid[1]) <= 1;
  const okSq = Object.values(r.sizes).every(([a, b2]) => Math.abs(a - b2) < 0.01 && a >= 44);
  if (!(okL && okR && okSq)) fail++;
  console.log(`${scheme} ${w}x${h} grid ${r.grid.map(n=>n.toFixed(1))} eyeL ${r.eyeLeft.toFixed(1)} navR ${r.navRight.toFixed(1)} btn ${JSON.stringify(r.sizes)} ${okL&&okR&&okSq?"PASS":"FAIL"} | "${r.text}"`);
  if (out) {
    await p.waitForTimeout(700);
    await p.screenshot({ path: `${out}/${scheme}-${w}.png` });
    if (await p.$(".wscene-warm-pill")) {
    const bb = await p.evaluate(() => { const r = document.querySelector(".wscene-warm-pill").getBoundingClientRect(); return { x: r.left, y: r.top, width: r.width, height: r.height }; });
    await p.screenshot({ path: `${out}/pill-${scheme}-${w}.png`, clip: { x: bb.x - 16, y: Math.max(0, bb.y - 12), width: bb.width + 32, height: bb.height + 24 } }); }
  }
  await p.close();
}
await b.close();
console.log(fail ? `${fail} FAIL` : "ALL PASS");
